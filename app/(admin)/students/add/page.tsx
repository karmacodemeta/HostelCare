'use client';

import React, { useState } from 'react';
import AddStudentForm from '@/components/dashboard/AddStudentForm';
import ExcelUploader from '@/components/students/ExcelUploader';
import { cn } from '@/lib/utils';

export default function AddStudentPage() {
  const [mode, setMode] = useState<'manual' | 'bulk'>('manual');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Add Student</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Onboard new residents to the hostel.</p>
        </div>
        
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setMode('manual')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === 'manual' 
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            )}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === 'bulk' 
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            )}
          >
            Bulk Upload
          </button>
        </div>
      </div>

      {mode === 'manual' ? <AddStudentForm /> : <ExcelUploader />}
    </div>
  );
}
