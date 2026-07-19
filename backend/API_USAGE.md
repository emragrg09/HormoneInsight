# Lovable Frontend API Contract

Backend title: **Menopause-related menstrual-change model estimate**

This backend serves a women-facing research prototype. The target is whether an NHANES participant self-reported "menopause/change of life" as the reason for not having regular periods. This is not clinically confirmed menopause, not a diagnosis, and not a validated clinical risk score.

## Train And Save Artifacts

Run this after changing model code, features, or raw data:

```powershell
python src\baseline.py
```

Generated artifacts:

- `models/nhanes-menopause-logreg-v1.npz`
- `models/nhanes-menopause-logreg-v1.json`

## Start FastAPI

```powershell
python -m uvicorn api.main:app --reload --port 8001
```

Swagger UI:

```text
http://127.0.0.1:8001/docs
```

## Prioritized Endpoints

### `GET /api/v1/health`

Response:

```json
{
  "status": "ok",
  "model_loaded": true,
  "model_version": "nhanes-menopause-logreg-v1",
  "load_error": null
}
```

### `GET /api/v1/feature-schema`

Use this to render the questionnaire.

Important fields:

- `raw_feature_order`: exact feature order expected by the model
- `numeric_features`: numeric fields
- `categorical_features`: coded categorical fields
- `category_mappings`: allowed categorical values
- `features`: label, type, source, missing-code metadata
- `missing_value_policy`: how omitted/null values are handled

### `GET /api/v1/model-info`

Use this for the app's "About this model" and limitations view.

Includes:

- dataset modules
- target definition
- model type
- performance metrics
- likelihood-band definitions
- limitations and responsible-use wording

### `GET /api/v1/sample-participant`

Use this for the "Load sample profile" button.

Response shape:

```json
{
  "description": "Synthetic demonstration profile for the Lovable frontend. It is not a real participant.",
  "features": {
    "RIDAGEYR": 52,
    "BMXBMI": 27.5
  },
  "privacy_note": "..."
}
```

The real response includes every model feature. Some values may be `null`.

### `POST /api/v1/predict`

Request:

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

Features may be omitted or set to `null`; the saved training-split preprocessing handles missing values. Missing values are not silently converted to zero.

Response:

```json
{
  "title": "Menopause-related menstrual-change model estimate",
  "model_version": "nhanes-menopause-logreg-v1",
  "positive_class_probability": 0.734,
  "likelihood_band": {
    "band": "higher",
    "min_probability": 0.66,
    "max_probability": 1.0,
    "label": "Higher model-estimated likelihood"
  },
  "classification_threshold": 0.52,
  "predicted_class": 1,
  "target": "Whether an NHANES participant self-reported menopause/change of life as the reason for not having regular periods.",
  "plain_language_explanation": "...not clinically confirmed menopause, not a diagnosis...",
  "non_diagnostic_explanation": "...",
  "main_factors": {
    "top_positive_contributions": [],
    "top_negative_contributions": []
  },
  "privacy_note": "..."
}
```

## Frontend Guidance

The app should:

- Render a clear questionnaire from `/api/v1/feature-schema`.
- Offer a "Load sample profile" action from `/api/v1/sample-participant`.
- Submit to `/api/v1/predict`.
- Display probability as a model estimate, not a diagnosis.
- Display likelihood band as lower, moderate, or higher.
- Say features "contributed to the model score."
- Avoid treatment, medication, or diagnosis wording.

Optional legacy endpoints exist for batch/research use, but they are not part of the women-facing Lovable scope.
