"use client";

import { use } from "react";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { getBlogPost, BLOG_POSTS } from "@/lib/blog-data";

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeader: string[] = [];

  function flushTable() {
    if (tableRows.length === 0) return;
    elements.push(
      <div key={`table-${elements.length}`} style={{ overflowX: "auto", margin: "20px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {tableHeader.map((h, i) => (
                <th key={i} style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#1A3A35", borderBottom: "2px solid #C5DDD9", background: "#EDF5F3" }}>
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "10px 14px", textAlign: "right", color: "#4A6862", borderBottom: "1px solid #E5EFED" }}>
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    tableHeader = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line.split("|").filter(Boolean);
      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else if (cells.every((c) => c.trim().match(/^[-:]+$/))) {
        // separator
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{ fontSize: 20, fontWeight: 800, color: "#1A3A35", margin: "32px 0 12px", lineHeight: 1.3 }}>
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{ fontSize: 16, fontWeight: 700, color: "#1A3A35", margin: "24px 0 8px", lineHeight: 1.4 }}>
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} style={{ fontSize: 14, color: "#4A6862", lineHeight: 1.8, marginRight: 20, listStyleType: "disc" }}
          dangerouslySetInnerHTML={{ __html: formatInline(line.replace("- ", "")) }}
        />
      );
    } else if (line.trim() === "") {
      // skip
    } else {
      elements.push(
        <p key={i} style={{ fontSize: 14, color: "#4A6862", lineHeight: 1.9, margin: "8px 0" }}
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }
  }

  if (inTable) flushTable();
  return elements;
}

function formatInline(text: string): string {
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#1A3A35;font-weight:700">$1</strong>');
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#00A651;font-weight:600;text-decoration:underline" target="_blank" rel="noopener">$1</a>');
  return text;
}

export default function BlogPostClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div dir="rtl" style={{ background: "#EDF5F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans Arabic', 'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A3A35", marginBottom: 12 }}>المقال مو موجود</h1>
          <a href="/blog" style={{ color: "#00A651", fontWeight: 700, textDecoration: "none" }}>ارجع للمدونة</a>
        </div>
      </div>
    );
  }

  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div dir="rtl" style={{ background: "#EDF5F3", minHeight: "100vh", fontFamily: "'Noto Sans Arabic', 'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(237,245,243,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #C9E0DA",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/blog" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <ArrowLeft size={16} color="#1A3A35" strokeWidth={2.5} style={{ transform: "scaleX(-1)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4A6862" }}>المدونة</span>
          </a>
          <a href="/" style={{ textDecoration: "none" }}>
            <span className="nav-logo" style={{ color: "#1A3A35" }}>yallacancel</span>
          </a>
          <a href="/" style={{
            background: "#1A3A35", color: "#fff",
            padding: "8px 18px", borderRadius: 999,
            fontWeight: 700, fontSize: 13,
            textDecoration: "none",
          }}>
            حلل كشفك
          </a>
        </div>
      </header>

      {/* Article */}
      <article style={{ maxWidth: 700, margin: "0 auto", padding: "56px 24px 64px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: "3px 10px", borderRadius: 999,
              background: "#D1FAE5", color: "#065F46",
            }}>
              {post.category}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8AADA8" }}>
              <Clock size={12} strokeWidth={2} />
              {post.readTime}
            </span>
            <span style={{ fontSize: 12, color: "#8AADA8" }}>
              {new Date(post.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: 900, lineHeight: 1.25,
            color: "#1A3A35", margin: 0,
            letterSpacing: "-0.5px",
          }}>
            {post.title}
          </h1>
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", border: "1.5px solid #E5EFED" }}>
          {renderContent(post.content)}
        </div>

        {/* CTA */}
        <div style={{
          background: "#1A3A35", borderRadius: 24,
          padding: "40px 28px", marginTop: 32,
          textAlign: "center",
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 10 }}>
            تبي تعرف اشتراكاتك؟
          </h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
            ارفع كشف حسابك ونكشف كل الاشتراكات في ثواني
          </p>
          <a href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#00A651", color: "#fff",
            padding: "12px 28px", borderRadius: 999,
            fontWeight: 700, fontSize: 14, textDecoration: "none",
            boxShadow: "0 4px 16px rgba(0,166,81,0.3)",
          }}>
            حلل كشفك مجاناً <ArrowRight size={14} strokeWidth={2.5} style={{ transform: "scaleX(-1)" }} />
          </a>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1A3A35", marginBottom: 16 }}>مقالات ذات صلة</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {related.map((r) => (
                <a key={r.slug} href={`/blog/${r.slug}`} style={{
                  display: "block", background: "#fff", borderRadius: 16,
                  padding: 20, border: "1.5px solid #E5EFED",
                  textDecoration: "none", transition: "border-color 0.15s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00A651"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5EFED"; }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#8AADA8" }}>{r.category}</span>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1A3A35", margin: "6px 0 0", lineHeight: 1.4 }}>
                    {r.title}
                  </h4>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Footer */}
      <footer style={{ background: "#112920", padding: "28px 24px", textAlign: "center" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span className="nav-logo" style={{ color: "rgba(255,255,255,0.45)", justifyContent: "center" }}>yallacancel</span>
        </a>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>&copy; ٢٠٢٦ Yalla Cancel</p>
      </footer>
    </div>
  );
}
