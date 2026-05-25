'use server';

import connectDB from '@/lib/db';
import Student from '@/models/Student';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function generateMonthlyDues() {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();
        const hostelId = session.user.hostelId;

        // Fetch all students
        const students = await Student.find({ hostelId });
        const now = new Date();
        let updatedCount = 0;

        // 30 days in milliseconds
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

        for (const student of students) {
            // Determine the "anchoring" date. 
            // Ideally use lastRentDate. If missing (legacy), fallback to admissionDate.
            let lastDate = student.lastRentDate ? new Date(student.lastRentDate) : new Date(student.admissionDate);

            // If even admissionDate is invalid (shouldn't happen), skip or default to now
            if (isNaN(lastDate.getTime())) lastDate = new Date();

            const diffTime = now.getTime() - lastDate.getTime();

            // Check if 30 days have passed
            if (diffTime >= THIRTY_DAYS_MS) {
                // Calculate how many months have passed (could be multiple if script wasn't run for a while)
                // For safety, let's just add ONE month at a time to avoid shock, or add ALL due months?
                // User requirement: "Has 30 days passed? If yes... add rent". 
                // Let's stick to adding ONE month's rent and advancing the date by 30 days. 
                // This allows the user to click again if they want to catch up multiple months, or we can loop here.
                // Looping is better automation.

                const monthsPending = Math.floor(diffTime / THIRTY_DAYS_MS);

                if (monthsPending > 0) {
                    const rentToAdd = monthsPending * student.rent;

                    // Update Student
                    student.dues += rentToAdd;

                    // Advance information:
                    // newLastRentDate = oldLastRentDate + (months * 30 days)
                    const tempDate = new Date(lastDate.getTime() + (monthsPending * THIRTY_DAYS_MS));
                    student.lastRentDate = tempDate;

                    await student.save();
                    updatedCount++;

                    await logActivity(
                        'RENT_DUE_GENERATED',
                        'Student',
                        student._id,
                        {
                            amountAdded: rentToAdd,
                            months: monthsPending,
                            newDues: student.dues
                        }
                    );
                }
            }
        }

        revalidatePath('/dashboard');
        revalidatePath('/students');

        return {
            success: true,
            message: updatedCount > 0
                ? `Updated rent dues for ${updatedCount} students.`
                : 'Monthly billing cycle is up-to-date.'
        };

    } catch (error) {
        console.error('Failed to generate monthly dues:', error);
        return { success: false, message: 'Failed to generate dues.' };
    }
}
