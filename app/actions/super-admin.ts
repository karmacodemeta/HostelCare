'use server';

import connectDB from '@/lib/db';
import Hostel from '@/models/Hostel';
import User from '@/models/User';
import ExpenseCategory from '@/models/ExpenseCategory';
import { revalidatePath } from 'next/cache';

export async function createHostel(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const contactNumber = formData.get('contactNumber') as string;
    const ownerName = formData.get('ownerName') as string;
    const ownerEmail = formData.get('ownerEmail') as string;
    const ownerPassword = formData.get('ownerPassword') as string; // Ideally handle securely

    if (!name || !ownerName || !ownerEmail || !ownerPassword) {
        return { success: false, message: 'All fields are required' };
    }

    try {
        await connectDB();

        // 1. Create Hostel
        const newHostel = new Hostel({
            name,
            address,
            contactNumber,
            ownerName,
        });
        await newHostel.save();

        // 2. Create Hostel Admin User
        const newUser = new User({
            name: ownerName,
            email: ownerEmail,
            password: ownerPassword,
            role: 'hostel_admin',
            hostelId: newHostel._id,
        });
        await newUser.save();

        // 3. Seed Default Expense Categories
        const defaults = ['Staff', 'Food', 'Electricity', 'Repair', 'Misc'];
        await Promise.all(defaults.map(name =>
            ExpenseCategory.create({
                name,
                isDefault: true,
                hostelId: newHostel._id
            })
        ));

        revalidatePath('/super-admin/hostels');
        return { success: true, message: 'Hostel and Owner created successfully' };
    } catch (error: any) {
        console.error('Create Hostel Error:', error);
        return { success: false, message: error.message || 'Failed to create hostel' };
    }
}
