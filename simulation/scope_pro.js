"use strict";
/* Instrument-style cursors and event annotations adapted from the user's VCD studio methodology.
 * Data still comes from ngspice; cursors never synthesize or alter sample values. */
(function(){
const NS="http://www.w3.org/2000/svg";
const C=["#7bb7fb","#f5bf68","#f67e9f"];
const CORR_C=["#6a99ff","#39d4ad","#ff7393","#f4be6b"];
function valAt(row,k,run){
 if(k<=3)return row[k];
 return window.sltRxCurrentScaled?window.sltRxCurrentScaled(row,run):Math.max(-0.18,Math.min(1.58,(row[3]/Math.max(25,Math.min(250,Number(run&&run.rl)||50)))*35));
}
function attr(type,props,parent,text){
 const e=document.createElementNS(NS,type);
 for(const [k,v] of Object.entries(props||{}))e.setAttribute(k,String(v));
 if(text!==undefined)e.textContent=text;
 if(parent)parent.appendChild(e);
 return e;
}
function nearest(rows,t){
 let lo=0,hi=rows.length-1;
 while(lo<hi){const m=(lo+hi)>>1;if(rows[m][0]<t)lo=m+1;else hi=m}
 if(lo>0&&Math.abs(rows[lo-1][0]-t)<Math.abs(rows[lo][0]-t))lo--;
 return rows[lo];
}
function rootHtml(){
 return '<div class="scope-pro" id="scopePro"><div class="scope-pro-heading"><b>INSTRUMENT CURSORS · EVENT TIMING · MEASUREMENTS</b><span>Dual-cursor method adapted from the local VCD laboratory</span></div>'+
 '<div class="scope-pro-inputs"><label>Cursor A <strong id="spAT">2.30 ns</strong><input type="range" id="spA" min="0" max="15" value="2.3" step=".01"/></label>'+
 '<label>Cursor B <strong id="spBT">6.00 ns</strong><input type="range" id="spB" min="0" max="15" value="6" step=".01"/></label></div>'+
 '<div class="scope-pro-pair"><button type="button" id="spLinkB" aria-pressed="true">🔗 Link B to A: ON</button><span id="spLinkHelp">B follows A during waveform replay</span></div><div class="scope-pro-metrics"><div><small>Δt (B − A)</small><b id="spDt">—</b></div><div><small>RX @ A</small><b id="spVA">—</b></div><div><small>RX @ B</small><b id="spVB">—</b></div><div><small>ΔV RX</small><b id="spDV">—</b></div><div><small>Peak RX</small><b id="spPeak">—</b></div><div><small>Steady DC</small><b id="spDC">—</b></div></div>'+
 '<div id="spMatrix" class="sp-matrix" role="status" aria-live="polite"></div><div class="scope-pro-annotations">Measured ngspice samples · <span class="sp-markerA">A</span> and <span class="sp-markerB">B</span> annotate the waveform. Source transition starts at 1 ns and reaches the receiver after the modeled line delay.</div></div>';
}
window.renderScopePro=rootHtml;
window.mountScopePro=function(root){
 if(!root||!window.SI_SPICE_RUNS)return;
 const $=s=>root.querySelector(s);
 const state={a:2.3,b:6,gap:3.7,linkedB:true,start:0,end:15,runId:"high_200",channels:[true,true,true,true]};
 Object.defineProperty(state,"correlateB",{get(){return this.linkedB},set(v){this.linkedB=Boolean(v)}});
 function update(data){
  if(data){
   state.runId=data.run;state.start=data.start;state.end=data.end;
   if(Number.isFinite(data.time))state.a=data.time;
   if(Array.isArray(data.channels))state.channels=data.channels.slice(0,4);
  }
  if(state.linkedB)state.b=Math.max(0,Math.min(15,state.a+state.gap));
  root.__scopeProState=state;
  const run=window.SI_SPICE_RUNS.find(x=>x.id===state.runId)||window.SI_SPICE_RUNS[0];
  const A=nearest(run.trace,state.a),B=nearest(run.trace,state.b);
  $("#spA").value=state.a;$("#spB").value=state.b;
  $("#spAT").textContent=state.a.toFixed(2)+" ns";$("#spBT").textContent=state.b.toFixed(2)+" ns";
  $("#spDt").textContent=(state.b-state.a).toFixed(2)+" ns";
  $("#spVA").textContent=A[3].toFixed(4)+" V";$("#spVB").textContent=B[3].toFixed(4)+" V";
  $("#spDV").textContent=(B[3]-A[3]).toFixed(4)+" V";
  $("#spPeak").textContent=run.peak_v.toFixed(4)+" V";
  $("#spDC").textContent=run.dc_expected_v.toFixed(4)+" V";
  $("#spLinkB").textContent=state.linkedB?"🔗 Link B to A: ON":"Unlink B: OFF";
  $("#spLinkB").setAttribute("aria-pressed",String(state.linkedB));
  const names=["Vsource","Vtx","Vrx","Iload (calculated)"];
  const units=["V","V","V","mA"];
  const vals=row=>[row[1],row[2],row[3],row[3]/run.rl*1000];
  const av=vals(A),bv=vals(B);
  $("#spMatrix").innerHTML='<table><thead><tr><th>Signal</th><th>@ A</th><th>@ B</th><th>Δ(B−A)</th></tr></thead><tbody>'+
   names.map((name,i)=>'<tr><th>'+name+'</th><td>'+av[i].toFixed(4)+' '+units[i]+'</td><td>'+bv[i].toFixed(4)+' '+units[i]+'</td><td>'+(bv[i]-av[i]).toFixed(4)+' '+units[i]+'</td></tr>').join("")+'</tbody></table>';
  root.dispatchEvent(new CustomEvent("slt:scope-pro-ab",{detail:{a:state.a,b:state.b,correlate:state.linkedB}}));
  const svg=root.querySelector("#siPlot");
  if(!svg)return;
  svg.querySelectorAll(".scope-pro-graphic").forEach(n=>n.remove());
  const g=attr("g",{"class":"scope-pro-graphic"},svg);
  const W=924,ox=90,ystart=38,yend=338;
  function drawTime(t,label,color){
   if(t<state.start||t>state.end)return;
   const x=ox+(t-state.start)/(state.end-state.start)*W;
   attr("line",{x1:x,y1:ystart,x2:x,y2:yend,stroke:color,"stroke-width":"2","stroke-dasharray":"7 5"},g);
   attr("rect",{x:Math.max(90,Math.min(965,x-32)),y:43,width:66,height:26,rx:5,fill:"#1f3651",stroke:color},g);
   attr("text",{x:Math.max(123,Math.min(998,x)),y:61,"font-size":"15","font-weight":"800","text-anchor":"middle",fill:color},g,label+" "+t.toFixed(2));
  }
  const left=Math.max(state.start,Math.min(state.a,state.b)),right=Math.min(state.end,Math.max(state.a,state.b));
  if(right>left)attr("rect",{x:ox+(left-state.start)/(state.end-state.start)*W,y:38,width:(right-left)/(state.end-state.start)*W,height:300,fill:"#5fe2c4","fill-opacity":".07"},g);
  const aIn=state.a>=state.start&&state.a<=state.end,bIn=state.b>=state.start&&state.b<=state.end;
  if(aIn&&bIn){
   const pxA=ox+(state.a-state.start)/(state.end-state.start)*W,pxB=ox+(state.b-state.start)/(state.end-state.start)*W;
   [1,2,3,4].forEach(k=>{
    if(!state.channels[k-1])return;
    const pyA=Math.max(38,Math.min(338,338-(valAt(A,k,run)+.2)/(1.65+.2)*298));
    const pyB=Math.max(38,Math.min(338,338-(valAt(B,k,run)+.2)/(1.65+.2)*298));
    attr("line",{"class":"ks-corr-line","data-corr-ch":k,x1:pxA.toFixed(2),y1:pyA.toFixed(2),x2:pxB.toFixed(2),y2:pyB.toFixed(2),stroke:CORR_C[k-1],"stroke-width":"1.8","stroke-dasharray":"5 3",opacity:"0.88"},g);
   });
  }
  drawTime(state.a,"A","#f6c86f");drawTime(state.b,"B","#5fe2c4");
  [[state.a,A,"A","#f6c86f","ks-marker-a-dot"],[state.b,B,"B","#5fe2c4","ks-marker-b-dot ks-dot-b"]].forEach(([t,row,label,color,cls])=>{
   if(t<state.start||t>state.end)return;
   const px=ox+(t-state.start)/(state.end-state.start)*W;
   [1,2,3,4].forEach(k=>{
    if(!state.channels[k-1])return;
    const py=338-(valAt(row,k,run)+.2)/(1.65+.2)*298;
    attr("circle",{"class":cls,cx:px,cy:Math.max(38,Math.min(338,py)),r:5,fill:color,stroke:"#091627","stroke-width":1.5,"data-marker":label,"data-channel":k},g);
   });
  });
  const rise=1,arrival=2.1;
  if(rise>=state.start&&rise<=state.end){
   const x=ox+(rise-state.start)/(state.end-state.start)*W;
   attr("line",{x1:x,y1:69,x2:x,y2:338,stroke:"#7591bd","stroke-dasharray":"3 6","stroke-width":"1"},g);
   attr("text",{x:x+5,y:92,fill:"#adc5ea","font-size":"13"},g,"SRC STEP");
  }
  if(arrival>=state.start&&arrival<=state.end){
   const x=ox+(arrival-state.start)/(state.end-state.start)*W;
   attr("text",{x:x+10,y:319,fill:"#e7e2bb","font-size":"13"},g,"RX first arrival ≈ 2.1ns");
  }
 }
 function syncMobile(){
  const timeInput=root.querySelector("#siTime");
  if(window.sltMobileScope)window.sltMobileScope(window.SI_SPICE_RUNS.find(x=>x.id===state.runId)||window.SI_SPICE_RUNS[0],{start:state.start,end:state.end,time:Number(timeInput?timeInput.value:state.a),channels:state.channels},root);
 }
 $("#spA").oninput=e=>{state.a=Number(e.target.value);update();root.dispatchEvent(new CustomEvent("slt:scope-seek",{detail:{time:state.a}}));syncMobile()};
 $("#spB").oninput=e=>{state.b=Number(e.target.value);state.gap=state.b-state.a;update();syncMobile()};
 $("#spLinkB").onclick=()=>{state.linkedB=!state.linkedB;if(state.linkedB)state.gap=state.b-state.a;update();syncMobile()};

 root.addEventListener("slt:scope-redraw",e=>update(e.detail));
 update();
};
})();
