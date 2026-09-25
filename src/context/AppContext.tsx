import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Hospital,
  Warehouse,
  Supplier,
  MedicalSupply,
  HospitalInventory,
  BatchRecord,
  Shipment,
  ColdChainSensor,
  RedistributionRecommendation,
  CrisisParameters,
  SimulationSummary,
  Alert,
  AiChatMessage,
  UserProfile,
  UserRole,
  RolePermissions,
  AuditLogEntry,
  OperationType,
  DataMode,
  RealDataset,
  RecallNotice,
  ClinicalDrugSubstitution,
  DrugSubstituteItem,
  SupplierDisruptionAlert,
  TransferManifest,
  NavTab,
} from '../types';
export type { NavTab } from '../types';
import {
  INITIAL_HOSPITALS,
  INITIAL_WAREHOUSES,
  INITIAL_SUPPLIERS,
  INITIAL_SUPPLIES,
  generateInitialInventory,
  INITIAL_BATCH_RECORDS,
  INITIAL_SHIPMENTS,
  INITIAL_COLD_CHAIN_SENSORS,
} from '../data/initialData';
import { INITIAL_RECALLS } from '../data/recallsData';
import { INITIAL_SUBSTITUTIONS } from '../data/substitutionsData';
import { INITIAL_SUPPLIER_DISRUPTIONS } from '../data/supplierDisruptionsData';
import { TOUR_STEPS } from '../data/tourData';
import {
  calculateDaysRemaining,
  getSupplyRiskLevel,
  calculateHospitalRisk,
  detectExpiringBatches,
  calculateRedistributions,
  simulateCrisisScenario,
  generateLiveAlerts,
} from '../services/calculationEngine';
import { askHealthFlowAI } from '../services/aiAssistantService';
import {
  DEFAULT_USER,
  PREDEFINED_PROFILES,
  getRolePermissions,
  logAuditEvent,
  testFirebaseConnection,
  fetchRecentAuditLogs,
  handleFirestoreError,
  saveRealDatasetToFirestore,
  fetchRealDatasetFromFirestore,
  auth,
} from '../services/firebase';
import {
  REAL_WORLD_SAMPLE_FACILITIES,
  REAL_WORLD_SAMPLE_SUPPLIES,
  generateRealWorldSampleInventory,
  generateRealWorldSampleBatches,
} from '../utils/csvParser';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export interface AccessDeniedInfo {
  action: string;
  requiredRole: string;
  requiredClearance: string;
  reason: string;
}

