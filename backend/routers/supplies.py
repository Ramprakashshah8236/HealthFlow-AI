"""
HealthFlow AI - Medical Supplies API Router
Endpoints:
  GET /api/supplies
  GET /api/supplies/{supply_id}
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Supply
from backend.schemas import SupplyResponse

router = APIRouter(prefix="/supplies", tags=["Medical Supplies"])


@router.get("", response_model=List[SupplyResponse])
def get_supplies(
    category: Optional[str] = Query(None, description="Filter by category (PPE, Critical Care, etc.)"),
    is_cold_chain: Optional[bool] = Query(None, description="Filter by cold-chain requirement"),
    db: Session = Depends(get_db),
):
    """Returns the catalog of 15 essential medical supply SKUs."""
    query = db.query(Supply)
    if category:
        query = query.filter(Supply.category == category)
    if is_cold_chain is not None:
        query = query.filter(Supply.is_cold_chain == is_cold_chain)
    return query.order_by(Supply.id.asc()).all()


@router.get("/{supply_id}", response_model=SupplyResponse)
def get_supply_by_id(supply_id: str, db: Session = Depends(get_db)):
    """Fetches specifications for a specific medical supply SKU."""
    supply = db.query(Supply).filter(Supply.id == supply_id).first()
    if not supply:
        raise HTTPException(status_code=404, detail=f"Supply SKU '{supply_id}' not found")
    return supply
