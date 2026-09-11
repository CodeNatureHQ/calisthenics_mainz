'use client'

import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import type { Lang } from '@/lib/types'

const THEME_KEY = 'cm-theme'
const CHANGE_EVENT = 'cm-theme-change'

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY && event.key !== null) return
    document.documentElement.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light'
    onChange()
  }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  return document.documentElement.dataset.theme === 'dark'
}

export default function ThemeToggle({ lang }: { lang: Lang }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false)
  const label = lang === 'de'
    ? dark ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren'
    : dark ? 'Switch to light mode' : 'Switch to dark mode'

  function toggleTheme() {
    const next = getSnapshot() ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem(THEME_KEY, next) } catch { /* The switch also works without browser storage. */ }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={label} title={label} aria-pressed={dark}>
      {dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
    </button>
  )
}
