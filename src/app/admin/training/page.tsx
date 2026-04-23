'use client'

import { useEffect, useState } from 'react'
import type { TrainingSession, CalendarOverride, SessionLevel } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { fullDayLabel, levelLabel } from '@/lib/utils'

const LEVELS: SessionLevel[] = ['beginner', 'advanced', 'open', 'comp', 'training']

export default function AdminTrainingPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [overrides, setOverrides] = useState<CalendarOverride[]>([])
  const [editingSession, setEditingSession] = useState<TrainingSession | null | 'new'>(null)
  const [editingOverride, setEditingOverride] = useState<CalendarOverride | null | 'new'>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const supabase = createClient()
    const [{ data: s }, { data: o }] = await Promise.all([
      supabase.from('training_sessions').select('*').order('sort_order'),
      supabase.from('calendar_overrides').select('*').order('on_date'),
    ])
    setSessions(s ?? [])
    setOverrides(o ?? [])
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
      <h1 style={pageTitle}>Training</h1>

      {/* ---- Sessions ---- */}
      <section style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={sectionTitle}>Wochenplan</h2>
          <button onClick={() => setEditingSession('new')} style={primaryBtnStyle}>+ Hinzufügen</button>
        </div>

        {editingSession !== null && (
          <SessionForm
            session={editingSession === 'new' ? null : editingSession}
            onSave={() => { setEditingSession(null); load() }}
            onCancel={() => setEditingSession(null)}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sessions.map((s) => (
            <div key={s.id} style={listRow}>
              <div>
                <span style={badge}>{fullDayLabel(s.day_of_week, 'de')}</span>
                <span style={{ fontWeight: 600, color: 'var(--fg)', marginLeft: '0.75rem', fontSize: '0.9375rem' }}>
                  {s.time_label}
                </span>
                <span style={{ color: 'var(--fg-dim)', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>
                  · {s.place.de} · {levelLabel(s.level, 'de')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setEditingSession(s)} style={secondaryBtnStyle}>Bearbeiten</button>
                <button onClick={() => deleteSession(s.id)} style={dangerBtnStyle}>Löschen</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Overrides ---- */}
      <section style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={sectionTitle}>Einmaltermine & Ausfälle</h2>
          <button onClick={() => setEditingOverride('new')} style={primaryBtnStyle}>+ Hinzufügen</button>
        </div>

        {editingOverride !== null && (
          <OverrideForm
            override={editingOverride === 'new' ? null : editingOverride}
            onSave={() => { setEditingOverride(null); load() }}
            onCancel={() => setEditingOverride(null)}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {overrides.map((o) => (
            <div key={o.id} style={listRow}>
              <div>
                <span
                  style={{
                    ...badge,
                    background: o.type === 'cancel' ? 'rgba(239,68,68,0.12)' : 'var(--accent-soft)',
                    color: o.type === 'cancel' ? 'var(--danger)' : 'var(--accent)',
                  }}
                >
                  {o.type === 'cancel' ? 'Ausfall' : 'Extra'}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--fg)', marginLeft: '0.75rem', fontSize: '0.9375rem' }}>
                  {o.on_date}
                </span>
                {o.note && (
                  <span style={{ color: 'var(--fg-dim)', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>
                    · {o.note.de}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setEditingOverride(o)} style={secondaryBtnStyle}>Bearbeiten</button>
                <button onClick={() => deleteOverride(o.id)} style={dangerBtnStyle}>Löschen</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SessionForm({ session, onSave, onCancel }: { session: TrainingSession | null; onSave: () => void; onCancel: () => void }) {
  const [dow, setDow] = useState(session?.day_of_week ?? 0)
  const [time, setTime] = useState(session?.time_label ?? '')
  const [placeDe, setPlaceDe] = useState(session?.place?.de ?? '')
  const [placeEn, setPlaceEn] = useState(session?.place?.en ?? '')
  const [level, setLevel] = useState<SessionLevel>(session?.level ?? 'open')
  const [sortOrder, setSortOrder] = useState(session?.sort_order ?? 0)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const data = { day_of_week: dow, time_label: time, place: { de: placeDe, en: placeEn }, level, sort_order: sortOrder }
    if (session) {
      await supabase.from('training_sessions').update(data).eq('id', session.id)
    } else {
      await supabase.from('training_sessions').insert(data)
    }
    setSaving(false)
    onSave()
  }

  return (
    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <Field label="Wochentag">
          <select value={dow} onChange={(e) => setDow(Number(e.target.value))} style={inputStyle}>
            {[0,1,2,3,4,5,6].map((d) => <option key={d} value={d}>{fullDayLabel(d, 'de')}</option>)}
          </select>
        </Field>
        <Field label="Uhrzeit">
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="19:15 – 21:30" style={inputStyle} />
        </Field>
        <Field label="Level">
          <select value={level} onChange={(e) => setLevel(e.target.value as SessionLevel)} style={inputStyle}>
            {LEVELS.map((l) => <option key={l} value={l}>{levelLabel(l, 'de')}</option>)}
          </select>
        </Field>
        <Field label="Ort (DE)">
          <input value={placeDe} onChange={(e) => setPlaceDe(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Place (EN)">
          <input value={placeEn} onChange={(e) => setPlaceEn(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Reihenfolge">
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} style={{ ...inputStyle, width: 80 }} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={onCancel} style={secondaryBtnStyle}>Abbrechen</button>
        <button onClick={save} disabled={saving} style={primaryBtnStyle}>{saving ? '…' : 'Speichern'}</button>
      </div>
    </div>
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
    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <Field label="Typ">
          <select value={type} onChange={(e) => setType(e.target.value as 'training' | 'cancel')} style={inputStyle}>
            <option value="cancel">Ausfall</option>
            <option value="training">Extra-Training</option>
          </select>
        </Field>
        <Field label="Datum">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </Field>
        {type === 'training' && (
          <>
            <Field label="Uhrzeit">
              <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="11:00 – 13:00" style={inputStyle} />
            </Field>
            <Field label="Level">
              <select value={level} onChange={(e) => setLevel(e.target.value as SessionLevel)} style={inputStyle}>
                {LEVELS.map((l) => <option key={l} value={l}>{levelLabel(l, 'de')}</option>)}
              </select>
            </Field>
            <Field label="Ort (DE)">
              <input value={placeDe} onChange={(e) => setPlaceDe(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Place (EN)">
              <input value={placeEn} onChange={(e) => setPlaceEn(e.target.value)} style={inputStyle} />
            </Field>
          </>
        )}
        <Field label="Notiz (DE)">
          <input value={noteDe} onChange={(e) => setNoteDe(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Note (EN)">
          <input value={noteEn} onChange={(e) => setNoteEn(e.target.value)} style={inputStyle} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={onCancel} style={secondaryBtnStyle}>Abbrechen</button>
        <button onClick={save} disabled={saving} style={primaryBtnStyle}>{saving ? '…' : 'Speichern'}</button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg-dim)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  )
}

const pageTitle: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 700, color: 'var(--fg)', margin: 0, letterSpacing: '-0.02em' }
const sectionTitle: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, color: 'var(--fg)', margin: 0 }
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--fg)', fontSize: '0.875rem', padding: '0.5625rem 0.75rem', outline: 'none', fontFamily: 'inherit' }
const primaryBtnStyle: React.CSSProperties = { background: 'var(--accent)', color: '#0a0a0b', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer' }
const secondaryBtnStyle: React.CSSProperties = { background: 'var(--bg-elev-2)', color: 'var(--fg-muted)', fontWeight: 500, fontSize: '0.8125rem', padding: '0.375rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer' }
const dangerBtnStyle: React.CSSProperties = { background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', fontWeight: 500, fontSize: '0.8125rem', padding: '0.375rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }
const listRow: React.CSSProperties = { background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }
const badge: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', borderRadius: 4, padding: '1px 6px' }
