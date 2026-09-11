'use client'

import { useEffect, useState } from 'react'
import type { FaqItem } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { pageHead, crumbStyle, h1Style, card, listRow, empty, inp, btnPrimary, btnGhost, btnDanger } from '../shared'
import { FormShell, FormSection, Field, Grid, LangColumns, Toggle } from '@/components/admin/Form'
import LangPair from '@/components/admin/LangPair'
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
        <FormShell title={editing === 'new' ? 'Neue Frage' : 'Frage bearbeiten'} onCancel={() => setEditing(null)} onSave={save} saving={saving} disabled={!form.question_de.trim()}>
          <FormSection title="Frage" description="Kurz und so formuliert, wie jemand sie wirklich stellen würde.">
            <LangPair label="Frage" deValue={form.question_de} enValue={form.question_en} onDe={(v) => f('question_de', v)} onEn={(v) => f('question_en', v)} placeholder={{ de: 'Kann ich als Anfänger:in kommen?', en: 'Can I come as a beginner?' }} />
          </FormSection>
          <FormSection title="Antwort" description="Darf gern zwei, drei Sätze lang sein. Links sind möglich.">
            <LangColumns label="Antwort" de={<RichText value={form.answer_de} onChange={(v) => f('answer_de', v)} placeholder="Antwort auf Deutsch …" minHeight={140} />} en={<RichText value={form.answer_en} onChange={(v) => f('answer_en', v)} placeholder="Answer in English …" minHeight={140} />} />
          </FormSection>
          <FormSection title="Anzeige">
            <Grid>
              <Field label="Reihenfolge" hint="Kleinere Zahl steht weiter oben.">
                <input type="number" value={form.sort_order} onChange={(e) => f('sort_order', e.target.value)} style={inp} />
              </Field>
            </Grid>
            <Toggle checked={form.visible} onChange={(v) => setForm(p => ({ ...p, visible: v }))} label={form.visible ? 'Auf der Webseite sichtbar' : 'Versteckt'} />
          </FormSection>
        </FormShell>
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
              <button onClick={() => toggleVisible(item)} style={{ ...btnGhost, color: item.visible ? 'var(--ok)' : 'var(--fg-mute)', borderColor: item.visible ? 'color-mix(in srgb, var(--ok) 35%, transparent)' : 'var(--line)' }}>
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

