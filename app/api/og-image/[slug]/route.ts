import { createHash } from 'node:crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { get, put } from '@vercel/blob'
import jpeg from 'jpeg-js'
import { db } from '@/lib/db'
import { weddings } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const OG_WIDTH = 1200
const OG_HEIGHT = 630
// Bump when the rendering pipeline changes so cached renders are regenerated.
const RENDER_VERSION = 'v4'

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
    url.hash = ''
    return url.toString()
  } catch {
    return null
  }
}

// Our own uploads are saved as `/api/file?pathname=...` (private Blob store), and an
// older upload format saved the raw private blob URL. Both resolve to a pathname here.
const extractOwnBlobPathname = (value?: string | null): string | null => {
  const candidate = value?.trim()
  if (!candidate) return null

  if (candidate.startsWith('/api/file?')) {
    try {
      return new URL(candidate, 'https://placeholder.local').searchParams.get('pathname')
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
    // not a URL
  }
  return null
}

const streamToBuffer = async (stream: ReadableStream<Uint8Array> | null) =>
  stream ? Buffer.from(await new Response(stream).arrayBuffer()) : Buffer.alloc(0)

const loadSourceImage = async (rawOgImage: string): Promise<Buffer> => {
  const ownPathname = extractOwnBlobPathname(rawOgImage)
  if (ownPathname) {
    const result = await get(ownPathname, { access: 'private' })
    if (!result) throw new Error('Own blob thumbnail not found')
    return streamToBuffer(result.stream)
  }

  const target = sanitizeImageUrl(rawOgImage)
  if (!target) throw new Error('OG image is not a valid https URL')

  const upstream = await fetch(target, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36',
      Accept: 'image/avif,image/webp,image/jpeg,image/png,*/*',
    },
    signal: AbortSignal.timeout(8000),
  })
  const contentType = upstream.headers.get('content-type') || ''
  if (!upstream.ok || !contentType.startsWith('image/')) {
    throw new Error(`Bad upstream image: ${upstream.status} ${contentType}`)
  }
  const buffer = Buffer.from(await upstream.arrayBuffer())
  if (buffer.byteLength === 0) throw new Error('Upstream image is empty')
  return buffer
}

// WhatsApp only shows a large preview reliably for a ~1.91:1 JPEG of at least 300px
// width and a few hundred KB at most. Sources vary wildly (150x150 postimg thumbnails,
// 6000x4000 camera originals, portrait photos), so every source is normalized into a
// 1200x630 JPEG: the full photo is centered over a blurred fill of itself, so nothing
// gets cropped and the configured OG image is still the only image used.
const renderWithSharp = async (source: Buffer) => {
  // Imported lazily: a top-level import that fails to load its native libvips binary
  // crashes the whole route with a 500 before any fallback can run.
  const { default: sharp } = await import('sharp')
  const base = sharp(source, { failOn: 'none' }).rotate()
  const [background, foreground] = await Promise.all([
    base.clone().resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover' }).blur(40).modulate({ brightness: 0.8 }).toBuffer(),
    base.clone().resize(OG_WIDTH, OG_HEIGHT, { fit: 'inside' }).toBuffer(),
  ])
  return sharp(background)
    .composite([{ input: foreground, gravity: 'centre' }])
    .jpeg({ quality: 82, mozjpeg: true, progressive: false })
    .toBuffer()
}

// Pure-JS fallback with no native binary, so a broken sharp install can never take the
// preview down again. Center-crops (biased upward for portraits, where faces usually
// sit) to 1200x630 with box-filter downsampling.
const renderWithJpegJs = (source: Buffer) => {
  const decoded = jpeg.decode(source, { useTArray: true, maxMemoryUsageInMB: 1024, maxResolutionInMP: 200 })
  const { width: srcW, height: srcH, data: src } = decoded
  const targetRatio = OG_WIDTH / OG_HEIGHT

  let cropW = srcW
  let cropH = Math.round(srcW / targetRatio)
  if (cropH > srcH) {
    cropH = srcH
    cropW = Math.round(srcH * targetRatio)
  }
  const cropX = Math.floor((srcW - cropW) / 2)
  const cropY = Math.floor(Math.max(0, Math.min(srcH - cropH, (srcH - cropH) * 0.3)))

  const out = new Uint8Array(OG_WIDTH * OG_HEIGHT * 4)
  const scaleX = cropW / OG_WIDTH
  const scaleY = cropH / OG_HEIGHT
  for (let y = 0; y < OG_HEIGHT; y++) {
    const y0 = cropY + Math.floor(y * scaleY)
    const y1 = Math.max(y0 + 1, cropY + Math.floor((y + 1) * scaleY))
    for (let x = 0; x < OG_WIDTH; x++) {
      const x0 = cropX + Math.floor(x * scaleX)
      const x1 = Math.max(x0 + 1, cropX + Math.floor((x + 1) * scaleX))
      let r = 0
      let g = 0
      let b = 0
      let n = 0
      for (let sy = y0; sy < y1; sy++) {
        let i = (sy * srcW + x0) * 4
        for (let sx = x0; sx < x1; sx++, i += 4) {
          r += src[i]
          g += src[i + 1]
          b += src[i + 2]
          n++
        }
      }
      const o = (y * OG_WIDTH + x) * 4
      out[o] = r / n
      out[o + 1] = g / n
      out[o + 2] = b / n
      out[o + 3] = 255
    }
  }
  return Buffer.from(jpeg.encode({ data: out, width: OG_WIDTH, height: OG_HEIGHT }, 82).data)
}

const isJpeg = (buffer: Buffer) => buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff

const renderOgJpeg = async (source: Buffer) => {
  try {
    return await renderWithSharp(source)
  } catch (error) {
    console.error('[v0] sharp unavailable, using jpeg-js fallback:', error)
  }
  if (isJpeg(source)) return renderWithJpegJs(source)
  throw new Error('Source is not a JPEG and sharp is unavailable')
}

const jpegResponse = (body: Buffer) =>
  new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(body.byteLength),
      'Content-Disposition': 'inline; filename="og.jpg"',
      // The page links this image with a `v=` version param, so it is safe to cache hard.
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=31536000',
      'CDN-Cache-Control': 'public, s-maxage=31536000',
    },
  })

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let rawOgImage: string | null = null
  try {
    const [wedding] = await db
      .select({ ogImage: weddings.ogImage })
      .from(weddings)
      .where(eq(weddings.slug, slug))
      .limit(1)
    rawOgImage = wedding?.ogImage?.trim() || null
  } catch (error) {
    console.error('[v0] OG lookup failed:', error)
  }
  if (!rawOgImage) return missingOgImageResponse()

  const sourceHash = createHash('sha1').update(`${RENDER_VERSION}:${rawOgImage}`).digest('hex').slice(0, 16)
  const cachePathname = `og-cache/${slug}-${sourceHash}.jpg`

  try {
    const cached = await get(cachePathname, { access: 'private' })
    if (cached) {
      const body = await streamToBuffer(cached.stream)
      if (body.byteLength > 0) return jpegResponse(body)
    }
  } catch {
    // cache miss or Blob hiccup — render below
  }

  try {
    const source = await loadSourceImage(rawOgImage)
    const rendered = await renderOgJpeg(source)

    try {
      await put(cachePathname, rendered, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'image/jpeg',
      })
    } catch (error) {
      console.error('[v0] OG cache write failed:', error)
    }

    return jpegResponse(rendered)
  } catch (error) {
    console.error('[v0] OG render failed:', error)
    return missingOgImageResponse()
  }
}
