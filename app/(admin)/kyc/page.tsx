'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShieldCheck, Hourglass, CheckCircle2, XCircle, 
  RefreshCw, Loader2, User, FileText, ExternalLink, ShieldAlert
} from 'lucide-react';
import { getSubmittedKYCList, verifyStudentKYC } from '@/app/actions/kyc';
import { toast } from 'sonner';

export default function KYCApprovalPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  
  // Rejection state
  const [rejectReasonMap, setRejectReasonMap] = useState<{ [key: string]: string }>({});

  const loadKYCList = async () => {
    setLoading(true);
    const list = await getSubmittedKYCList();
    setStudents(list);
    setLoading(false);
  };

  useEffect(() => {
    loadKYCList();
  }, []);

  const handleAction = async (studentId: string, status: 'verified' | 'rejected') => {
    const reason = rejectReasonMap[studentId] || '';
    if (status === 'rejected' && !reason) {
      toast.error('Please enter a rejection reason.');
      return;
    }

    setActioningId(studentId);
    const res = await verifyStudentKYC(studentId, status, reason);
    setActioningId(null);

    if (res.success) {
      toast.success(res.message);
      loadKYCList();
    } else {
      toast.error(res.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100';
      case 'rejected': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100';
      default: return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 animate-pulse';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Hourglass className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />;
    }
  };

  const filteredStudents = students.filter(s => filter === 'all' || s.kycStatus === 'submitted');

  return (
    <div className="space-y-6 p-1">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            KYC Verification Dashboard
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">Validate government identity records (Aadhaar & PAN) to comply with PG regulations.</p>
        </div>

        <Button
          onClick={loadKYCList}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 text-xs border-zinc-200"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            filter === 'pending'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850'
          }`}
        >
          Pending Verifications ({students.filter(s => s.kycStatus === 'submitted').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850'
          }`}
        >
          All Profiles ({students.length})
        </button>
      </div>

      {/* KYC Table Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-400 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-xl italic">
            No KYC applications submitted at this time. 🛡️
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredStudents.map((s) => {
              const kyc = s.kycDetails || {};
              const isPending = s.kycStatus === 'submitted';

              return (
                <Card 
                  key={s._id} 
                  className={`p-5 flex flex-col justify-between border shadow-sm transition hover:shadow-md ${
                    isPending 
                      ? 'border-indigo-100 dark:border-indigo-950 bg-indigo-50/5 dark:bg-indigo-950/5' 
                      : 'border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-zinc-800 dark:text-zinc-150 text-sm">{s.name}</h4>
                          <p className="text-[10px] text-zinc-400">Branch: <span className="font-bold">{s.branchId?.name || 'Main Branch'}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(s.kycStatus)}
                        <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border ${getStatusBadge(s.kycStatus)}`}>
                          {s.kycStatus === 'submitted' ? 'pending review' : s.kycStatus}
                        </span>
                      </div>
                    </div>

                    {/* KYC Document Values */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-zinc-400 block font-bold">Aadhaar Card No.</span>
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {kyc.aadhaarNumber || 'Not provided'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-zinc-400 block font-bold">PAN No.</span>
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {kyc.panNumber || 'Not provided'}
                        </span>
                      </div>
                    </div>

                    {/* Document Previews */}
                    <div className="pt-2">
                      <span className="text-[10px] text-zinc-400 block font-bold mb-1">Verify Uploaded Proofs</span>
                      <div className="grid grid-cols-3 gap-2">
                        <a 
                          href={kyc.photoUrl || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 border rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-center block text-indigo-600 shrink-0 cursor-pointer"
                        >
                          Profile Photo <ExternalLink className="w-3 h-3 inline ml-0.5" />
                        </a>
                        <a 
                          href={kyc.aadhaarFrontUrl || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 border rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-center block text-indigo-600 shrink-0 cursor-pointer"
                        >
                          Aadhaar Front <ExternalLink className="w-3 h-3 inline ml-0.5" />
                        </a>
                        <a 
                          href={kyc.aadhaarBackUrl || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 border rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-center block text-indigo-600 shrink-0 cursor-pointer"
                        >
                          Aadhaar Back <ExternalLink className="w-3 h-3 inline ml-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="border-t pt-4 mt-4 space-y-3">
                    {isPending ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            disabled={actioningId === s._id}
                            onClick={() => handleAction(s._id, 'verified')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 cursor-pointer"
                          >
                            Verify & Approve
                          </Button>
                          <Button
                            disabled={actioningId === s._id}
                            onClick={() => handleAction(s._id, 'rejected')}
                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 cursor-pointer"
                          >
                            Reject
                          </Button>
                        </div>
                        
                        <div className="space-y-1">
                          <Input
                            placeholder="Reason for rejection (mandatory if rejecting)..."
                            value={rejectReasonMap[s._id] || ''}
                            onChange={(e) => setRejectReasonMap({ ...rejectReasonMap, [s._id]: e.target.value })}
                            className="h-8 text-xs border-rose-100 focus-visible:ring-rose-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>KYC audit completed. Current Status: <span className="uppercase font-bold text-zinc-700 dark:text-zinc-300">{s.kycStatus}</span></span>
                      </div>
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
