"use strict";
/* NVIDIA v41: mathematically faithful, read-only equation notebook for BOTH NVIDIA tabs.
   Sources: selected q.question, q.formula, q.sub, q.math, q.steps, selected dice values.
   Do not fabricate intermediate values or replace a conceptual question with a generic result.
   Do not reveal expected answer in Try. No change to scoring or local storage. */
(function(){
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]));
const math=(src)=>{
 const s=String(src||"").trim();
 if(!s)return "";
 // Code, JS built-ins and non-equation narrative must not masquerade as typeset mathematics.
 if(s.length>350||/\b(?:Math\.|function|return|if\s*\(|var\s|let\s|const\s)/.test(s))
  return '<code class="ne41-source-code">'+esc(s)+'</code>';
 return typeof window.studyMath==="function"?window.studyMath(s,true):'<code>'+esc(s)+'</code>';
};
const hasEq=s=>String(s||"").includes("=") && !String(s).includes("->");
const label=(title,body)=>'<div class="ne41-line"><strong>'+esc(title)+'</strong>'+body+'</div>';
function givens(q){
 const parser=window.CIRCUIT_CURRENT_QUESTION_RAILROAD?.extractQuantities;
 return typeof parser==="function"?parser(q?.question||""):[];
}
function formula(q){return String(q?.formula||q?.math?.formula||"").trim();}
function substitution(q){return String(q?.sub||q?.math?.sub||"").trim();}
function numeratorRails(q){
 const rr=window.CIRCUIT_CURRENT_QUESTION_RAILROAD;
 const unique=givens(q).filter(v=>v.power!==0);
 if(!unique.length)return '<p class="ne41-neutral">No prefixed SI quantity appears unambiguously in this question. Do not invent a conversion.</p>';
 return unique.slice(0,8).map(g=>label(g.raw+" · "+g.name+" (10^"+g.power+")",rr?.rail(g)||"")).join("");
}
function stepsFor(q){return Array.isArray(q?.steps)?q.steps:[];}
function stepLine(q,i,{showAnswers=true}={}){
 const steps=stepsFor(q),s=steps[i];
 if(s==null)return "";
 const source=String(s),lines=[];
 // Worked maths comes from selected question, never an unrelated fixed example.
 if(i===2&&hasEq(formula(q)))lines.push(label("Governing equation · actual question",math(formula(q))));
 if(i===3&&substitution(q))lines.push(label("Substitute the ACTUAL givens",math(hasEq(substitution(q))?substitution(q):"Substitution = "+substitution(q))));
 if(i===1)lines.push(label("Convert engineering prefixes by cancellation",numeratorRails(q)));
 if(showAnswers&&i===steps.length-1&&q?.expected!=null&&Number.isFinite(Number(q.expected)))lines.push('<div class="ne41-final"><b>Expected target in question dataset:</b> '+esc(q.expected+" "+(q.unit||""))+' <small>Validate independently against units, topology and assumptions.</small></div>');
 return '<div class="ne41-worked-step" data-ne41-index="'+i+'"><small>Step '+(i+1)+' · from the selected question</small><p>'+esc(source)+'</p>'+lines.join("")+'</div>';
}
function sceneSvg(q,stage) {
 const n=givens(q),first=n.find(v=>v.power!==0);
 if(!first||stage==="try")return "";
 const powers=String(first.power).replace(/-/g,"−");
 // Native SVG numerator and denominator remain fraction bars in downloadable pictures.
 const unit=esc(first.unit),base=esc(first.base),v=esc(first.value),scaled=esc(first.scaled);
 return '<svg class="ne41-svg-rail" viewBox="0 0 700 105" role="img" aria-label="'+esc("Factor-label conversion for "+first.raw)+'" xmlns="http://www.w3.org/2000/svg">'+
 '<rect x="1" y="1" width="698" height="103" rx="10" fill="#f6fbff" stroke="#9abbd6"/>'+
 '<text x="18" y="20" font-size="12" fill="#1d5986" font-weight="700">CURRENT QUESTION · NATIVE SVG FRACTION / UNIT CHECK</text>'+
 '<g fill="#164263" font-size="18" font-family="Arial,sans-serif" font-weight="700">'+
 '<text x="50" y="64">'+v+'</text><text x="104" y="64">'+unit+'</text>'+
 '<text x="161" y="64">×</text>'+
 '<text x="213" y="55">10^'+powers+' '+base+'</text>'+
 '<text x="243" y="87">1 '+unit+'</text>'+
 '<text x="340" y="67">=</text>'+
 '<text x="389" y="67">'+scaled+' '+base+'</text>'+
 '</g><path d="M205 66 H326" stroke="#af3951" stroke-width="2.5"/>'+
 '<path d="M104 51 l31 17 M266 79 l35 11" stroke="#d83553" stroke-width="2.5"/>'+
 '<text x="18" y="100" fill="#45637d" font-size="11">Same source quantity · no additional circuit result inferred</text></svg>';
}
function render(q,t,stage){
 if(!q)return "";
 const kind=["understand","visual","baby","try"].includes(stage)?stage:"understand";
 const f=formula(q),sub=substitution(q),formulaOk=hasEq(f);
 const numeric=q.expected!==undefined&&q.expected!==null&&Number.isFinite(Number(q.expected));
 const head=kind==="understand"?"1 · Understand":kind==="visual"?"2 · Visuals":kind==="baby"?"3 · Baby steps":"4 · Try it";
 let content='<p class="ne41-current"><b>Selected question:</b> '+esc(q.id||"current")+' · '+esc(q.question||"")+'</p>';
 if(kind==="understand"){
  content+='<p>Mark the given values, desired unknown and physical or data-flow assumptions before selecting a law. Only two physically common nodes define parallel branches.</p>';
  content+=label("1 · Real givens and units",givens(q).length?
    '<div class="ne41-givens">'+givens(q).slice(0,12).map(v=>'<span>'+esc(v.raw)+'</span>').join("")+'</div>':
    '<p>Conceptual problem: define terms and measurement reference first.</p>');
  content+=label("2 · Railroad-track SI prefix conversions",numeratorRails(q));
  if(formulaOk)content+=label("3 · Governing relationship from THIS question",math(f));
  else content+='<p class="ne41-neutral">No explicit numerical governing law was supplied in this question. Do not introduce unrelated values from another problem.</p>';
 }else if(kind==="visual"){
  content+='<p>These are educational drawings. Interpret the actual connected nodes or measured channel reference; unrelated scope axes, probe placements and fixed silicon limits are illustrative, not evidence or the current question’s numerical givens.</p>';
  if(formulaOk)content+=label("Annotated question-specific governing equation",math(f));
  if(sub)content+=label("Actual substitution (only when authored for this question)",math(hasEq(sub)?sub:"Substitution = "+sub));
  content+=sceneSvg(q,kind);
 }else if(kind==="baby"){
  content+='<p><b>Pencil order:</b> source givens → railroad-track unit cancellation → governing law → original values → solve algebra → verify units, KCL/KVL or independent evidence. Do not cancel across sums.</p>';
  content+=stepsFor(q).map((_,i)=>stepLine(q,i)).join("");
  if(!stepsFor(q).length)content+='<p>No authored procedural steps are present for this problem. Do not fabricate a solved walkthrough.</p>';
 }else{
  content+='<p>Write down the original givens and derive the result yourself. This reference shows only the symbolic law and permissible unit conversions; it does not provide the stored target or completed numerical substitution.</p>';
  if(formulaOk)content+=label("Governing law · symbolic setup only",math(f));
  const prefixed=givens(q).filter(v=>v.power!==0);
  if(prefixed.length)content+='<p class="ne41-neutral">Unit identities: '+prefixed.map(g=>esc(g.name+" = 10^"+g.power)).join(" · ")+'</p>';
  content+='<p>After submitting, compare against the original answer checker. Dice variants keep separate score/progress behavior.</p>';
 }
 return '<section class="ne41-sheet ne41-'+kind+'" aria-label="NVIDIA source-specific engineering equations · '+esc(head)+'"><header><small>'+esc(head)+' · ENGINEERING NOTEBOOK</small><h4>Real values · Stacked MathML · Railroad-track fractions</h4><p>'+esc(t?.title||"SLT learning")+' · Source-derived, read-only</p></header><div class="ne41-body">'+content+'</div></section>';
}
function renderInterview(q,t){
 if(!q)return "";
 const f=formula(q),sub=substitution(q),s=stepsFor(q),numeric=q.expected!==undefined&&Number.isFinite(Number(q.expected));
 const model=String(q.interviewAnswer||q.modelAnswer||s[s.length-1]||"");
 const context=String(q.question||"");
 return '<section class="ne41-sheet ne41-interview" aria-label="Question-specific NVIDIA engineering interview defense">'+
 '<header><small>🎤 INTERVIEW · QUESTION-SPECIFIC EVIDENCE</small><h4>Engineer answer → math → bench proof → disposition</h4><p>Proposed educational answer, not a claim of personal hardware experience.</p></header>'+
 '<div class="ne41-body"><p><b>Actual question:</b> '+esc(context)+'</p>'+
 '<p><b>1 · State the mechanism:</b> '+esc(s[0]||q.lesson?.summary||q.lesson||"Explain the physical or test mechanism first.")+'</p>'+
 (hasEq(f)?label("2 · Governing law (stacked MathML)",math(f)):'<p class="ne41-neutral">2 · Conceptual problem: establish a falsifiable measurement without inventing an unrelated numeric model.</p>')+
 (sub?label("3 · Current-question substitution (not a different question)",math(hasEq(sub)?sub:"Substitution = "+sub)):"")+
 (numeric?label("Calculated target from source data",'<strong>'+esc(q.expected+" "+(q.unit||""))+'</strong><p>Numerical teaching result, NOT actual validated DUT data.</p>'):"")+
 '<p><b>4 · Cross-check and isolate:</b> '+esc(s[2]||q.hints?.[1]||"Verify against an independent measurement or a known-good test configuration.")+'</p>'+
 '<p><b>5 · Engineer disposition:</b> '+esc(model||"Report PASS, FAIL or INVALID based only on documented limits and independent evidence.")+'</p>'+
 '</div></section>';
}

window.NVIDIA_SLT_EQUATION_NOTEBOOK_V41={version:"41.0",render,renderInterview,stepLine,numeratorRails,sceneSvg,formula,substitution,givens};
})();