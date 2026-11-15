"use strict";
/* Manual-referenced teaching bench (Keysight Infiniium / InfiniiVision Manual Architecture).
   Interactive 4-channel probing (SMA-to-BNC, N7020A Power-Rail, 1169B 12GHz Differential),
   live board test-point selection, acquisition, conditioning, deskew, mask test, and MathML equations.
   Processes locally generated or imported samples only (not live SCPI hardware). */
(function(){
const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
const colors=["#f4d74a","#4de3a2","#6cb4ff","#fa82b1"];
const secs={ns:1e-9,"μs":1e-6,ms:1e-3,s:1};
const clean=v=>Number.isFinite(v)?v.toFixed(Math.abs(v)<.1?5:3):"—";

const PROBE_CATALOG={
 sma_bnc_50:{label:"SMA-to-BNC 50Ω Coax",bw:"2 GHz",z:"50 Ω",atten:1,loopNh:0.2,headroom:"±5 V @ 50 Ω",idealFor:["TP1_CLKOUT1"]},
 n7020a_rail:{label:"Keysight N7020A Power-Rail (2 GHz, 1:1)",bw:"2 GHz",z:"50 kΩ DC / 50 Ω AC",atten:1,loopNh:0.4,headroom:"±24 V Offset, ±850 mV Active Window",idealFor:["TP2_VDDCORE","TP4_VDDM"]},
 "1169b_diff":{label:"Keysight 1169B InfiniiMax II Diff (12 GHz)",bw:"12 GHz",z:"50 kΩ Diff",atten:1,loopNh:0.3,headroom:"±3.3 V Diff Across R_sense",idealFor:["TP3_RSENSE"]},
 passive_10x_alligator:{label:"10:1 Passive + 6-in Alligator Ground",bw:"500 MHz (Loop-Limited)",z:"10 MΩ // 12 pF",atten:10,loopNh:145,headroom:"±300 V CAT I (10× noise penalty!)",idealFor:[]},
 single_ended_gnd_clip:{label:"Single-Ended BNC Clip Across High-Side Shunt",bw:"Short Trap",z:"Chassis GND Short",atten:1,loopNh:25,headroom:"DANGER: Shorts V_rail through Scope GND!",idealFor:[]}
};

const TEST_POINTS=[
 {id:"TP1_CLKOUT1",label:"TP1 · CLKOUT1 (SMA Port)",desc:"Exported SoC clock via 50Ω SMA-to-BNC",expected:"sma_bnc_50"},
 {id:"TP2_VDDCORE",label:"TP2 · VDD_CORE (BGA Decap Kelvin)",desc:"Logic core rail (0.75–1.05 V)",expected:"n7020a_rail"},
 {id:"TP3_RSENSE",label:"TP3 · R_SENSE 5mΩ (High-Side Kelvin)",desc:"Shunt differential pair (I = Vdiff / Rsense)",expected:"1169b_diff"},
 {id:"TP4_VDDM",label:"TP4 · VDD_CORE_M (Memory Rail)",desc:"M-rail supply plane",expected:"n7020a_rail"},
 {id:"TP5_CHASSIS_GND",label:"TP5 · Long 6-in GND Stud",desc:"High-inductance return path (ringing trap)",expected:"none"}
];

const equipment=[
 ["CH1","CLKOUT1 (TP1)","SMA-to-BNC 50Ω coax (exported clock)","Frequency, period, duty, clock jitter vs rail droop"],
 ["CH2","VDD_CORE (TP2)","Keysight N7020A 2 GHz Power-Rail probe (1:1, ±24V offset)","True sub-10mV droop, ripple & overshoot w/ ±850mV window"],
 ["CH3","I_RSENSE (TP3)","Keysight 1169B 12 GHz Differential probe across R_sense","Differential Vdiff → I(t) = Vdiff(t) / R_sense"],
 ["CH4","VDD_M (TP4)","Keysight N7020A 2 GHz Power-Rail probe","Compare M-rail vs Core logic rail ΔV(t)"]
];

const DEFAULT_HOOKUP=[
 {probe:"sma_bnc_50",node:"TP1_CLKOUT1"},
 {probe:"n7020a_rail",node:"TP2_VDDCORE"},
 {probe:"1169b_diff",node:"TP3_RSENSE"},
 {probe:"n7020a_rail",node:"TP4_VDDM"}
];

function markup(){
 return '<section class="km-bench" id="kmBench" aria-label="Manual-referenced interactive Keysight oscilloscope laboratory">'+
 '<div class="km-heading"><div><b>KEYSIGHT BENCH PROCEDURES · FOUR-CHANNEL ENGINEERING WORKSTATION</b><p>Real-life 4-CH Keysight setup (SMA-to-BNC, N7020A Power-Rail, 1169B 12 GHz Diff) + Interactive Board Probing · local sample processing</p></div><button id="kmCpu" type="button">Load documented CPU2 probe layout</button></div>'+
 '<details class="km-equipment"><summary>Equipment, Keysight user-manual probe specs &amp; workbench channel hookup</summary><div class="km-table-scroller"><table><thead><tr><th>CH</th><th>Probe node</th><th>Connection</th><th>What to measure</th></tr></thead><tbody>'+equipment.map(row=>'<tr>'+row.map(v=>'<td>'+E(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>'+
 '<p class="km-warning"><b>N7020A Power-Rail Probe (2 GHz, 1:1):</b> ±24 V built-in offset DAC removes DC rail bias while preserving a ±850 mV active signal window at low V/div sensitivity with 50 kΩ DC input impedance and coax spring grounding (never use a 6-inch alligator ground lead!).</p>'+
 '<p class="km-warning"><b>Keysight 1169B InfiniiMax II (12 GHz Differential):</b> Measures differential voltage <i>V_diff = V+ − V−</i> safely across a floating high-side <i>R_sense</i> shunt resistor. Current is <b>calculated</b> as <i>I(t) = V_diff(t) / R_sense</i>; attaching a single-ended ground-clip BNC probe across a high-side shunt shorts the rail to earth ground.</p></details>'+
 '<div class="km-probe-studio" id="kmProbeStudio">'+
  '<div class="km-probe-head"><b>LIVE INTERACTIVE PROBE POINT &amp; PROBE SELECTION BENCH</b><span>Click a board Test Point (TP1–TP4) or change CH1–CH4 probes to inspect ground-loop inductance, attenuation &amp; differential safety live</span></div>'+
  '<div class="km-probe-layout">'+
   '<div class="km-board-map-wrap"><svg id="kmBoardMap" viewBox="0 0 540 245" role="img" aria-label="Interactive PCB DUT test points TP1 through TP5 for Keysight probes"></svg></div>'+
   '<div class="km-table-scroller km-probe-table-wrap"><table id="kmProbeTable"><thead><tr><th>CH</th><th>Signal</th><th>Selected Probe</th><th>Test Point</th><th>Status</th></tr></thead><tbody></tbody></table></div>'+
  '</div>'+
  '<div id="kmProbeDiag" class="km-probe-diag" role="status" aria-live="polite"></div>'+
 '</div>'+
 '<div class="km-controls">'+
 '<fieldset><legend>01 · Acquisition</legend><label>Mode<select id="kmAcq"><option value="normal">Normal (sample)</option><option value="peak">Peak detect (min/max)</option><option value="average">Average repeated traces</option><option value="hires">High resolution (boxcar)</option></select></label><label>Records<select id="kmRecords"><option value="2">2</option><option value="4" selected>4</option><option value="8">8</option><option value="16">16</option></select></label><label>Display points<select id="kmPoints"><option value="128">128</option><option value="256">256</option><option value="512" selected>512</option><option value="1024">1024</option></select></label><label>Timebase<select id="kmWindow"><option value="100">Full record</option><option value="50">Zoom 2×</option><option value="25">Zoom 4×</option></select></label></fieldset>'+
 '<fieldset><legend>02 · Vertical / probe conditioning</legend><label>Channel<select id="kmCh"><option value="0">CH1 · clock</option><option value="1" selected>CH2 · rail</option><option value="2">CH3 · sense</option><option value="3">CH4 · M-rail</option></select></label><label>Coupling<select id="kmCouple"><option value="DC">DC</option><option value="AC">AC · remove mean</option><option value="GND">GND · displayed zero</option></select></label><label>BW limit<select id="kmBw"><option value="off">Off (Full Probe BW)</option><option value="2000000000">2 GHz (N7020A)</option><option value="200000000">200 MHz</option><option value="20000000">20 MHz</option><option value="1000000">1 MHz · demonstrator</option></select></label><label>Gain<select id="kmGain"><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label><label>Offset<input id="kmOffset" type="number" value="0" step=".01"></label></fieldset>'+
 '<fieldset><legend>03 · Trigger / threshold</legend><label>Source<select id="kmTrigCh"><option value="0">CH1</option><option value="1" selected>CH2</option><option value="2">CH3</option><option value="3">CH4</option></select></label><label>Condition<select id="kmTrigType"><option value="edge">Edge</option><option value="pulse">Pulse width / glitch</option><option value="runt">Runt excursion</option><option value="droop">Below level / droop</option></select></label><label>Slope<select id="kmSlope"><option value="rise">Rise</option><option value="fall">Fall</option></select></label><label>Level<input id="kmLevel" type="number" step=".01" value=".75"></label><label>Max pulse / runt width (time units)<input id="kmWidth" type="number" min="0" step=".1" value="2"></label></fieldset>'+
 '<fieldset><legend>04 · Measure / electrical math</legend><label>Threshold<select id="kmThreshold"><option value="10">10–90% rise/fall</option><option value="20">20–80% rise/fall</option></select></label><label>R_sense (mΩ)<input id="kmRs" type="number" min=".01" step=".5" value="5"></label><label>Math source<select id="kmMath"><option value="power">P = CH2 × I</option><option value="delta">ΔV = CH2 − CH4</option><option value="didt">dI/dt &amp; L·dI/dt</option><option value="energy">∫ P dt</option><option value="fft">FFT on CH2</option></select></label><label>CH3 form<select id="kmCurrent"><option value="amp">Current already in A</option><option value="shunt">Shunt differential voltage (mV)</option></select></label></fieldset>'+
 '<fieldset class="km-util-fieldset"><legend>05 · Keysight Utilities, Deskew &amp; Mask Compliance</legend><label>Channel Deskew (time units)<input id="kmDeskew" type="number" value="0" step=".2"></label><label>Probe Attenuation<select id="kmAtten"><option value="1" selected>1:1 (N7020A / SMA 50Ω)</option><option value="10">10:1 (Passive / High-V)</option></select></label><label>Pass/Fail Mask<select id="kmMask"><option value="off" selected>Off</option><option value="50">±50 mV CH2 Rail Limit</option><option value="100">±100 mV CH2 Rail Limit</option></select></label><label>Channel Cal Check<button type="button" id="kmCalBtn" class="km-mini-btn">Run Probe Comp &amp; Offset Check</button></label></fieldset>'+
 '</div>'+
 '<div class="km-actions"><button type="button" id="kmRun">▶ Process capture</button><button type="button" id="kmSingle">Single trigger</button><button type="button" id="kmAuto">Autoscale</button><button type="button" id="kmClear">Clear result</button><button type="button" id="kmExport">Export processed CSV</button><button type="button" id="kmSvg">Export SVG</button><button type="button" id="kmSave">Save setup JSON</button><label class="km-load-label">Load setup JSON<input id="kmLoad" type="file" accept=".json,application/json"></label></div>'+
 '<p id="kmStatus" class="km-status" role="status" aria-live="polite">Select an acquisition mode and process a capture.</p>'+
 '<div class="km-viewport"><svg id="kmPlot" viewBox="0 0 1100 475" role="img" aria-label="Four channels processed from existing demonstration waveform"></svg></div>'+
 '<div class="km-ab"><label>A time <input id="kmA" type="range" min="0" max="100" step=".1" value="24"></label><label>B time <input id="kmB" type="range" min="0" max="100" step=".1" value="60"></label><label><input id="kmLink" type="checkbox" checked> Link B to A</label><span id="kmDelta"></span></div>'+
 '<div id="kmReadings" class="km-table-scroller"></div>'+
 '<div class="km-math-card"><div id="kmMathFormula" class="km-math-formula"></div><div id="kmMathResult" class="km-math"></div></div>'+
 '<details class="km-manual"><summary>Instrument manual · supported procedures versus browser model boundaries</summary>'+
 '<p><b>Scope:</b> This browser does not connect to a Keysight oscilloscope. Mode processing works on bounded browser samples (at most 4,096 per channel), not hardware ADC sample memory. The display shows its <i>effective</i> sample spacing, not a claim of 8–20 GSa/s acquisition.</p>'+
 '<p><b>Modeled:</b> Probe selection effects (ground-loop ringing from 6-in alligator leads, N7020A offset headroom, 1169B differential shunt voltage), channel deskew, trigger crossings, pulse qualification, arithmetic, filtering, averaging with deterministic illustrative noise, peak detect, math integrals, FFT, pass/fail limit mask, thresholds and exports operate locally.</p>'+
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
 const $=q=>root.querySelector(q),selectors=["kmAcq","kmRecords","kmPoints","kmWindow","kmCh","kmCouple","kmBw","kmGain","kmOffset","kmTrigCh","kmTrigType","kmSlope","kmLevel","kmWidth","kmThreshold","kmRs","kmMath","kmCurrent","kmDeskew","kmAtten","kmMask"];
 const settings=()=>Object.fromEntries(selectors.map(k=>[k,$("#"+k)?.value]));
 const channel=Array.from({length:4},(_,j)=>({coupling:"DC",cutoff:0,gain:1,offset:0,deskew:0,atten:1,probe:DEFAULT_HOOKUP[j].probe,node:DEFAULT_HOOKUP[j].node}));
 let capture=null,a=.24,b=.60,gap=.36,linked=true,visible=false;
 const selected=()=>Number($("#kmCh").value);

 function evaluateProbeStatus(chIdx){
  const cfg=channel[chIdx];
  const p=PROBE_CATALOG[cfg.probe]||PROBE_CATALOG.n7020a_rail;
  if(cfg.probe==="single_ended_gnd_clip"&&cfg.node==="TP3_RSENSE"){
   return {ok:false,level:"danger",badge:"GND SHORT TRAP",msg:"CH"+(chIdx+1)+" Error: Single-ended ground clip across high-side R_sense shorts V_rail to earth ground! Switch to Keysight 1169B Differential probe."};
  }
  if(cfg.probe==="passive_10x_alligator"){
   return {ok:false,level:"warn",badge:"L_gnd ~145 nH Ring",msg:"CH"+(chIdx+1)+" Warning: 6-in alligator ground lead adds ~145 nH loop inductance, injecting fake ringing & 10:1 attenuation noise. Use N7020A / SMA-BNC / <5mm spring tip."};
  }
  if(cfg.node==="TP5_CHASSIS_GND"){
   return {ok:false,level:"warn",badge:"High-L Return",msg:"CH"+(chIdx+1)+" Warning: Probing distant chassis GND stud introduces inductive ground bounce. Probe Kelvin return right at TP2/TP3."};
  }
  const tp=TEST_POINTS.find(x=>x.id===cfg.node);
  if(tp&&tp.expected!=="none"&&tp.expected!==cfg.probe){
   return {ok:false,level:"warn",badge:"Suboptimal Probe",msg:"CH"+(chIdx+1)+": "+p.label+" on "+tp.label+" works better with "+PROBE_CATALOG[tp.expected].label+"."};
  }
  return {ok:true,level:"ok",badge:"Verified ("+p.bw+")",msg:"CH"+(chIdx+1)+" Verified: "+p.label+" on "+(tp?tp.label:cfg.node)+" ("+p.headroom+")."};
 }

 function renderProbeStudio(){
  const selCh=selected();
  const tbody=$("#kmProbeTable tbody");
  if(tbody){
   tbody.innerHTML=channel.map((ch,j)=>{
    const st=evaluateProbeStatus(j);
    const probeOpts=Object.entries(PROBE_CATALOG).map(([k,v])=>'<option value="'+k+'"'+(ch.probe===k?' selected':'')+'>'+E(v.label)+'</option>').join("");
    const nodeOpts=TEST_POINTS.map(tp=>'<option value="'+tp.id+'"'+(ch.node===tp.id?' selected':'')+'>'+E(tp.label)+'</option>').join("");
    const badgeCls=st.level==="ok"?"km-pbadge-ok":(st.level==="danger"?"km-pbadge-err":"km-pbadge-warn");
    return '<tr class="'+(j===selCh?'km-probe-row-active':'')+'" data-probe-row="'+j+'"><td style="color:'+colors[j]+';font-weight:800">CH'+(j+1)+'</td><td>'+E(["CLKOUT1","VDD_CORE","I_RSENSE","VDD_M"][j])+'</td><td><select id="kmProbe'+j+'" data-km-probe-sel="'+j+'">'+probeOpts+'</select></td><td><select id="kmNode'+j+'" data-km-node-sel="'+j+'">'+nodeOpts+'</select></td><td><span class="km-pbadge '+badgeCls+'">'+E(st.badge)+'</span></td></tr>';
   }).join("");
   tbody.querySelectorAll("[data-km-probe-sel]").forEach(el=>{
    el.onchange=()=>{const j=Number(el.dataset.kmProbeSel);channel[j].probe=el.value;if(el.value==="passive_10x_alligator")channel[j].atten=10;else channel[j].atten=1;if(j===selected())syncFields();renderProbeStudio();process()};
   });
   tbody.querySelectorAll("[data-km-node-sel]").forEach(el=>{
    el.onchange=()=>{const j=Number(el.dataset.kmNodeSel);channel[j].node=el.value;renderProbeStudio();process()};
   });
  }
  const svg=$("#kmBoardMap");
  if(svg){
   const pts=[
    {id:"TP1_CLKOUT1",x:78,y:68,tag:"TP1: CLKOUT1",sub:"50Ω SMA Port",ch:channel.findIndex(c=>c.node==="TP1_CLKOUT1")},
    {id:"TP2_VDDCORE",x:205,y:86,tag:"TP2: VDD_CORE",sub:"BGA Decap Kelvin",ch:channel.findIndex(c=>c.node==="TP2_VDDCORE")},
    {id:"TP3_RSENSE",x:335,y:86,tag:"TP3: R_sense 5mΩ",sub:"High-Side Kelvin",ch:channel.findIndex(c=>c.node==="TP3_RSENSE")},
    {id:"TP4_VDDM",x:450,y:86,tag:"TP4: VDD_M",sub:"Memory Rail Cap",ch:channel.findIndex(c=>c.node==="TP4_VDDM")},
    {id:"TP5_CHASSIS_GND",x:270,y:198,tag:"TP5: 6-in GND Stud",sub:"High-L Ring Trap",ch:channel.findIndex(c=>c.node==="TP5_CHASSIS_GND")}
   ];
   let s='<rect width="540" height="245" rx="8" fill="#08241d" stroke="#2c6f59"/>';
   s+='<rect x="18" y="16" width="504" height="213" rx="6" fill="#0d352a" stroke="#1e614d" stroke-dasharray="4 3"/>';
   s+='<text x="28" y="34" fill="#9fe8d0" font-size="11" font-weight="800" font-family="ui-monospace,monospace">DUT VALIDATION PCB · CLICK A TEST POINT TO ATTACH SELECTED CH'+(selCh+1)+'</text>';
   // PCB Traces
   s+='<path d="M120 90 H190 M220 90 H305 M365 90 H435" stroke="#d5a848" stroke-width="4" stroke-linecap="round"/>';
   s+='<rect x="165" y="122" width="110" height="44" rx="5" fill="#172434" stroke="#6d8fb3" stroke-width="1.6"/><text x="220" y="148" text-anchor="middle" fill="#dcecff" font-size="11" font-weight="800">SoC / DUT DIE</text>';
   s+='<rect x="315" y="76" width="40" height="26" rx="3" fill="#23374d" stroke="#f0b45a"/><text x="335" y="93" text-anchor="middle" fill="#ffd99a" font-size="9" font-weight="700">5mΩ</text>';
   pts.forEach(p=>{
    const active=channel[selCh].node===p.id;
    const col=p.ch>=0?colors[p.ch]:"#93aec4";
    s+='<g class="km-tp-btn" data-tp-id="'+p.id+'" style="cursor:pointer" tabindex="0" role="button" aria-label="Probe '+E(p.tag)+'">';
    s+='<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(active?17:13)+'" fill="'+(p.ch>=0?col:'#1a3e54')+'" fill-opacity="'+(p.ch>=0?0.24:0.7)+'" stroke="'+col+'" stroke-width="'+(active?3:1.8)+'"/>';
    s+='<circle cx="'+p.x+'" cy="'+p.y+'" r="5" fill="'+col+'"/>';
    s+='<text x="'+p.x+'" y="'+(p.y-22)+'" text-anchor="middle" fill="#edf8ff" font-size="10" font-weight="800">'+E(p.tag)+'</text>';
    s+='<text x="'+p.x+'" y="'+(p.y+27)+'" text-anchor="middle" fill="#9bc9bd" font-size="9">'+E(p.sub)+'</text>';
    if(p.ch>=0)s+='<text x="'+p.x+'" y="'+(p.y+4)+'" text-anchor="middle" fill="#06141d" font-size="9" font-weight="900">'+(p.ch+1)+'</text>';
    s+='</g>';
   });
   svg.innerHTML=s;
   svg.querySelectorAll("[data-tp-id]").forEach(el=>{
    el.onclick=()=>{
     const id=el.dataset.tpId;
     channel[selCh].node=id;
     const tp=TEST_POINTS.find(x=>x.id===id);
     if(tp&&tp.expected!=="none"&&PROBE_CATALOG[tp.expected]&&channel[selCh].probe!=="passive_10x_alligator"&&channel[selCh].probe!=="single_ended_gnd_clip"){
      // Keep user's explicit faulty probe if chosen, otherwise snap to right probe
      channel[selCh].probe=tp.expected;
     }
     renderProbeStudio();process();
    };
   });
  }
  const diags=channel.map((_,j)=>evaluateProbeStatus(j));
  const anyIssue=diags.find(d=>!d.ok);
  const diagEl=$("#kmProbeDiag");
  if(diagEl){
   if(anyIssue){
    diagEl.className="km-probe-diag "+(anyIssue.level==="danger"?"is-err":"is-warn");
    diagEl.textContent=diags.filter(d=>!d.ok).map(d=>d.msg).join(" | ");
   }else{
    diagEl.className="km-probe-diag is-ok";
    diagEl.textContent="✓ Documented 4-Channel Keysight Setup Verified: CH1 SMA-to-BNC (50Ω), CH2 N7020A Power-Rail (±24V offset, ±850mV window), CH3 1169B 12GHz Differential across R_sense, CH4 N7020A M-Rail.";
   }
  }
 }

 function syncFields(){
  const ch=channel[selected()];
  $("#kmCouple").value=ch.coupling;$("#kmBw").value=String(ch.cutoff);$("#kmGain").value=String(ch.gain);$("#kmOffset").value=String(ch.offset);
  if($("#kmDeskew"))$("#kmDeskew").value=String(ch.deskew||0);
  if($("#kmAtten"))$("#kmAtten").value=String(ch.atten||1);
 }
 function readFields(){
  const ch=channel[selected()];
  ch.coupling=$("#kmCouple").value;ch.cutoff=Number($("#kmBw").value);ch.gain=Number($("#kmGain").value);ch.offset=Number($("#kmOffset").value)||0;
  if($("#kmDeskew"))ch.deskew=Number($("#kmDeskew").value)||0;
  if($("#kmAtten"))ch.atten=Number($("#kmAtten").value)||1;
 }

 function applyProbePhysics(vals,t,j,span){
  const st=channel[j];
  const stRes=evaluateProbeStatus(j);
  const out=vals.slice();
  if(st.probe==="passive_10x_alligator"||st.node==="TP5_CHASSIS_GND"){
   // Inject ~145 nH alligator ground-loop LC resonance + 10x noise floor
   const fRing=12/Math.max(span,1);
   for(let i=1;i<out.length;i++){
    const dv=Math.abs(vals[i]-vals[Math.max(0,i-4)]);
    const boost=clamp(dv*3.2,0.02,0.22);
    out[i]+=boost*Math.sin((t[i]-t[0])*Math.PI*fRing)+Math.sin(i*1.9+j)*0.008;
   }
  }else if(st.probe==="single_ended_gnd_clip"&&st.node==="TP3_RSENSE"){
   for(let i=0;i<out.length;i++)out[i]=0.02*Math.sin(i*0.4); // shorted rail collapse
  }
  if(!stRes.ok&&st.atten===10){
   // Minor thermal/quantization penalty at high attenuation
   for(let i=0;i<out.length;i++)out[i]+=Math.sin(i*2.7+j)*0.004;
  }
  return out;
 }

 function process(){
  const def=inst.getDefinition(),T=def.T,unit=def.unit,conv=secs[unit]||1e-9,source=inst.getSignals();
  const n=Number($("#kmPoints").value),rep=Number($("#kmRecords").value),mode=$("#kmAcq").value;
  const windowFactor=Number($("#kmWindow").value)/100,span=T*windowFactor,left=(T-span)*.5;
  const dense=4096,t=Array.from({length:dense},(_,i)=>left+(i/(dense-1))*span);
  const times=Array.from({length:n},(_,i)=>left+span*(i+.5)/n);
  const raw=Array.from({length:4},(_,j)=>{
   const dk=channel[j].deskew||0;
   const vals=t.map(tt=>inst.getRaw(tt-dk,j));
   const probed=applyProbePhysics(vals,t,j,span);
   return filter(probed,span*conv/(dense-1),channel[j].cutoff);
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
  const maskMv=Number($("#kmMask")?.value||0);
  let maskHits=0;
  if(maskMv>0){
   const ch2=processed[1].raw,m2=stats(ch2).mean,tol=maskMv*1e-3;
   maskHits=ch2.filter(v=>Math.abs(v-m2)>tol).length;
  }
  $("#kmStatus").textContent="Processed "+n+" display samples/channel · Δt = "+clean(dt)+" "+unit+" · effective "+(eff/1e6).toFixed(3)+" MSa/s. Trigger "+(hit===null?"NOT FOUND":("crossing at "+hit.toFixed(3)+" "+unit))+" · "+mode.toUpperCase()+(maskMv>0?" · Mask ±"+maskMv+"mV hits: "+maskHits:"")+" (software model)";
  visible=true;draw();renderProbeStudio();
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
  let result="",eqTex="";
  if(ma==="power"){
   result="P(t)=CH2 × I(t) · peak "+clean(Math.max(...power))+" W; Pavg "+clean(stats(power).mean)+" W";
   eqTex="P(t) = V_CH2(t) × (V_CH3_diff(t) / R_sense)";
  }
  if(ma==="delta"){
   const diff=c.processed[1].raw.map((v,i)=>v-c.processed[3].raw[i]);
   result="ΔV(t) = VDD_CORE − VDD_M · peak |ΔV| "+clean(Math.max(...diff.map(Math.abs)))+" V";
   eqTex="Delta_V(t) = V_CORE(t) - V_M(t)";
  }
  if(ma==="didt"){
   const didt=cur.slice(1).map((v,i)=>(v-cur[i])/dt);
   result="dI/dt peak |slope| "+clean(Math.max(...didt.map(Math.abs))/1e9)+" A/ns · V_L = L × dI/dt";
   eqTex="V_L = L_PDN · dI / dt";
  }
  if(ma==="energy"){
   let E=0;for(let i=1;i<n;i++)E+=(power[i-1]+power[i])*.5*dt;
   result="E = ∫ P(t) dt ≈ "+clean(E*1e6)+" μJ (trapezoidal integration)";
   eqTex="E = ∫ P(t) · dt";
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
   eqTex="f_knee ≈ 0.5 / t_rise";
  }
  $("#kmMathResult").textContent=result;
  const fHost=$("#kmMathFormula");
  if(fHost){
   fHost.innerHTML=window.studyMath?window.studyMath(eqTex,true):E(eqTex);
  }
 }

 function draw(){
  const c=capture;if(!visible||!c){$("#kmPlot").innerHTML="";$("#kmReadings").innerHTML="";$("#kmMathResult").textContent="";if($("#kmMathFormula"))$("#kmMathFormula").innerHTML="";return}
  const {times,processed,n,unit}=c,first=times[0],last=times.at(-1),x=t=>128+925*(t-first)/(last-first);
  const at=alpha=>first+alpha*(last-first);
  const aa=at(a),bb=at(b);
  const maskMv=Number($("#kmMask")?.value||0);
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
   if(j===1&&maskMv>0){
    const yHi=clamp(Y(st.mean+maskMv*1e-3),top+4,bot-4),yLo=clamp(Y(st.mean-maskMv*1e-3),top+4,bot-4);
    svg+='<rect x="128" y="'+(top+2)+'" width="925" height="'+Math.max(0,yHi-(top+2))+'" fill="#f43f5e" fill-opacity=".14"/><rect x="128" y="'+yLo+'" width="925" height="'+Math.max(0,(bot-2)-yLo)+'" fill="#f43f5e" fill-opacity=".14"/>';
   }
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
  const dtCursor=(bb-aa)*c.conv;
  const freqStr=Math.abs(dtCursor)>1e-12?(" · 1/Δt = "+(1/Math.abs(dtCursor)/1e6).toFixed(2)+" MHz"):"";
  $("#kmDelta").textContent="A "+aa.toFixed(3)+" · B "+bb.toFixed(3)+" · Δt "+(bb-aa).toFixed(3)+" "+unit+freqStr;
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
  channel.forEach((c,j)=>{c.probe=DEFAULT_HOOKUP[j].probe;c.node=DEFAULT_HOOKUP[j].node;c.deskew=0;c.atten=1;c.coupling="DC";c.cutoff=0;c.gain=1;c.offset=0;});
  syncFields();renderProbeStudio();
  $("#kmTrigCh").value="1";$("#kmLevel").value=".75";$("#kmCurrent").value="amp";
  $("#kmStatus").textContent="CPU2 documented 4-CH Keysight probe layout loaded (SMA-BNC, N7020A, 1169B, N7020A).";
  process();
 };
 if($("#kmCalBtn")){
  $("#kmCalBtn").onclick=()=>{
   const j=selected(),ch=channel[j];
   const p=PROBE_CATALOG[ch.probe]||PROBE_CATALOG.n7020a_rail;
   $("#kmStatus").textContent="Cal/Check CH"+(j+1)+": "+p.label+" · Headroom "+p.headroom+" · Z_in "+p.z+" · Deskew="+(ch.deskew||0)+" · Offset="+(ch.offset||0)+" V (simulated calibration check).";
  };
 }
 $("#kmCh").onchange=()=>{syncFields();renderProbeStudio()};
 for(const key of ["kmCouple","kmBw","kmGain","kmOffset","kmDeskew","kmAtten"]){
  if($("#"+key))$("#"+key).onchange=()=>{readFields();process()};
 }
 for(const key of ["kmAcq","kmRecords","kmPoints","kmWindow","kmTrigCh","kmTrigType","kmSlope","kmLevel","kmWidth","kmThreshold","kmRs","kmMath","kmCurrent","kmMask"]){
  if($("#"+key))$("#"+key).onchange=process;
 }
 $("#kmRun").onclick=process;
 $("#kmSingle").onclick=()=>{process();if(capture?.hit===null)$("#kmStatus").textContent="WAIT: no matching trigger. Adjust source/level/type or switch to normal mode."};
 $("#kmAuto").onclick=()=>{channel.forEach((c,j)=>{c.coupling="DC";c.cutoff=0;c.gain=1;c.offset=0;c.deskew=0;c.probe=DEFAULT_HOOKUP[j].probe;c.node=DEFAULT_HOOKUP[j].node});syncFields();$("#kmWindow").value="100";process()};
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
   for(const k of selectors)if(Object.hasOwn(obj.form,k)&&$("#"+k))$("#"+k).value=String(obj.form[k]);
   if(Array.isArray(obj.channels)&&obj.channels.length===4)obj.channels.forEach((v,i)=>{channel[i]={coupling:v.coupling==="AC"||v.coupling==="GND"?v.coupling:"DC",cutoff:clamp(Number(v.cutoff)||0,0,2e9),gain:clamp(Number(v.gain)||1,.5,4),offset:clamp(Number(v.offset)||0,-500,500),deskew:Number(v.deskew)||0,atten:Number(v.atten)||1,probe:v.probe||DEFAULT_HOOKUP[i].probe,node:v.node||DEFAULT_HOOKUP[i].node}});
   syncFields();process();$("#kmStatus").textContent+=" · Local setup restored.";
  }catch(err){$("#kmStatus").textContent="Unable to restore setup: "+err.message}
 };
 root.addEventListener("change",e=>{
  if(e.target?.id==="ixPreset")process();
 });
 root.__keysightManualBench={process,channel,trigger,timing,stats,getCapture:()=>capture};
 syncFields();renderProbeStudio();process();
}
window.renderKeysightManualBench=markup;
window.mountKeysightManualBench=mount;
window.keysightBenchMath={stats,cross,timing,filter,reduceSamples,trigger};
})();
