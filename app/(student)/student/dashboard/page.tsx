import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getStudentDashboardData } from '@/app/actions/student';
import StudentDashboardClient from './StudentDashboardClient';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'student') redirect('/login');

  const data = await getStudentDashboardData();
  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-zinc-50 dark:bg-zinc-950">
        <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center font-bold text-xl">!</div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Account Mapping Pending</h3>
        <p className="text-sm text-zinc-500 max-w-sm">Your login is registered, but your profile has not been assigned to a resident room yet. Please contact your warden.</p>
      </div>
    );
  }

  return (
    <StudentDashboardClient 
      student={data.student} 
      initialNotices={data.notices} 
      initialComplaints={data.complaints} 
      initialMenus={data.menus} 
      initialLeaves={data.leaves || []}
    />
  );
}
