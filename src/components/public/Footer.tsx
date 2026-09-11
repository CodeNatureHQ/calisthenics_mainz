import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Lang } from '@/lib/types'
import Pulse from './Pulse'

export default function Footer({ lang }: { lang: Lang }) {
  const de = lang === 'de'
  return <footer className="club-footer">
    <Pulse />
    <div className="container">
      <div className="footer-main">
        <Link href={`/${lang}`} className="footer-brand">
          <Image src="/logo.png" alt="" width={84} height={84} className="club-stamp" />
          <span className="footer-wordmark">Calisthenics<br /><span>Mainz.</span></span>
        </Link>
        <div>
          <p>{de ? 'Wir sehen uns an der Stange.' : 'See you at the bars.'}</p>
          <a href="https://www.instagram.com/calisthenicsmainz/" target="_blank" rel="noopener noreferrer">@calisthenicsmainz<ArrowUpRight size={16} /></a>
        </div>
        <nav aria-label={de ? 'Weitere Seiten' : 'More pages'}>
          <Link href={`/${lang}#training`}>Training</Link>
          <Link href={`/${lang}#spots`}>Spots</Link>
          <Link href={`/${lang}#events`}>Events</Link>
          <Link href={`/${lang}/ueber-uns`}>{de ? 'Unser Verein' : 'Our club'}</Link>
          <Link href={`/${lang}#blog`}>{de ? 'Vereinsleben' : 'Club stories'}</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Calisthenics Mainz e.V.</span>
        <div><Link href={`/${lang}/impressum`}>{de ? 'Impressum' : 'Imprint'}</Link><Link href={`/${lang}/datenschutz`}>{de ? 'Datenschutz' : 'Privacy'}</Link></div>
      </div>
    </div>
  </footer>
}
