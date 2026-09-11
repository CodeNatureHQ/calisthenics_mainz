import { ArrowUpRight } from 'lucide-react'
import type { Lang, Product } from '@/lib/types'

const categories: Record<string, { de: string; en: string }> = {
  ringe: { de: 'Ringe', en: 'Rings' }, stangen: { de: 'Stangen', en: 'Bars' },
  parallettes: { de: 'Parallettes', en: 'Parallettes' }, zubehoer: { de: 'Zubehör', en: 'Accessories' },
}
export default function AusruestungPage({ lang, products }: { lang: Lang; products: Product[] }) {
  const de = lang === 'de'
  return <main className="club-equipment-page"><section className="container"><p className="eyebrow">{de ? 'Mit an die Stange' : 'Bring it to the bars'}</p><div className="equipment-heading"><h1>{de ? "Equipment fürs Training." : "Gear for training."}</h1><p>{de ? 'Ringe, Parallettes und Trainingszubehör: Hier teilen wir die Ausrüstung, die wir selbst verwenden.' : 'Rings, parallettes and accessories: here is the equipment we use in our own training.'}</p></div>
  {products.length ? <div className="equipment-grid">{products.map(product => {
    const name = de ? product.name_de : product.name_en || product.name_de
    const description = de ? product.desc_de : product.desc_en || product.desc_de
    return <article key={product.id}><div className="equipment-image">{product.image_url ? <img src={product.image_url} alt={name} loading="lazy" /> : <span>{categories[product.category]?.[lang] ?? product.category}</span>}</div><p className="eyebrow">{categories[product.category]?.[lang] ?? product.category}</p><h2>{name}</h2>{description && <p>{description}</p>}<a className="club-text-link" href={product.href} target="_blank" rel="noopener noreferrer">{de ? 'Zum Angebot' : 'View offer'}<ArrowUpRight size={18} /></a></article>
  })}</div> : <p className="equipment-empty">{de ? 'Unsere Equipment-Auswahl erscheint demnächst hier.' : 'Our equipment selection will appear here soon.'}</p>}
  <p className="equipment-disclosure">{de ? 'Die Links führen zu Amazon. Der Verein erhält dafür keine Provision — wir teilen hier einfach, was wir selbst im Training nutzen.' : 'The links go to Amazon. The club earns no commission — we simply share what we use in our own training.'}</p>
  </section></main>
}
