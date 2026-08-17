import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client():
    # Using TestClient as a context manager runs the app's lifespan (startup/shutdown),
    # which is what loads the model - without it /health and /predict would 503/500.
    with TestClient(app) as c:
        yield c


def test_health_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict_happy_path(client):
    payload = {
        "location": "Baner Pune",
        "carpet_area_sqft": 1200,
        "floor_num": 3,
        "bathroom": 2,
        "balcony": 1,
        "furnishing": "Semi-Furnished",
        "transaction": "Resale",
        "ownership": "Freehold",
        "facing": "East",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert "predicted_price" in body
    assert isinstance(body["predicted_price"], float)
    assert body["predicted_price"] > 0


def test_predict_invalid_input_returns_422(client):
    payload = {
        "location": "Baner Pune",
        "carpet_area_sqft": -100,  # invalid: must be > 0
        "floor_num": 3,
        "bathroom": 2,
        "balcony": 1,
        "furnishing": "Semi-Furnished",
        "transaction": "Resale",
        "ownership": "Freehold",
        "facing": "East",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_predict_missing_field_returns_422(client):
    payload = {"location": "Baner Pune"}
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
