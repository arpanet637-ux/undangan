'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Heart, LayoutDashboard, Users, Calendar, Image,
  MessageCircle, Settings, Gift, ChevronLeft, Menu, X, Eye
} from 'lucide-react'

interface Wedding {
  id: number
  slug: string
  adminCode: string
  groomName: string | null
  brideName: string | null
  title: string | null
  weddingDate: string | null
}

interface AdminContextValue {
  wedding: Wedding | null
  adminCode: string
}

export const AdminContext = createContext<AdminContextValue>({ wedding: null, adminCode: '' })
export const useAdminContext = () => useContext(AdminContext)

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '' },
  { label: 'Mempelai', icon: Heart, path: '/couple' },
  { label: 'Acara', icon: Calendar, path: '/events' },
  { label: 'Tamu', icon: Users, path: '/guests' },
  { label: 'Galeri', icon: Image, path: '/gallery' },
  { label: 'Ucapan', icon: MessageCircle, path: '/wishes' },
  { label: 'Hadiah', icon: Gift, path: '/gifts' },
  { label: 'Pengaturan', icon: Settings, path: '/settings' },
]

interface AdminLayoutProps {
  adminCode: string
  children: React.ReactNode
}

export function AdminLayout({ adminCode, children }: AdminLayoutProps) {
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch(`/api/admin/${adminCode}`)
      .then(r => r.json())
      .then(setWedding)
  }, [adminCode])

  const basePath = `/admin/${adminCode}`

  return (
    <AdminContext.Provider value={{ wedding, adminCode }}>
      <div className="min-h-screen bg-[#111111] flex">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-gold" />
              <span className="font-display text-white text-lg">Admin Panel</span>
            </div>
            {wedding && (
              <p className="text-white/40 text-xs font-body mt-2 truncate">
                {wedding.groomName} & {wedding.brideName}
              </p>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map(item => {
              const href = `${basePath}${item.path}`
              const isActive = item.path === ''
                ? pathname === basePath
                : pathname.startsWith(`${basePath}${item.path}`)

              return (
                <Link
                  key={item.path}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-6 py-3 text-sm font-body transition-colors
                    ${isActive
                      ? 'text-gold bg-gold/5 border-r-2 border-gold'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer links */}
          <div className="p-4 border-t border-white/5 space-y-2">
            {wedding && (
              <a
                href={`/w/${wedding.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-gold font-body transition-colors"
              >
                <Eye className="w-3 h-3" />
                Lihat Undangan
              </a>
            )}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-white font-body transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              Kembali ke Dashboard
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar (mobile) */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/5">
            <button onClick={() => setSidebarOpen(true)} className="text-white/60">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-gold" />
              <span className="font-display text-white text-sm">Admin</span>
            </div>
            <div className="w-5" />
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-auto admin-scroll">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  )
}
