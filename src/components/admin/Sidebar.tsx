'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin/nachrichten', label: 'Nachrichten',  icon: '✉' },
  { href: '/admin/blog',        label: 'Blogposts',    icon: 'B' },
  { href: '/admin/events',      label: 'Events',       icon: 'E' },
  { href: '/admin/training',    label: 'Training',     icon: 'T' },
  { href: '/admin/spots',       label: 'Spots',        icon: 'SP' },
  { href: '/admin/faq',         label: 'FAQ',          icon: 'F' },
  { href: '/admin/ausruestung', label: 'Ausrüstung',   icon: 'A' },
  { href: '/admin/settings',    label: 'Settings',     icon: 'S' },
]

export default function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const close = () => setMobileOpen(false)

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  return (
    <>
      {/* ── Mobile top nav (dropdown pattern, same as public site) ── */}
      <header className="admin-mobile-header">
        {/* Top bar */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px',
        }}>
          <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="Calisthenics Mainz" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg)', lineHeight: 1.1 }}>Admin</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--fg-mute)' }}>CALISTHENICS MAINZ</div>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={mobileOpen}
            className="flex"
            style={{
              width: 36, height: 36,
              border: '1px solid var(--line)', borderRadius: 10,
              background: 'none', color: 'var(--fg)', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {mobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Dropdown menu — slides down like public Nav */}
        <div style={{
          overflow: 'hidden',
          maxHeight: mobileOpen ? '480px' : '0',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <div style={{ padding: '4px 16px 20px', borderTop: '1px solid var(--line-soft)' }}>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: '1px solid var(--line-soft)',
                    textDecoration: 'none',
                    color: isActive ? 'var(--fg)' : 'var(--fg-dim)',
                    fontFamily: 'var(--font-mono)', fontSize: 13,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isActive ? 'var(--fg)' : 'var(--fg-mute)', width: 16 }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  {isActive && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-spark)', display: 'inline-block' }} />
                  )}
                </Link>
              )
            })}

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--danger)', background: 'transparent',
                  border: '1px solid rgba(255,122,122,0.3)', cursor: 'pointer',
                }}
              >
                Ausloggen
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for mobile dropdown */}
      {mobileOpen && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, top: 56,
            zIndex: 45, background: 'rgba(0,0,0,0.45)',
          }}
          className="admin-backdrop"
        />
      )}

      {/* ── Desktop sidebar (unchanged) ── */}
      <aside className="admin-sidebar" style={{
        width: 240, flexShrink: 0,
        background: 'var(--bg-2)', borderRight: '1px solid var(--line-soft)',
        display: 'flex', flexDirection: 'column', gap: 4,
        padding: '24px 16px 20px',
        position: 'sticky', top: 0, height: '100svh', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '4px 8px 20px',
          borderBottom: '1px solid var(--line-soft)',
          marginBottom: 12, flexShrink: 0,
        }}>
          <img src="/logo.png" alt="Calisthenics Mainz" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--fg)' }}>Admin</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--fg-mute)', marginTop: 2 }}>CALISTHENICS MAINZ</div>
          </div>
        </div>

        {/* Nav */}
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8,
                textDecoration: 'none',
                background: isActive ? 'var(--bg-3)' : 'transparent',
                color: isActive ? 'var(--fg)' : 'var(--fg-dim)',
                fontFamily: 'var(--font-mono)', fontSize: 11.5,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                transition: 'background 0.15s, color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'var(--bg-3)'
                  el.style.color = 'var(--fg)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'transparent'
                  el.style.color = 'var(--fg-dim)'
                }
              }}
            >
              <span style={{
                width: 18, height: 18,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: isActive ? 'var(--fg)' : 'var(--fg-mute)', flexShrink: 0,
              }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em', padding: '4px 12px', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 12px', borderRadius: 6,
              fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--fg-dim)', background: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--bg-3)'; el.style.color = 'var(--danger)' }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--fg-dim)' }}
          >
            Ausloggen
          </button>
        </div>
      </aside>

      <style>{`
        /* Desktop: hide mobile header, show sidebar */
        @media (min-width: 768px) {
          .admin-mobile-header { display: none !important; }
          .admin-backdrop { display: none !important; }
        }

        /* Mobile: show top nav, hide sidebar */
        @media (max-width: 767px) {
          .admin-mobile-header {
            display: block;
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 50;
            background: rgba(26,26,30,0.95);
            backdrop-filter: blur(14px);
            border-bottom: 1px solid var(--line-soft);
          }
          .admin-sidebar { display: none !important; }
          .admin-main {
            padding-top: 72px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
            padding-bottom: 48px !important;
          }
          .admin-list-row { grid-template-columns: 1fr !important; gap: 10px !important; }
          .admin-list-row-actions { justify-content: flex-start !important; }
          .admin-lang-pair { grid-template-columns: 1fr !important; }
          .admin-form-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
