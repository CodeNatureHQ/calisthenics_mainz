'use client'

import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import PublicMotion from './public/PublicMotion'
import Link from 'next/link'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import type { Lang } from '@/lib/types'

export default function Nav({ lang, showAusruestung = false }: { lang: Lang; showAusruestung?: boolean }) {
  const { setLang } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const header = useRef<HTMLElement>(null)
  useEffect(() => {
    const update = () => {
      if (header.current) header.current.dataset.scrolled = String(window.scrollY > 20)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  const de = lang === 'de'
  const home = `/${lang}`
  const base = pathname === home || pathname === `${home}/` ? '' : home
  const join = `${base}#${de ? 'mitmachen' : 'join'}`
  const items = [
    { href: `${base}#training`, label: 'Training' },
    { href: `${base}#events`, label: 'Events' },
    { href: `${base}#spots`, label: 'Spots' },
    { href: `${home}/ueber-uns`, label: de ? 'Über uns' : 'About us' },
    { href: `${base}#faq`, label: 'FAQ' },
    ...(showAusruestung ? [{ href: `${home}/ausruestung`, label: de ? 'Ausrüstung' : 'Equipment' }] : []),
  ]
  useEffect(() => {
    if (!menuOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [menuOpen])

  return (
    <>
      <PublicMotion />
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />}
      <header ref={header} className="club-nav" data-menu-open={menuOpen}>
        <div className="container club-nav-inner">
          <Link href={home} className="club-brand" onClick={() => setMenuOpen(false)}>
            <Image src="/logo.png" alt="" width={44} height={44} />
            <span>Calisthenics<strong>Mainz<span className="brand-period">.</span></strong></span>
          </Link>
          <nav className="club-desktop-nav" aria-label={de ? 'Hauptnavigation' : 'Main navigation'}>
            {items.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <div className="club-nav-actions">
            <ThemeToggle lang={lang} />
            <div className="club-languages" aria-label={de ? 'Sprache' : 'Language'}>
              {(['de', 'en'] as Lang[]).map(l => <button key={l} onClick={() => { setLang(l); setMenuOpen(false) }} aria-pressed={l === lang}>{l.toUpperCase()}</button>)}
            </div>
            <a href={join} className="club-button nav-join">{de ? 'Mitmachen' : 'Join us'}<ArrowUpRight size={16} /></a>
            <button className="club-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={de ? (menuOpen ? 'Menü schließen' : 'Menü öffnen') : (menuOpen ? 'Close menu' : 'Open menu')} aria-expanded={menuOpen} aria-controls="club-mobile-nav">{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
          </div>
        </div>
        <nav id="club-mobile-nav" className="club-mobile-nav" hidden={!menuOpen} aria-label={de ? 'Mobile Navigation' : 'Mobile navigation'}>
          {items.map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight size={17} /></a>)}
          <a href={`${base}#blog`} onClick={() => setMenuOpen(false)}>Blog<ArrowUpRight size={17} /></a>
          <a href={join} className="club-button" onClick={() => setMenuOpen(false)}>{de ? 'Komm mittrainieren' : 'Come train with us'}<ArrowUpRight size={17} /></a>
          <div className="club-mobile-languages">{(['de', 'en'] as Lang[]).map(l => <button key={l} type="button" onClick={() => { setLang(l); setMenuOpen(false) }} aria-pressed={l === lang}>{l === 'de' ? 'Deutsch' : 'English'}</button>)}</div>
        </nav>
      </header>
    </>
  )
}
