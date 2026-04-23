'use client'

import { useState, useMemo } from 'react'
import type { Lang, Event } from '@/lib/types'
import { t, isFuture } from '@/lib/utils'

type Props = { lang: Lang; events: Event[] }

const CAT_COLORS: Record<string, string> = {
  comp: '#E6C6FF',
  jam: '#D8FF3D',
  workshop: '#8EC5FF',
  social: '#FFB48E',
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
  de: { label: '02', title: 'Events', upcoming: 'Upcoming', archive: 'Archiv', clock: 'Uhr', soon: 'Bald', days: (n: number) => `in ${n} Tagen`, past: 'Vorbei', empty: 'Keine Events.' },
  en: { label: '02', title: 'Events', upcoming: 'Upcoming', archive: 'Archive', clock: '', soon: 'Soon', days: (n: number) => `in ${n} days`, past: 'Past', empty: 'No events.' },
}

export default function EventsSection({ lang, events }: Props) {
  const c = copy[lang]
  const [tab, setTab] = useState<'upcoming' | 'archive'>('upcoming')

  const { upcoming, past } = useMemo(() => {
    const sorted = [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    return { upcoming: sorted.filter((e) => isFuture(e.starts_at)), past: sorted.filter((e) => !isFuture(e.starts_at)).reverse() }
  }, [events])

  const displayed = tab === 'upcoming' ? upcoming : past

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
                color: tab === tab_ ? 'var(--fg)' : 'var(--fg-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '14px 18px',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                cursor: 'pointer',
                borderBottom: tab === tab_ ? '1px solid var(--fg)' : '1px solid transparent',
                marginBottom: -1,
                transition: 'color 0.2s',
              }}
            >
              {tab_ === 'upcoming' ? c.upcoming : c.archive}
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: tab === tab_ ? 'var(--fg)' : 'var(--bg-2)',
                  color: tab === tab_ ? 'var(--accent-ink)' : 'var(--fg-dim)',
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
            displayed.map((ev) => {
              const isPast = !isFuture(ev.starts_at)
              const d = new Date(ev.starts_at)
              const days = daysUntil(ev.starts_at)
              const catColor = CAT_COLORS[ev.category] ?? 'var(--fg-dim)'
              const catLabel = CAT_LABELS[ev.category]?.[lang] ?? ev.category

              return (
                <div
                  key={ev.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr auto',
                    gap: 32,
                    padding: '26px 4px',
                    borderBottom: '1px solid var(--line-soft)',
                    alignItems: 'start',
                    transition: 'background 0.2s',
                    cursor: 'default',
                  }}
                  className="event-row"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-2)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  {/* Date block */}
                  <div style={{ fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 44,
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                        color: isPast ? 'var(--fg-mute)' : 'var(--fg)',
                      }}
                    >
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
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 22,
                        lineHeight: 1.2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.005em',
                        color: 'var(--fg)',
                        margin: 0,
                      }}
                    >
                      {t(ev.title, lang)}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 14.5, lineHeight: 1.55, maxWidth: '62ch' }}>
                      {t(ev.description, lang)}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--fg-dim)', letterSpacing: '0.04em' }}>
                      <span>
                        <span style={{ color: 'var(--fg-mute)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 6 }}>{lang === 'de' ? 'Ort' : 'Place'}</span>
                        {t(ev.place, lang)}
                      </span>
                      <span>
                        <span style={{ color: 'var(--fg-mute)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 6 }}>{lang === 'de' ? 'Zeit' : 'Time'}</span>
                        {d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} {c.clock}
                      </span>
                    </div>
                  </div>

                  {/* Countdown */}
                  <div>
                    {isPast ? (
                      <span style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {c.past}
                      </span>
                    ) : days <= 14 ? (
                      <span style={{ padding: '6px 12px', background: 'var(--accent-spark)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-ink)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                        {days <= 3 ? c.soon : c.days(days)}
                      </span>
                    ) : (
                      <span style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--bg-2)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {c.days(days)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .event-row {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            padding: 22px 4px !important;
          }
        }
      `}</style>
    </section>
  )
}

function SectionHead({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 40,
        marginBottom: 64,
        paddingBottom: 20,
        borderBottom: '1px solid var(--line-soft)',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-mute)', letterSpacing: '0.08em', marginBottom: 8 }}>
          {label}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5.5vw, 72px)', lineHeight: 0.95, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--fg)' }}>
          {title}
        </h2>
      </div>
      {sub && <p style={{ color: 'var(--fg-dim)', maxWidth: 460, fontSize: 16, lineHeight: 1.55, margin: 0 }}>{sub}</p>}
    </div>
  )
}
