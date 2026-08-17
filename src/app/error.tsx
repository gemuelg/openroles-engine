'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Unhandled Root Error:', error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full border border-gray-200 rounded-xl p-8 bg-white shadow-sm text-center">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          !
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        
        <p className="text-sm text-gray-600 mb-6">
          An unexpected error occurred while fetching system data. Please try again or return to the directory.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}