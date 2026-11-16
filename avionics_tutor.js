"use strict";
/* Beginner-first workbook UI for the existing 690-question bank.
   Preserves 'slt-avionics-ee-practice-v1' mastery data. */
(function(){
const TOPICS=window.AVIONICS_TOPICS||[];
const QUESTIONS=window.AVIONICS_QUESTIONS||[];
const LESSONS=window.AVIONICS_BEGINNER_LESSONS||{};
const DEEP=window.AVIONICS_CONCEPT_DEEP_DIVE||{};
const VIS=window.avionicsVisuals;
const ASSESS=window.avionicsAnswerCheck;
const STORE="slt-avionics-ee-practice-v1";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const find=(s,r=document)=>r.querySelector(s);
const fmt=x=>Math.abs(x)>0&&Math.abs(x)<0.0001?Number(x).toExponential(3):Number(x.toPrecision(5)).toString();
const eq=x=>window.studyMath?window.studyMath(x,true):'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mtext>'+esc(x)+'</mtext></math>';
let remembered={};try{remembered=JSON.parse(localStorage.getItem(STORE)||"{}")||{}}catch{}
const state={ratings:{},attempts:{},assessments:{},responses:{},...remembered};
if(!state.ratings||typeof state.ratings!=="object")state.ratings={};
if(!state.attempts||typeof state.attempts!=="object")state.attempts={};
if(!state.assessments||typeof state.assessments!=="object")state.assessments={};
if(!state.responses||typeof state.responses!=="object")state.responses={};
let host=null,topic=TOPICS.some(t=>t.id===state.lastTopic)?state.lastTopic:"ohm";
let currentIndex=Number.isInteger(state.lastIndex)?state.lastIndex:0;
let filter="All",query="",page="learn",stepIndex=0,expanded=false,feedback="",draftText="",currentAnswer="",answerDirty=false;
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(state))}catch{}};
const topicOf=()=>TOPICS.find(t=>t.id===topic)||TOPICS[0];
const qset=()=>QUESTIONS.filter(x=>x.topic===topic&&(filter==="All"||x.level===filter)&&(!query||(x.question+" "+x.steps.join(" ")).toLowerCase().includes(query)));
const selected=()=>{const a=qset();currentIndex=Math.max(0,Math.min(a.length-1,currentIndex));return a[currentIndex]};
const cnt=id=>QUESTIONS.filter(x=>x.topic===id&&state.ratings[x.id]==="know").length;
const allTopicQuestions=()=>QUESTIONS.filter(x=>x.topic===topic);
function matchingSkill(q,t){
 if(!q||!t)return 0;
 const m=q.id.match(/-([FADC])(\d+)$/);
 if(!m)return 0;
 const n=Number(m[2])-1;
 if(m[1]==="F"||m[1]==="A")return n;
 if(m[1]==="D")return Math.floor(n/2);
 if(t.id==="ohm")return 3;
 if(m[1]==="C")return Math.min(4,1+Math.floor(n/5));
 return 0;
}
function focus(q,t){
 const s=t.skills[matchingSkill(q,t)]||t.skills[0];
 return {label:s[0],definition:s[1],why:s[2],test:s[3],deep:DEEP[s[0]]||null};
}
function iconLine(k,text){return '<div class="av-mini"><strong>'+esc(k)+'</strong><span>'+esc(text)+'</span></div>'}
function equation(source,label){return '<div class="av-math"><div class="av-math-label">'+esc(label)+'</div>'+eq(source)+'</div>'}
function diagram(t,s){
 if(t.id==="ohm"){
  return '<figure class="av-diagram" aria-label="Circuit showing a 5 volt source, a resistor and a multimeter comparing the supply node with ground">'+
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 252" role="img" aria-label="5 volt source and meter probes">'+
  '<rect width="650" height="252" rx="14" fill="#f8fbff"/>'+
  '<path d="M75 112 V48 H350 V112 M75 170 V207 H350 V170" fill="none" stroke="#173b55" stroke-width="4" stroke-linecap="round"/>'+
  '<path d="M61 112 H89 M65 123 H85 M75 123 V139 M61 139 H89 M65 150 H85 M75 150 V170" stroke="#173b55" stroke-width="3" fill="none"/>'+
  '<text x="19" y="123" font-size="14" fill="#21547e">+5 V</text><text x="20" y="162" font-size="13" fill="#486477">0 V</text>'+
  '<path d="M350 112 V120 H365 V159 H335 V120 H350 V112" fill="none" stroke="#173b55" stroke-width="3"/>'+
  '<rect x="321" y="111" width="58" height="66" rx="5" fill="#fff6dd" stroke="#b58b32" stroke-width="3"/>'+
  '<text x="350" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#734f19">1 kΩ</text><text x="350" y="155" text-anchor="middle" font-size="10" fill="#734f19">Load</text>'+
  '<circle cx="350" cy="48" r="7" fill="#c83e3e"/><circle cx="350" cy="207" r="7" fill="#2a455a"/>'+
  '<path d="M350 48 H470 V98" fill="none" stroke="#d84942" stroke-width="2.8"/>'+
  '<path d="M350 207 H505 V176" fill="none" stroke="#405061" stroke-width="2.8"/>'+
  '<rect x="450" y="98" width="105" height="78" rx="10" fill="white" stroke="#2a5571" stroke-width="2.6"/>'+
  '<text x="502" y="124" text-anchor="middle" font-size="12" font-weight="700" fill="#22455b">DMM</text>'+
  '<rect x="470" y="133" width="66" height="29" rx="4" fill="#e4f1ea" stroke="#7aaf93"/>'+
  '<text x="503" y="152" text-anchor="middle" font-size="15" font-weight="700" fill="#165b47">+5.0 V</text>'+
  '<text x="361" y="29" font-size="12" fill="#ba3333" font-weight="700">Red probe</text>'+
  '<text x="356" y="231" font-size="12" fill="#405061" font-weight="700">Black probe / reference</text>'+
  '<text x="93" y="35" font-size="12" fill="#173b55" font-weight="600">Supply node (+5 V)</text>'+
  '<path d="M75 207 V221 M60 221 H90 M65 229 H85 M70 237 H80" stroke="#173b55" stroke-width="2.4" fill="none"/>'+
  '<text x="103" y="233" font-size="12" fill="#486477">Ground = 0 V</text>'+
  '</svg><figcaption>Conceptual example: voltage is measured BETWEEN the red and black points. For this ideal 5 V source, the 1 kΩ load carries 5 mA.</figcaption></figure>';
 }
 if(t.id==="units")return '<div class="av-unit-ladder"><div><strong>1 A</strong><small>ampere</small></div><span>× 1000 →</span><div><strong>1000 mA</strong><small>milliamperes</small></div><span>× 1000 →</span><div><strong>1,000,000 µA</strong><small>microamperes</small></div></div>';
 return '<div class="av-system-figure" role="img" aria-label="Conceptual engineering test signal path">'+
 '<div><span>01</span><strong>Stimulus</strong><small>Power or signal applied</small></div>'+
 '<b aria-hidden="true">→</b><div><span>02</span><strong>Device under test</strong><small>Board / circuit behavior</small></div>'+
 '<b aria-hidden="true">→</b><div><span>03</span><strong>Measurement</strong><small>Instrument + reference</small></div>'+
 '<b aria-hidden="true">→</b><div><span>04</span><strong>Decision</strong><small>Compare to requirement</small></div></div>';
}
function knownValues(text){
 const pairs=String(text).match(/(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?\s*(?:µF|µH|µs|MHz|GHz|mH|mA|mV|mΩ|kΩ|Ω|V|A|W|Hz|ms|ns|µJ|J|s|kW|dB|bytes|seconds|turns|%))/gi)||[];
 return [...new Set(pairs)].slice(0,8);
}
function stepsFor(q,t,f){
 const st=q.steps||[];
 const beginner=f.deep;
 const out=[];
 if(q.level==="Foundations"||q.level==="Application"){
   out.push({title:"Translate the question into everyday language",body:"We are learning what "+f.label+" means, not asking you to memorize complicated vocabulary yet. "+(beginner?beginner.plain:f.definition),kind:"text"});
   out.push({title:"Learn the key words",body:beginner?beginner.why:LESSONS[t.id].lead,kind:"text"});
   out.push({title:"Use a picture or everyday comparison",body:beginner?beginner.analogy:LESSONS[t.id].analogy,kind:"text"});
   out.push({title:"Connect the idea to one concrete example",body:beginner?beginner.example:LESSONS[t.id].example,kind:"text"});
   out.push({title:"Explain the engineering reason",body:f.why+" "+f.test,kind:"text"});
   out.push({title:"Answer the original question",body:beginner?beginner.recap:(st[0]||f.definition)+" "+(st[2]||f.test),kind:"answer"});
 }else if(q.level==="Calculation"){
   out.push({title:"Read the question slowly",body:"You are asked to find a numerical answer in "+q.unit+". Underline the quantity being requested. Do not start calculating yet.",kind:"text"});
   const vals=knownValues(q.question);
   out.push({title:"Write down the GIVEN measurements",body:vals.length?"Given values: "+vals.join(" · ")+". Keep the units beside the numbers.":q.question,kind:"given"});
   out.push({title:"Choose the equation",body:st[0]||"Use the correct physical relationship between the quantities.",kind:"formula",formula:q.formula});
   out.push({title:"Substitute the numbers",body:st[1]||"Insert the known values; convert units consistently first.",kind:"formula",formula:q.sub});
   out.push({title:"Finish the arithmetic",body:"Calculate carefully. Enter only the numerical value in the requested unit when checking your answer.",kind:"answer",answer:fmt(q.expected)+" "+q.unit});
   out.push({title:"Check whether your answer makes sense",body:st[2]||"Estimate the scale and check whether the result is physically reasonable.",kind:"text"});
 }else{
   out.push({title:"Describe the symptom in simple words",body:"Do not decide that a board is defective before checking the observation. "+q.question,kind:"text"});
   out.push({title:"Check safety before touching the circuit",body:"If a fault could create excessive current or unsafe voltage, stop or current-limit the source. Do not change live wiring without an approved procedure.",kind:"text"});
   out.push({title:"Identify the first controlled check",body:st[1]||st[0]||"Check the test setup and one likely cause.",kind:"text"});
   out.push({title:"Understand WHY that check helps",body:st[2]||f.why,kind:"text"});
   out.push({title:"Collect evidence to confirm the cause",body:st[3]||f.test,kind:"text"});
   out.push({title:"State the diagnosis without guessing",body:"Explain the observation, test you performed, and conclusion. If the test is not decisive, report the result as unconfirmed rather than calling it a pass.",kind:"answer"});
 }
 return out;
}
function lessonPage(q,t,f){
 const item=f.deep,guide=LESSONS[t.id]||{lead:t.goal,analogy:"",example:"",terms:[]};
 const glossary=item?item.words:guide.terms;
 const summary=item?item.plain:f.definition;
 const illustration=VIS?VIS.render(q,t,"schematic"):diagram(t,f);
 const equationBox=item&&item.formula?equation(item.formula,"PHYSICAL RELATIONSHIP · ENGINEERING NOTATION"):"";
 return '<section class="av-page" aria-label="Understand the concept">'+
 '<div class="av-eyebrow">PAGE 1 / 4 · LEARN THE IDEA</div>'+
 '<h3>Start here: '+esc(f.label)+'</h3>'+
 '<div class="av-lede"><strong>In very simple words</strong><p>'+esc(summary)+'</p></div>'+
 '<div class="av-two-up"><section><h4>Words you need first</h4><table class="av-vocab"><thead><tr><th>Word</th><th>Meaning</th></tr></thead><tbody>'+
 glossary.map(p=>'<tr><th scope="row">'+esc(p[0])+'</th><td>'+esc(p[1])+'</td></tr>').join("")+
 '</tbody></table></section><section class="av-analogy"><h4>Picture it in everyday life</h4><p>'+esc(item?item.analogy:guide.analogy)+'</p><h4>Why an engineer cares</h4><p>'+esc(item?item.why:f.why)+'</p></section></div>'+
 '<h4 class="av-figure-heading">Your question’s circuit illustration</h4>'+illustration+
 '<div class="av-actions-bottom"><button id="avGoVisual" class="av-primary">See full circuit, graph and wiring →</button></div>'+
 equationBox+
 '<div class="av-worked-mini"><strong>One real-life example</strong><p>'+esc(item?item.example:guide.example)+'</p></div>'+
 '<div class="av-takeaway"><strong>Remember this:</strong> '+esc(item?item.recap:guide.lead)+'</div>'+
 '<div class="av-actions-bottom"><button id="avGoWork" class="av-primary">Now solve this question together →</button></div>'+
 '</section>';
}

