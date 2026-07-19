# Outputs

Running `python src/baseline.py` writes:

- `metrics_summary.csv` - one-row-per-task evaluation summary
- `*_metrics.json` - task-specific evaluation metrics
- `*_predictions.csv` - task-specific test-set predictions
- `*_feature_importance.csv` - task-specific logistic-regression coefficients
- `feature_dictionary.csv` - selected feature descriptions and source categories
- `*.svg` - lightweight charts for class balance, age distribution, and top predictors
