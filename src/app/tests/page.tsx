'use client';
export const dynamic = 'force-dynamic';
// src/app/(public)/tests/page.tsx
// ============================================================
// Public: Mock Tests Listing
// Shows all published tests with category filters.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublishedTests, MockTest, TEST_CATEGORIES } from '@/lib/test-service';
import {
  FaClipboardList, FaClock, FaQuestion, FaLock, FaSearch,
  FaArrowRight, FaRupeeSign,
} from 'react-icons/fa';

function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-8 flex-1 rounded-lg" />
        <div className="skeleton h-8 flex-1 rounded-lg" />
        <div className="skeleton h-8 flex-1 rounded-lg" />
      </div>
      <div className="skeleton h-10 w-full rounded-xl mt-2" />
    </div>
  );
}

function TestCard({ test }: { test: MockTest }) {
  return (
    <div className="card p-5 flex flex-col group hover:-translate-y-0.5 transition-transform duration-200">
      {/* Top strip */}
      <div className="h-1.5 -mx-5 -mt-5 mb-4 rounded-t-2xl bg-gradient-to-r from-purple-500 to-indigo-600" />

      {/* Badges */}
      <div className="flex gap-2 flex-wrap mb-3">
        <span className="badge bg-purple-50 text-purple-700 text-xs font-medium">{test.category}</span>
        {test.isPremium ? (
          <span className="badge bg-amber-100 text-amber-700 text-xs font-semibold">
            <FaLock size={9} className="mr-1" /> Premium
          </span>
        ) : (
          <span className="badge bg-emerald-100 text-emerald-700 text-xs font-semibold">Free</span>
        )}
      </div>

      <h2 className="font-semibold text-gray-900 text-base leading-snug mb-4 flex-1">
        {test.title}
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <FaQuestion className="text-purple-400 mx-auto mb-1 text-xs" />
          <p className="text-sm font-bold text-gray-900">{test.totalQuestions}</p>
          <p className="text-xs text-gray-400">Qs</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <FaClock className="text-blue-400 mx-auto mb-1 text-xs" />
          <p className="text-sm font-bold text-gray-900">{test.timeInMinutes}</p>
          <p className="text-xs text-gray-400">Min</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <FaRupeeSign className="text-emerald-400 mx-auto mb-1 text-xs" />
          <p className="text-sm font-bold text-gray-900">{test.price > 0 ? test.price : 'Free'}</p>
          <p className="text-xs text-gray-400">{test.negativeMarking > 0 ? `−${test.negativeMarking}` : 'No −ve'}</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/tests/${test.id}`}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 text-white
                   font-medium text-sm hover:bg-purple-700 transition-colors group/btn"
      >
        {test.isPremium ? <><FaLock size={12} /> View Test</> : <>Start Test <FaArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" /></>}
      </Link>
    </div>
  );
}

export default function TestsPage() {
  const [tests,    setTests]    = useState<MockTest[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    getPublishedTests()
      .then(setTests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tests.filter((t) => {
    const matchCat    = category === 'All' || t.category === category;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeCategories = ['All', ...Array.from(new Set(tests.map((t) => t.category)))];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <FaClipboardList size={13} /> Mock Tests
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            Practice Mock Tests
          </h1>
          <p className="text-purple-200 max-w-lg mx-auto text-sm">
            Timed, exam-style tests with negative marking. Available in English, Telugu & Hindi.
          </p>
          <div className="mt-7 max-w-lg mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {activeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${category === cat ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {!loading && (
          <p className="text-sm text-gray-500 mb-5">
            Showing <strong className="text-gray-700">{filtered.length}</strong> test{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FaClipboardList className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="font-semibold text-gray-500 text-lg mb-2">No tests found</h3>
            <p className="text-gray-400 text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t) => <TestCard key={t.id} test={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
