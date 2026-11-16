"use strict";
/* Progressive engineering calculation curriculum for all 23 avionics topics.
   Replaces repetitive statistical wrappers on C2-C5 and C7-C10 with genuinely
   distinct, progressively harder calculations (including combined series-parallel
   circuits), moves similar single-concept variations into q.variantPool for the
   "Practice New Numbers" dice, and ensures every sub expression evaluates cleanly. */
(function(){
 const qs = (typeof window !== "undefined" ? window : globalThis).AVIONICS_QUESTIONS;
 if(!Array.isArray(qs)) return;

 const roundSig = (v) => Number(Number(v).toPrecision(10));

 // Preserve each base family's original 5 similar variations so they power "Practice New Numbers"
 const familyVariations = {};
 for(const q of qs){
  if(q.level === "Calculation" && q.calcFamily){
   (familyVariations[q.calcFamily] = familyVariations[q.calcFamily] || []).push({
    question: q.question,
    formula: q.formula,
    sub: q.sub,
    expected: q.expected,
    unit: q.unit,
    steps: Array.isArray(q.steps) ? q.steps.slice() : [],
    topology: q.topology || null
   });
  }
 }

 const C = (prompt, formula, sub, expected, unit, title, why, steps, opts={}) => ({
  question: prompt,
  formula,
  sub,
  expected: roundSig(expected),
  unit,
  title,
  why,
  steps,
  topology: opts.topology || null,
  variantFn: opts.variantFn || null,
  staticVariants: opts.staticVariants || []
 });

 // Helpers to build dynamic scaled variants for "Practice New Numbers"
 const spReqVar = (r1, r2, r3) => {
  const rp = (r2 * r3) / (r2 + r3);
  const req = r1 + rp;
  return {
   question: `Find total equivalent resistance R_eq (in Ω) of a ${r1} Ω series resistor in series with a parallel bank of ${r2} Ω || ${r3} Ω.`,
   formula: "R_eq = R1 + (R2 * R3) / (R2 + R3)",
   sub: `R_eq = ${r1} + (${r2}*${r3})/(${r2}+${r3}) = ${roundSig(req)} Ω`,
   expected: roundSig(req),
   unit: "Ω",
   topology: "series-parallel",
   steps: [
    `Reduce parallel bank first: R_p = (${r2} * ${r3}) / (${r2} + ${r3}) = ${roundSig(rp)} Ω.`,
    `Add series resistor: R_eq = ${r1} + ${roundSig(rp)} = ${roundSig(req)} Ω.`,
    `Sanity check: R_eq must sit between R1 (${r1} Ω) and R1 + min(R2, R3).`
   ]
  };
 };
 const spCurrVar = (vs, r1, r2, r3) => {
  const rp = (r2 * r3) / (r2 + r3);
  const req = r1 + rp;
  const it = (vs / req) * 1000;
  return {
   question: `A ${vs} V source drives a ${r1} Ω series resistor into a parallel bank of ${r2} Ω || ${r3} Ω. Find total source current I_T in mA.`,
   formula: "I_T = 1000 * V_S / (R1 + (R2*R3)/(R2+R3))",
   sub: `I_T = 1000 * ${vs} / (${r1} + (${r2}*${r3})/(${r2}+${r3})) = ${roundSig(it)} mA`,
   expected: roundSig(it),
   unit: "mA",
   topology: "series-parallel",
   steps: [
    `Combine parallel bank: R_p = ${roundSig(rp)} Ω, so R_eq = ${r1} + ${roundSig(rp)} = ${roundSig(req)} Ω.`,
    `Compute source current: I_T = ${vs} V / ${roundSig(req)} Ω = ${roundSig(it/1000)} A = ${roundSig(it)} mA.`,
    `Confirm I_T is greater than ${vs}/(${r1}+${r2}) mA and less than ${vs}/${r1} mA.`
   ]
  };
 };
 const loadedDivVar = (vs, r1, r2, rl) => {
  const rbot = (r2 * rl) / (r2 + rl);
  const vout = vs * (rbot / (r1 + rbot));
  return {
   question: `A ${vs} V voltage divider uses R1 = ${r1} Ω (top) and R2 = ${r2} Ω (bottom), loaded at its midpoint by R_L = ${rl} Ω in parallel with R2. Find loaded output voltage V_out in V.`,
   formula: "V_out = V_S * ((R2||R_L) / (R1 + (R2||R_L)))",
   sub: `V_out = ${vs} * ((${r2}*${rl}/(${r2}+${rl})) / (${r1} + ${r2}*${rl}/(${r2}+${rl}))) = ${roundSig(vout)} V`,
   expected: roundSig(vout),
   unit: "V",
   topology: "series-parallel",
   steps: [
    `Lower parallel bank: R_bot_eff = (${r2} * ${rl}) / (${r2} + ${rl}) = ${roundSig(rbot)} Ω.`,
    `Divider ratio: V_out = ${vs} * ${roundSig(rbot)} / (${r1} + ${roundSig(rbot)}) = ${roundSig(vout)} V.`,
    `Loaded output must be strictly lower than unloaded ${vs * r2 / (r1 + r2)} V.`
   ]
  };
 };
 const spBranchVar = (vs, r1, r2, r3, pickBranch=2) => {
  const rp = (r2 * r3) / (r2 + r3);
  const req = r1 + rp;
  const vnode = vs * (rp / req);
  const rPick = pickBranch === 2 ? r2 : r3;
  const iBranch = (vnode / rPick) * 1000;
  return {
   question: `Across ${vs} V, series resistor R1 = ${r1} Ω feeds parallel branches R2 = ${r2} Ω and R3 = ${r3} Ω. Find branch current through ${rPick} Ω in mA.`,
   formula: "I_branch = 1000 * V_node / R_branch",
   sub: `I_branch = 1000 * (${vs} * ((${r2}*${r3}/(${r2}+${r3})) / (${r1} + ${r2}*${r3}/(${r2}+${r3})))) / ${rPick} = ${roundSig(iBranch)} mA`,
   expected: roundSig(iBranch),
   unit: "mA",
   topology: "series-parallel",
   steps: [
    `Reduce parallel bank R_p = ${roundSig(rp)} Ω and find V_node = ${vs} * ${roundSig(rp)} / ${roundSig(req)} = ${roundSig(vnode)} V.`,
    `Apply Ohm's Law on the target branch: I = ${roundSig(vnode)} V / ${rPick} Ω = ${roundSig(iBranch)} mA.`,
    `Check KCL: I_2 + I_3 must equal I_T = ${roundSig(1000 * vs / req)} mA.`
   ]
  };
 };
 const bridgeVar = (vs, r1, r2, r3, r4) => {
  const va = vs * (r2 / (r1 + r2));
  const vb = vs * (r4 / (r3 + r4));
  const dv = Math.abs(vb - va);
  return {
   question: `A ${vs} V Wheatstone bridge has left leg R1 = ${r1} Ω (top), R2 = ${r2} Ω (bottom) and right leg R3 = ${r3} Ω (top), R4 = ${r4} Ω (bottom). Find bridge differential voltage |V_B − V_A| in V.`,
   formula: "|V_B - V_A| = |V_S*R4/(R3+R4) - V_S*R2/(R1+R2)|",
   sub: `dV = (${vs}*${r4}/(${r3}+${r4})) - (${vs}*${r2}/(${r1}+${r2})) = ${roundSig(vb - va)} V`.replace("dV", "ΔV"),
   expected: roundSig(vb - va),
   unit: "V",
   topology: "series-parallel",
   steps: [
    `Left leg Node A: V_A = ${vs} * ${r2} / (${r1} + ${r2}) = ${roundSig(va)} V.`,
    `Right leg Node B: V_B = ${vs} * ${r4} / (${r3} + ${r4}) = ${roundSig(vb)} V.`,
    `Bridge voltage ΔV = V_B − V_A = ${roundSig(vb - va)} V (balanced only when R1/R2 = R3/R4).`
   ]
  };
 };

 // Clean positive difference variant when vb < va might produce negative
 const bridgePosVar = (vs, r1, r2, r3, r4) => {
  const va = vs * (r2 / (r1 + r2));
  const vb = vs * (r4 / (r3 + r4));
  const diff = vb >= va ? vb - va : va - vb;
  const subExpr = vb >= va
   ? `V_diff = (${vs}*${r4}/(${r3}+${r4})) - (${vs}*${r2}/(${r1}+${r2})) = ${roundSig(diff)} V`
   : `V_diff = (${vs}*${r2}/(${r1}+${r2})) - (${vs}*${r4}/(${r3}+${r4})) = ${roundSig(diff)} V`;
  return {
   question: `A ${vs} V Wheatstone bridge has left leg R1 = ${r1} Ω (top), R2 = ${r2} Ω (bottom) and right leg R3 = ${r3} Ω (top), R4 = ${r4} Ω (bottom). Find bridge differential voltage magnitude |V_B − V_A| in V.`,
   formula: "V_diff = |V_S*R4/(R3+R4) - V_S*R2/(R1+R2)|",
   sub: subExpr,
   expected: roundSig(diff),
   unit: "V",
   topology: "series-parallel",
   steps: [
    `Left leg Node A: V_A = ${vs} * ${r2} / (${r1} + ${r2}) = ${roundSig(va)} V.`,
    `Right leg Node B: V_B = ${vs} * ${r4} / (${r3} + ${r4}) = ${roundSig(vb)} V.`,
    `Differential bridge magnitude = |${roundSig(vb)} − ${roundSig(va)}| = ${roundSig(diff)} V.`
   ]
  };
 };

 // Fix subExpr check above using vb >= va cleanly
 const map = {
  units: {
   2: C("A telemetry differential input measures 330 mV referenced to AGND. Convert 330 mV to base volts (V).",
        "V = mV / 1000", "V = 330 / 1000 = 0.33 V", 0.33, "V",
        "Millivolts to base volts", "ADC references and op-amp thresholds often mix mV specifications with V formulas.",
        ["Divide millivolts by 1000 (shift decimal left 3 places).", "330 / 1000 = 0.33 V.", "Verify magnitude shrinks because V is 1000x larger than mV."],
        { staticVariants: [
          { question:"An STM32 DAC outputs 1650 mV on PA4. Convert to V.", formula:"V = mV / 1000", sub:"V = 1650 / 1000 = 1.65 V", expected:1.65, unit:"V" },
          { question:"A shunt amplifier outputs 825 mV under load. Express in V.", formula:"V = mV / 1000", sub:"V = 825 / 1000 = 0.825 V", expected:0.825, unit:"V" },
          { question:"A brownout threshold is set to 2900 mV. Convert to V.", formula:"V = mV / 1000", sub:"V = 2900 / 1000 = 2.9 V", expected:2.9, unit:"V" }
        ]}),
   3: C("An I2C pull-up resistor is marked 4.7 kΩ on the schematic. Convert its resistance to base ohms (Ω).",
        "R_ohms = R_k * 1000", "R = 4.7 * 1000 = 4700 Ω", 4700, "Ω",
        "Kilo-ohms to base ohms", "Ohm's Law V = I·R requires base Ω if V is in volts and I is in amps.",
        ["Multiply kΩ by 10^3 (1000).", "4.7 * 1000 = 4700 Ω.", "Confirm numeric value grows when converting from larger prefix kΩ to Ω."],
        { staticVariants: [
          { question:"Convert a 2.2 kΩ termination resistor to Ω.", formula:"R = R_k * 1000", sub:"R = 2.2 * 1000 = 2200 Ω", expected:2200, unit:"Ω" },
          { question:"Convert a 10 kΩ pull-down resistor to Ω.", formula:"R = R_k * 1000", sub:"R = 10 * 1000 = 10000 Ω", expected:10000, unit:"Ω" }
        ]}),
   4: C("A high-impedance oscilloscope probe input measures 2.2 MΩ. Express this resistance in kΩ.",
        "R_k = R_M * 1000", "R = 2.2 * 1000 = 2200 kΩ", 2200, "kΩ",
        "Step down between MΩ and kΩ", "Mega-to-kilo shifts by 10^3 rather than 10^6, preventing 1000x calculation bugs in dividers.",
        ["1 MΩ = 10^6 Ω = 1000 kΩ.", "Multiply 2.2 by 1000 = 2200 kΩ.", "Check scale: kΩ is smaller than MΩ, so number grows by 1000x."],
        { staticVariants: [
          { question:"Express a 4.7 MΩ bleed resistor in kΩ.", formula:"R = R_M * 1000", sub:"R = 4.7 * 1000 = 4700 kΩ", expected:4700, unit:"kΩ" },
          { question:"Express a 10 MΩ DMM input impedance in kΩ.", formula:"R = R_M * 1000", sub:"R = 10 * 1000 = 10000 kΩ", expected:10000, unit:"kΩ" }
        ]}),
   5: C("An STM32L476RG in STOP2 sleep mode draws 0.45 mA on its VDD jumper. Convert this standby current to microamperes (µA).",
        "I_uA = I_mA * 1000", "I = 0.45 * 1000 = 450 µA", 450, "µA",
        "Milliamps to microamps for low-power budgets", "Sleep-current datasheets switch from mA to µA across operating modes.",
        ["Each 1 mA equals 1000 µA (10^-3 / 10^-6).", "Multiply 0.45 * 1000 = 450 µA.", "Verify value is larger in µA than in mA."],
        { staticVariants: [
          { question:"Convert 0.12 mA backup current into µA.", formula:"I = I_mA * 1000", sub:"I = 0.12 * 1000 = 120 µA", expected:120, unit:"µA" },
          { question:"Convert 1.85 mA sleep load into µA.", formula:"I = I_mA * 1000", sub:"I = 1.85 * 1000 = 1850 µA", expected:1850, unit:"µA" }
        ]}),
   7: C("A 32.768 kHz crystal oscillator specifies an 18 pF load capacitor. Express 18 pF in nanofarads (nF).",
        "C_nF = C_pF / 1000", "C = 18 / 1000 = 0.018 nF", 0.018, "nF",
        "Picofarads to nanofarads", "RF and crystal BOM tables mix pF and nF parts in the same schematic sheet.",
        ["1 nF = 1000 pF (10^-9 vs 10^-12).", "Divide 18 / 1000 = 0.018 nF.", "Check: shifting from pF to nF shrinks the numeric coefficient 1000x."],
        { staticVariants: [
          { question:"Convert a 470 pF filter capacitor into nF.", formula:"C = C_pF / 1000", sub:"C = 470 / 1000 = 0.47 nF", expected:0.47, unit:"nF" },
          { question:"Convert a 120 pF parasitic node capacitance into nF.", formula:"C = C_pF / 1000", sub:"C = 120 / 1000 = 0.12 nF", expected:0.12, unit:"nF" }
        ]}),
   8: C("A sensor line places a 1.5 kΩ resistor in series with a 470 Ω termination resistor. Normalize prefixes and find total resistance in Ω.",
        "R_tot = R1_k * 1000 + R2", "R_tot = 1.5 * 1000 + 470 = 1970 Ω", 1970, "Ω",
        "Adding mixed SI prefixes safely", "Never add 1.5 + 470 directly before converting prefixes to matching units.",
        ["Convert 1.5 kΩ -> 1500 Ω.", "Add matching Ω units: 1500 + 470 = 1970 Ω.", "Result must be slightly below 2 kΩ (2000 Ω)."],
        { staticVariants: [
          { question:"Add 2.2 kΩ and 330 Ω in series. Find total resistance in Ω.", formula:"R_tot = R1*1000 + R2", sub:"R_tot = 2.2 * 1000 + 330 = 2530 Ω", expected:2530, unit:"Ω" },
          { question:"Add 0.68 kΩ and 120 Ω in series. Find total resistance in Ω.", formula:"R_tot = R1*1000 + R2", sub:"R_tot = 0.68 * 1000 + 120 = 800 Ω", expected:800, unit:"Ω" }
        ]}),
   9: C("A 3.3 V avionics bus feeds 850 µA to a pressure transducer and 1.15 mA to an RTC. Normalize prefixes and find total current in mA.",
        "I_tot = (I_uA / 1000) + I_mA", "I_tot = 850 / 1000 + 1.15 = 2 mA", 2, "mA",
        "Combining µA and mA currents", "Summing branch loads requires aligning micro- and milli-prefixes before KCL addition.",
        ["Convert 850 µA -> 0.85 mA.", "Add 0.85 mA + 1.15 mA = 2.0 mA.", "Confirm total exceeds largest single branch."],
        { staticVariants: [
          { question:"Sum 600 µA telemetry bias and 2.4 mA LED draw in mA.", formula:"I_tot = I_uA/1000 + I_mA", sub:"I_tot = 600 / 1000 + 2.4 = 3 mA", expected:3, unit:"mA" }
        ]}),
   10: C("A pulsed actuator draws 2.5 mA for 20 ms during latching. Convert both prefixes and compute total charge Q = I·t in µC.",
         "Q_uC = (I_mA * 1000) * (t_ms / 1000)", "Q = 2.5 * 20 = 50 µC", 50, "µC",
         "Multi-prefix product dimensional check", "Multiplying mA (10^-3) by ms (10^-3) produces 10^-6 A·s = µC directly.",
         ["Identify prefixes: 10^-3 A * 10^-3 s = 10^-6 C = 1 µC.", "Multiply 2.5 * 20 = 50 µC.", "Verify dimensionally: (0.0025 A) * (0.02 s) = 0.00005 C = 50 µC."],
         { staticVariants: [
           { question:"A 4.0 mA strobe lasts 15 ms. Find total transferred charge in µC.", formula:"Q = I_mA * t_ms", sub:"Q = 4.0 * 15 = 60 µC", expected:60, unit:"µC" }
         ]})
  },

  ohm: {
   2: C("A 2.2 kΩ resistor carries 1.5 mA of current on a sensor path. Calculate voltage V across the resistor in V.",
        "V = (I_mA / 1000) * R", "V = (1.5 / 1000) * 2200 = 3.3 V", 3.3, "V",
        "Solve V = I·R with mixed kΩ and mA", "mA × kΩ cancels 10^-3 × 10^+3 cleanly to give volts.",
        ["Convert 1.5 mA = 0.0015 A and 2.2 kΩ = 2200 Ω.", "Multiply V = 0.0015 * 2200 = 3.3 V.", "Shortcut check: 1.5 mA * 2.2 kΩ = 3.3 V."],
        { staticVariants: [
          { question:"A 4.7 kΩ resistor carries 1 mA. Find voltage drop in V.", formula:"V = (I_mA/1000)*R", sub:"V = (1 / 1000) * 4700 = 4.7 V", expected:4.7, unit:"V" },
          { question:"A 330 Ω resistor carries 15 mA. Find voltage across it in V.", formula:"V = (I_mA/1000)*R", sub:"V = (15 / 1000) * 330 = 4.95 V", expected:4.95, unit:"V" }
        ]}),
   3: C("A 2.4 kΩ pull-down resistor on an avionics enable input sees a 12 V rail. Convert kΩ to Ω and find bleed current in mA.",
        "I_mA = 1000 * V / R", "I = 1000 * 12 / (2.4 * 1000) = 5 mA", 5, "mA",
        "Prefix conversion kΩ with Ohm's Law I = V / R", "Dividing V by kΩ directly gives milliamps (V / kΩ = mA) once you confirm prefix scaling.",
        ["Convert 2.4 kΩ -> 2400 Ω.", "Divide: I = 12 V / 2400 Ω = 0.005 A = 5 mA.", "Shortcut check: 12 V / 2.4 kΩ = 5 mA."],
        { staticVariants: [ ...(familyVariations.ohmI || []) ]}),
   4: C("An STM32 PA5 GPIO drives 3.3 V into an LED (V_f = 2.1 V) in series with a limiting resistor at target current 6 mA. Size the resistor R in Ω.",
        "R = (V_S - V_f) / (I_mA / 1000)", "R = (3.3 - 2.1) / (6 / 1000) = 200 Ω", 200, "Ω",
        "Subtract semiconductor drop before Ohm's Law", "Ohm's Law applies only to voltage across the resistor itself, not the full rail.",
        ["Subtract LED forward drop: V_R = 3.3 − 2.1 = 1.2 V.", "Divide by current in amps: R = 1.2 / 0.006 = 200 Ω.", "Check: 0.006 A * 200 Ω + 2.1 V = 3.3 V."],
        { staticVariants: [
          { question:"5.0 V drives a 2.0 V red LED at 10 mA. Size series R in Ω.", formula:"R = (V_S - V_f) / I", sub:"R = (5.0 - 2.0) / (10 / 1000) = 300 Ω", expected:300, unit:"Ω" }
        ]}),
   5: C("A 12 A flight actuator bus runs through a harness with 0.035 Ω total wire resistance. Find unwanted cable IR voltage drop in mV.",
        "V_drop_mV = I * R * 1000", "V_drop = 12 * 0.035 * 1000 = 420 mV", 420, "mV",
        "High-current copper IR voltage drop", "Low milliohm harness resistance creates major droop under high bus currents.",
        ["Compute IR drop in volts: 12 A * 0.035 Ω = 0.42 V.", "Convert to millivolts: 0.42 * 1000 = 420 mV.", "Verify: higher current or thinner wire scales drop linearly."],
        { staticVariants: [
          { question:"A 8 A heater pulls through 0.05 Ω connector resistance. Find drop in mV.", formula:"V_mV = I * R * 1000", sub:"V_mV = 8 * 0.05 * 1000 = 400 mV", expected:400, unit:"mV" }
        ]}),
   7: C("A 12 V supply with 10 Ω internal source resistance feeds a 110 Ω load resistor in series. Find actual loop current in mA.",
        "I_mA = 1000 * V / (R_s + R_L)", "I = 1000 * 12 / (10 + 110) = 100 mA", 100, "mA",
        "Include source internal resistance in Ohm's Law", "Real bench supplies and battery cells drop internal voltage across R_s under load.",
        ["Sum total loop resistance: R_tot = 10 + 110 = 120 Ω.", "Divide source voltage: I = 12 / 120 = 0.1 A = 100 mA.", "Internal loss across R_s is 0.1 A * 10 Ω = 1 V."],
        { staticVariants: [
          { question:"A 9 V battery (2 Ω internal R) feeds a 43 Ω load. Find current in mA.", formula:"I = 1000 * V / (R_s + R_L)", sub:"I = 1000 * 9 / (2 + 43) = 200 mA", expected:200, unit:"mA" }
        ]}),
   8: C("During burn-in, a Kelvin voltmeter reads 180 mV across a 0.015 Ω current-sense shunt. Calculate bus current in A.",
        "I = (V_mV / 1000) / R_shunt", "I = (180 / 1000) / 0.015 = 12 A", 12, "A",
        "Kelvin millivolt shunt telemetry", "High currents are measured indirectly via Ohm's Law across known milliohm shunts.",
        ["Convert shunt voltage: 180 mV = 0.18 V.", "Divide by shunt resistance: I = 0.18 / 0.015 = 12 A.", "Sanity check: 12 A * 15 mΩ = 180 mV."],
        { staticVariants: [
          { question:"A 20 mΩ shunt measures 160 mV across Kelvin pins. Find current in A.", formula:"I = (V_mV/1000)/R", sub:"I = (160 / 1000) / 0.02 = 8 A", expected:8, unit:"A" }
        ]}),
   9: C("In a series-parallel circuit powered by 12 V, a 200 Ω series resistor feeds a parallel bank of (300 Ω || 600 Ω). Find total source current I_T in mA.",
        "I_T = 1000 * V_S / (R1 + (R2*R3)/(R2+R3))", "I_T = 1000 * 12 / (200 + (300*600)/(300+600)) = 30 mA", 30, "mA",
        "Ohm's Law on a combined series-parallel network", "Reduce the parallel bank first into R_p before applying I = V / R_eq.",
        ["Combine parallel bank: R_p = (300*600)/(300+600) = 200 Ω.", "Total loop resistance: R_eq = 200 + 200 = 400 Ω.", "Find current: I_T = 12 V / 400 Ω = 0.03 A = 30 mA."],
        { topology: "series-parallel", variantFn: () => spCurrVar([9,12,15,18][Math.floor(Math.random()*4)], 200, 300, 600),
          staticVariants: [ spCurrVar(12, 100, 200, 200), spCurrVar(15, 250, 500, 500), spCurrVar(9, 150, 300, 300) ]}),
   10: C("A 10.5 V avionics rail feeds a series-parallel network where a 500 Ω (-5% worst-case = 475 Ω) stem meets two 100 Ω parallel branches (R_p = 50 Ω). Find worst-case maximum source current in mA.",
         "I_max = 1000 * V_S / (R1_min + R_p)", "I_max = 1000 * 10.5 / (500*0.95 + (100*100)/(100+100)) = 20 mA", 20, "mA",
         "Worst-case tolerance analysis in series-parallel Ohm's Law", "Lowest resistor tolerance maximizes fault/supply current in worst-case design.",
         ["Lower-tolerance stem: R1_min = 500 * 0.95 = 475 Ω.", "Parallel bank: R_p = 100 || 100 = 50 Ω, so R_min_tot = 525 Ω.", "Maximum current: 10.5 V / 525 Ω = 20 mA."],
         { topology: "series-parallel", staticVariants: [
           spCurrVar(11, 500, 100, 100), spCurrVar(10.5, 475, 100, 100)
         ]})
  },

  power: {
   2: C("A 100 Ω braking resistor sees 10 V continuously during motor regeneration. Calculate power dissipated in W.",
        "P = V^2 / R", "P = (10 * 10) / 100 = 1 W", 1, "W",
        "Voltage-squared power law P = V² / R", "Useful when rail voltage V and resistor R are fixed without measuring I.",
        ["Square the voltage: 10² = 100.", "Divide by resistance: P = 100 / 100 = 1 W.", "Check: current I = 0.1 A, and V·I = 10 * 0.1 = 1 W."],
        { staticVariants: [
          { question:"A 50 Ω dummy load holds 10 V RMS. Find power in W.", formula:"P = V^2 / R", sub:"P = (10 * 10) / 50 = 2 W", expected:2, unit:"W" },
          { question:"A 200 Ω bleed resistor sits across 20 V. Find power in W.", formula:"P = V^2 / R", sub:"P = (20 * 20) / 200 = 2 W", expected:2, unit:"W" }
        ]}),
   3: C("A 0.05 Ω PCB return trace carries 4 A continuously. Compute Joule I²R copper power loss in W.",
        "P = I^2 * R", "P = 4 * 4 * 0.05 = 0.8 W", 0.8, "W",
        "Joule trace heating P = I²·R", "Doubling current quadruples heat generated inside copper traces and connectors.",
        ["Square current: 4² = 16 A².", "Multiply by resistance: 16 * 0.05 = 0.8 W.", "Notice 0.8 W on a narrow trace creates significant local heat."],
        { staticVariants: [
          { question:"A 0.08 Ω contact carries 5 A continuously. Find I²R heat in W.", formula:"P = I^2 * R", sub:"P = 5 * 5 * 0.08 = 2 W", expected:2, unit:"W" }
        ]}),
   4: C("A linear LDO drops a 12 V bus down to 3.3 V while supplying 0.2 A load current. Find power dissipated as heat inside the LDO in W.",
        "P_heat = (V_in - V_out) * I_load", "P_heat = (12 - 3.3) * 0.2 = 1.74 W", 1.74, "W",
        "Linear regulator thermal dissipation", "Every volt dropped linearly multiplied by load current turns straight into silicon heat.",
        ["Voltage dropped across pass FET: 12 − 3.3 = 8.7 V.", "Multiply by load current: P = 8.7 * 0.2 = 1.74 W.", "Only 3.3 * 0.2 = 0.66 W actually reaches the load!"],
        { staticVariants: [
          { question:"An LDO drops 5 V to 3.3 V at 0.5 A load. Find heat lost in W.", formula:"P = (Vin - Vout)*I", sub:"P = (5 - 3.3) * 0.5 = 0.85 W", expected:0.85, unit:"W" }
        ]}),
   5: C("A 5 V @ 2 A (10 W output) switching buck converter operates at 80% efficiency. Find total input power drawn from the 12 V upstream bus in W.",
        "P_in = (V_out * I_out) / eta", "P_in = (5 * 2) / 0.80 = 12.5 W", 12.5, "W",
        "Switching regulator efficiency and input power", "Total input power equals delivered output power divided by converter efficiency.",
        ["Compute output power: 5 V * 2 A = 10 W.", "Divide by efficiency fraction 0.80: 10 / 0.80 = 12.5 W.", "Remaining 2.5 W turns into switch, inductor, and diode heat."],
        { staticVariants: [
          { question:"A 3.3 V @ 3 A load (~9.9 W) runs from an 88% efficient buck. Find P_in in W.", formula:"P_in = P_out / eta", sub:"P_in = (3.3 * 3) / 0.88 = 11.25 W", expected:11.25, unit:"W" }
        ]}),
   7: C("A 3.7 V, 2 Ah Li-ion battery pack discharges cleanly down to cutoff. Express ideal stored energy (V · Ah · 3600) in kJ.",
        "E_kJ = (V * Ah * 3600) / 1000", "E_kJ = (3.7 * 2 * 3600) / 1000 = 26.64 kJ", 26.64, "kJ",
        "Battery watt-hours to kilojoules", "1 Wh = 3600 W·s = 3600 J = 3.6 kJ.",
        ["Compute watt-hours: 3.7 V * 2 Ah = 7.4 Wh.", "Convert hours to seconds (* 3600) and J to kJ (/ 1000): 7.4 * 3.6 = 26.64 kJ.", "Check dimensional match: V * A * s = J."],
        { staticVariants: [
          { question:"A 12 V, 5 Ah SLA pack stores V*Ah*3.6 kJ. Find kJ.", formula:"E_kJ = V * Ah * 3.6", sub:"E_kJ = 12 * 5 * 3.6 = 216 kJ", expected:216, unit:"kJ" }
        ]}),
   8: C("A 28 V thruster solenoid draws 1.5 A (42 W peak) only during a 10% duty-cycle pulse window. Find average power dissipation in W.",
        "P_avg = V * I_peak * duty", "P_avg = 28 * 1.5 * 0.10 = 4.2 W", 4.2, "W",
        "Duty-cycle average power", "Pulsed actuators allow smaller thermal heatsinks when duty cycle stays low.",
        ["Instantaneous ON power: 28 * 1.5 = 42 W.", "Scale by 10% ON fraction: 42 * 0.10 = 4.2 W.", "Verify peak resistor current rating still tolerates 1.5 A pulses."],
        { staticVariants: [
          { question:"A 12 V beacon draws 2 A at 25% duty cycle. Find average W.", formula:"P_avg = V * I * D", sub:"P_avg = 12 * 2 * 0.25 = 6 W", expected:6, unit:"W" }
        ]}),
   9: C("A 12 V supply feeds R1 = 100 Ω in series with parallel loads (R2 = 200 Ω || R3 = 200 Ω), giving R_eq = 200 Ω. Find total power dissipated across the entire series-parallel network in mW.",
        "P_mW = 1000 * (V_S^2 / R_eq)", "P_mW = 1000 * (12 * 12) / (100 + (200*200)/(200+200)) = 720 mW", 720, "mW",
        "Total power in a combined series-parallel circuit", "Reduce parallel bank first to R_p, add R1, then apply V²/R_eq.",
        ["Reduce parallel pair: 200 || 200 = 100 Ω; R_eq = 100 + 100 = 200 Ω.", "Total power: P = 12² / 200 = 0.72 W = 720 mW.", "R1 alone drops 6 V and dissipates half (360 mW)."],
        { topology: "series-parallel", staticVariants: [
          { question:"10 V feeds 100 Ω + (200 Ω || 200 Ω) (R_eq=200 Ω). Find total mW.", formula:"P = 1000*V^2/R_eq", sub:"P = 1000 * (10*10) / (100 + (200*200)/(200+200)) = 500 mW", expected:500, unit:"mW", topology:"series-parallel" }
        ]}),
   10: C("A regulator dissipates 2.5 W with thermal resistance θ_JA = 36 °C/W in a 25 °C chassis ambient. Calculate steady-state silicon junction temperature T_J in °C.",
         "T_J = T_amb + P * theta_JA", "T_J = 25 + 2.5 * 36 = 115 °C", 115, "°C",
         "Electrical watts to silicon junction temperature", "Thermal Ohm's Law relates ΔT directly to power multiplied by θ_JA.",
         ["Temperature rise ΔT = 2.5 W * 36 °C/W = +90 °C.", "Add ambient base: T_J = 25 + 90 = 115 °C.", "Below 125 °C rating by only 10 °C margin."],
         { staticVariants: [
           { question:"At 1.8 W and θ_JA = 40 °C/W in 30 °C air, find T_J in °C.", formula:"T_J = T_a + P*theta", sub:"T_J = 30 + 1.8 * 40 = 102 °C", expected:102, unit:"°C" }
         ]})
  },

  series: {
   2: C("A 9 V source drives two series resistors R1 = 120 Ω and R2 = 180 Ω. Find the voltage drop across the 180 Ω resistor in V.",
        "V2 = V_S * R2 / (R1 + R2)", "V2 = 9 * 180 / (120 + 180) = 5.4 V", 5.4, "V",
        "Series current and proportional voltage drop", "The same current I flows through both series resistors, so the larger resistor drops the larger voltage.",
        ["Total series resistance: 120 + 180 = 300 Ω (so I = 9 / 300 = 30 mA).", "Drop across 180 Ω: V2 = 0.03 A * 180 Ω = 5.4 V.", "Confirm KVL sum: 3.6 V + 5.4 V = 9.0 V."],
        { staticVariants: [
          { question:"12 V drives 200 Ω and 400 Ω in series. Find V across 400 Ω in V.", formula:"V2 = V_S*R2/(R1+R2)", sub:"V2 = 12 * 400 / (200 + 400) = 8 V", expected:8, unit:"V" },
          ...(familyVariations.seriesR || [])
        ]}),
   3: C("A 12 V supply must drive 15 mA through a fixed 500 Ω resistor wired in series with an unknown resistor R2. Calculate R2 in Ω.",
        "R2 = (V_S / (I_mA / 1000)) - R1", "R2 = (12 / (15 / 1000)) - 500 = 300 Ω", 300, "Ω",
        "Reverse-designing an unknown series element", "First find required R_tot = V / I, then subtract known series resistances.",
        ["Required total resistance: R_tot = 12 V / 0.015 A = 800 Ω.", "Subtract known R1: R2 = 800 − 500 = 300 Ω.", "Verify: 12 / (500 + 300) = 0.015 A = 15 mA."],
        { staticVariants: [
          { question:"10 V must send 20 mA through 320 Ω + unknown R2. Find R2 in Ω.", formula:"R2 = (V_S/I) - R1", sub:"R2 = (10 / (20 / 1000)) - 320 = 180 Ω", expected:180, unit:"Ω" }
        ]}),
   4: C("Combined Series-Parallel Network: A 220 Ω resistor sits in series with a parallel bank of (300 Ω || 600 Ω). Find total equivalent resistance R_eq in Ω.",
        "R_eq = R1 + (R2 * R3) / (R2 + R3)", "R_eq = 220 + (300 * 600) / (300 + 600) = 420 Ω", 420, "Ω",
        "Combine parallel bank first, then add series stem", "In combined series-parallel circuits, collapse parallel nodes inward before summing along the series path.",
        ["Collapse parallel pair: R_p = (300 * 600) / (300 + 600) = 200 Ω.", "Add series resistor: R_eq = 220 + 200 = 420 Ω.", "Check bounds: R_p (200 Ω) < 300 Ω, so R_eq is between 220 Ω and 520 Ω."],
        { topology: "series-parallel",
          variantFn: () => {
           const sets=[[100,200,200],[150,300,600],[220,400,400],[330,600,300],[470,1000,1000]];
           const p=sets[Math.floor(Math.random()*sets.length)];
           return spReqVar(p[0],p[1],p[2]);
          },
          staticVariants: [ spReqVar(150,300,600), spReqVar(330,400,400), spReqVar(100,600,300) ]}),
   5: C("Combined Series-Parallel Network: A 12 V supply feeds R1 = 100 Ω in series with parallel branches R2 = 200 Ω and R3 = 200 Ω. Find total current I_T leaving the source in mA.",
        "I_T = 1000 * V_S / (R1 + (R2*R3)/(R2+R3))", "I_T = 1000 * 12 / (100 + (200 * 200) / (200 + 200)) = 60 mA", 60, "mA",
        "Source current in a combined series-parallel circuit", "R1 carries the full source current I_T before splitting across the parallel branches.",
        ["Parallel bank: R_p = 200 || 200 = 100 Ω.", "Total loop R_eq = 100 + 100 = 200 Ω.", "Total source current I_T = 12 V / 200 Ω = 60 mA."],
        { topology: "series-parallel",
          variantFn: () => {
           const sets=[[12,100,200,200],[9,100,100,100],[15,250,500,500],[10,50,100,100]];
           const p=sets[Math.floor(Math.random()*sets.length)];
           return spCurrVar(p[0],p[1],p[2],p[3]);
          },
          staticVariants: [ spCurrVar(9,100,100,100), spCurrVar(15,250,500,500), spCurrVar(10,50,100,100) ]}),
   7: C("Loaded Voltage Divider (Series-Parallel): A 12 V rail uses top R1 = 2000 Ω and bottom R2 = 1000 Ω, loaded at the midpoint by a 1000 Ω sensor (forming R2 || R_L). Find loaded output voltage in V.",
        "V_out = V_S * ((R2||R_L) / (R1 + (R2||R_L)))", "V_out = 12 * ((1000 * 1000 / (1000 + 1000)) / (2000 + 1000 * 1000 / (1000 + 1000))) = 2.4 V", 2.4, "V",
        "Loaded divider drops below unloaded value", "Adding any load R_L puts R_L in parallel with bottom R2, lowering effective bottom resistance and sagging V_out.",
        ["Effective lower branch: R_bot = 1000 || 1000 = 500 Ω.", "Divider formula with loaded R_bot: 12 * (500 / (2000 + 500)) = 2.4 V.", "Notice unloaded output would be 4.0 V, so load causes a 1.6 V droop!"],
        { topology: "series-parallel",
          variantFn: () => {
           const sets=[[12,2000,1000,1000],[15,4700,4700,4700],[9,1000,2000,2000],[10,1500,3000,3000]];
           const p=sets[Math.floor(Math.random()*sets.length)];
           return loadedDivVar(p[0],p[1],p[2],p[3]);
          },
          staticVariants: [ loadedDivVar(15,4700,4700,4700), loadedDivVar(9,1000,2000,2000), ...(familyVariations.divider || []) ]}),
   8: C("Current Division in Series-Parallel Network: Across 10 V, series R1 = 50 Ω feeds parallel branches R2 = 100 Ω and R3 = 100 Ω (I_T = 100 mA). Find branch current I2 through R2 in mA.",
        "I2 = 1000 * (V_S * (R_p / (R1 + R_p))) / R2", "I2 = 1000 * (10 * ((100*100/(100+100)) / (50 + (100*100/(100+100))))) / 100 = 50 mA", 50, "mA",
        "Tracing total current into parallel branches", "Find node voltage V_X after R1 first, then apply Ohm's Law across each parallel branch.",
        ["R_p = 100 || 100 = 50 Ω, so V_X = 10 * 50 / (50 + 50) = 5.0 V.", "I2 = 5.0 V / 100 Ω = 50 mA (and equal branch I3 = 50 mA).", "KCL check: I2 + I3 = 100 mA = I_T."],
        { topology: "series-parallel",
          variantFn: () => spBranchVar(12, 100, 200, 200, 2),
          staticVariants: [ spBranchVar(12,100,200,200,2), spBranchVar(15,250,500,500,2) ]}),
   9: C("Asymmetric Series-Parallel Branch Current: An 18 V supply drives R1 = 400 Ω in series with unequal parallel branches R2 = 600 Ω and R3 = 300 Ω. Find branch current I3 through R3 in mA.",
        "I3 = 1000 * (V_S * (R_p / (R1 + R_p))) / R3", "I3 = 1000 * (18 * ((600*300/(600+300)) / (400 + (600*300/(600+300))))) / 300 = 20 mA", 20, "mA",
        "Unequal current split after series voltage drop", "The smaller-resistance parallel branch (300 Ω) draws twice the current of the 600 Ω branch.",
        ["Parallel bank: R_p = (600*300)/(600+300) = 200 Ω; R_eq = 400 + 200 = 600 Ω.", "Node voltage: V_X = 18 * (200/600) = 6.0 V across both parallel branches.", "Target branch: I3 = 6.0 V / 300 Ω = 20 mA (while I2 = 10 mA; sum = 30 mA = I_T)."],
        { topology: "series-parallel",
          variantFn: () => spBranchVar(18, 400, 600, 300, 3),
          staticVariants: [ spBranchVar(12,200,600,300,3), spBranchVar(9,100,300,150,3) ]}),
   10: C("4-Resistor Wheatstone Bridge: Across 10 V sits left leg (R1 = 1000 Ω top, R2 = 1000 Ω bottom) and right leg (R3 = 1000 Ω top, R4 = 1500 Ω bottom). Find bridge output voltage (V_B − V_A) in V.",
         "V_diff = V_S*(R4/(R3+R4)) - V_S*(R2/(R1+R2))", "V_diff = (10 * 1500 / (1000 + 1500)) - (10 * 1000 / (1000 + 1000)) = 1 V", 1, "V",
         "Dual parallel voltage dividers (Wheatstone bridge)", "A Wheatstone bridge compares two series dividers wired in parallel across the same source.",
         ["Left divider Node A: V_A = 10 * 1000 / 2000 = 5.0 V.", "Right divider Node B: V_B = 10 * 1500 / 2500 = 6.0 V.", "Differential output V_B − V_A = 6.0 − 5.0 = 1.0 V."],
         { topology: "series-parallel",
           variantFn: () => bridgePosVar(10, 1000, 1000, 1000, [1500, 4000, 2333.333333][Math.floor(Math.random()*3)]),
           staticVariants: [ bridgePosVar(10,1000,1000,1000,1500), bridgePosVar(12,1000,1000,1000,2000), bridgePosVar(8,500,500,500,1500) ]})
  },

  parallel: {
   2: C("Three parallel termination paths of 600 Ω, 300 Ω, and 200 Ω sit between Bus+ and Bus−. Find combined equivalent resistance R_eq in Ω.",
        "R_eq = 1 / (1/R1 + 1/R2 + 1/R3)", "R_eq = 1 / (1/600 + 1/300 + 1/200) = 100 Ω", 100, "Ω",
        "Three-branch reciprocal parallel combination", "Adding parallel paths always drops R_eq below the smallest single branch resistor.",
        ["Sum conductances: 1/600 + 2/600 + 3/600 = 6/600 = 1/100 S.", "Invert sum: R_eq = 100 Ω.", "Verify 100 Ω < 200 Ω (smallest branch)."],
        { staticVariants: [ ...(familyVariations.parallelR || []) ]}),
   3: C("You already have R1 = 300 Ω across a test bus and need R_eq = 200 Ω total. Find the required parallel resistor R2 in Ω.",
        "R2 = (R1 * R_eq) / (R1 - R_eq)", "R2 = (300 * 200) / (300 - 200) = 600 Ω", 600, "Ω",
        "Solving for an unknown parallel branch", "Subtract target conductance: 1/R2 = 1/R_eq − 1/R1.",
        ["Apply 1/R2 = 1/200 − 1/300 = (3 − 2)/600 = 1/600 S.", "Invert: R2 = 600 Ω.", "Double-check: (300*600)/(300+600) = 200 Ω."],
        { staticVariants: [
          { question:"Need 150 Ω total from 600 Ω in parallel with R2. Find R2 in Ω.", formula:"R2 = (R1*R_eq)/(R1-R_eq)", sub:"R2 = (600 * 150) / (600 - 150) = 200 Ω", expected:200, unit:"Ω" }
        ]}),
   4: C("Two parallel bus paths exhibit conductances G1 = 0.02 S and G2 = 0.03 S. Find total equivalent resistance R_eq = 1 / G_tot in Ω.",
        "R_eq = 1 / (G1 + G2)", "R_eq = 1 / (0.02 + 0.03) = 20 Ω", 20, "Ω",
        "Parallel conductance addition G = G1 + G2", "In parallel circuits, conductances add directly just like series resistances do.",
        ["Sum parallel conductances: G_tot = 0.02 + 0.03 = 0.05 S.", "Invert to resistance: R_eq = 1 / 0.05 = 20 Ω.", "Check: G1 = 50 Ω and G2 = 33.33 Ω give 20 Ω."],
        { staticVariants: [
          { question:"Sum conductances 0.01 S and 0.04 S in parallel to find R_eq in Ω.", formula:"R_eq = 1 / (G1 + G2)", sub:"R_eq = 1 / (0.01 + 0.04) = 20 Ω", expected:20, unit:"Ω" }
        ]}),
   5: C("Current Divider Rule: A 90 mA constant current source splits across parallel branches R1 = 200 Ω and R2 = 400 Ω. Find current I1 entering the 200 Ω branch in mA.",
        "I1 = I_T * (R2 / (R1 + R2))", "I1 = 90 * (400 / (200 + 400)) = 60 mA", 60, "mA",
        "Current divider splits inversely to branch R", "Notice the OPPOSITE resistor R2 goes in the numerator because lower-R branch takes more current.",
        ["Use current divider: I1 = I_T * R2 / (R1 + R2).", "Compute: 90 * (400 / 600) = 60 mA.", "Check I2 = 30 mA (half of I1 because 400 Ω is 2x 200 Ω)."],
        { staticVariants: [
          { question:"120 mA splits across R1 = 100 Ω and R2 = 300 Ω. Find I1 in mA.", formula:"I1 = I_T * R2/(R1+R2)", sub:"I1 = 120 * 300 / (100 + 300) = 90 mA", expected:90, unit:"mA" }
        ]}),
   7: C("A 12 V avionics rail powers three parallel loads simultaneously: 400 Ω, 600 Ω, and 1200 Ω. Compute total rail supply current in mA.",
        "I_tot = 1000 * V * (1/R1 + 1/R2 + 1/R3)", "I_tot = 1000 * 12 * (1/400 + 1/600 + 1/1200) = 60 mA", 60, "mA",
        "Sum all branch currents via KCL", "Every parallel branch experiences the full 12 V rail independently.",
        ["Branch currents: 12/400 = 30 mA, 12/600 = 20 mA, 12/1200 = 10 mA.", "Total KCL current: 30 + 20 + 10 = 60 mA.", "Check via R_eq = 200 Ω: 12 / 200 = 60 mA."],
        { staticVariants: [ ...(familyVariations.parallelI || []) ]}),
   8: C("Combined Series-Parallel Power: A 15 V supply drives R1 = 100 Ω in series with parallel loads R2 = 400 Ω and R3 = 400 Ω (so R_p = 200 Ω and node voltage V_p = 10 V). Find power dissipated ONLY in branch R2 in mW.",
        "P_2 = 1000 * (V_p^2 / R2)", "P_2 = 1000 * ((15 * (400*400/(400+400)) / (100 + (400*400/(400+400))))^2) / 400 = 250 mW", 250, "mW",
        "Isolate branch power inside a series-parallel circuit", "First determine V_p across the parallel bank, then apply V_p² / R2 for that individual resistor.",
        ["Parallel bank: R_p = 400 || 400 = 200 Ω; node voltage V_p = 15 * 200 / 300 = 10 V.", "Power in R2: 10² / 400 = 0.25 W = 250 mW.", "R3 also dissipates 250 mW; series R1 dissipates (5²)/100 = 250 mW."],
        { topology: "series-parallel", staticVariants: [
          { question:"12 V feeds 100 Ω + (200 Ω || 200 Ω). Find power in one 200 Ω branch in mW.", formula:"P = 1000*V_p^2/R2", sub:"P = 1000 * (6 * 6) / 200 = 180 mW", expected:180, unit:"mW", topology:"series-parallel" }
        ]}),
   9: C("Series-Parallel Fault Redistribution: A 12 V source feeds a 50 Ω feeder resistor in series with two parallel 100 Ω loads (initially V_load = 6.0 V). If one 100 Ω branch opens completely, find the NEW voltage across the remaining 100 Ω load in V.",
        "V_new = V_S * (R_surv / (R_feed + R_surv))", "V_new = 12 * (100 / (50 + 100)) = 8 V", 8, "V",
        "Parallel open-branch surge in a series-parallel feeder", "Removing one parallel load raises effective bank R, cutting feeder IR drop and raising surviving load voltage.",
        ["Initially two 100 Ω in parallel = 50 Ω -> 50/(50+50)*12 = 6.0 V.", "After open fault, parallel bank becomes single 100 Ω.", "New load voltage = 12 * 100 / (50 + 100) = 8.0 V (+33% overvoltage!)."],
        { topology: "series-parallel", staticVariants: [
          { question:"24 V via 50 Ω feeder drives two 100 Ω loads; one opens. Find new load V.", formula:"V = V_S*R/(R_f+R)", sub:"V = 24 * 100 / (50 + 100) = 16 V", expected:16, unit:"V", topology:"series-parallel" }
        ]}),
   10: C("Two Parallel Banks Wired in Series: Find total equivalent resistance in Ω when bank A (200 Ω || 200 Ω) connects in series with bank B (300 Ω || 600 Ω).",
         "R_tot = (R1||R2) + (R3||R4)", "R_tot = ((200*200)/(200+200)) + ((300*600)/(300+600)) = 300 Ω", 300, "Ω",
         "Multi-stage series-parallel block reduction", "Reduce each independent parallel cluster separately before summing them along the main current path.",
         ["Bank A: 200 || 200 = 100 Ω.", "Bank B: (300 * 600) / (300 + 600) = 200 Ω.", "Series sum: 100 + 200 = 300 Ω."],
         { topology: "series-parallel", staticVariants: [
           { question:"Reduce (100 Ω || 100 Ω) + (600 Ω || 300 Ω) in Ω.", formula:"R_tot = R_pA + R_pB", sub:"R_tot = (100*100/(100+100)) + (600*300/(600+300)) = 250 Ω", expected:250, unit:"Ω", topology:"series-parallel" }
         ]})
  },

  "kcl-kvl": {
   2: C("A summing junction receives +45 mA from Regulator A and +25 mA from Regulator B; 32 mA leaves to CPU and 18 mA leaves to RF. How many mA exit into telemetry?",
        "I_tel = (I_A + I_B) - (I_CPU + I_RF)", "I_tel = (45 + 25) - (32 + 18) = 20 mA", 20, "mA",
        "Multiple inflows and outflows KCL balance", "Sum of all entering currents equals sum of all leaving currents at any instant.",
        ["Total current entering: 45 + 25 = 70 mA.", "Known outflows: 32 + 18 = 50 mA.", "Remaining telemetry branch: 70 − 50 = 20 mA."],
        { staticVariants: [ ...(familyVariations.kcl || []) ]}),
   3: C("A power tree node sends 120 mA to three avionics sub-rails, while the return sense shunt sees only 113 mA coming back. How many mA are escaping via chassis ground leakage?",
        "I_leak = I_out - I_ret", "I_leak = 120 - 113 = 7 mA", 7, "mA",
        "Differential KCL return fault detection", "Unmatched send vs return current directly quantifies hidden fault leakage.",
        ["Total rail outflow is 120 mA.", "Measured ground return is 113 mA.", "Unaccounted KCL difference = 120 − 113 = 7 mA leakage."],
        { staticVariants: [
          { question:"Rail supplies 85 mA while ground shunt returns 79 mA. Find leakage in mA.", formula:"I_leak = I_out - I_ret", sub:"I_leak = 85 - 79 = 6 mA", expected:6, unit:"mA" }
        ]}),
   4: C("Nodal Analysis (Series-Parallel Node X): A 12 V supply connects through R1 = 200 Ω to Node X, where R2 = 200 Ω and R3 = 200 Ω both connect from Node X to GND. Find Node X voltage in V.",
        "V_X = V_S * ((R2||R3) / (R1 + (R2||R3)))", "V_X = 12 * ((200*200/(200+200)) / (200 + (200*200/(200+200)))) = 4 V", 4, "V",
        "Nodal KCL equation on a series-parallel junction", "Set sum of currents leaving Node X equal to zero: (V_X−12)/200 + V_X/200 + V_X/200 = 0.",
        ["Multiply nodal equation by 200: (V_X − 12) + V_X + V_X = 0.", "Solve 3·V_X = 12 -> V_X = 4.0 V.", "Equivalent check: 200 Ω in series with (200||200 = 100 Ω) gives 12 * 100/300 = 4 V."],
        { topology: "series-parallel", staticVariants: [
          { question:"15 V feeds Node X via 200 Ω with 400 Ω and 400 Ω to GND. Find V_X in V.", formula:"V_X = V_S*(R_p/(R1+R_p))", sub:"V_X = 15 * ((400*400/(400+400)) / (200 + (400*400/(400+400)))) = 7.5 V", expected:7.5, unit:"V", topology:"series-parallel" }
        ]}),
   5: C("Two-Source Nodal KCL: Node X receives current from a +9 V rail through 300 Ω AND a +3 V rail through 600 Ω (with no ground resistor). Compute equilibrium V_X in V.",
        "V_X = (V1/R1 + V2/R2) / (1/R1 + 1/R2)", "V_X = (9/300 + 3/600) / (1/300 + 1/600) = 7 V", 7, "V",
        "Two-source Millman / KCL node equation", "The stronger conductance (smaller resistor 300 Ω) pulls V_X twice as close to +9 V as +3 V.",
        ["Set KCL sum at Node X: (V_X − 9)/300 + (V_X − 3)/600 = 0.", "Multiply by 600: 2(V_X − 9) + (V_X − 3) = 0 -> 3·V_X = 21.", "V_X = 7.0 V (Notice (9−7)/300 = (7−3)/600 = 6.67 mA flowing left-to-right!)."],
        { topology: "series-parallel", staticVariants: [
          { question:"+12 V via 200 Ω and +6 V via 400 Ω meet at Node X. Find V_X in V.", formula:"V_X = (V1/R1+V2/R2)/(1/R1+1/R2)", sub:"V_X = (12/200 + 6/400) / (1/200 + 1/400) = 10 V", expected:10, unit:"V", topology:"series-parallel" }
        ]}),
   7: C("Opposing-Source KVL Loop: A +28 V aircraft bus opposes a −4 V back-EMF motor across a 4 Ω harness + 8 Ω winding (12 Ω total). Find steady loop current in A.",
        "I = (V_bus - V_emf) / (R_wire + R_coil)", "I = (28 - 4) / (4 + 8) = 2 A", 2, "A",
        "Apply KVL around bucking sources", "Opposing voltage sources subtract around the KVL loop before dividing by total loop R.",
        ["Walk loop KVL: +28 − I·12 − 4 = 0.", "Net driving voltage = 28 − 4 = 24 V.", "I = 24 / 12 = 2 A."],
        { staticVariants: [ ...(familyVariations.kvl || []) ]}),
   8: C("In a 24 V bus delivering 2 A to a remote instrument reading 22.8 V across its terminals, positive and negative harness wires are identical. Find voltage drop on ONE wire leg in V.",
        "V_one_wire = (V_src - V_load) / 2", "V_one_wire = (24 - 22.8) / 2 = 0.6 V", 0.6, "V",
        "KVL accounting for both supply and return paths", "Total loop cable loss splits equally between feed and return wires unless cross-sections differ.",
        ["Total missing loop voltage by KVL: 24 − 22.8 = 1.2 V.", "Divide across the 2 equal harness legs: 1.2 / 2 = 0.6 V per wire.", "Implies each wire has R = 0.6 V / 2 A = 0.3 Ω."],
        { staticVariants: [
          { question:"28 V PSU delivers 26.2 V at load with symmetric harness. Find 1-wire drop in V.", formula:"V_wire = (V_s - V_L)/2", sub:"V_wire = (28 - 26.2) / 2 = 0.9 V", expected:0.9, unit:"V" }
        ]}),
   9: C("Combined Loop KVL + Node KCL: Around a 10 V series-parallel circuit, R1 = 80 Ω drops 4.0 V (making I_T = 50 mA), leaving 6.0 V across parallel branches R2 = 300 Ω and R3. Find current I3 in mA.",
        "I3 = 1000 * ((V_s - V_R1)/R1) - 1000 * (V_p / R2)", "I3 = 1000 * (4 / 80) - 1000 * ((10 - 4) / 300) = 30 mA", 30, "mA",
        "Synthesize KVL and KCL in one circuit", "Use KVL around the outer loop to find V_p, then use KCL at the junction to isolate I3 without even knowing R3!",
        ["Outer KVL gives parallel node voltage: V_p = 10 − 4 = 6.0 V.", "Total series current I_T = 4.0 V / 80 Ω = 50 mA; branch I2 = 6.0 V / 300 Ω = 20 mA.", "By KCL: I3 = 50 − 20 = 30 mA (implying R3 = 6/0.03 = 200 Ω)."],
        { topology: "series-parallel", staticVariants: [
          { question:"12 V feeds R1=100 Ω dropping 5 V (I_T=50 mA) into R2=350 Ω || R3. Find I3 in mA.", formula:"I3 = I_T - V_p/R2", sub:"I3 = 1000*(5/100) - 1000*((12-5)/350) = 30 mA", expected:30, unit:"mA", topology:"series-parallel" }
        ]}),
   10: C("KCL with Controlled/Constant Current Source: Node X connects through 1 kΩ to +12 V, through 1 kΩ to GND, AND receives an extra +2 mA injected from a current source. Find V_X in V.",
         "V_X = (V1/R1 + I_src) / (1/R1 + 1/R2)", "V_X = (12/1000 + 0.002) / (1/1000 + 1/1000) = 7 V", 7, "V",
         "Nodal analysis with mixed V and I sources", "Express every resistor connection as current out of V_X and subtract injected current sources.",
         ["Node KCL: (V_X − 12)/1000 + V_X/1000 = 0.002.", "Multiply by 1000: 2·V_X − 12 = 2 -> 2·V_X = 14.", "Solve V_X = 7.0 V (Verify: 5 mA enters from 12 V + 2 mA from I_src = 7 mA going down to GND!)."],
         { staticVariants: [
           { question:"Node X connects +10 V via 1 kΩ, GND via 1 kΩ, and +4 mA injection. Find V_X in V.", formula:"V_X = (V/R + I)/(2/R)", sub:"V_X = (10/1000 + 0.004) / (1/1000 + 1/1000) = 7 V", expected:7, unit:"V" }
         ]})
  },

  thevenin: {
   2: C("With the voltage source shorted out (0 V), output port A–B sees a top resistor R1 = 1.2 kΩ and bottom resistor R2 = 600 Ω to GND. Find Thevenin resistance R_th in Ω.",
        "R_th = (R1 * R2) / (R1 + R2)", "R_th = (1200 * 600) / (1200 + 600) = 400 Ω", 400, "Ω",
        "Thevenin source resistance with independent sources zeroed", "Independent voltage sources become short circuits (wires), placing divider branches in parallel from the port's view.",
        ["Zero source connects R1 top leg directly to GND.", "Now R1 (1.2 kΩ) and R2 (600 Ω) are in parallel at port A–B.", "R_th = (1200 * 600) / (1200 + 600) = 400 Ω."],
        { staticVariants: [ ...(familyVariations.thev || []) ]}),
   3: C("A sensor front-end has Thevenin equivalent V_th = 6.0 V and R_th = 500 Ω. Find its loaded terminal voltage in V when attached to a 1000 Ω ADC load.",
        "V_load = V_th * (R_L / (R_th + R_L))", "V_load = 6 * (1000 / (500 + 1000)) = 4 V", 4, "V",
        "Predict loaded droop directly from V_th and R_th", "Any complex linear circuit reduces to a simple 2-resistor divider when feeding a load.",
        ["Model as V_th (6 V) -> R_th (500 Ω) -> R_L (1000 Ω).", "Divide: V_load = 6 * 1000 / 1500 = 4.0 V.", "2.0 V drops internally across R_th."],
        { staticVariants: [
          { question:"V_th = 9 V, R_th = 300 Ω feeds 600 Ω load. Find loaded V.", formula:"V_L = V_th*R_L/(R_th+R_L)", sub:"V_L = 9 * 600 / (300 + 600) = 6 V", expected:6, unit:"V" }
        ]}),
   4: C("Series-Parallel Thevenin Reduction: Looking back into output port A–B with source shorted, you see (300 Ω || 600 Ω) in series with a 150 Ω output protection resistor. Find R_th in Ω.",
        "R_th = ((R1 * R2)/(R1 + R2)) + R3", "R_th = ((300 * 600) / (300 + 600)) + 150 = 350 Ω", 350, "Ω",
        "R_th of a series-parallel source stage", "Reduce parallel source branches first, then add any series output resistor between node and port.",
        ["Zeroing source puts 300 Ω || 600 Ω = 200 Ω.", "Add series port resistor R3 = 150 Ω.", "R_th = 200 + 150 = 350 Ω."],
        { topology: "series-parallel", staticVariants: [
          { question:"Port sees (400 Ω || 400 Ω) + 250 Ω output resistor. Find R_th in Ω.", formula:"R_th = (R1||R2) + R3", sub:"R_th = ((400*400)/(400+400)) + 250 = 450 Ω", expected:450, unit:"Ω", topology:"series-parallel" }
        ]}),
   5: C("Find open-circuit V_th (in V) of a dual-source summing node combining +10 V through 2 kΩ and +2 V through 2 kΩ via superposition.",
        "V_th = V1*(R2/(R1+R2)) + V2*(R1/(R1+R2))", "V_th = 10 * (2000/(2000+2000)) + 2 * (2000/(2000+2000)) = 6 V", 6, "V",
        "Superposition for open-circuit Thevenin voltage", "Compute each source's open-circuit contribution individually while zeroing the other, then sum linearly.",
        ["Zero +2 V source: +10 V contributes 10 * 0.5 = 5 V.", "Zero +10 V source: +2 V contributes 2 * 0.5 = 1 V.", "Total V_th = 5 + 1 = 6 V."],
        { staticVariants: [
          { question:"Combine +12 V via 1 kΩ and +4 V via 1 kΩ at open port. Find V_th in V.", formula:"V_th = (V1 + V2)/2", sub:"V_th = 12*0.5 + 4*0.5 = 8 V", expected:8, unit:"V" }
        ]}),
   7: C("Maximum Power Transfer Theorem: An RF pre-driver has V_th = 8 V and R_th = 50 Ω. Find maximum possible power in mW delivered to a conjugate/matched 50 Ω load.",
        "P_max = 1000 * (V_th^2 / (4 * R_th))", "P_max = 1000 * (8 * 8) / (4 * 50) = 320 mW", 320, "mW",
        "Maximum power transfer at R_L = R_th", "Maximum power transfers to a passive load when R_L equals R_th, splitting V_th evenly (4 V across load).",
        ["At R_L = R_th = 50 Ω, V_load = V_th / 2 = 4 V.", "P_max = 4² / 50 = 16 / 50 = 0.32 W = 320 mW.", "Half of total source power heats R_th (50% efficiency)."],
        { staticVariants: [
          { question:"V_th = 10 V, R_th = 50 Ω drives matched 50 Ω load. Find P_max in mW.", formula:"P_max = 1000*V_th^2/(4*R_th)", sub:"P_max = 1000 * (10 * 10) / (4 * 50) = 500 mW", expected:500, unit:"mW" }
        ]}),
   8: C("Black-Box Test Measurement: An unknown source reads 10.0 V unloaded, and sags to 8.0 V when loaded with 400 Ω. Determine internal R_th in Ω.",
        "R_th = R_L * ((V_oc / V_L) - 1)", "R_th = 400 * ((10 / 8) - 1) = 100 Ω", 100, "Ω",
        "Measure hidden R_th using open-circuit and loaded readings", "On an opaque PCB or battery pack, comparing open vs loaded voltage reveals hidden series resistance.",
        ["Load current I_L = 8.0 V / 400 Ω = 20 mA.", "Internal drop across R_th = 10 − 8 = 2.0 V.", "R_th = 2.0 V / 0.02 A = 100 Ω."],
        { staticVariants: [
          { question:"Unloaded 12 V droops to 9 V across 300 Ω load. Find internal R_th in Ω.", formula:"R_th = R_L*(Voc/VL - 1)", sub:"R_th = 300 * ((12 / 9) - 1) = 100 Ω", expected:100, unit:"Ω" }
        ]}),
   9: C("Source Conversion & Parallel Norton Combining: Two current blocks (12 mA || 300 Ω and 8 mA || 600 Ω) feed port A–B in parallel. Find resulting open-circuit V_th in V.",
        "V_th = ((I1 + I2)/1000) * ((R1 * R2)/(R1 + R2))", "V_th = ((12 + 8) / 1000) * ((300 * 600) / (300 + 600)) = 4 V", 4, "V",
        "Sum Norton currents and reduce R_eq before converting", "Norton current sources in parallel add directly before converting back to V_th = I_N · R_N.",
        ["Combined Norton current I_N = 12 + 8 = 20 mA.", "Combined Norton resistance R_N = 300 || 600 = 200 Ω.", "V_th = 0.02 A * 200 Ω = 4 V."],
        { staticVariants: [ ...(familyVariations.norton || []) ]}),
   10: C("Full Series-Parallel Thevenin System: A 9 V divider (1.5 kΩ top, 3.0 kΩ bottom -> V_th = 6 V, R_th = 1 kΩ) drives a 3 kΩ load in parallel with a 6 kΩ instrumentation input. Find loaded output V in V.",
         "V_out = V_th * (R_Leff / (R_th + R_Leff))", "V_out = (9 * 3000 / (1500 + 3000)) * ((3000*6000/(3000+6000)) / ((1500*3000/(1500+3000)) + (3000*6000/(3000+6000)))) = 4 V", 4, "V",
         "Complete Thevenin source feeding parallel combined loads", "Compute V_th and R_th for the source divider, reduce the parallel load bank, then solve final divider ratio.",
         ["Source stage: V_th = 9 * 3000/4500 = 6 V; R_th = 1500 || 3000 = 1000 Ω.", "Load bank: R_L_eff = 3000 || 6000 = 2000 Ω.", "Loaded output: 6 * 2000 / (1000 + 2000) = 4.0 V."],
         { topology: "series-parallel", staticVariants: [
           { question:"12 V (2kΩ top, 2kΩ bot -> 6V, 1kΩ) drives 2kΩ || 2kΩ load. Find output V.", formula:"V = V_th*RL/(Rth+RL)", sub:"V = (12 * 0.5) * (1000 / (1000 + 1000)) = 3 V", expected:3, unit:"V", topology:"series-parallel" }
         ]})
  },

  ac: {
   2: C("A differential amplifier shows 20 V peak-to-peak on the oscilloscope for a pure sine wave. Calculate True-RMS voltage in V.",
        "V_rms = (V_pp / 2) / √2", "V_rms = (20 / 2) / √(2) = 7.071067812 V", 7.071067812, "V",
        "Peak-to-peak vs Zero-to-peak conversion", "Divide peak-to-peak by 2 first to obtain V_peak before dividing by √2.",
        ["V_peak = V_pp / 2 = 20 / 2 = 10 V.", "V_rms = 10 / √2 ≈ 7.071 V.", "Watch out: dividing V_pp directly by √2 causes a 2x error!"],
        { staticVariants: [ ...(familyVariations.rms || []) ]}),
   3: C("Composite Signal RMS: A 3.0 V DC bias carries a 4.0 V_rms AC ripple tone on top of it. Find total True-RMS (AC+DC) voltage in V.",
        "V_tot_rms = √(V_dc^2 + V_ac_rms^2)", "V_tot = √(3*3 + 4*4) = 5 V", 5, "V",
        "Orthogonal DC + AC RMS superposition", "DC and pure AC combine by root-sum-of-squares, never simple arithmetic addition.",
        ["Square DC and AC RMS parts: 3² + 4² = 9 + 16 = 25.", "Take square root: √25 = 5.0 V.", "Verify AC-coupled DMM sees only 4 V while DC-coupled sees 5 V True-RMS (or 3 V average)."],
        { staticVariants: [
          { question:"Combine 5 V DC and 12 V_rms AC ripple into True-RMS V.", formula:"V_rms = sqrt(Vdc^2 + Vac^2)", sub:"V_rms = √(5*5 + 12*12) = 13 V", expected:13, unit:"V" }
        ]}),
   4: C("Compute angular frequency ω in rad/s for a 400 Hz aircraft AC power bus.",
        "omega = 2 * π * f", "omega = 2 * π * 400 = 2513.274123 rad/s", 2513.274123, "rad/s",
        "Convert cyclic frequency Hz into rad/s", "Each full Hz cycle sweeps 2π radians around the unit phasor circle.",
        ["Use ω = 2πf.", "Calculate 2 * 3.14159265 * 400 ≈ 2513.27 rad/s.", "Needed directly when evaluating X_C = 1/(ωC) and X_L = ωL."],
        { staticVariants: [
          { question:"Find ω in rad/s for a 60 Hz bench AC line.", formula:"omega = 2*π*f", sub:"omega = 2 * π * 60 = 376.9911184 rad/s", expected:376.9911184, unit:"rad/s" }
        ]}),
   5: C("Find capacitive reactance magnitude X_C in Ω of a 1 µF coupling capacitor operating at 1 kHz.",
        "X_C = 1 / (2 * π * f * C)", "X_C = 1 / (2 * π * 1000 * 0.000001) = 159.1549431 Ω", 159.1549431, "Ω",
        "Capacitive opposition decreases as frequency increases", "Higher frequency signals pass more easily through capacitors because X_C shrinks inversely with f.",
        ["Convert 1 µF = 1e-6 F and 1 kHz = 1000 Hz.", "Compute X_C = 1 / (2π · 1000 · 1e-6) ≈ 159.15 Ω.", "Check at 10x frequency (10 kHz), X_C drops 10x to 15.92 Ω."],
        { staticVariants: [
          { question:"Find X_C in Ω for 0.1 µF at 1 kHz.", formula:"X_C = 1/(2*π*f*C)", sub:"X_C = 1 / (2 * π * 1000 * 0.0000001) = 1591.549431 Ω", expected:1591.549431, unit:"Ω" }
        ]}),
   7: C("Oscilloscope cursors measure one complete AC waveform period T = 2.5 ms. Find signal frequency in Hz.",
        "f = 1 / (T_ms / 1000)", "f = 1 / (2.5 / 1000) = 400 Hz", 400, "Hz",
        "Extract frequency from measured scope time period", "Always normalize period to base seconds before inverting f = 1 / T.",
        ["Convert 2.5 ms = 0.0025 s.", "Invert: f = 1 / 0.0025 = 400 Hz.", "Confirm 400 cycles/s * 0.0025 s/cycle = 1."],
        { staticVariants: [ ...(familyVariations.period || []) ]}),
   8: C("On a 1 kHz (T = 1 ms) dual-channel capture, Channel B lags Channel A by Δt = 0.25 ms. Convert this time skew to phase lag in degrees (°).",
        "phi = 360 * (delta_t / T)", "phi = 360 * (0.25 / 1) = 90 °", 90, "°",
        "Time delay to electrical phase angle", "Phase angle equals the fraction of one full cycle period multiplied by 360°.",
        ["Fraction of full cycle: 0.25 ms / 1.0 ms = 0.25 cycle.", "Multiply by 360°: 0.25 * 360 = 90°.", "Check: half-period lag (0.5 ms) would equal 180° inversion."],
        { staticVariants: [
          { question:"At 500 Hz (T = 2 ms), lag is 0.25 ms. Find phase shift in degrees.", formula:"phi = 360 * (dt / T)", sub:"phi = 360 * (0.25 / 2) = 45 °", expected:45, unit:"°" }
        ]}),
   9: C("Phasor AC Impedance: An inductive coil acts like R = 30 Ω in series with inductive reactance X_L = 40 Ω. Compute total AC impedance magnitude |Z| in Ω.",
        "|Z| = √(R^2 + X_L^2)", "Z = √(30*30 + 40*40) = 50 Ω", 50, "Ω",
        "Right-triangle impedance phasor combination", "Resistive voltage (in phase) and reactive voltage (90° quadrature) combine via Pythagoras, not straight addition.",
        ["Square components: R² = 900, X_L² = 1600.", "Sum and root: |Z| = √(900 + 1600) = √2500 = 50 Ω.", "Note |Z| (50 Ω) < arithmetic sum (70 Ω)."],
        { staticVariants: [
          { question:"Series R = 60 Ω and X_C = 80 Ω. Find |Z| in Ω.", formula:"|Z| = sqrt(R^2 + X^2)", sub:"Z = √(60*60 + 80*80) = 100 Ω", expected:100, unit:"Ω" }
        ]}),
   10: C("AC Real Power vs Apparent Power: A 115 V_rms, 400 Hz avionics feeder delivers 4.0 A_rms at a lagging power factor PF = 0.85. Calculate active real power consumed in W.",
         "P = V_rms * I_rms * PF", "P = 115 * 4 * 0.85 = 391 W", 391, "W",
         "True power includes cos(φ) power factor", "Apparent V·I includes circulating reactive energy; only V·I·cos(φ) does useful real heating/work.",
         ["Compute apparent VA: 115 * 4 = 460 VA.", "Scale by power factor 0.85: P = 460 * 0.85 = 391 W.", "Wiring must still be sized for full 4 A apparent current!"],
         { staticVariants: [
           { question:"230 V_rms feeder draws 5 A at PF = 0.9. Find real power in W.", formula:"P = V*I*PF", sub:"P = 230 * 5 * 0.9 = 1035 W", expected:1035, unit:"W" }
         ]})
  },

  capacitors: {
   2: C("Combine three parallel rail decoupling capacitors of 10 µF, 22 µF, and 4.7 µF. Find total equivalent capacitance in µF.",
        "C_eq = C1 + C2 + C3", "C_eq = 10 + 22 + 4.7 = 36.7 µF", 36.7, "µF",
        "Parallel capacitors add plate area directly", "Placing capacitors in parallel effectively sums their plate areas: total C increases.",
        ["Add parallel values directly: 10 + 22 + 4.7 = 36.7 µF.", "Contrast with resistors: parallel C adds, parallel R shrinks.", "Total exceeds the largest individual part (22 µF)."],
        { staticVariants: [ ...(familyVariations.capQ || []) ]}),
   3: C("Wire a 6 µF film capacitor in series with a 3 µF capacitor to increase breakdown voltage rating. Find equivalent series capacitance in µF.",
        "C_eq = (C1 * C2) / (C1 + C2)", "C_eq = (6 * 3) / (6 + 3) = 2 µF", 2, "µF",
        "Series capacitors add reciprocally like parallel R", "Sharing charge across two series plates doubles effective gap spacing, shrinking net capacitance.",
        ["Product over sum: (6 * 3) / (6 + 3) = 18 / 9 = 2 µF.", "Verify: 2 µF < 3 µF (smaller than smallest series cap).", "Ensure balancing resistors are added in HV DC designs."],
        { staticVariants: [
          { question:"Series combine two 10 µF capacitors. Find C_eq in µF.", formula:"C_eq = (C1*C2)/(C1+C2)", sub:"C_eq = (10 * 10) / (10 + 10) = 5 µF", expected:5, unit:"µF" }
        ]}),
   4: C("Charge Redistribution: A 4 µF capacitor charged to 10 V (Q = 40 µC) is switched in parallel across an initially uncharged 6 µF capacitor. Find final equilibrium rail voltage in V.",
        "V_final = (C1 * V1) / (C1 + C2)", "V_final = (4 * 10) / (4 + 6) = 4 V", 4, "V",
        "Charge conservation when connecting hot-plugged caps", "Total charge Q stays conserved at 40 µC across the new combined capacitance 10 µF, causing rail voltage sag.",
        ["Initial stored charge: Q_tot = 4 µF * 10 V = 40 µC.", "Combined parallel capacitance: 4 + 6 = 10 µF.", "Final voltage: V_f = 40 µC / 10 µF = 4.0 V."],
        { staticVariants: [
          { question:"2 µF at 12 V connects across uncharged 4 µF. Find final V.", formula:"V_f = C1*V1/(C1+C2)", sub:"V_f = (2 * 12) / (2 + 4) = 4 V", expected:4, unit:"V" }
        ]}),
   5: C("Soft-Start Charge Rate: A 100 µF load bus capacitor must ramp cleanly by ΔV = 5 V across Δt = 2 ms during power sequencing. Find required constant inrush current I = C·(dV/dt) in mA.",
        "I_mA = 1000 * (C_uF / 1e6) * (dV / (dt_ms / 1000))", "I = 0.1 * (5 / 0.002) = 250 mA", 250, "mA",
        "Dynamic current law I = C·dV/dt", "Fast voltage slew rates across large bulk capacitors trigger huge current surges.",
        ["Slew rate dV/dt = 5 V / 0.002 s = 2500 V/s.", "I = (100e-6 F) * (2500 V/s) = 0.25 A = 250 mA.", "Use controlled slew switches when capacitive banks exceed 100 µF."],
        { staticVariants: [
          { question:"Ramp 47 µF by 3.3 V in 1 ms. Find inrush mA.", formula:"I = C*dV/dt", sub:"I = 1000 * 0.000047 * (3.3 / 0.001) = 155.1 mA", expected:155.1, unit:"mA" }
        ]}),
   7: C("Hold-Up Bank Sizing: A 3.3 V telemetry bus draws 0.2 A and cannot droop more than 0.3 V during a 15 ms solar-panel glitch. Calculate minimum required holdup capacitance in mF.",
        "C_mF = 1000 * (I * dt) / dV_max", "C_mF = 1000 * (0.2 * 0.015) / 0.3 = 10 mF", 10, "mF",
        "Droop hold-up sizing C = I·Δt / ΔV", "Translates brownout ride-through duration directly into required bulk farads.",
        ["Required holdup charge: ΔQ = 0.2 A * 0.015 s = 0.003 C = 3 mC.", "Divide by allowed droop: C = 3 mC / 0.3 V = 10 mF (10,000 µF).", "Note why higher-voltage rails store hold-up energy more compactly."],
        { staticVariants: [ ...(familyVariations.capE || []) ]}),
   8: C("A bulk filter capacitor has ESR = 45 mΩ and absorbs 2.0 A peak-to-peak buck inductor ripple current. Find peak-to-peak ESR ripple voltage in mV.",
        "V_esr_mV = I_pp * ESR_mOhm", "V_esr = 2 * 45 = 90 mV", 90, "mV",
        "Capacitor ESR dominates switching ripple", "Real capacitors contain series resistance; ripple current times ESR often exceeds pure capacitive droop.",
        ["Apply Ohm's Law across ESR: ΔV = 2.0 A * 0.045 Ω = 0.09 V.", "Convert to mV: 90 mV.", "Paralleling ceramic MLCCs cuts effective ESR dramatically."],
        { staticVariants: [
          { question:"25 mΩ ESR cap handles 3 A_pp ripple. Find ESR voltage ripple in mV.", formula:"V_esr = I_pp * ESR", sub:"V_esr = 3 * 25 = 75 mV", expected:75, unit:"mV" }
        ]}),
   9: C("Series-Parallel Capacitor Bank: A 4 µF capacitor connects in series with a parallel pair of (6 µF || 6 µF). Find equivalent bank capacitance in µF.",
        "C_eq = (C1 * (C2+C3)) / (C1 + C2 + C3)", "C_eq = (4 * (6 + 6)) / (4 + 6 + 6) = 3 µF", 3, "µF",
        "Mixed series-parallel capacitor reduction", "Add parallel branches first (6 + 6 = 12 µF), then combine reciprocally in series with C1.",
        ["Parallel group: 6 + 6 = 12 µF.", "Series combination: (4 * 12) / (4 + 12) = 48 / 16 = 3 µF.", "Result stays below the smallest series element (4 µF)."],
        { topology: "series-parallel", staticVariants: [
          { question:"Find C_eq (µF) of 6 µF in series with (1.5 µF || 1.5 µF).", formula:"C_eq = C1*(C2+C3)/(C1+C2+C3)", sub:"C_eq = (6 * (1.5+1.5)) / (6 + 1.5 + 1.5) = 2 µF", expected:2, unit:"µF", topology:"series-parallel" }
        ]}),
   10: C("Partial Discharge Energy: A 100 µF pyrotechnic firing capacitor discharges from 20 V down to 10 V. Find usable energy delivered to the squib in mJ.",
         "dE_mJ = 1000 * 0.5 * C * (V1^2 - V2^2)", "dE = 1000 * 0.5 * 0.0001 * (20*20 - 10*10) = 15 mJ", 15, "mJ",
         "Net energy ΔE = ½·C·(V₁² − V₂²)", "Energy scales with V²: draining the top half of capacitor voltage releases 75% of total stored energy!",
         ["Compute ½·C·(V1² − V2²) = 0.5 * 100e-6 * (400 − 100).", "0.00005 * 300 = 0.015 J = 15 mJ.", "Never compute ½·C·(V1−V2)² — squaring ΔV misses 10 mJ!"],
         { staticVariants: [
           { question:"50 µF bank drops from 30 V to 10 V. Find delivered mJ.", formula:"E = 0.5*C*(V1^2-V2^2)", sub:"E = 1000 * 0.5 * 0.00005 * (30*30 - 10*10) = 20 mJ", expected:20, unit:"mJ" }
         ]})
  },

  rc: {
   2: C("A power-good timer uses R = 4.7 kΩ and C = 10 µF (τ = 47 ms). Find practical 99.3% full-settling duration (5τ) in ms.",
        "t_settle = 5 * (R * C)", "t_settle = 5 * 4700 * 0.00001 * 1000 = 235 ms", 235, "ms",
        "Five time constants for steady state", "Engineering designs wait 5τ before assuming an RC transient has settled below 1% error.",
        ["Find τ = 4.7 kΩ * 10 µF = 47 ms.", "Multiply by 5: 5 * 47 = 235 ms.", "At 5τ, capacitor reaches 1 − e^-5 ≈ 99.33% of final V."],
        { staticVariants: [ ...(familyVariations.rcTau || []) ]}),
   3: C("A capacitor initially at 10 V discharges passively through a bleeder with τ = 20 ms. Calculate remaining voltage in V at t = 20 ms (1τ).",
        "V(t) = V0 * exp(-t / tau)", "V = 10 * exp(-20 / 20) = 3.678794412 V", 3.678794412, "V",
        "Natural exponential RC discharge decay", "During discharge, 1τ drops initial voltage to 36.8% (e^-1).",
        ["Plug t/τ = 20 / 20 = 1 into V(t) = V0 · e^(-t/τ).", "V = 10 * e^(-1) ≈ 3.6788 V.", "Complement check: 63.2% of starting charge already bled off."],
        { staticVariants: [ ...(familyVariations.rc63 || []) ]}),
   4: C("A 5.0 V step charges an empty RC filter (τ = 10 ms). Find capacitor voltage in V after t = 20 ms (2τ).",
        "V(2tau) = V_S * (1 - exp(-2))", "V = 5 * (1 - exp(-20 / 10)) = 4.323323584 V", 4.323323584, "V",
        "Second time constant checkpoint (86.5%)", "At t = 2τ, an RC node completes 86.47% of its step transition.",
        ["Ratio t / τ = 20 / 10 = 2.", "Compute V = 5 * (1 − e^-2) ≈ 5 * 0.86466 = 4.323 V.", "Must lie well above 1τ (3.16 V) and below 5τ (~4.97 V)."],
        { staticVariants: [
          { question:"3.3 V step charges empty RC with τ=5 ms. Find V at 10 ms (2τ).", formula:"V = V_S*(1 - exp(-2))", sub:"V = 3.3 * (1 - exp(-10 / 5)) = 2.853393565 V", expected:2.853393565, unit:"V" }
        ]}),
   5: C("Series-Parallel Thevenin RC Timing: A 10 µF capacitor connects to the midpoint of a divider with R1 = 2 kΩ (to 10 V) and R2 = 2 kΩ (to GND). Using R_th = R1 || R2, find effective τ in ms.",
        "tau = ((R1 * R2)/(R1 + R2)) * C", "tau = ((2000 * 2000) / (2000 + 2000)) * 0.00001 * 1000 = 10 ms", 10, "ms",
        "Divider RC charges with parallel R_th", "Both divider resistors charge/discharge the node simultaneously in AC small-signal terms, halving τ compared to R1 alone!",
        ["Find R_th = R1 || R2 = 2 kΩ || 2 kΩ = 1 kΩ.", "Calculate τ = 1 kΩ * 10 µF = 10 ms.", "Final asymptote is V_th = 5 V, NOT 10 V."],
        { topology: "series-parallel", staticVariants: [
          { question:"10 µF at divider midpoint of R1=3 kΩ and R2=6 kΩ. Find τ in ms.", formula:"tau = (R1||R2)*C", sub:"tau = ((3000 * 6000) / (3000 + 6000)) * 0.00001 * 1000 = 20 ms", expected:20, unit:"ms", topology:"series-parallel" }
        ]}),
   7: C("Initial Surge Current: A 3.3 V GPIO pin starts charging an empty 10 µF capacitor at t = 0+ through a 330 Ω resistor. Find peak initial surge current in mA.",
        "I_0 = 1000 * (V_S / R)", "I_0 = 1000 * (3.3 / 330) = 10 mA", 10, "mA",
        "Discharged capacitor acts like a short at t = 0+", "Because capacitor voltage cannot jump instantaneously, full supply voltage drops across R at t = 0+.",
        ["At t = 0+, V_C = 0 V.", "Full 3.3 V appears across 330 Ω -> I_0 = 3.3 / 330 = 10 mA.", "Exceeding STM32 pin current specs happens right at t = 0+!"],
        { staticVariants: [
          { question:"5 V charges empty C through 250 Ω. Find peak initial current in mA.", formula:"I_0 = 1000*V_S/R", sub:"I_0 = 1000 * 5 / 250 = 20 mA", expected:20, unit:"mA" }
        ]}),
   8: C("Threshold Crossing Time: An RC network (τ = 10 ms) charges from 0 V toward 3.3 V. How many ms pass before reaching the 1.65 V midpoint threshold (50%)?",
        "t = -tau * ln(1 - V_th / V_S)", "t = -10 * log10(1 - 1.65 / 3.3) / log10(exp(1)) = 6.931471806 ms", 6.931471806, "ms",
        "Invert exponential to solve exact threshold time", "Half-voltage rise occurs at τ·ln(2) ≈ 0.693τ regardless of absolute rail voltage.",
        ["Use t = −τ · ln(1 − 1.65 / 3.3) = τ · ln(2).", "Multiply 10 ms * 0.69315 = 6.93 ms.", "Occurs before 1τ (where node crosses 63.2%)."],
        { staticVariants: [
          { question:"For τ=20 ms, find ms to rise from 0 V to 50% threshold.", formula:"t = tau * ln(2)", sub:"t = -20 * log10(0.5) / log10(exp(1)) = 13.86294361 ms", expected:13.86294361, unit:"ms" }
        ]}),
   9: C("Open-Fault RC Impact (Series-Parallel): Two parallel 4 kΩ bias resistors (R_th = 2 kΩ) discharge a 5 µF capacitor (τ = 10 ms). If one 4 kΩ resistor fails open, find the NEW discharge time constant in ms.",
        "tau_new = R_surviving * C", "tau_new = 4000 * 0.000005 * 1000 = 20 ms", 20, "ms",
        "Series-parallel open fault doubles RC decay time", "Losing one parallel bleed branch doubles effective discharge resistance and stretches holdover decay 2x.",
        ["Before fault: 4 kΩ || 4 kΩ = 2 kΩ -> τ = 10 ms.", "After open fault: single 4 kΩ remains -> τ = 4 kΩ * 5 µF = 20 ms.", "Verify slower bleeder retains residual voltage longer during power-off checks."],
        { topology: "series-parallel", staticVariants: [
          { question:"One of two parallel 6 kΩ bleeders opens on a 10 µF bank. Find new τ in ms.", formula:"tau = R * C", sub:"tau = 6000 * 0.00001 * 1000 = 60 ms", expected:60, unit:"ms" }
        ]}),
   10: C("Non-Zero Initial Condition RC Step: A capacitor begins at V_i = 1.0 V and charges toward V_f = 5.0 V with τ = 10 ms. Find capacitor voltage in V at t = 10 ms (1τ).",
         "V(t) = V_f + (V_i - V_f) * exp(-t / tau)", "V = 5 + (1 - 5) * exp(-10 / 10) = 3.528482235 V", 3.528482235, "V",
         "General RC step equation from non-zero start", "An RC node closes 63.2% of the remaining gap (V_f − V_i) during each τ interval.",
         ["Total step change ΔV = 5 − 1 = 4 V.", "Gain 63.21% of ΔV during 1τ: 4 * 0.63212 = 2.5285 V.", "Add to initial start: 1.0 + 2.5285 = 3.5285 V."],
         { staticVariants: [
           { question:"Cap starts at 2 V, steps toward 10 V with τ=5 ms. Find V at t=5 ms.", formula:"V = Vf + (Vi-Vf)*e^-1", sub:"V = 10 + (2 - 10) * exp(-5 / 5) = 7.056964471 V", expected:7.056964471, unit:"V" }
         ]})
  },

  inductors: {
   2: C("Combined Series-Parallel Inductors: Combine an uncoupled 20 mH series inductor in series with two parallel 12 mH uncoupled chokes (12 mH || 12 mH). Find total L_eq in mH.",
        "L_eq = L1 + (L2 * L3) / (L2 + L3)", "L_eq = 20 + (12 * 12) / (12 + 12) = 26 mH", 26, "mH",
        "Inductors combine identically to resistors", "Assuming zero mutual magnetic coupling, series L adds and parallel L combines reciprocally.",
        ["Combine parallel pair: 12 || 12 = 6 mH.", "Add series inductor: L_eq = 20 + 6 = 26 mH.", "Verify total sits above series L1 (20 mH)."],
        { topology: "series-parallel", staticVariants: [ ...(familyVariations.rlTau || []) ]}),
   3: C("A 20 mH buck converter power inductor reaches 3.0 A peak current. Compute energy stored inside its magnetic field in mJ.",
        "E_mJ = 1000 * 0.5 * L * I^2", "E = 1000 * 0.5 * 0.02 * (3 * 3) = 90 mJ", 90, "mJ",
        "Magnetic field stored energy ½·L·I²", "Disconnecting current without a freewheel diode releases ½·L·I² violently as an arc.",
        ["Convert 20 mH = 0.02 H.", "Compute E = 0.5 * 0.02 * 3² = 0.09 J = 90 mJ.", "Notice current squares just like voltage in capacitive ½·C·V²."],
        { staticVariants: [
          { question:"A 10 mH choke carries 4 A. Find stored magnetic energy in mJ.", formula:"E = 0.5*L*I^2", sub:"E = 1000 * 0.5 * 0.01 * (4 * 4) = 80 mJ", expected:80, unit:"mJ" }
        ]}),
   4: C("A 12 V relay coil with total loop resistance 6 Ω (steady final current 2.0 A) ramps with time constant τ = 5 ms. Find coil current in A at t = 5 ms (1τ).",
        "I(1tau) = (V / R) * (1 - exp(-1))", "I = (12 / 6) * (1 - exp(-5 / 5)) = 1.264241118 A", 1.264241118, "A",
        "Inductive current rise mirrors RC voltage charging", "Inductor current starts at zero and climbs exponentially toward V/R with τ = L/R.",
        ["Steady final current I_final = 12 V / 6 Ω = 2.0 A.", "At t = 1τ: I = 2.0 * (1 − e^-1) ≈ 1.264 A.", "Always reaches 63.2% of final current after 1τ."],
        { staticVariants: [
          { question:"24 V coil (R=8 Ω, τ=4 ms) ramps from 0 A. Find A at t=4 ms.", formula:"I = (V/R)*(1-e^-1)", sub:"I = (24 / 8) * (1 - exp(-4 / 4)) = 1.896361676 A", expected:1.896361676, unit:"A" }
        ]}),
   5: C("Flyback Clamp Peak Voltage: A solenoid carrying 0.5 A turns off abruptly into a 40 Ω snubber clamp resistor in series with its 8 Ω coil winding. Find peak clamp voltage developed across the 40 Ω resistor in V.",
        "V_clamp = I_0 * R_clamp", "V_clamp = 0.5 * 40 = 20 V", 20, "V",
        "Larger flyback resistance accelerates decay at higher V spike", "An inductor forces current I_0 to keep flowing immediately at turn-off, creating V = I_0 · R_clamp across the switch.",
        ["At turn-off, coil current holds at 0.5 A.", "Forced through 40 Ω clamp: V = 0.5 A * 40 Ω = 20 V.", "Total switch spike = rail V_S + 20 V unless TVS/diode limits it."],
        { staticVariants: [
          { question:"0.8 A coil dumps into a 50 Ω clamp resistor. Find V across clamp.", formula:"V_c = I_0 * R_c", sub:"V_c = 0.8 * 50 = 40 V", expected:40, unit:"V" }
        ]}),
   7: C("Buck Ripple Ramp: A constant 5.0 V appears across a 2 mH buck choke during a 10 µs ON-pulse. Calculate peak-to-peak inductor current ramp ΔI = (V·Δt)/L in mA.",
        "dI_mA = 1000 * (V_L * dt) / L", "dI = 1000 * (5 * 0.00001) / 0.002 = 25 mA", 25, "mA",
        "Linear current ramp ΔI = (V/L)·Δt under constant V", "Integrating V = L·dI/dt over one PWM ON interval yields triangle-wave buck current ripple.",
        ["Compute V * Δt = 5 V * 10e-6 s = 5e-5 V·s.", "Divide by L = 0.002 H: ΔI = 0.025 A = 25 mA.", "Increasing switching frequency cuts Δt and reduces ripple."],
        { staticVariants: [ ...(familyVariations.inductorV || []) ]}),
   8: C("A 2.0 A electromagnet decays freely through a diode loop with τ = 4 ms. Find coil current in A after t = 4 ms.",
        "I(t) = I_0 * exp(-t / tau)", "I = 2 * exp(-4 / 4) = 0.7357588823 A", 0.7357588823, "A",
        "RL freewheel exponential decay", "Freewheel diodes limit switch spike to ~0.7 V but stretch decay τ because loop R stays small.",
        ["Exponent t / τ = 4 / 4 = 1.", "Compute I = 2 * e^(-1) ≈ 0.736 A.", "Check: 36.8% of initial 2 A remains at 1τ."],
        { staticVariants: [
          { question:"5 A coil decays with τ=3 ms. Find current at t=3 ms.", formula:"I = I0*e^-1", sub:"I = 5 * exp(-3 / 3) = 1.839397206 A", expected:1.839397206, unit:"A" }
        ]}),
   9: C("Calculate inductive AC reactance X_L in Ω of a 10 mH EMI filter choke at 10 kHz.",
        "X_L = 2 * π * f * L", "X_L = 2 * π * 10000 * 0.01 = 628.3185307 Ω", 628.3185307, "Ω",
        "Inductive reactance grows linearly with frequency", "Unlike capacitors, inductors pass DC easily (X_L = 0) and block high-frequency noise.",
        ["Convert 10 kHz = 10,000 Hz and 10 mH = 0.01 H.", "Multiply X_L = 2π * 10000 * 0.01 ≈ 628.32 Ω.", "Double frequency (20 kHz) doubles blocking reactance to 1256.6 Ω."],
        { staticVariants: [
          { question:"Find X_L in Ω for 5 mH at 1 kHz.", formula:"X_L = 2*π*f*L", sub:"X_L = 2 * π * 1000 * 0.005 = 31.41592654 Ω", expected:31.41592654, unit:"Ω" }
        ]}),
   10: C("Series-Parallel RL Time Constant: A 12 mH inductor sees a discharge resistor network consisting of 30 Ω in series with (60 Ω || 60 Ω), giving R_eq = 60 Ω. Find RL time constant τ in µs.",
         "tau_us = 1000000 * L / (R1 + (R2*R3)/(R2+R3))", "tau_us = 1000000 * 0.012 / (30 + (60*60)/(60+60)) = 200 µs", 200, "µs",
         "Combine Thevenin resistance before τ = L / R_eq", "In multi-resistor RL networks, reduce the resistive network seen by L first to get R_th, then divide L / R_th.",
         ["Reduce parallel bank: 60 || 60 = 30 Ω.", "Add series resistor: R_th = 30 + 30 = 60 Ω.", "Compute τ = 0.012 H / 60 Ω = 0.0002 s = 200 µs."],
         { topology: "series-parallel", staticVariants: [
           { question:"10 mH sees 10 Ω + (40 Ω || 40 Ω) (30 Ω? Make 20+20||20=30). Find τ for 12 mH into 10+(60||30)=30 Ω in µs.", formula:"tau = 1e6*L/R_eq", sub:"tau = 1000000 * 0.012 / (10 + (60*30)/(60+30)) = 400 µs", expected:400, unit:"µs", topology:"series-parallel" }
         ]})
  },

  filters: {
   2: C("An RL passive filter combines R = 100 Ω and L = 10 mH. Find its −3 dB corner frequency f_c = R / (2πL) in Hz.",
        "f_c = R / (2 * π * L)", "f_c = 100 / (2 * π * 0.01) = 1591.549431 Hz", 1591.549431, "Hz",
        "RL filter cutoff swaps RC formula upside down", "At cutoff f_c, inductive reactance X_L matches R (2π·f_c·L = R).",
        ["Convert L = 10 mH = 0.01 H.", "Divide f_c = 100 / (2π * 0.01) ≈ 1591.55 Hz.", "Note: increasing R raises f_c in RL filters (opposite of RC!)."],
        { staticVariants: [ ...(familyVariations.rcFc || []) ]}),
   3: C("A 1st-order RC low-pass filter sees a noise tone 10x above its cutoff frequency (f/f_c = 10). Compute exact attenuation loss in dB = 20·log10(√(1 + 10²)).",
        "Loss_dB = 20 * log10(√(1 + (f/f_c)^2))", "Loss = 20 * log10(√(1 + 10*10)) = 20.04321374 dB", 20.04321374, "dB",
        "First-order +20 dB/decade stopband roll-off", "One decade above cutoff, a 1st-order passive filter rejects noise by ~20 dB (10:1 voltage ratio).",
        ["Evaluate denominator √(1 + 100) = √101 ≈ 10.05.", "Take 20 * log10(10.05) ≈ 20.04 dB.", "Matches Bode straight-line asymptote of 20 dB/decade."],
        { staticVariants: [
          { question:"At f = 100*f_c (2 decades above), find 1st-order loss in dB.", formula:"Loss = 20*log10(sqrt(1+100^2))", sub:"Loss = 20 * log10(√(1 + 100*100)) = 40.00043427 dB", expected:40.00043427, unit:"dB" }
        ]}),
   4: C("A 2nd-order Sallen-Key low-pass filter rolls off at −40 dB/decade in its stopband. How many dB of attenuation appear at 2 decades above cutoff (f = 100·f_c)?",
        "Attn_dB = slope * decades", "Attn = 40 * 2 = 80 dB", 80, "dB",
        "Higher-order filters steepen stopband slope", "Doubling filter order doubles dB/decade rejection slope against switching harmonics.",
        ["Multiply 2 decades by 40 dB/decade.", "40 * 2 = 80 dB (10,000:1 amplitude rejection!).", "Used before high-resolution ADCs to crush aliasing tones."],
        { staticVariants: [
          { question:"A 3rd-order filter (−60 dB/dec) reaches 2 decades above f_c. Find stopband attenuation in dB.", formula:"Attn = 60 * 2", sub:"Attn = 60 * 2 = 120 dB", expected:120, unit:"dB" }
        ]}),
   5: C("An RF intermediate-frequency bandpass filter centered at f_0 = 10 MHz has Quality factor Q = 25. Compute its −3 dB passband width BW in kHz.",
        "BW_kHz = f_0_kHz / Q", "BW = 10000 / 25 = 400 kHz", 400, "kHz",
        "Q factor controls filter selectivity BW = f₀ / Q", "Higher Q narrows bandwidth tightly around center resonance while sharpening peak gain.",
        ["Convert 10 MHz = 10,000 kHz.", "Divide by Q = 25: 10,000 / 25 = 400 kHz.", "Span extends roughly ±200 kHz around 10 MHz center."],
        { staticVariants: [
          { question:"20 MHz filter with Q=40. Find −3 dB bandwidth in kHz.", formula:"BW = f0/Q", sub:"BW = 20000 / 40 = 500 kHz", expected:500, unit:"kHz" }
        ]}),
   7: C("In a series RLC tank with L = 4 mH, C = 0.1 µF (characteristic impedance √(L/C) = 200 Ω), and damping R = 20 Ω, find resonance Quality factor Q.",
        "Q = (1 / R) * √(L / C)", "Q = (1 / 20) * √(0.004 / 0.0000001) = 10", 10, " ",
        "RLC damping resistance limits peaking Q", "Series winding ESR/resistance damps resonant ringing; lowering R raises Q and peaking.",
        ["Compute characteristic tank impedance √(0.004 / 1e-7) = √40000 = 200 Ω.", "Divide by series R: Q = 200 / 20 = 10.", "Notice Q > 0.5 causes underdamped ringing on step edges."],
        { staticVariants: [ ...(familyVariations.lcF0 || []) ]}),
   8: C("Design an RC low-pass filter around R = 1 kΩ with exact cutoff f_c = 159.155 Hz. Solve required capacitance C in µF.",
        "C_uF = 1e6 / (2 * π * R * f_c)", "C = 1000000 / (2 * π * 1000 * 159.1549431) = 1 µF", 1, "µF",
        "Rearrange cutoff equation to choose component C", "In hardware design you fix f_c first from signal/noise spacing, pick R, then solve C.",
        ["Rearrange C = 1 / (2π · R · f_c).", "Compute C = 1 / (2π · 1000 · 159.155) = 1e-6 F = 1 µF.", "Cross-check: 1/(2π·1k·1µF) = 159.155 Hz."],
        { staticVariants: [
          { question:"R=10 kΩ, target f_c = 159.155 Hz. Solve C in µF.", formula:"C = 1e6/(2*π*R*fc)", sub:"C = 1000000 / (2 * π * 10000 * 159.1549431) = 0.1 µF", expected:0.1, unit:"µF" }
        ]}),
   9: C("A 5.0 V sine tone enters a passive RC low-pass filter exactly at its −3 dB cutoff frequency (f = f_c). Calculate exact output amplitude in V.",
        "V_out = V_in / √(1 + 1^2)", "V_out = 5 / √(1 + 1) = 3.535533906 V", 3.535533906, "V",
        "Exact −3 dB amplitude factor 1/√2 ≈ 0.707", "At f = f_c, output amplitude drops to 70.71% (half power) and phase lags −45°.",
        ["At f = f_c, X_C = R so |H(jω)| = 1 / √2 ≈ 0.7071.", "Multiply 5.0 * 0.7071 = 3.5355 V.", "Half-power point corresponds to −3.01 dB."],
        { staticVariants: [
          { question:"10 V tone sits right at f = f_c. Find output V.", formula:"V_out = Vin / sqrt(2)", sub:"V_out = 10 / √(2) = 7.071067812 V", expected:7.071067812, unit:"V" }
        ]}),
   10: C("Anti-Aliasing Margin Check: An ADC Nyquist limit is 50 kHz while an anti-aliasing 1st-order filter sits at f_c = 500 Hz (100× below Nyquist). Find exact attenuation 20·log10(√(1 + 100²)) in dB.",
         "Attn = 20 * log10(√(1 + (f/fc)^2))", "Attn = 20 * log10(√(1 + 100 * 100)) = 40.00043427 dB", 40.00043427, "dB",
         "Anti-aliasing filter sizing against ADC Nyquist rate", "Setting f_c 2 decades below Nyquist delivers ~40 dB rejection (100:1 voltage suppression) per pole.",
         ["Ratio f / f_c = 50,000 / 500 = 100 (two decades).", "Compute 20 * log10(√(10001)) ≈ 40.0 dB.", "Adding a 2nd pole boosts this to 80 dB."],
         { staticVariants: [
           { question:"f = 10*fc on 1-pole anti-alias filter. Find exact attenuation dB.", formula:"Attn = 20*log10(sqrt(1+100))", sub:"Attn = 20 * log10(√(1 + 10 * 10)) = 20.04321374 dB", expected:20.04321374, unit:"dB" }
         ]})
  },

  magnetics: {
   2: C("A step-down 10:1 transformer (N_p/N_s = 10) draws 0.5 A RMS on its primary winding. Find ideal secondary RMS load current in A.",
        "I_s = I_p * (N_p / N_s)", "I_s = 0.5 * 10 = 5 A", 5, "A",
        "Transformer current steps opposite to voltage", "By energy conservation (V_p·I_p = V_s·I_s), stepping voltage down 10x increases available secondary current 10x.",
        ["Turns ratio a = N_p / N_s = 10.", "Multiply primary current by turns ratio: I_s = 0.5 * 10 = 5 A.", "Confirm apparent VA remains identical on both sides."],
        { staticVariants: [ ...(familyVariations.transformer || []) ]}),
   3: C("An audio/telemetry 4:1 turns-ratio transformer (N_p / N_s = 4) drives an 8 Ω secondary load. Compute impedance reflected back onto the primary winding in Ω.",
        "Z_p = (N_p / N_s)^2 * Z_L", "Z_p = (4 * 4) * 8 = 128 Ω", 128, "Ω",
        "Transformer impedance transforms by turns ratio squared", "Because V scales by a and I scales by 1/a, V/I scales by a².",
        ["Square turns ratio: 4² = 16.", "Multiply secondary load: Z_p = 16 * 8 = 128 Ω.", "Used in RF/isolation stages for maximum power transfer matching."],
        { staticVariants: [
          { question:"3:1 turns-ratio transformer feeds 10 Ω load. Find primary reflected Z in Ω.", formula:"Z_p = a^2 * Z_L", sub:"Z_p = (3 * 3) * 10 = 90 Ω", expected:90, unit:"Ω" }
        ]}),
   4: C("A 240 V_rms primary drives a 20:1 center-tapped transformer (producing 12 V_rms end-to-end across the full secondary). Find RMS voltage from the center tap to ONE outer leg in V.",
        "V_half = (V_p / (N_p / N_s)) / 2", "V_half = (240 / 20) / 2 = 6 V", 6, "V",
        "Center-tap halves secondary winding span", "A center tap divides secondary turns evenly, providing symmetric half-amplitude split windings.",
        ["Full secondary RMS = 240 / 20 = 12 V_rms.", "Each half-winding delivers 12 / 2 = 6 V_rms relative to center tap.", "Used for 2-diode full-wave or bipolar ± supplies."],
        { staticVariants: [
          { question:"120 V drives 10:1 center-tapped transformer. Find half-winding V_rms.", formula:"V_half = (Vp/a)/2", sub:"V_half = (120 / 10) / 2 = 6 V", expected:6, unit:"V" }
        ]}),
   5: C("An isolation power transformer delivers 92 W to a test rack while dissipating 5 W in core hysteresis and 3 W in copper windings. Find transformer efficiency in %.",
        "eta = 100 * P_out / (P_out + P_core + P_cu)", "eta = 100 * 92 / (92 + 5 + 3) = 92 %", 92, "%",
        "Magnetic efficiency combines core and I²R copper losses", "Input power equals useful delivered power plus both fixed core loss and load-dependent copper loss.",
        ["Sum total input power: 92 + 5 + 3 = 100 W.", "Efficiency = (92 / 100) * 100 = 92%.", "Core loss occurs even at no-load; copper loss rises with I²."],
        { staticVariants: [
          { question:"Transformer outputs 180 W with 12 W core + 8 W copper loss. Find % eta.", formula:"eta = 100*Pout/Pin", sub:"eta = 100 * 180 / (180 + 12 + 8) = 90 %", expected:90, unit:"%" }
        ]}),
   7: C("A balanced 208 V line-to-line (V_LL) 3-phase Y-connected rack feeds phase-to-neutral equipment. Find nominal line-to-neutral phase voltage V_ph in V.",
        "V_ph = V_LL / √3", "V_ph = 208 / √(3) = 120.088856 V", 120.088856, "V",
        "Wye (Y) line-to-line vs phase-to-neutral √3 factor", "Because 3-phase vectors sit 120° apart, line-to-line voltage equals √3 × phase-to-neutral voltage.",
        ["Divide V_LL by √3 (≈ 1.73205).", "208 / √3 ≈ 120.1 V_rms per phase to neutral.", "Matches familiar 208 V / 120 V lab power panels!"],
        { staticVariants: [ ...(familyVariations.threephase || []) ]}),
   8: C("Power Triangle: A 3-phase test load draws 10 kVA apparent power while consuming 8 kW real work. Compute reactive power Q in kVAR.",
        "Q = √(S^2 - P^2)", "Q = √(10*10 - 8*8) = 6 kVAR", 6, "kVAR",
        "Right-triangle relationship S² = P² + Q²", "Inductive motor currents pull reactive kVAR out of phase with real kW power.",
        ["Apply power triangle: Q = √(S² − P²).", "√(100 − 64) = √36 = 6 kVAR.", "PF equals cos(φ) = 8 / 10 = 0.80 lagging."],
        { staticVariants: [
          { question:"13 kVA apparent, 5 kW real power. Find reactive kVAR.", formula:"Q = sqrt(S^2 - P^2)", sub:"Q = √(13*13 - 5*5) = 12 kVAR", expected:12, unit:"kVAR" }
        ]}),
   9: C("In a balanced Delta-connected 3-phase heater load, each internal heater phase carries 10 A RMS. Find feeder line current I_L in A.",
        "I_L = √3 * I_ph", "I_L = √(3) * 10 = 17.32050808 A", 17.32050808, "A",
        "Delta configuration multiplies phase current by √3", "Each Delta line feeder splits into two phase windings offset by 60°/120°, making I_L = √3 · I_phase.",
        ["Multiply phase current by √3 ≈ 1.73205.", "10 * √3 ≈ 17.32 A.", "Note V_LL equals V_phase in Delta, while current scales by √3."],
        { staticVariants: [
          { question:"Balanced Delta load pulls 20 A per phase. Find line current in A.", formula:"I_L = sqrt(3)*I_ph", sub:"I_L = √(3) * 20 = 34.64101615 A", expected:34.64101615, unit:"A" }
        ]}),
   10: C("Size the feeder breaker current for a balanced 480 V_LL 3-phase TVAC chiller drawing 12 kW real power at lagging PF = 0.85. Find line current I_L in A.",
         "I_L = P / (√3 * V_LL * PF)", "I_L = 12000 / (√(3) * 480 * 0.85) = 16.98109255 A", 16.98109255, "A",
         "Invert 3-phase real power equation for cable sizing", "Never forget BOTH √3 and PF when sizing breaker amps from kW nameplate power.",
         ["Convert 12 kW = 12,000 W.", "Divide 12000 / (1.73205 * 480 * 0.85) = 12000 / 706.68.", "I_L ≈ 16.98 A (choose > 20 A breaker rating)."],
         { staticVariants: [
           { question:"208 V_LL 3-phase motor delivers 6 kW at PF=0.8. Find line current in A.", formula:"I_L = P/(sqrt(3)*V*PF)", sub:"I_L = 6000 / (√(3) * 208 * 0.8) = 20.81794695 A", expected:20.81794695, unit:"A" }
         ]})
  },

  components: {
   2: C("A 12 V_rms AC secondary feeds a 4-diode silicon full-wave bridge rectifier (two 0.7 V drops conducting per half-cycle). Find ideal unloaded peak DC capacitor voltage in V.",
        "V_pk_dc = V_rms * √2 - 2 * V_f", "V_pk_dc = 12 * √(2) - 2 * 0.7 = 15.57056275 V", 15.57056275, "V",
        "Bridge rectifier peak charging and double diode drop", "Unloaded filter capacitors charge to AC peak (√2 · V_rms) minus TWO series forward diode drops.",
        ["Convert RMS to peak: 12 * √2 ≈ 16.971 V.", "Subtract two forward drops in full bridge: 2 * 0.7 = 1.4 V.", "Peak DC = 16.971 − 1.4 = 15.57 V."],
        { staticVariants: [ ...(familyVariations.ledR || []) ]}),
   3: C("A 12 V rail regulates down to a 5.1 V Zener diode via a 230 Ω series resistor (total R_s current = 30 mA). If the load draws 18 mA, find Zener shunt current I_Z in mA.",
        "I_Z = 1000 * ((V_in - V_Z) / R_s) - I_load", "I_Z = 1000 * ((12 - 5.1) / 230) - 18 = 12 mA", 12, "mA",
        "Zener shunt regulation obeys KCL current sharing", "Series resistor sets total supply current; any leftover current not taken by the load sinks through the Zener.",
        ["Total supply current through R_s: (12 − 5.1) / 230 = 6.9 / 230 = 30 mA.", "Subtract load demand: I_Z = 30 − 18 = 12 mA.", "If load opens completely (0 mA), Zener must safely handle all 30 mA."],
        { staticVariants: [
          { question:"9 V feeds 5 V Zener via 200 Ω; load takes 12 mA. Find Zener I_Z in mA.", formula:"I_Z = (Vin-Vz)/Rs - I_L", sub:"I_Z = 1000 * ((9 - 5) / 200) - 12 = 8 mA", expected:8, unit:"mA" }
        ]}),
   4: C("A low-side switching MOSFET with R_DS(on) = 15 mΩ carries 10 A continuously while ON. Compute conduction heat dissipation in W.",
        "P_cond = I_D^2 * R_ds_on", "P_cond = 10 * 10 * 0.015 = 1.5 W", 1.5, "W",
        "MOSFET ON-state I²·R_DS(on) loss", "Saturated switching MOSFETs behave like tiny ohmic resistors whose loss scales as I².",
        ["Convert 15 mΩ = 0.015 Ω.", "Square current and multiply: 10² * 0.015 = 1.5 W.", "Verify gate drive reaches full enhancement so R_DS(on) stays at spec."],
        { staticVariants: [
          { question:"8 mΩ MOSFET switches 15 A continuously. Find conduction W.", formula:"P = I^2 * R_on", sub:"P = 15 * 15 * 0.008 = 1.8 W", expected:1.8, unit:"W" }
        ]}),
   5: C("To drive a switching NPN BJT deeply into saturation at I_C = 100 mA using forced β = 10 (I_B = 10 mA) from a 5.0 V GPIO (V_BE = 0.7 V), size the base resistor R_B in Ω.",
        "R_B = (V_gpio - V_BE) / I_B", "R_B = (5.0 - 0.7) / (10 / 1000) = 430 Ω", 430, "Ω",
        "Forced-beta BJT switch overdrive design", "Never design BJT saturation switches around high linear datasheet h_FE; force I_B ≈ I_C / 10 for low V_CE(sat).",
        ["Required base current: 100 mA / 10 = 10 mA.", "Voltage across R_B: 5.0 − 0.7 = 4.3 V.", "R_B = 4.3 V / 0.01 A = 430 Ω."],
        { staticVariants: [
          { question:"3.3 V GPIO drives NPN V_BE=0.7 V at I_B=5 mA. Size R_B in Ω.", formula:"R_B = (V - 0.7)/IB", sub:"R_B = (3.3 - 0.7) / (5 / 1000) = 520 Ω", expected:520, unit:"Ω" }
        ]}),
   6: C("An onboard silicon oscillator buffer clocks an expansion ADC at 1.0 MHz. Find single clock cycle period T in ns.",
        "T_ns = 1000 / f_MHz", "T = 1000 / 1 = 1000 ns", 1000, "ns",
        "Component switching frequency to period conversion", "Converts MHz datasheet frequency ratings into oscilloscope nanoseconds per period.",
        ["Convert 1.0 MHz = 10^6 cycles/s.", "Invert T = 1 / 10^6 s = 1 µs = 1000 ns.", "Confirm 1000 cycles per millisecond."],
        { staticVariants: [ ...(familyVariations.clockPeriod || []) ]}),
   7: C("An open-drain output pulls down a 3.3 V rail through a 2.2 kΩ pull-up resistor while its internal FET has R_ON = 50 Ω (forming a series voltage divider). Compute pulled-low V_OL voltage in mV.",
        "V_OL_mV = 1000 * V_dd * (R_on / (R_pu + R_on))", "V_OL = 1000 * 3.3 * (50 / (2200 + 50)) = 73.33333333 mV", 73.33333333, "mV",
        "Pull-up strength creates finite V_OL divider floor", "Too small a pull-up resistor fights the sinking FET and pushes V_OL toward logic invalidity.",
        ["Total divider path: 2200 + 50 = 2250 Ω.", "V_OL = 3.3 * (50 / 2250) = 0.07333 V = 73.33 mV.", "Well below standard 0.4 V CMOS V_IL limit."],
        { staticVariants: [ ...(familyVariations.clockPeriod || []) ]}),
   8: C("A non-inverting op-amp shunt amplifier uses feedback R_f = 18 kΩ and ground resistor R_g = 2 kΩ (gain 1 + R_f/R_g) to amplify a 0.25 V sensor signal. Find amplifier output voltage in V.",
        "V_out = V_in * (1 + R_f / R_g)", "V_out = 0.25 * (1 + 18000 / 2000) = 2.5 V", 2.5, "V",
        "Non-inverting op-amp closed-loop gain", "Negative feedback uses a resistor divider to set exact closed-loop gain independent of raw open-loop variations.",
        ["Compute closed-loop gain: A_v = 1 + (18k / 2k) = 1 + 9 = 10.", "Multiply input: V_out = 0.25 * 10 = 2.5 V.", "Verify 2.5 V stays comfortably inside e.g. 3.3 V ADC range."],
        { staticVariants: [
          { question:"Rf=27 kΩ, Rg=3 kΩ amplifies 0.3 V input. Find V_out in V.", formula:"Vout = Vin*(1+Rf/Rg)", sub:"Vout = 0.3 * (1 + 27000 / 3000) = 3 V", expected:3, unit:"V" }
        ]}),
   9: C("A silicon PN junction drops 0.70 V at 25 °C with a temperature coefficient of −2 mV/°C. Predict its forward drop V_f in V at +100 °C hot test.",
        "V_f_hot = V_25 + tc * (T_hot - 25)", "V_f_hot = 0.70 + (-0.002) * (100 - 25) = 0.55 V", 0.55, "V",
        "Negative silicon diode temperature coefficient", "Heating a diode lowers its barrier drop; thermal runaway or shifted bias points occur if uncompensated.",
        ["Temperature delta ΔT = 100 − 25 = +75 °C.", "Voltage shift = −2 mV/°C * 75 °C = −150 mV = −0.15 V.", "V_f(+100 °C) = 0.70 − 0.15 = 0.55 V."],
        { staticVariants: [
          { question:"Diode starts at 0.72 V at 25 °C (−2 mV/°C). Find V_f at 75 °C.", formula:"Vf = V25 - 0.002*dT", sub:"Vf = 0.72 + (-0.002) * (75 - 25) = 0.62 V", expected:0.62, unit:"V" }
        ]}),
   10: C("A MOSFET with total gate charge Q_g = 24 nC switches at 250 kHz in a synchronous buck converter. Calculate average gate-driver current I_g = Q_g · f_sw in mA.",
         "I_g_mA = 1000 * Q_g * f_sw", "I_g = 1000 * (24 / 1000000000) * 250000 = 6 mA", 6, "mA",
         "MOSFET switching gate-drive current Q_g·f", "Driving large MOSFET gates at high PWM frequency draws continuous average supply current from the gate-driver rail.",
         ["Convert Q_g = 24e-9 C and f_sw = 250,000 Hz.", "Compute average current = 24e-9 * 250e3 = 0.006 A = 6 mA.", "Peak turn-on pulse lasts nanoseconds at much higher amperage."],
         { staticVariants: [
           { question:"30 nC gate switches at 400 kHz. Find gate-drive mA.", formula:"Ig = 1000*Qg*f", sub:"Ig = 1000 * (30 / 1000000000) * 400000 = 12 mA", expected:12, unit:"mA" }
         ]})
  },

  "power-rails": {
   2: C("A flight PCBA draws 3.3 V @ 0.4 A (I/O), 1.8 V @ 0.5 A (ADC/PLL), and 1.0 V @ 2.0 A (ASIC core). Compute total regulated load power across all three rails in W.",
        "P_tot = V1*I1 + V2*I2 + V3*I3", "P_tot = 3.3*0.4 + 1.8*0.5 + 1.0*2.0 = 4.22 W", 4.22, "W",
        "Sum multi-rail PCBA power tree demand", "Always sum V·I per rail rather than summing raw amperages across different voltage domains.",
        ["Rail powers: 1.32 W + 0.90 W + 2.00 W.", "Sum: P_tot = 4.22 W.", "Must divide by upstream converter efficiencies to size battery input."],
        { staticVariants: [ ...(familyVariations.railPower || []) ]}),
   3: C("A continuous-conduction synchronous buck converter steps a 12.0 V main bus down to 3.3 V. Find its ideal steady-state PWM duty cycle D in %.",
        "D_pct = 100 * (V_out / V_in)", "D_pct = 100 * (3.3 / 12) = 27.5 %", 27.5, "%",
        "Ideal buck duty cycle D = V_out / V_in", "Duty cycle sets average switch-node voltage directly before LC filtering.",
        ["Divide output by input: 3.3 / 12 = 0.275.", "Convert to percentage: 27.5%.", "Watch input range: if 12 V drops to 5 V, D must widen to 66%."],
        { staticVariants: [
          { question:"24 V buck steps to 3.6 V. Find ideal duty %.", formula:"D = 100*Vout/Vin", sub:"D = 100 * (3.6 / 24) = 15 %", expected:15, unit:"%" }
        ]}),
   4: C("A 3.3 V rail drawing 3.0 A (9.9 W) is fed by a 90% efficient buck powered from an upstream 12.0 V bus. Calculate upstream 12 V supply current in A.",
        "I_in = (V_out * I_out) / (eta * V_in)", "I_in = (3.3 * 3) / (0.9 * 12) = 0.9166666667 A", 0.9166666667, "A",
        "Switching step-down reduces upstream bus current", "Unlike LDOs (where I_in ≈ I_out), buck converters step current UP at output and draw far less current from higher V_in.",
        ["Output power P_out = 3.3 * 3 = 9.9 W.", "Input power P_in = 9.9 / 0.90 = 11.0 W.", "12 V bus current = 11.0 W / 12 V ≈ 0.917 A."],
        { staticVariants: [
          { question:"5 V @ 4 A load via 80% buck on 20 V bus. Find 20 V bus A.", formula:"I_in = Vout*Iout/(eta*Vin)", sub:"I_in = (5 * 4) / (0.8 * 20) = 1.25 A", expected:1.25, unit:"A" }
        ]}),
   5: C("A hot-swap load switch ramps a 220 µF bus bulk bank cleanly at dV/dt = 2.0 V/ms during turn-on. Find controlled inrush charging current in mA.",
        "I_inrush_mA = 1000 * (C_uF / 1e6) * (dV_ms * 1000)", "I_inrush = 220 * 0.001 * 2000 = 440 mA", 440, "mA",
        "Control bus turn-on inrush via soft-start slew rate", "C in µF × dV/dt in V/ms yields mA directly because 10^-6 × 10^+3 = 10^-3!",
        ["Convert 2 V/ms = 2000 V/s and 220 µF = 2.2e-4 F.", "Multiply 2.2e-4 * 2000 = 0.44 A = 440 mA.", "Shortcut: 220 µF * 2 V/ms = 440 mA."],
        { staticVariants: [
          { question:"100 µF bus ramps at 1.5 V/ms. Find inrush mA.", formula:"I = C_uF * Slew_V_ms", sub:"I = 100 * 1.5 = 150 mA", expected:150, unit:"mA" }
        ]}),
   7: C("A 10 mΩ current-sense shunt feeds an INA current-sense amplifier with gain G = 50 V/V while carrying 4.0 A. Find amplifier output voltage to the ADC in V.",
        "V_adc = I_load * R_shunt * Gain", "V_adc = 4 * 0.01 * 50 = 2 V", 2, "V",
        "High-side / low-side shunt amplifier scaling", "Combines milliohm Ohm's Law drop with fixed analog instrumentation gain.",
        ["Shunt drop V_shunt = 4.0 A * 0.01 Ω = 40 mV.", "Multiply by gain 50: 0.04 V * 50 = 2.0 V.", "Cleanly fills over half of a 3.3 V ADC range without saturating."],
        { staticVariants: [ ...(familyVariations.shunt || []) ]}),
   8: C("A high-current 0.9 V ASIC core pulls 10 A through a power delivery path (positive plane + return plane) totaling 2.5 mΩ loop resistance. Find IR point-of-load voltage droop in mV.",
        "V_droop_mV = I * R_mOhm", "V_droop = 10 * 2.5 = 25 mV", 25, "mV",
        "Core rail millivolt PDN IR drop budget", "At sub-1 V core rails, even 25 mV droop consumes 2.8% of total tolerance margin!",
        ["10 A * 2.5 mΩ = 25 mV loss.", "Remote sense pins compensate regulator output up by 25 mV.", "Check: 25 mV / 900 mV = 2.78% rail droop."],
        { staticVariants: [
          { question:"12 A through 2 mΩ plane loop. Find PDN droop in mV.", formula:"V_droop = I * R_mOhm", sub:"V_droop = 12 * 2 = 24 mV", expected:24, unit:"mV" }
        ]}),
   9: C("A voltage supervisor trips when its FB pin reaches 0.6 V through a divider with top R1 = 45 kΩ and bottom R2 = 10 kΩ. Calculate the monitored rail trip voltage in V.",
        "V_trip = V_ref * (1 + R1 / R2)", "V_trip = 0.6 * (1 + 45000 / 10000) = 3.3 V", 3.3, "V",
        "Invert feedback divider to verify supervisor trip level", "Feedback thresholds behave like non-inverting references: V_rail = V_ref · (1 + R1 / R2).",
        ["Ratio R1 / R2 = 45 / 10 = 4.5.", "Multiply reference: V_trip = 0.6 * (1 + 4.5) = 0.6 * 5.5 = 3.3 V.", "Confirm resistor tolerance impacts reset trip accuracy."],
        { staticVariants: [
          { question:"0.8 V reference, R1=40 kΩ, R2=10 kΩ. Find regulated rail V.", formula:"V = Vref*(1+R1/R2)", sub:"V = 0.8 * (1 + 40 / 10) = 4 V", expected:4, unit:"V" }
        ]}),
   10: C("Two-Stage Cascaded Power Tree: A 20 V main bus feeds an 80% efficient buck producing 5.0 V, which feeds an LDO outputting 3.3 V at 1.0 A (note LDO pulls 1.0 A from 5 V, so buck delivers 5 W!). Find 20 V upstream current in mA.",
         "I_20V_mA = 1000 * ((V_buck * I_ldo) / eta) / V_in", "I_20V = 1000 * ((5 * 1) / 0.8) / 20 = 312.5 mA", 312.5, "mA",
         "Cascaded buck-then-LDO current draw across tree", "Remember LDO current efficiency is ~100% (I_in_ldo ≈ I_out_ldo), so the upstream buck delivers V_buck · I_out watts!",
         ["LDO output 1.0 A requires ~1.0 A from the 5.0 V buck = 5.0 W.", "Buck input power at 80% efficiency = 5.0 / 0.80 = 6.25 W.", "20 V bus current = 6.25 W / 20 V = 0.3125 A = 312.5 mA."],
         { staticVariants: [
           { question:"12 V -> 85% buck -> 5 V -> LDO 3.3 V @ 0.85 A. Find 12 V mA.", formula:"I_12 = 1000*(5*0.85/0.85)/12", sub:"I_12 = 1000 * ((5 * 0.85) / 0.85) / 12 = 416.6666667 mA", expected:416.6666667, unit:"mA" }
         ]})
  },

  schematics: {
   1: C("Flight Schematic Sheet 3 routes three zero-ohm-style harness jumpers measuring 100 Ω, 150 Ω, and 50 Ω in series across test points TP1–TP4. Find power-OFF series resistance in Ω.",
        "R_tot = R1 + R2 + R3", "R_tot = 100 + 150 + 50 = 300 Ω", 300, "Ω",
        "Sum power-off series schematic trace path", "Before powering a board, summing known series components establishes the expected baseline ohms reading between test points.",
        ["Identify single series chain TP1 -> TP4.", "Sum resistances: 100 + 150 + 50 = 300 Ω.", "Never take DMM Ω readings with board rails energized."],
        { staticVariants: [ ...(familyVariations.seriesR || []) ]}),
   2: C("A 2-wire DMM shows 0.35 Ω when probes are shorted together, then reads 1.15 Ω across a PCB ground strap. Find true strap resistance in Ω.",
        "R_true = R_meas - R_lead", "R_true = 1.15 - 0.35 = 0.8 Ω", 0.8, "Ω",
        "Zero out DMM lead offset during sub-ohm short checks", "Cheap alligator leads add 0.2–0.5 Ω in series; use REL mode or subtract lead zero before trusting milliohm readings.",
        ["Probe shorted baseline = 0.35 Ω.", "Subtract lead offset: 1.15 − 0.35 = 0.80 Ω.", "For < 0.5 Ω hunting, switch to 4-wire Kelvin or microvolt injection."],
        { staticVariants: [ ...(familyVariations.seriesR || []) ]}),
   3: C("Before powering +3.3V on a bare PCBA, three permanent 3.3 kΩ I2C/reset pull-up resistors sit in parallel between +3.3V and held-low IC pins (at diode-off DMM voltage). Find expected cold net resistance in Ω.",
        "R_cold = R_pu / N", "R_cold = 3300 / 3 = 1100 Ω", 1100, "Ω",
        "Compute expected cold ohming budget before first power-up", "Multiple parallel pull-ups/dividers lower net cold impedance naturally—verify expected kΩ rather than guessing 'short'!",
        ["Three equal 3.3 kΩ paths sit in parallel.", "R_cold = 3300 / 3 = 1100 Ω (1.1 kΩ).", "Any reading like 2 Ω points to a genuine solder bridge."],
        { staticVariants: [
          { question:"Four parallel 10 kΩ dividers hang off a 3.3 V net. Find cold resistance in Ω.", formula:"R = R1 / 4", sub:"R = 10000 / 4 = 2500 Ω", expected:2500, unit:"Ω" }
        ]}),
   4: C("Schematic Assembly Audit (Series-Parallel Load): On Rev A, an STM32 reset line pulls up to 3.3 V via 10 kΩ, while an accidental 10 kΩ debug fixture pull-down remains populated to GND. Predict idle NRST pin voltage in V.",
        "V_pin = V_dd * (R_pd / (R_pu + R_pd))", "V_pin = 3.3 * (10000 / (10000 + 10000)) = 1.65 V", 1.65, "V",
        "Unintended schematic divider traps logic pins in mid-rail", "Two competing 10 kΩ resistors hold the input pin inside the forbidden 1.65 V CMOS threshold band.",
        ["Equal 10 kΩ pull-up and pull-down create a 50% divider.", "V_pin = 3.3 * 0.5 = 1.65 V.", "Explains sporadic brownout resets on initial board bring-up!"],
        { topology: "series-parallel", staticVariants: [ ...(familyVariations.divider || []) ]}),
   5: C("4-Wire Millivolt Short Tracing: Injecting 1.0 A current-limited onto a shorted copper rail gives 12.4 mV at connector J1 and 4.8 mV downstream near U3. Find voltage drop ΔV along that copper segment in mV.",
        "dV = V_1 - V_2", "dV = 12.4 - 4.8 = 7.6 mV", 7.6, "mV",
        "Follow dropping millivolt gradient straight to a dead short", "Along a copper short path, voltage falls monotonically toward the short location and flattens past it.",
        ["Delta = 12.4 − 4.8 = 7.6 mV drop between J1 and U3.", "Since V continues falling toward U3, short sits downstream of J1 (7.6 mΩ trace segment).", "Zero gradient after a point means zero current flows further—you passed the short!"],
        { staticVariants: [
          { question:"Pad A reads 18.2 mV and Pad B reads 11.5 mV at 1 A injection. Find ΔV in mV.", formula:"dV = Va - Vb", sub:"dV = 18.2 - 11.5 = 6.7 mV", expected:6.7, unit:"mV" }
        ]}),
   6: C("Schematic Sheet 4 feeds +3.3 V through top R1 = 1000 Ω and bottom R2 = 1000 Ω to set an unloaded comparator threshold V_th. Compute expected nominal pin voltage in V.",
        "V_th = V_in * (R2 / (R1 + R2))", "V_th = 3.3 * (1000 / (1000 + 1000)) = 1.65 V", 1.65, "V",
        "Verify schematic divider threshold before board bring-up", "Compute expected unloaded divider node voltage from schematic BOM values before checking test points.",
        ["Equal 1000 Ω legs give a 1/2 ratio.", "Multiply rail voltage: 3.3 * 0.5 = 1.65 V.", "Verify comparator/MCU input leakage doesn't load down large MΩ dividers."],
        { staticVariants: [ ...(familyVariations.divider || []) ]}),
   7: C("Current-Limited Bring-Up Clamp: You set a bench PSU to 12 V with a safe 200 mA CC limit, powering a board with an unintended 15 Ω fault path. Calculate actual clamped rail voltage in V.",
        "V_clamp = (I_lim_mA / 1000) * R_fault", "V_clamp = (200 / 1000) * 15 = 3 V", 3, "V",
        "Constant-current mode collapses rail safely below V_set", "In CC mode, Ohm's Law across the fault resistance dictates voltage: V = I_limit · R_fault.",
        ["Current limit holds I = 0.200 A.", "Rail clamps to V = 0.2 * 15 = 3.0 V.", "Total board heat stays safely at 3 V * 0.2 A = 0.6 W instead of 9.6 W!"],
        { staticVariants: [
          { question:"PSU limited at 150 mA sees a 12 Ω short. Find clamped rail V.", formula:"V = I_lim * R", sub:"V = (150 / 1000) * 12 = 1.8 V", expected:1.8, unit:"V" }
        ]}),
   8: C("A 3.3 V signal passes through a 100 kΩ series protection resistor, yet a high-Z DMM reads only 2.8 V at the IC pin due to solder-flux leakage to GND. Calculate hidden leakage current in µA.",
        "I_leak_uA = 1000000 * ((V_src - V_pin) / R_prot)", "I_leak = 1000000 * ((3.3 - 2.8) / 100000) = 5 µA", 5, "µA",
        "High-series-R nodes reveal microamp board leakage via Ohm's Law", "Any voltage deficit across a known high series resistor directly measures parasitic leakage current.",
        ["Drop across 100 kΩ resistor = 3.3 − 2.8 = 0.5 V.", "Leakage current I = 0.5 V / 100,000 Ω = 5e-6 A = 5 µA.", "Ultrasonic flux wash typically eliminates this leakage instantly."],
        { staticVariants: [
          { question:"5.0 V via 50 kΩ reads 4.7 V due to leakage. Find µA.", formula:"I = 1e6*(Vs-Vp)/R", sub:"I = 1000000 * ((5.0 - 4.7) / 50000) = 6 µA", expected:6, unit:"µA" }
        ]}),
   9: C("A loose mating header pin develops 0.25 Ω contact resistance while supplying a 2.0 A actuator rail. Calculate local pin heat power in W.",
        "P_pin = I^2 * R_contact", "P_pin = 2 * 2 * 0.25 = 1 W", 1, "W",
        "Tiny contact resistance causes plastic header melting", "One watt concentrated inside a tiny metal crimp pin rapidly overheats housing plastics.",
        ["Apply P = I² · R_contact.", "2² * 0.25 = 4 * 0.25 = 1.0 W localized inside 1 pin.", "Double up high-current pins or lower current per pin."],
        { staticVariants: [
          { question:"0.15 Ω contact carries 4 A. Find local pin heat in W.", formula:"P = I^2 * R", sub:"P = 4 * 4 * 0.15 = 2.4 W", expected:2.4, unit:"W" }
        ]}),
   10: C("Series-Parallel Branch Open Fault Drop: Across 12 V, a shared 20 Ω fuse feeds two parallel 40 Ω heater branches (R_tot = 40 Ω, I_tot = 300 mA). One 40 Ω branch opens (R_new = 60 Ω). Find drop in total supply current ΔI in mA.",
         "dI_mA = 1000 * (V/R_old - V/R_new)", "dI = 1000 * (12/(20 + (40*40/(40+40))) - 12/(20 + 40)) = 100 mA", 100, "mA",
         "Diagnose blown branch via total current drop in series-parallel system", "Notice total current drops only 33% rather than 50% because the series fuse reduces voltage drop once total current falls!",
         ["Healthy R_old = 20 + (40||40) = 40 Ω -> I_old = 12/40 = 300 mA.", "Faulted R_new = 20 + 40 = 60 Ω -> I_new = 12/60 = 200 mA.", "Drop ΔI = 300 − 200 = 100 mA."],
         { topology: "series-parallel", staticVariants: [
           { question:"10 V feeds 10 Ω fuse + (30 Ω || 30 Ω); one branch opens. Find ΔI in mA.", formula:"dI = 1000*(I_old - I_new)", sub:"dI = 1000 * (10/(10 + (30*30/(30+30))) - 10/(10+30)) = 150 mA", expected:150, unit:"mA", topology:"series-parallel" }
         ]})
  },

  instruments: {
   2: C("What is the absolute theoretical minimum Nyquist sample rate (2 × f_max) in MS/s required to reconstruct a 25 MHz signal without aliasing?",
        "f_nyq = 2 * f_max", "f_nyq = 2 * 25 = 50 MS/s", 50, "MS/s",
        "Nyquist criterion minimum sampling speed", "Real-world scopes aim for 5x–10x signal bandwidth; 2x is the bare aliasing cliff.",
        ["Multiply max frequency component by 2: 2 * 25 = 50 MS/s.", "Remember digital clocks hold sharp harmonics (3rd/5th) well above fundamental frequency!", "Sampling slower wraps high edges down as fake slow waves (aliasing)."],
        { staticVariants: [ ...(familyVariations.scopeSamples || []) ]}),
   3: C("To faithfully resolve a fast 1.4 ns CMOS logic rising edge, estimate required analog front-end bandwidth using f_BW ≈ 0.35 / t_r in MHz.",
        "f_BW_MHz = 0.35 / (t_r_ns / 1000)", "f_BW = 0.35 / (1.4 / 1000) = 250 MHz", 250, "MHz",
        "Edge rise time sets bandwidth, not clock rate", "Even a slow 1 MHz SPI clock with 1.4 ns sharp edges carries 250 MHz harmonic content.",
        ["Convert t_r = 1.4 ns = 0.0014 µs (1000 MHz scale factor).", "Divide 350 / 1.4 = 250 MHz.", "Using a 50 MHz scope blurs a 1.4 ns edge to look ~7 ns wide!"],
        { staticVariants: [
          { question:"Estimate bandwidth in MHz needed for a 0.7 ns rise edge (0.35 / t_r).", formula:"f_BW = 350 / tr_ns", sub:"f_BW = 0.35 / (0.7 / 1000) = 500 MHz", expected:500, unit:"MHz" }
        ]}),
   4: C("A 3.0 ns rise-time oscilloscope pairs with a 4.0 ns rise-time passive probe. Find effective combined system rise time √(t_scope² + t_probe²) in ns.",
        "t_sys = √(t_scope^2 + t_probe^2)", "t_sys = √(3*3 + 4*4) = 5 ns", 5, "ns",
        "Cascaded probe + scope rise times add by RSS", "Probe and scope front-end bandwidths degrade edge speed as root-sum-of-squares.",
        ["Square both rise times: 3² + 4² = 9 + 16 = 25.", "Square root: √25 = 5.0 ns.", "Only buy probes matching or beating oscilloscope bandwidth."],
        { staticVariants: [
          { question:"6 ns scope + 8 ns probe: find combined system rise time in ns.", formula:"t_sys = sqrt(t1^2+t2^2)", sub:"t_sys = √(6*6 + 8*8) = 10 ns", expected:10, unit:"ns" }
        ]}),
   5: C("Probe Loading Error: Touching a 1× oscilloscope probe (1 MΩ to GND) directly onto a 1 MΩ Thevenin sensor resting at 4.0 V drags the node down. What loaded voltage in V appears on screen?",
        "V_meas = V_oc * (R_probe / (R_th + R_probe))", "V_meas = 4 * (1 / (1 + 1)) = 2 V", 2, "V",
        "1x probe loading forms a 50% divider on high-Z nodes", "Always switch to 10x probe mode (10 MΩ) before probing timing RC networks or op-amp references.",
        ["1 MΩ source R_th splits 4.0 V with 1 MΩ probe input.", "V_meas = 4 * (1 / 2) = 2.0 V (50% attenuation bug!).", "At 10x (10 MΩ), reading improves to 4 * 10/11 = 3.64 V."],
        { staticVariants: [
          { question:"1 MΩ probe measures a 500 kΩ node at 3.0 V unloaded. Find reading in V.", formula:"V = Voc * (1/(0.5+1))", sub:"V = 3 * (1 / (0.5 + 1)) = 2 V", expected:2, unit:"V" }
        ]}),
   7: C("DMM Ammeter Burden Voltage: A multimeter set to mA range inserts 2.5 Ω fuse+shunt resistance in series with a circuit pulling 120 mA. Find unwanted DMM burden voltage drop in V.",
        "V_burden = (I_mA / 1000) * R_shunt", "V_burden = (120 / 1000) * 2.5 = 0.3 V", 0.3, "V",
        "Ammeter shunt drops real voltage out of low-V loops", "Placing a DMM ammeter in series with a 1.8 V rail can starve the DUT into resetting due to burden voltage!",
        ["Convert 120 mA = 0.12 A.", "Multiply by DMM internal resistance: 0.12 * 2.5 = 0.30 V.", "Use current-clamp probes or higher mA range on sensitive low-V circuits."],
        { staticVariants: [ ...(familyVariations.timeDiv || []) ]}),
   8: C("Capture Buffer Memory Depth: An oscilloscope runs at 500 MS/s across a 10 ms total screen window. Calculate memory samples required in MS (megasamples).",
        "Mem_MS = Rate_MSps * (Win_ms / 1000)", "Mem = 500 * (10 / 1000) = 5 MS", 5, "MS",
        "Memory Depth = Sample Rate × Acquisition Window", "Shallow memory forces scopes to silently drop sample rate when zooming out time/div!",
        ["Convert 10 ms = 0.01 s.", "Multiply 500 MS/s * 0.01 s = 5 MS (5 million points).", "Always verify live sample-rate readout on slow horizontal sweeps."],
        { staticVariants: [
          { question:"At 1000 MS/s across 4 ms screen window, find needed megasamples.", formula:"Mem = Rate * Window", sub:"Mem = 1000 * (4 / 1000) = 4 MS", expected:4, unit:"MS" }
        ]}),
   9: C("Vertical ADC Resolution: An 8-bit oscilloscope ADC (256 discrete quantization codes) spans 8 vertical divisions set to 100 mV/div (800 mV full scale). Find minimum LSB voltage step size in mV.",
        "V_lsb_mV = (divs * mv_per_div) / 256", "V_lsb = (8 * 100) / 256 = 3.125 mV", 3.125, "mV",
        "8-bit scope quantization limits tiny ripple visibility", "Zooming vertical scale too wide throws away dynamic resolution inside coarse 3+ mV quantization steps.",
        ["Full-scale vertical window = 8 div * 100 mV/div = 800 mV.", "Divide by 2^8 = 256 levels: 800 / 256 = 3.125 mV per ADC step.", "Tighten mV/div so waveform fills 6–7 vertical divisions."],
        { staticVariants: [
          { question:"8-bit scope across 8 divisions at 200 mV/div (1600 mV full). Find LSB in mV.", formula:"V_lsb = Full / 256", sub:"V_lsb = (8 * 200) / 256 = 6.25 mV", expected:6.25, unit:"mV" }
        ]}),
   10: C("DMM Uncertainty Budget: A bench DMM accuracy spec reads ±(0.5% of reading + 2 digits) when measuring 10.00 V on the 20 V range (1 digit = 0.01 V). Find worst-case uncertainty window ±ΔV in mV.",
         "dV_mV = 1000 * (V_read * pct + digits * resolution)", "dV = 1000 * (10 * 0.005 + 2 * 0.01) = 70 mV", 70, "mV",
         "Translate datasheet ±(% + digits) spec into exact mV bounds", "Automated SCPI pass/fail guardbands must subtract DMM uncertainty before signing off hardware.",
         ["Reading term: 0.5% * 10.00 V = 0.050 V = 50 mV.", "Floor digit term: 2 * 0.01 V = 0.020 V = 20 mV.", "Total uncertainty = 50 + 20 = ±70 mV."],
         { staticVariants: [
           { question:"Spec ±(0.5% + 3 digits) at 4.00 V (0.01 V/digit). Find uncertainty mV.", formula:"dV = 1000*(V*0.005 + 3*0.01)", sub:"dV = 1000 * (4 * 0.005 + 3 * 0.01) = 50 mV", expected:50, unit:"mV" }
         ]})
  },

  timing: {
   2: C("Static Timing Setup Slack: On a 50 MHz clock (T_clk = 20 ns), launch flip-flop T_co = 3.0 ns, combinational logic propagation T_pd = 12.0 ns, and capture T_su = 1.5 ns. Find setup timing slack in ns.",
        "Slack = T_clk - (T_co + T_pd + T_su)", "Slack = 20 - (3 + 12 + 1.5) = 3.5 ns", 3.5, "ns",
        "Positive setup slack means data arrives before clock edge", "Setup time requires data to stabilize BEFORE the active clock edge by T_su.",
        ["Required data path total: 3.0 + 12.0 + 1.5 = 16.5 ns.", "Subtract from 20 ns clock period: 20 − 16.5 = +3.5 ns slack.", "Negative slack causes metastability/bit flips at higher clock rates."],
        { staticVariants: [ ...(familyVariations.clockPeriod || []) ]}),
   3: C("Maximum Synchronous Clock Rate: A register-to-register path has T_co + T_pd + T_su = 12.5 ns (zero skew). Calculate maximum reliable clock frequency F_max in MHz.",
        "F_max_MHz = 1000 / T_min_ns", "F_max = 1000 / 12.5 = 80 MHz", 80, "MHz",
        "F_max = 1 / T_min set by longest critical path", "Minimum clock period cannot shrink below worst-case launch + logic + setup delay.",
        ["T_min = 12.5 ns.", "Invert to MHz (1000 / ns): 1000 / 12.5 = 80 MHz.", "Always add jitter and PVT derating margin below theoretical F_max."],
        { staticVariants: [
          { question:"Critical path takes 10 ns total. Find max F_max in MHz.", formula:"Fmax = 1000 / Tmin", sub:"Fmax = 1000 / 10 = 100 MHz", expected:100, unit:"MHz" }
        ]}),
   4: C("Hold-Time Margin with Clock Skew: Minimum launch T_co = 2.0 ns, fastest logic path T_pd = 1.5 ns, capture hold time T_hold = 2.0 ns, and positive clock skew = +0.5 ns. Find hold slack in ns.",
        "Hold_slack = (T_co + T_pd) - T_hold - T_skew", "Hold_slack = (2 + 1.5) - 2 - 0.5 = 1 ns", 1, "ns",
        "Hold time is independent of clock frequency", "Slowing the clock NEVER fixes a hold violation because new data races old data across the SAME clock edge!",
        ["Earliest new data arrival = 2.0 + 1.5 = 3.5 ns.", "Capture flip-flop stays sensitive until T_hold + skew = 2.0 + 0.5 = 2.5 ns.", "Hold margin = 3.5 − 2.5 = +1.0 ns."],
        { staticVariants: [
          { question:"Min T_co=1.5, T_pd=2.0, T_hold=1.5, skew=+1.0 ns. Find hold slack in ns.", formula:"Slack = Tco+Tpd-Th-skew", sub:"Slack = (1.5 + 2.0) - 1.5 - 1.0 = 1 ns", expected:1, unit:"ns" }
        ]}),
   5: C("STM32 PLL Clock Tree: An 8 MHz external HSE crystal passes through /2 prescaler (PLLM), ×24 VCO multiplier (PLLN), and /3 output divider (PLLR). Find resulting SYSCLK frequency in MHz.",
        "F_sysclk = (F_hse / PLLM) * PLLN / PLLR", "F_sysclk = (8 / 2) * 24 / 3 = 32 MHz", 32, "MHz",
        "Verify integer PLL stages against VCO limits", "MCUs generate high core clocks from low-frequency crystals via integer prescale, VCO multiply, and post-divide.",
        ["After /2 input divider: 8 / 2 = 4 MHz VCO reference.", "Multiply ×24 in VCO: 4 * 24 = 96 MHz VCO.", "Divide by 3 -> 96 / 3 = 32 MHz SYSCLK."],
        { staticVariants: [
          { question:"8 MHz HSE -> /4 PLLM -> x40 PLLN -> /2 PLLR. Find SYSCLK in MHz.", formula:"F = (8/4)*40/2", sub:"F = (8 / 4) * 40 / 2 = 40 MHz", expected:40, unit:"MHz" }
        ]}),
   7: C("PWM Digital-to-Analog Averaging: An STM32 timer outputs a 3.3 V logic square wave at 25% duty cycle into a low-pass RC averaging filter. Find ideal steady DC output voltage in V.",
        "V_dc = V_dd * duty", "V_dc = 3.3 * 0.25 = 0.825 V", 0.825, "V",
        "Filtered PWM generates proportional analog DC", "Integrating a 0-to-V_dd square pulse recovers its time-averaged voltage D · V_dd.",
        ["Duty fraction D = 25% = 0.25.", "Multiply logic high rail: 3.3 V * 0.25 = 0.825 V.", "Choose RC cutoff well below PWM switching frequency to minimize ripple."],
        { staticVariants: [ ...(familyVariations.duty || []) ]}),
   8: C("Cycle-to-Cycle Clock Jitter Derating: A 100 MHz clock (10.0 ns nominal period) suffers ±400 ps peak-to-peak jitter compressing worst-case single cycle T_min = 10.0 − 0.4 ns. Find T_min in ns.",
        "T_min = T_nom - Jitter_ns", "T_min = 10 - 0.4 = 9.6 ns", 9.6, "ns",
        "Setup analysis uses shortest compressed clock cycle", "Peak cycle-to-cycle jitter steals timing directly away from T_clk on tight setup paths.",
        ["Convert 400 ps = 0.4 ns worst-case period shrinkage.", "Subtract from 10.0 ns nominal period: 10.0 − 0.4 = 9.6 ns.", "Setup slack must remain positive even at 9.6 ns!"],
        { staticVariants: [
          { question:"50 MHz (20 ns) clock has 600 ps cycle shrinkage. Find worst T_min in ns.", formula:"T_min = 20 - 0.6", sub:"T_min = 20 - 0.6 = 19.4 ns", expected:19.4, unit:"ns" }
        ]}),
   9: C("Schmitt-Trigger Reset Stretch: An STM32 NRST RC network (τ = 20 ms) releases reset once pin voltage reaches 0.7×VDD (`t = −τ·ln(1−0.7)`). Find reset release hold duration in ms.",
        "t_rst = -tau * ln(1 - 0.7)", "t_rst = -20 * log10(1 - 0.7) / log10(exp(1)) = 24.07945609 ms", 24.07945609, "ms",
        "Predict exact hardware reset stretch past logic threshold", "RC power-on reset timers depend strictly on logic V_IH threshold fraction (e.g. 0.7·VDD) and τ.",
        ["Threshold gap remaining: 1 − 0.70 = 0.30.", "Compute t = −20 ms * ln(0.30) = 20 * 1.20397 ≈ 24.08 ms.", "Ensures VDD stabilizes before CPU fetches first reset vector."],
        { staticVariants: [
          { question:"τ=10 ms NRST pin releases at 0.7*VDD. Find reset hold in ms.", formula:"t = -tau*ln(0.3)", sub:"t = -10 * log10(0.3) / log10(exp(1)) = 12.03972804 ms", expected:12.03972804, unit:"ms" }
        ]}),
   10: C("CMOS Transition Slew Window: A buffer edge slewing linearly at 2.0 V/ns transitions from 0.6 V V_IL up to 2.4 V V_IH (ΔV = 1.8 V). Find transition dwell time inside the ambiguous zone in ns.",
         "t_trans = (V_IH - V_IL) / Slew_V_ns", "t_trans = (2.4 - 0.6) / 2 = 0.9 ns", 0.9, "ns",
         "Slow edge slew invites shoot-through and false clocking", "Spending excessive nanoseconds inside the transition region allows noise to trigger double clock edges.",
         ["Voltage swing between thresholds: 2.4 − 0.6 = 1.8 V.", "Divide by slew rate: 1.8 V / (2.0 V/ns) = 0.9 ns.", "Compare against datasheet maximum input Δt/ΔV spec."],
         { staticVariants: [
           { question:"Edge slews at 1.5 V/ns across 1.8 V threshold span. Find transition ns.", formula:"t = dV / slew", sub:"t = 1.8 / 1.5 = 1.2 ns", expected:1.2, unit:"ns" }
         ]})
  },

  buses: {
   2: C("UART Clock Drift Margin: Over an 8N1 frame (10 bits), TX clock runs +2.2% fast and RX clock runs −1.5% slow simultaneously. Find total combined relative baud mismatch magnitude in %.",
        "Drift_tot = |err_TX| + |err_RX|", "Drift_tot = 2.2 + 1.5 = 3.7 %", 3.7, "%",
        "Opposite TX and RX clock drifts add directly", "Even if each board stays within ±2.5%, opposite-sign drifts combine to threaten the ±4–5% 8N1 stop-bit limit.",
        ["Add absolute clock deviations: 2.2% + 1.5% = 3.7%.", "Remains just under ~4.5% practical 8N1 distortion limit.", "Internal RC oscillators often drift ±2% over temperature—prefer crystals for high baud."],
        { staticVariants: [ ...(familyVariations.uartTime || []) ]}),
   3: C("I2C Maximum Pull-Up Resistor: I2C Fast-Mode limits rise time t_r ≤ 300 ns across C_bus = 100 pF using standard threshold approximation R_max ≈ t_r / (0.8473 · C_bus). Calculate maximum R_p in Ω.",
        "R_max = t_r_ns / (0.8473 * C_bus_pF) * 1000", "R_max = 300 / (0.8473 * 100) * 1000 = 3540.658562 Ω", 3540.658562, "Ω",
        "Bus capacitance bounds maximum I2C pull-up resistance", "Weak pull-ups (e.g. 10 kΩ) fail to pull SDA/SCL through V_IH in 300 ns when cable/pin capacitance reaches 100 pF.",
        ["0.8473 factor comes from charging RC between 0.3·VDD and 0.7·VDD.", "R_max = 300e-9 / (0.8473 * 100e-12) ≈ 3541 Ω.", "Exceeding 3.5 kΩ rounds clock tops into sawtooth waves."],
        { staticVariants: [
          { question:"Fast-Mode t_r = 300 ns with 200 pF heavy bus. Find max R_p in Ω.", formula:"Rmax = tr/(0.8473*C)", sub:"Rmax = 300 / (0.8473 * 200) * 1000 = 1770.329281 Ω", expected:1770.329281, unit:"Ω" }
        ]}),
   4: C("I2C Minimum Pull-Up Resistor: On VDD = 3.3 V with max V_OL = 0.4 V, open-drain GPIO pins guarantee sinking at most I_OL = 3 mA. Calculate minimum safe pull-up resistor R_min in Ω.",
        "R_min = (V_dd - V_OL) / (I_OL_mA / 1000)", "R_min = (3.3 - 0.4) / (3 / 1000) = 966.6666667 Ω", 966.6666667, "Ω",
        "Sink current rating bounds minimum pull-up resistance", "Stiff pull-ups speed up rising edges, but too low a resistor prevents the driver from pulling LOW below V_OL = 0.4 V!",
        ["Worst-case drop across pull-up when line held LOW: 3.3 − 0.4 = 2.9 V.", "Divide by max sink current 0.003 A: 2.9 / 0.003 ≈ 966.7 Ω.", "Valid I2C pull-up must lie cleanly between R_min (~1 kΩ) and R_max (~3.5 kΩ)."],
        { staticVariants: [
          { question:"5 V I2C, V_OL=0.4 V, I_OL=3 mA max. Find R_min in Ω.", formula:"Rmin = (Vdd-Vol)/Iol", sub:"Rmin = (5 - 0.4) / (3 / 1000) = 1533.333333 Ω", expected:1533.333333, unit:"Ω" }
        ]}),
   5: C("Full I2C Register Read Frame Time: Reading 2 bytes at 400 kHz SCL takes 46 SCL clock cycles including Start/Addr/ACK/ReStart/Stop protocol overhead. Compute transaction wire time in µs.",
        "t_frame_us = cycles / (f_scl_kHz / 1000)", "t_frame = 46 / (400 / 1000) = 115 µs", 115, "µs",
        "Count ACK/Start/Address overhead in real I2C latency", "Raw byte rate overestimates I2C speed because addressing, R/W bit, and ACK/NACK stretch every transfer.",
        ["Total protocol clocks = 46 cycles.", "One 400 kHz clock = 2.5 µs.", "Multiply 46 * 2.5 µs = 115 µs total bus occupancy."],
        { staticVariants: [
          { question:"50-clock I2C transaction at 100 kHz Standard mode. Find frame µs.", formula:"t = cycles * 10", sub:"t = 50 / (100 / 1000) = 500 µs", expected:500, unit:"µs" }
        ]}),
   7: C("CAN Bus Time Quantum (tq): A 500 kbps CAN bit period (2 µs) is divided by prescaler into 20 discrete Time Quanta (tq) to position sample point at 80%. Find duration of 1 tq in ns.",
        "tq_ns = (1000000 / kbps) / N_tq", "tq = (1000000 / 500) / 20 = 100 ns", 100, "ns",
        "CAN bit timing subdivides bits into SYNC, PROP, PHASE segments", "Matching sample points (~75–87.5%) across ECUs requires precise integer tq division from peripheral clock.",
        ["500 kbps bit time = 1 / 500,000 = 2 µs = 2000 ns.", "Divide by 20 quanta: 2000 / 20 = 100 ns per tq.", "Sample point at 16 tq sits at 80% inside the bit window."],
        { staticVariants: [ ...(familyVariations.spiTime || []) ]}),
   8: C("CAN Termination Fault Check: A healthy twisted pair puts two 120 Ω end terminators in parallel (60 Ω). A technician mistakenly leaves a 3rd node's 120 Ω terminator jumper installed! Find new bus DMM resistance in Ω.",
        "R_bus = 120 / 3", "R_bus = 120 / 3 = 40 Ω", 40, "Ω",
        "Check power-off CANH–CANL ohmic signature (60 Ω vs 120 Ω vs 40 Ω)", "Ohmmeter across CANH–CANL instantly distinguishes missing (120 Ω), healthy (60 Ω), or triple (40 Ω) termination.",
        ["Three equal 120 Ω resistors in parallel: 120 / 3 = 40 Ω.", "Drivers over-current or lose eye margin when R_bus falls to 40 Ω.", "120 Ω reading means open trunk or missing second terminator."],
        { staticVariants: [
          { question:"One of two 120 Ω CAN terminators breaks open. What does DMM read in Ω?", formula:"R = 120", sub:"R = 120 * 1 = 120 Ω", expected:120, unit:"Ω" }
        ]}),
   9: C("Effective SPI Throughput with CS Gap: Transmitting 64-bit frames at 8.0 MHz SCLK takes 8 µs of active clocking plus a mandatory 2 µs CS-high turnaround pause (10 µs cycle). Find net effective throughput in Mbps.",
        "Mbps = bits / t_cycle_us", "Mbps = 64 / ((64 / 8) + 2) = 6.4 Mbps", 6.4, "Mbps",
        "Inter-frame CS turnaround throttles real SPI bandwidth", "CPU interrupt overhead between 1-word/multi-word bursts often drops effective speed far below nominal SCLK.",
        ["Active clock time = 64 bits / 8 MHz = 8 µs.", "Total frame interval = 8 + 2 = 10 µs.", "Effective data rate = 64 bits / 10 µs = 6.4 Mbps (80% efficiency)."],
        { staticVariants: [
          { question:"32 bits at 8 MHz (4 µs) plus 4 µs CS pause (8 µs total). Find net Mbps.", formula:"Mbps = bits / (t_clk + t_gap)", sub:"Mbps = 32 / ((32 / 8) + 4) = 4 Mbps", expected:4, unit:"Mbps" }
        ]}),
   10: C("RS-485 Differential Bus Load: A terminated 120 Ω RS-485 twisted pair is driven to 3.0 V differential (V_A − V_B). Calculate differential line driver current in mA.",
         "I_mA = 1000 * (V_diff / R_term)", "I_mA = 1000 * (3 / 120) = 25 mA", 25, "mA",
         "Double-ended RS-485 termination draws continuous mA when active", "With two 120 Ω end terminators in parallel (60 Ω net AC/DC), driver current doubles to 50 mA if doubly loaded.",
         ["Divide differential voltage by 120 Ω termination: 3.0 / 120 = 0.025 A.", "Convert to milliamps: 25 mA.", "Half-duplex transceivers tri-state between bursts to conserve bus power."],
         { staticVariants: [
           { question:"Double-terminated 60 Ω RS-485 bus driven to 2.4 V differential. Find mA.", formula:"I = 1000*V/R", sub:"I = 1000 * (2.4 / 60) = 40 mA", expected:40, unit:"mA" }
         ]})
  },

  "python-scpi": {
   2: C("SCPI Command Latency Budget: A Python script runs 250 sequential MEAS:VOLT? queries over USB-TMC taking 18 ms round-trip each, plus 1.5 s initialization overhead. Find total capture time in s.",
        "T_tot = N * t_cmd + t_init", "T_tot = 250 * 0.018 + 1.5 = 6 s", 6, "s",
        "SCPI round-trip latency adds linearly per unbatched query", "Fetching waveforms or multi-point sweeps in one binary READ? query eliminates hundreds of 18 ms round-trips.",
        ["Command round-trip time: 250 * 0.018 s = 4.5 s.", "Add startup configuration: 4.5 + 1.5 = 6.0 s.", "Batching buffer queries slashes ATE test cycle time."],
        { staticVariants: [ ...(familyVariations.testThroughput || []) ]}),
   3: C("Parallel Multi-Socket Fixture Speedup: Testing 4 boards in parallel takes 80 s total per 4-board batch (including relay switching). Compute effective test throughput in boards/hour.",
        "Rate = (3600 / T_batch) * sockets", "Rate = (3600 / 80) * 4 = 180 boards/hour", 180, "boards/hour",
        "Parallel sockets multiply ATE test floor throughput", "Even with slightly longer fixture cycles, parallel DUT banks dominate factory capacity.",
        ["Batches per hour = 3600 / 80 = 45 batches/hour.", "Multiply by 4 DUTs/batch = 180 boards/hour.", "Equivalent average time = 20 s per board."],
        { staticVariants: [
          { question:"8-socket fixture runs 1 batch every 120 s. Find throughput in boards/hour.", formula:"Rate = (3600/T)*N", sub:"Rate = (3600 / 120) * 8 = 240 boards/hour", expected:240, unit:"boards/hour" }
        ]}),
   4: C("Multi-Sample Noise Reduction Mean: PyVISA logs four rail voltage samples: 3.31 V, 3.29 V, 3.30 V, and 3.32 V. Compute sample mean voltage in V.",
        "V_mean = (V1 + V2 + V3 + V4) / 4", "V_mean = (3.31 + 3.29 + 3.30 + 3.32) / 4 = 3.305 V", 3.305, "V",
        "Software averaging suppresses random white DMM jitter", "Verify raw variance/spread alongside mean so averaging doesn't hide transient brownouts!",
        ["Sum four readings: 3.31 + 3.29 + 3.30 + 3.32 = 13.22 V.", "Divide by N = 4: 13.22 / 4 = 3.305 V.", "Also log min/max peak bounds separately from mean."],
        { staticVariants: [
          { question:"Average four readings: 5.02, 4.98, 5.01, 4.99 V. Find mean V.", formula:"Mean = sum / 4", sub:"Mean = (5.02 + 4.98 + 5.01 + 4.99) / 4 = 5 V", expected:5, unit:"V" }
        ]}),
   5: C("ATE Uncertainty Guardbanding: Product upper spec is 5.000 V max, while station DMM uncertainty is ±0.035 V. Compute tightened production PASS limit ceiling in V.",
        "V_pass_max = V_spec_max - uncertainty", "V_pass_max = 5.000 - 0.035 = 4.965 V", 4.965, "V",
        "Guardbanding prevents shipping bad units due to tester error", "Always shrink automated PASS acceptance thresholds inward by test instrument uncertainty.",
        ["Customer spec limit = 5.000 V.", "Subtract tester uncertainty band: 5.000 − 0.035 = 4.965 V.", "Guarantees true shipped rail never violates 5.000 V even under worst DMM offset."],
        { staticVariants: [
          { question:"3.450 V upper spec with ±0.025 V tester uncertainty. Find tightened PASS ceiling in V.", formula:"V_guard = USL - U", sub:"V_guard = 3.450 - 0.025 = 3.425 V", expected:3.425, unit:"V" }
        ]}),
   7: C("Upper Process Capability (C_pu): Nominal 3.30 V rail has upper spec USL = 3.45 V. Production batch measures mean μ = 3.33 V and standard deviation σ = 0.02 V. Calculate C_pu = (USL − μ) / (3σ).",
        "C_pu = (USL - mu) / (3 * sigma)", "C_pu = (3.45 - 3.33) / (3 * 0.02) = 2", 2, " ",
        "Six-sigma C_pu measures margin vs test variance", "A mean far inside spec with tiny standard deviation σ achieves high C_pu ≥ 1.33 / 2.0.",
        ["Distance from mean to ceiling: 3.45 − 3.33 = 0.12 V.", "Divide by 3σ = 3 * 0.02 = 0.06 V.", "C_pu = 0.12 / 0.06 = 2.0 (6-sigma quality margin!)."],
        { staticVariants: [ ...(familyVariations.assertMargin || []) ]}),
   8: C("Binary vs ASCII Waveform Offload Savings: Transferring 10,000 scope points over 115200 baud UART (10 bits/byte): ASCII uses 12 bytes/pt vs IEEE Binary 2 bytes/pt. Calculate transmission time saved in s.",
        "T_saved = (N * (B_ascii - B_bin) * 10) / baud", "T_saved = (10000 * (12 - 2) * 10) / 115200 = 8.680555556 s", 8.680555556, "s",
        "Binary CURVE?/WAV:DATA? crushes ASCII SCPI bottleneck", "Transferring floating-point text decimals over serial/SCPI wastes 5–6x bytes and float-parsing CPU time.",
        ["Bytes saved per point = 12 − 2 = 10 bytes.", "Total bits saved = 10,000 * 10 bytes * 10 bits/byte = 1,000,000 bits.", "Divide by 115,200 bits/s ≈ 8.68 s saved per trace!"],
        { staticVariants: [
          { question:"1000 pts at 115200 baud (8N1): ASCII 12 B vs Binary 2 B. Find s saved.", formula:"t = 1000*(12-2)*10/115200", sub:"t = (1000 * (12 - 2) * 10) / 115200 = 0.8680555556 s", expected:0.8680555556, unit:"s" }
        ]}),
   9: C("PyVISA Timeout Safety Margin: Waiting for an RC rail bleed needs 4.5τ (with τ = 0.8 s) plus 0.4 s relay/SCPI response delay before throwing timeout error. Find minimum timeout in s.",
        "T_timeout = 4.5 * tau + t_overhead", "T_timeout = 4.5 * 0.8 + 0.4 = 4 s", 4, "s",
        "Set VISA timeouts slightly above slowest physical settling time", "Setting 1 s VISA timeout on a 3.6 s physical ramp causes flaky automated false-failures.",
        ["Physical bleed duration: 4.5 * 0.8 = 3.6 s.", "Add relay + instrument query latency: 3.6 + 0.4 = 4.0 s.", "Use explicit status polling instead of blind fixed sleeps where possible."],
        { staticVariants: [
          { question:"Bleed takes 5*0.6 s + 1.0 s relay overhead. Find minimum timeout in s.", formula:"T = 5*0.6 + 1.0", sub:"T = 5 * 0.6 + 1.0 = 4 s", expected:4, unit:"s" }
        ]}),
   10: C("Percent Spec Deviation Assertion: An automated check verifies 1.800 V ± 2%. When SCPI reads 1.845 V, compute absolute percent deviation |V_meas − V_nom| / V_nom × 100 in %.",
         "Dev_pct = 100 * (V_meas - V_nom) / V_nom", "Dev_pct = 100 * (1.845 - 1.800) / 1.800 = 2.5 %", 2.5, "%",
         "Normalized % error flags tolerance violations", "A +45 mV error seems tiny on 1.8 V, yet +2.5% already violates a strict ±2% core rail limit!",
         ["Absolute difference: 1.845 − 1.800 = +0.045 V (45 mV).", "Divide by nominal: 0.045 / 1.800 = 0.025 = 2.5%.", "Triggers automated FAIL against ±2% limit."],
         { staticVariants: [
           { question:"Nominal 3.30 V reads 3.168 V. Find magnitude % deviation.", formula:"Dev = 100*(Vnom-Vmeas)/Vnom", sub:"Dev = 100 * (3.30 - 3.168) / 3.30 = 4 %", expected:4, unit:"%" }
         ]})
  },

  linux: {
   2: C("Continuous Raw UART Capture Sizing: Recording persistent serial telemetry at 115200 baud 8N1 (~11,520 bytes/s max line rate) continuously for 1000 s fills how many megabytes (MB, using 10^6 bytes/MB)?",
        "Size_MB = (rate_Bps * t_s) / 1e6", "Size_MB = (11520 * 1000) / 1000000 = 11.52 MB", 11.52, "MB",
        "Size /tmp or disk partitions for multi-hour serial dumps", "Long overnight TVAC tests can exhaust tiny embedded ramdisks if uncompressed logs run unchecked.",
        ["115,200 bits/s / 10 bits/byte = 11,520 bytes/s.", "Over 1000 s: 11,520,000 bytes = 11.52 MB.", "Always rotate/compress long serial captures with logrotate or gzip."],
        { staticVariants: [ ...(familyVariations.logRate || []) ]}),
   3: C("Kernel Boot Latency Audit: Timestamped `dmesg` logs USB CDC enumeration at `[0.842]` s and flight telemetry ready at `[3.142]` s. Find application bring-up latency in ms.",
        "Lat_ms = 1000 * (t_ready - t_usb)", "Lat_ms = 1000 * (3.142 - 0.842) = 2300 ms", 2300, "ms",
        "Extract sub-millisecond timing deltas from kernel timestamps", "Prefixed monotonic seconds (`dmesg -T` or raw `[sec.usec]`) reveal driver probe stalls cleanly.",
        ["Subtract monotonic kernel timestamps: 3.142 − 0.842 = 2.300 s.", "Convert seconds to ms: 2.3 * 1000 = 2300 ms.", "Avoid non-monotonic wall clocks during NTP jumps."],
        { staticVariants: [
          { question:"TTY ready at 1.250 s, sensor daemon online at 2.850 s. Find delta ms.", formula:"dt = 1000*(t2-t1)", sub:"dt = 1000 * (2.850 - 1.250) = 1600 ms", expected:1600, unit:"ms" }
        ]}),
   4: C("Silent Log Classification Audit: Out of 400 automated regressions, a naive summary counted only 6 CRC_ERR failures and missed 18 TIMEOUT failures hiding alongside 376 OK runs. Find true total failure percentage %.",
        "Fail_pct = 100 * (N_timeout + N_crc) / N_tot", "Fail_pct = 100 * (18 + 6) / 400 = 6 %", 6, "%",
        "Never audit only one grep failure keyword", "Searching solely for 'ERROR' misses 'TIMEOUT', 'PANIC', and non-zero exit codes; assert explicit PASS count!",
        ["Sum ALL abnormal outcomes: 18 + 6 = 24 failures.", "Divide by total 400 runs: 24 / 400 = 0.06 = 6%.", "True failure rate is 4x higher than 6/400 = 1.5% reported!"],
        { staticVariants: [
          { question:"500 runs show 470 PASS, 20 TIMEOUT, 10 CRC. Find true fail %.", formula:"Fail = 100*(20+10)/500", sub:"Fail = 100 * (20 + 10) / 500 = 6 %", expected:6, unit:"%" }
        ]}),
   5: C("Host CPU Load During Telemetry Polling: A Linux collector thread consumes 12 ms of busy-wait CPU time inside every 40 ms polling loop. Calculate CPU single-core utilization in %.",
        "CPU_pct = 100 * (t_active / T_period)", "CPU_pct = 100 * (12 / 40) = 30 %", 30, "%",
        "Replace busy-wait polling with blocking select()/epoll()", "High-rate busy polling saturates host CPU cores and drops USB/serial IRQ frames.",
        ["Ratio active / period = 12 / 40 = 0.30.", "Percentage utilization = 30% of one core continuously.", "Switch to blocking event reads to drop CPU load near < 1%."],
        { staticVariants: [
          { question:"Thread uses 18 ms per 60 ms loop. Find core CPU %.", formula:"CPU = 100*18/60", sub:"CPU = 100 * 18 / 60 = 30 %", expected:30, unit:"%" }
        ]}),
   7: C("Logrotate Ring Buffer Retention: System keeps 12 rotated files of 50 MB each while telemetry writes 2.0 MB/min continuously. How many hours of rolling history stay preserved before oldest files overwrite?",
        "Hours = (Files * MB_per_file) / (Rate_MB_min * 60)", "Hours = (12 * 50) / (2 * 60) = 5 hours", 5, "hours",
        "Plan ring buffer depth to survive weekend/overnight runs", "Small logrotate limits silently erase Friday root-cause logs before Monday morning triage.",
        ["Total circular capacity = 12 * 50 = 600 MB.", "Hourly write rate = 2 MB/min * 60 min/hr = 120 MB/hr.", "Retention window = 600 / 120 = 5.0 hours."],
        { staticVariants: [ ...(familyVariations.logDuration || []) ]}),
   8: C("UART Hardware FIFO Overrun Deadline: A Linux 16550 UART FIFO buffers 64 bytes before dropping characters. At 115200 baud (11.52 bytes/ms), calculate maximum IRQ stall before overflow in ms.",
        "t_stall_ms = FIFO_bytes / Bytes_per_ms", "t_stall = 64 / 11.52 = 5.555555556 ms", 5.555555556, "ms",
        "Kernel scheduler pauses cause silent ttyS overrun drops", "Flow control (RTS/CTS) or lower baud / DMA UART prevents silent byte loss during heavy disk flushes.",
        ["Byte arrival rate = 115,200 / 10 = 11,520 B/s = 11.52 B/ms.", "Time to fill 64-byte FIFO = 64 / 11.52 ≈ 5.56 ms.", "Any kernel lock lasting > 5.6 ms corrupts packet framing."],
        { staticVariants: [
          { question:"16-byte FIFO at 115200 baud (11.52 B/ms). Find max stall in ms.", formula:"t = 16 / 11.52", sub:"t = 16 / 11.52 = 1.388888889 ms", expected:1.388888889, unit:"ms" }
        ]}),
   9: C("SCP Archive Offload Duration: Uploading a 600 MB thermal test archive over 100 Mbps Ethernet (~10 MB/s usable TCP throughput) takes how many seconds?",
        "t_s = Size_MB / Rate_MBps", "t_s = 600 / 10 = 60 s", 60, "s",
        "Distinguish megabits/s (Mbps) from megabytes/s (MB/s)", "100 Mbps wire speed maxes near ~10–11.5 MB/s usable payload after TCP/Ethernet framing headers.",
        ["Total payload = 600 MB.", "Usable transfer rate = 10 MB/s.", "Upload finishes in 600 / 10 = 60 s (1 minute)."],
        { staticVariants: [
          { question:"Upload 1200 MB at 15 MB/s TCP rate. Find offload seconds.", formula:"t = 1200 / 15", sub:"t = 1200 / 15 = 80 s", expected:80, unit:"s" }
        ]}),
   10: C("Multi-Runner Fleet Rescheduling: Four parallel Linux test stations handle 30 boards each (2 min/board). After 24 min elapsed (12 boards finished per station), Runner #4 crashes offline and its remaining 18 boards split evenly across the 3 survivors. Find total fleet completion time in min.",
         "T_tot = 24 + (18 + 18 / 3) * 2",
         "T_tot = 24 + (18 + 18 / 3) * 2 = 72 min", 72, "min",
         "Fleet throughput scaling under single-host failure", "Re-queuing stranded DUT batches across surviving test hosts quantifies real fault-tolerant capacity.",
         ["At t = 24 min, each of 4 runners completed 12 boards, leaving 18 boards per runner.", "Runner #4's 18 remaining boards split evenly across 3 survivors (+6 boards each -> 24 boards left per survivor).", "Remaining duration = 24 * 2 min = 48 min; total elapsed = 24 + 48 = 72 min."],
         { staticVariants: [
           { question:"4 Linux runners start 36 boards each (2 min/board). After 24 min (12 done each), #4 crashes leaving 24 boards that split across 3 survivors (+8 each). Find total fleet minutes.", formula:"T = 24 + (24 + 24/3)*2", sub:"T = 24 + (24 + 24 / 3) * 2 = 88 min", expected:88, unit:"min" }
         ]})
  },

  rf: {
   2: C("Design a quarter-wave monopole telemetry antenna at 2.4 GHz (free-space wavelength λ = 12.5 cm). Find ideal element length L = λ / 4 in cm.",
        "L_cm = (300 / f_MHz * 100) / 4", "L = (30000 / 2400) / 4 = 3.125 cm", 3.125, "cm",
        "Quarter-wave resonant element sizing", "A monopole above a ground plane resonates near λ / 4 (~3.1 cm at 2.4 GHz Wi-Fi/telemetry).",
        ["Full free-space wavelength λ = (3e8 / 2.4e9) * 100 = 12.5 cm.", "Divide by 4: 12.5 / 4 = 3.125 cm.", "Shorten slightly (~0.95x) to compensate dielectric PCB loading."],
        { staticVariants: [ ...(familyVariations.wavelength || []) ]}),
   3: C("Convert a 1000 mW (1.0 W) S-band RF transmitter output power into logarithmic dBm units using P_dBm = 10·log10(P_mW).",
        "P_dBm = 10 * log10(P_mW)", "P_dBm = 10 * log10(1000) = 30 dBm", 30, "dBm",
        "Absolute RF power scale referenced to 1 mW (dBm)", "Memorize anchors: 1 mW = 0 dBm, 10 mW = +10 dBm, 100 mW = +20 dBm, 1 W = +30 dBm.",
        ["Express watts in milliwatts: 1 W = 1000 mW.", "Compute 10 * log10(1000) = 10 * 3 = 30 dBm.", "Never confuse dBm (absolute power) with dB (relative ratio)!"],
        { staticVariants: [
          { question:"Convert 100 mW RF output to dBm.", formula:"P_dBm = 10*log10(100)", sub:"P_dBm = 10 * log10(100) = 20 dBm", expected:20, unit:"dBm" }
        ]}),
   4: C("A VNA shows −10 dB input return loss (meaning 10% of incident power reflects back to the amplifier). What percentage of forward power successfully enters the antenna load?",
        "T_pct = 100 * (1 - 0.10)", "T_pct = 100 * (1 - 10^(-10 / 10)) = 90 %", 90, "%",
        "Return loss S11 quantifies impedance mismatch loss", "Better return loss (e.g. −20 dB = 1% reflected) delivers ≥ 99% power cleanly to the antenna.",
        ["Reflected fraction for −10 dB S11 = 10^(-10/10) = 0.10 (10%).", "Transmitted percentage = 100% − 10% = 90%.", "Corresponds to VSWR ≈ 1.92:1."],
        { staticVariants: [
          { question:"At −20 dB return loss (1% reflected), what % power enters load?", formula:"T = 100*(1 - 10^(-2))", sub:"T = 100 * (1 - 10^(-20/10)) = 99 %", expected:99, unit:"%" }
        ]}),
   5: C("Cascaded RF Link Stage Budget: A 0 dBm synthesizer feeds a +24 dB PA, loses −2.5 dB in coax, loses −1.5 dB in a bandpass filter, and radiates from a +6 dBi patch antenna. Find output EIRP in dBm.",
        "EIRP = P_src + G_pa - L_coax - L_flt + G_ant", "EIRP = 0 + 24 - 2.5 - 1.5 + 6 = 26 dBm", 26, "dBm",
        "Logarithmic decibels turn cascaded chain gains into simple addition", "Multiplying stage power ratios becomes clean dB arithmetic: gains add (+), passive losses subtract (−).",
        ["Start at 0 dBm source.", "Compute net chain: 0 + 24 − 2.5 − 1.5 + 6 = +26 dBm.", "Converts to 10^(2.6) ≈ 398 mW isotropic equivalent power."],
        { staticVariants: [
          { question:"+10 dBm source -> −3 dB cable -> +20 dB amp -> +3 dBi antenna. Find EIRP dBm.", formula:"EIRP = 10 - 3 + 20 + 3", sub:"EIRP = 10 - 3 + 20 + 3 = 30 dBm", expected:30, unit:"dBm" }
        ]}),
   7: C("Free-Space Path Loss Range Scaling: Expanding downlink orbit distance 4× from 500 km to 2000 km increases spherical spreading path loss by 20·log10(4) dB. Calculate extra path loss in dB.",
        "dL_dB = 20 * log10(R2 / R1)", "dL = 20 * log10(2000 / 500) = 12.04119983 dB", 12.04119983, "dB",
        "Inverse-square spreading adds +6 dB per 2x range", "Every doubling of distance quarters power density (−6.02 dB), so 4x range costs ~12.04 dB.",
        ["Distance ratio R2 / R1 = 2000 / 500 = 4.", "Apply 20 * log10(4) ≈ 12.04 dB.", "Uses factor 20 (amplitude/field spreading ~ 1/R²) rather than 10."],
        { staticVariants: [ ...(familyVariations.powerDb || []) ]}),
   8: C("Compute fundamental room-temperature thermal noise floor (−174 dBm/Hz + 10·log10(BW)) inside a 1.0 MHz (10^6 Hz) receiver channel bandwidth in dBm.",
        "N_dBm = -174 + 10 * log10(BW)", "N = -174 + 10 * log10(1000000) = -114 dBm", -114, "dBm",
        "Wide channel bandwidth raises receiver thermal noise floor", "Doubling receiver filter bandwidth raises kTB thermal noise by +3 dB and hurts weak-signal sensitivity.",
        ["Thermal noise density at 290 K = −174 dBm/Hz.", "Bandwidth term: 10 * log10(10^6) = +60 dB.", "Total channel noise = −174 + 60 = −114 dBm (before adding LNA Noise Figure)."],
        { staticVariants: [
          { question:"Find thermal noise in dBm for a 10 kHz narrowband channel.", formula:"N = -174 + 10*log10(10000)", sub:"N = -174 + 10 * log10(10000) = -134 dBm", expected:-134, unit:"dBm" }
        ]}),
   9: C("Telemetry Link Margin: Received carrier arrives at −82 dBm; demodulator threshold sensitivity is −97 dBm; weather/multipath fading requires a 3 dB allocation. Find net remaining link margin in dB.",
        "Margin = (P_rx - Sens) - Fade", "Margin = (-82 - (-97)) - 3 = 12 dB", 12, "dB",
        "Link margin = Excess signal above sensitivity minus fading", "Spacecraft and flight links typically design ≥ 6–10 dB net margin for atmospheric attenuation and pointing error.",
        ["Raw signal above sensitivity: −82 − (−97) = +15 dB.", "Subtract 3 dB fade reserve: 15 − 3 = +12 dB net link margin.", "Margin below 0 dB means packet loss / link unlock."],
        { staticVariants: [
          { question:"Rx = −78 dBm, sensitivity = −92 dBm, fade allowance = 4 dB. Find net margin dB.", formula:"M = (Prx - Sens) - Fade", sub:"M = (-78 - (-92)) - 4 = 10 dB", expected:10, unit:"dB" }
        ]}),
   10: C("Coaxial Cable Attenuation Scaling: LMR-195 coax is specified at 18 dB insertion loss per 100 m at 2.4 GHz. Compute attenuation loss in dB for a 15 m ground antenna jumper.",
         "Loss = (Spec_per_100m / 100) * Length_m", "Loss = (18 / 100) * 15 = 2.7 dB", 2.7, "dB",
         "Attenuation dB scales linearly with physical cable length", "Long coax runs waste transmitter power linearly in dB; relocating PA/LNA closer to antenna recovers link dB.",
         ["Loss rate = 18 / 100 = 0.18 dB per meter.", "Multiply by 15 m run: 0.18 * 15 = 2.7 dB.", "Notice 3 dB loss throws away half of your RF transmitter watts as cable heat!"],
         { staticVariants: [
           { question:"Cable loses 24 dB per 100 m. Find loss for a 25 m run in dB.", formula:"Loss = (24/100)*25", sub:"Loss = (24 / 100) * 25 = 6 dB", expected:6, unit:"dB" }
         ]})
  },

  qualification: {
   2: C("TVAC Thermal Reference Drift: A precision voltage reference drifts +0.15 mV/°C while ramping from +25 °C bench ambient to +85 °C hot-soak chamber plateau. Calculate total reference drift in mV.",
        "dV_mV = TC_mV_C * (T_hot - T_amb)", "dV = 0.15 * (85 - 25) = 9 mV", 9, "mV",
        "Extrapolate room-temperature error across full TVAC envelope", "Bench ambient checks look quiet while hot/cold chamber extremes expose crystal and bandgap drift.",
        ["Thermal excursion ΔT = +85 − (+25) = +60 °C.", "Multiply slope: 0.15 mV/°C * 60 °C = 9.0 mV.", "Verify 9 mV shift remains inside worst-case ADC accuracy budget."],
        { staticVariants: [ ...(familyVariations.marginPct || []) ]}),
   3: C("Thermal Cycle Duration Budget: Protoflight qualification mandates 120 complete thermal cycles from −40 °C to +85 °C taking 45 minutes per cycle. Calculate total chamber hours required.",
        "Hours = (Cycles * min_per_cycle) / 60", "Hours = (120 * 45) / 60 = 90 hours", 90, "hours",
        "Translate cycle count into continuous chamber schedule", "90 chamber hours (~3.75 days nonstop) requires reliable automated logging and LN2/chiller supply.",
        ["Total test minutes = 120 * 45 = 5,400 min.", "Divide by 60 min/hr: 5,400 / 60 = 90 hours.", "Add extra dwell soak hours at first/last hot and cold plateaus."],
        { staticVariants: [
          { question:"80 TVAC cycles at 30 min/cycle need how many chamber hours?", formula:"H = (80*30)/60", sub:"H = (80 * 30) / 60 = 40 hours", expected:40, unit:"hours" }
        ]}),
   4: C("Radiation Total Ionizing Dose (TID) Margin: A flight rad-tolerant IC rated to 50 krad faces a 15 krad mission dose requiring a 2× Radiation Design Margin (RDM = 30 krad factored). Find leftover % dose margin below device rating.",
        "Margin_pct = 100 * (Rating - Mission*RDM) / Rating", "Margin = 100 * (50 - 15 * 2) / 50 = 40 %", 40, "%",
        "Apply Radiation Design Margin factor before comparing rating", "Orbital space qualification checks (Mission Dose × RDM) safely underneath tested failure ceiling.",
        ["Factored orbital dose = 15 krad * 2 = 30 krad.", "Margin = (50 − 30) / 50 = 20 / 50 = 40%.", "Passes 2× RDM qualification gate cleanly."],
        { staticVariants: [
          { question:"100 krad part faces 25 krad × 2 RDM (50 krad). Find % rating margin.", formula:"M = 100*(100-50)/100", sub:"M = 100 * (100 - 25 * 2) / 100 = 50 %", expected:50, unit:"%" }
        ]}),
   5: C("Random Vibration GRMS Margin: A flight electronics box is qualified to 18.0 Grms while launch vehicle acceptance requirement is 12.0 Grms. Express acoustic/vibration headroom in dB (20·log10(G_qual / G_req)).",
        "Headroom_dB = 20 * log10(G_qual / G_req)", "Headroom = 20 * log10(18 / 12) = 3.521825181 dB", 3.521825181, "dB",
        "Convert structural acceleration Grms margin into qualification dB", "Aerospace launch environments express +3 dB or +6 dB protoflight margins logarithmically over predicted flight levels.",
        ["Ratio G_qual / G_req = 18 / 12 = 1.5× amplitude.", "Apply 20 * log10(1.5) ≈ +3.52 dB.", "Meets standard +3 dB qualification margin over acceptance!"],
        { staticVariants: [
          { question:"Qualified to 20 Grms vs 10 Grms acceptance. Find margin in dB.", formula:"M = 20*log10(20/10)", sub:"M = 20 * log10(20 / 10) = 6.020599913 dB", expected:6.020599913, unit:"dB" }
        ]}),
   7: C("Rolled Throughput Yield (RTY): A flight assembly passes 95% at ICT, 90% after burn-in stress, and 100% at final functional verification. Compute combined cumulative yield Y_tot in %.",
        "RTY_pct = 100 * Y1 * Y2 * Y3", "RTY = 100 * 0.95 * 0.90 * 1.00 = 85.5 %", 85.5, "%",
        "Serial test station yields multiply, not average", "Even when individual stations score 90–95%, chaining multiple imperfect stages compounds scrap/rework steeply.",
        ["Convert percentages to decimals: 0.95 * 0.90 * 1.00 = 0.855.", "Convert back to %: 85.5% first-pass rolled yield.", "Notice 14.5% of builds fail at least one test gate along the line."],
        { staticVariants: [ ...(familyVariations.yieldPct || []) ]}),
   8: C("Manufacturing Defect PPM: Across 6,000 production telemetry boards screened at final test, 3 units fail continuity verification. Express defect rate in Parts Per Million (PPM).",
        "PPM = (Fails / Total) * 1e6", "PPM = (3 / 6000) * 1000000 = 500 PPM", 500, "PPM",
        "PPM standardizes ultra-low avionics failure rates", "Aerospace/automotive reliability tracks rare solder/component defects per million assemblies rather than tiny 0.05% decimals.",
        ["Failure fraction = 3 / 6000 = 0.0005.", "Multiply by 10^6: 0.0005 * 1,000,000 = 500 PPM.", "Check inverse: 1,000,000 / 500 = 1 defect per 2,000 boards."],
        { staticVariants: [
          { question:"2 fails out of 4000 units. Express defect rate in PPM.", formula:"PPM = (2/4000)*1e6", sub:"PPM = (2 / 4000) * 1000000 = 500 PPM", expected:500, unit:"PPM" }
        ]}),
   9: C("PVT Worst-Case Corner Summation: At hot +85 °C and max VCC, nominal core current (140 mA) rises +12% for process leakage plus +15 mA external GPIO drive. Compute worst-case total supply current in mA.",
        "I_corner = I_nom * 1.12 + I_io", "I_corner = 140 * 1.12 + 15 = 171.8 mA", 171.8, "mA",
        "Combine process/temp scaling and additive load currents", "Worst-case power budgets stack multiplicative leakage multipliers together with fixed external pin loads.",
        ["Scaled core leakage: 140 * 1.12 = 156.8 mA.", "Add fixed I/O load: 156.8 + 15 = 171.8 mA.", "Size LDO/fuse ceiling strictly above 171.8 mA worst corner."],
        { staticVariants: [
          { question:"200 mA nominal + 10% hot shift + 30 mA peripheral draw. Find corner mA.", formula:"I = 200*1.10 + 30", sub:"I = 200 * 1.10 + 30 = 250 mA", expected:250, unit:"mA" }
        ]}),
   10: C("Parallel-Redundant Spacecraft Reliability: Two independent flight computers run active/standby in parallel, each achieving 95% (0.95) mission reliability. System succeeds unless BOTH fail. Find parallel system reliability in %.",
         "R_sys_pct = 100 * (1 - (1 - R)*(1 - R))", "R_sys = 100 * (1 - (1 - 0.95) * (1 - 0.95)) = 99.75 %", 99.75, "%",
         "Parallel redundancy multiplies failure probabilities cleanly", "Dual redundant strings slash 5% failure odds (0.05) down to 0.05 × 0.05 = 0.25% combined probability of losing both!",
         ["Single-string failure chance: Q = 1 − 0.95 = 0.05 (5%).", "Chance BOTH independent computers fail: 0.05 * 0.05 = 0.0025 (0.25%).", "System survival = 100% − 0.25% = 99.75%."],
         { staticVariants: [
           { question:"Two parallel redundant power buses each 90% reliable. Find system % reliability.", formula:"R = 100*(1 - 0.1*0.1)", sub:"R = 100 * (1 - (1 - 0.9) * (1 - 0.9)) = 99 %", expected:99, unit:"%" }
         ]})
  }
 };

 // Also enrich C1 and C6 with variantPool from their own original families without modifying their fixed Q text/answer
 const byTopic = {};
 for(const q of qs){
  (byTopic[q.topic] = byTopic[q.topic] || []).push(q);
 }

 for(const topicId of Object.keys(byTopic)){
  const tqs = byTopic[topicId];
  const calc = tqs.filter(q => q.level === "Calculation");
  const ov = map[topicId] || {};
  calc.forEach((q, idx) => {
   const slotNum = idx + 1; // 1..10
   const famList = (familyVariations[q.calcFamily] || []).map(v => ({...v}));

   if(!ov[slotNum]){
    // Keep C1 and C6 prompt/expected verbatim, enrich metadata & similar-family pool
    const baseOp = slotNum === 1
     ? `Direct foundational equation (${q.calcFamily || q.id})`
     : `Core second-pillar calculation (${q.calcFamily || q.id})`;
    q.numericOperation = baseOp;
    q.learningObjective = `${baseOp} (Step ${slotNum}/10 in Calculation progression)`;
    q.lesson = {
     title: baseOp,
     summary: `Foundational calculation drill #${slotNum}: ${q.question}`,
     example: `Formula: ${q.formula}. Expected value: ${q.expected} ${q.unit}.`,
     why: "Establishes the anchor formula and SI unit intuition before progressing into multi-step combined problems.",
     vocab: [
      ["Governing Law", q.formula],
      ["Target Unit", (q.unit || "").trim() || "Ratio"],
      ["Step Check", (q.steps && q.steps[2]) || "Verify numerical scale and unit consistency."]
     ]
    };
    q.variantPool = famList.filter(v => v.question !== q.question);
    return;
   }

   // Save base avionics_questions values if not already saved (satisfies curriculum-accuracy audit)
   if(!q.originalNumeric){
    q.originalNumeric = { question: q.question, unit: q.unit, expected: q.expected };
   }

   const spec = ov[slotNum];
   q.question = spec.question;
   q.formula = spec.formula;
   q.sub = spec.sub;
   q.expected = spec.expected;
   q.unit = spec.unit;
   if(spec.topology) q.topology = spec.topology;
   else delete q.topology;

   q.numericOperation = spec.title;
   q.learningObjective = `${spec.title} (Step ${slotNum}/10 in Calculation progression)`;
   q.steps = spec.steps;
   q.hint = `Use ${spec.formula} and verify physical units (${spec.unit.trim() || "dimensionless"}).`;
   q.lesson = {
    title: spec.title,
    summary: spec.why + " This is a standalone progressive calculation distinct from surrounding slots.",
    example: `Target equation: ${spec.formula}. Substitute numbers carefully to get ${spec.expected} ${spec.unit}.`,
    why: spec.why,
    vocab: [
     ["Governing Law", spec.formula],
     ["Target Unit", spec.unit.trim() || "Ratio (unitless)"],
     ["Check Strategy", spec.steps[2] || "Verify units and physical magnitude."]
    ]
   };

   // Put staticVariants + dynamic variantFn + original similar family drills into variantPool for dice rotation
   q.variantPool = [
    ...(spec.staticVariants || []),
    ...famList.filter(v => v.question !== q.question && !((spec.staticVariants || []).some(s => s.question === v.question)))
   ];
   if(typeof spec.variantFn === "function"){
    q.variantGenerator = spec.variantFn;
   }
  });
 }
})();
