export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'WAITING_VENDOR'
  | 'WAITING_CLIENT'
  | 'APPROVAL'
  | 'DONE';
export type HealthStatus = 'GREEN' | 'AMBER' | 'RED';
export type SlotStatus = 'AVAILABLE' | 'ON_HOLD' | 'COMMISSIONED';

export type AIDirectorPersona =
  | 'EVENT_DIRECTOR'
  | 'CREATIVE_DIRECTOR'
  | 'PROCUREMENT_MANAGER'
  | 'FINANCE_MANAGER'
  | 'HOSPITALITY_MANAGER'
  | 'RISK_MANAGER'
  | 'BRAND_GUARDIAN';

export type EventPhase =
  | 'INTAKE'
  | 'CONCEPT_DESIGN'
  | 'VENDOR_LOCK'
  | 'GUEST_JOURNEY'
  | 'PRODUCTION'
  | 'SHOWTIME'
  | 'POST_WRAP';

export type ChapterStatus = 'PLANNED' | 'IN_PROGRESS' | 'LOCKED' | 'FLAGGED';

export interface SaanjhChapter {
  id: string;
  name: string;
  status: ChapterStatus;
  tasksCount: number;
  budgetAllocated: number;
  budgetCommitted: number;
  notes: string;
  deadlines: string;
  risksCount: number;
}

export interface EventFunction {
  id: string;
  eventId: string;
  name: string;
  dayNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  guestCount: number;
  theme: string;
  dressCode: string;
  decor: string;
  food: string;
  entertainment: string;
  photography: string;
  lighting: string;
  staffing: string;
  transport: string;
  specialMoments: string;
  isDemo?: boolean;
}

export interface CelebrationEvent {
  id: string;
  commissionSlot: number; // 1 to 6
  code: string; // e.g. SJH-2026-001
  clientName: string;
  title?: string; // Optional legacy compatibility alias
  clientNames?: string; // Optional legacy compatibility alias
  primaryContact: string;
  phone: string;
  eventType: string;
  weddingDate: string;
  city: string;
  destination: string;
  venue: string;
  guestCount: number;
  vipGuests: string;
  functionsList: string; // comma separated summary
  estimatedBudget: number;
  committedBudget: number;
  paidBudget: number;
  budgetFlexibility: 'STRICT' | 'MODERATE' | 'FLEXIBLE_FOR_EXCELLENCE';
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
  referenceImages: string[];
  health: HealthStatus;
  currentPhase: EventPhase;
  masterBrief?: string;
  functions: EventFunction[];
  chapters: SaanjhChapter[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VendorCategory =
  | 'Venue'
  | 'Decorator'
  | 'Florist'
  | 'Caterer'
  | 'Makeup'
  | 'Hair'
  | 'Mehendi'
  | 'Jewellery'
  | 'Fashion'
  | 'Photography'
  | 'Videography'
  | 'DJ'
  | 'Live Music'
  | 'Artist'
  | 'Choreographer'
  | 'Anchor'
  | 'Invitation'
  | 'Transportation'
  | 'Hospitality'
  | 'Production'
  | 'Lighting'
  | 'Sound'
  | 'Security'
  | 'Staffing'
  | 'Other';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  location?: string;
  city?: string;
  contactPerson: string;
  phone: string;
  email: string;
  website?: string;
  instagram?: string;
  portfolio?: string;
  portfolioLink?: string;
  priceRange?: '₹₹' | '₹₹₹' | '₹₹₹₹' | 'ROYAL_ULTRA_LUXURY';
  priceTier?: 'ROYAL' | 'ULTRA_LUXURY' | 'LUXURY' | 'HIGH';
  availability?: 'AVAILABLE' | 'ON_HOLD' | 'BOOKED';
  status?: string;
  reliabilityRating?: number; // 1-10
  saanjhRating?: number; // 1-10
  rating?: number; // 1-5
  tasteMatchScore?: number; // 1-100
  specialty?: string;
  pastEventsWorked?: string;
  previousEventsCount?: number;
  paymentTerms?: string;
  contractStatus?: 'APPROVED' | 'PENDING_REVIEW' | 'FLAGGED';
  notes: string;
  isDemo?: boolean;
}

export interface VendorQuote {
  id: string;
  eventId: string;
  eventName?: string;
  vendorName: string;
  category?: string;
  service?: string;
  date?: string;
  uploadedAt?: string;
  rawText?: string;
  rawAnalysis?: string;
  totalPrice?: number;
  quotedAmount?: number;
  taxes?: number;
  transportCharges?: number;
  manpowerCharges?: number;
  setupCharges?: number;
  breakdown?: string;
  itemizedBreakdown?: { item: string; amount: number }[];
  inclusions?: string;
  included?: string[];
  exclusions?: string;
  notIncluded?: string[];
  hiddenCosts?: string;
  hiddenCostsDetected?: string[];
  potentialRisks?: string;
  redFlags?: string[];
  marketRateComparison?: string;
  negotiationRecommendations?: string;
  counterOfferSuggestion?: string;
  paymentSchedule?: string;
  cancellationTerms?: string;
  validity?: string;
  saanjhFitScore?: number; // 1-10
  saanjhBrandFitScore?: number; // 1-10
  directorRecommendation?: string;
  directorsVerdict?: 'APPROVE' | 'NEGOTIATE' | 'REJECT';
  status: 'PENDING_AUDIT' | 'AUDITED' | 'NEGOTIATION_COUNTERED' | 'LOCKED' | 'DECLINED';
  isDemo?: boolean;
  notes?: string;
  verificationStatus?: 'VERIFIED_DATA' | 'USER_PROVIDED' | 'AI_RECOMMENDATION' | 'AI_ESTIMATE' | 'REQUIRES_VERIFICATION';
  requiresAssociation?: boolean;
}

export type BudgetCategory = string;

export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  item?: string;
  estimated: number;
  allocated?: number;
  quoted?: number;
  negotiated?: number;
  committed: number;
  paid: number;
  remaining?: number;
  balance?: number;
  vendorAssigned?: string;
  notes: string;
  warnings?: string[];
  isDemo?: boolean;
}

