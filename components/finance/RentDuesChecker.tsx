'use client';

import { useState } from 'react';
import { generateMonthlyDues } from '@/app/actions/finance';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RentDuesChecker() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleCheck = async () => {
        setLoading(true);
        setMessage('');
        try {
            const result = await generateMonthlyDues();
            setMessage(result.message);
            
            // Clear message after 5 seconds
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            setMessage('Error checking dues.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
             {message && (
                <span className={cn(
                    "text-sm font-medium animate-in fade-in slide-in-from-right-4",
                    message.includes('No pending') ? "text-zinc-500" : "text-green-600"
                )}>
                    {message}
                </span>
            )}
            <button
                onClick={handleCheck}
                disabled={loading}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all",
                    loading && "opacity-70 cursor-wait"
                )}
                title="Check for monthly rent updates"
            >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                Check Rent Dues
            </button>
        </div>
    );
}
