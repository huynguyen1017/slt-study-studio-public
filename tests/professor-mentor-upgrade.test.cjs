"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const vm = require("node:vm");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

// 1. Node VM validation across ALL 1,150 Avionics + 600 NVIDIA SLT questions
const store = new Map();
const ctx = {
  window: {},
  Math,
  console,
  document: {},
  localStorage: { getItem: k => store.get(k) || null, setItem: (k, v) => store.set(k, v) }
};
vm.createContext(ctx);
const scripts = [
  "simulation/math_format.js",
  "avionics_data.js",
  "avionics_questions.js",
  "avionics_distinct_labs_v10.js",
  "avionics_distinct_math_v10.js",
  "avionics_dice_methods_v12.js",
  "avionics_distinct_reasoning_v10.js",
  "avionics_integrative_capstones_v11.js",
  "avionics_mixed_networks_v11.js",
  "avionics_advanced_50_v12.js",
  "avionics_beginner_lessons.js",
  "avionics_si_lesson.js",
  "avionics_textbook_toc.js",
  "avionics_visuals.js",
  "avionics_mixed_visuals_v11.js",
  "avionics_assessor.js",
  "avionics_hw_debug_interview.js",
  "nvidia_slt_tracks.js",
  "nvidia_slt_math.js",
  "nvidia_slt_questions.js",
  "nvidia_slt_visual_lab_v2.js",
  "professor_mastery_engine.js",
  "professor_notebook_spreads.js",
  "avionics_tutor.js",
  "nvidia_slt_ui.js"
];
for (const f of scripts) vm.runInContext(read(f), ctx, { filename: f });

const PME = ctx.window.PROFESSOR_MASTERY_ENGINE;
const PNS = ctx.window.PROFESSOR_NOTEBOOK_SPREADS;
assert(PME && PME.version === "1.0.0", "Professor Mastery Engine must expose version 1.0.0");
assert(PNS && PNS.FLAGSHIP_SPREAD_SPECS.length === 12, "Must expose all 12 flagship notebook spreads");
for (const sp of PNS.FLAGSHIP_SPREAD_SPECS) {
  assert(fs.existsSync(path.join(root, "figures", "notebook_spreads", sp.file)), "Missing repo PNG: " + sp.file);
  const svgOut = PNS.renderNotebookSpreadSVG(sp);
  assert(svgOut.includes("nb-spread-svg") && !svgOut.includes("[object Object]"));
}

const avTopics = ctx.window.AVIONICS_TOPICS;
const avQuestions = ctx.window.AVIONICS_QUESTIONS;
const nvTracks = ctx.window.NVIDIA_SLT_TRACKS;
const nvQuestions = ctx.window.NVIDIA_SLT_QUESTIONS;
assert.equal(avTopics.length, 23);
assert.equal(avQuestions.length, 1150);
assert.equal(nvTracks.length, 12);
assert.equal(nvQuestions.length, 600);

// Verify every single avionics topic note & 1,150 step-by-step builds
for (const t of avTopics) {
  assert(PME.TOPIC_PROFESSOR_NOTES[t.id], "Missing professor note for topic " + t.id);
}
for (const q of avQuestions) {
  const steps = ctx.window.avionicsWorkbookV2.stepsForQuestion(q.id);
  const t = avTopics.find(x => x.id === q.topic);
  if (q.advancedStage >= 31) assert.equal(steps.length, 8, q.id + " must preserve 8 steps");
  else if (q.id === "units-F1") assert.equal(steps.length, 7, "units-F1 must preserve 7 steps");
  else assert.equal(steps.length, 6, q.id + " must preserve 6 steps");
  for (const s of steps) {
    assert(s.title && s.body && !/:\s*undefined\b|^\s*undefined\b|=\s*NaN\b|\bNaN\s+(?:V|A|Ω|W|s|ms|ps|mA|mV|kΩ|MΩ|%|Hz)\b/.test(s.body) && !s.body.includes("[object Object]"), q.id + " malformed step: " + s.body);
  }
  const uHtml = PME.avionics.renderUnderstandLecture(q, t, { label: q.skillName || q.level });
  const cHtml = PME.avionics.renderChalkboard(q, t);
  assert(uHtml.includes("av-prof-box") && cHtml.includes("av-prof-chalkboard"), q.id + " missing professor HTML");
}
assert(ctx.window.avionicsWorkbookV2.stepsForQuestion("units-F1").every(x => !x.formula || x.formula !== "V = I * R"));
assert(ctx.window.avionicsWorkbookV2.stepsForQuestion("qualification-F1").every(x => !x.formula || x.formula !== "V = I * R"));

// Verify worked bank problems cover Tech 60, Electronic Devices, Tech 63, ENGR 852, Physics 2B
assert(PME.AVIONICS_WORKED_BANK.length >= 14, "Expected comprehensive worked coursework bank");
for (const cat of ["tech60", "devices", "tech63", "engr852", "physics2b"]) {
  assert(PME.AVIONICS_WORKED_BANK.some(x => x.cat === cat), "Missing coursework category " + cat);
}

