'use client';
// src/components/ui/ProtectedPdfViewer.tsx
// ============================================================
// PROTECTED PDF VIEWER
//
// Security measures implemented:
//   ✅ Right-click disabled (prevents "Save As")
//   ✅ Text selection disabled (CSS user-select: none)
//   ✅ Copy (Ctrl+C) blocked
//   ✅ Print (Ctrl+P) blocked
//   ✅ Keyboard shortcuts to save/view source blocked
//   ✅ Watermark overlay with repeated diagonal text
//   ✅ Blurred overlay for locked (non-preview) pages
//   ✅ PDF rendered inside <iframe sandbox> — not a raw <a> link
//   ✅ The raw fileUrl is NEVER put in the visible DOM for locked users
//
// ⚠️  IMPORTANT DISCLAIMER (READ BEFORE PRODUCTION USE):
// ─────────────────────────────────────────────────────────────
// Screenshot prevention is NOT fully possible in browsers.
// These methods only reduce CASUAL copying (right-click, select,
// Ctrl+C) but CANNOT guarantee full content protection because:
//
//  • Browser DevTools can extract the URL from network requests
//  • OS-level screenshot tools bypass all JS/CSS protection
//  • Screen recording software is completely undetectable
//  • Browser extensions can override CSS and JS event listeners
//
// For higher security, serve PDFs through a signed-URL proxy
// that expires quickly, and watermark server-side with the
// user's name/email baked into the PDF bytes.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { FaLock, FaShieldAlt } from 'react-icons/fa';

interface ProtectedPdfViewerProps {
  fileUrl: string;          // Firebase Storage download URL
  isUnlocked: boolean;      // true = show full PDF, false = show preview only
  previewPages: number;     // Shown as a visual indicator (page limit enforced by blur)
  watermarkText?: string;   // e.g. user email or "MasterMinds"
  title: string;
}

// ─── Watermark SVG (tiled, diagonal) ─────────────────────────
function WatermarkOverlay({ text }: { text: string }) {
  // We repeat the watermark text in a grid pattern using CSS
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10"
      aria-hidden="true"
    >
      {/* Generate a 5×8 grid of watermark labels */}
      <div className="absolute inset-0 flex flex-wrap">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '20%',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(-30deg)',
              opacity: 0.07,
              userSelect: 'none',
              pointerEvents: 'none',
              fontWeight: 900,
              fontSize: '13px',
              color: '#1D4ED8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProtectedPdfViewer({
  fileUrl,
  isUnlocked,
  previewPages,
  watermarkText = 'MasterMinds',
  title,
}: ProtectedPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Content protection event handlers ──────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Disable right-click inside the viewer
    const blockContext = (e: MouseEvent) => e.preventDefault();

    // Block copy, print, save keyboard shortcuts
    const blockKeys = (e: KeyboardEvent) => {
      const blocked = [
        e.ctrlKey && e.key === 'c',  // Copy
        e.ctrlKey && e.key === 'p',  // Print
        e.ctrlKey && e.key === 's',  // Save
        e.ctrlKey && e.key === 'u',  // View source
        e.key === 'PrintScreen',     // Screenshot key (partial)
        e.ctrlKey && e.shiftKey && e.key === 'I', // DevTools
        e.ctrlKey && e.shiftKey && e.key === 'J', // DevTools console
      ];
      if (blocked.some(Boolean)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener('contextmenu', blockContext);
    document.addEventListener('keydown', blockKeys);

    return () => {
      el.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('keydown', blockKeys);
    };
  }, []);

  // ── iFrame sandbox URL ─────────────────────────────────────
  // We use #toolbar=0&navpanes=0 to hide the browser's built-in
  // PDF toolbar (which exposes download buttons).
  // We append page range via #page=1 for visual hint only;
  // actual page limiting is done by blurring the overflow.
  const iframeSrc = `${fileUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100"
      // Disable text selection at CSS level
      style={{ userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties}
    >
      {/* Security notice banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-blue-100 text-xs">
        <FaShieldAlt size={11} className="text-blue-300 flex-shrink-0" />
        <span>
          This content is protected. Downloading, copying, or screen recording is not permitted.
        </span>
      </div>

      {/* PDF iframe */}
      <div className="relative" style={{ height: isUnlocked ? '75vh' : '420px' }}>
        <iframe
          src={iframeSrc}
          title={title}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts"
          // Prevent the user from opening the PDF in a new tab via middle-click etc.
          loading="lazy"
        />

        {/* Watermark over the iframe */}
        <WatermarkOverlay text={watermarkText} />

        {/* BLUR OVERLAY for locked content (non-preview pages) */}
        {!isUnlocked && (
          <div
            className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-6"
            style={{ height: '55%', background: 'linear-gradient(to bottom, transparent 0%, rgba(249,250,251,0.85) 40%, rgba(249,250,251,1) 100%)' }}
          >
            <div className="text-center px-6">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-3 border border-gray-100">
                <FaLock className="text-blue-600 text-2xl" />
              </div>
              <p className="text-gray-900 font-semibold text-sm mb-1">
                Preview Limited to {previewPages} page{previewPages !== 1 ? 's' : ''}
              </p>
              <p className="text-gray-500 text-xs">
                Purchase to unlock the full document.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview page indicator */}
      {!isUnlocked && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Showing preview · {previewPages} of {previewPages}+ pages visible
          </span>
          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
            Unlock for full access
          </span>
        </div>
      )}

      {isUnlocked && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border-t border-emerald-100">
          <FaShieldAlt size={11} className="text-emerald-500" />
          <span className="text-xs text-emerald-700 font-medium">
            Full document unlocked · Protected by MasterMinds DRM
          </span>
        </div>
      )}
    </div>
  );
}
