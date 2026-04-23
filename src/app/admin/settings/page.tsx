'use client'

import { useEffect, useState } from 'react'
import type { SiteSettings } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [form, setForm] = useState<Partial<SiteSettings>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('site_settings').select('*').single()
    setSettings(data)
    setForm(data ?? {})
  }

  useEffect(() => { load() }, [])

  const f = (key: keyof SiteSettings, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('site_settings')
        .update({
          hero_members: form.hero_members,
          hero_sessions: form.hero_sessions,
          hero_spot: form.hero_spot,
          hero_fee: form.hero_fee,
          about_members: form.about_members,
          about_founded: form.about_founded,
          about_spots: form.about_spots,
          about_sessions: form.about_sessions,
        })
        .eq('id', 1)
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={pageTitle}>Hero & Stats</h1>
        <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
          {saving ? 'Speichern …' : 'Speichern'}
        </button>
      </div>

      {error && <div style={errorBox}>{error}</div>}
      {saved && (
        <div style={{ color: 'var(--success)', fontSize: '0.875rem', marginBottom: '1rem', background: 'rgba(34,197,94,0.08)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid rgba(34,197,94,0.2)' }}>
          Gespeichert ✓
        </div>
      )}

      {/* Hero Stats */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={sectionTitle}>Hero-Statistiken (4 Kacheln)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <Field label="Mitglieder">
            <input value={form.hero_members ?? ''} onChange={(e) => f('hero_members', e.target.value)} placeholder="120+" style={inputStyle} />
          </Field>
          <Field label="Einheiten / Woche">
            <input value={form.hero_sessions ?? ''} onChange={(e) => f('hero_sessions', e.target.value)} placeholder="2 + Open" style={inputStyle} />
          </Field>
          <Field label="Heimspot">
            <input value={form.hero_spot ?? ''} onChange={(e) => f('hero_spot', e.target.value)} placeholder="JGU Campus" style={inputStyle} />
          </Field>
          <Field label="Monatsbeitrag">
            <input value={form.hero_fee ?? ''} onChange={(e) => f('hero_fee', e.target.value)} placeholder="€ 0 / Monat" style={inputStyle} />
          </Field>
        </div>
      </section>

      {/* About Stats */}
      <section>
        <h2 style={sectionTitle}>Über uns — Zahlen (4 Kacheln)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <Field label="Mitglieder">
            <input value={form.about_members ?? ''} onChange={(e) => f('about_members', e.target.value)} placeholder="120" style={inputStyle} />
          </Field>
          <Field label="Gegründet">
            <input value={form.about_founded ?? ''} onChange={(e) => f('about_founded', e.target.value)} placeholder="2018" style={inputStyle} />
          </Field>
          <Field label="Spots">
            <input value={form.about_spots ?? ''} onChange={(e) => f('about_spots', e.target.value)} placeholder="3" style={inputStyle} />
          </Field>
          <Field label="Einheiten / Woche">
            <input value={form.about_sessions ?? ''} onChange={(e) => f('about_sessions', e.target.value)} placeholder="2" style={inputStyle} />
          </Field>
        </div>
      </section>
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
const sectionTitle: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, color: 'var(--fg)', margin: 0 }
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--fg)', fontSize: '0.875rem', padding: '0.5625rem 0.75rem', outline: 'none', fontFamily: 'inherit' }
const primaryBtnStyle: React.CSSProperties = { background: 'var(--accent)', color: '#0a0a0b', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer' }
const errorBox: React.CSSProperties = { color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.08)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.2)' }
