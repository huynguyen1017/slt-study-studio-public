"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const base=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(base,p),"utf8");
const ctx={window:{},Math,document:{querySelector:()=>null},console};
vm.createContext(ctx);
for(const file of ["avionics_data.js","avionics_questions.js","avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js","avionics_distinct_reasoning_v10.js","avionics_assessor.js"]){
 vm.runInContext(read(file),ctx,{filename:file});
}
const topics=ctx.window.AVIONICS_TOPICS,questions=ctx.window.AVIONICS_QUESTIONS,A=ctx.window.avionicsAnswerCheck;
assert.equal(questions.length,690);
assert.equal(topics.length,23);
assert(A&&typeof A.gradeText==="function"&&typeof A.gradeNumber==="function");
for(const q of questions){
 const t=topics.find(x=>x.id===q.topic);assert(t);
 if(q.expected===undefined){
   const rubric=A.rubric(q,t);
   assert.equal(rubric.length,3,q.id+" rubric length");
   for(const c of rubric){assert(c.label&&c.hint&&c.sets.length,q.id);}
 }else{
   const correct=A.gradeNumber(q,String(q.expected));
   assert.equal(correct.band,"likely-correct",q.id+" exact numeric");
   const wrong=A.gradeNumber(q,String(q.expected*1000));
   assert.notEqual(wrong.band,"likely-correct",q.id+" numerical magnitude");
 }
}
const si=questions.find(q=>q.id==="units-F1"),siTopic=topics.find(t=>t.id==="units");
assert(si&&siTopic);
const good=A.gradeText(si,siTopic,"Of the seven fundamental SI base units, the ampere is the unit of electric current. The volt is a derived unit measuring potential difference. Correct units on a meter prevent conversion errors.");
assert.equal(good.band,"likely-correct",JSON.stringify(good));
const partial=A.gradeText(si,siTopic,"Ampere measures current.");
assert.equal(partial.band,"partial",JSON.stringify(partial));
assert(partial.missing.length>0);
const bad=A.gradeText(si,siTopic,"The volt is an SI base unit and voltage is the flow of charge.");
assert.equal(bad.band,"needs-correction",JSON.stringify(bad));
assert(bad.corrections.length>0);
assert.equal(A.gradeText(si,siTopic,"").band,"insufficient");
const volt=questions.find(q=>q.id==="ohm-F1"),voltT=topics.find(t=>t.id==="ohm");
assert.equal(A.gradeText(volt,voltT,"Voltage is a difference in electric potential between two points. A DMM measures it with the red probe on the supply rail and black probe at ground.").band,"likely-correct");
assert.equal(A.gradeText(volt,voltT,"Voltage is current flowing through a wire.").band,"needs-correction");
const numeric=questions.find(q=>q.id==="ohm-C1");
assert.equal(A.gradeNumber(numeric,"0.01 A").band,"likely-correct","SI unit conversion A -> mA");
assert.equal(A.gradeNumber(numeric,"10").band,"likely-correct");
assert.equal(A.gradeNumber(numeric,"9.6").band,"partial");
assert.equal(A.gradeNumber(numeric,"10 bananas").band,"needs-correction");
assert.equal(A.gradeNumber(numeric,"not a number").band,"insufficient");
const site=read("index.html"),sw=read("sw.js"),ui=read("avionics_tutor.js");
assert(site.includes("avionics_assessor.js?v=7")&&site.includes("avionics_feedback.css?v=4"));
assert(sw.includes("avionics_assessor.js")&&sw.includes("v33-fifty-guided-topics"));
assert(ui.includes("av-question-gallery")&&ui.includes("data-qid="));
assert(ui.includes("ASSESS.gradeText")&&ui.includes("inlineStepVisual(q,t,stepIndex)"));
console.log("PASS: 690 questions with rubrics or numerics; SI grading good/partial/wrong; units; question gallery and step visuals");
