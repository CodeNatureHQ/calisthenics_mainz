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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={pageTitle}>Blogposts</h1>
        <button onClick={() => setEditing('new')} style={primaryBtnStyle}>
          + Neuer Post
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--fg-dim)' }}>Laden …</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'var(--accent)',
                  background: 'var(--accent-soft)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.25rem 0.5rem',
                  flexShrink: 0,
                }}
              >
                {post.glyph ?? '—'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--fg)', fontSize: '0.9375rem' }}>
                  {post.title.de}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--fg-dim)', marginTop: 2 }}>
                  {post.id} · {post.published ? '✓ Veröffentlicht' : '⬜ Entwurf'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setEditing(post)} style={secondaryBtnStyle}>
                  Bearbeiten
                </button>
                <button onClick={() => handleDelete(post.id)} style={dangerBtnStyle}>
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const pageTitle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'var(--fg)',
  margin: 0,
  letterSpacing: '-0.02em',
}

const primaryBtnStyle: React.CSSProperties = {
  background: 'var(--accent)',
  color: '#0a0a0b',
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: '0.5rem 1.25rem',
  borderRadius: 'var(--radius)',
  border: 'none',
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  background: 'var(--bg-elev-2)',
  color: 'var(--fg-muted)',
  fontWeight: 500,
  fontSize: '0.8125rem',
  padding: '0.375rem 0.875rem',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  cursor: 'pointer',
}

const dangerBtnStyle: React.CSSProperties = {
  background: 'rgba(239,68,68,0.08)',
  color: 'var(--danger)',
  fontWeight: 500,
  fontSize: '0.8125rem',
  padding: '0.375rem 0.875rem',
  borderRadius: 'var(--radius)',
  border: '1px solid rgba(239,68,68,0.2)',
  cursor: 'pointer',
}
