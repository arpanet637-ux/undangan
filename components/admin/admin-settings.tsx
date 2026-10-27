'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, MessageCircle, Upload, X, Plus, CheckCircle } from 'lucide-react'
import { FileUpload } from '@/components/file-upload'
import { VideoUpload } from './video-upload'

const DEFAULT_WA_TEMPLATE = `Kepada Yth.
{nama_tamu}

Dengan hormat,
Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i dalam acara pernikahan kami:

{nama_mempelai_pria} & {nama_mempelai_wanita}

Berikut link undangan digital Anda:
{link_undangan}

Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.

Terima kasih.`

// Plain XHR POST with real upload-progress events. Using XHR directly (instead of the
// @vercel/blob client's fetch-stream upload path) avoids environment-dependent hangs
// with duplex/ReadableStream uploads and keeps this same-origin, matching the proven
// FormData pattern already used by /api/upload/image elsewhere in this app.
function uploadWithProgress(url: string, formData: FormData, onProgress: (percentage: number) => void): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress((event.loaded / event.total) * 100)
    }
    xhr.onload = () => {
      let data: { url?: string; error?: string } = {}
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        // ignore parse failure, handled by status check below
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.url) {
        resolve({ url: data.url })
      } else {
        reject(new Error(data.error || 'Upload thumbnail gagal.'))
      }
    }
    xhr.onerror = () => reject(new Error('Upload gagal. Periksa koneksi internet Anda.'))
    xhr.send(formData)
  })
}

// Resizes/compresses an image client-side to the OG-recommended 1200x630 before upload.
// Phone camera photos are often several MB; shrinking them here is what makes the
// "Mengupload thumbnail..." step feel instant instead of slow.
async function compressOgImage(file: File): Promise<File> {
  const TARGET_W = 1200
  const TARGET_H = 630

  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = TARGET_W
  canvas.height = TARGET_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  // Cover-fit crop so the result always fills 1200x630 without letterboxing.
  const scale = Math.max(TARGET_W / bitmap.width, TARGET_H / bitmap.height)
  const drawW = bitmap.width * scale
  const drawH = bitmap.height * scale
  ctx.drawImage(bitmap, (TARGET_W - drawW) / 2, (TARGET_H - drawH) / 2, drawW, drawH)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8))
  if (!blob || blob.size >= file.size) return file
  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
}

