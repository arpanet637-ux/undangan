'use client'

import { useEffect, useRef, useState } from 'react'
import { UserRound } from 'lucide-react'
import type { MetatahParticipant } from './template-c-data'

export function TemplateCParticipants({ participants }: { participants: MetatahParticipant[] }) {
  if (participants.length === 0) {
    return <section className="relative w-full py-16 sm:py-24 px-6 sm:px-10"><p className="text-center text-white/50">Belum ada peserta yang ditambahkan</p></section>
  }

  return (
    <section className="relative z-20 w-full bg-transparent px-6 py-16 sm:px-10 sm:py-24">
      <style>{`@keyframes templateCFadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {participants.map((participant, index) => <TemplateCParticipantCard key={participant.id} participant={participant} index={index} />)}
        </div>
      </div>
    </section>
  )
}

function normalizeInstagramUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function TemplateCParticipantCard({ participant, index }: { participant: MetatahParticipant; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.unobserve(entry.target) }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <article
      ref={ref}
      className="group mx-auto w-full max-w-sm overflow-hidden rounded-none text-left text-white transition-transform duration-300 hover:-translate-y-1"
      style={{ animation: visible ? `templateCFadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none' }}
    >
      <div className="relative h-[480px] w-full overflow-hidden sm:h-[560px]">
        {participant.avatar ? (
          <img src={participant.avatar} alt={participant.nickname || participant.fullName} className="h-full w-full object-cover object-top brightness-110 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/10"><UserRound className="h-12 w-12 text-white/40" aria-hidden="true" /></div>
        )}
      </div>
      <div className="px-0 py-7">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white">Mepandes</p>
        <h3 className="mb-10 text-3xl font-semibold leading-tight tracking-[0.08em] text-white sm:text-4xl" style={{ fontFamily: "'Jost', sans-serif" }}>{participant.fullName}</h3>
        <p className="max-w-xs text-base font-light leading-relaxed tracking-[0.08em] text-white/90" style={{ fontFamily: "'Jost', sans-serif" }}>{participant.parentName || 'Nama orang tua belum diisi'}</p>
        {participant.instagramUrl && (
          <a href={normalizeInstagramUrl(participant.instagramUrl)} target="_blank" rel="noreferrer" aria-label={`Buka Instagram ${participant.fullName}`} className="mt-7 inline-flex rounded-full bg-white px-7 py-3 text-sm tracking-[0.08em] text-black transition-transform hover:scale-105">
            Instagram
          </a>
        )}
      </div>
    </article>
  )
}
