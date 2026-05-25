'use server';

import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import Student from '@/models/Student';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function getComplaints(branchId?: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) return [];

        await connectDB();

        const mongoose = require('mongoose');
        const hostelIdObj = new mongoose.Types.ObjectId(session.user.hostelId);
        const isValidObjectId = (id?: string) => id && id.match(/^[0-9a-fA-F]{24}$/);

        const filter: any = { hostelId: hostelIdObj };
        if (isValidObjectId(branchId)) {
            filter.branchId = new mongoose.Types.ObjectId(branchId);
        }

        const complaints = await Complaint.find(filter)
            .populate({
                path: 'studentId',
                select: 'name roomNo contactNumber'
            })
            .populate('branchId')
            .sort({ createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(complaints));
    } catch (error) {
        console.error('Failed to get complaints:', error);
        return [];
    }
}

export async function updateComplaintStatus(
    complaintId: string, 
    status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        const updates: any = { status };
        if (status === 'resolved') {
            updates.resolvedAt = new Date();
        } else {
            updates.$unset = { resolvedAt: 1 };
        }

        const updatedComplaint = await Complaint.findOneAndUpdate(
            { _id: complaintId, hostelId: session.user.hostelId },
            updates,
            { new: true }
        ).populate('studentId');

        if (!updatedComplaint) return { success: false, message: 'Ticket not found' };

        await logActivity(
            'SYSTEM',
            'System',
            complaintId,
            { action: 'Complaint Status Updated', status, student: (updatedComplaint.studentId as any)?.name }
        );

        revalidatePath('/complaints');
        return { success: true, message: `Ticket status updated to ${status.replace('_', ' ')}` };
    } catch (error: any) {
        console.error('Failed to update complaint status:', error);
        return { success: false, message: error.message || 'Failed to update ticket' };
    }
}

export async function createComplaint(
    title: string,
    description: string,
    category: 'room' | 'plumbing' | 'electrical' | 'food' | 'cleaning' | 'other',
    severity: 'low' | 'medium' | 'high',
    studentId?: string
) {
    try {
        const session = await getSession();
        if (!session) return { success: false, message: 'Unauthorized' };

        await connectDB();

        let sId = studentId;
        let hostelId = session.user.hostelId;
        let branchId;

        // If a student is logged in, find their details
        if (session.user.role === 'student') {
            const studentRecord = await Student.findOne({ userId: session.user.id });
            if (studentRecord) {
                sId = studentRecord._id.toString();
                hostelId = studentRecord.hostelId?.toString();
                branchId = studentRecord.branchId?.toString();
            }
        } else {
            // Admin logging a complaint on behalf of a student
            if (sId) {
                const studentRecord = await Student.findById(sId);
                if (studentRecord) {
                    hostelId = studentRecord.hostelId?.toString();
                    branchId = studentRecord.branchId?.toString();
                }
            }
        }

        if (!sId || !hostelId) {
            return { success: false, message: 'Resident account details not found' };
        }

        const newComplaint = await Complaint.create({
            studentId: sId,
            hostelId,
            branchId,
            title,
            description,
            category,
            severity,
            status: 'pending'
        });

        await logActivity(
            'Student',
            'Student',
            sId,
            { action: 'Complaint Registered', title, category }
        );

        revalidatePath('/complaints');
        return { success: true, message: 'Complaint ticket created successfully' };
    } catch (error: any) {
        console.error('Failed to create complaint:', error);
        return { success: false, message: error.message || 'Failed to file ticket' };
    }
}
