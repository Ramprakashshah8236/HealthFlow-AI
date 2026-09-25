import {
  Hospital,
  Warehouse,
  Supplier,
  MedicalSupply,
  HospitalInventory,
  BatchRecord,
  Shipment,
  ColdChainSensor,
} from '../types';

export const INITIAL_SUPPLIES: MedicalSupply[] = [
  {
    id: 'sup-1',
    name: 'IV Fluids (0.9% Normal Saline 1000ml)',
    category: 'Pharmaceuticals',
    unit: 'bags (1000ml)',
    unitCost: 8.5,
    shelfLifeDays: 730,
    isColdChain: false,
    defaultMinBufferDays: 14,
  },
  {
    id: 'sup-2',
    name: 'Oxygen Cylinders (Medical Grade Size E)',
    category: 'Critical Care',
    unit: 'cylinders',
    unitCost: 45.0,
    shelfLifeDays: 1825,
    isColdChain: false,
    defaultMinBufferDays: 10,
  },
  {
    id: 'sup-3',
    name: 'PPE Kits (Sterile Level 3 Impermeable)',
    category: 'PPE',
    unit: 'kits',
    unitCost: 22.0,
    shelfLifeDays: 1095,
    isColdChain: false,
    defaultMinBufferDays: 15,
  },
  {
    id: 'sup-4',
    name: 'Syringes (5ml Luer Lock Safety)',
    category: 'Consumables',
    unit: 'boxes (100ct)',
    unitCost: 18.0,
    shelfLifeDays: 1825,
    isColdChain: false,
    defaultMinBufferDays: 12,
  },
  {
    id: 'sup-5',
    name: 'Surgical Gloves (Nitrile Powder-Free)',
    category: 'PPE',
    unit: 'boxes (100ct)',
    unitCost: 14.5,
    shelfLifeDays: 1095,
    isColdChain: false,
    defaultMinBufferDays: 14,
  },
  {
    id: 'sup-6',
    name: 'Face Masks (N95 NIOSH Certified)',
    category: 'PPE',
    unit: 'boxes (50ct)',
    unitCost: 32.0,
    shelfLifeDays: 1825,
    isColdChain: false,
    defaultMinBufferDays: 14,
  },
  {
    id: 'sup-7',
    name: 'Diagnostic Kits (Multiplex Viral PCR/Ag)',
    category: 'Diagnostics',
    unit: 'test kits (25ct)',
    unitCost: 85.0,
    shelfLifeDays: 180,
    isColdChain: true,
    defaultMinBufferDays: 20,
  },
  {
    id: 'sup-8',
    name: 'Antibiotic Supplies (Ceftriaxone IV 1g)',
    category: 'Pharmaceuticals',
    unit: 'vials',
    unitCost: 24.0,
    shelfLifeDays: 730,
    isColdChain: false,
    defaultMinBufferDays: 14,
  },
  {
    id: 'sup-9',
    name: 'Blood Collection Tubes (EDTA K2 Vacutainer)',
    category: 'Diagnostics',
    unit: 'trays (100ct)',
    unitCost: 28.0,
    shelfLifeDays: 365,
    isColdChain: false,
    defaultMinBufferDays: 15,
  },
  {
    id: 'sup-10',
    name: 'Emergency Medical Kits (Level 1 Trauma)',
    category: 'Critical Care',
    unit: 'sealed packs',
    unitCost: 240.0,
    shelfLifeDays: 730,
    isColdChain: false,
    defaultMinBufferDays: 8,
  },
  {
    id: 'sup-11',
    name: 'Scalpel Blades & Suture Packs',
    category: 'Surgical & Trauma',
    unit: 'sterile packs',
    unitCost: 38.0,
    shelfLifeDays: 1460,
    isColdChain: false,
    defaultMinBufferDays: 10,
  },
  {
    id: 'sup-12',
    name: 'Infusion Sets & Precision IV Tubing',
    category: 'Consumables',
    unit: 'packs (20ct)',
    unitCost: 29.0,
    shelfLifeDays: 1095,
    isColdChain: false,
    defaultMinBufferDays: 12,
  },
  {
    id: 'sup-13',
    name: 'Packed Red Blood Cells (O-Negative Reserve)',
    category: 'Blood & Biologics',
    unit: 'plasma units',
    unitCost: 210.0,
    shelfLifeDays: 42,
    isColdChain: true,
    defaultMinBufferDays: 7,
  },
  {
    id: 'sup-14',
    name: 'Antiseptic Solution (Chlorhexidine 4%)',
    category: 'Consumables',
    unit: 'bottles (500ml)',
    unitCost: 12.0,
    shelfLifeDays: 730,
    isColdChain: false,
    defaultMinBufferDays: 14,
  },
  {
    id: 'sup-15',
    name: 'Refrigerated Insulin (Regular Human 100U)',
    category: 'Pharmaceuticals',
    unit: 'vials (10ml)',
    unitCost: 65.0,
    shelfLifeDays: 365,
    isColdChain: true,
    defaultMinBufferDays: 18,
  },
];

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Metro General Hospital',
    code: 'MGH-01',
    region: 'Central Metro Hub',
    beds: 680,
    currentOccupancy: 96,
    acuteIcuBeds: 72,
    patientLoad: 653,
    patientLoadTrend: 'RISING_FAST',
    riskScore: 88,
    riskLevel: 'CRITICAL',
    contactPerson: 'Dr. Marcus Vance, Chief Medical Logistics',
    phone: '+1 (555) 019-2831',
    coordinates: { lat: 40.7128, lng: -74.006, x: 48, y: 52 },
  },
  {
    id: 'hosp-2',
    name: 'St. Jude Medical Center',
    code: 'SJM-02',
    region: 'Central City West',
    beds: 450,
    currentOccupancy: 78,
    acuteIcuBeds: 40,
    patientLoad: 351,
    patientLoadTrend: 'STEADY',
    riskScore: 22,
    riskLevel: 'STABLE',
    contactPerson: 'Elena Rostova, Supply Director',
    phone: '+1 (555) 019-5482',
    coordinates: { lat: 40.7589, lng: -73.9851, x: 38, y: 44 },
  },
  {
    id: 'hosp-3',
    name: 'Memorial Healthcare Complex',
    code: 'MHC-03',
    region: 'River Valley Sector',
    beds: 520,
    currentOccupancy: 88,
    acuteIcuBeds: 48,
    patientLoad: 458,
    patientLoadTrend: 'RISING',
    riskScore: 68,
    riskLevel: 'HIGH_RISK',
    contactPerson: 'David Chen, PharmD',
    phone: '+1 (555) 019-8921',
    coordinates: { lat: 40.7282, lng: -73.7949, x: 68, y: 58 },
  },
  {
    id: 'hosp-4',
    name: 'North Valley Clinic & Infirmary',
    code: 'NVC-04',
    region: 'North Ridge Corridor',
    beds: 180,
    currentOccupancy: 74,
    acuteIcuBeds: 16,
    patientLoad: 133,
    patientLoadTrend: 'STEADY',
    riskScore: 61,
    riskLevel: 'WARNING',
    contactPerson: 'Sarah Jenkins, Operations Lead',
    phone: '+1 (555) 019-3312',
    coordinates: { lat: 40.8501, lng: -73.8662, x: 55, y: 22 },
  },
  {
    id: 'hosp-5',
    name: 'Riverside Community Hospital',
    code: 'RCH-05',
    region: 'Riverside Waterway',
    beds: 310,
    currentOccupancy: 82,
    acuteIcuBeds: 28,
    patientLoad: 254,
    patientLoadTrend: 'STEADY',
    riskScore: 35,
    riskLevel: 'STABLE',
    contactPerson: 'Michael O’Connor, RN',
    phone: '+1 (555) 019-6744',
    coordinates: { lat: 40.6782, lng: -73.9442, x: 42, y: 72 },
  },
  {
    id: 'hosp-6',
    name: 'University Teaching Hospital',
    code: 'UTH-06',
    region: 'Academic East District',
    beds: 750,
    currentOccupancy: 91,
    acuteIcuBeds: 80,
    patientLoad: 682,
    patientLoadTrend: 'RISING',
    riskScore: 74,
    riskLevel: 'HIGH_RISK',
    contactPerson: 'Prof. Ananya Patel, VP Clinical Ops',
    phone: '+1 (555) 019-9941',
    coordinates: { lat: 40.7831, lng: -73.9712, x: 70, y: 36 },
  },
  {
    id: 'hosp-7',
    name: 'Westside Regional Medical',
    code: 'WRM-07',
    region: 'West District Bay',
    beds: 420,
    currentOccupancy: 85,
    acuteIcuBeds: 36,
    patientLoad: 357,
    patientLoadTrend: 'STEADY',
    riskScore: 42,
    riskLevel: 'WARNING',
    contactPerson: 'Robert Gomez, Materiel Mgmt',
    phone: '+1 (555) 019-1288',
    coordinates: { lat: 40.7484, lng: -74.0324, x: 26, y: 55 },
  },
  {
    id: 'hosp-8',
    name: 'Hope Children’s Hospital',
    code: 'HCH-08',
    region: 'Metro South Campus',
    beds: 260,
    currentOccupancy: 79,
    acuteIcuBeds: 32,
    patientLoad: 205,
    patientLoadTrend: 'STEADY',
    riskScore: 28,
    riskLevel: 'STABLE',
    contactPerson: 'Dr. Clara Thorne, Pediatric Chair',
    phone: '+1 (555) 019-4501',
    coordinates: { lat: 40.6401, lng: -74.0152, x: 34, y: 84 },
  },
  {
    id: 'hosp-9',
    name: 'Pinecrest Health Pavilion',
    code: 'PHP-09',
    region: 'Pinecrest Suburbs',
    beds: 210,
    currentOccupancy: 68,
    acuteIcuBeds: 18,
    patientLoad: 143,
    patientLoadTrend: 'DECLINING',
    riskScore: 19,
    riskLevel: 'STABLE',
    contactPerson: 'Thomas Lee, Facility Director',
    phone: '+1 (555) 019-7723',
    coordinates: { lat: 40.6121, lng: -73.8291, x: 80, y: 80 },
  },
  {
    id: 'hosp-10',
    name: 'Highland Trauma Center',
    code: 'HTC-10',
    region: 'Highland Ridge',
    beds: 390,
    currentOccupancy: 94,
    acuteIcuBeds: 44,
    patientLoad: 367,
    patientLoadTrend: 'RISING_FAST',
    riskScore: 82,
    riskLevel: 'CRITICAL',
    contactPerson: 'Karen Brody, Emergency Coordinator',
    phone: '+1 (555) 019-9014',
    coordinates: { lat: 40.8692, lng: -73.9102, x: 62, y: 15 },
  },
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Central State Medical Depot',
    code: 'CSMD-WH01',
    region: 'Central Crossroads Logistics Park',
    capacityUnits: 250000,
    utilizedUnits: 178000,
    coldChainSupported: true,
    coordinates: { lat: 40.735, lng: -73.95, x: 50, y: 40 },
  },
  {
    id: 'wh-2',
    name: 'North Coast Logistics Hub',
    code: 'NCLH-WH02',
    region: 'North Freight Terminal',
    capacityUnits: 180000,
    utilizedUnits: 122000,
    coldChainSupported: true,
    coordinates: { lat: 40.835, lng: -73.91, x: 65, y: 25 },
  },
  {
    id: 'wh-3',
    name: 'East Valley Strategic Reserve',
    code: 'EVSR-WH03',
    region: 'East Valley Industrial Belt',
    capacityUnits: 200000,
    utilizedUnits: 145000,
    coldChainSupported: false,
    coordinates: { lat: 40.695, lng: -73.85, x: 75, y: 65 },
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-co-1',
    name: 'MedVance Pharma Industries',
    categories: ['Pharmaceuticals', 'Critical Care'],
    leadTimeDays: 4,
    reliabilityRating: 94,
    location: 'Ridgefield Bioscience Park',
    coordinates: { lat: 40.92, lng: -74.15, x: 15, y: 18 },
  },
  {
    id: 'sup-co-2',
    name: 'BioTech Supplies Co.',
    categories: ['Diagnostics', 'Blood & Biologics'],
    leadTimeDays: 5,
    reliabilityRating: 91,
    location: 'Cambridge Harbor East',
    coordinates: { lat: 40.88, lng: -73.72, x: 88, y: 16 },
  },
  {
    id: 'sup-co-3',
    name: 'Global Oxygen Corp',
    categories: ['Critical Care'],
    leadTimeDays: 2,
    reliabilityRating: 98,
    location: 'Metropolitan Cryogenic Plant',
    coordinates: { lat: 40.65, lng: -74.18, x: 12, y: 68 },
  },
  {
    id: 'sup-co-4',
    name: 'Precision Surgical Ltd.',
    categories: ['Surgical & Trauma'],
    leadTimeDays: 6,
    reliabilityRating: 88,
    location: 'High Precision Tech Corridor',
    coordinates: { lat: 40.79, lng: -74.22, x: 10, y: 35 },
  },
  {
    id: 'sup-co-5',
    name: 'Apex Diagnostics Global',
    categories: ['Diagnostics'],
    leadTimeDays: 4,
    reliabilityRating: 92,
    location: 'Tech Valley Hub',
    coordinates: { lat: 40.61, lng: -73.98, x: 45, y: 92 },
  },
  {
    id: 'sup-co-6',
    name: 'PureSterile Disposables',
    categories: ['PPE', 'Consumables'],
    leadTimeDays: 3,
    reliabilityRating: 96,
    location: 'Jersey Industrial Parkway',
    coordinates: { lat: 40.71, lng: -74.12, x: 22, y: 78 },
  },
  {
    id: 'sup-co-7',
    name: 'NovaCare Medical Equipment',
    categories: ['Consumables', 'Critical Care'],
    leadTimeDays: 5,
    reliabilityRating: 89,
    location: 'Queens Logistics Gateway',
    coordinates: { lat: 40.76, lng: -73.78, x: 85, y: 48 },
  },
  {
    id: 'sup-co-8',
    name: 'PharmaFlow Logistics Alliance',
    categories: ['Pharmaceuticals', 'Blood & Biologics'],
    leadTimeDays: 3,
    reliabilityRating: 95,
    location: 'Mid-Atlantic Transit Zone',
    coordinates: { lat: 40.68, lng: -74.05, x: 28, y: 90 },
  },
];

