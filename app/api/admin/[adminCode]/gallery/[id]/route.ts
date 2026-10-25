import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { gallery } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ adminCode: string; id: string }> }) {
  try {
    const { id } = await params
    const photoId = parseInt(id)
    
    if (isNaN(photoId)) {
      return NextResponse.json({ error: 'Invalid photo ID' }, { status: 400 })
    }

    const result = await db.delete(gallery).where(eq(gallery.id, photoId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Gallery DELETE error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
