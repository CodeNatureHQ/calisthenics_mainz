import type { ReactNode } from 'react'
import type { Lang } from '@/lib/types'

const copy = {
  de: {
    title: 'Turnhalle – bitte beachten',
    shoes: 'Keine Schuhe',
    shoesNote: 'auch keine Sportschuhe',
    drinks: 'Keine Getränke',
    drinksNote: 'auch kein Wasser',
    necklace: 'Keine Halsketten',
    necklaceNote: 'vor dem Training ablegen',
    footer: 'Wir trainieren in Socken oder barfuß. Schuhe und Getränke bleiben im Zwischenraum vor der Halle.',
  },
  en: {
    title: 'Gym hall – please note',
    shoes: 'No shoes',
    shoesNote: 'not even sports shoes',
    drinks: 'No drinks',
    drinksNote: 'not even water',
    necklace: 'No necklaces',
    necklaceNote: 'take them off before training',
    footer: 'We train in socks or barefoot. Leave shoes and drinks in the entrance area outside the hall.',
  },
}

export function isHallPlace(placeDe: string | undefined) {
  return /halle/i.test(placeDe ?? '')
}

export default function HallRules({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const c = copy[lang]
  return (
    <div className={compact ? 'hall-rules hall-rules-compact' : 'hall-rules'} role="note">
      <p className="hall-rules-title">{c.title}</p>
      <ul className="hall-rules-signs">
        <li>
          <ProhibitionSign><Shoe /></ProhibitionSign>
          <span><strong>{c.shoes}</strong>{c.shoesNote}</span>
        </li>
        <li>
          <ProhibitionSign><Bottle /></ProhibitionSign>
          <span><strong>{c.drinks}</strong>{c.drinksNote}</span>
        </li>
        <li>
          <ProhibitionSign><Necklace /></ProhibitionSign>
          <span><strong>{c.necklace}</strong>{c.necklaceNote}</span>
        </li>
      </ul>
      <p className="hall-rules-footer">{c.footer}</p>
    </div>
  )
}

function ProhibitionSign({ children }: { children: ReactNode }) {
  return (
    <svg className="hall-rules-sign" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#fff" stroke="#D7261E" strokeWidth="6" />
      <g transform="translate(11 11) scale(1.75)" fill="#111" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
      <line x1="12.2" y1="12.2" x2="51.8" y2="51.8" stroke="#D7261E" strokeWidth="6" />
    </svg>
  )
}

function Shoe() {
  return (
    <>
      <path d="M2.5 17V10.5l3.5-.8 2.2 2 3-1.4.9-3.3h2.6l1 3.4c3.1.6 5.8 1.8 5.8 4.4V17z" />
      <path d="M2.5 17.6h19v1.4h-19z" />
      <path d="M2.5 17h19M8.6 11.9l.9 1.2M11 11l.9 1.2" stroke="#fff" />
    </>
  )
}

function Bottle() {
  return (
    <>
      <path d="M10 2.5h4V5l1.6 2.2V20.5a1 1 0 0 1-1 1H9.4a1 1 0 0 1-1-1V7.2L10 5z" />
      <path d="M8.4 11h7.2M8.4 16h7.2" stroke="#fff" />
    </>
  )
}

function Necklace() {
  return (
    <>
      <path d="M4 3c0 7.5 3.6 11.2 8 11.2S20 10.5 20 3" fill="none" strokeWidth="2" strokeDasharray="0.1 2.6" />
      <path d="M12 14.2l2.6 3.4a2.9 2.9 0 1 1-5.2 0z" />
    </>
  )
}
