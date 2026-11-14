"use strict";
/* High-fidelity interactive 5-lane oscilloscope for the board ngspice run.
 * Four physical-node voltage channels + an explicitly mA-valued branch-current lane.
 * Never conflate gate volts or current mA with the RX voltage axis.
 * The sample data, not a hand-drawn illustration, drives every trace and readout.
 */
(function(){
const channels=[
 {key:"SOURCE",short:"Vsrc",column:1,unit:"V",type:"Voltage rail",color:"#f6dc4a",about:"Source voltage / programmed step"},
 {key:"TX NODE",short:"Vtx",column:2,unit:"V",type:"Voltage node",color:"#60da80",about:"After 20 Ω driver"},
 {key:"RX NODE",short:"Vrx",column:4,unit:"V",type:"Voltage node",color:"#67a9f7",about:"Receiver/load voltage"},
 {key:"NMOS GATE",short:"Vg",column:5,unit:"V",type:"Control voltage",color:"#ef7cbb",about:"NMOS control gate (not a clock)"},
 {key:"TRACE CURRENT",short:"Itrace",column:6,unit:"mA",type:"Branch current",color:"#5ce5d6",about:"ngspice inductor branch current"}
];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const num=n=>Number(n).toFixed(Math.abs(n)>20?1:3);
const phase=fn=>window.requestAnimationFrame(fn);
function nearest(rows,t){
 let lo=0,hi=rows.length-1;
 while(lo<hi){let mid=(lo+hi)>>1;if(rows[mid][0]<t)lo=mid+1;else hi=mid}
 return lo>0&&Math.abs(rows[lo-1][0]-t)<Math.abs(rows[lo][0]-t)?rows[lo-1]:rows[lo];
}
function bounds(rows,ch,visible){
 const col=ch.column;let min=Infinity,max=-Infinity;
 for(const r of rows){if(r[0]<visible[0]||r[0]>visible[1])continue;min=Math.min(min,r[col]);max=Math.max(max,r[col])}
 if(!Number.isFinite(min)){min=Math.min(...rows.map(r=>r[col]));max=Math.max(...rows.map(r=>r[col]))}
 let pad=Math.max((max-min)*.18,ch.unit==="V"?.065:.2);
 return [min-pad,max+pad];
}
function metrics(rows,st){
 let stats=[];
 for(let k=0;k<channels.length;k++){
  let a=rows.filter(r=>r[0]>=st.lo&&r[0]<=st.hi).map(r=>r[channels[k].column]);
  if(!a.length)a=rows.map(r=>r[channels[k].column]);
  let min=Math.min(...a),max=Math.max(...a),mean=a.reduce((x,v)=>x+v,0)/a.length;
  stats.push({min,max,mean,pp:max-min});
 }
 return stats;
}
function eventsFor(run){
 const rows=run.samples;
 const srcRise=rows.find(r=>r[1]>.1*run.supply)?.[0]??1;
 const gate=run.nmos?rows.find(r=>r[0]>7.5&&r[5]>2)?.[0]:null;
 // The greatest local receiver decrease after gate turn-on; do not invent a short-circuit event.
 let low=null;
 if(gate!==null){const after=rows.filter(r=>r[0]>=gate+.15 &&r[0]<=12);if(after.length)low=after.reduce((a,r)=>r[4]<a[4]?r:a,after[0])}
 const firstRX=rows.find(r=>r[0]>=srcRise&&r[4]>.05*run.supply)?.[0]??null;
 const ev=[
  {t:srcRise,label:"SOURCE STEP",ch:0,annotation:"Driven source transitions; inspect TX/receiver delay",narrative:"Voltage source Vsrc steps to its programmed value. This is a voltage transition, not a clock."},
  ...(firstRX!=null?[{t:firstRX,label:"RX ARRIVAL",ch:2,annotation:"Receiver begins responding",narrative:"RX begins to rise as the circuit charges. First response depends on R, L and shunt capacitance."}]:[]),
  ...(gate!=null?[{t:gate,label:"NMOS GATE ↑",ch:3,annotation:"Gate drive asserted (~8 ns)",narrative:"The NMOS gate rises to approximately 3.3 V, forming a low-side conduction path and changing the RX voltage and current."}]:[]),
  ...(low&&low[0]>gate+.2?[{t:low[0],label:"RX LOWER LEVEL",ch:2,annotation:"Receiver transient after switching",narrative:"RX has responded to the added current path. Correlate gate timing and Itrace; this is a simulated response, not damage."}]:[])
 ];
 return ev;
}
function skeleton(){
 return '<section class="bs-scope" aria-label="Interactive five-lane board-level oscilloscope" data-board-scope>'+
 '<div class="bs-bezel"><div><strong>◉ TRANSIENT SCOPE · BOARD NODES</strong><small>Digital oscilloscope-style simulator viewer</small></div><div class="bs-status"><span id="bsState">STOP</span><span id="bsTriggerState">TRIG CH1 ↑</span><span id="bsWindow">0–16 ns</span></div></div>'+
 '<div class="bs-origin">NGSPICE-47 <b>SIMULATED / STORED DATA</b> · 48 CIRCUIT CONFIGURATIONS · NOT PHYSICAL INSTRUMENT READINGS</div>'+
 '<div class="bs-toolbar" role="group" aria-label="Waveform instrument controls">'+
 '<button type="button" id="bsRun">▶ Replay</button><button type="button" id="bsStop">■ Stop</button><button type="button" id="bsSingle">Single (event)</button>'+
 '<button type="button" id="bsFit">Fit</button><button type="button" id="bsZoomIn">＋ Zoom</button><button type="button" id="bsZoomOut">− Zoom</button><button type="button" id="bsPanLeft">← Pan</button><button type="button" id="bsPanRight">Pan →</button>'+
 '<label>Trigger source<select id="bsTrig"><option value="0">CH1 Vsrc ↑</option><option value="1">CH2 TX ↑</option><option value="2">CH3 RX ↑</option><option value="3">CH4 NMOS gate ↑</option></select></label>'+
 '<label>Trigger level<input id="bsTrigLevel" value=".5" type="number" step=".1" aria-label="Trigger threshold in volts"></label>'+
 '<label>Time/div<select id="bsTimeDiv"><option value="1.6">1.6 ns/div · Fit</option><option value=".8">0.8 ns/div</option><option value=".4">0.4 ns/div</option><option value=".2">0.2 ns/div</option></select></label>'+
 '<button type="button" id="bsCenter">Center trigger</button></div>'+
 '<div class="bs-channelbar" id="bsChannelbar" role="group" aria-label="Channel visibility and volts per division"></div>'+
 '<div class="bs-screen"><div class="bs-screenhead"><span><b>WAVEFORMS</b> · Time (ns) / separately scaled channels</span><span id="bsScreenRange">0–16 ns</span></div>'+
 '<svg id="bsLarge" viewBox="0 0 1160 770" role="img" aria-label="Oscilloscope plot of Vsource Vtransmitter Vreceiver NMOS gate voltage and trace current with event pointers and cursors" tabindex="0"></svg>'+
 '<div class="bs-mobile" id="bsMobile" aria-label="Phone-width individually labeled waveforms"></div>'+
 '<div class="bs-events" id="bsEvents"></div></div>'+
 '<div class="bs-bottom"><section class="bs-read"><h5>MEASUREMENTS · CURRENT VISIBLE WINDOW</h5><table><thead><tr><th>Channel</th><th>Min</th><th>Max</th><th>Pk–Pk</th></tr></thead><tbody id="bsMetrics"></tbody></table></section>'+
 '<section class="bs-markers"><h5>MARKERS & CURSORS · A / B</h5><div class="bs-sliders"><label>Cursor A · <b id="bsTimeA">2.30 ns</b><input id="bsA" type="range" min="0" max="16" step=".01" value="2.3"></label>'+
 '<label>Cursor B · <b id="bsTimeB">8.00 ns</b><input id="bsB" type="range" min="0" max="16" step=".01" value="8"></label></div>'+
 '<div class="bs-deltas" id="bsDelta"></div><div class="bs-at" id="bsAtCursor"></div></section></div>'+
 '<div class="bs-takeaway" id="bsEventNarrative" aria-live="polite">Select an event marker to inspect what changes on the circuit and the waveforms.</div>'+
 '<div class="bs-disclaimer">CH1–CH4 are voltages measured from simulation nodes and use volts (V). The fifth lane is a simulated branch current and uses milliamperes (mA). CH4 is an NMOS gate control, <b>not a clock</b>. 1/Δt represents cursor spacing reciprocal, <b>not necessarily a signal frequency</b>.</div>'+
 '</section>';
}
function render(host,run,time,options){
 if(!host||!run||!run.samples?.length)return;
 const old=host.__boardScope,runChanged=!old||old.runId!==run.id;
 if(runChanged){
  if(old?.stop)old.stop();
  host.innerHTML=skeleton();
  const st={
   runId:run.id,lo:0,hi:16,a:clamp(time,0,16),b:8,cursor:clamp(time,0,16),shown:[true,true,true,true,true],
   gains:[1,1,1,1,1],trig:0,level:.5,playing:false,raf:0,last:0,
   lastFocus:null,events:eventsFor(run),run,options:options||{}
  };
  host.__boardScope=st;
  bind(host,st);
 }else{
  old.cursor=clamp(time,0,16);
  old.run=run;old.options=options||old.options;
 }
 draw(host,host.__boardScope);
}
function bind(host,st){
 const $=s=>host.querySelector(s);
 function stop(){st.playing=false;window.cancelAnimationFrame(st.raf);st.raf=0}
 st.stop=stop;
 const refresh=()=>draw(host,st);
 const seek=t=>{st.cursor=clamp(t,0,16); if(typeof st.options.onSeek==="function")st.options.onSeek(st.cursor); else refresh()};
 const center=(t,w=st.hi-st.lo)=>{st.lo=clamp(t-w/2,0,16-w);st.hi=st.lo+w};
 function trigger(){
  const rows=st.run.samples,col=channels[st.trig].column,threshold=st.level;
  for(let i=1;i<rows.length;i++)if(rows[i-1][col]<threshold&&rows[i][col]>=threshold)return rows[i][0];
  return st.events.find(e=>e.ch===st.trig)?.t??st.events[0]?.t??1;
 }
 const zoom=f=>{stop();const width=clamp((st.hi-st.lo)*f,.5,16);center((st.lo+st.hi)/2,width);refresh()};
 $("#bsRun").onclick=()=>{if(st.playing){stop();refresh();return}stop();st.playing=true;st.last=0;let first=performance.now(),start=st.cursor;function frame(t){if(!st.playing)return;if(t-st.last>65){st.last=t;seek((start+(t-first)/450)%16)}st.raf=window.requestAnimationFrame(frame)}st.raf=window.requestAnimationFrame(frame)};
 $("#bsStop").onclick=()=>{stop();refresh()};
 $("#bsSingle").onclick=()=>{stop();st.a=trigger();st.b=clamp(st.a+1.6,0,16);seek(st.a)};
 $("#bsFit").onclick=()=>{stop();st.lo=0;st.hi=16;$("#bsTimeDiv").value="1.6";refresh()};
 $("#bsZoomIn").onclick=()=>zoom(.5);
 $("#bsZoomOut").onclick=()=>zoom(2);
 $("#bsPanLeft").onclick=()=>{stop();center(clamp((st.lo+st.hi)/2-(st.hi-st.lo)*.3,(st.hi-st.lo)/2,16-(st.hi-st.lo)/2));refresh()};
 $("#bsPanRight").onclick=()=>{stop();center(clamp((st.lo+st.hi)/2+(st.hi-st.lo)*.3,(st.hi-st.lo)/2,16-(st.hi-st.lo)/2));refresh()};
 $("#bsTrig").onchange=e=>{st.trig=Number(e.target.value);refresh()};
 $("#bsTrigLevel").onchange=e=>{st.level=Number(e.target.value)||0;refresh()};
 $("#bsTimeDiv").onchange=e=>{stop();center((st.lo+st.hi)/2,Math.min(16,Number(e.target.value)*10));refresh()};
 $("#bsCenter").onclick=()=>{stop();center(trigger());seek(trigger())};
 $("#bsA").oninput=e=>{const v=Number(e.target.value);stop();st.a=v;refresh()};
 $("#bsB").oninput=e=>{const v=Number(e.target.value);stop();st.b=v;refresh()};
 $("#bsChannelbar").onclick=e=>{const b=e.target.closest("[data-bs-ch]");if(!b)return;let n=Number(b.dataset.bsCh);st.shown[n]=!st.shown[n];refresh()};
 $("#bsChannelbar").onchange=e=>{const b=e.target.closest("[data-bs-gain]");if(!b)return;st.gains[Number(b.dataset.bsGain)]=Number(b.value);refresh()};
 $("#bsEvents").onclick=e=>{const b=e.target.closest("[data-bs-event]");if(!b)return;stop();const ev=st.events[Number(b.dataset.bsEvent)];st.a=ev.t;st.lastFocus=ev;seek(ev.t)};
 function pointer(e,mobile=false){
  let svg=mobile?e.target.closest("svg"):$("#bsLarge");
  if(!svg)return;
  const b=svg.getBoundingClientRect(),x=(e.clientX-b.left)*(mobile?360:1160)/b.width;
  const start=mobile?68:134,end=mobile?343:1125;
  if(x<start||x>end)return;
  const t=clamp(st.lo+(x-start)/(end-start)*(st.hi-st.lo),0,16);
  stop(); if(e.shiftKey||host.dataset.cursorTarget==="b")st.b=t;else{st.a=t;seek(t)}
  refresh();
 }
 $("#bsLarge").onpointerdown=e=>pointer(e,false);
 $("#bsMobile").onpointerdown=e=>pointer(e,true);
 $("#bsLarge").onkeydown=e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();stop();seek(st.cursor+(e.key==="ArrowRight"?.1:-.1))}};
 $("#bsA").min=$("#bsB").min="0";$("#bsA").max=$("#bsB").max="16";
 $("#bsA").step=$("#bsB").step=".01";
}
function draw(host,st){
 const $=s=>host.querySelector(s),rows=st.run.samples;
 const span=st.hi-st.lo, X=(t,W=1160,start=134,end=1125)=>start+(t-st.lo)/span*(end-start);
 const active=st.shown;
 $("#bsState").textContent=st.playing?"▶ REPLAY":"■ STOPPED · STORED";
 $("#bsTriggerState").textContent="TRIG CH"+(st.trig+1)+" ↑ "+st.level.toFixed(2)+" V";
 $("#bsWindow").textContent=st.lo.toFixed(2)+"–"+st.hi.toFixed(2)+" ns";
 $("#bsScreenRange").textContent=$("#bsWindow").textContent;
 const allStats=metrics(rows,st);
 // Each lane owns its unit range; vertical span controls only its scale, never the input sample values.
 const bases=channels.map((c,i)=>bounds(rows,c,[st.lo,st.hi]));
 const limits=bases.map(([min,max],i)=>{
  let mid=(min+max)/2,half=Math.max(.001,(max-min)*st.gains[i]/2);
  return [mid-half,mid+half];
 });
 const Y=(value,i,yTop,h=101)=>{const [vmin,vmax]=limits[i];return yTop+h-(value-vmin)/(vmax-vmin)*h};
 $("#bsChannelbar").innerHTML=channels.map((c,i)=>{
  const range=limits[i],perDiv=(range[1]-range[0])/4;
  return '<div class="bs-channel"><button type="button" data-bs-ch="'+i+'" aria-pressed="'+active[i]+'" style="--bs-color:'+c.color+'"><span>CH'+(i+1)+' · '+esc(c.short)+'</span><small>'+esc(c.type)+' · '+esc(c.unit)+'</small><b>'+num(perDiv)+' '+esc(c.unit)+'/div</b></button><label>Gain<select data-bs-gain="'+i+'" aria-label="Channel '+(i+1)+' vertical scale">'+[.5,1,2,4].map(n=>'<option value="'+n+'"'+(st.gains[i]===n?' selected':'')+'>'+n+'×</option>').join("")+'</select></label></div>';
 }).join("");
 const info=st.events;
 $("#bsEvents").innerHTML=info.map((e,i)=>'<button type="button" data-bs-event="'+i+'">◉ '+esc(e.label)+' <b>'+e.t.toFixed(2)+' ns</b></button>').join("");
 const W=1160,top=49,rowH=130,gridStart=134,gridEnd=1125,plotEnd=top+5*rowH-8;
 let svg='<rect width="1160" height="770" fill="#081323"/>';
 for(let z=0;z<=10;z++){
  const t=st.lo+span*z/10,px=X(t);
  svg+='<path d="M'+px+' 42 V'+plotEnd+'" stroke="#304155" stroke-width="1"/><text x="'+px+'" y="725" text-anchor="middle" fill="#c2d4e8" font-size="12">'+t.toFixed(span<4?2:1)+'</text>';
 }
 svg+='<text x="1120" y="755" fill="#e6f2ff" font-size="14" text-anchor="end">TIME (ns)</text>';
 for(let k=0;k<5;k++){
  const c=channels[k],base=top+k*rowH,yTop=base+13,yBottom=base+117,vis=active[k];
  svg+='<rect x="4" y="'+base+'" width="1151" height="122" rx="6" fill="'+(k%2?"#0a1b2b":"#0c2032")+'" stroke="#1a324a"/>';
  svg+='<rect x="8" y="'+(base+7)+'" width="118" height="31" rx="5" fill="'+c.color+'" opacity=".17" stroke="'+c.color+'"/>';
  svg+='<text x="16" y="'+(base+28)+'" fill="'+c.color+'" font-size="15" font-weight="bold">CH'+(k+1)+' '+esc(c.short)+'</text>';
  svg+='<text x="12" y="'+(base+51)+'" fill="#c9dbee" font-size="11">'+esc(c.type.toUpperCase())+'</text>';
  svg+='<text x="12" y="'+(base+67)+'" fill="#acc3d8" font-size="11">Unit: '+esc(c.unit)+'</text>';
  for(let z=0;z<=4;z++){
   const val=limits[k][1]-(limits[k][1]-limits[k][0])*z/4,y=yTop+104*z/4;
   svg+='<path d="M'+gridStart+' '+y+' H'+gridEnd+'" stroke="#2b425b" stroke-dasharray="3 6"/>';
   svg+='<text x="'+(gridStart-7)+'" y="'+(y+4)+'" fill="#9fbbd5" font-size="11" text-anchor="end">'+val.toFixed(Math.abs(val)>10?1:2)+'</text>';
  }
  if(!vis)continue;
  let segment=rows.filter(r=>r[0]>=st.lo-.03&&r[0]<=st.hi+.03);
  let path=segment.map((r,j)=>(j?"L":"M")+X(r[0]).toFixed(2)+" "+Y(r[c.column],k,yTop,104).toFixed(2)).join(" ");
  svg+='<path d="'+path+'" fill="none" stroke="'+c.color+'" stroke-width="2.9" stroke-linejoin="round"/>';
  // Trace point at the linked master cursor.
  if(st.cursor>=st.lo&&st.cursor<=st.hi){
   const px=X(st.cursor),val=nearest(rows,st.cursor)[c.column];
   svg+='<circle cx="'+px+'" cy="'+clamp(Y(val,k,yTop,104),yTop,yTop+104)+'" r="4" fill="'+c.color+'" stroke="#fff" stroke-width="1.5"/>';
  }
 }
 // Two measurement cursors plus connected circuit cursor, distinct line styles.
 for(const [t,tag,c] of [[st.a,"A","#f7d578"],[st.b,"B","#76e4be"]]){
  if(t<st.lo||t>st.hi)continue;
  const px=X(t);svg+='<path d="M'+px+' 43 V'+plotEnd+'" stroke="'+c+'" stroke-dasharray="7 5" stroke-width="2"/>'+
   '<rect x="'+clamp(px-21,136,1084)+'" y="10" width="44" height="27" rx="5" fill="#263650" stroke="'+c+'"/>'+
   '<text x="'+clamp(px,157,1106)+'" y="28" text-anchor="middle" fill="'+c+'" font-size="14" font-weight="bold">'+tag+'</text>';
 }
 if(st.cursor>=st.lo&&st.cursor<=st.hi){
  let px=X(st.cursor);
  svg+='<path d="M'+px+' 44 V'+plotEnd+'" stroke="#fff" stroke-opacity=".50" stroke-dasharray="2 7"/>';
 }
 // Event arrows on exactly the appropriate simulated channel, with labels bound to recorded samples.
 info.forEach((e,i)=>{
  if(e.t<st.lo||e.t>st.hi||!active[e.ch])return;
  const px=X(e.t),k=e.ch,c=channels[k],yt=top+k*rowH+13,
  val=nearest(rows,e.t)[c.column],py=clamp(Y(val,k,yt,104),yt,yt+104);
  const labelX=clamp(px+12,155,980),labelY=clamp(py-15,yt+18,yt+99);
  svg+='<circle cx="'+px+'" cy="'+py+'" r="6" fill="#ffef91" stroke="#111e2c" stroke-width="2"/>'+
   '<path d="M'+(labelX+7)+' '+(labelY+4)+' L'+(px+2)+' '+(py-2)+'" stroke="#fff1b2" stroke-width="1.5" marker-end="url(#bsArrow)"/>'+
   '<rect x="'+labelX+'" y="'+(labelY-20)+'" width="132" height="21" rx="4" fill="#29394d" stroke="#b6c28d"/>'+
   '<text x="'+(labelX+6)+'" y="'+(labelY-6)+'" fill="#fff6ba" font-size="11">'+esc(e.label)+'</text>';
 });
 svg+='<defs><marker id="bsArrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6Z" fill="#fff1b2"/></marker></defs>';
 $("#bsLarge").innerHTML=svg;
 // Mobile rendering uses 100% width and proper readable per-channel axes (not a hidden 780px graph).
 $("#bsMobile").innerHTML=channels.map((c,k)=>{
  if(!st.shown[k])return"";
  const yTop=27,ys=30,ye=123,rx=68,xx=t=>X(t,360,rx,343), yy=v=>Y(v,k,ys,88);
  let out='<svg viewBox="0 0 360 163" role="img" aria-label="CH'+(k+1)+' '+esc(c.about)+' in '+c.unit+'"><rect width="360" height="163" fill="#0a182d"/>';
  out+='<text x="9" y="17" fill="'+c.color+'" font-size="12">CH'+(k+1)+' · '+esc(c.short)+'</text><text x="350" y="17" text-anchor="end" fill="#cddfed" font-size="10">'+esc(c.type)+' ('+c.unit+')</text>';
  for(let n=0;n<=3;n++){
   let v=limits[k][1]-(limits[k][1]-limits[k][0])*n/3,y=ys+n*88/3;
   out+='<path d="M68 '+y+' H343" stroke="#2b435b" stroke-dasharray="3 5"/><text x="62" y="'+(y+4)+'" text-anchor="end" fill="#adc9e3" font-size="10">'+v.toFixed(Math.abs(v)>10?1:2)+'</text>';
  }
  for(let z=0;z<=4;z++){const t=st.lo+span*z/4,x=xx(t);out+='<path d="M'+x+' 27 V123" stroke="#20374e"/><text x="'+x+'" y="146" text-anchor="middle" fill="#bdcee3" font-size="10">'+t.toFixed(span<4?2:0)+'</text>'}
  const segment=rows.filter(r=>r[0]>=st.lo-.03&&r[0]<=st.hi+.03);
  out+='<path d="'+segment.map((r,i)=>(i?'L':'M')+xx(r[0]).toFixed(2)+' '+yy(r[c.column]).toFixed(2)).join(' ')+'" fill="none" stroke="'+c.color+'" stroke-width="2.7"/>';
  for(let [t,tag,col] of [[st.a,'A','#f7d578'],[st.b,'B','#76e4be']]){
   if(t<st.lo||t>st.hi)continue;
   out+='<path d="M'+xx(t)+' 25 V122" stroke="'+col+'" stroke-dasharray="6 4"/><text x="'+xx(t)+'" y="154" text-anchor="middle" fill="'+col+'" font-size="10">'+tag+'</text>';
  }
  for(let e of info){if(e.ch!==k||e.t<st.lo||e.t>st.hi)continue;
   out+='<circle cx="'+xx(e.t)+'" cy="'+clamp(yy(nearest(rows,e.t)[c.column]),28,119)+'" r="4" fill="#fff0a1"/>';
  }
  return out+'</svg>';
 }).join("");
 $("#bsMetrics").innerHTML=channels.map((c,i)=>'<tr><th style="color:'+c.color+'">CH'+(i+1)+' '+c.short+'</th><td>'+num(allStats[i].min)+' '+c.unit+'</td><td>'+num(allStats[i].max)+' '+c.unit+'</td><td>'+num(allStats[i].pp)+' '+c.unit+'</td></tr>').join("");
 $("#bsTimeA").textContent=st.a.toFixed(2)+" ns";
 $("#bsTimeB").textContent=st.b.toFixed(2)+" ns";
 $("#bsA").value=st.a;$("#bsB").value=st.b;
 const delta=st.b-st.a,recip=delta?1000/Math.abs(delta):Infinity;
 $("#bsDelta").innerHTML='<b>Δt '+delta.toFixed(2)+' ns</b><span>1/|Δt| = '+(Number.isFinite(recip)?recip.toFixed(1)+' MHz':'—')+' (cursor reciprocal)</span>';
 const a=nearest(rows,st.a),b=nearest(rows,st.b);
 $("#bsAtCursor").innerHTML='<table><thead><tr><th>Channel</th><th>@ A</th><th>@ B</th><th>Δ(B−A)</th></tr></thead><tbody>'+
  channels.map((c,i)=>'<tr><th style="color:'+c.color+'">'+esc(c.short)+'</th><td>'+num(a[c.column])+' '+c.unit+'</td><td>'+num(b[c.column])+' '+c.unit+'</td><td>'+num(b[c.column]-a[c.column])+' '+c.unit+'</td></tr>').join('')+
 '</tbody></table>';
 $("#bsEventNarrative").textContent=st.lastFocus?st.lastFocus.label+" @ "+st.lastFocus.t.toFixed(2)+" ns: "+st.lastFocus.narrative:
 "Start at SOURCE STEP (~1 ns). Then inspect CH2 TX, CH3 RX, and if fitted CH4 NMOS GATE at 8 ns alongside CH5 branch current. Click labeled markers or move A/B cursors to compare.";
}
window.renderBoardScope=render;
window.renderBoardScopeMarkup=skeleton;
})();
