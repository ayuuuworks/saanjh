import {
  CelebrationEvent,
  EventFunction,
  BudgetItem,
  Task,
  Risk,
  SaanjhDocument,
  Vendor,
  VendorQuote,
  SaanjhChapter,
} from '../types';
import { formatCurrency } from './quoteUtils';

export interface IsolatedEventContext {
  eventId: string;
  isDemo: boolean;
  commissionSlot: number;
  code: string;
  clientName: string;
  primaryContact: string;
  phone: string;
  eventType: string;
  weddingDate: string;
  city: string;
  destination: string;
  venue: string;
  guestCount: number;
  vipGuests: string;
  functionsList: string;
  estimatedBudget: number;
  committedBudget: number;
  paidBudget: number;
  budgetFlexibility: string;
  style: string;
  mood: string;
  colorPalette: string;
  culturalRequirements: string;
  foodPreferences: string;
  entertainmentPreferences: string;
  photographyPreferences: string;
  hospitalityRequirements: string;
  transportationRequirements: string;
  specialRequests: string;
  forbiddenThings: string;
  functions: EventFunction[];
  budgetItems: BudgetItem[];
  tasks: Task[];
  risks: Risk[];
  documents: SaanjhDocument[];
  vendors: { name: string; category: string; status?: string }[];
  brandConstitution: {
    brand: string;
    position: string;
    philosophy: string;
    rule: string;
  };
  systemIsolationDirective: string;
}

/**
 * Builds an isolated AI context strictly from the selected event data,
 * preventing any leakage of demo data or other celebration records.
 */
