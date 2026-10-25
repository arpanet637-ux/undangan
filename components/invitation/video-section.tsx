'use client'

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value)
    const id = url.hostname.includes('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').pop()
    return id
      ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0`
      : null
  } catch {
    return null
  }
}

export function VideoSection({ url }: { url?: string | null }) {
  const value = url?.trim()
  if (!value) return null
  const youtube = getYouTubeEmbedUrl(value)

  return (
    <section className="w-full px-5 py-16 md:px-8" aria-label="Video kenangan">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-center text-xs uppercase tracking-[0.28em] opacity-60">Video Kenangan</p>
        <div className="aspect-video overflow-hidden rounded-sm bg-black/10 shadow-lg">
          {youtube ? (
            <iframe className="h-full w-full" src={youtube} title="Video kenangan pernikahan" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : (
            <video className="h-full w-full" src={value} controls autoPlay muted playsInline preload="metadata" />
          )}
        </div>
      </div>
    </section>
  )
}
