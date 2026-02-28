"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Shield, Package, CreditCard, Lock, RotateCcw, Mail, Scale } from "lucide-react";

const SECTIONS = [
  {
    icon: Shield,
    title: "عن يلا كنسل",
    titleEn: "About YallaCancel",
    content: `يلا كنسل أداة تساعدك تكتشف الاشتراكات المتكررة اللي تسحب من حسابك البنكي كل شهر بدون ما تدري.

الطريقة بسيطة: ترفع كشف حسابك البنكي (PDF أو CSV)، ونحلله محلياً داخل متصفحك — يعني ملفك ما يطلع من جهازك أبداً. نكتشف لك الاشتراكات، ونساعدك تقرر وش تبقيه ووش تلغيه.

ما نخزن كشوفات بنكية على سيرفراتنا. أبداً.`,
  },
  {
    icon: Package,
    title: "المنتجات",
    titleEn: "Products",
    content: `**أداة كشف الاشتراكات**
تحلل كشف حسابك البنكي وتطلع لك كل العمليات المتكررة — سواء اشتراكات واضحة مثل Netflix و Spotify، أو رسوم مخفية ما كنت تنتبه لها.

**المستخدم المجاني** يشوف أعلى ٣ اشتراكات مكتشفة.

**المستخدم المدفوع** يحصل على التقرير الكامل مع كل الاشتراكات المكتشفة + أدلة إلغاء مباشرة.

**تقرير تجريبي**
تقدر تجرب الأداة ببيانات تجريبية جاهزة قبل ما ترفع كشفك — بدون ما تحتاج تسجل أو تدفع.`,
  },
  {
    icon: CreditCard,
    title: "الأسعار",
    titleEn: "Pricing",
    content: `**مجاني:** شوف أعلى ٣ اشتراكات مكتشفة من كشف حسابك.

**٤٩ ريال سعودي (دفعة واحدة):** افتح التقرير الكامل مع كل الاشتراكات المكتشفة + أدلة إلغاء خطوة بخطوة.

ما في اشتراك شهري. ما في رسوم مخفية. تدفع مرة وحدة وبس.`,
  },
  {
    icon: Lock,
    title: "سياسة الخصوصية",
    titleEn: "Privacy Policy",
    content: `كشوفاتك البنكية تتحلل وتنقرأ محلياً داخل متصفحك. ما نرفعها ولا نخزنها على أي سيرفر.

ما نحفظ أي بيانات مالية شخصية.

ما نبيع ولا نشارك بياناتك مع أي طرف ثالث.

ما نستخدم أي أدوات تحليل أو كوكيز أو أدوات تتبع.

خصوصيتك مو ميزة إضافية — هي الأساس.`,
  },
  {
    icon: RotateCcw,
    title: "سياسة الاسترجاع والاسترداد",
    titleEn: "Refund Policy",
    content: `جميع عمليات الشراء نهائية. ما نقدم استرداد بعد الدفع.

ننصحك تجرب المستوى المجاني أو التقرير التجريبي قبل ما تشتري — عشان تتأكد إن الخدمة تناسبك.`,
  },
  {
    icon: Mail,
    title: "تواصل معنا",
    titleEn: "Contact Us",
    content: `عندك سؤال أو تحتاج مساعدة؟ تواصل معنا على:

**theamsh@gmail.com**

نرد عادةً خلال ٢٤ ساعة.`,
  },
  {
    icon: Scale,
    title: "معلومات قانونية",
    titleEn: "Legal Info",
    content: `يلا كنسل مسجلة تحت رخصة عمل حر في المملكة العربية السعودية.`,
  },
];

export default function TransparencyPage() {
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const ar = locale === "ar";

  useEffect(() => {
    document.documentElement.dir = ar ? "rtl" : "ltr";
    document.documentElement.lang = ar ? "ar" : "en";
  }, [ar]);

  return (
    <div className="min-h-screen bg-[#EDF5F3]">
      <Header
        locale={locale}
        onLocaleChange={setLocale}
        onLogoClick={() => { window.location.href = "/"; }}
      />

      <main className="max-w-[700px] mx-auto px-6 pt-24 pb-20">
        {/* Page header */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3" style={{ color: "#1A3A35" }}>
          {ar ? "الشفافية والسياسات" : "Transparency & Policies"}
        </h1>
        <p className="text-sm mb-12" style={{ color: "#8AADA8" }}>
          {ar ? "كل شي تحتاج تعرفه عن يلا كنسل في مكان واحد." : "Everything you need to know about YallaCancel in one place."}
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.title}
                className="bento-card p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "#E8F7EE" }}
                  >
                    <Icon size={18} strokeWidth={1.5} style={{ color: "#00A651" }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold" style={{ color: "#1A3A35" }}>
                      {section.title}
                    </h2>
                    <p className="text-xs" style={{ color: "#8AADA8" }}>{section.titleEn}</p>
                  </div>
                </div>
                <div
                  className="text-sm leading-relaxed"
                  style={{ color: "#4A6862" }}
                  dangerouslySetInnerHTML={{
                    __html: section.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1A3A35">$1</strong>')
                      .replace(/\n/g, "<br />"),
                  }}
                />
              </section>
            );
          })}
        </div>

        {/* Back link */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="text-sm font-bold no-underline transition-colors"
            style={{ color: "#00A651" }}
          >
            {ar ? "← ارجع للصفحة الرئيسية" : "← Back to homepage"}
          </a>
        </div>
      </main>
    </div>
  );
}
