import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CelebrationEvent,
  Vendor,
  VendorQuote,
  BudgetItem,
  Task,
  Risk,
  SaanjhDocument,
  SaanjhSlotInfo,
  AppSettings,
  EventFunction,
  SaanjhChapter,
} from '../types';
import {
  DEMO_EVENT,
  DEMO_VENDORS,
  DEMO_TASKS,
  DEMO_QUOTE,
  DEMO_RISK,
  DEMO_BUDGET_ITEMS,
  DEMO_DOCUMENTS,
  INITIAL_SLOTS,
  DEFAULT_SETTINGS,
} from '../data/seedData';
import { normalizeDocument } from '../utils/documentUtils';
import { normalizeQuote } from '../utils/quoteUtils';
import { validateMasterBrief } from '../utils/aiContext';

function sanitizeLoadedEvent(e: any): CelebrationEvent {
  if (!e || typeof e !== 'object') {
    return DEMO_EVENT;
  }
  const isDemo = Boolean(e.isDemo || e.id === 'evt-demo-001');
  const slotNumber = Number(e.commissionSlot) || 1;
  const clientName = e.clientName || e.title || e.clientNames || 'Private Commission';
  const code = e.code || `SJH-2026-00${slotNumber}`;
  const city = e.city || 'Celebration City';
  const venue = e.venue || 'Private Commission Venue';
  const weddingDate = e.weddingDate || 'TBD';

  // Sanitize functions
  const rawFunctions: any[] = Array.isArray(e.functions) ? e.functions : [];
  const safeFunctions: EventFunction[] = rawFunctions
    .filter((fn) => {
      if (isDemo) return true;
      if (fn.eventId && fn.eventId !== e.id) return false;
      if (fn.id && /^fn-[1-5]$/.test(fn.id)) return false;
      return true;
    })
    .map((fn, idx) => ({
      id: fn.id || `fn-${e.id}-${idx + 1}`,
      eventId: e.id,
      name: fn.name || `Celebration Function ${idx + 1}`,
      dayNumber: Number(fn.dayNumber) || 1,
      date: fn.date || weddingDate,
      startTime: fn.startTime || '18:00',
      endTime: fn.endTime || '22:00',
      venue: fn.venue || venue,
      guestCount: Number(fn.guestCount) || Number(e.guestCount) || 200,
      theme: fn.theme || 'Royal Scenography',
      dressCode: fn.dressCode || 'Formal Royal Attire',
      decor: fn.decor || 'Handcrafted floral decor & ambient lighting',
      food: fn.food || 'Curated royal degustation',
      entertainment: fn.entertainment || 'Curated acoustic ensemble',
      photography: fn.photography || '35mm editorial film documentation',
      lighting: fn.lighting || '2400K candlelight warmth',
      staffing: fn.staffing || 'Uniformed Saanjh marshals',
      transport: fn.transport || 'Dedicated chauffeur convoy',
      specialMoments: fn.specialMoments || 'Ceremonial arrival and celebration',
      isDemo,
    }));

  // Validate and sanitize masterBrief
  let masterBrief = e.masterBrief;
  if (!isDemo && masterBrief) {
    const val = validateMasterBrief(masterBrief, {
      id: e.id,
      clientName,
      commissionSlot: slotNumber,
      code,
      weddingDate,
      city,
      destination: e.destination || `${venue}, ${city}`,
      venue,
      guestCount: Number(e.guestCount) || 200,
      estimatedBudget: Number(e.estimatedBudget) || 35000000,
      functionsList: e.functionsList,
      isDemo: false,
    });
    if (!val.isValid) {
      masterBrief = val.correctedBrief;
    }
  }

  return {
    ...e,
    id: e.id || `evt-${Date.now()}`,
    commissionSlot: slotNumber,
    code,
    clientName,
    title: clientName,
    city,
    destination: e.destination || `${venue}, ${city}`,
    venue,
    weddingDate,
    guestCount: Number(e.guestCount) || 200,
    estimatedBudget: Number(e.estimatedBudget) || 35000000,
    masterBrief,
    functions: safeFunctions,
    isDemo,
  };
}

