'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Image, CheckCircle } from 'lucide-react'
import { FileUpload } from '@/components/file-upload'

interface GalleryItem {
  id: number
  photoUrl: string
  photo_url?: string
  caption: string | null
  sortOrder: number | null
  sort_order?: number | null
}

export function AdminGallery({ adminCode }: { adminCode: string }) {
  const [photos, setPhotos] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [photoUrl, setPhotoUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [adding, setAdding] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchPhotos = async () => {
    const res = await fetch(`/api/admin/${adminCode}/gallery`)
    const data = await res.json()
    setPhotos(Array.isArray(data) ? data.map((d: Record<string, unknown>) => ({
      id: d.id as number,
      photoUrl: (d.photoUrl || d.photo_url || '') as string,
      caption: (d.caption || null) as string | null,
      sortOrder: (d.sortOrder ?? d.sort_order ?? 0) as number,
    })) : [])
    setLoading(false)
  }

  useEffect(() => { fetchPhotos() }, [adminCode])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photoUrl.trim()) {
      setErrorMsg('Pilih foto terlebih dahulu')
      return
    }
    setAdding(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch(`/api/admin/${adminCode}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_url: photoUrl, caption, sort_order: photos.length }),
      })
      const data = await res.json()
      if (res.ok) {
        setPhotoUrl('')
        setCaption('')
        setSuccessMsg('Foto berhasil ditambahkan')
        // Refresh the photo list
        await fetchPhotos()
        // Clear success message after 2 seconds
        setTimeout(() => setSuccessMsg(''), 2000)
      } else {
        setErrorMsg(data.error || 'Gagal menambah foto')
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setErrorMsg(errMsg)
      console.error('[v0] Gallery upload error:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus foto ini?')) return
    await fetch(`/api/admin/${adminCode}/gallery/${id}`, { method: 'DELETE' })
    fetchPhotos()
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
      {errorMsg && (
        <div className="mb-6 bg-red-900/30 border border-red-500/50 p-3 rounded text-red-400 text-sm font-body">
          {errorMsg}
        </div>
      )}
      <h1 className="text-xl font-display text-white mb-6">Kelola Galeri</h1>

      {/* Add photo form */}
      <form onSubmit={handleAdd} className="border border-white/10 p-5 mb-6">
        <h2 className="text-sm text-white font-body font-medium mb-4">Tambah Foto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <FileUpload
              label="Foto *"
              onUpload={url => setPhotoUrl(url)}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 font-body mb-1.5">Keterangan (opsional)</label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="w-full px-4 py-2.5 bg-black border border-white/10 text-white focus:border-gold focus:outline-none font-body text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={adding || !photoUrl}
          className="flex items-center gap-2 px-5 py-2 bg-gold text-black text-sm font-body font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Tambah Foto
        </button>
      </form>

      {/* Gallery grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16 border border-white/5 text-white/30 font-body text-sm">
          <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Belum ada foto galeri
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map(p => (
            <div key={p.id} className="relative group aspect-square bg-white/5">
              <img src={p.photoUrl} alt={p.caption || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/80 text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {p.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                  <p className="text-xs text-white/80 font-body truncate">{p.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
