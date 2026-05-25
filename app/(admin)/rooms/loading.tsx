import React from 'react';

export default function RoomsLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header Loading Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-44 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-4 w-60 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-2">
            <div className="h-4 w-28 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
            <div className="h-7 w-20 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Grid of rooms */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="space-y-1">
                <div className="h-5 w-24 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
              </div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
            </div>

            <div className="space-y-3">
              <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-9 w-full bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="h-9 w-full bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
