"use client";

import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#EDF5F3] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <span className="text-3xl">!</span>
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
        حصل خطأ غير متوقع
      </h1>
      <p className="text-sm text-slate-500 mb-1">Something went wrong.</p>
      <p className="text-xs text-slate-400 mb-6 max-w-xs">{error.message}</p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-[#1A3A35] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
      >
        <RotateCcw size={16} strokeWidth={1.5} />
        حاول مرة ثانية · Try again
      </button>
    </div>
  );
}
