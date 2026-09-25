"""
HealthFlow AI - Dynamic Inventory & Mathematical Fidelity Tests
Validates:
1. `days_remaining = current_stock / average_daily_consumption` is calculated dynamically (not hardcoded).
2. Risk categorization adheres strictly to operational logic (CRITICAL, HIGH, WARNING, STABLE).
3. Modifying inventory stock dynamically recalculates days_remaining and changes risk status.
4. All required API endpoints return expected schemas and statuses.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal
from backend.models import Inventory, ConsumptionLog

client = TestClient(app)


def test_health_endpoint():
    """Verify backend health check."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "HealthFlow AI Backend" in data["service"]


def test_hospitals_endpoint():
    """Verify hospitals API returns 10 hospitals and 3 depots."""
    response = client.get("/api/hospitals")
    assert response.status_code == 200
    facilities = response.json()
    assert len(facilities) == 13
    hospitals = [f for f in facilities if f["facility_type"] == "HOSPITAL"]
    depots = [f for f in facilities if f["facility_type"] == "CENTRAL_DEPOT"]
    assert len(hospitals) == 10
    assert len(depots) == 3


def test_supplies_endpoint():
    """Verify supplies API returns the 15 essential SKUs."""
    response = client.get("/api/supplies")
    assert response.status_code == 200
    supplies = response.json()
    assert len(supplies) == 15
    sku_ids = [s["id"] for s in supplies]
    assert "SKU-01" in sku_ids  # N95 Masks
    assert "SKU-04" in sku_ids  # Sterile Saline
    assert "SKU-15" in sku_ids  # mRNA Vaccine


def test_inventory_endpoint_structure_and_dynamic_calculation():
    """
    CRITICAL TEST:
    Proves that days_remaining is calculated dynamically using:
    days_remaining = current_stock / average_daily_consumption
    and that all required response fields exist.
    """
    response = client.get("/api/inventory")
    assert response.status_code == 200
    inventory_items = response.json()
    assert len(inventory_items) > 0

    valid_risk_tiers = {"CRITICAL", "HIGH", "WARNING", "STABLE"}

    for item in inventory_items:
        # 1. Verify all required fields from specification exist
        assert "hospital" in item
        assert "supply" in item
        assert "current_stock" in item
        assert "minimum_buffer" in item
        assert "average_daily_consumption" in item
        assert "projected_demand" in item
        assert "days_remaining" in item
        assert "expiry_date" in item
        assert "risk_level" in item

        # 2. Verify operational risk category
        assert item["risk_level"] in valid_risk_tiers

        # 3. Dynamic Calculation Verification:
        # days_remaining = current_stock / average_daily_consumption
        current_stock = item["current_stock"]
        avg_consumption = item["average_daily_consumption"]
        expected_days = round(float(current_stock) / avg_consumption, 1)

        assert item["days_remaining"] == expected_days, (
            f"Expected days_remaining {expected_days} for stock {current_stock} "
            f"and avg consumption {avg_consumption}, but got {item['days_remaining']}"
        )

        # 4. Projected demand verification: avg_consumption * 30
        expected_projected = round(avg_consumption * 30.0, 1)
        assert item["projected_demand"] == expected_projected


def test_dynamic_recalculation_on_stock_change():
    """
    PROVES LIVE DYNAMIC RECALCULATION:
    Changes current_stock of a facility inventory node,
    and verifies that days_remaining and risk_level recalculate dynamically.
    """
    facility_id = "HOSP-01"  # Metro General Hospital
    supply_id = "SKU-04"    # Sterile Saline Solution

    # Step 1: Fetch initial baseline
    res_initial = client.get(f"/api/inventory/{facility_id}/{supply_id}")
    assert res_initial.status_code == 200
    initial_data = res_initial.json()
    avg_burn = initial_data["average_daily_consumption"]
    assert avg_burn > 0

    # Step 2: Set current_stock to a low value that MUST trigger CRITICAL (< 5.0 days)
    critical_stock = int(avg_burn * 3.0)  # Exactly 3.0 days of supply
    res_critical = client.put(
        f"/api/inventory/{facility_id}/{supply_id}",
        json={"current_stock": critical_stock},
    )
    assert res_critical.status_code == 200
    crit_data = res_critical.json()
    assert crit_data["current_stock"] == critical_stock
    assert crit_data["days_remaining"] == round(critical_stock / avg_burn, 1)
    assert crit_data["risk_level"] == "CRITICAL"

    # Step 3: Set current_stock to a high value that MUST trigger STABLE (> 21.0 days)
    stable_stock = int(avg_burn * 35.0)  # 35.0 days of supply
    res_stable = client.put(
        f"/api/inventory/{facility_id}/{supply_id}",
        json={"current_stock": stable_stock, "minimum_buffer": int(avg_burn * 10)},
    )
    assert res_stable.status_code == 200
    stable_data = res_stable.json()
    assert stable_data["current_stock"] == stable_stock
    assert stable_data["days_remaining"] == round(stable_stock / avg_burn, 1)
    assert stable_data["risk_level"] == "STABLE"

    # Step 4: Set stock to 0 (Complete Stockout)
    res_zero = client.put(
        f"/api/inventory/{facility_id}/{supply_id}",
        json={"current_stock": 0},
    )
    assert res_zero.status_code == 200
    zero_data = res_zero.json()
    assert zero_data["days_remaining"] == 0.0
    assert zero_data["risk_level"] == "CRITICAL"


def test_consumption_summary_endpoint():
    """Verify aggregated consumption endpoint calculates burn rates."""
    response = client.get("/api/consumption/summary?facility_id=HOSP-01")
    assert response.status_code == 200
    summaries = response.json()
    assert len(summaries) == 15  # All 15 SKUs for Metro General
    for s in summaries:
        assert s["facility_id"] == "HOSP-01"
        assert s["total_consumed"] > 0
        assert s["average_daily_consumption"] > 0


def test_shipments_endpoint():
    """Verify shipments API."""
    response = client.get("/api/shipments")
    assert response.status_code == 200
    shipments = response.json()
    assert len(shipments) >= 40
    statuses = {s["status"] for s in shipments}
    assert "DELIVERED" in statuses or "IN_TRANSIT" in statuses