export interface Task {
  id: string;
  eventId: string;
  eventName: string;
  functionName?: string;
  department: string;
  title: string;
  owner: string;
  priority: Priority;
  deadline: string;
  status: TaskStatus;
  dependency?: string;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
}

export type RiskCategory = string;

export interface Risk {
  id: string;
  eventId: string;
  eventName?: string;
  category: RiskCategory;
  title?: string;
  severity?: Priority;
  impact?: 'LOW' | 'MEDIUM' | 'HIGH';
  probability?: 'LOW' | 'MEDIUM' | 'HIGH';
  triggerSigns?: string;
  description: string;
  owner: string;
  mitigation?: string;
  mitigationPlan?: string;
  backupPlan?: string;
  contingencyPlan?: string;
  status: 'IDENTIFIED' | 'MITIGATING' | 'RESOLVED' | 'ACTIVE' | 'MITIGATED' | 'CONTINGENCY_DEPLOYED';
  isDemo?: boolean;
}

export type DocumentCategory = string;

export interface SaanjhDocument {
  id: string;
  eventId: string;
  eventName?: string;
  title: string;
  category: DocumentCategory;
  fileData?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
  notes?: string;
  summary?: string;
  uploadDate?: string;
  uploadedAt?: string;
  isDemo?: boolean;
}

export interface BrandGuardianEvaluation {
  luxury: number;
  personalization: number;
  exclusivity: number;
  hospitality: number;
  designQuality: number;
  operationalQuality: number;
  budgetFit: number;
  saanjhBrandFit: number;
  verdict: string;
  explanation: string;
}

export interface DirectorMessage {
  id: string;
  sender: 'user' | 'director';
  text: string;
  timestamp: string;
  actionType?: string;
  evaluation?: BrandGuardianEvaluation;
  suggestedTasks?: Partial<Task>[];
}

export interface SaanjhSlotInfo {
  slotNumber: number;
  status: SlotStatus;
  eventId?: string;
  clientName?: string;
  weddingDate?: string;
  destination?: string;
  estimatedBudget?: number;
}

export interface AppSettings {
  ownerName: string;
  businessName: string;
  activeSeason: string;
  phone: string;
  autonomyMode: 'MANAGE' | 'AUTONOMOUS' | 'STRICT_APPROVAL';
  lastBackupDate: string;
  isConfigured: boolean;
}
