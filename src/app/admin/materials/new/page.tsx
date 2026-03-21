'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/materials/new/page.tsx
import Link from 'next/link';
import MaterialForm from '@/components/admin/MaterialForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function NewMaterialPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link href="/admin/materials" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <FaArrowLeft size={12} /> Back to Materials
        </Link>
        <h1 className="text-2xl font-display font-bold text-gray-900">Upload Study Material</h1>
        <p className="text-gray-500 text-sm mt-1">Upload a PDF and configure pricing and preview settings.</p>
      </div>
      <MaterialForm />
    </div>
  );
}
