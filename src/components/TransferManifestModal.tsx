import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Package,
  QrCode,
  Thermometer,
} from 'lucide-react';

export const TransferManifestModal: React.FC = () => {
  const {
    selectedManifest,
    isManifestModalOpen,
    closeManifestModal,
    logSecurityAction,
    setBannerNotification,
  } = useApp();

  if (!isManifestModalOpen || !selectedManifest) return null;

  const handleDownloadCsv = () => {
    const headers = [
      'ManifestNumber',
      'TransferId',
      'Timestamp',
      'OriginFacility',
      'DestinationFacility',
      'SupplyName',
      'Quantity',
      'Unit',
      'BatchNumbers',
      'Carrier',
      'ColdChainMonitored',
      'AuthorizedBy',
      'SecurityHash',
    ];

    const row = [
      `"${selectedManifest.manifestNumber}"`,
      `"${selectedManifest.transferId}"`,
      `"${selectedManifest.timestamp}"`,
      `"${selectedManifest.originFacility}"`,
      `"${selectedManifest.destinationFacility}"`,
      `"${selectedManifest.supplyName}"`,
      selectedManifest.quantity,
      `"${selectedManifest.unit}"`,
      `"${selectedManifest.batchNumbers.join(';')}"`,
      `"${selectedManifest.carrier}"`,
      selectedManifest.coldChainMonitored ? 'YES' : 'NO',
      `"${selectedManifest.authorizedBy}"`,
      `"${selectedManifest.digitalSignatureHash}"`,
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HealthFlow_Manifest_${selectedManifest.manifestNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logSecurityAction(
      'DATA_EXPORT',
      `Manifest ${selectedManifest.manifestNumber}`,
      `Exported official chain-of-custody transfer manifest CSV.`,
      'SUCCESS'
    );
    setBannerNotification(`Chain-of-Custody Manifest ${selectedManifest.manifestNumber} exported as CSV.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Chain-of-Custody Inter-Facility Transfer Manifest
              </h2>
              <p className="text-xs text-slate-400">
                Official FDA 21 CFR § 203 &amp; DEA Form 222 Compliant Hazardous &amp; Critical Medical Dispatch Record
              </p>
            </div>
          </div>
          <button
            onClick={closeManifestModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manifest Printable Paper View */}
        <div
          id="manifest-document-print"
          className="bg-slate-950 text-slate-100 border border-slate-700 rounded-xl p-6 font-mono text-xs space-y-5 shadow-inner"
        >
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-teal-400">
                HealthFlow Emergency Preparedness Network
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                REGIONAL MUTUAL-AID LOGISTICS COMMISSION
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                DISPATCH ID: <span className="text-white font-bold">{selectedManifest.manifestNumber}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[10px] text-slate-400">ISSUE TIMESTAMP (UTC)</div>
              <div className="text-xs font-bold text-white">{selectedManifest.timestamp}</div>
              <div className="mt-1 text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 inline-block font-sans font-semibold">
                SECURITY CLEARANCE: {selectedManifest.securityClearanceCode}
              </div>
            </div>
          </div>

          {/* Transfer Route Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/90 p-4 rounded-lg border border-slate-800 font-sans">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Dispatch Origin (Surplus Node)
              </span>
              <div className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>{selectedManifest.originFacility}</span>
              </div>
              <div className="text-xs text-slate-400">Authorized Regional Storage Reserve</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Destination Consignee (Shortage Target)
              </span>
              <div className="text-sm font-bold text-emerald-300 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{selectedManifest.destinationFacility}</span>
              </div>
              <div className="text-xs text-slate-400">Emergency Patient Allocation</div>
            </div>
          </div>

          {/* Itemized Cargo Breakdown */}
          <div className="space-y-2 font-sans">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Itemized Controlled Medical Cargo
            </span>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5">Tracked Lots</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Thermal Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                  <tr>
                    <td className="p-2.5 font-bold text-white">{selectedManifest.supplyName}</td>
                    <td className="p-2.5 font-mono text-teal-300 text-[11px]">
                      {selectedManifest.batchNumbers.join(', ')}
                    </td>
                    <td className="p-2.5 text-right font-bold text-white font-mono">
                      {selectedManifest.quantity} {selectedManifest.unit}
                    </td>
                    <td className="p-2.5 text-right">
                      {selectedManifest.coldChainMonitored ? (
                        <span className="text-cyan-400 font-bold flex items-center justify-end space-x-1">
                          <Thermometer className="w-3.5 h-3.5" />
                          <span>{selectedManifest.targetTempRange || '2°C - 8°C'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Ambient (15-25°C)</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4-Stage Chain of Custody Progress */}
          <div className="space-y-2 font-sans">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Chain-of-Custody Handoff Verification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {selectedManifest.chainOfCustodyStages.map((stage, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs ${
                    stage.status === 'COMPLETED'
                      ? 'bg-teal-950/30 border-teal-800/80 text-teal-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold">Stage {idx + 1}</span>
                    {stage.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                  <div className="font-bold text-white mt-1 text-[11px] truncate">
                    {stage.stage.replace('_', ' ')}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{stage.location}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Signature Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between text-[10px] text-slate-400 gap-3">
            <div>
              <div className="text-slate-500 uppercase tracking-wider">Zero-Trust Cryptographic Proof:</div>
              <div className="font-mono text-[9px] text-teal-300 mt-0.5">
                {selectedManifest.digitalSignatureHash}
              </div>
              <div className="text-slate-500 mt-1">
                Authorized By: <strong className="text-white">{selectedManifest.authorizedBy}</strong> ({selectedManifest.authorizedRole})
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[10px] text-emerald-400 font-bold flex items-center sm:justify-end space-x-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Legally Certified Audit Trail</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Immutable record logged to HealthFlow Ledger
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            Document can be printed for driver physical sign-off or downloaded as CSV.
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>Print Manifest</span>
            </button>

            <button
              onClick={closeManifestModal}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
