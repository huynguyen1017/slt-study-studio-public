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
for(const p of ["avionics_data.js","avionics_questions.js","simulation/math_format.js","avionics_beginner_lessons.js","avionics_visuals.js","avionics_tutor.js"]){
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
assert(service.includes("v18-question-visuals"));
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
  assert.equal(await page.locator('[data-page="visual"]').count(),1);
  assert.equal(await page.locator(".av-visual-figure svg").count(),1);
  await page.locator("#avGoVisual").click();
  assert.equal(await page.locator(".av-visual-panel").count(),3);
  assert.equal(await page.locator(".av-visual-svg").count(),3);
  assert((await page.locator('#avVisual-wiring').textContent()).toLowerCase().includes("breadboard"));
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
  assert((await page.locator(".av-step-counter").textContent()).includes("Step 1 of 6"));
  await page.locator("#avStepNext").click();
  assert((await page.locator(".av-step-counter").textContent()).includes("Step 2 of 6"));
  await page.locator('[data-page="try"]').click();
  await page.locator("#avExplain").fill("Voltage is a potential difference between two nodes measured using a meter.");
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
  assert.equal(errors.length,0,"No page errors "+errors.join(";"));
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
  await mobile.locator("#avionicsView .av-tutor").waitFor();
  assert.equal(await mobile.locator(".av-page-tabs [role=tab]").count(),4);
  await mobile.locator('[data-page="visual"]').click();
  assert.equal(await mobile.locator(".av-visual-panel svg").count(),3);
  assert.equal(await mobile.locator("#avionicsView").isVisible(),true);
  assert((await mobile.locator(".av-lede").textContent()).includes("TWO electrical points"));
  await mobile.close();
  console.log("PASS: desktop/mobile, 690 questions x 3 SVG views, circuit labels, breadboard, zoom, MathML and persisted ratings");
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
