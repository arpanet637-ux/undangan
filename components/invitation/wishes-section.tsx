'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

interface Wish {
  id: number
  guestName: string
  message: string
  attendance: string
  createdAt: string
}

interface WeddingData {
  wishes: Wish[]
}

interface Props {
  slug: string
  data: WeddingData & { gallery?: Array<{ photoUrl: string }> }
  gallery?: string[]
}

export function WishesSection({ slug, data, gallery }: Props) {
  const [wishes, setWishes] = useState<Wish[]>(data.wishes)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [attendance, setAttendance] = useState('hadir')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.isComposing) return
    if (!name.trim() || !message.trim()) return
    setSubmitting(true)

    const res = await fetch(`/api/w/${slug}/wishes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName: name, message, attendance }),
    })

    if (res.ok) {
      const newWish = await res.json()
      setWishes(prev => [newWish, ...prev])
      setName('')
      setMessage('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }
    setSubmitting(false)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="wishes-section-b py-16 md:py-24 bg-transparent"
    >
      <div className="container mx-auto px-8 md:px-16 relative" style={{ zIndex: 10 }}>
        {/* Title */}
        <div className="text-center mb-16">
          <span
            className="uppercase text-white/60"
            style={{ fontSize: '0.6rem', letterSpacing: '0.4em', fontFamily: "'Jost', sans-serif", fontWeight: 400 }}
          >
            Guestbook
          </span>
          <h2
            className="text-white mt-3"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 400 }}
          >
            Ucapan &amp; Doa
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 max-w-5xl mx-auto">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Nama Anda"
                className="w-full px-0 py-3 border-b bg-transparent text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
                style={{
                  borderColor: 'rgba(255,255,255,0.2)',
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={5}
                placeholder="Tulis ucapan dan doa Anda..."
                className="w-full px-0 py-3 border-b bg-transparent text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors resize-none"
                style={{
                  borderColor: 'rgba(255,255,255,0.2)',
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              {submitted && (
                <span className="text-white/60 text-sm" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                  Terkirim!
                </span>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="ml-auto flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.2em', background: 'none', border: 'none', opacity: submitting ? 0.5 : 1 }}
              >
                <span className="uppercase tracking-widest">{submitting ? 'Mengirim...' : 'Kirim'}</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </form>

          {/* Wishes list */}
          <div className="space-y-6 max-h-[480px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
            {wishes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageCircle className="w-8 h-8 text-white/20 mb-4" />
                <p className="text-white/40 text-sm" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                  Jadilah yang pertama memberikan ucapan
                </p>
              </div>
            ) : (
              wishes.map((w, i) => (
                <div
                  key={w.id}
                  className="pb-6 border-b border-white/10"
                  style={{
                    transition: `all 0.5s ease ${i * 0.05}s`,
                  }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)', fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: 'white' }}
                    >
                      {w.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="text-white"
                        style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: '0.85rem' }}
                      >
                        {w.guestName}
                      </p>
                      <p
                        className="text-white/40"
                        style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '0.7rem' }}
                      >
                        {new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-white/70 leading-relaxed pl-11"
                    style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '0.85rem' }}
                  >
                    {w.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
