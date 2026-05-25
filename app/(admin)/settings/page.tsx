import { getHostelDetails } from '@/app/actions/hostel';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HostelSettingsForm from '@/components/settings/HostelSettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || !session.user.hostelId) redirect('/login');

  const hostel = await getHostelDetails();
  if (!hostel) redirect('/dashboard');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Manage hostel profile and account tier configurations.</p>
      </div>

      <HostelSettingsForm hostel={hostel} />
    </div>
  );
}
