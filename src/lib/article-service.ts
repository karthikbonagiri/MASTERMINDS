// src/lib/article-service.ts
// ============================================================
// Articles – Firebase Service Layer
// Handles the `articlePosts` Firestore collection.
// Covers both "Education Info" and "Current Affairs" categories.
// Image uploads go to Firebase Storage under article-images/.
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

// ─── Collection name ──────────────────────────────────────────
const COL = 'articlePosts';

// ─── Category constants ───────────────────────────────────────
export const ARTICLE_CATEGORIES = [
  'Education Info',
  'Current Affairs',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

// ─── Type definition ──────────────────────────────────────────
export interface ArticlePost {
  id?: string;
  title: string;
  content: string;           // HTML string from rich-text editor
  imageUrl?: string;
  category: ArticleCategory;
  adminBy: string;
  isPublished: boolean;
  publishedDate?: string;    // ISO date string, used for date display
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

// ══════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ══════════════════════════════════════════════════════════════

export async function uploadArticleImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `article-images/${uuidv4()}.${ext}`;
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

async function safeDeleteImage(url?: string) {
  if (!url) return;
  try { await deleteObject(ref(storage, url)); } catch {}
}

// ══════════════════════════════════════════════════════════════
// FIRESTORE CRUD
// ══════════════════════════════════════════════════════════════

export async function createPost(
  data: Omit<ArticlePost, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    publishedDate: data.publishedDate ?? new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePost(
  id: string,
  data: Partial<Omit<ArticlePost, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(id: string, imageUrl?: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
  await safeDeleteImage(imageUrl);
}

export async function togglePublish(id: string, current: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    isPublished: !current,
    updatedAt: serverTimestamp(),
  });
}

/** Get ALL posts — admin view (published + drafts) */
export async function getPosts(category?: ArticleCategory): Promise<ArticlePost[]> {
  const constraints: any[] = [orderBy('createdAt', 'desc')];
  if (category) constraints.unshift(where('category', '==', category));
  const snap = await getDocs(query(collection(db, COL), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ArticlePost));
}

/** Get published posts — public view */
export async function getPublishedPosts(category?: ArticleCategory): Promise<ArticlePost[]> {
  const constraints: any[] = [
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
  ];
  if (category) constraints.splice(1, 0, where('category', '==', category));
  const snap = await getDocs(query(collection(db, COL), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ArticlePost));
}

/** Get a single post by ID */
export async function getPost(id: string): Promise<ArticlePost | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ArticlePost;
}
