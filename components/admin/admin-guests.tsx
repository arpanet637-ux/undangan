'use client'

import { useState, useEffect } from 'react'
import { useAdminContext } from './admin-layout'
import { Save, Plus, Trash2, Pencil, Copy, Check, ExternalLink, Search, MessageCircle, UserCheck, UserX, Clock, CheckCircle } from 'lucide-react'

interface GuestData {
  id: number
  name: string
  phone: string | null
  address: string | null
  invitationCode: string | null
  invitation_code?: string | null
  totalInvitation: number | null
  total_invitation?: number | null
  isAttended: number | null
  is_attended?: number | null
  attendedTotal: number | null
  attended_total?: number | null
}

function normalize(d: Record<string, unknown>): GuestData {
  return {
    id: d.id as number,
    name: d.name as string,
    phone: (d.phone || null) as string | null,
    address: (d.address || null) as string | null,
    invitationCode: (d.invitationCode || d.invitation_code || null) as string | null,
    totalInvitation: (d.totalInvitation ?? d.total_invitation ?? 1) as number,
    isAttended: (d.isAttended ?? d.is_attended ?? null) as number | null,
    attendedTotal: (d.attendedTotal ?? d.attended_total ?? 0) as number,
  }
}

const emptyForm = { name: '', phone: '', address: '', total_invitation: '1', invitation_code: '' }

