"use strict";
/* Manual-referenced teaching bench. Processes modeled or imported samples locally.
   Not Keysight firmware, not a connected instrument, and not a bandwidth calibration. */
(function(){
const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
const colors=["#f4d74a","#4de3a2","#6cb4ff","#fa82b1"];
const secs={ns:1e-9,"μs":1e-6,ms:1e-3,s:1};
const clean=v=>Number.isFinite(v)?v.toFixed(Math.abs(v)<.1?5:3):"—";
const equipment=[
 ["CH1","CLKOUT1","SMA → BNC, exported clock","Frequency / period / duty"],
 ["CH2","VDD_CORE","N7020A 2 GHz power-rail probe","Droop / ripple / overshoot"],
 ["CH3","I_RSENSE","1169B 12 GHz differential probe across R_sense","Current: Vdiff / R_sense"],
 ["CH4","VDD_CORE_M / VDD_M","N7020A power-rail probe","Compare memory and logic rail"]
];
function markup(){
 return '<section class="km-bench" id="kmBench" aria-label="Manual-referenced interactive Keysight oscilloscope laboratory">'+
 '<div class="km-heading"><div><b>KEYSIGHT BENCH PROCEDURES · FOUR-CHANNEL ENGINEERING WORKSTATION</b><p>Independent processing of currently selected simulated/CSV waveforms · no live hardware attached</p></div><button id="kmCpu" type="button">Load documented CPU2 probe layout</button></div>'+
 '<details class="km-equipment"><summary>Equipment and channel hookup · actual workbench reference</summary><div class="km-table-scroller"><table><thead><tr><th>CH</th><th>Probe node</th><th>Connection</th><th>What to measure</th></tr></thead><tbody>'+equipment.map(row=>'<tr>'+row.map(v=>'<td>'+E(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>'+
 '<p class="km-warning">N7020A: 2 GHz power-rail probe; large ±24 V offset, ±850 mV active signal range about the offset. 1169B: 12 GHz differential voltage probe. <b>Neither the simulated response nor the preset sample-rate label proves instrument bandwidth or calibration.</b></p><p class="km-warning">1169B measures differential voltage; current is <b>calculated</b> only after entering the correct sense resistance. It is not a standalone current probe. Power-rail probes need low-inductance grounding and correct offset/headroom.</p></details>'+
 '<div class="km-controls">'+
 '<fieldset><legend>01 · Acquisition</legend><label>Mode<select id="kmAcq"><option value="normal">Normal (sample)</option><option value="peak">Peak detect (min/max)</option><option value="average">Average repeated traces</option><option value="hires">High resolution (boxcar)</option></select></label><label>Records<select id="kmRecords"><option value="2">2</option><option value="4" selected>4</option><option value="8">8</option><option value="16">16</option></select></label><label>Display points<select id="kmPoints"><option value="128">128</option><option value="256">256</option><option value="512" selected>512</option><option value="1024">1024</option></select></label><label>Timebase<select id="kmWindow"><option value="100">Full record</option><option value="50">Zoom 2×</option><option value="25">Zoom 4×</option></select></label></fieldset>'+
 '<fieldset><legend>02 · Vertical / probe conditioning</legend><label>Channel<select id="kmCh"><option value="0">CH1 · clock</option><option value="1" selected>CH2 · rail</option><option value="2">CH3 · sense</option><option value="3">CH4 · M-rail</option></select></label><label>Coupling<select id="kmCouple"><option value="DC">DC</option><option value="AC">AC · remove mean</option><option value="GND">GND · displayed zero</option></select></label><label>BW limit<select id="kmBw"><option value="off">Off</option><option value="2000000000">2 GHz</option><option value="200000000">200 MHz</option><option value="20000000">20 MHz</option><option value="1000000">1 MHz · demonstrator</option></select></label><label>Gain<select id="kmGain"><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label><label>Offset<input id="kmOffset" type="number" value="0" step=".01"></label></fieldset>'+
 '<fieldset><legend>03 · Trigger / threshold</legend><label>Source<select id="kmTrigCh"><option value="0">CH1</option><option value="1" selected>CH2</option><option value="2">CH3</option><option value="3">CH4</option></select></label><label>Condition<select id="kmTrigType"><option value="edge">Edge</option><option value="pulse">Pulse width / glitch</option><option value="runt">Runt excursion</option><option value="droop">Below level / droop</option></select></label><label>Slope<select id="kmSlope"><option value="rise">Rise</option><option value="fall">Fall</option></select></label><label>Level<input id="kmLevel" type="number" step=".01" value=".75"></label><label>Max pulse / runt width (time units)<input id="kmWidth" type="number" min="0" step=".1" value="2"></label></fieldset>'+
 '<fieldset><legend>04 · Measure / electrical math</legend><label>Threshold<select id="kmThreshold"><option value="10">10–90% rise/fall</option><option value="20">20–80% rise/fall</option></select></label><label>R_sense (mΩ)<input id="kmRs" type="number" min=".01" step=".5" value="5"></label><label>Math source<select id="kmMath"><option value="power">P = CH2 × I</option><option value="delta">ΔV = CH2 − CH4</option><option value="didt">dI/dt</option><option value="energy">∫ P dt</option><option value="fft">FFT on CH2</option></select></label><label>CH3 form<select id="kmCurrent"><option value="amp">Current already in A</option><option value="shunt">Shunt differential voltage (mV)</option></select></label></fieldset>'+
 '</div>'+
 '<div class="km-actions"><button type="button" id="kmRun">▶ Process capture</button><button type="button" id="kmSingle">Single trigger</button><button type="button" id="kmAuto">Autoscale</button><button type="button" id="kmClear">Clear result</button><button type="button" id="kmExport">Export processed CSV</button><button type="button" id="kmSvg">Export SVG</button><button type="button" id="kmSave">Save setup JSON</button><label class="km-load-label">Load setup JSON<input id="kmLoad" type="file" accept=".json,application/json"></label></div>'+
 '<p id="kmStatus" class="km-status" role="status" aria-live="polite">Select an acquisition mode and process a capture.</p>'+
 '<div class="km-viewport"><svg id="kmPlot" viewBox="0 0 1100 475" role="img" aria-label="Four channels processed from existing demonstration waveform"></svg></div>'+
 '<div class="km-ab"><label>A time <input id="kmA" type="range" min="0" max="100" step=".1" value="24"></label><label>B time <input id="kmB" type="range" min="0" max="100" step=".1" value="60"></label><label><input id="kmLink" type="checkbox" checked> Link B to A</label><span id="kmDelta"></span></div>'+
 '<div id="kmReadings" class="km-table-scroller"></div><div id="kmMathResult" class="km-math"></div>'+
 '<details class="km-manual"><summary>Instrument manual · what is physically supported versus modeled here</summary>'+
 '<p><b>Scope:</b> This browser does not connect to a Keysight oscilloscope. Mode processing works on bounded browser samples (at most 4,096 per channel), not hardware ADC sample memory. The display shows its <i>effective</i> sample spacing, not a claim of 8–20 GSa/s acquisition.</p>'+
 '<p><b>Modeled:</b> Trigger crossings, pulse qualification, arithmetic, filtering, averaging with deterministic illustrative noise, peak detect, math integrals, FFT, thresholds and exports operate on locally generated samples. Actual analog bandwidth/ADC noise, probe calibration, deskew, jitter, eye/mask compliance, segmented memory and hardware SCPI acquisition are not reproduced.</p>'+
 '<p>Official documents: <a target="_blank" rel="noopener" href="https://helpfiles.keysight.com/csg/d9300a/Help/Infiniium-UG/Content/Topics/Acquisition_Controls/Infiniium-setup-acquisition-tab.htm">Acquisition</a> · <a target="_blank" rel="noopener" href="https://helpfiles.keysight.com/csg/d9300a/Help/Infiniium-UG/Content/Topics/Triggering/a_triggering.htm">Trigger</a> · <a target="_blank" rel="noopener" href="https://helpfiles.keysight.com/csg/d9300a/Help/Infiniium-UG/Content/Topics/Measurements/Time_Measurements/rise_time.htm">Rise time</a> · <a target="_blank" rel="noopener" href="https://prc.keysight.com/Content/PDF_Files/N7020-97005.pdf">N7020A probe</a> · <a target="_blank" rel="noopener" href="https://www.keysight.com/us/en/product/1169B/infiniimax-ii-series-probe-amplifier-12-ghz.html">1169B probe</a>.</p></details></section>';
}
function stats(a){
 const n=a.length,min=Math.min(...a),max=Math.max(...a),mean=a.reduce((x,y)=>x+y,0)/n;
 return {min,max,mean,rms:Math.sqrt(a.reduce((x,y)=>x+y*y,0)/n),pp:max-min};
}
function cross(v,t,level,up){
 const hits=[];
 for(let i=1;i<v.length;i++){
  const x=v[i-1],y=v[i],valid=up?x<level&&y>=level:x>level&&y<=level;
  if(valid){const f=clamp((level-x)/(y-x||1),0,1);hits.push(t[i-1]+f*(t[i]-t[i-1]))}
 }
 return hits;
}
function timing(v,t,lowPercent){
 const st=stats(v),range=st.pp;if(range<1e-12)return {rise:null,fall:null,period:null,duty:null,freq:null};
 const lo=st.min+range*lowPercent/100,hi=st.max-range*lowPercent/100,mid=st.min+range/2;
 const up=cross(v,t,mid,true),down=cross(v,t,mid,false),upsLo=cross(v,t,lo,true),upsHi=cross(v,t,hi,true),downsHi=cross(v,t,hi,false),downsLo=cross(v,t,lo,false);
 const rise=upsLo.length&&upsHi.length?upsHi.find(x=>x>=upsLo[0]) - upsLo[0]:null;
 const fall=downsHi.length&&downsLo.length?downsLo.find(x=>x>=downsHi[0]) - downsHi[0]:null;
 const period=up.length>1?(up.at(-1)-up[0])/(up.length-1):null;
 const nextDown=down.find(x=>up.length&&x>up[0]),duty=period&&nextDown!==undefined?100*(nextDown-up[0])/period:null;
 return {rise:Number.isFinite(rise)?rise:null,fall:Number.isFinite(fall)?fall:null,period,duty,freq:period?1/period:null};
}
function filter(a,dt,cutoff){
 if(!cutoff)return a.slice();
 const tau=1/(2*Math.PI*cutoff),alpha=clamp(dt/(tau+dt),0,1),result=[a[0]];
 for(let i=1;i<a.length;i++)result.push(result[i-1]+alpha*(a[i]-result[i-1]));
 return result;
}
function reduceSamples(v,kind,n,rep){
 const raw=v.length,out=[],mins=[],maxs=[];
 const noise=(x,k)=>Math.sin((x+1)*5.29+(k+1)*3.17)*.003;
 for(let i=0;i<n;i++){
  const lo=Math.floor(i*raw/n),hi=Math.min(raw,Math.max(lo+1,Math.floor((i+1)*raw/n)));
  const subset=v.slice(lo,hi),at=v[Math.min(raw-1,Math.floor((lo+hi)/2))];
  mins.push(Math.min(...subset));maxs.push(Math.max(...subset));
  if(kind==="hires")out.push(subset.reduce((a,b)=>a+b,0)/subset.length);
  else if(kind==="peak")out.push(at);
  else if(kind==="average"){
   let avg=0;
   for(let k=0;k<rep;k++)avg+=at+noise(i,k);
   out.push(avg/rep);
  }else out.push(at);
 }
 return {v:out,lo:mins,hi:maxs};
}
function trigger(v,t,type,level,slope,width){
 const up=cross(v,t,level,true),down=cross(v,t,level,false);
 if(type==="edge")return (slope==="rise"?up:down)[0]??null;
 if(type==="droop")return down[0]??null;
 if(type==="pulse"){
  for(const x of up){const y=down.find(t=>t>x);if(y!==undefined&&y-x<=width)return x}
  return null;
 }
 const s=stats(v),lower=Math.min(level,s.min+s.pp*.25),upper=Math.max(level,s.max-s.pp*.25);
 for(let i=1;i<v.length;i++)if(v[i-1]<lower&&v[i]>=lower){
  const stop=Math.min(v.length,i+Math.max(2,Math.round(width/(t[1]-t[0]))));
  if(Math.max(...v.slice(i,stop))<upper)return t[i];
 }
 return null;
}
function download(name,content,mime){
 const url=URL.createObjectURL(new Blob([content],{type:mime})),a=document.createElement("a");
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),600);
}
function mount(root,inst){
 if(!root||!inst||root.querySelector("#kmBench"))return;
 const anchor=root.querySelector("#ixEvents");
 if(!anchor)return;
 anchor.insertAdjacentHTML("beforebegin",markup());
 const $=q=>root.querySelector(q),selectors=["kmAcq","kmRecords","kmPoints","kmWindow","kmCh","kmCouple","kmBw","kmGain","kmOffset","kmTrigCh","kmTrigType","kmSlope","kmLevel","kmWidth","kmThreshold","kmRs","kmMath","kmCurrent"];
 const settings=()=>Object.fromEntries(selectors.map(k=>[k,$("#"+k).value]));
 const channel=Array.from({length:4},()=>({coupling:"DC",cutoff:0,gain:1,offset:0}));
 let capture=null,a=.24,b=.60,gap=.36,linked=true,visible=false;
 const selected=()=>Number($("#kmCh").value);
 function syncFields(){
  const ch=channel[selected()];
  $("#kmCouple").value=ch.coupling;$("#kmBw").value=String(ch.cutoff);$("#kmGain").value=String(ch.gain);$("#kmOffset").value=String(ch.offset);
 }
 function readFields(){
  const ch=channel[selected()];
  ch.coupling=$("#kmCouple").value;ch.cutoff=Number($("#kmBw").value);ch.gain=Number($("#kmGain").value);ch.offset=Number($("#kmOffset").value)||0;
 }
 function process(){
  const def=inst.getDefinition(),T=def.T,unit=def.unit,conv=secs[unit]||1e-9,source=inst.getSignals();
  const n=Number($("#kmPoints").value),rep=Number($("#kmRecords").value),mode=$("#kmAcq").value;
  const windowFactor=Number($("#kmWindow").value)/100,span=T*windowFactor,left=(T-span)*.5,right=left+span;
  // Number of points is intentionally bounded. Model output is not raw ADC data.
  const dense=4096,t=Array.from({length:dense},(_,i)=>left+(i/(dense-1))*span);
  const times=Array.from({length:n},(_,i)=>left+span*(i+.5)/n);
  const raw=Array.from({length:4},(_,j)=>{
   const vals=t.map(tt=>inst.getRaw(tt,j));
   return filter(vals,span*conv/(dense-1),channel[j].cutoff);
  });
  const processed=raw.map((v,j)=>{
   const r=reduceSamples(v,mode,n,rep);
   const st=stats(r.v);
   const mean=st.mean,ch=channel[j];
   const transform=x=>ch.coupling==="GND"?ch.offset:(x-(ch.coupling==="AC"?mean:0))*ch.gain+ch.offset;
   return {raw:r.v,display:r.v.map(transform),lo:r.lo.map(transform),hi:r.hi.map(transform),unit:source[j]?.unit||"V",name:source[j]?.name||"CH"+(j+1)};
  });
  const ch=Number($("#kmTrigCh").value),level=Number($("#kmLevel").value),width=Math.max(0,Number($("#kmWidth").value)||0);
  const hit=trigger(processed[ch].raw,times,$("#kmTrigType").value,level,$("#kmSlope").value,width);
  capture={def,unit,conv,times,processed,hit,mode,source,n,span};
  const dt=span/n,eff=1/(dt*conv);
  $("#kmStatus").textContent="Processed "+n+" display samples/channel · Δt = "+clean(dt)+" "+unit+" · effective "+(eff/1e6).toFixed(3)+" MSa/s. Trigger "+(hit===null?"NOT FOUND":("crossing at "+hit.toFixed(3)+" "+unit))+" · "+mode.toUpperCase()+" (software model)";
  visible=true;draw();
 }
 function calcCurrent(c,i){
  const v=c.processed[2].raw[i];
  const rs=Number($("#kmRs").value)*.001;
  return $("#kmCurrent").value==="shunt"?(v*.001)/Math.max(rs,1e-9):v;
 }
 function showMath(c){
  const n=c.n,ma=$("#kmMath").value,dt=(c.times[1]-c.times[0])*c.conv;
  const cur=Array.from({length:n},(_,i)=>calcCurrent(c,i));
  const power=cur.map((I,i)=>I*c.processed[1].raw[i]);
  let result="";
  if(ma==="power")result="P(t)=CH2 × I(t) · peak "+clean(Math.max(...power))+" W; Pavg "+clean(stats(power).mean)+" W";
  if(ma==="delta"){
   const diff=c.processed[1].raw.map((v,i)=>v-c.processed[3].raw[i]);
   result="ΔV(t) = VDD_CORE − VDD_M · peak |ΔV| "+clean(Math.max(...diff.map(Math.abs)))+" V";
  }
  if(ma==="didt"){
   const didt=cur.slice(1).map((v,i)=>(v-cur[i])/dt);
   result="dI/dt peak |slope| "+clean(Math.max(...didt.map(Math.abs))/1e9)+" A/ns · V_L = L × dI/dt";
  }
  if(ma==="energy"){
   let E=0;for(let i=1;i<n;i++)E+=(power[i-1]+power[i])*.5*dt;
   result="E = ∫ P(t) dt ≈ "+clean(E*1e6)+" μJ (trapezoidal integration)";
  }
  if(ma==="fft"){
   const x=c.processed[1].raw,mean=stats(x).mean,N=Math.min(128,x.length);
   let max=0,freq=0;
   for(let k=1;k<N/2;k++){
    let re=0,im=0;
    for(let j=0;j<N;j++){const sample=(x[j]-mean)*(.5-.5*Math.cos(2*Math.PI*j/(N-1)));re+=sample*Math.cos(2*Math.PI*k*j/N);im-=sample*Math.sin(2*Math.PI*k*j/N)}
    const amp=4*Math.hypot(re,im)/N;
    if(amp>max){max=amp;freq=k/(N*dt)}
   }
   result="Hann-windowed FFT on CH2 · strongest non-DC bin "+clean(freq/1e6)+" MHz · magnitude "+clean(max)+" "+c.processed[1].unit+" (limited by effective sampling)";
  }
  $("#kmMathResult").textContent=result;
 }
 function draw(){
  const c=capture;if(!visible||!c){$("#kmPlot").innerHTML="";$("#kmReadings").innerHTML="";$("#kmMathResult").textContent="";return}
  const {times,processed,n,unit}=c,first=times[0],last=times.at(-1),x=t=>128+925*(t-first)/(last-first);
  const at=alpha=>first+alpha*(last-first);
  const aa=at(a),bb=at(b);
  let svg='<rect width="1100" height="475" fill="#071526"/>';
  for(let i=0;i<=10;i++){
   const t=first+(last-first)*i/10,X=x(t);
   svg+='<path d="M'+X+' 24 V427" stroke="#27405a"/><text x="'+X+'" y="454" text-anchor="middle" fill="#b7d3e6" font-size="11">'+t.toFixed(2)+'</text>';
  }
  svg+='<text x="1065" y="469" text-anchor="end" fill="#cfdeed" font-size="12">TIME ('+E(unit)+') · processed points only</text>';
  const xa=x(aa),xb=x(bb),lo=Math.min(xa,xb),hi=Math.max(xa,xb);
  svg+='<rect x="'+lo+'" y="20" width="'+(hi-lo)+'" height="412" fill="#5ce8bc" fill-opacity=".08"/>';
  const trow=["CH1","CH2","CH3","CH4"];
  processed.forEach((ch,j)=>{
   const top=28+j*100,bot=top+78,st=stats(ch.display),min=st.min,max=st.max,span=Math.max(st.pp,1e-9),Y=v=>bot-8-(v-min)/span*61;
   svg+='<rect x="8" y="'+top+'" width="1078" height="86" rx="5" fill="'+(j%2?"#0c2135":"#0b1d2e")+'"/><text x="15" y="'+(top+22)+'" font-size="15" font-weight="800" fill="'+colors[j]+'">'+trow[j]+'</text><text x="15" y="'+(top+39)+'" font-size="11" fill="#bfd5e5">'+E(ch.name.slice(0,13))+'</text><text x="15" y="'+(top+59)+'" font-size="10" fill="#96b6cc">'+clean(min)+".."+clean(max)+" "+E(ch.unit)+'</text>';
   const path=ch.display.map((v,i)=>(i?"L":"M")+x(times[i]).toFixed(1)+" "+Y(v).toFixed(1)).join(" ");
   svg+='<path d="'+path+'" fill="none" stroke="'+colors[j]+'" stroke-width="2.2"/>';
   if(c.mode==="peak"){
    for(let i=0;i<n;i+=Math.max(1,Math.floor(n/200)))svg+='<path d="M'+x(times[i])+' '+Y(ch.lo[i])+' V'+Y(ch.hi[i])+'" stroke="'+colors[j]+'" opacity=".4"/>';
   }
   [[aa,"A","#fbd27c"],[bb,"B","#6eeac4"]].forEach(([tm,tag,color])=>{
    const idx=clamp(Math.round((tm-first)/(last-first)*(n-1)),0,n-1);
    svg+='<circle data-km-marker="'+tag+'" data-km-ch="'+j+'" cx="'+x(tm)+'" cy="'+Y(ch.display[idx])+'" r="5" fill="'+color+'" stroke="#05111c" stroke-width="1.4"/>';
   });
  });
  [[aa,"A","#fbd27c"],[bb,"B","#6eeac4"]].forEach(([tm,label,color])=>{
   svg+='<path d="M'+x(tm)+' 18 V430" stroke="'+color+'" stroke-width="1.6" stroke-dasharray="7 4"/><text x="'+x(tm)+'" y="14" text-anchor="middle" fill="'+color+'" font-size="13" font-weight="800">'+label+'</text>';
  });
  if(c.hit!==null&&c.hit>=first&&c.hit<=last){
   svg+='<path d="M'+x(c.hit)+' 19 V431" stroke="#ff816c" stroke-dasharray="3 5"/><text x="'+x(c.hit)+'" y="438" fill="#ff9f9a" text-anchor="middle" font-size="10">TRIG</text>';
  }
  $("#kmPlot").innerHTML=svg;
  $("#kmDelta").textContent="A "+aa.toFixed(3)+" · B "+bb.toFixed(3)+" · Δt "+(bb-aa).toFixed(3)+" "+unit;
  const idx=v=>clamp(Math.round(v*(n-1)),0,n-1);
  let html='<table><thead><tr><th>Channel</th><th>Min</th><th>Max</th><th>Vpp</th><th>Mean</th><th>RMS</th><th>Rise</th><th>Period</th><th>A</th><th>B</th><th>Δ raw</th></tr></thead><tbody>';
  processed.forEach((p,i)=>{
   const st=stats(p.raw),tm=timing(p.raw,times,Number($("#kmThreshold").value));
   html+='<tr><th style="color:'+colors[i]+'">'+E(p.name)+'</th><td>'+clean(st.min)+'</td><td>'+clean(st.max)+'</td><td>'+clean(st.pp)+'</td><td>'+clean(st.mean)+'</td><td>'+clean(st.rms)+'</td><td>'+(tm.rise===null?"—":clean(tm.rise)+" "+unit)+'</td><td>'+(tm.period===null?"—":clean(tm.period)+" "+unit)+'</td><td>'+clean(p.raw[idx(a)])+'</td><td>'+clean(p.raw[idx(b)])+'</td><td>'+clean(p.raw[idx(b)]-p.raw[idx(a)])+'</td></tr>';
  });
  $("#kmReadings").innerHTML=html+'</tbody></table>';
  showMath(c);
 }
 $("#kmCpu").onclick=()=>{
  const sel=root.querySelector("#ixPreset");
  if(!sel){$("#kmStatus").textContent="Parent oscilloscope preset is not available";return}
  sel.value="MBU_DVFS_transition_cpu2_left";sel.dispatchEvent(new Event("change",{bubbles:true}));
  $("#kmTrigCh").value="1";$("#kmLevel").value=".75";$("#kmCurrent").value="amp";
  $("#kmStatus").textContent="CPU2 documented channel layout selected. Reprocess acquisition to measure the training scenario.";
  process();
 };
 $("#kmCh").onchange=syncFields;
 for(const key of ["kmCouple","kmBw","kmGain","kmOffset"])$("#"+key).onchange=()=>{readFields();process()};
 for(const key of ["kmAcq","kmRecords","kmPoints","kmWindow","kmTrigCh","kmTrigType","kmSlope","kmLevel","kmWidth","kmThreshold","kmRs","kmMath","kmCurrent"])$("#"+key).onchange=process;
 $("#kmRun").onclick=process;
 $("#kmSingle").onclick=()=>{process();if(capture?.hit===null)$("#kmStatus").textContent="WAIT: no matching trigger. Adjust source/level/type or switch to normal mode."};
 $("#kmAuto").onclick=()=>{channel.forEach(c=>{c.coupling="DC";c.cutoff=0;c.gain=1;c.offset=0});syncFields();$("#kmWindow").value="100";process()};
 $("#kmClear").onclick=()=>{visible=false;draw();$("#kmStatus").textContent="Display cleared; simulation source unchanged."};
 $("#kmA").oninput=e=>{a=Number(e.target.value)/100;if(linked)b=clamp(a+gap,0,1);$("#kmB").value=(b*100).toFixed(2);draw()};
 $("#kmB").oninput=e=>{b=Number(e.target.value)/100;gap=b-a;draw()};
 $("#kmLink").onchange=e=>{linked=e.target.checked;gap=b-a;draw()};
 $("#kmExport").onclick=()=>{
  if(!capture)process();const c=capture;
  const csv="time_"+c.unit+","+c.processed.map((ch,i)=>"CH"+(i+1)+"_"+ch.name).join(",")+"\n"+c.times.map((t,i)=>t+","+c.processed.map(ch=>ch.raw[i]).join(",")).join("\n");
  download("keysight-teaching-processed.csv",csv,"text/csv");
 };
 $("#kmSvg").onclick=()=>{if(!capture)process();download("keysight-teaching-screen.svg",'<?xml version="1.0"?>\n'+$("#kmPlot").outerHTML.replace("<svg ","<svg xmlns=\"http://www.w3.org/2000/svg\" "),"image/svg+xml")};
 $("#kmSave").onclick=()=>download("keysight-teaching-setup.json",JSON.stringify({version:1,form:settings(),channels:channel,notHardwareSetup:true},null,2),"application/json");
 $("#kmLoad").onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
   if(file.size>120000)throw Error("Setup file too large");
   const obj=JSON.parse(await file.text());if(obj.version!==1||!obj.form)throw Error("Unsupported setup version");
   for(const k of selectors)if(Object.hasOwn(obj.form,k))$("#"+k).value=String(obj.form[k]);
   if(Array.isArray(obj.channels)&&obj.channels.length===4)obj.channels.forEach((v,i)=>{channel[i]={coupling:v.coupling==="AC"||v.coupling==="GND"?v.coupling:"DC",cutoff:clamp(Number(v.cutoff)||0,0,2e9),gain:clamp(Number(v.gain)||1,.5,4),offset:clamp(Number(v.offset)||0,-500,500)}});
   syncFields();process();$("#kmStatus").textContent+=" · Local setup restored.";
  }catch(err){$("#kmStatus").textContent="Unable to restore setup: "+err.message}
 };
 root.addEventListener("change",e=>{
  if(e.target?.id==="ixPreset")process();
 });
 root.__keysightManualBench={process,channel,trigger,timing,stats,getCapture:()=>capture};
 syncFields();process();
}
window.renderKeysightManualBench=markup;
window.mountKeysightManualBench=mount;
window.keysightBenchMath={stats,cross,timing,filter,reduceSamples,trigger};
})();