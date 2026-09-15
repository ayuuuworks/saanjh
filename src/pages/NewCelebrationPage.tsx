import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Crown,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  ArrowRight,
  Loader2,
  X,
} from 'lucide-react';
import { CelebrationEvent, EventFunction, SaanjhSlotInfo } from '../types';
import { validateMasterBrief, createDefaultChaptersForEvent } from '../utils/aiContext';

interface Props {
  onNavigate: (page: string) => void;
}

export const NewCelebrationPage: React.FC<Props> = ({ onNavigate }) => {
  const { addEvent, slots, updateSlot } = useSaanjh();

  // Find next available slot
  const nextAvailableSlot = slots.find((s) => s.status === 'AVAILABLE')?.slotNumber || 1;

  const [formData, setFormData] = useState({
    commissionSlot: nextAvailableSlot,
    clientName: '',
    primaryContact: '',
    phone: '',
    eventType: 'Wedding',
    weddingDate: '',
    city: '',
    destination: '',
    venue: '',
    guestCount: 200,
    vipGuests: '',
    functionsList: 'Welcome Dinner, Mehendi & Haldi, Sangeet, Royal Wedding Pheras, Reception',
    estimatedBudget: 35000000,
    budgetFlexibility: 'FLEXIBLE_FOR_EXCELLENCE' as 'STRICT' | 'MODERATE' | 'FLEXIBLE_FOR_EXCELLENCE',
    style: 'Royal Indian Heritage, Restrained Elegance',
    mood: 'Intimate, cinematic, royal, detail obsessed',
    colorPalette: 'Deep Burgundy, Warm Ivory, Antique Champagne Gold',
    culturalRequirements: 'Royal traditional rituals, auspicious muhurat timings',
    foodPreferences: 'Master royal khansamas, regional organic specialties, zero commercial chafers',
    entertainmentPreferences: 'Acoustic classical Indian maestros, Sufi ensembles, curated live strings',
    photographyPreferences: 'Editorial 35mm & 16mm film, non-intrusive documentary',
    hospitalityRequirements: '1:2 Guest to Butler ratio, 24/7 dedicated in-suite concierge',
    transportationRequirements: 'Dedicated luxury chauffeur fleet & airport protocol',
    specialRequests: 'Exclusive private buyout, absolute privacy guarantee',
    forbiddenThings: 'No generic LED trusses, no plastic flowers, no loud Bollywood DJ remixes during dinner',
  });

  const [referenceImages, setReferenceImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  const eventTypes = [
    'Wedding',
    'Engagement',
    'Roka',
    'Mehendi',
    'Haldi',
    'Sangeet',
    'Reception',
    'Birthday',
    'Anniversary',
    'Private Dinner',
    'Corporate',
    'Other',
  ];

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setReferenceImages([...referenceImages, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const newEventId = `evt-${Date.now()}`;
      const slotNum = Number(formData.commissionSlot) || 1;
      const code = `SJH-2026-00${slotNum}`;

      // Call server AI endpoint to formulate the complete Event Master Brief with strict isolation
      const res = await fetch('/api/ai/intake-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeData: {
            ...formData,
            id: newEventId,
            code,
            commissionSlot: slotNum,
            isDemo: false,
          },
        }),
      });
      const data = await res.json();
      const rawBrief = data.brief || '';

      // Validate Master Brief against authoritative event facts
      const validation = validateMasterBrief(rawBrief, {
        id: newEventId,
        clientName: formData.clientName,
        commissionSlot: slotNum,
        code,
        weddingDate: formData.weddingDate,
        city: formData.city,
        destination: formData.destination || `${formData.venue}, ${formData.city}`,
        venue: formData.venue,
        guestCount: Number(formData.guestCount),
        estimatedBudget: Number(formData.estimatedBudget),
        functionsList: formData.functionsList,
        isDemo: false,
      });

      const masterBrief = validation.correctedBrief;
      setGeneratedBrief(masterBrief);

      // Parse multi-day functions list into discrete isolated functions
      const rawFnNames = formData.functionsList
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const functionNames =
        rawFnNames.length > 0
          ? rawFnNames
          : ['Welcome Dinner & Baithak', 'Haldi & Mehendi', 'The Sangeet', 'Royal Wedding Pheras & Reception'];

      const initialFunctions: EventFunction[] = functionNames.map((fnName, idx) => ({
        id: `fn-${newEventId}-${idx + 1}`,
        eventId: newEventId,
        isDemo: false,
        name: fnName,
        dayNumber: Math.min(idx + 1, 4),
        date: formData.weddingDate,
        startTime: idx % 2 === 0 ? '18:00' : '11:00',
        endTime: idx % 2 === 0 ? '23:00' : '15:30',
        venue: formData.venue,
        guestCount: Number(formData.guestCount),
        theme: 'Royal Scenography & Restrained Elegance',
        dressCode: 'Heirloom Festive Attire',
        decor: 'Handcrafted floral arches & warm candlelight warmth',
        food: 'Curated royal degustation by master khansamas',
        entertainment: 'Curated live acoustic ensemble',
        photography: '35mm editorial cinema documentation',
        lighting: '2400K candlelight warmth',
        staffing: 'Uniformed Saanjh hospitality marshals',
        transport: 'Dedicated luxury chauffeur convoy',
        specialMoments: 'Ceremonial welcome and twilight celebration',
      }));

      // Create new event in state with 100% data integrity
      const newEvent: CelebrationEvent = {
        id: newEventId,
        commissionSlot: slotNum,
        code,
        clientName: formData.clientName,
        primaryContact: formData.primaryContact,
        phone: formData.phone,
        eventType: formData.eventType,
        weddingDate: formData.weddingDate,
        city: formData.city,
        destination: formData.destination || `${formData.venue}, ${formData.city}`,
        venue: formData.venue,
        guestCount: Number(formData.guestCount),
        vipGuests: formData.vipGuests,
        functionsList: formData.functionsList,
        estimatedBudget: Number(formData.estimatedBudget),
        committedBudget: 0,
        paidBudget: 0,
        budgetFlexibility: formData.budgetFlexibility,
        style: formData.style,
        mood: formData.mood,
        colorPalette: formData.colorPalette,
        culturalRequirements: formData.culturalRequirements,
        foodPreferences: formData.foodPreferences,
        entertainmentPreferences: formData.entertainmentPreferences,
        photographyPreferences: formData.photographyPreferences,
        hospitalityRequirements: formData.hospitalityRequirements,
        transportationRequirements: formData.transportationRequirements,
        specialRequests: formData.specialRequests,
        forbiddenThings: formData.forbiddenThings,
        referenceImages,
        health: 'GREEN',
        currentPhase: 'INTAKE',
        masterBrief,
        functions: initialFunctions,
        chapters: createDefaultChaptersForEvent({
          clientName: formData.clientName,
          venue: formData.venue,
          city: formData.city,
          estimatedBudget: Number(formData.estimatedBudget),
        }),
        isDemo: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addEvent(newEvent);
      setCreatedEventId(newEventId);
    } catch (error) {
      console.error('Error generating event:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#2D0A0E] text-[#FBF9F5] p-6 lg:p-8 rounded-2xl border border-[#C5A059]/40 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-[#E6CA65]">
            <Crown className="w-4 h-4" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#E6CA65] font-semibold">
            Guided Commission Intake Form
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-wide">
          Commission a New Saanjh Celebration
        </h1>
        <p className="text-xs text-[#FBF9F5]/70 mt-1 max-w-2xl leading-relaxed">
          Saanjh accepts only 6 major commissions per season. Complete the comprehensive celebration brief below. Upon submission, the AI Director will architect the <strong>Event Master Brief</strong> spanning all 19 Saanjh operational chapters.
        </p>
      </div>

      {/* Success / Generated Brief View */}
      {generatedBrief && (
        <div className="bg-[#FBF9F5] border-2 border-[#C5A059] rounded-2xl p-6 lg:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-[#DFD7C2]">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-[#1E382B]" />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#706E6B] font-bold">
                  Commission Operationalized
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#3B0D11]">
                  EVENT MASTER BRIEF GENERATED
                </h2>
              </div>
            </div>

            <button
              onClick={() => onNavigate('event-command')}
              className="px-5 py-2.5 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-xl text-xs font-serif font-bold tracking-wider flex items-center gap-2 shadow-md transition-all"
            >
              OPEN EVENT COMMAND CENTRE <ArrowRight className="w-4 h-4 text-[#E6CA65]" />
            </button>
          </div>

          <div className="bg-[#F5F1E8] p-6 rounded-xl border border-[#DFD7C2] max-h-[600px] overflow-y-auto">
            <div className="prose prose-stone text-xs leading-relaxed text-[#1E1E24] whitespace-pre-wrap font-sans">
              {generatedBrief}
            </div>
          </div>
        </div>
      )}

      {/* Guided Intake Form */}
      {!generatedBrief && (
        <form onSubmit={handleSubmit} className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 lg:p-8 shadow-sm space-y-8">
          {/* Section 1: Core Client & Commission Slot */}
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2] flex items-center justify-between">
              <span>1. Client Identity & Commission Slot</span>
              <span className="text-xs font-sans font-normal text-[#706E6B]">
                Season Slot Allocation
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Saanjh Slot (1 to 6) *
                </label>
                <select
                  value={formData.commissionSlot}
                  onChange={(e) => setFormData({ ...formData, commissionSlot: Number(e.target.value) })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs font-bold text-[#3B0D11] focus:outline-hidden"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const slot = slots.find((s) => s.slotNumber === num);
                    return (
                      <option key={num} value={num}>
                        Slot {num} ({slot?.status})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Client / Family Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Suryaveer Singh & Ananya Singhania"
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Primary Contact *
                </label>
                <input
                  type="text"
                  required
                  value={formData.primaryContact}
                  onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
                  placeholder="e.g. Rajeev Singhania (Father of Bride)"
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Direct Phone *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98201 54321"
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Destination & Dates */}
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
              2. Destination, Venue & Date
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Event Type *
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                >
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Wedding / Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Udaipur / Jodhpur / Jaipur"
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Venue *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Taj Lake Palace & Jagmandir"
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Guest Protocol & Scale */}
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
              3. Scale, Guests & Budget Framework
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Guest Count *
                </label>
                <input
                  type="number"
                  required
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Estimated Budget (INR) *
                </label>
                <input
                  type="number"
                  required
                  step="500000"
                  value={formData.estimatedBudget}
                  onChange={(e) => setFormData({ ...formData, estimatedBudget: Number(e.target.value) })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Budget Flexibility
                </label>
                <select
                  value={formData.budgetFlexibility}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budgetFlexibility: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                >
                  <option value="FLEXIBLE_FOR_EXCELLENCE">Flexible for Excellence (Saanjh Standard)</option>
                  <option value="MODERATE">Moderate (+/- 10%)</option>
                  <option value="STRICT">Strict Cap</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  VIP & Royal House Guests
                </label>
                <input
                  type="text"
                  value={formData.vipGuests}
                  onChange={(e) => setFormData({ ...formData, vipGuests: e.target.value })}
                  placeholder="e.g. 24 Royal Family Dignitaries, Cabinet Ministers, High-Net-Worth Industrialists"
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Creative Direction & Saanjh Standards */}
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
              4. Creative Direction & Brand Requirements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Style
                </label>
                <input
                  type="text"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Mood
                </label>
                <input
                  type="text"
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Color Palette
                </label>
                <input
                  type="text"
                  value={formData.colorPalette}
                  onChange={(e) => setFormData({ ...formData, colorPalette: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Planned Functions List
                </label>
                <input
                  type="text"
                  value={formData.functionsList}
                  onChange={(e) => setFormData({ ...formData, functionsList: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Specific Preferences & Strict Forbidden List */}
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
              5. Preferences & What They Absolutely Do Not Want
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Food & Royal Catering Preferences
                </label>
                <textarea
                  rows={2}
                  value={formData.foodPreferences}
                  onChange={(e) => setFormData({ ...formData, foodPreferences: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg p-2.5 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Entertainment & Music Preferences
                </label>
                <textarea
                  rows={2}
                  value={formData.entertainmentPreferences}
                  onChange={(e) => setFormData({ ...formData, entertainmentPreferences: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg p-2.5 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Photography & Documentation Preferences
                </label>
                <textarea
                  rows={2}
                  value={formData.photographyPreferences}
                  onChange={(e) => setFormData({ ...formData, photographyPreferences: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg p-2.5 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Hospitality & Transportation Protocols
                </label>
                <textarea
                  rows={2}
                  value={formData.hospitalityRequirements}
                  onChange={(e) => setFormData({ ...formData, hospitalityRequirements: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg p-2.5 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-1.5">
                  Special Requests
                </label>
                <input
                  type="text"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2 bg-[#3B0D11]/5 border border-[#3B0D11]/30 p-4 rounded-xl">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0D11] mb-1.5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#B87A81]" />
                  Things They Absolutely Do Not Want (Red Lines) *
                </label>
                <textarea
                  rows={2}
                  value={formData.forbiddenThings}
                  onChange={(e) => setFormData({ ...formData, forbiddenThings: e.target.value })}
                  className="w-full bg-[#FBF9F5] border border-[#DFD7C2] focus:border-[#3B0D11] rounded-lg p-2.5 text-xs text-[#1E1E24] focus:outline-hidden"
                  placeholder="e.g. No plastic flowers, no generic LED trusses, no commercial Bollywood remixes during sacred rituals..."
                />
              </div>
            </div>
          </div>

          {/* Section 6: Reference Moodboard Images */}
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#C5A059]" />
              <span>6. Moodboard & Reference Visuals</span>
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Paste reference image URL (e.g. Unsplash architecture or palace photo)..."
                  className="flex-1 bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-[#1E1E24] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-[#3B0D11] text-[#FBF9F5] rounded-lg text-xs font-semibold hover:bg-[#4A151B] transition-colors"
                >
                  Add Image
                </button>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {referenceImages.map((url, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-[#DFD7C2] aspect-video group">
                    <img
                      src={url}
                      alt={`Reference ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#DFD7C2] flex items-center justify-between">
            <span className="text-xs text-[#706E6B] italic font-serif">
              "We don't sell services. We curate celebrations."
            </span>

            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-3.5 bg-[#3B0D11] hover:bg-[#4A151B] disabled:opacity-50 text-[#FBF9F5] rounded-xl text-xs font-serif font-bold tracking-widest uppercase flex items-center gap-2 border border-[#C5A059] shadow-md transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E6CA65]" />
                  AI DIRECTOR ARCHITECTING MASTER BRIEF...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E6CA65]" />
                  SUBMIT INTAKE & GENERATE MASTER BRIEF
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
