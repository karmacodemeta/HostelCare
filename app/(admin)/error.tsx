'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin route error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="h-16 w-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center shadow-sm animate-bounce">
        <AlertTriangle className="h-8 w-8" />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          We encountered an unexpected error while loading this page. Our team has been notified.
        </p>
        {error.message && (
          <p className="text-xs font-mono p-3 bg-gray-50 dark:bg-zinc-800/40 rounded border border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 mt-2 break-all text-left">
            Error: {error.message}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/dashboard'}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
