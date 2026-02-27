"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, Sparkles } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[560px] mx-auto"
    >
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer bento-card border-2 border-dashed flex flex-col items-center justify-center py-12 px-6 transition-all ${
          dragging
            ? "border-indigo-400 bg-indigo-50/50"
            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <Upload size={22} strokeWidth={1.5} className="text-indigo-500" />
        </div>
        <p className="font-bold text-slate-800 text-base mb-1">
          {ar ? "حط آخر ٢-٣ أشهر من كشف حسابك" : "Drop your last 2-3 months of statements"}
        </p>
        <p className="text-sm text-slate-400">
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
      <p className="text-xs text-slate-400 text-center mt-4">
        {ar
          ? "ملفاتك تتحلل وتنحذف فوراً. ما نخزن أي شيء."
          : "Your files are analyzed and immediately discarded. Nothing is stored."}
      </p>

      {/* File list + scan button */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-5 bento-card p-5"
          >
            <p className="text-sm font-bold text-slate-700 mb-4">
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
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <FileText size={14} strokeWidth={1.5} className="text-slate-400" />
                    {f.name} <span className="text-slate-400">({formatSize(f.size)})</span>
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleScan}
              className="btn-primary w-full"
            >
              <Sparkles size={16} strokeWidth={1.5} />
              {ar ? "ابحث عن الاشتراكات" : "Scan for subscriptions"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider + test button */}
      {selectedFiles.length === 0 && (
        <>
          <div className="flex items-center gap-3 mt-5 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">{ar ? "أو" : "or"}</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            onClick={onTestClick}
            className="btn-ghost w-full"
          >
            {ar ? "جرّب بمثال جاهز" : "Try with sample data"}
          </button>
        </>
      )}
    </motion.div>
  );
}
