import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { and, eq, ilike } from 'drizzle-orm'
import { InvitationClient } from '@/components/invitation/invitation-client'
import { db } from '@/lib/db'
import { couple, events, guests, weddings } from '@/db/schema'

const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  process.env.URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://v0-cetakfotodibali.vercel.app')
).replace(/\/$/, '')

// Keep the fallback independent of deployment aliases and VERCEL_URL previews.
const queryValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value

// Route the OG image through our own domain (/api/og-image/[slug]) instead of handing
// WhatsApp the raw upstream URL. Some mobile carriers/providers block or throttle
// third-party image hosts (e.g. postimg), which breaks the link preview. Our proxy
// fetches the source server-side (unaffected by the guest's network) and re-serves it
// from our own domain, so the thumbnail loads regardless of the recipient's provider.
const getOgImageUrl = (value?: string | null, origin = SITE_ORIGIN, slug?: string) => {
  const candidate = value?.trim()
  if (candidate && slug) {
    // Uploaded thumbnails are stored as a relative /api/file?pathname=... proxy path.
    // They are served from our own domain, so they need no https check.
    const isUploadedProxy = candidate.startsWith('/api/file?pathname=')
    if (isUploadedProxy) {
      const imageUrl = new URL(`/api/og-image/${encodeURIComponent(slug)}`, `${origin}/`)
      imageUrl.searchParams.set('v', encodeURIComponent(candidate).slice(-80))
      return imageUrl.toString()
    }
    try {
      const url = new URL(candidate.replace(/^http:\/\//i, 'https://'))
      if (url.protocol === 'https:') {
        const imageUrl = new URL(`/api/og-image/${encodeURIComponent(slug)}`, `${origin}/`)
        // Version the image URL by the configured source. This forces WhatsApp and
        // other crawlers to re-fetch after the admin replaces the OG Image instead
        // of reusing a cached failure for the same wedding slug.
        imageUrl.searchParams.set('v', encodeURIComponent(candidate).slice(-80))
        return imageUrl.toString()
      }
    } catch {
      return null
    }
  }
  return null
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ to?: string | string[]; guest?: string | string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const query = await searchParams
  const guestCode = queryValue(query.to) || queryValue(query.guest)
  const requestHeaders = await headers()
  const requestHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
  const requestProtocol = requestHeaders.get('x-forwarded-proto') || 'https'
  const currentOrigin = requestHost ? `${requestProtocol}://${requestHost}` : SITE_ORIGIN
  const invitationUrl = new URL(`/w/${encodeURIComponent(slug)}`, `${currentOrigin}/`)
  if (guestCode) invitationUrl.searchParams.set('to', guestCode)

  try {
    // Query Neon directly on the server. This avoids localhost fetches that fail in production SSR.
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(eq(weddings.slug, slug))
      .limit(1)

    if (!wedding) {
      return {
        metadataBase: new URL(SITE_ORIGIN),
        title: 'Undangan Pernikahan',
        description: 'Buka undangan pernikahan online.',
        alternates: { canonical: invitationUrl.toString() },
        openGraph: {
          title: 'Undangan Pernikahan',
          description: 'Buka undangan pernikahan online.',
          url: invitationUrl.toString(),
          type: 'website',
          locale: 'id_ID',
        },
        twitter: { card: 'summary_large_image' },
      }
    }

    const [coupleData, eventData, guestData] = await Promise.all([
      db.select().from(couple).where(eq(couple.weddingId, wedding.id)),
      db.select().from(events).where(eq(events.weddingId, wedding.id)).limit(1),
      guestCode
        ? db
            .select({ name: guests.name })
            .from(guests)
            .where(and(eq(guests.weddingId, wedding.id), ilike(guests.invitationCode, guestCode)))
            .limit(1)
        : Promise.resolve([]),
    ])

    const groom = wedding.groomName || coupleData.find((item) => item.role === 'groom')?.fullName || 'Mempelai Pria'
    const bride = wedding.brideName || coupleData.find((item) => item.role === 'bride')?.fullName || 'Mempelai Wanita'
    const guestName = guestData[0]?.name?.trim() || ''
    const eventDate = eventData[0]?.eventDate || wedding.weddingDate
    const formattedEventDate = eventDate
      ? new Date(eventDate).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : ''
    const location = [eventData[0]?.venueAddress, eventData[0]?.venueName]
      .filter(Boolean)
      .join(', ')
    const coupleTitle = `Undangan Pernikahan ${groom} & ${bride}`
    const ogTitle = guestName ? `Untuk ${guestName} - ${coupleTitle}` : coupleTitle
    const ogDescription = guestName
      ? `Kepada Yth. ${guestName}, Anda diundang ke pernikahan ${groom} & ${bride}${formattedEventDate ? ` pada ${formattedEventDate}` : ''}${location ? ` di ${location}` : ''}.`
      : `Anda diundang ke pernikahan ${groom} & ${bride}${formattedEventDate ? ` pada ${formattedEventDate}` : ''}${location ? ` di ${location}` : ''}.`

    // Serve the OG image through our own domain (/api/og-image/[slug]) so WhatsApp
    // always gets a fast, consistent, same-origin fetch instead of a third-party host
    // that some providers/carriers block. Keyed by slug (not guest) so every guest
    // link shares one cacheable image.
    const imageUrl = getOgImageUrl(wedding.ogImage, currentOrigin, slug)
    const imageMetadata = imageUrl ? {
      url: imageUrl,
      secureUrl: imageUrl,
      width: 1200,
      height: 630,
      type: 'image/jpeg',
      alt: 'Thumbnail Undangan',
    } as const : null
    return {
      metadataBase: new URL(SITE_ORIGIN),
      title: ogTitle,
      description: ogDescription,
      alternates: { canonical: invitationUrl.toString() },
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        url: invitationUrl.toString(),
        type: 'website',
        locale: 'id_ID',
        siteName: 'Undangan Pernikahan',
        ...(imageMetadata ? { images: [imageMetadata] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    }
  } catch (error) {
    console.error('[v0] Error generating invitation metadata:', error)
    return {
      metadataBase: new URL(SITE_ORIGIN),
      title: 'Undangan Pernikahan',
      description: 'Buka undangan pernikahan online.',
      alternates: { canonical: invitationUrl.toString() },
      openGraph: {
        title: 'Undangan Pernikahan',
        description: 'Buka undangan pernikahan online.',
        url: invitationUrl.toString(),
        type: 'website',
        locale: 'id_ID',
      },
      twitter: { card: 'summary_large_image' },
    }
  }
}

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ to?: string }>
}) {
  const { slug } = await params
  const { to } = await searchParams
  return <InvitationClient slug={slug} guestCode={to} />
}
