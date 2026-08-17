import logging

from fastapi import APIRouter, HTTPException

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse
from app.services.inference import model_service
from app.services.preprocessing import request_to_dataframe

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    return HealthResponse(status="ok")


@router.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    try:
        df = request_to_dataframe(payload)
        predicted_price = model_service.predict(df)
    except Exception:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed")

    return PredictionResponse(predicted_price=predicted_price)