// Helper to generate 6 months of historical consumption
function generateHistoricalUsage(avg: number, variance = 0.15): number[] {
  return [
    Math.round(avg * (1 + (Math.sin(1) * variance))),
    Math.round(avg * (1 + (Math.sin(2) * variance))),
    Math.round(avg * (1 + (Math.sin(3) * variance))),
    Math.round(avg * (1 + (Math.sin(4) * variance))),
    Math.round(avg * (1 + (Math.sin(5) * variance))),
    Math.round(avg),
  ];
}

// Generate realistic inventory for all 10 hospitals across 15 supplies
export function generateInitialInventory(): HospitalInventory[] {
  const inventory: HospitalInventory[] = [];

  INITIAL_HOSPITALS.forEach(hosp => {
    INITIAL_SUPPLIES.forEach(sup => {
      // Base daily usage scale with hospital beds
      const bedFactor = hosp.beds / 400;
      let baseUsage = 20;

      if (sup.id === 'sup-1') baseUsage = 40; // IV Fluids high volume
      else if (sup.id === 'sup-2') baseUsage = 15; // Oxygen
      else if (sup.id === 'sup-3') baseUsage = 30; // PPE
      else if (sup.id === 'sup-4') baseUsage = 50; // Syringes
      else if (sup.id === 'sup-5') baseUsage = 45; // Gloves
      else if (sup.id === 'sup-6') baseUsage = 40; // Masks
      else if (sup.id === 'sup-7') baseUsage = 10; // Diagnostics
      else if (sup.id === 'sup-8') baseUsage = 18; // Antibiotics
      else if (sup.id === 'sup-9') baseUsage = 25; // Blood tubes
      else if (sup.id === 'sup-10') baseUsage = 4; // Trauma packs
      else if (sup.id === 'sup-11') baseUsage = 8;
      else if (sup.id === 'sup-12') baseUsage = 22;
      else if (sup.id === 'sup-13') baseUsage = 6;
      else if (sup.id === 'sup-14') baseUsage = 12;
      else if (sup.id === 'sup-15') baseUsage = 10;

      let avgDaily = Math.round(baseUsage * bedFactor);
      let currentStock = Math.round(avgDaily * 20); // Default ~20 days reserve
      let minStock = Math.round(avgDaily * sup.defaultMinBufferDays);

      // SPECIFIC DEMO CONDITIONS REQUIRED BY USER:
      // 1. Metro General Hospital (hosp-1) has CRITICAL shortage of IV Fluids (sup-1)
      //    "Current stock: 420, Average daily consumption: 65, Estimated days remaining: 6.5 days, Risk: CRITICAL"
      if (hosp.id === 'hosp-1' && sup.id === 'sup-1') {
        avgDaily = 65;
        currentStock = 420;
        minStock = 910; // 14 days min buffer
      }
      // Metro General also low on Oxygen
      if (hosp.id === 'hosp-1' && sup.id === 'sup-2') {
        avgDaily = 28;
        currentStock = 140; // 5 days remaining
        minStock = 280;
      }

      // 2. St. Jude Medical Center (hosp-2) has SURPLUS of IV Fluids (sup-1)
      //    "Surplus = 700 IV Fluid units, 1400 units on hand, 20/day usage"
      if (hosp.id === 'hosp-2' && sup.id === 'sup-1') {
        avgDaily = 20;
        currentStock = 1400; // 70 days reserve (surplus of > 700 units over safe 30-day buffer)
        minStock = 280;
      }

      // 3. Memorial Healthcare (hosp-3) Diagnostic Kits (sup-7) has 120 units
      if (hosp.id === 'hosp-3' && sup.id === 'sup-7') {
        avgDaily = 4;
        currentStock = 120; // 30 days stock, but expiring in 14 days!
        minStock = 80;
      }

      // 4. North Valley Clinic (hosp-4) low on Antibiotics (sup-8)
      if (hosp.id === 'hosp-4' && sup.id === 'sup-8') {
        avgDaily = 12;
        currentStock = 60; // 5 days remaining
        minStock = 168;
      }

      // 5. Highland Trauma Center (hosp-10) elevated usage
      if (hosp.id === 'hosp-10' && sup.id === 'sup-10') {
        avgDaily = 9;
        currentStock = 45; // 5 days
        minStock = 72;
      }

      const daysRemaining = Number((currentStock / (avgDaily || 1)).toFixed(1));
      let riskLevel: 'STABLE' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL' = 'STABLE';
      if (daysRemaining <= 7) riskLevel = 'CRITICAL';
      else if (daysRemaining <= 12) riskLevel = 'HIGH_RISK';
      else if (daysRemaining <= 18) riskLevel = 'WARNING';

      inventory.push({
        id: `inv-${hosp.id}-${sup.id}`,
        hospitalId: hosp.id,
        supplyId: sup.id,
        currentStock,
        minStock,
        avgDailyConsumption: avgDaily,
        projectedDailyDemand: Math.round(avgDaily * (hosp.currentOccupancy / 80)),
        daysRemaining,
        riskLevel,
        history6Months: generateHistoricalUsage(avgDaily),
      });
    });
  });

  return inventory;
}

