"""
HealthFlow AI - Hospitals & Depots API Router
Endpoints:
  GET /api/hospitals
  GET /api/hospitals/{hospital_id}
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Facility
from backend.schemas import FacilityResponse

router = APIRouter(prefix="/hospitals", tags=["Hospitals & Facilities"])


@router.get("", response_model=List[FacilityResponse])
def get_hospitals(
    facility_type: Optional[str] = Query(None, description="Filter by 'HOSPITAL' or 'CENTRAL_DEPOT'"),
    region: Optional[str] = Query(None, description="Filter by regional geographic cluster"),
    db: Session = Depends(get_db),
):
    """Returns all regional hospitals and central depot supply nodes."""
    query = db.query(Facility)
    if facility_type:
        query = query.filter(Facility.facility_type == facility_type.upper())
    if region:
        query = query.filter(Facility.region.ilike(f"%{region}%"))
    return query.order_by(Facility.facility_type.desc(), Facility.id.asc()).all()


@router.get("/{hospital_id}", response_model=FacilityResponse)
def get_hospital_by_id(hospital_id: str, db: Session = Depends(get_db)):
    """Fetches details for a specific hospital or central depot by ID."""
    facility = db.query(Facility).filter(Facility.id == hospital_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail=f"Facility '{hospital_id}' not found")
    return facility
