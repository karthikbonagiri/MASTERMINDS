// src/components/ui/LoadingSpinner.tsx
export default function LoadingSpinner({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
