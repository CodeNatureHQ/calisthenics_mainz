import type React from 'react'

// ── Page structure ──────────────────────────────────────────────────────────

export const pageHead: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
  gap: 24, flexWrap: 'wrap', marginBottom: 32, paddingBottom: 24,
  borderBottom: '1px solid var(--line-soft)',
}

export const crumbStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  color: 'var(--fg-mute)', marginBottom: 8,
}

export const h1Style: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 32,
  textTransform: 'uppercase', letterSpacing: '-0.01em',
  margin: 0, color: 'var(--fg)',
}

export const sectionHead: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: 12,
}

export const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  color: 'var(--fg-mute)', margin: 0, fontWeight: 600,
}

// ── Cards ────────────────────────────────────────────────────────────────────

export const card: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
  borderRadius: 14, overflow: 'hidden',
}

export const cardHead: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 20px', borderBottom: '1px solid var(--line-soft)',
}

export const cardTitle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  color: 'var(--fg)', margin: 0, fontWeight: 600,
}

export const cardMeta: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10,
  color: 'var(--fg-mute)', letterSpacing: '0.06em',
}

export const formCard: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
  borderRadius: 14, padding: 20, marginBottom: 16,
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
  color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)',
  fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em',
}

export const metaItem: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10.5,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--fg-mute)',
}

export const chipStyle: React.CSSProperties = {
  padding: '2px 8px', borderRadius: 999,
  background: 'var(--bg)', border: '1px solid',
  fontFamily: 'var(--font-mono)', fontSize: 10,
  letterSpacing: '0.06em', textTransform: 'uppercase',
}

// ── Forms ────────────────────────────────────────────────────────────────────

export const inp: React.CSSProperties = {
  width: '100%', background: 'var(--bg)',
  border: '1px solid var(--line)', borderRadius: 8,
  padding: '10px 12px', fontSize: 14,
  color: 'var(--fg)', outline: 'none',
  fontFamily: 'inherit', transition: 'border-color 0.15s',
}

export const fieldLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10,
  textTransform: 'uppercase', letterSpacing: '0.12em',
  color: 'var(--fg-mute)', display: 'block',
  marginBottom: 6,
}

export const errorBox: React.CSSProperties = {
  color: 'var(--danger)', fontSize: 12,
  fontFamily: 'var(--font-mono)', marginBottom: 16,
  background: 'rgba(255,122,122,0.06)',
  padding: '10px 14px', borderRadius: 8,
  border: '1px solid rgba(255,122,122,0.2)',
}

export const successBox: React.CSSProperties = {
  color: 'var(--ok)', fontSize: 12,
  fontFamily: 'var(--font-mono)', marginBottom: 24,
  background: 'rgba(142,232,142,0.06)',
  padding: '10px 14px', borderRadius: 8,
  border: '1px solid rgba(142,232,142,0.2)',
}

// ── Buttons ──────────────────────────────────────────────────────────────────

export const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '10px 18px', borderRadius: 8,
  fontFamily: 'var(--font-mono)', fontSize: 11,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  background: 'var(--fg)', color: 'var(--accent-ink)',
  border: '1px solid var(--fg)', cursor: 'pointer',
  transition: 'background 0.15s',
  whiteSpace: 'nowrap' as const,
}

export const btnGhost: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 6,
  fontFamily: 'var(--font-mono)', fontSize: 10,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  background: 'transparent', color: 'var(--fg-dim)',
  border: '1px solid var(--line)', cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  whiteSpace: 'nowrap' as const,
}

export const btnDanger: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 6,
  fontFamily: 'var(--font-mono)', fontSize: 10,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  background: 'transparent', color: 'var(--danger)',
  border: '1px solid rgba(255,122,122,0.3)', cursor: 'pointer',
  transition: 'border-color 0.15s',
  whiteSpace: 'nowrap' as const,
}
