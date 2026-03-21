'use client';
// src/components/admin/MaterialForm.tsx
// ============================================================
// Reusable form for creating and editing study materials.
// Used by /admin/materials/new and /admin/materials/[id]/edit
// ============================================================

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  createMaterial, updateMaterial,
  uploadMaterialPdf, uploadMaterialThumbnail,
  StudyMaterial, MATERIAL_CATEGORIES,
} from '@/lib/material-service';
import PdfUploader from '@/components/ui/PdfUploader';
import ImageUploader from '@/components/ui/ImageUploader';
import { FaSave, FaEye, FaSpinner } from 'react-icons/fa';

interface MaterialFormProps {
  initial?: StudyMaterial;
}

const BLANK: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  category: 'General Knowledge',
  description: '',
  fileUrl: '',
  fileName: '',
  fileSizeKb: 0,
  previewPages: 3,
  price: 0,
  isPublished: false,
  adminBy: '',
  thumbnailUrl: '',
};

export default function MaterialForm({ initial }: MaterialFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [form,       setForm]       = useState({ ...BLANK, ...(initial ?? {}) });
  const [saving,     setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  // ── PDF upload handler ────────────────────────────────────
  const handlePdfUpload = async (file: File) => {
    const { url, fileName, fileSizeKb } = await uploadMaterialPdf(file, setPdfProgress);
    set('fileUrl',    url);
    set('fileName',   fileName);
    set('fileSizeKb', fileSizeKb);
  };

  // ── Thumbnail upload handler ──────────────────────────────
  const handleThumbnailUpload = async (file: File): Promise<string> => {
    const url = await uploadMaterialThumbnail(file);
    set('thumbnailUrl', url);
    return url;
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async (publish: boolean) => {
    if (!form.title.trim())   { toast.error('Title is required');       return; }
    if (!form.fileUrl.trim()) { toast.error('Please upload a PDF file'); return; }
    if (form.previewPages < 0){ toast.error('Preview pages must be ≥ 0'); return; }

    publish ? setPublishing(true) : setSaving(true);

    try {
      const payload = { ...form, isPublished: publish };
      if (isEdit && initial?.id) {
        await updateMaterial(initial.id, payload);
        toast.success(publish ? 'Material published!' : 'Material saved as draft');
      } else {
        await createMaterial(payload);
        toast.success(publish ? 'Material published!' : 'Saved as draft');
      }
      router.push('/admin/materials');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const inputCls = 'input';
  const labelCls = 'label';

  return (
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleSave(true); }} className="space-y-7">

      {/* ── Basic info ─────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Material Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelCls}>Title *</label>
            <input
              className={inputCls}
              placeholder="e.g. SSC CGL Complete Mathematics Notes 2024"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Category *</label>
            <select className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)}>
              {MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Author / Admin By</label>
            <input
              className={inputCls}
              placeholder="e.g. Priya Sharma"
              value={form.adminBy ?? ''}
              onChange={(e) => set('adminBy', e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea
              className={`${inputCls} min-h-[110px] resize-y`}
              rows={4}
              placeholder="What does this material cover? Topics, chapters, exam it targets…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Pricing & Access ──────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Pricing & Access</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Price (₹) — 0 for free</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.price}
              onChange={(e) => set('price', Number(e.target.value))}
            />
          </div>

          <div>
            <label className={labelCls}>Free Preview Pages</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.previewPages}
              onChange={(e) => set('previewPages', Number(e.target.value))}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Users can view this many pages without paying.
            </p>
          </div>
        </div>

        {form.price > 0 && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
            💡 Users will need to pay ₹{form.price} to download the full PDF.
            Only {form.previewPages} page{form.previewPages !== 1 ? 's' : ''} will be shown for free.
          </div>
        )}
      </div>

      {/* ── PDF Upload ────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">PDF File *</h2>

        {form.fileUrl && !form.fileName ? (
          <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-700 border border-emerald-200">
            ✅ PDF already uploaded. Upload a new file to replace it.
          </div>
        ) : null}

        <PdfUploader
          currentFileName={form.fileName}
          onUpload={handlePdfUpload}
          onClear={() => { set('fileUrl', ''); set('fileName', ''); set('fileSizeKb', 0); }}
        />

        {form.fileSizeKb > 0 && (
          <p className="text-xs text-gray-400">File size: {(form.fileSizeKb / 1024).toFixed(2)} MB</p>
        )}
      </div>

      {/* ── Cover Image (optional) ────────────────────────── */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
          Cover Image <span className="font-normal text-gray-400">(optional)</span>
        </h2>
        <ImageUploader
          currentUrl={form.thumbnailUrl}
          onUpload={handleThumbnailUpload}
          onClear={() => set('thumbnailUrl', '')}
        />
      </div>

      {/* ── Action buttons ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving || publishing}
          className="btn-secondary flex-1 justify-center"
        >
          {saving ? <><FaSpinner className="animate-spin" /> Saving…</> : <><FaSave /> Save as Draft</>}
        </button>
        <button
          type="submit"
          disabled={saving || publishing}
          className="btn-primary flex-1 justify-center"
        >
          {publishing
            ? <><FaSpinner className="animate-spin" /> Publishing…</>
            : <><FaEye /> {isEdit ? 'Update & Publish' : 'Publish Material'}</>}
        </button>
      </div>
    </form>
  );
}