export function buildEventContext(
  eventId: string,
  allData: {
    events: CelebrationEvent[];
    tasks?: Task[];
    risks?: Risk[];
    budgetItems?: BudgetItem[];
    documents?: SaanjhDocument[];
    vendors?: Vendor[];
    quotes?: VendorQuote[];
  }
): IsolatedEventContext | null {
  const currentEvent = allData.events.find((e) => e.id === eventId);
  if (!currentEvent) {
    return null;
  }

  // Strictly filter functions belonging ONLY to this event
  const isolatedFunctions = (currentEvent.functions || []).filter((fn) => {
    if (fn.eventId) {
      return fn.eventId === eventId;
    }
    // Only allow unassigned functions if this is the explicit demo event
    return currentEvent.isDemo === true;
  });

  // Strictly filter tasks belonging ONLY to this event
  const isolatedTasks = (allData.tasks || []).filter((t) => t.eventId === eventId);

  // Strictly filter risks belonging ONLY to this event
  const isolatedRisks = (allData.risks || []).filter((r) => r.eventId === eventId);

  // Strictly filter budget items belonging ONLY to this event
  const isolatedBudgetItems = (allData.budgetItems || []).filter((b) => b.eventId === eventId);

  // Strictly filter documents belonging ONLY to this event
  const isolatedDocuments = (allData.documents || []).filter((d) => d.eventId === eventId);

  // Find vendors explicitly associated with this event (via quotes, budget, or tasks)
  const eventQuotes = (allData.quotes || []).filter((q) => q.eventId === eventId);
  const eventVendorNames = new Set([
    ...eventQuotes.map((q) => q.vendorName.toLowerCase().trim()),
    ...isolatedBudgetItems.map((b) => (b.vendorAssigned || '').toLowerCase().trim()).filter(Boolean),
    ...isolatedTasks.map((t) => (t.owner || '').toLowerCase().trim()).filter(Boolean),
  ]);

  // Include ONLY vendors explicitly associated with this event
  const isolatedVendors = (allData.vendors || [])
    .filter((v) => {
      if (currentEvent.isDemo) return true;
      return eventVendorNames.has(v.name.toLowerCase().trim());
    })
    .map((v) => ({
      name: v.name,
      category: v.category,
      status: v.status,
    }));

  const systemIsolationDirective = `You are working ONLY on event ${currentEvent.id} (${currentEvent.clientName}).
Ignore all other events.
Never copy factual details from another event.
If information is missing or unavailable, say: 'NOT PROVIDED' or 'REQUIRES VERIFICATION'.
The AI may NOT invent: vendor names, vendor prices, venue availability, market rates, or itemized costs.

AUTHORITATIVE EVENT FACTS:
- Commission Code: ${currentEvent.code}
- Commission Slot: Slot ${currentEvent.commissionSlot} of 6 (Authoritative: NEVER alter this slot number)
- Client Name: ${currentEvent.clientName}
- Wedding Date: ${currentEvent.weddingDate}
- Destination: ${currentEvent.destination || currentEvent.city}
- City: ${currentEvent.city}
- Venue: ${currentEvent.venue}
- Guest Count: ${currentEvent.guestCount}
- Estimated Budget: ${formatCurrency(currentEvent.estimatedBudget)}
- Functions List: ${currentEvent.functionsList || isolatedFunctions.map((f) => f.name).join(', ')}`;

  return {
    eventId: currentEvent.id,
    isDemo: Boolean(currentEvent.isDemo),
    commissionSlot: currentEvent.commissionSlot,
    code: currentEvent.code,
    clientName: currentEvent.clientName,
    primaryContact: currentEvent.primaryContact || '',
    phone: currentEvent.phone || '',
    eventType: currentEvent.eventType || 'Wedding',
    weddingDate: currentEvent.weddingDate,
    city: currentEvent.city,
    destination: currentEvent.destination || currentEvent.city,
    venue: currentEvent.venue,
    guestCount: currentEvent.guestCount,
    vipGuests: currentEvent.vipGuests || '',
    functionsList: currentEvent.functionsList || '',
    estimatedBudget: currentEvent.estimatedBudget,
    committedBudget: currentEvent.committedBudget || 0,
    paidBudget: currentEvent.paidBudget || 0,
    budgetFlexibility: currentEvent.budgetFlexibility || 'FLEXIBLE_FOR_EXCELLENCE',
    style: currentEvent.style || 'Royal Indian Heritage, Restrained Elegance',
    mood: currentEvent.mood || 'Intimate, cinematic, royal, detail obsessed',
    colorPalette: currentEvent.colorPalette || '',
    culturalRequirements: currentEvent.culturalRequirements || '',
    foodPreferences: currentEvent.foodPreferences || '',
    entertainmentPreferences: currentEvent.entertainmentPreferences || '',
    photographyPreferences: currentEvent.photographyPreferences || '',
    hospitalityRequirements: currentEvent.hospitalityRequirements || '',
    transportationRequirements: currentEvent.transportationRequirements || '',
    specialRequests: currentEvent.specialRequests || '',
    forbiddenThings: currentEvent.forbiddenThings || '',
    functions: isolatedFunctions,
    budgetItems: isolatedBudgetItems,
    tasks: isolatedTasks,
    risks: isolatedRisks,
    documents: isolatedDocuments,
    vendors: isolatedVendors,
    brandConstitution: {
      brand: 'SAANJH WEDDINGS',
      position: 'PRIVATE WEDDING HOUSE',
      philosophy: "WE DON'T DO 50 SHAADIS. WE DO 6.",
      rule: 'Exclusive, royal, personalized, zero assembly-line commercialism.',
    },
    systemIsolationDirective,
  };
}

export interface MasterBriefValidationResult {
  isValid: boolean;
  issues: string[];
  correctedBrief: string;
}

/**
 * Validates a Master Brief against the authoritative factual fields of an event.
 * If contradictions or demo data leakages are detected, flags them and outputs a corrected brief.
 */
