'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  settings?: Record<string, string>
}

export function TemplateCOpeningText({ settings }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const quote = settings?.opening_quote || settings?.opening_text || ''
  const source = settings?.opening_quote_source || 'Upacara Metatah'

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true)
    }, { threshold: 0.15 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className={`relative z-20 flex min-h-[680px] items-center px-8 py-24 sm:px-12 ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="mb-7 text-3xl font-semibold uppercase tracking-[0.08em] text-white sm:text-5xl" style={{ fontFamily: "'Jost', sans-serif" }}>OM SWASTIASTU</h2>
        {quote && <p className="max-w-[23rem] whitespace-pre-line text-base leading-[1.5] tracking-[0.04em] text-white sm:text-lg" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400 }}>{quote}</p>}
        <p className="mt-5 text-[10px] uppercase tracking-[0.45em] text-white/70" style={{ fontFamily: "'Jost', sans-serif" }}>{source}</p>
      </div>
    </section>
  )
}
