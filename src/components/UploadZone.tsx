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

  const uploadsLeft = freeLimit - uploadsUsed;
  const isLocked = uploadsLeft <= 0;

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
      <div className="text-center py-10">
        <div className="text-4xl mb-3">🔒</div>
        <p className="font-bold text-[var(--color-text-primary)] mb-1">
          {ar ? "وصلت للحد المجاني" : "Free limit reached"}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {ar
            ? "ادفع مرة وحدة وحلّل كشوفات بلا حدود"
            : "Pay once for unlimited analysis"}
        </p>
        <button onClick={onUpgradeClick} className="btn-primary">
          {ar ? "ترقية — ٤٩ ر.س" : "Upgrade — 49 SAR"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`upload-zone ${dragging ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-5xl mb-3">📊</div>
        <p className="font-bold text-lg text-[var(--color-text-primary)] mb-1">
          {ar ? "ارفع كشف حسابك هنا" : "Upload your bank statement"}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {ar ? "اسحب الملف أو اضغط — نقبل CSV و PDF" : "Drag or click — we accept CSV and PDF"}
        </p>
        <button
          className="btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {ar ? "اختر ملف" : "Choose file"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* Test statement — inside the card */}
      <div className="border-t border-[var(--color-border)] mt-5 pt-4 text-center">
        <button onClick={onTestClick} className="btn-ghost text-sm">
          {ar ? "🧪 جرب بكشف تجريبي" : "🧪 Try with sample data"}
        </button>
      </div>
    </div>
  );
}
