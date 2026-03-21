'use client';
export const dynamic = 'force-dynamic';
// src/app/(public)/jobs/[id]/page.tsx
// ============================================================
// Public: Job Detail Page
// Shows full job information with:
//   - Featured image
//   - Title, company, category
//   - Description (preserves line breaks)
//   - Eligibility
//   - Apply button (external link)
//   - YouTube video embed / link
//   - WhatsApp share button
//   - Author credit
// ============================================================

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { getJob, Job } from '@/lib/job-service';
import WhatsAppShare from '@/components/ui/WhatsAppShare';
import {
  FaArrowLeft, FaBuilding, FaCalendarAlt, FaExternalLinkAlt,
  FaYoutube, FaUserEdit, FaTag, FaCheckCircle, FaSpinner,
} from 'react-icons/fa';

// ─── Extract YouTube video ID from any YouTube URL ────────────
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // Standard: youtube.com/watch?v=ID
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    // Short: youtu.be/ID
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    return null;
  } catch {
    return null;
  }
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job,     setJob]     = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!id) return;
    getJob(id)
      .then((data) => {
        if (!data || !data.isPublished) setError('Job not found or no longer available.');
        else setJob(data);
      })
      .catch(() => setError('Failed to load job details.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading job details…</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">{error || 'Job not found'}</h2>
        <Link href="/jobs" className="btn-primary text-sm px-5 py-2.5">
          ← All Jobs
        </Link>
      </div>
    );
  }

  const date   = job.createdAt
    ? format((job.createdAt as any)?.toDate?.() ?? new Date(job.createdAt as any), 'dd MMMM yyyy')
    : '';
  const ytId   = job.videoLink ? getYouTubeId(job.videoLink) : null;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* ── Hero image ─────────────────────────────────────────── */}
      <div className="relative h-56 sm:h-72 md:h-80 bg-gradient-to-br from-blue-700 to-blue-900 overflow-hidden">
        {job.imageUrl && (
          <Image
            src={job.imageUrl}
            alt={job.title}
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <Link
          href="/jobs"
          className="absolute top-5 left-5 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm
                     text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/30 transition-colors"
        >
          <FaArrowLeft size={12} /> All Jobs
        </Link>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-6">
          <span className="badge bg-blue-500 text-white text-xs font-semibold mb-2">
            {job.category}
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white leading-snug">
            {job.title}
          </h1>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {/* Meta bar */}
        <div className="card p-5 flex flex-wrap gap-5 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-blue-400" />
            <span className="font-semibold text-gray-900">{job.company}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaTag className="text-orange-400" />
            <span>{job.category}</span>
          </div>
          {date && (
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-400" />
              <span>{date}</span>
            </div>
          )}
          {job.adminBy && (
            <div className="flex items-center gap-2">
              <FaUserEdit className="text-purple-400" />
              <span>By {job.adminBy}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {job.applyLink && (
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <FaExternalLinkAlt size={13} /> Apply Now (Official Site)
            </a>
          )}
          {job.videoLink && (
            <a
              href={job.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700
                         text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              <FaYoutube size={16} /> Watch Video
            </a>
          )}
          <WhatsAppShare title={job.title} url={pageUrl} />
        </div>

        {/* Description */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full inline-block" />
            Job Description
          </h2>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {job.description || <span className="text-gray-400 italic">No description provided.</span>}
          </div>
        </div>

        {/* Eligibility */}
        {job.eligibility && (
          <div className="card p-6">
            <h2 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-500 rounded-full inline-block" />
              Eligibility Criteria
            </h2>
            <div className="space-y-2">
              {job.eligibility.split('\n').filter(Boolean).map((line, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={14} />
                  <span>{line.replace(/^[-•*]\s*/, '')}</span>
                </div>
              ))}
              {!job.eligibility.includes('\n') && (
                <p className="text-sm text-gray-700 leading-relaxed">{job.eligibility}</p>
              )}
            </div>
          </div>
        )}

        {/* YouTube embed */}
        {ytId && (
          <div className="card p-6">
            <h2 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaYoutube className="text-red-500" />
              Video Tutorial
            </h2>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                title="Job Tutorial Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Bottom share */}
        <div className="card p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
          <p className="text-sm text-gray-700 font-medium mb-3">
            📢 Know someone who might be interested? Share this job!
          </p>
          <WhatsAppShare title={job.title} url={pageUrl} />
        </div>

        {/* Apply CTA repeated at bottom */}
        {job.applyLink && (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm mb-4">Ready to apply? Visit the official website.</p>
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-base px-8 py-3.5"
            >
              <FaExternalLinkAlt size={14} /> Apply on Official Site
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
