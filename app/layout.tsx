import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

// Fonts are self-hosted so production builds never depend on fetching Google Fonts.
const cormorant = localFont({
  src: [
    { path: './fonts/cormorant-garamond-latin-wght-normal.woff2', weight: '300 700', style: 'normal' },
    { path: './fonts/cormorant-garamond-latin-wght-italic.woff2', weight: '300 700', style: 'italic' },
  ],
  variable: '--font-display',
  display: 'swap',
})

const jost = localFont({
  src: [{ path: './fonts/jost-latin-wght-normal.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-body',
  display: 'swap',
})

const greatVibes = localFont({
  src: [{ path: './fonts/great-vibes-latin-400-normal.woff2', weight: '400', style: 'normal' }],
  variable: '--font-bela-yasmine',
  display: 'swap',
})

const montserrat = localFont({
  src: [
    { path: './fonts/montserrat-latin-wght-normal.woff2', weight: '100 900', style: 'normal' },
    { path: './fonts/montserrat-latin-wght-italic.woff2', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-montserrat',
  display: 'swap',
})

const poppins = localFont({
  src: [
    { path: './fonts/poppins-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/poppins-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/poppins-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/poppins-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-glacial-indifference',
  display: 'swap',
})

const APP_ORIGIN = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` ||
  'https://v0-cetakfotodibali.vercel.app'
).replace(/\/$/, '')

const DEFAULT_OG_IMAGE = `${APP_ORIGIN}/undangan.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(APP_ORIGIN),
  title: 'Undangan Pernikahan Online',
  description: 'Buka undangan pernikahan online yang elegan dan personal.',
  openGraph: {
    title: 'Undangan Pernikahan Online',
    description: 'Buka undangan pernikahan online yang elegan dan personal.',
    url: APP_ORIGIN,
    siteName: 'Undangan Pernikahan',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        secureUrl: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Thumbnail Undangan Pernikahan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Undangan Pernikahan Online',
    description: 'Buka undangan pernikahan online yang elegan dan personal.',
    images: [DEFAULT_OG_IMAGE],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`bg-background ${cormorant.variable} ${jost.variable} ${greatVibes.variable} ${montserrat.variable} ${poppins.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
