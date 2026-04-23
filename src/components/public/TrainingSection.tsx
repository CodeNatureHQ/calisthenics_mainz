'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { Lang, TrainingSession, CalendarOverride, Spot, Event } from '@/lib/types'
import { t, levelLabel, dayLabel, fullDayLabel } from '@/lib/utils'

type SessionEntry = {
  type: 'fixed' | 'extra'
  session?: TrainingSession
  override?: CalendarOverride
}

type Props = {
  lang: Lang
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
  spots: Spot[]
  events: Event[]
}

const DAYS = [0, 1, 2, 3, 4, 5, 6]

const copy = {
  de: {
    label: '01',
    title: 'Training',
    weekTab: 'Wochenplan',
    calTab: 'Monatskalender',
    noTraining: 'Kein Training',
    cancelled: 'Fällt aus',
    extra: 'Extra',
    today: 'Heute',
    prevMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat',
  },
  en: {
    label: '01',
    title: 'Schedule',
    weekTab: 'Weekly plan',
    calTab: 'Monthly calendar',
    noTraining: 'No training',
    cancelled: 'Cancelled',
    extra: 'Extra',
    today: 'Today',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
  },
}

const levelColors: Record<string, string> = {
  beginner: '#22c55e',
  advanced: '#d4ff3f',
  open: '#38bdf8',
  comp: '#ef4444',
  training: '#a78bfa',
}

