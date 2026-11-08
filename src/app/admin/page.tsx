'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Plus, Search, Undo2, X } from 'lucide-react'
import type { CalendarOverride, Event, SiteSettings, TrainingSession, ContactMessage } from '@/lib/types'
import { createClient } from '@/lib/supabase/admin'
import { openSearch } from '@/components/admin/Search'
import { PageHeader } from '@/components/admin/sections'
import { DateCol } from '@/components/admin/list'
import { inp, btnPrimary, btnGhost, btnDanger } from './shared'

/**
 * Die Übersicht: Hier wird das Häufige direkt erledigt (Training absagen, Meldung
 * schalten, Nachrichten öffnen). Alles andere ist über die Suche (⌘K) oder die
 * Seitenleiste zwei Klicks entfernt. Keine Kachelwand: eine Zeitleiste links,
 * drei kurze Listen rechts.
 */

type Announcement = Pick<SiteSettings, 'announcement_active' | 'announcement_title_de' | 'announcement_starts_at' | 'announcement_ends_at' | 'announcement_event_id'>
type Data = {
  sessions: TrainingSession[]
  overrides: CalendarOverride[]
  announcement: Announcement | null
  messages: ContactMessage[]
  events: Event[]
  regCounts: Record<string, number>
}

const DAYS_AHEAD = 14

const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

