'use client'

import { useState, useEffect } from 'react'
import { useAdminContext } from '@/components/admin/admin-layout'
import { Copy, Check, Edit2, Save, X } from 'lucide-react'

interface WeddingData {
  id: number
  slug: string
  adminCode: string
  groomName: string | null
  brideName: string | null
  title: string | null
  weddingDate: string | null
}

export default function WeddingsPage({ params }: { params: Promise<{ adminCode: string }> }) {
  const { wedding } = useAdminContext()
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState<WeddingData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (wedding) {
      setFormData({
        id: wedding.id,
        slug: wedding.slug,
        adminCode: wedding.adminCode,
        groomName: wedding.groomName,
        brideName: wedding.brideName,
        title: wedding.title,
        weddingDate: wedding.weddingDate || null,
      })
    }
  }, [wedding])

  const handleCopyAdminCode = () => {
    if (formData?.adminCode) {
      navigator.clipboard.writeText(formData.adminCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = async () => {
    if (!formData || !wedding) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/weddings/${wedding.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!formData) {
    return <div className="p-6 text-white/40">Loading...</div>
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-white">Detail Undangan</h1>
          <p className="text-white/40 text-sm font-body mt-1">Kelola informasi undangan pernikahan</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gold/30 text-gold hover:bg-gold/10 text-sm font-body"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="border border-white/10 p-6">
          <h2 className="text-sm text-white font-body font-medium mb-4 uppercase tracking-wider">
            Informasi Dasar
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 font-body uppercase tracking-wider">
                Nama Mempelai Pria
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.groomName || ''}
                  onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                  className="w-full mt-1 bg-black border border-white/10 px-3 py-2 text-white text-sm"
                />
              ) : (
                <p className="text-white mt-1">{formData.groomName || '-'}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-white/40 font-body uppercase tracking-wider">
                Nama Mempelai Wanita
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.brideName || ''}
                  onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                  className="w-full mt-1 bg-black border border-white/10 px-3 py-2 text-white text-sm"
                />
              ) : (
                <p className="text-white mt-1">{formData.brideName || '-'}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-white/40 font-body uppercase tracking-wider">
                Judul Undangan
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 bg-black border border-white/10 px-3 py-2 text-white text-sm"
                />
              ) : (
                <p className="text-white mt-1">{formData.title || '-'}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-white/40 font-body uppercase tracking-wider">
                Tanggal Pernikahan
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.weddingDate || ''}
                  onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value || null })}
                  className="w-full mt-1 bg-black border border-white/10 px-3 py-2 text-white text-sm"
                />
              ) : (
                <p className="text-white mt-1">{formData.weddingDate ? new Date(formData.weddingDate).toLocaleDateString('id-ID') : '-'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Access Codes */}
        <div className="border border-white/10 p-6">
          <h2 className="text-sm text-white font-body font-medium mb-4 uppercase tracking-wider">
            Kode Akses
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 font-body uppercase tracking-wider">
                Slug Undangan
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={formData.slug}
                  disabled
                  className="flex-1 bg-black border border-white/10 px-3 py-2 text-white text-sm opacity-60"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(formData.slug)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="px-3 py-2 border border-white/10 text-white/40 hover:text-gold"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-white/40 mt-2">URL publik: /w/{formData.slug}</p>
            </div>

            <div>
              <label className="text-xs text-white/40 font-body uppercase tracking-wider">
                Kode Admin (Akses Management)
              </label>
              {isEditing ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={formData.adminCode}
                    onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                    className="flex-1 bg-black border border-white/10 px-3 py-2 text-white text-sm font-mono"
                  />
                  <button
                    onClick={handleCopyAdminCode}
                    className="px-3 py-2 border border-white/10 text-white/40 hover:text-gold"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={formData.adminCode}
                    disabled
                    className="flex-1 bg-black border border-white/10 px-3 py-2 text-white text-sm font-mono opacity-60"
                  />
                  <button
                    onClick={handleCopyAdminCode}
                    className="px-3 py-2 border border-white/10 text-white/40 hover:text-gold"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
              <p className="text-xs text-white/40 mt-2">URL admin: /admin/{formData.adminCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Cancel buttons */}
      {isEditing && (
        <div className="mt-8 flex gap-3 justify-end">
          <button
            onClick={() => {
              setIsEditing(false)
              if (wedding) setFormData({ ...formData, ...wedding })
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white/40 hover:text-white text-sm font-body"
          >
            <X className="w-4 h-4" />
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gold/30 text-gold hover:bg-gold/10 text-sm font-body disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      )}
    </div>
  )
}
