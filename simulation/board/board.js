"use strict";
/* 48 offline ngspice-47 runs. All wiring is educational; not a literal PCB artwork or measurement. */
(function(){
var data=window.SLT_BOARD_RUNS||[];
function E(t){return String(t==null?"":t).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function color(v,max){
  var f=Math.max(0,Math.min(1,v/Math.max(.25,max)));
  return "hsl("+(208-Math.round(f*165))+" 74% "+(45+Math.round(f*6))+"%)";
}
function schematic(r,v){
  var vs=v[1],tx=v[2],p=v[3],rx=v[4],gate=v[5],ma=v[6],mosOn=r.nmos&&gate>1.1;
  function wire(x1,y1,x2,y2,voltage,thick){return '<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="'+color(voltage,r.supply)+'" stroke-width="'+(thick||6)+'" stroke-linecap="round" fill="none"/>'}
  function lead(x,y,name,value){return '<circle cx="'+x+'" cy="'+y+'" r="8" fill="#fff" stroke="#244b78" stroke-width="3"/>'+
    '<text x="'+x+'" y="'+(y-17)+'" text-anchor="middle" fill="#fff4d6" font-weight="800" font-size="15">'+E(name)+'</text>'+
    '<text x="'+x+'" y="'+(y+34)+'" text-anchor="middle" fill="#eaf8d4" font-size="13">'+value.toFixed(3)+' V</text>'}
  var out='<svg class="board-svg" viewBox="0 0 1050 390" role="img" aria-label="Board level schematic with source, driver, selectable resistor, trace inductor, load resistor, capacitor, and low-side NMOS switch; live node readings" xmlns="http://www.w3.org/2000/svg">'+
  '<rect x="8" y="8" width="1034" height="374" rx="19" fill="#133b39" stroke="#247566" stroke-width="7"/>';
  for(var i=0;i<15;i++)out+='<path d="M0 '+(i*27+10)+' H1050" stroke="#a7ba72" opacity=".12" stroke-width="1"/>';
  for(var k=0;k<24;k++)out+='<circle cx="'+(23+k*43)+'" cy="24" r="2.4" fill="#e3c86a" opacity=".5"/>';
  out+='<text x="29" y="51" fill="#e7ffeb" font-size="18" font-weight="800">BOARD-LEVEL CIRCUIT · NODE VOLTAGES AT THE WAVEFORM CURSOR</text>'+
  '<text x="29" y="73" fill="#b6e9d7" font-size="13">Illustrative layout, electrically connected netlist · common ground rail</text>';
  // main top copper signal path (components inserted as true gaps)
  out+=wire(45,145,147,145,vs)+wire(210,145,263,145,tx)+wire(263,145,278,145,tx)+wire(278,145,330,145,tx)+wire(407,145,455,145,p)+wire(539,145,643,145,rx)+wire(643,145,997,145,rx);
  // driver resistor R20 symbol
  out+='<rect x="147" y="130" width="63" height="30" rx="7" fill="#ecd7ac" stroke="#e8b459" stroke-width="2"/>'+
  '<path d="M160 130 V160 M195 130 V160" stroke="#8f4d29" stroke-width="4"/>'+
  '<text x="178" y="119" text-anchor="middle" fill="#fff7d8" font-weight="800" font-size="15">Rdrv 20Ω</text>';
  // series resistor 0 = jumper, otherwise R33
  if(r.series_r){
    out+='<rect x="330" y="130" width="77" height="30" rx="7" fill="#efb985" stroke="#ffdba4" stroke-width="2"/>'+
    '<path d="M341 130 V160 M394 130 V160" stroke="#964b26" stroke-width="4"/>';
  }else out+='<rect x="330" y="137" width="77" height="16" rx="7" fill="#b9c7cc" stroke="#f7eadb" stroke-width="2"/>';
  out+='<text x="368" y="119" text-anchor="middle" fill="#fff7d8" font-weight="800" font-size="15">'+(r.series_r?"Radd 33Ω":"Radd bypass")+'</text>';
  // Inductor coil between 455 and 539, series
  out+='<path d="M455 145 Q466 110 477 145 Q488 110 499 145 Q510 110 521 145 Q530 119 539 145" fill="none" stroke="#f1c66f" stroke-width="6"/>'+
   '<text x="498" y="98" text-anchor="middle" fill="#fff7dc" font-size="15" font-weight="800">Ltrace '+r.inductor_nh+' nH</text>';
  out+=lead(45,145,"CH1 Vsrc",vs)+lead(274,145,"CH2 TX",tx)+lead(643,145,"CH3 RX",rx);
  // right ground return plane and load resistor
  out+='<path d="M45 319 H995" stroke="#d8c181" stroke-width="10" stroke-linecap="round"/>'+
   '<circle cx="98" cy="319" r="9" fill="#fff5b1"/><text x="116" y="309" fill="#f1f3d1" font-size="13">J1 GND</text>'+
   '<path d="M684 145 V193 M684 241 V319" stroke="#f1c46b" stroke-width="6"/>'+
   '<rect x="666" y="193" width="36" height="48" rx="5" fill="#f8d2a0" stroke="#ffe7a1" stroke-width="3"/>'+
   '<text x="684" y="183" text-anchor="middle" fill="#ecfff5" font-size="14" font-weight="800">Rload</text>'+
   '<text x="684" y="262" text-anchor="middle" fill="#ecfff5" font-size="13">200Ω</text>';
  // Shunt capacitor, both plates truly parallel to load
  out+='<path d="M813 145 V211 M813 239 V319" stroke="#f1c46b" stroke-width="5"/>'+
   '<path d="M789 211 H837 M789 239 H837" stroke="#f6f1df" stroke-width="6"/>'+
   '<text x="813" y="190" text-anchor="middle" fill="#ecfff5" font-size="14" font-weight="800">Cload</text>'+
   '<text x="813" y="266" text-anchor="middle" fill="#ecfff5" font-size="13">'+r.cap_pf+' pF</text>';
  // NMOS pull-down between RX and ground, gate driven separately.
  out+='<path d="M950 145 V215 M950 260 V319" stroke="'+(r.nmos?(mosOn?"#f4de74":"#a3b1bf"):"#5c8588")+'" stroke-width="5" '+(r.nmos?"":'stroke-dasharray="8 8"')+'/>';
  out+='<rect x="920" y="212" width="60" height="54" rx="5" fill="'+(r.nmos?(mosOn?"#2a7d68":"#4d586b"):"#244e50")+'" stroke="'+(r.nmos?(mosOn?"#f4f078":"#afc8ce"):"#799fa0")+'" stroke-width="3" '+(r.nmos?"":'stroke-dasharray="4 5"')+'/>';
  out+='<path d="M943 219 V257 M958 219 V257" stroke="#effeef" stroke-width="3"/><path d="M914 237 H943" stroke="#f1c46b" stroke-width="4"/>';
  out+='<text x="946" y="185" text-anchor="middle" fill="#effdef" font-size="14" font-weight="800">'+(r.nmos?"NMOS pull-down":"NMOS not fitted")+'</text>'+
   '<text x="950" y="280" text-anchor="middle" fill="#effdef" font-size="13">'+(r.nmos?(mosOn?"ON":"OFF"):"OPEN")+'</text>';
  // Gate drive is separate via control pad, not connected to signal trace
  if(r.nmos){
    out+='<path d="M914 237 H882 V289 H852" fill="none" stroke="'+color(gate,3.3)+'" stroke-width="5"/>'+
     '<circle cx="850" cy="289" r="7" fill="white" stroke="#659ce1" stroke-width="3"/>'+
     '<text x="828" y="305" text-anchor="end" fill="#effdef" font-size="13">GATE '+gate.toFixed(2)+'V</text>';
  }
  out+='<text x="395" y="344" text-anchor="middle" fill="#eff9da" font-size="16" font-weight="800">GND · common reference return</text>';
  // conventional current arrow, position controlled by actual current magnitude at that cursor
  var magnitude=Math.max(.2,Math.min(8,Math.abs(ma)/3));
  if(ma>=.0001)out+='<path d="M565 114 H618 L605 102 M618 114 L605 126" stroke="#ffef9c" stroke-width="'+magnitude+'" fill="none" stroke-linecap="round"/>';
  if(ma<-.0001)out+='<path d="M618 114 H565 L578 102 M565 114 L578 126" stroke="#ffef9c" stroke-width="'+magnitude+'" fill="none" stroke-linecap="round"/>';
  out+='<text x="561" y="88" fill="#ffefa9" font-size="14" font-weight="750">Itrace '+ma.toFixed(2)+' mA</text>'+
    '<text x="62" y="281" fill="#e6f8e9" font-size="13">J1 input</text>'+
    '<text x="62" y="302" fill="#e6f8e9" font-size="13">'+r.supply.toFixed(1)+' V programmed</text>'+
    '<text x="64" y="353" fill="#c8e2d0" font-size="12">Color encodes instantaneous node voltage; arrows indicate conventional current, not literal electron motion.</text>';
  return out+'</svg>';
}
function layout(){
 return '<section id="boardLab" class="bl-root" aria-label="Interactive board-level circuit and component demonstration">'+
 '<div class="bl-heading"><span class="bl-kicker">BOARD LAB · REAL SPICE TRANSIENT RESULTS</span><h4>Components, PCB Connections & Voltage Response</h4>'+
 '<p>Modify the circuit and inspect the resistor, inductor, capacitor, MOSFET and copper nets. The diagram follows the same time cursor as the scope above. Each combination is a completed ngspice run, not a live hardware board.</p></div>'+
 '<div class="bl-choices"><label>Input step voltage<select id="blSupply"><option value=".8">0.8 V</option><option value="1.2" selected>1.2 V</option><option value="1.8">1.8 V</option></select></label>'+
 '<label>Extra series resistor<select id="blSeries"><option value="0">Bypass (0 Ω)</option><option value="33" selected>Add 33 Ω</option></select></label>'+
 '<label>Trace inductance<select id="blL"><option value="1">1 nH</option><option value="10" selected>10 nH</option></select></label>'+
 '<label>Receiver capacitor<select id="blC"><option value="2">2 pF</option><option value="30" selected>30 pF</option></select></label>'+
 '<label>Switching transistor<select id="blMos"><option value="false">No NMOS</option><option value="true" selected>Fit NMOS pull-down</option></select></label></div>'+
 '<div class="bl-explanation" id="blNarrative" role="status"></div>'+
 '<div id="blMobileCircuit" class="slt-mobile-board"></div><div class="bl-board-scroll"><div id="blBoardDrawing"></div></div>'+
 '<div class="bl-plot-head"><b>Professional board-level oscilloscope · selected SPICE run</b><span>Cursor linked to upper waveform: <strong id="blNow">2.30 ns</strong></span></div>'+
 '<div id="blProScope" aria-label="Interactive professional board oscilloscope"></div>'+
 '<div class="bl-metrics"><div><small>CH1 source</small><b id="blValVS">—</b></div><div><small>CH2 transmitter</small><b id="blValTX">—</b></div><div><small>CH3 receiver</small><b id="blValRX">—</b></div><div><small>Gate drive</small><b id="blValGate">—</b></div><div><small>Trace current</small><b id="blValI">—</b></div><div><small>Rdriver drop</small><b id="blValDrop">—</b></div></div>'+
  '<div class="bl-component-readouts"><h5>Component measurements at this exact cursor time</h5><div class="bl-table-scroll"><table><thead><tr><th>Component</th><th>Relationship</th><th>Computed value</th><th>Meaning</th></tr></thead><tbody>'+
 '<tr><td>Rdriver 20 Ω</td><td>'+(window.studyMath?window.studyMath('V_source − V_TX'): 'Vsource − VTX')+'</td><td id="blDriverDrop">—</td><td>Drive-stage voltage loss</td></tr>'+
 '<tr><td>Added series R</td><td>'+(window.studyMath?window.studyMath('V_TX − V_beforeL'): 'VTX − VbeforeL')+'</td><td id="blExtraDrop">—</td><td>Added resistance / jumper drop</td></tr>'+
 '<tr><td>Trace inductor</td><td>'+(window.studyMath?window.studyMath('V_beforeL − V_RX'): 'VbeforeL − VRX')+'</td><td id="blInductorV">—</td><td>Inductive voltage, L·dI/dt</td></tr>'+
 '<tr><td>Inductor energy</td><td>'+(window.studyMath?window.studyMath('0.5×L×I^2'): '½·L·I²')+'</td><td id="blInductorE">—</td><td>Stored magnetic energy</td></tr>'+
 '<tr><td>Capacitor charge</td><td>'+(window.studyMath?window.studyMath('C×V_RX'): 'C·VRX')+'</td><td id="blCapCharge">—</td><td>Stored electrical charge</td></tr>'+
 '<tr><td>Capacitor energy</td><td>'+(window.studyMath?window.studyMath('0.5×C×V^2'): '½·C·V²')+'</td><td id="blCapEnergy">—</td><td>Stored electric energy</td></tr>'+
 '<tr><td>200 Ω receiver load</td><td>'+(window.studyMath?window.studyMath('V_RX / 200'): 'VRX / 200')+'</td><td id="blLoadI">—</td><td>Current returned to ground</td></tr>'+
 '<tr><td>Added resistor power</td><td>'+(window.studyMath?window.studyMath('I_trace^2×R_add'): 'Itrace²·Radd')+'</td><td id="blSeriesP">—</td><td>Instantaneous heat rate (model)</td></tr>'+
 '</tbody></table></div><p class="bl-tiny">The voltage and branch current originate from ngspice samples. Values derived with the stated formulas are calculated from those samples, not separately measured with hardware instruments. No thermal model is included.</p></div>'+
 '<div class="bl-notes"><h5>How to choose a component (and what can go wrong)</h5><p><strong>Resistor:</strong> limits current or provides damping, but may slow an edge and reduce receiver voltage. <strong>Inductor:</strong> models trace/package inductance; larger L resists rapid current changes and can resonate with C. <strong>Capacitor:</strong> loads the edge and stores charge; it can smooth a supply but a signal-line capacitor may worsen rise time. <strong>MOSFET:</strong> an active switched pull-down, not a voltage regulator; when its gate rises at 8 ns it can pull the receiver down. Do not add any part based on voltage alone: identify the actual fault, permitted limits and pin connections first.</p></div>'+
 '<div class="bl-actions"><a id="blCircuit" target="_blank" rel="noopener">Open exact ngspice circuit</a><a href="simulation/board/verification.json" target="_blank" rel="noopener">48-run evidence</a><button type="button" id="blCSV">Export this board waveform</button></div>'+

 '<div class="bl-quiz"><span class="bl-kicker">COMPONENT DECISIONS · GUIDED PRACTICE</span><div id="blQuizProgress"></div><h5 id="blQuizQuestion"></h5><div id="blQuizChoices"></div>'+(window.renderAnswerConsequence?window.renderAnswerConsequence():'')+'<p id="blQuizFeedback" role="status" aria-live="polite"></p><div class="bl-quiz-actions"><button type="button" id="blHint">Hint</button><button type="button" id="blNext" disabled>Next step →</button></div></div>'+
 (window.renderFaultExplorer?window.renderFaultExplorer():'')+'<p class="bl-provenance">SYNCHRONIZED EDUCATIONAL MODELS: The upper 50 Ω transmission-line plot and this lower board circuit are two <b>different</b> ngspice networks. Their time cursors are shared for comparison; their voltages do not represent the same physical nodes. The drawing is illustrative PCB-like wiring, not a fabricated or routed board or a measured oscilloscope trace.</p></section>';
}
function init(root,getTime){
 if(!root||!data.length)return;
 var $=function(s){return root.querySelector(s)};
 var latest=2.3,run=null;
 function match(){
  var v=Number($("#blSupply").value),rs=Number($("#blSeries").value),l=Number($("#blL").value),c=Number($("#blC").value),n=$("#blMos").value==="true";
  run=data.find(function(x){return x.supply===v&&x.series_r===rs&&x.inductor_nh===l&&x.cap_pf===c&&x.nmos===n});
  if(!run)throw Error("No verified simulation matching chosen component set");
 }
 function nearest(){
  var a=run.samples,lo=0,hi=a.length-1;
  while(lo<hi){var m=(lo+hi)>>1;if(a[m][0]<latest)lo=m+1;else hi=m}
  if(lo>0&&Math.abs(a[lo-1][0]-latest)<Math.abs(a[lo][0]-latest))lo--;
  return a[lo];
 }
 function voltageLines(){
  if(!window.renderBoardScope)return;
  window.renderBoardScope($("#blProScope"),run,latest,{
   onSeek:function(t){
    var input=root.closest("#siStudio").querySelector("#siTime");
    if(input){input.value=t;input.dispatchEvent(new Event("input",{bubbles:true}));}
   }
  });
 }
 function readout(){
  if(!run)return;var z=nearest(),v=function(k){return z[k].toFixed(3)+" V"};
  $("#blNow").textContent=latest.toFixed(2)+" ns";
  $("#blValVS").textContent=v(1);$("#blValTX").textContent=v(2);$("#blValRX").textContent=v(4);
  $("#blValGate").textContent=v(5);$("#blValI").textContent=z[6].toFixed(2)+" mA";
  $("#blValDrop").textContent=(z[1]-z[2]).toFixed(3)+" V";
  var i=z[6]/1000,cap=run.cap_pf*1e-12,ind=run.inductor_nh*1e-9;
  $("#blDriverDrop").textContent=(z[1]-z[2]).toFixed(4)+" V";
  $("#blExtraDrop").textContent=(z[2]-z[3]).toFixed(4)+" V";
  $("#blInductorV").textContent=(z[3]-z[4]).toFixed(4)+" V";
  $("#blInductorE").textContent=(0.5*ind*i*i*1e12).toFixed(4)+" pJ";
  $("#blCapCharge").textContent=(cap*z[4]*1e12).toFixed(4)+" pC";
  $("#blCapEnergy").textContent=(0.5*cap*z[4]*z[4]*1e12).toFixed(4)+" pJ";
  $("#blLoadI").textContent=(z[4]/200*1000).toFixed(4)+" mA";
  $("#blSeriesP").textContent=(i*i*(run.series_r||0.1)*1000).toFixed(5)+" mW";

  $("#blBoardDrawing").innerHTML=schematic(run,z);if(window.sltMobileBoard)window.sltMobileBoard(run,z,root,latest);
 }
 var checks=[
  ["At 8 ns, the NMOS gate rises to 3.3 V. Why can RX fall?",["The 200 Ω resistor disappears","The turned-on NMOS creates a new current path to ground","The source automatically falls to zero","The copper trace changes length"],1,"Look at the MOSFET drain and source connections.","A turned-on low-side NMOS conducts from RX toward ground. The receiver voltage depends on the resulting current and series resistances."],
  ["Why can adding a 33 Ω series resistor reduce the receiver DC voltage?",["It creates a greater voltage drop at a given current","It raises the 1.2 V source","It increases the MOSFET threshold","It eliminates the load resistor"],0,"Use Ohm's law and count resistances in series with the 200 Ω load.","More series resistance changes the voltage divider and often damps ringing, but reduces drive strength."],
  ["What can a 30 pF capacitor connected to the RX signal do?",["Store charge and slow edges; it can interact with trace inductance","Always improve clock rise time","Eliminate all ground return currents","Increase source voltage beyond its source setting"],0,"A capacitor current is I=C dV/dt; what happens when C increases?","Larger shunt capacitance increases charging demand and can interact with the series trace inductance. It may help some filtering but can harm a fast digital input."],
  ["When voltage changes unexpectedly on a real PCB, what should you do first?",["Randomly install a MOSFET","Infer failure only from this SPICE demonstration","Verify probe, limits, waveform and fault mechanism before selecting parts","Raise source voltage beyond specifications"],2,"A real component choice should follow a controlled diagnosis, not be triggered automatically.","Start from the datasheet and valid measurement, isolate the cause, model the proposed change, then verify it on authorized hardware."]
 ];
 var step=0,solved=false,attempts=0;
 function showCheck(){
   var q=checks[step];solved=false;attempts=0;
   $("#blQuizProgress").textContent="Challenge "+(step+1)+" / "+checks.length;
   $("#blQuizQuestion").textContent=q[0];
   $("#blQuizChoices").innerHTML=q[1].map(function(v,i){return '<button type="button" data-bl-answer="'+i+'">'+String.fromCharCode(65+i)+". "+E(v)+'</button>'}).join("");
   $("#blQuizFeedback").textContent="";$("#blQuizFeedback").className="";
   if(window.resetAnswerConsequence)window.resetAnswerConsequence(root);
   $("#blNext").disabled=true;
   $("#blNext").textContent=step===checks.length-1?"Finish lab":"Next step →";
 }
  function explanation(){
  $("#blCircuit").href=run.netlist;
  var advice=[];
  advice.push("Input "+run.supply.toFixed(1)+" V is a user-set test stimulus; voltage does not automatically insert components.");
  advice.push(run.series_r?"The added 33 Ω series resistor increases series impedance and can damp a transition, at the cost of DC voltage drop.":"The 33 Ω resistor is bypassed; the fixed 20 Ω driver still limits current.");
  advice.push(run.inductor_nh===10?"10 nH series trace inductance increases stored magnetic energy versus 1 nH.":"1 nH models a lower-inductance path; no real trace is perfectly zero-inductance.");
  advice.push(run.cap_pf===30?"30 pF shunt capacitance stores more charge and loads the signal edge than 2 pF.":"2 pF represents a lighter receiver loading condition.");
  advice.push(run.nmos?"At 8 ns the gate switches to 3.3 V. The Level-1 NMOS turns on and draws additional receiver-node current to ground.":"The NMOS is omitted; the load is only the 200 Ω resistor and selected capacitor.");
  advice.push("Computed RX: "+run.pre_nmos_rx_v.toFixed(3)+" V near 7.8 ns → "+run.post_nmos_rx_v.toFixed(3)+" V near 15.5 ns.");
  $("#blNarrative").textContent=advice.join(" ");
 }
 function redraw(){readout();voltageLines()}
 function controls(){match();explanation();redraw()}
 ["#blSupply","#blSeries","#blL","#blC","#blMos"].forEach(function(sel){$(sel).onchange=controls});

 root.closest("#siStudio").addEventListener("slt:scope-time",function(ev){latest=Math.min(16,Math.max(0,Number(ev.detail.time)));redraw()});
 $("#blQuizChoices").onclick=function(e){
   var btn=e.target.closest("[data-bl-answer]");if(!btn||solved)return;
   var q=checks[step],selected=Number(btn.dataset.blAnswer);attempts++;
   if(selected!==q[2]){
     btn.classList.add("wrong");if(window.showAnswerConsequence)window.showAnswerConsequence(root,step,selected,false);$("#blQuizFeedback").textContent="Not quite. "+(attempts===1?q[3]:q[4])+" Try again.";
     return;
   }
   btn.classList.add("right");solved=true;if(window.showAnswerConsequence)window.showAnswerConsequence(root,step,selected,true);
   root.querySelectorAll("[data-bl-answer]").forEach(function(x){x.disabled=true});
   $("#blQuizFeedback").textContent="Correct. "+q[4];$("#blQuizFeedback").className="correct";
   $("#blNext").disabled=false;
 };
 $("#blHint").onclick=function(){$("#blQuizFeedback").textContent="Hint: "+checks[step][3]};
 $("#blNext").onclick=function(){
   if(!solved)return;
   if(step<checks.length-1){step++;showCheck();return}
   $("#blQuizProgress").textContent="4 / 4 completed";
   $("#blQuizQuestion").textContent="Component selection lab complete";
   $("#blQuizChoices").innerHTML="";
   $("#blQuizFeedback").textContent="Now choose a different circuit, compare its RX voltage before and after the MOSFET gate event, and explain the current path.";
   $("#blQuizFeedback").className="correct";$("#blNext").disabled=true;
 };
  $("#blCSV").onclick=function(){
  var csv="time_ns,vsource_V,vtx_V,vbeforeL_V,vrx_V,gate_V,inductor_current_mA\n"+run.samples.map(function(x){return x.join(",")}).join("\n");
  var url=URL.createObjectURL(new Blob([csv],{type:"text/csv"})),a=document.createElement("a");
  a.href=url;a.download=run.id+"_board_ngspice.csv";a.click();setTimeout(function(){URL.revokeObjectURL(url)},1200);
 };
 latest=typeof getTime==="function"?getTime():2.3;
 controls();showCheck();if(window.mountFaultExplorer)window.mountFaultExplorer(root.querySelector("#faultExplorer"));
}
window.renderBoardLab=layout;
window.mountBoardLab=init;
})();
