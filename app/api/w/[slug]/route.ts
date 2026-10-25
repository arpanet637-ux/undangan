import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { weddings, couple, events, gallery, gifts, wishes, settings } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

function slugDistance(left: string, right: string): number {
  const a = left.replace(/^the-wedding-of-/, '')
  const b = right.replace(/^the-wedding-of-/, '')
  const row = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const above = row[j]
      row[j] = a[i - 1] === b[j - 1]
        ? diagonal
        : Math.min(row[j] + 1, row[j - 1] + 1, diagonal + 1)
      diagonal = above
    }
  }
  return row[b.length]
}

export async function findWedding(slug: string) {
  const [exact] = await db.select().from(weddings).where(eq(weddings.slug, slug)).limit(1)
  if (exact) return exact

  // Recover links created before a couple nickname/slug was corrected (for example
  // de-gus -> de-agus) without returning a permanent 404 to guests.
  const candidates = await db.select().from(weddings)
  return candidates
    .filter(candidate => candidate.slug.startsWith('the-wedding-of-') && slug.startsWith('the-wedding-of-'))
    .map(candidate => ({ candidate, distance: slugDistance(candidate.slug, slug) }))
    .filter(({ distance }) => distance <= 2)
    .sort((a, b) => a.distance - b.distance)[0]?.candidate || null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const wedding = await findWedding(slug)
  if (!wedding) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })

  const [coupleData, eventsData, galleryData, giftsData, wishesData, settingsData] = await Promise.all([
    db.select().from(couple).where(eq(couple.weddingId, wedding.id)),
    db.select().from(events).where(eq(events.weddingId, wedding.id)),
    db.select().from(gallery).where(eq(gallery.weddingId, wedding.id)).orderBy(gallery.sortOrder),
    db.select().from(gifts).where(eq(gifts.weddingId, wedding.id)),
    db.select().from(wishes).where(eq(wishes.weddingId, wedding.id)).orderBy(desc(wishes.createdAt)),
    db.select().from(settings).where(eq(settings.weddingId, wedding.id)),
  ])

  const settingsMap: Record<string, string> = { video_url: wedding.videoUrl || '' }
  settingsData.forEach(s => { settingsMap[s.settingKey] = s.settingValue || '' })

  return NextResponse.json({
    wedding,
    couple: coupleData,
    events: eventsData,
    gallery: galleryData,
    gifts: giftsData,
    wishes: wishesData,
    settings: settingsMap,
  })
}
