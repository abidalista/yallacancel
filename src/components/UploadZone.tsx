"use client";

import { useRef, useState } from "react";

interface UploadedFile {
  name: string;
  size: number;
  transactionCount: number;
}

interface UploadZoneProps {
  locale: "ar" | "en";
  uploadedFiles: UploadedFile[];
  isProcessing: boolean;
  onFilesSelect: (files: File[]) => void;
  onTestClick: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({
  locale,
  uploadedFiles,
  isProcessing,
  onFilesSelect,
  onTestClick,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ar = locale === "ar";

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "csv" || ext === "pdf") {
        validFiles.push(file);
      }
    }
    if (validFiles.length === 0) {
      alert(ar ? "الملفات لازم تكون CSV أو PDF" : "Files must be CSV or PDF");
      return;
    }
    onFilesSelect(validFiles);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  const totalTx = uploadedFiles.reduce((s, f) => s + f.transactionCount, 0);

  return (
    <div className="w-full">
      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploadedFiles.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 bg-white/8 border border-white/12 rounded-xl px-4 py-2.5"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-[var(--color-primary)] flex-shrink-0">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{f.name}</p>
                <p className="text-[10px] text-white/40">
                  {formatSize(f.size)} — {f.transactionCount} {ar ? "عملية" : "transactions"}
                </p>
              </div>
            </div>
          ))}
          {totalTx > 0 && (
            <p className="text-xs text-white/50 text-center pt-1">
              {ar
                ? `المجموع: ${totalTx} عملية من ${uploadedFiles.length} ملف`
                : `Total: ${totalTx} transactions from ${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""}`}
            </p>
          )}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`upload-zone flex flex-col items-center justify-center gap-3 mb-4 ${
          dragging ? "drag-over" : ""
        } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
      >
        {isProcessing ? (
          <>
            <div
              className="w-8 h-8 border-3 border-white/10 rounded-full"
              style={{
                borderTopColor: "var(--color-primary)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p className="font-bold text-white text-sm">
              {ar ? "جاري تحليل الملفات..." : "Processing files..."}
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        ) : (
          <>
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-white/40">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-bold text-white text-base">
              {uploadedFiles.length > 0
                ? (ar ? "أضف ملفات ثانية" : "Add more files")
                : (ar ? "اسحب الملف وحطه هنا" : "Drag & drop your files here")}
            </p>
            <p className="text-xs text-white/40">
              {ar ? "تقدر ترفع أكثر من ملف — PDF أو CSV" : "You can upload multiple files — PDF or CSV"}
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold bg-white/10 text-white/50 rounded-md px-2.5 py-0.5 uppercase tracking-wider">CSV</span>
              <span className="text-[10px] font-bold bg-white/10 text-white/50 rounded-md px-2.5 py-0.5 uppercase tracking-wider">PDF</span>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Primary button */}
      <button
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        disabled={isProcessing}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-base py-4 rounded-xl transition-all hover:-translate-y-0.5 mb-3.5 disabled:opacity-50"
        style={{ boxShadow: "0 4px 24px rgba(0,166,81,0.35)" }}
      >
        {uploadedFiles.length > 0
          ? (ar ? "أضف ملفات ثانية" : "Add more files")
          : (ar ? "اختر الملفات" : "Choose files")}
      </button>

      {/* Divider */}
      {uploadedFiles.length === 0 && (
        <>
          <div className="flex items-center gap-3 mb-3.5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">{ar ? "أو" : "or"}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Sample button */}
          <button
            onClick={onTestClick}
            className="w-full border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-semibold text-sm py-3.5 rounded-xl transition-all bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2"
          >
            {ar ? "جرّب بمثال جاهز" : "Try with sample data"}
          </button>
        </>
      )}
    </div>
  );
}
