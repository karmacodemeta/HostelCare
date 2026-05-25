'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building2, MapPin, User } from 'lucide-react';
import { createBranch } from '@/app/actions/branch';
import { cn } from '@/lib/utils';

export function CreateBranchDialog({ onBranchCreated }: { onBranchCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const address = formData.get('address') as string;
        const managerName = formData.get('managerName') as string;

        const result = await createBranch(name, address, managerName);

        if (result.success) {
            setOpen(false);
            if (onBranchCreated) onBranchCreated();
        } else {
            setError(typeof result.error === 'string' ? result.error : 'Failed to create branch');
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t border-zinc-100 dark:border-zinc-800">
                    <Plus className="w-4 h-4" />
                    <span>Add New Branch</span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-zinc-900 dark:text-zinc-100">Create New Branch</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Branch Name
                        </label>
                        <input 
                            name="name" 
                            required 
                            placeholder="e.g. Downtown Campus"
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Address
                        </label>
                        <input 
                            name="address" 
                            placeholder="e.g. 123 Main St"
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            <User className="w-4 h-4" /> Manager Name
                        </label>
                        <input 
                            name="managerName" 
                            placeholder="e.g. Jane Doe"
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Branch'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
