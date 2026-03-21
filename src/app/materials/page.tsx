'use client';
export const dynamic = 'force-dynamic';
// src/app/(public)/materials/page.tsx
// ============================================================
// Public: Study Materials Listing
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedMaterials, StudyMaterial } from '@/lib/material-service';
import {
  FaBook, FaSearch, FaFilePdf, FaLock, FaDownload,
  FaArrowRight, FaEye,
} from 'react-icons/fa';

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-40 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-10 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

function MaterialCard({ m }: { m: StudyMaterial }) {
  const isFree = m.price === 0;

  return (
    <div className="card overflow-hidden flex flex-col group hover:-translate-y-0.5 transition-transform duration-200">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-emerald-50 to-teal-100 flex-shrink-0 overflow-hidden">
        {m.thumbnailUrl ? (
          <Image
            src={m.thumbnailUrl}
            alt={m.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FaFilePdf className="text-red-300 text-6xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          {isFree ? (
            <span className="badge bg-emerald-500 text-white text-xs font-bold shadow">FREE</span>
          ) : (
            <span className="badge bg-amber-500 text-white text-xs font-bold shadow">
              <FaLock size={8} className="mr-1" />₹{m.price}
            </span>
          )}
        </div>

        <span className="absolute bottom-3 left-3 badge bg-white/90 text-gray-700 text-xs font-semibold shadow">
          {m.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-2 flex-1">
          {m.title}
        </h2>

        {m.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{m.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <FaEye size={10} /> {m.previewPages} pg preview
          </span>
          {m.fileSizeKb ? (
            <span>{(m.fileSizeKb / 1024).toFixed(1)} MB</span>
          ) : null}
        </div>

        <Link
          href={`/materials/${m.id}`}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group/btn
                     bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
        >
          {isFree ? (
            <><FaDownload size={12} /> View & Download</>
          ) : (
            <><FaLock size={12} /> Preview & Unlock</>
          )}
          <FaArrowRight size={11} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    getPublishedMaterials()
      .then(setMaterials)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = materials.filter((m) => {
    const matchCat    = category === 'All' || m.category === category;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                        m.description.toLowerCase().includes(search.toLowerCase());
    const matchPrice  = priceFilter === 'all' ? true :
                        priceFilter === 'free' ? m.price === 0 : m.price > 0;
    return matchCat && matchSearch && matchPrice;
  });

  const activeCategories = ['All', ...Array.from(new Set(materials.map((m) => m.category)))];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <FaBook size={13} /> Study Materials
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            Expert Study Materials
          </h1>
          <p className="text-emerald-200 max-w-lg mx-auto text-sm">
            Curated PDFs for every competitive exam. Download, study, and ace your exams.
          </p>
          <div className="mt-7 max-w-lg mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
            {activeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all
                  ${category === cat ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price filter */}
          <div className="flex gap-1.5 flex-shrink-0">
            {([['all', 'All'], ['free', 'Free'], ['paid', 'Paid']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setPriceFilter(val)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                  ${priceFilter === val ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {!loading && (
          <p className="text-sm text-gray-500 mb-5">
            Showing <strong className="text-gray-700">{filtered.length}</strong> material{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FaBook className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="font-semibold text-gray-500 text-lg mb-2">No materials found</h3>
            <p className="text-gray-400 text-sm">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((m) => <MaterialCard key={m.id} m={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}
