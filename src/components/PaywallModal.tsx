"use client";

interface PaywallModalProps {
  locale: "ar" | "en";
  onClose: () => void;
}

const FEATURES = {
  ar: [
    { icon: "📂", text: "رفع كشوفات غير محدودة — كل بطاقاتك وبنوكك" },
    { icon: "📄", text: "تصدير تقرير PDF بالعربي — احتفظ بنسخة" },
    { icon: "🔗", text: "روابط إلغاء مباشرة لأكثر من ٥٠ خدمة سعودية" },
    { icon: "📋", text: "دليل خطوة بخطوة لإلغاء كل اشتراك" },
    { icon: "📱", text: "قوالب رسائل إلغاء جاهزة بالعربي" },
    { icon: "♾️", text: "تحديثات مدى الحياة — دفعة واحدة وخلاص" },
  ],
  en: [
    { icon: "📂", text: "Unlimited CSV uploads — all your cards and banks" },
    { icon: "📄", text: "Export Arabic PDF report — keep a copy" },
    { icon: "🔗", text: "Direct cancel links for 50+ Saudi services" },
    { icon: "📋", text: "Step-by-step cancellation guide for each service" },
    { icon: "📱", text: "Ready-to-send Arabic cancellation message templates" },
    { icon: "♾️", text: "Lifetime updates — pay once, done" },
  ],
};

export default function PaywallModal({ locale, onClose }: PaywallModalProps) {
  const ar = locale === "ar";
  const features = FEATURES[locale];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        dir={ar ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="bg-[var(--color-primary)] px-6 py-5 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white/70 hover:text-white text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="text-3xl mb-1">⚡</div>
          <h2 className="text-xl font-black">
            {ar ? "Yalla Cancel Pro" : "Yalla Cancel Pro"}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {ar ? "كل شيء تحتاجه لتنظيف اشتراكاتك" : "Everything you need to clean up your subscriptions"}
          </p>
        </div>

        {/* Features */}
        <div className="px-6 py-5 space-y-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{f.icon}</span>
              <span className="text-sm text-[var(--color-text-primary)] leading-snug">
                {f.text}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="px-6 pb-6 space-y-3">
          <div className="bg-[var(--color-primary-bg)] border border-[var(--color-primary)]/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-[var(--color-primary)]">
              {ar ? "٤٩ ريال" : "49 SAR"}
            </div>
            <div className="text-sm text-[var(--color-text-secondary)]">
              {ar ? "دفعة واحدة — بدون اشتراك شهري" : "One-time payment — no monthly fee"}
            </div>
          </div>

          {/* Moyasar placeholder */}
          <button
            className="btn-primary w-full text-center"
            onClick={() => alert(ar ? "قريباً — جاري ربط بوابة الدفع" : "Coming soon — payment gateway integration in progress")}
          >
            {ar ? "ادفع بمدى أو بطاقة — ٤٩ ريال" : "Pay with mada or card — 49 SAR"}
          </button>

          <p className="text-xs text-center text-[var(--color-text-muted)]">
            {ar
              ? "الدفع عبر موياسر · آمن ومشفر · يقبل مدى وفيزا وماستر"
              : "Powered by Moyasar · Secure & encrypted · Accepts mada, Visa, Mastercard"}
          </p>
        </div>
      </div>
    </div>
  );
}
