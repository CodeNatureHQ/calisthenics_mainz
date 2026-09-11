import type React from 'react'

/**
 * Der gemeinsame Stil aller Admin-Seiten — in der Formensprache der öffentlichen Seite:
 * Eyebrow mit Akzentstrich, fette Display-Titel, Akzent-Buttons mit klarer Kante,
 * Grotesk für Beschriftungen. Mono bleibt dem vorbehalten, was wirklich Daten sind
 * (Zeitstempel, Zähler, Metazeilen). Alles hängt an den Farbvariablen und funktioniert
 * damit unverändert im Light Mode (`.admin-light` in globals.css).
 */

// ── Page structure ──────────────────────────────────────────────────────────

export const pageHead: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
  gap: 24, flexWrap: 'wrap', marginBottom: 32, paddingBottom: 24,
  borderBottom: '1px solid var(--line-soft)',
}

/** Eyebrow wie auf der Seite — der Akzentstrich davor kommt als Hintergrundverlauf. */
export const crumbStyle: React.CSSProperties = {
  display: 'inline-block', font: '700 12px/1.4 var(--font-sans)',
  textTransform: 'uppercase', letterSpacing: '0.14em',
  color: 'var(--accent)', marginBottom: 10,
  paddingLeft: 32,
  background: 'linear-gradient(currentColor, currentColor) no-repeat left center / 22px 3px',
}

export const h1Style: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34,
  textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.95,
  margin: 0, color: 'var(--fg)',
}

export const sectionHead: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: 12,
}

export const sectionTitle: React.CSSProperties = {
  font: '700 12px/1.4 var(--font-sans)',
  textTransform: 'uppercase', letterSpacing: '0.12em',
  color: 'var(--fg-mute)', margin: 0,
}

// ── Cards ────────────────────────────────────────────────────────────────────

export const card: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
}

export const cardHead: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 20px', borderBottom: '1px solid var(--line-soft)',
}

export const cardTitle: React.CSSProperties = {
  font: '700 12px/1.4 var(--font-sans)',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  color: 'var(--fg)', margin: 0,
}

export const cardMeta: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10,
  color: 'var(--fg-mute)', letterSpacing: '0.06em',
}

export const formCard: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
  borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16,
}

// ── Lists ────────────────────────────────────────────────────────────────────

export const listRow: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr auto',
  gap: 16, padding: '16px 20px',
  borderBottom: '1px solid var(--line-soft)',
  alignItems: 'center',
}

export const empty: React.CSSProperties = {
  padding: '60px 24px', textAlign: 'center',
  color: 'var(--fg-mute)', font: '600 13px/1.4 var(--font-sans)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
}

export const metaItem: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10.5,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--fg-mute)',
}

export const chipStyle: React.CSSProperties = {
  padding: '3px 9px', borderRadius: 'var(--radius-sm)',
  background: 'var(--bg)', border: '1.5px solid',
  font: '700 10.5px/1.4 var(--font-sans)',
  letterSpacing: '0.08em', textTransform: 'uppercase',
}

// ── Forms ────────────────────────────────────────────────────────────────────

export const inp: React.CSSProperties = {
  width: '100%', minHeight: 44, background: 'var(--bg)',
  border: '1.5px solid var(--line)', borderRadius: 'var(--radius)',
  padding: '11px 14px', fontSize: 15, lineHeight: 1.4,
  color: 'var(--fg)', outline: 'none',
  fontFamily: 'var(--font-sans)', transition: 'border-color 0.15s, box-shadow 0.15s',
}

export const fieldLabel: React.CSSProperties = {
  font: '600 13px/1.4 var(--font-sans)',
  color: 'var(--fg)', display: 'block',
  marginBottom: 6,
}

export const fieldHint: React.CSSProperties = {
  font: '400 12.5px/1.5 var(--font-sans)',
  color: 'var(--fg-mute)', marginTop: 6,
}

// ── Form structure ───────────────────────────────────────────────────────────
// Forms are read in sections: a short title says what the group is for, the
// fields below stay in one or two calm columns. Actions sit in a fixed footer.

export const formShell: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
  borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 20,
}

export const formHead: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
  padding: '18px 24px', borderBottom: '1px solid var(--line-soft)',
}

export const formTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24,
  textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1, margin: 0, color: 'var(--fg)',
}

export const formSection: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'minmax(160px, 220px) 1fr', gap: 24,
  padding: '22px 24px', borderBottom: '1px solid var(--line-soft)',
}

export const formSectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
  textTransform: 'uppercase', lineHeight: 1.1, margin: 0, color: 'var(--fg)',
}

export const formSectionDesc: React.CSSProperties = {
  font: '400 12.5px/1.5 var(--font-sans)', color: 'var(--fg-mute)', margin: '6px 0 0',
}

export const formFields: React.CSSProperties = { display: 'grid', gap: 18, minWidth: 0 }
export const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
export const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }

export const formActions: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10,
  padding: '14px 24px', background: 'var(--bg-2)',
  position: 'sticky', bottom: 0,
}

export const errorBox: React.CSSProperties = {
  color: 'var(--danger)', font: '600 12.5px/1.5 var(--font-sans)',
  marginBottom: 16,
  background: 'color-mix(in srgb, var(--danger) 8%, transparent)',
  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
  border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
}

export const successBox: React.CSSProperties = {
  color: 'var(--ok)', font: '600 12.5px/1.5 var(--font-sans)',
  marginBottom: 24,
  background: 'color-mix(in srgb, var(--ok) 8%, transparent)',
  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
  border: '1px solid color-mix(in srgb, var(--ok) 30%, transparent)',
}

// ── Buttons ──────────────────────────────────────────────────────────────────
// Dieselbe Sprache wie `.club-button` auf der Seite: Akzentfläche, klare Kante,
// Display-Schrift. Ghost und Danger sind die leisen Geschwister für Listenzeilen.

export const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 10,
  padding: '12px 18px', borderRadius: 'var(--radius)',
  font: '700 15px/1 var(--font-display)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
  background: 'var(--accent)', color: 'var(--accent-ink)',
  border: '2px solid var(--accent)', cursor: 'pointer',
  transition: 'background 0.18s, border-color 0.18s',
  whiteSpace: 'nowrap' as const,
}

export const btnGhost: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 'var(--radius)',
  font: '600 13px/1 var(--font-sans)',
  letterSpacing: '0',
  background: 'transparent', color: 'var(--fg-dim)',
  border: '1.5px solid var(--line)', cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  whiteSpace: 'nowrap' as const,
}

export const btnDanger: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 'var(--radius)',
  font: '600 13px/1 var(--font-sans)',
  letterSpacing: '0',
  background: 'transparent', color: 'var(--danger)',
  border: '1.5px solid color-mix(in srgb, var(--danger) 35%, transparent)', cursor: 'pointer',
  transition: 'border-color 0.15s',
  whiteSpace: 'nowrap' as const,
}
