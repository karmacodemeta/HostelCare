import React from 'react';
import { Card } from '@/components/ui/card';
import { BedDouble, Home, HelpCircle } from 'lucide-react';

interface OccupancyCardProps {
  totalStudents: number;
  capacity: number;
  totalRooms: number;
}

export default function OccupancyCard({ totalStudents, capacity, totalRooms }: OccupancyCardProps) {
  // Compute occupancy percentage
  const cap = capacity || totalStudents || 10;
  const occupancyPercentage = Math.min(100, Math.round((totalStudents / cap) * 100));

  let statusColor = 'bg-emerald-500';
  let textColor = 'text-emerald-600 dark:text-emerald-400';
  if (occupancyPercentage > 85) {
    statusColor = 'bg-red-500';
    textColor = 'text-red-600 dark:text-red-400';
  } else if (occupancyPercentage > 60) {
    statusColor = 'bg-indigo-500';
    textColor = 'text-indigo-600 dark:text-indigo-400';
  }

  return (
    <Card className="p-6 flex flex-col justify-between shadow-sm border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Occupancy Rate</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total capacity utilization</p>
        </div>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <BedDouble className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress Bar & Percentage */}
        <div className="flex items-baseline justify-between">
          <span className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {occupancyPercentage}%
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-zinc-800 ${textColor}`}>
            {occupancyPercentage >= 90 ? 'Near Capacity' : occupancyPercentage >= 60 ? 'Optimal' : 'Low Occupancy'}
          </span>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-zinc-800/80">
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" /> Beds Allocated
            </span>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {totalStudents} <span className="font-normal text-xs text-zinc-500">/ {capacity}</span>
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Active Rooms
            </span>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {totalRooms} <span className="font-normal text-xs text-zinc-500">Rooms</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