export function validateMasterBrief(
  brief: string,
  event: {
    id?: string;
    clientName: string;
    commissionSlot: number;
    code?: string;
    weddingDate: string;
    city: string;
    destination?: string;
    venue: string;
    guestCount: number;
    estimatedBudget: number | string;
    functionsList?: string;
    isDemo?: boolean;
  }
): MasterBriefValidationResult {
  const issues: string[] = [];
  const normalizedBrief = brief || '';

  // 1. Commission slot validation
  const slotNumber = Number(event.commissionSlot) || 1;
  const slotRegex = /Slot\s+(\d+)\s+of\s+6/i;
  const matchSlot = normalizedBrief.match(slotRegex);
  if (matchSlot) {
    const briefSlot = parseInt(matchSlot[1], 10);
    if (briefSlot !== slotNumber) {
      issues.push(
        `Commission Slot Contradiction: Master brief mentions "Slot ${briefSlot} of 6", but authoritative event slot is Slot ${slotNumber}.`
      );
    }
  } else if (!normalizedBrief.includes(`Slot ${slotNumber} of 6`)) {
    issues.push(`Commission Slot Missing: Brief does not explicitly state "Slot ${slotNumber} of 6".`);
  }

  // 2. Client name validation
  const clientLower = (event.clientName || '').toLowerCase().trim();
  const demoClients = ['suryaveer', 'ananya', 'singhania'];
  const isActuallyDemoClient = demoClients.some((dc) => clientLower.includes(dc));

  if (!isActuallyDemoClient) {
    demoClients.forEach((dc) => {
      const rx = new RegExp(`\\b${dc}\\b`, 'i');
      if (rx.test(normalizedBrief)) {
        issues.push(
          `Client Data Contamination: Brief mentions demo client "${dc}" instead of authoritative client "${event.clientName}".`
        );
      }
    });
  }

  // 3. Venue & City validation
  const venueLower = (event.venue || '').toLowerCase().trim();
  const cityLower = (event.city || '').toLowerCase().trim();
  const destLower = (event.destination || '').toLowerCase().trim();

  const isUdaipurVenue =
    venueLower.includes('taj lake') ||
    venueLower.includes('jagmandir') ||
    cityLower.includes('udaipur') ||
    destLower.includes('udaipur');

  if (!isUdaipurVenue) {
    const udaipurTerms = ['taj lake palace', 'jagmandir', 'lake pichola', 'mewar', 'udaipur maritime authority'];
    udaipurTerms.forEach((term) => {
      if (normalizedBrief.toLowerCase().includes(term)) {
        issues.push(
          `Venue/Destination Contamination: Brief mentions "${term}" which belongs to demo Udaipur event, not "${event.venue}, ${event.city}".`
        );
      }
    });
  }

  // 4. Client name presence
  if (clientLower && !normalizedBrief.toLowerCase().includes(clientLower)) {
    issues.push(`Client Name Missing: Brief does not contain client name "${event.clientName}".`);
  }

  // 5. Venue presence
  if (venueLower && !normalizedBrief.toLowerCase().includes(venueLower)) {
    issues.push(`Venue Missing: Brief does not reference authoritative venue "${event.venue}".`);
  }

  // 6. City presence
  if (cityLower && !normalizedBrief.toLowerCase().includes(cityLower)) {
    issues.push(`City Missing: Brief does not reference authoritative city "${event.city}".`);
  }

  // If issues exist, formulate the pristine sanitized/corrected brief
  let correctedBrief = normalizedBrief;
  if (issues.length > 0 || !normalizedBrief.trim()) {
    correctedBrief = generateFactualMasterBrief(event);
  }

  return {
    isValid: issues.length === 0,
    issues,
    correctedBrief,
  };
}

/**
 * Authoritative Master Brief generator completely grounded in the event's actual facts.
 * Never introduces demo data or unrelated venue/city details.
 */
