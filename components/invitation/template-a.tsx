'use client'

import { TemplateAWrapper } from '../templates/template-a-wrapper'

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
  musicPlaying: boolean
  onToggleMusic: () => void
  youtubeVideoId: string | null
  showYoutubePlayer: boolean
  iframeRef: React.RefObject<HTMLIFrameElement | null>
}

export function TemplateA({
  data,
  slug,
  guestCode,
  musicPlaying,
  onToggleMusic,
  youtubeVideoId,
  showYoutubePlayer,
  iframeRef,
}: Props) {
  return (
    <TemplateAWrapper
      data={data}
      slug={slug}
      guestCode={guestCode}
      musicPlaying={musicPlaying}
      onToggleMusic={onToggleMusic}
      youtubeVideoId={youtubeVideoId}
      showYoutubePlayer={showYoutubePlayer}
      iframeRef={iframeRef}
    />
  )
}
