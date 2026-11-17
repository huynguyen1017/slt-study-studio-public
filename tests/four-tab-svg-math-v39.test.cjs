"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const ctx={window:{},document:undefined,Math,console};
vm.createContext(ctx);
for(const src of ["simulation/math_format.js","circuit_question_railroad_v2.js","professor_notebook_spreads.js"]){
 vm.runInContext(read(src),ctx,{filename:src});
}
const rr=ctx.window.CIRCUIT_CURRENT_QUESTION_RAILROAD;
assert(rr && typeof rr.renderStage==="function");
const q={id:"ohm-C9",question:"A 12 V rail is loaded by R = 2.4 kΩ. Find I in mA.",formula:"I = V / R",
 sub:"I = 12 V / (2.4 * 10^3 Ω) = 5 mA",expected:5,unit:"mA",steps:["Name nodes","Convert","Solve"]};
const old=JSON.stringify(q);
for(const stage of ["understand","visual","baby","try"]){
 const html=rr.renderStage(q,{title:"Ohm's Law"},stage);
 assert(html.includes("rrq-stage-"+stage)&&html.includes("ohm-C9"),stage+" missing question-specific heading");
 assert(html.includes("2.4 kΩ")||stage==="try",stage+" incorrect given");
 assert(html.includes("I")&&html.includes("R"),stage+" must present physical law");
 if(stage!=="try") assert(html.includes("rr-fraction")&&html.includes("rr-cancel"),stage+" should include genuine railroad conversions");
 if(stage==="try"){
  assert(!html.includes("Expected answer stored"),"Try must not disclose stored target");
  assert(!html.includes("= 5 mA"),"Try should hide solved expression");
  assert(html.includes("FORMULA ONLY"));
 }
}
assert.equal(JSON.stringify(q),old,"UI must be purely read-only, no change to stored questions/results");
const roll={...q,question:"A 9 V rail is loaded by R = 3 kΩ. Find current in mA.",sub:"I = 9 V/(3*10^3 Ω) = 3 mA",expected:3};
const rail=rr.renderStage(roll,{},"understand");
assert(rail.includes("3 kΩ")&&!rail.includes("2.4 kΩ"),"Dice panel must track rerolled values");

const book=ctx.window.PROFESSOR_NOTEBOOK_SPREADS;
const spec=book.buildDynamicSpreadSpec(q,{id:"ohm",title:"Ohm's Law"},false);
const svg=book.renderNotebookSpreadSVG(spec);
assert(svg.includes("nb-svg-factor-label"),"SVG must draw real source-dependent fraction-label rails");
assert(svg.includes("nb-eq-cancel-stroke"),"Exported diagram must contain drawn unit cancellation strokes");
assert(svg.includes("nb-svg-math-fraction"),"Actual SVG math must have a stacked numerator/denominator");
assert(svg.includes("nb-eq-fraction-rule"),"Exported diagram must contain a true horizontal fraction rule");
assert(svg.includes("2.4 kΩ")&&svg.includes("2400 Ω"),"Diagram must use the current circuit values");
assert(!/<foreignObject|<image\b|xlink:href\s*=/.test(svg),"Canvas export stays native SVG and offline");
const other={...q,question:"The load is 1.8 MΩ at 4 V.",formula:"I = (4 - V_A) / 1800000"};
const spec2=book.buildDynamicSpreadSpec(other,{id:"ohm",title:"Ohm's Law"},false);
const svg2=book.renderNotebookSpreadSVG(spec2);
assert(svg2.includes("1.8 MΩ")&&!svg2.includes("2.4 kΩ"),"Current PNG output may not use a prior question's givens");
assert(svg2.includes("nb-svg-math-fraction"),"Grouped voltage-drop numerator must be a true SVG fraction");
assert(read("professor_notebook_spreads.js").includes("Download Updated Live PNG"));
assert(!read("professor_notebook_spreads.js").includes("⬇️ Download Pre-Rendered PNG"));

const av=read("avionics_tutor.js"),nv=read("nvidia_slt_tutor.js");
for(const stage of ["understand","visual","baby","try"]){
 assert(av.includes('renderStage(q,t,"'+stage+'")'),"Avionics "+stage+" renderer missing");
 assert(nv.includes('renderStage(q,topicObj,"'+stage+'")'),"NVIDIA "+stage+" renderer missing");
}
const html=read("index.html"),sw=read("sw.js");
assert(html.includes("circuit_question_railroad_v2.css?v=3"));
assert(html.includes("circuit_question_railroad_v2.js?v=3"));
assert(sw.includes("v39-four-tabs-svg-equations"));
console.log("PASS v39 static: all 8 tab surfaces, source-specific SI conversions, hidden Try answers, live SVG fraction/cancel marks and updated PNG export.");

(async()=>{
 if(process.env.RUN_BROWSER!=="1")return;
 const {chromium}=require("playwright");
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:860}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:8765/#avionics",{waitUntil:"load"});
  await page.locator("#avionicsView .av-tutor").waitFor({timeout:30000});
  for(const [stage,tab] of [["understand","learn"],["visual","visual"],["baby","work"],["try","try"]]){
   await page.locator('#avionicsView [data-page="'+tab+'"]').first().click();
   await page.locator("#avionicsView .rrq-stage-"+stage).first().waitFor({timeout:20000});
   if(stage==="try") assert(!(await page.locator(".rrq-stage-try").textContent()).includes("Expected answer stored"));
  }
  await page.locator('#avionicsView [data-page="visual"]').click();
  const svg=page.locator("#avionicsView .nb-spread-svg").first();
  await svg.waitFor({timeout:20000});
  assert(await svg.locator(".nb-eq-fraction-rule").count()>0,"Browser-native SVG fractions missing");
  await page.setViewportSize({width:375,height:810});
  assert(await page.locator("#avionicsView .rrq-stage-visual").first().isVisible());
  await page.locator('[data-mode="nvidia-slt"]').first().click();
  await page.locator("#nvidia-sltView .nv-subtab").first().waitFor({timeout:30000});
  for(const [stage,index] of [["understand",1],["visual",2],["baby",3],["try",4]]){
   await page.locator('#nvidia-sltView [data-ptab="'+index+'"]').click();
   await page.locator("#nvidia-sltView .rrq-stage-"+stage).first().waitFor({timeout:30000});
  }
  assert.equal(errors.length,0,errors.join("; "));
  console.log("PASS v39 browser: Avionics and NVIDIA four-tab visual/math/try layout, native SVG, mobile 375px.");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
