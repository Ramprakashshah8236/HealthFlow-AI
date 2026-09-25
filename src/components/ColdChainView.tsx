import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Layers,
  Activity,
} from 'lucide-react';

interface ColdChainSensor {
  id: string;
  facility: string;
  unitName: string;
  currentTemp: number;
  minSafe: number;
  maxSafe: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  storedCargo: string;
  lastReading: string;
  history: number[];
}

export const ColdChainView: React.FC = () => {
  const {
    setBannerNotification,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
    acknowledgeSensorWarning,
    currentPermissions,
  } = useApp();

  const [sensors, setSensors] = useState<ColdChainSensor[]>([
    {
      id: 'CC-SENS-101',
      facility: 'Central Medical Reserve (Depot 1)',
      unitName: 'Ultra-Cold BioFreezer A',
      currentTemp: 4.2,
      minSafe: 2.0,
      maxSafe: 8.0,
      status: 'NORMAL',
      storedCargo: 'Insulin Glargine & MMR Vaccines',
      lastReading: '45s ago',
      history: [4.1, 4.2, 4.3, 4.2, 4.1, 4.2],
    },
    {
      id: 'CC-SENS-102',
      facility: 'Metro General Hospital (HOSP-001)',
      unitName: 'Pharmacy Cold Vault B',
      currentTemp: 7.8,
      minSafe: 2.0,
      maxSafe: 8.0,
      status: 'WARNING',
      storedCargo: 'Antibiotics & Pediatric Injections',
      lastReading: '12s ago',
      history: [6.5, 6.9, 7.2, 7.5, 7.7, 7.8],
    },
    {
      id: 'CC-SENS-103',
      facility: 'St. Jude Regional Medical Center',
      unitName: 'Blood Bank CryoStorage 1',
      currentTemp: 3.6,
      minSafe: 2.0,
      maxSafe: 6.0,
      status: 'NORMAL',
      storedCargo: 'Packed Red Blood Cells (O-Negative)',
      lastReading: '1m ago',
      history: [3.5, 3.6, 3.6, 3.7, 3.6, 3.6],
    },
    {
      id: 'CC-SENS-104',
      facility: 'Transit Courier Van TRK-902',
      unitName: 'Mobile Refrigerated Cargo Pod',
      currentTemp: 5.1,
      minSafe: 2.0,
      maxSafe: 8.0,
      status: 'NORMAL',
      storedCargo: 'Viral Diagnostic Transport Media',
      lastReading: '30s ago',
      history: [4.8, 4.9, 5.0, 5.1, 5.1, 5.1],
    },
    {
      id: 'CC-SENS-105',
      facility: 'University Teaching Hospital',
      unitName: 'Cellular Therapy CryoFreezer',
      currentTemp: -19.4,
      minSafe: -25.0,
      maxSafe: -15.0,
      status: 'NORMAL',
      storedCargo: 'Cryopreserved Stem Cells',
      lastReading: '2m ago',
      history: [-19.5, -19.4, -19.4, -19.3, -19.4, -19.4],
    },
    {
      id: 'CC-SENS-106',
      facility: 'Highland Park Hospital',
      unitName: 'Vaccine Buffer Refrigerator 2',
      currentTemp: 8.3,
      minSafe: 2.0,
      maxSafe: 8.0,
      status: 'CRITICAL',
      storedCargo: 'Tetanus Toxoid & Rabies Vaccines',
      lastReading: '18s ago',
      history: [7.2, 7.6, 7.9, 8.1, 8.2, 8.3],
    },
  ]);

  const handleRecalibrateSensor = (sensorId: string) => {
    if (!currentPermissions.canResetSensorAlarm) {
      acknowledgeSensorWarning(sensorId);
      return;
    }

    acknowledgeSensorWarning(sensorId);
    setSensors(prev =>
      prev.map(s => {
        if (s.id === sensorId) {
          const resetTemp = 4.5;
          return {
            ...s,
            currentTemp: resetTemp,
            status: 'NORMAL',
            history: [...s.history.slice(1), resetTemp],
          };
        }
        return s;
      })
    );
    setBannerNotification(
      `IoT Telemetry Calibrated: Sensor ${sensorId} cooling compressor adjusted. Temperature restored to 4.5°C.`
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300 font-semibold">
                Simulated IoT Sensor Telemetry (Protocol ISO-13485)
              </span>
              <span className="text-xs text-slate-400">• Live Stream</span>
            </div>
            <h1 className="text-lg font-bold text-white flex items-center space-x-2 mt-1">
              <Thermometer className="w-5 h-5 text-cyan-400" />
              <span>Cold-Chain Telemetry &amp; Biological Storage Intelligence</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Continuous thermal monitoring for temperature-sensitive pharmaceuticals, vaccines, blood products, and reagents.
            </p>
          </div>

          <button
            onClick={() => {
              setQuickAiPrompt('Are there any cold-chain violations or thermal excursions that could compromise vaccine potency?');
              setIsAiDrawerOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Cold-Chain Audit</span>
          </button>
        </div>

        {/* Cold-Chain Summary Pills */}
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs">
            <span className="text-slate-400">Total Telemetry Pods</span>
            <div className="text-lg font-bold text-white mt-0.5">{sensors.length} Active Nodes</div>
          </div>
          <div className="p-3 bg-slate-950/70 border border-emerald-900/40 rounded-lg text-xs">
            <span className="text-emerald-400">Thermal Compliance</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {Math.round((sensors.filter(s => s.status === 'NORMAL').length / sensors.length) * 100)}%
            </div>
          </div>
          <div className="p-3 bg-slate-950/70 border border-amber-900/40 rounded-lg text-xs">
            <span className="text-amber-400">Warning Excursions</span>
            <div className="text-lg font-bold text-amber-400 mt-0.5">
              {sensors.filter(s => s.status === 'WARNING').length} Unit
            </div>
          </div>
          <div className="p-3 bg-slate-950/70 border border-rose-900/40 rounded-lg text-xs">
            <span className="text-rose-400">Critical Out-of-Range</span>
            <div className="text-lg font-bold text-rose-400 mt-0.5">
              {sensors.filter(s => s.status === 'CRITICAL').length} Unit
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Pods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map(sensor => {
          const isCritical = sensor.status === 'CRITICAL';
          const isWarning = sensor.status === 'WARNING';

          return (
            <div
              key={sensor.id}
              className={`p-5 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-600/80 shadow-md'
                  : isWarning
                  ? 'bg-amber-950/15 border-amber-500/50'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {sensor.id}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{sensor.unitName}</h3>
                  <div className="text-xs text-slate-400">{sensor.facility}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {sensor.status}
                </span>
              </div>

              {/* Temperature Display Gauge */}
              <div className="my-4 py-3 px-4 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Current Temperature
                  </span>
                  <div
                    className={`text-2xl font-bold font-mono ${
                      isCritical
                        ? 'text-rose-400'
                        : isWarning
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {sensor.currentTemp > 0 ? `+${sensor.currentTemp}` : sensor.currentTemp}°C
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400 text-[10px] block">Safe Window</span>
                  <span className="font-mono text-slate-200">
                    {sensor.minSafe}°C to {sensor.maxSafe}°C
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Updated {sensor.lastReading}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-300 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Protected Cargo:</span>
                  <span className="font-medium text-slate-200 text-right truncate max-w-[180px]">
                    {sensor.storedCargo}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                {isCritical || isWarning ? (
                  <button
                    onClick={() => handleRecalibrateSensor(sensor.id)}
                    className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Engage Backup Chiller &amp; Recalibrate</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Compliant ISO Standard</span>
                    </span>
                    <button
                      onClick={() => handleRecalibrateSensor(sensor.id)}
                      className="hover:text-teal-400 underline text-[10px]"
                    >
                      Ping Node
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
