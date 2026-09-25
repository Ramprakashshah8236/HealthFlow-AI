"""
HealthFlow AI - Synthetic Healthcare Supply Logistics Data Generator
Generates realistic, de-identified synthetic datasets for healthcare resilience modeling.
Includes:
- 10 Regional Hospitals
- 3 Strategic Depots
- 8 Certified Suppliers
- 15 Essential Medical Supply SKUs
- 6 Months of Daily Historical Consumption Time-Series (180 days x 195 nodes = 35,100 records)
- Active Inventory Records with Lots and Expiry Dates
- Inbound & Transfer Shipments
"""

import json
import random
import os
from datetime import date, datetime, timedelta
import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. 10 Hospitals + 3 Depots
FACILITIES = [
    {
        "id": "HOSP-01",
        "name": "Metro General Hospital",
        "facility_type": "HOSPITAL",
        "region": "Metropolitan Core",
        "address": "450 Medical Center Blvd, Metro City",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "bed_capacity": 680,
        "icu_capacity": 85,
        "contact_email": "logistics@metrogeneral.health",
    },
    {
        "id": "HOSP-02",
        "name": "St. Jude Regional Medical Center",
        "facility_type": "HOSPITAL",
        "region": "North River District",
        "address": "1200 North River Pkwy, Riverdale",
        "latitude": 40.7831,
        "longitude": -73.9712,
        "bed_capacity": 450,
        "icu_capacity": 55,
        "contact_email": "supply@stjude-health.org",
    },
    {
        "id": "HOSP-03",
        "name": "Memorial Healthcare System",
        "facility_type": "HOSPITAL",
        "region": "South Bay Coastal",
        "address": "880 Coastal Highway, South Bay",
        "latitude": 40.6782,
        "longitude": -73.9442,
        "bed_capacity": 520,
        "icu_capacity": 60,
        "contact_email": "ops@memorialhealth.org",
    },
    {
        "id": "HOSP-04",
        "name": "Mercy Central Hospital",
        "facility_type": "HOSPITAL",
        "region": "Downtown Core",
        "address": "310 E 14th St, Downtown",
        "latitude": 40.7330,
        "longitude": -73.9840,
        "bed_capacity": 380,
        "icu_capacity": 45,
        "contact_email": "inventory@mercycentral.org",
    },
    {
        "id": "HOSP-05",
        "name": "Highland Valley Health",
        "facility_type": "HOSPITAL",
        "region": "East Foothills",
        "address": "77 Valley Road, Highland Heights",
        "latitude": 40.8116,
        "longitude": -73.9465,
        "bed_capacity": 290,
        "icu_capacity": 30,
        "contact_email": "materials@highlandvalley.net",
    },
    {
        "id": "HOSP-06",
        "name": "Riverside Children's Hospital",
        "facility_type": "HOSPITAL",
        "region": "West Riverside",
        "address": "500 Riverside Drive, Riverside",
        "latitude": 40.8050,
        "longitude": -73.9650,
        "bed_capacity": 240,
        "icu_capacity": 40,
        "contact_email": "peds-logistics@riversidepeds.org",
    },
    {
        "id": "HOSP-07",
        "name": "Apex University Hospital",
        "facility_type": "HOSPITAL",
        "region": "Academic Science Park",
        "address": "100 Innovation Way, Tech District",
        "latitude": 40.7505,
        "longitude": -73.9934,
        "bed_capacity": 710,
        "icu_capacity": 95,
        "contact_email": "supply-chain@apexmed.edu",
    },
    {
        "id": "HOSP-08",
        "name": "Lakewood Community Hospital",
        "facility_type": "HOSPITAL",
        "region": "West Lakes Basin",
        "address": "620 Lake Shore Dr, Lakewood",
        "latitude": 40.6920,
        "longitude": -74.0200,
        "bed_capacity": 180,
        "icu_capacity": 20,
        "contact_email": "pharmacy@lakewoodhealth.org",
    },
    {
        "id": "HOSP-09",
        "name": "St. Teresa General Hospital",
        "facility_type": "HOSPITAL",
        "region": "North Metro Suburbs",
        "address": "910 Summit Ave, North Suburbs",
        "latitude": 40.8400,
        "longitude": -73.9200,
        "bed_capacity": 310,
        "icu_capacity": 35,
        "contact_email": "orders@stteresageneral.org",
    },
    {
        "id": "HOSP-10",
        "name": "Pinecrest Valley Medical Center",
        "facility_type": "HOSPITAL",
        "region": "Outer Valley Basin",
        "address": "2040 Pine Ridge Rd, Pinecrest",
        "latitude": 40.6400,
        "longitude": -74.0100,
        "bed_capacity": 160,
        "icu_capacity": 15,
        "contact_email": "admin@pinecrestmed.org",
    },
    # Central Depots
    {
        "id": "DEPOT-01",
        "name": "Central Logistics Depot Alpha",
        "facility_type": "CENTRAL_DEPOT",
        "region": "Airport Cargo Corridor",
        "address": "Cargo Facility 4, International Airport",
        "latitude": 40.6413,
        "longitude": -73.7781,
        "bed_capacity": 0,
        "icu_capacity": 0,
        "contact_email": "depot-alpha@healthflow.gov",
    },
    {
        "id": "DEPOT-02",
        "name": "Tri-County Strategic Medical Reserve",
        "facility_type": "CENTRAL_DEPOT",
        "region": "Industrial Harbor Port",
        "address": "Pier 19 Logistics Park, Harbor",
        "latitude": 40.6700,
        "longitude": -74.0400,
        "bed_capacity": 0,
        "icu_capacity": 0,
        "contact_email": "strategic-reserve@tricountyhealth.gov",
    },
    {
        "id": "DEPOT-03",
        "name": "Regional Biologics Cold Depot",
        "facility_type": "CENTRAL_DEPOT",
        "region": "Biotech Valley Hub",
        "address": "12 Science Corridor, Biotech Park",
        "latitude": 40.7600,
        "longitude": -73.9500,
        "bed_capacity": 0,
        "icu_capacity": 0,
        "contact_email": "coldchain@biologicsdepot.org",
    },
]

