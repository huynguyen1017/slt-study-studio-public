"use strict";
/* Topic-specific systems-thinking capstones beyond simple same-number drills.
 * Staged fault cases draw from the original topic source symptoms, procedures,
 * risks, and verification examples, while final 30th problems integrate them.
 * Series/parallel get fully bespoke 30-step sequences from mixed_networks_v11. */
(function(){
const T=window.AVIONICS_TOPICS||[],Q=window.AVIONICS_QUESTIONS||[];
const cap={
 units:["Reconcile SI units, shunt current and uncertainty",
  "A current-sense shunt marked 5 mΩ shows 50 mV differential at startup. An automated report labels the result as 10 mA and passes a 12 A maximum. Re-derive current with base SI units, determine whether the reported unit is plausible, and describe two uncertainty/calibration checks before release.",
  "50 mV / 5 mΩ = 10 A, NOT 10 mA. Correct the factor-of-1000 reporting fault, verify sensor polarity, calibration, bandwidth and acceptance limit, preserve raw source reading; a PASS from the flawed parser is invalid.",
  "I = V_sense / R_shunt","I = (50 * 10^(-3)) / (5 * 10^(-3)) = 10"],
 ohm:["Diagnose polarity, current limit and a loaded divider",
  "A 3.3 V supply drives a 330 Ω resistor while a 10 Ω sense resistor indicates 0.09 V. A technician reads −3.3 V on the supply DMM. Calculate ideal current, measured shunt current, explain the negative indication and specify safe bench checks before accepting a board.",
  "Ideal load current is 3.3/330 = 10 mA, shunt current = 0.09/10 = 9 mA. Negative DMM reading may be lead reversal or negative rail relative to reference; check source and ground nodes, sense resistor effect, cable placement and meter mode.",
  "I = V / R","I_pred = 3.3 / 330 = 10 * 10^(-3)"],
 power:["Check series-plus-parallel dissipation, current and safe limits",
  "A 12 V theoretical resistor network is 100 Ω + (200 Ω || 300 Ω) + 80 Ω. Calculate equivalent resistance, total current and power in the first 100 Ω element; then explain how to choose a derated resistor and how to identify an overload using a current-limited supply.",
  "Parallel equivalent 120 Ω; total 300 Ω, current 40 mA and R1 power (0.04)^2×100=0.16 W. Check the component datasheet and derating versus ambient temperature before accepting.",
  "P_R1 = (V_S / R_T)^2 * R_1","P_R1 = (12 / 300)^2 * 100 = 0.16"],
 "kcl-kvl":["Reconstruct two node voltages and all branch currents",
  "A 12 V fixture contains 100 Ω + (200 Ω || 300 Ω) + 80 Ω. An operator measures source current 40 mA, but claims the parallel group receives all 12 V. Use series/parallel reduction, KCL and KVL to compute the true branch-group voltage and both branch currents; identify the mistaken assumption.",
  "Req=300 Ω; I=40 mA; series drops =4 V and 3.2 V; parallel group is 4.8 V. Branch currents are 24 mA and 16 mA. Their sum is 40 mA and KVL gives 4+4.8+3.2=12 V.",
  "V_P = V_S - I_S * (R_1 + R_4)","V_P = 12 - 0.04 * (100 + 80) = 4.8"],
 thevenin:["Resolve a sensor's open-circuit and loaded output",
  "A linear sensor output reads 5 V open circuit. Its modeled source resistance is 1 kΩ. An ADC input presents 1 kΩ to ground. Predict loaded voltage and Norton current, then design two safe measurements that distinguish a wrong load from a drifting source.",
  "Vload=5×1/(1+1)=2.5 V; Norton IN=5 V/1 kΩ=5 mA. Compare open and loaded voltage and known load resistance without shorting the live port.",
  "V_L = V_th * R_L / (R_th + R_L)","V_L = 5 * 1000 / (1000 + 1000) = 2.5"],
 ac:["Separate sine RMS, reactive loading and phase evidence",
  "A 1 kHz sinusoidal rail signal has 10 V peak (zero DC offset). Two scope channels show 250 µs lag and a DMM reports 7.1 V RMS. Check RMS and phase calculations, then describe why a capacitor current need not be in phase and what instrument limits matter.",
  "Vrms=10/√2≈7.071 V and 250 µs / 1 ms×360° =90° lag. AC impedance can shift phase; check meter true-RMS bandwidth, probe references and sample rate.",
  "V_rms = V_peak / sqrt(2)","V_rms = 10 / sqrt(2) = 7.071"],
 capacitors:["Integrate decoupling, stored charge and transient measurement",
  "A 3.3 V board uses 100 µF bulk capacitance and 100 nF local bypass. A sudden 100 mA step lasts 10 µs. Estimate ideal capacitor droop for 100 µF alone, then explain why ESL/ESR and layout might make the real waveform worse and how to verify it.",
  "Ideal ΔV=IΔt/C =0.1×10µs/100µF=0.01 V. Actual voltage also depends on ESR, ESL, regulation and loop layout; capture differential rail voltage and current transition together.",
  "Delta_V = I_step * Delta_t / C","Delta_V = 0.1 * 10 * 10^(-6) / (100 * 10^(-6)) = 0.01"],
 rc:["Diagnose an ADC RC filter with nonideal input loading",
  "An ADC sees a 3.3 V source through a 10 kΩ resistor and 100 nF capacitor to return. A 10 kΩ ADC load is also connected at the measurement node. Estimate DC loaded output, effective R seen by C and time constant. Specify the scope stimulus and settle check.",
  "DC division gives 1.65 V; Rth=10k||10k=5kΩ and τ=5k×100nF=0.5 ms. A nominal unloaded τ=1 ms would mispredict the transient; confirm with a step and high-impedance probe.",
  "tau = R_th * C","tau = 5000 * (100 * 10^(-9)) = 0.5 * 10^(-3)"],
 inductors:["Investigate an RL driver and flyback transient",
  "A 50 mH relay coil has 25 Ω winding resistance at 12 V. Calculate approximate RL time constant and steady-state ideal current. On turn-off a large spike appears only with a long scope ground lead; distinguish a real missing clamp from a probe artifact.",
  "τ=L/R=0.05/25=2 ms; ideal steady I=12/25=0.48 A. Verify flyback suppression and repeat with proper high-voltage-rated probe and short ground; a long clip can exaggerate overshoot.",
  "tau = L / R","tau = (50 * 10^(-3)) / 25 = 2 * 10^(-3)"],
 filters:["Solve cascaded low/high pass and defend a sample rate",
  "A 1 kΩ/100 nF RC low-pass drives a 10 kΩ/1 µF high-pass stage. Estimate each nominal cutoff ignoring interstage loading, then identify when that assumption fails, how to measure amplitude/phase and how to prevent a sampling artifact.",
  "LP fc≈1591.5 Hz; HP fc≈15.9 Hz. Their cascaded response depends on stage loading unless buffered. Sweep frequency and capture phase with a sufficient sample rate; avoid relying on nominal cutoffs alone.",
  "f_c = 1 / (2 * pi * R * C)","f_LP = 1 / (2 * pi * 1000 * (100 * 10^(-9)))"],
 magnetics:["Correlate transformer ratio, saturation and isolation evidence",
  "A transformer has 200 primary and 100 secondary turns, driven at approved 24 V AC. The secondary reads 10 V instead of ideal 12 V and input current rises sharply. Compare predicted turns-ratio voltage, possible load/regulation versus core saturation and choose isolation-safe measurements.",
  "Ideal Vs=24×100/200=12 V. A 10 V measured reading could arise from loading, regulation, frequency or saturation; inspect output versus load, current waveform and isolation ratings without assuming one root cause.",
  "V_S / V_P = N_S / N_P","V_S = 24 * 100 / 200 = 12"],
 components:["Coordinate GPIO, LED resistor and inductive MOSFET load",
  "A 3.3 V GPIO drives a 2.0 V LED through a 330 Ω resistor. The same controller switches an inductive coil using a MOSFET module. Calculate ideal LED current, identify why the GPIO must not directly drive the coil, and specify gate/diode/supply checks.",
  "LED current≈(3.3−2.0)/330=3.94 mA. Coil current must be carried by an appropriately rated external transistor and supply with proper flyback protection. Confirm module pinout, safe 3.3 V logic thresholds and current limits.",
  "I_LED = (V_S - V_f) / R","I_LED = (3.3 - 2.0) / 330"],
 "power-rails":["Four-channel avionics load-step release analysis",
  "During a CPU workload transition an oscilloscope observes exported clock, 1.0 V logic rail, current-sense shunt and memory rail. Logic rail falls to 0.93 V; requirement minimum is 0.95 V. Plan trigger, probe references, peak current, rail-sequencing and limit evidence before a GO/NO-GO decision.",
  "Droop is 70 mV and the observed minimum 0.93 V is 20 mV below specified 0.95 V. Preserve the simultaneous four-channel capture and current probe calibration, reproduce under approved workload, and do not release without disposition.",
  "V_droop = V_baseline - V_min","V_droop = 1.00 - 0.93 = 0.07"],
 schematics:["Isolate a missing SPI peripheral across schematic, board and firmware",
  "Power rails pass, but SPI sensor ID returns zero on a Nucleo carrier. A schematic shows two CS nets on separate pages, and the fixture harness was revised. Propose an ordered test covering net connectivity, pin-mux, bus timing, CS polarity, known-good hardware and raw logs.",
  "Start with netlist, physical connector pinout and continuity OFF, then probe supply, CS and SCLK/MOSI/MISO under controlled stimulus. Verify AF configuration, compare known-good fixture and preserve firmware/board IDs before assigning DUT failure.",
  "I_branch = V_drop / R_shunt","V_drop = I_branch * R_shunt"],
 instruments:["Separate scope bandwidth, reference and probe loading",
  "A 20 ns pulse is missed by one scope capture; a power rail looks noisy only with a long ground lead; a DMM shows steady 0.9 V. Choose correct trigger, bandwidth/sample rate, reference and probe, then distinguish transient supply droop from a ground-loop artifact.",
  "Use a scope with sufficient bandwidth and sample rate, event trigger and short return or differential probe as appropriate; DMM gives slower averaged DC, not fast minima. Compare repeatable waveforms and independent reference before fault assignment.",
  "N_samples = f_sample / f_signal","N_samples = 500 * 10^(6) / (25 * 10^(6)) = 20"],
 timing:["Close clock, setup/hold and reset-release timing together",
  "A 50 MHz clock (20 ns period) drives a sampled bus. Data changes too near one clock edge, while power-good occasionally deasserts at boot. Plan a coherent four-channel capture and explain how to separate setup/hold from reset sequencing and rail transients.",
  "Nominal clock period is 20 ns. Compare data arrival/hold with specified margins and clock skew; correlate power-good, reset and rail droop on the same timebase, not separate screenshots.",
  "T_clk = 1 / f_clk","T_clk = 1 / (50 * 10^(6)) = 20 * 10^(-9)"],
 buses:["Isolate SPI, I²C and UART electrical versus protocol faults",
  "An MCU has readable UART TX, an SPI sensor with no device-ID reply, and I²C SDA stuck low. Describe a staged test distinguishing pin-mux/configuration, ground/voltage-level issues, clock/CS/SDA timing, and firmware protocol errors.",
  "Check rated GPIO levels and common reference, verify TX/RX crossover and baud, capture SPI CS/SCLK/MOSI/MISO and compare CPOL/CPHA, then check I²C pull-ups, idle-high and ACK. Decode only after electrical integrity is established.",
  "t_SPI = 8 * N_bytes / f_SCLK","t_SPI = 8 * 32 / (8 * 10^(6)) = 32 * 10^(-6)"],
 "python-scpi":["Catch a false-clean SCPI station report with reproducible evidence",
  "A test automation station reads a 0.93 V rail but marks PASS against a 0.95 V minimum. One VISA query timed out and a retry succeeded. Design fail-closed limit evaluation, capture both attempts, correlate firmware and calibration and specify safe PSU shutdown.",
  "0.93 V violates the minimum by 0.02 V; mark FAIL or INVALID, not PASS. Preserve raw timeouts, every retry, actual value/unit, limits, instrument ID, setup config, DUT/build and evidence of safe power state.",
  "Margin = Measured - Limit","Margin = 0.93 - 0.95 = -0.02"],
 linux:["Reconcile raw DRAM errors with a misleading PASS summary",
  "A Linux memtester run shows 'Fail count: 2' in raw logs but the last summary line says PASS. The board changed firmware and has unstable UART timestamps. Create a shell-side validation plan to preserve every failure, run duration, exit code, build hash and reproducible A/B results.",
  "Any raw failing count makes the report inconsistent. Preserve raw and summary, use case-safe parsing and pipefail, attach firmware hash and timestamps, rerun controlled A/B, block GO until reviewed. Never let a later PASS erase an earlier fail.",
  "Fail_rate = 100 * N_fail / N_total","Fail_rate = 100 * 2 / 100 = 2"],
 rf:["Compare RF S11 with a cable calibration artifact",
  "At 2.4 GHz a VNA shows poor S11 after changing a coax, while a spectrum analyzer sees an unexpected spur. Explain a test plan that separates calibration reference-plane/cable loss, DUT matching and actual harmonic emissions. What would constitute defensible independent evidence?",
  "Calibrate VNA at DUT reference plane, inspect ports and cables, repeat S11/S21 with same power/frequency conditions, and verify the spur with calibrated spectrum analyzer RBW/reference setting. A single uncalibrated VNA trace cannot close the defect.",
  "Gamma = (Z_L - Z_0) / (Z_L + Z_0)","S11_dB = 20 * log10(abs(Gamma))"],
 qualification:["Integrate TVAC, configuration and rail margins for spacecraft acceptance",
  "A spacecraft avionics unit passes ambient bench tests but drops a 1.0 V rail to 0.93 V in thermal vacuum; acceptance minimum is 0.95 V. A replacement board uses an unapproved firmware hash. Build a traceable NO-GO disposition with TVAC telemetry, probes, calibration, firmware configuration and independent repeat criteria.",
  "The 0.93 V reading is 20 mV below the stated lower bound; unapproved firmware additionally invalidates configuration acceptance. Preserve pressure/temperature, synchronized rail waveforms, build IDs, calibration and repeatable tests. No GO without authorized anomaly closure.",
  "Margin = Measured - Limit","Margin = 0.93 - 0.95 = -0.02"]
};
const moves=[
 ["Identify what is ACTUALLY failing","Given observation: ",". Identify the first trustworthy electrical signal or raw log. Distinguish a physical failure from a reporting symptom."],
 ["Choose an independent measurement reference","The technician's initial check was: ",". Which second test with a different tool or reference would challenge the same hypothesis?"],
 ["Build the expected/observed comparison","An investigation reports: ",". Use a physical equation or specified threshold to distinguish expected signal from the observed value, checking units."],
 ["Separate fixture, firmware and board effects","Evidence from the previous attempt: ",". Plan a controlled A/B/A test that changes only one of fixture, firmware or hardware."],
 ["Investigate waveform versus averaged reading","A symptom recurs: ",". Specify a trigger, measurement bandwidth, reference and one raw log timestamp to decide if it is a transient artifact."],
 ["Test a competing hypothesis","The first proposed action was: ",". Construct a second explanation and say which independent observation would disprove it."],
 ["Predict behavior under a controlled stimulus","A bench report describes: ",". Change exactly one safe stimulus condition and predict how the measured response should change; name the safety stop."],
 ["Repeat the failure with preserved provenance","The log still shows: ",". Record firmware hash, serial ID, instrument calibration, environmental conditions, timestamps and unchanged stimulus so the event can be reproduced."],
 ["Reconcile contradictory reports","The reviewer finds: ",". Compare source evidence with summary, limits and uncertainty, and identify which inconsistency invalidates an unsupported PASS."],
 ["Make the integrated qualification decision","System evidence: ",". Combine circuit physics, independent measurements, configuration traceability and risk to justify a GO/NO-GO decision."]
];
for(const t of T){
 if(t.id==="series"||t.id==="parallel")continue;
 const block=cap[t.id];if(!block)throw Error("Missing capstone "+t.id);
 const q=Q.filter(x=>x.topic===t.id&&x.level==="Troubleshooting").sort((a,b)=>a.difficulty-b.difficulty);
 if(q.length!==10)throw Error("Missing diagnostic slots "+t.id);
 for(let i=0;i<10;i++){
  const x=q[i],phase=moves[i],caseRow=t.cases[i%5],skill=t.skills[(i+1)%5];
  // Q21–25 isolate one real fault. Q26–29 combine TWO different observations,
  // instead of recycling the same source case as a stand-alone exercise.
  const secondCase=i>=5&&i<9?t.cases[(i+2)%5]:null;
  const extra=secondCase
   ?" A second potentially related observation is: "+secondCase[0]+" Determine whether these symptoms share a root cause or require separate fault trees."
   :"";
  const title=i===9?block[0]:phase[0]+" · "+skill[0];
  const question=i===9?block[1]:phase[1]+caseRow[0]+extra+" "+phase[2].replace(/^\./,"")+" Specific related concept: "+skill[0]+".";
  const result=i===9?block[2]:"Start with "+caseRow[1]+" Then assess "+caseRow[2]+" and independently verify "+caseRow[3]+". "
   +(secondCase?"For the second observation, separately check "+secondCase[1]+" Assess "+secondCase[2]+" and verify "+secondCase[3]+". Compare both before claiming a common root cause. ":"")
   +"Use "+skill[1];
  x.originalMasteryQuestion=x.question;
  x.question=question;x.learningObjective=title;x.auditSkill=title;x.skillName=title;
  x.steps=["Stage "+(i+1)+": "+question,
   "Ground the primary case in source-defined signals and risks: "+caseRow[0]+" "+skill[1],
   ...(secondCase?[
    "Trace the second symptom to its own signal and reference: "+secondCase[0],
    "Design a discriminating independent check: "+secondCase[3]+" Compare with the first test: "+caseRow[3]
   ]:[]),
   "Reason about the physical result rather than naming the part: "+result,
   "Write a falsifiable expected observation for the primary test: "+caseRow[3],
   "Record units, calibration, configuration and a reproducible disposition."];
  x.lesson={title,summary:result,example:secondCase?caseRow[3]+" Also: "+secondCase[3]:caseRow[3],
   why:"An integrated diagnosis must distinguish competing fault hypotheses with independent measurements and a documented test condition.",
   vocab:[[skill[0],skill[1]],["Observed failure",caseRow[0]],
    ...(secondCase?[["Second observation",secondCase[0]]]:[]),["Verification",caseRow[3]]]};
  x.formula=i===9?block[3]:"";x.sub=i===9?block[4]:"";x.unitConv=null;
  if(i===9&&(t.id==="power"||t.id==="kcl-kvl")){
    x.network={kind:"mixed4",values:{v:12,a:100,b:200,c:300,d:80},focus:"system-capstone",illustrative:false};
  }
  delete x.expected;
 }
}
window.AVIONICS_DISTINCT_CURRICULUM_VERSION=11;
window.AVIONICS_INTEGRATED_CAPSTONES_V11=Object.keys(cap);
})();