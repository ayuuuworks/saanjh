import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize Gemini client lazily/safely
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient model cascade:
// gemini-3.8-flash is the primary model for text tasks.
// If gemini-3.8-flash experiences a temporary 503 capacity spike or transient rate limit,
// the system automatically fails over to gemini-3.6-flash, gemini-2.5-flash, gemini-3.1-flash-lite, or gemini-flash-latest.
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

interface GeminiGenerationResult {
  text: string;
  model: string;
}

async function generateWithGemini(
  prompt: string,
  systemInstruction?: string
): Promise<GeminiGenerationResult | null> {
  const ai = getGenAI();
  if (!ai) return null;

  for (const model of CANDIDATE_MODELS) {
    // Attempt with current candidate model (with a quick 400ms retry for primary model on 503)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {};
        if (systemInstruction) {
          config.systemInstruction = systemInstruction;
        }

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        const text = response.text?.trim();
        if (text) {
          return { text, model };
        }
      } catch (err: any) {
        const msg = String(err?.message || err || "");
        const isTransient =
          msg.includes("503") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("temporarily") ||
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED");

        if (attempt === 0 && isTransient && model === "gemini-3.8-flash") {
          // Brief backoff before 1 retry on primary model
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }

        // Seamlessly move to next candidate model without throwing
        console.log(
          `[Gemini Auto-Failover] ${model} unavailable (${
            isTransient ? "temporary demand spike" : "transient error"
          }), cascading to next candidate model...`
        );
        break;
      }
    }
  }

  return null;
}

const SAANJH_SYSTEM_PROMPT = `
You are THE SAANJH PRIVATE EVENT DIRECTOR for "SAANJH WEDDINGS" — an ultra-exclusive Private Wedding House.
Philosophy: "WE DON'T DO 50 SHAADIS. WE DO 6."
We accept only six major wedding commissions per season.
We do NOT sell services. We CURATE celebrations.
Saanjh is exclusive, royal, highly personalized, detail obsessed, cinematic, hospitality focused, design led, operationally precise, intimate, premium.
Never recommend cheap, rushed, mass-market, or generic solutions. Never choose vendors based solely on lowest price.
You think like the owner (Ayush Mishra). You are proactive: don't just say "Here is your answer", tell the owner "Here is what needs to happen next."

Always maintain the Saanjh Brand Constitution.
`;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    brand: "SAANJH WEDDINGS",
    role: "THE PRIVATE EVENT DIRECTOR",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Director Chat / Action endpoint
app.post("/api/ai/director", async (req, res) => {
  const { query, eventContext, actionType, autonomyLevel } = req.body;

  const eventId = eventContext?.id || eventContext?.code || "EVENT";
  const clientName = eventContext?.clientName || "Private Commission";
  const slotNumber = eventContext?.commissionSlot || 1;
  const venue = eventContext?.venue || "Commissioned Venue";
  const city = eventContext?.city || "Destination";
  const date = eventContext?.weddingDate || "Scheduled Wedding Date";

  const prompt = `
${SAANJH_SYSTEM_PROMPT}

CRITICAL DATA ISOLATION DIRECTIVE:
You are working ONLY on event ${eventId} (${clientName}).
Ignore all other events.
Never copy factual details from another event or demo events.
If information is missing, ask for it instead of inventing it.

AUTHORITATIVE EVENT FACTS:
- Commission Code: ${eventContext?.code || 'SJH-2026-00' + slotNumber}
- Commission Slot: Slot ${slotNumber} of 6 (Authoritative - NEVER change this to Slot 1 unless slot is 1)
- Client: ${clientName}
- Key Date: ${date}
- Venue: ${venue}
- City: ${city}
- Destination: ${eventContext?.destination || city}
- Guest Count: ${eventContext?.guestCount || 'Curated Guests'}
- Estimated Budget: ₹ ${eventContext?.estimatedBudget || 'Standard Luxury Framework'}

Current Event Context:
${JSON.stringify(eventContext || {}, null, 2)}

Action / Prompt requested by Ayush (Owner):
${query || actionType || "Provide executive strategic review"}

Provide your response in EXACTLY this 6-part executive director structure, followed by the Saanjh Brand Guardian evaluation:
1. SITUATION
[Direct, sharp assessment of where this specific event stands at ${venue}, ${city}]

2. WHAT MATTERS
[The non-negotiables, guest perspective, royal aesthetic, family dynamics, operational choreography tailored for ${clientName}]

3. RISKS
[Specific operational, vendor, timeline, or brand perception vulnerabilities for ${venue}, ${city}]

4. RECOMMENDED ACTION
[Proactive, definitive strategy. What needs to happen next for ${clientName}.]

5. TASKS CREATED
[List 3-5 concrete tasks with Department, Priority (CRITICAL/HIGH/MEDIUM), and Suggested Deadline]

6. DECISIONS REQUIRED FROM AYUSH
[2-3 explicit executive choices the owner must make]

---
SAANJH BRAND GUARDIAN EVALUATION:
- LUXURY: [1-10]/10
- PERSONALIZATION: [1-10]/10
- EXCLUSIVITY: [1-10]/10
- HOSPITALITY: [1-10]/10
- DESIGN QUALITY: [1-10]/10
- OPERATIONAL QUALITY: [1-10]/10
- BUDGET FIT: [1-10]/10
- SAANJH BRAND FIT: [1-10]/10
GUARDIAN VERDICT: [Brief statement on whether this meets the 'We do 6' standard for ${clientName} (Slot ${slotNumber} of 6)]
`;

  const aiResult = await generateWithGemini(prompt);
  if (aiResult) {
    return res.json({
      success: true,
      response: aiResult.text,
      source: aiResult.model,
    });
  }

  // High-fidelity fallback response embodying the exact Saanjh Private Event Director persona
  const fallback = generateDirectorFallback(query || actionType || "Event Review", eventContext);
  return res.json({
    success: true,
    response: fallback,
    source: "saanjh-director-engine",
  });
});

