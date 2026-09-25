"""
HealthFlow AI - Backend Configuration
Supports PostgreSQL and SQLite for versatile deployment environments.
"""

import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "HealthFlow AI — Health Supply Resilience Intelligence Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database URL:
    # Set DATABASE_URL to your PostgreSQL connection string in production, e.g.:
    # postgresql+psycopg2://user:password@localhost:5432/healthflow_db
    # Falls back automatically to local SQLite database if PostgreSQL is not specified
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'healthflow.db'))}"
    )

    # Operational Resilience Thresholds (Days of Supply)
    CRITICAL_DAYS_THRESHOLD: float = 5.0
    HIGH_RISK_DAYS_THRESHOLD: float = 12.0
    WARNING_DAYS_THRESHOLD: float = 21.0
    
    # Default consumption calculation lookback window (days)
    CONSUMPTION_LOOKBACK_DAYS: int = 30

settings = Settings()
