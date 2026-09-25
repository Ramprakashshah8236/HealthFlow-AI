import { TourStep, NavTab, UserRole } from '../types';

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'tour-1-command',
    stepNumber: 1,
    tab: 'dashboard',
    title: '1. Command Center Morning Triage',
    subtitle: 'High-altitude regional situational awareness',
    rolePersona: 'All Roles (Logistics, Pharmacists, Directors)',
    description:
      'Start your operational day here. The Command Center aggregates live inventory status, facility occupancy rates, supply runouts, and cold-chain alarms across all medical centers.',
    whatToLookFor: [
      'Top Status KPI Cards: Total hospitals, active units, and critical shortage flags.',
      'Critical Facilities: Identify hospitals with occupancy > 90% or supplies under 7 days runway.',
      'Alerts Feed: Real-time critical shortage and delayed shipment notifications.',
      'Formula: Burn Rate = Daily Avg Consumption; Runway Days = Current Physical Stock / Daily Burn Rate.'
    ],
    actionLabel: 'Inspect Metro General Shortage',
    actionHint: 'Notice Metro General has only 6.5 days of IV Saline remaining—an imminent shortage cliff.'
  },
  {
    id: 'tour-2-shortage',
    stepNumber: 2,
    tab: 'shortages',
    title: '2. Predictive Shortage Forecasting',
    subtitle: 'Anticipate stockouts before they hit the patient bedside',
    rolePersona: 'Supply Analyst & Hospital Logistics Lead',
    description:
      'Move beyond reactive spreadsheets. The Shortage Prediction engine forecasts runout dates based on 6-month burn sequences, surge stress factors, and lead-time delays.',
    whatToLookFor: [
      'Forecasting Models: Toggle between Linear Moving Average, Exponential Smoothing, and Epidemic Surge Stress.',
      'Surge Multiplier: Test what happens if patient intake spikes by +50% or +100%.',
      'Stockout Horizon: The exact projected depletion date (e.g., Oct 2, 2026).',
      'Buffer Line: The safety reserve threshold below which emergency reorders must be placed.'
    ],
    actionLabel: 'Simulate Surge Stress Forecast',
    actionHint: 'Adjust the Surge Multiplier slider to 1.5x and watch the depletion curve steepen.'
  },
  {
    id: 'tour-3-substitutions',
    stepNumber: 3,
    tab: 'substitutions',
    title: '3. Clinical Drug Substitutions',
    subtitle: 'FDA Orange Book bioequivalent alternative protocols',
    rolePersona: 'Clinical Pharmacist (Level 3 Clearance)',
    description:
      'When an essential formulary drug (like Normal Saline, Ceftriaxone, Propofol, or Norepinephrine) faces severe shortages, clinical pharmacists deploy verified therapeutic equivalents to keep ICU and trauma wards running.',
    whatToLookFor: [
      'Bioequivalence Ratings: FDA Orange Book therapeutic equivalence codes (AB, AP).',
      'Dose Conversion Ratio: Exact dosing conversions (e.g. 1g Ceftriaxone ≈ 1g–2g Cefotaxime Q8H).',
      'Network Stock Availability: Checks which regional medical centers have surplus stock of the alternative.',
      'Pharmacist Safety Checklist: Verification of renal function, allergy contraindications, and precipitation risks before sign-off.'
    ],
    actionLabel: 'Review Ceftriaxone Alternatives',
    actionHint: 'Select Ceftriaxone and inspect Cefotaxime and Cefepime replacement options.'
  },
  {
    id: 'tour-4-recalls',
    stepNumber: 4,
    tab: 'recalls',
    title: '4. Regulatory Lot Recalls & Quarantine',
    subtitle: 'FDA 21 CFR § 7 automated batch trace and Pyxis lockout',
    rolePersona: 'Clinical Pharmacist & System Admin',
    description:
      'Manage Class I, II, and III recalls from the FDA or internal pharmacovigilance. Detect defective lot numbers in active hospital storage and instantly execute an immutable network-wide lockout.',
    whatToLookFor: [
      'Classification Badges: Class I (urgent life-threatening), Class II (moderate), Class III (label anomaly).',
      'Batch Inventory Trace: Automatically finds which facilities have the contaminated lots.',
      'One-Click Network Quarantine: Deducts recalled vials from usable Pyxis stock and locks out dispensing.',
      'Retrospective Exposure Tracker: Electronic Health Record audit count of patients potentially exposed.',
      'Printable FDA 21 CFR § 7.46 Certificate: Official quarantine document with cryptographic SHA-256 validation.'
    ],
    actionLabel: 'Review Active Class I Recall',
    actionHint: 'Examine Recall FDA-REC-2026-CLASS-I-084 for contaminated Ceftriaxone lots.'
  },
  {
    id: 'tour-5-waste',
    stepNumber: 5,
    tab: 'waste',
    title: '5. Waste Intelligence & Expiry Prevention',
    subtitle: 'Eliminate preventable financial write-offs and medication spoilage',
    rolePersona: 'Hospital Logistics Lead & Supply Analyst',
    description:
      'Pharmacies routinely discard millions of dollars of expired medications. The Waste Intelligence module calculates exact financial exposure for lots expiring in ≤14, 30, or 60 days.',
    whatToLookFor: [
      'Financial Loss Risk: Exact dollar value calculated as: Excess Units × Unit Acquisition Cost.',
      'Urgency Bands: High-risk lots expiring in under 14 days flagged for rapid priority redistribution.',
      'Surplus Prediction: Identifies lots where projected facility burn rate is slower than expiry cadence.',
      'Rapid Quarantine / Lot Reallocation: Forward expiring units to high-volume trauma centers.'
    ],
    actionLabel: 'Inspect Expiring Diagnostic Kits',
    actionHint: 'Memorial Hospital has 120 viral test kits expiring in 14 days representing $10,200 in financial loss.'
  },
  {
    id: 'tour-6-redistribution',
    stepNumber: 6,
    tab: 'redistribution',
    title: '6. Smart Inter-Hospital Redistribution',
    subtitle: 'Autonomous mutual-aid matching with Chain-of-Custody Manifests',
    rolePersona: 'Regional Director (Level 4 Clearance)',
    description:
      'Rather than relying on backordered suppliers, the algorithmic matching engine pairs surplus hospitals (runway > 25 days) with critical deficit facilities (runway < 8.5 days) while respecting urban transit drive times.',
    whatToLookFor: [
      'Surplus Node Protection: The algorithm ensures source hospital retains ≥ 25 days reserve post-transfer.',
      'Transit Time Matrix: Urban transit calculation (40 km/h baseline + staging latency).',
      'Level 4 Approval: Requires Regional Director authorization to dispatch cross-jurisdiction transfers.',
      'Chain-of-Custody Manifest: Printable FDA 21 CFR § 203 & DEA 222 document with 4-stage barcode tracking and digital signatures.'
    ],
    actionLabel: 'Inspect St. Jude to Metro General Match',
    actionHint: 'Transfer 700 units of Normal Saline from St. Jude (Surplus) to Metro General (Deficit).'
  },
  {
    id: 'tour-7-crisis',
    stepNumber: 7,
    tab: 'crisis',
    title: '7. Crisis Lab & Shock Simulator',
    subtitle: 'Stress-test regional resilience under compound disasters',
    rolePersona: 'Regional Director & System Admin',
    description:
      'Simulate compound multi-shock catastrophes: sudden viral respiratory outbreaks, supplier manufacturing closures, port strikes, and transit gridlock. Watch depletion curves accelerate in real time.',
    whatToLookFor: [
      'Shock Sliders: Disease Demand (+0% to +100%), Supplier Production Halt (-0% to -50%), Transit Delays (+0 to +10 days).',
      'Network Impact Summary: Number of facilities flipped into CRITICAL status and days of reserve lost.',
      'Runout Shifts: Itemized table of which hospital runs out of which life-saving item and on what exact day.',
      'Emergency Action Trigger: Immediate calculation of emergency mutual-aid transfers required to avert collapse.'
    ],
    actionLabel: 'Run Pandemic Stress Simulation',
    actionHint: 'Observe how a 50% disease spike flips 3 hospitals into critical status within 48 hours.'
  },
  {
    id: 'tour-8-cold-chain',
    stepNumber: 8,
    tab: 'cold-chain',
    title: '8. Cold-Chain IoT & Thermal Telemetry',
    subtitle: 'Real-time temperature telemetry for biologics, vaccines & blood',
    rolePersona: 'Clinical Pharmacist & Hospital Logistics Lead',
    description:
      'Monitor cold storage units (+2°C to +8°C for refrigerated pharmaceuticals; -20°C for cryo-biologics). Detect thermal breaches instantly to prevent spoiled medications from reaching patients.',
    whatToLookFor: [
      'Live Sensor Feed: Current temperature readings, safe thresholds, and historical thermal excursion charts.',
      'Thermal Breach Alarms: Flags excursions above +8°C or below +2°C with flashing status indicators.',
      'Alarm Calibration: Acknowledge excursions, record technician calibrations, and verify unit thermal recovery.',
      'Spoilage Defense: Immediate batch lot quarantine if temperature breach duration exceeds 60 minutes.'
    ],
    actionLabel: 'Inspect Sensor SN-CC-004',
    actionHint: 'North Valley General sensor SN-CC-004 is currently reporting +8.4°C—exceeding safe cold threshold.'
  }
];

