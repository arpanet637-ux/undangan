'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, UserPlus } from 'lucide-react'

type UserRow = { id: string; name: string; email: string; createdAt: string }

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadUsers() {
    const res = await fetch('/api/super-admin/users')
    if (res.ok) setUsers((await res.json()).users)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat user.')
      setSuccess(`User ${data.user.email} berhasil dibuat. Login di /sign-in.`)
      setName('')
      setEmail('')
      setPassword('')
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat user.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-slate-900 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/super-admin" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Kelola User</h1>
          <p className="text-slate-400">Buat akun baru untuk login ke halaman Super Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4 mb-10">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Nama</label>
            <input value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Kata Sandi (min. 8 karakter)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className={inputClass} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium rounded-md disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" /> {loading ? 'Membuat...' : 'Buat User'}
          </button>
        </form>

        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 text-white font-medium">Daftar User ({users.length})</div>
          {users.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">Belum ada user.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {users.map(u => (
                <li key={u.id} className="px-6 py-4 flex justify-between gap-4 text-sm">
                  <div>
                    <div className="text-white">{u.name}</div>
                    <div className="text-slate-400">{u.email}</div>
                  </div>
                  <div className="text-slate-500 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('id-ID')}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
