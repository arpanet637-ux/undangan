import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect: redirectTo } = await searchParams
  const target = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect(target)
  return <AuthForm mode="sign-in" redirectTo={target} />
}
