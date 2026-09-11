'use client'

import { useEffect, useState } from 'react'
import type { Spot } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/slugify'
import dynamic from 'next/dynamic'
import { pageHead, crumbStyle, h1Style, card, listRow as sharedListRow, empty, inp, btnPrimary, btnGhost, btnDanger } from '../shared'
import { FormShell, FormSection, Field, Grid, Toggle } from '@/components/admin/Form'
import LangPair from '@/components/admin/LangPair'

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
        <FormShell title={isNew ? 'Neuer Spot' : 'Spot bearbeiten'} error={error} onCancel={cancelEdit} onSave={handleSave} saving={saving} disabled={!form.name_de.trim()}>
          <FormSection title="Name" description="So heißt der Ort auf der Webseite. Die Kurzbeschreibung steht in der Liste direkt unter dem Namen.">
            <LangPair label="Name" deValue={form.name_de} enValue={form.name_en} onDe={(v) => { f('name_de', v); if (isNew) f('id', slugify(v)) }} onEn={(v) => f('name_en', v)} placeholder={{ de: 'JGU Campus', en: 'JGU Campus' }} hint={form.id ? `Kennung: ${form.id}` : undefined} />
            <LangPair label="Kurzbeschreibung" optional deValue={form.subtitle_de} enValue={form.subtitle_en} onDe={(v) => f('subtitle_de', v)} onEn={(v) => f('subtitle_en', v)} placeholder={{ de: 'Outdoor-Anlage in der Neustadt', en: 'Outdoor park in Neustadt' }} />
            <LangPair label="Zugang" textarea rows={2} deValue={form.access_de} enValue={form.access_en} onDe={(v) => f('access_de', v)} onEn={(v) => f('access_en', v)} hint="Wer darf hin, wann ist geöffnet, gibt es Besonderheiten?" />
          </FormSection>
          <FormSection title="Ort" description="Adresse und Position auf der Karte. Der Anfahrtslink öffnet sich beim Klick auf den Pfeil neben dem Spot.">
            <Field label="Adresse">
              <input value={form.address} onChange={(e) => f('address', e.target.value)} placeholder="Saarstraße 21, 55122 Mainz" style={inp} />
            </Field>
            <Field label="Position auf der Karte" hint="Auf die Karte klicken, um den Marker zu setzen.">
              <LocationPicker lat={form.lat} lng={form.lng} onChange={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))} />
            </Field>
            <Field label="Anfahrtslink" optional hint="Ein Google-Maps-Link. Leer lassen, dann wird automatisch nach Name und Adresse gesucht.">
              <input value={form.maps_url} onChange={(e) => f('maps_url', e.target.value)} type="url" placeholder="https://maps.app.goo.gl/…" style={inp} />
            </Field>
          </FormSection>
          <FormSection title="Ausstattung" description="Erscheint als Schlagwörter unter „Ausstattung & Zugang“.">
            <Field label="Geräte" hint="Mit Komma trennen.">
              <input value={form.gear} onChange={(e) => f('gear', e.target.value)} placeholder="Klimmzugstange, Dip-Barren, Parallettes" style={inp} />
            </Field>
          </FormSection>
          <FormSection title="Anzeige">
            <Grid>
              <Field label="Kürzel" hint="Zwei bis vier Buchstaben für Listen, z. B. JGU.">
                <input value={form.glyph} onChange={(e) => f('glyph', e.target.value.toUpperCase())} maxLength={4} placeholder="JGU" style={inp} />
              </Field>
              <Field label="Reihenfolge" hint="Kleinere Zahl steht weiter oben.">
                <input type="number" value={form.sort_order} onChange={(e) => f('sort_order', e.target.value)} style={inp} />
              </Field>
            </Grid>
            <Toggle checked={form.visible} onChange={(v) => setForm(prev => ({ ...prev, visible: v }))} label={form.visible ? 'Auf der Webseite sichtbar' : 'Versteckt'} description="Versteckte Spots erscheinen weder in der Liste noch auf der Karte." />
          </FormSection>
        </FormShell>
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
                boxShadow: s.visible ? '0 0 8px color-mix(in srgb, var(--ok) 60%, transparent)' : 'none',
                transition: 'background 0.2s, box-shadow 0.2s',
              }} />
              <div style={{
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11,
                color: 'var(--accent)', background: 'var(--accent-soft)',
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
                  borderColor: s.visible ? 'color-mix(in srgb, var(--ok) 35%, transparent)' : 'var(--line)',
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
