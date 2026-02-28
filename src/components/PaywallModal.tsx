"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, FolderOpen, FileDown, Link2, BookOpen, MessageSquare, Infinity } from "lucide-react";

interface PaywallModalProps {
  locale: "ar" | "en";
  onClose: () => void;
}

const FEATURES_AR = [
  { icon: FolderOpen, text: "رفع كشوفات غير محدودة — كل بطاقاتك وبنوكك" },
  { icon: FileDown, text: "تصدير تقرير PDF بالعربي — احتفظ بنسخة" },
  { icon: Link2, text: "روابط إلغاء مباشرة لأكثر من ٥٠ خدمة سعودية" },
  { icon: BookOpen, text: "دليل خطوة بخطوة لإلغاء كل اشتراك" },
  { icon: MessageSquare, text: "قوالب رسائل إلغاء جاهزة بالعربي" },
  { icon: Infinity, text: "تحديثات مدى الحياة — دفعة واحدة وخلاص" },
];

const FEATURES_EN = [
  { icon: FolderOpen, text: "Unlimited CSV uploads — all your cards and banks" },
  { icon: FileDown, text: "Export Arabic PDF report — keep a copy" },
  { icon: Link2, text: "Direct cancel links for 50+ Saudi services" },
  { icon: BookOpen, text: "Step-by-step cancellation guide for each service" },
  { icon: MessageSquare, text: "Ready-to-send Arabic cancellation message templates" },
  { icon: Infinity, text: "Lifetime updates — pay once, done" },
];

export default function PaywallModal({ locale, onClose }: PaywallModalProps) {
  const ar = locale === "ar";
  const features = ar ? FEATURES_AR : FEATURES_EN;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden"
          dir={ar ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="px-6 py-6 text-white text-center relative" style={{ background: "#1A3A35" }}>
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-1 rounded-full transition-colors"
              style={{ color: "rgba(197,221,217,0.7)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(197,221,217,0.7)")}
              aria-label="Close"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
            <Zap size={28} strokeWidth={1.5} className="mx-auto mb-2" />
            <h2 className="text-xl font-extrabold">Yalla Cancel Pro</h2>
            <p className="text-sm mt-1" style={{ color: "rgba(197,221,217,0.7)" }}>
              {ar ? "كل شيء تحتاجه لتنظيف اشتراكاتك" : "Everything you need to clean up your subscriptions"}
            </p>
          </div>

          {/* Features */}
          <div className="px-6 py-5 space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E8F7EE" }}>
                    <Icon size={16} strokeWidth={1.5} style={{ color: "#00A651" }} />
                  </div>
                  <span className="text-sm leading-snug pt-1" style={{ color: "#4A6862" }}>
                    {f.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing */}
          <div className="px-6 pb-6 space-y-3">
            <div className="rounded-2xl p-4 text-center" style={{ background: "#E5EFED", border: "1px solid #C5DDD9" }}>
              <div className="text-3xl font-extrabold tracking-tight" style={{ color: "#1A3A35" }}>
                {ar ? "٤٩ ريال" : "49 SAR"}
              </div>
              <div className="text-sm" style={{ color: "#4A6862" }}>
                {ar ? "دفعة واحدة — بدون اشتراك شهري" : "One-time payment — no monthly fee"}
              </div>
            </div>

            <button
              className="btn-primary w-full text-center"
              onClick={() => alert(ar ? "قريبا — جاري ربط بوابة الدفع" : "Coming soon — payment gateway integration in progress")}
            >
              {ar ? "ادفع بمدى أو بطاقة — ٤٩ ريال" : "Pay with mada or card — 49 SAR"}
            </button>

            <p className="text-xs text-center" style={{ color: "#8AADA8" }}>
              {ar
                ? "الدفع عبر موياسر · آمن ومشفر · يقبل مدى وفيزا وماستر"
                : "Powered by Moyasar · Secure & encrypted · Accepts mada, Visa, Mastercard"}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
