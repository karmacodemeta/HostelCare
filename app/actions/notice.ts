'use server';

import connectDB from '@/lib/db';
import Notice from '@/models/Notice';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function getNotices(branchId?: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) return [];

        await connectDB();

        const mongoose = require('mongoose');
        const hostelIdObj = new mongoose.Types.ObjectId(session.user.hostelId);
        const isValidObjectId = (id?: string) => id && id.match(/^[0-9a-fA-F]{24}$/);

        const filter: any = { hostelId: hostelIdObj, isActive: true };
        if (isValidObjectId(branchId)) {
            filter.branchId = new mongoose.Types.ObjectId(branchId);
        }

        const notices = await Notice.find(filter)
            .populate('branchId')
            .sort({ createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(notices));
    } catch (error) {
        console.error('Failed to fetch notices:', error);
        return [];
    }
}

export async function createNotice(
    title: string,
    content: string,
    audience: 'all' | 'staff' | 'student',
    branchId?: string
) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        if (!title || !content) {
            return { success: false, message: 'Title and content are required' };
        }

        await connectDB();

        const mongoose = require('mongoose');
        const hostelIdObj = new mongoose.Types.ObjectId(session.user.hostelId);
        const isValidObjectId = (id?: string) => id && id.match(/^[0-9a-fA-F]{24}$/);

        const newNotice = await Notice.create({
            hostelId: hostelIdObj,
            branchId: isValidObjectId(branchId) ? new mongoose.Types.ObjectId(branchId) : undefined,
            title,
            content,
            audience,
            isActive: true
        });

        await logActivity(
            'SYSTEM',
            'System',
            newNotice._id,
            { action: 'Notice Created', title, audience }
        );

        revalidatePath('/notices');
        return { success: true, message: 'Notice posted successfully' };
    } catch (error: any) {
        console.error('Failed to create notice:', error);
        return { success: false, message: error.message || 'Failed to post notice' };
    }
}

export async function deleteNotice(id: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        const deletedNotice = await Notice.findOneAndUpdate(
            { _id: id, hostelId: session.user.hostelId },
            { isActive: false },
            { new: true }
        );

        if (!deletedNotice) return { success: false, message: 'Notice not found' };

        await logActivity(
            'SYSTEM',
            'System',
            id,
            { action: 'Notice Deleted', title: deletedNotice.title }
        );

        revalidatePath('/notices');
        return { success: true, message: 'Notice deleted successfully' };
    } catch (error: any) {
        console.error('Failed to delete notice:', error);
        return { success: false, message: error.message || 'Failed to delete notice' };
    }
}
