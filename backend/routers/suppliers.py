"""
HealthFlow AI - Certified Suppliers API Router
Endpoints:
  GET /api/suppliers
  GET /api/suppliers/{supplier_id}
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Supplier
from backend.schemas import SupplierResponse

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("", response_model=List[SupplierResponse])
def get_suppliers(
    tier: Optional[str] = Query(None, description="Filter by TIER_1 or TIER_2"),
    country: Optional[str] = Query(None, description="Filter by country of origin"),
    db: Session = Depends(get_db),
):
    """Returns certified medical equipment and pharmaceutical suppliers."""
    query = db.query(Supplier)
    if tier:
        query = query.filter(Supplier.tier == tier.upper())
    if country:
        query = query.filter(Supplier.country.ilike(f"%{country}%"))
    return query.order_by(Supplier.reliability_score.desc()).all()


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier_by_id(supplier_id: str, db: Session = Depends(get_db)):
    """Fetches details and reliability ratings for a specific supplier."""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail=f"Supplier '{supplier_id}' not found")
    return supplier
