'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { OpeningSection } from './opening-section'
import { LoadingPage } from './loading-page'
import { TemplateA } from './template-a'
import { TemplateB } from './template-b'
import { TemplateC } from './template-c'
import { TemplateD } from './template-d'
import { TemplateCGuestOpening } from './template-c-guest-opening'
import { getTemplateCParticipants } from './template-c-data'
import { TemplateCPhotoBackground } from './template-c-photo-background'

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
  slug: string
  guestCode?: string
}

export function InvitationClient({ slug, guestCode }: Props) {
  const [data, setData] = useState<WeddingData | null>(null)
  const [opened, setOpened] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [guestName, setGuestName] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [musicPlaying, setMusicPlaying] = useState(false)

  // Dispose only when leaving the invitation. Scrolling, modals, slides, and
  // animations never recreate or reset this persistent audio instance.
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    setLoadError(false)

    // Some mobile networks (and in-app browsers) let a request hang forever
    // without ever resolving or erroring. Without a hard per-attempt deadline
    // the invitation spinner would then spin indefinitely instead of falling
    // through to a retry or the error state.
    const fetchWithDeadline = async (url: string, timeoutMs = 8000): Promise<Response> => {
      const timeoutId = window.setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')), timeoutMs)
      try {
        return await fetch(url, { signal: controller.signal, cache: 'no-store' })
      } finally {
        window.clearTimeout(timeoutId)
      }
    }

    const fetchWithRetry = async (url: string, attempt = 0): Promise<Response> => {
      try {
        const response = await fetchWithDeadline(url)
        if (response.ok) return response
        if (response.status >= 500 && attempt < 2) throw new Error(`Server error ${response.status}`)
        throw new Error(`Invitation request failed: ${response.status}`)
      } catch (error) {
        if (cancelled) throw error
        if (attempt >= 2) throw error
        await new Promise(resolve => window.setTimeout(resolve, 800 * (attempt + 1)))
        return fetchWithRetry(url, attempt + 1)
      }
    }

    fetchWithRetry(`/api/w/${encodeURIComponent(slug)}`)
      .then(response => response.json())
      .then(d => {
        if (!d?.wedding) throw new Error('Invitation data is incomplete')
        if (cancelled) return
        setData(d)
        if (guestCode) {
          fetchWithRetry(`/api/w/${encodeURIComponent(slug)}/guest/${encodeURIComponent(guestCode)}`)
            .then(r => r.json())
            .then(g => { if (!cancelled && g?.name) setGuestName(g.name) })
            .catch(() => {})
        }
      })
      .catch(error => {
        if (!cancelled) {
          console.error('[v0] Invitation failed after retries:', error)
          setLoadError(true)
        }
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [slug, guestCode, retryKey])

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!audio.paused) {
      audio.pause()
      setMusicPlaying(false)
    } else {
      // Try to play audio directly
      audioRef.current.muted = false
      audioRef.current.play()
        .then(() => {
          setMusicPlaying(true)
        })
        .catch((err) => {
          // If unmuted fails, try muted as fallback
          audioRef.current!.muted = true
          audioRef.current!.play()
            .then(() => {
              // Muted autoplay is allowed by browsers. Keep it playing rather
              // than resetting or using a timer to force unmute.
              setMusicPlaying(true)
            })
            .catch(() => {
              setMusicPlaying(false)
            })
        })
    }
  }, [])

  const handleOpen = () => {
    setOpened(true)
    const musicUrl = data?.settings?.music_url
    
    if (musicUrl) {
      try {
        // Create HTML5 audio element only once. Reopening or rerendering the
        // invitation must never replace the existing playback position.
        if (!audioRef.current) {
          const audio = new Audio(musicUrl)
          audio.crossOrigin = 'anonymous'
          // Keep one persistent audio element. Native looping handles the end
          // of the track without any manual restart or currentTime reset.
          audio.loop = true
          audio.volume = 0.5
          audioRef.current = audio
        }

        // Directly play audio with user gesture context
        setMusicPlaying(true)
        audioRef.current.muted = false
        audioRef.current.play()
          .catch((err) => {
            // Fallback to muted playback
            audioRef.current!.muted = true
            audioRef.current!.play()
              .then(() => {
                setMusicPlaying(true)
              })
              .catch(() => {
                setMusicPlaying(false)
              })
          })
      } catch (error) {
        // Silently fail - audio should not break the UI
      }
    }
    
    window.scrollTo({ top: 0 })
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 text-center">
        {loadError ? (
          <div className="max-w-sm text-[#1a3a52]">
            <p className="text-sm font-body">Undangan belum dapat dimuat.</p>
            <p className="mt-2 text-xs text-gray-500">Periksa koneksi internet, lalu coba lagi.</p>
            <button
              type="button"
              onClick={() => setRetryKey(value => value + 1)}
              className="mt-5 border border-[#1a3a52] px-5 py-2 text-xs tracking-widest uppercase"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" aria-label="Memuat undangan" />
        )}
      </div>
    )
  }

  if (loading) {
    const participantNames = (() => {
      try {
        const participants = JSON.parse(data.settings?.participants || '[]')
        return Array.isArray(participants)
          ? participants.map((participant: { nickname?: string; fullName?: string }) => participant.nickname || participant.fullName).filter(Boolean).join(' • ') || 'PESERTA METATAH'
          : 'PESERTA METATAH'
      } catch {
        return 'PESERTA METATAH'
      }
    })()
    return <LoadingPage isMetatah={data.settings?.template === 'template-c'} participantNames={participantNames} onLoadingComplete={() => setLoading(false)} />
  }

  const selectedTemplate = data.settings?.template || 'template-a'

  if (!opened) {
    if (selectedTemplate === 'template-c') {
      const participants = getTemplateCParticipants(data.settings)
      const heroPhotos = data.settings?.hero_image
        ? data.settings.hero_image.split(',').map((s) => s.trim()).filter(Boolean)
        : data.gallery.map((g) => g.photoUrl).filter(Boolean)

      return (
        <div className="relative min-h-screen overflow-hidden bg-transparent">
          <TemplateCPhotoBackground photos={heroPhotos as string[]} cycleInterval={4000} transitionDuration={1400} />
          <div className="relative z-10">
            <TemplateCGuestOpening
              participants={participants}
              guestName={guestName}
              weddingDate={data.events[0]?.eventDate ?? data.wedding.weddingDate}
              photos={heroPhotos as string[]}
              onOpen={handleOpen}
              isOpening
            />
          </div>
        </div>
      )
    }

    const openingOccasionLabel = selectedTemplate === 'template-a' || selectedTemplate === 'template-b'
      ? 'The Wedding Of'
      : 'Metatah'
    return <OpeningSection data={data} guestName={guestName} onOpen={handleOpen} occasionLabel={openingOccasionLabel} />
  }

  const templateProps = {
    data,
    slug,
    guestCode,
    guestName,
    musicPlaying,
    onToggleMusic: toggleMusic,
  }

  if (selectedTemplate === 'template-b') {
    return (
      <div className="animate-fadeIn">
        <TemplateB {...templateProps} />
      </div>
    )
  }
  if (selectedTemplate === 'template-c') {
    return <TemplateC {...templateProps} />
  }
  if (selectedTemplate === 'template-d') {
    return <TemplateD {...templateProps} />
  }

  return <TemplateA {...templateProps} />
}
