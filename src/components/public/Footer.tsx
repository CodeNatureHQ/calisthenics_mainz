import Link from 'next/link'
import type { Lang } from '@/lib/types'

type Props = { lang: Lang }

export default function Footer({ lang }: Props) {
  const isDE = lang === 'de'
  return (
    <footer style={{ padding: '48px 0 60px', borderTop: '1px solid var(--line-soft)' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--fg-mute)',
          letterSpacing: '0.04em',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Calisthenics Mainz
          </div>
          <div>© {new Date().getFullYear()} Calisthenics Mainz e.V.</div>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href={`/${lang}/impressum`} style={linkStyle}>{isDE ? 'Impressum' : 'Imprint'}</Link>
          <Link href={`/${lang}/datenschutz`} style={linkStyle}>{isDE ? 'Datenschutz' : 'Privacy'}</Link>
          <a href="https://instagram.com/calisthenics_mainz" target="_blank" rel="noopener noreferrer" style={linkStyle}>Instagram</a>
        </div>
      </div>
    </footer>
  )
}

const linkStyle: React.CSSProperties = {
  color: 'var(--fg-mute)',
  textDecoration: 'none',
  transition: 'color 0.2s',
}
