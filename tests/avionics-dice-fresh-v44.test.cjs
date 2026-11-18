"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const ctx={window:{},console,Math};vm.createContext(ctx);
for(const f of ["avionics_data.js","avionics_questions.js","avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js","avionics_dice_methods_v12.js"]){
 vm.runInContext(read(f),ctx,{filename:f});
}
const Q=ctx.window.AVIONICS_QUESTIONS,D=ctx.window.AVIONICS_DICE_METHODS_V12;
assert.equal(Q.length,690);
assert.equal(D.configuredSlots,37);
assert.equal(D.slots,187);
const close=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=Math.max(1e-7,Math.abs(b)*3e-7);
const evalSub=s=>{
 const parts=String(s).split("="),expr=parts[parts.length-2].trim();
 // Equivalent to v12's existing exact independent numeric substitution check.
 return Function('"use strict"; return ('+expr.replace(/√\(/g,"Math.sqrt(").replace(/π/g,"Math.PI").replace(/log10\(/g,"Math.log10(").replace(/exp\(/g,"Math.exp(").replace(/\^/g,"**")+');')();
};
let cases=0,methods=0;
const flagged=[];
for(const q of Q.filter(q=>q.originalNumeric&&typeof q.variantGenerator==="function")){
 if(!D.freshInputs(q.id,1))continue; // Other authored generators remain independent.
 methods++;
 let previous=q.question,seen=new Set();
 for(let roll=1;roll<=60;roll++){
  const v=q.variantGenerator(roll);
  assert(v&&typeof v.question==="string"&&v.question!==q.question,q.id+" invalid question");
  assert.notEqual(v.question,previous,q.id+" consecutive click repeated parameters on roll "+roll);
  assert(!seen.has(v.question),q.id+" returned an already used question on roll "+roll);
  assert.equal(v.numericOperation,q.numericOperation,q.id+" method changed");
  assert.equal(v.sourceMethod,q.numericOperation,q.id+" source operation mismatch");
  assert(Number.isFinite(v.expected),q.id+" nonfinite result");
  assert(close(evalSub(v.sub),v.expected),q.id+" did not recompute result from variant expression: "+v.sub);
  previous=v.question;seen.add(v.question);cases++;
 }
}
assert.equal(methods,37);
const unresolved=Q.filter(q=>q.originalNumeric&&(!q.variantGenerator)&&q.variantPool?.length<=1).map(q=>q.id);
console.log("Dice audit: "+methods+" fully source-recomputed method slots, "+cases+" unique sequential verified rolls; pool-only <=1 with no generator: "+unresolved.length+" — "+unresolved.slice(0,60).join(","));
assert(!read("avionics_tutor.js").includes("roll%2===1||!pool.length"),"Dice caller must not alternate with stale pool");
assert(read("avionics_tutor.js").includes("No additional verified same-method number set"),"Exhausted pool must report rather than pretend to reroll");
console.log("PASS v44 Avionics 37 methods x 60 distinct and independently recalculated dice variants, ID and method isolation.");

(async()=>{
 if(process.env.RUN_BROWSER!=="1")return;
 const {chromium}=require("playwright");
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:860}});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
   await page.locator("#avionicsView .av-workbook").waitFor({timeout:30000});
   await page.locator('#avionicsView [data-qid="ohm-C3"]').first().click();
   const prompts=new Set();
   const readPrompt=()=>page.locator("#avionicsView .av-active-banner p").first().textContent();
   const canonical=await readPrompt();
   prompts.add(canonical);
   for(let n=0;n<16;n++){
    await page.locator("#avionicsView #avRandomize").click();
    const prompt=await readPrompt();
    assert(!prompts.has(prompt),"Browser dice repeat after click "+(n+1)+" at "+width+"px: "+prompt);
    prompts.add(prompt);
   }
   const active=await readPrompt();
   await page.locator('#avionicsView [data-page="try"]').click();
   assert(await page.locator("#avionicsView #avTryNumber").count()>0);
   await page.locator('#avionicsView [data-page="learn"]').click();
   await page.locator("#avionicsView #avResetVariant").click();
   assert.equal(await readPrompt(),canonical,"Restore Canonical changed the original question");
   assert.notEqual(active,canonical);
   assert.equal(errors.length,0,errors.join("; "));
   console.log("PASS v44 browser "+width+"px: 16 distinct dice clicks, Try mode and canonical restore.");
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
