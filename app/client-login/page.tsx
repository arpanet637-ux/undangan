import { redirect } from 'next/navigation'
import { ClientLoginForm } from '@/components/client-login-form'

export const metadata = {
  title: 'Login Client - Cetak Foto di Bali',
  description: 'Login sebagai client untuk mengelola project pernikahan Anda',
}

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect: redirectTo } = await searchParams
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Cetak Foto di Bali</h1>
          <p className="text-slate-300">Login sebagai Client</p>
        </div>

        <ClientLoginForm redirectTo={redirectTo} />

        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-slate-400">
            Dapatkan kode akses dari admin untuk login
          </p>
        </div>
      </div>
    </div>
  )
}
