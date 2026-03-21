'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/jobs/page.tsx
// ============================================================
// Admin: Job Notifications List
// Shows all jobs (published + draft) with inline actions.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  getJobs, deleteJob, togglePublish, Job,
} from '@/lib/job-service';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash,
  FaSpinner, FaBriefcase, FaSearch,
} from 'react-icons/fa';

export default function AdminJobsPage() {
  const [jobs,    setJobs]    = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  // ── Load jobs ────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJobs();
      setJobs(data);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (job: Job) => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    setDeleting(job.id!);
    try {
      await deleteJob(job.id!, job.imageUrl);
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
      toast.success('Job deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  // ── Toggle publish ───────────────────────────────────────
  const handleToggle = async (job: Job) => {
    setToggling(job.id!);
    try {
      await togglePublish(job.id!, job.isPublished);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, isPublished: !j.isPublished } : j
        )
      );
      toast.success(job.isPublished ? 'Job unpublished' : 'Job published');
    } catch {
      toast.error('Toggle failed');
    } finally {
      setToggling(null);
    }
  };

  // ── Filter by search ─────────────────────────────────────
  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Job Notifications</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {jobs.length} total · {jobs.filter((j) => j.isPublished).length} published
          </p>
        </div>
        <Link href="/admin/jobs/new" className="btn-primary whitespace-nowrap">
          <FaPlus size={13} /> Add New Job
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search jobs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10 py-2.5"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 h-44 skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FaBriefcase className="text-gray-400 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">
            {search ? 'No jobs match your search' : 'No jobs yet'}
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            {search ? 'Try a different keyword.' : 'Click "Add New Job" to create your first job notification.'}
          </p>
          {!search && (
            <Link href="/admin/jobs/new" className="btn-primary text-sm px-4 py-2">
              <FaPlus size={12} /> Add Job
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <div key={job.id} className="card overflow-hidden flex flex-col group">
              {/* Image */}
              <div className="relative h-36 bg-gradient-to-br from-blue-50 to-blue-100 flex-shrink-0">
                {job.imageUrl ? (
                  <Image
                    src={job.imageUrl}
                    alt={job.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaBriefcase className="text-blue-200 text-5xl" />
                  </div>
                )}
                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`badge text-xs font-semibold shadow-sm ${
                      job.isPublished
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    {job.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-2">
                  {job.category}
                </span>
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug mb-1 flex-1">
                  {job.title}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{job.company}</p>
                {job.createdAt && (
                  <p className="text-xs text-gray-400 mb-4">
                    {format(
                      (job.createdAt as any)?.toDate?.() ?? new Date(job.createdAt as any),
                      'dd MMM yyyy'
                    )}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                  {/* Toggle publish */}
                  <button
                    onClick={() => handleToggle(job)}
                    disabled={toggling === job.id}
                    title={job.isPublished ? 'Unpublish' : 'Publish'}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors
                      ${job.isPublished
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                  >
                    {toggling === job.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : job.isPublished ? (
                      <><FaEyeSlash size={11} /> Unpublish</>
                    ) : (
                      <><FaEye size={11} /> Publish</>
                    )}
                  </button>

                  {/* Edit */}
                  <Link
                    href={`/admin/jobs/${job.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition-colors"
                  >
                    <FaEdit size={11} /> Edit
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(job)}
                    disabled={deleting === job.id}
                    title="Delete job"
                    className="flex items-center justify-center w-9 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    {deleting === job.id
                      ? <FaSpinner className="animate-spin text-xs" />
                      : <FaTrash size={11} />}
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
