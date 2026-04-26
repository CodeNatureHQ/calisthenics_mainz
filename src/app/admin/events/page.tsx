'use client'

import { useEffect, useState } from 'react'
import type { Event, EventCategory } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { pageHead, crumbStyle, h1Style, card, listRow, empty, inp, fieldLabel, errorBox, btnPrimary, btnGhost, btnDanger, metaItem, chipStyle } from '../shared'
import dynamic from 'next/dynamic'
const RichText = dynamic(() => import('@/components/admin/RichText'), { ssr: false })

function autoEventId(category: string, dateStr: string): string {
  const date = dateStr ? dateStr.slice(0, 10) : ''
  return `${category}-${date}`.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
}

const CATEGORIES: EventCategory[] = ['comp', 'jam', 'workshop', 'social']

const CAT_COLORS: Record<string, { color: string; border: string }> = {
  comp:     { color: '#E6C6FF', border: 'rgba(230,198,255,0.3)' },
  jam:      { color: '#D8FF3D', border: 'rgba(216,255,61,0.3)' },
  workshop: { color: '#8EC5FF', border: 'rgba(142,197,255,0.3)' },
  social:   { color: '#FFB48E', border: 'rgba(255,180,142,0.3)' },
}

const CAT_LABELS: Record<string, string> = { comp: 'Wettkampf', jam: 'Jam', workshop: 'Workshop', social: 'Social' }

type FormState = {
  id: string; category: EventCategory; starts_at: string
  place_de: string; place_en: string
  title_de: string; title_en: string
  desc_de: string; desc_en: string
}

const emptyForm = (): FormState => ({ id: '', category: 'jam', starts_at: '', place_de: '', place_en: '', title_de: '', title_en: '', desc_de: '', desc_en: '' })

