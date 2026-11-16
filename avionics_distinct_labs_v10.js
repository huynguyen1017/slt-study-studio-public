"use strict";
/* Source-aligned, hand-authored lab tasks for 23 electrical/avionics chapters.
 * Not copied textbook problems. Each title/question/expected check is unique.
 * Distinguishes a physical measurement from its unit or prefix.
 */
(function(){
const bank={
units:[
["Identify a current measurement and its unit","A bench report displays 0.025 A from a current-sense shunt. Explain how you would relabel this same physical current in mA without changing the measurement.","0.025 A equals 25 mA. The measured current stays identical: only the unit scale changes.","Check the shunt voltage and known resistance; do not attempt to measure a prefix."],
["Convert a real shunt measurement","A 10 Ω calibrated shunt has 0.25 V across it. Describe the voltage-meter connection and derive the current in amperes and milliamperes.","A DMM measures 0.25 V across the shunt; I = 0.25 V / 10 Ω = 0.025 A = 25 mA.","Voltage is measured in parallel across the two shunt terminals; do not short the supply."],
["Read and verify a capacitor label","A parts tray says 47 µF, but the capacitance meter displays 0.000047 F. Is the part's unit conversion consistent, and how should the result be recorded?","47 µF × 10⁻⁶ = 0.000047 F: the values represent the same capacitance.","Discharge the isolated capacitor before a safe capacitance measurement."],
["Select a resistance measurement range","A schematic specifies 2 MΩ, but a meter operator enters 2,000 Ω. State the correct base-unit magnitude and how to measure the isolated resistor.","2 MΩ = 2,000,000 Ω; the mistaken entry is 1,000× too small.","Disconnect power and isolate the resistor from parallel board paths before using Ω mode."],
["Interpret a limit with uncertainty","A 3.30 V rail has an upper limit of 3.35 V and expanded measurement uncertainty ±0.03 V. Explain the upper-bound decision rule.","Worst credible upper reading = 3.30 + 0.03 = 3.33 V; it is below 3.35 V, under the stated uncertainty rule.","Record the meter range, uncertainty convention, calibration and actual acceptance rule."]
],
ohm:[
["Measure a regulator output","A regulator should deliver 3.3 V. Explain where the DMM positive and common leads connect and which reference determines the reading.","Red lead at regulator output and COM at its documented return gives Vout relative to GND.","Use DC-voltage mode, not current mode, across a source."],
["Set a safe supply current limit","An unpowered prototype is expected to draw 120 mA at 3.3 V. Describe an initial current-limited bring-up and what constitutes an abnormal result.","Verify polarity and board rating, set a current limit per the approved procedure, observe current and rail voltage.","Power down when current limit engages; never increase it blindly."],
["Check resistance with the board off","A 1 kΩ resistor reads much lower while installed than when removed. Explain the difference and a way to test it.","Parallel PCB paths reduce in-circuit equivalent resistance; measure a safely isolated resistor.","Turn power off, discharge stored charge and remove a leg if the procedure permits."],
["Compare calculated and measured shunt current","A 330 Ω load is across 3.3 V. A 10 Ω shunt indicates 0.090 V. Explain which predicted and measured currents you would compare.","Ideal 3.3/330 = 10 mA; measured shunt current 0.090/10 = 9 mA; investigate the load and shunt influence.","Check shunt placement, voltage drops, measurement uncertainty and supply compliance."],
["Identify reversed meter polarity","The rail is called +5 V, yet the DMM reads −5.0 V. Explain how to distinguish reversed leads from a genuinely negative rail.","Identify the true return node and lead orientation; reversing the probes changes the indicated sign.","Do not assume the board is defective from sign alone."]
],
power:[
["Find a board's input power","A board reads 5.0 V and 0.40 A at its input. Explain what supply measurements are needed and how to record watts.","P = 5.0 V × 0.40 A = 2.0 W at the measured point.","Report the measurement conditions and whether the reading is average or transient."],
["Measure energy over a test interval","A constant-load test runs at 2 W for 30 s. Describe the measurement record needed to estimate energy.","E = Pt = 2 W × 30 s = 60 J if power remains constant.","For a variable load, integrate P(t), rather than multiplying one random sample."],
["Evaluate sense-resistor heating","A 0.1 Ω shunt carries 2 A steady current. Explain how to check its dissipation against its rating.","P = I²R = 2² × 0.1 = 0.4 W.","Compare with derated continuous power and thermal environment."],
["Interpret component derating","A resistor rated 0.5 W dissipates 0.18 W. Determine whether it meets a lab requirement of at most 50% rated power.","50% of 0.5 W = 0.25 W, so 0.18 W meets that stated derating criterion.","Use the specific manufacturer/package thermal limits."],
["Diagnose supply current-limit behavior","A power supply enters current limit as the load is enabled. Describe safe evidence collection before replacing parts.","Record commanded voltage, compliance limit, actual voltage/current and enable timing.","Disable the load if abnormal; distinguish inrush from sustained excess current."]
],
series:[
["Verify a single current path","Identify the one uninterrupted current path through three resistors on a schematic, and explain what happens if the middle resistor opens.","An open in a true series chain interrupts current everywhere in that path.","Confirm source off, continuity expectations and no parallel bypass."],
["Determine a series-chain equivalent","A source feeds 100 Ω, 150 Ω and 50 Ω in series. Describe the meter setup needed to check their equivalent resistance.","With all power removed and network isolated, Rtotal = 300 Ω.","Parallel connections on a real board invalidate a simple in-circuit check."],
["Measure the correct divider node","A 5 V divider has 2.2 kΩ on top and 1 kΩ on bottom. State where to connect a DMM to verify midpoint voltage.","Vout = 5 × 1/(2.2+1) ≈ 1.5625 V relative to the bottom return.","Probe midpoint to reference, not across the upper resistor."],
["Test Kirchhoff voltage conservation","A 12 V source feeds three series loads; the first two drops are 3 V and 4 V. Describe the third-drop check.","The remaining drop should be 12 − 3 − 4 = 5 V for the same sign convention.","Measure drops with a consistent loop orientation."],
["Build and probe a combined series-parallel loaded divider","A 3.3 V unloaded divider (330 Ω top, 470 Ω bottom) predicts 1.94 V, but connecting a 470 Ω sensor load in parallel with the bottom resistor creates a series-parallel network. Plan the measurement at Node X (before and after attaching the parallel load) and predict the new voltage.","With 470 Ω || 470 Ω = 235 Ω in series with 330 Ω, loaded V_X = 3.3 × 235 / 565 ≈ 1.37 V.","Probe Node X to GND on DMM (V mode), never breaking the ground return.","series-parallel"]
],
parallel:[
["Confirm identical node pairs","Explain how to verify that two components really connect between the same nodes A and B rather than merely appearing side by side.","Both ends of each branch must connect to the same A and B nets.","Identify net labels, not resistor drawing positions."],
["Check a parallel equivalent resistor","Two 1 kΩ resistors share identical nodes. Describe a safe resistance check and the predicted equivalent.","Rparallel = 500 Ω when the network is isolated and unpowered.","Never use Ω mode on an energized board."],
["Compare parallel branch currents","Two branches, 300 Ω and 600 Ω, each see 3 V. Which branch carries more current and how could a shunt confirm it?","I1 = 10 mA and I2 = 5 mA; the smaller resistance draws twice the current.","Measure each branch without shorting nodes or altering the circuit appreciably."],
["Verify current conservation at a split","An input supply reads 15 mA and branches read 10 mA and 5 mA. Describe the proper KCL consistency check.","Iin = I1 + I2 = 15 mA within instrument uncertainty.","Simultaneous readings and meter burden may matter."],
["Diagnose an open branch inside a series-parallel bank","On a 3.3 V breadboard, a 100 Ω series feeder drives two parallel 220 Ω branches (bank R_p = 110 Ω, V_node = 1.73 V). Predict what happens on the DMM when you pull out one 220 Ω branch leg, and explain how to confirm why V_node jumped.","Opening one parallel leg raises bank resistance to 220 Ω (R_tot rises from 210 Ω to 320 Ω), dropping feeder current and pushing V_node up to 3.3 × 220 / 320 ≈ 2.27 V.","Power off before re-inserting parts; compare before/after node voltage and feeder current.","series-parallel"]
],
"kcl-kvl":[
["Record entering and leaving branch currents","At a node, 12 mA enters and two observed currents of 7 mA and 5 mA leave. Describe sign and arrow conventions for a KCL test.","Use entering positive and leaving negative: 12 − 7 − 5 = 0 mA.","Reference every measured current direction consistently."],
["Measure a complete voltage loop","A 9 V loop has 2 V and 3 V drops measured. Explain the expected third drop and measurement orientation.","Remaining third drop = 4 V so the signed sum is 9 − 2 − 3 − 4 = 0.","Never add drops taken with inconsistent probe polarity."],
["Document a ground-reference choice","Two scope channels disagree on a node by 0.15 V due to different references. Explain how to establish a common reference.","Identify schematic return and measure reference-to-reference voltage before comparison.","Check scope ground safety and differential probe requirements."],
["Measure node voltage in a series-parallel junction","A 3.3 V NUCLEO supply feeds Node X via a 330 Ω series stem, while two 470 Ω branches tie Node X to GND. Explain how measuring Node X lets you verify KCL entering through R1 equals KCL leaving through R2 and R3 without breaking branches.","Measure V_X (≈ 1.37 V) and V_3V3 relative to GND: I_in = (3.3 − V_X)/330 ≈ 5.84 mA matches I2 + I3 = V_X/470 + V_X/470 ≈ 2.92 + 2.92 mA.","Measure resistor exact values power-off first so shuntless Ohm's Law stays accurate.","series-parallel"],
["Choose mesh-loop signs","Two loops share a resistor. Explain why currents through that shared resistor must be represented with a signed difference.","For the chosen loop orientation, shared-branch current is I1 − I2 (or the reverse with a consistent sign).","Reversing a loop direction should not change the physical solution."]
],
thevenin:[
["Find open-circuit output safely","A sensor port reads 2.4 V unloaded. Explain the open-circuit voltage test needed for its Thevenin model.","Use a suitable high-impedance measurement across the designated output terminals with the load disconnected.","Check whether instrument loading is negligible."],
["Measure a Norton current without shorting hardware","Explain why Norton short-circuit current is a model quantity and when it may be unsafe to measure directly.","Derive IN = Vth/Rth from a safe source model or a rated current-limited fixture.","Do not short an unknown powered sensor or spacecraft connector."],
["Measure change under a known load","A source reads 5 V open circuit and 4.5 V with a specified safe load. What additional measurement supports estimating Rth?","Record the load current and calculate Rth = (Voc − Vload)/Iload.","Stay inside the source's rated current envelope."],
["Bench-verify R_th of a series-parallel divider stage","A 3.3 V divider (660 Ω top, 660 Ω bottom) adds a 150 Ω series output resistor before port A–B. Describe the power-OFF shorted-source check and predicted DMM ohm reading.","With supply disconnected and input shorted to GND only in model/unpowered harness, port A–B sees (660 || 660) + 150 = 480 Ω.","Never short a live 3V3 pin—disconnect power completely before ohmmeter testing.","series-parallel"],
["Check superposition experimentally","Two independently controllable small-signal sources drive a linear load. How would you validate superposition?","Measure each contribution with the other modeled source zeroed, then compare their signed sum to both-on behavior.","Keep conditions linear and verify safe switching between tests."]
],
ac:[
["Derive signal frequency from edges","An oscilloscope shows rising edges 20 ms apart. Explain the measurement needed to label the frequency.","Period T = 20 ms and f = 1/T = 50 Hz.","Inspect at least multiple cycles and trigger stability."],
["Select timebase for an AC cycle","A 2 kHz sinusoid is displayed. What horizontal time scale reveals at least two complete cycles on 10 divisions?","T = 0.5 ms; at least 1 ms total window, e.g. 0.1 ms/div.","Avoid aliasing and inadequate sample rate."],
["Distinguish RMS from peak","A sine wave has 10 V peak (zero DC offset). Which scope and DMM readings should agree?","Vrms = 10/√2 ≈ 7.07 V for the sinusoid.","True-RMS meter bandwidth and waveform shape matter."],
["Measure two-channel phase shift","Two 1 kHz sine waves differ by 250 µs. Describe how to capture and interpret their phase difference.","Period 1 ms, phase angle = 250/1000 × 360° = 90°.","Record which channel leads or lags."],
["Explain reactive impedance","At higher frequency, a capacitor draws more sinusoidal current for the same voltage. Which test reveals the change?","Compare current amplitude versus frequency with a safe fixed-amplitude sine source.","Use complex impedance and phase, not DC resistance alone."]
],
capacitors:[
["Verify capacitor charge-versus-voltage","A 10 µF capacitor charges to 5 V. Explain what capacitance and voltage readings support its stored charge estimate.","Q = CV = 10 µF × 5 V = 50 µC.","Respect polarity and voltage rating for electrolytics."],
["Observe capacitor voltage change","A capacitor's voltage rises over time. What scope connections and timing observation distinguish it from an ideal wire?","Record Vc(t) across its terminals and compare slope with I/C.","A capacitor may retain charge after shutdown."],
["Estimate energy before servicing","A 100 µF capacitor is at 12 V. Calculate the energy requiring a safe discharge procedure.","E = ½CV² = 0.0072 J.","Verify voltage zero with an appropriate meter, not by touching terminals."],
["Inspect local supply decoupling","A fast load step causes a rail dip. Explain the physical placement you would inspect first.","Inspect short supply-return loop and local bypass near the IC pins.","Do not assume capacitance value alone fixes high-frequency inductance."],
["Separate ESR heating from capacitance","A capacitor becomes hot under ripple load. Which specification and measurement distinguishes ESR loss from capacitance?","Check ripple current and ESR; estimated heat is Irms² × ESR.","Inspect measurement frequency and temperature dependence."]
],
rc:[
["Compute RC response time on a schematic","A 1 kΩ / 1 µF low-pass is drawn. Which resistance and capacitance define its nominal time constant?","τ = 1 kΩ × 1 µF = 1 ms.","Use the effective Thevenin resistance actually seen by C."],
["Capture a charging trace","After a clean voltage step, an RC node reaches about 63.2% of its final change. Explain what the scope trace shows.","This occurs after one time constant for an ideal first-order charge.","Check trigger timing and initial condition."],
["Observe RC discharge safely","A charged capacitor decays toward zero. Explain the expected fraction at one τ and how to probe it.","V(τ) = V0/e ≈ 36.8% of its initial magnitude.","Do not manually short a charged high-energy capacitor."],
["Choose a settling-time delay","A data-acquisition routine samples a first-order RC after 5τ. Explain the expected remaining error.","Exp(−5) ≈ 0.67% remains for a simple exponential.","Check actual load, tolerance and settling criterion."],
["Diagnose measurement loading","A DMM changes the observed slow RC discharge. What effective resistance did the instrument introduce?","The DMM input resistance sits in parallel with the original discharge resistance.","Compare multiple instrument loading configurations."]
],
inductors:[
["Measure response to changing coil current","An inductor carries a current ramp. Explain which quantities a scope and current probe must capture.","For an ideal inductor, VL = L × dI/dt.","Never interrupt high current without a suppression path."],
["Measure RL transient duration","A 100 mH coil has 50 Ω series resistance. What timing behavior should a scope capture?","τ = L/R = 0.1/50 = 2 ms.","Check winding resistance and driver limits."],
["Estimate coil magnetic energy","A 10 mH coil carries 2 A. Which current measurement supports estimating stored energy?","E = ½LI² = 0.02 J.","Account for current sensor accuracy and saturation."],
["Inspect a flyback diode","A relay-coil driver repeatedly fails on turn-off. What diode connection should be checked first?","Flyback protection must provide a safe path for inductive current when switching off.","Observe clamp waveform without grounding a probe across unrelated potentials."],
["Reduce probe-loop inductance","A switch node appears to overshoot by 10 V with a long clip but not a short spring ground. What does this comparison suggest?","The probe loop may be introducing an artifact via parasitic inductance.","Repeat with correct voltage rating and probe ground geometry."]
],
filters:[
["Characterize first-order low-pass attenuation","A 1 kHz low-pass is tested at 100 Hz and 10 kHz. Which amplitudes show passband versus attenuation?","Below cutoff is largely passed; above cutoff is attenuated for a simple RC low-pass.","Keep source amplitude and load constant."],
["Verify a high-pass DC block","A coupling filter removes DC bias but passes audio frequency. How do you show both behaviors?","Compare DC and AC output with correct coupling and safe signal levels.","A high-pass cannot preserve DC level."],
["Measure RC cutoff with a sweep","A 1 kΩ, 100 nF low-pass is built. How will you locate its −3 dB point?","fc = 1/(2πRC) ≈ 1591.5 Hz; verify ratio ≈ 0.707.","Use a frequency sweep and controlled source/loading."],
["Find resonant peak experimentally","An RLC network shows a voltage peak. Which graph and component values help estimate its natural frequency?","Measure amplitude versus frequency; f0 = 1/(2π√LC).","Damping and topology shift the observed resonance."],
["Observe damping versus ringing","Adding series resistance reduces RLC ringing. What two waveform measurements demonstrate that change?","Compare overshoot and decay envelope at the same step stimulus.","Do not confuse reduced ringing with unchanged bandwidth."]
],
magnetics:[
["Measure ideal transformer ratio","A primary has 200 turns, secondary 100 turns, and primary excitation 24 V AC. What secondary result supports an ideal turns-ratio check?","Ideal Vs/Vp = Ns/Np = 0.5, so Vs ≈ 12 V AC.","Only use approved low-voltage isolated fixtures."],
["Verify an isolation boundary","A transformer module claims galvanic isolation. What OFF-state continuity check is appropriate?","Inspect expected insulation boundary and specified isolation test procedure.","Never apply megger/high-voltage tests to uncertified board pins."],
["Recognize possible core saturation","A converter input current rises sharply as applied volt-seconds grow. Which waveform clues suggest saturation?","Compare input current slope, frequency, duty and magnetizing current model.","Current increase alone does not prove saturation."],
["Distinguish line and phase voltage","A three-phase source is reported as 208 V line-to-line. What connection information must be recorded before inferring phase voltage?","For balanced wye, VLN = VLL/√3 ≈ 120 V; delta is different.","Never assume the connection topology."],
["Include power factor in test reports","A balanced three-phase load shows 400 V line-line, 10 A, PF 0.9. What inputs are required for real power?","P = √3 × 400 × 10 × 0.9 ≈ 6.24 kW.","Use appropriate instrument ratings and qualified personnel."]
],
components:[
["Check diode orientation","An LED never illuminates in a current-limited 3.3 V circuit. Which marking and polarity should you inspect?","Compare anode, cathode and measured forward voltage with the schematic.","Do not connect an LED directly across a source without a rated limiter."],
["Choose a current-limiting resistor","A 5 V source drives a 2 V LED at 10 mA. What resistor and power rating calculation should precede wiring?","R = (5−2)/0.01 = 300 Ω; resistor dissipation = 0.03 W.","Use a rated part and never assume GPIO can supply that current."],
["Confirm MOSFET gate drive","A MOSFET heats when on. How will you test its gate-to-source and drain-to-source voltages?","Probe VGS and VDS under a safe defined load, and compare gate-drive requirements.","Check MOSFET limits rather than assuming logic-level operation."],
["Verify combinational truth table","A two-input logic module is built. How would you test all four combinations before calling the circuit correct?","Apply 00, 01, 10, 11 and compare each measured output to the expected truth table.","Check supply voltage, input thresholds and the chosen gate function."],
["Check I²C pull-ups","An I²C module has low idle SDA. Describe a pull-up and bus-level verification.","With power and configuration verified, both SDA and SCL should be high while idle.","Inspect open-drain wiring and safe 3.3 V bus levels."]
],
"power-rails":[
["Trace supply through the power tree","A 12 V input feeds a 3.3 V regulator and a 1 V rail. What three points should be probed in sequence?","Measure input, regulator output and load pin with a shared documented return.","Apply approved power sequencing and polarity checks."],
["Verify rail enable order","A board requires power-good before reset release. How should four scope channels record the order?","Capture input rail, derived rail, power-good and reset on one timebase.","Check required delays and threshold crossings."],
["Measure power-rail ripple","A 1 V rail shows 30 mVpp. What probe configuration avoids interpreting a ground loop as real ripple?","Use proper power-rail probing and shortest return path, then report ripple under known bandwidth.","Do not use a long ground lead for high-frequency ripple."],
["Quantify a load transient","A CPU workload causes a 1.10 V rail to drop to 1.02 V. Which trigger and measurements characterize the droop?","Capture min voltage, baseline, time-to-recover and load-edge timing; droop = 80 mV.","Record probe correction and current waveform if available."],
["Interpret differential current shunt","A 5 mΩ shunt has 55 mV measured. Which differential connections and current result are expected?","I = 55 mV / 5 mΩ = 11 A; confirm safe shunt and probe limits.","Use differential measurement and check measurement loading."]
],
schematics:[
["Follow a named schematic net","A GPIO net crosses two schematic pages. How can you prove that the test point and MCU pin connect electrically?","Trace net names and netlist references, then verify continuity with power removed.","Do not infer connectivity from line placement alone."],
["Resolve ground-reference ambiguity","An analog reading changes when referenced to chassis rather than analog return. What net information is required?","Identify AGND, DGND and chassis connections in the actual board documentation.","Check instrument grounding before making any connection."],
["Plan a safe first-power checklist","A newly assembled board is about to receive power. What four checks must be recorded first?","Inspect components, verify polarity, resistance-to-ground, set current limits and measure rail order.","Use the approved PCB/assembly bring-up plan."],
["Check clock and reset at MCU pins","The 3.3 V rail is present but firmware does not boot. What signals would you check before reflashing?","Observe reset, clock and power-good with appropriate probes and timing.","Check source clocks and configuration before assuming firmware fault."],
["Separate a board fault from a fixture fault","One socket fails but the same board passes in another. What A/B/A experiment would you perform?","Swap known-good board and socket while preserving firmware and logs.","A failing fixture alone must not be called a failing DUT."]
],
instruments:[
["Select oscilloscope bandwidth","A 350 ps rise time is expected. Why does a 20 MHz oscilloscope fail to reproduce its edge?","Bandwidth and probe loading distort short edges; choose validated bandwidth and sample rate.","Use rated probes and acquisition settings."],
["Check sampling per cycle","A 25 MHz clock is measured at 500 MS/s. How many samples should appear per complete cycle?","500/25 = 20 samples per period.","Confirm memory depth, bandwidth and acquisition mode."],
["Set a trigger for a startup fault","A supply droops only during reset. Which trigger and pretrigger capture would show both cause and result?","Trigger on reset or rail event, preserving pre-event and post-event samples.","Capture the actual event rather than relying on roll mode."],
["Verify probe factor","A 10× probe displays one tenth the expected amplitude. Which settings should be compared?","Check scope channel probe factor, compensation and probe rating.","Never assume a waveform amplitude without confirming scaling."],
["Choose DMM or oscilloscope","A DMM reads 0.9 V while a scope reports a momentary 0.7 V dip. Which result is appropriate for DC versus transient decisions?","DMM for stable/average DC; oscilloscope with proper trigger for fast droop.","State bandwidth and time resolution of both measurements."]
],
timing:[
["Measure clock period","A digital clock runs at 50 MHz. Which two successive edges should be used for the period reading?","T=1/f=20 ns; measure corresponding threshold crossings.","Check clock jitter and trigger stability."],
["Measure pulse duty cycle","A periodic signal stays high for 4 ns within an 8 ns period. What trace proves its duty cycle?","Duty = 4/8 × 100% = 50%.","Define thresholds and polarity."],
["Set up a setup-time experiment","A flip-flop fails when data changes just before a clock edge. What two waveforms must be captured?","Compare data stability before active clock edge against specified setup time.","Use correct logic thresholds and timing reference."],
["Set up a hold-time experiment","Data changes immediately after a capture edge. What measurement isolates a hold violation?","Measure earliest data change relative to clock edge and compare with required hold interval.","Include clock skew and path variation."],
["Verify reset release sequencing","A board sometimes fails cold boot. Which signal pair or group establishes reset release after valid rails and clock?","Capture power-good, clock valid and reset deassertion together.","Use the board specification for actual release margin."]
],
buses:[
["Set up UART crossover","A 3.3 V UART console produces no readable characters. Which host and peripheral lines and settings would you verify?","TX crosses to RX; common GND; same baud, parity, data and stop bits.","Do not connect 5 V logic or RS-232 levels to STM32 pins."],
["Capture an SPI transaction","An SPI sensor does not answer an ID read. Which four signals should the logic analyzer capture?","Capture SCLK, MOSI, MISO and CS; verify clock polarity/phase.","Check IO voltage and chip-select active polarity."],
["Verify I²C idle and acknowledge","A sensor is missing from the I²C address scan. What bus levels and timing should be observed?","SDA and SCL idle high via pull-ups; observe address and ACK/NACK cycles.","Check pull-up rail and pin-mux configuration."],
["Measure CAN termination without power","A CAN bus has two 120 Ω terminating resistors. What OFF-state measurement confirms nominal parallel termination?","About 60 Ω between CAN_H and CAN_L in the expected disconnected test configuration.","Isolate transceivers and follow equipment safety guidance."],
["Distinguish protocol from physical failures","UART software times out while a TX waveform exists. What two checks separate electrical layer from decoded packet success?","Check logic levels/baud framing and then decoded bytes/response.","A waveform alone does not prove transaction correctness."]
],
"python-scpi":[
["Query instrument identity before testing","A Python test starts with an unknown instrument handle. What SCPI query must be logged to confirm the endpoint?","Send *IDN? and record the returned identity before trusting readings.","Check device manual and resource selection."],
["Configure transport timeout","A VNA query requires 1.5 s but the VISA timeout is 500 ms. What settings and error traces should be compared?","Set an approved timeout beyond expected sweep/settling and log query duration.","Do not treat a timed-out query as passing data."],
["Implement a typed measurement assertion","A SCPI instrument returns 3.30 V. Explain how software should compare it with an explicit allowed interval.","Parse a finite numerical value, preserve units and apply min/max limits.","NaN and missing readings must fail closed."],
["Keep retry evidence","A communication test passes on retry after one failure. What records should remain in the final report?","Store both attempts, instrument raw responses, timestamp and reason for retry.","Never erase the first failure from the final disposition."],
["Fail safely after a disconnect","A PSU stops responding mid-test. What must the exception handler do before the next board is tested?","Mark run invalid, preserve logs and follow an approved safe-output-disable path.","Do not silently resume or infer the supply is off."]
],
linux:[
["Capture serial logs with provenance","A test board intermittently resets. What metadata should be attached to each UART log capture?","Timestamp, serial configuration, board ID, firmware revision and stimulus.","Avoid publishing private device IDs in public reports."],
["Search raw failures case-insensitively","A report says PASS but raw text includes mixed-case ERROR and FAIL. What search strategy preserves context?","Use case-insensitive pattern search and inspect surrounding lines.","A filtered count is not a root-cause explanation."],
["Check pipeline exit status","A Linux test script uses command | tee log. How will you prevent a failed test from being reported as successful?","Use pipefail/exit-code checks and preserve command status.","Never infer success from tee's exit alone."],
["Associate firmware revision with test","Two runs differ only by a firmware commit. What information distinguishes a reproducible regression from test variation?","Record git commit hash, build ID, test configuration and raw outputs.","Preserve exact versions for A/B comparison."],
["Reconcile summary against raw log counts","The summary says zero errors but the raw file has two. How should the report handle the contradiction?","Report failed reconciliation, review parser logic and retain raw evidence.","Do not convert a contradictory report into PASS."]
],
rf:[
["Configure a spectrum analyzer","An RF source should emit a 2.4 GHz carrier. Which frequency-span, reference-level and input-protection checks precede measuring harmonics?","Set center/span/RBW appropriate to expected carrier and rated input attenuation.","RF connector calibration and amplitude reference are important."],
["Move VNA calibration to the test plane","A cable change worsens measured S11. Which calibration reference plane and fixture repeatability must be checked?","Calibrate at specified DUT plane, check cables and repeat the measurement.","Do not claim DUT matching failure from an uncorrected cable."],
["Interpret S11 return loss","An antenna port shows poor return loss at target frequency. Which magnitude and impedance measurement should be compared?","Measure reflection coefficient/S11 in a 50 Ω reference system and compare limits.","Check frequency, reference impedance and matching network."],
["Apply power-ratio dB correctly","A receiver output power is ten times input power. Which dB formula should an RF report use?","For power ratio, gain = 10log10(10) = +10 dB.","Use 20log10 only for appropriate voltage/current ratios under equal impedance."],
["Estimate wavelength for physical setup","A test operates at 2.4 GHz in free space. Which frequency and propagation assumption gives wavelength?","λ≈3×10⁸/2.4×10⁹ = 0.125 m.","Guided wavelengths differ inside cables/substrates."]
],
qualification:[
["Trace a verification record to a requirement","A flight board passes a bench current test. What traceability fields prove the specific requirement was verified?","Record requirement ID, method, result, limits, configuration and approved evidence.","One pass does not prove unrelated requirements."],
["Validate system behavior with mission-like stimuli","A subsystem passes isolated functional tests but fails an integrated scenario. What extra test is needed?","Run a representative integrated stimulus sequence and compare expected mission behavior.","Distinguish verifying specifications from validating mission use."],
["Plan a controlled thermal-vacuum test","An avionics board fails only under vacuum. What measurements and environmental conditions must be controlled?","Log chamber pressure, board temperatures, rail voltages, thermal conditions and configuration.","Follow approved TVAC equipment and contamination procedures."],
["Maintain exact test configuration","A board passes using an unapproved firmware hash. Which artifacts must be reconciled before acceptance?","Record hardware revision, serial ID, firmware hash, procedure, fixture and calibration.","Do not claim qualified configuration unless it matches approval."],
["Make a no-go evidence decision","A unit has an intermittent unexplained failure after a retest PASS. What independent evidence and authority are needed to close it?","Retain failing data, investigate reproducibility and obtain authorized disposition.","An unexplained intermittent failure cannot be ignored."]
]
};
const A=(a,b)=>a.map(x=>x.trim());
const T=window.AVIONICS_TOPICS||[],Q=window.AVIONICS_QUESTIONS||[];
for(const t of T){
 const tasks=bank[t.id];
 if(!tasks||tasks.length!==5)throw Error("Distinct lab task map missing for "+t.id);
 for(let i=0;i<5;i++){
  const q=Q.find(x=>x.id===t.id+"-A"+(i+1)),[title,prompt,answer,check,topo]=tasks[i];
  if(!q||!title||!prompt||!answer||!check)throw Error("Incomplete lab "+t.id+":"+i);
  q.question=prompt;q.learningObjective=title;q.skillName=title;
  if(topo)q.topology=topo;else delete q.topology;
  q.lesson={title,summary:"This task is about a real electrical quantity or hardware procedure: "+answer,example:check,why:t.skills[i][2],vocab:[[t.skills[i][0],t.skills[i][1]],["Expected result",answer],["Verification",check]]};
  q.steps=["Identify the actual measurement or signal: "+prompt,"Work from the referenced concept: "+t.skills[i][1],
    "State a concrete expected observation or numerical result: "+answer,
    "Finish by verifying the circuit and instrument conditions: "+check];
  q.hint=check;
  q.auditSkill=title;
 }
}
window.AVIONICS_DISTINCT_LAB_TASKS=bank;
})();