from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

if str(Path(__file__).resolve().parents[1]) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.feature_schema import (
    BASE_FEATURES,
    CATEGORICAL_FEATURES,
    FEATURE_DESCRIPTIONS,
    FEATURE_LABELS,
    LAB_FEATURES,
    LAB_FILES,
    MISSING_CODES,
    MODEL_VERSION,
    NUMERIC_FEATURES,
    OUTPUT_DIR,
    PROCESSED_DIR,
    RAW_FILES,
    TASKS,
)
from src.model_io import save_model_artifacts


def load_raw_data() -> pd.DataFrame:
    for name, path in RAW_FILES.items():
        if not path.exists():
            raise FileNotFoundError(f"Missing {name} file: {path}")

    demo = pd.read_sas(RAW_FILES["demo"], format="xport")
    rhq = pd.read_sas(RAW_FILES["rhq"], format="xport")
    bmx = pd.read_sas(RAW_FILES["bmx"], format="xport")

    merged = demo.merge(rhq, on="SEQN", how="inner").merge(bmx, on="SEQN", how="inner")

    for lab_name, lab in LAB_FILES.items():
        path = lab["path"]
        if not path.exists():
            print(f"Warning: missing lab file {lab_name}: {path.name}")
            continue
        columns = ["SEQN"] + lab["columns"]
        lab_df = pd.read_sas(path, format="xport")
        available_columns = [column for column in columns if column in lab_df.columns]
        merged = merged.merge(lab_df[available_columns], on="SEQN", how="left")

    return merged


