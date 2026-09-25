import {
  Hospital,
  MedicalSupply,
  HospitalInventory,
  BatchRecord,
  SupplyCategory,
  HospitalStatus,
  SupplyRisk,
} from '../types';

/**
 * Robust CSV parser supporting quotes, commas, and multiline cells.
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleanText) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const rawHeaders = rows[0];
  const normalizedHeaders = rawHeaders.map(h => 
    h.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  const results: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj: Record<string, string> = {};
    for (let c = 0; c < normalizedHeaders.length; c++) {
      const key = normalizedHeaders[c];
      obj[key] = row[c] || '';
    }
    results.push(obj);
  }

  return results;
}

/**
 * Normalizes latitude and longitude into 0-100 relative SVG space
 */
export function mapGeoToSvgCoords(lat: number, lng: number): { x: number; y: number } {
  // Approximate standard bounding box or default normalize
  // US rough bounding box: lat 25 to 49, lng -125 to -67
  const minLat = 24.0;
  const maxLat = 50.0;
  const minLng = -125.0;
  const maxLng = -66.0;

  let x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;
  let y = ((maxLat - lat) / (maxLat - minLat)) * 80 + 10;

  x = Math.max(8, Math.min(92, Number(x.toFixed(1))));
  y = Math.max(8, Math.min(92, Number(y.toFixed(1))));

  return { x, y };
}

/**
 * Converts parsed CSV rows into Hospital objects
 */
export function parseFacilitiesFromCSV(rows: Record<string, string>[]): Hospital[] {
  return rows.map((r, idx) => {
    const id = r.id || r.hospitalid || r.code?.toLowerCase() || `h-real-${idx + 1}`;
    const name = r.name || r.hospitalname || r.facilityname || `Medical Center ${idx + 1}`;
    const code = (r.code || r.shortcode || name.substring(0, 4).toUpperCase()).trim();
    const region = r.region || r.state || r.city || 'Regional Health Network';
    const beds = parseInt(r.beds || r.bedcount || r.totalbeds || '350', 10) || 350;
    const occupancy = parseInt(r.occupancy || r.currentoccupancy || '82', 10) || 82;
    const acuteIcuBeds = parseInt(r.icubeds || r.acuteicubeds || Math.round(beds * 0.15).toString(), 10) || 45;
    const patientLoad = parseInt(r.patientload || Math.round((beds * occupancy) / 100).toString(), 10) || 280;

    let lat = parseFloat(r.lat || r.latitude || '39.8283');
    let lng = parseFloat(r.lng || r.longitude || r.long || '-98.5795');
    if (isNaN(lat)) lat = 39.8 + (idx * 0.4);
    if (isNaN(lng)) lng = -98.5 + (idx * 0.5);

    const { x, y } = mapGeoToSvgCoords(lat, lng);

    let riskLevel: HospitalStatus = 'STABLE';
    if (occupancy >= 95) riskLevel = 'CRITICAL';
    else if (occupancy >= 88) riskLevel = 'HIGH_RISK';
    else if (occupancy >= 80) riskLevel = 'WARNING';

    return {
      id,
      name,
      code,
      region,
      beds,
      currentOccupancy: occupancy,
      acuteIcuBeds,
      patientLoad,
      patientLoadTrend: occupancy > 85 ? 'RISING' : 'STEADY',
      riskScore: Math.min(99, Math.max(10, Math.round(occupancy * 0.8))),
      riskLevel,
      contactPerson: r.contact || r.contactperson || 'Director of Pharmacy / Materials Lead',
      phone: r.phone || r.contactphone || '+1 (555) 019-2831',
      coordinates: { lat, lng, x, y },
    };
  });
}

/**
 * Converts parsed CSV rows into MedicalSupply objects
 */
