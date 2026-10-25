import { useState, useEffect } from 'react';
import { useScrollAnimation } from './use-scroll-animation';

interface Event {
  id: number;
  name: string;
  date: string;
}

interface HeroSectionProps {
  groomNickname: string;
  brideNickname: string;
  guestName?: string;
  slideshowPhotos?: string[];
  preweddingVideoId?: string;
  onOpen?: () => void;
  events?: Event[];
}

function formatEventDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName}, ${day} ${month} ${year}`;
}

export function HeroSection({ groomNickname, brideNickname, guestName, slideshowPhotos = [], events = [] }: HeroSectionProps) {
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.1 });
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoOpacity, setPhotoOpacity] = useState(1);
  
  const groomFirst = groomNickname;
  const brideFirst = brideNickname;

  // Cycle through events with animation
  useEffect(() => {
    if (events.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentEventIndex((prev) => (prev + 1) % events.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [events.length]);

  // Photo slideshow with fade effect
  useEffect(() => {
    if (slideshowPhotos.length <= 1) return;
    
    const interval = setInterval(() => {
      // Fade out
      setPhotoOpacity(0);
      
      setTimeout(() => {
        // Change photo
        setCurrentPhotoIndex((prev) => (prev + 1) % slideshowPhotos.length);
        // Fade in
        setPhotoOpacity(1);
      }, 600);
    }, 4000);

    return () => clearInterval(interval);
  }, [slideshowPhotos.length]);

  return (
    <section className="min-h-screen bg-white relative overflow-hidden">
      {/* Background slideshow with Fading to Solid White effect */}
      {slideshowPhotos.length > 0 && (
        <div className="absolute inset-0 z-0">
          {/* Photo - full color, no transparency */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-top transition-opacity duration-1000 ease-in-out"
            style={{ 
              backgroundImage: `url(${slideshowPhotos[currentPhotoIndex]})`,
              opacity: photoOpacity
            }}
          />
          {/* Dark gradient overlay for text readability */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.1) 50%, transparent 60%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,0.85) 90%, rgba(255,255,255,1) 100%)'
            }}
          />
        </div>
      )}

      {/* Background pattern - subtle dots (only if no photos) */}
      {slideshowPhotos.length === 0 && (
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--charcoal)) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      )}

      {/* Main content */}
      <div 
        ref={contentRef as React.RefObject<HTMLDivElement>}
        className="relative z-10 min-h-screen flex flex-col items-center justify-start px-6 pt-[12vh] md:pt-[14vh]"
      >
        {/* Center content - 4 layer typography */}
        <div className="text-center">
          {/* Layer 0 - Guest name */}
          {guestName && (
            <div className={`mb-6 md:mb-8 transition-all duration-700 delay-100 ${
              contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <span 
                className="font-body text-white/60 drop-shadow-sm"
                style={{ 
                  fontSize: '11px',
                  letterSpacing: '2px'
                }}
              >
                Kepada Yth.
              </span>
              <p 
                className="font-display text-white drop-shadow-md mt-1"
                style={{ 
                  fontSize: 'clamp(18px, 4vw, 24px)',
                  fontWeight: 400
                }}
              >
                {guestName}
              </p>
            </div>
          )}

          {/* Layer 1 - THE WEDDING OF */}
          <div className={`mb-10 md:mb-14 transition-all duration-700 delay-200 ${
            contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <span 
              className="font-body uppercase text-white/70 drop-shadow-sm"
              style={{ 
                fontSize: '10px',
                letterSpacing: '3px'
              }}
            >
              THE WEDDING OF
            </span>
          </div>

          {/* Layer 2 - Names (Ariyasa & Putri style) */}
          <div className={`mb-8 md:mb-10 transition-all duration-700 delay-400 ${
            contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h1 
              className="font-display text-white drop-shadow-lg"
              style={{ 
                fontSize: 'clamp(36px, 8vw, 42px)',
                fontWeight: 400,
                letterSpacing: '1px'
              }}
            >
              {groomFirst} <span className="italic">&</span> {brideFirst}
            </h1>
          </div>

          {/* Layer 3 - Event date */}
          {events.length > 0 && (
            <div className={`transition-all duration-700 delay-600 ${
              contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
                {/* Event name */}
                <p 
                  className="font-body uppercase text-white/60 drop-shadow-sm mb-2"
                  style={{ 
                    fontSize: '11px',
                    letterSpacing: '3px'
                  }}
                >
                  {events[currentEventIndex]?.name}
                </p>
                {/* Event date */}
                <p 
                  className="font-body uppercase text-white/80 drop-shadow-md"
                  style={{ 
                    fontSize: '16px',
                    letterSpacing: '2px'
                  }}
                >
                  {formatEventDateFull(events[currentEventIndex]?.date)}
                </p>
              </div>
              
              {/* Event indicators */}
              {events.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {events.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentEventIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom scroll hint */}
        <div className={`absolute bottom-8 flex flex-col items-center transition-all duration-700 delay-700 ${
          contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <span className="text-[9px] tracking-[0.2em] text-white/40 font-body uppercase mb-2">
            Scroll
          </span>
          <div className="w-px h-6 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