async function fetchData(): Promise<Data> {
  const db = createClient()
  const today = new Date()
  const end = new Date(today); end.setDate(end.getDate() + DAYS_AHEAD)
  const [sessions, overrides, settings, messages, events, regs] = await Promise.all([
    db.from('training_sessions').select('*').order('sort_order'),
    db.from('calendar_overrides').select('*').gte('on_date', localDate(today)).lte('on_date', localDate(end)),
    db.from('site_settings').select('announcement_active,announcement_title_de,announcement_starts_at,announcement_ends_at,announcement_event_id').single(),
    db.from('contact_messages').select('*').eq('handled', false).order('created_at', { ascending: false }),
    db.from('events').select('*').gte('starts_at', today.toISOString()).order('starts_at').limit(4),
    db.from('event_registrations').select('event_id'),
  ])
  const regCounts: Record<string, number> = {}
  for (const r of (regs.data ?? []) as { event_id: string }[]) regCounts[r.event_id] = (regCounts[r.event_id] ?? 0) + 1
  return {
    sessions: sessions.data ?? [],
    overrides: overrides.data ?? [],
    announcement: (settings.data as Announcement) ?? null,
    messages: messages.data ?? [],
    events: events.data ?? [],
    regCounts,
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<Data | null>(null)
  const reload = useCallback(() => { fetchData().then(setData) }, [])
  useEffect(() => { fetchData().then(setData) }, [])
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div>
      <PageHeader section="dashboard" title={today} />

      <button type="button" onClick={() => openSearch()} style={{ ...inp, display: 'flex', alignItems: 'center', gap: 12, cursor: 'text', color: 'var(--fg-mute)', marginBottom: 12, textAlign: 'left', maxWidth: 720, minHeight: 52, fontSize: 16 }}>
        <Search size={18} />
        Suchen: Event, Frage, Spot, Person, Impressum …
        <span className="admin-kbd">⌘K</span>
      </button>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 44, maxWidth: 720 }}>
        <Link href="/admin/events?edit=new" className="admin-new"><Plus size={16} /> Neues Event</Link>
        <Link href="/admin/training?extra=new" className="admin-new"><Plus size={16} /> Extra-Training</Link>
        <Link href="/admin/blog?edit=new" className="admin-new"><Plus size={16} /> Blogpost</Link>
        <Link href="/admin/faq?edit=new" className="admin-new"><Plus size={16} /> FAQ-Frage</Link>
      </div>

      <div className="admin-dash-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 40, alignItems: 'start' }}>
        <UpcomingTrainings data={data} onChange={reload} />
        <div style={{ display: 'grid', gap: 40 }}>
          <AnnouncementCard data={data} onChange={reload} />
          <MessagesCard data={data} />
          <EventsCard data={data} />
        </div>
      </div>

      <style>{`@media (max-width: 960px) { .admin-dash-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function Heading({ children, href, link }: { children: React.ReactNode; href: string; link: string }) {
  return (
    <h2 className="admin-group-title">
      <span>{children}</span>
      <Link href={href} style={{ font: '500 13.5px var(--font-sans)', color: 'var(--fg-mute)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{link} <ArrowRight size={13} /></Link>
    </h2>
  )
}

/* ── Training: absagen in zwei Klicks ───────────────────────────────────── */

function UpcomingTrainings({ data, onChange }: { data: Data | null; onChange: () => void }) {
  const [confirming, setConfirming] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const days: { key: string; date: Date; sessions: TrainingSession[]; extras: CalendarOverride[]; cancel?: CalendarOverride }[] = []
  if (data) {
    const start = new Date()
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const date = new Date(start); date.setDate(start.getDate() + i)
      const key = localDate(date)
      const dow = (date.getDay() + 6) % 7
      const sessions = data.sessions.filter((s) => s.day_of_week === dow)
      const extras = data.overrides.filter((o) => o.on_date === key && o.type === 'training')
      const cancel = data.overrides.find((o) => o.on_date === key && o.type === 'cancel')
      if (sessions.length || extras.length || cancel) days.push({ key, date, sessions, extras, cancel })
    }
  }

  async function cancelDay(key: string) {
    setBusy(true)
    await createClient().from('calendar_overrides').insert({ type: 'cancel', on_date: key, note: reason.trim() ? { de: reason.trim(), en: '' } : null })
    setBusy(false); setConfirming(null); setReason(''); onChange()
  }

  async function restore(id: string) {
    setBusy(true)
    await createClient().from('calendar_overrides').delete().eq('id', id)
    setBusy(false); onChange()
  }

  const relative = (d: Date) => {
    const offset = Math.round((new Date(localDate(d)).getTime() - new Date(localDate(new Date())).getTime()) / 86_400_000)
    return offset === 0 ? 'Heute' : offset === 1 ? 'Morgen' : d.toLocaleDateString('de-DE', { weekday: 'short' })
  }

  return (
    <section>
      <Heading href="/admin/training" link="Wochenplan">Training, nächste 2 Wochen</Heading>
      <div className="admin-box">
        {!data && <div className="admin-box-empty">Lädt …</div>}
        {data && days.length === 0 && <div className="admin-box-empty">Keine Trainings in den nächsten zwei Wochen.</div>}
        {days.map((day) => (
          <div key={day.key} style={{ padding: '12px 16px', borderBottom: '1px solid var(--line-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <DateCol date={day.date} sub={relative(day.date)} tone={day.cancel ? 'danger' : undefined} />
              <div style={{ flex: 1, minWidth: 160 }}>
                {day.cancel ? (
                  <>
                    <div style={{ font: '600 15px/1.35 var(--font-sans)', color: 'var(--danger)' }}>Fällt aus</div>
                    <div className="admin-item-sub">{day.cancel.note?.de || day.sessions.map((s) => s.time_label).join(', ')}</div>
                  </>
                ) : (
                  <>
                    <div style={{ font: '600 15px/1.35 var(--font-sans)', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>
                      {[...day.sessions.map((s) => s.time_label), ...day.extras.map((o) => `${o.time_label ?? ''} (extra)`)].join(', ')}
                    </div>
                    <div className="admin-item-sub">{[...new Set([...day.sessions.map((s) => s.place.de), ...day.extras.map((o) => o.place?.de ?? '')])].filter(Boolean).join(', ')}</div>
                  </>
                )}
              </div>
              {day.cancel ? (
                <button type="button" disabled={busy} onClick={() => restore(day.cancel!.id)} style={{ ...btnGhost, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Undo2 size={14} /> Findet doch statt</button>
              ) : day.sessions.length > 0 && confirming !== day.key ? (
                <button type="button" onClick={() => { setConfirming(day.key); setReason('') }} style={btnGhost}>Absagen</button>
              ) : null}
            </div>
            {confirming === day.key && (
              <form onSubmit={(e) => { e.preventDefault(); cancelDay(day.key) }} style={{ display: 'flex', gap: 8, marginTop: 12, marginLeft: 80, flexWrap: 'wrap' }} className="admin-cancel-form">
                <input autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Grund (optional), z. B. Halle belegt" style={{ ...inp, flex: 1, minWidth: 200 }} />
                <button type="submit" disabled={busy} style={{ ...btnPrimary, background: 'var(--danger)', borderColor: 'var(--danger)', color: 'var(--bg)' }}>{busy ? '…' : 'Absagen'}</button>
                <button type="button" onClick={() => setConfirming(null)} aria-label="Abbrechen" style={btnGhost}><X size={14} /></button>
              </form>
            )}
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 640px) { .admin-cancel-form { margin-left: 0 !important; } }`}</style>
    </section>
  )
}

/* ── Meldung: eine Zeile, ein Knopf ─────────────────────────────────────── */

