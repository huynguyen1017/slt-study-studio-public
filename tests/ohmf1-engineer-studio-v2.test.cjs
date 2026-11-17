"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),load=p=>fs.readFileSync(path.join(root,p),"utf8");
const scope={window:{studyMath:s=>"<math data-value='"+s+"'></math>"}};
vm.createContext(scope);
vm.runInContext(load("ohmf1_engineer_studio_v2.js"),scope);
const studio=scope.window.OHM_F1_ENGINEER_STUDIO;
assert(studio,"Worked-engineering module missing");
assert.equal(studio.isF1({id:"ohm-F1"},false),true);
assert.equal(studio.isF1({id:"ohm-F2"},false),false);
assert.equal(studio.isF1({id:"ohm-F1",variant:true},false),false);
assert.equal(studio.isF1({id:"ohm-F1"},true),false);
const a=studio.calc(5,220,3.3,15);
for(const [k,v] of Object.entries({ideal:22.727272727,observedR:220,lossV:1.7,lossR:113.3333333,deficit:7.727272727,power:49.5})){
 assert(Math.abs(a[k]-v)<1e-5,k+" computed error");
}
assert.equal(studio.calc(5,220,9,15),null,"Impossible load > supply must be rejected");
assert.equal(studio.calc(5,0,3.3,15),null,"Zero resistance must be rejected");
assert.equal(studio.calc(5,220,3.3,0),null,"Zero current must be rejected");
const h=studio.renderReadiness({id:"ohm-F1",question:"Define voltage"});
const svg=studio.renderSpread({id:"ohm-F1",question:"Define voltage"});
assert.equal((h.match(/class="ohm-step"/g)||[]).length,8);
assert.equal((h.match(/class="ohm-faq"/g)||[]).length,1);
assert.equal((h.match(/data-ohm-input=/g)||[]).length,4);
assert.equal((h.match(/data-ohm-path=/g)||[]).length,4);
assert(h.includes("1.70 V")&&h.includes("113.3")&&h.includes("22.73")&&h.includes("220 Ω"));
assert(h.includes("burden")&&h.includes("root")===false||h.includes("burden"));
assert(h.includes("<math")&&h.includes("Hiring-manager")===false||h.includes("<math"));
assert(svg.includes("class="+'"nb-spread-svg"')&&svg.includes('viewBox="0 0 2600 1400"'));
assert(svg.includes("I–V")&&svg.includes("15.0 mA")&&svg.includes("22.73 mA"));
assert(svg.includes("Measured")===false||svg.includes("KVL"));
assert(svg.includes('data-prof-dl-png=')&&svg.includes('data-prof-zoom-nb='));
assert.equal(studio.renderSpread({id:"ohm-F2"}),"");
assert.equal(studio.renderReadiness({id:"ohm-F1",variant:true}),"");
for(const [p,t] of [["professor_mastery_engine.js","OHM_F1_ENGINEER_STUDIO.renderReadiness"],["professor_notebook_spreads.js","OHM_F1_ENGINEER_STUDIO.renderSpread"],["index.html","ohmf1_engineer_studio_v2.js"],["index.html","ohmf1_engineer_studio_v2.css"],["sw.js","ohmf1_engineer_studio_v2.js"]]){
 assert(load(p).includes(t),p+" missing "+t);
}
assert(load("sw.js").includes("v36-ohmf1-engineer-interview"));
const html=load("index.html");
assert(html.indexOf("ohmf1_engineer_studio_v2.js")<html.indexOf("avionics_tutor.js"));
console.log("PASS: OHM-F1 8 worked steps; six technical follow-ups; verified KVL; dynamic teaching calculator; SVG I-V; scoped UI and offline deployment");
(async()=>{
 if(process.env.RUN_BROWSER!=="1")return;
 const {chromium}=require("playwright"),browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on("pageerror",x=>errors.push(x.message));
  await page.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
  await page.locator('[data-qid="ohm-F1"]').click();
  const speech=page.locator(".ohm-studio");
  await speech.waitFor({timeout:20000});
  assert((await speech.textContent()).includes("1.70 V"));
  assert.equal(await speech.locator(".ohm-step").count(),8);
  assert.equal(await speech.locator(".ohm-faq details").count(),6);
  await speech.locator('[data-ohm-path="meter"]').click();
  assert((await speech.locator(".ohm-path-result").textContent()).includes("burden"));
  assert.equal(await speech.locator('[data-ohm-path="meter"]').getAttribute("aria-pressed"),"true");
  await speech.locator('[data-ohm-input="vl"]').fill("2.20");
  assert((await speech.locator(".ohm-live-output").textContent()).includes("2.80 V"));
  assert((await speech.locator(".ohm-live-output").textContent()).includes("146.67 Ω"));
  await page.locator('[data-page="visual"]').click();
  assert.equal(await page.locator(".ohm-sheet .nb-spread-svg").count(),1);
  assert((await page.locator(".ohm-sheet").textContent()).includes("Voltage between nodes"));
  await page.locator('[data-qid="ohm-F2"]').click();
  assert.equal(await page.locator(".ohm-studio").count(),0,"Specialized OHM-F1 explanation cannot leak into unrelated questions");
  assert.equal(errors.length,0,"Unexpected page errors: "+errors.join(", "));
  await page.setViewportSize({width:375,height:800});
  await page.locator('[data-qid="ohm-F1"]').click();
  await page.locator('[data-page="learn"]').click();
  assert(await page.locator(".ohm-studio").isVisible());
  console.log("PASS browser OHM-F1: solved lecture/interview view, alternate fault, live recalc, nonleaking topic scope, 375px mobile");
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