def clean_missing_codes(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.copy()
    for column, codes in MISSING_CODES.items():
        if column in cleaned.columns:
            cleaned[column] = cleaned[column].replace(codes, np.nan)
    return cleaned


def build_benchmark(raw: pd.DataFrame) -> pd.DataFrame:
    df = raw.copy()

    # NHANES code: RIAGENDR 2 means female.
    df = df[df["RIAGENDR"] == 2].copy()

    menopause_positive = df["RHD043"] == 7
    menopause_negative = df["RHQ031"] == 1
    menopause_scope = menopause_positive | menopause_negative
    df["target_menopause_change_of_life"] = np.nan
    df.loc[menopause_scope, "target_menopause_change_of_life"] = np.where(
        menopause_positive.loc[menopause_scope], 1, 0
    )

    reproductive_age = df["RIDAGEYR"].between(20, 45)
    irregular_positive = reproductive_age & (df["RHD043"] == 9)
    irregular_negative = reproductive_age & (df["RHQ031"] == 1)
    irregular_scope = irregular_positive | irregular_negative
    df["target_irregular_reproductive_age"] = np.nan
    df.loc[irregular_scope, "target_irregular_reproductive_age"] = np.where(
        irregular_positive.loc[irregular_scope], 1, 0
    )

    keep_columns = ["SEQN"] + [task["target_column"] for task in TASKS.values()] + BASE_FEATURES
    df = clean_missing_codes(df[keep_columns])
    return df.reset_index(drop=True)


def task_dataset(benchmark: pd.DataFrame, task_name: str) -> pd.DataFrame:
    target_column = TASKS[task_name]["target_column"]
    columns = ["SEQN", target_column] + BASE_FEATURES
    task_df = benchmark[columns].dropna(subset=[target_column]).copy()
    task_df[target_column] = task_df[target_column].astype(int)
    return task_df.reset_index(drop=True)


def fit_preprocessor(df: pd.DataFrame) -> dict[str, object]:
    x = df[BASE_FEATURES].copy()
    numeric_imputation = {}
    for column in NUMERIC_FEATURES:
        median = x[column].median()
        if pd.isna(median):
            raise ValueError(f"Cannot fit imputation for {column}: all training values are missing")
        numeric_imputation[column] = float(median)

    category_mappings = {}
    for column in CATEGORICAL_FEATURES:
        series = x[column].astype("Int64").astype("string").fillna("missing")
        categories = sorted(series.dropna().unique().tolist())
        if "missing" not in categories:
            categories.append("missing")
        category_mappings[column] = categories

    unscaled = transform_unscaled(df, numeric_imputation, category_mappings)
    scaling_means = unscaled.mean().to_dict()
    scaling_stds = unscaled.std().replace(0, 1).to_dict()

    return {
        "numeric_imputation": numeric_imputation,
        "category_mappings": category_mappings,
        "transformed_feature_order": unscaled.columns.tolist(),
        "scaling_means": {key: float(value) for key, value in scaling_means.items()},
        "scaling_stds": {key: float(value) for key, value in scaling_stds.items()},
    }


def transform_unscaled(
    df: pd.DataFrame,
    numeric_imputation: dict[str, float],
    category_mappings: dict[str, list[str]],
) -> pd.DataFrame:
    x = df[BASE_FEATURES].copy()
    pieces = []

    numeric = pd.DataFrame(index=x.index)
    for column in NUMERIC_FEATURES:
        numeric[column] = x[column].fillna(numeric_imputation[column]).astype(float)
    pieces.append(numeric)

    categorical = pd.DataFrame(index=x.index)
    for column in CATEGORICAL_FEATURES:
        series = x[column].astype("Int64").astype("string").fillna("missing")
        unknown = sorted(set(series.dropna().unique()) - set(category_mappings[column]))
        if unknown:
            raise ValueError(f"{column} contains unknown category values: {unknown}")
        for category in category_mappings[column]:
            categorical[f"{column}_{category}"] = (series == category).astype(float)
    pieces.append(categorical)

    return pd.concat(pieces, axis=1)


def transform_with_preprocessor(df: pd.DataFrame, preprocessor: dict[str, object]) -> pd.DataFrame:
    unscaled = transform_unscaled(
        df,
        preprocessor["numeric_imputation"],
        preprocessor["category_mappings"],
    )
    order = preprocessor["transformed_feature_order"]
    unscaled = unscaled[order]
    means = pd.Series(preprocessor["scaling_means"])
    stds = pd.Series(preprocessor["scaling_stds"])
    return (unscaled - means[order]) / stds[order]


def make_design_matrix(df: pd.DataFrame, task_name: str) -> tuple[pd.DataFrame, pd.Series]:
    target_column = TASKS[task_name]["target_column"]
    y = df[target_column].astype(int)
    preprocessor = fit_preprocessor(df)
    x = transform_with_preprocessor(df, preprocessor)
    return x, y


def train_test_split(
    x: pd.DataFrame, y: pd.Series, test_size: float = 0.2, seed: int = 42
) -> tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    rng = np.random.default_rng(seed)
    indices = np.arange(len(y))
    rng.shuffle(indices)
    split = int(len(indices) * (1 - test_size))
    train_idx = indices[:split]
    test_idx = indices[split:]
    return x.iloc[train_idx], x.iloc[test_idx], y.iloc[train_idx], y.iloc[test_idx]


def sigmoid(values: np.ndarray) -> np.ndarray:
    values = np.clip(values, -35, 35)
    return 1 / (1 + np.exp(-values))


def fit_logistic_regression(
    x_train: pd.DataFrame,
    y_train: pd.Series,
    learning_rate: float = 0.05,
    epochs: int = 3000,
    l2: float = 0.01,
) -> tuple[np.ndarray, float]:
    x_values = x_train.to_numpy(dtype=float)
    y_values = y_train.to_numpy(dtype=float)
    positive_count = max(float(y_values.sum()), 1.0)
    negative_count = max(float(len(y_values) - y_values.sum()), 1.0)
    sample_weights = np.where(
        y_values == 1,
        len(y_values) / (2 * positive_count),
        len(y_values) / (2 * negative_count),
    )
    weights = np.zeros(x_values.shape[1])
    bias = 0.0

    for _ in range(epochs):
        probabilities = sigmoid(x_values @ weights + bias)
        errors = (probabilities - y_values) * sample_weights
        gradient = (x_values.T @ errors) / len(y_values)
        bias_gradient = float(errors.mean())
        gradient += l2 * weights / len(y_values)
        weights -= learning_rate * gradient
        bias -= learning_rate * bias_gradient

    return weights, bias


def roc_auc_score(y_true: np.ndarray, scores: np.ndarray) -> float:
    order = np.argsort(scores)
    ranks = np.empty_like(order, dtype=float)
    ranks[order] = np.arange(1, len(scores) + 1)
    positives = y_true == 1
    n_pos = positives.sum()
    n_neg = len(y_true) - n_pos
    if n_pos == 0 or n_neg == 0:
        return float("nan")
    rank_sum_pos = ranks[positives].sum()
    return float((rank_sum_pos - n_pos * (n_pos + 1) / 2) / (n_pos * n_neg))


def best_f1_threshold(y_true: pd.Series, probabilities: np.ndarray) -> float:
    best_threshold = 0.5
    best_f1 = -1.0
    for threshold in np.linspace(0.05, 0.95, 91):
        metrics = evaluate(y_true, probabilities, threshold)
        if float(metrics["f1"]) > best_f1:
            best_f1 = float(metrics["f1"])
            best_threshold = float(threshold)
    return best_threshold


def evaluate(
    y_true: pd.Series, probabilities: np.ndarray, threshold: float = 0.5
) -> dict[str, object]:
    y_values = y_true.to_numpy(dtype=int)
    predictions = (probabilities >= threshold).astype(int)

    tp = int(((predictions == 1) & (y_values == 1)).sum())
    tn = int(((predictions == 0) & (y_values == 0)).sum())
    fp = int(((predictions == 1) & (y_values == 0)).sum())
    fn = int(((predictions == 0) & (y_values == 1)).sum())

    accuracy = (tp + tn) / len(y_values)
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0

    return {
        "n_test": int(len(y_values)),
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
        "roc_auc": round(roc_auc_score(y_values, probabilities), 4),
        "threshold": round(float(threshold), 4),
        "confusion_matrix": {
            "true_negative": tn,
            "false_positive": fp,
            "false_negative": fn,
            "true_positive": tp,
        },
    }


def feature_importance(x: pd.DataFrame, weights: np.ndarray) -> pd.DataFrame:
    rows = []
    for feature, weight in zip(x.columns, weights):
        rows.append(
            {
                "feature": feature,
                "coefficient": float(weight),
                "absolute_coefficient": abs(float(weight)),
            }
        )
    return pd.DataFrame(rows).sort_values("absolute_coefficient", ascending=False)


def svg_bar_chart(
    rows: list[tuple[str, float]],
    title: str,
    output_path: Path,
    value_label: str = "",
) -> None:
    width = 920
    row_height = 34
    left = 260
    right = 60
    top = 58
    height = top + row_height * len(rows) + 36
    max_value = max([value for _, value in rows] or [1])
    chart_width = width - left - right

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        "<style>text{font-family:Arial,sans-serif;fill:#1f2933} .muted{fill:#52606d} .bar{fill:#2f80ed} .axis{stroke:#d9e2ec;stroke-width:1}</style>",
        f'<text x="20" y="32" font-size="22" font-weight="700">{title}</text>',
    ]

    for index, (label, value) in enumerate(rows):
        y = top + index * row_height
        bar_width = 0 if max_value == 0 else value / max_value * chart_width
        safe_label = str(label).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        parts.extend(
            [
                f'<text x="20" y="{y + 21}" font-size="14">{safe_label}</text>',
                f'<rect class="bar" x="{left}" y="{y + 6}" width="{bar_width:.1f}" height="18" rx="3"/>',
                f'<text class="muted" x="{left + bar_width + 8}" y="{y + 21}" font-size="13">{value:.3f}{value_label}</text>',
            ]
        )

    parts.append("</svg>")
    output_path.write_text("\n".join(parts), encoding="utf-8")


