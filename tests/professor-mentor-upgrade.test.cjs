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
  assert(uHtml.includes("prof-interview-box") && cHtml.includes("prof-interview-box"), q.id + " missing Hiring-Manager Interview Script");
  assert(uHtml.includes("Part 1") && uHtml.includes("Part 2") && uHtml.includes("Part 3"), q.id + " missing Part 1/2/3 structure");
  const uInterviewOnly = (uHtml.split('<section class="av-prof-box prof-interview-box"')[1] || "").split("<details class=\"av-prof-bank\"")[0];
  const visInterview = uInterviewOnly.replace(/<math[\s\S]*?<\/math>/g, " ").replace(/<[^>]+>/g, " ");
  assert(!/Delta_V|Delta_U|DeltaV_max|DeltaI_max|theta_JA|->|10\^\(3n\)/.test(visInterview), q.id + " leaked raw math token in visible interview text");
  assert(!uHtml.includes("ENGR 852") && !cHtml.includes("ENGR 852"), q.id + " must not mix ENGR 852 labels into Avionics EE");
}
assert(ctx.window.avionicsWorkbookV2.stepsForQuestion("units-F1").every(x => !x.formula || x.formula !== "V = I * R"));
assert(ctx.window.avionicsWorkbookV2.stepsForQuestion("qualification-F1").every(x => !x.formula || x.formula !== "V = I * R"));

