'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/tests/[id]/edit/page.tsx

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTest, getQuestionsByTest, MockTest, TestQuestion } from '@/lib/test-service';
import TestForm from '@/components/admin/TestForm';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

export default function EditTestPage() {
  const { id } = useParams<{ id: string }>();
  const [test,      setTest]      = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getTest(id), getQuestionsByTest(id)])
      .then(([t, qs]) => {
        if (!t) { setError('Test not found.'); return; }
        setTest(t);
        setQuestions(qs);
      })
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <FaSpinner className="animate-spin text-purple-500 text-4xl" />
    </div>
  );

  if (error || !test) return (
    <div className="text-center py-32">
      <p className="text-red-500 mb-4">{error}</p>
      <Link href="/admin/tests" className="btn-primary text-sm px-4 py-2">Back to Tests</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link href="/admin/tests" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <FaArrowLeft size={12} /> Back to Tests
        </Link>
        <h1 className="text-2xl font-display font-bold text-gray-900">Edit Test</h1>
        <p className="text-gray-500 text-sm mt-1 truncate">Editing: <strong>{test.title}</strong></p>
      </div>
      <TestForm initial={test} initialQuestions={questions} />
    </div>
  );
}
