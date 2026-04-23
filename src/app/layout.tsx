import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calisthenics-mainz.de'),
  title: {
    default: 'Calisthenics Mainz',
    template: '%s | Calisthenics Mainz',
  },
  description: 'Calisthenics-Verein in Mainz — Training, Events und Community.',
  openGraph: {
    siteName: 'Calisthenics Mainz',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
