"use strict";
/* Self-contained avionics study UI; state is separate from the original public SLT deck. */
(function(){
const TOPICS=window.AVIONICS_TOPICS||[],ITEMS=window.AVIONICS_QUESTIONS||[];
const STORE="slt-avionics-ee-practice-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=(s,p=document)=>p.querySelector(s);
const fmt=n=>Math.abs(n)>0&&Math.abs(n)<0.0001?n.toExponential(3):Number(n.toPrecision(5)).toString();
const math=s=>window.studyMath?window.studyMath(s,true):'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mtext>'+esc(s)+'</mtext></math>';
let saved={};try{saved=JSON.parse(localStorage.getItem(STORE)||"{}")||{}}catch{}
const state={ratings:{},attempts:{},...saved};
let root=null,topic=TOPICS[0]?.id||"",index=0,level="All",filterText="",revealed=false,hints=0,notice=null;
function persist(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch{}}
function qs(){return ITEMS.filter(x=>x.topic===topic&&(level==="All"||x.level===level)&&(!filterText||(`${x.question} ${x.steps.join(" ")}`).toLowerCase().includes(filterText)))}
function topicItems(id){return ITEMS.filter(x=>x.topic===id)}
function completeCount(id){return topicItems(id).filter(q=>state.ratings[q.id]==="know").length}
function totalKnown(){return ITEMS.filter(q=>state.ratings[q.id]==="know").length}
function summary(){
 const detail=TOPICS.find(t=>t.id===topic);
 const subset=qs(); if(index>=subset.length)index=Math.max(0,subset.length-1);
 const q=subset[index];
 return {detail,subset,q};
}
function render(){
 if(!root)return;
 const {detail,subset,q}=summary();
 const known=totalKnown();
 root.innerHTML=`
  <div class="av-intro">
   <div class="eyebrow">ENGINEERING FROM ZERO → SATELLITE TEST READINESS</div>
   <h2>Avionics &amp; Electrical Engineering Practice</h2>
   <p>Begin with voltage, current, and units; practice calculations with rendered engineering equations; work up to instrument control, board bring-up, RF, and flight-hardware go/no-go.</p>
   <div class="av-metrics"><span>${TOPICS.length} learning topics</span><span>${ITEMS.length} original questions</span><span>${known} mastered locally</span><span>30 questions in every topic</span></div>
  </div>
  <div class="av-wrap">
    <aside class="av-side" aria-label="Avionics practice topics">
      <h3>Learning path</h3>
      <div class="av-filter">
       <label>Question level<select id="avLevel">
         ${["All","Foundations","Application","Calculation","Troubleshooting"].map(x=>`<option value="${x}" ${x===level?"selected":""}>${x}</option>`).join("")}
       </select></label>
       <label>Find a question<input id="avSearch" type="search" placeholder="e.g. ripple" value="${esc(filterText)}"/></label>
      </div>
      <div class="av-topics">
       ${TOPICS.map((t,i)=>`<button class="av-topic ${t.id===topic?"active":""}" data-topic="${esc(t.id)}" aria-pressed="${String(t.id===topic)}"><strong>${i+1}. ${esc(t.title)}</strong><small>${completeCount(t.id)} of 30 mastered · ${esc(t.group)}</small><span class="av-track"><i style="width:${100*completeCount(t.id)/30}%"></i></span></button>`).join("")}
      </div>
    </aside>
    <div class="av-main">
      <div class="av-player" id="avPlayer">
      ${q?`
       <div class="av-kicker"><span>${esc(detail.group)} · ${esc(q.level)}</span><strong>QUESTION ${index+1} / ${subset.length}</strong></div>
       <h3>${esc(detail.title)}</h3><p>${esc(detail.goal)}</p>
       <div class="av-progress-top"><div style="width:${Math.round(100*(index+1)/Math.max(1,subset.length))}%"></div></div>
       <div class="av-problem">${esc(q.question)}</div>
       ${q.level==="Calculation"?`
          <form class="av-input" id="avCalculate">
            <label>Type your calculated result<input id="avNumber" aria-label="Numerical answer" inputmode="decimal" autocomplete="off" placeholder="e.g. 3.3 or 2.5e-6" required/></label>
            <span class="unit">${esc(q.unit)}</span>
            <button class="primary" type="submit">Check result</button>
          </form>`:''}
       <div id="avNotice" role="status" aria-live="polite"></div>
       <div class="av-actions">
         <button id="avHint" class="outline">Show next hint</button>
         <button id="avReveal" class="primary">${revealed?"Hide worked answer":"Reveal worked answer"}</button>
       </div>
       <div id="avHintBox" aria-live="polite"></div>
       <div id="avSolution" class="av-solution" ${revealed?"":"hidden"}>
          <h4>Guided answer — one step at a time</h4>
          <ol>${q.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>
          ${q.formula?`
            <div class="av-formula-label">1. ENGINEERING EQUATION (MATHML)</div><div class="av-eq">${math(q.formula)}</div>
            <div class="av-formula-label">2. SUBSTITUTE MEASURED VALUES</div><div class="av-eq">${math(q.sub)}</div>
            <div class="av-answer">Final answer: ${fmt(q.expected)} ${esc(q.unit)}</div>`:''}
          <p class="av-help">Explain the reasoning without reading it. For numerical problems, check your conversion factors and whether the measured value is plausible.</p>
       </div>
       <div class="av-bottom">
         <button id="avPrev" class="outline" ${index===0?"disabled":""}>← Previous</button>
         <button id="avAgain" class="outline">Needs more practice</button>
         <button id="avKnow" class="success">I can explain this ✓</button>
         <button id="avNext" class="outline" ${index===subset.length-1?"disabled":""}>Next →</button>
       </div>
       <div class="av-question-index" aria-label="Question chooser">
        ${subset.map((p,i)=>`<button data-index="${i}" class="${i===index?"active":""} ${state.ratings[p.id]==="know"?"done":state.ratings[p.id]==="again"?"review":""}" aria-label="Question ${i+1}: ${esc(p.level)}">${i+1}</button>`).join("")}
       </div><div class="av-legend">Purple = selected · Green = mastered · Orange = review needed. Each topic has 10 foundations/application, 10 calculations, and 10 troubleshooting questions.</div>
       `: `<h3>No questions match this filter</h3><p>Try another question type or clear the search term.</p>`}
      </div>
      <div class="av-section-header">
        <p>Original explanations aligned to the chapter sequence of Floyd &amp; Buchla and the Muon Space avionics test job requirements. Not copied from the textbook and not actual Muon flight specifications.</p>
        <button id="avExport" class="outline">Export my progress</button>
      </div>
    </div>
  </div>`;
 $('[id=avLevel]',root).onchange=e=>{level=e.target.value;index=0;resetQuestion();render()};
 $('#avSearch',root).oninput=e=>{const cursor=e.target.selectionStart;filterText=e.target.value.toLowerCase().trim();index=0;resetQuestion();render();const field=$('#avSearch',root);field.focus();field.setSelectionRange(cursor,cursor)};
 root.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>{topic=b.dataset.topic;index=0;resetQuestion();render()});
 $('#avExport',root).onclick=()=>{const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),questionCount:ITEMS.length,...state},null,2)],{type:"application/json"});const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="avionics-ee-progress.json";a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)};
 if(!q)return;
 root.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>goto(Number(b.dataset.index)));
 $('#avPrev',root).onclick=()=>goto(Math.max(0,index-1));
 $('#avNext',root).onclick=()=>goto(Math.min(subset.length-1,index+1));
 $('#avHint',root).onclick=()=>{hints=Math.min(hints+1,q.steps.length);$('#avHintBox',root).innerHTML='<div class="av-hint"><strong>Hint '+hints+' of '+q.steps.length+':</strong> '+esc(hints===1?q.hint:q.steps[hints-1])+'</div>'};
 $('#avReveal',root).onclick=()=>{revealed=!revealed;$('#avSolution',root).hidden=!revealed;$('#avReveal',root).textContent=revealed?"Hide worked answer":"Reveal worked answer"};
 $('#avAgain',root).onclick=()=>rate("again");
 $('#avKnow',root).onclick=()=>rate("know");
 if(q.expected!==undefined){
  $('#avCalculate',root).onsubmit=e=>{e.preventDefault();const raw=$('#avNumber',root).value.trim().replace(/,/g,"");const value=Number(raw);const f=$('#avNotice',root);f.className="av-feedback";
   if(!raw||!Number.isFinite(value)){f.textContent="Enter one finite number in the requested unit (scientific notation is allowed).";return}
   state.attempts[q.id]=(state.attempts[q.id]||0)+1;persist();
   const tolerance=Math.max(Math.abs(q.expected)*0.012,1e-10);
   if(Math.abs(value-q.expected)<=tolerance){f.classList.add("good");f.textContent="Correct. Your answer is within the numerical rounding tolerance. Explain the formula and units, then mark it mastered."}
   else {f.textContent="Not yet. Check the unit conversions, formula and calculation. Use a hint or open the worked answer; your work is not erased."}
  };
 }
}
function resetQuestion(){revealed=false;hints=0;notice=null}
function goto(i){index=i;resetQuestion();render();$('#avPlayer',root)?.scrollIntoView({block:"start",behavior:"smooth"})}
function rate(which){const q=qs()[index];if(!q)return;state.ratings[q.id]=which;persist();if(index<qs().length-1)goto(index+1);else render()}
window.mountAvionicsPractice=function(el){
 if(!el||!TOPICS.length||ITEMS.length!==TOPICS.length*(window.AVIONICS_EXPECTED_PER_TOPIC||30)){if(el)el.textContent="Avionics question bank did not load. Check the JavaScript asset versions.";return}
 if(root===el&&el.dataset.avMounted==="yes")return;
 root=el;el.dataset.avMounted="yes";render();
};
})();
