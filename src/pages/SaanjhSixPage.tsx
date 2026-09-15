import React from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import { Crown, Sparkles, Plus, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
}

export const SaanjhSixPage: React.FC<Props> = ({ onNavigate }) => {
  const { slots, updateSlot, setActiveEventId, settings } = useSaanjh();

  const commissionedCount = slots.filter((s) => s.status === 'COMMISSIONED').length;
  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;

  const formatCurrency = (val?: number | null) => {
    if (!val || isNaN(val)) return '—';
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh`;
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  const handleOpenCommissioned = (eventId?: string) => {
    if (eventId) {
      setActiveEventId(eventId);
      onNavigate('event-command');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Brand Hero Manifesto */}
      <div className="bg-[#2D0A0E] text-[#FBF9F5] p-8 lg:p-12 rounded-3xl border-2 border-[#C5A059] shadow-2xl text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#3B0D11] border border-[#C5A059] px-4 py-1.5 rounded-full text-[#E6CA65] text-xs font-serif tracking-widest uppercase">
            <Crown className="w-3.5 h-3.5" />
            <span>The Saanjh Brand Constitution</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-wider text-[#FBF9F5] leading-tight">
            "WE DON'T DO 50 SHAADIS.
            <br />
            WE DO 6."
          </h1>

          <p className="text-xs sm:text-sm text-[#FBF9F5]/80 leading-relaxed font-sans max-w-xl mx-auto">
            Saanjh intentionally accepts only six major wedding commissions per season.
            This guarantees absolute director involvement, hyper-personalization, zero commercial assembly lines, and flawless operational execution.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs font-serif font-bold text-[#E6CA65]">
            <span>{settings.activeSeason}</span>
            <span>•</span>
            <span>{commissionedCount} OF 6 COMMISSIONED</span>
            <span>•</span>
            <span>{availableCount} SLOTS AVAILABLE</span>
          </div>
        </div>
      </div>

      {/* The Six Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot) => {
          const isComm = slot.status === 'COMMISSIONED';
          const isHold = slot.status === 'ON_HOLD';
          const isAvail = slot.status === 'AVAILABLE';

          return (
            <div
              key={slot.slotNumber}
              className={`rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-xs ${
                isComm
                  ? 'bg-[#FBF9F5] border-[#C5A059] shadow-md'
                  : isHold
                  ? 'bg-[#F5F1E8] border-[#DFD7C2]'
                  : 'bg-[#FBF9F5]/60 border-dashed border-[#C5A059]/60 hover:border-[#3B0D11]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
                  <span className="font-mono text-xs font-bold tracking-widest text-[#C5A059]">
                    COMMISSION SLOT 0{slot.slotNumber}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isComm
                        ? 'bg-[#3B0D11] text-[#E6CA65]'
                        : isHold
                        ? 'bg-[#C5A059]/20 text-[#3B0D11]'
                        : 'bg-[#1E382B]/10 text-[#1E382B]'
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>

                {isComm ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#706E6B] block">
                        Royal Couple / Family
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#3B0D11] mt-0.5">
                        {slot.clientName}
                      </h3>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#555]">
                      <div>
                        Date: <strong>{slot.weddingDate}</strong>
                      </div>
                      <div>
                        Destination: <strong>{slot.destination}</strong>
                      </div>
                      <div>
                        Estimated Budget:{' '}
                        <strong className="text-[#1E382B]">
                          {formatCurrency(slot.estimatedBudget)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-center py-6 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mx-auto">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#3B0D11]">
                      Commission Slot Open
                    </h3>
                    <p className="text-xs text-[#706E6B] max-w-[200px] mx-auto">
                      Awaiting celebration inquiry & director commission approval.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-[#DFD7C2]">
                {isComm ? (
                  <button
                    onClick={() => handleOpenCommissioned(slot.eventId)}
                    className="w-full py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>View Command Centre</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#E6CA65]" />
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('new-celebration')}
                    className="w-full py-2 bg-[#C5A059] hover:bg-[#DFB76C] text-[#2D0A0E] rounded-lg text-xs font-serif font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Commission This Slot</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
