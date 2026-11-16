"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {chromium}=require("playwright");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

// 1. Node VM Physics & 12-Problem Regression Checks
const ctx={window:{},Math,console,document:{},localStorage:{getItem:()=>null,setItem:()=>{}}};
vm.createContext(ctx);
for(const f of [
 "simulation/math_format.js",
 "avionics_data.js",
 "avionics_questions.js",
 "avionics_distinct_labs_v10.js",
 "avionics_distinct_math_v10.js",
 "avionics_distinct_reasoning_v10.js",
 "avionics_advanced_50_v12.js",
 "avionics_hw_debug_interview.js"
]){
 vm.runInContext(read(f),ctx,{filename:f});
}

const lab=ctx.window.avionicsHardwareDebugLab;
assert(lab&&lab.PROBLEMS&&lab.PROBLEMS.length===12,"Expected 12 hardware debug practice problems");

// Healthy 100 x 1 Ohm baseline paper math
const healthy=lab.calcArrayState(lab.makeArrayFromPreset("healthy_100"),{irPhase:"open_bias"});
assert.ok(Math.abs(healthy.rEqHealthy-0.01)<1e-12);
assert.ok(Math.abs(healthy.rEqIdeal-0.01)<1e-12);
assert.equal(healthy.iTotalHealthyNom,500);
assert.equal(healthy.pTotalHealthyNom,2500);
assert.ok(Math.abs(healthy.r2Wire-0.25)<1e-6,"2-wire DMM must reflect 0.24 Ohm lead error");
assert.ok(Math.abs(healthy.rows[0].tempC-60)<1e-6,"1 V bias on healthy 1 Ohm warms to 60 C");

// Phase B Pure Opens (4 opens: R12, R39, R71, R95)
const pureOpens=lab.calcArrayState(lab.makeArrayFromPreset("pure_opens"),{irPhase:"open_bias"});
assert.equal(pureOpens.activeHealthy,96);
assert.equal(pureOpens.activeOpens,4);
assert.ok(Math.abs(pureOpens.rEqIdeal-1/96)<1e-12);
assert.equal(pureOpens.iTotalNominalIdeal,480);
assert.equal(pureOpens.openEstimatedFromReq,4);
assert.equal(pureOpens.rows[11].tempC,25,"Open R12 stays cold at 25 C");
assert.equal(pureOpens.rows[11].isolatedDmm,"OL / ∞ Ω (OPEN)");

// Interview Mixed Fault (R14, R62 = 0 Ohm shorts + R27, R53, R88 = inf opens)
const mixedArr=lab.makeArrayFromPreset("interview_mixed");
const mixed0=lab.calcArrayState(mixedArr,{});
assert.equal(mixed0.activeShorts,2);
assert.equal(mixed0.activeOpens,3);
assert.equal(mixed0.rEqIdeal,0,"0 Ohm short masks open resistors");
assert.equal(mixed0.rows[13].isolatedDmm,"0.000 Ω (SHORT)");

const liftOne=lab.calcArrayState(mixedArr,{lifted:[14]});
assert.equal(liftOne.activeShorts,1,"Lifting R14 still leaves R62 shorted");
assert.equal(liftOne.rEqIdeal,0);

const liftBoth=lab.calcArrayState(mixedArr,{lifted:[14,62],irPhase:"open_bias"});
assert.equal(liftBoth.activeShorts,0,"Lifting R14 and R62 clears all shorts");
assert.ok(Math.abs(liftBoth.rEqIdeal-1/95)<1e-12,"95 healthy units remain in circuit");
assert.equal(liftBoth.rows[26].tempC,25,"Open R27 stays cold at 25 C");
assert.equal(liftBoth.rows[0].tempC,60,"Healthy R1 warms to 60 C");

// Bank half-split jumper JP2 (disables R11..R20 including R14)
const jmpTest=lab.calcArrayState(mixedArr,{jumpers:[true,false,true,true,true,true,true,true,true,true]});
assert.equal(jmpTest.bankSummary[1].jumperClosed,false);
assert.equal(jmpTest.activeShorts,1,"Opening JP2 isolates R14 short cleanly");

// Grade all 12 practice problems + rerolls
for(const p of lab.PROBLEMS){
 assert.equal(p.steps.length,8,p.id+" must have 8 baby steps");
 if(p.kind==="number"){
  assert.equal(lab.gradeProblem(p,String(p.expected)).good,true,p.id+" expected value must pass");
  assert.equal(lab.gradeProblem(p,String(p.expected*3+1)).good,false,p.id+" wrong value must fail");
  if(p.reroll){
   const r=p.reroll(a=>a[a.length-1]);
   assert(r.prompt&&Number.isFinite(r.expected));
   assert.equal(lab.gradeProblem({...p,...r},String(r.expected)).good,true,p.id+" reroll grading");
  }
 }
}
assert.equal(lab.gradeProblem(lab.PROBLEMS[0],"0.01 Ω").good,true,"Unit conversion Ω -> mΩ must pass HWD-01");
assert.equal(lab.gradeProblem(lab.PROBLEMS[8],"Paper math gives 10 mOhm and 500 A. Shorted resistor is 0 ohm which masks infinite ohm opens. Read the schematic, avoid 2-wire lead error by using 4-wire Kelvin and lift 1 pad out of circuit, current limit PSU and use IR camera hotspots for shorts first then IR cold spots for opens.").good,true,"HWD-09 interview rubric pass");

