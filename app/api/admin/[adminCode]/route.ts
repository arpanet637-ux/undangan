import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { weddings } from '@/db/schema'
import { eq, or } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  // Try both adminCode and slug for compatibility
  const [wedding] = await db.select().from(weddings).where(
    or(
      eq(weddings.adminCode, adminCode),
      eq(weddings.slug, adminCode)
    )
  ).limit(1)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(wedding)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const [wedding] = await db.select().from(weddings).where(
    or(
      eq(weddings.adminCode, adminCode),
      eq(weddings.slug, adminCode)
    )
  ).limit(1)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const [updated] = await db.update(weddings)
    .set({
      groomName: body.groom_name,
      brideName: body.bride_name,
      title: body.title,
      weddingDate: body.wedding_date || null,
    })
    .where(eq(weddings.id, wedding.id))
    .returning()

  return NextResponse.json(updated)
}