function visualPage(q,t,f){
 const info=VIS?VIS.describe(q,t):null;
 const pics=[["schematic","01 · Circuit schematic","Follow the current path. Find the source, components, unknown quantity and measured values."],["concept","02 · Graph / signal behavior","Compare voltage, current, timing or frequency. All curves are explicitly illustrative."],["wiring","03 · "+(info?info.wiring:"Connection diagram"),"Learn which points connect and where the source, return and instrument belong. Never assume an unspecified pin number."]];
 return '<section class="av-page av-visual-page" aria-label="Question-specific visual laboratory">'+
 '<div class="av-eyebrow">PAGE 2 / 4 · SEE THE CIRCUIT IN DETAIL</div>'+
 '<h3>Draw it first. Then solve it.</h3>'+
 '<p class="av-explain">These figures are generated from <strong>this exact question</strong>. The schematic uses known values when they are supplied; any missing values are shown symbolically. Breadboards use conceptual low-voltage layouts; instrument and development-board wiring diagrams use generic signal names, not manufacturer pin numbers.</p>'+
 '<div class="av-question"><span>QUESTION '+esc(q.id)+'</span><p>'+esc(q.question)+'</p></div>'+
 '<div class="av-visual-nav">'+pics.map(x=>'<a href="#avVisual-'+x[0]+'">'+esc(x[1])+'</a>').join("")+'</div>'+
 pics.map(x=>'<section class="av-visual-panel" id="avVisual-'+x[0]+'"><div class="av-visual-panel-head"><div><h4>'+esc(x[1])+'</h4><p>'+esc(x[2])+'</p></div><button class="av-light" data-zoom="'+x[0]+'" aria-label="Enlarge '+esc(x[1])+'">↗ Enlarge</button></div>'+
 (VIS?VIS.render(q,t,x[0]):'<p>Visuals are unavailable.</p>')+'</section>').join("")+
 '<div class="av-takeaway"><strong>Before continuing:</strong> Trace the positive-to-return path with your finger, identify the relevant nodes and explain which signal the instrument measures.</div>'+
 '<div class="av-actions-bottom"><button id="avVisualBack" class="av-light">← Review the idea</button><button id="avVisualForward" class="av-primary">Now solve it in baby steps →</button></div></section>';
}

