import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Settings,
  Crown,
  ShieldCheck,
  Cpu,
  Lock,
  RotateCcw,
  Check,
  User,
  ShieldAlert,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, reloadDemoData, triggerCostGuard } = useSaanjh();
  const [formData, setFormData] = useState({
    ownerName: settings.ownerName || 'Ayush Mishra',
    businessName: settings.businessName || 'SAANJH WEDDINGS',
    activeSeason: settings.activeSeason || '2026-2027 Royal Winter Season',
    phone: settings.phone || '+91 98200 00000',
    autonomyLevel: settings.autonomyLevel || 'MANAGE',
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      autonomyLevel: formData.autonomyLevel as any,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
          House Governance & Constitution
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#3B0D11]">
          Constitution, Autonomy & Operating Settings
        </h1>
        <p className="text-xs text-[#706E6B] mt-0.5">
          System policies governing brand integrity, executive autonomy levels, and ₹0 Cost Guard protocols.
        </p>
      </div>

      {/* Brand Constitution Display */}
      <div className="bg-[#2D0A0E] text-[#FBF9F5] rounded-2xl p-6 lg:p-8 border-2 border-[#C5A059] shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-2 text-[#E6CA65]">
          <Crown className="w-5 h-5" />
          <span className="font-serif font-bold text-sm tracking-widest uppercase">
            Saanjh Brand Constitution
          </span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FBF9F5]">
          "WE DON'T DO 50 SHAADIS. WE DO 6."
        </h2>

        <div className="space-y-2 text-xs text-[#FBF9F5]/80 leading-relaxed font-sans border-t border-[#C5A059]/30 pt-3">
          <p>
            <strong>Position:</strong> Private Wedding House.
          </p>
          <p>
            <strong>Saanjh is NOT:</strong> A budget wedding planner, a mass factory churn house, a generic banquet coordinator, or a vendor aggregator.
          </p>
          <p>
            <strong>Saanjh IS:</strong> A private luxury event house for extraordinary couples who demand bespoke scenography, royal khansama culinary curation, zero commercial cliches, and whisper-quiet guest hospitality.
          </p>
        </div>
      </div>

      {/* Autonomy Model (Three Levels) */}
      <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
          Three-Tier AI Autonomy Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Green */}
          <div className="p-4 bg-[#1E382B]/10 border border-[#1E382B]/30 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#1E382B] font-bold uppercase text-[10px] tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E382B]" />
              GREEN: Auto-Act
            </div>
            <p className="text-[#1E382B] font-serif font-bold text-sm">Autonomous Execution</p>
            <p className="text-[#333] leading-relaxed">
              Data formatting, schedule organizing, budget tallying, task classification, and document indexing proceed automatically.
            </p>
          </div>

          {/* Yellow */}
          <div className="p-4 bg-[#C5A059]/15 border border-[#C5A059]/40 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#3B0D11] font-bold uppercase text-[10px] tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
              YELLOW: Prepare for Approval
            </div>
            <p className="text-[#3B0D11] font-serif font-bold text-sm">Ready For Sign-Off</p>
            <p className="text-[#333] leading-relaxed">
              Quote forensic audits, negotiation counter-offer drafts, client briefings, and timeline revisions prepared for Ayush’s approval.
            </p>
          </div>

          {/* Red */}
          <div className="p-4 bg-[#3B0D11]/10 border border-[#3B0D11]/30 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#3B0D11] font-bold uppercase text-[10px] tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B0D11]" />
              RED: Human Mandatory
            </div>
            <p className="text-[#3B0D11] font-serif font-bold text-sm">Owner Signature Only</p>
            <p className="text-[#333] leading-relaxed">
              Releasing fund transfers, signing legal venue contracts, locking vendor deposits, and committing the final guest list.
            </p>
          </div>
        </div>
      </div>

      {/* Cost Guard & Model Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#1E382B] font-serif font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>₹0 Cost Guard Protocol</span>
          </div>
          <p className="text-xs text-[#555] leading-relaxed">
            Status: <strong className="text-[#1E382B]">ACTIVE & LOCKED</strong>. The system will never trigger paid services, paid external databases, or subscriptions. All data is securely handled locally and via free-tier server Gemini processing.
          </p>
        </div>

        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#3B0D11] font-serif font-bold text-sm">
            <Cpu className="w-4 h-4 text-[#C5A059]" />
            <span>AI Model Engine</span>
          </div>
          <p className="text-xs text-[#555] leading-relaxed">
            Engine: <strong>Gemini 3.8 Flash (Server-Side)</strong>.
            Equipped with the autonomous <em>Saanjh Event Director Fallback Engine</em> ensuring complete resilience even if offline.
          </p>
        </div>
      </div>

      {/* Edit Owner Profile Form */}
      <form
        onSubmit={handleSave}
        className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4"
      >
        <h3 className="font-serif text-lg font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
          Executive Director Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Owner / Director Name</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#1E1E24]"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Business Name</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#1E1E24]"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Active Wedding Season</label>
            <input
              type="text"
              value={formData.activeSeason}
              onChange={(e) => setFormData({ ...formData, activeSeason: e.target.value })}
              className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#1E1E24]"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Direct Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#1E1E24]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#DFD7C2]">
          {isSaved ? (
            <span className="text-xs text-[#1E382B] font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Settings Saved!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-5 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-bold shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset to Demo Data */}
      <div className="bg-[#B87A81]/10 border border-[#B87A81]/30 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="font-serif font-bold text-sm text-[#3B0D11]">
            Reset Demonstration Roster
          </h4>
          <p className="text-xs text-[#555] mt-0.5">
            Reload the Suryaveer & Ananya Singhania demo royal wedding data and sample quotes.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reload demo royal celebration dataset?')) {
              reloadDemoData();
              alert('Demo data successfully reloaded.');
            }
          }}
          className="px-4 py-2 bg-[#B87A81]/20 hover:bg-[#B87A81]/30 text-[#3B0D11] border border-[#B87A81]/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reload Demo Data</span>
        </button>
      </div>
    </div>
  );
};
