import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "أدلة إلغاء الاشتراكات | Yalla Cancel",
  description:
    "أدلة عربية خطوة بخطوة لإلغاء Netflix و شاهد و Spotify و Apple وأكثر من 150 خدمة من السعودية.",
  alternates: {
    canonical: `${SITE_URL}/guides`,
  },
  openGraph: {
    url: `${SITE_URL}/guides`,
    title: "أدلة إلغاء الاشتراكات | Yalla Cancel",
  },
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
