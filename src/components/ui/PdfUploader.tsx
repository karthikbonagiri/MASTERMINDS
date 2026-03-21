'use client';
// src/components/ui/PdfUploader.tsx
// ============================================================
// PDF file upload component with:
//   - Drag-and-drop zone
//   - Upload progress bar
//   - File size display
//   - Replaces existing file cleanly
// ============================================================

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { FaFilePdf, FaCloudUploadAlt, FaTrash, FaSpinner, FaCheck } from 'react-icons/fa';

interface PdfUploaderProps {
  currentFileName?: string;
  onUpload: (file: File) => Promise<void>;  // Caller handles the actual upload
  onClear?: () => void;
  className?: string;
}

export default function PdfUploader({
  currentFileName,
  onUpload,
  onClear,
  className = '',
}: PdfUploaderProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]  = useState(false);
  const [progress,  setProgress]   = useState(0);
  const [fileName,  setFileName]   = useState(currentFileName ?? '');
  const [error,     setError]      = useState('');
  const [done,      setDone]       = useState(!!currentFileName);

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('PDF must be under 50 MB.');
      return;
    }
    setError('');
    setFileName(file.name);
    setUploading(true);
    setProgress(0);
    setDone(false);

    try {
      await onUpload(file);
      setDone(true);
    } catch {
      setError('Upload failed. Please try again.');
      setFileName('');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleClear = () => {
    setFileName('');
    setDone(false);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
  };

  // ── Uploaded state ─────────────────────────────────────────
  if (done && fileName) {
    return (
      <div className={`flex items-center gap-4 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl ${className}`}>
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaFilePdf className="text-red-500 text-2xl" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{fileName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <FaCheck size={11} className="text-emerald-500" />
            <p className="text-xs text-emerald-600 font-medium">Uploaded successfully</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors flex-shrink-0"
          title="Remove file"
        >
          <FaTrash size={13} />
        </button>
      </div>
    );
  }

  // ── Uploading state ────────────────────────────────────────
  if (uploading) {
    return (
      <div className={`p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <FaSpinner className="animate-spin text-blue-500 text-xl flex-shrink-0" />
          <p className="text-sm font-medium text-gray-700 truncate">Uploading {fileName}…</p>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-blue-500 mt-1.5 text-right">{progress}%</p>
      </div>
    );
  }

  // ── Drop zone ──────────────────────────────────────────────
  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400
                   rounded-2xl p-10 flex flex-col items-center gap-3 text-center
                   hover:bg-blue-50/50 transition-all duration-200 group"
      >
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
          <FaFilePdf className="text-red-400 text-3xl" />
        </div>
        <div>
          <p className="font-semibold text-gray-700 text-sm">
            Drop your PDF here or <span className="text-blue-600">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF only · Max 50 MB</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FaCloudUploadAlt className="text-blue-400" size={14} />
          <span>Files are securely stored in Firebase Storage</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
