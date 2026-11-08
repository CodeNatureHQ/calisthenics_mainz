'use client'

import { inp } from '@/app/admin/shared'
import { LangColumns } from './Form'

type Props = {
  label: string
  hint?: string
  optional?: boolean
  deValue: string
  enValue: string
  onDe: (v: string) => void
  onEn: (v: string) => void
  textarea?: boolean
  rows?: number
  placeholder?: { de?: string; en?: string }
}

/** One bilingual text input: German, with English optional underneath. */
export default function LangPair({ label, hint, optional, deValue, enValue, onDe, onEn, textarea = false, rows = 3, placeholder }: Props) {
  const render = (value: string, onChange: (v: string) => void, ph?: string) =>
    textarea
      ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={ph} style={{ ...inp, resize: 'vertical', minHeight: 88 }} />
      : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} style={inp} />
  return (
    <LangColumns label={label} hint={hint} optional={optional} de={render(deValue, onDe, placeholder?.de)} en={render(enValue, onEn, placeholder?.en)} enValue={enValue} />
  )
}
