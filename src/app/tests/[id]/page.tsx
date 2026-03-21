'use client';
export const dynamic = 'force-dynamic';
// src/app/(public)/tests/[id]/page.tsx
// ============================================================
// Test Instructions Page
// Shown before the user starts the test.
// Premium tests show an unlock/payment prompt.
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTest, MockTest } from '@/lib/test-service';
import {
  FaArrowLeft, FaClock, FaQuestion, FaExclamationTriangle,
  FaCheckCircle, FaLock, FaPlay, FaSpinner, FaLanguage,
} from 'react-icons/fa';

export default function TestInstructionsPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [test,    setTest]    = useState<MockTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  // In a real app this comes from checking the `purchases` collection
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTest(id)
      .then((t) => {
        if (!t || !t.isPublished) setError('Test not found.');
        else setTest(t);
      })
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <FaSpinner className="animate-spin text-purple-500 text-4xl" />
    </div>
  );

  if (error || !test) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">{error}</h2>
      <Link href="/tests" className="btn-primary text-sm px-5 py-2.5">← All Tests</Link>
    </div>
  );

  const isPremiumLocked = test.isPremium && !unlocked;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/tests" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <FaArrowLeft size={12} /> All Tests
        </Link>

        {/* Header card */}
        <div className="card overflow-hidden mb-5">
          <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600" />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaClipboardList className="text-purple-600 text-2xl" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                  {test.category}
                </span>
                <h1 className="text-xl font-display font-bold text-gray-900 mt-2 leading-snug">
                  {test.title}
                </h1>
                {test.adminBy && (
                  <p className="text-sm text-gray-400 mt-1">Created by {test.adminBy}</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: FaQuestion, label: 'Questions', value: test.totalQuestions, color: 'text-purple-500' },
                { icon: FaClock,    label: 'Duration',  value: `${test.timeInMinutes} min`, color: 'text-blue-500' },
                { icon: FaExclamationTriangle, label: 'Negative', value: test.negativeMarking > 0 ? `-${test.negativeMarking}` : 'None', color: 'text-orange-500' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <Icon className={`${color} mx-auto mb-1`} size={16} />
                  <p className="font-bold text-gray-900 text-base">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-emerald-500" /> Instructions
          </h2>
          <ul className="space-y-2.5 text-sm text-gray-600">
            {[
              `This test has ${test.totalQuestions} questions. You have ${test.timeInMinutes} minutes.`,
              'Each correct answer gives +1 mark.' + (test.negativeMarking > 0 ? ` Each wrong answer deducts ${test.negativeMarking} mark.` : ' No marks deducted for wrong answers.'),
              'You can navigate between questions using the question palette.',
              'The test will auto-submit when the timer reaches zero.',
              'You can switch language (EN / TE / HI) anytime — it will NOT reset your answers.',
              'Do not refresh or close the tab during the test.',
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                {line}
              </li>
            ))}
          </ul>

          {/* Language note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2.5">
            <FaLanguage className="text-blue-500 text-xl flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Multi-language:</strong> This test supports English, Telugu (తెలుగు), and Hindi (हिंदी).
              Use the language selector in the test interface to switch at any time.
            </p>
          </div>
        </div>

        {/* Premium lock or Start button */}
        {isPremiumLocked ? (
          <div className="card p-6 text-center border-amber-200 bg-amber-50">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-amber-500 text-3xl" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-lg mb-2">Premium Test</h3>
            <p className="text-gray-500 text-sm mb-5">
              Unlock this test for ₹{test.price} to access all {test.totalQuestions} questions.
            </p>
            <button
              onClick={() => {
                // TODO: Integrate Razorpay payment flow here.
                // For now simulate unlock:
                alert('Payment integration: connect Razorpay API route /api/create-order here.');
                setUnlocked(true);
              }}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FaLock size={14} /> Unlock for ₹{test.price}
            </button>
            <p className="text-xs text-gray-400 mt-3">Secure payment via Razorpay</p>
          </div>
        ) : (
          <button
            onClick={() => router.push(`/tests/${test.id}/start`)}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700
                       text-white font-bold rounded-2xl text-lg flex items-center justify-center gap-3
                       transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <FaPlay size={18} /> Start Test Now
          </button>
        )}
      </div>
    </div>
  );
}