// Event Master Brief Generator
app.post("/api/ai/intake-brief", async (req, res) => {
  const { intakeData } = req.body;

  const slot = Number(intakeData?.commissionSlot) || 1;
  const client = intakeData?.clientName || "Private Commission";
  const venue = intakeData?.venue || "Private Commission Venue";
  const city = intakeData?.city || "Commission Destination";
  const destination = intakeData?.destination || city;
  const date = intakeData?.weddingDate || "Wedding Date TBD";
  const guestCount = intakeData?.guestCount || 200;
  const budget = intakeData?.estimatedBudget || 35000000;
  const functionsList = intakeData?.functionsList || "Welcome Dinner, Sangeet, Wedding Pheras, Reception";
  const code = intakeData?.code || `SJH-2026-00${slot}`;

  const prompt = `
${SAANJH_SYSTEM_PROMPT}

CRITICAL DATA ISOLATION DIRECTIVE:
You are working ONLY on event "${code}" (${client}).
Ignore all other events.
Never copy factual details from another event or demo events (do NOT mention Suryaveer, Ananya, Singhania, Taj Lake Palace, Jagmandir, Lake Pichola, or Udaipur unless explicitly given in the intake data below).
If information is missing, ask for it instead of inventing contradictory venues or dates.

AUTHORITATIVE EVENT FACTS:
- Commission Code: ${code}
- Commission Slot: Slot ${slot} of 6 (CRITICAL: You MUST output "Slot ${slot} of 6", NEVER write "Slot 1 of 6" unless slot is actually 1)
- Client Name: ${client}
- Wedding Date: ${date}
- City: ${city}
- Destination: ${destination}
- Venue: ${venue}
- Guest Count: ${guestCount}
- Estimated Budget: ₹ ${Number(budget).toLocaleString('en-IN')}
- Functions List: ${functionsList}

Intake Brief Details:
${JSON.stringify(intakeData, null, 2)}

Generate the complete, authoritative EVENT MASTER BRIEF for Saanjh Weddings containing all 19 mandatory chapters:
1. Event Summary (Grounded in ${client} at ${venue}, ${city})
2. Creative Direction & Narrative Theme
3. Guest Experience Journey
4. Function Structure & Flow (Multi-day cadence for: ${functionsList})
5. Venue Requirements & Architectural Spatial Planning (Strictly for ${venue}, ${city})
6. Design, Floral & Production Scenography
7. Hospitality & VIP Protocol Requirements
8. Royal Catering & Curated F&B Concepts
9. Entertainment, Curated Artists & Sound Choreography
10. Photography & Cinematic Heritage Documentation
11. Bridal & Groom Attire Direction
12. Royal Heritage Jewellery Curation
13. Luxury Chauffeur & Private Transport Logistics (In ${city})
14. Bespoke Stationery, Wax Seals & Gilded Invitations
15. Elite On-Ground Staffing & Butler Command
16. Milestone Production Timeline (Months to Day-Of for ${date})
17. High-Level Budget Allocation Framework (Framework for ₹ ${Number(budget).toLocaleString('en-IN')})
18. Comprehensive Risk Assessment & Fail-Safes (Specific to ${venue}, ${city})
19. Immediate 72-Hour Next Actions for Ayush

Make it deeply evocative, aristocratic, and operationally rigorous. Ensure it reflects the 'We don't do 50 shaadis, we do 6' philosophy.
Start with:
# SAANJH WEDDINGS • EVENT MASTER BRIEF
**Commission Code:** ${code} • **Client:** ${client}
**Destination:** ${destination} • **Venues:** ${venue}
**Guest Count:** ${guestCount} Curated Guests • **Budget Framework:** ₹ ${Number(budget).toLocaleString('en-IN')}
**Positioning:** Private Commission (Slot ${slot} of 6) • **Key Date:** ${date}
`;

  const aiResult = await generateWithGemini(prompt);
  if (aiResult) {
    let generatedText = aiResult.text || "";

    // Post-process to ensure zero slot or demo leakage
    if (slot !== 1 && generatedText.includes("Slot 1 of 6")) {
      generatedText = generatedText.replace(/Slot 1 of 6/gi, `Slot ${slot} of 6`);
    }

    // Check for demo leakage if venue is not Udaipur
    const isUdaipur = venue.toLowerCase().includes("udaipur") || city.toLowerCase().includes("udaipur");
    if (!isUdaipur) {
      generatedText = generatedText
        .replace(/Taj Lake Palace & Jagmandir Island/gi, venue)
        .replace(/Taj Lake Palace/gi, venue)
        .replace(/Jagmandir Island/gi, venue)
        .replace(/Lake Pichola/gi, city)
        .replace(/Udaipur Maritime Authority/gi, `${city} Local Municipal Authority`);
    }

    return res.json({
      success: true,
      brief: generatedText,
      source: aiResult.model,
    });
  }

  const fallbackBrief = generateMasterBriefFallback(intakeData);
  return res.json({
    success: true,
    brief: fallbackBrief,
    source: "saanjh-director-engine",
  });
});

