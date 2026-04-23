'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin/blog',     label: 'Blogposts', icon: 'B' },
  { href: '/admin/events',   label: 'Events',    icon: 'E' },
  { href: '/admin/training', label: 'Training',  icon: 'T' },
  { href: '/admin/spots',    label: 'Spots',     icon: 'S' },
  { href: '/admin/settings', label: 'Hero & Stats', icon: 'H' },
]

export default function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--line-soft)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      padding: '24px 16px 20px',
      position: 'sticky',
      top: 0,
      height: '100svh',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '4px 8px 20px',
        borderBottom: '1px solid var(--line-soft)',
        marginBottom: 12,
        flexShrink: 0,
      }}>
        <img src="/logo.png" alt="Calisthenics Mainz" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--fg)' }}>Admin</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--fg-mute)', marginTop: 2, display: 'block' }}>CALISTHENICS MAINZ</div>
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
              padding: '10px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              background: isActive ? 'var(--bg-3)' : 'transparent',
              color: isActive ? 'var(--fg)' : 'var(--fg-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11.5,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
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
            {/* Icon */}
            <span style={{
              width: 18, height: 18,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: isActive ? 'var(--fg)' : 'var(--fg-mute)',
              flexShrink: 0,
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
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'var(--bg-3)'
            el.style.color = 'var(--danger)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'transparent'
            el.style.color = 'var(--fg-dim)'
          }}
        >
          Ausloggen
        </button>
      </div>
    </aside>
  )
}
