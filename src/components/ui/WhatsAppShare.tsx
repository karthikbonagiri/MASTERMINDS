'use client';
// src/components/ui/WhatsAppShare.tsx

import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppShareProps {
  title: string;
  url?: string;
  className?: string;
}

export default function WhatsAppShare({ title, url, className = '' }: WhatsAppShareProps) {
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const message = encodeURIComponent(`${title}\n\nRead more: ${shareUrl}`);
  const waLink = `https://wa.me/?text=${message}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600
                  text-white font-medium rounded-lg transition-colors text-sm ${className}`}
    >
      <FaWhatsapp size={16} />
      Share on WhatsApp
    </a>
  );
}
