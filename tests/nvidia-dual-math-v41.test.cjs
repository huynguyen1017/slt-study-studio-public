"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const ctx={window:{},document:undefined,Math,console};vm.createContext(ctx);
for(const f of ["simulation/math_format.js","circuit_question_railroad_v2.js","nvidia_slt_equations_v41.js"])vm.runInContext(read(f),ctx,{filename:f});
const n=ctx.window.NVIDIA_SLT_EQUATION_NOTEBOOK_V41;
assert.equal(n.version,"41.0");
const q={id:"nvidia-current-21",question:"A 12 V rail supplies a 2.4 kΩ load. Calculate I in mA.",formula:"I = V / R",sub:"I = 12 V / (2.4 * 10^3 Ω) = 5 mA",expected:5,unit:"mA",steps:["Find source and return","Convert 2.4 kΩ into Ω","Apply Ohm's law","Substitute 12 V and 2400 Ω","Check KCL and units"]};
const old=JSON.stringify(q);
for(const stage of ["understand","visual","baby","try"]){
 const html=n.render(q,{title:"Electrical Foundations"},stage);
 assert(html.includes("ne41-"+stage)&&html.includes("nvidia-current-21"),stage+" not sourced");
 if(stage==="understand")assert(html.includes("rrq-rail")&&html.includes("rr-cancel"),"railroad cancellation needed");
 if(stage==="visual")assert(html.includes("ne41-svg-rail")&&html.includes("<mfrac")&&html.includes("<path"),"native SVG math and MathML needed");
 if(stage==="baby")assert(html.includes("ne41-worked-step")&&html.includes("2400"),"original steps needed");
 if(stage==="try")assert(!html.includes("5 mA")&&!html.includes("Substitution ="),"try must hide complete answer");
}
assert.equal(JSON.stringify(q),old,"must not alter scores, questions, variants");
const roll={...q,question:"A 9 V rail supplies a 3.0 kΩ load.",sub:"I = 9 V / (3 * 10^3 Ω) = 3 mA",expected:3};
assert(n.render(roll,{},"visual").includes("3.0 kΩ")&&!n.render(roll,{},"visual").includes("2.4 kΩ"));
const concept={id:"socboot-F1",question:"Explain reset release and bus initialization.",steps:["Define reset","Find power-good"]};
assert(n.render(concept,{},"understand").includes("No explicit numerical governing law"));
assert(!n.render(concept,{},"visual").includes("ne41-svg-rail"));
assert(n.renderInterview(concept,{}).includes("Conceptual problem"));
assert(n.renderInterview(q,{}).includes("5 mA")&&n.renderInterview(q,{}).includes("<mfrac"));
for(const f of ["nvidia_slt_ui.js","nvidia_slt_tutor.js","nvidia_slt_equations_v41.js","professor_mastery_engine.js"])new Function(read(f));
const engineer=read("nvidia_slt_ui.js"),prep=read("nvidia_slt_tutor.js"),pme=read("professor_mastery_engine.js");
for(const s of ["understand","visual","baby","try"]){assert(prep.includes('NVIDIA_SLT_EQUATION_NOTEBOOK_V41?.render(q,topicObj,"'+s+'")'));assert(engineer.includes(',"'+s+'")'));}
assert(!prep.includes("580e-3 V"),"generic fixed PDN numeric result must be gone");
assert(!prep.includes('placeholder="e.g.'),"numeric Try answer placeholder must not leak exact expected");
assert(pme.includes("return window.NVIDIA_SLT_EQUATION_NOTEBOOK_V41.renderInterview(q,t)"));
assert(read("index.html").includes("nvidia_slt_equations_v41.js?v=2"));
assert(read("sw.js").includes('"./nvidia_slt_equations_v41.js"'));
console.log("PASS v41 static: all eight NVIDIA screens, MathML, crossed units, SVG, dice, no invented numeric values, hidden Try.");

(async()=>{
 if(process.env.RUN_BROWSER!=="1")return;
 const {chromium}=require("playwright");
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:820}});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8765/#nvidia",{waitUntil:"load"});
   await page.locator("#nvidiaView .nvs-app").waitFor({timeout:30000});
   await page.locator('#nvidiaView [data-goto="20"]').first().click();
   for(const [screen,stage] of [["concept","understand"],["steps","baby"],["practice","try"],["evidence","visual"]]){
    await page.locator('#nvidiaView [data-screen="'+screen+'"]').first().click();
    await page.locator("#nvidiaView .ne41-"+stage).waitFor({timeout:20000});
   }
   await page.locator('[data-mode="nvidia-slt"]').first().click();
   await page.locator("#nvidia-sltView .nv-wrap").waitFor({timeout:30000});
   for(const [tab,stage] of [[1,"understand"],[2,"visual"],[3,"baby"],[4,"try"]]){
    await page.locator('#nvidia-sltView [data-ptab="'+tab+'"]').click();
    await page.locator("#nvidia-sltView .ne41-"+stage).waitFor({timeout:20000});
   }
   assert.equal(errors.length,0,errors.join("; "));
   console.log("PASS v41 Chromium "+width+"px: NVIDIA Engineer and NVIDIA Prep all eight views.");
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});