import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')

  // Check if password has been verified
  const h = await headers()
  const cookie = h.get('cookie')
  const isVerified = cookie?.includes('signup_verified=true')

  if (!isVerified) {
    redirect('/sign-up')
  }

  return <AuthForm mode="sign-up" />
}
