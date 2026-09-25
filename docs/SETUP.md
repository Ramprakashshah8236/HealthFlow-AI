# HealthFlow AI — Setup & Deployment Guide

## Prerequisites
- Python 3.10+
- PostgreSQL 14+ (or built-in SQLite for zero-setup execution)
- Node.js 18+ and npm

---

## 1. Database Setup (PostgreSQL)

### A. Create PostgreSQL Database & User
```bash
# In PostgreSQL terminal (psql)
CREATE USER healthflow_user WITH PASSWORD 'healthflow_password';
CREATE DATABASE healthflow_db OWNER healthflow_user;
GRANT ALL PRIVILEGES ON DATABASE healthflow_db TO healthflow_user;
```

### B. Run Schema DDL Script
```bash
psql -U healthflow_user -d healthflow_db -f database/schema.sql
```

### C. Set Environment Variable
```bash
export DATABASE_URL="postgresql+psycopg2://healthflow_user:healthflow_password@localhost:5432/healthflow_db"
```

*(If DATABASE_URL is not set, the system automatically uses SQLite at `data/healthflow.db`)*

---

## 2. Synthetic Dataset Generation & Database Seeding

### Generate Synthetic Records
```bash
python3 data/synthetic_generator.py
```
This produces:
- 13 Facilities (10 Hospitals, 3 Depots)
- 8 Certified Suppliers
- 15 Medical Supply SKUs
- 195 Inventory Nodes with Lot Numbers & Expiry Dates
- 35,100 Daily Historical Consumption Records (6 months time-series)
- 45 Logistics Shipments

### Seed Relational Database
```bash
python3 database/init_db.py
```

---

## 3. Backend Setup (FastAPI)

### Install Python Dependencies
```bash
pip install fastapi uvicorn sqlalchemy pydantic pandas numpy scikit-learn psycopg2-binary httpx pytest
```

### Run Automated Tests
```bash
PYTHONPATH=. pytest backend/tests/test_inventory_calculations.py -v
```

### Launch FastAPI Server
```bash
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API is accessible at `http://localhost:8000/api`
Interactive Swagger Documentation at `http://localhost:8000/docs`

---

## 4. Frontend-to-Backend Connection Instructions

### Connecting Vite to FastAPI

In `vite.config.ts`, add a proxy rule pointing to the FastAPI backend:
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### Fetching Dynamic Inventory from React
In React components or services:
```typescript
export async function fetchLiveInventory() {
  const response = await fetch('/api/inventory');
  if (!response.ok) throw new Error('Failed to fetch inventory intelligence');
  return await response.json();
}
```

The response includes live dynamic `days_remaining` calculated by FastAPI from the database time-series.
