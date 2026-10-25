import { useScrollAnimation } from './use-scroll-animation';

interface ClosingSectionProps {
  groomName: string;
  brideName: string;
  closingText?: string;
}

export function ClosingSection({ groomName, brideName, closingText }: ClosingSectionProps) {
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  
  const groomFirst = groomName.split(' ')[0];
  const brideFirst = brideName.split(' ')[0];
  
  const defaultClosing = "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.";

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div 
        ref={sectionRef as React.RefObject<HTMLDivElement>}
        className={`container mx-auto px-8 md:px-16 relative z-10 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-2xl mx-auto text-center">
          {/* Closing text */}
          <p className="text-charcoal/60 leading-relaxed font-body mb-12">
            {closingText || defaultClosing}
          </p>
          
          {/* Gratitude */}
          <div className="mb-12">
            <p className="text-sm text-charcoal/40 font-body mb-4">
              Atas kehadiran dan doa restunya, kami ucapkan
            </p>
            <h3 className="text-2xl md:text-3xl font-display text-charcoal">
              Terima Kasih
            </h3>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="w-20 h-px bg-sage/30" />
            <div className="w-3 h-3 rounded-full border border-sage/40" />
            <div className="w-20 h-px bg-sage/30" />
          </div>
          
          {/* Couple names signature */}
          <div>
            <p className="text-[10px] tracking-[0.25em] text-sage font-body uppercase mb-3">
              Kami yang berbahagia
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl md:text-2xl font-display text-charcoal">{groomFirst}</span>
              <span className="text-sage font-display italic text-base">&</span>
              <span className="text-xl md:text-2xl font-display text-charcoal">{brideFirst}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
