import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 border border-[#c8a96e]/30 flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#c8a96e]" />
          </div>
        </div>
        <h1 className="font-display text-5xl text-white mb-4 tracking-wide">Undangan Online</h1>
        <p className="text-white/40 font-body text-sm mb-10 leading-relaxed">
          Buat undangan pernikahan digital yang elegan dan profesional untuk momen spesial Anda
        </p>
        <Link
          href="/sign-in"
          className="px-8 py-3 bg-[#c8a96e] text-black font-body text-sm font-medium hover:bg-[#b8966a] transition-colors"
        >
          Masuk
        </Link>
      </div>
    </main>
  )
}