def svg_class_balance(task_df: pd.DataFrame, task_name: str, output_path: Path) -> None:
    target_column = TASKS[task_name]["target_column"]
    counts = task_df[target_column].value_counts().sort_index()
    rows = [("Negative class", float(counts.get(0, 0))), ("Positive class", float(counts.get(1, 0)))]
    svg_bar_chart(rows, f"Class balance: {TASKS[task_name]['label']}", output_path)


def svg_age_distribution(task_df: pd.DataFrame, task_name: str, output_path: Path) -> None:
    target_column = TASKS[task_name]["target_column"]
    bins = [12, 20, 30, 40, 50, 60, 70, 80, 90]
    labels = ["12-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89"]
    rows = []
    for label, low, high in zip(labels, bins[:-1], bins[1:]):
        in_bin = task_df["RIDAGEYR"].between(low, high - 1)
        pos = int((in_bin & (task_df[target_column] == 1)).sum())
        neg = int((in_bin & (task_df[target_column] == 0)).sum())
        rows.append((f"{label} negative", float(neg)))
        rows.append((f"{label} positive", float(pos)))
    svg_bar_chart(rows, f"Age distribution: {TASKS[task_name]['label']}", output_path)


def write_feature_dictionary() -> None:
    rows = []
    for feature in BASE_FEATURES:
        rows.append(
            {
                "feature": feature,
                "description": FEATURE_DESCRIPTIONS.get(feature, ""),
                "type": "categorical"
                if feature in CATEGORICAL_FEATURES
                else "numeric",
                "source": "NHANES laboratory"
                if feature in LAB_FEATURES
                else "NHANES survey/exam",
            }
        )
    pd.DataFrame(rows).to_csv(OUTPUT_DIR / "feature_dictionary.csv", index=False)


