import React from 'react';

export default function StudentsLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header & Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-4 w-56 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-10 w-28 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl">
        <div className="h-10 w-72 bg-gray-200 dark:bg-zinc-800 rounded-md w-full md:w-72"></div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="h-10 w-24 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="grid grid-cols-6 gap-4">
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-24"></div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-16"></div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-20"></div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-24"></div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-16"></div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-12 justify-self-end"></div>
          </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-6 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-12"></div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-16"></div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-20"></div>
                <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-14"></div>
                <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-8 justify-self-end"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
