'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, Calendar, MapPin, Pencil, CheckCircle } from 'lucide-react'

interface EventData {
  id: number
  eventName: string
  event_name?: string
  eventDate: string | null
  event_date?: string | null
  eventTime: string | null
  event_time?: string | null
  venueName: string | null
  venue_name?: string | null
  venueAddress: string | null
  venue_address?: string | null
  mapsUrl: string | null
  maps_url?: string | null
}

function normalizeEvent(d: Record<string, unknown>): EventData {
  return {
    id: d.id as number,
    eventName: (d.eventName || d.event_name || '') as string,
    eventDate: (d.eventDate || d.event_date || null) as string | null,
    eventTime: (d.eventTime || d.event_time || null) as string | null,
    venueName: (d.venueName || d.venue_name || null) as string | null,
    venueAddress: (d.venueAddress || d.venue_address || null) as string | null,
    mapsUrl: (d.mapsUrl || d.maps_url || null) as string | null,
  }
}

function InputField({ label, value, onChange, type = 'text', className = '', placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string; placeholder?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs text-white/50 font-body mb-1.5">{label}</label>
      <input
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-black border border-white/10 text-white focus:border-gold focus:outline-none font-body text-sm placeholder:text-white/20"
      />
    </div>
  )
}

const emptyForm = { name: '', event_date: '', start_time: '', end_time: '', venue: '', address: '', maps_url: '' }

export function AdminEvents({ adminCode }: { adminCode: string }) {
  const router = useRouter()
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [successMsg, setSuccessMsg] = useState('')

  const fetch_events = async () => {
    const res = await fetch(`/api/admin/${adminCode}/events`)
    const data = await res.json()
    setEvents(Array.isArray(data) ? data.map(normalizeEvent) : [])
    setLoading(false)
  }

  useEffect(() => { fetch_events() }, [adminCode])

  const handleEdit = (e: EventData) => {
    const timeParts = e.eventTime?.split(' - ') || []
    setEditingId(e.id)
    setForm({
      name: e.eventName,
      event_date: e.eventDate?.split('T')[0] || '',
      start_time: timeParts[0] || '',
      end_time: timeParts[1] || '',
      venue: e.venueName || '',
      address: e.venueAddress || '',
      maps_url: e.mapsUrl || '',
    })
  }

  const handleSave = async () => {
    if (!form.name?.trim()) return
    const url = editingId === 'new'
      ? `/api/admin/${adminCode}/events`
      : `/api/admin/${adminCode}/events/${editingId}`
    const method = editingId === 'new' ? 'POST' : 'PUT'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setEditingId(null)
    setSuccessMsg('Acara berhasil disimpan')
    setTimeout(() => location.reload(), 1500)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus acara ini?')) return
    await fetch(`/api/admin/${adminCode}/events/${id}`, { method: 'DELETE' })
    fetch_events()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {successMsg && (
        <div className="mb-6 bg-emerald-900/30 border border-emerald-500/50 p-3 rounded flex items-center gap-2 text-emerald-400 text-sm font-body">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display text-white">Kelola Acara</h1>
        <button
          onClick={() => { setEditingId('new'); setForm(emptyForm) }}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-black text-sm font-body font-semibold hover:bg-gold/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Acara
        </button>
      </div>

      {editingId !== null && (
        <div className="border border-gold/30 p-6 mb-6">
          <h2 className="text-base text-white font-body font-medium mb-5">
            {editingId === 'new' ? 'Tambah Acara Baru' : 'Edit Acara'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Nama Acara" value={form.name} onChange={v => setForm({ ...form, name: v })} className="md:col-span-2" />
            <InputField label="Tanggal" value={form.event_date} onChange={v => setForm({ ...form, event_date: v })} type="date" />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Waktu Mulai" value={form.start_time} onChange={v => setForm({ ...form, start_time: v })} placeholder="08:00" />
              <InputField label="Waktu Selesai" value={form.end_time} onChange={v => setForm({ ...form, end_time: v })} placeholder="12:00" />
            </div>
            <InputField label="Nama Tempat" value={form.venue} onChange={v => setForm({ ...form, venue: v })} />
            <InputField label="Alamat" value={form.address} onChange={v => setForm({ ...form, address: v })} />
            <InputField label="Link Google Maps" value={form.maps_url} onChange={v => setForm({ ...form, maps_url: v })} className="md:col-span-2" />
          </div>
          <div className="flex gap-3 justify-end mt-5">
            <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-white/40 text-white/80 hover:text-white hover:border-white/60 text-sm font-body transition-colors">Batal</button>
            <button onClick={handleSave} className="px-5 py-2 bg-gold text-black text-sm font-body font-semibold flex items-center gap-2 hover:bg-gold/90 transition-colors">
              <Save className="w-4 h-4" />Simpan
            </button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-body text-sm border border-white/5">
          Belum ada acara. Klik &quot;Tambah Acara&quot; untuk menambahkan.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="border border-white/10 p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-white font-body font-medium">{e.eventName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {e.eventDate && (
                    <span className="flex items-center gap-1.5 text-xs text-white/40 font-body">
                      <Calendar className="w-3 h-3" />
                      {new Date(e.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {e.eventTime && ` | ${e.eventTime}`}
                    </span>
                  )}
                  {e.venueName && (
                    <span className="flex items-center gap-1.5 text-xs text-white/40 font-body">
                      <MapPin className="w-3 h-3" />
                      {e.venueName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleEdit(e)} className="p-2 text-white/40 hover:text-gold">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(e.id)} className="p-2 text-white/40 hover:text-red-400">
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
