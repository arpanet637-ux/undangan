import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { weddings, wishes } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

async function getWedding(slug: string) {
  const [wedding] = await db.select().from(weddings).where(eq(weddings.slug, slug)).limit(1)
  return wedding
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const wedding = await getWedding(slug)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.select().from(wishes).where(eq(wishes.weddingId, wedding.id)).orderBy(desc(wishes.createdAt))
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const wedding = await getWedding(slug)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { guestName, message, attendance } = body
  if (!guestName || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const [newWish] = await db.insert(wishes).values({
    weddingId: wedding.id,
    guestName,
    message,
    attendance: attendance || 'hadir',
  }).returning()

  return NextResponse.json(newWish)
}