export interface PracticeScenario {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  targetTab: NavTab;
  recommendedRole: UserRole;
  scenarioStory: string;
  objective: string;
  stepsToComplete: string[];
  sampleAiPrompt: string;
}

export const PRACTICE_SCENARIOS: PracticeScenario[] = [
  {
    id: 'scen-morning-triage',
    title: 'Scenario 1: Hospital Morning Supply Triage',
    badge: 'Daily Routine',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    targetTab: 'dashboard',
    recommendedRole: 'hospital_logistics_lead',
    scenarioStory:
      'You are Elena Rostova, Logistics Lead at Metro General Hospital. It is 07:30 AM. ICU occupancy has risen to 96%, and several critical care supply items are approaching minimum buffer thresholds.',
    objective:
      'Identify acute runout risks, check in-transit shipment ETAs, and prepare an emergency restocking request before morning rounds.',
    stepsToComplete: [
      'Open the Command Center and locate Metro General Hospital in the facility risk matrix.',
      'Identify which supply has the lowest days remaining (IV Saline at 6.5 days).',
      'Verify delayed shipments: notice carrier delay on inbound freight.',
      'Open the Ask AI drawer and ask Gemini: "What are Metro General’s highest priority stockout risks this morning?"'
    ],
    sampleAiPrompt: 'Give me a rapid morning operational briefing for Metro General Hospital. Highlight items with less than 7 days runway and summarize recommended immediate actions.'
  },
  {
    id: 'scen-drug-shortage-sub',
    title: 'Scenario 2: Critical Antibiotic Stockout & Bioequivalent Substitution',
    badge: 'Clinical Pharmacy',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    targetTab: 'substitutions',
    recommendedRole: 'clinical_pharmacist',
    scenarioStory:
      'A regional distributor has halted deliveries of Ceftriaxone IV due to raw material sterility holds. Metro General and St. Jude have only 3 days of vials remaining for severe bacterial infections.',
    objective:
      'Deploy the Clinical Substitutions Engine to identify FDA Orange Book equivalent therapies, calculate dosage conversions, complete the bedside safety checklist, and authorize an emergency protocol.',
    stepsToComplete: [
      'Switch active persona to Dr. Sarah Chen, PharmD (Clinical Pharmacist).',
      'Navigate to Clinical Substitutions and select Ceftriaxone IV.',
      'Compare Cefotaxime (direct AB rated bioequivalent) vs Cefepime (4th generation alternative).',
      'Check contraindications (anaphylaxis history and renal dosing).',
      'Complete all items in the Pharmacist Bedside Verification Checklist.',
      'Click "Authorize Bedside Substitution Protocol" to record the protocol in the audit ledger.'
    ],
    sampleAiPrompt: 'As an expert clinical pharmacologist, evaluate therapeutic substitution from Ceftriaxone to Cefotaxime for hospital inpatients during supply constraints.'
  },
  {
    id: 'scen-lot-recall-drill',
    title: 'Scenario 3: FDA Class I Urgent Recall & Network Quarantine Drill',
    badge: 'Regulatory Safety',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    targetTab: 'recalls',
    recommendedRole: 'clinical_pharmacist',
    scenarioStory:
      'The FDA has issued an urgent Class I recall for particulate contamination in sterile antibiotic vials. Active lots are currently loaded in automated dispensing machines across 3 regional medical centers.',
    objective:
      'Locate all contaminated lot numbers across hospital inventory, execute a network-wide electronic lockout, and generate the official FDA 21 CFR § 7.46 quarantine certificate.',
    stepsToComplete: [
      'Switch role to Clinical Pharmacist or System Admin.',
      'Open the Recalls & Quarantine Center and select recall FDA-REC-2026-CLASS-I-084.',
      'Review the manufacturing root cause and retrospective patient exposure count.',
      'Click "Lock & Quarantine All Lots" to immediately revoke dispensing access across Pyxis cabinets.',
      'Click "FDA 806 Form" to view and verify the digitally signed regulatory quarantine notice.',
      'Test your facility readiness by clicking "Simulate Class I Emergency Recall".'
    ],
    sampleAiPrompt: 'Draft an urgent bedside nursing clinical safety bulletin notifying ward teams to immediately quarantine lot LOT-CTRX-2026-04 and switch patients to approved alternative therapy.'
  },
  {
    id: 'scen-mutual-aid-manifest',
    title: 'Scenario 4: Inter-Hospital Mutual Aid & Transfer Manifest Dispatch',
    badge: 'Logistics Command',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    targetTab: 'redistribution',
    recommendedRole: 'regional_director',
    scenarioStory:
      'Metro General is facing a catastrophic IV Fluid shortage (6.5 days remaining). St. Jude Hospital has 42 days of runway with a +700 bag surplus. A commercial reorder will take 12 days to arrive.',
    objective:
      'Authorize an inter-facility mutual aid transfer of 700 units from St. Jude to Metro General, and generate an official Chain-of-Custody Manifest with carrier tracking.',
    stepsToComplete: [
      'Switch role to Dr. Marcus Vance (Regional Director) for Level 4 clearance.',
      'Navigate to Smart Redistribution.',
      'Review the algorithmic recommendation pairing St. Jude (Surplus) with Metro General (Shortage).',
      'Click "Approve Recommended Transfer" to execute the inventory reallocation.',
      'Click "Manifest" in the approved shipments table to open the official Chain-of-Custody Manifest.',
      'Review the 4-stage custody log (Dispatch → Carrier Handoff → In-Transit → Receiving) and export CSV.'
    ],
    sampleAiPrompt: 'Analyze the regional benefits of transferring 700 bags of IV Saline from St. Jude to Metro General. How does this impact the overall system resilience score?'
  },
  {
    id: 'scen-crisis-epidemic-shock',
    title: 'Scenario 5: Epidemic Demand Surge & Supply Disruption Simulation',
    badge: 'Signature Crisis Lab',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    targetTab: 'crisis',
    recommendedRole: 'regional_director',
    scenarioStory:
      'Public health officials alert the regional command center of a sudden respiratory epidemic surge coupled with a Category 3 hurricane shutting down a Gulf Coast IV fluid sterilization plant.',
    objective:
      'Model the impact of a +45% disease surge, a -30% supplier capacity cut, and +4 days shipping delay to determine which hospitals collapse first and what stockpiles to mobilize.',
    stepsToComplete: [
      'Navigate to the Crisis Lab.',
      'Adjust the Disease Demand Increase slider to +45%.',
      'Adjust the Supplier Capacity Reduction slider to -30%.',
      'Adjust Transport Delay to +4 days.',
      'Click "Run Stress-Test Simulation" to calculate runout shifts and new critical hospitals.',
      'Review the emergency transfers required to maintain uninterrupted trauma service.'
    ],
    sampleAiPrompt: 'Given a 45% surge in patient admissions and a 30% reduction in supplier shipments, what are the top 3 supply chain failure points across our hospital network and what mitigation steps must we take?'
  }
];

