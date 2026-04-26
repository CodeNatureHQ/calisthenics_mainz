'use client'

import { useEffect, useState } from 'react'
import type { ContactMessage } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { pageHead, crumbStyle, h1Style, card, listRow, empty, btnGhost, btnDanger, metaItem } from '../shared'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Einsteiger',
  intermediate: 'Fortgeschritten',
  advanced: 'Erfahren',
  unsure: 'Unbekannt',
}

export default function AdminNachrichtenPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    const { data } = await createClient()
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleHandled(msg: ContactMessage) {
    await createClient().from('contact_messages').update({ handled: !msg.handled }).eq('id', msg.id)
    load()
  }

  async function del(id: string) {
    if (!confirm('Nachricht löschen?')) return
    await createClient().from('contact_messages').delete().eq('id', id)
    load()
  }

  const unhandled = messages.filter(m => !m.handled)
  const handled = messages.filter(m => m.handled)

  return (
    <div>
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>07 / Kontakt</span>
          <h1 style={h1Style}>Nachrichten</h1>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: unhandled.length > 0 ? 'var(--ok)' : 'var(--fg-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {unhandled.length} offen · {handled.length} erledigt
        </div>
      </div>

      {loading ? (
        <div style={empty}>Laden …</div>
      ) : messages.length === 0 ? (
        <div style={{ ...card }}><div style={empty}>Noch keine Nachrichten</div></div>
      ) : (
        <>
          {unhandled.length > 0 && (
            <div style={{ ...card, marginBottom: 20 }}>
              {unhandled.map((msg) => <MessageRow key={msg.id} msg={msg} expanded={expanded} setExpanded={setExpanded} onToggle={toggleHandled} onDelete={del} />)}
            </div>
          )}
          {handled.length > 0 && (
            <div style={{ ...card, opacity: 0.6 }}>
              {handled.map((msg) => <MessageRow key={msg.id} msg={msg} expanded={expanded} setExpanded={setExpanded} onToggle={toggleHandled} onDelete={del} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MessageRow({ msg, expanded, setExpanded, onToggle, onDelete }: {
  msg: ContactMessage
  expanded: string | null
  setExpanded: (id: string | null) => void
  onToggle: (msg: ContactMessage) => void
  onDelete: (id: string) => void
}) {
  const isOpen = expanded === msg.id
  const date = new Date(msg.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ borderBottom: '1px solid var(--line-soft)' }}>
      <div
        style={{ ...listRow, cursor: 'pointer', borderBottom: 'none' }}
        onClick={() => setExpanded(isOpen ? null : msg.id)}
        className="admin-list-row"
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            {!msg.handled && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)', display: 'inline-block', flexShrink: 0 }} />}
            <span style={{ fontWeight: 600, color: 'var(--fg)', fontSize: 14 }}>{msg.name}</span>
            <span style={{ color: 'var(--fg-dim)', fontSize: 13 }}>{msg.email}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={metaItem}>{LEVEL_LABELS[msg.level] ?? msg.level}</span>
            <span style={metaItem}>{date}</span>
            <span style={{ ...metaItem, color: 'var(--fg-dim)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }} className="admin-list-row-actions">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(msg) }}
            style={{ ...btnGhost, color: msg.handled ? 'var(--fg-mute)' : 'var(--ok)', borderColor: msg.handled ? 'var(--line)' : 'rgba(142,232,142,0.3)' }}
          >
            {msg.handled ? '○ Offen' : '● Erledigt'}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(msg.id) }} style={btnDanger}>Löschen</button>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: '0 20px 20px', background: 'var(--bg-3)', borderTop: '1px solid var(--line-soft)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingTop: 16 }}>Nachricht</div>
          <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{msg.message}</p>
          <a
            href={`mailto:${msg.email}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-spark)', letterSpacing: '0.06em', textDecoration: 'none' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
            {msg.email} anschreiben
          </a>
        </div>
      )}
    </div>
  )
}
