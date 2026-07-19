from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = ROOT / "data" / "processed"
OUTPUT_DIR = ROOT / "outputs"
MODEL_DIR = ROOT / "models"

RAW_FILES = {
    "demo": ROOT / "DEMO_L.xpt",
    "rhq": ROOT / "RHQ_L.xpt",
    "bmx": ROOT / "BMX_L.xpt",
}

LAB_FILES = {
    "tst": {
        "path": ROOT / "TST_L.xpt",
        "columns": [
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
    "ins": {"path": ROOT / "INS_L.xpt", "columns": ["LBXIN"]},
    "glu": {"path": ROOT / "GLU_L.xpt", "columns": ["LBXGLU"]},
    "ghb": {"path": ROOT / "GHB_L.xpt", "columns": ["LBXGH"]},
    "hscrp": {"path": ROOT / "HSCRP_L.xpt", "columns": ["LBXHSCRP"]},
    "biopro": {
        "path": ROOT / "BIOPRO_L.xpt",
        "columns": [
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
    "hdl": {"path": ROOT / "HDL_L.xpt", "columns": ["LBDHDD"]},
    "tchol": {"path": ROOT / "TCHOL_L.xpt", "columns": ["LBXTC"]},
    "trigly": {"path": ROOT / "TRIGLY_L.xpt", "columns": ["LBXTLG", "LBDLDL"]},
    "ucpreg": {"path": ROOT / "UCPREG_L.xpt", "columns": ["URXPREG"]},
}

BASE_FEATURES = [
    "RIDAGEYR",
    "RIDRETH3",
    "DMDEDUC2",
    "DMDMARTZ",
    "INDFMPIR",
    "RIDEXPRG",
    "RHQ010",
    "RHQ078",
    "RHQ131",
    "RHD167",
    "RHQ200",
    "RHD280",
    "RHQ305",
    "BMXWT",
    "BMXHT",
    "BMXBMI",
    "BMXLEG",
    "BMXARML",
    "BMXARMC",
    "BMXWAIST",
    "BMXHIP",
    "LBXAND",
    "LBXAMH",
    "LBXDHE",
    "LBXEST",
    "LBXESO",
    "LBXPG4",
    "LBXSHBG",
    "LBXTST",
    "LBXIN",
    "LBXGLU",
    "LBXGH",
    "LBXHSCRP",
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
    "LBDHDD",
    "LBXTC",
    "LBXTLG",
    "LBDLDL",
    "URXPREG",
]

CATEGORICAL_FEATURES = [
    "RIDRETH3",
    "DMDEDUC2",
    "DMDMARTZ",
    "RIDEXPRG",
    "RHQ078",
    "RHQ131",
    "RHQ200",
    "RHD280",
    "RHQ305",
    "URXPREG",
]

NUMERIC_FEATURES = [
    feature for feature in BASE_FEATURES if feature not in CATEGORICAL_FEATURES
]

LAB_FEATURES = [
    feature
    for feature in BASE_FEATURES
    if feature.startswith("LB") or feature == "URXPREG"
]

MISSING_CODES = {
    "DMDEDUC2": [7, 9],
    "DMDMARTZ": [77, 99],
    "RIDEXPRG": [3],
    "RHQ010": [777, 999],
    "RHQ078": [7, 9],
    "RHQ131": [7, 9],
    "RHD167": [77, 99],
    "RHQ200": [7, 9],
    "RHD280": [7, 9],
    "RHQ305": [7, 9],
    "URXPREG": [3],
}

FEATURE_DESCRIPTIONS = {
    "LBXAND": "Androstenedione",
    "LBXAMH": "Anti-Mullerian hormone",
    "LBXDHE": "DHEA",
    "LBXEST": "Estradiol",
    "LBXESO": "Estrone",
    "LBXPG4": "Progesterone",
    "LBXSHBG": "Sex hormone binding globulin",
    "LBXTST": "Total testosterone",
    "LBXIN": "Insulin",
    "LBXGLU": "Fasting glucose",
    "LBXGH": "Glycohemoglobin",
    "LBXHSCRP": "High-sensitivity C-reactive protein",
    "LBXSAL": "Albumin",
    "LBXSAPSI": "Alkaline phosphatase",
    "LBXSASSI": "AST",
    "LBXSATSI": "ALT",
    "LBXSBU": "Blood urea nitrogen",
    "LBXSCA": "Calcium",
    "LBXSCR": "Creatinine",
    "LBXSGL": "Glucose, serum",
    "LBXSIR": "Iron",
    "LBXSTB": "Total bilirubin",
    "LBXSTP": "Total protein",
    "LBXSTR": "Triglycerides, biochemistry profile",
    "LBXSUA": "Uric acid",
    "LBDHDD": "HDL cholesterol",
    "LBXTC": "Total cholesterol",
    "LBXTLG": "Triglycerides",
    "LBDLDL": "LDL cholesterol",
    "URXPREG": "Urine pregnancy test",
}

FEATURE_LABELS = {
    feature: FEATURE_DESCRIPTIONS.get(feature, feature) for feature in BASE_FEATURES
}

TASKS = {
    "menopause": {
        "label": "Menopause/change of life",
        "target_column": "target_menopause_change_of_life",
        "positive_definition": "RHD043 == 7, menopause/change of life",
        "negative_definition": "RHQ031 == 1, had regular periods in past 12 months",
    },
    "irregular_reproductive_age": {
        "label": "Non-menopause no-period signal, ages 20-45",
        "target_column": "target_irregular_reproductive_age",
        "positive_definition": "Age 20-45 and RHD043 == 9, other reason for no regular periods",
        "negative_definition": "Age 20-45 and RHQ031 == 1, had regular periods in past 12 months",
    },
}

MODEL_VERSION = "nhanes-menopause-logreg-v1"
