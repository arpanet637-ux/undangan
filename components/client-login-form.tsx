'use client'

import { useRef, useState } from 'react'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'

// Hanya path internal yang boleh dipakai sebagai tujuan setelah login
function toSafeInternalPath(value?: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return undefined
  }
  return value
}

export function ClientLoginForm({
  redirectTo,
  initialError = '',
}: {
  redirectTo?: string
  initialError?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const safeRedirectTo = toSafeInternalPath(redirectTo)
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Baca langsung dari kolom: autofill/paste/keyboard HP bisa mengisi kolom tanpa memicu onChange
    const code = (inputRef.current?.value ?? accessCode).trim()
    if (!code) {
      setError('Masukkan kode akses')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const maxAttempts = 2
    const timeoutMs = 12000

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const res = await fetch('/api/client-login/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessCode: code }),
          cache: 'no-store',
          signal: controller.signal,
        })

        const data = await res.json().catch(() => null)

        if (res.status === 401 || res.status === 400) {
          setError(data?.error || 'Kode akses tidak valid')
          setLoading(false)
          return
        }

        if (!res.ok || !data?.adminCode) {
          throw new Error('server-error')
        }

        setSuccess('Kode akses valid! Mengalihkan...')
        const target = safeRedirectTo || `/admin/${data.adminCode}`

        // Navigasi penuh lebih andal di browser in-app (WhatsApp, Instagram, dll)
        window.location.assign(target)

        // Jika halaman belum berpindah, jangan biarkan form terkunci selamanya
        setTimeout(() => {
          setLoading(false)
          setSuccess('')
          setError('Pengalihan tertunda. Tekan Login sekali lagi.')
        }, 10000)
        return
      } catch {
        if (attempt === maxAttempts) {
          setError('Koneksi lambat atau gagal. Periksa internet Anda lalu coba lagi.')
          setLoading(false)
          return
        }
      } finally {
        clearTimeout(timer)
      }
    }
  }

  return (
    <form
      method="post"
      action="/api/client-login/verify"
      onSubmit={handleSubmit}
      className="rounded-lg p-8 space-y-6"
      style={{
        backgroundColor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {safeRedirectTo && <input type="hidden" name="redirect" value={safeRedirectTo} />}

      <div>
        <label
          htmlFor="accessCode"
          className="block text-sm font-medium mb-2"
          style={{ color: '#ffffff' }}
        >
          Kode Akses
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
          <input
            ref={inputRef}
            id="accessCode"
            name="accessCode"
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Masukkan kode akses (contoh: GSD5WAFM)"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onInput={(e) => setAccessCode(e.currentTarget.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 rounded-lg placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
              fontSize: '16px',
            }}
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
        disabled={loading}
        className="w-full px-4 py-3 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: '#a855f7',
          backgroundImage:
            loading
              ? 'linear-gradient(90deg, #475569, #475569)'
              : 'linear-gradient(90deg, #a855f7, #ec4899)',
          color: '#ffffff',
        }}
      >
        {loading ? 'Memverifikasi...' : 'Login'}
      </button>

      <p className="text-center text-xs" style={{ color: '#94a3b8' }}>
        Kode akses dapat diminta kepada admin yang membuat project pernikahan Anda
      </p>
    </form>
  )
}
