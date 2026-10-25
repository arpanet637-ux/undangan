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

export const metadata: Metadata = {
  title: 'Undangan Online - Wedding Invitation',
  description: 'Buat undangan pernikahan online yang elegan dan profesional',
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
