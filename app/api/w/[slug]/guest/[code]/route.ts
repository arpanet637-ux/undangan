import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests } from '@/db/schema'
import { and, eq, ilike } from 'drizzle-orm'
import { findWedding } from '@/app/api/w/[slug]/route'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; code: string }> }
) {
  const { slug, code } = await params
  const wedding = await findWedding(slug)
  if (!wedding) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })

  const [guest] = await db
    .select()
    .from(guests)
    // Codes are name-based slugs now (e.g. "ari"), so match case-insensitively in
    // case the link gets retyped or auto-capitalized by a phone keyboard.
    .where(and(eq(guests.weddingId, wedding.id), ilike(guests.invitationCode, code)))
    .limit(1)

  if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  return NextResponse.json({ name: guest.name, phone: guest.phone })
}
