"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const ctx={window:{},console,Math};vm.createContext(ctx);
for(const f of ["avionics_data.js","avionics_questions.js"]){vm.runInContext(read(f),ctx,{filename:f});}
const baseOriginal=new Map();
for(const q of ctx.window.AVIONICS_QUESTIONS.filter(q=>q.level==="Calculation")){
 const k=q.topic+"::"+q.calcFamily,s=baseOriginal.get(k)||new Set();
 s.add(q.question);baseOriginal.set(k,s);
}
for(const f of ["avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js","avionics_dice_methods_v12.js"]){
 vm.runInContext(read(f),ctx,{filename:f});
}
const q=ctx.window.AVIONICS_QUESTIONS,mark=ctx.window.AVIONICS_DICE_METHODS_V12;
assert.equal(q.length,690);assert.equal(mark.slots,187);
assert.equal(mark.generated,74);assert(mark.removed>1000);
const closish=(a,b)=>Math.abs(a-b)<=Math.max(1e-7,Math.abs(b)*0.00005);
function evalSub(sub){
 const p=String(sub).split("=");assert(p.length>=3,sub);
 const expr=p[p.length-2].trim().replace(/√\(/g,"Math.sqrt(").replace(/π/g,"Math.PI").replace(/log10\(/g,"Math.log10(").replace(/exp\(/g,"Math.exp(").replace(/\^/g,"**");
 return Function("return ("+expr+")")();
}
let cases=0,methodSafe=0,examples=0,crafted=0;
for(const x of q.filter(q=>q.originalNumeric)){
 assert(x.variantPool.length>0,x.id+" no method-safe variants");
 const disallowed=baseOriginal.get(x.topic+"::"+x.calcFamily)||new Set();
 for(const v of x.variantPool){
  assert(!disallowed.has(v.question),x.id+" reintroduced obsolete-method-family problem");
  assert.equal(v.sourceMethod,x.numericOperation,x.id+" switched numerical operation");
  assert(v.question!==x.question,x.id+" canonical question presented as dice variant");
  assert(Number.isFinite(Number(v.expected)),x.id+" variant nonfinite");
  if(v.sub){assert(closish(evalSub(v.sub),v.expected),x.id+" expression != numeric result: "+v.sub);examples++;}
  cases++;
 }
 if(x.variantPool.filter(v=>v.numericOperation===x.numericOperation).length>=2)crafted++;
 methodSafe++;
}
assert.equal(methodSafe,187);
assert(crafted>=37,"All 37 previously uncovered solving methods now need >=2 calculated variants");
const index=read("index.html"),sw=read("sw.js");
assert(index.includes("avionics_dice_methods_v12.js?v=1"));
assert(sw.includes('./avionics_dice_methods_v12.js'));
assert(sw.includes("slt-study-studio-v35-nvidia-scenario-lab-r1"));
assert(index.indexOf("avionics_distinct_math_v10.js")<index.indexOf("avionics_dice_methods_v12.js"));
assert(index.indexOf("avionics_dice_methods_v12.js")<index.indexOf("avionics_mixed_networks_v11.js"));
console.log("PASS v12: "+methodSafe+" corrected slots; "+mark.removed+" old-family variants removed, "+mark.generated+" new method-matched variants, "+cases+" audited dice problems, "+examples+" independently evaluated substitutions.");
