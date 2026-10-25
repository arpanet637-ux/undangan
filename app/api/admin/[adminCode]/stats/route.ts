import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests, wishes } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getWeddingByCodeOrSlug } from '@/lib/admin-utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const wedding = await getWeddingByCodeOrSlug(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [guestData, wishData] = await Promise.all([
    db.select().from(guests).where(eq(guests.weddingId, wedding.id)),
    db.select().from(wishes).where(eq(wishes.weddingId, wedding.id)),
  ])

  const totalGuests = guestData.length
  const attendingGuests = guestData.filter(g => g.isAttended === 1).length
  const notAttendingGuests = guestData.filter(g => g.isAttended === 0 && g.invitationCode).length
  const totalAttendees = guestData.reduce((sum, g) => sum + (g.attendedTotal || 0), 0)

  return NextResponse.json({
    totalGuests,
    openedInvitations: guestData.filter(g => g.invitationCode).length,
    attendingGuests,
    notAttendingGuests,
    totalWishes: wishData.length,
    totalAttendees,
  })
}
