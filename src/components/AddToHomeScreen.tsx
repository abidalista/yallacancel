"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, PlusSquare, Check, Smartphone } from "lucide-react";

interface AddToHomeScreenProps {
  locale: "ar" | "en";
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function AddToHomeScreen({ locale }: AddToHomeScreenProps) {
  const [show, setShow] = useState(false);
  const ar = locale === "ar";
  const ios = isIos();

  const steps = ios
    ? [
        { num: 1, icon: Share, text: ar ? "اضغط زر المشاركة في Safari" : "Tap the Share button in Safari" },
        { num: 2, icon: PlusSquare, text: ar ? "مرّر للأسفل واضغط إضافة إلى الشاشة الرئيسية" : "Scroll and tap Add to Home Screen" },
        { num: 3, icon: Check, text: ar ? "اضغط إضافة في أعلى اليمين" : "Tap Add in the top right" },
      ]
    : [
        { num: 1, icon: Share, text: ar ? "اضغط على قائمة المتصفح ⋮" : "Tap the browser menu ⋮" },
        { num: 2, icon: PlusSquare, text: ar ? "اختر إضافة إلى الشاشة الرئيسية" : "Choose Add to Home screen" },
        { num: 3, icon: Check, text: ar ? "اضغط إضافة للتأكيد" : "Tap Add to confirm" },
      ];

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
        title={ar ? "أضف للشاشة الرئيسية" : "Add to home screen"}
      >
        <Smartphone size={20} strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={() => setShow(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[28px] px-6 pt-4 pb-8 max-w-[500px] mx-auto"
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

              <button
                onClick={() => setShow(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>

              <h3 className="text-xl font-extrabold tracking-tight text-slate-900 mb-2">
                {ar ? "أضف يلا كانسل لشاشتك" : "Add YallaCancel to your home screen"}
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {ar
                  ? "استخدمه كتطبيق — أسرع، شاشة كاملة، ووصول فوري من الشاشة الرئيسية."
                  : "Get a faster, full-screen experience — instant access from your home screen."}
              </p>

              <div className="space-y-3 mb-6">
                {steps.map((step) => (
                  <div key={step.num} className="flex items-center gap-4 bg-slate-50 rounded-2xl px-4 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.num}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 flex-1">{step.text}</span>
                    <step.icon size={20} strokeWidth={1.5} className="text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                {ar
                  ? ios
                    ? "يعمل بشكل أفضل على Safari في الآيفون."
                    : "يعمل على Chrome و Samsung Internet ومعظم متصفحات أندرويد."
                  : ios
                    ? "Works best in Safari on iPhone."
                    : "Works in Chrome, Samsung Internet, and most Android browsers."}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