function solvePage(q,t,f){
 const steps=stepsFor(q,t,f),step=steps[stepIndex]||steps[0];
 return '<section class="av-page" aria-label="Guided worked answer">'+
 '<div class="av-eyebrow">PAGE 3 / 4 · WORK IT OUT WITH ME</div>'+
 '<h3>Answer in tiny steps — not all at once</h3>'+
 '<p class="av-explain">Only one step is shown at a time. Read it, think about it, then press <strong>Next baby step</strong>. There is no timer.</p>'+
 '<div class="av-question"><span>YOUR QUESTION</span><p>'+esc(q.question)+'</p></div>'+
 inlineStepVisual(q,t,stepIndex)+
 '<div class="av-step-counter"><strong>Step '+(stepIndex+1)+' of '+steps.length+'</strong><span>'+esc(step.title)+'</span></div>'+
 '<div class="av-steps-rail">'+steps.map((s,i)=>'<span class="'+(i===stepIndex?"here":i<stepIndex?"passed":"")+'" title="'+esc(s.title)+'"></span>').join("")+'</div>'+
 '<article class="av-baby-step"><span class="av-step-icon">'+(stepIndex+1)+'</span>'+
 '<div><h4>'+esc(step.title)+'</h4><p>'+esc(step.body)+'</p>'+
 (step.kind==="given"?'<div class="av-given"><strong>Problem statement:</strong> '+esc(q.question)+'</div>':"")+
 (step.formula?equation(step.formula,stepIndex===2?"FORMULA":"NUMBER SUBSTITUTION"):"")+
 (step.answer?'<div class="av-final-value">'+esc(step.answer)+'</div>':"")+
 '</div></article>'+
 '<div class="av-control-row"><button id="avStepBack" class="av-light" '+(stepIndex===0?"disabled":"")+'>← Previous step</button>'+
 (stepIndex<steps.length-1?'<button id="avStepNext" class="av-primary">Next baby step →</button>':'<button id="avGoTry" class="av-primary">I have read the steps — practice →</button>')+'</div>'+
 '<details class="av-all-steps"><summary>Show the entire solution (optional)</summary><div class="av-all-list">'+
 steps.map((s,i)=>'<div><b>'+(i+1)+'. '+esc(s.title)+'</b><p>'+esc(s.body)+'</p>'+(s.formula?equation(s.formula,"EQUATION"):"")+(s.answer?'<div class="av-final-value">'+esc(s.answer)+'</div>':"")+'</div>').join("")+
 '</div></details>'+
 '<div class="av-takeaway"><strong>How to speak in an interview:</strong> First define the idea, explain the check you would perform, then say what evidence would make you confident.</div>'+
 '</section>';
}

