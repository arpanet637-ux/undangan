'use client'

import { useState, useEffect, useRef } from 'react'
import { UserRound } from 'lucide-react'

export interface Participant {
  id?: string | number
  fullName: string
  parentName: string
  photoUrl: string | null
}

interface Props {
  participants: Participant[]
}

function ParticipantCard({ participant, index }: { participant: Participant; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center group cursor-pointer transition-transform duration-500 hover:scale-105"
      style={{
        animation: visible ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none',
      }}
    >
      {/* Avatar */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 rounded-full overflow-hidden border-2 border-white/30 group-hover:border-white/60 transition-all duration-300 backdrop-blur-sm">
        {participant.photoUrl ? (
          <img
            src={participant.photoUrl}
            alt={participant.fullName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
            <UserRound className="w-9 h-9 text-white/40" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Name */}
      <h3
        className="text-base sm:text-lg font-semibold text-white mb-1"
        style={{
          fontFamily: "'Jost', sans-serif",
          fontWeight: 400,
          letterSpacing: '0.02em',
        }}
      >
        {participant.fullName}
      </h3>

      {/* Parent name */}
      <p
        className="text-xs sm:text-sm text-white/60"
        style={{
          fontFamily: "'Jost', sans-serif",
          fontWeight: 300,
          letterSpacing: '0.01em',
        }}
      >
        {participant.parentName}
      </p>
    </div>
  )
}

export function ParticipantsSection({ participants }: Props) {
  if (!participants || participants.length === 0) {
    return (
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-white/50">Belum ada peserta yang ditambahkan</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full py-16 sm:py-24 px-4 sm:px-8 bg-black/30">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Section title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2
            className="text-2xl sm:text-4xl text-white font-light mb-2"
            style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: 'clamp(1.75rem, 6vw, 3rem)',
            }}
          >
            Peserta Metatah
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="h-px w-8 bg-white/20" />
          </div>
        </div>

        {/* Grid of participants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {participants.map((participant, index) => (
            <ParticipantCard key={participant.id || index} participant={participant} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
