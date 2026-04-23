'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Lang } from './types'

type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextValue>({ lang: 'de', setLang: () => {} })

export function LangProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode
  initialLang: Lang
}) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cm-lang', lang)
    }
  }, [lang])

  function setLang(newLang: Lang) {
    setLangState(newLang)
    // Swap lang segment in URL: /de/... → /en/...
    const segments = pathname.split('/')
    if (segments[1] === 'de' || segments[1] === 'en') {
      segments[1] = newLang
      router.push(segments.join('/') || '/')
    }
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  return useContext(LangContext)
}
