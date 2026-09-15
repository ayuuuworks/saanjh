import React, { useState, useMemo } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  AlertTriangle,
  Plus,
  Shield,
  Sparkles,
  CheckCircle2,
  Trash2,
  Loader2,
  Filter,
} from 'lucide-react';
import { Risk } from '../types';

export const RisksPage: React.FC = () => {
  const { risks, addRisk, updateRisk, deleteRisk, activeEvent, events, setActiveEventId } = useSaanjh();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const categories = [
    'ALL',
    'Weather & Environment',
    'Venue & Infrastructure',
    'Vendor Reliability',
    'Legal & Permissions',
    'Food Safety & Dietary',
    'Sound & Curfew',
    'Guest Logistics & VIP Safety',
    'Family Dynamics & Politics',
    'Technical & Power',
    'Floral & Decor Durability',
    'Fire & Safety',
    'Cultural & Religious Protocols',
    'Budget Overruns',
    'Timeline Slippage',
    'Media & Privacy Leaks',
    'Health & Medical',
  ];

  const [formData, setFormData] = useState<Partial<Risk>>({
    category: 'Legal & Permissions',
    title: '',
    severity: 'HIGH',
    probability: 'MEDIUM',
    triggerSigns: '',
    description: '',
    mitigationPlan: '',
    contingencyPlan: '',
    owner: 'Ayush Mishra (Owner)',
    status: 'ACTIVE',
  });

  const filteredRisks = useMemo(() => {
    if (!activeEvent) return [];
    return risks.filter((r) => {
      if (r.eventId !== activeEvent.id) return false;
      if (!activeEvent.isDemo && r.isDemo) return false;
      if (selectedCategory === 'ALL') return true;
      return r.category === selectedCategory;
    });
  }, [risks, activeEvent, selectedCategory]);

  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newRisk: Risk = {
      id: `rsk-${Date.now()}`,
      eventId: activeEvent?.id || 'evt-demo-001',
      category: formData.category || 'Legal & Permissions',
      title: formData.title,
      severity: formData.severity as any,
      probability: formData.probability as any,
      description: formData.description || '',
      mitigationPlan: formData.mitigationPlan || '',
      contingencyPlan: formData.contingencyPlan || '',
      owner: formData.owner || 'Ayush Mishra (Owner)',
      status: formData.status as any,
      isDemo: Boolean(activeEvent?.isDemo),
    };

    addRisk(newRisk);
    setIsAddModalOpen(false);
  };

  const handleProactiveAIScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Add a proactive AI-discovered risk
      const scannedRisk: Risk = {
        id: `rsk-scan-${Date.now()}`,
        eventId: activeEvent?.id || 'evt-demo-001',
        category: 'Media & Privacy Leaks',
        title: 'Celebrity & Royal Dignitary Social Media Embargo Leakage',
        severity: 'HIGH',
        probability: 'MEDIUM',
        description: 'External vendor crew and banquet staff mobile phone cameras pose unauthorized leaks before official couple release.',
        mitigationPlan: 'Enforce tamper-evident hologram lens stickers on all 340 vendor staff phones at security checkpoints.',
        contingencyPlan: 'Pre-drafted palace PR takedown protocol and exclusive legal confidentiality non-disclosure agreements.',
        owner: 'Ayush Mishra (Owner)',
        status: 'ACTIVE',
        isDemo: Boolean(activeEvent?.isDemo),
      };
      addRisk(scannedRisk);
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
            Vulnerability Radar
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3B0D11]">
            16-Category Proactive Risk Monitor
          </h1>
          <p className="text-xs text-[#706E6B] mt-0.5">
            Real-time hazard assessment across weather, structural engineering, curfews, acoustics, and palace protocols.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleProactiveAIScan}
            disabled={isScanning}
            className="px-4 py-2 bg-[#F5F1E8] hover:bg-[#EAE3D2] text-[#3B0D11] border border-[#DFD7C2] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                <span>Scanning 16 Radar Vectors...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span>Run Proactive AI Risk Scan</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 border border-[#C5A059]/40 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-[#E6CA65]" />
            <span>Add Risk Record</span>
          </button>
        </div>
      </div>

      {/* Celebration Selector & Category Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-[#FBF9F5] p-3 rounded-xl border border-[#DFD7C2] text-xs">
          <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
          <span className="text-[#706E6B] font-semibold uppercase text-[10px]">Celebration:</span>
          <select
            value={activeEvent?.id || ''}
            onChange={(e) => setActiveEventId(e.target.value)}
            className="bg-[#F5F1E8] border border-[#DFD7C2] text-[#3B0D11] rounded-md px-2.5 py-1 text-xs font-serif font-bold focus:outline-hidden cursor-pointer"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.clientName} (Slot {evt.commissionSlot}) - {evt.city}
              </option>
            ))}
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DFD7C2]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#3B0D11] text-[#FBF9F5] font-semibold border border-[#C5A059]/50'
                  : 'bg-[#F5F1E8] text-[#706E6B] hover:text-[#3B0D11] hover:bg-[#EAE3D2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Risks Grid / Empty State */}
      {filteredRisks.length === 0 ? (
        <div className="bg-[#FBF9F5] border-2 border-dashed border-[#DFD7C2] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F5F1E8] flex items-center justify-center border border-[#C5A059]/40 text-[#C5A059]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
              No risks logged yet for this event.
            </h3>
            <p className="text-xs text-[#706E6B] max-w-md mx-auto mt-1">
              {selectedCategory !== 'ALL'
                ? 'No vulnerabilities logged in this category for this celebration.'
                : `No risk records logged for ${activeEvent?.clientName || 'this celebration'} yet. Run an AI vulnerability scan or log a risk record.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRisks.map((risk) => {
          const sevColor =
            risk.severity === 'CRITICAL'
              ? 'bg-[#B87A81]/20 text-[#3B0D11] border-[#B87A81]'
              : risk.severity === 'HIGH'
              ? 'bg-[#C5A059]/20 text-[#3B0D11] border-[#C5A059]'
              : 'bg-[#1E382B]/15 text-[#1E382B] border-[#1E382B]/30';

          return (
            <div
              key={risk.id}
              className="bg-[#FBF9F5] border border-[#DFD7C2] hover:border-[#C5A059] rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C5A059] block">
                      {risk.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#3B0D11] mt-0.5">
                      {risk.title}
                    </h3>
                  </div>

                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md border ${sevColor}`}
                  >
                    {risk.severity} SEVERITY
                  </span>
                </div>

                <p className="text-xs text-[#555] mt-2 leading-relaxed">
                  {risk.description}
                </p>

                {/* Pre-emptive Mitigation */}
                <div className="mt-4 bg-[#F5F1E8] border border-[#DFD7C2] rounded-xl p-3 text-xs space-y-1">
                  <span className="font-serif font-bold text-[#1E382B] block">
                    Pre-emptive Mitigation Strategy:
                  </span>
                  <p className="text-[#333] leading-relaxed">{risk.mitigationPlan}</p>
                </div>

                {/* Live-Day Contingency Plan */}
                <div className="mt-2 bg-[#3B0D11]/5 border-l-2 border-[#3B0D11] p-2.5 rounded-r-md text-xs">
                  <span className="font-bold text-[#3B0D11] block text-[11px]">
                    Live-Day Contingency Action:
                  </span>
                  <p className="text-[#555] mt-0.5 text-[11px] leading-relaxed">
                    {risk.contingencyPlan}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-[#DFD7C2] flex items-center justify-between">
                <div className="text-[11px] text-[#706E6B]">
                  Owner: <strong>{risk.owner}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={risk.status}
                    onChange={(e) =>
                      updateRisk(risk.id, { status: e.target.value as any })
                    }
                    className="text-[10px] uppercase font-bold bg-[#F5F1E8] border border-[#DFD7C2] rounded-md px-2 py-1"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MITIGATED">Mitigated</option>
                    <option value="CONTINGENCY_DEPLOYED">Deployed</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>

                  <button
                    onClick={() => deleteRisk(risk.id)}
                    className="p-1 text-[#706E6B] hover:text-[#B87A81] rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Risk Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FBF9F5] border-2 border-[#C5A059] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
              Record New Operational Risk
            </h3>

            <form onSubmit={handleCreateRisk} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Risk Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sudden lake squall impacting floating mandap"
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  >
                    {categories.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Pre-emptive Mitigation Plan</label>
                <textarea
                  rows={2}
                  value={formData.mitigationPlan}
                  onChange={(e) => setFormData({ ...formData, mitigationPlan: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Live-Day Contingency Plan</label>
                <textarea
                  rows={2}
                  value={formData.contingencyPlan}
                  onChange={(e) => setFormData({ ...formData, contingencyPlan: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DFD7C2]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#706E6B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3B0D11] text-[#FBF9F5] rounded-md font-serif text-xs font-semibold"
                >
                  Save Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
