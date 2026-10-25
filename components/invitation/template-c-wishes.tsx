'use client'

import { useState } from 'react'

interface Wish {
  id: number
  guestName: string
  message: string
  attendance: string
  createdAt: string
}

interface Props {
  slug: string
  wishes: Wish[]
}

export function TemplateCWishes({ slug, wishes: initialWishes }: Props) {
  const [wishes, setWishes] = useState(initialWishes)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [attendance, setAttendance] = useState('hadir')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (event.nativeEvent instanceof KeyboardEvent && event.nativeEvent.isComposing) return
    if (!name.trim() || !message.trim()) return
    setSubmitting(true)
    const response = await fetch(`/api/w/${slug}/wishes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName: name.trim(), message: message.trim(), attendance }),
    })
    if (response.ok) {
      const wish = await response.json() as Wish
      setWishes((current) => [wish, ...current])
      setName('')
      setMessage('')
      setSubmitted(true)
      window.setTimeout(() => setSubmitted(false), 3000)
    }
    setSubmitting(false)
  }

  return (
    <section className="relative z-10 px-6 py-20 text-white sm:px-10 sm:py-28" style={{ fontFamily: "'Jost', sans-serif" }}>
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <h2 className="mb-2 text-2xl font-bold uppercase tracking-[0.03em] sm:text-3xl">Konfirmasi Kehadiran &amp;<br />Kirimkan Doa Restu</h2>
          <p className="max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">Yuk, konfirmasi kehadiranmu dan jangan ragu untuk berbagi doa serta harapan manis untuk kami.</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Nama" aria-label="Nama" className="w-full rounded-xl border border-white bg-white/10 px-5 py-3 text-base text-white outline-none placeholder:text-white/75 focus:bg-white/15" />
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} required placeholder="Ucapan" aria-label="Ucapan" rows={3} className="w-full resize-none rounded-xl border border-white bg-white/10 px-5 py-3 text-base text-white outline-none placeholder:text-white/75 focus:bg-white/15" />
          <select value={attendance} onChange={(event) => setAttendance(event.target.value)} aria-label="Konfirmasi Kehadiran" className="w-full rounded-xl border border-white bg-white/10 px-5 py-3 text-base text-white outline-none">
            <option value="hadir" className="text-foreground">Hadir</option>
            <option value="tidak_hadir" className="text-foreground">Tidak hadir</option>
            <option value="ragu" className="text-foreground">Masih ragu</option>
          </select>
          <button type="submit" disabled={submitting} className="rounded-md bg-white px-8 py-3 text-base font-medium text-black transition hover:bg-white/85 disabled:opacity-50">{submitting ? 'Mengirim...' : submitted ? 'Terkirim' : 'Send'}</button>
        </form>
        <div className="mt-10">
          {wishes.map((wish) => (
            <article key={wish.id} className="py-5">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span>{wish.guestName}</span>
                {wish.attendance && <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-normal">{wish.attendance === 'hadir' ? 'Hadir' : wish.attendance}</span>}
              </div>
              <p className="mt-2 text-base leading-relaxed text-white/95">{wish.message}</p>
              <p className="mt-2 text-sm text-white/90">◷ {new Date(wish.createdAt).toLocaleDateString('id-ID')} &nbsp; <span className="font-semibold">Reply</span></p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
