'use client';
// src/components/admin/ArticleForm.tsx
// ============================================================
// Reusable form for creating and editing article posts.
// Covers both "Education Info" and "Current Affairs" categories.
// ============================================================

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  createPost, updatePost, uploadArticleImage,
  ArticlePost, ARTICLE_CATEGORIES,
} from '@/lib/article-service';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { FaSave, FaEye, FaSpinner } from 'react-icons/fa';

interface ArticleFormProps {
  initial?: ArticlePost;
}

const BLANK: Omit<ArticlePost, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  content: '',
  imageUrl: '',
  category: 'Education Info',
  adminBy: '',
  isPublished: false,
  publishedDate: new Date().toISOString().split('T')[0],
};

export default function ArticleForm({ initial }: ArticleFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [form,       setForm]       = useState({ ...BLANK, ...(initial ?? {}) });
  const [saving,     setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  // ── Image upload ──────────────────────────────────────────
  const handleImageUpload = async (file: File): Promise<string> => {
    const url = await uploadArticleImage(file);
    set('imageUrl', url);
    return url;
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async (publish: boolean) => {
    if (!form.title.trim())   { toast.error('Title is required');   return; }
    if (!form.content.trim() || form.content === '<br>') {
      toast.error('Content is required');
      return;
    }
    if (!form.adminBy.trim()) { toast.error('Author name is required'); return; }

    publish ? setPublishing(true) : setSaving(true);

    try {
      const payload = { ...form, isPublished: publish };

      if (isEdit && initial?.id) {
        await updatePost(initial.id, payload);
        toast.success(publish ? 'Post published!' : 'Post saved as draft');
      } else {
        await createPost(payload);
        toast.success(publish ? 'Post published!' : 'Saved as draft');
      }
      router.push('/admin/articles');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  return (
    <form
      onSubmit={(e: FormEvent) => { e.preventDefault(); handleSave(true); }}
      className="space-y-7"
    >
      {/* ── Meta ────────────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Post Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="label">Title *</label>
            <input
              className="input"
              placeholder="e.g. UPSC Prelims 2024 – Complete Syllabus Breakdown"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category *</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {ARTICLE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div>
            <label className="label">Author (Admin By) *</label>
            <input
              className="input"
              placeholder="e.g. Anika Sharma"
              value={form.adminBy}
              onChange={(e) => set('adminBy', e.target.value)}
            />
          </div>

          {/* Publish date */}
          <div>
            <label className="label">Publish Date</label>
            <input
              type="date"
              className="input"
              value={
                form.publishedDate
                  ? form.publishedDate.split('T')[0]
                  : new Date().toISOString().split('T')[0]
              }
              onChange={(e) =>
                set('publishedDate', new Date(e.target.value).toISOString())
              }
            />
          </div>
        </div>
      </div>

      {/* ── Featured Image ───────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">
          Featured Image <span className="font-normal text-gray-400">(optional)</span>
        </h2>
        <ImageUploader
          currentUrl={form.imageUrl}
          onUpload={handleImageUpload}
          onClear={() => set('imageUrl', '')}
        />
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">
          Content *
        </h2>
        <RichTextEditor
          value={form.content}
          onChange={(html) => set('content', html)}
          placeholder="Write your article or current affairs content here…"
          minHeight="360px"
        />
        <p className="text-xs text-gray-400 mt-2">
          Use the toolbar to add headings, bold text, bullet lists, and links.
        </p>
      </div>

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving || publishing}
          className="btn-secondary flex-1 justify-center"
        >
          {saving
            ? <><FaSpinner className="animate-spin" /> Saving…</>
            : <><FaSave /> Save as Draft</>}
        </button>
        <button
          type="submit"
          disabled={saving || publishing}
          className="btn-primary flex-1 justify-center"
        >
          {publishing
            ? <><FaSpinner className="animate-spin" /> Publishing…</>
            : <><FaEye /> {isEdit ? 'Update & Publish' : 'Publish Post'}</>}
        </button>
      </div>
    </form>
  );
}
