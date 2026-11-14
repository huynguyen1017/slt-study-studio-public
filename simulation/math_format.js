"use strict";
/* Native MathML renderer. No external JS, fonts, CDN, or math image assets. */
(function(){
const enc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const subs={"₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9"};
const pat=/[A-Za-zΓγΔδθτπΩΣ]+(?:_[A-Za-z0-9]+)*[₀₁₂₃₄₅₆₇₈₉]*|\d+(?:\.\d+)?|[ΓγΔδθτπΩΣ]|[₀₁₂₃₄₅₆₇₈₉]+|[=≈≥≤<>+\-−*/×·^()√]|./gu;
function tokens(src){
 return (String(src).match(pat)||[]).map(t=>t.trim()).filter(Boolean);
}
function mi(s){
 if(/^\d+(?:\.\d+)?$/.test(s))return "<mn>"+enc(s)+"</mn>";
 if(s.startsWith("√"))return "<mo>"+enc(s)+"</mo>";
 let base=s,under="";
 if(s.includes("_")){let n=s.indexOf("_");base=s.slice(0,n);under=s.slice(n+1)}
 else {let m=s.match(/^([A-Za-zΓγΩ]+)([₀₁₂₃₄₅₆₇₈₉]+)$/u);if(m){base=m[1];under=[...m[2]].map(x=>subs[x]).join("")}}
 const root="<mi>"+enc(base)+"</mi>";
 return under?"<msub>"+root+"<mtext>"+enc(under)+"</mtext></msub>":root;
}
function build(src){
 const a=tokens(src);
 let i=0;
 function prim(){
  let t=a[i++];if(t===undefined)return "<mrow/>";
  if(t==="("){
    let inner=cmp();
    if(a[i]===")")i++;
    return "<mrow><mo>(</mo>"+inner+"<mo>)</mo></mrow>";
  }
  if(t==="√")return "<msqrt>"+prim()+"</msqrt>";
  if(t==="-"||t==="−")return "<mrow><mo>−</mo>"+prim()+"</mrow>";
  if(t==="+")return prim();
  if(/^[A-Za-zΓγΔδΩΣ]/u.test(t)||/^\d/.test(t))return mi(t);
  return "<mo>"+enc(t)+"</mo>";
 }
 function pow(){
  let v=prim();
  while(a[i]==="^"){i++;v="<msup>"+v+prim()+"</msup>"}
  return v;
 }
 function mult(){
  let v=pow();
  while(["/","*","×","·"].includes(a[i])){
   let op=a[i++],next=pow();
   v=op==="/"?"<mfrac>"+v+next+"</mfrac>":"<mrow>"+v+"<mo>"+(op==="*"||op==="×"?"×":"·")+"</mo>"+next+"</mrow>";
  }
  return v;
 }
 function add(){
  let v=mult();
  while(["+","-","−"].includes(a[i])){
   let op=a[i++];v="<mrow>"+v+"<mo>"+(op==="+"?"+":"−")+"</mo>"+mult()+"</mrow>";
  }
  return v;
 }
 function cmp(){
  let v=add();
  while(["=","≈","≥","≤","<",">"].includes(a[i])){
   let op=a[i++];v="<mrow>"+v+"<mo>"+enc(op)+"</mo>"+add()+"</mrow>";
  }
  return v;
 }
 let body=cmp();
 while(i<a.length)body+="<mo>"+enc(a[i++])+"</mo>";
 return body;
}
function render(src,display=false){
 return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="'+(display?"block":"inline")+'" class="math-'+(display?"display":"inline")+'" aria-label="'+enc(src)+'">'+build(src)+'</math>';
}
const patterns=[
 [/f_knee\s*≈\s*0\.5\s*\/\s*t_rise/g,"f_knee ≈ 0.5/t_rise"],
 [/Γ\s*=\s*\(Z_L\s*[−-]\s*Z₀\)\s*\/\s*\(Z_L\s*\+\s*Z₀\)/g,"Γ = (Z_L − Z₀)/(Z_L + Z₀)"],
 [/V_L\s*=\s*L\s*[·×]\s*dI\s*\/\s*dt/g,"V_L = L·dI/dt"],
 [/V_diff\s*=\s*V_P\s*[−-]\s*V_N/g,"V_diff = V_P − V_N"],
 [/T_clk\s*≥\s*T_clk_to_Q\s*\+\s*T_comb_max\s*\+\s*t_su\s*[−-]\s*T_skew/g,"T_clk ≥ T_clk_to_Q + T_comb_max + t_su − T_skew"],
 [/T_clk_to_Q\s*\+\s*T_comb_min\s*≥\s*t_h\s*\+\s*T_skew/g,"T_clk_to_Q + T_comb_min ≥ t_h + T_skew"],
 [/P\(t\)\s*=\s*V\(t\)\s*×\s*\(V_sense\(t\)\s*\/\s*R_sense\)/g,"P(t) = V(t) × (V_sense(t)/R_sense)"],
 [/P\(t\)\s*=\s*V\(t\)\s*[×*]\s*I\(t\)/g,"P(t) = V(t) × I(t)"],
 [/I\s*=\s*V_sense\s*\/\s*R_sense/g,"I = V_sense/R_sense"],
 [/P\s*=\s*V\s*[×*]\s*I\b/g,"P = V×I"],
 [/f0\s*=\s*1\s*\/\s*T\b/g,"f₀ = 1/T"],
 [/f\s*=\s*1\s*\/\s*T\b/g,"f = 1/T"],
 [/tRC\s*≥\s*tRAS\s*\+\s*tRP/g,"tRC ≥ tRAS+tRP"],
 [/V_L\s*=\s*L\s*·\s*dI\/dt/g,"V_L = L·dI/dt"],
 [/ΓL\s*=\s*\(RL\s*[−-]\s*Z₀\)\s*\/\s*\(RL\s*\+\s*Z₀\)/g,"Γ_L = (R_L − Z₀)/(R_L + Z₀)"],
 [/Vlaunch\s*=\s*Z₀\s*\/\s*\(Rsrc\s*\+\s*Z₀\)/g,"V_launch = Z₀/(R_src + Z₀)"],
 [/Vfirst\s*=\s*Vlaunch\s*\(1\s*\+\s*ΓL\)/g,"V_first = V_launch×(1 + Γ_L)"],
 [/½\s*·?\s*L\s*·?\s*I(?:²|\^2)/g,"0.5×L×I^2"],
 [/½\s*·?\s*C\s*·?\s*V(?:²|\^2)/g,"0.5×C×V^2"],
 [/Itrace(?:²|\^2)\s*·\s*Radd/g,"I_trace^2×R_add"],
 [/C\s*·\s*VRX/g,"C×V_RX"],
 [/VRX\s*\/\s*200/g,"V_RX/200"],
 [/Vsource\s*[−-]\s*VTX/g,"V_source − V_TX"],
 [/VTX\s*[−-]\s*VbeforeL/g,"V_TX − V_beforeL"],
 [/VbeforeL\s*[−-]\s*VRX/g,"V_beforeL − V_RX"]
];
function textMath(s){
 s=String(s??"");
 let matches=[];
 for(let [regex,formula] of patterns){
  regex.lastIndex=0;for(const m of s.matchAll(regex))matches.push({start:m.index,end:m.index+m[0].length,formula});
 }
 matches.sort((a,b)=>a.start-b.start || b.end-a.end);
 let out="",end=0;
 for(const m of matches){if(m.start<end)continue;out+=enc(s.slice(end,m.start))+render(m.formula);end=m.end}
 return out+enc(s.slice(end));
}
window.studyMath=render;
window.studyMathText=textMath;
window.studyMathPatterns=patterns.length;
})();
