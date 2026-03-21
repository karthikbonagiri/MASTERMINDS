'use client';
// src/components/ui/ImageUploader.tsx
// ============================================================
// Drag-and-drop image uploader with live preview + progress bar.
// Used in Job form, Article form, etc.
// ============================================================

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { FaCloudUploadAlt, FaTrash, FaSpinner } from 'react-icons/fa';

interface ImageUploaderProps {
  currentUrl?: string;               // Existing image URL (edit mode)
  onUpload: (file: File) => Promise<string>; // Must return the download URL
  onClear?: () => void;              // Called when user removes the image
  className?: string;
}

export default function ImageUploader({
  currentUrl,
  onUpload,
  onClear,
  className = '',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(currentUrl ?? '');
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    setError('');
    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      // onUpload should call uploadJobImage (or similar) and return the URL
      await onUpload(file);
    } catch {
      setError('Upload failed. Please try again.');
      setPreview(currentUrl ?? '');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleClear = () => {
    setPreview('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
  };

  // ── With preview ──────────────────────────────────────────
  if (preview) {
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-gray-200 ${className}`}>
        <Image
          src={preview}
          alt="Preview"
          width={800}
          height={400}
          className="w-full h-52 object-cover"
          unoptimized // local blob URLs don't go through Next Image optimisation
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
            <FaSpinner className="text-white text-3xl animate-spin" />
            <div className="w-40 bg-white/20 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-white text-sm font-medium">{progress}%</p>
          </div>
        )}
        {!uploading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
            title="Remove image"
          >
            <FaTrash size={14} />
          </button>
        )}
      </div>
    );
  }

  // ── Drop zone ─────────────────────────────────────────────
  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-10
          flex flex-col items-center justify-center gap-3 text-center
          ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
      >
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
          <FaCloudUploadAlt className="text-blue-500 text-2xl" />
        </div>
        <div>
          <p className="font-semibold text-gray-700 text-sm">
            {dragging ? 'Drop image here' : 'Click or drag image here'}
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Max 5 MB</p>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
