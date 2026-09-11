'use client'

import { useEffect, useState } from 'react'
import type { TrainingSession, CalendarOverride, SessionLevel, Spot } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { fullDayLabel, levelLabel } from '@/lib/utils'
import { pageHead, crumbStyle, h1Style, sectionHead, sectionTitle, card, listRow as sharedListRow, empty, inp, btnPrimary, btnGhost, btnDanger } from '../shared'
import { FormShell, FormSection, Field, Grid, LangColumns } from '@/components/admin/Form'
import LangPair from '@/components/admin/LangPair'
import dynamic from 'next/dynamic'
const RichText = dynamic(() => import('@/components/admin/RichText'), { ssr: false })

const LEVELS: SessionLevel[] = ['beginner', 'advanced', 'open', 'comp', 'training']

export default function AdminTrainingPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [overrides, setOverrides] = useState<CalendarOverride[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [editingSession, setEditingSession] = useState<TrainingSession | null | 'new'>(null)
  const [editingOverride, setEditingOverride] = useState<CalendarOverride | null | 'new'>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const supabase = createClient()
    const [{ data: s }, { data: o }, { data: sp }] = await Promise.all([
      supabase.from('training_sessions').select('*').order('sort_order'),
      supabase.from('calendar_overrides').select('*').order('on_date'),
      supabase.from('spots').select('*').order('sort_order'),
    ])
    setSessions(s ?? [])
    setOverrides(o ?? [])
    setSpots(sp ?? [])
  }

  useEffect(() => { load() }, [])

  async function deleteSession(id: string) {
    if (!confirm('Löschen?')) return
    const supabase = createClient()
    await supabase.from('training_sessions').delete().eq('id', id)
    load()
  }

  async function deleteOverride(id: string) {
    if (!confirm('Löschen?')) return
    const supabase = createClient()
    await supabase.from('calendar_overrides').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>03 / Content</span>
          <h1 style={h1Style}>Training</h1>
        </div>
      </div>

      {/* ---- Sessions ---- */}
      {editingOverride === null && <section style={{ marginBottom: '2.5rem' }}>
        <div style={sectionHead}>
          <h2 style={sectionTitle}>Wochenplan</h2>
          {editingSession === null && <button onClick={() => setEditingSession('new')} style={btnPrimary}>+ Hinzufügen</button>}
        </div>

        {editingSession !== null ? (
          <SessionForm
            session={editingSession === 'new' ? null : editingSession}
            spots={spots}
            onSave={() => { setEditingSession(null); load() }}
            onCancel={() => setEditingSession(null)}
          />
        ) : (
        <div style={card}>
          {sessions.length === 0 ? <div style={empty}>Keine Einheiten</div> : sessions.map((s) => (
            <div key={s.id} style={sharedListRow} className="admin-list-row">
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--fg-mute)', background: 'var(--bg-3)', borderRadius: 4, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{fullDayLabel(s.day_of_week, 'de')}</span>
                  <span style={{ fontWeight: 600, color: 'var(--fg)', fontSize: 14 }}>{s.time_label}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-mute)', letterSpacing: '0.04em' }}>
                  {s.place.de} · {levelLabel(s.level, 'de')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }} className="admin-list-row-actions">
                <button onClick={() => setEditingSession(s)} style={btnGhost}>Bearbeiten</button>
                <button onClick={() => deleteSession(s.id)} style={btnDanger}>Löschen</button>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>}

      {/* ---- Overrides ---- */}
      {editingSession === null && <section>
        <div style={sectionHead}>
          <h2 style={sectionTitle}>Einmaltermine & Ausfälle</h2>
          {editingOverride === null && <button onClick={() => setEditingOverride('new')} style={btnPrimary}>+ Hinzufügen</button>}
        </div>

        {editingOverride !== null ? (
          <OverrideForm
            override={editingOverride === 'new' ? null : editingOverride}
            onSave={() => { setEditingOverride(null); load() }}
            onCancel={() => setEditingOverride(null)}
          />
        ) : (
        <div style={card}>
          {overrides.length === 0 ? <div style={empty}>Keine Einträge</div> : overrides.map((o) => (
            <div key={o.id} style={sharedListRow} className="admin-list-row">
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 7px',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: o.type === 'cancel' ? 'color-mix(in srgb, var(--danger) 12%, transparent)' : 'var(--accent-soft)',
                    color: o.type === 'cancel' ? 'var(--danger)' : 'var(--accent)',
                  }}>
                    {o.type === 'cancel' ? 'Ausfall' : 'Extra'}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--fg)', fontSize: 14 }}>{o.on_date}</span>
                </div>
                {o.note && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-mute)' }}>{o.note.de}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }} className="admin-list-row-actions">
                <button onClick={() => setEditingOverride(o)} style={btnGhost}>Bearbeiten</button>
                <button onClick={() => deleteOverride(o.id)} style={btnDanger}>Löschen</button>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>}
    </div>
  )
}

function SessionForm({ session, spots, onSave, onCancel }: { session: TrainingSession | null; spots: Spot[]; onSave: () => void; onCancel: () => void }) {
  const [dow, setDow] = useState(session?.day_of_week ?? 0)
  const [time, setTime] = useState(session?.time_label ?? '')
  const [placeDe, setPlaceDe] = useState(session?.place?.de ?? '')
  const [placeEn, setPlaceEn] = useState(session?.place?.en ?? '')
  const [level, setLevel] = useState<SessionLevel>(session?.level ?? 'open')
  const [spotId, setSpotId] = useState(session?.spot_id ?? '')
  const [descDe, setDescDe] = useState(session?.description?.de ?? '')
  const [descEn, setDescEn] = useState(session?.description?.en ?? '')
  const [sortOrder, setSortOrder] = useState(session?.sort_order ?? 0)
  const [saving, setSaving] = useState(false)

  function handleSpotChange(id: string) {
    setSpotId(id)
    const spot = spots.find(s => s.id === id)
    if (spot) { setPlaceDe(spot.name.de); setPlaceEn(spot.name.en) }
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const data = {
      day_of_week: dow, time_label: time,
      place: { de: placeDe, en: placeEn },
      level, sort_order: sortOrder,
      spot_id: spotId || null,
      description: descDe ? { de: descDe, en: descEn } : null,
    }
    if (session) {
      await supabase.from('training_sessions').update(data).eq('id', session.id)
    } else {
      await supabase.from('training_sessions').insert(data)
    }
    setSaving(false)
    onSave()
  }

  return (
    <FormShell title={session ? 'Einheit bearbeiten' : 'Neue Trainingseinheit'} onCancel={onCancel} onSave={save} saving={saving} disabled={!time.trim()}>
      <FormSection title="Termin" description="Wöchentlich wiederkehrend. Für einzelne Ausfälle oder Extra-Termine gibt es den Bereich darunter.">
        <Grid cols={3}>
          <Field label="Wochentag">
            <select value={dow} onChange={(e) => setDow(Number(e.target.value))} style={inp}>
              {[0,1,2,3,4,5,6].map((d) => <option key={d} value={d}>{fullDayLabel(d, 'de')}</option>)}
            </select>
          </Field>
          <Field label="Uhrzeit" hint="So, wie es auf der Seite stehen soll.">
            <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="19:15 – 21:30" style={inp} />
          </Field>
          <Field label="Level">
            <select value={level} onChange={(e) => setLevel(e.target.value as SessionLevel)} style={inp}>
              {LEVELS.map((l) => <option key={l} value={l}>{levelLabel(l, 'de')}</option>)}
            </select>
          </Field>
        </Grid>
      </FormSection>
      <FormSection title="Ort" description="Ein verknüpfter Spot übernimmt seinen Namen und verlinkt die Anfahrt. Der Ortsname lässt sich danach noch anpassen.">
        <Field label="Spot">
          <select value={spotId} onChange={(e) => handleSpotChange(e.target.value)} style={inp}>
            <option value="">Kein Spot verknüpft</option>
            {spots.map(s => <option key={s.id} value={s.id}>{s.name.de} · {s.address}</option>)}
          </select>
        </Field>
        <LangPair label="Ortsname" deValue={placeDe} enValue={placeEn} onDe={setPlaceDe} onEn={setPlaceEn} placeholder={{ de: 'JGU Campus · Halle', en: 'JGU Campus · Gym' }} />
      </FormSection>
      <FormSection title="Beschreibung" description="Erscheint im Dialog, wenn jemand die Einheit anklickt: Fokus, Ablauf, was man mitbringen sollte.">
        <LangColumns label="Beschreibung" optional de={<RichText value={descDe} onChange={setDescDe} placeholder="Worauf liegt der Fokus?" minHeight={120} />} en={<RichText value={descEn} onChange={setDescEn} placeholder="What's the focus?" minHeight={120} />} />
      </FormSection>
      <FormSection title="Anzeige">
        <Grid cols={3}>
          <Field label="Reihenfolge" hint="Bei mehreren Einheiten am selben Tag.">
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} style={inp} />
          </Field>
        </Grid>
      </FormSection>
    </FormShell>
  )
}

function OverrideForm({ override, onSave, onCancel }: { override: CalendarOverride | null; onSave: () => void; onCancel: () => void }) {
  const [type, setType] = useState<'training' | 'cancel'>(override?.type ?? 'cancel')
  const [date, setDate] = useState(override?.on_date ?? '')
  const [time, setTime] = useState(override?.time_label ?? '')
  const [placeDe, setPlaceDe] = useState(override?.place?.de ?? '')
  const [placeEn, setPlaceEn] = useState(override?.place?.en ?? '')
  const [level, setLevel] = useState<SessionLevel>(override?.level ?? 'open')
  const [noteDe, setNoteDe] = useState(override?.note?.de ?? '')
  const [noteEn, setNoteEn] = useState(override?.note?.en ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const data: Record<string, unknown> = {
      type,
      on_date: date,
      note: noteDe ? { de: noteDe, en: noteEn } : null,
    }
    if (type === 'training') {
      data.time_label = time
      data.place = { de: placeDe, en: placeEn }
      data.level = level
    }
    if (override) {
      await supabase.from('calendar_overrides').update(data).eq('id', override.id)
    } else {
      await supabase.from('calendar_overrides').insert(data)
    }
    setSaving(false)
    onSave()
  }

  return (
    <FormShell title={override ? 'Termin bearbeiten' : 'Ausfall oder Extra-Termin'} onCancel={onCancel} onSave={save} saving={saving} disabled={!date}>
      <FormSection title="Was passiert?" description="Ein Ausfall blendet an diesem Tag alle regulären Einheiten aus. Ein Extra-Termin kommt zusätzlich in den Plan.">
        <Grid>
          <Field label="Art">
            <select value={type} onChange={(e) => setType(e.target.value as 'training' | 'cancel')} style={inp}>
              <option value="cancel">Training fällt aus</option>
              <option value="training">Extra-Training</option>
            </select>
          </Field>
          <Field label="Datum">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inp} />
          </Field>
        </Grid>
      </FormSection>
      {type === 'training' && (
        <FormSection title="Extra-Training" description="Uhrzeit, Level und Ort für diesen einen Termin.">
          <Grid>
            <Field label="Uhrzeit">
              <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="11:00 – 13:00" style={inp} />
            </Field>
            <Field label="Level">
              <select value={level} onChange={(e) => setLevel(e.target.value as SessionLevel)} style={inp}>
                {LEVELS.map((l) => <option key={l} value={l}>{levelLabel(l, 'de')}</option>)}
              </select>
            </Field>
          </Grid>
          <LangPair label="Ort" deValue={placeDe} enValue={placeEn} onDe={setPlaceDe} onEn={setPlaceEn} placeholder={{ de: 'Volkspark Mainz', en: 'Volkspark Mainz' }} />
        </FormSection>
      )}
      <FormSection title="Hinweis" description="Steht im Wochenplan direkt beim Termin. Bei einem Ausfall zum Beispiel der Grund.">
        <LangPair label="Hinweis" optional deValue={noteDe} enValue={noteEn} onDe={setNoteDe} onEn={setNoteEn} placeholder={{ de: 'Feiertag – kein Training', en: 'Public holiday – no session' }} />
      </FormSection>
    </FormShell>
  )
}
