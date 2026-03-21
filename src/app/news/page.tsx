'use client';
export const dynamic = 'force-dynamic';
// src/app/(public)/news/page.tsx
// ============================================================
// Public: News & Articles Listing
// Displays both "Education Info" and "Current Affairs" posts.
// Users can filter by category or search by keyword.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { getPublishedPosts, ArticlePost, ArticleCategory } from '@/lib/article-service';
import WhatsAppShare from '@/components/ui/WhatsAppShare';
import {
  FaNewspaper, FaSearch, FaCalendarAlt, FaUser,
  FaArrowRight, FaGlobe, FaGraduationCap,
} from 'react-icons/fa';

// ─── Category config ──────────────────────────────────────────
const CAT_CONFIG = {
  'Education Info': {
    icon: FaGraduationCap,
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-blue-400',
    dot: 'bg-blue-500',
  },
  'Current Affairs': {
    icon: FaGlobe,
    badge: 'bg-orange-100 text-orange-700',
    border: 'border-orange-400',
    dot: 'bg-orange-500',
  },
} as const;

// ─── Skeleton card ────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card overflow-hidden flex gap-0">
      <div className="skeleton w-28 flex-shrink-0 rounded-none" />
      <div className="p-4 flex-1 space-y-2.5">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    </div>
  );
}

