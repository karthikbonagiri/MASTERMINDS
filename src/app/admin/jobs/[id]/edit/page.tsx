'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/jobs/[id]/edit/page.tsx
// ============================================================
// Admin: Edit Existing Job Notification
// ============================================================

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getJob, Job } from '@/lib/job-service';
import JobForm from '@/components/admin/JobForm';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

export default function EditJobPage() {
  const { id }  = useParams<{ id: string }>();
  const [job,   setJob]     = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!id) return;
    getJob(id)
      .then((data) => {
        if (!data) setError('Job not found.');
        else setJob(data);
      })
      .catch(() => setError('Failed to load job.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-32">
        <p className="text-red-500 font-medium mb-4">{error || 'Job not found'}</p>
        <Link href="/admin/jobs" className="btn-primary text-sm px-4 py-2">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <FaArrowLeft size={12} /> Back to Jobs
        </Link>
        <h1 className="text-2xl font-display font-bold text-gray-900">Edit Job</h1>
        <p className="text-gray-500 text-sm mt-1 truncate">
          Editing: <strong>{job.title}</strong>
        </p>
      </div>

      <JobForm initial={job} />
    </div>
  );
}
