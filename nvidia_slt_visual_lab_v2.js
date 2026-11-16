"use strict";
/* Question-driven SLT visual lab. Synthetic teaching views only: never
   represents measured NVIDIA traces, physical pinout, live commands or limits. */
(function(){
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>String(Number(Number(n).toPrecision(7)));
const storeKey="slt-nvidia-visual-evidence-v2";
let data={};try{data=JSON.parse(localStorage.getItem(storeKey)||"{}")||{}}catch{}
const memo={}, stages=["Signal / model","Fault tree","A/B/A test","Evidence worksheet"];
const trunc=(s,n=48)=>String(s||"").length>n?String(s).slice(0,n-1)+"…":String(s||"");
const title=(s)=>'<strong>'+esc(s)+'</strong>';
function save(){try{localStorage.setItem(storeKey,JSON.stringify(data))}catch{}}
function skill(q,t,offset=0){return t.skills[((q.difficulty-1)%10+offset)%10]}
function model(q,t){let primary=skill(q,t),secondary=skill(q,t,3),third=skill(q,t,7);return{primary,secondary,third,phase:Math.floor((q.difficulty-1)/10),focus:q.objective,expected:q.expected,unit:q.unit,formula:q.formula,operation:q.operation};}
const box=(x,y,w,h,fill="#e8f1fb")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="11" fill="'+fill+'" stroke="#9bb6d3" stroke-width="1.7"/>';
const txt=(x,y,label,size=16,color="#1a4169",weight=600,anchor="start")=>'<text x="'+x+'" y="'+y+'" font-family="Arial,sans-serif" font-size="'+size+'" font-weight="'+weight+'" text-anchor="'+anchor+'" fill="'+color+'">'+esc(label)+'</text>';
const wire=(x1,y1,x2,y2,c="#50779c")=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="'+c+'" stroke-width="3" fill="none" stroke-linecap="round"/>';
const dot=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="5" fill="#168ba0"/>';
const card=(x,y,w,head,small,color)=>box(x,y,w,82,color)+txt(x+12,y+27,trunc(head,27),15)+txt(x+12,y+49,trunc(small,32),12,"#526a7c",450);
const caption=(q,content,legend)=>'<svg class="nvs-scenario-svg" viewBox="0 0 920 306" role="img" aria-label="'+esc(legend)+'" xmlns="http://www.w3.org/2000/svg">'+box(1,1,918,304,"#fcfeff")+content+txt(18,286,"Teaching model · "+q.id+" · no real DUT telemetry, approved limits or physical pinout",12,"#57738b",400)+'</svg>';
function stagesSvg(q,t,m){
 const focus=trunc(m.primary.name,31),s2=trunc(m.secondary.name,31),s3=trunc(m.third.name,31);
 let g=txt(18,30,"BOOT, CLOCK, RESET & FIRST FAILING CHECKPOINT",17,"#245579",750);
 const items=[["Power valid","rail input"],["Clock ready","PLL / ratio"],["Reset release","safe order"],["Firmware boot","image / hash"],["DRAM init","training logs"]];
 for(let i=0;i<items.length;i++){
  let x=17+i*184;g+=card(x,69,170,items[i][0],items[i][1],i===(q.difficulty-1)%5?"#d6f4ed":"#eaf0fc");
  if(i<4)g+=wire(x+171,110,x+183,110);
 }
 g+=txt(24,199,"Active question: "+focus,16,"#153f66",700)+txt(24,228,"Independent: "+s2+"  •  "+s3,13,"#5a7387",500);
 return caption(q,g,"SoC power-clock-reset and boot sequence highlighting "+m.primary.name);
}
function ddrSvg(q,t,m){
 let g=txt(18,31,"DRAM TRAINING / MEMORY MARGIN MAP",17,"#245579",750);
 const math=q.operation==="trainingwindow",match=q.math?.prompt?.match(/tap indices (\d+) through (\d+)/),low=math&&match?Number(match[1]):12,high=math&&match?Number(match[2]):40;
 g+=txt(24,60,"Selected focus: "+trunc(m.primary.name,40),14);
 const total=10;
 for(let lane=0;lane<3;lane++){
  g+=txt(23,105+lane*49,"Lane "+lane,13);
  for(let col=0;col<total;col++){
   let x=120+col*75,y=83+lane*49,inside=col>=2+(lane%2)&&col<=7-(lane%2);
   g+=box(x,y,62,30,inside?"#a9e4d2":"#f5cfba");
   g+=txt(x+31,y+20,inside?"PASS":"FAIL",11,inside?"#15664c":"#9c4734",700,"middle");
  }
 }
 g+=txt(24,252,match?"Question tap window: "+low+" through "+high+" inclusive; "+(high-low+1)+" passing taps":"Example pass window is hypothetical; find actual tap window in the target log.",13);
 return caption(q,g,"DRAM per-lane synthetic training map with selected "+m.primary.name);
}
function pcieSvg(q,t,m){
 let g=txt(18,31,"PCIe LINK TRAINING & ERROR ISOLATION",17,"#245579",750);
 const names=["Detect","Polling","Configuration","L0","Recovery"],des=["Physical presence","Exchange training","Width / speed","Transfer","Re-train / retry"];
 for(let i=0;i<5;i++){let x=18+i*184;g+=card(x,70,166,names[i],des[i],i===3?"#b8eedf":"#ebf2ff");if(i<4)g+=wire(x+167,110,x+181,110)}
 g+=txt(22,196,"Current focus: "+trunc(m.primary.name,44),16)+txt(22,225,"Compare: "+trunc(m.secondary.observe,102),13,"#416882",450);
 return caption(q,g,"PCIe state flow and independent troubleshooting check for "+m.primary.name);
}
function gpuSvg(q,t,m){
 let g=txt(18,31,"GPU VALIDATION · CORRELATE INDEPENDENT TELEMETRY",17,"#245579",750);
 const cols=[["Power / clocks","policy vs performance"],["Memory / ECC","new vs lifetime count"],["PCIe / Xid","event with context"],["Temperature","steady vs transient"]];
 for(let i=0;i<4;i++){const x=19+i*225;g+=card(x,70,208,cols[i][0],cols[i][1],i===((q.difficulty-1)%4)?"#c4f1e6":"#e7edfa")}
 const line=(idx,color)=>{let d="";for(let k=0;k<34;k++){let x=22+k*26,y=205+idx*6+Math.sin(k*.52+idx)*8-(k>18&&k<23?(idx+1)*3:0);d+=(k?"L":"M")+x.toFixed(1)+","+y.toFixed(1)+" ";}return '<path d="'+d+'" stroke="'+color+'" stroke-width="2" fill="none"/>'};
 g+=line(0,"#2c62a2")+line(3,"#10a089")+line(6,"#c08c3c");
 g+=txt(22,258,"Synthetic aligned trends only; Xid and DCGM signals are evidence, not automatic root causes.",12,"#486781",450);
 return caption(q,g,"GPU multiple telemetry channels illustrating "+m.primary.name);
}
function ateSvg(q,t,m){
 let g=txt(18,31,"ATE → DFT → SLT · COMPLEMENTARY FAULT COVERAGE",17,"#245579",750);
 const items=[["Structural ATE","pin / parametric"],["Scan / MBIST","internal observability"],["Board bring-up","fixture + rails"],["System SLT","firmware + workload"]];
 for(let i=0;i<items.length;i++){let x=18+i*227;g+=card(x,76,208,items[i][0],items[i][1],i===((q.difficulty-1)%4)?"#d5f2df":"#e8f2fe");if(i<3)g+=wire(x+210,117,x+225,117)}
 g+=txt(24,211,"Question focus: "+trunc(m.primary.name,61),17)+txt(24,244,"Passing an earlier stage does not prove integration will pass the later stage.",13,"#516d83",500);
 return caption(q,g,"ATE and SLT test coverage checkpoints emphasizing "+m.primary.name);
}
function pvtSvg(q,t,m){
 let g=txt(18,31,"PVT SHMOO · CONTROL ONE VARIABLE AT A TIME",17,"#245579",750);
 for(let row=0;row<5;row++)for(let col=0;col<9;col++){
  const pass=col+row<=8&&col>=1;
  g+=box(149+col*63,57+row*36,55,29,pass?"#b3e7d6":"#f0d0be");
 }
 g+=txt(16,82,"Hot",13)+txt(16,229,"Cold",13)+txt(156,253,"Voltage / frequency operating sweep → (illustrative bins)",13);
 g+=txt(751,88,"Valid",13)+box(813,77,35,18,"#b3e7d6")+txt(751,114,"Fail",13)+box(813,102,35,18,"#f0d0be");
 return caption(q,g,"Synthetic voltage-frequency-temperature margin map for "+m.primary.name);
}
function scopeSvg(q,t,m){
 let g=txt(18,31,"SYNTHETIC FOUR-CHANNEL OSCILLOSCOPE VIEW",17,"#245579",750);
 for(let i=0;i<4;i++){
  const top=60+i*46;g+=wire(70,top,860,top,"#d7e1ed");
  let d="";for(let k=0;k<85;k++){const x=75+k*9.25,y=top-8+(k<25?0:k<30?-(k-25)*2:k<40?-12+Math.sin((k-30)*.9)*8*Math.exp(-(k-30)/7):0)+i*2*Math.sin(k*.16);d+=(k?"L":"M")+x.toFixed(1)+","+y.toFixed(1)+" ";}
  g+='<path d="'+d+'" fill="none" stroke="'+["#e5a238","#25ab81","#49a0d3","#9f70c8"][i]+'" stroke-width="2.3"/>';
  g+=txt(17,top+3,"CH"+(i+1),12);
 }
 g+=txt(75,257,"Display is an original model, not a Keysight capture. Confirm scale, coupling, ground and timing.",12,"#4f6882",450);
 return caption(q,g,"Educational four-channel waveform for "+m.primary.name);
}
function electricalSvg(q,t,m){
 let g=txt(18,31,"POWER PATH · SELECT THE REAL MEASUREMENT NODE",17,"#245579",750);
 g+=box(27,86,172,96,"#e7efff")+txt(113,119,"DC supply",17,"#1c4574",700,"middle")+txt(113,143,"V & current limit",13,"#526f83",500,"middle");
 g+=wire(199,134,283,134);g+=box(283,86,184,96,"#dff0fa")+txt(375,117,"Regulator / PDN",16,"#214b73",700,"middle")+txt(375,141,"sense / return",12,"#52718a",450,"middle");
 g+=wire(467,134,557,134);g+=box(557,86,180,96,"#d9f3e9")+txt(647,119,"SoC load",17,"#1c654e",700,"middle")+txt(647,145,"load step",13,"#417761",450,"middle");
 g+=wire(737,134,861,134);g+=txt(20,213,"Probe near the load; compare to regulator output. Never confuse displayed data with actual scope.",13,"#416a86",450);
 g+=txt(20,244,"Focus: "+trunc(m.primary.name,75),15);
 return caption(q,g,"SoC power distribution and measurement path for "+m.primary.name);
}
function linuxPanel(q,t,m){
 return '<div class="nvs-terminal" role="img" aria-label="Synthetic Linux diagnostic log for '+esc(m.primary.name)+'"><div class="nvs-terminal-head">READ-ONLY LOG INSPECTOR · SYNTHETIC TRAINING DATA</div>'+
 '<pre>2026-TRAIN 10:02:01 INFO  device_id=TRAIN-001 test='+esc(q.id)+'\n'+
 '2026-TRAIN 10:02:02 CHECK focus="'+esc(m.primary.name)+'"\n'+
 '2026-TRAIN 10:02:03 WARN  verify: '+esc(trunc(m.primary.risk,80))+'\n'+
 '2026-TRAIN 10:02:04 NOTE  raw evidence required before DUT disposition\n'+
 'grep -RniE \u0027error|fail|timeout\u0027 logs/    # examine exit status</pre>'+
 '<p>Analyze <strong>'+esc(m.primary.observe)+'</strong>. A warning or a keyword alone is not a DUT FAIL; correlate run ID and source. A missing or unreadable log makes the test INVALID.</p></div>';
}
function pythonPanel(q,t,m){
 return '<div class="nvs-terminal" role="img" aria-label="Python test logic for '+esc(m.primary.name)+'"><div class="nvs-terminal-head">TEST SCRIPT DECISION · SOURCE-LEVEL REASONING</div>'+
 '<pre>'+esc(q.code||"raw = instrument_query()  # approved, configured instrument\nvalue = parse_and_validate(raw)  # reject NaN/timeouts\nif not valid_station_and_data:\n    result = 'INVALID'\nelif violates_approved_limit:\n    result = 'FAIL'\nelse:\n    result = 'PASS'")+'</pre>'+
 '<p>Focus on <strong>'+esc(m.primary.name)+'</strong>: '+esc(m.primary.risk)+'. Displayed code is teaching text and is not run on a lab station.</p></div>';
}
function qualitySvg(q,t,m){
 let g=txt(18,31,"FIRST-PASS YIELD · DISTINGUISH RETESTS AND INVALIDS",17,"#245579",750);
 const labels=["First attempt","Confirmed fail","Retest (separate)","Invalid station"],lengths=[670,245,340,125];
 for(let i=0;i<4;i++){
  const y=68+i*46;g+=txt(18,y+17,labels[i],14)+box(190,y,Math.min(650,lengths[i]),27,["#b9e8d7","#f5d2c0","#d8e6fd","#f6ebc9"][i]);
 }
 g+=txt(20,274,"Illustrative bar lengths—not production counts. Q focus: "+trunc(m.primary.name,56),12,"#536c7d",450);
 return caption(q,g,"Yield and retest segmentation for "+m.primary.name);
}
function interviewSvg(q,t,m){
 let g=txt(18,31,"CROSS-FUNCTIONAL FAILURE TRIAGE · THREE DISTINCT SIGNALS",17,"#245579",750);
 const arr=[m.primary,m.secondary,m.third];
 for(let i=0;i<3;i++){let x=20+i*300;g+=box(x,65,285,136,["#e7eefc","#e5f5f1","#fff1db"][i])+
  txt(x+13,91,["SYMPTOM A","SYMP B / INDEPENDENT","SYMPTOM C / INDEPENDENT"][i],12,"#36618a",750)+
  txt(x+13,117,trunc(arr[i].name,29),16)+
  txt(x+13,147,trunc(arr[i].risk,39),12,"#536c7b",450)+
  txt(x+13,172,trunc(arr[i].observe,39),12,"#536c7b",450);
 }
 g+=txt(22,240,"Keep hypotheses distinct until correlated by time, independent setup and controlled swaps.",14,"#305c7c",500);
 return caption(q,g,"Three distinct evidence chains from this integrated SLT problem");
}
const renderers={electrical:electricalSvg,socboot:stagesSvg,dram:ddrSvg,pcie:pcieSvg,gpu:gpuSvg,ate:ateSvg,pvt:pvtSvg,instruments:scopeSvg,linux:linuxPanel,python:pythonPanel,quality:qualitySvg,interview:interviewSvg};
function hypothesis(q,t,m){
 const cats=[
  {name:"DUT / silicon",expect:"If it is hardware-specific, the reproducible error should follow the same DUT across an independently verified good fixture and compatible firmware.",disprove:"The fault follows the fixture or disappears without changing the DUT when another known-good setup is used.",check:m.primary.observe},
  {name:"Fixture / measurement",expect:"If the test rack is at fault, the symptom follows a cable, socket, instrument reference or station when using a known-good unit.",disprove:"The DUT fails in an independent calibrated setup while reference units consistently pass the suspect fixture.",check:m.secondary.observe},
  {name:"Firmware / parser",expect:"If software is at fault, the failure or incorrect PASS/FAIL report tracks a controlled version or parsing change, not the same physical DUT.",disprove:"Raw independent electrical evidence stays out of spec with compatible verified software and valid station.",check:m.third.observe}
 ];
 const selected=memo[q.id]?.hyp??-1;
 return '<div class="nvs-hypotheses"><h4>Choose a hypothesis to see how you would disprove it</h4><p class="nvs-lab-lead">Reported concern: <strong>'+esc(m.primary.risk)+'</strong>. These are alternatives, not established root causes.</p>'+
 '<div class="nvs-choices">'+cats.map((h,i)=>'<button type="button" data-nvs-hyp="'+i+'" aria-pressed="'+(selected===i)+'">'+esc(h.name)+'</button>').join("")+'</div>'+
 (selected<0?'<p>Start by choosing one possible cause, then inspect its predicted outcome and falsification test.</p>':
 '<section class="nvs-causal-answer"><strong>'+esc(cats[selected].name)+'</strong><p><b>Prediction:</b> '+esc(cats[selected].expect)+'</p><p><b>Disprove it if:</b> '+esc(cats[selected].disprove)+'</p><p><b>Question-specific check:</b> '+esc(cats[selected].check)+'</p></section>')+
 '<div class="nvs-lab-guideline"><b>Key distinction:</b> '+esc(m.primary.meaning)+' Common trap: '+esc(m.primary.risk)+'</div></div>';
}
function aba(q,t,m){
 const step=(memo[q.id]?.aba??0);
 const cases=[
 {head:"A — capture original",detail:"Hold DUT, firmware, station, environment and workload unchanged. Capture raw first-failing '"+m.primary.name+"' while recording the full test manifest.",test:m.primary.observe},
 {head:"B — change ONE factor",detail:"Use the approved reference fixture, cable or software control, changing only one variable. Independently observe '"+m.secondary.name+"' before concluding where the fault follows.",test:m.secondary.observe},
 {head:"A — restore original",detail:"Restore the initial configuration and check whether the original fault reproducibly returns. Correlate '"+m.third.name+"' without changing two factors at once.",test:m.third.observe}
 ];
 return '<div class="nvs-aba"><h4>Controlled A/B/A experiment</h4><p>Use this to discriminate a DUT failure from a station or software fault. Every observation below is a <em>proposed check</em>, not a performed experiment.</p>'+
 '<div class="nvs-choices">'+cases.map((c,i)=>'<button type="button" data-nvs-aba="'+i+'" aria-pressed="'+(step===i)+'">'+esc(c.head)+'</button>').join("")+'</div>'+
 '<div class="nvs-causal-answer"><strong>'+esc(cases[step].head)+'</strong><p>'+esc(cases[step].detail)+'</p><p><b>Evidence to collect:</b> '+esc(cases[step].test)+'</p></div>'+
 '<p class="nvs-lab-guideline">PASS only with valid required measurements; FAIL for confirmed in-scope limits; INVALID for broken/missing evidence; BLOCKED for unresolved coverage. Do not apply an invented production threshold.</p></div>';
}
function checklist(q,t,m){
 const base=[
 "Identify exact DUT serial / stepping, host/fixture and approved firmware image.",
 "Confirm actual requirement and allowed power, temperature, timing or software configuration.",
 "Capture question-specific primary evidence: "+m.primary.observe+".",
 "Independently compare: "+m.secondary.observe+".",
 "Reproduce A/B/A and cross-check "+m.third.name+": "+m.third.observe+".",
 "Record probe or parser validity, raw first-fail logs and PASS / FAIL / INVALID / BLOCKED rationale."
 ];
 const saved=data[q.id]||{},checks=saved.checks||[];
 const n=base.filter((x,i)=>!!checks[i]).length;
 return '<section class="nvs-evidence-worksheet"><h4>Question-specific evidence worksheet</h4>'+
 '<p><strong>'+n+' / 6</strong> planning checkpoints completed. These checkboxes only track your preparation; they do not assert actual lab testing.</p>'+
 base.map((x,i)=>'<label class="nvs-lab-check"><input type="checkbox" data-nvs-check="'+i+'" '+(checks[i]?'checked':'')+'><span>'+esc(x)+'</span></label>').join("")+
 '<label for="nvsLabNote">Write the first discriminating test and what result would disprove your hypothesis</label>'+
 '<textarea id="nvsLabNote" rows="4" placeholder="I would measure... I expect... If not, the hypothesis is weakened...">'+esc(saved.note||"")+'</textarea>'+
 '<div class="nvs-lab-actions"><button type="button" id="nvsCopyPlan">Copy my evidence plan</button><span class="nvs-copy-status" role="status" aria-live="polite"></span></div></section>';
}
function render(q,t,legacyExact=""){
 const m=model(q,t),view=memo[q.id]?.view??0,signal=renderers[t.id];
 if(!signal)throw Error("Unsupported SLT visualization topic: "+t.id);
 const visualize=legacyExact&&q.operation==="parallel"?legacyExact:signal(q,t,m);
 const numeric=q.questionType==="number"?
 '<div class="nvs-lab-result"><span>Predicted result from the CURRENT question values</span><strong>'+esc(fmt(q.expected)+" "+q.unit)+'</strong><code>'+esc(q.formula)+'</code><p>'+esc(q.math?.why||"")+" "+esc(q.math?.check||"")+'</p></div>':"";
 const contents=[ '<div class="nvs-scenario-model">'+visualize+numeric+
 '<dl class="nvs-specific-observations"><div><dt>Question focus</dt><dd>'+esc(m.primary.name)+': '+esc(m.primary.meaning)+'</dd></div>'+
 '<div><dt>What to inspect</dt><dd>'+esc(m.primary.observe)+'</dd></div><div><dt>Misleading result to rule out</dt><dd>'+esc(m.primary.risk)+'</dd></div>'+
 (m.phase>=3?'<div><dt>Second and third independent symptoms</dt><dd>'+esc(m.secondary.name)+' → '+esc(m.secondary.risk)+'; '+esc(m.third.name)+' → '+esc(m.third.risk)+'</dd></div>':"")+'</dl></div>',
 hypothesis(q,t,m),aba(q,t,m),checklist(q,t,m)];
 return '<section class="nvs-scenario-lab" data-nvs-lab="'+esc(q.id)+'" data-active-view="'+view+'"><div class="nvs-lab-heading"><div><small>QUESTION-SPECIFIC · ORIGINAL TEACHING LAB</small><h3>'+esc(m.primary.name)+' — investigate the actual scenario</h3><p>'+esc(q.objective)+'</p></div><span>'+esc(t.title)+'</span></div>'+
 '<div class="nvs-lab-tabs" role="group" aria-label="Scenario-specific lab tools">'+stages.map((s,i)=>'<button type="button" data-nvs-view="'+i+'" aria-pressed="'+(view===i)+'">'+esc((i+1)+". "+s)+'</button>').join("")+'</div>'+
 '<div class="nvs-lab-content">'+contents[view]+'</div>'+
 '<p class="nvs-lab-disclaimer">These are educational visual models or fictional sample logs, not verified DUT traces, physical wiring, live Python execution, manufacturer acceptance limits, or evidence that a test was performed.</p></section>';
}
function copyPlan(q,t,m){
 const s=data[q.id]||{},mark=s.checks||[];
 const lines=["SLT study scenario: "+q.id, "Topic: "+t.title, "Question: "+q.question,
 "Primary concept: "+m.primary.name,"Expected observation/test: "+m.primary.observe,
 "Alternative fault to rule out: "+m.primary.risk,
 "Independent check: "+m.secondary.observe,
 "Third subsystem: "+m.third.name+" / "+m.third.observe,
 "Planning checklist (checked only means I reviewed a step):"];
 const parts=["Record board/revision/test configuration","Get actual approved limits","Primary observation","Independent confirmation","A/B/A and third check","Valid station, trace and disposition"];
 for(let i=0;i<6;i++)lines.push((mark[i]?"[x] ":"[ ] ")+parts[i]);
 lines.push("Proposed test and falsifying result: "+(s.note||"(not yet written)"));
 lines.push("Teaching exercise ONLY — not official NVIDIA specifications, real observations or hardware approval.");
 return lines.join("\n");
}
function mount(node,q,t,exact){
 if(!node)return;
 const redraw=()=>{node.innerHTML=render(q,t,exact);mount(node,q,t,exact);};
 node.querySelectorAll("[data-nvs-view]").forEach(b=>b.onclick=()=>{const s=memo[q.id]||(memo[q.id]={});s.view=Number(b.dataset.nvsView);redraw()});
 node.querySelectorAll("[data-nvs-hyp]").forEach(b=>b.onclick=()=>{const s=memo[q.id]||(memo[q.id]={});s.hyp=Number(b.dataset.nvsHyp);redraw()});
 node.querySelectorAll("[data-nvs-aba]").forEach(b=>b.onclick=()=>{const s=memo[q.id]||(memo[q.id]={});s.aba=Number(b.dataset.nvsAba);redraw()});
 node.querySelectorAll("[data-nvs-check]").forEach(b=>b.onchange=()=>{const s=data[q.id]||(data[q.id]={checks:[],note:""});s.checks[Number(b.dataset.nvsCheck)]=b.checked;save();redraw()});
 const note=node.querySelector("#nvsLabNote");
 if(note)note.oninput=()=>{const s=data[q.id]||(data[q.id]={checks:[],note:""});s.note=note.value;save()};
 const copy=node.querySelector("#nvsCopyPlan");
 if(copy)copy.onclick=async()=>{
  const dest=node.querySelector(".nvs-copy-status"),value=copyPlan(q,t,model(q,t));
  try{if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error("Clipboard unavailable");
   await navigator.clipboard.writeText(value);dest.textContent="Copied your study plan.";
  }catch{dest.textContent="Clipboard unavailable here; your worksheet is saved locally."}
 };
}
window.NVIDIA_SLT_VISUAL_LAB={render,mount,model,renderers,storeKey,copyPlan};
})();