// ─── Article card (horizontal layout for list) ────────────────
function ArticleCard({ post }: { post: ArticlePost }) {
  const cfg  = CAT_CONFIG[post.category];
  const Icon = cfg.icon;
  const date = post.publishedDate
    ? format(new Date(post.publishedDate), 'dd MMM yyyy')
    : post.createdAt
      ? format((post.createdAt as any)?.toDate?.() ?? new Date(post.createdAt as any), 'dd MMM yyyy')
      : '';

  // Strip HTML for excerpt preview
  const excerpt = post.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 130);

  return (
    <Link
      href={`/news/${post.id}`}
      className="card overflow-hidden flex group hover:-translate-y-0.5 transition-transform duration-200"
    >
      {/* Thumbnail */}
      <div className="relative w-28 sm:w-36 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="144px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="text-gray-300 text-4xl" />
          </div>
        )}
        {/* Category dot */}
        <div className={`absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full ${cfg.dot} shadow`} />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-w-0">
        <span className={`badge text-xs font-semibold mb-2 ${cfg.badge}`}>
          {post.category}
        </span>
        <h2 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 mb-1.5
                       group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        {excerpt && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2 hidden sm:block">
            {excerpt}…
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          {date && (
            <span className="flex items-center gap-1">
              <FaCalendarAlt size={9} /> {date}
            </span>
          )}
          {post.adminBy && (
            <span className="flex items-center gap-1">
              <FaUser size={9} /> {post.adminBy}
            </span>
          )}
          <span className="flex items-center gap-1 text-blue-500 ml-auto font-medium">
            Read more <FaArrowRight size={9} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Featured card (large, first post) ───────────────────────
function FeaturedCard({ post }: { post: ArticlePost }) {
  const cfg  = CAT_CONFIG[post.category];
  const date = post.publishedDate
    ? format(new Date(post.publishedDate), 'dd MMMM yyyy')
    : '';

  const excerpt = post.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/news/${post.id}`
    : '';

  return (
    <div className="card overflow-hidden group">
      {/* Image */}
      <div className="relative h-52 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <FaNewspaper className="text-blue-200 text-8xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span className={`absolute top-4 left-4 badge text-xs font-bold shadow ${cfg.badge}`}>
          {post.category}
        </span>
      </div>

      <div className="p-6">
        <Link href={`/news/${post.id}`}>
          <h2 className="text-xl font-display font-bold text-gray-900 leading-snug mb-2
                         hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        {excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">{excerpt}…</p>
        )}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {date && <span className="flex items-center gap-1"><FaCalendarAlt size={10} /> {date}</span>}
            {post.adminBy && <span className="flex items-center gap-1"><FaUser size={10} /> {post.adminBy}</span>}
          </div>
          <div className="flex items-center gap-2">
            <WhatsAppShare title={post.title} url={pageUrl} className="text-xs px-3 py-1.5" />
            <Link
              href={`/news/${post.id}`}
              className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
            >
              Read full article <FaArrowRight size={10} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function NewsPage() {
  const [posts,     setPosts]    = useState<ArticlePost[]>([]);
  const [loading,   setLoading]  = useState(true);
  const [search,    setSearch]   = useState('');
  const [category,  setCategory] = useState<'All' | ArticleCategory>('All');

  useEffect(() => {
    getPublishedPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((p) => {
    const matchCat    = category === 'All' || p.category === category;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                        (p.adminBy ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured     = filtered[0];
  const rest         = filtered.slice(1);
  const totalEdu     = posts.filter((p) => p.category === 'Education Info').length;
  const totalAffairs = posts.filter((p) => p.category === 'Current Affairs').length;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <FaNewspaper size={13} /> News & Articles
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            Education Info & Current Affairs
          </h1>
          <p className="text-gray-300 max-w-lg mx-auto text-sm">
            Stay informed with the latest education news, exam updates, and daily current affairs.
          </p>

          {/* Search */}
          <div className="mt-7 max-w-lg mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
            />
          </div>

          {/* Mini stats */}
          {!loading && (
            <div className="flex gap-6 justify-center mt-6 text-sm">
              <span className="flex items-center gap-1.5 text-blue-300">
                <FaGraduationCap size={13} /> {totalEdu} Education posts
              </span>
              <span className="flex items-center gap-1.5 text-orange-300">
                <FaGlobe size={13} /> {totalAffairs} Current Affairs
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Category tabs */}
        <div className="flex gap-2 mb-7 overflow-x-auto pb-1">
          {([
            { val: 'All',             label: 'All Posts',       icon: FaNewspaper     },
            { val: 'Education Info',  label: 'Education Info',  icon: FaGraduationCap },
            { val: 'Current Affairs', label: 'Current Affairs', icon: FaGlobe         },
          ] as const).map(({ val, label, icon: Icon }) => (
            <button
              key={val}
              onClick={() => setCategory(val as any)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                ${category === val
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-6">
            Showing <strong className="text-gray-700">{filtered.length}</strong> article{filtered.length !== 1 ? 's' : ''}
            {search && <> matching "<span className="italic">{search}</span>"</>}
          </p>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FaNewspaper className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="font-semibold text-gray-500 text-lg mb-2">No articles found</h3>
            <p className="text-gray-400 text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: featured + list */}
            <div className="lg:col-span-2 space-y-4">
              {featured && <FeaturedCard post={featured} />}
              {rest.map((p) => <ArticleCard key={p.id} post={p} />)}
            </div>

            {/* Right sidebar: category counts + latest per category */}
            <aside className="space-y-5">
              {/* Quick stats */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">Browse by Category</h3>
                {([
                  { cat: 'Education Info',  icon: FaGraduationCap, color: 'text-blue-500',   bg: 'bg-blue-50',   count: totalEdu     },
                  { cat: 'Current Affairs', icon: FaGlobe,         color: 'text-orange-500', bg: 'bg-orange-50', count: totalAffairs },
                ] as const).map(({ cat, icon: Icon, color, bg, count }) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat as ArticleCategory)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors hover:opacity-90
                      ${category === cat ? bg : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`${color} text-lg`} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-gray-800">{cat}</p>
                      <p className="text-xs text-gray-400">{count} articles</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Latest 5 by date */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">Recent Posts</h3>
                <div className="space-y-3">
                  {posts.slice(0, 5).map((p) => {
                    const d = p.publishedDate
                      ? format(new Date(p.publishedDate), 'dd MMM')
                      : '';
                    return (
                      <Link
                        key={p.id}
                        href={`/news/${p.id}`}
                        className="flex items-start gap-2.5 group"
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${CAT_CONFIG[p.category].dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                            {p.title}
                          </p>
                          {d && <p className="text-xs text-gray-400 mt-0.5">{d}</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
