'use client'

type Props = {
  label: string
  deValue: string
  enValue: string
  onDe: (v: string) => void
  onEn: (v: string) => void
  textarea?: boolean
  rows?: number
  placeholder?: { de?: string; en?: string }
}

export default function LangPair({ label, deValue, enValue, onDe, onEn, textarea = false, rows = 3, placeholder }: Props) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-mute)', marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { val: deValue, cb: onDe, tag: 'Deutsch', color: '#4A7FD4', bg: 'rgba(74,127,212,0.10)', ph: placeholder?.de },
          { val: enValue, cb: onEn, tag: 'English', color: '#D8FF3D', bg: 'rgba(216,255,61,0.07)', ph: placeholder?.en },
        ].map(({ val, cb, tag, color, bg, ph }) => (
          <div key={tag}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase',
              letterSpacing: '0.12em', color,
              background: bg, padding: '4px 8px',
              borderRadius: '6px 6px 0 0',
              border: `1px solid ${color}33`,
              borderBottom: 'none',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {tag}
            </div>
            {textarea ? (
              <textarea
                value={val}
                onChange={(e) => cb(e.target.value)}
                rows={rows}
                placeholder={ph}
                className="admin-input"
                style={fieldStyle}
              />
            ) : (
              <input
                value={val}
                onChange={(e) => cb(e.target.value)}
                placeholder={ph}
                className="admin-input"
                style={fieldStyle}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  borderRadius: '0 6px 6px 6px',
  padding: '10px 12px',
  fontSize: 13.5,
  color: 'var(--fg)',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  resize: 'vertical' as const,
}
