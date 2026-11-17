"use strict";
/* OHM-F1 worked engineering interview + lecture sheet. Fictional measurements. */
(function(){
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const isF1=(q,nv)=>!nv&&String(q?.id||"").toLowerCase()==="ohm-f1"&&!q.variant;
function calc(V,R,VL,mA){
 [V,R,VL,mA]=[V,R,VL,mA].map(Number);
 if(![V,R,VL,mA].every(Number.isFinite)||V<=0||R<=0||VL<0||VL>V||mA<=0)return null;
 return {ideal:V/R*1000,observedR:VL/(mA/1000),lossV:V-VL,lossR:(V-VL)/(mA/1000),deficit:V/R*1000-mA,power:VL*mA};
}
const baseline=calc(5,220,3.3,15);
const spoken="Voltage is the potential difference between two specified nodes. In this training case, a five-volt source and a 220-ohm resistor should draw 22.73 milliamps. We measure only 15 milliamps, yet the resistor voltage is 3.30 volts. Dividing 3.30 by 0.015 confirms the load is 220 ohms. Kirchhoff’s Voltage Law leaves 1.70 volts unaccounted for elsewhere in series, equivalent to 113.3 ohms at that current. I would measure the individual cable, fixture, ammeter, and return voltage drops, then independently verify current to rule out ammeter burden. Once the actual source of loss is established, I would correct the verified problem, repeat the original operating conditions, and make a product disposition only using approved specifications and calibrated evidence.";
const steps=[
 ["01 · Physics and two defined nodes","Voltage is an energy difference per unit charge, not an isolated absolute reading. Mark supply node S, resistor input node A, return B; define the DMM's red/black lead pair before using the value.","ΔV = ΔU / q ; V_AB = V_A - V_B"],
 ["02 · Calculate the healthy ideal current","The hypothetical source is 5.00 V and the load is a single 220 Ω resistor. Predict current with Ohm's law, not with the definition of voltage. The ideal resistor voltage equals the source voltage ONLY if other series drops are negligible.","I_ideal = (5.00 V) / (220 Ω) = 22.73 mA"],
 ["03 · Validate the resistor against measured values","The actual 3.30 V differential drop and 15.0 mA current give exactly 220 Ω. An out-of-value load resistor is not the sole cause of the low current.","R_observed = (3.30 V) / (15.0 * 10^(-3) A) = 220 Ω"],
 ["04 · Isolate the missing voltage using KVL","The 5.00 V source minus 3.30 V across the resistor leaves 1.70 V elsewhere. At 15.0 mA that loss is equivalent to 113.3 Ω; it is NOT evidence of a physical component with that value.","V_loss = 5.00 V - 3.30 V = 1.70 V ; R_loss_eq = (1.70 V) / (0.0150 A) = 113.3 Ω"],
 ["05 · Design the bench measurement in electrical order","Check the approved schematic, safe ratings and powered-OFF shorts first. On an authorized development fixture, select a current limit justified by component ratings. Then measure source S−B, load A−B, cable contacts, meter, and return UNDER THE SAME LOAD. DMM voltage goes across nodes; current sensor goes in series or across a rated shunt.","V_SB = V_SA + V_AB"],
 ["06 · Test competing faults with independent instrumentation","A current-mode DMM can insert burden voltage into the loop. Compare against a correctly rated independent shunt/current probe; measure the voltage across the ammeter itself. Swap a verified cable or fixture ONE AT A TIME. Four-wire Kelvin ohms is normally for low resistance and never on a powered board; it is not required for a routine 220 Ω measurement.","V_burden = I * R_meter"],
 ["07 · Validate the correction by repeating the original condition","Repair the identified failure mechanism, not a guessed part. Re-run A/B/A with fixed firmware, load, temperature and supply; log raw V, I, test station and calibration. A healthy ideal result would approach 5.00 V on the resistor and 22.73 mA, subject to actual tolerance limits.","I_recheck_ideal = (5.00 V) / (220 Ω) = 22.73 mA"],
 ["08 · Defend a real engineering decision","Measured discrepancy: 7.73 mA less than the 22.73 mA ideal, 1.70 V not delivered to the nominal resistor. The fault location is unproven until segment drops and a controlled comparison agree. PASS/FAIL requires approved limits and uncertainty, otherwise classify INVALID/BLOCKED.","ΔI = 22.73 mA - 15.00 mA = 7.73 mA"]
];
const qa=[
 ["Why is ΔV=ΔU/q not sufficient to predict the current?","It defines potential difference (joules per coulomb). The resistor's I–V law provides I=V/R. You need the effective voltage across that resistor; 3.30/220=15 mA, not the 5 V source value."],
 ["Which number proves a voltage was lost elsewhere?","Source is 5.00 V while load A−B is 3.30 V. KVL gives 1.70 V residual. That is equivalent to 113.3 Ω at 15 mA, but I must physically locate the drop before naming its cause."],
 ["Could your ammeter itself be the culprit?","Yes. A series ammeter may introduce burden voltage. Measure across the meter, then independently observe current in an approved setup. If removing or replacing the meter eliminates the drop, it is test-method loading, not DUT silicon."],
 ["Would you use an N7020A for every measurement?","No. The Keysight N7020A is a single-ended low-noise power-rail probe for ripple/transients, not an ohmmeter or a floating differential probe. DMM voltage mode is appropriate for DC node differences; a suitably rated differential technique is needed across elevated shunts."],
 ["How does your A/B/A procedure actually isolate the cause?","A: preserve raw failing evidence. B: swap one known-good cable/fixture or measurement method while holding other variables fixed. A: restore and confirm the original signature returns. A fault following the DUT suggests a DUT-associated path, but is not automatic proof of defective silicon."],
 ["What could you tell a flight hardware review board?","Only that the training numbers mathematically imply an unlocalized 1.70 V drop. A flight GO/NO-GO needs real PCBA approved limits, calibrated raw data, uncertainty and verification of the proposed fix; no hypothetical number is a flight acceptance limit."]
];
const eq=s=>window.studyMath?window.studyMath(s,true):'<code>'+esc(s)+'</code>';
function resultHtml(x){
 if(!x)return '<strong>Invalid inputs:</strong> require positive finite source voltage, resistance, current, and 0 ≤ resistor voltage ≤ source voltage.';
 return '<div class="ohm-kpis">'+[
 ["Ideal current",x.ideal.toFixed(2)+" mA"],["Actual V/I",x.observedR.toFixed(2)+" Ω"],["KVL residual",x.lossV.toFixed(2)+" V"],["Equivalent loss",x.lossR.toFixed(1)+" Ω"],["Current shortfall",x.deficit.toFixed(2)+" mA"],["Resistor dissipation",x.power.toFixed(2)+" mW"]
 ].map(r=>'<div><small>'+r[0]+'</small><b>'+r[1]+'</b></div>').join("")+'</div><small>Values describe an ideal single-loop model at one operating point, not verified product measurements.</small>';
}
const cases={
 meter:"Station hypothesis: 1.70 V originates in the ammeter. Measure burden directly and check an independent calibrated current sensor on an approved isolated fixture. If the voltage drop follows the meter, correct the measurement method—not the DUT.",
 contact:"Fixture hypothesis: voltage is lost in a connector or return contact. Measure directly across that connection under load, swap one known-good cable/contact, then restore the original. If the drop follows the contact, inspect or repair that fixture element.",
 dut:"DUT-associated hypothesis: symptom follows the same board across two independently validated fixtures. Check the board input and return differential voltage, compare a golden DUT, then localize the affected PCB path. Do not automatically call this defective silicon.",
 invalid:"Evidence unresolved: preserve original raw logs and check setup/grounding, calibration, sensor loading, timestamps and repeatability. Without consistent measurements, classify INVALID/BLOCKED rather than inventing a product failure."
};
function renderReadiness(q){
 if(!isF1(q,false))return "";
 return '<section class="ohm-studio" aria-label="Muon OHM-F1 engineer interview solution"><header class="ohm-head"><small>🎤 MUON SPACE · AVIONICS HIRING-MANAGER READINESS · OHM-F1</small><h3>Prove the 1.70 V missing drop — from fundamentals to product-level verification</h3><p>Original OHM-F1 asks what voltage means. This additional 5 V fault case is hypothetical, NOT a captured Muon PCBA failure.</p></header>'+
 '<section class="ohm-speech"><strong>Part 1 · 60-second spoken engineering defense</strong><blockquote>'+esc(spoken)+'</blockquote></section>'+
 '<section class="ohm-summary">'+resultHtml(baseline)+'</section>'+
 '<details class="ohm-details" open><summary>Part 2 · Eight worked engineering steps, each with a derived equation</summary><div class="ohm-steps">'+
 steps.map((s,i)=>'<article class="ohm-step"><span class="ohm-num">'+(i+1)+'</span><div><h4>'+esc(s[0])+'</h4><p>'+esc(s[1])+'</p><div class="ohm-equation">'+eq(s[2])+'</div></div></article>').join("")+'</div></details>'+
 '<div class="ohm-tools"><section><h4>Calculation bench — change the scenario values</h4><p>Inputs are sandbox values only; this does not change canonical mastery or original question answers.</p><div class="ohm-inputs">'+
 [["Source V (V)","v",5],["Nominal R (Ω)","r",220],["Observed V across R (V)","vl",3.3],["Observed current (mA)","i",15]].map(a=>'<label>'+esc(a[0])+'<input data-ohm-input="'+a[1]+'" type="number" step="any" inputmode="decimal" value="'+a[2]+'"></label>').join("")+
 '</div><div class="ohm-live-output" aria-live="polite">'+resultHtml(baseline)+'</div></section><section><h4>Fault tree — select the outcome you measured</h4><div class="ohm-options">'+
 [["meter","Drop follows series ammeter"],["contact","Drop follows cable/fixture"],["dut","Failure follows the DUT"],["invalid","Instrument results disagree"]].map(a=>'<button type="button" data-ohm-path="'+a[0]+'" aria-pressed="false">'+a[1]+'</button>').join("")+
 '</div><div class="ohm-path-result" role="status" aria-live="polite">Select a measurement signature to see the hypothesis and falsification check.</div></section></div>'+
 '<details class="ohm-details" open><summary>Part 3 · Six hiring-manager follow-up questions with exact technical defenses</summary><div class="ohm-faq">'+qa.map((x,i)=>'<details '+(i===0?'open':'')+'><summary>Q'+(i+1)+': '+esc(x[0])+'</summary><p>'+esc(x[1])+'</p></details>').join("")+'</div></details>'+
 '<p class="ohm-note">No real Muon acceptance thresholds, actual flight-PCBA measurements, or board-specific pin numbers have been claimed. Do not connect Ω mode to a powered board or clip an earthed scope ground to an isolated/high-side node.</p></section>';
}
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{const inp=ev.target.closest&&ev.target.closest("[data-ohm-input]");if(!inp)return;const box=inp.closest(".ohm-studio");if(!box)return;let d={};box.querySelectorAll("[data-ohm-input]").forEach(el=>d[el.dataset.ohmInput]=el.value);box.querySelector(".ohm-live-output").innerHTML=resultHtml(calc(d.v,d.r,d.vl,d.i));});
 document.addEventListener("click",ev=>{let btn=ev.target.closest&&ev.target.closest("[data-ohm-path]");if(!btn)return;let box=btn.closest(".ohm-studio");if(!box)return;box.querySelectorAll("[data-ohm-path]").forEach(el=>el.setAttribute("aria-pressed",String(el===btn)));box.querySelector(".ohm-path-result").textContent=cases[btn.dataset.ohmPath]||"";});
}
// Each graphical operating point is calculated from V_across_load, never the supply alone.
function spreadSvg(){
 const X=v=>980+v*103,Y=i=>636-i*11;
 let o='<svg class="nb-spread-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2600 1400" role="img" aria-label="OHM-F1 genuine Ohm law graph, exact voltage drop fault model, and engineering worked derivation">';
 const rect=(x,y,w,h,fill,stroke="#c9d8e8")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2"/>';
 const tx=(x,y,t,size=19,color="#173c5a",weight=650)=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" font-family="Arial,sans-serif" fill="'+color+'" font-weight="'+weight+'">'+esc(t)+'</text>';
 const lines=(text,x,y,n=62,dy=29,color="#23425a")=>{let out="",row="",i=0;for(let w of text.split(/\s+/)){if((row+" "+w).length>n){out+=tx(x,y+i*dy,row,17,color,550);row=w;i++}else row+=(row?" ":"")+w;}if(row)out+=tx(x,y+i*dy,row,17,color,550);return out;};
 const panel=(x,y,w,h,t,c="#184e77")=>rect(x,y,w,h,"#fff")+rect(x,y,w,53,c,c)+tx(x+16,y+34,t,19,"#fff",800);
 o+=rect(0,0,2600,1400,"#f0f5fa","#f0f5fa")+rect(0,0,2600,100,"#143c5b","#143c5b")+tx(45,49,"OHM-F1 · VOLTAGE DEFINITION → 1.70 V KVL LOSS → ENGINEER VERIFICATION",32,"#fff",850)+tx(45,80,"Illustrative training case · NO real Muon avionics product trace or acceptance specification",17,"#bdeaf3",650);
 o+=rect(35,117,2530,88,"#fff")+tx(60,150,"QUESTION: Define voltage and specify how to measure a regulator output with respect to its return.",21,"#195a86",750)+tx(60,183,"CASE: Vs=5.00 V · R=220 Ω · Iobserved=15.0 mA · Vload=3.30 V. Find and isolate the missing voltage.",21);
 o+=panel(35,224,820,510,"1 · CIRCUIT TOPOLOGY & DIFFERENTIAL NODES");
 o+='<path d="M154 425 V340 H320 M418 340 H570 M685 340 H785 V568 H154 V492" stroke="#236386" stroke-width="5" fill="none"/>';
 o+='<circle cx="154" cy="461" r="35" fill="#fff3df" stroke="#a87728" stroke-width="4"/>'+tx(131,462,"5 V",21,"#925c18",800);
 o+=rect(320,321,98,39,"#fae7df","#c27757")+tx(319,303,"R_loss,eq*",18,"#a65330",800)+tx(323,391,"113.3 Ω",19,"#a65330",700);
 o+=rect(570,321,115,39,"#e1f6e9","#1d8564")+tx(575,304,"Rload",19,"#157453",800)+tx(588,393,"220 Ω",20,"#157453",750);
 o+=tx(282,330,"S",22)+tx(503,330,"A",22)+tx(779,599,"B",22);
 o+='<circle cx="290" cy="340" r="6" fill="#1891b9"/><circle cx="520" cy="340" r="6" fill="#1891b9"/><circle cx="785" cy="568" r="6" fill="#1891b9"/>';
 o+=tx(450,283,"I=15.0 mA  →",20,"#be4874",800)+tx(536,456,"V(A−B)=3.30 V",20,"#148c82",800);
 o+=tx(65,648,"Vs(B−S)=5.00 V   |   KVL residual: 1.70 V",19,"#204963",750)+lines("*113.3 Ω is equivalent missing series loss, not a verified physical part.",65,691,69,23,"#a45535");
 o+=panel(875,224,840,510,"2 · TRUE I–V CURVE (220 Ω RESISTOR)","#0e6977");
 for(let v=0;v<=5;v++){let x=X(v);o+='<path d="M'+x+' 339 V636" stroke="#e2edf4"/>'+tx(x-5,660,String(v),15);}
 for(let i=0;i<=25;i+=5){let y=Y(i);o+='<path d="M980 '+y+' H1580" stroke="#e2edf4"/>'+tx(933,y+5,String(i),15);}
 o+='<path d="M980 334 V636 H1580" stroke="#24445b" fill="none" stroke-width="3"/>';
 o+='<path d="M'+X(0)+' '+Y(0)+' L'+X(5.4)+' '+Y(5.4/220*1000)+'" stroke="#0894c7" stroke-width="5" fill="none"/>';
 for(let p of [[5,5/220*1000,"#15996f"],[3.3,15,"#d64375"]]){o+='<path d="M'+X(p[0])+' 636 V'+Y(p[1])+' H980" stroke="'+p[2]+'" stroke-width="2" stroke-dasharray="8 5" fill="none"/><circle cx="'+X(p[0])+'" cy="'+Y(p[1])+'" r="9" fill="'+p[2]+'"/>';}
 o+=tx(1042,317,"I = V_AB / R   (slope = 4.545 mA/V)",18,"#156b8a",750)+tx(1145,700,"Resistor voltage V_AB (V)",20)+tx(900,296,"I (mA)",18)+tx(1090,408,"Ideal: 5.00 V, 22.73 mA",19,"#127b5d",750)+tx(1080,473,"Observed: 3.30 V, 15.0 mA",19,"#b33868",750);
 o+=panel(1735,224,830,510,"3 · POWERED CHECKS / PROBE ORDER");
 o+=lines("1. POWER OFF: compare wiring/return and inspect for shorts. Never use Ω mode on powered circuits.",1762,319,68,27);
 o+=lines("2. On an authorized development fixture set an approved current limit; confirm Vs at source terminals.",1762,411,68,27);
 o+=lines("3. Measure DC V in parallel at A−B and each connection. Independently measure current and ammeter burden.",1762,512,68,27);
 o+=lines("4. N7020A: only when measuring dynamic rail ripple. Use a proper low-inductance grounded connection.",1762,613,68,27);
 o+=panel(35,758,820,606,"4 · SOLVE THE ENGINEERING EQUATIONS","#225b87");
 let rows=["ΔV=ΔU/q ; V_AB=V_A−V_B","Iideal=5.00/220=22.73 mA","Robserved=3.30/0.0150=220 Ω","Vloss=5.00−3.30=1.70 V","Rloss,eq=1.70/0.0150=113.3 Ω","ΔI=22.73−15.00=7.73 mA"];
 rows.forEach((s,i)=>{o+=rect(64,846+i*75,750,61,i===3||i===4?"#fff0e8":"#ecf5fb")+tx(86,885+i*75,s,22,i===3||i===4?"#aa4d26":"#214e72",750);});
 o+=panel(875,758,840,606,"5 · DISCRIMINATE THE CAUSE","#155e50");
 let rr=[["Meter burden?","Measure 1.70 V loss across ammeter; compare independent sensor."],["Fixture/cable?","Measure connection drop under load; swap one known-good part."],["DUT-associated?","Repeat the signature on independent validated fixture."],["Invalid data?","Check ground reference, calibration and raw logs."]];
 rr.forEach((x,i)=>{o+=rect(903,846+i*117,781,98,"#eefaf5")+tx(920,877+i*117,x[0],21,"#13634f",800)+lines(x[1],920,908+i*117,72,24);});
 o+=panel(1735,758,830,606,"6 · HIRING-MANAGER CONCLUSION","#6f3c61");
 o+=lines("I expected 22.73 mA, but measured 15.0 mA. With 3.30 V on the resistor, its effective value is 220 Ω. KVL exposes an unlocalized 1.70 V drop. I would check ammeter burden, fixture voltage loss and return connections; change one factor at a time and rerun identical conditions after the verified fix.",1766,849,70,27);
 o+=rect(1765,1165,766,168,"#fff0f3","#ddaeb9")+tx(1788,1204,"ROOT CAUSE NOT YET CONFIRMED",21,"#9b3454",850)+lines("This is a synthetic case. GO/NO-GO requires approved limits, controlled test conditions, calibrated evidence and validated corrective action.",1788,1243,70,27,"#775269");
 return o+"</svg>";
}
function renderSpread(q){
 if(!isF1(q,false))return "";
 return '<section class="nb-spread-wrap ohm-sheet" aria-label="OHM-F1 solved engineering lecture sheet"><div class="nb-spread-toolbar"><div class="nb-spread-title-group"><span class="nb-spread-pill">OHM-F1 · COMPLETE ENGINEERING WORKED LECTURE</span><strong>Voltage between nodes · exact I–V curve · KVL defect localization · hiring-manager defense</strong></div><div class="nb-spread-actions"><button type="button" class="nb-spread-btn" data-prof-dl-png="OHM-F1_verified_training_solution.png">Download .PNG Sheet</button><button type="button" class="nb-spread-btn secondary" data-prof-zoom-nb="1">Fullscreen view</button></div></div><div class="nb-spread-canvas">'+spreadSvg()+'</div><p class="ohm-note">The x-axis is voltage ACROSS the resistor, not supply voltage; both operating points lie on the same 220 Ω I–V law. All values are illustrative and the 113.3 Ω loss has not been physically localized.</p></section>';
}
window.OHM_F1_ENGINEER_STUDIO={isF1,calc,baseline,spoken,steps,qa,renderReadiness,renderSpread};
})();