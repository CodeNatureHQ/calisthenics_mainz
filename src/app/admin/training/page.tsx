'use client'

import { useEffect, useState } from 'react'
import type { TrainingSession, CalendarOverride, SessionLevel, Spot } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { fullDayLabel, levelLabel, t } from '@/lib/utils'
import { pageHead, crumbStyle, h1Style, sectionHead, sectionTitle, card, formCard, listRow as sharedListRow, empty, inp, fieldLabel, errorBox, btnPrimary, btnGhost, btnDanger } from '../shared'
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
                    background: o.type === 'cancel' ? 'rgba(255,122,122,0.12)' : 'rgba(216,255,61,0.1)',
                    color: o.type === 'cancel' ? 'var(--danger)' : 'var(--accent-spark)',
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
    <div style={formCard}>
      {/* Row 1: Zeit & Level */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 16 }} className="admin-form-grid">
        <Field label="Wochentag">
          <select value={dow} onChange={(e) => setDow(Number(e.target.value))} className="admin-input" style={inputStyle}>
            {[0,1,2,3,4,5,6].map((d) => <option key={d} value={d}>{fullDayLabel(d, 'de')}</option>)}
          </select>
        </Field>
        <Field label="Uhrzeit">
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="19:15 – 21:30" className="admin-input" style={inputStyle} />
        </Field>
        <Field label="Level">
          <select value={level} onChange={(e) => setLevel(e.target.value as SessionLevel)} className="admin-input" style={inputStyle}>
            {LEVELS.map((l) => <option key={l} value={l}>{levelLabel(l, 'de')}</option>)}
          </select>
        </Field>
        <Field label="Reihenfolge">
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="admin-input" style={{ ...inputStyle, width: 72 }} />
        </Field>
      </div>

      <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 16, marginBottom: 16 }}>
        <Field label="Spot (für Kartenlink)">
          <select value={spotId} onChange={(e) => handleSpotChange(e.target.value)} className="admin-input" style={inputStyle}>
            <option value="">— Kein Spot verknüpft —</option>
            {spots.map(s => (
              <option key={s.id} value={s.id}>{s.name.de} · {s.address}</option>
            ))}
          </select>
        </Field>
      </div>

      <div style={{ marginBottom: 16 }}>
        <LangPair
          label="Ort / Location"
          deValue={placeDe} enValue={placeEn}
          onDe={setPlaceDe} onEn={setPlaceEn}
          placeholder={{ de: 'JGU Campus · Halle', en: 'JGU Campus · Gym' }}
        />
      </div>

      <div>
        <div style={fieldLabel}>Beschreibung (optional)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-lang-pair">
          {[{ val: descDe, set: setDescDe, ph: 'Worauf liegt der Fokus?', tag: 'DE' }, { val: descEn, set: setDescEn, ph: "What's the focus?", tag: 'EN' }].map(({ val, set, ph, tag }) => (
            <div key={tag} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 8, right: 10, zIndex: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--fg-mute)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 999, border: '1px solid var(--line-soft)', pointerEvents: 'none' }}>
                {tag}
              </div>
              <RichText value={val} onChange={set} placeholder={ph} minHeight={80} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
        <button onClick={onCancel} style={btnGhost}>Abbrechen</button>
        <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? '…' : 'Speichern'}</button>
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
    <div style={formCard}>
      {/* Typ & Datum */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }} className="admin-form-grid">
        <Field label="Typ">
          <select value={type} onChange={(e) => setType(e.target.value as 'training' | 'cancel')} className="admin-input" style={inputStyle}>
            <option value="cancel">Ausfall</option>
            <option value="training">Extra-Training</option>
          </select>
        </Field>
        <Field label="Datum">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="admin-input" style={inputStyle} />
        </Field>
      </div>

      {/* Extra-Training Felder */}
      {type === 'training' && (
        <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 16, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Field label="Uhrzeit">
              <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="11:00 – 13:00" className="admin-input" style={inputStyle} />
            </Field>
            <Field label="Level">
              <select value={level} onChange={(e) => setLevel(e.target.value as SessionLevel)} className="admin-input" style={inputStyle}>
                {LEVELS.map((l) => <option key={l} value={l}>{levelLabel(l, 'de')}</option>)}
              </select>
            </Field>
          </div>
          <LangPair
            label="Ort / Location"
            deValue={placeDe} enValue={placeEn}
            onDe={setPlaceDe} onEn={setPlaceEn}
            placeholder={{ de: 'Volkspark Mainz', en: 'Volkspark Mainz' }}
          />
        </div>
      )}

      {/* Notiz */}
      <div style={{ borderTop: type === 'training' ? 'none' : '1px solid var(--line-soft)', paddingTop: type === 'training' ? 0 : 16 }}>
        <LangPair
          label="Notiz (optional)"
          deValue={noteDe} enValue={noteEn}
          onDe={setNoteDe} onEn={setNoteEn}
          placeholder={{ de: 'z.B. Feiertag — kein Training', en: 'e.g. Public holiday — no session' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
        <button onClick={onCancel} style={btnGhost}>Abbrechen</button>
        <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? '…' : 'Speichern'}</button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      {children}
    </div>
  )
}

function LangPair({ label, deValue, enValue, onDe, onEn, textarea = false, rows = 3, placeholder }: {
  label: string; deValue: string; enValue: string
  onDe: (v: string) => void; onEn: (v: string) => void
  textarea?: boolean; rows?: number; placeholder?: { de?: string; en?: string }
}) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div>
      <div style={fieldLabel}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-lang-pair">
        {[{ val: deValue, cb: onDe, tag: 'DE', ph: placeholder?.de }, { val: enValue, cb: onEn, tag: 'EN', ph: placeholder?.en }].map(({ val, cb, tag, ph }) => (
          <div key={tag} style={{ position: 'relative' }}>
            <Tag
              value={val}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => cb(e.target.value)}
              placeholder={ph}
              style={{ ...inputStyle, paddingRight: 44, ...(textarea ? { minHeight: 76, resize: 'vertical' as const, lineHeight: 1.5 } : {}) }}
              rows={textarea ? rows : undefined}
            />
            <span style={{ position: 'absolute', top: 8, right: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--fg-mute)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 999, border: '1px solid var(--line-soft)', pointerEvents: 'none' }}>{tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = inp
