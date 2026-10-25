'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Kode akses tidak boleh kosong')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verify code exists
      const res = await fetch(`/api/admin/${code.trim()}`)
      if (!res.ok) {
        setError('Kode akses tidak valid. Silakan periksa kembali.')
        setLoading(false)
        return
      }

      // Valid, redirect
      const wedding = await res.json()
      router.push(`/admin/${code.trim()}`)
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/10 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-display text-white mb-2">Admin Undangan</h1>
          <p className="text-sm text-white/60 font-body">Masukkan kode akses untuk mengelola undangan Anda</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg p-8 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex gap-3 items-start p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-200 font-body">{error}</p>
            </div>
          )}

          {/* Input */}
          <div>
            <label className="block text-xs font-body text-white/50 uppercase tracking-wider mb-2">
              Kode Akses
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                placeholder="Contoh: PW-ABC123"
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/40 focus:outline-none px-4 py-3 pl-10 text-white placeholder:text-white/30 font-mono text-sm rounded-lg transition-colors"
                autoFocus
                disabled={loading}
              />
            </div>
            <p className="text-xs text-white/30 font-body mt-2">
              Hubungi pasangan pengantin untuk mendapatkan kode akses
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full bg-white hover:bg-white/90 disabled:bg-white/40 text-slate-900 font-body font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Masuk
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/40 font-body">
            Kode akses akan diberikan oleh mempelai pengantin
          </p>
        </div>
      </div>
    </div>
  )
}
