"use strict";
/* Instrument-style cursors and event annotations adapted from the user's VCD studio methodology.
 * Data still comes from ngspice; cursors never synthesize or alter sample values. */
(function(){
const NS="http://www.w3.org/2000/svg";
const C=["#7bb7fb","#f5bf68","#f67e9f"];
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
 '<div class="scope-pro-metrics"><div><small>Δt (B − A)</small><b id="spDt">—</b></div><div><small>RX @ A</small><b id="spVA">—</b></div><div><small>RX @ B</small><b id="spVB">—</b></div><div><small>ΔV RX</small><b id="spDV">—</b></div><div><small>Peak RX</small><b id="spPeak">—</b></div><div><small>Steady DC</small><b id="spDC">—</b></div></div>'+
 '<div class="scope-pro-annotations">Measured ngspice samples · <span class="sp-markerA">A</span> and <span class="sp-markerB">B</span> annotate the waveform. Source transition starts at 1 ns and reaches the receiver after the modeled line delay.</div></div>';
}
window.renderScopePro=rootHtml;
window.mountScopePro=function(root){
 if(!root||!window.SI_SPICE_RUNS)return;
 const $=s=>root.querySelector(s);
 const state={a:2.3,b:6,start:0,end:15,runId:"high_200"};
 function update(data){
  if(data){state.runId=data.run;state.start=data.start;state.end=data.end}
  const run=window.SI_SPICE_RUNS.find(x=>x.id===state.runId)||window.SI_SPICE_RUNS[0];
  const A=nearest(run.trace,state.a),B=nearest(run.trace,state.b);
  $("#spAT").textContent=state.a.toFixed(2)+" ns";$("#spBT").textContent=state.b.toFixed(2)+" ns";
  $("#spDt").textContent=(state.b-state.a).toFixed(2)+" ns";
  $("#spVA").textContent=A[3].toFixed(4)+" V";$("#spVB").textContent=B[3].toFixed(4)+" V";
  $("#spDV").textContent=(B[3]-A[3]).toFixed(4)+" V";
  $("#spPeak").textContent=run.peak_v.toFixed(4)+" V";
  $("#spDC").textContent=run.dc_expected_v.toFixed(4)+" V";
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
  drawTime(state.a,"A","#f6c86f");drawTime(state.b,"B","#5fe2c4");
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
 $("#spA").oninput=e=>{state.a=Number(e.target.value);update()};
 $("#spB").oninput=e=>{state.b=Number(e.target.value);update()};
 root.addEventListener("slt:scope-redraw",e=>update(e.detail));
 update();
};
})();
