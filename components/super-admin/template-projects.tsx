'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowLeft, Heart, Pencil, Trash2, X, Loader, ExternalLink } from 'lucide-react'
import { VideoUpload } from '@/components/admin/video-upload'

interface Wedding {
  id: number
  slug: string
  adminCode: string
  title: string
  groomName: string
  brideName: string
  weddingDate: string
  templateId: string
  createdAt: string
  videoUrl?: string | null
}

interface TemplateProjectsProps {
  templateId: string
  templateName: string
  templateColor: string
  templateDescription: string
}

export function TemplateProjects({
  templateId,
  templateName,
  templateColor,
  templateDescription,
}: TemplateProjectsProps) {
  const [projects, setProjects] = useState<Wedding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit modal state
  const [editProject, setEditProject] = useState<Wedding | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    groomName: '',
    brideName: '',
    weddingDate: '',
    videoUrl: '',
  })
  const [saving, setSaving] = useState(false)

  // Delete confirmation state
  const [deleteProject, setDeleteProject] = useState<Wedding | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchProjects() {
    try {
      setLoading(true)
      const response = await fetch(`/api/super-admin/projects?template=${templateId}`)
      if (!response.ok) throw new Error('Failed to fetch projects')
      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const openEdit = (project: Wedding) => {
    setEditProject(project)
    setEditForm({
      title: project.title || '',
      groomName: project.groomName || '',
      brideName: project.brideName || '',
      weddingDate: project.weddingDate ? project.weddingDate.slice(0, 10) : '',
      videoUrl: project.videoUrl || '',
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProject) return
    try {
      setSaving(true)
      const res = await fetch(`/api/super-admin/projects/${editProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error('Gagal menyimpan perubahan')
      setEditProject(null)
      await fetchProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteProject) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/super-admin/projects/${deleteProject.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Gagal menghapus project')
      setDeleteProject(null)
      await fetchProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus project')
    } finally {
      setDeleting(false)
    }
  }

  const accentText = templateColor.includes('amber') ? 'text-amber-400' : 'text-blue-400'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header dengan Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/super-admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{templateName}</h1>
              <p className="text-slate-400 text-sm">{templateDescription}</p>
            </div>
          </div>

          <Link
            href={`/super-admin/${templateId}/new`}
            className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${templateColor} hover:opacity-90`}
          >
            <Plus className="w-5 h-5" />
            Tambah Project
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <Heart className={`w-12 h-12 mx-auto mb-4 opacity-50 ${accentText}`} />
              <p className="text-slate-400">Belum ada project untuk template ini</p>
              <Link
                href={`/super-admin/${templateId}/new`}
                className={`inline-block mt-4 px-6 py-2 rounded-lg font-medium transition-all ${templateColor}`}
              >
                Buat Project Pertama
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">#</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Judul</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Mempelai</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Tanggal</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Kode Akses</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Link Client</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.map((project, idx) => (
                    <tr key={project.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-400">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{project.title || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {project.groomName} & {project.brideName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {project.weddingDate ? formatDate(project.weddingDate) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <code className="px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 font-mono text-xs">
                            {project.adminCode}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(project.adminCode)
                            }}
                            title="Salin kode akses"
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            ✓
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <a
                            href="/client-login"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka halaman login client"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-colors text-xs font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Login
                          </a>
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/client-login`
                              navigator.clipboard.writeText(url)
                            }}
                            title="Salin link login client"
                            className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            ✓
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/${project.adminCode}`}
                            title="Kelola konten undangan"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Kelola
                          </Link>
                          <button
                            onClick={() => openEdit(project)}
                            title="Edit detail project"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteProject(project)}
                            title="Hapus project"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
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

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-medium">Total Project</div>
            <div className={`text-2xl font-bold mt-2 ${accentText}`}>
              {projects.length}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-medium">Project Aktif</div>
            <div className={`text-2xl font-bold mt-2 ${accentText}`}>
              {projects.filter(p => p.weddingDate).length}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-medium">Persentase</div>
            <div className={`text-2xl font-bold mt-2 ${accentText}`}>
              100%
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Edit Project</h2>
              <button
                onClick={() => setEditProject(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Judul Undangan</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="The Wedding of Budi & Ani"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Mempelai Pria</label>
                  <input
                    type="text"
                    value={editForm.groomName}
                    onChange={e => setEditForm(prev => ({ ...prev, groomName: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Budi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Mempelai Wanita</label>
                  <input
                    type="text"
                    value={editForm.brideName}
                    onChange={e => setEditForm(prev => ({ ...prev, brideName: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Ani"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Tanggal Pernikahan</label>
                <input
                  type="date"
                  value={editForm.weddingDate}
                  onChange={e => setEditForm(prev => ({ ...prev, weddingDate: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Video Galeri</label>
                <VideoUpload value={editForm.videoUrl} onChange={value => setEditForm(prev => ({ ...prev, videoUrl: value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${templateColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saving && <Loader className="w-4 h-4 animate-spin" />}
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditProject(null)}
                  className="px-6 py-3 rounded-lg font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white text-center">Hapus Project?</h2>
            <p className="text-sm text-slate-400 text-center mt-2">
              Anda akan menghapus{' '}
              <span className="text-white font-medium">
                {deleteProject.title || `${deleteProject.groomName} & ${deleteProject.brideName}`}
              </span>{' '}
              beserta seluruh datanya (mempelai, acara, galeri, tamu, ucapan, dan hadiah). Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting && <Loader className="w-4 h-4 animate-spin" />}
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
              <button
                onClick={() => setDeleteProject(null)}
                className="px-6 py-3 rounded-lg font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
