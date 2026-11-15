'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

// 0. Privacy & Syntax Verification on New v15 Modules
const forbidden = /\b(nvidia|intel|cisco|tegra|stinson|newport|del\s*norte|orin|jetson|blackwell|nvlink|smartest|advantest)\b/i;
for (const file of [
  'simulation/math_format.js',
  'simulation/keysight_manual_bench.js',
  'simulation/code_methodology.js',
  'simulation/stm32_ide_studio.js',
  'simulation/lab_bench_studio.js'
]) {
  const txt = fs.readFileSync(file, 'utf8');
  assert.ok(!forbidden.test(txt), `Forbidden term found in ${file}`);
}

(async () => {
  const launchOpts = { headless: true, args: ['--no-sandbox'] };
  if (process.env.PW_EXEC) launchOpts.executablePath = process.env.PW_EXEC;
  const browser = await chromium.launch(launchOpts);
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, acceptDownloads: true });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto('http://127.0.0.1:8765/', { waitUntil: 'domcontentloaded' });

      // Reveal first card and enter Page 2 Deep Dive
      await page.locator('#flip').click();
      await page.locator('[data-note-page="1"]').click();

      // Req 3: ENGR 852 Stacked MathML Equations
      await page.locator('.formula-card math[display="block"] mfrac').first().waitFor({ state: 'attached', timeout: 10000 });
      assert.ok(await page.locator('.hw-eq-wrap').count() >= 1, 'Stacked ENGR 852 HW formula cards rendered');
      assert.ok(await page.locator('.formula-card math[display="block"] mfrac').count() >= 1, 'Stacked horizontal fraction <mfrac> rendered');

      // Req 1: Keysight Manual Controls, Utilities, MathML & Interactive Probe Selection
      await page.locator('#kmProbeStudio').waitFor({ state: 'visible', timeout: 10000 });
      assert.ok(await page.locator('#kmBoardMap [data-tp-id]').count() >= 5, 'Board test points TP1-TP5 rendered');
      assert.ok(await page.locator('#kmProbe0').count() === 1 && await page.locator('#kmProbe3').count() === 1, '4 probe selectors rendered');
      assert.ok(await page.locator('#kmDeskew').count() === 1 && await page.locator('#kmMask').count() === 1, 'Deskew & Pass/Fail Mask utilities rendered');
      assert.ok(await page.locator('#kmMathFormula math').count() >= 1, 'Keysight MathML formula rendered');
      await page.locator('#kmProbe1').selectOption('passive_10x_alligator');
      assert.match(await page.locator('#kmProbeDiag').innerText(), /145 nH|alligator|loop inductance/i, 'Selecting alligator ground clip flags inductance diagnostic');
      await page.locator('#kmCpu').click();
      assert.match(await page.locator('#kmProbeDiag').innerText(), /Verified/i, 'CPU2 reset verifies documented 4-CH Keysight setup');

      // Req 4: 5-Part Code Methodology (including password_strength & failures dict)
      assert.ok(await page.locator('.cm-sig-box').count() >= 1, 'Section 1 signature box rendered');
      assert.ok(await page.locator('.cm-pseudo-box').count() >= 1, 'Section 2 pseudocode box rendered');
      assert.ok(await page.locator('.cm-code-box').count() >= 1, 'Section 3 line-commented code box rendered');
      assert.ok(await page.locator('.cm-methods-table').count() >= 1, 'Section 4 method rationale table rendered');
      assert.ok(await page.locator('.cm-trace-box').count() >= 1, 'Section 5 trace table & complexity rendered');
      await page.locator('[data-cm-mode="password_strength"]').click();
      const pwText = await page.locator('[data-cm-view="password_strength"]').innerText();
      assert.match(pwText, /password_strength\(password, k\)/, 'Exact password_strength(password, k) signature present');
      assert.match(pwText, /for j in range\(k\):/, 'Corrected inner loop j in range(k) present');
      assert.match(pwText, /input\(\)/, 'Built-in method table covers input()');
      assert.match(pwText, /\.sort\(\)/, 'Built-in method table covers .sort()');

      // Req 5: Multi-Language Terminal IDE + STM32CubeMX Pin Configurator
      await page.locator('#ideStudio').waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('#idePresetSelect').selectOption('py_password_strength');
      await page.locator('#ideRunBtn').click();
      assert.match(await page.locator('#ideStdout').innerText(), /PASS/i, 'Python password_strength executes to PASS in terminal');
      await page.locator('#ideBugBtn').click();
      assert.match(await page.locator('#ideStderr').innerText(), /substring\s*=\s*" "|Shadows|Undefined/i, 'Loading buggy code catches screenshot bugs in stderr terminal');
      await page.locator('#ideFixBtn').click();
      assert.match(await page.locator('#ideStderr').innerText(), /0 errors/i, 'Restoring verified fix clears stderr errors');
      await page.locator('#idePresetSelect').selectOption('stm32_engr844_lab1');
      await page.locator('#idePinSvg [data-mcu-pin="PC13"]').click();
      assert.match(await page.locator('#idePinInspector').innerText(), /PC13/, 'Clicking CubeMX pin PC13 updates inspector');
      await page.locator('#ideGenPinBtn').click();
      assert.match(await page.locator('#ideStdout').innerText(), /firmware\.elf/i, 'STM32 HAL build outputs binary size & USART2 telemetry');
      await page.locator('[data-ide-lang="verilog"]').click();
      await page.locator('#ideRunBtn').click();
      assert.match(await page.locator('#ideStdout').innerText(), /Verdi FSDB|vcs/i, 'Verilog language tab simulates cleanly');

      // Req 2: Coursework Breadboard Simulator & 7-Step Live Lab Report Studio
      await page.locator('#lbStudio').waitFor({ state: 'visible', timeout: 10000 });
      assert.match(await page.locator('#lbLiveSummary').innerText(), /869\.73/, 'Tech 60 Lab 7 default circuit calculates exact R_T = 869.73 Ohm');
      assert.ok(await page.locator('#lbBreadboardSvg rect').count() > 10, 'Physical breadboard + EDU36311A/EDU34450A SVG rendered');
      for (const preset of ['tech60_lab5_pulse', 'phys2b_rc_neon', 'engr844_stm32_bench', 'engr852_rtl_sad']) {
        await page.locator('#lbPresetSelect').selectOption(preset);
        assert.ok((await page.locator('#lbCompTbody tr').count()) >= 3, `Preset ${preset} populated comparison table`);
      }
      const mdPromise = page.waitForEvent('download');
      await page.locator('#lbExportMd').click();
      const mdDl = await mdPromise;
      assert.match(mdDl.suggestedFilename(), /-lab-report\.md$/, 'Lab report Markdown download succeeded');

      assert.deepEqual(errors, [], 'Zero uncaught browser errors');
      console.log(`PASS v15 ${width}px: Stacked MathML, Keysight Probe Studio, 5-Part Code Methodology, STM32CubeMX Multi-Lang IDE, Coursework Breadboard & 7-Step Lab Report.`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
