import logging
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from app.core.config import settings

logger = logging.getLogger(__name__)


class ModelService:
    """Wraps the trained pipeline. Loaded once at startup, reused for every request."""

    def __init__(self) -> None:
        self._model: Any = None

    def load(self) -> None:
        path = Path(settings.model_path)
        if not path.exists():
            raise FileNotFoundError(
                f"Model file not found at {path}. Run the notebook and copy "
                "house_price.pkl into backend/models/ first."
            )
        logger.info("Loading model from %s", path)
        self._model = joblib.load(path)
        logger.info("Model loaded successfully")

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def predict(self, df: pd.DataFrame) -> float:
        if self._model is None:
            raise RuntimeError("Model is not loaded yet")
        prediction = self._model.predict(df)
        return float(prediction[0])


# Single shared instance used across the app (loaded in main.py's lifespan handler)
model_service = ModelService()
