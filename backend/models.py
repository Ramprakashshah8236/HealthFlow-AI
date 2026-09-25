"""
HealthFlow AI - SQLAlchemy ORM Models
Defines tables: facilities, supplies, suppliers, inventory, consumption_logs, shipments.
"""

from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import relationship
from backend.database import Base


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    facility_type = Column(String(50), nullable=False)  # 'HOSPITAL' | 'CENTRAL_DEPOT'
    region = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    bed_capacity = Column(Integer, default=0, nullable=False)
    icu_capacity = Column(Integer, default=0, nullable=False)
    contact_email = Column(String(255))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    # Relationships
    inventories = relationship("Inventory", back_populates="facility", cascade="all, delete-orphan")
    consumption_logs = relationship("ConsumptionLog", back_populates="facility", cascade="all, delete-orphan")


class Supply(Base):
    __tablename__ = "supplies"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    unit = Column(String(50), nullable=False)
    unit_cost = Column(Float, default=0.0, nullable=False)
    is_cold_chain = Column(Boolean, default=False, nullable=False)
    temp_min_celsius = Column(Float, nullable=True)
    temp_max_celsius = Column(Float, nullable=True)
    default_shelf_life_days = Column(Integer, default=365, nullable=False)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    # Relationships
    inventories = relationship("Inventory", back_populates="supply", cascade="all, delete-orphan")
    consumption_logs = relationship("ConsumptionLog", back_populates="supply", cascade="all, delete-orphan")
    shipments = relationship("Shipment", back_populates="supply", cascade="all, delete-orphan")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    tier = Column(String(50), default="TIER_1", nullable=False)
    country = Column(String(100), nullable=False)
    lead_time_days = Column(Integer, default=3, nullable=False)
    reliability_score = Column(Float, default=0.95, nullable=False)
    categories = Column(String(255), nullable=False)
    contact_phone = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    facility_id = Column(String(50), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    supply_id = Column(String(50), ForeignKey("supplies.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_lot_number = Column(String(100), nullable=False)
    current_stock = Column(Integer, nullable=False)
    minimum_buffer = Column(Integer, nullable=False)
    expiry_date = Column(Date, nullable=False)
    last_updated = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    __table_args__ = (
        UniqueConstraint("facility_id", "supply_id", name="uq_facility_supply"),
    )

    # Relationships
    facility = relationship("Facility", back_populates="inventories")
    supply = relationship("Supply", back_populates="inventories")


class ConsumptionLog(Base):
    __tablename__ = "consumption_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    facility_id = Column(String(50), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    supply_id = Column(String(50), ForeignKey("supplies.id", ondelete="CASCADE"), nullable=False, index=True)
    consumption_date = Column(Date, nullable=False, index=True)
    quantity_consumed = Column(Integer, nullable=False)
    patient_admissions = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    __table_args__ = (
        UniqueConstraint("facility_id", "supply_id", "consumption_date", name="uq_facility_supply_date"),
    )

    # Relationships
    facility = relationship("Facility", back_populates="consumption_logs")
    supply = relationship("Supply", back_populates="consumption_logs")


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(String(50), primary_key=True, index=True)
    source_id = Column(String(50), nullable=False)
    destination_id = Column(String(50), nullable=False, index=True)
    supply_id = Column(String(50), ForeignKey("supplies.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    departure_date = Column(Date, nullable=False)
    expected_delivery_date = Column(Date, nullable=False)
    status = Column(String(50), nullable=False, index=True)  # 'DELIVERED' | 'IN_TRANSIT' | 'SCHEDULED' | 'DELAYED'
    carrier = Column(String(100), nullable=False)
    cold_chain_compliant = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    supply = relationship("Supply", back_populates="shipments")
