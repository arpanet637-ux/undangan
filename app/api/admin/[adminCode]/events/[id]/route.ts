import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { weddings, events } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function getWeddingByCode(adminCode: string) {
  const [wedding] = await db.select().from(weddings).where(eq(weddings.adminCode, adminCode)).limit(1)
  return wedding
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ adminCode: string; id: string }> }) {
  const { adminCode, id } = await params
  const wedding = await getWeddingByCode(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const [updated] = await db.update(events)
    .set({
      eventName: body.name,
      eventDate: body.event_date || null,
      eventTime: body.start_time ? `${body.start_time}${body.end_time ? ' - ' + body.end_time : ''}` : null,
      venueName: body.venue,
      venueAddress: body.address,
      mapsUrl: body.maps_url,
    })
    .where(eq(events.id, parseInt(id)))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ adminCode: string; id: string }> }) {
  const { id } = await params
  await db.delete(events).where(eq(events.id, parseInt(id)))
  return NextResponse.json({ success: true })
}
