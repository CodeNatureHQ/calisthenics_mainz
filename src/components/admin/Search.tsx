'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarDays, CalendarX, Dumbbell, FileText, HelpCircle, LayoutDashboard, Mail, MapPin, Megaphone, Plus, Repeat, Search, Settings, ShoppingBag, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/admin'
import { fullDayLabel } from '@/lib/utils'


/**
 * Finden statt Suchen: ein Feld für alles. Jeder Treffer führt direkt in den Editor
 * (über die `?edit=`-Links der Listen), jede "Neu"-Aktion direkt ins leere Formular.
 * Öffnet mit ⌘K / Strg+K, über den Knopf in der Seitenleiste oder `openSearch()`.
 */

type Entry = { label: string; sub?: string; kind: string; href: string; icon: React.ReactNode; keywords?: string }

const ACTIONS: Entry[] = [
  { label: 'Meldung schalten', kind: 'Aktion', href: '/admin/ankuendigung', icon: <Megaphone size={16} />, keywords: 'ankündigung banner hinweis news popup' },
  { label: 'Training absagen', kind: 'Aktion', href: '/admin/training?override=new', icon: <CalendarX size={16} />, keywords: 'ausfall fällt aus cancel feiertag' },
  { label: 'Extra-Training eintragen', kind: 'Aktion', href: '/admin/training?extra=new', icon: <Plus size={16} />, keywords: 'zusatz sondertermin einmalig' },
  { label: 'Neues Event', kind: 'Aktion', href: '/admin/events?edit=new', icon: <Plus size={16} />, keywords: 'jam wettkampf workshop termin' },
  { label: 'Neuer Blogpost', kind: 'Aktion', href: '/admin/blog?edit=new', icon: <Plus size={16} />, keywords: 'artikel beitrag news journal' },
  { label: 'Neue FAQ-Frage', kind: 'Aktion', href: '/admin/faq?edit=new', icon: <Plus size={16} />, keywords: 'frage antwort' },
  { label: 'Neues Team-Mitglied', kind: 'Aktion', href: '/admin/team?edit=new', icon: <Plus size={16} />, keywords: 'trainer vorstand person' },
  { label: 'Neuer Spot', kind: 'Aktion', href: '/admin/spots?edit=new', icon: <Plus size={16} />, keywords: 'ort park anlage' },
  { label: 'Neues Produkt', kind: 'Aktion', href: '/admin/ausruestung?edit=new', icon: <Plus size={16} />, keywords: 'ausrüstung amazon' },
  { label: 'Neues wiederkehrendes Event', kind: 'Aktion', href: '/admin/events?recurring=new', icon: <Plus size={16} />, keywords: 'stammtisch monatlich' },
  { label: 'Hero-Zahlen', sub: 'Mitglieder, Einheiten, Heimspot, Beitrag', kind: 'Einstellung', href: '/admin/settings#hero', icon: <Settings size={16} />, keywords: 'startseite statistik' },
  { label: 'Über-uns-Zahlen', sub: 'Mitglieder, Gegründet, Spots, Einheiten', kind: 'Einstellung', href: '/admin/settings#about', icon: <Settings size={16} /> },
  { label: 'Impressum', sub: 'Vorsitz, Adresse, Registernummer, E-Mail', kind: 'Einstellung', href: '/admin/settings#impressum', icon: <Settings size={16} />, keywords: 'kontakt anschrift' },
  { label: 'Ausrüstungsseite ein/aus', kind: 'Einstellung', href: '/admin/settings#seiten', icon: <Settings size={16} />, keywords: 'feature flag' },
]

