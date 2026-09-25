import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Package,
  AlertOctagon,
  Clock,
  Trash2,
  Truck,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ArrowRightLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  Database,
  Compass,
  Play,
  BookOpen,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { DashboardQuickActions } from './DashboardQuickActions';

export const DashboardView: React.FC = () => {
  const {
    hospitals,
    inventories,
    supplies,
    batches,
    shipments,
    alerts,
    setSelectedHospital,
    setActiveTab,
    redistributions,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
    dataMode,
    setIsRealDataModalOpen,
    realDataset,
    setIsDemoGuideOpen,
    startGuidedTour,
  } = useApp();

  // Metrics calculation
  const totalHospitals = hospitals.length;
  const totalAvailableStock = inventories.reduce((acc, i) => acc + i.currentStock, 0);
  const criticalHospitals = hospitals.filter(h => h.riskLevel === 'CRITICAL');
  const highRiskHospitals = hospitals.filter(h => h.riskLevel === 'HIGH_RISK');
  const suppliesAtRisk = inventories.filter(i => i.daysRemaining <= 7);
  const potentialWasteCost = batches.reduce((acc, b) => acc + b.financialLossRisk, 0);
  const pendingShipments = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'DELAYED');

  // Chart data: Supply Status (Stock vs Min Buffer for key SKUs)
  const supplyStatusData = supplies.slice(0, 7).map(sup => {
    const totalStock = inventories
      .filter(i => i.supplyId === sup.id)
      .reduce((acc, i) => acc + i.currentStock, 0);
    const totalMin = inventories
      .filter(i => i.supplyId === sup.id)
      .reduce((acc, i) => acc + i.minStock, 0);

    return {
      name: sup.name.split(' ')[0] + ' ' + (sup.name.split(' ')[1] || ''),
      stock: totalStock,
      minBuffer: totalMin,
      shortName: sup.name.slice(0, 16),
    };
  });

  // Chart data: Shortage Predictions (top critical runway items)
  const shortageData = inventories
    .filter(i => i.daysRemaining <= 10)
    .slice(0, 6)
    .map(inv => {
      const hosp = hospitals.find(h => h.id === inv.hospitalId);
      const sup = supplies.find(s => s.id === inv.supplyId);
      return {
        label: `${hosp?.code || 'H'} - ${sup?.name.split(' ')[0]}`,
        days: inv.daysRemaining,
        hospital: hosp?.name,
        supply: sup?.name,
      };
    });

  // Chart data: Expiry breakdown
  const expiryBreakdown = [
    { name: '< 15 Days (Urgent)', value: batches.filter(b => b.daysUntilExpiry <= 15).length, color: '#f43f5e' },
    { name: '15 - 30 Days (Warning)', value: batches.filter(b => b.daysUntilExpiry > 15 && b.daysUntilExpiry <= 30).length, color: '#f59e0b' },
    { name: '30 - 60 Days (Watch)', value: batches.filter(b => b.daysUntilExpiry > 30 && b.daysUntilExpiry <= 60).length, color: '#0ea5e9' },
    { name: '> 60 Days (Safe)', value: batches.filter(b => b.daysUntilExpiry > 60).length, color: '#10b981' },
  ];

  const statusPills = {
    CRITICAL: { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', dot: 'bg-rose-500', icon: '🔴' },
    HIGH_RISK: { bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40', dot: 'bg-orange-500', icon: '🟠' },
    WARNING: { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', dot: 'bg-amber-500', icon: '🟡' },
    STABLE: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-500', icon: '🟢' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${dataMode === 'real' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <h1 className="text-lg font-bold text-white tracking-tight">Supply Resilience Command Center</h1>
            <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
              dataMode === 'real'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {dataMode === 'real' ? `Live Network: ${realDataset?.datasetName || 'Imported Hospitals'}` : 'Synthetic Baseline'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {dataMode === 'real'
              ? `Live operational telemetry across ${hospitals.length} imported facilities and ${supplies.length} critical clinical formulary items.`
              : `Simulated multi-hospital testbed across ${hospitals.length} facilities, 3 central depots, and 8 certified supply manufacturers.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRealDataModalOpen(true)}
            className={`flex items-center space-x-1.5 px-3 py-2 border rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              dataMode === 'real'
                ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-700/60'
                : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-800/60'
            }`}
            title="Open Data Ingestion Hub to upload CSVs, load sample real hospitals, or edit records"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{dataMode === 'real' ? 'Manage Real Data / CSV' : 'Ingest Real Data (CSV)'}</span>
          </button>
          <button
            onClick={() => {
              setQuickAiPrompt(
                dataMode === 'real'
                  ? 'Give me a summary of the current live real hospital supply situation and tell me what actions should be prioritized.'
                  : 'Give me a summary of the current supply situation and tell me what actions should be prioritized.'
              );
              setIsAiDrawerOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Executive Briefing</span>
          </button>
          <button
            onClick={() => setActiveTab('crisis')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Launch Crisis Lab</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Demo & System Guide Hero Banner */}
      <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/30 border border-teal-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Interactive Demo System</span>
              <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold">Guided Walkthrough</span>
            </div>
            <h2 className="text-sm font-bold text-white mt-0.5">
              Learn How HealthFlow AI Works &amp; Master Daily Hospital Operations (SOP)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Explore the 8-step interactive tour, inspect mathematical burn formulas, or launch 5 realistic crisis &amp; clinical substitution simulation drills.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            id="btn-dashboard-start-tour"
            onClick={() => startGuidedTour(0)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Interactive Tour</span>
          </button>

          <button
            id="btn-dashboard-open-guide"
            onClick={() => setIsDemoGuideOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>System Manual &amp; SOP</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Hospitals */}
        <div
          id="kpi-total-hospitals"
          onClick={() => setActiveTab('network')}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Hospitals</span>
            <Building2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{totalHospitals}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center">
            <span className="text-emerald-400 font-medium mr-1">100%</span> connected
          </div>
        </div>

        {/* Total Available Supplies */}
        <div
          id="kpi-total-supplies"
          onClick={() => setActiveTab('supplies')}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Available Stock</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">
            {(totalAvailableStock / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-400 mt-1">15 Active Medical SKUs</div>
        </div>

        {/* Critical Hospitals */}
        <div
          id="kpi-critical-hospitals"
          onClick={() => setActiveTab('shortages')}
          className="p-4 bg-slate-900 border border-rose-900/60 rounded-xl hover:border-rose-700 transition-all cursor-pointer shadow-xs bg-rose-950/10"
        >
          <div className="flex items-center justify-between text-rose-300">
            <span className="text-xs font-semibold">Critical Hospitals</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1.5">{criticalHospitals.length}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">
            {highRiskHospitals.length} at High Risk
          </div>
        </div>

        {/* Supplies At Risk */}
        <div
          id="kpi-supplies-at-risk"
          onClick={() => setActiveTab('shortages')}
          className="p-4 bg-slate-900 border border-amber-900/60 rounded-xl hover:border-amber-700 transition-all cursor-pointer shadow-xs bg-amber-950/10"
        >
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-semibold">Supplies At Risk</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1.5">{suppliesAtRisk.length}</div>
          <div className="text-[11px] text-amber-300/80 mt-1">&lt; 7 Days Reserve</div>
        </div>

        {/* Potential Waste */}
        <div
          id="kpi-potential-waste"
          onClick={() => setActiveTab('waste')}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Potential Waste</span>
            <Trash2 className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">
            ${(potentialWasteCost / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-orange-400 mt-1">Nearing Expiry</div>
        </div>

        {/* Pending Shipments */}
        <div
          id="kpi-pending-shipments"
          onClick={() => setActiveTab('network')}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Inbound Shipments</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{pendingShipments.length}</div>
          <div className="text-[11px] text-rose-400 mt-1">
            {shipments.filter(s => s.status === 'DELAYED').length} Delayed Alert
          </div>
        </div>
      </div>

      {/* Hospital Risk Overview (Section A) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Hospital Risk Status Grid (A. Hospital Risk Map)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any hospital to inspect real-time bed occupancy, inventory depletion rates, and local supply alerts.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1 text-slate-300">
              <span>🟢</span> <span>Stable</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-300">
              <span>🟡</span> <span>Warning</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-300">
              <span>🟠</span> <span>High Risk</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-300">
              <span>🔴</span> <span>Critical</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {hospitals.map(hosp => {
            const pill = statusPills[hosp.riskLevel];
            const hospShortages = inventories.filter(
              i => i.hospitalId === hosp.id && i.daysRemaining <= 7
            );

            return (
              <div
                key={hosp.id}
                id={`hospital-card-${hosp.id}`}
                onClick={() => setSelectedHospital(hosp)}
                className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-teal-500/50 rounded-xl cursor-pointer transition-all hover:shadow-md hover:bg-slate-950 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {hosp.code}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${pill.bg}`}
                    >
                      {pill.icon} {hosp.riskLevel}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mt-2 line-clamp-1">{hosp.name}</h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">{hosp.region}</div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Beds Occupancy</span>
                    <span className="font-mono text-slate-200">
                      {hosp.patientLoad}/{hosp.beds} ({hosp.currentOccupancy}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Risk Score</span>
                    <span className="font-bold font-mono text-white">{hosp.riskScore}/100</span>
                  </div>
                  {hospShortages.length > 0 && (
                    <div className="text-[10px] text-rose-400 font-medium">
                      ⚠️ {hospShortages.length} critical supplies &lt; 7d
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts Grid (Sections B, C, D) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* B. Supply Status Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Package className="w-4 h-4 text-teal-400" />
                <span>B. Supply Status (Stock vs Min Buffer)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Aggregated units across network</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="shortName" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="stock" fill="#0d9488" name="Current Stock" radius={[4, 4, 0, 0]} />
                <Bar dataKey="minBuffer" fill="#475569" name="Min Buffer Threshold" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 mt-2">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-teal-600 rounded-xs"></span>
              <span>Current Available</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-slate-600 rounded-xs"></span>
              <span>Min Buffer Requirement</span>
            </span>
          </div>
        </div>

        {/* C. Shortage Prediction Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>C. Critical Shortage Runway</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Projected days remaining before stockout</p>
            </div>
            <button
              onClick={() => setActiveTab('shortages')}
              className="text-[11px] text-teal-400 hover:text-teal-300 font-medium"
            >
              Full Projections →
            </button>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shortageData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 12]} />
                <YAxis type="category" dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                  formatter={(val: any) => [`${val} days remaining`, 'Runway']}
                />
                <Bar dataKey="days" radius={[0, 4, 4, 0]}>
                  {shortageData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.days <= 5 ? '#f43f5e' : entry.days <= 8 ? '#f59e0b' : '#0ea5e9'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span className="text-rose-400 font-medium">🔴 &lt; 5 Days: Critical Runout</span>
            <span className="text-amber-400 font-medium">🟡 5-8 Days: Depleting</span>
            <span className="text-cyan-400 font-medium">🔵 &gt; 8 Days: Warning</span>
          </div>
        </div>

        {/* D. Expiry / Waste Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>D. Expiry Risk Profile</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Lots by expiration urgency window</p>
            </div>
            <button
              onClick={() => setActiveTab('waste')}
              className="text-[11px] text-teal-400 hover:text-teal-300 font-medium"
            >
              Audit Batches →
            </button>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expiryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expiryBreakdown.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                  formatter={(val: any, name: any) => [`${val} Lots`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 mt-1">
            {expiryBreakdown.map(b => (
              <div key={b.name} className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }}></span>
                <span className="truncate">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: E. Recent Alerts & F. AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* E. Live Generated Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>E. Dynamic Operations Alerts ({alerts.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">Algorithmic Detection</span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {alerts.slice(0, 5).map(alert => {
                const isCrit = alert.severity === 'CRITICAL';
                const isHigh = alert.severity === 'HIGH';

                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border text-xs flex items-start space-x-3 transition-colors ${
                      isCrit
                        ? 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                        : isHigh
                        ? 'bg-orange-950/25 border-orange-900/50 text-orange-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCrit ? (
                        <AlertOctagon className="w-4 h-4 text-rose-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{alert.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                      {alert.actionText && alert.actionTargetView && (
                        <button
                          onClick={() => setActiveTab(alert.actionTargetView as any)}
                          className="mt-2 text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1"
                        >
                          <span>{alert.actionText}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* F. AI Recommendations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>F. AI Supply Resilience Recommendations</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded font-mono">
                Optimized
              </span>
            </div>

            <div className="space-y-3">
              {redistributions.length > 0 ? (
                redistributions.slice(0, 2).map((recom, idx) => (
                  <div
                    key={recom.id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {recom.priority} PRIORITY
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Route: {recom.distanceKm} km (~{recom.estimatedHours}h transit)
                      </span>
                    </div>

                    <div className="text-slate-200">
                      <div className="font-semibold text-white text-sm">
                        Transfer {recom.quantity} units of {recom.supplyName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span className="text-emerald-400">{recom.sourceHospitalName} (Surplus)</span>
                        <span>➔</span>
                        <span className="text-rose-400">{recom.destHospitalName} (Critical Shortage)</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">{recom.reason}</p>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400">Cold-chain compliant</span>
                      <button
                        onClick={() => setActiveTab('redistribution')}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-semibold transition-colors flex items-center space-x-1"
                      >
                        <span>Review & Approve Transfer</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-slate-950/40 rounded-lg text-center text-slate-400 text-xs">
                  All hospitals currently maintaining safe equilibrium buffers.
                </div>
              )}

              {/* Expiry prevention recommendation */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    EXPIRY MITIGATION
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Prevent $5,950 Loss</span>
                </div>
                <div className="font-semibold text-white">
                  Memorial Healthcare: 120 Diagnostic Kits expiring in 14 days
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Expected facility burn is only 50 kits before expiration. Proactively redistribute 70 units to
                  University Teaching Hospital to prevent expiration waste.
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveTab('waste')}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-semibold transition-colors"
                  >
                    Open Waste Intelligence
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick Actions Speed-Dial Hub */}
      <DashboardQuickActions />
    </div>
  );
};