// Check customized questions in AVIONICS_QUESTIONS
const Q=ctx.window.AVIONICS_QUESTIONS;
assert.equal(Q.length,1150);
for(const qid of ["parallel-X7","parallel-X8","parallel-X9","schematics-X8","instruments-X8","power-X8","kcl-kvl-X8"]){
 const item=Q.find(x=>x.id===qid);
 assert(item,"Missing customized question "+qid);
 assert.equal(item.steps.length,8,qid+" 8 steps");
 assert(item.question.toLowerCase().includes("100")||item.question.toLowerCase().includes("parallel"),qid+" scope check");
}
assert.equal(Q.find(x=>x.id==="parallel-X7").expected,6);

// Offline & script wiring checks
const idx=read("index.html"),sw=read("sw.js"),tut=read("avionics_tutor.js");
assert(idx.includes("avionics_hw_debug_interview.js?v=1")&&idx.includes("avionics_hw_debug_interview.css?v=1"));
assert(idx.indexOf("avionics_hw_debug_interview.js")<idx.indexOf("avionics_tutor.js"));
assert(sw.includes("avionics_hw_debug_interview.js")&&sw.includes("avionics_hw_debug_interview.css"));
assert(sw.includes("slt-study-studio-v35-nvidia-scenario-lab-r1"));
assert(tut.includes("HWD.render(t,q)")&&tut.includes("avOpenHwdInterview"));

// 2. Headless Browser Verification at Desktop (1280px) & Mobile (390px)
(async()=>{
 const browser=await chromium.launch({
  headless:true,
  executablePath:process.env.PW_EXEC||undefined,
  args:["--no-sandbox"]
 });
 try{
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];
   page.on("pageerror",err=>errors.push(err.message));
   await page.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
   await page.locator("#avionicsView:visible .av-tutor").waitFor({timeout:25000});

   // Click top launch bar to jump straight to 5 V / 100 x 1 Ohm interview question Q38
   await page.locator("#avOpenHwdInterview").click();
   assert((await page.locator(".av-question-controls").textContent()).includes("38 / 50"),"Should navigate to Q38");
   await page.locator("#hwdStudio").waitFor({timeout:10000});
   assert.equal(await page.locator("#avHwdDetails").evaluate(e=>e.open),true,"HWD Studio auto-opens on parallel topic");

   // Verify KPI initial interview_mixed state (2 Short · 3 Open)
   assert.match(await page.locator("#hwdKpiFaults").textContent(),/2 Short \(0 Ω\) · 3 Open \(∞ Ω\)/);
   assert.match(await page.locator("#hwdKpiSel").textContent(),/0\.000 Ω \(SHORT\)/);

   // Verify MathML equations rendered inside HWD Studio
   assert.ok((await page.locator(".av-hwd-eqcard math").count())>=4,"HWD stacked MathML equations");

   // Click "Simulate Shorts Fixed -> Phase B" and verify all shorts cleared & opens become visible
   await page.locator("#hwdJumpToPhaseB").click();
   assert.match(await page.locator("#hwdKpiFaults").textContent(),/0 Short \(0 Ω\) · 3 Open \(∞ Ω\)/);
   assert.match(await page.locator("#hwdKpiReq").textContent(),/10\.526 mΩ/);

   // Select open resistor R27 and inspect out-of-circuit DMM value
   await page.locator('[data-hwd-rid="27"]').click();
   assert.match(await page.locator("#hwdKpiSel").textContent(),/OL \/ ∞ Ω \(OPEN\)/);

   // Test DMM probe table & bank jumper half-split view
   await page.locator('[data-hwd-view="dmm"]').click();
   assert.ok((await page.locator(".av-hwd-inspector table").count())>=2,"DMM bank table displayed");
   await page.locator('[data-hwd-jmp="1"]').click();
   assert.match(await page.locator('[data-hwd-jmp="1"]').textContent(),/OPEN/);

   // Test HWD-02 numerical grading + Practice New Numbers reroll
   await page.locator('[data-hwd-pidx="1"]').click();
   assert.match(await page.locator("#hwdProbPrompt").textContent(),/465 A/);
   await page.locator("#hwdAnsInput").fill("7");
   await page.locator("#hwdCheckBtn").click();
   assert.match(await page.locator("#hwdFeedback").textContent(),/Correct!/);

   const beforeReroll=await page.locator("#hwdProbPrompt").textContent();
   await page.locator("#hwdRerollBtn").click();
   const afterReroll=await page.locator("#hwdProbPrompt").textContent();
   assert.notEqual(afterReroll,beforeReroll,"Reroll must update HWD problem numbers");

   assert.deepEqual(errors,[],"No JS runtime errors at "+width+"px");
   console.log("PASS avionics-hw-debug-interview at "+width+"px: paper math, 100x1Ω PCB/IR matrix, 4W Kelvin vs 2W, pad lift, jumpers, 12 baby-step problems & MathML");
   await page.close();
  }
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
