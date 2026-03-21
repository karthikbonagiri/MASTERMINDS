'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/jobs/new/page.tsx
// ============================================================
// Admin: Create New Job Notification
// ============================================================

import Link from 'next/link';
import JobForm from '@/components/admin/JobForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function NewJobPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <FaArrowLeft size={12} /> Back to Jobs
        </Link>
        <h1 className="text-2xl font-display font-bold text-gray-900">Add New Job</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details below. You can save as draft or publish immediately.
        </p>
      </div>

      <JobForm />
    </div>
  );
}
