"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/types";

type Phase = "modal" | "banner" | "hidden";

export default function AnnouncementBanner({
  titleDe,
  titleEn,
  bodyDe,
  bodyEn,
  imageUrl,
  lang,
}: {
  titleDe: string;
  titleEn: string;
  bodyDe: string;
  bodyEn: string;
  imageUrl: string | null;
  lang: Lang;
}) {
  const title = lang === "de" ? titleDe : titleEn;
  const body = lang === "de" ? bodyDe : bodyEn;

  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    if (sessionStorage.getItem("ann_dismissed")) {
      setPhase("hidden");
    } else if (sessionStorage.getItem("ann_modal_seen")) {
      setPhase("banner");
      document.documentElement.style.setProperty("--banner-h", "40px");
    } else {
      setPhase("modal");
      document.documentElement.style.setProperty("--banner-h", "40px");
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "modal") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase]);

  function closeModal() {
    sessionStorage.setItem("ann_modal_seen", "1");
    setPhase("banner");
  }

  function closeBanner() {
    sessionStorage.setItem("ann_dismissed", "1");
    setPhase("hidden");
    document.documentElement.style.setProperty("--banner-h", "0px");
  }

  if (phase === "hidden") return null;

  return (
    <>
      {/* Persistent banner above navbar */}
      <div
        role="banner"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          background: "#7A5F00",
          borderBottom: "1px solid #5C4700",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setPhase("modal")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flex: 1,
              overflow: "hidden",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
            }}
          >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFD966"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              color: "#FFF8E1",
              letterSpacing: "0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>
          </button>
          <button
            onClick={closeBanner}
            aria-label={lang === "de" ? "Meldung schließen" : "Close notice"}
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              color: "rgba(255,248,225,0.6)",
              cursor: "pointer",
              padding: "4px 6px",
              lineHeight: 1,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#FFF8E1")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "rgba(255,248,225,0.6)")
            }
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal dialog on first visit */}
      {phase === "modal" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ann-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,0.65)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              maxWidth: imageUrl ? 560 : 480,
              width: "100%",
              boxShadow: "var(--shadow-3)",
            }}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                }}
              />
            )}
            <div style={{ padding: "28px 28px 24px" }}>
            {/* Header */}
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius)",
                  background: "rgba(255,122,122,0.12)",
                  border: "1px solid rgba(255,122,122,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--danger)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--danger)",
                    marginBottom: 4,
                  }}
                >
                  {lang === "de" ? "Wichtige Meldung" : "Important notice"}
                </div>
                <h2
                  id="ann-title"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "var(--fg)",
                    lineHeight: 1.25,
                  }}
                >
                  {title}
                </h2>
              </div>
            </div>

            {/* Body */}
            {body && (
              <p
                style={{
                  margin: "0 0 24px",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "var(--fg-dim)",
                }}
              >
                {body}
              </p>
            )}

            {/* Close button */}
            <button
              onClick={closeModal}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                background: "var(--fg)",
                color: "var(--accent-ink)",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "0.02em",
                padding: "12px 20px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#E8FF66")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--fg)")
              }
            >
              {lang === "de" ? "Verstanden" : "Got it"}
            </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
