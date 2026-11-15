'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {chromium}=require('playwright');
const source=fs.readFileSync('simulation/rtl_vcd_lab.js','utf8');
const ctx={window:{},console};
vm.runInNewContext(source,ctx);
const vcd=[
'$date today $end',
'$timescale 1ns $end',
'$scope module top $end',
'$var wire 1 ! clock $end',
'$var wire 13 " count [12:0] $end',
'$var wire 16 # BestDist [15:0] $end',
'$var wire 8 $ AddressR [7:0] $end',
'$upscope $end','$enddefinitions $end',
'#0','0!','b0000000000000 "','b1111111111111111 #','b00000000 $',
'#5','1!','#10','0!','b0000100000000 "','b1111111100000000 #','b00000001 $',
'#15','1!','#20','0!','b0000100000001 "','b0000000000000000 #','b00000010 $'
].join('\n');
const data=ctx.window.parseLocalVcd(vcd);
assert.equal(data.signals.length,4);
assert.equal(data.duration,20);
assert.ok(data.signals.some(x=>x.name==='top.BestDist'&&x.width===16));
assert.equal(data.signals.find(x=>x.name==='top.AddressR').data.at(-1)[1],'00000010');
const bad=ctx.window.parseLocalVcd.bind(null,'$timescale 1ns $end\n$enddefinitions $end\n#5\n1?');
assert.throws(bad,/No scalar or vector/);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:850},acceptDownloads:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#flip').click();
   await page.locator('[data-note-page="1"]').click();
   await page.locator('#ixLinkB').waitFor({state:'attached',timeout:18000});
   const cursors=async()=>page.evaluate(()=>{const r=document.querySelector('[data-instrument]');return {a:Number(r.querySelector('#ixA').value),b:Number(r.querySelector('#ixB').value)}});
   const initial=await cursors();
   await page.evaluate(()=>{const x=document.querySelector('#ixA');x.value=Number(x.value)+5;x.dispatchEvent(new Event('input',{bubbles:true}))});
   const moved=await cursors();
   assert.ok(moved.a>initial.a,'A moved');
   assert.ok(moved.b>initial.b,'linked B followed A');
   assert.equal(await page.locator('#ixPlot [data-marker="A"]').count(),4,'A dots on four channels');
   assert.equal(await page.locator('#ixPlot [data-marker="B"]').count(),4,'B dots on four channels');
   assert.equal(await page.locator('#ixAtCursor tbody tr').count(),4,'four channel A/B table');
   await page.locator('#ixLinkB').click();
   const before=await cursors();
   await page.evaluate(()=>{const x=document.querySelector('#ixA');x.value=Number(x.value)+3;x.dispatchEvent(new Event('input',{bubbles:true}))});
   const unlinked=await cursors();
   assert.ok(unlinked.a>before.a&&unlinked.b===before.b,'B independent when unlinked');
   const file={name:'verified_fixture.vcd',mimeType:'text/plain',buffer:Buffer.from(vcd)};
   await page.locator('#rtlVcdFile').setInputFiles(file);
   await page.locator('#rtlVcdSvg [data-vcd-marker="A"]').first().waitFor({state:'attached'});
   assert.equal(await page.locator('#rtlVcdAB tbody tr').count(),4,'4 native VCD signal rows');
   assert.match(await page.locator('#rtlVcdSvg').innerText(),/0x|1|0/);
   assert.match(await page.locator('#rtlVcdNotice').innerText(),/source transitions/);
   if(width===1280){
    const board=page.locator('#bsLinkB');
    if(await board.count()){
     const result=await page.evaluate(()=>{const x=document.querySelector('#blProScope');return {a:x?.__boardScope?.a,b:x?.__boardScope?.b}});
     await page.locator('#bsLinkB').click();
     assert.equal(await page.locator('#bsLinkB').getAttribute('aria-pressed'),'false');
     assert.ok(result.a!==undefined);
    }
   }
   assert.deepEqual(errors,[],'no browser page exceptions');
   console.log('PASS v13 at '+width+'px: dual cursor, four lane dots, per-channel table, local VCD bus decode');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
