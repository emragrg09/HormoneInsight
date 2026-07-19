// Shared API types for Hormone Insight.
// These mirror the FastAPI backend contract so mock and real services are swappable.

export type FieldType = "number" | "text" | "select" | "radio";

export interface FeatureFieldOption {
  value: string;
  label: string;
}

export interface FeatureField {
  name: string;
  label: string;
  code?: string;
  type: FieldType;
  required: boolean;
  unit?: string;
  description?: string;
  options?: FeatureFieldOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface FeatureSection {
  id: string;
  title: string;
  description?: string;
  fields: FeatureField[];
}

export interface FeatureSchema {
  version: string;
  sections: FeatureSection[];
}

export interface ModelInfo {
  name: string;
  task: string;
  algorithm: string;
  dataset: string;
  modules: string[];
  target_description: string;
  metrics: {
    accuracy: number | null;
    precision: number | null;
    recall: number | null;
    f1: number | null;
    roc_auc: number | null;
  };
}

export interface SampleParticipant {
  features: Record<string, string | number | null>;
}

export interface PredictRequest {
  features: Record<string, string | number | null>;
}

export interface Contribution {
  feature_name: string;
  label: string;
  code?: string;
  original_value: string | number | null;
  contribution: number;
}

export type LikelihoodBand = "lower" | "moderate" | "higher";

export interface PredictResponse {
  probability: number;
  predicted_class: 0 | 1;
  threshold: number;
  likelihood_band: LikelihoodBand;
  top_positive_contributions: Contribution[];
  top_negative_contributions: Contribution[];
  explanation: string;
  disclaimer: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  version?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}
