'use client'

import { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import type { Post } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

type Props = {
  post: Partial<Post> | null
  onSave: () => void
  onCancel: () => void
}

export default function PostEditor({ post, onSave, onCancel }: Props) {
  const isNew = !post?.id
  const [id, setId] = useState(post?.id ?? '')
  const [glyph, setGlyph] = useState(post?.glyph ?? '')
  const [categoryDe, setCategoryDe] = useState(post?.category?.de ?? '')
  const [categoryEn, setCategoryEn] = useState(post?.category?.en ?? '')
  const [dateLabelDe, setDateLabelDe] = useState(post?.date_label?.de ?? '')
  const [dateLabelEn, setDateLabelEn] = useState(post?.date_label?.en ?? '')
  const [readTimeDe, setReadTimeDe] = useState(post?.read_time?.de ?? '')
  const [readTimeEn, setReadTimeEn] = useState(post?.read_time?.en ?? '')
  const [titleDe, setTitleDe] = useState(post?.title?.de ?? '')
  const [titleEn, setTitleEn] = useState(post?.title?.en ?? '')
  const [excerptDe, setExcerptDe] = useState(post?.excerpt?.de ?? '')
  const [excerptEn, setExcerptEn] = useState(post?.excerpt?.en ?? '')
  const [published, setPublished] = useState(post?.published ?? true)
  const [sortOrder, setSortOrder] = useState(post?.sort_order ?? 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const editorDe = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Artikeltext (DE) …' }),
    ],
    content: post?.body_html?.de ?? '',
  })

  const editorEn = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Article body (EN) …' }),
    ],
    content: post?.body_html?.en ?? '',
  })

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const data = {
        id: id.trim(),
        glyph: glyph.trim() || null,
        category: { de: categoryDe, en: categoryEn },
        date_label: { de: dateLabelDe, en: dateLabelEn },
        read_time: { de: readTimeDe, en: readTimeEn },
        title: { de: titleDe, en: titleEn },
        excerpt: { de: excerptDe, en: excerptEn },
        body_html: {
          de: editorDe?.getHTML() ?? '',
          en: editorEn?.getHTML() ?? '',
        },
        published,
        sort_order: sortOrder,
      }

      if (isNew) {
        const { error } = await supabase.from('posts').insert(data)
        if (error) throw error
      } else {
        const { error } = await supabase.from('posts').update(data).eq('id', post!.id!)
        if (error) throw error
      }

      await fetch('/api/revalidate', { method: 'POST' })
      onSave()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
          {isNew ? 'Neuer Blogpost' : 'Post bearbeiten'}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onCancel} style={secondaryBtnStyle}>
            Abbrechen
          </button>
          <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
            {saving ? 'Speichern …' : 'Speichern'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.08)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {/* Row 1: ID + Glyph + Published */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'end' }}>
          <FormField label="Slug / ID">
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={!isNew}
              placeholder="beginner"
              style={{ ...inputStyle, opacity: isNew ? 1 : 0.6 }}
            />
          </FormField>
          <FormField label="Glyph">
            <input
              value={glyph}
              onChange={(e) => setGlyph(e.target.value)}
              placeholder="A1"
              style={{ ...inputStyle, width: 80, fontFamily: 'var(--font-mono)' }}
            />
          </FormField>
          <FormField label="Veröffentlicht">
            <div style={{ display: 'flex', alignItems: 'center', height: 40, gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--fg-muted)' }}>Aktiv</span>
            </div>
          </FormField>
        </div>

        {/* Row: Category + Date + Read time — DE / EN */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <FormField label="Kategorie (DE)">
              <input value={categoryDe} onChange={(e) => setCategoryDe(e.target.value)} placeholder="Guide" style={inputStyle} />
            </FormField>
            <FormField label="Datum (DE)">
              <input value={dateLabelDe} onChange={(e) => setDateLabelDe(e.target.value)} placeholder="12. März 2026" style={inputStyle} />
            </FormField>
            <FormField label="Lesezeit (DE)">
              <input value={readTimeDe} onChange={(e) => setReadTimeDe(e.target.value)} placeholder="5 Min. Lesezeit" style={inputStyle} />
            </FormField>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <FormField label="Category (EN)">
              <input value={categoryEn} onChange={(e) => setCategoryEn(e.target.value)} placeholder="Guide" style={inputStyle} />
            </FormField>
            <FormField label="Date (EN)">
              <input value={dateLabelEn} onChange={(e) => setDateLabelEn(e.target.value)} placeholder="March 12, 2026" style={inputStyle} />
            </FormField>
            <FormField label="Read time (EN)">
              <input value={readTimeEn} onChange={(e) => setReadTimeEn(e.target.value)} placeholder="5 min read" style={inputStyle} />
            </FormField>
          </div>
        </div>

        {/* Title + Excerpt — DE / EN */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Titel (DE)">
            <input value={titleDe} onChange={(e) => setTitleDe(e.target.value)} style={inputStyle} />
          </FormField>
          <FormField label="Title (EN)">
            <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} style={inputStyle} />
          </FormField>
          <FormField label="Teaser (DE)">
            <textarea value={excerptDe} onChange={(e) => setExcerptDe(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </FormField>
          <FormField label="Excerpt (EN)">
            <textarea value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </FormField>
        </div>

        {/* WYSIWYG editors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Artikeltext (DE)">
            <ToolBar editor={editorDe} />
            <EditorContent editor={editorDe} className="tiptap-editor" />
          </FormField>
          <FormField label="Article body (EN)">
            <ToolBar editor={editorEn} />
            <EditorContent editor={editorEn} className="tiptap-editor" />
          </FormField>
        </div>

        <FormField label="Reihenfolge">
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            style={{ ...inputStyle, width: 100 }}
          />
        </FormField>
      </div>
    </div>
  )
}

function ToolBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null

  const btn = (action: () => void, active: boolean, label: string) => (
    <button
      key={label}
      type="button"
      onMouseDown={(e) => { e.preventDefault(); action() }}
      style={{
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: active ? 700 : 400,
        color: active ? 'var(--accent)' : 'var(--fg-muted)',
        background: active ? 'var(--accent-soft)' : 'transparent',
        border: '1px solid transparent',
        borderRadius: 4,
        cursor: 'pointer',
        fontFamily: active ? 'var(--font-mono)' : 'inherit',
      }}
    >
      {label}
    </button>
  )

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.125rem',
        padding: '0.375rem',
        background: 'var(--bg-elev-2)',
        border: '1px solid var(--border)',
        borderBottom: 'none',
        borderRadius: 'var(--radius) var(--radius) 0 0',
      }}
    >
      {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'B')}
      {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'I')}
      {btn(() => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), 'U')}
      <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
      {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), 'H1')}
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'H2')}
      {btn(() => editor.chain().focus().setParagraph().run(), editor.isActive('paragraph'), 'P')}
      <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
      {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'UL')}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'OL')}
      {btn(() => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), '"')}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg-dim)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--fg)',
  fontSize: '0.875rem',
  padding: '0.5625rem 0.75rem',
  outline: 'none',
  fontFamily: 'inherit',
}

const primaryBtnStyle: React.CSSProperties = {
  background: 'var(--accent)',
  color: '#0a0a0b',
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: '0.5rem 1.25rem',
  borderRadius: 'var(--radius)',
  border: 'none',
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  background: 'var(--bg-elev-2)',
  color: 'var(--fg-muted)',
  fontWeight: 500,
  fontSize: '0.875rem',
  padding: '0.5rem 1.25rem',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  cursor: 'pointer',
}
