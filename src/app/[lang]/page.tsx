import type { Metadata } from 'next'
import type { Lang } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import Hero from '@/components/public/Hero'
import TrainingSection from '@/components/public/TrainingSection'
import EventsSection from '@/components/public/EventsSection'
import SpotsSection from '@/components/public/SpotsSection'
import AboutSection from '@/components/public/AboutSection'
import BlogGrid from '@/components/public/BlogGrid'
import JoinForm from '@/components/public/JoinForm'
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
    title: isDE
      ? 'Calisthenics Mainz — Training, Events & Community'
      : 'Calisthenics Mainz — Training, Events & Community',
    description: isDE
      ? 'Calisthenics-Verein in Mainz. Wöchentliches Training am JGU Campus, Wettkämpfe, Workshops und eine offene Community — kostenlos mitmachen.'
      : 'Calisthenics club in Mainz. Weekly training at JGU Campus, competitions, workshops and an open community — free to join.',
    openGraph: {
      title: 'Calisthenics Mainz',
      description: isDE
        ? 'Calisthenics-Verein in Mainz — kostenlos mitmachen.'
        : 'Calisthenics club in Mainz — free to join.',
    },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang = (rawLang === 'en' ? 'en' : 'de') as Lang

  const supabase = await createClient()

  const [
    { data: posts },
    { data: events },
    { data: sessions },
    { data: overrides },
    { data: spots },
    { data: settings },
  ] = await Promise.all([
    supabase.from('posts').select('*').eq('published', true).order('sort_order'),
    supabase.from('events').select('*').order('starts_at', { ascending: false }),
    supabase.from('training_sessions').select('*').order('sort_order'),
    supabase.from('calendar_overrides').select('*').order('on_date'),
    supabase.from('spots').select('*').order('sort_order'),
    supabase.from('site_settings').select('*').single(),
  ])

  return (
    <>
      <Nav lang={lang} />
      <main>
        <Hero lang={lang} settings={settings} />
        <TrainingSection lang={lang} sessions={sessions ?? []} overrides={overrides ?? []} spots={spots ?? []} />
        <EventsSection lang={lang} events={events ?? []} />
        <SpotsSection lang={lang} spots={spots ?? []} />
        <AboutSection lang={lang} settings={settings} />
        <BlogGrid lang={lang} posts={posts ?? []} />
        <JoinForm lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  )
}
