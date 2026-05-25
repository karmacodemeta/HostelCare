import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getComplaints } from '@/app/actions/complaint';
import ComplaintListClient from '@/components/complaints/ComplaintListClient';

export const dynamic = 'force-dynamic';

export default async function ComplaintsPage({ searchParams }: { searchParams: Promise<{ branch?: string }> }) {
  const session = await getSession();
  if (!session || !session.user.hostelId) redirect('/login');

  const { branch } = await searchParams;
  const complaints = await getComplaints(branch);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Maintenance Tickets</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Monitor, categorize, and resolve facility and resident complaints.</p>
      </div>

      {/* Interactive List Client Component */}
      <ComplaintListClient initialComplaints={complaints} />
    </div>
  );
}
