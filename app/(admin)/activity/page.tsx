import connectDB from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import { Card } from '@/components/ui/card';
import { Activity, User, CreditCard, Building2, Info, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getAllActivities() {
    await connectDB();
    const session = await getSession();
    if (!session || !session.user?.hostelId) return [];

    // Fetch last 100 activities for the specific hostel
    return await ActivityLog.find({ hostelId: session.user.hostelId })
        .sort({ timestamp: -1 })
        .limit(100)
        .lean();
}

import { formatActivityMessage, getActivityIcon } from '@/lib/activity-helper';

// Removed local getIcon function

export default async function ActivityPage() {
    const activities = await getAllActivities();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Activity History</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Comprehensive log of all system actions.</p>
            </div>

            <Card className="overflow-hidden">
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {activities.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">No activity logs found.</div>
                    ) : (
                        activities.map((activity: any) => (
                            <div key={activity._id.toString()} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors flex items-start gap-4">
                                <div className="mt-1 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0">
                                    {getActivityIcon(activity.entityType)}
                                </div>
                                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-3">
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            {formatActivityMessage(activity)}
                                        </p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            {/* Optional: Add extra details if needed, but safe string now */}
                                            {activity.details?.description && typeof activity.details.description === 'string' ? activity.details.description : ''} 
                                        </p>
                                        {activity.performedBy && (
                                            <p className="text-xs text-zinc-400 mt-1">
                                                By: {activity.performedBy}
                                            </p>
                                        )}
                                    </div>
                                    <div className="md:col-span-1 flex items-center gap-2 text-zinc-500 text-sm md:justify-end">
                                        <Calendar className="w-4 h-4" />
                                        <span>{format(new Date(activity.timestamp), 'PP p')}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
