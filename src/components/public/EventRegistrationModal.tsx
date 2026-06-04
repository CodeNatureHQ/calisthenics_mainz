'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Event, Lang } from '@/lib/types'
import { t } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export type RegistrationMode = 'individual' | 'team'

export type RegistrationConfig = {
  mode: RegistrationMode
  allowIndividual?: boolean
  maxTeamSize?: number
}

type TeamMember = { name: string; email: string }
type Step = 'select' | 'team' | 'individual' | 'submitting' | 'success'

const CAT_COLORS: Record<string, string> = {
  comp: '#D97757', jam: '#D8FF3D', workshop: '#8EC5FF', social: '#FFB48E',
}
const CAT_INK: Record<string, string> = {
  comp: '#FFF8F0', jam: '#1A1A00', workshop: '#001A3A', social: '#3A1A00',
}

const ORANGE = '#D97757'
const ORANGE_INK = '#FFF8F0'

const copy = {
  de: {
    registration: 'Anmeldung',
    howJoin: 'Wie möchtest du dabei sein?',
    asTeam: 'Als Team', asTeamDesc: 'Gemeinsam anmelden',
    asIndividual: 'Einzeln', asIndividualDesc: 'Ich komme alleine',
    teamName: 'Teamname', teamNamePlaceholder: 'z.B. Die Eisenbären',
    members: 'Mitglieder', memberN: (n: number) => `${n}`,
    addMember: '+ Mitglied hinzufügen',
    name: 'Name', namePlaceholder: 'Dein Name',
    email: 'E-Mail (optional)', emailPlaceholder: 'deine@email.de',
    back: '← Zurück',
    submitTeam: 'Als Team anmelden', submitIndividual: 'Ich komme!',
    close: 'Fertig',
    successTitle: 'Alles klar!',
    successTeamSub: 'Angemeldet',
    successTeamMsg: (n: string) => `Wir freuen uns auf euch, Team "${n}"!`,
    successIndividualMsg: (n: string) => `Wir freuen uns auf dich, ${n}!`,
    required: 'Pflichtfeld', invalidEmail: 'Ungültige E-Mail', tooShort: 'Mindestens 2 Zeichen',
  },
  en: {
    registration: 'Registration',
    howJoin: 'How would you like to join?',
    asTeam: 'As a team', asTeamDesc: 'Register as a group',
    asIndividual: 'Individual', asIndividualDesc: "I'm coming on my own",
    teamName: 'Team name', teamNamePlaceholder: 'e.g. The Iron Bears',
    members: 'Members', memberN: (n: number) => `${n}`,
    addMember: '+ Add member',
    name: 'Name', namePlaceholder: 'Your name',
    email: 'Email (optional)', emailPlaceholder: 'your@email.com',
    back: '← Back',
    submitTeam: 'Register as team', submitIndividual: "I'm coming!",
    close: 'Done',
    successTitle: "You're in!",
    successTeamSub: 'Registered',
    successTeamMsg: (n: string) => `See you there, team "${n}"!`,
    successIndividualMsg: (n: string) => `See you there, ${n}!`,
    required: 'Required', invalidEmail: 'Invalid email', tooShort: 'At least 2 characters',
  },
}

function isValidEmail(s: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) }

const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--bg)', border: '1px solid var(--line)',
  borderRadius: 8, padding: '10px 12px', fontSize: 14,
  color: 'var(--fg)', fontFamily: 'var(--font-sans)',
  outline: 'none', transition: 'border-color 0.15s',
}

const fieldLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
  letterSpacing: '0.12em', color: 'var(--fg-mute)', display: 'block', marginBottom: 6,
}

const errText: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)',
  marginTop: 5, marginBottom: 0,
}

