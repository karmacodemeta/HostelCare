'use server';

import connectDB from '@/lib/db';
import User from '@/models/User';
import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
    const email = (formData.get('email') as string).trim();
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
    }

    let redirectTo = '/dashboard';

    try {
        await connectDB();
        const user = await User.findOne({ email });

        console.log('Login Attempt:', email);
        console.log('User Found:', !!user);
        let isMatch = false;
        if (user) {
            console.log('Role:', user.role);
            isMatch = await user.comparePassword(password);
            console.log('Password Match:', isMatch);
        }

        if (!user || !isMatch) {
            return { success: false, message: 'Invalid credentials' };
        }

        if (user.role === 'super_admin') {
            redirectTo = '/super-admin/hostels';
        } else if (user.role === 'student') {
            // Future student view
            redirectTo = '/student/dashboard';
        }

        // Create session
        await login({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            hostelId: user.hostelId?.toString(),
            name: user.name
        });

    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Internal server error' };
    }

    redirect(redirectTo);
}
