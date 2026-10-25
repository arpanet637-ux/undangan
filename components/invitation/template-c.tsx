'use client'

import { useRef } from 'react'
import { TemplateCGuestOpening } from './template-c-guest-opening'
import { TemplateCOpeningText } from './template-c-opening-text'
import { TemplateCParticipants } from './template-c-participants'
import { getTemplateCParticipants } from './template-c-data'
import { TemplateCEvents } from './template-c-events'
import { GallerySection } from './gallery-section'
import { VideoSection } from './video-section'
import { TemplateCWishes } from './template-c-wishes'
import { GiftSection } from './gift-section'
import { ClosingSection } from './closing-section'
import { TemplateCClosing } from './template-c-closing'
import { FloatingMusic } from './floating-music'
import { TemplateCPhotoBackground } from './template-c-photo-background'
import { TemplateCScrollFade } from './template-c-scroll-fade'
import { SlideshowProvider } from './slideshow-context'
import { TemplateCPhotoSlideshow } from './template-c-photo-slideshow'
import { TemplateCCountdown } from './template-c-countdown'

interface WeddingData {
  wedding: {
    id: number
    slug: string
    groomName: string
    brideName: string
    title: string
    weddingDate: string | null
  }
  couple: Array<{
    id: number
    role: string
    fullName: string
    nickname: string
    photoUrl: string | null
    fatherName: string | null
    motherName: string | null
    address: string | null
    childOrder: string | null
  }>
  events: Array<{
    id: number
    eventName: string
    eventDate: string | null
    eventTime: string | null
    venueName: string | null
    venueAddress: string | null
    mapsUrl: string | null
  }>
  gallery: Array<{ id: number; photoUrl: string; caption: string | null }>
  gifts: Array<{ id: number; bankName: string; accountNumber: string; accountName: string }>
  wishes: Array<{ id: number; guestName: string; message: string; attendance: string; createdAt: string }>
  settings: Record<string, string>
}

interface Props {
  data: WeddingData
  slug: string
  guestCode?: string
  guestName?: string
  musicPlaying: boolean
  onToggleMusic: () => void
}

// Template C: Metatah invitation, visually derived from Template B.
export function TemplateC({
  data,
  slug,
  guestCode,
  guestName,
  musicPlaying,
  onToggleMusic,
}: Props) {
  const participants = getTemplateCParticipants(data.settings)

  const heroPhotos = data.settings?.hero_image
    ? data.settings.hero_image.split(',').map(s => s.trim()).filter(Boolean)
    : data.gallery.map((g) => g.photoUrl).filter(Boolean)
  
  const galleryPhotos = data.gallery.map((g) => g.photoUrl).filter(Boolean) as string[]

  return (
    <SlideshowProvider photos={galleryPhotos} cycleInterval={5000}>
      <div className="relative w-full min-h-screen bg-transparent" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, letterSpacing: '0.03em', color: '#f1f5f9' }}>
        <TemplateCPhotoBackground photos={galleryPhotos as string[]} cycleInterval={4000} transitionDuration={1400} />

        <TemplateCScrollFade>
          <TemplateCGuestOpening
            participants={participants}
            weddingDate={data.events[0]?.eventDate ?? data.wedding.weddingDate}
            photos={[]}
            opened
          />
        </TemplateCScrollFade>
        <TemplateCScrollFade>
          <TemplateCOpeningText settings={data.settings} />
        </TemplateCScrollFade>
        <TemplateCScrollFade>
          <TemplateCParticipants participants={participants} />
        </TemplateCScrollFade>

        <main className="relative z-20 w-full bg-transparent">
          <TemplateCScrollFade><TemplateCPhotoSlideshow photos={galleryPhotos.length ? galleryPhotos : heroPhotos} /></TemplateCScrollFade>
          <TemplateCScrollFade><TemplateCCountdown eventDate={data.events[0]?.eventDate} eventTime={data.events[0]?.eventTime} /></TemplateCScrollFade>
          <TemplateCScrollFade><TemplateCEvents events={data.events} /></TemplateCScrollFade>
          <TemplateCScrollFade><GallerySection data={data} gallery={galleryPhotos} /></TemplateCScrollFade>
          <TemplateCScrollFade><VideoSection url={data.settings?.video_url} /></TemplateCScrollFade>
          <TemplateCScrollFade><TemplateCWishes slug={slug} wishes={data.wishes} /></TemplateCScrollFade>
          <TemplateCScrollFade><GiftSection data={data} gallery={galleryPhotos} occasionLabel="Hadiah Metatah" /></TemplateCScrollFade>
          <TemplateCScrollFade><TemplateCClosing participants={participants} settings={data.settings} /></TemplateCScrollFade>
        </main>

        {data.settings?.music_url && (
          <FloatingMusic playing={musicPlaying} onToggle={onToggleMusic} />
        )}
      </div>
    </SlideshowProvider>
  )
}
