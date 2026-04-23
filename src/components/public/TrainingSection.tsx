'use client'

import { useState, useMemo } from 'react'
import type { Lang, TrainingSession, CalendarOverride } from '@/lib/types'
import { t, levelLabel, dayLabel, fullDayLabel } from '@/lib/utils'

type Props = {
  lang: Lang
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
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

export default function TrainingSection({ lang, sessions, overrides }: Props) {
  const c = copy[lang]
  const [tab, setTab] = useState<'week' | 'cal'>('week')
  const [calDate, setCalDate] = useState(() => new Date())

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
          <WeekView lang={lang} sessions={sessions} c={c} />
        ) : (
          <CalendarView
            lang={lang}
            sessions={sessions}
            overrides={overrides}
            calDate={calDate}
            setCalDate={setCalDate}
            c={c}
          />
        )}
      </div>
    </section>
  )
}

function WeekView({
  lang,
  sessions,
  c,
}: {
  lang: Lang
  sessions: TrainingSession[]
  c: (typeof copy)['de']
}) {
  const byDay = useMemo(() => {
    const map: Record<number, TrainingSession[]> = {}
    for (const s of sessions) {
      if (!map[s.day_of_week]) map[s.day_of_week] = []
      map[s.day_of_week].push(s)
    }
    return map
  }, [sessions])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        border: '1px solid var(--line-soft)',
        borderRadius: 18,
        overflow: 'hidden',
        background: 'var(--bg-2)',
      }}
      className="schedule-grid"
    >
      {DAYS.map((day) => {
        const daySessions = byDay[day] ?? []
        return (
          <div
            key={day}
            style={{
              borderRight: '1px solid var(--line-soft)',
              minHeight: 340,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Day head */}
            <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: daySessions.length ? 'var(--fg)' : 'var(--fg-mute)' }}>
                {dayLabel(day, lang)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)' }}>
                {day + 1}
              </span>
            </div>
            {/* Day body */}
            <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {daySessions.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--fg-mute)' }}>{c.noTraining}</div>
              ) : (
                daySessions.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--line-soft)',
                      borderRadius: 12,
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      transition: 'border-color 0.2s, transform 0.2s',
                      cursor: 'default',
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
                      {s.time_label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg-dim)', lineHeight: 1.35 }}>
                      {t(s.place, lang)}
                    </div>
                    <div
                      style={{
                        alignSelf: 'flex-start',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 999,
                        border: '1px solid var(--line)',
                        background: s.level === 'open' || s.level === 'training' ? 'var(--fg)' : 'transparent',
                        color: s.level === 'open' || s.level === 'training' ? 'var(--accent-ink)' : s.level === 'comp' ? 'var(--accent-spark)' : 'var(--fg)',
                      }}
                    >
                      {levelLabel(s.level, lang)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CalendarView({
  lang,
  sessions,
  overrides,
  calDate,
  setCalDate,
  c,
}: {
  lang: Lang
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
  calDate: Date
  setCalDate: (d: Date) => void
  c: (typeof copy)['de']
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
    <div>
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
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--bg-elev)',
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
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 500,
                      color: 'var(--fg-muted)',
                      background: 'var(--bg-elev-2)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 3,
                      padding: '1px 4px',
                      marginBottom: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={s.time_label}
                  >
                    {s.time_label.split(' – ')[0]}
                  </div>
                ))}

                {/* Extra sessions */}
                {extraSessions.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: '#0a0a0b',
                      background: 'var(--accent)',
                      borderRadius: 3,
                      padding: '1px 4px',
                      marginBottom: 2,
                    }}
                  >
                    {c.extra}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
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
