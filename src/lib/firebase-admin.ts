// src/lib/firebase-admin.ts
// Firebase Admin SDK – Server-Side ONLY
// Uses lazy initialization - only connects when actually called.
// This prevents build-time crashes when env vars aren't available.

let adminInstance: any = null;

async function getAdmin() {
  if (adminInstance) return adminInstance;

  const admin = await import('firebase-admin');

  if (!admin.default.apps.length) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
      throw new Error('Firebase Admin credentials not configured. Check environment variables.');
    }

    admin.default.initializeApp({
      credential: admin.default.credential.cert({
        projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }

  adminInstance = admin.default;
  return admin.default;
}

export async function getAdminDb() {
  const admin = await getAdmin();
  return admin.firestore();
}

export async function getAdminAuth() {
  const admin = await getAdmin();
  return admin.auth();
}

// Legacy sync exports for backward compatibility
// These will be null at build time - only use inside API routes
export const adminDb      = null as any;
export const adminAuth    = null as any;
export const adminStorage = null as any;

export default getAdmin;
