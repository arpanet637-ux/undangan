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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#0f0a24',
        backgroundImage: 'linear-gradient(135deg, #020617 0%, #581c87 50%, #020617 100%)',
        colorScheme: 'dark',
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Cetak Foto di Bali
          </h1>
          <p style={{ color: '#cbd5e1' }}>Login sebagai Client</p>
        </div>

        <ClientLoginForm redirectTo={redirectTo} />

        <div className="mt-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-center text-sm" style={{ color: '#94a3b8' }}>
            Dapatkan kode akses dari admin untuk login
          </p>
        </div>
      </div>
    </div>
  )
}
