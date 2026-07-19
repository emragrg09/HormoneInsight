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
    description:
      "A few basics about you. This helps the model compare your answers to similar participants.",
    features: ["RIDAGEYR", "RIDRETH3", "DMDEDUC2", "DMDMARTZ", "INDFMPIR"],
  },
  {
    id: "reproductive",
    title: "Menstrual & Reproductive Health",
    description:
      "Questions about your reproductive health history. Leave any question blank if you are unsure — please do not guess or enter zero.",
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
    description:
      "These measurements help the model understand general physical health. Approximate values are fine.",
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
    title: "Sex Hormone Panel",
    description:
      "Enter values from a recent lab report if you have one. Leave any field blank if unavailable — please do not enter zero.",
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
    title: "Metabolic, Inflammation & Lipid Panel",
    description:
      "Optional lab values that describe metabolism, inflammation, and cholesterol. Leave any field blank if unavailable — please do not enter zero.",
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
  RIDAGEYR: {
    label: "Age",
    unit: "years",
    min: 18,
    max: 100,
    step: 1,
    description: "Your current age in years.",
  },
  RIDRETH3: {
    label: "Race / Ethnicity",
    description: "The group you most identify with.",
    categoricalLabels: {
      "1": "Mexican American",
      "2": "Other Hispanic",
      "3": "White (non-Hispanic)",
      "4": "Black (non-Hispanic)",
      "6": "Asian (non-Hispanic)",
      "7": "Other or mixed",
    },
  },
  DMDEDUC2: {
    label: "Highest Education Level",
    description: "The highest level of school you have completed.",
    categoricalLabels: {
      "1": "Less than 9th grade",
      "2": "Some high school (no diploma)",
      "3": "High school diploma or GED",
      "4": "Some college or associate degree",
      "5": "College graduate or higher",
    },
  },
  DMDMARTZ: {
    label: "Marital Status",
    categoricalLabels: {
      "1": "Married or living with a partner",
      "2": "Widowed, divorced, or separated",
      "3": "Never married",
    },
  },
  INDFMPIR: {
    label: "Family Income Ratio",
    unit: "ratio",
    min: 0,
    max: 5,
    step: 0.01,
    description:
      "Your family income compared to the poverty line (0 = at the line, higher = more income). Skip if unsure.",
  },

  // Reproductive
  RIDEXPRG: {
    label: "Current Pregnancy Status",
    description: "Are you currently pregnant?",
    categoricalLabels: { "1": "Pregnant", "2": "Not pregnant" },
  },
  RHQ010: {
    label: "Age at First Menstrual Period",
    unit: "years",
    min: 5,
    max: 25,
    step: 1,
    description: "Age when your first menstrual period began.",
  },
  RHQ078: {
    label: "Ever Breastfed",
    description: "Have you ever breastfed a child?",
    categoricalLabels: yesNo,
  },
  RHQ131: {
    label: "Had Hysterectomy",
    description: "Have you had a hysterectomy (uterus removed)?",
    categoricalLabels: yesNo,
  },
  RHD167: {
    label: "Number of Pregnancies",
    unit: "count",
    min: 0,
    max: 20,
    step: 1,
    description: "Total number of times you have been pregnant.",
  },
  RHQ200: {
    label: "Menstrual Periods in Last 12 Months",
    description: "Have you had menstrual periods in the past 12 months?",
    categoricalLabels: yesNo,
  },
  RHD280: {
    label: "Ever Had a Baby",
    description: "Have you ever given birth to a live baby?",
    categoricalLabels: yesNo,
  },
  RHQ305: {
    label: "Currently Using Hormone Therapy",
    description: "Are you currently taking hormone therapy (e.g. estrogen)?",
    categoricalLabels: yesNo,
  },
  URXPREG: {
    label: "Urine Pregnancy Test",
    description: "Result of a recent urine pregnancy test, if you have one.",
    categoricalLabels: { "1": "Positive", "2": "Negative" },
  },

  // Body
  BMXWT: {
    label: "Weight",
    unit: "kg",
    min: 20,
    max: 250,
    step: 0.1,
    description: "Your body weight in kilograms.",
  },
  BMXHT: {
    label: "Height",
    unit: "cm",
    min: 100,
    max: 220,
    step: 0.1,
    description: "Your height in centimeters.",
  },
  BMXBMI: {
    label: "Body Mass Index (BMI)",
    unit: "kg/m²",
    min: 10,
    max: 70,
    step: 0.1,
    description: "Body Mass Index (weight divided by height squared).",
  },
  BMXWAIST: {
    label: "Waist Circumference",
    unit: "cm",
    min: 40,
    max: 200,
    step: 0.1,
    description: "Measured around your waist in centimeters.",
  },
  BMXHIP: {
    label: "Hip Circumference",
    unit: "cm",
    min: 40,
    max: 200,
    step: 0.1,
    description: "Measured around the widest part of your hips.",
  },
  BMXLEG: {
    label: "Upper Leg Length",
    unit: "cm",
    min: 20,
    max: 70,
    step: 0.1,
    description: "Length of the upper leg from hip to knee.",
  },
  BMXARML: {
    label: "Upper Arm Length",
    unit: "cm",
    min: 15,
    max: 60,
    step: 0.1,
    description: "Length of the upper arm from shoulder to elbow.",
  },
  BMXARMC: {
    label: "Upper Arm Circumference",
    unit: "cm",
    min: 15,
    max: 70,
    step: 0.1,
    description: "Measured around the middle of your upper arm.",
  },

  // Sex steroid hormones
  LBXAND: {
    label: "Androstenedione",
    unit: "ng/dL",
    min: 0,
    step: 0.1,
    description: "A precursor hormone to testosterone and estrogen.",
  },
  LBXAMH: {
    label: "Anti-Müllerian Hormone (AMH)",
    unit: "ng/mL",
    min: 0,
    step: 0.01,
    description: "Reflects ovarian reserve.",
  },
  LBXDHE: {
    label: "DHEA",
    unit: "µg/dL",
    min: 0,
    step: 0.1,
    description: "An adrenal hormone that decreases with age.",
  },
  LBXEST: {
    label: "Estradiol (E2)",
    unit: "pg/mL",
    min: 0,
    step: 0.1,
    description: "The main form of estrogen during reproductive years.",
  },
  LBXESO: {
    label: "Estrone",
    unit: "ng/dL",
    min: 0,
    step: 0.1,
    description: "A form of estrogen that becomes more prominent after menopause.",
  },
  LBXPG4: {
    label: "Progesterone",
    unit: "ng/dL",
    min: 0,
    step: 0.01,
    description: "Rises after ovulation and during pregnancy.",
  },
  LBXSHBG: {
    label: "Sex Hormone Binding Globulin (SHBG)",
    unit: "nmol/L",
    min: 0,
    step: 0.1,
    description: "Protein that binds sex hormones in the blood.",
  },
  LBXTST: {
    label: "Total Testosterone",
    unit: "ng/dL",
    min: 0,
    step: 0.1,
    description: "Total testosterone circulating in your blood.",
  },

  // Metabolic / labs
  LBXIN: {
    label: "Insulin",
    unit: "µU/mL",
    min: 0,
    step: 0.1,
    description: "Fasting insulin level from a blood test.",
  },
  LBXGLU: {
    label: "Fasting Glucose",
    unit: "mg/dL",
    min: 20,
    max: 500,
    step: 0.1,
    description: "Blood sugar measured after fasting.",
  },
  LBXGH: {
    label: "HbA1c (Glycohemoglobin)",
    unit: "%",
    min: 3,
    max: 20,
    step: 0.1,
    description: "Average blood sugar over the past ~3 months.",
  },
  LBXHSCRP: {
    label: "hs-CRP (Inflammation Marker)",
    unit: "mg/L",
    min: 0,
    step: 0.01,
    description: "High-sensitivity C-reactive protein — a marker of inflammation.",
  },
  LBDHDD: {
    label: "HDL Cholesterol",
    unit: "mg/dL",
    min: 10,
    max: 200,
    step: 0.1,
    description: "Often called \"good\" cholesterol.",
  },
  LBXTC: {
    label: "Total Cholesterol",
    unit: "mg/dL",
    min: 50,
    max: 500,
    step: 0.1,
    description: "All cholesterol in your blood combined.",
  },
  LBDLDL: {
    label: "LDL Cholesterol",
    unit: "mg/dL",
    min: 10,
    max: 400,
    step: 0.1,
    description: "Often called \"bad\" cholesterol.",
  },
  LBXTLG: {
    label: "Triglycerides",
    unit: "mg/dL",
    min: 10,
    max: 2000,
    step: 0.1,
    description: "A type of fat in the blood.",
  },
  LBXSAL: {
    label: "Albumin",
    unit: "g/dL",
    min: 0,
    step: 0.1,
    description: "A protein that reflects liver and nutrition status.",
  },
  LBXSAPSI: {
    label: "Alkaline Phosphatase",
    unit: "U/L",
    min: 0,
    step: 0.1,
    description: "Enzyme related to liver and bone health.",
  },
  LBXSASSI: {
    label: "AST (Liver Enzyme)",
    unit: "U/L",
    min: 0,
    step: 0.1,
    description: "Aspartate aminotransferase — a liver enzyme.",
  },
  LBXSATSI: {
    label: "ALT (Liver Enzyme)",
    unit: "U/L",
    min: 0,
    step: 0.1,
    description: "Alanine aminotransferase — a liver enzyme.",
  },
  LBXSBU: {
    label: "Blood Urea Nitrogen",
    unit: "mg/dL",
    min: 0,
    step: 0.1,
    description: "Reflects kidney function.",
  },
  LBXSCA: {
    label: "Calcium",
    unit: "mg/dL",
    min: 0,
    step: 0.1,
    description: "Blood calcium level.",
  },
  LBXSCR: {
    label: "Creatinine",
    unit: "mg/dL",
    min: 0,
    step: 0.01,
    description: "Waste product used to assess kidney function.",
  },
  LBXSGL: {
    label: "Glucose (Serum)",
    unit: "mg/dL",
    min: 0,
    step: 0.1,
    description: "Blood sugar measured in serum.",
  },
  LBXSIR: {
    label: "Iron",
    unit: "µg/dL",
    min: 0,
    step: 0.1,
    description: "Iron level in your blood.",
  },
  LBXSTB: {
    label: "Total Bilirubin",
    unit: "mg/dL",
    min: 0,
    step: 0.01,
    description: "Reflects liver function and red blood cell breakdown.",
  },
  LBXSTP: {
    label: "Total Protein",
    unit: "g/dL",
    min: 0,
    step: 0.1,
    description: "Total protein in your blood.",
  },
  LBXSTR: {
    label: "Triglycerides (Serum)",
    unit: "mg/dL",
    min: 0,
    step: 0.1,
    description: "Blood fats measured in serum.",
  },
  LBXSUA: {
    label: "Uric Acid",
    unit: "mg/dL",
    min: 0,
    step: 0.1,
    description: "Waste product; high levels can affect joints.",
  },
};

export function getFeatureLabel(code: string, fallback?: string): string {
  return FEATURE_META[code]?.label ?? fallback ?? code;
}

export function getCategoricalLabel(code: string, value: string | number): string {
  const key = String(value);
  return FEATURE_META[code]?.categoricalLabels?.[key] ?? key;
}
