'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/articles/new/page.tsx
import Link from 'next/link';
import ArticleForm from '@/components/admin/ArticleForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function NewArticlePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <FaArrowLeft size={12} /> Back to Articles
        </Link>
        <h1 className="text-2xl font-display font-bold text-gray-900">Write New Post</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new Education Info or Current Affairs post.
        </p>
      </div>
      <ArticleForm />
    </div>
  );
}
