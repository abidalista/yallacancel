"use client";

import { useRef, useState } from "react";

interface UploadZoneProps {
  locale: "ar" | "en";
  uploadsUsed: number;
  freeLimit: number;
  onFileSelect: (file: File) => void;
  onTestClick: () => void;
  onUpgradeClick: () => void;
}

export default function UploadZone({
  locale,
  uploadsUsed,
  freeLimit,
  onFileSelect,
  onTestClick,
  onUpgradeClick,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ar = locale === "ar";

  const isLocked = freeLimit - uploadsUsed <= 0;

  function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "pdf") {
      alert(ar ? "الملف لازم يكون CSV أو PDF" : "File must be CSV or PDF");
      return;
    }
    onFileSelect(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (isLocked) {
    return (
      <div className="text-center py-12">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mx-auto mb-4 text-white/40">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="font-black text-xl text-white mb-2">
          {ar ? "وصلت للحد المجاني" : "Free limit reached"}
        </p>
        <p className="text-sm text-white/60 mb-6">
          {ar ? "ادفع مرة وحدة وحلّل كشوفات بلا حدود" : "Pay once for unlimited analysis"}
        </p>
        <button onClick={onUpgradeClick} className="btn-primary">
          {ar ? "ترقية — ٤٩ ريال" : "Upgrade — 49 SAR"}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`upload-zone flex flex-col items-center justify-center gap-3 mb-4 ${
          dragging ? "drag-over" : ""
        }`}
      >
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-white/40">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-bold text-white text-base">
          {ar ? "اسحب الملف وحطه هنا" : "Drag & drop your file here"}
        </p>
        <div className="flex gap-2">
          <span className="text-[10px] font-bold bg-white/10 text-white/50 rounded-md px-2.5 py-0.5 uppercase tracking-wider">CSV</span>
          <span className="text-[10px] font-bold bg-white/10 text-white/50 rounded-md px-2.5 py-0.5 uppercase tracking-wider">PDF</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {/* Primary button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-base py-4 rounded-xl transition-all hover:-translate-y-0.5 mb-3.5"
        style={{ boxShadow: "0 4px 24px rgba(0,166,81,0.35)" }}
      >
        {ar ? "اختر الملف" : "Choose file"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30">{ar ? "أو" : "or"}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Sample button */}
      <button
        onClick={onTestClick}
        className="w-full border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-semibold text-sm py-3.5 rounded-xl transition-all bg-white/5 hover:bg-white/10 flex items-center justify-content gap-2"
      >
        {ar ? "جرّب بمثال جاهز" : "Try with sample data"}
      </button>
    </div>
  );
}
