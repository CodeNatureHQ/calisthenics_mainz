import type { Metadata } from 'next'
import type { Lang, Event } from '@/lib/types'
import { LangProvider } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import AnnouncementBanner from '@/components/public/AnnouncementBanner'

export const revalidate = 60

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

  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').single()

  const today = new Date().toISOString().slice(0, 10)
  const showAnnouncement =
    settings?.announcement_active &&
    (!settings.announcement_starts_at || settings.announcement_starts_at <= today) &&
    (!settings.announcement_ends_at || settings.announcement_ends_at >= today)

  let announcementEvent: Event | null = null
  if (showAnnouncement && settings?.announcement_event_id) {
    const { data } = await supabase.from('events').select('*').eq('id', settings.announcement_event_id).single()
    announcementEvent = data ?? null
  }

  return (
    <html lang={safeLang} suppressHydrationWarning>
      <body>
        <LangProvider initialLang={safeLang}>
          {showAnnouncement && (
            <AnnouncementBanner
              titleDe={settings.announcement_title_de ?? ''}
              titleEn={settings.announcement_title_en ?? ''}
              bodyDe={settings.announcement_body_de ?? ''}
              bodyEn={settings.announcement_body_en ?? ''}
              imageUrl={settings.announcement_image_url ?? null}
              event={announcementEvent ?? undefined}
              lang={safeLang}
            />
          )}
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
