import { useScrollAnimation } from './use-scroll-animation';

interface PersonInfo {
  nickname: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  address?: string;
  photo?: string;
  childOrder?: string;
}

interface CoupleSectionProps {
  groom: PersonInfo;
  bride: PersonInfo;
}

function PersonCard({ person, side }: { person: PersonInfo; side: 'groom' | 'bride' }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const isGroom = side === 'groom';
  
  const firstName = person.nickname || person.fullName.split(' ')[0];

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`flex flex-col ${isGroom ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {/* Photo with Arch frame - ONLY place with arch */}
      <div className="relative flex-shrink-0">
        {/* Decorative offset rectangle */}
        <div 
          className={`absolute ${isGroom ? '-left-4 -top-4' : '-right-4 -top-4'} w-full h-full bg-sage/10`}
          style={{ borderRadius: '999px 999px 0 0' }}
        />
        
        {/* Photo container - ARCH SHAPE */}
        <div 
          className="relative w-56 md:w-72 h-72 md:h-96 arch-frame bg-white border border-gray-200"
        >
          {person.photo ? (
            <img 
              src={person.photo} 
              alt={person.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sage/5 to-sage/10">
              <span className="text-6xl font-display text-sage/30">
                {firstName.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className={`text-center ${isGroom ? 'md:text-left' : 'md:text-right'}`}>
        {/* Role label */}
        <span className="inline-block text-[10px] tracking-[0.4em] text-sage font-body uppercase mb-4">
          {isGroom ? 'The Groom' : 'The Bride'}
        </span>
        
        {/* Name */}
        <h3 className="text-xl md:text-2xl font-display text-charcoal mb-4">
          {person.fullName}
        </h3>
        
        {/* Divider line */}
        <div className={`w-12 h-px bg-sage/40 mb-6 ${isGroom ? 'md:mx-0' : 'mx-auto md:ml-auto md:mr-0'}`} />
        
        {/* Parents info */}
        <div className="space-y-1">
          {person.childOrder && (
            <p className="text-sm text-charcoal/40 font-body italic mb-2">
              {person.childOrder}
            </p>
          )}
          <p className="text-sm text-charcoal/60 font-body">
            {person.fatherName}
          </p>
          <p className="text-[10px] tracking-[0.2em] text-charcoal/30 font-body uppercase">
            &
          </p>
          <p className="text-sm text-charcoal/60 font-body">
            {person.motherName}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CoupleSection({ groom, bride }: CoupleSectionProps) {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Side decorative text */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 text-vertical">
        <span className="text-xs tracking-[0.5em] text-charcoal/10 font-body uppercase">
          Two Hearts One Love
        </span>
      </div>

      <div className="container mx-auto px-8 md:px-16">
        {/* Section title */}
        <div 
          ref={titleRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-20 transition-all duration-700 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-px bg-sage/30" />
            <span className="w-2 h-2 rounded-full bg-sage/40" />
            <div className="w-16 h-px bg-sage/30" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display text-charcoal">
            Mempelai
          </h2>
        </div>

        {/* Couple cards - stacked with offset */}
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-20">
          <PersonCard person={groom} side="groom" />
          
          {/* Center decorative element */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-6">
              <div className="w-20 h-px bg-gradient-to-r from-transparent to-sage/30" />
              <div className="w-12 h-12 rounded-full border border-sage/20 flex items-center justify-center">
                <span className="text-sage font-display text-xl">&</span>
              </div>
              <div className="w-20 h-px bg-gradient-to-l from-transparent to-sage/30" />
            </div>
          </div>
          
          <PersonCard person={bride} side="bride" />
        </div>
      </div>
    </section>
  );
}
