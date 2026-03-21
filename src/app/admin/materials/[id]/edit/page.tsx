'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/materials/[id]/edit/page.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getMaterial, StudyMaterial } from '@/lib/material-service';
import MaterialForm from '@/components/admin/MaterialForm';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

export default function EditMaterialPage() {
  const { id }  = useParams<{ id: string }>();
  const [mat,    setMat]     = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!id) return;
    getMaterial(id)
      .then((m) => { if (!m) setError('Material not found.'); else setMat(m); })
      .catch(() => setError('Failed to load material.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <FaSpinner className="animate-spin text-emerald-500 text-4xl" />
    </div>
  );

  if (error || !mat) return (
    <div className="text-center py-32">
      <p className="text-red-500 mb-4">{error}</p>
      <Link href="/admin/materials" className="btn-primary text-sm px-4 py-2">Back to Materials</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link href="/admin/materials" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <FaArrowLeft size={12} /> Back to Materials
        </Link>
        <h1 className="text-2xl font-display font-bold text-gray-900">Edit Material</h1>
        <p className="text-gray-500 text-sm mt-1 truncate">Editing: <strong>{mat.title}</strong></p>
      </div>
      <MaterialForm initial={mat} />
    </div>
  );
}
