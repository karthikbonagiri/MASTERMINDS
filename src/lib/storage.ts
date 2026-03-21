// src/lib/storage.ts
// ============================================================
// Firebase Storage upload helpers
// Handles image and PDF uploads with progress callbacks.
// ============================================================

import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage';
import { storage } from './firebase';
import { v4 as uuidv4 } from 'uuid';

type ProgressCallback = (percent: number) => void;

/**
 * Upload a file to Firebase Storage.
 * Returns the public download URL.
 */
export async function uploadFile(
  file: File,
  folder: 'images' | 'pdfs' | 'thumbnails',
  onProgress?: ProgressCallback
): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${ext}`;
  const storageRef = ref(storage, fileName);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    task.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(percent);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Delete a file from Firebase Storage by its full download URL.
 */
export async function deleteFile(url: string): Promise<void> {
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
}
