'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Post } from '@/lib/types'
import { createClient } from '@/lib/supabase/admin'
import { card, empty, btnPrimary } from '../shared'

import { useDeepLink, ListItem, plain, DateCol } from '@/components/admin/list'
import { PageHeader, Badge } from '@/components/admin/sections'

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
  useDeepLink('edit', posts, !loading, (t) => setEditing(t))

  async function handleDelete(id: string) {
    if (!confirm('Diesen Post wirklich löschen?')) return
    await createClient().from('posts').delete().eq('id', id)
    setEditing(null)
    load()
  }

  if (editing !== null) {
    return (
      <PostEditor
        post={editing === 'new' ? null : editing}
        onSave={() => { setEditing(null); load() }}
        onCancel={() => setEditing(null)}
        onDelete={editing === 'new' || !editing.id ? undefined : () => handleDelete(editing.id!)}
      />
    )
  }

  return (
    <div>
      <PageHeader section="blog" count={posts.length} action={<button onClick={() => setEditing('new')} style={btnPrimary}>+ Neuer Post</button>} />

      <div style={card}>
        {loading ? (
          <div style={empty}>Laden …</div>
        ) : posts.length === 0 ? (
          <div style={empty}>Noch keine Posts</div>
        ) : posts.map((post) => (
          <ListItem
            key={post.id}
            onOpen={() => setEditing(post)}
            leading={<DateCol date={new Date(post.created_at)} sub={new Date(post.created_at).getFullYear().toString()} />}
            title={post.title.de}
            sub={plain(post.excerpt.de)}
            trailing={post.published ? undefined : <Badge tone="mute">Entwurf</Badge>}
          />
        ))}
      </div>
    </div>
  )
}
