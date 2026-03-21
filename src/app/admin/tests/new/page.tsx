'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/tests/new/page.tsx
import Link from 'next/link';
import TestForm from '@/components/admin/TestForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function NewTestPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link href="/admin/tests" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <FaArrowLeft size={12} /> Back to Tests
        </Link>
        <h1 className="text-2xl font-display font-bold text-gray-900">Create New Test</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the test details, save, then add questions.</p>
      </div>
      <TestForm />
    </div>
  );
}
