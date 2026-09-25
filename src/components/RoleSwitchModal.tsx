import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { PREDEFINED_PROFILES, getRolePermissions } from '../services/firebase';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  UserCheck,
  X,
  Lock,
  Building2,
  Award,
  Key,
} from 'lucide-react';

export const RoleSwitchModal: React.FC = () => {
  const {
    currentUser,
    switchRole,
    isRoleSwitchModalOpen,
    setIsRoleSwitchModalOpen,
    firebaseConnected,
  } = useApp();

  if (!isRoleSwitchModalOpen) return null;

  const rolesList: {
    role: UserRole;
    title: string;
    clearance: string;
    badgeColor: string;
    description: string;
  }[] = [
    {
      role: 'system_admin',
      title: 'System Administrator',
      clearance: 'Level 5 (Unrestricted Root)',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Complete regional infrastructure access, audit ledger governance, security policy management, and emergency overrides.',
    },
    {
      role: 'regional_director',
      title: 'Regional Incident Commander / Director',
      clearance: 'Level 4 (Regional Command Authority)',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Mutual-aid redistribution approvals, epidemic shock simulations in Crisis Lab, network re-allocation authority.',
    },
    {
      role: 'hospital_logistics_lead',
      title: 'Hospital Logistics Lead',
      clearance: 'Level 3 (Facility Scoped)',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      description: 'Physical inventory management scoped strictly to assigned facility (Metro General H1). Cross-facility edits blocked.',
    },
    {
      role: 'clinical_pharmacist',
      title: 'Clinical Pharmacist & Safety Lead',
      clearance: 'Level 3 (Clinical Lot Authority)',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Authorized to quarantine pharmaceutical batches, manage expiry thresholds, and certify cold-chain sensor alarms.',
    },
    {
      role: 'supply_analyst',
      title: 'Supply Chain Intelligence Analyst',
      clearance: 'Level 1 (Read-Only Operational Intelligence)',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      description: 'Read-only access to forecasting dashboards, inventory status, and AI queries. Write & command actions locked.',
    },
  ];

  const currentRolePerms = getRolePermissions(currentUser.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">Role-Based Access Control (RBAC)</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                  Zero-Trust
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select an operational persona to test access privileges, security boundaries, and audit logging.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRoleSwitchModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Persona Banner */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-sm">
              {currentUser.displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-white">{currentUser.displayName}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${currentRolePerms.colorClass}`}>
                  {currentRolePerms.badgeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentUser.email} • {currentUser.department}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${firebaseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
            <span className="text-slate-400">Firebase Firestore:</span>
            <span className="font-semibold text-slate-200">{firebaseConnected ? 'Active (Project integrated-zephyr-9c9s2)' : 'Local Resilience'}</span>
          </div>
        </div>

        {/* Persona Selection Grid */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Available Security Personas
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {rolesList.map(item => {
              const isSelected = currentUser.role === item.role;
              const perms = getRolePermissions(item.role);

              return (
                <div
                  key={item.role}
                  onClick={() => switchRole(item.role)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-950/40 border-teal-500/60 shadow-lg shadow-teal-950/30 ring-1 ring-teal-500/40'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white">{item.title}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${item.badgeColor}`}>
                          {item.clearance}
                        </span>
                        {isSelected && (
                          <span className="flex items-center space-x-1 text-teal-400 text-xs font-semibold">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Active Persona</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">{item.description}</p>
                    </div>

                    <button
                      id={`btn-select-role-${item.role}`}
                      onClick={e => {
                        e.stopPropagation();
                        switchRole(item.role);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 font-bold cursor-default'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Switch Persona'}
                    </button>
                  </div>

                  {/* Capabilities Chip Row */}
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap gap-2 text-[11px]">
                    <span className={`flex items-center space-x-1 ${perms.canApproveRedistribution ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {perms.canApproveRedistribution ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>Redistribution Approval</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${perms.canRunCrisisSimulation ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {perms.canRunCrisisSimulation ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>Crisis Shock Simulation</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${perms.canQuarantineBatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {perms.canQuarantineBatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>Batch Quarantine</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${perms.canResetSensorAlarm ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {perms.canResetSensorAlarm ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>Sensor Alarm Reset</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Role changes generate an immutable audit log entry in Firestore.</span>
          </div>
          <button
            onClick={() => setIsRoleSwitchModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
