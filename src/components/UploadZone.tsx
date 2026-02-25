"use client";

import { useRef, useState } from "react";

interface SelectedFile {
  file: File;
  name: string;
  size: number;
}

interface UploadZoneProps {
  locale: "ar" | "en";
  onScan: (files: File[]) => void;
  onTestClick: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({
  locale,
  onScan,
  onTestClick,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ar = locale === "ar";

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const newFiles: SelectedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "csv" || ext === "pdf") {
        newFiles.push({ file, name: file.name, size: file.size });
      }
    }
    if (newFiles.length === 0) {
      alert(ar ? "الملفات لازم تكون CSV أو PDF" : "Files must be CSV or PDF");
      return;
    }
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function handleScan() {
    if (selectedFiles.length === 0) return;
    onScan(selectedFiles.map((f) => f.file));
  }

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {/* Drop zone — matches JustCancel exactly */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center py-14 px-6"
        style={{
          borderColor: dragging ? "var(--color-primary)" : "rgba(255,255,255,0.2)",
          background: dragging ? "rgba(0,166,81,0.06)" : "rgba(255,255,255,0.03)",
        }}
      >
        <p className="font-bold text-white text-lg mb-1.5">
          {ar ? "حط آخر ٢-٣ أشهر من كشف حسابك" : "Drop your last 2-3 months of statements"}
        </p>
        <p className="text-sm text-white/50">
          {ar ? "CSV أو PDF من أي بنك · أقل من ٩٠ ثانية" : "CSV or PDF from any bank · Takes under 90 seconds"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Privacy notice */}
      <p className="text-xs text-white/30 text-center mt-4">
        {ar
          ? "ملفاتك تتحلل وتنحذف فوراً. ما نخزن أي شيء."
          : "Your files are analyzed and immediately discarded. Nothing is stored."}
      </p>

      {/* File list + scan button */}
      {selectedFiles.length > 0 && (
        <div className="mt-5 bg-white/8 border border-white/12 rounded-2xl p-5">
          <p className="text-sm font-bold text-white mb-4">
            {ar
              ? `${selectedFiles.length} ملف تم اختياره`
              : `${selectedFiles.length} file(s) selected`}
          </p>

          <div className="space-y-3 mb-5">
            {selectedFiles.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-white/80">
                  {f.name} <span className="text-white/40">({formatSize(f.size)})</span>
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="text-white/40 hover:text-white/80 transition-colors text-lg font-bold px-2"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Scan button */}
          <button
            onClick={handleScan}
            className="bg-[#4A7BF7] hover:bg-[#3A6AE6] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
          >
            {ar ? "ابحث عن الاشتراكات" : "Scan for subscriptions"}
          </button>
        </div>
      )}

      {/* Divider + test button */}
      {selectedFiles.length === 0 && (
        <>
          <div className="flex items-center gap-3 mt-5 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">{ar ? "أو" : "or"}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

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
