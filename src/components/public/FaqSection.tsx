'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Lang, FaqItem } from '@/lib/types'
import SectionHeading from './SectionHeading'

export default function FaqSection({ lang, items }: { lang: Lang; items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const de = lang === 'de'
  return (
    <section id="faq" className="section">
      <div className="container faq-layout">
        <SectionHeading eyebrow={de ? 'Gut zu wissen' : 'Good to know'} title={de ? 'Noch Fragen?' : 'Any questions?'} description={de ? 'Die wichtigsten Antworten vor deinem ersten Training.' : 'What you need to know before your first session.'} />
        <div className="faq-list">
          {items.filter(item => item.visible).map(item => {
            const isOpen = open === item.id
            const question = de ? item.question_de : item.question_en || item.question_de
            const answer = de ? item.answer_de : item.answer_en || item.answer_de
            return (
              <div key={item.id} className="faq-item" data-open={isOpen}>
                <button aria-expanded={isOpen} aria-controls={`answer-${item.id}`} onClick={() => setOpen(isOpen ? null : item.id)}>
                  <span className="faq-question">{question}</span>
                  <Plus size={22} />
                </button>
                <div id={`answer-${item.id}`} hidden={!isOpen} className="prose-cm faq-answer" dangerouslySetInnerHTML={{ __html: answer }} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
