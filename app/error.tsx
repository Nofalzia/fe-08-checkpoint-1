'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging and monitoring
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6 text-center">
      <div className="p-4 bg-red-500/10 text-red-500 rounded-full mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold mb-2 text-white">Something went wrong</h1>
      <p className="text-sm text-zinc-400 max-w-sm mb-8 leading-relaxed">
        {error.message || 'An unexpected error occurred. Please try again.'}
        {error.digest && <span className="block text-xs mt-2 text-zinc-500">Error ID: {error.digest}</span>}
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}