// ── Music MP3 upload ─────────────────────────────────────────────────────────
function MusicUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch('/api/upload/audio', { method: 'POST', body: formData })
      
      if (!res.ok) {
        try {
          const errorData = await res.json()
          throw new Error(errorData.error || `Upload failed with status ${res.status}`)
        } catch (e) {
          throw new Error(`Upload failed with status ${res.status}`)
        }
      }
      
      const data = await res.json()
      
      // For private blobs, use pathname to access via /api/file endpoint
      if (data.pathname) {
        return `/api/file?pathname=${encodeURIComponent(data.pathname)}`
      }
      
      // Fallback to url if pathname not available
      if (data.url) {
        return data.url
      }
      
      throw new Error('No URL returned from upload')
    } catch (err) {
      throw err instanceof Error ? err : new Error('Upload failed')
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setError(null)
    setUploading(true)
    try {
      const url = await uploadFile(files[0])
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const labelCls = 'block text-xs tracking-widest font-body uppercase mb-3'

  return (
    <div>
      <label className={labelCls} style={{ color: '#b8956f', letterSpacing: '0.15em' }}>
        Upload Musik MP3
      </label>

      {/* Current file display */}
      {value && (
        <div className="mb-3 p-3 bg-white/5 rounded border border-white/10 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/70 truncate">File musik sudah di-upload</p>
            <p className="text-xs text-white/50 truncate">Musik akan autoplay saat tamu membuka undangan</p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="ml-2 p-1.5 hover:bg-white/10 rounded"
            aria-label="Hapus musik"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,audio/mpeg"
        onChange={handleFile}
        disabled={uploading}
        className="hidden"
        aria-label="Upload MP3"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 disabled:opacity-50 rounded border border-white/20 text-white text-xs font-body flex items-center justify-center gap-2 transition-colors"
      >
        <Upload className="w-4 h-4" />
        {uploading ? 'Mengupload...' : value ? 'Ubah Musik' : 'Pilih File MP3'}
      </button>

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  )
}

// ── Multi-photo upload for hero slideshow ─────────────────────────────────────
function HeroImageMultiUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse comma-separated URLs
  const images = value
    ? value.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error || 'Upload failed')
    }
    const d = await res.json()
    return d.pathname ? `/api/file?pathname=${encodeURIComponent(d.pathname)}` : d.url
  }

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setError(null)
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(uploadFile))
      const merged = [...images, ...urls]
      onChange(merged.join(','))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const remove = (idx: number) => {
    const next = images.filter((_, i) => i !== idx)
    onChange(next.join(','))
  }

  const labelCls = 'block text-xs tracking-widest font-body uppercase mb-3'

  return (
    <div>
      <label className={labelCls} style={{ color: '#b8956f', letterSpacing: '0.15em' }}>
        Foto Utama
        <span className="normal-case text-white/30 ml-2 tracking-normal">(slideshow jika lebih dari 1)</span>
      </label>

      {/* Grid of uploaded photos */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-[3/4] overflow-hidden border border-white/10">
              <img src={url} alt={`Cover ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute top-1.5 right-1.5 p-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                aria-label="Hapus foto"
              >
                <X className="w-4 h-4" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-body py-1"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#b8956f' }}>
                  Utama
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-3 border-2 border-dashed transition-all flex items-center justify-center gap-2 rounded"
        style={{
          borderColor: uploading ? '#b8956f' : '#b8956f',
          color: uploading ? '#b8956f66' : '#b8956f',
          backgroundColor: uploading ? 'rgba(184, 149, 111, 0.05)' : 'transparent',
          opacity: uploading ? 0.7 : 1,
        }}
      >
        {uploading ? (
          <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /><span className="text-sm font-body">Uploading...</span></>
        ) : (
          <><Plus className="w-5 h-5" /><span className="text-sm font-body">{images.length === 0 ? 'Tambah Foto' : 'Tambah Foto Lagi'}</span></>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFiles}
        disabled={uploading}
        className="hidden"
      />

      {images.length > 1 && (
        <p className="text-xs text-white/30 font-body mt-2">
          {images.length} foto — akan ditampilkan bergantian dengan animasi fade setiap 4 detik
        </p>
      )}
      {error && <p className="text-xs font-body mt-1.5" style={{ color: '#d9534f' }}>{error}</p>}
    </div>
  )
}

function OgThumbnailUpload({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setProgress(0)
    setError(null)
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Thumbnail harus JPG, PNG, atau WebP.')
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Ukuran thumbnail maksimal 10 MB.')
      }

      // Shrink to the OG-recommended 1200x630 first so large phone photos upload fast.
      const optimized = await compressOgImage(file)

      const formData = new FormData()
      formData.append('file', optimized)
      const result = await uploadWithProgress('/api/upload/og-image', formData, setProgress)
      if (!result.url) {
        throw new Error('Upload thumbnail gagal.')
      }
      onChange(result.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload thumbnail gagal')
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {value && (
        <div className="flex items-center gap-3 border border-white/10 bg-black/30 p-3">
          <img src={value} alt="Thumbnail OG project" loading="eager" fetchPriority="high" decoding="async" className="h-16 w-28 object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/70">Thumbnail project aktif</p>
            <p className="truncate text-[11px] text-white/35">{value}</p>
          </div>
          <button type="button" onClick={() => onChange('')} className="p-1.5 hover:bg-white/10" aria-label="Hapus thumbnail">
            <X className="h-4 w-4 text-white/70" />
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} disabled={uploading} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full border-2 border-dashed py-3 text-sm font-body transition-colors hover:bg-white/5 disabled:opacity-50"
        style={{ borderColor: '#b8956f', color: '#b8956f' }}
      >
        {uploading ? `Mengupload thumbnail... ${Math.round(progress)}%` : value ? 'Ganti Thumbnail OG' : 'Upload Thumbnail OG'}
      </button>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Atau tempel URL HTTPS publik"
        className="w-full bg-black px-4 py-2.5 text-sm text-white border border-white/10 focus:border-gold focus:outline-none"
        aria-label="URL thumbnail OG"
      />
      <p className="text-xs text-white/35">Gunakan gambar publik JPG/PNG/WebP maksimal 300 KB. URL harus diawali https://.</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

interface AdminSettingsProps {
  adminCode: string
}

export function AdminSettings({ adminCode }: AdminSettingsProps) {
  const router = useRouter()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/${adminCode}/settings`)
      .then(r => r.json())
      .then(d => { setSettings(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [adminCode])

  const set = (key: string, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  const save = async () => {
    setSaving(true)
    setMessage('')
    try {
      const r = await fetch(`/api/admin/${adminCode}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await r.json()
      if (r.ok) {
        setShowSuccess(true)
        setMessage('Pengaturan berhasil disimpan')
        setTimeout(() => setMessage(''), 2000)
      } else {
        setMessage(`Gagal menyimpan: ${data.error || 'Unknown error'}`)
        console.error('[v0] Settings save error:', data)
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setMessage(errMsg)
      console.error('[v0] Settings save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const inputCls = 'w-full px-4 py-2.5 bg-black border border-white/10 text-white focus:border-gold focus:outline-none font-body text-sm placeholder:text-white/20'
  const labelCls = 'block text-xs text-white/50 font-body mb-1.5'

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display text-white">Pengaturan</h1>
            <p className="text-sm text-white/40 font-body mt-0.5">{settings.template === 'template-c' ? 'Konfigurasi undangan Metatah' : 'Konfigurasi undangan pernikahan'}</p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <span className={`text-xs font-body flex items-center gap-1 ${showSuccess ? 'text-emerald-400' : 'text-amber-400'}`}>
                {showSuccess && <CheckCircle className="w-4 h-4" />}
                {message}
              </span>
            )}
            <a
              href={`/w/${settings.slug || ''}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors font-body"
            >
              <Eye className="w-4 h-4" />
              Preview
            </a>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-black text-sm font-semibold font-body hover:bg-gold/95 active:bg-gold/85 disabled:opacity-50 transition-colors rounded"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>

        {/* General */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="text-xs font-body text-white/50 uppercase tracking-wider mb-4">Umum</h2>
          <div>
            <label className={labelCls}>Pilih Template</label>
            <select value={settings.template || 'template-a'} onChange={e => set('template', e.target.value)} className={inputCls}>
              <option value="template-a">Template A (Light Mode)</option>
              <option value="template-b">Template B (Dark Mode)</option>
              <option value="template-c">Template C (Metatah)</option>
              <option value="template-d">Template D (Metatah)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{settings.template === 'template-c' ? 'Judul Acara Metatah' : 'Judul Undangan'}</label>
            <input value={settings.wedding_title || ''} onChange={e => set('wedding_title', e.target.value)} placeholder={settings.template === 'template-c' ? 'Metatah' : 'The Wedding of Budi & Ani'} className={inputCls} />
          </div>
          {settings.template === 'template-c' ? (
            <div className="space-y-2">
              <label className={labelCls}>Jumlah Peserta Metatah</label>
              <input
                type="number"
                min={1}
                value={settings.participant_count || '1'}
                onChange={e => set('participant_count', String(Math.max(1, Number(e.target.value) || 1)))}
                className={inputCls}
              />
              <p className="text-xs text-white/40 font-body">Atur jumlah peserta yang akan diisi pada tab Peserta Metatah. Detail nama, orang tua, dan avatar diatur di sana.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nama Mempelai Pria</label>
                <input value={settings.groom_name || ''} onChange={e => set('groom_name', e.target.value)} placeholder="Budi" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nama Mempelai Wanita</label>
                <input value={settings.bride_name || ''} onChange={e => set('bride_name', e.target.value)} placeholder="Ani" className={inputCls} />
              </div>
            </div>
          )}
        </section>

        {/* Opening cover / hero */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-4">
          <div>
            <h2 className="text-xs font-body text-white/50 uppercase tracking-wider mb-2">Foto Cover Pembuka</h2>
            <p className="text-xs text-white/35 font-body">Foto pertama yang dipilih akan dipakai sebagai background cover pembuka dan Hero Section di semua template.</p>
          </div>
          <HeroImageMultiUpload
            value={settings.hero_image || ''}
            onChange={val => set('hero_image', val)}
          />
        </section>

        {/* Custom public link */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-4">
          <div>
            <h2 className="text-xs font-body text-white/50 uppercase tracking-wider">Link Undangan</h2>
            <p className="text-xs text-white/35 font-body mt-1">Atur bagian URL setelah `/w/`. Link ini juga otomatis dipakai saat membagikan undangan ke WhatsApp.</p>
          </div>
          <div>
            <label className={labelCls}>Slug URL</label>
            <div className="flex items-center bg-black border border-white/10 focus-within:border-gold">
              <span className="pl-4 text-white/35 text-sm font-body shrink-0">/w/</span>
              <input
                value={settings.slug || ''}
                onChange={e => set('slug', e.target.value)}
                placeholder="the-wedding-of-de-agus-windy"
                className="w-full px-2.5 py-2.5 bg-transparent text-white focus:outline-none font-body text-sm"
                spellCheck={false}
              />
            </div>
            <p className="text-xs text-gold/70 font-body mt-2 break-all">{typeof window !== 'undefined' ? `${window.location.origin}/w/${settings.slug || 'slug-undangan'}` : ''}</p>
            <p className="text-xs text-white/35 font-body mt-2">Gunakan huruf kecil, angka, dan tanda hubung.</p>
          </div>
        </section>

        {/* Open Graph Thumbnail */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-4">
          <div>
            <h2 className="text-xs font-body text-white/50 uppercase tracking-wider mb-2">Thumbnail Saat Dibagikan</h2>
            <p className="text-xs text-white/35 font-body">Dipakai oleh WhatsApp dan social media untuk semua template.</p>
          </div>
          <OgThumbnailUpload value={settings.og_image || ''} onChange={value => set('og_image', value)} />
        </section>

        {/* Video */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="text-xs font-body text-white/50 uppercase tracking-wider mb-2">Video di Bawah Galeri</h2>
          <p className="text-xs text-white/35">Upload satu video MP4/WebM atau gunakan URL YouTube.</p>
          <VideoUpload value={settings.video_url || ''} onChange={value => set('video_url', value)} />
        </section>

        {/* Opening */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="text-xs font-body text-white/50 uppercase tracking-wider mb-4">Teks Pembuka</h2>
          <div>
            <label className={labelCls}>Ayat / Kutipan</label>
            <textarea rows={3} value={settings.opening_quote || ''} onChange={e => set('opening_quote', e.target.value)} placeholder="Dan di antara tanda-tanda kekuasaan-Nya..." className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Sumber Ayat</label>
            <input value={settings.opening_quote_source || ''} onChange={e => set('opening_quote_source', e.target.value)} placeholder="QS. Ar-Rum: 21" className={inputCls} />
          </div>
        </section>

        {/* Music */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="text-xs font-body text-white/50 uppercase tracking-wider mb-4">Musik Latar</h2>
          <MusicUpload value={settings.music_url || ''} onChange={v => set('music_url', v)} />
          <div className="flex items-center justify-between">
            <label className={labelCls + ' mb-0'}>Putar Otomatis</label>
            <button
              type="button"
              onClick={() => set('music_autoplay', settings.music_autoplay === 'true' ? 'false' : 'true')}
              className={`relative w-10 h-5 rounded-full transition-colors ${settings.music_autoplay === 'true' ? 'bg-gold' : 'bg-white/20'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.music_autoplay === 'true' ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="text-xs font-body text-white/50 uppercase tracking-wider mb-4">Penutup</h2>
          <div>
            <label className={labelCls}>Pesan Penutup</label>
            <textarea rows={3} value={settings.closing_text || ''} onChange={e => set('closing_text', e.target.value)} placeholder="Merupakan suatu kehormatan..." className={`${inputCls} resize-none`} />
          </div>
        </section>

        {/* WhatsApp Template */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-white/50" />
            <h2 className="text-xs font-body text-white/50 uppercase tracking-wider">Template Pesan WhatsApp</h2>
          </div>

          <div>
            <label className={labelCls}>Pesan Undangan WhatsApp</label>
            <textarea
              rows={10}
              value={settings.wa_template || DEFAULT_WA_TEMPLATE}
              onChange={e => set('wa_template', e.target.value)}
              className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
              spellCheck={false}
            />
          </div>

          {/* Variable hints */}
          <div className="bg-black/40 border border-white/5 p-4">
            <p className="text-xs text-white/40 font-body mb-3 font-semibold">Variabel yang tersedia:</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
              {[
                ['{nama_tamu}', 'Nama tamu undangan'],
                ['{link_undangan}', 'Link undangan tamu'],
                ['{nama_mempelai_pria}', 'Nama mempelai pria'],
                ['{nama_mempelai_wanita}', 'Nama mempelai wanita'],
              ].map(([variable, desc]) => (
                <div key={variable} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => set('wa_template', (settings.wa_template || DEFAULT_WA_TEMPLATE) + variable)}
                    className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 font-semibold"
                    title="Klik untuk menambahkan"
                  >
                    {variable}
                  </button>
                  <span className="text-[11px] text-white/30 font-body">- {desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30 font-body">Pesan ini digunakan saat tombol kirim WhatsApp ditekan di halaman Tamu.</p>
            <button
              type="button"
              onClick={() => set('wa_template', DEFAULT_WA_TEMPLATE)}
              className="text-xs text-white/60 hover:text-white font-body underline transition-colors shrink-0 ml-4 font-semibold"
            >
              Reset ke default
            </button>
          </div>
        </section>

    </div>
  )
}
