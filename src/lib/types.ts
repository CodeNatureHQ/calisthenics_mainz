export type Lang = 'de' | 'en'

export type L10n = { de: string; en: string }

export function t(field: L10n, lang: Lang): string {
  return field[lang]
}

/* ------------------------------------------------------------------ */
/* Database row types                                                   */
/* ------------------------------------------------------------------ */

export type Post = {
  id: string
  glyph: string | null
  category: L10n
  date_label: L10n
  read_time: L10n
  title: L10n
  excerpt: L10n
  body_html: L10n
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type EventCategory = 'comp' | 'jam' | 'workshop' | 'social'

export type Event = {
  id: string
  category: EventCategory
  starts_at: string
  place: L10n
  title: L10n
  description: L10n
  created_at: string
  updated_at: string
}

export type SessionLevel = 'beginner' | 'advanced' | 'open' | 'comp' | 'training'

export type TrainingSession = {
  id: string
  day_of_week: number
  time_label: string
  place: L10n
  level: SessionLevel
  description: L10n | null
  spot_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type OverrideType = 'training' | 'cancel'

export type CalendarOverride = {
  id: string
  type: OverrideType
  on_date: string
  time_label: string | null
  place: L10n | null
  level: SessionLevel | null
  note: L10n | null
  description: L10n | null
  spot_id: string | null
  created_at: string
  updated_at: string
}

export type Spot = {
  id: string
  glyph: string
  map_x: number
  map_y: number
  lat: number | null
  lng: number | null
  label_anchor: 'left' | 'right'
  name: L10n
  subtitle: L10n
  address: string
  access: L10n
  gear: string[]
  maps_url: string | null
  images: string[]
  visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type SiteSettings = {
  id: number
  hero_members: string
  hero_sessions: string
  hero_spot: string
  hero_fee: string
  about_members: string
  about_founded: string
  about_spots: string
  about_sessions: string
  show_ausruestung: boolean
  updated_at: string
}

export type Product = {
  id: string
  glyph: string
  category: string
  name_de: string
  name_en: string
  desc_de: string
  desc_en: string
  href: string
  image_url: string | null
  sort_order: number
  visible: boolean
  created_at: string
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'unsure'

export type ContactMessage = {
  id: string
  name: string
  email: string
  level: ExperienceLevel
  message: string
  handled: boolean
  created_at: string
}
