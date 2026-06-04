'use client'

import { useEffect, useState } from 'react'
import type { Event, EventCategory, RecurringEvent } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { formatDate, dayLabel } from '@/lib/utils'
import { pageHead, crumbStyle, h1Style, card, listRow, empty, inp, fieldLabel, errorBox, btnPrimary, btnGhost, btnDanger, metaItem, chipStyle } from '../shared'
import dynamic from 'next/dynamic'
const RichText = dynamic(() => import('@/components/admin/RichText'), { ssr: false })

function autoEventId(category: string, dateStr: string): string {
  const date = dateStr ? dateStr.slice(0, 10) : ''
  return `${category}-${date}`.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
}

const CATEGORIES: EventCategory[] = ['comp', 'jam', 'workshop', 'social']

const CAT_COLORS: Record<string, { color: string; border: string }> = {
  comp:     { color: '#D97757', border: 'rgba(217,119,87,0.3)' },
  jam:      { color: '#D8FF3D', border: 'rgba(216,255,61,0.3)' },
  workshop: { color: '#8EC5FF', border: 'rgba(142,197,255,0.3)' },
  social:   { color: '#FFB48E', border: 'rgba(255,180,142,0.3)' },
}

const CAT_LABELS: Record<string, string> = { comp: 'Wettkampf', jam: 'Jam', workshop: 'Workshop', social: 'Social' }

const WEEK_LABELS: Record<number, string> = { 1: '1. (1.–7.)', 2: '2. (8.–14.)', 3: '3. (15.–21.)', 4: '4. (22.–28.)', 5: '5. (29.–31.)' }

type RegistrationMember = {
  id: string; registration_id: string; name: string; email: string | null; sort_order: number
}

type Registration = {
  id: string; event_id: string; type: 'team' | 'individual'
  name: string | null; email: string | null; team_name: string | null
  created_at: string
  event_registration_members: RegistrationMember[]
}

type FormState = {
  id: string; category: EventCategory; starts_at: string
  place_de: string; place_en: string
  title_de: string; title_en: string
  desc_de: string; desc_en: string
  registration_mode: string
  registration_max_team_size: number
  image_url: string | null
}

type RecurringFormState = {
  id: string; category: EventCategory
  day_of_week: number; week_of_month: number
  time_label: string
  place_de: string; place_en: string
  title_de: string; title_en: string
  desc_de: string; desc_en: string
  sort_order: number
}

const emptyForm = (): FormState => ({ id: '', category: 'jam', starts_at: '', place_de: '', place_en: '', title_de: '', title_en: '', desc_de: '', desc_en: '', registration_mode: 'none', registration_max_team_size: 4, image_url: null })
const emptyRecurringForm = (): RecurringFormState => ({ id: '', category: 'social', day_of_week: 0, week_of_month: 1, time_label: '', place_de: '', place_en: '', title_de: '', title_en: '', desc_de: '', desc_en: '', sort_order: 0 })

function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function eventToForm(e: Event): FormState {
  return { id: e.id, category: e.category, starts_at: toLocalDatetimeInput(e.starts_at), place_de: e.place.de, place_en: e.place.en, title_de: e.title.de, title_en: e.title.en, desc_de: e.description.de, desc_en: e.description.en, registration_mode: e.registration_mode ?? 'none', registration_max_team_size: e.registration_max_team_size ?? 4, image_url: e.image_url ?? null }
}

