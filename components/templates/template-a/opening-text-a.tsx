import { useScrollAnimation } from './use-scroll-animation';

interface OpeningTextSectionProps {
  openingText: string;
}

export function OpeningTextSection({ openingText }: OpeningTextSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  if (!openingText) return null;

  return (
    <section className="py-20 md:py-24 bg-white relative">
      <div 
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`container mx-auto px-8 text-center max-w-2xl transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="w-16 h-px bg-gold mx-auto mb-10" />
        <div className="space-y-4">
          {openingText.split('\n').filter(p => p.trim()).map((paragraph, index) => (
            <p key={index} className="text-charcoal/70 text-base md:text-lg leading-relaxed font-body italic">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="w-16 h-px bg-gold mx-auto mt-10" />
      </div>
    </section>
  );
}
