'use client'

import type { Lang, Product } from '@/lib/types'

type Props = { lang: Lang; products: Product[] }

const copy = {
  de: {
    eyebrow: 'Ausrüstung',
    title: 'Empfohlenes Equipment',
    sub: 'Gear, das wir selbst im Training und Privat nutzen — von Ringen über Parallettes bis zum Türreck. Keine Werbung, nur Dinge, hinter denen wir stehen.',
    cta: 'Zum Angebot',
    disclaimer: 'Diese Seite enthält Affiliate-Links zu Amazon. Wir erhalten eine kleine Provision bei Käufen über diese Links — der Preis für dich bleibt gleich. Danke für deine Unterstützung!',
    categories: {
      ringe: 'Ringe',
      stangen: 'Stangen',
      parallettes: 'Parallettes',
      zubehoer: 'Zubehör',
    },
  },
  en: {
    eyebrow: 'Equipment',
    title: 'Recommended gear',
    sub: 'Gear we use ourselves in training — from rings to parallettes and pull-up bars. No ads, just things we stand behind.',
    cta: 'View offer',
    disclaimer: 'This page contains affiliate links to Amazon. We receive a small commission on purchases made through these links — the price stays the same for you. Thank you for your support!',
    categories: {
      ringe: 'Rings',
      stangen: 'Bar',
      parallettes: 'Parallettes',
      zubehoer: 'Accessories',
    },
  },
}


const CAT_COLORS: Record<string, string> = {
  ringe: '#E6C6FF',
  stangen: '#8EC5FF',
  parallettes: '#D8FF3D',
  zubehoer: '#FFB48E',
}

export default function AusruestungPage({ lang, products }: Props) {
  const c = copy[lang]

  return (
    <div style={{ minHeight: '100svh', paddingTop: 68, background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--line-soft)', padding: '64px 0 48px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 20, height: 3, background: 'var(--accent-2)', borderRadius: 2 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {c.eyebrow}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 80px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--fg)', margin: '0 0 20px', lineHeight: 0.95 }}>
            {c.title}
          </h1>
          <p style={{ color: 'var(--fg-dim)', fontSize: 17, lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
            {c.sub}
          </p>
        </div>
      </div>

      {/* Product grid */}
      <div className="container" style={{ padding: '56px 0 80px' }}>
        {products.length === 0 ? (
          <p style={{ color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.06em' }}>
            {lang === 'de' ? 'Bald verfügbar.' : 'Coming soon.'}
          </p>
        ) : (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}
          className="ausruestung-grid"
        >
          {products.map((p: Product) => {
            const catColor = CAT_COLORS[p.category] ?? 'var(--fg-dim)'
            const catLabel = c.categories[p.category as keyof typeof c.categories] ?? p.category
            const name = lang === 'de' ? p.name_de : (p.name_en || p.name_de)
            const desc = lang === 'de' ? p.desc_de : (p.desc_en || p.desc_de)
            return (
              <div
                key={p.id}
                style={{
                  border: '1px solid var(--line-soft)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  background: 'var(--bg-2)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Visual */}
                <div style={{
                  aspectRatio: '4/3',
                  background: 'linear-gradient(135deg,#1F1F24 0%,#2C2C33 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  borderBottom: '1px solid var(--line-soft)',
                  overflow: 'hidden',
                }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-mute)', letterSpacing: '0.08em' }}>
                      {lang === 'de' ? 'Kein Bild' : 'No image'}
                    </span>
                  )}
                  <div style={{
                    position: 'absolute', top: 14, left: 14,
                    background: 'var(--bg)', border: `1px solid ${catColor}44`,
                    padding: '4px 10px', borderRadius: 999,
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: catColor,
                  }}>
                    {catLabel}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    textTransform: 'uppercase',
                    letterSpacing: '0.01em',
                    color: 'var(--fg)',
                    margin: 0,
                    lineHeight: 1.2,
                  }}>
                    {name}
                  </h3>
                  {desc && (
                    <p style={{ color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.55, margin: 0, flex: 1 }}>
                      {desc}
                    </p>
                  )}
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 6,
                      background: 'var(--fg)',
                      color: 'var(--accent-ink)',
                      fontWeight: 600,
                      fontSize: 13,
                      letterSpacing: '0.02em',
                      padding: '11px 18px',
                      borderRadius: 999,
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                      alignSelf: 'flex-start',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#E8FF66')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--fg)')}
                  >
                    {c.cta}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                </div>
              </div>
            )
          })}
        </div>
        )}

        {/* Disclaimer — aktivieren sobald Affiliate-Links eingetragen sind
        <div style={{
          marginTop: 48,
          padding: '20px 24px',
          border: '1px solid var(--line-soft)',
          borderRadius: 12,
          background: 'var(--bg-2)',
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}>
          <span style={{ color: 'var(--fg-mute)', fontSize: 16, flexShrink: 0, marginTop: 1 }}>ℹ</span>
          <p style={{ margin: 0, color: 'var(--fg-mute)', fontSize: 13, lineHeight: 1.6, fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
            {c.disclaimer}
          </p>
        </div>
        */}
      </div>

      <style>{`
        @media (max-width: 900px) { .ausruestung-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .ausruestung-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