// Mirrors the server-side slugify in lib/admin-utils.ts, used only to show a live
// preview of the link as the admin types — the server always re-slugifies and
// dedupes before saving, so this preview never needs to be perfectly in sync.
function previewSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function AdminGuests({ adminCode }: { adminCode: string }) {
  const { wedding } = useAdminContext()
  const [guests, setGuests] = useState<GuestData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState(emptyForm)
  // Tracks whether the admin has manually typed in the code field, so auto-suggesting
  // a slug from the name doesn't clobber a code they intentionally customized.
  const [codeTouched, setCodeTouched] = useState(false)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [waTemplate, setWaTemplate] = useState<string | null>(null)
  const [events, setEvents] = useState<Array<{ eventDate?: string | null; eventTime?: string | null; venueName?: string | null; venueAddress?: string | null; mapsUrl?: string | null }>>([])
  const [successMsg, setSuccessMsg] = useState('')

  const fetchGuests = async () => {
    const res = await fetch(`/api/admin/${adminCode}/guests`)
    const data = await res.json()
    setGuests(Array.isArray(data) ? data.map(normalize) : [])
    setLoading(false)
  }

  const fetchTemplate = async () => {
    const [settingsRes, eventsRes] = await Promise.all([
      fetch(`/api/admin/${adminCode}/settings`),
      fetch(`/api/admin/${adminCode}/events`),
    ])
    const settings = await settingsRes.json()
    const eventData = await eventsRes.json()
    if (settings?.wa_template) setWaTemplate(settings.wa_template)
    setEvents(Array.isArray(eventData) ? eventData : [])
  }

  useEffect(() => {
    fetchGuests()
    fetchTemplate()
  }, [adminCode])

  const handleSave = async () => {
    if (!form.name.trim()) return
    const url = editingId === 'new'
      ? `/api/admin/${adminCode}/guests`
      : `/api/admin/${adminCode}/guests/${editingId}`
    const method = editingId === 'new' ? 'POST' : 'PUT'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setEditingId(null)
    setSuccessMsg('Tamu berhasil disimpan')
    setTimeout(() => location.reload(), 1500)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus tamu ini?')) return
    await fetch(`/api/admin/${adminCode}/guests/${id}`, { method: 'DELETE' })
    fetchGuests()
  }

  const copyLink = (g: GuestData) => {
    const link = `${window.location.origin}/w/${wedding?.slug}/to/${g.invitationCode}`
    navigator.clipboard.writeText(link)
    setCopiedId(g.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const shareWA = (g: GuestData) => {
    const link = `${window.location.origin}/w/${wedding?.slug}/to/${g.invitationCode}`
    const event = events[0]
    const formatDate = (value?: string | null) => {
      if (!value) return '-'
      const date = new Date(`${value}T00:00:00`)
      return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
    }
    const values: Record<string, string> = {
      '{nama_tamu}': g.name || 'Bapak/Ibu/Saudara/i',
      '{link_undangan}': link,
      '{nama_mempelai_pria}': wedding?.groomName || 'Mempelai Pria',
      '{nama_mempelai_wanita}': wedding?.brideName || 'Mempelai Wanita',
      '{tanggal_acara}': formatDate(event?.eventDate),
      '{jam_acara}': event?.eventTime || '-',
      '{alamat_acara}': [event?.venueName, event?.venueAddress].filter(Boolean).join(', ') || '-',
      '{google_maps}': event?.mapsUrl || '-',
      '{tanggal}': formatDate(event?.eventDate),
      '{jam}': event?.eventTime || '-',
      '{alamat}': [event?.venueName, event?.venueAddress].filter(Boolean).join(', ') || '-',
      '{maps}': event?.mapsUrl || '-',
      '{link}': link,
    }
    const defaultMsg = `Kepada Yth.\nBapak/Ibu/Saudara/i\n{nama_tamu}\n\nOm Swastyastu,\n\nWAKTU & TEMPAT\nTanggal : {tanggal_acara}\nJam : {jam_acara}\nAlamat : {alamat_acara}\nGoogle Map : {google_maps}\n\n{link_undangan}`
    const template = waTemplate?.trim() || defaultMsg
    const msg = Object.entries(values).reduce((text, [variable, value]) => text.split(variable).join(value), template)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.phone || '').includes(search)
  )

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.isAttended === 1).length,
    notAttending: guests.filter(g => g.isAttended === 0).length,
    pending: guests.filter(g => g.isAttended === null).length,
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {successMsg && (
        <div className="mb-6 bg-emerald-900/30 border border-emerald-500/50 p-3 rounded flex items-center gap-2 text-emerald-400 text-sm font-body">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display text-white">Kelola Tamu</h1>
        <button
          onClick={() => { setEditingId('new'); setForm(emptyForm); setCodeTouched(false) }}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-black text-sm font-body font-semibold hover:bg-gold/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Tamu
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Hadir', value: stats.attending, color: 'text-green-400' },
          { label: 'Tidak Hadir', value: stats.notAttending, color: 'text-red-400' },
          { label: 'Belum RSVP', value: stats.pending, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="border border-white/10 p-4 text-center">
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/40 font-body mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Cari nama atau telepon..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-black border border-white/10 text-white focus:border-gold focus:outline-none font-body text-sm"
        />
      </div>

      {/* Form */}
      {editingId !== null && (
        <div className="border border-gold/30 p-5 mb-5">
          <h2 className="text-sm text-white font-body font-medium mb-4">
            {editingId === 'new' ? 'Tambah Tamu Baru' : 'Edit Tamu'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Nama Tamu *', field: 'name' },
              { label: 'No. Telepon', field: 'phone' },
              { label: 'Alamat', field: 'address' },
              { label: 'Total Undangan', field: 'total_invitation' },
            ].map(f => (
              <div key={f.field}>
                <label className="block text-xs text-white/50 font-body mb-1.5">{f.label}</label>
                <input
                  type="text"
                  value={(form as Record<string, string>)[f.field] || ''}
                  onChange={e => {
                    const value = e.target.value
                    setForm(prev => ({
                      ...prev,
                      [f.field]: value,
                      // Auto-suggest the link code from the name as it's typed, unless
                      // the admin has already customized the code field by hand.
                      ...(f.field === 'name' && !codeTouched ? { invitation_code: previewSlug(value) } : {}),
                    }))
                  }}
                  className="w-full px-4 py-2.5 bg-black border border-white/10 text-white focus:border-gold focus:outline-none font-body text-sm"
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-xs text-white/50 font-body mb-1.5">Kode Link (nama panggilan)</label>
            <input
              type="text"
              value={form.invitation_code}
              onChange={e => { setCodeTouched(true); setForm({ ...form, invitation_code: previewSlug(e.target.value) }) }}
              placeholder="contoh: ari"
              className="w-full px-4 py-2.5 bg-black border border-white/10 text-white focus:border-gold focus:outline-none font-body text-sm"
            />
            <p className="text-xs text-white/30 font-body mt-1.5 break-all">
              {wedding ? `${window.location.origin}/w/${wedding.slug}/to/${form.invitation_code || previewSlug(form.name) || '...'}` : ''}
            </p>
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-white/40 text-white/80 hover:text-white hover:border-white/60 text-sm font-body transition-colors">Batal</button>
            <button onClick={handleSave} className="px-5 py-2 bg-gold text-black text-sm font-body font-semibold flex items-center gap-2 hover:bg-gold/90 transition-colors">
              <Save className="w-4 h-4" />Simpan
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30 font-body text-sm border border-white/5">
          {search ? 'Tidak ada tamu yang cocok' : 'Belum ada tamu'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-4 text-xs text-white/40 font-body font-normal">Nama</th>
                <th className="text-left py-3 pr-4 text-xs text-white/40 font-body font-normal hidden md:table-cell">Kontak</th>
                <th className="text-center py-3 pr-4 text-xs text-white/40 font-body font-normal">Status</th>
                <th className="text-right py-3 text-xs text-white/40 font-body font-normal">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="py-3 pr-4">
                    <p className="text-white font-body">{g.name}</p>
                    <p className="text-xs text-white/30 font-body">{g.invitationCode}</p>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <p className="text-white/60 font-body text-xs">{g.phone || '-'}</p>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    {g.isAttended === 1 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400">
                        <UserCheck className="w-3 h-3" />Hadir
                      </span>
                    ) : g.isAttended === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-red-400">
                        <UserX className="w-3 h-3" />Tidak
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-white/30">
                        <Clock className="w-3 h-3" />Belum
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => copyLink(g)} className="p-1.5 text-white/30 hover:text-gold">
                        {copiedId === g.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => shareWA(g)} className="p-1.5 text-white/30 hover:text-green-400">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      {wedding && (
                        <a href={`/w/${wedding.slug}/to/${g.invitationCode}`} target="_blank" className="p-1.5 text-white/30 hover:text-gold">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={() => { setEditingId(g.id); setForm({ name: g.name, phone: g.phone || '', address: g.address || '', total_invitation: String(g.totalInvitation || 1), invitation_code: g.invitationCode || '' }); setCodeTouched(true) }} className="p-1.5 text-white/30 hover:text-gold">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(g.id)} className="p-1.5 text-white/30 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