export default function TrainingSection({ lang, sessions, overrides, spots, events }: Props) {
  const c = copy[lang]
  const [tab, setTab] = useState<'week' | 'cal'>('week')
  const [calDate, setCalDate] = useState(() => new Date())
  const [activeEntry, setActiveEntry] = useState<{ session?: TrainingSession; override?: CalendarOverride; dateStr?: string } | null>(null)

  const closeModal = useCallback(() => setActiveEntry(null), [])

  useEffect(() => {
    if (!activeEntry) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [activeEntry, closeModal])

  return (
    <section id="training" className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 64, paddingBottom: 20, borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-mute)', letterSpacing: '0.08em', marginBottom: 8 }}>{c.label}</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5.5vw, 72px)', lineHeight: 0.95, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--fg)', margin: 0 }}>{c.title}</h2>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'inline-flex',
            gap: 4,
            marginBottom: 24,
            padding: 4,
            border: '1px solid var(--line-soft)',
            borderRadius: 12,
            background: 'var(--bg-2)',
          }}
        >
          {(['week', 'cal'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? 'var(--fg)' : 'transparent',
                border: 'none',
                borderRadius: 8,
                color: tab === t ? 'var(--accent-ink)' : 'var(--fg-mute)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: tab === t ? 600 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '10px 20px',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {t === 'week' ? c.weekTab : c.calTab}
            </button>
          ))}
        </div>

        {tab === 'week' ? (
          <WeekView lang={lang} sessions={sessions} overrides={overrides} c={c} onSelect={setActiveEntry} />
        ) : (
          <CalendarView
            lang={lang}
            sessions={sessions}
            overrides={overrides}
            events={events}
            calDate={calDate}
            setCalDate={setCalDate}
            c={c}
            onSelect={setActiveEntry}
          />
        )}
      </div>

      {/* Detail Modal */}
      {activeEntry && (
        <TrainingModal entry={activeEntry} lang={lang} spots={spots} onClose={closeModal} c={c} />
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Training detail modal                                                */
/* ------------------------------------------------------------------ */
function TrainingModal({
  entry, lang, spots, onClose, c,
}: {
  entry: { session?: TrainingSession; override?: CalendarOverride; dateStr?: string }
  lang: Lang
  spots: Spot[]
  onClose: () => void
  c: (typeof copy)['de']
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const s = entry.session
  const o = entry.override
  const place = s?.place ?? o?.place
  const time = s?.time_label ?? o?.time_label
  const level = s?.level ?? o?.level
  const description = s?.description ?? o?.description
  const spotId = s?.spot_id ?? o?.spot_id
  const spot = spots.find(sp => sp.id === spotId)

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(26,26,30,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-2)', border: '1px solid var(--line)',
          borderRadius: 20, maxWidth: 480, width: '100%',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Top stripe */}
        <div style={{ height: 4, background: 'var(--accent-2)' }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid var(--line)', background: 'transparent',
            color: 'var(--fg-dim)', fontSize: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'var(--fg)'; el.style.color = 'var(--fg)' }}
          onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'var(--line)'; el.style.color = 'var(--fg-dim)' }}
        >×</button>

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Level badge */}
          {level && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginBottom: 16,
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 999,
              border: '1px solid var(--line)',
              background: level === 'open' || level === 'training' ? 'var(--accent-2)' : 'transparent',
              color: level === 'open' || level === 'training' ? '#fff' : 'var(--fg)',
            }}>
              {levelLabel(level, lang)}
            </div>
          )}

          {/* Time */}
          {time && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--fg)', marginBottom: 8 }}>
              {time}
            </div>
          )}

          {/* Date if available */}
          {entry.dateStr && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.08em', marginBottom: 20 }}>
              {new Date(entry.dateStr + 'T12:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          )}

          {/* Info grid */}
          <dl style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px 16px', borderTop: '1px solid var(--line-soft)', paddingTop: 20, marginBottom: description ? 20 : 0 }}>
            {place && (
              <>
                <dt style={dtStyle}>{lang === 'de' ? 'Ort' : 'Location'}</dt>
                <dd style={ddStyle}><strong style={{ color: 'var(--fg)', fontWeight: 500 }}>{t(place, lang)}</strong></dd>
              </>
            )}
          </dl>

          {/* Description */}
          {description && (
            <p style={{ color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.65, margin: '0 0 20px' }}>
              {t(description, lang)}
            </p>
          )}

          {/* Spot link */}
          {spot && (
            <a
              href="#spots"
              onClick={onClose}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-mono)', fontSize: 11,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--accent-spark)', textDecoration: 'none',
                paddingTop: 16, borderTop: '1px solid var(--line-soft)',
                width: '100%',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-spark)', display: 'inline-block', flexShrink: 0 }} />
              {lang === 'de' ? `Auf der Karte ansehen · ${t(spot.name, lang)}` : `View on map · ${t(spot.name, lang)}`}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

const dtStyle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingTop: 3, margin: 0 }
const ddStyle: React.CSSProperties = { margin: 0, color: 'var(--fg-dim)', lineHeight: 1.5, fontSize: 14 }

/* Returns the ISO date string (YYYY-MM-DD) for a given day-of-week
   in the current week (week starts Monday = 0) */
function currentWeekDate(dow: number): string {
  const today = new Date()
  const jsDay = today.getDay() // 0=Sun … 6=Sat
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  const target = new Date(monday)
  target.setDate(monday.getDate() + dow)
  return target.toISOString().slice(0, 10)
}

function WeekView({
  lang,
  sessions,
  overrides,
  c,
  onSelect,
}: {
  lang: Lang
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
  c: (typeof copy)['de']
  onSelect: (entry: { session?: TrainingSession; override?: CalendarOverride; dateStr?: string }) => void
}) {
  const today = new Date().toISOString().slice(0, 10)

  const byDay = useMemo(() => {
    const map: Record<number, TrainingSession[]> = {}
    for (const s of sessions) {
      if (!map[s.day_of_week]) map[s.day_of_week] = []
      map[s.day_of_week].push(s)
    }
    return map
  }, [sessions])

  const overridesByDate = useMemo(() => {
    const map: Record<string, CalendarOverride[]> = {}
    for (const o of overrides) {
      if (!map[o.on_date]) map[o.on_date] = []
      map[o.on_date].push(o)
    }
    return map
  }, [overrides])

  return (
    <>
    <style>{`
      @media (min-width: 641px) { .week-mobile { display: none !important; } }
      @media (max-width: 640px) { .week-desktop { display: none !important; } }
    `}</style>
    <div className="week-mobile">
      <MobileWeekView lang={lang} byDay={byDay} overridesByDate={overridesByDate} today={today} c={c} onSelect={onSelect} />
    </div>
    <div className="week-desktop" style={{ overflowX: 'auto', borderRadius: 18 }}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        border: '1px solid var(--line-soft)',
        borderRadius: 18,
        overflow: 'hidden',
        background: 'var(--bg-2)',
        minWidth: 560,
      }}
      className="schedule-grid"
    >
      {DAYS.map((dow) => {
        const dateStr = currentWeekDate(dow)
        const isToday = dateStr === today
        const dayOverrides = overridesByDate[dateStr] ?? []
        const hasCancelOverride = dayOverrides.some((o) => o.type === 'cancel')
        const extraSessions = dayOverrides.filter((o) => o.type === 'training')
        const fixedSessions = hasCancelOverride ? [] : (byDay[dow] ?? [])
        const hasAnything = fixedSessions.length > 0 || extraSessions.length > 0 || hasCancelOverride

        // Human-readable date for the column header
        const d = new Date(dateStr + 'T12:00:00')
        const dateNum = d.getDate()
        const monthShort = d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { month: 'short' })

        return (
          <div
            key={dow}
            style={{
              borderRight: '1px solid var(--line-soft)',
              minHeight: 340,
              display: 'flex',
              flexDirection: 'column',
              background: isToday ? 'rgba(74,127,212,0.06)' : undefined,
            }}
          >
            {/* Day head */}
            <div style={{
              padding: '16px 14px 12px',
              borderBottom: `1px solid ${isToday ? 'var(--accent-2)' : 'var(--line-soft)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isToday ? 'var(--accent-2)' : hasAnything ? 'var(--fg)' : 'var(--fg-mute)',
              }}>
                {dayLabel(dow, lang)}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: isToday ? 'var(--accent-2)' : 'var(--fg-mute)',
              }}>
                {dateNum}. {monthShort}
              </span>
            </div>

            {/* Day body */}
            <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Cancellation badge */}
              {hasCancelOverride && (
                <div style={{
                  background: 'rgba(255,122,122,0.1)',
                  border: '1px solid rgba(255,122,122,0.3)',
                  borderLeft: '3px solid var(--danger)',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {c.cancelled}
                  </div>
                  {dayOverrides.find(o => o.type === 'cancel')?.note && (
                    <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 3 }}>
                      {t(dayOverrides.find(o => o.type === 'cancel')!.note!, lang)}
                    </div>
                  )}
                </div>
              )}

              {/* Fixed sessions */}
              {fixedSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  levelLabel_={levelLabel(s.level, lang)}
                  time={s.time_label} place={t(s.place, lang)} level={s.level}
                  hasSpot={!!s.spot_id}
                  onClick={() => onSelect({ session: s, dateStr })}
                />
              ))}

              {/* Extra sessions from overrides */}
              {extraSessions.map((o) => (
                <div key={o.id} onClick={() => onSelect({ override: o, dateStr })} style={{
                  background: 'rgba(216,255,61,0.06)',
                  border: '1px solid rgba(216,255,61,0.25)',
                  borderLeft: '3px solid var(--accent-spark)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  cursor: 'pointer',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--accent-spark)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {c.extra}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg)', fontWeight: 500 }}>
                    {o.time_label}
                  </div>
                  {o.place && (
                    <div style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{t(o.place, lang)}</div>
                  )}
                  {o.note && (
                    <div style={{ fontSize: 11, color: 'var(--fg-dim)', fontStyle: 'italic' }}>{t(o.note, lang)}</div>
                  )}
                </div>
              ))}

              {!hasAnything && (
                <div style={{ fontSize: 12, color: 'var(--fg-mute)' }}>{c.noTraining}</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
    </div>
    </>
  )
}

function MobileWeekView({
  lang, byDay, overridesByDate, today, c, onSelect,
}: {
  lang: Lang
  byDay: Record<number, TrainingSession[]>
  overridesByDate: Record<string, CalendarOverride[]>
  today: string
  c: (typeof copy)['de']
  onSelect: (entry: { session?: TrainingSession; override?: CalendarOverride; dateStr?: string }) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {DAYS.map((dow) => {
        const dateStr = currentWeekDate(dow)
        const isToday = dateStr === today
        const dayOverrides = overridesByDate[dateStr] ?? []
        const hasCancelOverride = dayOverrides.some((o) => o.type === 'cancel')
        const extraSessions = dayOverrides.filter((o) => o.type === 'training')
        const fixedSessions = hasCancelOverride ? [] : (byDay[dow] ?? [])
        const hasAnything = fixedSessions.length > 0 || extraSessions.length > 0 || hasCancelOverride

        const d = new Date(dateStr + 'T12:00:00')
        const dateNum = d.getDate()
        const monthShort = d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { month: 'short' })

        return (
          <div
            key={dow}
            style={{
              border: `1px solid ${isToday ? 'var(--accent-2)' : 'var(--line-soft)'}`,
              borderRadius: 12,
              overflow: 'hidden',
              background: isToday ? 'rgba(74,127,212,0.05)' : 'var(--bg-2)',
            }}
          >
            {/* Day header row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: hasAnything ? '1px solid var(--line-soft)' : undefined,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isToday && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: 'var(--accent-2)', color: '#fff',
                    padding: '2px 7px', borderRadius: 999,
                  }}>{c.today}</span>
                )}
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 14,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: isToday ? 'var(--accent-2)' : hasAnything ? 'var(--fg)' : 'var(--fg-mute)',
                  fontWeight: hasAnything ? 600 : 400,
                }}>
                  {fullDayLabel(dow, lang)}
                </span>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: isToday ? 'var(--accent-2)' : 'var(--fg-mute)',
              }}>
                {dateNum}. {monthShort}
              </span>
            </div>

            {/* Sessions */}
            {hasAnything && (
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {hasCancelOverride && (
                  <div style={{
                    background: 'rgba(255,122,122,0.1)', border: '1px solid rgba(255,122,122,0.3)',
                    borderLeft: '3px solid var(--danger)', borderRadius: 8, padding: '8px 10px',
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {c.cancelled}
                    </div>
                    {dayOverrides.find(o => o.type === 'cancel')?.note && (
                      <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 3 }}>
                        {t(dayOverrides.find(o => o.type === 'cancel')!.note!, lang)}
                      </div>
                    )}
                  </div>
                )}
                {fixedSessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    levelLabel_={levelLabel(s.level, lang)}
                    time={s.time_label} place={t(s.place, lang)} level={s.level}
                    hasSpot={!!s.spot_id}
                    onClick={() => onSelect({ session: s, dateStr })}
                  />
                ))}
                {extraSessions.map((o) => (
                  <div key={o.id} onClick={() => onSelect({ override: o, dateStr })} style={{
                    background: 'rgba(216,255,61,0.06)', border: '1px solid rgba(216,255,61,0.25)',
                    borderLeft: '3px solid var(--accent-spark)', borderRadius: 8,
                    padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer',
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--accent-spark)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.extra}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg)', fontWeight: 500 }}>{o.time_label}</div>
                    {o.place && <div style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{t(o.place, lang)}</div>}
                    {o.note && <div style={{ fontSize: 11, color: 'var(--fg-dim)', fontStyle: 'italic' }}>{t(o.note, lang)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SessionCard({ time, place, level, levelLabel_, hasSpot, onClick }: {
  time: string; place: string; level: string; levelLabel_: string
  hasSpot?: boolean; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--line-soft)',
        borderRadius: 12,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--fg)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--line-soft)'
        el.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg)', fontWeight: 500, letterSpacing: '0.02em' }}>
        {time}
      </div>
      <div style={{ fontSize: 12, color: 'var(--fg-dim)', lineHeight: 1.35 }}>
        {place}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: 999, border: '1px solid var(--line)',
          background: level === 'open' || level === 'training' ? 'var(--accent-2)' : 'transparent',
          color: level === 'open' || level === 'training' ? '#fff' : level === 'comp' ? 'var(--accent-spark)' : 'var(--fg)',
        }}>
          {levelLabel_}
        </div>
        {hasSpot && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-spark)" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        )}
      </div>
    </div>
  )
}

const CAT_COLORS_EVENT: Record<string, string> = {
  comp: '#E6C6FF', jam: '#D8FF3D', workshop: '#8EC5FF', social: '#FFB48E',
}

function CalendarView({
  lang,
  sessions,
  overrides,
  events,
  calDate,
  setCalDate,
  c,
  onSelect,
}: {
  lang: Lang
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
  events: Event[]
  calDate: Date
  setCalDate: (d: Date) => void
  c: (typeof copy)['de']
  onSelect: (entry: { session?: TrainingSession; override?: CalendarOverride; dateStr?: string }) => void
}) {
  const year = calDate.getFullYear()
  const month = calDate.getMonth()

  const monthLabel = calDate.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  })

  // Build overrides lookup by date string
  const overridesByDate = useMemo(() => {
    const map: Record<string, CalendarOverride[]> = {}
    for (const o of overrides) {
      if (!map[o.on_date]) map[o.on_date] = []
      map[o.on_date].push(o)
    }
    return map
  }, [overrides])

  // Build sessions lookup by day_of_week
  const sessionsByDow = useMemo(() => {
    const map: Record<number, TrainingSession[]> = {}
    for (const s of sessions) {
      if (!map[s.day_of_week]) map[s.day_of_week] = []
      map[s.day_of_week].push(s)
    }
    return map
  }, [sessions])

  // Build events lookup by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {}
    for (const ev of events) {
      const dateStr = ev.starts_at.slice(0, 10)
      if (!map[dateStr]) map[dateStr] = []
      map[dateStr].push(ev)
    }
    return map
  }, [events])

  // Days in month, with leading empty cells
  const firstDay = new Date(year, month, 1)
  // Monday-based: 0=Mon … 6=Sun
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const cells: Array<null | { day: number; dateStr: string; dow: number }> = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dow = (date.getDay() + 6) % 7
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, dateStr, dow })
  }

  const dayHeaders = lang === 'de'
    ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <>
    <style>{`
      @media (min-width: 641px) { .cal-mobile { display: none !important; } }
      @media (max-width: 640px) { .cal-desktop { display: none !important; } }
    `}</style>
    <div className="cal-desktop">
      {/* Month navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <button
          onClick={() => setCalDate(new Date(year, month - 1, 1))}
          aria-label={c.prevMonth}
          style={iconBtnStyle}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span
          style={{
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--fg)',
            minWidth: 180,
            textAlign: 'center',
            textTransform: 'capitalize',
          }}
        >
          {monthLabel}
        </span>
        <button
          onClick={() => setCalDate(new Date(year, month + 1, 1))}
          aria-label={c.nextMonth}
          style={iconBtnStyle}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ overflowX: 'auto' }}>
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--bg-elev)',
          minWidth: 420,
        }}
      >
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-elev-2)' }}>
          {dayHeaders.map((d) => (
            <div
              key={d}
              style={{
                padding: '0.625rem',
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--fg-dim)',
                fontFamily: 'var(--font-mono)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((cell, idx) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${idx}`}
                  style={{
                    minHeight: 72,
                    borderRight: '1px solid var(--border-soft)',
                    borderBottom: '1px solid var(--border-soft)',
                    background: 'var(--bg)',
                  }}
                />
              )
            }

            const { day, dateStr, dow } = cell
            const isToday = dateStr === todayStr
            const dayOverrides = overridesByDate[dateStr] ?? []
            const hasCancelOverride = dayOverrides.some((o) => o.type === 'cancel')
            const extraSessions = dayOverrides.filter((o) => o.type === 'training')
            const fixedSessions = hasCancelOverride ? [] : (sessionsByDow[dow] ?? [])
            const dayEvents = eventsByDate[dateStr] ?? []

            return (
              <div
                key={dateStr}
                style={{
                  minHeight: 72,
                  padding: '0.375rem',
                  borderRight: '1px solid var(--border-soft)',
                  borderBottom: '1px solid var(--border-soft)',
                  background: isToday ? 'var(--accent-soft)' : 'transparent',
                  position: 'relative',
                }}
              >
                {/* Day number */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? 'var(--accent)' : 'var(--fg-dim)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {day}
                </div>

                {/* Cancel badge */}
                {hasCancelOverride && (
                  <div
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: 'var(--danger)',
                      background: 'rgba(239,68,68,0.12)',
                      borderRadius: 3,
                      padding: '1px 4px',
                      marginBottom: 2,
                    }}
                  >
                    {c.cancelled}
                  </div>
                )}

                {/* Fixed sessions */}
                {fixedSessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={(e) => { e.stopPropagation(); onSelect({ session: s, dateStr }) }}
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 500,
                      color: 'var(--fg)',
                      background: 'var(--bg-elev-2)',
                      border: '1px solid var(--border-soft)',
                      borderLeft: '2px solid var(--accent-2)',
                      borderRadius: 3,
                      padding: '2px 4px',
                      marginBottom: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                    }}
                    title={`${s.time_label} · ${s.place.de}`}
                  >
                    {s.time_label.split(' – ')[0]} · {s.place[lang === 'de' ? 'de' : 'en'].split('·')[0].trim()}
                  </div>
                ))}

                {/* Extra sessions */}
                {extraSessions.map((o) => (
                  <div
                    key={o.id}
                    onClick={(e) => { e.stopPropagation(); onSelect({ override: o, dateStr }) }}
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: 'var(--accent-ink)',
                      background: 'var(--accent-spark)',
                      borderRadius: 3,
                      padding: '2px 4px',
                      marginBottom: 2,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={o.time_label ?? c.extra}
                  >
                    {c.extra}{o.time_label ? ` · ${o.time_label.split(' – ')[0]}` : ''}
                  </div>
                ))}

                {/* Events */}
                {dayEvents.map((ev) => (
                  <a
                    key={ev.id}
                    href="#events"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'block',
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: 'var(--fg)',
                      background: 'transparent',
                      borderLeft: `2px solid ${CAT_COLORS_EVENT[ev.category] ?? 'var(--cat-event)'}`,
                      borderRadius: '0 3px 3px 0',
                      padding: '2px 4px',
                      marginBottom: 2,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    title={t(ev.title, lang)}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'var(--fg)'
                      el.style.color = 'var(--accent-ink)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'transparent'
                      el.style.color = 'var(--fg)'
                    }}
                  >
                    {t(ev.title, lang)}
                  </a>
                ))}
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </div>
    <div className="cal-mobile">
      <MobileCalendarView
        lang={lang}
        sessions={sessions}
        overrides={overrides}
        events={events}
        calDate={calDate}
        setCalDate={setCalDate}
        c={c}
        onSelect={onSelect}
        todayStr={todayStr}
      />
    </div>
    </>
  )
}

