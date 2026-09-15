import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';

export const FirstRunModal: React.FC = () => {
  const { isFirstRunOpen, setIsFirstRunOpen, settings, updateSettings } = useSaanjh();
  const [formData, setFormData] = useState({
    ownerName: settings.ownerName || 'Ayush Mishra',
    businessName: settings.businessName || 'SAANJH WEDDINGS',
    activeSeason: settings.activeSeason || '2026-2027 Royal Winter Season',
    phone: settings.phone || '+91 98200 00000',
  });

  if (!isFirstRunOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      isConfigured: true,
    });
    localStorage.setItem('saanjh_os_first_run_dismissed', 'true');
    setIsFirstRunOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#FBF9F5] border-2 border-[#C5A059] rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Royal Hero Header */}
        <div className="bg-[#2D0A0E] text-[#FBF9F5] px-8 py-8 text-center relative overflow-hidden border-b-2 border-[#C5A059]/40">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -top-8 w-36 h-36 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C5A059]/15 border border-[#C5A059] mb-4 text-[#E6CA65] shadow-inner">
            <Crown className="w-7 h-7" />
          </div>

          <p className="text-xs uppercase tracking-[0.25em] text-[#E6CA65] font-medium mb-1">
            Private Wedding House
          </p>
          <h2 className="font-serif text-3xl font-semibold tracking-wide text-[#FBF9F5]">
            WELCOME TO SAANJH AI
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C5A059] mt-1 font-semibold">
            THE PRIVATE EVENT DIRECTOR
          </p>

          <div className="mt-5 inline-block bg-[#3B0D11]/80 border border-[#C5A059]/40 px-5 py-2 rounded-full">
            <p className="font-serif italic text-sm text-[#FBF9F5]/90 tracking-wide">
              "We don't do 50 shaadis. We do 6."
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#3B0D11] mb-1">
              Initialize Your Executive Workspace
            </h3>
            <p className="text-xs text-[#706E6B] leading-relaxed">
              Configure your command centre credentials. The system will adapt all briefs, vendor communications, and director audits directly to your name.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                Owner / Director Name
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3.5 py-2.5 text-sm text-[#1E1E24] focus:outline-hidden"
                placeholder="e.g. Ayush Mishra"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3.5 py-2.5 text-sm text-[#1E1E24] focus:outline-hidden"
                placeholder="SAANJH WEDDINGS"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                Active Season
              </label>
              <input
                type="text"
                required
                value={formData.activeSeason}
                onChange={(e) => setFormData({ ...formData, activeSeason: e.target.value })}
                className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3.5 py-2.5 text-sm text-[#1E1E24] focus:outline-hidden"
                placeholder="2026-2027 Royal Season"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                Direct Contact Phone
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3.5 py-2.5 text-sm text-[#1E1E24] focus:outline-hidden"
                placeholder="+91 98200 00000"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#DFD7C2]">
            <button
              type="submit"
              className="w-full py-3 px-6 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg font-serif tracking-wider font-semibold text-sm flex items-center justify-center gap-2 border border-[#C5A059]/60 shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#E6CA65]" />
              ENTER SAANJH COMMAND CENTRE
              <ArrowRight className="w-4 h-4 text-[#E6CA65]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
