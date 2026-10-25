'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { useScrollAnimation } from './use-scroll-animation';

interface GalleryImage {
  id: number;
  url: string;
  caption?: string;
}

interface GallerySectionProps {
  images: GalleryImage[];
}

export function GallerySection({ images }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation({ threshold: 0.3 });
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => setMounted(true), []);

  // Reset zoom whenever the selected image changes
  useEffect(() => setIsZoomed(false), [selectedImage]);

  const downloadPhoto = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'galeri.jpg';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  // Lock page scroll while the lightbox is open
  useEffect(() => {
    if (!selectedImage) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [selectedImage]);

  if (!images.length) return null;

  // All thumbnails same size
  const getImageClass = () => {
    return 'col-span-1 row-span-1';
  };

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-8 md:px-16">
        {/* Section title - left aligned */}
        <div 
          ref={titleRef as React.RefObject<HTMLDivElement>}
          className={`mb-16 transition-all duration-700 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] tracking-[0.4em] text-sage font-body uppercase">
                Our Moments
              </span>
              <h2 className="text-2xl md:text-3xl font-display text-charcoal mt-2">
                Galeri
              </h2>
            </div>
            <div className="hidden md:block w-32 h-px bg-sage/30 mb-4" />
          </div>
        </div>

        {/* Gallery grid - uniform layout */}
        <div 
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 transition-all duration-700 delay-200 ${
            gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`${getImageClass()} aspect-square group cursor-pointer overflow-hidden bg-white relative`}
              onClick={() => setSelectedImage(image.url)}
            >
              {/* Image */}
              <img
                src={image.url}
                alt={image.caption || `Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
              
              {/* Corner accent on hover */}
              <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-white/0 group-hover:border-white/80 transition-colors duration-300" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-white/0 group-hover:border-white/80 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Photo count indicator */}
        <div className="flex items-center justify-center mt-10 gap-4">
          <div className="w-12 h-px bg-sage/30" />
          <span className="text-xs tracking-[0.2em] text-charcoal/40 font-body">
            {images.length} Photos
          </span>
          <div className="w-12 h-px bg-sage/30" />
        </div>
      </div>

      {/* Lightbox - portaled to body so it escapes any transformed ancestor
          and stays fixed/centered to the viewport */}
      {mounted && selectedImage && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-charcoal/95 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
            <button
              className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed((z) => !z);
              }}
              aria-label={isZoomed ? 'Perkecil foto' : 'Perbesar foto'}
            >
              {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
            </button>
            <button
              className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                downloadPhoto(selectedImage);
              }}
              aria-label="Unduh foto"
            >
              <Download className="w-6 h-6" />
            </button>
            <button
              className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110"
              onClick={() => setSelectedImage(null)}
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <img
            src={selectedImage}
            alt="Gallery preview"
            className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed((z) => !z);
            }}
          />
        </div>,
        document.body
      )}
    </section>
  );
}
