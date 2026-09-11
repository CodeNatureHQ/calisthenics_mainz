import SectionHeading from './SectionHeading'
import type { Lang, Post } from '@/lib/types'
import { t } from '@/lib/utils'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function BlogGrid({ lang, posts }: { lang: Lang; posts: Post[] }) {
  const de = lang === 'de'
  return <section id="blog" className={`section club-journal${posts.length ? '' : ' journal-empty'}`}><div className="container">
    {posts.length ? <><SectionHeading eyebrow={de ? 'Training & Vereinsleben' : 'Training & club life'} title={de ? 'Vom Training erzählt.' : 'Stories from training.'} /><div className="journal-grid">{posts.map(post => <article key={post.id}><p className="eyebrow">{t(post.category, lang)}</p><h3><Link href={`/${lang}/blog/${post.id}`}>{t(post.title, lang)}</Link></h3><p>{t(post.excerpt, lang)}</p><div className="journal-meta"><span>{t(post.date_label, lang)} · {t(post.read_time, lang)}</span><Link href={`/${lang}/blog/${post.id}`} aria-label={t(post.title, lang)}><ArrowUpRight size={22} /></Link></div></article>)}</div></> : <div className="journal-follow"><div><p className="eyebrow">{de ? 'Zwischen den Sessions' : 'Between sessions'}</p><h2>{de ? 'Mehr Vereinsleben auf Instagram.' : 'More club life on Instagram.'}</h2></div><a className="club-text-link" href="https://www.instagram.com/calisthenicsmainz/" target="_blank" rel="noopener noreferrer">@calisthenicsmainz<ArrowUpRight size={20} /></a></div>}
  </div></section>
}
