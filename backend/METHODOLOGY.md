# Benchmark Methodology

## Specific Problem

The selected hormone-related problem is menopause-related hormonal health prediction.

The benchmark asks:

Can public NHANES reproductive-health, body-measure, hormone, metabolic, inflammation, and lipid variables predict whether a female participant reports menopause/change of life as the reason for not having regular periods?

## Data Sources

All primary data files come from NHANES August 2021-August 2023.

Core files:

- `DEMO_L.xpt`
- `RHQ_L.xpt`
- `BMX_L.xpt`

Lab-enrichment files:

- `TST_L.xpt`
- `INS_L.xpt`
- `GLU_L.xpt`
- `GHB_L.xpt`
- `HSCRP_L.xpt`
- `BIOPRO_L.xpt`
- `HDL_L.xpt`
- `TCHOL_L.xpt`
- `TRIGLY_L.xpt`
- `UCPREG_L.xpt`

All files are merged on `SEQN`.

## Target Definition

Main task:

- Positive class: `RHD043 == 7`, menopause/change of life
- Negative class: `RHQ031 == 1`, had at least one regular period in the past 12 months

Exploratory task:

- Population: female participants ages 20-45
- Positive class: `RHD043 == 9`, other reason for no regular periods
- Negative class: `RHQ031 == 1`

## Model

The baseline model is class-balanced logistic regression implemented with NumPy.

Why this model:

- Reproducible
- Explainable
- Dependency-light
- Appropriate as a first scientific benchmark baseline

## Evaluation

The pipeline uses a deterministic 80/20 train/test split and reports:

- Accuracy
- Precision
- Recall
- F1
- ROC AUC
- Confusion matrix

The decision threshold is selected on the training set to maximize F1, then applied once to the held-out test set.

## Outputs

Generated outputs include:

- Clean benchmark CSV
- Metrics summary
- Task-specific predictions
- Task-specific feature importance
- Feature dictionary
- SVG charts for class balance, age distribution, and top predictors

## Limitations

- NHANES is cross-sectional, not longitudinal.
- The target is self-reported, not clinically confirmed by a physician.
- Menopause prediction is strongly age-driven.
- Lab variables have missingness due to NHANES subsampling and eligibility rules.
- The exploratory reproductive-age task has few positive examples.
- This project is not intended for diagnosis, treatment decisions, or individual medical advice.
