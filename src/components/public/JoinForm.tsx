'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowUpRight } from 'lucide-react'
import type { Lang } from '@/lib/types'

type Props = { lang: Lang; contactEmail?: string | null }

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
    sub: 'Lust auf ein Probetraining oder noch eine Frage? Schreib uns. Wir helfen dir beim Einstieg.',
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
    submit: 'Nachricht per Mail senden',
    submitting: 'Wird gesendet …',
    submitNote: 'Kostenlos & unverbindlich',
    success: 'Danke — wir melden uns schnell!',
    error: 'Etwas ist schiefgelaufen. Bitte versuch es nochmal.',
    connectTitle: 'Sag einfach Hallo.',
    connectText: 'Du erreichst uns auch auf Instagram. Dort teilen wir Einblicke ins Training und Neuigkeiten aus dem Verein.',
  },
  en: {
    label: '07',
    title: 'Join',
    sub: "Want to try a session or have a question? Send us a message. We’ll help you get started.",
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
    submit: 'Send message by email',
    submitting: 'Sending …',
    submitNote: 'Free & no commitment',
    success: "Thanks — we'll be in touch soon!",
    error: 'Something went wrong. Please try again.',
    connectTitle: 'Or directly',
    connectText: "Not into forms? Just message us on Instagram.",
  },
}

export default function JoinForm({ lang, contactEmail }: Props) {
  const c = copy[lang]
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [mailtoHref, setMailtoHref] = useState<string | null>(null)

  /** Same content as the stored message, prefilled for the visitor's own mail app. */
  function buildMailto(data: FormValues): string | null {
    if (!contactEmail) return null
    const de = lang === 'de'
    const levelLabel = copy[lang].levels.find((l) => l.value === data.level)?.label ?? data.level
    const subject = de ? `Kontakt über die Webseite: ${data.name}` : `Contact via the website: ${data.name}`
    const body = [
      de ? `Hallo Calisthenics Mainz,` : `Hello Calisthenics Mainz,`,
      '',
      data.message,
      '',
      `${de ? 'Name' : 'Name'}: ${data.name}`,
      `${de ? 'E-Mail' : 'Email'}: ${data.email}`,
      `${de ? 'Level' : 'Level'}: ${levelLabel}`,
    ].join('\n')
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormValues) {
    setStatus('submitting')
    const href = buildMailto(data)
    setMailtoHref(href)
    let stored = false
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lang }),
      })
      stored = res.ok
    } catch {
      stored = false
    }
    // Open the visitor's mail app with the same text. The copy in the admin inbox is
    // kept regardless, so nothing is lost if the mail app never opens.
    if (href) window.location.href = href
    if (stored || href) {
      setStatus('success')
      reset()
    } else {
      setStatus('error')
    }
  }

  const de = lang === 'de'
  return <section id={de ? 'mitmachen' : 'join'} className="section contact-section"><div className="container contact-layout">
    <div className="contact-intro"><p className="eyebrow">{de ? 'Dein Platz an der Stange' : 'Your place at the bars'}</p><h2>{de ? 'Mittrainieren.' : 'Train with us.'}</h2><p>{c.sub}</p><div className="contact-direct"><h3>{de ? 'Lieber direkt?' : 'Prefer a direct message?'}</h3><p>{de ? 'Du findest uns auch auf Instagram.' : 'You can also find us on Instagram.'}</p><a href="https://www.instagram.com/calisthenicsmainz/" target="_blank" rel="noopener noreferrer" className="club-text-link">@calisthenicsmainz<ArrowUpRight size={18} /></a></div></div>
    <div className="contact-form-panel">{status === 'success' ? <div role="status" className="contact-success"><h3>{de ? 'Nachricht angekommen.' : 'Message received.'}</h3><p>{c.success}</p>{mailtoHref && <p>{de ? 'Dein Mail-Programm sollte sich mit dem Text geöffnet haben. Falls nicht: ' : 'Your mail app should have opened with the text. If not: '}<a href={mailtoHref} className="club-text-link">{de ? 'Mail jetzt öffnen' : 'Open mail now'}<ArrowUpRight size={16} /></a></p>}</div> : <form onSubmit={handleSubmit(onSubmit)} noValidate className="club-contact-form">
      <div className="contact-name-row">{(['name', 'email'] as const).map(field => <div className="contact-field" key={field}><label htmlFor={`contact-${field}`}>{c[field]}</label><input id={`contact-${field}`} type={field === 'email' ? 'email' : 'text'} autoComplete={field} {...register(field)} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `contact-${field}-error` : undefined} />{errors[field] && <p className="field-error" id={`contact-${field}-error`}>{de ? (field === 'name' ? 'Bitte gib deinen Namen ein (mindestens 2 Zeichen).' : 'Bitte gib eine gültige E-Mail-Adresse ein.') : (field === 'name' ? 'Please enter your name (at least 2 characters).' : 'Please enter a valid email address.')}</p>}</div>)}</div>
      <div className="contact-field"><label htmlFor="contact-level">{c.level}</label><select id="contact-level" {...register('level')} aria-invalid={!!errors.level} aria-describedby={errors.level ? 'contact-level-error' : undefined}><option value="">{de ? 'Bitte wählen' : 'Please select'}</option>{c.levels.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}</select>{errors.level && <p className="field-error" id="contact-level-error">{de ? 'Bitte wähle eine Einschätzung aus.' : 'Please select your level.'}</p>}</div>
      <div className="contact-field"><label htmlFor="contact-message">{c.message}</label><textarea id="contact-message" {...register('message')} rows={5} placeholder={de ? 'Ich möchte beim Training vorbeikommen …' : 'I’d like to join a training session …'} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'contact-message-error' : undefined} />{errors.message && <p className="field-error" id="contact-message-error">{de ? 'Schreib uns bitte mindestens 10 Zeichen.' : 'Please write at least 10 characters.'}</p>}</div>
      <div><label className="contact-privacy"><input type="checkbox" {...register('privacy')} aria-invalid={!!errors.privacy} aria-describedby={errors.privacy ? 'contact-privacy-error' : undefined} /><span>{de ? 'Ich stimme der ' : 'I agree to the '}<a href={`/${lang}/datenschutz`}>{de ? 'Datenschutzerklärung' : 'privacy policy'}</a>{de ? ' zu.' : '.'}</span></label>{errors.privacy && <p className="field-error" id="contact-privacy-error">{de ? 'Bitte bestätige die Datenschutzerklärung.' : 'Please agree to the privacy policy.'}</p>}</div>
      {status === 'error' && <p role="alert" className="field-error">{c.error}</p>}<button className="club-button" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? c.submitting : c.submit}<ArrowUpRight size={19} /></button>
    </form>}</div>
  </div></section>
}
