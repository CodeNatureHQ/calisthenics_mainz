import type { Lang, SiteSettings, TeamMember } from '@/lib/types'

const copy = {
  de: {
    eyebrow: 'Über uns',
    title: 'Wir sind\nCalisthenics\nMainz',
    p1: 'Calisthenics Mainz ist ein gemeinnütziger Verein. Wir glauben daran, dass Beweglichkeit, Kraft und Kontrolle für jeden erlernbar sind — ohne Gym-Abo, ohne Equipment, ohne Ausreden.',
    p2: 'Seit 2013 wächst unsere Community rund um den JGU Campus und die Parks am Rhein. Wir sind offen für alle — vom absoluten Anfänger bis zum Wettkampfathleten.',
    statLabels: ['Mitglieder', 'Gegründet', 'Spots', 'Einh. / Woche'],
    valuesLabel: '02',
    valuesTitle: 'Unsere Werte',
    values: [
      { num: '01', title: 'Gemeinschaft zuerst', text: 'Wir helfen uns gegenseitig. Vom Anfänger-Hang bis zur Elbow-Lever-Progression — jemand hat immer den richtigen Tipp.' },
      { num: '02', title: 'Offen für alle', text: 'Kein Fitness-Level, keine Altersgrenze, kein Mitgliedsbeitrag. Komm einfach vorbei.' },
      { num: '03', title: 'Draußen trainieren', text: 'Unsere Heimat ist die Klimmzugstange im Freien. Wetter ist keine Ausrede.' },
      { num: '04', title: 'Konstant besser', text: 'Jede Einheit zählt. Progressives Training, ehrliches Feedback, keine Abkürzungen.' },
    ],
    teamLabel: '03',
    teamTitle: 'Trainer & Vorstand',
    roles: { trainer: 'Trainer', vorstand: 'Vorstand' },
  },
  en: {
    eyebrow: 'About us',
    title: 'We are\nCalisthenics\nMainz',
    p1: 'Calisthenics Mainz is a non-profit club. We believe that mobility, strength and control are learnable by anyone — no gym membership, no equipment, no excuses.',
    p2: 'Since 2013 our community has grown around the JGU Campus and parks along the Rhine. Open to everyone — from absolute beginners to competitive athletes.',
    statLabels: ['Members', 'Founded', 'Spots', 'Sessions / wk'],
    valuesLabel: '02',
    valuesTitle: 'Our values',
    values: [
      { num: '01', title: 'Community first', text: "We help each other. From beginner hangs to elbow lever progressions — someone always has the right tip." },
      { num: '02', title: 'Open to all', text: 'No fitness level, no age limit, no membership fee. Just show up.' },
      { num: '03', title: 'Train outside', text: 'Our home is the outdoor pull-up bar. Weather is not an excuse.' },
      { num: '04', title: 'Constantly improving', text: 'Every session counts. Progressive training, honest feedback, no shortcuts.' },
    ],
    teamLabel: '03',
    teamTitle: 'Trainers & Board',
    roles: { trainer: 'Trainer', vorstand: 'Board' },
  },
}

type Props = { lang: Lang; settings: SiteSettings | null; teamMembers: TeamMember[] }

