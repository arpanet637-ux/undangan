'use client'

import { useEffect, useState } from 'react'

interface Props {
  eventDate?: string | null
  eventTime?: string | null
}

function getTargetDate(eventDate?: string | null, eventTime?: string | null) {
  if (!eventDate) return null
  const time = eventTime?.match(/\d{1,2}:\d{2}/)?.[0] || '00:00'
  const target = new Date(`${eventDate}T${time}:00`)
  return Number.isNaN(target.getTime()) ? null : target
}

export function TemplateCCountdown({ eventDate, eventTime }: Props) {
  const target = getTargetDate(eventDate, eventTime)
  const [remaining, setRemaining] = useState(() => target ? Math.max(0, target.getTime() - Date.now()) : 0)

  useEffect(() => {
    if (!target) return
    const timer = window.setInterval(() => setRemaining(Math.max(0, target.getTime() - Date.now())), 1000)
    return () => window.clearInterval(timer)
  }, [target?.getTime()])

  if (!target || remaining <= 0) return null

  const seconds = Math.floor(remaining / 1000)
  const values = [
    { label: 'Hari', value: Math.floor(seconds / 86400) },
    { label: 'Jam', value: Math.floor((seconds % 86400) / 3600) },
    { label: 'Menit', value: Math.floor((seconds % 3600) / 60) },
    { label: 'Detik', value: seconds % 60 },
  ]

  return (
    <section className="relative z-20 px-5 py-10 sm:px-8 sm:py-14" aria-label="Hitungan mundur acara">
      <div className="mx-auto max-w-xs">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
          {values.map(({ label, value }, index) => (
            <div key={label} className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center border border-white/30 bg-black/30 backdrop-blur-sm sm:h-16 sm:w-16">
                  <span className="font-serif text-2xl tabular-nums text-white sm:text-3xl">
                    {String(value).padStart(2, '0')}
                  </span>
                </div>
                <span className="mt-2 text-[0.55rem] uppercase tracking-[0.22em] text-white/65">{label}</span>
              </div>
              {index < values.length - 1 && (
                <span className="-mt-4 font-serif text-xl text-white/40 sm:text-2xl">:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
