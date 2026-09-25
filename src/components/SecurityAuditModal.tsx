import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLogEntry } from '../types';
import {
  Shield,
  Search,
  Filter,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Hash,
  Clock,
  User,
  Database,
  RefreshCw,
} from 'lucide-react';

export const SecurityAuditModal: React.FC = () => {
  const {
    auditLogs,
    isAuditModalOpen,
    setIsAuditModalOpen,
    firebaseConnected,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch =
        searchTerm === '' ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'ALL' || log.status === selectedStatus;
      const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

      return matchesSearch && matchesStatus && matchesAction;
    });
  }, [auditLogs, searchTerm, selectedStatus, selectedAction]);

  if (!isAuditModalOpen) return null;

  const totalEvents = auditLogs.length;
  const deniedEvents = auditLogs.filter(l => l.status === 'DENIED').length;
  const warningEvents = auditLogs.filter(l => l.status === 'WARNING').length;
  const successEvents = auditLogs.filter(l => l.status === 'SUCCESS').length;

  const exportLedger = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `healthflow-audit-ledger-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">Security &amp; Compliance Audit Ledger</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                  Immutable / Append-Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographically hashed audit log of every operational command, clearance breach, and AI intelligence query.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportLedger}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              title="Download full tamper-evident audit ledger in JSON format"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export Ledger</span>
            </button>
            <button
              onClick={() => setIsAuditModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950 border-b border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Audited Events</span>
            <div className="text-xl font-bold text-white mt-0.5">{totalEvents}</div>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Authorized &amp; Verified</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{successEvents}</div>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Zero-Trust Blocks (Denied)</span>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{deniedEvents}</div>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Safety Warnings</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{warningEvents}</div>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search resource, operator, or details..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="DENIED">Denied (Breaches)</option>
              <option value="WARNING">Warnings</option>
            </select>

            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500 text-xs"
            >
              <option value="ALL">All Action Types</option>
              <option value="ROLE_SWITCH">Role Switch</option>
              <option value="CRISIS_RUN">Crisis Shock Simulation</option>
              <option value="TRANSFER_APPROVE">Transfer Authorization</option>
              <option value="TRANSFER_DISPATCH">Inventory / Dispatch</option>
              <option value="LOT_QUARANTINE">Batch Quarantine</option>
              <option value="ALARM_RESET">Sensor Telemetry Reset</option>
              <option value="AI_QUERY">Intelligence AI Query</option>
              <option value="LOGIN">Authentication</option>
            </select>
          </div>
        </div>

        {/* Ledger Event List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No audit log entries matching your criteria</p>
              <p className="text-xs text-slate-600 mt-1">Try clearing filters or triggering an action</p>
            </div>
          ) : (
            filteredLogs.map(log => {
              const isSuccess = log.status === 'SUCCESS';
              const isDenied = log.status === 'DENIED';
              const isWarning = log.status === 'WARNING';

              return (
                <div
                  key={log.logId}
                  className={`p-3.5 rounded-xl border transition-all text-xs ${
                    isDenied
                      ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700/60'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {isDenied ? (
                        <span className="flex items-center space-x-1 px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded font-bold text-[10px]">
                          <XCircle className="w-3 h-3" />
                          <span>BLOCKED</span>
                        </span>
                      ) : isWarning ? (
                        <span className="flex items-center space-x-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold text-[10px]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>WARNING</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>VERIFIED</span>
                        </span>
                      )}

                      <span className="font-bold text-white font-mono">{log.action}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 font-medium">{log.resource}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1 font-mono text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </span>
                      <span className="font-mono text-[10px] text-teal-400/80 bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-800/40">
                        HASH: {log.hash.slice(0, 10)}...
                      </span>
                    </div>
                  </div>

                  {/* Details Description */}
                  <div className="mt-2 text-slate-300 pl-1 leading-relaxed">
                    {log.details}
                  </div>

                  {/* Identity & Metadata Footer */}
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-300 font-medium">{log.userEmail}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {log.userRole.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-600">
                      RECORD_ID: {log.logId}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Firestore collection <code className="text-slate-300 font-mono">/audit_logs/</code> is locked against mutation (<code className="text-teal-300 font-mono">allow update, delete: if false</code>).</span>
          </div>
          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
