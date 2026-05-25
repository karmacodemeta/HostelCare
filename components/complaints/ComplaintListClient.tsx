'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wrench, CheckCircle2, Hourglass, XCircle, AlertTriangle, 
  User, Home, Phone, ArrowUpRight, Search, Filter 
} from 'lucide-react';
import { updateComplaintStatus } from '@/app/actions/complaint';
import { toast } from 'sonner';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  studentId?: {
    name: string;
    roomNo: string;
    contactNumber?: string;
  };
  branchId?: {
    name: string;
  };
}

interface ComplaintListClientProps {
  initialComplaints: Complaint[];
}

export default function ComplaintListClient({ initialComplaints }: ComplaintListClientProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: any) => {
    setLoadingId(id);
    const res = await updateComplaintStatus(id, newStatus);
    setLoadingId(null);

    if (res.success) {
      toast.success(res.message);
      setComplaints(prev => prev.map(c => 
        c._id === id ? { ...c, status: newStatus } : c
      ));
    } else {
      toast.error(res.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Hourglass className="w-4 h-4 text-amber-500" />;
      case 'in_progress': return <Wrench className="w-4 h-4 text-indigo-500 animate-spin" style={{ animationDuration: '3s' }} />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30';
      case 'medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30';
      case 'low': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30';
      default: return 'text-zinc-600 bg-zinc-50 border-zinc-100';
    }
  };

  // Filter logic
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Search and filter toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-4 border border-neutral-100 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tickets or resident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold uppercase">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="all">All Severity</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>

      {/* Ticket listings */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredComplaints.length === 0 ? (
          <div className="col-span-full text-center py-16 text-sm text-zinc-500 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-xl">
            No complaints found matching selected criteria.
          </div>
        ) : (
          filteredComplaints.map(c => (
            <Card key={c._id} className="p-5 flex flex-col justify-between border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm relative group hover:shadow-md transition">
              <div className="space-y-3">
                {/* Header status line */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getSeverityColor(c.severity)}`}>
                    {c.severity} priority
                  </span>
                  
                  <div className="flex items-center gap-1 text-xs font-semibold text-zinc-500 capitalize">
                    {getStatusIcon(c.status)}
                    <span>{c.status.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Info block */}
                <div className="space-y-1">
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-base line-clamp-1">
                    {c.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 min-h-[48px]">
                    {c.description}
                  </p>
                </div>

                {/* Metadata and resident link */}
                <div className="pt-3 border-t space-y-2 text-xs text-zinc-500">
                  {c.studentId && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {c.studentId.name} &bull; Room {c.studentId.roomNo}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{c.branchId?.name || 'Main Branch'} &bull; {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Quick Select */}
              <div className="pt-4 mt-3 border-t flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Update status:</span>
                <div className="grid grid-cols-4 gap-1">
                  {(['pending', 'in_progress', 'resolved', 'rejected'] as const).map((s) => (
                    <button
                      key={s}
                      disabled={loadingId === c._id}
                      onClick={() => handleStatusChange(c._id, s)}
                      className={`text-[9px] font-bold py-1.5 rounded transition ${
                        c.status === s 
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                          : 'bg-neutral-50 dark:bg-zinc-800/50 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {s === 'in_progress' ? 'Working' : s}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
