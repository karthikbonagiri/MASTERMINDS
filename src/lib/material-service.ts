// src/lib/material-service.ts
// ============================================================
// Study Materials – Firebase Service Layer
// Handles studyMaterials collection + Firebase Storage for PDFs.
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
const COL = 'studyMaterials';

// ─── Type ─────────────────────────────────────────────────────
export interface StudyMaterial {
  id?: string;
  title: string;
  category: string;
  description: string;
  fileUrl: string;           // Firebase Storage download URL (full PDF)
  fileName?: string;         // Original file name, shown to user
  fileSizeKb?: number;       // File size in KB
  previewPages: number;      // How many pages to show without payment
  price: number;             // 0 = free
  isPublished: boolean;
  adminBy?: string;
  thumbnailUrl?: string;     // Optional cover image
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

// ══════════════════════════════════════════════════════════════
// FILE UPLOAD HELPERS
// ══════════════════════════════════════════════════════════════

/**
 * Upload a PDF to Firebase Storage.
 * Returns { url, fileName, fileSizeKb }
 *
 * SECURITY NOTE:
 * The returned URL is a Firebase Storage download URL.
 * For production, configure Firebase Storage Rules so only
 * authenticated/paid users can access material PDFs:
 *
 *   match /material-pdfs/{file} {
 *     allow read: if request.auth != null; // tighten with purchase check
 *     allow write: if false; // only admin SDK writes
 *   }
 *
 * The PDF viewer in this app uses the URL only for the preview,
 * and we deliberately avoid exposing the raw URL in the DOM
 * for unpaid users (see the PDF viewer component).
 */
export async function uploadMaterialPdf(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ url: string; fileName: string; fileSizeKb: number }> {
  if (file.type !== 'application/pdf') throw new Error('Only PDF files are allowed.');

  const ext  = 'pdf';
  const path = `material-pdfs/${uuidv4()}.${ext}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, { contentType: 'application/pdf' });
    task.on(
      'state_changed',
      (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({
          url,
          fileName: file.name,
          fileSizeKb: Math.round(file.size / 1024),
        });
      }
    );
  });
}

/** Upload a thumbnail/cover image */
export async function uploadMaterialThumbnail(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `material-thumbnails/${uuidv4()}.${ext}`;
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

/** Safe delete from storage (ignores not-found errors) */
async function safeDelete(url?: string) {
  if (!url) return;
  try { await deleteObject(ref(storage, url)); } catch {}
}

// ══════════════════════════════════════════════════════════════
// FIRESTORE CRUD
// ══════════════════════════════════════════════════════════════

export async function createMaterial(
  data: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateMaterial(
  id: string,
  data: Partial<Omit<StudyMaterial, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Delete material record + all associated storage files */
export async function deleteMaterial(
  id: string,
  fileUrl?: string,
  thumbnailUrl?: string
): Promise<void> {
  await deleteDoc(doc(db, COL, id));
  await Promise.all([safeDelete(fileUrl), safeDelete(thumbnailUrl)]);
}

export async function togglePublish(id: string, current: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    isPublished: !current,
    updatedAt: serverTimestamp(),
  });
}

/** Get ALL materials (admin) */
export async function getMaterials(): Promise<StudyMaterial[]> {
  const snap = await getDocs(
    query(collection(db, COL), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as StudyMaterial));
}

/** Get published materials (public) */
export async function getPublishedMaterials(category?: string): Promise<StudyMaterial[]> {
  const constraints: any[] = [
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
  ];
  if (category) constraints.splice(1, 0, where('category', '==', category));
  const snap = await getDocs(query(collection(db, COL), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as StudyMaterial));
}

/** Get single material */
export async function getMaterial(id: string): Promise<StudyMaterial | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as StudyMaterial;
}

// ─── Categories ───────────────────────────────────────────────
export const MATERIAL_CATEGORIES = [
  'General Knowledge',
  'Current Affairs',
  'Mathematics',
  'English Grammar',
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
  'Previous Year Papers',
  'Other',
] as const;
