import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Network,
  Building2,
  Warehouse,
  Factory,
  Truck,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Info,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Compass,
  Maximize2,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react';

type LayerType = 'all' | 'hospitals' | 'warehouses' | 'suppliers' | 'shipments';

export const NetworkMapView: React.FC = () => {
  const {
    hospitals,
    warehouses,
    suppliers,
    shipments,
    inventories,
    setSelectedHospital,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
  } = useApp();

  const [viewMode, setViewMode] = useState<'geo' | 'topology' | 'shipments'>('geo');
  const [activeLayer, setActiveLayer] = useState<LayerType>('all');
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'hospital' | 'warehouse' | 'supplier' | 'shipment';
    data: any;
  } | null>(null);

  // Map viewport states for pan/zoom simulation
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Filtered shipments
  const activeShipments = useMemo(() => {
    return shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'DELAYED' || s.status === 'SCHEDULED');
  }, [shipments]);

  // Derive coordinates for shipments
  const shipmentArcs = useMemo(() => {
    return activeShipments.map(s => {
      // Find source coordinate
      let sourceCoord = { x: 50, y: 40 };
      if (s.sourceType === 'SUPPLIER') {
        const sup = suppliers.find(sp => sp.id === s.sourceId);
        if (sup) sourceCoord = sup.coordinates;
      } else if (s.sourceType === 'WAREHOUSE') {
        const wh = warehouses.find(w => w.id === s.sourceId);
        if (wh) sourceCoord = wh.coordinates;
      } else if (s.sourceType === 'HOSPITAL') {
        const hosp = hospitals.find(h => h.id === s.sourceId);
        if (hosp) sourceCoord = hosp.coordinates;
      }

      // Find dest coordinate
      let destCoord = { x: 48, y: 52 };
      if (s.destinationType === 'HOSPITAL') {
        const hosp = hospitals.find(h => h.id === s.destinationId);
        if (hosp) destCoord = hosp.coordinates;
      } else if (s.destinationType === 'WAREHOUSE') {
        const wh = warehouses.find(w => w.id === s.destinationId);
        if (wh) destCoord = wh.coordinates;
      }

      return {
        shipment: s,
        from: sourceCoord,
        to: destCoord,
      };
    });
  }, [activeShipments, suppliers, warehouses, hospitals]);

  const statusColorMap = {
    CRITICAL: { border: 'border-rose-500', bg: 'bg-rose-500', ring: 'ring-rose-500/40', text: 'text-rose-400' },
    HIGH_RISK: { border: 'border-orange-500', bg: 'bg-orange-500', ring: 'ring-orange-500/40', text: 'text-orange-400' },
    WARNING: { border: 'border-amber-500', bg: 'bg-amber-500', ring: 'ring-amber-500/40', text: 'text-amber-400' },
    STABLE: { border: 'border-emerald-500', bg: 'bg-emerald-500', ring: 'ring-emerald-500/40', text: 'text-emerald-400' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Phase 7 — Regional Supply Network
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Hospitals + Depots + Suppliers + In-Transit Shipments
              </span>
            </div>
            <h1 className="text-lg font-bold text-white flex items-center space-x-2 mt-1.5">
              <Network className="w-5 h-5 text-teal-400" />
              <span>Interactive Regional Healthcare Network Map</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              End-to-end supply chain visibility spanning 8 Tier-1 Manufacturers, 3 Strategic Logistics Depots, 10 Regional Care Hospitals, and real-time transit telemetry corridors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex space-x-1 text-xs">
              <button
                id="btn-view-geo"
                onClick={() => setViewMode('geo')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'geo'
                    ? 'bg-teal-600 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Geographic Map
              </button>
              <button
                id="btn-view-topology"
                onClick={() => setViewMode('topology')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'topology'
                    ? 'bg-teal-600 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tier Pipeline
              </button>
              <button
                id="btn-view-shipments"
                onClick={() => setViewMode('shipments')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'shipments'
                    ? 'bg-teal-600 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Fleet Telemetry ({shipments.length})
              </button>
            </div>

            <button
              onClick={() => {
                setQuickAiPrompt(
                  'Analyze our network topology and logistics corridors. Point out any single point of failure between suppliers, regional depots, and critical hospitals.'
                );
                setIsAiDrawerOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Corridor Audit</span>
            </button>
          </div>
        </div>

        {/* Quick Network Aggregate Summary Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-teal-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">10 Care Facilities</span>
              <span className="text-white font-mono font-bold">
                {hospitals.filter(h => h.riskLevel === 'CRITICAL').length} Critical • {hospitals.filter(h => h.riskLevel === 'STABLE').length} Stable
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Warehouse className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">3 Regional Depots</span>
              <span className="text-white font-mono font-bold">630,000 Units Capacity</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Factory className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">8 Tier-1 Suppliers</span>
              <span className="text-white font-mono font-bold">92.6% Avg Reliability</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{activeShipments.length} Couriers Active</span>
              <span className="text-amber-300 font-mono font-bold">
                {shipments.filter(s => s.status === 'DELAYED').length} Delayed Alert
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: Interactive Geographic Map Canvas */}
      {viewMode === 'geo' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Map Canvas (3 cols) */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            {/* Map Canvas Header & Layer Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Metro Regional Logistics Coordinate Matrix
                </span>
                <span className="text-[10px] font-mono text-slate-400">(40.60°N - 40.95°N / 73.70°W - 74.25°W)</span>
              </div>

              {/* Layer Controls */}
              <div className="flex items-center space-x-1 text-[11px]">
                <span className="text-slate-500 mr-1 flex items-center">
                  <Layers className="w-3.5 h-3.5 mr-1" /> Layers:
                </span>
                {(['all', 'hospitals', 'warehouses', 'suppliers', 'shipments'] as LayerType[]).map(layer => (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                      activeLayer === layer
                        ? 'bg-slate-800 text-teal-300 border border-teal-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {layer}
                  </button>
                ))}
              </div>
            </div>

            {/* High-Fidelity Interactive SVG Coordinate Map */}
            <div className="relative w-full h-[540px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden select-none">
              {/* Radial coordinate grid background */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#14b8a6 1.2px, transparent 1.2px), radial-gradient(#0ea5e9 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                  backgroundPosition: '0 0, 18px 18px',
                }}
              />

              {/* Waterway and Regional Corridor Outlines (SVG aesthetic vector styling) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
                <path
                  d="M 280 0 Q 320 200 450 360 T 600 540"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="6 8"
                />
                <path
                  d="M 0 320 Q 200 300 450 360 T 800 420"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Transit Arcs (Shipments in transit) */}
              {(activeLayer === 'all' || activeLayer === 'shipments') && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="transitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="delayedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  {shipmentArcs.map((arc, i) => {
                    const isDelayed = arc.shipment.status === 'DELAYED';
                    return (
                      <g key={i}>
                        {/* Connecting Line */}
                        <line
                          x1={`${arc.from.x}%`}
                          y1={`${arc.from.y}%`}
                          x2={`${arc.to.x}%`}
                          y2={`${arc.to.y}%`}
                          stroke={isDelayed ? 'url(#delayedGrad)' : 'url(#transitGrad)'}
                          strokeWidth={isDelayed ? '2.5' : '2'}
                          strokeDasharray={isDelayed ? '4 4' : '6 4'}
                          className={isDelayed ? 'animate-pulse' : ''}
                        />
                        {/* Midpoint Truck Marker */}
                        <circle
                          cx={`${(arc.from.x + arc.to.x) / 2}%`}
                          cy={`${(arc.from.y + arc.to.y) / 2}%`}
                          r="5"
                          fill={isDelayed ? '#f43f5e' : '#2dd4bf'}
                          className="animate-ping"
                          opacity="0.6"
                        />
                        <circle
                          cx={`${(arc.from.x + arc.to.x) / 2}%`}
                          cy={`${(arc.from.y + arc.to.y) / 2}%`}
                          r="4"
                          fill={isDelayed ? '#f59e0b' : '#0d9488'}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* TIER-1 SUPPLIER PINS */}
              {(activeLayer === 'all' || activeLayer === 'suppliers') &&
                suppliers.map(sup => (
                  <div
                    key={sup.id}
                    style={{ left: `${sup.coordinates.x}%`, top: `${sup.coordinates.y}%` }}
                    onClick={() => setSelectedEntity({ type: 'supplier', data: sup })}
                    onMouseEnter={() => setHoveredNodeId(sup.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-900/90 border border-purple-500/60 shadow-md group-hover:border-purple-400 group-hover:scale-105 transition-all">
                      <Factory className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] font-bold text-slate-200 hidden sm:inline">
                        {sup.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* Hover Card Preview */}
                    {hoveredNodeId === sup.id && (
                      <div className="absolute left-full ml-2 top-0 z-30 w-52 p-2.5 bg-slate-900 border border-purple-500/80 rounded-lg shadow-xl text-[11px] pointer-events-none">
                        <div className="font-bold text-white">{sup.name}</div>
                        <div className="text-purple-300 text-[10px]">{sup.location}</div>
                        <div className="mt-1 pt-1 border-t border-slate-800 text-slate-400 flex justify-between">
                          <span>Reliability:</span>
                          <span className="text-white font-mono font-bold">{sup.reliabilityRating}%</span>
                        </div>
                        <div className="text-slate-400 flex justify-between">
                          <span>Lead Time:</span>
                          <span className="text-white font-mono">{sup.leadTimeDays} days</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              {/* REGIONAL DEPOT / WAREHOUSE PINS */}
              {(activeLayer === 'all' || activeLayer === 'warehouses') &&
                warehouses.map(wh => (
                  <div
                    key={wh.id}
                    style={{ left: `${wh.coordinates.x}%`, top: `${wh.coordinates.y}%` }}
                    onClick={() => setSelectedEntity({ type: 'warehouse', data: wh })}
                    onMouseEnter={() => setHoveredNodeId(wh.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-25 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/95 border-2 border-cyan-500 shadow-lg group-hover:border-cyan-300 group-hover:scale-110 transition-all">
                      <Warehouse className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">{wh.code}</span>
                    </div>

                    {hoveredNodeId === wh.id && (
                      <div className="absolute left-full ml-2 top-0 z-30 w-56 p-2.5 bg-slate-900 border border-cyan-500/80 rounded-lg shadow-xl text-[11px] pointer-events-none">
                        <div className="font-bold text-white">{wh.name}</div>
                        <div className="text-cyan-300 text-[10px]">{wh.region}</div>
                        <div className="mt-1 pt-1 border-t border-slate-800 text-slate-400 flex justify-between">
                          <span>Capacity:</span>
                          <span className="text-white font-mono">{wh.capacityUnits.toLocaleString()} units</span>
                        </div>
                        <div className="text-slate-400 flex justify-between">
                          <span>Cold Chain:</span>
                          <span className={wh.coldChainSupported ? 'text-teal-400 font-bold' : 'text-slate-500'}>
                            {wh.coldChainSupported ? 'Compliant (2-8°C)' : 'Ambient Only'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              {/* REGIONAL CARE HOSPITAL PINS */}
              {(activeLayer === 'all' || activeLayer === 'hospitals') &&
                hospitals.map(hosp => {
                  const style = statusColorMap[hosp.riskLevel];
                  const isCrit = hosp.riskLevel === 'CRITICAL';
                  return (
                    <div
                      key={hosp.id}
                      style={{ left: `${hosp.coordinates.x}%`, top: `${hosp.coordinates.y}%` }}
                      onClick={() => {
                        setSelectedHospital(hosp);
                        setSelectedEntity({ type: 'hospital', data: hosp });
                      }}
                      onMouseEnter={() => setHoveredNodeId(hosp.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
                    >
                      <div
                        className={`flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-900/90 border ${
                          style.border
                        } shadow-md group-hover:scale-110 transition-all ${
                          isCrit ? 'animate-pulse ring-2 ring-rose-500/50' : ''
                        }`}
                      >
                        <Building2 className={`w-3.5 h-3.5 ${style.text}`} />
                        <span className="text-[11px] font-bold text-white">{hosp.code}</span>
                      </div>

                      {hoveredNodeId === hosp.id && (
                        <div className="absolute right-full mr-2 top-0 z-40 w-56 p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-[11px] pointer-events-none">
                          <div className="font-bold text-white">{hosp.name}</div>
                          <div className="flex items-center justify-between mt-1 text-[10px]">
                            <span className="text-slate-400">{hosp.region}</span>
                            <span className={`font-bold ${style.text}`}>{hosp.riskLevel}</span>
                          </div>
                          <div className="mt-1 pt-1 border-t border-slate-800 text-slate-400 flex justify-between">
                            <span>Patient Beds:</span>
                            <span className="text-white font-mono">
                              {hosp.patientLoad}/{hosp.beds} ({hosp.currentOccupancy}%)
                            </span>
                          </div>
                          <div className="text-slate-400 flex justify-between">
                            <span>Shortage Risk:</span>
                            <span className="font-mono font-bold text-rose-400">{hosp.riskScore}/100</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Map Legend Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[10px] space-y-1 backdrop-blur-xs">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[9px] mb-1">
                  Map Legend
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-300">Critical Hospital</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-300">Stable Hospital</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span>
                  <span className="text-slate-300">Regional Depot</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded bg-purple-500"></span>
                  <span className="text-slate-300">Tier-1 Manufacturer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-0.5 bg-teal-400"></span>
                  <span className="text-slate-300">In-Transit Freight</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Node Inspector & Active Corridors */}
          <div className="space-y-4">
            {/* Selected Node Details Card */}
            {selectedEntity ? (
              <div className="bg-slate-900 border border-teal-500/50 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>{selectedEntity.type.toUpperCase()} INSPECTOR</span>
                  </span>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-white">{selectedEntity.data.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedEntity.data.region || selectedEntity.data.location || 'Regional Node'}
                  </p>

                  {selectedEntity.type === 'hospital' && (
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Risk Assessment:</span>
                        <span className="font-bold text-rose-400">
                          {selectedEntity.data.riskLevel} ({selectedEntity.data.riskScore}/100)
                        </span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Bed Occupancy:</span>
                        <span className="font-mono text-white">
                          {selectedEntity.data.patientLoad}/{selectedEntity.data.beds} ({selectedEntity.data.currentOccupancy}%)
                        </span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Logistics Contact:</span>
                        <span className="text-slate-200">{selectedEntity.data.contactPerson}</span>
                      </div>
                      <button
                        onClick={() => setSelectedHospital(selectedEntity.data)}
                        className="w-full mt-2 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <span>Inspect Facility Stock</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {selectedEntity.type === 'warehouse' && (
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Total Capacity:</span>
                        <span className="font-mono text-white">
                          {selectedEntity.data.capacityUnits.toLocaleString()} units
                        </span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Utilized Stock:</span>
                        <span className="font-mono text-teal-400">
                          {selectedEntity.data.utilizedUnits.toLocaleString()} units
                        </span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Cold Chain Infrastructure:</span>
                        <span className={selectedEntity.data.coldChainSupported ? 'text-teal-400 font-bold' : 'text-slate-400'}>
                          {selectedEntity.data.coldChainSupported ? 'Active (2–8°C)' : 'Ambient'}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedEntity.type === 'supplier' && (
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Reliability Score:</span>
                        <span className="font-bold text-teal-400 font-mono">
                          {selectedEntity.data.reliabilityRating}%
                        </span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Standard Lead Time:</span>
                        <span className="font-mono text-white">{selectedEntity.data.leadTimeDays} days</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800">
                        <span className="text-slate-400 block mb-1">Categories:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedEntity.data.categories.map((c: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
                <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">No Node Selected</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click on any hospital, depot, or supplier node on the map to inspect live metrics.
                </p>
              </div>
            )}

            {/* Active In-Transit Shipment Alerts */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center justify-between mb-3">
                <span className="flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Active Shipments</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400">{activeShipments.length} Moving</span>
              </h3>

              <div className="space-y-2 text-xs">
                {activeShipments.map(s => {
                  const isDelayed = s.status === 'DELAYED';
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedEntity({ type: 'shipment', data: s })}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isDelayed
                          ? 'bg-rose-950/30 border-rose-900/60 hover:border-rose-700'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate max-w-[140px]">{s.supplyName}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isDelayed
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                        <span className="truncate">{s.sourceName.split(' ')[0]}</span>
                        <ArrowRight className="w-3 h-3 shrink-0 text-slate-500" />
                        <span className="truncate">{s.destinationName.split(' ')[0]}</span>
                      </div>

                      <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>{s.quantity.toLocaleString()} units</span>
                        <span className={isDelayed ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          ETA: {s.expectedDeliveryDate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Multi-Tier Supply Flow Pipeline Topology */}
      {viewMode === 'topology' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMN 1: Tier-1 Suppliers (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center space-x-1.5">
                  <Factory className="w-4 h-4 text-purple-400" />
                  <span>Tier-1 Suppliers (8)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Mfg Base</span>
              </div>

              <div className="space-y-2">
                {suppliers.map(sup => (
                  <div
                    key={sup.id}
                    onClick={() => setSelectedEntity({ type: 'supplier', data: sup })}
                    className="p-3 bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 rounded-lg cursor-pointer transition-all hover:bg-slate-950 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{sup.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                        {sup.reliabilityRating}% Rel
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{sup.categories.join(', ')}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Lead time: {sup.leadTimeDays}d</span>
                      <span>{sup.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: Regional Depots / Central Warehouses (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center space-x-1.5">
                  <Warehouse className="w-4 h-4 text-cyan-400" />
                  <span>Regional Depots (3)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Buffer Hubs</span>
              </div>

              <div className="space-y-3">
                {warehouses.map(wh => (
                  <div
                    key={wh.id}
                    onClick={() => setSelectedEntity({ type: 'warehouse', data: wh })}
                    className="p-4 bg-slate-950/80 border border-cyan-500/40 hover:border-cyan-400 rounded-xl cursor-pointer transition-all hover:bg-slate-950 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between font-bold text-white text-sm">
                      <span>{wh.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        {wh.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{wh.region}</div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Capacity:</span>
                        <span className="font-mono text-slate-200">
                          {wh.capacityUnits.toLocaleString()} units
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Utilized Buffer:</span>
                        <span className="font-mono text-teal-300">
                          {wh.utilizedUnits.toLocaleString()} units ({Math.round((wh.utilizedUnits / wh.capacityUnits) * 100)}%)
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Cold Chain:</span>
                        <span
                          className={`font-semibold ${
                            wh.coldChainSupported ? 'text-teal-400' : 'text-slate-500'
                          }`}
                        >
                          {wh.coldChainSupported ? 'Active (2–8°C)' : 'Ambient Only'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 3: Regional Care Hospitals (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span>Regional Care Hospitals (10 Point-of-Care Facilities)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Clinical Consumption</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {hospitals.map(hosp => {
                  const style = statusColorMap[hosp.riskLevel];
                  return (
                    <div
                      key={hosp.id}
                      onClick={() => {
                        setSelectedHospital(hosp);
                        setSelectedEntity({ type: 'hospital', data: hosp });
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        hosp.riskLevel === 'CRITICAL'
                          ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                          : hosp.riskLevel === 'HIGH_RISK'
                          ? 'bg-orange-950/40 border-orange-500 text-orange-300'
                          : hosp.riskLevel === 'WARNING'
                          ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                          : 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-white text-xs">
                        <span className="line-clamp-1">{hosp.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-900/80 ml-2 shrink-0">
                          {hosp.code}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 mt-1 flex justify-between">
                        <span>{hosp.region}</span>
                        <span className="font-semibold">{hosp.riskLevel}</span>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex justify-between text-[10px] text-slate-300 font-mono">
                        <span>{hosp.patientLoad}/{hosp.beds} beds ({hosp.currentOccupancy}%)</span>
                        <span>Risk Score: {hosp.riskScore}/100</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Detailed In-Transit Fleet & Telemetry Register */}
      {viewMode === 'shipments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Active Regional Fleet Couriers &amp; Inbound Shipments</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of inter-facility redistributions and replenishment deliveries.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {shipments.length} Total Shipments Catalogued
            </span>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Tracking #</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Medical Supply Item</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Source Origin</th>
                  <th className="py-2.5 px-3">Destination Facility</th>
                  <th className="py-2.5 px-3">Carrier / Logistics</th>
                  <th className="py-2.5 px-3 text-right">Expected Arrival</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {shipments.map(s => {
                  const isDelayed = s.status === 'DELAYED';
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedEntity({ type: 'shipment', data: s })}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">
                        {s.trackingNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isDelayed
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : s.status === 'IN_TRANSIT'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {s.status}
                          {isDelayed && ` (+${s.delayDays}d)`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">{s.supplyName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-200">
                        {s.quantity.toLocaleString()} units
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{s.sourceName}</td>
                      <td className="py-2.5 px-3 text-slate-300">{s.destinationName}</td>
                      <td className="py-2.5 px-3 text-slate-400">{s.carrier}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {s.expectedDeliveryDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
