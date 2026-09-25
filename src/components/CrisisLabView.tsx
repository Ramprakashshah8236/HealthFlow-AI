import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Activity,
  Truck,
  TrendingDown,
  AlertOctagon,
  Building2,
  Package,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Clock,
  Zap,
  Sliders,
  Radio,
  Share2,
  Users,
  Lock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

export const CrisisLabView: React.FC = () => {
  const {
    crisisParams,
    updateCrisisParams,
    runCrisisSimulation,
    simulationResult,
    isSimulating,
    resetCrisis,
    hospitals,
    inventories,
    setActiveTab,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
    currentPermissions,
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Baseline figures
  const baselineCriticalHospitals = hospitals.filter(h => h.riskLevel === 'CRITICAL').length;
  const baselineCriticalSupplies = inventories.filter(i => i.daysRemaining <= 7).length;
  const baselineAvgRunway = Number(
    (inventories.reduce((acc, i) => acc + i.daysRemaining, 0) / inventories.length).toFixed(1)
  );

  const handleApplyPreset = (preset: {
    disease: number;
    supplier: number;
    delay: number;
    patient: number;
  }) => {
    updateCrisisParams({
      diseaseDemandIncreasePct: preset.disease,
      supplierCapacityReductionPct: preset.supplier,
      transportDelayDays: preset.delay,
      hospitalPatientLoadIncreasePct: preset.patient,
    });
  };

  // Comparison chart data (Before vs After)
  const comparisonData = simulationResult
    ? [
        {
          name: 'Critical Facilities',
          Before: simulationResult.criticalHospitalsBefore,
          After: simulationResult.criticalHospitalsAfter,
        },
        {
          name: 'Critical Supply SKUs',
          Before: simulationResult.suppliesAtRiskBefore,
          After: simulationResult.suppliesAtRiskAfter,
        },
        {
          name: 'Avg Runway (Days)',
          Before: simulationResult.avgDaysReserveBefore,
          After: simulationResult.avgDaysReserveAfter,
        },
      ]
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Signature Banner */}
      <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-800/80 rounded-xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Phase 6 — Crisis Lab ⭐
              </span>
              <span className="text-xs text-rose-300/80 font-mono">
                Demand + Supplier + Transport Stress Simulator
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1.5 flex items-center space-x-2">
              <Flame className="w-6 h-6 text-rose-500" />
              <span>Crisis Lab — Whole-Network Simulation Engine</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dynamically model multidimensional shocks: surges in clinical patient demand, upstream supplier manufacturing halts, and freight transportation delays. Recalculates runout trajectories across the entire regional network in real time.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={resetCrisis}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
            <button
              id="btn-simulate-crisis"
              onClick={runCrisisSimulation}
              disabled={isSimulating}
              className={`flex items-center space-x-2 px-5 py-2.5 font-bold rounded-lg text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50 ${
                currentPermissions.canRunCrisisSimulation
                  ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-rose-950/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-rose-500/40 shadow-slate-950'
              }`}
              title={
                currentPermissions.canRunCrisisSimulation
                  ? 'Execute network-wide shock simulation'
                  : 'Click to test Zero-Trust Policy (Requires Level 4 Regional Director)'
              }
            >
              {currentPermissions.canRunCrisisSimulation ? (
                <Flame className="w-4 h-4 text-rose-200" />
              ) : (
                <Lock className="w-4 h-4 text-rose-400" />
              )}
              <span>
                {isSimulating
                  ? 'Recalculating Network...'
                  : currentPermissions.canRunCrisisSimulation
                  ? 'SIMULATE ENTIRE NETWORK'
                  : 'SIMULATE (Requires Level 4)'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Crisis Scenario Presets */}
        <div className="mt-5 pt-4 border-t border-rose-900/40">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Load Rapid Stress Scenarios:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleApplyPreset({ disease: 40, supplier: 0, delay: 0, patient: 35 })}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs text-slate-200 transition-colors"
            >
              <div className="font-semibold text-rose-300 flex items-center justify-between">
                <span>1. Epidemic Demand Surge</span>
                <span className="text-[10px] text-rose-400 font-mono font-bold">+40%</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Demand +40%, Patient admissions +35%
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset({ disease: 10, supplier: 40, delay: 7, patient: 10 })}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs text-slate-200 transition-colors"
            >
              <div className="font-semibold text-amber-300 flex items-center justify-between">
                <span>2. Supplier Halts &amp; Embargo</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">-40%</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                -40% Supplier Capacity, +7d Port Delay
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset({ disease: 15, supplier: 20, delay: 10, patient: 15 })}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs text-slate-200 transition-colors"
            >
              <div className="font-semibold text-cyan-300 flex items-center justify-between">
                <span>3. Transport Gridlock Shock</span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">+10d</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                +10 Days Freight Delay, -20% Supply
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset({ disease: 85, supplier: 45, delay: 8, patient: 75 })}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs text-slate-200 transition-colors"
            >
              <div className="font-semibold text-rose-400 flex items-center justify-between">
                <span>4. Catastrophic Compound Crisis</span>
                <span className="text-[10px] text-rose-400 font-mono font-bold">MAX</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                +85% Demand, -45% Supplier, +8d Transport
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Multidimensional Stress Parameter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-rose-400" />
          <span>Multidimensional Shock Parameters</span>
          <span className="text-xs text-slate-400 font-normal">
            (Adjust clinical demand, manufacturing capacity, and transportation vectors)
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vector 1: Disease Demand Increase */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>Demand Shock</span>
              </label>
              <span className="font-mono font-bold text-rose-400 text-sm">
                +{crisisParams.diseaseDemandIncreasePct}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">Escalates daily consumption rate on supplies</p>
            <input
              id="slider-disease-demand"
              type="range"
              min="0"
              max="100"
              value={crisisParams.diseaseDemandIncreasePct}
              onChange={e =>
                updateCrisisParams({ diseaseDemandIncreasePct: Number(e.target.value) })
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0% (Standard)</span>
              <span>+50%</span>
              <span>+100% (2x)</span>
            </div>
          </div>

          {/* Vector 2: Supplier Capacity Reduction */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Supplier Outages</span>
              </label>
              <span className="font-mono font-bold text-amber-400 text-sm">
                -{crisisParams.supplierCapacityReductionPct}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">Reduces manufacturer replenishment shipments</p>
            <input
              id="slider-supplier-capacity"
              type="range"
              min="0"
              max="50"
              value={crisisParams.supplierCapacityReductionPct}
              onChange={e =>
                updateCrisisParams({ supplierCapacityReductionPct: Number(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0% (Full Output)</span>
              <span>-25%</span>
              <span>-50% (Halved)</span>
            </div>
          </div>

          {/* Vector 3: Transport Delay */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Transport Delays</span>
              </label>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                +{crisisParams.transportDelayDays} Days
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">Extends lead time on inbound truck &amp; air freight</p>
            <input
              id="slider-transport-delay"
              type="range"
              min="0"
              max="10"
              value={crisisParams.transportDelayDays}
              onChange={e => updateCrisisParams({ transportDelayDays: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0d (On-time)</span>
              <span>+5 Days</span>
              <span>+10 Days</span>
            </div>
          </div>

          {/* Vector 4: Hospital Patient Load Increase */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Patient Admissions</span>
              </label>
              <span className="font-mono font-bold text-purple-400 text-sm">
                +{crisisParams.hospitalPatientLoadIncreasePct}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">Surges ICU and acute emergency bed occupancy</p>
            <input
              id="slider-patient-load"
              type="range"
              min="0"
              max="100"
              value={crisisParams.hospitalPatientLoadIncreasePct}
              onChange={e =>
                updateCrisisParams({ hospitalPatientLoadIncreasePct: Number(e.target.value) })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0% (Standard)</span>
              <span>+50%</span>
              <span>+100% (Surge)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SIMULATION RESULTS: BEFORE VS AFTER */}
      {simulationResult ? (
        <div className="space-y-6">
          {/* Comparison Cards: Before vs After */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Critical Hospitals */}
            <div className="bg-slate-900 border border-rose-900/60 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Critical Risk Facilities</span>
                <Building2 className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline space-x-3 mt-3">
                <div className="text-xl text-slate-400">
                  <span className="text-xs block text-slate-500 font-mono uppercase">Baseline</span>
                  {simulationResult.criticalHospitalsBefore}
                </div>
                <ArrowRight className="w-4 h-4 text-rose-500" />
                <div className="text-3xl font-extrabold text-rose-400">
                  <span className="text-xs block text-rose-300 font-mono uppercase">Post-Crisis</span>
                  {simulationResult.criticalHospitalsAfter}
                </div>
              </div>
              <div className="text-xs text-rose-300/80 mt-2">
                +{simulationResult.criticalHospitalsAfter - simulationResult.criticalHospitalsBefore} facilities crossed critical risk limits
              </div>
            </div>

            {/* Critical Supplies */}
            <div className="bg-slate-900 border border-amber-900/60 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Supplies At Risk (&le; 7d)</span>
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline space-x-3 mt-3">
                <div className="text-xl text-slate-400">
                  <span className="text-xs block text-slate-500 font-mono uppercase">Baseline</span>
                  {simulationResult.suppliesAtRiskBefore}
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500" />
                <div className="text-3xl font-extrabold text-amber-400">
                  <span className="text-xs block text-amber-300 font-mono uppercase">Post-Crisis</span>
                  {simulationResult.suppliesAtRiskAfter}
                </div>
              </div>
              <div className="text-xs text-amber-300/80 mt-2">
                +{simulationResult.suppliesAtRiskAfter - simulationResult.suppliesAtRiskBefore} SKUs face imminent stockout
              </div>
            </div>

            {/* Average Days of Reserve */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Network Average Runway</span>
                <Clock className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex items-baseline space-x-3 mt-3">
                <div className="text-xl text-slate-400">
                  <span className="text-xs block text-slate-500 font-mono uppercase">Baseline</span>
                  {simulationResult.avgDaysReserveBefore}d
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <div className="text-3xl font-extrabold text-white">
                  <span className="text-xs block text-slate-400 font-mono uppercase">Post-Crisis</span>
                  {simulationResult.avgDaysReserveAfter}d
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Net operational contraction: -
                {(simulationResult.avgDaysReserveBefore - simulationResult.avgDaysReserveAfter).toFixed(1)} days
              </div>
            </div>
          </div>

          {/* Visual Chart Comparison & AI Action Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Visual Bar Chart Comparison */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Network Impact Metrics: Baseline vs Post-Crisis
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="Before" name="Baseline" fill="#475569" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="After" name="Post-Crisis Impact" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Assistant Action Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-teal-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Query Clinical AI On This Simulation
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Synthesize the network crisis and prioritize immediate countermeasures.
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  HealthFlow AI will cross-reference the {simulationResult.criticalHospitalsAfter} critical hospitals,
                  compressed supplier channels, and runout shifts to generate an optimal contingency mobilization protocol.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Shock: Demand +{crisisParams.diseaseDemandIncreasePct}%, Supplier -{crisisParams.supplierCapacityReductionPct}%, Transit +{crisisParams.transportDelayDays}d
                </span>
                <button
                  id="btn-ask-gemini-crisis"
                  onClick={() => {
                    setQuickAiPrompt(
                      `Explain the current crisis simulation: Demand increased by +${crisisParams.diseaseDemandIncreasePct}%, supplier capacity reduced by -${crisisParams.supplierCapacityReductionPct}%, transport delayed by +${crisisParams.transportDelayDays} days. Critical hospitals rose from ${simulationResult.criticalHospitalsBefore} to ${simulationResult.criticalHospitalsAfter}. What emergency actions should be prioritized?`
                    );
                    setIsAiDrawerOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Advisor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Lists: Newly Critical Hospitals & Accelerated Runout Shifts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Newly Critical Facilities */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center space-x-1.5 mb-3">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Facilities Entering Critical Risk Status</span>
              </h3>

              {simulationResult.newCriticalHospitals.length > 0 ? (
                <div className="space-y-2">
                  {simulationResult.newCriticalHospitals.map((hName, i) => (
                    <div
                      key={i}
                      className="p-3 bg-rose-950/25 border border-rose-900/40 rounded-lg text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-rose-400" />
                        <span className="font-bold text-white">{hName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        CRITICAL SURGE
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-950/50 rounded-lg text-xs text-slate-400">
                  Existing critical facilities experienced further contraction, but no new facilities crossed into critical status.
                </div>
              )}

              {/* Newly Critical Supplies */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 mb-2">
                  Supplies Breaching Critical Thresholds:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {simulationResult.newCriticalSupplies.map((sName, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-200"
                    >
                      {sName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Accelerated Runout Dates Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5 mb-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Accelerated Shortage Dates &amp; Runout Shifts</span>
              </h3>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Facility</th>
                      <th className="py-2 px-3">Supply Item</th>
                      <th className="py-2 px-3">Baseline Runway</th>
                      <th className="py-2 px-3 font-bold text-rose-400">Crisis Runway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {simulationResult.runoutShifts.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-medium text-white">{r.hospitalName}</td>
                        <td className="py-2 px-3 text-slate-300">{r.supplyName}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">{r.beforeDays} days</td>
                        <td className="py-2 px-3 font-mono font-bold text-rose-400">
                          {r.shortageDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recommended Redistribution in Crisis */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {simulationResult.urgentTransfersNeeded} Emergency Redistribution transfers required
                </span>
                <button
                  onClick={() => setActiveTab('redistribution')}
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1"
                >
                  <span>Open Smart Redistribution</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state before running simulation */
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <Flame className="w-12 h-12 text-rose-500/60 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Ready for Whole-Network Stress Test</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
            Choose a preset or configure the shock parameters above to stress-test your healthcare supply network.
            Click <strong>[ SIMULATE ENTIRE NETWORK ]</strong> to recalculate runout curves and identify vulnerable facilities.
          </p>
          <button
            onClick={runCrisisSimulation}
            className="mt-4 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors"
          >
            Run Immediate Network Simulation (+40% Epidemic Surge)
          </button>
        </div>
      )}
    </div>
  );
};
