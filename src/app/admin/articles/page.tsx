'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/articles/page.tsx
// ============================================================
// Admin: Articles list (Education Info + Current Affairs)
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  getPosts, deletePost, togglePublish,
  ArticlePost, ArticleCategory, ARTICLE_CATEGORIES,
} from '@/lib/article-service';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash,
  FaSpinner, FaNewspaper, FaSearch,
} from 'react-icons/fa';

// ─── Category badge colours ───────────────────────────────────
const CAT_STYLE: Record<ArticleCategory, string> = {
  'Education Info':  'bg-blue-100 text-blue-700',
  'Current Affairs': 'bg-orange-100 text-orange-700',
};

export default function AdminArticlesPage() {
  const [posts,     setPosts]    = useState<ArticlePost[]>([]);
  const [loading,   setLoading]  = useState(true);
  const [search,    setSearch]   = useState('');
  const [catFilter, setCatFilter]= useState<'All' | ArticleCategory>('All');
  const [deleting,  setDeleting] = useState<string | null>(null);
  const [toggling,  setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPosts(await getPosts()); }
    catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (post: ArticlePost) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    setDeleting(post.id!);
    try {
      await deletePost(post.id!, post.imageUrl);
      setPosts((p) => p.filter((x) => x.id !== post.id));
      toast.success('Post deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const handleToggle = async (post: ArticlePost) => {
    setToggling(post.id!);
    try {
      await togglePublish(post.id!, post.isPublished);
      setPosts((p) => p.map((x) =>
        x.id === post.id ? { ...x, isPublished: !x.isPublished } : x
      ));
      toast.success(post.isPublished ? 'Post unpublished' : 'Post published');
    } catch { toast.error('Toggle failed'); }
    finally { setToggling(null); }
  };

  const filtered = posts.filter((p) => {
    const matchCat    = catFilter === 'All' || p.category === catFilter;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                        p.adminBy.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Articles & Posts</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {posts.length} total · {posts.filter((p) => p.isPublished).length} published
          </p>
        </div>
        <Link href="/admin/articles/new" className="btn-primary whitespace-nowrap">
          <FaPlus size={13} /> Write New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 py-2.5"
          />
        </div>
        <div className="flex gap-2">
          {(['All', ...ARTICLE_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border
                ${catFilter === cat
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-56 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FaNewspaper className="text-gray-400 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">No posts found</h3>
          <p className="text-sm text-gray-400 mb-5">
            {search || catFilter !== 'All' ? 'Try different filters.' : 'Write your first post.'}
          </p>
          {!search && catFilter === 'All' && (
            <Link href="/admin/articles/new" className="btn-primary text-sm px-4 py-2">
              <FaPlus size={12} /> Write Post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((post) => {
            const date = post.createdAt
              ? format((post.createdAt as any)?.toDate?.() ?? new Date(post.createdAt as any), 'dd MMM yyyy')
              : '';

            return (
              <div key={post.id} className="card overflow-hidden flex flex-col group">
                {/* Image */}
                <div className="relative h-36 bg-gradient-to-br from-pink-50 to-rose-100 flex-shrink-0 overflow-hidden">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaNewspaper className="text-pink-200 text-5xl" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`badge text-xs font-semibold shadow-sm ${post.isPublished ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-white'}`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  {/* Category + date */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`badge text-xs font-semibold ${CAT_STYLE[post.category]}`}>
                      {post.category}
                    </span>
                    {date && <span className="text-xs text-gray-400">{date}</span>}
                  </div>

                  <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1 mb-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">By {post.adminBy}</p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleToggle(post)}
                      disabled={toggling === post.id}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors
                        ${post.isPublished
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                    >
                      {toggling === post.id ? <FaSpinner className="animate-spin" /> :
                        post.isPublished
                          ? <><FaEyeSlash size={11} /> Unpublish</>
                          : <><FaEye size={11} /> Publish</>}
                    </button>
                    <Link
                      href={`/admin/articles/${post.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                    >
                      <FaEdit size={11} /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post)}
                      disabled={deleting === post.id}
                      className="flex items-center justify-center w-9 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      {deleting === post.id
                        ? <FaSpinner className="animate-spin text-xs" />
                        : <FaTrash size={11} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
