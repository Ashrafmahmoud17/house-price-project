# House Price Predictor

An end-to-end machine-learning product: a Jupyter notebook that cleans real Indian property
listings and trains a regression model, a FastAPI backend that serves it, and a React frontend
where a user enters property details and gets an instant price estimate.

> ⚠️ **About the data in this repo.** `notebooks/data/house_prices.csv` in a fresh clone is a
> small **synthetic sample** (see `notebooks/data/make_synthetic_data.py`) that mimics the real
> Kaggle dataset's columns and messiness, so the whole pipeline can run out of the box. Swap in
> the real dataset before treating the results as meaningful — see [Download the dataset](#2-download-the-dataset).

## Overview

| | |
|---|---|
| **Problem** | Predict a property's sale price in INR from its location, size, and features |
| **Dataset** | [House Price by Juhi Bhojani](https://www.kaggle.com/datasets/juhibhojani/house-price) (Kaggle, ~187k Indian listings) |
| **Model** | scikit-learn `Pipeline` (imputer → scaler/one-hot encoder → regressor), picked automatically from Linear Regression / Random Forest / Gradient Boosting by lowest test-set RMSE |
| **Serving** | FastAPI, model loaded once at startup, `POST /predict` |
| **Client** | React + TypeScript + Vite, single form → result page |

## Architecture

```
┌─────────────────────┐        ┌──────────────────────┐        ┌───────────────────────┐
│   Jupyter Notebook   │        │     FastAPI Backend   │        │    React Frontend      │
│                      │        │                       │        │                        │
│  house_prices.csv    │        │  GET  /health         │        │  PredictionForm        │
│        │             │  .pkl  │  POST /predict        │  JSON  │        │               │
│  clean → EDA → train │───────▶│  loads pipeline once  │◀──────▶│  HomePage → ResultPage │
│        │             │        │  at startup           │        │                        │
│  house_price.pkl     │        │  (lifespan handler)   │        │  locations.json        │
│  locations.json      │        │                       │        │  (dropdown source)     │
└─────────────────────┘        └──────────────────────┘        └───────────────────────┘
```

The notebook exports a **full pipeline** (preprocessing + regressor bundled together), so the
backend never has to re-implement encoding logic — it just builds a one-row DataFrame with the
right column names and calls `.predict()`.

## Tech stack

- **Notebook:** Python 3.11, pandas, numpy, scikit-learn, matplotlib, seaborn, joblib
- **Backend:** FastAPI, Pydantic v2 / pydantic-settings, uvicorn, pytest + httpx
- **Frontend:** React 18, TypeScript, Vite, react-router-dom

## Project structure

```
house-price-project/
├── notebooks/
│   ├── house_price_model.ipynb   # cleaning, EDA, training, evaluation, export
│   ├── house_price.pkl           # exported pipeline (copy into backend/models/)
│   ├── locations.json            # exported location list (copy into frontend/src/)
│   └── data/
│       ├── house_prices.csv      # dataset (gitignored — synthetic sample by default)
│       └── make_synthetic_data.py
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app, CORS, model loaded at startup (lifespan)
│   │   ├── api/routes/prediction.py   # GET /health, POST /predict
│   │   ├── core/config.py             # Settings from .env (pydantic-settings)
│   │   ├── schemas/prediction.py      # PredictionRequest / PredictionResponse
│   │   ├── services/
│   │   │   ├── preprocessing.py       # request -> one-row DataFrame
│   │   │   └── inference.py           # load .pkl, run predict
│   │   └── utils/logging_config.py
│   ├── models/house_price.pkl
│   ├── tests/test_prediction.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── api/predictionClient.ts    # fetch wrapper, base URL from VITE_API_BASE_URL
│       ├── components/PredictionForm.tsx
│       ├── pages/HomePage.tsx | ResultPage.tsx | NotFoundPage.tsx
│       ├── types/prediction.ts        # TS types mirroring the backend schema
│       ├── locations.json             # copied from the notebook export
│       └── App.tsx                    # routes: / , /result , * (404)
├── .gitignore
└── README.md
```

## Setup

### 0. Prerequisites

| Tool | Minimum version |
|---|---|
| Python | 3.11 |
| Node.js + npm | 18 |
| Git | any recent |

### 1. Clone and enter the project

```bash
git clone https://github.com/<your-username>/house-price-app.git
cd house-price-app
```

### 2. Download the dataset

Get the real dataset before treating results as meaningful:

```bash
pip install kaggle
# Get an API token: Kaggle → Settings → API → "Create New Token"
# Place kaggle.json in ~/.kaggle/ (macOS/Linux) or C:\Users\<you>\.kaggle\ (Windows)
kaggle datasets download -d juhibhojani/house-price -p notebooks/data --unzip
```

This overwrites the synthetic `notebooks/data/house_prices.csv` with the real ~187k-row file.

### 3. Run the notebook

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install jupyter pandas numpy scikit-learn matplotlib seaborn joblib

cd notebooks
jupyter notebook house_price_model.ipynb
# Kernel → Restart & Run All
```

This produces `notebooks/house_price.pkl` and `notebooks/locations.json`. Copy them into place:

```bash
cp house_price.pkl ../backend/models/house_price.pkl
cp locations.json ../frontend/src/locations.json
```

### 4. Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

pytest                          # 4 tests: health, happy-path predict, 2x invalid-input 422
uvicorn app.main:app --reload   # http://localhost:8000/docs for Swagger UI
```

> **Version pinning:** a pickle only loads reliably with the same scikit-learn version used to
> train it. `requirements.txt` pins `scikit-learn==1.8.0` — update this to match `sklearn.__version__`
> printed at the end of the notebook if you train with a different version.

### 5. Run the frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                     # http://localhost:5173
```

With the backend on `:8000` and the frontend on `:5173`, open `http://localhost:5173`, fill in
the form, and submit to see a live prediction.

## Environment variables

**`backend/.env`**

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | `House Price Prediction API` | Shown in the OpenAPI docs |
| `MODEL_PATH` | `models/house_price.pkl` | Path to the exported pipeline |
| `LOCATIONS_PATH` | `../frontend/src/locations.json` | Used to map unrecognized locations to `"other"` |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed frontend origins (JSON array) |
| `LOG_LEVEL` | `INFO` | Python logging level |

**`frontend/.env`**

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend base URL used by `predictionClient.ts` |

## API reference

### `GET /health`

```bash
curl http://localhost:8000/health
```

```json
{ "status": "ok" }
```

### `POST /predict`

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Baner Pune",
    "carpet_area_sqft": 1200,
    "floor_num": 3,
    "bathroom": 2,
    "balcony": 1,
    "furnishing": "Semi-Furnished",
    "transaction": "Resale",
    "ownership": "Freehold",
    "facing": "East"
  }'
```

```json
{ "predicted_price": 14580974.17 }
```

Invalid input (e.g. `carpet_area_sqft <= 0` or a missing field) returns `422 Unprocessable Entity`
with a Pydantic validation error body.

## Model metrics

Measured on the held-out 20% test split, from `notebooks/house_price_model.ipynb`
(**synthetic sample data** — re-run the notebook after downloading the real dataset and update
this table with your real numbers):

| Model | MAE (₹) | RMSE (₹) | R² |
|---|---:|---:|---:|
| **Linear Regression** *(winner — lowest RMSE)* | 2,460,759 | 3,063,418 | 0.745 |
| Random Forest (log-target) | 2,444,914 | 3,163,316 | 0.728 |
| Random Forest | 2,538,497 | 3,530,935 | 0.661 |
| Gradient Boosting | 2,469,655 | 3,688,143 | 0.630 |
| 5-fold CV RMSE (winner) | — reported at the bottom of section 2.5 in the notebook | | |

The notebook selects the winner **programmatically** by lowest test RMSE, so this table (and the
exported `.pkl`) will reflect whichever model actually wins once you swap in the real dataset —
don't assume it stays Linear Regression.

## Screenshots

*(Add screenshots of the running app here — the form on `HomePage` and the estimate on
`ResultPage` — before submitting.)*

## Common mistakes to avoid

- Committing `.env` or the raw dataset CSV
- A notebook that only runs in its original cell order (always test with *Restart & Run All*)
- scikit-learn version mismatch between the notebook and `backend/requirements.txt`
- Hard-coding `http://localhost:8000` in frontend components instead of `VITE_API_BASE_URL`
- Reporting training-set metrics instead of test-set metrics
