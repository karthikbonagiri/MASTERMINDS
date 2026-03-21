'use client';
export const dynamic = 'force-dynamic';
// src/app/(public)/page.tsx
// ============================================================
// Homepage – Master Minds
// Sections: Hero · Stats · Features · Latest Jobs · CTA
// ============================================================

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getPublishedJobs, Job } from '@/lib/job-service';
import { format } from 'date-fns';
import {
  FaBriefcase, FaClipboardList, FaBook, FaNewspaper,
  FaArrowRight, FaCheckCircle, FaBuilding, FaStar,
} from 'react-icons/fa';

const FEATURES = [
  {
    icon: FaBriefcase,
    color: 'from-orange-400 to-orange-600',
    bg: 'bg-orange-50',
    title: 'Job Notifications',
    desc: 'Instant alerts for Govt, Banking, Railway, Defence & more.',
    href: '/jobs',
  },
  {
    icon: FaClipboardList,
    color: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-50',
    title: 'Mock Tests',
    desc: 'Practice with timed, negative-marking tests. Track your score.',
    href: '/tests',
  },
  {
    icon: FaBook,
    color: 'from-emerald-400 to-emerald-600',
    bg: 'bg-emerald-50',
    title: 'Study Materials',
    desc: 'Download PDFs curated by experts for every exam.',
    href: '/materials',
  },
  {
    icon: FaNewspaper,
    color: 'from-cyan-400 to-cyan-600',
    bg: 'bg-cyan-50',
    title: 'Current Affairs',
    desc: 'Daily updates to keep you ahead in GK & current events.',
    href: '/current-affairs',
  },
];

const STATS = [
  { label: 'Job Alerts', value: '5000+' },
  { label: 'Mock Tests',  value: '200+'  },
  { label: 'PDF Notes',   value: '1000+' },
  { label: 'Students',    value: '50K+'  },
];

export default function HomePage() {
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);

  useEffect(() => {
    getPublishedJobs()
      .then((jobs) => setLatestJobs(jobs.slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 overflow-hidden pt-20 pb-24 px-4 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <FaStar size={12} className="text-yellow-400" />
            India's #1 Learning Hub for Competitive Exams
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-5">
            Master Minds
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300 mt-1">
              The Learning Hub
            </span>
          </h1>

          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-9 leading-relaxed">
            Your one-stop platform for government job alerts, mock tests, study materials,
            and daily current affairs. Start your success journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs" className="btn-primary bg-white text-blue-700 hover:bg-blue-50 text-base px-7 py-3.5">
              Browse Jobs <FaArrowRight size={14} />
            </Link>
            <Link href="/tests" className="btn-secondary border-white/40 text-white hover:bg-white/10 text-base px-7 py-3.5">
              Take a Mock Test
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-display font-bold text-blue-700">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Everything You Need to Succeed</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From job alerts to study materials, we've got you covered at every step of your preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc, href }) => (
              <Link key={href} href={href} className="card p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-transform duration-200">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                  <Icon className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-1.5 text-blue-600 text-sm font-medium">
                  Explore <FaArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST JOBS ───────────────────────────────────────── */}
      {latestJobs.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title mb-2">Latest Job Notifications</h2>
                <p className="text-gray-500 text-sm">Fresh alerts updated daily</p>
              </div>
              <Link href="/jobs" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1.5">
                View All <FaArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {latestJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="card overflow-hidden group hover:-translate-y-0.5 transition-transform">
                  <div className="relative h-36 bg-gradient-to-br from-blue-50 to-indigo-100">
                    {job.imageUrl ? (
                      <Image src={job.imageUrl} alt={job.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaBriefcase className="text-blue-200 text-4xl" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-blue-600 font-medium">{job.category}</span>
                    <h3 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2 leading-snug">{job.title}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                      <FaBuilding size={10} />
                      <span className="truncate">{job.company}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 py-20 px-4 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-emerald-100 mb-8 leading-relaxed">
            Join thousands of students who trust MasterMinds for their exam preparation.
            All resources, one platform.
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-sm text-emerald-100 mb-8">
            {['Free job alerts', 'Expert study material', 'Daily current affairs', 'Practice mock tests'].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <FaCheckCircle size={13} className="text-emerald-300" />
                {f}
              </span>
            ))}
          </div>
          <Link href="/jobs" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-colors shadow-md">
            Explore Jobs <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
