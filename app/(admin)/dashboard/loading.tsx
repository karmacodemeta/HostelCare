import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header Loading Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
        <div className="h-10 w-36 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
            <div className="h-3 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Grid of charts and tables */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-[300px] w-full bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-[300px] w-full bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
      </div>

      {/* Recent Activity Table Skeleton */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-4">
        <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-10 w-10 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
