import { getStudentById, getStudentPayments } from '@/app/actions/student';
import { getVisitorLogs } from '@/app/actions/visitor';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import StudentProfileClient from './StudentProfileClient';

export const dynamic = 'force-dynamic';

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [student, payments, visitorLogs] = await Promise.all([
    getStudentById(id),
    getStudentPayments(id),
    getVisitorLogs(id)
  ]);

  if (!student) {
    redirect('/students');
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link 
          href="/students"
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Students
        </Link>
      </div>

      {/* Profile Details Client Component */}
      <StudentProfileClient 
        student={student} 
        initialPayments={payments} 
        initialVisitorLogs={visitorLogs} 
      />
    </div>
  );
}
