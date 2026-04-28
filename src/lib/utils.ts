import type { EventCategory, L10n, Lang } from './types'

export function t(field: L10n, lang: Lang): string {
  return field[lang]
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function categoryColor(cat: EventCategory): string {
  const map: Record<EventCategory, string> = {
    comp: 'var(--cat-comp)',
    jam: 'var(--cat-jam)',
    workshop: 'var(--cat-workshop)',
    social: 'var(--cat-social)',
  }
  return map[cat]
}

export function categoryLabel(cat: EventCategory, lang: 'de' | 'en'): string {
  const map: Record<EventCategory, { de: string; en: string }> = {
    comp:     { de: 'Wettkampf', en: 'Competition' },
    jam:      { de: 'Jam',       en: 'Jam' },
    workshop: { de: 'Workshop',  en: 'Workshop' },
    social:   { de: 'Social',    en: 'Social' },
  }
  return map[cat][lang]
}

export function levelLabel(level: string, lang: 'de' | 'en'): string {
  const map: Record<string, { de: string; en: string }> = {
    beginner: { de: 'Einsteiger', en: 'Beginner' },
    advanced: { de: 'Fortgeschritten', en: 'Advanced' },
    open:     { de: 'Offen für alle', en: 'Open for all' },
    comp:     { de: 'Wettkampf', en: 'Competition' },
    training: { de: 'Training', en: 'Training' },
  }
  return map[level]?.[lang] ?? level
}

export function dayLabel(day: number, lang: 'de' | 'en'): string {
  const de = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const en = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return lang === 'de' ? de[day] : en[day]
}

export function fullDayLabel(day: number, lang: 'de' | 'en'): string {
  const de = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
  const en = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return lang === 'de' ? de[day] : en[day]
}

export function formatDate(iso: string, lang: 'de' | 'en'): string {
  const date = new Date(iso)
  return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export function isFuture(iso: string): boolean {
  return new Date(iso) > new Date()
}

/** Returns 1–5: which nth occurrence of this weekday it is within its month. */
export function nthWeekdayOfMonth(date: Date): number {
  return Math.ceil(date.getDate() / 7)
}
