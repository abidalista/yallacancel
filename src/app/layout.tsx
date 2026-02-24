import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yalla Cancel | يلا كانسل — اكتشف اشتراكاتك المخفية",
  description:
    "ارفع كشف حسابك البنكي واكتشف كل الاشتراكات المتكررة اللي تسحب فلوسك بدون ما تدري. يدعم جميع البنوك السعودية.",
  keywords:
    "اشتراكات, بنوك سعودية, الغاء اشتراكات, كشف حساب, الراجحي, الأهلي, يلا كانسل, yalla cancel",
  openGraph: {
    title: "Yalla Cancel — اشتراكاتك تحت السيطرة",
    description: "لا تترك تطبيقاتك تسحب من رصيدك. تابع وألغِ اشتراكاتك من مكان واحد.",
    type: "website",
    locale: "ar_SA",
    siteName: "Yalla Cancel",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yalla Cancel — اشتراكاتك تحت السيطرة",
    description: "لا تترك تطبيقاتك تسحب من رصيدك. تابع وألغِ اشتراكاتك من مكان واحد.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;700;800;900&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
