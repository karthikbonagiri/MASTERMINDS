// src/app/not-found.tsx
// Global 404 page for all unmatched routes.
import Link from 'next/link';
import { FaGraduationCap, FaHome, FaBriefcase, FaClipboardList } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800
                    flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
        <FaGraduationCap className="text-white text-4xl" />
      </div>

      {/* Error code */}
      <p className="text-9xl font-display font-black text-white/10 select-none leading-none mb-0">
        404
      </p>
      <h1 className="text-2xl font-display font-bold text-white mt-2 mb-3">
        Page Not Found
      </h1>
      <p className="text-blue-200 text-sm max-w-sm mb-10 leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
        Head back to one of our main sections below.
      </p>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <Link href="/" className="flex items-center gap-2 bg-white text-blue-800 font-semibold
                                   px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
          <FaHome size={14} /> Home
        </Link>
        <Link href="/jobs" className="flex items-center gap-2 bg-white/15 text-white font-medium
                                       px-5 py-2.5 rounded-xl hover:bg-white/25 transition-colors backdrop-blur-sm">
          <FaBriefcase size={14} /> Jobs
        </Link>
        <Link href="/tests" className="flex items-center gap-2 bg-white/15 text-white font-medium
                                        px-5 py-2.5 rounded-xl hover:bg-white/25 transition-colors backdrop-blur-sm">
          <FaClipboardList size={14} /> Mock Tests
        </Link>
      </div>

      <p className="text-blue-400 text-xs">
        MasterMinds – The Learning Hub
      </p>
    </div>
  );
}
