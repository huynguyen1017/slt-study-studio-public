"use strict";
(function(){
const runs=window.SLT_FAULT_RUNS||[];
const RATING=0.25, AMBIENT=25, THETA=110, TAU=2, DAMAGE=155;
function temp(power,seconds){return AMBIENT+power*THETA*(1-Math.exp(-seconds/TAU))}
function safe(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function circuit(run,secs){
 const power=run.resistor_power_w,t=temp(power,secs),risk=t>=DAMAGE;
 const level=risk?"#f04d59":power>RATING?"#eba83f":"#57c9a7";
 const glow=risk?'<g class="fault-vapor"><path d="M300 104 Q278 83 301 66 Q320 47 300 31" stroke="#b6b5b5" fill="none" stroke-width="6"/><path d="M320 105 Q344 81 324 63 Q309 41 329 22" stroke="#9d9d9d" fill="none" stroke-width="5"/></g>':'';
 return '<svg class="fault-svg" viewBox="0 0 760 260" role="img" aria-label="Reproducible SPICE circuit with resistor power and hypothetical temperature risk visual">'+
 '<rect width="760" height="260" rx="12" fill="#102f3a"/>'+
 '<text x="20" y="31" fill="#d5f7f0" font-weight="800" font-size="18">INJECTED ELECTRICAL FAULT · SPICE</text>'+
 '<path d="M45 128 H151 M201 128 H254 M338 128 H455 M522 128 H665 V210 H45 V128" fill="none" stroke="#f4d076" stroke-width="6"/>'+
 '<circle cx="45" cy="128" r="14" fill="#8fcfff" stroke="#fff" stroke-width="3"/>'+
 '<text x="45" y="91" text-anchor="middle" fill="#fff" font-size="16">'+run.supply.toFixed(1)+' V</text>'+
 '<rect x="151" y="112" width="50" height="32" rx="4" fill="#dec5a6" stroke="#fff6cb" stroke-width="2"/>'+
 '<text x="177" y="93" text-anchor="middle" fill="#fff" font-size="15">R20</text>'+
 '<rect x="247" y="102" width="100" height="53" rx="9" fill="'+(risk?"#ec554e":"#e0b18c")+'" stroke="'+level+'" stroke-width="'+(risk?6:3)+'"/>'+
 '<text x="297" y="91" text-anchor="middle" fill="#fff" font-size="15">R33 · '+power.toFixed(3)+' W</text>'+glow+
 '<path d="M455 128 Q468 93 481 128 Q494 93 507 128 Q516 107 522 128" fill="none" stroke="#edc681" stroke-width="5"/>'+
 '<text x="490" y="91" text-anchor="middle" fill="#fff" font-size="15">L10nH</text>'+
 '<rect x="649" y="157" width="32" height="38" rx="4" fill="#e4b48d" stroke="#fff1ce" stroke-width="3"/>'+
 '<text x="665" y="97" text-anchor="middle" fill="#fff" font-size="15">'+(run.load_ohm<1?"SHORT 0.1Ω":"LOAD 200Ω")+'</text>'+
 '<text x="352" y="237" text-anchor="middle" fill="#dbfaeb" font-size="15">Common reference ground</text>'+
 '<rect x="537" y="18" width="210" height="39" rx="7" fill="'+(risk?"#953b3d":"#315965")+'"/>'+
 '<text x="641" y="43" text-anchor="middle" fill="#fff" font-size="16">T est: '+t.toFixed(1)+' °C</text>'+
 '</svg>';
}
function plot(run){
 const a=run.trace,X=t=>65+t/16*670,ymax=Math.max(1.5,run.supply*1.12);
 const Y=v=>205-v/ymax*160,pmax=Math.max(.4,run.resistor_peak_w*1.12),P=v=>407-v/pmax*104;
 let s='<svg viewBox="0 0 760 458" role="img" aria-label="SPICE source voltage receiver voltage and resistor power versus nanoseconds"><rect width="760" height="458" rx="10" fill="#0b172e"/>';
 for(let i=0;i<=4;i++){let y=Y(ymax*i/4);s+='<path d="M65 '+y+' H735" stroke="#304965" stroke-dasharray="5 6"/><text x="57" y="'+(y+5)+'" text-anchor="end" fill="#c4deea" font-size="12">'+(ymax*i/4).toFixed(1)+' V</text>';}
 for(let i=0;i<=16;i+=2){let x=X(i);s+='<path d="M'+x+' 34 V426" stroke="#1c344f"/><text x="'+x+'" y="447" text-anchor="middle" fill="#c4deea" font-size="12">'+i+' ns</text>';}
 function line(idx,clr,fn){return '<path d="'+a.map((z,j)=>(j?'L':'M')+X(z[0]).toFixed(2)+' '+fn(z[idx]).toFixed(2)).join(' ')+'" fill="none" stroke="'+clr+'" stroke-width="3"/>';}
 s+=line(1,"#74b7ff",Y)+line(4,"#f67d9e",Y);
 s+='<path d="'+a.map((z,j)=>(j?'L':'M')+X(z[0]).toFixed(2)+' '+P((z[5]/1000)**2*33).toFixed(2)).join(' ')+'" fill="none" stroke="#f3cb74" stroke-width="3"/>';
 s+='<path d="M65 '+P(.25)+' H735" stroke="#fc7682" stroke-dasharray="7 6" stroke-width="2"/><text x="68" y="'+(P(.25)-6)+'" fill="#ffaab0" font-size="13">R33 rated 0.25 W (assumed)</text>';
 s+='<path d="M65 245 H735" stroke="#6587a0"/><text x="75" y="268" fill="#ddf0f6" font-size="14">R33 instantaneous power (lower scale)</text>';
 for(let j=0;j<=4;j++)s+='<text x="57" y="'+(P(pmax*j/4)+5)+'" text-anchor="end" fill="#f4dca6" font-size="12">'+(pmax*j/4).toFixed(2)+' W</text>';
 s+='<text x="735" y="23" text-anchor="end" fill="#fff" font-size="13">CH1 source · CH3 RX · I²R</text></svg>';
 return s;
}
function faultHTML(){
 return '<section id="faultExplorer" class="fault-explorer"><div class="fault-kicker">EXPLICIT FAULT INJECTION · SEPARATE NGSPICE MODEL</div>'+
 '<h5>Could a resistor overheat? Test before assuming damage.</h5>'+
 '<p>An incorrect quiz choice does not physically burn anything. In this separate circuit, a <b>shorted load</b> and an excessive supply can increase actual modeled resistor power. The smoke effect appears only when a separate hypothetical thermal estimate exceeds the assumed risk threshold.</p>'+
 '<label class="fault-select">Fault condition<select id="faultCase">'+runs.map(r=>'<option value="'+safe(r.id)+'">'+safe(r.id.replaceAll('_',' '))+'</option>').join('')+'</select></label>'+
 '<div id="faultSchematic"></div><div class="fault-values"><span><small>SPICE current</small><b id="faultCurrent"></b></span><span><small>R33 power</small><b id="faultPower"></b></span><span><small>Rating</small><b>0.25 W</b></span><span><small>Power ratio</small><b id="faultRatio"></b></span></div>'+
 '<label class="fault-time">Assumed sustained-DC exposure: <b id="faultElapsed">0.0 s</b><input id="faultSeconds" type="range" min="0" max="5" step=".1" value="0"/></label>'+
 '<p id="faultVerdict" role="status" aria-live="polite"></p><div id="faultTrace"></div>'+
 '<p class="fault-warning-note">The 0–16 ns electrical voltages/current come from completed ngspice-47 runs. Temperature is <b>not</b> a SPICE thermal solve: T(t) = 25°C + P·110 K/W·(1 − exp(−t/2 s)), with illustrative parameters, 0.25 W rating and 155°C risk threshold, assuming the final DC state persists for seconds. Smoke denotes a <b>hypothetical failure risk</b>, not a physical observation. Never apply these deliberate overvoltage settings to hardware.</p>'+
 '<a href="simulation/faults/README.md" target="_blank" rel="noopener">Read circuit assumptions and reproducibility details</a></section>';
}
function mountFault(el){
 if(!el||!runs.length)return;
 let r=runs[0],time=0;const $=x=>el.querySelector(x);
 function update(){
  let T=temp(r.resistor_power_w,time),ratio=r.resistor_power_w/.25;
  $("#faultSchematic").innerHTML=circuit(r,time);
  $("#faultElapsed").textContent=time.toFixed(1)+" s";
  $("#faultCurrent").textContent=(r.i_steady_a*1000).toFixed(2)+" mA";
  $("#faultPower").textContent=r.resistor_power_w.toFixed(3)+" W";
  $("#faultRatio").textContent=ratio.toFixed(2)+"×";
  $("#faultVerdict").textContent=T.toFixed(1)+" °C estimated. "+(T>=155?"Thermal estimate exceeds the example 155°C risk threshold; glowing/smoke denotes possible overheating, not verified damage.":ratio>1?"Assumed rated power exceeded. Heating predicted, but damage is not established by this snapshot.":"No overload predicted for the assumed 0.25 W resistor.");
  $("#faultVerdict").className=T>=155?"risk":ratio>1?"caution":"ok";
 }
 $("#faultCase").onchange=e=>{r=runs.find(x=>x.id===e.target.value)||runs[0];$("#faultTrace").innerHTML=plot(r);update()};
 $("#faultSeconds").oninput=e=>{time=Number(e.target.value);update()};
 $("#faultCase").value=r.id;$("#faultTrace").innerHTML=plot(r);update();
}
const claims=[
 [
 ["The 200 Ω load remains physically connected; a quiz mistake cannot remove it.","load"],
 ["Correct: NMOS conduction provides an extra RX-to-ground current path; observe the 0.946 V to 0.421 V board response.","mos"],
 ["The source remains at the commanded voltage; the change is downstream in the current path.","source"],
 ["Copper does not spontaneously stretch; trace geometry is unchanged.","trace"]
 ],
 [
 ["Correct: I·R produces a drop. Current also changes when series resistance changes.","resistor"],
 ["Adding a series resistor does not raise the supply voltage.","source"],
 ["Transistor threshold is a separate device property.","mos"],
 ["The receiver load remains in the circuit.","load"]
 ],
 [
 ["Correct: C stores charge and slows a transient at fixed available current.","cap"],
 ["A larger shunt capacitor can hurt a high-speed edge; it is not always an improvement.","cap"],
 ["Ground return current remains present.","ground"],
 ["The supply remains programmed; passive parts cannot magically increase it.","source"]
 ],
 [
 ["A randomly added MOSFET may create a new unwanted current path. A circuit diagnosis comes first.","mos"],
 ["A simulator screenshot does not validate physical hardware.","source"],
 ["Correct: verify instrument setup, ratings and measured failure mechanism before a component change.","board"],
 ["Overvoltage might exceed component limits. Use the fault-injection model below to inspect resistor current and power.","resistor"]
 ]
];
function consequenceHTML(){
 return '<div class="answer-consequence" id="answerConsequence"><div class="ac-label">CIRCUIT CONSEQUENCE OF YOUR CHOICE</div><div class="ac-result" id="acResult">Choose an answer to inspect what the circuit really does.</div>'+
 '<svg viewBox="0 0 700 190" role="img" aria-label="Circuit with annotated source resistor trace and NMOS"><rect width="700" height="190" rx="12" fill="#0c2937"/>'+
 '<path d="M42 65 H145 M207 65 H310 M387 65 H658 M590 65 V100 M590 134 V150 M658 65 V105 M658 136 V150 M42 150 H690" fill="none" stroke="#ebcc83" stroke-width="6"/>'+
 '<rect id="acRes" x="145" y="48" width="62" height="34" rx="5" fill="#ddb487" stroke="#fff3c8" stroke-width="3"/>'+
 '<path d="M310 65 Q330 34 347 65 Q365 34 387 65" stroke="#f4ce87" stroke-width="6" fill="none"/>'+
 '<rect id="acLoad" x="574" y="100" width="32" height="34" rx="5" fill="#ddb487" stroke="#fff3c8" stroke-width="3"/>'+
 '<rect id="acMos" x="641" y="105" width="34" height="30" rx="5" fill="#648786" stroke="#fff3c8" stroke-width="3"/>'+
 '<circle cx="42" cy="65" r="12" fill="#b3e8ff"/><text x="42" y="33" text-anchor="middle" fill="#fff" font-size="15">Source</text>'+
 '<text x="176" y="35" text-anchor="middle" fill="#fff" font-size="15">Rseries</text>'+
 '<text x="575" y="35" fill="#fff" font-size="15">RX</text><text x="590" y="176" text-anchor="middle" fill="#fff" font-size="14">Rload 200Ω</text><text x="657" y="176" text-anchor="middle" fill="#fff" font-size="15">NMOS</text>'+
 '<path id="acCurrent" d="M658 72 V127" fill="none" stroke="#f7dc6c" stroke-width="0" stroke-dasharray="6 5"/>'+
 '</svg><p class="ac-foot" id="acFoot">This overlay explains claims; the electrical netlist is not modified by selecting an answer.</p></div>';
}
function showConsequence(root,step,choice,isRight){
 const panel=root.querySelector("#answerConsequence");if(!panel)return;
 const v=(claims[step]||claims[0])[choice]||["Compare your claim against the physical connections.","board"];
 panel.querySelector("#acResult").textContent=(isRight?"CORRECT — ":"MISCONCEPTION — ")+v[0];
 panel.querySelector("#acResult").className="ac-result "+(isRight?"good":"wrong");
 const res=panel.querySelector("#acRes"),load=panel.querySelector("#acLoad"),mos=panel.querySelector("#acMos"),cur=panel.querySelector("#acCurrent");
 res.setAttribute("stroke",v[1]==="resistor"?"#fd616f":"#fff3c8");
 load.setAttribute("stroke",v[1]==="load"?"#fd616f":"#fff3c8");
 mos.setAttribute("stroke",v[1]==="mos"?"#f9f16f":"#fff3c8");
 cur.setAttribute("stroke-width",v[1]==="mos"||v[1]==="ground"?"7":"0");
 panel.querySelector("#acFoot").textContent="The component highlight explains the selected claim. Actual heating requires a real power/current condition—see fault explorer below, where electrical results and the thermal estimate are distinguished.";
}
function resetConsequence(root){const p=root.querySelector("#answerConsequence");if(p){p.querySelector("#acResult").textContent="Choose an answer to inspect what the circuit really does.";p.querySelector("#acResult").className="ac-result";p.querySelector("#acRes").setAttribute("stroke","#fff3c8");p.querySelector("#acLoad").setAttribute("stroke","#fff3c8");p.querySelector("#acMos").setAttribute("stroke","#fff3c8");p.querySelector("#acCurrent").setAttribute("stroke-width","0")}}
window.renderFaultExplorer=faultHTML;window.mountFaultExplorer=mountFault;
window.renderAnswerConsequence=consequenceHTML;window.showAnswerConsequence=showConsequence;window.resetAnswerConsequence=resetConsequence;
})();
