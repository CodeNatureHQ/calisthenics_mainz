"use client";

import { useEffect, useState } from "react";
import type { Lang, Event } from "@/lib/types";

type Phase = "modal" | "banner" | "hidden";

const CAT_COLORS: Record<string, string> = {
  comp: '#D97757', jam: '#D8FF3D', workshop: '#8EC5FF', social: '#FFB48E',
}
const CAT_LABELS: Record<string, Record<string, string>> = {
  comp: { de: 'Wettkampf', en: 'Competition' },
  jam: { de: 'Jam', en: 'Jam' },
  workshop: { de: 'Workshop', en: 'Workshop' },
  social: { de: 'Social', en: 'Social' },
}

export default function AnnouncementBanner({
  titleDe, titleEn, bodyDe, bodyEn, imageUrl, lang, event,
}: {
  titleDe: string; titleEn: string; bodyDe: string; bodyEn: string;
  imageUrl: string | null; lang: Lang; event?: Event;
}) {
  const isEventMode = !!event;
  const title = isEventMode
    ? (lang === "de" ? event.title.de : event.title.en)
    : (lang === "de" ? titleDe : titleEn);
  const body = isEventMode
    ? (lang === "de" ? event.description.de : event.description.en)
    : (lang === "de" ? bodyDe : bodyEn);

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

  function goToEvent() {
    closeModal();
    setTimeout(() => {
      document.querySelector("#events")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  if (phase === "hidden") return null;

  const catColor = isEventMode ? (CAT_COLORS[event.category] ?? "#D8FF3D") : null;
  const catLabel = isEventMode ? (CAT_LABELS[event.category]?.[lang] ?? event.category) : null;
  const eventDate = isEventMode
    ? new Date(event.starts_at).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", {
        weekday: "long", day: "numeric", month: "long",
      })
    : null;
  const eventTime = isEventMode
    ? new Date(event.starts_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <>
      {/* Persistent banner above navbar */}
      <div
        role="banner"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 40, zIndex: 60,
          display: "flex", alignItems: "center",
          background: isEventMode ? "#1A1A1E" : "#7A5F00",
          borderBottom: isEventMode ? "1px solid var(--line)" : "1px solid #5C4700",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          <button
            onClick={() => setPhase("modal")}
            style={{
              display: "flex", alignItems: "center", gap: 10, flex: 1, overflow: "hidden",
              background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left",
            }}
          >
            {isEventMode ? (
              <span style={{
                flexShrink: 0, padding: "2px 8px", borderRadius: 999,
                background: catColor ?? "transparent",
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#0B0B0D", fontWeight: 600,
              }}>
                {catLabel}
              </span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD966" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
              color: isEventMode ? "var(--fg)" : "#FFF8E1",
              letterSpacing: "0.02em", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {title}
            </span>
          </button>
          <button
            onClick={closeBanner}
            aria-label={lang === "de" ? "Meldung schließen" : "Close notice"}
            style={{
              flexShrink: 0, background: "none", border: "none",
              color: isEventMode ? "var(--fg-mute)" : "rgba(255,248,225,0.6)",
              cursor: "pointer", padding: "4px 6px", lineHeight: 1, transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = isEventMode ? "var(--fg)" : "#FFF8E1")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = isEventMode ? "var(--fg-mute)" : "rgba(255,248,225,0.6)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
            position: "fixed", inset: 0, zIndex: 70,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px", background: "rgba(0,0,0,0.65)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{
            background: "var(--bg-2)", border: "1px solid var(--line)",
            borderRadius: "var(--radius-xl)", overflow: "hidden",
            maxWidth: isEventMode ? 520 : (imageUrl ? 560 : 480),
            width: "100%", boxShadow: "var(--shadow-3)",
          }}>
            {/* Event mode: image or colored stripe */}
            {isEventMode && event.image_url ? (
              <img src={event.image_url} alt="" style={{ display: "block", width: "100%", height: 360, objectFit: "cover", objectPosition: "center" }} />
            ) : isEventMode ? (
              <div style={{ height: 4, background: catColor ?? "var(--accent-spark)" }} />
            ) : null}

            {/* Non-event mode: optional image */}
            {!isEventMode && imageUrl && (
              <img src={imageUrl} alt="" style={{ display: "block", width: "100%", height: "auto" }} />
            )}

            <div style={{ padding: "28px 28px 24px" }}>
              {isEventMode ? (
                /* Event mode content */
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 999,
                      border: `1px solid ${catColor}`,
                      fontFamily: "var(--font-mono)", fontSize: 10,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "var(--fg)",
                    }}>
                      {catLabel}
                    </span>
                    {eventDate && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-mute)", letterSpacing: "0.04em" }}>
                        {eventDate} · {eventTime} Uhr
                      </span>
                    )}
                  </div>
                  <h2 id="ann-title" style={{
                    margin: "0 0 6px", fontFamily: "var(--font-display)",
                    fontWeight: 700, fontSize: 24, color: "var(--fg)",
                    lineHeight: 1.15, textTransform: "uppercase", letterSpacing: "-0.01em",
                  }}>
                    {title}
                  </h2>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-mute)",
                    letterSpacing: "0.04em", marginBottom: 16,
                  }}>
                    {lang === "de" ? event.place.de : event.place.en}
                  </div>
                  {body && (
                    <div
                      className="prose-cm"
                      dangerouslySetInnerHTML={{ __html: body }}
                      style={{ fontSize: 14, lineHeight: 1.65, color: "var(--fg-dim)", marginBottom: 24 }}
                    />
                  )}
                  <button
                    onClick={goToEvent}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", background: "#D97757", color: "#FFF8F0",
                      fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      padding: "12px 20px", borderRadius: 999, border: "none",
                      cursor: "pointer", transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                  >
                    {lang === "de" ? "Zum Event" : "See the event"}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              ) : (
                /* Normal announcement content */
                <>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                    <div style={{
                      flexShrink: 0, width: 40, height: 40, borderRadius: "var(--radius)",
                      background: "rgba(255,122,122,0.12)", border: "1px solid rgba(255,122,122,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        color: "var(--danger)", marginBottom: 4,
                      }}>
                        {lang === "de" ? "Wichtige Meldung" : "Important notice"}
                      </div>
                      <h2 id="ann-title" style={{
                        margin: 0, fontFamily: "var(--font-sans)", fontWeight: 700,
                        fontSize: 20, color: "var(--fg)", lineHeight: 1.25,
                      }}>
                        {title}
                      </h2>
                    </div>
                  </div>
                  {body && (
                    <p style={{ margin: "0 0 24px", fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.65, color: "var(--fg-dim)" }}>
                      {body}
                    </p>
                  )}
                  <button
                    onClick={closeModal}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", background: "var(--fg)", color: "var(--accent-ink)",
                      fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14,
                      letterSpacing: "0.02em", padding: "12px 20px", borderRadius: 999,
                      border: "none", cursor: "pointer", transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#E8FF66")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--fg)")}
                  >
                    {lang === "de" ? "Verstanden" : "Got it"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