function recurringToForm(re: RecurringEvent): RecurringFormState {
  return { id: re.id, category: re.category, day_of_week: re.day_of_week, week_of_month: re.week_of_month, time_label: re.time_label, place_de: re.place.de, place_en: re.place.en, title_de: re.title.de, title_en: re.title.en, desc_de: re.description.de, desc_en: re.description.en, sort_order: re.sort_order }
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [form, setForm] = useState<FormState | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [recurringEvents, setRecurringEvents] = useState<RecurringEvent[]>([])
  const [recurringForm, setRecurringForm] = useState<RecurringFormState | null>(null)
  const [recurringIsNew, setRecurringIsNew] = useState(false)
  const [recurringSaving, setRecurringSaving] = useState(false)
  const [recurringError, setRecurringError] = useState('')

  const [regCounts, setRegCounts] = useState<Record<string, number>>({})
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [regsLoading, setRegsLoading] = useState(false)
  const [regsError, setRegsError] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('events').select('*').order('starts_at', { ascending: false })
    setEvents(data ?? [])
  }

  async function loadRegCounts() {
    const supabase = createClient()
    const { data } = await supabase.from('event_registrations').select('event_id')
    const map: Record<string, number> = {}
    data?.forEach((r: { event_id: string }) => { map[r.event_id] = (map[r.event_id] ?? 0) + 1 })
    setRegCounts(map)
  }

  async function expandRegistrations(eventId: string) {
    if (expandedEventId === eventId) { setExpandedEventId(null); return }
    setExpandedEventId(eventId); setRegsLoading(true); setRegsError(null)
    const supabase = createClient()
    const [{ data: regsData, error: regsErr }, { data: countData }] = await Promise.all([
      supabase.from('event_registrations').select('*, event_registration_members(*)').eq('event_id', eventId).order('created_at'),
      supabase.from('event_registrations').select('event_id'),
    ])
    if (regsErr) setRegsError(`${regsErr.code}: ${regsErr.message}`)
    setRegistrations((regsData as Registration[]) ?? [])
    const map: Record<string, number> = {}
    countData?.forEach((r: { event_id: string }) => { map[r.event_id] = (map[r.event_id] ?? 0) + 1 })
    setRegCounts(map)
    setRegsLoading(false)
  }

  async function handleEventImageUpload(file: File) {
    setImageUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${form?.id || 'draft'}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('event-images').upload(path, file, { upsert: true })
    if (uploadError) { setError(uploadError.message); setImageUploading(false); return }
    const { data } = supabase.storage.from('event-images').getPublicUrl(path)
    setForm((p) => p ? { ...p, image_url: data.publicUrl } : p)
    setImageUploading(false)
  }

  async function deleteRegistration(regId: string) {
    if (!confirm('Anmeldung löschen?')) return
    await createClient().from('event_registrations').delete().eq('id', regId)
    setRegistrations((prev) => prev.filter((r) => r.id !== regId))
    if (expandedEventId) {
      setRegCounts((prev) => ({ ...prev, [expandedEventId]: Math.max(0, (prev[expandedEventId] ?? 1) - 1) }))
    }
  }

  async function loadRecurring() {
    const supabase = createClient()
    const { data } = await supabase.from('recurring_events').select('*').order('sort_order')
    setRecurringEvents(data ?? [])
  }

  useEffect(() => { load(); loadRecurring(); loadRegCounts() }, [])

  const f = (key: keyof FormState, value: string) => setForm((p) => p ? { ...p, [key]: value } : p)
  const rf = <K extends keyof RecurringFormState>(key: K, value: RecurringFormState[K]) =>
    setRecurringForm((p) => p ? { ...p, [key]: value } : p)

  async function save() {
    if (!form) return
    if (!form.starts_at) { setError('"Datum & Zeit" ist ein Pflichtfeld.'); return }
    if (!form.title_de.trim()) { setError('"Titel (DE)" ist ein Pflichtfeld.'); return }
    if (!form.place_de.trim()) { setError('"Ort (DE)" ist ein Pflichtfeld.'); return }
    setSaving(true); setError('')
    try {
      const supabase = createClient()
      const starts_at = form.starts_at ? new Date(form.starts_at).toISOString() : form.starts_at
      const hasTeams = form.registration_mode === 'team' || form.registration_mode === 'both'
      const data = { id: form.id, category: form.category, starts_at, place: { de: form.place_de, en: form.place_en }, title: { de: form.title_de, en: form.title_en }, description: { de: form.desc_de, en: form.desc_en }, registration_mode: form.registration_mode, registration_max_team_size: hasTeams ? form.registration_max_team_size : null, image_url: form.image_url || null }
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

  async function saveRecurring() {
    if (!recurringForm) return
    if (!recurringForm.title_de.trim()) { setRecurringError('"Titel (DE)" ist ein Pflichtfeld.'); return }
    setRecurringSaving(true); setRecurringError('')
    try {
      const supabase = createClient()
      const data = {
        category: recurringForm.category,
        day_of_week: recurringForm.day_of_week,
        week_of_month: recurringForm.week_of_month,
        time_label: recurringForm.time_label,
        place: { de: recurringForm.place_de, en: recurringForm.place_en },
        title: { de: recurringForm.title_de, en: recurringForm.title_en },
        description: { de: recurringForm.desc_de, en: recurringForm.desc_en },
        sort_order: recurringForm.sort_order,
      }
      const { error } = recurringIsNew
        ? await supabase.from('recurring_events').insert(data)
        : await supabase.from('recurring_events').update(data).eq('id', recurringForm.id)
      if (error) throw error
      setRecurringForm(null); loadRecurring()
    } catch (e: unknown) { setRecurringError(e instanceof Error ? e.message : 'Fehler') }
    finally { setRecurringSaving(false) }
  }

  async function delRecurring(id: string) {
    if (!confirm('Löschen?')) return
    await createClient().from('recurring_events').delete().eq('id', id)
    loadRecurring()
  }

  return (
    <div>
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>02 / Content</span>
          <h1 style={h1Style}>Events</h1>
        </div>
        {!form && !recurringForm && (
          <button onClick={() => { setForm(emptyForm()); setIsNew(true) }} style={btnPrimary}>+ Neues Event</button>
        )}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: 12, alignItems: 'end' }} className="admin-form-2col">
              <Field label="Anmeldung">
                <select value={form.registration_mode} onChange={(e) => f('registration_mode', e.target.value)} style={inp}>
                  <option value="none">Keine</option>
                  <option value="individual">Nur Einzelpersonen</option>
                  <option value="team">Nur Teams</option>
                  <option value="both">Teams &amp; Einzelpersonen</option>
                </select>
              </Field>
              {(form.registration_mode === 'team' || form.registration_mode === 'both') && (
                <Field label="Max. Teamgröße">
                  <input
                    type="number" min={2} max={20}
                    value={form.registration_max_team_size}
                    onChange={(e) => setForm((p) => p ? { ...p, registration_max_team_size: Number(e.target.value) } : p)}
                    style={inp}
                  />
                </Field>
              )}
            </div>
            {/* Image upload */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', marginBottom: 8 }}>Bild</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {form.image_url && (
                  <div style={{ flexShrink: 0, position: 'relative' }}>
                    <img src={form.image_url} alt="" style={{ width: 140, height: 84, objectFit: 'cover', borderRadius: 8, display: 'block', border: '1px solid var(--line-soft)' }} />
                    <button
                      onClick={() => setForm((p) => p ? { ...p, image_url: null } : p)}
                      style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--line)', color: 'var(--fg-mute)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, lineHeight: 1 }}
                    >✕</button>
                  </div>
                )}
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: '1px solid var(--line)', cursor: imageUploading ? 'wait' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-dim)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                  {imageUploading ? 'Hochladen …' : 'Bild hochladen'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} disabled={imageUploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleEventImageUpload(file); e.target.value = '' }} />
                </label>
                {form.image_url && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', alignSelf: 'center', letterSpacing: '0.04em' }}>Wird in Ankündigung angezeigt</div>}
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
          const isExpanded = expandedEventId === ev.id
          const count = regCounts[ev.id] ?? 0
          return (
            <div key={ev.id}>
              <div style={listRow} className="admin-list-row">
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
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} className="admin-list-row-actions">
                  <button
                    onClick={() => expandRegistrations(ev.id)}
                    style={{
                      ...btnGhost,
                      color: isExpanded ? 'var(--accent-2)' : count > 0 ? 'var(--fg-dim)' : 'var(--fg-mute)',
                      borderColor: isExpanded ? 'var(--accent-2)' : 'var(--line)',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, minWidth: 14, textAlign: 'center' }}>{count}</span>
                    Anmeldungen
                    <span style={{ fontSize: 9, marginLeft: 2 }}>{isExpanded ? '▲' : '▼'}</span>
                  </button>
                  <button onClick={() => { setForm(eventToForm(ev)); setIsNew(false) }} style={btnGhost}>Bearbeiten</button>
                  <button onClick={() => del(ev.id)} style={btnDanger}>Löschen</button>
                </div>
              </div>
              {isExpanded && (
                <RegistrationPanel
                  loading={regsLoading}
                  registrations={registrations}
                  error={regsError}
                  onDelete={deleteRegistration}
                />
              )}
            </div>
          )
        })}
      </div>}

      {/* Recurring Events (Stammtisch etc.) */}
      <div style={{ marginTop: 40 }}>
        <div style={{ ...pageHead, marginBottom: 16 }}>
          <div>
            <span style={crumbStyle}>Wiederkehrend</span>
            <h2 style={{ ...h1Style, fontSize: 20, marginTop: 4 }}>Wiederkehrende Events</h2>
          </div>
          {!recurringForm && !form && (
            <button onClick={() => { setRecurringForm(emptyRecurringForm()); setRecurringIsNew(true) }} style={btnPrimary}>
              + Neu
            </button>
          )}
        </div>

        {recurringForm && (
          <div style={{ ...card, marginBottom: 20, padding: 24 }}>
            <h3 style={cardTitle}>{recurringIsNew ? 'Neues wiederkehrendes Event' : 'Bearbeiten'}</h3>
            {recurringError && <div style={errorBox}>{recurringError}</div>}
            <div style={{ display: 'grid', gap: 18, marginTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, alignItems: 'end' }}>
                <Field label="Kategorie">
                  <select value={recurringForm.category} onChange={(e) => rf('category', e.target.value as EventCategory)} style={inp}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                  </select>
                </Field>
                <Field label="Wochentag">
                  <select value={recurringForm.day_of_week} onChange={(e) => rf('day_of_week', Number(e.target.value))} style={inp}>
                    {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{dayLabel(d, 'de')} ({['Mo','Di','Mi','Do','Fr','Sa','So'][d]})</option>)}
                  </select>
                </Field>
                <Field label="Woche im Monat">
                  <select value={recurringForm.week_of_month} onChange={(e) => rf('week_of_month', Number(e.target.value))} style={inp}>
                    {[1,2,3,4,5].map(w => <option key={w} value={w}>{WEEK_LABELS[w]}</option>)}
                  </select>
                </Field>
                <Field label="Uhrzeit">
                  <input type="text" value={recurringForm.time_label} onChange={(e) => rf('time_label', e.target.value)} placeholder="nach dem Training" style={inp} />
                </Field>
                <Field label="Reihenfolge">
                  <input type="number" value={recurringForm.sort_order} onChange={(e) => rf('sort_order', Number(e.target.value))} style={inp} />
                </Field>
              </div>
              <LangPair label="Titel" deValue={recurringForm.title_de} enValue={recurringForm.title_en} onDe={(v) => rf('title_de', v)} onEn={(v) => rf('title_en', v)} />
              <LangPair label="Ort" deValue={recurringForm.place_de} enValue={recurringForm.place_en} onDe={(v) => rf('place_de', v)} onEn={(v) => rf('place_en', v)} />
              <LangPair label="Beschreibung" deValue={recurringForm.desc_de} enValue={recurringForm.desc_en} onDe={(v) => rf('desc_de', v)} onEn={(v) => rf('desc_en', v)} textarea />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setRecurringForm(null)} style={btnGhost}>Abbrechen</button>
              <button onClick={saveRecurring} disabled={recurringSaving} style={btnPrimary}>{recurringSaving ? '…' : 'Speichern'}</button>
            </div>
          </div>
        )}

        <div style={card}>
          {recurringEvents.length === 0 ? (
            <div style={empty}>Keine wiederkehrenden Events</div>
          ) : recurringEvents.map((re) => {
            const cat = CAT_COLORS[re.category]
            return (
              <div key={re.id} style={listRow} className="admin-list-row">
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: 'var(--fg)', fontSize: 14 }}>{re.title.de}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ ...chipStyle, color: cat.color, borderColor: cat.border }}>{CAT_LABELS[re.category]}</span>
                    <span style={metaItem}>{['Mo','Di','Mi','Do','Fr','Sa','So'][re.day_of_week]} · Woche {re.week_of_month}</span>
                    <span style={metaItem}>{re.time_label}</span>
                    <span style={metaItem}>{re.place.de}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }} className="admin-list-row-actions">
                  <button onClick={() => { setRecurringForm(recurringToForm(re)); setRecurringIsNew(false) }} style={btnGhost}>Bearbeiten</button>
                  <button onClick={() => delRecurring(re.id)} style={btnDanger}>Löschen</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
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

