"use client";

import type { Lang, Post } from "@/lib/types";
import { t } from "@/lib/utils";
import Link from "next/link";

type Props = { lang: Lang; posts: Post[] };

const copy = {
  de: { label: "05", title: "Blog" },
  en: { label: "05", title: "Blog" },
};

export default function BlogGrid({ lang, posts }: Props) {
  const c = copy[lang];

  return (
    <section id="blog" className="section">
      <div className="container">
        <SectionHead label={c.label} title={c.title} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
          className="blog-grid"
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${lang}/blog/${post.id}`}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              <article
                style={{
                  border: "1px solid var(--line-soft)",
                  borderRadius: 18,
                  overflow: "hidden",
                  background: "var(--bg-2)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1 /* fills the Link height */,
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--fg)";
                  el.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--line-soft)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Media */}
                <div
                  style={{
                    aspectRatio: "4/3",
                    background: "var(--bg)",
                    position: "relative",
                    overflow: "hidden",
                    borderBottom: "1px solid var(--line-soft)",
                  }}
                >
                  {/* Gradient */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(circle at 30% 40%, rgba(245,243,238,.04), transparent 50%), linear-gradient(135deg,#1F1F24 0%, #2C2C33 100%)",
                    }}
                  />
                  {/* Glyph */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-display)",
                      fontSize: 120,
                      color: "var(--bg)",
                      WebkitTextStroke: "1.5px var(--line)",
                      letterSpacing: "-0.04em",
                      userSelect: "none",
                    }}
                  >
                    {post.glyph ?? post.id.slice(0, 2).toUpperCase()}
                  </div>
                  {/* Tag */}
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--fg)",
                      zIndex: 1,
                    }}
                  >
                    {t(post.category, lang)}
                  </div>
                </div>

                {/* Body */}
                <div
                  style={{
                    padding: "22px 22px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--fg-mute)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {t(post.date_label, lang)} · {t(post.read_time, lang)}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      lineHeight: 1.2,
                      textTransform: "uppercase",
                      letterSpacing: "0.005em",
                      color: "var(--fg)",
                      margin: 0,
                    }}
                  >
                    {t(post.title, lang)}
                  </h3>
                  <p
                    style={{
                      color: "var(--fg-dim)",
                      fontSize: 14,
                      lineHeight: 1.55,
                      flex: 1,
                      margin: 0,
                    }}
                  >
                    {t(post.excerpt, lang)}
                  </p>
                  {/* Read link */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--fg)",
                      marginTop: 6,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 18,
                        height: 1,
                        background: "var(--accent-spark)",
                      }}
                    />
                    {lang === "de" ? "Lesen" : "Read"}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .blog-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .blog-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 40,
        marginBottom: 64,
        paddingBottom: 20,
        borderBottom: "1px solid var(--line-soft)",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--fg-mute)",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          {label}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 5.5vw, 72px)",
            lineHeight: 0.95,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            color: "var(--fg)",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}
