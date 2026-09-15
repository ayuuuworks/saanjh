import React, { useState, useMemo, useEffect } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Receipt,
  Upload,
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Scale,
  Loader2,
  Trash2,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  Building2,
  Filter,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { VendorQuote } from '../types';
import {
  formatCurrency,
  formatMoneyOrNotProvided,
  normalizeQuote,
  parseSafeNumber,
} from '../utils/quoteUtils';

export const QuotesPage: React.FC = () => {
  const { quotes, addQuote, deleteQuote, reassignQuote, activeEvent, events, setActiveEventId } = useSaanjh();
  
  // Normalization layer: guarantees all quotes have safe fields and fallback properties
  const normalizedQuotes = useMemo(() => {
    return (quotes || []).map(normalizeQuote);
  }, [quotes]);

  // Event Isolation: default to active event, or 'ALL' if user selects all
  const [filterEventId, setFilterEventId] = useState<string>(activeEvent?.id || 'ALL');

  // Keep filterEventId in sync when activeEvent changes in Header
  useEffect(() => {
    if (activeEvent?.id) {
      setFilterEventId(activeEvent.id);
      setModalEventId(activeEvent.id);
    }
  }, [activeEvent?.id]);

  // Unassigned quotes that could not be reliably associated with an event
  const unassignedQuotes = useMemo(() => {
    return normalizedQuotes.filter(
      (q) => !q.eventId || q.requiresAssociation || q.eventName?.includes('UNASSIGNED')
    );
  }, [normalizedQuotes]);

  // Strictly isolate quotes to the active event
  const visibleQuotes = useMemo(() => {
    if (!activeEvent) return [];
    return normalizedQuotes.filter((q) => {
      // Must match active event id exactly
      if (q.eventId !== activeEvent.id) return false;
      // Demo quotes belong strictly to demo event
      if (!activeEvent.isDemo && q.isDemo) return false;
      return true;
    });
  }, [normalizedQuotes, activeEvent]);

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
    visibleQuotes.length > 0 ? visibleQuotes[0].id : null
  );
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showAuditDossier, setShowAuditDossier] = useState(false);

  // Keep selectedQuote in sync with visible quotes
  const selectedQuote = useMemo(() => {
    if (visibleQuotes.length === 0) return null;
    const found = visibleQuotes.find((q) => q.id === selectedQuoteId);
    return found || visibleQuotes[0];
  }, [visibleQuotes, selectedQuoteId]);

  // Form state for new quote audit - start with clean blanks
  const [modalEventId, setModalEventId] = useState<string>(
    activeEvent?.id || (events.length > 0 ? events[0].id : 'evt-demo-001')
  );
  const [vendorName, setVendorName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [quotedAmount, setQuotedAmount] = useState<string>('');
  const [rawQuoteText, setRawQuoteText] = useState('');

  const selectedTargetEvent = events.find((e) => e.id === modalEventId) || activeEvent;

  const handleAuditQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    const numericAmount = parseSafeNumber(quotedAmount, 0) ?? 0;
    const targetEvt = events.find((ev) => ev.id === modalEventId) || activeEvent;

    try {
      const res = await fetch('/api/ai/audit-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteText: rawQuoteText,
          vendorName: vendorName.trim(),
          category: serviceCategory.trim() || 'General Services',
          amount: numericAmount,
          eventName: targetEvt?.clientName || 'Private Celebration',
          city: targetEvt?.city || '',
          venue: targetEvt?.venue || '',
          targetBudget: targetEvt?.estimatedBudget,
        }),
      });

      const data = await res.json();
      const analysisText = data.analysis || '';

      // Parse dynamic line items from raw text if user listed them
      const extractedLineItems: { item: string; amount: number }[] = [];
      const lines = rawQuoteText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim().replace(/^[-*•]\s*/, '');
        const match = trimmed.match(/^([^:–-]+)[:–-]\s*(?:₹|INR|Rs\.?)?\s*([0-9,]+)/i);
        if (match) {
          const itemTitle = match[1].trim();
          const amountVal = parseSafeNumber(match[2], 0);
          if (itemTitle && amountVal && amountVal > 0) {
            extractedLineItems.push({ item: itemTitle, amount: amountVal });
          }
        }
      }

      // Check if text mentions taxes
      const mentionsGst = /gst|18%|tax/i.test(rawQuoteText);

      // Create rich structured quote bound strictly to the selected event
      const rawNewQuote: Partial<VendorQuote> = {
        id: `qt-${Date.now()}`,
        eventId: targetEvt?.id || 'evt-demo-001',
        eventName: targetEvt?.clientName || 'Private Celebration',
        vendorName: vendorName.trim() || 'Vendor Partner',
        category: serviceCategory.trim() || 'General Services',
        service: serviceCategory.trim() || 'General Services',
        date: new Date().toISOString().split('T')[0],
        uploadedAt: new Date().toISOString(),
        rawText: rawQuoteText,
        rawAnalysis: analysisText,
        totalPrice: numericAmount,
        quotedAmount: numericAmount,
        taxes: mentionsGst ? Math.round(numericAmount * 0.18) : undefined,
        itemizedBreakdown:
          extractedLineItems.length > 0
            ? extractedLineItems
            : [{ item: `${serviceCategory.trim() || 'Core Scope of Work'} (Quoted Total)`, amount: numericAmount }],
        included: [
          `Artisanal execution of declared scope for ${targetEvt?.clientName || 'Celebration'}`,
          'On-site deployment team and supervisors',
        ],
        notIncluded: [
          'Unspecified venue restoration or overnight overtime',
          'Municipal tariffs not itemized in quotation',
        ],
        hiddenCostsDetected: mentionsGst
          ? []
          : ['Taxes (18% GST) not explicitly bundled in headline total'],
        marketRateComparison: 'REQUIRES VERIFICATION',
        redFlags: mentionsGst ? [] : ['GST terms omitted from headline proposal'],
        negotiationRecommendations:
          'Audit against regional vendor rates and request an all-inclusive capped rate agreement.',
        counterOfferSuggestion:
          `Dear ${vendorName.trim() || 'Vendor Partner'}, Saanjh is reviewing the proposal for ${targetEvt?.clientName}. Please provide an all-inclusive capped contract covering all logistics and taxes.`,
        saanjhFitScore: 8.5,
        saanjhBrandFitScore: 8.5,
        directorsVerdict: 'NEGOTIATE',
        directorRecommendation: `Counter at ${formatCurrency(
          Math.round(numericAmount * 0.9)
        )} flat all-inclusive fee. Cap freight and overtime penalties.`,
        status: 'PENDING_AUDIT',
        verificationStatus: 'USER_PROVIDED',
        isDemo: Boolean(targetEvt?.isDemo),
        requiresAssociation: false,
      };

      const normalized = normalizeQuote(rawNewQuote);
      addQuote(normalized);
      setFilterEventId(normalized.eventId);
      setSelectedQuoteId(normalized.id);
      setIsUploadOpen(false);

      // Reset modal inputs to clean blanks
      setVendorName('');
      setServiceCategory('');
      setQuotedAmount('');
      setRawQuoteText('');
    } catch (err) {
      console.error('Audit quote error:', err);
      // Fallback: create safe user quote without crashing
      const fallbackQuote = normalizeQuote({
        id: `qt-${Date.now()}`,
        eventId: targetEvt?.id || 'evt-demo-001',
        eventName: targetEvt?.clientName || 'Private Celebration',
        vendorName: vendorName.trim() || 'Vendor Partner',
        category: serviceCategory.trim() || 'General Services',
        totalPrice: numericAmount,
        quotedAmount: numericAmount,
        status: 'PENDING_AUDIT',
        directorsVerdict: 'NEGOTIATE',
        verificationStatus: 'USER_PROVIDED',
        isDemo: Boolean(targetEvt?.isDemo),
        requiresAssociation: false,
      });
      addQuote(fallbackQuote);
      setFilterEventId(fallbackQuote.eventId);
      setSelectedQuoteId(fallbackQuote.id);
      setIsUploadOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyScript = (scriptText: string) => {
    if (!scriptText) return;
    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Verification badge renderer
  const renderVerificationBadge = (
    status?: 'VERIFIED_DATA' | 'USER_PROVIDED' | 'AI_RECOMMENDATION' | 'AI_ESTIMATE' | 'REQUIRES_VERIFICATION',
    compact = false
  ) => {
    switch (status) {
      case 'VERIFIED_DATA':
        return (
          <span
            className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded-sm border ${
              compact
                ? 'text-[9px] px-1.5 py-0.2 bg-[#1E382B]/10 text-[#1E382B] border-[#1E382B]/30'
                : 'text-[10px] px-2 py-0.5 bg-[#1E382B] text-[#FBF9F5] border-[#1E382B]'
            }`}
            title="Factually verified and signed master contract specification"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>VERIFIED DATA</span>
          </span>
        );
      case 'USER_PROVIDED':
        return (
          <span
            className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded-sm border ${
              compact
                ? 'text-[9px] px-1.5 py-0.2 bg-[#C5A059]/15 text-[#3B0D11] border-[#C5A059]/40'
                : 'text-[10px] px-2 py-0.5 bg-[#C5A059]/20 text-[#3B0D11] border-[#C5A059]/50'
            }`}
            title="Entered directly by event planner from raw vendor quote"
          >
            <FileText className="w-3 h-3" />
            <span>USER-PROVIDED DATA</span>
          </span>
        );
      case 'AI_RECOMMENDATION':
        return (
          <span
            className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded-sm border ${
              compact
                ? 'text-[9px] px-1.5 py-0.2 bg-[#3B0D11]/10 text-[#3B0D11] border-[#3B0D11]/30'
                : 'text-[10px] px-2 py-0.5 bg-[#3B0D11] text-[#E6CA65] border-[#C5A059]/40'
            }`}
            title="Generated by Saanjh AI Director negotiation engine"
          >
            <Sparkles className="w-3 h-3 text-[#E6CA65]" />
            <span>AI RECOMMENDATION</span>
          </span>
        );
      case 'AI_ESTIMATE':
        return (
          <span
            className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded-sm border ${
              compact
                ? 'text-[9px] px-1.5 py-0.2 bg-[#706E6B]/10 text-[#706E6B] border-[#706E6B]/30'
                : 'text-[10px] px-2 py-0.5 bg-[#706E6B]/20 text-[#1E1E24] border-[#706E6B]/40'
            }`}
            title="Estimated breakdown by procurement analyzer"
          >
            <HelpCircle className="w-3 h-3" />
            <span>AI ESTIMATE</span>
          </span>
        );
      case 'REQUIRES_VERIFICATION':
      default:
        return (
          <span
            className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded-sm border ${
              compact
                ? 'text-[9px] px-1.5 py-0.2 bg-[#B87A81]/20 text-[#8B263E] border-[#B87A81]/40'
                : 'text-[10px] px-2 py-0.5 bg-[#8B263E]/15 text-[#8B263E] border-[#8B263E]/40'
            }`}
            title="Unconfirmed: requires explicit vendor contract verification"
          >
            <AlertTriangle className="w-3 h-3 text-[#8B263E]" />
            <span>REQUIRES VERIFICATION</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
            Forensic Procurement Directorate
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3B0D11]">
            Vendor Quote Analyzer & Auditor
          </h1>
          <p className="text-xs text-[#706E6B] mt-0.5">
            AI-powered line-item audits, hidden surcharge extraction, benchmark comparisons, and negotiation scripts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsComparing(!isComparing)}
            className={`px-3.5 py-2 rounded-lg text-xs font-serif font-semibold border transition-all cursor-pointer ${
              isComparing
                ? 'bg-[#3B0D11] text-[#FBF9F5] border-[#3B0D11]'
                : 'bg-[#F5F1E8] text-[#3B0D11] border-[#DFD7C2] hover:bg-[#EAE3D2]'
            }`}
          >
            <Scale className="w-4 h-4 inline mr-1.5 text-[#C5A059]" />
            <span>{isComparing ? 'Exit Comparison' : 'Compare Side-by-Side'}</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 border border-[#C5A059]/40 shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#E6CA65]" />
            <span>Upload & Audit Quote</span>
          </button>
        </div>
      </div>

      {/* Celebration Filter Selector (Event Isolation) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FBF9F5] p-3 rounded-xl border border-[#DFD7C2] text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
          <span className="text-[#706E6B] font-semibold uppercase text-[10px]">Filter Celebration:</span>
          <select
            value={activeEvent?.id || ''}
            onChange={(e) => {
              setActiveEventId(e.target.value);
              setSelectedQuoteId(null);
            }}
            className="bg-[#F5F1E8] border border-[#DFD7C2] text-[#3B0D11] rounded-md px-2.5 py-1 text-xs font-serif font-bold focus:outline-hidden cursor-pointer"
          >
            {events.map((evt) => {
              const count = normalizedQuotes.filter((q) => q.eventId === evt.id && (!q.isDemo || evt.isDemo)).length;
              return (
                <option key={evt.id} value={evt.id}>
                  {evt.clientName} (Slot {evt.commissionSlot}) - {count} quote{count === 1 ? '' : 's'}
                </option>
              );
            })}
            {unassignedQuotes.length > 0 && (
              <option value="UNASSIGNED">
                ⚠️ Unassigned / Needs Review ({unassignedQuotes.length})
              </option>
            )}
          </select>
        </div>

        <div className="text-[11px] text-[#706E6B] flex items-center gap-2">
          <Receipt className="w-3.5 h-3.5 text-[#3B0D11]" />
          <span>Showing <strong>{visibleQuotes.length}</strong> audited quotation{visibleQuotes.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Side-by-Side Comparison View */}
      {isComparing && (
        <div className="bg-[#FBF9F5] border-2 border-[#C5A059] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
              Side-by-Side Quote Comparison
            </h3>
            <span className="text-xs text-[#706E6B]">
              Comparing {visibleQuotes.length} vendor proposal{visibleQuotes.length === 1 ? '' : 's'}
            </span>
          </div>

          {visibleQuotes.length === 0 ? (
            <p className="text-xs text-[#706E6B] italic py-8 text-center bg-[#F5F1E8] rounded-xl border border-[#DFD7C2]">
              No quotes uploaded yet for this event.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleQuotes.map((q) => {
                const verdictBg =
                  q.directorsVerdict === 'APPROVE'
                    ? 'bg-[#1E382B] text-[#FBF9F5]'
                    : q.directorsVerdict === 'REJECT'
                    ? 'bg-[#8B263E] text-[#FBF9F5]'
                    : 'bg-[#3B0D11] text-[#E6CA65]';

                return (
                  <div
                    key={q.id}
                    className="bg-[#F5F1E8] p-4 rounded-xl border border-[#DFD7C2] text-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-serif font-bold text-[#3B0D11] text-base">{q.vendorName}</h4>
                        <span className="text-[10px] text-[#706E6B] uppercase block mt-0.5">
                          {q.category || q.service}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm shrink-0 ${verdictBg}`}>
                        {q.directorsVerdict}
                      </span>
                    </div>

                    <div className="font-serif text-xl font-bold text-[#1E382B]">
                      {formatCurrency(q.totalPrice, { compact: false })}
                    </div>

                    <div className="space-y-1.5 text-[#555] pt-1 border-t border-[#DFD7C2]/60">
                      <div className="flex justify-between">
                        <span>Market Rate:</span>
                        <strong className="text-[#3B0D11]">{q.marketRateComparison || 'FAIR'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Saanjh Fit:</span>
                        <strong className="text-[#1E382B]">
                          {q.saanjhFitScore !== undefined ? `${q.saanjhFitScore} / 10` : 'Not scored'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Hidden Surcharges:</span>
                        <strong className={q.hiddenCostsDetected.length > 0 ? 'text-[#B87A81]' : 'text-[#1E382B]'}>
                          {q.hiddenCostsDetected.length} flagged
                        </strong>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#FBF9F5] rounded-md border border-[#DFD7C2] text-[11px] space-y-1">
                      <span className="font-serif font-bold text-[#3B0D11] block">Director Counter:</span>
                      <p className="text-[#333] leading-relaxed">
                        {q.counterOfferSuggestion || q.directorRecommendation || 'Review contract terms.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Quote Inspection Layout */}
      {!isComparing && (
        <>
          {visibleQuotes.length === 0 ? (
            /* Empty State for Celebrations with zero quotes */
            <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#3B0D11]/5 border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#C5A059]">
                <Receipt className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#3B0D11]">
                  No quotes uploaded yet for this event.
                </h3>
                <p className="text-xs text-[#706E6B] max-w-md mx-auto mt-1.5 leading-relaxed">
                  No vendor quotations have been filed for {activeEvent?.clientName || 'this celebration'}. Upload a proposal above to initiate an automated forensic rate audit.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-5 py-2.5 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold inline-flex items-center gap-2 border border-[#C5A059]/40 shadow-sm transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#E6CA65]" />
                  <span>Upload & Audit First Quote</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quotes List Sidebar */}
              <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#706E6B]">
                    Audited Quotations ({visibleQuotes.length})
                  </span>
                  <span className="text-[10px] font-mono text-[#C5A059]">
                    {filterEventId === 'ALL' ? 'All Events' : 'Filtered'}
                  </span>
                </div>

                <div className="space-y-2">
                  {visibleQuotes.map((quote) => {
                    const isSelected = selectedQuote?.id === quote.id;
                    const verdictColor =
                      quote.directorsVerdict === 'APPROVE'
                        ? 'text-[#1E382B] bg-[#1E382B]/10'
                        : quote.directorsVerdict === 'NEGOTIATE'
                        ? 'text-[#C5A059] bg-[#C5A059]/20'
                        : 'text-[#B87A81] bg-[#B87A81]/20';

                    return (
                      <div
                        key={quote.id}
                        onClick={() => setSelectedQuoteId(quote.id)}
                        className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-[#3B0D11] text-[#FBF9F5] border-[#C5A059]'
                            : 'bg-[#F5F1E8] text-[#1E1E24] border-[#DFD7C2] hover:border-[#C5A059]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4
                              className={`font-serif font-bold text-sm leading-snug ${
                                isSelected ? 'text-[#FBF9F5]' : 'text-[#3B0D11]'
                              }`}
                            >
                              {quote.vendorName}
                            </h4>
                            <span
                              className={`text-[10px] uppercase font-mono block mt-0.5 ${
                                isSelected ? 'text-[#C5A059]' : 'text-[#706E6B]'
                              }`}
                            >
                              {quote.category || quote.service}
                            </span>
                          </div>

                          <span
                            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm shrink-0 ${
                              isSelected ? 'bg-[#E6CA65] text-[#2D0A0E]' : verdictColor
                            }`}
                          >
                            {quote.directorsVerdict}
                          </span>
                        </div>

                        {/* Event tag if viewing across all celebrations */}
                        {filterEventId === 'ALL' && quote.eventName && (
                          <div
                            className={`text-[10px] truncate mt-1.5 font-medium ${
                              isSelected ? 'text-[#FBF9F5]/70' : 'text-[#706E6B]'
                            }`}
                          >
                            • {quote.eventName}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 text-xs">
                          <span
                            className={`font-serif font-bold ${
                              isSelected ? 'text-[#E6CA65]' : 'text-[#1E382B]'
                            }`}
                          >
                            {formatCurrency(quote.totalPrice, { compact: false })}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {renderVerificationBadge(quote.verificationStatus, true)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quote Forensic Details View */}
              {selectedQuote && (
                <div className="lg:col-span-2 bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
                  {/* Unassigned / Cross-Event Warning Banner */}
                  {(selectedQuote.requiresAssociation ||
                    selectedQuote.eventName?.includes('UNASSIGNED') ||
                    !selectedQuote.eventId) && (
                    <div className="bg-[#B87A81]/15 border-2 border-[#8B263E] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#8B263E]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                            UNASSIGNED / REQUIRES EVENT ASSOCIATION
                          </span>
                        </div>
                        <p className="text-xs text-[#3B0D11] leading-relaxed">
                          This quotation cannot be verified for the active celebration and is isolated to prevent cross-event data contamination.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {activeEvent && (
                          <button
                            type="button"
                            onClick={() => reassignQuote(selectedQuote.id, activeEvent.id)}
                            className="px-3.5 py-2 bg-[#3B0D11] text-[#FBF9F5] text-xs font-serif font-semibold rounded-lg hover:bg-[#4A151B] transition-colors cursor-pointer"
                          >
                            Assign to {activeEvent.clientName}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Permanently delete quotation from ${selectedQuote.vendorName}?`)) {
                              deleteQuote(selectedQuote.id);
                            }
                          }}
                          className="px-3.5 py-2 bg-[#8B263E]/20 text-[#8B263E] hover:bg-[#8B263E]/30 text-xs font-serif font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Delete Quote
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Top Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#DFD7C2]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
                          Forensic Vendor Audit
                        </span>
                        {renderVerificationBadge(selectedQuote.verificationStatus, false)}
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-[#3B0D11] mt-0.5">
                        {selectedQuote.vendorName}
                      </h3>
                      <p className="text-xs text-[#706E6B] mt-0.5">
                        Category: <strong>{selectedQuote.category || selectedQuote.service}</strong>
                        {selectedQuote.eventName && (
                          <span className="ml-2 font-serif text-[#3B0D11]">
                            • Celebration: {selectedQuote.eventName}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-left sm:text-right bg-[#F5F1E8] sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-[#DFD7C2] space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#706E6B] block">
                        Total Headline Price
                      </span>
                      <span className="font-serif text-2xl font-bold text-[#1E382B] block">
                        {formatCurrency(selectedQuote.totalPrice, { compact: false })}
                      </span>
                      <span className="text-[10px] text-[#706E6B] block">
                        {formatCurrency(selectedQuote.totalPrice, { compact: true })}
                      </span>
                    </div>
                  </div>

                  {/* Forensic Verdict & Market Rate comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#F5F1E8] border border-[#DFD7C2] p-3.5 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#706E6B] block">
                        Director's Verdict
                      </span>
                      <span className="font-serif text-lg font-bold text-[#3B0D11] block mt-1">
                        {selectedQuote.directorsVerdict}
                      </span>
                    </div>

                    <div className="bg-[#F5F1E8] border border-[#DFD7C2] p-3.5 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#706E6B] block">
                        Market Rate Benchmark
                      </span>
                      <span className="font-serif text-lg font-bold text-[#C5A059] block mt-1">
                        {selectedQuote.marketRateComparison || 'FAIR'} RATE
                      </span>
                    </div>

                    <div className="bg-[#F5F1E8] border border-[#DFD7C2] p-3.5 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#706E6B] block">
                        Saanjh Brand Fit
                      </span>
                      <span className="font-serif text-lg font-bold text-[#1E382B] block mt-1">
                        {selectedQuote.saanjhFitScore !== undefined
                          ? `${selectedQuote.saanjhFitScore} / 10`
                          : 'Not scored'}
                      </span>
                    </div>
                  </div>

                  {/* Financial & Itemized Cost Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-bold text-[#3B0D11] uppercase tracking-wider">
                        Itemized Cost Breakdown & Surcharges
                      </h4>
                      <span className="text-[11px] text-[#706E6B]">
                        Contract Status: <strong className="text-[#3B0D11]">{selectedQuote.status}</strong>
                      </span>
                    </div>

                    {/* Breakdown Table if available */}
                    {selectedQuote.itemizedBreakdown && selectedQuote.itemizedBreakdown.length > 0 ? (
                      <div className="bg-[#F5F1E8] rounded-xl border border-[#DFD7C2] overflow-hidden text-xs">
                        <table className="w-full">
                          <tbody className="divide-y divide-[#DFD7C2]">
                            {selectedQuote.itemizedBreakdown.map((item, idx) => (
                              <tr key={idx} className="hover:bg-[#EAE3D2]/50 transition-colors">
                                <td className="p-3 font-medium text-[#3B0D11]">{item.item}</td>
                                <td className="p-3 text-right font-serif font-bold text-[#1E382B]">
                                  {formatCurrency(item.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : selectedQuote.breakdown ? (
                      <div className="p-3.5 bg-[#F5F1E8] rounded-xl border border-[#DFD7C2] text-xs text-[#333]">
                        <span className="font-semibold block text-[#3B0D11] mb-1">Declared Scope:</span>
                        <p>{selectedQuote.breakdown}</p>
                      </div>
                    ) : null}

                    {/* Crucial Optional Fee Schedule Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="bg-[#FBF9F5] p-3 rounded-lg border border-[#DFD7C2] text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#706E6B] block">Taxes (GST)</span>
                        <span className="font-serif font-bold text-sm text-[#3B0D11] block mt-0.5">
                          {formatMoneyOrNotProvided(selectedQuote.taxes)}
                        </span>
                      </div>

                      <div className="bg-[#FBF9F5] p-3 rounded-lg border border-[#DFD7C2] text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#706E6B] block">Logistics & Transit</span>
                        <span className="font-serif font-bold text-sm text-[#3B0D11] block mt-0.5">
                          {formatMoneyOrNotProvided(selectedQuote.transportCharges)}
                        </span>
                      </div>

                      <div className="bg-[#FBF9F5] p-3 rounded-lg border border-[#DFD7C2] text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#706E6B] block">Manpower & Crew</span>
                        <span className="font-serif font-bold text-sm text-[#3B0D11] block mt-0.5">
                          {formatMoneyOrNotProvided(selectedQuote.manpowerCharges)}
                        </span>
                      </div>

                      <div className="bg-[#FBF9F5] p-3 rounded-lg border border-[#DFD7C2] text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#706E6B] block">Setup & Rigging</span>
                        <span className="font-serif font-bold text-sm text-[#3B0D11] block mt-0.5">
                          {formatMoneyOrNotProvided(selectedQuote.setupCharges)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hidden Costs & Red Flags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#B87A81]/10 border border-[#B87A81]/30 p-4 rounded-xl text-xs space-y-2">
                      <div className="flex items-center gap-2 font-serif font-bold text-[#3B0D11]">
                        <AlertTriangle className="w-4 h-4 text-[#B87A81]" />
                        <span>Hidden Costs Detected ({selectedQuote.hiddenCostsDetected.length})</span>
                      </div>
                      {selectedQuote.hiddenCostsDetected.length === 0 ? (
                        <p className="text-[#555] italic">No hidden surcharges detected in submitted terms.</p>
                      ) : (
                        <ul className="space-y-1.5 text-[#444] list-disc list-inside">
                          {selectedQuote.hiddenCostsDetected.map((hc, idx) => (
                            <li key={idx} className="leading-snug">{hc}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="bg-[#C5A059]/15 border border-[#C5A059]/40 p-4 rounded-xl text-xs space-y-2">
                      <div className="flex items-center gap-2 font-serif font-bold text-[#3B0D11]">
                        <Scale className="w-4 h-4 text-[#C5A059]" />
                        <span>What is NOT Included (Omissions)</span>
                      </div>
                      {selectedQuote.notIncluded.length === 0 ? (
                        <p className="text-[#555] italic">No exclusions declared by vendor.</p>
                      ) : (
                        <ul className="space-y-1.5 text-[#444] list-disc list-inside">
                          {selectedQuote.notIncluded.map((ni, idx) => (
                            <li key={idx} className="leading-snug">{ni}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Contract Terms & Inclusions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5F1E8] p-4 rounded-xl border border-[#DFD7C2] text-xs">
                    <div>
                      <span className="font-semibold text-[#3B0D11] block mb-1">Inclusions & Creative Scope:</span>
                      <p className="text-[#555] leading-relaxed">
                        {selectedQuote.inclusions || 'Standard procurement contract scope.'}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-[#3B0D11] block mb-1">Payment Schedule & Validity:</span>
                      <p className="text-[#555] leading-relaxed">
                        Schedule: <strong>{selectedQuote.paymentSchedule || 'Standard 3-stage tranche'}</strong>
                      </p>
                      <p className="text-[#555] mt-1">
                        Validity: <strong>{selectedQuote.validity || 'Subject to Director sign-off'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Counter-Offer Strategy & Director Script */}
                  <div className="bg-[#3B0D11] text-[#FBF9F5] p-5 rounded-xl border border-[#C5A059]/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#E6CA65]" />
                        <span className="font-serif font-bold text-sm tracking-wider text-[#E6CA65]">
                          Director's Recommended Counter-Offer & Negotiation Script
                        </span>
                      </div>
                      {selectedQuote.counterOfferSuggestion && (
                        <button
                          type="button"
                          onClick={() => handleCopyScript(selectedQuote.counterOfferSuggestion)}
                          className="text-[11px] text-[#E6CA65] hover:text-[#FFF] inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedScript ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#A3E635]" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#FBF9F5]/90 leading-relaxed italic bg-[#2D0A0E]/60 p-3.5 rounded-lg border border-[#C5A059]/20">
                      "{selectedQuote.counterOfferSuggestion || selectedQuote.directorRecommendation}"
                    </p>
                    <p className="text-[11px] text-[#FBF9F5]/70">
                      {selectedQuote.negotiationRecommendations}
                    </p>
                  </div>

                  {/* Full AI Forensic Audit Dossier (when available) */}
                  {selectedQuote.rawAnalysis && (
                    <div className="bg-[#F5F1E8] border border-[#DFD7C2] rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-serif font-bold text-[#3B0D11]">
                          <FileText className="w-4 h-4 text-[#C5A059]" />
                          <span>AI Director's Full Forensic Audit Dossier</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAuditDossier(!showAuditDossier)}
                          className="text-[11px] font-semibold text-[#3B0D11] hover:underline cursor-pointer"
                        >
                          {showAuditDossier ? 'Hide Dossier' : 'View Full Dossier'}
                        </button>
                      </div>
                      {showAuditDossier && (
                        <div className="mt-2 pt-2 border-t border-[#DFD7C2] text-[#444] whitespace-pre-line leading-relaxed font-mono text-[11px] max-h-72 overflow-y-auto bg-white/70 p-3 rounded-lg border border-[#DFD7C2]/60">
                          {selectedQuote.rawAnalysis}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#DFD7C2]">
                    <button
                      onClick={() => {
                        if (confirm(`Remove quotation from ${selectedQuote.vendorName}?`)) {
                          deleteQuote(selectedQuote.id);
                        }
                      }}
                      className="p-2 text-[#706E6B] hover:text-[#B87A81] rounded-lg transition-colors cursor-pointer"
                      title="Delete quote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleCopyScript(selectedQuote.counterOfferSuggestion || selectedQuote.directorRecommendation)}
                      className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-[#A3E635]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? 'Copied to Clipboard' : 'Copy Counter-Offer Script'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Upload Quote Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FBF9F5] border-2 border-[#C5A059] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFD7C2]">
              <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
                Audit New Vendor Quotation
              </h3>
              <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider">
                Forensic Protocol
              </span>
            </div>

            <form onSubmit={handleAuditQuote} className="space-y-3.5 text-xs">
              {/* Event selector (Event Isolation) */}
              <div>
                <label className="font-semibold block mb-1 text-[#3B0D11]">
                  Celebration Context *
                </label>
                <select
                  value={modalEventId}
                  onChange={(e) => setModalEventId(e.target.value)}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 font-serif font-bold text-[#3B0D11] text-xs cursor-pointer"
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.clientName} (Slot {evt.commissionSlot}) - {evt.city}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#706E6B] block mt-0.5">
                  AI will audit pricing specifically against {selectedTargetEvent?.clientName}'s target budget and venue.
                </span>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#3B0D11]">Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-xs"
                  placeholder="e.g. Acme Sound & Rigging Co."
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#3B0D11]">Service Category *</label>
                <input
                  type="text"
                  required
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-xs"
                  placeholder="e.g. Scenography, Production, Floral, Catering"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#3B0D11]">
                  Headline Quoted Amount (INR) *
                </label>
                <input
                  type="number"
                  required
                  value={quotedAmount}
                  onChange={(e) => setQuotedAmount(e.target.value)}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-xs font-mono"
                  placeholder="e.g. 750000"
                />
                <span className="text-[10px] text-[#706E6B] block mt-0.5">
                  Preview: {formatCurrency(parseSafeNumber(quotedAmount, 0))}
                </span>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#3B0D11]">
                  Paste Quote Text, Scope of Work & Terms *
                </label>
                <textarea
                  rows={5}
                  required
                  value={rawQuoteText}
                  onChange={(e) => setRawQuoteText(e.target.value)}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-xs font-mono"
                  placeholder="Paste line items, exclusions, GST terms, and crew accommodation requirements..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DFD7C2]">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs text-[#706E6B] hover:text-[#3B0D11] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-[#3B0D11] text-[#FBF9F5] rounded-md font-serif text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E6CA65]" />
                      <span>Auditing Quote...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#E6CA65]" />
                      <span>Run Forensic Audit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
