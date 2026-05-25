'use client';

import { useActionState } from 'react';
import { addStudent } from '@/app/actions/student';
import { useFormStatus } from 'react-dom';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getBranches } from '@/app/actions/branch';
import { Building2, ChevronDown, User, Phone, MapPin, Calendar, IndianRupee, BedDouble, UserPlus } from 'lucide-react';
// import { VoiceInput } from '@/components/ui/VoiceInput'; // Disabled for now
import { useRouter } from 'next/navigation';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 mt-4",
        "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-lg hover:shadow-xl",
        "disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
      )}
    >
      {pending ? 'Onboarding Student...' : 'Complete Onboarding'}
    </button>
  );
}

export default function AddStudentForm() {
  const [state, formAction] = useActionState(addStudent, initialState);
  const [branches, setBranches] = useState<{_id: string, name: string}[]>([]);
  const router = useRouter();

  // Form State for Voice Filling
  const [formData, setFormData] = useState({
      name: '',
      contactNumber: '',
      roomNo: '',
      rent: '',
      guardian: '',
      guardianContact: '',
      address: '',
      advanceAmount: '0'
  });

  // Redirect on success
  useEffect(() => {
      if (state.success) {
          const timer = setTimeout(() => {
              router.push('/students');
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [state.success, router]);

  useEffect(() => {
      const fetchBranches = async () => {
          const data = await getBranches();
          setBranches(data);
      };
      fetchBranches();
  }, []);

  const handleVoiceFill = (data: any) => {
      console.log("Voice Data Received:", data);
      setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          contactNumber: data.contactNumber || prev.contactNumber,
          roomNo: data.roomNo || prev.roomNo,
          rent: data.rent || prev.rent,
          advanceAmount: data.advanceAmount || prev.advanceAmount,
          // If voice parser gets smart enough for others, add them here
      }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const inputClasses = "mt-1 block w-full rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all shadow-sm";
  const labelClasses = "block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <Card className="max-w-3xl mx-auto border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="bg-zinc-50/50 dark:bg-zinc-900/50 px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
             <h3 className="font-semibold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                    <UserPlus className="w-5 h-5" />
                </span>
                Student Registration
             </h3>
             <p className="text-sm text-zinc-500 mt-1 ml-12">Enter details or use voice commands.</p>
         </div>
         {/* Voice Input Component - Disabled for now */}
         {/* <VoiceInput onResult={handleVoiceFill} /> */}
      </div>

      <div className="p-8">
        <form action={formAction} className="space-y-8">
            {state?.message && (
            <div className={cn(
                "p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2",
                state.success 
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/30" 
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30"
            )}>
                {state.message}
            </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Branch Selection */}
                <div className="md:col-span-2">
                    <label className={labelClasses}>Allocated Branch</label>
                    <div className="relative group">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors pointer-events-none" />
                        <select name="branchId" className={cn(inputClasses, "pl-11 pr-10 appearance-none cursor-pointer")} disabled={branches.length === 0}>
                            {branches.length === 0 ? (
                                <option value="">Default - All Branch</option>
                            ) : (
                                <option value="">Select Branch</option>
                            )}
                            {branches.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div className="md:col-span-2 my-1 border-t border-zinc-100 dark:border-zinc-800" />
                
                {/* Personal Information Header */}
                <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" /> Personal Information
                    </h4>
                </div>

                {/* Student Name */}
                <div className="md:col-span-1">
                    <label className={labelClasses}>Full Name</label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            name="name" 
                            required 
                            className={cn(inputClasses, "pl-4 transition-all duration-500", formData.name ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200" : "")} 
                            placeholder="e.g. Rahul Kumar"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Student Phone */}
                <div>
                    <label className={labelClasses}>Phone Number</label>
                    <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                        <input 
                            type="tel" 
                            name="contactNumber" 
                            required 
                            className={cn(inputClasses, "pl-10 font-mono", formData.contactNumber ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200" : "")} 
                            placeholder="98765 43210"
                            value={formData.contactNumber}
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                <div className="md:col-span-2 my-1 border-t border-zinc-100 dark:border-zinc-800" />

                {/* Admission Info Header */}
                 <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-indigo-500" /> Accommodation Details
                    </h4>
                </div>

                {/* Room No */}
                <div>
                    <label className={labelClasses}>Room Number</label>
                    <div className="relative group">
                        <BedDouble className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                        <input 
                            type="text" 
                            name="roomNo" 
                            required 
                            className={cn(inputClasses, "pl-10 font-semibold", formData.roomNo ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200" : "")} 
                            placeholder="101" 
                            value={formData.roomNo}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Admission Date */}
                <div>
                    <label className={labelClasses}>Date of Admission</label>
                    <div className="relative group">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                        <input type="date" name="admissionDate" required defaultValue={new Date().toISOString().split('T')[0]} className={cn(inputClasses, "pl-10")} />
                    </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                    <label className={labelClasses}>Permanent Address</label>
                    <div className="relative group">
                        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                        <textarea 
                            name="address" 
                            required 
                            className={cn(inputClasses, "pl-10 min-h-[80px] resize-none leading-relaxed", formData.address ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200" : "")} 
                            placeholder="Permanent residence address..." 
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="md:col-span-2 my-1 border-t border-zinc-100 dark:border-zinc-800" />

                {/* Guardian Info Header */}
                <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <User className="w-4 h-4 text-orange-500" /> Guardian Information
                    </h4>
                </div>

                {/* Guardian Name */}
                <div className="md:col-span-1">
                    <label className={labelClasses}>Guardian Name</label>
                    <input 
                        type="text" 
                        name="guardian" 
                        required 
                        className={cn(inputClasses, formData.guardian ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200" : "")} 
                        placeholder="Parent/Guardian Name" 
                        value={formData.guardian}
                        onChange={handleChange}
                    />
                </div>

                {/* Guardian Phone */}
                <div>
                    <label className={labelClasses}>Guardian Contact</label>
                    <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                        <input 
                            type="tel" 
                            name="guardianContact" 
                            className={cn(inputClasses, "pl-10 font-mono", formData.guardianContact ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200" : "")} 
                            placeholder="Phone Number (Optional)" 
                            value={formData.guardianContact}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="md:col-span-2 my-1 border-t border-dashed border-zinc-200 dark:border-zinc-700" />

                {/* Financials Header */}
                 <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-green-500" /> Initial Payment
                    </h4>
                </div>

                {/* Monthly Rent */}
                <div>
                    <label className={labelClasses}>Monthly Rent</label>
                    <div className="relative group">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold group-focus-within:text-green-600 transition-colors">₹</span>
                        <input 
                            type="number" 
                            name="rent" 
                            required 
                            className={cn(inputClasses, "pl-8 font-semibold text-lg", formData.rent ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200" : "")} 
                            placeholder="5000" 
                            value={formData.rent}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Advance Amount */}
                <div>
                    <label className={labelClasses}>Advance Deposit</label>
                    <div className="relative group">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold group-focus-within:text-green-600 transition-colors">₹</span>
                        <input 
                            type="number" 
                            name="advanceAmount" 
                            required 
                            className={cn(inputClasses, "pl-8 font-semibold text-lg", formData.advanceAmount && formData.advanceAmount !== '0' ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200" : "")} 
                            placeholder="10000" 
                            value={formData.advanceAmount}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Hidden Dues */}
                <input type="hidden" name="dues" value="0" /> 
            </div>

            <SubmitButton />
        </form>
      </div>
    </Card>
  );
}
