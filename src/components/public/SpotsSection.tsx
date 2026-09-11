'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowUpRight, ChevronDown, MapPin } from 'lucide-react'
import SectionHeading from './SectionHeading'
import type { Lang, Spot } from '@/lib/types'
import { t } from '@/lib/utils'

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false, loading: () => <div className="spots-map-loading" aria-hidden="true" /> })

export default function SpotsSection({ lang, spots }: { lang: Lang; spots: Spot[] }) {
  const de = lang === 'de'
  const visible = spots.filter(spot => spot.visible)
  const [active, setActive] = useState<Spot | null>(null)
  return <section id="spots" className="section"><div className="container">
    <SectionHeading eyebrow={de ? 'Mainz & Umgebung' : 'Mainz & surroundings'} title={de ? 'Hier trainieren wir.' : 'This is where we train.'} description={de ? 'Halle und Parks, alle mit Stangen. Such dir einen Ort aus – die Anfahrt ist direkt verlinkt.' : 'Gym and parks, all with bars. Pick a spot and follow the directions to get there.'} />
    <div className="spots-layout">
      <div className="spot-list">{visible.map((spot, index) => {
        const directions = spot.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t(spot.name, lang)} ${spot.address}`)}`
        const photo = spot.images?.[0]
        return <article className="spot-row" key={spot.id} data-active={active?.id === spot.id} onMouseEnter={() => setActive(spot)}>
          <span className="spot-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <h3><button type="button" onClick={() => setActive(spot)}>{t(spot.name, lang)}</button></h3>
          <a href={directions} target="_blank" rel="noopener noreferrer" className="location-route" aria-label={`${de ? 'Anfahrt zu' : 'Directions to'} ${t(spot.name, lang)}`}><ArrowUpRight size={22} /></a>
          <p className="spot-address"><MapPin size={15} />{spot.address}</p>
          {t(spot.subtitle, lang) && <p className="spot-description">{t(spot.subtitle, lang)}</p>}
          {photo && <figure className="spot-photo"><img src={photo} alt={t(spot.name, lang)} loading="lazy" decoding="async" /></figure>}
          <details className="location-details">
            <summary>{de ? 'Ausstattung & Zugang' : 'Equipment & access'}<ChevronDown size={17} /></summary>
            <div>
              {t(spot.access, lang) && <p>{t(spot.access, lang)}</p>}
              {spot.gear.length > 0 && <ul className="spot-gear">{spot.gear.map(gear => <li key={gear}>{gear}</li>)}</ul>}
              <a className="club-text-link" href={directions} target="_blank" rel="noopener noreferrer">{de ? 'Anfahrt öffnen' : 'Get directions'}<ArrowUpRight size={17} /></a>
            </div>
          </details>
        </article>
      })}</div>
      <div className="spots-map"><LeafletMap spots={visible} activeSpot={active} onSpotClick={setActive} lang={lang} /></div>
    </div>
  </div></section>
}
