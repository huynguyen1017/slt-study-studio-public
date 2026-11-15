'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const launchOpts={headless:true,args:['--no-sandbox']};
 if(process.env.PW_EXEC)launchOpts.executablePath=process.env.PW_EXEC;
 const browser=await chromium.launch(launchOpts);
 try{
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#flip').click();
   await page.locator('[data-note-page="1"]').click();
   const scope=page.locator('#blProScope [data-board-scope]');
   await scope.waitFor({timeout:30000});
   await page.locator('#bsSpectrum path').first().waitFor({state:'attached',timeout:20000});
   assert.ok(await page.locator('#bsXY path').count()>0,'XY plot renders');
   assert.equal(await page.locator('#bsAnalysisCh').inputValue(),'2');
   await page.locator('#bsAnalysisCh').selectOption('0');
   assert.match(await page.locator('#bsAdvancedMeasurements').innerText(),/Period/);
   await page.locator('#bsEdge').selectOption('fall');
   await page.locator('#bsTrigMode').selectOption('normal');
   await page.locator('#bsTrigLevel').fill('0.6');
   await page.locator('#bsTrigLevel').press('Tab');
   await page.locator('#bsSingle').click();
   assert.match(await page.locator('#bsState').innerText(),/SINGLE CAPTURE/,'falling-edge single acquisition');
   await page.locator('#bsTrigLevel').fill('99');
   await page.locator('#bsTrigLevel').press('Tab');
   await page.locator('#bsSingle').click();
   assert.match(await page.locator('#bsState').innerText(),/NO MATCHING TRIGGER/,'no fabricated trigger when no crossing');
   await page.locator('[data-bs-coupling="2"]').selectOption('AC');
   assert.equal(await page.locator('[data-bs-coupling="2"]').inputValue(),'AC');
   await page.locator('[data-bs-invert="2"]').check();
   assert.ok(await page.locator('[data-bs-invert="2"]').isChecked());
   await page.locator('[data-bs-offset="2"]').fill('0.2');
   await page.locator('[data-bs-offset="2"]').press('Tab');
   assert.equal(await page.locator('[data-bs-offset="2"]').inputValue(),'0.2');
   await page.locator('#bsAutoset').click();
   assert.equal(await page.locator('#bsEdge').inputValue(),'rise');
   assert.equal(await page.locator('#bsTrigMode').inputValue(),'auto');
   const downloadPromise=page.waitForEvent('download');
   await page.locator('#bsExportCSV').click();
   const download=await downloadPromise;
   assert.match(download.suggestedFilename(),/\.csv$/);
   if(width<500){
    assert.ok(await page.locator('#bsMobile svg').count()>=4,'mobile waveforms rendered');
    assert.ok(await page.locator('#bsMobile .ks-corr-line').count()>=4,'mobile board scope correlation lines');
    assert.ok(await page.locator('#bsMobile .ks-marker-b-dot').count()>=4,'mobile board scope Marker B dots');
    assert.ok(await page.locator('#siMobilePlot .ks-corr-line').count()===4,'mobile SI scope 4-ch correlation lines');
    assert.ok(await page.locator('#ixMobile .ks-corr-line').count()===4,'mobile Infiniium 4-ch correlation lines');
   }else{
    assert.ok(await page.locator('#bsLarge .ks-corr-line').count()>=4,'board scope multi-channel correlation lines');
    assert.ok(await page.locator('#bsLarge .ks-marker-b-dot').count()>=4,'board scope Marker B sample dots');
    assert.ok(await page.locator('#siPlot .ks-corr-line').count()===4,'SI scope 4-ch correlation lines');
    assert.ok(await page.locator('#siPlot .ks-marker-b-dot').count()===4,'SI scope 4-ch Marker B dots');
    assert.ok(await page.locator('#ixPlot .surfer-bus-seg').count()>=4,'Infiniium Surfer hex bus envelopes');
    assert.ok(await page.locator('#ixPlot .surfer-bit-lbl').count()>=4,'Infiniium Surfer 0/1 bit labels');
    assert.ok(await page.locator('#ixPlot .ks-corr-line').count()===4,'Infiniium 4-ch Marker B correlation lines');
    assert.ok(await page.locator('#ixPlot .ks-marker-b-dot').count()===4,'Infiniium 4-ch Marker B sample dots');
   }
   // Verify proactive Marker B correlation on all 3 scopes
   assert.equal(await page.locator('#bsLinkB').getAttribute('aria-pressed'),'true');
   const bsB0=await page.locator('#bsTimeB').innerText();
   await page.evaluate(()=>{const el=document.querySelector('#bsA');el.value='62.5';el.dispatchEvent(new Event('input',{bubbles:true}));});
   assert.notEqual(await page.locator('#bsTimeB').innerText(),bsB0,'board scope Marker B moves proactively when A moves');
   assert.equal(await page.locator('[data-si-ch]').count(),4,'SI scope has 4 channel toggles');
   assert.equal(await page.locator('#spLinkB').getAttribute('aria-pressed'),'true');
   const spB0=await page.locator('#spBT').innerText();
   await page.evaluate(()=>{const el=document.querySelector('#spA');el.value='7.25';el.dispatchEvent(new Event('input',{bubbles:true}));});
   assert.notEqual(await page.locator('#spBT').innerText(),spB0,'SI scope Marker B moves proactively when A moves');
   assert.equal(await page.locator('#ixLinkB').getAttribute('aria-pressed'),'true');
   const ixB0=await page.locator('#ixBLabel').innerText();
   await page.evaluate(()=>{const el=document.querySelector('#ixA');el.value=String((Number(el.max)*0.55).toFixed(2));el.dispatchEvent(new Event('input',{bubbles:true}));});
   assert.notEqual(await page.locator('#ixBLabel').innerText(),ixB0,'Infiniium Marker B moves proactively when A moves');
   // v12/v13 checks: Infiniium menubar, Deep-Dive sub-tabs, mini-flashcards, Kahoot check, Guided Labs step waveform
   await page.locator('[data-ks-menu="setup"]').first().click();
   assert.equal(await page.locator('[data-ks-menu="setup"]').first().getAttribute('aria-expanded'),'true');
   await page.locator('#ksDrawer [data-close]').first().click().catch(()=>{});
   await page.locator('[data-dd-tab="quiz"]').click();
   assert.equal(await page.locator('[data-dd-tab="quiz"]').getAttribute('aria-selected'),'true');
   await page.locator('[data-mini-idx="0"]').click();
   assert.equal(await page.locator('[data-mini-idx="0"]').getAttribute('aria-pressed'),'true');
   await page.locator('[data-kidx="0"]').click();
   await page.locator('#nbKahootFb').waitFor({state:'visible',timeout:5000});
   await page.locator('[data-mode="labs"]').click();
   await page.locator('[data-lab="reset"]').click();
   await page.locator('#labPlayer [data-instrument]').waitFor({state:'visible',timeout:10000});
   assert.deepEqual(errors,[],'no unhandled browser exceptions');
   console.log('PASS browser width='+width+': notebook, board scope, Infiniium menus, sub-tabs, mini-cards, Kahoot, labs');
   await page.close();
  }
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
