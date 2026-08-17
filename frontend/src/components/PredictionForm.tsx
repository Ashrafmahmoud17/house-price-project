import { useEffect, useState, type FormEvent } from "react";
import locationsData from "../locations.json";
import type { PredictionRequest } from "../types/prediction";

export interface FormValues {
  location: string;
  carpetAreaSqft: string;
  floorNum: string;
  bathroom: string;
  balcony: string;
  furnishing: PredictionRequest["furnishing"];
  transaction: PredictionRequest["transaction"];
  ownership: string;
  facing: string;
}

const FURNISHING_OPTIONS: PredictionRequest["furnishing"][] = [
  "Unfurnished",
  "Semi-Furnished",
  "Furnished",
];

const TRANSACTION_OPTIONS: PredictionRequest["transaction"][] = [
  "Resale",
  "New Property",
];

const OWNERSHIP_OPTIONS = [
  "Freehold",
  "Leasehold",
  "Co-operative Society",
  "Power Of Attorney",
];

const FACING_OPTIONS = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

const locations = [...(locationsData as string[])].sort();

const emptyForm: FormValues = {
  location: locations[0] ?? "",
  carpetAreaSqft: "",
  floorNum: "",
  bathroom: "",
  balcony: "",
  furnishing: "Semi-Furnished",
  transaction: "Resale",
  ownership: OWNERSHIP_OPTIONS[0],
  facing: FACING_OPTIONS[0],
};

interface Props {
  onSubmit: (payload: PredictionRequest) => void;
  isLoading: boolean;
}

export default function PredictionForm({ onSubmit, isLoading }: Props) {
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    // keep default location valid even if locations.json is regenerated later
    if (!values.location && locations.length > 0) {
      setValues((v) => ({ ...v, location: locations[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormValues, string>> = {};

    if (!values.location) next.location = "Please choose a location.";

    const area = Number(values.carpetAreaSqft);
    if (!values.carpetAreaSqft || Number.isNaN(area) || area <= 0) {
      next.carpetAreaSqft = "Enter a carpet area greater than 0.";
    }

    const floor = Number(values.floorNum);
    if (values.floorNum === "" || Number.isNaN(floor)) {
      next.floorNum = "Enter a floor number (0 for ground).";
    }

    const bathroom = Number(values.bathroom);
    if (values.bathroom === "" || Number.isNaN(bathroom) || bathroom < 0) {
      next.bathroom = "Enter the number of bathrooms.";
    }

    const balcony = Number(values.balcony);
    if (values.balcony === "" || Number.isNaN(balcony) || balcony < 0) {
      next.balcony = "Enter the number of balconies (0 if none).";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      location: values.location,
      carpet_area_sqft: Number(values.carpetAreaSqft),
      floor_num: Number(values.floorNum),
      bathroom: Number(values.bathroom),
      balcony: Number(values.balcony),
      furnishing: values.furnishing,
      transaction: values.transaction,
      ownership: values.ownership,
      facing: values.facing,
    });
  }

  return (
    <form className="prediction-form" onSubmit={handleSubmit} noValidate>
      <div className="field-grid">
        <label className="field">
          <span className="field-label">Location</span>
          <select
            value={values.location}
            onChange={(e) => updateField("location", e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          {errors.location && <span className="field-error">{errors.location}</span>}
        </label>

        <label className="field">
          <span className="field-label">Carpet area (sqft)</span>
          <input
            type="number"
            min={1}
            step="any"
            placeholder="e.g. 1200"
            value={values.carpetAreaSqft}
            onChange={(e) => updateField("carpetAreaSqft", e.target.value)}
          />
          {errors.carpetAreaSqft && (
            <span className="field-error">{errors.carpetAreaSqft}</span>
          )}
        </label>

        <label className="field">
          <span className="field-label">Floor number</span>
          <input
            type="number"
            step="1"
            placeholder="0 for ground"
            value={values.floorNum}
            onChange={(e) => updateField("floorNum", e.target.value)}
          />
          {errors.floorNum && <span className="field-error">{errors.floorNum}</span>}
        </label>

        <label className="field">
          <span className="field-label">Bathrooms</span>
          <input
            type="number"
            min={0}
            step="1"
            value={values.bathroom}
            onChange={(e) => updateField("bathroom", e.target.value)}
          />
          {errors.bathroom && <span className="field-error">{errors.bathroom}</span>}
        </label>

        <label className="field">
          <span className="field-label">Balconies</span>
          <input
            type="number"
            min={0}
            step="1"
            value={values.balcony}
            onChange={(e) => updateField("balcony", e.target.value)}
          />
          {errors.balcony && <span className="field-error">{errors.balcony}</span>}
        </label>

        <label className="field">
          <span className="field-label">Furnishing</span>
          <select
            value={values.furnishing}
            onChange={(e) =>
              updateField("furnishing", e.target.value as FormValues["furnishing"])
            }
          >
            {FURNISHING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Transaction</span>
          <select
            value={values.transaction}
            onChange={(e) =>
              updateField("transaction", e.target.value as FormValues["transaction"])
            }
          >
            {TRANSACTION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Ownership</span>
          <select
            value={values.ownership}
            onChange={(e) => updateField("ownership", e.target.value)}
          >
            {OWNERSHIP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Facing</span>
          <select
            value={values.facing}
            onChange={(e) => updateField("facing", e.target.value)}
          >
            {FACING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? "Valuing property…" : "Estimate price"}
      </button>
    </form>
  );
}
