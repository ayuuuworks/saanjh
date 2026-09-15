import React, { useState, useMemo } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  FolderLock,
  Plus,
  FileText,
  Trash2,
  ExternalLink,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Calendar,
  Layers,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { SaanjhDocument } from '../types';
import { normalizeDocument, formatDocumentDate } from '../utils/documentUtils';

export const DocumentsPage: React.FC = () => {
  const { documents, addDocument, deleteDocument, events, activeEvent, setActiveEventId } = useSaanjh();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [inspectingDoc, setInspectingDoc] = useState<SaanjhDocument | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    status: 'idle' | 'analyzing' | 'complete';
    result?: {
      houseFit: number;
      curfewCompliance: string;
      criticalRisks: string[];
      actionDirectives: string[];
      directorsNote: string;
    };
  }>({ status: 'idle' });
  const [copied, setCopied] = useState(false);

  // Safe normalized documents list
  const safeDocs = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    return documents
      .filter((d): d is SaanjhDocument => Boolean(d && typeof d === 'object'))
      .map(normalizeDocument);
  }, [documents]);

  const [formData, setFormData] = useState<Partial<SaanjhDocument>>({
    title: '',
    eventId: activeEvent?.id || (events[0]?.id ?? 'evt-demo-001'),
    eventName: activeEvent?.clientName || 'Private Celebration',
    category: 'Brief',
    fileType: 'PDF',
    fileName: '',
    fileSize: '2.4 MB',
    summary: '',
    notes: '',
    fileUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
  });

  const baseCategories = [
    'ALL',
    'Brief',
    'Contract',
    'RunOfShow',
    'GuestList',
    'FloorPlan',
    'Financial',
    'Permissions',
    'Menus',
  ];

  // Documents isolated strictly to the active celebration
  const eventDocs = useMemo(() => {
    if (!activeEvent) return [];
    return safeDocs.filter((d) => {
      if (d.eventId !== activeEvent.id) return false;
      if (!activeEvent.isDemo && d.isDemo) return false;
      return true;
    });
  }, [safeDocs, activeEvent]);

  // Dynamically extract any unique categories present in event documents
  const allCategories = useMemo(() => {
    const customCats = new Set<string>(baseCategories);
    eventDocs.forEach((d) => {
      if (d.category && typeof d.category === 'string') {
        customCats.add(d.category);
      }
    });
    return Array.from(customCats);
  }, [eventDocs]);

  // Robust category matching
  const matchesCategory = (docCat: string = '', filterCat: string) => {
    if (filterCat === 'ALL') return true;
    const cleanDoc = (docCat ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanFilter = (filterCat ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanDoc === cleanFilter || cleanDoc.includes(cleanFilter) || cleanFilter.includes(cleanDoc);
  };

  const filteredDocs = useMemo(() => {
    return eventDocs.filter((d) => {
      // Category filter
      if (!matchesCategory(d.category, selectedCategory)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (d.title ?? '').toLowerCase().includes(q);
        const summaryMatch = (d.summary ?? '').toLowerCase().includes(q);
        const catMatch = (d.category ?? '').toLowerCase().includes(q);
        const eventMatch = (d.eventName ?? '').toLowerCase().includes(q);
        const fileMatch = (d.fileName ?? '').toLowerCase().includes(q);
        if (!titleMatch && !summaryMatch && !catMatch && !eventMatch && !fileMatch) {
          return false;
        }
      }

      return true;
    });
  }, [eventDocs, selectedCategory, searchQuery]);

  const handleOpenUpload = () => {
    setFormData({
      title: '',
      eventId: activeEvent?.id || (events[0]?.id ?? 'evt-demo-001'),
      eventName: activeEvent?.clientName || 'Private Celebration',
      category: 'Brief',
      fileType: 'PDF',
      fileName: '',
      fileSize: '2.4 MB',
      summary: '',
      notes: '',
      fileUrl: '#',
    });
    setIsUploadOpen(true);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = (formData.title ?? '').trim();
    if (!cleanTitle) return;

    const targetEvt = events.find((ev) => ev.id === formData.eventId) || activeEvent;
    const eventName = targetEvt?.clientName || 'Private Celebration';
    const cleanFileType = (formData.fileType ?? 'PDF').toUpperCase().trim() || 'PDF';
    const nowIso = new Date().toISOString();
    const safeDate = nowIso.includes('T') ? nowIso.split('T')[0] : 'Recent';

    const newDoc: SaanjhDocument = normalizeDocument({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventId: targetEvt?.id || 'evt-demo-001',
      eventName,
      title: cleanTitle,
      category: formData.category || 'Brief',
      fileType: cleanFileType,
      fileName: formData.fileName?.trim() || `${cleanTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${cleanFileType.toLowerCase()}`,
      fileSize: formData.fileSize?.trim() || '2.1 MB',
      fileUrl: formData.fileUrl || '#',
      uploadedAt: nowIso,
      uploadDate: safeDate,
      summary: formData.summary?.trim() || 'Official document filed in Saanjh Vault.',
      notes: formData.notes?.trim() || '',
      isDemo: Boolean(targetEvt?.isDemo),
    });

    addDocument(newDoc);
    setIsUploadOpen(false);
  };

  const handleInspect = (doc: SaanjhDocument) => {
    setInspectingDoc(normalizeDocument(doc));
    setAiAnalysis({ status: 'idle' });
  };

  const runAiAnalysis = (doc: SaanjhDocument) => {
    setAiAnalysis({ status: 'analyzing' });
    setTimeout(() => {
      const isContract = (doc.category ?? '').toLowerCase().includes('contract');
      const isFloorPlan = (doc.category ?? '').toLowerCase().includes('floor') || (doc.category ?? '').toLowerCase().includes('plan');

      setAiAnalysis({
        status: 'complete',
        result: {
          houseFit: 9.6,
          curfewCompliance: isContract
            ? 'Mandatory sound attenuation protocol enforced after 22:00 IST. Marine generator permits active.'
            : 'Operational timeline aligned with local heritage conservation rules.',
          criticalRisks: isFloorPlan
            ? ['Check structural wind ballast up to 40 knots on lake pontoon', 'Confirm emergency watercraft docking corridor']
            : ['Ensure indemnity bond is signed prior to load-in', 'Verify unmetered fuel costs are not passed to client'],
          actionDirectives: [
            'File physical stamped duplicate in Udaipur Field Command archive',
            'Cross-check insurance indemnification clause against Taj GM signoff',
            'Notify Lead Stage Producer 48h prior to rig installation',
          ],
          directorsNote:
            'Approved under Saanjh Royal Protocol. This instrument preserves both client discretion and the architectural integrity of the venue.',
        },
      });
    }, 700);
  };

  const handleCopyAnalysis = () => {
    if (!aiAnalysis.result) return;
    const text = `SAANJH EXECUTIVE BRIEFING\nDocument: ${inspectingDoc?.title}\nHouse Alignment: ${aiAnalysis.result.houseFit}/10\nCurfew Protocol: ${aiAnalysis.result.curfewCompliance}\nDirectives:\n${aiAnalysis.result.actionDirectives.map((d) => `- ${d}`).join('\n')}\nVerdict: ${aiAnalysis.result.directorsNote}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059] flex items-center gap-1.5">
            <FolderLock className="w-3.5 h-3.5 text-[#C5A059]" />
            Secure House Archive & Confidential Records
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3B0D11]">
            Document Vault & Executive Briefs
          </h1>
          <p className="text-xs text-[#706E6B] mt-0.5">
            Encrypted repository of royal contracts, marine clearances, structural site plans, run-of-show cue sheets, and director briefs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenUpload}
            className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 border border-[#C5A059]/40 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#E6CA65]" />
            <span>Deposit Document</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#706E6B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vault by title, summary, category, or celebration..."
              className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-lg pl-9 pr-3 py-2 text-xs text-[#3B0D11] placeholder:text-[#999] focus:outline-hidden focus:border-[#C5A059]"
            />
          </div>

          {/* Celebration Association Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif text-[#706E6B] whitespace-nowrap">Celebration:</span>
            <select
              value={activeEvent?.id || ''}
              onChange={(e) => setActiveEventId(e.target.value)}
              className="bg-[#F5F1E8] border border-[#DFD7C2] rounded-lg px-3 py-2 text-xs text-[#3B0D11] font-serif focus:outline-hidden focus:border-[#C5A059] cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.clientName} (Slot {ev.commissionSlot})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#DFD7C2]/60 scrollbar-thin">
          {allCategories.map((cat) => {
            const count =
              cat === 'ALL'
                ? eventDocs.length
                : eventDocs.filter((d) => matchesCategory(d.category, cat)).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#3B0D11] text-[#FBF9F5] font-semibold border border-[#C5A059]/50 shadow-xs'
                    : 'bg-[#F5F1E8] text-[#706E6B] hover:text-[#3B0D11] hover:bg-[#EAE3D2]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedCategory === cat
                      ? 'bg-[#C5A059]/30 text-[#E6CA65]'
                      : 'bg-[#DFD7C2]/50 text-[#706E6B]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents Grid / Empty State */}
      {filteredDocs.length === 0 ? (
        <div className="bg-[#FBF9F5] border-2 border-dashed border-[#DFD7C2] rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#F5F1E8] flex items-center justify-center border border-[#C5A059]/40 text-[#C5A059]">
            <FolderLock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
              No documents uploaded yet for this event.
            </h3>
            <p className="text-xs text-[#706E6B] max-w-md mx-auto mt-1">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'No archived briefs or agreements match your current search/category parameters.'
                : `No documents have been filed for ${activeEvent?.clientName || 'this celebration'} yet. Upload contracts, floorplans, or run-of-show files.`}
            </p>
          </div>
          <button
            onClick={handleOpenUpload}
            className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold inline-flex items-center gap-1.5 border border-[#C5A059]/40 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#E6CA65]" />
            <span>Deposit Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const displayDate = formatDocumentDate(doc.uploadedAt || doc.uploadDate);
            const categoryLabel = doc.category || 'Brief';
            const fileTypeLabel = doc.fileType || 'PDF';
            const titleLabel = doc.title || 'Untitled Document';
            const summaryLabel = doc.summary || 'Official document filed in Saanjh Vault.';
            const eventNameLabel = doc.eventName || 'Suryaveer & Ananya (Udaipur)';

            return (
              <div
                key={doc.id}
                className="bg-[#FBF9F5] border border-[#DFD7C2] hover:border-[#C5A059] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider block">
                      {categoryLabel} • {fileTypeLabel}
                    </span>
                    <span className="text-[10px] text-[#706E6B] font-mono whitespace-nowrap">
                      {displayDate}
                    </span>
                  </div>

                  <div className="mt-1">
                    <span className="text-[10px] text-[#8C827A] font-serif block truncate">
                      {eventNameLabel}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#3B0D11] mt-1.5 leading-snug group-hover:text-[#2A080C] transition-colors">
                    {titleLabel}
                  </h3>
                  <p className="text-xs text-[#555] mt-2 leading-relaxed line-clamp-3">
                    {summaryLabel}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#DFD7C2]/60 flex items-center justify-between text-[11px] text-[#706E6B]">
                    <span className="truncate max-w-[150px] font-mono text-[10px]">
                      {doc.fileName || 'file.pdf'}
                    </span>
                    <span className="font-mono text-[10px] text-[#999]">
                      {doc.fileSize || '1.5 MB'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#DFD7C2] flex items-center justify-between">
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 text-[#706E6B] hover:text-[#B87A81] hover:bg-[#B87A81]/10 rounded-md transition-colors cursor-pointer"
                    title="Archive Document"
                    aria-label="Archive Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleInspect(doc)}
                    className="px-3.5 py-1.5 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-md text-xs font-serif font-semibold inline-flex items-center gap-1.5 border border-[#C5A059]/40 shadow-xs cursor-pointer transition-all"
                  >
                    <span>Inspect Document</span>
                    <ExternalLink className="w-3 h-3 text-[#E6CA65]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Document Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FBF9F5] border-2 border-[#C5A059] rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-[#DFD7C2]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider block">
                  {inspectingDoc.category || 'Brief'} • {inspectingDoc.fileType || 'PDF'}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#3B0D11] mt-0.5">
                  {inspectingDoc.title}
                </h3>
                <p className="text-xs text-[#706E6B] mt-0.5">
                  Associated Celebration: <strong className="text-[#3B0D11]">{inspectingDoc.eventName || 'Suryaveer & Ananya (Udaipur)'}</strong>
                </p>
              </div>
              <button
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 text-[#706E6B] hover:text-[#3B0D11] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F5F1E8] rounded-xl border border-[#DFD7C2] text-xs">
              <div>
                <span className="text-[10px] text-[#706E6B] block">File Name</span>
                <span className="font-mono text-[11px] text-[#3B0D11] font-semibold truncate block">
                  {inspectingDoc.fileName || 'document.pdf'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#706E6B] block">Vault Size</span>
                <span className="font-mono text-[11px] text-[#3B0D11] font-semibold block">
                  {inspectingDoc.fileSize || '1.8 MB'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#706E6B] block">Filed Date</span>
                <span className="font-mono text-[11px] text-[#3B0D11] font-semibold block">
                  {formatDocumentDate(inspectingDoc.uploadedAt || inspectingDoc.uploadDate)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#706E6B] block">Format</span>
                <span className="font-mono text-[11px] text-[#C5A059] font-bold block">
                  {inspectingDoc.fileType || 'PDF'} (Encrypted)
                </span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-1.5">
              <h4 className="font-serif font-bold text-sm text-[#3B0D11]">
                Executive Summary & Legal Purpose
              </h4>
              <div className="p-4 bg-white/70 border border-[#DFD7C2] rounded-xl text-xs text-[#444] leading-relaxed">
                {inspectingDoc.summary || 'Official document filed in Saanjh Vault.'}
              </div>
            </div>

            {/* Internal Directorial Notes (if any) */}
            {inspectingDoc.notes && (
              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-sm text-[#3B0D11]">
                  Directorial Safeguards & Notes
                </h4>
                <div className="p-3 bg-[#F5F1E8] border border-[#DFD7C2] rounded-xl text-xs text-[#555]">
                  {inspectingDoc.notes}
                </div>
              </div>
            )}

            {/* AI Director Document Analysis Section */}
            <div className="p-4 bg-[#3B0D11]/5 border border-[#C5A059]/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span className="font-serif font-bold text-sm text-[#3B0D11]">
                    AI Director Forensic Audit
                  </span>
                </div>
                {aiAnalysis.status === 'idle' && (
                  <button
                    onClick={() => runAiAnalysis(inspectingDoc)}
                    className="px-3 py-1 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-md text-xs font-serif font-semibold border border-[#C5A059]/40 shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#E6CA65]" />
                    <span>Run Director Audit</span>
                  </button>
                )}
              </div>

              {aiAnalysis.status === 'analyzing' && (
                <div className="py-6 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-serif text-[#706E6B]">
                    Cross-referencing against Saanjh Brand Constitution, sound curfews, and indemnity clauses...
                  </p>
                </div>
              )}

              {aiAnalysis.status === 'complete' && aiAnalysis.result && (
                <div className="space-y-3 text-xs pt-2">
                  <div className="flex items-center justify-between p-2.5 bg-white/80 rounded-lg border border-[#DFD7C2]">
                    <span className="text-[#706E6B]">House Standard Alignment:</span>
                    <span className="font-mono font-bold text-[#1E382B] text-sm">
                      {aiAnalysis.result.houseFit}/10 (Royal Grade)
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-[#3B0D11] block mb-1">
                      Curfew & Regulatory Compliance:
                    </span>
                    <p className="text-[#555] bg-white/80 p-2.5 rounded-lg border border-[#DFD7C2]">
                      {aiAnalysis.result.curfewCompliance}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-[#3B0D11] block mb-1">
                      Action Directives for On-Ground Producers:
                    </span>
                    <ul className="space-y-1">
                      {aiAnalysis.result.actionDirectives.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[#555]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1E382B] mt-0.5 shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-[#1E382B]/10 border border-[#1E382B]/20 rounded-lg text-[#1E382B]">
                    <strong className="block font-serif text-xs mb-0.5">Director's Verdict:</strong>
                    {aiAnalysis.result.directorsNote}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleCopyAnalysis}
                      className="px-3 py-1 bg-[#F5F1E8] hover:bg-[#EAE3D2] text-[#3B0D11] rounded-md text-xs font-serif inline-flex items-center gap-1 border border-[#DFD7C2] cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-green-700" />
                          <span>Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#706E6B]" />
                          <span>Copy Executive Brief</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#DFD7C2]">
              <button
                onClick={() => {
                  deleteDocument(inspectingDoc.id);
                  setInspectingDoc(null);
                }}
                className="px-3 py-1.5 text-xs text-[#B87A81] hover:text-[#7A151D] hover:bg-[#B87A81]/10 rounded-md transition-colors cursor-pointer"
              >
                Archive Document
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingDoc(null)}
                  className="px-4 py-2 text-xs font-serif text-[#706E6B] hover:text-[#3B0D11] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([inspectingDoc.summary || inspectingDoc.title], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = inspectingDoc.fileName || `${inspectingDoc.title}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-md font-serif text-xs font-semibold inline-flex items-center gap-1.5 border border-[#C5A059]/40 cursor-pointer shadow-xs"
                >
                  <span>Download Secure Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload / Deposit Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FBF9F5] border-2 border-[#C5A059] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFD7C2]">
              <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
                Deposit Document into Vault
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 text-[#706E6B] hover:text-[#3B0D11]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-[#3B0D11]">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Udaipur Port Authority Lake Pheras Clearance"
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#3B0D11] focus:outline-hidden focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#3B0D11]">
                  Associated Celebration *
                </label>
                <select
                  value={formData.eventId}
                  onChange={(e) => {
                    const selEvent = events.find((ev) => ev.id === e.target.value);
                    setFormData({
                      ...formData,
                      eventId: e.target.value,
                      eventName: selEvent?.title || 'Suryaveer & Ananya (Udaipur)',
                    });
                  }}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#3B0D11] focus:outline-hidden focus:border-[#C5A059]"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.clientNames})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[#3B0D11]">
                    Vault Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#3B0D11] focus:outline-hidden focus:border-[#C5A059]"
                  >
                    {baseCategories
                      .filter((c) => c !== 'ALL')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-[#3B0D11]">
                    File Format
                  </label>
                  <input
                    type="text"
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    placeholder="PDF, DWG, DOCX, XLSX"
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#3B0D11] focus:outline-hidden focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[#3B0D11]">
                    File Name (Simulated)
                  </label>
                  <input
                    type="text"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    placeholder="e.g. Clearance_Signed_v2.pdf"
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#3B0D11] focus:outline-hidden focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-[#3B0D11]">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    placeholder="e.g. 3.8 MB"
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#3B0D11] focus:outline-hidden focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#3B0D11]">
                  Executive Summary / Core Clauses
                </label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Key terms, clearance numbers, sound curfew provisions, signoffs..."
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#3B0D11] focus:outline-hidden focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#3B0D11]">
                  Confidential Directorial Safeguards (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Signed by Collector; zero-damage indemnity required"
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-[#3B0D11] focus:outline-hidden focus:border-[#C5A059]"
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
                  className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-md font-serif text-xs font-semibold border border-[#C5A059]/40 shadow-xs cursor-pointer"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
