'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  slug: string
  guestCode?: string
}

export function ShareLinkSection({ slug, guestCode }: Props) {
  const [copied, setCopied] = useState(false)

  // Build the invitation link
  const invitationLink = guestCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/w/${slug}/to/${guestCode}`
    : `${typeof window !== 'undefined' ? window.location.origin : ''}/w/${slug}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }


  return (
    <section
      className="share-section-b w-full py-16 px-6 bg-transparent"
    >
      <div className="relative max-w-2xl mx-auto text-center" style={{ zIndex: 10 }}>
        <span
          className="uppercase text-white/60"
          style={{ fontSize: '0.6rem', letterSpacing: '0.4em', fontFamily: "'Jost', sans-serif", fontWeight: 400 }}
        >
          Bagikan
        </span>
        <h2
          className="text-white mt-3 mb-10"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 400 }}
        >
          Undang Teman &amp; Keluarga
        </h2>

        {/* Link display */}
        <div
          className="px-6 py-4 border border-white/10 backdrop-blur-sm mb-8"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          <p
            className="text-white/50 break-all"
            style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
          >
            {invitationLink}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-8 py-3 border border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.15em', backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="uppercase tracking-widest">{copied ? 'Tersalin!' : 'Salin Link'}</span>
          </button>

        </div>
      </div>
    </section>
  )
}
