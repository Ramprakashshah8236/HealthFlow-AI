import { ClinicalDrugSubstitution } from '../types';

export const INITIAL_SUBSTITUTIONS: ClinicalDrugSubstitution[] = [
  {
    id: 'sub-group-saline',
    primarySupplyId: 'sup-1',
    primarySupplyName: 'IV Fluids (0.9% Normal Saline 1000ml)',
    category: 'Pharmaceuticals',
    indications: ['Hypovolemia', 'Fluid resuscitation', 'Intravenous carrier infusion', 'Metabolic alkalosis'],
    fdaGuidance: 'FDA Guidance on Conservation Strategies for Parenteral Electrolyte & Resuscitation Solutions (Updated Sept 2026). Prioritize oral rehydration in non-critical ward patients. Substitute Lactated Ringer’s for trauma and peri-operative resuscitation.',
    pharmacistVerificationRequired: true,
    safetyChecklist: [
      'Confirm serum potassium & sodium levels before substituting Lactated Ringer’s.',
      'Do not administer Lactated Ringer’s simultaneously with Ceftriaxone via same Y-site (precipitation hazard).',
      'Verify patient renal clearance function (eGFR) if infusing balanced crystalloids with potassium.'
    ],
    substitutes: [
      {
        id: 'sub-lr-1000',
        name: "Lactated Ringer's Solution (1000ml IV)",
        equivalenceType: 'THERAPEUTIC_CLASS',
        dosageRatio: '1 : 1 by volume replacement',
        administrationRoute: 'Intravenous Infusion',
        clinicalNotes: 'Preferred crystalloid fluid for severe trauma, metabolic acidosis, and major surgical procedures. Contains 4 mEq/L potassium and 28 mEq/L lactate.',
        contraindications: ['Severe hepatic failure (impaired lactate clearance)', 'Co-administration with IV Ceftriaxone in pediatric infants'],
        relativeCostFactor: 1.05,
        fdaOrangeBookCode: 'AP',
      },
      {
        id: 'sub-plasma-lyte',
        name: 'Plasma-Lyte 148 / Normosol-R (1000ml IV)',
        equivalenceType: 'THERAPEUTIC_CLASS',
        dosageRatio: '1 : 1 by volume replacement',
        administrationRoute: 'Intravenous Infusion',
        clinicalNotes: 'Physiologically balanced crystalloid buffer matching normal plasma osmolarity (294 mOsm/L). Minimizes hyperchloremic metabolic acidosis risk.',
        contraindications: ['Hyperkalemia', 'Hypersensitivity to gluconate or acetate'],
        relativeCostFactor: 1.25,
        fdaOrangeBookCode: 'AP',
      },
      {
        id: 'sub-d5-half-saline',
        name: 'Dextrose 5% in 0.45% Sodium Chloride (1000ml)',
        equivalenceType: 'EMERGENCY_ALTERNATIVE',
        dosageRatio: 'Adjust per electrolyte maintenance protocol',
        administrationRoute: 'Intravenous Maintenance Infusion',
        clinicalNotes: 'Maintenance infusion alternative when 0.9% NS is depleted. Not for acute rapid bolus hypovolemic shock resuscitation.',
        contraindications: ['Acute cerebral edema / raised ICP', 'Severe acute hypovolemia'],
        relativeCostFactor: 0.95,
        fdaOrangeBookCode: 'AP',
      }
    ]
  },
  {
    id: 'sub-group-ceftriaxone',
    primarySupplyId: 'sup-8',
    primarySupplyName: 'Antibiotic Supplies (Ceftriaxone IV 1g)',
    category: 'Pharmaceuticals',
    indications: ['Community-acquired pneumonia', 'Bacterial meningitis', 'Complicated urinary tract infections', 'Intra-abdominal sepsis'],
    fdaGuidance: 'CDC & IDSA Antibiotic Stewardship Shortage Mitigation Directive: Reserve remaining 3rd-generation cephalosporins for CNS infections and gonorrhea. Deploy Cefotaxime, Cefepime, or Ampicillin/Sulbactam for respiratory/UTI indications.',
    pharmacistVerificationRequired: true,
    safetyChecklist: [
      'Check history of severe beta-lactam anaphylaxis.',
      'Adjust dosage interval according to Cockcroft-Gault creatinine clearance (CrCl).',
      'Ensure therapeutic drug monitoring (TDM) if transitioning to aminoglycoside combination.'
    ],
    substitutes: [
      {
        id: 'sub-cefotaxime-1g',
        name: 'Cefotaxime Sodium IV (1g - 2g Vial)',
        equivalenceType: 'EXACT_EQUIVALENT',
        dosageRatio: '1g Ceftriaxone Q24H ≈ 1g - 2g Cefotaxime Q8H',
        administrationRoute: 'IV Infusion / Slow IV Push (3-5 min)',
        clinicalNotes: 'Direct 3rd-generation cephalosporin therapeutic equivalent. Safe in neonates and patients with hyperbilirubinemia where Ceftriaxone is contraindicated.',
        contraindications: ['History of immediate severe IgE-mediated cephalosporin anaphylaxis'],
        relativeCostFactor: 1.10,
        fdaOrangeBookCode: 'AB',
      },
      {
        id: 'sub-cefepime-2g',
        name: 'Cefepime HCl IV (4th Generation 2g Vial)',
        equivalenceType: 'THERAPEUTIC_CLASS',
        dosageRatio: '1g Ceftriaxone Q24H ≈ 1g - 2g Cefepime Q8-12H',
        administrationRoute: 'IV Piggyback over 30 minutes',
        clinicalNotes: 'Expanded gram-negative coverage including Pseudomonas aeruginosa. Ideal for hospital-acquired respiratory infections or febrile neutropenia.',
        contraindications: ['Severe unadjusted renal impairment (risk of neurotoxicity/encephalopathy)'],
        relativeCostFactor: 1.35,
        fdaOrangeBookCode: 'AB',
      },
      {
        id: 'sub-zosyn-3375',
        name: 'Piperacillin / Tazobactam (Zosyn 3.375g Vial)',
        equivalenceType: 'EMERGENCY_ALTERNATIVE',
        dosageRatio: '1g Ceftriaxone ≈ 3.375g - 4.5g Zosyn Q6H extended infusion',
        administrationRoute: 'IV Extended Infusion over 4 hours',
        clinicalNotes: 'Broad-spectrum antipseudomonal penicillin + beta-lactamase inhibitor. Reserve for severe polymicrobial sepsis or intra-abdominal emergencies.',
        contraindications: ['Penicillin allergy with prior anaphylaxis or Stevens-Johnson syndrome'],
        relativeCostFactor: 1.45,
        fdaOrangeBookCode: 'AP',
      }
    ]
  },
  {
    id: 'sub-group-propofol',
    primarySupplyId: 'sup-11',
    primarySupplyName: 'Propofol Injectable Emulsion (10mg/ml 20ml)',
    category: 'Critical Care',
    indications: ['ICU mechanical ventilation sedation', 'General anesthesia induction & maintenance', 'Monitored anesthesia care (MAC)'],
    fdaGuidance: 'American Society of Anesthesiologists (ASA) Drug Shortage Protocol: For prolonged ICU sedation during Propofol shortages, transition hemodynamically stable patients to Dexmedetomidine or Midazolam continuous infusions.',
    pharmacistVerificationRequired: true,
    safetyChecklist: [
      'Continuous cardiac rhythm, blood pressure, and pulse oximetry monitoring mandatory.',
      'Check lipid panel if Propofol infusion exceeds 48 hours (risk of Propofol Infusion Syndrome - PRIS).',
      'For Dexmedetomidine, monitor for bradycardia and transient sinus arrest on bolus.'
    ],
    substitutes: [
      {
        id: 'sub-dexmedetomidine-200mcg',
        name: 'Dexmedetomidine HCl (Precedex 200mcg/2ml)',
        equivalenceType: 'THERAPEUTIC_CLASS',
        dosageRatio: '0.2 - 1.4 mcg/kg/hour continuous IV titration',
        administrationRoute: 'Continuous IV Infusion via dedicated volumetric pump',
        clinicalNotes: 'Selective alpha-2 adrenergic agonist. Produces "cooperative sedation" without respiratory depression, facilitating early extubation in ICU.',
        contraindications: ['Severe sinus bradycardia (<45 bpm)', 'Advanced second- or third-degree heart block without pacemaker'],
        relativeCostFactor: 1.60,
        fdaOrangeBookCode: 'AP',
      },
      {
        id: 'sub-midazolam-5mg',
        name: 'Midazolam Injection (5mg/ml 10ml)',
        equivalenceType: 'THERAPEUTIC_CLASS',
        dosageRatio: '1 - 7 mg/hour continuous IV infusion (titrate to RASS -2)',
        administrationRoute: 'IV Continuous Infusion',
        clinicalNotes: 'Potent water-soluble benzodiazepine with rapid onset. Causes anterograde amnesia. Higher accumulation in prolonged sedation compared to Propofol.',
        contraindications: ['Acute narrow-angle glaucoma', 'Untreated severe respiratory compromise without mechanical airway'],
        relativeCostFactor: 0.85,
        fdaOrangeBookCode: 'AP',
      }
    ]
  },
  {
    id: 'sub-group-norepinephrine',
    primarySupplyId: 'sup-12',
    primarySupplyName: 'Norepinephrine Bitartrate (4mg/4ml ampules)',
    category: 'Critical Care',
    indications: ['Septic shock first-line vasopressor', 'Cardiogenic shock with severe hypotension', 'Neurogenic shock refractory to fluids'],
    fdaGuidance: 'Surviving Sepsis Campaign Emergency Shortage Protocol: Norepinephrine remains standard first-choice vasopressor. If unavailable, immediately deploy Vasopressin (0.03 units/min fixed) or Epinephrine infusion as direct titration alternative.',
    pharmacistVerificationRequired: true,
    safetyChecklist: [
      'Administer through central venous catheter (CVC) whenever possible to prevent peripheral extravasation necrosis.',
      'Have Phentolamine mesylate antidote readily accessible in emergency pyxis for accidental extravasation.',
      'Arterial line blood pressure monitoring strongly recommended.'
    ],
    substitutes: [
      {
        id: 'sub-vasopressin-20units',
        name: 'Vasopressin Injection (20 units/ml)',
        equivalenceType: 'THERAPEUTIC_CLASS',
        dosageRatio: '0.03 units/minute fixed non-titrated continuous infusion',
        administrationRoute: 'Continuous Central Venous Infusion',
        clinicalNotes: 'Direct V1 receptor agonist causing systemic vasoconstriction independent of adrenergic receptors. Spares adrenergic burden during severe acidosis.',
        contraindications: ['Severe coronary artery disease (risk of myocardial ischemia)', 'Severe peripheral vascular occlusion'],
        relativeCostFactor: 1.80,
        fdaOrangeBookCode: 'AP',
      },
      {
        id: 'sub-epinephrine-1mg',
        name: 'Epinephrine IV Infusion (1mg/ml 4mg/250ml D5W)',
        equivalenceType: 'EMERGENCY_ALTERNATIVE',
        dosageRatio: '0.01 - 0.5 mcg/kg/min (titrate to MAP ≥ 65 mmHg)',
        administrationRoute: 'Continuous Central Venous Infusion',
        clinicalNotes: 'Potent mixed alpha-1 and beta-1/beta-2 adrenergic agonist. Increases both systemic vascular resistance and cardiac cardiac output.',
        contraindications: ['Uncorrected tachyarrhythmias', 'Severe hypovolemia prior to fluid resuscitation'],
        relativeCostFactor: 0.90,
        fdaOrangeBookCode: 'AP',
      },
      {
        id: 'sub-phenylephrine-10mg',
        name: 'Phenylephrine HCl (10mg/ml ampule)',
        equivalenceType: 'EMERGENCY_ALTERNATIVE',
        dosageRatio: '0.5 - 5 mcg/kg/min IV infusion',
        administrationRoute: 'Continuous IV Infusion',
        clinicalNotes: 'Pure alpha-1 agonist without direct inotropic cardiac stimulation. Useful when tachycardia limits Norepinephrine titration.',
        contraindications: ['Severe left ventricular systolic failure without tachycardia', 'Severe bradycardia'],
        relativeCostFactor: 0.75,
        fdaOrangeBookCode: 'AP',
      }
    ]
  }
];