# 2. 8 Certified Suppliers
SUPPLIERS = [
    {
        "id": "SUP-01",
        "name": "BioPharma Global Solutions",
        "tier": "TIER_1",
        "country": "United States",
        "lead_time_days": 3,
        "reliability_score": 0.98,
        "categories": "Critical Care, Pharmaceuticals",
        "contact_phone": "+1-800-555-0101",
    },
    {
        "id": "SUP-02",
        "name": "Cardinal MedTech Supplies",
        "tier": "TIER_1",
        "country": "United States",
        "lead_time_days": 4,
        "reliability_score": 0.95,
        "categories": "PPE, Surgical, Diagnostics",
        "contact_phone": "+1-800-555-0102",
    },
    {
        "id": "SUP-03",
        "name": "Apex Surgical Instruments",
        "tier": "TIER_1",
        "country": "Germany",
        "lead_time_days": 6,
        "reliability_score": 0.94,
        "categories": "Surgical, Critical Care",
        "contact_phone": "+49-89-555-0103",
    },
    {
        "id": "SUP-04",
        "name": "Nordix Biologics International",
        "tier": "TIER_2",
        "country": "Sweden",
        "lead_time_days": 5,
        "reliability_score": 0.96,
        "categories": "Pharmaceuticals, Biologics",
        "contact_phone": "+46-8-555-0104",
    },
    {
        "id": "SUP-05",
        "name": "Horizon PPE Manufacturing",
        "tier": "TIER_1",
        "country": "United States",
        "lead_time_days": 2,
        "reliability_score": 0.92,
        "categories": "PPE",
        "contact_phone": "+1-800-555-0105",
    },
    {
        "id": "SUP-06",
        "name": "VitalCare Pharmaceuticals",
        "tier": "TIER_1",
        "country": "United States",
        "lead_time_days": 3,
        "reliability_score": 0.97,
        "categories": "Pharmaceuticals, Critical Care",
        "contact_phone": "+1-800-555-0106",
    },
    {
        "id": "SUP-07",
        "name": "CryoLogix Cold-Chain Systems",
        "tier": "TIER_2",
        "country": "Netherlands",
        "lead_time_days": 7,
        "reliability_score": 0.93,
        "categories": "Biologics, Diagnostics",
        "contact_phone": "+31-20-555-0107",
    },
    {
        "id": "SUP-08",
        "name": "OmniVent Respiratory Systems",
        "tier": "TIER_1",
        "country": "United States",
        "lead_time_days": 4,
        "reliability_score": 0.91,
        "categories": "Critical Care, Consumables",
        "contact_phone": "+1-800-555-0108",
    },
]

