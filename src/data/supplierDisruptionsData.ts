import { SupplierDisruptionAlert } from '../types';

export const INITIAL_SUPPLIER_DISRUPTIONS: SupplierDisruptionAlert[] = [
  {
    id: 'disrupt-01',
    supplierId: 'sup-global-med',
    supplierName: 'Apex Health Logistics',
    title: 'Category 3 Hurricane Warning (Gulf Coast Sterile Fill Facility)',
    disruptionType: 'WEATHER_STORM',
    region: 'Gulf Coast / Southeast Maritime Corridor',
    severity: 'CRITICAL',
    impactSummary: 'Key sterilizer plant for IV Saline and Ceftriaxone halted operations for precautionary flood barrier deployment. Outbound freight delayed 5-7 business days.',
    estimatedDelayDays: 6,
    affectedCategories: ['Pharmaceuticals', 'Consumables'],
    alternativeSuppliers: [
      { id: 'sup-medline-direct', name: 'MediSupply Direct', leadTimeDays: 4, bufferCapacityPct: 85 },
      { id: 'sup-nordic-bio', name: 'BioCare Instruments', leadTimeDays: 6, bufferCapacityPct: 60 }
    ],
    active: true,
  },
  {
    id: 'disrupt-02',
    supplierId: 'sup-pureair',
    supplierName: 'PureAir Cryogenics',
    title: 'Regional Bulk Cryogenic Oxygen Tanker Driver Shortage',
    disruptionType: 'RAW_MATERIAL_SHORTAGE',
    region: 'Midwest Metro Transit Corridor',
    severity: 'HIGH',
    impactSummary: 'Liquid medical oxygen refilling cycles stretched from 48h turnarounds to 96h. On-site backup manifold switchover recommended.',
    estimatedDelayDays: 3,
    affectedCategories: ['Critical Care'],
    alternativeSuppliers: [
      { id: 'sup-cryo-midwest', name: 'Valley Gas & Cryo', leadTimeDays: 2, bufferCapacityPct: 92 }
    ],
    active: true,
  },
  {
    id: 'disrupt-03',
    supplierId: 'sup-biocare',
    supplierName: 'BioCare Instruments',
    title: 'Air Freight Cold-Chain Customs Hold (Import Lot Inspection)',
    disruptionType: 'REGULATORY_HALT',
    region: 'Chicago O’Hare International Cargo Terminal',
    severity: 'MODERATE',
    impactSummary: 'Secondary dry ice recharge initiated on viral diagnostic test kits. Inbound customs paperwork under FDA port expedited clearance review.',
    estimatedDelayDays: 2,
    affectedCategories: ['Diagnostics'],
    alternativeSuppliers: [
      { id: 'sup-medline-direct', name: 'MediSupply Direct', leadTimeDays: 3, bufferCapacityPct: 70 }
    ],
    active: true,
  }
];
