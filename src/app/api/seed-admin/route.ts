// src/app/api/seed-admin/route.ts
// ONE-TIME setup endpoint to create the first admin user.
// After creating your admin, you can delete this file.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Guard: require setup key
    const setupKey = req.headers.get('x-setup-key');
    if (!setupKey || setupKey !== process.env.SETUP_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only import firebase-admin at runtime (not build time)
    const admin = await import('firebase-admin');

    if (!admin.default.apps.length) {
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
      if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
        return NextResponse.json({ error: 'Firebase Admin credentials not configured' }, { status: 500 });
      }
      admin.default.initializeApp({
        credential: admin.default.credential.cert({
          projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    const adminAuth = admin.default.auth();
    const adminDb   = admin.default.firestore();

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({ email, password });

    // Store admin role in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid:       userRecord.uid,
      email,
      role:      'admin',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      uid:     userRecord.uid,
      message: `Admin user ${email} created successfully!`,
    });
  } catch (err: any) {
    console.error('seed-admin error:', err);
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
