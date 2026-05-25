'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Building2, ChevronDown, Loader2 } from 'lucide-react';
import { setActiveBranch } from '@/app/actions/branch';
import { cn } from '@/lib/utils';
import { getBranches } from '@/app/actions/branch';
import { CreateBranchDialog } from './CreateBranchDialog';
import { EditBranchDialog } from './EditBranchDialog';

interface Branch {
    _id: string;
    name: string;
    address?: string;
    managerName?: string;
}

export function BranchSelector({ className }: { className?: string }) {
    const router = useRouter();
    const pathname = usePathname(); // Added
    const searchParams = useSearchParams();
    const currentBranchId = searchParams.get('branch');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Hide BranchSelector on detail pages (e.g. /students/123)
    // Logic: If it starts with /students/ but creates more segments than just /students
    // OR if it is the Activity page
    const shouldHide = (pathname.startsWith('/students/') && pathname.split('/').length > 2) || pathname === '/activity';




    useEffect(() => {
        const fetchBranches = async () => {
            const data = await getBranches();
            setBranches(data);
        };
        fetchBranches();

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            // Check if the click is inside a dialog or portal
            const isInsideDialog = target.closest('[role="dialog"]') || target.closest('[data-radix-portal]');
            
            if (dropdownRef.current && !dropdownRef.current.contains(target as Node) && !isInsideDialog) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

// ... (in component)
    const [isPending, startTransition] = useTransition();

// ...
    const handleSelect = (branchId: string | null) => {
        startTransition(async () => {
            // 1. Update Cookie
            await setActiveBranch(branchId);

            // 2. Update URL (Optional if all pages read cookies, but good for deep linking)
            const params = new URLSearchParams(searchParams.toString());
            if (branchId) {
                params.set('branch', branchId);
            } else {
                params.delete('branch');
            }
            
            // 3. Navigate/Refresh
            // We use replace to not clutter history, and refresh to ensure server components re-run with new cookie
            router.replace(`${pathname}?${params.toString()}`);
            router.refresh(); 
            
            setIsOpen(false);
        });
    };

    const handleBranchCreated = () => {
        const fetchBranches = async () => {
            const data = await getBranches();
            setBranches(data);
        };
        fetchBranches();
        setIsOpen(false);
    };

    const handleBranchUpdated = () => {
        const fetchBranches = async () => {
            const data = await getBranches();
            setBranches(data);
        };
        fetchBranches();
    };

    const currentBranchName = branches.find(b => b._id === currentBranchId)?.name || 'All Branches';
    
    if (shouldHide) return null;

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className="branch-selector-trigger flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> : <Building2 className="w-4 h-4 text-zinc-500" />}
                <span>{currentBranchName}</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                        <button
                            onClick={() => handleSelect(null)}
                            className={cn(
                                "w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700",
                                !currentBranchId ? "text-blue-600 font-medium" : "text-zinc-700 dark:text-zinc-300"
                            )}
                        >
                            All Branches
                        </button>
                        {branches.length === 0 && (
                            <div className="px-4 py-3 text-xs text-zinc-400 text-center italic">
                                No branches created yet.
                            </div>
                        )}
                        {branches.map(branch => (
                            <div key={branch._id} className="group flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700 pr-2">
                                <button
                                    onClick={() => handleSelect(branch._id)}
                                    className={cn(
                                        "flex-1 text-left px-4 py-2 text-sm",
                                        currentBranchId === branch._id ? "text-blue-600 font-medium" : "text-zinc-700 dark:text-zinc-300"
                                    )}
                                >
                                    {branch.name}
                                </button>
                                <EditBranchDialog branch={branch} onBranchUpdated={handleBranchUpdated} />
                            </div>
                        ))}
                    </div>
                    <CreateBranchDialog onBranchCreated={handleBranchCreated} />
                </div>
            )}
        </div>
    );
}
