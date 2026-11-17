"use strict";
/* Native MathML renderer + ENGR 852 HW1/HW2 Stacked Equation Block Formatter.
   No external JS, fonts, CDN, or math image assets. */
(function(){
const enc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const subs={"₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9"};
const pat=/[A-Za-zΓγΔδθτπΩΣλφωμµℓ][A-Za-z0-9Ωμµ₀₁₂₃₄₅₆₇₈₉]*(?:_[A-Za-z0-9Ωμµ₀₁₂₃₄₅₆₇₈₉]+)*|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[ΓγΔδθτπΩΣλφωμ∫]+|[₀₁₂₃₄₅₆₇₈₉]+|\|\||>>|<<|==|[=≈≥≤≠≪≫<>+\-−*/×·^(),;:|{}\[\]√∥→⇒]|./gu;
const UNIT_EXPLICIT=new Set(["Ω","MΩ","kΩ","mΩ","μF","mF","nF","pF","uF","μH","mH","nH","pH","μA","mA","nA","pA","mV","kV","MV","μV","nV","μW","mW","kW","MW","μs","ms","ns","ps","μJ","mJ","kJ","μC","mC","nC","pC","Hz","kHz","MHz","GHz","dB","dBm","dBc","kg","Wb","At","rad","sr","mol","cd"]);
const UNIT_SINGLE=new Set(["A","V","W","F","H","C","J","S","s","m","K","g","N","T"]);
const UNIT_AFTER_NUM=new Set([...UNIT_EXPLICIT,...UNIT_SINGLE]);
const ROMAN_WORDS=new Set(["ln","log","sin","cos","tan","max","min","exp","PASS","FAIL","FAIL_DUT","ERROR_STATION","NO_GO","PCBA","EGSE","DUT","KGB","KGS","HITL","Verify","Validate","Isolate","Abort","sha256","Invalid_config"]);

function normalizeFormula(src){
 let s=String(src??"").trim();
 s=s
  .replace(/µ/g,"μ")
  .replace(/\bGamma_L\b|\bGammaL\b/g,"Γ_L")
  .replace(/\bGamma_S\b|\bGammaS\b/g,"Γ_S")
  .replace(/\bGamma\b/g,"Γ")
  .replace(/\bDelta_V\b|\bDeltaV\b/g,"ΔV")
  .replace(/\bDelta_U\b|\bDeltaU\b/g,"ΔU")
  .replace(/\bDelta_I\b|\bDeltaI\b/g,"ΔI")
  .replace(/\bDelta_t\b|\bDeltat\b/g,"Δt")
  .replace(/\bDelta_f\b|\bDeltaf\b/g,"Δf")
  .replace(/\bDelta_T/g,"ΔT")
  .replace(/\bDelta\b/g,"Δ")
  .replace(/\bomega_0\b|\bomega0\b/g,"ω₀")
  .replace(/\bomega\b/g,"ω")
  .replace(/\btau\b/g,"τ")
  .replace(/\bpi\b/g,"π")
  .replace(/\btheta\b/g,"θ")
  .replace(/\bsigma\b/g,"σ")
  .replace(/\bepsilon\b/g,"ε")
  .replace(/\bzeta\b/g,"ζ")
  .replace(/\beta\b/g,"η")
  .replace(/\bMOhm\b/g,"MΩ")
  .replace(/\bkOhm\b/g,"kΩ")
  .replace(/\bmOhm\b/g,"mΩ")
  .replace(/\bOhm\b/g,"Ω")
  .replace(/\buF\b/g,"μF")
  .replace(/\buH\b/g,"μH")
  .replace(/\buA\b/g,"μA")
  .replace(/\bus\b/g,"μs")
  .replace(/\buJ\b/g,"μJ")
  .replace(/\bZ0\b/g,"Z₀")
  .replace(/\bf0\b/g,"f₀")
  .replace(/\bV0\b/g,"V₀")
  .replace(/\bR1\b/g,"R₁")
  .replace(/\bR2\b/g,"R₂")
  .replace(/\bR3\b/g,"R₃")
  .replace(/\bR4\b/g,"R₄")
  .replace(/\bRT\b/g,"R_T")
  .replace(/\bR23\b/g,"R₂₃")
  .replace(/\bl_crit\b/g,"ℓ_crit")
  .replace(/\bexp\s*\(/g,"e^(")
  .replace(/\blog10\b/g,"log_10")
  .replace(/\blog2\b/g,"log_2")
  .replace(/\bsqrt\s*\(/g,"√(")
  .replace(/\|\|/g,"∥")
  .replace(/>>/g,"≫")
  .replace(/<</g,"≪")
  .replace(/==/g,"=")
  .replace(/<=/g,"≤")
  .replace(/>=/g,"≥")
  .replace(/!=/g,"≠")
  .replace(/~=/g,"≈")
  .replace(/=>/g,"⇒")
  .replace(/->/g,"→");
 return s;
}

function tokens(src){
 return (normalizeFormula(src).match(pat)||[]).map(t=>t.trim()).filter(Boolean);
}

function mi(s){
 const sci=s.match(/^(\d+(?:\.\d+)?)[eE]([+-]?\d+)$/);
 if(sci){
  const exp=Number(sci[2]);
  const expXml=exp<0?"<mrow><mo>−</mo><mn>"+Math.abs(exp)+"</mn></mrow>":"<mn>"+exp+"</mn>";
  return "<mrow><mn>"+enc(sci[1])+"</mn><mo>×</mo><msup><mn>10</mn>"+expXml+"</msup></mrow>";
 }
 if(/^\d+(?:\.\d+)?$/.test(s))return "<mn>"+enc(s)+"</mn>";
 if(s==="√"||s==="∫")return "<mo>"+enc(s)+"</mo>";
 if(UNIT_EXPLICIT.has(s)||ROMAN_WORDS.has(s))return '<mi mathvariant="normal">'+enc(s)+"</mi>";
 if(s==="log_10"||s==="log_2")return '<msub><mi mathvariant="normal">log</mi><mn>'+s.split("_")[1]+'</mn></msub>';
 let base=s,under="";
 if(s.includes("_")){
  let n=s.indexOf("_");
  base=s.slice(0,n);
  under=s.slice(n+1);
 }else{
  let m=s.match(/^([A-Za-zΓγΔδθτπΩΣω]+)([₀₁₂₃₄₅₆₇₈₉]+)$/u);
  if(m){base=m[1];under=[...m[2]].map(x=>subs[x]).join("");}
  else{
   let md=s.match(/^([A-Za-z]+)(\d+)$/);
   if(md&&md[1].length<=2){base=md[1];under=md[2];}
  }
 }
 if(!under){
  let md=base.match(/^([A-Za-z]+)(\d+)$/);
  if(md&&md[1].length<=2){base=md[1];under=md[2];}
 }else{
  let md=base.match(/^([A-Za-z]+)(\d+)$/);
  if(md&&md[1].length<=2){base=md[1];under=md[2]+","+under;}
 }
 if(under.includes("_")){
  under=under.replace(/_/g,",");
 }
 const root=(ROMAN_WORDS.has(base)||UNIT_EXPLICIT.has(base))?'<mi mathvariant="normal">'+enc(base)+"</mi>":"<mi>"+enc(base)+"</mi>";
 return under?"<msub>"+root+"<mtext>"+enc(under)+"</mtext></msub>":root;
}

function stripOuterParens(xml){
 const prefix="<mrow><mo>(</mo>";
 const suffix="<mo>)</mo></mrow>";
 if(xml.startsWith(prefix)&&xml.endsWith(suffix)){
  // Ensure the leading '(' matches the trailing ')' rather than closing earlier
  const inner=xml.slice(prefix.length,xml.length-suffix.length);
  let depth=0,balanced=true;
  const tok=inner.match(/<mo>\(<\/mo>|<mo>\)<\/mo>/g)||[];
  for(let i=0;i<tok.length;i++){
   depth+=tok[i]==="<mo>(</mo>"?1:-1;
   if(depth<0){balanced=false;break;}
  }
  if(balanced&&depth===0)return inner.includes("<mrow>")?inner:"<mrow>"+inner+"</mrow>";
 }
 return xml;
}

function build(src){
 const a=tokens(src);
 let i=0;
 function hasClosingBar(pos){
  let d=0;
  for(let j=pos;j<a.length;j++){
   const tok=a[j];
   if(tok==="("||tok==="{"||tok==="[")d++;
   else if(tok===")"||tok==="}"||tok==="]"){if(d===0)return false;d--;}
   else if(d===0&&tok==="|"&&j>pos)return true;
   else if(d===0&&[";",",","=","≈","≥","≤","≠","≪","≫","→","⇒"].includes(tok))return false;
  }
  return false;
 }
 function commaList(){
  let inner=cmp();
  while(a[i]===","){i++;inner="<mrow>"+inner+'<mo>,</mo><mspace width="0.2em"/>'+cmp()+"</mrow>";}
  return inner;
 }
 function prim(){
  let t=a[i++];if(t===undefined)return "<mrow/>";
  if(t==="("){
   if(a[i]===")"){i++;return "<mrow><mo>(</mo><mo>)</mo></mrow>";}
   let inner=commaList();
   if(a[i]===")")i++;
   return "<mrow><mo>(</mo>"+inner+"<mo>)</mo></mrow>";
  }
  if(t==="{"){
   let inner=commaList();
   if(a[i]==="}")i++;
   return "<mrow><mo>{</mo>"+inner+"<mo>}</mo></mrow>";
  }
  if(t==="|"&&hasClosingBar(i)){
   let inner=cmp();
   if(a[i]==="|")i++;
   return "<mrow><mo>|</mo>"+inner+"<mo>|</mo></mrow>";
  }
  if(t==="√")return "<msqrt>"+stripOuterParens(prim())+"</msqrt>";
  if(t==="∫")return "<mrow><mo>∫</mo>"+prim()+"</mrow>";
  if(t==="-"||t==="−")return "<mrow><mo>−</mo>"+prim()+"</mrow>";
  if(t==="+")return prim();
  if(/^[A-Za-zΓγΔδθτπΩΣλφωμℓ]/u.test(t)||/^\d/.test(t)){
   let node=mi(t);
   while(a[i]==="("){
    i++;
    if(a[i]===")"){i++;node="<mrow>"+node+"<mo>(</mo><mo>)</mo></mrow>";}
    else{
     let inner=commaList();
     if(a[i]===")")i++;
     node="<mrow>"+node+"<mo>(</mo>"+inner+"<mo>)</mo></mrow>";
    }
   }
   return node;
  }
  return "<mo>"+enc(t)+"</mo>";
 }
 function pow(){
  let v=prim();
  while(a[i]==="^"){i++;v="<msup>"+v+stripOuterParens(prim())+"</msup>";}
  if(a[i]&&UNIT_AFTER_NUM.has(a[i])&&/<(?:mn|msup)\b/.test(v)){
   v="<mrow>"+v+'<mspace width="0.22em"/><mi mathvariant="normal">'+enc(a[i++])+"</mi></mrow>";
  }
  return v;
 }
 function mult(){
  let v=pow();
  while(["/","*","×","·","∥"].includes(a[i])){
   let op=a[i++],next=pow();
   if(op==="/"){
    v="<mfrac>"+stripOuterParens(v)+stripOuterParens(next)+"</mfrac>";
   }else{
    const sym=op==="∥"?"∥":(op==="*"||op==="×"?"×":"·");
    v="<mrow>"+v+"<mo>"+sym+"</mo>"+next+"</mrow>";
   }
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
  while(["=","≈","≥","≤","≠","<",">","≫","≪","→","⇒"].includes(a[i])){
   let op=a[i++];v="<mrow>"+v+"<mo>"+enc(op)+"</mo>"+add()+"</mrow>";
  }
  return v;
 }
 function seq(){
  let v=cmp();
  while([",",";","|",":"].includes(a[i])){
   let op=a[i++];
   const sp=op===","?'<mspace width="0.55em"/>':'<mspace width="0.35em"/>';
   v="<mrow>"+v+"<mo>"+enc(op)+"</mo>"+sp+cmp()+"</mrow>";
  }
  return v;
 }
 let body=seq();
 while(i<a.length)body+="<mo>"+enc(a[i++])+"</mo>";
 return body;
}

function render(src,display=false){
 const inner=build(src);
 const row=inner.startsWith("<mrow>")&&inner.endsWith("</mrow>")?inner:"<mrow>"+inner+"</mrow>";
 return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="'+(display?"block":"inline")+'" class="math-'+(display?"display":"inline")+'" aria-label="'+enc(src)+'">'+row+'</math>';
}

function deriveWorkedExample(eqString,noteString){
 const s=(eqString+" "+noteString).toLowerCase();
 if(/gamma_l|gamma|refl/.test(s))return {
  sub:"For Z₀ = 50 Ω and Open load (Z_L → ∞): Γ_L = +1.0 → V_refl = +1.0 × V_inc (doubles at RX!). For Matched Z_L = 50 Ω: Γ_L = (50 − 50)/(50 + 50) = 0.",
  box:"Matched Z_L = 50 Ω ⇒ Γ_L = 0, V_refl = 0 V"
 };
 if(/f_knee|l_crit|t_rise/.test(s))return {
  sub:"Example: t_rise = 0.35 ns, FR-4 v_p = 15 cm/ns → f_knee = 0.5 / 0.35 ns = 1.43 GHz; l_crit = (0.35 × 15) / 4 = 1.31 cm.",
  box:"Trace > l_crit ⇒ Distributed Transmission Line (Treat as Z₀)"
 };
 if(/v_l|di\/dt|droop/.test(s))return {
  sub:"Example: L_pkg = 0.5 nH, ΔI = 12 A in Δt = 4 ns → V_L = 0.5 nH × (12 A / 4 ns) = 1.5 V transient drop if un-decoupled.",
  box:"Keep dI/dt bounded & L_loop minimal via on-die/BGA decaps"
 };
 if(/t_clk|t_setup|t_hold|t_cq|slack/.test(s))return {
  sub:"HW2 Check: t_CQ,min = 300 ps, t_MUX,min = 30 ps vs t_hold,max + t_skew = 400 + 750 = 1150 ps → Slack = 330 − 1150 = −820 ps.",
  box:"Hold is a SAME-EDGE race ⇒ Slowing f_clk cannot fix it; insert delay buffers!"
 };
 if(/r_t|r23|r1|voltage divider|ohm/.test(s))return {
  sub:"Tech 60 Lab 7: R₂₃ = (1000 × 470)/(1000 + 470) = 319.73 Ω → R_T = 330 + 319.73 + 220 = 869.73 Ω → I_T = 9 V / 869.73 Ω = 10.35 mA.",
  box:"R_T = 869.73 Ω · I_T = 10.35 mA (Breadboard Error: 1.26%)"
 };
 if(/rc|0\.693|half/.test(s))return {
  sub:"Phys 2B: R_eq = R₁ ∥ R_DVM = 22 MΩ ∥ 10 MΩ = 6.875 MΩ, C = 0.47 μF → τ = R_eq × C = 3.23 s → t_1/2 = 0.693 × 3.23 s = 2.24 s.",
  box:"Include 10 MΩ DVM loading in R_eq whenever measuring high-Z RC!"
 };
 if(/v_diff|r_sense|shunt|power/.test(s))return {
  sub:"Keysight 1169B + N7020A: V_diff = 55 mV across R_sense = 5 mΩ → I = 55 mV / 5 mΩ = 11.0 A; @ V_rail = 0.88 V → P = 9.68 W.",
  box:"I(t) = V_diff(t) / R_sense · P(t) = V_CH2(t) × I(t)"
 };
 return null;
}

function stripNotesParentheses(raw){
 // Split clean formula parts before trailing prose annotations like "(10-90%)" when appropriate
 const cleaned=String(raw||"").replace(/\s*\(10[-–]90%\)/g,"").trim();
 return cleaned;
}

function renderEquationCard(eqString,noteString,card){
 const rawParts=String(eqString||"").split(/\s*\|\s*/).map(x=>x.trim()).filter(Boolean);
 const eqBlocks=rawParts.map(part=>{
  const expr=stripNotesParentheses(part);
  // If expression has trailing descriptive words after comma/prose, split cleanly
  const mML=render(expr,true);
  return '<div class="hw-eq-item nb-typeset-equation">'+mML+'<div class="hw-eq-ascii-fallback nb-equation-source" aria-hidden="true">'+enc(part)+'</div></div>';
 }).join("");
 const derived=deriveWorkedExample(eqString,noteString);
 return '<div class="hw-eq-wrap">'+
  '<div class="hw-eq-head"><span>Σ SYMBOLIC EQUATION · STACKED MATHML</span><small>ENGR 852 Notebook Typesetting</small></div>'+
  '<div class="hw-eq-grid">'+eqBlocks+'</div>'+
  (noteString?'<div class="hw-eq-sub"><strong>Meaning & Boundary:</strong> '+textMath(noteString)+'</div>':'')+
  (derived?'<div class="hw-eq-step"><strong>Substitution Example:</strong> '+textMath(derived.sub)+'</div><div class="hw-eq-verdict">✓ '+textMath(derived.box)+'</div>':'')+
 '</div>';
}

const patterns=[
 [/Gamma_L\s*=\s*\(Z_L\s*[−-]\s*Z0\)\s*\/\s*\(Z_L\s*\+\s*Z0\)/g,"Γ_L = (Z_L − Z₀)/(Z_L + Z₀)"],
 [/Gamma_L\s*=\s*\(Z_L\s*[−-]\s*Z₀\)\s*\/\s*\(Z_L\s*\+\s*Z₀\)/g,"Γ_L = (Z_L − Z₀)/(Z_L + Z₀)"],
 [/Γ_?L?\s*=\s*\(Z_L\s*[−-]\s*Z₀\)\s*\/\s*\(Z_L\s*\+\s*Z₀\)/g,"Γ = (Z_L − Z₀)/(Z_L + Z₀)"],
 [/V_refl\s*=\s*Gamma_L\s*\*\s*V_inc/g,"V_refl = Γ_L × V_inc"],
 [/f_knee\s*[≈=]\s*0\.5\s*\/\s*t_rise/g,"f_knee ≈ 0.5/t_rise"],
 [/l_crit\s*=\s*\(t_rise\s*\*\s*v_p\)\s*\/\s*4/g,"ℓ_crit = (t_rise × v_p)/4"],
 [/V_L\s*=\s*L\s*[·×*]\s*dI\s*\/\s*dt/g,"V_L = L·dI/dt"],
 [/V_diff\s*=\s*V_P\s*[−-]\s*V_N/g,"V_diff = V_P − V_N"],
 [/T_clk\s*[≥>]=?\s*T_clk_to_Q\s*\+\s*T_comb_max\s*\+\s*t_su\s*[−-]\s*T_skew/g,"T_clk ≥ T_clk_to_Q + T_comb_max + t_su − T_skew"],
 [/T_clk_to_Q\s*\+\s*T_comb_min\s*[≥>]=?\s*t_h\s*\+\s*T_skew/g,"T_clk_to_Q + T_comb_min ≥ t_h + T_skew"],
 [/P\(t\)\s*=\s*V\(t\)\s*[×*]\s*\(V_sense\(t\)\s*\/\s*R_sense\)/g,"P(t) = V(t) × (V_sense(t)/R_sense)"],
 [/P\(t\)\s*=\s*V\(t\)\s*[×*]\s*I\(t\)/g,"P(t) = V(t) × I(t)"],
 [/I\s*=\s*V_sense\s*\/\s*R_sense/g,"I = V_sense/R_sense"],
 [/I\s*=\s*Vsense\s*\/\s*Rsense/g,"I = V_sense/R_sense"],
 [/I_T\s*=\s*V_s\s*\/\s*R_T/g,"I_T = V_s/R_T"],
 [/P\s*=\s*V\s*[×*]\s*I\b/g,"P = V×I"],
 [/f0\s*=\s*1\s*\/\s*T\b/g,"f₀ = 1/T"],
 [/f\s*=\s*1\s*\/\s*T\b/g,"f = 1/T"],
 [/tRC\s*≥\s*tRAS\s*\+\s*tRP/g,"t_RC ≥ t_RAS+t_RP"],
 [/ΓL\s*=\s*\(RL\s*[−-]\s*Z₀\)\s*\/\s*\(RL\s*\+\s*Z₀\)/g,"Γ_L = (R_L − Z₀)/(R_L + Z₀)"],
 [/Vlaunch\s*=\s*Z₀\s*\/\s*\(Rsrc\s*\+\s*Z₀\)/g,"V_launch = Z₀/(R_src + Z₀)"],
 [/Vfirst\s*=\s*Vlaunch\s*\(1\s*\+\s*ΓL\)/g,"V_first = V_launch×(1 + Γ_L)"],
 [/t_1\/2\s*=\s*0\.693\s*[×*·]\s*R_eq\s*[×*·]\s*C/g,"t_½ = 0.693×R_eq×C"],
 [/½\s*·?\s*L\s*·?\s*I(?:²|\^2)/g,"0.5×L×I^2"],
 [/½\s*·?\s*C\s*·?\s*V(?:²|\^2)/g,"0.5×C×V^2"],
 [/Itrace(?:²|\^2)\s*·\s*Radd/g,"I_trace^2×R_add"],
 [/C\s*·\s*VRX/g,"C×V_RX"],
 [/VRX\s*\/\s*200/g,"V_RX/200"],
 [/Vsource\s*[−-]\s*VTX/g,"V_source − V_TX"],
 [/VTX\s*[−-]\s*VbeforeL/g,"V_TX − V_beforeL"],
 [/VbeforeL\s*[−-]\s*VRX/g,"V_beforeL − V_RX"],
 [/\bI\s*=\s*V\s*\/\s*R\b/g,"I = V / R"],
 [/\bV\s*=\s*I\s*[×*·]\s*R\b/g,"V = I * R"],
 [/\bR\s*=\s*V\s*\/\s*I\b/g,"R = V / I"],
 [/\bQ\s*=\s*C\s*[×*·]?\s*V\b/g,"Q = C * V"],
 [/\bτ\s*=\s*R\s*[×*·]?\s*C\b/g,"τ = R * C"],
 [/\bτ\s*=\s*L\s*\/\s*R\b/g,"τ = L / R"],
 [/\bV\s*=\s*L\s*[×*·]?\s*dI\s*\/\s*dt\b/g,"V = L * (dI / dt)"],
 [/1\s*\/\s*\(2\s*π\s*R\s*C\)/g,"1 / (2 * π * R * C)"],
 [/1\s*\/\s*\(2\s*π\s*√\(?L\s*[×*·]?\s*C\)?\)/g,"1 / (2 * π * √(L * C))"],
 [/\bI_N\s*=\s*V_th\s*\/\s*R_th\b/g,"I_N = V_th / R_th"],
 [/\bV_s\s*\/\s*V_p\s*=\s*N_s\s*\/\s*N_p\b/g,"V_s / V_p = N_s / N_p"],
 [/\bI²R\b|\bI\^2\s*[×*·]?\s*R\b/g,"I^2 * R"],
 [/10\^\(?([+-]?\d+)\)?/g,(m)=>m],
 [/\d+(?:\.\d+)?[eE][+-]?\d+\b/g,(m)=>m],
 [/1\s*[−-]\s*e(?:⁻¹|\^\(?-1\)?)/g,"1 - e^(-1)"]
];

function textMath(s){
 s=String(s??"");
 let matches=[];
 for(let [regex,formula] of patterns){
  regex.lastIndex=0;
  for(const m of s.matchAll(regex)){
   const f=typeof formula==="function"?formula(m[0]):formula;
   matches.push({start:m.index,end:m.index+m[0].length,formula:f});
  }
 }
 matches.sort((a,b)=>a.start-b.start || b.end-a.end);
 let out="",end=0;
 for(const m of matches){
  if(m.start<end)continue;
  out+=enc(s.slice(end,m.start))+render(m.formula);
  end=m.end;
 }
 return out+enc(s.slice(end));
}

const ENG_PREFIX={12:"T",9:"G",6:"M",3:"k",0:"","-3":"m","-6":"µ","-9":"n","-12":"p"};
function formatEngineeringParts(val){
 if(!Number.isFinite(val))return null;
 if(val===0)return {mantissa:"0",exp:0,prefix:""};
 const sign=val<0?-1:1;
 const abs=Math.abs(val);
 let exp3=Math.floor(Math.log10(abs)/3)*3;
 if(exp3>12)exp3=12;
 if(exp3<-12)exp3=-12;
 const scaled=sign*(abs/Math.pow(10,exp3));
 const mantissa=Number(scaled.toPrecision(4)).toString();
 return {mantissa,exp:exp3,prefix:ENG_PREFIX[String(exp3)]||""};
}

function formatEngineeringMath(val,unit=""){
 const p=formatEngineeringParts(val);
 if(!p)return render("0");
 const u=String(unit||"").trim();
 const expr=p.exp===0?p.mantissa:`${p.mantissa} * 10^(${p.exp})`;
 const inner='<mrow>'+build(expr)+(u?'<mspace width="0.28em"/><mtext>'+enc(u)+'</mtext>':"")+'</mrow>';
 return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" class="math-inline" aria-label="'+enc(expr+(u?" "+u:""))+'">'+inner+'</math>';
}

window.studyMath=render;
window.studyMathText=textMath;
window.studyMathEquationCard=renderEquationCard;
window.studyMathPatterns=patterns.length;
window.formatEngineeringParts=formatEngineeringParts;
window.formatEngineeringMath=formatEngineeringMath;
})();