export const INITIAL_BATCH_RECORDS: BatchRecord[] = [
  {
    id: 'batch-01',
    facilityId: 'hosp-3',
    facilityName: 'Memorial Healthcare Complex',
    supplyId: 'sup-7',
    supplyName: 'Diagnostic Kits (Multiplex Viral PCR/Ag)',
    batchNumber: 'LOT-DX-2026-9812',
    quantity: 120,
    expiryDate: '2026-09-28', // 14 days from local simulated now
    daysUntilExpiry: 14,
    unitCost: 85.0,
    expectedUsageBeforeExpiry: 50, // 4/day * 12.5 days ≈ 50
    excessQuantity: 70, // 120 - 50 = 70 excess units!
    financialLossRisk: 5950, // 70 * $85
    status: 'CRITICAL_EXPIRY',
  },
  {
    id: 'batch-02',
    facilityId: 'hosp-1',
    facilityName: 'Metro General Hospital',
    supplyId: 'sup-13',
    supplyName: 'Packed Red Blood Cells (O-Negative Reserve)',
    batchNumber: 'LOT-BLD-09-441',
    quantity: 45,
    expiryDate: '2026-09-24',
    daysUntilExpiry: 10,
    unitCost: 210.0,
    expectedUsageBeforeExpiry: 35,
    excessQuantity: 10,
    financialLossRisk: 2100,
    status: 'WARNING',
  },
  {
    id: 'batch-03',
    facilityId: 'hosp-7',
    facilityName: 'Westside Regional Medical',
    supplyId: 'sup-15',
    supplyName: 'Refrigerated Insulin (Regular Human 100U)',
    batchNumber: 'LOT-INS-7729',
    quantity: 80,
    expiryDate: '2026-10-06',
    daysUntilExpiry: 22,
    unitCost: 65.0,
    expectedUsageBeforeExpiry: 55,
    excessQuantity: 25,
    financialLossRisk: 1625,
    status: 'WARNING',
  },
  {
    id: 'batch-04',
    facilityId: 'wh-1',
    facilityName: 'Central State Medical Depot',
    supplyId: 'sup-8',
    supplyName: 'Antibiotic Supplies (Ceftriaxone IV 1g)',
    batchNumber: 'LOT-ABX-8801',
    quantity: 400,
    expiryDate: '2026-10-15',
    daysUntilExpiry: 31,
    unitCost: 24.0,
    expectedUsageBeforeExpiry: 260,
    excessQuantity: 140,
    financialLossRisk: 3360,
    status: 'ACTIVE',
  },
  {
    id: 'batch-05',
    facilityId: 'hosp-5',
    facilityName: 'Riverside Community Hospital',
    supplyId: 'sup-1',
    supplyName: 'IV Fluids (0.9% Normal Saline 1000ml)',
    batchNumber: 'LOT-IV-2290',
    quantity: 250,
    expiryDate: '2026-11-20',
    daysUntilExpiry: 67,
    unitCost: 8.5,
    expectedUsageBeforeExpiry: 250,
    excessQuantity: 0,
    financialLossRisk: 0,
    status: 'ACTIVE',
  },
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'ship-101',
    trackingNumber: 'MED-TRK-98442',
    sourceType: 'SUPPLIER',
    sourceName: 'MedVance Pharma Industries',
    sourceId: 'sup-co-1',
    destinationType: 'HOSPITAL',
    destinationName: 'North Valley Clinic & Infirmary',
    destinationId: 'hosp-4',
    supplyId: 'sup-8',
    supplyName: 'Antibiotic Supplies (Ceftriaxone IV 1g)',
    quantity: 350,
    status: 'DELAYED',
    dispatchDate: '2026-09-09',
    expectedDeliveryDate: '2026-09-18', // Delayed 4 days from original 9/14
    delayDays: 4,
    carrier: 'PharmaRoute Express (Fleet 14)',
  },
  {
    id: 'ship-102',
    trackingNumber: 'MED-TRK-77120',
    sourceType: 'WAREHOUSE',
    sourceName: 'Central State Medical Depot',
    sourceId: 'wh-1',
    destinationType: 'HOSPITAL',
    destinationName: 'Metro General Hospital',
    destinationId: 'hosp-1',
    supplyId: 'sup-2',
    supplyName: 'Oxygen Cylinders (Medical Grade Size E)',
    quantity: 80,
    status: 'IN_TRANSIT',
    dispatchDate: '2026-09-14',
    expectedDeliveryDate: '2026-09-15',
    delayDays: 0,
    carrier: 'CryoTrans Logistics',
  },
  {
    id: 'ship-103',
    trackingNumber: 'MED-TRK-55419',
    sourceType: 'SUPPLIER',
    sourceName: 'PureSterile Disposables',
    sourceId: 'sup-co-6',
    destinationType: 'WAREHOUSE',
    destinationName: 'North Coast Logistics Hub',
    destinationId: 'wh-2',
    supplyId: 'sup-6',
    supplyName: 'Face Masks (N95 NIOSH Certified)',
    quantity: 1200,
    status: 'IN_TRANSIT',
    dispatchDate: '2026-09-13',
    expectedDeliveryDate: '2026-09-16',
    delayDays: 0,
    carrier: 'FastMed Cargo',
  },
  {
    id: 'ship-104',
    trackingNumber: 'MED-TRK-33291',
    sourceType: 'SUPPLIER',
    sourceName: 'Global Oxygen Corp',
    sourceId: 'sup-co-3',
    destinationType: 'HOSPITAL',
    destinationName: 'Highland Trauma Center',
    destinationId: 'hosp-10',
    supplyId: 'sup-2',
    supplyName: 'Oxygen Cylinders (Medical Grade Size E)',
    quantity: 60,
    status: 'SCHEDULED',
    dispatchDate: '2026-09-16',
    expectedDeliveryDate: '2026-09-18',
    delayDays: 0,
    carrier: 'CryoTrans Logistics',
  },
];

