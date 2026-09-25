import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Pill,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
  FileCheck,
  Calculator,
  ChevronRight,
  Search,
  BookOpen,
  Info,
} from 'lucide-react';
import { ClinicalDrugSubstitution, DrugSubstituteItem } from '../types';

export const SubstitutionsView: React.FC = () => {
  const {
    substitutions,
    supplies,
    inventories,
    hospitals,
    currentPermissions,
    currentUser,
    authorizeSubstitutionProtocol,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
  } = useApp();

  const [selectedSubGroupId, setSelectedSubGroupId] = useState<string>(
    substitutions[0]?.id || ''
  );
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<string>('');
  const [prescribedDose, setPrescribedDose] = useState<number>(1000);
  const [doseUnit, setDoseUnit] = useState<string>('ml');
  const [selectedHospitalForProtocol, setSelectedHospitalForProtocol] = useState<string>(
    hospitals[0]?.id || ''
  );
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({});

  const activeGroup = useMemo(() => {
    return substitutions.find(s => s.id === selectedSubGroupId) || substitutions[0];
  }, [substitutions, selectedSubGroupId]);

  // Find the primary supply in state
  const primarySupply = useMemo(() => {
    return supplies.find(s => s.id === activeGroup?.primarySupplyId);
  }, [supplies, activeGroup]);

  // Total current network inventory for the primary supply
  const primaryTotalUnits = useMemo(() => {
    if (!activeGroup) return 0;
    return inventories
      .filter(i => i.supplyId === activeGroup.primarySupplyId)
      .reduce((sum, i) => sum + i.currentStock, 0);
  }, [inventories, activeGroup]);

  // Average days remaining across network for primary supply
  const primaryAvgDays = useMemo(() => {
    if (!activeGroup) return 0;
    const items = inventories.filter(i => i.supplyId === activeGroup.primarySupplyId);
    if (items.length === 0) return 0;
    const totalDays = items.reduce((sum, i) => sum + i.daysRemaining, 0);
    return Math.round((totalDays / items.length) * 10) / 10;
  }, [inventories, activeGroup]);

  const selectedSubstitute = useMemo(() => {
    if (!activeGroup) return null;
    if (selectedSubstituteId) {
      return activeGroup.substitutes.find(s => s.id === selectedSubstituteId) || activeGroup.substitutes[0];
    }
    return activeGroup.substitutes[0];
  }, [activeGroup, selectedSubstituteId]);

  const handleToggleChecklist = (index: number) => {
    setCheckedChecklist(prev => ({
      ...prev,
      [`${activeGroup.id}-${index}`]: !prev[`${activeGroup.id}-${index}`],
    }));
  };

  const allChecklistItemsChecked = useMemo(() => {
    if (!activeGroup?.safetyChecklist) return true;
    return activeGroup.safetyChecklist.every((_, idx) => !!checkedChecklist[`${activeGroup.id}-${idx}`]);
  }, [activeGroup, checkedChecklist]);

  const handleAuthorize = () => {
    if (!selectedSubstitute) return;
    authorizeSubstitutionProtocol(activeGroup, selectedSubstitute, selectedHospitalForProtocol);
  };

  const handleAskAiPharmacology = (sub: DrugSubstituteItem) => {
    setQuickAiPrompt(
      `As an expert clinical pharmacologist, evaluate therapeutic substitution from ${activeGroup.primarySupplyName} to ${sub.name}. Provide explicit dosing guidelines, renal/hepatic dose titration, IV infusion rates, and adverse event surveillance steps.`
    );
    setIsAiDrawerOpen(true);
  };

  const getEquivalenceBadge = (type: DrugSubstituteItem['equivalenceType']) => {
    switch (type) {
      case 'EXACT_EQUIVALENT':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            FDA Bioequivalent (AB Rated)
          </span>
        );
      case 'THERAPEUTIC_CLASS':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Therapeutic Class Alternative
          </span>
        );
      case 'EMERGENCY_ALTERNATIVE':
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Emergency Salvage Protocol
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-800/40 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
                  <span>Clinical Drug Substitutions &amp; Therapeutic Equivalents</span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    FDA Orange Book Aligned
                  </span>
                </h1>
                <p className="text-sm text-slate-300 mt-0.5">
                  Automated pharmacopeia cross-referencing, bioequivalent alternatives, dose conversion formulas, and network stock availability.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => {
                setQuickAiPrompt('Summarize clinical guidelines for drug shortage therapeutic substitutions and antibiotic stewardship during supply constraints.');
                setIsAiDrawerOpen(true);
              }}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Clinical Pharmacologist AI</span>
            </button>
          </div>
        </div>

        {/* Formulary Selector Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <label className="text-xs text-slate-400 block font-semibold uppercase tracking-wider mb-2">
            Select Formulary Drug Under Scarcity / Shortage
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {substitutions.map(subGroup => {
              const isSelected = subGroup.id === selectedSubGroupId;
              const matchingInventory = inventories.filter(i => i.supplyId === subGroup.primarySupplyId);
              const totalStock = matchingInventory.reduce((s, i) => s + i.currentStock, 0);
              const avgRunway = matchingInventory.length
                ? Math.round((matchingInventory.reduce((s, i) => s + i.daysRemaining, 0) / matchingInventory.length) * 10) / 10
                : 0;

              return (
                <button
                  key={subGroup.id}
                  onClick={() => {
                    setSelectedSubGroupId(subGroup.id);
                    setSelectedSubstituteId('');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                      : 'bg-slate-850/70 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]">
                      {subGroup.primarySupplyName.split('(')[0]}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {subGroup.substitutes.length} Options
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 text-[11px]">
                    <span className="text-slate-400">Network Reserve:</span>
                    <span className={`font-bold ${avgRunway < 8 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {avgRunway} days ({totalStock} units)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Primary Drug Status & FDA Directive (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                  Target Formulary Molecule
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{activeGroup.primarySupplyName}</h2>
                <span className="text-xs text-slate-400 mt-0.5 block">{activeGroup.category}</span>
              </div>

              {/* Status Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Network Reserve</span>
                  <span className={`text-xl font-bold ${primaryAvgDays < 8 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {primaryAvgDays} d
                  </span>
                  <span className="text-[10px] text-slate-400 block">burn runway</span>
                </div>

                <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Physical Stock</span>
                  <span className="text-xl font-bold text-white">{primaryTotalUnits}</span>
                  <span className="text-[10px] text-slate-400 block">units in health network</span>
                </div>
              </div>

              {/* Clinical Indications */}
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Primary Clinical Indications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeGroup.indications.map((ind, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700 font-medium"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* FDA Directive Guidance */}
              <div className="bg-slate-850/80 border border-slate-800 rounded-lg p-3.5 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-400 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>FDA &amp; Clinical Pharmacopeia Guidance</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeGroup.fdaGuidance}</p>
              </div>

              {/* Facility-level Protocol Deployment Selector */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-xs text-slate-300 font-medium block">
                  Deploy Protocol For Facility:
                </label>
                <select
                  value={selectedHospitalForProtocol}
                  onChange={e => setSelectedHospitalForProtocol(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg text-xs text-white p-2 focus:outline-none focus:border-purple-500"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.region})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right: Therapeutic Substitutes & Equivalents (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span>Verified Therapeutic Alternatives ({activeGroup.substitutes.length})</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Select an alternative to calculate conversion and verify safety
                </span>
              </div>

              {/* Substitute Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGroup.substitutes.map(sub => {
                  const isSelected = selectedSubstitute?.id === sub.id;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubstituteId(sub.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500/50 shadow-lg'
                          : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700 font-bold">
                            Code: {sub.fdaOrangeBookCode}
                          </span>
                        </div>

                        <div>{getEquivalenceBadge(sub.equivalenceType)}</div>

                        <div className="text-xs text-slate-300 line-clamp-3">
                          {sub.clinicalNotes}
                        </div>

                        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                            Dose Equivalence Ratio
                          </span>
                          <span className="text-xs font-mono font-bold text-teal-300 block">
                            {sub.dosageRatio}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Route: <strong className="text-white">{sub.administrationRoute.split(' ')[0]}</strong>
                        </span>
                        <span className="text-purple-400 font-medium flex items-center space-x-1">
                          <span>{isSelected ? 'Active Plan' : 'Select'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Substitute Deep Dive: Clinical Calculator & Safety Protocols */}
              {selectedSubstitute && (
                <div className="bg-slate-850/90 border border-purple-500/40 rounded-xl p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        Active Substitution Protocol
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">
                        {selectedSubstitute.name}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleAskAiPharmacology(selectedSubstitute)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Consult Pharmacology AI</span>
                    </button>
                  </div>

                  {/* Contraindications Warning */}
                  {selectedSubstitute.contraindications.length > 0 && (
                    <div className="p-3.5 bg-rose-950/30 border border-rose-900/50 rounded-lg space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-300 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Critical Safety Contraindications</span>
                      </div>
                      <ul className="text-xs text-slate-200 space-y-1 list-disc pl-4">
                        {selectedSubstitute.contraindications.map((contra, idx) => (
                          <li key={idx}>{contra}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Clinical Safety Verification Checklist */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                      <span>Pharmacist Bedside Verification Checklist</span>
                    </span>
                    <div className="space-y-2">
                      {activeGroup.safetyChecklist.map((item, idx) => {
                        const key = `${activeGroup.id}-${idx}`;
                        const isChecked = !!checkedChecklist[key];

                        return (
                          <label
                            key={idx}
                            onClick={() => handleToggleChecklist(idx)}
                            className={`flex items-start space-x-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-teal-950/30 border-teal-800 text-teal-200'
                                : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-900'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 bg-slate-800 border-slate-700"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Protocol Authorization Action Bar */}
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-slate-400">
                      Requires Clinical Pharmacist clearance (Level 3) or System Admin.
                    </div>

                    <button
                      id="btn-authorize-substitution"
                      onClick={handleAuthorize}
                      disabled={
                        !allChecklistItemsChecked ||
                        (!currentPermissions.canQuarantineBatch && currentUser.role !== 'regional_director')
                      }
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold shadow-lg transition-all ${
                        allChecklistItemsChecked &&
                        (currentPermissions.canQuarantineBatch || currentUser.role === 'regional_director')
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                      title={
                        !allChecklistItemsChecked
                          ? 'Please complete the safety verification checklist above'
                          : 'Authorize emergency formulary substitution protocol'
                      }
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Authorize Bedside Substitution Protocol</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
