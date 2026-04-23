'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/blog')
      router.refresh()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20, zIndex: 100,
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        border: '1px solid var(--line)',
        borderRadius: 18,
        background: 'var(--bg-2)',
        padding: '40px 36px',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <img src="/logo.png" alt="Calisthenics Mainz" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--fg)' }}>Admin</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--fg-mute)', marginTop: 2 }}>CALISTHENICS MAINZ</div>
          </div>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.005em', margin: '0 0 6px', color: 'var(--fg)' }}>
          Anmelden
        </h1>
        <p style={{ color: 'var(--fg-dim)', fontSize: 13, margin: '0 0 28px' }}>
          Zugang nur für Admins.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>E-Mail</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            />
          </div>
          <div>
            <label style={labelStyle}>Passwort</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required autoComplete="current-password"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--fg)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            />
          </div>

          <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em', marginTop: -4, minHeight: 16 }}>
            {error}
          </p>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', background: 'var(--fg)', color: 'var(--accent-ink)',
              border: 0, borderRadius: 10, padding: 14,
              fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase',
              letterSpacing: '0.1em', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
          >
            {loading ? 'Laden …' : 'Einloggen'}
          </button>
        </form>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line-soft)', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-mute)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
          Nur autorisierte Admins haben Zugang zu diesem Bereich.
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--fg-mute)',
  marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 14,
  color: 'var(--fg)',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}
