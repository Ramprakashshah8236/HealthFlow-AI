import React from 'react';
import { useApp, NavTab } from '../context/AppContext';
import {
  Activity,
  Package,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Flame,
  Network,
  Thermometer,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Shield,
  FileText,
  Lock,
  ChevronDown,
  Database,
  Pill,
  ShieldAlert,
  Compass,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    alerts,
    loadDemoScenario,
    isDemoScenarioActive,
    dataMode,
    setIsRealDataModalOpen,
    setIsAiDrawerOpen,
    isAiDrawerOpen,
    currentUser,
    currentPermissions,
    setIsRoleSwitchModalOpen,
    setIsAuditModalOpen,
    setIsSecurityModalOpen,
    auditLogs,
    recalls,
    setIsDemoGuideOpen,
  } = useApp();

  const criticalAlertsCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;
  const recentBlockedCount = auditLogs.filter(a => a.status === 'DENIED').length;
  const activeRecallsCount = recalls.filter(r => r.status !== 'RESOLVED').length;

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Command Center', icon: Activity },
    { id: 'supplies', label: 'Supply Intelligence', icon: Package },
    { id: 'shortages', label: 'Shortage Prediction', icon: Clock },
    { id: 'substitutions', label: 'Clinical Substitutions', icon: Pill },
    { id: 'recalls', label: 'Recalls & Quarantine', icon: ShieldAlert },
    { id: 'waste', label: 'Waste Intelligence', icon: AlertTriangle },
    { id: 'redistribution', label: 'Smart Redistribution', icon: ArrowRightLeft },
    { id: 'crisis', label: 'Crisis Lab', icon: Flame },
    { id: 'network', label: 'Network Map', icon: Network },
    { id: 'cold-chain', label: 'Cold-Chain IoT', icon: Thermometer },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/30">
              <Activity className="w-6 h-6 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">HealthFlow</span>
                <span className="px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Health Supply Resilience Intelligence Platform
              </p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center space-x-2.5">
            {/* RBAC Persona Switcher Trigger */}
            <button
              id="btn-open-rbac-modal"
              onClick={() => setIsRoleSwitchModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-lg text-xs transition-all cursor-pointer group"
              title="Click to switch between 5 RBAC clearance tiers (Admin, Director, Logistics, Pharmacist, Analyst)"
            >
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
              <div className="text-left hidden md:block">
                <span className="text-[10px] text-slate-400 block leading-tight">Active Persona</span>
                <span className="text-xs font-bold text-white block leading-tight">{currentUser.displayName.split(' ')[0]}</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${currentPermissions.badgeColor}`}>
                {currentPermissions.badgeLabel}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {/* Audit Log Trigger */}
            <button
              id="btn-open-audit-modal"
              onClick={() => setIsAuditModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 rounded-lg text-xs text-slate-300 transition-all cursor-pointer"
              title="View immutable HIPAA/ISO 27001 audit ledger"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Audit Log</span>
              <span className="px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold">
                {auditLogs.length}
              </span>
              {recentBlockedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                  {recentBlockedCount} blocked
                </span>
              )}
            </button>

            {/* Security Architecture & Secrets Status */}
            <button
              id="btn-open-security-modal"
              onClick={() => setIsSecurityModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 rounded-lg text-xs text-slate-300 transition-all cursor-pointer"
              title="Inspect security rules, threat defense matrix, and server-side secret isolation"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Zero-Trust: Active</span>
            </button>

            {/* Data Mode & Real-World Conversion Hub */}
            <button
              id="btn-open-real-data-modal"
              onClick={() => setIsRealDataModalOpen(true)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                dataMode === 'real'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                  : 'bg-slate-800/90 text-amber-300 border border-amber-500/40 hover:bg-slate-750'
              }`}
              title="Convert hypothetical simulation to live hospital network via CSV or manual entry"
            >
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Data Mode:</span>
              <span className="font-bold">{dataMode === 'real' ? 'Real' : 'Synthetic'}</span>
              <span className={`w-2 h-2 rounded-full ${dataMode === 'real' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            </button>

            {/* Demo Scenario CTA */}
            <button
              id="btn-load-demo-scenario"
              onClick={loadDemoScenario}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                isDemoScenarioActive && dataMode === 'synthetic'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
              }`}
              title="Load standard evaluation scenario with critical shortage, surplus, and expiring supplies"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demo Scenario</span>
              {isDemoScenarioActive && dataMode === 'synthetic' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>

            {/* System Guide & Demo Walkthrough CTA */}
            <button
              id="btn-open-demo-guide"
              onClick={() => setIsDemoGuideOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
              title="Open full interactive demo walkthrough, daily SOP operations manual, and architecture guide"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>Guide &amp; Demo</span>
              <span className="px-1.5 py-0.2 bg-teal-500/30 text-teal-200 rounded text-[9px] font-bold uppercase hidden sm:inline">
                SOP
              </span>
            </button>

            {/* AI Assistant Button */}
            <button
              id="btn-open-ai-assistant"
              onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
              <span className="px-1 py-0.2 bg-white/20 rounded text-[9px] hidden sm:inline">Gemini</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5" aria-label="Global Tabs">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isCrisisTab = item.id === 'crisis';

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? isCrisisTab
                        ? 'bg-rose-950 text-rose-200 border border-rose-800'
                        : 'bg-teal-950 text-teal-200 border border-teal-800/80'
                      : isCrisisTab
                      ? 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (isCrisisTab ? 'text-rose-400' : 'text-teal-400') : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'recalls' && activeRecallsCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                      <span>{activeRecallsCount} Active</span>
                    </span>
                  )}
                  {item.id === 'substitutions' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                      Rx Equiv
                    </span>
                  )}
                  {item.id === 'crisis' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                      Signature
                    </span>
                  )}
                  {item.id === 'waste' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-amber-500/20 text-amber-300 rounded">
                      14d expiry
                    </span>
                  )}
                  {item.id === 'redistribution' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-blue-500/20 text-blue-300 rounded">
                      Match Ready
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
