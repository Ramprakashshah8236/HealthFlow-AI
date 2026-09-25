export type HospitalStatus = 'STABLE' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL';
export type SupplyRisk = 'STABLE' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL';
export type SupplyCategory = 
  | 'Pharmaceuticals' 
  | 'Critical Care' 
  | 'PPE' 
  | 'Consumables' 
  | 'Diagnostics' 
  | 'Surgical & Trauma' 
  | 'Blood & Biologics';

export interface Coordinates {
  lat: number;
  lng: number;
  x: number; // 0-100 relative SVG coordinate
  y: number; // 0-100 relative SVG coordinate
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  region: string;
  beds: number;
  currentOccupancy: number; // Percentage, e.g. 96
  acuteIcuBeds: number;
  patientLoad: number;
  patientLoadTrend: 'RISING_FAST' | 'RISING' | 'STEADY' | 'DECLINING';
  riskScore: number; // 0 - 100
  riskLevel: HospitalStatus;
  contactPerson: string;
  phone: string;
  coordinates: Coordinates;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  region: string;
  capacityUnits: number;
  utilizedUnits: number;
  coldChainSupported: boolean;
  coordinates: Coordinates;
}

export interface Supplier {
  id: string;
  name: string;
  categories: SupplyCategory[];
  leadTimeDays: number;
  reliabilityRating: number; // 0 - 100
  location: string;
  coordinates: Coordinates;
}

export interface MedicalSupply {
  id: string;
  name: string;
  category: SupplyCategory;
  unit: string;
  unitCost: number;
  shelfLifeDays: number;
  isColdChain: boolean;
  defaultMinBufferDays: number;
}

export interface HospitalInventory {
  id: string;
  hospitalId: string;
  supplyId: string;
  currentStock: number;
  minStock: number;
  avgDailyConsumption: number;
  projectedDailyDemand: number;
  daysRemaining: number;
  riskLevel: SupplyRisk;
  history6Months: number[]; // e.g. [Apr, May, Jun, Jul, Aug, Sep]
}

export interface BatchRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  supplyId: string;
  supplyName: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
  unitCost: number;
  expectedUsageBeforeExpiry: number;
  excessQuantity: number;
  financialLossRisk: number;
  status: 'ACTIVE' | 'WARNING' | 'CRITICAL_EXPIRY' | 'QUARANTINED';
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  sourceType: 'SUPPLIER' | 'WAREHOUSE' | 'HOSPITAL';
  sourceName: string;
  sourceId: string;
  destinationType: 'HOSPITAL' | 'WAREHOUSE';
  destinationName: string;
  destinationId: string;
  supplyId: string;
  supplyName: string;
  quantity: number;
  status: 'IN_TRANSIT' | 'SCHEDULED' | 'DELAYED' | 'DELIVERED';
  dispatchDate: string;
  expectedDeliveryDate: string;
  delayDays: number;
  carrier: string;
}

export interface RedistributionRecommendation {
  id: string;
  sourceHospitalId: string;
  sourceHospitalName: string;
  sourceSurplus: number;
  destHospitalId: string;
  destHospitalName: string;
  destShortage: number;
  supplyId: string;
  supplyName: string;
  quantity: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
  distanceKm: number;
  estimatedHours: number;
  expiryRiskFactor: string;
  status: 'PENDING' | 'APPROVED' | 'DISPATCHED';
  approvedAt?: string;
}

export interface CrisisParameters {
  diseaseDemandIncreasePct: number; // 0 - 100
  supplierCapacityReductionPct: number; // 0 - 50
  transportDelayDays: number; // 0 - 10
  hospitalPatientLoadIncreasePct: number; // 0 - 100
}

export interface ColdChainSensor {
  id: string;
  storageUnit: string;
  facilityName: string;
  facilityId: string;
  sensorId: string;
  currentTemp: number;
  minSafeTemp: number;
  maxSafeTemp: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  lastCheck: string;
  history: { time: string; temp: number }[];
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  type: 'SHORTAGE' | 'DEMAND_SURGE' | 'EXPIRY' | 'SHIPMENT_DELAY' | 'COLD_CHAIN';
  facilityName: string;
  facilityId?: string;
  supplyName?: string;
  title: string;
  message: string;
  actionText?: string;
  actionTargetView?: string;
}

export interface SimulationSummary {
  criticalHospitalsBefore: number;
  criticalHospitalsAfter: number;
  suppliesAtRiskBefore: number;
  suppliesAtRiskAfter: number;
  avgDaysReserveBefore: number;
  avgDaysReserveAfter: number;
  newCriticalHospitals: string[];
  newCriticalSupplies: string[];
  affectedSuppliers: string[];
  urgentTransfersNeeded: number;
  runoutShifts: {
    hospitalName: string;
    supplyName: string;
    beforeDays: number;
    afterDays: number;
    shortageDate: string;
  }[];
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: 'gemini' | 'demo';
  dataPointsUsed?: string[];
}

export type UserRole = 
  | 'system_admin'
  | 'regional_director'
  | 'hospital_logistics_lead'
  | 'clinical_pharmacist'
  | 'supply_analyst';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedHospitalId?: string; // 'all' or hospital ID like 'h1'
  assignedHospitalName?: string;
  department?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  isCustomRole?: boolean;
}

