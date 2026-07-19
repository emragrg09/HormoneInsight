import type {
  FeatureSchema,
  HealthResponse,
  ModelInfo,
  PredictRequest,
  PredictResponse,
  SampleParticipant,
} from "@/types/api";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockFeatureSchema: FeatureSchema = {
  version: "mock-0.1",
  sections: [
    {
      id: "about_you",
      title: "About You",
      description: "Basic demographic information used by the model.",
      fields: [
        {
          name: "age",
          label: "Age",
          type: "number",
          required: true,
          unit: "years",
          min: 18,
          max: 100,
          step: 1,
          description: "Your age in completed years.",
        },
        {
          name: "race_ethnicity",
          label: "Race or ethnicity",
          type: "select",
          required: false,
          description: "Used only if the model requires it for feature parity with NHANES.",
          options: [
            { value: "mexican_american", label: "Mexican American" },
            { value: "other_hispanic", label: "Other Hispanic" },
            { value: "non_hispanic_white", label: "Non-Hispanic White" },
            { value: "non_hispanic_black", label: "Non-Hispanic Black" },
            { value: "non_hispanic_asian", label: "Non-Hispanic Asian" },
            { value: "other", label: "Other / Multi-racial" },
          ],
        },
        {
          name: "education",
          label: "Education level",
          type: "select",
          required: false,
          options: [
            { value: "less_than_hs", label: "Less than high school" },
            { value: "hs_ged", label: "High school / GED" },
            { value: "some_college", label: "Some college" },
            { value: "college_grad", label: "College graduate or higher" },
          ],
        },
      ],
    },
    {
      id: "menstrual_reproductive",
      title: "Menstrual and Reproductive Health",
      description:
        "Questions from the NHANES reproductive health questionnaire.",
      fields: [
        {
          name: "periods_regular",
          label: "Are your periods currently regular?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "unsure", label: "Unsure" },
          ],
        },
        {
          name: "reason_not_regular",
          label: "If not regular, reason",
          type: "select",
          required: false,
          description:
            "Self-reported reason. 'Menopause / change of life' is the modeled target when applicable.",
          options: [
            { value: "pregnancy", label: "Pregnancy" },
            { value: "breastfeeding", label: "Breastfeeding" },
            { value: "hysterectomy", label: "Hysterectomy" },
            { value: "menopause", label: "Menopause / change of life" },
            { value: "medical_condition", label: "Medical condition" },
            { value: "medication", label: "Medication or hormonal contraception" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "age_at_menarche",
          label: "Age at first period",
          type: "number",
          required: false,
          unit: "years",
          min: 8,
          max: 20,
          step: 1,
        },
        {
          name: "pregnancies",
          label: "Number of pregnancies",
          type: "number",
          required: false,
          min: 0,
          max: 20,
          step: 1,
        },
        {
          name: "pregnancy_test",
          label: "Pregnancy test result",
          type: "radio",
          required: false,
          description: "If a test was performed for the survey.",
          options: [
            { value: "negative", label: "Negative" },
            { value: "positive", label: "Positive" },
            { value: "not_tested", label: "Not tested" },
          ],
        },
      ],
    },
    {
      id: "body_measurements",
      title: "Body Measurements",
      fields: [
        { name: "height_cm", label: "Height", type: "number", required: false, unit: "cm", min: 120, max: 220, step: 0.1 },
        { name: "weight_kg", label: "Weight", type: "number", required: false, unit: "kg", min: 30, max: 250, step: 0.1 },
        { name: "bmi", label: "BMI", type: "number", required: false, unit: "kg/m²", min: 10, max: 70, step: 0.1, description: "Body mass index." },
        { name: "waist_cm", label: "Waist circumference", type: "number", required: false, unit: "cm", min: 40, max: 200, step: 0.1 },
      ],
    },
    {
      id: "hormones_labs",
      title: "Hormone and Laboratory Values",
      description:
        "Enter values from a recent lab report. Leave blank if unavailable — please do not enter zero.",
      fields: [
        { name: "estradiol", label: "Estradiol", type: "number", required: false, unit: "pg/mL", min: 0, max: 1000, step: 0.1, description: "Serum estradiol (E2)." },
        { name: "testosterone", label: "Testosterone", type: "number", required: false, unit: "ng/dL", min: 0, max: 500, step: 0.1, description: "Total testosterone." },
        { name: "shbg", label: "Sex hormone binding globulin (SHBG)", type: "number", required: false, unit: "nmol/L", min: 0, max: 300, step: 0.1 },
        { name: "glucose", label: "Glucose (fasting)", type: "number", required: false, unit: "mg/dL", min: 40, max: 400, step: 0.1 },
        { name: "insulin", label: "Insulin", type: "number", required: false, unit: "µU/mL", min: 0, max: 300, step: 0.1 },
        { name: "hba1c", label: "Glycohemoglobin (HbA1c)", type: "number", required: false, unit: "%", min: 3, max: 15, step: 0.1 },
        { name: "crp", label: "Inflammation marker (hs-CRP)", type: "number", required: false, unit: "mg/L", min: 0, max: 100, step: 0.01 },
        { name: "total_cholesterol", label: "Total cholesterol", type: "number", required: false, unit: "mg/dL", min: 50, max: 500, step: 0.1 },
        { name: "hdl", label: "HDL cholesterol", type: "number", required: false, unit: "mg/dL", min: 10, max: 150, step: 0.1 },
        { name: "ldl", label: "LDL cholesterol", type: "number", required: false, unit: "mg/dL", min: 10, max: 300, step: 0.1 },
        { name: "triglycerides", label: "Triglycerides", type: "number", required: false, unit: "mg/dL", min: 10, max: 1000, step: 0.1 },
      ],
    },
  ],
};

export const mockModelInfo: ModelInfo = {
  name: "Hormone Insight — NHANES menopause-related menstrual-change model",
  task: "Predict whether a female NHANES participant reported 'menopause / change of life' as the reason for not having regular periods.",
  algorithm: "Class-balanced binary logistic regression implemented from scratch with NumPy.",
  dataset: "NHANES 2021–2023",
  modules: [
    "Demographics",
    "Reproductive health questionnaire",
    "Body measurements",
    "Sex steroid hormone panel",
    "Glucose, insulin, and glycohemoglobin",
    "Inflammation marker (hs-CRP)",
    "Biochemistry profile",
    "Lipid panel",
    "Pregnancy test",
  ],
  target_description:
    "Self-reported response to the NHANES reproductive-health question about the reason for not having regular periods. The target is not clinically confirmed menopause.",
  metrics: {
    accuracy: null,
    precision: null,
    recall: null,
    f1: null,
    roc_auc: null,
  },
};

export const mockSample: SampleParticipant = {
  features: {
    age: 54,
    race_ethnicity: "non_hispanic_white",
    education: "college_grad",
    periods_regular: "no",
    reason_not_regular: "menopause",
    age_at_menarche: 13,
    pregnancies: 2,
    pregnancy_test: "negative",
    height_cm: 165,
    weight_kg: 72,
    bmi: 26.4,
    waist_cm: 88,
    estradiol: 38,
    testosterone: 22,
    shbg: 58,
    glucose: 96,
    insulin: 8.4,
    hba1c: 5.6,
    crp: 1.9,
    total_cholesterol: 205,
    hdl: 62,
    ldl: 120,
    triglycerides: 115,
  },
};

function bandFor(p: number) {
  if (p < 0.34) return "lower" as const;
  if (p < 0.67) return "moderate" as const;
  return "higher" as const;
}

export async function mockPredict(req: PredictRequest): Promise<PredictResponse> {
  await delay(1400);
  const f = req.features;
  const age = Number(f.age ?? 40);
  const estradiol = f.estradiol != null ? Number(f.estradiol) : null;

  // Simple deterministic mock "score" so results feel realistic — NOT a real model.
  let score = -3.2 + (age - 45) * 0.11;
  if (f.periods_regular === "no") score += 0.9;
  if (f.reason_not_regular === "menopause") score += 1.6;
  if (f.reason_not_regular === "pregnancy") score -= 2.5;
  if (f.pregnancy_test === "positive") score -= 2.0;
  if (estradiol != null && estradiol < 50) score += 0.5;
  const probability = 1 / (1 + Math.exp(-score));

  const positive = [
    age >= 45 && {
      feature_name: "age",
      label: "Age",
      original_value: age,
      contribution: Math.max(0.1, (age - 45) * 0.09),
    },
    estradiol != null && estradiol < 50 && {
      feature_name: "estradiol",
      label: "Estradiol",
      original_value: estradiol,
      contribution: 0.68,
    },
    f.periods_regular === "no" && {
      feature_name: "periods_regular",
      label: "Periods currently regular",
      original_value: "No",
      contribution: 0.54,
    },
  ].filter(Boolean) as PredictResponse["top_positive_contributions"];

  const negative = [
    f.pregnancy_test === "negative" && {
      feature_name: "pregnancy_test",
      label: "Pregnancy test",
      original_value: "Negative",
      contribution: -0.42,
    },
    f.reason_not_regular === "pregnancy" && {
      feature_name: "reason_not_regular",
      label: "Reason periods not regular",
      original_value: "Pregnancy",
      contribution: -1.1,
    },
    age < 40 && {
      feature_name: "age",
      label: "Age",
      original_value: age,
      contribution: -0.6,
    },
  ].filter(Boolean) as PredictResponse["top_negative_contributions"];

  const band = bandFor(probability);

  return {
    probability,
    predicted_class: probability >= 0.5 ? 1 : 0,
    threshold: 0.5,
    likelihood_band: band,
    top_positive_contributions: positive.slice(0, 5),
    top_negative_contributions: negative.slice(0, 5),
    explanation:
      "The entered information shows a " +
      band +
      " similarity to NHANES participants who selected menopause or change of life as the reason for not having regular periods.",
    disclaimer: "This is a research prototype and not a medical diagnosis.",
  };
}

export async function mockHealth(): Promise<HealthResponse> {
  await delay(120);
  return { status: "ok", version: "mock-0.1" };
}

export async function mockGetSchema(): Promise<FeatureSchema> {
  await delay(200);
  return mockFeatureSchema;
}

export async function mockGetModelInfo(): Promise<ModelInfo> {
  await delay(200);
  return mockModelInfo;
}

export async function mockGetSample(): Promise<SampleParticipant> {
  await delay(200);
  return mockSample;
}
