"use strict";
/* Board-level oscilloscope v2.
 * DATA PROVENANCE: 48 stored ngspice-47 runs, with 16 ns original and 240 ns
 * multicycle transient runs. The SVG renders actual samples; no invented noise,
 * phase, repeated copies, fake resonance or fabricated clock captures.
 */
(function(){
const CONFIG=[
 {name:"SOURCE",short:"Vsrc",index:1,unit:"V",color:"#f5da49",type:"Stimulus voltage",about:"Source: 80 ns period, 40 ns high; not a clock"},
 {name:"TX NODE",short:"Vtx",index:2,unit:"V",color:"#60e19b",type:"Driver voltage",about:"Node after 20 Ω source/driver resistance"},
 {name:"RX NODE",short:"Vrx",index:4,unit:"V",color:"#5d9eff",type:"Receiver voltage",about:"Load voltage at 200 Ω, Cload and optional NMOS"},
 {name:"NMOS GATE",short:"Vgate",index:5,unit:"V",color:"#ff82bc",type:"Gate-control voltage",about:"Optional 60 ns-period 3.3 V pulse"},
 {name:"BRANCH CURRENT",short:"Itrace",index:6,unit:"mA",color:"#66e5de",type:"Inductor current",about:"Actual ngspice Ltrace branch current"},
 {name:"SERIES LOSS",short:"Pseries",index:7,unit:"mW",color:"#ffbd72",type:"Derived heat rate",about:"Calculated Itrace² × added-series resistance; not a thermal model"}
];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=(v,u)=> (Math.abs(v)>=100?v.toFixed(1):Math.abs(v)>=1?v.toFixed(3):v.toFixed(4))+" "+u;
function samples(run,mode){return mode==="cycles"?(window.SLT_BOARD_CYCLES?.[run.id]||run.samples):run.samples}
function endTime(mode){return mode==="cycles"?240:16}
function value(r,k,run){return k===5?r[6]*r[6]/1000*run.series_r:r[CONFIG[k].index]}
function nearest(rows,t){
 let lo=0,hi=rows.length-1;
 while(lo<hi){let mid=(lo+hi)>>1;if(rows[mid][0]<t)lo=mid+1;else hi=mid}
 if(lo>0&&Math.abs(rows[lo-1][0]-t)<Math.abs(rows[lo][0]-t))lo--;
 return rows[lo];
}
function cross(rows,col,level,minSpacing=2){
 const result=[];let last=-1e9;
 for(let i=1;i<rows.length;i++){
  const a=rows[i-1],b=rows[i],p=a[col],q=b[col];
  const rise=p<level&&q>=level,fall=p>=level&&q<level;
  if((rise||fall)&&b[0]-last>minSpacing){
   const f=Math.abs(q-p)>1e-12?clamp((level-p)/(q-p),0,1):1;
   const t=a[0]+(b[0]-a[0])*f;
   result.push({t,dir:rise?"rise":"fall",kind:col===1?"source":"gate",ch:col===1?0:3});
   last=t;
  }
 }
 return result;
}
function events(run,mode){
 const rows=samples(run,mode),length=endTime(mode);
 const src=cross(rows,1,run.supply*.5);
 const gates=run.nmos?cross(rows,5,1.65):[];
 const all=src.concat(gates).filter(e=>e.t<=length).sort((a,b)=>a.t-b.t);
 return all.map((e,i)=>{
  const n=nearest(rows,clamp(e.t+.45,0,length)),before=nearest(rows,clamp(e.t-.15,0,length));
  const drx=n[4]-before[4],di=n[6]-before[6];
  const nm=e.kind==="source"?"SOURCE":"NMOS GATE";
  const label=nm+" "+(e.dir==="rise"?"RISING ↑":"FALLING ↓");
  const explanation=e.kind==="source"?
   (e.dir==="rise"?"Voltage source steps HIGH. Driver and trace inductance control the current ramp; RX follows with RLC transient behavior.":"Voltage source steps LOW. Capacitor discharges and inductor current changes; inspect any reverse excursion or ringing."):
   (e.dir==="rise"?"Gate rising turns on the NMOS shunt path from RX to ground. A falling RX and changed branch current are consequences of the circuit topology.":"Gate falling removes the NMOS shunt. RX can recover toward its loaded divider value, depending on the source pulse phase.");
  return {...e,label,explanation,note:"ΔVrx over the immediate "+(.6).toFixed(1)+" ns neighborhood ≈ "+fmt(drx,"V")+"; ΔItrace ≈ "+fmt(di,"mA")};
 });
}
function rangeData(rows,run,min,max){
 const found=rows.filter(r=>r[0]>=min&&r[0]<=max);
 const out=found.length?found:rows;
 return CONFIG.map((c,k)=>{
  const vs=out.map(r=>value(r,k,run)),lo=Math.min(...vs),hi=Math.max(...vs),avg=vs.reduce((a,b)=>a+b,0)/vs.length;
  return {min:lo,max:hi,pp:hi-lo,avg};
 });
}
function bounds(rows,run,k,left,right,gain){
 const values=rows.filter(r=>r[0]>=left&&r[0]<=right).map(r=>value(r,k,run));
 const a=values.length?values:rows.map(r=>value(r,k,run));
 const min=Math.min(...a),max=Math.max(...a),span=Math.max(max-min,k===5?.02:.035);
 const mid=(min+max)/2,half=span*(.5+.18)*gain;
 return [mid-half,mid+half];
}
function segment(rows,l,r){
 const arr=[];let i=0;
 while(i<rows.length&&rows[i][0]<l)i++;
 if(i>0)arr.push(rows[i-1]);
 while(i<rows.length&&rows[i][0]<=r){arr.push(rows[i]);i++}
 if(i<rows.length)arr.push(rows[i]);
 return arr;
}
function minMaxDecimate(raw,k,run,maxPoints=1100){
 if(raw.length<=maxPoints)return raw;
 const step=Math.ceil(raw.length/(maxPoints/2));
 const out=[];
 for(let start=0;start<raw.length;start+=step){
  const end=Math.min(start+step,raw.length),bucket=raw.slice(start,end);
  if(!bucket.length)continue;
  let imin=0,imax=0;
  for(let n=1;n<bucket.length;n++){
   if(value(bucket[n],k,run)<value(bucket[imin],k,run))imin=n;
   if(value(bucket[n],k,run)>value(bucket[imax],k,run))imax=n;
  }
  const pos=[imin,imax].sort((a,b)=>a-b);
  if(!out.length||out[out.length-1]!==bucket[0])out.push(bucket[0]);
  for(const idx of pos){if(out[out.length-1]!==bucket[idx])out.push(bucket[idx])}
  if(out[out.length-1]!==bucket[bucket.length-1])out.push(bucket[bucket.length-1]);
 }
 if(out[out.length-1]!==raw[raw.length-1])out.push(raw[raw.length-1]);
 return out;
}
function referenceRun(run){
 return (window.SLT_BOARD_RUNS||[]).find(x=>
   x.supply===run.supply&&x.nmos===run.nmos&&x.series_r===0&&
   x.inductor_nh===1&&x.cap_pf===2
 )||null;
}
function crossingAt(rows,col,level,dir){
 for(let i=1;i<rows.length;i++){
  const a=rows[i-1],b=rows[i];
  if(dir==="rise"&&a[col]<level&&b[col]>=level ||
     dir==="fall"&&a[col]>level&&b[col]<=level){
   const f=(level-a[col])/((b[col]-a[col])||1);
   return a[0]+(b[0]-a[0])*clamp(f,0,1);
  }
 }
 return null;
}
// Triggering is computed from sample crossings, not from the educational event labels.
function thresholdCrossings(rows,run,ch,level,edge,holdoff){
 const found=[];let last=-Infinity;
 for(let i=1;i<rows.length;i++){
  const a=rows[i-1],b=rows[i],va=value(a,ch,run),vb=value(b,ch,run);
  const hit=edge==="fall"?(va>level&&vb<=level):(va<level&&vb>=level);
  if(!hit||Math.abs(vb-va)<1e-14)continue;
  const fraction=clamp((level-va)/(vb-va),0,1);
  const t=a[0]+(b[0]-a[0])*fraction;
  if(t-last>=holdoff){found.push(t);last=t}
 }
 return found;
}
function clipRows(rows,left,right){
 const a=segment(rows,left,right).filter(r=>r[0]>=left&&r[0]<=right);
 return a.length?a:rows;
}
function toCSV(rows,run){
 const header=["time_ns","Vsrc_V","Vtx_V","Vrx_V","Vgate_V","Itrace_mA","Pseries_mW"];
 return ["# ngspice stored numerical circuit simulation; not oscilloscope hardware capture",
  "# Pseries is calculated from Itrace^2 * Rseries; no physical temperature model",
  header.join(",")].concat(rows.map(r=>[r[0],...CONFIG.map((_,k)=>value(r,k,run))].join(","))).join("\n")+"\n";
}
function exportText(name,content,type){
 const url=URL.createObjectURL(new Blob([content],{type}));
 const a=document.createElement("a");a.href=url;a.download=name;
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function analyzeWave(rows,run,ch,low,high){
 const vals=clipRows(rows,low,high),count=vals.length;
 if(count<3||high-low<=0)return {peak:null,period:null,duty:null,rise:null,fall:null};
 const vs=vals.map(r=>value(r,ch,run)),min=Math.min(...vs),max=Math.max(...vs),ampl=max-min;
 if(ampl<1e-9)return {peak:max,period:null,duty:null,rise:null,fall:null};
 const level=min+.5*ampl;
 const rising=thresholdCrossings(vals,run,ch,level,"rise",0);
 const falling=thresholdCrossings(vals,run,ch,level,"fall",0);
 const periods=rising.slice(1).map((t,i)=>t-rising[i]).filter(v=>v>0);
 const period=periods.length?periods.reduce((a,b)=>a+b,0)/periods.length:null;
 let duty=null;
 if(period&&rising.length){
  const next=falling.find(t=>t>rising[0]);
  if(next!==undefined)duty=clamp((next-rising[0])/period*100,0,100);
 }
 const rise10=thresholdCrossings(vals,run,ch,min+.1*ampl,"rise",0);
 const rise90=thresholdCrossings(vals,run,ch,min+.9*ampl,"rise",0);
 const fall90=thresholdCrossings(vals,run,ch,min+.9*ampl,"fall",0);
 const fall10=thresholdCrossings(vals,run,ch,min+.1*ampl,"fall",0);
 const duration=(first,second)=>first.length? (second.find(t=>t>=first[0])??null) : null;
 const t90=duration(rise10,rise90),t10=duration(fall90,fall10);
 return {peak:max,period,duty,rise:t90===null?null:t90-rise10[0],fall:t10===null?null:t10-fall90[0]};
}
function renderSpectrum(rows,run,ch,start,end){
 const N=128,span=end-start;
 if(span<=0||rows.length<2)return {svg:"",peak:null};
 // Original SPICE time steps are adaptive. Interpolate to uniform time
 // positions before the DFT; the results are limited by the selected span.
 const sample=new Array(N);
 let pos=1;
 for(let i=0;i<N;i++){
  const t=start+(i+.5)*span/N;
  while(pos<rows.length-1&&rows[pos][0]<t)pos++;
  const a=rows[Math.max(0,pos-1)],b=rows[pos];
  const w=clamp((t-a[0])/Math.max(1e-12,b[0]-a[0]),0,1);
  sample[i]=value(a,ch,run)*(1-w)+value(b,ch,run)*w;
 }
 const mean=sample.reduce((a,b)=>a+b,0)/N;
 const mag=[];
 for(let k=1;k<N/2;k++){
  let re=0,im=0;
  for(let n=0;n<N;n++){
   const w=.5-.5*Math.cos(2*Math.PI*n/(N-1));
   const x=(sample[n]-mean)*w,theta=2*Math.PI*k*n/N;
   re+=x*Math.cos(theta);im-=x*Math.sin(theta);
  }
  mag.push(4*Math.hypot(re,im)/N);
 }
 const top=Math.max(...mag,1e-12);
 const paths=mag.map((m,i)=>((i?"L":"M")+(65+(i/(mag.length-1))*670).toFixed(2)+" "+(174-140*m/top).toFixed(2))).join(" ");
 const strongest=mag.indexOf(Math.max(...mag))+1;
 const peak=strongest*1000/span;
 const svg='<rect width="780" height="220" fill="#061323"/>'+
  Array.from({length:6},(_,i)=>'<path d="M65 '+(34+i*28)+' H735" stroke="#29415a" stroke-dasharray="4 5"/>').join("")+
  '<path d="'+paths+'" fill="none" stroke="#92e0fb" stroke-width="2.5"/>'+
  '<text x="65" y="20" fill="#dcebf8" font-size="13">Magnitude / Hann window · '+CONFIG[ch].short+'</text>'+
  '<text x="65" y="207" fill="#c6dcec" font-size="12">0 MHz</text>'+
  '<text x="735" y="207" text-anchor="end" fill="#c6dcec" font-size="12">'+((N/2-1)*1000/span).toFixed(1)+' MHz</text>'+
  '<text x="735" y="20" text-anchor="end" fill="#ffe1a1" font-size="12">Peak bin '+peak.toFixed(2)+' MHz</text>';
 return {svg,peak};
}
function renderXY(rows,run,xch,ych,left,right){
 const relevant=clipRows(rows,left,right),skip=Math.max(1,Math.ceil(relevant.length/650));
 const subset=relevant.filter((_,i)=>i%skip===0),xs=subset.map(r=>value(r,xch,run)),ys=subset.map(r=>value(r,ych,run));
 const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
 const xx=v=>60+650*(v-xmin)/Math.max(xmax-xmin,1e-9),yy=v=>174-142*(v-ymin)/Math.max(ymax-ymin,1e-9);
 const path=subset.map((r,i)=>(i?"L":"M")+xx(xs[i]).toFixed(1)+" "+yy(ys[i]).toFixed(1)).join(" ");
 return '<rect width="780" height="220" fill="#061323"/>'+
  '<path d="M60 30 V174 H710" stroke="#6c87a0" stroke-width="2"/>'+
  '<path d="'+path+'" fill="none" stroke="#f3ba7c" stroke-width="2" opacity=".95"/>'+
  '<text x="60" y="20" fill="#c7e7fa" font-size="12">'+CONFIG[ych].short+' ('+CONFIG[ych].unit+') versus '+CONFIG[xch].short+' ('+CONFIG[xch].unit+')</text>'+
  '<text x="60" y="205" fill="#d0dcec" font-size="12">'+xmin.toFixed(2)+'</text>'+
  '<text x="710" y="205" text-anchor="end" fill="#d0dcec" font-size="12">'+xmax.toFixed(2)+'</text>'+
  '<text x="56" y="35" text-anchor="end" fill="#d0dcec" font-size="11">'+ymax.toFixed(2)+'</text>';
}
function widget(){
 return '<section class="bs-scope" data-board-scope aria-label="Real ngspice multicycle transient waveform analyzer">'+
 '<div class="bs-bezel"><div><strong>◉ TRANSIENT ENGINEERING WORKBENCH · 6 LANES</strong><small>Oscilloscope controls · real ngspice samples · source 80 ns pulse / gate 60 ns pulse</small></div><div class="bs-status"><span id="bsState">STOP</span><span id="bsTriggerState">CH1 ↑</span><span id="bsWindow">0–240 ns</span></div></div>'+
 '<div class="bs-origin"><b>SIMULATED — NOT MEASURED HARDWARE</b> · 48 CIRCUIT CONFIGURATIONS · 3 SOURCE PERIODS / 4 GATE PERIODS · 240 ns</div>'+
 '<div class="bs-toolbar" aria-label="Scope playback and acquisition controls">'+
 '<button id="bsRun" type="button">▶ Acquire / Replay</button><button id="bsStop" type="button">■ Pause</button><button id="bsStep" type="button">↦ Next event</button>'+
 '<button id="bsFit" type="button">Full span</button><button id="bsZoomIn" type="button">＋ Zoom</button><button id="bsZoomOut" type="button">－ Zoom</button>'+
 '<button id="bsPanLeft" type="button">← Pan</button><button id="bsPanRight" type="button">Pan →</button>'+
 '<label>View<select id="bsMode"><option value="cycles">240 ns · complete cycles</option><option value="short">16 ns · original transient</option></select></label>'+
 '<label>Time/div<select id="bsTimeDiv"></select></label><label>Speed<select id="bsSpeed"><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label>'+
 '<label>Trigger<select id="bsTrig"><option value="0">CH1 Vsrc ↑</option><option value="1">CH2 Vtx ↑</option><option value="2">CH3 Vrx ↑</option><option value="3">CH4 Gate ↑</option></select></label>'+
 '<label>Level V<input id="bsTrigLevel" type="number" step=".1" value=".5"/></label>'+
 '<label>Edge<select id="bsEdge"><option value="rise">Rising ↑</option><option value="fall">Falling ↓</option></select></label>'+
 '<label>Trigger mode<select id="bsTrigMode"><option value="auto">Auto</option><option value="normal">Normal</option><option value="single">Single</option></select></label>'+
 '<label>Holdoff ns<input id="bsHoldoff" type="number" min="0" max="240" step=".1" value="0"/></label>'+
 '<button id="bsSingle" type="button">Single trigger</button><button id="bsAutoset" type="button">Autoset</button><button id="bsCenter" type="button">Center trigger</button><button id="bsCompare" type="button" aria-pressed="false">Compare baseline: OFF</button><button id="bsExpand" type="button" aria-expanded="false">⛶ Full screen</button></div>'+
 '<div class="bs-channelbar" id="bsChannelbar" aria-label="Independently calibrated waveform channels"></div>'+
 '<div class="bs-screen"><div class="bs-screenhead"><span><b>CH1–CH6 · FULL-CYCLE ACQUISITION</b></span><span id="bsScreenRange">0–240 ns</span></div>'+
 '<svg id="bsLarge" role="img" tabindex="0" viewBox="0 0 1160 880" aria-label="Multicycle oscilloscope traces with annotated source rising and falling edges"></svg>'+
 '<div class="bs-mobile" id="bsMobile" aria-label="Full-width stacked mobile trace plots"></div>'+
 '<div class="bs-events" id="bsEvents" aria-label="Detected waveform edge events"></div></div>'+
 '<div class="bs-deep"><section><div class="bs-deepheading"><strong>EDGE MICROSCOPE · REAL SAMPLE ZOOM</strong><span id="bsFocusLabel">Select an edge</span></div><svg id="bsMicroscope" viewBox="0 0 1100 280" role="img" aria-label="High-resolution sampled RX and trace-current ringing near the selected edge"></svg>'+
 '<div class="bs-physics" id="bsPhysics"></div></section><section><div class="bs-deepheading"><strong>LIVE SIGNAL → COMPONENT RESPONSE</strong></div>'+
 '<div id="bsCircuitLive" class="bs-circuit-live"></div><div id="bsExplanation" class="bs-explanation" role="status" aria-live="polite"></div></section></div>'+
 '<div class="bs-analysis"><div class="bs-deepheading"><strong>ADVANCED INSTRUMENT ANALYSIS · STORED SIMULATION SAMPLES</strong><span>Not live hardware acquisition</span></div>'+
 '<div class="bs-analysis-controls"><label>Analyze<select id="bsAnalysisCh"><option value="0">CH1 Source</option><option value="1">CH2 TX</option><option value="2" selected>CH3 RX</option><option value="3">CH4 Gate</option><option value="4">CH5 Current</option><option value="5">CH6 Derived power</option></select></label>'+
 '<label>XY X-axis<select id="bsXYX"><option value="0">Vsrc</option><option value="1">Vtx</option><option value="2">Vrx</option><option value="3">Vgate</option><option value="4" selected>Itrace</option></select></label>'+
 '<label>XY Y-axis<select id="bsXYY"><option value="0">Vsrc</option><option value="1">Vtx</option><option value="2" selected>Vrx</option><option value="3">Vgate</option><option value="4">Itrace</option></select></label>'+
 '<button id="bsExportCSV" type="button">Export actual-sample CSV</button><button id="bsExportSVG" type="button">Export scope SVG</button></div>'+
 '<div id="bsAdvancedMeasurements" class="bs-analysis-results"></div>'+
 '<div class="bs-analysis-plots"><div><h5>FREQUENCY SPECTRUM · WINDOWED DFT</h5><svg id="bsSpectrum" viewBox="0 0 780 220" role="img" aria-label="Frequency spectrum computed from uniformly interpolated stored SPICE samples"></svg></div>'+
 '<div><h5>XY CHANNEL CORRELATION</h5><svg id="bsXY" viewBox="0 0 780 220" role="img" aria-label="XY plot of two selected simulated channel values"></svg></div></div>'+
 '<p id="bsAnalysisNote" class="bs-analysis-note"></p></div>'+
 '<div class="bs-bottom"><section><h5>MEASUREMENTS · WINDOW / ACTUAL SIMULATED VALUES</h5><table><thead><tr><th>Channel</th><th>Min</th><th>Max</th><th>Pk–Pk</th></tr></thead><tbody id="bsMetrics"></tbody></table></section>'+
 '<section><h5>CURSOR A/B · TIME-ALIGNED VOLTAGE / CURRENT / POWER</h5><div class="bs-sliders">'+
 '<label>A <b id="bsTimeA">—</b><input id="bsA" type="range"></label><label>B <b id="bsTimeB">—</b><input id="bsB" type="range"></label></div>'+
 '<div class="bs-deltas" id="bsDelta"></div><div class="bs-at" id="bsAtCursor"></div></section></div>'+
 '<div class="bs-disclaimer">Source and gate pulses are <b>periodic stimuli</b>, not clocks. CH6 is a calculated electrical power, not a separate physical probe or a thermal-failure prediction. Long-run samples are newly simulated in ngspice using the original topology. Scope visual styling is educational and does not reproduce real oscilloscope firmware or certify hardware compliance.</div>'+
 '</section>';
}
const rangeFmt=(a,b)=>a.toFixed(Math.abs(b-a)<4?2:1)+"–"+b.toFixed(Math.abs(b-a)<4?2:1)+" ns";
function init(host,run,time,options){
 if(!host||!run||!run.samples?.length)return;
 let old=host.__boardScope;
 if(!old||old.runId!==run.id){
  old?.stop?.();
  const oldmode=old?.mode==="short"?"short":"cycles";
  host.innerHTML=widget();
  const mode=oldmode,limit=endTime(mode);
  const state={run,runId:run.id,mode,lo:0,hi:limit,cursor:clamp(time,0,limit),
   a:clamp(time,0,limit),b:mode==="cycles"?81:8,shown:[true,true,true,true,true,false],
   gain:[1,1,1,1,1,1],coupling:["DC","DC","DC","DC","DC","DC"],inverted:[false,false,false,false,false,false],offset:[0,0,0,0,0,0],trig:0,level:run.supply*.5,edge:"rise",trigMode:"auto",holdoff:0,triggerStatus:"",analysisCh:2,xyX:4,xyY:2,
   speed:1,playing:false,raf:0,lastFrame:0,reveal:null,focus:null,stages:0,compare:false,options:options||{},
   eventIndex:0};
  host.__boardScope=state;
  state.focus=events(run,mode)[0]||null;
  connect(host,state);
 }else{old.run=run;old.options=options||old.options;if(old.mode==="short"&&!old.playing)old.cursor=clamp(time,0,16)}
 paint(host,host.__boardScope);
}
function connect(host,st){
 const $=s=>host.querySelector(s);
 const rows=()=>samples(st.run,st.mode),T=()=>endTime(st.mode);
 function stop(){st.playing=false;window.cancelAnimationFrame(st.raf);st.raf=0;st.reveal=null}
 st.stop=stop;
 function emit(t){
  st.cursor=clamp(t,0,T());
  if(st.mode==="cycles"&&st.options.onCycleSeek){
   st.options.onCycleSeek(st.cursor,nearest(rows(),st.cursor));
  }else if(st.mode==="short"&&st.options.onSeek){
   st.options.onSeek(st.cursor);
  }
  paint(host,st);
 }
 function around(t,width=st.hi-st.lo){
  const Tm=T(),w=clamp(width,.5,Tm);st.lo=clamp(t-w/2,0,Tm-w);st.hi=st.lo+w;
 }
 function trigger(){
  return thresholdCrossings(rows(),st.run,st.trig,st.level,st.edge,st.holdoff)[0]??null;
 }
 function zoom(f){stop();around((st.lo+st.hi)/2,(st.hi-st.lo)*f);paint(host,st)}
 function navigate(e){const list=events(st.run,st.mode);if(!list.length)return;st.focus=list[((e%list.length)+list.length)%list.length];st.eventIndex=list.indexOf(st.focus);st.a=st.focus.t;st.b=clamp(st.a+Math.min(4,T()/15),0,T());emit(st.focus.t)}
 $("#bsRun").onclick=()=>{
  if(st.playing){stop();paint(host,st);return}
  const hit=trigger();
  if(st.trigMode!=="auto"&&hit===null){
   st.triggerStatus="WAIT · NO MATCHING "+st.edge.toUpperCase()+" EDGE";
   st.playing=false;paint(host,st);return;
  }
  st.triggerStatus=hit===null?"AUTO · FREE RUN":"TRIGGERED @ "+hit.toFixed(2)+" ns";
  const first=st.trigMode==="auto"?0:hit;
  st.playing=true;st.reveal=first;st.cursor=first;st.lastFrame=0;
  const start=performance.now(),Tmax=T(),speed=+$("#bsSpeed").value||1;
  // Real acquisition: progressively reveal true SPICE samples, not a moving
  // cursor on a permanently drawn trace. 16 seconds for 240ns at normal speed.
  const duration=st.mode==="cycles"?16000:6000;
  function frame(now){
   if(!st.playing)return;
   const progress=clamp((now-start)*speed/duration,0,1);
   if(now-st.lastFrame>75||progress===1){
    st.lastFrame=now;
    st.reveal=first+(Tmax-first)*progress;
    st.cursor=st.reveal;
    const list=events(st.run,st.mode),past=list.filter(x=>x.t<=st.cursor);
    if(past.length)st.focus=past[past.length-1];
    if(st.mode==="cycles"&&st.options.onCycleSeek)st.options.onCycleSeek(st.cursor,nearest(rows(),st.cursor));
    paint(host,st);
   }
   if(progress>=1){st.playing=false;st.reveal=null;paint(host,st);return}
   st.raf=requestAnimationFrame(frame);
  }
  st.raf=requestAnimationFrame(frame);
 };
 $("#bsStop").onclick=()=>{stop();paint(host,st)};
 $("#bsStep").onclick=()=>{stop();navigate(st.eventIndex+1)};
 $("#bsFit").onclick=()=>{stop();st.lo=0;st.hi=T();paint(host,st)};
 $("#bsZoomIn").onclick=()=>zoom(.5);
 $("#bsZoomOut").onclick=()=>zoom(2);
 $("#bsPanLeft").onclick=()=>{stop();around((st.lo+st.hi)/2-(st.hi-st.lo)*.3);paint(host,st)};
 $("#bsPanRight").onclick=()=>{stop();around((st.lo+st.hi)/2+(st.hi-st.lo)*.3);paint(host,st)};
 $("#bsExpand").onclick=()=>{
  const was=host.matches(":popover-open");
  if(was){
   host.hidePopover();
   host.classList.remove("bs-fullscreen");
   host.removeAttribute("popover");
  }else{
   host.setAttribute("popover","manual");
   host.classList.add("bs-fullscreen");
   host.showPopover();
  }
  $("#bsExpand").setAttribute("aria-expanded",String(!was));
  $("#bsExpand").textContent=was?"⛶ Full screen":"✕ Close full screen";
 };
 host.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&host.matches(":popover-open")){
   e.preventDefault();$("#bsExpand").click();
  }
 });
 $("#bsCompare").onclick=()=>{
  stop();st.compare=!st.compare;paint(host,st);
 };
 $("#bsMode").value=st.mode;
 $("#bsEdge").value=st.edge;$("#bsTrigMode").value=st.trigMode;$("#bsHoldoff").value=st.holdoff;
 $("#bsMode").onchange=e=>{
  stop();st.mode=e.target.value;st.lo=0;st.hi=T();st.cursor=clamp(st.cursor,0,T());st.a=clamp(st.a,0,T());st.b=clamp(st.b,0,T());
  st.focus=events(st.run,st.mode)[0]||null;st.eventIndex=0;timeOptions();paint(host,st);
 };
 function timeOptions(){
  const Tm=T();const choices=st.mode==="cycles"?[24,12,6,2.4,.8,.2]:[1.6,.8,.4,.2,.08];
  $("#bsTimeDiv").innerHTML=choices.map(v=>'<option value="'+v+'">'+v+' ns/div</option>').join("");
  $("#bsTimeDiv").value=String(choices[0]);
 }
 timeOptions();
 $("#bsTimeDiv").onchange=e=>{stop();around((st.lo+st.hi)/2,+e.target.value*10);paint(host,st)};
 $("#bsSpeed").onchange=e=>{st.speed=+e.target.value};
 $("#bsTrig").onchange=e=>{st.trig=+e.target.value;paint(host,st)};
 $("#bsTrigLevel").value=st.level;
 $("#bsTrigLevel").onchange=e=>{const n=Number(e.target.value);if(Number.isFinite(n)){st.level=n;st.triggerStatus="";paint(host,st)}};
 $("#bsEdge").onchange=e=>{st.edge=e.target.value;st.triggerStatus="";paint(host,st)};
 $("#bsTrigMode").onchange=e=>{st.trigMode=e.target.value;st.triggerStatus="";paint(host,st)};
 $("#bsHoldoff").onchange=e=>{st.holdoff=clamp(Number(e.target.value)||0,0,240);e.target.value=st.holdoff;paint(host,st)};
 $("#bsSingle").onclick=()=>{
  stop();const t=trigger();
  if(t===null){st.triggerStatus="NO MATCHING TRIGGER";paint(host,st);return}
  st.triggerStatus="SINGLE CAPTURE @ "+t.toFixed(2)+" ns";
  st.a=t;st.b=clamp(t+Math.min(8,T()/10),0,T());
  const e=events(st.run,st.mode).find(e=>Math.abs(e.t-t)<1);if(e)st.focus=e;
  emit(t);
 };
 $("#bsAutoset").onclick=()=>{
  stop();st.mode="cycles";st.lo=0;st.hi=T();st.cursor=0;st.a=0;st.b=80;
  st.shown=[true,true,true,true,true,false];st.gain=[1,1,1,1,1,1];
  st.coupling=["DC","DC","DC","DC","DC","DC"];st.inverted=[false,false,false,false,false,false];st.offset=[0,0,0,0,0,0];
  st.trig=0;st.level=st.run.supply*.5;st.edge="rise";st.trigMode="auto";st.holdoff=0;st.triggerStatus="";
  $("#bsTrig").value="0";$("#bsTrigLevel").value=st.level;$("#bsEdge").value="rise";
  $("#bsTrigMode").value="auto";$("#bsHoldoff").value=0;
  st.focus=events(st.run,st.mode)[0]||null;timeOptions();paint(host,st);
 };
 $("#bsCenter").onclick=()=>{stop();const t=trigger();if(t===null){st.triggerStatus="NO MATCHING TRIGGER";paint(host,st);return}around(t);emit(t)};
 $("#bsA").oninput=e=>{const t=+e.target.value;stop();st.a=t;emit(t)};
 $("#bsB").oninput=e=>{const t=+e.target.value;stop();st.b=t;paint(host,st)};
 $("#bsChannelbar").onclick=e=>{const b=e.target.closest("[data-bs-ch]");if(!b)return;st.shown[+b.dataset.bsCh]=!st.shown[+b.dataset.bsCh];paint(host,st)};
 $("#bsChannelbar").onchange=e=>{
  const gain=e.target.closest("[data-bs-gain]");
  if(gain){st.gain[+gain.dataset.bsGain]=+gain.value;paint(host,st);return}
  const coupling=e.target.closest("[data-bs-coupling]");
  if(coupling){st.coupling[+coupling.dataset.bsCoupling]=coupling.value;paint(host,st);return}
  const invert=e.target.closest("[data-bs-invert]");
  if(invert){st.inverted[+invert.dataset.bsInvert]=invert.checked;paint(host,st);return}
  const offset=e.target.closest("[data-bs-offset]");
  if(offset){st.offset[+offset.dataset.bsOffset]=clamp(Number(offset.value)||0,-1000,1000);paint(host,st)}
 };
 $("#bsEvents").onclick=e=>{const b=e.target.closest("[data-bs-event]");if(!b)return;stop();navigate(+b.dataset.bsEvent)};
 function pointing(e,small){
  const svg=small?e.target.closest("svg"):$("#bsLarge");if(!svg)return;
  const rect=svg.getBoundingClientRect();
  const x=(e.clientX-rect.left)/rect.width*(small?360:1160);
  const lo=small?68:134,hi=small?343:1125;
  if(x<lo||x>hi)return;
  const t=clamp(st.lo+(x-lo)/(hi-lo)*(st.hi-st.lo),0,T());
  stop();st.a=t;emit(t);
 }
 $("#bsAnalysisCh").onchange=e=>{st.analysisCh=+e.target.value;paint(host,st)};
 $("#bsXYX").onchange=e=>{st.xyX=+e.target.value;paint(host,st)};
 $("#bsXYY").onchange=e=>{st.xyY=+e.target.value;paint(host,st)};
 $("#bsExportCSV").onclick=()=>exportText("slt-board-"+st.run.id+"-"+st.mode+".csv",toCSV(clipRows(rows(),st.lo,st.hi),st.run),"text/csv");
 $("#bsExportSVG").onclick=()=>exportText("slt-board-scope-"+st.run.id+".svg",'<?xml version="1.0" encoding="UTF-8"?>\n'+$("#bsLarge").outerHTML.replace("<svg ","<svg xmlns=\"http://www.w3.org/2000/svg\" "),"image/svg+xml");
 $("#bsLarge").onpointerdown=e=>pointing(e,false);
 $("#bsMobile").onpointerdown=e=>pointing(e,true);
 $("#bsLarge").onkeydown=e=>{if(["ArrowLeft","ArrowRight"].includes(e.key)){e.preventDefault();stop();emit(st.cursor+(e.key==="ArrowLeft"?-.1:.1))}};
}
function paint(host,st){
 if(!host?.isConnected)return;
 const $=s=>host.querySelector(s);
 const rows=samples(st.run,st.mode), Tmax=endTime(st.mode),span=st.hi-st.lo,evs=events(st.run,st.mode),visible=st.shown;
 const x=(t,w=1160,left=134,right=1125)=>left+(t-st.lo)/span*(right-left);
 const data=segment(rows,st.lo,st.hi);
 // Vertical display transform is deliberately separate from raw engineering
 // measurements and trigger logic. AC is a mean-removed educational display,
 // not a calibrated analog high-pass input circuit.
 const mean=CONFIG.map((_,k)=>data.reduce((sum,r)=>sum+value(r,k,st.run),0)/Math.max(data.length,1));
 const display=(r,k)=>{
  if(st.coupling[k]==="GND")return st.offset[k];
  return (value(r,k,st.run)-(st.coupling[k]==="AC"?mean[k]:0))*(st.inverted[k]?-1:1)+st.offset[k];
 };
 const ranges=CONFIG.map((_,k)=>{
  if(st.coupling[k]==="GND")return [st.offset[k]-.12,st.offset[k]+.12];
  const [min,max]=bounds(rows,st.run,k,st.lo,st.hi,st.gain[k]);
  const transform=v=>(v-(st.coupling[k]==="AC"?mean[k]:0))*(st.inverted[k]?-1:1)+st.offset[k];
  const a=transform(min),b=transform(max);return [Math.min(a,b),Math.max(a,b)];
 });
 const y=(v,k,top,height)=>top+height-(v-ranges[k][0])/(ranges[k][1]-ranges[k][0])*height;
 const dataShown=st.reveal==null?data:data.filter(r=>r[0]<=st.reveal);
 const reference=referenceRun(st.run);
 const referenceRows=reference?samples(reference,st.mode):null;

 const allStats=rangeData(rows,st.run,st.lo,st.hi);
 $("#bsState").textContent=st.playing?"● ACQUIRING":st.triggerStatus||"■ HOLD · SPICE";
 $("#bsTriggerState").textContent="TRIG CH"+(st.trig+1)+" "+(st.edge==="rise"?"↑":"↓")+" "+st.level.toFixed(2)+" V";
 $("#bsWindow").textContent=rangeFmt(st.lo,st.hi);
 $("#bsScreenRange").textContent=rangeFmt(st.lo,st.hi)+(st.mode==="cycles"?" · 80 ns source period":" · initial edge");
 $("#bsMode").value=st.mode;
 $("#bsCompare").textContent=st.compare?"Compare baseline: ON":"Compare baseline: OFF";
 $("#bsCompare").setAttribute("aria-pressed",String(st.compare));
 $("#bsChannelbar").innerHTML=CONFIG.map((c,k)=>{
  let per=(ranges[k][1]-ranges[k][0])/4;
  return '<div class="bs-channel"><button data-bs-ch="'+k+'" style="--bs-color:'+c.color+'" aria-pressed="'+visible[k]+'" type="button">'+
   '<span>CH'+(k+1)+' '+c.short+'</span><small>'+esc(c.type)+' / '+esc(c.unit)+'</small><b>'+fmt(per,c.unit)+'/div</b></button>'+
   '<label>GAIN<select data-bs-gain="'+k+'" aria-label="CH'+(k+1)+' vertical span">'+[.5,1,2,4].map(v=>'<option value="'+v+'"'+(st.gain[k]===v?' selected':'')+'>'+v+'×</option>').join("")+'</select></label>'+
   '<label>INPUT<select data-bs-coupling="'+k+'" aria-label="CH'+(k+1)+' display coupling">'+
    ["DC","AC","GND"].map(mode=>'<option value="'+mode+'"'+(st.coupling[k]===mode?' selected':'')+'>'+mode+'</option>').join("")+'</select></label>'+
   '<label>OFFSET<input data-bs-offset="'+k+'" type="number" step=".1" aria-label="CH'+(k+1)+' display offset in '+c.unit+'" value="'+st.offset[k]+'"></label>'+
   '<label class="bs-invert"><input data-bs-invert="'+k+'" type="checkbox" aria-label="CH'+(k+1)+' display invert" '+(st.inverted[k]?'checked':'')+'> INVERT</label></div>';
 }).join("");
 $("#bsEvents").innerHTML=evs.map((e,i)=>'<button type="button" data-bs-event="'+i+'" aria-pressed="'+(st.focus===e)+'">'+(e.kind==="source"?"🔌":"⚡")+' '+esc(e.label)+' · '+e.t.toFixed(2)+' ns</button>').join("");
 const W=1160,top=46,rowHeight=118,axisStart=134,axisEnd=1125,plotEnd=top+6*rowHeight+2;
 let svg='<rect x="0" y="0" width="1160" height="880" fill="#061323"/>';
 for(let i=0;i<=10;i++){
  let t=st.lo+span*i/10,px=x(t);
  svg+='<path d="M'+px+' 40 V'+plotEnd+'" stroke="#253854" stroke-width="1"/>'+
   '<text x="'+px+'" y="840" text-anchor="middle" fill="#d0e3f7" font-size="12">'+t.toFixed(span<8?2:1)+'</text>';
 }
 svg+='<text x="1125" y="868" text-anchor="end" fill="#f0f6ff" font-size="13">TIME (ns)</text>';
 for(let k=0;k<6;k++){
  let c=CONFIG[k],base=top+k*rowHeight,yt=base+15,height=82;
  svg+='<rect x="4" y="'+base+'" width="1150" height="114" rx="7" fill="'+(k%2?"#0c1e32":"#091a2d")+'" stroke="#1b324a"/>'+
   '<rect x="7" y="'+(base+8)+'" width="118" height="27" rx="5" fill="'+c.color+'" fill-opacity=".17" stroke="'+c.color+'"/>'+
   '<text x="12" y="'+(base+27)+'" fill="'+c.color+'" font-size="15" font-weight="bold">CH'+(k+1)+' '+c.short+'</text>'+
   '<text x="12" y="'+(base+51)+'" fill="#c8d6e8" font-size="11">'+esc(c.type.toUpperCase().slice(0,16))+'</text>'+
   '<text x="12" y="'+(base+69)+'" fill="#a4bdd6" font-size="11">'+esc(c.unit)+' · '+(k===5?'derived':'simulated')+'</text>';
  for(let q=0;q<=4;q++){
   let yy=yt+height*q/4,v=ranges[k][1]-(ranges[k][1]-ranges[k][0])*q/4;
   svg+='<path d="M134 '+yy+' H1125" stroke="#31465c" stroke-dasharray="4 7"/>'+
    '<text x="128" y="'+(yy+4)+'" fill="#a6c4da" text-anchor="end" font-size="10">'+v.toFixed(Math.abs(v)>10?1:2)+'</text>';
  }
  if(!visible[k])continue;
  const points=minMaxDecimate(dataShown.filter(p=>p[0]>=st.lo&&p[0]<=st.hi),k,st.run,950);
  if(points.length){
   const path=points.map((r,i)=>(i?"L":"M")+x(r[0]).toFixed(2)+" "+y(display(r,k),k,yt,height).toFixed(2)).join(" ");
   svg+='<path d="'+path+'" fill="none" stroke="'+c.color+'" stroke-width="2.6" stroke-linejoin="round"/>';
  }
  if(k===2&&st.compare&&referenceRows&&reference){
   const refSeg=minMaxDecimate(segment(referenceRows,st.lo,Math.min(st.hi,st.reveal??st.hi)),2,reference,1000);
   const ghost=refSeg.filter(r=>r[0]>=st.lo&&r[0]<=st.hi);
   if(ghost.length)svg+='<path d="'+ghost.map((r,i)=>(i?"L":"M")+x(r[0]).toFixed(2)+" "+y(display(r,2),k,yt,height).toFixed(2)).join(" ")+
      '" fill="none" stroke="#f5e9b8" stroke-dasharray="7 4" stroke-width="1.8" opacity=".9"/>';
  }
  if(st.cursor>=st.lo&&st.cursor<=st.hi&&(st.reveal===null||st.cursor<=st.reveal)){
   let cur=nearest(rows,st.cursor);
   svg+='<circle cx="'+x(st.cursor)+'" cy="'+clamp(y(display(cur,k),k,yt,height),yt,yt+height)+'" r="4.5" fill="'+c.color+'" stroke="#fff" stroke-width="1.5"/>';
  }
 }
 for(let [t,tag,c] of [[st.a,"A","#ffd57b"],[st.b,"B","#7ceacc"]]){
  if(t<st.lo||t>st.hi)continue;
  let xx=x(t);
  svg+='<path d="M'+xx+' 40 V'+plotEnd+'" stroke="'+c+'" stroke-width="1.6" stroke-dasharray="7 5"/>'+
   '<rect x="'+clamp(xx-17,137,1075)+'" y="7" width="35" height="26" rx="5" fill="#293c54" stroke="'+c+'"/>'+
   '<text x="'+clamp(xx,154,1092)+'" y="26" text-anchor="middle" fill="'+c+'" font-size="13">'+tag+'</text>';
 }
 // Sparse event pointers: every pulse source edge marked with rising/falling
 // arrow on its own lane, no overlap with 80ns/60ns mixed timing.
 let painted=0;
 for(let i=0;i<evs.length;i++){
  let e=evs[i];
  if(e.t<st.lo||e.t>st.hi||(st.reveal!==null&&e.t>st.reveal)||!visible[e.ch])continue;
  const px=x(e.t),k=e.ch,yt=top+k*rowHeight+15,py=clamp(y(display(nearest(rows,e.t),k),k,yt,82),yt,yt+82);
  const isActive=st.focus&&Math.abs(st.focus.t-e.t)<.04&&st.focus.kind===e.kind;
  svg+='<circle cx="'+px+'" cy="'+py+'" r="'+(isActive?6:3.8)+'" fill="'+(isActive?"#fff0ad":"#e5d7a8")+'" stroke="#1a2535" stroke-width="1.2"/>';
  if(isActive || (span<=40&&painted<6)){
    let lx=clamp(px+9,142,965),ly=clamp(py-13,yt+23,yt+79);
    svg+='<path d="M'+px+' '+py+' L'+(lx+4)+' '+(ly-10)+'" stroke="#ffe3a2" stroke-width="1.5"/>'+
     '<rect x="'+lx+'" y="'+(ly-29)+'" width="149" height="22" rx="4" fill="#293c51" stroke="#9eacbd"/>'+
     '<text x="'+(lx+5)+'" y="'+(ly-13)+'" fill="#fff1b7" font-size="11">'+esc(e.label.slice(0,22))+'</text>';
    painted++;
  }
 }
 if(st.playing&&st.reveal!==null&&st.reveal>=st.lo&&st.reveal<=st.hi){
  const xx=x(st.reveal);
  svg+='<path d="M'+xx+' 40 V'+plotEnd+'" stroke="#70ffa5" stroke-width="2.4" stroke-dasharray="2 4"/>'+
   '<text x="'+clamp(xx+7,138,1025)+'" y="'+(plotEnd+18)+'" fill="#85f6b6" font-size="12">LIVE CAPTURE '+st.reveal.toFixed(2)+' ns</text>';
 }
 $("#bsLarge").innerHTML=svg;
 $("#bsMobile").innerHTML=CONFIG.map((c,k)=>{
  if(!visible[k])return"";
  let rx=67,xx=t=>x(t,360,rx,344),yy=v=>y(v,k,33,91);
  let out='<svg viewBox="0 0 360 160" role="img" aria-label="CH'+(k+1)+' '+esc(c.about)+'">'+
   '<rect width="360" height="160" fill="#091a2d"/>'+
   '<text x="9" y="18" fill="'+c.color+'" font-size="12">CH'+(k+1)+' '+c.short+'</text>'+
   '<text x="348" y="18" fill="#d9e9f9" font-size="10" text-anchor="end">'+esc(c.unit)+(k===5?' (derived)':'')+'</text>';
  for(let q=0;q<=3;q++){
   let t=st.lo+span*q/3,axis=33+91*q/3,v=ranges[k][1]-(ranges[k][1]-ranges[k][0])*q/3;
   out+='<path d="M'+rx+' '+axis+' H344" stroke="#2c4564" stroke-dasharray="3 5"/>'+
    '<text x="62" y="'+(axis+3)+'" text-anchor="end" fill="#bcd2e7" font-size="10">'+v.toFixed(Math.abs(v)>10?1:2)+'</text>'+
    '<path d="M'+xx(t)+' 26 V125" stroke="#233953"/>'+
    '<text x="'+xx(t)+'" y="143" fill="#d0e5f8" text-anchor="middle" font-size="10">'+t.toFixed(span<8?1:0)+'</text>';
  }
  let segmentRows=minMaxDecimate(dataShown.filter(r=>r[0]>=st.lo&&r[0]<=st.hi),k,st.run,520);
  if(segmentRows.length)out+='<path d="'+segmentRows.map((r,i)=>(i?"L":"M")+xx(r[0]).toFixed(1)+" "+yy(display(r,k)).toFixed(1)).join(" ")+'" fill="none" stroke="'+c.color+'" stroke-width="2.7"/>';
  for(let [t,tag,c] of [[st.a,"A","#ffdb8a"],[st.b,"B","#7bedd0"]]){
   if(t<st.lo||t>st.hi)continue;
   out+='<path d="M'+xx(t)+' 27 V125" stroke="'+c+'" stroke-dasharray="5 4"/><text x="'+xx(t)+'" y="154" text-anchor="middle" fill="'+c+'" font-size="11">'+tag+'</text>';
  }
  return out+'</svg>';
 }).join("");
 const measured=analyzeWave(rows,st.run,st.analysisCh,st.lo,st.hi);
 const formatOptional=(v,digits,unit)=>v===null?"—":v.toFixed(digits)+" "+unit;
 $("#bsAdvancedMeasurements").textContent="CH"+(st.analysisCh+1)+" "+CONFIG[st.analysisCh].short+
  " · Period "+formatOptional(measured.period,3,"ns")+
  " · Frequency "+formatOptional(measured.period?1000/measured.period:null,3,"MHz")+
  " · Duty "+formatOptional(measured.duty,1,"%")+
  " · Rise (10–90%) "+formatOptional(measured.rise,4,"ns")+
  " · Fall (90–10%) "+formatOptional(measured.fall,4,"ns");
 if(!st.playing){
  const spectrum=renderSpectrum(rows,st.run,st.analysisCh,st.lo,st.hi);
  $("#bsSpectrum").innerHTML=spectrum.svg;
  $("#bsXY").innerHTML=renderXY(rows,st.run,st.xyX,st.xyY,st.lo,st.hi);
 }
 $("#bsAnalysisNote").textContent="Vertical AC, GND, invert and offset adjust displayed traces only; AC removes the visible-window mean (not a calibrated physical high-pass filter). Triggers, FFT and engineering measurement tables use raw circuit data. FFT displays an approximate windowed DFT on 128 uniformly interpolated numerical samples; bin spacing "+(1000/span).toFixed(3)+" MHz. It cannot resolve frequencies finer than the selected time window. XY uses stored numerical samples (no hardware ADC, probe calibration, or streaming).";
 $("#bsMetrics").innerHTML=CONFIG.map((c,k)=>'<tr><th style="color:'+c.color+'">'+c.short+'</th>'+
  '<td>'+fmt(allStats[k].min,c.unit)+'</td><td>'+fmt(allStats[k].max,c.unit)+'</td><td>'+fmt(allStats[k].pp,c.unit)+'</td></tr>').join("");
 $("#bsTimeA").textContent=st.a.toFixed(2)+" ns";$("#bsTimeB").textContent=st.b.toFixed(2)+" ns";
 for(let [id,v] of [["bsA",st.a],["bsB",st.b]]){
  let el=$("#"+id);el.min=0;el.max=Tmax;el.step=.01;el.value=v;
 }
 const a=nearest(rows,st.a),b=nearest(rows,st.b),dt=st.b-st.a;
 const reciprocal=Math.abs(dt)>1e-8?1000/Math.abs(dt):0;
 $("#bsDelta").innerHTML='<b>Δt '+dt.toFixed(2)+' ns</b><span>1/|Δt| = '+(reciprocal?reciprocal.toFixed(2)+' MHz':'—')+' (cursor reciprocal)</span>';
 $("#bsAtCursor").innerHTML='<table><thead><tr><th>Signal</th><th>@A</th><th>@B</th><th>Δ</th></tr></thead><tbody>'+
  CONFIG.map((c,k)=>'<tr><th style="color:'+c.color+'">'+c.short+'</th><td>'+fmt(value(a,k,st.run),c.unit)+'</td>'+
   '<td>'+fmt(value(b,k,st.run),c.unit)+'</td><td>'+fmt(value(b,k,st.run)-value(a,k,st.run),c.unit)+'</td></tr>').join("")+
 '</tbody></table>';
 // High-resolution scope microscope: real sample values over 3 ns around the
 // selected event; per-source multiple cycles remain visible above.
 const focus=st.focus||evs[0]||{t:0,label:"Source step",kind:"source",dir:"rise",explanation:"Source drives RC load",note:""};
 const zoomWidth=3.6,left=clamp(focus.t-.7,0,Tmax-zoomWidth),right=left+zoomWidth;
 const ix=(t)=>105+(t-left)/zoomWidth*930,zy=(v,l,h,top,height)=>top+height-(v-l)/(h-l||1)*height;
 const windowRows=segment(rows,left,right);
 const rxrange=bounds(rows,st.run,2,left,right,1),irange=bounds(rows,st.run,4,left,right,1);
 let mic='<rect x="0" y="0" width="1100" height="280" fill="#071a2b"/>';
 for(let q=0;q<=6;q++){
  let xx=105+930*q/6,tt=left+zoomWidth*q/6;
  mic+='<path d="M'+xx+' 27 V242" stroke="#254058"/><text x="'+xx+'" y="264" fill="#bfd2e6" text-anchor="middle" font-size="12">'+tt.toFixed(2)+'</text>';
 }
 for(let [k,col,rr,topY] of [[2,"#5d9eff",rxrange,32],[4,"#66e5de",irange,143]]){
  mic+='<text x="10" y="'+(topY+15)+'" fill="'+col+'" font-size="14" font-weight="bold">'+(k===2?"Vrx (V)":"Itrace (mA)")+'</text>'+
   '<text x="99" y="'+(topY+15)+'" text-anchor="end" fill="#a7c2d8" font-size="10">'+rr[1].toFixed(2)+'</text>'+
   '<text x="99" y="'+(topY+98)+'" text-anchor="end" fill="#a7c2d8" font-size="10">'+rr[0].toFixed(2)+'</text>'+
   '<path d="M105 '+(topY+89)+' H1035" stroke="#334e67" stroke-dasharray="4 6"/>';
  mic+='<path d="'+windowRows.filter(r=>r[0]>=left&&r[0]<=right).map((r,i)=>(i?'L':'M')+ix(r[0]).toFixed(2)+' '+zy(value(r,k,st.run),rr[0],rr[1],topY,88).toFixed(2)).join(' ')+'" stroke="'+col+'" stroke-width="3" fill="none"/>';
 }
 if(st.compare&&referenceRows&&reference){
  const base=segment(referenceRows,left,right).filter(r=>r[0]>=left&&r[0]<=right);
  mic+='<path d="'+base.map((r,i)=>(i?'L':'M')+ix(r[0]).toFixed(2)+' '+zy(value(r,2,reference),rxrange[0],rxrange[1],32,88).toFixed(2)).join(' ')+
       '" stroke="#f5e9b8" stroke-width="2.2" stroke-dasharray="7 4" fill="none"/>';
  mic+='<text x="735" y="24" fill="#f5e9b8" font-size="12">Dashed: baseline Vrx</text>';
 }
 const ex=ix(focus.t);
 mic+='<path d="M'+ex+' 23 V242" stroke="#ffe29e" stroke-width="2" stroke-dasharray="6 5"/>'+
  '<rect x="'+clamp(ex+10,106,890)+'" y="6" rx="5" width="135" height="24" fill="#203951" stroke="#ddc37b"/>'+
  '<text x="'+clamp(ex+20,116,900)+'" y="23" fill="#fff0aa" font-size="12">'+esc(focus.label.slice(0,17))+'</text>';
 $("#bsMicroscope").innerHTML=mic;
 $("#bsFocusLabel").textContent=focus.label+" @ "+focus.t.toFixed(2)+" ns (3.6 ns window)";
 const current=nearest(rows,st.cursor),sourceActive=current[1]>st.run.supply*.5,gateActive=current[5]>1.65,rx=current[4],currentM=current[6];
 let stateText=sourceActive?"SOURCE: HIGH":"SOURCE: LOW";
 let mosText=st.run.nmos?(gateActive?"NMOS: CONDUCTING (modeled)":"NMOS: OFF"):"NMOS: ABSENT";
 $("#bsCircuitLive").innerHTML='<div class="bs-led '+(sourceActive?'bs-on':'')+'"><strong>Source / driver</strong><span>'+stateText+'</span><small>'+fmt(current[1],"V")+'</small></div>'+
  '<div class="bs-wire"><span>→ Rdriver 20 Ω</span><b>→ Ltrace '+st.run.inductor_nh+' nH →</b></div>'+
  '<div class="bs-led '+(Math.abs(rx)>.1?'bs-on':'')+'"><strong>Receiver / Cload</strong><span>RX '+fmt(rx,"V")+'</span><small>200 Ω to GND, C '+st.run.cap_pf+' pF</small></div>'+
  '<div class="bs-led '+(gateActive?'bs-gateon':'')+'"><strong>NMOS pull-down</strong><span>'+mosText+'</span><small>Gate '+fmt(current[5],"V")+'</small></div>'+
  '<div class="bs-led"><strong>Ltrace current</strong><span>'+fmt(currentM,"mA")+'</span><small>Rseries loss '+fmt(value(current,5,st.run),"mW")+'</small></div>';
 $("#bsExplanation").innerHTML='<strong>'+esc(focus.label)+' @ '+focus.t.toFixed(2)+' ns</strong><p>'+esc(focus.explanation)+'</p><p>'+esc(focus.note)+
  '</p><small>At selected cursor '+st.cursor.toFixed(2)+' ns: source '+fmt(current[1],"V")+', RX '+fmt(rx,"V")+
  ', gate '+fmt(current[5],"V")+', trace current '+fmt(currentM,"mA")+'. Select a different edge or component setup to compare.</small>';
 // Predictive power is calculated from I²R and does not imply visible damage.
 const R=st.run.series_r;
 const src10=crossingAt(rows,1,.1*st.run.supply,"rise");
 const src90=crossingAt(rows,1,.9*st.run.supply,"rise");
 const riseNs=(src10!==null&&src90!==null)?(src90-src10):null;
 const idealLC=1/(2*Math.PI*Math.sqrt(st.run.inductor_nh*1e-9*st.run.cap_pf*1e-12))/1e9;
 const baselineAt=st.compare&&referenceRows?nearest(referenceRows,st.cursor):null;
 const comparison=baselineAt?"At "+st.cursor.toFixed(2)+" ns: ΔVrx vs baseline "+
   fmt(current[4]-baselineAt[4],"V")+" (same supply/gate stimulus; original 1nH/2pF/0Ω network). ":"";
 $("#bsPhysics").innerHTML='<b>RLC PHYSICS:</b> '+(st.mode==="cycles"?"80 ns source period (12.5 MHz repetition); ":"16 ns initial transient; ")+
  (st.run.nmos?"60 ns gate period (16.67 MHz repetition); ":"No gate pulse; ")+
  'Measured from simulator rows: source 10–90% rise '+(riseNs!==null?riseNs.toFixed(3)+' ns':'—')+
  '; ideal undamped LC f₀≈'+idealLC.toFixed(3)+' GHz (not a measured ringing frequency). '+comparison+
  'Rdriver 20 Ω + Rseries '+R+' Ω · L '+st.run.inductor_nh+' nH · C '+st.run.cap_pf+
  ' pF · RX 200 Ω. Ringing and damping come from these ngspice element values. The model includes no PCB parasitic extraction or resistor thermal failure calculation.';
}
window.renderBoardScope=init;
window.boardScopeGetSamples=samples;
})();
