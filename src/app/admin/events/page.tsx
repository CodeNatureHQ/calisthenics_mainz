'use client'

import { useEffect, useState } from 'react'
import type { Event, EventCategory } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { categoryLabel, categoryColor, formatDate } from '@/lib/utils'

const CATEGORIES: EventCategory[] = ['comp', 'jam', 'workshop', 'social']

type FormState = {
  id: string
  category: EventCategory
  starts_at: string
  place_de: string
  place_en: string
  title_de: string
  title_en: string
  desc_de: string
  desc_en: string
}

const emptyForm = (): FormState => ({
  id: '',
  category: 'jam',
  starts_at: '',
  place_de: '',
  place_en: '',
  title_de: '',
  title_en: '',
  desc_de: '',
  desc_en: '',
})

function eventToForm(e: Event): FormState {
  return {
    id: e.id,
    category: e.category,
    starts_at: e.starts_at.slice(0, 16),
    place_de: e.place.de,
    place_en: e.place.en,
    title_de: e.title.de,
    title_en: e.title.en,
    desc_de: e.description.de,
    desc_en: e.description.en,
  }
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [form, setForm] = useState<FormState | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('events').select('*').order('starts_at', { ascending: false })
    setEvents(data ?? [])
  }

  useEffect(() => { load() }, [])

  function startNew() {
    setForm(emptyForm())
    setIsNew(true)
    setError('')
  }

  function startEdit(e: Event) {
    setForm(eventToForm(e))
    setIsNew(false)
    setError('')
  }

  function cancelForm() {
    setForm(null)
    setIsNew(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Event wirklich löschen?')) return
    const supabase = createClient()
    await supabase.from('events').delete().eq('id', id)
    load()
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const data = {
        id: form.id,
        category: form.category,
        starts_at: form.starts_at,
        place: { de: form.place_de, en: form.place_en },
        title: { de: form.title_de, en: form.title_en },
        description: { de: form.desc_de, en: form.desc_en },
      }
      if (isNew) {
        const { error } = await supabase.from('events').insert(data)
        if (error) throw error
      } else {
        const { error } = await supabase.from('events').update(data).eq('id', form.id)
        if (error) throw error
      }
      setForm(null)
      load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler')
    } finally {
      setSaving(false)
    }
  }

  const f = (key: keyof FormState, value: string) => setForm((prev) => prev ? { ...prev, [key]: value } : prev)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={pageTitle}>Events</h1>
        {!form && (
          <button onClick={startNew} style={primaryBtnStyle}>
            + Neues Event
          </button>
        )}
      </div>

      {form && (
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--fg)', margin: '0 0 1.5rem' }}>
            {isNew ? 'Neues Event' : 'Event bearbeiten'}
          </h2>

          {error && <div style={errorBox}>{error}</div>}

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
              <Field label="Slug / ID">
                <input value={form.id} onChange={(e) => f('id', e.target.value)} disabled={!isNew} style={{ ...inputStyle, opacity: isNew ? 1 : 0.6 }} />
              </Field>
              <Field label="Kategorie">
                <select value={form.category} onChange={(e) => f('category', e.target.value)} style={inputStyle}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{categoryLabel(c, 'de')}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Datum & Uhrzeit">
              <input type="datetime-local" value={form.starts_at} onChange={(e) => f('starts_at', e.target.value)} style={inputStyle} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Titel (DE)"><input value={form.title_de} onChange={(e) => f('title_de', e.target.value)} style={inputStyle} /></Field>
              <Field label="Title (EN)"><input value={form.title_en} onChange={(e) => f('title_en', e.target.value)} style={inputStyle} /></Field>
              <Field label="Ort (DE)"><input value={form.place_de} onChange={(e) => f('place_de', e.target.value)} style={inputStyle} /></Field>
              <Field label="Place (EN)"><input value={form.place_en} onChange={(e) => f('place_en', e.target.value)} style={inputStyle} /></Field>
              <Field label="Beschreibung (DE)"><textarea value={form.desc_de} onChange={(e) => f('desc_de', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></Field>
              <Field label="Description (EN)"><textarea value={form.desc_en} onChange={(e) => f('desc_en', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></Field>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button onClick={cancelForm} style={secondaryBtnStyle}>Abbrechen</button>
            <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>{saving ? 'Speichern …' : 'Speichern'}</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {events.map((ev) => (
          <div key={ev.id} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: categoryColor(ev.category), flexShrink: 0, display: 'inline-block' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--fg)', fontSize: '0.9375rem' }}>{ev.title.de}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fg-dim)', marginTop: 2 }}>
                {formatDate(ev.starts_at, 'de')} · {ev.place.de}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => startEdit(ev)} style={secondaryBtnStyle}>Bearbeiten</button>
              <button onClick={() => handleDelete(ev.id)} style={dangerBtnStyle}>Löschen</button>
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
