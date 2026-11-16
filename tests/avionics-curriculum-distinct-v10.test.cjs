"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const context={window:{},console,Math};vm.createContext(context);
for(const p of ["avionics_data.js","avionics_questions.js","avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js","avionics_distinct_reasoning_v10.js","avionics_visuals.js","avionics_assessor.js"]){
 vm.runInContext(read(p),context,{filename:p});
}
const t=context.window.AVIONICS_TOPICS,q=context.window.AVIONICS_QUESTIONS,A=context.window.avionicsAnswerCheck,V=context.window.avionicsVisuals;
const finite=x=>Number.isFinite(x),norm=x=>x.toLowerCase().replace(/\d+(?:\.\d+)?/g,"#").replace(/\s+/g," ").trim();
const near=(a,b)=>Math.abs(a-b)<=Math.max(1e-10,Math.abs(b)*0.00005);
assert.equal(t.length,23);assert.equal(q.length,690);
assert.equal(context.window.AVIONICS_DISTINCT_CURRICULUM_VERSION,10);
let concept=0,labs=0,numbers=0,diagnostics=0,uniqueAnswers=0;
for(const [ti,topic] of t.entries()){
 const questions=q.filter(x=>x.topic===topic.id);
 assert.equal(questions.length,30);
 const prompts=new Set(),objectives=new Set(),baseNames=new Set();
 questions.forEach((x,i)=>{
  assert.equal(x.difficulty,i+1,x.id+" must be in progressive order");
  assert(x.question&&x.steps.length>=3,x.id+" incomplete teaching");
  const p=norm(x.question),goal=x.auditSkill||x.numericOperation||x.learningObjective;
  assert(!prompts.has(p),x.id+" repeated question intent");
  assert(!objectives.has(goal),x.id+" duplicated skill objective: "+goal);
  prompts.add(p);objectives.add(goal);
  const types=["Foundations","Application","Calculation","Troubleshooting"];
  const level=i<5?types[0]:i<10?types[1]:i<20?types[2]:types[3];
  assert.equal(x.level,level,x.id+" wrong difficulty tier");
  if(level==="Foundations"){concept++;baseNames.add(topic.skills[i][0]);}
  if(level==="Application"){
   labs++;assert(x.lesson&&x.lesson.title===x.skillName,x.id+" lesson should match lab prompt");
   assert(!x.question.toLowerCase().includes("measure milli prefix"),x.id+" abstract SI prefix not measurable");
   assert(!baseNames.has(x.skillName),x.id+" reuses a previous definition");
   assert(x.steps[2].length>45&&x.steps[3].length>45,x.id+" missing expected result / safety");
   const rubric=A.rubric(x,topic);
   assert.equal(rubric.length,3,x.id+" missing case-specific rubric");
   assert(rubric[0].hint.includes("expected")||rubric[0].hint.includes("result")||rubric[0].hint.includes("evidence")||rubric[0].hint.length>45);
  }
  if(level==="Calculation"){
   numbers++;assert(x.lesson&&finite(x.expected)&&x.unit&&x.numericOperation,x.id+" incomplete numerical task");
   assert.equal(A.gradeNumber(x,String(x.expected)).band,"likely-correct",x.id+" expected answer mismatch");
   const wrong=A.gradeNumber(x,String(x.expected*2+1));
   assert.notEqual(wrong.band,"likely-correct",x.id+" incorrect answer accepted");
  }
  if(level==="Troubleshooting"){
   diagnostics++;assert(x.lesson&&x.lesson.title.length>20,x.id+" old reused concept lesson");
   assert(!x.formula&&!x.sub,x.id+" unrelated equation in diagnostic guidance");
  }
 });
 assert.equal(objectives.size,30,topic.id+" should have 30 distinct objectives");
 const C=questions.slice(10,20);
 const evalSub=(sub)=>{
  const parts=String(sub).split("=");
  assert(parts.length>=2,"sub equation must contain '=': "+sub);
  const expr=parts[parts.length-2].replace(/√\(/g,"Math.sqrt(").replace(/π/g,"Math.PI").replace(/log10\(/g,"Math.log10(").replace(/exp\(/g,"Math.exp(").replace(/\^/g,"**");
  return Function("return ("+expr+")")();
 };
 for(let i=0;i<10;i++){
  const computed=evalSub(C[i].sub);
  assert(near(computed,C[i].expected),C[i].id+" sub arithmetic mismatch: "+computed+" vs "+C[i].expected+" (sub="+C[i].sub+")");
  assert(Array.isArray(C[i].variantPool)&&C[i].variantPool.length>=1,C[i].id+" missing Practice New Numbers variantPool");
  for(const v of C[i].variantPool){
   if(v.sub){
    const vComputed=evalSub(v.sub);
    assert(near(vComputed,v.expected),C[i].id+" variantPool sub mismatch: "+vComputed+" vs "+v.expected);
   }
  }
 }
 const seen=new Set(C.map(x=>x.numericOperation));assert.equal(seen.size,10,topic.id+" numeric operations still repetitive");
 const summaries=new Set(questions.map(x=>x.lesson?x.lesson.summary:x.steps[0]));
 assert.equal(summaries.size,30,topic.id+" page-1 summaries must be mutually distinct across all 30 questions");
 const focuses=new Set(questions.map(x=>((V.render(x,topic,"schematic").match(/<div class="av-visual-focus">([\s\S]*?)<\/div>/)||[])[1]||"")));
 assert.equal(focuses.size,30,topic.id+" visual focus captions must differ cleanly across all 30 questions");
 for(let i=0;i<5;i++)assert(!questions[i].question.includes(questions[i+5].question),topic.id+" foundation/application repeated");
 const dNames=new Set(questions.slice(20,30).map(x=>x.question.split(":")[0]));
 assert.equal(dNames.size,10,topic.id+" troubleshooting D1-D10 personas must be distinct");
 uniqueAnswers+=seen.size;
}
for(const spTopic of ["series","parallel","kcl-kvl","thevenin","ohm","power"]){
 const spCount=q.filter(x=>x.topic===spTopic&&x.topology==="series-parallel").length;
 assert(spCount>=2,spTopic+" should include combined series-parallel questions, got "+spCount);
}
assert(q.filter(x=>x.topic==="series"&&x.topology==="series-parallel"&&x.level==="Calculation").length>=5,"series should include >= 5 combined series-parallel calculations");
const one=q.find(x=>x.id==="units-F2"),two=q.find(x=>x.id==="units-A2");
assert(one.question.includes("25 mA")&&one.question.includes("0.025 A"),"Units Q2 must teach multiplier and actual measured quantity");
assert(two.question.includes("10 Ω")&&two.question.includes("0.25 V"),"Units Q7 must describe a shunt measurement, not measuring a prefix");
assert(two.steps.some(x=>x.includes("0.025 A = 25 mA")),"Units Q7 solution must show real Ohm-law calculation");
assert(!two.lesson.title.toLowerCase().includes("milli prefix"));
assert(q.filter(x=>x.level==="Calculation"&&x.expected===0).length===0,"No zero-change comparison variants masquerading as new exercises");
const html=read("index.html"),sw=read("sw.js"),tutor=read("avionics_tutor.js");
for(const file of ["avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js","avionics_distinct_reasoning_v10.js"]){
 assert(html.includes(file),file+" missing from site");
 assert(sw.includes(file),file+" missing from offline cache");
}
assert(tutor.includes("if(q.lesson)")&&tutor.includes("priorProgressV"),"New lessons and legacy progress archival should be functional");
console.log("PASS: "+concept+" unique foundations, "+labs+" authored lab tests, "+numbers+" varied numeric operations, "+diagnostics+" progressive diagnostic exercises; 690 distinct prompts and objectives.");
