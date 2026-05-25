import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getRooms } from '@/app/actions/room';
import { getBranches } from '@/app/actions/branch';
import connectDB from '@/lib/db';
import Student from '@/models/Student';
import RoomManagementClient from '@/components/rooms/RoomManagementClient';

export const dynamic = 'force-dynamic';

export default async function RoomsPage({ searchParams }: { searchParams: Promise<{ branch?: string }> }) {
  const session = await getSession();
  if (!session || !session.user.hostelId) redirect('/login');

  const { branch } = await searchParams;

  await connectDB();

  // Parallel fetches for speed
  const [rooms, branches, unassignedStudents] = await Promise.all([
    getRooms(branch),
    getBranches(),
    Student.find({ 
      hostelId: session.user.hostelId, 
      isActive: { $ne: false },
      $or: [
        { roomNo: 'Unassigned' },
        { roomNo: { $exists: false } },
        { roomNo: null }
      ]
    }).select('name roomNo').lean()
  ]);

  // Convert mongoose _id to string for unassigned students
  const formattedStudents = unassignedStudents.map((s: any) => ({
    _id: s._id.toString(),
    name: s.name,
    roomNo: s.roomNo || 'Unassigned'
  }));

  return (
    <div className="space-y-6">
      <RoomManagementClient 
        initialRooms={rooms} 
        unassignedStudents={formattedStudents} 
        branches={branches} 
      />
    </div>
  );
}
