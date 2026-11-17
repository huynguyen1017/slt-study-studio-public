"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const context={window:{},document:undefined};vm.createContext(context);
vm.runInContext(read("simulation/math_format.js"),context);
vm.runInContext(read("circuit_question_railroad_v2.js"),context);
const pad=context.window.CIRCUIT_CURRENT_QUESTION_RAILROAD;
assert(pad && pad.version==="3.0");
const given=pad.extractQuantities("Supply 12 V; R1 2.4 kΩ; shunt 5 mΩ; current 25 mA; cap 0.47 µF; t 20 ns; C 100 pF.");
const get=u=>given.find(g=>g.unit===u);
assert.equal(get("V").scaled,12);
assert.equal(get("kΩ").scaled,2400);
assert.equal(get("mΩ").scaled,0.005);
assert.equal(get("mA").scaled,0.025);
assert.equal(get("µF").scaled,4.7e-7);
assert.equal(get("ns").scaled,2e-8);
assert.equal(get("pF").scaled,1e-10);
assert.equal(pad.extractQuantities("2.4 kΩ and 2.4 kΩ").length,1,"duplicate givens listed once");
const selected={
 id:"ohm-C1",question:"At 12 V across 2.4 kΩ, find the current in mA.",
 formula:"I = V / R",sub:"I = 12 V / (2.4 * 10^3 Ω) = 5 mA",
 expected:5,unit:"mA"
};
const before=JSON.stringify(selected);
const html=pad.render(selected,{id:"ohm",title:"Ohm's law"});
assert.equal(JSON.stringify(selected),before,"do not edit question, score or random variant");
assert(html.includes("ohm-C1")&&html.includes("2.4 kΩ")&&html.includes("2400 Ω"));
assert(html.includes("rr-cancel")&&html.includes("rr-fraction")&&html.includes("<math"));
assert(html.includes("Expected answer stored for this selected question"));
assert(html.includes("5 mA"));
assert(!html.includes("undefined"));
assert(!pad.render({id:"x",question:"Explain why current flows."},{id:"x"}),"avoid fake calculations on conceptual questions");
const malicious=pad.render({
 id:"<img src=x onerror=alert(1)>",question:"test 2.4 kΩ",
 formula:"I = V / R",expected:1,unit:"A"
},{title:"<script>alert(1)</script>"});
assert(!malicious.includes("<script>")&&!malicious.includes("<img"));
const rolled={...selected,question:"At 9 V across 3 kΩ, calculate mA.",expected:3};
const v=pad.render(rolled,{title:"Ohm"});
assert(v.includes("3000 Ω")&&v.includes("3 mA"));
assert(!v.includes("2400 Ω"),"rail must track current selected variant");
const shell=read("index.html"),cache=read("sw.js"),spread=read("professor_notebook_spreads.js");
for(const file of ["circuit_question_railroad_v2.js","circuit_question_railroad_v2.css"]){
 assert(shell.includes(file),file+" loaded in webpage");
 assert(cache.includes(file),file+" cached for offline use");
}
assert(shell.indexOf("circuit_question_railroad_v2.js")<shell.indexOf("professor_notebook_spreads.js"));
assert(spread.includes("svgNotebookFactorLabel") && spread.includes("svgNotebookEquation"),"Native SVG pictures should draw fraction bars and canceled units");
assert(read("avionics_tutor.js").includes("renderStage(q,t,\"visual\")"));
assert(read("nvidia_slt_tutor.js").includes('renderStage(q,topicObj,"try")'));
assert(cache.includes("v38-current-question-railroad"));
assert(shell.includes("circuit_railroad_whiteboard_v1.js"),"retain four reference whiteboards");
console.log("PASS v38: prefix cancellation, current-question and dice-variant isolation, MathML, escaping, existing course and offline integration.");
(async()=>{
 if(process.env.RUN_BROWSER!=="1")return;
 const {chromium}=require("playwright");
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[];page.on("pageerror",err=>errors.push(err.message));
  await page.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
  await page.locator("#avionicsView .av-tutor").waitFor({timeout:30000});
  await page.locator("#avTopicList").selectOption("series");
  for(let i=0;i<11;i++)await page.locator("#avQuestionNext").click();
  await page.locator('[data-page="work"]').click();
  const white=page.locator(".rrq-workpad").first();
  await white.waitFor({timeout:20000});
  assert((await white.locator(".rrq-rail .rr-fraction").count()>0) || (await white.textContent()).includes("No prefix cancellation is needed"),"A question with unprefixed Ω must not fabricate a prefix cancellation");
  assert(await white.locator("math").count()>0,"MathML equation required");
  await page.setViewportSize({width:375,height:800});
  assert(await white.isVisible(),"keep worksheet accessible at mobile width");
  assert.equal(errors.length,0,errors.join("\n"));
  console.log("PASS browser v38: question-specific rails and MathML in Avionics Q12, mobile 375px.");
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});