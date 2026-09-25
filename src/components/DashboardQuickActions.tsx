import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  PlusCircle,
  Truck,
  Pill,
  ShieldAlert,
  Sparkles,
  X,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Clock,
  Building2,
  Package,
  Layers,
  FileText,
  Lock,
} from 'lucide-react';

export const DashboardQuickActions: React.FC = () => {
  const {
    hospitals,
    supplies,
    inventories,
    updateInventoryStock,
    redistributions,
    approveRedistribution,
    approvedTransfers,
    generateManifestForTransfer,
    currentPermissions,
    currentUser,
    logSecurityAction,
    setBannerNotification,
    setActiveTab,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
    quarantineRecallBatches,
    recalls,
  } = useApp();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isPendingTransfersDrawerOpen, setIsPendingTransfersDrawerOpen] = useState<boolean>(false);

  // Emergency Request Form state
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    currentUser.assignedHospitalId && currentUser.assignedHospitalId !== 'all'
      ? currentUser.assignedHospitalId
      : hospitals[0]?.id || 'hosp-1'
  );
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>(supplies[0]?.id || 'sup-1');
  const [urgencyTier, setUrgencyTier] = useState<'STAT' | 'CRITICAL' | 'URGENT'>('STAT');
  const [requestedQuantity, setRequestedQuantity] = useState<number>(250);
  const [clinicalReason, setClinicalReason] = useState<string>('Acute ICU surge & imminent stockout threshold');

  const pendingTransfers = redistributions.filter(r => r.status !== 'APPROVED');

  const handleOpenEmergencyRequest = () => {
    setIsOpen(false);
    setIsEmergencyModalOpen(true);
  };

  const handleOpenPendingTransfers = () => {
    setIsOpen(false);
    setIsPendingTransfersDrawerOpen(true);
  };

  const handleSubmitEmergencyRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const hospital = hospitals.find(h => h.id === selectedHospitalId);
    const supply = supplies.find(s => s.id === selectedSupplyId);
    const currentInv = inventories.find(
      i => i.hospitalId === selectedHospitalId && i.supplyId === selectedSupplyId
    );

    if (!hospital || !supply) return;

    const newStock = (currentInv?.currentStock || 0) + requestedQuantity;
    updateInventoryStock(selectedHospitalId, selectedSupplyId, newStock);

    logSecurityAction(
      'TRANSFER_DISPATCH',
      `Emergency STAT Order: ${supply.name}`,
      `Dispatched ${requestedQuantity} ${supply.unit} to ${hospital.name} under ${urgencyTier} priority. Justification: "${clinicalReason}".`,
      'SUCCESS'
    );

    setBannerNotification(
      `Emergency Request Approved (Priority ${urgencyTier}): ${requestedQuantity} units of ${supply.name} allocated to ${hospital.name}. Runway updated.`
    );

    setIsEmergencyModalOpen(false);
  };

  const handleQuickQuarantine = () => {
    setIsOpen(false);
    const activeRecall = recalls.find(r => r.status !== 'QUARANTINED_ALL');
    if (activeRecall) {
      quarantineRecallBatches(activeRecall.id);
    } else {
      setActiveTab('recalls');
      setBannerNotification('Recalls & Quarantine: Inspect active regulatory lot recalls.');
    }
  };

  const handleQuickAiBriefing = () => {
    setIsOpen(false);
    setQuickAiPrompt(
      'Perform a rapid morning situational triage of the regional hospital network. Identify any facilities with imminent depletion cliffs (<7 days) and recommend immediate reallocations.'
    );
    setIsAiDrawerOpen(true);
  };

  return (
    <>
      {/* Floating Speed Dial Trigger Button */}
      <div className="fixed bottom-6 right-6 z-35 flex flex-col items-end">
        {/* Expanded Floating Menu Popover */}
        {isOpen && (
          <div className="mb-3 bg-slate-900/95 border border-teal-500/40 backdrop-blur-md rounded-2xl p-3 shadow-2xl shadow-teal-950/60 w-72 sm:w-80 space-y-1.5 animate-in fade-in slide-in-from-bottom-4 duration-200 text-left">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-teal-400" />
                <span>Quick Actions Hub</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action 1: Emergency Stock Request */}
            <button
              onClick={handleOpenEmergencyRequest}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 group-hover:bg-rose-500/30 shrink-0">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-teal-300">
                    Emergency Stock Request
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    STAT
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Instantly request life-saving replenishment
                </p>
              </div>
            </button>

            {/* Action 2: View Pending Transfers */}
            <button
              onClick={handleOpenPendingTransfers}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 group-hover:bg-teal-500/30 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-teal-300">
                    Pending Transfers
                  </span>
                  {pendingTransfers.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                      {pendingTransfers.length} Ready
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Review &amp; approve mutual-aid shipments
                </p>
              </div>
            </button>

            {/* Action 3: Clinical Drug Substitutions */}
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveTab('substitutions');
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:bg-purple-500/30 shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-teal-300">
                    Clinical Substitutions
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Rx
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  FDA bioequivalent drug alternatives
                </p>
              </div>
            </button>

            {/* Action 4: Quarantine Recalled Lot */}
            <button
              onClick={handleQuickQuarantine}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:bg-amber-500/30 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-teal-300">
                    Quarantine Recalled Lots
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    FDA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Lockout defective lots across Pyxis
                </p>
              </div>
            </button>

            {/* Action 5: AI Operational Briefing */}
            <button
              onClick={handleQuickAiBriefing}
              className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-teal-950/50 to-slate-900 hover:from-teal-900/50 hover:to-slate-850 border border-teal-500/20 transition-colors flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-teal-300">
                    Ask AI Situational Triage
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">
                    Gemini
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Instant network risk synthesis
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Floating Action Trigger Button */}
        <button
          id="btn-floating-quick-actions"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-4 py-3 rounded-full font-bold text-xs shadow-2xl transition-all cursor-pointer border ${
            isOpen
              ? 'bg-teal-500 text-slate-950 border-teal-400 ring-4 ring-teal-500/30'
              : 'bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white border-teal-400/50 hover:scale-105'
          }`}
          title="Quick Actions Menu: Trigger common hospital emergency workflows without navigating menus"
        >
          <Zap className={`w-4 h-4 ${isOpen ? 'rotate-90' : ''} transition-transform duration-200`} />
          <span className="tracking-wide">Quick Actions</span>
          {pendingTransfers.length > 0 && !isOpen && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Emergency Stock Request Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Emergency Stock Requisition (STAT)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct mutual-aid allocation to resolve acute bedside depletion cliffs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEmergencyRequest} className="space-y-4 text-xs">
              {/* Facility Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Recipient Hospital Facility:
                </label>
                <select
                  value={selectedHospitalId}
                  onChange={e => setSelectedHospitalId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.region}) — Risk: {h.riskLevel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supply Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Formulary Medical Supply Item:
                </label>
                <select
                  value={selectedSupplyId}
                  onChange={e => setSelectedSupplyId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                >
                  {supplies.map(s => {
                    const activeInv = inventories.find(
                      i => i.hospitalId === selectedHospitalId && i.supplyId === s.id
                    );
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category}) — On hand: {activeInv?.currentStock || 0} {s.unit} ({activeInv?.daysRemaining || 0}d)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Urgency & Quantity Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urgency Priority:</label>
                  <select
                    value={urgencyTier}
                    onChange={e => setUrgencyTier(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-teal-500"
                  >
                    <option value="STAT">STAT (Immediate &lt; 2h)</option>
                    <option value="CRITICAL">CRITICAL (&lt; 6h)</option>
                    <option value="URGENT">URGENT (&lt; 12h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity Needed:</label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    step="10"
                    value={requestedQuantity}
                    onChange={e => setRequestedQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Justification Reason */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Clinical &amp; Operational Justification:
                </label>
                <input
                  type="text"
                  value={clinicalReason}
                  onChange={e => setClinicalReason(e.target.value)}
                  placeholder="e.g. ICU admissions exceeded 95%, supplier order delayed"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                Action will immediately increment physical stock count, update depletion runway, and log an immutable record to the zero-trust audit ledger.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-lg font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Emergency Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Transfers Drawer Modal */}
      {isPendingTransfersDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Pending Mutual-Aid Transfer Orders
                  </h3>
                  <p className="text-xs text-slate-400">
                    Algorithmic inter-hospital rebalances ready for authorization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPendingTransfersDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {pendingTransfers.length > 0 ? (
                pendingTransfers.map(recom => (
                  <div
                    key={recom.id}
                    className="p-4 bg-slate-850/80 border border-slate-800 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {recom.priority} PRIORITY
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Distance: {recom.distanceKm} km (~{recom.estimatedHours}h)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{recom.supplyName}</h4>
                        <div className="text-[11px] text-slate-300 mt-0.5 flex items-center space-x-2">
                          <span className="text-emerald-400 font-semibold">{recom.sourceHospitalName} (Surplus)</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-rose-400 font-semibold">{recom.destHospitalName} (Deficit)</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-mono font-bold text-teal-300">
                          {recom.quantity}
                        </span>
                        <span className="text-[10px] text-slate-400 block">units</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{recom.reason}</p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          generateManifestForTransfer(recom);
                          setIsPendingTransfersDrawerOpen(false);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-400" />
                        <span>Inspect Manifest</span>
                      </button>

                      <button
                        onClick={() => {
                          approveRedistribution(recom.id);
                        }}
                        disabled={!currentPermissions.canApproveRedistribution}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md ${
                          currentPermissions.canApproveRedistribution
                            ? 'bg-teal-600 hover:bg-teal-500 text-slate-950'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                        title={
                          currentPermissions.canApproveRedistribution
                            ? 'Approve and dispatch transfer order'
                            : 'Requires Regional Director (Level 4) or Admin'
                        }
                      >
                        {currentPermissions.canApproveRedistribution ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {currentPermissions.canApproveRedistribution
                            ? 'Approve & Dispatch'
                            : 'Level 4 Required'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-850 rounded-xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Pending Transfer Orders</h4>
                  <p className="text-xs text-slate-400">
                    All hospital facilities are currently maintaining safe buffer levels.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsPendingTransfersDrawerOpen(false);
                  setActiveTab('redistribution');
                }}
                className="text-xs text-teal-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Open Full Smart Redistribution Engine</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => setIsPendingTransfersDrawerOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
