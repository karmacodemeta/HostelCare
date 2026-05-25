'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { IndianRupee, User, ArrowRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface StudentDues {
  _id: string;
  name: string;
  roomNo: string;
  dues: number;
  contactNumber?: string;
}

interface PendingDuesWidgetProps {
  students: StudentDues[];
}

export default function PendingDuesWidget({ students }: PendingDuesWidgetProps) {
  return (
    <Card className="p-6 flex flex-col justify-between shadow-sm border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Pending Dues</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">High-priority rent follow-ups</p>
        </div>
        <Link href="/students" className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
          All Students <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 divide-y divide-neutral-100 dark:divide-zinc-800/80">
        {students.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-zinc-500 py-8">
            All student accounts are cleared! 🎉
          </div>
        ) : (
          students.map((student) => (
            <div key={student._id} className="py-3 flex items-center justify-between gap-4 group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <Link 
                    href={`/students/${student._id}`}
                    className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                  >
                    {student.name}
                  </Link>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    Room {student.roomNo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-bold text-red-500">
                    ₹{student.dues?.toLocaleString()}
                  </span>
                </div>
                
                {student.contactNumber && (
                  <a 
                    href={`https://wa.me/91${student.contactNumber}?text=Hi%20${encodeURIComponent(student.name)},%20this%20is%20a%20friendly%20reminder%20regarding%20your%20pending%20hostel%20rent%20dues%20of%20INR%20${student.dues}.%20Please%20clear%20it%2520soon.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-md hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
