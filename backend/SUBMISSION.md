# Submission Brief

## Project Title

Open NHANES Benchmark for Women's Reproductive and Hormonal Health

## One-Sentence Summary

This project turns public NHANES 2021-2023 data into reusable benchmark datasets, baseline models, evaluation metrics, and explainability artifacts for women's reproductive and hormonal health research.

## Challenge Fit

The hackathon asks teams to contribute a reusable building block for future women's hormonal health AI infrastructure. This project contributes the data and benchmark layer:

- Public, reproducible NHANES data pipeline
- Transparent target definitions
- Baseline models
- Evaluation metrics
- Feature-importance outputs
- Lightweight charts for documentation and demos

## Dataset

Raw data sources:

- `DEMO_L.xpt` - demographics
- `RHQ_L.xpt` - reproductive health questionnaire
- `BMX_L.xpt` - body measures
- `TST_L.xpt` - sex steroid hormone panel
- `INS_L.xpt`, `GLU_L.xpt`, `GHB_L.xpt` - insulin/glucose markers
- `HSCRP_L.xpt` - inflammation marker
- `BIOPRO_L.xpt` - standard biochemistry profile
- `HDL_L.xpt`, `TCHOL_L.xpt`, `TRIGLY_L.xpt` - lipid markers
- `UCPREG_L.xpt` - urine pregnancy test

All files are public NHANES August 2021-August 2023 files and merge on `SEQN`.

## Benchmark Tasks

### Task 1: Menopause/change of life

Predict whether a female participant reports menopause/change of life as the reason for not having regular periods.

- Positive class: `RHD043 == 7`
- Negative class: `RHQ031 == 1`
- Benchmark rows: 2,632

### Task 2: Reproductive-age no-period signal

Predict a smaller, harder signal among female participants ages 20-45.

- Positive class: `RHD043 == 9`
- Negative class: `RHQ031 == 1`
- Benchmark rows: 921

## Baseline Model

The baseline is class-balanced logistic regression implemented with NumPy. It uses demographics, reproductive questionnaire fields, body measures, sex steroid hormones, metabolic labs, inflammatory markers, and lipid/biochemistry markers.

This model was chosen because it is explainable, reproducible, fast, and suitable as a scientific baseline.

## Current Results

| Task | Rows | Positives | Accuracy | F1 | ROC AUC |
| --- | ---: | ---: | ---: | ---: | ---: |
| Menopause/change of life | 2,632 | 1,136 | 0.9507 | 0.9467 | 0.9941 |
| Reproductive-age no-period signal | 921 | 65 | 0.7838 | 0.0476 | 0.5377 |

The first task is strong but still partly age-driven. The lab-enriched model also surfaces hormone and biomarker features such as progesterone, androstenedione, SHBG, serum glucose, and iron in feature-importance outputs. The second task is intentionally harder and shows that public cross-sectional variables alone are not enough for reliable prediction of less obvious reproductive-age menstrual disruption.

## Why This Matters

This benchmark provides a reusable starting point for researchers who want to compare methods on public women's health data before moving to richer restricted datasets such as mcPHASES.

## Responsible AI Notes

- This is not a diagnostic tool.
- Predictions are based on self-reported survey data.
- NHANES is cross-sectional, not longitudinal.
- The project should not be used for medical decisions.
- Future versions should incorporate clinical review, survey weights, external validation, and richer longitudinal hormone or wearable data.

## Next Steps

- Add survey-weighted evaluation.
- Compare logistic regression with random forest or gradient boosting.
- Build a small non-diagnostic demo app for explaining benchmark predictions.
- Add NSFG as a separate reproductive-health benchmark.
- Add the small PCOS dataset as a separate case-control/metabolomics demonstration.
- Upgrade to mcPHASES if restricted PhysioNet access becomes available.
