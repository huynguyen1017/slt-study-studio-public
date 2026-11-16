"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const context={window:{},Math,console};vm.createContext(context);
for(const file of ["avionics_data.js","avionics_questions.js","avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js","avionics_dice_methods_v12.js","avionics_distinct_reasoning_v10.js","avionics_integrative_capstones_v11.js","avionics_mixed_networks_v11.js"]){
 vm.runInContext(read(file),context,{filename:file});
}
const original=context.window.AVIONICS_QUESTIONS.map(x=>({id:x.id,question:x.question,expected:x.expected}));
assert.equal(original.length,690,"The prior verified 690 original IDs must remain unchanged");
vm.runInContext(read("avionics_advanced_50_v12.js"),context,{filename:"avionics_advanced_50_v12.js"});
const Q=context.window.AVIONICS_QUESTIONS,T=context.window.AVIONICS_TOPICS,info=context.window.AVIONICS_ADVANCED_50;
assert.equal(Q.length,1150);assert.equal(info.added,460);assert.equal(context.window.AVIONICS_EXPECTED_PER_TOPIC,50);
assert.equal(new Set(Q.map(x=>x.id)).size,1150,"No repeated IDs");
assert.deepEqual(Q.slice(0,690).map(x=>x.id),original.map(x=>x.id),"All original ID positions are stable");
for(let j=0;j<690;j++){
 assert.equal(Q[j].question,original[j].question,"Original prompt changed: "+Q[j].id);
 assert.equal(Q[j].expected,original[j].expected,"Original arithmetic changed: "+Q[j].id);
}
function calculate(sub){
 const parts=sub.split("=");assert(parts.length>=3,"Expected explicit substituted expression: "+sub);
 const expression=parts[parts.length-2].trim()
  .replace(/\bsqrt\(/g,"Math.sqrt(").replace(/\bpi\b/g,"Math.PI")
  .replace(/\blog10\(/g,"Math.log10(").replace(/\^/g,"**");
 return Function("return ("+expression+")")();
}
let math=0,words=0,checks=0;
for(const topic of T){
 const qs=Q.filter(x=>x.topic===topic.id),old=qs.slice(0,30),fresh=qs.slice(30);
 assert.equal(qs.length,50,topic.id+" expected 50");
 for(let i=0;i<30;i++)assert.equal(old[i].difficulty,i+1,topic.id+" original ordering");
 assert.equal(fresh.length,20);
 const goals=new Set(),prompts=new Set();
 for(let i=0;i<20;i++){
  const q=fresh[i],n=i+31;
  assert.equal(q.id,topic.id+"-X"+(i+1));
  assert.equal(q.difficulty,n);
  assert.equal(q.advancedStage,n);
  assert.equal(q.level,"Troubleshooting");
  assert.equal(q.steps.length,8,q.id+" needs all 8 baby steps");
  assert(q.question.length>180,q.id+" has insufficient real-world context");
  assert(q.lesson&&q.lesson.title&&q.lesson.summary.length>100,q.id+" missing complete answer");
  assert(q.lesson.example.length>55&&q.lesson.vocab.length>=3,q.id+" missing worked demonstration / terms");
  for(const [j,s] of q.steps.entries())assert(s.length>75,q.id+" Step "+(j+1)+" too short");
  assert(!prompts.has(q.question),"Repeated question "+q.id);prompts.add(q.question);
  assert(!goals.has(q.learningObjective),"Repeated learning goal "+q.id);goals.add(q.learningObjective);
  assert(q.sourceType.includes("hypothetical")||q.sourceType.includes("education"),q.id+" must not claim historical experience");
  if(i===6||i===13){
   math++;
   assert(Number.isFinite(q.expected),q.id+" must include numerical answer");
   assert(q.formula&&q.sub&&q.unit,q.id+" missing formula/unit");
   const actual=calculate(q.sub);
   assert(Number.isFinite(actual),q.id+" expression returned non-finite");
   assert(Math.abs(actual-q.expected)<=Math.max(1e-6,Math.abs(q.expected)*1e-6),q.id+" arithmetic mismatch "+actual+" vs "+q.expected);
   checks++;
  }else{assert.equal(q.expected,undefined,q.id+" should be a qualitative diagnosis");words++;}
 }
 assert(fresh[19].question.includes("GO/NO-GO"),topic.id+" Q50 must require release rationale");
 assert(fresh[19].question.includes("third symptom"),topic.id+" Q50 must integrate >2 signals");
 assert.equal(goals.size,20);
}
assert.equal(math,46);assert.equal(words,414);assert.equal(checks,46);
const h=read("index.html"),sw=read("sw.js"),tutor=read("avionics_tutor.js"),practice=read("avionics_practice.js");
assert(h.includes("avionics_advanced_50_v12.js?v=1"),"Missing script from page");
assert(sw.includes('"./avionics_advanced_50_v12.js"'),"Missing expanded questions from offline list");
assert(sw.includes("slt-study-studio-v33-fifty-guided-topics-r1"));
assert(h.indexOf("avionics_mixed_networks_v11.js")<h.indexOf("avionics_advanced_50_v12.js"));
assert(h.indexOf("avionics_advanced_50_v12.js")<h.indexOf("avionics_tutor.js"));
assert(tutor.includes("QUESTIONS.length!==TOPICS.length*TOPIC_TOTAL"),"Old 690 guard blocks the site");
assert(tutor.includes("if(q.advancedStage>=31)"),"Must not collapse advanced walkthrough to generic six steps");
assert(tutor.includes("1–50"),"Page navigation must show 50 questions");
assert(practice.includes("AVIONICS_EXPECTED_PER_TOPIC||30"),"Secondary mode must accept 50");
console.log("PASS 50-question expansion: 23 x 50 = 1150 stable IDs, 460 distinct advanced questions, 3680 authored step explanations, 46 independently recalculated numerical results, all 23 Q50 integration scenarios.");
