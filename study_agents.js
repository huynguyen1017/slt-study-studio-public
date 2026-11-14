"use strict";
/* Local learning coach, optional sourced research, and network stability monitor.
 * Runs in-browser; no secret keys or claims of a hosted LLM. */
(function(){
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const BASE=Array.isArray(window.STUDY_CARDS)?window.STUDY_CARDS:(typeof STUDY_CARDS!=="undefined"?STUDY_CARDS:[]);
const topics=["FinFET CMOS","Setup hold static timing analysis","Transmission line reflections","MOSFET gate capacitance","Clock tree synthesis","Power integrity decoupling","DRAM tRCD tRP","ASIC Verilog RTL","PCIe LTSSM","Digital oscilloscope probing"];
const storage="slt-explore-v2";
let state={ratings:{},custom:[],index:0,turned:false,shuffle:false,autoplay:false,rotate:false,topic:0,lastResearch:null,schedule:{}};
try{let a=JSON.parse(localStorage.getItem(storage)||"{}");if(a&&typeof a==="object")state={...state,...a};if(!Array.isArray(state.custom))state.custom=[]}catch{}
let current=[],position=0,autoTimer=null,rotateTimer=null,abort=null;
function persist(){try{localStorage.setItem(storage,JSON.stringify(state))}catch{}}
function coach(q,answer,miss=false){
 const text=(String(q)+" "+String(answer||"")).toLowerCase();
 let hint,lab;
 if(/signal integrity|reflection|impedance|transmission/.test(text)){hint="Start with the signal path: source → transmission line → termination. Ask whether the receiver sees a reflection, and compare the load impedance to the line.";lab="Signal Integrity → Deep Dive → compare the seven ngspice cases."}
 else if(/power|rail|voltage|resistor|current/.test(text)){hint="Trace current from source through every element to the ground return. Before predicting damage, calculate I, the component's voltage drop and P = I²R.";lab="Board Component Lab → try R33 bypass and the fault simulator."}
 else if(/clock|setup|hold|reset|timing/.test(text)){hint="Find the sampling clock edge, identify the launching event and ask which signal must be stable before/after the edge.";lab="Waveform Lab → change reset release and verify each required signal."}
 else if(/dram|memory|training/.test(text)){hint="Separate raw DRAM evidence from reporting logic, firmware versions and training/calibration settings. Look for a reproducible first failure.";lab="Guided Labs → conflicting DRAM reports."}
 else if(/python|log|linux/.test(text)){hint="State input and expected output. Handle errors and parse raw evidence first; a clean summary cannot replace source logs.";lab="Guided Labs → log-parser reliability."}
 else {hint="Explain the input, relevant physical law or logic rule, expected observation, and what would falsify your answer.";lab="Guided Labs → choose a matching debugging scenario."}
 return {hint,lab,follow:miss?"Before retrying, name one measurable difference between the wrong and correct explanation.":"Try teaching the answer aloud in one minute, then identify the relevant observable evidence."};
}
const mount=document.createElement("section");mount.id="discoveryView";mount.hidden=true;mount.innerHTML=
 '<div class="agent-title"><span class="eyebrow">THREE PRIVACY-FIRST LEARNING ASSISTANTS</span><h2>Learning Discovery Studio</h2><p>Practice the existing public cards, create your own, and optionally research current sources. Offline coaching uses transparent local rules—not a cloud language model.</p></div>'+
 '<div class="agent-stats"><div><small>Available study cards</small><strong id="agTotal"></strong></div><div><small>Saved review judgments</small><strong id="agReviewed">0</strong></div><div><small>Network / offline status</small><strong id="agHealth">Checking…</strong></div></div>'+
 '<div class="agent-subnav"><button id="agDeckTab" class="active" type="button">3D Flashcard Deck</button><button id="agResearchTab" type="button">Live Engineering Research</button><button id="agNotesTab" type="button">Create Study Cards</button></div>'+
 '<div id="agDeck"><div class="agent-actions"><label>Study set<select id="agFilter"><option value="all">All published + personal</option><option value="custom">My saved cards</option><option value="missed">Needs review</option><option value="due">Scheduled review due</option></select></label><button type="button" id="agShuffle">Shuffle</button><button type="button" id="agAuto">▶ Autoplay 15s: off</button></div>'+
 '<div id="agCardStage" class="agent-flip-stage" tabindex="0" role="button" aria-label="Flip flashcard"><div class="agent-flip" id="agFlip"><div class="ag-front"><small>QUESTION</small><h3 id="agQuestion"></h3><span>Tap or press Space to flip</span></div><div class="ag-back"><small>ANSWER / EXPLANATION</small><div id="agAnswer"></div></div></div></div>'+
 '<div class="agent-actions agent-nav"><button type="button" id="agPrev">← Previous</button><span id="agCount">1 / 100</span><button type="button" id="agNext">Next →</button></div>'+
 '<div class="agent-actions agent-rates"><button type="button" data-grade="again">↻ Again</button><button type="button" data-grade="good">✓ Good</button><button type="button" data-grade="easy">★ Mastered</button></div>'+
 '<div class="agent-coach"><strong>Local study coach</strong><p id="agCoach">Reveal the answer to get a concept-specific hint.</p><small id="agLabTip"></small></div></div>'+
 '<div id="agResearch" hidden><h3>Research agent · sourced results only</h3><p>Online searches query Wikipedia and OpenAlex on demand. Results are not certified simulation evidence; check linked originals before citing them.</p><p class="agent-offline-tip"><b>Offline study:</b> open this website once while connected, then add it to your Home Screen (iPhone Safari: Share → Add to Home Screen). Flashcards and SPICE practice work offline afterward, subject to browser storage availability. Live research requires a connection.</p>'+
 '<label>Engineering topic<input id="agQuery" value="FinFET CMOS" maxlength="90" placeholder="Try setup slack or MOSFET"></label>'+
 '<div class="agent-actions"><button type="button" id="agFetch">Search live sources</button><button type="button" id="agRotate">Rotate topics now</button><button type="button" id="agAutoRotate">⏱ Auto-rotate (25s): off</button></div>'+
 '<div role="status" aria-live="polite" id="agResearchStatus">Live searches require internet access. Your flashcards remain available offline.</div><div id="agResults"></div></div>'+
 '<div id="agNotes" hidden><h3>Private personal study cards</h3><p>Add your own question and answer. These stay in this browser only, and remain available offline. Do not enter employer-confidential information into a public/shared device.</p>'+
 '<label>Question<input id="agCustomQ" maxlength="220" placeholder="What does ΓL represent?"></label><label>Explanation<textarea id="agCustomA" rows="5" maxlength="1000" placeholder="State the physical meaning and formula."></textarea></label>'+
 '<button type="button" id="agSave">Save a local study card</button><button type="button" id="agBackup">Export personal cards + review history</button><div id="agNoteStatus" role="status"></div><div id="agCustomList"></div></div>';
const nav=document.querySelector("nav");if(!nav||!BASE.length)return;
nav.insertAdjacentElement("afterend",mount);
const btn=document.createElement("button");btn.textContent="✧ Research & 3D cards";btn.dataset.mode="discovery";nav.appendChild(btn);
const $=s=>mount.querySelector(s);
btn.onclick=function(){document.querySelectorAll("#cardsView,#labsView,#wavesView,#reviewView").forEach(x=>x.hidden=true);document.querySelectorAll('nav [data-mode]').forEach(x=>x.classList.remove("active"));btn.classList.add("active");mount.hidden=false;renderDeck();};
nav.querySelectorAll('[data-mode]:not([data-mode="discovery"])').forEach(b=>b.addEventListener("click",()=>{mount.hidden=true;pauseAuto();pauseRotation()}));
function deckAll(){return [...BASE.map((c,i)=>({id:"pub-"+i,question:c.question,answer:c.answer,topic:c.topic||"Engineering",source:"public"})),...state.custom.map(c=>({...c,source:"private"}))]}
function renderDeck(){
 let list=deckAll();const filter=$("#agFilter").value;
 if(filter==="custom")list=list.filter(x=>x.source==="private");
 else if(filter==="missed")list=list.filter(x=>state.ratings[x.id]==="again");
 else if(filter==="due")list=list.filter(x=>state.schedule?.[x.id]?.next<=Date.now());
 if(state.shuffle)list=list.slice().sort((a,b)=>a.id.localeCompare(b.id)).reverse();
 current=list;position=Math.max(0,Math.min(position,list.length-1));
 $("#agTotal").textContent=deckAll().length;
 $("#agReviewed").textContent=Object.keys(state.ratings).length;
 $("#agCount").textContent=list.length?(position+1)+" / "+list.length:"0 / 0";
 const card=list[position];$("#agQuestion").textContent=card?.question||"No cards match this filter.";
 $("#agAnswer").textContent=card?.answer||"Change the filter or add a custom study card.";
 state.turned=false;$("#agFlip").classList.remove("turned");
 const tip=coach(card?.question||"",card?.answer||"");
 $("#agCoach").textContent=tip.hint;
 $("#agLabTip").textContent=tip.lab;
}
function flip(){state.turned=!state.turned;$("#agFlip").classList.toggle("turned",state.turned)}
$("#agCardStage").onclick=flip;$("#agCardStage").onkeydown=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();flip()}};
$("#agNext").onclick=()=>{position=(position+1)%Math.max(current.length,1);renderDeck()};
$("#agPrev").onclick=()=>{position=(position-1+Math.max(current.length,1))%Math.max(current.length,1);renderDeck()};
$("#agShuffle").onclick=()=>{state.shuffle=!state.shuffle;position=0;$("#agShuffle").textContent=state.shuffle?"Ordered ✓":"Shuffle";renderDeck()};
$("#agFilter").onchange=()=>{position=0;renderDeck()};
mount.querySelectorAll("[data-grade]").forEach(b=>b.onclick=()=>{
 const c=current[position];if(!c)return;state.ratings[c.id]=b.dataset.grade;
 const prior=state.schedule?.[c.id]||{days:0};
 let days=b.dataset.grade==="again"?0:b.dataset.grade==="easy"?Math.max(4,Math.round((prior.days||1)*2.5)):Math.max(1,Math.round((prior.days||1)*2));
 state.schedule=state.schedule||{};state.schedule[c.id]={days,next:Date.now()+days*86400000};persist();
 const h=coach(c.question,c.answer,b.dataset.grade==="again");
 $("#agCoach").textContent=h.hint+" "+h.follow;$("#agReviewed").textContent=Object.keys(state.ratings).length;
 $("#agNext").click();
});
function pauseAuto(){if(autoTimer)clearInterval(autoTimer);autoTimer=null;$("#agAuto").textContent="▶ Autoplay 15s: off";}
$("#agAuto").onclick=()=>{
 if(autoTimer){pauseAuto();return}
 $("#agAuto").textContent="■ Stop autoplay";
 autoTimer=setInterval(()=>{if(!mount.hidden&&$("#agDeck").hidden===false)$("#agNext").click();else pauseAuto()},15000);
};
function tabs(tab){for(const v of ["Deck","Research","Notes"]){$("#ag"+v).hidden=v!==tab;$("#ag"+v+"Tab").classList.toggle("active",v===tab)}if(tab!=="Research")pauseRotation()}
for(const tab of ["Deck","Research","Notes"])$("#ag"+tab+"Tab").onclick=()=>tabs(tab);
function updateNotes(){
 $("#agCustomList").innerHTML=state.custom.length?state.custom.map((c,i)=>'<div class="agent-saved"><span>'+esc(c.question)+'</span><button type="button" data-del="'+i+'" aria-label="Delete personal card">Remove</button></div>').join(""):"No personal cards saved yet.";
}
$("#agSave").onclick=()=>{
 const q=$("#agCustomQ").value.trim(),a=$("#agCustomA").value.trim();
 if(!q||!a){$("#agNoteStatus").textContent="Enter both a question and an answer.";return}
 if(state.custom.length>=100){$("#agNoteStatus").textContent="The local deck is limited to 100 personal cards.";return}
 state.custom.push({id:"custom-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),question:q,answer:a,topic:"My notes"});
 persist();$("#agCustomQ").value="";$("#agCustomA").value="";$("#agNoteStatus").textContent="Saved on this device; no account upload.";updateNotes();renderDeck();
};
$("#agBackup").onclick=()=>{
 const payload={version:2,exported:new Date().toISOString(),custom:state.custom,ratings:state.ratings,schedule:state.schedule};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="slt-study-personal-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),900);
 };
 $("#agCustomList").onclick=e=>{let b=e.target.closest("[data-del]");if(!b)return;const idx=Number(b.dataset.del);if(!Number.isInteger(idx))return;state.custom.splice(idx,1);persist();updateNotes();renderDeck()};
async function fetchJson(url,signal){
 const response=await fetch(url,{signal,cache:"no-store",headers:{Accept:"application/json"}});
 if(!response.ok)throw Error("External API responded "+response.status);
 return response.json();
}
let online=navigator.onLine,fetchLock=false;
async function discover(query){
 query=String(query||"").trim().slice(0,90);if(!query)return;
 if(!navigator.onLine){$("#agResearchStatus").textContent="Offline: live lookup is unavailable. Your saved cards and cached study materials still work.";return}
 if(fetchLock)return;fetchLock=true;
 const button=$("#agFetch");button.disabled=true;
 if(abort)abort.abort();abort=new AbortController();
 const timer=setTimeout(()=>abort.abort(),10000);
 $("#agResearchStatus").textContent="Checking live research sources…";
 try{
  let wiki="https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch="+encodeURIComponent(query)+"&gsrlimit=3&prop=extracts&exintro=1&explaintext=1&format=json&origin=*";
  let open="https://api.openalex.org/works?search="+encodeURIComponent(query)+"&per-page=3";
  const result=await Promise.allSettled([fetchJson(wiki,abort.signal),fetchJson(open,abort.signal)]);
  let entries=[];
  if(result[0].status==="fulfilled"){
   const pages=Object.values(result[0].value.query?.pages||{});
   entries.push(...pages.slice(0,3).map(p=>({source:"Wikipedia",title:p.title,detail:(p.extract||"Read the source article.").slice(0,250),url:"https://en.wikipedia.org/?curid="+Number(p.pageid)})));
  }
  if(result[1].status==="fulfilled"){
   const papers=result[1].value.results||[];
   entries.push(...papers.slice(0,3).map(p=>({source:"OpenAlex • "+(p.publication_year||"Undated"),title:p.title,detail:"Research metadata; inspect abstract and publication before citing.",url:(typeof p.doi==="string"&&p.doi.startsWith("https://doi.org/"))?p.doi:("https://openalex.org/"+encodeURIComponent((p.id||"").split("/").pop()))})));
  }
  if(!entries.length)throw Error("No results were returned from reachable sources");
  const unavailable=[result[0].status==="rejected"?"Wikipedia":null,result[1].status==="rejected"?"OpenAlex":null].filter(Boolean);
  $("#agResearchStatus").textContent="Retrieved "+entries.length+" sourced items. "+(unavailable.length?unavailable.join(" and ")+" temporarily unavailable. ":"")+"Review original pages; no results were invented.";
  $("#agResults").innerHTML=entries.map(r=>'<article class="agent-result"><small>'+esc(r.source)+'</small><h4>'+esc(r.title)+'</h4><p>'+esc(r.detail)+'</p><a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">Read original source</a></article>').join("");
  state.lastResearch={query,entries,timestamp:new Date().toISOString()};persist();
 }catch(e){
  $("#agResearchStatus").textContent="Live lookup unavailable ("+String(e.name==="AbortError"?"timed out":e.message).slice(0,120)+"). Your offline study deck is unaffected.";
 }finally{clearTimeout(timer);button.disabled=false;fetchLock=false}
}
$("#agFetch").onclick=()=>discover($("#agQuery").value);
$("#agRotate").onclick=()=>{state.topic=(state.topic+1)%topics.length;$("#agQuery").value=topics[state.topic];discover(topics[state.topic])};
function pauseRotation(){if(rotateTimer)clearInterval(rotateTimer);rotateTimer=null;$("#agAutoRotate").textContent="⏱ Auto-rotate (25s): off"}
$("#agAutoRotate").onclick=()=>{if(rotateTimer){pauseRotation();return}$("#agAutoRotate").textContent="■ Stop rotation";rotateTimer=setInterval(()=>{if(document.hidden||mount.hidden||$("#agResearch").hidden||!navigator.onLine)return;$("#agRotate").click()},25000)};
const status=document.createElement("span");status.id="sltNetwork";status.className="slt-network";status.setAttribute("role","status");status.textContent="Network checking";document.querySelector("header").appendChild(status);
function networkState(name,detail){
 status.dataset.state=name;status.textContent=detail;
 $("#agHealth").textContent=detail;
}
async function checkHealth(){
 if(!navigator.onLine){networkState("offline","Offline · saved lessons work");return}
 const signal=AbortSignal.timeout?AbortSignal.timeout(6500):undefined;
 try{
  const r=await fetch("./index.html?healthcheck=1",{cache:"no-store",signal});
  if(!r.ok)throw Error("unavailable");networkState("online","Online · updates available")
 }catch{networkState("degraded","Connection unstable · cached lessons work")}
}
window.addEventListener("online",checkHealth);
window.addEventListener("offline",()=>networkState("offline","Offline · saved lessons work"));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)checkHealth()});
setInterval(()=>{if(!document.hidden)checkHealth()},60000);
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="127.0.0.1"||location.hostname==="localhost")){
 navigator.serviceWorker.register("./sw.js").then(()=>{status.title="Offline study assets are cached after the first successful visit";}).catch(()=>{status.title="Offline installation was unavailable in this browser"});
}
if(state.lastResearch){
 $("#agResearchStatus").textContent="Last sourced search "+state.lastResearch.query+" ("+state.lastResearch.timestamp+"). Live searches require internet.";
 const r=state.lastResearch.entries||[];$("#agResults").innerHTML=r.map(x=>'<article class="agent-result"><small>'+esc(x.source)+'</small><h4>'+esc(x.title)+'</h4><p>'+esc(x.detail)+'</p><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Read original source</a></article>').join("");
}
const school=document.createElement("div");school.id="agUniversity";
school.innerHTML='<h3>University study references</h3><p>Official course descriptions or course pages. These are external learning links, not verified results from this site’s circuit simulations.</p>'+
 '<div class="ag-university-links">'+
 '<a href="https://bulletin.sfsu.edu/courses/engr/" target="_blank" rel="noopener noreferrer"><b>SFSU ENGR 852</b><span>Advanced digital design and EDA flows</span></a>'+
 '<a href="https://www-inst.eecs.berkeley.edu/~eecs151/fa26/" target="_blank" rel="noopener noreferrer"><b>UC Berkeley EECS 151</b><span>Digital logic, Verilog and ASIC labs</span></a>'+
 '<a href="https://mit-public.courseleaf.com/subjects/6/" target="_blank" rel="noopener noreferrer"><b>MIT 6.5910 (formerly 6.375)</b><span>Complex digital systems design</span></a>'+
 '<a href="https://web.stanford.edu/class/ee271/" target="_blank" rel="noopener noreferrer"><b>Stanford EE 271</b><span>Introduction to VLSI systems</span></a></div>';
$("#agResearch").insertBefore(school,$("#agResults"));
updateNotes();renderDeck();checkHealth();
})();
