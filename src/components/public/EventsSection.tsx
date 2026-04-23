'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { Lang, Event } from '@/lib/types'
import { t, isFuture } from '@/lib/utils'

type Props = { lang: Lang; events: Event[] }

const CAT_COLORS: Record<string, string> = {
  comp:     '#E6C6FF',
  jam:      '#D8FF3D',
  workshop: '#8EC5FF',
  social:   '#FFB48E',
}

const CAT_LABELS: Record<string, Record<string, string>> = {
  comp:     { de: 'Wettkampf', en: 'Competition' },
  jam:      { de: 'Jam',       en: 'Jam' },
  workshop: { de: 'Workshop',  en: 'Workshop' },
  social:   { de: 'Social',    en: 'Social' },
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

const copy = {
  de: {
    label: '02', title: 'Events', upcoming: 'Upcoming', archive: 'Archiv',
    clock: 'Uhr', soon: 'Bald', days: (n: number) => `in ${n} Tagen`,
    past: 'Vorbei', empty: 'Keine Events.',
    dateLabel: 'Datum', timeLabel: 'Uhrzeit', placeLabel: 'Ort', close: 'Schließen',
  },
  en: {
    label: '02', title: 'Events', upcoming: 'Upcoming', archive: 'Archive',
    clock: '', soon: 'Soon', days: (n: number) => `in ${n} days`,
    past: 'Past', empty: 'No events.',
    dateLabel: 'Date', timeLabel: 'Time', placeLabel: 'Location', close: 'Close',
  },
}

export default function EventsSection({ lang, events }: Props) {
  const c = copy[lang]
  const [tab, setTab] = useState<'upcoming' | 'archive'>('upcoming')
  const [activeEvent, setActiveEvent] = useState<Event | null>(null)

  const { upcoming, past } = useMemo(() => {
    const sorted = [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    return {
      upcoming: sorted.filter((e) => isFuture(e.starts_at)),
      past: sorted.filter((e) => !isFuture(e.starts_at)).reverse(),
    }
  }, [events])

  const displayed = tab === 'upcoming' ? upcoming : past

  const closeDialog = useCallback(() => setActiveEvent(null), [])

  // Close on Escape + blur page content
  useEffect(() => {
    const main = document.querySelector('main') as HTMLElement | null
    const header = document.querySelector('header') as HTMLElement | null

    if (activeEvent) {
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDialog() }
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
      if (main)   { main.style.transition = 'filter 0.3s'; main.style.filter = 'blur(6px)' }
      if (header) { header.style.transition = 'filter 0.3s'; header.style.filter = 'blur(6px)' }
      return () => {
        window.removeEventListener('keydown', onKey)
        document.body.style.overflow = ''
        if (main)   main.style.filter = ''
        if (header) header.style.filter = ''
      }
    }
  }, [activeEvent, closeDialog])

  return (
    <section id="events" className="section">
      <div className="container">
        <SectionHead label={c.label} title={c.title} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--line-soft)' }}>
          {(['upcoming', 'archive'] as const).map((tab_) => (
            <button
              key={tab_}
              onClick={() => setTab(tab_)}
              style={{
                background: 'transparent',
                border: 0,
                color: tab === tab_ ? 'var(--accent-2)' : 'var(--fg-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '14px 18px',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                cursor: 'pointer',
                borderBottom: tab === tab_ ? '2px solid var(--accent-2)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              {tab_ === 'upcoming' ? c.upcoming : c.archive}
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: tab === tab_ ? 'var(--accent-2)' : 'var(--bg-2)',
                  color: tab === tab_ ? '#fff' : 'var(--fg-dim)',
                  border: tab === tab_ ? 'none' : '1px solid var(--line-soft)',
                  minWidth: 22,
                  textAlign: 'center',
                }}
              >
                {tab_ === 'upcoming' ? upcoming.length : past.length}
              </span>
            </button>
          ))}
        </div>

        {/* Events list */}
        <div style={{ borderTop: '1px solid var(--line-soft)' }}>
          {displayed.length === 0 ? (
            <p style={{ color: 'var(--fg-mute)', fontSize: 15, padding: '24px 0' }}>{c.empty}</p>
          ) : (
            displayed.map((ev) => (
              <EventRow
                key={ev.id}
                ev={ev}
                lang={lang}
                c={c}
                onClick={() => setActiveEvent(ev)}
              />
            ))
          )}
        </div>
      </div>

      {/* Dialog */}
      {activeEvent && (
        <EventDialog event={activeEvent} lang={lang} c={c} onClose={closeDialog} />
      )}

      <style>{`
        @media (max-width: 720px) {
          .event-row { grid-template-columns: 1fr !important; gap: 10px !important; padding: 18px 4px !important; }
          .event-countdown { align-items: flex-start !important; flex-direction: row !important; flex-wrap: wrap !important; }
          .event-date-num { font-size: 28px !important; }
        }
        @media (max-width: 480px) {
          .event-dialog-inner { padding: 20px 20px 24px !important; }
          .event-dialog-dl { grid-template-columns: 1fr !important; gap: 8px !important; }
          .event-dialog-dt { padding-bottom: 0 !important; }
        }
      `}</style>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Event row                                                            */
/* ------------------------------------------------------------------ */
function EventRow({
  ev, lang, c, onClick,
}: {
  ev: Event
  lang: Lang
  c: (typeof copy)['de']
  onClick: () => void
}) {
  const isPast = !isFuture(ev.starts_at)
  const d = new Date(ev.starts_at)
  const days = daysUntil(ev.starts_at)
  const catColor = CAT_COLORS[ev.category] ?? 'var(--fg-dim)'
  const catLabel = CAT_LABELS[ev.category]?.[lang] ?? ev.category

  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr auto',
        gap: 32,
        padding: '26px 4px',
        borderBottom: '1px solid var(--line-soft)',
        alignItems: 'start',
        transition: 'background 0.2s',
        cursor: 'pointer',
      }}
      className="event-row"
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-2)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
    >
      {/* Date block */}
      <div style={{ fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="event-date-num" style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', color: isPast ? 'var(--fg-mute)' : 'var(--fg)' }}>
          {d.getDate()}
        </div>
        <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-dim)', marginTop: 6 }}>
          {d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { month: 'short' })}
        </div>
        <div style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.08em' }}>
          {d.getFullYear()}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColor, display: 'inline-block', flexShrink: 0 }} />
          {catLabel}
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.005em', color: 'var(--fg)', margin: 0 }}>
          {t(ev.title, lang)}
        </h3>
        <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 14.5, lineHeight: 1.55, maxWidth: '62ch' }}>
          {t(ev.description, lang)}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--fg-dim)', letterSpacing: '0.04em' }}>
          <span>
            <span style={{ color: 'var(--fg-mute)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 6 }}>{c.placeLabel}</span>
            {t(ev.place, lang)}
          </span>
        </div>
      </div>

      {/* Countdown + arrow */}
      <div className="event-countdown" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
        {isPast ? (
          <span style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            {c.past}
          </span>
        ) : days <= 14 ? (
          <span style={{ padding: '6px 12px', background: 'var(--accent-spark)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-ink)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {days <= 3 ? c.soon : c.days(days)}
          </span>
        ) : (
          <span style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--bg-2)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            {c.days(days)}
          </span>
        )}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Event Dialog                                                         */
/* ------------------------------------------------------------------ */
function EventDialog({
  event, lang, c, onClose,
}: {
  event: Event
  lang: Lang
  c: (typeof copy)['de']
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  const isPast = !isFuture(event.starts_at)
  const d = new Date(event.starts_at)
  const days = daysUntil(event.starts_at)
  const catColor = CAT_COLORS[event.category] ?? 'var(--fg-dim)'
  const catLabel = CAT_LABELS[event.category]?.[lang] ?? event.category

  const dateStr = d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const timeStr = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(26,26,30,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '40px 20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--line)',
          borderRadius: 20,
          maxWidth: 640,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Colored top stripe */}
        <div style={{ height: 4, background: catColor, width: '100%' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label={c.close}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid var(--line)',
            background: 'transparent',
            color: 'var(--fg-dim)',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--fg)'
            el.style.color = 'var(--fg)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--line)'
            el.style.color = 'var(--fg-dim)'
          }}
        >
          ×
        </button>

        {/* Content */}
        <div className="event-dialog-inner" style={{ padding: '32px 40px 40px' }}>
          {/* Category */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColor, display: 'inline-block' }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--fg)',
              padding: '3px 10px', border: '1px solid var(--line)', borderRadius: 999,
            }}>
              {catLabel}
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 40px)',
            lineHeight: 1.05,
            textTransform: 'uppercase',
            letterSpacing: '-0.005em',
            color: 'var(--fg)',
            margin: '0 0 8px',
            paddingRight: 48,
          }}>
            {t(event.title, lang)}
          </h2>

          {/* Countdown / past */}
          <div style={{ marginBottom: 28 }}>
            {isPast ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {c.past}
              </span>
            ) : days <= 3 ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--accent-spark)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {c.soon}
              </span>
            ) : (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {c.days(days)}
              </span>
            )}
          </div>

          {/* Info grid */}
          <dl className="event-dialog-dl" style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '12px 16px',
            marginBottom: 28,
            borderTop: '1px solid var(--line-soft)',
            paddingTop: 24,
          }}>
            <dt style={dtStyle}>{c.dateLabel}</dt>
            <dd style={ddStyle} className="dialog-date">{dateStr}</dd>

            <dt style={dtStyle}>{c.timeLabel}</dt>
            <dd style={ddStyle}>
              {timeStr} {c.clock}
            </dd>

            <dt style={dtStyle}>{c.placeLabel}</dt>
            <dd style={ddStyle}><strong style={{ color: 'var(--fg)', fontWeight: 500 }}>{t(event.place, lang)}</strong></dd>
          </dl>

          {/* Description */}
          <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 16, lineHeight: 1.7 }}>
            {t(event.description, lang)}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .dialog-date { font-size: 13px !important; }
        }
      `}</style>
    </div>,
    document.body
  )
}

/* ------------------------------------------------------------------ */
/* Shared                                                               */
/* ------------------------------------------------------------------ */
const dtStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  color: 'var(--fg-mute)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  paddingTop: 3,
  margin: 0,
}

const ddStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--fg-dim)',
  lineHeight: 1.5,
  fontSize: 15,
}

function SectionHead({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 64, paddingBottom: 20, borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 20, height: 3, background: 'var(--accent-2)', borderRadius: 2, flexShrink: 0 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-2)', letterSpacing: '0.08em' }}>{label}</div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5.5vw, 72px)', lineHeight: 0.95, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--fg)' }}>
          {title}
        </h2>
      </div>
      {sub && <p style={{ color: 'var(--fg-dim)', maxWidth: 460, fontSize: 16, lineHeight: 1.55, margin: 0 }}>{sub}</p>}
    </div>
  )
}
