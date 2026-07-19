from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from src.feature_schema import MODEL_DIR, MODEL_VERSION


@dataclass(frozen=True)
class ModelArtifacts:
    weights: np.ndarray
    bias: float
    metadata: dict[str, Any]


def artifact_paths(model_version: str = MODEL_VERSION) -> tuple[Path, Path]:
    return (
        MODEL_DIR / f"{model_version}.npz",
        MODEL_DIR / f"{model_version}.json",
    )


def save_model_artifacts(
    *,
    weights: np.ndarray,
    bias: float,
    metadata: dict[str, Any],
    model_version: str = MODEL_VERSION,
) -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    npz_path, json_path = artifact_paths(model_version)
    np.savez_compressed(npz_path, weights=weights, bias=np.array([bias], dtype=float))
    json_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def load_model_artifacts(model_version: str = MODEL_VERSION) -> ModelArtifacts:
    npz_path, json_path = artifact_paths(model_version)
    if not npz_path.exists() or not json_path.exists():
        raise FileNotFoundError(
            f"Missing model artifacts. Expected {npz_path.name} and {json_path.name}."
        )

    arrays = np.load(npz_path)
    metadata = json.loads(json_path.read_text(encoding="utf-8"))
    return ModelArtifacts(
        weights=arrays["weights"].astype(float),
        bias=float(arrays["bias"][0]),
        metadata=metadata,
    )
