import { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { useScrollAnimation } from './use-scroll-animation';

interface Wish {
  id: number;
  guestName: string;
  message: string;
  createdAt: string;
}

interface WishesSectionProps {
  wishes: Wish[];
  guestName?: string;
  weddingSlug?: string | null;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function WishesSection({ wishes: initialWishes, guestName, weddingSlug }: WishesSectionProps) {
  const [wishes, setWishes] = useState(initialWishes);
  const [name, setName] = useState(guestName || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = weddingSlug ? `/api/w/${weddingSlug}/wishes` : '/api/wishes';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: name.trim(),
          message: message.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit wish');
      }

      const newWish: Wish = {
        id: Date.now(),
        guestName: name.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString()
      };
      
      setWishes([newWish, ...wishes]);
      setMessage('');
    } catch (err) {
      setError('Gagal mengirim ucapan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white relative" id="wishes">
      <div 
        ref={sectionRef as React.RefObject<HTMLDivElement>}
        className="container mx-auto px-8 md:px-16 relative z-10"
      >
        {/* Section title */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <span className="text-[10px] tracking-[0.4em] text-sage font-body uppercase">
            Guestbook
          </span>
          <h2 className="text-2xl md:text-3xl text-charcoal font-display mt-3">
            Ucapan & Doa
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 max-w-5xl mx-auto">
          {/* Form */}
          <form 
            onSubmit={handleSubmit}
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="space-y-5">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full px-0 py-3 bg-transparent border-b border-charcoal/20 text-charcoal placeholder-charcoal/30 focus:border-sage focus:outline-none transition-colors font-body"
                  required
                />
              </div>
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis ucapan dan doa Anda..."
                  rows={4}
                  className="w-full px-0 py-3 bg-transparent border-b border-charcoal/20 text-charcoal placeholder-charcoal/30 focus:border-sage focus:outline-none transition-colors resize-none font-body"
                  required
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm font-body">{error}</p>
              )}
              <button
                type="submit"
                disabled={!name.trim() || !message.trim() || isSubmitting}
                className="w-full mt-4 px-8 py-4 bg-gray-500 text-white text-xs font-body tracking-[0.15em] uppercase hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {isSubmitting ? (
                  <span>Mengirim...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Ucapan
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Wishes list */}
          <div className={`transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="max-h-[400px] overflow-y-auto space-y-4 pr-4">
              {wishes.length === 0 ? (
                <div className="text-center py-12 text-charcoal/30">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="font-body text-sm">Jadilah yang pertama memberikan ucapan</p>
                </div>
              ) : (
                wishes.map((wish) => (
                  <div key={wish.id} className="bg-white border border-gray-200 p-5 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sage" />
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-display text-charcoal">{wish.guestName}</h4>
                      <span className="text-[10px] text-charcoal/30 font-body">
                        {formatRelativeTime(wish.createdAt)}
                      </span>
                    </div>
                    <p className="text-charcoal/60 text-sm leading-relaxed font-body">{wish.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
