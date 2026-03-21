'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/articles/[id]/edit/page.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPost, ArticlePost } from '@/lib/article-service';
import ArticleForm from '@/components/admin/ArticleForm';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [post,    setPost]    = useState<ArticlePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!id) return;
    getPost(id)
      .then((p) => { if (!p) setError('Post not found.'); else setPost(p); })
      .catch(() => setError('Failed to load post.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <FaSpinner className="animate-spin text-blue-500 text-4xl" />
    </div>
  );

  if (error || !post) return (
    <div className="text-center py-32">
      <p className="text-red-500 mb-4">{error}</p>
      <Link href="/admin/articles" className="btn-primary text-sm px-4 py-2">Back to Articles</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <FaArrowLeft size={12} /> Back to Articles
        </Link>
        <h1 className="text-2xl font-display font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-500 text-sm mt-1 truncate">
          Editing: <strong>{post.title}</strong>
        </p>
      </div>
      <ArticleForm initial={post} />
    </div>
  );
}
