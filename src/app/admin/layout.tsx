// src/app/admin/layout.tsx
// ============================================================
// Admin Layout
// Wraps every page under /admin/* EXCEPT /admin/login.
// - AdminGuard enforces authentication + role check
// - AdminSidebar renders the persistent navigation
// ============================================================

import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Admin – MasterMinds',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        {/* Persistent sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        {/* pt-14 on mobile accounts for the fixed top bar; lg:pt-0 resets it */}
        <main className="flex-1 pt-14 lg:pt-0 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
