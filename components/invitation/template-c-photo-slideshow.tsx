'use client'

import { useEffect, useState } from 'react'

interface Props {
  photos: string[]
}

export function TemplateCPhotoSlideshow({ photos }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const validPhotos = photos.filter(Boolean)

  useEffect(() => {
    if (validPhotos.length < 2) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % validPhotos.length)
    }, 1600)
    return () => window.clearInterval(timer)
  }, [validPhotos.length])

  if (!validPhotos.length) return null

  return (
    <section className="relative z-20 overflow-hidden px-5 py-8 sm:px-8 sm:py-10" aria-label="Slideshow foto">
      <div className="mx-auto max-w-[220px] sm:max-w-[260px]">
        <div className="relative aspect-[4/5] overflow-hidden bg-black/20 shadow-2xl shadow-black/30">
          {validPhotos.map((photo, index) => (
            <img
              key={`${photo}-${index}`}
              src={photo}
              alt={`Preview foto ${index + 1}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-in-out ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true" />
          {validPhotos.length > 1 && (
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2" aria-label="Slide foto">
              {validPhotos.map((photo, index) => (
                <span key={`${photo}-dot-${index}`} className={`h-1.5 rounded-full transition-all duration-500 ${index === activeIndex ? 'w-7 bg-white' : 'w-1.5 bg-white/55'}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
