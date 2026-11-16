"use strict";
/* Original text, arithmetic and lesson-source integrity audit, all topics. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const saved=new Map(),storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
const c={window:{},Math,console,document:{},localStorage:storage};
vm.createContext(c);
for(const file of ["avionics_data.js","avionics_questions.js","avionics_beginner_lessons.js","avionics_si_lesson.js","avionics_textbook_toc.js","simulation/math_format.js","avionics_visuals.js","avionics_assessor.js","avionics_tutor.js"])vm.runInContext(read(file),c,{filename:file});
const t=c.window.AVIONICS_TOPICS,q=c.window.AVIONICS_QUESTIONS,si=c.window.AVIONICS_SI_LESSON;
assert.equal(t.length,23);assert.equal(q.length,690);
assert.equal(Object.keys(c.window.AVIONICS_BEGINNER_LESSONS).length,23);
const ids=new Set(q.map(x=>x.id));assert.equal(ids.size,690);
assert(si&&si.base.length===7&&si.historical.length===2);
assert.deepEqual(Array.from(si.base.map(x=>x[2])),["m","kg","s","A","K","cd","mol"]);
assert(si.derived.some(x=>x[1]==="volt"&&x[2]==="V"));
assert(!si.base.some(x=>x[1]==="volt"));
assert(si.formulaMathml.includes("<math")&&si.formulaMathml.includes('mathvariant="normal"'));
assert(si.symbolMathml.includes("<mi>I</mi>")&&si.symbolMathml.includes('mathvariant="normal"'));
assert(si.note.includes("1995"));
assert(c.window.avionicsAnswerCheck);
const family=c.window.AVIONICS_CALC_FAMILIES;const math=c.window.studyMath;
let arith=0,structures=0,sourced=0;
function expressionValue(sub){
 const fields=String(sub).split("=").map(x=>x.trim());
 const raw=fields.length>=3?fields[fields.length-2]:fields[fields.length-1];
 let expr=raw.replace(/√\s*\(/g,"Math.sqrt(").replace(/π/g,"Math.PI").replace(/\blog10\s*\(/g,"Math.log10(").replace(/\bexp\s*\(/g,"Math.exp(").replace(/\^/g,"**");
 if(!/^(?:Math\.(?:sqrt|log10|exp|PI)|[0-9+\-*/().\s])+$/i.test(expr))throw Error("Unsafe/unreadable numeric substitution: "+sub);
 const evaluated=vm.runInNewContext(expr,{Math},{timeout:1000});
 assert(Number.isFinite(evaluated),"Non-finite expression "+sub);
 return evaluated;
}
for(const topic of t){
 assert.equal(topic.skills.length,5,topic.id+" skill count");
 assert.equal(topic.cases.length,5,topic.id+" case count");
 assert.equal(topic.calc.length,2,topic.id+" calc families");
 for(const s of topic.skills)assert(s.length===4&&s[0].length>=2&&s.slice(1).every(v=>v&&v.length>=5),topic.id+" incomplete definition");
 for(const s of topic.cases)assert(s.length===4&&s.every(v=>v&&v.length>=7),topic.id+" incomplete case");
 const own=q.filter(x=>x.topic===topic.id);assert.equal(own.length,30,topic.id);
 for(let i=0;i<5;i++){
  const [term,def,why,example]=topic.skills[i];
  for(const letter of ["F","A"]){
    const question=own.find(x=>x.id===topic.id+"-"+letter+(i+1));
    assert(question&&question.question.includes(term),topic.id+" "+term+" prompt mismatch");
    assert(question.steps.some(v=>v.includes(def)),question.id+" missing source definition");
    assert(question.steps.some(v=>v.includes(why)),question.id+" missing purpose");
    assert(question.steps.some(v=>v.includes(example)),question.id+" missing use-case");
    sourced++;
  }
  const row=topic.cases[i];
  for(const id of [topic.id+"-D"+(i*2+1),topic.id+"-D"+(i*2+2)]){
   const question=own.find(x=>x.id===id);
   assert(question&&question.question.includes(row[0]),id+" wrong scenario");
   assert(question.steps.some(v=>v.includes(row[1])),id+" missing diagnostic");
   assert(question.steps.some(v=>v.includes(row[3])),id+" missing verification");
   sourced++;
  }
 }
 for(let i=0;i<topic.calc.length;i++)for(let j=0;j<5;j++){
  const numeric=family[topic.calc[i]](j);
  const qq=own.find(x=>x.id===topic.id+"-C"+(i*5+j+1));
  assert(qq&&numeric.prompt===qq.question,topic.id+" calculation prompt");
  assert.equal(qq.unit,numeric.unit,qq.id+" unit");
  assert.equal(qq.expected,numeric.answer,qq.id+" stored answer");
  assert(math(qq.formula,true).includes("<math"),qq.id+" formula MathML");
  assert(math(qq.sub,true).includes("<math"),qq.id+" substitution MathML");
  const independent=expressionValue(qq.sub);
  assert(Math.abs(independent-qq.expected)<=Math.max(Math.abs(qq.expected)*0.003,0.00005),qq.id+" arithmetic mismatch: "+independent+" vs "+qq.expected);
  arith++;
 }
 for(const question of own){
  const steps=c.window.avionicsWorkbookV2.stepsForQuestion(question.id);
  assert(steps&&steps.length>=6,question.id+" guided steps");
  assert(c.window.avionicsVisuals.render(question,topic,"schematic").includes("<svg"),question.id+" diagram");
  assert(c.window.avionicsVisuals.render(question,topic,"wiring").includes("<svg"),question.id+" wiring");
  structures++;
 }
}
const unit=t.find(x=>x.id==="units"),siSkill=unit.skills[0][1];
assert(siSkill.includes("seven fundamental")&&siSkill.includes("volt is a derived unit"));
assert(unit.skills[1][1].includes("whether that unit is base or derived"));
const rf=t.find(x=>x.id==="rf");
assert(rf.skills[2][1].includes("complex input reflection")&&rf.skills[2][1].includes("minus twenty"));
const sample=q.find(x=>x.id==="units-F1");
assert.equal(c.window.avionicsAnswerCheck.gradeText(sample,unit,"An SI base unit is one of seven fundamental units. Ampere measures electrical current, while volt is a derived unit.").band,"likely-correct");
assert.equal(c.window.avionicsAnswerCheck.gradeText(sample,unit,"Ampere measures current.").band,"partial");
assert.equal(c.window.avionicsAnswerCheck.gradeText(sample,unit,"The volt is an SI base unit.").band,"needs-correction");
const testHtml=read("index.html"),sw=read("sw.js");
assert(testHtml.includes("avionics_si_lesson.js?v=2")&&testHtml.includes("avionics_si.css?v=2"));
assert(sw.includes("v29-nucleo-progressive-videos"));
assert(c.window.AVIONICS_TEXTBOOK_TOC.chapters.length===21);
assert(c.window.AVIONICS_SI_LESSON.baseFormulaMathml.includes("<mfrac>"));
assert(c.window.avionicsWorkbookV2.stepsForQuestion("units-F1").every(x=>!x.formula||x.formula!=="V = I * R"));
assert(c.window.avionicsWorkbookV2.stepsForQuestion("qualification-F1").every(x=>!x.formula||x.formula!=="V = I * R"));
assert(c.window.avionicsVisuals.render(sample,unit,"schematic").includes("SEVEN SI BASE UNITS"));
console.log("PASS: "+t.length+" topics, "+structures+" question lessons, "+sourced+" source-derived conceptual/troubleshooting answers, "+arith+" independently recomputed numerical substitutions, SI MathML, modern-vs-textbook angle note");
