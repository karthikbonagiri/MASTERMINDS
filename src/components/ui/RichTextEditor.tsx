'use client';
// src/components/ui/RichTextEditor.tsx
// ============================================================
// Lightweight rich-text editor built on the native
// contentEditable + execCommand API.
//
// Why not Quill / TipTap?
//   Those require SSR workarounds and add 200 KB+ to the bundle.
//   This editor gives admins all the formatting they need
//   (bold, italic, headings, lists, links) with zero extra deps.
//
// Output: raw HTML string stored in Firestore.
// Rendering: use <div dangerouslySetInnerHTML> with the
//   `prose` Tailwind Typography class on the public page.
// ============================================================

import { useRef, useEffect, useCallback } from 'react';
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaListUl, FaListOl, FaLink, FaQuoteLeft,
  FaHeading, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaUndo, FaRedo,
} from 'react-icons/fa';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// ─── Toolbar button ───────────────────────────────────────────
function TBtn({
  onClick, title, children, active = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}  // prevent losing focus
      className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-sm ${active ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-300 mx-1" />;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content here…',
  minHeight = '300px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // ── Sync incoming value on first mount ────────────────────
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    // Only set innerHTML on mount to avoid cursor jumping
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleLink = useCallback(() => {
    const url = prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  }, [exec]);

  const handleHeading = useCallback((level: string) => {
    exec('formatBlock', level);
  }, [exec]);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200">
        {/* Headings */}
        <TBtn onClick={() => handleHeading('h2')} title="Heading 2">
          <FaHeading size={13} />
          <span className="text-xs ml-0.5">2</span>
        </TBtn>
        <TBtn onClick={() => handleHeading('h3')} title="Heading 3">
          <FaHeading size={11} />
          <span className="text-xs ml-0.5">3</span>
        </TBtn>
        <TBtn onClick={() => handleHeading('p')} title="Paragraph">
          P
        </TBtn>

        <Divider />

        {/* Text style */}
        <TBtn onClick={() => exec('bold')}          title="Bold">          <FaBold size={12} /></TBtn>
        <TBtn onClick={() => exec('italic')}        title="Italic">        <FaItalic size={12} /></TBtn>
        <TBtn onClick={() => exec('underline')}     title="Underline">     <FaUnderline size={12} /></TBtn>
        <TBtn onClick={() => exec('strikeThrough')} title="Strikethrough"> <FaStrikethrough size={12} /></TBtn>

        <Divider />

        {/* Lists */}
        <TBtn onClick={() => exec('insertUnorderedList')} title="Bullet list">  <FaListUl size={12} /></TBtn>
        <TBtn onClick={() => exec('insertOrderedList')}   title="Numbered list"><FaListOl size={12} /></TBtn>
        <TBtn onClick={() => exec('formatBlock', 'blockquote')} title="Quote"> <FaQuoteLeft size={12} /></TBtn>

        <Divider />

        {/* Alignment */}
        <TBtn onClick={() => exec('justifyLeft')}   title="Align left">   <FaAlignLeft size={12} /></TBtn>
        <TBtn onClick={() => exec('justifyCenter')} title="Center">       <FaAlignCenter size={12} /></TBtn>
        <TBtn onClick={() => exec('justifyRight')}  title="Align right">  <FaAlignRight size={12} /></TBtn>

        <Divider />

        {/* Link */}
        <TBtn onClick={handleLink} title="Insert link"><FaLink size={12} /></TBtn>

        <Divider />

        {/* Undo / Redo */}
        <TBtn onClick={() => exec('undo')} title="Undo"><FaUndo size={12} /></TBtn>
        <TBtn onClick={() => exec('redo')} title="Redo"><FaRedo size={12} /></TBtn>
      </div>

      {/* ── Editable area ─────────────────────────────────── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="px-5 py-4 outline-none text-gray-800 text-sm leading-relaxed
                   [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4
                   [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3
                   [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                   [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
                   [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400
                   [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600
                   [&_a]:text-blue-600 [&_a]:underline empty:before:content-[attr(data-placeholder)]
                   empty:before:text-gray-400 empty:before:pointer-events-none"
        style={{ minHeight }}
      />
    </div>
  );
}
