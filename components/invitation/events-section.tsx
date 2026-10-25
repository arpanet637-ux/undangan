'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'

interface EventEntry {
  id: number
  eventName: string
  eventDate: string | null
  eventTime: string | null
  venueName: string | null
  venueAddress: string | null
  mapsUrl: string | null
}

interface Props {
  data: { events: EventEntry[] }
}

export function EventsSection({ data }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [labelVisible, setLabelVisible] = useState(true)

  const events = data.events

  useEffect(() => {
    if (events.length <= 1) return

    const interval = setInterval(() => {
      // Fade out label
      setLabelVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % events.length)
        // Fade back in
        setLabelVisible(true)
      }, 500)
    }, 4500)

    return () => clearInterval(interval)
  }, [events.length])

  if (!events.length) return null

  const active = events[currentIndex]

  const dateStr = active.eventDate
    ? new Date(active.eventDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <section className="relative w-full max-w-[430px] auto mx-auto bg-white flex flex-col items-center pt-12 pb-8 px-6 box-border font-serif text-gray-700 select-none">

      {/* Section Header */}
      <div className="text-center mb-8 w-full animate-[fadeIn_0.8s_ease_both]">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-gray-400 font-light mb-2">
          SAVE THE DATE
        </p>
        <h2 className="text-2xl font-normal tracking-wide text-gray-800">
          Waktu &amp; Tempat
        </h2>
      </div>

      {/* Single card — always rendered for the active event */}
      <div className="w-full bg-white border border-gray-200/80 rounded-sm p-7 shadow-[0_2px_15px_rgba(0,0,0,0.02)] space-y-6">

        {/* FADING: Nama acara + tanggal */}
        <div
          className="space-y-4 transition-opacity duration-500 ease-in-out"
          style={{ opacity: labelVisible ? 1 : 0 }}
        >
          <h3 className="text-xl font-normal text-gray-800 tracking-wide">
            {active.eventName}
          </h3>
          {dateStr && (
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-gray-700 flex-shrink-0" strokeWidth={1.5} />
              <span className="font-sans text-xs tracking-wider text-gray-700 font-normal">
                {dateStr}
              </span>
            </div>
          )}
        </div>

        {/* STABLE: Waktu, Lokasi, Peta */}
        <div className="space-y-4">
          {active.eventTime && (
            <div className="flex items-center space-x-4">
              <Clock className="w-5 h-5 text-gray-700 flex-shrink-0" strokeWidth={1.5} />
              <span className="font-sans text-xs tracking-wider text-gray-700 font-normal">
                {active.eventTime}
              </span>
            </div>
          )}
          {active.venueName && (
            <div className="flex items-start space-x-4">
              <MapPin className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="space-y-1.5">
                <h4 className="font-serif text-base text-gray-800 font-normal">
                  {active.venueName}
                </h4>
                {active.venueAddress && (
                  <p className="font-sans text-xs text-gray-500 font-light leading-relaxed">
                    {active.venueAddress}
                  </p>
                )}
              </div>
            </div>
          )}
          {active.mapsUrl && (
            <a
              href={active.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 font-sans text-xs text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <span>LIHAT PETA</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </a>
          )}
        </div>

        {/* Indicator dots */}
        {events.length > 1 && (
          <div className="flex justify-center gap-1.5 pt-2">
            {events.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setLabelVisible(false)
                  setTimeout(() => { setCurrentIndex(idx); setLabelVisible(true) }, 300)
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-3 bg-gray-500' : 'w-1.5 bg-gray-300'
                }`}
                aria-label={`Acara ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  )
}
