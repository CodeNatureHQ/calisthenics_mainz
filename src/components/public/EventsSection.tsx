'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, CalendarDays, MapPin, X } from 'lucide-react'
import type { Lang, Event, L10n } from '@/lib/types'
import { t as translate, isFuture } from '@/lib/utils'
import EventRegistrationModal, { type RegistrationConfig } from './EventRegistrationModal'
import Pulse from './Pulse'

type Props = { lang: Lang; events: Event[] }
const t = (field: L10n, lang: Lang) => translate(field, lang) || field.de
const categories: Record<string, { de: string; en: string }> = {
  comp: { de: 'Wettkampf', en: 'Competition' }, jam: { de: 'Jam', en: 'Jam' },
  workshop: { de: 'Workshop', en: 'Workshop' }, social: { de: 'Community', en: 'Community' },
}
function getRegConfig(ev: Event): RegistrationConfig | undefined {
  const maxTeamSize = ev.registration_max_team_size ?? 4
  if (ev.registration_mode === 'individual') return { mode: 'individual' }
  if (ev.registration_mode === 'team') return { mode: 'team', maxTeamSize }
  if (ev.registration_mode === 'both') return { mode: 'team', maxTeamSize, allowIndividual: true }
}
const dateLabel = (iso: string, lang: Lang) => new Date(iso).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin' })

