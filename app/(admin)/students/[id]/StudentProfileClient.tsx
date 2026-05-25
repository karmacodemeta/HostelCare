'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  User, Phone, Home, Calendar, ShieldAlert, ShieldCheck,
  MapPin, UserCheck, Mail, ArrowRight, Download, CreditCard, IndianRupee,
  FileText, Trash2, Plus, Loader2, Users, CheckCircle2, Clock
} from 'lucide-react';
import { RentCollectionDialog } from '@/components/dashboard/RentCollectionDialog';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { addStudentDocument, deleteStudentDocument } from '@/app/actions/student';
import { logVisitorCheckIn, logVisitorCheckOut } from '@/app/actions/visitor';
import { verifyStudentKYC } from '@/app/actions/kyc';

interface StudentProfileClientProps {
  student: any;
  initialPayments: any[];
  initialVisitorLogs: any[];
}

export default function StudentProfileClient({ student, initialPayments, initialVisitorLogs }: StudentProfileClientProps) {
  const [payments, setPayments] = useState<any[]>(initialPayments);
  const [documents, setDocuments] = useState<any[]>(student.documents || []);
  const [uploading, setUploading] = useState(false);
  const [isCollectRentOpen, setIsCollectRentOpen] = useState(false);

  const [visitorLogs, setVisitorLogs] = useState<any[]>(initialVisitorLogs || []);
  const [isVisitorOpen, setIsVisitorOpen] = useState(false);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorCheckOutLoadingId, setVisitorCheckOutLoadingId] = useState<string | null>(null);

  const [kycStatus, setKycStatus] = useState<string>(student.kycStatus || 'pending');
  const [kycActionLoading, setKycActionLoading] = useState(false);

  const handleVerifyKYC = async (status: 'verified' | 'rejected', reason?: string) => {
    setKycActionLoading(true);
    const res = await verifyStudentKYC(student._id, status, reason);
    setKycActionLoading(false);
    
    if (res.success) {
      toast.success(res.message);
      setKycStatus(status);
      window.location.reload();
    } else {
      toast.error(res.message);
    }
  };

  // Visitor form states
  const [visitorName, setVisitorName] = useState('');
  const [visitorRelation, setVisitorRelation] = useState('');
  const [visitorContact, setVisitorContact] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('');

  const handleVisitorCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorRelation || !visitorContact || !visitorPurpose) return;

    setVisitorLoading(true);
    const res = await logVisitorCheckIn(student._id, visitorName, visitorRelation, visitorContact, visitorPurpose);
    setVisitorLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsVisitorOpen(false);
      setVisitorName('');
      setVisitorRelation('');
      setVisitorContact('');
      setVisitorPurpose('');
      window.location.reload();
    } else {
      toast.error(res.message);
    }
  };

  const handleVisitorCheckOut = async (logId: string) => {
    setVisitorCheckOutLoadingId(logId);
    const res = await logVisitorCheckOut(logId);
    setVisitorCheckOutLoadingId(null);

    if (res.success) {
      toast.success(res.message);
      window.location.reload();
    } else {
      toast.error(res.message);
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            const actionResult = await addStudentDocument(student._id, data.name, data.url);
            if (actionResult.success) {
                setDocuments(actionResult.student.documents || []);
                toast.success(actionResult.message);
            } else {
                toast.error(actionResult.message);
            }
        } else {
            toast.error(data.error || 'Upload failed');
        }
    } catch (error) {
        console.error(error);
        toast.error('Upload failed');
    } finally {
        setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
        const actionResult = await deleteStudentDocument(student._id, docId);
        if (actionResult.success) {
            setDocuments(actionResult.student.documents || []);
            toast.success(actionResult.message);
        } else {
            toast.error(actionResult.message);
        }
    } catch (error) {
        console.error(error);
        toast.error('Delete failed');
    }
  };

  const handleDownloadReceipt = (payment: any) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });

      // Color palette
      const primaryColor = [79, 70, 229]; // Indigo
      const darkTextColor = [15, 23, 42]; // Slate-900
      const lightTextColor = [100, 116, 139]; // Slate-500

      // Top Header ribbon
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 148, 12, 'F');

      // Title & Logo
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('HOSTELCARE', 15, 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('Official Payment Receipt & Voucher', 15, 31);

      // Meta Info
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.text(`Receipt No: REC-${payment._id.slice(-8).toUpperCase()}`, 85, 26);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${new Date(payment.date).toLocaleDateString()}`, 85, 31);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 36, 133, 36);

      // Details columns
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.setFontSize(8);
      doc.text('RECEIVED FROM:', 15, 44);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.text(student.name, 15, 49);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Contact: ${student.contactNumber || 'N/A'}`, 15, 54);
      doc.text(`Room Number: ${student.roomNo}`, 15, 59);
      doc.text(`Branch: ${student.branchId?.name || 'Main Branch'}`, 15, 64);

      // Payment Details
      doc.setFontSize(8);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('PAYMENT VOUCHER:', 85, 44);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.text(`Category: ${payment.type.toUpperCase()}`, 85, 49);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Method: ${(payment.paymentMethod || 'cash').toUpperCase()}`, 85, 54);
      doc.text(`Status: CLEARED`, 85, 59);

      // Main line divider
      doc.line(15, 70, 133, 70);

      // Receipt Box
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 75, 118, 22, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.rect(15, 75, 118, 22, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('AMOUNT RECEIVED:', 22, 88);

      doc.setFontSize(15);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`INR ₹${payment.amount.toLocaleString()}/-`, 68, 89);

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('Thank you for staying with us! For query write to support@hostelcare.com', 15, 112);

      // Signature line
      doc.setDrawColor(203, 213, 225);
      doc.line(90, 116, 133, 116);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Authorized Seal & Signature', 98, 120);

      doc.save(`Receipt_REC-${payment._id.slice(-8).toUpperCase()}.pdf`);
      toast.success('PDF Receipt downloaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF receipt');
    }
  };

  const handleRefreshData = () => {
    // Standard revalidation fallback or state trigger
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Top Profile Card Banner */}
      <Card className="p-6 md:p-8 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50/40 dark:from-indigo-950/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-white dark:border-zinc-900">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                  Active
                </span>
                {kycStatus === 'verified' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-750 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> KYC Verified
                  </span>
                )}
                {kycStatus === 'submitted' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> KYC Action Required
                  </span>
                )}
                {kycStatus === 'rejected' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> KYC Rejected
                  </span>
                )}
                {(kycStatus === 'pending' || !kycStatus) && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-150 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> KYC Unverified
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Home className="w-4 h-4" /> Room {student.roomNo} &bull; {student.branchId?.name || 'Main Branch'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={() => setIsCollectRentOpen(true)}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold px-5"
            >
              Collect Rent
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Monthly Rent</span>
          <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-50">₹{student.rent?.toLocaleString()}</span>
        </Card>
        <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Outstanding Dues</span>
          <span className={`text-2xl font-extrabold ${student.dues > 0 ? 'text-red-500' : 'text-emerald-500 dark:text-emerald-400'}`}>
            ₹{student.dues?.toLocaleString()}
          </span>
        </Card>
        <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Total Paid to Date</span>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{totalPaid?.toLocaleString()}</span>
        </Card>
        <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Admission Date</span>
          <span className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            {new Date(student.admissionDate || student.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </span>
        </Card>
      </div>

      {/* Main 2-Column layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Contact Information Cards */}
        <div className="space-y-6 md:col-span-1">
          <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200 border-b pb-2 text-base">Resident Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{student.contactNumber || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 truncate">{student.email || 'No email registered'}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700 dark:text-zinc-300">{student.address || 'Address not logged'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200 border-b pb-2 text-base">Guardian Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{student.guardian || 'Not listed'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{student.guardianContact || 'No contact details'}</span>
              </div>
            </div>
          </Card>

          {/* KYC Identity Validation Card */}
          <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-base">KYC Identity Validation</h3>
              <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                kycStatus === 'verified'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                  : kycStatus === 'submitted'
                  ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                  : kycStatus === 'rejected'
                  ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                  : 'bg-zinc-100 text-zinc-550 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {kycStatus === 'verified' ? 'Verified' : kycStatus === 'submitted' ? 'Pending Action' : kycStatus === 'rejected' ? 'Rejected' : 'Unverified'}
              </span>
            </div>

            {student.kycDetails && student.kycDetails.aadhaarNumber ? (
              <div className="space-y-3.5 text-xs">
                {student.kycDetails.photoUrl && (
                  <div className="flex justify-center mb-3">
                    <img 
                      src={student.kycDetails.photoUrl} 
                      alt="KYC Profile" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-zinc-100 dark:border-zinc-850 shadow-sm"
                    />
                  </div>
                )}
                
                <div className="space-y-1.5 font-sans">
                  <p className="flex justify-between text-zinc-500">
                    <span>Aadhaar Number:</span>
                    <span className="font-mono font-bold text-zinc-850 dark:text-zinc-250">
                      {student.kycDetails.aadhaarNumber.replace(/.(?=.{4})/g, '•')}
                    </span>
                  </p>
                  <p className="flex justify-between text-zinc-500">
                    <span>PAN Number:</span>
                    <span className="font-mono font-bold text-zinc-850 dark:text-zinc-250">
                      {student.kycDetails.panNumber ? student.kycDetails.panNumber.replace(/.(?=.{3})/g, '•') : 'N/A'}
                    </span>
                  </p>
                </div>

                {/* Previews of Aadhaar Front / Back */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {student.kycDetails.aadhaarFrontUrl && (
                    <a 
                      href={student.kycDetails.aadhaarFrontUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 rounded-lg p-2 text-center bg-zinc-50/50 dark:bg-zinc-950/30 transition block cursor-pointer"
                    >
                      <span className="text-[9px] font-extrabold uppercase text-zinc-550 block">Aadhaar Front</span>
                      <span className="text-[9px] text-indigo-650 dark:text-indigo-400 font-bold block mt-1 hover:underline">View Image</span>
                    </a>
                  )}
                  {student.kycDetails.aadhaarBackUrl && (
                    <a 
                      href={student.kycDetails.aadhaarBackUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 rounded-lg p-2 text-center bg-zinc-50/50 dark:bg-zinc-950/30 transition block cursor-pointer"
                    >
                      <span className="text-[9px] font-extrabold uppercase text-zinc-550 block">Aadhaar Back</span>
                      <span className="text-[9px] text-indigo-650 dark:text-indigo-400 font-bold block mt-1 hover:underline">View Image</span>
                    </a>
                  )}
                </div>

                {/* Action buttons for warden/admin if submitted */}
                {kycStatus === 'submitted' && (
                  <div className="pt-3 border-t grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleVerifyKYC('rejected', 'Details do not match identity records.')}
                      variant="outline"
                      size="sm"
                      disabled={kycActionLoading}
                      className="h-8 border-rose-250 hover:bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:hover:bg-rose-950/20 text-xs font-semibold cursor-pointer"
                    >
                      Reject KYC
                    </Button>
                    <Button
                      onClick={() => handleVerifyKYC('verified')}
                      size="sm"
                      disabled={kycActionLoading}
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer"
                    >
                      {kycActionLoading ? <Loader2 className="w-3 animate-spin" /> : 'Approve KYC'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-zinc-400 space-y-2 italic">
                <p>No identity details submitted by resident.</p>
                <p className="text-[9px] text-zinc-500 font-normal">Residents can submit KYC verification from explore page booking flow.</p>
              </div>
            )}
          </Card>

          {/* Documents & Paperwork Card */}
          <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-base">Documents & Proofs</h3>
              {uploading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
            </div>

            <div className="space-y-3.5">
              {/* Signed Lease Agreement check */}
              {student.leaseAgreement && student.leaseAgreement.status === 'signed' && (
                <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-r from-indigo-50/10 to-transparent dark:from-indigo-950/5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b pb-1.5 dark:border-indigo-950/30">
                    <span className="flex items-center gap-1.5 font-extrabold text-indigo-600 dark:text-indigo-400 text-xs">
                      <FileText className="w-4 h-4 shrink-0" />
                      Digital Lease Agreement
                    </span>
                    <span className="text-[9px] bg-indigo-600 text-white dark:bg-indigo-900 px-2 py-0.25 rounded font-extrabold uppercase">
                      Signed
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 space-y-1">
                    <p>Signature: <span className="font-bold text-zinc-700 dark:text-zinc-300">{student.leaseAgreement.signatureName}</span></p>
                    <p>Signed At: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{new Date(student.leaseAgreement.signedAt).toLocaleString(undefined, { dateStyle: 'medium' })}</span></p>
                  </div>

                  <div className="pt-1.5 flex items-center justify-between border-t border-indigo-100 dark:border-indigo-950/30">
                    <a 
                      href={student.leaseAgreement.documentUrl || '#'} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Download Signed PDF Contract
                    </a>
                  </div>
                  
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 italic mt-1 leading-normal border-t border-dashed pt-1.5 dark:border-indigo-950/20">
                    * standard residential license contract. HostelCare is fully indemnified.
                  </p>
                </div>
              )}

              {documents.length === 0 && (!student.leaseAgreement || student.leaseAgreement.status !== 'signed') ? (
                <p className="text-xs text-zinc-400 italic text-center py-2">No documents uploaded yet.</p>
              ) : (
                documents.map((doc: any) => (
                  <div key={doc._id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-neutral-50 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950/40 text-xs font-sans">
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 truncate flex-1 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </a>
                    
                    <button 
                      onClick={() => handleDeleteDoc(doc._id)}
                      className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Custom file uploader button */}
            <div className="pt-2 border-t">
              <label className="flex items-center justify-center gap-2 w-full py-2 px-3 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer bg-white dark:bg-zinc-950 transition-all duration-200">
                <Plus className="w-4 h-4" />
                <span>Upload Document</span>
                <input 
                  type="file" 
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </Card>
        </div>

        {/* Right Side: Payment History Timeline & Visitor Logs */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-base">Payment & Rent Ledger</h3>
                <span className="text-xs bg-indigo-50 text-indigo-600 dark:bg-zinc-800 dark:text-indigo-400 px-2 py-0.5 rounded font-semibold">
                  {payments.length} Transactions
                </span>
              </div>

              {/* Timeline list */}
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <div className="text-center py-12 text-sm text-zinc-500">
                    No transactions recorded for this resident.
                  </div>
                ) : (
                  payments.map((p) => (
                    <div 
                      key={p._id} 
                      className="p-4 rounded-xl border border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/50 hover:bg-neutral-50 dark:hover:bg-zinc-900 flex items-center justify-between gap-4 transition group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                          <IndianRupee className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                              ₹{p.amount?.toLocaleString()}
                            </span>
                            <span className="px-2 py-0.25 text-[10px] font-bold rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">
                              {p.type}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              ({p.paymentMethod || 'cash'})
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            {new Date(p.date || p.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDownloadReceipt(p)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1.5 h-8 font-medium text-xs dark:border-zinc-800 dark:hover:bg-zinc-800"
                      >
                        <Download className="w-3.5 h-3.5" /> Receipt
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Visitor Log Registry */}
          <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-base">Visitor Logs</h3>
              </div>
              <Button
                onClick={() => setIsVisitorOpen(true)}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Log Guest Entry
              </Button>
            </div>

            <div className="space-y-3.5">
              {visitorLogs.length === 0 ? (
                <p className="text-xs text-zinc-400 italic text-center py-6 bg-neutral-50/50 dark:bg-zinc-900/50 rounded-xl border border-neutral-100 dark:border-zinc-800">
                  No visitors have checked in for this resident.
                </p>
              ) : (
                visitorLogs.map((log) => {
                  const isActive = !log.checkOut;
                  return (
                    <div 
                      key={log._id} 
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                        isActive 
                          ? 'border-indigo-100 dark:border-indigo-900 bg-indigo-50/10 dark:bg-indigo-950/5' 
                          : 'border-neutral-100 dark:border-zinc-800 bg-neutral-50/30 dark:bg-zinc-900/10'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{log.name}</span>
                          <span className="text-[10px] bg-zinc-150 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.25 rounded font-bold uppercase">
                            {log.relation}
                          </span>
                          {isActive && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-2 rounded-full font-bold uppercase tracking-wider">
                              In Hostel
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 dark:text-zinc-500 space-y-0.5">
                          <p>Contact: <span className="font-medium text-zinc-600 dark:text-zinc-300">{log.contactNumber}</span> &bull; Purpose: <span className="font-medium text-zinc-600 dark:text-zinc-300">{log.purpose}</span></p>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            <span>In: {new Date(log.checkIn).toLocaleString()}</span>
                            {log.checkOut && (
                              <>
                                <span className="mx-1">&bull;</span>
                                <span>Out: {new Date(log.checkOut).toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <Button
                          onClick={() => handleVisitorCheckOut(log._id)}
                          disabled={visitorCheckOutLoadingId === log._id}
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-bold border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 shrink-0 flex items-center gap-1"
                        >
                          {visitorCheckOutLoadingId === log._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Check Out
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Log Visitor Entry Dialog */}
      <Dialog open={isVisitorOpen} onOpenChange={setIsVisitorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Log Guest Check-In
            </DialogTitle>
            <DialogDescription>
              Record the visitor details for security gate check-in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVisitorCheckIn} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="visitor-name" className="text-xs font-semibold text-zinc-500 uppercase">Guest Name</Label>
                <Input 
                  id="visitor-name" 
                  value={visitorName} 
                  onChange={(e) => setVisitorName(e.target.value)} 
                  placeholder="e.g. Ramesh Kumar" 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="visitor-relation" className="text-xs font-semibold text-zinc-500 uppercase">Relationship</Label>
                <Input 
                  id="visitor-relation" 
                  value={visitorRelation} 
                  onChange={(e) => setVisitorRelation(e.target.value)} 
                  placeholder="e.g. Father, Friend" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="visitor-contact" className="text-xs font-semibold text-zinc-500 uppercase">Contact Number</Label>
              <Input 
                id="visitor-contact" 
                value={visitorContact} 
                onChange={(e) => setVisitorContact(e.target.value)} 
                placeholder="e.g. 9876543210" 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="visitor-purpose" className="text-xs font-semibold text-zinc-500 uppercase">Purpose of Visit</Label>
              <textarea
                id="visitor-purpose"
                value={visitorPurpose}
                onChange={(e) => setVisitorPurpose(e.target.value)}
                rows={3}
                placeholder="Brief reason for guest entry..."
                required
                className="w-full p-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 dark:text-zinc-100 resize-none leading-relaxed"
              />
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setIsVisitorOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={visitorLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {visitorLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Check In Guest
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Collect Rent Dialog Integration */}
      <RentCollectionDialog
        open={isCollectRentOpen}
        onOpenChange={setIsCollectRentOpen}
        selectedStudents={[student]}
        onSuccess={handleRefreshData}
      />
    </div>
  );
}
