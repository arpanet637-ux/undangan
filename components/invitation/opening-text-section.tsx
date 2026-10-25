'use client'

import { useRef, useEffect, useState } from 'react'

interface Props {
  data: { settings: Record<string, string> }
}

export function OpeningTextSection({ data }: Props) {
  const { settings } = data
  const quote = settings?.opening_quote || settings?.opening_text || 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.'
  const source = settings?.opening_quote_source || 'QS. Ar-Rum: 21'
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative py-20 md:py-28 px-6 overflow-hidden" style={{ zIndex: 10 }}>
      {/* Subtle top/bottom fade so text stays readable over the shared background */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" style={{ zIndex: 1 }} />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" style={{ zIndex: 1 }} />

      <div
        ref={ref}
        className="relative max-w-2xl mx-auto text-center"
        style={{
          zIndex: 10,
          transition: 'opacity 0.7s ease, transform 0.7s ease',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(32px)',
        }}
      >
        <div className="w-20 h-px bg-white/30 mx-auto mb-12" />

        <blockquote
          className="leading-relaxed mb-8"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.9,
            letterSpacing: '0.02em',
          }}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>

        <cite
          className="not-italic uppercase"
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {source}
        </cite>

        <div className="w-20 h-px bg-white/30 mx-auto mt-12" />
      </div>
    </section>
  )
}
