import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Lang, SiteSettings } from '@/lib/types'
import Pulse from './Pulse'

export default function AboutSection({ lang }: { lang: Lang; settings: SiteSettings | null }) {
  const de = lang === 'de'
  const disciplines = de ? [
    ['Basics', 'Klimmzüge, Dips und Liegestütze. Saubere Wiederholungen bilden die Grundlage für alles, was danach kommt.'],
    ['Statics', 'Handstand, L-Sit, Front Lever. Hier geht es um Körperspannung, Balance und Kontrolle.'],
    ['Dynamics', 'Muscle-ups und Bewegung an der Stange. Neue Abläufe üben wir Schritt für Schritt.'],
  ] : [
    ['Basics', 'Pull-ups, dips and push-ups. Clean repetitions build the foundation for everything that follows.'],
    ['Statics', 'Handstands, L-sits and front levers. Build body tension, balance and control.'],
    ['Dynamics', 'Muscle-ups and movement at the bars. We work on new sequences step by step.'],
  ]
  return (
    <section id={de ? 'ueber-uns' : 'about'} className="section about-club">
      <div className="container">
        <div className="about-club-grid">
          <div><p className="eyebrow">{de ? 'Unser Sport. Unser Verein.' : 'Our sport. Our club.'}</p><h2>{de ? <>Dein nächster Versuch.<br />Wir sind dabei.</> : <>Your next attempt.<br />We’re right here.</>}</h2></div>
          <div className="about-club-copy"><p>{de ? 'Mal fehlt noch ein Stück bis über die Stange. Mal klappt ein Skill zum ersten Mal. Beides gehört dazu. Wir geben uns Tipps, üben gemeinsam und freuen uns über die Fortschritte der anderen.' : 'Sometimes you’re still a little short of the bar. Sometimes a skill clicks for the first time. Both belong here. We share advice, practice together and celebrate each other’s progress.'}</p><Link href={`/${lang}/ueber-uns`} className="club-text-link">{de ? 'Mehr über uns' : 'More about us'}<ArrowUpRight size={18} /></Link></div>
        </div>
        <Pulse />
        <div className="discipline-grid">{disciplines.map(([title, text], index) => <article key={title}><span className="discipline-index">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>
  )
}