function RegistrationPanel({
  loading, registrations, error, onDelete,
}: {
  loading: boolean
  registrations: Registration[]
  error: string | null
  onDelete: (id: string) => void
}) {
  if (loading) {
    return (
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line-soft)', background: 'var(--bg-3)', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em' }}>
        …
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line-soft)', background: 'var(--bg-3)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {error}
      </div>
    )
  }

  const teams = registrations.filter((r) => r.type === 'team')
  const individuals = registrations.filter((r) => r.type === 'individual')
  const totalPeople = teams.reduce((n, t) => n + t.event_registration_members.length, 0) + individuals.length

  if (registrations.length === 0) {
    return (
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line-soft)', background: 'var(--bg-3)', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em' }}>
        Noch keine Anmeldungen
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-3)', borderTop: '1px solid var(--line-soft)' }}>

      {/* Summary bar */}
      <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--line-soft)', display: 'flex', gap: 20 }}>
        {teams.length > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em' }}>
            <span style={{ color: '#D97757', fontWeight: 600 }}>{teams.length}</span> {teams.length === 1 ? 'Team' : 'Teams'}
          </span>
        )}
        {individuals.length > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em' }}>
            <span style={{ color: '#D97757', fontWeight: 600 }}>{individuals.length}</span> Einzeln
          </span>
        )}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em', marginLeft: 'auto' }}>
          <span style={{ color: 'var(--fg-dim)', fontWeight: 600 }}>{totalPeople}</span> Personen gesamt
        </span>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

        {/* Teams */}
        {teams.length > 0 && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', marginBottom: 12 }}>
              Teams
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {teams.map((team) => (
                <div key={team.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderRadius: 10, overflow: 'hidden' }}>
                  {/* Team header */}
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--fg)', fontSize: 13 }}>{team.team_name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)' }}>
                        {team.event_registration_members.length} Pers.
                      </span>
                      <button
                        onClick={() => onDelete(team.id)}
                        title="Anmeldung löschen"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-mute)', padding: '2px 4px', lineHeight: 1, transition: 'color 0.15s', fontSize: 16 }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-mute)' }}
                      >×</button>
                    </div>
                  </div>
                  {/* Members */}
                  <div style={{ padding: '8px 14px 10px' }}>
                    {[...team.event_registration_members]
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((m, i) => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '4px 0', borderBottom: i < team.event_registration_members.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#D97757', minWidth: 14, fontWeight: 600 }}>{i + 1}</span>
                          <span style={{ fontSize: 13, color: 'var(--fg)', flex: 1 }}>{m.name}</span>
                          {m.email && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)' }}>{m.email}</span>}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individuals */}
        {individuals.length > 0 && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', marginBottom: 12 }}>
              Einzelanmeldungen
            </div>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderRadius: 10, overflow: 'hidden' }}>
              {individuals.map((ind, i) => (
                <div key={ind.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < individuals.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#D97757', fontWeight: 600, minWidth: 16 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: 'var(--fg)', flex: 1 }}>{ind.name}</span>
                  {ind.email && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)' }}>{ind.email}</span>}
                  <button
                    onClick={() => onDelete(ind.id)}
                    title="Anmeldung löschen"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-mute)', padding: '2px 4px', lineHeight: 1, transition: 'color 0.15s', fontSize: 16, flexShrink: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-mute)' }}
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
