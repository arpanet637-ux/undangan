'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  data: any
  occasionLabel?: string
  namesOnly?: boolean
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function HeroSectionB({ data, occasionLabel, namesOnly = false }: Props) {
  const wedding = data?.wedding || {}
  const groomName = wedding.groomName || 'Groom'
  const brideName = wedding.brideName || 'Bride'
  const events = data?.events || []

  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [eventAnimating, setEventAnimating] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150)
    return () => clearTimeout(t)
  }, [])

  // Cycle through events
  useEffect(() => {
    if (events.length <= 1) return
    const interval = setInterval(() => {
      setEventAnimating(true)
      setTimeout(() => {
        setCurrentEventIndex((prev) => (prev + 1) % events.length)
        setEventAnimating(false)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [events.length])

  const currentEvent = events[currentEventIndex]

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col justify-end items-center" style={{ zIndex: 10 }}>

      {/* Hero-only black overlay at 30% over the shared background. */}
      <div className="absolute inset-0 z-0 bg-black/30 pointer-events-none" />
      {/* Hero-only vignette and bottom fade over Template B's shared background. */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 115% 105% at 50% 50%, transparent 45%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.28) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center pb-20 px-6 w-full flex flex-col items-center"
        style={{ transition: 'all 1s ease', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
      >
        <p className="text-white/70 uppercase mb-4" style={{ fontSize: '0.6rem', letterSpacing: '0.4em', fontFamily: "'Jost', sans-serif", fontWeight: 400 }}>
          {occasionLabel || 'The Wedding Of'}
        </p>

        <h1 className="text-white mb-5" style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: 'clamp(3rem, 12vw, 5.5rem)',
          fontWeight: 400,
          lineHeight: 1.2,
          textShadow: '2px 4px 12px rgba(0,0,0,0.6)',
          letterSpacing: '0.02em',
        }}>
          {namesOnly ? (
            groomName
          ) : (
            <>
              <span className="block">{groomName}</span>
              <span className="block" style={{ fontSize: '0.72em', lineHeight: 0.8, margin: '0.12em 0' }}>&amp;</span>
              <span className="block">{brideName}</span>
            </>
          )}
        </h1>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-5">
          <div className="h-px bg-white/30" style={{ width: 56 }} />
          <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
          <div className="h-px bg-white/30" style={{ width: 56 }} />
        </div>

        {/* Cycling event date */}
        {currentEvent && (
          <p
            className="text-white/80 uppercase tracking-widest mb-10"
            style={{
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 400,
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              opacity: eventAnimating ? 0 : 1,
              transform: eventAnimating ? 'translateY(-4px)' : 'translateY(0)',
            }}
          >
            {currentEvent.eventDate ? formatEventDate(currentEvent.eventDate) : (wedding.weddingDate || '')}
          </p>
        )}

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-2" style={{ opacity: 0.6 }}>
          <span style={{ fontSize: '0.5rem', letterSpacing: '0.2em', fontFamily: "'Jost', sans-serif", color: 'white' }}>SCROLL</span>
          <div className="w-px bg-white" style={{ height: 30 }} />
        </div>
      </div>
    </section>
  )
}
