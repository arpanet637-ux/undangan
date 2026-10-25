'use client'

import { memo, useState } from 'react'
import { Pause, Volume2 } from 'lucide-react'

interface Props {
  playing: boolean
  onToggle: () => void
}

export const FloatingMusic = memo(function FloatingMusic({ playing, onToggle }: Props) {
  const [showHint, setShowHint] = useState(!playing)

  const handleClick = () => {
    onToggle()
    setShowHint(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Hint untuk mobile - tampil saat musik belum diplay */}
      {showHint && !playing && (
        <div className="animate-bounce bg-white text-charcoal text-xs px-3 py-2 rounded-lg shadow-md whitespace-nowrap font-medium">
          Klik untuk putar musik
          <div className="absolute right-0 top-full transform translate-y-1 translate-x-4 border-4 border-transparent border-t-white" />
        </div>
      )}

      {/* Floating Music Button */}
      <button
        onClick={handleClick}
        aria-label={playing ? 'Pause musik' : 'Putar musik'}
        title={playing ? 'Pause musik' : 'Putar musik'}
        className={`w-14 h-14 rounded-full bg-charcoal text-white flex items-center justify-center shadow-lg hover:bg-charcoal/90 transition-all duration-200 ${
          playing ? 'animate-pulse' : 'opacity-75 hover:opacity-100 scale-100'
        } sm:w-12 sm:h-12`}
      >
        {playing ? (
          <Pause className="w-5 h-5 sm:w-4 sm:h-4" />
        ) : (
          <Volume2 className="w-5 h-5 sm:w-4 sm:h-4" />
        )}
      </button>
    </div>
  )
})
