import { Card } from '@/components/ui/card';
import connectDB from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import { Activity, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

import { getSession } from '@/lib/auth';
import { formatActivityMessage, getActivityIcon } from '@/lib/activity-helper';

async function getActivities() {
    const session = await getSession();
    if (!session || !session.user?.hostelId) return [];

    await connectDB();
    // Fetch last 5 activities for this hostel
    return await ActivityLog.find({ hostelId: session.user.hostelId })
        .sort({ timestamp: -1 })
        .limit(5)
        .lean();
}

export default async function ActivityFeed() {
    const activities = await getActivities();

    return (
        <Card className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-zinc-500" />
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Recent Activity</h3>
                </div>
                <Link href="/activity" className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            
            <div className="flex-1 space-y-4">
                {activities.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-4">No recent activity</p>
                ) : (
                    activities.map((activity: any) => (
                        <div key={activity._id.toString()} className="flex gap-3 items-start group">
                            <div className="mt-1 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                                {getActivityIcon(activity.entityType)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate capitalize">
                                    {formatActivityMessage(activity)}
                                </p>
                                <p className="text-xs text-zinc-500 truncate">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
