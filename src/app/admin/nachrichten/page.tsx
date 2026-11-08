'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Mail } from 'lucide-react'
import type { ContactMessage } from '@/lib/types'
import { createClient } from '@/lib/supabase/admin'
import { useDeepLink, DateCol } from '@/components/admin/list'
import { PageHeader } from '@/components/admin/sections'
import { card, empty, btnPrimary, btnGhost } from '../shared'

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
  useDeepLink('open', messages, !loading, (m) => { if (m !== 'new') setExpanded(m.id) })

  async function toggleHandled(msg: ContactMessage) {
    await createClient().from('contact_messages').update({ handled: !msg.handled }).eq('id', msg.id)
    if (!msg.handled) setExpanded(null)
    load()
  }

  async function del(id: string) {
    if (!confirm('Diese Nachricht löschen?')) return
    await createClient().from('contact_messages').delete().eq('id', id)
    setExpanded(null)
    load()
  }

  const unhandled = messages.filter(m => !m.handled)
  const handled = messages.filter(m => m.handled)
  const row = (msg: ContactMessage) => <MessageRow key={msg.id} msg={msg} open={expanded === msg.id} onToggleOpen={() => setExpanded(expanded === msg.id ? null : msg.id)} onToggleHandled={toggleHandled} onDelete={del} />

  return (
    <div>
      <PageHeader section="nachrichten" />

      {loading ? (
        <div style={card}><div style={empty}>Laden …</div></div>
      ) : (
        <>
          <h2 className="admin-group-title"><span>Offen<small>{unhandled.length}</small></span></h2>
          <div style={{ ...card, marginBottom: 44 }}>
            {unhandled.length === 0 ? <div style={empty}>Alles beantwortet</div> : unhandled.map(row)}
          </div>
          {handled.length > 0 && <>
            <h2 className="admin-group-title"><span>Erledigt<small>{handled.length}</small></span></h2>
            <div style={card}>{handled.map(row)}</div>
          </>}
        </>
      )}
    </div>
  )
}

function MessageRow({ msg, open, onToggleOpen, onToggleHandled, onDelete }: {
  msg: ContactMessage
  open: boolean
  onToggleOpen: () => void
  onToggleHandled: (msg: ContactMessage) => void
  onDelete: (id: string) => void
}) {
  const date = new Date(msg.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ borderBottom: '1px solid var(--line-soft)', background: open ? 'var(--bg-3)' : undefined }}>
      <div className="admin-item" data-dim={msg.handled ? 'true' : undefined} role="button" tabIndex={0} aria-expanded={open} onClick={onToggleOpen} onKeyDown={(e) => { if (e.key === 'Enter') onToggleOpen() }} style={{ borderBottom: 0 }}>
        <DateCol date={new Date(msg.created_at)} />
        <div className="admin-item-main" style={{ flex: 1, minWidth: 0 }}>
          <div className="admin-item-title">{msg.name}</div>
          <div className="admin-item-sub">{LEVEL_LABELS[msg.level] ?? msg.level} · {msg.message}</div>
        </div>
        <ChevronDown size={18} className="admin-item-chevron" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
      </div>

      {open && (
        <div style={{ padding: '4px 20px 20px 96px' }} className="admin-msg-body">
          <p style={{ margin: '0 0 8px', color: 'var(--fg-mute)', fontSize: 13 }}>{date} · {msg.email}</p>
          <p style={{ margin: '0 0 16px', color: 'var(--fg)', fontSize: 15, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{msg.message}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={`mailto:${msg.email}`} style={{ ...btnPrimary, textDecoration: 'none' }}><Mail size={15} /> Antworten</a>
            <button type="button" onClick={() => onToggleHandled(msg)} style={btnGhost}>{msg.handled ? 'Wieder als offen markieren' : 'Als erledigt markieren'}</button>
            <button type="button" onClick={() => onDelete(msg.id)} className="admin-text-danger" style={{ marginLeft: 'auto' }}>Löschen</button>
          </div>
        </div>
      )}
      <style>{`@media (max-width: 640px) { .admin-msg-body { padding-left: 20px !important; } }`}</style>
    </div>
  )
}