export const HOW_IT_WORKS_SECTIONS = [
  {
    title: '1. Dual-Mode Data Pipeline: Synthetic vs. Real-World',
    summary: 'How HealthFlow AI balances evaluation prototyping with live hospital production integration.',
    details: [
      'Synthetic Baseline Mode: Powered by mathematically calibrated models with 6 facilities, 12 essential formulary items, 72 inventory records, and active cold-chain IoT sensors. Demonstrates acute shortages, surplus nodes, and expiring lots out-of-the-box.',
      'Live Real Data Mode: Allows healthcare teams to upload live hospital CSVs (facilities, inventories, batches) or sync via cloud Firestore. The entire platform recomputes all formulas against the uploaded network in sub-second time.',
      'Seamless Data Switcher: Toggle between Synthetic and Real mode at any moment with one click in the header.'
    ]
  },
  {
    title: '2. Calculation Engine & Predictive Runway Algorithms',
    summary: 'The mathematical formulas driving shortage detection and mutual-aid matching.',
    details: [
      'Days Remaining Formula: Runway = Current Physical Units / Projected Daily Consumption Burn.',
      'Shortage Risk Classification: ≤ 3.0 Days = CRITICAL (code red); 3.1 – 8.5 Days = HIGH RISK; 8.6 – 14.0 Days = WARNING; > 14.0 Days = STABLE.',
      'Hospital Overall Risk Score: A weighted formula combining Acute ICU Bed Occupancy (40%), Shortage Supply Exposure (35%), Patient Load Trajectory (15%), and Cold-Chain Breaches (10%). Scale: 0 to 100.',
      'Surplus Qualification Rule: A facility is only eligible to donate supplies if its post-transfer buffer remains ≥ 25 days of consumption, mathematically preventing induced local shortages.'
    ]
  },
  {
    title: '3. Clinical Pharmacology & FDA Alignment Engine',
    summary: 'How HealthFlow AI protects clinical safety during medication scarcity.',
    details: [
      'FDA Orange Book Cross-Referencing: Categorizes alternatives into exact bioequivalents (AB rated), therapeutic class substitutes, and emergency salvage protocols.',
      'Dosage Equivalence Calculator: Clinical conversion ratios prevent medication errors when transitioning between drug concentrations or infusion regimens.',
      'Bedside Safety Checklist: Mandatory verification of renal clearance, drug-drug incompatibilities, and black-box contraindications before protocol authorization.',
      'Automated Lot Trace: Instantly queries active hospital Pyxis cabinets to trace recalled lot numbers across all beds and nursing units.'
    ]
  },
  {
    title: '4. Zero-Trust Security & Tamper-Evident Audit Ledger',
    summary: 'Hospital-grade role-based access control (RBAC) and immutable compliance.',
    details: [
      '5 Clearance Tiers: System Admin (Level 5), Regional Director (Level 4), Hospital Logistics Lead (Level 3 Ops), Clinical Pharmacist (Level 3 Clinical), and Supply Analyst (Level 2).',
      'Granular Action Validation: Quarantine actions legally require Clinical Pharmacist clearance; inter-hospital cross-border transfers require Regional Director clearance.',
      'Cryptographic SHA-256 Audit Ledger: Every login, transfer approval, quarantine order, and Gemini AI query is recorded with client IP, timestamp, and verification hash in compliance with HIPAA and ISO 27001.',
      'Air-Gapped Secrets: All Gemini and Firebase credentials are strictly isolated on server-side proxy routes with zero client-side exposure.'
    ]
  },
  {
    title: '5. Grounded Gemini 3.8 Flash Clinical AI',
    summary: 'How AI assists healthcare leaders without hallucination.',
    details: [
      'Live Grounded Context: Every query sent to Gemini contains high-density JSON snapshots of real-time inventory counts, critical runways, active recalls, and delayed shipments.',
      'Instant Actionability: Gemini answers with specific lot numbers, replacement drug alternatives, and prioritized transfer vectors rather than generic advice.',
      'Clinical Documentation Assistant: Generates regulatory memos, FDA recall notices, and executive briefings with one click.'
    ]
  }
];