def save_primary_model_artifact(
    *,
    weights: np.ndarray,
    bias: float,
    preprocessor: dict[str, object],
    metrics: dict[str, object],
    train_rows: int,
    test_rows: int,
) -> None:
    feature_metadata = {}
    for feature in BASE_FEATURES:
        feature_metadata[feature] = {
            "label": FEATURE_LABELS.get(feature, feature),
            "description": FEATURE_DESCRIPTIONS.get(feature, ""),
            "type": "categorical" if feature in CATEGORICAL_FEATURES else "numeric",
            "source": "NHANES laboratory"
            if feature in LAB_FEATURES
            else "NHANES survey/exam",
            "missing_codes": MISSING_CODES.get(feature, []),
        }

    metadata = {
        "model_version": MODEL_VERSION,
        "task": "menopause",
        "task_label": TASKS["menopause"]["label"],
        "model_type": "class-balanced binary logistic regression",
        "implementation": "NumPy gradient descent",
        "raw_feature_order": BASE_FEATURES,
        "transformed_feature_order": preprocessor["transformed_feature_order"],
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "preprocessing": {
            "missing_code_replacements": MISSING_CODES,
            "numeric_imputation": preprocessor["numeric_imputation"],
            "category_mappings": preprocessor["category_mappings"],
            "scaling_means": preprocessor["scaling_means"],
            "scaling_stds": preprocessor["scaling_stds"],
            "notes": "Imputation values, category mappings, and scaling parameters are fitted on the training split only.",
        },
        "classification_threshold": float(metrics["threshold"]),
        "positive_class_label": "Reports menopause/change of life as reason for not having regular periods",
        "target_definition": {
            "positive": TASKS["menopause"]["positive_definition"],
            "negative": TASKS["menopause"]["negative_definition"],
        },
        "feature_metadata": feature_metadata,
        "evaluation_metrics": metrics,
        "training_metadata": {
            "train_rows": int(train_rows),
            "test_rows": int(test_rows),
            "split": "Deterministic shuffled 80/20 split with NumPy random seed 42.",
            "medical_warning": "Research model based on self-reported NHANES data; not a clinical diagnosis.",
        },
    }
    save_model_artifacts(weights=weights, bias=bias, metadata=metadata)


