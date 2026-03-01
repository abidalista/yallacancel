"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, FolderOpen, FileDown, Link2, BookOpen, Loader2 } from "lucide-react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";

interface PaywallModalProps {
  locale: "ar" | "en";
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const FEATURES_AR = [
  { icon: FolderOpen, text: "ارفع كشوفات بدون حد — كل بطاقاتك وبنوكك" },
  { icon: FileDown, text: "حمل تقرير PDF كامل — نسختك تبقى معك" },
  { icon: Link2, text: "روابط إلغاء مباشرة — أكثر من ٥٠ خدمة" },
  { icon: BookOpen, text: "شرح خطوة بخطوة — كيف تلغي كل اشتراك" },
];

const FEATURES_EN = [
  { icon: FolderOpen, text: "Unlimited uploads — all your cards and banks" },
  { icon: FileDown, text: "Download full PDF report — keep your copy" },
  { icon: Link2, text: "Direct cancel links — 50+ services" },
  { icon: BookOpen, text: "Step-by-step guide to cancel each subscription" },
];

export default function PaywallModal({ locale, onClose, onPaymentSuccess }: PaywallModalProps) {
  const ar = locale === "ar";
  const features = ar ? FEATURES_AR : FEATURES_EN;
  const [showCheckout, setShowCheckout] = useState(false);

  const planId = process.env.NEXT_PUBLIC_WHOP_PLAN_ID || "plan_3E0V8cxU8VYXI";

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
          className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
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
            <h2 className="text-xl font-extrabold">YallaCancel</h2>
            <p className="text-sm mt-1" style={{ color: "rgba(197,221,217,0.7)" }}>
              {ar ? "تخلص من الاشتراكات اللي ما تبيها" : "Get rid of subscriptions you don't need"}
            </p>
          </div>

          {!showCheckout ? (
            <>
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
                  onClick={() => setShowCheckout(true)}
                >
                  {ar ? "تقريرك الكامل — ٤٩ ريال" : "Your full report — 49 SAR"}
                </button>

                <p className="text-xs text-center" style={{ color: "#8AADA8" }}>
                  {ar
                    ? "دفع آمن ومشفر · يقبل مدى وفيزا وماستر و Apple Pay"
                    : "Secure & encrypted · Accepts mada, Visa, Mastercard & Apple Pay"}
                </p>
              </div>
            </>
          ) : (
            /* Whop Checkout Embed */
            <div className="px-4 py-5" dir="ltr">
              <WhopCheckoutEmbed
                planId={planId}
                theme="light"
                skipRedirect
                onComplete={() => {
                  onPaymentSuccess();
                }}
                fallback={
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin" style={{ color: "#00A651" }} />
                  </div>
                }
              />
              <button
                onClick={() => setShowCheckout(false)}
                className="w-full text-center text-sm mt-3 py-2"
                style={{ color: "#8AADA8" }}
              >
                {ar ? "← رجوع" : "← Back"}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