# 3. 15 Medical Supply SKUs
SUPPLIES = [
    {
        "id": "SKU-01",
        "name": "N95 Respirator Masks",
        "category": "PPE",
        "unit": "Boxes (20/bx)",
        "unit_cost": 24.50,
        "is_cold_chain": False,
        "temp_min_celsius": None,
        "temp_max_celsius": None,
        "default_shelf_life_days": 730,
        "base_burn_rate_per_100_beds": 18,
    },
    {
        "id": "SKU-02",
        "name": "Surgical Nitrile Gloves (L)",
        "category": "PPE",
        "unit": "Boxes (100/bx)",
        "unit_cost": 18.00,
        "is_cold_chain": False,
        "temp_min_celsius": None,
        "temp_max_celsius": None,
        "default_shelf_life_days": 1095,
        "base_burn_rate_per_100_beds": 35,
    },
    {
        "id": "SKU-03",
        "name": "IV Administration Infusion Sets",
        "category": "Critical Care",
        "unit": "Packs (50/pk)",
        "unit_cost": 65.00,
        "is_cold_chain": False,
        "temp_min_celsius": None,
        "temp_max_celsius": None,
        "default_shelf_life_days": 730,
        "base_burn_rate_per_100_beds": 14,
    },
    {
        "id": "SKU-04",
        "name": "Sterile Saline 0.9% 1000ml",
        "category": "Critical Care",
        "unit": "Cases (12/cs)",
        "unit_cost": 42.00,
        "is_cold_chain": False,
        "temp_min_celsius": None,
        "temp_max_celsius": None,
        "default_shelf_life_days": 540,
        "base_burn_rate_per_100_beds": 28,
    },
    {
        "id": "SKU-05",
        "name": "Propofol Injectable Emulsion 20ml",
        "category": "Pharmaceuticals",
        "unit": "Vials (10/tray)",
        "unit_cost": 125.00,
        "is_cold_chain": True,
        "temp_min_celsius": 4.0,
        "temp_max_celsius": 25.0,
        "default_shelf_life_days": 365,
        "base_burn_rate_per_100_beds": 8,
    },
    {
        "id": "SKU-06",
        "name": "Endotracheal Breathing Tubes 7.5mm",
        "category": "Critical Care",
        "unit": "Units",
        "unit_cost": 15.20,
        "is_cold_chain": False,
        "temp_min_celsius": None,
        "temp_max_celsius": None,
        "default_shelf_life_days": 1825,
        "base_burn_rate_per_100_beds": 5,
    },
    {
        "id": "SKU-07",
        "name": "Rapid PCR Viral Diagnostic Kits",
        "category": "Diagnostics",
        "unit": "Kits (25 tests)",
        "unit_cost": 310.00,
        "is_cold_chain": True,
        "temp_min_celsius": 2.0,
        "temp_max_celsius": 8.0,
        "default_shelf_life_days": 180,
        "base_burn_rate_per_100_beds": 12,
    },
    {
        "id": "SKU-08",
        "name": "Blood Administration Filter Sets",
        "category": "Critical Care",
        "unit": "Packs (20/pk)",
        "unit_cost": 84.00,
        "is_cold_chain": False,
        "temp_min_celsius": None,
        "temp_max_celsius": None,
        "default_shelf_life_days": 1095,
        "base_burn_rate_per_100_beds": 6,
    },
    {
        "id": "SKU-09",
        "name": "Epinephrine Auto-Injectors 0.3mg",
        "category": "Pharmaceuticals",
        "unit": "2-Packs",
        "unit_cost": 195.00,
        "is_cold_chain": False,
        "temp_min_celsius": 15.0,
        "temp_max_celsius": 25.0,
        "default_shelf_life_days": 365,
        "base_burn_rate_per_100_beds": 4,
    },
    {
        "id": "SKU-10",
        "name": "Heparin Sodium Injection 5000U",
        "category": "Pharmaceuticals",
        "unit": "Vials (25/cs)",
        "unit_cost": 140.00,
        "is_cold_chain": False,
        "temp_min_celsius": 20.0,
        "temp_max_celsius": 25.0,
        "default_shelf_life_days": 730,
        "base_burn_rate_per_100_beds": 7,
    },
    {
        "id": "SKU-11",
        "name": "Surgical Laparotomy Sponges 18x18",
        "category": "Surgical",
        "unit": "Packs (5/pk)",
        "unit_cost": 32.00,
        "is_cold_chain": False,
        "temp_min_celsius": None,
        "temp_max_celsius": None,
        "default_shelf_life_days": 1825,
        "base_burn_rate_per_100_beds": 10,
    },
    {
        "id": "SKU-12",
        "name": "Pediatric Ventilator Breathing Circuits",
        "category": "Critical Care",
        "unit": "Units",
        "unit_cost": 55.00,
        "is_cold_chain": False,
        "temp_min_celsius": None,
        "temp_max_celsius": None,
        "default_shelf_life_days": 1095,
        "base_burn_rate_per_100_beds": 3,
    },
    {
        "id": "SKU-13",
        "name": "Hemostatic Gauze Trauma Dressings",
        "category": "Surgical",
        "unit": "Boxes (10/bx)",
        "unit_cost": 115.00,
        "is_cold_chain": False,
        "temp_min_celsius": None,
        "temp_max_celsius": None,
        "default_shelf_life_days": 1460,
        "base_burn_rate_per_100_beds": 5,
    },
    {
        "id": "SKU-14",
        "name": "Viral Transport Media (VTM) Swabs",
        "category": "Diagnostics",
        "unit": "Packs (100/pk)",
        "unit_cost": 75.00,
        "is_cold_chain": False,
        "temp_min_celsius": 2.0,
        "temp_max_celsius": 30.0,
        "default_shelf_life_days": 270,
        "base_burn_rate_per_100_beds": 15,
    },
    {
        "id": "SKU-15",
        "name": "mRNA Biologic Vaccine Ampoules",
        "category": "Pharmaceuticals",
        "unit": "Trays (25 ampoules)",
        "unit_cost": 450.00,
        "is_cold_chain": True,
        "temp_min_celsius": 2.0,
        "temp_max_celsius": 8.0,
        "default_shelf_life_days": 120,
        "base_burn_rate_per_100_beds": 9,
    },
]


