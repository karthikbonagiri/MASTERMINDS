'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/dashboard/page.tsx
// ============================================================
// Admin Dashboard Overview
// Shows quick stats pulled from Firestore.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import {
  FaBriefcase, FaClipboardList, FaBook,
  FaRupeeSign, FaPlus, FaSpinner,
} from 'react-icons/fa';

interface Stats {
  totalJobs: number;
  totalTests: number;
  totalMaterials: number;
  totalRevenue: number;
  totalPurchases: number;
}

// ─── Stat card component ──────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color, href,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  href: string;
}) {
  return (
    <Link href={href} className="card p-6 flex items-center gap-5 group hover:border-blue-100">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
        <Icon className="text-white text-2xl" />
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 font-display">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

// ─── Quick action card ────────────────────────────────────────
function QuickAction({ label, href, color }: { label: string; href: string; color: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium ${color}
                  hover:opacity-90 transition-opacity shadow-sm`}
    >
      <FaPlus size={12} />
      {label}
    </Link>
  );
}

export default function DashboardPage() {
  const { adminData } = useAuth();
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Welcome back, {adminData?.email?.split('@')[0] ?? 'Admin'} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here's what's happening on your platform today.
        </p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 h-28 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Jobs"
            value={stats?.totalJobs ?? 0}
            icon={FaBriefcase}
            color="bg-gradient-to-br from-orange-400 to-orange-600"
            href="/admin/jobs"
          />
          <StatCard
            label="Mock Tests"
            value={stats?.totalTests ?? 0}
            icon={FaClipboardList}
            color="bg-gradient-to-br from-purple-400 to-purple-600"
            href="/admin/tests"
          />
          <StatCard
            label="Study Materials"
            value={stats?.totalMaterials ?? 0}
            icon={FaBook}
            color="bg-gradient-to-br from-emerald-400 to-emerald-600"
            href="/admin/materials"
          />
          <StatCard
            label="Total Revenue"
            value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
            icon={FaRupeeSign}
            color="bg-gradient-to-br from-blue-400 to-blue-600"
            href="/admin/payments"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <QuickAction label="Add Job"         href="/admin/jobs/new"      color="bg-orange-500" />
          <QuickAction label="Create Test"     href="/admin/tests/new"     color="bg-purple-500" />
          <QuickAction label="Upload Material" href="/admin/materials/new" color="bg-emerald-500" />
          <QuickAction label="Write Article"   href="/admin/articles/new"  color="bg-pink-500" />
        </div>
      </div>

      {/* Firestore rules reminder */}
      <div className="card p-6 border-l-4 border-blue-500">
        <h2 className="font-semibold text-gray-900 mb-2">⚡ Setup Reminder</h2>
        <p className="text-sm text-gray-600 mb-3">
          Don't forget to deploy Firestore security rules and create your first admin user.
          See <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">firestore.rules</code> in the project root.
        </p>
        <Link href="/admin/settings" className="text-sm text-blue-600 hover:underline font-medium">
          Go to Settings →
        </Link>
      </div>
    </div>
  );
}
