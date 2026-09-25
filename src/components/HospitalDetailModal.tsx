import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Building2,
  Phone,
  User,
  AlertTriangle,
  Package,
  Truck,
  TrendingUp,
  ArrowRightLeft,
  Calendar,
} from 'lucide-react';

export const HospitalDetailModal: React.FC = () => {
  const {
    selectedHospital,
    setSelectedHospital,
    inventories,
    supplies,
    batches,
    shipments,
    setActiveTab,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
  } = useApp();

  if (!selectedHospital) return null;

  const hospInvs = inventories.filter(i => i.hospitalId === selectedHospital.id);
  const hospBatches = batches.filter(b => b.facilityId === selectedHospital.id);
  const hospShipments = shipments.filter(s => s.destinationId === selectedHospital.id);

  const criticalSupplies = hospInvs.filter(i => i.riskLevel === 'CRITICAL');
  const warningSupplies = hospInvs.filter(i => i.riskLevel === 'WARNING' || i.riskLevel === 'HIGH_RISK');

  const statusColors = {
    CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    HIGH_RISK: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    WARNING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    STABLE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };

  const statusLabels = {
    CRITICAL: 'Critical Condition',
    HIGH_RISK: 'High Risk',
    WARNING: 'Moderate Warning',
    STABLE: 'Stable Resilience',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between bg-slate-900/90">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-white">{selectedHospital.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {selectedHospital.code}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    statusColors[selectedHospital.riskLevel]
                  }`}
                >
                  {statusLabels[selectedHospital.riskLevel]}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedHospital.region} • Coords: {selectedHospital.coordinates.lat.toFixed(4)}, {selectedHospital.coordinates.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedHospital(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Hospital KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400">Licensed Beds</span>
              <div className="text-xl font-bold text-white mt-0.5">{selectedHospital.beds}</div>
              <span className="text-[11px] text-slate-400">{selectedHospital.acuteIcuBeds} ICU Critical Beds</span>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400">Current Patient Load</span>
              <div className="text-xl font-bold text-white mt-0.5">
                {selectedHospital.patientLoad}{' '}
                <span className="text-xs font-normal text-slate-400">({selectedHospital.currentOccupancy}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${
                    selectedHospital.currentOccupancy >= 90
                      ? 'bg-rose-500'
                      : selectedHospital.currentOccupancy >= 80
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                  }`}
                  style={{ width: `${selectedHospital.currentOccupancy}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400">Resilience Risk Score</span>
              <div className="text-xl font-bold text-white mt-0.5">{selectedHospital.riskScore} / 100</div>
              <span className="text-[11px] text-slate-400">
                {criticalSupplies.length} Critical Stockouts
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400">Emergency Officer</span>
              <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
                {selectedHospital.contactPerson}
              </div>
              <span className="text-[11px] text-teal-400 flex items-center mt-1">
                <Phone className="w-3 h-3 mr-1" />
                {selectedHospital.phone}
              </span>
            </div>
          </div>

          {/* Quick Context Alerts */}
          {criticalSupplies.length > 0 && (
            <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-semibold text-rose-200 text-sm">
                  Action Required: {criticalSupplies.length} Immediate Stockout Warnings
                </div>
                <p className="text-rose-300/80 mt-1">
                  This facility has supplies with under 7 days of operational runway at current patient burn rates.
                  Immediate redistribution or emergency replenishment is strongly advised.
                </p>
                <div className="mt-2.5 flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setSelectedHospital(null);
                      setActiveTab('redistribution');
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors"
                  >
                    View Recommended Transfers
                  </button>
                  <button
                    onClick={() => {
                      setQuickAiPrompt(`Why is ${selectedHospital.name} critical and what supplies should be replenished first?`);
                      setIsAiDrawerOpen(true);
                      setSelectedHospital(null);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition-colors"
                  >
                    Ask AI Clinical Advisor
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Supply Inventory Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Package className="w-4 h-4 text-teal-400" />
                <span>Active Medical Inventory ({hospInvs.length} SKUs)</span>
              </h3>
              <span className="text-xs text-slate-400">Calculated from 6-month consumption models</span>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Supply Name</th>
                    <th className="py-2.5 px-3">Current Stock</th>
                    <th className="py-2.5 px-3">Daily Burn</th>
                    <th className="py-2.5 px-3">Days Remaining</th>
                    <th className="py-2.5 px-3">Min Buffer</th>
                    <th className="py-2.5 px-3 text-right">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {hospInvs.map(inv => {
                    const supply = supplies.find(s => s.id === inv.supplyId);
                    const isCritical = inv.riskLevel === 'CRITICAL';
                    const isWarning = inv.riskLevel === 'WARNING' || inv.riskLevel === 'HIGH_RISK';

                    return (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-200">
                          {supply?.name}
                          <div className="text-[10px] text-slate-400">{supply?.category}</div>
                        </td>
                        <td className="py-2 px-3 font-mono text-white">
                          {inv.currentStock.toLocaleString()} <span className="text-[10px] text-slate-400">{supply?.unit}</span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-300">
                          {inv.avgDailyConsumption}/day
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`font-mono font-bold ${
                              isCritical
                                ? 'text-rose-400'
                                : isWarning
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {inv.daysRemaining} days
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400 font-mono">
                          {inv.minStock} units
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              statusColors[inv.riskLevel]
                            }`}
                          >
                            {inv.riskLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Incoming Shipments for this facility */}
          {hospShipments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Inbound Logistics & Shipments</span>
              </h3>
              <div className="space-y-2">
                {hospShipments.map(ship => (
                  <div
                    key={ship.id}
                    className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center space-x-2">
                        <span>{ship.supplyName}</span>
                        <span className="text-slate-400">({ship.quantity} units)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Source: {ship.sourceName} • Tracking: <span className="font-mono text-slate-300">{ship.trackingNumber}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          ship.status === 'DELAYED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {ship.status === 'DELAYED' ? `DELAYED (+${ship.delayDays}d)` : ship.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        ETA: {ship.expectedDeliveryDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiring Lots at this facility */}
          {hospBatches.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Batches Nearing Expiry at this Facility</span>
              </h3>
              <div className="space-y-2">
                {hospBatches.map(b => (
                  <div
                    key={b.id}
                    className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{b.supplyName}</div>
                      <div className="text-[11px] text-slate-400">
                        Lot: <span className="font-mono text-slate-300">{b.batchNumber}</span> • {b.quantity} units on hand
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-400 font-mono">{b.daysUntilExpiry} days left</span>
                      <div className="text-[10px] text-slate-400">
                        Excess: {b.excessQuantity} units (${b.financialLossRisk} risk)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Internal HealthFlow Synthetic Data ID: {selectedHospital.id}
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setQuickAiPrompt(`Analyze resilience and risk profile for ${selectedHospital.name}`);
                setIsAiDrawerOpen(true);
                setSelectedHospital(null);
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Analyze with AI
            </button>
            <button
              onClick={() => setSelectedHospital(null)}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
