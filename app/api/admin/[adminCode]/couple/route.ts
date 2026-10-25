import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { weddings, couple } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ adminCode: string }> }) {
  try {
    const { adminCode } = await params
    
    // Try both adminCode and slug for compatibility
    const [wedding] = await db.select().from(weddings).where(
      or(
        eq(weddings.adminCode, adminCode),
        eq(weddings.slug, adminCode)
      )
    ).limit(1)
    
    if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data = await db.select().from(couple).where(eq(couple.weddingId, wedding.id))
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Couple GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
