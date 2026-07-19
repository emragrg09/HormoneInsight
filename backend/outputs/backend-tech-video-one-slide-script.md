# One-Slide Backend Tech Video Script

Target length: 45-60 seconds.

"This is the technical architecture behind the model. We start with public NHANES 2021-2023 data and merge modules by `SEQN`: demographics, reproductive health, body measures, sex steroid hormones, metabolic labs, inflammation, lipids, and pregnancy-test data.

The model is a class-balanced logistic regression implemented in NumPy. The target is whether an NHANES participant self-reported menopause or change of life as the reason for not having regular periods.

Training creates portable artifacts: weights, bias, exact feature order, imputation values, category mappings, scaling parameters, threshold, metadata, and metrics. Preprocessing is fitted on the training split only, so inference uses the same transformations as training.

The result is deliberately framed as a model estimate, not clinically confirmed menopause, not a diagnosis, and not treatment advice."
