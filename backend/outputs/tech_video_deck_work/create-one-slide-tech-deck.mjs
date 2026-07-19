import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT_DIR = "C:/Users/Emra/Desktop/womenhealth/outputs";
const QA_DIR = "C:/Users/Emra/Desktop/womenhealth/outputs/tech_video_deck_work/one-slide-qa";
const FINAL_PPTX = path.join(OUT_DIR, "backend-tech-video-one-slide.pptx");

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function text(slide, value, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    fontSize: style.fontSize ?? 20,
    bold: style.bold ?? false,
    color: style.color ?? "slate-900",
    alignment: style.alignment ?? "left",
  };
  return shape;
}

function card(slide, title, body, left, top, width, height, accent) {
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
  text(slide, title, { left: left + 22, top: top + 18, width: width - 44, height: 32 }, {
    fontSize: 21,
    bold: true,
    color: "slate-950",
  });
  text(slide, body, { left: left + 22, top: top + 58, width: width - 44, height: height - 66 }, {
    fontSize: 16,
    color: "slate-600",
  });
}

function arrow(slide, left, top, width) {
  slide.shapes.add({
    geometry: "rightArrow",
    position: { left, top, width, height: 28 },
    fill: "slate-300",
    line: { style: "solid", fill: "slate-300", width: 0 },
  });
}

async function main() {
  await fs.mkdir(QA_DIR, { recursive: true });
  const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  const slide = deck.slides.add();
  slide.background.fill = "slate-50";

  text(slide, "TECH ARCHITECTURE", { left: 72, top: 52, width: 420, height: 28 }, {
    fontSize: 15,
    bold: true,
    color: "emerald-700",
  });
  text(
    slide,
    "Backend architecture for the model estimate",
    { left: 72, top: 98, width: 1080, height: 54 },
    { fontSize: 40, bold: true, color: "slate-950" }
  );
  text(
    slide,
    "A saved NumPy logistic-regression model is trained on linked NHANES 2021-2023 modules.",
    { left: 72, top: 172, width: 1030, height: 42 },
    { fontSize: 20, color: "slate-600" }
  );

  const top = 265;
  const w = 310;
  const h = 184;
  const gap = 82;
  const x1 = 105;
  const x2 = x1 + w + gap;
  const x3 = x2 + w + gap;

  card(
    slide,
    "1. Data",
    "NHANES modules merged by SEQN: demographics, reproductive health, body measures, hormones, labs, lipids, and pregnancy test.",
    x1,
    top,
    w,
    h,
    "emerald-600"
  );
  arrow(slide, x1 + w + 26, top + 78, 30);
  card(
    slide,
    "2. Model",
    "Class-balanced logistic regression in NumPy. Target: self-reported menopause/change of life as reason for no regular periods.",
    x2,
    top,
    w,
    h,
    "sky-600"
  );
  arrow(slide, x2 + w + 26, top + 78, 30);
  card(
    slide,
    "3. Artifacts",
    "Saved weights, bias, feature order, imputation, category mappings, scaling parameters, threshold, metrics, and metadata.",
    x3,
    top,
    w,
    h,
    "violet-600"
  );

  slide.shapes.add({
    geometry: "roundRect",
    position: { left: 154, top: 525, width: 972, height: 74 },
    fill: "emerald-50",
    line: { style: "solid", fill: "emerald-200", width: 1 },
    borderRadius: "rounded-xl",
  });
  text(
    slide,
    "Careful wording: this is a model estimate based on self-reported NHANES data, not clinically confirmed menopause, not a diagnosis, and not treatment advice.",
    { left: 188, top: 543, width: 904, height: 44 },
    { fontSize: 19, bold: true, color: "emerald-900", alignment: "center" }
  );

  text(slide, "Research prototype. Not a clinical diagnosis.", { left: 72, top: 664, width: 620, height: 24 }, {
    fontSize: 14,
    color: "slate-500",
  });

  await writeBlob(path.join(QA_DIR, "slide-01.png"), await deck.export({ slide, format: "png", scale: 1 }));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(QA_DIR, "slide-01.layout.json"), await layout.text());
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(FINAL_PPTX);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
