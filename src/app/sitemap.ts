import type { MetadataRoute } from 'next'
import { createStaticClient as createClient } from '@/lib/supabase/static'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calisthenics-mainz.de'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { id: string; updated_at: string }[] | null = null
  try {
    const supabase = createClient()
    const { data } = await supabase.from('posts').select('id, updated_at').eq('published', true)
    posts = data
  } catch {
    posts = null
  }

  const staticPages = ['de', 'en'].flatMap((lang) => [
    {
      url: `${BASE}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
  ])

  const blogPages =
    posts?.flatMap((post) =>
      ['de', 'en'].map((lang) => ({
        url: `${BASE}/${lang}/blog/${post.id}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    ) ?? []

  return [...staticPages, ...blogPages]
}
