import connectDB from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import mongoose from 'mongoose';

type EntityType = 'Student' | 'Expense' | 'Branch' | 'System' | 'Payment';

import { getSession } from '@/lib/auth';

export async function logActivity(
    action: string,
    entityType: EntityType,
    entityId?: string | mongoose.Types.ObjectId,
    details?: any,
    performedBy: string = 'Admin'
) {
    try {
        // Ensure DB connection (though usually already connected in server actions)
        await connectDB();

        const session = await getSession();
        const hostelId = session?.user?.hostelId;

        await ActivityLog.create({
            action,
            entityType,
            entityId,
            details,
            performedBy,
            hostelId, // Save the hostelId
            timestamp: new Date(),
        });
    } catch (error) {
        // Fail silently to not block the main action, but log to console
        console.error('Failed to log activity:', error);
    }
}
