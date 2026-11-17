"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const load=p=>fs.readFileSync(path.join(root,p),"utf8");
const ctx={window:{studyMath:(x)=>'<math data-formula="'+x.replaceAll('"',"&quot;")+'"></math>'}};
vm.createContext(ctx);
vm.runInContext(load("engineering_solved_cases_v1.js"),ctx);
const E=ctx.window.ENGINEERING_SOLVED_CASES;
assert(E&&E.render,"Engineering case module not loaded");
const ohm=E.cases["ohm-F1"],dram=E.cases["nvs-dram-14"];
assert.equal(Object.keys(E.cases).length,2);
assert.equal(ohm.stages.length,8);assert.equal(dram.stages.length,8);
assert(Math.abs(5/220*1000-22.7272727)<0.0001);
assert.equal(3.3/0.015,220);
assert(Math.abs((5-3.3)/.015-113.333333333333)<1e-9);
assert.equal(20*.625,12.5);
assert.equal(12.5-13.75,-1.25);
assert.equal(Math.ceil(13.75/.625),22);
assert.equal(13.75*3,41.25);
const av=E.render({id:"ohm-F1",variant:false},"avionics");
const nv=E.render({id:"nvs-dram-14",variant:false},"nvidia");
assert(av.includes("113.3")&&av.includes("burden voltage")&&av.includes("Kirchhoff"));
assert(nv.includes("tRCD")&&nv.includes("22 cycles")&&nv.includes("row conflict"));
for(const h of [av,nv]){
 assert.equal((h.match(/class="eng-case-step"/g)||[]).length,8);
 assert(h.includes("<math")&&h.includes("Technical hiring-manager answer"));
 assert(h.includes("hypothetical")||h.includes("hypothetical"));
}
assert.equal(E.render({id:"ohm-F1"},"nvidia"),"");
assert.equal(E.render({id:"nvs-dram-14",variant:true},"nvidia"),"","No mismatch between rolled numbers and fixed worked example");
assert.equal(E.render({id:"nvs-dram-15"},"nvidia"),"","Do not copy a solution onto an unrelated question");
for(const p of ["index.html","sw.js"]){
 const txt=load(p);assert(txt.includes("engineering_solved_cases_v1"),p+" missing authored asset");
}
for(const p of ["avionics_tutor.js","nvidia_slt_ui.js"]){
 assert(load(p).includes("ENGINEERING_SOLVED_CASES.render"),p+" missing actual authored case render hook");
}
const html=load("index.html");
assert(html.indexOf("engineering_solved_cases_v1.js")<html.indexOf("avionics_tutor.js"));
assert(html.indexOf("engineering_solved_cases_v1.js")<html.indexOf("nvidia_slt_ui.js"));
const sw=load("sw.js");
assert(sw.includes("v2-engineering-cases"));
console.log("PASS: 8-step engineering fault diagnosis x2; verified numeric computations; correct question attachment; math rendering; offline files; no canonical dice contamination");
