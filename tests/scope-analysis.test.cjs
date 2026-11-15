'use strict';
// Deterministic data-engine tests. Browser UI still needs independent visual checks.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('simulation/board/board_scope.js','utf8');
const script=source.replace('window.renderBoardScope=init;',
 'window.__scopeTest={thresholdCrossings,analyzeWave,renderSpectrum,renderXY,toCSV,widget};window.renderBoardScope=init;');
assert.notEqual(source,script,'Test hooks must be present');
const env={window:{}};
vm.runInNewContext(script,env,{filename:'board_scope.js'});
const {thresholdCrossings,analyzeWave,renderSpectrum,renderXY,toCSV,widget}=env.window.__scopeTest;
const run={id:'test',series_r:33,supply:1.2,nmos:true};
const rows=[];
for(let i=0;i<=480;i++){
 const t=i*.5;
 const sourceHigh=((t-1+8000)%80)<40?1.2:0;
 const gateHigh=((t-8+6000)%60)<30?3.3:0;
 const rx=sourceHigh*.6-(gateHigh>0?.22:0);
 rows.push([t,sourceHigh,sourceHigh*.85,0,rx,gateHigh,sourceHigh?3:0]);
}
const rising=thresholdCrossings(rows,run,0,.6,'rise',0);
const falling=thresholdCrossings(rows,run,0,.6,'fall',0);
assert.equal(rising.length,3,'three rising source pulses');
assert.equal(falling.length,3,'three falling source pulses');
assert.ok(Math.abs(rising[1]-rising[0]-80)<.01,'80 ns period');
assert.ok(Math.abs(falling[1]-falling[0]-80)<.01,'falling edges');
assert.equal(thresholdCrossings(rows,run,0,2,'rise',0).length,0,'out-of-range trigger must not invent a capture');
assert.equal(thresholdCrossings(rows,run,0,.6,'rise',100).length,2,'holdoff suppresses subsequent triggers');
const measures=analyzeWave(rows,run,0,0,240);
assert.ok(Math.abs(measures.period-80)<.01,'period from crossings');
assert.ok(Math.abs(measures.duty-50)<.1,'duty-cycle measurement');
assert.ok(measures.rise>=0 && measures.fall>=0,'edge times nonnegative');
const spectral=renderSpectrum(rows,run,0,0,240);
assert.ok(spectral.svg.includes('<path'),'DFT renders a trace');
assert.ok(Math.abs(spectral.peak-12.5)<=1000/240,'dominant pulse frequency approximately 12.5 MHz');
const xy=renderXY(rows,run,4,2,0,240);
assert.ok(xy.includes('Itrace') && xy.includes('Vrx'),'XY plot channel labels');
const csv=toCSV(rows.slice(0,5),run);
assert.equal(csv.split('\n').filter(x=>x&&!x.startsWith('#')).length,6,'CSV header and five numeric sample rows');
assert.ok(csv.includes('Pseries_mW'),'derived channel distinctly labeled');
const html=widget();
for(const id of ['bsEdge','bsTrigMode','bsHoldoff','bsAutoset','bsSpectrum','bsXY','bsExportCSV','bsExportSVG']){
 assert.ok(html.includes('id="'+id+'"'),'missing interactive control '+id);
}
assert.match(fs.readFileSync('index.html','utf8'),/board_scope\.js\?v=11/);
assert.match(fs.readFileSync('sw.js','utf8'),/slt-study-studio-v11/);
const manifest=JSON.parse(fs.readFileSync('simulation/board/board_cycles_verification.json','utf8'));
assert.equal(manifest.duration_ns,240);
assert.equal(manifest.cases.length,48);
assert.equal(new Set(manifest.cases.map(x=>x.id)).size,48);
for(const item of manifest.cases){
 assert.ok(fs.existsSync('simulation/board/'+item.id+'.cir'),'missing circuit '+item.id);
 assert.ok(fs.existsSync('simulation/board/'+item.id+'.dat'),'missing original transient '+item.id);
 assert.ok(item.sha256.length===64 && item.sample_count>100,'bad provenance manifest '+item.id);
}
console.log('PASS: sample edge detection, holdoff, 80ns period, duty, no-trigger, DFT, XY, CSV, controls, offline version, 48 SPICE cases');
