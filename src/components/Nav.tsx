"use client";

import { useLang } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = (lang: Lang) =>
  lang === "de"
    ? [
        { href: "#training", label: "Training" },
        { href: "#events", label: "Events" },
        { href: "#spots", label: "Spots" },
        { href: "#ueber-uns", label: "Über uns" },
        { href: "#blog", label: "Blog" },
        { href: "#faq", label: "FAQ" },
        { href: "#mitmachen", label: "Mitmachen" },
      ]
    : [
        { href: "#training", label: "Training" },
        { href: "#events", label: "Events" },
        { href: "#spots", label: "Spots" },
        { href: "#about", label: "About" },
        { href: "#blog", label: "Blog" },
        { href: "#faq", label: "FAQ" },
        { href: "#join", label: "Join" },
      ];

export default function Nav({ lang }: { lang: Lang }) {
  const { setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const items = navItems(lang);

  return (
    <>
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            top: 68,
            zIndex: 45,
            background: "rgba(0,0,0,0.45)",
          }}
        />
      )}

      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 68,
          background:
            scrolled || menuOpen ? "rgba(26,26,30,0.95)" : "rgba(26,26,30,0)",
          backdropFilter: scrolled || menuOpen ? "blur(14px)" : "none",
          borderBottom: `1px solid ${scrolled || menuOpen ? "var(--line-soft)" : "transparent"}`,
          transition:
            "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
        }}
      >
        <div
          className="container nav-inner"
          style={{
            display: "flex",
            alignItems: "center",
            height: 68,
          }}
        >
          {/* Brand */}
          <Link
            href={`/${lang}`}
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
              overflow: "hidden",
              flexShrink: 1,
            }}
          >
            <img
              src="/logo.png"
              alt="Calisthenics Mainz"
              style={{
                width: 36,
                height: 36,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <div className="nav-brand-text" style={{ minWidth: 0, overflow: "hidden" }}>
              <div
                className="nav-brand-name"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--fg)",
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Calisthenics Mainz
              </div>
              <div
                className="nav-brand-sub"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  color: "var(--fg-mute)",
                }}
              >
                VEREIN · MAINZ
              </div>
            </div>
          </Link>

          {/* Desktop nav — no inline display so Tailwind hidden/flex controls visibility */}
          <nav
            style={{ gap: 28, flex: 1, alignItems: "center" }}
            className="hidden lg:flex"
          >
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  color: "var(--fg-dim)",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "color 0.2s",
                  position: "relative",
                  padding: "4px 0",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--fg)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--fg-dim)")
                }
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* Language toggle */}
            <div
              style={{
                display: "inline-flex",
                border: "1px solid var(--line)",
                borderRadius: 999,
                padding: 4,
                gap: 2,
              }}
            >
              {(["de", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="nav-lang-btn"
                  style={{
                    background: lang === l ? "var(--fg)" : "transparent",
                    color: lang === l ? "var(--accent-ink)" : "var(--fg-mute)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: lang === l ? 600 : 400,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "5px 11px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* CTA — no inline display so Tailwind hidden/inline-flex controls visibility */}
            <a
              href={lang === "de" ? "#mitmachen" : "#join"}
              className="hidden lg:inline-flex"
              style={{
                background: "var(--fg)",
                color: "var(--accent-ink)",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "0.02em",
                padding: "10px 20px",
                borderRadius: 999,
                textDecoration: "none",
                alignItems: "center",
                gap: 8,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#E8FF66")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "var(--fg)")
              }
            >
              {lang === "de" ? "Mitmachen" : "Join"}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>

            {/* Burger / Close */}
            <button
              className="flex lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={menuOpen}
              style={{
                width: 36,
                height: 36,
                border: "1px solid var(--line)",
                borderRadius: 10,
                background: "none",
                color: "var(--fg)",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.2s",
              }}
            >
              {menuOpen ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <style>{`
        .nav-inner { gap: 2rem; }
        @media (max-width: 640px) {
          .nav-inner { gap: 0.5rem; }
          .nav-lang-btn { padding: 5px 8px !important; }
          .nav-brand-sub { display: none; }
        }
        @media (max-width: 359px) {
          .nav-brand-text { display: none; }
        }
      `}</style>

      {/* Mobile menu with slide animation */}
        <div
          style={{
            overflow: "hidden",
            maxHeight: menuOpen ? "480px" : "0",
            transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              padding: "4px 20px 24px",
              background: "var(--bg)",
              borderTop: "1px solid var(--line-soft)",
            }}
          >
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "var(--fg-dim)",
                  fontSize: 16,
                  fontWeight: 500,
                  textDecoration: "none",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--line-soft)",
                  transition: "color 0.2s",
                }}
                onTouchStart={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--fg)")
                }
              >
                {item.label}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ opacity: 0.4 }}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </a>
            ))}
            <a
              href={lang === "de" ? "#mitmachen" : "#join"}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                marginTop: 20,
                background: "var(--fg)",
                color: "var(--accent-ink)",
                fontWeight: 600,
                fontSize: 15,
                padding: "14px",
                borderRadius: 999,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              {lang === "de" ? "Jetzt mitmachen" : "Join now"}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
