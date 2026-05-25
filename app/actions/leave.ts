'use server';

import connectDB from '@/lib/db';
import Leave from '@/models/Leave';
import Student from '@/models/Student';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function applyForLeave(startDateStr: string, endDateStr: string, reason: string) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'student') {
            return { success: false, message: 'Unauthorized. Resident credentials required.' };
        }

        if (!startDateStr || !endDateStr || !reason) {
            return { success: false, message: 'Start date, end date, and reason are required.' };
        }

        await connectDB();

        // Find active student mapping
        const student = await Student.findOne({ userId: session.user.id });
        if (!student) {
            return { success: false, message: 'Resident profile not found for this account.' };
        }

        const newLeave = await Leave.create({
            studentId: student._id,
            hostelId: student.hostelId,
            branchId: student.branchId,
            startDate: new Date(startDateStr),
            endDate: new Date(endDateStr),
            reason,
            status: 'pending'
        });

        await logActivity(
            'STUDENT_UPDATED',
            'Student',
            student._id,
            { action: 'Applied for Leave', leaveId: newLeave._id, reason }
        );

        revalidatePath('/student/dashboard');
        revalidatePath('/leaves');

        return { success: true, message: 'Leave application submitted successfully for Warden review!' };
    } catch (error: any) {
        console.error('Leave Application Error:', error);
        return { success: false, message: error.message || 'Failed to submit leave application.' };
    }
}

export async function getStudentLeaves(studentId?: string) {
    try {
        const session = await getSession();
        if (!session) return [];

        await connectDB();

        let finalStudentId = studentId;

        if (!finalStudentId) {
            const student = await Student.findOne({ userId: session.user.id });
            if (!student) return [];
            finalStudentId = student._id.toString();
        }

        const leaves = await Leave.find({ studentId: finalStudentId })
            .sort({ createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(leaves));
    } catch (error) {
        console.error('Failed to get student leaves:', error);
        return [];
    }
}

export async function getAllLeaves(branchId?: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) return [];

        await connectDB();

        const mongoose = require('mongoose');
        const hostelIdObj = new mongoose.Types.ObjectId(session.user.hostelId);
        const filter: any = { hostelId: hostelIdObj };

        const isValidObjectId = (id?: string) => id && id.match(/^[0-9a-fA-F]{24}$/);
        if (isValidObjectId(branchId)) {
            filter.branchId = new mongoose.Types.ObjectId(branchId);
        }

        const leaves = await Leave.find(filter)
            .populate({
                path: 'studentId',
                select: 'name roomNo contactNumber'
            })
            .populate('branchId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(leaves));
    } catch (error) {
        console.error('Failed to fetch all leaves:', error);
        return [];
    }
}

export async function updateLeaveStatus(leaveId: string, status: 'approved' | 'rejected') {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        const leave = await Leave.findOne({ _id: leaveId, hostelId: session.user.hostelId }).populate('studentId');
        if (!leave) {
            return { success: false, message: 'Leave request not found' };
        }

        leave.status = status;
        leave.approvedBy = session.user.name || 'Warden';
        await leave.save();

        await logActivity(
            'SYSTEM',
            'System',
            leave._id,
            { action: `Leave Request ${status.toUpperCase()}`, studentName: (leave.studentId as any)?.name }
        );

        revalidatePath('/leaves');
        revalidatePath('/student/dashboard');

        return { success: true, message: `Successfully ${status} leave request!` };
    } catch (error: any) {
        console.error('Failed to update leave status:', error);
        return { success: false, message: error.message || 'Failed to update leave.' };
    }
}
