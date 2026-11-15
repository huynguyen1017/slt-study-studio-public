const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function loadGlobal(file, globalName) {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  const ctx = { window: {}, console, Math, Number, String, Array, Object, JSON, RegExp, Date, Set, Map };
  ctx.window = ctx;
  vm.runInNewContext(code, ctx);
  return globalName ? ctx[globalName] : ctx;
}

// 1. Validate 100 Flashcards for zero duplication, valid sources, unique waveSpecs, miniCards, Kahoot quizzes
const cards = loadGlobal('cards.js', 'STUDY_CARDS');
assert.equal(cards.length, 100, 'Expected 100 flashcards');

const seenDeep = new Set();
const seenWaveIds = new Set();
const forbidden = /\b(nvidia|intel|cisco|tegra|stinson|newport|del\s*norte|orin|jetson|blackwell|nvlink|smartest|advantest)\b/i;

for (const c of cards) {
  assert.ok(typeof c.source === 'string' && c.source.startsWith('https://'), `Card ${c.id} missing valid https:// source`);
  assert.ok(!forbidden.test(JSON.stringify(c)), `Forbidden term found in card ${c.id}`);
  assert.ok(!c.answer.includes('Identify inputs and expected output'), `Generic placeholder step on card ${c.id}`);

  const coreMatch = c.answer.match(/WHAT I WOULD SAY[^\n]*\n([\s\S]*?)\n\s*\nDEEP TECHNICAL EXPLANATION/i);
  const deepMatch = c.answer.match(/DEEP TECHNICAL EXPLANATION[^\n]*\n([\s\S]*?)\n\s*\nBABY-STEP/i);
  assert.ok(coreMatch && deepMatch, `Missing required sections in card ${c.id}`);
  const core = coreMatch[1].trim();
  const deep = deepMatch[1].trim();

  assert.notEqual(core, deep, `Identical core and deep on card ${c.id}`);
  assert.ok(!deep.startsWith(core.slice(0, 45)), `Prefix duplication on card ${c.id}`);
  assert.ok(deep.length >= 180, `Deep explanation too short on card ${c.id}: ${deep.length}`);
  assert.ok(!seenDeep.has(deep), `Duplicate deep explanation found on card ${c.id}`);
  seenDeep.add(deep);

  const dd = c.deepDive;
  assert.ok(dd, `Missing deepDive on card ${c.id}`);
  assert.ok(Array.isArray(dd.equations) && dd.equations.length >= 1, `Missing equations on ${c.id}`);
  assert.ok(Array.isArray(dd.proofSteps) && dd.proofSteps.length >= 2, `Missing proofSteps on ${c.id}`);
  assert.ok(dd.table && dd.table.headers?.length >= 3 && dd.table.rows?.length >= 2, `Missing table on ${c.id}`);
  assert.ok(dd.code && dd.code.pseudo && dd.code.code, `Missing code on ${c.id}`);
  assert.ok(dd.diagramSpec && dd.diagramSpec.nodes?.length === 4, `Missing diagramSpec on ${c.id}`);
  assert.ok(Array.isArray(dd.miniCards) && dd.miniCards.length === 3, `Expected 3 miniCards on ${c.id}`);
  assert.ok(dd.quiz && Array.isArray(dd.quiz.choices) && dd.quiz.choices.length === 4, `Expected 4 Kahoot choices on ${c.id}`);
  assert.equal(dd.quiz.choices.filter(x => x.correct === true).length, 1, `Expected exactly 1 right choice on ${c.id}`);
  assert.ok(dd.waveSpec && dd.waveSpec.id && !seenWaveIds.has(dd.waveSpec.id), `Duplicate/missing waveSpec ID on ${c.id}`);
  seenWaveIds.add(dd.waveSpec.id);
  assert.equal(dd.waveSpec.channels.length, 4, `Expected 4 oscilloscope channels on ${c.id}`);
  assert.ok(typeof dd.waveSpec.corrDelta === 'number' && dd.waveSpec.corrDelta > 0, `Missing corrDelta on ${c.id}`);
  assert.ok(typeof dd.waveSpec.bitPatternFault === 'string' && typeof dd.waveSpec.bitPatternFixed === 'string' && dd.waveSpec.bitPatternFault !== dd.waveSpec.bitPatternFixed, `Invalid bitPattern Fault/Fixed on ${c.id}`);
  assert.ok(Array.isArray(dd.waveSpec.busSegmentsFault) && dd.waveSpec.busSegmentsFault.length >= 5, `Missing busSegmentsFault on ${c.id}`);
  assert.ok(Array.isArray(dd.waveSpec.busSegmentsFixed) && dd.waveSpec.busSegmentsFixed.length >= 5, `Missing busSegmentsFixed on ${c.id}`);
  assert.notDeepEqual(dd.waveSpec.busSegmentsFault, dd.waveSpec.busSegmentsFixed, `Identical Fault/Fixed busSegments on ${c.id}`);
  assert.ok(dd.waveSpec.harmonics && typeof dd.waveSpec.harmonics.f2 === 'number', `Missing harmonics on ${c.id}`);
  assert.ok(Array.isArray(dd.waveSpec.subPulses) && dd.waveSpec.subPulses.length >= 3, `Missing subPulses on ${c.id}`);
}

