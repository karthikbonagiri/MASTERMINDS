'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/tests/page.tsx
// ============================================================
// Admin: Mock Tests List
// Shows all tests with stats, publish toggle, edit, delete.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getTests, deleteTest, togglePublish, MockTest } from '@/lib/test-service';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash,
  FaSpinner, FaClipboardList, FaSearch, FaLock, FaUnlock,
} from 'react-icons/fa';

export default function AdminTestsPage() {
  const [tests,    setTests]    = useState<MockTest[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTests(await getTests()); }
    catch { toast.error('Failed to load tests'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (t: MockTest) => {
    if (!confirm(`Delete "${t.title}"? All questions will also be deleted.`)) return;
    setDeleting(t.id!);
    try {
      await deleteTest(t.id!);
      setTests((p) => p.filter((x) => x.id !== t.id));
      toast.success('Test deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const handleToggle = async (t: MockTest) => {
    setToggling(t.id!);
    try {
      await togglePublish(t.id!, t.isPublished);
      setTests((p) => p.map((x) => x.id === t.id ? { ...x, isPublished: !x.isPublished } : x));
      toast.success(t.isPublished ? 'Test unpublished' : 'Test published');
    } catch { toast.error('Toggle failed'); }
    finally { setToggling(null); }
  };

  const filtered = tests.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Mock Tests</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {tests.length} total · {tests.filter((t) => t.isPublished).length} published
          </p>
        </div>
        <Link href="/admin/tests/new" className="btn-primary whitespace-nowrap">
          <FaPlus size={13} /> Create New Test
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text" placeholder="Search tests…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10 py-2.5"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-48 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FaClipboardList className="text-gray-400 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">
            {search ? 'No tests match your search' : 'No tests yet'}
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            {search ? 'Try a different keyword.' : 'Create your first mock test.'}
          </p>
          {!search && (
            <Link href="/admin/tests/new" className="btn-primary text-sm px-4 py-2">
              <FaPlus size={12} /> Create Test
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="card overflow-hidden flex flex-col">
              {/* Color header strip */}
              <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-700" />
              <div className="p-5 flex flex-col flex-1">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`badge text-xs font-semibold ${t.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.isPublished ? 'Published' : 'Draft'}
                  </span>
                  {t.isPremium && (
                    <span className="badge bg-amber-100 text-amber-700 text-xs font-semibold">
                      <FaLock size={9} className="mr-1" /> Premium
                    </span>
                  )}
                  <span className="badge bg-purple-50 text-purple-700 text-xs">{t.category}</span>
                </div>

                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-3 flex-1">
                  {t.title}
                </h3>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  {[
                    { label: 'Questions', value: t.totalQuestions },
                    { label: 'Minutes', value: t.timeInMinutes },
                    { label: t.price > 0 ? `₹${t.price}` : 'Free', value: t.negativeMarking > 0 ? `-${t.negativeMarking}` : 'No −ve' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg py-2">
                      <p className="text-sm font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Date */}
                {t.createdAt && (
                  <p className="text-xs text-gray-400 mb-3">
                    {format((t.createdAt as any)?.toDate?.() ?? new Date(t.createdAt as any), 'dd MMM yyyy')}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleToggle(t)}
                    disabled={toggling === t.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors
                      ${t.isPublished ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                  >
                    {toggling === t.id ? <FaSpinner className="animate-spin" /> :
                      t.isPublished ? <><FaEyeSlash size={11} /> Unpublish</> : <><FaEye size={11} /> Publish</>}
                  </button>
                  <Link
                    href={`/admin/tests/${t.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-medium transition-colors"
                  >
                    <FaEdit size={11} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(t)}
                    disabled={deleting === t.id}
                    className="flex items-center justify-center w-9 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    {deleting === t.id ? <FaSpinner className="animate-spin text-xs" /> : <FaTrash size={11} />}
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
