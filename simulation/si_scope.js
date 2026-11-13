"use strict";
(function(){
var runs=window.SI_SPICE_RUNS||[],colors=["#6a99ff","#39d4ad","#ff7393"];
var st={run:runs[1]||runs[0],start:0,end:15,time:2.3,channels:[true,true,true],playing:false,raf:0,step:0,attempts:0,solved:false};
var qs=[
["For RL=200 Ω and Z0=50 Ω, what is ΓL?",["−0.60","0","+0.60","+1.00"],2,"Compute (200−50)/(200+50).","+0.60: the positive reflection increases the first received voltage."],
["For Rsrc=20 Ω, Z0=50 Ω, RL=200 Ω, what is Vfirst?",["0.500 V","0.714 V","1.143 V","0.909 V"],2,"Vlaunch=50/(20+50)=0.7143 V; multiply by (1+ΓL).","0.7143×1.6=1.1429 V. The later DC voltage is 0.9091 V."],
["The 8 nH and 3 pF package model peaks above 1.2 V. What does that prove?",["A real board failed","Synopsys verified it","The model predicts overshoot","Every receiver fails"],2,"Is this a modeled circuit or measured hardware?","These are ngspice results for specified lumped components, not a board measurement."],
["Which result supports a matched load?",["ΓL≈0; no load reflection","A terminal says PASS","The source is 1 V","A plot opens"],0,"What happens when RL=Z0?","ΓL=(50−50)/(50+50)=0. Compare the matched 50 Ω run."]
];
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
window.renderSpiceScope=function(){
return '<section id="siStudio" class="si-studio"><div class="si-label">NGSPICE 47 · REAL SIMULATOR SAMPLES · SEVEN CIRCUIT RUNS</div>'+
'<h4>Interactive Transmission-Line Waveform Studio</h4><p>Change the load or package model and inspect the computed receiver waveform. The graph is not a physical oscilloscope capture.</p>'+
'<div class="si-origin">NGSPICE VERIFIED MODEL · NOT SYNOPSYS / VERDI VERIFIED</div>'+
'<div class="si-tools"><label>Choose a completed simulation <select id="siCase">'+runs.map(function(r){return '<option value="'+E(r.id)+'">'+E(r.label)+'</option>'}).join("")+'</select></label>'+
'<div class="si-toolbuttons"><button id="siPlay">▶ Replay</button><button id="siPlus">Zoom +</button><button id="siMinus">Zoom −</button><button id="siLeft">← Pan</button><button id="siRight">Pan →</button><button id="siFit">Fit</button></div></div>'+
'<div class="si-legend">'+["Source V(vs)","Transmitter V(tx)","Receiver V(rx)"].map(function(n,i){return '<label><input data-si-ch="'+i+'" type="checkbox" checked><i style="background:'+colors[i]+'"></i>'+n+'</label>'}).join("")+'</div>'+
'<div class="si-screen"><div class="si-screenbar">Transient voltage · V vs ns <span id="siViewWindow">0–15 ns</span></div><svg id="siPlot" viewBox="0 0 1040 410" role="img" aria-label="ngspice source transmitter and receiver voltage graph"></svg><div class="si-screenfoot">Tap or drag to inspect values at the exact cursor time. Zoom and pan to inspect reflected waves.</div></div>'+
'<div class="si-timebar"><label>Cursor: <b id="siTimeLabel">2.30 ns</b></label><input type="range" min="0" max="15" step=".01" value="2.3" id="siTime"></div>'+
'<div class="si-values">'+["Source","Transmitter","Receiver","Receiver peak","DC expected","Load Γ"].map(function(n,i){return '<div><small>'+n+'</small><strong id="siV'+i+'">—</strong></div>'}).join("")+'</div>'+
'<div class="si-circuit">1 V step (t=1 ns) &nbsp;→&nbsp; Rsrc=20 Ω &nbsp;→&nbsp; line Z₀=50 Ω (TD=1 ns) &nbsp;→&nbsp; <strong id="siLoad">load</strong></div>'+
'<p id="siFinding" class="si-finding"></p><div class="si-math">ΓL=(RL−Z₀)/(RL+Z₀) &nbsp; | &nbsp; Vlaunch=Z₀/(Rsrc+Z₀) &nbsp; | &nbsp; Vfirst=Vlaunch(1+ΓL)</div>'+
'<div class="si-evidence"><button id="siCSV">Download waveform CSV</button><a id="siNetlist" target="_blank" rel="noopener">Read reproducible netlist</a><a href="simulation/README.md" target="_blank" rel="noopener">Simulation methods</a></div>'+
'<div class="si-quiz"><div class="si-label">LEARN WITH GUIDED REATTEMPTS</div><span id="siCount">Question 1 / 4</span><h5 id="siQuestion"></h5><div id="siOptions"></div><p id="siFeedback" aria-live="polite"></p><button id="siHint">Give me a hint</button><button id="siNext" disabled>Next step →</button></div>'+
'<p class="si-caveat">Selecting a scenario replays stored samples from a different ngspice transient run. No cloud solver is running when you click. Lossless transmission lines and optional lumped L/C simplify real hardware; no actual board, Synopsys verification, eye compliance, or physical sign-off is claimed.</p></section>';
};
window.mountSpiceScope=function(root){
 if(!root||!runs.length)return;
 var $=function(s){return root.querySelector(s)},all=function(s){return [].slice.call(root.querySelectorAll(s))};
 $("#siCase").value=st.run.id;
 function nearest(){
  var a=st.run.trace,lo=0,hi=a.length-1;
  while(lo<hi){var m=(lo+hi)>>1;if(a[m][0]<st.time)lo=m+1;else hi=m}
  if(lo>0&&Math.abs(a[lo-1][0]-st.time)<Math.abs(a[lo][0]-st.time))lo--;
  return a[lo];
 }
 function readout(){
  var a=nearest(),r=st.run;
  $("#siTimeLabel").textContent=st.time.toFixed(2)+" ns";$("#siTime").value=st.time;
  [a[1],a[2],a[3],r.peak_v,r.dc_expected_v].forEach(function(v,i){$("#siV"+i).textContent=v.toFixed(4)+" V"});
  $("#siV5").textContent=(r.gamma_load>=0?"+":"")+r.gamma_load.toFixed(4);
  $("#siLoad").textContent=r.rl>=10000?r.rl/1000000+" MΩ":r.rl+" Ω";
  $("#siViewWindow").textContent=st.start.toFixed(2)+"–"+st.end.toFixed(2)+" ns";
  $("#siNetlist").href=r.source_circuit;
  $("#siFinding").textContent=r.note+" Receiver peak "+r.peak_v.toFixed(4)+" V; theoretical DC level "+
   r.dc_expected_v.toFixed(4)+" V. This is an ngspice model under the listed assumptions.";
 }
 function draw(){
  var sx=90,ex=1014,sy=40,ey=338,min=-.2,max=1.65,run=st.run;
  var X=function(t){return sx+(t-st.start)/(st.end-st.start)*(ex-sx)},Y=function(v){return ey-(v-min)/(max-min)*(ey-sy)};
  var s='<rect width="1040" height="410" fill="#0b172d"/>';
  for(var v=-.2;v<=1.61;v+=.2){
   s+='<line x1="'+sx+'" x2="'+ex+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="#34485e" stroke-dasharray="4 5"/>';
   s+='<text x="82" y="'+(Y(v)+5)+'" text-anchor="end" fill="#c9dcef" font-size="14">'+v.toFixed(1)+'</text>';
  }
  var dx=(st.end-st.start)<=4?.5:(st.end-st.start)<=8?1:2;
  for(var t=Math.ceil(st.start/dx)*dx;t<=st.end+.001;t+=dx){
   s+='<line x1="'+X(t)+'" x2="'+X(t)+'" y1="'+sy+'" y2="'+ey+'" stroke="#203650"/>';
   s+='<text x="'+X(t)+'" y="368" text-anchor="middle" fill="#c7dcf1" font-size="13">'+t.toFixed(1)+'</text>';
  }
  s+='<text x="98" y="22" fill="#eff9ff" font-size="15">Voltage (V)</text><text x="1000" y="392" text-anchor="end" fill="#eff9ff" font-size="14">Time (ns)</text>';
  for(var ch=0;ch<3;ch++)if(st.channels[ch]){
   var a=run.trace.filter(function(z){return z[0]>=st.start-.05&&z[0]<=st.end+.05});
   var path=a.map(function(z,i){return (i?"L":"M")+X(z[0]).toFixed(2)+" "+Y(z[ch+1]).toFixed(2)}).join(" ");
   s+='<path d="'+path+'" fill="none" stroke="'+colors[ch]+'" stroke-width="'+(ch===2?3.5:2.2)+'"/>';
  }
  if(st.time>=st.start&&st.time<=st.end){
   var p=nearest(),x=X(st.time);
   s+='<line x1="'+x+'" x2="'+x+'" y1="'+sy+'" y2="'+ey+'" stroke="#ffe89f" stroke-dasharray="7 5" stroke-width="2"/>';
   for(var j=0;j<3;j++)if(st.channels[j])s+='<circle cx="'+x+'" cy="'+Y(p[j+1])+'" r="5" fill="'+colors[j]+'" stroke="white"/>';
  }
  $("#siPlot").innerHTML=s;readout();
 }
 function seek(t){st.time=Math.max(0,Math.min(15,t));draw()}
 function windowTo(a,b){var w=Math.max(1,Math.min(15,b-a)),left=Math.max(0,Math.min(15-w,a));st.start=left;st.end=left+w;draw()}
 function stop(){st.playing=false;cancelAnimationFrame(st.raf);$("#siPlay").textContent="▶ Replay"}
 $("#siCase").onchange=function(){stop();st.run=runs.find(function(r){return r.id===$("#siCase").value})||runs[0];st.start=0;st.end=15;seek(2.3)};
 $("#siTime").oninput=function(){stop();seek(Number(this.value))};
 all("[data-si-ch]").forEach(function(c){c.onchange=function(){st.channels[Number(c.dataset.siCh)]=c.checked;draw()}});
 $("#siPlus").onclick=function(){var m=(st.start+st.end)/2,w=(st.end-st.start)/2;windowTo(m-w/2,m+w/2)};
 $("#siMinus").onclick=function(){var m=(st.start+st.end)/2,w=(st.end-st.start)*1.7;windowTo(m-w/2,m+w/2)};
 $("#siLeft").onclick=function(){var w=(st.end-st.start)*.25;windowTo(st.start-w,st.end-w)};
 $("#siRight").onclick=function(){var w=(st.end-st.start)*.25;windowTo(st.start+w,st.end+w)};
 $("#siFit").onclick=function(){windowTo(0,15)};
 $("#siPlay").onclick=function(){
  if(st.playing){stop();return}st.playing=true;$("#siPlay").textContent="■ Pause";
  var first=st.time>=st.end?st.start:st.time,t0=performance.now();
  function play(now){if(!st.playing)return;var val=first+2*(now-t0)/1000;if(val>=st.end){stop();seek(st.end);return}seek(val);st.raf=requestAnimationFrame(play)}
  st.raf=requestAnimationFrame(play);
 };
 var svg=$("#siPlot");
 function move(e){var rect=svg.getBoundingClientRect(),x=(e.clientX-rect.left)*1040/rect.width;if(x>=90&&x<=1014)seek(st.start+(x-90)/(1014-90)*(st.end-st.start))}
 svg.addEventListener("pointerdown",function(e){stop();svg.setPointerCapture(e.pointerId);move(e)});
 svg.addEventListener("pointermove",function(e){if(e.buttons===1)move(e)});
 $("#siCSV").onclick=function(){
  var csv="time_ns,vsource_V,vtransmitter_V,vreceiver_V\n"+st.run.trace.map(function(r){return r.join(",")}).join("\n");
  var url=URL.createObjectURL(new Blob([csv],{type:"text/csv"})),a=document.createElement("a");
  a.href=url;a.download=st.run.id+"_ngspice.csv";a.click();setTimeout(function(){URL.revokeObjectURL(url)},900);
 };
 function question(){
  st.tries=0;st.solved=false;
  var q=qs[st.step];$("#siCount").textContent="Question "+(st.step+1)+" / 4";$("#siQuestion").textContent=q[0];
  $("#siOptions").innerHTML=q[1].map(function(v,i){return '<button type="button" data-si-answer="'+i+'">'+String.fromCharCode(65+i)+". "+E(v)+'</button>'}).join("");
  $("#siFeedback").className="";$("#siFeedback").textContent="";$("#siNext").disabled=true;
  $("#siNext").textContent=st.step===3?"Finish practice":"Next step →";
 }
 $("#siOptions").onclick=function(e){
  var b=e.target.closest("[data-si-answer]");if(!b||st.solved)return;var q=qs[st.step],n=Number(b.dataset.siAnswer);st.tries++;
  if(n!==q[2]){b.classList.add("wrong");$("#siFeedback").textContent="Not quite. "+(st.tries===1?q[3]:q[4])+" Try again.";return}
  b.classList.add("right");st.solved=true;all("[data-si-answer]").forEach(function(v){v.disabled=true});
  $("#siFeedback").className="correct";$("#siFeedback").textContent="Correct. "+q[4];$("#siNext").disabled=false;
 };
 $("#siHint").onclick=function(){$("#siFeedback").textContent="Hint: "+qs[st.step][3]};
 $("#siNext").onclick=function(){
  if(!st.solved)return;
  if(st.step<3){st.step++;question()}else{$("#siQuestion").textContent="Completed: you can interpret the simulated reflection waveforms.";
  $("#siOptions").innerHTML="";$("#siFeedback").className="correct";$("#siFeedback").textContent="Revisit the seven cases and explain each physical assumption.";$("#siNext").disabled=true;}
 };
 draw();question();
};
})();