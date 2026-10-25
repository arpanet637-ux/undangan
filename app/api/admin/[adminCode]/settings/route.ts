import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { settings, weddings } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getWeddingByCodeOrSlug } from '@/lib/admin-utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const wedding = await getWeddingByCodeOrSlug(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.select().from(settings).where(eq(settings.weddingId, wedding.id))
  const map: Record<string, string> = { og_image: wedding.ogImage || '', video_url: wedding.videoUrl || '', slug: wedding.slug || '' }
  data.forEach(s => { map[s.settingKey] = s.settingValue || '' })
  return NextResponse.json(map)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  try {
    const { adminCode } = await params
    const wedding = await getWeddingByCodeOrSlug(adminCode)
    if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()

    const requestedSlug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : ''
    if (requestedSlug) {
      const normalizedSlug = requestedSlug
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      if (!normalizedSlug || normalizedSlug.length < 3 || normalizedSlug.length > 100) {
        return NextResponse.json({ error: 'Slug harus 3-100 karakter dan hanya boleh berisi huruf, angka, serta tanda hubung.' }, { status: 400 })
      }
      const [conflict] = await db.select({ id: weddings.id }).from(weddings)
        .where(eq(weddings.slug, normalizedSlug)).limit(1)
      if (conflict && conflict.id !== wedding.id) {
        return NextResponse.json({ error: 'Slug tersebut sudah dipakai wedding lain.' }, { status: 409 })
      }
      await db.update(weddings).set({ slug: normalizedSlug, updatedAt: new Date() }).where(eq(weddings.id, wedding.id))
    }

    // Upsert settings keys, excluding slug because it belongs to weddings.slug.
    for (const [key, value] of Object.entries(body)) {
      if (key === 'slug') continue
      const existing = await db.select().from(settings)
        .where(and(eq(settings.weddingId, wedding.id), eq(settings.settingKey, key)))
        .limit(1)

      if (existing.length > 0) {
        await db.update(settings)
          .set({ settingValue: value as string })
          .where(and(eq(settings.weddingId, wedding.id), eq(settings.settingKey, key)))
      } else {
        await db.insert(settings).values({ weddingId: wedding.id, settingKey: key, settingValue: value as string })
      }
    }

    // Also update weddings table fields if provided
    const weddingUpdates: Record<string, unknown> = {}
    if (body.groom_name !== undefined) weddingUpdates.groomName = body.groom_name
    if (body.bride_name !== undefined) weddingUpdates.brideName = body.bride_name
    if (body.video_url !== undefined) {
      const videoUrl = String(body.video_url || '').trim()
      if (videoUrl && !/^https:\/\//i.test(videoUrl)) {
        return NextResponse.json({ error: 'video_url harus berupa URL HTTPS publik.' }, { status: 400 })
      }
      weddingUpdates.videoUrl = videoUrl || null
    }
    if (body.og_image !== undefined) {
      const ogImage = String(body.og_image || '')
      // Accept either a public HTTPS URL (manually pasted) or our own
      // /api/file?pathname=... proxy path (produced by the private-blob upload flow).
      const isProxyPath = ogImage.startsWith('/api/file?pathname=')
      if (ogImage && !ogImage.startsWith('https://') && !isProxyPath) {
        return NextResponse.json({ error: 'og_image harus berupa URL HTTPS publik.' }, { status: 400 })
      }
      weddingUpdates.ogImage = ogImage || null
    }
    if (body.wedding_date !== undefined) weddingUpdates.weddingDate = body.wedding_date
    if (Object.keys(weddingUpdates).length > 0) {
      await db.update(weddings).set(weddingUpdates).where(eq(weddings.id, wedding.id))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Settings PUT error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
