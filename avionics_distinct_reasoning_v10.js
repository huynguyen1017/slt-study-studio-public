"use strict";
/* Progressive Foundations (F1-F5) and Troubleshooting (D1-D10) prompts and worked steps.
   Eliminates repetitive templates across consecutive F and D slots while keeping
   every textbook definition, worked cause/fix/verification chain, and combined
   series-parallel diagnostic reasoning aligned to difficulty 1..30. */
(function(){
 const T = window.AVIONICS_TOPICS || [], Q = window.AVIONICS_QUESTIONS || [];
 const SP_TOPICS = new Set(["series", "parallel", "kcl-kvl", "thevenin", "ohm", "power"]);

 const unitPrompts = {
  1: "State which unit is the SI base electrical unit (ampere, A) and which is derived (volt, V), and explain how to label instrument values clearly using quantity symbols vs. upright unit symbols.",
  2: "Explain the Milli prefix (m = 10^-3): convert 25 mA into 0.025 A, contrast the unit label change against the underlying physical current, and explain why wrong prefixes cause 1000x errors.",
  3: "Explain the Micro prefix (µ = 10^-6) in capacitance and timing: convert 47 µF into farads, and compare how micro-scale time and charge values behave in decoupling circuits.",
  4: "Compute and contrast Mega prefix scaling (M = 10^6) on high-value resistors (such as 2 MΩ = 2,000,000 Ω) versus kilo-ohm pull-ups during leakage and divider checks.",
  5: "Synthesize Measurement uncertainty across mixed SI ranges: explain how meter range selection, resolution, and calibration status combine before declaring a hardware PASS or FAIL."
 };

 const fStage = [
  (term, t, ex) => `Definition & Core Idea (Level 1 — Basics): What does "${term}" mean in ${t.title}, and what physical quantity or rule does it establish? Anchor your explanation with: ${ex}`,
  (term, t, ex) => `Physical Mechanism & Sign Convention (Level 2): Explain how "${term}" behaves physically inside a real board or cable, including what happens when polarity, direction, or scale flips.`,
  (term, t, ex) => `Quantitative Intuition & Circuit Law (Level 3): Without yet doing full troubleshooting, predict how changing component values shifts outcomes governed by "${term}" (${ex}).`,
  (term, t, ex) => `Design Boundary & Hardware Pitfall (Level 4): Identify the main physical assumption or hardware limit behind "${term}" that engineers miss when jumping straight from textbook diagrams to PCBA testing.`,
  (term, t, ex, isSP) => isSP
   ? `Combined Series-Parallel System Bridge (Level 5): Explain how "${term}" interacts across combined series stems and parallel branches on one avionics bus (${ex}).`
   : `Integrated Bench Synthesis (Level 5): Connect "${term}" with upstream power, signal integrity, and instrumentation loading in a multi-stage avionics test setup (${ex}).`
 ];

 const dPersonas = [
  // D1 (idx 0, Case 1 symptom)
  (row, t) => ({
   q: `Non-Destructive First Screen (Q21 · ${t.title}): You encounter the bench symptom — "${row[0]}" Before changing PSU limits or probing live pins, what visual, thermal-touch, and unpowered baseline inspection comes first?`,
   obj: `Power-off triage for: ${row[0]}`,
   title: `First Triage · ${row[0].replace(/\.$/,"")}`,
   sum: `Step 1 diagnostic screen focuses safely on ruling out obvious wiring, polarity, and short defects before energizing hardware.`,
   why: `Checking unpowered conditions prevents turning a minor wiring mistake into permanent silicon damage.`
  }),
  // D2 (idx 1, Case 1 verify)
  (row, t) => ({
   q: `Quantitative Pass/Fail Proof (Q22 · ${t.title}): Execute this independent verification check: ${row[3]} State exact numeric pass vs. fail bounds that prove nominal behavior.`,
   obj: `Quantitative confirmation: ${row[3]}`,
   title: `Live Proof · ${row[3].replace(/\.$/,"")}`,
   sum: `Independent verification requires predicting an expected numeric window beforehand and comparing it directly against the meter or scope.`,
   why: `A passing test is only valid when compared against an explicit quantitative prediction, not just guessing "looks normal".`
  }),
  // D3 (idx 2, Case 2 symptom)
  (row, t) => ({
   q: `Measurement & Instrument Artifact Check (Q23 · ${t.title}): Symptom observed — "${row[0]}" Before condemning a PCB component, how do you verify your DMM leads, ground reference, probe attenuation factor, or burden resistance didn't create a false reading?`,
   obj: `Rule out meter artifacts for: ${row[0]}`,
   title: `Probe & Setup Sanity · ${row[0].replace(/\.$/,"")}`,
   sum: `Many apparent circuit anomalies originate in test leads, floating grounds, 1x/10x probe mismatch, or wrong range selection.`,
   why: `Verifying the measurement chain prevents wasting hours replacing healthy board parts.`
  }),
  // D4 (idx 3, Case 2 verify)
  (row, t, isSP) => ({
   q: isSP
    ? `Series-Parallel Stage Isolation (Q24 · ${t.title}): Treating upstream series paths separately from downstream parallel branches, design a split-point measurement around "${row[3]}" to prove which side owns the anomaly.`
    : `Subsystem Half-Split Isolation (Q24 · ${t.title}): After narrowing down the anomaly, explain how executing "${row[3]}" splits the signal chain cleanly into known-good vs. suspect halves.`,
   obj: isSP ? `Series-parallel stage split: ${row[3]}` : `Half-split verification: ${row[3]}`,
   title: isSP ? `Series-Parallel Isolation · ${row[3].replace(/\.$/,"")}` : `Half-Split Check · ${row[3].replace(/\.$/,"")}`,
   sum: isSP ? `Separating series feed elements from parallel branch loads cuts combined-circuit debug steps in half.` : `Breaking a multi-stage circuit at its midpoint isolates faults systematically rather than probing pins at random.`,
   why: `Systematic boundary partitioning converges on root cause far faster than ad-hoc trial-and-error swaps.`,
   topo: isSP ? "series-parallel" : null
  }),
  // D5 (idx 4, Case 3 symptom)
  (row, t, isSP) => ({
   q: isSP
    ? `Open vs. Short Signature in Combined Networks (Q25 · ${t.title}): Facing "${row[0]}", contrast how a broken series stem affects downstream parallel branches versus how one shorted parallel leg collapses the entire node.`
    : `Open-Path vs. Leakage-Path Contrast (Q25 · ${t.title}): Given "${row[0]}", explain the unmistakable voltage and current fingerprints separating an unintended open circuit from a partial shunt leakage fault.`,
   obj: isSP ? `Series-parallel open vs short analysis: ${row[0]}` : `Contrast fault modes for: ${row[0]}`,
   title: `Fault Contrast · ${row[0].replace(/\.$/,"")}`,
   sum: `Series opens starve all downstream branches (high upstream V, zero current), whereas shunt shorts spike upstream current and drag nodes toward ground.`,
   why: `Distinguishing series opens from parallel shunts immediately directs your probe to the right physical net.`,
   topo: isSP ? "series-parallel" : null
  }),
  // D6 (idx 5, Case 3 verify)
  (row, t) => ({
   q: `Loaded vs. Unloaded Comparative Test (Q26 · ${t.title}): Run the check "${row[3]}" both unloaded and under nominal operating load. What hidden series resistance, contact corrosion, or driver current limit does that delta expose?`,
   obj: `Load-delta proof: ${row[3]}`,
   title: `No-Load vs Loaded · ${row[3].replace(/\.$/,"")}`,
   sum: `Open-circuit voltage often looks normal even across a damaged high-resistance joint; applying rated load converts hidden series Ω into measurable voltage droop.`,
   why: `Unloaded continuity or DMM checks routinely miss resistive solder joints and weak source stages.`
  }),
  // D7 (idx 6, Case 4 symptom)
  (row, t) => ({
   q: `Dynamic / Edge-Case Stress Trigger (Q27 · ${t.title}): Under bench load you observe: "${row[0]}" Why might a unit pass cold static DC tests at room temperature yet fail when current ramps, thermal soak warms traces, or clocks switch rapidly?`,
   obj: `Dynamic stress fault triage: ${row[0]}`,
   title: `Dynamic Stress Fault · ${row[0].replace(/\.$/,"")}`,
   sum: `Transient inrush, thermal resistance shift, slew-induced ringing, and parasitic bus capacitance expose defects invisible at steady DC ambient.`,
   why: `Qualification requires testing dynamic edges, load steps, and thermal corners — not just idle bench states.`
  }),
  // D8 (idx 7, Case 4 verify)
  (row, t) => ({
   q: `A/B Swap & Independent Second-Method Corroboration (Q28 · ${t.title}): Combine an A/B swap (or known-good fixture substitution) with "${row[3]}" to prove conclusively whether the DUT, cable harness, or test equipment caused the failure.`,
   obj: `Cross-method A/B proof: ${row[3]}`,
   title: `A/B Corroboration · ${row[3].replace(/\.$/,"")}`,
   sum: `True engineering root cause holds across independent test methods and survives swapping suspected external cables, sockets, or probes.`,
   why: `Fixture defects masquerading as DUT failures waste hardware spins when A/B verification is skipped.`
  }),
  // D9 (idx 8, Case 5 symptom)
  (row, t, isSP) => ({
   q: isSP
    ? `Combined Multi-Branch Fault Propagation (Q29 · ${t.title}): Symptom: "${row[0]}" Trace how a defect inside one combined series-parallel block propagates voltage/current shifts across adjacent series drops and parallel sibling branches.`
    : `Multi-Stage Cascaded Fault Propagation (Q29 · ${t.title}): Symptom: "${row[0]}" Explain how an upstream defect cascades symptoms downstream across dependent rails, timing margins, or bus peripherals, and prevent domino misdiagnosis.`,
   obj: isSP ? `Multi-branch fault escalation: ${row[0]}` : `System cascade fault trace: ${row[0]}`,
   title: `Cascaded Failure · ${row[0].replace(/\.$/,"")}`,
   sum: `Coupled networks transmit faults across stages: fixing downstream errors before stabilizing the upstream feeder or shared reference never resolves the root defect.`,
   why: `Always verify upstream rails, ground integrity, and reference sources first in coupled circuits.`,
   topo: isSP ? "series-parallel" : null
  }),
  // D10 (idx 9, Case 5 verify)
  (row, t) => ({
   q: `Final Verification & Regression Sign-Off (Q30 — Hardest · ${t.title}): To permanently close this class of failure, anchor on "${row[3]}", design a combined worst-case scenario test (temperature, load mix, tolerance, and guardband), and state objective closure criteria.`,
   obj: `System closure & guardband verification: ${row[3]}`,
   title: `Closure & Sign-Off · ${row[3].replace(/\.$/,"")}`,
   sum: `Q30 mastery closes the engineering loop: eliminate the root physical defect, prove worst-case scenario margin across combined operating modes, and archive repeatable evidence.`,
   why: `A one-off 'it worked once' retest without fixing margins and archiving verification records leaves flight/production units vulnerable to escape.`
  })
 ];

 for(const t of T){
  const tqs = Q.filter(q => q.topic === t.id);
  const f = tqs.filter(q => q.level === "Foundations");
  const d = tqs.filter(q => q.level === "Troubleshooting");
  const isSP = SP_TOPICS.has(t.id);

  f.forEach((q, i) => {
   const [term, def, why, ex] = t.skills[i];
   if(t.id === "units"){
    q.question = unitPrompts[i + 1];
   } else {
    q.question = fStage[i](term, t, ex, isSP);
   }
   q.learningObjective = `Step ${i+1}/30: ${term} — ${def.replace(/\.$/,"")}`;
   q.skillName = term;
   q.steps = [
    `Define clearly: ${def}`,
    `Explain why it governs real hardware: ${why}`,
    `Concrete anchor example: ${ex}`
   ];
   q.hint = `Master Level ${i+1} concept "${term}" before advancing to lab measurements.`;

   // Preserve bare Foundations cards on units-F1 (SI base card) and ohm-F1 (curriculum test)
   if((t.id === "units" && i === 0) || (t.id === "ohm" && i === 0)){
    delete q.lesson;
   } else {
    q.lesson = {
     title: term,
     summary: `Progressive Step ${i+1}: ${def} ${why}`,
     example: ex,
     why,
     vocab: [
      ["Concept", term],
      ["Core definition", def],
      ["Hardware application", ex]
     ]
    };
   }
   if(isSP && i === 4) q.topology = "series-parallel";
  });

  d.forEach((q, i) => {
   const row = t.cases[Math.floor(i / 2)]; // 0..4 paired cleanly across D1..D10
   const persona = dPersonas[i](row, t, isSP);
   q.question = persona.q;
   q.learningObjective = `Step ${21 + i}/30: ${persona.obj}`;
   q.steps = [
    `Observed condition / root cause: ${row[0]} Check carefully — ${row[1]}`,
    `Immediate containment & fix: ${row[2]}`,
    `Objective confirming check: ${row[3]}`
   ];
   q.hint = `${row[1]} Verify with: ${row[3]}`;
   q.lesson = {
    title: persona.title,
    summary: `Step ${21 + i}/30 · ${persona.sum}`,
    example: `Diagnostic action: ${row[2]} Verification proof: ${row[3]}`,
    why: persona.why,
    vocab: [
     ["Observed symptom", row[0]],
     ["Physical cause", row[1]],
     ["Verification rule", row[3]]
    ]
   };
   if(persona.topo) q.topology = persona.topo;
   else if(t.id !== "series" && t.id !== "parallel" && t.id !== "kcl-kvl" && t.id !== "thevenin") delete q.topology;
   delete q.formula;
   delete q.sub;
  });
 }
 window.AVIONICS_DISTINCT_CURRICULUM_VERSION = 10;
})();
