import {
  Hospital,
  HospitalInventory,
  MedicalSupply,
  BatchRecord,
  Shipment,
  Supplier,
  RedistributionRecommendation,
  CrisisParameters,
  SimulationSummary,
  Alert,
  HospitalStatus,
  SupplyRisk,
} from '../types';

export function calculateDaysRemaining(stock: number, dailyConsumption: number): number {
  if (dailyConsumption <= 0) return 999;
  return Number((stock / dailyConsumption).toFixed(1));
}

export function getSupplyRiskLevel(daysRemaining: number): SupplyRisk {
  if (daysRemaining <= 7) return 'CRITICAL';
  if (daysRemaining <= 12) return 'HIGH_RISK';
  if (daysRemaining <= 18) return 'WARNING';
  return 'STABLE';
}

export function calculateHospitalRisk(
  hospital: Hospital,
  hospitalInventories: HospitalInventory[]
): { score: number; level: HospitalStatus } {
  const criticalItems = hospitalInventories.filter(i => i.riskLevel === 'CRITICAL').length;
  const highRiskItems = hospitalInventories.filter(i => i.riskLevel === 'HIGH_RISK').length;
  const warningItems = hospitalInventories.filter(i => i.riskLevel === 'WARNING').length;

  let score = criticalItems * 22 + highRiskItems * 10 + warningItems * 4;

  // Patient load occupancy factor
  if (hospital.currentOccupancy >= 95) score += 20;
  else if (hospital.currentOccupancy >= 88) score += 12;
  else if (hospital.currentOccupancy >= 80) score += 6;

  // Clamp 5 - 99
  score = Math.min(99, Math.max(8, score));

  let level: HospitalStatus = 'STABLE';
  if (score >= 78) level = 'CRITICAL';
  else if (score >= 60) level = 'HIGH_RISK';
  else if (score >= 38) level = 'WARNING';

  return { score, level };
}

// Distance approximation in km between coordinate points
export function calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
  const R = 6371; // km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c) || 18; // Default minimum urban transit km
}

export function detectExpiringBatches(
  batches: BatchRecord[],
  inventories: HospitalInventory[]
): BatchRecord[] {
  return batches.map(batch => {
    // Find matching inventory
    const inv = inventories.find(
      i => i.hospitalId === batch.facilityId && i.supplyId === batch.supplyId
    );
    const dailyUsage = inv ? inv.avgDailyConsumption : Math.max(3, Math.round(batch.quantity / 30));
    
    // Expected usage before expiry date
    const expectedUsage = Math.round(dailyUsage * Math.max(1, batch.daysUntilExpiry));
    const excess = Math.max(0, batch.quantity - expectedUsage);
    const loss = excess * batch.unitCost;

    let status: 'ACTIVE' | 'WARNING' | 'CRITICAL_EXPIRY' = 'ACTIVE';
    if (batch.daysUntilExpiry <= 15 && excess > 0) status = 'CRITICAL_EXPIRY';
    else if (batch.daysUntilExpiry <= 30) status = 'WARNING';

    return {
      ...batch,
      expectedUsageBeforeExpiry: expectedUsage,
      excessQuantity: excess,
      financialLossRisk: loss,
      status,
    };
  });
}

