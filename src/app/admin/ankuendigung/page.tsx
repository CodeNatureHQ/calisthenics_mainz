'use client'

import { useEffect, useState } from 'react'
import type { SiteSettings, Event } from '@/lib/types'
import { createClient } from '@/lib/supabase/admin'
import { FormShell, FormSection, Field, Grid } from '@/components/admin/Form'
import LangPair from '@/components/admin/LangPair'
import { card, inp, btnPrimary, btnGhost, btnDanger } from '../shared'
import { PageHeader } from '@/components/admin/sections'

/**
 * Die Meldung: ein Text, ein Schalter. Der große Knopf oben schaltet sofort live oder aus
 * und speichert dabei mit. Zeitraum, Event und Bild sind Extras weiter unten.
 */

type AnnFields = Pick<
  SiteSettings,
  | 'announcement_active' | 'announcement_title_de' | 'announcement_title_en'
  | 'announcement_body_de' | 'announcement_body_en' | 'announcement_starts_at'
  | 'announcement_ends_at' | 'announcement_image_url' | 'announcement_event_id'
>

const COLUMNS = 'announcement_active,announcement_title_de,announcement_title_en,announcement_body_de,announcement_body_en,announcement_starts_at,announcement_ends_at,announcement_image_url,announcement_event_id'

const defaultForm: AnnFields = {
  announcement_active: false,
  announcement_title_de: '', announcement_title_en: '',
  announcement_body_de: '', announcement_body_en: '',
  announcement_starts_at: null, announcement_ends_at: null,
  announcement_image_url: null, announcement_event_id: null,
}

export default function AdminAnkuendigungPage() {
  const [form, setForm] = useState<AnnFields>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('site_settings').select(COLUMNS).single()
      .then(({ data }) => { if (data) setForm(data as AnnFields); setLoaded(true) })
    supabase.from('events').select('id,title,starts_at,category')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .then(({ data }) => { setEvents((data as Event[]) ?? []) })
  }, [])

  const set = <K extends keyof AnnFields>(key: K, value: AnnFields[K]) => setForm((p) => ({ ...p, [key]: value }))

  async function handleImageUpload(file: File) {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `announcement-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('announcement-images').upload(path, file, { upsert: true })
    if (uploadError) { setError(uploadError.message); setUploading(false); return }
    const { data } = supabase.storage.from('announcement-images').getPublicUrl(path)
    set('announcement_image_url', data.publicUrl)
    setUploading(false)
  }

  async function save(active = form.announcement_active) {
    if (active && !form.announcement_event_id && !form.announcement_title_de?.trim()) {
      setError('Bitte zuerst einen Titel eingeben.')
      return
    }
    setSaving(true); setError('')
    const next = { ...form, announcement_active: active }
    const { error } = await createClient().from('site_settings').update({
      ...next,
      announcement_starts_at: next.announcement_starts_at || null,
      announcement_ends_at: next.announcement_ends_at || null,
      announcement_image_url: next.announcement_image_url || null,
      announcement_event_id: next.announcement_event_id || null,
    }).eq('id', 1)
    if (error) setError(error.message)
    else setForm(next)
    setSaving(false)
  }

  const live = form.announcement_active
  const linked = !!form.announcement_event_id

  return (
    <div>
      <PageHeader section="meldung" />

      {/* Status + der eine Knopf */}
      <div style={{ ...card, padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', borderColor: live ? 'var(--accent)' : 'var(--line-soft)' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ font: '700 16px/1.3 var(--font-sans)', color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 10 }}>{live ? 'Meldung ist live' : 'Keine Meldung geschaltet'}</div>
          <div style={{ font: '400 13px/1.5 var(--font-sans)', color: 'var(--fg-mute)', marginTop: 2 }}>
            Erscheint beim ersten Besuch als Fenster, danach als Leiste über der Navigation.
          </div>
        </div>
        <button type="button" onClick={() => save(!live)} disabled={saving} style={live ? btnDanger : btnPrimary}>
          {saving ? 'Speichern …' : live ? 'Ausschalten' : 'Live schalten'}
        </button>
      </div>

      {loaded && <FormShell title="Inhalt der Meldung" error={error} onCancel={() => history.back()} onSave={() => save()} saving={saving} disabled={uploading}>
        <FormSection title="Was sollen alle wissen?" description={linked ? 'Titel und Text kommen gerade aus dem verknüpften Event.' : 'Ein kurzer Titel reicht oft schon, z. B. „Heute kein Training“.'}>
          {!linked && (
            <>
              <LangPair label="Titel" deValue={form.announcement_title_de ?? ''} enValue={form.announcement_title_en ?? ''} onDe={(v) => set('announcement_title_de', v)} onEn={(v) => set('announcement_title_en', v)} placeholder={{ de: 'z. B. Halle heute geschlossen', en: 'e.g. Gym closed today' }} />
              <LangPair label="Text" optional textarea rows={3} deValue={form.announcement_body_de ?? ''} enValue={form.announcement_body_en ?? ''} onDe={(v) => set('announcement_body_de', v)} onEn={(v) => set('announcement_body_en', v)} placeholder={{ de: 'Details …', en: 'Details …' }} />
            </>
          )}
          <Field label="Oder ein Event ankündigen" optional hint="Übernimmt Titel, Text, Bild und Anmeldung aus dem Event.">
            <select value={form.announcement_event_id ?? ''} onChange={(e) => set('announcement_event_id', e.target.value || null)} style={inp}>
              <option value="">Kein Event</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title.de} · {new Date(ev.starts_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>

        <FormSection title="Wann?" description="Leer lassen: sofort sichtbar, bis du sie ausschaltest.">
          <Grid>
            <Field label="Ab" optional>
              <input type="date" value={form.announcement_starts_at ?? ''} onChange={(e) => set('announcement_starts_at', e.target.value || null)} style={inp} />
            </Field>
            <Field label="Bis einschließlich" optional hint="Danach verschwindet sie von selbst.">
              <input type="date" value={form.announcement_ends_at ?? ''} onChange={(e) => set('announcement_ends_at', e.target.value || null)} style={inp} />
            </Field>
          </Grid>
        </FormSection>

        {!linked && (
          <FormSection title="Bild" description="Optional, oben im Fenster. Empfohlen 560 × 260 px.">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              {form.announcement_image_url && <img src={form.announcement_image_url} alt="" style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--line-soft)' }} />}
              <label style={{ ...btnGhost, display: 'inline-flex', alignItems: 'center', cursor: uploading ? 'wait' : 'pointer' }}>
                {uploading ? 'Hochladen …' : form.announcement_image_url ? 'Bild ersetzen' : 'Bild hochladen'}
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); e.target.value = '' }} />
              </label>
              {form.announcement_image_url && <button type="button" onClick={() => set('announcement_image_url', null)} style={btnDanger}>Bild entfernen</button>}
            </div>
          </FormSection>
        )}
      </FormShell>}
    </div>
  )
}
