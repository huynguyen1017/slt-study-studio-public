"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=x=>fs.readFileSync(path.join(root,x),"utf8");
const c={window:{},console,Math};vm.createContext(c);
for(const file of ["avionics_data.js","avionics_questions.js","avionics_distinct_labs_v10.js","avionics_distinct_math_v10.js","avionics_distinct_reasoning_v10.js","avionics_nucleo_workbench.js","avionics_video_lessons.js","avionics_visuals.js"])
 vm.runInContext(read(file),c,{filename:file});
const topics=c.window.AVIONICS_TOPICS,qs=c.window.AVIONICS_QUESTIONS,N=c.window.avionicsNucleoWorkbench,V=c.window.avionicsVideoLessons,visual=c.window.avionicsVisuals;
const get=id=>qs.find(q=>q.id===id),topic=id=>topics.find(t=>t.id===id);
assert.equal(topics.length,23);assert.equal(qs.length,690);assert.equal(new Set(qs.map(q=>q.id)).size,690);
const kinds={found:0,application:0,calculation:0,debug:0};let full=0,videoDirect=0,videoSearch=0,physical=new Set();
for(const t of topics){
 const q=qs.filter(q=>q.topic===t.id);
 assert.equal(q.length,30,t.id+" needs exactly 30 questions");
 const questionText=new Set();
 for(const [i,problem] of q.entries()){
   assert.equal(problem.difficulty,i+1,problem.id+" progression out of order");
   assert(!questionText.has(problem.question),problem.id+" repeated prompt");
   questionText.add(problem.question);
   assert(problem.steps.length>=3,problem.id+" missing baby steps");
   if(i<5){assert.equal(problem.level,"Foundations");kinds.found++;}
   else if(i<10){assert.equal(problem.level,"Application");kinds.application++;}
   else if(i<20){assert.equal(problem.level,"Calculation");kinds.calculation++;}
   else{assert.equal(problem.level,"Troubleshooting");kinds.debug++;}
   const items=V.selected(problem,t);
   assert.equal(items.length,2,problem.id+" requires two sources");
   assert.notEqual(items[0].source,items[1].source,problem.id+" sources identical");
   assert(V.render(problem,t).includes('data-video-question="'+problem.id+'"'),problem.id+" video not bound");
   for(const v of items){
     assert(v.url.startsWith("https://www.youtube.com/"),problem.id+" bad external URL");
     if(v.kind==="verified-video"){videoDirect++;assert(/watch\?v=/.test(v.url));}
     else{videoSearch++;assert(/search_query=/.test(v.url));}
   }
   const setup=N.setup(problem,t);
   if(setup){
    full++;physical.add(setup.key);
    assert(setup.sourceUrl.includes("st.com"),problem.id+" manual missing");
    const s=N.buildSvg(problem,t);
    assert(s.includes("<svg")&&s.includes("63 ROWS")&&s.includes("NUCLEO-L476RG"),problem.id+" incomplete board");
    for(const p of setup.parts){
      for(const h of [p[2],p[3]])assert(/^[a-j](?:[1-9]|[1-5][0-9]|6[0-3])$/.test(h),problem.id+" invalid component hole "+h);
    }
    for(const x of setup.links)assert(/^[a-j](?:[1-9]|[1-5][0-9]|6[0-3])$/.test(x[1]),problem.id+" invalid pin link");
    const vs=[...problem.question.matchAll(/(\d+(?:\.\d+)?)\s*V\b/g)].map(x=>Number(x[1]));
    if(problem.level==="Calculation"&&vs.some(v=>v>3.3))assert.fail(problem.id+" 5V+ wired to MCU");
   }
   const figure=visual.render(problem,t,"wiring");
   assert(figure.includes("Question:")&&figure.includes(problem.id)&&figure.includes("<svg"),problem.id+" question-specific figure");
 }
}
assert(full>=250,"Full board should apply where low-voltage Nucleo exercise is supported: "+full);
assert(physical.size>=8,"Too few circuit styles: "+physical.size);
assert(videoDirect>100&&videoSearch>100,"Need verified direct and source-targeted video resources");
assert.equal(kinds.found,115);assert.equal(kinds.application,115);assert.equal(kinds.calculation,230);assert.equal(kinds.debug,230);
const par=N.setup(get("parallel-C1"),topic("parallel"));
assert.equal(par.parts.filter(p=>p[1]==="R").length,2,"Two-resistor calculation must NOT show third resistor");
const ser=N.setup(get("series-C1"),topic("series"));
assert.equal(ser.parts.filter(p=>p[1]==="R").length,3,"Series calculation needs 3 resistor chain");
const assembly=N.full3220(get("parallel-F1"));
assert(assembly.includes("3220-POINT ASSEMBLY")&&assembly.includes("STRIP D")&&assembly.includes("P7"),"3220 view must include all four terminal strips and seven distribution strips");
assert((assembly.match(/<circle /g)||[]).length>=3200,"3220-point assembly must render every tie point");
assert.equal(N.pin.PA0[0],"CN6 pin 28");
assert.equal(N.pin.PB9[0],"CN10 pin 5");
assert.equal(N.pin.PB8[0],"CN10 pin 3");
assert.equal(N.pin.PA2[0],"CN10 pin 35");
assert.equal(N.pin.PA3[0],"CN10 pin 37");
assert.equal(N.setup(get("series-C7"),topic("series")),null,"5V+ divider must NOT connect to STM32");
assert.equal(N.setup(get("ohm-C3"),topic("ohm")),null,"12V example must NOT connect to STM32");
const site=read("index.html"),cache=read("sw.js"),tutor=read("avionics_tutor.js");
assert(site.includes("avionics_nucleo_workbench.js?v=1")&&site.includes("avionics_video_lessons.js?v=1"));
assert(cache.includes("v31-integrated-mixed-networks")&&cache.includes("avionics_progressive_videos.css"));
assert(tutor.includes("VIDEO.render(q,t)")&&tutor.includes("Build your skills in order"));
console.log("PASS "+qs.length+" progressive questions, "+full+" full Nucleo-board scenarios, "+physical.size+" circuit kit families, "+videoDirect+" verified direct and "+videoSearch+" source-targeted video links.");
