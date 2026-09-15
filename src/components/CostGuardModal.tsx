import React from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import { ShieldAlert, X, CheckCircle2, Lock } from 'lucide-react';

export const CostGuardModal: React.FC = () => {
  const { costGuard, closeCostGuard } = useSaanjh();

  if (!costGuard.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#FBF9F5] border border-[#C5A059]/40 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#3B0D11] text-[#FBF9F5] px-6 py-4 flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-[#E6CA65]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#E6CA65] font-semibold">
                Mandatory Safety Policy
              </span>
              <h3 className="font-serif text-lg text-[#FBF9F5] tracking-wide">
                PAID SERVICE REQUIRED
              </h3>
            </div>
          </div>
          <button
            onClick={closeCostGuard}
            className="text-[#FBF9F5]/70 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-[#1E1E24]">
          <div className="bg-[#3B0D11]/5 border-l-3 border-[#3B0D11] p-3 rounded-r-md text-xs text-[#3B0D11]">
            <strong>SAANJH BRAND CONSTITUTION PROTOCOL:</strong> The application must NEVER
            activate billing, purchase anything, enable paid external APIs, or create paid infrastructure without explicit human clearance.
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#706E6B] font-semibold">
                1. What Service Was Requested
              </div>
              <div className="font-medium text-[#3B0D11] mt-0.5">
                {costGuard.featureName || 'External Paid Cloud API / Gateway / Cloud Storage'}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-[#706E6B] font-semibold">
                2. Why It Is Required
              </div>
              <div className="text-[#333] mt-0.5 leading-relaxed text-xs">
                {costGuard.reason ||
                  'The requested action requires external commercial cloud infrastructure, SMS telecom gateways, or third-party paid subscriptions.'}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-[#706E6B] font-semibold">
                3. Purpose
              </div>
              <div className="text-[#333] mt-0.5 text-xs">
                Automated commercial dispatch, paid cloud sync, or multi-tenant database hosting.
              </div>
            </div>

            <div className="bg-[#1E382B]/10 border border-[#1E382B]/30 rounded-lg p-3">
              <div className="text-xs uppercase tracking-wider text-[#1E382B] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E382B]" />
                4. Free Zero-Cost Alternative Available
              </div>
              <div className="text-[#1E382B] text-xs mt-1 leading-relaxed">
                {costGuard.alternative ||
                  'Saanjh OS provides 100% free client-side JSON export/import, local browser storage, direct mail/whatsapp links, and free server-side Gemini Flash processing.'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F5F1E8] px-6 py-3 border-t border-[#DFD7C2] flex items-center justify-between">
          <span className="text-xs text-[#706E6B] flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#C5A059]" />
            ₹0 Cost Guard: Active & Locked
          </span>
          <button
            onClick={closeCostGuard}
            className="px-4 py-1.5 bg-[#3B0D11] text-[#FBF9F5] text-xs font-medium rounded-md hover:bg-[#4A151B] transition-colors shadow-xs"
          >
            Acknowledge & Continue Free
          </button>
        </div>
      </div>
    </div>
  );
};
