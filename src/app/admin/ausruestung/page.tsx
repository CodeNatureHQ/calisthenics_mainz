'use client'

import { useEffect, useRef, useState } from 'react'
import type { Product } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { pageHead, crumbStyle, h1Style, card, formCard, listRow, empty, inp, fieldLabel, errorBox, btnPrimary, btnGhost, btnDanger } from '../shared'

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
        <div style={{ ...formCard, marginBottom: 16 }}>
          <h2 style={formTitle}>{editing === 'new' ? 'Neues Produkt' : 'Produkt bearbeiten'}</h2>
          {error && <div style={errorBox}>{error}</div>}

          {/* Bild-Upload */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Produktbild</label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Preview */}
              <div style={{
                width: 120, height: 90, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                border: '1px solid var(--line-soft)', background: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {form.image_url ? (
                  <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', textAlign: 'center', padding: 8 }}>Kein Bild</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{ ...btnGhost, opacity: uploading ? 0.6 : 1 }}
                >
                  {uploading ? 'Wird hochgeladen …' : 'Bild hochladen'}
                </button>
                {form.image_url && (
                  <button onClick={() => setForm((p) => ({ ...p, image_url: '' }))} style={{ ...btnGhost, color: 'var(--danger)', borderColor: 'rgba(255,122,122,0.3)' }}>
                    Bild entfernen
                  </button>
                )}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.04em' }}>
                  JPG, PNG, WebP · max. 5 MB
                </span>
              </div>
            </div>
          </div>

          {/* Kategorie */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Kategorie</label>
            <select value={form.category} onChange={(e) => f('category', e.target.value)} className="admin-input" style={inp}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>

          {/* Namen */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Name</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-lang-pair">
              {[{ val: form.name_de, key: 'name_de' as const, tag: 'DE' }, { val: form.name_en, key: 'name_en' as const, tag: 'EN' }].map(({ val, key, tag }) => (
                <div key={tag} style={{ position: 'relative' }}>
                  <input value={val} onChange={(e) => f(key, e.target.value)} style={{ ...inp, paddingRight: 44 }} />
                  <span style={badge}>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Beschreibungen */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Beschreibung (optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-lang-pair">
              {[{ val: form.desc_de, key: 'desc_de' as const, tag: 'DE' }, { val: form.desc_en, key: 'desc_en' as const, tag: 'EN' }].map(({ val, key, tag }) => (
                <div key={tag} style={{ position: 'relative' }}>
                  <textarea value={val} onChange={(e) => f(key, e.target.value)} rows={2} style={{ ...inp, resize: 'vertical', minHeight: 64, paddingRight: 44, lineHeight: 1.5 }} />
                  <span style={{ ...badge, top: 8 }}>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amazon-Link */}
          <div style={{ marginBottom: 20, borderTop: '1px solid var(--line-soft)', paddingTop: 16 }}>
            <label style={fieldLabel}>Amazon-Link (Affiliate-URL)</label>
            <input value={form.href} onChange={(e) => f('href', e.target.value)} placeholder="https://amzn.to/..." style={inp} type="url" />
          </div>

          <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
            <button onClick={() => setEditing(null)} style={btnGhost}>Abbrechen</button>
            <button onClick={save} disabled={saving || uploading} style={btnPrimary}>{saving ? '…' : 'Speichern'}</button>
          </div>
        </div>
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
              <button onClick={() => toggleVisible(p)} style={{ ...btnGhost, color: p.visible ? 'var(--ok)' : 'var(--fg-mute)', borderColor: p.visible ? 'rgba(142,232,142,0.3)' : 'var(--line)' }}>
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

const formTitle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg)', margin: '0 0 16px', fontWeight: 600 }
const badge: React.CSSProperties = { position: 'absolute', top: 8, right: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--fg-mute)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 999, border: '1px solid var(--line-soft)', pointerEvents: 'none' }
