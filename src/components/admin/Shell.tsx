'use client'

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react'

/**
 * Die Admin-Schale: hält das Thema (hell/dunkel) und legt die Light-Mode-Variablen als
 * Klasse auf den Wrapper — nur der Admin wechselt, die öffentliche Seite bleibt dunkel.
 * Die Wahl liegt im localStorage des Geräts, nicht am Konto: Es ist eine Anzeigefrage.
 *
 * Als externer Mini-Store statt useState+useEffect: Der Server kennt das Gerät nicht und
 * rendert dunkel (`getServerSnapshot`); auf dem Client liest `useSyncExternalStore` den
 * gespeicherten Wert direkt nach der Hydrierung — ohne Warnung und ohne setState im Effekt.
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
      <div className={light ? 'admin-light' : undefined} style={{ display: 'flex', minHeight: '100svh', background: 'var(--bg)', color: 'var(--fg)' }}>
        {children}
      </div>
    </ThemeCtx.Provider>
  )
}
