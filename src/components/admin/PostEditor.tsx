'use client'

import { useRef, useState } from 'react'
import { useEditor, useEditorState, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'

const TabHandler = Extension.create({
  name: 'tabHandler',
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.sinkListItem('listItem'),
      'Shift-Tab': () => this.editor.commands.liftListItem('listItem'),
    }
  },
})
import type { Post } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/slugify'
import { inp, fieldLabel, errorBox, btnPrimary, btnGhost } from '@/app/admin/shared'

type Props = { post: Partial<Post> | null; onSave: () => void; onCancel: () => void }

function autoReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} Min. Lesezeit`
}

function autoDate(): string {
  return new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PostEditor({ post, onSave, onCancel }: Props) {
  const isNew = !post?.id
  const [id, setId] = useState(post?.id ?? '')
  const [title, setTitle] = useState(post?.title?.de ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt?.de ?? '')
  const [published, setPublished] = useState(post?.published ?? true)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: 'Artikeltext …' }),
      TabHandler,
    ],
    content: post?.body_html?.de ?? '',
  })

  const previewHtml = useEditorState({
    editor,
    selector: (ctx) => ctx.editor?.getHTML() ?? '',
  })

  async function handleSave() {
    if (!title.trim()) { setError('"Titel" ist ein Pflichtfeld.'); return }
    if (!excerpt.trim()) { setError('"Teaser" ist ein Pflichtfeld.'); return }

    setSaving(true); setError('')
    try {
      const supabase = createClient()
      const html = editor?.getHTML() ?? ''
      const slug = isNew ? slugify(title) : id
      const readTime = autoReadTime(html)
      const date = post?.date_label?.de ?? autoDate()
      const data = {
        id: slug,
        glyph: null,
        category:   { de: 'Post', en: 'Post' },
        date_label: { de: date, en: date },
        read_time:  { de: readTime, en: readTime },
        title:      { de: title, en: title },
        excerpt:    { de: excerpt, en: excerpt },
        body_html:  { de: html, en: html },
        published,
        sort_order: post?.sort_order ?? 0,
      }
      if (isNew) {
        const { error: e } = await supabase.from('posts').insert(data)
        if (e) throw e
      } else {
        const { error: e } = await supabase.from('posts').update(data).eq('id', post!.id!)
        if (e) throw e
      }
      await fetch('/api/revalidate', { method: 'POST' })
      onSave()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderRadius: 14, padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, textTransform: 'uppercase', color: 'var(--fg)', margin: 0 }}>
          {isNew ? 'Neuer Blogpost' : 'Post bearbeiten'}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={btnGhost}>Abbrechen</button>
          <button onClick={handleSave} disabled={saving} style={btnPrimary}>{saving ? 'Speichern …' : 'Speichern'}</button>
        </div>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Status */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Field label="Status">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', height: 42, padding: '0 14px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8 }}>
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: 'var(--ok)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: published ? 'var(--ok)' : 'var(--fg-mute)', whiteSpace: 'nowrap' }}>
                {published ? 'Aktiv' : 'Entwurf'}
              </span>
            </label>
          </Field>
        </div>

        {/* Titel */}
        <Field label="Titel *">
          <input
            value={title}
            onChange={e => { setTitle(e.target.value); if (isNew) setId(slugify(e.target.value)) }}
            placeholder="Titel des Beitrags"
            style={inp}
          />
        </Field>

        {/* Teaser */}
        <Field label="Teaser *">
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)}
            placeholder="Kurze Beschreibung des Beitrags …"
            rows={2} style={{ ...inp, resize: 'vertical' }} />
        </Field>

        {/* Editor + Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }} className="admin-lang-pair">
          <Field label="Artikeltext">
            <ToolBar editor={editor} />
            <EditorContent editor={editor} className="tiptap-editor" />
          </Field>

          <Field label="Vorschau">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Toolbar-height placeholder so preview aligns with editor */}
              <div style={{
                padding: '4px 6px',
                background: 'var(--bg-3)',
                border: '1px solid var(--line-soft)',
                borderBottom: 'none',
                borderRadius: '8px 8px 0 0',
                display: 'flex', alignItems: 'center', gap: 4,
                minHeight: 33,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em', padding: '4px 7px' }}>
                  Live-Vorschau
                </span>
              </div>
              <div
                className="prose-cm"
                dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:var(--fg-mute);margin:0;font-size:13px">Noch kein Inhalt …</p>' }}
                style={{
                  ...inp,
                  flex: 1,
                  minHeight: 200,
                  overflowY: 'auto',
                  cursor: 'default',
                  borderRadius: '0 0 8px 8px',
                  borderTop: 'none',
                }}
              />
            </div>
          </Field>
        </div>

      </div>
    </div>
  )
}

/* ── Toolbar ─────────────────────────────────────────────────────────── */

function ToolBar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      bold:        ctx.editor?.isActive('bold') ?? false,
      italic:      ctx.editor?.isActive('italic') ?? false,
      underline:   ctx.editor?.isActive('underline') ?? false,
      h1:          ctx.editor?.isActive('heading', { level: 1 }) ?? false,
      h2:          ctx.editor?.isActive('heading', { level: 2 }) ?? false,
      bulletList:  ctx.editor?.isActive('bulletList') ?? false,
      orderedList: ctx.editor?.isActive('orderedList') ?? false,
      blockquote:  ctx.editor?.isActive('blockquote') ?? false,
      link:        ctx.editor?.isActive('link') ?? false,
    }),
  })

  if (!editor || !state) return null

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `blog/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('post-images').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('post-images').getPublicUrl(path)
      editor?.chain().focus().setImage({ src: data.publicUrl }).run()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const btn = (onClick: () => void, active: boolean, label: string) => (
    <button key={label} type="button" onMouseDown={e => { e.preventDefault(); onClick() }}
      style={{ padding: '4px 7px', fontSize: '0.75rem', borderRadius: 4, cursor: 'pointer', fontWeight: active ? 700 : 400, border: '1px solid transparent', color: active ? 'var(--fg)' : 'var(--fg-mute)', background: active ? 'var(--bg-2)' : 'transparent' }}>
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: '4px 6px', background: 'var(--bg-3)', border: '1px solid var(--line-soft)', borderBottom: 'none', borderRadius: '8px 8px 0 0', alignItems: 'center' }}>
      {btn(() => editor.chain().focus().toggleBold().run(), state.bold, 'B')}
      {btn(() => editor.chain().focus().toggleItalic().run(), state.italic, 'I')}
      {btn(() => editor.chain().focus().toggleUnderline().run(), state.underline, 'U')}
      <div style={{ width: 1, height: 16, background: 'var(--line-soft)', margin: '0 3px' }} />
      {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), state.h1, 'H1')}
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), state.h2, 'H2')}
      <div style={{ width: 1, height: 16, background: 'var(--line-soft)', margin: '0 3px' }} />
      {btn(() => editor.chain().focus().toggleBulletList().run(), state.bulletList, 'UL')}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), state.orderedList, 'OL')}
      {btn(() => editor.chain().focus().toggleBlockquote().run(), state.blockquote, '"')}
      <div style={{ width: 1, height: 16, background: 'var(--line-soft)', margin: '0 3px' }} />
      <button type="button" onMouseDown={e => {
        e.preventDefault()
        if (state.link) editor.chain().focus().unsetLink().run()
        else { const url = window.prompt('URL:', 'https://'); if (url) editor.chain().focus().setLink({ href: url, target: '_blank' }).run() }
      }} style={{ padding: '4px 7px', fontSize: '0.75rem', borderRadius: 4, cursor: 'pointer', border: '1px solid transparent', color: state.link ? 'var(--fg)' : 'var(--fg-mute)', background: state.link ? 'var(--bg-2)' : 'transparent', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
        {state.link ? 'Entfernen' : 'Link'}
      </button>
      <button type="button" onMouseDown={e => { e.preventDefault(); fileRef.current?.click() }} disabled={uploading}
        style={{ padding: '4px 7px', fontSize: '0.75rem', borderRadius: 4, cursor: 'pointer', border: '1px solid transparent', color: 'var(--fg-mute)', background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        {uploading ? '…' : 'Bild'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
    </div>
  )
}

/* ── Field ───────────────────────────────────────────────────────────── */

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <label style={fieldLabel}>{label}</label>
        {hint && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-mute)', letterSpacing: '0.04em' }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}
