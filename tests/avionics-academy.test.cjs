"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=p=>fs.readFileSync(path.join(root,p),"utf8");
const context={window:{},Math,console};
vm.createContext(context);
vm.runInContext(load("avionics_data.js"),context,{filename:"avionics_data.js"});
vm.runInContext(load("avionics_questions.js"),context,{filename:"avionics_questions.js"});
vm.runInContext(load("simulation/math_format.js"),context,{filename:"math_format.js"});
const topics=context.window.AVIONICS_TOPICS,questions=context.window.AVIONICS_QUESTIONS;
assert.equal(topics.length,23,"Expected 23 topics");
assert.equal(questions.length,690,"23 topics x 30 questions");
assert.equal(new Set(questions.map(q=>q.id)).size,690,"All question IDs unique");
for(const t of topics){
 const own=questions.filter(q=>q.topic===t.id);
 assert.equal(own.length,30,t.title);
 for(const level of ["Foundations","Application","Calculation","Troubleshooting"]){
  assert.equal(own.filter(q=>q.level===level).length,level==="Calculation"||level==="Troubleshooting"?10:5,t.title+" "+level);
 }
 for(const q of own){
  assert(q.question&&q.question.length>20);
  assert(q.steps.length>=3,q.id);
  if(q.level==="Calculation"){
   assert(Number.isFinite(q.expected),q.id);
   assert(q.formula&&q.sub&&q.unit,q.id);
   assert(context.window.studyMath(q.formula,true).includes("<math"),q.id);
  }
 }
}
assert(Math.abs(context.window.AVIONICS_CALC_FAMILIES.shunt(4).answer-11)<1e-8);
assert(Math.abs(context.window.AVIONICS_CALC_FAMILIES.milli(1).answer-0.025)<1e-8);
assert(Math.abs(context.window.AVIONICS_CALC_FAMILIES.rlTau(0).answer-1)<1e-8);
assert(Math.abs(context.window.AVIONICS_CALC_FAMILIES.clockPeriod(4).answer-10)<1e-8);
assert(Math.abs(context.window.AVIONICS_CALC_FAMILIES.wavelength(2).answer-0.125)<1e-8);
assert(context.window.studyMath("I = V / R",true).includes("<mfrac>"),"Formula must render native fraction in MathML");
assert(context.window.studyMath("E = C * V^2",true).includes("<msup>"),"Formula must render native superscripts");
const html=load("index.html"),app=load("app.js");
for(const s of ['data-mode="avionics"','id="avionicsView"','avionics_data.js','avionics_questions.js','avionics_practice.js','avionics_practice.css'])assert(html.includes(s),s);
assert(app.includes("'academy','avionics'")&&app.includes("mountAvionicsPractice"));
console.log("PASS: 23 topics, 690 unique original questions; MathML fractions/superscripts; navigation assets");
(async()=>{
 if(process.env.RUN_BROWSER!=="1")return;
 const {chromium}=require("playwright");
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
  await page.locator("#avionicsView:visible .av-player").waitFor({timeout:30000});
  assert.equal(await page.locator(".av-topic").count(),23);
  assert.equal(await page.locator(".av-question-index button").count(),30);
  await page.locator("#avLevel").selectOption("Calculation");
  assert.equal(await page.locator(".av-question-index button").count(),10);
  assert.equal(await page.locator("#avSolution").isVisible(),false);
  await page.locator("#avReveal").click();
  assert.equal(await page.locator(".av-eq math").count(),2);
  assert(await page.locator(".av-eq mfrac").count()>0,"MathML fraction must render");
  await page.locator("#avNumber").fill("0.008");
  await page.locator("#avCalculate button").click();
  assert(await page.locator("#avNotice").textContent().then(t=>t.includes("Correct")));
  await page.locator("#avKnow").click();
  assert.equal(await page.locator(".av-topic.active small").textContent().then(t=>t.includes("1 of 30")),true);
  await page.locator("#avSearch").fill("Convert");
  assert.equal(await page.locator("#avSearch").inputValue(),"convert");
  await page.locator('[data-mode="cards"]').click();
  assert.equal(await page.locator("#cardsView").isVisible(),true);
  await page.locator('[data-mode="avionics"]').click();
  assert.equal(await page.locator("#avionicsView").isVisible(),true);
  await page.reload();await page.locator("#avionicsView .av-player").waitFor();
  assert(await page.locator(".av-topic.active small").textContent().then(t=>t.includes("1 of 30")));
  assert.equal(errors.length,0,"No JavaScript errors: "+errors.join("; "));
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
  await mobile.locator("#avionicsView .av-player").waitFor();
  assert.equal(await mobile.locator(".av-topic").count(),23);
  assert.equal(await mobile.locator("#avionicsView").isVisible(),true);
  await mobile.close();
  console.log("PASS: desktop, mobile, topic selection, math display, grading, hints and persisted progress");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
