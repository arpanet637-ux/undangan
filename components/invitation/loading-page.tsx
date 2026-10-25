'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  onLoadingComplete: () => void
  isMetatah?: boolean
  participantNames?: string
}

export function LoadingPage({ onLoadingComplete, isMetatah = false, participantNames = 'PESERTA METATAH' }: Props) {
  const [progress, setProgress] = useState(0)
  const completeRef = useRef(onLoadingComplete)

  useEffect(() => {
    completeRef.current = onLoadingComplete
  }, [onLoadingComplete])

  useEffect(() => {
    let completed = false
    const finish = () => {
      if (completed) return
      completed = true
      completeRef.current()
    }

    const interval = window.setInterval(() => {
      setProgress(previous => Math.min(90, previous + 15))
    }, 250)

    // The opening animation is decorative and must never block the invitation.
    // Complete it on a fixed deadline, then keep a safety timeout for slow or
    // backgrounded mobile browsers where timers can be throttled.
    const animationTimeout = window.setTimeout(() => {
      window.clearInterval(interval)
      setProgress(100)
      window.setTimeout(finish, 600)
    }, 2500)
    const safetyTimeout = window.setTimeout(finish, 5000)

    return () => {
      window.clearTimeout(animationTimeout)
      window.clearTimeout(safetyTimeout)
      window.clearInterval(interval)
    }
  }, [])

  if (isMetatah) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0d0d] text-[#bdbdbd]">
        <div className="flex flex-col items-center text-center px-6">
          <p className="mb-4 text-[11px] uppercase tracking-[0.55em] text-[#bdbdbd]">Upacara Manusa Yadnya Mepandes/Metatah</p>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{participantNames}</h1>
          <p className="mt-6 text-lg">{Math.round(progress)}%</p>
        </div>
        {progress === 100 && <style>{`@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } } body > * { animation: fadeOut 0.6s ease-out forwards; }`}</style>}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Progress container */}
      <div className="w-full max-w-xs px-8">
        {/* Percentage text */}
        <div className="text-center mb-12">
          <div className="font-display text-6xl font-medium" style={{ color: '#1a3a52', letterSpacing: '0.02em' }}>
            {Math.round(progress)}%
          </div>
          <p className="text-xs tracking-widest font-body uppercase mt-4" style={{ color: '#b8956f', letterSpacing: '0.15em' }}>
            Loading
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-px w-full" style={{ backgroundColor: '#e8e8e8' }}>
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{ backgroundColor: '#4a90a4', width: `${progress}%` }}
          />
        </div>

        {/* Subtitle */}
        <p className="text-center text-xs font-body mt-12" style={{ color: '#8b8b8b', letterSpacing: '0.05em' }}>
          THE WEDDING OF
        </p>
      </div>

      {/* Fade out animation when complete */}
      {progress === 100 && (
        <style>{`
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          body > * { animation: fadeOut 0.6s ease-out forwards; }
        `}</style>
      )}
    </div>
  )
}
