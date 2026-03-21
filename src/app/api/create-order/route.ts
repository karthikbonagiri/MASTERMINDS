// src/app/api/create-order/route.ts
// Razorpay Order Creation – Server-Side API Route

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, itemId, itemType, itemTitle } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Dynamic import to prevent build-time errors
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency: 'INR',
      receipt:  `rcpt_${itemId}_${Date.now()}`,
      notes:    { itemId, itemType, itemTitle },
    });

    return NextResponse.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error('Razorpay order error:', err);
    return NextResponse.json({ error: err.message ?? 'Order creation failed' }, { status: 500 });
  }
}
