import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest, { params }: { params: Promise<{ adminCode: string; id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const [updated] = await db.update(guests)
    .set({
      isAttended: body.is_attended,
      attendedTotal: body.attended_total || 0,
    })
    .where(eq(guests.id, parseInt(id)))
    .returning()

  return NextResponse.json(updated)
}
