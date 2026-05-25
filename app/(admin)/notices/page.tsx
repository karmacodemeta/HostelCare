import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getNotices } from '@/app/actions/notice';
import { getBranches } from '@/app/actions/branch';
import NoticeBoardClient from '@/components/notices/NoticeBoardClient';

export const dynamic = 'force-dynamic';

export default async function NoticesPage({ searchParams }: { searchParams: Promise<{ branch?: string }> }) {
  const session = await getSession();
  if (!session || !session.user.hostelId) redirect('/login');

  const { branch } = await searchParams;

  const [notices, branches] = await Promise.all([
    getNotices(branch),
    getBranches()
  ]);

  return (
    <div className="space-y-6">
      <NoticeBoardClient initialNotices={notices} branches={branches} />
    </div>
  );
}
