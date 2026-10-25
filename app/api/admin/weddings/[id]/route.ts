import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { weddings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const [updated] = await db.update(weddings)
    .set({
      groomName: body.groomName,
      brideName: body.brideName,
      title: body.title,
      adminCode: body.adminCode,
      ogImage: body.ogImage || null,
      weddingDate: body.weddingDate || null,
    })
    .where(and(eq(weddings.id, parseInt(id)), eq(weddings.userId, session.user.id)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(weddings).where(and(eq(weddings.id, parseInt(id)), eq(weddings.userId, session.user.id)))
  return NextResponse.json({ success: true })
}
