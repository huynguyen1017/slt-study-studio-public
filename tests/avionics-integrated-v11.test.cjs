"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const ctx={window:{},Math,console};vm.createContext(ctx);
const files=["avionics_data.js","avionics_questions.js","avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js",
"avionics_dice_methods_v12.js","avionics_distinct_reasoning_v10.js","avionics_integrative_capstones_v11.js","avionics_mixed_networks_v11.js",
"avionics_visuals.js","avionics_mixed_visuals_v11.js","avionics_assessor.js","avionics_circuit_simulator.js","avionics_nucleo_workbench.js"];
for(const p of files)vm.runInContext(read(p),ctx,{filename:p});
const t=ctx.window.AVIONICS_TOPICS,q=ctx.window.AVIONICS_QUESTIONS,net=ctx.window.avionicsMixedCircuitCurriculum,
vis=ctx.window.avionicsVisuals,score=ctx.window.avionicsAnswerCheck;
const close=(a,b)=>Math.abs(a-b)<=Math.max(0.000001,Math.abs(b)*1e-6);
assert.equal(ctx.window.AVIONICS_DISTINCT_CURRICULUM_VERSION,11);
assert.equal(t.length,23);assert.equal(q.length,690);
const D=id=>t.find(x=>x.id===id);
const P=(a,b)=>a*b/(a+b);
function reference(kind,v){
 const {a,b,c,d,top,bot,load,meter,measured,branch2,branch3,droop}=v;
 const src=v.v,rp=P(b,c),rt=a+rp+d,is=src/rt,vp=is*rp;
 return ({
 series:a+b+d,parallel:rp,parallel3:1/(1/a+1/b+1/c),mixed3:a+rp,
 branches:P(a+b,c+d),mixed4:rt,sourceCurrent:1000*is,parallelVoltage:vp,
 branchCurrent:1000*vp/c,loaded:src*P(bot,load)/(top+P(bot,load)),
 power:1000*is*is*a,kcl:Math.abs(measured-branch2-branch3),
 deviation:Math.abs(measured-1000*is),open:1000*src/(a+b+d),
 short:1000*src/(a+d),miswire:a+b+c+d,
 probe:src*P(bot,meter)/(top+P(bot,meter)),
 droop:1000*(droop/rt)*rp/c
 })[kind];
}
let numericCount=0, diagrams=0, rerolls=0, capstones=0;
for(const topic of t){
 const arr=q.filter(x=>x.topic===topic.id);
 assert.equal(arr.length,30,topic.id+" exactly 30 slots");
 const questions=new Set(),goals=new Set();
 arr.forEach((item,i)=>{
  assert.equal(item.difficulty,i+1,item.id+" progressive order");
  assert(item.steps.length>=3,item.id+" missing baby steps");
  const prompt=item.question.toLowerCase().replace(/\d+(?:\.\d+)?/g,"#").replace(/\s+/g," ").trim();
  assert(!questions.has(prompt),item.id+" repeated question with changed numbers");
  questions.add(prompt);
  const goal=item.auditSkill||item.learningObjective;
  assert(!goals.has(goal),item.id+" duplicated learning objective");
  goals.add(goal);
  if(item.network){
   for(const mode of ["schematic","concept","wiring"]){
    const figure=vis.render(item,topic,mode);
    assert(figure.includes('data-visual-question="'+item.id+'"'),item.id+" wrong visual id");
    assert(figure.includes("av-mixed-network-svg"),item.id+" generic diagram instead of connected topology");
    assert(figure.includes('data-network-type="'+item.network.kind+'"'),item.id+" topology mismatch");
    assert(figure.includes("<svg"),item.id+" no schematic");
    diagrams++;
   }
   assert.equal(ctx.window.avionicsNucleoWorkbench.setup(item,topic),null,item.id+" imaginary 12V STM32 GPIO wiring");
   assert(ctx.window.avionicsCircuitSimulator.render(item,topic).includes("not auto-imported"),item.id+" wrong automatic simulator");
  }
  if(item.roll){
   numericCount++;
   assert(item.expected!==undefined&&Number.isFinite(item.expected),item.id+" nonnumeric case");
   assert(close(item.expected,reference(item.roll.kind,item.network.values)),item.id+" independent circuit reference mismatch");
   assert.equal(score.gradeNumber(item,String(item.expected)).band,"likely-correct",item.id+" numeric answer rejected");
   for(let j=0;j<3;j++){
    const again=net.reroll(item);
    assert(again&&again.isCustomVariant&&again.network.kind===item.network.kind,item.id+" reroll changed topology");
    assert(close(again.expected,reference(again.roll.kind,again.network.values)),item.id+" rerolled answer incorrect");
    assert(again.question!==item.question,item.id+" reroll unchanged");
    rerolls++;
   }
  }
 });
 assert.equal(questions.size,30);assert.equal(goals.size,30);
 assert(arr[29].question.length>170,topic.id+" Q30 not an integrated challenge");
 if(topic.id==="series"||topic.id==="parallel"){
  assert.equal(arr.filter(x=>x.roll).length,17,topic.id+" needs 17 different circuit operations");
  assert.equal(arr[0].level,"Foundations");
  assert.equal(arr[10].level,"Calculation");assert.equal(arr[20].level,"Troubleshooting");
  assert(arr[29].question.includes("Ω"),topic.id+" missing mixed network");
  assert.equal(new Set(arr.filter(x=>x.roll).map(x=>x.roll.kind)).size,17);
 }else{
  capstones++;
  assert(arr[29].lesson&&arr[29].formula,topic.id+" technical capstone lacks worked explanation");
  assert(arr.slice(20).every(x=>x.expected===undefined&&x.lesson),topic.id+" advanced staged analysis missing");
 }
}
let compoundCaseCount=0;
for(const topic of t.filter(x=>x.id!=="series"&&x.id!=="parallel")){
 const steps=q.filter(x=>x.topic===topic.id);
 for(let j=0;j<5;j++){
  assert(!steps[20+j].question.includes("A second potentially related observation"),topic.id+" Q"+(21+j)+" should isolate one fault first");
 }
 for(let j=5;j<9;j++){
  const current=steps[20+j],first=topic.cases[j%5][0],second=topic.cases[(j+2)%5][0];
  assert.notEqual(first,second,topic.id+" paired case must be distinct");
  assert(current.question.includes(first)&&current.question.includes(second),current.id+" must combine TWO different fault observations");
  assert(current.question.includes("share a root cause"),current.id+" must demand causal distinction");
  assert(current.steps.length>=7&&current.lesson.summary.includes("second observation"),current.id+" missing independent second verification");
  compoundCaseCount++;
 }
}
assert.equal(compoundCaseCount,84,"21 topics should each have four compound late-diagnostic scenarios");
const ser=q.filter(x=>x.topic==="series"),par=q.filter(x=>x.topic==="parallel");
assert(ser[11].question.includes("SAME nodes"),"Q12 must teach parallel topology, not another pure series sum");
assert(ser[12].question.includes("IN SERIES"),"Q13 must introduce series+parallel");
assert(ser[14].question.includes("four-component"),"Q15 must combine four components");
assert(ser[22].question.includes("OPEN"),"Q23 must model branch open");
assert(ser[23].question.includes("SHORTED"),"Q24 must model short safely");
assert(ser[28].network.kind==="loadedDual","Q29 must show ADC and DMM simultaneously");
assert(ser[24].network.kind==="miswire","Miswire graph must display all four resistors");
assert(ser[29].question.includes("NO-GO"),"Q30 must demand release judgment");
assert(par[29].question.includes("A/B/A"),"Parallel Q30 must demand fixture/board isolation");
assert(!ctx.window.avionicsMixedCircuitCurriculum.reroll(ser[1]),"Dice restricted to numerical question cases");
const html=read("index.html"),cache=read("sw.js");
for(const file of ["avionics_integrative_capstones_v11.js","avionics_mixed_networks_v11.js","avionics_mixed_visuals_v11.js"]){
 assert(html.includes(file),file+" must load online");assert(cache.includes(file),file+" must be cached offline");
}
assert(cache.includes("v31-integrated-mixed-networks"));
assert(html.indexOf("avionics_mixed_networks_v11.js")<html.indexOf("avionics_tutor.js"),"new source must load before workbook");
assert(html.indexOf("avionics_mixed_visuals_v11.js")>html.indexOf("avionics_visuals.js"),"diagram wrapper should load after base");
assert(read("avionics_tutor.js").includes("MIXED.reroll(q)"),"dice must use live network values");
console.log("PASS v11: 690 unique ordered exercises; "+numericCount+" different mixed-network numeric slots, "+rerolls+" verified live rerolls, "+diagrams+" exact SVG renderings and "+capstones+" additional integrative topic capstones.");
