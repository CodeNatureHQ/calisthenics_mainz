'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/** Enhance visible content without hiding it when JavaScript or animation is unavailable. */
export default function PublicMotion() {
  const pathname = usePathname()
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations = new Set<Animation>()
    let observer: IntersectionObserver | undefined
    const stop = () => {
      observer?.disconnect()
      animations.forEach(animation => animation.cancel())
      animations.clear()
    }
    const start = () => {
      stop()
      if (preference.matches || !('IntersectionObserver' in window)) return
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          observer?.unobserve(entry.target)
          const animation = entry.target.animate([
            { opacity: 0, transform: 'translateY(16px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' })
          animations.add(animation)
          animation.onfinish = () => animations.delete(animation)
        })
      }, { threshold: 0.08 })
      document.querySelectorAll('.public-site .community-hero-heading, .public-site .community-hero-photo, .public-site .section-heading, .public-site .location-card, .public-site .event-card, .public-site .discipline-grid article, .public-site .training-intro, .public-site .contact-intro').forEach(element => observer?.observe(element))
    }
    start()
    preference.addEventListener('change', start)
    return () => { stop(); preference.removeEventListener('change', start) }
  }, [pathname])
  return null
}
