import { NextResponse, NextRequest } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; code: string } }
) {
  try {
    const { slug, code } = params

    // Get wedding ID from slug
    const weddingResult = await pool.query(
      'SELECT id FROM weddings WHERE slug = $1',
      [slug]
    )

    if (weddingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    const weddingId = weddingResult.rows[0].id

    // Get guest by invitation code
    const guestResult = await pool.query(
      'SELECT id, name, invitation_code FROM guests WHERE wedding_id = $1 AND invitation_code = $2',
      [weddingId, code]
    )

    if (guestResult.rows.length === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    const guest = guestResult.rows[0]

    return NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        invitationCode: guest.invitation_code,
      },
    })
  } catch (error) {
    console.error('[v0] Error fetching guest:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guest data' },
      { status: 500 }
    )
  }
}
