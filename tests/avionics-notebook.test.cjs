"use strict";
/* Test each original notebook lab against independent arithmetic, source scope, MathML and schematic output. */
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const c={window:{},localStorage:{getItem:()=>null,setItem:()=>{}},console};
vm.createContext(c);
vm.runInContext(read("avionics_notebook_cases.js"),c,{filename:"avionics_notebook_cases.js"});
vm.runInContext(read("avionics_notebook_labs.js"),c,{filename:"avionics_notebook_labs.js"});
const cases=c.window.AVIONICS_NOTEBOOK_CASES,lab=c.window.avionicsNotebookLabs;
assert(cases&&lab&&Object.keys(cases).length===23);
const basic=read("avionics_data.js");vm.runInContext(basic,c,{filename:"avionics_data.js"});
const topicIds=Array.from(c.window.AVIONICS_TOPICS.map(t=>t.id));
for(const id of topicIds){
 const x=cases[id];assert(x,id+" missing authored notebook exercise");
 assert(x.provenance&&x.provenance.includes("·"),id+" source label");
 assert(x.steps.length===4,id+" four baby steps");
 for(const step of x.steps)assert(step.length>23,id+" insufficient explanation");
 assert(x.unit&&x.pitfall&&x.pitfall.length>=38,id+" unit/mistake warning");
 const clean=String(x.sub.split("=").at(-1)).replace(/\blog10\s*\(/g,"Math.log10(").replace(/\^/g,"**");
 assert(/^[0-9\s+\-*\/().MathlogPI]+$/i.test(clean),id+" unreadable arithmetic: "+clean);
 const actual=vm.runInNewContext(clean,{Math},{timeout:1000});
 assert(Number.isFinite(actual),id+" nonfinite");
 const expected=x.answer;
 assert(Math.abs(actual-expected)<=Math.max(0.0000005,Math.abs(expected)*0.00002),id+" expected mismatch "+actual+" vs "+expected);
 const right=lab.grade(id,String(x.answer));assert.equal(right.band,"correct",id+" answer grade");
 const wrong=lab.grade(id,String(x.answer*2));assert.notEqual(wrong.band,"correct",id+" wrong grade");
 const missing=lab.grade(id,"");assert.equal(missing.band,"invalid",id+" blank grade");
 const html=lab.render(id);
 assert(html.includes('data-nb-topic="'+id+'"'),id+" topic panel");
 assert(html.includes("<svg")&&html.includes("<math")||html.includes("av-nb-math"),id+" missing visual or equation");
 assert(html.includes("Baby-step solution")&&html.includes("Check my result"),id+" missing guided practice");
 assert(!html.includes("Huy Nguyen")&&!html.includes("Dr.Mostafa")&&!html.includes("Brandon Chau"),id+" private names");
}
const source=cases["kcl-kvl"];
assert(Math.abs(source.answer-(9.009-(2.968+5.723)))<1e-9,"Lab 7 KCL discrepancy calculation");
assert(Math.abs(cases.schematics.answer-(330+1000*470/1470+220))<1e-6,"Lab 7 reduction");
assert(Math.abs(cases.parallel.answer-(9/cases.schematics.answer)*(1000*470/1470))<0.0001,"Parallel branch voltage consistency"); // mA through 1 kΩ equals volts as numeric
assert(cases.components.steps.some(x=>x.includes("Cout=1")&&x.includes("Sum=1")),"Full adder circuit logic");
const rendered=lab.render("components");assert(rendered.includes("XOR 1")&&rendered.includes("Carry logic"));
const code=read("avionics_tutor.js"),idx=read("index.html"),cache=read("sw.js");
assert(code.includes("NOTEBOOK.render(t.id)")&&code.includes("NOTEBOOK.bind(host)"));
assert(idx.includes("avionics_notebook_labs.js?v=1")&&idx.includes("avionics_notebook_cases.js?v=1"));
assert(cache.includes("v26-coursework-notebook-labs")&&cache.includes("avionics_notebook_labs.css"));
console.log("PASS: 23 original topic-specific labs, 23 recomputed answers, 23 diagrams and graded forms, privacy and Lab 7 evidence corrections");
