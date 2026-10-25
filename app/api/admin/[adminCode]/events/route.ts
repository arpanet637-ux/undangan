import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getWeddingByCodeOrSlug } from '@/lib/admin-utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const wedding = await getWeddingByCodeOrSlug(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.select().from(events).where(eq(events.weddingId, wedding.id))
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const wedding = await getWeddingByCodeOrSlug(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const [newEvent] = await db.insert(events).values({
    weddingId: wedding.id,
    eventName: body.name,
    eventDate: body.event_date || null,
    eventTime: body.start_time ? `${body.start_time}${body.end_time ? ' - ' + body.end_time : ''}` : null,
    venueName: body.venue,
    venueAddress: body.address,
    mapsUrl: body.maps_url,
  }).returning()

  return NextResponse.json(newEvent)
}
