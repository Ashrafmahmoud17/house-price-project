import { Link, Navigate, useLocation } from "react-router-dom";
import type { PredictionRequest } from "../types/prediction";

interface ResultState {
  predictedPrice: number;
  payload: PredictionRequest;
}

function formatIndianPrice(value: number): string {
  if (value >= 1e7) return `₹ ${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹ ${(value / 1e5).toFixed(1)} Lac`;
  return `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function ResultPage() {
  const location = useLocation();
  const state = location.state as ResultState | null;

  // Guard against someone landing here directly without a prediction in hand.
  if (!state || typeof state.predictedPrice !== "number") {
    return <Navigate to="/" replace />;
  }

  const { predictedPrice, payload } = state;

  return (
    <div className="app-shell">
      <header className="masthead">
        <p className="eyebrow">Estimate Complete</p>
        <h1>Your Property Valuation</h1>
      </header>

      <section className="card result-card">
        <div className="valuation-stamp">
          <span className="stamp-label">Estimated Value</span>
          <span className="stamp-amount">{formatIndianPrice(predictedPrice)}</span>
        </div>

        <p className="result-summary">
          {payload.carpet_area_sqft.toLocaleString("en-IN")} sqft · {payload.location} ·{" "}
          {payload.bathroom} bath · {payload.furnishing}
        </p>

        <div className="result-actions">
          <Link to="/" className="secondary-link">
            Estimate another property
          </Link>
        </div>
      </section>
    </div>
  );
}
