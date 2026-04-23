'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Lang, Spot } from '@/lib/types'
import { t } from '@/lib/utils'

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

type Props = { lang: Lang; spots: Spot[] }

const copy = {
  de: {
    label: '03',
    title: 'Spots',
    sub: 'Calisthenics überall in Mainz und Umgebung.',
    mapMeta: 'Interaktive Karte',
    mapFooter: '3 Spots · Mainz & Mainz-Kastel',
    emptyPanel: 'Wähle links einen Spot, um Details zu sehen.',
    adresse: 'Adresse',
    zugang: 'Zugang',
    equipment: 'Equipment',
    mapsLink: 'Google Maps öffnen',
  },
  en: {
    label: '03',
    title: 'Spots',
    sub: 'Calisthenics all over Mainz and surroundings.',
    mapMeta: 'Interactive map',
    mapFooter: '3 spots · Mainz & Mainz-Kastel',
    emptyPanel: 'Select a spot on the map to see details.',
    adresse: 'Address',
    zugang: 'Access',
    equipment: 'Equipment',
    mapsLink: 'Open Google Maps',
  },
}

export default function SpotsSection({ lang, spots }: Props) {
  const c = copy[lang]
  const visibleSpots = spots.filter(s => s.visible)
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null)

  return (
    <section id="spots" className="section">
      <div className="container">
        <SectionHead label={c.label} title={c.title} sub={c.sub} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 24,
            alignItems: 'stretch',
          }}
          className="spots-layout"
        >
          {/* Map card */}
          <div
            style={{
              border: '1px solid var(--line-soft)',
              borderRadius: 18,
              background: 'var(--bg-2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 480,
            }}
          >
            {/* Map header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 20px',
                borderBottom: '1px solid var(--line-soft)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--accent-spark)',
                  boxShadow: '0 0 10px rgba(216,255,61,.55)',
                  flexShrink: 0,
                }}
              />
              {c.mapMeta}
            </div>

            {/* Map */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <LeafletMap
                spots={visibleSpots}
                activeSpot={activeSpot}
                onSpotClick={setActiveSpot}
                lang={lang}
              />
            </div>

            {/* Map footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--line-soft)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--fg-mute)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {c.mapFooter}
            </div>
          </div>

          {/* Spot panel */}
          <div
            style={{
              border: '1px solid var(--line-soft)',
              borderRadius: 18,
              background: 'var(--bg-2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 480,
            }}
          >
            {activeSpot ? (
              <SpotDetail spot={activeSpot} lang={lang} c={c} />
            ) : (
              <div
                style={{
                  margin: 'auto',
                  padding: 40,
                  textAlign: 'center',
                  color: 'var(--fg-mute)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  maxWidth: 260,
                  lineHeight: 1.6,
                }}
              >
                {c.emptyPanel}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .spots-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

function SpotDetail({ spot, lang, c }: { spot: Spot; lang: Lang; c: (typeof copy)['de'] }) {
  return (
    <>
      {/* Hero image / placeholder */}
      <div
        style={{
          aspectRatio: '16/10',
          position: 'relative',
          overflow: 'hidden',
          background: '#0E0E11',
          borderBottom: '1px solid var(--line-soft)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg,#1F1F24 0%,#2C2C33 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 72,
              color: 'var(--bg)',
              WebkitTextStroke: '1.5px var(--line)',
              letterSpacing: '-0.04em',
              userSelect: 'none',
            }}
          >
            {spot.glyph}
          </div>
        </div>

        {/* Tag */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            padding: '4px 10px',
            borderRadius: 999,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--fg)',
          }}
        >
          {spot.glyph}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
            lineHeight: 1.1,
            color: 'var(--fg)',
            margin: 0,
          }}
        >
          {t(spot.name, lang)}
        </h3>
        <p style={{ color: 'var(--fg-dim)', fontSize: 14, margin: 0 }}>
          {t(spot.subtitle, lang)}
        </p>

        {/* Info grid */}
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr',
            gap: '10px 16px',
            marginTop: 6,
            fontSize: 13,
          }}
        >
          <dt style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingTop: 3 }}>{c.adresse}</dt>
          <dd style={{ margin: 0, color: 'var(--fg-dim)', lineHeight: 1.5 }}><strong style={{ color: 'var(--fg)', fontWeight: 500 }}>{spot.address}</strong></dd>

          <dt style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingTop: 3 }}>{c.zugang}</dt>
          <dd style={{ margin: 0, color: 'var(--fg-dim)', lineHeight: 1.5 }}>{t(spot.access, lang)}</dd>

          <dt style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingTop: 3 }}>{c.equipment}</dt>
          <dd style={{ margin: 0 }}>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: 0, padding: 0 }}>
              {spot.gear.map((g) => (
                <li
                  key={g}
                  style={{
                    listStyle: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 9px',
                    border: '1px solid var(--line)',
                    borderRadius: 999,
                    color: 'var(--fg-dim)',
                  }}
                >
                  {g}
                </li>
              ))}
            </ul>
          </dd>
        </dl>

        {/* Maps CTA */}
        {spot.maps_url && (
          <a
            href={spot.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--fg)',
              paddingTop: 12,
              borderTop: '1px solid var(--line-soft)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-spark)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg)')}
          >
            {c.mapsLink}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        )}
      </div>
    </>
  )
}

function SectionHead({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 64, paddingBottom: 20, borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-mute)', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5.5vw, 72px)', lineHeight: 0.95, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--fg)', margin: 0 }}>{title}</h2>
      </div>
      {sub && <p style={{ color: 'var(--fg-dim)', maxWidth: 460, fontSize: 16, lineHeight: 1.55, margin: 0 }}>{sub}</p>}
    </div>
  )
}
