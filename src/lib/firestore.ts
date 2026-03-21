// src/lib/firestore.ts
// ============================================================
// Reusable Firestore CRUD helpers for all collections.
// All functions return typed data and handle errors gracefully.
// ============================================================

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, limit,
  startAfter, QueryDocumentSnapshot, DocumentData,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  JobNotification, MockTest, MockTestQuestion,
  StudyMaterial, ArticlePost, Purchase,
} from '@/types';

// ─── Collection Names ────────────────────────────────────────
export const COLLECTIONS = {
  JOBS: 'jobNotifications',
  TESTS: 'mockTests',
  QUESTIONS: 'mockTestQuestions',
  MATERIALS: 'studyMaterials',
  ARTICLES: 'articlePosts',
  PURCHASES: 'purchases',
} as const;

// ─── Generic helpers ─────────────────────────────────────────

/** Convert Firestore doc snapshot to typed object with id */
function docToData<T>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
  return { id: snapshot.id, ...snapshot.data() } as T;
}

// ─── Job Notifications ───────────────────────────────────────

export async function addJob(data: Omit<JobNotification, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(db, COLLECTIONS.JOBS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateJob(id: string, data: Partial<JobNotification>) {
  await updateDoc(doc(db, COLLECTIONS.JOBS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteJob(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.JOBS, id));
}

export async function getJobs(opts?: {
  status?: 'published' | 'draft';
  category?: string;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
}): Promise<{ jobs: JobNotification[]; lastDoc: QueryDocumentSnapshot | null }> {
  const constraints: any[] = [orderBy('createdAt', 'desc')];
  if (opts?.status) constraints.push(where('status', '==', opts.status));
  if (opts?.category) constraints.push(where('category', '==', opts.category));
  if (opts?.pageSize) constraints.push(limit(opts.pageSize));
  if (opts?.lastDoc) constraints.push(startAfter(opts.lastDoc));

  const snap = await getDocs(query(collection(db, COLLECTIONS.JOBS), ...constraints));
  const jobs = snap.docs.map((d) => docToData<JobNotification>(d));
  const last = snap.docs[snap.docs.length - 1] ?? null;
  return { jobs, lastDoc: last };
}

export async function getJob(id: string): Promise<JobNotification | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.JOBS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as JobNotification;
}

// ─── Mock Tests ──────────────────────────────────────────────

export async function addTest(data: Omit<MockTest, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(db, COLLECTIONS.TESTS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTest(id: string, data: Partial<MockTest>) {
  await updateDoc(doc(db, COLLECTIONS.TESTS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getTests(opts?: {
  status?: 'published' | 'draft';
  category?: string;
  pageSize?: number;
}): Promise<MockTest[]> {
  const constraints: any[] = [orderBy('createdAt', 'desc')];
  if (opts?.status) constraints.push(where('status', '==', opts.status));
  if (opts?.category) constraints.push(where('category', '==', opts.category));
  if (opts?.pageSize) constraints.push(limit(opts.pageSize));

  const snap = await getDocs(query(collection(db, COLLECTIONS.TESTS), ...constraints));
  return snap.docs.map((d) => docToData<MockTest>(d));
}

export async function getTest(id: string): Promise<MockTest | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.TESTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as MockTest;
}

// ─── Mock Test Questions ─────────────────────────────────────

export async function addQuestion(data: Omit<MockTestQuestion, 'id'>) {
  const ref = await addDoc(collection(db, COLLECTIONS.QUESTIONS), data);
  return ref.id;
}

export async function getQuestions(testId: string): Promise<MockTestQuestion[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.QUESTIONS),
      where('testId', '==', testId),
      orderBy('order', 'asc')
    )
  );
  return snap.docs.map((d) => docToData<MockTestQuestion>(d));
}

export async function deleteQuestion(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.QUESTIONS, id));
}

// ─── Study Materials ─────────────────────────────────────────

export async function addMaterial(data: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(db, COLLECTIONS.MATERIALS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMaterial(id: string, data: Partial<StudyMaterial>) {
  await updateDoc(doc(db, COLLECTIONS.MATERIALS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getMaterials(opts?: {
  status?: 'published' | 'draft';
  category?: string;
  pageSize?: number;
}): Promise<StudyMaterial[]> {
  const constraints: any[] = [orderBy('createdAt', 'desc')];
  if (opts?.status) constraints.push(where('status', '==', opts.status));
  if (opts?.category) constraints.push(where('category', '==', opts.category));
  if (opts?.pageSize) constraints.push(limit(opts.pageSize));

  const snap = await getDocs(query(collection(db, COLLECTIONS.MATERIALS), ...constraints));
  return snap.docs.map((d) => docToData<StudyMaterial>(d));
}

export async function getMaterial(id: string): Promise<StudyMaterial | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.MATERIALS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as StudyMaterial;
}

// ─── Articles ─────────────────────────────────────────────────

export async function addArticle(data: Omit<ArticlePost, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(db, COLLECTIONS.ARTICLES), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateArticle(id: string, data: Partial<ArticlePost>) {
  await updateDoc(doc(db, COLLECTIONS.ARTICLES, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getArticles(opts?: {
  status?: 'published' | 'draft';
  category?: string;
  pageSize?: number;
}): Promise<ArticlePost[]> {
  const constraints: any[] = [orderBy('createdAt', 'desc')];
  if (opts?.status) constraints.push(where('status', '==', opts.status));
  if (opts?.category) constraints.push(where('category', '==', opts.category));
  if (opts?.pageSize) constraints.push(limit(opts.pageSize));

  const snap = await getDocs(query(collection(db, COLLECTIONS.ARTICLES), ...constraints));
  return snap.docs.map((d) => docToData<ArticlePost>(d));
}

export async function getArticle(id: string): Promise<ArticlePost | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.ARTICLES, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ArticlePost;
}

// ─── Purchases ───────────────────────────────────────────────

export async function createPurchase(data: Omit<Purchase, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, COLLECTIONS.PURCHASES), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePurchase(id: string, data: Partial<Purchase>) {
  await updateDoc(doc(db, COLLECTIONS.PURCHASES, id), data);
}

/** Check if a user has purchased a specific item */
export async function hasPurchased(userId: string, itemId: string): Promise<boolean> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.PURCHASES),
      where('userId', '==', userId),
      where('itemId', '==', itemId),
      where('status', '==', 'paid')
    )
  );
  return !snap.empty;
}

/** Get all purchases (for admin dashboard) */
export async function getAllPurchases(): Promise<Purchase[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.PURCHASES), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => docToData<Purchase>(d));
}

// ─── Dashboard Stats ─────────────────────────────────────────

export async function getDashboardStats() {
  const [jobsSnap, testsSnap, materialsSnap, purchasesSnap] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.JOBS)),
    getDocs(collection(db, COLLECTIONS.TESTS)),
    getDocs(collection(db, COLLECTIONS.MATERIALS)),
    getDocs(query(collection(db, COLLECTIONS.PURCHASES), where('status', '==', 'paid'))),
  ]);

  const revenue = purchasesSnap.docs.reduce((sum, d) => {
    return sum + ((d.data() as Purchase).amount || 0);
  }, 0);

  return {
    totalJobs: jobsSnap.size,
    totalTests: testsSnap.size,
    totalMaterials: materialsSnap.size,
    totalRevenue: revenue,
    totalPurchases: purchasesSnap.size,
  };
}
