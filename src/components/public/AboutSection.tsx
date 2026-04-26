import type { Lang, SiteSettings } from '@/lib/types'

type Props = { lang: Lang; settings: SiteSettings | null }

const copy = {
  de: {
    label: '04',
    title: 'Über uns',
    p1: 'Calisthenics Mainz ist ein gemeinnütziger Verein. Wir glauben daran, dass Beweglichkeit, Kraft und Kontrolle für jeden erlernbar sind — ohne Gym-Abo, ohne Equipment, ohne Ausreden.',
    p2: 'Seit 2013 wächst unsere Community rund um den JGU Campus und die Parks am Rhein. Wir sind offen für alle — vom absoluten Anfänger bis zum Wettkampfathleten.',
    statLabels: ['Mitglieder', 'Gegründet', 'Spots', 'Einh. / Woche'],
    values: [
      { num: '01', title: 'Gemeinschaft zuerst', text: 'Wir helfen uns gegenseitig. Vom Anfänger-Hang bis zur Elbow-Lever-Progression — jemand hat immer den richtigen Tipp.' },
      { num: '02', title: 'Offen für alle', text: 'Kein Fitness-Level, keine Altersgrenze, kein Mitgliedsbeitrag. Komm einfach vorbei.' },
      { num: '03', title: 'Draußen trainieren', text: 'Unsere Heimat ist die Klimmzugstange im Freien. Wetter ist keine Ausrede.' },
      { num: '04', title: 'Konstant besser', text: 'Jede Einheit zählt. Progressives Training, ehrliches Feedback, keine Abkürzungen.' },
    ],
  },
  en: {
    label: '04',
    title: 'About us',
    p1: 'Calisthenics Mainz is a non-profit club. We believe that mobility, strength and control are learnable by anyone — no gym membership, no equipment, no excuses.',
    p2: 'Since 2013 our community has grown around the JGU Campus and parks along the Rhine. Open to everyone — from absolute beginners to competitive athletes.',
    statLabels: ['Members', 'Founded', 'Spots', 'Sessions / wk'],
    values: [
      { num: '01', title: 'Community first', text: "We help each other. From beginner hangs to elbow lever progressions — someone always has the right tip." },
      { num: '02', title: 'Open to all', text: 'No fitness level, no age limit, no membership fee. Just show up.' },
      { num: '03', title: 'Train outside', text: 'Our home is the outdoor pull-up bar. Weather is not an excuse.' },
      { num: '04', title: 'Constantly improving', text: 'Every session counts. Progressive training, honest feedback, no shortcuts.' },
    ],
  },
}

export default function AboutSection({ lang, settings }: Props) {
  const c = copy[lang]
  const statValues = [
    settings?.about_members  ?? '120',
    settings?.about_founded  ?? '2018',
    settings?.about_spots    ?? '3',
    settings?.about_sessions ?? '2',
  ]

  return (
    <section id={lang === 'de' ? 'ueber-uns' : 'about'} className="section">
      <div className="container">
        <SectionHead label={c.label} title={c.title} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }} className="about-grid">
          {/* Left */}
          <div>
            <p style={{ color: 'var(--fg-dim)', fontSize: 17, lineHeight: 1.65, margin: '0 0 18px' }}>
              {c.p1}
            </p>
            <p style={{ color: 'var(--fg-dim)', fontSize: 17, lineHeight: 1.65, margin: '0 0 18px' }}>
              {c.p2}
            </p>

            {/* Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                borderTop: '1px solid var(--line-soft)',
                borderLeft: '1px solid var(--line-soft)',
                marginTop: 12,
              }}
            >
              {statValues.map((val, i) => (
                <div
                  key={i}
                  style={{
                    padding: '28px 20px',
                    borderRight: '1px solid var(--line-soft)',
                    borderBottom: '1px solid var(--line-soft)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 56,
                      lineHeight: 1,
                      marginBottom: 8,
                      letterSpacing: '-0.02em',
                      color: 'var(--fg)',
                    }}
                  >
                    {val}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>
                    {c.statLabels[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Values */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40, borderTop: '1px solid var(--line-soft)' }}>
            {c.values.map((v) => (
              <div
                key={v.num}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr',
                  gap: 20,
                  padding: '22px 0',
                  borderBottom: '1px solid var(--line-soft)',
                  alignItems: 'start',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg)', letterSpacing: '0.08em', paddingTop: 3 }}>
                  {v.num}
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      margin: '0 0 6px',
                      color: 'var(--fg)',
                    }}
                  >
                    {v.title}
                  </h4>
                  <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.55 }}>{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  )
}

function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 64, paddingBottom: 20, borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 20, height: 3, background: 'var(--accent-2)', borderRadius: 2, flexShrink: 0 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-2)', letterSpacing: '0.08em' }}>{label}</div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5.5vw, 72px)', lineHeight: 0.95, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--fg)' }}>{title}</h2>
      </div>
    </div>
  )
}
