'use client'

import { useState, useEffect } from 'react'

interface Props {
  data: {
    wedding: { groomName: string; brideName: string; weddingDate: string | null }
    events?: Array<{ eventName: string; eventDate: string | null }>
    settings: Record<string, string>
  }
}

export function HeroSection({ data }: Props) {
  const { wedding, settings, events } = data
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [eventVisible, setEventVisible] = useState(true)

  // Parse multiple hero images (comma-separated)
  const heroImages = settings?.hero_image
    ? settings.hero_image.split(',').map((img: string) => img.trim()).filter((img: string) => img)
    : []

  const eventList = (events && events.length > 0) ? events : []

  // Photo carousel — change every 4 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  // Event name/date rotation — fade out → swap → fade in every 4 seconds
  useEffect(() => {
    if (eventList.length <= 1) return
    const interval = setInterval(() => {
      // Fade out
      setEventVisible(false)
      setTimeout(() => {
        setCurrentEventIndex((prev) => (prev + 1) % eventList.length)
        // Fade back in
        setEventVisible(true)
      }, 600)
    }, 4000)
    return () => clearInterval(interval)
  }, [eventList.length])

  const currentEvent = eventList[currentEventIndex] || eventList[0]

  const formattedDate = currentEvent?.eventDate
    ? new Date(currentEvent.eventDate).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }).toUpperCase()
    : wedding.weddingDate
      ? new Date(wedding.weddingDate).toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        }).toUpperCase()
      : null

  return (
    <div className="relative w-full max-w-[430px] h-screen min-h-[700px] mx-auto overflow-visible flex flex-col justify-between items-center px-8 pb-8 box-border select-none">

      {/* Background Image Carousel */}
      <div className="absolute inset-0 w-full h-full">
        {heroImages.map((img: string, idx: number) => (
          <img
            key={idx}
            src={img}
            alt={`Wedding Cover ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/80 via-transparent via-50% to-white/95 to-90%" />
      <div className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none bg-gradient-to-b from-white/0 via-white/40 to-white" />

      {/* Text Content */}
      <div className="relative z-20 text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] pt-24 md:pt-28 w-full">
        <p className="font-sans text-[11px] tracking-[0.25em] uppercase opacity-90 mb-3 animate-[fadeInUp_1s_ease_0.3s_both]">
          THE WEDDING OF
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-normal my-3 tracking-wide animate-[fadeInUp_1s_ease_0.6s_both]">
          {wedding.groomName} <span className="italic">&</span> {wedding.brideName}
        </h1>

        {/* Event name & date — fade in/out when multiple events */}
        <div
          className="mt-5 transition-opacity duration-500 ease-in-out"
          style={{ opacity: eventVisible ? 1 : 0 }}
        >
          {currentEvent && (
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase opacity-80 mb-1.5">
              {currentEvent.eventName}
            </p>
          )}
          {formattedDate && (
            <p className="font-sans text-xs tracking-[0.15em] font-semibold uppercase">
              {formattedDate}
            </p>
          )}
        </div>

        {/* Indicator dots for events */}
        {eventList.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {eventList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setEventVisible(false); setTimeout(() => { setCurrentEventIndex(idx); setEventVisible(true) }, 300) }}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentEventIndex ? 'w-3 h-1.5 bg-white/90' : 'w-1.5 h-1.5 bg-white/40'
                }`}
                aria-label={`Acara ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
