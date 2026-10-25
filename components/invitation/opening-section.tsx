'use client'

import { ChevronDown, Heart } from 'lucide-react'

interface Props {
  data: { wedding: { groomName: string; brideName: string }; settings: Record<string, string> }
  guestName: string
  onOpen: () => void
  occasionLabel?: string
}

export function OpeningSection({ data, guestName, onOpen, occasionLabel }: Props) {
  if (!data || !data.wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
      </div>
    )
  }

  const { wedding } = data
  const coverImage = data.settings?.hero_image?.split(',')[0]?.trim()

  return (
    <div className="relative isolate w-full min-h-[100svh] mx-auto bg-slate-900 flex flex-col justify-center items-center px-5 py-14 sm:px-8 sm:py-16 box-border select-none overflow-hidden font-serif text-white">
      {coverImage && (
        <img
          src={coverImage}
          alt="Foto sampul undangan"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

      {/* Frame Corner Accents - Top Left */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-white/60 pointer-events-none z-10" />
      
      {/* Frame Corner Accents - Top Right */}
      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-white/60 pointer-events-none z-10" />
      
      {/* Frame Corner Accents - Bottom Left */}
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-white/60 pointer-events-none z-10" />
      
      {/* Frame Corner Accents - Bottom Right */}
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-white/60 pointer-events-none z-10" />

      {/* Konten Tengah */}
      <div className="flex w-full max-w-2xl flex-col items-center text-center gap-7 sm:gap-8 z-20 animate-[fadeIn_1s_ease_both]">
        
        {/* Minimal cover mark */}
        <Heart className="w-7 h-7 text-white/85 mx-auto stroke-[1.5]" aria-hidden="true" />

        {/* Nama Pasangan & Subtitle */}
        <div className="space-y-4">
          <p className="font-sans text-[10px] tracking-[0.3em] text-white/75 font-light uppercase">
            {occasionLabel || 'The Wedding of'}
          </p>
          <h1 className="text-3xl md:text-4xl font-normal tracking-[0.03em] text-white text-balance">
            {wedding.groomName}
          </h1>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm italic font-light text-white/80">&</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-[0.03em] text-white text-balance max-w-full break-words">
            {wedding.brideName}
          </h1>
        </div>

        {/* Guest Name if exists */}
        {guestName && (
          <div className="pt-2 space-y-1">
            <p className="text-xs tracking-[0.2em] text-white/70 font-sans font-light uppercase">Kepada Yth.</p>
            <p className="text-sm font-serif text-white">{guestName}</p>
          </div>
        )}

        {/* Tombol Buka Undangan */}
        <button
          onClick={onOpen}
          className="mt-6 w-full max-w-[280px] px-8 py-4 border border-slate-400 bg-transparent font-sans text-[11px] tracking-[0.28em] uppercase text-white font-semibold hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3"
        >
          Buka Undangan
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

      `}</style>
    </div>
  )
}