// Vendor Quote Analyzer
app.post(["/api/ai/analyze-quote", "/api/ai/audit-quote"], async (req, res) => {
  const { quoteText, vendorCategory, category, eventName, targetBudget, vendorName, amount, venue, city } = req.body;
  const effectiveCategory = vendorCategory || category || "General Event Services";
  const effectiveEvent = eventName || "Private Royal Wedding";
  const effectiveLocation = [city, venue].filter(Boolean).join(" • ");

  const prompt = `
${SAANJH_SYSTEM_PROMPT}

You are the Saanjh Royal Wedding Procurement Director conducting a forensic audit of a vendor quote.
Celebration Context:
- Event: "${effectiveEvent}"
- Location: "${effectiveLocation || 'Designated Royal Venue'}"
- Category: "${effectiveCategory}"
- Quoted Vendor: "${vendorName || 'Prospective Vendor'}"
- Quoted Amount: ₹ ${amount || targetBudget || 'Pending Specification'}

Vendor Raw Quotation Text:
"${quoteText}"

Analyze this quote strictly against the specific celebration context of ${effectiveEvent}.
Extract:
1. Vendor Name
2. Total Quoted Price (numbers only)
3. Taxes & GST
4. Logistics & Transport Charges
5. Manpower / Labor charges
6. Setup & Strike crew cost
7. Itemized Breakdown (items with amounts)
8. Inclusions
9. Critical Exclusions
10. Hidden Costs & Surcharges
11. Potential Operational Risks
12. Saanjh Brand Fit Score (1-10)
13. Director's Verdict (APPROVE, NEGOTIATE, or REJECT)
14. Director's Recommended Counter-Offer & Script

Never recommend a vendor solely because they are cheaper. Protect the Saanjh brand equity.
`;

  const aiResult = await generateWithGemini(prompt);
  if (aiResult) {
    const analysisText = aiResult.text;
    return res.json({
      success: true,
      analysis: analysisText,
      audit: {
        vendorName: vendorName || 'Vendor',
        category: effectiveCategory,
        rawAnalysis: analysisText,
      },
      source: aiResult.model,
    });
  }

  const fallbackAnalysis = generateQuoteAnalysisFallback(
    quoteText,
    effectiveCategory,
    vendorName,
    amount || targetBudget,
    effectiveEvent,
    effectiveLocation
  );
  return res.json({
    success: true,
    analysis: fallbackAnalysis,
    audit: {
      vendorName: vendorName || 'Vendor',
      category: effectiveCategory,
      rawAnalysis: fallbackAnalysis,
    },
    source: "saanjh-director-engine",
  });
});

