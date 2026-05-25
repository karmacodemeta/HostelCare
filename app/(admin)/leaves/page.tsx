'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, CheckCircle2, XCircle, Hourglass, 
  User, RefreshCw, Loader2, Sparkles, Phone, Home, FileText
} from 'lucide-react';
import { getAllLeaves, updateLeaveStatus } from '@/app/actions/leave';
import { toast } from 'sonner';

export default function LeavesApprovalPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchLeaves = async () => {
    setLoading(true);
    const res = await getAllLeaves();
    setLeaves(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (leaveId: string, status: 'approved' | 'rejected') => {
    setActioningId(leaveId);
    const res = await updateLeaveStatus(leaveId, status);
    setActioningId(null);

    if (res.success) {
      toast.success(res.message);
      fetchLeaves();
    } else {
      toast.error(res.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Hourglass className="w-4 h-4 text-amber-500" />;
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100';
      case 'rejected': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100';
      default: return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100';
    }
  };

  const filteredLeaves = leaves.filter(l => filter === 'all' || l.status === 'pending');

  return (
    <div className="space-y-6 p-1">
      {/* Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Leave & Gatepass Board
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">Review, approve, and audit resident check-out schedules.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchLeaves}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs border-zinc-200"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            filter === 'pending'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Pending Requests ({leaves.filter(l => l.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          All Applications ({leaves.length})
        </button>
      </div>

      {/* Leaves registry list */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-400 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-xl italic">
            No active leave requests to display in this list. 🛡️
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeaves.map((leave) => {
              const studentName = leave.studentId?.name || 'Unknown Resident';
              const roomNo = leave.studentId?.roomNo || 'N/A';
              const contactNumber = leave.studentId?.contactNumber || 'N/A';
              const isPending = leave.status === 'pending';

              return (
                <Card 
                  key={leave._id} 
                  className={`p-5 flex flex-col justify-between min-h-[220px] border shadow-sm group hover:shadow-md transition relative overflow-hidden ${
                    isPending 
                      ? 'border-indigo-100 dark:border-indigo-950 bg-indigo-50/5 dark:bg-indigo-950/5' 
                      : 'border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b pb-2">
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-zinc-800 dark:text-zinc-150 text-sm flex items-center gap-1.5">
                          <User className="w-4 h-4 text-zinc-400" /> {studentName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                          <span className="flex items-center gap-0.5"><Home className="w-3 h-3" /> Room {roomNo}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {contactNumber}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border ${getStatusBadge(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap flex items-start gap-1">
                        <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{leave.reason}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="border-t pt-4 mt-4 flex items-center justify-between gap-2">
                    {isPending ? (
                      <div className="flex gap-2 w-full">
                        <Button
                          disabled={actioningId === leave._id}
                          onClick={() => handleAction(leave._id, 'approved')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 cursor-pointer"
                        >
                          Approve
                        </Button>
                        <Button
                          disabled={actioningId === leave._id}
                          onClick={() => handleAction(leave._id, 'rejected')}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 cursor-pointer"
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-zinc-400" /> Actioned by: <span className="font-bold">{leave.approvedBy || 'Warden'}</span>
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