// Verify worked bank problems cover pure Avionics disciplines (zero ENGR 852 mixing)
assert(PME.AVIONICS_WORKED_BANK.length >= 12, "Expected comprehensive topic-pure Avionics worked bank");
for (const cat of ["dc_networks", "analog_devices", "digital_timing", "lab_tvac"]) {
  assert(PME.AVIONICS_WORKED_BANK.some(x => x.cat === cat), "Missing worked bank category " + cat);
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
  assert(uHtml.includes("prof-interview-box") && dHtml.includes("prof-interview-box"), q.id + " missing NVIDIA Interview Script");
  assert(uHtml.includes("Part 1") && uHtml.includes("Part 2") && uHtml.includes("Part 3"), q.id + " missing NVIDIA Part 1/2/3 structure");
  const nvInterviewOnly = uHtml.split('<section class="nvs-prof-box prof-interview-box"')[1] || "";
  const visNvInterview = nvInterviewOnly.replace(/<math[\s\S]*?<\/math>/g, " ").replace(/<[^>]+>/g, " ");
  assert(!/Delta_V|Delta_U|DeltaV_max|DeltaI_max|theta_JA|->|10\^\(3n\)/.test(visNvInterview), q.id + " leaked raw math token in NVIDIA interview text");
  assert(!uHtml.includes("ENGR 852") && !dHtml.includes("ENGR 852"), q.id + " must not mix ENGR 852 into NVIDIA");
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
      await page.locator("#avionicsView:visible .av-prof-box").first().waitFor({ timeout: 25000 });
      assert(!(await page.locator("#avionicsView").textContent()).includes("ENGR 852"), "#avionicsView must NOT contain ENGR 852 clutter");
      assert.equal(await page.locator("#avionicsView .ohm-studio, #avionicsView .prof-interview-box").count(), 1, "Avionics Understand view must render Hiring-Manager Interview Script");
      assert((await page.locator("#avionicsView .av-vis-side").count()) >= 1, "Avionics visual panel must render Key Equations & How to Read side cards");
      await page.locator("#avProfCourseworkBank > summary").click();
      await page.locator('[data-av-cw-filter="digital_timing"]').click();
      await page.locator('[data-av-cw-input="CW-DIG-01"]').fill("-820");
      await page.locator('[data-av-cw-check="CW-DIG-01"]').click();
      assert((await page.locator('[data-av-cw-status="CW-DIG-01"]').textContent()).includes("Correct"));

      await page.locator("#avTopicList").selectOption("ohm");
      await page.locator('#avionicsView [data-qid="ohm-F2"]').click();
      await page.locator("#avionicsView .prof-interview-box").waitFor();
      const ohmF2Text = await page.locator("#avionicsView .prof-interview-box").textContent();
      assert(ohmF2Text.includes("Part 1") && ohmF2Text.includes("Part 2") && ohmF2Text.includes("Part 3"), "ohm-F2 interview box must include Parts 1-3");
      assert(!/Delta_V|Delta_U|->|10\^\(3n\)/.test(ohmF2Text), "ohm-F2 rendered interview text must not leak raw math tokens");
      if (vp.width === 1280) {
        await page.locator("#avionicsView .prof-interview-box").screenshot({ path: "/Users/huynguyen/.gemini/antigravity/brain/9abd734c-7786-4e8f-a3e8-35f2bdc2137b/ohm_f2_interview_redesign.png" });
      }
      await page.locator('#avionicsView [data-qid="ohm-F1"]').click();
      await page.locator("#avionicsView .ohm-studio").waitFor();
      if (vp.width === 1280) {
        await page.locator("#avionicsView .ohm-studio").screenshot({ path: "/Users/huynguyen/.gemini/antigravity/brain/9abd734c-7786-4e8f-a3e8-35f2bdc2137b/ohm_f1_interview_redesign.png" });
      }
      await page.locator('[data-page="visual"]').click();
      await page.locator("#avionicsView #avVisual-concept").waitFor();
      const avVisText = await page.locator("#avionicsView #avVisual-concept").textContent();
      assert(avVisText.includes("×10⁻³ A") && avVisText.includes("Parabolic Heat") && !avVisText.includes("I / P"), "ohm-F1 visual must show calibrated lab analyzer instead of bare I / P");
      assert(avVisText.includes("Key Equations") && avVisText.includes("Engineer Action After Solving"), "ohm-F1 visual must show side equations & post-math action");
      if (vp.width === 1280) {
        await page.locator("#avionicsView #avVisual-concept").screenshot({ path: "/Users/huynguyen/.gemini/antigravity/brain/9abd734c-7786-4e8f-a3e8-35f2bdc2137b/ohm_f1_calibrated_visual.png" });
      }
      await page.locator('[data-page="work"]').click();
      await page.locator("#avionicsView .av-prof-chalkboard").waitFor();
      assert.equal(await page.locator("#avionicsView .nb-spread-svg").count(), 1, "Avionics Baby Steps must show Full Lecture Study Sheet");
      assert((await page.locator("#avionicsView math").count()) >= 2, "Avionics Baby Steps must render stacked MathML in steps & interview block");
      await page.locator('[data-page="try"]').click();
      await page.locator('[data-av-hint="2"]').click();
      assert((await page.locator(".av-prof-hint-panel").textContent()).includes("Hint 3"));

      // Test NVIDIA SLT View (#nvidia)
      await page.locator('[data-mode="nvidia"]').click();
      await page.locator("#nvidiaView:visible .nvs-prof-box").first().waitFor({ timeout: 25000 });
      assert(!(await page.locator("#nvidiaView").textContent()).includes("ENGR 852"), "#nvidiaView must NOT contain ENGR 852 clutter");
      await page.locator("#nvsProfMasterBank > summary").click();
      await page.locator('[data-nv-filter="python"]').click();
      await page.locator('[data-nv-sol="NV-PY-02"]').click();
      assert((await page.locator('[data-nv-id="NV-PY-02"]').textContent()).includes("audit_yield"));

      await page.locator('#nvidiaView [data-screen="steps"]').first().click();
      await page.locator("#nvidiaView .nvs-prof-chalkboard").waitFor();
      assert((await page.locator("#nvidiaView math").count()) >= 1, "NVIDIA SLT view must render stacked MathML equations");
      assert.equal(await page.locator("#nvidiaView .nb-spread-svg").count(), 1, "NVIDIA Baby Steps must show Full Lecture Study Sheet");
      assert.equal(await page.locator("#nvidiaView .prof-interview-box").count(), 1, "NVIDIA Baby Steps must show Hiring-Manager Interview Script");
      await page.locator('#nvidiaView [data-screen="practice"]').first().click();
      await page.locator('[data-nv-hint="1"]').click();
      assert((await page.locator(".nvs-prof-hint-panel").textContent()).includes("Hint 2"));
      await page.locator('#nvidiaView [data-screen="evidence"]').first().click();
      await page.locator("#nvidiaView #nvsProfMasterBank").waitFor();

      // Test NVIDIA SLT Prep (#nvidia-sltView)
      await page.locator('[data-mode="nvidia-slt"]').click();
      await page.locator('#nvidia-sltView:visible [data-topic="ddr-lpddr"]').waitFor({ timeout: 25000 });
      await page.locator('#nvidia-sltView [data-topic="ddr-lpddr"]').click();
      await page.locator('#nvidia-sltView [data-qidx="1"]').click();
      assert(!(await page.locator("#nvidia-sltView").textContent()).includes("ENGR 852"), "#nvidia-sltView must NOT contain ENGR 852 clutter");
      const nvSltMathHtml = await page.locator("#nvidia-sltView .nv-formula-box").first().innerHTML();
      assert(nvSltMathHtml.includes("<math") && nvSltMathHtml.includes("<mfrac"), "NVIDIA SLT Prep must render stacked MathML <mfrac>");
      const nvSltMathText = await page.locator("#nvidia-sltView .nv-formula-box").first().textContent();
      assert(nvSltMathText.includes("10⁻¹⁵ F") && nvSltMathText.includes("55.0 × 10⁻³ V"), "ddr-lpddr-F1 must show 10^(3n) engineering notation");

      await page.locator('#nvidia-sltView [data-ptab="2"]').click();
      assert.equal(await page.locator("#nvidia-sltView .nv-vis-card .nv-svg-wrap svg").count(), 3, "NVIDIA SLT Prep 3-panel visuals must render 3 calibrated SVGs");
      assert.equal(await page.locator("#nvidia-sltView .nb-spread-svg").count(), 1, "NVIDIA SLT Prep tab 2 must show Full Lecture Study Sheet");

      await page.locator('#nvidia-sltView [data-ptab="3"]').click();
      const stepBodyText = await page.locator("#nvidia-sltView .nv-step-card .nv-step-body").first().textContent();
      assert(!stepBodyText.includes("Step 1 ("), "Baby steps must strip redundant Step 1 prefix from step body");
      assert.equal(await page.locator("#nvidia-sltView .nb-spread-svg").count(), 1, "NVIDIA SLT Prep Baby Steps tab must show Full Lecture Study Sheet");
      assert.equal(await page.locator("#nvidia-sltView .prof-interview-box").count(), 1, "NVIDIA SLT Prep Baby Steps tab must show Hiring-Manager Interview Script");
      assert((await page.locator("#nvidia-sltView .nv-steps-list math").count()) >= 2, "NVIDIA SLT Prep Baby Steps must render stacked MathML inside steps");
      if (vp.width === 1280) {
        await page.locator("#nvidia-sltView .nv-stage").screenshot({ path: "/Users/huynguyen/.gemini/antigravity/brain/9abd734c-7786-4e8f-a3e8-35f2bdc2137b/nvidia_slt_ddr_f1_upgraded.png" });
      }

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
