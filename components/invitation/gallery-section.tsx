'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react'

interface Props {
  data: { gallery: Array<{ id: number; photoUrl: string; caption: string | null }> }
  gallery?: string[]
}

export function GallerySection({ data, gallery }: Props) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // Reset zoom whenever the visible photo changes
  useEffect(() => setIsZoomed(false), [currentPhotoIndex])

  const downloadPhoto = async (url: string, index: number) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `galeri-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  // Lock page scroll while the lightbox is open
  useEffect(() => {
    if (currentPhotoIndex === null) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [currentPhotoIndex])

  const currentPhoto = currentPhotoIndex !== null ? data.gallery[currentPhotoIndex] : null
  
  const openLightbox = (index: number) => {
    setIsClosing(false)
    setCurrentPhotoIndex(index)
  }

  const closeLightbox = () => {
    setIsClosing(true)
    setTimeout(() => setCurrentPhotoIndex(null), 300)
  }

  const goToPrevious = () => {
    if (currentPhotoIndex !== null && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentPhotoIndex !== null && currentPhotoIndex < data.gallery.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  if (!data.gallery.length) return null

  return (
    <section
      ref={ref}
      className="gallery-section-b py-16 md:py-24 px-6 bg-transparent"
    >
      <div className="relative max-w-5xl mx-auto" style={{ zIndex: 10 }}>
        {/* Title */}
        <div className="text-center mb-12">
          <span
            className="uppercase text-white/60"
            style={{ fontSize: '0.6rem', letterSpacing: '0.4em', fontFamily: "'Jost', sans-serif", fontWeight: 400 }}
          >
            Our Moments
          </span>
          <h2
            className="text-white mt-3"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 400 }}
          >
            Galeri
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
          {data.gallery.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="overflow-hidden group relative aspect-square"
            >
              <img
                src={photo.photoUrl}
                alt={photo.caption || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox with animations and navigation - portaled to body so it
          escapes any transformed ancestor and stays fixed to the viewport */}
      {mounted && currentPhoto && createPortal(
        <div
          className={`fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 transition-all duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={closeLightbox}
        >
          {/* Toolbar: zoom + download + close */}
          <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
            <button
              className="text-white/70 hover:text-white transition-all hover:scale-110"
              onClick={(e) => {
                e.stopPropagation()
                setIsZoomed((z) => !z)
              }}
              aria-label={isZoomed ? 'Perkecil foto' : 'Perbesar foto'}
            >
              {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
            </button>
            <button
              className="text-white/70 hover:text-white transition-all hover:scale-110"
              onClick={(e) => {
                e.stopPropagation()
                downloadPhoto(currentPhoto.photoUrl, currentPhotoIndex!)
              }}
              aria-label="Unduh foto"
            >
              <Download className="w-6 h-6" />
            </button>
            <button
              className="text-white/70 hover:text-white transition-colors hover:scale-110"
              onClick={(e) => {
                e.stopPropagation()
                closeLightbox()
              }}
              aria-label="Tutup"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {/* Main photo - larger */}
          <img
            src={currentPhoto.photoUrl}
            alt={currentPhoto.caption || ''}
            className={`max-w-4xl max-h-[80vh] w-full h-full object-contain transition-all duration-300 ${
              isClosing 
                ? 'scale-75 opacity-0' 
                : `opacity-100 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`
            }`}
            onClick={(e) => {
              e.stopPropagation()
              setIsZoomed((z) => !z)
            }}
          />

          {/* Previous button */}
          {currentPhotoIndex! > 0 && (
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all z-20 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next button */}
          {currentPhotoIndex! < data.gallery.length - 1 && (
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all z-20 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              aria-label="Next photo"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Photo counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-body">
            {(currentPhotoIndex! + 1)} / {data.gallery.length}
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  )
}
