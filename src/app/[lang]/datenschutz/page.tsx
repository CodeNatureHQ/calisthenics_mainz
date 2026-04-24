import type { Metadata } from 'next'
import Link from 'next/link'
import type { Lang } from '@/lib/types'

export const metadata: Metadata = { title: 'Datenschutz' }

export default async function DatenschutzPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang = (rawLang === 'en' ? 'en' : 'de') as Lang
  const isDE = lang === 'de'

  const sections = isDE ? [
    {
      heading: '1. Verantwortlicher',
      content: `Calisthenics Mainz e.V.
[Straße und Hausnummer]
55[PLZ] Mainz
E-Mail: kontakt@calisthenics-mainz.de`,
    },
    {
      heading: '2. Hosting',
      content: `Diese Website wird bei Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA gehostet. Vercel verarbeitet beim Aufruf der Website technisch notwendige Daten (z. B. IP-Adresse, Datum/Uhrzeit, aufgerufene Seite). Details finden sich in der Datenschutzerklärung von Vercel: https://vercel.com/legal/privacy-policy`,
    },
    {
      heading: '3. Erhebung und Speicherung personenbezogener Daten',
      content: `Beim Besuch dieser Website werden folgende Daten automatisch in Server-Logs gespeichert:
– IP-Adresse des anfragenden Rechners
– Datum und Uhrzeit des Zugriffs
– Name und URL der abgerufenen Datei
– Verwendeter Browser und Betriebssystem

Diese Daten sind nicht bestimmten Personen zuordenbar und werden nicht mit anderen Datenquellen zusammengeführt.`,
    },
    {
      heading: '4. Kontaktformular',
      content: `Bei der Nutzung des Kontaktformulars (Mitmachen) werden Ihre Angaben (Name, E-Mail-Adresse, Nachricht) zur Bearbeitung der Anfrage gespeichert. Die Daten werden nicht ohne Ihre Einwilligung an Dritte weitergegeben und nach abgeschlossener Bearbeitung gelöscht.`,
    },
    {
      heading: '5. Cookies',
      content: `Diese Website verwendet ausschließlich ein technisch notwendiges Cookie zur Speicherung der gewählten Sprache (de/en). Es werden keine Tracking- oder Marketing-Cookies eingesetzt. Dieses Cookie ist für den Betrieb der Website erforderlich und bedarf keiner Einwilligung gemäß Art. 6 Abs. 1 lit. f DSGVO.`,
    },
    {
      heading: '6. Ihre Rechte',
      content: `Sie haben jederzeit das Recht auf:
– Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)
– Berichtigung unrichtiger Daten (Art. 16 DSGVO)
– Löschung Ihrer Daten (Art. 17 DSGVO)
– Einschränkung der Verarbeitung (Art. 18 DSGVO)
– Datenübertragbarkeit (Art. 20 DSGVO)
– Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)

Zur Ausübung dieser Rechte wenden Sie sich an: kontakt@calisthenics-mainz.de`,
    },
    {
      heading: '7. Beschwerderecht',
      content: `Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren. In Rheinland-Pfalz ist dies der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz.`,
    },
    {
      heading: '8. Aktualität und Änderungen',
      content: `Diese Datenschutzerklärung ist aktuell gültig und hat den Stand: April 2026. Durch die Weiterentwicklung unserer Website oder aufgrund geänderter gesetzlicher bzw. behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern.`,
    },
  ] : [
    {
      heading: '1. Controller',
      content: `Calisthenics Mainz e.V.
[Street and number]
55[ZIP] Mainz, Germany
Email: kontakt@calisthenics-mainz.de`,
    },
    {
      heading: '2. Hosting',
      content: `This website is hosted by Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA. Vercel processes technically necessary data when the website is accessed (e.g. IP address, date/time, page accessed). Details can be found in Vercel's privacy policy: https://vercel.com/legal/privacy-policy`,
    },
    {
      heading: '3. Data collection',
      content: `When you visit this website, the following data is automatically stored in server logs:
– IP address of the requesting computer
– Date and time of access
– Name and URL of the requested file
– Browser and operating system used

This data cannot be attributed to specific persons.`,
    },
    {
      heading: '4. Contact form',
      content: `When using the contact form (Join), your details (name, email address, message) are stored to process your request. The data will not be passed on to third parties without your consent and will be deleted after processing is complete.`,
    },
    {
      heading: '5. Cookies',
      content: `This website only uses one technically necessary cookie to store the selected language (de/en). No tracking or marketing cookies are used. This cookie is required for the operation of the website and does not require consent pursuant to Art. 6 para. 1 lit. f GDPR.`,
    },
    {
      heading: '6. Your rights',
      content: `You have the right at any time to:
– Access your stored data (Art. 15 GDPR)
– Rectification of inaccurate data (Art. 16 GDPR)
– Erasure of your data (Art. 17 GDPR)
– Restriction of processing (Art. 18 GDPR)
– Data portability (Art. 20 GDPR)
– Object to processing (Art. 21 GDPR)

To exercise these rights, please contact: kontakt@calisthenics-mainz.de`,
    },
    {
      heading: '7. Right to lodge a complaint',
      content: `You have the right to lodge a complaint with a supervisory authority. In Rhineland-Palatinate this is the State Commissioner for Data Protection and Freedom of Information Rhineland-Palatinate.`,
    },
  ]

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,11,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="container" style={{ height: 64, display: 'flex', alignItems: 'center' }}>
          <Link href={`/${lang}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-dim)', textDecoration: 'none' }}>
            {isDE ? '← Zurück' : '← Back'}
          </Link>
        </div>
      </header>

      <main>
        <div className="container" style={{ maxWidth: 720, padding: '4rem 0 6rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--fg)', margin: '0 0 3rem' }}>
            {isDE ? 'Datenschutz' : 'Privacy Policy'}
          </h1>

          {sections.map((s) => (
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
