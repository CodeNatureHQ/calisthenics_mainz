import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Lang, SiteSettings, TeamMember } from '@/lib/types'

export default function UeberUnsPage({ lang, teamMembers }: { lang: Lang; settings: SiteSettings | null; teamMembers: TeamMember[] }) {
  const de = lang === 'de'
  const principles = de ? [
    ['Zusammen trainieren', 'Wir tauschen Übungen aus, geben Hilfestellung und schauen aufeinander. Dein Trainingspartner muss nicht auf demselben Level sein wie du.'],
    ['Den eigenen Weg finden', 'Mehr Kraft, ein sicherer Handstand oder der erste Klimmzug: Du bringst dein Ziel mit. Wir helfen dir, passende Schritte dafür zu finden.'],
    ['Drinnen und draußen', 'Wir treffen uns in der Halle und an den Stangen im Park. Die aktuellen Zeiten und Orte findest du im Trainingsplan.'],
  ] : [
    ['Train together', 'We share exercises, spot each other and look out for one another. Your training partner doesn’t have to be at the same level as you.'],
    ['Find your own path', 'More strength, a steady handstand or your first pull-up: bring your goal. We help you find the steps to get there.'],
    ['Indoors and outdoors', 'We meet in the gym and at the park bars. Check the schedule for current times and locations.'],
  ]
  return <main className="club-about-page">
    <section className="about-cover">
      <div className="about-cover-media"><Image src="/images/verein-training.png" fill sizes="100vw" preload alt={de ? 'Die Trainingsgruppe von Calisthenics Mainz vor den Stangen in der Sporthalle' : 'The Calisthenics Mainz training group at the bars in the sports hall'} /></div>
      <div className="container about-cover-content">
        <p className="eyebrow">Calisthenics Mainz e.V.</p>
        <h1>{de ? <>Der Sport verbindet.<br /><span>Die Leute bleiben.</span></> : <>Brought together by sport.<br /><span>Staying for the people.</span></>}</h1>
        <p>{de ? 'Wir sind ein gemeinnütziger Verein für Calisthenics in Mainz. Uns verbindet das Training mit dem eigenen Körpergewicht und die Lust, gemeinsam dazuzulernen.' : 'We are a non-profit calisthenics club in Mainz. We share a love of bodyweight training and learning together.'}</p>
      </div>
      <p className="container about-cover-caption">{de ? 'Ein Teil unserer Community beim Hallentraining.' : 'Some of our community at an indoor training session.'}</p>
    </section>
    <section className="section about-principles"><div className="container"><div className="section-heading"><div><p className="eyebrow">{de ? 'So trainieren wir' : 'How we train'}</p><h2>{de ? 'Verschiedene Ziele. Eine Gruppe.' : 'Different goals. One group.'}</h2></div></div><div className="discipline-grid">{principles.map(([title, text], index) => <article key={title}><span className="discipline-index">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
    {teamMembers.length > 0 && <section className="section"><div className="container"><p className="eyebrow">{de ? 'Die Menschen dahinter' : 'The people behind the club'}</p><h2 className="standalone-heading">{de ? 'Trainer & Vorstand' : 'Coaches & board'}</h2><div className="club-team-grid">{teamMembers.map(member => <article key={member.id}>{member.image_url ? <img src={member.image_url} alt={member.name} loading="lazy" /> : <div className="team-initials" aria-hidden="true">{member.name.split(' ').map(word => word[0]).join('')}</div>}<h3>{member.name}</h3><p>{member.role === 'trainer' ? (de ? 'Trainer' : 'Coach') : (de ? 'Vorstand' : 'Board')}</p></article>)}</div></div></section>}
    <section className="section about-invitation"><div className="container"><h2>{de ? 'Lern uns beim Training kennen.' : 'Meet us at training.'}</h2><Link href={`/${lang}#training`} className="club-button">{de ? 'Zu den nächsten Sessions' : 'Find a session'}<ArrowUpRight size={20} /></Link></div></section>
  </main>
}
