"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=p=>fs.readFileSync(path.join(root,p),"utf8");
const store=new Map();
const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
const context={window:{},Math,console,localStorage:storage,document:{}};
vm.createContext(context);
for(const p of ["avionics_data.js","avionics_questions.js","avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js","avionics_distinct_reasoning_v10.js","simulation/math_format.js","avionics_beginner_lessons.js","avionics_si_lesson.js","avionics_textbook_toc.js","avionics_visuals.js","avionics_tutor.js"]){
 vm.runInContext(load(p),context,{filename:p});
}
const topics=context.window.AVIONICS_TOPICS,questions=context.window.AVIONICS_QUESTIONS;
const VIS=context.window.avionicsVisuals;
assert(VIS,"Question-driven SVG renderer must be loaded");
assert.equal(topics.length,23);
assert.equal(questions.length,690);
assert.equal(new Set(questions.map(x=>x.id)).size,690);
assert.equal(Object.keys(context.window.AVIONICS_BEGINNER_LESSONS).length,23,"All topics need a foundation lesson");
for(const t of topics){
 const own=questions.filter(q=>q.topic===t.id);
 assert.equal(own.length,30,t.id+" count");
 for(const [name,expected] of [["Foundations",5],["Application",5],["Calculation",10],["Troubleshooting",10]]){
  assert.equal(own.filter(x=>x.level===name).length,expected,t.id+" "+name);
 }
 for(const q of own){
  assert(q.steps.length>=3);
  const meta=VIS.describe(q,t);
  assert.equal(meta.question,q.id,"Visual metadata must reference the active question");
  for(const mode of VIS.viewTypes()){
   const markup=VIS.render(q,t,mode);
   assert(markup.includes("<svg"),"Missing SVG: "+q.id+" "+mode);
   assert(markup.includes("Question:")&&markup.includes(q.id),"Must label exact question: "+q.id+" "+mode);
   assert(!/<image\s|<script\b|xlink:href\s*=|<foreignObject/i.test(markup),"No remotely loaded imagery: "+q.id+" "+mode);
  }

  const steps=context.window.avionicsWorkbookV2.stepsForQuestion(q.id);
  assert(steps&&steps.length>=6,"Six beginner steps required: "+q.id);
  if(q.level==="Calculation"){
    assert(Number.isFinite(q.expected),q.id);
    assert(q.formula&&q.sub&&q.unit,q.id);
    assert(steps.some(s=>s.kind==="formula"),"Needs formula step: "+q.id);
    assert(steps.some(s=>s.answer),"Needs final numerical value: "+q.id);
  }
 }
}
assert.equal(context.window.AVIONICS_CONCEPT_DEEP_DIVE.Voltage.plain.includes("TWO electrical points"),true);
assert(context.window.studyMath("V = E / Q",true).includes("<mfrac>"));
assert(context.window.studyMath("E = C * V^2",true).includes("<msup>"));
assert.equal(context.window.AVIONICS_CALC_FAMILIES.shunt(4).answer,11);
const html=load("index.html"),service=load("sw.js");
for(const s of ["avionics_beginner_lessons.js","avionics_tutor.js","avionics_tutor.css","avionics_visuals.js","avionics_visuals.css"]) {
 assert(html.includes(s),s);
 assert(service.includes(s),"offline cache missing "+s);
}
assert(service.includes("v30-distinct-690-curriculum"));
assert(service.includes("avionics_si_lesson.js")&&service.includes("avionics_si.css"));
assert(service.includes("avionics_simulator.js")&&service.includes("avionics_simulator.css"));
const ohm=topics.find(t=>t.id==="ohm"),ohmCalc=questions.find(q=>q.id==="ohm-C1");
const ohmDrawing=VIS.render(ohmCalc,ohm,"schematic");
assert(ohmDrawing.includes("330 Ω")&&ohmDrawing.includes("3.3 V"),"Use real given values on schematic");
assert(VIS.render(ohmCalc,ohm,"wiring").includes("330 Ω"),"Match the resistor value on breadboard");
assert(VIS.render(questions.find(q=>q.id==="parallel-F1"),topics.find(t=>t.id==="parallel"),"schematic").includes("I₁") || VIS.render(questions.find(q=>q.id==="parallel-F1"),topics.find(t=>t.id==="parallel"),"schematic").includes("I1"));
console.log("PASS: 690 questions retained; 23 beginner lessons; six-step guides; MathML and offline assets");

