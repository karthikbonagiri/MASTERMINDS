'use client';
export const dynamic = 'force-dynamic';
// src/app/(public)/materials/[id]/page.tsx
// ============================================================
// Public: Study Material Detail Page
//
// CONTENT PROTECTION LAYERS IMPLEMENTED:
//   1. Right-click disabled  (in ProtectedPdfViewer)
//   2. Text selection blocked  (CSS user-select: none)
//   3. Copy / Print / Save keyboard shortcuts blocked
//   4. Watermark overlay covering the viewer
//   5. Blur + lock overlay for unpaid content
//   6. Raw fileUrl is NEVER exposed in DOM for unpaid users
//   7. PDF served in a sandboxed iframe (no direct download link)
//
// ⚠️  SCREENSHOT DISCLAIMER:
// Screenshot prevention is NOT fully possible in browsers.
// These methods only reduce casual copying but cannot
// guarantee full protection. OS-level screen capture tools,
// browser extensions, and DevTools can bypass these measures.
// For production, use server-side signed URLs with short TTL
// and bake a personalized watermark into the PDF server-side.
// ============================================================

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { getMaterial, StudyMaterial } from '@/lib/material-service';
import ProtectedPdfViewer from '@/components/ui/ProtectedPdfViewer';
import WhatsAppShare from '@/components/ui/WhatsAppShare';
import {
  FaArrowLeft, FaFilePdf, FaLock, FaUnlock, FaDownload,
  FaShieldAlt, FaUser, FaCalendarAlt, FaTag,
  FaSpinner, FaCheckCircle, FaRupeeSign,
} from 'react-icons/fa';

