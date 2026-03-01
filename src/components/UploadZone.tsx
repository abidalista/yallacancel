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

function truncateName(name: string, max = 20): string {
  const dot = name.lastIndexOf(".");
  if (dot === -1) return name.length > max ? name.slice(0, max) + "..." : name;
  const ext = name.slice(dot);
  const base = name.slice(0, dot);
  if (base.length <= max) return name;
  return base.slice(0, max) + "..." + ext;
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
      alert(ar ? "الملفات لازم تكون CSV او PDF" : "Files must be CSV or PDF");
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
      {/* Upload dropzone — self-contained clickable area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer flex flex-col items-center justify-center py-10 px-6 rounded-2xl hover:bg-[#F5FAF8] transition-colors"
        style={{
          border: dragging ? "2px dashed #00A651" : "2px dashed #C5DDD9",
          background: dragging ? "#E8F7EE" : "white",
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "#E8F7EE" }}
        >
          <Upload size={22} strokeWidth={1.5} style={{ color: "#00A651" }} />
        </div>
        <p className="font-bold text-base mb-1" style={{ color: "#1A3A35" }}>
          {ar ? "حط اخر ٢-٣ اشهر من كشف حسابك" : "Drop your last 2–3 months of statements"}
        </p>
        <p className="text-sm" style={{ color: "#8AADA8" }}>
          {ar ? "PDF او CSV من اي بنك" : "PDF or CSV from any bank"}
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

      {/* File list (when files selected) */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bento-card px-6 pt-5 pb-5 overflow-hidden"
          >
            <p className="text-sm font-bold mb-4" style={{ color: "#1A3A35" }}>
              {ar ? `${selectedFiles.length} ملف تم اختياره` : `${selectedFiles.length} file(s) selected`}
            </p>
            <div className="space-y-3 mb-5">
              {selectedFiles.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm" style={{ color: "#4A6862" }}>
                    <FileText size={14} strokeWidth={1.5} style={{ color: "#8AADA8" }} />
                    {truncateName(f.name)} <span style={{ color: "#8AADA8" }}>({formatSize(f.size)})</span>
                  </span>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1 rounded-full transition-colors"
                    style={{ color: "#8AADA8", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#1A3A35")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleScan} className="btn-primary w-full">
              <Sparkles size={16} strokeWidth={1.5} />
              {ar ? "ابحث عن الاشتراكات" : "Scan for subscriptions"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OR + Try sample — completely outside the dropzone */}
      {selectedFiles.length === 0 && (
        <div className="mt-5 text-center">
          <span className="text-xs font-medium" style={{ color: "#8AADA8" }}>{ar ? "او" : "or"}</span>
          <button
            onClick={onTestClick}
            className="font-bold text-sm py-3 px-7 rounded-full mx-auto block mt-3 transition-all hover:-translate-y-0.5"
            style={{
              background: "#00A651",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,166,81,0.25)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#009147"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,166,81,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#00A651"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,166,81,0.25)"; }}
          >
            {ar ? "جرب بمثال جاهز" : "Try with sample data"}
          </button>
        </div>
      )}

      {/* Privacy notice */}
      <p className="text-xs text-center mt-3" style={{ color: "#8AADA8" }}>
        {ar
          ? "ملفاتك تتحلل وتنحذف فورا. ما نخزن اي شي."
          : "Your files are analyzed and immediately discarded. Nothing is stored."}
      </p>
    </motion.div>
  );
}
