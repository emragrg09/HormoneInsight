// Frontend display metadata for NHANES-coded backend features.
// The backend exposes raw feature codes; this module supplies
// human-readable labels, units, descriptions, section groupings,
// and categorical value labels for the assessment UI.

export interface CategoricalOptionMeta {
  value: string; // encoded value returned by /feature-schema
  label: string; // friendly label shown to the user
}

export interface FeatureMeta {
  label: string;
  unit?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  categoricalLabels?: Record<string, string>;
}

export interface SectionMeta {
  id: string;
  title: string;
  description?: string;
  features: string[]; // raw NHANES codes in preferred display order
}

export const SECTIONS: SectionMeta[] = [
  {
    id: "demographics",
    title: "About You",
    description: "Basic demographic information used by the model.",
    features: ["RIDAGEYR", "RIDRETH3", "DMDEDUC2", "DMDMARTZ", "INDFMPIR"],
  },
  {
    id: "reproductive",
    title: "Menstrual and Reproductive Health",
    description: "Questions from the NHANES reproductive health questionnaire.",
    features: [
      "RIDEXPRG",
      "RHQ010",
      "RHQ078",
      "RHQ131",
      "RHD167",
      "RHQ200",
      "RHD280",
      "RHQ305",
      "URXPREG",
    ],
  },
  {
    id: "body",
    title: "Body Measurements",
    features: [
      "BMXWT",
      "BMXHT",
      "BMXBMI",
      "BMXWAIST",
      "BMXHIP",
      "BMXLEG",
      "BMXARML",
      "BMXARMC",
    ],
  },
  {
    id: "hormones",
    title: "Sex Steroid Hormone Panel",
    description:
      "Enter values from a recent lab report. Leave blank if unavailable — please do not enter zero.",
    features: [
      "LBXAND",
      "LBXAMH",
      "LBXDHE",
      "LBXEST",
      "LBXESO",
      "LBXPG4",
      "LBXSHBG",
      "LBXTST",
    ],
  },
  {
    id: "labs",
    title: "Metabolic, Inflammation, and Lipid Panel",
    description:
      "Optional laboratory values. Leave blank if unavailable — please do not enter zero.",
    features: [
      "LBXIN",
      "LBXGLU",
      "LBXGH",
      "LBXHSCRP",
      "LBDHDD",
      "LBXTC",
      "LBDLDL",
      "LBXTLG",
      "LBXSAL",
      "LBXSAPSI",
      "LBXSASSI",
      "LBXSATSI",
      "LBXSBU",
      "LBXSCA",
      "LBXSCR",
      "LBXSGL",
      "LBXSIR",
      "LBXSTB",
      "LBXSTP",
      "LBXSTR",
      "LBXSUA",
    ],
  },
];

const yesNo = { "1": "Yes", "2": "No" };

