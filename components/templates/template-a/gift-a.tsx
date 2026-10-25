import { useState } from 'react';
import { Copy, Check, Gift } from 'lucide-react';
import { useScrollAnimation } from './use-scroll-animation';

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankLogo?: string;
}

interface GiftSectionProps {
  bankAccounts: BankAccount[];
}

export function GiftSection({ bankAccounts }: GiftSectionProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.2 });

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (bankAccounts.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white border-t border-gray-200 relative overflow-hidden">
      <div 
        ref={sectionRef as React.RefObject<HTMLDivElement>}
        className={`container mx-auto px-8 md:px-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-sage/30 mb-6">
            <Gift className="w-6 h-6 text-sage" />
          </div>
          <h2 className="text-2xl md:text-3xl text-charcoal font-display mb-3">
            Wedding Gift
          </h2>
          <p className="text-charcoal/50 max-w-md mx-auto leading-relaxed font-body text-sm">
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami
          </p>
        </div>

        {/* Bank Accounts - horizontal cards */}
        <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto">
          {bankAccounts.map((account, index) => (
            <div
              key={account.id}
              className={`flex-1 bg-white p-8 relative transition-all duration-500 delay-${index * 100} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-sage" />
              
              <p className="text-[10px] text-charcoal/40 tracking-[0.2em] uppercase mb-4 font-body">
                {account.bankName}
              </p>
              
              <div className="flex items-center justify-between gap-4 mb-4">
                <p className="text-xl font-mono text-charcoal tracking-wider">
                  {account.accountNumber}
                </p>
                <button
                  onClick={() => copyToClipboard(account.accountNumber, account.id)}
                  className="p-2.5 rounded-full bg-gray-100 border border-gray-200 hover:bg-sage/10 hover:border-sage/30 transition-colors"
                  title="Salin nomor rekening"
                >
                  {copiedId === account.id ? (
                    <Check className="w-4 h-4 text-sage" />
                  ) : (
                    <Copy className="w-4 h-4 text-charcoal/40" />
                  )}
                </button>
              </div>
              
              <p className="text-sm text-charcoal/50 font-body">
                a.n. <span className="text-charcoal">{account.accountHolder}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
