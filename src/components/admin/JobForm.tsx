'use client';
// src/components/admin/JobForm.tsx
// ============================================================
// Reusable form for creating AND editing a job notification.
// Props:
//   initial   – pre-filled values for edit mode (undefined = create)
//   onSuccess – callback after successful save
// ============================================================

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  createJob, updateJob, uploadJobImage, Job, JOB_CATEGORIES,
} from '@/lib/job-service';
import ImageUploader from '@/components/ui/ImageUploader';
import {
  FaSave, FaEye, FaSpinner, FaLink, FaYoutube,
} from 'react-icons/fa';

interface JobFormProps {
  initial?: Job;       // If provided → edit mode
  onSuccess?: () => void;
}

const BLANK: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  company: '',
  category: 'Government Jobs',
  description: '',
  eligibility: '',
  applyLink: '',
  videoLink: '',
  imageUrl: '',
  adminBy: '',
  isPublished: false,
};

export default function JobForm({ initial, onSuccess }: JobFormProps) {
  const router   = useRouter();
  const isEdit   = !!initial?.id;

  const [form, setForm] = useState({
    ...BLANK,
    ...(initial ?? {}),
  });
  const [saving,     setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [imageFile,  setImageFile]  = useState<File | null>(null);

  // ── Field change handler ─────────────────────────────────
  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ── Image upload handler (called by ImageUploader) ───────
  const handleImageUpload = async (file: File): Promise<string> => {
    setImageFile(file);
    const url = await uploadJobImage(file, () => {});
    set('imageUrl', url);
    return url;
  };

  // ── Save (published or draft) ────────────────────────────
  const handleSave = async (publish: boolean) => {
    if (!form.title.trim())   { toast.error('Title is required');   return; }
    if (!form.company.trim()) { toast.error('Company is required'); return; }
    if (!form.adminBy.trim()) { toast.error('Admin By is required'); return; }

    publish ? setPublishing(true) : setSaving(true);

    try {
      const payload = { ...form, isPublished: publish };

      if (isEdit && initial?.id) {
        await updateJob(initial.id, payload);
        toast.success(publish ? 'Job published!' : 'Job saved as draft');
      } else {
        await createJob(payload);
        toast.success(publish ? 'Job published!' : 'Job saved as draft');
      }

      onSuccess?.();
      router.push('/admin/jobs');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  // ── Shared input props ───────────────────────────────────
  const inputCls = 'input';
  const labelCls = 'label';

  return (
    <form
      onSubmit={(e: FormEvent) => { e.preventDefault(); handleSave(true); }}
      className="space-y-7"
    >
      {/* ── Basic info ─────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="md:col-span-2">
            <label className={labelCls}>Job Title *</label>
            <input
              className={inputCls}
              placeholder="e.g. Staff Selection Commission – CGL 2024"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          {/* Company */}
          <div>
            <label className={labelCls}>Organisation / Company *</label>
            <input
              className={inputCls}
              placeholder="e.g. Staff Selection Commission"
              value={form.company}
              onChange={(e) => set('company', e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category *</label>
            <select
              className={inputCls}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {JOB_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Admin By */}
          <div>
            <label className={labelCls}>Admin By (Author) *</label>
            <input
              className={inputCls}
              placeholder="e.g. Rahul Kumar"
              value={form.adminBy}
              onChange={(e) => set('adminBy', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Description & eligibility ──────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">
          Details
        </h2>

        <div>
          <label className={labelCls}>Description *</label>
          <textarea
            className={`${inputCls} min-h-[140px] resize-y`}
            placeholder="Full job description, important dates, vacancies, salary, etc."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={6}
          />
        </div>

        <div>
          <label className={labelCls}>Eligibility Criteria</label>
          <textarea
            className={`${inputCls} min-h-[100px] resize-y`}
            placeholder="Educational qualifications, age limit, experience required…"
            value={form.eligibility}
            onChange={(e) => set('eligibility', e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* ── Links ─────────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">
          Links
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>
              <FaLink className="inline mr-1.5 text-blue-500" size={12} />
              Apply Link (Official Website)
            </label>
            <input
              type="url"
              className={inputCls}
              placeholder="https://ssc.nic.in/apply"
              value={form.applyLink}
              onChange={(e) => set('applyLink', e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>
              <FaYoutube className="inline mr-1.5 text-red-500" size={13} />
              Video Link (YouTube)
            </label>
            <input
              type="url"
              className={inputCls}
              placeholder="https://youtube.com/watch?v=..."
              value={form.videoLink}
              onChange={(e) => set('videoLink', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Image ─────────────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3 mb-5">
          Featured Image
        </h2>
        <ImageUploader
          currentUrl={form.imageUrl}
          onUpload={handleImageUpload}
          onClear={() => set('imageUrl', '')}
        />
      </div>

      {/* ── Action buttons ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* Save as draft */}
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving || publishing}
          className="btn-secondary flex-1 justify-center"
        >
          {saving ? <><FaSpinner className="animate-spin" /> Saving…</> : <><FaSave /> Save as Draft</>}
        </button>

        {/* Publish */}
        <button
          type="submit"
          disabled={saving || publishing}
          className="btn-primary flex-1 justify-center"
        >
          {publishing
            ? <><FaSpinner className="animate-spin" /> Publishing…</>
            : <><FaEye /> {isEdit ? 'Update & Publish' : 'Publish Job'}</>}
        </button>
      </div>
    </form>
  );
}
