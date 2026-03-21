'use client';
// src/components/admin/AdminSidebar.tsx
// ============================================================
// Persistent sidebar for all admin pages.
// Collapses to a slide-out drawer on mobile.
// ============================================================

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import {
  FaGraduationCap, FaHome, FaBriefcase, FaClipboardList,
  FaBook, FaNewspaper, FaGlobe, FaCreditCard, FaCog,
  FaSignOutAlt, FaBars, FaTimes, FaChevronRight,
} from 'react-icons/fa';

const NAV_ITEMS = [
  { href: '/admin/dashboard',      label: 'Dashboard',        icon: FaHome,          color: 'text-blue-500' },
  { href: '/admin/jobs',           label: 'Job Notifications', icon: FaBriefcase,     color: 'text-orange-500' },
  { href: '/admin/tests',          label: 'Mock Tests',        icon: FaClipboardList, color: 'text-purple-500' },
  { href: '/admin/materials',      label: 'Study Materials',   icon: FaBook,          color: 'text-emerald-500' },
  { href: '/admin/articles',       label: 'Education Info',    icon: FaNewspaper,     color: 'text-pink-500' },
  { href: '/admin/current-affairs',label: 'Current Affairs',   icon: FaGlobe,         color: 'text-cyan-500' },
  { href: '/admin/payments',       label: 'Payments',          icon: FaCreditCard,    color: 'text-yellow-500' },
  { href: '/admin/settings',       label: 'Settings',          icon: FaCog,           color: 'text-gray-500' },
];

// ─── Sidebar content (shared between desktop + mobile) ───────
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { signOut, adminData } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    router.replace('/admin/login');
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-sm">
            <FaGraduationCap className="text-white text-lg" />
          </div>
          <div>
            <p className="font-display font-bold text-gray-900 text-sm leading-tight">MasterMinds</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
        {/* Mobile close */}
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <FaTimes size={16} />
          </button>
        )}
      </div>

      {/* Admin info */}
      <div className="mx-4 mt-4 p-3 bg-blue-50 rounded-xl">
        <p className="text-xs text-gray-500 mb-0.5">Signed in as</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{adminData?.email ?? 'Admin'}</p>
        <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          Administrator
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Icon className={`text-base flex-shrink-0 ${active ? 'text-white' : color}`} />
              <span className="flex-1">{label}</span>
              {active && <FaChevronRight className="text-xs opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5 mt-4 border-t border-gray-100 pt-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-red-600 hover:bg-red-50 transition-all duration-150"
        >
          <FaSignOutAlt className="text-base" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────
export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ lg) ────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <FaGraduationCap className="text-white text-sm" />
          </div>
          <span className="font-display font-bold text-gray-900 text-sm">
            Master<span className="text-blue-600">Minds</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <FaBars size={18} />
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col animate-slide-up">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
