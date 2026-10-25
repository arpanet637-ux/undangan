'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAdminContext } from './admin-layout'
import {
    Users, Heart, Calendar, Image, Settings, Eye,
    UserCheck, UserX, MessageCircle, Gift, Copy, Check
  } from 'lucide-react'

interface Stats {
  totalGuests: number
  openedInvitations: number
  attendingGuests: number
  notAttendingGuests: number
  totalWishes: number
  totalAttendees: number
}

export function AdminDashboard({ adminCode }: { adminCode: string }) {
  const { wedding } = useAdminContext()
  const [stats, setStats] = useState<Stats | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/${adminCode}/stats`)
      .then(r => r.json())
      .then(setStats)
  }, [adminCode])

  const basePath = `/admin/${adminCode}`
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/w/${wedding?.slug}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const menuItems = [
    { icon: Heart, label: 'Mempelai', desc: 'Kelola info mempelai', path: '/couple' },
    { icon: Calendar, label: 'Acara', desc: 'Kelola jadwal acara', path: '/events' },
    { icon: Users, label: 'Tamu', desc: 'Kelola daftar tamu', path: '/guests' },
    { icon: Image, label: 'Galeri', desc: 'Kelola foto galeri', path: '/gallery' },
    { icon: MessageCircle, label: 'Ucapan', desc: 'Lihat ucapan tamu', path: '/wishes' },
    { icon: Gift, label: 'Hadiah', desc: 'Info rekening hadiah', path: '/gifts' },
    { icon: Settings, label: 'Pengaturan', desc: 'Pengaturan undangan', path: '/settings' },
  ]

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-display text-white">
          {wedding ? `${wedding.groomName} & ${wedding.brideName}` : 'Dashboard'}
        </h1>
        <p className="text-white/40 text-sm font-body mt-1">Kelola undangan pernikahan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { icon: Users, label: 'Total Tamu', value: stats?.totalGuests ?? '-' },
          { icon: Eye, label: 'Dibuka', value: stats?.openedInvitations ?? '-' },
          { icon: UserCheck, label: 'Hadir', value: stats?.attendingGuests ?? '-', gold: true },
          { icon: UserX, label: 'Tidak Hadir', value: stats?.notAttendingGuests ?? '-' },
          { icon: Users, label: 'Total Orang', value: stats?.totalAttendees ?? '-' },
          { icon: MessageCircle, label: 'Ucapan', value: stats?.totalWishes ?? '-' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-4 border ${stat.gold ? 'border-gold/30 bg-gold/5' : 'border-white/10 bg-white/5'}`}
          >
            <stat.icon className={`w-4 h-4 mb-2 ${stat.gold ? 'text-gold' : 'text-white/40'}`} />
            <p className={`text-2xl font-semibold ${stat.gold ? 'text-gold' : 'text-white'}`}>{stat.value}</p>
            <p className="text-xs text-white/40 font-body mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu grid */}
      <h2 className="text-sm tracking-[0.15em] text-white/40 font-body uppercase mb-4">Menu</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {menuItems.map(item => (
          <Link
            key={item.path}
            href={`${basePath}${item.path}`}
            className="p-5 border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all block"
          >
            <item.icon className="w-5 h-5 text-gold mb-3" />
            <p className="text-white font-body text-sm font-medium">{item.label}</p>
            <p className="text-white/40 text-xs font-body mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Public link */}
      {wedding && (
        <div className="border border-white/10 p-6">
          <h3 className="text-sm text-white font-body font-medium mb-4">Link Undangan</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-black border border-white/10 px-4 py-3 flex items-center justify-between">
              <code className="text-gold text-sm font-body truncate">{publicUrl}</code>
              <button onClick={copyLink} className="ml-3 text-white/40 hover:text-gold flex-shrink-0">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <a
              href={`/w/${wedding.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-3 border border-gold/30 text-gold hover:bg-gold/10 text-sm font-body whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              Lihat Undangan
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
