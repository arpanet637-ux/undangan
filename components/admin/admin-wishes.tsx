'use client'

import { useState, useEffect } from 'react'
import { Trash2, MessageCircle } from 'lucide-react'

interface Wish {
  id: number
  guestName: string
  guest_name?: string
  message: string
  attendance: string | null
  createdAt: string
  created_at?: string
}

export function AdminWishes({ adminCode }: { adminCode: string }) {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWishes = async () => {
    const res = await fetch(`/api/admin/${adminCode}/wishes`)
    const data = await res.json()
    setWishes(Array.isArray(data) ? data.map((d: Record<string, unknown>) => ({
      id: d.id as number,
      guestName: (d.guestName || d.guest_name || '') as string,
      message: d.message as string,
      attendance: (d.attendance || null) as string | null,
      createdAt: (d.createdAt || d.created_at || '') as string,
    })) : [])
    setLoading(false)
  }

  useEffect(() => { fetchWishes() }, [adminCode])

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus ucapan ini?')) return
    await fetch(`/api/admin/${adminCode}/wishes?id=${id}`, { method: 'DELETE' })
    fetchWishes()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display text-white">Ucapan & Doa</h1>
        <span className="text-white/40 text-sm font-body">{wishes.length} ucapan</span>
      </div>

      {wishes.length === 0 ? (
        <div className="text-center py-20 border border-white/5 text-white/30 font-body text-sm">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Belum ada ucapan
        </div>
      ) : (
        <div className="space-y-3">
          {wishes.map(w => (
            <div key={w.id} className="border border-white/10 p-5 flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-white font-body font-medium">{w.guestName}</span>
                  {w.attendance && (
                    <span className={`text-xs px-2 py-0.5 ${w.attendance === 'hadir' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {w.attendance}
                    </span>
                  )}
                  <span className="text-xs text-white/30 font-body ml-auto">
                    {new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-white/60 text-sm font-body leading-relaxed">{w.message}</p>
              </div>
              <button onClick={() => handleDelete(w.id)} className="p-1.5 text-white/30 hover:text-red-400 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
