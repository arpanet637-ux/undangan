import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { couple, weddings } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { generateUniqueWeddingSlug, getWeddingByCodeOrSlug } from '@/lib/admin-utils'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ adminCode: string; id: string }> }) {
  try {
    const { adminCode, id } = await params
    
    const wedding = await getWeddingByCodeOrSlug(adminCode)
    if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    
    const role = String(body.role || '').trim().toLowerCase()
    if (!['groom', 'bride'].includes(role)) {
      return NextResponse.json({ error: 'Role mempelai tidak valid.' }, { status: 400 })
    }

    const dataToSave = {
      weddingId: wedding.id,
      role,
      fullName: String(body.full_name || '').trim(),
      nickname: String(body.nickname || '').trim(),
      photoUrl: String(body.photo_url || '').trim() || null,
      fatherName: String(body.father_name || '').trim() || null,
      motherName: String(body.mother_name || '').trim() || null,
      address: String(body.address || '').trim() || null,
      childOrder: String(body.child_order || '').trim() || null,
    }
    if (!dataToSave.fullName) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 })
    }

    // Match by wedding + role, never by the client placeholder id (1/2).
    const [existing] = await db.select().from(couple).where(
      and(eq(couple.weddingId, wedding.id), eq(couple.role, role))
    ).limit(1)

    let result
    if (existing) {
      await db.update(couple).set({ ...dataToSave, updatedAt: new Date() }).where(eq(couple.id, existing.id))
      const [saved] = await db.select().from(couple).where(eq(couple.id, existing.id)).limit(1)
      result = saved
    } else {
      const [saved] = await db.insert(couple).values(dataToSave).returning()
      result = saved
    }

    // Keep the public wedding URL in sync with the nicknames shown in this form.
    // The current record is excluded from the uniqueness check so saving the same
    // couple again does not receive an unnecessary -2 suffix.
    const [otherPerson] = await db.select().from(couple).where(
      and(eq(couple.weddingId, wedding.id), eq(couple.role, role === 'groom' ? 'bride' : 'groom'))
    ).limit(1)
    const groomNickname = role === 'groom' ? dataToSave.nickname : otherPerson?.nickname || wedding.groomName
    const brideNickname = role === 'bride' ? dataToSave.nickname : otherPerson?.nickname || wedding.brideName
    const nextSlug = await generateUniqueWeddingSlug(groomNickname, brideNickname, wedding.id)
    await db.update(weddings).set({ slug: nextSlug, updatedAt: new Date() }).where(eq(weddings.id, wedding.id))

    return NextResponse.json({ ...result, weddingSlug: nextSlug })
  } catch (error) {
    console.error('[v0] Couple PUT error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
