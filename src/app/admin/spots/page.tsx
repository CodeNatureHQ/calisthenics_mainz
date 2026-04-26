'use client'

import { useEffect, useState } from 'react'
import type { Spot } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/slugify'
import dynamic from 'next/dynamic'
import { pageHead, crumbStyle, h1Style, card, formCard, listRow as sharedListRow, empty, inp, fieldLabel, errorBox, btnPrimary, btnGhost, btnDanger } from '../shared'

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false })

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
    if (!form.name_de.trim()) { setError('"Name (DE)" ist ein Pflichtfeld.'); return }
    if (!form.address.trim()) { setError('"Adresse" ist ein Pflichtfeld.'); return }
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
        maps_url: form.maps_url || (form.lat && form.lng
          ? `https://www.google.com/maps/dir/?api=1&destination=${form.lat},${form.lng}`
          : null),
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
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>04 / Content</span>
          <h1 style={h1Style}>Spots</h1>
        </div>
        {!editing && <button onClick={startNew} style={btnPrimary}>+ Neuer Spot</button>}
      </div>

      {editing !== null && (
        <div style={{ ...formCard, marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--fg)', margin: '0 0 1.5rem' }}>
            {isNew ? 'Neuer Spot' : 'Spot bearbeiten'}
          </h2>
          {error && <div style={errorBox}>{error}</div>}


          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
              {!isNew && <Field label="ID"><input value={form.id} disabled style={{ ...inputStyle, opacity: 0.5, fontFamily: 'var(--font-mono)', fontSize: 12 }} /></Field>}
              <Field label="Glyph"><input value={form.glyph} onChange={(e) => f('glyph', e.target.value)} placeholder="JGU" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} /></Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-lang-pair">
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
            <Field label="Standort auf Karte wählen">
              <LocationPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))}
              />
            </Field>
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

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button onClick={cancelEdit} style={btnGhost}>Abbrechen</button>
            <button onClick={handleSave} disabled={saving} style={btnPrimary}>{saving ? 'Speichern …' : 'Speichern'}</button>
          </div>
        </div>
      )}

      {!editing && <div style={card}>
        {spots.length === 0 ? (
          <div style={empty}>Keine Spots</div>
        ) : spots.map((s) => (
          <div key={s.id} style={{ ...sharedListRow, opacity: s.visible ? 1 : 0.5, transition: 'opacity 0.2s' }} className="admin-list-row">
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
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} className="admin-list-row-actions">
              <button
                onClick={() => toggleVisible(s)}
                title={s.visible ? 'Sichtbar — klicken zum Ausblenden' : 'Versteckt — klicken zum Einblenden'}
                style={{
                  ...btnGhost,
                  color: s.visible ? 'var(--ok)' : 'var(--fg-mute)',
                  borderColor: s.visible ? 'rgba(142,232,142,0.3)' : 'var(--line)',
                }}
              >
                {s.visible ? '● Sichtbar' : '○ Versteckt'}
              </button>
              <button onClick={() => startEdit(s)} style={btnGhost}>Bearbeiten</button>
              <button onClick={() => deleteSpot(s.id)} style={btnDanger}>Löschen</button>
            </div>
          </div>
        ))}
      </div>}
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

const inputStyle: React.CSSProperties = inp
