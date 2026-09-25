"""
HealthFlow AI - Pydantic Request & Response Schemas
Validates data interfaces and enforces operational payload formats using Pydantic v2 ConfigDict.
"""

from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


# Facility Schemas
class FacilityBase(BaseModel):
    id: str
    name: str
    facility_type: str
    region: str
    address: str
    latitude: float
    longitude: float
    bed_capacity: int
    icu_capacity: int
    contact_email: Optional[str] = None


class FacilityResponse(FacilityBase):
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# Supply Schemas
class SupplyBase(BaseModel):
    id: str
    name: str
    category: str
    unit: str
    unit_cost: float
    is_cold_chain: bool
    temp_min_celsius: Optional[float] = None
    temp_max_celsius: Optional[float] = None
    default_shelf_life_days: int


class SupplyResponse(SupplyBase):
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# Supplier Schemas
class SupplierBase(BaseModel):
    id: str
    name: str
    tier: str
    country: str
    lead_time_days: int
    reliability_score: float
    categories: str
    contact_phone: Optional[str] = None


class SupplierResponse(SupplierBase):
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# Nested simplified references for inventory response
class HospitalRef(BaseModel):
    id: str
    name: str
    region: str
    facility_type: str


class SupplyRef(BaseModel):
    id: str
    name: str
    category: str
    unit: str
    unit_cost: float
    is_cold_chain: bool


# Core Inventory Record with Dynamically Calculated Metrics
class InventoryRecordResponse(BaseModel):
    id: int
    hospital: HospitalRef
    supply: SupplyRef
    batch_lot_number: str
    current_stock: int
    minimum_buffer: int
    average_daily_consumption: float
    projected_demand: float
    days_remaining: float
    expiry_date: date
    risk_level: str  # 'CRITICAL' | 'HIGH' | 'WARNING' | 'STABLE'
    last_updated: Optional[datetime] = None


class InventoryStockUpdateRequest(BaseModel):
    current_stock: int = Field(..., ge=0, description="New stock quantity to update")
    minimum_buffer: Optional[int] = Field(None, ge=0)


# Historical Consumption Schemas
class ConsumptionLogResponse(BaseModel):
    id: int
    facility_id: str
    supply_id: str
    consumption_date: date
    quantity_consumed: int
    patient_admissions: int
    model_config = ConfigDict(from_attributes=True)


class ConsumptionAggregateResponse(BaseModel):
    facility_id: str
    facility_name: str
    supply_id: str
    supply_name: str
    lookback_days: int
    total_consumed: int
    average_daily_consumption: float


# Shipment Schemas
class ShipmentResponse(BaseModel):
    id: str
    source_id: str
    destination_id: str
    supply_id: str
    supply_name: Optional[str] = None
    quantity: int
    departure_date: date
    expected_delivery_date: date
    status: str
    carrier: str
    cold_chain_compliant: bool
    model_config = ConfigDict(from_attributes=True)
