'use client'

import { useState } from 'react'
import type { Lang } from '@/lib/types'

const URL_REGEX = /(https?:\/\/[^\s]+)/g
function renderWithLinks(text: string) {
  const parts = text.split(URL_REGEX)
  return parts.map((part, i) =>
    URL_REGEX.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
        style={{ color: 'var(--accent-spark)', textDecoration: 'underline', textUnderlineOffset: 3, wordBreak: 'break-all' }}>
        {part}
      </a>
    ) : part
  )
}

type Props = { lang: Lang }

const copy = {
  de: {
    label: '06',
    title: 'FAQ',
    items: [
      {
        q: 'Wann und wo findet das Training statt?',
        a: 'Wir trainieren montags und donnerstags von 19:15 bis 21:30 Uhr in der Geräte- und Bodenturnhalle auf dem JGU Campus (Saarstraße 21, 55122 Mainz).',
      },
      {
        q: 'Kann ich einfach zum Training dazu kommen?',
        a: 'Unsere Outdoor-Spots (Goetheplatz, Volkspark, Wiesbaden-Biebrich) sind für alle frei zugänglich — einfach vorbeikommen!\n\nFür das Hallentraining auf dem JGU Campus gelten die Teilnahmevoraussetzungen des AHS. Studierende der JGU Mainz können ohne weitere Anmeldung direkt teilnehmen.\n\nAlle anderen können über das AHS-Angebot mitmachen oder eine Einheit als Probetraining besuchen. Schickt dafür das Probetrainingsformular spätestens 3 Tage vorher an das AHS.\n\nDa es am Eingang Kontrollen gibt, denkt bitte daran, eure Anmeldung oder euren Probetrainingsantrag mitzubringen.\n\nAlle Infos und Formulare gibt\'s hier: https://www.ahs.uni-mainz.de/foerderverein/',
      },
      {
        q: 'Kann ich auch als Anfänger:in zum Training kommen?',
        a: 'Klar! Unser Training steht allen Interessierten offen, unabhängig vom individuellen Trainingslevel.',
      },
      {
        q: 'Was soll ich zum Training mitbringen?',
        a: 'Neben der Teilnahmeberechtigung braucht ihr nur Sportkleidung und etwas zu trinken. Sportschuhe sind in der Geräteturnhalle nicht erlaubt — wir trainieren daher barfuß oder in Socken.',
      },
      {
        q: 'Wie läuft das Training ab?',
        a: 'Zunächst wärmen wir uns gemeinsam auf, dann unterteilen wir das Training in Basics, Statics und Dynamics. Ihr könnt frei entscheiden, wo ihr mitmachen wollt. Wenn ihr lieber euer eigenes Ding machen wollt, geht das natürlich auch. Wichtig ist nur, dass ihr euch selbst und andere nicht gefährdet.',
      },
      {
        q: 'Was hat es mit Calisthenics Mainz e.V. auf sich?',
        a: 'Calisthenics Mainz e.V. wurde offiziell 2017 gegründet. Die Intention dahinter ist es, durch ein großes Netzwerk den Sport und die Leidenschaft dahinter im Rhein-Main-Gebiet zu verbreiten und möglichst viele Menschen zu erreichen.',
      },
      {
        q: 'Meine Frage wurde nicht beantwortet — an wen kann ich mich wenden?',
        a: 'Schickt uns gerne eine Nachricht über das Kontaktformular oder direkt auf Instagram.',
      },
    ],
  },
  en: {
    label: '06',
    title: 'FAQ',
    items: [
      {
        q: 'When and where does training take place?',
        a: 'We train on Mondays and Thursdays from 7:15 PM to 9:30 PM in the gymnastics hall at JGU Campus (Saarstraße 21, 55122 Mainz).',
      },
      {
        q: 'Can I just show up to training?',
        a: 'Since our training is currently part of the AHS programme, the AHS participation requirements apply. You can check these on the AHS website for your individual situation. No registration with us is required.',
      },
      {
        q: 'Can I come as a beginner?',
        a: "Absolutely! Our training is open to everyone, regardless of individual fitness level.",
      },
      {
        q: 'What should I bring?',
        a: 'Besides the participation eligibility, you only need sportswear and something to drink. Sports shoes are not allowed in the gymnastics hall — we train barefoot or in socks.',
      },
      {
        q: 'How does a training session work?',
        a: 'We start with a group warm-up, then split the session into Basics, Statics and Dynamics. You can freely decide where to join in — or do your own thing, that works too. The only rule: don\'t put yourself or others at risk.',
      },
      {
        q: 'What is Calisthenics Mainz e.V.?',
        a: 'Calisthenics Mainz e.V. was officially founded in 2017. The goal is to spread the sport and the passion behind it across the Rhine-Main region and reach as many people as possible.',
      },
      {
        q: "My question wasn't answered — who can I contact?",
        a: 'Feel free to send us a message via the contact form or directly on Instagram.',
      },
    ],
  },
}

export default function FaqSection({ lang }: Props) {
  const c = copy[lang]
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="section">
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 40,
            marginBottom: 64,
            paddingBottom: 20,
            borderBottom: '1px solid var(--line-soft)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 20, height: 3, background: 'var(--accent-2)', borderRadius: 2, flexShrink: 0 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-2)', letterSpacing: '0.08em' }}>{c.label}</div>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5.5vw, 72px)',
                lineHeight: 0.95,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: 'var(--fg)',
                margin: 0,
              }}
            >
              {c.title}
            </h2>
          </div>
        </div>

        <div>
          {c.items.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                style={{
                  borderBottom: '1px solid var(--line-soft)',
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    padding: '22px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--fg)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(16px, 2vw, 20px)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.01em',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.q}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 20,
                      color: 'var(--fg-mute)',
                      flexShrink: 0,
                      transition: 'transform 0.2s',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}
                  >
                    +
                  </span>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? 400 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}
                >
                  <div style={{ color: 'var(--fg-dim)', fontSize: 16, lineHeight: 1.65, margin: '0 0 24px', paddingRight: 32 }}>
                    {item.a.split('\n\n').map((para, j) => (
                      <p key={j} style={{ margin: j === 0 ? 0 : '12px 0 0' }}>{renderWithLinks(para)}</p>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
