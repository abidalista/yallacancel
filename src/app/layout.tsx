import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yalla Cancel | يلا كانسل — اكتشف اشتراكاتك المخفية",
  description:
    "ارفع كشف حسابك البنكي واكتشف كل الاشتراكات المتكررة اللي تسحب فلوسك. يدعم البنوك السعودية — خصوصية كاملة، كل شيء يتم على جهازك.",
  keywords: "اشتراكات, بنوك سعودية, الغاء اشتراكات, كشف حساب, الراجحي, الأهلي",
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
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
