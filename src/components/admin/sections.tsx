'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { CalendarDays, ChevronRight, Dumbbell, FileText, HelpCircle, LayoutDashboard, Mail, MapPin, Megaphone, Settings, ShoppingBag, Users, type LucideIcon } from 'lucide-react'

/**
 * Every admin area in one place: label, link, icon and where it sits in the navigation.
 * Sidebar, breadcrumbs and search read from here, so an area is named the same everywhere.
 */

export type SectionKey = 'dashboard' | 'nachrichten' | 'meldung' | 'blog' | 'events' | 'training' | 'spots' | 'team' | 'faq' | 'ausruestung' | 'settings'

export type Section = { key: SectionKey; label: string; href: string; icon: LucideIcon; group: string | null; description: string }

export const SECTIONS: Record<SectionKey, Section> = {
  dashboard:   { key: 'dashboard',   label: 'Übersicht',     href: '/admin',              icon: LayoutDashboard, group: null,            description: 'Was heute ansteht.' },
  nachrichten: { key: 'nachrichten', label: 'Nachrichten',   href: '/admin/nachrichten',  icon: Mail,            group: 'Kommunikation', description: 'Anfragen aus dem Kontaktformular „Mitmachen“.' },
  meldung:     { key: 'meldung',     label: 'Meldung',       href: '/admin/ankuendigung', icon: Megaphone,       group: 'Kommunikation', description: 'Hinweis, der beim Besuch als Fenster und danach als Leiste erscheint.' },
  training:    { key: 'training',    label: 'Training',      href: '/admin/training',     icon: Dumbbell,        group: 'Inhalte',       description: 'Wochenplan, Ausfälle und Extra-Termine im Bereich „Training“.' },
  events:      { key: 'events',      label: 'Events',        href: '/admin/events',       icon: CalendarDays,    group: 'Inhalte',       description: 'Jams, Wettkämpfe und Workshops mit Anmeldungen.' },
  blog:        { key: 'blog',        label: 'Blogposts',     href: '/admin/blog',         icon: FileText,        group: 'Inhalte',       description: 'Beiträge im Journal auf der Startseite.' },
  spots:       { key: 'spots',       label: 'Spots',         href: '/admin/spots',        icon: MapPin,          group: 'Inhalte',       description: 'Trainingsorte auf der Karte.' },
  team:        { key: 'team',        label: 'Team',          href: '/admin/team',         icon: Users,           group: 'Inhalte',       description: 'Trainer und Vorstand auf der Seite „Über uns“.' },
  faq:         { key: 'faq',         label: 'FAQ',           href: '/admin/faq',          icon: HelpCircle,      group: 'Inhalte',       description: 'Häufige Fragen am Ende der Startseite.' },
  ausruestung: { key: 'ausruestung', label: 'Ausrüstung',    href: '/admin/ausruestung',  icon: ShoppingBag,     group: 'Inhalte',       description: 'Produktempfehlungen auf der Ausrüstungsseite.' },
  settings:    { key: 'settings',    label: 'Einstellungen', href: '/admin/settings',     icon: Settings,        group: 'System',        description: 'Zahlen auf der Startseite, Impressum und Seiten ein/aus.' },
}

export const secVar = (key: SectionKey) => ({ '--sec': `var(--sec-${key}, var(--fg-dim))` }) as React.CSSProperties

/** The area's icon: monochrome, no container. Recognition comes from shape and position, not colour. */
export function SectionIcon({ section, size = 16 }: { section: SectionKey; size?: number }) {
  const Icon = SECTIONS[section].icon
  return <span className="admin-sec-icon"><Icon size={size} /></span>
}

type Crumb = { label: string; href?: string; onClick?: () => void }

/** Where am I: Übersicht › Inhalte › Training › Einheit bearbeiten. Every level above is clickable. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Pfad" className="admin-crumbs">
      {items.map((c, i) => {
        const last = i === items.length - 1
        const content = c.href ? <Link href={c.href}>{c.label}</Link> : c.onClick ? <button type="button" onClick={c.onClick}>{c.label}</button> : <span aria-current={last ? 'page' : undefined}>{c.label}</span>
        return <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{i > 0 && <ChevronRight size={13} aria-hidden="true" />}{content}</span>
      })}
    </nav>
  )
}

const trail = (s: Section): Crumb[] => s.key === 'dashboard' ? [] : [{ label: 'Übersicht', href: '/admin' }, ...(s.group ? [{ label: s.group }] : [])]

/** Page header: where am I (crumbs), the title with an optional count, and the one primary action. */
export function PageHeader({ section, title, count, description, action }: { section: SectionKey; title?: string; count?: number; description?: string; action?: ReactNode }) {
  const s = SECTIONS[section]
  return (
    <div>
      {section !== 'dashboard' && <Breadcrumbs items={[...trail(s), { label: s.label }]} />}
      <div className="admin-page-head">
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1>{title ?? s.label}{count !== undefined && <small>{count}</small>}</h1>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}

/** Above an open editor: the trail down to the item being edited. Every level above is a way back. */
export function BackTo({ section, onClick, current }: { section: SectionKey; onClick?: () => void; current?: string }) {
  const s = SECTIONS[section]
  return <Breadcrumbs items={[{ label: 'Übersicht', href: '/admin' }, onClick ? { label: s.label, onClick } : { label: s.label, href: s.href }, ...(current ? [{ label: current }] : [])]} />
}

export type Tone = 'ok' | 'mute' | 'danger' | 'accent' | 'info'

/** One status per row. As a button when it toggles something (e.g. visibility). */
export function Badge({ tone, children, onClick, title }: { tone: Tone; children: ReactNode; onClick?: () => void; title?: string }) {
  return onClick
    ? <button type="button" className="admin-badge" data-tone={tone} onClick={onClick} title={title}>{children}</button>
    : <span className="admin-badge" data-tone={tone} title={title}>{children}</span>
}
