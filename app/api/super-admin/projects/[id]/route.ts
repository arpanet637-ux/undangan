import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  weddings,
  settings,
  couple,
  events,
  gallery,
  guests,
  wishes,
  gifts,
} from '@/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

// Edit basic project details (title, names, date)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const weddingId = parseInt(id, 10)
  if (Number.isNaN(weddingId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json()

  const [updated] = await db
    .update(weddings)
    .set({
      title: body.title,
      groomName: body.groomName,
      brideName: body.brideName,
      videoUrl: body.videoUrl || null,
      weddingDate: body.weddingDate || null,
      updatedAt: new Date(),
    })
    .where(eq(weddings.id, weddingId))
    .returning()

  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

// Delete a project and all its related records
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const weddingId = parseInt(id, 10)
  if (Number.isNaN(weddingId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const [existing] = await db
    .select()
    .from(weddings)
    .where(eq(weddings.id, weddingId))
    .limit(1)

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Remove all related records first (no DB-level cascade configured)
  await Promise.all([
    db.delete(settings).where(eq(settings.weddingId, weddingId)),
    db.delete(couple).where(eq(couple.weddingId, weddingId)),
    db.delete(events).where(eq(events.weddingId, weddingId)),
    db.delete(gallery).where(eq(gallery.weddingId, weddingId)),
    db.delete(guests).where(eq(guests.weddingId, weddingId)),
    db.delete(wishes).where(eq(wishes.weddingId, weddingId)),
    db.delete(gifts).where(eq(gifts.weddingId, weddingId)),
  ])

  await db.delete(weddings).where(eq(weddings.id, weddingId))

  return NextResponse.json({ success: true })
}