function sanitizeLoadedQuote(raw: any, eventsList: CelebrationEvent[]): VendorQuote {
  const norm = normalizeQuote(raw);

  // Demo quote check: demo id or marked demo or demo event id
  if (norm.isDemo || norm.id === 'qte-001' || norm.eventId === 'evt-demo-001') {
    return {
      ...norm,
      isDemo: true,
      eventId: 'evt-demo-001',
      eventName: 'Suryaveer & Ananya (Udaipur)',
      verificationStatus: norm.verificationStatus || 'VERIFIED_DATA',
      requiresAssociation: false,
    };
  }

  // If unassigned or missing eventId
  if (!norm.eventId || norm.eventId === 'unassigned' || norm.eventName?.includes('UNASSIGNED')) {
    return {
      ...norm,
      eventId: '',
      eventName: 'UNASSIGNED / REQUIRES EVENT ASSOCIATION',
      status: 'PENDING_AUDIT',
      isDemo: false,
      requiresAssociation: true,
      verificationStatus: norm.verificationStatus || 'REQUIRES_VERIFICATION',
    };
  }

  const matchedEvent = eventsList.find((e) => e.id === norm.eventId);
  if (!matchedEvent) {
    return {
      ...norm,
      eventId: '',
      eventName: 'UNASSIGNED / REQUIRES EVENT ASSOCIATION',
      status: 'PENDING_AUDIT',
      isDemo: false,
      requiresAssociation: true,
      verificationStatus: norm.verificationStatus || 'REQUIRES_VERIFICATION',
    };
  }

  // Cross-Event Contamination Check:
  // If target event is NOT Udaipur, but the quote references Udaipur regional vendors or venues
  const isTargetUdaipur =
    matchedEvent.isDemo ||
    (matchedEvent.city && /udaipur/i.test(matchedEvent.city)) ||
    (matchedEvent.venue && /udaipur|lake palace|jagmandir|pichola/i.test(matchedEvent.venue));

  const mentionsUdaipur =
    (norm.vendorName && /udaipur/i.test(norm.vendorName)) ||
    (norm.rawText && /udaipur|lake palace|jagmandir|pichola/i.test(norm.rawText)) ||
    (norm.rawAnalysis && /udaipur|lake palace|jagmandir|pichola/i.test(norm.rawAnalysis));

  if (!isTargetUdaipur && mentionsUdaipur) {
    // Cannot be reliably associated with this event!
    // Per user instruction: "If the existing quote cannot be reliably associated with this event, do not silently attach it. Mark it: UNASSIGNED / REQUIRES EVENT ASSOCIATION rather than assigning it incorrectly."
    return {
      ...norm,
      eventId: '',
      eventName: 'UNASSIGNED / REQUIRES EVENT ASSOCIATION',
      status: 'PENDING_AUDIT',
      directorRecommendation: `UNASSIGNED / REQUIRES EVENT ASSOCIATION: This quotation references Udaipur regional venues and logistics and cannot be reliably assigned to ${matchedEvent.clientName}.`,
      isDemo: false,
      requiresAssociation: true,
      verificationStatus: 'REQUIRES_VERIFICATION',
    };
  }

  return {
    ...norm,
    eventName: matchedEvent.clientName,
    isDemo: false,
    requiresAssociation: false,
    verificationStatus: norm.verificationStatus || 'USER_PROVIDED',
  };
}

function sanitizeLoadedBudgetItem(raw: any, eventsList: CelebrationEvent[]): BudgetItem {
  const isDemo = Boolean(raw.isDemo || raw.eventId === 'evt-demo-001' || /^bgt-00[1-6]$/.test(raw.id));
  if (isDemo) {
    return {
      ...raw,
      isDemo: true,
      eventId: 'evt-demo-001',
    };
  }
  const matchedEvent = eventsList.find((e) => e.id === raw.eventId);
  return {
    ...raw,
    eventId: matchedEvent ? matchedEvent.id : '',
    isDemo: false,
  };
}

