'use client'

import { useEffect, useState } from 'react'
import type { FaqItem } from '@/lib/types'
import { createClient } from '@/lib/supabase/admin'
import { card, empty, btnPrimary } from '../shared'
import { FormShell, FormSection, LangColumns, Toggle } from '@/components/admin/Form'
import LangPair from '@/components/admin/LangPair'
import { useDeepLink, moveItem, nextSortOrder, MoveButtons, ListItem, plain, Switch } from '@/components/admin/list'
import { PageHeader, Badge } from '@/components/admin/sections'
import dynamic from 'next/dynamic'
const RichText = dynamic(() => import('@/components/admin/RichText'), { ssr: false })

type FormState = { question_de: string; question_en: string; answer_de: string; answer_en: string; visible: boolean }
const emptyForm = (): FormState => ({ question_de: '', question_en: '', answer_de: '', answer_en: '', visible: true })

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [editing, setEditing] = useState<FaqItem | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)

  async function load() {
    const { data } = await createClient().from('faq_items').select('*').order('sort_order')
    setItems(data ?? [])
    setReady(true)
  }
  useEffect(() => { load() }, [])

  function startNew() { setForm(emptyForm()); setEditing('new') }
  function startEdit(item: FaqItem) {
    setForm({ question_de: item.question_de, question_en: item.question_en, answer_de: item.answer_de, answer_en: item.answer_en, visible: item.visible })
    setEditing(item)
  }
  useDeepLink('edit', items, ready, (t) => (t === 'new' ? startNew() : startEdit(t)))
  async function move(index: number, dir: -1 | 1) { setItems(await moveItem('faq_items', items, index, dir)) }
  const f = (key: keyof FormState, value: string) => setForm(p => ({ ...p, [key]: value }))

  async function save() {
    if (!form.question_de.trim()) return
    setSaving(true)
    const data = { question_de: form.question_de, question_en: form.question_en, answer_de: form.answer_de, answer_en: form.answer_en, visible: form.visible }
    const supabase = createClient()
    if (editing === 'new') await supabase.from('faq_items').insert({ ...data, sort_order: nextSortOrder(items) })
    else await supabase.from('faq_items').update(data).eq('id', (editing as FaqItem).id)
    setSaving(false); setEditing(null); load()
  }

  async function del(id: string) {
    if (!confirm('Diese Frage löschen?')) return false
    await createClient().from('faq_items').delete().eq('id', id)
    load()
    return true
  }

  async function toggleVisible(item: FaqItem) {
    await createClient().from('faq_items').update({ visible: !item.visible }).eq('id', item.id)
    load()
  }

  async function removeEditing() {
    if (editing && editing !== 'new' && (await del(editing.id))) setEditing(null)
  }

  return (
    <div>
      {!editing && <PageHeader section="faq" count={items.length} action={<button onClick={startNew} style={btnPrimary}>+ Frage hinzufügen</button>} />}

      {editing !== null && (
        <FormShell section="faq" title={editing === 'new' ? 'Neue Frage' : 'Frage bearbeiten'} onCancel={() => setEditing(null)} onSave={save} saving={saving} disabled={!form.question_de.trim()} onDelete={editing === 'new' ? undefined : removeEditing}>
          <FormSection title="Frage" description="Kurz und so formuliert, wie jemand sie wirklich stellen würde.">
            <LangPair label="Frage" deValue={form.question_de} enValue={form.question_en} onDe={(v) => f('question_de', v)} onEn={(v) => f('question_en', v)} placeholder={{ de: 'Kann ich als Anfänger:in kommen?', en: 'Can I come as a beginner?' }} />
          </FormSection>
          <FormSection title="Antwort" description="Darf gern zwei, drei Sätze lang sein. Links sind möglich.">
            <LangColumns label="Antwort" de={<RichText value={form.answer_de} onChange={(v) => f('answer_de', v)} placeholder="Antwort auf Deutsch …" minHeight={140} />} en={<RichText value={form.answer_en} onChange={(v) => f('answer_en', v)} placeholder="Answer in English …" minHeight={140} />} enValue={form.answer_en} />
          </FormSection>
          <FormSection title="Anzeige" description="Die Reihenfolge änderst du mit den Pfeilen in der Liste.">
            <Toggle checked={form.visible} onChange={(v) => setForm(p => ({ ...p, visible: v }))} label={form.visible ? 'Auf der Webseite sichtbar' : 'Versteckt'} />
          </FormSection>
        </FormShell>
      )}

      {!editing && <div style={card}>
        {items.length === 0 ? <div style={empty}>Noch keine FAQ-Einträge</div> : items.map((item, i) => (
          <ListItem
            key={item.id}
            onOpen={() => startEdit(item)}
            dim={!item.visible}
            title={item.question_de}
            sub={plain(item.answer_de)}
            trailing={<>
              {!item.visible && <Badge tone="mute">Versteckt</Badge>}
              <Switch checked={item.visible} onChange={() => toggleVisible(item)} label={item.visible ? 'Auf der Seite sichtbar: ausblenden' : 'Versteckt: einblenden'} />
              <MoveButtons index={i} count={items.length} onMove={(d) => move(i, d)} />
            </>}
          />
        ))}
      </div>}
    </div>
  )
}
