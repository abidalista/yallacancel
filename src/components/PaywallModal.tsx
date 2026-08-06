"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderOpen, FileDown, Link2, BookOpen, Loader2, Mail, Zap } from "lucide-react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { PRICE_LABEL, normalizeAccessCode } from "@/lib/format";
import Ltr from "@/components/Ltr";

interface PaywallModalProps {
  locale: "ar" | "en";
  onClose: () => void;
  onPaymentSuccess: (receiptId: string) => void;
}

const FEATURES_AR = [
  { icon: Link2, text: "روابط إلغاء مباشرة لكل اشتراك مخفي" },
  { icon: FolderOpen, text: "أسماء كل الاشتراكات بدون تمويه" },
  { icon: FileDown, text: "المبلغ السنوي الكامل واضح" },
  { icon: BookOpen, text: "دليل خطوة بخطوة لإلغاء كل خدمة" },
];

const FEATURES_EN = [
  { icon: Link2, text: "Direct cancel links for every hidden subscription" },
  { icon: FolderOpen, text: "Unblur every subscription name" },
  { icon: FileDown, text: "Full yearly spend, clearly listed" },
  { icon: BookOpen, text: "Step-by-step cancel guide for each service" },
];

const DEV_UNLOCK = process.env.NEXT_PUBLIC_DEV_UNLOCK === "true";

export default function PaywallModal({
  locale,
  onClose,
  onPaymentSuccess,
}: PaywallModalProps) {
  const ar = locale === "ar";
  const features = ar ? FEATURES_AR : FEATURES_EN;
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [receiptMissing, setReceiptMissing] = useState(false);
  const planId = process.env.NEXT_PUBLIC_WHOP_PLAN_ID || "plan_3E0V8cxU8VYXI";

  function submitAccessCode() {
    const raw = accessCode.trim();
    // Recovery: paste Whop receipt id (pay_…) from dashboard email / support
    if (/^pay_[A-Za-z0-9]+$/.test(raw)) {
      setCodeError(false);
      onPaymentSuccess(raw);
      return;
    }
    const code = normalizeAccessCode(raw);
    if (!code) {
      setCodeError(true);
      return;
    }
    setCodeError(false);
    onPaymentSuccess(`founder_${code}`);
  }

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
          <div className="bg-gradient-to-br from-[#1A3A35] to-[#0F2A26] px-6 py-6 text-white text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-white/70 hover:text-white p-1 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
            <Zap size={28} strokeWidth={1.5} className="mx-auto mb-2" />
            <h2 className="text-xl font-extrabold">YallaCancel Pro</h2>
            <p className="text-white/70 text-sm mt-1">
              {ar ? "افتح كل الاشتراكات وروابط الإلغاء" : "Unblur every sub + direct cancel links"}
            </p>
          </div>

          {!showCheckout ? (
            <>
              <div className="px-6 py-5 space-y-3">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#E8F7EE] flex items-center justify-center flex-shrink-0">
                        <Icon size={16} strokeWidth={1.5} className="text-[#00A651]" />
                      </div>
                      <span className="text-sm text-slate-700 leading-snug pt-1">
                        {f.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 pb-6 space-y-3">
                <div className="bg-[#E8F7EE] border border-[#E5EFED] rounded-2xl p-4 text-center">
                  <div className="text-3xl font-extrabold text-[#00A651] tracking-tight">
                    <Ltr>{ar ? PRICE_LABEL : "49 SAR"}</Ltr>
                  </div>
                  <div className="text-sm text-slate-500">
                    {ar ? "دفعة واحدة · بدون اشتراك شهري" : "One time payment · no monthly fee"}
                  </div>
                </div>

                <button
                  className="btn-primary w-full text-center"
                  onClick={() => setShowCheckout(true)}
                >
                  {ar ? (
                    <>افتح الكل · <Ltr>{PRICE_LABEL}</Ltr></>
                  ) : (
                    <>Unlock all · <Ltr>49 SAR</Ltr></>
                  )}
                </button>

                {DEV_UNLOCK && (
                  <button
                    type="button"
                    className="w-full text-center text-xs text-slate-400 py-2 hover:text-slate-600"
                    onClick={() => onPaymentSuccess("dev_unlock")}
                  >
                    Dev unlock (no payment)
                  </button>
                )}

                {!showCode ? (
                  <button
                    type="button"
                    className="w-full text-center text-xs text-slate-400 py-1 hover:text-slate-600"
                    onClick={() => setShowCode(true)}
                  >
                    {ar ? "لديك كود؟" : "Have an access code?"}
                  </button>
                ) : (
                  <div className="space-y-2 pt-1">
                    {receiptMissing && (
                      <p className="text-xs text-amber-700 text-center bg-amber-50 rounded-lg px-2 py-2">
                        {ar
                          ? "الدفع تم · الصق رقم الإيصال pay_ من إيميل Whop"
                          : "Payment went through · paste your pay_ receipt from Whop email"}
                      </p>
                    )}
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => {
                        setAccessCode(e.target.value);
                        setCodeError(false);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && submitAccessCode()}
                      placeholder={ar ? "كود أو pay_…" : "Code or pay_… receipt"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#00A651]"
                      dir="ltr"
                      autoComplete="off"
                      autoCapitalize="off"
                    />
                    {codeError && (
                      <p className="text-xs text-red-500 text-center">
                        {ar ? "الكود غلط أو فاضي" : "Code is empty or invalid"}
                      </p>
                    )}
                    <button
                      type="button"
                      className="btn-ghost w-full text-sm"
                      onClick={submitAccessCode}
                    >
                      {ar ? "فتح بالكود" : "Unlock with code"}
                    </button>
                  </div>
                )}

                <p className="text-xs text-center text-slate-400">
                  {ar
                    ? "دفع آمن · يقبل مدى وفيزا وماستر و Apple Pay"
                    : "Secure payment · mada, Visa, Mastercard, Apple Pay"}
                </p>
              </div>
            </>
          ) : (
            <div className="px-4 py-5" dir="ltr">
              <div
                className="flex items-center gap-2 px-3 py-2.5 mb-3 rounded-xl text-xs bg-[#FFF7ED] text-[#92400E]"
                dir={ar ? "rtl" : "ltr"}
              >
                <Mail size={14} strokeWidth={1.5} className="flex-shrink-0" />
                <span>
                  {ar
                    ? "حط ايميلك الصحيح عشان يوصلك التقرير"
                    : "Use your real email so we can send your report"}
                </span>
              </div>
              <WhopCheckoutEmbed
                planId={planId}
                theme="light"
                skipRedirect
                returnUrl={
                  typeof window !== "undefined"
                    ? `${window.location.origin}${window.location.pathname}?whop_return=1`
                    : undefined
                }
                onComplete={(_planId, receiptId) => {
                  // receipt_id is pay_… — never invent a fake id (verify would fail)
                  if (!receiptId || !receiptId.startsWith("pay_")) {
                    setReceiptMissing(true);
                    setShowCheckout(false);
                    setShowCode(true);
                    return;
                  }
                  onPaymentSuccess(receiptId);
                }}
                fallback={
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-[#00A651]" />
                  </div>
                }
              />
              <button
                onClick={() => setShowCheckout(false)}
                className="w-full text-center text-sm mt-3 py-2 text-slate-400"
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
