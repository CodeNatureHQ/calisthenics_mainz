'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MapPin } from 'lucide-react'
import SectionHeading from './SectionHeading'
import HallRules, { isHallPlace } from './HallRules'
import type { Lang, TrainingSession, CalendarOverride, Spot, Event, RecurringEvent } from '@/lib/types'
import { t, levelLabel, fullDayLabel, nthWeekdayOfMonth } from '@/lib/utils'

type Props = {
  lang: Lang
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
  spots: Spot[]
  events: Event[]
  recurringEvents: RecurringEvent[]
}

const DAYS = [0, 1, 2, 3, 4, 5, 6]

const copy = {
  de: {
    label: '01',
    title: 'Training',
    weekTab: 'Diese Woche',
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
    weekTab: 'This week',
    calTab: 'Monthly calendar',
    noTraining: 'No training',
    cancelled: 'Cancelled',
    extra: 'Extra',
    today: 'Today',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
  },
}

export default function TrainingSection({ lang, sessions, overrides, spots, events, recurringEvents }: Props) {
  const c = copy[lang]
  const [tab, setTab] = useState<'week' | 'cal'>('week')
  const [calDate, setCalDate] = useState(() => new Date())
  const [activeEntry, setActiveEntry] = useState<{ session?: TrainingSession; override?: CalendarOverride; recurringEvent?: RecurringEvent; dateStr?: string } | null>(null)

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
        <div className="training-layout">
        <div className="training-welcome">
        <SectionHeading eyebrow={lang === 'de' ? 'Die nächsten Sessions' : 'The next sessions'} title={lang === 'de' ? 'Zusammen trainieren.' : 'Train together.'} description={lang === 'de' ? 'Hier findest du deine nächste Session. Wähle einen Termin für Treffpunkt und Infos zur Teilnahme.' : 'Find your next session. Select a date for the meeting point and how to take part.'} />

        </div>
        <div className="training-schedule">
        {/* Tabs */}
        <div className="schedule-tabs">
          {(['week', 'cal'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}

            >
              {t === 'week' ? c.weekTab : c.calTab}
            </button>
          ))}
        </div>

        {tab === 'week' ? (
          <WeekView lang={lang} sessions={sessions} overrides={overrides} recurringEvents={recurringEvents} c={c} onSelect={setActiveEntry} />
        ) : (
          <CalendarView
            lang={lang}
            sessions={sessions}
            overrides={overrides}
            events={events}
            recurringEvents={recurringEvents}
            calDate={calDate}
            setCalDate={setCalDate}
            c={c}
            onSelect={setActiveEntry}
          />
        )}
        </div>
        <aside id={lang === 'de' ? 'probetraining' : 'trial'} className="training-intro"><div><p className="eyebrow">{lang === 'de' ? 'Zum ersten Mal dabei?' : 'Your first session?'}</p><h3>{lang === 'de' ? 'Probetraining in der Halle.' : 'Trial session in the hall.'}</h3><p>{lang === 'de' ? 'JGU-Studierende kommen einfach vorbei. Alle anderen können eine Einheit als Probetraining besuchen:' : 'JGU students can just come by. Everyone else can join one session as a trial:'}</p></div><div className="training-intro-action"><ol className="training-intro-steps"><li>{lang === 'de' ? 'Spätestens 3 Tage vorher online beim AHS anmelden.' : 'Register online with AHS at least 3 days in advance.'}</li><li>{lang === 'de' ? 'Anmeldung zum Training mitbringen – am Eingang wird kontrolliert.' : 'Bring your registration – there are entrance checks.'}</li></ol><div className="training-intro-links"><a href="https://www.ahs.uni-mainz.de/foerderverein/" target="_blank" rel="noopener noreferrer" className="club-text-link">{lang === 'de' ? 'Zur Anmeldung ↗' : 'Register ↗'}</a><a href="#faq" className="club-text-link">{lang === 'de' ? 'Alle Infos ↗' : 'All details ↗'}</a></div></div><HallRules lang={lang} /></aside>
        </div>
      </div>

      {/* Detail Modal */}
      {activeEntry && (
        <TrainingModal entry={activeEntry} lang={lang} spots={spots} onClose={closeModal} />
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Training detail modal                                                */
/* ------------------------------------------------------------------ */
function TrainingModal({
  entry, lang, spots, onClose,
}: {
  entry: { session?: TrainingSession; override?: CalendarOverride; recurringEvent?: RecurringEvent; dateStr?: string }
  lang: Lang
  spots: Spot[]
  onClose: () => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const element = panel.current
    element?.querySelector<HTMLButtonElement>('button')?.focus()
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !element) return
      const controls = Array.from(element.querySelectorAll<HTMLElement>('button, a[href]'))
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    window.addEventListener('keydown', trapFocus)
    return () => { window.removeEventListener('keydown', trapFocus); previousFocus?.focus() }
  }, [])

  const re = entry.recurringEvent
  const s = entry.session
  const o = entry.override
  const place = re?.place ?? s?.place ?? o?.place
  const time = re?.time_label ?? s?.time_label ?? o?.time_label
  const level = s?.level ?? o?.level
  const description = re?.description ?? s?.description ?? o?.description
  const spotId = s?.spot_id ?? o?.spot_id
  const spot = spots.find(sp => sp.id === spotId)
  const stripeColor = re ? (CAT_COLORS_EVENT[re.category] ?? 'var(--accent-2)') : 'var(--accent-2)'

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#17181Acc',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '24px 20px', overflowY: 'auto',
      }}
    >
      <div
        ref={panel} role="dialog" aria-modal="true" aria-label={lang === 'de' ? 'Trainingsdetails' : 'Training details'}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-2)', border: '1px solid var(--line)',
          borderRadius: 3, maxWidth: 540, width: '100%', margin: 'auto', flexShrink: 0,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Top stripe */}
        <div style={{ height: 4, background: stripeColor }} />

        {/* Close */}
        <button
          aria-label={lang === 'de' ? 'Schließen' : 'Close'}
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
          {/* Category badge for recurring events, level badge for sessions */}
          {re ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginBottom: 16,
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 999,
              border: `1px solid ${CAT_COLORS_EVENT[re.category] ?? 'var(--line)'}`,
              background: CAT_COLORS_EVENT[re.category] ?? 'transparent',
              color: 'var(--accent-ink)',
            }}>
              {lang === 'de' ? 'Social' : 'Social'}
            </div>
          ) : level && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginBottom: 16,
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 999,
              border: '1px solid var(--line)',
              background: level === 'open' || level === 'training' ? 'var(--action-bg)' : 'transparent',
              color: level === 'open' || level === 'training' ? '#fff' : 'var(--fg)',
            }}>
              {levelLabel(level, lang)}
            </div>
          )}

          {/* Title for recurring events */}
          {re && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--fg)', marginBottom: 4 }}>
              {t(re.title, lang)}
            </div>
          )}

          {/* Time */}
          {time && (
            <div style={{ fontFamily: re ? 'var(--font-mono)' : 'var(--font-display)', fontSize: re ? 18 : 32, letterSpacing: re ? '0.04em' : '-0.02em', textTransform: 'uppercase', color: re ? 'var(--fg-dim)' : 'var(--fg)', marginBottom: 8 }}>
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
            <div
              className="prose-cm"
              dangerouslySetInnerHTML={{ __html: t(description, lang) }}
              style={{ fontSize: 14, lineHeight: 1.65, margin: '0 0 20px' }}
            />
          )}

          {isHallPlace(place?.de) && <HallRules lang={lang} compact />}

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
  recurringEvents,
  c,
  onSelect,
}: {
  lang: Lang
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
  recurringEvents: RecurringEvent[]
  c: (typeof copy)['de']
  onSelect: (entry: { session?: TrainingSession; override?: CalendarOverride; recurringEvent?: RecurringEvent; dateStr?: string }) => void
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
    <div className="week-grid">
      {DAYS.map((dow) => {
        const dateStr = currentWeekDate(dow)
        const isToday = dateStr === today
        const dayOverrides = overridesByDate[dateStr] ?? []
        const cancel = dayOverrides.find((o) => o.type === 'cancel')
        const extraSessions = dayOverrides.filter((o) => o.type === 'training')
        const fixedSessions = cancel ? [] : (byDay[dow] ?? [])
        const d = new Date(dateStr + 'T12:00:00')
        const nth = nthWeekdayOfMonth(d)
        const dayRecurring = recurringEvents.filter(re => re.day_of_week === dow && re.week_of_month === nth)
        const hasAnything = fixedSessions.length > 0 || extraSessions.length > 0 || !!cancel || dayRecurring.length > 0
        if (!hasAnything) return null
        const dateLabel = d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short' })

        return (
          <div key={dow} className="week-day" data-today={isToday}>
            <div className="week-day-head">
              <span className="week-day-name">{fullDayLabel(dow, lang)}</span>
              <span className="week-day-date">{isToday ? `${c.today} · ` : ''}{dateLabel}</span>
            </div>
            <div className="week-day-body">
              {cancel && (
                <div className="week-note week-note--cancel">
                  <span className="week-note-label">{c.cancelled}</span>
                  {cancel.note && <span className="week-note-meta">{t(cancel.note, lang)}</span>}
                </div>
              )}
              {fixedSessions.map((s) => (
                <SessionCard key={s.id} levelLabel_={levelLabel(s.level, lang)} time={s.time_label} place={t(s.place, lang)} level={s.level} onClick={() => onSelect({ session: s, dateStr })} />
              ))}
              {extraSessions.map((o) => (
                <button type="button" key={o.id} className="week-note week-note--extra" onClick={() => onSelect({ override: o, dateStr })}>
                  <span className="week-note-label">{c.extra}</span>
                  <span className="week-note-time">{o.time_label}</span>
                  {o.place && <span className="week-note-meta">{t(o.place, lang)}</span>}
                  {o.note && <span className="week-note-meta">{t(o.note, lang)}</span>}
                </button>
              ))}
              {dayRecurring.map((re) => (
                <button type="button" key={re.id} className="week-note week-note--recurring" style={{ borderLeftColor: CAT_COLORS_EVENT[re.category] ?? 'var(--fg-dim)' }} onClick={() => onSelect({ recurringEvent: re, dateStr })}>
                  <span className="week-note-label">{t(re.title, lang)}</span>
                  <span className="week-note-time">{re.time_label}</span>
                  <span className="week-note-meta">{t(re.place, lang)}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SessionCard({ time, place, level, levelLabel_, onClick }: {
  time: string; place: string; level: string; levelLabel_: string; onClick?: () => void
}) {
  const highlight = level === 'open' || level === 'training'
  return (
    <button type="button" className="session-card" onClick={onClick}>
      <span className="session-time">{time}</span>
      <span className="session-place"><MapPin size={14} />{place}</span>
      <span className={`club-tag${highlight ? ' club-tag--accent' : level === 'comp' ? '' : ' club-tag--outline'}`}>{levelLabel_}</span>
    </button>
  )
}

const CAT_COLORS_EVENT: Record<string, string> = {
  comp: 'var(--cat-comp)', jam: 'var(--cat-jam)', workshop: 'var(--cat-workshop)', social: 'var(--cat-social)',
}

function CalendarView({
  lang,
  sessions,
  overrides,
  events,
  recurringEvents,
  calDate,
  setCalDate,
  c,
  onSelect,
}: {
  lang: Lang
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
  events: Event[]
  recurringEvents: RecurringEvent[]
  calDate: Date
  setCalDate: (d: Date) => void
  c: (typeof copy)['de']
  onSelect: (entry: { session?: TrainingSession; override?: CalendarOverride; recurringEvent?: RecurringEvent; dateStr?: string }) => void
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

  // Build recurring events lookup by date for the visible month
  const recurringEventsByDate = useMemo(() => {
    const map: Record<string, RecurringEvent[]> = {}
    for (const cell of cells) {
      if (!cell) continue
      const d = new Date(cell.dateStr + 'T12:00:00')
      const nth = nthWeekdayOfMonth(d)
      const matching = recurringEvents.filter(re => re.day_of_week === cell.dow && re.week_of_month === nth)
      if (matching.length) map[cell.dateStr] = matching
    }
    return map
  }, [cells, recurringEvents])

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
            const dayRecurring = recurringEventsByDate[dateStr] ?? []

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
                      background: 'color-mix(in srgb, var(--danger) 12%, transparent)',
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

                {/* Recurring events (e.g. Stammtisch) */}
                {dayRecurring.map((re) => (
                  <div
                    key={re.id}
                    onClick={(e) => { e.stopPropagation(); onSelect({ recurringEvent: re, dateStr }) }}
                    style={{
                      display: 'block',
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: 'var(--fg)',
                      background: 'transparent',
                      borderLeft: `2px solid ${CAT_COLORS_EVENT[re.category] ?? 'var(--cat-event)'}`,
                      borderRadius: '0 3px 3px 0',
                      padding: '2px 4px',
                      marginBottom: 2,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    title={t(re.title, lang)}
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
                    {t(re.title, lang)}
                  </div>
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
        recurringEvents={recurringEvents}
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
  lang, sessions, overrides, events, recurringEvents, calDate, setCalDate, c, onSelect, todayStr,
}: {
  lang: Lang
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
  events: Event[]
  recurringEvents: RecurringEvent[]
  calDate: Date
  setCalDate: (d: Date) => void
  c: (typeof copy)['de']
  onSelect: (entry: { session?: TrainingSession; override?: CalendarOverride; recurringEvent?: RecurringEvent; dateStr?: string }) => void
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

  const recurringEventsByDate = useMemo(() => {
    const map: Record<string, RecurringEvent[]> = {}
    for (const cell of cells) {
      if (!cell) continue
      const d = new Date(cell.dateStr + 'T12:00:00')
      const nth = nthWeekdayOfMonth(d)
      const matching = recurringEvents.filter(re => re.day_of_week === cell.dow && re.week_of_month === nth)
      if (matching.length) map[cell.dateStr] = matching
    }
    return map
  }, [cells, recurringEvents])

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
  const selRecurring = recurringEventsByDate[selectedDate] ?? []
  const hasAnything = selFixed.length > 0 || selExtra.length > 0 || selEvents.length > 0 || selRecurring.length > 0 || selHasCancel

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
            const dayRecurring = recurringEventsByDate[dateStr] ?? []
            const hasContent = hasCancel || hasSessions || dayEvs.length > 0 || dayRecurring.length > 0
            const allEvs = [...dayEvs, ...dayRecurring]
            const primaryColor = hasCancel
              ? 'var(--danger)'
              : hasSessions
              ? 'var(--accent-2)'
              : allEvs.length > 0
              ? (CAT_COLORS_EVENT[allEvs[0].category] ?? 'var(--fg-dim)')
              : null
            const eventDots = allEvs.slice(0, 2).map(ev => CAT_COLORS_EVENT[ev.category] ?? 'var(--fg-dim)')

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
                    ? 'var(--accent-soft)'
                    : hasContent
                    ? 'color-mix(in srgb, var(--accent) 5%, transparent)'
                    : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontFamily: 'var(--font-mono)',
                  fontWeight: isToday || isSelected || hasContent ? 600 : 400,
                  background: isSelected ? 'var(--fg)' : isToday ? 'var(--action-bg)' : 'transparent',
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
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--action-bg)', display: 'inline-block' }} />
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
          <div style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)', borderLeft: '3px solid var(--danger)', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
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
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--accent-soft)', border: '1px solid var(--accent-ring)', borderLeft: '3px solid var(--accent-spark)', borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}>
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
        {selRecurring.map(re => (
          <div key={re.id} onClick={() => onSelect({ recurringEvent: re, dateStr: selectedDate })}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderLeft: `3px solid ${CAT_COLORS_EVENT[re.category] ?? 'var(--fg-dim)'}`, borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg)', fontWeight: 600 }}>{t(re.title, lang)}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-dim)', marginTop: 2 }}>{re.time_label} · {t(re.place, lang)}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
          </div>
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