def run_task(raw: pd.DataFrame, benchmark: pd.DataFrame, task_name: str) -> dict[str, object]:
    task_df = task_dataset(benchmark, task_name)
    target_column = TASKS[task_name]["target_column"]
    y = task_df[target_column].astype(int)
    rng = np.random.default_rng(42)
    indices = np.arange(len(y))
    rng.shuffle(indices)
    split = int(len(indices) * 0.8)
    train_idx = indices[:split]
    test_idx = indices[split:]

    train_df = task_df.iloc[train_idx].reset_index(drop=True)
    test_df = task_df.iloc[test_idx].reset_index(drop=True)
    y_train = train_df[target_column].astype(int)
    y_test = test_df[target_column].astype(int)

    preprocessor = fit_preprocessor(train_df)
    x_train = transform_with_preprocessor(train_df, preprocessor)
    x_test = transform_with_preprocessor(test_df, preprocessor)

    weights, bias = fit_logistic_regression(x_train, y_train)
    train_probabilities = sigmoid(x_train.to_numpy(dtype=float) @ weights + bias)
    threshold = best_f1_threshold(y_train, train_probabilities)
    probabilities = sigmoid(x_test.to_numpy(dtype=float) @ weights + bias)
    metrics = evaluate(y_test, probabilities, threshold)

    task = TASKS[task_name]
    metrics.update(
        {
            "task": task_name,
            "task_label": task["label"],
            "n_raw_merged_rows": int(len(raw)),
            "n_benchmark_rows": int(len(task_df)),
            "n_train": int(len(y_train)),
            "n_positive": int(y.sum()),
            "n_negative": int((y == 0).sum()),
            "positive_definition": task["positive_definition"],
            "negative_definition": task["negative_definition"],
        }
    )

    predictions = pd.DataFrame(
        {
            "SEQN": test_df["SEQN"].to_numpy(dtype=int),
            "actual": y_test.to_numpy(dtype=int),
            "predicted_probability": probabilities,
            "predicted": (probabilities >= threshold).astype(int),
        }
    )
    importance = feature_importance(x_train, weights)

    with (OUTPUT_DIR / f"{task_name}_metrics.json").open("w", encoding="utf-8") as file:
        json.dump(metrics, file, indent=2)
    predictions.to_csv(OUTPUT_DIR / f"{task_name}_predictions.csv", index=False)
    importance.to_csv(OUTPUT_DIR / f"{task_name}_feature_importance.csv", index=False)

    top_rows = [
        (row["feature"], float(row["absolute_coefficient"]))
        for _, row in importance.head(12).iterrows()
    ]
    svg_bar_chart(
        top_rows,
        f"Top predictors: {task['label']}",
        OUTPUT_DIR / f"{task_name}_feature_importance.svg",
    )
    svg_class_balance(task_df, task_name, OUTPUT_DIR / f"{task_name}_class_balance.svg")
    svg_age_distribution(task_df, task_name, OUTPUT_DIR / f"{task_name}_age_distribution.svg")

    if task_name == "menopause":
        save_primary_model_artifact(
            weights=weights,
            bias=bias,
            preprocessor=preprocessor,
            metrics=metrics,
            train_rows=len(train_df),
            test_rows=len(test_df),
        )

    return metrics


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    raw = load_raw_data()
    benchmark = build_benchmark(raw)
    benchmark_path = PROCESSED_DIR / "womens_health_benchmark.csv"
    benchmark.to_csv(benchmark_path, index=False)
    write_feature_dictionary()

    all_metrics = [run_task(raw, benchmark, task_name) for task_name in TASKS]
    summary = pd.DataFrame(all_metrics)
    summary.to_csv(OUTPUT_DIR / "metrics_summary.csv", index=False)

    # Keep these convenience files for the first task and for simple demos.
    (OUTPUT_DIR / "metrics.json").write_text(
        json.dumps(all_metrics[0], indent=2), encoding="utf-8"
    )
    pd.read_csv(OUTPUT_DIR / "menopause_predictions.csv").to_csv(
        OUTPUT_DIR / "predictions.csv", index=False
    )

    print(json.dumps(all_metrics, indent=2))


if __name__ == "__main__":
    main()
