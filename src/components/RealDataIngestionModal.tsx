import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Upload,
  Download,
  FileText,
  Database,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Cloud,
  FileSpreadsheet,
  Building2,
  Pill,
  Boxes,
  Copy,
  Check,
  Radio,
  ExternalLink,
} from 'lucide-react';
import {
  parseCSV,
  parseFacilitiesFromCSV,
  parseSuppliesFromCSV,
  parseInventoryFromCSV,
  parseBatchesFromCSV,
  CSV_TEMPLATES,
  downloadCSV,
  downloadJSON,
  REAL_WORLD_SAMPLE_FACILITIES,
  REAL_WORLD_SAMPLE_SUPPLIES,
  generateRealWorldSampleInventory,
  generateRealWorldSampleBatches,
} from '../utils/csvParser';
import { Hospital, MedicalSupply, SupplyCategory, HospitalInventory } from '../types';

type TabType = 'upload' | 'templates' | 'manual' | 'cloud-export';
type UploadCategory = 'auto' | 'facilities' | 'supplies' | 'inventory' | 'batches' | 'full_json';

export const RealDataIngestionModal: React.FC = () => {
  const {
    isRealDataModalOpen,
    setIsRealDataModalOpen,
    dataMode,
    setDataMode,
    realDataset,
    importRealDataset,
    loadSampleRealDataset,
    clearRealDataset,
    saveRealDataToCloud,
    loadRealDataFromCloud,
    firebaseConnected,
    hospitals,
    supplies,
    inventories,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [uploadCategory, setUploadCategory] = useState<UploadCategory>('auto');
  const [parsedPreview, setParsedPreview] = useState<{
    type: string;
    count: number;
    headers: string[];
    rows: Record<string, string>[];
  } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);

  // Manual Form States
  const [manualType, setManualType] = useState<'facility' | 'supply' | 'stock'>('facility');
  
  // New Facility Form
  const [facName, setFacName] = useState('');
  const [facCode, setFacCode] = useState('');
  const [facRegion, setFacRegion] = useState('');
  const [facBeds, setFacBeds] = useState('350');
  const [facOccupancy, setFacOccupancy] = useState('85');
  const [facIcu, setFacIcu] = useState('45');
  const [facLat, setFacLat] = useState('39.8283');
  const [facLng, setFacLng] = useState('-98.5795');

  // New Supply Form
  const [supName, setSupName] = useState('');
  const [supId, setSupId] = useState('');
  const [supCat, setSupCat] = useState<SupplyCategory>('Pharmaceuticals');
  const [supUnit, setSupUnit] = useState('vials');
  const [supCost, setSupCost] = useState('24.50');
  const [supShelf, setSupShelf] = useState('730');
  const [supCold, setSupCold] = useState(false);
  const [supBuffer, setSupBuffer] = useState('14');

  // New Stock Form
  const [stockHospitalId, setStockHospitalId] = useState('');
  const [stockSupplyId, setStockSupplyId] = useState('');
  const [stockUnits, setStockUnits] = useState('500');
  const [stockBurn, setStockBurn] = useState('25');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isRealDataModalOpen) return null;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  const processUploadedFile = (file: File) => {
    setParseError(null);
    setParsedPreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setParseError('Uploaded file appears empty.');
        return;
      }

      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          if (json.hospitals || json.supplies || json.inventories) {
            setParsedPreview({
              type: 'Full JSON Workspace Backup',
              count: (json.hospitals?.length || 0) + (json.supplies?.length || 0) + (json.inventories?.length || 0),
              headers: Object.keys(json),
              rows: [{ summary: `${json.hospitals?.length || 0} hospitals, ${json.supplies?.length || 0} supplies, ${json.inventories?.length || 0} inventory records` }],
            });
            // Store raw parsed object
            (window as unknown as { __stagedJsonDataset: unknown }).__stagedJsonDataset = json;
          } else {
            setParseError('JSON does not contain standard HealthFlow entities (hospitals, supplies, inventories).');
          }
        } catch {
          setParseError('Failed to parse JSON file. Ensure valid JSON syntax.');
        }
        return;
      }

      // Process CSV
      try {
        const rows = parseCSV(content);
        if (rows.length === 0) {
          setParseError('No data rows found in CSV.');
          return;
        }

        const headers = Object.keys(rows[0]);
        let detectedType = uploadCategory;

        if (detectedType === 'auto') {
          if (headers.includes('beds') || headers.includes('bedcount') || headers.includes('currentoccupancy')) {
            detectedType = 'facilities';
          } else if (headers.includes('unitcost') || headers.includes('shelflife') || headers.includes('shelflifedays')) {
            detectedType = 'supplies';
          } else if (headers.includes('currentstock') || headers.includes('avgdailyconsumption') || headers.includes('dailyburn')) {
            detectedType = 'inventory';
          } else if (headers.includes('batchnumber') || headers.includes('lotnumber') || headers.includes('expirydate')) {
            detectedType = 'batches';
          } else {
            detectedType = 'facilities';
          }
        }

        setParsedPreview({
          type: detectedType.toUpperCase(),
          count: rows.length,
          headers,
          rows,
        });
      } catch {
        setParseError('Error parsing CSV file. Check formatting and delimiter.');
      }
    };

    reader.readAsText(file);
  };

  const handleApplyStagedData = () => {
    if (!parsedPreview) return;

    if (parsedPreview.type === 'Full JSON Workspace Backup') {
      const staged = (window as unknown as { __stagedJsonDataset: Record<string, unknown> }).__stagedJsonDataset;
      if (staged) {
        importRealDataset({
          hospitals: (staged.hospitals as Hospital[]) || undefined,
          supplies: (staged.supplies as MedicalSupply[]) || undefined,
          inventories: (staged.inventories as HospitalInventory[]) || undefined,
          datasetName: (staged.datasetName as string) || 'JSON Restored Dataset',
          sourceType: 'JSON_RESTORE',
        });
        setParsedPreview(null);
        setIsRealDataModalOpen(false);
        return;
      }
    }

    const type = parsedPreview.type.toLowerCase();
    if (type.includes('facilit')) {
      const parsedHospitals = parseFacilitiesFromCSV(parsedPreview.rows);
      importRealDataset({
        hospitals: parsedHospitals,
        datasetName: `Real Facilities (${parsedHospitals.length} centers)`,
        sourceType: 'CSV_UPLOAD',
      });
    } else if (type.includes('suppl')) {
      const parsedSupplies = parseSuppliesFromCSV(parsedPreview.rows);
      importRealDataset({
        supplies: parsedSupplies,
        datasetName: `Real Formulary (${parsedSupplies.length} items)`,
        sourceType: 'CSV_UPLOAD',
      });
    } else if (type.includes('inventor')) {
      const parsedInventory = parseInventoryFromCSV(parsedPreview.rows, supplies);
      importRealDataset({
        inventories: parsedInventory,
        datasetName: `Real Inventory (${parsedInventory.length} records)`,
        sourceType: 'CSV_UPLOAD',
      });
    } else if (type.includes('batch')) {
      const parsedBatches = parseBatchesFromCSV(parsedPreview.rows, hospitals, supplies);
      importRealDataset({
        batches: parsedBatches,
        datasetName: `Real Lot Batches (${parsedBatches.length} lots)`,
        sourceType: 'CSV_UPLOAD',
      });
    }

    setParsedPreview(null);
    setIsRealDataModalOpen(false);
  };

  const handleCopyTemplate = (key: keyof typeof CSV_TEMPLATES) => {
    navigator.clipboard.writeText(CSV_TEMPLATES[key]);
    setCopiedTemplate(key);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const handleCreateManualFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facName.trim()) return;

    const id = `fac-real-${Date.now().toString().slice(-4)}`;
    const lat = parseFloat(facLat) || 39.8;
    const lng = parseFloat(facLng) || -98.5;
    const beds = parseInt(facBeds, 10) || 300;
    const occupancy = parseInt(facOccupancy, 10) || 80;

    const newFacility: Hospital = {
      id,
      name: facName.trim(),
      code: (facCode.trim() || facName.substring(0, 4)).toUpperCase(),
      region: facRegion.trim() || 'Regional Medical Network',
      beds,
      currentOccupancy: occupancy,
      acuteIcuBeds: parseInt(facIcu, 10) || 40,
      patientLoad: Math.round((beds * occupancy) / 100),
      patientLoadTrend: occupancy > 85 ? 'RISING' : 'STEADY',
      riskScore: Math.min(99, Math.max(10, Math.round(occupancy * 0.85))),
      riskLevel: occupancy >= 92 ? 'CRITICAL' : occupancy >= 85 ? 'HIGH_RISK' : 'STABLE',
      contactPerson: 'Director of Materials Management',
      phone: '+1 (555) 019-3321',
      coordinates: {
        lat,
        lng,
        x: Math.min(90, Math.max(10, ((lng + 125) / 58) * 80 + 10)),
        y: Math.min(90, Math.max(10, ((50 - lat) / 26) * 80 + 10)),
      },
    };

    const updatedHospitals = [...(realDataset?.hospitals || (dataMode === 'real' ? hospitals : [])), newFacility];
    importRealDataset({
      hospitals: updatedHospitals,
      datasetName: 'Custom Production Healthcare Network',
      sourceType: 'MANUAL_ENTRY',
    });

    setFacName('');
    setFacCode('');
    setFacRegion('');
    setIsRealDataModalOpen(false);
  };

  const handleCreateManualSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    const id = supId.trim() || `ndc-custom-${Date.now().toString().slice(-4)}`;
    const newSupply: MedicalSupply = {
      id,
      name: supName.trim(),
      category: supCat,
      unit: supUnit.trim() || 'vials',
      unitCost: parseFloat(supCost) || 20.0,
      shelfLifeDays: parseInt(supShelf, 10) || 730,
      isColdChain: supCold,
      defaultMinBufferDays: parseInt(supBuffer, 10) || 14,
    };

    const updatedSupplies = [...(realDataset?.supplies || (dataMode === 'real' ? supplies : [])), newSupply];
    importRealDataset({
      supplies: updatedSupplies,
      datasetName: 'Custom Production Formulary',
      sourceType: 'MANUAL_ENTRY',
    });

    setSupName('');
    setSupId('');
    setIsRealDataModalOpen(false);
  };

  const handleCreateManualStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockHospitalId || !stockSupplyId) return;

    const targetHosp = hospitals.find(h => h.id === stockHospitalId);
    const targetSup = supplies.find(s => s.id === stockSupplyId);
    if (!targetHosp || !targetSup) return;

    const units = parseInt(stockUnits, 10) || 0;
    const burn = parseFloat(stockBurn) || 1;
    const days = Number((units / burn).toFixed(1));

    const newInv: HospitalInventory = {
      id: `inv-${stockHospitalId}-${stockSupplyId}`,
      hospitalId: stockHospitalId,
      supplyId: stockSupplyId,
      currentStock: units,
      minStock: Math.round(burn * targetSup.defaultMinBufferDays),
      avgDailyConsumption: burn,
      projectedDailyDemand: burn,
      daysRemaining: days,
      riskLevel: days <= 7 ? 'CRITICAL' : days <= 12 ? 'HIGH_RISK' : days <= 18 ? 'WARNING' : 'STABLE',
      history6Months: [Math.round(burn * 28), Math.round(burn * 30), Math.round(burn * 29), Math.round(burn * 31), Math.round(burn * 30), units],
    };

    const currentInvs = realDataset?.inventories || (dataMode === 'real' ? inventories : []);
    const filtered = currentInvs.filter(i => !(i.hospitalId === stockHospitalId && i.supplyId === stockSupplyId));
    
    importRealDataset({
      inventories: [...filtered, newInv],
      datasetName: 'Updated Live Inventory Counts',
      sourceType: 'MANUAL_ENTRY',
    });

    setIsRealDataModalOpen(false);
  };

  const handleSaveToCloud = async () => {
    setIsSyncingCloud(true);
    setCloudMessage(null);
    const ok = await saveRealDataToCloud();
    setIsSyncingCloud(false);
    if (ok) {
      setCloudMessage('Real dataset successfully synchronized with Cloud Firestore database.');
    } else {
      setCloudMessage('Cloud sync completed with local cached state.');
    }
  };

  const handleLoadFromCloud = async () => {
    setIsSyncingCloud(true);
    setCloudMessage(null);
    const ok = await loadRealDataFromCloud();
    setIsSyncingCloud(false);
    if (ok) {
      setCloudMessage('Latest production dataset loaded from Cloud Firestore.');
    } else {
      setCloudMessage('No remote dataset found for this user. Import a CSV or load the sample set.');
    }
  };

  const handleExportFullJson = () => {
    const backup = {
      datasetName: realDataset?.datasetName || 'HealthFlow AI Live System Export',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.email,
      hospitals,
      supplies,
      inventories,
      dataMode,
    };
    downloadJSON(`healthflow_dataset_${Date.now()}.json`, backup);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Real Data Ingestion &amp; Conversion Hub
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  dataMode === 'real'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {dataMode === 'real' ? 'Mode: Live Real Data' : 'Mode: Synthetic Prototype'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Convert HealthFlow AI into your real-world hospital network using CSV feeds, JSON backups, or live manual entry.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRealDataModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Active Mode Switcher Bar */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Active Dataset Source:</span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => {
                  setDataMode('synthetic');
                  setParsedPreview(null);
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  dataMode === 'synthetic'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Synthetic Demo Dataset
              </button>
              <button
                onClick={() => {
                  if (!realDataset) {
                    loadSampleRealDataset();
                  } else {
                    setDataMode('real');
                  }
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  dataMode === 'real'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live Real Data Mode
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {realDataset && (
              <button
                onClick={clearRealDataset}
                className="flex items-center space-x-1.5 px-2.5 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 rounded-md transition-colors"
                title="Clear loaded real data and reset to synthetic baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Synthetic</span>
              </button>
            )}
            <button
              onClick={loadSampleRealDataset}
              className="flex items-center space-x-1.5 px-3 py-1 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 rounded-md font-semibold transition-all shadow-sm"
              title="Load pre-configured real healthcare centers (Mayo, Cleveland Clinic, Hopkins, MGH, Stanford)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Load Real-World Sample (Mayo &amp; Hopkins)</span>
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6">
          <button
            onClick={() => { setActiveTab('upload'); setParseError(null); }}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-teal-500 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV / Files</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-teal-500 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Sample CSV Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-teal-500 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Direct Manual Entry</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud-export')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'cloud-export'
                ? 'border-teal-500 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cloud Sync &amp; Export</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: UPLOAD CSV / JSON */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">Import Hospital Supply Chain Files</h3>
                  <p className="text-xs text-slate-400">
                    Upload your hospital's inventory spreadsheets or full JSON backup. The system parses headers automatically.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-xs text-slate-400">Target Type:</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as UploadCategory)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                  >
                    <option value="auto">⚡ Auto-Detect Headers</option>
                    <option value="facilities">🏥 Hospital Facilities</option>
                    <option value="supplies">💊 Medical Supplies Formulary</option>
                    <option value="inventory">📦 Stock on Hand &amp; Burn Rates</option>
                    <option value="batches">🏷️ Lot Batch Expiry Records</option>
                    <option value="full_json">🗂️ Full System JSON</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-teal-500/70 bg-slate-950/40 hover:bg-teal-950/10 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.json"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Click to browse or drag &amp; drop your file here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepts standard RFC-4180 <strong className="text-slate-400">.CSV</strong> (Excel export) or <strong className="text-slate-400">.JSON</strong>
                  </p>
                </div>
              </div>

              {/* Parse Error Notification */}
              {parseError && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 flex items-start space-x-3 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Import Warning:</span> {parseError}
                  </div>
                </div>
              )}

              {/* Staged Data Preview Table */}
              {parsedPreview && (
                <div className="border border-slate-800 rounded-xl bg-slate-950/80 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        Parsed {parsedPreview.count} {parsedPreview.type} records
                      </span>
                      <span className="px-2 py-0.5 text-[10px] bg-slate-800 rounded text-slate-300">
                        {parsedPreview.headers.length} Columns
                      </span>
                    </div>

                    <button
                      onClick={handleApplyStagedData}
                      className="px-4 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Activate &amp; Apply to Live System</span>
                    </button>
                  </div>

                  {/* Preview Table */}
                  <div className="max-h-52 overflow-x-auto overflow-y-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-[11px] text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[9px] font-semibold sticky top-0">
                        <tr>
                          {parsedPreview.headers.map(h => (
                            <th key={h} className="px-3 py-2 border-b border-slate-800 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {parsedPreview.rows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            {parsedPreview.headers.map(h => (
                              <td key={h} className="px-3 py-1.5 whitespace-nowrap">
                                {row[h] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {parsedPreview.rows.length > 5 && (
                    <p className="text-[11px] text-slate-500 text-right">
                      Showing first 5 of {parsedPreview.rows.length} records.
                    </p>
                  )}
                </div>
              )}

              {/* Fast Real World Quick Load Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-950 border border-teal-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Don't have CSV files ready?</h4>
                    <p className="text-[11px] text-slate-400">
                      Instantly load real tertiary centers (Mayo Clinic, Johns Hopkins, Cleveland Clinic, Mass General, Stanford) with live clinical pharmaceuticals.
                    </p>
                  </div>
                </div>

                <button
                  onClick={loadSampleRealDataset}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm whitespace-nowrap transition-colors"
                >
                  Load Real Healthcare Set
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SAMPLE CSV TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Pre-Formatted CSV Templates</h3>
                <p className="text-xs text-slate-400">
                  Download or copy these templates to format your hospital's real data. You can paste them directly into Microsoft Excel or Google Sheets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Facilities Template Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-teal-400" />
                      <h4 className="text-xs font-bold text-white">facilities_template.csv</h4>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleCopyTemplate('facilities')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Copy to clipboard"
                      >
                        {copiedTemplate === 'facilities' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => downloadCSV('healthflow_facilities_template.csv', CSV_TEMPLATES.facilities)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Download CSV file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <pre className="text-[10px] text-slate-400 bg-slate-900 p-2.5 rounded-lg font-mono overflow-x-auto">
                    {CSV_TEMPLATES.facilities}
                  </pre>
                </div>

                {/* Supplies Template Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Pill className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold text-white">supplies_template.csv</h4>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleCopyTemplate('supplies')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Copy to clipboard"
                      >
                        {copiedTemplate === 'supplies' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => downloadCSV('healthflow_supplies_template.csv', CSV_TEMPLATES.supplies)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Download CSV file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <pre className="text-[10px] text-slate-400 bg-slate-900 p-2.5 rounded-lg font-mono overflow-x-auto">
                    {CSV_TEMPLATES.supplies}
                  </pre>
                </div>

                {/* Inventory Template Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Boxes className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white">inventory_template.csv</h4>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleCopyTemplate('inventory')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Copy to clipboard"
                      >
                        {copiedTemplate === 'inventory' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => downloadCSV('healthflow_inventory_template.csv', CSV_TEMPLATES.inventory)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Download CSV file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <pre className="text-[10px] text-slate-400 bg-slate-900 p-2.5 rounded-lg font-mono overflow-x-auto">
                    {CSV_TEMPLATES.inventory}
                  </pre>
                </div>

                {/* Batches Template Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white">batches_template.csv</h4>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleCopyTemplate('batches')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Copy to clipboard"
                      >
                        {copiedTemplate === 'batches' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => downloadCSV('healthflow_batches_template.csv', CSV_TEMPLATES.batches)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Download CSV file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <pre className="text-[10px] text-slate-400 bg-slate-900 p-2.5 rounded-lg font-mono overflow-x-auto">
                    {CSV_TEMPLATES.batches}
                  </pre>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: DIRECT MANUAL ENTRY */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Direct Medical Facility &amp; Supply Ingestion</h3>
                  <p className="text-xs text-slate-400">Quickly register real hospital facilities or formulary items without a spreadsheet.</p>
                </div>

                <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
                  <button
                    onClick={() => setManualType('facility')}
                    className={`px-3 py-1 rounded font-medium ${manualType === 'facility' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    + Add Hospital
                  </button>
                  <button
                    onClick={() => setManualType('supply')}
                    className={`px-3 py-1 rounded font-medium ${manualType === 'supply' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    + Add Medical Supply
                  </button>
                  <button
                    onClick={() => setManualType('stock')}
                    className={`px-3 py-1 rounded font-medium ${manualType === 'stock' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    + Log Stock Count
                  </button>
                </div>
              </div>

              {/* Sub-form: Add Hospital */}
              {manualType === 'facility' && (
                <form onSubmit={handleCreateManualFacility} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Register Real Hospital Facility</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Facility Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Memorial Regional Trauma Hospital"
                        value={facName}
                        onChange={e => setFacName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Short Code</label>
                      <input
                        type="text"
                        placeholder="e.g. MRTH"
                        value={facCode}
                        onChange={e => setFacCode(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Region / City</label>
                      <input
                        type="text"
                        placeholder="e.g. Northeast Health District"
                        value={facRegion}
                        onChange={e => setFacRegion(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Total Bed Capacity</label>
                      <input
                        type="number"
                        value={facBeds}
                        onChange={e => setFacBeds(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Current Occupancy (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={facOccupancy}
                        onChange={e => setFacOccupancy(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Acute ICU Beds</label>
                      <input
                        type="number"
                        value={facIcu}
                        onChange={e => setFacIcu(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Latitude</label>
                      <input
                        type="text"
                        value={facLat}
                        onChange={e => setFacLat(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Longitude</label>
                      <input
                        type="text"
                        value={facLng}
                        onChange={e => setFacLng(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg shadow transition-colors flex items-center space-x-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Save Facility &amp; Enter Real Mode</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Sub-form: Add Supply */}
              {manualType === 'supply' && (
                <form onSubmit={handleCreateManualSupply} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Add Medical Formulary Item</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Supply Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cefepime 2g IV Infusion"
                        value={supName}
                        onChange={e => setSupName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">NDC / SKU Identifier</label>
                      <input
                        type="text"
                        placeholder="e.g. ndc-0409-1234"
                        value={supId}
                        onChange={e => setSupId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Category</label>
                      <select
                        value={supCat}
                        onChange={e => setSupCat(e.target.value as SupplyCategory)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="Pharmaceuticals">Pharmaceuticals</option>
                        <option value="Critical Care">Critical Care</option>
                        <option value="PPE">PPE</option>
                        <option value="Consumables">Consumables</option>
                        <option value="Diagnostics">Diagnostics</option>
                        <option value="Surgical & Trauma">Surgical &amp; Trauma</option>
                        <option value="Blood & Biologics">Blood &amp; Biologics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Unit of Measure</label>
                      <input
                        type="text"
                        value={supUnit}
                        onChange={e => setSupUnit(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Unit Cost ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={supCost}
                        onChange={e => setSupCost(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Default Min Buffer Days</label>
                      <input
                        type="number"
                        value={supBuffer}
                        onChange={e => setSupBuffer(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-4 sm:col-span-2">
                      <input
                        type="checkbox"
                        id="cold-chain-checkbox"
                        checked={supCold}
                        onChange={e => setSupCold(e.target.checked)}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-900 border-slate-700"
                      />
                      <label htmlFor="cold-chain-checkbox" className="text-slate-300">
                        Requires Cold-Chain Storage (2°C – 8°C or Deep Frozen)
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg shadow transition-colors flex items-center space-x-1.5"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>Save Formulary Item</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Sub-form: Log Stock */}
              {manualType === 'stock' && (
                <form onSubmit={handleCreateManualStock} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Log Physical Stock &amp; Consumption</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Select Facility *</label>
                      <select
                        required
                        value={stockHospitalId}
                        onChange={e => setStockHospitalId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="">-- Choose Hospital --</option>
                        {hospitals.map(h => (
                          <option key={h.id} value={h.id}>{h.name} ({h.code})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Select Medical Supply *</label>
                      <select
                        required
                        value={stockSupplyId}
                        onChange={e => setStockSupplyId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="">-- Choose Supply Item --</option>
                        {supplies.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Current Stock on Hand (Units)</label>
                      <input
                        type="number"
                        required
                        value={stockUnits}
                        onChange={e => setStockUnits(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Average Daily Burn Rate (Units/Day)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={stockBurn}
                        onChange={e => setStockBurn(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg shadow transition-colors flex items-center space-x-1.5"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>Update Inventory &amp; Recalculate</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: CLOUD SYNC & EXPORT */}
          {activeTab === 'cloud-export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Cloud Database &amp; Data Persistence</h3>
                <p className="text-xs text-slate-400">
                  Synchronize your imported real-world health dataset with Cloud Firestore or export complete system snapshots.
                </p>
              </div>

              {/* Cloud Firestore Status */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${firebaseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <div>
                      <h4 className="text-xs font-bold text-white">Google Cloud Firestore Connection</h4>
                      <p className="text-[11px] text-slate-400">
                        Instance: <code className="text-teal-400 font-mono">ai-studio-healthflowai-b98bc347-f743-41da-a489-5f21754321f3</code>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    User: {currentUser.email}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleSaveToCloud}
                    disabled={isSyncingCloud}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center space-x-1.5"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{isSyncingCloud ? 'Syncing...' : 'Save Current Live Data to Cloud'}</span>
                  </button>

                  <button
                    onClick={handleLoadFromCloud}
                    disabled={isSyncingCloud}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pull from Cloud Firestore</span>
                  </button>
                </div>

                {cloudMessage && (
                  <p className="text-xs text-teal-300 bg-teal-950/40 border border-teal-800/40 p-2.5 rounded-lg flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{cloudMessage}</span>
                  </p>
                )}
              </div>

              {/* Export Tools */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Export Real Dataset</h4>
                <p className="text-xs text-slate-400">Download formatted files containing all your active data records.</p>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleExportFullJson}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Full System JSON</span>
                  </button>

                  <button
                    onClick={() => {
                      const csv = `id,name,code,region,beds,currentOccupancy,acuteIcuBeds,contactPerson,phone,lat,lng\n` +
                        hospitals.map(h => `"${h.id}","${h.name}","${h.code}","${h.region}",${h.beds},${h.currentOccupancy},${h.acuteIcuBeds},"${h.contactPerson}","${h.phone}",${h.coordinates.lat},${h.coordinates.lng}`).join('\n');
                      downloadCSV('healthflow_active_facilities.csv', csv);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Active Facilities CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      const csv = `id,name,category,unit,unitCost,shelfLifeDays,isColdChain,defaultMinBufferDays\n` +
                        supplies.map(s => `"${s.id}","${s.name}","${s.category}","${s.unit}",${s.unitCost},${s.shelfLifeDays},${s.isColdChain},${s.defaultMinBufferDays}`).join('\n');
                      downloadCSV('healthflow_active_supplies.csv', csv);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Active Supplies CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      const csv = `hospitalId,supplyId,currentStock,avgDailyConsumption,minStock,daysRemaining,riskLevel\n` +
                        inventories.map(i => `"${i.hospitalId}","${i.supplyId}",${i.currentStock},${i.avgDailyConsumption},${i.minStock},${i.daysRemaining},"${i.riskLevel}"`).join('\n');
                      downloadCSV('healthflow_active_inventory.csv', csv);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Active Inventory CSV</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Currently Active: <strong className="text-slate-300">{hospitals.length} Hospitals</strong>, <strong className="text-slate-300">{supplies.length} Supplies</strong>, <strong className="text-slate-300">{inventories.length} Inventory Lines</strong></span>
          </div>

          <button
            onClick={() => setIsRealDataModalOpen(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Close Hub
          </button>
        </div>

      </div>
    </div>
  );
};
