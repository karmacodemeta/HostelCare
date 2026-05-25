'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { UserPlus, CreditCard, Utensils, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    {
      title: "Onboard Student",
      description: "Register a new resident and assign rooms",
      href: "/students/add",
      icon: <UserPlus className="w-5 h-5" />,
      color: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/40"
    },
    {
      title: "Record Expense",
      description: "Log bills, salaries, repairs, and food costs",
      href: "/expenses",
      icon: <CreditCard className="w-5 h-5" />,
      color: "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40"
    },
    {
      title: "Manage Food Menu",
      description: "Update breakfast, lunch, and dinner menus",
      href: "/food",
      icon: <Utensils className="w-5 h-5" />,
      color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40"
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm tracking-wider uppercase">Quick Actions</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {actions.map((action, i) => (
          <Link key={i} href={action.href} className="block group">
            <Card className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 group-hover:-translate-y-0.5 duration-200">
              <div className={`p-3 rounded-lg ${action.color} transition-colors flex-shrink-0`}>
                {action.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-1">
                  {action.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
