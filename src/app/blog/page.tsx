"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, ArrowRight, Globe } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-data";
import { getStoredLocale, setStoredLocale } from "@/lib/locale-store";

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
};

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  "احصائيات": { bg: "#DBEAFE", color: "#1E40AF" },
  "Stats": { bg: "#DBEAFE", color: "#1E40AF" },
  "أدلة": { bg: "#D1FAE5", color: "#065F46" },
  "Guides": { bg: "#D1FAE5", color: "#065F46" },
  "توعية": { bg: "#FEF3C7", color: "#92400E" },
  "Awareness": { bg: "#FEF3C7", color: "#92400E" },
  "نصائح": { bg: "#E0E7FF", color: "#3730A3" },
  "Tips": { bg: "#E0E7FF", color: "#3730A3" },
};

export default function BlogPage() {
  const [locale, setLocaleState] = useState<"ar" | "en">("ar");
  const setLocale = (l: "ar" | "en") => { setLocaleState(l); setStoredLocale(l); };
  const ar = locale === "ar";

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored !== "ar") setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dir = ar ? "rtl" : "ltr";
    document.documentElement.lang = ar ? "ar" : "en";
  }, [ar]);

  return (
    <div dir={ar ? "rtl" : "ltr"} style={{ background: "#EDF5F3", minHeight: "100vh", fontFamily: ar ? "'Noto Sans Arabic', 'Plus Jakarta Sans', sans-serif" : "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      {/* Nav */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(237,245,243,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #C9E0DA",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={14} color="#1A3A35" strokeWidth={2.5} style={{ transform: ar ? "scaleX(-1)" : "none" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#4A6862" }}>{ar ? "الرئيسية" : "Home"}</span>
          </a>
          <a href="/" style={{ textDecoration: "none" }}>
            <span className="nav-logo" style={{ color: "#1A3A35", fontSize: "1.3rem" }}>yallacancel</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setLocale(ar ? "en" : "ar")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "white", border: "1.5px solid #C5DDD9",
                padding: "6px 12px", borderRadius: 999,
                fontWeight: 600, fontSize: 11, color: "#4A6862",
                cursor: "pointer",
              }}
            >
              <Globe size={13} strokeWidth={1.5} />
              {ar ? "EN" : "ع"}
            </button>
            <a
              href="/"
              style={{
                background: "#1A3A35", color: "#fff",
                padding: "7px 14px", borderRadius: 999,
                fontWeight: 700, fontSize: 12,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {ar ? "حلل كشفك" : "Scan now"}
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: "72px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#C5DDD9", borderRadius: 999,
            padding: "5px 14px", marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00A651", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1A3A35" }}>{ar ? "مقالات يلا كنسل" : "YallaCancel Blog"}</span>
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 900, lineHeight: 1.15,
            color: "#1A3A35", margin: "0 0 16px",
            letterSpacing: "-0.5px",
          }}>
            {ar ? <>نصائح وادلة لتوفير<br />فلوس الاشتراكات</> : <>Tips and guides to save<br />on subscriptions</>}
          </h1>
          <p style={{ fontSize: 16, color: "#4A6862", lineHeight: 1.7 }}>
            {ar
              ? "مقالات عملية عن الاشتراكات الرقمية، طرق التوفير، وادلة الالغاء"
              : "Practical articles about digital subscriptions, saving tips, and cancellation guides"}
          </p>
        </div>
      </section>

      {/* Blog grid */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}
        >
          {BLOG_POSTS.map((post) => {
            const catLabel = ar ? post.category : post.categoryEn;
            const cat = CATEGORY_COLORS[catLabel] || { bg: "#E5EFED", color: "#4A6862" };
            return (
              <motion.a
                key={post.slug}
                variants={stagger.item}
                href={`/blog/${post.slug}`}
                style={{
                  display: "flex", flexDirection: "column",
                  background: "#fff", borderRadius: 20,
                  padding: 24,
                  border: "1.5px solid #E5EFED",
                  textDecoration: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
                  cursor: "pointer",
                }}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,166,81,0.1)", borderColor: "#00A651" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: "3px 10px", borderRadius: 999,
                    background: cat.bg, color: cat.color,
                  }}>
                    {catLabel}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8AADA8" }}>
                    <Clock size={11} strokeWidth={2} />
                    {post.readTime}
                  </span>
                </div>
                <h2 style={{
                  fontSize: 17, fontWeight: 800, color: "#1A3A35",
                  lineHeight: 1.4, marginBottom: 10,
                }}>
                  {ar ? post.title : post.titleEn}
                </h2>
                <p style={{ fontSize: 13, color: "#4A6862", lineHeight: 1.7, flex: 1 }}>
                  {ar ? post.excerpt : post.excerptEn}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "1px solid #E5EFED" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#00A651" }}>
                    {ar ? "اقرأ المزيد" : "Read more"} {ar ? <ArrowLeft size={12} strokeWidth={2.5} /> : <ArrowRight size={12} strokeWidth={2.5} />}
                  </span>
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </div>

      {/* CTA */}
      <section style={{ background: "#1A3A35", padding: "64px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 12 }}>
            {ar ? "تبي تعرف اشتراكاتك؟" : "Want to find your subscriptions?"}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 28, lineHeight: 1.7 }}>
            {ar ? "ارفع كشف حسابك ونكشف كل الاشتراكات المخفية في ثواني" : "Upload your bank statement and we'll find all hidden subscriptions in seconds"}
          </p>
          <a href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#00A651", color: "#fff",
            padding: "14px 32px", borderRadius: 999,
            fontWeight: 800, fontSize: 14, textDecoration: "none",
            boxShadow: "0 4px 20px rgba(0,166,81,0.35)",
          }}>
            {ar ? "حلل كشفك" : "Scan your statement"} {ar ? <ArrowRight size={14} strokeWidth={2.5} style={{ transform: "scaleX(-1)" }} /> : <ArrowRight size={14} strokeWidth={2.5} />}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#112920", padding: "28px 24px", textAlign: "center" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span className="nav-logo" style={{ color: "rgba(255,255,255,0.45)", justifyContent: "center" }}>yallacancel</span>
        </a>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>&copy; 2026 Yalla Cancel</p>
      </footer>
    </div>
  );
}
