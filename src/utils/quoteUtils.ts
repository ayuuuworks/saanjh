import { VendorQuote } from '../types';

/**
 * Parses any incoming numeric value safely.
 * Handles: undefined, null, NaN, empty string, numeric strings with currency/commas, numbers, and zero.
 * Returns the fallback (or undefined) if parsing fails.
 */
export function parseSafeNumber(val: any, fallback?: number): number | undefined {
  if (val === undefined || val === null) {
    return fallback;
  }
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return fallback;
    return val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return fallback;
    // Strip common currency symbols, commas, and formatting
    const cleaned = trimmed
      .replace(/[₹$,\s]/g, '')
      .replace(/Rs\.?/gi, '')
      .replace(/INR/gi, '');
    if (!cleaned) return fallback;
    const parsed = Number(cleaned);
    if (isNaN(parsed) || !isFinite(parsed)) return fallback;
    return parsed;
  }
  return fallback;
}

/**
 * Universal safe currency formatter for Indian Rupees (INR).
 * Never calls .toLocaleString() on undefined or null.
 * 
 * Handled cases:
 * - undefined / null / NaN / '' -> returns options.placeholder (default '₹0' or '—')
 * - 0 -> returns '₹0' or '₹ 0'
 * - valid number -> formatted Indian currency (e.g. ₹11,30,000, ₹20,34,000, ₹9,50,000)
 */
export function formatCurrency(
  value: any,
  options?: {
    compact?: boolean;
    placeholder?: string;
  }
): string {
  const num = parseSafeNumber(value, undefined);
  if (num === undefined) {
    return options?.placeholder ?? '₹0';
  }

  // Compact representation (e.g. for badges, chips, or summary cards)
  if (options?.compact) {
    if (num >= 10000000) {
      const cr = (num / 10000000).toFixed(2);
      return `₹ ${cr.endsWith('.00') ? cr.slice(0, -3) : cr} Cr`;
    }
    if (num >= 100000) {
      const lakh = (num / 100000).toFixed(2);
      return `₹ ${lakh.endsWith('.00') ? lakh.slice(0, -3) : lakh} Lakh`;
    }
  }

  // Standard Indian currency format: e.g. ₹ 11,30,000 or ₹ 1,13,00,000
  try {
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(num);
    return `₹ ${formatted}`;
  } catch {
    return `₹ ${Math.round(num)}`;
  }
}

/**
 * Displays money or "Not provided" if the value is missing/undefined.
 * Used for optional fees like taxes, transportCharges, etc. to prevent inventing fake numbers.
 */
export function formatMoneyOrNotProvided(value: any, options?: { compact?: boolean }): string {
  const num = parseSafeNumber(value, undefined);
  if (num === undefined) {
    return 'Not provided';
  }
  return formatCurrency(num, options);
}

/**
 * Parses itemized cost breakdown from either structured array or raw string format.
 */
function parseItemizedBreakdown(raw: any, rawTotal: number): { item: string; amount: number }[] {
  if (Array.isArray(raw?.itemizedBreakdown) && raw.itemizedBreakdown.length > 0) {
    return raw.itemizedBreakdown.map((it: any) => ({
      item: String(it?.item || 'Itemized Service'),
      amount: parseSafeNumber(it?.amount, 0) ?? 0,
    }));
  }

  // If breakdown is a descriptive string (e.g. from seedData: 'Mandap: ₹38L, Sangeet: ₹34.5L...')
  if (typeof raw?.breakdown === 'string' && raw.breakdown.trim()) {
    const parts = raw.breakdown.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean);
    const parsedItems: { item: string; amount: number }[] = [];

    for (const part of parts) {
      const colonIndex = part.indexOf(':');
      if (colonIndex > 0) {
        const item = part.substring(0, colonIndex).trim();
        const amtStr = part.substring(colonIndex + 1).trim();
        
        let amount = 0;
        if (/lakh|l/i.test(amtStr)) {
          const numPart = amtStr.replace(/[^0-9.]/g, '');
          const val = parseFloat(numPart);
          if (!isNaN(val)) amount = Math.round(val * 100000);
        } else if (/cr/i.test(amtStr)) {
          const numPart = amtStr.replace(/[^0-9.]/g, '');
          const val = parseFloat(numPart);
          if (!isNaN(val)) amount = Math.round(val * 10000000);
        } else {
          amount = parseSafeNumber(amtStr, 0) ?? 0;
        }

        parsedItems.push({ item, amount });
      } else {
        parsedItems.push({ item: part, amount: 0 });
      }
    }

    if (parsedItems.length > 0) {
      return parsedItems;
    }
  }

  // If individual charge fields are present, provide a logical breakdown
  const customItems: { item: string; amount: number }[] = [];
  if (raw?.setupCharges !== undefined && raw.setupCharges !== null) {
    const sc = parseSafeNumber(raw.setupCharges, undefined);
    if (sc !== undefined) customItems.push({ item: 'Setup, Rigging & Striking Charges', amount: sc });
  }
  if (raw?.transportCharges !== undefined && raw.transportCharges !== null) {
    const tc = parseSafeNumber(raw.transportCharges, undefined);
    if (tc !== undefined) customItems.push({ item: 'Logistics, Freight & Barge Transit', amount: tc });
  }
  if (raw?.manpowerCharges !== undefined && raw.manpowerCharges !== null) {
    const mc = parseSafeNumber(raw.manpowerCharges, undefined);
    if (mc !== undefined) customItems.push({ item: 'Crew Labor, Artisans & Per-Diem', amount: mc });
  }
  if (raw?.taxes !== undefined && raw.taxes !== null) {
    const tx = parseSafeNumber(raw.taxes, undefined);
    if (tx !== undefined) customItems.push({ item: 'Statutory GST & Government Levies', amount: tx });
  }

  return customItems;
}

