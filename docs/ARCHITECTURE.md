# HealthFlow AI — System Architecture

HealthFlow AI is an AI-powered healthcare supply resilience intelligence platform designed to monitor multi-facility inventories, predict clinical shortages, mitigate expiry waste, and orchestrate mutual-aid inventory redistributions.

## High-Level Topology

```
+-------------------------------------------------------------------------+
|                        Frontend (React / Vite)                          |
|  - Real-time Hospital Risk Grid & Telemetry                             |
|  - Supply Intelligence View & Filters                                   |
|  - Shortage Prediction Trajectory Visualizers                           |
|  - Expiry & Waste Auditing                                              |
|  - Mutual-Aid Redistribution Matrix                                     |
+------------------------------------+------------------------------------+
                                     | HTTP / REST
+------------------------------------+------------------------------------+
|                       Backend (FastAPI / Python)                        |
|  - /api/hospitals     : Hospital & Depot registry                       |
|  - /api/supplies      : 15 Essential SKU catalog                        |
|  - /api/inventory     : Live dynamic days_remaining & risk tiering      |
|  - /api/consumption   : 6-month historical daily time-series            |
|  - /api/suppliers     : Certified medical suppliers                     |
|  - /api/shipments     : Active transit & depot transfer logs            |
+------------------------------------+------------------------------------+
                                     | SQLAlchemy ORM
+------------------------------------+------------------------------------+
|                  Database Layer (PostgreSQL / SQLite)                   |
|  - facilities         : 10 Regional Hospitals + 3 Strategic Depots      |
|  - supplies           : 15 Medical Supply SKUs                          |
|  - suppliers          : 8 Certified Manufacturers                       |
|  - inventory          : 195 Active Facility-SKU Inventory Nodes         |
|  - consumption_logs   : 35,100 Daily Consumption Time-Series Records    |
|  - shipments          : 45 Active & Delivered Consignment Legs          |
+-------------------------------------------------------------------------+
```

## Mathematical Formula Engine

### 1. Dynamic Average Daily Consumption
$$\text{average\_daily\_consumption} = \frac{\sum_{t=1}^{N} \text{quantity\_consumed}_t}{N}$$
Where $N = 30$ days lookback calculated dynamically from actual historical records.

### 2. Dynamic Days Remaining
$$\text{days\_remaining} = \frac{\text{current\_stock}}{\text{average\_daily\_consumption}}$$
*Note: This calculation is strictly non-hardcoded and re-evaluates upon every database state change or inventory update.*

### 3. Operational Risk Tiers
- **CRITICAL**: $\text{days\_remaining} \le 5.0$ OR $\text{current\_stock} = 0$
- **HIGH**: $5.0 < \text{days\_remaining} \le 12.0$ OR $\text{current\_stock} < \text{minimum\_buffer}$
- **WARNING**: $12.0 < \text{days\_remaining} \le 21.0$
- **STABLE**: $\text{days\_remaining} > 21.0$ AND $\text{current\_stock} \ge \text{minimum\_buffer}$
