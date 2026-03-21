'use client';
export const dynamic = 'force-dynamic';
// src/app/(public)/news/[id]/page.tsx
// ============================================================
// Public: Full Article / Current Affairs Detail Page
// Renders rich-text HTML content safely with Tailwind Typography.
// ============================================================

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { getPost, getPublishedPosts, ArticlePost } from '@/lib/article-service';
import WhatsAppShare from '@/components/ui/WhatsAppShare';
import {
  FaArrowLeft, FaUser, FaCalendarAlt, FaTag,
  FaSpinner, FaNewspaper, FaGraduationCap, FaGlobe,
  FaArrowRight,
} from 'react-icons/fa';

// ─── Category badge config ────────────────────────────────────
const CAT_STYLE = {
  'Education Info':  { badge: 'bg-blue-100 text-blue-700',   icon: FaGraduationCap },
  'Current Affairs': { badge: 'bg-orange-100 text-orange-700', icon: FaGlobe       },
} as const;

// ─── Related post mini card ───────────────────────────────────
function RelatedCard({ post }: { post: ArticlePost }) {
  return (
    <Link
      href={`/news/${post.id}`}
      className="flex items-start gap-3 group py-3 border-b border-gray-100 last:border-0"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {post.imageUrl ? (
          <Image src={post.imageUrl} alt={post.title} width={56} height={56} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaNewspaper className="text-gray-300 text-xl" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {post.title}
        </p>
        {post.adminBy && (
          <p className="text-xs text-gray-400 mt-0.5">{post.adminBy}</p>
        )}
      </div>
    </Link>
  );
}

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [post,    setPost]    = useState<ArticlePost | null>(null);
  const [related, setRelated] = useState<ArticlePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!id) return;
    getPost(id)
      .then(async (p) => {
        if (!p || !p.isPublished) {
          setError('Article not found or no longer available.');
          return;
        }
        setPost(p);
        // Fetch related articles from same category (exclude current)
        const all = await getPublishedPosts(p.category);
        setRelated(all.filter((a) => a.id !== id).slice(0, 4));
      })
      .catch(() => setError('Failed to load article.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading article…</p>
      </div>
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
      <FaNewspaper className="text-gray-300 text-6xl mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-3">{error || 'Article not found'}</h2>
      <Link href="/news" className="btn-primary text-sm px-5 py-2.5">← All Articles</Link>
    </div>
  );

  const cfg  = CAT_STYLE[post.category];
  const Icon = cfg.icon;
  const date = post.publishedDate
    ? format(new Date(post.publishedDate), 'EEEE, dd MMMM yyyy')
    : post.createdAt
      ? format((post.createdAt as any)?.toDate?.() ?? new Date(post.createdAt as any), 'EEEE, dd MMMM yyyy')
      : '';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero / Banner ─────────────────────────────────────── */}
      {post.imageUrl ? (
        <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 max-w-4xl mx-auto">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-xl hover:bg-white/30 transition-colors mb-4"
            >
              <FaArrowLeft size={11} /> All Articles
            </Link>
            <span className={`badge text-xs font-bold mb-2 ${cfg.badge}`}>
              <Icon size={10} className="mr-1" /> {post.category}
            </span>
            <h1 className="text-xl sm:text-3xl font-display font-bold text-white leading-snug">
              {post.title}
            </h1>
          </div>
        </div>
      ) : (
        /* No image – minimal top bar */
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-4"
            >
              <FaArrowLeft size={12} /> All Articles
            </Link>
            <span className={`badge text-xs font-bold mb-3 ${cfg.badge}`}>
              <Icon size={10} className="mr-1" /> {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white leading-snug">
              {post.title}
            </h1>
          </div>
        </div>
      )}

      {/* ── Main layout ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Article body ──────────────────────────────────── */}
          <article className="lg:col-span-2">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-5 border-b border-gray-100 mb-7">
              {date && (
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt size={12} className="text-gray-400" />
                  {date}
                </span>
              )}
              {post.adminBy && (
                <span className="flex items-center gap-1.5">
                  <FaUser size={12} className="text-gray-400" />
                  {post.adminBy}
                </span>
              )}
              <span className={`flex items-center gap-1.5 badge font-medium ${cfg.badge}`}>
                <FaTag size={10} /> {post.category}
              </span>
            </div>

            {/* Share bar (top) */}
            <div className="flex items-center gap-3 mb-7 pb-5 border-b border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Share this article:</p>
              <WhatsAppShare title={post.title} url={pageUrl} />
            </div>

            {/* ── Rich HTML content ─────────────────────────── */}
            {/*
              prose class applies Tailwind Typography styles:
              headings, paragraphs, lists, blockquotes all look great.
              dangerouslySetInnerHTML is safe here because content
              is created by trusted admins via our own editor.
            */}
            <div
              className="prose prose-sm sm:prose-base max-w-none
                         prose-headings:font-display prose-headings:text-gray-900
                         prose-h2:text-xl prose-h3:text-lg
                         prose-p:text-gray-700 prose-p:leading-relaxed
                         prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                         prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50
                         prose-blockquote:rounded-r-xl prose-blockquote:py-1
                         prose-ul:text-gray-700 prose-ol:text-gray-700
                         prose-strong:text-gray-900 prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Bottom share */}
            <div className="mt-10 pt-7 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Found this useful? Share it with your friends!
              </p>
              <div className="flex flex-wrap gap-3">
                <WhatsAppShare title={post.title} url={pageUrl} />
                <Link href="/news" className="btn-secondary text-sm px-4 py-2">
                  <FaArrowLeft size={12} /> Browse More
                </Link>
              </div>
            </div>
          </article>

          {/* ── Sidebar ───────────────────────────────────────── */}
          <aside className="space-y-6">
            {/* Category badge */}
            <div className={`card p-5 flex items-center gap-4 border-l-4 ${
              post.category === 'Education Info' ? 'border-blue-400' : 'border-orange-400'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                post.category === 'Education Info' ? 'bg-blue-100' : 'bg-orange-100'
              }`}>
                <Icon className={`text-2xl ${post.category === 'Education Info' ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Category</p>
                <p className="font-semibold text-gray-900">{post.category}</p>
              </div>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Related Articles
                </h3>
                <p className="text-xs text-gray-400 mb-4">More from {post.category}</p>
                {related.map((r) => <RelatedCard key={r.id} post={r} />)}
                <Link
                  href={`/news?cat=${encodeURIComponent(post.category)}`}
                  className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-3 hover:underline"
                >
                  View all {post.category} <FaArrowRight size={10} />
                </Link>
              </div>
            )}

            {/* Sticky navigation */}
            <div className="card p-5 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Explore More</h3>
              <div className="space-y-2">
                {[
                  { href: '/jobs',       label: 'Job Notifications' },
                  { href: '/tests',      label: 'Mock Tests'        },
                  { href: '/materials',  label: 'Study Materials'   },
                  { href: '/news',       label: 'All Articles'      },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 py-1.5 group transition-colors"
                  >
                    {label}
                    <FaArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
