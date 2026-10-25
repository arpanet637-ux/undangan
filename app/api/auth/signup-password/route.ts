import { NextRequest, NextResponse } from 'next/server'

const SIGNUP_PASSWORD = 'cfdb2026'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== SIGNUP_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('signup_verified', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600, // 1 hour
    path: '/sign-up',
  })

  return response
}
