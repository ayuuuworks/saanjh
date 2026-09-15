import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Compass,
  FileText,
  BookOpen,
  Calendar,
  Clock,
  Palette,
  HeartHandshake,
  Crown,
  Utensils,
  Music,
  Users2,
  Wallet,
  AlertTriangle,
  FolderLock,
  Plus,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Shield,
  Trash2,
} from 'lucide-react';
import { EventFunction, SaanjhChapter } from '../types';
import { BrandGuardianBadge } from '../components/BrandGuardianBadge';

interface Props {
  onNavigate: (page: string) => void;
}

export const EventCommandCentrePage: React.FC<Props> = ({ onNavigate }) => {
  const {
    activeEvent,
    addFunction,
    deleteFunction,
    updateChapter,
    tasks,
    risks,
    budgetItems,
    quotes,
    vendors,
    documents,
  } = useSaanjh();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'master-brief'
    | 'chapters'
    | 'functions'
    | 'run-of-show'
    | 'design'
    | 'hospitality'
    | 'royal-protocol'
    | 'catering'
    | 'entertainment'
    | 'vendors'
    | 'budget'
    | 'risks'
    | 'documents'
  >('overview');

  const [isAddFunctionOpen, setIsAddFunctionOpen] = useState(false);
  const [newFunctionData, setNewFunctionData] = useState<Partial<EventFunction>>({
    name: '',
    dayNumber: 1,
    date: activeEvent?.weddingDate || '',
    startTime: '18:00',
    endTime: '23:00',
    venue: activeEvent?.venue || '',
    guestCount: activeEvent?.guestCount || 100,
    theme: '',
    dressCode: '',
    decor: '',
    food: '',
    entertainment: '',
    photography: '',
    lighting: '',
    staffing: '',
    transport: '',
    specialMoments: '',
  });

  if (!activeEvent) {
    return (
      <div className="text-center py-20 bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl">
        <Compass className="w-12 h-12 text-[#C5A059] mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-bold text-[#3B0D11]">
          No Celebration Selected
        </h2>
        <p className="text-xs text-[#706E6B] mt-1">
          Please select a commissioned celebration or intake a new one to view its command post.
        </p>
        <button
          onClick={() => onNavigate('events')}
          className="mt-4 px-5 py-2 bg-[#3B0D11] text-[#FBF9F5] text-xs font-serif rounded-lg"
        >
          View All Celebrations
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '1. Overview', icon: Compass },
    { id: 'master-brief', label: '2. Master Brief', icon: FileText },
    { id: 'chapters', label: '3. 19 Chapters', icon: BookOpen },
    { id: 'functions', label: '4. Functions', icon: Calendar },
    { id: 'run-of-show', label: '5. Run of Show', icon: Clock },
    { id: 'design', label: '6. Scenography', icon: Palette },
    { id: 'hospitality', label: '7. Hospitality', icon: HeartHandshake },
    { id: 'royal-protocol', label: '8. Royal Protocol', icon: Crown },
    { id: 'catering', label: '9. Khansamas', icon: Utensils },
    { id: 'entertainment', label: '10. Artists', icon: Music },
    { id: 'vendors', label: '11. Procurement', icon: Users2 },
    { id: 'budget', label: '12. Budget P&L', icon: Wallet },
    { id: 'risks', label: '13. Risks', icon: AlertTriangle },
    { id: 'documents', label: '14. Briefs & Vault', icon: FolderLock },
  ];

  const handleCreateFunction = (e: React.FormEvent) => {
    e.preventDefault();
    const newFn: EventFunction = {
      id: `fn-${Date.now()}`,
      eventId: activeEvent.id,
      isDemo: Boolean(activeEvent.isDemo),
      name: newFunctionData.name || 'New Function',
      dayNumber: Number(newFunctionData.dayNumber) || 1,
      date: newFunctionData.date || activeEvent.weddingDate,
      startTime: newFunctionData.startTime || '18:00',
      endTime: newFunctionData.endTime || '22:00',
      venue: newFunctionData.venue || activeEvent.venue,
      guestCount: Number(newFunctionData.guestCount) || activeEvent.guestCount,
      theme: newFunctionData.theme || 'Royal Heritage',
      dressCode: newFunctionData.dressCode || 'Traditional Indian',
      decor: newFunctionData.decor || 'Handcrafted floral arches',
      food: newFunctionData.food || 'Curated royal dining',
      entertainment: newFunctionData.entertainment || 'Live acoustic',
      photography: newFunctionData.photography || '35mm editorial',
      lighting: newFunctionData.lighting || 'Warm ambient',
      staffing: newFunctionData.staffing || 'Personal butlers',
      transport: newFunctionData.transport || 'Luxury fleet',
      specialMoments: newFunctionData.specialMoments || 'Grand ceremonial entry',
    };
    addFunction(activeEvent.id, newFn);
    setIsAddFunctionOpen(false);
  };

  const isDemoActive = Boolean(activeEvent.isDemo);

  const eventBudgetItems = budgetItems.filter(
    (b) => b.eventId === activeEvent.id && (isDemoActive || !b.isDemo)
  );
  const eventRisks = risks.filter(
    (r) => r.eventId === activeEvent.id && (isDemoActive || !r.isDemo)
  );
  const eventDocuments = documents.filter(
    (d) => d.eventId === activeEvent.id && (isDemoActive || !d.isDemo)
  );
  const contractedQuotes = quotes.filter(
    (q) =>
      q.eventId === activeEvent.id &&
      !q.requiresAssociation &&
      (isDemoActive || !q.isDemo)
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
    <div className="space-y-6 pb-12">
      {/* Top Event Command Header Banner */}
      <div className="bg-[#2D0A0E] text-[#FBF9F5] p-6 lg:p-8 rounded-2xl border border-[#C5A059]/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#E6CA65] bg-[#3B0D11] px-2 py-0.5 rounded-sm border border-[#C5A059]/50">
                Slot {activeEvent.commissionSlot} of 6 Commissioned
              </span>
              <span className="text-xs text-[#FBF9F5]/70">Code: {activeEvent.code}</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-wide text-[#FBF9F5]">
              {activeEvent.clientName}
            </h1>
            <p className="text-xs text-[#FBF9F5]/80 mt-1">
              {activeEvent.destination} • {activeEvent.weddingDate} • {activeEvent.guestCount} Royal Guests
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#3B0D11] border border-[#C5A059]/40 px-4 py-2 rounded-xl text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#C5A059] block">
                Committed Budget
              </span>
              <span className="font-serif text-lg font-bold text-[#E6CA65]">
                {formatCurrency(activeEvent.committedBudget)}
              </span>
            </div>
            <div className="bg-[#3B0D11] border border-[#C5A059]/40 px-4 py-2 rounded-xl text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#C5A059] block">
                Health Status
              </span>
              <span className="font-serif text-base font-bold text-[#1E382B] bg-[#1E382B]/20 px-2 py-0.5 rounded-sm inline-block mt-0.5">
                {activeEvent.health}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 14 Navigation Tabs (Horizontally scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#DFD7C2]">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-serif whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#3B0D11] text-[#FBF9F5] border border-[#C5A059]/60 font-semibold shadow-xs'
                  : 'bg-[#F5F1E8] text-[#706E6B] hover:text-[#3B0D11] hover:bg-[#EAE3D2]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E6CA65]' : 'text-[#706E6B]'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Render */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Event Core Specs */}
              <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-[#3B0D11] pb-3 border-b border-[#DFD7C2] mb-4">
                  Celebration Specifications & Essence
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#706E6B] uppercase text-[10px] font-semibold block">
                      Primary Contact
                    </span>
                    <span className="font-bold text-[#3B0D11]">{activeEvent.primaryContact}</span>
                    <span className="text-[11px] text-[#706E6B] block">{activeEvent.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#706E6B] uppercase text-[10px] font-semibold block">
                      Venue & City
                    </span>
                    <span className="font-bold text-[#3B0D11]">{activeEvent.venue}</span>
                    <span className="text-[11px] text-[#706E6B] block">{activeEvent.city}</span>
                  </div>
                  <div>
                    <span className="text-[#706E6B] uppercase text-[10px] font-semibold block">
                      Design Aesthetic
                    </span>
                    <span className="font-bold text-[#3B0D11]">{activeEvent.style}</span>
                  </div>
                  <div>
                    <span className="text-[#706E6B] uppercase text-[10px] font-semibold block">
                      Color Palette
                    </span>
                    <span className="font-bold text-[#3B0D11]">{activeEvent.colorPalette}</span>
                  </div>
                  <div>
                    <span className="text-[#706E6B] uppercase text-[10px] font-semibold block">
                      VIP Presence
                    </span>
                    <span className="font-bold text-[#3B0D11] truncate block">
                      {activeEvent.vipGuests || 'None specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#706E6B] uppercase text-[10px] font-semibold block">
                      Budget Flexibility
                    </span>
                    <span className="font-bold text-[#1E382B]">
                      {activeEvent.budgetFlexibility}
                    </span>
                  </div>
                </div>

                {/* Red Lines Section */}
                {activeEvent.forbiddenThings && (
                  <div className="mt-5 bg-[#3B0D11]/5 border-l-3 border-[#3B0D11] p-3 rounded-r-md">
                    <span className="text-[10px] uppercase font-bold text-[#3B0D11] tracking-wider block">
                      Forbidden / Red Lines (What They Absolutely Do Not Want)
                    </span>
                    <p className="text-xs text-[#333] mt-1 italic">
                      "{activeEvent.forbiddenThings}"
                    </p>
                  </div>
                )}
              </div>

              {/* Multi-Function Cards preview */}
              <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2] mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#3B0D11]">
                    Multi-Day Functions Schedule ({activeEvent.functions?.length || 0})
                  </h3>
                  <button
                    onClick={() => setActiveTab('functions')}
                    className="text-xs font-semibold text-[#3B0D11] hover:text-[#C5A059] flex items-center gap-1"
                  >
                    Manage Functions <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {activeEvent.functions?.map((fn) => (
                    <div
                      key={fn.id}
                      className="p-3.5 bg-[#F5F1E8] border border-[#DFD7C2] rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#C5A059]">
                          Day {fn.dayNumber} • {fn.startTime} to {fn.endTime}
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#3B0D11]">
                          {fn.name}
                        </h4>
                        <p className="text-xs text-[#666] mt-0.5">
                          {fn.venue} • {fn.theme}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[#706E6B]">
                        {fn.guestCount} Guests
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Brand Guardian & Quick Actions */}
            <div className="space-y-6">
              <BrandGuardianBadge />

              <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-5 shadow-xs space-y-3">
                <span className="text-xs uppercase font-bold tracking-wider text-[#3B0D11] block">
                  Quick Director Actions
                </span>
                <button
                  onClick={() => onNavigate('ai-director')}
                  className="w-full py-2 bg-[#3B0D11] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold hover:bg-[#4A151B] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E6CA65]" />
                  Ask AI Director About This Event
                </button>
                <button
                  onClick={() => onNavigate('quotes')}
                  className="w-full py-2 bg-[#F5F1E8] text-[#3B0D11] border border-[#DFD7C2] rounded-lg text-xs font-semibold hover:bg-[#EAE3D2] transition-colors"
                >
                  Upload & Analyze Vendor Quote
                </button>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="w-full py-2 bg-[#F5F1E8] text-[#3B0D11] border border-[#DFD7C2] rounded-lg text-xs font-semibold hover:bg-[#EAE3D2] transition-colors"
                >
                  Inspect Task Force Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MASTER BRIEF TAB */}
      {activeTab === 'master-brief' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 lg:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
                Living Document
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#3B0D11]">
                Official Event Master Brief
              </h3>
            </div>
            <button
              onClick={() => onNavigate('ai-director')}
              className="px-3.5 py-1.5 bg-[#3B0D11] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E6CA65]" />
              Refine Master Brief
            </button>
          </div>

          <div className="bg-[#F5F1E8] p-6 rounded-xl border border-[#DFD7C2] max-h-[650px] overflow-y-auto">
            <div className="prose prose-stone text-xs leading-relaxed text-[#1E1E24] whitespace-pre-wrap font-sans">
              {activeEvent.masterBrief || 'No Master Brief formulated yet.'}
            </div>
          </div>
        </div>
      )}

      {/* 3. 19 CHAPTERS TAB */}
      {activeTab === 'chapters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DFD7C2]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
                Saanjh Operational Framework
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#3B0D11]">
                The 19 Saanjh Chapters
              </h3>
            </div>
            <p className="text-xs text-[#706E6B]">
              Every Saanjh commission is executed strictly across these nineteen chapters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEvent.chapters?.map((chapter) => (
              <div
                key={chapter.id}
                className="bg-[#FBF9F5] border border-[#DFD7C2] hover:border-[#C5A059] rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#C5A059]">
                      Ch. {chapter.chapterNumber}
                    </span>
                    <select
                      value={chapter.status}
                      onChange={(e) =>
                        updateChapter(activeEvent.id, chapter.id, {
                          status: e.target.value as any,
                        })
                      }
                      className="text-[10px] font-bold uppercase rounded-md px-2 py-0.5 bg-[#F5F1E8] border border-[#DFD7C2] focus:outline-hidden"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="READY_FOR_APPROVAL">Approval</option>
                      <option value="LOCKED">Locked</option>
                    </select>
                  </div>

                  <h4 className="font-serif text-base font-bold text-[#3B0D11] mt-2">
                    {chapter.title}
                  </h4>
                  <p className="text-xs text-[#666] mt-1 leading-relaxed">
                    {chapter.notes || 'Awaiting initial operational brief notes.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DFD7C2] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-[#706E6B]">
                    <span>Progress:</span>
                    <span className="font-bold text-[#3B0D11]">{chapter.completionPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={chapter.completionPercentage}
                    onChange={(e) =>
                      updateChapter(activeEvent.id, chapter.id, {
                        completionPercentage: Number(e.target.value),
                      })
                    }
                    className="w-24 accent-[#3B0D11]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FUNCTIONS TAB */}
      {activeTab === 'functions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
                Multi-Function Architecture
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#3B0D11]">
                Celebration Functions
              </h3>
            </div>
            <button
              onClick={() => setIsAddFunctionOpen(true)}
              className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#E6CA65]" />
              Add Function
            </button>
          </div>

          {/* Add Function Dialog */}
          {isAddFunctionOpen && (
            <form
              onSubmit={handleCreateFunction}
              className="bg-[#F5F1E8] border-2 border-[#C5A059] rounded-2xl p-6 shadow-md space-y-4 animate-in fade-in"
            >
              <h4 className="font-serif text-lg font-bold text-[#3B0D11]">
                Add New Event Function
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Function Name *</label>
                  <input
                    type="text"
                    required
                    value={newFunctionData.name}
                    onChange={(e) => setNewFunctionData({ ...newFunctionData, name: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Day Number *</label>
                  <input
                    type="number"
                    value={newFunctionData.dayNumber}
                    onChange={(e) =>
                      setNewFunctionData({ ...newFunctionData, dayNumber: Number(e.target.value) })
                    }
                    className="w-full bg-[#FBF9F5] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Date *</label>
                  <input
                    type="date"
                    value={newFunctionData.date}
                    onChange={(e) => setNewFunctionData({ ...newFunctionData, date: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Timing (Start - End) *</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={newFunctionData.startTime}
                      onChange={(e) =>
                        setNewFunctionData({ ...newFunctionData, startTime: e.target.value })
                      }
                      className="w-1/2 bg-[#FBF9F5] border border-[#DFD7C2] rounded-md p-2"
                    />
                    <input
                      type="time"
                      value={newFunctionData.endTime}
                      onChange={(e) =>
                        setNewFunctionData({ ...newFunctionData, endTime: e.target.value })
                      }
                      className="w-1/2 bg-[#FBF9F5] border border-[#DFD7C2] rounded-md p-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Venue *</label>
                  <input
                    type="text"
                    value={newFunctionData.venue}
                    onChange={(e) => setNewFunctionData({ ...newFunctionData, venue: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Theme</label>
                  <input
                    type="text"
                    value={newFunctionData.theme}
                    onChange={(e) => setNewFunctionData({ ...newFunctionData, theme: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFunctionOpen(false)}
                  className="px-4 py-1.5 text-xs text-[#706E6B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3B0D11] text-[#FBF9F5] rounded-md text-xs font-semibold"
                >
                  Save Function
                </button>
              </div>
            </form>
          )}

          {/* Functions list */}
          <div className="space-y-4">
            {activeEvent.functions?.map((fn) => (
              <div
                key={fn.id}
                className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
                      Day {fn.dayNumber} • {fn.date} ({fn.startTime} - {fn.endTime})
                    </span>
                    <h4 className="font-serif text-2xl font-bold text-[#3B0D11] mt-0.5">
                      {fn.name}
                    </h4>
                    <p className="text-xs text-[#706E6B] mt-0.5">
                      Venue: <strong>{fn.venue}</strong> • Guests: <strong>{fn.guestCount}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => deleteFunction(activeEvent.id, fn.id)}
                    className="p-1.5 text-[#706E6B] hover:text-[#B87A81] rounded-md"
                    title="Remove Function"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F5F1E8] p-4 rounded-xl border border-[#DFD7C2]">
                  <div>
                    <span className="text-[10px] uppercase text-[#706E6B] font-semibold block">
                      Theme & Dress Code
                    </span>
                    <span className="font-medium text-[#3B0D11] block">{fn.theme}</span>
                    <span className="text-[11px] text-[#555] block">{fn.dressCode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#706E6B] font-semibold block">
                      Décor & Scenography
                    </span>
                    <span className="text-[#333] block">{fn.decor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#706E6B] font-semibold block">
                      Catering Direction
                    </span>
                    <span className="text-[#333] block">{fn.food}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#706E6B] font-semibold block">
                      Entertainment & Artists
                    </span>
                    <span className="text-[#333] block">{fn.entertainment}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] uppercase text-[#706E6B] font-semibold block">
                      Photography
                    </span>
                    <span className="text-[#555]">{fn.photography}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#706E6B] font-semibold block">
                      Lighting & Acoustics
                    </span>
                    <span className="text-[#555]">{fn.lighting}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#706E6B] font-semibold block">
                      Staffing Protocol
                    </span>
                    <span className="text-[#555]">{fn.staffing}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#706E6B] font-semibold block">
                      Special Moment
                    </span>
                    <span className="text-[#555]">{fn.specialMoments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. RUN OF SHOW TAB */}
      {activeTab === 'run-of-show' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
                Minute-by-Minute Run of Show Protocol
              </h3>
              <p className="text-xs text-[#706E6B] mt-0.5">
                Active Event: <strong>{activeEvent.clientName}</strong> • {activeEvent.destination}
              </p>
            </div>
            <span className="text-xs text-[#706E6B]">Whisper-Quiet Operational Cue Sheet</span>
          </div>

          <div className="space-y-3">
            {isDemoActive ? (
              [
                {
                  time: '16:00',
                  cue: 'Palace gates open for royal family guests; private flotilla begins lake crossing.',
                  owner: 'Hospitality Lead',
                  status: 'SCHEDULED',
                },
                {
                  time: '16:30',
                  cue: 'Groom Baraat assembly at East Gate. Royal Shehnai and Nagada ensemble commence welcoming fanfare.',
                  owner: 'Logistics Director',
                  status: 'SCHEDULED',
                },
                {
                  time: '17:15',
                  cue: 'Sunset Varmala on floating water pavilion. Synchronized rose petal shower from twin heritage jharokhas.',
                  owner: 'Creative Director',
                  status: 'CONFIRMED',
                },
                {
                  time: '18:00',
                  cue: 'Sacred Vedic Pheras around holy fire. Vedic chants acoustic amplification at 62dB limit.',
                  owner: 'Rituals Coordinator',
                  status: 'SCHEDULED',
                },
                {
                  time: '20:00',
                  cue: 'Royal Mewari & Awadhi 48-dish sit-down silver thali dinner commences in the Grand Dining Courtyard.',
                  owner: 'Master Khansama Lead',
                  status: 'CONFIRMED',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-[#F5F1E8] border border-[#DFD7C2]"
                >
                  <div className="font-mono text-sm font-bold text-[#3B0D11] w-16 shrink-0">
                    {item.time}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#222] font-medium leading-relaxed">{item.cue}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#706E6B]">
                      <span>Owner: <strong>{item.owner}</strong></span>
                      <span>Status: <strong className="text-[#1E382B]">{item.status}</strong></span>
                    </div>
                  </div>
                </div>
              ))
            ) : activeEvent.functions && activeEvent.functions.length > 0 ? (
              activeEvent.functions.map((fn, idx) => (
                <div
                  key={fn.id || idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-[#F5F1E8] border border-[#DFD7C2]"
                >
                  <div className="font-mono text-sm font-bold text-[#3B0D11] w-28 shrink-0">
                    Day {fn.dayNumber} • {fn.startTime || '18:00'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#222] font-medium leading-relaxed">
                      <strong>{fn.name}</strong> at {fn.venue} — Theme: {fn.theme}. {fn.specialMoments || 'Master ceremony protocol.'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#706E6B]">
                      <span>Date: <strong>{fn.date}</strong></span>
                      <span>Dress: <strong>{fn.dressCode}</strong></span>
                      <span>Food: <strong>{fn.food}</strong></span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[#F5F1E8] rounded-xl border border-[#DFD7C2] text-xs text-[#706E6B]">
                No functions scheduled yet for {activeEvent.clientName}. Add ceremony functions in the Functions tab to generate minute-by-minute cues.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. DESIGN & SCENOGRAPHY */}
      {activeTab === 'design' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
                Design, Scenography & Spatial Narrative
              </h3>
              <p className="text-xs text-[#706E6B] mt-0.5">
                Active Commission: <strong>{activeEvent.clientName}</strong> • {activeEvent.venue}, {activeEvent.destination}
              </p>
            </div>
            <span className="text-xs text-[#706E6B]">Chapter 05: Visual Architecture</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#333]">
            <div className="bg-[#F5F1E8] p-5 rounded-xl border border-[#DFD7C2] space-y-3">
              <h4 className="font-serif text-base font-bold text-[#3B0D11]">
                Scenographic Principles
              </h4>
              <p className="leading-relaxed">
                {isDemoActive
                  ? 'Rejection of temporary false ceilings and generic vinyl wraps. Preservation and spotlighting of original 17th-century Rajasthani stone arches, marble inlays, and lotus fountains.'
                  : `Bespoke spatial design celebrating ${activeEvent.venue} in ${activeEvent.destination}. Rejection of generic modern banquet trusses, temporary vinyl wraps, and commercial clutter in favor of timeless architectural proportions.`}
              </p>
              <div className="pt-2 border-t border-[#DFD7C2]">
                <span className="font-semibold text-[#3B0D11] block mb-1">
                  Floral Curation:
                </span>
                <p>
                  {isDemoActive
                    ? '12,000 Ecuadorian blush roses, local Udaipur tuberoses, and marigold garlands woven with gold thread. Zero floral foam (ecologically sound).'
                    : `Artisanal botanical installations sourced for ${activeEvent.clientName}. Zero single-use floral foam, utilizing sustainable water troughs and hand-tied garlands.`}
                </p>
              </div>
            </div>

            <div className="bg-[#F5F1E8] p-5 rounded-xl border border-[#DFD7C2] space-y-3">
              <h4 className="font-serif text-base font-bold text-[#3B0D11]">
                Acoustic & Lighting Scenography
              </h4>
              <p className="leading-relaxed">
                Color temperature strictly locked to 2400K candlelight warmth. Architectural uplighting positioned to illuminate structural accents without spill into guest eyes.
              </p>
              <div className="pt-2 border-t border-[#DFD7C2]">
                <span className="font-semibold text-[#3B0D11] block mb-1">
                  Technical Architecture:
                </span>
                <p>
                  {isDemoActive
                    ? 'Floating Mandap Engineering: Bespoke brass lattice dome sitting on submerged water pontoons with hydraulic stabilization.'
                    : `Dedicated silent power redundancy with automatic transfer switches and bespoke acoustic zoning compliant with ${activeEvent.destination} guidelines.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. HOSPITALITY */}
      {activeTab === 'hospitality' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#3B0D11] pb-3 border-b border-[#DFD7C2]">
            Guest Hospitality & Butler Directorate
          </h3>
          <p className="text-xs text-[#444] leading-relaxed">
            {isDemoActive
              ? 'In keeping with Saanjh’s 1:2 butler protocol, every palace suite is assigned an English and Hindi-speaking valet. Chilled rose-water hand towels and bespoke welcome trunks upon private boat disembarkation.'
              : `In keeping with Saanjh’s 1:2 butler protocol, all guest touchpoints for ${activeEvent.clientName} at ${activeEvent.venue} receive white-glove personalized care. Luggage transfer directly into suites upon arrival.`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-[#F5F1E8] border border-[#DFD7C2] rounded-xl text-xs">
              <span className="font-serif font-bold text-[#3B0D11] block mb-1">Arrival Protocol</span>
              <p className="text-[#666]">Coordinated guest reception in {activeEvent.destination} with designated escort attendants.</p>
            </div>
            <div className="p-4 bg-[#F5F1E8] border border-[#DFD7C2] rounded-xl text-xs">
              <span className="font-serif font-bold text-[#3B0D11] block mb-1">In-Suite Amenities</span>
              <p className="text-[#666]">Bespoke welcome hamper, handwritten invitation cards, and customized room amenities.</p>
            </div>
            <div className="p-4 bg-[#F5F1E8] border border-[#DFD7C2] rounded-xl text-xs">
              <span className="font-serif font-bold text-[#3B0D11] block mb-1">24/7 Concierge</span>
              <p className="text-[#666]">Dedicated emergency wardrobe pressing, stylist assistance, and medical standby team.</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. ROYAL PROTOCOL */}
      {activeTab === 'royal-protocol' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#3B0D11] pb-3 border-b border-[#DFD7C2]">
            Royal Protocol & VIP Hospitality
          </h3>
          <p className="text-xs text-[#444] leading-relaxed">
            {isDemoActive
              ? 'Protocol strictly follows Rajasthani royal court decorum. Seating order, ceremonial garland exchange, and private security clearance managed with zero disruption to the celebration atmosphere.'
              : `Protocol adheres to formal decorum for ${activeEvent.clientName} at ${activeEvent.venue}. Dignitary seating, ceremonial garland reception, and security clearances coordinated discreetly.`}
          </p>
        </div>
      )}

      {/* 9. CATERING & KHANSAMA */}
      {activeTab === 'catering' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#3B0D11] pb-3 border-b border-[#DFD7C2]">
            Royal Khansamas & Culinary Directorate
          </h3>
          <p className="text-xs text-[#444] leading-relaxed">
            {isDemoActive
              ? 'Zero commercial buffet lines. All dining served on custom solid silver and kansa thalis by trained service attendants. Recipes curated directly from the royal archives of Mewar and Awadh.'
              : `Zero commercial buffet lines. All banquets for ${activeEvent.clientName} feature table service on artisanal tableware with trained service attendants, highlighting authentic regional gastronomy.`}
          </p>
        </div>
      )}

      {/* 10. ENTERTAINMENT */}
      {activeTab === 'entertainment' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#3B0D11] pb-3 border-b border-[#DFD7C2]">
            Curated Artists & Acoustic Architecture
          </h3>
          <p className="text-xs text-[#444] leading-relaxed">
            {isDemoActive
              ? 'Celebrated live classical Indian artists, master qawwals, and chamber strings. No intrusive commercial DJ setups or blaring line arrays.'
              : `Curated acoustic architecture for ${activeEvent.clientName} at ${activeEvent.venue}. Acoustic zoning designed to stay strictly within ${activeEvent.destination} noise ordinances while preserving atmospheric intimacy.`}
          </p>
        </div>
      )}

      {/* 11. VENDORS & PROCUREMENT */}
      {activeTab === 'vendors' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
                Contracted Vendors & Audited Partners
              </h3>
              <p className="text-xs text-[#706E6B] mt-0.5">
                Isolated to {activeEvent.clientName} • Forensic procurement audits
              </p>
            </div>
            <button
              onClick={() => onNavigate('quotes')}
              className="text-xs font-semibold text-[#3B0D11] hover:text-[#C5A059] flex items-center gap-1 cursor-pointer"
            >
              Forensic Quotes Engine <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {contractedQuotes.length === 0 ? (
            <div className="p-8 text-center bg-[#F5F1E8] rounded-xl border border-[#DFD7C2] space-y-3">
              <p className="text-xs text-[#706E6B]">
                No vendor proposals or contracted partners assigned to <strong>{activeEvent.clientName}</strong> yet.
              </p>
              <button
                onClick={() => onNavigate('quotes')}
                className="px-4 py-2 bg-[#3B0D11] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                Intake Vendor Quote for this Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contractedQuotes.map((q) => (
                <div key={q.id} className="p-4 bg-[#F5F1E8] rounded-xl border border-[#DFD7C2] text-xs space-y-2">
                  <div className="flex items-center justify-between font-serif font-bold text-[#3B0D11]">
                    <span>{q.vendorName}</span>
                    <span className="text-[10px] text-[#C5A059] font-sans px-2 py-0.5 rounded-sm bg-[#C5A059]/15">
                      {q.benchmarkStatus || 'AUDITED'}
                    </span>
                  </div>
                  <p className="text-[#666]">{q.category} • Headline: ₹{(q.totalPrice / 100000).toFixed(2)} Lakh</p>
                  <p className="text-[11px] text-[#444] italic line-clamp-2">
                    {q.directorRecommendation || 'Forensic analysis completed by Saanjh Brand Guardian.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 12. BUDGET & P&L */}
      {activeTab === 'budget' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
            <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
              Event Financial Ledger & Committed Budget
            </h3>
            <button
              onClick={() => onNavigate('budget')}
              className="text-xs font-semibold text-[#3B0D11] hover:text-[#C5A059] flex items-center gap-1"
            >
              Full Royal Budget Sheet <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {eventBudgetItems.length === 0 ? (
              <p className="text-xs text-[#706E6B] italic p-3 bg-[#F5F1E8] rounded-lg">
                No ledger line items allocated for this celebration yet.
              </p>
            ) : (
              eventBudgetItems.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F5F1E8] border border-[#DFD7C2] text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#3B0D11]">{b.category}</span>
                    <span className="text-[#666] ml-2 font-mono">({b.item})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#706E6B]">Est: {formatCurrency(b.estimated)}</span>
                    <span className="font-serif font-bold text-[#1E382B]">
                      Committed: {formatCurrency(b.committed)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 13. RISKS & CONTINGENCY */}
      {activeTab === 'risks' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
            <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
              Active Event Risks & Contingency Protocols
            </h3>
            <button
              onClick={() => onNavigate('risks')}
              className="text-xs font-semibold text-[#3B0D11] hover:text-[#C5A059] flex items-center gap-1"
            >
              Open 16-Category Risk Engine <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {eventRisks.length === 0 ? (
              <p className="text-xs text-[#706E6B] italic p-3 bg-[#F5F1E8] rounded-lg">
                No high-risk operational flags logged for this celebration.
              </p>
            ) : (
              eventRisks.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-[#F5F1E8] border border-[#DFD7C2] rounded-xl text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-[#3B0D11]">{r.title}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-[#B87A81]/20 text-[#3B0D11]">
                      {r.severity} SEVERITY
                    </span>
                  </div>
                  <p className="text-[#555]">{r.description}</p>
                  <div className="bg-[#FBF9F5] p-2.5 rounded-md border border-[#DFD7C2] mt-2">
                    <span className="font-semibold text-[#1E382B] block">Pre-emptive Mitigation:</span>
                    <p className="text-[#333] mt-0.5">{r.mitigationPlan}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 14. DOCUMENTS & BRIEFS */}
      {activeTab === 'documents' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
            <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
              Event Briefs & Vault Documents
            </h3>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs font-semibold text-[#3B0D11] hover:text-[#C5A059] flex items-center gap-1"
            >
              Full Document Vault <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {eventDocuments.length === 0 ? (
              <p className="text-xs text-[#706E6B] italic p-4 bg-[#F5F1E8] rounded-xl col-span-2">
                No vault briefs or riders uploaded for this event yet. Use the Document Vault to file contracts or client moodboards.
              </p>
            ) : (
              eventDocuments.slice(0, 4).map((d) => {
                const displayDate = (d.uploadedAt || d.uploadDate || '').includes('T')
                  ? (d.uploadedAt || d.uploadDate || '').split('T')[0]
                  : (d.uploadedAt || d.uploadDate || 'Recent');
                return (
                  <div key={d.id} className="p-4 bg-[#F5F1E8] rounded-xl border border-[#DFD7C2] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[#3B0D11]">{d.title || 'Vault Document'}</span>
                      <span className="text-[10px] uppercase font-mono text-[#C5A059]">{d.fileType || 'PDF'}</span>
                    </div>
                    <p className="text-[#666] mt-1">{d.summary || 'Official document filed in Saanjh Vault.'}</p>
                    <div className="mt-2 text-[10px] text-[#706E6B]">
                      Category: {d.category || 'General'} • Uploaded: {displayDate}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
