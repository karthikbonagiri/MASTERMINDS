// src/app/api/verify-payment/route.ts
// Razorpay Payment Verification

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      userId,
      userEmail,
      itemId,
      itemType,
      itemTitle,
      amount,
    } = await req.json();

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Dynamic import firebase-admin
    const admin = await import('firebase-admin');
    if (!admin.default.apps.length) {
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
      admin.default.initializeApp({
        credential: admin.default.credential.cert({
          projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
          privateKey:  privateKey!,
        }),
      });
    }

    await admin.default.firestore().collection('purchases').add({
      userId,
      userEmail,
      itemId,
      itemType,
      itemTitle,
      amount,
      razorpayOrderId,
      razorpayPaymentId,
      status:    'paid',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
