import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { gifts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getWeddingByCodeOrSlug } from '@/lib/admin-utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const wedding = await getWeddingByCodeOrSlug(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.select().from(gifts).where(eq(gifts.weddingId, wedding.id))
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const wedding = await getWeddingByCodeOrSlug(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const [newGift] = await db.insert(gifts).values({
    weddingId: wedding.id,
    bankName: body.bank_name,
    accountNumber: body.account_number,
    accountName: body.account_name,
  }).returning()

  return NextResponse.json(newGift)
}
