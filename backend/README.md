# Women's Hormonal Health Benchmark

This project creates a small, reproducible NHANES benchmark for women's hormonal health research.

## Goal

Create reusable benchmark tasks for women's reproductive and hormonal health using public NHANES data.

This is not a diagnostic model. It is a hackathon benchmark that demonstrates how to turn public health data into a reusable dataset, baseline model, and evaluation pipeline.

## Data

Raw files are from NHANES August 2021-August 2023:

- `DEMO_L.xpt` - demographics and survey design variables
- `RHQ_L.xpt` - reproductive health questionnaire
- `BMX_L.xpt` - body measures
- `TST_L.xpt` - sex steroid hormone panel
- `INS_L.xpt` - insulin
- `GLU_L.xpt` - fasting glucose
- `GHB_L.xpt` - glycohemoglobin
- `HSCRP_L.xpt` - high-sensitivity C-reactive protein
- `BIOPRO_L.xpt` - standard biochemistry profile
- `HDL_L.xpt`, `TCHOL_L.xpt`, `TRIGLY_L.xpt` - lipid markers
- `UCPREG_L.xpt` - urine pregnancy test

All files merge on `SEQN`, the NHANES respondent sequence number.

## Benchmark Tasks

### Task 1: Menopause/change of life

- Positive class: `RHD043 == 7`, menopause/change of life
- Negative class: `RHQ031 == 1`, had at least one regular period in the past 12 months

Other reasons for no regular periods, such as pregnancy, breastfeeding, hysterectomy, and "other", are excluded from this task so the benchmark stays focused.

### Task 2: Reproductive-age no-period signal

- Population: female participants ages 20-45
- Positive class: `RHD043 == 9`, other reason for no regular periods
- Negative class: `RHQ031 == 1`, had at least one regular period in the past 12 months

This is a smaller and harder exploratory task. It is included because it is less dominated by age than menopause prediction and is closer to the challenge's interest in earlier hormonal-health signals.

## Features

The baseline model uses:

- Age
- Race/ethnicity
- Education
- Marital status
- Income-to-poverty ratio
- Pregnancy status
- Age at first menstrual period
- Pelvic infection history
- Ever pregnant
- Total deliveries
- Breastfeeding status
- Hysterectomy status
- Ovaries removed status
- Height, weight, BMI, waist, hip, arm, and leg measures
- Sex steroid hormones, including testosterone, estradiol, estrone, progesterone, SHBG, AMH, DHEA, and androstenedione
- Metabolic and inflammation markers, including glucose, insulin, glycohemoglobin, CRP, cholesterol, triglycerides, LDL, HDL, ALT, AST, creatinine, albumin, and related biochemistry markers
- Urine pregnancy test where available

## Run

```powershell
python src/baseline.py
```

Outputs are written to:

- `data/processed/womens_health_benchmark.csv`
- `models/nhanes-menopause-logreg-v1.npz`
- `models/nhanes-menopause-logreg-v1.json`
- `outputs/metrics_summary.csv`
- `outputs/menopause_metrics.json`
- `outputs/menopause_predictions.csv`
- `outputs/menopause_feature_importance.csv`
- `outputs/irregular_reproductive_age_metrics.json`
- `outputs/irregular_reproductive_age_predictions.csv`
- `outputs/irregular_reproductive_age_feature_importance.csv`
- `outputs/feature_dictionary.csv`
- SVG charts for class balance, age distribution, and top predictors

## Evaluation

The script creates a deterministic 80/20 train/test split, trains a class-balanced logistic regression model implemented with NumPy, selects a decision threshold on the training set, and reports:

- Accuracy
- Precision
- Recall
- F1
- ROC AUC
- Confusion matrix
- Top logistic-regression coefficients as a simple explainability artifact

## API

The FastAPI backend lives in `api/main.py` and loads the persisted model artifacts once at startup. See `API_USAGE.md` for endpoint examples.

## Limitations

- NHANES is cross-sectional, not longitudinal.
- The target is self-reported questionnaire data, not hormone-confirmed menopause.
- The second task is exploratory and has a much smaller positive class.
- This baseline does not use NHANES survey weights yet.
- This is for research infrastructure/prototyping, not medical advice or diagnosis.
