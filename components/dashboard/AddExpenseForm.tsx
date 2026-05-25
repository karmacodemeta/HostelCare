'use client';

import { useActionState } from 'react';
import { addExpense, getCategories } from '@/app/actions/expense';
import { useFormStatus } from 'react-dom';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getBranches } from '@/app/actions/branch';
import { Building2, ChevronDown, Tag } from 'lucide-react';
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
        "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
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

  const inputClasses = "mt-1 block w-full rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all";

  return (
    <Card className="mb-8">
      <form action={formAction} className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Log New Expense</h3>
        </div>
        
        {state?.message && (
          <div className={cn(
            "p-3 rounded-xl text-sm font-medium",
            state.success 
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {state.message}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
             <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Branch</label>
             <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <select name="branchId" className={cn(inputClasses, "pl-10 pr-10 appearance-none cursor-pointer")} disabled={branches.length === 0}>
                    {branches.length === 0 ? (
                        <option value="">Default - All Branch</option>
                    ) : (
                        branches.map(b => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                        ))
                    )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
             </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</label>
                <CategoryManager onUpdate={fetchData} />
            </div>
            <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <select name="category" required className={cn(inputClasses, "pl-10 pr-10 appearance-none cursor-pointer")}>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Amount (₹)</label>
            <input type="number" name="amount" required className={inputClasses} placeholder="1000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Date</label>
            <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className={inputClasses} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Description</label>
            <input type="text" name="description" className={inputClasses} placeholder="Optional details..." />
          </div>
        </div>

        <SubmitButton />
      </form>
    </Card>
  );
}
