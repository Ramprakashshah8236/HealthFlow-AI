import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, AlertOctagon, X, ArrowRight, Lock } from 'lucide-react';
import { UserRole } from '../types';

export const AccessDeniedModal: React.FC = () => {
  const { accessDeniedModal, clearAccessDenied, switchRole, currentUser } = useApp();

  if (!accessDeniedModal) return null;

  // Determine which role to suggest for instant resolution
  let suggestedRole: UserRole = 'system_admin';
  if (accessDeniedModal.requiredRole.includes('Regional Director')) {
    suggestedRole = 'regional_director';
  } else if (accessDeniedModal.requiredRole.includes('Clinical Pharmacist')) {
    suggestedRole = 'clinical_pharmacist';
  } else if (accessDeniedModal.requiredRole.includes('Logistics Lead')) {
    suggestedRole = 'hospital_logistics_lead';
  }

  const handleSwitchAndResolve = () => {
    switchRole(suggestedRole);
    clearAccessDenied();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-rose-600/60 rounded-2xl w-full max-w-lg shadow-2xl shadow-rose-950/50 overflow-hidden">
        {/* Header with high-visibility warning banner */}
        <div className="bg-rose-950/60 border-b border-rose-800/80 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">Zero-Trust Policy Enforcement</h3>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-rose-500 text-slate-950 rounded">
                  DENIED
                </span>
              </div>
              <p className="text-xs text-rose-300 font-medium">
                Privilege clearance insufficient for requested command
              </p>
            </div>
          </div>
          <button
            onClick={clearAccessDenied}
            className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Action Details Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Attempted Command</span>
              <p className="text-sm font-bold text-white mt-0.5">{accessDeniedModal.action}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Persona</span>
                <p className="font-semibold text-slate-300 capitalize">{currentUser.role.replace('_', ' ')}</p>
                <p className="text-[11px] text-slate-500">{currentUser.displayName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Required Clearance</span>
                <p className="font-semibold text-rose-300">{accessDeniedModal.requiredRole}</p>
                <p className="text-[11px] text-slate-400">{accessDeniedModal.requiredClearance}</p>
              </div>
            </div>
          </div>

          {/* Security Justification */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1.5">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>Compliance &amp; Operational Rationale</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {accessDeniedModal.reason}
            </p>
          </div>

          {/* Tamper-Evident Notice */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
              <span>Security exception logged to Firestore <code className="text-slate-300 font-mono">/audit_logs/</code></span>
            </span>
            <span className="font-mono text-[10px] text-slate-500">STATUS: 403_FORBIDDEN</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-end space-x-3">
          <button
            onClick={clearAccessDenied}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Acknowledge &amp; Cancel
          </button>
          <button
            onClick={handleSwitchAndResolve}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-md transition-all cursor-pointer"
          >
            <span>Switch to {suggestedRole.replace('_', ' ')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
