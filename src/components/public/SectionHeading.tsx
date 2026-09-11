import type { ReactNode } from 'react'

export default function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: ReactNode }) {
  return (
    <div className="section-heading">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {description && <p className="section-description">{description}</p>}
    </div>
  )
}
