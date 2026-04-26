'use client'

import { useEffect, useState } from 'react'
import type { FaqItem } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { pageHead, crumbStyle, h1Style, card, formCard, listRow, empty, inp, fieldLabel, btnPrimary, btnGhost, btnDanger } from '../shared'
import dynamic from 'next/dynamic'
const RichText = dynamic(() => import('@/components/admin/RichText'), { ssr: false })

type FormState = { question_de: string; question_en: string; answer_de: string; answer_en: string; sort_order: string; visible: boolean }
const emptyForm = (): FormState => ({ question_de: '', question_en: '', answer_de: '', answer_en: '', sort_order: '0', visible: true })

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [editing, setEditing] = useState<FaqItem | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await createClient().from('faq_items').select('*').order('sort_order')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [])

  function startNew() { setForm(emptyForm()); setEditing('new') }
  function startEdit(item: FaqItem) {
    setForm({ question_de: item.question_de, question_en: item.question_en, answer_de: item.answer_de, answer_en: item.answer_en, sort_order: String(item.sort_order), visible: item.visible })
    setEditing(item)
  }
  const f = (key: keyof FormState, value: string) => setForm(p => ({ ...p, [key]: value }))

  async function save() {
    if (!form.question_de.trim()) return
    setSaving(true)
    const data = { question_de: form.question_de, question_en: form.question_en, answer_de: form.answer_de, answer_en: form.answer_en, sort_order: parseInt(form.sort_order) || 0, visible: form.visible }
    const supabase = createClient()
    if (editing === 'new') await supabase.from('faq_items').insert(data)
    else await supabase.from('faq_items').update(data).eq('id', (editing as FaqItem).id)
    setSaving(false); setEditing(null); load()
  }

  async function del(id: string) {
    if (!confirm('Löschen?')) return
    await createClient().from('faq_items').delete().eq('id', id)
    load()
  }

  async function toggleVisible(item: FaqItem) {
    await createClient().from('faq_items').update({ visible: !item.visible }).eq('id', item.id)
    load()
  }

  return (
    <div>
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>08 / Content</span>
          <h1 style={h1Style}>FAQ</h1>
        </div>
        {!editing && <button onClick={startNew} style={btnPrimary}>+ Frage hinzufügen</button>}
      </div>

      {editing !== null && (
        <div style={{ ...formCard, marginBottom: 16 }}>
          <h2 style={formTitle}>{editing === 'new' ? 'Neue Frage' : 'Frage bearbeiten'}</h2>

          {/* Fragen */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Frage</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-lang-pair">
              {[{ val: form.question_de, key: 'question_de' as const, tag: 'DE' }, { val: form.question_en, key: 'question_en' as const, tag: 'EN' }].map(({ val, key, tag }) => (
                <div key={tag} style={{ position: 'relative' }}>
                  <input value={val} onChange={e => f(key, e.target.value)} style={{ ...inp, paddingRight: 44 }} placeholder={tag === 'DE' ? 'Frage auf Deutsch …' : 'Question in English …'} />
                  <span style={badge}>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Antworten */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Antwort</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-lang-pair">
              {[{ val: form.answer_de, key: 'answer_de' as const, tag: 'DE', ph: 'Antwort auf Deutsch …' }, { val: form.answer_en, key: 'answer_en' as const, tag: 'EN', ph: 'Answer in English …' }].map(({ val, key, tag, ph }) => (
                <div key={tag} style={{ position: 'relative' }}>
                  <div style={{ ...badge, top: 8, zIndex: 10 }}>{tag}</div>
                  <RichText value={val} onChange={v => f(key, v)} placeholder={ph} minHeight={100} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
            <button onClick={() => setEditing(null)} style={btnGhost}>Abbrechen</button>
            <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? '…' : 'Speichern'}</button>
          </div>
        </div>
      )}

      {!editing && <div style={card}>
        {items.length === 0 ? <div style={empty}>Noch keine FAQ-Einträge</div> : items.map((item) => (
          <div key={item.id} style={{ ...listRow, opacity: item.visible ? 1 : 0.5 }} className="admin-list-row">
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, color: 'var(--fg)', fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.question_de}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}
                dangerouslySetInnerHTML={{ __html: item.answer_de.replace(/<[^>]+>/g, ' ').slice(0, 80) + '…' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }} className="admin-list-row-actions">
              <button onClick={() => toggleVisible(item)} style={{ ...btnGhost, color: item.visible ? 'var(--ok)' : 'var(--fg-mute)', borderColor: item.visible ? 'rgba(142,232,142,0.3)' : 'var(--line)' }}>
                {item.visible ? '● Sichtbar' : '○ Versteckt'}
              </button>
              <button onClick={() => startEdit(item)} style={btnGhost}>Bearbeiten</button>
              <button onClick={() => del(item.id)} style={btnDanger}>Löschen</button>
            </div>
          </div>
        ))}
      </div>}
    </div>
  )
}

const formTitle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg)', margin: '0 0 16px', fontWeight: 600 }
const badge: React.CSSProperties = { position: 'absolute', top: 8, right: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--fg-mute)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 999, border: '1px solid var(--line-soft)', pointerEvents: 'none' }
