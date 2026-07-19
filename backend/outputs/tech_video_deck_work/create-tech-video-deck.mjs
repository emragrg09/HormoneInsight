import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT_DIR = "C:/Users/Emra/Desktop/womenhealth/outputs";
const QA_DIR = "C:/Users/Emra/Desktop/womenhealth/outputs/tech_video_deck_work/qa";
const FINAL_PPTX = path.join(OUT_DIR, "backend-tech-video-slides.pptx");

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function addText(slide, text, position, style = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    fontSize: style.fontSize ?? 22,
    bold: style.bold ?? false,
    color: style.color ?? "slate-900",
    alignment: style.alignment ?? "left",
  };
  return box;
}

function addPill(slide, text, left, top, width, fill = "emerald-50") {
  const shape = slide.shapes.add({
    geometry: "roundRect",
    position: { left, top, width, height: 44 },
    fill,
    line: { style: "solid", fill: "emerald-200", width: 1 },
    borderRadius: "rounded-xl",
  });
  shape.text = text;
  shape.text.style = { fontSize: 18, bold: true, color: "emerald-800", alignment: "center" };
  return shape;
}

function addCard(slide, title, body, left, top, width, height, accent = "emerald-600") {
  slide.shapes.add({
    geometry: "roundRect",
    position: { left, top, width, height },
    fill: "white",
    line: { style: "solid", fill: "slate-200", width: 1 },
    borderRadius: "rounded-xl",
    shadow: "shadow-sm",
  });
  slide.shapes.add({
    geometry: "rect",
    position: { left, top, width: 7, height },
    fill: accent,
    line: { style: "solid", fill: accent, width: 0 },
  });
  addText(slide, title, { left: left + 22, top: top + 20, width: width - 44, height: 36 }, {
    fontSize: 22,
    bold: true,
    color: "slate-950",
  });
  addText(slide, body, { left: left + 22, top: top + 62, width: width - 44, height: height - 78 }, {
    fontSize: 18,
    color: "slate-600",
  });
}

function addHeader(slide, eyebrow, title, subtitle) {
  addText(slide, eyebrow, { left: 72, top: 54, width: 640, height: 26 }, {
    fontSize: 16,
    bold: true,
    color: "emerald-700",
  });
  addText(slide, title, { left: 72, top: 94, width: 1020, height: 96 }, {
    fontSize: 42,
    bold: true,
    color: "slate-950",
  });
  if (subtitle) {
    addText(slide, subtitle, { left: 72, top: 184, width: 980, height: 58 }, {
      fontSize: 22,
      color: "slate-600",
    });
  }
}

function addFooter(slide, index) {
  addText(slide, "Research prototype. Not a clinical diagnosis.", { left: 72, top: 664, width: 620, height: 24 }, {
    fontSize: 14,
    color: "slate-500",
  });
  addText(slide, String(index), { left: 1160, top: 664, width: 48, height: 24 }, {
    fontSize: 14,
    color: "slate-500",
    alignment: "right",
  });
}

function addArrow(slide, x1, y1, x2, y2) {
  slide.shapes.add({
    geometry: "rightArrow",
    position: { left: x1, top: y1, width: x2 - x1, height: y2 - y1 },
    fill: "slate-300",
    line: { style: "solid", fill: "slate-300", width: 0 },
  });
}

