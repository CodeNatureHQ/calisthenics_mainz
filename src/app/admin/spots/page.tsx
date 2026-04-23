'use client'

import { useEffect, useState } from 'react'
import type { Spot } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/slugify'

export default function AdminSpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [editing, setEditing] = useState<Spot | null | 'new'>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  type FormState = {
    id: string; glyph: string; map_x: string; map_y: string
    lat: string; lng: string; label_anchor: 'left' | 'right'
    name_de: string; name_en: string; subtitle_de: string; subtitle_en: string
    address: string; access_de: string; access_en: string
    gear: string; maps_url: string; sort_order: string; visible: boolean
  }

  const emptyForm = (): FormState => ({
    id: '', glyph: '', map_x: '400', map_y: '280', lat: '', lng: '',
    label_anchor: 'right', name_de: '', name_en: '', subtitle_de: '', subtitle_en: '',
    address: '', access_de: 'Öffentlich zugänglich', access_en: 'Publicly accessible',
    gear: '', maps_url: '', sort_order: '0', visible: true,
  })

  const spotToForm = (s: Spot): FormState => ({
    id: s.id, glyph: s.glyph, map_x: String(s.map_x), map_y: String(s.map_y),
    lat: s.lat != null ? String(s.lat) : '', lng: s.lng != null ? String(s.lng) : '',
    label_anchor: s.label_anchor, name_de: s.name.de, name_en: s.name.en,
    subtitle_de: s.subtitle.de, subtitle_en: s.subtitle.en,
    address: s.address, access_de: s.access.de, access_en: s.access.en,
    gear: s.gear.join(', '), maps_url: s.maps_url ?? '', sort_order: String(s.sort_order),
    visible: s.visible,
  })

  const [form, setForm] = useState<FormState>(emptyForm())
  const isNew = editing === 'new'

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('spots').select('*').order('sort_order')
    setSpots(data ?? [])
  }

  useEffect(() => { load() }, [])

  function startNew() { setForm(emptyForm()); setEditing('new'); setError('') }
  function startEdit(s: Spot) { setForm(spotToForm(s)); setEditing(s); setError('') }
  function cancelEdit() { setEditing(null) }

  async function deleteSpot(id: string) {
    if (!confirm('Löschen?')) return
    const supabase = createClient()
    await supabase.from('spots').delete().eq('id', id)
    load()
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const data = {
        id: form.id,
        glyph: form.glyph,
        map_x: parseInt(form.map_x) || 400,
        map_y: parseInt(form.map_y) || 280,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        label_anchor: form.label_anchor,
        name: { de: form.name_de, en: form.name_en },
        subtitle: { de: form.subtitle_de, en: form.subtitle_en },
        address: form.address,
        access: { de: form.access_de, en: form.access_en },
        gear: form.gear.split(',').map((g) => g.trim()).filter(Boolean),
        maps_url: form.maps_url || null,
        sort_order: parseInt(form.sort_order) || 0,
        visible: form.visible,
        images: [],
      }
      if (isNew) {
        const { error } = await supabase.from('spots').insert(data)
        if (error) throw error
      } else {
        const { error } = await supabase.from('spots').update(data).eq('id', (editing as Spot).id)
        if (error) throw error
      }
      setEditing(null)
      load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler')
    } finally {
      setSaving(false)
    }
  }

  const f = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  async function toggleVisible(spot: Spot) {
    await createClient().from('spots').update({ visible: !spot.visible }).eq('id', spot.id)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={pageTitle}>Spots</h1>
        {!editing && <button onClick={startNew} style={primaryBtnStyle}>+ Neuer Spot</button>}
      </div>

      {editing !== null && (
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--fg)', margin: '0 0 1.5rem' }}>
            {isNew ? 'Neuer Spot' : 'Spot bearbeiten'}
          </h2>
          {error && <div style={errorBox}>{error}</div>}

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
              {!isNew && <Field label="ID"><input value={form.id} disabled style={{ ...inputStyle, opacity: 0.5, fontFamily: 'var(--font-mono)', fontSize: 12 }} /></Field>}
              <Field label="Glyph"><input value={form.glyph} onChange={(e) => f('glyph', e.target.value)} placeholder="JGU" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} /></Field>
              <Field label="Label anchor">
                <select value={form.label_anchor} onChange={(e) => f('label_anchor', e.target.value)} style={inputStyle}>
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
              </Field>
              <Field label="Lat (Breitengrad)"><input value={form.lat} onChange={(e) => f('lat', e.target.value)} placeholder="49.9927" style={inputStyle} /></Field>
              <Field label="Lng (Längengrad)"><input value={form.lng} onChange={(e) => f('lng', e.target.value)} placeholder="8.2297" style={inputStyle} /></Field>
              <Field label="Sort"><input type="number" value={form.sort_order} onChange={(e) => f('sort_order', e.target.value)} style={{ ...inputStyle, width: 80 }} /></Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Name (DE)">
                <input value={form.name_de} onChange={(e) => {
                  f('name_de', e.target.value)
                  if (isNew) f('id', slugify(e.target.value))
                }} style={inputStyle} />
                {isNew && form.id && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-2)', letterSpacing: '0.06em', marginTop: 4 }}>
                    ID: {form.id}
                  </div>
                )}
              </Field>
              <Field label="Name (EN)"><input value={form.name_en} onChange={(e) => f('name_en', e.target.value)} style={inputStyle} /></Field>
              <Field label="Subtitle (DE)"><input value={form.subtitle_de} onChange={(e) => f('subtitle_de', e.target.value)} style={inputStyle} /></Field>
              <Field label="Subtitle (EN)"><input value={form.subtitle_en} onChange={(e) => f('subtitle_en', e.target.value)} style={inputStyle} /></Field>
              <Field label="Zugang (DE)"><input value={form.access_de} onChange={(e) => f('access_de', e.target.value)} style={inputStyle} /></Field>
              <Field label="Access (EN)"><input value={form.access_en} onChange={(e) => f('access_en', e.target.value)} style={inputStyle} /></Field>
            </div>

            <Field label="Adresse"><input value={form.address} onChange={(e) => f('address', e.target.value)} style={inputStyle} /></Field>
            <Field label="Equipment (kommagetrennt)"><input value={form.gear} onChange={(e) => f('gear', e.target.value)} placeholder="Pull-up, Dips, Parallettes" style={inputStyle} /></Field>
            <Field label="Google Maps URL"><input value={form.maps_url} onChange={(e) => f('maps_url', e.target.value)} type="url" style={inputStyle} /></Field>
            <Field label="Sichtbarkeit">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8 }}>
                <input
                  type="checkbox" checked={form.visible}
                  onChange={(e) => setForm(prev => ({ ...prev, visible: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--ok)', flexShrink: 0 }}
                />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: form.visible ? 'var(--ok)' : 'var(--fg-mute)' }}>
                  {form.visible ? 'Auf der Karte sichtbar' : 'Versteckt (nicht auf Karte)'}
                </span>
              </label>
            </Field>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button onClick={cancelEdit} style={secondaryBtnStyle}>Abbrechen</button>
            <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>{saving ? 'Speichern …' : 'Speichern'}</button>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderRadius: 14, overflow: 'hidden' }}>
        {spots.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Keine Spots</div>
        ) : spots.map((s) => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '1fr auto',
            gap: 16, padding: '16px 20px',
            borderBottom: '1px solid var(--line-soft)',
            alignItems: 'center',
            opacity: s.visible ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}>
            <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Visibility indicator */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: s.visible ? 'var(--ok)' : 'var(--fg-mute)',
                boxShadow: s.visible ? '0 0 8px rgba(142,232,142,0.6)' : 'none',
                transition: 'background 0.2s, box-shadow 0.2s',
              }} />
              <div style={{
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11,
                color: 'var(--accent-spark)', background: 'rgba(216,255,61,0.1)',
                borderRadius: 6, padding: '3px 8px', flexShrink: 0,
              }}>{s.glyph}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: 'var(--fg)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name.de}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', marginTop: 2, letterSpacing: '0.06em' }}>{s.address}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Visibility toggle */}
              <button
                onClick={() => toggleVisible(s)}
                title={s.visible ? 'Auf Karte sichtbar — klicken zum Ausblenden' : 'Versteckt — klicken zum Einblenden'}
                style={{
                  padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
                  background: s.visible ? 'rgba(142,232,142,0.1)' : 'var(--bg-3)',
                  color: s.visible ? 'var(--ok)' : 'var(--fg-mute)',
                  border: s.visible ? '1px solid rgba(142,232,142,0.3)' : '1px solid var(--line)',
                  transition: 'all 0.2s',
                }}
              >
                {s.visible ? '● Sichtbar' : '○ Versteckt'}
              </button>
              <button onClick={() => startEdit(s)} style={secondaryBtnStyle}>Bearbeiten</button>
              <button onClick={() => deleteSpot(s.id)} style={dangerBtnStyle}>Löschen</button>
            </div>
          </div>
        ))}
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
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--fg)', fontSize: '0.875rem', padding: '0.5625rem 0.75rem', outline: 'none', fontFamily: 'inherit' }
const primaryBtnStyle: React.CSSProperties = { background: 'var(--accent)', color: '#0a0a0b', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer' }
const secondaryBtnStyle: React.CSSProperties = { background: 'var(--bg-elev-2)', color: 'var(--fg-muted)', fontWeight: 500, fontSize: '0.8125rem', padding: '0.375rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer' }
const dangerBtnStyle: React.CSSProperties = { background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', fontWeight: 500, fontSize: '0.8125rem', padding: '0.375rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }
const errorBox: React.CSSProperties = { color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.08)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.2)' }
