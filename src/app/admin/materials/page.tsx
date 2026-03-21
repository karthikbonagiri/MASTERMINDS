'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/materials/page.tsx
// ============================================================
// Admin: Study Materials List
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getMaterials, deleteMaterial, togglePublish, StudyMaterial } from '@/lib/material-service';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash,
  FaSpinner, FaBook, FaSearch, FaFilePdf, FaLock,
} from 'react-icons/fa';

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [toggling,  setToggling]  = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setMaterials(await getMaterials()); }
    catch { toast.error('Failed to load materials'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (m: StudyMaterial) => {
    if (!confirm(`Delete "${m.title}"? This will remove the PDF from Storage too.`)) return;
    setDeleting(m.id!);
    try {
      await deleteMaterial(m.id!, m.fileUrl, m.thumbnailUrl);
      setMaterials((p) => p.filter((x) => x.id !== m.id));
      toast.success('Material deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const handleToggle = async (m: StudyMaterial) => {
    setToggling(m.id!);
    try {
      await togglePublish(m.id!, m.isPublished);
      setMaterials((p) => p.map((x) => x.id === m.id ? { ...x, isPublished: !x.isPublished } : x));
      toast.success(m.isPublished ? 'Unpublished' : 'Published');
    } catch { toast.error('Toggle failed'); }
    finally { setToggling(null); }
  };

  const filtered = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Study Materials</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {materials.length} total · {materials.filter((m) => m.isPublished).length} published
          </p>
        </div>
        <Link href="/admin/materials/new" className="btn-primary whitespace-nowrap">
          <FaPlus size={13} /> Upload Material
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text" placeholder="Search materials…" value={search}
          onChange={(e) => setSearch(e.target.value)} className="input pl-10 py-2.5"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-52 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FaBook className="text-gray-400 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">
            {search ? 'No materials match your search' : 'No materials yet'}
          </h3>
          {!search && (
            <Link href="/admin/materials/new" className="btn-primary text-sm px-4 py-2 mt-4">
              <FaPlus size={12} /> Upload Material
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div key={m.id} className="card overflow-hidden flex flex-col group">
              {/* Thumbnail */}
              <div className="relative h-32 bg-gradient-to-br from-emerald-50 to-teal-100 flex-shrink-0">
                {m.thumbnailUrl ? (
                  <Image src={m.thumbnailUrl} alt={m.title} fill className="object-cover" sizes="33vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaFilePdf className="text-red-300 text-5xl" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                  <span className={`badge text-xs font-semibold shadow-sm ${m.isPublished ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-white'}`}>
                    {m.isPublished ? 'Published' : 'Draft'}
                  </span>
                  {m.price > 0 && (
                    <span className="badge bg-amber-500 text-white text-xs font-semibold shadow-sm">
                      <FaLock size={8} className="mr-1" />₹{m.price}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mb-2">{m.category}</span>
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug flex-1 mb-1">{m.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  {m.fileSizeKb ? <span>{(m.fileSizeKb / 1024).toFixed(1)} MB</span> : null}
                  <span>Preview: {m.previewPages} pg</span>
                  {m.createdAt && (
                    <span>{format((m.createdAt as any)?.toDate?.() ?? new Date(m.createdAt as any), 'dd MMM yy')}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleToggle(m)}
                    disabled={toggling === m.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors
                      ${m.isPublished ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                  >
                    {toggling === m.id ? <FaSpinner className="animate-spin" /> :
                      m.isPublished ? <><FaEyeSlash size={11} /> Unpublish</> : <><FaEye size={11} /> Publish</>}
                  </button>
                  <Link
                    href={`/admin/materials/${m.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium"
                  >
                    <FaEdit size={11} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(m)}
                    disabled={deleting === m.id}
                    className="flex items-center justify-center w-9 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    {deleting === m.id ? <FaSpinner className="animate-spin text-xs" /> : <FaTrash size={11} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