async function main() {
  await fs.mkdir(QA_DIR, { recursive: true });
  const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

  const s1 = deck.slides.add();
  s1.background.fill = "slate-50";
  addHeader(
    s1,
    "BACKEND ARCHITECTURE",
    "We built a reusable model service behind the women-facing app",
    "FastAPI serves a saved NumPy logistic-regression model trained on public NHANES 2021-2023 data."
  );
  addPill(s1, "NHANES data", 92, 326, 210);
  addPill(s1, "Training pipeline", 365, 326, 250, "sky-50");
  addPill(s1, "Saved artifacts", 680, 326, 230, "violet-50");
  addPill(s1, "FastAPI", 975, 326, 170, "amber-50");
  addArrow(s1, 315, 337, 354, 359);
  addArrow(s1, 628, 337, 667, 359);
  addArrow(s1, 922, 337, 962, 359);
  addText(
    s1,
    "The frontend never retrains the model. It calls a stable API that loads the saved model once at startup.",
    { left: 170, top: 450, width: 940, height: 70 },
    { fontSize: 24, color: "slate-700", alignment: "center" }
  );
  addFooter(s1, 1);

  const s2 = deck.slides.add();
  s2.background.fill = "slate-50";
  addHeader(
    s2,
    "DATA PIPELINE",
    "The benchmark is built from linked NHANES modules",
    "Each module is merged by SEQN, the NHANES participant identifier."
  );
  addCard(s2, "Survey and exam", "Demographics, reproductive health questionnaire, and body measurements.", 72, 292, 340, 192);
  addCard(s2, "Hormone and lab data", "Sex steroid hormones, glucose, insulin, glycohemoglobin, inflammation, biochemistry, lipids, and pregnancy test.", 470, 292, 340, 192, "sky-600");
  addCard(s2, "Target definition", "Self-reported menopause/change of life as the reason for not having regular periods.", 868, 292, 340, 192, "violet-600");
  addText(
    s2,
    "This target is self-reported in NHANES. It is not clinically confirmed menopause.",
    { left: 172, top: 548, width: 936, height: 44 },
    { fontSize: 24, bold: true, color: "slate-800", alignment: "center" }
  );
  addFooter(s2, 2);

  const s3 = deck.slides.add();
  s3.background.fill = "slate-50";
  addHeader(
    s3,
    "MODEL AND ARTIFACTS",
    "Training creates a portable inference package",
    "The model is class-balanced logistic regression implemented with NumPy."
  );
  addCard(s3, "Model parameters", "Weights and bias are saved in a compressed NumPy artifact.", 72, 286, 330, 186);
  addCard(s3, "Preprocessing", "Feature order, imputation medians, category mappings, scaling means, and scaling standard deviations are saved.", 475, 286, 330, 186, "sky-600");
  addCard(s3, "Decision rule", "The classification threshold, evaluation metrics, and metadata are saved in JSON.", 878, 286, 330, 186, "violet-600");
  addText(
    s3,
    "Inference uses the same preprocessing as training, fitted on the training split only.",
    { left: 168, top: 534, width: 944, height: 48 },
    { fontSize: 24, bold: true, color: "slate-800", alignment: "center" }
  );
  addFooter(s3, 3);

  const s4 = deck.slides.add();
  s4.background.fill = "slate-50";
  addHeader(
    s4,
    "API FOR THE FRONTEND",
    "Lovable talks to one women-facing prediction API",
    "The API returns an estimate, a likelihood band, careful explanation, and model-score contributions."
  );
  addCard(s4, "Questionnaire", "GET /api/v1/feature-schema\nGET /api/v1/sample-participant", 72, 286, 340, 190);
  addCard(s4, "Prediction", "POST /api/v1/predict\nReturns probability and lower, moderate, or higher band.", 470, 286, 340, 190, "sky-600");
  addCard(s4, "Transparency", "GET /api/v1/model-info\nExplains dataset, model, performance, and limitations.", 868, 286, 340, 190, "violet-600");
  addText(
    s4,
    "Feature contributions describe what contributed to the model score, not what caused menopause.",
    { left: 154, top: 540, width: 972, height: 48 },
    { fontSize: 24, bold: true, color: "slate-800", alignment: "center" }
  );
  addFooter(s4, 4);

  for (const [index, slide] of deck.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(path.join(QA_DIR, `${stem}.png`), await deck.export({ slide, format: "png", scale: 1 }));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(QA_DIR, `${stem}.layout.json`), await layout.text());
  }

  await writeBlob(path.join(QA_DIR, "montage.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(FINAL_PPTX);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
