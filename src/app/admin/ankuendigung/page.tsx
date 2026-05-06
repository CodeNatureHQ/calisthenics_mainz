'use client'

import { useEffect, useState } from 'react'
import type { SiteSettings } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import {
  pageHead, crumbStyle, h1Style, card, cardHead, cardMeta,
  cardTitle, inp, fieldLabel, errorBox, successBox, btnPrimary,
} from '../shared'

type AnnFields = Pick<
  SiteSettings,
  | 'announcement_active'
  | 'announcement_title_de'
  | 'announcement_title_en'
  | 'announcement_body_de'
  | 'announcement_body_en'
  | 'announcement_starts_at'
  | 'announcement_ends_at'
  | 'announcement_image_url'
>

const defaultForm: AnnFields = {
  announcement_active: false,
  announcement_title_de: '',
  announcement_title_en: '',
  announcement_body_de: '',
  announcement_body_en: '',
  announcement_starts_at: null,
  announcement_ends_at: null,
  announcement_image_url: null,
}

export default function AdminAnkuendigungPage() {
  const [form, setForm] = useState<AnnFields>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    createClient()
      .from('site_settings')
      .select('announcement_active,announcement_title_de,announcement_title_en,announcement_body_de,announcement_body_en,announcement_starts_at,announcement_ends_at,announcement_image_url')
      .single()
      .then(({ data }) => {
        if (data) setForm(data as AnnFields)
      })
  }, [])

  async function handleImageUpload(file: File) {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `announcement.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('announcement-images')
      .upload(path, file, { upsert: true })
    if (uploadError) { setError(uploadError.message); setUploading(false); return }
    const { data } = supabase.storage.from('announcement-images').getPublicUrl(path)
    setForm((p) => ({ ...p, announcement_image_url: data.publicUrl }))
    setUploading(false)
  }

  async function save() {
    setSaving(true); setSaved(false); setError('')
    const { error } = await createClient()
      .from('site_settings')
      .update({
        announcement_active: form.announcement_active,
        announcement_title_de: form.announcement_title_de,
        announcement_title_en: form.announcement_title_en,
        announcement_body_de: form.announcement_body_de,
        announcement_body_en: form.announcement_body_en,
        announcement_starts_at: form.announcement_starts_at || null,
        announcement_ends_at: form.announcement_ends_at || null,
        announcement_image_url: form.announcement_image_url || null,
      })
      .eq('id', 1)
    if (error) setError(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  const isActive = form.announcement_active

  return (
    <div>
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>⚠ Dringende Meldung</span>
          <h1 style={h1Style}>Meldung</h1>
        </div>
        <button onClick={save} disabled={saving} style={btnPrimary}>
          {saving ? 'Speichern …' : 'Speichern'}
        </button>
      </div>

      {error && <div style={errorBox}>{error}</div>}
      {saved && <div style={successBox}>✓ Gespeichert</div>}

      {/* Status card */}
      <div style={{ ...card, borderColor: isActive ? 'rgba(255,122,122,0.4)' : 'var(--line-soft)', marginBottom: 20 }}>
        <div style={{ ...cardHead, borderBottomColor: isActive ? 'rgba(255,122,122,0.2)' : 'var(--line-soft)' }}>
          <h3 style={{ ...cardTitle, color: isActive ? 'var(--danger)' : 'var(--fg)' }}>
            {isActive ? '● Meldung aktiv' : '○ Meldung inaktiv'}
          </h3>
          <span style={cardMeta}>
            Erscheint als Modal beim ersten Besuch, danach als Banner über der Navbar
          </span>
        </div>
        <div style={{ padding: 20 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
            padding: '16px 20px',
            background: isActive ? 'rgba(255,122,122,0.06)' : 'var(--bg)',
            border: `1px solid ${isActive ? 'rgba(255,122,122,0.25)' : 'var(--line-soft)'}`,
            borderRadius: 10, transition: 'all 0.2s',
          }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setForm((p) => ({ ...p, announcement_active: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: 'var(--danger)', flexShrink: 0, cursor: 'pointer' }}
            />
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                color: isActive ? 'var(--danger)' : 'var(--fg-dim)',
              }}>
                {isActive ? 'Meldung ist öffentlich sichtbar' : 'Meldung aktivieren'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', marginTop: 4, letterSpacing: '0.04em' }}>
                Nur sichtbar wenn aktiv und das Datum im eingestellten Zeitraum liegt
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Date range */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={cardHead}>
          <h3 style={cardTitle}>Zeitraum</h3>
          <span style={cardMeta}>Leer lassen = kein Limit</span>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="ann-grid">
          <div>
            <label style={fieldLabel}>Anzeigen ab</label>
            <input
              type="date"
              value={form.announcement_starts_at ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, announcement_starts_at: e.target.value }))}
              style={{ ...inp, colorScheme: 'dark' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            />
          </div>
          <div>
            <label style={fieldLabel}>Anzeigen bis</label>
            <input
              type="date"
              value={form.announcement_ends_at ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, announcement_ends_at: e.target.value }))}
              style={{ ...inp, colorScheme: 'dark' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            />
          </div>
        </div>
      </div>

      {/* Image */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={cardHead}>
          <h3 style={cardTitle}>Bild</h3>
          <span style={cardMeta}>Optional — wird oben im Dialog angezeigt</span>
        </div>
        <div style={{ padding: 20, display: 'flex', gap: 20, alignItems: 'flex-start' }} className="ann-grid">
          {form.announcement_image_url && (
            <div style={{ flexShrink: 0, position: 'relative' }}>
              <img
                src={form.announcement_image_url}
                alt=""
                style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 8, display: 'block', border: '1px solid var(--line-soft)' }}
              />
              <button
                onClick={() => setForm((p) => ({ ...p, announcement_image_url: null }))}
                style={{
                  position: 'absolute', top: -8, right: -8,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--bg-3)', border: '1px solid var(--line)',
                  color: 'var(--fg-mute)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, lineHeight: 1,
                }}
              >✕</button>
            </div>
          )}
          <div>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 8,
              border: '1px solid var(--line)', cursor: uploading ? 'wait' : 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 11,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--fg-dim)', transition: 'border-color 0.15s, color 0.15s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              {uploading ? 'Hochladen …' : 'Bild hochladen'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                  e.target.value = ''
                }}
              />
            </label>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', marginTop: 8, letterSpacing: '0.04em' }}>
              JPG, PNG, WebP — empfohlen 560 × 260 px
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={card}>
        <div style={cardHead}>
          <h3 style={cardTitle}>Inhalt</h3>
          <span style={cardMeta}>DE + EN</span>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="ann-grid">
          {/* DE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--fg-mute)', paddingBottom: 8,
              borderBottom: '1px solid var(--line-soft)',
            }}>
              Deutsch
            </div>
            <div>
              <label style={fieldLabel}>Titel</label>
              <input
                value={form.announcement_title_de ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, announcement_title_de: e.target.value }))}
                placeholder="z.B. Hallenschließung"
                style={inp}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
              />
            </div>
            <div>
              <label style={fieldLabel}>Text</label>
              <textarea
                value={form.announcement_body_de ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, announcement_body_de: e.target.value }))}
                placeholder="Detailtext auf Deutsch…"
                rows={4}
                style={{ ...inp, resize: 'vertical' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
              />
            </div>
          </div>

          {/* EN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--fg-mute)', paddingBottom: 8,
              borderBottom: '1px solid var(--line-soft)',
            }}>
              English
            </div>
            <div>
              <label style={fieldLabel}>Title</label>
              <input
                value={form.announcement_title_en ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, announcement_title_en: e.target.value }))}
                placeholder="e.g. Hall closed"
                style={inp}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
              />
            </div>
            <div>
              <label style={fieldLabel}>Text</label>
              <textarea
                value={form.announcement_body_en ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, announcement_body_en: e.target.value }))}
                placeholder="Detail text in English…"
                rows={4}
                style={{ ...inp, resize: 'vertical' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:640px){.ann-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
