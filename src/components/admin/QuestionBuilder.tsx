'use client';
// src/components/admin/QuestionBuilder.tsx
// ============================================================
// Multi-language Question Builder
// Allows admins to add/edit/delete questions for a test.
// Each question has EN/TE/HI text for question + 4 options.
// ============================================================

import { useState, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  addQuestion, updateQuestion, deleteQuestion,
  uploadQuestionImage, TestQuestion, MLText, blankML,
  blankQuestion, Lang, LANG_LABELS,
} from '@/lib/test-service';
import {
  FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaImage,
  FaSpinner, FaChevronDown, FaChevronUp, FaLanguage,
} from 'react-icons/fa';

// ─── OPTION LETTERS ───────────────────────────────────────────
const OPT_LABELS = ['A', 'B', 'C', 'D'];

// ─── Single ML field (EN / TE / HI tabs) ─────────────────────
function MLField({
  label, value, onChange, placeholder, multiline = false,
}: {
  label: string;
  value: MLText;
  onChange: (v: MLText) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [activeLang, setActiveLang] = useState<Lang>('en');
  const cls = 'input text-sm' + (multiline ? ' min-h-[80px] resize-y' : '');

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        {/* Language tabs */}
        <div className="flex gap-1">
          {(Object.keys(LANG_LABELS) as Lang[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors
                ${activeLang === lang
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {multiline ? (
        <textarea
          className={cls}
          rows={3}
          placeholder={`${placeholder ?? label} (${LANG_LABELS[activeLang]})`}
          value={value[activeLang]}
          onChange={(e) => onChange({ ...value, [activeLang]: e.target.value })}
        />
      ) : (
        <input
          type="text"
          className={cls}
          placeholder={`${placeholder ?? label} (${LANG_LABELS[activeLang]})`}
          value={value[activeLang]}
          onChange={(e) => onChange({ ...value, [activeLang]: e.target.value })}
        />
      )}
      {/* Progress indicator for other langs */}
      <div className="flex gap-1.5">
        {(Object.keys(LANG_LABELS) as Lang[]).map((lang) => (
          <span
            key={lang}
            className={`text-xs px-1.5 py-0.5 rounded ${
              value[lang].trim()
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {lang.toUpperCase()} {value[lang].trim() ? '✓' : '○'}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Single question form ─────────────────────────────────────
function QuestionForm({
  testId,
  initial,
  orderIndex,
  onSaved,
  onCancel,
}: {
  testId: string;
  initial?: TestQuestion;
  orderIndex: number;
  onSaved: (q: TestQuestion) => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial?.id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [question,  setQuestion]  = useState<MLText>(initial?.question  ?? blankML());
  const [options,   setOptions]   = useState<MLText[]>(initial?.options  ?? [blankML(), blankML(), blankML(), blankML()]);
  const [correct,   setCorrect]   = useState<number>(initial?.correctAnswer ?? 0);
  const [explain,   setExplain]   = useState(initial?.explanation ?? '');
  const [imageUrl,  setImageUrl]  = useState(initial?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const updateOption = (idx: number, val: MLText) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleImage = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Image files only'); return; }
    setUploading(true);
    try {
      const url = await uploadQuestionImage(file);
      setImageUrl(url);
    } catch { toast.error('Image upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!question.en.trim()) { toast.error('English question is required'); return; }
    if (options.some((o) => !o.en.trim())) { toast.error('All 4 English options are required'); return; }

    setSaving(true);
    try {
      const payload: Omit<TestQuestion, 'id'> = {
        testId,
        question,
        options,
        correctAnswer: correct,
        explanation: explain,
        imageUrl,
        order: orderIndex,
      };

      if (isEdit && initial?.id) {
        await updateQuestion(initial.id, payload);
        onSaved({ id: initial.id, ...payload });
      } else {
        const id = await addQuestion(payload);
        onSaved({ id, ...payload });
      }
      toast.success(isEdit ? 'Question updated' : 'Question added');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-purple-200 rounded-2xl bg-purple-50/40 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">
          {isEdit ? `Edit Question ${orderIndex + 1}` : `New Question ${orderIndex + 1}`}
        </h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <FaTimes size={16} />
        </button>
      </div>

      {/* Question text */}
      <MLField
        label="Question Text *"
        value={question}
        onChange={setQuestion}
        multiline
        placeholder="Enter question"
      />

      {/* Image upload */}
      <div>
        <label className="label">Question Image (optional)</label>
        {imageUrl ? (
          <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200">
            <Image src={imageUrl} alt="Question" fill className="object-contain bg-white" unoptimized />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <FaTrash size={11} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-2
                       text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors text-sm"
          >
            {uploading ? <FaSpinner className="animate-spin text-xl" /> : <FaImage className="text-xl" />}
            {uploading ? 'Uploading…' : 'Click to upload image'}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }}
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="label">Options * (mark correct answer)</label>
        {options.map((opt, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-3 border-2 transition-colors ${
              correct === idx ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {/* Correct answer selector */}
              <button
                type="button"
                onClick={() => setCorrect(idx)}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all
                  ${correct === idx
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-emerald-100'
                  }`}
                title={correct === idx ? 'Correct answer' : 'Set as correct'}
              >
                {correct === idx ? <FaCheck size={11} /> : OPT_LABELS[idx]}
              </button>
              <span className="text-xs font-semibold text-gray-500">
                Option {OPT_LABELS[idx]} {correct === idx && <span className="text-emerald-600">(Correct)</span>}
              </span>
            </div>
            <MLField
              label=""
              value={opt}
              onChange={(v) => updateOption(idx, v)}
              placeholder={`Option ${OPT_LABELS[idx]}`}
            />
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div>
        <label className="label">Explanation (shown after result)</label>
        <textarea
          className="input text-sm min-h-[80px] resize-y"
          rows={3}
          placeholder="Explain the correct answer…"
          value={explain}
          onChange={(e) => setExplain(e.target.value)}
        />
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center text-sm py-2.5">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex-1 justify-center text-sm py-2.5"
        >
          {saving ? <><FaSpinner className="animate-spin" /> Saving…</> : <><FaCheck /> Save Question</>}
        </button>
      </div>
    </div>
  );
}

// ─── Question list item ────────────────────────────────────────
function QuestionItem({
  q, index, onEdit, onDelete,
}: {
  q: TestQuestion;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-purple-700 text-sm">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {q.question.en || <span className="text-gray-400 italic">No English text</span>}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              Correct: {OPT_LABELS[q.correctAnswer]}
            </span>
            {q.imageUrl && <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Has image</span>}
            {/* Language completeness */}
            {(['en', 'te', 'hi'] as Lang[]).map((lang) => (
              <span key={lang} className={`text-xs px-1.5 py-0.5 rounded ${q.question[lang] ? 'text-emerald-500' : 'text-gray-300'}`}>
                {lang.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600"
          >
            {expanded ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
          </button>
          <button onClick={onEdit} className="p-1.5 text-blue-500 hover:text-blue-700">
            <FaEdit size={13} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-red-400 hover:text-red-600">
            <FaTrash size={13} />
          </button>
        </div>
      </div>

      {/* Expanded: show all options */}
      {expanded && (
        <div className="mt-3 pl-11 space-y-1.5">
          {q.options.map((opt, i) => (
            <div
              key={i}
              className={`text-xs rounded-lg px-3 py-1.5 ${
                i === q.correctAnswer ? 'bg-emerald-100 text-emerald-700 font-semibold' : 'bg-gray-50 text-gray-600'
              }`}
            >
              {OPT_LABELS[i]}. {opt.en || <span className="italic text-gray-400">No English text</span>}
            </div>
          ))}
          {q.explanation && (
            <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg mt-1">
              💡 {q.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────
export default function QuestionBuilder({
  testId,
  initialQuestions = [],
}: {
  testId: string;
  initialQuestions?: TestQuestion[];
}) {
  const [questions,   setQuestions]   = useState<TestQuestion[]>(initialQuestions);
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

  const handleSaved = (q: TestQuestion) => {
    setQuestions((prev) => {
      const exists = prev.findIndex((x) => x.id === q.id);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = q;
        return next;
      }
      return [...prev, q];
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (q: TestQuestion) => {
    if (!confirm('Delete this question?')) return;
    setDeletingId(q.id!);
    try {
      await deleteQuestion(q.id!, q.imageUrl);
      setQuestions((prev) => prev.filter((x) => x.id !== q.id));
      toast.success('Question deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Questions</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {questions.length} question{questions.length !== 1 ? 's' : ''} added
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="btn-primary text-sm px-4 py-2"
        >
          <FaPlus size={12} /> Add Question
        </button>
      </div>

      {/* Add form */}
      {showForm && !editingId && (
        <QuestionForm
          testId={testId}
          orderIndex={questions.length}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Questions list */}
      {questions.length === 0 && !showForm ? (
        <div className="card flex flex-col items-center py-12 text-center border-dashed">
          <FaLanguage className="text-gray-300 text-4xl mb-3" />
          <p className="text-sm text-gray-400">No questions yet. Click "Add Question" to start.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            editingId === q.id ? (
              <QuestionForm
                key={q.id}
                testId={testId}
                initial={q}
                orderIndex={idx}
                onSaved={handleSaved}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div key={q.id} className={deletingId === q.id ? 'opacity-50 pointer-events-none' : ''}>
                <QuestionItem
                  q={q}
                  index={idx}
                  onEdit={() => { setEditingId(q.id!); setShowForm(false); }}
                  onDelete={() => handleDelete(q)}
                />
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
