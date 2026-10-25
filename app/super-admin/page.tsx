'use client'

import Link from 'next/link'
import { Layout, Sun, Moon, Sparkles, Users, UserPlus } from 'lucide-react'

export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Super Admin Dashboard</h1>
          <p className="text-slate-400">Kelola template dan proyek undangan klien</p>
          <Link
            href="/super-admin/users"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-white/5 border border-white/10 hover:border-amber-500/50 rounded-md text-sm text-white transition-colors"
          >
            <UserPlus className="w-4 h-4 text-amber-400" /> Kelola User
          </Link>
        </div>

        {/* Template Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Template A Card */}
          <Link href="/super-admin/template-a">
            <div className="group cursor-pointer">
              <div className="bg-white/5 border border-white/10 hover:border-amber-500/50 rounded-lg p-8 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sun className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Template A</h2>
                <p className="text-slate-400 text-sm mb-1">Light Mode</p>
                <p className="text-slate-500 text-xs mb-6">Desain cerah dengan warna putih dan aksen emas</p>
                
                <div className="pt-6 border-t border-white/10">
                  <div className="text-sm text-amber-400 font-medium group-hover:translate-x-2 transition-transform inline-block">
                    Lihat Proyek →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Template B Card */}
          <Link href="/super-admin/template-b">
            <div className="group cursor-pointer">
              <div className="bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-lg p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Moon className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Template B</h2>
                <p className="text-slate-400 text-sm mb-1">Dark Mode</p>
                <p className="text-slate-500 text-xs mb-6">Desain gelap dengan warna slate dan aksen biru</p>
                
                <div className="pt-6 border-t border-white/10">
                  <div className="text-sm text-blue-400 font-medium group-hover:translate-x-2 transition-transform inline-block">
                    Lihat Proyek →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Template C Card */}
          <Link href="/super-admin/template-c">
            <div className="group cursor-pointer">
              <div className="bg-white/5 border border-white/10 hover:border-emerald-500/50 rounded-lg p-8 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Template C</h2>
                <p className="text-slate-400 text-sm mb-1">Metatah Light</p>
                <p className="text-slate-500 text-xs mb-6">Desain Template B untuk undangan Metatah</p>
                <div className="pt-6 border-t border-white/10">
                  <div className="text-sm text-emerald-400 font-medium group-hover:translate-x-2 transition-transform inline-block">Lihat Proyek →</div>
                </div>
              </div>
            </div>
          </Link>

          {/* Template D Card */}
          <Link href="/super-admin/template-d">
            <div className="group cursor-pointer">
              <div className="bg-white/5 border border-white/10 hover:border-violet-500/50 rounded-lg p-8 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/20">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Template D</h2>
                <p className="text-slate-400 text-sm mb-1">Metatah Dark</p>
                <p className="text-slate-500 text-xs mb-6">Desain Template B untuk undangan Metatah</p>
                <div className="pt-6 border-t border-white/10">
                  <div className="text-sm text-violet-400 font-medium group-hover:translate-x-2 transition-transform inline-block">Lihat Proyek →</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-slate-400 text-sm font-medium">Total Proyek</div>
            <div className="text-3xl font-bold text-white mt-2">-</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-slate-400 text-sm font-medium">Template A</div>
            <div className="text-3xl font-bold text-amber-400 mt-2">-</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-slate-400 text-sm font-medium">Template B</div>
            <div className="text-3xl font-bold text-blue-400 mt-2">-</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-slate-400 text-sm font-medium">Template C</div>
            <div className="text-3xl font-bold text-emerald-400 mt-2">-</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-slate-400 text-sm font-medium">Template D</div>
            <div className="text-3xl font-bold text-violet-400 mt-2">-</div>
          </div>
        </div>
      </div>
    </div>
  )
}
