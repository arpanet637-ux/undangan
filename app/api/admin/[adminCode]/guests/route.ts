import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateUniqueGuestCode, getWeddingByCodeOrSlug } from '@/lib/admin-utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const wedding = await getWeddingByCodeOrSlug(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.select().from(guests).where(eq(guests.weddingId, wedding.id))
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const wedding = await getWeddingByCodeOrSlug(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  // Use the admin's manually chosen code if provided, otherwise derive a readable
  // slug from the guest's name (e.g. "Ari" -> "ari") so the shared link reads
  // naturally. Either way, generateUniqueGuestCode appends -2, -3, etc. on conflict.
  const invitationCode = await generateUniqueGuestCode(wedding.id, body.invitation_code?.trim() || body.name)

  const [newGuest] = await db.insert(guests).values({
    weddingId: wedding.id,
    name: body.name,
    phone: body.phone || null,
    address: body.address || null,
    invitationCode,
    totalInvitation: body.total_invitation || 1,
  }).returning()

  return NextResponse.json(newGuest)
}
