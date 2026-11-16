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
for(const p of ["avionics_data.js","avionics_questions.js","simulation/math_format.js","avionics_beginner_lessons.js","avionics_tutor.js"]){
 vm.runInContext(load(p),context,{filename:p});
}
const topics=context.window.AVIONICS_TOPICS,questions=context.window.AVIONICS_QUESTIONS;
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
for(const s of ["avionics_beginner_lessons.js","avionics_tutor.js","avionics_tutor.css"]) {
 assert(html.includes(s),s);
 assert(service.includes(s),"offline cache missing "+s);
}
assert(service.includes("v17-baby-steps"));
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
  assert.equal(await page.locator("#avTopicList option").count(),23);
  assert.equal(await page.locator("#avTopicList").inputValue(),"ohm");
  assert((await page.locator(".av-lede").textContent()).includes("TWO electrical points"));
  assert.equal(await page.locator(".av-diagram svg").count(),1);
  assert.equal(await page.locator(".av-vocab tbody tr").count(),4);
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
  assert.equal(await mobile.locator(".av-page-tabs [role=tab]").count(),3);
  assert.equal(await mobile.locator("#avionicsView").isVisible(),true);
  assert((await mobile.locator(".av-lede").textContent()).includes("TWO electrical points"));
  await mobile.close();
  console.log("PASS: desktop/mobile, labelled SVG, MathML, word explanation, 6-step navigation, answer checking, preserved ratings");
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