function sanitizeLoadedTask(raw: any, eventsList: CelebrationEvent[]): Task {
  const isDemo = Boolean(raw.isDemo || raw.eventId === 'evt-demo-001' || /^tsk-00[1-5]$/.test(raw.id));
  if (isDemo) {
    return {
      ...raw,
      isDemo: true,
      eventId: 'evt-demo-001',
      eventName: 'Suryaveer & Ananya (Udaipur)',
    };
  }
  const matchedEvent = eventsList.find((e) => e.id === raw.eventId);
  return {
    ...raw,
    eventId: matchedEvent ? matchedEvent.id : '',
    eventName: matchedEvent ? matchedEvent.clientName : 'UNASSIGNED / REQUIRES EVENT ASSOCIATION',
    isDemo: false,
  };
}

function sanitizeLoadedRisk(raw: any, eventsList: CelebrationEvent[]): Risk {
  const isDemo = Boolean(raw.isDemo || raw.eventId === 'evt-demo-001' || raw.id === 'rsk-001');
  if (isDemo) {
    return {
      ...raw,
      isDemo: true,
      eventId: 'evt-demo-001',
      eventName: 'Suryaveer & Ananya (Udaipur)',
    };
  }
  const matchedEvent = eventsList.find((e) => e.id === raw.eventId);
  return {
    ...raw,
    eventId: matchedEvent ? matchedEvent.id : '',
    eventName: matchedEvent ? matchedEvent.clientName : 'UNASSIGNED / REQUIRES EVENT ASSOCIATION',
    isDemo: false,
  };
}

function sanitizeLoadedDocument(raw: any, eventsList: CelebrationEvent[]): SaanjhDocument {
  const norm = normalizeDocument(raw);
  const isDemo = Boolean(norm.isDemo || norm.eventId === 'evt-demo-001' || /^doc-00[1-3]$/.test(norm.id));
  if (isDemo) {
    return {
      ...norm,
      isDemo: true,
      eventId: 'evt-demo-001',
      eventName: 'Suryaveer & Ananya (Udaipur)',
    };
  }
  const matchedEvent = eventsList.find((e) => e.id === norm.eventId);
  return {
    ...norm,
    eventId: matchedEvent ? matchedEvent.id : '',
    eventName: matchedEvent ? matchedEvent.clientName : 'UNASSIGNED / REQUIRES EVENT ASSOCIATION',
    isDemo: false,
  };
}

interface CostGuardModalState {
  isOpen: boolean;
  featureName: string;
  reason?: string;
  alternative?: string;
}

interface SaanjhContextType {
  events: CelebrationEvent[];
  activeEventId: string | null;
  activeEvent: CelebrationEvent | undefined;
  setActiveEventId: (id: string | null) => void;
  addEvent: (event: CelebrationEvent) => void;
  updateEvent: (id: string, updates: Partial<CelebrationEvent>) => void;
  deleteEvent: (id: string) => void;

  addFunction: (eventId: string, fn: EventFunction) => void;
  updateFunction: (eventId: string, fnId: string, updates: Partial<EventFunction>) => void;
  deleteFunction: (eventId: string, fnId: string) => void;

  updateChapter: (eventId: string, chapterId: string, updates: Partial<SaanjhChapter>) => void;

  vendors: Vendor[];
  addVendor: (vendor: Vendor) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  quotes: VendorQuote[];
  addQuote: (quote: VendorQuote) => void;
  updateQuote: (id: string, updates: Partial<VendorQuote>) => void;
  deleteQuote: (id: string) => void;
  reassignQuote: (id: string, targetEventId: string) => void;

  budgetItems: BudgetItem[];
  addBudgetItem: (item: BudgetItem) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  risks: Risk[];
  addRisk: (risk: Risk) => void;
  updateRisk: (id: string, updates: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;

  documents: SaanjhDocument[];
  addDocument: (doc: SaanjhDocument) => void;
  deleteDocument: (id: string) => void;

  slots: SaanjhSlotInfo[];
  updateSlot: (slotNumber: number, updates: Partial<SaanjhSlotInfo>) => void;

  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  clearDemoData: () => void;
  reloadDemoData: () => void;

  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; error?: string };

