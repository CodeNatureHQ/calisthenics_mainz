'use client'

import { useEffect, useRef, useState } from 'react'
import type { Product } from '@/lib/types'
import { createClient } from '@/lib/supabase/admin'
import { card, empty, inp, btnPrimary, btnGhost, btnDanger } from '../shared'
import { FormShell, FormSection, Field, Grid, Toggle } from '@/components/admin/Form'
import LangPair from '@/components/admin/LangPair'
import { useDeepLink, moveItem, nextSortOrder, MoveButtons, ListItem, Thumb, Switch } from '@/components/admin/list'
import { PageHeader, Badge } from '@/components/admin/sections'

const CATEGORIES = ['ringe', 'stangen', 'parallettes', 'zubehoer'] as const
const CAT_LABELS: Record<string, string> = { ringe: 'Ringe', stangen: 'Stangen', parallettes: 'Parallettes', zubehoer: 'Zubehör' }

type FormState = {
  category: string
  name_de: string; name_en: string
  desc_de: string; desc_en: string
  href: string; visible: boolean
  image_url: string
}

const emptyForm = (): FormState => ({
  category: 'zubehoer',
  name_de: '', name_en: '',
  desc_de: '', desc_en: '',
  href: '', visible: true,
  image_url: '',
})

export default function AdminAusruestungPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await createClient().from('products').select('*').order('sort_order')
    setProducts(data ?? [])
    setReady(true)
  }

  useEffect(() => { load() }, [])

  function startNew() { setForm(emptyForm()); setEditing('new'); setError('') }
  function startEdit(p: Product) {
    setForm({ category: p.category, name_de: p.name_de, name_en: p.name_en, desc_de: p.desc_de, desc_en: p.desc_en, href: p.href, visible: p.visible, image_url: p.image_url ?? '' })
    setEditing(p)
    setError('')
  }
  useDeepLink('edit', products, ready, (t) => (t === 'new' ? startNew() : startEdit(t)))
  async function move(index: number, dir: -1 | 1) { setProducts(await moveItem('products', products, index, dir)) }

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
      href: form.href,
      visible: form.visible,
      image_url: form.image_url || null,
      glyph: '',
    }
    const { error: err } = editing === 'new'
      ? await supabase.from('products').insert({ ...data, sort_order: nextSortOrder(products) })
      : await supabase.from('products').update(data).eq('id', (editing as Product).id)
    if (err) setError(err.message)
    else { setEditing(null); load() }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm('Dieses Produkt löschen?')) return false
    await createClient().from('products').delete().eq('id', id)
    load()
    return true
  }

  async function toggleVisible(p: Product) {
    await createClient().from('products').update({ visible: !p.visible }).eq('id', p.id)
    load()
  }

  return (
    <div>
      {!editing && <PageHeader section="ausruestung" count={products.length} action={<button onClick={startNew} style={btnPrimary}>+ Produkt hinzufügen</button>} />}

      {editing !== null && (
        <FormShell section="ausruestung" onDelete={editing === 'new' ? undefined : async () => { if (await del(String((editing as { id: string | number }).id))) setEditing(null) }} title={editing === 'new' ? 'Neues Produkt' : 'Produkt bearbeiten'} error={error} onCancel={() => setEditing(null)} onSave={save} saving={saving} disabled={uploading || !form.name_de.trim()}>
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
          <FormSection title="Anzeige" description="Die Reihenfolge änderst du mit den Pfeilen in der Liste.">
            <Toggle checked={form.visible} onChange={(v) => setForm(p => ({ ...p, visible: v }))} label={form.visible ? 'Auf der Ausrüstungsseite sichtbar' : 'Versteckt'} />
          </FormSection>
        </FormShell>
      )}

      {!editing && <div style={card}>
        {products.length === 0 ? <div style={empty}>Noch keine Produkte</div> : products.map((p, i) => (
          <ListItem
            key={p.id}
            onOpen={() => startEdit(p)}
            dim={!p.visible}
            leading={p.image_url ? <Thumb src={p.image_url} fallback="" /> : undefined}
            title={p.name_de}
            sub={CAT_LABELS[p.category] ?? p.category}
            trailing={<>
              {!p.visible && <Badge tone="mute">Versteckt</Badge>}
              <Switch checked={p.visible} onChange={() => toggleVisible(p)} label={p.visible ? 'Auf der Seite sichtbar: ausblenden' : 'Versteckt: einblenden'} />
              <MoveButtons index={i} count={products.length} onMove={(d) => move(i, d)} />
            </>}
          />
        ))}
      </div>}
    </div>
  )
}

