"use client";

import { SITE_URL } from "@/lib/site";

const FAQ = [
  {
    q: "هل بياناتي آمنة؟",
    a: "CSV نحاول نقرأه في المتصفح أولاً. الفحص الأعمق يرسل نص الكشف لسيرفرنا (Claude) عشان يطلع الاشتراكات. بعض ملفات PDF تحتاج استخراج نص على السيرفر. ما نخزن ملفاتك بعد التحليل. ما نبيع بياناتك.",
  },
  {
    q: "أي بنوك تدعمون؟",
    a: "ندعم البنوك السعودية: الراجحي، الأهلي، بنك الرياض، البلاد، الإنماء، ساب، الفرنسي، العربي الوطني، و stc bank.",
  },
  {
    q: "كيف أنزّل كشف حسابي؟",
    a: "افتح تطبيق بنكك ثم الحسابات ثم كشف الحساب. اختر آخر 3 إلى 6 أشهر. نزّله كـ CSV أو PDF.",
  },
  {
    q: "هل الأداة مجانية؟",
    a: "التحليل الأول مجاني. بعدها تقدر تترقى بـ 49 SAR لمرة واحدة، بدون اشتراك شهري.",
  },
  {
    q: "هل يلا كانسل يلغي الاشتراكات عني؟",
    a: "حالياً نوفر لك تقرير تفصيلي مع روابط إلغاء مباشرة. الإلغاء نفسه تسويه بنفسك عبر الرابط · عادة يأخذ أقل من دقيقة لكل اشتراك.",
  },
];

export default function HomeJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
    url: SITE_URL,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
