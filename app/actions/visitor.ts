'use server';

import connectDB from '@/lib/db';
import VisitorLog from '@/models/VisitorLog';
import Student from '@/models/Student';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function logVisitorCheckIn(
    studentId: string,
    name: string,
    relation: string,
    contactNumber: string,
    purpose: string
) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        if (!studentId || !name || !relation || !contactNumber || !purpose) {
            return { success: false, message: 'All visitor fields are required.' };
        }

        await connectDB();

        const student = await Student.findOne({ _id: studentId, hostelId: session.user.hostelId });
        if (!student) {
            return { success: false, message: 'Student profile not found.' };
        }

        const newLog = await VisitorLog.create({
            studentId,
            hostelId: student.hostelId,
            branchId: student.branchId,
            name,
            relation,
            contactNumber,
            purpose,
            checkIn: new Date()
        });

        await logActivity(
            'STUDENT_UPDATED',
            'Student',
            studentId,
            { action: 'Visitor Checked In', visitorName: name, relation }
        );

        revalidatePath(`/students/${studentId}`);

        return { success: true, message: `Successfully checked in visitor ${name}!`, log: JSON.parse(JSON.stringify(newLog)) };
    } catch (error: any) {
        console.error('Visitor Check-In Error:', error);
        return { success: false, message: error.message || 'Failed to record check-in.' };
    }
}

export async function logVisitorCheckOut(logId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        const log = await VisitorLog.findOne({ _id: logId, hostelId: session.user.hostelId });
        if (!log) {
            return { success: false, message: 'Visitor entry record not found.' };
        }

        log.checkOut = new Date();
        await log.save();

        await logActivity(
            'STUDENT_UPDATED',
            'Student',
            log.studentId.toString(),
            { action: 'Visitor Checked Out', visitorName: log.name }
        );

        revalidatePath(`/students/${log.studentId}`);

        return { success: true, message: `Visitor ${log.name} checked out successfully.` };
    } catch (error: any) {
        console.error('Visitor Check-Out Error:', error);
        return { success: false, message: error.message || 'Failed to record check-out.' };
    }
}

export async function getVisitorLogs(studentId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) return [];

        await connectDB();

        const logs = await VisitorLog.find({ studentId, hostelId: session.user.hostelId })
            .sort({ checkIn: -1 })
            .lean();

        return JSON.parse(JSON.stringify(logs));
    } catch (error) {
        console.error('Failed to retrieve visitor logs:', error);
        return [];
    }
}
