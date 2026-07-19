# Frontend Integration Handoff

Backend title: **Menopause-related menstrual-change model estimate**

This backend is for a women-facing research prototype. The target is whether an NHANES participant self-reported "menopause/change of life" as the reason for not having regular periods. This is not clinically confirmed menopause, not a clinical diagnosis, and not a validated clinical risk score.

## 1. Start Command

```powershell
python -m uvicorn api.main:app --reload --port 8001
```

If artifacts need to be regenerated first:

```powershell
python src\baseline.py
```

## 2. Base URL

```text
http://127.0.0.1:8001
```

## 3. Swagger URL

```text
http://127.0.0.1:8001/docs
```

## 4. Frontend-Facing Endpoints

- `GET /api/v1/health`
- `GET /api/v1/feature-schema`
- `GET /api/v1/model-info`
- `GET /api/v1/sample-participant`
- `POST /api/v1/predict`

Optional legacy endpoints exist but should not be used by the Lovable frontend:

- `GET /api/v1/model/schema`
- `POST /api/v1/predict/personal`
- `POST /api/v1/predict/researcher`
- `POST /api/v1/predict/batch`

## 5. Exact Captured Success Responses

These files were captured from the running API. For Lovable, use `http://127.0.0.1:8001`.

- `GET /api/v1/health`: `handoff_api_responses/health.json`
- `GET /api/v1/feature-schema`: `handoff_api_responses/feature-schema.json`
- `GET /api/v1/model-info`: `handoff_api_responses/model-info.json`
- `GET /api/v1/sample-participant`: `handoff_api_responses/sample-participant.json`
- `POST /api/v1/predict` request: `handoff_api_responses/predict-request.json`
- `POST /api/v1/predict` response: `handoff_api_responses/predict-response.json`

## 6. Valid POST Request Body

Use the exact file:

```text
handoff_api_responses/predict-request.json
```

Shape:

```json
{
  "features": {
    "RIDAGEYR": 52,
    "RIDRETH3": 3,
    "DMDEDUC2": 4,
    "DMDMARTZ": 1,
    "INDFMPIR": 2.5,
    "RIDEXPRG": 2,
    "RHQ010": 12,
    "RHQ078": 2,
    "RHQ131": 1,
    "RHD167": 2,
    "RHQ200": 1,
    "RHD280": 2,
    "RHQ305": 2,
    "BMXWT": 74.0,
    "BMXHT": 164.0,
    "BMXBMI": 27.5,
    "BMXWAIST": 91.0,
    "BMXHIP": 103.0,
    "LBXPG4": 0.4,
    "LBXSHBG": 48.0,
    "LBXTST": 21.0,
    "LBXGLU": 96.0,
    "LBXGH": 5.5,
    "LBDHDD": 58.0,
    "LBXTC": 190.0,
    "URXPREG": 2
  },
  "include_explainability": true
}
```

Features not included are treated as missing. Missing values are handled by saved training-split preprocessing, not converted to zero.

## 7. Exact Successful Prediction Response

Use the exact file:

```text
handoff_api_responses/predict-response.json
```

Important frontend display fields:

- `title`
- `positive_class_probability`
- `likelihood_band`
- `plain_language_explanation`
- `non_diagnostic_explanation`
- `main_factors.top_positive_contributions`
- `main_factors.top_negative_contributions`

## 8. Validation And Error Response Formats

Captured examples:

- Missing required `features`: `handoff_api_responses/error-missing-body.json`
- Unknown feature: `handoff_api_responses/error-unknown-feature.json`
- Invalid numeric value: `handoff_api_responses/error-invalid-number.json`
- Invalid category: `handoff_api_responses/error-invalid-category.json`

Implemented formats:

```ts
type PydanticValidationError = {
  detail: Array<{
    type: string;
    loc: Array<string | number>;
    msg: string;
    input?: unknown;
  }>;
};

type InferenceValidationError = {
  detail: string;
};

type ModelNotLoadedError = {
  detail: {
    error: "model_not_loaded";
    message: string;
  };
};
```

All captured validation errors currently return HTTP `422`. Model-not-loaded returns HTTP `503`.

## 9. Feature Value Types

All feature values accepted by `/api/v1/predict` must be:

- number
- numeric string, although the frontend should send numbers
- `null`
- omitted

Do not send booleans for model features. Categorical fields must be sent as encoded numeric category values, not labels.

Request fields:

- `features`: required object
- `include_explainability`: optional boolean; default is `true`

## 10. Required, Optional, Derived, Hidden

Required request fields:

- `features`

Optional request fields:

- `include_explainability`
- every individual model feature inside `features`

Derived response fields:

- `positive_class_probability`
- `likelihood_band`
- `classification_threshold`
- `predicted_class`
- `plain_language_explanation`
- `main_factors`

Hidden from user:

- model weights
- bias/intercept
- transformed feature order
- scaling means/stds
- imputation values
- category dummy columns
- raw NHANES codes unless needed for transparent advanced help text

## 11. Allowed Categorical Values

These are the exact saved categories returned by `/api/v1/feature-schema`.

```json
{
  "RIDRETH3": ["1", "2", "3", "4", "6", "7", "missing"],
  "DMDEDUC2": ["1", "2", "3", "4", "5", "missing"],
  "DMDMARTZ": ["1", "2", "3", "missing"],
  "RIDEXPRG": ["1", "2", "missing"],
  "RHQ078": ["1", "2", "missing"],
  "RHQ131": ["1", "2", "missing"],
  "RHQ200": ["1", "2", "missing"],
  "RHD280": ["1", "2", "missing"],
  "RHQ305": ["1", "2", "missing"],
  "URXPREG": ["1", "2", "missing"]
}
```

