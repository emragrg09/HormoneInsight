// Unified API service. Reads VITE_USE_MOCK_API and VITE_API_BASE_URL.
// Page components must import from here — never call mockApi directly.

import type {
  FeatureSchema,
  HealthResponse,
  ModelInfo,
  PredictRequest,
  PredictResponse,
  SampleParticipant,
} from "@/types/api";
import {
  mockGetModelInfo,
  mockGetSample,
  mockGetSchema,
  mockHealth,
  mockPredict,
} from "./mockApi";

const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK_API ?? "true").toString().toLowerCase() !== "false";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").toString().replace(/\/+$/, "");

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new ApiRequestError(
      "VITE_API_BASE_URL is not configured. Set it in your .env or enable VITE_USE_MOCK_API=true.",
    );
  }
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
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiRequestError(
      `Request failed (${res.status}).`,
      res.status,
      details,
    );
  }
  return (await res.json()) as T;
}

export const api = {
  isMock: USE_MOCK,

  health(): Promise<HealthResponse> {
    return USE_MOCK ? mockHealth() : request("/api/v1/health");
  },
  getFeatureSchema(): Promise<FeatureSchema> {
    return USE_MOCK ? mockGetSchema() : request("/api/v1/feature-schema");
  },
  getModelInfo(): Promise<ModelInfo> {
    return USE_MOCK ? mockGetModelInfo() : request("/api/v1/model-info");
  },
  getSampleParticipant(): Promise<SampleParticipant> {
    return USE_MOCK ? mockGetSample() : request("/api/v1/sample-participant");
  },
  predict(body: PredictRequest): Promise<PredictResponse> {
    return USE_MOCK
      ? mockPredict(body)
      : request("/api/v1/predict", {
          method: "POST",
          body: JSON.stringify(body),
        });
  },
};

export type Api = typeof api;
