from __future__ import annotations

from fastapi.testclient import TestClient

from api.main import app


def test_health_loads_model() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "ok"
        assert body["model_loaded"] is True
        assert body["model_version"] == "nhanes-menopause-logreg-v1"


def test_feature_schema_contract() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/feature-schema")
        assert response.status_code == 200
        body = response.json()
        assert body["title"] == "Menopause-related menstrual-change model estimate"
        assert "RIDAGEYR" in body["raw_feature_order"]
        assert body["features"][0]["name"] == body["raw_feature_order"][0]
        assert "clinical diagnosis" in body["non_diagnostic_explanation"]


def test_model_info_contract() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/model-info")
        assert response.status_code == 200
        body = response.json()
        assert body["target"]["not_clinically_confirmed"] is True
        assert body["dataset"]["name"] == "NHANES August 2021-August 2023"
        assert "f1" in body["performance"]
        assert len(body["likelihood_bands"]) == 3


def test_sample_participant_can_be_predicted() -> None:
    with TestClient(app) as client:
        sample = client.get("/api/v1/sample-participant").json()["features"]
        response = client.post(
            "/api/v1/predict",
            json={"features": sample, "include_explainability": True},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["title"] == "Menopause-related menstrual-change model estimate"
        assert 0 <= body["positive_class_probability"] <= 1
        assert body["likelihood_band"]["band"] in {"lower", "moderate", "higher"}
        assert "top_positive_contributions" in body["main_factors"]
        assert "diagnosis" in body["plain_language_explanation"]


def test_privacy_headers() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
        assert response.headers["Cache-Control"] == "no-store"
        assert response.headers["X-Content-Type-Options"] == "nosniff"


def test_predict_rejects_unknown_features() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/predict",
            json={"features": {"not_a_feature": 1}, "include_explainability": False},
        )
        assert response.status_code == 422
