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
 parallel:{prompt:"Two loads 150 Ω and 300 Ω share both the +5 V and GND nodes. Find TOTAL supply current in mA, not just one branch.",formula:"I_total_mA = 1000 * V * (1 / R1 + 1 / R2)",sub:"I_total_mA = 1000 * 5 * (1 / 150 + 1 / 300) = 50 mA",answer:50,unit:"mA",explain:"Each branch gets 5 V: I1=5/150=33.333 mA and I2=5/300=16.667 mA. KCL gives a 50 mA total."},
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
 const question="Q44 — Guardband and uncertainty. For a hypothetical "+t.title+" acceptance measurement, "+what+" has a "+kind+"imum permitted value of "+limit+" "+unit+". The meter reads "+measured+" "+unit+" with a worst-case uncertainty of ±"+uncertainty+" "+unit+". Calculate signed guardband margin in "+unit+" and state whether the requirement passes. These are fictional training limits, NOT Muon hardware specifications.";
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
  if(field.expected!==undefined){question.expected=field.expected;question.unit=field.unit;}
  if(!question.steps.length||question.steps.length<8||!question.lesson)throw Error("Missing detailed worked guidance: "+id);
  seen.add(id);newQuestions.push(question);
 }
}
if(newQuestions.length!==460)throw Error("New question count != 460");
Q.push(...newQuestions);window.AVIONICS_EXPECTED_PER_TOPIC=50;
window.AVIONICS_ADVANCED_50={added:460,total:Q.length,version:12,stages:phases.map(p=>p[0])};
})();
