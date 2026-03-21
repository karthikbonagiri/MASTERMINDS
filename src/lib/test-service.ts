// src/lib/test-service.ts
// ============================================================
// Mock Test System – Firebase Service Layer
// Handles mockTests + mockTestQuestions collections.
// Supports multi-language questions (English, Telugu, Hindi).
// ============================================================

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// ─── Collection constants ─────────────────────────────────────
const TESTS_COL = 'mockTests';
const QUESTIONS_COL = 'mockTestQuestions';

// ─── Language type ────────────────────────────────────────────
export type Lang = 'en' | 'te' | 'hi';

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  te: 'తెలుగు',
  hi: 'हिंदी',
};

// ─── Multi-language text block ────────────────────────────────
export interface MLText {
  en: string;
  te: string;
  hi: string;
}

// ─── Question type ────────────────────────────────────────────
export interface TestQuestion {
  id?: string;
  testId: string;
  question: MLText;
  options: MLText[];          // Always 4 options (index 0–3)
  correctAnswer: number;      // Index: 0, 1, 2, or 3
  explanation?: string;       // Plain text, shown after submit
  imageUrl?: string;
  order: number;
}

// ─── Test type ────────────────────────────────────────────────
export interface MockTest {
  id?: string;
  title: string;
  category: string;
  totalQuestions: number;
  timeInMinutes: number;
  negativeMarking: number;    // e.g. 0.25 → −0.25 per wrong answer
  price: number;              // 0 = free
  isPremium: boolean;
  isPublished: boolean;
  adminBy?: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

// ─── Blank ML text helper ─────────────────────────────────────
export const blankML = (): MLText => ({ en: '', te: '', hi: '' });

// ─── Blank question helper ────────────────────────────────────
export const blankQuestion = (testId: string, order: number): Omit<TestQuestion, 'id'> => ({
  testId,
  question: blankML(),
  options: [blankML(), blankML(), blankML(), blankML()],
  correctAnswer: 0,
  explanation: '',
  imageUrl: '',
  order,
});

// ─── Upload question image ────────────────────────────────────
export async function uploadQuestionImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `question-images/${uuidv4()}.${ext}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    task.on(
      'state_changed',
      (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });
}

// ─── Delete image from storage ────────────────────────────────
export async function deleteQuestionImage(url: string): Promise<void> {
  try { await deleteObject(ref(storage, url)); } catch {}
}

// ══════════════════════════════════════════════════════════════
// TEST CRUD
// ══════════════════════════════════════════════════════════════

export async function createTest(
  data: Omit<MockTest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, TESTS_COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTest(
  id: string,
  data: Partial<Omit<MockTest, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, TESTS_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTest(id: string): Promise<void> {
  // Delete all questions belonging to this test first
  const qs = await getQuestionsByTest(id);
  await Promise.all(qs.map((q) => deleteQuestion(q.id!, q.imageUrl)));
  await deleteDoc(doc(db, TESTS_COL, id));
}

export async function togglePublish(id: string, current: boolean): Promise<void> {
  await updateDoc(doc(db, TESTS_COL, id), {
    isPublished: !current,
    updatedAt: serverTimestamp(),
  });
}

/** Get ALL tests (admin) */
export async function getTests(): Promise<MockTest[]> {
  const snap = await getDocs(
    query(collection(db, TESTS_COL), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockTest));
}

/** Get published tests only (public) */
export async function getPublishedTests(category?: string): Promise<MockTest[]> {
  const constraints: any[] = [
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
  ];
  if (category) constraints.splice(1, 0, where('category', '==', category));
  const snap = await getDocs(query(collection(db, TESTS_COL), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockTest));
}

/** Get single test by ID */
export async function getTest(id: string): Promise<MockTest | null> {
  const snap = await getDoc(doc(db, TESTS_COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as MockTest;
}

// ══════════════════════════════════════════════════════════════
// QUESTION CRUD
// ══════════════════════════════════════════════════════════════

export async function addQuestion(
  data: Omit<TestQuestion, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, QUESTIONS_COL), data);
  return ref.id;
}

export async function updateQuestion(
  id: string,
  data: Partial<Omit<TestQuestion, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, QUESTIONS_COL, id), data);
}

export async function deleteQuestion(id: string, imageUrl?: string): Promise<void> {
  await deleteDoc(doc(db, QUESTIONS_COL, id));
  if (imageUrl) await deleteQuestionImage(imageUrl);
}

export async function getQuestionsByTest(testId: string): Promise<TestQuestion[]> {
  const snap = await getDocs(
    query(
      collection(db, QUESTIONS_COL),
      where('testId', '==', testId),
      orderBy('order', 'asc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TestQuestion));
}

// ─── Test categories ──────────────────────────────────────────
export const TEST_CATEGORIES = [
  'General Knowledge',
  'Current Affairs',
  'Mathematics',
  'English',
  'Reasoning',
  'Science',
  'History',
  'Geography',
  'Polity',
  'Economics',
  'Computer',
  'Banking',
  'Railway',
  'SSC',
  'UPSC',
  'State PSC',
  'Other',
] as const;
