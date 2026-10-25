'use client'

import { useEffect, useRef } from 'react'
import type { MetatahParticipant } from './template-c-data'

interface Props {
  participants: MetatahParticipant[]
  settings?: Record<string, string>
}

export function TemplateCClosing({ participants, settings = {} }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        entries[0].target.classList.add('fade-in-visible')
        observer.disconnect()
      }
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const names = participants.map(p => p.nickname || p.fullName).filter(Boolean)
  const displayNames = names.length ? names.join(' • ') : 'Peserta Metatah'
  const thankYouMessage = settings.closing_message || settings.thank_you_message || 'Setiap ucapan dan doa restu yang kamu berikan, menjadi bagian indah dalam upacara kami.'

  return (
    <section ref={ref} className="closing-section-b py-24 md:py-32 px-6 text-center bg-transparent">
      <div className="relative max-w-2xl mx-auto" style={{ zIndex: 10 }}>
        <h2 className="mb-7 text-3xl font-bold uppercase tracking-[0.04em] text-white sm:text-4xl" style={{ fontFamily: "'Jost', sans-serif" }}>Thankyou!</h2>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, lineHeight: 1.55 }}>{thankYouMessage}</p>
        <h3 className="text-3xl font-bold uppercase tracking-[0.06em] text-white sm:text-5xl" style={{ fontFamily: "'Jost', sans-serif" }}>{displayNames}</h3>
        <div className="mt-20 pt-8">
          <p className="mb-5 text-white/50" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.1em' }}>Created by Cetak Foto Dibali</p>
          <nav aria-label="Kontak Cetak Foto Dibali" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs tracking-[0.12em] text-white/75" style={{ fontFamily: "'Jost', sans-serif" }}>
            <a href="https://instagram.com/cetakfotodibali" target="_blank" rel="noreferrer" className="transition hover:text-white">Instagram @cetakfotodibali</a>
            <a href="https://tiktok.com/@cetakfotodibali_" target="_blank" rel="noreferrer" className="transition hover:text-white">TikTok @cetakfotodibali_</a>
            <a href="https://wa.me/6285119309067" target="_blank" rel="noreferrer" className="transition hover:text-white">WhatsApp 0851-1930-9067</a>
          </nav>
        </div>
      </div>
    </section>
  )
}