export const INITIAL_COLD_CHAIN_SENSORS: ColdChainSensor[] = [
  {
    id: 'sensor-cc-01',
    storageUnit: 'Central Depot - Vault 2 (Biologics)',
    facilityName: 'Central State Medical Depot',
    facilityId: 'wh-1',
    sensorId: 'IOT-TMP-991A',
    currentTemp: 8.7, // Outside 2-8°C safe range => Warning / Alarm
    minSafeTemp: 2.0,
    maxSafeTemp: 8.0,
    status: 'WARNING',
    lastCheck: '3 mins ago',
    history: [
      { time: '00:00', temp: 4.2 },
      { time: '04:00', temp: 4.8 },
      { time: '08:00', temp: 5.6 },
      { time: '12:00', temp: 6.9 },
      { time: '16:00', temp: 7.9 },
      { time: '20:00', temp: 8.7 },
    ],
  },
  {
    id: 'sensor-cc-02',
    storageUnit: 'Metro General - Blood Bank Cryo Bank',
    facilityName: 'Metro General Hospital',
    facilityId: 'hosp-1',
    sensorId: 'IOT-TMP-442B',
    currentTemp: 3.4,
    minSafeTemp: 2.0,
    maxSafeTemp: 6.0,
    status: 'NORMAL',
    lastCheck: '1 min ago',
    history: [
      { time: '00:00', temp: 3.2 },
      { time: '04:00', temp: 3.3 },
      { time: '08:00', temp: 3.5 },
      { time: '12:00', temp: 3.6 },
      { time: '16:00', temp: 3.4 },
      { time: '20:00', temp: 3.4 },
    ],
  },
  {
    id: 'sensor-cc-03',
    storageUnit: 'St. Jude - Vaccine Cold Room 1',
    facilityName: 'St. Jude Medical Center',
    facilityId: 'hosp-2',
    sensorId: 'IOT-TMP-118C',
    currentTemp: 4.1,
    minSafeTemp: 2.0,
    maxSafeTemp: 8.0,
    status: 'NORMAL',
    lastCheck: '5 mins ago',
    history: [
      { time: '00:00', temp: 4.0 },
      { time: '04:00', temp: 4.1 },
      { time: '08:00', temp: 4.2 },
      { time: '12:00', temp: 4.0 },
      { time: '16:00', temp: 4.1 },
      { time: '20:00', temp: 4.1 },
    ],
  },
  {
    id: 'sensor-cc-04',
    storageUnit: 'North Coast Hub - Deep Freeze Alpha',
    facilityName: 'North Coast Logistics Hub',
    facilityId: 'wh-2',
    sensorId: 'IOT-TMP-603D',
    currentTemp: -19.2,
    minSafeTemp: -25.0,
    maxSafeTemp: -15.0,
    status: 'NORMAL',
    lastCheck: '2 mins ago',
    history: [
      { time: '00:00', temp: -19.5 },
      { time: '04:00', temp: -19.3 },
      { time: '08:00', temp: -19.0 },
      { time: '12:00', temp: -18.8 },
      { time: '16:00', temp: -19.1 },
      { time: '20:00', temp: -19.2 },
    ],
  },
];
