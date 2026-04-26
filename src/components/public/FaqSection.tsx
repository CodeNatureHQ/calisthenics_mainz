'use client'

import { useState } from 'react'
import type { Lang, FaqItem } from '@/lib/types'

type Props = { lang: Lang; items: FaqItem[] }

const copy = {
  de: { label: '06', title: 'FAQ' },
  en: { label: '06', title: 'FAQ' },
}

export default function FaqSection({ lang, items }: Props) {
  const c = copy[lang]
  const [open, setOpen] = useState<string | null>(null)
  const visible = items.filter(i => i.visible)

  return (
    <section id="faq" className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 64, paddingBottom: 20, borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 20, height: 3, background: 'var(--accent-2)', borderRadius: 2, flexShrink: 0 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-2)', letterSpacing: '0.08em' }}>{c.label}</div>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5.5vw, 72px)', lineHeight: 0.95, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--fg)', margin: 0 }}>{c.title}</h2>
          </div>
        </div>

        <div>
          {visible.length === 0 ? (
            <p style={{ color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              {lang === 'de' ? 'Keine Fragen vorhanden.' : 'No questions yet.'}
            </p>
          ) : visible.map((item) => {
            const isOpen = open === item.id
            const q = lang === 'de' ? item.question_de : (item.question_en || item.question_de)
            const a = lang === 'de' ? item.answer_de : (item.answer_en || item.answer_de)
            return (
              <div key={item.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <button
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--fg)' }}
                >
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 2vw, 20px)', textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.2 }}>
                    {q}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--fg-mute)', flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}>
                    +
                  </span>
                </button>
                <div style={{ maxHeight: isOpen ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                  <div
                    className="prose-cm"
                    dangerouslySetInnerHTML={{ __html: a }}
                    style={{ fontSize: 16, lineHeight: 1.65, margin: '0 0 24px', paddingRight: 32 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
