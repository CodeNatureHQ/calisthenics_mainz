'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/**
 * Nur für eingeloggte Admins: ein Knopf unten links, der zu dem Admin-Bereich führt,
 * den man gerade auf der Seite sieht. Wer einen Fehler entdeckt, ist mit einem Klick
 * an der richtigen Stelle. Besucher sehen nichts, die Seite bleibt statisch.
 */

const SECTIONS: [id: string, href: string, label: string][] = [
  ['hero', '/admin/settings#hero', 'Startseite'],
  ['training', '/admin/training', 'Training'],
  ['events', '/admin/events', 'Events'],
  ['spots', '/admin/spots', 'Spots'],
  ['about', '/admin/settings#about', 'Über uns'],
  ['ueber-uns', '/admin/settings#about', 'Über uns'],
  ['blog', '/admin/blog', 'Blog'],
  ['faq', '/admin/faq', 'FAQ'],
  ['join', '/admin/nachrichten', 'Nachrichten'],
  ['mitmachen', '/admin/nachrichten', 'Nachrichten'],
]

function targetFor(pathname: string, section: string | null): [string, string] {
  const [, , page, slug] = pathname.split('/')
  if (page === 'blog' && slug) return [`/admin/blog?edit=${encodeURIComponent(decodeURIComponent(slug))}`, 'Diesen Post']
  if (page === 'ueber-uns') return ['/admin/team', 'Team']
  if (page === 'ausruestung') return ['/admin/ausruestung', 'Ausrüstung']
  if (page === 'impressum') return ['/admin/settings#impressum', 'Impressum']
  const hit = SECTIONS.find(([id]) => id === section)
  return hit ? [hit[1], hit[2]] : ['/admin', 'Admin']
}

export default function AdminEditPill() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [section, setSection] = useState<string | null>(null)

  useEffect(() => {
    // reads the local session only, no network round trip for visitors
    createClient().auth.getSession().then(({ data }) => setIsAdmin(!!data.session))
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setSection(visible.target.id)
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [isAdmin, pathname])

  if (!isAdmin) return null
  const [href, label] = targetFor(pathname, section)
  return (
    <a href={href} className="admin-edit-pill">
      <Pencil size={14} /> {label} bearbeiten
    </a>
  )
}
