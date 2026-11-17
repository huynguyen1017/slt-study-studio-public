"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const ctx={window:{},Math,console,localStorage:{getItem:()=>null,setItem:()=>{}}};vm.createContext(ctx);
for(const file of [
 "simulation/math_format.js","avionics_data.js","avionics_questions.js",
 "avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js","avionics_distinct_reasoning_v10.js",
 "avionics_advanced_50_v12.js","avionics_array_math_v40.js","avionics_hw_debug_interview.js",
 "circuit_railroad_whiteboard_v1.js"
])vm.runInContext(read(file),ctx,{filename:file});
const M=ctx.window.AVIONICS_ARRAY_MATH_V40,Q=ctx.window.AVIONICS_QUESTIONS;
assert.equal(M.version,"40.0");
assert.equal(Q.length,1150,"Preserve 690 original questions + 460 advanced");
assert.equal(new Set(Q.map(q=>q.id)).size,1150);
const q=Q.find(x=>x.id==="parallel-X8");
assert(q&&M.isCase(q));
assert.equal(q.steps.length,8);
assert(q.formula.includes("R_eq = R_nom / N_healthy")&&!q.formula.includes("/ 0"));
assert(q.sub.includes("0.010 Ω"));
assert.equal(M.steps.length,8);
for(let i=0;i<8;i++){
 const content=M.renderStep(q,i);
 assert(content.includes("a40-step")&&content.includes("<math")&&content.includes("EQUATION"),"Step "+(i+1)+" needs real native MathML");
 assert(!content.includes("N_short / 0"),"Cannot perform numerical division by 0 Ω");
}
const s5=M.renderStep(q,4),s7=M.renderStep(q,6);
assert(s5.includes("0.00417362")&&s5.includes("0.00871"),"Must compute physical CC response and realistic short power");
assert(s7.includes("0.010309278")&&s7.includes("a40-rail"),"Open count needs unitless railroad ratio");
assert(M.render("understand",q).includes("<mfrac>"),"Understand needs genuine stacked MathML");
assert(M.render("evidence",q).includes("<mfrac>"),"Worked evidence needs genuine stacked MathML");
assert(M.render("visual",q).includes("a40-rail"),"Visual should contain unit conversion");
assert(M.render("interview",q).includes("500 A")&&M.render("interview",q).includes("theoretically"),"Spoken answer must say theoretical");
assert(!M.render("try",q).includes("N_open = 100 - 97 = 3"),"Try tab may not leak worked answer");
assert(M.render("muon").includes("<mfrac>"),"Muon interview deep dive uses MathML");
assert(M.render("studio",q).includes("<mfrac>"),"Debug simulator math uses same proven circuit");
assert(M.prefixRail.includes("<s>Ω</s>")&&M.prefixRail.includes("10.0 mΩ"),"Real crossing-out identical units");
const lab=ctx.window.avionicsHardwareDebugLab;
const healthy=lab.calcArrayState(lab.makeArrayFromPreset("healthy_100"),{irPhase:"open_bias"});
const physical=lab.calcArrayState(lab.makeArrayFromPreset("single_short"),{irPhase:"short_limit"});
assert(healthy.benchI<=2.50001&&Math.abs(healthy.benchV-.025)<1e-10,"Open diagnosis must obey current compliance");
assert(healthy.rows[0].tempC<26,"IR simulation may not fake 60C from 2.5A");
assert(physical.benchI<=2.50001);
assert(physical.rows[41].pBench<.04,"2mΩ bridge at 2.5A cannot dissipate 0.18Ω invented heat");
assert(lab.PROBLEMS.find(x=>x.id==="HWD-09").steps[4].includes("8.7 mW"));
const html=read("index.html"),sw=read("sw.js");
for(const f of ["avionics_array_math_v40.js","avionics_array_math_v40.css"]){assert(html.includes(f)&&sw.includes(f));}
assert(html.indexOf("avionics_array_math_v40.js")<html.indexOf("professor_mastery_engine.js"));
assert(read("avionics_tutor.js").includes('render("evidence",q)'));
assert(read("avionics_tutor.js").includes('render("visual",q)'));
assert(read("professor_mastery_engine.js").includes('render("interview",q)'));
assert(read("circuit_railroad_whiteboard_v1.js").includes('R_p = (12 Ω * 4 Ω) / (12 Ω + 4 Ω) = 3 Ω'));
console.log("PASS v40: 1150 stable Avionics IDs, 8 fully typeset steps, dimensional short/open proof, kelvin and IR power limits, all named panels and offline assets.");

(async()=>{
 if(process.env.RUN_BROWSER!=="1")return;
 const {chromium}=require("playwright");
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:890}});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
   await page.locator("#avOpenHwdInterview").waitFor({timeout:25000});
   await page.locator("#avOpenHwdInterview").click();
   assert((await page.locator(".av-question-controls").textContent()).includes("38 / 50"));
   const nav=[["learn","understand"],["visual","visual"],["work","worked"],["try","try"]];
   for(const [tab,mode] of nav){
    await page.locator('#avionicsView [data-page="'+tab+'"]').click();
    await page.locator(".a40-"+mode).first().waitFor({timeout:20000});
    assert(await page.locator(".a40-"+mode+" math mfrac").count()>0,tab+" needs real stacked MathML");
   }
   await page.locator('#avionicsView [data-page="learn"]').click();
   assert(await page.locator(".a40-evidence math mfrac").count()>0,"Worked evidence needs stacked MathML");
   assert(await page.locator(".a40-muon math mfrac").count()>0,"Muon guide missing MathML");
   assert(await page.locator(".a40-studio math mfrac").count()>0,"Hardware Debug Studio missing math");
   await page.locator('#avionicsView [data-page="work"]').click();
   assert(await page.locator(".a40-step math").count()>=8,"Eight-step page must typeset each calculation");
   assert.equal(errors.length,0,errors.join("; "));
   console.log("PASS v40 Chromium "+width+"px: 4 tabs, Muon, studio, professor, full 8-step and MathML.");
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
