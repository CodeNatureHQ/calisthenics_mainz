'use client'

import { useEffect, useRef, useState } from 'react'
import type { TeamMember, TeamMemberRole } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { FormShell, FormSection, Field, Grid, Toggle } from '@/components/admin/Form'
import {
  pageHead, crumbStyle, h1Style, card,
  listRow as sharedListRow, empty, inp,
  btnPrimary, btnGhost, btnDanger,
} from '../shared'

type FormState = {
  name: string
  role: TeamMemberRole
  image_url: string
  sort_order: string
  visible: boolean
}

const emptyForm = (): FormState => ({
  name: '',
  role: 'trainer',
  image_url: '',
  sort_order: '0',
  visible: true,
})

const memberToForm = (m: TeamMember): FormState => ({
  name: m.name,
  role: m.role,
  image_url: m.image_url ?? '',
  sort_order: String(m.sort_order),
  visible: m.visible,
})

const roleLabels: Record<TeamMemberRole, string> = {
  trainer: 'Trainer',
  vorstand: 'Vorstand',
}

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [editing, setEditing] = useState<TeamMember | null | 'new'>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isNew = editing === 'new'

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order')
    setMembers(data ?? [])
  }

  useEffect(() => { load() }, [])

  function startNew() { setForm(emptyForm()); setEditing('new'); setError('') }
  function startEdit(m: TeamMember) { setForm(memberToForm(m)); setEditing(m); setError('') }
  function cancelEdit() { setEditing(null) }

  const f = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  async function handleImageUpload(file: File) {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('team-images')
      .upload(path, file, { upsert: true })
    if (uploadError) { setError(uploadError.message); setUploading(false); return }
    const { data } = supabase.storage.from('team-images').getPublicUrl(path)
    setForm((p) => ({ ...p, image_url: data.publicUrl }))
    setUploading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('"Name" ist ein Pflichtfeld.'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const data = {
        name: form.name.trim(),
        role: form.role,
        image_url: form.image_url || null,
        sort_order: parseInt(form.sort_order) || 0,
        visible: form.visible,
      }
      if (isNew) {
        const { error } = await supabase.from('team_members').insert(data)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('team_members')
          .update(data)
          .eq('id', (editing as TeamMember).id)
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

  async function deleteMember(id: string) {
    if (!confirm('Mitglied löschen?')) return
    await createClient().from('team_members').delete().eq('id', id)
    load()
  }

  async function toggleVisible(m: TeamMember) {
    await createClient().from('team_members').update({ visible: !m.visible }).eq('id', m.id)
    load()
  }

  return (
    <div>
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>Content</span>
          <h1 style={h1Style}>Team</h1>
        </div>
        {!editing && <button onClick={startNew} style={btnPrimary}>+ Neues Mitglied</button>}
      </div>

      {editing !== null && (
        <FormShell title={isNew ? 'Neues Mitglied' : 'Mitglied bearbeiten'} error={error} onCancel={cancelEdit} onSave={handleSave} saving={saving} disabled={uploading || !form.name.trim()}>
          <FormSection title="Person">
            <Grid>
              <Field label="Name">
                <input value={form.name} onChange={(e) => f('name', e.target.value)} placeholder="Vorname Nachname" style={inp} />
              </Field>
              <Field label="Rolle">
                <select value={form.role} onChange={(e) => f('role', e.target.value as TeamMemberRole)} style={inp}>
                  <option value="trainer">Trainer</option>
                  <option value="vorstand">Vorstand</option>
                </select>
              </Field>
            </Grid>
          </FormSection>
          <FormSection title="Foto" description="Quadratisch wirkt am besten. JPG, PNG oder WebP, maximal 5 MB.">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 96, height: 96, flexShrink: 0, background: 'var(--bg-3)', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
                {form.image_url ? <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ font: '600 12px var(--font-sans)', color: 'var(--fg-mute)' }}>Kein Foto</span>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file) }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={btnGhost}>{uploading ? 'Hochladen …' : form.image_url ? 'Foto ersetzen' : 'Foto hochladen'}</button>
              {form.image_url && <button type="button" onClick={() => f('image_url', '')} style={btnDanger}>Foto entfernen</button>}
            </div>
          </FormSection>
          <FormSection title="Anzeige">
            <Grid>
              <Field label="Reihenfolge" hint="Kleinere Zahl steht weiter vorne.">
                <input type="number" value={form.sort_order} onChange={(e) => f('sort_order', e.target.value)} style={inp} />
              </Field>
            </Grid>
            <Toggle checked={form.visible} onChange={(v) => setForm((p) => ({ ...p, visible: v }))} label={form.visible ? 'Auf der Über-uns-Seite sichtbar' : 'Versteckt'} />
          </FormSection>
        </FormShell>
      )}

      {!editing && (
        <div style={card}>
          {members.length === 0 ? (
            <div style={empty}>Noch keine Mitglieder</div>
          ) : members.map((m) => (
            <div
              key={m.id}
              style={{ ...sharedListRow, opacity: m.visible ? 1 : 0.5, transition: 'opacity 0.2s' }}
              className="admin-list-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div style={{
                  width: 40, height: 40, flexShrink: 0, borderRadius: 6, overflow: 'hidden',
                  background: 'var(--bg-3)', border: '1px solid var(--line-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--fg-mute)' }}>
                      {m.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, color: 'var(--fg)', fontSize: 14 }}>{m.name}</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)',
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2,
                  }}>
                    {roleLabels[m.role]}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} className="admin-list-row-actions">
                <button
                  onClick={() => toggleVisible(m)}
                  title={m.visible ? 'Sichtbar — klicken zum Ausblenden' : 'Versteckt — klicken zum Einblenden'}
                  style={{
                    ...btnGhost,
                    color: m.visible ? 'var(--ok)' : 'var(--fg-mute)',
                    borderColor: m.visible ? 'color-mix(in srgb, var(--ok) 35%, transparent)' : 'var(--line)',
                  }}
                >
                  {m.visible ? '● Sichtbar' : '○ Versteckt'}
                </button>
                <button onClick={() => startEdit(m)} style={btnGhost}>Bearbeiten</button>
                <button onClick={() => deleteMember(m.id)} style={btnDanger}>Löschen</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