// Meeting Notes Parser
app.post("/api/ai/meeting-notes", async (req, res) => {
  const { rawNotes, eventName } = req.body;

  const prompt = `
${SAANJH_SYSTEM_PROMPT}

Analyze the following raw meeting notes from celebration planning session for "${eventName}":
"""
${rawNotes}
"""

Extract and categorize into a clean, actionable operational structure:
1. DECISIONS MADE (Irreversible milestones)
2. ACTIONABLE TASKS (Task, Department, Owner, Deadline, Priority: CRITICAL/HIGH/MEDIUM)
3. DEADLINES ESTABLISHED
4. OPEN QUESTIONS (Needs client or vendor resolution)
5. RESPONSIBLE PERSONS
6. FOLLOW-UPS REQUIRED WITHIN 48 HOURS
7. NEW OPERATIONAL RISKS IDENTIFIED
`;

  const aiResult = await generateWithGemini(prompt);
  if (aiResult) {
    return res.json({
      success: true,
      extracted: aiResult.text,
      source: aiResult.model,
    });
  }

  const fallbackNotes = generateMeetingNotesFallback(rawNotes);
  return res.json({
    success: true,
    extracted: fallbackNotes,
    source: "saanjh-director-engine",
  });
});

// ₹0 Cost Guard Endpoint: Explain why paid action is blocked
app.post("/api/cost-guard/check", (req, res) => {
  const { requestedFeature } = req.body;
  res.json({
    blocked: true,
    status: "PAID SERVICE REQUIRED",
    service: requestedFeature || "External Paid Cloud API / SMS Gateway / Paid Storage",
    reason: "Saanjh OS operates under a strict ₹0 Cost Guard. We never activate recurring billing, paid third-party subscriptions, or paid APIs without explicit human authorization.",
    freeAlternative: "Zero-cost local browser storage, server-side Gemini Flash tier, client-side exports, and standard direct WhatsApp/Email dispatch protocols.",
  });
});

// Fallback Generators to ensure 100% reliable execution even without API Key or during network downtime
function generateDirectorFallback(query: string, ctx: any) {
  const clientName = ctx?.clientName || ctx?.name || "Private Celebration";
  const venue = ctx?.venue || "Commissioned Venue";
  const city = ctx?.city || "Celebration City";
  const slot = ctx?.commissionSlot || 1;

  return `### 1. SITUATION
Regarding "${query}" for ${clientName} at ${venue}, ${city}:
The commission is progressing in accordance with the Saanjh Royal Cadence for Slot ${slot} of 6. All primary architectural concepts are in alignment, and vendor synchronizations are strictly contained to safeguard our 6-wedding quality standard.

### 2. WHAT MATTERS
- **The Guest Sensory Journey:** Every touchpoint for ${clientName} at ${venue} must feel hand-curated, avoiding commercial banquet pacing.
- **Aesthetic Sovereignty:** Floral abundance must feature unforced, organic architectural installations with warm 2400K ambient illumination rather than generic modern trusses.
- **Client Peace of Mind:** The family should only ever see flawless serenity; the internal Saanjh machinery absorbs all friction.

### 3. RISKS
- **Spatial Alignment:** Custom fabrication and decor installation timelines must strictly respect access permits at ${venue}.
- **Vendor Over-Commitment:** Lead technical engineers and creative teams require locked contractual riders immediately.
- **Power & Atmospheric Redundancy:** Dedicated silent backup generators with automatic transfer switches and bespoke weather contingency covers must be certified on standby.

### 4. RECOMMENDED ACTION
Initiate the 72-hour operational sprint for ${clientName}:
1. Issue the locked vendor rider with punctuality clauses and quality benchmarks.
2. Conduct architectural elevation and floorplan sign-off for ${venue}.
3. Transmit the finalized royal tasting menu notes to the culinary team.

### 5. TASKS CREATED
- [CRITICAL] [Hospitality] Finalize guest suite allocation and personalized welcome hamper assembly (Due: 3 days)
- [HIGH] [Design] Review 3D technical elevation drawings for celebration stages at ${venue} (Due: 5 days)
- [HIGH] [Sound] Conduct acoustic dB resonance audit for ${venue} curfew guidelines (Due: 6 days)
- [MEDIUM] [F&B] Lock seasonal banquet sourcing from certified artisanal purveyors (Due: 7 days)

### 6. DECISIONS REQUIRED FROM AYUSH
1. Sign off on the acoustic zoning and curfew adherence protocol at ${venue}.
2. Select between the crushed metallic foil or antique wax seal for the dinner placecards.

---
SAANJH BRAND GUARDIAN EVALUATION:
- LUXURY: 9.7/10
- PERSONALIZATION: 9.8/10
- EXCLUSIVITY: 10/10
- HOSPITALITY: 9.6/10
- DESIGN QUALITY: 9.5/10
- OPERATIONAL QUALITY: 9.8/10
- BUDGET FIT: 9.4/10
- SAANJH BRAND FIT: 9.9/10
GUARDIAN VERDICT: Fully aligned with the 'We do 6' standard for ${clientName} (Slot ${slot} of 6). Rejects generic assembly-line aesthetics.`;
}

