'use client'

import { MapPin } from 'lucide-react'

interface EventEntry {
  id: number
  eventName: string
  eventDate: string | null
  eventTime: string | null
  venueName: string | null
  venueAddress: string | null
  mapsUrl: string | null
}

export function TemplateCEvents({ events }: { events: EventEntry[] }) {
  const event = events.find((item) => item.eventName || item.eventDate || item.eventTime || item.venueName || item.venueAddress || item.mapsUrl)
  if (!event) return null

  const date = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <section className="relative px-6 py-12 sm:px-10 sm:py-16" style={{ fontFamily: "'Jost', sans-serif" }}>
      <div className="mx-auto max-w-2xl pb-8 text-left sm:pb-10">
        {event.eventName && (
          <h2 className="mb-4 text-xl font-bold uppercase leading-tight tracking-[0.14em] text-white sm:text-2xl">
            {event.eventName}
          </h2>
        )}
        {date && (
          <p className="text-sm font-bold uppercase leading-6 tracking-[0.1em] text-white sm:text-base">
            {date}
          </p>
        )}
        {event.eventTime && (
          <p className="mt-0.5 text-sm font-bold uppercase leading-6 tracking-[0.1em] text-white sm:text-base">
            {event.eventTime}
          </p>
        )}
        {(event.venueAddress || event.venueName) && (
          <p className="mt-5 max-w-lg whitespace-pre-line text-sm leading-6 tracking-[0.04em] text-white/90 sm:text-base">
            {[event.venueAddress, event.venueName].filter(Boolean).join(', ')}
          </p>
        )}
        {event.mapsUrl && (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium tracking-[0.04em] text-black transition hover:bg-white/85 sm:px-7 sm:py-3.5"
          >
            <MapPin className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            GOOGLE MAPS
          </a>
        )}
      </div>
    </section>
  )
}
