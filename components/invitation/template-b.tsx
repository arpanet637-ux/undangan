'use client'

import { useRef } from 'react'
import { HeroSectionB } from './hero-section-b'
import { OpeningTextSection } from './opening-text-section'
import { CoupleSectionB } from './couple-section-b'
import { EventsSectionB } from './events-section-b'
import { GallerySection } from './gallery-section'
import { VideoSection } from './video-section'
import { WishesSection } from './wishes-section'
import { GiftSection } from './gift-section'
import { ClosingSection } from './closing-section'
import { FloatingMusic } from './floating-music'
import { PhotoBackgroundB } from './photo-background-b'
import { SlideshowProvider } from './slideshow-context'
import { SectionBackground } from './section-background'

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

export function TemplateB({
  data,
  slug,
  guestCode,
  guestName,
  musicPlaying,
  onToggleMusic,
}: Props) {
  // Template B hero uses only the cover photo uploaded in Settings, never gallery photos.
  const normalizeRole = (role: string) => role.trim().toLowerCase()
  const groomData = data.couple.find(person => normalizeRole(person.role) === 'groom')
  const brideData = data.couple.find(person => normalizeRole(person.role) === 'bride')
  const groom = groomData || {
    id: -1,
    role: 'groom',
    fullName: data.wedding.groomName?.trim() || 'Mempelai Pria',
    nickname: '',
    photoUrl: null,
    fatherName: null,
    motherName: null,
    address: null,
    childOrder: null,
  }
  const bride = brideData || {
    id: -2,
    role: 'bride',
    fullName: data.wedding.brideName?.trim() || 'Mempelai Wanita',
    nickname: '',
    photoUrl: null,
    fatherName: null,
    motherName: null,
    address: null,
    childOrder: null,
  }
  const coupleData = [groom, bride]
  const closingData = {
    ...data,
    wedding: {
      ...data.wedding,
      groomName: groom.nickname?.trim() || groom.fullName,
      brideName: bride.nickname?.trim() || bride.fullName,
    },
  }

  const galleryPhotos = data.gallery.map((g) => g.photoUrl).filter(Boolean) as string[]
  const coverPhotos = data.settings?.hero_image
    ? data.settings.hero_image.split(',').map(s => s.trim()).filter(Boolean)
    : []
  // Prefer the uploaded cover photo; use gallery only when no cover photo exists.
  const heroPhotos = coverPhotos.length > 0 ? coverPhotos : galleryPhotos

  return (
    <SlideshowProvider photos={heroPhotos} cycleInterval={5000}>
      <div className="relative w-full min-h-screen bg-black" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, letterSpacing: '0.03em', color: '#f1f5f9' }}>
        {/* Layer 1 & 2: Fixed Photo & Dark Overlay */}
        <SectionBackground overlayOpacity={0.5} />
        {/* Fixed full-screen photo background slideshow for Hero + OpeningText + Couple */}
        <PhotoBackgroundB photos={heroPhotos as string[]} cycleInterval={7000} />

        {/* Hero + Opening + Couple use the global fixed PhotoBackgroundB above */}
        <HeroSectionB data={data} occasionLabel="The Wedding Of" />
        <OpeningTextSection data={data} />
        <CoupleSectionB data={{ ...data, couple: coupleData }} />

        {/* Layer 3: Scrollable Content Wrapper — sits above fixed background layers */}
        <main className="relative z-20 w-full bg-transparent">
          <EventsSectionB data={data} gallery={galleryPhotos} />
          <GallerySection data={data} gallery={galleryPhotos} />
          <VideoSection url={data.settings?.video_url} />
          <WishesSection slug={slug} data={data} gallery={galleryPhotos} />
          <GiftSection data={data} gallery={galleryPhotos} />
          <ClosingSection data={closingData} gallery={galleryPhotos} showFullNames />
        </main>

        {data.settings?.music_url && (
          <FloatingMusic playing={musicPlaying} onToggle={onToggleMusic} />
        )}
      </div>
    </SlideshowProvider>
  )
}
