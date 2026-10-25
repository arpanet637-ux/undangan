'use client'

import { useState, useRef, useEffect } from 'react'
import { Copy, Check, Gift } from 'lucide-react'

interface GiftEntry {
  id: number
  bankName: string
  accountNumber: string
  accountName: string
}

interface Props {
  data: { gifts: GiftEntry[]; gallery?: Array<{ photoUrl: string }> }
  gallery?: string[]
  occasionLabel?: string
}

function GiftCard({ gift }: { gift: GiftEntry }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(gift.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="flex-1 relative p-8 border border-white/10 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/30" />

      <p
        className="uppercase text-white/40 mb-4"
        style={{ fontSize: '0.65rem', letterSpacing: '0.2em', fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
      >
        {gift.bankName}
      </p>

      <div className="flex items-center justify-between gap-4 mb-4">
        <p
          className="text-white tracking-wider"
          style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}
        >
          {gift.accountNumber}
        </p>
        <button
          onClick={copy}
          className="p-2.5 rounded-full hover:bg-white/20 transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          title="Salin nomor rekening"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white/60" />}
        </button>
      </div>

      <p
        className="text-white/50"
        style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '0.85rem' }}
      >
        a.n. <span className="text-white">{gift.accountName}</span>
      </p>
    </div>
  )
}

export function GiftSection({ data, gallery, occasionLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  if (!data.gifts.length) return null

  return (
    <section
      ref={ref}
      className="gift-section-b py-16 md:py-24 bg-transparent"
    >
      <div
        className="container mx-auto px-8 md:px-16 relative"
        style={{ zIndex: 10 }}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-white/20 mb-6"
          >
            <Gift className="w-6 h-6 text-white/70" />
          </div>
          <h2
            className="text-white mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 400 }}
          >
            {occasionLabel || 'Wedding Gift'}
          </h2>
          <p
            className="text-white/50 max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '0.85rem' }}
          >
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami
          </p>
        </div>

        {/* Bank account cards */}
        <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto">
          {data.gifts.map(g => <GiftCard key={g.id} gift={g} />)}
        </div>
      </div>
    </section>
  )
}
