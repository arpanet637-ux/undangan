'use client'

import './template-a-styles.css'
import { useRef } from 'react'
import { HeroSection } from './template-a/hero-a'
import { OpeningTextSection } from './template-a/opening-text-a'
import { CoupleSection } from './template-a/couple-a'
import { EventsSection } from './template-a/events-a'
import { GallerySection } from './template-a/gallery-a'
import { VideoSection } from '../invitation/video-section'
import { WishesSection } from './template-a/wishes-a'
import { GiftSection } from './template-a/gift-a'
import { ClosingSection } from './template-a/closing-a'
import { FloatingMusic } from '../invitation/floating-music'

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

export function TemplateAWrapper({
  data,
  slug,
  guestCode,
  guestName,
  musicPlaying,
  onToggleMusic,
}: Props) {
  const normalizeRole = (role: string) => role.trim().toLowerCase()
  const groomData = data.couple.find(p => normalizeRole(p.role) === 'groom')
  const brideData = data.couple.find(p => normalizeRole(p.role) === 'bride')
  const groomName = data.wedding.groomName?.trim() || groomData?.fullName?.trim() || 'Mempelai Pria'
  const brideName = data.wedding.brideName?.trim() || brideData?.fullName?.trim() || 'Mempelai Wanita'

  // Transform data to match component APIs
  // Get hero images from settings, fallback to gallery
  const heroPhotos = data.settings?.hero_image
    ? data.settings.hero_image.split(',').map(s => s.trim()).filter(Boolean)
    : data.gallery.map(g => g.photoUrl).filter(Boolean)
  
  const heroProps = {
    groomNickname: groomData?.nickname?.trim() || groomName.split(' ')[0],
    brideNickname: brideData?.nickname?.trim() || brideName.split(' ')[0],
    slideshowPhotos: heroPhotos as string[],
    events: data.events.map(e => ({
      id: e.id,
      name: e.eventName,
      date: e.eventDate || ''
    }))
  }

  const coupleProps = {
    groom: groomData ? {
      nickname: groomData.nickname,
      fullName: groomData.fullName,
      fatherName: groomData.fatherName || '',
      motherName: groomData.motherName || '',
      photo: groomData.photoUrl || undefined,
      childOrder: groomData.childOrder || undefined,
      address: groomData.address || undefined
    } : {
      nickname: '',
      fullName: groomName,
      fatherName: '',
      motherName: '',
      photo: undefined,
      childOrder: undefined,
      address: undefined
    },
    bride: brideData ? {
      nickname: brideData.nickname,
      fullName: brideData.fullName,
      fatherName: brideData.fatherName || '',
      motherName: brideData.motherName || '',
      photo: brideData.photoUrl || undefined,
      childOrder: brideData.childOrder || undefined,
      address: brideData.address || undefined
    } : {
      nickname: '',
      fullName: brideName,
      fatherName: '',
      motherName: '',
      photo: undefined,
      childOrder: undefined,
      address: undefined
    }
  }

  const eventsProps = {
    events: data.events.map(e => ({
      id: e.id,
      name: e.eventName,
      description: '',
      date: e.eventDate || '',
      startTime: e.eventTime || '',
      endTime: undefined,
      venue: e.venueName || '',
      address: e.venueAddress || '',
      mapsUrl: e.mapsUrl || undefined
    }))
  }

  const galleryProps = {
    images: data.gallery.map(g => ({
      id: g.id,
      url: g.photoUrl,
      caption: g.caption || undefined
    }))
  }

  const wishesProps = {
    wishes: data.wishes.map(w => ({
      id: w.id,
      guestName: w.guestName,
      message: w.message,
      createdAt: w.createdAt
    })),
    weddingSlug: slug
  }

  const giftProps = {
    bankAccounts: data.gifts.map(g => ({
      id: g.id,
      bankName: g.bankName,
      accountNumber: g.accountNumber,
      accountHolder: g.accountName
    }))
  }

  const closingProps = {
    groomName,
    brideName,
    closingText: data.settings?.closing_text || undefined
  }

  return (
    <div className="template-a-scope isolate bg-white min-h-screen">
      <HeroSection {...heroProps} />
      <OpeningTextSection
        openingText={
          data.settings?.opening_text ||
          data.settings?.opening_quote ||
          'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.'
        }
      />
      <CoupleSection {...coupleProps} />
      <EventsSection {...eventsProps} />
      <GallerySection {...galleryProps} />
      <VideoSection url={data.settings?.video_url} />
      <WishesSection {...wishesProps} />
      <GiftSection {...giftProps} />
      <ClosingSection {...closingProps} />

      {data.settings?.music_url && (
        <FloatingMusic playing={musicPlaying} onToggle={onToggleMusic} />
      )}
    </div>
  )
}
