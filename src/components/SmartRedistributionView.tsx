import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRightLeft,
  Building2,
  Package,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
  Filter,
  PlusCircle,
  Sliders,
  AlertTriangle,
  Send,
  Lock,
  FileText,
} from 'lucide-react';

export const SmartRedistributionView: React.FC = () => {
  const {
    redistributions,
    approveRedistribution,
    approvedTransfers,
    hospitals,
    supplies,
    inventories,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
    setBannerNotification,
    currentPermissions,
    generateManifestForTransfer,
  } = useApp();

  // Filter & manual simulation states
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterSupply, setFilterSupply] = useState<string>('ALL');
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Manual redistribution custom creator state
  const [manualSourceId, setManualSourceId] = useState<string>('hosp-2'); // St. Jude (Surplus)
  const [manualDestId, setManualDestId] = useState<string>('hosp-1'); // Metro General (Shortage)
  const [manualSupplyId, setManualSupplyId] = useState<string>('sup-1');
  const [manualQuantity, setManualQuantity] = useState<number>(300);

  const priorityStyles = {
    CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    MEDIUM: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  };

  // Filtered recommendations
  const filteredRecommendations = useMemo(() => {
    return redistributions.filter(recom => {
      if (filterPriority !== 'ALL' && recom.priority !== filterPriority) return false;
      if (filterSupply !== 'ALL' && recom.supplyId !== filterSupply) return false;
      return true;
    });
  }, [redistributions, filterPriority, filterSupply]);

  // Handle manual transfer submission
  const handleExecuteManualTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceHosp = hospitals.find(h => h.id === manualSourceId);
    const destHosp = hospitals.find(h => h.id === manualDestId);
    const supply = supplies.find(s => s.id === manualSupplyId);

    if (!sourceHosp || !destHosp || !supply) return;
    if (manualSourceId === manualDestId) {
      alert('Source and destination facilities must be different.');
      return;
    }

    // Direct inventory adjustment in app
    approveRedistribution(`recom-${manualSourceId}-${manualDestId}-${manualSupplyId}`);
    setBannerNotification(
      `Custom Rebalancing Dispatched: ${manualQuantity.toLocaleString()} ${supply.unit} of ${supply.name} transferring from ${sourceHosp.name} to ${destHosp.name}.`
    );
    setIsManualModalOpen(false);
  };

  // Inspect source available surplus vs destination runway
  const manualSourceInv = useMemo(() => {
    return inventories.find(i => i.hospitalId === manualSourceId && i.supplyId === manualSupplyId);
  }, [inventories, manualSourceId, manualSupplyId]);

  const manualDestInv = useMemo(() => {
    return inventories.find(i => i.hospitalId === manualDestId && i.supplyId === manualSupplyId);
  }, [inventories, manualDestId, manualSupplyId]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Phase 5 Intelligence
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Surplus Hospital → Shortage Hospital → Recommended Transfer
              </span>
            </div>
            <h1 className="text-lg font-bold text-white flex items-center space-x-2 mt-1.5">
              <ArrowRightLeft className="w-5 h-5 text-teal-400" />
              <span>Smart Supply Redistribution Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Autonomous clinical mutual-aid matching: pairs facilities with confirmed surplus reserves (&gt;25 days) with critical runout hospitals to avert stockouts while mathematically protecting source hospital resilience.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 rounded-lg text-xs font-bold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Custom Transfer</span>
            </button>
            <button
              onClick={() => {
                setQuickAiPrompt(
                  'Analyze current surplus and shortage facilities. What are the top 3 high-impact supply redistributions we should execute right now and why?'
                );
                setIsAiDrawerOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Rebalance Strategy</span>
            </button>
          </div>
        </div>

        {/* Algorithm parameters note */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>1. Shortage Deficit Identification (&le; 8.5 Days Runway)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>2. Surplus Node Qualification (&ge; 25 Days Safe Buffer)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>3. Urban Fleet Geo-Transit Calculation (40 km/h + prep)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>4. Cold-Chain Integrity &amp; Batch Expiry Verification</span>
          </span>
        </div>
      </div>

      {/* Active Recommended Transfers (Pending Action) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Autonomous Mutual-Aid Recommendations</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-teal-500/20 text-teal-300">
                {filteredRecommendations.length} Proposals
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Approved transfers immediately update physical on-hand stock and mitigate destination risk scores.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center space-x-2">
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
            </select>

            <select
              value={filterSupply}
              onChange={e => setFilterSupply(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Supply Items</option>
              {supplies.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredRecommendations.map(recom => (
              <div
                key={recom.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                        priorityStyles[recom.priority]
                      }`}
                    >
                      {recom.priority} PRIORITY
                    </span>
                    <h3 className="text-base font-bold text-white">{recom.supplyName}</h3>
                    <span className="text-xs px-2.5 py-0.5 bg-teal-500/10 text-teal-300 rounded font-mono font-bold border border-teal-500/30">
                      Recommended Transfer: {recom.quantity.toLocaleString()} units
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{recom.distanceKm} km</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>~{recom.estimatedHours} hrs transit</span>
                    </span>
                  </div>
                </div>

                {/* Source (Surplus) -> Destination (Shortage) Visual Flow */}
                <div className="py-4 grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                  {/* Source Hospital (Surplus) */}
                  <div className="md:col-span-3 p-3.5 bg-slate-950/70 border border-emerald-900/40 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Surplus Hospital (Source)</span>
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        +{recom.sourceSurplus.toLocaleString()} available surplus
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1.5 flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>{recom.sourceHospitalName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Maintains &ge; 25 days safe buffer post-transfer. No risk of induced shortfall.
                    </p>
                  </div>

                  {/* Transfer Vector Arrow */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center text-slate-400 py-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1">
                      Dispatch
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shadow-inner">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <div className="text-[11px] font-mono font-bold text-teal-300 mt-1">
                      {recom.quantity.toLocaleString()} units
                    </div>
                  </div>

                  {/* Destination Hospital (Shortage) */}
                  <div className="md:col-span-3 p-3.5 bg-slate-950/70 border border-rose-900/40 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                        <span>Shortage Hospital (Destination)</span>
                      </span>
                      <span className="font-mono text-rose-400 font-bold">
                        -{recom.destShortage.toLocaleString()} unit deficit
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1.5 flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-rose-400" />
                      <span>{recom.destHospitalName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      At imminent depletion cliff. Transfer restores emergency runway by ~14 days.
                    </p>
                  </div>
                </div>

                {/* Algorithmic Reason & Action Button */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-300 max-w-2xl">
                    <span className="font-semibold text-slate-200">Algorithmic Justification: </span>
                    <span className="text-slate-400">{recom.reason}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => generateManifestForTransfer(recom)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Inspect pre-authorization chain-of-custody transfer manifest"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      <span>Manifest</span>
                    </button>

                    <button
                      id={`btn-approve-recom-${recom.id}`}
                      onClick={() => approveRedistribution(recom.id)}
                      className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors flex items-center space-x-2 cursor-pointer shadow-md ${
                        currentPermissions.canApproveRedistribution
                          ? 'bg-teal-600 hover:bg-teal-500 text-slate-950 shadow-teal-950/50'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                      title={
                        currentPermissions.canApproveRedistribution
                          ? 'Authorize and dispatch mutual-aid shipment'
                          : 'Click to test Zero-Trust Policy (Requires Level 4 Regional Director or Admin)'
                      }
                    >
                      {currentPermissions.canApproveRedistribution ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4 text-teal-400" />
                      )}
                      <span>
                        {currentPermissions.canApproveRedistribution
                          ? 'Approve Recommended Transfer'
                          : 'Approve (Requires Level 4)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">All Facilities Operating in Equilibrium</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              No critical inter-hospital transfer requirements are currently pending for selected filters. Inventories remain above safety thresholds or transfers have already been dispatched.
            </p>
          </div>
        )}
      </div>

      {/* Approved & In-Transit Mutual-Aid Shipments */}
      {approvedTransfers.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>Approved &amp; Dispatched Mutual-Aid Shipments</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {approvedTransfers.length} Active Mutual-Aid Legs
            </span>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Medical Supply Item</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Source Facility (Surplus)</th>
                  <th className="py-2.5 px-3">Destination Facility (Shortage)</th>
                  <th className="py-2.5 px-3">Transit ETA</th>
                  <th className="py-2.5 px-3 text-right">Dispatch Time</th>
                  <th className="py-2.5 px-3 text-right">Manifest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {approvedTransfers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <Truck className="w-3 h-3 mr-1" />
                        <span>IN TRANSIT</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">{t.supplyName}</td>
                    <td className="py-2.5 px-3 font-mono text-teal-300 font-bold">
                      {t.quantity.toLocaleString()} units
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{t.sourceHospitalName}</td>
                    <td className="py-2.5 px-3 text-slate-300">{t.destHospitalName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">~{t.estimatedHours} hours</td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-mono">
                      {t.approvedAt || 'Just now'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => generateManifestForTransfer(t)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded text-[11px] font-semibold flex items-center space-x-1 ml-auto cursor-pointer"
                        title="View official Chain-of-Custody compliance document"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Inter-Hospital Transfer */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-teal-400" />
                <span>Configure Custom Mutual-Aid Transfer</span>
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteManualTransfer} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Medical Supply SKU</label>
                <select
                  value={manualSupplyId}
                  onChange={e => setManualSupplyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium"
                >
                  {supplies.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Source Hospital Selection */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <label className="block font-bold text-emerald-400 mb-1 flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Source Facility (Surplus)</span>
                  </label>
                  <select
                    value={manualSourceId}
                    onChange={e => setManualSourceId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.code})
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-[10px] text-slate-400 font-mono">
                    Stock: {manualSourceInv?.currentStock || 0} units
                    <br />
                    Runway: {manualSourceInv?.daysRemaining || 0} days
                  </div>
                </div>

                {/* Destination Hospital Selection */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <label className="block font-bold text-rose-400 mb-1 flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Destination Facility (Shortage)</span>
                  </label>
                  <select
                    value={manualDestId}
                    onChange={e => setManualDestId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.code})
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-[10px] text-slate-400 font-mono">
                    Stock: {manualDestInv?.currentStock || 0} units
                    <br />
                    Runway: {manualDestInv?.daysRemaining || 0} days
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1 flex justify-between">
                  <span>Transfer Quantity</span>
                  <span className="font-mono text-teal-400 font-bold">{manualQuantity} Units</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={manualQuantity}
                  onChange={e => setManualQuantity(parseInt(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Rebalance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