interface AppContextType {
  hospitals: Hospital[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  supplies: MedicalSupply[];
  inventories: HospitalInventory[];
  batches: BatchRecord[];
  shipments: Shipment[];
  coldSensors: ColdChainSensor[];
  redistributions: RedistributionRecommendation[];
  alerts: Alert[];
  approvedTransfers: RedistributionRecommendation[];

  // Clinical Recalls & Substitutions & Logistics
  recalls: RecallNotice[];
  substitutions: ClinicalDrugSubstitution[];
  supplierDisruptions: SupplierDisruptionAlert[];
  selectedManifest: TransferManifest | null;
  isManifestModalOpen: boolean;
  quarantineRecallBatches: (recallId: string) => void;
  triggerSimulatedRecall: () => void;
  authorizeSubstitutionProtocol: (subGroup: ClinicalDrugSubstitution, chosenSub: DrugSubstituteItem, hospitalId?: string) => void;
  activateSupplierFailover: (disruptionId: string, altSupplierId: string) => void;
  generateManifestForTransfer: (recom: RedistributionRecommendation) => void;
  closeManifestModal: () => void;

  // Interactive Demo & Guided Tour System
  isDemoGuideOpen: boolean;
  setIsDemoGuideOpen: (open: boolean) => void;
  activeTourStep: number | null;
  startGuidedTour: (stepIndex?: number) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  exitGuidedTour: () => void;
  
  // Auth & RBAC Security
  currentUser: UserProfile;
  currentPermissions: RolePermissions;
  switchRole: (role: UserRole) => void;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  auditLogs: AuditLogEntry[];
  logSecurityAction: (
    action: AuditLogEntry['action'],
    resource: string,
    details: string,
    status?: 'SUCCESS' | 'DENIED' | 'WARNING'
  ) => void;
  accessDeniedModal: AccessDeniedInfo | null;
  clearAccessDenied: () => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;
  isSecurityModalOpen: boolean;
  setIsSecurityModalOpen: (open: boolean) => void;
  isRoleSwitchModalOpen: boolean;
  setIsRoleSwitchModalOpen: (open: boolean) => void;
  firebaseConnected: boolean;

  // Navigation & Modals
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedHospital: Hospital | null;
  setSelectedHospital: (hosp: Hospital | null) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  quickAiPrompt: string;
  setQuickAiPrompt: (prompt: string) => void;
  aiMessages: AiChatMessage[];
  isAiLoading: boolean;
  askAi: (prompt: string) => Promise<void>;
  resetAiChat: () => void;

  // Crisis Lab
  crisisParams: CrisisParameters;
  updateCrisisParams: (params: Partial<CrisisParameters>) => void;
  simulationResult: SimulationSummary | null;
  isSimulating: boolean;
  runCrisisSimulation: () => void;
  resetCrisis: () => void;

  // Demo Scenario
  isDemoScenarioActive: boolean;
  loadDemoScenario: () => void;
  resetToBaseline: () => void;

  // Real Data & Production Ingestion
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  realDataset: RealDataset | null;
  isRealDataModalOpen: boolean;
  setIsRealDataModalOpen: (open: boolean) => void;
  importRealDataset: (dataset: Partial<RealDataset>) => void;
  loadSampleRealDataset: () => void;
  saveRealDataToCloud: () => Promise<boolean>;
  loadRealDataFromCloud: () => Promise<boolean>;
  clearRealDataset: () => void;

  // Actions
  updateInventoryStock: (hospitalId: string, supplyId: string, newStock: number) => void;
  addBatchRecord: (batch: Omit<BatchRecord, 'id'>) => void;
  updateBatchRecord: (batchId: string, updates: Partial<BatchRecord>) => void;
  approveRedistribution: (recomId: string) => void;
  dismissAlert: (alertId: string) => void;
  acknowledgeSensorWarning: (sensorId: string) => void;
  bannerNotification: string | null;
  setBannerNotification: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    logId: 'log-sys-boot',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    userId: 'usr-admin-default',
    userEmail: 'ramprakashshah8236@gmail.com',
    userRole: 'system_admin',
    action: 'LOGIN',
    resource: 'HealthFlow AI Command Gateway',
    details: 'Authenticated via Firebase Zero-Trust with System Admin clearance (Level 5).',
    status: 'SUCCESS',
    hash: 'c3lzLWJvb3Q6c3VjY2Vz',
  },
  {
    logId: 'log-sec-init',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    userId: 'usr-admin-default',
    userEmail: 'ramprakashshah8236@gmail.com',
    userRole: 'system_admin',
    action: 'ROLE_SWITCH',
    resource: 'RBAC Policy Engine',
    details: 'Security policies loaded: 5 clearance tiers, HIPAA/ISO 27001 audit logging active.',
    status: 'SUCCESS',
    hash: 'cmJhYy1sb2FkZWQ6c3Vj',
  },
  {
    logId: 'log-telemetry-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    userId: 'system-agent',
    userEmail: 'telemetry-watchdog@healthflow.internal',
    userRole: 'system_admin',
    action: 'ALARM_RESET',
    resource: 'Sensor SN-CC-004 (North Valley)',
    details: 'Critical temperature breach detected (+8.4°C). Alert queued for clinical verification.',
    status: 'WARNING',
    hash: 'dGVsZW1ldHJ5LXdhcm46',
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth & RBAC state
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [accessDeniedModal, setAccessDeniedModal] = useState<AccessDeniedInfo | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isRoleSwitchModalOpen, setIsRoleSwitchModalOpen] = useState<boolean>(false);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);

  const currentPermissions = getRolePermissions(currentUser.role);

  // Real Data & Production State
  const [dataMode, setDataModeState] = useState<DataMode>(() => {
    return (localStorage.getItem('healthflow_data_mode') === 'real' ? 'real' : 'synthetic') as DataMode;
  });

  const [realDataset, setRealDataset] = useState<RealDataset | null>(() => {
    try {
      const saved = localStorage.getItem('healthflow_real_data_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isRealDataModalOpen, setIsRealDataModalOpen] = useState<boolean>(false);

  // Core operational data
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    const savedMode = localStorage.getItem('healthflow_data_mode');
    if (savedMode === 'real') {
      try {
        const saved = localStorage.getItem('healthflow_real_data_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.hospitals && parsed.hospitals.length > 0) return parsed.hospitals;
        }
      } catch { /* fallback */ }
    }
    return INITIAL_HOSPITALS;
  });

  const [warehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  const [supplies, setSupplies] = useState<MedicalSupply[]>(() => {
    const savedMode = localStorage.getItem('healthflow_data_mode');
    if (savedMode === 'real') {
      try {
        const saved = localStorage.getItem('healthflow_real_data_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.supplies && parsed.supplies.length > 0) return parsed.supplies;
        }
      } catch { /* fallback */ }
    }
    return INITIAL_SUPPLIES;
  });

  const [inventories, setInventories] = useState<HospitalInventory[]>(() => {
    const savedMode = localStorage.getItem('healthflow_data_mode');
    if (savedMode === 'real') {
      try {
        const saved = localStorage.getItem('healthflow_real_data_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.inventories && parsed.inventories.length > 0) return parsed.inventories;
        }
      } catch { /* fallback */ }
    }
    return generateInitialInventory();
  });

  const [batches, setBatches] = useState<BatchRecord[]>(() => {
    const savedMode = localStorage.getItem('healthflow_data_mode');
    if (savedMode === 'real') {
      try {
        const saved = localStorage.getItem('healthflow_real_data_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.batches && parsed.batches.length > 0) return parsed.batches;
        }
      } catch { /* fallback */ }
    }
    return INITIAL_BATCH_RECORDS;
  });

  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [coldSensors, setColdSensors] = useState<ColdChainSensor[]>(INITIAL_COLD_CHAIN_SENSORS);
  const [approvedTransfers, setApprovedTransfers] = useState<RedistributionRecommendation[]>([]);

  // Clinical Recalls & Substitutions & Logistics state
  const [recalls, setRecalls] = useState<RecallNotice[]>(INITIAL_RECALLS);
  const [substitutions, setSubstitutions] = useState<ClinicalDrugSubstitution[]>(INITIAL_SUBSTITUTIONS);
  const [supplierDisruptions, setSupplierDisruptions] = useState<SupplierDisruptionAlert[]>(INITIAL_SUPPLIER_DISRUPTIONS);
  const [selectedManifest, setSelectedManifest] = useState<TransferManifest | null>(null);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState<boolean>(false);

  // Interactive Demo & Guided Tour state
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [activeTourStep, setActiveTourStep] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [quickAiPrompt, setQuickAiPrompt] = useState<string>('');
  const [bannerNotification, setBannerNotification] = useState<string | null>(null);
  const [isDemoScenarioActive, setIsDemoScenarioActive] = useState<boolean>(() => {
    return localStorage.getItem('healthflow_data_mode') !== 'real';
  });

  // AI Chat state
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: 'Hello. I am **HealthFlow AI Intelligence**, directly connected to real-time regional hospital inventories, shortage forecasts, waste intelligence, and active logistics.\n\nAsk me about acute vulnerabilities, specific hospital risks (e.g. *Metro General*), expiring batches, smart redistribution recommendations, or crisis shock impacts.',
      timestamp: 'Active',
      source: 'gemini',
      dataPointsUsed: ['Live Inventory Context', 'Shortage Prediction Engine', 'Crisis Simulation State'],
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Crisis state
  const [crisisParams, setCrisisParams] = useState<CrisisParameters>({
    diseaseDemandIncreasePct: 0,
    supplierCapacityReductionPct: 0,
    transportDelayDays: 0,
    hospitalPatientLoadIncreasePct: 0,
  });
  const [simulationResult, setSimulationResult] = useState<SimulationSummary | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Derived state: dynamic redistributions & alerts
  const [redistributions, setRedistributions] = useState<RedistributionRecommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Security action logging helper
  const logSecurityAction = (
    action: AuditLogEntry['action'],
    resource: string,
    details: string,
    status: 'SUCCESS' | 'DENIED' | 'WARNING' = 'SUCCESS'
  ) => {
    const entryData = {
      userId: currentUser.userId,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action,
      resource,
      details,
      status,
    };
    logAuditEvent(entryData).then(fullLog => {
      setAuditLogs(prev => [fullLog, ...prev]);
    }).catch(() => {
      const fallbackLog: AuditLogEntry = {
        ...entryData,
        logId: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        hash: btoa(`${Date.now()}:${entryData.userId}:${entryData.action}`).substring(0, 16),
      };
      setAuditLogs(prev => [fallbackLog, ...prev]);
    });
  };

  const clearAccessDenied = () => {
    setAccessDeniedModal(null);
  };

  const switchRole = (newRole: UserRole) => {
    const profileTemplate = PREDEFINED_PROFILES[newRole];
    const updated: UserProfile = {
      ...profileTemplate,
      userId: `usr-${newRole}-${Date.now().toString().slice(-4)}`,
      createdAt: currentUser.createdAt,
      lastLoginAt: new Date().toISOString(),
    };
    setCurrentUser(updated);
    logSecurityAction(
      'ROLE_SWITCH',
      `Clearance: ${getRolePermissions(newRole).badgeLabel}`,
      `Operator switched active persona to ${updated.displayName} (${updated.department}).`,
      'SUCCESS'
    );
    setBannerNotification(`Operator persona switched to ${updated.displayName} (${getRolePermissions(newRole).badgeLabel})`);
  };

  const updateCurrentUser = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  // Test Firebase connection and fetch remote audit records
  useEffect(() => {
    testFirebaseConnection().then(ok => setFirebaseConnected(ok));
    fetchRecentAuditLogs().then(logs => {
      if (logs && logs.length > 0) {
        setAuditLogs(prev => {
          const existingIds = new Set(prev.map(p => p.logId));
          const newUnique = logs.filter(l => !existingIds.has(l.logId));
          return [...newUnique, ...prev];
        });
      }
    });

    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setFirebaseConnected(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Recalculate redistributions and alerts whenever inventory or batches update
  useEffect(() => {
    const updatedBatches = detectExpiringBatches(batches, inventories);
    const recoms = calculateRedistributions(hospitals, inventories, supplies);
    const dynamicAlerts = generateLiveAlerts(
      hospitals,
      inventories,
      updatedBatches,
      shipments,
      coldSensors,
      supplies
    );

    setRedistributions(recoms);
    setAlerts(dynamicAlerts);
  }, [hospitals, inventories, batches, shipments, coldSensors, supplies]);

  const updateCrisisParams = (newParams: Partial<CrisisParameters>) => {
    setCrisisParams(prev => ({ ...prev, ...newParams }));
  };

  const runCrisisSimulation = () => {
    if (!currentPermissions.canRunCrisisSimulation) {
      logSecurityAction(
        'CRISIS_RUN',
        'Crisis Lab Simulator',
        'Clearance Level 4 or higher required to trigger epidemic/vendor disruption shocks.',
        'DENIED'
      );
      setAccessDeniedModal({
        action: 'Execute Regional Crisis Simulation',
        requiredRole: 'Regional Director or System Admin',
        requiredClearance: 'Level 4 (Regional Command Authority)',
        reason: 'Simulating population-scale demand shocks and supplier choke points affects emergency coordination routes and requires Regional Command authorization.',
      });
      return;
    }

    setIsSimulating(true);
    logSecurityAction(
      'CRISIS_RUN',
      'Crisis Lab Simulator',
      `Executed regional stress-test with demand +${crisisParams.diseaseDemandIncreasePct}%, supplier capacity -${crisisParams.supplierCapacityReductionPct}%, transport delay +${crisisParams.transportDelayDays}d.`,
      'SUCCESS'
    );

    setTimeout(() => {
      const sim = simulateCrisisScenario(
        crisisParams,
        hospitals,
        inventories,
        supplies,
        shipments,
        suppliers
      );
      setSimulationResult(sim.summary);
      setIsSimulating(false);
      setBannerNotification(
        `Crisis Simulation Complete: ${sim.summary.criticalHospitalsAfter} critical hospitals (+${sim.summary.criticalHospitalsAfter - sim.summary.criticalHospitalsBefore}), network reserve lowered to ${sim.summary.avgDaysReserveAfter} days.`
      );
    }, 600);
  };

  const resetCrisis = () => {
    setCrisisParams({
      diseaseDemandIncreasePct: 0,
      supplierCapacityReductionPct: 0,
      transportDelayDays: 0,
      hospitalPatientLoadIncreasePct: 0,
    });
    setSimulationResult(null);
    setBannerNotification('Crisis parameters restored to baseline.');
  };

  const loadDemoScenario = () => {
    const freshInventories = generateInitialInventory();
    setHospitals(INITIAL_HOSPITALS);
    setSupplies(INITIAL_SUPPLIES);
    setInventories(freshInventories);
    setBatches(INITIAL_BATCH_RECORDS);
    setShipments(INITIAL_SHIPMENTS);
    setColdSensors(INITIAL_COLD_CHAIN_SENSORS);
    setApprovedTransfers([]);
    setCrisisParams({
      diseaseDemandIncreasePct: 0,
      supplierCapacityReductionPct: 0,
      transportDelayDays: 0,
      hospitalPatientLoadIncreasePct: 0,
    });
    setSimulationResult(null);
    setIsDemoScenarioActive(true);
    setDataModeState('synthetic');
    localStorage.setItem('healthflow_data_mode', 'synthetic');
    setBannerNotification(
      'Demo Scenario Loaded: Metro General critical shortage (6.5d), St. Jude surplus (+700 units), Memorial expiring kits, delayed shipment to North Valley.'
    );
  };

  const resetToBaseline = () => {
    loadDemoScenario();
    setIsDemoScenarioActive(false);
  };

  // Real Data & Production Ingestion Methods
  const setDataMode = (mode: DataMode) => {
    setDataModeState(mode);
    localStorage.setItem('healthflow_data_mode', mode);

    if (mode === 'real') {
      if (realDataset && realDataset.hospitals?.length) {
        if (realDataset.hospitals) setHospitals(realDataset.hospitals);
        if (realDataset.supplies) setSupplies(realDataset.supplies);
        if (realDataset.inventories) setInventories(realDataset.inventories);
        if (realDataset.batches) setBatches(realDataset.batches);
      } else {
        loadSampleRealDataset();
        return;
      }
      setIsDemoScenarioActive(false);
      logSecurityAction('DATA_SWITCH', 'System Data Engine', 'Switched system to LIVE REAL HEALTHCARE DATASET.', 'SUCCESS');
      setBannerNotification('Live Real Data Active. Calculating metrics for real hospital network.');
    } else {
      setHospitals(INITIAL_HOSPITALS);
      setSupplies(INITIAL_SUPPLIES);
      setInventories(generateInitialInventory());
      setBatches(INITIAL_BATCH_RECORDS);
      setIsDemoScenarioActive(true);
      logSecurityAction('DATA_SWITCH', 'System Data Engine', 'Switched system to SYNTHETIC PROTOTYPE baseline.', 'SUCCESS');
      setBannerNotification('Synthetic Prototype Active. Inventory and demand are simulated.');
    }
  };

  const importRealDataset = (incoming: Partial<RealDataset>) => {
    const updatedHospitals = incoming.hospitals || realDataset?.hospitals || hospitals;
    const updatedSupplies = incoming.supplies || realDataset?.supplies || supplies;
    
    let updatedInventories = incoming.inventories || realDataset?.inventories;
    if (!updatedInventories || updatedInventories.length === 0) {
      updatedInventories = generateRealWorldSampleInventory(updatedHospitals, updatedSupplies);
    }

    let updatedBatches = incoming.batches || realDataset?.batches;
    if (!updatedBatches || updatedBatches.length === 0) {
      updatedBatches = generateRealWorldSampleBatches(updatedHospitals, updatedSupplies);
    }

    const merged: RealDataset = {
      hospitals: updatedHospitals,
      supplies: updatedSupplies,
      inventories: updatedInventories,
      batches: updatedBatches,
      datasetName: incoming.datasetName || realDataset?.datasetName || 'Production Healthcare Network',
      sourceType: incoming.sourceType || 'CSV_UPLOAD',
      importedAt: new Date().toISOString(),
    };

    setRealDataset(merged);
    localStorage.setItem('healthflow_real_data_v1', JSON.stringify(merged));
    localStorage.setItem('healthflow_data_mode', 'real');
    setDataModeState('real');

    setHospitals(updatedHospitals);
    setSupplies(updatedSupplies);
    setInventories(updatedInventories);
    setBatches(updatedBatches);
    setIsDemoScenarioActive(false);

    if (currentUser?.userId) {
      saveRealDatasetToFirestore(currentUser.userId, merged).catch(err => {
        console.warn('Firestore real dataset save warning:', err);
      });
    }

    logSecurityAction(
      'DATA_IMPORT',
      'Data Ingestion Hub',
      `Imported real dataset "${merged.datasetName}": ${updatedHospitals.length} facilities, ${updatedSupplies.length} supplies, ${updatedInventories.length} stock records.`,
      'SUCCESS'
    );

    setBannerNotification(
      `Real Data Activated: Loaded ${updatedHospitals.length} facilities and ${updatedSupplies.length} formulary items. Calculations refreshed.`
    );
  };

  const loadSampleRealDataset = () => {
    const sampleHospitals = REAL_WORLD_SAMPLE_FACILITIES;
    const sampleSupplies = REAL_WORLD_SAMPLE_SUPPLIES;
    const sampleInventory = generateRealWorldSampleInventory(sampleHospitals, sampleSupplies);
    const sampleBatches = generateRealWorldSampleBatches(sampleHospitals, sampleSupplies);

    importRealDataset({
      hospitals: sampleHospitals,
      supplies: sampleSupplies,
      inventories: sampleInventory,
      batches: sampleBatches,
      datasetName: 'Real Tertiary Centers (Mayo Clinic, Johns Hopkins, Cleveland Clinic, MGH, Stanford)',
      sourceType: 'SAMPLE_REAL',
    });
  };

  const clearRealDataset = () => {
    setRealDataset(null);
    localStorage.removeItem('healthflow_real_data_v1');
    localStorage.setItem('healthflow_data_mode', 'synthetic');
    setDataModeState('synthetic');
    loadDemoScenario();
    logSecurityAction('DATA_SWITCH', 'Data Ingestion Hub', 'Cleared real dataset. Reverted to synthetic baseline.', 'WARNING');
    setBannerNotification('Real dataset cleared. Reverted to synthetic simulation network.');
  };

  const saveRealDataToCloud = async (): Promise<boolean> => {
    const currentReal: RealDataset = realDataset || {
      hospitals,
      supplies,
      inventories,
      batches,
      datasetName: 'HealthFlow Production Snapshot',
      sourceType: 'MANUAL_ENTRY',
      importedAt: new Date().toISOString(),
    };
    const ok = await saveRealDatasetToFirestore(currentUser.userId, currentReal);
    if (ok) {
      logSecurityAction('DATA_EXPORT', 'Cloud Firestore', 'Synced real dataset to Cloud Firestore.', 'SUCCESS');
    }
    return ok;
  };

  const loadRealDataFromCloud = async (): Promise<boolean> => {
    const remote = await fetchRealDatasetFromFirestore(currentUser.userId);
    if (remote && remote.hospitals && remote.hospitals.length > 0) {
      importRealDataset(remote);
      return true;
    }
    return false;
  };

  const updateInventoryStock = (hospitalId: string, supplyId: string, newStock: number) => {
    // Jurisdictional check for facility logistics leads
    if (
      currentUser.role === 'hospital_logistics_lead' &&
      currentUser.assignedHospitalId &&
      currentUser.assignedHospitalId !== 'all' &&
      currentUser.assignedHospitalId !== hospitalId
    ) {
      logSecurityAction(
        'TRANSFER_DISPATCH',
        `Inventory: Facility ${hospitalId}`,
        `Unauthorized cross-facility modification attempt. Scoped to ${currentUser.assignedHospitalName}.`,
        'DENIED'
      );
      setAccessDeniedModal({
        action: 'Modify External Facility Stock Counts',
        requiredRole: 'Facility Logistics Lead or System Admin',
        requiredClearance: `Authorized scope for facility ID: ${hospitalId}`,
        reason: 'Hospital Logistics Leads are restricted strictly to their assigned medical center under zero-trust operational protocols.',
      });
      return;
    }

    const validStock = Math.max(0, Math.round(newStock));
    setInventories(prev =>
      prev.map(inv => {
        if (inv.hospitalId === hospitalId && inv.supplyId === supplyId) {
          const days = calculateDaysRemaining(validStock, inv.avgDailyConsumption);
          return {
            ...inv,
            currentStock: validStock,
            daysRemaining: days,
            riskLevel: getSupplyRiskLevel(days),
          };
        }
        return inv;
      })
    );

    logSecurityAction(
      'TRANSFER_DISPATCH',
      `Inventory: ${hospitalId}/${supplyId}`,
      `Adjusted physical count to ${validStock} units.`,
      'SUCCESS'
    );

    // Sync to backend asynchronously if running
    fetch(`/api/inventory/${hospitalId}/${supplyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_stock: validStock }),
    }).catch(() => {
      // Graceful fallback to client-side state
    });

    setBannerNotification(
      `Stock count updated for facility ${hospitalId}. Days remaining & shortage risk recomputed immediately.`
    );
  };

  const addBatchRecord = (batchData: Omit<BatchRecord, 'id'>) => {
    const newBatch: BatchRecord = {
      ...batchData,
      id: `batch-${Date.now()}`,
    };
    setBatches(prev => [newBatch, ...prev]);
    logSecurityAction(
      'LOT_QUARANTINE',
      `Batch ${newBatch.batchNumber}`,
      `Registered new batch of ${newBatch.supplyName} at ${newBatch.facilityName}. Initial status: ${newBatch.status}.`,
      'SUCCESS'
    );
    setBannerNotification(
      `Lot ${newBatch.batchNumber} added for ${newBatch.supplyName} at ${newBatch.facilityName}. Expiry risk analyzed.`
    );
  };

  const updateBatchRecord = (batchId: string, updates: Partial<BatchRecord>) => {
    // Quarantine verification
    if (updates.status === 'QUARANTINED' && !currentPermissions.canQuarantineBatch) {
      logSecurityAction(
        'LOT_QUARANTINE',
        `Batch Record ${batchId}`,
        'Attempted to quarantine pharmaceutical lot without Clinical Pharmacist credentials.',
        'DENIED'
      );
      setAccessDeniedModal({
        action: 'Quarantine Pharmaceutical Batch Lot',
        requiredRole: 'Clinical Pharmacist or System Admin',
        requiredClearance: 'Level 3 (Clinical Batch Authority)',
        reason: 'Quarantining pharmaceutical lots halts clinical patient administration and legally requires verified Clinical Pharmacist sign-off.',
      });
      return;
    }

    setBatches(prev =>
      prev.map(b => (b.id === batchId ? { ...b, ...updates } : b))
    );

    if (updates.status === 'QUARANTINED') {
      logSecurityAction(
        'LOT_QUARANTINE',
        `Batch Record ${batchId}`,
        `Quarantined pharmaceutical lot ${batchId} due to safety or thermal violation.`,
        'SUCCESS'
      );
      setBannerNotification(`Pharmaceutical lot ${batchId} quarantined. Dispensing locked.`);
    }
  };

  const approveRedistribution = (recomId: string) => {
    const recom = redistributions.find(r => r.id === recomId);
    if (!recom) return;

    if (!currentPermissions.canApproveRedistribution) {
      logSecurityAction(
        'TRANSFER_APPROVE',
        `Transfer Order ${recomId} (${recom.supplyName})`,
        'Attempted to authorize inter-facility transfer without Level 4 Regional Director clearance.',
        'DENIED'
      );
      setAccessDeniedModal({
        action: 'Authorize Inter-Hospital Mutual-Aid Transfer',
        requiredRole: 'Regional Director or System Admin',
        requiredClearance: 'Level 4 (Regional Command Authority)',
        reason: 'Inter-hospital mutual aid reallocates supplies across legal municipal boundaries and requires Regional Director clearance.',
      });
      return;
    }

    logSecurityAction(
      'TRANSFER_APPROVE',
      `Transfer Order: ${recom.supplyName}`,
      `Authorized dispatch of ${recom.quantity} units from ${recom.sourceHospitalName} to ${recom.destHospitalName}.`,
      'SUCCESS'
    );

    // 1. Update source and destination inventories
    setInventories(prev =>
      prev.map(inv => {
        // Source hospital: deduct quantity
        if (inv.hospitalId === recom.sourceHospitalId && inv.supplyId === recom.supplyId) {
          const newStock = Math.max(0, inv.currentStock - recom.quantity);
          const newDays = calculateDaysRemaining(newStock, inv.avgDailyConsumption);
          return {
            ...inv,
            currentStock: newStock,
            daysRemaining: newDays,
            riskLevel: getSupplyRiskLevel(newDays),
          };
        }
        // Destination hospital: add quantity
        if (inv.hospitalId === recom.destHospitalId && inv.supplyId === recom.supplyId) {
          const newStock = inv.currentStock + recom.quantity;
          const newDays = calculateDaysRemaining(newStock, inv.avgDailyConsumption);
          return {
            ...inv,
            currentStock: newStock,
            daysRemaining: newDays,
            riskLevel: getSupplyRiskLevel(newDays),
          };
        }
        return inv;
      })
    );

    // 2. Recalculate hospital overall risk score
    setTimeout(() => {
      setHospitals(prev =>
        prev.map(hosp => {
          if (hosp.id === recom.destHospitalId) {
            // Improved risk
            const newScore = Math.max(25, hosp.riskScore - 30);
            return {
              ...hosp,
              riskScore: newScore,
              riskLevel: newScore >= 78 ? 'CRITICAL' : newScore >= 60 ? 'HIGH_RISK' : 'WARNING',
            };
          }
          return hosp;
        })
      );
    }, 100);

    // 3. Create active shipment record
    const newShipment: Shipment = {
      id: `ship-transfer-${Date.now()}`,
      trackingNumber: `MUTUAL-AID-${Math.floor(10000 + Math.random() * 90000)}`,
      sourceType: 'HOSPITAL',
      sourceName: recom.sourceHospitalName,
      sourceId: recom.sourceHospitalId,
      destinationType: 'HOSPITAL',
      destinationName: recom.destHospitalName,
      destinationId: recom.destHospitalId,
      supplyId: recom.supplyId,
      supplyName: recom.supplyName,
      quantity: recom.quantity,
      status: 'IN_TRANSIT',
      dispatchDate: '2026-09-15',
      expectedDeliveryDate: '2026-09-15',
      delayDays: 0,
      carrier: `Priority Medical Courier (${recom.estimatedHours}h ETA)`,
    };
    setShipments(prev => [newShipment, ...prev]);

    // 4. Mark recommendation approved
    const approved = { ...recom, status: 'APPROVED' as const, approvedAt: 'Just now' };
    setApprovedTransfers(prev => [approved, ...prev]);

    // Remove from active pending
    setRedistributions(prev => prev.filter(r => r.id !== recomId));

    setBannerNotification(
      `Transfer Approved: ${recom.quantity} units of ${recom.supplyName} dispatched from ${recom.sourceHospitalName} to ${recom.destHospitalName}. ETA ~${recom.estimatedHours} hours.`
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const acknowledgeSensorWarning = (sensorId: string) => {
    if (!currentPermissions.canResetSensorAlarm) {
      logSecurityAction(
        'ALARM_RESET',
        `Sensor ${sensorId}`,
        'Attempted to clear cold-chain telemetry alarm without certified inspector clearance.',
        'DENIED'
      );
      setAccessDeniedModal({
        action: 'Acknowledge Cold-Chain Critical Alarm',
        requiredRole: 'Logistics Lead, Clinical Pharmacist, or System Admin',
        requiredClearance: 'Level 3 or higher (Physical Inspection Certified)',
        reason: 'Resetting temperature excursion alarms requires verified physical unit inspection under FDA/CDC vaccine storage protocols.',
      });
      return;
    }

    setColdSensors(prev =>
      prev.map(s => (s.id === sensorId ? { ...s, currentTemp: 5.2, status: 'NORMAL' as const } : s))
    );
    logSecurityAction(
      'ALARM_RESET',
      `Sensor ${sensorId}`,
      'Sensor excursion acknowledged and calibrated back to safe operating baseline (5.2°C).',
      'SUCCESS'
    );
    setBannerNotification('Cold-chain telemetry reset to safe range (5.2°C). Sensor alarm acknowledged.');
  };

  // Clinical Recalls & Substitutions & Logistics Methods
  const quarantineRecallBatches = (recallId: string) => {
    const targetRecall = recalls.find(r => r.id === recallId);
    if (!targetRecall) return;

    if (!currentPermissions.canQuarantineBatch) {
      logSecurityAction(
        'LOT_QUARANTINE',
        `Recall ${targetRecall.recallNumber}`,
        'Unauthorized quarantine attempt without Clinical Pharmacist credentials.',
        'DENIED'
      );
      setAccessDeniedModal({
        action: 'Execute Hospital Network Lot Recall Quarantine',
        requiredRole: 'Clinical Pharmacist or System Admin',
        requiredClearance: 'Level 3 (Clinical Batch Authority)',
        reason: 'Quarantining pharmaceutical lots across the healthcare system requires verified Clinical Pharmacist sign-off.',
      });
      return;
    }

    // Mark matching batches as QUARANTINED
    setBatches(prev =>
      prev.map(batch => {
        if (targetRecall.affectedBatches.includes(batch.batchNumber) && batch.status !== 'QUARANTINED') {
          return { ...batch, status: 'QUARANTINED' as const };
        }
        return batch;
      })
    );

    // Mark recall as QUARANTINED_ALL
    setRecalls(prev =>
      prev.map(r =>
        r.id === recallId ? { ...r, status: 'QUARANTINED_ALL' as const, quarantinedUnits: r.totalAffectedUnits } : r
      )
    );

    // Deduct quarantined units from usable stock in inventories for affected hospitals
    setInventories(prev =>
      prev.map(inv => {
        if (inv.supplyId === targetRecall.supplyId && targetRecall.affectedHospitalIds.includes(inv.hospitalId)) {
          const deducted = Math.max(0, inv.currentStock - 200);
          const days = calculateDaysRemaining(deducted, inv.avgDailyConsumption);
          return {
            ...inv,
            currentStock: deducted,
            daysRemaining: days,
            riskLevel: getSupplyRiskLevel(days),
          };
        }
        return inv;
      })
    );

    logSecurityAction(
      'RECALL_QUARANTINE',
      `Recall ${targetRecall.recallNumber}`,
      `Quarantined all affected lots (${targetRecall.affectedBatches.join(', ')}) for ${targetRecall.supplyName}. Usable stock locked across Pyxis stations.`,
      'SUCCESS'
    );
    setBannerNotification(
      `Network Quarantine Executed: Lots ${targetRecall.affectedBatches.join(', ')} locked out across all hospital Pyxis units.`
    );
  };

  const triggerSimulatedRecall = () => {
    const newRecall: RecallNotice = {
      id: `rec-sim-${Date.now()}`,
      recallNumber: `FDA-EMERGENCY-${Date.now().toString().slice(-4)}`,
      classification: 'CLASS_I',
      classificationLabel: 'Class I Recall (Emergency Simulated Drill)',
      supplyId: 'sup-1',
      supplyName: 'IV Fluids (0.9% Normal Saline 1000ml)',
      affectedBatches: ['LOT-SALINE-EMERGENCY'],
      issuingAuthority: 'FDA',
      hazardDescription: 'Emergency drill: Endotoxin contamination detected in sterilization port #3 during spot audit.',
      clinicalImpactSummary: 'High fever and septic-like shock response upon rapid intravenous infusion.',
      actionRequired: 'Immediately lock automated dispensing cabinets and switch to Lactated Ringers substitute protocol.',
      dateIssued: new Date().toISOString(),
      status: 'ACTIVE_RECALL',
      affectedHospitalIds: ['hosp-1', 'hosp-2', 'hosp-4'],
      totalAffectedUnits: 850,
      quarantinedUnits: 0,
      estimatedPatientExposure: 0,
    };
    setRecalls(prev => [newRecall, ...prev]);
    logSecurityAction(
      'RECALL_TRIGGER',
      `Emergency Recall Drill ${newRecall.recallNumber}`,
      'Injected Class I emergency recall drill to evaluate hospital readiness.',
      'WARNING'
    );
    setBannerNotification(
      `Emergency Recall Injected: Class I Recall issued for ${newRecall.supplyName}. Check Recalls & Quarantine tab.`
    );
  };

  const authorizeSubstitutionProtocol = (
    subGroup: ClinicalDrugSubstitution,
    chosenSub: DrugSubstituteItem,
    hospitalId?: string
  ) => {
    const targetHospital = hospitals.find(h => h.id === hospitalId) || hospitals[0];
    logSecurityAction(
      'SUBSTITUTION_PROTOCOL',
      `Substitution: ${subGroup.primarySupplyName} -> ${chosenSub.name}`,
      `Authorized clinical protocol at ${targetHospital.name}. Bioequivalence code: ${chosenSub.fdaOrangeBookCode}. Ratio: ${chosenSub.dosageRatio}.`,
      'SUCCESS'
    );
    setBannerNotification(
      `Clinical Protocol Authorized: ${chosenSub.name} approved as emergency substitute for ${subGroup.primarySupplyName} at ${targetHospital.name}.`
    );
  };

  const activateSupplierFailover = (disruptionId: string, altSupplierId: string) => {
    const disruption = supplierDisruptions.find(d => d.id === disruptionId);
    const altSupplier = disruption?.alternativeSuppliers.find(a => a.id === altSupplierId);
    logSecurityAction(
      'SUPPLIER_FAILOVER',
      `Supplier Route: ${altSupplier?.name || altSupplierId}`,
      `Activated multi-sourcing failover for disruption: "${disruption?.title}". Lead time: ${altSupplier?.leadTimeDays || 3} days.`,
      'SUCCESS'
    );
    setBannerNotification(
      `Supplier Failover Activated: Orders rerouted to ${altSupplier?.name || 'Secondary Supplier'}.`
    );
  };

  const generateManifestForTransfer = (recom: RedistributionRecommendation) => {
    const manifest: TransferManifest = {
      manifestNumber: `MAN-${Date.now().toString().slice(-6)}-FDA`,
      transferId: recom.id,
      timestamp: new Date().toISOString(),
      originFacility: recom.sourceHospitalName,
      destinationFacility: recom.destHospitalName,
      supplyName: recom.supplyName,
      quantity: recom.quantity,
      unit: 'units',
      batchNumbers: [`LOT-${recom.sourceHospitalId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`],
      carrier: 'HealthFlow Secure Medical Courier (Priority Cold-Route)',
      transportVehicleType: 'Refrigerated Sprinter Van #MED-409',
      coldChainMonitored: recom.supplyName.toLowerCase().includes('diagnostic') || recom.supplyName.toLowerCase().includes('insulin'),
      targetTempRange: '2°C - 8°C',
      authorizedBy: currentUser.displayName,
      authorizedRole: currentPermissions.badgeLabel,
      digitalSignatureHash: `SHA256: ${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`,
      securityClearanceCode: currentPermissions.clearanceLevel.split(' ')[0] || 'LVL-4',
      chainOfCustodyStages: [
        {
          stage: 'ORIGIN_DISPATCH',
          location: `${recom.sourceHospitalName} Central Pharmacy Dock`,
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString().slice(11, 16) + ' UTC',
          verifiedBy: 'Elena Rostova (Logistics Lead)',
          status: 'COMPLETED',
        },
        {
          stage: 'CARRIER_HANDOFF',
          location: 'Regional Inter-Facility Transit Bay',
          timestamp: new Date().toISOString().slice(11, 16) + ' UTC',
          verifiedBy: 'Driver J. Morales (Courier)',
          status: 'COMPLETED',
        },
        {
          stage: 'IN_TRANSIT_CHECK',
          location: `En route (Distance: ${recom.distanceKm} km, ETA: ${recom.estimatedHours} hrs)`,
          timestamp: 'Pending GPS Ping',
          verifiedBy: 'IoT Fleet Telematics',
          status: 'PENDING',
        },
        {
          stage: 'DESTINATION_RECEIPT',
          location: `${recom.destHospitalName} Emergency Receiving`,
          timestamp: 'Estimated Arrival in 2.5 hrs',
          verifiedBy: 'Receiving Pharmacist',
          status: 'PENDING',
        },
      ],
    };

    setSelectedManifest(manifest);
    setIsManifestModalOpen(true);
    logSecurityAction(
      'MANIFEST_GENERATE',
      `Manifest ${manifest.manifestNumber}`,
      `Generated digital Chain-of-Custody transfer manifest for ${recom.supplyName}.`,
      'SUCCESS'
    );
  };

  const closeManifestModal = () => {
    setIsManifestModalOpen(false);
  };

  // Interactive Demo & Guided Tour Handlers
  const startGuidedTour = (stepIndex: number = 0) => {
    const clamped = Math.max(0, Math.min(stepIndex, TOUR_STEPS.length - 1));
    setActiveTourStep(clamped);
    setActiveTab(TOUR_STEPS[clamped].tab);
    logSecurityAction(
      'LOGIN',
      'Interactive Tour System',
      `Started Guided Tour at Step ${clamped + 1}: ${TOUR_STEPS[clamped].title}`,
      'SUCCESS'
    );
    setBannerNotification(
      `Interactive Tour: Step ${clamped + 1} of ${TOUR_STEPS.length} (${TOUR_STEPS[clamped].title}). Follow the floating dock instructions.`
    );
  };

  const nextTourStep = () => {
    if (activeTourStep === null) return;
    if (activeTourStep < TOUR_STEPS.length - 1) {
      const next = activeTourStep + 1;
      setActiveTourStep(next);
      setActiveTab(TOUR_STEPS[next].tab);
      setBannerNotification(`Tour Step ${next + 1}: ${TOUR_STEPS[next].title}`);
    } else {
      setActiveTourStep(null);
      setBannerNotification('Guided Tour Completed! Explore freely or test practice scenarios in the System Guide.');
    }
  };

  const prevTourStep = () => {
    if (activeTourStep === null || activeTourStep <= 0) return;
    const prev = activeTourStep - 1;
    setActiveTourStep(prev);
    setActiveTab(TOUR_STEPS[prev].tab);
    setBannerNotification(`Tour Step ${prev + 1}: ${TOUR_STEPS[prev].title}`);
  };

  const exitGuidedTour = () => {
    setActiveTourStep(null);
    setBannerNotification('Exited guided tour. Re-launch anytime from the System Guide button.');
  };

  const askAi = async (prompt: string) => {
    if (!prompt.trim() || isAiLoading) return;

    logSecurityAction(
      'AI_QUERY',
      'HealthFlow AI (Gemini 3.8 Flash)',
      `Security Audit: Intelligence query by ${currentUser.displayName} (${currentUser.role}): "${prompt.slice(0, 70)}${prompt.length > 70 ? '...' : ''}"`,
      'SUCCESS'
    );

    const userMessage: AiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages(prev => [...prev, userMessage]);
    setIsAiLoading(true);

    try {
      const response = await askHealthFlowAI(prompt, {
        hospitals,
        inventories,
        supplies,
        batches,
        redistributions,
        crisisParams,
        simulationResult,
        shipments,
        coldSensors,
        recalls,
        substitutions,
      });

      const aiMessage: AiChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
        dataPointsUsed: response.dataPointsUsed,
      };

      setAiMessages(prev => [...prev, aiMessage]);
    } catch {
      const fallbackMessage: AiChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'An error occurred while communicating with the intelligence service. Operating state remains available for manual query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'demo',
      };
      setAiMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetAiChat = () => {
    setAiMessages([
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: 'Hello. I am **HealthFlow AI Intelligence**, directly connected to real-time regional hospital inventories, shortage forecasts, waste intelligence, and active logistics.\n\nAsk me about acute vulnerabilities, specific hospital risks (e.g. *Metro General*), expiring batches, smart redistribution recommendations, or crisis shock impacts.',
        timestamp: 'Active',
        source: 'gemini',
        dataPointsUsed: ['Live Inventory Context', 'Shortage Prediction Engine', 'Crisis Simulation State'],
      },
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        hospitals,
        warehouses,
        suppliers,
        supplies,
        inventories,
        batches,
        shipments,
        coldSensors,
        redistributions,
        alerts,
        approvedTransfers,
        recalls,
        substitutions,
        supplierDisruptions,
        selectedManifest,
        isManifestModalOpen,
        quarantineRecallBatches,
        triggerSimulatedRecall,
        authorizeSubstitutionProtocol,
        activateSupplierFailover,
        generateManifestForTransfer,
        closeManifestModal,
        isDemoGuideOpen,
        setIsDemoGuideOpen,
        activeTourStep,
        startGuidedTour,
        nextTourStep,
        prevTourStep,
        exitGuidedTour,
        currentUser,
        currentPermissions,
        switchRole,
        updateCurrentUser,
        auditLogs,
        logSecurityAction,
        accessDeniedModal,
        clearAccessDenied,
        isAuditModalOpen,
        setIsAuditModalOpen,
        isSecurityModalOpen,
        setIsSecurityModalOpen,
        isRoleSwitchModalOpen,
        setIsRoleSwitchModalOpen,
        firebaseConnected,
        activeTab,
        setActiveTab,
        selectedHospital,
        setSelectedHospital,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        quickAiPrompt,
        setQuickAiPrompt,
        aiMessages,
        isAiLoading,
        askAi,
        resetAiChat,
        crisisParams,
        updateCrisisParams,
        simulationResult,
        isSimulating,
        runCrisisSimulation,
        resetCrisis,
        isDemoScenarioActive,
        loadDemoScenario,
        resetToBaseline,
        dataMode,
        setDataMode,
        realDataset,
        isRealDataModalOpen,
        setIsRealDataModalOpen,
        importRealDataset,
        loadSampleRealDataset,
        saveRealDataToCloud,
        loadRealDataFromCloud,
        clearRealDataset,
        updateInventoryStock,
        addBatchRecord,
        updateBatchRecord,
        approveRedistribution,
        dismissAlert,
        acknowledgeSensorWarning,
        bannerNotification,
        setBannerNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
