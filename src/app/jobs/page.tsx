'use client';
export const dynamic = 'force-dynamic';
// src/app/(public)/jobs/page.tsx
// ============================================================
// Public: Job Notifications Listing
// - Shows all published jobs in a card grid
// - Category filter tabs
// - Search bar
// - Loading skeletons
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  getPublishedJobs, Job, JOB_CATEGORIES,
} from '@/lib/job-service';
import {
  FaBriefcase, FaSearch, FaBuilding, FaCalendarAlt,
  FaArrowRight, FaSpinner,
} from 'react-icons/fa';

// ─── Skeleton card ────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-9 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}

// ─── Job card ─────────────────────────────────────────────────
function JobCard({ job }: { job: Job }) {
  const date = job.createdAt
    ? format(
        (job.createdAt as any)?.toDate?.() ?? new Date(job.createdAt as any),
        'dd MMM yyyy'
      )
    : '';

  return (
    <div className="card overflow-hidden flex flex-col group hover:-translate-y-0.5 transition-transform duration-200">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0 overflow-hidden">
        {job.imageUrl ? (
          <Image
            src={job.imageUrl}
            alt={job.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FaBriefcase className="text-blue-200 text-6xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute bottom-3 left-3 badge bg-blue-600 text-white text-xs font-semibold shadow">
          {job.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-2 flex-1">
          {job.title}
        </h2>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaBuilding size={12} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
          {date && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FaCalendarAlt size={11} className="flex-shrink-0" />
              <span>{date}</span>
            </div>
          )}
        </div>

        <Link
          href={`/jobs/${job.id}`}
          className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                     bg-blue-50 text-blue-600 font-medium text-sm hover:bg-blue-600 hover:text-white
                     transition-all duration-200 group/btn"
        >
          View Details
          <FaArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function JobsPage() {
  const [jobs,     setJobs]     = useState<Job[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    getPublishedJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) => {
    const matchCat   = category === 'All' || j.category === category;
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeCategories = ['All', ...Array.from(new Set(jobs.map((j) => j.category)))];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <FaBriefcase size={13} /> Job Notifications
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            Latest Government Job Alerts
          </h1>
          <p className="text-blue-200 max-w-lg mx-auto text-sm">
            Stay updated with the latest recruitment notifications from top organisations across India.
          </p>

          {/* Search bar */}
          <div className="mt-7 max-w-lg mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs, organisations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
          {activeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150
                ${category === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-5">
            Showing <strong className="text-gray-700">{filtered.length}</strong> job{filtered.length !== 1 ? 's' : ''}
            {category !== 'All' && ` in ${category}`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FaBriefcase className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="font-semibold text-gray-500 text-lg mb-2">No jobs found</h3>
            <p className="text-gray-400 text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}
