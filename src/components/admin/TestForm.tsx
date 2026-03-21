'use client';
// src/components/admin/TestForm.tsx
// ============================================================
// Test metadata form (title, category, time, price, etc.)
// Used in both /admin/tests/new and /admin/tests/[id]/edit
// ============================================================

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createTest, updateTest, MockTest, TEST_CATEGORIES } from '@/lib/test-service';
import QuestionBuilder from './QuestionBuilder';
import { TestQuestion } from '@/lib/test-service';
import {
  FaSave, FaEye, FaSpinner, FaLock, FaUnlock,
} from 'react-icons/fa';

interface TestFormProps {
  initial?: MockTest;
  initialQuestions?: TestQuestion[];
}

const BLANK: Omit<MockTest, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  category: 'General Knowledge',
  totalQuestions: 0,
  timeInMinutes: 30,
  negativeMarking: 0,
  price: 0,
  isPremium: false,
  isPublished: false,
  adminBy: '',
};

export default function TestForm({ initial, initialQuestions = [] }: TestFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [form,       setForm]       = useState({ ...BLANK, ...(initial ?? {}) });
  const [saving,     setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  // testId is set after creating the test; allows QuestionBuilder to save questions
  const [testId,     setTestId]     = useState<string | null>(initial?.id ?? null);

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (form.timeInMinutes < 1) { toast.error('Time must be at least 1 minute'); return; }

    publish ? setPublishing(true) : setSaving(true);

    try {
      const payload = { ...form, isPublished: publish };

      if (isEdit && initial?.id) {
        await updateTest(initial.id, payload);
        toast.success(publish ? 'Test published!' : 'Test saved as draft');
        router.push('/admin/tests');
      } else {
        // Create the test first so we get an ID for questions
        const id = await createTest(payload);
        setTestId(id);
        toast.success(publish ? 'Test created and published! Now add questions below.' : 'Test created as draft. Add questions below.');
        // Stay on page so admin can add questions
        if (publish) router.push('/admin/tests');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const inputCls = 'input';
  const labelCls = 'label';

  return (
    <div className="space-y-7">
      {/* ── Test Metadata ─────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Test Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="md:col-span-2">
            <label className={labelCls}>Test Title *</label>
            <input
              className={inputCls}
              placeholder="e.g. SSC CGL General Awareness 2024"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)}>
              {TEST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Admin By */}
          <div>
            <label className={labelCls}>Created By</label>
            <input
              className={inputCls}
              placeholder="Author name"
              value={form.adminBy ?? ''}
              onChange={(e) => set('adminBy', e.target.value)}
            />
          </div>

          {/* Time */}
          <div>
            <label className={labelCls}>Duration (minutes) *</label>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.timeInMinutes}
              onChange={(e) => set('timeInMinutes', Number(e.target.value))}
            />
          </div>

          {/* Total questions (informational – actual count from QuestionBuilder) */}
          <div>
            <label className={labelCls}>Total Questions</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.totalQuestions}
              onChange={(e) => set('totalQuestions', Number(e.target.value))}
            />
          </div>

          {/* Negative marking */}
          <div>
            <label className={labelCls}>Negative Marking</label>
            <select
              className={inputCls}
              value={form.negativeMarking}
              onChange={(e) => set('negativeMarking', Number(e.target.value))}
            >
              <option value={0}>No negative marking</option>
              <option value={0.25}>−0.25 per wrong answer</option>
              <option value={0.33}>−0.33 per wrong answer</option>
              <option value={0.5}>−0.5 per wrong answer</option>
              <option value={1}>−1 per wrong answer</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className={labelCls}>Price (₹) — 0 for free</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.price}
              onChange={(e) => { const v = Number(e.target.value); set('price', v); set('isPremium', v > 0); }}
            />
          </div>

          {/* Premium toggle */}
          <div className="flex items-center gap-4 md:col-span-2">
            <button
              type="button"
              onClick={() => set('isPremium', !form.isPremium)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2
                ${form.isPremium
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
            >
              {form.isPremium ? <FaLock size={13} /> : <FaUnlock size={13} />}
              {form.isPremium ? 'Premium (Paid)' : 'Free Test'}
            </button>
            <p className="text-xs text-gray-400">
              {form.isPremium ? 'Users must pay to unlock this test.' : 'This test is free for all users.'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving || publishing}
            className="btn-secondary flex-1 justify-center"
          >
            {saving ? <><FaSpinner className="animate-spin" /> Saving…</> : <><FaSave /> Save as Draft</>}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving || publishing}
            className="btn-primary flex-1 justify-center"
          >
            {publishing ? <><FaSpinner className="animate-spin" /> Publishing…</> : <><FaEye /> {isEdit ? 'Update & Publish' : 'Create & Publish'}</>}
          </button>
        </div>
      </div>

      {/* ── Question Builder (shown after test is created) ─── */}
      {testId && (
        <div className="card p-6">
          <QuestionBuilder testId={testId} initialQuestions={initialQuestions} />
        </div>
      )}

      {!testId && (
        <div className="card p-5 border-dashed border-2 border-gray-200 text-center">
          <p className="text-sm text-gray-400">
            💡 Save the test first to unlock the Question Builder below.
          </p>
        </div>
      )}
    </div>
  );
}
