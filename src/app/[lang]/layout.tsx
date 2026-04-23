import type { Metadata } from 'next'
import type { Lang } from '@/lib/types'
import { LangProvider } from '@/lib/i18n'

export async function generateStaticParams() {
  return [{ lang: 'de' }, { lang: 'en' }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const isDE = lang === 'de'
  return {
    alternates: {
      canonical: `/${lang}`,
      languages: { de: '/de', en: '/en' },
    },
    openGraph: {
      locale: isDE ? 'de_DE' : 'en_GB',
    },
  }
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const safeLang = (lang === 'en' ? 'en' : 'de') as Lang

  return (
    <html lang={safeLang} suppressHydrationWarning>
      <body>
        <LangProvider initialLang={safeLang}>{children}</LangProvider>
      </body>
    </html>
  )
}
