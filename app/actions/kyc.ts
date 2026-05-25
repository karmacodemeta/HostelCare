'use server';

import connectDB from '@/lib/db';
import Student from '@/models/Student';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function verifyStudentKYC(
    studentId: string,
    status: 'verified' | 'rejected',
    rejectionReason?: string
) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized Warden credentials.' };
        }

        await connectDB();

        const student = await Student.findOne({ _id: studentId, hostelId: session.user.hostelId });
        if (!student) return { success: false, message: 'Student profile not found.' };

        student.kycStatus = status;
        if (student.kycDetails) {
            student.kycDetails.rejectionReason = rejectionReason || '';
        }
        await student.save();

        await logActivity(
            'SYSTEM',
            'System',
            student._id,
            { action: `KYC ${status.toUpperCase()}`, studentName: student.name, reason: rejectionReason }
        );

        revalidatePath(`/students/${studentId}`);
        revalidatePath('/kyc');
        revalidatePath('/student/dashboard');

        return { success: true, message: `KYC application has been successfully ${status}!` };
    } catch (error: any) {
        console.error('KYC Verify Error:', error);
        return { success: false, message: error.message || 'Failed to update KYC status.' };
    }
}

export async function getSubmittedKYCList() {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) return [];

        await connectDB();

        const students = await Student.find({
            hostelId: session.user.hostelId,
            kycStatus: { $in: ['submitted', 'verified', 'rejected'] }
        }).sort({ updatedAt: -1 }).populate('branchId').lean();

        return JSON.parse(JSON.stringify(students));
    } catch (error) {
        console.error('Failed to load KYC lists:', error);
        return [];
    }
}
