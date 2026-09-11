'use client'

import type { ReactNode } from 'react'
import { fieldLabel, fieldHint, formShell, formHead, formTitle, formSection, formSectionTitle, formSectionDesc, formFields, formActions, errorBox, btnPrimary, btnGhost } from '@/app/admin/shared'

/**
 * The form vocabulary of the admin. A form is a shell with a title, a few named
 * sections (what am I filling in, and why), and a footer that always looks the
 * same: Cancel on the left, the one primary action on the right.
 */

export function FormShell({ title, error, children, onCancel, onSave, saving, saveLabel = 'Speichern', disabled }: {
  title: string; error?: string; children: ReactNode
  onCancel: () => void; onSave: () => void; saving?: boolean; saveLabel?: string; disabled?: boolean
}) {
  return (
    <div style={formShell}>
      <div style={formHead}><h2 style={formTitle}>{title}</h2></div>
      {error && <div style={{ ...errorBox, margin: '16px 24px 0' }}>{error}</div>}
      {children}
      <div style={{ ...formActions, borderTop: '1px solid var(--line-soft)' }}>
        <button type="button" onClick={onCancel} style={{ ...btnGhost, marginRight: 'auto' }}>Abbrechen</button>
        <button type="button" onClick={onSave} disabled={saving || disabled} style={btnPrimary}>{saving ? 'Speichern …' : saveLabel}</button>
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

/** Two language columns for anything that needs German and English. Pass a render function for custom inputs (rich text). */
export function LangColumns({ label, hint, optional, de, en }: { label: string; hint?: string; optional?: boolean; de: ReactNode; en: ReactNode }) {
  return (
    <Field label={label} hint={hint} optional={optional}>
      <div className="admin-lang-pair">
        <div><span className="admin-lang-tag" data-lang="de">Deutsch</span>{de}</div>
        <div><span className="admin-lang-tag" data-lang="en">English</span>{en}</div>
      </div>
    </Field>
  )
}