// Verify all 12 NVIDIA tracks & 600 questions
for (const t of nvTracks) {
  assert(PME.NVIDIA_TRACK_LECTURES[t.id], "Missing NVIDIA professor lecture for track " + t.id);
}
for (const q of nvQuestions) {
  const t = nvTracks.find(x => x.id === q.topic);
  const uHtml = PME.nvidia.renderUnderstand(q, t);
  const dHtml = PME.nvidia.renderWorkedDerivation(q, t);
  const pHtml = PME.nvidia.renderPracticeCoach(q, t);
  assert(uHtml.includes("nvs-prof-box") && dHtml.includes("nvs-prof-chalkboard") && pHtml.includes("nvs-prof-hints"), q.id);
  assert(!/:\s*undefined\b|^\s*undefined\b|=\s*NaN\b/.test(uHtml) && !/:\s*undefined\b|^\s*undefined\b|=\s*NaN\b/.test(dHtml));
}
for (const cat of ["equations", "post_si", "python", "hld"]) {
  assert(PME.NVIDIA_MASTER_STUDY_BANK.some(x => x.cat === cat), "Missing NVIDIA master bank category " + cat);
}

// 2. Verify offline/cache wiring
const html = read("index.html");
const sw = read("sw.js");
assert(html.includes("professor_mastery_engine.css?v=1") && html.includes("professor_mastery_engine.js?v=1"));
assert(sw.includes('"./professor_mastery_engine.js"') && sw.includes('"./professor_mastery_engine.css"'));
assert(sw.includes("slt-study-studio-v35-nvidia-scenario-lab-r1"));

// 3. Headless Playwright test against a local static server
function startStaticServer(dir) {
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webmanifest": "application/manifest+json",
    ".cir": "text/plain"
  };
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const cleanUrl = (req.url || "/").split("?")[0];
      let rel = cleanUrl === "/" ? "/index.html" : cleanUrl;
      const full = path.join(dir, decodeURIComponent(rel));
      if (!full.startsWith(dir) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = path.extname(full);
      res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
      fs.createReadStream(full).pipe(res);
    });
    srv.listen(0, "127.0.0.1", () => resolve({ server: srv, port: srv.address().port }));
  });
}

(async () => {
  const { server, port } = await startStaticServer(root);
  const executablePath = fs.existsSync(process.env.PW_EXEC || "") ? process.env.PW_EXEC : undefined;
  const browser = await chromium.launch({ headless: true, executablePath, args: ["--no-sandbox"] });
  try {
    const base = `http://127.0.0.1:${port}`;
    for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport: vp });
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));

      // Test Avionics View (#avionics)
      await page.goto(`${base}/#avionics`, { waitUntil: "load" });
      await page.locator("#avionicsView:visible .av-prof-box").waitFor({ timeout: 25000 });
      await page.locator("#avProfCourseworkBank > summary").click();
      await page.locator('[data-av-cw-filter="engr852"]').click();
      await page.locator('[data-av-cw-input="CW-852-01"]').fill("-820");
      await page.locator('[data-av-cw-check="CW-852-01"]').click();
      assert((await page.locator('[data-av-cw-status="CW-852-01"]').textContent()).includes("Correct"));

      await page.locator('[data-page="visual"]').click();
      await page.locator("#avionicsView .av-prof-box").waitFor();
      await page.locator('[data-page="work"]').click();
      await page.locator("#avionicsView .av-prof-chalkboard").waitFor();
      assert.equal(await page.locator("#avionicsView .nb-spread-svg").count(), 1, "Avionics Baby Steps must show 3-Page Notebook Spread");
      await page.locator('[data-page="try"]').click();
      await page.locator('[data-av-hint="2"]').click();
      assert((await page.locator(".av-prof-hint-panel").textContent()).includes("Hint 3"));

      // Test NVIDIA SLT View (#nvidia)
      await page.locator('[data-mode="nvidia"]').click();
      await page.locator("#nvidiaView:visible .nvs-prof-box").waitFor({ timeout: 25000 });
      await page.locator("#nvsProfMasterBank > summary").click();
      await page.locator('[data-nv-filter="python"]').click();
      await page.locator('[data-nv-sol="NV-PY-02"]').click();
      assert((await page.locator('[data-nv-id="NV-PY-02"]').textContent()).includes("audit_yield"));

      await page.locator('#nvidiaView [data-screen="steps"]').first().click();
      await page.locator("#nvidiaView .nvs-prof-chalkboard").waitFor();
      assert.equal(await page.locator("#nvidiaView .nb-spread-svg").count(), 1, "NVIDIA Baby Steps must show 3-Page Notebook Spread");
      await page.locator('#nvidiaView [data-screen="practice"]').first().click();
      await page.locator('[data-nv-hint="1"]').click();
      assert((await page.locator(".nvs-prof-hint-panel").textContent()).includes("Hint 2"));
      await page.locator('#nvidiaView [data-screen="evidence"]').first().click();
      await page.locator("#nvidiaView #nvsProfMasterBank").waitFor();

      assert.equal(errors.length, 0, `Errors at width ${vp.width}: ` + errors.join("; "));
      await page.close();
    }
    console.log("PASS professor-mentor-upgrade: 1150 Avionics + 600 NVIDIA SLT upgraded across all 4 modes at desktop & mobile with zero errors.");
  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
