import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { BranchSelector } from '@/components/branch/BranchSelector';
import FoodMenuEditor from '@/components/food/FoodMenuEditor';
import { getMenu } from '@/app/actions/food';
import { getBranches } from '@/app/actions/branch';
import { Utensils } from 'lucide-react';

export default async function FoodPage({ searchParams }: { searchParams: Promise<{ branch: string }> }) {
    const session = await getSession();
    if (!session) redirect('/login');

    const params = await searchParams;
    const branches = await getBranches();
    
    // activeBranchId empty => Global Menu
    const activeBranchId = params.branch || undefined;

    // Fetch menu: Pass activeBranchId (if undefined, getMenu handles as global)
    // Note: getMenu now checks cookies internally, but we need the ID here for UI "Managing Menu for:"
    let effectiveBranchId = activeBranchId;
    if (!effectiveBranchId) {
         const { cookies } = await import('next/headers');
         const cookieStore = await cookies();
         const cookieBranch = cookieStore.get('hostel_active_branch');
         if (cookieBranch) effectiveBranchId = cookieBranch.value;
    }

    const currentBranch = branches.find((b: any) => b._id === effectiveBranchId);
    const initialMenu = await getMenu(activeBranchId); // passing null lets it find cookie inside

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Utensils className="w-8 h-8 text-orange-500" />
                        Food Menu
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Weekly meal plan for your students.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg w-fit text-sm text-zinc-600 dark:text-zinc-300">
                <span>Managing Menu for:</span>
                <span className={currentBranch ? "font-semibold text-zinc-900 dark:text-zinc-100" : "font-semibold text-blue-600 dark:text-blue-400"}>
                    {currentBranch?.name || 'All Branches (Default)'}
                </span>
            </div>

            <FoodMenuEditor key={effectiveBranchId || 'global'} initialMenu={initialMenu} branchId={effectiveBranchId || 'global'} />
        </div>
    );
}
