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
    <html suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Archivo:wght@400;500;600;700&display=swap" />
        <script id="club-theme" dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('cm-theme')==='dark'?'dark':'light'}catch{document.documentElement.dataset.theme='light'}` }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
