'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

global.window = globalThis;
require(path.join(ROOT, 'nvidia_slt_data.js'));
require(path.join(ROOT, 'nvidia_slt_tutor.js'));

const meta = globalThis.NVIDIA_SLT_META;
const deck = globalThis.NVIDIA_SLT_MASTER_DECK;
const topics = globalThis.NVIDIA_SLT_TOPICS;
const questions = globalThis.NVIDIA_SLT_PREP_QUESTIONS || globalThis.NVIDIA_SLT_QUESTIONS;
const wb = globalThis.nvidiaSltWorkbook;

console.log('1. Checking NVIDIA_SLT_META and RTR compliance...');
assert.ok(meta && meta.roleTitle.includes('Santa Clara'));
assert.ok(meta.rtrBlock.includes('Tanisha Systems'));
assert.ok(meta.rtrBlock.includes('L&T Technology Services'));
assert.ok(meta.rtrBlock.includes('NVIDIA'));
assert.ok(meta.rtrBlock.includes('110k'));
assert.equal(meta.contractorBoundaries.length, 3);
assert.equal(meta.panelists.length, 5);

console.log('2. Checking 129 Master Interview Cards...');
assert.equal(deck.length, 129);
const deckIds = new Set();
const sections = new Set();
for (const card of deck) {
  assert.ok(card.id && !deckIds.has(card.id), `Duplicate card id ${card.id}`);
  deckIds.add(card.id);
  sections.add(card.section);
  assert.ok(card.whatISay.length > 20);
  assert.ok(card.deepTech.length > 20);
  assert.ok(Array.isArray(card.babySteps) && card.babySteps.length >= 1);
}
assert.equal(sections.size, 8);

console.log('3. Checking 12 topics x 50 questions = 600 unique items...');
assert.equal(topics.length, 12);
assert.equal(questions.length, 600);

const qIds = new Set();
const qPrompts = new Set();
let calcCount = 0;

for (const t of topics) {
  const list = questions.filter(q => q.topic === t.id);
  assert.equal(list.length, 50, `${t.id} should have 50 questions`);
  const skills = new Set();
  for (let i = 1; i <= 50; i++) {
    const q = list[i - 1];
    assert.equal(q.index, i, `${t.id} out of index order at ${i}`);
    assert.ok(!qIds.has(q.id), `Duplicate id ${q.id}`);
    qIds.add(q.id);
    const normP = q.question.trim().toLowerCase();
    assert.ok(!qPrompts.has(normP), `Duplicate prompt on ${q.id}`);
    qPrompts.add(normP);
    assert.ok(!skills.has(q.skillName), `Duplicate skill in ${t.id}: ${q.skillName}`);
    skills.add(q.skillName);

    const minSteps = q.index >= 41 ? 8 : 6;
    const steps = wb.stepsForQuestion(q);
    assert.ok(steps.length >= minSteps, `${q.id} has ${steps.length} < ${minSteps} steps`);

    // Verify all 3 SVG panels render uniquely for every single question
    for (let p = 0; p < 3; p++) {
      const svg = wb.renderVisual(q, p);
      assert.ok(svg.includes('<svg') && svg.includes('</svg>'), `${q.id} panel ${p} invalid SVG`);
      assert.ok(svg.includes(q.id.toUpperCase()), `${q.id} panel ${p} missing question ID tag`);
    }

    if (q.kind === 'calc') {
      calcCount++;
      const gOk = wb.gradeNumber(q, `${q.expected} ${q.unit}`);
      assert.equal(gOk.ok, true, `${q.id} base gradeNumber failed: ${gOk.reason}`);

      const gBad = wb.gradeNumber(q, `${q.expected === 0 ? 500 : q.expected * 3.7} ${q.unit}`);
      assert.equal(gBad.ok, false, `${q.id} accepted wrong number!`);

      const rolled = wb.rerollVariant(q, i * 17);
      assert.ok(Number.isFinite(rolled.expected), `${q.id} reroll gave non-finite expected`);
      const gRoll = wb.gradeNumber(rolled, String(rolled.expected));
      assert.equal(gRoll.ok, true, `${q.id} rerolled gradeNumber failed: ${gRoll.reason}`);
    } else {
      const gPass = wb.gradeText(q, `${q.modelAnswer} ${(q.rubricKeywords || []).join(' ')}`);
      assert.equal(gPass.ok, true, `${q.id} gradeText rejected model answer: ${gPass.reason}`);
      const gFail = wb.gradeText(q, 'i do not know');
      assert.equal(gFail.ok, false, `${q.id} gradeText passed garbage answer!`);
    }
  }
}
assert.equal(calcCount, 240);

console.log('4. Checking prefix unit conversion fidelity (mV<->V, mOhm<->Ohm, GHz<->MHz)...');
const vQ = questions.find(q => q.kind === 'calc' && q.unit === 'mV');
assert.ok(vQ && wb.gradeNumber(vQ, `${vQ.expected / 1000} V`).ok, 'mV -> V conversion failed');
const rQ = questions.find(q => q.kind === 'calc' && q.unit === 'mOhm');
assert.ok(rQ && wb.gradeNumber(rQ, `${rQ.expected / 1000} Ohm`).ok, 'mOhm -> Ohm conversion failed');
const fQ = questions.find(q => q.kind === 'calc' && q.unit === 'GHz');
assert.ok(fQ && wb.gradeNumber(fQ, `${fQ.expected * 1000} MHz`).ok, 'GHz -> MHz conversion failed');
assert.equal(wb.gradeNumber(vQ, `${vQ.expected} Hz`).ok, false, 'Mismatched family should fail');

console.log('5. Checking HTML / app.js / sw.js wiring & SW compatibility...');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const swJs = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

assert.ok(html.includes('data-mode="nvidia-slt"'));
assert.ok(html.includes('id="nvidia-sltView"'));
assert.ok(html.includes('id="nvidiaSltPrepRoot"'));
assert.ok(html.includes('nvidia_slt_data.js'));
assert.ok(html.includes('nvidia_slt_tutor.js'));
assert.ok(html.includes('nvidia_slt_tutor.css'));
assert.ok(!html.includes('tramcreamcoffee') && !html.includes('localhost'));

assert.ok(appJs.includes("'nvidia-slt'"));
assert.ok(appJs.includes('mountNvidiaSltPractice'));

assert.ok(swJs.includes('slt-study-studio-v35-nvidia-scenario-lab-r1'), 'Existing SW cache substring missing!');
assert.ok(swJs.includes('./nvidia_slt_data.js'));
assert.ok(swJs.includes('./nvidia_slt_tutor.js'));
assert.ok(swJs.includes('./nvidia_slt_tutor.css'));

console.log('ALL NVIDIA SLT PREP CHECKS PASSED! (600 Qs, 240 Calcs, 1800 SVG Panels, 129 Master Cards)');
