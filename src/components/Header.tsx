import React from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Crown,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Calendar,
  AlertCircle,
  Menu,
  FileText,
} from 'lucide-react';

interface Props {
  onOpenMobileNav: () => void;
  onNavigate: (page: string) => void;
  onOpenMeetingNotes: () => void;
  currentPage: string;
}

export const Header: React.FC<Props> = ({
  onOpenMobileNav,
  onNavigate,
  onOpenMeetingNotes,
  currentPage,
}) => {
  const { events, activeEventId, setActiveEventId, slots, triggerCostGuard, settings } = useSaanjh();

  const commissionedCount = slots.filter((s) => s.status === 'COMMISSIONED').length;
  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;

  const activeEvent = events.find((e) => e.id === activeEventId);

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#DFD7C2] px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile toggle + Brand Crest */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 text-[#3B0D11] hover:bg-[#F5F1E8] rounded-lg transition-colors"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#3B0D11] text-[#E6CA65] flex items-center justify-center border border-[#C5A059] shadow-xs group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold tracking-wider text-[#3B0D11]">
                  SAANJH
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded-xs bg-[#C5A059]/20 text-[#3B0D11] border border-[#C5A059]/40">
                  AI DIRECTOR
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#706E6B] font-medium hidden sm:block">
                Private Wedding House • OS
              </p>
            </div>
          </div>
        </div>

        {/* Center: Commission Slots & Active Celebration Switcher */}
        <div className="hidden md:flex items-center gap-3">
          {/* Slots Indicator */}
          <div
            onClick={() => onNavigate('saanjh-six')}
            className="cursor-pointer bg-[#F5F1E8] hover:bg-[#EAE3D2] border border-[#DFD7C2] hover:border-[#C5A059] rounded-lg px-3 py-1.5 flex items-center gap-2.5 transition-all text-xs"
            title="Saanjh Commission Slots: We accept only 6 weddings per season."
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const slot = slots.find((s) => s.slotNumber === num);
                const isComm = slot?.status === 'COMMISSIONED';
                const isHold = slot?.status === 'ON_HOLD';
                return (
                  <span
                    key={num}
                    className={`w-2.5 h-2.5 rounded-full ${
                      isComm
                        ? 'bg-[#3B0D11] border border-[#C5A059]'
                        : isHold
                        ? 'bg-[#C5A059]'
                        : 'bg-[#DFD7C2]'
                    }`}
                  />
                );
              })}
            </div>
            <div className="text-[11px] font-medium text-[#3B0D11]">
              <span className="font-bold">{commissionedCount} of 6</span> Slots Commissioned
            </div>
          </div>

          {/* Active Event Dropdown */}
          <div className="relative">
            <select
              value={activeEventId || ''}
              onChange={(e) => setActiveEventId(e.target.value)}
              className="appearance-none bg-[#F5F1E8] border border-[#DFD7C2] hover:border-[#C5A059] focus:border-[#3B0D11] rounded-lg pl-3 pr-8 py-1.5 text-xs text-[#1E1E24] font-medium focus:outline-hidden cursor-pointer"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.clientName} ({evt.city})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#706E6B] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Right: Quick Action Buttons & ₹0 Cost Guard */}
        <div className="flex items-center gap-2">
          {/* Meeting Notes tool */}
          <button
            onClick={onOpenMeetingNotes}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#EAE3D2] border border-[#DFD7C2] text-[#3B0D11] rounded-lg text-xs font-medium transition-colors"
            title="Audit raw client & vendor meeting notes"
          >
            <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden lg:inline">Meeting Notes</span>
          </button>

          {/* Ask AI Director CTA */}
          <button
            onClick={() => onNavigate('ai-director')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold border border-[#C5A059]/40 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E6CA65]" />
            <span>Ask Director</span>
          </button>

          {/* ₹0 Cost Guard Badge */}
          <button
            onClick={() =>
              triggerCostGuard(
                'External Cloud Infrastructure',
                'Saanjh AI is fully zero-cost and runs natively within your environment.',
                'Local browser persistence & free tier Gemini API calls are always active.'
              )
            }
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#1E382B]/10 hover:bg-[#1E382B]/20 border border-[#1E382B]/30 text-[#1E382B] rounded-lg text-[11px] font-medium transition-colors"
            title="₹0 Cost Guard: Strict protection against accidental charges or subscriptions"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E382B]" />
            <span>₹0 Cost Guard</span>
          </button>
        </div>
      </div>
    </header>
  );
};
