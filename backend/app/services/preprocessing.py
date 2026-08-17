import json
import logging
from pathlib import Path

import pandas as pd

from app.core.config import settings
from app.schemas.prediction import PredictionRequest

logger = logging.getLogger(__name__)

# Column names must match exactly what the notebook used to train the pipeline
# (numeric_features + categorical_features in notebooks/house_price_model.ipynb, section 2.4).
_NUMERIC_COLUMNS = ["carpet_area_sqft", "floor_num", "bathroom", "balcony"]
_CATEGORICAL_COLUMNS = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]


def _load_known_locations() -> set[str]:
    path = Path(settings.locations_path)
    if not path.exists():
        logger.warning("locations.json not found at %s — unknown-location mapping is disabled", path)
        return set()
    with open(path) as f:
        return set(json.load(f))


_KNOWN_LOCATIONS = _load_known_locations()


def request_to_dataframe(payload: PredictionRequest) -> pd.DataFrame:
    """Build a one-row DataFrame with exactly the columns/names used during training.

    The exported model is a full scikit-learn Pipeline (imputer + scaler + one-hot encoder +
    regressor), so no manual encoding happens here — we just shape the raw input correctly and
    let the pipeline do the rest.
    """
    location_grouped = payload.location if payload.location in _KNOWN_LOCATIONS else "other"

    row = {
        "carpet_area_sqft": payload.carpet_area_sqft,
        "floor_num": payload.floor_num,
        "bathroom": payload.bathroom,
        "balcony": payload.balcony,
        "location_grouped": location_grouped,
        "Furnishing": payload.furnishing,
        "Transaction": payload.transaction,
        "Ownership": payload.ownership,
        "facing": payload.facing,
    }

    return pd.DataFrame([row], columns=_NUMERIC_COLUMNS + _CATEGORICAL_COLUMNS)
