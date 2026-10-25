'use client'

import { useEffect, useState } from 'react'

interface GalleryPhoto {
  photoUrl: string
}

export function useGalleryBackground(gallery: GalleryPhoto[] = []) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [bgPhotoOpacity, setBgPhotoOpacity] = useState(1)

  const currentBgPhoto = gallery[currentPhotoIndex]

  useEffect(() => {
    if (!gallery || gallery.length === 0) return

    const interval = setInterval(() => {
      // Fade out
      setBgPhotoOpacity(0)

      // After fade out, change photo and fade in
      setTimeout(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % gallery.length)
        setBgPhotoOpacity(1)
      }, 400) // Half of transition time
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [gallery])

  return {
    currentBgPhoto,
    bgPhotoOpacity,
    hasGallery: gallery && gallery.length > 0,
  }
}
