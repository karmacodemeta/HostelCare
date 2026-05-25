'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Receipt, LogOut, Menu, X, Activity, Utensils, HelpCircle, Settings, ClipboardList, Megaphone, Home, Calendar, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { BranchSelector } from '@/components/branch/BranchSelector';
import { SignOutButton } from '@/components/SignOutButton';
import OnboardingTour from '@/components/dashboard/OnboardingTour';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/students', icon: Users },
    { label: 'Rooms Map', href: '/rooms', icon: Home },
    { label: 'Expenses', href: '/expenses', icon: Receipt },
    { label: 'Food Menu', href: '/food', icon: Utensils },
    { label: 'Notices', href: '/notices', icon: Megaphone },
    { label: 'Leave Board', href: '/leaves', icon: Calendar },
    { label: 'KYC Verify', href: '/kyc', icon: ShieldCheck },
    { label: 'Tickets', href: '/complaints', icon: ClipboardList },
    { label: 'Activity', href: '/activity', icon: Activity },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-50 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            HostelCare
          </h1>
          <ThemeToggle />
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
           {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const idString = `sidebar-nav-${item.href.replace('/', '')}`;
              return (
                <Link
                  key={item.href}
                  id={idString}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 dark:bg-white dark:text-zinc-900" 
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white dark:text-zinc-900" : "text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300")} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Quick Guide Trigger Button */}
            <button
              id="sidebar-nav-guide"
              onClick={() => window.dispatchEvent(new CustomEvent('hostelcare:start-tour'))}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 group cursor-pointer text-left"
            >
              <HelpCircle className="w-5 h-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300" />
              <span className="font-medium">Quick Guide</span>
            </button>
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
                <SignOutButton />
            </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">HostelCare</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            <Menu className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className={cn(
        "md:pl-64 min-h-screen transition-all duration-300",
        isMobileMenuOpen ? "blur-sm md:blur-none" : ""
      )}>
        <div className="p-4 md:p-8 pt-20 md:pt-8 pb-32 md:pb-8 max-w-7xl mx-auto space-y-8">
            {/* Top Bar with Branch Selector */}
            <div className="flex justify-end mb-4">
                <React.Suspense fallback={<div className="w-32 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />}>
                    <BranchSelector />
                </React.Suspense>
            </div>
            {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-zinc-900 shadow-2xl z-50 md:hidden border-l border-zinc-200 dark:border-zinc-800"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Menu</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                    <X className="w-6 h-6 text-zinc-500" />
                  </button>
                </div>
                
                <div className="space-y-1 flex-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                          isActive 
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium" 
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500")} />
                        {item.label}
                      </Link>
                    );
                  })}

                  {/* Mobile Quick Guide Trigger Button */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('hostelcare:start-tour'));
                      }, 100);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-left"
                  >
                    <HelpCircle className="w-5 h-5 text-zinc-500" />
                    <span className="font-medium">Quick Guide</span>
                  </button>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
                        <SignOutButton />
                    </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Onboarding Tour Component */}
      <OnboardingTour />
    </div>
  );
}
