"use strict";
/* v42: question-verified numerical proof. Source q.math is produced by
 * nvidia_slt_math.js and recomputed from current canonical/dice givens.
 * No change to score, IDs or local progress. No unmeasured bench claims. */
(function(){
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]));
const fmt=v=>Number(Number(v).toPrecision(8)).toString();
const m=(s)=>window.studyMath?window.studyMath(String(s||""),true):'<code>'+e(s)+'</code>';
const box=(label,html)=>'<div class="ne42-calc"><strong>'+e(label)+'</strong>'+html+'</div>';
const unit=(x,s)=>'<mrow><mn>'+e(fmt(x))+'</mn><mspace width=".25em"/><mi mathvariant="normal">'+e(s)+'</mi></mrow>';
const row=s=>'<mrow>'+s+'</mrow>',op=s=>'<mo>'+e(s)+'</mo>';
const fraction=(a,b)=>'<mfrac>'+row(a)+row(b)+'</mfrac>';
const equals=(...a)=>'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">'+row(a.join(op("=")))+'</math>';
const strike=u=>'<menclose notation="updiagonalstrike"><mi mathvariant="normal">'+e(u)+'</mi></menclose>';
const msup=(base,power)=>'<msup><mn>'+e(base)+'</mn><mn>'+e(power)+'</mn></msup>';
function mathSource(q){return q?.math&&typeof q.math==="object"?q.math:null;}
function valid(q){return !!(mathSource(q)&&q.questionType==="number"&&Number.isFinite(Number(q.expected)));}
function data(q){
 const c=mathSource(q);if(!c)return null;
 const given=window.CIRCUIT_CURRENT_QUESTION_RAILROAD?.extractQuantities?.(q.question||"")||[];
 return {c,given,method:c.method||q.operation||"",target:Number(q.expected),u:String(q.unit||c.unit||""),q};
}
function fracCon(result,from,to,ratio){
 // Physical unit cancellation: result already calculated in "from"; scale
 // by (ratio "to") / (1 "from"). The two "from" labels cancel.
 const converted=Number(result)*ratio;
 return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">'+row(
 unit(result,from)+op("×")+fraction('<mn>'+e(ratio)+'</mn><mspace width=".2em"/><mi mathvariant="normal">'+e(to)+'</mi>',
 '<mn>1</mn>'+strike(from))+op("=")+unit(converted,to)
 )+'</math>';
}
function nativeRule(symbol,qty){
 return box(symbol,qty);
}
function prefix(q){
 const d=data(q);if(!d)return "";
 const rr=window.CIRCUIT_CURRENT_QUESTION_RAILROAD;
 const prefixed=d.given.filter(g=>g.power!==0);
 let parts=prefixed.slice(0,8).map(g=>box("Given "+g.raw+" · factor-label to base SI",rr?.rail?.(g)||""));
 // Explicit OUTPUT conversion matters even if all input givens are in SI.
 if(["current","parallel"].includes(d.method)&&d.u==="mA"){
  const val=d.target/1000;
  parts.push(box("Required answer unit: A → mA · cancel A",fracCon(val,"A","mA",1000)));
 }else if(d.method==="droop"&&d.u==="mV"){
  const val=d.target/1000;
  parts.push(box("Required answer unit: V → mV · cancel V",fracCon(val,"V","mV",1000)));
 }else if(d.method==="shunt"){
  parts.push(box("Both milli (10⁻³) prefixes cancel in voltage / resistance",
   equals(fraction(unit(d.given.find(g=>g.unit==="mV")?.value??0,"mV"),unit(d.given.find(g=>g.unit==="mΩ")?.value??0,"mΩ")),
     fraction('<mn>1</mn>'+strike("mV"),'<mn>1</mn>'+strike("mΩ"))))); // visual convention: output proof below is primary
 }else if(d.method==="rc"){
  parts.push(box("kΩ × µF → ms from the powers of ten",
    equals(msup("10","3")+op("×")+msup("10","−6")+op("×")+msup("10","3"),'<mn>1</mn>')));
 }
 if(!parts.length)return '<p class="ne42-neutral">Inputs and answer already use compatible units; no additional SI scaling is needed.</p>';
 return parts.join("");
}
const match=(p,re)=>String(p||"").match(re);
function solved(q){
 const d=data(q);if(!d)return null;
 const {c,method,target,u}=d,p=c.prompt||q.question||"",arr=[],limits=[];
 const make=(lbl,s)=>arr.push(box(lbl,typeof s==="string"?m(s):s));
 if(method==="current"){
  const g=match(p,/([\d.]+)\s*V rail drives a\s*([\d.]+)\s*Ω load/i);
  if(g){
   const v=+g[1],r=+g[2],i=v/r;
   make("1 · Source voltage, load and ground reference",m("V_s = "+v+" V ; R_L = "+r+" Ω"));
   make("2 · Ohm's law: units V/Ω become A",equals('<mi>I</mi>',fraction(unit(v,"V"),unit(r,"Ω")),unit(i,"A")));
   make("3 · Railroad-track output conversion (A cancels)",fracCon(i,"A","mA",1000));
   make("4 · Independent check, multiply back by R",equals(unit(v,"V"),row(unit(i,"A")+op("×")+unit(r,"Ω"))));
   make("5 · Power budget before using actual equipment",equals('<mi>P</mi>',row(unit(v,"V")+op("×")+unit(i,"A")),unit(v*i,"W")));
   limits.push("A 175 Ω resistor carrying 4 V would dissipate about 0.0914 W. Its power rating, supply current limit and measurement reference must be checked before an actual test.");
  }
 }else if(method==="parallel"){
  const g=match(p,/([\d.]+)\s*V supply drives\s*([\d.]+)\s*Ω in series with\s*\(([\d.]+)\s*Ω in parallel with\s*([\d.]+)\s*Ω\)/i);
  if(g){
   const v=+g[1],rs=+g[2],ra=+g[3],rb=+g[4],rp=ra*rb/(ra+rb),rt=rs+rp,i=v/rt;
   make("1 · Verify actual two-node parallel topology",m("R_s = "+rs+" Ω ; R_a = "+ra+" Ω ; R_b = "+rb+" Ω"));
   make("2 · Reduce parallel branch FIRST (stacked numerator/denominator)",equals('<msub><mi>R</mi><mi>p</mi></msub>',fraction(row(unit(ra,"Ω")+op("×")+unit(rb,"Ω")),row(unit(ra,"Ω")+op("+")+unit(rb,"Ω"))),unit(rp,"Ω")));
   make("3 · Add SERIES resistance",m("R_total = "+rs+" Ω + "+fmt(rp)+" Ω = "+fmt(rt)+" Ω"));
   make("4 · Ohm's law → A",equals('<mi>I</mi>',fraction(unit(v,"V"),unit(rt,"Ω")),unit(i,"A")));
   make("5 · Railroad output conversion (A → mA)",fracCon(i,"A","mA",1000));
   make("6 · KVL check, the two voltage drops sum to supply",m("V_s = "+fmt(i*rs)+" V + "+fmt(i*rp)+" V = "+v+" V"));
   limits.push("Only the two resistors sharing exactly both endpoints are parallel. The extra series resistance is not bypassed.");
  }
 }else if(method==="power"){
  const g=match(p,/([\d.]+)\s*V and draws\s*([\d.]+)\s*mA/i);
  if(g){const v=+g[1],ia=+g[2]/1000;
   make("1 · Source voltage and load current",m("V = "+v+" V ; I = "+g[2]+" mA"));
   make("2 · A valid stacked railroad-track milliampere-to-ampere conversion",
     fracCon(+g[2],"mA","A",.001));
   make("3 · Electrical load power P = VI",equals('<mi>P</mi>',row(unit(v,"V")+op("×")+unit(ia,"A")),unit(v*ia,"W")));
   limits.push("Rated dissipations and regulator efficiency must be checked separately; output P is not necessarily input power.");
  }
 }else if(method==="shunt"){
  const g=match(p,/([\d.]+)\s*mΩ resistance and\s*([\d.]+)\s*mV across it/i);
  if(g){const r=+g[1],v=+g[2];
   make("1 · Kelvin shunt voltage and resistance",m("V_sense = "+v+" mV ; R_shunt = "+r+" mΩ"));
   make("2 · Same milli prefix cancels: (mV)/(mΩ) = A",
    equals('<mi>I</mi>',fraction(row(unit(v,"mV")),row(unit(r,"mΩ"))),
      fraction(row(unit(v/1000,"V")),row(unit(r/1000,"Ω"))),unit(v/r,"A")));
   make("3 · Voltage-back check",m(fmt(v/r)+" A * "+r+" mΩ = "+v+" mV"));
   limits.push("Use Kelvin sense connections and verify shunt power/current ratings; a 2-wire lead measurement is not equivalent.");
  }
 }else if(method==="droop"){
  const g=match(p,/Nominal core rail\s*=\s*([\d.]+)\s*V;\s*worst load minimum\s*=\s*([\d.]+)\s*V/i);
  if(g){const v=+g[1],low=+g[2],dv=v-low;
   make("1 · Peak rail voltage compared with minimum",m("V_nom = "+v+" V ; V_min = "+low+" V"));
   make("2 · Voltage difference in V",m("ΔV = "+v+" V - "+low+" V = "+fmt(dv)+" V"));
   make("3 · V → mV, cancel V",fracCon(dv,"V","mV",1000));
   limits.push("Measured droop depends on probe ground path, bandwidth, trigger and synchronized loading; do not call a DUT FAIL without an approved limit.");
  }
 }else if(method==="rc"){
  const g=match(p,/R=([\d.]+)\s*kΩ and C=([\d.]+)\s*µF/i);
  if(g){const r=+g[1],cap=+g[2],t=(r*1000)*(cap*1e-6);
   make("1 · Two source quantities need base SI conversion",m("R = "+r+" kΩ ; C = "+cap+" µF"));
   make("2 · R·C: ohms × farads = seconds",m("τ = ("+r+" * 10^3 Ω) * ("+cap+" * 10^(-6) F) = "+fmt(t)+" s"));
   make("3 · s → ms, cancel seconds",fracCon(t,"s","ms",1000));
   limits.push("One RC time constant is 63.2% of an ideal charging transition; tolerances and leakage can change actual timing.");
  }
 }
 if(!arr.length){
   const formula=String(q.formula||c.formula||"");
   const expression=String(c.expression||"");
   make("1 · Authored governing law (no fabricated example)",m(formula.split(";")[0]||""));
   if(expression){
     const clean=!/\b(?:Math\.|Function|constructor)\b/.test(expression)&&!/[{};]/.test(expression);
     make("2 · Selected numeric arithmetic "+(clean?"and stored target":"(code expression, not an algebraic formula)"),
      clean?m(expression+" = "+fmt(target)+" "+u):'<code>'+e(expression)+'</code>');
   }
   limits.push(c.check||"Compare against the approved measurement specification and independently verify the result.");
 }
 if(c.check)limits.push(c.check);
 return {d,arr,limits};
}
function render(q,t,stage){
 if(!valid(q))return "";
 const d=data(q),info=solved(q),tryMode=stage==="try";
 let parts='<div class="ne42-current"><b>Exact selected question</b><p>'+e(q.question||"")+'</p><p><b>Requested answer unit:</b> '+e(q.unit||"")+'</p></div>';
 if(tryMode){
  parts+='<p>Derive the answer before revealing the worked solution. The symbolic equation and prefix identity below do not disclose the stored target.</p>';
  const sf=String(q.formula||d.c.formula||"").split(";")[0];
  parts+=sf?box("Governing law, symbols only",m(sf)):"";
  parts+='<p>Remember: 1 mA = 10⁻³ A, 1 mV = 10⁻³ V. Convert the result to the unit the question requests.</p>';
 }else{
  parts+='<p>First identify which physical quantities the units describe; then follow every arithmetic stage and independently verify the result before any bench action.</p>';
  parts+=info.arr.join("");
  parts+=box("Engineering factor-label conversions (including OUTPUT units)",prefix(q));
  parts+=box("Independent engineering limits and sanity checks",'<ul>'+info.limits.map(s=>'<li>'+e(s)+'</li>').join("")+'</ul>');
 }
 if(stage==="visual"&&!tryMode){
  // Exact math in the figure is a rendered MathML/SVG overlay from the same selected source; never imply measured traces.
  parts+='<p class="ne42-neutral">These quantities and derivations belong to the selected problem. Any other generic waveform/SVG elsewhere on this page is an illustrative schematic, not an acquired DUT measurement.</p>';
 }
 return '<section class="ne41-sheet ne42-proof ne42-'+e(stage)+'" aria-label="NVIDIA v42 original-question calculated proof"><header><small>QUESTION-VERIFIED WHITEBOARD · '+e((d.method||"").toUpperCase())+'</small><h4>Numerator / denominator · struck-out units · Kirchhoff/Ohm checks</h4><p>'+e(t?.title||"NVIDIA SLT")+' · uses canonical or selected dice values</p></header><div class="ne41-body">'+parts+'</div></section>';
}
function interview(q,t){
 if(!valid(q))return "";
 const info=solved(q);
 return '<section class="ne41-sheet ne42-interview"><header><small>INTERVIEW · EXPLAIN THIS ACTUAL CALCULATION</small><h4>Problem → mathematical proof → safe bench validation</h4></header><div class="ne41-body"><p><b>Prompt:</b> '+e(q.question)+'</p>'+
 info.arr.join("")+
 '<p><b>Interpretation:</b> '+e(info.limits[0]||"Verify from source inputs, then compare against an independently specified target.")+'</p>'+
 '<p><b>Disposition:</b> The number is a theoretical teaching prediction, not a measured NVIDIA GPU result. I would record voltage, current reference, instrument setup, uncertainty and a suitable independent check before claiming a real hardware PASS/FAIL.</p></div></section>';
}
window.NVIDIA_SLT_MATH_PROOFS_V42={version:"42.0",valid,data,prefix,solved,render,interview,fracCon};
})();