import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateUniqueGuestCode, getWeddingByCodeOrSlug } from '@/lib/admin-utils'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ adminCode: string; id: string }> }) {
  const { adminCode, id } = await params
  const guestId = parseInt(id)
  const body = await req.json()

  // Only touch the invitation code when the admin actually typed something in the
  // code field, so editing other fields (phone, address, etc.) never silently breaks
  // a link that has already been shared with the guest.
  let invitationCode: string | undefined
  if (typeof body.invitation_code === 'string' && body.invitation_code.trim()) {
    const wedding = await getWeddingByCodeOrSlug(adminCode)
    if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    invitationCode = await generateUniqueGuestCode(wedding.id, body.invitation_code.trim(), guestId)
  }

  const [updated] = await db.update(guests)
    .set({
      name: body.name,
      phone: body.phone || null,
      address: body.address || null,
      totalInvitation: body.total_invitation || 1,
      ...(invitationCode ? { invitationCode } : {}),
    })
    .where(eq(guests.id, guestId))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ adminCode: string; id: string }> }) {
  const { id } = await params
  await db.delete(guests).where(eq(guests.id, parseInt(id)))
  return NextResponse.json({ success: true })
}
