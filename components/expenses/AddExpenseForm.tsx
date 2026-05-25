'use client';

import { useActionState } from 'react';
import { addExpense, getCategories } from '@/app/actions/expense';
import { useFormStatus } from 'react-dom';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getBranches } from '@/app/actions/branch';
import { Building2, ChevronDown, Tag, Plus, Receipt, X } from 'lucide-react';
import { CategoryManager } from '@/components/expenses/CategoryManager';

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
        "w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200",
        "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-lg hover:shadow-xl",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      {pending ? 'Adding...' : 'Add Expense'}
    </button>
  );
}

export default function AddExpenseForm() {
  const [state, formAction, isPending] = useActionState(addExpense, initialState);
  const [branches, setBranches] = useState<{_id: string, name: string}[]>([]);
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Collapsible State

  const fetchData = async () => {
      const [branchData, categoryData] = await Promise.all([
          getBranches(),
          getCategories()
      ]);
      setBranches(branchData);
      setCategories(categoryData as unknown as {_id: string, name: string}[]);
  };

  useEffect(() => {
      fetchData();
  }, []);

  const inputClasses = "mt-1 block w-full rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-3 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all shadow-sm";
  const labelClasses = "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1";

  if (!isOpen) {
     return (
        <button 
            onClick={() => setIsOpen(true)}
            className="w-full py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all bg-zinc-50/50 dark:bg-zinc-900/20 group"
        >
            <div className="flex items-center gap-2 font-medium">
                <span className="p-1 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-colors">
                    <Plus className="w-4 h-4" />
                </span>
                Log New Expense
            </div>
        </button>
     );
  }

  return (
    <Card className="mb-8 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-zinc-50/50 dark:bg-zinc-900/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
         <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                <Receipt className="w-4 h-4" />
            </span>
            New Expense
         </h3>
         <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <X className="w-5 h-5" />
         </button>
      </div>

      <div className="p-6">
        <form action={formAction} className="space-y-8">
            {state?.message && (
            <div className={cn(
                "p-4 rounded-xl text-sm font-medium flex items-center gap-2",
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
                    <label className={labelClasses}>Branch</label>
                    <div className="relative group">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors pointer-events-none" />
                        <select name="branchId" className={cn(inputClasses, "pl-10 pr-10 appearance-none cursor-pointer")} disabled={branches.length === 0}>
                            {branches.length === 0 ? (
                                <option value="">Default - All Branch</option>
                            ) : (
                                branches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))
                            )}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                {/* Amount & Date */}
                <div>
                    <label className={labelClasses}>Amount</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold pointer-events-none">₹</span>
                        <input type="number" name="amount" required className={cn(inputClasses, "pl-8 text-lg font-semibold")} placeholder="0.00" />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Date</label>
                     <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className={inputClasses} />
                </div>

                {/* Category */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Category</label>
                        <CategoryManager onUpdate={fetchData} />
                    </div>
                    <div className="relative group">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors pointer-events-none" />
                        <select name="category" required className={cn(inputClasses, "pl-10 pr-10 appearance-none cursor-pointer")}>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className={labelClasses}>Description</label>
                    <input type="text" name="description" className={inputClasses} placeholder="What was this for?" />
                </div>
            </div>

            <div className="pt-2">
                <SubmitButton />
            </div>
        </form>
      </div>
    </Card>
  );
}
