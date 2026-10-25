'use client'

import { useRef, useEffect } from 'react'

interface Props {
  data: {
    wedding: { groomName: string; brideName: string }
    settings: Record<string, string>
    gallery?: Array<{ photoUrl: string }>
  }
  gallery?: string[]
  showFullNames?: boolean
}

export function ClosingSection({ data, gallery, showFullNames = false }: Props) {
  const { wedding, settings } = data
  const closingText = settings?.closing_text ||
    'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.'
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

  return (
    <section
      ref={ref}
      className="closing-section-b py-24 md:py-32 px-6 text-center bg-transparent"
    >
      <div
        className="relative max-w-2xl mx-auto"
        style={{ zIndex: 10 }}
      >
        <div className="w-20 h-px bg-white/30 mx-auto mb-12" />

        {/* Closing text */}
        <p
          className="leading-relaxed mb-12"
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.9,
          }}
        >
          {closingText}
        </p>

        {/* Gratitude */}
        <div className="mb-12">
          <p
            className="mb-4 text-white/40"
            style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '0.75rem' }}
          >
            Atas kehadiran dan doa restunya, kami ucapkan
          </p>
          <h3
            className="text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 400 }}
          >
            Terima Kasih
          </h3>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-6 mb-12">
          <div className="w-20 h-px bg-white/20" />
          <div className="w-3 h-3 rounded-full border border-white/30" />
          <div className="w-20 h-px bg-white/20" />
        </div>

        {/* Couple signature */}
        <div>
          <p
            className="uppercase text-white/50 mb-3"
            style={{ fontSize: '0.6rem', letterSpacing: '0.25em', fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
          >
            Kami yang berbahagia
          </p>
          <div className="flex items-center justify-center gap-3">
            <span
              className="text-white"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}
            >
              {showFullNames ? wedding.groomName : wedding.groomName.split(/\s/)[0]}
            </span>
            <span
              className="text-white/60"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
            >
              &amp;
            </span>
            <span
              className="text-white"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}
            >
              {showFullNames ? wedding.brideName : wedding.brideName.split(/\s/)[0]}
            </span>
          </div>
        </div>

        {/* Credit */}
        <div className="mt-20 pt-8 border-t border-white/10">
          <p
            className="text-white/30"
            style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.1em' }}
          >
            Created by Cetak Foto Dibali
          </p>
        </div>
      </div>
    </section>
  )
}
