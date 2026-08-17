import type { PredictionRequest, PredictionResponse } from "../types/prediction";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class PredictionApiError extends Error {}

export async function getPrediction(
  payload: PredictionRequest,
): Promise<PredictionResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new PredictionApiError(
      "Couldn't reach the prediction service. Check that the backend is running.",
    );
  }

  if (!response.ok) {
    let detail = `Prediction failed (status ${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // ignore parse errors, keep the generic message
    }
    throw new PredictionApiError(detail);
  }

  return (await response.json()) as PredictionResponse;
}