export const FEATURE_META: Record<string, FeatureMeta> = {
  // Demographics
  RIDAGEYR: { label: "Age", unit: "years", min: 18, max: 100, step: 1 },
  RIDRETH3: {
    label: "Race or ethnicity",
    categoricalLabels: {
      "1": "Mexican American",
      "2": "Other Hispanic",
      "3": "Non-Hispanic White",
      "4": "Non-Hispanic Black",
      "6": "Non-Hispanic Asian",
      "7": "Other or Multi-racial",
    },
  },
  DMDEDUC2: {
    label: "Education level",
    categoricalLabels: {
      "1": "Less than 9th grade",
      "2": "9th–11th grade (no diploma)",
      "3": "High school graduate / GED",
      "4": "Some college or AA degree",
      "5": "College graduate or higher",
    },
  },
  DMDMARTZ: {
    label: "Marital status",
    categoricalLabels: {
      "1": "Married or living with partner",
      "2": "Widowed, divorced, or separated",
      "3": "Never married",
    },
  },
  INDFMPIR: {
    label: "Family income-to-poverty ratio",
    unit: "ratio",
    min: 0,
    max: 5,
    step: 0.01,
    description: "NHANES INDFMPIR. Ratio of family income to poverty threshold.",
  },

  // Reproductive
  RIDEXPRG: {
    label: "Pregnancy status at interview",
    categoricalLabels: { "1": "Pregnant", "2": "Not pregnant" },
  },
  RHQ010: {
    label: "Age at first menstrual period",
    unit: "years",
    min: 5,
    max: 25,
    step: 1,
  },
  RHQ078: {
    label: "Ever told you had pelvic infection or PID",
    categoricalLabels: yesNo,
  },
  RHQ131: { label: "Ever been pregnant", categoricalLabels: yesNo },
  RHD167: {
    label: "Number of live births",
    unit: "count",
    min: 0,
    max: 20,
    step: 1,
  },
  RHQ200: {
    label: "Currently breastfeeding a child",
    categoricalLabels: yesNo,
  },
  RHD280: {
    label: "Had hysterectomy (uterus removed)",
    categoricalLabels: yesNo,
  },
  RHQ305: {
    label: "Both ovaries removed",
    categoricalLabels: yesNo,
  },
  URXPREG: {
    label: "Urine pregnancy test result",
    categoricalLabels: { "1": "Positive", "2": "Negative" },
  },

  // Body
  BMXWT: { label: "Weight", unit: "kg", min: 20, max: 250, step: 0.1 },
  BMXHT: { label: "Height", unit: "cm", min: 100, max: 220, step: 0.1 },
  BMXBMI: {
    label: "Body mass index (BMI)",
    unit: "kg/m²",
    min: 10,
    max: 70,
    step: 0.1,
  },
  BMXWAIST: {
    label: "Waist circumference",
    unit: "cm",
    min: 40,
    max: 200,
    step: 0.1,
  },
  BMXHIP: { label: "Hip circumference", unit: "cm", min: 40, max: 200, step: 0.1 },
  BMXLEG: { label: "Upper leg length", unit: "cm", min: 20, max: 70, step: 0.1 },
  BMXARML: { label: "Upper arm length", unit: "cm", min: 15, max: 60, step: 0.1 },
  BMXARMC: { label: "Arm circumference", unit: "cm", min: 15, max: 70, step: 0.1 },

  // Sex steroid hormones
  LBXAND: { label: "Androstenedione", unit: "ng/dL", min: 0, step: 0.1 },
  LBXAMH: { label: "Anti-Müllerian hormone (AMH)", unit: "ng/mL", min: 0, step: 0.01 },
  LBXDHE: { label: "DHEA", unit: "µg/dL", min: 0, step: 0.1 },
  LBXEST: { label: "Estradiol (E2)", unit: "pg/mL", min: 0, step: 0.1 },
  LBXESO: { label: "Estrone", unit: "ng/dL", min: 0, step: 0.1 },
  LBXPG4: { label: "Progesterone", unit: "ng/dL", min: 0, step: 0.01 },
  LBXSHBG: {
    label: "Sex hormone binding globulin (SHBG)",
    unit: "nmol/L",
    min: 0,
    step: 0.1,
  },
  LBXTST: { label: "Total testosterone", unit: "ng/dL", min: 0, step: 0.1 },

  // Metabolic / labs
  LBXIN: { label: "Insulin", unit: "µU/mL", min: 0, step: 0.1 },
  LBXGLU: { label: "Glucose (fasting)", unit: "mg/dL", min: 20, max: 500, step: 0.1 },
  LBXGH: { label: "Glycohemoglobin (HbA1c)", unit: "%", min: 3, max: 20, step: 0.1 },
  LBXHSCRP: { label: "hs-CRP (inflammation marker)", unit: "mg/L", min: 0, step: 0.01 },
  LBDHDD: { label: "HDL cholesterol", unit: "mg/dL", min: 10, max: 200, step: 0.1 },
  LBXTC: { label: "Total cholesterol", unit: "mg/dL", min: 50, max: 500, step: 0.1 },
  LBDLDL: { label: "LDL cholesterol", unit: "mg/dL", min: 10, max: 400, step: 0.1 },
  LBXTLG: { label: "Triglycerides", unit: "mg/dL", min: 10, max: 2000, step: 0.1 },
  LBXSAL: { label: "Albumin", unit: "g/dL", min: 0, step: 0.1 },
  LBXSAPSI: { label: "Alkaline phosphatase", unit: "U/L", min: 0, step: 0.1 },
  LBXSASSI: { label: "AST (aspartate aminotransferase)", unit: "U/L", min: 0, step: 0.1 },
  LBXSATSI: { label: "ALT (alanine aminotransferase)", unit: "U/L", min: 0, step: 0.1 },
  LBXSBU: { label: "Blood urea nitrogen", unit: "mg/dL", min: 0, step: 0.1 },
  LBXSCA: { label: "Calcium", unit: "mg/dL", min: 0, step: 0.1 },
  LBXSCR: { label: "Creatinine", unit: "mg/dL", min: 0, step: 0.01 },
  LBXSGL: { label: "Glucose (serum)", unit: "mg/dL", min: 0, step: 0.1 },
  LBXSIR: { label: "Iron", unit: "µg/dL", min: 0, step: 0.1 },
  LBXSTB: { label: "Total bilirubin", unit: "mg/dL", min: 0, step: 0.01 },
  LBXSTP: { label: "Total protein", unit: "g/dL", min: 0, step: 0.1 },
  LBXSTR: { label: "Triglycerides (serum)", unit: "mg/dL", min: 0, step: 0.1 },
  LBXSUA: { label: "Uric acid", unit: "mg/dL", min: 0, step: 0.1 },
};

export function getFeatureLabel(code: string, fallback?: string): string {
  return FEATURE_META[code]?.label ?? fallback ?? code;
}

export function getCategoricalLabel(code: string, value: string | number): string {
  const key = String(value);
  return FEATURE_META[code]?.categoricalLabels?.[key] ?? key;
}
