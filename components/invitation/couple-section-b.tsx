'use client'

import { useState, useEffect, useRef } from 'react'

interface CoupleEntry {
  role: string
  fullName: string
  nickname: string
  photoUrl: string | null
  fatherName: string | null
  motherName: string | null
  address: string | null
  childOrder: string | null
  instagramHandle?: string
}

interface Props {
  data: { couple: CoupleEntry[] }
}

function PersonCardB({ person }: { person: CoupleEntry }) {
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

  const isGroom = person.role === 'groom'

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '90vh', zIndex: 10 }}
    >
      {/* Photo background */}
      {person.photoUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${person.photoUrl}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}

      {/* Multi-layer dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(0,0,0,0.5) 0%,
            rgba(0,0,0,0.3) 15%,
            rgba(0,0,0,0.15) 30%,
            transparent 45%,
            transparent 55%,
            rgba(0,0,0,0.2) 65%,
            rgba(0,0,0,0.4) 80%,
            rgba(0,0,0,0.7) 95%,
            rgba(0,0,0,0.8) 100%
          )`,
        }}
      />
      {/* Soft vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Content — pinned to bottom */}
      <div
        ref={ref}
        className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 px-6"
      >
        <span
          className="uppercase text-white/70 mb-4"
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.35em',
            fontFamily: "'Jost', sans-serif",
            fontWeight: 400,
            transition: 'all 0.7s ease 0.1s',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          {isGroom ? 'Mempelai Pria' : 'Mempelai Wanita'}
        </span>

        <h3
          className="text-white text-center mb-4"
          style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: 'clamp(2.5rem, 10vw, 4.5rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
            transition: 'all 0.7s ease 0.2s',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          {person.fullName}
        </h3>

        <div
          className="text-center space-y-1 mb-6"
          style={{
            transition: 'all 0.7s ease 0.3s',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          {person.childOrder && (
            <p className="text-sm text-white/60 italic" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
              {person.childOrder}
            </p>
          )}
          <p className="text-sm text-white/50" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
            {person.fatherName} {person.motherName ? `& ${person.motherName}` : ''}
          </p>
        </div>

        {person.instagramHandle && (
          <a
            href={`https://instagram.com/${person.instagramHandle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-sm border border-white/20 rounded-full transition-all duration-300 hover:bg-white/20 group"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.8)',
              transition: 'all 0.7s ease 0.4s',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>{person.instagramHandle}</span>
          </a>
        )}
      </div>
    </section>
  )
}

export function CoupleSectionB({ data }: Props) {
  const { couple } = data
  const groom = couple.find(p => p.role === 'groom')
  const bride = couple.find(p => p.role === 'bride')

  return (
    <>
      {groom && <PersonCardB person={groom} />}
      {bride && <PersonCardB person={bride} />}
    </>
  )
}