const PAGES: Entry[] = [
  { label: 'Übersicht', kind: 'Bereich', href: '/admin', icon: <LayoutDashboard size={16} />, keywords: 'dashboard start home' },
  { label: 'Nachrichten', kind: 'Bereich', href: '/admin/nachrichten', icon: <Mail size={16} />, keywords: 'kontakt anfragen' },
  { label: 'Blogposts', kind: 'Bereich', href: '/admin/blog', icon: <FileText size={16} /> },
  { label: 'Events', kind: 'Bereich', href: '/admin/events', icon: <CalendarDays size={16} />, keywords: 'anmeldungen' },
  { label: 'Training', kind: 'Bereich', href: '/admin/training', icon: <Dumbbell size={16} />, keywords: 'wochenplan zeiten' },
  { label: 'Spots', kind: 'Bereich', href: '/admin/spots', icon: <MapPin size={16} /> },
  { label: 'Team', kind: 'Bereich', href: '/admin/team', icon: <Users size={16} /> },
  { label: 'FAQ', kind: 'Bereich', href: '/admin/faq', icon: <HelpCircle size={16} /> },
  { label: 'Ausrüstung', kind: 'Bereich', href: '/admin/ausruestung', icon: <ShoppingBag size={16} /> },
  { label: 'Einstellungen', kind: 'Bereich', href: '/admin/settings', icon: <Settings size={16} /> },
]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss')
const strip = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const dateDe = (iso: string) => new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })

async function loadContent(): Promise<Entry[]> {
  const db = createClient()
  const today = new Date().toISOString().slice(0, 10)
  const [posts, events, recurring, sessions, overrides, spots, team, faq, products, messages] = await Promise.all([
    db.from('posts').select('id,title,excerpt,published'),
    db.from('events').select('id,title,place,starts_at').order('starts_at', { ascending: false }),
    db.from('recurring_events').select('id,title,time_label'),
    db.from('training_sessions').select('id,day_of_week,time_label,place').order('day_of_week'),
    db.from('calendar_overrides').select('id,type,on_date,note').gte('on_date', today).order('on_date'),
    db.from('spots').select('id,name,address'),
    db.from('team_members').select('id,name,role'),
    db.from('faq_items').select('id,question_de,answer_de'),
    db.from('products').select('id,name_de,category'),
    db.from('contact_messages').select('id,name,email,message,handled').order('created_at', { ascending: false }).limit(50),
  ])
  const out: Entry[] = []
  for (const p of posts.data ?? []) out.push({ label: p.title.de, sub: p.published ? strip(p.excerpt?.de ?? '') : 'Entwurf', kind: 'Blogpost', href: `/admin/blog?edit=${encodeURIComponent(p.id)}`, icon: <FileText size={16} /> })
  for (const e of events.data ?? []) out.push({ label: e.title.de, sub: `${dateDe(e.starts_at)} · ${e.place?.de ?? ''}`, kind: 'Event', href: `/admin/events?edit=${encodeURIComponent(e.id)}`, icon: <CalendarDays size={16} /> })
  for (const r of recurring.data ?? []) out.push({ label: r.title.de, sub: r.time_label, kind: 'Wiederkehrend', href: `/admin/events?recurring=${r.id}`, icon: <Repeat size={16} /> })
  for (const s of sessions.data ?? []) out.push({ label: `${fullDayLabel(s.day_of_week, 'de')} ${s.time_label}`, sub: s.place?.de, kind: 'Training', href: `/admin/training?session=${s.id}`, icon: <Dumbbell size={16} /> })
  for (const o of overrides.data ?? []) out.push({ label: `${o.type === 'cancel' ? 'Ausfall' : 'Extra-Training'} ${dateDe(o.on_date + 'T12:00')}`, sub: o.note?.de, kind: 'Termin', href: `/admin/training?override=${o.id}`, icon: <CalendarX size={16} /> })
  for (const s of spots.data ?? []) out.push({ label: s.name.de, sub: s.address, kind: 'Spot', href: `/admin/spots?edit=${encodeURIComponent(s.id)}`, icon: <MapPin size={16} /> })
  for (const m of team.data ?? []) out.push({ label: m.name, sub: m.role === 'vorstand' ? 'Vorstand' : 'Trainer', kind: 'Team', href: `/admin/team?edit=${m.id}`, icon: <Users size={16} /> })
  for (const f of faq.data ?? []) out.push({ label: f.question_de, sub: strip(f.answer_de ?? ''), kind: 'FAQ', href: `/admin/faq?edit=${f.id}`, icon: <HelpCircle size={16} /> })
  for (const p of products.data ?? []) out.push({ label: p.name_de, sub: p.category, kind: 'Produkt', href: `/admin/ausruestung?edit=${p.id}`, icon: <ShoppingBag size={16} /> })
  for (const m of messages.data ?? []) out.push({ label: m.name, sub: `${m.handled ? '' : 'Offen · '}${m.message}`, kind: 'Nachricht', href: `/admin/nachrichten?open=${m.id}`, icon: <Mail size={16} />, keywords: m.email })
  return out
}