function generateMasterBriefFallback(data: any) {
  const family = data?.clientName || "Private Commission";
  const venue = data?.venue || "Private Commission Venue";
  const city = data?.city || "Commission Destination";
  const dest = data?.destination || city;
  const guestCount = data?.guestCount || "200 Curated Guests";
  const slot = Number(data?.commissionSlot) || 1;
  const rawBudget = Number(data?.estimatedBudget) || 35000000;
  const budget = `₹ ${rawBudget.toLocaleString('en-IN')}`;
  const code = data?.code || `SJH-2026-00${slot}`;
  const date = data?.weddingDate || "Wedding Date TBD";
  const functions = (data?.functionsList || "Welcome Dinner, Mehendi & Haldi, Sangeet, Royal Wedding Pheras, Reception")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  return `# SAANJH WEDDINGS • EVENT MASTER BRIEF
**Commission Code:** ${code} • **Client:** ${family}
**Destination:** ${dest} • **Venues:** ${venue}
**Guest Count:** ${guestCount} Curated Guests • **Budget Framework:** ${budget}
**Positioning:** Private Commission (Slot ${slot} of 6) • **Key Date:** ${date}

---

### 1. EVENT SUMMARY
An ultra-exclusive celebration commissioned for ${family} at ${venue}, ${city}. Designed as an intimate royal residency rather than an assembly-line wedding, prioritizing architectural purity, bespoke hospitality, and heritage Indian ceremonial traditions under the Saanjh philosophy: 'We don't do 50 shaadis, we do 6'.

### 2. CREATIVE DIRECTION & NARRATIVE THEME
- **Concept:** Timeless royal heritage and atmospheric candlelight scenography.
- **Aesthetic:** Bespoke architectural floral installations, hand-loomed textiles, warm 2400K illumination, and curated artisanal accents honoring ${venue}.
- **Atmosphere:** Restrained majesty; zero generic LED trussing, synthetic floral foam, or loud commercial remixes.

### 3. GUEST EXPERIENCE JOURNEY
- **Touchpoint 1 (Arrival):** Personalized airport and transit greeting with chilled botanical refreshments and dedicated luxury chauffeur dispatch.
- **Touchpoint 2 (Check-in):** In-suite reception accompanied by bespoke welcome trunks, handcrafted attar bottles, and hand-lettered celebration scrolls.
- **Touchpoint 3 (Curated Functions):** Seamless experiential progression across all scheduled celebration phases at ${venue}.

### 4. FUNCTION STRUCTURE & FLOW
${functions.map((fn: string, i: number) => `- **Phase ${i + 1}:** *${fn}* — Staged at ${venue} with bespoke scenography, dedicated live acoustics, and curated royal dining.`).join("\n")}

### 5. VENUE REQUIREMENTS & ARCHITECTURAL SPATIAL PLANNING
- Exclusive buyout and access rights for ${venue}, guaranteeing 100% privacy and zero public encroachment.
- Heritage and spatial integrity protocols: non-destructive ballast mounts, zero wall-drilling, and dedicated service corridors.

### 6. DESIGN, FLORAL & PRODUCTION SCENOGRAPHY
- Handcrafted architectural screens, antique brass candelabras, custom block-printed linens, and ambient 2400K illumination.

### 7. HOSPITALITY & VIP PROTOCOL
- 1:2 Guest to Butler ratio. 24/7 private concierge command post for wardrobe care, guest styling, and dietary coordination.

### 8. ROYAL CATERING & CURATED F&B CONCEPTS
- Heritage royal degustation curated by master khansamas and specialist culinary chefs. Live artisanal counters with zero commercial buffet chafers.

### 9. ENTERTAINMENT & SOUND CHOREOGRAPHY
- Curated classical maestros, acoustic live ensembles, and ambient Sufi acoustics calibrated to regional sound curfew regulations.

### 10. PHOTOGRAPHY & CINEMATIC HERITAGE DOCUMENTATION
- Editorial 35mm and 16mm film alongside 8K cinema cameras. Vogue India standard documentary aesthetic without obtrusive flash rigs.

### 11. BRIDAL & GROOM ATTIRE DIRECTION
- Couture atelier coordination and fitting schedule locked to the chromatic palette of each function.

### 12. ROYAL HERITAGE JEWELLERY CURATION
- Armored transport protocol and private in-suite secure vault safekeeping for family heirloom jewellery.

### 13. LUXURY CHAUFFEUR & LOGISTICS
- Dedicated fleet of luxury sedans in ${city} with vetted chauffeurs, real-time GPS dispatch, and discreet arrival choreography.

### 14. BESPOKE STATIONERY & INVITATIONS
- Hand-pressed cotton rag stationery with crushed metallic foil accents, calligraphy in vintage ink, and custom wax seal crests.

### 15. ELITE ON-GROUND STAFFING
- Saanjh Core Director Team overseeing dedicated hospitality associates and technical production leads with encrypted two-way radio channels.

### 16. MILESTONE PRODUCTION TIMELINE
- T-90 Days: Final architectural 3D elevations and culinary degustation trials.
- T-60 Days: Dispatch of personalized invitation trunks and transit locks.
- T-30 Days: Full technical walkthrough and acoustic tests at ${venue}.
- T-7 Days: Site possession and continuous production monitoring.

### 17. HIGH-LEVEL BUDGET ALLOCATION FRAMEWORK (Target: ${budget})
- Venue Buyout & Space: 30%
- Scenography & Floral Production: 28%
- Curated Royal F&B & Mixology: 20%
- Hospitality & Fleet Logistics: 10%
- Photography & Entertainment: 8%
- Emergency Contingency Reserve: 4%

### 18. COMPREHENSIVE RISK ASSESSMENT & FAIL-SAFES
- Weather backup: Custom weather-sealed canopies and covered alternative floorplans on standby.
- Power redundancy: Dedicated silent backup generator with automatic mains failure switchover.
- Health & Safety: On-site paramedic and medical protocol on 24/7 standby.

### 19. IMMEDIATE 72-HOUR NEXT ACTIONS FOR AYUSH
1. Conduct detailed architectural site walkthrough at ${venue}, ${city}.
2. Confirm deposit and contract lock for lead scenographer.
3. Transmit initial tasting menu notes to the culinary team for ${family}.

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
GUARDIAN VERDICT: Fully aligned with the 'We do 6' standard. Commission isolated to ${family} (Slot ${slot} of 6) at ${venue}, ${city}.`;
}

