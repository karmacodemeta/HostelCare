import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/db';
import Student from '@/models/Student';
import { Plus } from 'lucide-react';
import { SearchInput } from '@/components/dashboard/SearchInput';
import { StudentTable } from '@/components/dashboard/StudentTable';
import RentDuesChecker from '@/components/finance/RentDuesChecker';

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ branch?: string, query?: string }> }) {
  const session = await getSession();
  if (!session || !session.user.hostelId) redirect('/login');

  await connectDB();
  const { branch, query } = await searchParams;
  
  const filter: any = { hostelId: session.user.hostelId, isActive: { $ne: false } }; // Show active (default true)
  if (branch) filter.branchId = branch;
  
  if (query) {
      filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { roomNo: { $regex: query, $options: 'i' } },
          { guardian: { $regex: query, $options: 'i' } },
      ];
  }

  const students = await Student.find(filter).populate('branchId').sort({ createdAt: -1 }).lean();

  // Convert to plain object for Client Component
  const formattedStudents = students.map(s => ({
      ...s,
      _id: s._id.toString(),
      hostelId: s.hostelId?.toString() || '',
      branchId: s.branchId ? { 
          // @ts-ignore
          ...s.branchId, 
          // @ts-ignore
          _id: s.branchId._id.toString(),
          // @ts-ignore
          hostelId: s.branchId.hostelId?.toString() 
      } : null
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Students</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Manage hostel residents.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <RentDuesChecker />
            <SearchInput placeholder="Search students..." />
            <Link 
            href="/students/add" 
            className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl font-medium hover:opacity-90 transition whitespace-nowrap"
            >
            <Plus className="w-4 h-4" />
            Add Student
            </Link>
        </div>
      </div>

      <StudentTable students={formattedStudents as any} />
    </div>
  );
}
