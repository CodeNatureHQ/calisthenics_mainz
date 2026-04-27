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
import FaqSection from '@/components/public/FaqSection'
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
    { data: faqItems },
  ] = await Promise.all([
    supabase.from('posts').select('*').eq('published', true).order('sort_order'),
    supabase.from('events').select('*').order('starts_at', { ascending: false }),
    supabase.from('training_sessions').select('*').order('sort_order'),
    supabase.from('calendar_overrides').select('*').order('on_date'),
    supabase.from('spots').select('*').order('sort_order'),
    supabase.from('site_settings').select('*').single(),
    supabase.from('faq_items').select('*').eq('visible', true).order('sort_order'),
  ])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calisthenics-mainz.de'
  const now = new Date().toISOString()

  const sportsClubJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsClub',
    name: 'Calisthenics Mainz',
    url: `${siteUrl}/${lang}`,
    logo: `${siteUrl}/logo.png`,
    description:
      lang === 'de'
        ? 'Calisthenics-Verein in Mainz — Training, Events und Community.'
        : 'Calisthenics club in Mainz — training, events and community.',
    sport: 'Calisthenics',
    ...(settings?.imprint_street && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings.imprint_street,
        postalCode: settings.imprint_zip ?? undefined,
        addressLocality: settings.imprint_city ?? 'Mainz',
        addressCountry: 'DE',
      },
    }),
    ...(settings?.imprint_email && { email: settings.imprint_email }),
  }

  const faqJsonLd =
    faqItems && faqItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: lang === 'de' ? item.question_de : item.question_en,
            acceptedAnswer: {
              '@type': 'Answer',
              text: lang === 'de' ? item.answer_de : item.answer_en,
            },
          })),
        }
      : null

  const futureEvents = (events ?? []).filter((e) => e.starts_at >= now)
  const eventsJsonLd =
    futureEvents.length > 0
      ? futureEvents.map((e) => ({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: lang === 'de' ? e.title.de : e.title.en,
          startDate: e.starts_at,
          description: lang === 'de' ? e.description?.de : e.description?.en,
          location: {
            '@type': 'Place',
            name: lang === 'de' ? e.place.de : e.place.en,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Mainz',
              addressCountry: 'DE',
            },
          },
          organizer: { '@type': 'Organization', name: 'Calisthenics Mainz', url: `${siteUrl}/${lang}` },
        }))
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsClubJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {eventsJsonLd && eventsJsonLd.map((ev, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ev) }}
        />
      ))}
      <Nav lang={lang} showAusruestung={settings?.show_ausruestung ?? false} />
      <main style={{ paddingTop: 68 }}>
        <Hero lang={lang} settings={settings} />
        <TrainingSection lang={lang} sessions={sessions ?? []} overrides={overrides ?? []} spots={spots ?? []} events={events ?? []} />
        <EventsSection lang={lang} events={events ?? []} />
        <SpotsSection lang={lang} spots={spots ?? []} />
        <AboutSection lang={lang} settings={settings} />
        <BlogGrid lang={lang} posts={posts ?? []} />
        <FaqSection lang={lang} items={faqItems ?? []} />
        <JoinForm lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  )
}
