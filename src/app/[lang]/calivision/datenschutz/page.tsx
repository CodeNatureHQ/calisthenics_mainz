import type { Metadata } from 'next'
import Link from 'next/link'
import type { Lang } from '@/lib/types'

// Verantwortlicher für die App — bewusst NICHT aus `site_settings`.
// Calivision wird von Richard Maasri als Privatperson in den App-Stores
// veröffentlicht, nicht vom Verein. Die Vereinsdaten dürfen sich hier also
// nicht auswirken. Ändert sich der Herausgeber, wird es hier geändert.
const CONTROLLER = {
  name: 'Richard Maasri',
  street: 'Schenkendorfstraße 5',
  city: '65187 Wiesbaden',
  email: 'richard.maasri@hotmail.de',
} as const

// Unverlinkte Seite: dient als Datenschutz-URL für die Calivision-App in
// App Store Connect und Play Console. Bewusst nicht in Footer oder Sitemap.
export const metadata: Metadata = {
  title: 'Datenschutz – Calivision',
  robots: { index: false, follow: false },
}

export default async function CalivisionDatenschutzPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang = (rawLang === 'en' ? 'en' : 'de') as Lang
  const isDE = lang === 'de'

  const email = CONTROLLER.email

  const sections = isDE ? [
    {
      heading: '1. Verantwortlicher',
      content: `Verantwortlich für die Datenverarbeitung in der App Calivision im Sinne der DSGVO:\n\n${CONTROLLER.name}\n${CONTROLLER.street}\n${CONTROLLER.city}\nE-Mail: ${CONTROLLER.email}\n\nCalivision ist ein privates Projekt und wird von mir als Privatperson herausgegeben. Der Verein Calisthenics Mainz e.V. ist nicht Herausgeber der App und nicht für die Datenverarbeitung in der App verantwortlich; diese Seite liegt lediglich auf der Website des Vereins.`,
    },
    {
      heading: '2. Grundsatz: Die Verarbeitung findet ausschließlich auf deinem Gerät statt',
      content: `Calivision analysiert Trainingsvideos lokal auf deinem Smartphone. Die App hat keine Serververbindung, keinen Nutzerkonto-Bereich und keine Anmeldung.

Es werden keine Videos, Bilder, Messwerte oder Nutzungsdaten an uns oder an Dritte übertragen. Wir als Anbieter erhalten keinerlei Kenntnis davon, ob, wann oder wie du die App benutzt. Wir können deine Daten technisch nicht einsehen.

Eine Ausnahme im Wortsinn: Die App enthält einen Link auf diese Datenschutzerklärung. Tippst du ihn an, öffnet sich der Browser deines Geräts und ruft unsere Website auf. Dabei wird – wie bei jedem Website-Aufruf – deine IP-Adresse an den Hoster übertragen. Es gilt dann die Datenschutzerklärung der Website. Die App selbst sendet dabei keine Daten über dich mit.`,
    },
    {
      heading: '3. Welche Daten die App verarbeitet',
      content: `Ausgelöst durch dich selbst verarbeitet die App:

– Videodateien, die du aus der Galerie deines Geräts auswählst
– die daraus berechneten Körperpunkte, Winkel, Zeiten und Wiederholungszahlen
– von dir gespeicherte Analysen samt einer Kopie des zugehörigen Videos

Die Bildanalyse erfolgt mit einer Bibliothek zur Körperpunkterkennung (MediaPipe), die vollständig auf dem Gerät läuft. Das dafür nötige Modell ist in der App enthalten und wird nicht nachgeladen.`,
    },
    {
      heading: '4. Speicherort und Speicherdauer',
      content: `Alle Daten liegen im geschützten App-Speicher deines Geräts (Videokopien als Dateien, Analysen in einer lokalen SQLite-Datenbank). Es gibt keine Cloud-Sicherung durch uns.

Du bestimmst die Speicherdauer selbst:
– Einzelne gespeicherte Analysen lassen sich im Verlauf löschen.
– Beim Deinstallieren der App werden sämtliche von der App angelegten Daten mitgelöscht.

Eine Analyse, die du nicht ausdrücklich speicherst, verschwindet mit dem Beenden der Sitzung.`,
    },
    {
      heading: '5. Berechtigungen',
      content: `Die App fragt Zugriff auf deine Foto- bzw. Videomediathek an. Dieser Zugriff dient allein dazu, dass du ein Video zur Analyse auswählen kannst. Die App durchsucht deine Mediathek nicht und liest nichts außer der von dir ausgewählten Datei.

Das Originalvideo in deiner Galerie wird nicht verändert und nicht gelöscht.`,
    },
    {
      heading: '6. Kein Tracking, keine Werbung, keine Analyse-Dienste',
      content: `Calivision enthält keine Cookies, keine Werbung, keine Analyse- oder Tracking-Werkzeuge, keine Absturzberichterstattung und keine Bibliotheken von Drittanbietern, die Daten nach außen senden. Es findet kein Profiling und keine automatisierte Entscheidungsfindung im Sinne des Art. 22 DSGVO statt.`,
    },
    {
      heading: '7. Export-Funktion',
      content: `Die App bietet die Möglichkeit, Analysedaten als Text in die Zwischenablage deines Geräts zu kopieren, etwa um sie selbst weiterzugeben. Dieser Schritt geschieht ausschließlich auf deine Veranlassung. Wohin du die kopierten Daten anschließend einfügst, liegt in deiner Verantwortung und außerhalb unseres Einflussbereichs.`,
    },
    {
      heading: '8. Videos von anderen Personen',
      content: `Videoaufnahmen von Menschen können besonders schützenswerte Daten enthalten. Wenn du Videos analysierst, auf denen andere Personen zu sehen sind, bist du dafür verantwortlich, dass du diese Aufnahmen anfertigen und verwenden darfst.

Da die Verarbeitung ausschließlich lokal auf deinem Gerät stattfindet, erhalten wir auch von solchen Aufnahmen keine Kenntnis.`,
    },
    {
      heading: '9. App-Stores und Testverteilung',
      content: `Die Bereitstellung der App erfolgt über Apple (App Store/TestFlight) und Google (Play Store). Diese Anbieter verarbeiten im Rahmen von Download, Installation und Testteilnahme eigene Daten – etwa deine Store-Kennung, deine E-Mail-Adresse bei Einladung zu einem Test sowie von der Plattform selbst erhobene Absturz- und Nutzungsstatistiken.

Diese Verarbeitung erfolgt in eigener Verantwortung der Plattformbetreiber und ist von uns nicht beeinflussbar. Es gelten:
– Apple: https://www.apple.com/legal/privacy/
– Google: https://policies.google.com/privacy`,
    },
    {
      heading: '10. Rechtsgrundlage',
      content: `Soweit durch die lokale Verarbeitung überhaupt eine Verarbeitung personenbezogener Daten durch uns vorliegt, stützt sie sich auf Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung der von dir gewünschten Funktion der App). Eine Übermittlung an uns findet nicht statt.`,
    },
    {
      heading: '11. Deine Rechte',
      content: `Dir stehen die Rechte auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) und Widerspruch (Art. 21 DSGVO) zu.

Hinweis: Da wir keine Daten von dir erhalten, können wir zu deinen Analysedaten keine Auskunft erteilen und sie nicht löschen – beides liegt vollständig in deiner Hand über dein Gerät. Für Fragen zur App erreichst du uns unter: ${email}`,
    },
    {
      heading: '12. Beschwerderecht',
      content: `Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig ist der Hessische Beauftragte für Datenschutz und Informationsfreiheit, Gustav-Stresemann-Ring 1, 65189 Wiesbaden (https://datenschutz.hessen.de).`,
    },
    {
      heading: '13. Stand und Änderungen',
      content: `Diese Datenschutzerklärung gilt für die App Calivision und hat den Stand: September 2026. Bei Weiterentwicklung der App oder geänderten gesetzlichen Vorgaben kann eine Anpassung nötig werden.`,
    },
  ] : [
    {
      heading: '1. Controller',
      content: `Controller for data processing in the Calivision app within the meaning of the GDPR:\n\n${CONTROLLER.name}\n${CONTROLLER.street}\n${CONTROLLER.city}, Germany\nEmail: ${CONTROLLER.email}\n\nCalivision is a private project published by me as a private individual. The association Calisthenics Mainz e.V. is not the publisher of the app and is not responsible for the data processing within it; this page is merely hosted on the association's website.`,
    },
    {
      heading: '2. Principle: all processing happens on your device',
      content: `Calivision analyses training videos locally on your phone. The app has no server connection, no user account and no sign-in.

No videos, images, measurements or usage data are transmitted to us or to any third party. As the provider, we have no knowledge of whether, when or how you use the app. We are technically unable to access your data.

One literal exception: the app contains a link to this privacy policy. Tapping it opens your device's browser and loads our website. As with any website visit, your IP address is transmitted to the host, and the website's privacy policy then applies. The app itself sends no data about you along with it.`,
    },
    {
      heading: '3. What the app processes',
      content: `Triggered by you, the app processes:

– video files you select from your device's gallery
– the body landmarks, angles, timings and repetition counts calculated from them
– analyses you choose to save, together with a copy of the corresponding video

Image analysis uses a body landmark detection library (MediaPipe) that runs entirely on the device. The required model ships inside the app and is not downloaded at runtime.`,
    },
    {
      heading: '4. Storage location and retention',
      content: `All data resides in your device's protected app storage (video copies as files, analyses in a local SQLite database). We provide no cloud backup.

You control retention yourself:
– Individual saved analyses can be deleted in the history view.
– Uninstalling the app removes all data the app created.

An analysis you do not explicitly save disappears when the session ends.`,
    },
    {
      heading: '5. Permissions',
      content: `The app requests access to your photo and video library. This access serves the sole purpose of letting you pick a video to analyse. The app does not scan your library and reads nothing other than the file you select.

The original video in your gallery is neither modified nor deleted.`,
    },
    {
      heading: '6. No tracking, no advertising, no analytics',
      content: `Calivision contains no cookies, no advertising, no analytics or tracking tools, no crash reporting and no third-party libraries that send data outward. There is no profiling and no automated decision-making within the meaning of Art. 22 GDPR.`,
    },
    {
      heading: '7. Export function',
      content: `The app lets you copy analysis data as text to your device's clipboard, for example to share it yourself. This happens solely at your initiative. Where you subsequently paste that data is your responsibility and outside our control.`,
    },
    {
      heading: '8. Videos showing other people',
      content: `Video recordings of people may contain particularly sensitive data. If you analyse videos showing other people, you are responsible for ensuring that you are permitted to make and use those recordings.

Because processing happens exclusively on your device, we gain no knowledge of such recordings either.`,
    },
    {
      heading: '9. App stores and test distribution',
      content: `The app is distributed via Apple (App Store/TestFlight) and Google (Play Store). These providers process their own data in the course of download, installation and test participation – such as your store identifier, your email address when invited to a test, and crash and usage statistics collected by the platform itself.

This processing takes place under the platform operators' own responsibility and is beyond our influence. The following apply:
– Apple: https://www.apple.com/legal/privacy/
– Google: https://policies.google.com/privacy`,
    },
    {
      heading: '10. Legal basis',
      content: `Insofar as the local processing constitutes processing of personal data by us at all, it is based on Art. 6(1)(b) GDPR (providing the app functionality you requested). No transmission to us takes place.`,
    },
    {
      heading: '11. Your rights',
      content: `You have the rights to access (Art. 15 GDPR), rectification (Art. 16 GDPR), erasure (Art. 17 GDPR), restriction of processing (Art. 18 GDPR), data portability (Art. 20 GDPR) and objection (Art. 21 GDPR).

Please note: since we receive no data from you, we can neither provide information about your analysis data nor delete it – both rest entirely in your hands via your device. For questions about the app, contact us at: ${email}`,
    },
    {
      heading: '12. Right to lodge a complaint',
      content: `You have the right to lodge a complaint with a data protection supervisory authority. The competent authority is the Hessian Commissioner for Data Protection and Freedom of Information, Gustav-Stresemann-Ring 1, 65189 Wiesbaden, Germany (https://datenschutz.hessen.de).`,
    },
    {
      heading: '13. Status and changes',
      content: `This privacy policy applies to the Calivision app and is current as of September 2026. Further development of the app or changed legal requirements may make an update necessary.`,
    },
  ]

  return (
    <>
      <header className="club-subheader">
        <div className="container" style={{ height: 64, display: 'flex', alignItems: 'center' }}>
          <Link href={`/${lang}`} className="club-back">
            {isDE ? '← Zurück' : '← Back'}
          </Link>
        </div>
      </header>

      <main>
        <div className="container" style={{ maxWidth: 720, padding: '4rem 0 6rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--fg)', margin: '0 0 1rem' }}>
            {isDE ? 'Datenschutz' : 'Privacy Policy'}
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', margin: '0 0 3rem' }}>
            {isDE ? 'App Calivision' : 'Calivision app'}
          </p>

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
