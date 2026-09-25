import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  ShieldAlert,
  Lock,
  Search,
  CheckCircle2,
  FileText,
  Sparkles,
  Building2,
  Package,
  Calendar,
  Zap,
  Printer,
  X,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { RecallNotice, RecallClassification } from '../types';

export const RecallsQuarantineView: React.FC = () => {
  const {
    recalls,
    batches,
    hospitals,
    supplies,
    quarantineRecallBatches,
    triggerSimulatedRecall,
    currentPermissions,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
    setActiveTab,
  } = useApp();

  const [selectedRecallId, setSelectedRecallId] = useState<string>(recalls[0]?.id || '');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [activeQuarantineTarget, setActiveQuarantineTarget] = useState<RecallNotice | null>(null);

  const selectedRecall = recalls.find(r => r.id === selectedRecallId) || recalls[0];

  const filteredRecalls = recalls.filter(r => {
    if (filterClass !== 'ALL' && r.classification !== filterClass) return false;
    if (
      searchQuery &&
      !r.supplyName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.recallNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.affectedBatches.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  // Calculate matching physical batches in active network inventory
  const matchingBatches = selectedRecall
    ? batches.filter(b => selectedRecall.affectedBatches.includes(b.batchNumber))
    : [];

  const totalAffectedUnitsInStock = matchingBatches.reduce((acc, b) => acc + b.quantity, 0);
  const totalQuarantinedUnits = matchingBatches
    .filter(b => b.status === 'QUARANTINED')
    .reduce((acc, b) => acc + b.quantity, 0);

  const handleExecuteQuarantine = (recall: RecallNotice) => {
    quarantineRecallBatches(recall.id);
  };

  const handleOpenCertificate = (recall: RecallNotice) => {
    setActiveQuarantineTarget(recall);
    setShowCertificateModal(true);
  };

  const handleAskAiAboutRecall = (recall: RecallNotice) => {
    setQuickAiPrompt(
      `Generate a Clinical Hazard Memo and Hospital Rapid Response Brief for Recall ${recall.recallNumber} (${recall.supplyName}). Detail immediate bedside nursing actions, patient trace protocols, and recommended substitute therapies.`
    );
    setIsAiDrawerOpen(true);
  };

  const getClassificationBadge = (classification: RecallClassification) => {
    switch (classification) {
      case 'CLASS_I':
        return (
          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse mr-1"></span>
            Class I (Life-Threatening Hazard)
          </span>
        );
      case 'CLASS_II':
        return (
          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span>
            Class II (Moderate Clinical Risk)
          </span>
        );
      case 'CLASS_III':
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
            Class III (Compliance Anomaly)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-900/40 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-300">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
                  <span>Regulatory Lot Recalls &amp; Quarantine Center</span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    FDA 21 CFR § 7 / ISO 13485
                  </span>
                </h1>
                <p className="text-sm text-slate-300 mt-0.5">
                  Automated batch-level recall surveillance, immediate network-wide pyxis lockouts, and retrospective patient exposure tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-simulate-recall"
              onClick={triggerSimulatedRecall}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40 transition-all shadow-md cursor-pointer"
              title="Inject a surprise Class I emergency recall to stress-test facility lockdown readiness"
            >
              <Zap className="w-4 h-4 text-rose-400" />
              <span>Simulate Class I Emergency Recall</span>
            </button>

            <button
              onClick={() => {
                setQuickAiPrompt('Provide a regulatory summary of active FDA drug and device recalls affecting regional trauma and ICU supply chains.');
                setIsAiDrawerOpen(true);
              }}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Recall Analyst</span>
            </button>
          </div>
        </div>

        {/* Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block font-medium">Active Recalls</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-white">{recalls.length}</span>
              <span className="text-xs text-rose-400 font-semibold">
                {recalls.filter(r => r.classification === 'CLASS_I').length} Class I
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block font-medium">Quarantine Lockout Rate</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">
                {Math.round(
                  (recalls.reduce((acc, r) => acc + r.quarantinedUnits, 0) /
                    Math.max(1, recalls.reduce((acc, r) => acc + r.totalAffectedUnits, 0))) *
                    100
                )}
                %
              </span>
              <span className="text-xs text-slate-400 font-medium">units secured</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block font-medium">Potential Patient Exposures</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-amber-400">
                {recalls.reduce((acc, r) => acc + r.estimatedPatientExposure, 0)}
              </span>
              <span className="text-xs text-amber-400/80 font-medium">traced in EHR</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block font-medium">Pharmacist Clearance Tier</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-sm font-bold text-teal-300">
                {currentPermissions.canQuarantineBatch ? 'Authorized (Level 3+)' : 'View Only'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Recalls List on Left, Deep Dive on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Recall Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Active Recall Registry ({filteredRecalls.length})</span>
              </h2>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search drug, FDA #, or lot..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <select
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                aria-label="Filter recall class"
                className="bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Classes</option>
                <option value="CLASS_I">Class I (Urgent)</option>
                <option value="CLASS_II">Class II (Moderate)</option>
                <option value="CLASS_III">Class III (Anomaly)</option>
              </select>
            </div>

            {/* List of Recalls */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredRecalls.map(recall => {
                const isSelected = selectedRecall?.id === recall.id;
                const isQuarantined = recall.status === 'QUARANTINED_ALL';

                return (
                  <div
                    key={recall.id}
                    onClick={() => setSelectedRecallId(recall.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-teal-500 shadow-md ring-1 ring-teal-500/40'
                        : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        {recall.recallNumber}
                      </span>
                      {isQuarantined ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>100% Quarantined</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Action Required</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1.5">{recall.supplyName}</h3>

                    <div className="flex items-center space-x-2 mt-2">
                      {getClassificationBadge(recall.classification)}
                    </div>

                    <div className="mt-2 text-xs text-slate-300 line-clamp-2">
                      {recall.hazardDescription}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Affected Lots: {recall.affectedBatches.join(', ')}</span>
                      <span className="text-teal-400 font-medium flex items-center space-x-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Recall Deep Dive (7 cols) */}
        {selectedRecall && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {selectedRecall.recallNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      Authority: <strong className="text-white">{selectedRecall.issuingAuthority}</strong>
                    </span>
                    <span className="text-xs text-slate-400">
                      Issued: {new Date(selectedRecall.dateIssued).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-2">{selectedRecall.supplyName}</h2>
                  <div className="mt-2">{getClassificationBadge(selectedRecall.classification)}</div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedRecall.status !== 'QUARANTINED_ALL' ? (
                    <button
                      id="btn-quarantine-recall"
                      onClick={() => handleExecuteQuarantine(selectedRecall)}
                      disabled={!currentPermissions.canQuarantineBatch}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all ${
                        currentPermissions.canQuarantineBatch
                          ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                      title={
                        currentPermissions.canQuarantineBatch
                          ? 'Lock out and quarantine affected lots across all hospitals'
                          : 'Requires Clinical Pharmacist clearance'
                      }
                    >
                      <Lock className="w-4 h-4" />
                      <span>Lock &amp; Quarantine All Lots</span>
                    </button>
                  ) : (
                    <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Network Lockdown Complete</span>
                    </span>
                  )}

                  <button
                    onClick={() => handleOpenCertificate(selectedRecall)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-teal-400" />
                    <span>FDA 806 Form</span>
                  </button>

                  <button
                    onClick={() => handleAskAiAboutRecall(selectedRecall)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-lg text-xs font-semibold text-white shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>

              {/* Hazard & Clinical Impact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-850/80 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Manufacturing Hazard &amp; Root Cause</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedRecall.hazardDescription}
                  </p>
                </div>

                <div className="bg-slate-850/80 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Clinical Safety &amp; Patient Impact</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedRecall.clinicalImpactSummary}
                  </p>
                </div>
              </div>

              {/* Action Required Directive */}
              <div className="bg-rose-950/20 border border-rose-900/50 rounded-lg p-4 space-y-1.5">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Mandatory Clinical Action Protocol</span>
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedRecall.actionRequired}
                </p>
              </div>

              {/* Matching Physical Batches Across Network Facilities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Package className="w-4 h-4 text-teal-400" />
                    <span>Network Batch Inventory Trace ({matchingBatches.length} lots found)</span>
                  </h4>
                  <div className="text-xs text-slate-400">
                    Units Quarantined: <strong className="text-white">{totalQuarantinedUnits}</strong> / {totalAffectedUnitsInStock}
                  </div>
                </div>

                {matchingBatches.length > 0 ? (
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-2.5">Lot Number</th>
                          <th className="p-2.5">Facility</th>
                          <th className="p-2.5 text-right">Physical Units</th>
                          <th className="p-2.5">Expiry Date</th>
                          <th className="p-2.5">Lockout Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {matchingBatches.map(batch => (
                          <tr key={batch.id} className="hover:bg-slate-800/40">
                            <td className="p-2.5 font-mono font-bold text-teal-300">{batch.batchNumber}</td>
                            <td className="p-2.5 text-white font-medium">{batch.facilityName}</td>
                            <td className="p-2.5 text-right font-mono text-slate-200 font-bold">{batch.quantity}</td>
                            <td className="p-2.5 text-slate-400">{batch.expiryDate}</td>
                            <td className="p-2.5">
                              {batch.status === 'QUARANTINED' ? (
                                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 flex items-center space-x-1 w-fit">
                                  <Lock className="w-3 h-3" />
                                  <span>QUARANTINED</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center space-x-1 w-fit">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>ACTIVE IN PYXIS</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-850 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
                    No physical inventory lots matching <span className="font-mono text-teal-300">{selectedRecall.affectedBatches.join(', ')}</span> are currently present in regional hospital stock.
                  </div>
                )}
              </div>

              {/* Recommended Therapeutic Alternative Route */}
              <div className="p-4 bg-teal-950/30 border border-teal-800/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                    Clinical Continuity Strategy
                  </span>
                  <p className="text-xs text-slate-300 mt-1">
                    To maintain uninterrupted patient care during this recall, review FDA-approved bioequivalent and therapeutic class alternatives.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('substitutions')}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Open Substitutions Engine</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FDA Form 806 / Certificate Modal */}
      {showCertificateModal && activeQuarantineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  Official FDA 21 CFR § 7.46 Quarantine Certificate
                </h3>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white text-slate-900 p-6 rounded-lg font-mono text-xs space-y-4 shadow-inner">
              <div className="border-b border-slate-300 pb-3 text-center">
                <div className="font-bold text-sm uppercase">HealthFlow Regional Healthcare System</div>
                <div className="text-[11px] text-slate-600">DEPARTMENT OF PHARMACOVIGILANCE &amp; REGULATORY COMPLIANCE</div>
                <div className="text-[10px] text-slate-500 mt-1">DOCUMENT ID: REQ-CERT-{activeQuarantineTarget.id.toUpperCase()}-2026</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <strong>Recall Identifier:</strong> {activeQuarantineTarget.recallNumber}
                </div>
                <div>
                  <strong>Issuing Agency:</strong> {activeQuarantineTarget.issuingAuthority}
                </div>
                <div>
                  <strong>Formulary Drug:</strong> {activeQuarantineTarget.supplyName}
                </div>
                <div>
                  <strong>Classification:</strong> {activeQuarantineTarget.classification}
                </div>
                <div>
                  <strong>Affected Lots:</strong> {activeQuarantineTarget.affectedBatches.join(', ')}
                </div>
                <div>
                  <strong>Timestamp:</strong> {new Date().toISOString()}
                </div>
              </div>

              <div className="border border-rose-300 bg-rose-50 p-3 rounded text-[11px] text-rose-900">
                <strong>CERTIFICATE OF PHYSICAL LOCKDOWN:</strong> This certifies that all matching inventory lots within the regional health system have been flagged with electronic barcode lockouts, locked in clinical isolation vaults, and prohibited from bedside administration.
              </div>

              <div className="pt-4 border-t border-slate-300 flex items-end justify-between text-[10px] text-slate-600">
                <div>
                  <div>DIGITAL SIGNATURE HASH:</div>
                  <div className="font-mono text-[9px] text-slate-800">
                    SHA256: 7e9b28f3a910c24d98a005fb612b4e8c339a
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">Dr. Sarah Chen, PharmD</div>
                  <div>Lead Regulatory Pharmacist</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
