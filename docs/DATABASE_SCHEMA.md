# HealthFlow AI — Relational Database Schema

Engine: **PostgreSQL** (with **SQLite** fallback for zero-dependency local testing).

## Table Summaries

### 1. `facilities`
Stores regional healthcare delivery nodes.
- `id` (VARCHAR(50), PK): Unique facility ID (`HOSP-01` to `HOSP-10`, `DEPOT-01` to `DEPOT-03`)
- `name` (VARCHAR(255)): Official facility name
- `facility_type` (VARCHAR(50)): `HOSPITAL` or `CENTRAL_DEPOT`
- `region` (VARCHAR(100)): Regional geographic cluster
- `address` (VARCHAR(255)): Street address
- `latitude` (FLOAT): Geographic coordinate
- `longitude` (FLOAT): Geographic coordinate
- `bed_capacity` (INTEGER): Total licensed beds
- `icu_capacity` (INTEGER): Intensive care unit beds
- `contact_email` (VARCHAR(255)): Contact liaison email

### 2. `supplies`
Catalog of essential medical supplies and therapeutics.
- `id` (VARCHAR(50), PK): SKU ID (`SKU-01` to `SKU-15`)
- `name` (VARCHAR(255)): Descriptive clinical name
- `category` (VARCHAR(100)): `PPE`, `Critical Care`, `Pharmaceuticals`, `Diagnostics`, `Surgical`
- `unit` (VARCHAR(50)): Dispensing package unit (e.g. `Boxes (20/bx)`, `Cases (12/cs)`)
- `unit_cost` (FLOAT): Standard procurement cost (USD)
- `is_cold_chain` (BOOLEAN): Requires temperature regulation
- `temp_min_celsius` (FLOAT): Minimum storage temperature
- `temp_max_celsius` (FLOAT): Maximum storage temperature
- `default_shelf_life_days` (INTEGER): Baseline manufacturer shelf life

### 3. `suppliers`
Certified medical device and pharmaceutical manufacturing vendors.
- `id` (VARCHAR(50), PK): Supplier code (`SUP-01` to `SUP-08`)
- `name` (VARCHAR(255)): Corporate name
- `tier` (VARCHAR(50)): `TIER_1` or `TIER_2`
- `country` (VARCHAR(100)): Jurisdiction of origin
- `lead_time_days` (INTEGER): Standard procurement turnaround
- `reliability_score` (FLOAT): On-time fulfilment index (0.0 to 1.0)
- `categories` (VARCHAR(255)): Certified supply categories

### 4. `inventory`
Facility-level stock holdings with batch traceability.
- `id` (SERIAL, PK): Auto-incrementing identifier
- `facility_id` (VARCHAR(50), FK -> `facilities.id`): Associated facility
- `supply_id` (VARCHAR(50), FK -> `supplies.id`): Associated supply SKU
- `batch_lot_number` (VARCHAR(100)): Batch traceability code
- `current_stock` (INTEGER): On-hand physical units
- `minimum_buffer` (INTEGER): Mandatory minimum clinical safety reserve
- `expiry_date` (DATE): Lot expiration date
- `last_updated` (TIMESTAMP): Last inventory count timestamp

### 5. `consumption_logs`
Historical time-series recording daily hospital burn rates.
- `id` (SERIAL, PK): Primary key
- `facility_id` (VARCHAR(50), FK -> `facilities.id`)
- `supply_id` (VARCHAR(50), FK -> `supplies.id`)
- `consumption_date` (DATE): Record date
- `quantity_consumed` (INTEGER): Units expended in patient care
- `patient_admissions` (INTEGER): Daily patient admissions

### 6. `shipments`
Active logistics consignment legs and transfers.
- `id` (VARCHAR(50), PK): Shipment manifest number (`SHP-101`...)
- `source_id` (VARCHAR(50)): Source facility or supplier ID
- `destination_id` (VARCHAR(50), FK -> `facilities.id`): Receiving facility ID
- `supply_id` (VARCHAR(50), FK -> `supplies.id`): SKU payload
- `quantity` (INTEGER): Units in consignment
- `departure_date` (DATE): In-transit departure timestamp
- `expected_delivery_date` (DATE): ETA delivery date
- `status` (VARCHAR(50)): `DELIVERED`, `IN_TRANSIT`, `SCHEDULED`, `DELAYED`
- `carrier` (VARCHAR(100)): Contracted logistics carrier
- `cold_chain_compliant` (BOOLEAN): Active temperature compliance