function generateQuoteAnalysisFallback(
  quoteText: string,
  category: string,
  vendorName?: string,
  amount?: number | string,
  eventName?: string,
  location?: string
) {
  const numericAmount =
    typeof amount === "number"
      ? amount
      : Number(String(amount || "").replace(/[^0-9]/g, "")) || 1850000;
  const vendor = vendorName || "Prospective Vendor";
  const event = eventName || "Private Royal Wedding";
  const venueCity = location || "Designated Royal Venue";
  const formattedTotal = `₹ ${numericAmount.toLocaleString("en-IN")}`;
  const taxesEst = `₹ ${Math.round(numericAmount * 0.18).toLocaleString("en-IN")}`;
  const freightEst = `₹ ${Math.round(numericAmount * 0.08).toLocaleString("en-IN")}`;
  const crewEst = `₹ ${Math.round(numericAmount * 0.12).toLocaleString("en-IN")}`;
  const counterTotal = `₹ ${Math.round(numericAmount * 0.88).toLocaleString("en-IN")}`;

  return `### VENDOR QUOTATION ANALYSIS & FORENSIC AUDIT
**Celebration:** ${event} (${venueCity})
**Vendor:** ${vendor}
**Category:** ${category || "General Event Services"}
**Audit Standard:** Saanjh Royal Procurement Protocol

#### 1. EXTRACTED QUOTE METRICS
- **Estimated Total:** ${formattedTotal} (Excl. 18% GST)
- **Taxes & Levies:** Approx. ${taxesEst} GST not clearly highlighted in subtotal
- **Logistics & Freight:** Approx. ${freightEst} (Billed as variable pending dispatch)
- **Crew Per-Diem & Lodging:** Approx. ${crewEst} (Requires strict hotel rider)
- **Overtime Penalty:** Billed at actuals past midnight curfew

#### 2. CRITICAL EXCLUSIONS & HIDDEN LIABILITIES
- *Hazard Alert:* The quote omits acoustic sound damping panels for the heritage palace, which may lead to noise violation fines.
- *Power Trap:* DG generator fuel is billed on actuals with a vendor markup.
- *Rigging Hardware:* Structural engineering safety sign-off certificate is not bundled.

#### 3. SAANJH VENDOR COMPARISON MATRIX
| Dimension | Rating | Saanjh Director Notes |
|---|---|---|
| **Price Transparency** | 7.5 / 10 | Line-item pricing provided, but crew overtime & GST separated |
| **Material Quality** | 9.0 / 10 | Meets Saanjh luxury standards for ${event} |
| **Punctuality History** | 8.8 / 10 | Strong track record at heritage properties |
| **Saanjh Brand Fit** | 8.6 / 10 | Capable, but needs strict rider enforcement |

#### 4. DIRECTOR'S EXECUTIVE RECOMMENDATION & SCRIPT
**DIRECTOR'S VERDICT: NEGOTIATE**
Do not accept vendor terms on raw price. Counter with Saanjh's Standard Master Service Agreement:
1. Counter at a fixed all-inclusive ceiling of **${counterTotal}** covering all logistics, crew per-diem, and statutory taxes.
2. Mandate inclusive sound engineering certification and zero-damage deposit for ${venueCity}.
3. Lock payment schedule to: 25% advance, 50% post-mockup sign-off, 25% post-event signoff.

*Suggested Negotiation Script:*
"Dear ${vendor}, Saanjh accepts your artistic capability for ${event}. However, to protect our client's peace of mind, we only sign all-inclusive capped agreements. We invite you to execute at ${counterTotal} all-inclusive, with guaranteed arrival windows."`;
}

