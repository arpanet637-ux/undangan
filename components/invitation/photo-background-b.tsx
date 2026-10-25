'use client'

import { useState, useEffect } from 'react'

interface Props {
  photos: string[]
  cycleInterval?: number
}

export function PhotoBackgroundB({ photos, cycleInterval = 7000 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (photos.length <= 1) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setNextIndex((currentIndex + 1) % photos.length)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length)
        setIsTransitioning(false)
      }, 2000)
    }, cycleInterval)

    return () => clearInterval(interval)
  }, [photos.length, cycleInterval, currentIndex])

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-transparent" />
      </div>
    )
  }

  const currentPhoto = photos[currentIndex]
  const nextPhoto = photos[nextIndex] || photos[0]

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Transparent base keeps the cover photo at full brightness before the 25% overlay. */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Current photo */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${currentPhoto})`,
            transform: 'scale(1.05)',
            animation: 'slowZoom 15s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Next photo for crossfade */}
      {photos.length > 1 && (
        <div
          className="absolute inset-0"
          style={{
            opacity: isTransitioning ? 1 : 0,
            transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${nextPhoto})`,
              transform: 'scale(1.05)',
            }}
          />
        </div>
      )}

      {/* Template B's shared 30% overlay is applied by SectionBackground. */}

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1.05); }
          to   { transform: scale(1.12); }
        }
      `}</style>
    </div>
  )
}