function AnnouncementCard({ data, onChange }: { data: Data | null; onChange: () => void }) {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const a = data?.announcement
  const today = localDate(new Date())
  // same rule as the public layout: switched on and inside the optional date range
  const live = !!a?.announcement_active
    && (!a.announcement_starts_at || a.announcement_starts_at <= today)
    && (!a.announcement_ends_at || a.announcement_ends_at >= today)
  const scheduled = !!a?.announcement_active && !live

  async function goLive() {
    if (!title.trim()) return
    setBusy(true)
    await createClient().from('site_settings').update({
      announcement_active: true,
      announcement_title_de: title.trim(), announcement_title_en: '',
      announcement_body_de: '', announcement_body_en: '',
      announcement_event_id: null, announcement_image_url: null,
      announcement_starts_at: null, announcement_ends_at: null,
    }).eq('id', 1)
    setBusy(false); setTitle(''); onChange()
  }

  async function turnOff() {
    setBusy(true)
    await createClient().from('site_settings').update({ announcement_active: false }).eq('id', 1)
    setBusy(false); onChange()
  }

  return (
    <section>
      <Heading href="/admin/ankuendigung" link={live || scheduled ? 'Bearbeiten' : 'Mehr Optionen'}>Meldung</Heading>
      <div className="admin-box" style={{ padding: 16, borderColor: live ? 'var(--accent)' : undefined }}>
        {!data ? <span style={{ color: 'var(--fg-mute)' }}>Lädt …</span> : live || scheduled ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ font: '600 13px/1.3 var(--font-sans)', color: live ? 'var(--accent)' : 'var(--fg-mute)', marginBottom: 4 }}>
                {live ? 'Ist gerade auf der Seite' : 'Eingeschaltet, aber außerhalb des Zeitraums'}
              </div>
              <div style={{ font: '600 15px/1.4 var(--font-sans)', color: 'var(--fg)' }}>{a?.announcement_event_id ? 'Event-Ankündigung' : a?.announcement_title_de}</div>
              {a?.announcement_ends_at && <div className="admin-item-sub">bis {new Date(a.announcement_ends_at + 'T12:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}</div>}
            </div>
            <button type="button" disabled={busy} onClick={turnOff} style={btnDanger}>{busy ? '…' : 'Ausschalten'}</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); goLive() }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Heute kein Training, Halle belegt" style={{ ...inp, flex: 1, minWidth: 180 }} aria-label="Text der Meldung" />
            <button type="submit" disabled={busy || !title.trim()} style={btnPrimary}>{busy ? '…' : 'Live schalten'}</button>
          </form>
        )}
      </div>
    </section>
  )
}

/* ── Nachrichten & Events: ein Klick bis zum Eintrag ────────────────────── */

function MessagesCard({ data }: { data: Data | null }) {
  const open = data?.messages ?? []
  return (
    <section>
      <Heading href="/admin/nachrichten" link="Alle">Offene Nachrichten{open.length > 0 && <small style={{ color: 'var(--accent)' }}>{open.length}</small>}</Heading>
      <div className="admin-box">
        {data && open.length === 0 && <div className="admin-box-empty">Alles beantwortet.</div>}
        {open.slice(0, 3).map((m) => (
          <Link key={m.id} href={`/admin/nachrichten?open=${m.id}`} className="admin-item" style={{ textDecoration: 'none', minHeight: 0 }}>
            <div className="admin-item-main" style={{ flex: 1, minWidth: 0 }}>
              <div className="admin-item-title">{m.name}</div>
              <div className="admin-item-sub">{m.message}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function EventsCard({ data }: { data: Data | null }) {
  const events = data?.events ?? []
  return (
    <section>
      <Heading href="/admin/events" link="Alle">Kommende Events</Heading>
      <div className="admin-box">
        {data && events.length === 0 && <div className="admin-box-empty">Keine geplant.</div>}
        {events.map((ev) => (
          <Link key={ev.id} href={`/admin/events?edit=${encodeURIComponent(ev.id)}`} className="admin-item" style={{ textDecoration: 'none', minHeight: 0 }}>
            <DateCol date={new Date(ev.starts_at)} />
            <div className="admin-item-main" style={{ flex: 1, minWidth: 0 }}>
              <div className="admin-item-title">{ev.title.de}</div>
              <div className="admin-item-sub">{ev.place.de}</div>
            </div>
            {ev.registration_mode && ev.registration_mode !== 'none' && <span className="admin-badge" data-tone="info">{data?.regCounts[ev.id] ?? 0} Anm.</span>}
          </Link>
        ))}
      </div>
    </section>
  )
}
