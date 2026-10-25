'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

const SIGNUP_PASSWORD = 'cfdb2026'

export function SignupPassword() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password === SIGNUP_PASSWORD) {
      // Set cookie to remember password for this session
      await fetch('/api/auth/signup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      router.push('/sign-up/register')
    } else {
      setError('Password salah')
      setPassword('')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center text-white mb-2">
            Pendaftaran Undangan
          </h1>
          <p className="text-center text-white/60 text-sm mb-6">
            Masukkan password untuk mengakses halaman pendaftaran
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Masukkan password"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 transition-all"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-2 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Memverifikasi...' : 'Lanjutkan'}
            </button>
          </form>

          <p className="text-center text-white/50 text-xs mt-6">
            Hubungi admin untuk mendapatkan password
          </p>
        </div>
      </div>
    </div>
  )
}
