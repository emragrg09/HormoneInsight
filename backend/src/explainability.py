from __future__ import annotations

from typing import Any

import numpy as np


def top_contributions(
    *,
    transformed_values: np.ndarray,
    weights: np.ndarray,
    transformed_feature_order: list[str],
    raw_input: dict[str, Any],
    feature_metadata: dict[str, dict[str, Any]],
    n: int = 5,
) -> dict[str, list[dict[str, Any]]]:
    contributions = transformed_values * weights
    rows = []
    for feature, transformed_value, contribution in zip(
        transformed_feature_order, transformed_values, contributions
    ):
        raw_feature = feature.split("_", 1)[0] if "_" in feature else feature
        metadata = feature_metadata.get(raw_feature, {})
        rows.append(
            {
                "feature": feature,
                "raw_feature": raw_feature,
                "label": metadata.get("label", raw_feature),
                "original_value": raw_input.get(raw_feature),
                "transformed_value": round(float(transformed_value), 6),
                "contribution": round(float(contribution), 6),
                "wording": "contributed to the model score",
            }
        )

    positive = sorted(rows, key=lambda row: row["contribution"], reverse=True)
    negative = sorted(rows, key=lambda row: row["contribution"])
    return {
        "top_positive_contributions": [
            {
                **row,
                "interpretation": "associated with a higher model estimate",
            }
            for row in positive[:n]
            if row["contribution"] > 0
        ],
        "top_negative_contributions": [
            {
                **row,
                "interpretation": "associated with a lower model estimate",
            }
            for row in negative[:n]
            if row["contribution"] < 0
        ],
    }
