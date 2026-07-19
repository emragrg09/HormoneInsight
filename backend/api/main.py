from __future__ import annotations

from typing import Any

try:
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field
except ModuleNotFoundError as exc:  # pragma: no cover
    raise RuntimeError(
        "FastAPI dependencies are missing. Install them with: pip install -r requirements.txt"
    ) from exc

from src.feature_schema import MODEL_VERSION
from src.inference import InferenceError, MenopauseInferenceService


class PredictionRequest(BaseModel):
    features: dict[str, Any] = Field(
        ...,
        description="Raw NHANES feature values keyed by feature name. Missing values may be null.",
    )
    include_explainability: bool = True


class BatchPredictionRequest(BaseModel):
    rows: list[dict[str, Any]]
    include_explainability: bool = False


app = FastAPI(
    title="Menopause-related menstrual-change model estimate API",
    version=MODEL_VERSION,
    description=(
        "Women-facing API for a research model estimating whether inputs resemble "
        "NHANES participants who self-reported menopause/change of life as the "
        "reason for not having regular periods. Not for diagnosis."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

_service: MenopauseInferenceService | None = None
_load_error: str | None = None


NON_DIAGNOSTIC_EXPLANATION = (
    "This result is a model estimate for the benchmark target: whether an NHANES "
    "participant self-reported menopause/change of life as the reason for not "
    "having regular periods. It is not clinically confirmed menopause, not a "
    "clinical diagnosis, and not a validated clinical risk score."
)

PRIVACY_NOTE = (
    "The API does not intentionally store submitted participant feature values. "
    "Avoid sending names, contact details, or other direct identifiers."
)

LIKELIHOOD_BANDS = [
    {
        "band": "lower",
        "min_probability": 0.0,
        "max_probability": 0.33,
        "label": "Lower model-estimated likelihood",
    },
    {
        "band": "moderate",
        "min_probability": 0.33,
        "max_probability": 0.66,
        "label": "Moderate model-estimated likelihood",
    },
    {
        "band": "higher",
        "min_probability": 0.66,
        "max_probability": 1.0,
        "label": "Higher model-estimated likelihood",
    },
]


@app.on_event("startup")
def load_model_once() -> None:
    global _service, _load_error
    try:
        _service = MenopauseInferenceService.from_artifacts()
        _load_error = None
    except Exception as exc:  # pragma: no cover
        _service = None
        _load_error = str(exc)


@app.middleware("http")
async def add_privacy_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response


def service() -> MenopauseInferenceService:
    if _service is None:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "model_not_loaded",
                "message": _load_error or "Model artifacts are not loaded.",
            },
        )
    return _service


@app.get("/api/v1/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok" if _service is not None else "degraded",
        "model_loaded": _service is not None,
        "model_version": _service.model_version if _service is not None else MODEL_VERSION,
        "load_error": _load_error,
    }


@app.get("/api/v1/feature-schema")
def feature_schema() -> dict[str, Any]:
    svc = service()
    return {
        "model_version": svc.model_version,
        "title": "Menopause-related menstrual-change model estimate",
        "raw_feature_order": svc.raw_feature_order,
        "numeric_features": svc.numeric_features,
        "categorical_features": svc.categorical_features,
        "category_mappings": svc.category_mappings,
        "features": [
            {
                "name": feature,
                **svc.feature_metadata.get(feature, {}),
                "required": False,
                "accepts_null": True,
            }
            for feature in svc.raw_feature_order
        ],
        "classification_threshold": svc.threshold,
        "missing_value_policy": (
            "Missing numeric values use train-split median imputation from the saved "
            "artifact. Missing categorical values use the saved 'missing' category. "
            "Missing values are not silently converted to zero."
        ),
        "privacy_note": PRIVACY_NOTE,
        "non_diagnostic_explanation": NON_DIAGNOSTIC_EXPLANATION,
    }


