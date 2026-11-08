'use client'

import { useEffect, useState } from 'react'
import type { TrainingSession, CalendarOverride, SessionLevel, Spot } from '@/lib/types'
import { createClient } from '@/lib/supabase/admin'
import { fullDayLabel, levelLabel } from '@/lib/utils'
import { card, empty, inp, btnPrimary, btnGhost } from '../shared'
import { FormShell, FormSection, Field, Grid, LangColumns } from '@/components/admin/Form'
import LangPair from '@/components/admin/LangPair'
import dynamic from 'next/dynamic'
import { useDeepLink, ListItem, DateCol } from '@/components/admin/list'
import { PageHeader } from '@/components/admin/sections'
const RichText = dynamic(() => import('@/components/admin/RichText'), { ssr: false })

/** yyyy-mm-dd in local time — the format of calendar_overrides.on_date. */
const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const LEVELS: SessionLevel[] = ['beginner', 'advanced', 'open', 'comp', 'training']

export default function AdminTrainingPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [overrides, setOverrides] = useState<CalendarOverride[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [editingSession, setEditingSession] = useState<TrainingSession | null | 'new'>(null)
  const [editingOverride, setEditingOverride] = useState<CalendarOverride | null | 'new' | 'new-extra'>(null)
  const [ready, setReady] = useState(false)
  const [showPast, setShowPast] = useState(false)

  async function load() {
    const supabase = createClient()
    const [{ data: s }, { data: o }, { data: sp }] = await Promise.all([
      supabase.from('training_sessions').select('*').order('day_of_week').order('sort_order'),
      supabase.from('calendar_overrides').select('*').order('on_date'),
      supabase.from('spots').select('*').order('sort_order'),
    ])
    setSessions(s ?? [])
    setOverrides(o ?? [])
    setSpots(sp ?? [])
    setReady(true)
  }

  useEffect(() => { load() }, [])
  useDeepLink('session', sessions, ready, (s) => { setEditingOverride(null); setEditingSession(s) })
  useDeepLink('override', overrides, ready, (o) => { setEditingSession(null); setEditingOverride(o) })
  useDeepLink('extra', overrides, ready, () => { setEditingSession(null); setEditingOverride('new-extra') })

  const today = localDate(new Date())
  const upcoming = overrides.filter((o) => o.on_date >= today)
  const past = overrides.filter((o) => o.on_date < today).reverse()
  const shownOverrides = showPast ? [...upcoming, ...past] : upcoming

  async function deleteSession(id: string) {
    if (!confirm('Diese Einheit aus dem Wochenplan löschen?')) return
    setEditingSession(null)
    const supabase = createClient()
    await supabase.from('training_sessions').delete().eq('id', id)
    load()
  }

  async function deleteOverride(id: string) {
    if (!confirm('Diesen Termin löschen?')) return
    setEditingOverride(null)
    const supabase = createClient()
    await supabase.from('calendar_overrides').delete().eq('id', id)
    load()
  }

  if (editingSession !== null) {
    return <SessionForm session={editingSession === 'new' ? null : editingSession} spots={spots} onSave={() => { setEditingSession(null); load() }} onCancel={() => setEditingSession(null)} onDelete={editingSession === 'new' ? undefined : () => deleteSession(editingSession.id)} />
  }
  if (editingOverride !== null) {
    const existing = editingOverride === 'new' || editingOverride === 'new-extra' ? null : editingOverride
    return <OverrideForm override={existing} initialType={editingOverride === 'new-extra' ? 'training' : 'cancel'} onSave={() => { setEditingOverride(null); load() }} onCancel={() => setEditingOverride(null)} onDelete={existing ? () => deleteOverride(existing.id) : undefined} />
  }

  return (
    <div>
      <PageHeader section="training" action={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setEditingOverride('new')} style={btnGhost}>Training absagen</button>
          <button onClick={() => setEditingOverride('new-extra')} style={btnPrimary}>+ Extra-Training</button>
        </div>
      } />

      <h2 className="admin-group-title">
        <span>Ausfälle & Extra-Termine<small>gehen dem Wochenplan vor</small></span>
      </h2>
      <div style={{ ...card, marginBottom: 44 }}>
        {shownOverrides.length === 0 ? <div style={empty}>Nichts geplant: Es gilt der Wochenplan</div> : shownOverrides.map((o) => (
          <ListItem
            key={o.id}
            onOpen={() => setEditingOverride(o)}
            dim={o.on_date < today}
            leading={<DateCol date={new Date(o.on_date + 'T12:00')} tone={o.type === 'cancel' ? 'danger' : undefined} />}
            title={o.type === 'cancel' ? <span style={{ color: 'var(--danger)' }}>Training fällt aus</span> : `Extra-Training ${o.time_label ?? ''}`}
            sub={[o.type === 'training' ? o.place?.de : null, o.note?.de].filter(Boolean).join(' · ') || (o.type === 'cancel' ? 'Ohne Angabe von Gründen' : undefined)}
          />
        ))}
        {past.length > 0 && (
          <button type="button" onClick={() => setShowPast((v) => !v)} style={{ ...btnGhost, border: 0, width: '100%', borderRadius: 0, padding: '14px 20px' }}>
            {showPast ? 'Vergangene ausblenden' : `Vergangene anzeigen (${past.length})`}
          </button>
        )}
      </div>

      <h2 className="admin-group-title">
        <span>Wochenplan<small>{sessions.length} Einheiten</small></span>
        <button onClick={() => setEditingSession('new')} style={btnGhost}>+ Einheit</button>
      </h2>
      <div style={card}>
        {sessions.length === 0 ? <div style={empty}>Keine Einheiten</div> : sessions.map((s) => (
          <ListItem
            key={s.id}
            onOpen={() => setEditingSession(s)}
            leading={<span className="admin-date"><b>{fullDayLabel(s.day_of_week, 'de').slice(0, 2)}</b><span>wöchentlich</span></span>}
            title={s.time_label}
            sub={`${s.place.de} · ${levelLabel(s.level, 'de')}`}
          />
        ))}
      </div>
    </div>
  )
}

function SessionForm({ session, spots, onSave, onCancel, onDelete }: { session: TrainingSession | null; spots: Spot[]; onSave: () => void; onCancel: () => void; onDelete?: () => void }) {
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
    <FormShell section="training" onDelete={onDelete} title={session ? 'Einheit bearbeiten' : 'Neue Trainingseinheit'} onCancel={onCancel} onSave={save} saving={saving} disabled={!time.trim()}>
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
        <LangColumns label="Beschreibung" optional de={<RichText value={descDe} onChange={setDescDe} placeholder="Worauf liegt der Fokus?" minHeight={120} />} en={<RichText value={descEn} onChange={setDescEn} placeholder="What's the focus?" minHeight={120} />} enValue={descEn} />
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

function OverrideForm({ override, initialType, onSave, onCancel, onDelete }: { override: CalendarOverride | null; initialType: 'training' | 'cancel'; onSave: () => void; onCancel: () => void; onDelete?: () => void }) {
  const [type, setType] = useState<'training' | 'cancel'>(override?.type ?? initialType)
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
    <FormShell section="training" onDelete={onDelete} title={override ? 'Termin bearbeiten' : type === 'cancel' ? 'Training absagen' : 'Extra-Training'} onCancel={onCancel} onSave={save} saving={saving} disabled={!date}>
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
