"""
HealthFlow AI - Machine Learning Feature Engineering Pipeline
Prepares feature vectors from 6-month historical consumption time-series,
facility capacities, and seasonal trends for predictive models.
"""

import pandas as pd
import numpy as np


def extract_consumption_features(df_consumption: pd.DataFrame, window_sizes=[7, 14, 30]) -> pd.DataFrame:
    """
    Computes rolling features:
    - Moving average burn rate over 7, 14, 30 days
    - Consumption volatility (standard deviation)
    - Weekday vs weekend consumption ratios
    - Momentum / trend gradient
    """
    df = df_consumption.copy()
    df["consumption_date"] = pd.to_datetime(df["consumption_date"])
    df = df.sort_values(["facility_id", "supply_id", "consumption_date"])

    features_list = []

    grouped = df.groupby(["facility_id", "supply_id"])
    for (fac_id, sup_id), group in grouped:
        group = group.set_index("consumption_date")
        
        row_feat = {
            "facility_id": fac_id,
            "supply_id": sup_id,
            "total_historical_records": len(group),
        }

        for w in window_sizes:
            rolling = group["quantity_consumed"].rolling(window=f"{w}D")
            row_feat[f"burn_rate_mean_{w}d"] = float(rolling.mean().iloc[-1])
            row_feat[f"burn_rate_std_{w}d"] = float(rolling.std().iloc[-1]) if len(group) >= w else 0.0

        # Calculate recent 7d vs 30d trend momentum
        m7 = row_feat.get("burn_rate_mean_7d", 1.0)
        m30 = row_feat.get("burn_rate_mean_30d", 1.0)
        row_feat["consumption_momentum_ratio"] = round(m7 / max(0.1, m30), 3)

        features_list.append(row_feat)

    return pd.DataFrame(features_list)
