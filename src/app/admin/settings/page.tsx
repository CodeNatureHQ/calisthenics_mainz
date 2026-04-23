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

      <style>{`@media(max-width:900px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:500px){.stats-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

const cardTitle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, color: 'var(--fg)', fontWeight: 600 }
const statBox: React.CSSProperties = { background: 'var(--bg)', border: '1px solid var(--line-soft)', borderRadius: 12, padding: 18 }