function MobileCalendarView({
  lang, sessions, overrides, events, calDate, setCalDate, c, onSelect, todayStr,
}: {
  lang: Lang
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
  events: Event[]
  calDate: Date
  setCalDate: (d: Date) => void
  c: (typeof copy)['de']
  onSelect: (entry: { session?: TrainingSession; override?: CalendarOverride; dateStr?: string }) => void
  todayStr: string
}) {
  const year = calDate.getFullYear()
  const month = calDate.getMonth()
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const sessionsByDow = useMemo(() => {
    const map: Record<number, TrainingSession[]> = {}
    for (const s of sessions) {
      if (!map[s.day_of_week]) map[s.day_of_week] = []
      map[s.day_of_week].push(s)
    }
    return map
  }, [sessions])

  const overridesByDate = useMemo(() => {
    const map: Record<string, CalendarOverride[]> = {}
    for (const o of overrides) {
      if (!map[o.on_date]) map[o.on_date] = []
      map[o.on_date].push(o)
    }
    return map
  }, [overrides])

  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {}
    for (const ev of events) {
      const d = ev.starts_at.slice(0, 10)
      if (!map[d]) map[d] = []
      map[d].push(ev)
    }
    return map
  }, [events])

  const firstDay = new Date(year, month, 1)
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<null | { day: number; dateStr: string; dow: number }> = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dow = (date.getDay() + 6) % 7
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, dateStr, dow })
  }

  const dayHeaders = lang === 'de'
    ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  const monthLabel = calDate.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { month: 'long', year: 'numeric' })

  const selDayOvr = overridesByDate[selectedDate] ?? []
  const selHasCancel = selDayOvr.some(o => o.type === 'cancel')
  const selExtra = selDayOvr.filter(o => o.type === 'training')
  const selDow = (new Date(selectedDate + 'T12:00:00').getDay() + 6) % 7
  const selFixed = selHasCancel ? [] : (sessionsByDow[selDow] ?? [])
  const selEvents = eventsByDate[selectedDate] ?? []
  const hasAnything = selFixed.length > 0 || selExtra.length > 0 || selEvents.length > 0 || selHasCancel

  const selDateLabel = new Date(selectedDate + 'T12:00:00').toLocaleDateString(
    lang === 'de' ? 'de-DE' : 'en-GB',
    { weekday: 'long', day: 'numeric', month: 'long' }
  )

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setCalDate(new Date(year, month - 1, 1))} style={iconBtnStyle} aria-label={c.prevMonth}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--fg)', textTransform: 'capitalize' }}>{monthLabel}</span>
        <button onClick={() => setCalDate(new Date(year, month + 1, 1))} style={iconBtnStyle} aria-label={c.nextMonth}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* Grid */}
      <div style={{ border: '1px solid var(--line-soft)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--line-soft)' }}>
          {dayHeaders.map(d => (
            <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((cell, idx) => {
            if (!cell) return <div key={`e-${idx}`} style={{ minHeight: 52, borderRight: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }} />
            const { day, dateStr, dow } = cell
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const dayOvr = overridesByDate[dateStr] ?? []
            const hasCancel = dayOvr.some(o => o.type === 'cancel')
            const hasSessions = hasCancel ? false : (sessionsByDow[dow] ?? []).length > 0 || dayOvr.some(o => o.type === 'training')
            const dayEvs = eventsByDate[dateStr] ?? []
            const hasContent = hasCancel || hasSessions || dayEvs.length > 0
            const primaryColor = hasCancel
              ? 'var(--danger)'
              : hasSessions
              ? 'var(--accent-2)'
              : dayEvs.length > 0
              ? (CAT_COLORS_EVENT[dayEvs[0].category] ?? 'var(--fg-dim)')
              : null
            const eventDots = dayEvs.slice(0, 2).map(ev => CAT_COLORS_EVENT[ev.category] ?? 'var(--fg-dim)')

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  minHeight: 56, padding: '6px 2px 4px', textAlign: 'center', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  borderRight: '1px solid var(--line-soft)',
                  borderBottom: hasContent && !isSelected
                    ? `2px solid ${primaryColor}`
                    : '1px solid var(--line-soft)',
                  background: isSelected
                    ? 'rgba(74,127,212,0.1)'
                    : hasContent
                    ? 'rgba(74,127,212,0.03)'
                    : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontFamily: 'var(--font-mono)',
                  fontWeight: isToday || isSelected || hasContent ? 600 : 400,
                  background: isSelected ? 'var(--fg)' : isToday ? 'var(--accent-2)' : 'transparent',
                  color: isSelected
                    ? 'var(--accent-ink)'
                    : isToday
                    ? '#fff'
                    : hasContent
                    ? 'var(--fg)'
                    : 'var(--fg-mute)',
                  flexShrink: 0,
                }}>
                  {day}
                </div>
                {/* Event dots */}
                <div style={{ display: 'flex', gap: 3, justifyContent: 'center', minHeight: 8 }}>
                  {hasSessions && !hasCancel && (
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-2)', display: 'inline-block' }} />
                  )}
                  {hasCancel && (
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} />
                  )}
                  {eventDots.map((color, i) => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-mute)', textTransform: 'capitalize', marginBottom: 12 }}>
          {selDateLabel}
        </div>
        {!hasAnything && (
          <div style={{ color: 'var(--fg-mute)', fontSize: 14, padding: '12px 0' }}>{c.noTraining}</div>
        )}
        {selHasCancel && (
          <div style={{ background: 'rgba(255,122,122,0.1)', border: '1px solid rgba(255,122,122,0.3)', borderLeft: '3px solid var(--danger)', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.cancelled}</div>
          </div>
        )}
        {selFixed.map(s => (
          <div key={s.id} onClick={() => onSelect({ session: s, dateStr: selectedDate })}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderLeft: '3px solid var(--accent-2)', borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg)', fontWeight: 600 }}>{s.time_label}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-dim)', marginTop: 2 }}>{t(s.place, lang)}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
          </div>
        ))}
        {selExtra.map(o => (
          <div key={o.id} onClick={() => onSelect({ override: o, dateStr: selectedDate })}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(216,255,61,0.06)', border: '1px solid rgba(216,255,61,0.25)', borderLeft: '3px solid var(--accent-spark)', borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-spark)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.extra}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg)', fontWeight: 600, marginTop: 2 }}>{o.time_label}</div>
              {o.place && <div style={{ fontSize: 12, color: 'var(--fg-dim)', marginTop: 2 }}>{t(o.place, lang)}</div>}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
          </div>
        ))}
        {selEvents.map(ev => (
          <a key={ev.id} href="#events"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderLeft: `3px solid ${CAT_COLORS_EVENT[ev.category] ?? 'var(--fg-dim)'}`, borderRadius: 10, marginBottom: 8, textDecoration: 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{ev.category}</div>
              <div style={{ fontSize: 14, color: 'var(--fg)', fontWeight: 500 }}>{t(ev.title, lang)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  background: 'var(--bg-2)',
  border: '1px solid var(--line-soft)',
  borderRadius: 8,
  color: 'var(--fg-dim)',
  cursor: 'pointer',
  padding: '8px 14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  transition: 'border-color 0.15s, color 0.15s',
}
