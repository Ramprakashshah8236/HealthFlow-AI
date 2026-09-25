"""
HealthFlow AI - Database Initializer & Seeder Script
Initializes relational schemas and populates records from synthetic datasets into PostgreSQL or SQLite.
"""

import json
import os
import sys
from datetime import datetime, date
import pandas as pd

# Add workspace to path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from backend.database import engine, SessionLocal, Base
from backend.models import Facility, Supply, Supplier, Inventory, ConsumptionLog, Shipment
from data.synthetic_generator import generate_synthetic_data, DATA_DIR


def init_and_seed_database():
    """Initializes tables and populates with verified synthetic healthcare datasets."""
    print("=" * 60)
    print("Initializing HealthFlow AI Relational Database...")
    print(f"Target Connection: {engine.url}")
    print("=" * 60)

    # 1. Create all tables
    print("Creating database schema tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Schema tables initialized successfully.")

    db = SessionLocal()

    try:
        # Check if already seeded
        facility_count = db.query(Facility).count()
        if facility_count > 0:
            print(f"Database already contains {facility_count} facilities. Refreshing data...")
            db.query(Shipment).delete()
            db.query(ConsumptionLog).delete()
            db.query(Inventory).delete()
            db.query(Supplier).delete()
            db.query(Supply).delete()
            db.query(Facility).delete()
            db.commit()

        # Load or generate synthetic data
        fac_file = os.path.join(DATA_DIR, "facilities.json")
        if not os.path.exists(fac_file):
            print("Synthetic data files not found. Generating fresh synthetic dataset...")
            data = generate_synthetic_data(num_days=180)
        else:
            with open(os.path.join(DATA_DIR, "facilities.json")) as f:
                facilities = json.load(f)
            with open(os.path.join(DATA_DIR, "suppliers.json")) as f:
                suppliers = json.load(f)
            with open(os.path.join(DATA_DIR, "supplies.json")) as f:
                supplies = json.load(f)
            with open(os.path.join(DATA_DIR, "inventory.json")) as f:
                inventory = json.load(f)
            with open(os.path.join(DATA_DIR, "shipments.json")) as f:
                shipments = json.load(f)

            csv_path = os.path.join(DATA_DIR, "historical_consumption.csv")
            if os.path.exists(csv_path):
                df_consumption = pd.read_csv(csv_path)
                consumption_logs = df_consumption.to_dict(orient="records")
            else:
                data = generate_synthetic_data(num_days=180)
                consumption_logs = data["consumption_logs"]

            data = {
                "facilities": facilities,
                "suppliers": suppliers,
                "supplies": supplies,
                "inventory": inventory,
                "consumption_logs": consumption_logs,
                "shipments": shipments,
            }

        # 2. Seed Facilities (10 Hospitals, 3 Depots)
        print("Seeding facilities...")
        for f in data["facilities"]:
            db.add(Facility(**f))
        db.commit()
        print(f"✓ Inserted {len(data['facilities'])} facilities.")

        # 3. Seed Suppliers (8 Certified Suppliers)
        print("Seeding suppliers...")
        for s in data["suppliers"]:
            db.add(Supplier(**s))
        db.commit()
        print(f"✓ Inserted {len(data['suppliers'])} suppliers.")

        # 4. Seed Medical Supplies (15 SKUs)
        print("Seeding medical supplies catalog...")
        for sup in data["supplies"]:
            clean_sup = {k: v for k, v in sup.items() if k in Supply.__table__.columns.keys()}
            db.add(Supply(**clean_sup))
        db.commit()
        print(f"✓ Inserted {len(data['supplies'])} supply SKUs.")

        # 5. Seed Inventory Nodes
        print("Seeding active inventory records...")
        for inv in data["inventory"]:
            exp_date = datetime.strptime(inv["expiry_date"], "%Y-%m-%d").date()
            db.add(
                Inventory(
                    facility_id=inv["facility_id"],
                    supply_id=inv["supply_id"],
                    batch_lot_number=inv["batch_lot_number"],
                    current_stock=inv["current_stock"],
                    minimum_buffer=inv["minimum_buffer"],
                    expiry_date=exp_date,
                )
            )
        db.commit()
        print(f"✓ Inserted {len(data['inventory'])} inventory records.")

        # 6. Seed Historical Daily Consumption (35,100 records)
        print("Seeding 6 months of daily consumption logs (bulk insert)...")
        consumption_objects = []
        for log in data["consumption_logs"]:
            c_date = datetime.strptime(str(log["consumption_date"]), "%Y-%m-%d").date()
            consumption_objects.append(
                ConsumptionLog(
                    facility_id=log["facility_id"],
                    supply_id=log["supply_id"],
                    consumption_date=c_date,
                    quantity_consumed=int(log["quantity_consumed"]),
                    patient_admissions=int(log["patient_admissions"]),
                )
            )
        # Bulk save for optimal performance
        db.bulk_save_objects(consumption_objects)
        db.commit()
        print(f"✓ Inserted {len(consumption_objects)} historical consumption logs.")

        # 7. Seed Shipments
        print("Seeding shipment logs...")
        for shp in data["shipments"]:
            dep_date = datetime.strptime(shp["departure_date"], "%Y-%m-%d").date()
            arr_date = datetime.strptime(shp["expected_delivery_date"], "%Y-%m-%d").date()
            db.add(
                Shipment(
                    id=shp["id"],
                    source_id=shp["source_id"],
                    destination_id=shp["destination_id"],
                    supply_id=shp["supply_id"],
                    quantity=shp["quantity"],
                    departure_date=dep_date,
                    expected_delivery_date=arr_date,
                    status=shp["status"],
                    carrier=shp["carrier"],
                    cold_chain_compliant=shp["cold_chain_compliant"],
                )
            )
        db.commit()
        print(f"✓ Inserted {len(data['shipments'])} shipment records.")

        print("=" * 60)
        print("Database initialization and synthetic seeding complete!")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    init_and_seed_database()
