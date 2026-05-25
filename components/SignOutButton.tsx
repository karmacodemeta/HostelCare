'use client';

import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/logout';

export function SignOutButton() {
    return (
        <form action={logoutAction}>
            <button type="submit" className="text-sm text-zinc-500 hover:text-red-500 flex items-center gap-2 w-full">
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </form>
    );
}