@app.get("/api/v1/model-info")
def model_info() -> dict[str, Any]:
    svc = service()
    metadata = svc.metadata
    metrics = metadata.get("evaluation_metrics", {})
    return {
        "model_version": svc.model_version,
        "title": "Menopause-related menstrual-change model estimate",
        "model_type": metadata.get("model_type"),
        "implementation": metadata.get("implementation"),
        "target": {
            "plain_language": (
                "Whether an NHANES participant self-reported menopause/change of "
                "life as the reason for not having regular periods."
            ),
            "positive_definition": metadata.get("target_definition", {}).get("positive"),
            "negative_definition": metadata.get("target_definition", {}).get("negative"),
            "not_clinically_confirmed": True,
        },
        "dataset": {
            "name": "NHANES August 2021-August 2023",
            "merged_modules": [
                "demographics",
                "reproductive health questionnaire",
                "body measurements",
                "sex steroid hormone panel",
                "glucose, insulin, and glycohemoglobin",
                "inflammation marker",
                "biochemistry profile",
                "lipids",
                "pregnancy test",
            ],
            "join_key": "SEQN",
        },
        "performance": metrics,
        "likelihood_bands": LIKELIHOOD_BANDS,
        "limitations": [
            "The target is self-reported in NHANES and is not clinically confirmed menopause.",
            "The model is a research prototype, not a diagnosis or validated clinical risk score.",
            "NHANES is cross-sectional, so the model should not be interpreted as predicting future menopause.",
            "Features contributed to the model score; they should not be interpreted as causes.",
            "The API does not provide treatment or medication recommendations.",
        ],
        "privacy_note": PRIVACY_NOTE,
        "non_diagnostic_explanation": NON_DIAGNOSTIC_EXPLANATION,
    }


@app.get("/api/v1/sample-participant")
def sample_participant() -> dict[str, Any]:
    svc = service()
    sample = {feature: None for feature in svc.raw_feature_order}
    sample.update(
        {
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
            "URXPREG": 2,
        }
    )
    return {
        "description": "Synthetic demonstration profile for the Lovable frontend. It is not a real participant.",
        "features": sample,
        "privacy_note": PRIVACY_NOTE,
    }


@app.post("/api/v1/predict")
def predict(request: PredictionRequest) -> dict[str, Any]:
    return predict_with_shared_service(request)


@app.get("/api/v1/model/schema")
def legacy_model_schema() -> dict[str, Any]:
    return feature_schema()


@app.post("/api/v1/predict/personal")
def legacy_predict_personal(request: PredictionRequest) -> dict[str, Any]:
    return predict_with_shared_service(request)


@app.post("/api/v1/predict/researcher")
def legacy_predict_researcher(request: PredictionRequest) -> dict[str, Any]:
    return predict_with_shared_service(request)


def likelihood_band(probability: float) -> dict[str, Any]:
    for band in LIKELIHOOD_BANDS:
        if band["min_probability"] <= probability < band["max_probability"]:
            return band
    return LIKELIHOOD_BANDS[-1]


def predict_with_shared_service(request: PredictionRequest) -> dict[str, Any]:
    try:
        raw = service().predict_one(
            request.features,
            include_explainability=request.include_explainability,
        )
    except InferenceError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    probability = raw["positive_class_probability"]
    return {
        "title": "Menopause-related menstrual-change model estimate",
        "model_version": raw["model_version"],
        "positive_class_probability": probability,
        "likelihood_band": likelihood_band(probability),
        "classification_threshold": raw["classification_threshold"],
        "predicted_class": raw["predicted_class"],
        "target": (
            "Whether an NHANES participant self-reported menopause/change of life "
            "as the reason for not having regular periods."
        ),
        "plain_language_explanation": (
            f"The model estimate is {probability:.1%}. This means the submitted "
            "features resemble the benchmark positive class to this degree under "
            "the saved model. This is not clinically confirmed menopause, not a "
            "clinical diagnosis, and not a validated clinical risk score."
        ),
        "non_diagnostic_explanation": NON_DIAGNOSTIC_EXPLANATION,
        "main_factors": raw.get("explainability", {}),
        "privacy_note": PRIVACY_NOTE,
    }


@app.post("/api/v1/predict/batch")
def predict_batch(request: BatchPredictionRequest) -> dict[str, Any]:
    try:
        predictions = service().predict_batch(
            request.rows,
            include_explainability=request.include_explainability,
        )
    except InferenceError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {
        "model_version": service().model_version,
        "count": len(predictions),
        "predictions": predictions,
    }