  costGuard: CostGuardModalState;
  triggerCostGuard: (featureName: string, reason?: string, alternative?: string) => void;
  closeCostGuard: () => void;

  isFirstRunOpen: boolean;
  setIsFirstRunOpen: (open: boolean) => void;
}

const SaanjhContext = createContext<SaanjhContextType | undefined>(undefined);

const STORAGE_PREFIX = 'saanjh_os_';

export const SaanjhProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const initialEvents: CelebrationEvent[] = (() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}events`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeLoadedEvent);
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved events:', err);
    }
    return [DEMO_EVENT];
  })();

  const [events, setEvents] = useState<CelebrationEvent[]>(initialEvents);

  const [activeEventId, setActiveEventId] = useState<string | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}active_event_id`);
    return saved || 'evt-demo-001';
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}vendors`);
    return saved ? JSON.parse(saved) : DEMO_VENDORS;
  });

  const [quotes, setQuotes] = useState<VendorQuote[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}quotes`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((q) => sanitizeLoadedQuote(q, initialEvents));
        }
      } catch (err) {
        console.warn('Failed to parse saved quotes from localStorage:', err);
      }
    }
    return [sanitizeLoadedQuote(DEMO_QUOTE, initialEvents)];
  });

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}budget_items`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((b) => sanitizeLoadedBudgetItem(b, initialEvents));
        }
      } catch (err) {
        console.warn('Failed to parse saved budget items:', err);
      }
    }
    return DEMO_BUDGET_ITEMS.map((b) => sanitizeLoadedBudgetItem(b, initialEvents));
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}tasks`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((t) => sanitizeLoadedTask(t, initialEvents));
        }
      } catch (err) {
        console.warn('Failed to parse saved tasks:', err);
      }
    }
    return DEMO_TASKS.map((t) => sanitizeLoadedTask(t, initialEvents));
  });

  const [risks, setRisks] = useState<Risk[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}risks`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((r) => sanitizeLoadedRisk(r, initialEvents));
        }
      } catch (err) {
        console.warn('Failed to parse saved risks:', err);
      }
    }
    return [sanitizeLoadedRisk(DEMO_RISK, initialEvents)];
  });

  const [documents, setDocuments] = useState<SaanjhDocument[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}documents`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((d) => sanitizeLoadedDocument(d, initialEvents));
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved documents:', e);
    }
    return DEMO_DOCUMENTS.map((d) => sanitizeLoadedDocument(d, initialEvents));
  });

  const [slots, setSlots] = useState<SaanjhSlotInfo[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}slots`);
    return saved ? JSON.parse(saved) : INITIAL_SLOTS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}settings`);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [isFirstRunOpen, setIsFirstRunOpen] = useState<boolean>(() => {
    const checked = localStorage.getItem(`${STORAGE_PREFIX}first_run_dismissed`);
    return checked !== 'true';
  });

  const [costGuard, setCostGuard] = useState<CostGuardModalState>({
    isOpen: false,
    featureName: '',
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}events`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (activeEventId) {
      localStorage.setItem(`${STORAGE_PREFIX}active_event_id`, activeEventId);
    }
  }, [activeEventId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}vendors`, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}quotes`, JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}budget_items`, JSON.stringify(budgetItems));
  }, [budgetItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}risks`, JSON.stringify(risks));
  }, [risks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}documents`, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}slots`, JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(settings));
  }, [settings]);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  // Event actions
  const addEvent = (event: CelebrationEvent) => {
    setEvents((prev) => [event, ...prev]);
    setActiveEventId(event.id);
    // Update slot
    if (event.commissionSlot >= 1 && event.commissionSlot <= 6) {
      updateSlot(event.commissionSlot, {
        status: 'COMMISSIONED',
        eventId: event.id,
        clientName: event.clientName,
        weddingDate: event.weddingDate,
        destination: event.destination,
        estimatedBudget: event.estimatedBudget,
      });
    }
  };

  const updateEvent = (id: string, updates: Partial<CelebrationEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  };

  const deleteEvent = (id: string) => {
    const evt = events.find((e) => e.id === id);
    if (evt && evt.commissionSlot >= 1 && evt.commissionSlot <= 6) {
      updateSlot(evt.commissionSlot, {
        status: 'AVAILABLE',
        eventId: undefined,
        clientName: undefined,
        weddingDate: undefined,
        destination: undefined,
        estimatedBudget: undefined,
      });
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (activeEventId === id) {
      const remaining = events.filter((e) => e.id !== id);
      setActiveEventId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const addFunction = (eventId: string, fn: EventFunction) => {
    const safeFn: EventFunction = {
      ...fn,
      eventId,
      isDemo: fn.isDemo ?? false,
    };
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, functions: [...(e.functions || []), safeFn] } : e))
    );
  };

  const updateFunction = (eventId: string, fnId: string, updates: Partial<EventFunction>) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              functions: (e.functions || []).map((f) =>
                f.id === fnId ? { ...f, ...updates, eventId } : f
              ),
            }
          : e
      )
    );
  };

  const deleteFunction = (eventId: string, fnId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              functions: e.functions.filter((f) => f.id !== fnId),
            }
          : e
      )
    );
  };

  const updateChapter = (eventId: string, chapterId: string, updates: Partial<SaanjhChapter>) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              chapters: e.chapters.map((c) => (c.id === chapterId ? { ...c, ...updates } : c)),
            }
          : e
      )
    );
  };

  // Vendor actions
  const addVendor = (vendor: Vendor) => setVendors((prev) => [vendor, ...prev]);
  const updateVendor = (id: string, updates: Partial<Vendor>) =>
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  const deleteVendor = (id: string) => setVendors((prev) => prev.filter((v) => v.id !== id));

  // Quote actions
  const addQuote = (quote: VendorQuote) =>
    setQuotes((prev) => [sanitizeLoadedQuote(quote, events), ...prev]);
  const updateQuote = (id: string, updates: Partial<VendorQuote>) =>
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? sanitizeLoadedQuote({ ...q, ...updates }, events) : q))
    );
  const deleteQuote = (id: string) => setQuotes((prev) => prev.filter((q) => q.id !== id));
  const reassignQuote = (id: string, targetEventId: string) => {
    const targetEvent = events.find((e) => e.id === targetEventId);
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        return {
          ...q,
          eventId: targetEventId,
          eventName: targetEvent ? targetEvent.clientName : q.eventName,
          isDemo: Boolean(targetEvent?.isDemo),
          requiresAssociation: false,
          verificationStatus: 'USER_PROVIDED',
        };
      })
    );
  };

  // Budget actions
  const addBudgetItem = (item: BudgetItem) => setBudgetItems((prev) => [item, ...prev]);
  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) =>
    setBudgetItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  const deleteBudgetItem = (id: string) => setBudgetItems((prev) => prev.filter((b) => b.id !== id));

  // Task actions
  const addTask = (task: Task) => setTasks((prev) => [task, ...prev]);
  const updateTask = (id: string, updates: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  // Risk actions
  const addRisk = (risk: Risk) => setRisks((prev) => [risk, ...prev]);
  const updateRisk = (id: string, updates: Partial<Risk>) =>
    setRisks((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  const deleteRisk = (id: string) => setRisks((prev) => prev.filter((r) => r.id !== id));

  // Document actions
  const addDocument = (doc: SaanjhDocument) => setDocuments((prev) => [normalizeDocument(doc), ...prev]);
  const deleteDocument = (id: string) => setDocuments((prev) => prev.filter((d) => d.id !== id));

  // Slot actions
  const updateSlot = (slotNumber: number, updates: Partial<SaanjhSlotInfo>) => {
    setSlots((prev) =>
      prev.map((s) => (s.slotNumber === slotNumber ? { ...s, ...updates } : s))
    );
  };

  // Settings
  const updateSettings = (updates: Partial<AppSettings>) =>
    setSettings((prev) => ({ ...prev, ...updates }));

  // Clear demo data
  const clearDemoData = () => {
    setEvents((prev) => prev.filter((e) => !e.isDemo));
    setVendors((prev) => prev.filter((v) => !v.isDemo));
    setQuotes((prev) => prev.filter((q) => !q.isDemo));
    setBudgetItems((prev) => prev.filter((b) => !b.isDemo));
    setTasks((prev) => prev.filter((t) => !t.isDemo));
    setRisks((prev) => prev.filter((r) => !r.isDemo));
    setDocuments((prev) => prev.filter((d) => !d.isDemo));
    setSlots([
      { slotNumber: 1, status: 'AVAILABLE' },
      { slotNumber: 2, status: 'AVAILABLE' },
      { slotNumber: 3, status: 'AVAILABLE' },
      { slotNumber: 4, status: 'AVAILABLE' },
      { slotNumber: 5, status: 'AVAILABLE' },
      { slotNumber: 6, status: 'AVAILABLE' },
    ]);
  };

  // Reload demo data
  const reloadDemoData = () => {
    setEvents([DEMO_EVENT]);
    setActiveEventId(DEMO_EVENT.id);
    setVendors(DEMO_VENDORS);
    setQuotes([normalizeQuote(DEMO_QUOTE)]);
    setBudgetItems(DEMO_BUDGET_ITEMS);
    setTasks(DEMO_TASKS);
    setRisks([DEMO_RISK]);
    setDocuments(DEMO_DOCUMENTS.map(normalizeDocument));
    setSlots(INITIAL_SLOTS);
  };

  // Export JSON
  const exportDataJSON = (): string => {
    const backupData = {
      version: '1.0.0',
      brand: 'SAANJH WEDDINGS',
      exportedAt: new Date().toISOString(),
      events,
      vendors,
      quotes,
      budgetItems,
      tasks,
      risks,
      documents,
      slots,
      settings,
    };
    updateSettings({ lastBackupDate: new Date().toISOString() });
    return JSON.stringify(backupData, null, 2);
  };

  // Import JSON
  const importDataJSON = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.events || !Array.isArray(parsed.events)) {
        return { success: false, error: 'Invalid Saanjh backup format: Missing events array' };
      }
      const sanitizedEvents = parsed.events.map(sanitizeLoadedEvent);
      setEvents(sanitizedEvents);
      if (parsed.vendors) setVendors(parsed.vendors);
      if (parsed.quotes && Array.isArray(parsed.quotes)) {
        setQuotes(parsed.quotes.map(normalizeQuote));
      }
      if (parsed.budgetItems) setBudgetItems(parsed.budgetItems);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.risks) setRisks(parsed.risks);
      if (parsed.documents && Array.isArray(parsed.documents)) {
        setDocuments(parsed.documents.map(normalizeDocument));
      }
      if (parsed.slots) setSlots(parsed.slots);
      if (parsed.settings) setSettings(parsed.settings);
      if (sanitizedEvents.length > 0) setActiveEventId(sanitizedEvents[0].id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to parse JSON backup file' };
    }
  };

  // Cost guard
  const triggerCostGuard = (featureName: string, reason?: string, alternative?: string) => {
    setCostGuard({
      isOpen: true,
      featureName,
      reason,
      alternative,
    });
  };

  const closeCostGuard = () => {
    setCostGuard((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <SaanjhContext.Provider
      value={{
        events,
        activeEventId,
        activeEvent,
        setActiveEventId,
        addEvent,
        updateEvent,
        deleteEvent,
        addFunction,
        updateFunction,
        deleteFunction,
        updateChapter,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        quotes,
        addQuote,
        updateQuote,
        deleteQuote,
        reassignQuote,
        budgetItems,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        risks,
        addRisk,
        updateRisk,
        deleteRisk,
        documents,
        addDocument,
        deleteDocument,
        slots,
        updateSlot,
        settings,
        updateSettings,
        clearDemoData,
        reloadDemoData,
        exportDataJSON,
        importDataJSON,
        costGuard,
        triggerCostGuard,
        closeCostGuard,
        isFirstRunOpen,
        setIsFirstRunOpen,
      }}
    >
      {children}
    </SaanjhContext.Provider>
  );
};

export const useSaanjh = () => {
  const context = useContext(SaanjhContext);
  if (!context) {
    throw new Error('useSaanjh must be used within a SaanjhProvider');
  }
  return context;
};
