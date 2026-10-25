'use client'

import { upload } from '@vercel/blob/client'
import { useRef, useState } from 'react'

export function VideoUpload({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file?: File) {
    if (!file) return
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) return setError('Gunakan MP4, WebM, atau MOV.')
    if (file.size > 100 * 1024 * 1024) return setError('Ukuran video maksimal 100 MB.')
    setUploading(true); setError('')
    try {
      const blob = await upload(`videos/${file.name}`, file, { access: 'public', handleUploadUrl: '/api/upload/video/token' })
      onChange(blob.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload video gagal')
    } finally { setUploading(false) }
  }

  return <div className="space-y-3">
    {value && <video src={value} controls playsInline className="w-full max-h-56 bg-black" />}
    <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full border-2 border-dashed py-3 text-sm text-gold disabled:opacity-50">{uploading ? 'Mengupload...' : 'Upload Video MP4/WebM'}</button>
    <input ref={inputRef} hidden type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e => handleFile(e.target.files?.[0])} />
    {error && <p className="text-xs text-red-400">{error}</p>}
    <input value={value} onChange={e => onChange(e.target.value)} placeholder="Atau tempel URL YouTube / video HTTPS" className="w-full bg-black px-4 py-2.5 text-sm text-white border border-white/10 focus:border-gold focus:outline-none" />
  </div>
}
