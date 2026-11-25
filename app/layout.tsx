import type { Metadata, Viewport } from 'next'
// Fonts are bundled from npm (@fontsource) so builds never depend on fetching Google Fonts.
import '@fontsource-variable/cormorant-garamond/wght.css'
import '@fontsource-variable/cormorant-garamond/wght-italic.css'
import '@fontsource-variable/jost/wght.css'
import '@fontsource/great-vibes/400.css'
import '@fontsource-variable/montserrat/wght.css'
import '@fontsource-variable/montserrat/wght-italic.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './globals.css'

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
    <html lang="id" className="bg-background">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