export default function EventsSection({ lang, events }: Props) {
  const de = lang === 'de'
  const [selection, setSelection] = useState<'upcoming' | 'archive' | 'auto'>('auto')
  const [activeEvent, setActiveEvent] = useState<Event | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const { upcoming, past } = useMemo(() => {
    const sorted = [...events].sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))
    return { upcoming: sorted.filter(e => isFuture(e.starts_at)), past: sorted.filter(e => !isFuture(e.starts_at)).reverse() }
  }, [events])
  const tab = selection === 'auto' ? (upcoming.length ? 'upcoming' : 'archive') : selection
  const displayed = tab === 'upcoming' ? upcoming : past
  const closeDialog = useCallback(() => { setActiveEvent(null); setShowRegistration(false); trigger.current?.focus() }, [])
  useEffect(() => {
    if (!activeEvent) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [activeEvent])

  return <section id="events" className="section">
    <div className="container events-layout">
      <div className="events-intro"><p className="eyebrow">{de ? 'Aus der Community' : 'From the community'}</p><h2>{de ? <>Was geht<br /> in Mainz?</> : <>What’s on<br /> in Mainz?</>}</h2><p>{de ? 'Auch abseits der Trainingswoche sehen wir uns: bei Community-Treffen, gemeinsamen Events und Wettkämpfen. Das steht an – und das haben wir zusammen erlebt.' : 'We meet beyond our regular sessions too: at community gatherings, shared events and competitions. Here’s what’s next – and what we’ve experienced together.'}</p><a className="club-text-link" href="https://www.instagram.com/calisthenicsmainz/" target="_blank" rel="noopener noreferrer">{de ? 'Einblicke auf Instagram' : 'Follow along on Instagram'}<ArrowUpRight size={17} /></a></div>
      <div className="events-content">
        <div className="club-tabs" aria-label={de ? 'Veranstaltungen filtern' : 'Filter events'}>{(['upcoming', 'archive'] as const).map(value => <button key={value} aria-pressed={tab === value} onClick={() => setSelection(value)}>{value === 'upcoming' ? (de ? 'Nächste Events' : 'Upcoming events') : (de ? 'Rückblicke' : 'Past events')}<span>{value === 'upcoming' ? upcoming.length : past.length}</span></button>)}</div>
        {upcoming.length === 0 && tab === 'archive' && <p className="event-status">{de ? 'Neue Termine folgen. Das war zuletzt bei uns los:' : 'New dates will follow. Here’s what we’ve been up to:'}</p>}
        {displayed.length > 0 ? <div className="event-grid">{displayed.map(ev => <article key={ev.id} className="event-card"><button className="event-card-button" onClick={e => { trigger.current = e.currentTarget; setActiveEvent(ev) }}>
          <div className={`event-media${ev.image_url ? '' : ' event-poster'}`}>{ev.image_url ? <img src={ev.image_url} alt="" loading="lazy" /> : <><span>{categories[ev.category]?.[lang]}</span><strong>{new Date(ev.starts_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Berlin' })}</strong><span>Calisthenics Mainz</span><Pulse /></>}<span className="event-open" aria-hidden="true"><ArrowUpRight size={24} /></span></div>
          <div className="event-card-body"><div className="event-meta"><span>{categories[ev.category]?.[lang]}</span><span>{isFuture(ev.starts_at) ? (de ? 'Demnächst' : 'Upcoming') : (de ? 'Rückblick' : 'Past event')}</span></div><h3>{t(ev.title, lang)}</h3><p><CalendarDays size={15} /><time dateTime={ev.starts_at}>{dateLabel(ev.starts_at, lang)}</time></p><p><MapPin size={15} />{t(ev.place, lang)}</p></div>
        </button></article>)}</div> : <div className="events-empty"><CalendarDays size={32} /><h3>{de ? 'Der nächste Termin kommt.' : 'More dates to come.'}</h3><p>{de ? 'Sobald ein Event feststeht, findest du es hier. Bis dahin sehen wir uns beim regulären Training.' : 'Our next event will appear here as soon as it’s confirmed. In the meantime, join a regular training session.'}</p><a href="#training" className="club-text-link">{de ? 'Zum Trainingsplan' : 'See the schedule'}<ArrowUpRight size={17} /></a></div>}
      </div>
    </div>
    {activeEvent && <EventDialog event={activeEvent} lang={lang} onClose={closeDialog} onRegister={() => setShowRegistration(true)} registrationOpen={showRegistration} />}
    {activeEvent && showRegistration && getRegConfig(activeEvent) && <EventRegistrationModal event={activeEvent} config={getRegConfig(activeEvent)!} lang={lang} onClose={() => setShowRegistration(false)} />}
  </section>
}

function EventDialog({ event, lang, onClose, onRegister, registrationOpen }: { event: Event; lang: Lang; onClose: () => void; onRegister: () => void; registrationOpen: boolean }) {
  const de = lang === 'de'
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (registrationOpen) return
    const element = panel.current
    element?.querySelector<HTMLButtonElement>('button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key !== 'Tab' || !element) return
      const nodes = Array.from(element.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex="0"]')).filter(node => !node.hasAttribute('disabled'))
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, registrationOpen])
  return createPortal(<div className="club-dialog-backdrop" onClick={onClose}><div ref={panel} role="dialog" aria-modal="true" aria-labelledby="event-dialog-title" className="club-event-dialog" onClick={e => e.stopPropagation()}>
    <button className="dialog-close" onClick={onClose} aria-label={de ? 'Schließen' : 'Close'}><X size={22} /></button>
    {event.image_url && <img className="dialog-photo" src={event.image_url} alt={t(event.title, lang)} />}
    <div className="dialog-content"><p className="eyebrow">{categories[event.category]?.[lang]} · {isFuture(event.starts_at) ? (de ? 'Demnächst' : 'Upcoming') : (de ? 'Rückblick' : 'Past event')}</p><h2 id="event-dialog-title">{t(event.title, lang)}</h2><div className="dialog-facts"><p><CalendarDays size={18} />{dateLabel(event.starts_at, lang)} · {new Date(event.starts_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })}{de ? ' Uhr' : ''}</p><p><MapPin size={18} />{t(event.place, lang)}</p></div><div className="prose-cm" dangerouslySetInnerHTML={{ __html: t(event.description, lang) }} />{getRegConfig(event) && isFuture(event.starts_at) && <button className="club-button" onClick={onRegister}>{de ? 'Jetzt anmelden' : 'Sign up'}<ArrowUpRight size={18} /></button>}</div>
  </div></div>, document.body)
}
