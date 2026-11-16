"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const ctx={window:{},Math,console};vm.createContext(ctx);
for(const file of ["nvidia_slt_tracks.js","nvidia_slt_math.js","nvidia_slt_questions.js"])vm.runInContext(read(file),ctx,{filename:file});
const {NVIDIA_SLT_TRACKS:T,NVIDIA_SLT_CALCS:M,NVIDIA_SLT_QUESTIONS:Q}=ctx.window;
assert.equal(T.length,12);assert.equal(Q.length,600);
assert.equal(new Set(Q.map(q=>q.id)).size,600);
assert.equal(new Set(Q.map(q=>q.question)).size,600);
assert.equal(Q.filter(q=>q.expected!==undefined).length,120);
let methods=0,rolls=0,steps=0;
for(const topic of T){
 const owned=Q.filter(q=>q.topic===topic.id),seen=new Set();
 assert.equal(owned.length,50,"50 questions in "+topic.id);
 assert.equal(topic.skills.length,10);
 for(let i=0;i<50;i++){
  const q=owned[i];assert.equal(q.difficulty,i+1);assert.equal(q.id,"nvs-"+topic.id+"-"+String(i+1).padStart(2,"0"));
  assert.equal(q.steps.length,[7,8,9,9,10][Math.floor(i/10)],q.id+" guides");
  assert(q.question.length>130,q.id+" not fully contextual");
  assert(q.lesson.summary&&q.lesson.why&&q.lesson.vocabulary.length>=4);
  assert(q.hypothetical&&q.interviewAnswer.includes("I would"),"Must not claim historical NVIDIA experience");
  for(const step of q.steps){assert(step.length>55,q.id+" incomplete solution step");steps++;}
  if(i>=20&&i<30){
   assert.equal(q.questionType,"number");
   assert(Number.isFinite(q.expected));
   const calc=Function('"use strict";return ('+q.math.expression+')')();
   assert(Math.abs(calc-q.expected)<=Math.max(1e-7,Math.abs(q.expected)*1e-7),q.id+" broken canonical arithmetic");
   assert(q.math.unit===q.unit);assert(q.sub.includes(q.math.expression));
   assert(!seen.has(q.operation),q.id+" duplicated numeric method in one track");
   seen.add(q.operation);methods++;
   let prev=q.expected;
   for(let n=1;n<8;n++){
    const x=M.generate(topic.id,i-20,n);
    const check=Function('"use strict";return ('+x.expression+')')();
    assert.equal(x.method,q.operation,q.id+" dice changed method");
    assert(Math.abs(check-x.expected)<=Math.max(1e-7,Math.abs(x.expected)*1e-7),q.id+" dice arithmetic");
    assert.notEqual(x.expected,prev,q.id+" consecutive reroll repeats same answer");
    assert.equal(x.unit,q.unit,q.id+" dice changed output unit");
    assert(x.prompt!==q.math.prompt,q.id+" no new inputs");
    prev=x.expected;rolls++;
   }
  }
  if(i===49){assert(q.question.includes("second independent signal")||q.question.includes("second independent"),"Capstone combines subsystems");assert(q.question.includes("PASS / FAIL / INVALID / BLOCKED"));}
 }
}
assert.equal(methods,120);assert.equal(rolls,840);assert.equal(steps,5160);
const html=read("index.html"),app=read("app.js"),sw=read("sw.js"),css=read("nvidia_slt.css"),ui=read("nvidia_slt_ui.js");
for(const f of ["nvidia_slt_tracks.js","nvidia_slt_math.js","nvidia_slt_questions.js","nvidia_slt_ui.js","nvidia_slt.css"]){
 assert(html.includes(f),"HTML does not load "+f);assert(sw.includes('"./'+f+'"'),"Service worker missing "+f);
}
assert(html.includes('data-mode="nvidia"')&&html.includes('id="nvidiaSltRoot"'));
assert(app.includes("nvidiaSltRoot")&&app.includes("'nvidia'"));
assert.equal(app.includes("localStorage.clear()"),false,"Do not delete saved progress");
assert(ui.includes('slt-nvidia-soc-academy-v1'));
assert(sw.includes("v34-nvidia-slt-academy-r1"));
assert(css.includes("@media(max-width:640px)"));
console.log("PASS: 12 topics ×50 =600; 120 distinct topic methods; 840 method-consistent numeric rerolls; 5160 guided steps; isolated state and offline assets");