/**
 * Safely parses string lists from arrays or comma/newline separated strings.
 */
function parseStringList(arrVal: any, strVal: any, fallback: string[] = []): string[] {
  if (Array.isArray(arrVal) && arrVal.length > 0) {
    return arrVal.map((s) => String(s || '').trim()).filter(Boolean);
  }
  if (typeof strVal === 'string' && strVal.trim()) {
    return strVal
      .split(/[,;\n]/)
      .map((s: string) => s.trim())
      .filter((s: string) => Boolean(s) && !s.startsWith('-') && !s.startsWith('*'))
      .map((s: string) => s.replace(/^[-*•]\s*/, ''));
  }
  return fallback;
}

/**
 * Normalizes any quote record to guarantee all fields exist with safe defaults.
 * Never mutates the original object.
 * Replaces undefined values with safe fallbacks and cross-references aliases.
 */
export function normalizeQuote(raw: any): VendorQuote {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `qt-${Date.now()}`,
      eventId: 'evt-demo-001',
      eventName: 'Private Celebration',
      vendorName: 'Unnamed Vendor',
      category: 'General Services',
      service: 'General Services',
      date: new Date().toISOString().split('T')[0],
      uploadedAt: new Date().toISOString(),
      rawText: '',
      totalPrice: 0,
      quotedAmount: 0,
      itemizedBreakdown: [],
      included: [],
      notIncluded: [],
      hiddenCostsDetected: [],
      redFlags: [],
      saanjhFitScore: undefined,
      saanjhBrandFitScore: undefined,
      directorsVerdict: 'NEGOTIATE',
      directorRecommendation: 'Review contract line items with Saanjh procurement team.',
      counterOfferSuggestion: 'Counter with Saanjh standard master service agreement.',
      negotiationRecommendations: 'Conduct itemized bill-of-materials audit.',
      marketRateComparison: 'FAIR',
      paymentSchedule: '25% Advance, 50% Post-Mockup, 25% Strike Signoff',
      cancellationTerms: 'Standard Saanjh Force Majeure Protocol',
      validity: '30 Days from issuance',
      status: 'PENDING_AUDIT',
      isDemo: false,
    };
  }

  // Cross-reference aliases for price
  const rawPrice = raw.totalPrice !== undefined ? raw.totalPrice : raw.quotedAmount;
  const safeTotal = parseSafeNumber(rawPrice, 0) ?? 0;

  // Optional numeric charges (keep undefined if not provided so UI shows "Not provided")
  const taxes = parseSafeNumber(raw.taxes, undefined);
  const transportCharges = parseSafeNumber(raw.transportCharges, undefined);
  const manpowerCharges = parseSafeNumber(raw.manpowerCharges, undefined);
  const setupCharges = parseSafeNumber(raw.setupCharges, undefined);

  // Brand fit score (1-10)
  const rawScore = raw.saanjhFitScore !== undefined ? raw.saanjhFitScore : raw.saanjhBrandFitScore;
  const saanjhFitScore = parseSafeNumber(rawScore, undefined);

  // Category and Service aliases
  const category = String(raw.category || raw.service || 'General Services').trim();
  const service = String(raw.service || raw.category || 'General Services').trim();

  // Date and uploadedAt
  const dateStr = String(raw.date || raw.uploadedAt || new Date().toISOString().split('T')[0]).trim();
  const uploadedAtStr = String(raw.uploadedAt || raw.date || new Date().toISOString()).trim();

  // Breakdown items
  const itemizedBreakdown = parseItemizedBreakdown(raw, safeTotal);

  // Inclusions and Exclusions
  const included = parseStringList(
    raw.included,
    raw.inclusions,
    ['Core service delivery and on-site supervision']
  );
  const notIncluded = parseStringList(
    raw.notIncluded,
    raw.exclusions,
    ['Overnight crew per-diem and lodging', 'Overtime generator fuel surcharge']
  );

  // Hidden costs and red flags
  const hiddenCostsDetected = parseStringList(
    raw.hiddenCostsDetected,
    raw.hiddenCosts,
    []
  );
  const redFlags = parseStringList(
    raw.redFlags,
    raw.potentialRisks,
    []
  );

  // Director verdict logic
  let directorsVerdict: 'APPROVE' | 'NEGOTIATE' | 'REJECT' = 'NEGOTIATE';
  if (raw.directorsVerdict === 'APPROVE' || raw.directorsVerdict === 'NEGOTIATE' || raw.directorsVerdict === 'REJECT') {
    directorsVerdict = raw.directorsVerdict;
  } else if (typeof raw.directorRecommendation === 'string') {
    const recUpper = raw.directorRecommendation.toUpperCase();
    if (recUpper.startsWith('APPROVE')) {
      directorsVerdict = 'APPROVE';
    } else if (recUpper.startsWith('REJECT')) {
      directorsVerdict = 'REJECT';
    } else {
      directorsVerdict = 'NEGOTIATE';
    }
  }

  const directorRecommendation = String(
    raw.directorRecommendation ||
    raw.counterOfferSuggestion ||
    'Review contract line-items and negotiate capped logistics.'
  ).trim();

  const counterOfferSuggestion = String(
    raw.counterOfferSuggestion ||
    raw.directorRecommendation ||
    'Accept creative proposal subject to flat capped crew per diem and vendor managing transit clearances.'
  ).trim();

  const negotiationRecommendations = String(
    raw.negotiationRecommendations ||
    raw.directorRecommendation ||
    'Conduct line-by-line rate comparison against Saanjh verified vendor benchmarks.'
  ).trim();

  return {
    id: String(raw.id || `qt-${Date.now()}`),
    eventId: String(raw.eventId || ''),
    eventName: String(raw.eventName || 'Private Celebration'),
    vendorName: String(raw.vendorName || raw.vendor || 'Unnamed Vendor'),
    category,
    service,
    date: dateStr,
    uploadedAt: uploadedAtStr,
    rawText: typeof raw.rawText === 'string' ? raw.rawText : '',
    rawAnalysis: typeof raw.rawAnalysis === 'string' ? raw.rawAnalysis : '',
    totalPrice: safeTotal,
    quotedAmount: safeTotal,
    taxes,
    transportCharges,
    manpowerCharges,
    setupCharges,
    breakdown: typeof raw.breakdown === 'string' ? raw.breakdown : '',
    itemizedBreakdown,
    inclusions: typeof raw.inclusions === 'string' ? raw.inclusions : included.join(', '),
    included,
    exclusions: typeof raw.exclusions === 'string' ? raw.exclusions : notIncluded.join(', '),
    notIncluded,
    hiddenCosts: typeof raw.hiddenCosts === 'string' ? raw.hiddenCosts : hiddenCostsDetected.join('; '),
    hiddenCostsDetected,
    potentialRisks: typeof raw.potentialRisks === 'string' ? raw.potentialRisks : redFlags.join('; '),
    redFlags,
    marketRateComparison: String(raw.marketRateComparison || 'FAIR').trim(),
    saanjhFitScore,
    saanjhBrandFitScore: saanjhFitScore,
    directorRecommendation,
    directorsVerdict,
    counterOfferSuggestion,
    negotiationRecommendations,
    paymentSchedule: String(raw.paymentSchedule || '25% Advance, 50% Post-Mockup, 25% Strike Signoff'),
    cancellationTerms: String(raw.cancellationTerms || 'Standard Saanjh Force Majeure Protocol'),
    validity: String(raw.validity || '30 Days from issuance'),
    status: raw.status || 'AUDITED',
    isDemo: Boolean(raw.isDemo),
  };
}
