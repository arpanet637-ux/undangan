'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Gift, Pencil, CheckCircle } from 'lucide-react'

interface GiftData {
  id: number
  bankName: string
  bank_name?: string
  accountNumber: string
  account_number?: string
  accountName: string
  account_name?: string
}

function normalize(d: Record<string, unknown>): GiftData {
  return {
    id: d.id as number,
    bankName: (d.bankName || d.bank_name || '') as string,
    accountNumber: (d.accountNumber || d.account_number || '') as string,
    accountName: (d.accountName || d.account_name || '') as string,
  }
}

const emptyForm = { bank_name: '', account_number: '', account_name: '' }

export function AdminGifts({ adminCode }: { adminCode: string }) {
  const router = useRouter()
  const [gifts, setGifts] = useState<GiftData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchGifts = async () => {
    const res = await fetch(`/api/admin/${adminCode}/gifts`)
    const data = await res.json()
    setGifts(Array.isArray(data) ? data.map(normalize) : [])
    setLoading(false)
  }

  useEffect(() => { fetchGifts() }, [adminCode])

  const handleSave = async () => {
    const url = editingId === 'new' ? `/api/admin/${adminCode}/gifts` : `/api/admin/${adminCode}/gifts/${editingId}`
    const method = editingId === 'new' ? 'POST' : 'PUT'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setEditingId(null)
    setSuccessMsg('Rekening berhasil disimpan')
    setTimeout(() => location.reload(), 1500)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus rekening ini?')) return
    await fetch(`/api/admin/${adminCode}/gifts/${id}`, { method: 'DELETE' })
    fetchGifts()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {successMsg && (
        <div className="mb-6 bg-emerald-900/30 border border-emerald-500/50 p-3 rounded flex items-center gap-2 text-emerald-400 text-sm font-body">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display text-white">Hadiah Pernikahan</h1>
        <button
          onClick={() => { setEditingId('new'); setForm(emptyForm) }}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-black text-sm font-body font-semibold hover:bg-gold/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Rekening
        </button>
      </div>

      {editingId !== null && (
        <div className="border border-gold/30 p-5 mb-5">
          <h2 className="text-sm text-white font-body font-medium mb-4">
            {editingId === 'new' ? 'Tambah Rekening Baru' : 'Edit Rekening'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Nama Bank', field: 'bank_name' },
              { label: 'Nomor Rekening', field: 'account_number' },
              { label: 'Nama Pemilik', field: 'account_name' },
            ].map(f => (
              <div key={f.field}>
                <label className="block text-xs text-white/50 font-body mb-1.5">{f.label}</label>
                <input
                  type="text"
                  value={(form as Record<string, string>)[f.field] || ''}
                  onChange={e => setForm({ ...form, [f.field]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-white/10 text-white focus:border-gold focus:outline-none font-body text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-white/40 text-white/80 hover:text-white hover:border-white/60 text-sm font-body transition-colors">Batal</button>
            <button onClick={handleSave} className="px-5 py-2 bg-gold text-black text-sm font-body font-semibold flex items-center gap-2 hover:bg-gold/90 transition-colors">
              <Save className="w-4 h-4" />Simpan
            </button>
          </div>
        </div>
      )}

      {gifts.length === 0 ? (
        <div className="text-center py-16 border border-white/5 text-white/30 font-body text-sm">
          <Gift className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Belum ada rekening
        </div>
      ) : (
        <div className="space-y-3">
          {gifts.map(g => (
            <div key={g.id} className="border border-white/10 p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-body font-medium">{g.bankName}</p>
                <p className="text-gold font-body text-sm mt-1">{g.accountNumber}</p>
                <p className="text-white/50 font-body text-xs mt-0.5">a.n. {g.accountName}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingId(g.id); setForm({ bank_name: g.bankName, account_number: g.accountNumber, account_name: g.accountName }) }} className="p-2 text-white/40 hover:text-gold">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(g.id)} className="p-2 text-white/40 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
