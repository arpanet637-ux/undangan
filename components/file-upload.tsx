'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface FileUploadProps {
  label: string
  onUpload: (url: string) => void
  currentUrl?: string
  accept?: string
  maxSize?: number // in bytes
}

export function FileUpload({ label, onUpload, currentUrl, accept = 'image/jpeg,image/png,image/webp', maxSize = 5 * 1024 * 1024 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit.`)
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.details || data.error || 'Upload failed')
      }

      const data = await response.json()
      // Private store: serve via the /api/file proxy using the pathname.
      // This proxy URL is permanent (re-fetched server-side with the token).
      const blobUrl = data.pathname ? `/api/file?pathname=${encodeURIComponent(data.pathname)}` : data.url
      onUpload(blobUrl)
      setPreview(blobUrl)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      setPreview(currentUrl || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-xs tracking-widest font-body uppercase mb-3" style={{ color: '#b8956f', letterSpacing: '0.15em' }}>
        {label}
      </label>

      <div className="space-y-3">
        {/* Preview */}
        {preview && (
          <div className="relative w-full h-48 overflow-hidden border" style={{ borderColor: '#e8e8e8' }}>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="absolute top-2 right-2 p-1 rounded-full transition-all"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full py-3 border-2 border-dashed transition-colors"
          style={{
            borderColor: '#b8956f',
            color: '#b8956f',
            backgroundColor: uploading ? 'rgba(184, 149, 111, 0.05)' : 'transparent',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Upload className="w-5 h-5" />
            <span className="text-sm font-body">
              {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Select Image'}
            </span>
          </div>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        {/* Error message */}
        {error && (
          <p className="text-xs font-body" style={{ color: '#d9534f' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
