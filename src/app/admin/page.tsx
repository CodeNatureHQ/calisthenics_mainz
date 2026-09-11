'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CalendarDays, Dumbbell, FileText, HelpCircle, Mail, MapPin, Megaphone, ShoppingBag, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { pageHead, crumbStyle, h1Style, card, sectionTitle, metaItem } from './shared'

/**
 * Die Übersicht: eine Seite, die auf einen Blick sagt, was ansteht und was es gibt.
 * Vorher sprang /admin direkt in die Blogposts — wer etwas anderes wollte, musste erst
 * die zehn Einträge der Seitenleiste absuchen.
 */

type Counts = {
  unhandled: number
  announcement: boolean
  upcoming: number
  posts: number
  events: number
  sessions: number
  spots: number
  team: number
  faq: number
  products: number
}

const tiles: { key: keyof Counts; href: string; label: string; sub: string; icon: React.ReactNode }[] = [
  { key: 'posts', href: '/admin/blog', label: 'Blogposts', sub: 'Beiträge', icon: <FileText size={16} /> },
  { key: 'events', href: '/admin/events', label: 'Events', sub: 'gesamt', icon: <CalendarDays size={16} /> },
  { key: 'sessions', href: '/admin/training', label: 'Training', sub: 'Einheiten', icon: <Dumbbell size={16} /> },
  { key: 'spots', href: '/admin/spots', label: 'Spots', sub: 'Orte', icon: <MapPin size={16} /> },
  { key: 'team', href: '/admin/team', label: 'Team', sub: 'Mitglieder', icon: <Users size={16} /> },
  { key: 'faq', href: '/admin/faq', label: 'FAQ', sub: 'Fragen', icon: <HelpCircle size={16} /> },
  { key: 'products', href: '/admin/ausruestung', label: 'Ausrüstung', sub: 'Produkte', icon: <ShoppingBag size={16} /> },
]

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null)

  useEffect(() => {
    const supabase = createClient()
    // Nur Zähler, keine Zeilen: `head: true` lässt die Daten weg und bringt die Anzahl.
    const c = (p: PromiseLike<{ count: number | null }>) => Promise.resolve(p).then(r => r.count ?? 0)
    const all = (table: string) => c(supabase.from(table).select('*', { count: 'exact', head: true }))
    Promise.all([
      c(supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('handled', false)),
      supabase.from('site_settings').select('announcement_active').limit(1).then(({ data }) => !!data?.[0]?.announcement_active),
      c(supabase.from('events').select('*', { count: 'exact', head: true }).gte('starts_at', new Date().toISOString())),
      all('posts'),
      all('events'),
      all('training_sessions'),
      all('spots'),
      all('team_members'),
      all('faq_items'),
      all('products'),
    ]).then(([unhandled, announcement, upcoming, posts, events, sessions, spots, team, faq, products]) =>
      setCounts({ unhandled, announcement, upcoming, posts, events, sessions, spots, team, faq, products }),
    )
  }, [])

  return (
    <div>
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>Admin</span>
          <h1 style={h1Style}>Übersicht</h1>
        </div>
      </div>

      {/* Was Aufmerksamkeit braucht, zuerst — deshalb steht es über den Zählern. */}
      <p style={{ ...sectionTitle, marginBottom: 12 }}>Steht an</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 36 }}>
        <StatusCard
          href="/admin/nachrichten"
          icon={<Mail size={16} />}
          label="Offene Nachrichten"
          value={counts ? String(counts.unhandled) : '…'}
          tone={counts && counts.unhandled > 0 ? 'warn' : 'ok'}
          hint={counts && counts.unhandled > 0 ? 'unbeantwortet' : 'alles beantwortet'}
        />
        <StatusCard
          href="/admin/ankuendigung"
          icon={<Megaphone size={16} />}
          label="Meldung"
          value={counts ? (counts.announcement ? 'Aktiv' : 'Aus') : '…'}
          tone={counts?.announcement ? 'warn' : 'ok'}
          hint={counts?.announcement ? 'wird auf der Seite gezeigt' : 'keine Meldung geschaltet'}
        />
        <StatusCard
          href="/admin/events"
          icon={<CalendarDays size={16} />}
          label="Kommende Events"
          value={counts ? String(counts.upcoming) : '…'}
          tone="ok"
          hint="ab heute"
        />
      </div>

      {/* Die Inhalte: je Bereich ein Zähler und ein Sprung. */}
      <p style={{ ...sectionTitle, marginBottom: 12 }}>Inhalte</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {tiles.map(t => (
          <Link key={t.href} href={t.href} style={{ ...card, padding: 18, textDecoration: 'none', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--fg-mute)', marginBottom: 14 }}>
              {t.icon}
              <ArrowUpRight size={14} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--fg)', lineHeight: 1 }}>
              {counts ? counts[t.key] : '…'}
            </div>
            <div style={{ ...metaItem, marginTop: 8 }}>{t.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--fg-mute)', letterSpacing: '0.06em', marginTop: 2 }}>{t.sub}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatusCard({ href, icon, label, value, hint, tone }: { href: string; icon: React.ReactNode; label: string; value: string; hint: string; tone: 'ok' | 'warn' }) {
  return (
    <Link href={href} style={{ ...card, padding: 18, textDecoration: 'none', display: 'block', borderColor: tone === 'warn' ? 'color-mix(in srgb, var(--warning) 40%, transparent)' : 'var(--line-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--fg-mute)', marginBottom: 12 }}>
        {icon}
        <span style={sectionTitle}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: tone === 'warn' ? 'var(--accent)' : 'var(--fg)', lineHeight: 1, textTransform: 'uppercase' }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em', marginTop: 8 }}>{hint}</div>
    </Link>
  )
}
