"""
IGNIS — Space Fire Intelligence
Predictive Combustion ML Endpoint
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.prediction import PredictionRequest, PredictionResponse
from backend.app.services.prediction.predict_flex import prediction_service

router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict Droplet Burning Rate Constant K",
    description=(
        "Estimates the microgravity droplet burning rate constant K (mm²/s) using pre-ignition chamber and fuel conditions. "
        "Strictly validated against NASA PSI-69 FLEX. Includes extrapolation alerts and scientific disclaimer."
    ),
)
async def predict_combustion(request: PredictionRequest) -> PredictionResponse:
    if not prediction_service.is_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Predictive combustion ML model is not loaded. Ensure model artifacts exist in 'models/' "
                "by running 'python backend/app/services/prediction/train_flex.py'."
            ),
        )

    try:
        res = prediction_service.predict(
            fuel=request.fuel,
            ambient_pressure_kpa=request.ambient_pressure_kpa,
            o2_mole_fraction=request.o2_mole_fraction,
            n2_mole_fraction=request.n2_mole_fraction,
            co2_mole_fraction=request.co2_mole_fraction,
            he_mole_fraction=request.he_mole_fraction,
            droplet_initial_diameter_mm=request.droplet_initial_diameter_mm,
            model_choice=request.model_choice or "ridge",
        )
        return PredictionResponse(**res)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )

