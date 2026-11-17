"use strict";
/* v40 • Source-authored, unit-checked PARALLEL-X8 lesson. Educational model only.
 * All entries remain derived from 100 nominal 1-ohm resistors sharing two nodes.
 * No assumptions about temperature, safe bias, physical flight pins or test ownership.
 */
(function(){
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const eq=s=>typeof window.studyMath==="function"?window.studyMath(s,true):'<code>'+esc(s)+'</code>';
const card=(label,expr)=>'<div class="a40-equation"><small>'+esc(label)+'</small>'+eq(expr)+'</div>';
const note=s=>'<p class="a40-note">'+s+'</p>';
const steps=[
 {title:"Trace the real two-node circuit",body:"Mark +5V_MAIN and the common return. Each of the 100 resistor top terminals must connect to the SAME positive node and all bottom terminals to the SAME return node. Check every bank jumper; do not infer parallel connections from proximity.",eq:["V_branch = V_s = 5 V","N = 100 ; R_nom = 1 Ω"]},
 {title:"Healthy array: conductance, equivalent resistance, current and power",body:"For 100 equal connected branches, first add conductances, then invert. The <b>500 A and 2500 W</b> are hypothetical full-bias predictions, NOT an approved bench setting. Each 1 Ω branch at 5 V would dissipate 25 W.",eq:["1 / R_eq = 100 / (1 Ω) = 100 S","R_eq = (1 Ω) / 100 = 0.010 Ω","I_branch = (5 V) / (1 Ω) = 5 A","I_total = 100 * 5 A = 500 A","P_total = 5 V * 500 A = 2500 W"]},
 {title:"Identify opens separately from shorts without dividing by zero",body:"An ideal OPEN has zero conductance and carries zero current. An ideal SHORT makes the network resistance zero; its branch is NOT represented by an ordinary finite 1/0 term. Real bridges have finite milliohm resistance and their current depends on source current limit, wiring and contact resistance.",eq:["G_open = 0 S ; I_open = 0 A","R_short_ideal = 0 Ω ; R_eq_ideal = 0 Ω","G_no_short = N_healthy / R_nom"]},
 {title:"Use a Kelvin resistance measurement; show the lead-error arithmetic",body:"With 0.24 Ω total lead/contact resistance, a 2-wire reading for the ideal healthy bank is about 0.25 Ω. Kelvin four-wire sensing removes most lead-drop influence, subject to setup, offset and instrument resolution.",eq:["R_2wire = 0.010 Ω + 0.24 Ω = 0.250 Ω","Error_percent = (0.24 Ω) / (0.010 Ω) * 100 = 2400"]},
 {title:"Safely search for the short: show the current-limit computation",body:"POWER OFF first; inspect fuses, trace widths, jumper isolation and allowed injection sites. In the hypothetical <b>one 2 mΩ bridge + 99 healthy 1 Ω branches</b> model, a 2.5 A compliant supply settles near 4.17 mV. Only about <b>8.7 mW</b> is dissipated in the shorted bridge itself, so an IR hotspot is NOT guaranteed. Prioritize sectional isolation and Kelvin/mV gradients. No live test without approved PCB thermal/current limits.",eq:["G_fault = 99 / (1 Ω) + 1 / (0.002 Ω) = 599 S","R_fault = 1 / (599 S) = 0.00166945 Ω","V_fault = 2.5 A * 0.00166945 Ω = 0.00417362 V","I_short = (0.00417362 V) / (0.002 Ω) = 2.08681 A","P_short = 2.08681 A * 2.08681 A * 0.002 Ω = 0.00871 W","I_99healthy = 99 * 0.00417362 A = 0.413188 A","I_supply = 2.08681 A + 0.413188 A = 2.50 A","P_supply = 0.00417362 V * 2.5 A = 0.0104341 W"]},
 {title:"Isolate the suspect branch and prove the actual failure",body:"Measure rail gradients with the correct reference and high-resolution instrument. With supply OFF and capacitors discharged, disconnect the suspected bank or lift one pad only under an approved rework procedure. Out-of-circuit resistance near 0 Ω supports a short; then repeat to exclude additional shorts. R_eq at or above 10 mΩ is a SCREEN, not proof that every defect is absent.",eq:["R_eq_ideal = 0 Ω ; R_short_real = 0.002 Ω","R_eq_healthy = 0.010 Ω"]},
 {title:"After shorts are isolated, count opens using dimensionless units",body:"For 97 connected healthy branches, the expected resistance is 1/97 Ω = 10.309278 mΩ. Show the <b>Ω units cancel</b> in the ratio R_nom/R_eq; using rounded 10.309 mΩ gives approximately 97 healthy branches. A 1 V bias would draw roughly 97 A and dissipate ~97 W—do NOT describe it as a safe 2.5 A IR test. At 2.5 A total, voltage is only about 25.77 mV, so healthy branch heating (~0.66 mW) may be too faint for IR diagnosis.",eq:["R_97 = (1 Ω) / 97 = 0.010309278 Ω","N_healthy = (1 Ω) / (0.010309278 Ω) = 97","N_open = 100 - 97 = 3","V_2_5A = 2.5 A * 0.010309278 Ω = 0.0257732 V","P_branch_2_5A = (0.0257732 V)^2 / (1 Ω) = 0.000664 W"]},
 {title:"Verify each removed device and close the engineering loop",body:"Test suspected opens out-of-circuit with power OFF. After controlled rework, restore the approved jumper configuration and verify the aggregate four-wire resistance, each relevant bank, polarity, and independent observations. The allowable tolerance depends on the actual resistor specifications; document unmeasured/untested cases as unverified.",eq:["R_eq_final = (1 Ω) / 100 = 0.010 Ω","I_total = 100 * I_branch","P_source = 100 * P_branch"]}
];
const prefixRail='<div class="a40-rail" aria-label="Railroad track: ohms to milliohms; cross out ohms"><span class="a40-fraction"><span>0.010 <s>Ω</s></span><span>1</span></span><b>×</b><span class="a40-fraction"><span>1000 mΩ</span><span>1 <s>Ω</s></span></span><b>=</b><strong>10.0 mΩ</strong></div>';
const countRail='<div class="a40-rail" aria-label="Ohm units cancel when counting good branches"><span class="a40-fraction"><span>1 <s>Ω</s></span><span>0.010309278 <s>Ω</s></span></span><b>≈</b><strong>97 connected branches</strong></div>';
const mathGroup=arr=>arr.map((s,i)=>card("EQUATION "+(i+1)+" · STACKED MATHML",s)).join("");
function isCase(q){return !!q&&String(q.id||"").toLowerCase()==="parallel-x8";}
function renderStep(q,index){
 if(!isCase(q))return "";
 const s=steps[index];return s?'<section class="a40-step" data-a40-step="'+index+'"><p>'+s.body+'</p>'+mathGroup(s.eq)+(index===1?prefixRail:index===6?countRail:"")+'</section>':"";
}
function render(mode,q){
 if(q&&!isCase(q)&&!["muon","studio","guide"].includes(mode))return "";
 const section=(label,body)=>'<section class="a40-panel a40-'+esc(mode)+'" aria-label="'+esc(label)+'"><h4>'+esc(label)+'</h4>'+body+'</section>';
 switch(mode){
 case "understand":
   return section("Understand · actual circuit and units",
    note("Two shared physical nodes, 100 identical <b>1 Ω</b> branches, theoretical <b>5 V</b> source. The resistor-bank measurement is a training scenario, not an instruction to energize hardware.")+mathGroup(steps[1].eq.slice(0,3))+prefixRail);
 case "visual":
   return section("Diagram validation · topology before equations",
    note("All 100 connected branches must share +5V_MAIN and GND; opening a bank jumper changes N. Use the schematic to mark source/current reference and Kelvin probe points. No 500 A bench excitation.")+mathGroup(steps[1].eq.slice(0,2))+prefixRail+note("IR temperature colors in the simulator are model outputs, not measured thermal-camera evidence."));
 case "worked":
   return section("Complete original-question eight-step calculation and safe hardware checks",
    steps.map((s,i)=>'<details class="a40-expanded" '+(i===0?"open":"")+'><summary><b>Step '+(i+1)+'</b> · '+esc(s.title)+'</summary>'+renderStep({id:"parallel-X8"},i)+'</details>').join(""));
 case "evidence":
   return section("Worked evidence · equation → substitution → unit cancellation → check",
      mathGroup(["R_eq = (1 Ω) / 100 = 0.010 Ω","I_total = (5 V) / (0.010 Ω) = 500 A","N_healthy = (1 Ω) / (0.010309278 Ω) = 97","N_open = 100 - 97 = 3"])+prefixRail+countRail+note("500 A is theoretical only. Open count requires shorts isolated and known component values; verify suspected opens by sectional or out-of-circuit measurements."));
 case "bench":
   return section("Post-math engineering resolution · verified vs hypothetical",
      note("First power OFF and verify the topology. Select four-wire Kelvin sensing for milliohm totals. Identify suspect shorted banks by isolation and voltage gradients; IR localization is optional and not guaranteed at current-limited millivolt bias. Confirm isolated parts out-of-circuit before rework.")+
      mathGroup(["R_2wire = 0.010 Ω + 0.24 Ω = 0.250 Ω","V_fault = 2.5 A * 0.00166945 Ω = 0.00417362 V","N_open = 100 - (1 Ω) / (0.010309278 Ω) = 3"])+
      note("Do not use 1 V across a 10 mΩ intact bank while claiming a 2.5 A limit: that would request ~100 A. IR readings such as 25 °C and 60 °C require separately specified thermal resistance, emissivity, applied power and component power ratings."));
 case "lecture":
   return section("Professor lecture · why KCL and parallel conductance work",
      note("Think of 100 toll lanes joining the same two entrance/exit points. Voltage is equal across every connected branch. KCL adds branch currents. Conductances add for finite nonzero resistances; opens contribute zero, and ideal shorts require separate treatment.")+
      mathGroup(["1 / R_eq = 1 / R_1 + 1 / R_2 + 1 / R_3","I_total = I_1 + I_2 + I_3","R_eq = (1 Ω) / 100 = 0.010 Ω"])+prefixRail+note("The difference between <b>units</b> and <b>counts</b> matters: the ratio (1 Ω)/(0.010309 Ω) is dimensionless; count 97 branches, not 97 Ω."));
 case "interview":
 case "muon":
   return section("Hiring manager · precise 60-second answer and physical validation",
     '<blockquote class="a40-spoken">“I begin by tracing whether all 100 nominal 1 Ω resistors truly share the same pair of nodes. Their healthy equivalent is 10 mΩ. At 5 V this would theoretically draw 500 A and 2.5 kW, so I would never use that as a bench setting. I check the board and isolate banks with power off, then use four-wire Kelvin measurements because ordinary lead resistance masks milliohm differences. If a short is suspected, I would perform approved low-energy fault localization, use voltage gradients and isolation, and treat IR imaging as supporting evidence rather than guaranteed proof. Once shorts are separately ruled out, 10.309 mΩ corresponds to about 97 connected 1 Ω branches, meaning three opens. I verify each isolated fault, rework safely and confirm the final resistance and current budget.”</blockquote>'+
     mathGroup(["R_eq = (1 Ω) / 100 = 0.010 Ω","I_total = (5 V) / (0.010 Ω) = 500 A","N_open = 100 - (1 Ω) / (0.010309278 Ω) = 3"])+prefixRail+countRail);
 case "studio":
   return section("Hardware debug studio · worked proof & safe current-limit reality",
     mathGroup(["R_eq = (1 Ω) / 100 = 0.010 Ω","P_nominal = 5 V * 500 A = 2500 W","R_fault = 1 / (99 / (1 Ω) + 1 / (0.002 Ω))","V_fault = 2.5 A * 0.00166945 Ω = 0.00417362 V","P_short = 2.08681 A * 2.08681 A * 0.002 Ω = 0.00871 W","N_open = 100 - (1 Ω) / (0.010309278 Ω) = 3"])+prefixRail+countRail+
     note("Illustrative 2 mΩ model: about 8.7 mW dissipates in the bridge at a total 2.5 A; an IR hotspot is not guaranteed. Real measurements require approved contact resistance, board/net current limits, thermal specifications and instrumentation."));
 case "try":
   return section("Try it independently · never use the 500 A prediction as a test setting",
     note("Label all common nodes and every component. Write the reciprocal-parallel law. Convert Ω → mΩ with numerator/denominator units. Explain WHY 2-wire leads hide the result and why a current-limited rail does not necessarily warm a bridge. Do the arithmetic yourself before opening the worked reference.")+mathGroup(["R_eq = R_nom / N_healthy","I_branch = V_s / R_nom","I_total = N_healthy * I_branch"]));
 default:return "";
 }
}
window.AVIONICS_ARRAY_MATH_V40={version:"40.0",isCase,steps,render,renderStep,prefixRail,countRail};
})();