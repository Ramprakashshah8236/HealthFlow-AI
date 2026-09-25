import React, { useState } from 'react';
import { HospitalInventory, MedicalSupply, Hospital } from '../types';
import { X, Save, RefreshCw, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StockSimulatorModalProps {
  item: HospitalInventory & {
    supplyName: string;
    category: string;
    unit: string;
    hospitalName: string;
    hospitalCode: string;
  };
  onClose: () => void;
  onSave: (hospitalId: string, supplyId: string, newStock: number) => void;
}

export const StockSimulatorModal: React.FC<StockSimulatorModalProps> = ({
  item,
  onClose,
  onSave,
}) => {
  const [simulatedStock, setSimulatedStock] = useState<number>(item.currentStock);
  const avgBurn = item.avgDailyConsumption;
  const minBuffer = item.minStock;

  // Live dynamic calculations
  const simulatedDays = avgBurn > 0 ? Number((simulatedStock / avgBurn).toFixed(1)) : 999;
  
  const getRisk = (days: number, stock: number) => {
    if (stock <= 0 || days <= 7) return { label: 'CRITICAL', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/40' };
    if (days <= 12 || stock < minBuffer) return { label: 'HIGH_RISK', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/40' };
    if (days <= 18) return { label: 'WARNING', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' };
    return { label: 'STABLE', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' };
  };

  const currentRisk = getRisk(simulatedDays, simulatedStock);
  const projected30Day = Math.round(avgBurn * 30);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Interactive Stock &amp; Risk Simulator</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {item.hospitalCode} &bull; {item.supplyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Item Meta Information */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Facility</span>
              <span className="font-semibold text-slate-200">{item.hospitalName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Avg Daily Burn</span>
              <span className="font-mono font-bold text-teal-300">{avgBurn} {item.unit}/day</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Safety Buffer</span>
              <span className="font-mono text-slate-300">{minBuffer} {item.unit}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">30-Day Projected Demand</span>
              <span className="font-mono text-slate-300">{projected30Day} {item.unit}</span>
            </div>
          </div>

          {/* Interactive Stock Slider & Numeric Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="simulated-stock-input" className="font-semibold text-slate-200">
                Adjust Physical On-Hand Stock ({item.unit})
              </label>
              <input
                id="simulated-stock-input"
                type="number"
                min="0"
                max={Math.max(5000, projected30Day * 2)}
                value={simulatedStock}
                onChange={e => setSimulatedStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-right font-mono font-bold text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <input
              type="range"
              min="0"
              max={Math.max(3000, projected30Day * 1.5)}
              step={Math.max(1, Math.round(avgBurn / 2))}
              value={simulatedStock}
              onChange={e => setSimulatedStock(parseInt(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />

            {/* Quick Preset Buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[10px] text-slate-400">Presets:</span>
              <button
                type="button"
                onClick={() => setSimulatedStock(0)}
                className="px-2 py-0.5 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded text-[10px] hover:bg-rose-900/60"
              >
                0 (Stockout)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedStock(Math.round(avgBurn * 4))}
                className="px-2 py-0.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded text-[10px] hover:bg-rose-900/40"
              >
                4 Days (Critical)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedStock(Math.round(avgBurn * 10))}
                className="px-2 py-0.5 bg-orange-950/40 border border-orange-800/40 text-orange-300 rounded text-[10px] hover:bg-orange-900/40"
              >
                10 Days (High Risk)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedStock(Math.round(avgBurn * 28))}
                className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded text-[10px] hover:bg-emerald-900/40"
              >
                28 Days (Stable)
              </button>
            </div>
          </div>

          {/* Dynamic Calculation Output Matrix */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400">Calculation Formula</span>
              <code className="text-teal-400 font-mono text-[11px]">
                {simulatedStock} &divide; {avgBurn}
              </code>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Dynamic Days Remaining
                </span>
                <span className={`text-2xl font-mono font-bold ${currentRisk.color}`}>
                  {simulatedDays} <span className="text-xs font-normal">days</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Operational Risk Tier
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1 ${currentRisk.bg} ${currentRisk.color}`}
                >
                  {currentRisk.label}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              {simulatedStock < minBuffer && (
                <div className="flex items-center space-x-1.5 text-rose-400 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Deficit Warning: Stock is {minBuffer - simulatedStock} units below safety buffer.</span>
                </div>
              )}
              {simulatedStock >= minBuffer && simulatedDays > 18 && (
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resilient: Inventory satisfies both duration &amp; buffer safety thresholds.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(item.hospitalId, item.supplyId, simulatedStock);
              onClose();
            }}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply Dynamic Update</span>
          </button>
        </div>
      </div>
    </div>
  );
};
