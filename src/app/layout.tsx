import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yalla Cancel | يلا كانسل · اكتشف اشتراكاتك المخفية",
  description:
    "ارفع كشف حسابك البنكي واكتشف كل الاشتراكات المتكررة اللي تسحب فلوسك بدون ما تدري. يدعم جميع البنوك السعودية.",
  keywords:
    "اشتراكات, بنوك سعودية, الغاء اشتراكات, كشف حساب, الراجحي, الأهلي, يلا كانسل, yalla cancel, cancel subscription saudi",
  alternates: {
    canonical: "https://yallacancel.com",
    languages: {
      "ar-SA": "https://yallacancel.com",
      "en": "https://yallacancel.com",
    },
  },
  openGraph: {
    title: "Yalla Cancel · اشتراكاتك تحت السيطرة",
    description: "لا تترك تطبيقاتك تسحب من رصيدك. تابع والغي اشتراكاتك من مكان واحد.",
    type: "website",
    locale: "ar_SA",
    siteName: "Yalla Cancel",
    url: "https://yallacancel.com",
    images: [
      {
        url: "https://yallacancel.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yalla Cancel · اشتراكاتك تحت السيطرة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yalla Cancel · اشتراكاتك تحت السيطرة",
    description: "لا تترك تطبيقاتك تسحب من رصيدك. تابع والغي اشتراكاتك من مكان واحد.",
    images: ["https://yallacancel.com/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://yallacancel.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="canonical" href="https://yallacancel.com" />
        <link rel="alternate" hrefLang="ar-SA" href="https://yallacancel.com" />
        <link rel="alternate" hrefLang="en" href="https://yallacancel.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Yalla Cancel",
              alternateName: "يلا كانسل",
              url: "https://yallacancel.com",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
              description: "اكتشف اشتراكاتك المخفية والغيها بضغطة زر. يدعم جميع البنوك السعودية.",
              inLanguage: ["ar", "en"],
              areaServed: { "@type": "Country", name: "Saudi Arabia" },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "هل بياناتي آمنة؟",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "نعم. كل التحليل يتم داخل متصفحك · ملفك ما يتم رفعه لأي سيرفر. ما نحتفظ بأي بيانات.",
                  },
                },
                {
                  "@type": "Question",
                  name: "أي بنوك تدعمون؟",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "ندعم جميع البنوك السعودية: الراجحي، الأهلي، بنك الرياض، البلاد، الإنماء، ساب، الفرنسي، العربي الوطني، و stc bank.",
                  },
                },
                {
                  "@type": "Question",
                  name: "كيف أنزّل كشف حسابي؟",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "افتح تطبيق بنكك → الحسابات → كشف الحساب → اختر آخر ٣ إلى ٦ أشهر → نزّله كـ CSV أو PDF.",
                  },
                },
                {
                  "@type": "Question",
                  name: "هل الأداة مجانية؟",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "التحليل الأول مجاني. بعدها تقدر تترقى بـ ٤٩ ريال لمرة واحدة · بدون اشتراك شهري.",
                  },
                },
                {
                  "@type": "Question",
                  name: "هل يلا كانسل يلغي الاشتراكات عني؟",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "حالياً نوفر لك تقرير تفصيلي مع روابط إلغاء مباشرة. الإلغاء نفسه تسويه بنفسك عبر الرابط · عادة يأخذ أقل من دقيقة لكل اشتراك.",
                  },
                },
              ],
            }),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
