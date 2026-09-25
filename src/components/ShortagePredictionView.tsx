import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertOctagon,
  Building2,
  Package,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  BarChart3,
  Activity,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Legend,
} from 'recharts';

type ForecastModel = 'LINEAR_MA' | 'EXPONENTIAL' | 'SURGE_STRESS';

export const ShortagePredictionView: React.FC = () => {
  const {
    hospitals,
    inventories,
    supplies,
    setActiveTab,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
    setBannerNotification,
    updateInventoryStock,
  } = useApp();

  // Selected hospital and supply for deep-dive projection
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-1'); // Default Metro General
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>('sup-1'); // Default IV Fluids
  const [forecastModel, setForecastModel] = useState<ForecastModel>('LINEAR_MA');
  const [forecastDaysAhead, setForecastDaysAhead] = useState<number>(30);
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(1.0); // 1.0 = normal, 1.5 = 50% surge
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const currentHospital = useMemo(() => {
    return hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
  }, [hospitals, selectedHospitalId]);

  const currentSupply = useMemo(() => {
    return supplies.find(s => s.id === selectedSupplyId) || supplies[0];
  }, [supplies, selectedSupplyId]);

  const activeInventory = useMemo(() => {
    return (
      inventories.find(
        i => i.hospitalId === selectedHospitalId && i.supplyId === selectedSupplyId
      ) || inventories[0]
    );
  }, [inventories, selectedHospitalId, selectedSupplyId]);

  // Historical 6-month consumption sequence
  const historical6Months = useMemo(() => {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const usage = activeInventory.history6Months && activeInventory.history6Months.length === 6
      ? activeInventory.history6Months
      : [
          Math.round(activeInventory.avgDailyConsumption * 29),
          Math.round(activeInventory.avgDailyConsumption * 31),
          Math.round(activeInventory.avgDailyConsumption * 30),
          Math.round(activeInventory.avgDailyConsumption * 32),
          Math.round(activeInventory.avgDailyConsumption * 33),
          Math.round(activeInventory.avgDailyConsumption * 30),
        ];

    return months.map((month, idx) => ({
      month,
      monthlyConsumption: usage[idx],
      dailyEquivalent: Math.round((usage[idx] / 30) * 10) / 10,
    }));
  }, [activeInventory]);

  // Derived predictive calculations accounting for model & surge
  const baselineDailyBurn = activeInventory.avgDailyConsumption;
  const effectiveDailyBurn = useMemo(() => {
    let burn = baselineDailyBurn;
    if (forecastModel === 'SURGE_STRESS') {
      burn = burn * Math.max(1.1, surgeMultiplier);
    } else if (forecastModel === 'EXPONENTIAL') {
      // Modest 12% week-on-week compound drift
      burn = burn * 1.12;
    }
    return Math.round(burn * 10) / 10;
  }, [baselineDailyBurn, forecastModel, surgeMultiplier]);

  const currentStock = activeInventory.currentStock;
  const daysRemaining = useMemo(() => {
    if (effectiveDailyBurn <= 0) return 999;
    return Math.max(0, Math.round((currentStock / effectiveDailyBurn) * 10) / 10);
  }, [currentStock, effectiveDailyBurn]);

  const minBufferStock = activeInventory.minStock;

  // Exact Depletion Date calculation from base simulated local date
  const estimatedDepletionDate = useMemo(() => {
    if (currentStock <= 0) return 'DEPLETED TODAY (CRITICAL ZERO)';
    const baseDate = new Date('2026-09-15T00:00:00');
    const shortageTimestamp = baseDate.getTime() + daysRemaining * 24 * 60 * 60 * 1000;
    const targetDate = new Date(shortageTimestamp);
    return targetDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [daysRemaining, currentStock]);

  // Buffer Breach Date calculation (when stock dips below safety reserve)
  const estimatedBufferBreachDate = useMemo(() => {
    if (currentStock <= minBufferStock) return 'Already Breached';
    const unitsAboveBuffer = currentStock - minBufferStock;
    const daysToBuffer = unitsAboveBuffer / effectiveDailyBurn;
    const baseDate = new Date('2026-09-15T00:00:00');
    const breachTimestamp = baseDate.getTime() + daysToBuffer * 24 * 60 * 60 * 1000;
    const targetDate = new Date(breachTimestamp);
    return targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, [currentStock, minBufferStock, effectiveDailyBurn]);

  // Generate multi-day forward forecast curve: Historical usage + Forecasted trajectory + Depletion milestone
  const projectionTimeline = useMemo(() => {
    const data: {
      day: string;
      projectedStock: number;
      safeBuffer: number;
      dailyConsumption: number;
      status: 'SAFE' | 'BUFFER_BREACH' | 'DEPLETED';
    }[] = [];
    const baseDate = new Date('2026-09-15T00:00:00');

    for (let d = 0; d <= forecastDaysAhead; d += 1) {
      const curDate = new Date(baseDate.getTime() + d * 24 * 60 * 60 * 1000);
      const dayLabel = curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      let expectedRemaining: number;
      if (forecastModel === 'EXPONENTIAL') {
        // Accelerating depletion
        const growthRate = 0.008; // 0.8% daily escalation
        const cumulativeBurn = baselineDailyBurn * ((Math.exp(growthRate * d) - 1) / growthRate || d);
        expectedRemaining = Math.max(0, Math.round(currentStock - cumulativeBurn));
      } else {
        expectedRemaining = Math.max(0, Math.round(currentStock - d * effectiveDailyBurn));
      }

      let status: 'SAFE' | 'BUFFER_BREACH' | 'DEPLETED' = 'SAFE';
      if (expectedRemaining <= 0) {
        status = 'DEPLETED';
      } else if (expectedRemaining < minBufferStock) {
        status = 'BUFFER_BREACH';
      }

      data.push({
        day: d === 0 ? 'Today (Sep 15)' : dayLabel,
        projectedStock: expectedRemaining,
        safeBuffer: minBufferStock,
        dailyConsumption: effectiveDailyBurn,
        status,
      });
    }
    return data;
  }, [currentStock, effectiveDailyBurn, minBufferStock, forecastDaysAhead, forecastModel, baselineDailyBurn]);

  // Ranked network shortage queue with exact depletion dates
  const urgentProjections = useMemo(() => {
    const baseDate = new Date('2026-09-15T00:00:00');
    return inventories
      .map(inv => {
        const hosp = hospitals.find(h => h.id === inv.hospitalId);
        const sup = supplies.find(s => s.id === inv.supplyId);
        const depTimestamp = baseDate.getTime() + inv.daysRemaining * 24 * 60 * 60 * 1000;
        const depDate = new Date(depTimestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        return {
          ...inv,
          hospitalName: hosp?.name || '',
          hospitalCode: hosp?.code || '',
          supplyName: sup?.name || '',
          unit: sup?.unit || '',
          depletionDate: depDate,
        };
      })
      .filter(item => {
        if (filterRisk === 'ALL') return true;
        return item.riskLevel === filterRisk;
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [inventories, hospitals, supplies, filterRisk]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Phase 3 Intelligence
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Historical Consumption → Forecast → Depletion Date
              </span>
            </div>
            <h1 className="text-lg font-bold text-white flex items-center space-x-2 mt-1.5">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Shortage Prediction & Depletion Forecasting Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Projects clinical runout timelines and precise depletion dates using 6 months of historical hospital consumption logs, daily moving averages, and dynamic patient surge elasticity.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setQuickAiPrompt(
                  `Provide a detailed runout audit for ${currentSupply.name} at ${currentHospital.name}. Days remaining: ${daysRemaining} days. Depletion date: ${estimatedDepletionDate}. What emergency mitigations or transfers should occur?`
                );
                setIsAiDrawerOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Shortage Audit</span>
            </button>
          </div>
        </div>

        {/* Facility & Supply Deep-Dive Selectors & Model Toggles */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Select Hospital Facility</span>
            </label>
            <select
              id="select-shortage-hospital"
              value={selectedHospitalId}
              onChange={e => setSelectedHospitalId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
            >
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.code}) — {h.riskLevel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Package className="w-3.5 h-3.5 text-teal-400" />
              <span>Select Medical Supply Item</span>
            </label>
            <select
              id="select-shortage-supply"
              value={selectedSupplyId}
              onChange={e => setSelectedSupplyId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
            >
              {supplies.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Forecasting Model</span>
            </label>
            <select
              id="select-forecast-model"
              value={forecastModel}
              onChange={e => setForecastModel(e.target.value as ForecastModel)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="LINEAR_MA">Historical 30d Moving Avg (Baseline)</option>
              <option value="EXPONENTIAL">Compound Weekly Demand Drift (+12%)</option>
              <option value="SURGE_STRESS">Epidemic Patient Surge Stress Test</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Projection Horizon</span>
              <span className="font-mono text-teal-400">{forecastDaysAhead} Days</span>
            </label>
            <div className="flex items-center space-x-2 pt-1">
              {[15, 30, 45].map(days => (
                <button
                  key={days}
                  onClick={() => setForecastDaysAhead(days)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                    forecastDaysAhead === days
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {forecastModel === 'SURGE_STRESS' && (
          <div className="mt-4 p-3.5 bg-amber-950/30 border border-amber-800/60 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-300">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Simulate Patient Surge:</strong> Adjust clinical consumption spike to analyze accelerated depletion date.
              </span>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={surgeMultiplier}
                onChange={e => setSurgeMultiplier(parseFloat(e.target.value))}
                className="w-36 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-amber-400 whitespace-nowrap">
                +{Math.round((surgeMultiplier - 1) * 100)}% Surge
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Target Item Forecasting Spotlight (Pipeline: History -> Forecast -> Depletion Date) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                {currentHospital.code}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  activeInventory.riskLevel === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : activeInventory.riskLevel === 'HIGH_RISK'
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {activeInventory.riskLevel} RUNOUT RISK
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {currentSupply.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2">
              {currentSupply.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Facility: <span className="text-slate-200">{currentHospital.name}</span> ({currentHospital.region}) • Bed Occupancy: {currentHospital.currentOccupancy}% • Unit Cost: ${currentSupply.unitCost}
            </p>
          </div>

          {/* Quick Stats Pipeline Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <span className="text-[11px] text-slate-400">1. Current Stock</span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {currentStock.toLocaleString()}{' '}
                <span className="text-[10px] text-slate-400 font-normal">{currentSupply.unit}</span>
              </div>
              <span className="text-[10px] text-slate-500">Buffer: {minBufferStock} units</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <span className="text-[11px] text-slate-400">2. Projected Burn</span>
              <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                {effectiveDailyBurn} / day
              </div>
              <span className="text-[10px] text-slate-500">
                {forecastModel === 'LINEAR_MA' ? '30d moving avg' : 'Surge-adjusted'}
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <span className="text-[11px] text-slate-400">3. Estimated Runway</span>
              <div
                className={`text-lg font-bold font-mono mt-0.5 ${
                  daysRemaining <= 7 ? 'text-rose-400' : daysRemaining <= 14 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {daysRemaining} Days
              </div>
              <span className="text-[10px] text-slate-500">Breach: {estimatedBufferBreachDate}</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-rose-900/60 rounded-lg bg-rose-950/20">
              <span className="text-[11px] text-rose-300 font-semibold flex items-center space-x-1">
                <AlertOctagon className="w-3 h-3 text-rose-400" />
                <span>4. Depletion Date</span>
              </span>
              <div className="text-xs font-bold font-mono text-rose-200 mt-1">
                {estimatedDepletionDate}
              </div>
              <span className="text-[10px] text-rose-300/80">Physical zero reserve</span>
            </div>
          </div>
        </div>

        {/* 6 Months Historical Consumption to Forecast Pipeline Visualization */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Historical Consumption Log (6 Months) */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Historical Consumption (Past 6 Months)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Recorded clinical usage logs used to calibrate baseline burn rate.
                </p>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historical6Months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(val: any) => [`${val} units`, 'Monthly Consumed']}
                  />
                  <Bar dataKey="monthlyConsumption" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] flex justify-between text-slate-400">
              <span>Historical Daily Average:</span>
              <span className="font-mono text-white font-bold">{baselineDailyBurn} units/day</span>
            </div>
          </div>

          {/* Right 2 Columns: Forward Runout Projection Curve */}
          <div className="lg:col-span-2 bg-slate-950/50 border border-slate-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  <span>Forward Runout Depletion Forecast ({forecastDaysAhead} Days)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Forecasted depletion trajectory intersecting minimum safety reserve ({minBufferStock} units) and physical zero.
                </p>
              </div>
              <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs"></span>
                  <span>Projected Stock</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs"></span>
                  <span>Min Buffer ({minBufferStock})</span>
                </span>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(val: any) => [`${val} units`, 'Projected Stock']}
                  />
                  <ReferenceLine
                    y={minBufferStock}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{ value: 'Min Buffer', fill: '#f59e0b', fontSize: 9, position: 'insideTopRight' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="projectedStock"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#stockGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Depletion Milestones Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Buffer Breach:</span>
                <span className="font-mono text-amber-400 font-bold">{estimatedBufferBreachDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Complete Depletion:</span>
                <span className="font-mono text-rose-400 font-bold">{estimatedDepletionDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setActiveTab('redistribution');
                    setBannerNotification(
                      `Automated Transfer Pipeline initiated for ${currentSupply.name} at ${currentHospital.name} to avoid depletion on ${estimatedDepletionDate}.`
                    );
                  }}
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded text-[11px] transition-colors flex items-center space-x-1"
                >
                  <span>Create Rebalance Transfer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {daysRemaining <= 7 && (
          <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center space-x-2 text-rose-300">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>CRITICAL RUNOUT ALERT:</strong> Daily consumption burn of {effectiveDailyBurn} units/day will completely exhaust on-hand reserves in <strong>{daysRemaining} days</strong> ({estimatedDepletionDate}). Immediate mutual-aid dispatch required.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('redistribution')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold shrink-0 transition-colors"
            >
              Dispatch Redistribution
            </button>
          </div>
        )}
      </div>

      {/* Network Depletion Date Ranking Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Network Depletion Projections & Runout Priority Queue</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked dynamically by closest depletion dates across all hospital locations.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Risk Filter:</span>
            {['ALL', 'CRITICAL', 'HIGH_RISK', 'WARNING', 'STABLE'].map(risk => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                  filterRisk === risk
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {risk.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Supply Item</th>
                <th className="py-2.5 px-3">Current Stock</th>
                <th className="py-2.5 px-3">Daily Burn (30d MA)</th>
                <th className="py-2.5 px-3">Runway (Days)</th>
                <th className="py-2.5 px-3">Depletion Date</th>
                <th className="py-2.5 px-3">Risk Tier</th>
                <th className="py-2.5 px-3 text-right">Inspect Curve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {urgentProjections.slice(0, 15).map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {item.hospitalName}
                    <span className="text-[10px] text-slate-500 font-mono ml-1.5">
                      ({item.hospitalCode})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{item.supplyName}</td>
                  <td className="py-2.5 px-3 font-mono text-white">
                    {item.currentStock.toLocaleString()} {item.unit}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {item.avgDailyConsumption}/day
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-mono font-bold ${
                        item.daysRemaining <= 7 ? 'text-rose-400' : item.daysRemaining <= 14 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.daysRemaining} days
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                    {item.depletionDate}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.riskLevel === 'HIGH_RISK'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.riskLevel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedHospitalId(item.hospitalId);
                        setSelectedSupplyId(item.supplyId);
                      }}
                      className="text-teal-400 hover:text-teal-300 font-semibold"
                    >
                      Inspect Curve →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