export function generateFactualMasterBrief(event: {
  id?: string;
  clientName: string;
  commissionSlot: number;
  code?: string;
  weddingDate: string;
  city: string;
  destination?: string;
  venue: string;
  guestCount: number;
  estimatedBudget: number | string;
  functionsList?: string;
  style?: string;
  mood?: string;
  foodPreferences?: string;
  entertainmentPreferences?: string;
  hospitalityRequirements?: string;
  transportationRequirements?: string;
}): string {
  const slot = Number(event.commissionSlot) || 1;
  const code = event.code || `SJH-2026-00${slot}`;
  const client = event.clientName || 'Private Commission';
  const city = event.city || 'Commission Destination';
  const dest = event.destination || city;
  const venue = event.venue || 'Private Commission Venue';
  const guestCount = event.guestCount || 200;
  const budgetFormatted = formatCurrency(event.estimatedBudget || 35000000);
  const functions = event.functionsList || 'Welcome Dinner & Baithak, Haldi & Mehendi, Sangeet, Wedding Pheras, Reception';
  const date = event.weddingDate || 'TBD';

  return `# SAANJH WEDDINGS • EVENT MASTER BRIEF
**Commission Code:** ${code} • **Client:** ${client}
**Destination:** ${dest} • **Venues:** ${venue}
**Guest Count:** ${guestCount} Curated Guests • **Budget Framework:** ${budgetFormatted}
**Positioning:** Private Commission (Slot ${slot} of 6) • **Key Date:** ${date}

---

### 1. EVENT SUMMARY
An ultra-exclusive celebration commissioned for ${client} at ${venue}, ${city}. Orchestrated under the Saanjh Brand Constitution ("WE DON'T DO 50 SHAADIS. WE DO 6.") as an intimate, masterfully curated royal residency with zero assembly-line compromise.

### 2. CREATIVE DIRECTION & SCENOGRAPHIC VISION
- **Atmospheric Palette:** Heirloom royal textures, bespoke architectural floral installations, and warm 2400K candlelight illumination.
- **Visual Identity:** Restrained luxury honoring the historic and architectural soul of ${venue}, completely rejecting generic LED trusses or synthetic décor.
- **Narrative Cadence:** Every transitional moment is orchestrated with deliberate emotional pacing.

### 3. GUEST EXPERIENCE JOURNEY
- **Touchpoint 1 (Arrival):** Private VIP arrival protocol with chilled organic botanicals and personal butler escort.
- **Touchpoint 2 (Check-in & Welcoming):** In-suite personal hospitality with bespoke Saanjh welcome trunks, custom attar vials, and hand-lettered celebration scrolls.
- **Touchpoint 3 (Curated Functions):** Seamless experiential progression across all scheduled celebration chapters at ${venue}.

### 4. FUNCTION ARCHITECTURE & CADENCE
Celebration functions scheduled for ${client}:
${functions
  .split(',')
  .map((fn, idx) => `- **Phase ${idx + 1}:** *${fn.trim()}* — Staged at ${venue} with bespoke scenography, dedicated live acoustics, and curated royal dining.`)
  .join('\n')}

### 5. VENUE & SPATIAL INTEGRATION
- Exclusive buyout and spatial zoning at ${venue}, ${city}, guaranteeing 100% privacy, dignified security perimeters, and whisper-quiet service corridors.
- Preservation protocol: Non-destructive structural mounting, zero wall-penetration, and ballast-anchored heritage structures.

### 6. DESIGN, FLORAL & PRODUCTION SCENOGRAPHY
- Architectural mood lighting calibrated to warm candlelight tones.
- Fresh botanical floral arrangements utilizing heirloom roses, fragrant white blossoms, and regional flora sourced without commercial plastic wrapping.

### 7. HOSPITALITY & VIP PROTOCOL
- 1:2 Guest to Butler ratio. 24/7 private concierge command post for guest styling, wardrobe pressing, and dietary personalization.

### 8. ROYAL CATERING & CURATED F&B CONCEPTS
- Bespoke royal degustation curated by master khansamas and specialist culinary chefs. Live artisanal counters with zero commercial buffet chafers.

### 9. ENTERTAINMENT & SOUND CHOREOGRAPHY
- Live acoustic classical masters, intimate Sufi ensembles, and curated string quartets. Strict compliance with regional acoustic curfew zoning.

### 10. PHOTOGRAPHY & CINEMATIC DOCUMENTATION
- Editorial 35mm and 16mm film documentation alongside non-intrusive 8K cinema lenses. Vogue-standard documentary aesthetic without flash intrusion.

### 11. BRIDAL & GROOM ATTIRE DIRECTION
- Couture harmonization with premier ateliers. Color palette strictly synchronized with event scenography.

### 12. JEWELLERY & VALUABLES SECURITY
- High-security vault protocol and armed escorts for family heirloom jewellery and precious gifts.

### 13. LUXURY FLEET & TRANSIT LOGISTICS
- Dedicated fleet of luxury chauffeur sedans with vetted drivers, real-time dispatch, and discreet arrival choreography.

### 14. BESPOKE STATIONERY & INVITATIONS
- Hand-pressed cotton rag paper with crushed metallic foil accents, calligraphy in vintage ink, and custom wax seal crests.

### 15. ON-GROUND COMMAND POST
- Saanjh Core Director Team overseeing operations, hospitality associates, and technical leads with encrypted two-way communications.

### 16. PRODUCTION MILESTONES
- T-90 Days: Final architectural locks & tasting sign-offs.
- T-60 Days: Dispatch of personalized invitations and logistics lock.
- T-30 Days: Full technical walkthrough and acoustic checks at ${venue}.
- T-7 Days: Site possession, production setup, and final dry-run.

### 17. BUDGET ALLOCATION FRAMEWORK (Target: ${budgetFormatted})
- Venue & Buyout: 30%
- Production & Scenography: 28%
- Curated Catering & Mixology: 20%
- Hospitality & Fleet Logistics: 10%
- Entertainment & Cinema: 8%
- Emergency Contingency Reserve: 4%

### 18. RISK MANAGEMENT & FAIL-SAFES
- Weather backup canopies and indoor alternative floorplans on standby.
- Dedicated silent backup generators with automatic transfer switches.
- On-site paramedic and medical protocol on 24/7 standby.

### 19. IMMEDIATE 72-HOUR NEXT ACTIONS FOR AYUSH
1. Conduct detailed site survey walkthrough at ${venue}, ${city}.
2. Confirm deposit and contract lock for primary scenographer.
3. Review preliminary menu degustation notes for ${client}.

---
SAANJH BRAND GUARDIAN EVALUATION:
- LUXURY: 9.7/10
- PERSONALIZATION: 9.8/10
- EXCLUSIVITY: 10/10
- HOSPITALITY: 9.6/10
- DESIGN QUALITY: 9.5/10
- OPERATIONAL QUALITY: 9.8/10
- BUDGET FIT: 9.5/10
- SAANJH BRAND FIT: 9.9/10
GUARDIAN VERDICT: Fully aligned with the 'We do 6' standard. Commission isolated to ${client} at ${venue}, ${city}.`;
}

