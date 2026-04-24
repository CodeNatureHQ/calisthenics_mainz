import type { Metadata } from 'next'
import Link from 'next/link'
import type { Lang } from '@/lib/types'

export const metadata: Metadata = { title: 'Impressum' }

const copy = {
  de: {
    back: '← Zurück',
    title: 'Impressum',
    sections: [
      {
        heading: 'Angaben gemäß § 5 TMG',
        content: `Calisthenics Mainz e.V.
[Straße und Hausnummer]
55[PLZ] Mainz`,
      },
      {
        heading: 'Vertreten durch',
        content: `1. Vorsitzender: [Name]
2. Vorsitzender: [Name]`,
      },
      {
        heading: 'Vereinsregister',
        content: `Amtsgericht Mainz
Registernummer: VR [Nummer]`,
      },
      {
        heading: 'Kontakt',
        content: `E-Mail: kontakt@calisthenics-mainz.de`,
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
        content: `Calisthenics Mainz e.V.
[Street and number]
55[ZIP] Mainz, Germany`,
      },
      {
        heading: 'Represented by',
        content: `1st Chair: [Name]
2nd Chair: [Name]`,
      },
      {
        heading: 'Register of Associations',
        content: `Amtsgericht Mainz
Registration number: VR [Number]`,
      },
      {
        heading: 'Contact',
        content: `Email: kontakt@calisthenics-mainz.de`,
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

          {c.sections.map((s) => (
            <section key={s.heading} style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', margin: '0 0 0.75rem' }}>
                {s.heading}
              </h2>
              <p style={{ color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>
                {s.content}
              </p>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}
