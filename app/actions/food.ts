'use server';

import connectDB from '@/lib/db';
import MessMenu from '@/models/MessMenu';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function getMenu(branchId?: string) {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) return null;

        await connectDB();

        // Filter logic:
        // If branchId is provided, look for it.
        // If not found, look for Global (branchId: null/undefined)

        let query: any = { hostelId: session.user.hostelId };

        // Priority 1: Argument
        // Priority 2: Cookie
        let effectiveBranchId = branchId;
        if (!effectiveBranchId) {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const cookieBranch = cookieStore.get('hostel_active_branch');
            if (cookieBranch) effectiveBranchId = cookieBranch.value;
        }

        if (effectiveBranchId && effectiveBranchId !== 'global') {
            query.branchId = effectiveBranchId;
        } else {
            // Match explicit null OR missing field
            query.$or = [{ branchId: null }, { branchId: { $exists: false } }];
        }

        let menu = await MessMenu.findOne(query).lean();

        // If specific branch menu not found, try fetching Global fallback
        if (!menu && branchId && branchId !== 'global') {
            menu = await MessMenu.findOne({
                hostelId: session.user.hostelId,
                $or: [{ branchId: null }, { branchId: { $exists: false } }]
            }).lean();
        }

        if (!menu) return null;

        return JSON.parse(JSON.stringify(menu));
    } catch (error) {
        console.error('Failed to get menu:', error);
        return null;
    }
}

export async function updateMenu(branchId: string, day: string, meals: any) {
    try {
        const session = await getSession();
        if (!session || !session.user?.hostelId) return { success: false, message: 'Unauthorized' };

        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const lowerDay = day.toLowerCase();

        if (!validDays.includes(lowerDay)) {
            return { success: false, message: 'Invalid day' };
        }

        await connectDB();

        // Prepare query for Upsert
        const filter: any = { hostelId: session.user.hostelId };
        if (branchId && branchId !== 'global') {
            filter.branchId = branchId;
        } else {
            // For global, we use slightly careful query to ensure we match the global doc
            filter.$or = [{ branchId: null }, { branchId: { $exists: false } }];
        }

        const updatedMenu = await MessMenu.findOneAndUpdate(
            filter,
            {
                $set: {
                    [lowerDay]: meals,
                    updatedBy: session.user.name,
                    // Ensure branchId is set correctly on insert
                    ...(branchId && branchId !== 'global' ? { branchId } : { branchId: null })
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await logActivity(
            'MENU_UPDATED',
            'System',
            updatedMenu._id,
            {
                day: day,
                branchId: branchId || 'Global',
                meals: meals
            }
        );

        revalidatePath('/food');
        return { success: true, message: 'Menu updated' };
    } catch (error: any) {
        console.error('Failed to update menu:', error);
        return { success: false, message: error.message || 'Failed to update' };
    }
}
