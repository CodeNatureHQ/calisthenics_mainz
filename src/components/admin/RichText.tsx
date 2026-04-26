'use client'

import { useRef, useState } from 'react'
import { useEditor, useEditorState, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'

const TabHandler = Extension.create({
  name: 'tabHandler',
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.sinkListItem('listItem'),
      'Shift-Tab': () => this.editor.commands.liftListItem('listItem'),
    }
  },
})

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export default function RichText({ value, onChange, placeholder = 'Text …', minHeight = 120 }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      TabHandler,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      bold:        ctx.editor?.isActive('bold') ?? false,
      italic:      ctx.editor?.isActive('italic') ?? false,
      underline:   ctx.editor?.isActive('underline') ?? false,
      bulletList:  ctx.editor?.isActive('bulletList') ?? false,
      orderedList: ctx.editor?.isActive('orderedList') ?? false,
      link:        ctx.editor?.isActive('link') ?? false,
    }),
  })

  if (!editor || !state) return null

  const btn = (onClick: () => void, active: boolean, label: React.ReactNode) => (
    <button
      key={String(label)}
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      style={{
        padding: '4px 7px', fontSize: '0.75rem', borderRadius: 4, cursor: 'pointer',
        fontWeight: active ? 700 : 400, border: '1px solid transparent',
        color: active ? 'var(--fg)' : 'var(--fg-mute)',
        background: active ? 'var(--bg-2)' : 'transparent',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: '4px 6px', background: 'var(--bg-3)', borderBottom: '1px solid var(--line-soft)', alignItems: 'center' }}>
        {btn(() => editor.chain().focus().toggleBold().run(), state.bold, 'B')}
        {btn(() => editor.chain().focus().toggleItalic().run(), state.italic, 'I')}
        {btn(() => editor.chain().focus().toggleUnderline().run(), state.underline, 'U')}
        <div style={{ width: 1, height: 14, background: 'var(--line-soft)', margin: '0 2px' }} />
        {btn(() => editor.chain().focus().toggleBulletList().run(), state.bulletList, 'UL')}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), state.orderedList, 'OL')}
        <div style={{ width: 1, height: 14, background: 'var(--line-soft)', margin: '0 2px' }} />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            if (state.link) editor.chain().focus().unsetLink().run()
            else {
              const url = window.prompt('URL:', 'https://')
              if (url) editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
            }
          }}
          style={{ padding: '4px 7px', fontSize: '0.75rem', borderRadius: 4, cursor: 'pointer', border: '1px solid transparent', color: state.link ? 'var(--fg)' : 'var(--fg-mute)', background: state.link ? 'var(--bg-2)' : 'transparent', display: 'inline-flex', alignItems: 'center', gap: 3 }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
          {state.link ? 'Entfernen' : 'Link'}
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="tiptap-editor"
        style={{ minHeight, border: 'none', borderRadius: 0 }}
      />
    </div>
  )
}
