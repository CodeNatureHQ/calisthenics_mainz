'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Lang } from '@/lib/types'

type Props = { lang: Lang }

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'unsure']),
  message: z.string().min(10),
  privacy: z.boolean().refine((v) => v === true),
})

type FormValues = z.infer<typeof schema>

const copy = {
  de: {
    label: '07',
    title: 'Mitmachen',
    sub: 'Kein Aufnahmetest, kein Minimum-Level — schreib uns und wir sagen dir, wann und wo du einfach vorbeikommen kannst.',
    name: 'Name',
    email: 'E-Mail',
    level: 'Dein Level',
    levels: [
      { value: 'beginner', label: 'Einsteiger — noch kein Klimmzug' },
      { value: 'intermediate', label: 'Fortgeschritten — Grundlagen sitzen' },
      { value: 'advanced', label: 'Erfahren — Skill moves in Arbeit' },
      { value: 'unsure', label: 'Weiß ich nicht genau' },
    ],
    message: 'Nachricht',
    msgPlaceholder: 'Was beschäftigt dich? Fragen, Ziele, alles ok.',
    privacy: 'Ich stimme der Datenschutzerklärung zu.',
    submit: 'Nachricht senden',
    submitting: 'Wird gesendet …',
    submitNote: 'Kostenlos & unverbindlich',
    success: 'Danke — wir melden uns schnell!',
    error: 'Etwas ist schiefgelaufen. Bitte versuch es nochmal.',
    connectTitle: 'Oder direkt',
    connectText: 'Kein Bock auf Formulare? Schreib uns einfach auf Instagram.',
  },
  en: {
    label: '07',
    title: 'Join',
    sub: "No entry test, no minimum level — write to us and we'll tell you when and where you can just come by.",
    name: 'Name',
    email: 'Email',
    level: 'Your level',
    levels: [
      { value: 'beginner', label: "Beginner — can't do a pull-up yet" },
      { value: 'intermediate', label: 'Intermediate — basics are solid' },
      { value: 'advanced', label: 'Advanced — working on skill moves' },
      { value: 'unsure', label: "Not sure yet" },
    ],
    message: 'Message',
    msgPlaceholder: "What's on your mind? Questions, goals, anything works.",
    privacy: 'I agree to the privacy policy.',
    submit: 'Send message',
    submitting: 'Sending …',
    submitNote: 'Free & no commitment',
    success: "Thanks — we'll be in touch soon!",
    error: 'Something went wrong. Please try again.',
    connectTitle: 'Or directly',
    connectText: "Not into forms? Just message us on Instagram.",
  },
}

