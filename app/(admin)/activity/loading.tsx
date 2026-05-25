import React from 'react';

export default function ActivityLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header Loading Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-40 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        <div className="h-4 w-64 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap gap-3 items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl">
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
        <div className="h-10 w-28 bg-gray-200 dark:bg-zinc-800 rounded-md w-full md:w-auto"></div>
      </div>

      {/* Timeline List Skeleton */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 items-start relative">
            {/* Left dotted line spacer */}
            {i !== 5 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-100 dark:bg-zinc-800 -mb-6"></div>
            )}
            
            <div className="h-10 w-10 bg-gray-200 dark:bg-zinc-800 rounded-full flex-shrink-0 z-10"></div>
            
            <div className="flex-1 space-y-2 pt-1">
              <div className="flex justify-between items-start gap-4">
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800 rounded-md flex-shrink-0"></div>
              </div>
              <div className="h-3 w-2/3 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
              
              {/* Optional sub-card placeholder for changes */}
              {i % 2 === 0 && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-zinc-800/30 rounded-md space-y-1">
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
                  <div className="h-3 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
