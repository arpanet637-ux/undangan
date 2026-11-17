import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost, Great_Vibes, Montserrat, Poppins } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bela-yasmine',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