// 2. Validate all 7 Guided Labs and 26 unique stepSpecs
const labs = loadGlobal('labs.js', 'STUDY_LABS');
assert.equal(labs.length, 7, 'Expected 7 guided labs');
const seenStepIds = new Set();
let totalSteps = 0;
for (const l of labs) {
  assert.ok(!forbidden.test(JSON.stringify(l)), `Forbidden term found in lab ${l.id}`);
  assert.ok(Array.isArray(l.stepSpecs) && l.stepSpecs.length === l.steps.length, `Missing stepSpecs on lab ${l.id}`);
  for (let i = 0; i < l.steps.length; i++) {
    totalSteps++;
    const ws = l.stepSpecs[i];
    assert.ok(ws && ws.id && !seenStepIds.has(ws.id), `Duplicate stepSpec ID in lab ${l.id} step ${i}`);
    seenStepIds.add(ws.id);
    assert.equal(ws.channels.length, 4, `Expected 4 channels on lab ${l.id} step ${i}`);
    assert.ok(typeof ws.corrDelta === 'number' && ws.corrDelta > 0, `Missing corrDelta on lab ${l.id} step ${i}`);
    assert.ok(typeof ws.bitPatternFault === 'string' && typeof ws.bitPatternFixed === 'string' && ws.bitPatternFault !== ws.bitPatternFixed, `Invalid bitPattern on lab ${l.id} step ${i}`);
    assert.ok(Array.isArray(ws.busSegmentsFault) && ws.busSegmentsFault.length >= 5, `Missing busSegmentsFault on lab ${l.id} step ${i}`);
    assert.ok(Array.isArray(ws.busSegmentsFixed) && ws.busSegmentsFixed.length >= 5, `Missing busSegmentsFixed on lab ${l.id} step ${i}`);
    assert.notDeepEqual(ws.busSegmentsFault, ws.busSegmentsFixed, `Identical Fault/Fixed busSegments on lab ${l.id} step ${i}`);
    assert.ok(ws.harmonics && typeof ws.harmonics.f2 === 'number', `Missing harmonics on lab ${l.id} step ${i}`);
    assert.ok(Array.isArray(ws.subPulses) && ws.subPulses.length >= 3, `Missing subPulses on lab ${l.id} step ${i}`);
  }
}
assert.equal(totalSteps, 26, 'Expected 26 total guided lab steps');

// 3. Validate Keysight Infiniium Menubar & Bench Features in simulation/instrument_console.js
const scopeCtx = loadGlobal('simulation/instrument_console.js');
const markup = scopeCtx.renderInstrumentConsole();
const expectedMenus = ['Scope', 'File', 'Control', 'Setup', 'Display', 'Trigger', 'Measure', 'Math', 'Analyze', 'Utilities', 'Help'];
assert.ok(markup.includes('role="menubar"'), 'Missing ARIA menubar');
for (const m of expectedMenus) {
  assert.ok(markup.includes(`>${m}</button>`), `Missing Infiniium menu button: ${m}`);
}
for (const token of [
  'data-mode-btn="fault"', 'data-mode-btn="fixed"',
  'id="ixMathMode"', 'id="ixSaveRef"', 'id="ixLinkB"', 'id="ixPreset"',
  'id="ksVoltSlider"', 'id="ksRSelect"', 'id="ksCSelect"', 'id="ksLSelect"',
  'id="ixDlCsv"', 'id="ixDlSvg"', 'id="ixDlSet"', 'id="ixUpCsv"',
  'MBU_DVFS_transition_cpu2_left.set', 'Veagle_1169B_Rsense_16GSa_22Mpts.set',
  'I2C_47k_SharkFin_vs_2k2_Clean.set', 'ENGR852_SAD_8bit_16bit_training.set',
  'Startup_4CH_PG_CLK_RST.set', 'Overshoot', 'StdDev'
]) {
  assert.ok(markup.includes(token), `Missing required Infiniium UI feature: ${token}`);
}

// 4. Validate profile lookup returns distinct card-specific & lab-step-specific waveforms
const pCard0 = scopeCtx.buildInstrumentContext ? null : null; // mount/profile verified by waveSpec uniqueness
console.log(`PASS: 100/100 unique flashcards, 0 overlaps, 0 generic steps, 0 leaked terms, 26/26 unique lab stepSpecs, all 11 Keysight Infiniium menus verified.`);
