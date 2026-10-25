'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import {
  Heart, Plus, Settings, Eye, Trash2, LogOut, Calendar,
  Clock, Copy, Check, Pencil, ExternalLink, MessageCircle,
  Search, X, Users, ChevronDown, ChevronUp,
} from 'lucide-react'

interface Wedding {
  id: number
  slug: string
  adminCode: string
  groomName: string
  brideName: string
  weddingDate: string | null
  title: string | null
  createdAt: string
  isActive: number
  totalGuests: number
  openedCount: number
  attendingCount: number
  totalWishes: number
}

interface User {
  id: string
  name: string
  email: string
}

interface EditForm {
  groomName: string
  brideName: string
  weddingDate: string
  adminCode: string
}

function getDaysUntil(dateStr: string | null): string | null {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  if (diff < 0) return `${Math.abs(diff)} hari lalu`
  if (diff === 0) return 'Hari ini'
  return `${diff} hari lagi`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function DashboardClient({ user }: { user: User }) {
  const router = useRouter()
  const [weddings, setWeddings] = useState<Wedding[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [groomName, setGroomName] = useState('')
  const [brideName, setBrideName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ groomName: '', brideName: '', weddingDate: '', adminCode: '' })
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchWeddings = async () => {
    const res = await fetch('/api/admin/weddings')
    if (res.ok) setWeddings(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchWeddings() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/admin/weddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groomName, brideName }),
    })
    if (res.ok) {
      setGroomName('')
      setBrideName('')
      setShowCreate(false)
      fetchWeddings()
    }
    setCreating(false)
  }

  const openEdit = (w: Wedding) => {
    setEditForm({
      groomName: w.groomName || '',
      brideName: w.brideName || '',
      weddingDate: w.weddingDate || '',
      adminCode: w.adminCode,
    })
    setEditingId(w.id)
  }

  const handleSave = async () => {
    if (!editingId) return
    setSaving(true)
    const res = await fetch(`/api/admin/weddings/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      setEditingId(null)
      fetchWeddings()
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus undangan ini? Semua data tamu dan ucapan akan ikut terhapus.')) return
    await fetch(`/api/admin/weddings/${id}`, { method: 'DELETE' })
    fetchWeddings()
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(key)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filtered = weddings.filter(w => {
    const q = search.toLowerCase()
    return (
      (w.groomName || '').toLowerCase().includes(q) ||
      (w.brideName || '').toLowerCase().includes(q) ||
      w.adminCode.toLowerCase().includes(q)
    )
  })

  const totalGuests = weddings.reduce((s, w) => s + w.totalGuests, 0)
  const totalActive = weddings.filter(w => w.isActive === 1).length
  const totalAttending = weddings.reduce((s, w) => s + w.attendingCount, 0)

  const inputCls = 'w-full bg-[#1a1a1a] border border-white/10 px-3 py-2.5 text-white text-sm font-body focus:outline-none focus:border-white/30 placeholder:text-white/20'
  const labelCls = 'block text-[10px] tracking-[0.2em] text-white/40 font-body uppercase mb-1.5'

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">

      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#b8956f]" />
          <span className="font-display text-white text-base tracking-wide">Pawiwahan</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-white/40 text-sm font-body hidden sm:block">Super Admin</span>
          <span className="text-white/40 text-sm font-body hidden sm:block">{user.name}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-body transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Title + Create button */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display text-white">Dashboard</h1>
            <p className="text-white/40 text-sm font-body mt-1">Kelola semua undangan pernikahan Anda</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#b8956f] text-white hover:bg-[#a07d5f] text-sm font-body font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Buat Undangan Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Undangan', value: weddings.length },
            { label: 'Aktif', value: totalActive },
            { label: 'Total Tamu', value: totalGuests },
            { label: 'Konfirmasi Hadir', value: totalAttending },
          ].map(s => (
            <div key={s.label} className="bg-[#161616] border border-white/5 p-4">
              <p className="text-2xl font-semibold text-white">{loading ? '-' : s.value}</p>
              <p className="text-xs text-white/30 font-body mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari undangan..."
            className="w-full bg-[#161616] border border-white/5 pl-11 pr-4 py-3 text-sm text-white font-body placeholder:text-white/20 focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Wedding list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-white/5">
            <Heart className="w-10 h-10 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-body text-sm">Belum ada undangan</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(w => {
              const daysUntil = getDaysUntil(w.weddingDate)
              const isEditing = editingId === w.id
              const origin = typeof window !== 'undefined' ? window.location.origin : ''

              return (
                <div key={w.id} className="bg-[#161616] border border-white/5">
                  {/* Row */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">

                    {/* Left: names + meta */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg text-white leading-tight">
                        {w.groomName} &amp; {w.brideName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {/* Kode Akses */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-white/30 font-body">Kode:</span>
                          <span className="bg-[#222] border border-white/10 px-2 py-0.5 text-xs text-[#b8956f] font-mono tracking-wider">
                            {w.adminCode}
                          </span>
                          <button
                            onClick={() => copyToClipboard(w.adminCode, `code-${w.id}`)}
                            className="text-white/30 hover:text-white transition-colors"
                          >
                            {copiedId === `code-${w.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        {/* Date */}
                        {w.weddingDate && (
                          <div className="flex items-center gap-1.5 text-white/40 text-xs font-body">
                            <Calendar className="w-3 h-3" />
                            {formatDate(w.weddingDate)}
                          </div>
                        )}
                        {/* Countdown */}
                        {daysUntil && (
                          <div className="flex items-center gap-1 text-xs font-body text-[#b8956f]">
                            <Clock className="w-3 h-3" />
                            {daysUntil}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-5">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-white">{w.totalGuests}</p>
                        <p className="text-[10px] text-white/30 font-body">Tamu</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-white">{w.openedCount}</p>
                        <p className="text-[10px] text-white/30 font-body">Dibuka</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-[#b8956f]">{w.attendingCount}</p>
                        <p className="text-[10px] text-white/30 font-body">Hadir</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* Copy link */}
                      <button
                        onClick={() => copyToClipboard(`${origin}/w/${w.slug}`, `link-${w.id}`)}
                        className="p-2 text-white/30 hover:text-white hover:bg-white/5 transition-all"
                        title="Salin link undangan"
                      >
                        {copiedId === `link-${w.id}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {/* WhatsApp */}
                      <button
                        onClick={async () => {
                          const link = `${origin}/w/${w.slug}`
                          let msg = `Berikut link undangan pernikahan kami:\n${link}`
                          try {
                            const res = await fetch(`/api/admin/${w.adminCode}/settings`)
                            const s = await res.json()
                            if (s?.wa_template) {
                              msg = s.wa_template
                                .replace(/\{nama_tamu\}/g, '')
                                .replace(/\{link_undangan\}/g, link)
                                .replace(/\{nama_mempelai_pria\}/g, w.groomName || '')
                                .replace(/\{nama_mempelai_wanita\}/g, w.brideName || '')
                                .trim()
                            }
                          } catch { /* use default */ }
                          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                        }}
                        className="p-2 text-white/30 hover:text-green-400 hover:bg-white/5 transition-all"
                        title="Bagikan via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      {/* Open */}
                      <a
                        href={`/w/${w.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-white/30 hover:text-white hover:bg-white/5 transition-all"
                        title="Buka undangan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {/* Edit */}
                      <button
                        onClick={() => isEditing ? setEditingId(null) : openEdit(w)}
                        className={`p-2 transition-all hover:bg-white/5 ${isEditing ? 'text-[#b8956f]' : 'text-white/30 hover:text-white'}`}
                        title="Edit undangan"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="p-2 text-white/30 hover:text-red-400 hover:bg-white/5 transition-all"
                        title="Hapus undangan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {/* Kelola */}
                      <a
                        href={`/admin/${w.adminCode}`}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white/70 hover:border-[#b8956f]/50 hover:text-[#b8956f] text-xs font-body transition-all ml-1"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Kelola
                      </a>
                    </div>
                  </div>

                  {/* Inline edit panel */}
                  {isEditing && (
                    <div className="border-t border-white/5 bg-[#111] p-5">
                      <h4 className="text-xs tracking-[0.2em] text-white/40 font-body uppercase mb-4">Edit Undangan</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className={labelCls}>Nama Mempelai Pria</label>
                          <input
                            type="text"
                            value={editForm.groomName}
                            onChange={e => setEditForm({ ...editForm, groomName: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Nama Mempelai Wanita</label>
                          <input
                            type="text"
                            value={editForm.brideName}
                            onChange={e => setEditForm({ ...editForm, brideName: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Tanggal Pernikahan</label>
                          <input
                            type="date"
                            value={editForm.weddingDate}
                            onChange={e => setEditForm({ ...editForm, weddingDate: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Kode Akses Client</label>
                          <input
                            type="text"
                            value={editForm.adminCode}
                            onChange={e => setEditForm({ ...editForm, adminCode: e.target.value.toUpperCase() })}
                            className={inputCls}
                            placeholder="Contoh: ADMIN123"
                          />
                          <p className="text-[10px] text-white/25 font-body mt-1">
                            Kode ini digunakan client untuk login ke halaman admin mereka
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-5 py-2 bg-[#b8956f] text-white text-xs font-body font-semibold tracking-wider uppercase hover:bg-[#a07d5f] disabled:opacity-50 transition-colors"
                        >
                          {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-5 py-2 border border-white/40 text-white/80 text-xs font-body tracking-wider uppercase hover:border-white/60 hover:text-white transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}
        >
          <div className="bg-[#161616] border border-white/10 w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display text-white">Buat Undangan Baru</h2>
              <button onClick={() => setShowCreate(false)} className="text-white/30 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>Nama Mempelai Pria</label>
                <input
                  type="text"
                  value={groomName}
                  onChange={e => setGroomName(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="Contoh: Ari Pradana"
                />
              </div>
              <div>
                <label className={labelCls}>Nama Mempelai Wanita</label>
                <input
                  type="text"
                  value={brideName}
                  onChange={e => setBrideName(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="Contoh: Nadya Pratiwi"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-white/40 text-white/80 text-sm font-body hover:border-white/60 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating || !groomName.trim() || !brideName.trim()}
                  className="flex-1 py-2.5 bg-[#b8956f] text-white text-sm font-body font-semibold hover:bg-[#a07d5f] disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Membuat...' : 'Buat Undangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
