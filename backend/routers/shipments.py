"""
HealthFlow AI - Supply Shipments API Router
Endpoints:
  GET /api/shipments
  GET /api/shipments/{shipment_id}
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Shipment, Supply
from backend.schemas import ShipmentResponse

router = APIRouter(prefix="/shipments", tags=["Shipments & Logistics"])


@router.get("", response_model=List[ShipmentResponse])
def get_shipments(
    status: Optional[str] = Query(None, description="Filter: DELIVERED, IN_TRANSIT, SCHEDULED, DELAYED"),
    destination_id: Optional[str] = Query(None, description="Filter by destination facility ID"),
    supply_id: Optional[str] = Query(None, description="Filter by supply SKU"),
    db: Session = Depends(get_db),
):
    """Returns logistics shipment records tracking inter-facility and depot transfers."""
    query = db.query(Shipment, Supply.name.label("supply_name")).join(
        Supply, Shipment.supply_id == Supply.id
    )

    if status:
        query = query.filter(Shipment.status == status.upper())
    if destination_id:
        query = query.filter(Shipment.destination_id == destination_id)
    if supply_id:
        query = query.filter(Shipment.supply_id == supply_id)

    results = query.order_by(Shipment.expected_delivery_date.asc()).all()

    response = []
    for shp, sup_name in results:
        resp_item = ShipmentResponse(
            id=shp.id,
            source_id=shp.source_id,
            destination_id=shp.destination_id,
            supply_id=shp.supply_id,
            supply_name=sup_name,
            quantity=shp.quantity,
            departure_date=shp.departure_date,
            expected_delivery_date=shp.expected_delivery_date,
            status=shp.status,
            carrier=shp.carrier,
            cold_chain_compliant=shp.cold_chain_compliant,
        )
        response.append(resp_item)
    return response


@router.get("/{shipment_id}", response_model=ShipmentResponse)
def get_shipment_by_id(shipment_id: str, db: Session = Depends(get_db)):
    """Fetches details of a specific consignment shipment."""
    result = (
        db.query(Shipment, Supply.name.label("supply_name"))
        .join(Supply, Shipment.supply_id == Supply.id)
        .filter(Shipment.id == shipment_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail=f"Shipment '{shipment_id}' not found")
    shp, sup_name = result
    return ShipmentResponse(
        id=shp.id,
        source_id=shp.source_id,
        destination_id=shp.destination_id,
        supply_id=shp.supply_id,
        supply_name=sup_name,
        quantity=shp.quantity,
        departure_date=shp.departure_date,
        expected_delivery_date=shp.expected_delivery_date,
        status=shp.status,
        carrier=shp.carrier,
        cold_chain_compliant=shp.cold_chain_compliant,
    )
