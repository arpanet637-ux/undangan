'use client'

import { useState, useEffect } from 'react'

interface Props {
  photos: string[]
  cycleInterval?: number
  transitionDuration?: number
}

// Template C only: fixed-position photo background with a crossfade timed so
// the fade always finishes before the next cycle starts, avoiding the
// "patah-patah" jump caused when transitionDuration >= cycleInterval.
export function TemplateCPhotoBackground({ photos, cycleInterval = 4000, transitionDuration = 1400 }: Props) {
  const safeTransitionDuration = Math.min(transitionDuration, Math.max(cycleInterval - 400, 400))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (photos.length <= 1) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setNextIndex((currentIndex + 1) % photos.length)

      const timeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length)
        setIsTransitioning(false)
      }, safeTransitionDuration)

      return () => clearTimeout(timeout)
    }, cycleInterval)

    return () => clearInterval(interval)
  }, [photos.length, cycleInterval, safeTransitionDuration, currentIndex])

  if (photos.length === 0) {
    return (
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black" />
      </div>
    )
  }

  const currentPhoto = photos[currentIndex]
  const nextPhoto = photos[nextIndex] || photos[0]

  return (
    <div className="template-c-photo-background fixed inset-0 z-0 h-dvh w-full overflow-hidden">
      {/* Base black layer */}
      <div className="absolute inset-0 bg-black" />

      {/* Current photo */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: `opacity ${safeTransitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{
            backgroundImage: `url(${currentPhoto})`,
          }}
        />
      </div>

      {/* Next photo for crossfade */}
      {photos.length > 1 && (
        <div
          className="absolute inset-0"
          style={{
            opacity: isTransitioning ? 1 : 0,
            transition: `opacity ${safeTransitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
            style={{
              backgroundImage: `url(${nextPhoto})`,
            }}
          />
        </div>
      )}

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 20%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.2) 80%, rgba(0,0,0,0.3) 100%)',
        }}
      />


      {/* Top gradient */}
      <div
        className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.22) 20%, rgba(0,0,0,0.14) 40%, rgba(0,0,0,0.07) 60%, rgba(0,0,0,0.02) 80%, transparent 100%)',
        }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-72 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.17) 40%, rgba(0,0,0,0.09) 60%, rgba(0,0,0,0.03) 80%, transparent 100%)',
        }}
      />

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .template-c-photo-background * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
