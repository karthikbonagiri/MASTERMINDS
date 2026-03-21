// src/lib/job-service.ts
// ============================================================
// Job Notifications – Firebase Service Layer
// All Firestore CRUD + Storage operations for jobNotifications.
// Import these helpers from admin forms and public pages.
// ============================================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// ─── Collection name constant ─────────────────────────────────
const COL = 'jobNotifications';

// ─── Type definition ──────────────────────────────────────────
export interface Job {
  id?: string;
  title: string;
  company: string;
  category: string;
  description: string;
  eligibility: string;
  applyLink: string;
  videoLink?: string;
  imageUrl?: string;
  adminBy: string;
  isPublished: boolean;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

// ─── Upload image to Firebase Storage ────────────────────────
// Returns the public download URL of the uploaded image.
export async function uploadJobImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `job-images/${uuidv4()}.${ext}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    task.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

// ─── Delete image from Firebase Storage ──────────────────────
// Safe: swallows errors if file no longer exists.
export async function deleteJobImage(url: string): Promise<void> {
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // File may already be deleted – ignore
  }
}

// ─── Create a new job ─────────────────────────────────────────
export async function createJob(
  data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Get ALL jobs (admin view – published + draft) ────────────
export async function getJobs(): Promise<Job[]> {
  const snap = await getDocs(
    query(collection(db, COL), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
}

// ─── Get published jobs only (public view) ────────────────────
export async function getPublishedJobs(category?: string): Promise<Job[]> {
  const constraints: any[] = [
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
  ];
  if (category) constraints.splice(1, 0, where('category', '==', category));

  const snap = await getDocs(query(collection(db, COL), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
}

// ─── Get a single job by ID ───────────────────────────────────
export async function getJob(id: string): Promise<Job | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Job;
}

// ─── Update an existing job ───────────────────────────────────
export async function updateJob(
  id: string,
  data: Partial<Omit<Job, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ─── Delete a job (and its image from Storage) ────────────────
export async function deleteJob(id: string, imageUrl?: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
  if (imageUrl) await deleteJobImage(imageUrl);
}

// ─── Toggle published / draft ─────────────────────────────────
export async function togglePublish(id: string, current: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    isPublished: !current,
    updatedAt: serverTimestamp(),
  });
}

// ─── Job categories list ──────────────────────────────────────
export const JOB_CATEGORIES = [
  'Government Jobs',
  'Banking',
  'Railway',
  'Defence',
  'Teaching',
  'Engineering',
  'Medical',
  'State PSC',
  'SSC',
  'UPSC',
  'Police',
  'IT / Software',
  'Other',
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];
