'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import type { Lang } from '@/lib/types'

const navItems = (lang: Lang) =>
  lang === 'de'
    ? [
        { href: '#training', label: 'Training' },
        { href: '#events', label: 'Events' },
        { href: '#spots', label: 'Spots' },
        { href: '#ueber-uns', label: 'Über uns' },
        { href: '#blog', label: 'Blog' },
        { href: '#mitmachen', label: 'Mitmachen' },
      ]
    : [
        { href: '#training', label: 'Training' },
        { href: '#events', label: 'Events' },
        { href: '#spots', label: 'Spots' },
        { href: '#about', label: 'About' },
        { href: '#blog', label: 'Blog' },
        { href: '#join', label: 'Join' },
      ]

export default function Nav({ lang }: { lang: Lang }) {
  const { setLang } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const items = navItems(lang)

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 68,
        background: scrolled ? 'rgba(26,26,30,0.82)' : 'rgba(26,26,30,0)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--line-soft)' : 'transparent'}`,
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
      }}
    >
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '2rem' }}
      >
        {/* Brand */}
        <Link href={`/${lang}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img
            src="/logo.png"
            alt="Calisthenics Mainz"
            style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--fg)',
                lineHeight: 1.1,
              }}
            >
              Calisthenics Mainz
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--fg-mute)' }}>
              VEREIN · MAINZ
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 28, flex: 1, alignItems: 'center' }} className="hidden lg:flex">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                color: 'var(--fg-dim)',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s',
                position: 'relative',
                padding: '4px 0',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-dim)')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Language toggle */}
          <div
            style={{
              display: 'inline-flex',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: 4,
              gap: 2,
            }}
          >
            {(['de', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  background: lang === l ? 'var(--fg)' : 'transparent',
                  color: lang === l ? 'var(--accent-ink)' : 'var(--fg-mute)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: lang === l ? 600 : 400,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '5px 11px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* CTA */}
          <a
            href={lang === 'de' ? '#mitmachen' : '#join'}
            className="hidden lg:flex"
            style={{
              background: 'var(--fg)',
              color: 'var(--accent-ink)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.02em',
              padding: '10px 20px',
              borderRadius: 999,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#E8FF66')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--fg)')}
          >
            {lang === 'de' ? 'Mitmachen' : 'Join'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          {/* Burger */}
          <button
            className="lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: 36,
              height: 36,
              border: '1px solid var(--line)',
              borderRadius: 10,
              background: 'none',
              color: 'var(--fg)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <span style={{ display: 'block', width: 16, height: 1.5, background: 'currentColor', borderRadius: 1 }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: 'currentColor', borderRadius: 1 }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: 'currentColor', borderRadius: 1 }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: 'var(--bg)',
            borderBottom: '1px solid var(--line-soft)',
            padding: '0 20px 20px',
          }}
        >
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                color: 'var(--fg-dim)',
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
                padding: '14px 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href={lang === 'de' ? '#mitmachen' : '#join'}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              marginTop: 16,
              background: 'var(--fg)',
              color: 'var(--accent-ink)',
              fontWeight: 600,
              fontSize: 14,
              padding: '12px',
              borderRadius: 999,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            {lang === 'de' ? 'Mitmachen' : 'Join'}
          </a>
        </div>
      )}
    </header>
  )
}
