'use client'

import { useEffect, useRef, useState } from 'react'
import type { Product } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { pageHead, crumbStyle, h1Style, card, listRow, empty, inp, btnPrimary, btnGhost, btnDanger } from '../shared'
import { FormShell, FormSection, Field, Grid, Toggle } from '@/components/admin/Form'
import LangPair from '@/components/admin/LangPair'

const CATEGORIES = ['ringe', 'stangen', 'parallettes', 'zubehoer'] as const
const CAT_LABELS: Record<string, string> = { ringe: 'Ringe', stangen: 'Stangen', parallettes: 'Parallettes', zubehoer: 'Zubehör' }

type FormState = {
  category: string
  name_de: string; name_en: string
  desc_de: string; desc_en: string
  href: string; sort_order: string; visible: boolean
  image_url: string
}

const emptyForm = (): FormState => ({
  category: 'zubehoer',
  name_de: '', name_en: '',
  desc_de: '', desc_en: '',
  href: '', sort_order: '0', visible: true,
  image_url: '',
})

export default function AdminAusruestungPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await createClient().from('products').select('*').order('sort_order')
    setProducts(data ?? [])
  }

  useEffect(() => { load() }, [])

  function startNew() { setForm(emptyForm()); setEditing('new'); setError('') }
  function startEdit(p: Product) {
    setForm({ category: p.category, name_de: p.name_de, name_en: p.name_en, desc_de: p.desc_de, desc_en: p.desc_en, href: p.href, sort_order: String(p.sort_order), visible: p.visible, image_url: p.image_url ?? '' })
    setEditing(p)
    setError('')
  }

  const f = (key: keyof FormState, value: string) => setForm((p) => ({ ...p, [key]: value }))

  async function handleImageUpload(file: File) {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (uploadError) { setError(uploadError.message); setUploading(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setForm((p) => ({ ...p, image_url: data.publicUrl }))
    setUploading(false)
  }

  async function save() {
    if (!form.name_de.trim()) { setError('"Name (DE)" ist Pflicht.'); return }
    if (!form.href.trim()) { setError('"Amazon-Link" ist Pflicht.'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    const data = {
      category: form.category,
      name_de: form.name_de, name_en: form.name_en,
      desc_de: form.desc_de, desc_en: form.desc_en,
      href: form.href, sort_order: parseInt(form.sort_order) || 0,
      visible: form.visible,
      image_url: form.image_url || null,
      glyph: '',
    }
    const { error: err } = editing === 'new'
      ? await supabase.from('products').insert(data)
      : await supabase.from('products').update(data).eq('id', (editing as Product).id)
    if (err) setError(err.message)
    else { setEditing(null); load() }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm('Löschen?')) return
    await createClient().from('products').delete().eq('id', id)
    load()
  }

  async function toggleVisible(p: Product) {
    await createClient().from('products').update({ visible: !p.visible }).eq('id', p.id)
    load()
  }

  return (
    <div>
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>06 / Content</span>
          <h1 style={h1Style}>Ausrüstung</h1>
        </div>
        {!editing && <button onClick={startNew} style={btnPrimary}>+ Produkt hinzufügen</button>}
      </div>

      {editing !== null && (
        <FormShell title={editing === 'new' ? 'Neues Produkt' : 'Produkt bearbeiten'} error={error} onCancel={() => setEditing(null)} onSave={save} saving={saving} disabled={uploading || !form.name_de.trim()}>
          <FormSection title="Produkt">
            <Grid>
              <Field label="Kategorie">
                <select value={form.category} onChange={(e) => f('category', e.target.value)} style={inp}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </Field>
            </Grid>
            <LangPair label="Name" deValue={form.name_de} enValue={form.name_en} onDe={(v) => f('name_de', v)} onEn={(v) => f('name_en', v)} placeholder={{ de: 'Holzringe mit Schlaufen', en: 'Wooden rings with straps' }} />
            <LangPair label="Beschreibung" optional textarea rows={2} deValue={form.desc_de} enValue={form.desc_en} onDe={(v) => f('desc_de', v)} onEn={(v) => f('desc_en', v)} hint="Ein, zwei Sätze: Wofür nutzen wir es, was ist gut daran?" />
          </FormSection>
          <FormSection title="Bild" description="JPG, PNG oder WebP, maximal 5 MB. Freigestellte Produktbilder wirken am ruhigsten.">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 128, height: 96, flexShrink: 0, background: 'var(--bg-3)', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
                {form.image_url ? <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ font: '600 12px var(--font-sans)', color: 'var(--fg-mute)' }}>Kein Bild</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file) }} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={btnGhost}>{uploading ? 'Hochladen …' : form.image_url ? 'Bild ersetzen' : 'Bild hochladen'}</button>
              {form.image_url && <button type="button" onClick={() => setForm((p) => ({ ...p, image_url: '' }))} style={btnDanger}>Bild entfernen</button>}
            </div>
          </FormSection>
          <FormSection title="Link" description="Der Affiliate-Hinweis steht automatisch unter der Liste.">
            <Field label="Amazon-Link">
              <input value={form.href} onChange={(e) => f('href', e.target.value)} placeholder="https://amzn.to/…" style={inp} type="url" />
            </Field>
          </FormSection>
          <FormSection title="Anzeige">
            <Grid>
              <Field label="Reihenfolge" hint="Kleinere Zahl steht weiter vorne.">
                <input type="number" value={form.sort_order} onChange={(e) => f('sort_order', e.target.value)} style={inp} />
              </Field>
            </Grid>
            <Toggle checked={form.visible} onChange={(v) => setForm(p => ({ ...p, visible: v }))} label={form.visible ? 'Auf der Ausrüstungsseite sichtbar' : 'Versteckt'} />
          </FormSection>
        </FormShell>
      )}

      {!editing && <div style={card}>
        {products.length === 0 ? (
          <div style={empty}>Noch keine Produkte</div>
        ) : products.map((p) => (
          <div key={p.id} style={{ ...listRow, opacity: p.visible ? 1 : 0.5 }} className="admin-list-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              {/* Thumbnail */}
              <div style={{ width: 48, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--line-soft)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-mute)' }}>–</span>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: 'var(--fg)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name_de}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 999, border: '1px solid var(--line-soft)', color: 'var(--fg-mute)' }}>{CAT_LABELS[p.category] ?? p.category}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{p.href}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }} className="admin-list-row-actions">
              <button onClick={() => toggleVisible(p)} style={{ ...btnGhost, color: p.visible ? 'var(--ok)' : 'var(--fg-mute)', borderColor: p.visible ? 'color-mix(in srgb, var(--ok) 35%, transparent)' : 'var(--line)' }}>
                {p.visible ? '● Sichtbar' : '○ Versteckt'}
              </button>
              <button onClick={() => startEdit(p)} style={btnGhost}>Bearbeiten</button>
              <button onClick={() => del(p.id)} style={btnDanger}>Löschen</button>
            </div>
          </div>
        ))}
      </div>}
    </div>
  )
}

