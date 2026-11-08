'use client'

import { useState, type ReactNode } from 'react'
import { Plus, X } from 'lucide-react'
import { BackTo, type SectionKey } from './sections'
import { fieldLabel, fieldHint, formShell, formHead, formTitle, formSection, formSectionTitle, formSectionDesc, formFields, formActions, errorBox, btnPrimary, btnGhost } from '@/app/admin/shared'

/**
 * The form vocabulary of the admin. A form is a shell with a title, a few named
 * sections (what am I filling in, and why), and a footer that always looks the
 * same: Cancel on the left, the one primary action on the right.
 */

export function FormShell({ title, error, children, onCancel, onSave, saving, saveLabel = 'Speichern', disabled, section, onDelete, deleteLabel = 'Löschen' }: {
  title: string; error?: string; children: ReactNode
  onCancel: () => void; onSave: () => void; saving?: boolean; saveLabel?: string; disabled?: boolean
  /** Shows the breadcrumb trail (Übersicht › FAQ › Frage bearbeiten) above the editor. */
  section?: SectionKey
  /** Delete lives inside the editor, not in the list: it is the rare, destructive action. */
  onDelete?: () => void; deleteLabel?: string
}) {
  return (
    <div>
      {section && <BackTo section={section} onClick={onCancel} current={title} />}
      <div style={formShell}>
        <div style={formHead}>
          <h2 style={formTitle}>{title}</h2>
        </div>
        {error && <div style={{ ...errorBox, margin: '16px 24px 0' }}>{error}</div>}
        {children}
        <div style={{ ...formActions, borderTop: '1px solid var(--line-soft)' }}>
          {onDelete && <button type="button" onClick={onDelete} className="admin-text-danger">{deleteLabel}</button>}
          <button type="button" onClick={onCancel} style={{ ...btnGhost, marginLeft: 'auto' }}>Abbrechen</button>
          <button type="button" onClick={onSave} disabled={saving || disabled} style={btnPrimary}>{saving ? 'Speichern …' : saveLabel}</button>
        </div>
      </div>
    </div>
  )
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div style={formSection} className="admin-form-section">
      <div>
        <h3 style={formSectionTitle}>{title}</h3>
        {description && <p style={formSectionDesc}>{description}</p>}
      </div>
      <div style={formFields}>{children}</div>
    </div>
  )
}

export function Field({ label, hint, optional, children }: { label: string; hint?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div style={{ minWidth: 0 }}>
      <label style={fieldLabel}>{label}{optional && <span style={{ color: 'var(--fg-mute)', fontWeight: 400 }}> · optional</span>}</label>
      {children}
      {hint && <div style={fieldHint}>{hint}</div>}
    </div>
  )
}

export function Grid({ cols = 2, children }: { cols?: 2 | 3; children: ReactNode }) {
  return <div className={`admin-grid-${cols}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 14 }}>{children}</div>
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="admin-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="admin-toggle-track" aria-hidden="true" />
      <span>
        <span className="admin-toggle-label" style={{ display: 'block' }}>{label}</span>
        {description && <span className="admin-toggle-desc" style={{ display: 'block' }}>{description}</span>}
      </span>
    </label>
  )
}

/** True when an HTML or plain value has no visible text (an empty editor yields `<p></p>`). */
export const isBlank = (v?: string | null) => !v || (!/<img/i.test(v) && v.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === '')

/**
 * German first, English optional. Most changes only ever need German; the public site
 * falls back to it when English is empty. The English field stays one click away and
 * opens by itself when there already is an English text.
 */
export function LangColumns({ label, hint, optional, de, en, enValue }: { label: string; hint?: string; optional?: boolean; de: ReactNode; en: ReactNode; enValue?: string | null }) {
  const [showEn, setShowEn] = useState(!isBlank(enValue))
  return (
    <Field label={label} hint={hint} optional={optional}>
      {de}
      {showEn ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="admin-lang-tag" data-lang="en">English</span>
            {isBlank(enValue) && <button type="button" className="admin-en-toggle" style={{ marginTop: 0 }} onClick={() => setShowEn(false)}><X size={13} /> ausblenden</button>}
          </div>
          {en}
        </div>
      ) : (
        <button type="button" className="admin-en-toggle" onClick={() => setShowEn(true)}>
          <Plus size={13} /> Englisch <span style={{ fontWeight: 400 }}>· optional, sonst wird Deutsch gezeigt</span>
        </button>
      )}
    </Field>
  )
}
