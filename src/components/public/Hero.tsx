import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import type { Lang, SiteSettings, TrainingSession } from '@/lib/types'
import { t, fullDayLabel } from '@/lib/utils'
import Pulse from './Pulse'

/** The next regular session, counted from today in Berlin time. */
function nextSession(sessions: TrainingSession[]): TrainingSession | null {
  if (!sessions.length) return null
  const berlin = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  const todayDow = (berlin.getDay() + 6) % 7 // 0 = Monday
  const ranked = [...sessions].sort((a, b) => {
    const da = (a.day_of_week - todayDow + 7) % 7
    const db = (b.day_of_week - todayDow + 7) % 7
    return da - db || a.time_label.localeCompare(b.time_label)
  })
  return ranked[0]
}

export default function Hero({ lang, sessions = [] }: { lang: Lang; settings: SiteSettings | null; sessions?: TrainingSession[] }) {
  const de = lang === 'de'
  const next = nextSession(sessions)
  return (
    <section id="hero" className="club-hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Calisthenics Mainz e.V.</p>
            <h1>{de ? <>Dein Sport.<br /><span>Deine Leute.</span></> : <>Your sport.<br /><span>Your people.</span></>}</h1>
          </div>
          <div className="hero-intro">
            <p>{de ? 'Klimmzüge üben. Skills teilen. Zusammen weiterkommen. Wir sind dein Calisthenics-Verein in Mainz – in der Halle und draußen an den Stangen.' : 'Practice pull-ups. Share skills. Make progress together. We’re your calisthenics club in Mainz – in the gym and out at the bars.'}</p>
            {next && (
              <a href="#training" className="hero-next">
                <span className="live-dot" aria-hidden="true" />
                <span>{de ? 'Nächstes Training' : 'Next session'}</span>
                <strong>{fullDayLabel(next.day_of_week, lang)} · {next.time_label}</strong>
                <span>{t(next.place, lang)}</span>
              </a>
            )}
            <div className="hero-actions">
              <a href="#training" className="club-button">{de ? 'Finde dein Training' : 'Find your session'}<ArrowUpRight size={20} /></a>
            </div>
          </div>
        </div>
        <figure className="hero-photo">
          <div className="hero-photo-frame">
            <Image src="/images/verein-training.png" alt={de ? 'Die Calisthenics-Mainz-Community zusammen an den Trainingsstangen in der Halle' : 'The Calisthenics Mainz community together at the gym bars'} fill sizes="(max-width: 1320px) 100vw, 1240px" preload />
            <Image src="/logo.png" alt="" width={92} height={92} className="hero-photo-stamp" />
          </div>
          <figcaption>
            <span>{de ? 'Viele Ziele. Eine gemeinsame Session.' : 'Different goals. One shared session.'}</span>
            <a href={`/${lang}/ueber-uns`}>{de ? 'Das sind wir' : 'Meet the club'}<ArrowUpRight size={17} /></a>
          </figcaption>
        </figure>
        <div className="hero-pulse"><Pulse /></div>
      </div>
    </section>
  )
}
