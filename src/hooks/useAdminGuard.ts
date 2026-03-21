'use client';
// src/hooks/useAdminGuard.ts
// ============================================================
// Convenience hook to redirect non-admins from admin pages.
// Use inside any page component as an alternative to AdminGuard.
//
// Usage:
//   const { ready } = useAdminGuard();
//   if (!ready) return null; // renders nothing while checking
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function useAdminGuard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/admin/login');
    } else if (!isAdmin) {
      // Logged in but not admin — stay on page but AdminGuard will show Access Denied
      setReady(true);
    } else {
      setReady(true);
    }
  }, [loading, user, isAdmin, router]);

  return { ready, isAdmin, loading };
}
