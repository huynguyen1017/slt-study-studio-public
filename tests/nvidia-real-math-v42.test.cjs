"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const sandbox={window:{},Math,console};vm.createContext(sandbox);
for(const f of ["simulation/math_format.js","circuit_question_railroad_v2.js","nvidia_slt_math_proofs_v42.js","nvidia_slt_equations_v41.js"])vm.runInContext(read(f),sandbox,{filename:f});
const M=sandbox.window.NVIDIA_SLT_MATH_PROOFS_V42,R=sandbox.window.NVIDIA_SLT_EQUATION_NOTEBOOK_V41;
assert.equal(M.version,"42.0");
const q=(method,prompt,expression,expected,unit,formula="I = V / R")=>({
 id:"nvs-electrical-21",topic:"electrical",questionType:"number",question:"Q21. Numerical SLT reasoning — "+prompt+" Show all units.",
 operation:method,unit,expected,formula,sub:formula+"; substitute: "+expression+" = "+expected+" "+unit,
 steps:["Define the load","Name actual input givens","Write governing relationship","Substitute","Compute and convert units","Compare independent reading","Check rating and safety","Interpret","Interview answer"],
 math:{method,prompt,expression,expected,unit,formula,sub:formula+"; substitute: "+expression+" = "+expected+" "+unit,check:"Check the actual source and a known-good independent reading."}
});
const current=q("current","A 4 V rail drives a 175 Ω load. Find current in mA.","1000*4/175",1000*4/175,"mA");
for(const stage of ["understand","visual","baby","try"]){
 const html=R.render(current,{title:"Electrical Foundations"},stage);
 assert(html.includes("ne41-"+stage)&&html.includes("ne42-proof"),"v42 on "+stage);
 if(stage!=="try"){
  assert(html.includes("<mfrac>")&&html.includes("updiagonalstrike"),"real native fraction and cancelled units in "+stage);
  assert(html.includes("175")&&html.includes("4"),"actual Q21 inputs in "+stage);
  assert(!html.includes("No prefixed SI quantity")&&!html.includes("substitute:"),"no old fallback/raw substitution in "+stage);
 }else{
  assert(!html.includes("22.857")&&!html.includes("0.091428"),"Try must not show target");
 }
}
assert(R.render(current,{},"visual").includes("ne42-figure"),"source unit fraction drawn inside SVG picture");
assert(M.prefix(current).includes("A → mA")&&M.prefix(current).includes("updiagonalstrike"),"output conversion even if no prefixed inputs");
assert(M.solved(current).limits[0].includes("0.091428571 W"));
assert(M.interview(current,{}).includes("0.091428571 W")&&!M.interview(current,{}).includes("0.24 Ω"),"interview tied to actual circuit");
const reroll=q("current","A 9 V rail drives a 300 Ω load. Find current in mA.","1000*9/300",30,"mA");
assert(R.render(reroll,{},"understand").includes("300 Ω")&&!R.render(reroll,{},"understand").includes("175 Ω"),"dice must recompute inputs and output");
assert(M.solved(reroll).limits[0].includes("0.27 W"),"power check changes with dice");
const par=q("parallel","A 6 V supply drives 130 Ω in series with (175 Ω in parallel with 350 Ω). Find source current in mA.","1000*6/(130+(175*350)/(175+350))",1000*6/(130+(175*350)/(175+350)),"mA","I = V / (Rs+Rp)");
assert(M.solved(par).arr.some(x=>x.includes("KVL")), "parallel case has independent KVL check");
const pow=q("power","A regulated rail is 1.40 V and draws 350 mA. Find load power in W.","1.4*(350/1000)",.49,"W","P = V * I");
assert(M.solved(pow).arr.some(x=>x.includes("mA")&&x.includes("updiagonalstrike")),"power converts current input before use");
const sh=q("shunt","A Kelvin shunt has 5 mΩ resistance and 25 mV across it. Calculate current in A.","(25/1000)/(5/1000)",5,"A");
assert(M.solved(sh).arr.some(x=>x.includes("5")&&x.includes("25")));
const droop=q("droop","Nominal core rail = 1.150 V; worst load minimum = 0.970 V. Calculate positive droop in mV.","1000*(1.15-.97)",180,"mV");
assert(M.prefix(droop).includes("V → mV"));
const rc=q("rc","An RC reset network has R=3 kΩ and C=5.20 µF. Calculate one time constant τ in ms.","3*5.2",15.6,"ms","tau = R*C");
assert(M.solved(rc).arr.some(x=>x.includes("ms")));
const absent={id:"concept",question:"Define Ohm's law",steps:["Define Ohm's law"]};
assert(!M.valid(absent)&&R.render(absent,{},"understand").includes("Conceptual problem"));
for(const f of ["nvidia_slt_ui.js","nvidia_slt_tutor.js","professor_mastery_engine.js","nvidia_slt_equations_v41.js","nvidia_slt_math_proofs_v42.js"])new Function(read(f));
const engineer=read("nvidia_slt_ui.js"),professor=read("professor_mastery_engine.js");
assert(engineer.includes("numericProof")&&professor.includes("NVIDIA_SLT_MATH_PROOFS_V42?.valid(q)"));
assert(read("index.html").includes("nvidia_slt_math_proofs_v42.js?v=1"));
assert(read("sw.js").includes('"./nvidia_slt_math_proofs_v42.js"'));
console.log("PASS v42: Q21 output A→mA, real SVG/MathML, cross-cancellation, power check, numeric variants, all four screens and other circuit families.");

(async()=>{
 if(process.env.RUN_BROWSER!=="1")return;
 const {chromium}=require("playwright");
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on("pageerror",x=>errors.push(x.message));
   await page.goto("http://127.0.0.1:8765/#nvidia",{waitUntil:"load"});
   await page.locator("#nvidiaView .nvs-app").waitFor({timeout:30000});
   await page.locator('#nvidiaView [data-goto="20"]').first().click();
   for(const [screen,stage] of [["concept","understand"],["steps","baby"],["practice","try"],["evidence","visual"]]){
    await page.locator('#nvidiaView [data-screen="'+screen+'"]').first().click();
    await page.locator("#nvidiaView .ne42-"+stage).waitFor({timeout:22000});
    const content=await page.locator("#nvidiaView .ne42-"+stage).first().innerHTML();
    if(stage==="try")assert(!content.includes("22.857"),"Try cannot reveal Q21 answer");
    else assert(content.includes("updiagonalstrike"),"missing MathML crossed-out units "+stage);
   }
   await page.locator('#nvidiaView [data-screen="concept"]').first().click();
   assert(await page.locator("#nvidiaView svg.ne42-figure").count()>0,"Q21 figure must show converted units");
   assert(!(await page.locator("#nvidiaView").innerText()).includes("No unambiguous prefixed value in this question"),"old professor content remains");
   assert(!(await page.locator("#nvidiaView").innerText()).includes("substitute: 1000 * 4 / 175"),"old raw semicolon substitution remains");
   assert.equal(errors.length,0,errors.join("; "));
   console.log("PASS v42 Chromium "+width+"px NVIDIA Q21: all 4 tabs, correct native MathML and SVG, no repeated bad lecturer/math.");
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
