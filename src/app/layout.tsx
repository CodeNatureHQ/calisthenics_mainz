import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calisthenics-mainz.de'),
  title: {
    default: 'Calisthenics Mainz',
    template: '%s | Calisthenics Mainz',
  },
  description: 'Calisthenics-Verein in Mainz — Training, Events und Community.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    siteName: 'Calisthenics Mainz',
    type: 'website',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Calisthenics Mainz' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