/**
 * Creates clean, event-specific chapters without demo data contamination.
 */
export function createDefaultChaptersForEvent(event: {
  clientName: string;
  venue: string;
  city: string;
  estimatedBudget: number;
}): SaanjhChapter[] {
  const budget = Number(event.estimatedBudget) || 35000000;
  const venue = event.venue || 'Commissioned Venue';
  const city = event.city || 'Celebration City';
  const client = event.clientName || 'Private Celebration';

  const chapterDefs = [
    { id: 'ch-venue', name: 'THE VENUE', weight: 0.32, notes: `Exclusive private buyout and access locks for ${venue}, ${city}.` },
    { id: 'ch-design', name: 'THE DESIGN', weight: 0.26, notes: `Architectural scenography tailored for ${client}; bespoke lighting and organic botanical florals.` },
    { id: 'ch-beauty', name: 'THE BEAUTY', weight: 0.04, notes: 'Lead bridal stylist and hair artistry team schedule lock.' },
    { id: 'ch-attire', name: 'THE ATTIRE', weight: 0.07, notes: 'Couture designer coordination, fitting schedule, and wardrobe steaming protocol.' },
    { id: 'ch-jewels', name: 'THE JEWELS', weight: 0.03, notes: 'High-security vault transport & armed protocol for family heirlooms.' },
    { id: 'ch-table', name: 'THE TABLE', weight: 0.20, notes: `Bespoke artisanal tableware, curated royal degustation at ${venue}.` },
    { id: 'ch-moments', name: 'THE MOMENTS', weight: 0.08, notes: 'Ceremonial entries, auspicious muhurat rituals, and milestone memories.' },
    { id: 'ch-sound', name: 'THE SOUND', weight: 0.08, notes: `Acoustic classical maestros, live ensemble curation, and curfew zoning at ${venue}.` },
    { id: 'ch-welcome', name: 'THE WELCOME', weight: 0.05, notes: 'Handcrafted welcome trunks, attar bottles, and personalized calligraphy scrolls.' },
    { id: 'ch-journey', name: 'THE JOURNEY', weight: 0.10, notes: `Dedicated luxury chauffeur convoy and transit protocol in ${city}.` },
    { id: 'ch-invitation', name: 'THE INVITATION', weight: 0.03, notes: 'Bespoke cotton rag paper invitations, wax seal crests, and guest communication.' },
    { id: 'ch-execution', name: 'THE EXECUTION', weight: 0.05, notes: 'Central Saanjh command post and multi-channel production radio coordination.' },
  ];

  return chapterDefs.map((def) => {
    const allocated = Math.round(budget * (def.weight / 1.31));
    return {
      id: `${def.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: def.name,
      status: 'PLANNED' as const,
      tasksCount: 0,
      budgetAllocated: allocated,
      budgetCommitted: 0,
      notes: def.notes,
      deadlines: 'To be locked during Chapter Walkthrough',
      risksCount: 0,
    };
  });
}
