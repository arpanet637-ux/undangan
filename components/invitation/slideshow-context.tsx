'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface SlideshowContextValue {
  currentPhoto: string | null
  nextPhoto: string | null
  isTransitioning: boolean
  photos: string[]
}

const SlideshowContext = createContext<SlideshowContextValue>({
  currentPhoto: null,
  nextPhoto: null,
  isTransitioning: false,
  photos: [],
})

export function SlideshowProvider({
  photos,
  cycleInterval = 5000,
  children,
}: {
  photos: string[]
  cycleInterval?: number
  children: React.ReactNode
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1 % Math.max(photos.length, 1))
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (photos.length <= 1) return

    const interval = setInterval(() => {
      const ni = (currentIndex + 1) % photos.length
      setNextIndex(ni)
      setIsTransitioning(true)

      setTimeout(() => {
        setCurrentIndex(ni)
        setIsTransitioning(false)
      }, 1500)
    }, cycleInterval)

    return () => clearInterval(interval)
  }, [photos.length, cycleInterval, currentIndex])

  return (
    <SlideshowContext.Provider
      value={{
        currentPhoto: photos[currentIndex] ?? null,
        nextPhoto: photos[nextIndex] ?? null,
        isTransitioning,
        photos,
      }}
    >
      {children}
    </SlideshowContext.Provider>
  )
}

export function useSlideshow() {
  return useContext(SlideshowContext)
}
