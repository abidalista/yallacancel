"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText } from "lucide-react";
import { formatBytes, truncateFilename } from "@/lib/format";
import Ltr from "@/components/Ltr";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 5;

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

export default function UploadZone({
  locale,
  onScan,
  onTestClick,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileTip, setFileTip] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ar = locale === "ar";

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setFileError(null);
    setFileTip(null);

    const newFiles: SelectedFile[] = [];
    const rejected: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext !== "csv" && ext !== "pdf") {
        rejected.push(ar ? `${file.name}: لازم CSV او PDF` : `${file.name}: must be CSV or PDF`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        rejected.push(ar ? `${file.name}: اكبر من 10 MB` : `${file.name}: exceeds 10 MB`);
        continue;
      }
      newFiles.push({ file, name: file.name, size: file.size });
    }

    if (newFiles.length === 0 && rejected.length > 0) {
      setFileError(rejected.join("\n"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFiles((prev) => {
      const room = MAX_FILES - prev.length;
      if (room <= 0) {
        setFileError(
          ar ? "الحد الاقصى 5 ملفات · احذف ملف عشان تضيف غيره" : "Maximum 5 files · remove one to add another"
        );
        return prev;
      }

      let accepted = newFiles;
      let truncated = false;
      if (newFiles.length > room) {
        accepted = newFiles.slice(0, room);
        truncated = true;
      }

      const prevTotal = prev.reduce((sum, f) => sum + f.size, 0);
      const newTotal = accepted.reduce((sum, f) => sum + f.size, 0);
      if (prevTotal + newTotal > MAX_TOTAL_SIZE) {
        setFileError(
          ar
            ? "الحجم الكلي يتجاوز 25 MB. احذف ملف او ارفع ملفات اصغر"
            : "Total size exceeds 25 MB. Remove a file or upload smaller files"
        );
        return prev;
      }

      // Real rejects (bad type/size) stay as errors; over-limit is a soft tip only
      if (rejected.length > 0) {
        setFileError(rejected.join("\n"));
      } else {
        setFileError(null);
      }
      if (truncated) {
        setFileTip(
          ar
            ? `أخذنا أول ${accepted.length} ملفات فقط · الحد ${MAX_FILES}`
            : `Added the first ${accepted.length} files only · max ${MAX_FILES}`
        );
      }

      return [...prev, ...accepted];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFileError(null);
    setFileTip(null);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function clearAllFiles() {
    setFileError(null);
    setFileTip(null);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const totalSize = selectedFiles.reduce((s, f) => s + f.size, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[560px] mx-auto"
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
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
          {ar ? "ارفع كشوفات آخر 2 إلى 3 أشهر" : "Drop your last 2 to 3 months of statements"}
        </p>
        <p className="text-sm text-center" style={{ color: "#8AADA8" }}>
          {ar ? (
            <>
              PDF او CSV من اي بنك · حتى 5 ملفات · أقل من <Ltr>90</Ltr> ثانية
            </>
          ) : (
            <>PDF or CSV from any bank · up to 5 files · under 90 seconds</>
          )}
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

      {fileError && (
        <p className="text-xs text-red-500 text-center mt-2 whitespace-pre-line">{fileError}</p>
      )}
      {fileTip && !fileError && (
        <p className="text-xs text-center mt-2" style={{ color: "#C2410C" }}>
          {fileTip}
        </p>
      )}

      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-xl bg-slate-100 px-5 pt-4 pb-5 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-sm font-bold" style={{ color: "#1A3A35" }}>
                {ar
                  ? `${selectedFiles.length} ملف محدد`
                  : `${selectedFiles.length} file(s) selected`}{" "}
                <Ltr className="font-normal text-[#8AADA8]">({formatBytes(totalSize)})</Ltr>
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllFiles();
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                {ar ? "مسح الكل" : "Clear all"}
              </button>
            </div>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {selectedFiles.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm min-w-0" style={{ color: "#4A6862" }}>
                    <FileText
                      size={14}
                      strokeWidth={1.5}
                      style={{ color: "#8AADA8" }}
                      className="flex-shrink-0"
                    />
                    <span className="truncate">{truncateFilename(f.name, 28)}</span>
                    <Ltr className="flex-shrink-0 text-[#8AADA8]">({formatBytes(f.size)})</Ltr>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="p-1 rounded-full transition-colors flex-shrink-0"
                    style={{ color: "#8AADA8", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#1A3A35")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8AADA8")}
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-xs font-medium text-center mb-4" style={{ color: "#C2410C" }}>
              {ar
                ? "ملاحظة: أفضل نتيجة من كشوفات آخر 2 إلى 3 أشهر. زيادة الشهور ما تحسّن النتيجة وقد تطلع اشتراكات ملغاة"
                : "Note: Best results from the last 2 to 3 months. More months won't improve results and may show cancelled subscriptions."}
            </p>

            <button onClick={handleScan} className="btn-primary w-full">
              {ar ? "افحص الاشتراكات" : "Scan for subscriptions"}
            </button>
            <button
              type="button"
              disabled={selectedFiles.length >= MAX_FILES}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedFiles.length >= MAX_FILES) return;
                fileInputRef.current?.click();
              }}
              className="btn-ghost w-full mt-2 text-sm disabled:opacity-40"
            >
              {selectedFiles.length >= MAX_FILES
                ? ar
                  ? "وصلت لحد 5 ملفات"
                  : "5 file limit reached"
                : ar
                  ? "اضف ملفات اخرى"
                  : "Add more files"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFiles.length === 0 && (
        <div className="mt-5 text-center">
          <span className="text-xs font-medium" style={{ color: "#8AADA8" }}>
            {ar ? "او" : "or"}
          </span>
          <button
            onClick={onTestClick}
            className="font-bold text-sm py-3 px-7 rounded-full mx-auto block mt-3 transition-all hover:-translate-y-0.5"
            style={{
              background: "#00A651",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,166,81,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#009147";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,166,81,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#00A651";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,166,81,0.25)";
            }}
          >
            {ar ? "جرب بمثال جاهز" : "Try with sample data"}
          </button>
        </div>
      )}

      <p className="text-xs text-center mt-3" style={{ color: "#8AADA8" }}>
        {ar
          ? "ملفاتك تتحلل وتنحذف فوراً. ما نخزن شي · الخصوصية أولاً."
          : "Your files are analyzed and immediately discarded. Nothing is stored."}
      </p>
    </motion.div>
  );
}
