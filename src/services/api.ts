// Unified API client for the FastAPI backend described in FRONTEND_HANDOFF.md.
// Page components import from here — never call fetch directly.
//
// This module also adapts the backend response shapes to the internal
// frontend types in `@/types/api` so existing UI components keep working
// without changes.

import type {
  Contribution,
  FeatureField,
  FeatureSchema,
  FeatureSection,
  HealthResponse,
  LikelihoodBand,
  ModelInfo,
  PredictRequest,
  PredictResponse,
  SampleParticipant,
} from "@/types/api";
import {
  FEATURE_META,
  SECTIONS,
  getCategoricalLabel,
  getFeatureLabel,
} from "@/lib/feature-metadata";

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8001"
)
  .toString()
  .replace(/\/+$/, "");

// ---------- Backend response types (mirroring the handoff) ----------

type LikelihoodBandName = "lower" | "moderate" | "higher";

interface BackendHealth {
  status: "ok" | "degraded";
  model_loaded: boolean;
  model_version: string;
  load_error: string | null;
}

interface BackendFeatureMetadata {
  name: string;
  required: boolean;
  accepts_null: boolean;
  label?: string;
  description?: string;
  type?: "numeric" | "categorical";
  source?: string;
  missing_codes?: number[];
}

interface BackendFeatureSchema {
  model_version: string;
  title: string;
  raw_feature_order: string[];
  numeric_features: string[];
  categorical_features: string[];
  category_mappings: Record<string, string[]>;
  features: BackendFeatureMetadata[];
  classification_threshold: number;
  missing_value_policy: string;
  privacy_note: string;
  non_diagnostic_explanation: string;
}

interface BackendModelInfo {
  model_version: string;
  title: string;
  model_type: string;
  implementation: string;
  target: {
    plain_language: string;
    positive_definition: string;
    negative_definition: string;
    not_clinically_confirmed: boolean;
  };
  dataset: {
    name: string;
    merged_modules: string[];
    join_key: string;
  };
  performance: Record<string, unknown>;
  likelihood_bands: unknown[];
  limitations: string[];
  privacy_note: string;
  non_diagnostic_explanation: string;
}

interface BackendSampleParticipant {
  description: string;
  features: Record<string, number | string | null>;
  privacy_note: string;
}

interface BackendContribution {
  feature: string;
  raw_feature: string;
  label: string;
  original_value: number | string | null;
  transformed_value: number;
  contribution: number;
  wording: string;
  interpretation: string;
}

interface BackendPredictResponse {
  title: string;
  model_version: string;
  positive_class_probability: number;
  likelihood_band: {
    band: LikelihoodBandName;
    min_probability: number;
    max_probability: number;
    label: string;
  };
  classification_threshold: number;
  predicted_class: 0 | 1;
  target: string;
  plain_language_explanation: string;
  non_diagnostic_explanation: string;
  main_factors: {
    top_positive_contributions: BackendContribution[];
    top_negative_contributions: BackendContribution[];
  };
  privacy_note: string;
}

// ---------- Errors ----------

export class ApiRequestError extends Error {
  status?: number;
  details?: unknown;
  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

function formatBackendError(status: number, body: unknown): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((e) => {
          if (e && typeof e === "object") {
            const loc = Array.isArray((e as { loc?: unknown }).loc)
              ? ((e as { loc: unknown[] }).loc as unknown[])
                  .filter((s) => s !== "body" && s !== "features")
                  .join(".")
              : "";
            const msg = (e as { msg?: string }).msg ?? "Invalid value";
            return loc ? `${loc}: ${msg}` : msg;
          }
          return String(e);
        })
        .join("; ");
    }
    if (detail && typeof detail === "object") {
      const d = detail as { error?: string; message?: string };
      if (d.error === "model_not_loaded") {
        return (
          d.message ??
          "The model is not loaded on the backend yet. Please try again shortly."
        );
      }
      if (d.message) return d.message;
    }
  }
  return `Request failed (${status}).`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    throw new ApiRequestError(
      "Could not reach the backend. Please check your connection and try again.",
      undefined,
      err,
    );
  }
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiRequestError(formatBackendError(res.status, body), res.status, body);
  }
  return (await res.json()) as T;
}

// ---------- Adapters: backend → internal frontend types ----------

