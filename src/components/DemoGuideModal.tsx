import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  X,
  Play,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
  Shield,
  Layers,
  Zap,
  Activity,
  Package,
  Pill,
  ShieldAlert,
  Flame,
  ArrowRightLeft,
  Thermometer,
  FileText,
  UserCheck,
  ChevronRight,
  HelpCircle,
  Cpu,
  BarChart3,
  RotateCcw,
} from 'lucide-react';
import {
  TOUR_STEPS,
  PRACTICE_SCENARIOS,
  HOW_IT_WORKS_SECTIONS,
  DAILY_SOP_STEPS,
  PracticeScenario,
} from '../data/tourData';
import { NavTab, UserRole } from '../types';

export const DemoGuideModal: React.FC = () => {
  const {
    isDemoGuideOpen,
    setIsDemoGuideOpen,
    startGuidedTour,
    setActiveTab,
    switchRole,
    setQuickAiPrompt,
    setIsAiDrawerOpen,
    loadDemoScenario,
    setBannerNotification,
  } = useApp();

  const [activeGuideTab, setActiveGuideTab] = useState<
    'tour' | 'how-it-works' | 'daily-sop' | 'scenarios' | 'roles'
  >('tour');
  const [selectedScenario, setSelectedScenario] = useState<PracticeScenario | null>(
    PRACTICE_SCENARIOS[0]
  );

  if (!isDemoGuideOpen) return null;

  const handleStartTourFromStep = (stepIndex: number) => {
    startGuidedTour(stepIndex);
    setIsDemoGuideOpen(false);
  };

  const handleLaunchScenario = (scen: PracticeScenario) => {
    // 1. Switch to recommended role
    switchRole(scen.recommendedRole);
    // 2. Load demo scenario baseline
    loadDemoScenario();
    // 3. Navigate to target tab
    setActiveTab(scen.targetTab);
    // 4. Prepopulate AI prompt
    setQuickAiPrompt(scen.sampleAiPrompt);
    // 5. Close guide modal
    setIsDemoGuideOpen(false);
    // 6. Notify user
    setBannerNotification(
      `Scenario Activated: "${scen.title}". Switched active role and navigated to ${scen.targetTab.toUpperCase()}.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-teal-950/40 to-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  HealthFlow AI — System Guide &amp; Operations Manual
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Interactive Demo Hub
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Learn how the platform works, follow standard operating procedures (SOP), or launch hands-on practice simulations.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStartTourFromStep(0)}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Interactive Tour</span>
            </button>

            <button
              onClick={() => setIsDemoGuideOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-5 flex space-x-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveGuideTab('tour')}
            className={`px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeGuideTab === 'tour'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Interactive Guided Walkthrough (8 Steps)</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('daily-sop')}
            className={`px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeGuideTab === 'daily-sop'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Daily Operations SOP (How to Use Normally)</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('how-it-works')}
            className={`px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeGuideTab === 'how-it-works'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>How the System Works (Architecture &amp; Formulas)</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('scenarios')}
            className={`px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeGuideTab === 'scenarios'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Hands-on Simulation Drills (5 Scenarios)</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('roles')}
            className={`px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeGuideTab === 'roles'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Role-Based Playbooks (RBAC)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: INTERACTIVE GUIDED WALKTHROUGH */}
          {activeGuideTab === 'tour' && (
            <div className="space-y-6">
              <div className="p-4 bg-teal-950/30 border border-teal-800/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>8-Step Guided Tour Across the HealthFlow AI Platform</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Follow the guided progression from morning command triage down to crisis stress testing. Click any step below to launch directly into that screen.
                  </p>
                </div>
                <button
                  onClick={() => handleStartTourFromStep(0)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-2 whitespace-nowrap shadow-md cursor-pointer transition-all shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Tour at Step 1</span>
                </button>
              </div>

              {/* Grid of 8 Tour Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TOUR_STEPS.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-4 bg-slate-850/70 border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-400">Step {step.stepNumber} of 8</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {step.tab.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{step.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>

                      <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                        <strong className="text-slate-200 block">What to look for:</strong>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {step.whatToLookFor.slice(0, 2).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 italic truncate max-w-[200px]">
                        {step.actionHint}
                      </span>
                      <button
                        onClick={() => handleStartTourFromStep(idx)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-teal-600 hover:text-slate-950 text-teal-300 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Go to Step {step.stepNumber}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DAILY OPERATIONS SOP (HOW TO USE NORMALLY) */}
          {activeGuideTab === 'daily-sop' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-850/80 border border-slate-800 rounded-xl space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>Standard Operating Procedure (SOP) — Hospital Daily Routine</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  How a hospital supply chain team, clinical pharmacy department, and regional command center use HealthFlow AI during normal day-to-day operations.
                </p>
              </div>

              {/* Chronological Timeline */}
              <div className="space-y-4">
                {DAILY_SOP_STEPS.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-850/50 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-850/80 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          {step.time}
                        </span>
                        <span className="text-xs font-bold text-white">{step.title}</span>
                        <span className="text-[10px] text-slate-400">
                          Role: <strong className="text-slate-200">{step.role}</strong>
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{step.instructions}</p>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
                        <strong className="text-teal-300">Action Deliverable: </strong>
                        <span>{step.actionItem}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab(step.tab);
                        setIsDemoGuideOpen(false);
                      }}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap self-start md:self-center cursor-pointer transition-colors flex items-center space-x-1.5"
                    >
                      <span>Open {step.tab.toUpperCase()}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HOW IT WORKS (ARCHITECTURE & ALGORITHMS) */}
          {activeGuideTab === 'how-it-works' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-850/80 border border-slate-800 rounded-xl space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-teal-400" />
                  <span>System Architecture, Math Formulas &amp; Zero-Trust Governance</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Comprehensive engineering and clinical specifications behind HealthFlow AI calculations.
                </p>
              </div>

              <div className="space-y-4">
                {HOW_IT_WORKS_SECTIONS.map((sec, idx) => (
                  <div key={idx} className="p-5 bg-slate-850/50 border border-slate-800 rounded-xl space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-bold flex items-center justify-center border border-teal-500/30">
                        {idx + 1}
                      </span>
                      <span>{sec.title}</span>
                    </h4>
                    <p className="text-xs text-teal-300/90 font-medium">{sec.summary}</p>
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      {sec.details.map((d, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRACTICE SCENARIOS */}
          {activeGuideTab === 'scenarios' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-850/80 border border-slate-800 rounded-xl space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-teal-400" />
                  <span>Hands-on Simulation Drills (1-Click Scenario Launchers)</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Select any realistic healthcare operational challenge below. Clicking "Launch Scenario" will automatically set up the required role, baseline data, target screen, and prefilled AI query.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Scenario List (5 cols) */}
                <div className="md:col-span-5 space-y-2.5">
                  {PRACTICE_SCENARIOS.map(scen => {
                    const isSelected = selectedScenario?.id === scen.id;

                    return (
                      <div
                        key={scen.id}
                        onClick={() => setSelectedScenario(scen)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-teal-500 shadow-md ring-1 ring-teal-500/40'
                            : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${scen.badgeColor}`}>
                            {scen.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {scen.targetTab.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-2">{scen.title}</h4>
                      </div>
                    );
                  })}
                </div>

                {/* Scenario Details & Launcher (7 cols) */}
                {selectedScenario && (
                  <div className="md:col-span-7 bg-slate-850/80 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${selectedScenario.badgeColor}`}>
                          {selectedScenario.badge}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">{selectedScenario.title}</h3>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-white block mb-1">Operational Story:</strong>
                      {selectedScenario.scenarioStory}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <strong className="text-teal-300 block uppercase tracking-wider text-[11px]">Mission Objective:</strong>
                      <p>{selectedScenario.objective}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <strong className="text-slate-200 block uppercase tracking-wider text-[11px]">Action Steps to Complete:</strong>
                      <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                        {selectedScenario.stepsToComplete.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Target Role: <strong className="text-white">{selectedScenario.recommendedRole}</strong>
                      </span>

                      <button
                        id="btn-launch-scenario"
                        onClick={() => handleLaunchScenario(selectedScenario)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Scenario Drill</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ROLE-BASED PLAYBOOKS */}
          {activeGuideTab === 'roles' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-850/80 border border-slate-800 rounded-xl space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span>Role-Based Access Control (RBAC) Playbooks</span>
                </h3>
                <p className="text-xs text-slate-300">
                  HealthFlow AI enforces 5 clearance tiers under zero-trust principles. Review authorized actions for each persona.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">System Admin (Level 5)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Full Clearance
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Oversees zero-trust security policies, HIPAA/ISO 27001 audit logs, user management, and cloud database provisioning.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li>Can switch roles and audit all operator actions.</li>
                    <li>Authorized for crisis simulation and all quarantine overrides.</li>
                    <li>Inspects cloud database connection and secret air-gap boundaries.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Regional Director (Level 4)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Regional Command
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    High-level emergency preparedness leadership overseeing cross-municipal mutual-aid agreements.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li>Authorized to approve inter-hospital redistribution orders.</li>
                    <li>Authorized to run Crisis Lab disaster shock simulations.</li>
                    <li>Generates official Chain-of-Custody dispatch manifests.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Clinical Pharmacist (Level 3)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      Clinical Authority
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Oversees medication safety, bioequivalence substitutions, cold-chain excursions, and batch lot recalls.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li>Authorized to lock out and quarantine recalled drug lots.</li>
                    <li>Authorizes bedside emergency substitution protocols.</li>
                    <li>Calibrates and resets cold-chain thermal sensor alarms.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Hospital Logistics Lead (Level 3)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      Facility Ops
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Manages dock receiving, physical inventory counts, and courier dispatches at assigned hospital.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li>Updates physical count adjustments in facility storage.</li>
                    <li>Receives inbound shipments and verifies courier manifests.</li>
                    <li>Scoped strictly to their assigned medical facility.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>HealthFlow AI Documentation Hub</span>
            <span>•</span>
            <button
              onClick={() => {
                loadDemoScenario();
                setIsDemoGuideOpen(false);
              }}
              className="text-teal-400 hover:underline cursor-pointer flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Evaluation Baseline</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleStartTourFromStep(0)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-sm"
            >
              Start Interactive Tour
            </button>
            <button
              onClick={() => setIsDemoGuideOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
