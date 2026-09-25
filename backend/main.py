"""
HealthFlow AI - FastAPI Application Entrypoint
Main server mounting routers, handling CORS, and exposing health diagnostics.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.routers import (
    hospitals,
    supplies,
    inventory,
    consumption,
    suppliers,
    shipments,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Healthcare supply resilience intelligence platform backend providing real-time inventory intelligence, dynamic days-remaining calculations, and synthetic healthcare logistics operations.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(hospitals.router, prefix=settings.API_PREFIX)
app.include_router(supplies.router, prefix=settings.API_PREFIX)
app.include_router(inventory.router, prefix=settings.API_PREFIX)
app.include_router(consumption.router, prefix=settings.API_PREFIX)
app.include_router(suppliers.router, prefix=settings.API_PREFIX)
app.include_router(shipments.router, prefix=settings.API_PREFIX)


@app.get("/api/health", tags=["Health Diagnostics"])
def health_check():
    """Health check endpoint confirming FastAPI backend status."""
    return {
        "status": "healthy",
        "service": "HealthFlow AI Backend",
        "version": settings.VERSION,
        "database": settings.DATABASE_URL.split("://")[0],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