export interface RolePermissions {
  canRunCrisisSimulation: boolean;
  canApproveRedistribution: boolean;
  canDispatchRedistribution: boolean;
  canQuarantineBatch: boolean;
  canResetSensorAlarm: boolean;
  canQueryAi: boolean;
  canViewAuditLogs: boolean;
  canManageUsers: boolean;
  badgeLabel: string;
  colorClass: string;
  badgeColor?: string;
  clearanceLevel: string;
}

export interface AuditLogEntry {
  logId: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: 'CRISIS_RUN' | 'TRANSFER_APPROVE' | 'TRANSFER_DISPATCH' | 'LOT_QUARANTINE' | 'ALARM_RESET' | 'AI_QUERY' | 'LOGIN' | 'ROLE_SWITCH' | 'DATA_IMPORT' | 'DATA_SWITCH' | 'DATA_EXPORT' | 'RECALL_TRIGGER' | 'RECALL_QUARANTINE' | 'SUBSTITUTION_PROTOCOL' | 'SUPPLIER_FAILOVER' | 'MANIFEST_GENERATE';
  resource: string;
  details: string;
  status: 'SUCCESS' | 'DENIED' | 'WARNING';
  clientIp?: string;
  hash?: string;
}

export type RecallClassification = 'CLASS_I' | 'CLASS_II' | 'CLASS_III';
export type RecallStatus = 'ACTIVE_RECALL' | 'QUARANTINED_ALL' | 'RESOLVED';

export interface RecallNotice {
  id: string;
  recallNumber: string; // e.g. "FDA-REC-2026-081"
  classification: RecallClassification;
  classificationLabel: string;
  supplyId: string;
  supplyName: string;
  affectedBatches: string[];
  issuingAuthority: 'FDA' | 'EMA' | 'CDC' | 'HHS' | 'INTERNAL_PHARMACOVIGILANCE';
  hazardDescription: string;
  clinicalImpactSummary: string;
  actionRequired: string;
  dateIssued: string;
  status: RecallStatus;
  affectedHospitalIds: string[];
  totalAffectedUnits: number;
  quarantinedUnits: number;
  estimatedPatientExposure: number;
  recommendedAlternativeSupplyId?: string;
}

export interface DrugSubstituteItem {
  id: string;
  name: string;
  matchedSupplyId?: string;
  equivalenceType: 'EXACT_EQUIVALENT' | 'THERAPEUTIC_CLASS' | 'EMERGENCY_ALTERNATIVE';
  dosageRatio: string;
  administrationRoute: string;
  clinicalNotes: string;
  contraindications: string[];
  relativeCostFactor: number;
  fdaOrangeBookCode: string; // e.g. "AB" or "AP" or "BX"
}

export interface ClinicalDrugSubstitution {
  id: string;
  primarySupplyId: string;
  primarySupplyName: string;
  category: SupplyCategory;
  indications: string[];
  substitutes: DrugSubstituteItem[];
  fdaGuidance: string;
  pharmacistVerificationRequired: boolean;
  safetyChecklist: string[];
}

export interface SupplierDisruptionAlert {
  id: string;
  supplierId: string;
  supplierName: string;
  title: string;
  disruptionType: 'WEATHER_STORM' | 'GEOPOLITICAL_PORT' | 'REGULATORY_HALT' | 'RAW_MATERIAL_SHORTAGE';
  region: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  impactSummary: string;
  estimatedDelayDays: number;
  affectedCategories: SupplyCategory[];
  alternativeSuppliers: { id: string; name: string; leadTimeDays: number; bufferCapacityPct: number }[];
  active: boolean;
}

export interface TransferManifest {
  manifestNumber: string;
  transferId: string;
  timestamp: string;
  originFacility: string;
  destinationFacility: string;
  supplyName: string;
  quantity: number;
  unit: string;
  batchNumbers: string[];
  carrier: string;
  transportVehicleType: string;
  coldChainMonitored: boolean;
  targetTempRange?: string;
  authorizedBy: string;
  authorizedRole: string;
  digitalSignatureHash: string;
  securityClearanceCode: string;
  chainOfCustodyStages: {
    stage: 'ORIGIN_DISPATCH' | 'CARRIER_HANDOFF' | 'IN_TRANSIT_CHECK' | 'DESTINATION_RECEIPT';
    location: string;
    timestamp: string;
    verifiedBy: string;
    status: 'COMPLETED' | 'PENDING';
  }[];
}

export type DataMode = 'synthetic' | 'real';

export interface RealDataset {
  hospitals: Hospital[];
  supplies: MedicalSupply[];
  inventories: HospitalInventory[];
  batches: BatchRecord[];
  warehouses?: Warehouse[];
  suppliers?: Supplier[];
  importedAt?: string;
  datasetName?: string;
  sourceType?: 'CSV_UPLOAD' | 'JSON_RESTORE' | 'MANUAL_ENTRY' | 'SAMPLE_REAL';
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export type NavTab = 
  | 'dashboard' 
  | 'supplies' 
  | 'shortages' 
  | 'substitutions'
  | 'recalls'
  | 'waste' 
  | 'redistribution' 
  | 'crisis' 
  | 'network' 
  | 'cold-chain';

export interface TourStep {
  id: string;
  stepNumber: number;
  tab: NavTab;
  title: string;
  subtitle: string;
  rolePersona: string;
  description: string;
  whatToLookFor: string[];
  actionLabel: string;
  actionHint: string;
}
