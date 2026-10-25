import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { wishes } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getWeddingByCodeOrSlug } from '@/lib/admin-utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const wedding = await getWeddingByCodeOrSlug(adminCode)
  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.select().from(wishes).where(eq(wishes.weddingId, wedding.id)).orderBy(desc(wishes.createdAt))
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (id) {
    await db.delete(wishes).where(eq(wishes.id, parseInt(id)))
  }
  return NextResponse.json({ success: true })
}
