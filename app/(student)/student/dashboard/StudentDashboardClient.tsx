'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  Megaphone, Utensils, Wrench, CheckCircle2, Hourglass, 
  XCircle, Plus, Calendar, ShieldAlert, Home, User, CreditCard, Loader2,
  LogOut, ClipboardList, Info
} from 'lucide-react';
import { createComplaint } from '@/app/actions/complaint';
import { payRentOnline } from '@/app/actions/payment';
import { applyForLeave } from '@/app/actions/leave';
import { toast } from 'sonner';

interface StudentDashboardClientProps {
  student: any;
  initialNotices: any[];
  initialComplaints: any[];
  initialMenus: any[];
  initialLeaves: any[];
}

export default function StudentDashboardClient({ 
  student, 
  initialNotices, 
  initialComplaints, 
  initialMenus,
  initialLeaves
}: StudentDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'notices' | 'menu' | 'tickets' | 'leave'>('notices');
  const [complaints, setComplaints] = useState<any[]>(initialComplaints);
  const [leaves, setLeaves] = useState<any[]>(initialLeaves);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Razorpay states
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [payLoading, setPayLoading] = useState(false);
  const [payStep, setPayStep] = useState<1 | 2>(1);

  // Complaint form states
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintCategory, setComplaintCategory] = useState<'room' | 'plumbing' | 'electrical' | 'food' | 'cleaning' | 'other'>('room');
  const [complaintSeverity, setComplaintSeverity] = useState<'low' | 'medium' | 'high'>('low');

  // Leave form states
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const handlePayOnline = async () => {
    setPayStep(2);
    setPayLoading(true);
    
    // Simulate gateway checkout delays
    setTimeout(async () => {
      const res = await payRentOnline(student._id, student.dues);
      setPayLoading(false);
      if (res.success) {
        toast.success(res.message);
        setIsRazorpayOpen(false);
        setPayStep(1);
        window.location.reload();
      } else {
        toast.error(res.message);
        setPayStep(1);
      }
    }, 2500);
  };

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintTitle || !complaintDescription) return;

    setLoading(true);
    const res = await createComplaint(complaintTitle, complaintDescription, complaintCategory, complaintSeverity, student._id);
    setLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsComplaintOpen(false);
      
      // Reset form
      setComplaintTitle('');
      setComplaintDescription('');
      setComplaintCategory('room');
      setComplaintSeverity('low');

      window.location.reload();
    } else {
      toast.error(res.message);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) return;

    setLeaveLoading(true);
    const res = await applyForLeave(leaveStartDate, leaveEndDate, leaveReason);
    setLeaveLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsLeaveOpen(false);

      // Reset form
      setLeaveStartDate('');
      setLeaveEndDate('');
      setLeaveReason('');

      window.location.reload();
    } else {
      toast.error(res.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Hourglass className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'in_progress': return <Wrench className="w-4 h-4 text-indigo-500 animate-spin" style={{ animationDuration: '3s' }} />;
      case 'approved':
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'high': return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-900/30';
      case 'medium': return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
      case 'low': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      default: return 'bg-zinc-50 text-zinc-500 border-zinc-100';
    }
  };

  const getLeaveStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40';
      case 'rejected': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/40';
      default: return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/40';
    }
  };

  // Organize Mess Menu
  const activeMenu = initialMenus[0];
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSignOut = () => {
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-1">
      {/* Dynamic Profile Header Banner */}
      <Card className="p-6 md:p-8 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50/40 dark:from-indigo-950/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">Welcome, {student.name}!</h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mt-0.5">
                <Home className="w-3.5 h-3.5" /> Room {student.roomNo} &bull; {student.branchId?.name || 'Main Branch'}
              </p>
            </div>
          </div>

          <Button 
            onClick={handleSignOut}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1.5 text-zinc-500 border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </Card>

      {/* Account Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Rent Dues Balance</span>
            <span className={`text-xl font-extrabold ${student.dues > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              ₹{student.dues?.toLocaleString()}
            </span>
          </div>
          {student.dues > 0 && (
            <Button
              onClick={() => setIsRazorpayOpen(true)}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer animate-pulse"
            >
              Pay Online
            </Button>
          )}
        </Card>

        <Card className="p-5 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm flex items-center">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Monthly Room Rent</span>
            <span className="text-xl font-extrabold text-zinc-850 dark:text-zinc-100">
              ₹{student.rent?.toLocaleString()}
            </span>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm flex items-center">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Admission Date</span>
            <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
              {new Date(student.admissionDate || student.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </span>
          </div>
        </Card>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-neutral-100 dark:border-zinc-800/80">
        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-1.5 py-2.5 px-4 font-bold text-sm border-b-2 transition ${
            activeTab === 'notices'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Megaphone className="w-4 h-4" /> Notice Board
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-1.5 py-2.5 px-4 font-bold text-sm border-b-2 transition ${
            activeTab === 'menu'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Utensils className="w-4 h-4" /> Mess Menu
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-1.5 py-2.5 px-4 font-bold text-sm border-b-2 transition ${
            activeTab === 'tickets'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Wrench className="w-4 h-4" /> Support Tickets
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-1.5 py-2.5 px-4 font-bold text-sm border-b-2 transition ${
            activeTab === 'leave'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Leave Board
        </button>
      </div>

      {/* Tabs contents */}
      <div className="space-y-4">
        {/* Notices Board tab */}
        {activeTab === 'notices' && (
          <div className="grid gap-4 md:grid-cols-2">
            {initialNotices.length === 0 ? (
              <Card className="col-span-full p-8 text-center text-sm text-zinc-400 italic bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
                No active announcements on the notice board.
              </Card>
            ) : (
              initialNotices.map((n) => (
                <Card key={n._id} className="p-5 border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 text-[10px] font-semibold text-zinc-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-base">{n.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Mess Menu tab */}
        {activeTab === 'menu' && (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {!activeMenu ? (
              <Card className="col-span-full p-8 text-center text-sm text-zinc-400 italic bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
                No mess menu schedule found for your branch.
              </Card>
            ) : (
              weekdays.map((day) => {
                const dayMenu = activeMenu.days?.find((d: any) => d.day === day) || {};
                return (
                  <Card key={day} className="p-4 border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-100 text-xs border-b pb-1.5 uppercase tracking-wide">{day}</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-semibold">Breakfast</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{dayMenu.breakfast || 'Not scheduled'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-semibold">Lunch</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{dayMenu.lunch || 'Not scheduled'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-semibold">Dinner</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{dayMenu.dinner || 'Not scheduled'}</span>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Support Tickets tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsComplaintOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold px-4 flex items-center gap-1 text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> File Facility Ticket
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {complaints.length === 0 ? (
                <Card className="col-span-full p-8 text-center text-sm text-zinc-400 italic bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
                  You haven't filed any complaints yet. All is green! 🛡️
                </Card>
              ) : (
                complaints.map((c) => (
                  <Card key={c._id} className="p-4 border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between min-h-[160px] hover:shadow-md transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] uppercase font-extrabold px-2 py-0.25 rounded-full border ${getSeverityBadge(c.severity)}`}>
                          {c.severity}
                        </span>
                        
                        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 capitalize">
                          {getStatusIcon(c.status)}
                          <span>{c.status.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm line-clamp-1">{c.title}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">{c.description}</p>
                    </div>

                    <div className="border-t pt-2 mt-3 flex justify-between items-center text-[10px] text-zinc-400">
                      <span>Category: <span className="font-bold uppercase">{c.category}</span></span>
                      <span>Filed: {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Leave Applications Tab */}
        {activeTab === 'leave' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsLeaveOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 flex items-center gap-1 text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Apply for Leave
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leaves.length === 0 ? (
                <Card className="col-span-full p-8 text-center text-sm text-zinc-400 italic bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
                  No leave requests logged yet.
                </Card>
              ) : (
                leaves.map((l) => (
                  <Card key={l._id} className="p-4 border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${getLeaveStatusBadge(l.status)}`}>
                          {l.status}
                        </span>
                        
                        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                          {getStatusIcon(l.status)}
                          <span className="capitalize">{l.status}</span>
                        </div>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-semibold">
                            {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed mt-1">
                          Reason: <span className="font-medium text-zinc-700 dark:text-zinc-300">{l.reason}</span>
                        </p>
                      </div>
                    </div>

                    {l.status !== 'pending' && l.approvedBy && (
                      <div className="border-t pt-2 mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <Info className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Actioned by: <span className="font-bold">{l.approvedBy}</span></span>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Razorpay Simulated Checkout Dialog */}
      <Dialog open={isRazorpayOpen} onOpenChange={setIsRazorpayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600 animate-pulse" /> Secure Rent Checkout
            </DialogTitle>
            <DialogDescription>
              Clear your outstanding hostel dues via simulated Razorpay gateway.
            </DialogDescription>
          </DialogHeader>

          {payStep === 1 ? (
            <div className="space-y-4 py-3">
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 text-sm">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-500">Rent Balance Due:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{student.dues?.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">Payment Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('upi')}
                    className={`p-3 rounded-lg border text-center text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      paymentMode === 'upi'
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 dark:border-indigo-500'
                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950'
                    }`}
                  >
                    <span>UPI / GPay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('card')}
                    className={`p-3 rounded-lg border text-center text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      paymentMode === 'card'
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 dark:border-indigo-500'
                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950'
                    }`}
                  >
                    <span>Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('netbanking')}
                    className={`p-3 rounded-lg border text-center text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      paymentMode === 'netbanking'
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 dark:border-indigo-500'
                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950'
                    }`}
                  >
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>

              <Button
                onClick={handlePayOnline}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                Proceed to Pay ₹{student.dues?.toLocaleString()}
              </Button>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Connecting to secure server...</p>
                <p className="text-xs text-zinc-400 max-w-[280px]">Do not close or refresh this page. Simulated gateway is processing your transaction.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* File Complaint Ticket Dialog */}
      <Dialog open={isComplaintOpen} onOpenChange={setIsComplaintOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" /> File Maintenance Ticket
            </DialogTitle>
            <DialogDescription>
              Describe the issue inside your room or hostel facilities, and the Warden team will resolve it.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFileComplaint} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="complaint-title" className="text-xs font-semibold text-zinc-500 uppercase">Issue Summary</Label>
              <Input 
                id="complaint-title" 
                value={complaintTitle} 
                onChange={(e) => setComplaintTitle(e.target.value)} 
                placeholder="e.g. Geyser water pump leaking" 
                required 
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="complaint-category" className="text-xs font-semibold text-zinc-500 uppercase">Category</Label>
                <select
                  id="complaint-category"
                  value={complaintCategory}
                  onChange={(e: any) => setComplaintCategory(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none text-zinc-800 dark:text-zinc-100"
                >
                  <option value="room">Room & Furniture</option>
                  <option value="plumbing">Plumbing / Washroom</option>
                  <option value="electrical">Electrical / Appliances</option>
                  <option value="food">Mess Food & Catering</option>
                  <option value="cleaning">Cleaning / Janitorial</option>
                  <option value="other">Others</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="complaint-severity" className="text-xs font-semibold text-zinc-500 uppercase">Severity Level</Label>
                <select
                  id="complaint-severity"
                  value={complaintSeverity}
                  onChange={(e: any) => setComplaintSeverity(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none text-zinc-800 dark:text-zinc-100"
                >
                  <option value="low">Low (Standard)</option>
                  <option value="medium">Medium (Moderate)</option>
                  <option value="high">High (Urgent Repair)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="complaint-desc" className="text-xs font-semibold text-zinc-500 uppercase">Details / Description</Label>
              <textarea
                id="complaint-desc"
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                rows={4}
                placeholder="Give exact details of your location or appliance number so the repair team can verify..."
                required
                className="w-full p-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 dark:text-zinc-100 resize-none leading-relaxed"
              />
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setIsComplaintOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                File Support Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Leave Dialog */}
      <Dialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Apply for Leave & Gatepass
            </DialogTitle>
            <DialogDescription>
              Submit your check-out/check-in leave dates and details for Warden permission.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplyLeave} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="leave-start" className="text-xs font-semibold text-zinc-500 uppercase">Start Date</Label>
                <Input 
                  id="leave-start" 
                  type="date"
                  value={leaveStartDate} 
                  onChange={(e) => setLeaveStartDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="leave-end" className="text-xs font-semibold text-zinc-500 uppercase">End Date</Label>
                <Input 
                  id="leave-end" 
                  type="date"
                  value={leaveEndDate} 
                  onChange={(e) => setLeaveEndDate(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leave-reason" className="text-xs font-semibold text-zinc-500 uppercase">Reason / Purpose of Leave</Label>
              <textarea
                id="leave-reason"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                rows={4}
                placeholder="Give details of where you are going (e.g. traveling home, family function, medical reasons)..."
                required
                className="w-full p-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 dark:text-zinc-100 resize-none leading-relaxed"
              />
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setIsLeaveOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={leaveLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {leaveLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
