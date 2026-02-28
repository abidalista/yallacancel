import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yalla Cancel | ا س — اتش اشتراات اخة",
  description:
    "ارع ش حساب اب اتش  ااشتراات اتررة ا تسحب س بد ا تدر. دع جع اب اسعدة.",
  keywords:
    "اشتراات, ب سعدة, اغاء اشتراات, ش حساب, اراجح, اأ, ا س, yalla cancel, cancel subscription saudi",
  openGraph: {
    title: "Yalla Cancel — اشتراات تحت اسطرة",
    description: "ا تتر تطبات تسحب  رصد. تابع اغ اشتراات  ا احد.",
    type: "website",
    locale: "ar_SA",
    siteName: "Yalla Cancel",
    url: "https://yallacancel.com",
    images: [
      {
        url: "https://yallacancel.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yalla Cancel — اشتراات تحت اسطرة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yalla Cancel — اشتراات تحت اسطرة",
    description: "ا تتر تطبات تسحب  رصد. تابع اغ اشتراات  ا احد.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": " باات آة؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ع.  اتح ت داخ تصح —  ا ت رع أ سرر. ا حتظ بأ باات."
                  }
                },
                {
                  "@type": "Question",
                  "name": "أ ب تدع؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "دع جع اب اسعدة: اراجح اأ ب اراض اباد اإاء ساب ارس اعرب اط  stc bank."
                  }
                },
                {
                  "@type": "Question",
                  "name": " از ش حساب؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "اتح تطب ب  احسابات  ش احساب  اختر اخر - اشر  ز  CSV ا PDF."
                  }
                },
                {
                  "@type": "Question",
                  "name": " اأداة جاة؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "اتح اأ جا. بعدا تدر تتر ب  را رة احدة — بد اشترا شر."
                  }
                },
                {
                  "@type": "Question",
                  "name": " ا س غ ااشتراات ع؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "حاا ر  ترر تص ع رابط إغاء باشرة. اإغاء س تس بس عبر ارابط — عادة أخذ أ  دة  اشترا."
                  }
                }
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
