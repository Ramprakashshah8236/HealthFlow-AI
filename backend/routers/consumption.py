"""
HealthFlow AI - Historical Daily Consumption API Router
Endpoints:
  GET /api/consumption
  GET /api/consumption/summary
  GET /api/consumption/{facility_id}/{supply_id}
"""

from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import ConsumptionLog, Facility, Supply
from backend.schemas import ConsumptionLogResponse, ConsumptionAggregateResponse
from backend.services.inventory_service import calculate_average_daily_consumption

router = APIRouter(prefix="/consumption", tags=["Historical Consumption"])


@router.get("", response_model=List[ConsumptionLogResponse])
def get_consumption_logs(
    facility_id: Optional[str] = Query(None, description="Filter by facility ID"),
    supply_id: Optional[str] = Query(None, description="Filter by medical supply SKU"),
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Returns 6-month daily consumption logs with filtering and pagination."""
    query = db.query(ConsumptionLog)
    if facility_id:
        query = query.filter(ConsumptionLog.facility_id == facility_id)
    if supply_id:
        query = query.filter(ConsumptionLog.supply_id == supply_id)
    if start_date:
        query = query.filter(ConsumptionLog.consumption_date >= start_date)
    if end_date:
        query = query.filter(ConsumptionLog.consumption_date <= end_date)

    return (
        query.order_by(ConsumptionLog.consumption_date.desc(), ConsumptionLog.id.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/summary", response_model=List[ConsumptionAggregateResponse])
def get_consumption_summary(
    facility_id: Optional[str] = Query(None),
    supply_id: Optional[str] = Query(None),
    lookback_days: int = Query(30, ge=7, le=180),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated consumption analytics per facility and supply,
    including total consumed and dynamically calculated average daily burn rate.
    """
    query = (
        db.query(
            ConsumptionLog.facility_id,
            Facility.name.label("facility_name"),
            ConsumptionLog.supply_id,
            Supply.name.label("supply_name"),
            func.sum(ConsumptionLog.quantity_consumed).label("total_consumed"),
            func.count(ConsumptionLog.id).label("records_count"),
        )
        .join(Facility, ConsumptionLog.facility_id == Facility.id)
        .join(Supply, ConsumptionLog.supply_id == Supply.id)
    )

    if facility_id:
        query = query.filter(ConsumptionLog.facility_id == facility_id)
    if supply_id:
        query = query.filter(ConsumptionLog.supply_id == supply_id)

    results = (
        query.group_by(
            ConsumptionLog.facility_id,
            Facility.name,
            ConsumptionLog.supply_id,
            Supply.name,
        )
        .all()
    )

    aggregates = []
    for r in results:
        avg_rate = round(float(r.total_consumed) / max(1, r.records_count), 2)
        aggregates.append(
            ConsumptionAggregateResponse(
                facility_id=r.facility_id,
                facility_name=r.facility_name,
                supply_id=r.supply_id,
                supply_name=r.supply_name,
                lookback_days=r.records_count,
                total_consumed=r.total_consumed,
                average_daily_consumption=avg_rate,
            )
        )
    return aggregates
