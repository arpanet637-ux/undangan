'use client'

import { useSlideshow } from './slideshow-context'

/**
 * Renders two fixed layers behind the 6 lower sections:
 *   Layer 1 (-z-30): crossfading photo background, fixed full-screen
 *   Layer 2 (-z-20): solid dark overlay, fixed full-screen
 *
 * Rendered ONCE in the parent wrapper inside template-b.tsx.
 * Sections themselves must be bg-transparent with no overflow-hidden.
 */
export function SectionBackground({ overlayOpacity = 0.78 }: { overlayOpacity?: number }) {
  const { currentPhoto, nextPhoto, isTransitioning, photos } = useSlideshow()

  return (
    <>
      {/* Layer 1 — fixed photo background */}
      <div
        className="fixed inset-0 w-full h-screen pointer-events-none z-0"
      >
        {currentPhoto ? (
          <>
            {/* Current photo */}
            <img
              key={`cur-${currentPhoto}`}
              src={currentPhoto}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 1.5s cubic-bezier(0.4,0,0.2,1)',
                willChange: 'opacity',
              }}
            />
            {/* Next photo — fades in during transition */}
            {photos.length > 1 && nextPhoto && (
              <img
                key={`nxt-${nextPhoto}`}
                src={nextPhoto}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: isTransitioning ? 1 : 0,
                  transition: 'opacity 1.5s cubic-bezier(0.4,0,0.2,1)',
                  willChange: 'opacity',
                }}
              />
            )}
          </>
        ) : (
          /* Fallback when no gallery photos exist */
          <div className="absolute inset-0 w-full h-full bg-neutral-950" />
        )}
      </div>

      {/* Layer 2 — fixed dark overlay */}
      <div
        className="fixed inset-0 w-full h-screen pointer-events-none z-10"
        style={{ background: `rgba(0,0,0,${overlayOpacity})` }}
      />
    </>
  )
}
