import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { gifts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ adminCode: string; id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const [updated] = await db.update(gifts)
    .set({ bankName: body.bank_name, accountNumber: body.account_number, accountName: body.account_name })
    .where(eq(gifts.id, parseInt(id)))
    .returning()
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ adminCode: string; id: string }> }) {
  const { id } = await params
  await db.delete(gifts).where(eq(gifts.id, parseInt(id)))
  return NextResponse.json({ success: true })
}
