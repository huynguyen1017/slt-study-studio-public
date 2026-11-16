"use strict";
/* 23 × 20 new, independently staged advanced avionics cases (Q31–50).
   Original Q1–30 IDs and the original 690 items are never rewritten.
   Curriculum is EDUCATIONAL/HYPOTHETICAL; numerical acceptance limits
   below are teaching values, not Muon Space flight specifications. */
(function(){
const T=window.AVIONICS_TOPICS||[],Q=window.AVIONICS_QUESTIONS||[];
if(T.length!==23||Q.length!==690)throw Error("The 50-question expansion requires the verified 23 × 30 original curriculum.");
const round=x=>Number(Number(x).toPrecision(10));
const fmt=x=>String(Number(Number(x).toPrecision(8)));
const math={
 units:{prompt:"A power-rail shunt is 5 mΩ and its differential reading is 75 mV. The station reports 15 mA. What is the independently computed current in A?",formula:"I = V_sense / R_shunt",sub:"I = (75 * 0.001) / (5 * 0.001) = 15 A",answer:15,unit:"A",explain:"75 mV = 0.075 V; 5 mΩ = 0.005 Ω. Divide 0.075 V by 0.005 Ω. The reported 15 mA is 1000 times smaller than the actual 15 A."},
 ohm:{prompt:"A hypothetical 5 V bench source drives a 220 Ω protection resistor in series with a 330 Ω load. Find loop current in mA.",formula:"I_mA = 1000 * V / (R1 + R2)",sub:"I_mA = 1000 * 5 / (220 + 330) = 9.090909091 mA",answer:1000*5/550,unit:"mA",explain:"In one path, add 220 + 330 = 550 Ω first. Divide 5 V by 550 Ω to obtain 0.00909 A; multiply by 1000 for mA."},
 power:{prompt:"An educational 12 V subsystem draws 0.8 A continuously. Find its instantaneous electrical input power in W before evaluating its thermal budget.",formula:"P = V * I",sub:"P = 12 * 0.8 = 9.6 W",answer:9.6,unit:"W",explain:"One watt equals one volt times one ampere. Multiply 12 by 0.8; no mA conversion is required."},
 series:{prompt:"A 12 V source drives 100 Ω IN SERIES with (200 Ω IN PARALLEL with 300 Ω) and then 80 Ω IN SERIES. Find source current in mA.",formula:"I_mA = 1000 * V / (R1 + (R2 * R3) / (R2 + R3) + R4)",sub:"I_mA = 1000 * 12 / (100 + (200 * 300) / (200 + 300) + 80) = 40 mA",answer:40,unit:"mA",explain:"Reduce 200 Ω || 300 Ω to 120 Ω. Add the series resistances: 100 + 120 + 80 = 300 Ω. Then 12/300 = 0.04 A = 40 mA."},
 parallel:{prompt:"5.0 V feeds 100 identical 1.0 Ω resistors in parallel (all 0 Ω shorts are already removed, healthy baseline R_eq = 10 mΩ, I = 500 A). Total supply current now measures 470 A at 5.0 V. Calculate how many resistors are OPEN (∞ Ω)",formula:"N_open = N - (I_total / (V_s / R_nom))",sub:"N_open = 100 - (470 / (5 / 1)) = 6 resistors",answer:6,unit:"resistors",explain:"Healthy branch current I_branch = 5 V / 1 Ω = 5 A, giving 100 × 5 A = 500 A baseline. At 470 A, active healthy branches = 470 / 5 = 94, leaving 100 - 94 = 6 open (∞ Ω) branches (R_eq = 1/94 = 10.638 mΩ)."},
 "kcl-kvl":{prompt:"At a hypothetical rail junction, 45 mA and 25 mA enter; 20 mA leaves for logic and 15 mA for a sensor. Find missing OUTGOING current in mA.",formula:"I_missing = I_in1 + I_in2 - I_out1 - I_out2",sub:"I_missing = 45 + 25 - 20 - 15 = 35 mA",answer:35,unit:"mA",explain:"Add incoming 45+25=70 mA. Subtract known outgoing 20+15=35 mA. The remaining 35 mA must leave."},
 thevenin:{prompt:"A 5 V source feeds a top 1 kΩ resistor. The lower 1 kΩ divider resistor is also loaded by a 1 kΩ ADC input to ground. Compute ACTUAL midpoint voltage in V.",formula:"V_out = V_in * (R_bottom || R_ADC) / (R_top + (R_bottom || R_ADC))",sub:"V_out = 5 * ((1000 * 1000) / (1000 + 1000)) / (1000 + ((1000 * 1000) / (1000 + 1000))) = 1.666666667 V",answer:5/3,unit:"V",explain:"The lower 1 kΩ and ADC 1 kΩ are parallel, so the lower effective resistance becomes 500 Ω. Divider result is 5×500/(1000+500) = 1.667 V, not the unloaded 2.5 V."},
 ac:{prompt:"A zero-offset sine wave measures 4 V peak-to-peak on a scope. Find RMS voltage in V (not peak voltage).",formula:"V_rms = V_pp / (2 * sqrt(2))",sub:"V_rms = 4 / (2 * sqrt(2)) = 1.414213562 V",answer:Math.sqrt(2),unit:"V",explain:"Peak amplitude is half the peak-to-peak value: 2 V. RMS for a sine is peak/√2, yielding 1.414 V."},
 capacitors:{prompt:"During a 10 ms supply interruption, a 0.3 A load may droop at most 0.5 V. Calculate ideal hold-up capacitance in mF, neglecting ESR.",formula:"C_mF = 1000 * I * dt_s / deltaV",sub:"C_mF = 1000 * 0.3 * 0.010 / 0.5 = 6 mF",answer:6,unit:"mF",explain:"Convert 10 ms to 0.010 s. Charge removed is I×Δt=0.003 C; divide by 0.5 V to get 0.006 F, or 6 mF. ESR can make real droop worse."},
 rc:{prompt:"An RC power-good delay has R = 10 kΩ and C = 4.7 µF. Find the approximate five-time-constant settling time in ms.",formula:"t_5tau_ms = 5 * R_ohm * C_farads * 1000",sub:"t_5tau_ms = 5 * 10000 * 0.0000047 * 1000 = 235 ms",answer:235,unit:"ms",explain:"Convert 10 kΩ=10,000 Ω and 4.7 µF=4.7×10^-6 F. One tau is 0.047 s=47 ms; five tau is 235 ms."},
 inductors:{prompt:"A 4 mH inductor sees a constant 12 V for 20 µs during a switch pulse. Find ideal current rise ΔI in mA.",formula:"deltaI_mA = 1000 * V * deltaT / L",sub:"deltaI_mA = 1000 * 12 * 0.000020 / 0.004 = 60 mA",answer:60,unit:"mA",explain:"Convert L=0.004 H and Δt=20×10^-6 s. ΔI=V×Δt/L=0.06 A=60 mA; real saturation and resistance may affect behavior."},
 filters:{prompt:"A simple educational low-pass filter uses R=1 kΩ and C=0.1 µF. Find its ideal −3 dB cutoff in Hz.",formula:"f_c = 1 / (2 * pi * R * C)",sub:"f_c = 1 / (2 * pi * 1000 * 0.0000001) = 1591.549431 Hz",answer:1/(2*Math.PI*1e3*1e-7),unit:"Hz",explain:"Convert 0.1 µF to 1×10^-7 F and 1 kΩ to 1000 Ω, then evaluate 1/(2πRC). The −3 dB frequency is not the stopband limit."},
 magnetics:{prompt:"An ideal isolation transformer has 200 primary turns, 50 secondary turns and 24 V RMS applied to the primary. Find secondary RMS voltage in V.",formula:"V_s = V_p * (N_s / N_p)",sub:"V_s = 24 * (50 / 200) = 6 V",answer:6,unit:"V",explain:"Divide turns: 50/200=0.25. Multiply 24 V by 0.25. This ideal model ignores magnetizing losses."},
 components:{prompt:"A fully-enhanced MOSFET has R_DS(on)=0.15 Ω and carries 2 A DC. Estimate its conduction loss in W.",formula:"P_cond = I^2 * R_DS_on",sub:"P_cond = 2^2 * 0.15 = 0.6 W",answer:0.6,unit:"W",explain:"Use P=I²R: 2 A squared is 4 A² and 4×0.15 Ω=0.6 W. Also check switching and thermal losses in a real design."},
 "power-rails":{prompt:"An avionics board draws 0.7 A on 3.3 V and 2.0 A on 1.2 V. Compute total REGULATED output load power in W.",formula:"P_total = V1 * I1 + V2 * I2",sub:"P_total = 3.3 * 0.7 + 1.2 * 2.0 = 4.71 W",answer:4.71,unit:"W",explain:"Compute each branch: 3.3×0.7=2.31 W and 1.2×2.0=2.40 W, then sum. This is not converter input power; efficiencies would matter there."},
 schematics:{prompt:"On a power-OFF board, a two-wire DMM measures 0.83 Ω on a ground strap and 0.23 Ω with shorted leads. Estimate actual strap resistance in Ω.",formula:"R_strap = R_measured - R_leads",sub:"R_strap = 0.83 - 0.23 = 0.60 Ω",answer:0.60,unit:"Ω",explain:"Both readings include the leads. Subtract the independently measured 0.23 Ω lead offset from 0.83 Ω, ideally verifying with 4-wire measurement."},
 instruments:{prompt:"For an ideal single-pole scope response, what minimum analog bandwidth in MHz corresponds to an instrument rise time of 10 ns?",formula:"Bandwidth_Hz approx = 0.35 / t_r_s",sub:"Bandwidth_MHz = 0.35 / (10 * 0.000000001) / 1000000 = 35 MHz",answer:35,unit:"MHz",explain:"Convert 10 ns to 10×10^-9 s, divide 0.35 by that time, then convert Hz to MHz. This is a theoretical bandwidth/rise-time relationship, not a guarantee for every waveform."},
 timing:{prompt:"A 50 MHz synchronous path has 2 ns clock-to-Q and 3 ns setup time. Ignoring skew/jitter, what maximum combinational delay in ns fits one full cycle?",formula:"t_logic_max = T_clk - t_clkQ - t_setup",sub:"t_logic_max = (1000 / 50) - 2 - 3 = 15 ns",answer:15,unit:"ns",explain:"Convert 50 MHz to period: 1000/50=20 ns. Reserve 2 ns for launch and 3 ns for setup; 15 ns remains for logic."},
 buses:{prompt:"An SPI master clocks 2 bytes (16 bits) at 8 MHz with no inter-byte gaps. Find ideal transfer duration in µs, excluding setup overhead.",formula:"t_us = bits / f_MHz",sub:"t_us = 16 / 8 = 2 µs",answer:2,unit:"µs",explain:"Two bytes equals 16 bits. At 8 MHz, one bit consumes 0.125 µs; 16 bits need 2 µs. Chip-select timing and command overhead extend a real transfer."},
 "python-scpi":{prompt:"A Python test executes 60 sequential queries that each take 80 ms and has 2.0 s initialization. Find total ideal capture time in s.",formula:"T_total = N * t_query + t_init",sub:"T_total = 60 * 0.080 + 2.0 = 6.8 s",answer:6.8,unit:"s",explain:"Convert 80 ms to 0.080 s; 60×0.080=4.8 s, then add 2 s fixed overhead."},
 linux:{prompt:"A Linux capture writes 15,000 bytes/s for 20 minutes. What decimal file size in MB is required before filesystem overhead?",formula:"MB = rate_Bps * duration_s / 1000000",sub:"MB = 15000 * (20 * 60) / 1000000 = 18 MB",answer:18,unit:"MB",explain:"Convert minutes to seconds: 20×60=1200 s. Multiply 15,000 B/s by 1200 s=18,000,000 B and divide by one million."},
 rf:{prompt:"For the same frequency and ideal free-space path, downlink distance grows by 4×. Calculate the additional path loss in dB.",formula:"deltaL = 20 * log10(d2 / d1)",sub:"deltaL = 20 * log10(4) = 12.04119983 dB",answer:20*Math.log10(4),unit:"dB",explain:"Form distance ratio 4; log10(4)≈0.60206 and 20×0.60206≈12.04 dB. Do not present this as hands-on spectrum-analyzer experience."},
 qualification:{prompt:"In a hypothetical assembly lot, 3 of 100 flight-computer PCBAs fail final acceptance. Compute first-pass yield in %.",formula:"Yield_pct = 100 * (passed / tested)",sub:"Yield_pct = 100 * ((100 - 3) / 100) = 97 %",answer:97,unit:"%",explain:"Subtract failed from tested: 100−3=97 passed. Divide 97 by 100 and multiply by 100%. Do not confuse first-pass yield with rolled yield."}
};
const limits={
 units:["current-sense A channel",12,10.5,0.8,"A","max"],ohm:["load current",60,54,4,"mA","max"],
 power:["regulated power",5,4.6,0.5,"W","max"],series:["loaded divider output",1.8,1.72,0.12,"V","max"],
 parallel:["total source current",100,89,5,"mA","max"],"kcl-kvl":["signed KCL residual magnitude",3,2,0.5,"mA","max"],
 thevenin:["loaded output",2.2,2.38,0.1,"V","min"],ac:["AC amplitude",2.7,2.8,0.1,"V","min"],
 capacitors:["hold-up voltage droop",0.2,0.17,0.05,"V","max"],rc:["reset release delay",100,109,12,"ms","min"],
 inductors:["switch-node transient peak",30,28,4,"V","max"],filters:["stopband attenuation",20,19,2,"dB","min"],
 magnetics:["magnetizing current",2,1.8,0.3,"A","max"],components:["output LOW voltage",0.4,0.32,0.1,"V","max"],
 "power-rails":["rail ripple peak-to-peak",50,47,8,"mV","max"],schematics:["cold resistance",1.0,0.94,0.08,"Ω","max"],
 instruments:["observed edge rise time",10,9,2,"ns","max"],timing:["setup-time slack",2,2.4,0.6,"ns","min"],
 buses:["framing error count",0,1,0,"errors","max"],"python-scpi":["test-step duration",30,28,3,"s","max"],
 linux:["lost capture lines",0,1,0,"lines","max"],rf:["return loss magnitude",15,14,2,"dB","min"],
 qualification:["hot chamber temperature",85,83,3,"°C","max"]
};
const phases=[
["Label the complete bench signal path","Trace the source, return, DUT, fixture and measurement instrument, then mark each point to probe.","Draw a node-by-node map from the source connector to the downstream device; label which reading is referenced to ground."],
["Design a safe power-OFF inspection","Select power-off checks that can rule out a short, wrong connector or invalid configuration before energizing.","Inspect revision, connectors and expected net resistances with power OFF; isolate one component lead if in-circuit ohming is ambiguous."],
["Create a correct instrument setup","Choose an instrument, connection reference and recording setup to distinguish an actual signal from a misleading display.","Specify DMM versus scope/DAQ, probe attenuation, bandwidth, common reference and trigger. Never ground-clip a floating high-side node."],
["Test instrument loading and false readings","Explain how the measuring instrument itself could change the reported behavior and how to test that.","Compare readings using an independent high-impedance input or suitable differential probe; calculate loading or bandwidth effect where possible."],
["Execute a staged first-power sequence","Build a power-up order with an explicit stop condition and predicted observations.","Current-limit the supply; verify input, regulator outputs, clocks/reset, firmware boot and interface activity one step at a time."],
["Partition hardware versus test rack","Choose the first two checks to distinguish a DUT fault from a broken cable, fixture or test script.","Test with a known-good cable/reference board and document the complete unchanged station configuration."],
["Calculate a physical prediction before trusting a script","Solve a numerical estimate from specified component values rather than copying an automated PASS.","Convert units; write the named equation; substitute; calculate; independently check the physical order of magnitude."],
["Run a controlled A/B/A experiment","Design an A/B/A swap that changes only one variable to isolate hardware, firmware or fixture.","Record initial A, swap only the suspect component/firmware/fixture for B, restore A; repeat under the same loads and temperature."],
["Separate two competing failure mechanisms","Determine whether two distinct observations imply one root cause or need separate fault trees.","Create two hypotheses and one independent falsification test for each; correlation alone is insufficient."],
["Build a predictive cause-and-effect model","Predict what changes in other measurements if the suspected component or node is truly at fault.","Name upstream, downstream and control signals; say what each should do under nominal and faulted conditions."],
["Plan a controlled cold/hot experiment","Design a safe environmental test, including stabilization and comparison against baseline.","Record starting temperature and baseline, hold each approved chamber plateau, repeat electrical readings and log drift."],
["Check the reference and independently repeat","Determine whether inconsistent probes, common returns or measurements can explain the contradiction.","Use a second meter/calibrated probe, verify ground reference, measure at both connector and IC pin, and compare uncertainties."],
["Write a minimal repeatable fault test","Convert the suspected fault into a reproducible written procedure another technician can execute.","Record board revision, fixture, image/firmware, instruments, procedure, exact stimulus, acceptance limit and raw evidence."],
["Calculate guardband including uncertainty","Apply an invented training acceptance limit, readback and uncertainty; decide if an apparent pass survives guardband.","For a maximum spec use Limit−(Measured+Uncertainty); for a minimum use (Measured−Uncertainty)−Limit."],
["Translate the check into Python test automation","Outline a safe Python workflow to record raw values, units, metadata and abnormal states.","Explain explicit instrument initialization, readback, timeout handling, parsing units, finite-number test, threshold comparison and CSV log."],
["Prevent false PASS from invalid tests","Specify clear PASS, FAIL and INVALID categories, and choose failure-injection negative tests.","Inject a disconnect, out-of-range value and timestamp mismatch; confirm every one is captured and never silently passed."],
["Compare several runs for repeatability","Select repeat count, controlled variables and plots that can reveal intermittent faults.","Run identical baseline captures, examine spread versus specified tolerance, and annotate environment, instruments and firmware."],
["Triangulate multi-subsystem symptoms","Combine board voltages, digital timing and log outcomes without assuming that all symptoms share one cause.","Create a time-aligned table of physical readings and software logs; test which observation changed first."],
["Design an evidence-based production disposition","Define objective acceptance/retest/escalation gates that protect against a bad station and a bad DUT.","Require calibration, raw proof, full configuration, independent recheck and traceable sign-off before a decision."],
["Defend a complete flight-hardware GO/NO-GO review","Integrate multiple failure signatures, safety, root-cause hypotheses, repeatability, automation and release evidence.","Separate fixture, firmware, environmental and DUT faults. Demand independent tests, confirmed margin, version control and an explicit disposition."]
];
function makeText(t,i){
 const k=(i*2)%5,s=t.skills[k],one=t.cases[k],second=t.cases[(k+2)%5],third=t.cases[(k+3)%5],ph=phases[i];
 const late=i>=8,final=i===19;
 let question="Advanced "+(i+31)+" / 50 — "+ph[0]+". On a hypothetical "+t.title+" test bench, the first observation is: "+one[0]+" ";
 if(late)question+="A separate observation is: "+second[0]+" ";
 if(i>=17)question+="A third symptom is: "+third[0]+" ";
 question+=ph[1]+" Address the physical principle '"+s[0]+"' explicitly.";
 if(final)question+=" Make a justified GO, NO-GO or INVALID decision; passing one nominal check is not sufficient.";
 const meaning=s[1]+" "+(s[2]||"");
 const steps=[
  "Understand the vocabulary: '"+s[0]+"' means "+s[1]+" Before any measurement, identify the physical quantity and its unit.",
  "Sketch the situation in plain words. The reported observation is '"+one[0]+"' and it may have multiple explanations. Do not assume the device is defective from one displayed symptom.",
  "State what healthy operation should look like. "+(s[2]||"Identify the specification and compare the direction and magnitude of the signal.")+" Explicitly mark the source, ground, fixture and DUT.",
  "Perform the FIRST safe discriminating check. "+one[1]+" "+(i>=4?"Write down the instrument range, probe reference, board revision and environmental condition.":"Do not measure resistance on an energized circuit."),
  "Calculate or compare against the expected physical outcome. "+one[2]+" Distinguish a prediction from an actual measurement and record units.",
  (late?"Test the SECOND hypothesis independently: "+second[1]+" Its engineering meaning is: "+second[2]+".":"Next, control exactly one variable. "+ph[2]),
  (i>=17?"Check the THIRD path as well: "+third[1]+" Compare timestamps and only then decide whether the observations are causally linked.":"Gather confirming evidence. "+one[3]+" If a different meter or known-good fixture disagrees, classify the test as suspect."),
  (final?"Disposition rule: NO-GO on a confirmed out-of-limit DUT; INVALID if station, calibration or configuration evidence is missing; GO only if every required test passes within uncertainty. Write down what proof would reverse your conclusion.":"Write a reproducible answer: expected result, measured result, uncertainty/limit, remaining alternative hypothesis and next confirming test.")
 ];
 const summary="Skill: "+s[0]+". "+meaning+" Scenario: "+one[0]+" The evidence path starts with "+one[1];
 const lesson={title:ph[0],summary,example:"Worked diagnostic route: "+one[1]+" Then "+one[2]+" Confirm using "+one[3]+(late?" Independently challenge the second symptom: "+second[3]:""),why:"A safe avionics test must distinguish a real DUT defect from fixture, probe, software or configuration artifacts. "+(s[2]||""),
 vocab:[[s[0],s[1]],["Reported observation",one[0]],["First check",one[1]],["Expected physical result",one[2]],["Independent proof",one[3]]]};
 return {question,steps,lesson,formula:i>=14?"Measured and approved limits => PASS | FAIL | INVALID":undefined,sub:undefined};
}
function mathPage(t,i){
 const m=math[t.id];
 if(i===6){
  const steps=[
   "Read the exact target and units from the question. Do not start by guessing an instrument fault: "+m.prompt,
   "Name every given quantity and convert all SI prefixes. "+m.explain,
   "Select the governing equation: "+m.formula+". State what the numerator and denominator physically represent.",
   "Substitute the given values into that equation: "+m.sub+". Keep all intermediate units visible.",
   "Compute the result independently. The required final numeric answer is "+fmt(m.answer)+" "+m.unit+". Confirm each stage of the arithmetic, the conversion factor and the final engineering unit.",
   "Check the magnitude against the physical path. "+m.explain,
   "On hardware, compare against an independent probe/DMM channel and verify whether the instrument was configured for the right unit and range.",
   "State the limitation of the model, record assumptions and explain what different measurement would falsify the prediction."
  ];
  return {question:"Q37 — Advanced measured-versus-predicted calculation. "+m.prompt+" Provide the unit conversion, physical interpretation, and independent bench verification.",steps,formula:m.formula,sub:m.sub,expected:round(m.answer),unit:m.unit,
    lesson:{title:"Quantitative cross-check — "+t.title,summary:"Predict the physical reading from the component values before accepting any software result. "+m.explain,example:"Given → conversion → equation → substitution → "+fmt(m.answer)+" "+m.unit+". "+m.explain,why:"Manual, instrument and automation results must agree within documented uncertainty.",vocab:[["Quantity to solve",m.unit],["Governing relationship",m.formula],["Expected result",fmt(m.answer)+" "+m.unit]]}};
 }
 const [what,limit,measured,uncertainty,unit,kind]=limits[t.id];
 const margin=kind==="max"?limit-(measured+uncertainty):(measured-uncertainty)-limit;
 const formula=kind==="max"?"Margin = Maximum_limit - (Measured + Uncertainty)":"Margin = (Measured - Uncertainty) - Minimum_limit";
 const sub=kind==="max"?"Margin = "+limit+" - ("+measured+" + "+uncertainty+") = "+fmt(margin)+" "+unit:"Margin = ("+measured+" - "+uncertainty+") - "+limit+" = "+fmt(margin)+" "+unit;
 const verdict=margin>=-1e-12?"PASS on this single numerical requirement (if the station and configuration are valid)":"FAIL/NO-GO on this requirement despite the nominal reading";
 const question="Q44 — Guardband and uncertainty. In a hypothetical "+t.title+" bench exercise, "+what+" has a "+kind+"imum permitted value of "+limit+" "+unit+". The meter reads "+measured+" "+unit+" with a worst-case uncertainty of ±"+uncertainty+" "+unit+". Calculate signed guardband margin in "+unit+" and state whether the requirement passes. These are fictional training limits, NOT Muon hardware specifications.";
 const steps=[
  "Understand the words: a "+kind+"imum requirement means "+(kind==="max"?"the worst credible measured value must not exceed the limit.":"the lowest credible measured value must not fall below the limit."),
  "List the quantities: limit="+limit+" "+unit+", measured="+measured+" "+unit+", uncertainty=±"+uncertainty+" "+unit+". Match units before adding.",
  "Choose the correct worst-case endpoint: "+(kind==="max"?"measured+uncertainty="+fmt(measured+uncertainty)+" "+unit:"measured−uncertainty="+fmt(measured-uncertainty)+" "+unit)+". Do not ignore uncertainty.",
  "Write the margin equation: "+formula+". A negative margin means the conservative bound is outside specification.",
  "Substitute and calculate: "+sub+". First evaluate the worst-case endpoint and then subtract it from the approved training limit, retaining its sign and unit.",
  "Interpret the answer: "+verdict+". A numerically passing result alone cannot prove a valid test.",
  "Independently verify probe attenuation, instrument calibration, fixture revision, and the source of the specified limit.",
  "Log the raw measurement, uncertainty basis, pass/fail/invalid disposition and board/firmware identification."
 ];
 return {question,steps,formula,sub,expected:round(margin),unit,lesson:{title:"Measurement uncertainty — "+what,summary:"Guardband means accounting for the meter's possible error before accepting a result. "+verdict+".",example:sub+". "+verdict,why:"An apparent nominal pass can fail when measurement uncertainty is included; flight-related acceptance must use approved limits and calibrated evidence.",vocab:[["Limit",limit+" "+unit],["Measured value",measured+" "+unit],["Uncertainty","±"+uncertainty+" "+unit],["Signed margin",fmt(margin)+" "+unit]]}};
}
const seen=new Set(Q.map(q=>q.id)),newQuestions=[];
for(const t of T){
 if(!Array.isArray(t.skills)||t.skills.length<5||!Array.isArray(t.cases)||t.cases.length<5)throw Error("Missing documented five-skill/case source: "+t.id);
 if(Q.filter(q=>q.topic===t.id).length!==30)throw Error("Original topic changed: "+t.id);
 for(let i=0;i<20;i++){
  const id=t.id+"-X"+(i+1);
  if(seen.has(id))throw Error("Question ID collision: "+id);
  const field=i===6||i===13?mathPage(t,i):makeText(t,i);
  const k=(i*2)%5;
  const question={id,topic:t.id,level:"Troubleshooting",difficulty:31+i,skillIndex:k,skillName:t.skills[k][0],
    learningObjective:phases[i][0],question:field.question,steps:field.steps,
    hint:"First define '"+t.skills[k][0]+"' in plain words, then separate the observation from a possible cause. "+t.cases[k][1],
    formula:field.formula,sub:field.sub,lesson:field.lesson,sourceType:"original education case; hypothetical training specifications",
    advancedStage:31+i};
  // Make key test-software cases operational and teachable, not only a generic plan.
  if(i===14&&t.id==="python-scpi"){
   question.question="Advanced Q45 — Python automated acceptance: an instrument query may return '3.28', 'nan', an empty string or time out. Write and explain a beginner-friendly function that converts the response to V, verifies it is finite, then returns PASS for a valid 3.1–3.5 V reading, FAIL for a valid outside-range reading, and INVALID for missing/malformed/untrusted measurements. Explain why a timeout must never be reported as PASS.";
   question.steps=[
    "Define input and output: raw SCPI response is a string, expected units are volts, and the three outcomes are PASS, FAIL or INVALID. Never assume every returned string is a measurement.",
    "Initialize your instrument session with an explicit transport, query timeout, required firmware/configuration and calibrated channel. A cable disconnect or unknown configuration makes the measurement INVALID.",
    "Parse carefully using try: measured=float(raw.strip()); except (ValueError,TypeError): return INVALID. Empty text and damaged strings are not acceptable floating-point measurements.",
    "Check math.isfinite(measured). Python float('nan') and infinities are legal floats but have no physical electrical meaning, so return INVALID instead of comparing them to thresholds.",
    "Apply the agreed training band only after validation: if 3.1 <= measured <= 3.5, return PASS; otherwise return FAIL. Preserve the raw string and numeric result separately.",
    "Introduce negative tests for raw values 'nan', '', 'bad', '3.8', '3.28', and a simulated timeout. Expected classifications are INVALID, INVALID, INVALID, FAIL, PASS and INVALID.",
    "Log UTC timestamp, instrument identity, calibration due date, station revision, board/firmware revision, limits and raw response before displaying any verdict. Never discard first-fail records on retry.",
    "Re-run the complete station test using a known-good source and known-bad source. Only release after the PASS/FAIL/INVALID behavior is independently reproducible and documented."
   ];
   question.lesson={title:"Python SCPI: finite-value parser and tri-state result",
    summary:"A test script is part of the safety boundary: an absent, malformed, stale or NaN voltage reading is INVALID, not a valid PASS. Only after independent validation should numeric limits be applied.",
    example:"Example beginner pseudocode: try: v = float(raw.strip()); except (ValueError, TypeError): return 'INVALID'; if not math.isfinite(v): return 'INVALID'; return 'PASS' if 3.1 <= v <= 3.5 else 'FAIL'. Test 3.28 -> PASS, 3.8 -> FAIL, 'nan' -> INVALID.",
    why:"Instrument, protocol, limit and parsing errors can otherwise create a false hardware PASS; automation must preserve raw data and distinguish invalid tests.",
    vocab:[["SCPI","Standard Commands for Programmable Instruments"],["Finite number","Not NaN or positive/negative infinity"],["PASS","Valid reading inside approved training range"],["FAIL","Valid reading outside range"],["INVALID","Untrusted or missing measurement, not a hardware failure"]] };
  }
  if(i===14&&t.id==="linux"){
   question.question="Advanced Q45 — Linux validation log triage: a test suite reports PASS in summary.json, yet scattered raw console logs contain 'ERROR: bus timeout', 'failed: DRAM' and mixed-case 'Failure' strings. Write a shell-based procedure to search case-insensitively with file name and line number, explain grep exit statuses, protect raw evidence and decide whether the reported PASS is trustworthy.";
   question.steps=[
    "Explain the evidence hierarchy: summary.json is a derived report; preserve the raw immutable device and station logs before doing any text filtering.",
    "List the exact run, hardware serial, firmware and station revisions; separate two different runs so you do not accidentally attribute another DUT's errors.",
    "Choose a safe broad command, for example grep -RniE 'error|fail|timeout' logs/. The -R scans folders, -n prints line number, -i ignores case, and -E permits alternatives.",
    "Read every hit in surrounding context and distinguish test-injected failure labels from actual assertion failures; do not count a simple keyword as proof of defective silicon.",
    "Check grep exit status: 0 means at least one match, 1 means no match, and 2 means command/file error; a status of 2 must be INVALID rather than a clean PASS.",
    "Correlate the failing timestamp with kernel dmesg, UART capture, power rails and temperature records while keeping raw originals unchanged.",
    "Re-run the exact firmware and workload with independently captured console logs, then compare first-failure signatures across runs and known-good controls.",
    "Close the investigation with documented PASS, FAIL or INVALID based on a published requirement and a complete raw audit trail. Never override an unresolved failure with a PASS summary."
   ];
   question.lesson={title:"Linux grep and evidence reconciliation",summary:"grep -RniE 'error|fail|timeout' logs/ finds mixed-case failure indicators with file names and line numbers, but the engineer must read context and distinguish grep process errors from an actual clean run.",
   example:"Command: grep -RniE 'error|fail|timeout' logs/ ; exit 0=matches, 1=none, 2=I/O/grep error. Match evidence to the correct device and timestamps before overriding a summary.",
   why:"Production testers can report misleading PASS states if the summary parser drops or misclassifies lower-level failures. Provenance and reproducibility matter.",vocab:[["grep","Search line-oriented files"],["-RniE","Recursive, show line numbers, ignore case, extended regex"],["Exit code","0=match; 1=none; 2=error"],["Raw evidence","Original unedited capture"]]};
  }
  // Connected, question-exact series/parallel schematics for new Q37 math.
  // All other Q31–50 graphics are conceptual illustrations, not a
  // hardware netlist to auto-wire onto a live STM32 board.
  if(i===6&&t.id==="series")question.network={kind:"mixed4",values:{v:12,a:100,b:200,c:300,d:80}};
  if(i===6&&t.id==="thevenin")question.network={kind:"loadedDivider",values:{v:5,top:1000,bot:1000,load:1000}};
  // Hardware Debug Interview Specialization: 5 V, 100 x 1 Ohm Parallel Array Open (∞ Ω) + Short (0 Ω) Walkthroughs
  const hwdSpecs={
   "parallel-X8":{
    question:"Advanced 38 / 50 — Interview Hardware Debug Master Case (100 Parallel Resistors): A 5.0 V main rail feeds 100 resistors (nominal 1.0 Ω each) wired in parallel. Some resistors are OPEN and some are SHORTED (broken unit reads 0 Ω instead of 1 Ω). Walk through the complete paper math FIRST (formulas + broken resistance definitions), reading the schematic, isolating shorts before opens, and using an IR infrared camera and DMM (4-wire Kelvin vs 2-wire) to identify every broken resistor.",
    formula:"1 / R_eq = Sum(1 / R_i) = (N_ok / 1.0) + (N_open / Infinity) + (N_short / 0)",
    steps:[
     "Paper Math Step 1 (Healthy Baseline): Compute healthy parallel resistance R_eq = R_nom / N = 1.0 Ω / 100 = 0.01 Ω = 10.00 mΩ, I_branch = 5 V / 1 Ω = 5 A, total I_healthy = 500 A, and total P_healthy = 2500 W before touching hardware.",
     "Paper Math Step 2 (Broken Resistor Values): Define shorted resistor R_short = 0 Ω (~1–5 mΩ physical solder bridge, G → ∞) and open resistor R_open = ∞ Ω (OL out-of-circuit, G = 0 S, I = 0 A). Even ONE 0 Ω short pulls total R_eq ≈ 0 Ω and masks every open branch!",
     "Read the Schematic First: Locate +5V_MAIN net, GND return, all 100 designators R1–R100, sub-bank jumpers JP1–JP10, and J1 feed entry so every physical measurement maps directly to exact schematic parts.",
     "Choose the Correct DMM Technique: Reject 2-wire in-circuit ohming across 10 mΩ (lead resistance ~0.24 Ω dwarfs 10 mΩ and all 100 parallel branches mask single units). Use 4-wire Kelvin milliohms for true R_eq, plus mV bus-gradient probing.",
     "Phase A — Hunt All 0 Ω Shorts First with PSU Current-Limited CC Mode + IR Camera: Limit bench supply safely (e.g., 1.0 V max, 1.5–2.5 A). Current divides almost 100% through the 0 Ω short(s), lighting only shorted resistors/pads as unmistakable IR hotspots while healthy 1 Ω branches stay cool.",
     "Isolate & Confirm Shorts Out-of-Circuit: Power OFF, walk mV probe along the +5V copper bus until drop flattens to 0 mV/tap, lift ONE pad of the suspect resistor (or open bank jumper JP_k), and measure directly with DMM: 0.000 Ω confirms SHORT! Repeat until 4-wire R_eq ≥ 10.00 mΩ.",
     "Phase B — Hunt All ∞ Ω Opens with Paper Math + IR Cold Spots: Once 0 Ω shorts are cleared, solve N_open = 100 − (1.0 / R_eq). Apply a safe bias (e.g., 1.0 V -> 1.0 W in every healthy resistor -> ~60 °C), and sweep the IR camera to pinpoint every unheated ∞ Ω cold spot (~25 °C).",
     "Verify Out-of-Circuit & Close Out: Power OFF, lift one pad on each IR cold resistor to confirm OL (∞ Ω), rework failed 0 Ω and ∞ Ω parts with verified 1.00 Ω resistors, and confirm final 4-wire R_eq = 10.00 mΩ ± tolerance."
    ],
    lesson:{
     title:"5 V, 100 × 1 Ω Parallel Open + Short Hardware Debug Interview Walkthrough",
     summary:"Do paper math first (R_eq = 10 mΩ, I_total = 500 A, short = 0 Ω masking open = ∞ Ω), check schematic topology/jumpers, hunt 0 Ω shorts first via current-limited IR hotspots + 4-wire Kelvin/mV gradient + lifted pad, then clear shorts and use N_open = 100 − 1/R_eq + IR cold spots to find every open.",
     example:"Healthy: R_eq = 1/100 = 10 mΩ (500 A). If 1 short (0 Ω): R_eq ≈ 0 Ω → IR hotspot finds short under 1V/2A limit; lift pad reads 0.000 Ω. After removing shorts, R_eq = 10.309 mΩ → N_open = 100 − (1/0.010309) = 3 IR cold spots (OL out-of-circuit).",
     why:"Probing a parallel 1 Ω bank in-circuit with a 2-wire DMM fails completely; separating shorts first (hotspot hunt) from opens second (cold-spot + KCL hunt) solves all 100 branches systematically without lifting 100 parts.",
     vocab:[["Healthy 100 × 1 Ω Array","R_eq = 0.01 Ω (10 mΩ), I_total = 500 A @ 5 V"],["Broken Short","0 Ω ideal (~1 mΩ bridge); IR hotspot + masks opens"],["Broken Open","∞ Ω (OL out-of-circuit, 0 W); IR cold spot once shorts cleared"],["Out-of-Circuit Isolation","Lift 1 pad or open bank jumper so DMM measures R_i alone, not 99 siblings"]]
    }
   },
   "parallel-X9":{
    question:"Advanced 39 / 50 — Separating Masked Faults (Multiple 0 Ω Shorts + Multiple ∞ Ω Opens): On the 5.0 V, 100 × 1.0 Ω parallel board, removing the first hot-spotted 0 Ω short (R14) leaves 4-wire R_eq = 1.98 mΩ instead of climbing ≥ 10.00 mΩ. Explain both failure modes separately: why a SECOND hidden short still masks open branches, and how to prove all shorts are cleared before trusting IR cold-spot inspection for ∞ Ω opens.",
    steps:[
     "Check paper threshold immediately after removing the first 0 Ω short (R14): ALL open-only combinations of 1.0 Ω resistors yield R_eq ≥ 10.00 mΩ (e.g., 10.10 mΩ for 1 open, 10.31 mΩ for 3 opens). Therefore R_eq = 1.98 mΩ PROVES at least one more short remains!",
     "Define the two independent failure trees cleanly: Tree A (parallel shorts ≤ 5 mΩ pulling R_eq << 10 mΩ and tripping OCP) vs Tree B (parallel opens = ∞ Ω raising R_eq > 10 mΩ once Tree A count reaches zero).",
     "Keep the bench PSU in current-limited CC mode (V_clamp ≤ 1.0 V, I_limit = 2.0 A) so remaining healthy resistors and downstream traces stay safe while re-scanning with the IR camera.",
     "Use the IR camera + schematic bank map: with R14 lifted, 100% of injected test current now redirects through the SECOND short (e.g., R62) which immediately lights up thermally.",
     "Confirm by walking a 4-wire / mV probe down the schematic bus beyond R14 until ΔV_bus flattens at R62, then power OFF and lift one pad on R62 to verify 0.000 Ω out-of-circuit.",
     "Re-check 4-wire Kelvin across the array after isolating R62: seeing R_eq jump from 1.98 mΩ to 10.309 mΩ (strictly ≥ 10.00 mΩ!) falsifies all remaining short hypotheses and unlocks Phase B.",
     "Execute paper math on 10.309 mΩ: m = 1.0 / 0.010309 = 97 healthy resistors → target N_open = 100 − 97 = 3 opens; switch to safe 1.0 V IR bias to spot the 3 unheated 25 °C cold resistors.",
     "Document independent out-of-circuit DMM proof (0.000 Ω for each removed short, OL / ∞ Ω for each lifted open) tied cleanly to schematic reference designators before rework."
    ],
    lesson:{
     title:"Phase A → Phase B Gate: Why R_eq ≥ 10.00 mΩ Proves Zero Shorts Remain",
     summary:"Because adding any parallel short pulls R_eq far below 10 mΩ while adding opens pushes R_eq above 10 mΩ, checking whether 4-wire R_eq ≥ 10.00 mΩ mathematically separates multi-short masking from remaining ∞ Ω open faults.",
     example:"1st short removed → R_eq = 1.98 mΩ (< 10 mΩ) ⇒ another 0 Ω short exists (find hot spot R62). 2nd short removed → R_eq = 10.309 mΩ (≥ 10 mΩ) ⇒ 0 shorts remain; N_open = 100 − 1/0.010309 = 3 opens.",
     why:"Engineers who switch to full voltage after finding only one short risk board damage or missing hidden second shorts; the 10.00 mΩ gate guarantees every short is cleared first.",
     vocab:[["10.00 mΩ Gate","R_eq < 10 mΩ means ≥1 short remains; R_eq > 10 mΩ (with 0 shorts) counts opens"],["Masked Open","An ∞ Ω open is invisible in R_eq while a 0 Ω short shunts the bus"],["Second-Hotspot Sweep","After lifting 1st short, CC test current immediately heats the next 0 Ω short"]]
    }
   },
   "schematics-X8":{
    question:"Advanced 38 / 50 — Schematic-Driven Debug (100 Parallel Resistors & Kelvin Mapping): Before touching any probe to the 5.0 V, 100 × 1.0 Ω array board showing open and 0 Ω short faults, explain the controlled schematic inspection and A/B/A pad-lift procedure used to map DMM and IR findings onto exact PCB designators.",
    steps:[
     "Read the schematic topology before powering up: confirm R1–R100 all bridge +5V_MAIN to GND, note resistor wattage/package (e.g., 1.0 Ω precision shunts), and mark feed connector J1 plus bank jumpers JP1–JP10.",
     "Record calculated paper expectations on the schematic margins: 100 branches healthy → R_eq = 10.00 mΩ; short = 0 Ω; open = ∞ Ω; single isolated resistor removed from circuit = 1.000 Ω.",
     "Overlay IR camera hotspots onto the PCB silkscreen and schematic sub-banks to narrow 100 parallel candidates down to 1–2 adjacent parts before touching a soldering iron.",
     "Trace the copper feed pour on layout/schematic: identify which side of R_k connects upstream toward J1 so DC mV probe readings distinguish upstream current flow from zero-current downstream stubs.",
     "Design an A/B/A lifted-pad isolation check (power OFF): (A) record in-circuit 4-wire R_eq, (B) lift one pad of suspect R_k so it is 100% isolated from the 99 siblings, measure R_k directly (0.000 Ω = short, OL = open), and inspect rail R_eq jump.",
     "Restore (A) with a verified 1.00 Ω replacement resistor when faulted (or re-solder original if healthy), keeping solder fillets clean so no artificial solder bridge is introduced.",
     "Re-check total 4-wire array resistance between schematic Kelvin sense nodes (+5V_SENSE to GND_SENSE) after every single rework step against paper target R_eq = 1.0 / (100 − k_open).",
     "Archive annotated schematic showing exact failed designators (e.g., R14/R62 shorted 0 Ω; R27/R53/R88 open ∞ Ω), out-of-circuit DMM photos, and IR thermal captures."
    ],
    lesson:{
     title:"Schematic Mapping & Single-Pad A/B/A Isolation on Parallel Banks",
     summary:"Reading the schematic first identifies copper bus feed points, sub-bank jumpers, and shared nets so IR hotspots and 4-wire mV drops pinpoint the exact failing designator before a single pad is lifted.",
     example:"Lift 1 pad of IR hotspot R14 → out-of-circuit DMM = 0.000 Ω (short confirmed), rail 4-wire R_eq jumps from ~1 mΩ toward ≥ 10 mΩ (or next short). Install verified 1.00 Ω → R_eq tracks paper prediction.",
     why:"Never unsolder all 100 resistors blindly; lifting one pad only on the schematic/IR-localized candidate avoids lifted PCB pads and proves root cause with A/B/A evidence.",
     vocab:[["Lifted-Pad Isolation","Unsoldering 1 terminal breaks parallel coupling for true 1.00 Ω vs 0 Ω vs OL DMM check"],["Silkscreen Overlay","Aligning IR hotspot coordinates to schematic reference designators R1..R100"],["Sub-Bank Jumper","Schematic jumper (JP1–JP10) enabling O(log₂ N) half-split current isolation"]]
    }
   },
   "instruments-X8":{
    question:"Advanced 38 / 50 — DMM 2-Wire Error vs 4-Wire Kelvin & FLIR IR Camera Calibration (100 × 1 Ω Array): While debugging the 5.0 V, 100 × 1.0 Ω parallel array, a technician tries 2-wire DMM Ω mode and reads ~0.25 Ω across every resistor, concluding nothing is shorted. Explain the instrument error, set up 4-wire Kelvin + mV gradient + IR camera properly, and verify by A/B/A probe comparison.",
    steps:[
     "Quantify why 2-wire DMM misled the technician: typical test leads add ~0.24 Ω in series with a 0.010 Ω healthy bus (2400% error!) and also in series with a ~0.001 Ω dead short, reading ~0.24–0.25 Ω for BOTH!",
     "Remember the parallel circuit rule too: even with zero lead error, in-circuit probing across any healthy 1.0 Ω resistor measures that resistor IN PARALLEL with the 99 siblings, never 1.000 Ω.",
     "Switch to 4-wire Kelvin resistance (separate Force HI/LO carrying I_test and Sense HI/LO measuring pure DUT voltage across the copper rail pads) — cancels 0.24 Ω lead drop so healthy = 10.00 mΩ, 1 short ≈ 1 mΩ, and 3 opens = 10.309 mΩ.",
     "To locate WHERE the 0 Ω short sits without lifting 100 parts, inject constant DC current (1.0 V max / 2.5 A CC limit) into +5V_MAIN and use DMM in DC mV/μV mode to trace copper voltage drop along the bus.",
     "Pair electrical mV probing with an FLIR IR camera: remember shiny tin/lead solder joints have low emissivity (~0.05–0.1) and reflect ambient heat — use matte high-emissivity tape or thin Kapton over target banks for accurate ΔT contrast.",
     "Run IR short-hunt pass under CC limit (hotspots = 0 Ω shorts), clear shorts until 4-wire Kelvin reads ≥ 10.00 mΩ, then switch to safe 1.0 V bias pass where healthy resistors warm uniformly and ∞ Ω opens appear as blue cold spots.",
     "Perform A/B/A probe verification: check meter zero with shorted Kelvin clips, re-measure with an independent second DMM, and confirm lifted-pad readings directly on the removed resistor terminals.",
     "Document 4-wire setup range, PSU compliance settings (V_max, I_lim), emissivity note, and out-of-circuit resistance before approving rework."
    ],
    lesson:{
     title:"Instrument Mastery: 4-Wire Kelvin Milliohms, mV Gradient & IR Emissivity",
     summary:"2-wire leads (~0.24 Ω) swamp a 10 mΩ parallel array; 4-wire Kelvin sensing, DC mV copper-bus tracing under CC compliance, and emissivity-checked IR thermography isolate 0 Ω shorts and ∞ Ω opens rapidly.",
     example:"2-wire DMM on 10 mΩ array reads 0.25 Ω whether healthy or shorted. 4-wire Kelvin reads 1.67 mΩ (short present) vs 10.00 mΩ (healthy) vs 10.53 mΩ (5 opens). IR + mV pinpoints the single bad branch.",
     why:"Choosing the right probe geometry and instrument mode determines whether a fault is visible above the noise floor or completely buried inside test-lead resistance.",
     vocab:[["4-Wire Kelvin","Separate Force and Sense leads eliminate test-lead resistance on mΩ rails"],["DC mV Gradient","Probing μV/mV drop along copper bus shows where current stops at a short"],["IR Emissivity Control","Matte tape/coating prevents false cold reflections on shiny metallic solder pads"]]
    }
   },
   "power-X8":{
    question:"Advanced 38 / 50 — Safe Power-Limited Supply Strategy & Thermal Dissipation (5 V, 100 × 1 Ω Array): Why would energizing an un-inspected 5 V, 100 × 1 Ω parallel array directly with a 5 V high-current supply risk PCB trace delamination or blown shunts, and how does current-limited (1 V / 2 A) excitation safely turn thermal dissipation I²R into your primary IR fault-finding tool?",
    steps:[
     "Calculate unconstrained 5 V baseline thermal load on paper: healthy I = 500 A → P_total = 2500 W (25 W per 1 Ω resistor!), while a 0 Ω short across 5 V draws massive destructive fault current!",
     "Establish safety rule first: NEVER inject full high-power 5 V onto a suspected shorted parallel bank before power-OFF 4-wire Kelvin R_eq verification.",
     "Design safe CC excitation for Phase A (Short Hunt): set programmable bench supply V_clamp ≤ 0.5–1.0 V and I_limit = 1.5–2.5 A CC mode, keeping power inside a few watts safely.",
     "Analyze current divider power localization: with a 2 mΩ short in parallel with 99 × 1 Ω branches under 2.5 A CC, V_rail = 4.2 mV; P_healthy ≈ 17 μW each, while localized bridge/trace heating concentrates hundreds of mW right at the 0 Ω defect!",
     "Watch the thermal contrast on the IR camera: nearly all 2.5 A flows only along the path from injection J1 through the shorted branch back to GND, creating an unmistakable IR trail straight to the broken resistor.",
     "Verify A/B/A thermal repeatability: after lifting one pad on the suspect hot resistor, confirm thermal hotspot vanishes at that coordinate and verify if 4-wire R_eq recovers ≥ 10.00 mΩ.",
     "Configure Phase B (Open Hunt) thermal power once shorts = 0: apply safe controlled 1.0 V bias -> healthy 1 Ω resistors dissipate P = V²/R = 1.0 W (~35 °C rise -> ~60 °C), while OPEN (∞ Ω) units dissipate 0 W (~25 °C cold spot).",
     "Confirm total power telemetry (P_measured vs V × I_expected) and IR uniformity across all 100 resistors after replacing failed 0 Ω shorts and ∞ Ω opens."
    ],
    lesson:{
     title:"Safe Current-Limited I²R Thermal Fault Localization (2500 W Hazard Avoidance)",
     summary:"Unconstrained 5 V across 100 × 1 Ω means 500 A / 2500 W. Current-limited CC injection (≤1 V, 1.5–2.5 A) turns I²R safely into an IR camera beacon for 0 Ω shorts first, then reveals ∞ Ω opens cleanly via P = V²/R contrast.",
     example:"Unconstrained 5 V = 2500 W (hazard). Phase A (1 V / 2.5 A CC): I_short = 2.09 A vs I_healthy = 4.2 mA → short glows hot! Phase B (1 V, 0 shorts): healthy = 1.0 W (~60 °C), open = 0 W (25 °C blue).",
     why:"Thermal power equations P = I²R and P = V²/R invert behavior cleanly between series-limited short tests and voltage-driven open tests.",
     vocab:[["CC Mode Current Limit","Bench PSU holds current steady (e.g., 2.5 A) and drops voltage safely across short"],["I²R Short Heating","Dominates when current is constant and 1 branch drops to mΩ resistance"],["V²/R Open Contrast","Dominates at fixed bias voltage once shorts are gone: healthy warms, ∞ Ω stays ambient"]]
    }
   },
   "kcl-kvl-X8":{
    question:"Advanced 38 / 50 — KCL Branch Budgeting Across 100 Parallel Resistors (Opens vs Shorts): Use Kirchhoff's Current Law (I_total = Σ I_k) to explain why measuring total supply current cleanly counts exact missing ∞ Ω open branches ONLY after 0 Ω shorts are eliminated, and how measuring branch node mV drops tracks KCL current paths toward a short.",
    steps:[
     "Write KCL across the shared +5V_MAIN rail feeding 100 parallel branches: I_total = Σ_{k=1}^{100} I_k = Σ (V_node / R_k).",
     "Insert paper healthy parameters (V_s = 5.0 V, R_nom = 1.0 Ω): I_k,healthy = 5.0 A per resistor → I_total,healthy = 100 × 5.0 A = 500.0 A.",
     "Substitute broken open resistor condition (R_open = ∞ Ω → I_open = 5 V / ∞ = 0 A): each open removes exactly 5.0 A at 5 V (or 1.0 A at 1.0 V safe bias), making KCL directly count opens via k_open = 100 − (I_total / I_single).",
     "Prove why KCL total current breaks when a 0 Ω short is present: I_short = V_node / R_short dominates KCL (or hits PSU CC/OCP), while V_node collapses toward 0 V so all remaining healthy branches drop to near-zero current too.",
     "Apply KCL along the physical PCB copper pour segments connecting R1 through R100: at tap j, current downstream I_bus(j+1) = I_bus(j) − I_j.",
     "Because nearly 100% of current exits through the shorted tap R_k (I_k ≈ I_test), KCL forces downstream bus current I_bus(k+1..100) ≈ 0 A!",
     "Measure ΔV_bus = I_bus(j) × R_seg with a DC mV DMM along +5V_MAIN: ΔV climbs steadily up to R_k and drops cleanly to 0 mV/segment beyond R_k — pinpointing the exact short via KCL + Ohm's law.",
     "Verify total KCL conservation (I_in = I_healthy_sum) once all 0 Ω shorts and ∞ Ω opens are replaced, confirming measured current matches theoretical N × (V_test / 1.0 Ω) within instrument tolerance."
    ],
    lesson:{
     title:"KCL Branch Counting & Copper-Bus Current Termination at a 0 Ω Short",
     summary:"By KCL, total bus current equals the sum of active 1 Ω branch currents (N_open = 100 − I_total/I_branch) whenever 0 shorts exist, while bus-segment current termination (ΔV_bus = 0 downstream) isolates 0 Ω shorts cleanly.",
     example:"Shorts cleared @ 1.0 V: I_total = 96.0 A / 1.0 A = 96 healthy → 4 opens. Short present @ 2.0 A: mV bus drop stops rising at tap k=14 → KCL says current exited via R14 short.",
     why:"KCL works both globally (counting missing parallel branches) and locally (finding where current dives to ground along a PCB copper bus).",
     vocab:[["Global KCL Open Count","k_open = N − I_total / I_branch (valid only after all 0 Ω shorts are removed)"],["Local Bus KCL Drop","I_bus(downstream) = I_bus(upstream) − I_tap → reaches ~0 A right after a 0 Ω short"],["Short vs Open KCL Sign","Opens decrease total rail current; shorts spike rail current toward PSU limit and collapse bus voltage"]]
    }
   }
  };
  if(hwdSpecs[id]){
   const hs=hwdSpecs[id];
   question.question=hs.question;
   question.steps=hs.steps;
   question.lesson=hs.lesson;
   question.expected=undefined;
   delete question.unit;
   if(hs.formula)question.formula=hs.formula;
   else delete question.formula;
   delete question.sub;
  }
  if(field.expected!==undefined){question.expected=field.expected;question.unit=field.unit;}
  if(!question.steps.length||question.steps.length<8||!question.lesson)throw Error("Missing detailed worked guidance: "+id);
  seen.add(id);newQuestions.push(question);
 }
}
if(newQuestions.length!==460)throw Error("New question count != 460");
Q.push(...newQuestions);window.AVIONICS_EXPECTED_PER_TOPIC=50;
window.AVIONICS_ADVANCED_50={added:460,total:Q.length,version:12,stages:phases.map(p=>p[0])};
})();
