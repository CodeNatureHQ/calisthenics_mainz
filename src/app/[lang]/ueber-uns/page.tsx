import type { Metadata } from 'next'
import type { Lang, TeamMember } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import UeberUnsPage from '@/components/public/UeberUnsPage'
import Footer from '@/components/public/Footer'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const isDE = lang === 'de'
  return {
    title: isDE ? 'Über uns | Calisthenics Mainz' : 'About us | Calisthenics Mainz',
    description: isDE
      ? 'Lern unser Team kennen — Trainer und Vorstand des Calisthenics Mainz e.V. Seit 2013 für offenes, kostenloses Training in Mainz.'
      : 'Meet our team — trainers and board of Calisthenics Mainz e.V. Since 2013 offering open, free training in Mainz.',
  }
}

export default async function UeberUnsRoute({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang = (rawLang === 'en' ? 'en' : 'de') as Lang

  const supabase = await createClient()
  const [{ data: settings }, { data: teamMembersRaw }] = await Promise.all([
    supabase.from('site_settings').select('*').single(),
    supabase.from('team_members').select('*').eq('visible', true).order('sort_order'),
  ])
  const teamMembers: TeamMember[] = teamMembersRaw ?? []

  return (
    <>
      <Nav lang={lang} showAusruestung={settings?.show_ausruestung ?? false} />
      <UeberUnsPage lang={lang} settings={settings} teamMembers={teamMembers} />
      <Footer lang={lang} />
    </>
  )
}