export function parseSuppliesFromCSV(rows: Record<string, string>[]): MedicalSupply[] {
  const validCategories: SupplyCategory[] = [
    'Pharmaceuticals',
    'Critical Care',
    'PPE',
    'Consumables',
    'Diagnostics',
    'Surgical & Trauma',
    'Blood & Biologics',
  ];

  return rows.map((r, idx) => {
    const id = r.id || r.supplyid || r.skuid || r.ndc || `sup-real-${idx + 1}`;
    const name = r.name || r.supplyname || r.itemname || `Medical Supply Item ${idx + 1}`;
    
    // Fuzzy match category
    const catInput = (r.category || '').toLowerCase();
    const matchedCategory = validCategories.find(c => c.toLowerCase() === catInput) ||
      (catInput.includes('pharma') || catInput.includes('drug') || catInput.includes('med') ? 'Pharmaceuticals' :
      catInput.includes('ppe') || catInput.includes('mask') || catInput.includes('glove') ? 'PPE' :
      catInput.includes('blood') || catInput.includes('plasma') ? 'Blood & Biologics' :
      catInput.includes('surg') || catInput.includes('trauma') ? 'Surgical & Trauma' :
      catInput.includes('diag') || catInput.includes('test') || catInput.includes('lab') ? 'Diagnostics' :
      catInput.includes('crit') || catInput.includes('icu') ? 'Critical Care' : 'Consumables');

    const unit = r.unit || r.unitofmeasure || 'units';
    const unitCost = parseFloat(r.unitcost || r.cost || r.price || '15.0') || 15.0;
    const shelfLifeDays = parseInt(r.shelflifedays || r.shelflife || '730', 10) || 730;
    const isColdChain = r.iscoldchain === 'true' || r.iscoldchain === '1' || r.coldchain === 'yes' || catInput.includes('blood') || catInput.includes('vaccine');
    const defaultMinBufferDays = parseInt(r.minbufferdays || r.bufferdays || '14', 10) || 14;

    return {
      id,
      name,
      category: matchedCategory,
      unit,
      unitCost,
      shelfLifeDays,
      isColdChain,
      defaultMinBufferDays,
    };
  });
}

/**
 * Converts parsed CSV rows into HospitalInventory objects
 */
export function parseInventoryFromCSV(
  rows: Record<string, string>[],
  existingSupplies: MedicalSupply[] = []
): HospitalInventory[] {
  return rows.map((r, idx) => {
    const hospitalId = r.hospitalid || r.facilityid || 'h1';
    const supplyId = r.supplyid || r.skuid || r.ndc || `sup-${idx + 1}`;
    const id = r.id || `inv-${hospitalId}-${supplyId}`;
    const currentStock = parseInt(r.currentstock || r.stock || r.onhand || '500', 10) || 500;
    const avgDailyConsumption = parseFloat(r.avgdailyconsumption || r.dailyburn || r.dailyconsumption || '25') || 25;
    const projectedDailyDemand = parseFloat(r.projecteddemand || avgDailyConsumption.toString()) || avgDailyConsumption;
    const minStock = parseInt(r.minstock || Math.round(avgDailyConsumption * 14).toString(), 10) || 350;

    const daysRemaining = avgDailyConsumption > 0 
      ? Number((currentStock / avgDailyConsumption).toFixed(1)) 
      : 999;

    let riskLevel: SupplyRisk = 'STABLE';
    if (daysRemaining <= 7) riskLevel = 'CRITICAL';
    else if (daysRemaining <= 12) riskLevel = 'HIGH_RISK';
    else if (daysRemaining <= 18) riskLevel = 'WARNING';

    // Generate balanced historical 6-month burn trajectory
    const base = avgDailyConsumption * 30;
    const history6Months = [
      Math.round(base * 0.95),
      Math.round(base * 0.98),
      Math.round(base * 1.02),
      Math.round(base * 1.05),
      Math.round(base * 0.97),
      Math.round(currentStock),
    ];

    return {
      id,
      hospitalId,
      supplyId,
      currentStock,
      minStock,
      avgDailyConsumption,
      projectedDailyDemand,
      daysRemaining,
      riskLevel,
      history6Months,
    };
  });
}

/**
 * Converts parsed CSV rows into BatchRecord objects for FEFO waste tracking
 */
