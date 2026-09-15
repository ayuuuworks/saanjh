import React from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Crown,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Receipt,
  Users,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { BrandGuardianBadge } from '../components/BrandGuardianBadge';

interface Props {
  onNavigate: (page: string) => void;
  onOpenMeetingNotes: () => void;
}

export const DashboardPage: React.FC<Props> = ({ onNavigate, onOpenMeetingNotes }) => {
  const {
    events,
    tasks,
    risks,
    quotes,
    slots,
    activeEvent,
    budgetItems,
    settings,
  } = useSaanjh();

  const isDemoActive = Boolean(activeEvent?.isDemo);

  // Strictly isolate data for the active event
  const isolatedTasks = React.useMemo(() => {
    if (!activeEvent) return tasks.filter((t) => !t.isDemo);
    return tasks.filter(
      (t) => t.eventId === activeEvent.id && (isDemoActive || !t.isDemo)
    );
  }, [tasks, activeEvent, isDemoActive]);

  const isolatedRisks = React.useMemo(() => {
    if (!activeEvent) return risks.filter((r) => !r.isDemo);
    return risks.filter(
      (r) => r.eventId === activeEvent.id && (isDemoActive || !r.isDemo)
    );
  }, [risks, activeEvent, isDemoActive]);

  const isolatedBudget = React.useMemo(() => {
    if (!activeEvent) return budgetItems.filter((b) => !b.isDemo);
    return budgetItems.filter(
      (b) => b.eventId === activeEvent.id && (isDemoActive || !b.isDemo)
    );
  }, [budgetItems, activeEvent, isDemoActive]);

  const isolatedQuotes = React.useMemo(() => {
    if (!activeEvent) return quotes.filter((q) => !q.isDemo && !q.requiresAssociation);
    return quotes.filter(
      (q) =>
        q.eventId === activeEvent.id &&
        !q.requiresAssociation &&
        (isDemoActive || !q.isDemo)
    );
  }, [quotes, activeEvent, isDemoActive]);

  const activeEventsCount = events.length;
  const upcomingFunctionsCount = events.reduce(
    (acc, e) => acc + (e.functions ? e.functions.length : 0),
    0
  );
  const pendingTasksCount = isolatedTasks.filter((t) => t.status !== 'DONE').length;
  const pendingApprovalsCount = isolatedTasks.filter((t) => t.status === 'APPROVAL').length;
  const totalCommitted = events.reduce((acc, e) => acc + (e.committedBudget || 0), 0);
  const openRisksCount = isolatedRisks.filter((r) => r.status !== 'RESOLVED').length;
  const availableSlotsCount = slots.filter((s) => s.status === 'AVAILABLE').length;

  const criticalTasks = isolatedTasks.filter(
    (t) => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'DONE'
  );

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val)) return '₹ 0';
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹ ${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Season Philosophy */}
      <div className="bg-[#2D0A0E] text-[#FBF9F5] rounded-2xl p-6 lg:p-8 border border-[#C5A059]/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C5A059]/15 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#E6CA65] animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#E6CA65] font-semibold">
                Saanjh Command Centre • {settings.activeSeason}
              </span>
            </div>
            <h1 className="font-serif text-3xl lg:text-4xl font-bold tracking-wide text-[#FBF9F5]">
              Executive Director Overview
            </h1>
            <p className="text-xs text-[#FBF9F5]/70 mt-1 max-w-xl leading-relaxed">
              Managing Director: <strong className="text-[#E6CA65]">{settings.ownerName}</strong>.
              Autonomous curation active. Protecting the Saanjh philosophy: <em>"We don't do 50 shaadis. We do 6."</em>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('new-celebration')}
              className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#DFB76C] text-[#2D0A0E] font-serif font-semibold text-xs tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              INTAKE NEW CELEBRATION
            </button>
            <button
              onClick={() => onNavigate('ai-director')}
              className="px-4 py-2.5 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] font-serif font-semibold text-xs tracking-wider rounded-lg border border-[#C5A059]/40 shadow-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#E6CA65]" />
              CONSULT DIRECTOR
            </button>
          </div>
        </div>
      </div>

      {/* Top Statistics Bar (7 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#706E6B] block">
            Active Events
          </span>
          <span className="font-serif text-2xl font-bold text-[#3B0D11] mt-1 block">
            {activeEventsCount}
          </span>
          <span className="text-[10px] text-[#1E382B] font-medium mt-0.5 block">
            Royal Commissions
          </span>
        </div>

        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#706E6B] block">
            Upcoming Functions
          </span>
          <span className="font-serif text-2xl font-bold text-[#3B0D11] mt-1 block">
            {upcomingFunctionsCount}
          </span>
          <span className="text-[10px] text-[#706E6B] mt-0.5 block">Multi-day Cadence</span>
        </div>

        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#706E6B] block">
            Pending Tasks
          </span>
          <span className="font-serif text-2xl font-bold text-[#3B0D11] mt-1 block">
            {pendingTasksCount}
          </span>
          <span className="text-[10px] text-[#B87A81] font-semibold mt-0.5 block">
            {criticalTasks.length} High / Critical
          </span>
        </div>

        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#706E6B] block">
            Approvals Needed
          </span>
          <span className="font-serif text-2xl font-bold text-[#C5A059] mt-1 block">
            {pendingApprovalsCount}
          </span>
          <span className="text-[10px] text-[#706E6B] mt-0.5 block">Owner Sign-off</span>
        </div>

        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#706E6B] block">
            Committed Budget
          </span>
          <span className="font-serif text-lg font-bold text-[#1E382B] mt-1 block truncate">
            {formatCurrency(totalCommitted)}
          </span>
          <span className="text-[10px] text-[#706E6B] mt-0.5 block">Total Exposure</span>
        </div>

        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#706E6B] block">
            Open Risks
          </span>
          <span className="font-serif text-2xl font-bold text-[#B87A81] mt-1 block">
            {openRisksCount}
          </span>
          <span className="text-[10px] text-[#706E6B] mt-0.5 block">Under Mitigation</span>
        </div>

        <div
          onClick={() => onNavigate('saanjh-six')}
          className="bg-[#3B0D11] border border-[#C5A059]/40 rounded-xl p-3.5 shadow-xs cursor-pointer hover:bg-[#4A151B] transition-colors"
        >
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#E6CA65] block">
            Available Slots
          </span>
          <span className="font-serif text-2xl font-bold text-[#FBF9F5] mt-1 block">
            {availableSlotsCount} of 6
          </span>
          <span className="text-[10px] text-[#E6CA65]/80 font-medium mt-0.5 block">
            {availableSlotsCount === 0 ? 'Season Closed' : 'Season Open'}
          </span>
        </div>
      </div>

      {/* AI's: WHAT NEEDS YOUR ATTENTION (Most Important Section) */}
      <div className="bg-[#F5F1E8] border-2 border-[#C5A059] rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-[#DFD7C2] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3B0D11] text-[#E6CA65] flex items-center justify-center border border-[#C5A059] shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                Executive Directive
              </span>
              <h2 className="font-serif text-xl font-bold text-[#3B0D11]">
                WHAT NEEDS YOUR ATTENTION RIGHT NOW
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#706E6B]">
              Autonomy Level: <strong>MANAGE</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Priority 1 */}
          <div className="bg-[#FBF9F5] border border-[#C5A059]/40 rounded-xl p-4 flex flex-col justify-between space-y-3">
            {isDemoActive ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#B87A81]/20 text-[#3B0D11]">
                    CRITICAL DECISION
                  </span>
                  <span className="text-[11px] text-[#706E6B]">Due: 48 Hours</span>
                </div>
                <h3 className="font-serif text-base font-semibold text-[#3B0D11] mt-2">
                  Floating Mandap Maritime Stability Clearances
                </h3>
                <p className="text-xs text-[#555] mt-1 leading-relaxed">
                  Udaipur Port Authority requires structural civil sign-off for water ballast displacement before pontoon anchoring can proceed.
                </p>
              </div>
            ) : isolatedRisks.length > 0 ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#B87A81]/20 text-[#3B0D11]">
                    ACTIVE RISK • {isolatedRisks[0].severity}
                  </span>
                  <span className="text-[11px] text-[#706E6B]">{isolatedRisks[0].category}</span>
                </div>
                <h3 className="font-serif text-base font-semibold text-[#3B0D11] mt-2">
                  {isolatedRisks[0].title}
                </h3>
                <p className="text-xs text-[#555] mt-1 leading-relaxed">
                  {isolatedRisks[0].description || isolatedRisks[0].mitigationPlan || 'Mitigation protocol under review.'}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#1E382B]/15 text-[#1E382B]">
                    CLEAR
                  </span>
                  <span className="text-[11px] text-[#706E6B]">Risk Register</span>
                </div>
                <h3 className="font-serif text-base font-semibold text-[#3B0D11] mt-2">
                  No Critical Blockers
                </h3>
                <p className="text-xs text-[#555] mt-1 leading-relaxed">
                  All operational streams for {activeEvent?.clientName || 'this celebration'} are on schedule.
                </p>
              </div>
            )}
            <button
              onClick={() => onNavigate(isolatedRisks.length > 0 ? 'risks' : 'tasks')}
              className="text-xs font-semibold text-[#3B0D11] hover:text-[#C5A059] flex items-center gap-1.5 transition-colors pt-2 border-t border-[#DFD7C2] cursor-pointer"
            >
              {isolatedRisks.length > 0 ? 'Take Action on Risk' : 'View Event Tasks'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Priority 2 */}
          <div className="bg-[#FBF9F5] border border-[#C5A059]/40 rounded-xl p-4 flex flex-col justify-between space-y-3">
            {isDemoActive ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#C5A059]/20 text-[#3B0D11]">
                    VENDOR AUDIT
                  </span>
                  <span className="text-[11px] text-[#706E6B]">1 New Quote</span>
                </div>
                <h3 className="font-serif text-base font-semibold text-[#3B0D11] mt-2">
                  House of Mewar Scenography Quote Audit
                </h3>
                <p className="text-xs text-[#555] mt-1 leading-relaxed">
                  Quotation has ₹11.2L in un-capped variable crew accommodation. Saanjh Director recommends negotiating a flat fee cap of ₹7.5L.
                </p>
              </div>
            ) : isolatedQuotes.length > 0 ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#C5A059]/20 text-[#3B0D11]">
                    VENDOR AUDIT
                  </span>
                  <span className="text-[11px] text-[#706E6B]">{isolatedQuotes[0].benchmarkStatus || 'AUDITED'}</span>
                </div>
                <h3 className="font-serif text-base font-semibold text-[#3B0D11] mt-2">
                  {isolatedQuotes[0].vendorName}
                </h3>
                <p className="text-xs text-[#555] mt-1 leading-relaxed">
                  {isolatedQuotes[0].category} • Total: {formatCurrency(isolatedQuotes[0].totalPrice)}. Forensic review complete.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#1E382B]/15 text-[#1E382B]">
                    PROCUREMENT
                  </span>
                  <span className="text-[11px] text-[#706E6B]">0 Pending</span>
                </div>
                <h3 className="font-serif text-base font-semibold text-[#3B0D11] mt-2">
                  Procurement Ledger Clean
                </h3>
                <p className="text-xs text-[#555] mt-1 leading-relaxed">
                  No un-audited quotes pending for {activeEvent?.clientName || 'this celebration'}.
                </p>
              </div>
            )}
            <button
              onClick={() => onNavigate('quotes')}
              className="text-xs font-semibold text-[#3B0D11] hover:text-[#C5A059] flex items-center gap-1.5 transition-colors pt-2 border-t border-[#DFD7C2] cursor-pointer"
            >
              Review Forensic Audit <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Priority 3 */}
          <div className="bg-[#FBF9F5] border border-[#C5A059]/40 rounded-xl p-4 flex flex-col justify-between space-y-3">
            {isDemoActive ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#1E382B]/15 text-[#1E382B]">
                    BUDGET ALERT
                  </span>
                  <span className="text-[11px] text-[#706E6B]">Auto Warning</span>
                </div>
                <h3 className="font-serif text-base font-semibold text-[#3B0D11] mt-2">
                  Décor Trending 6% Above Allocation
                </h3>
                <p className="text-xs text-[#555] mt-1 leading-relaxed">
                  Floating mandap custom brass fabrication has increased Décor commitment to ₹1.13 Cr against ₹1.10 Cr estimated.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#1E382B]/15 text-[#1E382B]">
                    BUDGET OVERVIEW
                  </span>
                  <span className="text-[11px] text-[#706E6B]">Ledger Status</span>
                </div>
                <h3 className="font-serif text-base font-semibold text-[#3B0D11] mt-2">
                  {formatCurrency(activeEvent?.committedBudget || 0)} Committed
                </h3>
                <p className="text-xs text-[#555] mt-1 leading-relaxed">
                  Allocation target: {formatCurrency(activeEvent?.estimatedBudget || 0)}. {isolatedBudget.length} line items logged.
                </p>
              </div>
            )}
            <button
              onClick={() => onNavigate('budget')}
              className="text-xs font-semibold text-[#3B0D11] hover:text-[#C5A059] flex items-center gap-1.5 transition-colors pt-2 border-t border-[#DFD7C2] cursor-pointer"
            >
              Inspect Budget Ledgers <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Operational Pulse (Today • This Week • Next Critical Action • Event Health) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timeline & Operational Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today & This Week */}
          <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2] mb-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-[#3B0D11]" />
                <h3 className="font-serif text-lg font-bold text-[#3B0D11]">
                  Operational Cadence (Today & This Week)
                </h3>
              </div>
              <span className="text-xs text-[#706E6B]">
                Active Event: <strong>{activeEvent?.clientName || 'None'}</strong>
              </span>
            </div>

            <div className="space-y-3">
              {isDemoActive ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F1E8] border border-[#DFD7C2]">
                    <div className="w-2 h-2 rounded-full bg-[#B87A81] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#3B0D11]">TODAY</span>
                        <span className="text-[10px] text-[#706E6B]">15:00 IST</span>
                      </div>
                      <p className="text-xs text-[#333] mt-0.5">
                        Technical acoustic walkthrough with Rajasthan Heritage Conservation Board for evening curfew extension.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F1E8] border border-[#DFD7C2]">
                    <div className="w-2 h-2 rounded-full bg-[#C5A059] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#3B0D11]">TOMORROW</span>
                        <span className="text-[10px] text-[#706E6B]">11:30 IST</span>
                      </div>
                      <p className="text-xs text-[#333] mt-0.5">
                        Floral import quarantine customs clearance inspection for 12,000 Ecuadorian blush roses at Jaipur terminal.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F1E8] border border-[#DFD7C2]">
                    <div className="w-2 h-2 rounded-full bg-[#1E382B] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#3B0D11]">THIS WEEKEND</span>
                        <span className="text-[10px] text-[#706E6B]">Oct 28</span>
                      </div>
                      <p className="text-xs text-[#333] mt-0.5">
                        Royal Mewari & Awadhi 48-dish banquet menu tasting with Singhania family at palace dining salon.
                      </p>
                    </div>
                  </div>
                </>
              ) : isolatedTasks.length > 0 ? (
                isolatedTasks.slice(0, 3).map((t, idx) => (
                  <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F1E8] border border-[#DFD7C2]">
                    <div className="w-2 h-2 rounded-full bg-[#C5A059] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#3B0D11]">
                          {t.priority} • {t.department}
                        </span>
                        <span className="text-[10px] text-[#706E6B]">{t.deadline || 'Upcoming'}</span>
                      </div>
                      <p className="text-xs text-[#333] mt-0.5">{t.title}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[#F5F1E8] border border-[#DFD7C2] text-xs text-[#706E6B] text-center">
                  No scheduled operational tasks logged for {activeEvent?.clientName || 'this celebration'}.
                </div>
              )}
            </div>
          </div>

          {/* Vendor Alerts & Payment Alerts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[#3B0D11] font-serif font-semibold text-sm mb-3">
                <Users className="w-4 h-4 text-[#C5A059]" />
                <span>Vendor Health & Alerts</span>
              </div>
              {isDemoActive ? (
                <ul className="space-y-2.5 text-xs text-[#444]">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E382B] mt-1.5" />
                    <span><strong>House of Mewar:</strong> Structural elevation v3 received; waiting on maritime ballast signoff.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E382B] mt-1.5" />
                    <span><strong>Shahi Khansamas:</strong> Heirloom slow-coal brass deghs confirmed dispatched from Lucknow.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-1.5" />
                    <span><strong>Namrata Soni Styling:</strong> Sabyasachi lehenga delivery delay needs synchronization.</span>
                  </li>
                </ul>
              ) : isolatedQuotes.length > 0 ? (
                <ul className="space-y-2.5 text-xs text-[#444]">
                  {isolatedQuotes.slice(0, 3).map((q) => (
                    <li key={q.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E382B] mt-1.5" />
                      <span><strong>{q.vendorName}:</strong> {q.benchmarkStatus || 'AUDITED'} • {formatCurrency(q.totalPrice)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#706E6B] italic">
                  No vendor alerts logged for {activeEvent?.clientName || 'this celebration'}.
                </p>
              )}
            </div>

            <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[#3B0D11] font-serif font-semibold text-sm mb-3">
                <Receipt className="w-4 h-4 text-[#C5A059]" />
                <span>Upcoming Payment Milestones</span>
              </div>
              {isDemoActive ? (
                <ul className="space-y-2.5 text-xs text-[#444]">
                  <li className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-[#3B0D11] block">Taj Hotels Buyout Tranche 2</span>
                      <span className="text-[11px] text-[#706E6B]">Due within 6 days (Nov 01)</span>
                    </div>
                    <span className="font-serif font-bold text-[#1E382B]">₹ 35,00,000</span>
                  </li>
                  <li className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-[#3B0D11] block">Floral Cold-Chain Transit Deposit</span>
                      <span className="text-[11px] text-[#706E6B]">Due on Oct 26</span>
                    </div>
                    <span className="font-serif font-bold text-[#1E382B]">₹ 8,50,000</span>
                  </li>
                </ul>
              ) : isolatedBudget.filter((b) => b.committed > b.paid).length > 0 ? (
                <ul className="space-y-2.5 text-xs text-[#444]">
                  {isolatedBudget
                    .filter((b) => b.committed > b.paid)
                    .slice(0, 3)
                    .map((b) => (
                      <li key={b.id} className="flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-[#3B0D11] block">{b.category}</span>
                          <span className="text-[11px] text-[#706E6B]">{b.item}</span>
                        </div>
                        <span className="font-serif font-bold text-[#1E382B]">
                          {formatCurrency(b.committed - b.paid)}
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-xs text-[#706E6B] italic">
                  No pending payment tranches for {activeEvent?.clientName || 'this celebration'}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Active Event Health & Brand Guardian */}
        <div className="space-y-6">
          {/* Event Health Indicator */}
          <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2] mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-[#706E6B]">
                Event Health Indicator
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1E382B]/10 text-[#1E382B] border border-[#1E382B]/30">
                GREEN • HEALTHY
              </span>
            </div>

            <p className="font-serif text-base font-semibold text-[#3B0D11]">
              {activeEvent?.clientName || 'No Active Event'}
            </p>
            <p className="text-xs text-[#706E6B] mt-0.5">
              {activeEvent?.destination} • {activeEvent?.weddingDate}
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#555]">
                <span>Phase:</span>
                <span className="font-bold text-[#3B0D11]">{activeEvent?.currentPhase}</span>
              </div>
              <div className="flex items-center justify-between text-[#555]">
                <span>Budget Utilization:</span>
                <span className="font-bold text-[#1E382B]">
                  {activeEvent
                    ? Math.round((activeEvent.committedBudget / activeEvent.estimatedBudget) * 100)
                    : 0}
                  % Committed
                </span>
              </div>
              <div className="flex items-center justify-between text-[#555]">
                <span>Tasks Completion:</span>
                <span className="font-bold text-[#3B0D11]">
                  {Math.round(
                    (tasks.filter((t) => t.status === 'DONE').length / (tasks.length || 1)) * 100
                  )}
                  %
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('event-command')}
              className="w-full mt-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] text-xs font-serif font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              Open Dedicated Command Post <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Saanjh Brand Guardian Component */}
          <BrandGuardianBadge />
        </div>
      </div>
    </div>
  );
};
