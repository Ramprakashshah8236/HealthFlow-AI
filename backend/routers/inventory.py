"""
HealthFlow AI - Inventory & Resilience Intelligence API Router
Endpoints:
  GET /api/inventory
  GET /api/inventory/{facility_id}/{supply_id}
  PUT /api/inventory/{facility_id}/{supply_id}
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Inventory, Facility, Supply
from backend.schemas import InventoryRecordResponse, InventoryStockUpdateRequest
from backend.services.inventory_service import (
    get_dynamic_inventory_records,
    calculate_average_daily_consumption,
    determine_operational_risk,
)

router = APIRouter(prefix="/inventory", tags=["Inventory & Intelligence"])


@router.get("", response_model=List[InventoryRecordResponse])
def get_inventory(
    facility_id: Optional[str] = Query(None, description="Filter by facility ID (e.g., HOSP-01, DEPOT-01)"),
    supply_id: Optional[str] = Query(None, description="Filter by medical supply SKU (e.g., SKU-04)"),
    category: Optional[str] = Query(None, description="Filter by supply category (PPE, Critical Care, etc.)"),
    risk_level: Optional[str] = Query(None, description="Filter by risk tier: CRITICAL, HIGH, WARNING, STABLE"),
    lookback_days: int = Query(30, ge=7, le=180, description="Consumption lookback window in days"),
    db: Session = Depends(get_db),
):
    """
    Returns inventory records with real-time, non-hardcoded calculations:
    - days_remaining = current_stock / average_daily_consumption
    - average_daily_consumption derived from 6 months of actual consumption logs
    - projected_demand = average_daily_consumption * 30
    - risk_level categorized dynamically as CRITICAL, HIGH, WARNING, or STABLE
    """
    return get_dynamic_inventory_records(
        db=db,
        facility_id=facility_id,
        supply_id=supply_id,
        category=category,
        risk_level=risk_level,
        lookback_days=lookback_days,
    )


@router.get("/{facility_id}/{supply_id}", response_model=InventoryRecordResponse)
def get_inventory_node(
    facility_id: str,
    supply_id: str,
    lookback_days: int = Query(30, ge=7, le=180),
    db: Session = Depends(get_db),
):
    """Retrieves a single inventory node with live calculated metrics."""
    records = get_dynamic_inventory_records(
        db=db,
        facility_id=facility_id,
        supply_id=supply_id,
        lookback_days=lookback_days,
    )
    if not records:
        raise HTTPException(
            status_code=404,
            detail=f"Inventory record for facility '{facility_id}' and supply '{supply_id}' not found",
        )
    return records[0]


@router.put("/{facility_id}/{supply_id}", response_model=InventoryRecordResponse)
def update_inventory_stock(
    facility_id: str,
    supply_id: str,
    payload: InventoryStockUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    Updates stock levels for an inventory node.
    Immediately triggers dynamic recalculation of days_remaining and risk_level.
    """
    inv = (
        db.query(Inventory)
        .filter(
            Inventory.facility_id == facility_id,
            Inventory.supply_id == supply_id,
        )
        .first()
    )

    if not inv:
        raise HTTPException(
            status_code=404,
            detail=f"Inventory record for facility '{facility_id}' and supply '{supply_id}' not found",
        )

    inv.current_stock = payload.current_stock
    if payload.minimum_buffer is not None:
        inv.minimum_buffer = payload.minimum_buffer

    db.commit()
    db.refresh(inv)

    # Return refreshed dynamic record
    records = get_dynamic_inventory_records(
        db=db,
        facility_id=facility_id,
        supply_id=supply_id,
    )
    return records[0]
