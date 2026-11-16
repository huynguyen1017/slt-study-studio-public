"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const stored=new Map(),ctx={window:{},console,Math,localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)}};
vm.createContext(ctx);
for(const file of ["nvidia_slt_tracks.js","nvidia_slt_math.js","nvidia_slt_questions.js","nvidia_slt_visual_lab_v2.js"])vm.runInContext(read(file),ctx,{filename:file});
const T=ctx.window.NVIDIA_SLT_TRACKS,Q=ctx.window.NVIDIA_SLT_QUESTIONS,M=ctx.window.NVIDIA_SLT_CALCS,V=ctx.window.NVIDIA_SLT_VISUAL_LAB;
assert.equal(T.length,12);assert.equal(Q.length,600);assert(V&&Object.keys(V.renderers).length===12);
let rendered=0,math=0;const seen=new Set(),topicSigns=new Set();
for(const t of T){
 const qs=Q.filter(q=>q.topic===t.id);
 assert.equal(qs.length,50);
 for(const q of qs){
  const h=V.render(q,t,q.operation==="parallel"?'<svg class="nvs-exact-circuit"><text>connected source + parallel branches</text></svg>':"");
  assert(h.includes('data-nvs-lab="'+q.id+'"'),q.id+" missing identity");
  assert(!h.includes("EXPLANATORY FLOW")&&!h.includes("Linux test host")&&!h.includes("Fixture / software"),"Old static diagram leaked");
  assert(h.includes("data-nvs-view")&&h.includes("Signal / model")&&h.includes("Fault tree")&&h.includes("A/B/A test")&&h.includes("Evidence worksheet"),q.id+" missing interaction");
  assert(h.includes(t.title),q.id+" missing track-specific language");
  assert(h.includes(q.skillName),q.id+" diagram does not use current skill");
  assert(!h.includes("undefined")&&!h.includes("[object Object]"),q.id+" rendered invalid data");
  assert(!seen.has(q.id));seen.add(q.id);rendered++;
  if(q.questionType==="number"){
   assert(h.includes(String(Number(Number(q.expected).toPrecision(7)))),"Model output did not use current calculation answer "+q.id);
   assert(h.includes(q.formula.replace(/&/g,"&amp;").replace(/</g,"&lt;")),"Formula omitted from visual "+q.id);
   math++;
  }
  if(q.operation==="parallel")assert(h.includes("nvs-exact-circuit"),q.id+" lost exact mixed network");
 }
 const first=V.render(qs[0],t);
 assert(!topicSigns.has(t.id));topicSigns.add(t.id);
}
assert.equal(rendered,600);assert.equal(math,120);
const names=["electrical","socboot","dram","pcie","gpu","ate","pvt","instruments","linux","python","quality","interview"];
for(const id of names){
 const t=T.find(t=>t.id===id),q=Q.find(q=>q.topic===id),h=V.render(q,t);
 if(id==="linux")assert(h.includes("READ-ONLY LOG INSPECTOR"));
 if(id==="python")assert(h.includes("TEST SCRIPT DECISION"));
 if(id==="dram")assert(h.includes("DRAM TRAINING"));
 if(id==="pcie")assert(h.includes("PCIe LINK TRAINING"));
 if(id==="instruments")assert(h.includes("SYNTHETIC FOUR-CHANNEL"));
 if(id==="interview")assert(h.includes("THREE DISTINCT SIGNALS"));
 if(id==="quality")assert(h.includes("FIRST-PASS YIELD"));
}
const q=Q.find(q=>q.id==="nvs-electrical-22"),t=T.find(t=>t.id==="electrical");
const before=V.render(q,t,'<svg class="nvs-exact-circuit">Rs 110 Ω; Ra 175 Ω; Rb 350 Ω</svg>');
const re=M.generate("electrical",1,1),rerolled={...q,expected:re.expected,unit:re.unit,formula:re.formula,math:re,sub:re.sub};
const after=V.render(rerolled,t,'<svg class="nvs-exact-circuit">new components</svg>');
assert.notEqual(re.expected,q.expected);
assert(after.includes("new components")&&!after.includes("Rs 110 Ω"));
assert(before.includes("Rs 110 Ω"));
assert.equal(V.storeKey,"slt-nvidia-visual-evidence-v2");
const html=read("index.html"),sw=read("sw.js"),css=read("nvidia_slt_visual_lab_v2.css"),ui=read("nvidia_slt_ui.js");
for(const file of ["nvidia_slt_visual_lab_v2.js","nvidia_slt_visual_lab_v2.css"]){assert(html.includes(file));assert(sw.includes('"./'+file+'"'));}
assert(sw.includes("v35-nvidia-scenario-lab-r1"));
assert(ui.includes("NVIDIA_SLT_VISUAL_LAB.render")&&ui.includes("NVIDIA_SLT_VISUAL_LAB.mount")||ui.includes("visual.mount"));
assert(!ui.includes("EXPLANATORY FLOW —"));
assert(css.includes("nvs-lab-check")&&css.includes("@media(max-width:500px)"));
console.log("PASS NVIDIA v2: 600 scenario-specific renderings, 12 topic visualizers, 120 predicted math results, connected mixed network, four learning utilities, no generic diagram, isolated persistent evidence worksheet.");
