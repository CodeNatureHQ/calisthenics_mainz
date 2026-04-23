'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Post } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const PostEditor = dynamic(() => import('@/components/admin/PostEditor'), { ssr: false })

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [editing, setEditing] = useState<Partial<Post> | null | 'new'>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('posts').select('*').order('sort_order')
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Post wirklich löschen?')) return
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', id)
    load()
  }

  if (editing !== null) {
    return (
      <PostEditor
        post={editing === 'new' ? null : editing}
        onSave={() => { setEditing(null); load() }}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div>
      {/* Page head */}
      <div style={pageHead}>
        <div>
          <span style={crumbStyle}>01 / Content</span>
          <h1 style={h1Style}>Blogposts</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={() => setEditing('new')} style={btnPrimary}>
            + Neuer Post
          </button>
        </div>
      </div>

      {/* Card */}
      <div style={card}>
        {loading ? (
          <div style={empty}>Laden …</div>
        ) : posts.length === 0 ? (
          <div style={empty}>Noch keine Posts</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={listRow}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--fg)',
                    flexShrink: 0,
                  }}>
                    {post.glyph ?? '—'}
                  </div>
                  <span style={{ fontWeight: 500, color: 'var(--fg)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title.de}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span style={metaItem}>{post.id}</span>
                  <span style={metaItem}>{post.category.de}</span>
                  <span style={metaItem}>{post.date_label.de}</span>
                  <span style={{
                    ...metaItem,
                    color: post.published ? 'var(--ok)' : 'var(--fg-mute)',
                  }}>
                    {post.published ? 'Veröffentlicht' : 'Entwurf'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditing(post)} style={btnGhost}>Bearbeiten</button>
                <button onClick={() => handleDelete(post.id)} style={btnDanger}>Löschen</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const pageHead: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
  gap: 24, flexWrap: 'wrap', marginBottom: 32, paddingBottom: 24,
  borderBottom: '1px solid var(--line-soft)',
}
const crumbStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
  textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-mute)', marginBottom: 8,
}
const h1Style: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase',
  letterSpacing: '-0.01em', margin: 0, color: 'var(--fg)',
}
const card: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
  borderRadius: 14, overflow: 'hidden',
}
const listRow: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr auto',
  gap: 16, padding: '16px 20px',
  borderBottom: '1px solid var(--line-soft)',
  alignItems: 'center',
}
const metaItem: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--fg-mute)',
}
const empty: React.CSSProperties = {
  padding: '60px 24px', textAlign: 'center',
  color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12,
  textTransform: 'uppercase', letterSpacing: '0.08em',
}
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '10px 16px', borderRadius: 8,
  fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
  background: 'var(--fg)', color: 'var(--accent-ink)',
  border: '1px solid var(--fg)', cursor: 'pointer',
  transition: 'background 0.15s, transform 0.1s',
}
const btnGhost: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 6,
  fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
  background: 'var(--bg-2)', color: 'var(--fg)',
  border: '1px solid var(--line)', cursor: 'pointer',
  transition: 'border-color 0.15s, transform 0.1s',
}
const btnDanger: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 6,
  fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
  background: 'transparent', color: 'var(--danger)',
  border: '1px solid var(--line)', cursor: 'pointer',
  transition: 'border-color 0.15s, background 0.15s',
}