(async()=>{
 if(process.env.RUN_BROWSER!=="1")return;
 const {chromium}=require("playwright");
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
  await page.locator("#avionicsView:visible .av-tutor").waitFor({timeout:30000});
  assert.equal(await page.locator(".av-question-gallery .av-browse-card").count(),30,"30 actual prompts must be visible");
  assert((await page.locator('[data-qid="ohm-C3"]').textContent()).includes("resistor"),"Browser must show complete calculation question");
  await page.locator('[data-qid="ohm-C3"]').click();
  assert((await page.locator(".av-question-controls").textContent()).includes("13 / 30"),"Selection must open Q13");
  assert((await page.locator(".av-lede").textContent()).length>10);
  await page.locator('[data-qid="ohm-F1"]').click();
  assert((await page.locator(".av-question-controls").textContent()).includes("1 / 30"),"Selection must open Q1");
    assert.equal(await page.locator('[data-page="visual"]').count(),1);
  assert.equal(await page.locator(".av-visual-figure svg").count(),1);
  await page.locator("#avGoVisual").click();
  assert.equal(await page.locator(".av-visual-panel").count(),3);
  assert.equal(await page.locator(".av-visual-svg").count(),3);
  assert((await page.locator('#avVisual-wiring').textContent()).toLowerCase().includes("breadboard"));
  assert.equal(await page.locator("#avVisual-sim .av-sim-host").count(),1);
  await page.locator('[data-zoom="wiring"]').click();
  assert.equal(await page.locator("#avVisualZoom").evaluate(el=>el.open),true);
  await page.locator("#avZoomClose").click();
  assert.equal(await page.locator("#avVisualZoom").evaluate(el=>el.open),false);
  await page.locator('[data-page="learn"]').click();
  assert.equal(await page.locator("#avTopicList option").count(),23);
  assert.equal(await page.locator("#avTopicList").inputValue(),"ohm");
  assert((await page.locator(".av-lede").textContent()).includes("TWO electrical points"));
  assert.equal(await page.locator(".av-visual-figure svg").count(),1);
  assert((await page.locator(".av-vocab tbody tr").count())>=4);
  assert(await page.locator(".av-math mfrac").count()>0,"Voltage fundamental math in MathML");
  await page.locator("#avGoWork").click();
  assert.equal(await page.locator(".av-baby-step").count(),1);
  assert.equal(await page.locator(".av-solution-circuit svg").count(),1,"Baby steps must show the question circuit");
  assert((await page.locator(".av-step-counter").textContent()).includes("Step 1 of 6"));
  await page.locator("#avStepNext").click();
  assert((await page.locator(".av-step-counter").textContent()).includes("Step 2 of 6"));
  await page.locator('[data-page="try"]').click();
  await page.locator("#avExplain").fill("Voltage is a potential difference.");
  await page.locator("#avCheckExplanation").click();
  assert((await page.locator("#avFeedback").textContent()).includes("Partially correct"),"Partial feedback expected");
  assert.equal(await page.locator("#avUnderstand").isDisabled(),true,"No premature mastery");
  await page.locator("#avExplain").fill("Voltage is a difference in potential between two points. A voltmeter or DMM reads between red probe on a supply rail and black probe on ground.");
  await page.locator("#avCheckExplanation").click();
  assert((await page.locator("#avFeedback").textContent()).includes("Likely correct"),"Correct conceptual feedback expected");
  assert.equal(await page.locator("#avUnderstand").isEnabled(),true,"Mastery permitted after assessed answer");

  await page.locator("#avCompare").click();
  assert.equal(await page.locator("#avReference").evaluate(x=>x.open),true);
  await page.locator("#avLevelList").selectOption("Calculation");
  assert.equal(await page.locator("#avLevelList").inputValue(),"Calculation");
  await page.locator('[data-page="work"]').click();
  await page.locator("#avStepNext").click();
  await page.locator("#avStepNext").click();
  assert(await page.locator(".av-baby-step mfrac").count()>0,"Numerical formula should be rendered MathML fraction");
  await page.locator('[data-page="try"]').click();
  await page.locator("#avValue").fill("10");
  await page.locator("#avTryNumber button").click();
  assert((await page.locator("#avFeedback").textContent()).includes("Correct"));
  await page.locator("#avUnderstand").click();
  assert((await page.locator(".av-topic-progress").textContent()).includes("1 / 30"));
  await page.locator('[data-mode="cards"]').click();
  assert.equal(await page.locator("#cardsView").isVisible(),true);
  await page.locator('[data-mode="avionics"]').click();
  await page.reload();
  await page.locator("#avionicsView .av-tutor").waitFor();
  assert((await page.locator(".av-topic-progress").textContent()).includes("1 / 30"));
  await page.locator("#avTopicList").selectOption("units");
  assert.equal(await page.locator(".av-notebook-lab").count(),1,"Each topic gets an extra circuit notebook lab");
  await page.locator(".av-notebook-lab>summary").click();
  assert.equal(await page.locator(".av-notebook-lab svg").count(),1,"Original note-informed SVG should appear");
  assert.equal(await page.locator(".av-nb-steps>details").count(),5,"Four small steps and a final answer");
  await page.locator(".av-nb-controls input").fill("2");
  await page.locator(".av-nb-controls button").click();
  assert((await page.locator(".av-nb-result").textContent()).includes("Not yet"),"Wrong numbers get corrective feedback");
  await page.locator(".av-nb-controls input").fill("200");
  await page.locator(".av-nb-controls button").click();
  assert((await page.locator(".av-nb-result").textContent()).includes("Correct"),"Expected mini lab answer should pass");
  assert(await page.locator(".av-nb-math math").count()>=2,"Notebook formula and substitution must be MathML");
  const cm=await page.locator(".av-nb-math math").first().evaluate(e=>({display:getComputedStyle(e).display,width:e.getBoundingClientRect().width,ns:e.namespaceURI}));
  assert(cm.display.includes("math")&&cm.width<460&&cm.ns==="http://www.w3.org/1998/Math/MathML","Notebook math should retain native mathematical layout");
  await page.locator("#avTopicList").selectOption("kcl-kvl");
  await page.locator(".av-notebook-lab>summary").click();
  assert((await page.locator(".av-nb-question").textContent()).includes("9.009 mA"),"Observed Lab 7 measurements are a distinct troubleshooting exercise");
  await page.locator(".av-nb-controls input").fill("0.318");
  await page.locator(".av-nb-controls button").click();
  assert((await page.locator(".av-nb-result").textContent()).includes("Correct"),"Measured KCL discrepancy must grade correctly");
  await page.locator("#avTopicList").selectOption("units");
  assert.equal(await page.locator(".av-si-chapter").count(),1,"SI base/derived chapter must display");
  assert.equal(await page.locator(".av-si-chapter .av-si-table").count(),4,"All four SI tables");
  assert.equal(await page.locator(".av-si-chapter .av-si-table").first().locator("tbody tr").count(),7,"All seven SI base units");
  assert((await page.locator(".av-si-chapter").textContent()).includes("1995"),"SI supplementary reclassification noted");
  assert((await page.locator(".av-si-chapter").textContent()).includes("gauss"),"Correction to the supplied magnetic-unit passage");
  assert(await page.locator(".av-si-chapter math[display='block']").count()===3,"Compact MathML formulas for volt and symbol notation");
  assert.equal(await page.locator(".av-chapter-map").count(),1,"Textbook TOC cross-reference");
  assert((await page.locator(".av-chapter-map").textContent()).includes("Chapter"),"Book chapter headings must appear");
  const formulaGeometry=await page.locator(".av-si-chapter .av-math math").evaluateAll(els=>els.map(e=>{
   const cs=getComputedStyle(e),r=e.getBoundingClientRect(),nodes=[...e.querySelectorAll("mrow:first-child > mi,mrow:first-child > mo,mrow:first-child > mn")].slice(0,3);
   return {display:cs.display,width:r.width,height:r.height,topDiff:nodes.length>=2?Math.abs(nodes[0].getBoundingClientRect().top-nodes[1].getBoundingClientRect().top):0,namespace:e.namespaceURI};
  }));
  assert.equal(formulaGeometry.length,3);
  for(const [i,x] of formulaGeometry.entries()){
   assert(x.display.includes("math"),"Native math display mode lost in CSS: "+i+" "+x.display);
   assert(x.width<480&&x.height<120,"MathML overflow or vertical stack: "+i+" "+JSON.stringify(x));
   assert(x.topDiff<30,"Math tokens stacked instead of aligned: "+i+" "+JSON.stringify(x));
   assert.equal(x.namespace,"http://www.w3.org/1998/Math/MathML");
  }
  assert((await page.locator(".av-si-chapter .av-math-scroll").count())===3);
  await page.locator('[data-page="work"]').click();
  assert((await page.locator(".av-step-counter").textContent()).includes("Step 1 of 7"),"SI base-unit definition gets a dedicated seventh step");
  await page.locator('[data-page="try"]').click();
  await page.locator("#avExplain").fill("An SI base unit is one of seven fundamental units. The ampere is the base unit for electric current, while the volt is a derived unit for potential difference.");
  await page.locator("#avCheckExplanation").click();
  assert((await page.locator("#avFeedback").textContent()).includes("Likely correct"),"SI base unit evaluation must accept correct seven/ampere/volt distinction");
    assert.equal(errors.length,0,"No page errors "+errors.join(";"));
  await page.locator("#avTopicList").selectOption("parallel");
  await page.locator('[data-page="visual"]').click();
  assert.equal(await page.locator('[data-sim-question="parallel-F1"]').count(),1,"First parallel question has its own CircuitJS model");
  assert((await page.locator("#avVisual-wiring").textContent()).includes("Selected probe node"),"Probe indicator changes with the question");
  assert.equal(await page.locator(".av-sim-frame iframe").count(),0,"Third-party simulator must not load until requested");
  await page.locator('[data-quick-qid="parallel-F2"]').click();
  assert.equal(await page.locator('[data-sim-question="parallel-F2"]').count(),1,"Simulator data must switch with the question");
  assert((await page.locator("#avVisual-wiring").textContent()).includes("parallel-F2"),"Wiring must display the new question");
  await page.locator("#avTopicList").selectOption("kcl-kvl");
  await page.locator('[data-quick-qid="kcl-kvl-F2"]').click();
  await page.locator('[data-page="visual"]').click();
  assert((await page.locator("#avVisual-wiring").textContent()).includes("KVL"),"KVL must show a voltage loop");
  await page.locator("#avTopicList").selectOption("units");
  // Every question should update its video sources and real Nucleo circuit.
  await page.locator("#avTopicList").selectOption("buses");
  await page.locator('[data-quick-qid="buses-F3"]').click(); // I2C hardware
  await page.locator('[data-page="learn"]').click();
  assert.equal(await page.locator('[data-video-question="buses-F3"] .av-video-card').count(),2,"I2C question has two distinct video-learning sources");
  assert.equal(await page.locator('[data-video-question="buses-F3"] .av-video-card strong').first().textContent(),"A · DigiKey");
  await page.locator('[data-page="visual"]').click();
  assert.equal(await page.locator("#avVisual-wiring .av-nucleo-full-svg").count(),1,"I2C uses full Nucleo breadboard, not a cropped crop");
  assert((await page.locator("#avVisual-wiring").textContent()).includes("PB9"),"I2C board must show PB9 SDA");
  await page.locator("#avVisual-wiring .av-3220-details summary").click();
  await page.locator("#avVisual-wiring .av-3220-overview").waitFor();
  assert.equal(await page.locator("#avVisual-wiring .av-3220-overview").count(),1,"Full 3220 point assembly expands only on demand");
  await page.locator('[data-quick-qid="buses-F2"]').click(); // SPI hardware
  assert.equal(await page.locator("#avVisual-wiring .av-nucleo-full-svg").count(),1,"Switching questions must replace full diagram");
  assert((await page.locator("#avVisual-wiring").textContent()).includes("MOSI"),"Next question uses SPI wiring");
  assert.equal(await page.locator("#avVisual-wiring .av-3220-overview").count(),0,"Huge assembly is not eagerly loaded after question switch");
  await page.locator('[data-page="learn"]').click();
  assert.equal(await page.locator('[data-video-question="buses-F2"] .av-video-card').count(),2,"Switching questions must replace both video sources");
  await page.locator("#avTopicList").selectOption("units");
  await page.locator('[data-quick-qid="units-F2"]').click();
  assert((await page.locator(".av-active-banner").textContent()).includes("25 mA"),"Q2 must explain the meaning of a milliampere");
  await page.locator('[data-quick-qid="units-A2"]').click();
  assert((await page.locator(".av-page h3").first().textContent()).includes("Convert a real shunt measurement"),"Q7 must no longer repeat the Milli prefix lesson");
  assert((await page.locator(".av-lede").textContent()).includes("0.025 A = 25 mA"),"Q7 Understand lesson must show correct shunt result");
  assert(!(await page.locator(".av-lede").textContent()).includes("The prefix 'milli'"),"Q7 must not display the old prefix-only definition");
  await page.locator('[data-page="work"]').click();
  assert((await page.locator(".av-all-steps").textContent()).includes("0.25 V"),"Q7 six-step solution must use the shunt measurement");
  await page.locator('[data-page="learn"]').click();
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
  await mobile.locator("#avionicsView .av-tutor").waitFor();
  assert.equal(await mobile.locator(".av-page-tabs [role=tab]").count(),4);
  assert.equal(await mobile.locator(".av-browse-card").count(),30);
  await mobile.locator('[data-page="visual"]').click();
  assert.equal(await mobile.locator(".av-visual-panel svg").count(),3);
  assert.equal(await mobile.locator("#avionicsView").isVisible(),true);
  await mobile.locator('[data-page="learn"]').click();
  assert((await mobile.locator(".av-lede").textContent()).includes("TWO electrical points"));
  await mobile.close();
  console.log("PASS: desktop/mobile, 690 questions x 3 SVG views, circuit labels, breadboard, zoom, MathML and persisted ratings");
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
