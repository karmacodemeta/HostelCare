'use server';

import connectDB from '@/lib/db';
import Hostel from '@/models/Hostel';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function updateHostelSettings(formData: FormData) {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        const name = formData.get('name') as string;
        const ownerName = formData.get('ownerName') as string;
        const address = formData.get('address') as string;
        const contactNumber = formData.get('contactNumber') as string;

        if (!name || !ownerName || !address || !contactNumber) {
            return { success: false, message: 'All fields are required' };
        }

        await connectDB();

        const oldHostel = await Hostel.findById(session.user.hostelId);
        if (!oldHostel) return { success: false, message: 'Hostel not found' };

        const updatedHostel = await Hostel.findByIdAndUpdate(
            session.user.hostelId,
            { name, ownerName, address, contactNumber },
            { new: true }
        );

        await logActivity(
            'HOSTEL_UPDATED',
            'System',
            session.user.hostelId as any,
            { name, ownerName, address, contactNumber }
        );

        revalidatePath('/settings');
        revalidatePath('/dashboard');

        return { success: true, message: 'Hostel settings updated successfully' };
    } catch (error: any) {
        console.error('Failed to update hostel settings:', error);
        return { success: false, message: error.message || 'Failed to update hostel settings' };
    }
}

export async function getHostelDetails() {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) return null;

        await connectDB();
        const hostel = await Hostel.findById(session.user.hostelId).lean();
        return hostel ? JSON.parse(JSON.stringify(hostel)) : null;
    } catch (error) {
        console.error('Failed to fetch hostel details:', error);
        return null;
    }
}
