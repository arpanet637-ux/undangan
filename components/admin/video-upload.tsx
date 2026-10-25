'use client'

import { useRef, useState } from 'react'

export function VideoUpload({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file?: File) {
    if (!file) return
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) return setError('Gunakan MP4, WebM, atau MOV.')
    if (file.size > 6 * 1024 * 1024) return setError('Ukuran video maksimal 6 MB. Untuk video lebih besar, tempel URL YouTube.')
    setUploading(true); setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/video', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload video gagal')
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload video gagal')
    } finally { setUploading(false) }
  }

  return <div className="space-y-3">
    {value && <video src={value} controls playsInline className="w-full max-h-56 bg-black" />}
    <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full border-2 border-dashed py-3 text-sm text-gold disabled:opacity-50">{uploading ? 'Mengupload...' : 'Upload Video MP4/WebM (maks. 6 MB)'}</button>
    <input ref={inputRef} hidden type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e => handleFile(e.target.files?.[0])} />
    {error && <p className="text-xs text-red-400">{error}</p>}
    <input value={value} onChange={e => onChange(e.target.value)} placeholder="Atau tempel URL YouTube / video HTTPS" className="w-full bg-black px-4 py-2.5 text-sm text-white border border-white/10 focus:border-gold focus:outline-none" />
  </div>
}
