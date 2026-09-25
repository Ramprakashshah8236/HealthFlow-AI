# HealthFlow AI — REST API Reference

Interactive Swagger documentation is available at `/docs` on the FastAPI server.

## Endpoints

### 1. Hospitals & Depots
- `GET /api/hospitals`
  - Parameters: `facility_type` (`HOSPITAL` | `CENTRAL_DEPOT`), `region` (string)
  - Returns: Array of all 10 hospitals and 3 central depots.
- `GET /api/hospitals/{hospital_id}`
  - Returns: Detailed facility record.

### 2. Medical Supplies Catalog
- `GET /api/supplies`
  - Parameters: `category` (string), `is_cold_chain` (bool)
  - Returns: 15 clinical SKUs with unit costs, specifications, and shelf-life.
- `GET /api/supplies/{supply_id}`
  - Returns: Details for SKU.

### 3. Inventory & Dynamic Resilience Intelligence
- `GET /api/inventory`
  - Parameters:
    - `facility_id` (string): e.g. `HOSP-01`
    - `supply_id` (string): e.g. `SKU-04`
    - `category` (string): e.g. `Critical Care`
    - `risk_level` (string): `CRITICAL`, `HIGH`, `WARNING`, `STABLE`
    - `lookback_days` (int): default `30`
  - Returns: Array of inventory nodes with dynamically calculated metrics:
    - `hospital`: Facility reference object
    - `supply`: Supply SKU reference object
    - `current_stock`: Physical on-hand count
    - `minimum_buffer`: Safety buffer requirement
    - `average_daily_consumption`: Dynamically computed from database logs
    - `projected_demand`: Projected 30-day requirement
    - `days_remaining`: `current_stock / average_daily_consumption` (non-hardcoded)
    - `expiry_date`: Lot expiration date
    - `risk_level`: `CRITICAL` | `HIGH` | `WARNING` | `STABLE`
- `GET /api/inventory/{facility_id}/{supply_id}`
  - Returns: Specific inventory node metrics.
- `PUT /api/inventory/{facility_id}/{supply_id}`
  - Body: `{"current_stock": int, "minimum_buffer": Optional[int]}`
  - Modifies database record and returns freshly recalculated dynamic metrics.

### 4. Historical Consumption Time-Series
- `GET /api/consumption`
  - Parameters: `facility_id`, `supply_id`, `start_date`, `end_date`, `limit`, `offset`
  - Returns: Daily consumption records.
- `GET /api/consumption/summary`
  - Parameters: `facility_id`, `supply_id`, `lookback_days`
  - Returns: Aggregated total consumption and daily burn rates.

### 5. Certified Suppliers
- `GET /api/suppliers`
  - Parameters: `tier`, `country`
  - Returns: 8 certified suppliers with lead times and reliability ratings.

### 6. Shipments & Logistics
- `GET /api/shipments`
  - Parameters: `status`, `destination_id`, `supply_id`
  - Returns: Inbound and inter-facility shipment legs.
