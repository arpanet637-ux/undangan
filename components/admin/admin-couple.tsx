'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, User, CheckCircle, Plus, Trash2 } from 'lucide-react'
import { FileUpload } from '@/components/file-upload'

interface CoupleData {
  id: number
  role: string
  full_name: string
  nickname: string
  photo_url: string
  father_name: string
  mother_name: string
  address: string
  child_order: string
}

function InputField({ label, value, onChange, className = '' }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs text-white/50 font-body mb-1.5">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-black border border-white/10 text-white focus:border-gold focus:outline-none font-body text-sm"
      />
    </div>
  )
}

interface MetatahParticipant {
  id: string
  fullName: string
  nickname: string
  parentName: string
  instagramUrl: string
  avatar: string
}

function MetatahParticipantForm({ adminCode }: { adminCode: string }) {
  const [participants, setParticipants] = useState<MetatahParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/${adminCode}/settings`)
      .then(r => r.json())
      .then(settings => {
        try {
          const parsed = JSON.parse(settings.participants || '[]')
          setParticipants(Array.isArray(parsed) ? parsed.map((p: Partial<MetatahParticipant>, i: number) => ({
            id: String(p.id || `participant-${i + 1}`),
            fullName: p.fullName || '', nickname: p.nickname || '', parentName: p.parentName || '', instagramUrl: p.instagramUrl || p.instagram || '', avatar: p.avatar || p.photoUrl || '',
          })) : [])
        } catch { setParticipants([]) }
        setLoading(false)
      })
      .catch(() => { setError('Gagal memuat data peserta'); setLoading(false) })
  }, [adminCode])

  const update = (id: string, field: keyof MetatahParticipant, value: string) =>
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))

  const add = () => {
    if (participants.length >= 9) return
    setParticipants(prev => [...prev, { id: `participant-${Date.now()}`, fullName: '', nickname: '', parentName: '', instagramUrl: '', avatar: '' }])
  }
  const remove = (id: string) => setParticipants(prev => prev.filter(p => p.id !== id))

  const save = async () => {
    if (participants.some(p => !p.fullName.trim())) { setError('Nama lengkap semua peserta wajib diisi'); return }
    setSaving(true); setError(null)
    try {
      const response = await fetch(`/api/admin/${adminCode}/settings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: JSON.stringify(participants) }),
      })
      if (!response.ok) throw new Error('Gagal menyimpan data peserta')
      setMessage('Data peserta Metatah berhasil disimpan')
      setTimeout(() => setMessage(''), 2500)
    } catch (err) { setError(err instanceof Error ? err.message : 'Gagal menyimpan data') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <h1 className="text-xl font-display text-white mb-2">Kelola Peserta Metatah</h1>
      <p className="text-sm text-white/50 font-body mb-6">Tambahkan peserta sebanyak yang diperlukan. Setiap peserta memiliki nama lengkap, nama panggilan, nama orang tua, dan foto avatar.</p>
      {message && <div className="mb-6 bg-emerald-900/30 border border-emerald-500/50 p-3 text-emerald-400 text-sm font-body">{message}</div>}
      {error && <div className="mb-6 bg-red-900/30 border border-red-500/50 p-3 text-red-300 text-sm font-body">{error}</div>}
      <div className="space-y-5">
        {participants.map((participant, index) => (
          <div key={participant.id} className="border border-white/10 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-body font-medium text-white">Peserta {index + 1}</h2>
              <button type="button" onClick={() => remove(participant.id)} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2"><Trash2 className="w-4 h-4" /> Hapus</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nama Lengkap" value={participant.fullName} onChange={v => update(participant.id, 'fullName', v)} />
              <InputField label="Nama Panggilan" value={participant.nickname} onChange={v => update(participant.id, 'nickname', v)} />
              <InputField label="Nama Orang Tua" value={participant.parentName} onChange={v => update(participant.id, 'parentName', v)} />
              <InputField label="Link Instagram" value={participant.instagramUrl} onChange={v => update(participant.id, 'instagramUrl', v)} />
              <div className="md:col-span-2"><FileUpload label="Foto Avatar" currentUrl={participant.avatar} onUpload={url => update(participant.id, 'avatar', url)} /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button type="button" onClick={add} disabled={participants.length >= 9} className="px-5 py-2 border border-gold text-gold text-sm font-body flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"><Plus className="w-4 h-4" /> {participants.length >= 9 ? 'Maksimal 9 Peserta' : 'Tambah Peserta'}</button>
        <button type="button" onClick={save} disabled={saving} className="px-5 py-2 bg-gold text-black text-sm font-body font-semibold flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Semua'}</button>
      </div>
    </div>
  )
}

function PersonForm({ title, data, onChange, onSave, isSaving }: {
  title: string; data: CoupleData;
  onChange: (id: number, field: keyof CoupleData, value: string) => void
  onSave: (data: CoupleData) => void
  isSaving: boolean
}) {
  return (
    <div className="border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-4 h-4 text-gold" />
        <h2 className="text-base font-body font-medium text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Nama Lengkap" value={data.full_name} onChange={v => onChange(data.id, 'full_name', v)} />
        <InputField label="Nama Panggilan" value={data.nickname} onChange={v => onChange(data.id, 'nickname', v)} />
        
        <div className="md:col-span-2">
          <FileUpload
            label="Foto"
            currentUrl={data.photo_url}
            onUpload={url => onChange(data.id, 'photo_url', url)}
          />
        </div>
        
        <InputField label="Nama Ayah" value={data.father_name} onChange={v => onChange(data.id, 'father_name', v)} />
        <InputField label="Nama Ibu" value={data.mother_name} onChange={v => onChange(data.id, 'mother_name', v)} />
        <InputField label="Anak Ke-" value={data.child_order} onChange={v => onChange(data.id, 'child_order', v)} />
        <InputField label="Alamat" value={data.address} onChange={v => onChange(data.id, 'address', v)} className="md:col-span-2" />
      </div>
      <div className="mt-5 flex justify-end">
        <button
          onClick={() => onSave(data)}
          disabled={isSaving}
          className="px-5 py-2 bg-gold text-black text-sm font-body font-semibold hover:bg-gold/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Simpan
        </button>
      </div>
    </div>
  )
}

export function AdminCouple({ adminCode }: { adminCode: string }) {
  const router = useRouter()
  const [couple, setCouple] = useState<CoupleData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [template, setTemplate] = useState('template-a')

  useEffect(() => {
    fetch(`/api/admin/${adminCode}/settings`)
      .then(r => r.json())
      .then(settings => setTemplate(settings.template || 'template-a'))
      .catch(() => setTemplate('template-a'))
  }, [adminCode])

  // Default couple data structure
  const defaultCouple: CoupleData[] = [
    { id: 1, role: 'groom', full_name: '', nickname: '', photo_url: '', father_name: '', mother_name: '', address: '', child_order: '' },
    { id: 2, role: 'bride', full_name: '', nickname: '', photo_url: '', father_name: '', mother_name: '', address: '', child_order: '' },
  ]

  useEffect(() => {
    fetch(`/api/admin/${adminCode}/couple`)
      .then(r => {
        if (!r.ok) {
          throw new Error(`API error: ${r.status}`)
        }
        return r.json()
      })
      .then(data => {
        // Map snake_case from DB to our interface
        let mappedData = Array.isArray(data) && data.length > 0 
          ? data.map((d: Record<string, unknown>) => ({
              id: d.id as number,
              role: String(d.role || '').trim().toLowerCase(),
              full_name: (d.fullName || d.full_name || '') as string,
              nickname: (d.nickname || '') as string,
              photo_url: (d.photoUrl || d.photo_url || '') as string,
              father_name: (d.fatherName || d.father_name || '') as string,
              mother_name: (d.motherName || d.mother_name || '') as string,
              address: (d.address || '') as string,
              child_order: (d.childOrder || d.child_order || '') as string,
            }))
          : []
        
        // Ensure we have both groom and bride
        const hasGroom = mappedData.some(c => c.role === 'groom')
        const hasBride = mappedData.some(c => c.role === 'bride')
        
        if (!hasGroom) {
          mappedData.push(defaultCouple[0]) // Add default groom
        }
        if (!hasBride) {
          mappedData.push(defaultCouple[1]) // Add default bride
        }
        
        // Sort by role: groom first, then bride
        mappedData.sort((a, b) => {
          if (a.role === 'groom' && b.role === 'bride') return -1
          if (a.role === 'bride' && b.role === 'groom') return 1
          return 0
        })
        
        setCouple(mappedData)
        setLoading(false)
      })
      .catch(err => {
        console.error('[v0] Fetch error:', err)
        setLoadError(err.message)
        setLoading(false)
      })
  }, [adminCode])

  const handleChange = (id: number, field: keyof CoupleData, value: string) => {
    setCouple(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const handleSave = async (person: CoupleData) => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch(`/api/admin/${adminCode}/couple/${person.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API error: ${response.status}`)
      }
      
      setSaved(person.id)
      setSuccessMsg('Data mempelai berhasil disimpan')
      setSaving(false)
      
      // Clear success message after 2 seconds without reloading
      setTimeout(() => setSuccessMsg(''), 2000)
    } catch (err) {
      setSaving(false)
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data')
    }
  }

  const groom = couple.find(c => c.role === 'groom')
  const bride = couple.find(c => c.role === 'bride')

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (template === 'template-c') return <MetatahParticipantForm adminCode={adminCode} />

  if (loadError) return (
    <div className="p-6 md:p-8 max-w-4xl">
      <h1 className="text-xl font-display text-white mb-6">Kelola Mempelai</h1>
      <div className="bg-red-500/20 border border-red-500 p-4 rounded text-red-200 font-body text-sm">
        Error loading data: {loadError}
      </div>
    </div>
  )

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <h1 className="text-xl font-display text-white mb-6">Kelola Mempelai</h1>
      {successMsg && (
        <div className="mb-6 bg-emerald-900/30 border border-emerald-500/50 p-3 rounded flex items-center gap-2 text-emerald-400 text-sm font-body">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-500/50 p-3 rounded text-red-300 text-sm font-body">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-200">×</button>
        </div>
      )}
      <div className="space-y-6">
        {groom && <PersonForm title="Mempelai Pria" data={groom} onChange={handleChange} onSave={handleSave} isSaving={saving} />}
        {bride && <PersonForm title="Mempelai Wanita" data={bride} onChange={handleChange} onSave={handleSave} isSaving={saving} />}
      </div>
    </div>
  )
}
