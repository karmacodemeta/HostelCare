'use client';

import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 transition-colors duration-300">
            <main className="flex-1 flex items-center justify-center p-4">
                {children}
            </main>
            
            <footer className="py-6 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium">
                    Powered by <span className="text-zinc-900 dark:text-zinc-200 font-bold">KarmaCode Private Limited</span>
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                    &copy; {new Date().getFullYear()} HostelCare. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
