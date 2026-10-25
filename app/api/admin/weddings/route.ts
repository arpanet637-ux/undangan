import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { weddings, couple, guests, wishes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { generateUniqueWeddingSlug } from '@/lib/admin-utils'

function generateAdminCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await db.select().from(weddings).where(eq(weddings.userId, session.user.id))

  // Fetch stats for each wedding in parallel
  const withStats = await Promise.all(data.map(async (w) => {
    const [guestData, wishData] = await Promise.all([
      db.select().from(guests).where(eq(guests.weddingId, w.id)),
      db.select().from(wishes).where(eq(wishes.weddingId, w.id)),
    ])
    return {
      ...w,
      totalGuests: guestData.length,
      openedCount: guestData.filter(g => g.invitationCode).length,
      attendingCount: guestData.filter(g => g.isAttended === 1).length,
      totalWishes: wishData.length,
    }
  }))

  return NextResponse.json(withStats)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { groomName, brideName } = body
  if (!groomName || !brideName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // groomName/brideName here double as the initial nicknames (the couple's fuller
  // names are filled in later via Admin > Couple), so the slug reads naturally as
  // "the-wedding-of-{groom-nickname}-{bride-nickname}" right from creation.
  const slug = await generateUniqueWeddingSlug(groomName, brideName)
  const adminCode = generateAdminCode()

  const [wedding] = await db.insert(weddings).values({
    slug,
    adminCode,
    groomName,
    brideName,
    title: `${groomName} & ${brideName}`,
    userId: session.user.id,
  }).returning()

  // Create default couple entries
  await db.insert(couple).values([
    { weddingId: wedding.id, role: 'groom', fullName: groomName, nickname: groomName },
    { weddingId: wedding.id, role: 'bride', fullName: brideName, nickname: brideName },
  ])

  return NextResponse.json(wedding)
}