def generate_synthetic_data(num_days=180, reference_date=None):
    """
    Generates realistic 6 months of daily consumption, current inventory, and shipments.
    """
    if reference_date is None:
        reference_date = date.today()

    start_date = reference_date - timedelta(days=num_days)

    consumption_records = []
    inventory_records = []
    shipment_records = []

    # Calculate base demand per facility x supply
    for fac in FACILITIES:
        is_depot = fac["facility_type"] == "CENTRAL_DEPOT"
        bed_factor = (fac["bed_capacity"] / 100.0) if not is_depot else 4.0

        for sup in SUPPLIES:
            burn_base = sup["base_burn_rate_per_100_beds"] * bed_factor
            
            # Special adjustment for pediatric hospital
            if fac["id"] == "HOSP-06" and sup["id"] == "SKU-12":
                burn_base *= 4.0  # High pediatric circuit demand
            elif fac["id"] == "HOSP-06" and sup["id"] == "SKU-06":
                burn_base *= 0.5

            daily_rates = []
            
            # Generate 180 days of daily consumption
            for day_idx in range(num_days):
                cur_date = start_date + timedelta(days=day_idx)
                day_of_week = cur_date.weekday()

                # Weekend reduction for routine surgeries
                weekend_multiplier = 0.72 if day_of_week in (5, 6) and sup["category"] in ("Surgical", "PPE") else 1.0
                
                # Seasonal drift (slight wave over 6 months)
                seasonal_multiplier = 1.0 + 0.15 * np.sin(2 * np.pi * day_idx / 180)
                
                # Stochastic noise
                noise = np.random.normal(1.0, 0.12)
                rate = max(1, int(round(burn_base * weekend_multiplier * seasonal_multiplier * noise)))
                daily_rates.append(rate)

                admissions = 0 if is_depot else int(fac["bed_capacity"] * 0.15 * np.random.uniform(0.8, 1.2))

                consumption_records.append({
                    "facility_id": fac["id"],
                    "supply_id": sup["id"],
                    "consumption_date": cur_date.isoformat(),
                    "quantity_consumed": rate,
                    "patient_admissions": admissions,
                })

            # Calculate 30-day recent average daily consumption
            recent_30_avg = sum(daily_rates[-30:]) / 30.0

            # Tailor inventory to create distinct realistic risk profiles
            # Metro General has severe critical stress on Saline and N95
            if fac["id"] == "HOSP-01" and sup["id"] in ("SKU-04", "SKU-01", "SKU-09"):
                # CRITICAL: < 5 days
                current_stock = int(recent_30_avg * random.uniform(2.5, 4.2))
                min_buffer = int(recent_30_avg * 14)
                expiry_offset = random.randint(90, 300)
            elif fac["id"] == "HOSP-04" and sup["id"] in ("SKU-03", "SKU-05"):
                # HIGH RISK: 6 - 11 days
                current_stock = int(recent_30_avg * random.uniform(7.0, 10.5))
                min_buffer = int(recent_30_avg * 14)
                expiry_offset = random.randint(60, 250)
            elif fac["id"] == "HOSP-03" and sup["id"] in ("SKU-07", "SKU-15"):
                # WARNING: Near expiry or tight stock
                current_stock = int(recent_30_avg * random.uniform(13.0, 18.0))
                min_buffer = int(recent_30_avg * 14)
                expiry_offset = random.randint(15, 30)  # Expiring soon!
            elif is_depot:
                # Depot has abundant strategic reserve
                current_stock = int(recent_30_avg * random.uniform(35.0, 65.0))
                min_buffer = int(recent_30_avg * 20)
                expiry_offset = random.randint(180, 500)
            else:
                # Normal operational hospitals: STABLE
                current_stock = int(recent_30_avg * random.uniform(22.0, 38.0))
                min_buffer = int(recent_30_avg * 12)
                expiry_offset = random.randint(120, 450)

            lot_num = f"LOT-{cur_date.year}-{random.randint(1000, 9999)}-{sup['id'][-2:]}"
            expiry_date = (reference_date + timedelta(days=expiry_offset)).isoformat()

            inventory_records.append({
                "facility_id": fac["id"],
                "supply_id": sup["id"],
                "batch_lot_number": lot_num,
                "current_stock": current_stock,
                "minimum_buffer": min_buffer,
                "expiry_date": expiry_date,
            })

    # Generate 45 realistic shipments
    carriers = ["MedEx Logistics", "BioSpeed Cold Express", "National Health Freight", "AmeriCare Freight"]
    shipment_counter = 101

    for _ in range(45):
        ship_id = f"SHP-{shipment_counter}"
        shipment_counter += 1
        
        sup = random.choice(SUPPLIES)
        # Randomly choose supplier-to-depot, depot-to-hospital, or hospital-to-hospital transfer
        flow_type = random.choice(["SUPPLIER_TO_DEPOT", "DEPOT_TO_HOSPITAL", "INTER_HOSPITAL"])
        
        if flow_type == "SUPPLIER_TO_DEPOT":
            source_id = random.choice(SUPPLIERS)["id"]
            dest_id = random.choice([f["id"] for f in FACILITIES if f["facility_type"] == "CENTRAL_DEPOT"])
        elif flow_type == "DEPOT_TO_HOSPITAL":
            source_id = random.choice([f["id"] for f in FACILITIES if f["facility_type"] == "CENTRAL_DEPOT"])
            dest_id = random.choice([f["id"] for f in FACILITIES if f["facility_type"] == "HOSPITAL"])
        else:
            source_id = random.choice([f["id"] for f in FACILITIES if f["facility_type"] == "HOSPITAL"])
            dest_id = random.choice([f["id"] for f in FACILITIES if f["facility_type"] == "HOSPITAL" and f["id"] != source_id])

        dep_offset = random.randint(-7, 2)
        arr_offset = dep_offset + random.randint(2, 5)
        
        dep_date = reference_date + timedelta(days=dep_offset)
        arr_date = reference_date + timedelta(days=arr_offset)

        if arr_offset < 0:
            status = "DELIVERED"
        elif dep_offset <= 0 and arr_offset >= 0:
            status = random.choice(["IN_TRANSIT", "IN_TRANSIT", "DELAYED"])
        else:
            status = "SCHEDULED"

        shipment_records.append({
            "id": ship_id,
            "source_id": source_id,
            "destination_id": dest_id,
            "supply_id": sup["id"],
            "quantity": random.randint(50, 600),
            "departure_date": dep_date.isoformat(),
            "expected_delivery_date": arr_date.isoformat(),
            "status": status,
            "carrier": random.choice(carriers),
            "cold_chain_compliant": True,
        })

    return {
        "facilities": FACILITIES,
        "suppliers": SUPPLIERS,
        "supplies": [
            {k: v for k, v in s.items() if k != "base_burn_rate_per_100_beds"}
            for s in SUPPLIES
        ],
        "inventory": inventory_records,
        "consumption_logs": consumption_records,
        "shipments": shipment_records,
    }


