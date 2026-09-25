# HealthFlow AI — Machine Learning Pipeline Architecture

This module houses the planned data intelligence and predictive pipelines for future model training and deployment.

## Planned ML Components (Phase 2)
1. **Shortage Prediction Model (`/ml/shortage_model.py`)**:
   - Time-series depletion forecasting (ARIMA / Gradient Boosted Trees via `scikit-learn`).
   - Forecasts estimated stockout dates (0 stock) comparing projected cumulative consumption against inbound shipments.
2. **Waste & Expiry Risk Classifier (`/ml/expiry_classifier.py`)**:
   - Calculates the probability that current inventory lots will expire before clinical consumption:
     `P(Waste) = 1 - CDF(Cumulative_Demand(T_expiry) >= Current_Lot_Units)`
3. **Smart Redistribution Optimization Engine (`/ml/redistribution_opt.py`)**:
   - Multi-objective linear optimization pairing surplus facilities with critical-shortage hospitals, minimizing transit latency and transport cost while preserving source safety buffers.
