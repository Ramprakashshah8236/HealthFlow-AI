import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  Building2,
  TrendingDown,
  ArrowUpDown,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react';
import { SupplyCategory, HospitalInventory } from '../types';
import { StockSimulatorModal } from './StockSimulatorModal';

export const SupplyIntelligenceView: React.FC = () => {
  const {
    inventories,
    supplies,
    hospitals,
    setSelectedHospital,
    setActiveTab,
    setIsAiDrawerOpen,
    setQuickAiPrompt,
    updateInventoryStock,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'days' | 'stock' | 'burn'>('days');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Simulation modal target
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const categories: SupplyCategory[] = [
    'Pharmaceuticals',
    'Critical Care',
    'PPE',
    'Consumables',
    'Diagnostics',
    'Surgical & Trauma',
    'Blood & Biologics',
  ];

  // Combined searchable records
  const filteredRecords = useMemo(() => {
    return inventories
      .map(inv => {
        const supply = supplies.find(s => s.id === inv.supplyId);
        const hospital = hospitals.find(h => h.id === inv.hospitalId);
        return {
          ...inv,
          supplyName: supply?.name || '',
          category: supply?.category || 'Consumables',
          unit: supply?.unit || 'units',
          hospitalName: hospital?.name || '',
          hospitalCode: hospital?.code || '',
        };
      })
      .filter(item => {
        const matchesSearch =
          item.supplyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.hospitalCode.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesHospital =
          selectedHospitalFilter === 'ALL' || item.hospitalId === selectedHospitalFilter;

        const matchesCategory =
          selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;

        const matchesRisk =
          selectedRiskFilter === 'ALL' || item.riskLevel === selectedRiskFilter;

        return matchesSearch && matchesHospital && matchesCategory && matchesRisk;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'days') diff = a.daysRemaining - b.daysRemaining;
        else if (sortBy === 'stock') diff = a.currentStock - b.currentStock;
        else if (sortBy === 'burn') diff = a.avgDailyConsumption - b.avgDailyConsumption;

        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [
    inventories,
    supplies,
    hospitals,
    searchQuery,
    selectedHospitalFilter,
    selectedCategoryFilter,
    selectedRiskFilter,
    sortBy,
    sortOrder,
  ]);

  // Aggregate Metrics for Live Intelligence Banner
  const metrics = useMemo(() => {
    let criticalCount = 0;
    let highRiskCount = 0;
    let warningCount = 0;
    let stableCount = 0;
    let belowBufferCount = 0;

    filteredRecords.forEach(r => {
      if (r.riskLevel === 'CRITICAL') criticalCount++;
      else if (r.riskLevel === 'HIGH_RISK') highRiskCount++;
      else if (r.riskLevel === 'WARNING') warningCount++;
      else stableCount++;

      if (r.currentStock < r.minStock) belowBufferCount++;
    });

    return {
      total: filteredRecords.length,
      criticalCount,
      highRiskCount,
      warningCount,
      stableCount,
      belowBufferCount,
    };
  }, [filteredRecords]);

  const riskBadgeStyles = {
    CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    HIGH_RISK: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    WARNING: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    STABLE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Explanatory Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-teal-400" />
              <span>Supply Intelligence Matrix</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic mathematical resilience pipeline:{' '}
              <span className="text-white font-medium">Stock</span> &rarr;{' '}
              <span className="text-teal-300 font-medium">Consumption (30d MA)</span> &rarr;{' '}
              <span className="text-amber-300 font-medium">Days Remaining</span> &rarr;{' '}
              <span className="text-rose-300 font-medium">Risk Tier</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
              Showing <span className="font-bold text-white font-mono">{filteredRecords.length}</span> of {inventories.length} item records
            </div>
            <button
              onClick={() => {
                setQuickAiPrompt('Analyze our supplies with less than 7 days remaining. Which facilities are closest to a stockout cliff?');
                setIsAiDrawerOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Ask AI About Stock</span>
            </button>
          </div>
        </div>

        {/* Phase 2: High-Level Stock & Risk Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Critical Stockouts</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-rose-400">{metrics.criticalCount}</span>
              <span className="text-[10px] text-slate-400">&le; 7 days supply</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">High Risk</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-orange-400">{metrics.highRiskCount}</span>
              <span className="text-[10px] text-slate-400">8 - 12 days supply</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Buffer Deficit</span>
              <TrendingDown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-amber-400">{metrics.belowBufferCount}</span>
              <span className="text-[10px] text-slate-400">below min safety level</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Stable Supply</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">{metrics.stableCount}</span>
              <span className="text-[10px] text-slate-400">&gt; 18 days supply</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="input-supply-search"
              type="text"
              placeholder="Search supply or hospital..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Hospital Filter */}
          <div>
            <select
              id="select-filter-hospital"
              value={selectedHospitalFilter}
              onChange={e => setSelectedHospitalFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Hospitals (10)</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="select-filter-category"
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              id="select-filter-risk"
              value={selectedRiskFilter}
              onChange={e => setSelectedRiskFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">🔴 Critical (&le; 7d)</option>
              <option value="HIGH_RISK">🟠 High Risk (&le; 12d)</option>
              <option value="WARNING">🟡 Warning (&le; 18d)</option>
              <option value="STABLE">🟢 Stable (&gt; 18d)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex space-x-1">
            <select
              id="select-sort-by"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="days">Sort: Days Remaining</option>
              <option value="stock">Sort: Stock Quantity</option>
              <option value="burn">Sort: Daily Consumption</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Inventory Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Supply Item</th>
                <th className="py-3 px-4">Facility / Hospital</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Min Buffer</th>
                <th className="py-3 px-4">Avg Daily Burn</th>
                <th className="py-3 px-4">Projected Demand</th>
                <th className="py-3 px-4">Days Remaining</th>
                <th className="py-3 px-4 text-center">Shortage Risk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(item => {
                  const isCritical = item.riskLevel === 'CRITICAL';
                  const isHigh = item.riskLevel === 'HIGH_RISK';
                  const isWarning = item.riskLevel === 'WARNING';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCritical ? 'bg-rose-950/15' : isHigh ? 'bg-orange-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-white">
                        {item.supplyName}
                        {isCritical && (
                          <span className="block text-[10px] font-normal text-rose-400 mt-0.5">
                            Critical stockout cliff projected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            const h = hospitals.find(x => x.id === item.hospitalId);
                            if (h) setSelectedHospital(h);
                          }}
                          className="text-slate-300 hover:text-teal-300 text-left font-medium"
                        >
                          {item.hospitalName}
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {item.hospitalCode}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{item.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {item.currentStock.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {item.minStock.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {item.avgDailyConsumption}/day
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {item.projectedDailyDemand}/day
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isCritical
                              ? 'text-rose-400'
                              : isHigh
                              ? 'text-orange-400'
                              : isWarning
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {item.daysRemaining} days
                        </span>
                        {item.daysRemaining <= item.minStock / item.avgDailyConsumption && (
                          <span className="block text-[10px] text-rose-400">Below Min Buffer</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            riskBadgeStyles[item.riskLevel]
                          }`}
                        >
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white rounded text-xs transition-colors"
                            title="Simulate / Adjust Stock"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          {isCritical || isHigh ? (
                            <button
                              onClick={() => setActiveTab('redistribution')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold transition-colors"
                            >
                              Redistribute
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const h = hospitals.find(x => x.id === item.hospitalId);
                                if (h) setSelectedHospital(h);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors"
                            >
                              Inspect
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                    No supply records match your selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Simulator Modal */}
      {editingItem && (
        <StockSimulatorModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={updateInventoryStock}
        />
      )}
    </div>
  );
};

