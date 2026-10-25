'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'

export function ClientLoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim()) {
      setError('Masukkan kode akses')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Verify access code - cek apakah kode akses valid
      const res = await fetch('/api/client-login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Kode akses tidak valid')
        setLoading(false)
        return
      }

      setSuccess('Kode akses valid! Redirecting...')
      
      // Redirect ke admin panel dengan kode akses
      const target = redirectTo || `/admin/${data.adminCode}`
      setTimeout(() => {
        router.push(target)
      }, 500)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errMsg)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-8 space-y-6">
      <div>
        <label htmlFor="accessCode" className="block text-sm font-medium text-white mb-2">
          Kode Akses
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
          <input
            id="accessCode"
            type="text"
            placeholder="Masukkan kode akses (contoh: GSD5WAFM)"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors disabled:opacity-50"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-300">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !accessCode.trim()}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Memverifikasi...' : 'Login'}
      </button>

      <p className="text-center text-xs text-slate-400">
        Kode akses dapat diminta kepada admin yang membuat project pernikahan Anda
      </p>
    </form>
  )
}