export function openSearch(query = '') {
  window.dispatchEvent(new CustomEvent('admin:search', { detail: query }))
}

export function SearchTrigger({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <button type="button" onClick={() => openSearch()} aria-label="Suchen" style={{ width: 36, height: 36, border: '1px solid var(--line)', borderRadius: 10, background: 'none', color: 'var(--fg)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
        <Search size={16} />
      </button>
    )
  }
  return (
    <button type="button" className="admin-search-trigger" onClick={() => openSearch()}>
      <Search size={14} /> Suchen oder erstellen <span className="admin-kbd">⌘K</span>
    </button>
  )
}

export default function SearchPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [content, setContent] = useState<Entry[] | null>(null)
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  const show = useCallback((q = '') => {
    setQuery(q); setActive(0); setOpen(true)
    // fresh on every open: the index is small and edits should show up right away
    loadContent().then(setContent)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); show() }
    }
    const onOpen = (e: Event) => show((e as CustomEvent<string>).detail ?? '')
    window.addEventListener('keydown', onKey)
    window.addEventListener('admin:search', onOpen)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('admin:search', onOpen) }
  }, [show])

  const results = useMemo(() => {
    const tokens = norm(query).split(/\s+/).filter(Boolean)
    if (!tokens.length) return [...ACTIONS.slice(0, 6), ...PAGES]
    const all = [...ACTIONS, ...(content ?? []), ...PAGES]
    const scored: { e: Entry; score: number }[] = []
    for (const e of all) {
      const label = norm(e.label)
      const hay = `${label} ${norm(e.sub ?? '')} ${norm(e.kind)} ${norm(e.keywords ?? '')}`
      if (!tokens.every((t) => hay.includes(t))) continue
      const first = tokens[0]
      const score = (label.startsWith(first) ? 0 : label.includes(first) ? 1 : 2) + (e.kind === 'Bereich' ? 0.5 : 0)
      scored.push({ e, score })
    }
    return scored.sort((a, b) => a.score - b.score).slice(0, 40).map((s) => s.e)
  }, [query, content])

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  const go = (e?: Entry) => { if (!e) return; setOpen(false); router.push(e.href) }

  return (
    <div className="admin-palette-backdrop" onMouseDown={() => setOpen(false)}>
      <div className="admin-palette" role="dialog" aria-label="Suchen" onMouseDown={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          placeholder="Was möchtest du ändern? z. B. „Stammtisch“, „Impressum“, „absagen“"
          onChange={(e) => { setQuery(e.target.value); setActive(0) }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
            else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
            else if (e.key === 'Enter') { e.preventDefault(); go(results[active]) }
          }}
        />
        <ul ref={listRef} role="listbox">
          {results.length === 0 && (
            <li style={{ padding: '18px 14px', color: 'var(--fg-mute)', font: '500 14px var(--font-sans)' }}>
              {content === null ? 'Lädt …' : 'Nichts gefunden.'}
            </li>
          )}
          {results.map((e, i) => (
            <li key={e.href + i}>
              <Link href={e.href} aria-selected={i === active} role="option" onMouseEnter={() => setActive(i)} onClick={() => setOpen(false)}>
                <span className="icon">{e.icon}</span>
                <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.label}</span>
                  {e.sub && <span className="sub">{e.sub}</span>}
                </span>
                <span className="kind">{e.kind}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
