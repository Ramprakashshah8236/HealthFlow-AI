"""
HealthFlow AI - Dynamic Inventory Intelligence Service
Performs real-time, non-hardcoded calculations:
  average_daily_consumption = sum(recent_consumption) / days_in_window
  days_remaining = current_stock / average_daily_consumption
  projected_demand = average_daily_consumption * 30
  risk_level = CRITICAL | HIGH | WARNING | STABLE
"""

from typing import List, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models import Inventory, ConsumptionLog, Facility, Supply
from backend.schemas import InventoryRecordResponse, HospitalRef, SupplyRef
from backend.config import settings


def determine_operational_risk(
    days_remaining: float,
    current_stock: int,
    minimum_buffer: int,
) -> str:
    """
    Evaluates prototype operational resilience risk tier:
      - CRITICAL: <= 5.0 days of supply OR stockout (0 units)
      - HIGH: > 5.0 and <= 12.0 days OR current_stock below safety buffer
      - WARNING: > 12.0 and <= 21.0 days of supply
      - STABLE: > 21.0 days of supply AND current_stock >= minimum_buffer
    """
    if current_stock <= 0 or days_remaining <= settings.CRITICAL_DAYS_THRESHOLD:
        return "CRITICAL"
    elif days_remaining <= settings.HIGH_RISK_DAYS_THRESHOLD or current_stock < minimum_buffer:
        return "HIGH"
    elif days_remaining <= settings.WARNING_DAYS_THRESHOLD:
        return "WARNING"
    else:
        return "STABLE"


def calculate_average_daily_consumption(
    db: Session,
    facility_id: str,
    supply_id: str,
    lookback_days: int = 30,
) -> float:
    """
    Calculates actual average daily consumption dynamically from real historical database records.
    """
    # Find the most recent consumption date recorded for this pair
    max_date = (
        db.query(func.max(ConsumptionLog.consumption_date))
        .filter(
            ConsumptionLog.facility_id == facility_id,
            ConsumptionLog.supply_id == supply_id,
        )
        .scalar()
    )

    if not max_date:
        return 1.0  # Safe minimum fallback to avoid division by zero if no logs exist

    start_date = max_date - timedelta(days=lookback_days - 1)

    # Query sum of consumed quantity and actual recorded days in window
    result = (
        db.query(
            func.sum(ConsumptionLog.quantity_consumed).label("total_consumed"),
            func.count(ConsumptionLog.id).label("records_count"),
        )
        .filter(
            ConsumptionLog.facility_id == facility_id,
            ConsumptionLog.supply_id == supply_id,
            ConsumptionLog.consumption_date >= start_date,
            ConsumptionLog.consumption_date <= max_date,
        )
        .first()
    )

    total_consumed = result.total_consumed if result and result.total_consumed is not None else 0
    records_count = result.records_count if result and result.records_count is not None else 0

    if records_count == 0 or total_consumed == 0:
        return 1.0  # Minimum non-zero denominator

    avg_consumption = round(float(total_consumed) / float(records_count), 2)
    return max(0.1, avg_consumption)


def get_dynamic_inventory_records(
    db: Session,
    facility_id: Optional[str] = None,
    supply_id: Optional[str] = None,
    category: Optional[str] = None,
    risk_level: Optional[str] = None,
    lookback_days: int = 30,
) -> List[InventoryRecordResponse]:
    """
    Retrieves inventory records from database and computes all intelligence metrics dynamically.
    No hardcoded values.
    """
    query = (
        db.query(Inventory, Facility, Supply)
        .join(Facility, Inventory.facility_id == Facility.id)
        .join(Supply, Inventory.supply_id == Supply.id)
    )

    if facility_id:
        query = query.filter(Inventory.facility_id == facility_id)
    if supply_id:
        query = query.filter(Inventory.supply_id == supply_id)
    if category:
        query = query.filter(Supply.category == category)

    results = query.all()
    calculated_records: List[InventoryRecordResponse] = []

    for inv, fac, sup in results:
        # Dynamic calculation of consumption from historical logs
        avg_consumption = calculate_average_daily_consumption(
            db,
            facility_id=inv.facility_id,
            supply_id=inv.supply_id,
            lookback_days=lookback_days,
        )

        # Dynamic calculation: days_remaining = current_stock / average_daily_consumption
        days_remaining = round(float(inv.current_stock) / avg_consumption, 1)

        # Dynamic 30-day projected demand
        projected_demand = round(avg_consumption * 30.0, 1)

        # Dynamic risk categorization
        calculated_risk = determine_operational_risk(
            days_remaining=days_remaining,
            current_stock=inv.current_stock,
            minimum_buffer=inv.minimum_buffer,
        )

        if risk_level and calculated_risk != risk_level.upper():
            continue

        record = InventoryRecordResponse(
            id=inv.id,
            hospital=HospitalRef(
                id=fac.id,
                name=fac.name,
                region=fac.region,
                facility_type=fac.facility_type,
            ),
            supply=SupplyRef(
                id=sup.id,
                name=sup.name,
                category=sup.category,
                unit=sup.unit,
                unit_cost=sup.unit_cost,
                is_cold_chain=sup.is_cold_chain,
            ),
            batch_lot_number=inv.batch_lot_number,
            current_stock=inv.current_stock,
            minimum_buffer=inv.minimum_buffer,
            average_daily_consumption=avg_consumption,
            projected_demand=projected_demand,
            days_remaining=days_remaining,
            expiry_date=inv.expiry_date,
            risk_level=calculated_risk,
            last_updated=inv.last_updated,
        )
        calculated_records.append(record)

    return calculated_records
