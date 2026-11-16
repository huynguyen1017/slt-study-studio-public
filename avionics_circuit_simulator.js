"use strict";
/* Local question->netlist translator and explicitly opt-in third-party CircuitJS1 embed.
   CircuitJS1 is independently hosted; no cross-origin DOM access or pasted user answers.
   Illustrative ideal models are marked; physical board diagrams are not verified pinouts. */
(function(){
const VIS=window.avionicsVisuals;
const url="https://www.falstad.com/circuit/circuitjs.html";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nval=(v,u)=>{
 const s=String(v||"").trim().replace(/,/g,"");
 const n=parseFloat(s);if(!Number.isFinite(n)||n<=0)return null;
 const m=s.match(/([kKMmµμunpG])\s*(?:Ω|F|H|V|A)/);
 const scale=m?{k:1e3,K:1e3,M:1e6,G:1e9,m:1e-3,"µ":1e-6,"μ":1e-6,u:1e-6,n:1e-9,p:1e-12}[m[1]]:1;
 return n*(scale||1);
};
const numbers=(q,u)=>{
 const regex=u==="R"?/\b\d+(?:\.\d+)?\s*(?:MΩ|kΩ|mΩ|Ω)/gi:u==="C"?/\b\d+(?:\.\d+)?\s*(?:mF|µF|uF|nF|pF|F)\b/gi:/\b\d+(?:\.\d+)?\s*(?:V|mV)\b/gi;
 return (String(q.question).match(regex)||[]).map(v=>nval(v,u)).filter(v=>v!==null);
};
const safe=(v,min,max,def)=>Number.isFinite(v)&&v>=min&&v<=max?v:def;
const a=(q,t)=>{
 if(!VIS||!VIS.getWiringSetup||t.id==="units")return null;
 const c=VIS.getWiringSetup(q,t),key=c.key,rs=numbers(q,"R");
 const qr=q.id.match(/-([FACD])(\d+)/),index=qr?Number(qr[2]):1;
 // Only families for which the equivalent ideal CircuitJS topology is explicitly defined.
 const one=new Set(["ammeter-series","voltmeter-parallel","dc-power","energy-log","thermal-load"]);
 const chain=new Set(["series-chain","voltage-divider","loaded-divider","kvl-mesh","thevenin-port"]);
 const parallel=new Set(["parallel-network","kcl-junction"]);
 const rc=new Set(["rc-charge","rc-discharge","rc-probe-load","filter-lpf","filter-hpf","cap-charge","cap-decoupling"]);
 if(!(one.has(key)||chain.has(key)||parallel.has(key)||rc.has(key)))return null;
 const givenV=numbers(q,"V");
 const V=safe(givenV[0],0.1,1000,[3.3,5,9,12][index%4]);
 const R1=safe(rs[0],1,5e8,[330,1000,2200,4700][index%4]);
 const R2=safe(rs[1],1,5e8,[470,1000,3300,2200][index%4]);
 const R3=safe(rs[2],1,5e8,[2200,4700,1000][index%3]);
 const caps=numbers(q,"C");
 const C=safe(caps[0],1e-12,1,[1e-6,2.2e-6,10e-6,100e-9][index%4]);
 const correctValues=(givenV.length>0&&rs.length>0)||(rc.has(key)&&rs.length>0&&caps.length>0);
 const title=key.replace(/-/g," ").toUpperCase();
 const t0="$ 1 0.000005 10.20027730826997 50 5 50";
 const source="v 96 256 96 80 0 0 40 "+V+" 0 0 0.5";
 const ground="g 96 256 96 288 0";
 const line=(x,y,X,Y)=>"w "+x+" "+y+" "+X+" "+Y+" 0";
 const res=(x,y,X,Y,r)=>"r "+x+" "+y+" "+X+" "+Y+" 0 "+r;
 const cap=(x,y,X,Y,c)=>"c "+x+" "+y+" "+X+" "+Y+" 0 "+c+" 0";
 let els=[t0,source,ground],spice=["* Question "+q.id+" · ideal training circuit","V1 vin 0 DC "+V],topology="";let probe="V(vin)";
 if(one.has(key)){
  els.push(res(96,80,400,80,R1),line(400,80,400,256),line(400,256,96,256));
  spice.push("R1 vin 0 "+R1);topology="Single-loop resistive DC load";
 }else if(chain.has(key)){
  els.push(res(96,80,256,80,R1),res(256,80,448,80,R2),line(448,80,448,256),line(448,256,96,256));
  spice.push("R1 vin middle "+R1,"R2 middle 0 "+R2);topology="Series divider / voltage loop";probe="V(middle)";
 }else if(parallel.has(key)){
  const includeThird=rs.length>=3||(!rs.length&&index%2===0);
  els.push(line(96,80,448,80),line(96,256,448,256),res(240,80,240,256,R1),res(448,80,448,256,R2));
  spice.push("R1 vin 0 "+R1,"R2 vin 0 "+R2);
  if(includeThird){els.push(res(352,80,352,256,R3));spice.push("R3 vin 0 "+R3);}
  topology=(includeThird?"Three":"Two")+" parallel resistor branches";
 }else if(rc.has(key)){
  if(key==="filter-hpf"){
   els.push(cap(96,80,320,80,C),res(320,80,320,256,R1),line(320,256,96,256));
   spice.push("C1 vin out "+C,"R1 out 0 "+R1);topology="RC high-pass";probe="V(out)";
  }else{
   els.push(res(96,80,320,80,R1),cap(320,80,320,256,C),line(320,256,96,256));
   spice.push("R1 vin out "+R1,"C1 out 0 "+C);topology=key==="filter-lpf"?"RC low-pass":"RC step / charging example";probe="V(out)";
  }
 }
 const setup=els.join("\n");
 if(setup.length>1900)return null;
 const link=url+"?cct="+encodeURIComponent(setup);
 const netlist=spice.join("\n")+"\n.op\n.end";
 return {questionId:q.id,key,topology,voltage:V,resistors:[R1,R2,R3],capacitance:C,
  simText:setup,spiceNetlist:netlist,preview:probe,
  suppliedValues:correctValues,link,title,
  warning:correctValues?
   "An idealized model using values from this question. Confirm component topology against the full schematic and do not infer a safe physical connection.":
   "Illustrative example values are used where this question specifies no complete circuit. This is NOT a numerical simulation of the original question."};
};
function render(q,t){
 const spec=a(q,t);
 if(!spec){
   const logic=t.id==="components"||t.id==="timing"||t.id==="buses";
   return '<details class="av-simulator" data-sim-kind="unsupported"><summary>Optional circuit-design tool · '+(logic?"digital logic editor":"advanced simulation")+'</summary>'+
    '<p>This question does not define a simple source-to-ground analog netlist. The board/test-harness diagram remains instructional; a generic resistor simulator would be misleading.</p>'+
    (logic?'<a href="https://circuitverse.org/simulator" target="_blank" rel="noopener noreferrer">Open CircuitVerse digital logic editor (blank project)</a>':
    '<a href="https://www.falstad.com/circuit/" target="_blank" rel="noopener noreferrer">Open the CircuitJS1 circuit editor (blank project)</a>')+
    '<p class="av-sim-honesty">No automatic question import is claimed for this tool.</p></details>';
 }
 return '<details class="av-simulator" data-sim-question="'+esc(q.id)+'"><summary>Run an interactive circuit · '+esc(spec.topology)+'</summary>'+
   '<p class="av-sim-honesty">'+esc(spec.warning)+' The third-party simulator opens only on request and is independent of the workbook answer checker.</p>'+
   '<div class="av-sim-actions"><button type="button" data-sim-start="'+esc(q.id)+'">Load live CircuitJS1 here</button>'+
   '<a href="'+esc(spec.link)+'" target="_blank" rel="noopener noreferrer">Open in separate simulator tab</a>'+
   '<button type="button" data-sim-netlist="'+esc(q.id)+'">Show SPICE reference netlist</button></div>'+
   '<div class="av-sim-frame" data-sim-slot="'+esc(q.id)+'"><p>Simulation has not been loaded. Your website remains offline-friendly until you choose to launch it.</p></div>'+
   '<pre class="av-sim-netlist" data-sim-spice="'+esc(q.id)+'" hidden>'+esc(spec.spiceNetlist)+'</pre></details>';
}
function bind(host,getActive){
 const opened=host.querySelectorAll("[data-sim-start]");
 opened.forEach(b=>b.onclick=()=>{
  const q=getActive&&getActive(),t=q&&getActive(true);if(!q||!t)return;
  const s=a(q,t);if(!s||s.questionId!==b.dataset.simStart)return;
  const slot=host.querySelector('[data-sim-slot="'+s.questionId+'"]');if(!slot)return;
  const frame=document.createElement("iframe");
  frame.title="CircuitJS1 idealized circuit simulator for "+s.questionId;
  frame.loading="lazy";frame.referrerPolicy="no-referrer";
  frame.sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock";
  frame.src=s.link;frame.width="100%";frame.height="520";
  slot.replaceChildren(frame);b.disabled=true;b.textContent="Circuit simulator loaded";
 });
 host.querySelectorAll("[data-sim-netlist]").forEach(b=>b.onclick=()=>{
  const elem=host.querySelector('[data-sim-spice="'+b.dataset.simNetlist+'"]');if(elem)elem.hidden=!elem.hidden;
 });
}
window.avionicsCircuitSimulator={build:a,render,bind};
})();