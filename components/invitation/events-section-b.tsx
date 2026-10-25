'use client'

import { useState, useEffect, useRef } from 'react'
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
  data: {
    events: EventEntry[]
    wedding?: { weddingDate?: string | null }
  }
  gallery?: string[]
}

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        })
      }
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [targetDate])

  const units = [
    { value: timeLeft.days, label: 'Hari' },
    { value: timeLeft.hours, label: 'Jam' },
    { value: timeLeft.minutes, label: 'Menit' },
    { value: timeLeft.seconds, label: 'Detik' },
  ]

  return (
    <div
      ref={ref}
      className="mb-16"
      style={{ transition: 'all 0.7s ease', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)' }}
    >
      <div className="flex justify-center items-center gap-3 md:gap-6">
        {units.map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-3 md:gap-6">
            <div className="text-center">
              <div
                className="w-16 h-16 md:w-20 md:h-20 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <span
                  className="text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 400 }}
                >
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <p
                className="mt-2 uppercase text-white/50"
                style={{ fontSize: '0.6rem', letterSpacing: '0.2em', fontFamily: "'Jost', sans-serif", fontWeight: 400 }}
              >
                {unit.label}
              </p>
            </div>
            {index < units.length - 1 && (
              <span className="text-white/30 text-xl md:text-2xl font-light mb-5">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function normalizeMapUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

function EventCard({ event, index }: { event: EventEntry; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const isEven = index % 2 === 0
  const mapUrl = event.mapsUrl ? normalizeMapUrl(event.mapsUrl) : null

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        transition: `all 0.7s ease ${index * 0.1}s`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
      }}
    >
      <div className={`relative ${isEven ? 'md:ml-auto md:mr-12' : 'md:mr-auto md:ml-12'} md:max-w-lg`}>
        <div
className="relative p-8 md:p-10 border border-white/10 backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}
        >
          {/* Event name */}
          <div className="mb-6">
            <h3
              className="text-white mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 400 }}
            >
              {event.eventName}
            </h3>
            <div className="w-8 h-0.5 bg-white/40" />
          </div>

          {/* Date & Time */}
          <div className="space-y-4 mb-8">
            {event.eventDate && (
              <div className="flex items-start gap-4">
                <Calendar className="w-4 h-4 text-white/60 mt-1 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-white text-sm" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                  {formatDate(event.eventDate)}
                </p>
              </div>
            )}
            {event.eventTime && (
              <div className="flex items-start gap-4">
                <Clock className="w-4 h-4 text-white/60 mt-1 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-white text-sm" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                  {event.eventTime}
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-white/10 mb-8" />

          {/* Venue */}
          {event.venueName && (
            <div className="flex items-start gap-4">
              <MapPin className="w-4 h-4 text-white/60 mt-1 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p
                  className="text-white mb-1"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 400 }}
                >
                  {event.venueName}
                </p>
                {event.venueAddress && (
                  <p className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                    {event.venueAddress}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Map link */}
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={event => {
                // Some mobile and in-app browsers block a new tab for redirecting
                // short links. If that happens, continue in the current tab instead.
                event.preventDefault()
                const opened = window.open(mapUrl, '_blank', 'noopener,noreferrer')
                if (!opened) window.location.assign(mapUrl)
              }}
              className="inline-flex items-center gap-2 mt-6 text-white/70 text-sm hover:text-white transition-colors group"
              style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
            >
              <span>Lihat Peta</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function EventsSectionB({ data, gallery }: Props) {
  const titleRef = useRef<HTMLDivElement>(null)
  const [titleVisible, setTitleVisible] = useState(false)
  const events = data.events || []

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setTitleVisible(true); observer.disconnect() }
    }, { threshold: 0.3 })
    if (titleRef.current) observer.observe(titleRef.current)
    return () => observer.disconnect()
  }, [])

  if (!events.length) return null

  const firstEventDate = events[0]?.eventDate

  return (
    <section className="events-section-b py-16 md:py-24 bg-transparent">
      <div className="container mx-auto px-8 md:px-16 relative" style={{ zIndex: 10 }}>
        {/* Title */}
        <div
          ref={titleRef}
          className="text-center mb-12"
          style={{ transition: 'all 0.7s ease', opacity: titleVisible ? 1 : 0, transform: titleVisible ? 'translateY(0)' : 'translateY(32px)' }}
        >
          <span
            className="uppercase text-white/60"
            style={{ fontSize: '0.6rem', letterSpacing: '0.4em', fontFamily: "'Jost', sans-serif", fontWeight: 400 }}
          >
            Save The Date
          </span>
          <h2
            className="text-white mt-3"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 400 }}
          >
            Waktu &amp; Tempat
          </h2>
        </div>

        {/* Countdown */}
        {firstEventDate && <CountdownTimer targetDate={firstEventDate} />}

        {/* Event cards */}
        <div className="space-y-8 md:space-y-12">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
