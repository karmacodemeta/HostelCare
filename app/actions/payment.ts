'use server';

import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import Student from '@/models/Student';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function collectRent(payments: { studentId: string; amount: number; date: Date; paymentMethod?: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'online' }[]) {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        let totalCollected = 0;
        const paymentRecords = [];

        // Fetch student names AND branchIds for logging and saving
        const studentIds = payments.map(p => p.studentId);
        const students = await Student.find({ _id: { $in: studentIds } }).select('name branchId');
        const studentMap = new Map(students.map(s => [s._id.toString(), s]));

        for (const payment of payments) {
            const studentInfo = studentMap.get(payment.studentId);

            // 1. Create Payment Record
            const newPayment = await Payment.create({
                studentId: payment.studentId,
                hostelId: session.user.hostelId,
                branchId: studentInfo?.branchId, // Added
                amount: payment.amount,
                date: payment.date,
                type: 'rent',
                paymentMethod: payment.paymentMethod || 'cash'
            });

            paymentRecords.push(newPayment);
            totalCollected += payment.amount;

            // 2. Update Student Dues (Decrease by amount paid)
            await Student.updateOne(
                { _id: payment.studentId, hostelId: session.user.hostelId },
                { $inc: { dues: -payment.amount } }
            );
        }

        // 3. Log Activity (Batch Log)
        await logActivity(
            'RENT_COLLECTED',
            'Payment',
            paymentRecords[0]._id, // Linking to first payment as ref
            {
                count: payments.length,
                totalAmount: totalCollected,
                students: payments.map(p => ({
                    studentId: p.studentId,
                    name: studentMap.get(p.studentId)?.name || 'Unknown',
                    amount: p.amount
                }))
            }
        );

        revalidatePath('/students');
        revalidatePath('/dashboard');

        return { success: true, message: `Collected ₹${totalCollected} from ${payments.length} students` };
    } catch (error: any) {
        console.error('Rent Collection Error:', error);
        return { success: false, message: error.message || 'Failed to collect rent' };
    }
}

export async function payRentOnline(studentId: string, amount: number) {
    try {
        await connectDB();

        const student = await Student.findById(studentId);
        if (!student) return { success: false, message: 'Resident profile not found' };

        const newPayment = await Payment.create({
            studentId,
            hostelId: student.hostelId,
            branchId: student.branchId,
            amount,
            date: new Date(),
            type: 'rent',
            paymentMethod: 'online',
            description: 'Online Payment via Razorpay Gateway (Simulated)'
        });

        student.dues = Math.max(0, student.dues - amount);
        await student.save();

        await logActivity(
            'RENT_COLLECTED',
            'Payment',
            newPayment._id,
            { studentName: student.name, amount, method: 'online' }
        );

        revalidatePath('/dashboard');
        revalidatePath('/student/dashboard');
        revalidatePath('/students');

        return { success: true, message: `Payment of ₹${amount} cleared successfully via Razorpay!` };
    } catch (error: any) {
        console.error('Online Payment error:', error);
        return { success: false, message: error.message || 'Payment failed' };
    }
}
