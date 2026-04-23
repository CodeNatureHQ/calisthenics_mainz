import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Lang } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { t } from '@/lib/utils'

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const supabase = createStaticClient()
    const { data: posts } = await supabase.from('posts').select('id').eq('published', true)
    if (!posts) return []
    return posts.flatMap((p) => [
      { lang: 'de', slug: p.id },
      { lang: 'en', slug: p.id },
    ])
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params
  const lang = (rawLang === 'en' ? 'en' : 'de') as Lang
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt, date_label')
    .eq('id', slug)
    .single()

  if (!post) return {}

  const title = t(post.title, lang)
  const description = t(post.excerpt, lang)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: t(post.date_label, lang),
    },
    alternates: {
      canonical: `/${lang}/blog/${slug}`,
      languages: {
        de: `/de/blog/${slug}`,
        en: `/en/blog/${slug}`,
      },
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: rawLang, slug } = await params
  const lang = (rawLang === 'en' ? 'en' : 'de') as Lang
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t(post.title, lang),
    description: t(post.excerpt, lang),
    author: { '@type': 'Organization', name: 'Calisthenics Mainz' },
    publisher: { '@type': 'Organization', name: 'Calisthenics Mainz' },
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calisthenics-mainz.de'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10,10,11,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="container"
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Link
            href={`/${lang}`}
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '1.125rem',
              color: 'var(--accent)',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            CM
          </Link>
          <span style={{ color: 'var(--border)', fontSize: '1rem' }}>/</span>
          <Link
            href={`/${lang}#blog`}
            style={{ color: 'var(--fg-muted)', fontSize: '0.875rem', textDecoration: 'none' }}
          >
            Blog
          </Link>
          <span style={{ color: 'var(--border)', fontSize: '1rem' }}>/</span>
          <span
            style={{
              color: 'var(--fg-dim)',
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {t(post.title, lang)}
          </span>

          <div style={{ marginLeft: 'auto' }}>
            <Link
              href={`/${lang === 'de' ? 'en' : 'de'}/blog/${slug}`}
              style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--fg-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                padding: '0.25rem 0.625rem',
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}
            >
              {lang === 'de' ? 'EN' : 'DE'}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <article style={{ padding: '4rem 0 6rem' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            {/* Category + meta */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--accent-soft)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {t(post.category, lang)}
              </span>
              <span style={{ color: 'var(--fg-dim)', fontSize: '0.75rem' }}>·</span>
              <span style={{ color: 'var(--fg-dim)', fontSize: '0.8125rem' }}>
                {t(post.date_label, lang)}
              </span>
              <span style={{ color: 'var(--fg-dim)', fontSize: '0.75rem' }}>·</span>
              <span style={{ color: 'var(--fg-dim)', fontSize: '0.8125rem' }}>
                {t(post.read_time, lang)}
              </span>
            </div>

            {/* Glyph */}
            {post.glyph && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '2rem',
                  color: 'var(--accent)',
                  background: 'var(--accent-soft)',
                  borderRadius: 'var(--radius-lg)',
                  width: 72,
                  height: 72,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                {post.glyph}
              </div>
            )}

            {/* Title */}
            <h1
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--fg)',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
              }}
            >
              {t(post.title, lang)}
            </h1>

            {/* Excerpt */}
            <p
              style={{
                fontSize: '1.125rem',
                color: 'var(--fg-muted)',
                lineHeight: 1.7,
                borderLeft: '3px solid var(--accent)',
                paddingLeft: '1.25rem',
                marginBottom: '2.5rem',
              }}
            >
              {t(post.excerpt, lang)}
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '2.5rem' }} />

            {/* Body */}
            <div
              className="prose-cm"
              dangerouslySetInnerHTML={{ __html: t(post.body_html, lang) }}
            />

            {/* Hreflang */}
            <link rel="alternate" hrefLang="de" href={`${siteUrl}/de/blog/${slug}`} />
            <link rel="alternate" hrefLang="en" href={`${siteUrl}/en/blog/${slug}`} />

            {/* Back link */}
            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <Link
                href={`/${lang}#blog`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--fg-muted)',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'color 0.15s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                {lang === 'de' ? 'Zurück zum Blog' : 'Back to blog'}
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  )
}
