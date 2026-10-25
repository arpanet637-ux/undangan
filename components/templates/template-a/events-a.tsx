import { MapPin, Clock, Calendar } from 'lucide-react';
import { useScrollAnimation } from './use-scroll-animation';

interface Event {
  id: number;
  name: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  address: string;
  mapsUrl?: string;
}

interface EventsSectionProps {
  events: Event[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const isEven = index % 2 === 0;

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`relative transition-all duration-700 delay-${index * 100} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Card with geometric design */}
      <div className={`relative ${isEven ? 'md:ml-auto md:mr-12' : 'md:mr-auto md:ml-12'} md:max-w-lg`}>
        {/* Background shape - rectangle */}
        <div className="absolute -inset-4 bg-white border border-gray-200 -z-10" />

        <div className="relative bg-white p-8 md:p-10 border border-charcoal/5">
          {/* Event title */}
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-display text-charcoal mb-2">
              {event.name}
            </h3>
            <div className="w-8 h-0.5 bg-sage" />
          </div>

          {/* Date & Time */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <Calendar className="w-4 h-4 text-sage mt-1 flex-shrink-0" />
              <div>
                <p className="text-charcoal font-body">{formatDate(event.date)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Clock className="w-4 h-4 text-sage mt-1 flex-shrink-0" />
              <div>
                <p className="text-charcoal font-body">
                  {event.startTime} {event.endTime && `- ${event.endTime}`}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-charcoal/10 mb-8" />

          {/* Venue */}
          <div className="flex items-start gap-4">
            <MapPin className="w-4 h-4 text-sage mt-1 flex-shrink-0" />
            <div>
              <p className="text-charcoal font-display text-lg mb-1">{event.venue}</p>
              <p className="text-charcoal/50 font-body text-sm leading-relaxed">{event.address}</p>
            </div>
          </div>

          {/* Map link */}
          {event.mapsUrl && (
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-sage text-sm font-body hover:text-sage-dark transition-colors group"
            >
              <span>Lihat Peta</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventsSection({ events }: EventsSectionProps) {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation({ threshold: 0.3 });

  if (!events.length) return null;

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Background decorative element */}
      <div className="absolute right-0 top-1/4 w-1/3 h-96 bg-gray-50 border border-gray-200/50 -z-0" />
      
      <div className="container mx-auto px-8 md:px-16 relative z-10">
        {/* Section title */}
        <div 
          ref={titleRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-20 transition-all duration-700 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-[10px] tracking-[0.4em] text-sage font-body uppercase">
            Save The Date
          </span>
          <h2 className="text-2xl md:text-3xl font-display text-charcoal mt-3">
            Waktu & Tempat
          </h2>
          <div className="w-12 h-px bg-sage mx-auto mt-6" />
        </div>

        {/* Events */}
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
