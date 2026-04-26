import type { Metadata } from 'next'
import Link from 'next/link'
import type { Lang } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Impressum' }

const copy = {
  de: {
    back: '← Zurück',
    title: 'Impressum',
    sections: [
      {
        heading: 'Angaben gemäß § 5 TMG',
        content: `DYNAMIC_ADDRESS`,
      },
      {
        heading: 'Vertreten durch',
        content: `DYNAMIC_CHAIRS`,
      },
      {
        heading: 'Vereinsregister',
        content: `DYNAMIC_REG`,
      },
      {
        heading: 'Kontakt',
        content: `DYNAMIC_EMAIL`,
      },
      {
        heading: 'Haftungsausschluss',
        content: `Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.`,
      },
      {
        heading: 'Haftung für Links',
        content: `Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.`,
      },
    ],
  },
  en: {
    back: '← Back',
    title: 'Imprint',
    sections: [
      {
        heading: 'Information according to § 5 TMG',
        content: `DYNAMIC_ADDRESS`,
      },
      {
        heading: 'Represented by',
        content: `DYNAMIC_CHAIRS`,
      },
      {
        heading: 'Register of Associations',
        content: `DYNAMIC_REG`,
      },
      {
        heading: 'Contact',
        content: `DYNAMIC_EMAIL`,
      },
      {
        heading: 'Disclaimer',
        content: `The contents of this site have been created with the utmost care. However, we cannot guarantee the accuracy, completeness and timeliness of the content.`,
      },
      {
        heading: 'Liability for Links',
        content: `Our offer contains links to external third-party websites over whose content we have no influence. The respective provider or operator of the linked pages is always responsible for their content.`,
      },
    ],
  },
}

export default async function ImpressumPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang = (rawLang === 'en' ? 'en' : 'de') as Lang
  const c = copy[lang]

  const supabase = await createClient()
  const { data: s } = await supabase.from('site_settings').select('imprint_street,imprint_zip,imprint_city,imprint_chair1,imprint_chair2,imprint_reg_nr,imprint_email').single()

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,11,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="container" style={{ height: 64, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href={`/${lang}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-dim)', textDecoration: 'none', transition: 'color 0.15s' }}>
            {c.back}
          </Link>
        </div>
      </header>

      <main>
        <div className="container" style={{ maxWidth: 720, padding: '4rem 0 6rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--fg)', margin: '0 0 3rem' }}>
            {c.title}
          </h1>

          {c.sections.map((section) => {
            const isDE = lang === 'de'
            let content = section.content
            if (content === 'DYNAMIC_ADDRESS') {
              const street = s?.imprint_street ?? (isDE ? '[Straße und Hausnummer]' : '[Street and number]')
              const zip = s?.imprint_zip ?? (isDE ? '55[PLZ]' : '55[ZIP]')
              const city = s?.imprint_city ?? 'Mainz'
              content = `Calisthenics Mainz e.V.\n${street}\n${zip} ${city}${isDE ? '' : ', Germany'}`
            } else if (content === 'DYNAMIC_CHAIRS') {
              const c1 = s?.imprint_chair1 ?? (isDE ? '[Name]' : '[Name]')
              const c2 = s?.imprint_chair2 ?? (isDE ? '[Name]' : '[Name]')
              content = isDE ? `1. Vorsitzende:r: ${c1}\n2. Vorsitzende:r: ${c2}` : `1st Chair: ${c1}\n2nd Chair: ${c2}`
            } else if (content === 'DYNAMIC_REG') {
              const reg = s?.imprint_reg_nr ?? (isDE ? 'VR [Nummer]' : 'VR [Number]')
              content = isDE ? `Amtsgericht Mainz\nRegisternummer: ${reg}` : `Amtsgericht Mainz\nRegistration number: ${reg}`
            } else if (content === 'DYNAMIC_EMAIL') {
              const email = s?.imprint_email ?? 'kontakt@calisthenics-mainz.de'
              content = isDE ? `E-Mail: ${email}` : `Email: ${email}`
            }
            return (
              <section key={section.heading} style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', margin: '0 0 0.75rem' }}>
                  {section.heading}
                </h2>
                <p style={{ color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>
                  {content}
                </p>
              </section>
            )
          })}
        </div>
      </main>
    </>
  )
}
