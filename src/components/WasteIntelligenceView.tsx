import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Clock,
  Building2,
  Package,
  Layers,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

export const WasteIntelligenceView: React.FC = () => {
  const {
    batches,
    hospitals,
    supplies,
    inventories,
    setActiveTab,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
    setBannerNotification,
    addBatchRecord,
    updateBatchRecord,
    currentPermissions,
  } = useApp();

  // Filter and simulation states
  const [filterFacility, setFilterFacility] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState<boolean>(false);

  // Form state for creating/simulating a new lot expiry scenario
  const [formFacilityId, setFormFacilityId] = useState<string>('hosp-3');
  const [formSupplyId, setFormSupplyId] = useState<string>('sup-7');
  const [formBatchNumber, setFormBatchNumber] = useState<string>('LOT-EXP-2026-TEST');
  const [formQuantity, setFormQuantity] = useState<number>(100);
  const [formDaysToExpiry, setFormDaysToExpiry] = useState<number>(14);

  // Derived calculations across monitored batches
  const totalBatches = batches.length;
  const criticalExpiringBatches = batches.filter(b => b.daysUntilExpiry <= 15 && b.excessQuantity > 0);
  const criticalExpiringCount = criticalExpiringBatches.length;
  const totalExcessUnits = batches.reduce((acc, b) => acc + b.excessQuantity, 0);
  const totalFinancialLossRisk = batches.reduce((acc, b) => acc + b.financialLossRisk, 0);

  // Potential waste breakdown by supply category
  const wasteByCategory = useMemo(() => {
    const map: { [cat: string]: number } = {};
    batches.forEach(b => {
      const sup = supplies.find(s => s.id === b.supplyId);
      const cat = sup ? sup.category : 'General Medical';
      map[cat] = (map[cat] || 0) + b.financialLossRisk;
    });

    return Object.keys(map).map(cat => ({
      category: cat,
      financialRisk: map[cat],
    }));
  }, [batches, supplies]);

  // Filtered batch register
  const filteredBatches = useMemo(() => {
    return batches
      .filter(b => {
        if (filterFacility !== 'ALL' && b.facilityId !== filterFacility) return false;
        if (filterUrgency === 'CRITICAL' && (b.daysUntilExpiry > 15 || b.excessQuantity <= 0)) return false;
        if (filterUrgency === 'WARNING' && (b.daysUntilExpiry <= 15 || b.daysUntilExpiry > 30)) return false;
        if (filterUrgency === 'STABLE' && b.daysUntilExpiry <= 30) return false;
        return true;
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [batches, filterFacility, filterUrgency]);

  // Signature batch identified in prompt (Diagnostic kits at Memorial Healthcare)
  const signatureBatch = useMemo(() => {
    return batches.find(b => b.id === 'batch-01') || batches[0];
  }, [batches]);

  const handleCreateRedistributionForBatch = (batch: any) => {
    setActiveTab('redistribution');
    setBannerNotification(
      `Redistribution matched for ${batch.supplyName}: ${batch.excessQuantity} excess units flagged to prevent $${batch.financialLossRisk.toLocaleString()} expiry waste.`
    );
  };

  const handleMarkPriorityUsage = (batch: any) => {
    setBannerNotification(
      `Protocol Updated: Batch ${batch.batchNumber} marked for Priority First-In-First-Out (FIFO) Clinical Consumption at ${batch.facilityName}.`
    );
  };

  // Submit simulated new batch
  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const fac = hospitals.find(h => h.id === formFacilityId);
    const sup = supplies.find(s => s.id === formSupplyId);
    if (!fac || !sup) return;

    // Find daily consumption burn for this facility & supply
    const inv = inventories.find(i => i.hospitalId === formFacilityId && i.supplyId === formSupplyId);
    const dailyBurn = inv ? inv.avgDailyConsumption : 5;

    // Pipeline: Expiry + Inventory -> Potential Waste
    // expectedUsage = dailyBurn * daysUntilExpiry
    const expectedUsage = Math.round(dailyBurn * formDaysToExpiry);
    const excess = Math.max(0, formQuantity - expectedUsage);
    const riskDollar = Math.round(excess * sup.unitCost);

    const baseDate = new Date('2026-09-15T00:00:00');
    const expDate = new Date(baseDate.getTime() + formDaysToExpiry * 24 * 60 * 60 * 1000);
    const expString = expDate.toISOString().split('T')[0];

    addBatchRecord({
      facilityId: formFacilityId,
      facilityName: fac.name,
      supplyId: formSupplyId,
      supplyName: sup.name,
      batchNumber: formBatchNumber,
      quantity: formQuantity,
      expiryDate: expString,
      daysUntilExpiry: formDaysToExpiry,
      unitCost: sup.unitCost,
      expectedUsageBeforeExpiry: expectedUsage,
      excessQuantity: excess,
      financialLossRisk: riskDollar,
      status: formDaysToExpiry <= 15 && excess > 0 ? 'CRITICAL_EXPIRY' : formDaysToExpiry <= 30 ? 'WARNING' : 'ACTIVE',
    });

    setIsSimulateModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Phase 4 Intelligence
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Expiry Date + Inventory Stock → Potential Waste ($)
              </span>
            </div>
            <h1 className="text-lg font-bold text-white flex items-center space-x-2 mt-1.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Waste Intelligence & Expiry Prevention Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Audits physical shelf-life maturity against projected patient consumption. Detects surplus lots destined for expiration before clinical use, quantifying financial loss risk and auto-generating proactive inter-facility transfers.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSimulateModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 rounded-lg text-xs font-bold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simulate New Lot Expiry</span>
            </button>
            <button
              onClick={() => {
                setQuickAiPrompt(
                  `Provide an audit of expiring inventory across the network. Which supplies have the highest financial discard risk, and what transfer actions will save money?`
                );
                setIsAiDrawerOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Waste Advisor</span>
            </button>
          </div>
        </div>

        {/* Financial & Volume KPIs */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-slate-800">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400">1. Monitored Lots</span>
            <div className="text-xl font-bold text-white mt-1">{totalBatches} Batches</div>
            <span className="text-[11px] text-slate-500">Across regional network</span>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-rose-900/60 rounded-lg bg-rose-950/20">
            <span className="text-xs text-rose-300">2. Critical Expiry (&le;15d)</span>
            <div className="text-xl font-bold text-rose-400 mt-1">{criticalExpiringCount} Lots</div>
            <span className="text-[11px] text-rose-300/80">Immediate transfer required</span>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400">3. Projected Discard Units</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {totalExcessUnits.toLocaleString()} Units
            </div>
            <span className="text-[11px] text-slate-500">Stock &gt; Expected clinical burn</span>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400">4. Potential Discard Value</span>
            <div className="text-xl font-bold text-white mt-1 font-mono">
              ${totalFinancialLossRisk.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-400">100% Recoverable via Transfer</span>
          </div>
        </div>
      </div>

      {/* Signature Real-World Waste Mitigation Spotlight */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-xl p-5 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Automated Expiry Prevention Transfer Proposal
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                {signatureBatch.batchNumber}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Expires: {signatureBatch.expiryDate} ({signatureBatch.daysUntilExpiry} days left)
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mt-1.5">
              Prevent ${signatureBatch.financialLossRisk.toLocaleString()} Discard: {signatureBatch.supplyName} at {signatureBatch.facilityName}
            </h3>

            {/* Waste Calculation Pipeline Breakdown */}
            <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Physical Stock:</span>
                <div className="font-mono font-bold text-white mt-0.5">
                  {signatureBatch.quantity.toLocaleString()} units
                </div>
              </div>
              <div>
                <span className="text-slate-400">Projected Usage:</span>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {signatureBatch.expectedUsageBeforeExpiry} units
                </div>
              </div>
              <div>
                <span className="text-amber-400 font-semibold">Potential Waste:</span>
                <div className="font-mono font-bold text-amber-300 mt-0.5">
                  {signatureBatch.excessQuantity} excess units
                </div>
              </div>
              <div>
                <span className="text-rose-400 font-semibold">Value at Risk:</span>
                <div className="font-mono font-bold text-rose-300 mt-0.5">
                  ${signatureBatch.financialLossRisk.toLocaleString()}
                </div>
              </div>
            </div>

            <blockquote className="mt-3 pl-3 border-l-2 border-amber-400 text-xs italic text-amber-200/90 font-medium">
              &quot;Diagnostic kits expire on Sept 28, 2026. Memorial Healthcare burn rate cannot consume all 120 test kits before expiry, leaving 70 units wasted. Recommend dispatching 70 units to University Teaching Hospital (or a facility with higher viral testing demand) before shelf-life maturity.&quot;
            </blockquote>

            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('redistribution');
                  setBannerNotification(
                    `Smart Redistribution opened: Transfer ${signatureBatch.excessQuantity} Diagnostic Kits from Memorial Healthcare to University Teaching Hospital to save $${signatureBatch.financialLossRisk.toLocaleString()}.`
                  );
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <span>Initiate Prevention Transfer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleMarkPriorityUsage(signatureBatch)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Mark Priority FIFO Usage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Discard Risk Chart & Expiry Horizon Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Potential Waste Risk by Category</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dollar value ($) of excess stock scheduled to expire without consumption.
          </p>

          <div className="h-44 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteByCategory} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={val => `$${val}`} />
                <YAxis dataKey="category" type="category" tick={{ fill: '#94a3b8', fontSize: 9 }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, 'Value at Risk']}
                />
                <Bar dataKey="financialRisk" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                  {wasteByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.financialRisk > 3000 ? '#f43f5e' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>Shelf-Life Expiration Audit Table</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calculates: Expiry Date + Inventory Stock → Potential Waste Quantity & Financial Loss Risk.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center space-x-2">
              <select
                value={filterFacility}
                onChange={e => setFilterFacility(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Facilities</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>

              <select
                value={filterUrgency}
                onChange={e => setFilterUrgency(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Horizons</option>
                <option value="CRITICAL">Critical &le; 15 Days</option>
                <option value="WARNING">Warning 16-30 Days</option>
                <option value="STABLE">Stable &gt; 30 Days</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Facility</th>
                  <th className="py-2.5 px-3">Supply Item</th>
                  <th className="py-2.5 px-3">Lot #</th>
                  <th className="py-2.5 px-3">On-Hand</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3">Days Left</th>
                  <th className="py-2.5 px-3">Expected Burn</th>
                  <th className="py-2.5 px-3">Excess (Waste)</th>
                  <th className="py-2.5 px-3">Loss Risk ($)</th>
                  <th className="py-2.5 px-3 text-right">Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredBatches.map(batch => {
                  const isCritical = batch.daysUntilExpiry <= 15 && batch.excessQuantity > 0;
                  const isWarning = batch.daysUntilExpiry <= 30;

                  return (
                    <tr
                      key={batch.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCritical ? 'bg-rose-950/15' : isWarning ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-semibold text-white">
                        {batch.facilityName}
                      </td>
                      <td className="py-2 px-3 text-slate-200">{batch.supplyName}</td>
                      <td className="py-2 px-3 font-mono text-slate-400">{batch.batchNumber}</td>
                      <td className="py-2 px-3 font-mono font-bold text-white">
                        {batch.quantity.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">{batch.expiryDate}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`font-mono font-bold ${
                            batch.daysUntilExpiry <= 15
                              ? 'text-rose-400'
                              : batch.daysUntilExpiry <= 30
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {batch.daysUntilExpiry}d
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">
                        {batch.expectedUsageBeforeExpiry}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`font-mono font-bold ${
                            batch.excessQuantity > 0 ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          {batch.excessQuantity > 0 ? `+${batch.excessQuantity}` : '0'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`font-mono font-bold ${
                            batch.financialLossRisk > 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          ${batch.financialLossRisk.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {batch.status === 'QUARANTINED' ? (
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold">
                              QUARANTINED
                            </span>
                          ) : (
                            <button
                              id={`btn-quarantine-${batch.id}`}
                              onClick={() => updateBatchRecord(batch.id, { status: 'QUARANTINED' })}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-600/60 rounded text-[10px] transition-colors"
                              title={currentPermissions.canQuarantineBatch ? 'Quarantine pharmaceutical lot' : 'Requires Clinical Pharmacist Clearance'}
                            >
                              Quarantine
                            </button>
                          )}
                          {batch.excessQuantity > 0 && batch.status !== 'QUARANTINED' && (
                            <button
                              onClick={() => handleCreateRedistributionForBatch(batch)}
                              className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-[10px] transition-colors"
                            >
                              Transfer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Simulate New Lot Expiry Scenario */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-teal-400" />
                <span>Simulate New Batch Expiry</span>
              </h3>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Target Facility</label>
                <select
                  value={formFacilityId}
                  onChange={e => setFormFacilityId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Supply Item</label>
                <select
                  value={formSupplyId}
                  onChange={e => setFormSupplyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  {supplies.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (${s.unitCost}/unit)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Lot / Batch Number</label>
                  <input
                    type="text"
                    value={formBatchNumber}
                    onChange={e => setFormBatchNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Lot Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formQuantity}
                    onChange={e => setFormQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1 flex justify-between">
                  <span>Days Until Expiration</span>
                  <span className="font-mono text-amber-400 font-bold">{formDaysToExpiry} Days</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="90"
                  value={formDaysToExpiry}
                  onChange={e => setFormDaysToExpiry(parseInt(e.target.value) || 14)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Estimated Daily Consumption:</span>
                  <span className="font-mono text-white">~4-8 units/day</span>
                </div>
                <div className="flex justify-between text-amber-300 font-medium">
                  <span>Calculated Excess Units:</span>
                  <span className="font-mono">
                    {Math.max(0, formQuantity - formDaysToExpiry * 5)} units
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Add Lot to Waste Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
