"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=x=>fs.readFileSync(path.join(root,x),"utf8");
const c={window:{},console,Math};vm.createContext(c);
for(const file of ["avionics_data.js","avionics_questions.js","avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js","avionics_distinct_reasoning_v10.js","avionics_visuals.js","avionics_circuit_simulator.js"])
 vm.runInContext(read(file),c,{filename:file});
const tops=c.window.AVIONICS_TOPICS,qs=c.window.AVIONICS_QUESTIONS,vis=c.window.avionicsVisuals,sim=c.window.avionicsCircuitSimulator;
assert.equal(tops.length,23);assert.equal(qs.length,690);
let total=0,all=new Set(),supported=0,examples=0;
for(const t of tops){
 const topicQs=qs.filter(q=>q.topic===t.id),distinct=new Set();
 assert.equal(topicQs.length,30);
 for(const q of topicQs){
  const c=vis.getWiringSetup(q,t),s=c.layoutSignature,figure=vis.render(q,t,"wiring");
  assert.equal(c.questionId,q.id);assert(s&&s.length>30);distinct.add(s);all.add(s);
  for(const wire of c.wires)assert.equal(wire.dst,"abcdefghij"[wire.col]+wire.row,"Wrong physical hole tag for "+q.id);
  for(const m of (c.target.match(/\b[a-j](?:9|1[0-7])\b/g)||[]))assert(/^[a-j](?:9|1[0-7])$/.test(m),"Invalid build-reference hole "+q.id);

  assert(figure.includes("Selected probe node")&&figure.includes(c.selectedHole),"Question-selected probe "+q.id);
  assert(figure.includes("svg")&&figure.includes(q.id),"No SVG for "+q.id);
  assert(c.selectedHole.match(/^[a-j](?:9|1[0-7])$/),"Bad selected hole "+q.id);
  for(const z of [...c.wires,...c.comps,...c.jumps]){
   for(const k of ["row","r1","r2"])if(k in z)assert(z[k]>=9&&z[k]<=17,q.id+" invalid row "+k);
   for(const k of ["col","c1","c2"])if(k in z)assert(z[k]>=0&&z[k]<=9,q.id+" invalid col "+k);
  }
  const m=sim.build(q,t),ui=sim.render(q,t);
  assert(ui.includes("av-simulator"),q.id+" simulator section missing");
  assert(!ui.includes("<iframe"),q.id+" should not load remote content before click");
  if(m){
   supported++;
   assert(m.link.startsWith("https://www.falstad.com/circuit/circuitjs.html?cct="));
   assert(m.link.length<2000,q.id+" circuit URL overflow");
   assert(m.simText.startsWith("$ 1 ")&&m.spiceNetlist.includes(".end"),q.id+" invalid netlist");
   assert(m.simText.split("\n").some(x=>x.startsWith("v ")),q.id+" missing voltage source");
   assert(ui.includes('data-sim-question="'+q.id+'"'));
  }else{
   assert(ui.includes("data-sim-kind"),q.id+" unsupported mode disclosure");
  }
  total++;
 }
 assert(distinct.size>=20,t.id+" still duplicates too many: "+distinct.size);
}
assert.equal(total,690);
assert(all.size>=550,"Wiring diversity regression: "+all.size);
assert(supported>=180,"CircuitJS analog circuits should be available for meaningful DC/RC questions");
const topic=id=>tops.find(t=>t.id===id),question=id=>qs.find(q=>q.id===id);
assert.equal(vis.getWiringKey(question("kcl-kvl-F1"),topic("kcl-kvl")),"kcl-junction");
assert.equal(vis.getWiringKey(question("kcl-kvl-F2"),topic("kcl-kvl")),"kvl-mesh");
assert.notEqual(vis.getWiringSetup(question("parallel-F1"),topic("parallel")).layoutSignature,vis.getWiringSetup(question("parallel-F2"),topic("parallel")).layoutSignature);
const par=vis.getWiringSetup(question("parallel-F2"),topic("parallel"));
assert(par.comps.some(x=>x.label==="R1"));
assert(!sim.build(question("rf-F1"),topic("rf")),"VNA and RF fixtures must not be presented as DC resistor circuit simulations");
const html=read("index.html"),sw=read("sw.js"),ui=read("avionics_tutor.js");
assert(html.includes("avionics_circuit_simulator.js?v=2")&&html.includes("avionics_visuals.js?v=10"));
assert(sw.includes("v35-nvidia-scenario-lab")&&sw.includes("avionics_circuit_simulator.js"));
assert(ui.includes("CIRCUITSIM.render(q,t)")&&ui.includes("CIRCUITSIM.bind(host"));
console.log("PASS: "+total+" question-level wiring diagrams, "+all.size+" distinct layouts/focus designs, "+supported+" CircuitJS-ready examples, correct KVL routing, privacy and offline initial state.");