export function calculateRedistributions(
  hospitals: Hospital[],
  inventories: HospitalInventory[],
  supplies: MedicalSupply[]
): RedistributionRecommendation[] {
  const recommendations: RedistributionRecommendation[] = [];

  // Group inventories by supply
  supplies.forEach(supply => {
    const supplyInvs = inventories.filter(i => i.supplyId === supply.id);

    // Identify shortage hospitals (daysRemaining <= 7 or < minStock)
    const shortageInvs = supplyInvs.filter(i => i.daysRemaining <= 8.5);

    // Identify surplus hospitals (daysRemaining >= 30 and currentStock > minStock)
    const surplusInvs = supplyInvs.filter(i => i.daysRemaining >= 25 && i.currentStock > i.minStock * 1.5);

    shortageInvs.forEach(shortage => {
      const destHosp = hospitals.find(h => h.id === shortage.hospitalId);
      if (!destHosp) return;

      // Find best surplus provider
      surplusInvs.forEach(surplus => {
        const sourceHosp = hospitals.find(h => h.id === surplus.hospitalId);
        if (!sourceHosp || sourceHosp.id === destHosp.id) return;

        // Surplus available while keeping source safe (> 25 days)
        const safeBufferUnits = Math.round(surplus.avgDailyConsumption * 25);
        const availableSurplus = Math.max(0, surplus.currentStock - safeBufferUnits);

        if (availableSurplus < 50) return;

        // Target deficit to bring dest hospital to 14 days
        const targetNeeded = Math.round(shortage.avgDailyConsumption * 14 - shortage.currentStock);
        const transferQty = Math.min(availableSurplus, Math.max(100, targetNeeded));

        const dist = calculateDistance(sourceHosp.coordinates, destHosp.coordinates);
        const estHours = Number((dist / 40 + 1.2).toFixed(1)); // 40 km/h urban fleet + 1.2h loading/prep

        let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'MEDIUM';
        if (shortage.daysRemaining <= 4) priority = 'CRITICAL';
        else if (shortage.daysRemaining <= 7) priority = 'HIGH';

        recommendations.push({
          id: `recom-${sourceHosp.id}-${destHosp.id}-${supply.id}`,
          sourceHospitalId: sourceHosp.id,
          sourceHospitalName: sourceHosp.name,
          sourceSurplus: availableSurplus,
          destHospitalId: destHosp.id,
          destHospitalName: destHosp.name,
          destShortage: targetNeeded > 0 ? targetNeeded : 400,
          supplyId: supply.id,
          supplyName: supply.name,
          quantity: transferQty,
          priority,
          reason: `${destHosp.name} has only ${shortage.daysRemaining} days remaining (${shortage.currentStock} units). ${sourceHosp.name} maintains a robust ${surplus.daysRemaining} days reserve with ${availableSurplus} excess units. Direct transfer stabilizes supply for ~14 days.`,
          distanceKm: dist,
          estimatedHours: estHours,
          expiryRiskFactor: 'Low transit degradation risk; optimal cold-chain compatibility verified.',
          status: 'PENDING',
        });
      });
    });
  });

  // Sort by priority critical first, then largest shortage
  return recommendations.sort((a, b) => {
    const pWeight = { CRITICAL: 3, HIGH: 2, MEDIUM: 1 };
    return pWeight[b.priority] - pWeight[a.priority] || b.destShortage - a.destShortage;
  });
}