export default function JoinForm({ lang }: Props) {
  const c = copy[lang]
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormValues) {
    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lang }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id={lang === 'de' ? 'mitmachen' : 'join'}
      className="section"
    >
      <div className="container">
        <SectionHead label={c.label} title={c.title} sub={c.sub} />

        <div
          style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64 }}
          className="join-grid"
        >
          {/* Form */}
          <div>
            {status === 'success' ? (
              <div
                style={{
                  padding: '18px 20px',
                  border: '1px solid var(--fg)',
                  borderRadius: 12,
                  background: 'rgba(245,243,238,.04)',
                  color: 'var(--fg)',
                  fontSize: 14,
                }}
              >
                {c.success}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                {/* Name + Email row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="field-row">
                  <Field label={c.name} error={errors.name?.message}>
                    <input {...register('name')} style={fieldInput(!!errors.name)} />
                  </Field>
                  <Field label={c.email} error={errors.email?.message}>
                    <input {...register('email')} type="email" style={fieldInput(!!errors.email)} />
                  </Field>
                </div>

                {/* Level */}
                <Field label={c.level} error={errors.level?.message}>
                  <div style={{ position: 'relative' }}>
                    <select {...register('level')} style={{ ...fieldInput(!!errors.level), appearance: 'none', paddingRight: 40 }}>
                      <option value="">—</option>
                      {c.levels.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                    <svg
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      width="12" height="8" viewBox="0 0 12 8" fill="none"
                    >
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="#9A9A9F" strokeWidth="1.5" />
                    </svg>
                  </div>
                </Field>

                {/* Message */}
                <Field label={c.message} error={errors.message?.message}>
                  <textarea
                    {...register('message')}
                    placeholder={c.msgPlaceholder}
                    rows={5}
                    style={{ ...fieldInput(!!errors.message), resize: 'vertical', minHeight: 120 }}
                  />
                </Field>

                {/* Privacy */}
                <Field error={errors.privacy?.message}>
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 13, color: 'var(--fg-dim)', fontFamily: 'var(--font-sans)' }}>
                    <input
                      {...register('privacy')}
                      type="checkbox"
                      style={{ marginTop: 3, accentColor: 'var(--accent-spark)', flexShrink: 0 }}
                    />
                    <span>
                      {lang === 'de' ? (
                        <>Ich stimme der <a href={`/${lang}/datenschutz`} style={{ color: 'var(--fg)', textDecoration: 'underline' }}>Datenschutzerklärung</a> zu.</>
                      ) : (
                        <>I agree to the <a href={`/${lang}/datenschutz`} style={{ color: 'var(--fg)', textDecoration: 'underline' }}>privacy policy</a>.</>
                      )}
                    </span>
                  </label>
                </Field>

                {/* Submit row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em' }}>
                    {c.submitNote}
                  </span>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'var(--fg)',
                      color: 'var(--accent-ink)',
                      fontWeight: 600,
                      fontSize: 14,
                      letterSpacing: '0.02em',
                      padding: '14px 22px',
                      borderRadius: 999,
                      border: 'none',
                      cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                      opacity: status === 'submitting' ? 0.6 : 1,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (status !== 'submitting') (e.currentTarget as HTMLElement).style.background = '#E8FF66'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--fg)'
                    }}
                  >
                    {status === 'submitting' ? c.submitting : c.submit}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {status === 'error' && (
                  <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0 }}>{c.error}</p>
                )}
              </form>
            )}
          </div>

          {/* Connect panel */}
          <aside
            style={{
              border: '1px solid var(--line-soft)',
              borderRadius: 20,
              padding: 32,
              background: 'var(--bg-2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              height: 'fit-content',
              minWidth: 0,
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: 'var(--fg)',
                margin: 0,
              }}
            >
              {c.connectTitle}
            </h3>
            <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.55 }}>
              {c.connectText}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              {[
                { icon: 'IG', label: 'Instagram', handle: '@calisthenicsmainz', href: 'https://instagram.com/calisthenicsmainz' },
              ].map((s) => {
                const rowStyle: React.CSSProperties = {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '16px 18px',
                  border: '1px solid var(--line-soft)',
                  borderRadius: 12,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  color: s.href ? 'var(--fg)' : 'var(--fg-mute)',
                  textDecoration: 'none',
                  cursor: s.href ? 'pointer' : 'default',
                  transition: 'border-color 0.2s, background 0.2s',
                }
                const inner = (
                  <>
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', border: '1px solid var(--line-soft)', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <defs>
                          <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FCAF45"/>
                            <stop offset="35%" stopColor="#E1306C"/>
                            <stop offset="70%" stopColor="#833AB4"/>
                            <stop offset="100%" stopColor="#405DE6"/>
                          </linearGradient>
                        </defs>
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig)"/>
                        <circle cx="12" cy="12" r="4" stroke="url(#ig)"/>
                        <circle cx="17.5" cy="6.5" r="1" fill="url(#ig)" stroke="none"/>
                      </svg>
                    </div>
                    <span style={{ flex: 1 }}>{s.label}</span>
                    <span className="social-handle" style={{ color: 'var(--fg-mute)' }}>{s.handle}</span>
                  </>
                )
                return s.href ? (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={rowStyle}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--fg)'; el.style.background = 'var(--bg)' }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--line-soft)'; el.style.background = 'transparent' }}
                  >{inner}</a>
                ) : (
                  <div key={s.label} style={rowStyle}>{inner}</div>
                )
              })}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .join-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 520px) {
          .field-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .social-handle { display: none; }
        }
      `}</style>
    </section>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      {label && (
        <label style={{
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--fg-dim)',
          marginBottom: 8,
        }}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, fontFamily: 'var(--font-mono)' }}>{error}</p>
      )}
    </div>
  )
}

function fieldInput(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    background: 'var(--bg-2)',
    border: `1px solid ${hasError ? 'var(--danger)' : 'var(--line-soft)'}`,
    color: 'var(--fg)',
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    padding: '14px 16px',
    borderRadius: 12,
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  }
}

function SectionHead({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 64, paddingBottom: 20, borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 20, height: 3, background: 'var(--accent-2)', borderRadius: 2, flexShrink: 0 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-2)', letterSpacing: '0.08em' }}>{label}</div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5.5vw, 72px)', lineHeight: 0.95, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--fg)', margin: 0 }}>{title}</h2>
      </div>
      {sub && <p style={{ color: 'var(--fg-dim)', maxWidth: 460, fontSize: 16, lineHeight: 1.55, margin: 0 }}>{sub}</p>}
    </div>
  )
}