def save_synthetic_data_to_files():
    """Generates and dumps synthetic datasets to JSON & CSV files in /data directory."""
    print("Generating HealthFlow AI synthetic healthcare logistics dataset...")
    data = generate_synthetic_data(num_days=180)

    # Save facilities
    with open(os.path.join(DATA_DIR, "facilities.json"), "w") as f:
        json.dump(data["facilities"], f, indent=2)

    # Save suppliers
    with open(os.path.join(DATA_DIR, "suppliers.json"), "w") as f:
        json.dump(data["suppliers"], f, indent=2)

    # Save supplies
    with open(os.path.join(DATA_DIR, "supplies.json"), "w") as f:
        json.dump(data["supplies"], f, indent=2)

    # Save inventory
    with open(os.path.join(DATA_DIR, "inventory.json"), "w") as f:
        json.dump(data["inventory"], f, indent=2)

    # Save shipments
    with open(os.path.join(DATA_DIR, "shipments.json"), "w") as f:
        json.dump(data["shipments"], f, indent=2)

    # Save 6-month consumption records (CSV for data science & ML pipelines)
    df_consumption = pd.DataFrame(data["consumption_logs"])
    df_consumption.to_csv(os.path.join(DATA_DIR, "historical_consumption.csv"), index=False)

    print(f"Successfully generated:")
    print(f" - {len(data['facilities'])} Facilities (10 Hospitals, 3 Central Depots)")
    print(f" - {len(data['suppliers'])} Certified Suppliers")
    print(f" - {len(data['supplies'])} Medical Supply SKUs")
    print(f" - {len(data['inventory'])} Inventory Node Records")
    print(f" - {len(data['consumption_logs'])} Historical Daily Consumption Logs (180 days)")
    print(f" - {len(data['shipments'])} Supply Shipments")
    return data


if __name__ == "__main__":
    save_synthetic_data_to_files()
