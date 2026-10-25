'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Heart } from 'lucide-react'

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up'
  redirectTo?: string
}

export function AuthForm({ mode, redirectTo = '/dashboard' }: AuthFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'sign-up') {
        const res = await authClient.signUp.email({ email, password, name })
        if (res.error) throw new Error(res.error.message)
      } else {
        const res = await authClient.signIn.email({ email, password })
        if (res.error) throw new Error(res.error.message)
      }
      router.push(redirectTo)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-sage/30 mb-6">
            <Heart className="w-5 h-5 text-sage" />
          </div>
          <h1 className="text-2xl font-display text-charcoal">
            {mode === 'sign-in' ? 'Masuk' : 'Daftar'}
          </h1>
          <p className="text-sm text-charcoal/50 font-body mt-2">
            {mode === 'sign-in' ? 'Masuk ke akun Anda' : 'Buat akun baru'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'sign-up' && (
            <div>
              <label className="block text-xs tracking-[0.15em] text-charcoal/60 font-body uppercase mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-charcoal/10 text-charcoal focus:border-sage focus:outline-none font-body"
                placeholder="Nama lengkap"
              />
            </div>
          )}

          <div>
            <label className="block text-xs tracking-[0.15em] text-charcoal/60 font-body uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-charcoal/10 text-charcoal focus:border-sage focus:outline-none font-body"
              placeholder="email@contoh.com"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.15em] text-charcoal/60 font-body uppercase mb-2">
              Kata Sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-white border border-charcoal/10 text-charcoal focus:border-sage focus:outline-none font-body"
              placeholder="Min. 8 karakter"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-charcoal text-white text-xs tracking-[0.2em] font-body uppercase font-semibold hover:bg-charcoal/90 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Memproses...' : mode === 'sign-in' ? 'Masuk' : 'Buat Akun'}
          </button>
        </form>
      </div>
    </div>
  )
}
