'use client';
// src/components/admin/AdminGuard.tsx
// ============================================================
// Route Guard for all /admin/* pages.
// 
// Behaviour:
//  - While auth state loads    → show full-page loading spinner
//  - Not logged in             → redirect to /admin/login
//  - Logged in but NOT admin   → show "Access Denied" page
//  - Logged in and IS admin    → render children normally
// ============================================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FaLock, FaSpinner } from 'react-icons/fa';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Not logged in → go to login page
      router.replace('/admin/login');
    }
  }, [loading, user, router]);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Verifying access…</p>
        </div>
      </div>
    );
  }

  // ── Not logged in (redirect is firing via useEffect) ───────
  if (!user) return null;

  // ── Logged in but not admin ────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaLock className="text-red-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-500 mb-6">
            Your account does not have administrator privileges.
            Please contact the site owner to get access.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // ── Admin authenticated ────────────────────────────────────
  return <>{children}</>;
}