Frontend should display friendly labels but submit these encoded values.

## 12. Units

The current API does not expose units. Use these frontend display units for numeric fields.

Survey/body-measure features:

| Feature | Unit |
| --- | --- |
| RIDAGEYR | years |
| INDFMPIR | ratio |
| RHQ010 | years |
| RHD167 | count |
| BMXWT | kg |
| BMXHT | cm |
| BMXBMI | kg/m^2 |
| BMXLEG | cm |
| BMXARML | cm |
| BMXARMC | cm |
| BMXWAIST | cm |
| BMXHIP | cm |

Sex steroid hormone panel:

| Feature | Unit |
| --- | --- |
| LBXAND | ng/dL |
| LBXAMH | ng/mL |
| LBXDHE | ug/dL |
| LBXEST | pg/mL |
| LBXESO | ng/dL |
| LBXPG4 | ng/dL |
| LBXSHBG | nmol/L |
| LBXTST | ng/dL |

Metabolic, inflammation, biochemistry, and lipids:

| Feature | Unit |
| --- | --- |
| LBXIN | uU/mL |
| LBXGLU | mg/dL |
| LBXGH | percent |
| LBXHSCRP | mg/L |
| LBXSAL | g/dL |
| LBXSAPSI | U/L |
| LBXSASSI | U/L |
| LBXSATSI | U/L |
| LBXSBU | mg/dL |
| LBXSCA | mg/dL |
| LBXSCR | mg/dL |
| LBXSGL | mg/dL |
| LBXSIR | ug/dL |
| LBXSTB | mg/dL |
| LBXSTP | g/dL |
| LBXSTR | mg/dL |
| LBXSUA | mg/dL |
| LBDHDD | mg/dL |
| LBXTC | mg/dL |
| LBXTLG | mg/dL |
| LBDLDL | mg/dL |

Categorical features do not have units.

## 13. CORS

Currently allowed origins:

```text
*
```

Confirmed response header with an `Origin` request:

```text
access-control-allow-origin: *
```

## 14. Frontend Environment Variables

Recommended Lovable env var:

```text
VITE_API_BASE_URL=http://127.0.0.1:8001
```

No frontend API key is required by the current backend.

## 15. TypeScript Interfaces

```ts
export type LikelihoodBandName = "lower" | "moderate" | "higher";

export type FeatureValue = number | string | null;

export type FeatureMap = Record<string, FeatureValue>;

export interface HealthResponse {
  status: "ok" | "degraded";
  model_loaded: boolean;
  model_version: string;
  load_error: string | null;
}

export interface FeatureMetadata {
  label?: string;
  description?: string;
  type?: "numeric" | "categorical";
  source?: string;
  missing_codes?: number[];
  name: string;
  required: boolean;
  accepts_null: boolean;
}

export interface FeatureSchemaResponse {
  model_version: string;
  title: string;
  raw_feature_order: string[];
  numeric_features: string[];
  categorical_features: string[];
  category_mappings: Record<string, string[]>;
  features: FeatureMetadata[];
  classification_threshold: number;
  missing_value_policy: string;
  privacy_note: string;
  non_diagnostic_explanation: string;
}

export interface ModelInfoResponse {
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
  likelihood_bands: LikelihoodBand[];
  limitations: string[];
  privacy_note: string;
  non_diagnostic_explanation: string;
}

export interface SampleParticipantResponse {
  description: string;
  features: FeatureMap;
  privacy_note: string;
}

export interface PredictRequest {
  features: FeatureMap;
  include_explainability?: boolean;
}

export interface LikelihoodBand {
  band: LikelihoodBandName;
  min_probability: number;
  max_probability: number;
  label: string;
}

export interface Contribution {
  feature: string;
  raw_feature: string;
  label: string;
  original_value: number | string | null;
  transformed_value: number;
  contribution: number;
  wording: "contributed to the model score";
  interpretation:
    | "associated with a higher model estimate"
    | "associated with a lower model estimate";
}

export interface PredictResponse {
  title: "Menopause-related menstrual-change model estimate";
  model_version: string;
  positive_class_probability: number;
  likelihood_band: LikelihoodBand;
  classification_threshold: number;
  predicted_class: 0 | 1;
  target: string;
  plain_language_explanation: string;
  non_diagnostic_explanation: string;
  main_factors: {
    top_positive_contributions: Contribution[];
    top_negative_contributions: Contribution[];
  };
  privacy_note: string;
}

export type ApiError =
  | { detail: string }
  | {
      detail: Array<{
        type: string;
        loc: Array<string | number>;
        msg: string;
        input?: unknown;
      }>;
    }
  | {
      detail: {
        error: "model_not_loaded";
        message: string;
      };
    };
```

## 16. Copy-Paste Prompt For Lovable

Build a polished women-facing React app called "Menopause-related menstrual-change model estimate." Connect it to `VITE_API_BASE_URL`, defaulting to `http://127.0.0.1:8001`. Use `GET /api/v1/feature-schema` to render a clear questionnaire, `GET /api/v1/sample-participant` for a "Load sample profile" button, `POST /api/v1/predict` to get the model estimate, and `GET /api/v1/model-info` for dataset/model/limitations content. Show the positive-class probability, lower/moderate/higher likelihood band, plain-language non-diagnostic explanation, and factors that contributed to increasing or decreasing the model score. Do not call it a diagnosis, clinical risk score, or clinically confirmed menopause. Do not provide treatment or medication recommendations. Use the exact title "Menopause-related menstrual-change model estimate."
