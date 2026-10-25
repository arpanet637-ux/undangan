'use client'

interface Props {
  participants: Array<{ nickname?: string; fullName: string; avatar?: string | null }>
  guestName?: string
  weddingDate?: string | null
  photos: string[]
  onOpen?: () => void
  opened?: boolean
  isOpening?: boolean
}

function formatWeddingDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function TemplateCGuestOpening({ participants, guestName, weddingDate, photos, onOpen, opened = false, isOpening = false }: Props) {
  const names = participants.map((p) => p.nickname || p.fullName).filter(Boolean)
  const formattedDate = formatWeddingDate(weddingDate)

  return (
    <section aria-label={isOpening ? "Opening section" : "Title section"} className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-transparent px-6 py-16 text-white">
      <style>{`@keyframes templateCFadeIn { from { opacity: 0; transform: translateY(0.75rem); } to { opacity: 1; transform: translateY(0); } } @keyframes templateCOpenPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } } @media (prefers-reduced-motion: reduce) { .template-c-hero-content, .template-c-open-button { animation: none; } }`}</style>
      <div className="template-c-hero-content relative z-10 flex w-full max-w-md translate-y-10 flex-col items-center text-center animate-[templateCFadeIn_900ms_ease-out_both]">
        <p className="mb-2 text-[0.7rem] tracking-[0.15em] text-white/85" style={{ fontFamily: "'Jost', sans-serif" }}>Upacara Manusa Yadnya</p>
        <p className="mb-8 text-[0.7rem] tracking-[0.15em] text-white/85" style={{ fontFamily: "'Jost', sans-serif" }}>Mepandes/Metatah</p>

        {names.length > 0 && (
          <h1 className="mb-6 text-2xl font-bold uppercase tracking-[0.06em] text-white sm:text-3xl" style={{ fontFamily: "'Jost', sans-serif" }}>
            {names.join(' • ')}
          </h1>
        )}

        {formattedDate && (
          <p className="mb-10 text-sm tracking-[0.1em] text-white/90" style={{ fontFamily: "'Jost', sans-serif" }}>{formattedDate}</p>
        )}

        {!opened && guestName && (
          <div className="mb-8">
            <p className="mb-2 text-[0.7rem] tracking-[0.15em] text-white/80" style={{ fontFamily: "'Jost', sans-serif" }}>Kepada Yth:</p>
            <p className="mb-3 text-xl font-semibold text-white sm:text-2xl" style={{ fontFamily: "'Jost', sans-serif" }}>{guestName}</p>
            <p className="text-[0.7rem] tracking-[0.05em] text-white/80" style={{ fontFamily: "'Jost', sans-serif" }}>Mohon maaf untuk kesalahan penulisan nama/gelar</p>
          </div>
        )}

        {!opened && (
          <button
            type="button"
            onClick={onOpen}
            className="template-c-open-button animate-[templateCOpenPulse_2s_ease-in-out_infinite] rounded-full border border-white/40 bg-white/15 px-10 py-3 text-sm tracking-[0.08em] text-white backdrop-blur-sm transition hover:bg-white/25"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Let&apos;s Open
          </button>
        )}
      </div>
    </section>
  )
}
