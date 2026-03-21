'use client';
// src/app/error.tsx
// Catches unhandled runtime errors and shows a friendly message.
import { useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-5">
        <FaExclamationTriangle className="text-red-500 text-3xl" />
      </div>
      <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        An unexpected error occurred. Please try again, or contact support if the problem persists.
      </p>
      <button
        onClick={reset}
        className="btn-primary"
      >
        Try Again
      </button>
    </div>
  );
}
