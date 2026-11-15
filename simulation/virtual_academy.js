"use strict";
(function(){
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const f=(v,n=3)=>Number.isFinite(v)?v.toFixed(n):"—",limit=(x,a,b)=>Math.max(a,Math.min(b,x));
const needed=[["V+","R1+"],["R1-","R2+"],["R1-","R3+"],["R2-","R4+"],["R3-","R4+"],["R4-","GND"]];
const endpoints=["V+","R1+","R1-","R2+","R2-","R3+","R3-","R4+","R4-","GND"];
const reportStart=()=>({title:"Series/parallel and RC circuits — virtual engineering report",purpose:"Verify Ohm's law, series/parallel resistance, KCL/KVL and RC response in a calculated circuit model.",description:"Interactive virtual resistor and capacitor circuits, simulated probe nodes and local model measurements.",procedure:"1. Keep supply OFF while connecting wires.\n2. Connect the required terminals according to schematic.\n3. Check the jumper network before switching power ON.\n4. Record numerical values, probes and calculations.\n5. Compare predictions to theory.",observations:"",analysis:"",conclusion:""});
function calc(V,R1,R2,R3,R4){
 if([V,R1,R2,R3,R4].some(n=>!Number.isFinite(n))||V<0||Math.min(R1,R2,R3,R4)<=0)return null;
 const Rp=R2*R3/(R2+R3),Rt=R1+Rp+R4,I=V/Rt,vp=I*Rp,i2=vp/R2,i3=vp/R3;
 return {V,R1,R2,R3,R4,Rp,Rt,I,vp,i2,i3,v1:I*R1,v4:I*R4,
   node1:V-I*R1,node2:I*R4,kcl:I-i2-i3,kvl:V-(I*R1+vp+I*R4)};
}
function rc(V,R,C,t,mode){
 if([V,R,C,t].some(n=>!Number.isFinite(n))||V<=0||R<=0||C<=0)return null;
 const tau=R*C,z=Math.exp(-t/tau),on=mode==="charge";
 return {tau,t,vc:on?V*(1-z):V*z,vs:on?V:0,i:(on?1:-1)*V/R*z,vr:on?V*z:-V*z};
}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function svgCircuit(d,wiring,powered){
 let s='<svg viewBox="0 0 850 310" role="img" aria-label="Series-parallel resistor circuit schematic with source, resistors and junctions"><rect width="850" height="310" rx="12" fill="#fffefa" stroke="#c7d6e5"/>';
 const color=powered?"#188969":"#7890aa";
 const segments=[[60,94,160,94],[251,94,300,94],[300,94,300,151],[300,151,353,151],[445,151,560,151],[300,151,300,221],[300,221,353,221],[445,221,560,221],[560,151,560,221],[560,221,560,281],[560,281,600,281],[691,281,740,281],[740,281,740,304],[740,304,60,304],[60,304,60,205],[60,165,60,94]];
 segments.forEach(q=>s+='<path d="M'+q[0]+' '+q[1]+' L'+q[2]+' '+q[3]+'" stroke="'+color+'" stroke-width="3" fill="none"/>');
 const res=(x,y,name,val)=>'<rect x="'+x+'" y="'+y+'" width="91" height="31" fill="#ffedc1" rx="5" stroke="#a77b28" stroke-width="2"/><text x="'+(x+45)+'" y="'+(y+20)+'" font-size="12" fill="#624210" font-weight="bold" text-anchor="middle">'+name+' '+f(val,0)+' Ω</text>';
 s+=res(160,78,"R1",d.R1)+res(353,135,"R2",d.R2)+res(353,205,"R3",d.R3)+res(600,265,"R4",d.R4);
 s+='<rect x="15" y="165" width="93" height="40" rx="6" fill="#dbeafe" stroke="#4977b9"/><text x="61" y="190" fill="#17467d" font-size="16" text-anchor="middle">'+f(d.V,1)+' V</text>';
 s+='<text x="11" y="83" fill="#277b62" font-size="12">+ Vsource</text><text x="15" y="302" fill="#53677f" font-size="12">GROUND</text>';
 for(const [x,y,label] of [[60,94,"SOURCE"],[300,151,"A"],[560,221,"B"],[60,304,"0V"]])s+='<circle cx="'+x+'" cy="'+y+'" r="6" fill="#d65962" stroke="white" stroke-width="2"/><text x="'+(x+8)+'" y="'+(y-9)+'" fill="#405a79" font-size="12">'+label+'</text>';
 s+='<text x="425" y="293" fill="#5d7792" font-size="12" text-anchor="middle">'+(powered?"POWERED · validated jumper network":"SUPPLY OFF · attach six jumpers")+'</text></svg>';
 s+='<svg viewBox="0 0 850 135" aria-label="Breadboard holes and manually connected jumper leads" role="img"><rect width="850" height="135" rx="9" fill="#e9edf5" stroke="#c5cdd9"/>';
 for(let i=0;i<5;i++)for(let j=0;j<29;j++)s+='<circle cx="'+(21+j*28)+'" cy="'+(14+i*20)+'" r="3.2" fill="#91a8bd"/>';
 wiring.forEach((w,i)=>{const x=30+i*115,y=15+(i%3)*20;s+='<path d="M'+x+' '+y+' Q'+(x+39)+' '+(y-17)+' '+(x+83)+' '+y+'" stroke="'+["#d85b52","#45a874","#e3ab3a","#8b72dc"][i%4]+'" stroke-width="4" fill="none"/>'});
 s+='<text x="15" y="120" font-size="13" fill="#284d71">Breadboard jumpers connected: '+wiring.length+' / 6 required</text></svg>';
 return s;
}
function renderFourChannelScope(d,power,a,b){
 const vals=[d.V,d.node1,d.node2,d.vp].map(x=>power?x:0),labels=["CH1 VSOURCE","CH2 NODE A","CH3 NODE B","CH4 VPARALLEL"];
 const colors=["#f9dc55","#5ae9a6","#67b3ff","#ff83b7"],x=t=>130+t/1000*677;
 let svg='<svg viewBox="0 0 850 405" role="img" aria-label="Four calculated ideal voltage lanes with A and B cursors"><rect width="850" height="405" rx="10" fill="#061729"/>';
 for(let k=0;k<4;k++){
  const y=16+k*92,amp=power?vals[k]:0,top=y+16,bot=y+72;
  svg+='<rect x="6" y="'+y+'" width="836" height="83" rx="5" fill="#112a40"/>';
  svg+='<text x="12" y="'+(y+20)+'" fill="'+colors[k]+'" font-size="12" font-weight="800">'+labels[k]+'</text><text x="12" y="'+(y+45)+'" fill="#c5e0ee" font-size="10">'+f(amp,3)+' V</text>';
  svg+=power?'<path d="M130 '+bot+' H'+x(100)+' V'+top+' H807" fill="none" stroke="'+colors[k]+'" stroke-width="2.5"/>':'<path d="M130 '+bot+' H807" fill="none" stroke="'+colors[k]+'" stroke-width="2.7"/>';
  for(const [t,tag,c] of [[a,"A","#ffe19a"],[b,"B","#79f1d5"]]){
   const xx=x(t),yy=power&&t>=100?top:bot;
   svg+='<circle data-aca-marker="'+tag+'" data-ch="'+k+'" cx="'+xx+'" cy="'+yy+'" r="4.5" fill="'+c+'" stroke="#051420" stroke-width="1.5"/>';
  }
 }
 for(const [t,tag,c] of [[a,"A","#ffe19a"],[b,"B","#79f1d5"]])svg+='<path d="M'+x(t)+' 12 V385" stroke="'+c+'" stroke-dasharray="6 5"/><text x="'+x(t)+'" y="10" fill="'+c+'" text-anchor="middle" font-size="11">'+tag+'</text>';
 svg+='<text x="808" y="400" text-anchor="end" fill="#c6daef" font-size="12">TIME (ns)</text></svg>';
 const at=(t,k)=>power&&t>=100?vals[k]:0;
 const stats='<strong>A='+f(a,1)+' ns · B='+f(b,1)+' ns · Δt='+f(b-a,1)+' ns</strong><table class="aca-table"><thead><tr><th>Channel</th><th>A [V]</th><th>B [V]</th><th>Δ [V]</th></tr></thead><tbody>'+
 labels.map((l,k)=>'<tr><td>'+l+'</td><td>'+f(at(a,k))+'</td><td>'+f(at(b,k))+'</td><td>'+f(at(b,k)-at(a,k))+'</td></tr>').join("")+'</tbody></table>';
 return {svg,stats,at};
}
function svgRC(V,R,C,mode,t){
 let s='<svg viewBox="0 0 850 270" role="img" aria-label="RC capacitor exponential voltage curve with time cursor"><rect width="850" height="270" fill="#0a1c31" rx="10"/>';
 const max=5*R*C,xx=u=>75+(u/max)*725,yy=v=>227-v/V*192;
 for(let i=0;i<6;i++){let x=xx(i*max/5);s+='<path d="M'+x+' 20 V227" stroke="#29475c"/><text x="'+x+'" y="255" fill="#c0d8ec" font-size="11" text-anchor="middle">'+f(i*max/5,1)+'s</text>'}
 let path="";for(let i=0;i<=400;i++){const T=max*i/400,v=rc(V,R,C,T,mode).vc;path+=(i?"L":"M")+xx(T).toFixed(1)+" "+yy(v).toFixed(1)+" "}
 const spot=rc(V,R,C,t,mode);
 s+='<path d="'+path+'" fill="none" stroke="#6bb7ff" stroke-width="3"/><path d="M'+xx(t)+' 20 V227" stroke="#ffe393" stroke-dasharray="6 5" stroke-width="2"/><circle cx="'+xx(t)+'" cy="'+yy(spot.vc)+'" r="5" fill="#ffe393"/><text x="16" y="18" font-size="13" fill="#9bd4ff">CH2 · V_C(t) [V]</text></svg>';
 return s;
}
function markup(){return '<div class="aca-frame"><div class="aca-head"><b>VIRTUAL ELECTRONICS ACADEMY</b><h2>Build a breadboard, measure waveforms and write the lab report.</h2><p>Public-safe, independently implemented classroom models · no real instrument connected</p></div>'+
 '<div class="aca-tabs"><button data-aca="circuit" aria-pressed="true">① Circuit + probes</button><button data-aca="pins">② Arduino / STM32</button><button data-aca="code">③ Code + terminal</button><button data-aca="report">④ Lab report</button></div>'+
 '<section data-aca-panel="circuit"><div class="aca-card"><h3>TECH 60 Lab 7 · series / parallel resistors</h3><p>Connect the six required jumper paths before enabling the simulated source. Resistance readings are predicted from the circuit equations, not copied from the original report.</p>'+
 '<div class="aca-forms"><label>Vs [V]<input id="acaV" type="number" value="9" min="0" max="24" step=".1"></label><label>R1 [Ω]<input id="acaR1" type="number" value="330" min="1"></label><label>R2 [Ω]<input id="acaR2" type="number" value="1000" min="1"></label><label>R3 [Ω]<input id="acaR3" type="number" value="470" min="1"></label><label>R4 [Ω]<input id="acaR4" type="number" value="220" min="1"></label></div>'+
 '<div id="acaDrawing" class="aca-svg"></div>'+
 '<div class="aca-scope"><h4>Four-channel oscilloscope probe exercise · ideal source step</h4><p>CH1 source / CH2 node A / CH3 node B / CH4 parallel voltage. This is an ideal resistor-network calculation, not a measured 1 GHz signal or a physically characterized transient.</p><div class="aca-form-ranges"><label>A marker [ns] <input id="acaScopeA" type="range" min="0" max="1000" value="180"></label><label>B marker [ns] <input id="acaScopeB" type="range" min="0" max="1000" value="560"></label><label><input id="acaScopeLink" type="checkbox" checked> Link B to A</label></div><div id="acaScopeChart" class="aca-svg"></div><div id="acaScopeStats" role="status"></div><button id="acaScopeExport">Export four-channel CSV</button></div><div class="aca-forms"><label>Jumper A<select id="acaWireA"></select></label><label>Jumper B<select id="acaWireB"></select></label><button id="acaConnect">Connect wire</button><button id="acaAutoWire">Load reference wiring</button><button id="acaResetWire">Remove wires</button><button id="acaPower">Power ON/OFF</button></div>'+
 '<div id="acaWireItems" class="aca-wire-items"></div><p id="acaWireMessage" role="status"></p>'+
 '<div class="aca-columns"><div class="aca-card"><h4>Probe placement / DMM</h4><p>CH1 source, CH2 node A, CH3 node B, CH4 voltage across R2/R3.</p><div class="aca-forms"><label>Probe positive<select id="acaPlus"></select></label><label>Probe negative<select id="acaMinus"></select></label></div><div id="acaMeter"></div><div id="acaValues"></div></div><div class="aca-card"><h4>Step-by-step equations</h4><div id="acaEquations"></div><button id="acaCsv">Download calculated node CSV</button></div></div></div>'+
 '<div class="aca-card"><h3>Physics 2B · 4.5 V low-voltage RC experiment</h3><p>Model τ = RC using the manual’s 150 Ω resistor and 1.0 F capacitor. The higher-voltage classroom exercises are not physical build instructions.</p>'+
 '<div class="aca-forms"><label>Supply [V]<input id="acaRcV" type="number" value="4.5" min=".1" max="12" step=".1"></label><label>Resistance [Ω]<input id="acaRcR" type="number" value="150" min="1"></label><label>Capacitance [F]<input id="acaRcC" type="number" value="1" min=".00001" step=".1"></label><label>Model<select id="acaRcMode"><option value="charge">Charging</option><option value="discharge">Discharging</option></select></label></div><label>Time cursor <input type="range" min="0" max="100" value="30" id="acaRcCursor"></label><div class="aca-svg" id="acaRcPlot"></div><div id="acaRcReadings"></div><button id="acaRcCsv">Download 501 calculated RC samples</button></div></section>'+
 '<section data-aca-panel="pins" hidden><div id="academyPinLab"></div></section>'+
 '<section data-aca-panel="code" hidden><div id="academyCodeStudio"></div></section>'+
 '<section data-aca-panel="report" hidden><div class="aca-card"><h3>Physics 2B · seven mandatory laboratory sections</h3><p>Report content stays in this browser until saved. Include all experiment questions, show units, and distinguish simulation from actual measurements.</p><div id="acaReport"></div><div class="aca-forms"><button id="acaAppendData">Insert predicted values</button><button id="acaPreview">Preview</button><button id="acaReportCsv">Download Markdown report</button><button id="acaReportReset">Reset</button></div><pre id="acaReportPreview" class="aca-preview"></pre></div></section><p class="aca-disclaimer">References: TECH 60 series/parallel / Arduino lab ideas; Physics 2B RC manual; official ST and Arduino pinouts. Employer-proprietary waveform captures and setup commands are not included.</p></div>'}
function mount(root){
 if(!root)return;root.innerHTML=markup();const $=q=>root.querySelector(q);
 const tab=k=>{root.querySelectorAll("[data-aca]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.aca===k)));root.querySelectorAll("[data-aca-panel]").forEach(p=>p.hidden=p.dataset.acaPanel!==k)};
 root.querySelectorAll("[data-aca]").forEach(b=>b.onclick=()=>tab(b.dataset.aca));
 let wires=[],power=false,report=(()=>{try{return {...reportStart(),...JSON.parse(localStorage.getItem("aca-report-v1"))}}catch{return reportStart()}})();
 for(const id of ["acaWireA","acaWireB","acaPlus","acaMinus"])$( "#"+id).innerHTML=endpoints.map(v=>'<option>'+e(v)+'</option>').join("");
 $("#acaWireA").value="V+";$("#acaWireB").value="R1+";$("#acaPlus").value="R1-";$("#acaMinus").value="GND";
 const valid=()=>needed.every(([a,b])=>wires.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a)));
 const ckt=()=>calc(...["V","R1","R2","R3","R4"].map(k=>Number($("#aca"+k).value)));
 const math=t=>window.studyMath?window.studyMath(t,true):e(t);
 function updateCircuit(){
  const d=ckt();if(!d){power=false;$("#acaWireMessage").textContent="ERROR: all resistor values must be greater than zero";return}
  if(!valid())power=false;
  $("#acaDrawing").innerHTML=svgCircuit(d,wires,power);
  const sc=renderFourChannelScope(d,power,Number($("#acaScopeA").value),Number($("#acaScopeB").value));
  $("#acaScopeChart").innerHTML=sc.svg;$("#acaScopeStats").innerHTML=sc.stats;
  $("#acaWireItems").innerHTML=wires.map((w,i)=>'<button data-remove="'+i+'">✕ '+e(w.join(" ↔ "))+'</button>').join("");
  $("#acaWireMessage").textContent=valid()?("PASS — correct jumper topology; supply "+(power?"ON":"OFF")):("Connect remaining "+needed.filter(([a,b])=>!wires.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a))).length+" jumpers before powering on.");
  const n={"V+":d.V,"R1+":d.V,"R1-":d.node1,"R2+":d.node1,"R2-":d.node2,"R3+":d.node1,"R3-":d.node2,"R4+":d.node2,"R4-":0,"GND":0};
  $("#acaMeter").innerHTML='<div class="aca-meter">'+(power?f(n[$("#acaPlus").value]-n[$("#acaMinus").value],4)+" V":"SUPPLY OFF")+'</div>';
  const rows=[["R_total",d.Rt,"Ω"],["I_total",d.I*1e3,"mA"],["I_R2",d.i2*1e3,"mA"],["I_R3",d.i3*1e3,"mA"],["Node A",d.node1,"V"],["Node B",d.node2,"V"],["Parallel drop",d.vp,"V"],["KCL residual",d.kcl*1e3,"mA"],["KVL residual",d.kvl,"V"]];
  $("#acaValues").innerHTML='<table class="aca-table">'+rows.map(r=>'<tr><td>'+r[0]+'</td><td>'+f(r[1],6)+' '+r[2]+'</td></tr>').join("")+'</table>';
  $("#acaEquations").innerHTML='<div class="aca-formula">'+math("R_total = R_1 + (R_2*R_3)/(R_2+R_3)+R_4")+'</div><p>Substitute: '+f(d.R1,0)+' + ('+f(d.R2,0)+' × '+f(d.R3,0)+')/('+f(d.R2,0)+' + '+f(d.R3,0)+') + '+f(d.R4,0)+' = <b>'+f(d.Rt,3)+' Ω</b></p>'+
  '<div class="aca-formula">'+math("I_total = V_s/R_total")+'</div><p>'+f(d.V,2)+' / '+f(d.Rt,3)+' = '+f(d.I*1000,3)+' mA</p><p>KCL: I_total = I_R2 + I_R3.<br>KVL: V_s = V_R1 + V_parallel + V_R4.</p>';
 }
 for(const id of ["acaV","acaR1","acaR2","acaR3","acaR4","acaPlus","acaMinus"])$("#"+id).onchange=updateCircuit;
 $("#acaConnect").onclick=()=>{let a=$("#acaWireA").value,b=$("#acaWireB").value;if(a!==b&&!wires.some(w=>w.includes(a)&&w.includes(b)))wires.push([a,b]);updateCircuit()};
 $("#acaAutoWire").onclick=()=>{wires=needed.map(p=>[...p]);updateCircuit()};
 $("#acaResetWire").onclick=()=>{wires=[];power=false;updateCircuit()};
 $("#acaPower").onclick=()=>{if(valid())power=!power;updateCircuit()};
 $("#acaWireItems").onclick=ev=>{const b=ev.target.closest("[data-remove]");if(!b)return;wires.splice(Number(b.dataset.remove),1);updateCircuit()};
 let scopeGap=380;
 $("#acaScopeA").oninput=()=>{
  if($("#acaScopeLink").checked){
   const t=Number($("#acaScopeA").value);$("#acaScopeB").value=String(limit(t+scopeGap,0,1000));
  }
  updateCircuit();
 };
 $("#acaScopeB").oninput=()=>{scopeGap=Number($("#acaScopeB").value)-Number($("#acaScopeA").value);updateCircuit()};
 $("#acaScopeLink").onchange=()=>{scopeGap=Number($("#acaScopeB").value)-Number($("#acaScopeA").value);updateCircuit()};
 $("#acaScopeExport").onclick=()=>{
  const d=ckt();if(!d)return;let out="time_ns,CH1_Vsource_V,CH2_NodeA_V,CH3_NodeB_V,CH4_Vparallel_V\n";
  for(let i=0;i<=100;i++){const v=power&&i>=10?[d.V,d.node1,d.node2,d.vp]:[0,0,0,0];out+=[i*10,...v].join(",")+"\n"}
  download("tech60-four-channel-ideal-scope.csv",out,"text/csv");
 };
 $("#acaCsv").onclick=()=>{const d=ckt();if(!d)return;const n=[["Source",d.V],["A",d.node1],["B",d.node2],["Ground",0]];download("tech60-node-predictions.csv","point,voltage_V\n"+n.map(x=>x.join(",")).join("\n")+"\n","text/csv")};
 function updateRC(){
  const V=Number($("#acaRcV").value),R=Number($("#acaRcR").value),C=Number($("#acaRcC").value),mode=$("#acaRcMode").value;
  if(!(V>0&&R>0&&C>0)){ $("#acaRcReadings").textContent="Voltage, R and C must be positive.";return}
  const t=Number($("#acaRcCursor").value)/100*5*R*C,x=rc(V,R,C,t,mode);
  $("#acaRcPlot").innerHTML=svgRC(V,R,C,mode,t);
  $("#acaRcReadings").innerHTML='<div class="aca-formula">'+math("tau = R*C")+'</div><div class="aca-formula">'+math(mode==="charge"?"V_C = V_s*(1-e^(-t/tau))":"V_C = V_0*e^(-t/tau)")+'</div>'+
   '<p>τ = <b>'+f(x.tau,3)+' s</b>; time = '+f(t,3)+' s; capacitor = '+f(x.vc,4)+' V; resistor current = '+f(x.i*1000,4)+' mA; half-life = '+f(x.tau*Math.LN2,3)+' s.</p>';
 }
 for(const id of ["acaRcV","acaRcR","acaRcC","acaRcMode","acaRcCursor"])$("#"+id).oninput=updateRC;
 $("#acaRcCsv").onclick=()=>{const V=Number($("#acaRcV").value),R=Number($("#acaRcR").value),C=Number($("#acaRcC").value),mode=$("#acaRcMode").value;if(!(V>0&&R>0&&C>0))return;let out="time_s,Vs_V,Vc_V,Vr_V,I_A\n";for(let i=0;i<=500;i++){const x=rc(V,R,C,i/500*5*R*C,mode);out+=[x.t,x.vs,x.vc,x.vr,x.i].join(",")+"\n"}download("phys2b-rc-waveforms.csv",out,"text/csv")};
 const labels=[["title","1 · Title"],["purpose","2 · Purpose"],["description","3 · Description"],["procedure","4 · Procedure and safety"],["observations","5 · Data / Observations"],["analysis","6 · Analysis and error"],["conclusion","7 · Conclusions"]];
 function paintReport(){
  $("#acaReport").innerHTML=labels.map(([key,label])=>'<label class="aca-field"><strong>'+label+'</strong><textarea rows="'+(key==="analysis"?6:3)+'" data-field="'+key+'">'+e(report[key])+'</textarea></label>').join("");
  $("#acaReport").oninput=ev=>{const id=ev.target.dataset.field;if(!id)return;report[id]=ev.target.value;try{localStorage.setItem("aca-report-v1",JSON.stringify(report))}catch{}};
 }
 function markdown(){return "# "+report.title+"\n\n> All generated calculations are educational models, not physical bench measurements.\n\n"+labels.slice(1).map(([key,l])=>"## "+l+"\n\n"+report[key]+"\n").join("\n")}
 $("#acaAppendData").onclick=()=>{const d=ckt();if(!d)return;report.observations+="\nCalculated (not measured): Vs="+f(d.V,2)+" V; Rtotal="+f(d.Rt,3)+" Ω; Itotal="+f(d.I*1e3,3)+" mA; Vparallel="+f(d.vp,3)+" V; KCL residual="+f(d.kcl,9)+" A.";paintReport()};
 $("#acaPreview").onclick=()=>$("#acaReportPreview").textContent=markdown();
 $("#acaReportCsv").onclick=()=>download("virtual-lab-report.md",markdown(),"text/markdown");
 $("#acaReportReset").onclick=()=>{report=reportStart();paintReport();$("#acaReportPreview").textContent="";try{localStorage.setItem("aca-report-v1",JSON.stringify(report))}catch{}};
 updateCircuit();updateRC();paintReport();
 if(window.mountAcademyPins)window.mountAcademyPins($("#academyPinLab"));
 if(window.mountAcademyIDE)window.mountAcademyIDE($("#academyCodeStudio"));
}
window.virtualAcademyMath={calc,rc,needed};
window.mountVirtualAcademy=mount;
})();