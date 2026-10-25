'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader } from 'lucide-react'

interface NewProjectFormProps {
  templateId: string
  templateName: string
  templateColor: string
}

export function NewProjectForm({
  templateId,
  templateName,
  templateColor,
}: NewProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    groomName: '',
    brideName: '',
    weddingDate: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const generateAdminCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.groomName || !formData.brideName) {
      setError('Judul, nama mempelai pria dan wanita wajib diisi')
      return
    }

    try {
      setLoading(true)
      setError('')

      const slug = generateSlug(formData.title)
      const adminCode = generateAdminCode()
      const userId = 'super-admin' // Or get from auth context

      const response = await fetch('/api/super-admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          groomName: formData.groomName,
          brideName: formData.brideName,
          weddingDate: formData.weddingDate || null,
          slug,
          adminCode,
          templateId,
          userId,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.details || result.error || 'Gagal membuat project')
      }

      const newProject = result
      
      // Redirect ke admin panel project baru
      router.push(`/admin/${newProject.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/super-admin/${templateId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h1 className="text-3xl font-bold text-white">Buat Project Baru</h1>
          <p className="text-slate-400 mt-2">Template: {templateName}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Judul */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Judul Undangan *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: The Wedding of Budi & Ani"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Nama Mempelai */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nama Mempelai Pria *
                </label>
                <input
                  type="text"
                  name="groomName"
                  value={formData.groomName}
                  onChange={handleChange}
                  placeholder="Budi"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nama Mempelai Wanita *
                </label>
                <input
                  type="text"
                  name="brideName"
                  value={formData.brideName}
                  onChange={handleChange}
                  placeholder="Ani"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Tanggal Pernikahan */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tanggal Pernikahan (Opsional)
              </label>
              <input
                type="date"
                name="weddingDate"
                value={formData.weddingDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Info Template */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-sm text-slate-400">
                <span className="font-medium text-white">Template yang digunakan:</span> {templateName}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Setelah membuat project, Anda dapat mengubah template di halaman admin settings.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${templateColor} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {loading ? 'Membuat...' : 'Buat Project'}
              </button>
              <Link
                href={`/super-admin/${templateId}`}
                className="px-6 py-3 rounded-lg font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>

        {/* Notes */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-sm text-slate-400">
            <span className="font-medium text-slate-300">Info:</span> Project baru akan dibuat dengan template yang dipilih. Admin code dan slug akan dibuat secara otomatis.
          </p>
        </div>
      </div>
    </div>
  )
}