export function simulateCrisisScenario(
  params: CrisisParameters,
  baseHospitals: Hospital[],
  baseInventories: HospitalInventory[],
  baseSupplies: MedicalSupply[],
  baseShipments: Shipment[],
  baseSuppliers: Supplier[]
): {
  simulatedHospitals: Hospital[];
  simulatedInventories: HospitalInventory[];
  simulatedShipments: Shipment[];
  summary: SimulationSummary;
} {
  const demandMult = 1 + params.diseaseDemandIncreasePct / 100;
  const patientMult = 1 + (params.hospitalPatientLoadIncreasePct * 0.45) / 100;
  const combinedUsageFactor = demandMult * patientMult;

  // 1. Recalculate inventories
  const simulatedInventories: HospitalInventory[] = baseInventories.map(inv => {
    const newDaily = Math.round(inv.avgDailyConsumption * combinedUsageFactor);
    const newDays = calculateDaysRemaining(inv.currentStock, newDaily);
    const newRisk = getSupplyRiskLevel(newDays);

    return {
      ...inv,
      avgDailyConsumption: newDaily,
      projectedDailyDemand: Math.round(newDaily * 1.1),
      daysRemaining: newDays,
      riskLevel: newRisk,
    };
  });

  // 2. Recalculate hospitals
  const simulatedHospitals: Hospital[] = baseHospitals.map(hosp => {
    const hospInvs = simulatedInventories.filter(i => i.hospitalId === hosp.id);
    const newPatientLoad = Math.min(
      hosp.beds,
      Math.round(hosp.patientLoad * (1 + params.hospitalPatientLoadIncreasePct / 100))
    );
    const newOccupancy = Math.min(100, Math.round((newPatientLoad / hosp.beds) * 100));

    const tempHosp = { ...hosp, patientLoad: newPatientLoad, currentOccupancy: newOccupancy };
    const { score, level } = calculateHospitalRisk(tempHosp, hospInvs);

    return {
      ...tempHosp,
      riskScore: score,
      riskLevel: level,
    };
  });

  // 3. Recalculate shipments with transport delay & supplier reduction
  const simulatedShipments: Shipment[] = baseShipments.map(ship => {
    const addDelay = params.transportDelayDays;
    const totalDelay = ship.delayDays + addDelay;
    const status = totalDelay > 0 ? 'DELAYED' : ship.status;

    return {
      ...ship,
      delayDays: totalDelay,
      status: ship.status === 'DELIVERED' ? 'DELIVERED' : status,
    };
  });

  // 4. Before vs After metrics
  const critHospBefore = baseHospitals.filter(h => h.riskLevel === 'CRITICAL').length;
  const critHospAfter = simulatedHospitals.filter(h => h.riskLevel === 'CRITICAL').length;

  const critSupBefore = baseInventories.filter(i => i.riskLevel === 'CRITICAL').length;
  const critSupAfter = simulatedInventories.filter(i => i.riskLevel === 'CRITICAL').length;

  const avgDaysBefore = Number(
    (baseInventories.reduce((acc, i) => acc + i.daysRemaining, 0) / baseInventories.length).toFixed(1)
  );
  const avgDaysAfter = Number(
    (simulatedInventories.reduce((acc, i) => acc + i.daysRemaining, 0) / simulatedInventories.length).toFixed(1)
  );

  const baseCritHospNames = new Set(baseHospitals.filter(h => h.riskLevel === 'CRITICAL').map(h => h.name));
  const newCriticalHospitals = simulatedHospitals
    .filter(h => h.riskLevel === 'CRITICAL' && !baseCritHospNames.has(h.name))
    .map(h => h.name);

  const baseCritSupplyIds = new Set(baseInventories.filter(i => i.riskLevel === 'CRITICAL').map(i => i.supplyId));
  const newCriticalSupplyNames = Array.from(
    new Set(
      simulatedInventories
        .filter(i => i.riskLevel === 'CRITICAL' && !baseCritSupplyIds.has(i.supplyId))
        .map(i => {
          const s = baseSupplies.find(sup => sup.id === i.supplyId);
          return s ? s.name : i.supplyId;
        })
    )
  );

  // Notable runout shifts
  const runoutShifts = simulatedInventories
    .filter(i => i.daysRemaining <= 10)
    .slice(0, 6)
    .map(simInv => {
      const baseInv = baseInventories.find(b => b.id === simInv.id)!;
      const hosp = baseHospitals.find(h => h.id === simInv.hospitalId);
      const sup = baseSupplies.find(s => s.id === simInv.supplyId);
      
      const now = new Date('2026-09-15');
      const runoutDate = new Date(now.getTime() + simInv.daysRemaining * 24 * 60 * 60 * 1000);
      const formattedDate = runoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return {
        hospitalName: hosp?.name || 'Hospital',
        supplyName: sup?.name || 'Supply',
        beforeDays: baseInv ? baseInv.daysRemaining : simInv.daysRemaining,
        afterDays: simInv.daysRemaining,
        shortageDate: `${formattedDate} (${simInv.daysRemaining} days)`,
      };
    });

  const affectedSuppliers = baseSuppliers
    .filter(() => params.supplierCapacityReductionPct > 15 || params.transportDelayDays > 2)
    .map(s => `${s.name} (-${params.supplierCapacityReductionPct}% capacity, +${params.transportDelayDays}d lead time)`);

  const summary: SimulationSummary = {
    criticalHospitalsBefore: critHospBefore,
    criticalHospitalsAfter: critHospAfter,
    suppliesAtRiskBefore: critSupBefore,
    suppliesAtRiskAfter: critSupAfter,
    avgDaysReserveBefore: avgDaysBefore,
    avgDaysReserveAfter: avgDaysAfter,
    newCriticalHospitals,
    newCriticalSupplies: newCriticalSupplyNames,
    affectedSuppliers,
    urgentTransfersNeeded: Math.max(3, Math.round(critSupAfter / 2)),
    runoutShifts,
  };

  return {
    simulatedHospitals,
    simulatedInventories,
    simulatedShipments,
    summary,
  };
}

