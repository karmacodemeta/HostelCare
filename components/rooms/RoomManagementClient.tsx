'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  Home, BedDouble, Plus, Trash2, UserPlus, 
  HelpCircle, Sparkles, Filter, Loader2, RefreshCw, User 
} from 'lucide-react';
import { createRoom, assignStudentToRoom, unassignStudentFromRoom } from '@/app/actions/room';
import { toast } from 'sonner';

interface Student {
  _id: string;
  name: string;
  roomNo: string;
}

interface Room {
  _id: string;
  roomNo: string;
  type: 'single' | 'double' | 'triple' | 'four_sharing';
  capacity: number;
  sharingType: 'ac' | 'non_ac';
  rent: number;
  students: {
    _id: string;
    name: string;
    contactNumber?: string;
    dues: number;
  }[];
  branchId?: {
    _id: string;
    name: string;
  };
}

interface RoomManagementClientProps {
  initialRooms: Room[];
  unassignedStudents: Student[];
  branches: { _id: string; name: string }[];
}

export default function RoomManagementClient({ 
  initialRooms, 
  unassignedStudents, 
  branches 
}: RoomManagementClientProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Add Room form states
  const [roomNo, setRoomNo] = useState('');
  const [type, setType] = useState<'single' | 'double' | 'triple' | 'four_sharing'>('double');
  const [capacity, setCapacity] = useState(2);
  const [sharingType, setSharingType] = useState<'ac' | 'non_ac'>('non_ac');
  const [rent, setRent] = useState(5000);
  const [branchId, setBranchId] = useState(branches[0]?._id || '');

  // Calculate high-level utilization metrics
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + (r.students?.length || 0), 0);
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNo || !branchId) return;

    setLoading(true);
    const res = await createRoom(roomNo, type, capacity, sharingType, rent, branchId);
    setLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsAddOpen(false);
      setRoomNo('');
      
      // Auto reload to fetch updated lists
      window.location.reload();
    } else {
      toast.error(res.message);
    }
  };

  const handleAssignStudent = async (studentId: string) => {
    if (!selectedRoom) return;

    setActionLoadingId(studentId);
    const res = await assignStudentToRoom(selectedRoom._id, studentId);
    setActionLoadingId(null);

    if (res.success) {
      toast.success(res.message);
      setIsAssignOpen(false);
      setSelectedRoom(null);
      window.location.reload();
    } else {
      toast.error(res.message);
    }
  };

  const handleUnassignStudent = async (roomId: string, studentId: string) => {
    if (!confirm('Are you sure you want to unassign this resident?')) return;

    setActionLoadingId(studentId);
    const res = await unassignStudentFromRoom(roomId, studentId);
    setActionLoadingId(null);

    if (res.success) {
      toast.success(res.message);
      window.location.reload();
    } else {
      toast.error(res.message);
    }
  };

  const triggerAssignModal = (room: Room) => {
    setSelectedRoom(room);
    setIsAssignOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title block with Create action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Visual Room Grid
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">Manage rooms, sharing plans, and live resident mapping.</p>
        </div>
        
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold px-5 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Room Unit
        </Button>
      </div>

      {/* Utilization Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Total Rooms</span>
          <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-50">{totalRooms}</span>
        </Card>
        
        <Card className="p-5 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Total Capacity (Beds)</span>
          <span className="text-2xl font-extrabold text-zinc-850 dark:text-zinc-50">{totalBeds}</span>
        </Card>

        <Card className="p-5 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Allocated Beds</span>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{occupiedBeds}</span>
            <p className="text-[10px] text-zinc-400">Available: {availableBeds} beds</p>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Live Utilization Rate</span>
          <div className="space-y-2">
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-50">{occupancyPercentage}%</span>
            <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Visual room grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-zinc-500 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-xl">
            No rooms registered in current branches. Click "Add Room Unit" to get started! 🏠
          </div>
        ) : (
          rooms.map((room) => {
            const isFull = room.students?.length >= room.capacity;
            const emptyCount = Math.max(0, room.capacity - (room.students?.length || 0));

            return (
              <Card key={room._id} className="p-5 flex flex-col justify-between border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm relative group hover:shadow-md transition">
                <div className="space-y-4">
                  {/* Room header */}
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-zinc-800 dark:text-zinc-100 text-lg flex items-center gap-1.5">
                        <Home className="w-4.5 h-4.5 text-zinc-400" /> Room {room.roomNo}
                      </h4>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold">
                        {room.branchId?.name || 'Main Branch'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-50 dark:bg-zinc-800 border uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {room.type?.replace('_', ' ')} &bull; {room.sharingType}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">₹{room.rent?.toLocaleString()}/mo</span>
                    </div>
                  </div>

                  {/* Bed allocations visual list */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Bed Mappings:</span>
                    
                    <div className="grid gap-2">
                      {/* Occupied beds */}
                      {room.students?.map((s) => (
                        <div key={s._id} className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-zinc-800 bg-indigo-50/10 dark:bg-zinc-800/10 text-xs">
                          <div className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
                            <BedDouble className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>{s.name}</span>
                          </div>
                          
                          <button
                            disabled={actionLoadingId === s._id}
                            onClick={() => handleUnassignStudent(room._id, s._id)}
                            className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors"
                            title="Unassign Bed"
                          >
                            {actionLoadingId === s._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}

                      {/* Empty beds */}
                      {[...Array(emptyCount)].map((_, i) => (
                        <div key={`empty-${i}`} className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 bg-transparent">
                          <div className="flex items-center gap-2 font-medium">
                            <BedDouble className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                            <span className="italic">Empty Bed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assignment triggers */}
                <div className="pt-4 mt-4 border-t">
                  {isFull ? (
                    <Button 
                      disabled 
                      size="sm" 
                      className="w-full text-xs font-bold text-zinc-400 dark:text-zinc-500 bg-neutral-50 dark:bg-zinc-800 border cursor-not-allowed"
                    >
                      Room Fully Occupied
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => triggerAssignModal(room)}
                      className="w-full text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Assign Resident
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Room Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-indigo-600" /> Register Room Unit
            </DialogTitle>
            <DialogDescription>
              Configure sharing type, bed capacity, and branch mappings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRoom} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="room-no" className="text-xs font-semibold text-zinc-500 uppercase">Room Number</Label>
                <Input 
                  id="room-no" 
                  value={roomNo} 
                  onChange={(e) => setRoomNo(e.target.value)} 
                  placeholder="e.g. 102" 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room-branch" className="text-xs font-semibold text-zinc-500 uppercase">Target Branch</Label>
                <select
                  id="room-branch"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none text-zinc-800 dark:text-zinc-100"
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="room-type" className="text-xs font-semibold text-zinc-500 uppercase">Sharing Plan</Label>
                <select
                  id="room-type"
                  value={type}
                  onChange={(e: any) => {
                    setType(e.target.value);
                    // Match default capacities
                    if (e.target.value === 'single') setCapacity(1);
                    else if (e.target.value === 'double') setCapacity(2);
                    else if (e.target.value === 'triple') setCapacity(3);
                    else if (e.target.value === 'four_sharing') setCapacity(4);
                  }}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none text-zinc-800 dark:text-zinc-100"
                >
                  <option value="single">Single Sharing</option>
                  <option value="double">Double Sharing</option>
                  <option value="triple">Triple Sharing</option>
                  <option value="four_sharing">Four Sharing</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room-sharing" className="text-xs font-semibold text-zinc-500 uppercase">AC Status</Label>
                <select
                  id="room-sharing"
                  value={sharingType}
                  onChange={(e: any) => setSharingType(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none text-zinc-800 dark:text-zinc-100"
                >
                  <option value="non_ac">Non-AC Room</option>
                  <option value="ac">AC Room</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="room-capacity" className="text-xs font-semibold text-zinc-500 uppercase">Bed Capacity</Label>
                <Input 
                  id="room-capacity" 
                  type="number"
                  value={capacity} 
                  onChange={(e) => setCapacity(Number(e.target.value))} 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room-rent" className="text-xs font-semibold text-zinc-500 uppercase">Default Room Rent (/mo)</Label>
                <Input 
                  id="room-rent" 
                  type="number"
                  value={rent} 
                  onChange={(e) => setRent(Number(e.target.value))} 
                  required 
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Resident Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" /> Assign Bed Space
            </DialogTitle>
            <DialogDescription>
              Assign an unallocated student to Room {selectedRoom?.roomNo}.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[300px] overflow-y-auto space-y-2.5 py-4">
            {unassignedStudents.length === 0 ? (
              <p className="text-xs text-zinc-400 italic text-center py-4">All residents have already been allocated rooms.</p>
            ) : (
              unassignedStudents.map((student) => (
                <div key={student._id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/50 hover:bg-neutral-50 dark:hover:bg-zinc-900 transition">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-semibold text-zinc-850 dark:text-zinc-200">{student.name}</span>
                  </div>

                  <Button
                    size="sm"
                    disabled={actionLoadingId === student._id}
                    onClick={() => handleAssignStudent(student._id)}
                    className="h-8 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
                  >
                    {actionLoadingId === student._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Allocate Bed'
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
