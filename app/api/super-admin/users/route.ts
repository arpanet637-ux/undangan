import { NextRequest, NextResponse } from 'next/server'
import { desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/db/schema'

// TEMPORARY: session check removed for testing. Restore requireSession() before production.

export async function GET() {
  const users = await db
    .select({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt })
    .from(user)
    .orderBy(desc(user.createdAt))

  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: 'Nama, email, dan kata sandi wajib diisi.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Kata sandi minimal 8 karakter.' }, { status: 400 })
  }

  try {
    const result = await auth.api.signUpEmail({
      body: { name: name.trim(), email: email.trim().toLowerCase(), password },
    })
    return NextResponse.json({ user: { id: result.user.id, name: result.user.name, email: result.user.email } }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const exists = /exist/i.test(message)
    return NextResponse.json(
      { error: exists ? 'Email sudah terdaftar.' : 'Gagal membuat user.' },
      { status: exists ? 409 : 500 }
    )
  }
}
