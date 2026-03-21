'use client';
// src/components/public/Navbar.tsx

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaGraduationCap } from 'react-icons/fa';

const NAV_LINKS = [
  { href: '/',          label: 'Home'            },
  { href: '/jobs',      label: 'Jobs'            },
  { href: '/tests',     label: 'Mock Tests'      },
  { href: '/materials', label: 'Study Materials' },
  { href: '/news',      label: 'News & Articles' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <FaGraduationCap className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">
              Master<span className="text-blue-600">Minds</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150
                  ${isActive(link.href)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Admin link */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin/dashboard" className="btn-primary text-sm px-4 py-2">
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {open ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${isActive(link.href)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-blue-600 rounded-lg bg-blue-50 mt-2"
            >
              Admin Dashboard →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
