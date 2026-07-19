# Short Demo Video Script

Target length: 90 seconds.

## 0:00-0:10 - Problem

"Women's hormonal health is underrepresented in AI infrastructure. The hackathon asks us to build a reusable building block, not just a one-off app. We chose menopause-related hormonal health prediction as our specific benchmark problem."

## 0:10-0:25 - Dataset

"We use public NHANES August 2021-August 2023 data. The benchmark merges demographics, reproductive health questionnaires, body measures, sex steroid hormones, metabolic labs, inflammation markers, lipids, and pregnancy-test data using the respondent ID `SEQN`."

## 0:25-0:40 - Benchmark Task

"The main task predicts whether a female participant reports menopause or change of life as the reason for not having regular periods. Positive cases are `RHD043 == 7`; negative cases are participants who reported regular periods in the past 12 months."

## 0:40-0:58 - Prototype

"The working prototype is a reproducible Python pipeline. It loads raw NHANES files, creates the cleaned benchmark dataset, trains a class-balanced logistic regression baseline, chooses a decision threshold on the training set, and exports predictions, metrics, feature importance, and charts."

## 0:58-1:15 - Results

"The menopause benchmark includes 2,632 rows and 1,136 positive cases. The baseline reaches 0.9467 F1 and 0.9941 ROC AUC. Feature importance shows that age is a strong predictor, but hormone and biomarker variables such as progesterone, androstenedione, SHBG, glucose, and iron also appear in the model."

## 1:15-1:28 - Responsible AI

"This is not a diagnostic tool. It is a public research benchmark. The project documents target definitions, limitations, class balance, and responsible-use constraints."

## 1:28-1:30 - Close

"The result is open, reproducible infrastructure that future women's health AI researchers can reuse, compare against, and extend with richer longitudinal datasets."
