import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PredictionForm from "../components/PredictionForm";
import { getPrediction, PredictionApiError } from "../api/predictionClient";
import type { PredictionRequest } from "../types/prediction";

export default function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(payload: PredictionRequest) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPrediction(payload);
      navigate("/result", { state: { predictedPrice: result.predicted_price, payload } });
    } catch (err) {
      const message =
        err instanceof PredictionApiError
          ? err.message
          : "Something went wrong while getting your estimate. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="masthead">
        <p className="eyebrow">Property Valuation</p>
        <h1>House Price Predictor</h1>
        <p>
          Enter the property's details below and get an estimated market price from a model
          trained on real listings.
        </p>
      </header>

      <section className="card">
        {error && <div className="form-error">{error}</div>}
        <PredictionForm onSubmit={handleSubmit} isLoading={isLoading} />
      </section>
    </div>
  );
}
