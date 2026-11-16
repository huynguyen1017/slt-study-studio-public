"use strict";
/* Standalone NVIDIA SLT study tab. No mutation of the Muon question bank
   or its local progress. Does not send responses to any server. */
(function(){
const T=window.NVIDIA_SLT_TRACKS||[],Q=window.NVIDIA_SLT_QUESTIONS||[],M=window.NVIDIA_SLT_CALCS;
const KEY="slt-nvidia-soc-academy-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const fmt=n=>Number(Number(n).toPrecision(7)).toString();
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{}
let state={mastered:{},responses:{},checked:{},topic:T[0]?.id||"electrical",index:0,...saved};
for(const k of ["mastered","responses","checked"])if(!state[k]||typeof state[k]!=="object")state[k]={};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
let root=null,screen="concept",step=0,rolls={},currentVariants={},feedback="",showAll=false;
const own=t=>Q.filter(q=>q.topic===t);
const getBase=()=>own(state.topic)[Math.max(0,Math.min(49,state.index))];
const getQ=()=>{const base=getBase();return base?(currentVariants[base.id]||base):null};
const track=()=>T.find(x=>x.id===state.topic)||T[0];
const count=t=>own(t).filter(q=>state.mastered[q.id]).length;
const ref=()=>window.NVIDIA_SLT_SOURCE_REFERENCES||[];
function makeDice(){
 const base=getBase();if(!base||base.questionType!=="number")return;
 const next=(rolls[base.id]||0)+1;rolls[base.id]=next;
 const m=M.generate(base.topic,(base.difficulty-21)%10,next);
 if(m.method!==base.operation)throw Error("Numerical method changed during reroll");
 const steps=[
 "Start with the new givens and requested final unit "+m.unit+". Draw or describe the correct physical or data-flow model.",
 "Define the measured hardware concept: "+base.skillName+". "+track().skills[(base.difficulty-1)%10].meaning,
 "List all given inputs: "+m.prompt+" Convert engineering prefixes into consistent units.",
 "Governing relationship for the SAME method: "+m.formula+". State what each variable represents.",
 "Use the NEW values: "+m.sub+". Calculate "+m.expected+" "+m.unit+". Never reuse the canonical numerical answer.",
 "Why this equation fits the case: "+m.why+" Check sign and magnitude.",
 "Independent plausibility check: "+m.check+" Compare against the target-specific specification, not an invented universal limit.",
 "Cross-check using separate test evidence; preserve the raw reading, setup and board configuration.",
 "Explain the result in interview language and identify what evidence would be needed to call the hardware PASS, FAIL or INVALID."
 ];
 currentVariants[base.id]={...base,question:"🎲 New numbers — "+m.prompt+" Explain the substitutions, units, independent evidence and limitations.",steps,
 expected:m.expected,unit:m.unit,formula:m.formula,sub:m.sub,math:m,operation:m.method,variant:true,
 lesson:{...base.lesson,example:m.sub,summary:"A fresh instance of the SAME calculation method: "+m.formula+". "+m.why}};
 feedback="";step=0;screen="concept";showAll=false;render();
}
function resetDice(){const base=getBase();if(base)delete currentVariants[base.id];feedback="";step=0;screen="concept";showAll=false;render();}
function goto(i){state.index=Math.max(0,Math.min(49,i));step=0;screen="concept";showAll=false;feedback="";save();render();}
function svgDiagram(q){
 const t=track(),color=["#2d528c","#8c56a6","#0c7d79"],safe=esc;
 return '<svg class="nvs-flow" viewBox="0 0 900 270" role="img" aria-label="Conceptual fault isolation flow: host, test interface, DUT, physical evidence and independent disposition" xmlns="http://www.w3.org/2000/svg">'+
 '<rect x="2" y="2" width="896" height="266" rx="15" fill="#f9fbff" stroke="#d6e2f5"/>'+
 '<text x="22" y="30" font-size="15" fill="#284362" font-weight="700">EXPLANATORY FLOW — NOT A VERIFIED BOARD SCHEMATIC OR A REAL NVIDIA TEST CAPTURE</text>'+
 [['Linux test host',25],['Fixture / software',250],['SoC / memory / GPU',475],['Raw evidence',700]].map((x,i)=>
 '<rect x="'+x[1]+'" y="63" width="176" height="94" rx="12" fill="'+["#e4eeff","#efeafd","#e4f5f3","#fff0d8"][i]+'" stroke="'+color[i%3]+'"/>'+
 '<text x="'+(x[1]+88)+'" y="95" font-size="16" font-weight="700" fill="#273e5b" text-anchor="middle">'+safe(x[0])+'</text>'+
 '<text x="'+(x[1]+88)+'" y="124" font-size="12" fill="#425675" text-anchor="middle">'+safe(["Run + manifest","Cable / station","Unit under test","Counters / scope / logs"][i])+'</text>').join("")+
 [208,433,658].map(x=>'<path d="M'+x+' 110 h31" stroke="#567aa8" stroke-width="3"/><path d="M'+(x+29)+' 105 l7 5 -7 5" fill="none" stroke="#567aa8" stroke-width="3"/>').join("")+
 '<text x="24" y="188" font-size="14" fill="#27425d">What we are investigating: '+safe(t.title.slice(0,84))+'</text>'+
 '<rect x="20" y="204" width="858" height="44" rx="10" fill="#e5f4ed"/>'+
 '<text x="34" y="223" font-size="13" fill="#165640" font-weight="700">Evidence first → one controlled variable → independent comparison → PASS / FAIL / INVALID / BLOCKED</text>'+
 '<text x="34" y="240" font-size="11" fill="#48715c">Do not claim physical connections, instrument settings or flight hardware approval from this illustrative diagram.</text></svg>';
}
function sources(){
 return '<details class="nvs-references"><summary>Learning sources, scope &amp; professional boundaries</summary><p><strong>Primary source:</strong> uploaded LTTS NVIDIA System Level Test Engineer job description (SoC diag, ATE/DFT, verification, yield, Python/Shell, PCIe/DDR). The uploaded NVIDIA interview study guide and Muon interview guide inform topics, but no private employer logs, interview answers or original document text were published.</p>'+
 ref().filter(x=>x.url).map(r=>'<p><a target="_blank" rel="noopener noreferrer" href="'+esc(r.url)+'">'+esc(r.title)+' ↗</a></p>').join("")+
 '<p>Illustrative practice is not official NVIDIA training, not an active NVIDIA product specification and not proof of professional experience with an instrument.</p></details>';
}
function intro(q){
 return '<div class="nvs-lesson"><div class="nvs-kicker">1 · UNDERSTAND · NO BACKGROUND REQUIRED</div>'+
 '<h3>'+esc(q.objective)+'</h3><div class="nvs-question">'+esc(q.question)+'</div>'+
 (q.variant?'<p class="nvs-hint">Practice New Numbers uses a separate answer and score; Restore Canonical Question returns to your original example.</p>':"")+
 '<div class="nvs-two"><section><h4>What this means, in simple language</h4><p>'+esc(q.lesson.summary)+'</p><p>'+esc(q.lesson.analogy)+'</p><h4>Key vocabulary</h4><dl>'+q.lesson.vocabulary.map(x=>'<dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd>').join("")+'</dl></section>'+
 '<section><h4>Why this matters to SLT</h4><p>'+esc(q.lesson.why)+'</p><h4>Starter hint</h4><p>'+esc(q.hints[0])+'</p><h4>Common mistake</h4><p>'+esc(q.hints[2])+'</p></section></div>'+
 svgDiagram(q)+
 (q.formula?'<div class="nvs-math"><strong>Equation</strong><code>'+esc(q.formula)+'</code><strong>Worked substitution</strong><code>'+esc(q.sub)+'</code></div>':"")+
 '<div class="nvs-inline-actions"><button type="button" data-screen="steps" class="nvs-primary">Start guided solution →</button><button type="button" data-screen="practice">Try without peeking</button></div></div>';
}
function guided(q){
 const total=q.steps.length;step=Math.min(step,total-1);
 return '<div class="nvs-lesson"><div class="nvs-kicker">2 · BABY STEPS · '+total+' DISTINCT CHECKS</div><h3>Explain the method, not just the answer</h3><div class="nvs-question">'+esc(q.question)+'</div>'+
 '<div class="nvs-stepbar" role="progressbar" aria-valuenow="'+(step+1)+'" aria-valuemin="1" aria-valuemax="'+total+'"><span style="width:'+Math.round((step+1)*100/total)+'%"></span></div>'+
 '<article class="nvs-step"><strong>STEP '+(step+1)+' / '+total+'</strong><p>'+esc(q.steps[step])+'</p></article>'+
 '<div class="nvs-inline-actions"><button type="button" id="nvsPrevStep" '+(!step?'disabled':'')+'>← Prior step</button><button type="button" id="nvsNextStep" '+(step>=total-1?'disabled':'')+'>Next step →</button><button type="button" id="nvsAllSteps">'+(showAll?'Hide':'Show')+' all steps</button></div>'+
 (showAll?'<ol class="nvs-steps-all">'+q.steps.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol>':"")+
 '<div class="nvs-math"><strong>Interview-style proposed explanation</strong><p>'+esc(q.interviewAnswer)+'</p>'+
 (q.expected!==undefined?'<strong>Answer</strong><code>'+esc(fmt(q.expected)+" "+q.unit)+'</code><strong>New substitution</strong><code>'+esc(q.sub)+'</code>':"")+'</div>'+
 '<div class="nvs-inline-actions"><button type="button" data-screen="practice" class="nvs-primary">Now check my understanding →</button></div></div>';
}
function practice(q){
 const key=q.variant?q.id+"::dice":q.id,raw=state.responses[key]||"",isMath=q.questionType==="number",checked=state.checked[key];
 return '<div class="nvs-lesson"><div class="nvs-kicker">3 · PRACTICE &amp; REFLECT · LOCAL ONLY</div><h3>Explain your reasoning before revealing the solution</h3>'+
 '<div class="nvs-question">'+esc(q.question)+'</div>'+
 (isMath?'<label for="nvsValue">Your numeric result ('+esc(q.unit)+')</label><input type="text" id="nvsValue" inputmode="decimal" placeholder="Number, e.g. 2.5e-3" value="'+esc(raw)+'">':
 '<label for="nvsText">Your explanation, evidence and first test</label><textarea rows="6" id="nvsText" placeholder="The concept means... I would compare... A false conclusion would be...">'+esc(raw)+'</textarea>')+
 '<div class="nvs-inline-actions"><button type="button" id="nvsCheck" class="nvs-primary">Check answer</button><button type="button" id="nvsReveal">Show reference answer</button></div>'+
 (feedback?'<div class="nvs-feedback" role="status" aria-live="polite">'+esc(feedback)+'</div>':"")+
 (checked?'<p class="nvs-review-msg">You have completed a check for this question. Inspect the reference and judge whether you could explain it without reading.</p>':"")+
 '<details id="nvsReference"><summary>Complete worked answer &amp; interview explanation</summary><ol>'+q.steps.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>'+
 (isMath?'<p><strong>Final answer:</strong> '+esc(fmt(q.expected)+" "+q.unit)+'</p>':"")+
 '<p><strong>Interview response (proposed method):</strong> '+esc(q.interviewAnswer)+'</p></details>'+
 '<div class="nvs-rating"><p>Mastery is self-assessed after your answer check. Only mark mastered when you can explain the reasoning and first independent check without copying.</p>'+
 '<button type="button" id="nvsReview">↻ Review again</button><button type="button" id="nvsMaster" '+(!checked?'disabled':'')+' class="nvs-primary">✓ I can explain it</button></div></div>';
}
function evidence(q){
 return '<div class="nvs-lesson"><div class="nvs-kicker">4 · BENCH &amp; EVIDENCE · EXPLAIN THE PHYSICAL CHECK</div><h3>What would I actually capture?</h3>'+
 svgDiagram(q)+
 '<p>For this question, a relevant independent observation is: <strong>'+esc(track().skills[(q.difficulty-1)%10].observe)+'</strong>.</p>'+
 '<h4>Evidence packet to practice describing</h4><ol><li>DUT board serial, silicon stepping and exact firmware hash.</li><li>Station, fixture and approved test procedure revision.</li><li>Instrument/probe setup and calibration status, plus valid limit.</li><li>Raw first-failure timestamped logs and any relevant scope or DAQ data.</li><li>One controlled A/B/A experiment, comparison to known-good unit and proposed owner.</li><li>PASS / FAIL / INVALID / BLOCKED with a reason and next confirming action.</li></ol>'+
 '<div class="nvs-hint"><strong>Professional accuracy:</strong> The uploaded study materials include documented CPU power/clock measurements, DRAM testing, socket/ATE work and firmware bring-up. A hypothetical GPU/DCGM, RF or formal PCIe compliance task should be discussed as a learning plan—not claimed as completed personal experience.</div></div>';
}
function render(){
 if(!root)return;
 const t=track(),q=getQ(),base=getBase(),done=Object.values(state.mastered).filter(Boolean).length;
 root.innerHTML='<div class="nvs-app"><div class="nvs-hero"><div><small class="nvs-eyebrow">LTTS · NVIDIA CUSTOMER · SANTA CLARA · EDUCATIONAL PRACTICE</small><h2>System Level Test Engineer Academy</h2><p>From zero EE foundations to post-silicon troubleshooting and evidence-based yield improvement. Distinct from the Muon Avionics Academy.</p></div><div class="nvs-stats"><strong>'+done+' / '+Q.length+'</strong><span>canonical questions mastered</span><small>12 tracks · 50 questions each</small></div></div>'+
 '<div class="nvs-layout"><aside class="nvs-side"><label for="nvsTopics">Choose learning track</label><select id="nvsTopics">'+T.map(x=>'<option value="'+esc(x.id)+'" '+(x.id===state.topic?'selected':'')+'>'+esc(x.title)+'</option>').join("")+'</select>'+
 '<div class="nvs-track"><strong>'+count(state.topic)+' / 50</strong><span> mastered in this track</span><div class="nvs-trackbar"><span style="width:'+(2*count(state.topic))+'%"></span></div></div>'+
 '<p><strong>Recommended start:</strong> Q1–10 (definitions), then Q11–20 (lab setup), Q21–30 (10 different calculations), Q31–40 (fault isolation), Q41–50 (integrated multi-fault cases).</p>'+
 '<div class="nvs-phase-nav">'+["1–10 Basics","11–20 Lab","21–30 Math","31–40 Debug","41–50 Integrated"].map((x,i)=>'<button type="button" data-goto="'+(i*10)+'">'+esc(x)+'</button>').join("")+'</div>'+
 '<button type="button" id="nvsExport">Export NVIDIA learning progress</button>'+
 sources()+'</aside>'+
 '<div class="nvs-main"><div class="nvs-toolbar"><div><span>TRACK '+(T.indexOf(t)+1)+' / 12</span><h3>'+esc(t.title)+'</h3><p>'+esc(t.goal)+'</p></div><span>QUESTION '+(state.index+1)+' / 50</span></div>'+
 '<div class="nvs-nav"><button type="button" id="nvsPrevious" '+(!state.index?'disabled':'')+'>← Previous</button><span>'+esc(q.phase)+' · '+esc(q.skillName)+'</span><button type="button" id="nvsNext" '+(state.index===49?'disabled':'')+'>Next →</button></div>'+
 '<div class="nvs-numbers" aria-label="50 distinct NVIDIA SLT practice questions">'+own(state.topic).map((x,i)=>'<button type="button" data-goto="'+i+'" aria-current="'+(i===state.index?'true':'false')+'" class="'+(i===state.index?'selected':'')+' '+(state.mastered[x.id]?'mastered':'')+'" title="'+esc(x.objective)+'">'+(i+1)+'</button>').join("")+'</div>'+
 (base.questionType==="number"?'<div class="nvs-dice"><button type="button" id="nvsDice">🎲 Practice New Numbers</button>'+(q.variant?'<button type="button" id="nvsRestore">↺ Restore Canonical Question</button>':"")+'<small>New numbers, same method · original score preserved</small></div>':"")+
 '<div class="nvs-tabs" role="tablist">'+[['concept','1 · Understand'],['steps','2 · Baby steps'],['practice','3 · Try it'],['evidence','4 · Evidence']].map(a=>'<button role="tab" type="button" data-screen="'+a[0]+'" aria-selected="'+(screen===a[0])+'">'+a[1]+'</button>').join("")+'</div>'+
 (screen==="concept"?intro(q):screen==="steps"?guided(q):screen==="practice"?practice(q):evidence(q))+
 '</div></div><footer class="nvs-foot">Original educational exercise bank; no affiliation with NVIDIA or LTTS. All hardware thresholds, example units and scenarios are illustrative. All progress stays in your browser unless you export it.</footer></div>';
 wire();
}
function wire(){
 root.querySelector("#nvsTopics").onchange=e=>{state.topic=e.target.value;state.index=0;step=0;screen="concept";feedback="";save();render();};
 root.querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>goto(Number(b.dataset.goto)));
 root.querySelectorAll("[data-screen]").forEach(b=>b.onclick=()=>{screen=b.dataset.screen;step=0;feedback="";render()});
 const prev=root.querySelector("#nvsPrevious"),next=root.querySelector("#nvsNext");prev.onclick=()=>goto(state.index-1);next.onclick=()=>goto(state.index+1);
 const dice=root.querySelector("#nvsDice");if(dice)dice.onclick=makeDice;
 const restore=root.querySelector("#nvsRestore");if(restore)restore.onclick=resetDice;
 const ps=root.querySelector("#nvsPrevStep"),ns=root.querySelector("#nvsNextStep");
 if(ps)ps.onclick=()=>{step=Math.max(0,step-1);render()};
 if(ns)ns.onclick=()=>{step=Math.min(getQ().steps.length-1,step+1);render()};
 const show=root.querySelector("#nvsAllSteps");if(show)show.onclick=()=>{showAll=!showAll;render()};
 const exportBtn=root.querySelector("#nvsExport");exportBtn.onclick=()=>{
  const file={version:1,course:"NVIDIA System Level Test Engineer Academy",exportedAt:new Date().toISOString(),...state};
  const blob=new Blob([JSON.stringify(file,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="nvidia-slt-academy-progress.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const val=root.querySelector("#nvsValue"),txt=root.querySelector("#nvsText");
 const q=getQ(),key=q.variant?q.id+"::dice":q.id,field=val||txt;
 if(field)field.oninput=()=>{state.responses[key]=field.value;delete state.checked[key];feedback="";save();};
 const check=root.querySelector("#nvsCheck");
 if(check)check.onclick=()=>{
  const value=String(field?.value||"").trim();
  if(q.questionType==="number"){
   const m=value.match(/^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i);
   if(!m||!Number.isFinite(Number(value))){feedback="Enter a finite number in "+q.unit+". Include units in your written reasoning rather than the numeric input.";delete state.checked[key];}
   else if(Math.abs(Number(value)-q.expected)<=Math.max(1e-7,Math.abs(q.expected)*.012)){
    feedback="Correct: "+fmt(q.expected)+" "+q.unit+". Now explain the equation, converted units and independent verification.";state.checked[key]=true;
   }else{feedback="Not yet. Your value differs. Check prefixes, formula, sign and given numbers; review each worked step.";delete state.checked[key];}
  }else if(value.length<90){feedback="Build a fuller explanation (about two or three sentences): define the concept, name a specific measurement, and state what would falsify your hypothesis.";delete state.checked[key];}
  else {feedback="Response recorded. Compare each worked step and test hypothesis against your explanation. This is self-assessment, not an automated factual correctness verdict.";state.checked[key]=true;}
  save();render();
 };
 const reveal=root.querySelector("#nvsReveal");if(reveal)reveal.onclick=()=>{const d=root.querySelector("#nvsReference");if(d){d.open=true;d.scrollIntoView({block:"nearest"})}};
 const review=root.querySelector("#nvsReview");if(review)review.onclick=()=>{delete state.mastered[q.id];feedback="Marked for another review.";save();render()};
 const master=root.querySelector("#nvsMaster");if(master)master.onclick=()=>{if(!state.checked[key])return;state.mastered[q.variant?q.id+"::dice":q.id]=true;save();if(state.index<49)goto(state.index+1);else render()};
}
window.mountNvidiaSltAcademy=el=>{
 if(!el)return;if(T.length!==12||Q.length!==600){el.textContent="The NVIDIA SLT question bank was incomplete; check the deployed script versions.";return}
 if(root===el&&el.dataset.nvsMounted==="true")return;
 root=el;el.dataset.nvsMounted="true";render();
};
// On a direct #nvidia link, app.js activates the tab before this script loads.
if(typeof location!=="undefined"&&location.hash==="#nvidia"&&typeof document!=="undefined"){
 window.mountNvidiaSltAcademy(document.getElementById("nvidiaSltRoot"));
}
})();
