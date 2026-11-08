'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Moon, Sun } from 'lucide-react'
import { createClient } from '@/lib/supabase/admin'
import { useAdminTheme } from './Shell'
import SearchPalette, { SearchTrigger } from './Search'
import { SECTIONS, SectionIcon, secVar, type SectionKey } from './sections'

/**
 * Zehn Einträge in einer flachen Liste mit Buchstaben-Zeichen waren Suchen statt Finden.
 * Jetzt: Gruppen nach dem, was man tun will, und dieselben Lucide-Zeichen wie auf der
 * öffentlichen Seite. Die Übersicht steht zuoberst — sie ist der Einstieg.
 */
type NavItem = { key: SectionKey; href: string; label: string; exact?: boolean }
const item = (key: SectionKey): NavItem => ({ key, href: SECTIONS[key].href, label: SECTIONS[key].label, exact: key === 'dashboard' })
const navGroups: { title: string | null; items: NavItem[] }[] = [
  { title: null, items: [item('dashboard')] },
  { title: 'Kommunikation', items: [item('nachrichten'), item('meldung')] },
  { title: 'Inhalte', items: [item('training'), item('events'), item('blog'), item('spots'), item('team'), item('faq'), item('ausruestung')] },
  { title: 'System', items: [item('settings')] },
]
const navItems = navGroups.flatMap(g => g.items)
const isActivePath = (pathname: string, item: { href: string; exact?: boolean }) =>
  item.exact ? pathname === item.href : pathname.startsWith(item.href)

export default function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { light, toggle } = useAdminTheme()

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
              <div style={{ font: '700 14px/1.2 var(--font-sans)', color: 'var(--fg)' }}>Calisthenics Mainz</div>
            <div style={{ font: '400 12.5px/1.3 var(--font-sans)', color: 'var(--fg-mute)' }}>Admin</div>
            </div>
          </Link>

          <div style={{ display: 'flex', gap: 8 }}>
          <SearchTrigger compact />
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
        </div>

        {/* Dropdown menu — slides down like public Nav */}
        <div style={{
          overflow: 'hidden',
          maxHeight: mobileOpen ? '640px' : '0',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <div style={{ padding: '4px 16px 20px', borderTop: '1px solid var(--line-soft)' }}>
            {navItems.map((item) => {
              const isActive = isActivePath(pathname, item)
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
                    font: `${isActive ? 600 : 500} 14px/1 var(--font-sans)`,
                    letterSpacing: '0.01em',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <SectionIcon section={item.key} size={16} />
                    {item.label}
                  </span>
                  {isActive && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                  )}
                </Link>
              )
            })}

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '48%' }}>
                {user.email}
              </span>
              <button
                onClick={toggle}
                aria-label={light ? 'Dunkles Thema' : 'Helles Thema'}
                style={{
                  width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, border: '1px solid var(--line)', background: 'transparent',
                  color: 'var(--fg-dim)', cursor: 'pointer', marginLeft: 'auto',
                }}
              >
                {light ? <Moon size={14} /> : <Sun size={14} />}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  font: '600 13px/1 var(--font-sans)',
                  color: 'var(--danger)', background: 'transparent',
                  border: '1px solid color-mix(in srgb, var(--danger) 35%, transparent)', cursor: 'pointer',
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

      {/* ── Desktop sidebar ── */}
      <aside className="admin-sidebar" style={{
        width: 240, flexShrink: 0,
        background: 'var(--bg-2)', borderRight: '1px solid var(--line-soft)',
        display: 'flex', flexDirection: 'column', gap: 4,
        padding: '24px 16px 20px',
        position: 'fixed', top: 0, left: 0, height: '100svh', overflowY: 'auto',
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
            <div style={{ font: '700 14px/1.2 var(--font-sans)', color: 'var(--fg)' }}>Calisthenics Mainz</div>
            <div style={{ font: '400 12.5px/1.3 var(--font-sans)', color: 'var(--fg-mute)' }}>Admin</div>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}><SearchTrigger /></div>

        {/* Nav, gruppiert */}
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginTop: gi === 0 ? 0 : 16, paddingTop: gi === 0 ? 0 : 12, borderTop: gi === 0 ? 0 : '1px solid var(--line-soft)' }}>
            {group.title && (
              <div style={{ font: '600 12.5px/1.4 var(--font-sans)', color: 'var(--fg-mute)', padding: '0 10px', margin: '4px 0 6px' }}>
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
          const isActive = isActivePath(pathname, item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="admin-nav-link"
              data-active={isActive ? 'true' : undefined}
              aria-current={isActive ? 'page' : undefined}
              style={secVar(item.key)}
            >
              <SectionIcon section={item.key} size={16} />
              {item.label}
            </Link>
          )
            })}
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
          <button
            onClick={toggle}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
              padding: '8px 12px', borderRadius: 6, marginBottom: 4,
              font: '500 12.5px/1 var(--font-sans)',
              color: 'var(--fg-dim)', background: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--bg-3)'; el.style.color = 'var(--fg)' }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--fg-dim)' }}
          >
            {light ? <Moon size={14} /> : <Sun size={14} />}
            {light ? 'Dunkles Thema' : 'Helles Thema'}
          </button>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em', padding: '4px 12px', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 12px', borderRadius: 6,
              font: '500 13px/1 var(--font-sans)',
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

      <SearchPalette />

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
            background: color-mix(in srgb, var(--bg) 95%, transparent);
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
          /* reset the fixed-sidebar offset on mobile */
          .admin-main { padding-left: 16px !important; }
          .admin-list-row { grid-template-columns: 1fr !important; gap: 10px !important; }
          .admin-list-row-actions { justify-content: flex-start !important; }
          .admin-lang-pair { grid-template-columns: 1fr !important; }
          .admin-form-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
