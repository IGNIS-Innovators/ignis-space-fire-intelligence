"""
IGNIS — Space Fire Intelligence
FastAPI Application Entrypoint
NASA Space Apps Challenge 2026
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.router import api_router
from backend.app.core.config import settings
from backend.app.services.data.repository import repository
from backend.app.services.prediction.predict_flex import prediction_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup validation
    print(f"[{settings.PROJECT_NAME}] Initializing scientific backend...")
    if not repository.is_loaded():
        repository.load_data()
    print(f"[{settings.PROJECT_NAME}] Datasets loaded: {repository.is_loaded()} ({repository.get_health_stats()['experiments_count']} trials)")
    print(f"[{settings.PROJECT_NAME}] Predictive ML model ready: {prediction_service.is_ready()}")
    yield
    print(f"[{settings.PROJECT_NAME}] Shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under both /api and /api/v1 for seamless frontend compatibility
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "documentation": "/docs",
        "health_check": "/api/health",
        "overview": "/api/overview",
        "experiments": "/api/experiments",
        "insights": "/api/insights",
        "scientific_disclaimer": "IGNIS Space Fire Intelligence platform for scientific microgravity research.",
    }


@app.get("/health", tags=["System Health"], include_in_schema=False)
async def root_health():
    # Direct alias for /health
    health_stats = repository.get_health_stats()
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "datasets_loaded": health_stats["datasets_loaded"],
        "experiments_count": health_stats["experiments_count"],
        "model_ready": prediction_service.is_ready(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