export function parseBatchesFromCSV(
  rows: Record<string, string>[],
  hospitals: Hospital[] = [],
  supplies: MedicalSupply[] = []
): BatchRecord[] {
  const now = new Date();

  return rows.map((r, idx) => {
    const id = r.id || r.batchid || `lot-real-${idx + 1}`;
    const facilityId = r.facilityid || r.hospitalid || 'h1';
    const facility = hospitals.find(h => h.id === facilityId);
    const facilityName = facility ? facility.name : r.facilityname || 'General Hospital';

    const supplyId = r.supplyid || r.skuid || 'sup-1';
    const supply = supplies.find(s => s.id === supplyId);
    const supplyName = supply ? supply.name : r.supplyname || 'Medical Supply';
    const unitCost = supply?.unitCost || parseFloat(r.unitcost || '20.0') || 20.0;

    const batchNumber = r.batchnumber || r.lotnumber || r.lot || `LOT-${now.getFullYear()}-${(idx + 101)}`;
    const quantity = parseInt(r.quantity || r.qty || '250', 10) || 250;

    let expiryDate = r.expirydate || r.expirationdate || '';
    if (!expiryDate) {
      // Default to 45 days in future
      const future = new Date(now.getTime() + 45 * 86400000);
      expiryDate = future.toISOString().split('T')[0];
    }

    const expTime = new Date(expiryDate).getTime();
    const daysUntilExpiry = Math.max(1, Math.round((expTime - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Expected usage approximation
    const expectedUsage = Math.round(quantity * (daysUntilExpiry > 30 ? 1.0 : 0.6));
    const excessQuantity = Math.max(0, quantity - expectedUsage);
    const financialLossRisk = Number((excessQuantity * unitCost).toFixed(2));

    let status: BatchRecord['status'] = 'ACTIVE';
    if (daysUntilExpiry <= 14 && excessQuantity > 0) status = 'CRITICAL_EXPIRY';
    else if (daysUntilExpiry <= 30) status = 'WARNING';

    return {
      id,
      facilityId,
      facilityName,
      supplyId,
      supplyName,
      batchNumber,
      quantity,
      expiryDate,
      daysUntilExpiry,
      unitCost,
      expectedUsageBeforeExpiry: expectedUsage,
      excessQuantity,
      financialLossRisk,
      status,
    };
  });
}

// ==========================================
// SAMPLE REAL-WORLD HEALTHCARE DATASETS
// ==========================================

export const REAL_WORLD_SAMPLE_FACILITIES: Hospital[] = [
  {
    id: 'hosp-mayo-01',
    name: 'Mayo Clinic Hospital - Saint Marys Campus',
    code: 'MAYO-SM',
    region: 'Upper Midwest Region (Rochester, MN)',
    beds: 1265,
    currentOccupancy: 94,
    acuteIcuBeds: 160,
    patientLoad: 1189,
    patientLoadTrend: 'RISING',
    riskScore: 72,
    riskLevel: 'HIGH_RISK',
    contactPerson: 'Dr. Katherine Reynolds, PharmD (Chief Pharmacy Officer)',
    phone: '+1 (507) 284-2511',
    coordinates: { lat: 44.0234, lng: -92.4664, x: 52.4, y: 31.8 },
  },
  {
    id: 'hosp-cleveland-02',
    name: 'Cleveland Clinic Main Hospital Campus',
    code: 'CC-MAIN',
    region: 'Great Lakes Health Network (Cleveland, OH)',
    beds: 1400,
    currentOccupancy: 89,
    acuteIcuBeds: 180,
    patientLoad: 1246,
    patientLoadTrend: 'STEADY',
    riskScore: 64,
    riskLevel: 'HIGH_RISK',
    contactPerson: 'Marcus Thorne (Director of Clinical Materials)',
    phone: '+1 (216) 444-2200',
    coordinates: { lat: 41.5034, lng: -81.6212, x: 67.2, y: 39.5 },
  },
  {
    id: 'hosp-hopkins-03',
    name: 'The Johns Hopkins Hospital & Trauma Center',
    code: 'JHH-BALT',
    region: 'Mid-Atlantic Trauma Alliance (Baltimore, MD)',
    beds: 1162,
    currentOccupancy: 97,
    acuteIcuBeds: 175,
    patientLoad: 1127,
    patientLoadTrend: 'RISING_FAST',
    riskScore: 84,
    riskLevel: 'CRITICAL',
    contactPerson: 'Dr. Sarah Vance (Emergency Operations Director)',
    phone: '+1 (410) 955-5000',
    coordinates: { lat: 39.2974, lng: -76.5927, x: 74.6, y: 44.2 },
  },
  {
    id: 'hosp-mgh-04',
    name: 'Massachusetts General Hospital (Mass General)',
    code: 'MGH-BOS',
    region: 'New England Health System (Boston, MA)',
    beds: 1019,
    currentOccupancy: 91,
    acuteIcuBeds: 140,
    patientLoad: 927,
    patientLoadTrend: 'STEADY',
    riskScore: 58,
    riskLevel: 'WARNING',
    contactPerson: 'Robert Sterling (Senior Supply Chain VP)',
    phone: '+1 (617) 726-2000',
    coordinates: { lat: 42.3629, lng: -71.0691, x: 82.5, y: 36.1 },
  },
  {
    id: 'hosp-stanford-05',
    name: 'Stanford Health Care & Level 1 Adult Trauma Center',
    code: 'STAN-PALO',
    region: 'Pacific Bay Health Network (Palo Alto, CA)',
    beds: 613,
    currentOccupancy: 86,
    acuteIcuBeds: 92,
    patientLoad: 527,
    patientLoadTrend: 'STEADY',
    riskScore: 42,
    riskLevel: 'WARNING',
    contactPerson: 'Elena Wu, RN (Logistics & Surge Coordinator)',
    phone: '+1 (650) 723-4000',
    coordinates: { lat: 37.4338, lng: -122.1763, x: 14.8, y: 49.3 },
  },
];

export const REAL_WORLD_SAMPLE_SUPPLIES: MedicalSupply[] = [
  {
    id: 'ndc-0074-3252',
    name: 'Norepinephrine Bitartrate 4mg/4mL (Levophed)',
    category: 'Critical Care',
    unit: 'vials (4mL)',
    unitCost: 28.5,
    shelfLifeDays: 730,
    isColdChain: false,
    defaultMinBufferDays: 21,
  },
  {
    id: 'ndc-0069-4210',
    name: 'Propofol Injectable Emulsion 10mg/mL 100mL (Diprivan)',
    category: 'Pharmaceuticals',
    unit: 'bottles (100mL)',
    unitCost: 42.0,
    shelfLifeDays: 540,
    isColdChain: false,
    defaultMinBufferDays: 14,
  },
  {
    id: 'ndc-0409-7793',
    name: '0.9% Sodium Chloride IV Infusion 1000mL (Normal Saline)',
    category: 'Pharmaceuticals',
    unit: 'IV bags (1000mL)',
    unitCost: 6.8,
    shelfLifeDays: 1095,
    isColdChain: false,
    defaultMinBufferDays: 25,
  },
  {
    id: 'ndc-0002-8215',
    name: 'Insulin Glargine 100 units/mL 10mL (Lantus)',
    category: 'Pharmaceuticals',
    unit: 'vials (10mL)',
    unitCost: 88.0,
    shelfLifeDays: 730,
    isColdChain: true,
    defaultMinBufferDays: 18,
  },
  {
    id: 'sku-bld-oneg',
    name: 'PRBC Leukoreduced O-Negative Emergency Blood Units',
    category: 'Blood & Biologics',
    unit: 'units (350mL)',
    unitCost: 260.0,
    shelfLifeDays: 42,
    isColdChain: true,
    defaultMinBufferDays: 10,
  },
  {
    id: 'sku-3m-1860',
    name: '3M 1860 Health Care Particulate Respirator N95 Cone',
    category: 'PPE',
    unit: 'boxes (20ct)',
    unitCost: 34.0,
    shelfLifeDays: 1825,
    isColdChain: false,
    defaultMinBufferDays: 30,
  },
  {
    id: 'ndc-0409-6729',
    name: 'Heparin Sodium Injection 10,000 USP units/mL',
    category: 'Pharmaceuticals',
    unit: 'vials (5mL)',
    unitCost: 19.5,
    shelfLifeDays: 730,
    isColdChain: false,
    defaultMinBufferDays: 14,
  },
  {
    id: 'ndc-0078-0401',
    name: 'Ceftriaxone for Injection 1g (Rocephin broad-spectrum)',
    category: 'Pharmaceuticals',
    unit: 'vials (1g)',
    unitCost: 14.2,
    shelfLifeDays: 1095,
    isColdChain: false,
    defaultMinBufferDays: 15,
  },
];

export function generateRealWorldSampleInventory(
  customHospitals?: Hospital[],
  customSupplies?: MedicalSupply[]
): HospitalInventory[] {
  // If custom hospitals and supplies are given and different from default
  if (customHospitals && customHospitals.length > 0 && customSupplies && customSupplies.length > 0) {
    const isDefault =
      customHospitals.length === REAL_WORLD_SAMPLE_FACILITIES.length &&
      customHospitals[0].id === REAL_WORLD_SAMPLE_FACILITIES[0].id;
    if (!isDefault) {
      const invs: HospitalInventory[] = [];
      customHospitals.forEach(h => {
        customSupplies.forEach(s => {
          const daily = Math.max(5, Math.round((h.beds / 100) * (s.isColdChain ? 3 : 8)));
          const currentStock = Math.round(daily * (10 + Math.random() * 25));
          const minStock = Math.round(daily * 14);
          const daysRemaining = Number((currentStock / daily).toFixed(1));
          let riskLevel: SupplyRisk = 'STABLE';
          if (daysRemaining <= 7) riskLevel = 'CRITICAL';
          else if (daysRemaining <= 12) riskLevel = 'HIGH_RISK';
          else if (daysRemaining <= 18) riskLevel = 'WARNING';

          invs.push({
            id: `inv-${h.id}-${s.id}`,
            hospitalId: h.id,
            supplyId: s.id,
            currentStock,
            minStock,
            avgDailyConsumption: daily,
            projectedDailyDemand: daily,
            daysRemaining,
            riskLevel,
            history6Months: [daily * 28, daily * 29, daily * 30, daily * 31, daily * 30, currentStock],
          });
        });
      });
      return invs;
    }
  }

  const invs: HospitalInventory[] = [];

  // Mayo
  invs.push({
    id: 'inv-mayo-norepi',
    hospitalId: 'hosp-mayo-01',
    supplyId: 'ndc-0074-3252',
    currentStock: 320,
    minStock: 250,
    avgDailyConsumption: 24,
    projectedDailyDemand: 26,
    daysRemaining: 13.3,
    riskLevel: 'HIGH_RISK',
    history6Months: [710, 720, 735, 750, 715, 320],
  });
  invs.push({
    id: 'inv-mayo-saline',
    hospitalId: 'hosp-mayo-01',
    supplyId: 'ndc-0409-7793',
    currentStock: 2400,
    minStock: 1800,
    avgDailyConsumption: 85,
    projectedDailyDemand: 90,
    daysRemaining: 28.2,
    riskLevel: 'STABLE',
    history6Months: [2500, 2600, 2550, 2480, 2510, 2400],
  });
  invs.push({
    id: 'inv-mayo-oneg',
    hospitalId: 'hosp-mayo-01',
    supplyId: 'sku-bld-oneg',
    currentStock: 48,
    minStock: 50,
    avgDailyConsumption: 7,
    projectedDailyDemand: 8,
    daysRemaining: 6.9,
    riskLevel: 'CRITICAL',
    history6Months: [200, 210, 205, 195, 180, 48],
  });

  // Hopkins (Acute shortage)
  invs.push({
    id: 'inv-jhh-propofol',
    hospitalId: 'hosp-hopkins-03',
    supplyId: 'ndc-0069-4210',
    currentStock: 65,
    minStock: 200,
    avgDailyConsumption: 32,
    projectedDailyDemand: 36,
    daysRemaining: 2.0,
    riskLevel: 'CRITICAL',
    history6Months: [950, 960, 940, 890, 810, 65],
  });
  invs.push({
    id: 'inv-jhh-norepi',
    hospitalId: 'hosp-hopkins-03',
    supplyId: 'ndc-0074-3252',
    currentStock: 80,
    minStock: 220,
    avgDailyConsumption: 28,
    projectedDailyDemand: 30,
    daysRemaining: 2.9,
    riskLevel: 'CRITICAL',
    history6Months: [840, 830, 810, 790, 650, 80],
  });
  invs.push({
    id: 'inv-jhh-saline',
    hospitalId: 'hosp-hopkins-03',
    supplyId: 'ndc-0409-7793',
    currentStock: 1100,
    minStock: 1500,
    avgDailyConsumption: 92,
    projectedDailyDemand: 100,
    daysRemaining: 12.0,
    riskLevel: 'HIGH_RISK',
    history6Months: [2800, 2750, 2700, 2600, 2400, 1100],
  });

  // Cleveland (Surplus donor)
  invs.push({
    id: 'inv-cc-propofol',
    hospitalId: 'hosp-cleveland-02',
    supplyId: 'ndc-0069-4210',
    currentStock: 980,
    minStock: 240,
    avgDailyConsumption: 22,
    projectedDailyDemand: 22,
    daysRemaining: 44.5,
    riskLevel: 'STABLE',
    history6Months: [650, 670, 720, 810, 920, 980],
  });
  invs.push({
    id: 'inv-cc-norepi',
    hospitalId: 'hosp-cleveland-02',
    supplyId: 'ndc-0074-3252',
    currentStock: 720,
    minStock: 210,
    avgDailyConsumption: 18,
    projectedDailyDemand: 18,
    daysRemaining: 40.0,
    riskLevel: 'STABLE',
    history6Months: [540, 560, 600, 650, 680, 720],
  });

  // MGH
  invs.push({
    id: 'inv-mgh-insulin',
    hospitalId: 'hosp-mgh-04',
    supplyId: 'ndc-0002-8215',
    currentStock: 210,
    minStock: 150,
    avgDailyConsumption: 12,
    projectedDailyDemand: 13,
    daysRemaining: 17.5,
    riskLevel: 'WARNING',
    history6Months: [360, 350, 370, 365, 340, 210],
  });

  // Stanford
  invs.push({
    id: 'inv-stan-n95',
    hospitalId: 'hosp-stanford-05',
    supplyId: 'sku-3m-1860',
    currentStock: 1450,
    minStock: 600,
    avgDailyConsumption: 35,
    projectedDailyDemand: 38,
    daysRemaining: 41.4,
    riskLevel: 'STABLE',
    history6Months: [1100, 1150, 1200, 1300, 1380, 1450],
  });

  return invs;
}

export function generateRealWorldSampleBatches(
  customHospitals?: Hospital[],
  customSupplies?: MedicalSupply[]
): BatchRecord[] {
  const now = new Date();
  const dateInDays = (days: number) => new Date(now.getTime() + days * 86400000).toISOString().split('T')[0];

  // If custom hospitals and supplies are given and different from default
  if (customHospitals && customHospitals.length > 0 && customSupplies && customSupplies.length > 0) {
    const isDefault =
      customHospitals.length === REAL_WORLD_SAMPLE_FACILITIES.length &&
      customHospitals[0].id === REAL_WORLD_SAMPLE_FACILITIES[0].id;
    if (!isDefault) {
      const batches: BatchRecord[] = [];
      customHospitals.slice(0, 5).forEach((h, hIdx) => {
        const s = customSupplies[hIdx % customSupplies.length];
        const days = 10 + hIdx * 12;
        const qty = 150 + hIdx * 40;
        const excess = 70 + hIdx * 40;
        const cost = s.unitCost || 25;
        batches.push({
          id: `lot-custom-${h.id}-${s.id}`,
          facilityId: h.id,
          facilityName: h.name,
          supplyId: s.id,
          supplyName: s.name,
          batchNumber: `LOT-${h.code || 'FAC'}-2026-${100 + hIdx}`,
          quantity: qty,
          expiryDate: dateInDays(days),
          daysUntilExpiry: days,
          unitCost: cost,
          expectedUsageBeforeExpiry: 80,
          excessQuantity: excess,
          financialLossRisk: excess * cost,
          status: days <= 15 ? 'CRITICAL_EXPIRY' : days <= 30 ? 'WARNING' : 'ACTIVE',
        });
      });
      return batches;
    }
  }

  return [
    {
      id: 'lot-real-101',
      facilityId: 'hosp-cleveland-02',
      facilityName: 'Cleveland Clinic Main Hospital Campus',
      supplyId: 'ndc-0069-4210',
      supplyName: 'Propofol Injectable Emulsion 10mg/mL 100mL (Diprivan)',
      batchNumber: 'LOT-CC-2026-B819',
      quantity: 340,
      expiryDate: dateInDays(22),
      daysUntilExpiry: 22,
      unitCost: 42.0,
      expectedUsageBeforeExpiry: 120,
      excessQuantity: 220,
      financialLossRisk: 9240.0,
      status: 'WARNING',
    },
    {
      id: 'lot-real-102',
      facilityId: 'hosp-mayo-01',
      facilityName: 'Mayo Clinic Hospital - Saint Marys Campus',
      supplyId: 'sku-bld-oneg',
      supplyName: 'PRBC Leukoreduced O-Negative Emergency Blood Units',
      batchNumber: 'BLD-ARC-89410',
      quantity: 18,
      expiryDate: dateInDays(8),
      daysUntilExpiry: 8,
      unitCost: 260.0,
      expectedUsageBeforeExpiry: 8,
      excessQuantity: 10,
      financialLossRisk: 2600.0,
      status: 'CRITICAL_EXPIRY',
    },
    {
      id: 'lot-real-103',
      facilityId: 'hosp-mgh-04',
      facilityName: 'Massachusetts General Hospital (Mass General)',
      supplyId: 'ndc-0002-8215',
      supplyName: 'Insulin Glargine 100 units/mL 10mL (Lantus)',
      batchNumber: 'LOT-LANT-94302',
      quantity: 85,
      expiryDate: dateInDays(29),
      daysUntilExpiry: 29,
      unitCost: 88.0,
      expectedUsageBeforeExpiry: 45,
      excessQuantity: 40,
      financialLossRisk: 3520.0,
      status: 'WARNING',
    },
  ];
}

// Download helpers
export const CSV_TEMPLATES = {
  facilities: `id,name,code,region,beds,currentOccupancy,acuteIcuBeds,contactPerson,phone,lat,lng
hosp-1,St. Marys Regional Hospital,SMRH,Northeast,450,88,60,Dr. John Miller,+1 (555) 234-5678,41.8781,-87.6298
hosp-2,Memorial Healthcare Center,MHC,Midwest,320,94,40,Sarah Connor,+1 (555) 345-6789,42.3314,-83.0458
hosp-3,Valley Trauma & Surgical Hospital,VTSH,Southwest,510,79,75,David Chen,+1 (555) 456-7890,39.7392,-104.9903`,

  supplies: `id,name,category,unit,unitCost,shelfLifeDays,isColdChain,defaultMinBufferDays
sup-01,Norepinephrine Bitartrate 4mg/4mL,Critical Care,vials (4mL),28.50,730,false,21
sup-02,Propofol Injectable 10mg/mL 100mL,Pharmaceuticals,bottles (100mL),42.00,540,false,14
sup-03,0.9% Sodium Chloride IV 1000mL,Pharmaceuticals,bags (1000mL),6.80,1095,false,25
sup-04,O-Negative PRBC Blood Units,Blood & Biologics,units (350mL),260.00,42,true,10
sup-05,N95 Particulate Respirator Masks,PPE,boxes (20ct),34.00,1825,false,30`,

  inventory: `hospitalId,supplyId,currentStock,avgDailyConsumption,minStock
hosp-1,sup-01,65,12,180
hosp-1,sup-02,320,18,200
hosp-2,sup-01,240,8,120
hosp-2,sup-02,40,15,150
hosp-3,sup-03,1400,65,1200`,

  batches: `batchNumber,facilityId,supplyId,quantity,expiryDate,unitCost
LOT-2026-091,hosp-1,sup-02,120,2026-10-15,42.00
LOT-2026-092,hosp-2,sup-01,80,2026-10-05,28.50
BLD-ARC-541,hosp-1,sup-04,14,2026-09-28,260.00`,
};

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename: string, data: unknown): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