export default function UeberUnsPage({ lang, settings, teamMembers }: Props) {
  const c = copy[lang]
  const statValues = [
    settings?.about_members  ?? '120',
    settings?.about_founded  ?? '2018',
    settings?.about_spots    ?? '3',
    settings?.about_sessions ?? '2',
  ]

  return (
    <div style={{ minHeight: '100svh', paddingTop: 68, background: 'var(--bg)' }}>

      {/* ── Hero header ─────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--line-soft)', padding: '64px 0 72px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 20, height: 3, background: 'var(--accent-2)', borderRadius: 2 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {c.eyebrow}
            </span>
          </div>
          <div className="ueber-hero-grid">
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 7vw, 96px)',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              margin: 0,
              lineHeight: 0.95,
              whiteSpace: 'pre-line',
            }}>
              {c.title}
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 4 }}>
              <p style={{ color: 'var(--fg-dim)', fontSize: 17, lineHeight: 1.65, margin: '0 0 14px' }}>{c.p1}</p>
              <p style={{ color: 'var(--fg-dim)', fontSize: 17, lineHeight: 1.65, margin: 0 }}>{c.p2}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--line-soft)' }}>
        <div className="container" style={{ padding: '0' }}>
          <div className="ueber-stats-grid">
            {statValues.map((val, i) => (
              <div
                key={i}
                style={{
                  padding: '40px 32px',
                  borderRight: i < statValues.length - 1 ? '1px solid var(--line-soft)' : undefined,
                }}
                className={`ueber-stat-item ueber-stat-${i}`}
              >
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(48px, 6vw, 80px)',
                  lineHeight: 1,
                  marginBottom: 10,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                }}>
                  {val}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>
                  {c.statLabels[i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Values ──────────────────────────────────── */}
      <div style={{ padding: '80px 0', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 20, height: 3, background: 'var(--accent-2)', borderRadius: 2, flexShrink: 0 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-2)', letterSpacing: '0.08em' }}>{c.valuesLabel}</div>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 56px)',
            lineHeight: 0.95,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: 'var(--fg)',
            margin: '0 0 48px',
          }}>
            {c.valuesTitle}
          </h2>
          <div className="ueber-values-grid">
            {c.values.map((v) => (
              <div
                key={v.num}
                style={{
                  padding: '28px 0',
                  borderTop: '1px solid var(--line-soft)',
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr',
                  gap: 20,
                  alignItems: 'start',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-mute)', letterSpacing: '0.08em', paddingTop: 3 }}>
                  {v.num}
                </div>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    margin: '0 0 8px',
                    color: 'var(--fg)',
                  }}>
                    {v.title}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.6 }}>{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Team (nur anzeigen wenn Mitglieder vorhanden) ── */}
      {teamMembers.length > 0 && (
        <div style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 20, height: 3, background: 'var(--accent-2)', borderRadius: 2, flexShrink: 0 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-2)', letterSpacing: '0.08em' }}>{c.teamLabel}</div>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 56px)',
              lineHeight: 0.95,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: 'var(--fg)',
              margin: '0 0 48px',
            }}>
              {c.teamTitle}
            </h2>
            <div className="ueber-team-grid">
              {teamMembers.map((member) => (
                <div key={member.id}>
                  <div style={{ marginBottom: 14, overflow: 'hidden', borderRadius: 4 }}>
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <InitialsAvatar name={member.name} />
                    )}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    textTransform: 'uppercase',
                    letterSpacing: '0.01em',
                    color: 'var(--fg)',
                    marginBottom: 4,
                  }}>
                    {member.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-2)',
                  }}>
                    {c.roles[member.role]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ueber-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: end;
          margin-top: 8px;
        }
        .ueber-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .ueber-values-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 80px;
        }
        .ueber-team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .ueber-team-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .ueber-hero-grid { grid-template-columns: 1fr; gap: 32px; }
          .ueber-values-grid { grid-template-columns: 1fr; gap: 0; }
          .ueber-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .ueber-stat-1 { border-right: none !important; }
          .ueber-stat-2 { border-top: 1px solid var(--line-soft); }
          .ueber-stat-3 { border-top: 1px solid var(--line-soft); border-right: none !important; }
        }
        @media (max-width: 640px) {
          .ueber-team-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
      `}</style>
    </div>
  )
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div style={{
      width: '100%',
      aspectRatio: '1 / 1',
      background: 'var(--bg-3)',
      border: '1px solid var(--line-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 48px)',
        color: 'var(--fg-mute)',
        letterSpacing: '0.04em',
      }}>
        {initials}
      </span>
    </div>
  )
}
