import connectDB from '@/lib/db';
import Hostel from '@/models/Hostel';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { AddHostelDialog } from '@/components/super-admin/AddHostelDialog'; 
// We need to create AddHostelDialog. For now, let's just make the page verify data exists.

export const dynamic = 'force-dynamic';

async function getHostels() {
    await connectDB();
    return await Hostel.find().sort({ createdAt: -1 }).lean();
}

export default async function HostelsPage() {
    const hostels = await getHostels();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Hostels</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage all registered subscription hostels.</p>
                </div>
                <AddHostelDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {hostels.map((hostel: any) => (
                    <Card key={hostel._id.toString()} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{hostel.name}</h3>
                                <p className="text-sm text-zinc-500">{hostel.ownerName}</p>
                            </div>
                            <span className={hostel.subscriptionStatus === 'active' ? "px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium" : "px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"}>
                                {hostel.subscriptionStatus}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <p>📍 {hostel.address}</p>
                            <p>📞 {hostel.contactNumber}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
