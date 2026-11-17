"use strict";
/* Circuit Railroad Whiteboard: original four-case teaching content.
   Unit rails are dimensionally valid; node and mesh solve circuit constraints.
   Reference examples are not current-question answer substitutions. */
(function(){
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const frac=(top,bottom)=>'<span class="rr-fraction"><span class="rr-top">'+top+'</span><span class="rr-rule"></span><span class="rr-bottom">'+bottom+'</span></span>';
const cancel=t=>'<span class="rr-cancel">'+t+'</span>';
const eq=s=>window.studyMath?window.studyMath(s,true):'<code>'+esc(s)+'</code>';
const cases=[
{id:"series",title:"01 · Series circuit",goal:"Same current through each element. Voltage drops add up.",givens:"100 V source; R₁ = 10 Ω; R₂ = 15 Ω; R₃ = 25 Ω.",steps:[
["Circle the givens, mark positive current arrow and return","Vₛ = 100 V. Three resistors in one continuous path; I is the same in every resistor.","I_1 = I_2 = I_3 = I"],
["Add resistance, showing small arithmetic","10 + 15 = 25; then 25 + 25 = 50 Ω. Series resistance adds directly.","R_T = 10 Ω + 15 Ω + 25 Ω = 50 Ω"],
["Solve the current as an actual fraction","100 ÷ 50 = 2. Use Ω = V/A to check that the answer is amperes.","I_T = (100 V) / (50 Ω) = 2 A"],
["Back-substitute each resistor's drop","10×2=20 V; 15×2=30 V; 25×2=50 V.","V_1 = 20 V ; V_2 = 30 V ; V_3 = 50 V"],
["KVL proof and final answer","20 + 30 + 50 = 100 V. If these do not sum to the source, recheck a resistor, polarity, or arithmetic.","20 V + 30 V + 50 V = 100 V"]],answers:["Rₜ = 50 Ω","Iₜ = 2 A","Drops: 20 V, 30 V, 50 V"],check:"KVL: 20 + 30 + 50 = 100 V",rail: "series"},
{id:"parallel",title:"02 · Parallel circuit",goal:"Same voltage across each branch. Currents add at junctions.",givens:"12 V source; R₁ = 6 Ω; R₂ = 12 Ω; R₃ = 4 Ω.",steps:[
["Label both shared nodes","All three resistor tops share node A (+12 V), all bottoms share node B (0 V). Each branch sees 12 V.","V_1 = V_2 = V_3 = 12 V"],
["Write the reciprocal equation — no shortcut","Use denominator 12: 1/6=2/12; 1/12=1/12; 1/4=3/12. Sum numerators: 2+1+3=6.","1 / R_T = 1 / 6 + 1 / 12 + 1 / 4 = 6 / 12 = 1 / 2"],
["Invert the reciprocal correctly","If 1/Rₜ=1/2 Ω⁻¹, then Rₜ=2 Ω. Never confuse 1/2 with 2.","R_T = 2 Ω"],
["Calculate total current and each branch current","12/2=6 A. Branch currents: 12/6=2 A; 12/12=1 A; 12/4=3 A.","I_T = 6 A ; I_1 = 2 A ; I_2 = 1 A ; I_3 = 3 A"],
["KCL proof and engineering sanity check","2+1+3=6 A. Equivalent parallel resistance (2 Ω) must be smaller than the smallest branch resistor (4 Ω).","2 A + 1 A + 3 A = 6 A"]],answers:["Rₜ = 2 Ω","Iₜ = 6 A","Branches: 2 A, 1 A, 3 A"],check:"KCL: 2 + 1 + 3 = 6 A",rail:"parallel"},
{id:"mixed",title:"03 · Mixed series–parallel",goal:"Reduce the parallel group, solve the source, expand and verify branches.",givens:"12 V source; R₁ = 1.0 kΩ in series with R₂ = 2.0 kΩ || R₃ = 3.0 kΩ.",steps:[
["Annotate the physical junction","Node S is at +12 V, resistor R₁ lies between S and A; R₂ and R₃ both connect node A to return B (0 V). The parallel branches share V_AB.","R_T = R_1 + (R_2 || R_3)"],
["Compute reciprocal fractions with common denominator","1/2000 = 3/6000 Ω⁻¹; 1/3000 = 2/6000 Ω⁻¹. Sum 5/6000=1/1200 Ω⁻¹; invert to 1200 Ω.","1 / R_P = 1 / 2000 + 1 / 3000 = 5 / 6000 = 1 / 1200"],
["Add the series resistor; convert prefixes with railroad tracks","Rₚ = 1200 Ω; R₁ = 1000 Ω; Rₜ = 2200 Ω. Show 2.2 kΩ × (1000 Ω / 1 kΩ) to cancel kΩ.","R_T = 1000 Ω + 1200 Ω = 2200 Ω"],
["Compute source current; keep powers of ten visible","Iₜ = 12/2200 A = 0.0054545 A. Convert ×1000 mA/A to get 5.4545 mA.","I_T = (12 V) / (2200 Ω) = 5.4545 mA"],
["Calculate voltage drops before splitting current","R₁ drop: (0.0054545 A)(1000 Ω)=5.4545 V. Hence parallel node A = 12−5.4545=6.5455 V.","V_1 = 5.4545 V ; V_A = 6.5455 V"],
["Split the parallel current using Ohm’s law","I₂ = 6.5455 V / 2000 Ω = 3.2727 mA; I₃ = 6.5455 V / 3000 Ω = 2.1818 mA.","I_2 = 3.2727 mA ; I_3 = 2.1818 mA"],
["Verify BOTH Kirchhoff laws","KCL: 3.2727+2.1818 ≈5.4545 mA. KVL: 5.4545+6.5455≈12 V. Small last-digit differences come from displayed rounding.","I_2 + I_3 = I_T ; V_1 + V_A = 12 V"]],answers:["Rₜ = 2.20 kΩ","Iₜ = 5.455 mA","V_A = 6.545 V","I₂ = 3.273 mA; I₃ = 2.182 mA"],check:"KCL 3.2727+2.1818=5.4545 mA; KVL 5.4545+6.5455=12 V",rail:"mixed"},
{id:"mesh",title:"04 · Two-loop / two-source network",goal:"Node-voltage and mesh-current independently solve the SAME circuit.",givens:"Vₛ₁ = 12 V through R₁ = 2 kΩ to node A; Vₛ₂ = 6 V through R₂ = 1 kΩ to A; R₃ = 1 kΩ from A to 0 V.",steps:[
["Draw every node and current direction","Left source-top S₁=12 V, right source-top S₂=6 V, return B=0 V, middle node A unknown. Define I₁ from S₁→A, I₂ from S₂→A, and I₃ from A→B.","I_1 + I_2 = I_3"],
["Apply KCL at A with branch voltage differences","Incoming from left: (12−V_A)/2000; incoming from right: (6−V_A)/1000; outgoing: V_A/1000. Express currents in consistent A units.","(12 - V_A) / 2000 + (6 - V_A) / 1000 = V_A / 1000"],
["Clear fractions by multiplying every term by 2000 Ω","First numerator stays 12−V_A; second doubles to 12−2V_A; right doubles to 2V_A. Collect terms: 24−3V_A=2V_A.","12 - V_A + 2*(6 - V_A) = 2*V_A"],
["Solve the unknown NODE voltage, then branch currents","24=5V_A, so V_A=4.8 V. Left: (12−4.8)/2k=3.6 mA. Right: (6−4.8)/1k=1.2 mA. Return branch: 4.8/1k=4.8 mA.","V_A = 4.8 V ; I_1 = 3.6 mA ; I_2 = 1.2 mA ; I_3 = 4.8 mA"],
["Re-solve as TWO MESHES using the shared resistor","Choose the left mesh clockwise and the right mesh counterclockwise; both traverse R₃ downward, so its branch current is i₁+i₂. KVL left: 2k i₁+1k(i₁+i₂)=12 V. Right: 1k i₂+1k(i₁+i₂)=6 V.","3*i_1 + i_2 = 12 ; i_1 + 2*i_2 = 6"],
["Show elimination, no skipped algebra","Multiply second equation by 3: 3i₁+6i₂=18. Subtract the first equation 3i₁+i₂=12, giving 5i₂=6, hence i₂=1.2 mA. Substitute: i₁=(12−1.2)/3=3.6 mA.","5*i_2 = 6 ; i_2 = 1.2 mA ; i_1 = 3.6 mA"],
["Verify current, voltage and POWER balances","KCL: 3.6+1.2=4.8 mA. Left KVL: 7.2+4.8=12 V; right KVL: 1.2+4.8=6 V. Supplied powers: 12×3.6+6×1.2=50.4 mW. Resistive losses: 25.92+1.44+23.04=50.4 mW.","P_{in} = 50.4 mW ; P_{resistors} = 50.4 mW"]],answers:["V_A = 4.80 V","I₁ = 3.60 mA","I₂ = 1.20 mA","I₃ = 4.80 mA"],check:"KCL 3.6+1.2=4.8 mA; KVL 7.2+4.8=12 V, 1.2+4.8=6 V; power in=out=50.4 mW",rail:"mesh"}
];
function rail(kind){
 const x=cancel, f=frac;
 let rows=[];
 const step=(title,body,why)=>'<div class="rr-rail-step"><strong>'+esc(title)+'</strong><div class="rr-rail-equation">'+body+'</div><small>'+esc(why)+'</small></div>';
 if(kind==="mixed"){
 rows.push(step("1 · kΩ → Ω. Put unwanted kΩ on the BOTTOM",f('2.2 '+x('kΩ'),'1')+' <b>×</b> '+f('1000 Ω','1 '+x('kΩ'))+' <b>=</b> 2200 Ω',"The same kΩ unit is crossed out diagonally. Multiply 2.2×1000=2200."));
 rows.push(step("2 · Voltage ÷ resistance → current",f('12 '+x('V'),'2200 '+x('Ω'))+' <b>×</b> '+f('1 A·'+x('Ω'),'1 '+x('V'))+' <b>=</b> 0.0054545 A',"Because 1 Ω = 1 V/A, the circuit equation leaves only amperes."));
 rows.push(step("3 · A → mA: cancel A then multiply numerators",f('0.0054545 '+x('A'),'1')+' <b>×</b> '+f('1000 mA','1 '+x('A'))+' <b>=</b> 5.4545 mA',"This rail is the unit-conversion stage; the current came from the circuit model."));
 }else if(kind==="mesh"){
 rows.push(step("1 · Mesh R₁: kΩ to Ω",f('2.0 '+x('kΩ'),'1')+' <b>×</b> '+f('1000 Ω','1 '+x('kΩ'))+' <b>=</b> 2000 Ω',"The chosen mesh branch is 2.0 kΩ, not the 2.2 kΩ used in the separate mixed-network case."));
 rows.push(step("2 · Difference of node potentials ÷ R₁",f('(12 − 4.8) '+x('V'),'2000 '+x('Ω'))+' <b>×</b> '+f('1 A·'+x('Ω'),'1 '+x('V'))+' <b>=</b> 0.0036 A',"KCL first establishes node A = 4.8 V. The left resistor therefore has 7.2 V across it."));
 rows.push(step("3 · Convert 0.0036 A to mA",f('0.0036 '+x('A'),'1')+' <b>×</b> '+f('1000 mA','1 '+x('A'))+' <b>=</b> 3.6 mA',"Unit cancellation is independent of circuit topology."));
 rows.push(step("4 · Current × resistance → voltage drop",f('3.6 '+x('mA'),'1')+' <b>×</b> '+f('1 A','1000 '+x('mA'))+' <b>×</b> '+f('2000 '+x('Ω'),'1')+' <b>×</b> '+f('1 V','1 '+x('A')+'·'+x('Ω'))+' <b>=</b> 7.2 V',"For R₁ only: 3.6 mA through 2 kΩ drops 7.2 V."));
 }else{
 rows.push(step("Volts / ohms yields amperes",f((kind==="series"?"100":"12")+' '+x('V'),(kind==="series"?"50":"2")+' '+x('Ω'))+' <b>×</b> '+f('1 A·'+x('Ω'),'1 '+x('V'))+' <b>=</b> '+(kind==="series"?"2":"6")+' A',"Use the physical identity 1 Ω = 1 V/A; it is not a chemical mole ratio."));
 }
 return '<div class="rr-rails">'+rows.join("")+'</div>';
}
function circuitSvg(kind){
 const base='<svg class="rr-circuit-svg" viewBox="0 0 690 255" role="img" aria-label="'+esc(kind)+' conceptual resistor schematic, reference nodes and current paths" xmlns="http://www.w3.org/2000/svg">';
 const txt=(x,y,s,c="#1e4665",size=16)=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+c+'" font-family="system-ui,sans-serif" font-weight="700">'+esc(s)+'</text>';
 const line=(d,c="#215d7f")=>'<path d="'+d+'" stroke="'+c+'" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
 const res=(x,y,w,s)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="28" rx="3" fill="#e8f8ed" stroke="#16866b" stroke-width="2.8"/>'+txt(x+6,y-7,s,"#12644c",15);
 let v=base+'<rect x="1" y="1" width="688" height="253" rx="12" fill="#f8fcff" stroke="#c5dbea"/>';
 if(kind==="series"){
 v+=line("M85 88 H139 M193 88 H257 M310 88 H374 M430 88 H534 V210 H85 V156");
 v+=res(139,74,54,"10 Ω")+res(257,74,53,"15 Ω")+res(374,74,56,"25 Ω");
 v+='<circle cx="85" cy="121" r="30" fill="#fff8e9" stroke="#ba8a39" stroke-width="3"/>'+txt(63,126,"100 V","#8b5924",14)+txt(325,52,"I = 2 A →","#a53e68",18)+txt(102,235,"B: return (0 V)");
 } else if(kind==="parallel"){
 v+=line("M130 72 H560 M130 197 H560 M130 72 V93 M130 154 V197");
 v+='<circle cx="130" cy="124" r="30" fill="#fff8e9" stroke="#ba8a39" stroke-width="3"/>'+txt(113,129,"12 V","#8b5924",14);
 for(const [x,r,cur] of [[255,"6 Ω","2 A"],[375,"12 Ω","1 A"],[495,"4 Ω","3 A"]]){v+=line("M"+x+" 72 V108 M"+x+" 136 V197")+res(x-22,108,44,r)+txt(x-19,166,cur,"#a53e68",15);}
 v+=txt(144,56,"Node A = +12 V")+txt(142,218,"Node B = 0 V");
 }else if(kind==="mixed"){
 v+=line("M90 84 H180 M257 84 H392 H535 M392 84 V111 M392 139 V202 M535 84 V111 M535 139 V202 M90 202 H535 M90 84 V96 M90 156 V202");
 v+='<circle cx="90" cy="125" r="30" fill="#fff8e9" stroke="#ba8a39" stroke-width="3"/>'+txt(73,130,"12 V","#8b5924",14);
 v+=res(180,70,77,"R₁ 1kΩ")+res(364,111,56,"R₂ 2kΩ")+res(506,111,56,"R₃ 3kΩ");
 v+=txt(400,59,"A = 6.545 V")+txt(288,65,"Iₜ →","#b33e68")+txt(345,234,"B = 0 V");
 }else{
 v+=line("M75 84 H168 M240 84 H334 M334 84 H426 M495 84 H600 M75 84 V97 M75 157 V203 H600 V157 M600 84 V97 M334 84 V108 M334 138 V203");
 v+='<circle cx="75" cy="127" r="30" fill="#fff8e9" stroke="#ba8a39" stroke-width="3"/><circle cx="600" cy="127" r="30" fill="#fff8e9" stroke="#ba8a39" stroke-width="3"/>';
 v+=txt(53,132,"12 V","#8b5924",14)+txt(581,132,"6 V","#8b5924",14)+res(168,70,72,"R₁ 2kΩ")+res(426,70,69,"R₂ 1kΩ")+res(306,108,56,"R₃ 1kΩ");
 v+=txt(314,51,"A = 4.8 V")+txt(105,62,"3.6 mA →","#b33e68",14)+txt(510,62,"← 1.2 mA","#b33e68",14)+txt(362,166,"4.8 mA ↓","#b33e68",14)+txt(328,233,"B = 0 V");
 }
 return v+"</svg>";
}
function matches(q,t,nvidia){
 const topic=String(t?.id||q?.topic||"").toLowerCase(),id=String(q?.id||"").toLowerCase(),title=String(t?.title||"").toLowerCase();
 if(["ohm","series","parallel","kirchhoff","electrical","mixed","mesh"].includes(topic))return true;
 if(/^(ohm|series|parallel|kirchhoff)-/.test(id))return true;
 return /(?:electrical foundations|circuit analysis|series and parallel circuits|basic electrical)/.test(title);
}
function render(q,t,nvidia=false){
 if(!matches(q,t,nvidia))return "";
 const topic=String(t?.id||q?.topic||"").toLowerCase(),cur=topic==="series"?"series":topic==="parallel"?"parallel":topic==="kirchhoff"?"mesh":"mixed";
 return '<section class="rr-whiteboard" aria-label="Railroad Tracks plus node mesh circuit analysis reference lesson">'+
 '<header><small>ENGINEERING WHITEBOARD LAB · FACTOR-LABEL × KIRCHHOFF</small><h3>Write fractions. Cancel units. Solve circuit structure. Verify every branch.</h3><p>A separate worked-reference notebook based on your railroad-track chemistry technique; these examples do not replace the selected question or its answer.</p></header>'+
 '<div class="rr-case-tabs" role="group" aria-label="Select a fully worked circuit example">'+cases.map(c=>'<button type="button" data-rr-case="'+c.id+'" aria-pressed="'+(c.id===cur)+'">'+esc(c.title)+'</button>').join("")+'</div>'+
 cases.map(c=>'<section class="rr-case" data-rr-panel="'+c.id+'" '+(c.id!==cur?'hidden':'')+'>'+
 '<div class="rr-case-title"><h4>'+esc(c.title)+'</h4><p>'+esc(c.goal)+'</p><p><b>GIVEN:</b> '+esc(c.givens)+'</p></div>'+
 circuitSvg(c.id)+
 '<div class="rr-lessons"><h5>Railroad Tracks — numerator / denominator, then strike canceled units</h5>'+rail(c.rail)+'</div>'+
 '<h5>Write every step on the whiteboard (expand individually)</h5><div class="rr-step-stack">'+c.steps.map((s,i)=>'<details '+(i===0?'open':'')+'><summary><b>Step '+(i+1)+'</b> '+esc(s[0])+'</summary><p>'+esc(s[1])+'</p><div class="rr-math">'+eq(s[2])+'</div></details>').join("")+'</div>'+
 '<div class="rr-answer"><b>Box the results</b><div>'+c.answers.map(s=>'<span>'+esc(s)+'</span>').join("")+'</div><p><strong>Independent check:</strong> '+esc(c.check)+'</p></div></section>').join("")+
 '<footer>Math method: factors cancel units; circuit method: KCL/KVL + Ohm. Mesh signs depend on the arrows you draw. Values are tutorial examples, not live avionics or NVIDIA measurements. Use an approved circuit diagram and instrument limits for real hardware.</footer></section>';
}
if(typeof document!=="undefined" && typeof document.addEventListener==="function"){
 document.addEventListener("click",ev=>{const btn=ev.target.closest?.("[data-rr-case]");if(!btn)return;const white=btn.closest(".rr-whiteboard");if(!white)return;white.querySelectorAll("[data-rr-case]").forEach(el=>el.setAttribute("aria-pressed",String(el===btn)));white.querySelectorAll("[data-rr-panel]").forEach(el=>el.hidden=el.dataset.rrPanel!==btn.dataset.rrCase);});
}
window.CIRCUIT_RAILROAD_WHITEBOARD={version:"1.0",cases,matches,render,circuitSvg,rail};
})();