'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin/blog',     label: 'Blogposts',    icon: 'B' },
  { href: '/admin/events',   label: 'Events',       icon: 'E' },
  { href: '/admin/training', label: 'Training',     icon: 'T' },
  { href: '/admin/spots',    label: 'Spots',        icon: 'S' },
  { href: '/admin/settings', label: 'Hero & Stats', icon: 'H' },
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

  return (
    <>
      {/* Mobile top bar */}
      <div className="admin-mobile-bar" style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        background: 'var(--bg-2)', borderBottom: '1px solid var(--line-soft)',
        zIndex: 100, alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Calisthenics Mainz" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--fg)' }}>Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
          style={{
            width: 36, height: 36, border: '1px solid var(--line)', borderRadius: 8,
            background: 'none', color: 'var(--fg)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {/* Backdrop */}
      {mobileOpen && (
        <div onClick={close} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 98,
        }} className="admin-backdrop" />
      )}

      {/* Sidebar */}
      <aside
        className="admin-sidebar"
        style={{
          width: 240, flexShrink: 0,
          background: 'var(--bg-2)', borderRight: '1px solid var(--line-soft)',
          display: 'flex', flexDirection: 'column', gap: 4,
          padding: '24px 16px 20px',
          position: 'sticky', top: 0, height: '100svh', overflowY: 'auto',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 99,
        }}
      >
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
              onClick={close}
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
        @media (min-width: 768px) {
          .admin-mobile-bar { display: none !important; }
          .admin-sidebar {
            position: sticky !important;
            transform: translateX(0) !important;
            top: 0 !important;
            height: 100svh !important;
          }
        }
        @media (max-width: 767px) {
          .admin-mobile-bar { display: flex !important; }
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            height: 100dvh !important;
          }
          .admin-main {
            padding-top: 72px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
            padding-bottom: 48px !important;
          }
          .admin-list-row {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .admin-list-row-actions {
            justify-content: flex-start !important;
          }
          .admin-lang-pair {
            grid-template-columns: 1fr !important;
          }
          .admin-form-2col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
