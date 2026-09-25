# HealthFlow AI — Frontend Module

This directory represents the frontend workspace of HealthFlow AI.

## Architecture
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Animations**: Motion

## Directory Structure
- `src/components/`: Modular views and UI widgets
  - `Navbar.tsx`: Global navigation and operational scenario controls
  - `DashboardView.tsx`: Regional hospital risk matrix and resilience telemetry
  - `SupplyIntelligenceView.tsx`: Supply-level filtering and days-remaining auditing
  - `ShortagePredictionView.tsx`: Stockout trajectory curves
  - `WasteIntelligenceView.tsx`: Expiry and lot-level financial risk
  - `SmartRedistributionView.tsx`: Inter-hospital mutual-aid transfers
  - `CrisisLabView.tsx`: Multi-variable stress testing simulator
  - `NetworkMapView.tsx`: Supply logistics topology and geographic fleet tracking
  - `ColdChainView.tsx`: IoT thermal telemetry for biologics & vaccines
  - `AiAssistantDrawer.tsx`: Grounded resilience co-pilot
- `src/context/`: Global application state manager (`AppContext.tsx`)
- `src/types.ts`: TypeScript contracts for facilities, supplies, inventory, and simulation parameters

## Running Frontend in Development
```bash
npm install
npm run dev
```
Listens on `http://localhost:3000`.
Requests to `/api/*` are routed to the FastAPI backend at `http://localhost:8000`.
