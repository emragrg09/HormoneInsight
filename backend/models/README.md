# Model Artifacts

Run the training pipeline to generate model artifacts:

```powershell
python src\baseline.py
```

Expected files:

- `nhanes-menopause-logreg-v1.npz` - NumPy weights and bias
- `nhanes-menopause-logreg-v1.json` - feature order, preprocessing parameters, threshold, metadata, and metrics

The API loads these files once at startup and does not retrain the model.
