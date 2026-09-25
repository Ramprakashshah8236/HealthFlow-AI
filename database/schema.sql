-- HealthFlow AI — PostgreSQL Database Schema
-- Version: 1.0.0
-- Architecture: Clinical Logistics & Supply Chain Decision Support

-- 1. Facilities (10 Hospitals & 3 Central Depots)
CREATE TABLE IF NOT EXISTS facilities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(50) NOT NULL CHECK (facility_type IN ('HOSPITAL', 'CENTRAL_DEPOT')),
    region VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    bed_capacity INTEGER NOT NULL DEFAULT 0,
    icu_capacity INTEGER NOT NULL DEFAULT 0,
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Medical Supply SKUs (15 Essential Medical Supplies)
CREATE TABLE IF NOT EXISTS supplies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_cost DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_cold_chain BOOLEAN NOT NULL DEFAULT FALSE,
    temp_min_celsius DOUBLE PRECISION,
    temp_max_celsius DOUBLE PRECISION,
    default_shelf_life_days INTEGER NOT NULL DEFAULT 365,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Certified Medical Suppliers (8 Suppliers)
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'TIER_1',
    country VARCHAR(100) NOT NULL,
    lead_time_days INTEGER NOT NULL DEFAULT 3,
    reliability_score DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    categories VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inventory Records (Facility x Supply Node)
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    facility_id VARCHAR(50) NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    supply_id VARCHAR(50) NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    batch_lot_number VARCHAR(100) NOT NULL,
    current_stock INTEGER NOT NULL CHECK (current_stock >= 0),
    minimum_buffer INTEGER NOT NULL CHECK (minimum_buffer >= 0),
    expiry_date DATE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_facility_supply UNIQUE (facility_id, supply_id)
);

-- 5. Historical Daily Consumption Logs (6 Months of Time-Series)
CREATE TABLE IF NOT EXISTS consumption_logs (
    id SERIAL PRIMARY KEY,
    facility_id VARCHAR(50) NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    supply_id VARCHAR(50) NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    consumption_date DATE NOT NULL,
    quantity_consumed INTEGER NOT NULL CHECK (quantity_consumed >= 0),
    patient_admissions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_facility_supply_date UNIQUE (facility_id, supply_id, consumption_date)
);

-- 6. Inbound & Inter-Facility Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(50) PRIMARY KEY,
    source_id VARCHAR(50) NOT NULL,
    destination_id VARCHAR(50) NOT NULL,
    supply_id VARCHAR(50) NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    departure_date DATE NOT NULL,
    expected_delivery_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('DELIVERED', 'IN_TRANSIT', 'SCHEDULED', 'DELAYED')),
    carrier VARCHAR(100) NOT NULL,
    cold_chain_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_inventory_facility ON inventory(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_supply ON inventory(supply_id);
CREATE INDEX IF NOT EXISTS idx_consumption_facility_supply ON consumption_logs(facility_id, supply_id);
CREATE INDEX IF NOT EXISTS idx_consumption_date ON consumption_logs(consumption_date);
CREATE INDEX IF NOT EXISTS idx_shipments_destination ON shipments(destination_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
