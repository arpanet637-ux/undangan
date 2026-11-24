import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { weddings } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'

async function findWeddingByAccessCode(accessCode: string) {
  const normalizedAccessCode = accessCode.trim()

  // Database bisa berisi uppercase atau lowercase
  const [wedding] = await db
    .select()
    .from(weddings)
    .where(
      or(
        eq(weddings.adminCode, normalizedAccessCode.toUpperCase()),
        eq(weddings.adminCode, normalizedAccessCode.toLowerCase()),
        eq(weddings.adminCode, normalizedAccessCode)
      )
    )
    .limit(1)

  return wedding
}

// Hanya izinkan path internal agar parameter redirect tidak bisa mengarah ke situs lain
function toSafeInternalPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return null
  }
  return value
}

// Cadangan tanpa JavaScript: form HTML biasa dikirim langsung ke sini lalu diarahkan oleh server
async function handleFormSubmission(req: NextRequest) {
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, req.url), 303)

  try {
    const form = await req.formData()
    const accessCode = String(form.get('accessCode') ?? '').trim()

    if (!accessCode) return redirectTo('/client-login?error=empty')

    const wedding = await findWeddingByAccessCode(accessCode)
    if (!wedding) return redirectTo('/client-login?error=invalid')

    const target =
      toSafeInternalPath(String(form.get('redirect') ?? '')) || `/admin/${wedding.adminCode}`
    return redirectTo(target)
  } catch (error) {
    console.error('[v0] Client login form verify error:', error)
    return redirectTo('/client-login?error=server')
  }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    return handleFormSubmission(req)
  }

  try {
    const body = await req.json()
    const { accessCode } = body

    if (!accessCode || typeof accessCode !== 'string') {
      return NextResponse.json(
        { error: 'Kode akses harus diisi' },
        { status: 400 }
      )
    }

    const wedding = await findWeddingByAccessCode(accessCode)

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