function adaptFeatureSchema(be: BackendFeatureSchema): FeatureSchema {
  const numericSet = new Set(be.numeric_features);
  const categoricalSet = new Set(be.categorical_features);
  const byName = new Map(be.features.map((f) => [f.name, f]));
  const seen = new Set<string>();

  function buildField(code: string): FeatureField | null {
    const meta = byName.get(code);
    if (!meta) return null;
    const displayMeta = FEATURE_META[code];
    const label = meta.label || displayMeta?.label || code;
    const description = meta.description || displayMeta?.description;

    if (categoricalSet.has(code)) {
      const allowed = be.category_mappings[code] ?? [];
      const options = allowed
        .filter((v) => v !== "missing")
        .map((v) => ({ value: v, label: getCategoricalLabel(code, v) }));
      // Use radio for small option sets, select otherwise.
      const type: FeatureField["type"] = options.length <= 3 ? "radio" : "select";
      return {
        name: code,
        label,
        type,
        required: meta.required,
        description,
        options,
      };
    }

    if (numericSet.has(code)) {
      return {
        name: code,
        label,
        type: "number",
        required: meta.required,
        unit: displayMeta?.unit,
        description,
        min: displayMeta?.min,
        max: displayMeta?.max,
        step: displayMeta?.step ?? 0.1,
      };
    }

    return {
      name: code,
      label,
      type: "text",
      required: meta.required,
      description,
    };
  }

  const sections: FeatureSection[] = [];
  for (const s of SECTIONS) {
    const fields: FeatureField[] = [];
    for (const code of s.features) {
      if (!byName.has(code)) continue;
      const f = buildField(code);
      if (f) {
        fields.push(f);
        seen.add(code);
      }
    }
    if (fields.length) {
      sections.push({
        id: s.id,
        title: s.title,
        description: s.description,
        fields,
      });
    }
  }

  // Any backend features not explicitly grouped get a fallback section
  // so the schema stays complete if the backend adds new codes.
  const extras: FeatureField[] = [];
  for (const code of be.raw_feature_order) {
    if (seen.has(code)) continue;
    const f = buildField(code);
    if (f) extras.push(f);
  }
  if (extras.length) {
    sections.push({
      id: "additional",
      title: "Additional Information",
      fields: extras,
    });
  }

  return { version: be.model_version, sections };
}

function adaptModelInfo(be: BackendModelInfo): ModelInfo {
  const perf = be.performance ?? {};
  const num = (k: string): number | null => {
    const v = (perf as Record<string, unknown>)[k];
    return typeof v === "number" ? v : null;
  };
  return {
    name: be.title,
    task: be.target.plain_language,
    algorithm: be.implementation || be.model_type,
    dataset: be.dataset.name,
    modules: be.dataset.merged_modules ?? [],
    target_description: be.target.positive_definition,
    metrics: {
      accuracy: num("accuracy"),
      precision: num("precision"),
      recall: num("recall"),
      f1: num("f1") ?? num("f1_score"),
      roc_auc: num("roc_auc") ?? num("auc"),
    },
  };
}

function adaptContribution(c: BackendContribution): Contribution {
  return {
    feature_name: c.feature,
    label: c.label || getFeatureLabel(c.raw_feature ?? c.feature, c.feature),
    original_value:
      c.raw_feature && FEATURE_META[c.raw_feature]?.categoricalLabels && c.original_value != null
        ? getCategoricalLabel(c.raw_feature, c.original_value)
        : c.original_value,
    contribution: c.contribution,
  };
}

function adaptPredict(be: BackendPredictResponse): PredictResponse {
  const band: LikelihoodBand = be.likelihood_band?.band ?? "moderate";
  return {
    probability: be.positive_class_probability,
    predicted_class: be.predicted_class,
    threshold: be.classification_threshold,
    likelihood_band: band,
    top_positive_contributions: (be.main_factors?.top_positive_contributions ?? []).map(
      adaptContribution,
    ),
    top_negative_contributions: (be.main_factors?.top_negative_contributions ?? []).map(
      adaptContribution,
    ),
    explanation: be.plain_language_explanation,
    disclaimer: be.non_diagnostic_explanation,
  };
}

function adaptSample(be: BackendSampleParticipant): SampleParticipant {
  // Backend returns encoded categorical values (numbers). The form's
  // select/radio components use string values, so coerce categoricals to
  // strings while leaving numeric fields as numbers.
  const features: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(be.features)) {
    if (v === null || v === undefined) continue;
    features[k] = FEATURE_META[k]?.categoricalLabels ? String(v) : v;
  }
  return { features };
}

// Convert form values to the backend request shape.
// - drops null/empty
// - coerces numeric strings to numbers (backend prefers numbers)
function buildPredictBody(req: PredictRequest): { features: Record<string, number | string | null>; include_explainability: boolean } {
  const out: Record<string, number | string | null> = {};
  for (const [k, v] of Object.entries(req.features)) {
    if (v === null || v === undefined || v === "") continue;
    if (typeof v === "number") {
      out[k] = v;
    } else {
      const s = String(v).trim();
      if (s === "") continue;
      const n = Number(s);
      out[k] = Number.isFinite(n) && s !== "" && /^-?\d+(\.\d+)?$/.test(s) ? n : s;
    }
  }
  return { features: out, include_explainability: true };
}

// ---------- Public API ----------

export const api = {
  isMock: false as const,

  async health(): Promise<HealthResponse> {
    const be = await request<BackendHealth>("/api/v1/health");
    return { status: be.status, version: be.model_version };
  },

  async getFeatureSchema(): Promise<FeatureSchema> {
    const be = await request<BackendFeatureSchema>("/api/v1/feature-schema");
    return adaptFeatureSchema(be);
  },

  async getModelInfo(): Promise<ModelInfo> {
    const be = await request<BackendModelInfo>("/api/v1/model-info");
    return adaptModelInfo(be);
  },

  async getSampleParticipant(): Promise<SampleParticipant> {
    const be = await request<BackendSampleParticipant>("/api/v1/sample-participant");
    return adaptSample(be);
  },

  async predict(body: PredictRequest): Promise<PredictResponse> {
    const be = await request<BackendPredictResponse>("/api/v1/predict", {
      method: "POST",
      body: JSON.stringify(buildPredictBody(body)),
    });
    return adaptPredict(be);
  },
};

export type Api = typeof api;
