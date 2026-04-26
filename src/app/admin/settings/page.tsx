'use client'

import { useEffect, useState } from 'react'
import type { SiteSettings } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { pageHead, crumbStyle, h1Style, card, cardHead, cardMeta, inp, errorBox, successBox, btnPrimary } from '../shared'

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Partial<SiteSettings>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    createClient().from('site_settings').select('*').single().then(({ data }) => {
      if (data) setForm(data)
    })
  }, [])

  const f = (key: keyof SiteSettings, value: string) => setForm((p) => ({ ...p, [key]: value }))

  async function save() {
    setSaving(true); setSaved(false); setError('')
    const supabase = createClient()
    const { error } = await supabase.from('site_settings').update({
      hero_members: form.hero_members, hero_sessions: form.hero_sessions,
      hero_spot: form.hero_spot, hero_fee: form.hero_fee,
      about_members: form.about_members, about_founded: form.about_founded,
      about_spots: form.about_spots, about_sessions: form.about_sessions,
      show_ausruestung: form.show_ausruestung,
      imprint_street: form.imprint_street, imprint_zip: form.imprint_zip,
      imprint_city: form.imprint_city, imprint_chair1: form.imprint_chair1,
      imprint_chair2: form.imprint_chair2, imprint_reg_nr: form.imprint_reg_nr,
      imprint_email: form.imprint_email,
    }).eq('id', 1)
    if (error) setError(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  return (
    <div>
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>05 / Settings</span>
          <h1 style={h1Style}>Hero & Stats</h1>
        </div>
        <button onClick={save} disabled={saving} style={btnPrimary}>
          {saving ? 'Speichern …' : 'Speichern'}
        </button>
      </div>

      {error && <div style={errorBox}>{error}</div>}
      {saved && <div style={successBox}>✓ Gespeichert</div>}

      {/* Hero stats */}
      <div style={card}>
        <div style={cardHead}>
          <h3 style={cardTitle}>Hero-Statistiken</h3>
          <span style={cardMeta}>4 Kacheln im Hero-Bereich</span>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="stats-grid">
            {[
              { key: 'hero_members' as const,  label: 'Mitglieder',         placeholder: '120+' },
              { key: 'hero_sessions' as const, label: 'Einheiten / Woche',  placeholder: '2 + Open' },
              { key: 'hero_spot' as const,     label: 'Heimspot',            placeholder: 'JGU Campus' },
              { key: 'hero_fee' as const,      label: 'Monatsbeitrag',       placeholder: '€ 0 / Monat' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={statBox}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', marginBottom: 10 }}>{label}</div>
                <input
                  value={form[key] ?? ''} onChange={(e) => f(key, e.target.value)}
                  placeholder={placeholder} style={inp}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About stats */}
      <div style={{ ...card, marginTop: 20 }}>
        <div style={cardHead}>
          <h3 style={cardTitle}>Über uns — Zahlen</h3>
          <span style={cardMeta}>4 Kacheln im Über-uns-Bereich</span>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="stats-grid">
            {[
              { key: 'about_members' as const,  label: 'Mitglieder',          placeholder: '120' },
              { key: 'about_founded' as const,  label: 'Gegründet',            placeholder: '2018' },
              { key: 'about_spots' as const,    label: 'Spots',                placeholder: '3' },
              { key: 'about_sessions' as const, label: 'Einheiten / Woche',    placeholder: '2' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={statBox}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', marginBottom: 10 }}>{label}</div>
                <input
                  value={form[key] ?? ''} onChange={(e) => f(key, e.target.value)}
                  placeholder={placeholder} style={inp}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impressum */}
      <div style={{ ...card, marginTop: 20 }}>
        <div style={cardHead}>
          <h3 style={cardTitle}>Impressum</h3>
          <span style={cardMeta}>Pflichtangaben für die Impressums-Seite</span>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="stats-grid">
          {[
            { key: 'imprint_chair1' as const,  label: '1. Vorsitzende:r',  placeholder: 'Max Mustermann' },
            { key: 'imprint_chair2' as const,  label: '2. Vorsitzende:r',  placeholder: 'Erika Musterfrau' },
            { key: 'imprint_street' as const,  label: 'Straße & Hausnummer', placeholder: 'Musterstraße 1' },
            { key: 'imprint_zip' as const,     label: 'PLZ',               placeholder: '55122' },
            { key: 'imprint_reg_nr' as const,  label: 'Registernummer',    placeholder: 'VR 12345' },
            { key: 'imprint_email' as const,   label: 'E-Mail',            placeholder: 'kontakt@calisthenics-mainz.de' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} style={statBox}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', marginBottom: 10 }}>{label}</div>
              <input value={form[key] ?? ''} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={inp}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')} />
            </div>
          ))}
        </div>
      </div>

      {/* Feature flags */}
      <div style={{ ...card, marginTop: 20 }}>
        <div style={cardHead}>
          <h3 style={cardTitle}>Feature-Flags</h3>
          <span style={cardMeta}>Seiten ein- / ausschalten</span>
        </div>
        <div style={{ padding: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--line-soft)', borderRadius: 10 }}>
            <input
              type="checkbox"
              checked={form.show_ausruestung ?? false}
              onChange={(e) => setForm((p) => ({ ...p, show_ausruestung: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: 'var(--ok)', flexShrink: 0, cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: form.show_ausruestung ? 'var(--ok)' : 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Ausrüstungs-Seite {form.show_ausruestung ? '● aktiv' : '○ inaktiv'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', marginTop: 3, letterSpacing: '0.04em' }}>
                /de/ausruestung — Affiliate-Links zu Amazon
              </div>
            </div>
          </label>
        </div>
      </div>

      <style>{`@media(max-width:900px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:500px){.stats-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

const cardTitle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, color: 'var(--fg)', fontWeight: 600 }
const statBox: React.CSSProperties = { background: 'var(--bg)', border: '1px solid var(--line-soft)', borderRadius: 12, padding: 18 }
