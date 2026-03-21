'use client';
export const dynamic = 'force-dynamic';
// src/app/(public)/tests/[id]/start/page.tsx
// Full test engine – timer, palette, multi-language, result screen.

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTest, getQuestionsByTest, MockTest, TestQuestion, Lang, LANG_LABELS } from '@/lib/test-service';
import {
  FaArrowLeft, FaArrowRight, FaClock, FaCheckCircle,
  FaTimesCircle, FaSpinner, FaFlag, FaLanguage,
} from 'react-icons/fa';

const OPT_LETTERS = ['A', 'B', 'C', 'D'];

// ─── Timer hook ────────────────────────────────────────────────
// BUG FIX: timer seconds is passed as a prop that may be 0 initially
// (while test loads). We only start counting when seconds > 0.
function useTimer(seconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(0);
  const expiredRef  = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire; // keep ref fresh without re-triggering effect

  // Initialise remaining when seconds become available (after test loads)
  useEffect(() => {
    if (seconds > 0 && remaining === 0) {
      setRemaining(seconds);
      expiredRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      if (remaining === 0 && seconds > 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, seconds]);

  const mm    = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss    = String(remaining % 60).padStart(2, '0');
  const isLow = remaining > 0 && remaining <= 60;

  return { display: `${mm}:${ss}`, isLow };
}

// ─── Result screen ─────────────────────────────────────────────
function ResultScreen({
  questions, answers, negativeMarking, lang, testId,
}: {
  questions: TestQuestion[];
  answers: Record<number, number>;
  negativeMarking: number;
  lang: Lang;
  testId: string;
}) {
  let correct = 0, wrong = 0, skipped = 0;
  questions.forEach((q, i) => {
    if (answers[i] === undefined)      skipped++;
    else if (answers[i] === q.correctAnswer) correct++;
    else                               wrong++;
  });

  const rawScore   = correct - wrong * negativeMarking;
  const finalScore = Math.max(0, rawScore);
  const total      = questions.length;
  const pct        = total > 0 ? Math.round((finalScore / total) * 100) : 0;

  const bgClass = pct >= 60
    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700'
    : pct >= 40
    ? 'bg-gradient-to-br from-orange-400 to-orange-600'
    : 'bg-gradient-to-br from-red-400 to-red-600';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Score card */}
        <div className="card overflow-hidden text-center">
          <div className={`py-8 px-6 ${bgClass}`}>
            <p className="text-white/80 text-sm font-medium mb-1">Your Score</p>
            <p className="text-6xl font-display font-bold text-white">{finalScore.toFixed(2)}</p>
            <p className="text-white/80 text-sm mt-1">out of {total}</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-white text-sm font-medium">
              {pct}% — {pct >= 60 ? '🎉 Great job!' : pct >= 40 ? '👍 Good effort' : '📚 Keep practising'}
            </div>
          </div>
          <div className="grid grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
            {[
              { label: 'Total',   value: total,   color: 'text-gray-900'    },
              { label: 'Correct', value: correct,  color: 'text-emerald-600' },
              { label: 'Wrong',   value: wrong,    color: 'text-red-500'     },
              { label: 'Skipped', value: skipped,  color: 'text-gray-400'    },
            ].map(({ label, value, color }) => (
              <div key={label} className="py-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          {negativeMarking > 0 && (
            <p className="text-xs text-gray-400 pb-4">
              Negative marking: −{negativeMarking} × {wrong} wrong = −{(negativeMarking * wrong).toFixed(2)} marks
            </p>
          )}
        </div>

        {/* Answer review */}
        <h2 className="font-display font-bold text-gray-900 text-lg">Answer Review</h2>
        <div className="space-y-4">
          {questions.map((q, qi) => {
            const userAns   = answers[qi];
            const isCorrect = userAns === q.correctAnswer;
            const isSkipped = userAns === undefined;
            return (
              <div
                key={q.id}
                className={`card p-5 border-l-4 ${
                  isSkipped ? 'border-gray-300' : isCorrect ? 'border-emerald-400' : 'border-red-400'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    {qi + 1}
                  </span>
                  <p className="text-sm font-medium text-gray-900 flex-1">
                    {q.question[lang] || q.question.en}
                  </p>
                  <div className="flex-shrink-0">
                    {isSkipped
                      ? <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Skipped</span>
                      : isCorrect
                      ? <FaCheckCircle className="text-emerald-500 text-lg" />
                      : <FaTimesCircle className="text-red-400 text-lg" />}
                  </div>
                </div>
                <div className="space-y-1.5 pl-10">
                  {q.options.map((opt, oi) => {
                    const isUserChoice  = userAns === oi;
                    const isCorrectOpt  = q.correctAnswer === oi;
                    return (
                      <div
                        key={oi}
                        className={`text-xs rounded-lg px-3 py-1.5 flex items-center gap-2
                          ${isCorrectOpt
                            ? 'bg-emerald-100 text-emerald-700 font-semibold'
                            : isUserChoice
                            ? 'bg-red-100 text-red-600 font-medium'
                            : 'bg-gray-50 text-gray-600'}`}
                      >
                        <span className="font-bold">{OPT_LETTERS[oi]}.</span>
                        <span>{opt[lang] || opt.en}</span>
                        {isCorrectOpt  && <FaCheckCircle size={11} className="ml-auto text-emerald-600" />}
                        {isUserChoice && !isCorrectOpt && <FaTimesCircle size={11} className="ml-auto text-red-500" />}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <div className="mt-3 pl-10 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4">
          <Link href="/tests"        className="btn-secondary flex-1 justify-center">← All Tests</Link>
          <button onClick={() => window.location.reload()} className="btn-primary flex-1 justify-center">
            Retake Test
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main test engine ──────────────────────────────────────────
export default function TestEnginePage() {
  const { id } = useParams<{ id: string }>();

  const [test,      setTest]      = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [currentIdx,setCurrentIdx]= useState(0);
  const [answers,   setAnswers]   = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [lang,      setLang]      = useState<Lang>('en');

  useEffect(() => {
    if (!id) return;
    Promise.all([getTest(id), getQuestionsByTest(id)])
      .then(([t, qs]) => {
        if (!t || !t.isPublished) { setError('Test not found.'); return; }
        if (qs.length === 0)      { setError('This test has no questions yet.'); return; }
        setTest(t);
        setQuestions(qs);
      })
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
  }, []);

  // FIX: pass actual seconds only after test has loaded (non-zero)
  const timerSeconds = test ? test.timeInMinutes * 60 : 0;
  const { display: timerDisplay, isLow } = useTimer(timerSeconds, handleSubmit);

  const selectAnswer = useCallback((optIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: optIndex }));
  }, [currentIdx]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (submitted) return;
      if (e.key === 'ArrowRight' && currentIdx < questions.length - 1)
        setCurrentIdx((i) => i + 1);
      if (e.key === 'ArrowLeft' && currentIdx > 0)
        setCurrentIdx((i) => i - 1);
      if (e.key === '1') selectAnswer(0);
      if (e.key === '2') selectAnswer(1);
      if (e.key === '3') selectAnswer(2);
      if (e.key === '4') selectAnswer(3);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIdx, questions.length, submitted, selectAnswer]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading test…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <p className="text-red-500 font-medium mb-4">{error}</p>
      <Link href="/tests" className="btn-primary text-sm px-5 py-2.5">← All Tests</Link>
    </div>
  );

  if (submitted) return (
    <ResultScreen
      questions={questions}
      answers={answers}
      negativeMarking={test?.negativeMarking ?? 0}
      lang={lang}
      testId={id}
    />
  );

  const q = questions[currentIdx];
  if (!q) return null;

  const totalAnswered = Object.keys(answers).length;
  const totalQ        = questions.length;

  const handleSubmitWithConfirm = () => {
    const unanswered = totalQ - totalAnswered;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* TOP BAR */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/tests/${id}`} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <FaArrowLeft size={16} />
          </Link>
          <h1 className="text-sm font-semibold text-gray-900 flex-1 truncate hidden sm:block">
            {test?.title}
          </h1>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {totalAnswered}/{totalQ} answered
          </span>
          {/* Language selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all
                  ${lang === l ? 'bg-white text-purple-700 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold flex-shrink-0
            ${isLow ? 'bg-red-100 text-red-600 timer-warning' : 'bg-purple-100 text-purple-700'}`}>
            <FaClock size={13} />
            {timerDisplay}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${totalQ > 0 ? (totalAnswered / totalQ) * 100 : 0}%` }}
          />
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {/* QUESTION PANEL */}
        <div className="flex-1 flex flex-col">
          <div className="card p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold font-display">
                  {currentIdx + 1}
                </span>
                <span className="text-sm text-gray-400">of {totalQ}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">
                <FaLanguage size={11} />
                {LANG_LABELS[lang]}
              </div>
            </div>

            {/* Question image */}
            {q.imageUrl && (
              <div className="relative w-full h-48 mb-5 rounded-xl overflow-hidden border border-gray-200">
                <Image src={q.imageUrl} alt="Question" fill className="object-contain bg-white" unoptimized />
              </div>
            )}

            {/* Question text */}
            <p className="text-base sm:text-lg font-medium text-gray-900 mb-6 leading-relaxed flex-1">
              {q.question[lang] || q.question.en || (
                <span className="text-gray-400 italic">No question text for this language.</span>
              )}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt, oi) => {
                const selected = answers[currentIdx] === oi;
                const optText  = opt[lang] || opt.en;
                return (
                  <button
                    key={oi}
                    onClick={() => selectAnswer(oi)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left
                                transition-all duration-150 text-sm font-medium active:scale-[0.99]
                      ${selected
                        ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50/50'}`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors
                      ${selected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {OPT_LETTERS[oi]}
                    </span>
                    <span className="flex-1">
                      {optText || <span className="text-gray-300 italic">No text</span>}
                    </span>
                    {selected && <FaCheckCircle className="text-purple-500 flex-shrink-0" size={16} />}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-gray-300 text-center mt-4">
              Press 1–4 to select · ← → to navigate
            </p>
          </div>

          {/* Nav buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="btn-secondary flex-1 justify-center disabled:opacity-40"
            >
              <FaArrowLeft size={13} /> Previous
            </button>
            {currentIdx < totalQ - 1 ? (
              <button
                onClick={() => setCurrentIdx((i) => i + 1)}
                className="btn-primary flex-1 justify-center"
              >
                Next <FaArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={handleSubmitWithConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                <FaFlag size={13} /> Submit Test
              </button>
            )}
          </div>
        </div>

        {/* QUESTION PALETTE */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="card p-4 lg:sticky lg:top-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Question Palette</h3>
              <span className="text-xs text-gray-400">{totalAnswered}/{totalQ}</span>
            </div>
            <div className="flex gap-3 mb-4 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-purple-600 rounded inline-block" /> Current</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded inline-block" /> Answered</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-200 rounded inline-block" /> Unanswered</span>
            </div>
            <div className="grid grid-cols-6 lg:grid-cols-5 gap-1.5">
              {questions.map((_, qi) => {
                const isCurrent  = qi === currentIdx;
                const isAnswered = answers[qi] !== undefined;
                return (
                  <button
                    key={qi}
                    onClick={() => setCurrentIdx(qi)}
                    className={`w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center
                                transition-all duration-100 hover:scale-110
                      ${isCurrent
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300'
                        : isAnswered
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {qi + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleSubmitWithConfirm}
              className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700
                         text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <FaFlag size={13} /> Submit Test
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              {totalQ - totalAnswered} question{totalQ - totalAnswered !== 1 ? 's' : ''} remaining
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
