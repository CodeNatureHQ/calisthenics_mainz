import { notFound } from 'next/navigation'
import type { Lang } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import AusruestungPage from '@/components/public/AusruestungPage'
import Nav from '@/components/Nav'
import Footer from '@/components/public/Footer'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isDE = lang === 'de'
  return {
    title: isDE ? 'Ausrüstung | Calisthenics Mainz' : 'Equipment | Calisthenics Mainz',
    description: isDE
      ? 'Empfohlenes Calisthenics-Equipment — von uns genutzt und weiterempfohlen.'
      : 'Recommended calisthenics gear — used and endorsed by us.',
  }
}

export default async function AusruestungRoute({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang = (rawLang === 'en' ? 'en' : 'de') as Lang

  const supabase = await createClient()
  const [{ data: settings }, { data: products }] = await Promise.all([
    supabase.from('site_settings').select('show_ausruestung').single(),
    supabase.from('products').select('*').eq('visible', true).order('sort_order'),
  ])

  if (!settings?.show_ausruestung) notFound()

  return (
    <>
      <Nav lang={lang} showAusruestung />
      <AusruestungPage lang={lang} products={(products ?? []) as Product[]} />
      <Footer lang={lang} />
    </>
  )
}