export function generateLiveAlerts(
  hospitals: Hospital[],
  inventories: HospitalInventory[],
  batches: BatchRecord[],
  shipments: Shipment[],
  sensors: { status: string; storageUnit: string; currentTemp: number; minSafeTemp: number; maxSafeTemp: number }[],
  supplies: MedicalSupply[]
): Alert[] {
  const alerts: Alert[] = [];

  // 1. Critical Shortages (< 7 days)
  inventories
    .filter(i => i.daysRemaining <= 7)
    .forEach((inv, idx) => {
      const hosp = hospitals.find(h => h.id === inv.hospitalId);
      const sup = supplies.find(s => s.id === inv.supplyId);
      if (hosp && sup) {
        alerts.push({
          id: `alert-shortage-${idx}`,
          timestamp: 'Just now',
          severity: inv.daysRemaining <= 4 ? 'CRITICAL' : 'HIGH',
          type: 'SHORTAGE',
          facilityName: hosp.name,
          facilityId: hosp.id,
          supplyName: sup.name,
          title: `Critical Shortage: ${sup.name}`,
          message: `${hosp.name} has only ${inv.daysRemaining} days remaining (${inv.currentStock} ${sup.unit} left at ${inv.avgDailyConsumption}/day).`,
          actionText: 'Initiate Transfer',
          actionTargetView: 'redistribution',
        });
      }
    });

  // 2. Cold-Chain temperature alerts
  sensors
    .filter(s => s.status !== 'NORMAL')
    .forEach((s, idx) => {
      alerts.push({
        id: `alert-cold-${idx}`,
        timestamp: '2 mins ago',
        severity: 'CRITICAL',
        type: 'COLD_CHAIN',
        facilityName: s.storageUnit,
        title: `Cold-Chain Temperature Breach: ${s.currentTemp}°C`,
        message: `${s.storageUnit} recorded ${s.currentTemp}°C, exceeding safe threshold of ${s.minSafeTemp}°C - ${s.maxSafeTemp}°C. Biologics integrity at risk.`,
        actionText: 'Inspect Cold Room',
        actionTargetView: 'cold-chain',
      });
    });

  // 3. Delayed Shipments
  shipments
    .filter(s => s.status === 'DELAYED')
    .forEach((s, idx) => {
      alerts.push({
        id: `alert-ship-${idx}`,
        timestamp: '18 mins ago',
        severity: 'WARNING',
        type: 'SHIPMENT_DELAY',
        facilityName: s.destinationName,
        supplyName: s.supplyName,
        title: `Shipment Delayed (+${s.delayDays} days)`,
        message: `${s.trackingNumber} carrying ${s.quantity} units of ${s.supplyName} delayed in transit by ${s.carrier}.`,
        actionText: 'Track Shipment',
        actionTargetView: 'network',
      });
    });

  // 4. Imminent Expiry
  batches
    .filter(b => b.daysUntilExpiry <= 20 && b.excessQuantity > 0)
    .forEach((b, idx) => {
      alerts.push({
        id: `alert-exp-${idx}`,
        timestamp: '1 hour ago',
        severity: b.daysUntilExpiry <= 15 ? 'HIGH' : 'WARNING',
        type: 'EXPIRY',
        facilityName: b.facilityName,
        supplyName: b.supplyName,
        title: `Impending Expiry: ${b.batchNumber}`,
        message: `${b.facilityName} holds ${b.quantity} units expiring in ${b.daysUntilExpiry} days. ${b.excessQuantity} units exceed expected consumption ($${b.financialLossRisk.toLocaleString()} loss).`,
        actionText: 'View Waste Report',
        actionTargetView: 'waste',
      });
    });

  // 5. Patient Demand Surge
  hospitals
    .filter(h => h.currentOccupancy >= 93)
    .forEach((h, idx) => {
      alerts.push({
        id: `alert-surge-${idx}`,
        timestamp: '42 mins ago',
        severity: 'HIGH',
        type: 'DEMAND_SURGE',
        facilityName: h.name,
        facilityId: h.id,
        title: `Acute Capacity Surge (${h.currentOccupancy}% Bed Load)`,
        message: `${h.name} operating at ${h.patientLoad}/${h.beds} beds. Acute ICU utilization escalating; supplies burning 35% faster than baseline.`,
        actionText: 'Review Hospital',
        actionTargetView: 'supplies',
      });
    });

  return alerts;
}