export const DAILY_SOP_STEPS = [
  {
    time: '07:00 - 08:00',
    title: 'Morning Network Situational Assessment',
    role: 'Logistics Lead & Regional Director',
    tab: 'dashboard' as NavTab,
    instructions:
      'Log into HealthFlow AI. Review the Command Center summary cards: verify overall system health, check for critical hospitals (occupancy > 90% or supplies < 7d), and inspect delayed shipments.',
    actionItem: 'Flag any facility entering a critical shortage cliff for morning clinical huddle.'
  },
  {
    time: '08:30 - 09:30',
    title: 'Shortage Runway Deep-Dive & Surge Projections',
    role: 'Supply Analyst & Logistics Lead',
    tab: 'shortages' as NavTab,
    instructions:
      'Open Shortage Prediction. Filter by items with ≤ 8.5 days runway. Apply Epidemic Surge stress tests if regional disease incidence is climbing. Record the projected stockout dates.',
    actionItem: 'Identify whether stockouts can be resolved by pending deliveries or require mutual aid.'
  },
  {
    time: '10:00 - 11:00',
    title: 'Clinical Substitutions & Formulary Protocols',
    role: 'Clinical Pharmacist',
    tab: 'substitutions' as NavTab,
    instructions:
      'If critical medications (IV Fluids, Antibiotics, Vasopressors) are under critical scarcity, consult the Clinical Substitutions engine. Review FDA Orange Book alternatives, verify renal/hepatic dosing, complete the safety checklist, and issue emergency authorization.',
    actionItem: 'Authorize substitution protocol and notify ward charge nurses.'
  },
  {
    time: '11:30 - 12:30',
    title: 'Regulatory Recall Surveillance & Pyxis Lockdown',
    role: 'Clinical Pharmacist & System Admin',
    tab: 'recalls' as NavTab,
    instructions:
      'Check active FDA and manufacturer recalls. If new lots are flagged, verify matching batch numbers in hospital inventory. Execute network quarantine to lock out automated dispensing cabinets.',
    actionItem: 'Generate FDA 21 CFR § 7.46 quarantine certificate for compliance files.'
  },
  {
    time: '13:00 - 14:00',
    title: 'Cold-Chain IoT & Thermal Telemetry Audit',
    role: 'Clinical Pharmacist & Logistics Lead',
    tab: 'cold-chain' as NavTab,
    instructions:
      'Audit all vaccine and biologics storage units (+2°C to +8°C). If sensor telemetry reports a breach (e.g. SN-CC-004 at +8.4°C), acknowledge the alarm, verify compressor recovery, and inspect batch lots.',
    actionItem: 'Quarantine batches if excursion duration exceeded allowable stability window.'
  },
  {
    time: '14:30 - 15:30',
    title: 'Inter-Hospital Mutual-Aid Rebalancing & Dispatch',
    role: 'Regional Director',
    tab: 'redistribution' as NavTab,
    instructions:
      'Open Smart Redistribution. Review algorithmic recommendations matching qualified surplus medical centers with critical deficit hospitals. Approve transfers using Level 4 clearance.',
    actionItem: 'Generate and print the official Chain-of-Custody Manifest for courier driver sign-off.'
  },
  {
    time: '16:00 - 17:00',
    title: 'Crisis Preparedness Stress-Testing & Stockpile Modeling',
    role: 'Regional Director & Supply Analyst',
    tab: 'crisis' as NavTab,
    instructions:
      'Run contingency drills in the Crisis Lab to evaluate network endurance against hypothetical supplier strikes, storm shutdowns, or disease spikes.',
    actionItem: 'Formulate regional strategic stockpile mobilization plans.'
  },
  {
    time: '17:00 - 17:30',
    title: 'End-of-Day Audit Ledger Sign-Off',
    role: 'System Admin',
    tab: 'dashboard' as NavTab,
    instructions:
      'Open the Audit Log. Review immutable records of all approved transfers, batch quarantines, sensor resets, and role modifications executed throughout the day. Verify cryptographic hash integrity.',
    actionItem: 'Export daily HIPAA/ISO compliance ledger report.'
  }
];
