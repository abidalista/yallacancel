"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Shield, Package, CreditCard, Lock, RotateCcw, Mail, Scale } from "lucide-react";

const SECTIONS = [
  {
    icon: Shield,
    title: "ع ا س",
    titleEn: "About YallaCancel",
    content: `ا س أداة تساعد تتش ااشتراات اتررة ا تسحب  حساب اب  شر بد ا تدر.

اطرة بسطة: ترع ش حساب اب (PDF أ CSV) ح حا داخ تصح — ع  ا طع  جاز أبدا. تش  ااشتراات ساعد ترر ش تب ش تغ.

ا خز شات بة ع سرراتا. أبدا.`,
  },
  {
    icon: Package,
    title: "اتجات",
    titleEn: "Products",
    content: `**أداة ش ااشتراات**
تح ش حساب اب تطع   اعات اتررة — ساء اشتراات اضحة ث Netflix  Spotify أ رس خة ا ت تتب ا.

**استخد اجا** ش أع  اشتراات تشة.

**استخد ادع** حص ع اترر اا ع  ااشتراات اتشة + أدة إغاء باشرة.

**ترر تجرب**
تدر تجرب اأداة بباات تجربة جازة ب ا ترع ش — بد ا تحتاج تسج أ تدع.`,
  },
  {
    icon: CreditCard,
    title: "اأسعار",
    titleEn: "Pricing",
    content: `**جا:** ش أع  اشتراات تشة  ش حساب.

** را سعد (دعة احدة):** اتح اترر اا ع  ااشتراات اتشة + أدة إغاء خطة بخطة.

ا  اشترا شر. ا  رس خة. تدع رة حدة بس.`,
  },
  {
    icon: Lock,
    title: "ساسة اخصصة",
    titleEn: "Privacy Policy",
    content: `شات ابة تتح ترأ حا داخ تصح. ا رعا ا خزا ع أ سرر.

ا حظ أ باات اة شخصة.

ا بع ا شار باات ع أ طر ثاث.

ا ستخد أ أدات تح أ ز أ أدات تتبع.

خصصت  زة إضاة —  اأساس.`,
  },
  {
    icon: RotateCcw,
    title: "ساسة ااسترجاع ااسترداد",
    titleEn: "Refund Policy",
    content: `جع عات اشراء ائة. ا د استرداد بعد ادع.

صح تجرب است اجا أ اترر اتجرب ب ا تشتر — عشا تتأد إ اخدة تاسب.`,
  },
  {
    icon: Mail,
    title: "تاص عا",
    titleEn: "Contact Us",
    content: `عد سؤا أ تحتاج ساعدة؟ تاص عا ع:

**theamsh@gmail.com**

رد عادة خا  ساعة.`,
  },
  {
    icon: Scale,
    title: "عات اة",
    titleEn: "Legal Info",
    content: `ا س سجة تحت رخصة ع حر  اة اعربة اسعدة.`,
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
          {ar ? "اشاة اساسات" : "Transparency & Policies"}
        </h1>
        <p className="text-sm mb-12" style={{ color: "#8AADA8" }}>
          {ar ? " ش تحتاج تعر ع ا س  ا احد." : "Everything you need to know about YallaCancel in one place."}
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
            {ar ? " ارجع صحة ارئسة" : " Back to homepage"}
          </a>
        </div>
      </main>
    </div>
  );
}
