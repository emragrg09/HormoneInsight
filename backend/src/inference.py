from __future__ import annotations

import math
from typing import Any

import numpy as np

from src.explainability import top_contributions
from src.feature_schema import MODEL_VERSION
from src.model_io import ModelArtifacts, load_model_artifacts


class InferenceError(ValueError):
    pass


class MenopauseInferenceService:
    def __init__(self, artifacts: ModelArtifacts):
        self.artifacts = artifacts
        self.metadata = artifacts.metadata
        self.model_version = self.metadata.get("model_version", MODEL_VERSION)
        self.raw_feature_order = self.metadata["raw_feature_order"]
        self.transformed_feature_order = self.metadata["transformed_feature_order"]
        self.numeric_features = self.metadata["numeric_features"]
        self.categorical_features = self.metadata["categorical_features"]
        self.numeric_imputation = self.metadata["preprocessing"]["numeric_imputation"]
        self.category_mappings = self.metadata["preprocessing"]["category_mappings"]
        self.scaling_means = self.metadata["preprocessing"]["scaling_means"]
        self.scaling_stds = self.metadata["preprocessing"]["scaling_stds"]
        self.threshold = float(self.metadata["classification_threshold"])
        self.feature_metadata = self.metadata["feature_metadata"]

    @classmethod
    def from_artifacts(cls) -> "MenopauseInferenceService":
        return cls(load_model_artifacts())

    def predict_one(self, values: dict[str, Any], include_explainability: bool = True) -> dict[str, Any]:
        raw_values = self._validate_raw_values(values)
        transformed = self.transform_one(raw_values)
        logit = float(self.artifacts.bias + transformed @ self.artifacts.weights)
        probability = float(1 / (1 + math.exp(-max(min(logit, 35), -35))))
        predicted_class = int(probability >= self.threshold)
        result = {
            "model_version": self.model_version,
            "positive_class_probability": round(probability, 6),
            "classification_threshold": self.threshold,
            "predicted_class": predicted_class,
            "positive_class_label": self.metadata["positive_class_label"],
            "warning": "Research prototype based on self-reported NHANES data. This is not a clinical diagnosis or medical advice.",
        }
        if include_explainability:
            result["explainability"] = top_contributions(
                transformed_values=transformed,
                weights=self.artifacts.weights,
                transformed_feature_order=self.transformed_feature_order,
                raw_input=raw_values,
                feature_metadata=self.feature_metadata,
            )
        return result

    def predict_batch(self, rows: list[dict[str, Any]], include_explainability: bool = False) -> list[dict[str, Any]]:
        return [
            self.predict_one(row, include_explainability=include_explainability)
            for row in rows
        ]

    def transform_one(self, values: dict[str, Any]) -> np.ndarray:
        transformed_lookup: dict[str, float] = {}

        for feature in self.numeric_features:
            value = values.get(feature)
            if value is None:
                value = self.numeric_imputation[feature]
            numeric_value = float(value)
            transformed_lookup[feature] = numeric_value

        for feature in self.categorical_features:
            value = values.get(feature)
            category = "missing" if value is None else str(int(value))
            categories = self.category_mappings[feature]
            if category not in categories:
                raise InferenceError(
                    f"{feature} has unseen category {category!r}. Allowed categories: {categories}"
                )
            for allowed_category in categories:
                transformed_lookup[f"{feature}_{allowed_category}"] = (
                    1.0 if category == allowed_category else 0.0
                )

        ordered = []
        for feature in self.transformed_feature_order:
            if feature not in transformed_lookup:
                raise InferenceError(f"Missing transformed feature {feature}")
            value = transformed_lookup[feature]
            mean = float(self.scaling_means[feature])
            std = float(self.scaling_stds[feature])
            ordered.append((value - mean) / std)
        return np.array(ordered, dtype=float)

    def _validate_raw_values(self, values: dict[str, Any]) -> dict[str, Any]:
        unknown = sorted(set(values) - set(self.raw_feature_order))
        if unknown:
            raise InferenceError(f"Unknown feature(s): {unknown}")

        cleaned: dict[str, Any] = {}
        for feature in self.raw_feature_order:
            value = values.get(feature)
            if value is None:
                cleaned[feature] = None
                continue
            if isinstance(value, str) and value.strip() == "":
                cleaned[feature] = None
                continue
            try:
                numeric_value = float(value)
            except (TypeError, ValueError) as exc:
                raise InferenceError(f"{feature} must be numeric or null") from exc
            if math.isnan(numeric_value) or math.isinf(numeric_value):
                raise InferenceError(f"{feature} must be finite or null")
            cleaned[feature] = numeric_value
        return cleaned