export default function EventRegistrationModal({
  event, config, lang, onClose,
}: {
  event: Event; config: RegistrationConfig; lang: Lang; onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const c = copy[lang]
  const catColor = CAT_COLORS[event.category] ?? '#D8FF3D'
  const catInk = CAT_INK[event.category] ?? '#0B0B0D'
  const maxSize = config.maxTeamSize ?? 4
  const hasChoice = config.mode === 'team' && !!config.allowIndividual

  const initialStep: Step = hasChoice ? 'select' : config.mode === 'team' ? 'team' : 'individual'
  const [step, setStep] = useState<Step>(initialStep)
  const [submittedAs, setSubmittedAs] = useState<'team' | 'individual' | null>(null)

  const memberNameRefs = useRef<(HTMLInputElement | null)[]>([])
  const prevMembersLength = useRef(1)

  const [teamName, setTeamName] = useState('')
  const [members, setMembers] = useState<TeamMember[]>([{ name: '', email: '' }])
  const [teamErr, setTeamErr] = useState<{ teamName?: string; rows?: { name?: string; email?: string }[] }>({})

  const [indName, setIndName] = useState('')
  const [indEmail, setIndEmail] = useState('')
  const [indErr, setIndErr] = useState<{ name?: string; email?: string }>({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  useEffect(() => {
    if (members.length > prevMembersLength.current) {
      memberNameRefs.current[members.length - 1]?.focus()
    }
    prevMembersLength.current = members.length
  }, [members.length])

  if (!mounted) return null

  function updateMember(i: number, f: keyof TeamMember, v: string) {
    const next = [...members]; next[i] = { ...next[i], [f]: v }; setMembers(next)
  }

  function validateTeam() {
    const err: typeof teamErr = {}
    if (teamName.trim().length < 2) err.teamName = c.tooShort
    const rows = members.map((m) => {
      const r: { name?: string; email?: string } = {}
      if (!m.name.trim()) r.name = c.required
      if (m.email.trim() && !isValidEmail(m.email)) r.email = c.invalidEmail
      return r
    })
    if (rows.some((r) => r.name || r.email)) err.rows = rows
    setTeamErr(err)
    return !err.teamName && !err.rows
  }

  function validateIndividual() {
    const err: typeof indErr = {}
    if (!indName.trim()) err.name = c.required
    if (indEmail.trim() && !isValidEmail(indEmail)) err.email = c.invalidEmail
    setIndErr(err)
    return !err.name && !err.email
  }

  async function submitTeam() {
    if (!validateTeam()) return
    setSubmittedAs('team'); setStep('submitting'); setSubmitError('')
    try {
      const supabase = createClient()
      const regId = crypto.randomUUID()
      const { error: regErr } = await supabase
        .from('event_registrations')
        .insert({ id: regId, event_id: event.id, type: 'team', team_name: teamName })
      if (regErr) throw regErr
      const { error: membErr } = await supabase.from('event_registration_members').insert(
        members.map((m, i) => ({ registration_id: regId, name: m.name, email: m.email || null, sort_order: i }))
      )
      if (membErr) throw membErr
      setStep('success')
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Fehler beim Speichern')
      setStep('team')
    }
  }

  async function submitIndividual() {
    if (!validateIndividual()) return
    setSubmittedAs('individual'); setStep('submitting'); setSubmitError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.from('event_registrations').insert({
        event_id: event.id, type: 'individual', name: indName, email: indEmail || null,
      })
      if (error) throw error
      setStep('success')
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Fehler beim Speichern')
      setStep('individual')
    }
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(10,10,12,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflowY: 'auto', padding: '40px 20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-2)', border: '1px solid var(--line)',
          borderRadius: 20, maxWidth: 560, width: '100%',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Category accent stripe */}
        <div style={{ height: 3, background: catColor }} />

        {/* Close */}
        <button
          onClick={onClose}
          aria-label={c.close}
          style={{
            position: 'absolute', top: 18, right: 18,
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid var(--line-soft)', background: 'var(--bg-3)',
            color: 'var(--fg-mute)', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', lineHeight: 1, transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--fg)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line-soft)'; e.currentTarget.style.color = 'var(--fg-mute)' }}
        >×</button>

        {/* ── Header ── */}
        <div style={{ padding: '24px 32px 20px', borderBottom: '1px solid var(--line-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{
              padding: '2px 10px', borderRadius: 999,
              background: catColor, color: catInk,
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700,
            }}>
              {t(event.title, lang)}
            </span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase',
            letterSpacing: '-0.02em', color: 'var(--fg)', margin: 0, lineHeight: 1,
            paddingRight: 40,
          }}>
            {c.registration}
          </h2>
        </div>

        <div className="reg-inner" style={{ padding: '28px 32px 32px' }}>

          {/* ── Select step ── */}
          {step === 'select' && (
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--fg-dim)', fontSize: 15, margin: '0 0 20px', lineHeight: 1.5 }}>
                {c.howJoin}
              </p>
              <div className="reg-select-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([
                  { key: 'team' as Step, title: c.asTeam, desc: c.asTeamDesc },
                  { key: 'individual' as Step, title: c.asIndividual, desc: c.asIndividualDesc },
                ]).map(({ key, title, desc }) => (
                  <button
                    key={key}
                    onClick={() => setStep(key)}
                    style={{
                      background: 'var(--bg-3)', border: `1px solid var(--line)`,
                      borderRadius: 14, padding: '22px 20px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-between', minHeight: 130, gap: 16,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = ORANGE
                      e.currentTarget.style.boxShadow = `0 0 0 1px ${ORANGE}33`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--line)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 20,
                        textTransform: 'uppercase', letterSpacing: '-0.01em',
                        color: 'var(--fg)', marginBottom: 6, lineHeight: 1,
                      }}>{title}</div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1.4 }}>{desc}</div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Team form ── */}
          {step === 'team' && (
            <div>
              {/* Team name */}
              <div style={{ marginBottom: 24 }}>
                <label style={fieldLabel}>{c.teamName}</label>
                <input
                  style={{
                    ...inp,
                    fontSize: 18, padding: '13px 16px', fontWeight: 600,
                    borderColor: teamErr.teamName ? 'var(--danger)' : 'var(--line)',
                  }}
                  placeholder={c.teamNamePlaceholder}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onFocus={(e) => { if (!teamErr.teamName) e.target.style.borderColor = ORANGE }}
                  onBlur={(e) => { if (!teamErr.teamName) e.target.style.borderColor = 'var(--line)' }}
                  autoFocus
                />
                {teamErr.teamName && <p style={errText}>{teamErr.teamName}</p>}
              </div>

              {/* Members */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={fieldLabel}>{c.members}</span>
                  {/* Capacity dots */}
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {Array.from({ length: maxSize }).map((_, i) => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: i < members.length ? ORANGE : 'var(--line)',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', marginLeft: 4 }}>
                      {members.length}/{maxSize}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {members.map((m, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '32px 1fr',
                      gap: 12, alignItems: 'start',
                    }}>
                      {/* Number */}
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: '42px',
                        color: ORANGE, letterSpacing: '-0.02em', textAlign: 'center',
                        paddingTop: 2,
                      }}>
                        {i + 1}
                      </div>
                      {/* Fields */}
                      <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '10px 14px' }}>
                        <div className="reg-member-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <label style={fieldLabel}>{c.name}</label>
                            <input
                              ref={(el) => { memberNameRefs.current[i] = el }}
                              style={{ ...inp, fontSize: 13, padding: '8px 10px', borderColor: teamErr.rows?.[i]?.name ? 'var(--danger)' : 'var(--line)' }}
                              placeholder={c.namePlaceholder}
                              value={m.name}
                              onChange={(e) => updateMember(i, 'name', e.target.value)}
                            />
                            {teamErr.rows?.[i]?.name && <p style={errText}>{teamErr.rows[i].name}</p>}
                          </div>
                          <div>
                            <label style={fieldLabel}>{c.email}</label>
                            <input
                              style={{ ...inp, fontSize: 13, padding: '8px 10px', borderColor: teamErr.rows?.[i]?.email ? 'var(--danger)' : 'var(--line)' }}
                              placeholder={c.emailPlaceholder}
                              value={m.email}
                              onChange={(e) => updateMember(i, 'email', e.target.value)}
                            />
                            {teamErr.rows?.[i]?.email && <p style={errText}>{teamErr.rows[i].email}</p>}
                          </div>
                        </div>
                        {members.length > 1 && (
                          <button
                            onClick={() => setMembers(members.filter((_, j) => j !== i))}
                            style={{
                              marginTop: 8, background: 'none', border: 'none',
                              color: 'var(--fg-mute)', cursor: 'pointer',
                              fontFamily: 'var(--font-mono)', fontSize: 10,
                              letterSpacing: '0.08em', textTransform: 'uppercase',
                              padding: 0, transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-mute)' }}
                          >
                            Entfernen
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {members.length < maxSize && (
                  <button
                    onClick={() => setMembers([...members, { name: '', email: '' }])}
                    style={{
                      marginTop: 10, width: '100%',
                      background: 'transparent', border: `1px dashed var(--line)`,
                      borderRadius: 10, color: 'var(--fg-mute)',
                      fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em',
                      padding: '11px 16px', cursor: 'pointer',
                      transition: 'border-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.color = ORANGE }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--fg-mute)' }}
                  >{c.addMember}</button>
                )}
              </div>

              {submitError && <p style={{ ...errText, marginBottom: 12, marginTop: 0 }}>{submitError}</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
                {hasChoice && (
                  <button
                    onClick={() => setStep('select')}
                    style={{
                      padding: '11px 18px', borderRadius: 8, border: '1px solid var(--line-soft)',
                      background: 'transparent', color: 'var(--fg-dim)',
                      fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
                      textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >{c.back}</button>
                )}
                <button
                  onClick={submitTeam}
                  style={{
                    padding: '11px 22px', borderRadius: 8, border: 'none',
                    background: ORANGE, color: ORANGE_INK,
                    fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {c.submitTeam}
                </button>
              </div>
            </div>
          )}

          {/* ── Individual form ── */}
          {step === 'individual' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>{c.name}</label>
                <input
                  style={{
                    ...inp, fontSize: 16, padding: '12px 14px',
                    borderColor: indErr.name ? 'var(--danger)' : 'var(--line)',
                  }}
                  placeholder={c.namePlaceholder}
                  value={indName}
                  onChange={(e) => setIndName(e.target.value)}
                  onFocus={(e) => { if (!indErr.name) e.target.style.borderColor = ORANGE }}
                  onBlur={(e) => { if (!indErr.name) e.target.style.borderColor = 'var(--line)' }}
                  autoFocus
                />
                {indErr.name && <p style={errText}>{indErr.name}</p>}
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={fieldLabel}>{c.email}</label>
                <input
                  style={{
                    ...inp, fontSize: 16, padding: '12px 14px',
                    borderColor: indErr.email ? 'var(--danger)' : 'var(--line)',
                  }}
                  placeholder={c.emailPlaceholder}
                  value={indEmail}
                  onChange={(e) => setIndEmail(e.target.value)}
                  onFocus={(e) => { if (!indErr.email) e.target.style.borderColor = ORANGE }}
                  onBlur={(e) => { if (!indErr.email) e.target.style.borderColor = 'var(--line)' }}
                />
                {indErr.email && <p style={errText}>{indErr.email}</p>}
              </div>
              {submitError && <p style={{ ...errText, marginBottom: 12, marginTop: 0 }}>{submitError}</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
                {hasChoice && (
                  <button
                    onClick={() => setStep('select')}
                    style={{
                      padding: '11px 18px', borderRadius: 8, border: '1px solid var(--line-soft)',
                      background: 'transparent', color: 'var(--fg-dim)',
                      fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
                      textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >{c.back}</button>
                )}
                <button
                  onClick={submitIndividual}
                  style={{
                    padding: '11px 22px', borderRadius: 8, border: 'none',
                    background: ORANGE, color: ORANGE_INK,
                    fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700,
                  }}
                >
                  {c.submitIndividual}
                </button>
              </div>
            </div>
          )}

          {/* ── Submitting ── */}
          {step === 'submitting' && (
            <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`reg-dot-${i}`}
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: ORANGE, opacity: 0.3,
                    animation: `regPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              {/* Check circle */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: ORANGE, margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ORANGE_INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              {/* Label */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)',
                letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6,
              }}>
                {submittedAs === 'team' ? c.successTeamSub : c.successTitle}
              </div>

              {/* Name */}
              {submittedAs === 'team' && (
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase',
                  letterSpacing: '-0.01em', color: ORANGE, marginBottom: 12, lineHeight: 1.1,
                }}>
                  {teamName}
                </div>
              )}
              {submittedAs === 'individual' && (
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase',
                  letterSpacing: '-0.01em', color: ORANGE, marginBottom: 12, lineHeight: 1.1,
                }}>
                  {indName}
                </div>
              )}

              <p style={{
                color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.6,
                margin: '0 0 28px', maxWidth: '32ch', marginInline: 'auto',
              }}>
                {submittedAs === 'team' ? c.successTeamMsg(teamName) : c.successIndividualMsg(indName)}
              </p>

              <button
                onClick={onClose}
                style={{
                  padding: '11px 28px', borderRadius: 8, border: 'none',
                  background: catColor, color: catInk,
                  fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700,
                }}
              >
                {c.close}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes regPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 480px) {
          .reg-inner { padding: 20px 20px 28px !important; }
          .reg-select-grid { grid-template-columns: 1fr !important; }
          .reg-member-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>,
    document.body
  )
}