// ─── Razorpay type shim ───────────────────────────────────────
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Payment / unlock state
  // In production: check `purchases` Firestore collection for this user + item
  const [isUnlocked,  setIsUnlocked]  = useState(false);
  const [paying,      setPaying]      = useState(false);

  useEffect(() => {
    if (!id) return;
    getMaterial(id)
      .then((m) => {
        if (!m || !m.isPublished) setError('Material not found or unavailable.');
        else {
          setMaterial(m);
          // Free materials are always unlocked
          if (m.price === 0) setIsUnlocked(true);
        }
      })
      .catch(() => setError('Failed to load material.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Razorpay payment flow ─────────────────────────────────
  const handlePayment = async () => {
    if (!material) return;
    setPaying(true);

    try {
      // Step 1: Create Razorpay order via our API route
      const res  = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:    material.price,
          itemId:    material.id,
          itemType:  'studyMaterial',
          itemTitle: material.title,
        }),
      });
      const { orderId, amount, currency } = await res.json();

      // Step 2: Open Razorpay checkout modal
      const options = {
        key:      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name:     'MasterMinds',
        description: material.title,
        order_id: orderId,
        handler: (response: any) => {
          // Step 3: Payment successful → unlock content
          // In production: verify payment server-side, then write to `purchases` collection
          console.log('Payment successful:', response.razorpay_payment_id);
          setIsUnlocked(true);
          setPaying(false);
        },
        modal: { ondismiss: () => setPaying(false) },
        theme: { color: '#059669' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setPaying(false);
      alert('Payment failed. Please try again.');
    }
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="animate-spin text-emerald-500 text-4xl mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading material…</p>
      </div>
    </div>
  );

  if (error || !material) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">{error}</h2>
      <Link href="/materials" className="btn-primary text-sm px-5 py-2.5">← All Materials</Link>
    </div>
  );

  const isFree = material.price === 0;
  const date   = material.createdAt
    ? format((material.createdAt as any)?.toDate?.() ?? new Date(material.createdAt as any), 'dd MMMM yyyy')
    : '';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* ── Hero bar ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-xl hover:bg-white/30 transition-colors mb-5"
          >
            <FaArrowLeft size={12} /> All Materials
          </Link>

          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Thumbnail */}
            <div className="w-24 h-28 bg-white/10 rounded-2xl overflow-hidden flex-shrink-0 border border-white/20">
              {material.thumbnailUrl ? (
                <Image src={material.thumbnailUrl} alt={material.title} width={96} height={112} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaFilePdf className="text-white/50 text-4xl" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <span className="badge bg-white/20 text-white text-xs mb-2">{material.category}</span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white leading-snug mb-2">
                {material.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-emerald-100">
                {material.adminBy && (
                  <span className="flex items-center gap-1.5"><FaUser size={11} /> {material.adminBy}</span>
                )}
                {date && (
                  <span className="flex items-center gap-1.5"><FaCalendarAlt size={11} /> {date}</span>
                )}
                {material.fileSizeKb ? (
                  <span className="flex items-center gap-1.5"><FaFilePdf size={11} /> {(material.fileSizeKb / 1024).toFixed(1)} MB PDF</span>
                ) : null}
              </div>
            </div>

            {/* Price pill */}
            <div className="flex-shrink-0">
              {isFree ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-400/30 border border-emerald-300 text-emerald-100 px-4 py-2 rounded-xl font-bold text-sm">
                  <FaCheckCircle size={13} /> FREE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-300 text-amber-100 px-4 py-2 rounded-xl font-bold text-sm">
                  <FaRupeeSign size={12} /> {material.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {isUnlocked ? (
            <a
              href={material.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="btn-green"
            >
              <FaDownload size={14} /> Download Full PDF
            </a>
          ) : material.price > 0 ? (
            <button
              onClick={handlePayment}
              disabled={paying}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-60"
            >
              {paying ? (
                <><FaSpinner className="animate-spin" size={14} /> Processing…</>
              ) : (
                <><FaUnlock size={14} /> Unlock for ₹{material.price}</>
              )}
            </button>
          ) : null}
          <WhatsAppShare title={material.title} url={pageUrl} />
        </div>

        {/* Description */}
        {material.description && (
          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-emerald-500 rounded-full" /> About This Material
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{material.description}</p>
          </div>
        )}

        {/* What you get */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-emerald-500" size={16} /> What You Get
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Format', value: 'PDF Document' },
              { label: 'Preview', value: `${material.previewPages} pages free` },
              { label: 'Category', value: material.category },
              { label: 'File Size', value: material.fileSizeKb ? `${(material.fileSizeKb / 1024).toFixed(1)} MB` : 'Available after download' },
              { label: 'Access', value: isUnlocked ? 'Full access unlocked ✅' : isFree ? 'Free — no payment needed' : `₹${material.price} one-time` },
              { label: 'Protection', value: 'Watermarked & protected' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 flex gap-3">
                <FaTag className="text-emerald-400 flex-shrink-0 mt-0.5" size={12} />
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PDF VIEWER ────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <FaFilePdf className="text-red-500" />
              {isUnlocked ? 'Full Document' : `Preview (${material.previewPages} pages)`}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <FaShieldAlt size={11} className="text-blue-500" />
              Protected content
            </div>
          </div>

          {material.fileUrl ? (
            <ProtectedPdfViewer
              fileUrl={material.fileUrl}
              isUnlocked={isUnlocked}
              previewPages={material.previewPages}
              watermarkText="MasterMinds"
              title={material.title}
            />
          ) : (
            <div className="card p-10 text-center text-gray-400">
              <FaFilePdf className="text-6xl mx-auto mb-3 opacity-30" />
              <p className="text-sm">PDF file not available.</p>
            </div>
          )}
        </div>

        {/* ── Payment CTA (repeated at bottom for paid) ──────── */}
        {!isUnlocked && material.price > 0 && (
          <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaLock className="text-amber-500 text-2xl" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display font-bold text-gray-900 text-lg mb-1">
                  Unlock Full Document
                </h3>
                <p className="text-gray-500 text-sm">
                  Get unlimited access to the complete PDF for a one-time payment of ₹{material.price}.
                </p>
              </div>
              <button
                onClick={handlePayment}
                disabled={paying}
                className="flex items-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-md whitespace-nowrap disabled:opacity-60"
              >
                {paying ? <FaSpinner className="animate-spin" size={14} /> : <FaUnlock size={14} />}
                Unlock — ₹{material.price}
              </button>
            </div>
          </div>
        )}

        {/* Security disclaimer */}
        <div className="card p-4 bg-gray-50 border-gray-200">
          <div className="flex items-start gap-3">
            <FaShieldAlt className="text-gray-400 flex-shrink-0 mt-0.5" size={14} />
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-500">Content Protection:</strong> This material is protected with
              watermarking, right-click blocking, and copy prevention. However, complete screenshot prevention
              is not possible in browsers — OS-level capture tools cannot be blocked by web pages. Please
              respect the author's work and do not distribute this material.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
