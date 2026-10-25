import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { get } from '@vercel/blob'
import { db } from '@/lib/db'
import { weddings } from '@/lib/db/schema'

// Node runtime so we can stream binary from arbitrary upstream image hosts.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://v0-cetakfotodibali.vercel.app')
).replace(/\/$/, '')

const missingOgImageResponse = () =>
  new NextResponse('No OG image configured for this wedding', {
    status: 404,
    headers: { 'Cache-Control': 'no-store' },
  })

const sanitizeImageUrl = (value?: string | null) => {
  const candidate = value?.trim()
  if (!candidate) return null
  try {
    const url = new URL(candidate.replace(/^http:\/\//i, 'https://'))
    if (url.protocol !== 'https:') return null
    url.search = ''
    url.hash = ''
    return url.toString()
  } catch {
    return null
  }
}

// Extracts the Blob pathname from either:
// 1. Our own `/api/file?pathname=...` proxy path (current upload format), or
// 2. A legacy raw private-blob URL (`https://<store>.private.blob.vercel-storage.com/...`)
//    saved by an earlier version of the upload route, before it switched to the proxy
//    path format. Both point at a blob in THIS project's private store.
// Returns null for anything else, such as an external https:// URL (e.g. a manually
// pasted postimg link).
const extractOwnBlobPathname = (value?: string | null): string | null => {
  const candidate = value?.trim()
  if (!candidate) return null

  if (candidate.startsWith('/api/file?')) {
    try {
      const params = new URL(candidate, 'https://placeholder.local').searchParams
      return params.get('pathname')
    } catch {
      return null
    }
  }

  try {
    const url = new URL(candidate)
    if (/\.(public|private)\.blob\.vercel-storage\.com$/i.test(url.hostname)) {
      return decodeURIComponent(url.pathname.replace(/^\//, ''))
    }
  } catch {
    // not a URL at all, fall through
  }
  return null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let rawOgImage: string | null = null

  try {
    const [wedding] = await db
      .select({ ogImage: weddings.ogImage })
      .from(weddings)
      .where(eq(weddings.slug, slug))
      .limit(1)
    rawOgImage = wedding?.ogImage ?? null
  } catch (error) {
    console.error('[v0] OG proxy lookup failed:', error)
  }

  // Our own uploaded thumbnails are stored as /api/file?pathname=... (this project's
  // Blob store is PRIVATE, so the raw blob URL isn't publicly fetchable). Stream them
  // via the authenticated `get()` API instead of a plain fetch.
  const ownPathname = extractOwnBlobPathname(rawOgImage)
  if (ownPathname) {
    try {
      const result = await get(ownPathname, { access: 'private' })
      if (!result) throw new Error('Own blob thumbnail not found')
      // Return the Blob stream directly. Buffering the private Blob in the route can
      // intermittently fail on mobile/WhatsApp crawlers when the response is large or
      // the serverless function is interrupted mid-read.
      return new NextResponse(result.stream, {
        status: 200,
        headers: {
          'Content-Type': result.blob.contentType || 'image/jpeg',
          ETag: result.blob.etag,
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
          'Content-Disposition': 'inline',
        },
      })
    } catch (error) {
      console.error('[v0] OG proxy own-blob stream failed:', error)
      return missingOgImageResponse()
    }
  }

  // Not our own proxy path — treat it as a plain external HTTPS URL (e.g. a manually
  // pasted postimg link) and fetch it directly.
  const target = sanitizeImageUrl(rawOgImage)
  if (!target) return missingOgImageResponse()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const upstream = await fetch(target, {
      // Present a normal browser identity so image hosts don't block a bot fetch.
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
        Accept: 'image/avif,image/webp,image/jpeg,image/png,*/*',
      },
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeout)

    const contentType = upstream.headers.get('content-type') || ''
    if (!upstream.ok || !contentType.startsWith('image/')) {
      throw new Error(`Bad upstream image: ${upstream.status} ${contentType}`)
    }

    const buffer = Buffer.from(await upstream.arrayBuffer())
    if (buffer.byteLength === 0) {
      throw new Error('OG image response is empty')
    }
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.byteLength),
        // Cache at Vercel's edge and in WhatsApp so the crawler always gets a fast, consistent hit.
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('[v0] OG proxy stream failed:', error)
    return missingOgImageResponse()
  }
}