function gradeView(assessment){
 if(!assessment)return "";
 const status=assessment.band==="likely-correct"?"good":assessment.band==="partial"?"partial":"review";
 const score=Number.isFinite(assessment.score)?'<span class="av-score">'+assessment.score+" / "+assessment.max+" key ideas</span>":"";
 return '<section class="av-assessment av-assessment-'+status+'" aria-label="Your answer feedback">'+
 '<div class="av-assessment-heading"><strong>'+esc(assessment.title||"Answer feedback")+'</strong>'+score+'</div>'+
 (assessment.note?'<p>'+esc(assessment.note)+'</p>':"")+
 ((assessment.met||[]).length?'<div class="av-assess-list"><strong>Ideas recognized</strong><ul>'+assessment.met.map(x=>'<li>'+esc(x.label)+'</li>').join("")+'</ul></div>':"")+
 ((assessment.missing||[]).length?'<div class="av-assess-list"><strong>How to improve your answer</strong><ul>'+assessment.missing.map(x=>'<li><b>'+esc(x.label)+':</b> '+esc(x.hint)+'</li>').join("")+'</ul></div>':"")+
 ((assessment.corrections||[]).length?'<div class="av-assess-list"><strong>Specific correction</strong><ul>'+assessment.corrections.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></div>':"")+
 '<p class="av-assess-warning">Automated rubric feedback is approximate, especially for original explanations and alternative wording. Review the reference answer and retry. It is not a human or AI semantic evaluation.</p></section>';
}
function inlineStepVisual(q,t,step){
 if(!VIS)return "";
 const topicGraph=/^(ac|rc|capacitors|inductors|filters|timing|rf|power-rails)$/.test(t.id);
 let secondary=null;
 if(q.level==="Troubleshooting" && step>=2)secondary="wiring";
 else if(topicGraph && step>=3)secondary="concept";
 return '<div class="av-solution-circuit"><h4>Follow the circuit while reading this step</h4>'+
 VIS.render(q,t,"schematic")+
 (secondary?'<details class="av-step-extra"><summary>'+ (secondary==="concept"?"Show the response graph":"Show the wiring / test setup")+'</summary>'+VIS.render(q,t,secondary)+'</details>':"")+
 '<button id="avStepVisual" class="av-light" type="button">Open all three visual views ↗</button></div>';
}

function practicePage(q,t,f){
 const result=(q.expected!==undefined)?'The correct result is '+fmt(q.expected)+' '+q.unit+'.':(f.deep?f.deep.recap:q.steps.join(" "));
 return '<section class="av-page" aria-label="Practice without the answer">'+
 '<div class="av-eyebrow">PAGE 4 / 4 · TRY IT YOURSELF</div>'+
 '<h3>Your turn — explain it without reading the solution</h3>'+
 '<p class="av-explain">Your answer will be checked against the question’s concepts. You will receive a correct, partially correct, or needs-correction result, with suggestions you can use to retry.</p>'+
 '<div class="av-question"><span>QUESTION '+(currentIndex+1)+' / '+qset().length+'</span><p>'+esc(q.question)+'</p></div>'+
 (q.expected!==undefined?'<form id="avTryNumber" class="av-try-form"><label for="avValue">Enter your calculated answer</label><div class="av-input-row"><input id="avValue" type="text" inputmode="decimal" autocomplete="off" placeholder="Example: 0.025 or 2.5e-2" value="'+esc(currentAnswer)+'" aria-describedby="avRequestedUnit"><span id="avRequestedUnit">'+esc(q.unit)+'</span><button class="av-primary" type="submit">Check answer</button></div></form>':
 '<label class="av-try-label" for="avExplain">Write your explanation in your own words</label><textarea id="avExplain" rows="4" placeholder="I think this means... because... An engineer would test it by...">'+esc(draftText)+'</textarea>'+
 '<div class="av-actions-bottom"><button id="avCheckExplanation" class="av-primary" type="button">Check my written answer</button><button id="avCompare" class="av-light">Show reference example</button></div>')+
 '<div id="avFeedback" role="status" aria-live="polite">'+(feedback?feedback:gradeView(state.assessments[q.id]))+'</div>'+
 '<details id="avReference" class="av-reference" '+(expanded?"open":"")+'><summary>Show the worked reference answer</summary><p>'+esc(result)+'</p>'+
 (q.formula?equation(q.formula,"FORMULA")+equation(q.sub,"SUBSTITUTION"):"")+
 '</details>'+
 '<div class="av-self-check"><h4>Learning progress</h4><p>First check your answer. A correct result unlocks mastery; partial or incorrect answers can be revised without losing your work. You may always choose additional practice.</p>'+
 '<div class="av-control-row"><button id="avNeedReview" class="av-light">I need more practice</button><button id="avUnderstand" class="av-good" '+((state.assessments[q.id]||{}).band!=="likely-correct"||answerDirty?'disabled title="Check and correct your answer first"':'')+'>I can explain it ✓</button></div></div>'+
 '<div class="av-actions-bottom"><button id="avBackLesson" class="av-light">← Review the lesson again</button><button id="avNextQuestion" class="av-primary">Next question →</button></div>'+
 '</section>';
}
function show(){
 if(!host)return;
 const t=topicOf(),all=qset();if(currentIndex>=all.length)currentIndex=0;
 const q=all[currentIndex], f=q?focus(q,t):null;
 const allKnown=QUESTIONS.filter(p=>state.ratings[p.id]==="know").length;
 const count=cnt(t.id);
 host.innerHTML='<div class="av-tutor">'+
 '<header class="av-hero"><div><span class="av-eyebrow">BEGINNER ELECTRICAL ENGINEERING · INTERACTIVE WORKBOOK</span><h2>Understand it. See it. Solve it.</h2>'+
 '<p>No prior EE knowledge required. Explore a full circuit schematic, graph and wiring picture for each question before solving the steps.</p></div>'+
 '<div class="av-hero-stats"><strong>'+allKnown+' / '+QUESTIONS.length+'</strong><small>questions mastered</small></div></header>'+
 '<div class="av-tutor-layout"><aside class="av-guide-menu"><div class="av-guide-label">YOUR LEARNING PATH</div>'+
 '<label class="av-selector-label" for="avTopicList">Select a topic</label><select id="avTopicList">'+TOPICS.map((x,i)=>'<option value="'+esc(x.id)+'" '+(x.id===topic?"selected":"")+'>Topic '+(i+1)+': '+esc(x.title)+'</option>').join("")+'</select>'+
 '<div class="av-topic-progress"><strong>'+count+' / 30</strong> mastered in this topic<div><span style="width:'+(100*count/30)+'%"></span></div></div>'+
 '<div class="av-guide-label">QUESTION TYPE</div><select id="avLevelList">'+["All","Foundations","Application","Calculation","Troubleshooting"].map(x=>'<option value="'+x+'" '+(x===filter?"selected":"")+'>'+x+'</option>').join("")+'</select>'+
 '<label class="av-selector-label" for="avQuestionSearch">Search questions</label><input id="avQuestionSearch" type="search" placeholder="Voltage, ripple, UART..." value="'+esc(query)+'">'+
 '<div class="av-how"><strong>How this workbook works</strong><ol><li>Learn the basic terms.</li><li>Explore your circuit and board connection diagrams.</li><li>Follow each worked step.</li><li>Try independently.</li></ol></div>'+
 '<button class="av-light av-export" id="avExportLearning">Export my saved progress</button></aside>'+
 '<div class="av-workbook"><div class="av-workbook-heading"><div><span class="av-eyebrow">'+esc(t.group.toUpperCase())+' · TOPIC '+(TOPICS.indexOf(t)+1)+' OF '+TOPICS.length+'</span>'+
 '<h2>'+esc(t.title)+'</h2><p>'+esc(LESSONS[t.id]?.lead||t.goal)+'</p></div></div>'+
 '<div class="av-question-controls"><strong>QUESTION '+(all.length?currentIndex+1:0)+' / '+all.length+'</strong>'+
 '<div><button id="avQuestionPrevious" class="av-light" '+(currentIndex<=0?"disabled":"")+'>← Previous</button><button id="avQuestionNext" class="av-light" '+(currentIndex>=all.length-1?"disabled":"")+'>Next →</button></div></div>'+
 (q?'<div class="av-page-tabs" role="tablist" aria-label="Four-page visual guided workbook">'+
 [["learn","1 · Understand"],["visual","2 · Visuals"],["work","3 · Baby steps"],["try","4 · Try it"]].map((x,i)=>'<button role="tab" aria-selected="'+(page===x[0]?"true":"false")+'" data-page="'+x[0]+'" class="'+(page===x[0]?"active":"")+'">'+x[1]+'</button>').join("")+'</div>'+
 (page==="learn"?lessonPage(q,t,f):page==="visual"?visualPage(q,t,f):page==="work"?solvePage(q,t,f):practicePage(q,t,f)):
 '<div class="av-no-result"><h3>No questions found</h3><p>Clear the search or select another question type.</p></div>')+
 '<details class="av-browse-questions" open><summary>Browse all '+allTopicQuestions().length+' actual questions in this topic — select one to open it</summary>'+
 '<p class="av-browse-help">These are the real 30 questions, not generated placeholders. Click a question to load its own explanation, circuit, guided steps and answer checker above. The list stays complete when filters are active.</p>'+
 '<div class="av-question-gallery" role="group" aria-label="All 30 practice question titles">'+
 allTopicQuestions().map((p,i)=>'<button data-qid="'+esc(p.id)+'" class="av-browse-card '+(q&&q.id===p.id?"active ":"")+(state.ratings[p.id]==="know"?"done":state.ratings[p.id]==="again"?"retry":"")+'" aria-current="'+(q&&q.id===p.id?"true":"false")+'" aria-label="Open question '+(i+1)+': '+esc(p.question)+'">'+
 '<span class="av-browse-meta"><b>Q'+(i+1)+'</b><em>'+esc(p.level)+'</em></span><span class="av-browse-title">'+esc(p.question)+'</span>'+
 '<small>'+(state.ratings[p.id]==="know"?"✓ Mastered":state.ratings[p.id]==="again"?"↻ Review needed":state.assessments[p.id]?"◈ Checked":"○ Not answered")+'</small></button>').join("")+'</div>'+
 '<small class="av-browse-legend">Blue: currently open · Green: mastered · Amber: review needed. Your selection opens at the top of the workbook.</small></details>'+
 '<p class="av-footnote">All examples are educational; use approved procedures and actual device specifications for real hardware. Textbook chapter topics inspired the curriculum, but problems and explanations are original.</p>'+
 '</div></div><dialog class="av-zoom-dialog" id="avVisualZoom" aria-label="Expanded circuit figure"><div class="av-zoom-top"><strong>Expanded engineering diagram</strong><button class="av-light" type="button" id="avZoomClose">Close ×</button></div><div id="avZoomBody"></div></dialog></div>';
 wire();
}
function switchPage(p){page=p;stepIndex=0;feedback="";expanded=false;show();find(".av-workbook",host)?.scrollIntoView({block:"start",behavior:"smooth"});}
function moveQuestion(n){currentIndex=Math.max(0,Math.min(qset().length-1,n));page="learn";stepIndex=0;expanded=false;feedback="";const q=selected();draftText=q?(state.responses[q.id]||""):"";currentAnswer=draftText;answerDirty=false;state.lastTopic=topic;state.lastIndex=currentIndex;save();show();const heading=find(".av-workbook-heading h2",host);if(heading){heading.setAttribute("tabindex","-1");heading.focus({preventScroll:true});}find(".av-workbook",host)?.scrollIntoView({block:"start",behavior:"smooth"});}
function rating(x){const q=selected();if(!q)return;if(x==="know"&&(answerDirty||!state.assessments[q.id]||state.assessments[q.id].band!=="likely-correct"))return;state.ratings[q.id]=x;save();if(currentIndex<qset().length-1)moveQuestion(currentIndex+1);else show();}
function wire(){
 const el=find("#avTopicList",host);
 if(el)el.onchange=e=>{topic=e.target.value;currentIndex=0;page="learn";stepIndex=0;filter="All";query="";state.lastTopic=topic;state.lastIndex=0;save();show()};
 const lev=find("#avLevelList",host);
 if(lev)lev.onchange=e=>{filter=e.target.value;currentIndex=0;page="learn";stepIndex=0;show()};
 const search=find("#avQuestionSearch",host);
 if(search)search.onchange=e=>{query=e.target.value.toLowerCase().trim();currentIndex=0;page="learn";stepIndex=0;show()};
 const ex=find("#avExportLearning",host);
 if(ex)ex.onclick=()=>{
  const b=new Blob([JSON.stringify({version:2,exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(b),a=document.createElement("a");a.href=url;a.download="avionics-ee-progress.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 };
 host.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>switchPage(b.dataset.page));
 host.querySelectorAll("[data-qid]").forEach(b=>b.onclick=()=>{const id=b.dataset.qid;filter="All";query="";const idx=allTopicQuestions().findIndex(x=>x.id===id);if(idx>=0)moveQuestion(idx);});
 const prev=find("#avQuestionPrevious",host),next=find("#avQuestionNext",host);
 if(prev)prev.onclick=()=>moveQuestion(currentIndex-1);
 if(next)next.onclick=()=>moveQuestion(currentIndex+1);
 const work=find("#avGoWork",host);if(work)work.onclick=()=>switchPage("work");
 const visual=find("#avGoVisual",host);if(visual)visual.onclick=()=>switchPage("visual");
 const visBack=find("#avVisualBack",host);if(visBack)visBack.onclick=()=>switchPage("learn");
 const visNext=find("#avVisualForward",host);if(visNext)visNext.onclick=()=>switchPage("work");
 host.querySelectorAll("[data-zoom]").forEach(b=>b.onclick=()=>{const q=selected(),t=topicOf(),dialog=find("#avVisualZoom",host),body=find("#avZoomBody",host);if(!q||!VIS||!dialog||!body)return;body.innerHTML=VIS.render(q,t,b.dataset.zoom);dialog.showModal()});
 const zoomClose=find("#avZoomClose",host);if(zoomClose)zoomClose.onclick=()=>find("#avVisualZoom",host)?.close();
 const zoomDialog=find("#avVisualZoom",host);if(zoomDialog)zoomDialog.onclick=e=>{if(e.target===zoomDialog)zoomDialog.close()};
 const stepBack=find("#avStepBack",host);if(stepBack)stepBack.onclick=()=>{stepIndex=Math.max(0,stepIndex-1);show()};
 const stepNext=find("#avStepNext",host);if(stepNext)stepNext.onclick=()=>{stepIndex++;show()};
 const goTry=find("#avGoTry",host);if(goTry)goTry.onclick=()=>switchPage("try");
 const stepVis=find("#avStepVisual",host);if(stepVis)stepVis.onclick=()=>switchPage("visual");
 const numberInput=find("#avValue",host);if(numberInput)numberInput.oninput=e=>{currentAnswer=e.target.value;answerDirty=true;const btn=find("#avUnderstand",host);if(btn)btn.disabled=true;const fb=find("#avFeedback",host);if(fb)fb.innerHTML='<p class="av-message">Answer changed. Recheck the calculation to update your result.</p>';};
 const tryNumber=find("#avTryNumber",host);
 if(tryNumber)tryNumber.onsubmit=e=>{
   e.preventDefault();const q=selected(),input=find("#avValue",host);
   currentAnswer=input.value.trim();state.responses[q.id]=currentAnswer;
   state.attempts[q.id]=(state.attempts[q.id]||0)+1;
   const result=ASSESS.gradeNumber(q,currentAnswer);
   state.assessments[q.id]=result;
   if(result.band!=="likely-correct"&&state.ratings[q.id]==="know")state.ratings[q.id]="again";
   save();answerDirty=false;feedback=gradeView(result);show();
 };
 const explain=find("#avExplain",host);
 if(explain)explain.oninput=e=>{draftText=e.target.value;answerDirty=true;const btn=find("#avUnderstand",host);if(btn)btn.disabled=true;const fb=find("#avFeedback",host);if(fb)fb.innerHTML='<p class="av-message">Answer changed. Check this revised answer to receive updated feedback.</p>';};
 const checkText=find("#avCheckExplanation",host);
 if(checkText)checkText.onclick=()=>{
   const q=selected(),t=topicOf();
   draftText=(find("#avExplain",host)?.value||"").trim();
   state.responses[q.id]=draftText;
   state.attempts[q.id]=(state.attempts[q.id]||0)+1;
   const result=ASSESS.gradeText(q,t,draftText);
   state.assessments[q.id]=result;
   if(result.band!=="likely-correct"&&state.ratings[q.id]==="know")state.ratings[q.id]="again";
   save();answerDirty=false;feedback=gradeView(result);show();
 };
 const compare=find("#avCompare",host);
 if(compare)compare.onclick=()=>{
   draftText=find("#avExplain",host)?.value||draftText;expanded=true;
   const ref=find("#avReference",host);if(ref)ref.open=true;
   const f=find("#avFeedback",host);
   if(f&&!state.assessments[selected().id])f.innerHTML='<div class="av-message">The reference is for comparison. Use Check my written answer to see your rubric feedback and missing ideas.</div>';
 };
 const under=find("#avUnderstand",host);if(under)under.onclick=()=>rating("know");
 const retry=find("#avNeedReview",host);if(retry)retry.onclick=()=>rating("again");
 const back=find("#avBackLesson",host);if(back)back.onclick=()=>switchPage("learn");
 const nxt=find("#avNextQuestion",host);if(nxt)nxt.onclick=()=>moveQuestion(currentIndex+1);
}
window.mountAvionicsPractice=function(el){
 if(!el||!ASSESS||TOPICS.length!==23||QUESTIONS.length!==690){if(el)el.textContent="The Avionics question bank did not load correctly.";return}
 host=el;el.dataset.avMounted="yes";const q=selected();if(q){draftText=state.responses[q.id]||"";currentAnswer=draftText;}show();
};
window.avionicsWorkbookV2={getQuestionCount:()=>QUESTIONS.length,getTopics:()=>TOPICS.length,stepsForQuestion:id=>{
 const q=QUESTIONS.find(x=>x.id===id);if(!q)return null;
 const t=TOPICS.find(x=>x.id===q.topic);return stepsFor(q,t,focus(q,t));
}};
})();