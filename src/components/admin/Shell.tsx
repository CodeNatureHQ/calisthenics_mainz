'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Check, ExternalLink, Loader2 } from 'lucide-react'

/**
 * Die Admin-Schale: hält das Thema (hell/dunkel) und legt die Light-Mode-Variablen als
 * Klasse auf den Wrapper — nur der Admin wechselt, die öffentliche Seite bleibt dunkel.
 * Die Wahl liegt im localStorage des Geräts, nicht am Konto: Es ist eine Anzeigefrage.
 *
 * Als externer Mini-Store statt useState+useEffect: Der Server kennt das Gerät nicht und
 * rendert dunkel (`getServerSnapshot`); auf dem Client liest `useSyncExternalStore` den
 * gespeicherten Wert direkt nach der Hydrierung — ohne Warnung und ohne setState im Effekt.
 *
 * Außerdem veröffentlicht sie: Jede Änderung meldet sich als `admin:saved` (siehe
 * lib/supabase/admin). Die Schale bündelt kurz aufeinanderfolgende Änderungen, lässt die
 * öffentliche Seite neu bauen und zeigt unten "Gespeichert · live".
 */
const KEY = 'admin-theme'
const listeners = new Set<() => void>()

function readLight(): boolean {
  try {
    return localStorage.getItem(KEY) === 'light'
  } catch {
    return false // privater Modus o. Ä.
  }
}

function writeLight(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? 'light' : 'dark')
  } catch {
    // dann gilt die Wahl eben nur, solange die Seite offen ist
  }
  for (const l of listeners) l()
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

const ThemeCtx = createContext<{ light: boolean; toggle: () => void }>({ light: false, toggle: () => {} })

export function useAdminTheme() {
  return useContext(ThemeCtx)
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const light = useSyncExternalStore(subscribe, readLight, () => false)
  const toggle = useCallback(() => writeLight(!readLight()), [])
  return (
    <ThemeCtx.Provider value={{ light, toggle }}>
      <div className={light ? 'admin-shell admin-light' : 'admin-shell'} style={{ display: 'flex', minHeight: '100svh', background: 'var(--bg)', color: 'var(--fg)' }}>
        {children}
        <PublishToast />
      </div>
    </ThemeCtx.Provider>
  )
}

type PublishState = 'idle' | 'publishing' | 'live' | 'error'

function PublishToast() {
  const [state, setState] = useState<PublishState>('idle')
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined)
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const onSaved = () => {
      setState('publishing')
      clearTimeout(debounce.current)
      clearTimeout(hide.current)
      debounce.current = setTimeout(async () => {
        try {
          const res = await fetch('/api/revalidate', { method: 'POST' })
          setState(res.ok ? 'live' : 'error')
        } catch {
          setState('error')
        }
        hide.current = setTimeout(() => setState('idle'), 3500)
      }, 500)
    }
    window.addEventListener('admin:saved', onSaved)
    return () => window.removeEventListener('admin:saved', onSaved)
  }, [])

  if (state === 'idle') return null

  const tone = state === 'error' ? 'var(--danger)' : state === 'live' ? 'var(--ok)' : 'var(--fg-dim)'
  return (
    <div role="status" aria-live="polite" className="admin-toast" style={{ borderColor: `color-mix(in srgb, ${tone} 45%, transparent)` }}>
      <span style={{ color: tone, display: 'inline-flex' }}>
        {state === 'publishing' ? <Loader2 size={16} className="admin-spin" /> : <Check size={16} />}
      </span>
      <span>
        {state === 'publishing' && 'Speichern …'}
        {state === 'live' && 'Gespeichert · ist live'}
        {state === 'error' && 'Gespeichert · erscheint in spätestens 1 Minute'}
      </span>
      {state === 'live' && (
        <a href="/de" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 600 }}>
          Ansehen <ExternalLink size={13} />
        </a>
      )}
    </div>
  )
}
