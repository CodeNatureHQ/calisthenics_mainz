"use client";

import type { Lang, SiteSettings } from "@/lib/types";
import { useEffect, useRef } from "react";

type Props = { lang: Lang; settings: SiteSettings | null };

const copy = {
  de: {
    eyebrow: "Calisthenics Verein Mainz",
    h1a: "Calisthenics.",
    h1b: "Mainz.",
    ledePre: "Wir trainieren, wettkämpfen und lernen gemeinsam. ",
    ledeStrong: "Vom ersten Klimmzug bis zur Masters-Stage",
    ledePost: " — jede:r ist willkommen.",
    cta: "Jetzt mitmachen",
    ctaGhost: "Trainingsplan ansehen",
    metaLabels: [
      "Mitglieder",
      "Einheiten / Woche",
      "Heimspot",
      "Monatsbeitrag",
    ],
  },
  en: {
    eyebrow: "Calisthenics Club Mainz",
    h1a: "Calisthenics.",
    h1b: "Mainz.",
    ledePre: "We train, compete and learn together. ",
    ledeStrong: "From the first pull-up to the masters stage",
    ledePost: " — everyone is welcome.",
    cta: "Join now",
    ctaGhost: "View schedule",
    metaLabels: ["Members", "Sessions / week", "Home spot", "Monthly fee"],
  },
};

export default function Hero({ lang, settings }: Props) {
  const c = copy[lang];
  const ref = useRef<HTMLElement>(null);

  const metaValues = [
    settings?.hero_members ?? "120+",
    settings?.hero_sessions ?? "2 + Open",
    settings?.hero_spot ?? "JGU Campus",
    settings?.hero_fee ?? "€ 0 / Monat",
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && el.classList.add("visible"),
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="hero"
      className="fade-in"
      style={{
        padding: "100px 0 120px",
        position: "relative",
        overflow: "hidden",
        borderTop: "none",
      }}
    >
      {/* Background lettering */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -40,
          bottom: -30,
          fontFamily: "var(--font-display)",
          fontSize: "min(26vw, 340px)",
          color: "var(--bg-2)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          pointerEvents: "none",
          zIndex: 0,
          textTransform: "uppercase",
          userSelect: "none",
        }}
      >
        CLSTHX
      </div>

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 0.7fr",
            gap: "clamp(24px, 4vw, 48px)",
            alignItems: "end",
          }}
          className="hero-grid"
        >
          {/* Left */}
          <div>
            {/* Eyebrow */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div style={{ width: 28, height: 1, background: "var(--fg)" }} />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-mute)",
                }}
              >
                {c.eyebrow}
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 9.5vw, 148px)",
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: "0 0 28px",
              }}
            >
              <span style={{ display: "block", color: "var(--fg)" }}>
                {c.h1a}
              </span>
              <span
                style={{
                  display: "block",
                  color: "transparent",
                  WebkitTextStroke: "1.5px var(--fg)",
                }}
              >
                {c.h1b}
              </span>
            </h1>

            {/* Lede */}
            <p
              style={{
                maxWidth: 460,
                color: "var(--fg-dim)",
                fontSize: 18,
                lineHeight: 1.55,
                margin: "0 0 36px",
                fontFamily: "var(--font-sans)",
                fontWeight: 400,
              }}
            >
              {c.ledePre}
              <strong>{c.ledeStrong}</strong>
              {c.ledePost}
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a
                href={lang === "de" ? "#mitmachen" : "#join"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--fg)",
                  color: "var(--accent-ink)",
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: "0.02em",
                  padding: "14px 22px",
                  borderRadius: 999,
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "#E8FF66")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "var(--fg)")
                }
              >
                {c.cta}
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
              <a
                href="#training"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  border: "1px solid var(--line)",
                  color: "var(--fg)",
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: "0.02em",
                  padding: "14px 22px",
                  borderRadius: 999,
                  textDecoration: "none",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--fg)";
                  el.style.background = "var(--bg-2)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--line)";
                  el.style.background = "transparent";
                }}
              >
                {c.ctaGhost}
              </a>
            </div>
          </div>

          {/* Right — Meta stats */}
          <div
            style={{
              paddingLeft: 32,
              borderLeft: "1px solid var(--line-soft)",
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
            className="hero-meta"
          >
            {metaValues.map((val, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 20,
                  color: "var(--fg-dim)",
                }}
              >
                <span style={{ fontSize: 14 }}>{c.metaLabels[i]}</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--fg)",
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1536px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-meta {
            padding-left: 0 !important;
            border-left: none !important;
            border-top: 1px solid var(--line-soft);
            padding-top: 24px !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12px 32px !important;
          }
        }
        @media (max-width: 480px) {
          .hero-meta {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