function toLocalDatetimeInput(iso: string): string {
  // Convert UTC ISO string to local datetime-local value (YYYY-MM-DDTHH:MM)
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function eventToForm(e: Event): FormState {
  return { id: e.id, category: e.category, starts_at: toLocalDatetimeInput(e.starts_at), place_de: e.place.de, place_en: e.place.en, title_de: e.title.de, title_en: e.title.en, desc_de: e.description.de, desc_en: e.description.en }
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

  const f = (key: keyof FormState, value: string) => setForm((p) => p ? { ...p, [key]: value } : p)

  async function save() {
    if (!form) return
    if (!form.starts_at) { setError('"Datum & Zeit" ist ein Pflichtfeld.'); return }
    if (!form.title_de.trim()) { setError('"Titel (DE)" ist ein Pflichtfeld.'); return }
    if (!form.place_de.trim()) { setError('"Ort (DE)" ist ein Pflichtfeld.'); return }
    setSaving(true); setError('')
    try {
      const supabase = createClient()
      // datetime-local has no timezone — parse as local time and convert to UTC ISO string
      const starts_at = form.starts_at ? new Date(form.starts_at).toISOString() : form.starts_at
      const data = { id: form.id, category: form.category, starts_at, place: { de: form.place_de, en: form.place_en }, title: { de: form.title_de, en: form.title_en }, description: { de: form.desc_de, en: form.desc_en } }
      const { error } = isNew ? await supabase.from('events').insert(data) : await supabase.from('events').update(data).eq('id', form.id)
      if (error) throw error
      setForm(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Fehler') }
    finally { setSaving(false) }
  }

  async function del(id: string) {
    if (!confirm('Löschen?')) return
    await createClient().from('events').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>02 / Content</span>
          <h1 style={h1Style}>Events</h1>
        </div>
        {!form && <button onClick={() => { setForm(emptyForm()); setIsNew(true) }} style={btnPrimary}>+ Neues Event</button>}
      </div>

      {form && (
        <div style={{ ...card, marginBottom: 20, padding: 24 }}>
          <h3 style={cardTitle}>{isNew ? 'Neues Event' : 'Event bearbeiten'}</h3>
          {error && <div style={errorBox}>{error}</div>}
          <div style={{ display: 'grid', gap: 18, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: 12, alignItems: 'end' }} className="admin-form-2col">
              <Field label="Kategorie">
                <select value={form.category} onChange={(e) => {
                  f('category', e.target.value)
                  if (isNew) f('id', autoEventId(e.target.value, form.starts_at))
                }} style={inp}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </Field>
              <Field label="Datum & Zeit">
                <input type="datetime-local" value={form.starts_at} onChange={(e) => {
                  f('starts_at', e.target.value)
                  if (isNew) f('id', autoEventId(form.category, e.target.value))
                }} style={inp} />
              </Field>
            </div>
            {isNew && form.id && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em' }}>
                ID: <span style={{ color: 'var(--accent-2)' }}>{form.id}</span>
              </div>
            )}
            <LangPair label="Titel" deValue={form.title_de} enValue={form.title_en} onDe={(v) => f('title_de', v)} onEn={(v) => f('title_en', v)} />
            <LangPair label="Ort" deValue={form.place_de} enValue={form.place_en} onDe={(v) => f('place_de', v)} onEn={(v) => f('place_en', v)} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', marginBottom: 8 }}>Beschreibung</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-lang-pair">
                {[{ val: form.desc_de, key: 'desc_de' as const, ph: 'Beschreibung (DE) …' }, { val: form.desc_en, key: 'desc_en' as const, ph: 'Description (EN) …' }].map(({ val, key, ph }) => (
                  <div key={key} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 8, right: 10, zIndex: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--fg-mute)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 999, border: '1px solid var(--line-soft)', pointerEvents: 'none' }}>
                      {key === 'desc_de' ? 'DE' : 'EN'}
                    </div>
                    <RichText value={val} onChange={(v) => f(key, v)} placeholder={ph} minHeight={80} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => setForm(null)} style={btnGhost}>Abbrechen</button>
            <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? '…' : 'Speichern'}</button>
          </div>
        </div>
      )}

      {!form && <div style={card}>
        {events.length === 0 ? (
          <div style={empty}>Keine Events</div>
        ) : events.map((ev) => {
          const cat = CAT_COLORS[ev.category]
          return (
            <div key={ev.id} style={listRow} className="admin-list-row">
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, color: 'var(--fg)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title.de}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ ...chipStyle, color: cat.color, borderColor: cat.border }}>{CAT_LABELS[ev.category]}</span>
                  <span style={metaItem}>{formatDate(ev.starts_at, 'de')}</span>
                  <span style={metaItem}>{ev.place.de}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }} className="admin-list-row-actions">
                <button onClick={() => { setForm(eventToForm(ev)); setIsNew(false) }} style={btnGhost}>Bearbeiten</button>
                <button onClick={() => del(ev.id)} style={btnDanger}>Löschen</button>
              </div>
            </div>
          )
        })}
      </div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={fieldLabel}>{label}</label>
      {children}
    </div>
  )
}

function LangPair({ label, deValue, enValue, onDe, onEn, textarea = false }: { label: string; deValue: string; enValue: string; onDe: (v: string) => void; onEn: (v: string) => void; textarea?: boolean }) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-lang-pair">
        {[{ val: deValue, cb: onDe, tag: 'DE' }, { val: enValue, cb: onEn, tag: 'EN' }].map(({ val, cb, tag }) => (
          <div key={tag} style={{ position: 'relative' }}>
            <Tag
              value={val}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => cb(e.target.value)}
              style={{ ...inp, paddingRight: 44, ...(textarea ? { minHeight: 76, resize: 'vertical' as const, lineHeight: 1.5 } : {}) }}
              rows={textarea ? 3 : undefined}
            />
            <span style={{ position: 'absolute', top: 8, right: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--fg-mute)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 999, border: '1px solid var(--line-soft)', pointerEvents: 'none' }}>{tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const cardTitle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, color: 'var(--fg)', fontWeight: 600 }
