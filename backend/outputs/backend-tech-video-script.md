# Backend Tech Video Script

Target length: 55-60 seconds.

## Slide 1

We built the app around a reusable backend service, not a one-off demo. The frontend calls FastAPI, and FastAPI loads a saved NumPy logistic-regression model once at startup. That means the app does not retrain the model when a user opens it.

## Slide 2

The dataset comes from public NHANES 2021-2023 modules. We merge demographics, reproductive health, body measurements, sex steroid hormones, metabolic labs, inflammation, biochemistry, lipids, and pregnancy-test data by `SEQN`, the NHANES participant identifier. The target is self-reported menopause/change of life as the reason for not having regular periods.

## Slide 3

Training saves a portable inference package. The `.npz` file stores weights and bias. The JSON file stores the exact feature order, imputation values, category mappings, scaling means and standard deviations, classification threshold, metadata, and evaluation metrics. Preprocessing is fitted on the training split only.

## Slide 4

The Lovable frontend uses five endpoints: health, feature schema, model info, sample participant, and predict. The prediction response returns a positive-class probability, a lower, moderate, or higher likelihood band, and feature contributions. The wording is intentionally careful: this is a model estimate, not clinically confirmed menopause, not a diagnosis, and not treatment advice.
