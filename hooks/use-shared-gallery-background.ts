'use client'

import { useState, useEffect } from 'react'

interface GalleryPhoto {
  photoUrl: string
}

export function useSharedGalleryBackground(gallery: GalleryPhoto[] = []) {
  const [currentBgPhoto, setCurrentBgPhoto] = useState<GalleryPhoto | null>(null)
  const [bgPhotoOpacity, setBgPhotoOpacity] = useState(1)
  const hasGallery = gallery.length > 0

  useEffect(() => {
    if (!hasGallery) return

    // Set initial photo
    setCurrentBgPhoto(gallery[Math.floor(Math.random() * gallery.length)])

    // Rotate through photos every 3 seconds with random selection
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * gallery.length)
      
      // Fade out
      setBgPhotoOpacity(0)
      
      // Change photo after fade out
      setTimeout(() => {
        setCurrentBgPhoto(gallery[randomIndex])
        setBgPhotoOpacity(1)
      }, 400)
    }, 3000)

    return () => clearInterval(interval)
  }, [hasGallery, gallery])

  return { currentBgPhoto, bgPhotoOpacity, hasGallery }
}
