import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { gallery } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getWeddingByCodeOrSlug } from '@/lib/admin-utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const wedding = await getWeddingByCodeOrSlug(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.select().from(gallery).where(eq(gallery.weddingId, wedding.id)).orderBy(gallery.sortOrder)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  try {
    const { adminCode } = await params
    const wedding = await getWeddingByCodeOrSlug(adminCode)
    if (!wedding) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })

    const body = await req.json()
    if (!body.photo_url) return NextResponse.json({ error: 'Photo URL required' }, { status: 400 })

    const [newPhoto] = await db.insert(gallery).values({
      weddingId: wedding.id,
      photoUrl: body.photo_url,
      caption: body.caption || null,
      sortOrder: body.sort_order || 0,
    }).returning()

    return NextResponse.json(newPhoto)
  } catch (error) {
    console.error('[v0] Gallery POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add photo' },
      { status: 500 }
    )
  }
}
