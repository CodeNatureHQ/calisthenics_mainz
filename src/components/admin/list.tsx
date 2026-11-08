'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/admin'

/**
 * Shared list behaviour for every content page:
 * - deep links: `/admin/faq?edit=<id>` (or `?edit=new`) opens the editor directly,
 *   so search, dashboard and the public site's edit button land inside the form;
 * - whole rows open the editor (ListItem), toggles inside a row don't;
 * - order is changed with arrows in the list, not with numbers in a form.
 */

/** Opens `items` matching `?<param>=<id>` (or `new`) once they are loaded, then drops the param. */
export function useDeepLink<T extends { id: string | number }>(param: string, items: T[], ready: boolean, open: (target: T | 'new') => void) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const value = params.get(param)

  useEffect(() => {
    if (!value || !ready) return
    const target = value === 'new' ? 'new' : items.find((i) => String(i.id) === value)
    if (target) open(target)
    const rest = new URLSearchParams(params.toString())
    rest.delete(param)
    router.replace(rest.size ? `${pathname}?${rest}` : pathname, { scroll: false })
    // open is recreated every render; the link only needs to fire when value/ready change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ready])
}

let moving = false

/**
 * Swaps an item with its neighbour and writes a clean 10-step order for the whole list.
 * Ignores clicks while a move is still being written; returns the old order if a write fails.
 */
export async function moveItem<T extends { id: string | number; sort_order: number }>(table: string, items: T[], index: number, dir: -1 | 1): Promise<T[]> {
  const j = index + dir
  if (moving || j < 0 || j >= items.length) return items
  moving = true
  try {
    const next = [...items]
    ;[next[index], next[j]] = [next[j], next[index]]
    const supabase = createClient()
    const results = await Promise.all(
      next.map((item, i) => (item.sort_order === i * 10 ? null : supabase.from(table).update({ sort_order: i * 10 }).eq('id', item.id))),
    )
    if (results.some((r) => r?.error)) return items
    return next.map((item, i) => ({ ...item, sort_order: i * 10 }))
  } finally {
    moving = false
  }
}

/** New items go to the end of the list. */
export const nextSortOrder = (items: { sort_order: number }[]) => (items.length ? Math.max(...items.map((i) => i.sort_order)) + 10 : 0)

export function MoveButtons({ index, count, onMove }: { index: number; count: number; onMove: (dir: -1 | 1) => void }) {
  return (
    <span className="admin-move">
      <button type="button" aria-label="Nach oben" disabled={index === 0} onClick={() => onMove(-1)}><ChevronUp size={15} /></button>
      <button type="button" aria-label="Nach unten" disabled={index === count - 1} onClick={() => onMove(1)}><ChevronDown size={15} /></button>
    </span>
  )
}

/**
 * One list entry: leading visual, title + one subtitle line, optional status/actions,
 * and a chevron that says "this opens". The whole row opens the editor; clicks on
 * `trailing` (badge toggles, move arrows) stay there.
 */
export function ListItem({ onOpen, leading, title, sub, trailing, dim }: {
  onOpen: () => void; leading?: ReactNode; title: ReactNode; sub?: ReactNode; trailing?: ReactNode; dim?: boolean
}) {
  return (
    <div
      className="admin-item"
      data-dim={dim ? 'true' : undefined}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) onOpen() }}
    >
      {leading}
      <div className="admin-item-main" style={{ flex: 1, minWidth: 0 }}>
        <div className="admin-item-title">{title}</div>
        {sub && <div className="admin-item-sub">{sub}</div>}
      </div>
      {trailing && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>{trailing}</div>}
      <ChevronRight className="admin-item-chevron" size={18} />
    </div>
  )
}

/** Square thumbnail or initials. */
export function Thumb({ src, fallback }: { src?: string | null; fallback: string }) {
  return <span className="admin-thumb">{src ? <img src={src} alt="" /> : fallback}</span>
}

/** Visible text of stored HTML, for one-line previews. */
export const plain = (html?: string | null) =>
  (html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()

/** A date set like a timetable: "15.11." big, weekday small. Red and struck through when cancelled. */
export function DateCol({ date, sub, tone }: { date: Date; sub?: string; tone?: 'danger' }) {
  return (
    <span className="admin-date" data-tone={tone}>
      <b>{date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</b>
      <span>{sub ?? date.toLocaleDateString('de-DE', { weekday: 'short' })}</span>
    </span>
  )
}

/** Visibility switch for list rows: a real control with a label for screen readers. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="admin-switch" title={label}>
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
      <i aria-hidden="true" />
    </label>
  )
}