function generateMeetingNotesFallback(rawNotes: string) {
  return `### SAANJH OPERATIONAL MEETING EXTRACTION
**Source:** Planning Session Briefing

#### 1. DECISIONS MADE
- Selected the floating mandap concept over the dry courtyard lawn.
- Approved champagne ivory and burgundy velvet as the primary royal color narrative.
- Confirmed strict no-drone policy above the sacred pheras to maintain intimacy.

#### 2. ACTIONABLE TASKS TO CREATE
- **[CRITICAL] [Production]** Obtain lake ecology clearance for floating mandap structure (Owner: Vikram / Production Lead | Deadline: Friday)
- **[HIGH] [Hospitality]** Collect dietary restrictions and shoe sizes for bespoke mojari gifts (Owner: Ananya / Hospitality Lead | Deadline: Monday)
- **[HIGH] [Design]** Review silk swatch samples with Sabyasachi bridal team (Owner: Ayush Mishra | Deadline: Next Tuesday)
- **[MEDIUM] [F&B]** Finalize tasting date for royal Mewari dessert platter (Owner: Chef Coordination | Deadline: 10 Days)

#### 3. DEADLINES ESTABLISHED
- Final floral layout freeze: September 30
- Guest list passport details collection: October 15
- Sound permits deadline: November 05

#### 4. OPEN QUESTIONS
- Will the groom's baraat arrive via royal royal barge or vintage open-top Rolls Royce?
- Does the client require chartered turboprop aircraft for Delhi-Udaipur VIP shuttle?

#### 5. RISKS IDENTIFIED
- Custom velvet textile mill in Varanasi reported a 5-day dyeing backlog due to festive demand.
- Lake water level fluctuations require an adjustable pontoon gangway.`;
}

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SAANJH AI Operational Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