(async()=>{
 if(process.env.RUN_BROWSER!=="1")return;
 const {chromium}=require("playwright"),browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:8765/#nvidia",{waitUntil:"load"});
  await page.locator("#nvidiaView:visible .nvs-app").waitFor({timeout:30000});
  assert.equal(await page.locator("#nvidiaView .nvs-numbers button").count(),50);
  assert((await page.locator("#nvidiaView .nvs-hero").textContent()).includes("600"));
  assert((await page.locator("#nvidiaView .nvs-toolbar").textContent()).includes("Electrical Foundations"));
  await page.locator("#nvidiaView [data-goto='20']").last().click();
  const canonical=await page.locator("#nvidiaView .nvs-question").textContent();
  assert((await page.locator("#nvidiaView .nvs-toolbar").textContent()).includes("21 / 50"));
  await page.locator("#nvidiaView #nvsDice").click();
  const rolled=await page.locator("#nvidiaView .nvs-question").textContent();
  assert.notEqual(rolled,canonical);
  await page.locator("#nvidiaView #nvsDice").click();
  const rolled2=await page.locator("#nvidiaView .nvs-question").textContent();
  assert.notEqual(rolled2,rolled,"Two dice clicks must change inputs");
  await page.locator("#nvidiaView #nvsRestore").click();
  assert.equal(await page.locator("#nvidiaView .nvs-question").textContent(),canonical,"Canonical restore");
  await page.locator("#nvidiaView [data-screen='steps']").first().click();
  assert((await page.locator("#nvidiaView .nvs-step").textContent()).includes("STEP 1 / 9"));
  await page.locator("#nvidiaView #nvsNextStep").click();
  assert((await page.locator("#nvidiaView .nvs-step").textContent()).includes("STEP 2 / 9"));
  await page.locator("#nvidiaView [data-screen='practice']").first().click();
  await page.locator("#nvidiaView #nvsValue").fill("wrong");
  await page.locator("#nvidiaView #nvsCheck").click();
  assert(await page.locator("#nvidiaView #nvsMaster").isDisabled());
  const answer=Q.find(x=>x.id==="nvs-electrical-21").expected;
  await page.locator("#nvidiaView #nvsValue").fill(String(answer));
  await page.locator("#nvidiaView #nvsCheck").click();
  assert((await page.locator("#nvidiaView .nvs-feedback").textContent()).includes("Correct"));
  await page.locator("#nvidiaView #nvsMaster").click();
  assert((await page.locator("#nvidiaView .nvs-stats").textContent()).includes("1 / 600"));
  const storage=await page.evaluate(()=>Object.keys(localStorage));
  assert(storage.includes("slt-nvidia-soc-academy-v1"),"NVIDIA progress must save to distinct key");
  await page.locator("#nvidiaView [data-goto='49']").last().click();
  assert((await page.locator("#nvidiaView .nvs-question").textContent()).includes("third subsystem"));
  await page.locator("#nvidiaView #nvsTopics").selectOption("dram");
  assert((await page.locator("#nvidiaView .nvs-toolbar").textContent()).includes("DDR"));
  await page.locator('[data-mode="avionics"]').click();
  assert(await page.locator("#avionicsView").isVisible(),"Muon must remain intact");
  await page.locator('[data-mode="nvidia"]').click();
  assert(await page.locator("#nvidiaView").isVisible(),"Return to NVIDIA academy");
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.goto("http://127.0.0.1:8765/#nvidia");
  await mobile.locator("#nvidiaView .nvs-numbers button").first().waitFor();
  assert.equal(await mobile.locator("#nvidiaView .nvs-numbers button").count(),50);
  assert(await mobile.locator("#nvidiaView .nvs-tabs [role=tab]").count()===4);
  await mobile.locator("#nvidiaView [data-goto='49']").last().click();
  assert((await mobile.locator("#nvidiaView .nvs-question").textContent()).includes("PASS / FAIL"));
  assert.equal(errors.length,0,errors.join("\n"));
  await mobile.close();
  console.log("PASS browser: direct #nvidia, 50 quick-jump, 2 method-safe dice rerolls, restore, worked steps, correct/incorrect grading, saved progress, Muon isolation, mobile");
 }finally{await browser.close()}
})();
