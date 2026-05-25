import React from 'react';

export default function FoodLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header Loading Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-36 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-4 w-52 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
        <div className="h-10 w-44 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
      </div>

      {/* Week selection buttons */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-800/50 rounded-lg w-fit">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        ))}
      </div>

      {/* Grid of days */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="p-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-4">
            <div className="h-5 w-24 bg-gray-200 dark:bg-zinc-800 rounded-md border-b pb-2"></div>
            
            {[...Array(4)].map((_, j) => (
              <div key={j} className="space-y-1">
                <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
