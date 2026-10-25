import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { weddings } from '@/db/schema'
import { eq, or } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { accessCode } = body

    if (!accessCode || typeof accessCode !== 'string') {
      return NextResponse.json(
        { error: 'Kode akses harus diisi' },
        { status: 400 }
      )
    }

    const normalizedAccessCode = accessCode.trim()
    const upperAccessCode = normalizedAccessCode.toUpperCase()
    const lowerAccessCode = normalizedAccessCode.toLowerCase()

    // Cari wedding dengan admin code yang sesuai (case-insensitive)
    // Database bisa berisi uppercase atau lowercase
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(
        or(
          eq(weddings.adminCode, upperAccessCode),
          eq(weddings.adminCode, lowerAccessCode),
          eq(weddings.adminCode, normalizedAccessCode)
        )
      )
      .limit(1)

    if (!wedding) {
      return NextResponse.json(
        { error: 'Kode akses tidak valid' },
        { status: 401 }
      )
    }

    // Return admin code untuk redirect ke halaman admin
    return NextResponse.json({
      success: true,
      adminCode: wedding.adminCode,
      title: wedding.title,
    })
  } catch (error) {
    console.error('[v0] Client login verify error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memverifikasi kode akses' },
      { status: 500 }
    )
  }
}
