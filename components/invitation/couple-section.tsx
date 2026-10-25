'use client'

import { Heart } from 'lucide-react'

interface CoupleEntry {
  role: string
  fullName: string
  nickname: string
  photoUrl: string | null
  fatherName: string | null
  motherName: string | null
  address: string | null
  childOrder: string | null
}

interface Props {
  data: { couple: CoupleEntry[] }
}

function PersonCard({ person, delayIndex }: { person: CoupleEntry; delayIndex: number }) {
  const animationDelay = 0.2 + delayIndex * 0.2
  
  return (
    <div 
      className="text-center w-full max-w-sm animate-fadeInUp"
      style={{
        animationDelay: `${animationDelay}s`
      }}
    >
      {/* Cottage Arch Photo Frame - rounded top only */}
      <div className="mx-auto mb-6 w-64 h-80 rounded-t-full overflow-hidden shadow-md bg-gray-100">
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={person.fullName}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-xs tracking-[0.3em] font-sans uppercase text-gray-500 font-light mb-2">
        {person.role === 'groom' ? 'THE GROOM' : 'THE BRIDE'}
      </p>

      {/* Full Name */}
      <h3 className="text-xl font-normal text-gray-900 tracking-wide pt-1 pb-2 font-serif">
        {person.fullName}
      </h3>

      {/* Family Information */}
      {(person.fatherName || person.motherName || person.childOrder) && (
        <div className="space-y-1 pt-1">
          {person.childOrder && (
            <p className="font-sans italic text-xs text-gray-500 font-light">
              {person.childOrder}
            </p>
          )}
          {person.fatherName && (
            <p className="font-sans text-xs tracking-wider text-gray-700 font-normal">
              {person.fatherName}
            </p>
          )}
          {person.motherName && (
            <>
              <p className="font-sans text-xs text-gray-400 font-light">&amp;</p>
              <p className="font-sans text-xs tracking-wider text-gray-700 font-normal">
                {person.motherName}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function CoupleSection({ data }: Props) {
  const { couple } = data
  const groom = couple.find(p => p.role === 'groom')
  const bride = couple.find(p => p.role === 'bride')

  return (
    <section className="relative w-full max-w-[430px] min-h-screen mx-auto bg-white flex flex-col items-center pt-12 pb-16 px-6 box-border text-gray-900 select-none">
      {/* Section Title */}
      <h2 className="text-2xl font-normal tracking-wide text-center mb-8 font-serif animate-fadeIn">
        Mempelai
      </h2>

      {/* Groom Section */}
      {groom && (
        <div className="w-full flex justify-center mb-8" style={{ animationName: 'scaleUp', animationDuration: '0.8s', animationDelay: '0.2s', animationFillMode: 'both' }}>
          <PersonCard person={groom} delayIndex={0} />
        </div>
      )}

      {/* Ampersand Separator Circle */}
      <div className="mt-6 mb-6 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
        <span className="font-serif italic text-sm text-gray-500">&amp;</span>
      </div>

      {/* Bride Section */}
      {bride && (
        <div className="w-full flex justify-center" style={{ animationName: 'scaleUp', animationDuration: '0.8s', animationDelay: '0.4s', animationFillMode: 'both' }}>
          <PersonCard person={bride} delayIndex={1} />
        </div>
      )}
    </section>
  )
}
