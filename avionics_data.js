"use strict";
/* Original avionics/electrical-engineering curriculum. No copied textbook problems.
   Five foundation skills + five fault scenarios + two numerical families per topic.
   The player expands each of these into 30 distinct guided practices. */
(function(){
const lines=s=>s.trim().split("\n").map(x=>x.trim()).filter(Boolean).map(x=>x.split(" | "));
const T=(id,title,group,goal,skills,cases,calc)=>({id,title,group,goal,skills:lines(skills),cases:lines(cases),calc});
window.AVIONICS_TOPICS=[
T("units","SI Units, Prefixes & Measurement","Foundations","Learn to read units and choose meaningful precision before calculating.",
`SI base unit | An SI base unit is one of seven fundamental units: meter, kilogram, second, ampere, kelvin, mole, and candela; the ampere is the base unit for electric current, while the volt is a derived unit. | A base unit identifies a fundamental physical quantity; derived units are combinations of base units, so confusing them obscures a measurement's meaning. | Identify A as the SI base unit for current, V as a derived unit, and label each instrument reading with the correct symbol.
Milli prefix | Milli means one thousandth of the unit it prefixes (10^-3), whether that unit is base or derived. | Mixing milliamps with amps creates a thousand-fold mistake. | Convert 25 mA to 0.025 A before substituting.
Micro prefix | Micro means one millionth (10^-6) of whichever SI unit it prefixes. | Capacitors are often labelled in microfarads. | A 47 µF capacitor equals 0.000047 F.
Mega prefix | Mega means one million times (10^6) the unit it prefixes. | Resistance and frequency often use large prefixes. | A 2 MΩ resistor is 2,000,000 Ω.
Measurement uncertainty | A reading has finite accuracy, resolution and repeatability. | Passing a limit at the measurement uncertainty boundary is unsafe. | Record instrument range, precision and calibration status.`,
`A technician substitutes 6 mA as 6 A. | Convert milli into the base unit first. | Prefixes must be resolved before using an equation. | Check whether expected current is plausible for the rail.
A DMM shows 0.0000047 F but the schematic says µF. | Express both readings in the same unit. | Unit consistency is needed before comparing values. | Convert 0.0000047 F into 4.7 µF.
Two instruments disagree near a tolerance limit. | Compare ranges, calibration and measurement uncertainty. | Difference does not automatically mean the DUT is defective. | Repeat with a known reference.
A report labels a signal as 100 without units. | Stop and attach the physical quantity and unit. | 100 V, 100 mV and 100 MHz mean different things. | Confirm the schematic node and instrument setting.
A calculated answer differs by six orders of magnitude. | Inspect micro and mega conversions. | Opposite prefixes produce a factor of 10^12 when confused. | Estimate the expected order of magnitude first.`,["milli","micro"]),
T("ohm","Voltage, Current, Resistance & Ohm's Law","Foundations","Understand the electrical quantities used in every bring-up measurement.",
`Voltage | Voltage is the electric potential difference between two nodes. | A voltage reading must identify both points. | Measure a regulator output with respect to its return.
Current | Electric current is the rate of electric charge transfer through a surface, I = dQ/dt; its SI base unit is the ampere (A). | Excess current can indicate a short or unexpected load. | Set a current limit on the bench supply.
Resistance | Resistance opposes current flow in an ohmic element. | Resistance and voltage together determine current. | Measure an unpowered resistor with a DMM.
Ohm's law | For an ohmic resistor, voltage equals current multiplied by resistance. | It links three directly measurable quantities. | Compare calculated branch current with a shunt measurement.
Polarity | A signed voltage depends on the positive and negative probe connection. | Reversed leads invert the reading. | Identify ground before attaching the DMM.`,
`A new rail draws much more current than predicted. | Apply current limiting and inspect expected resistance and loads. | A low-resistance path may be a short or a valid startup load. | Compare measured current with V divided by expected R.
A DMM shows a negative voltage on a supposed positive rail. | Verify probe polarity and reference point. | Negative sign can be a lead reversal rather than a negative rail. | Reverse leads and remeasure.
A resistor measures differently when the board is powered. | Power off and isolate the resistor if needed. | In-circuit parallel paths and active sources invalidate simple resistance readings. | Repeat in a safe de-energized circuit.
A current reading is implausibly high. | Check that the meter is in the correct mode and connection. | An ammeter connected across a source can short it. | Inspect wiring and meter fuse before retest.
A voltage rail droops when load current increases. | Measure both voltage and current against expected load resistance. | Supply impedance or current limiting may cause droop. | Check at the supply and at the load.`,["ohmI","ohmR"]),
T("power","Electrical Power, Energy & Safe Limits","Foundations","Convert current and voltage into heat, energy and power budgets.",
`Electrical power | Instantaneous DC power is the product of voltage and current. | A regulator and connector must safely handle the load. | Estimate watts from measured volts and amps.
Energy | Energy is power integrated over time. | Battery and thermal budgets depend on operating duration. | Convert watt-seconds into joules.
Joule heating | Resistive loss is current squared times resistance. | Small resistances can dissipate significant heat at high current. | Calculate shunt resistor heating.
Power rating | Components have limits for sustained heat dissipation. | Exceeding ratings can damage flight electronics. | Compare measured load with derated rating.
Current limit | A bench supply can restrict fault current during bring-up. | It reduces risk when a board has unknown faults. | Begin with documented safe limits.`,
`A small resistor becomes very hot. | Estimate I²R loss and compare it with resistor rating. | Resistance and current jointly determine heat. | Inspect package size, airflow and derating.
A board passes functionally but consumes excessive power. | Compare measured operating modes with power budget limits. | Functional correctness does not guarantee mission-safe power. | Log voltage and current per mode.
A new board instantly trips the supply limit. | Leave power off and inspect for shorts and wiring faults. | Raising the limit hides a potential damaging fault. | Measure supply resistance before trying again.
The battery runtime is far shorter than planned. | Compare average load power and usable stored energy. | Peak power is not the same as average energy consumption. | Measure duty cycle across operating modes.
A shunt measurement says 9 A on a tiny sense resistor. | Calculate resistor heating and measurement uncertainty. | Shunts must be rated for I²R and voltage drop. | Check four-wire sensing and thermal effects.`,["powerDC","joule"]),
T("series","Series Circuits & Voltage Dividers","Foundations","Find total resistance, current and voltage drops along a single path.",
`Series path | A series chain carries the same current through each element. | It simplifies current tracing and fault isolation. | Follow a single path from supply to return.
Series resistance | Total resistance equals the sum of individual resistances. | More series resistance reduces current for a fixed source. | Sum R1 and R2 before finding current.
Voltage divider | A resistor divider creates a fraction of the input voltage. | It is used for sensing and bias references. | Calculate the output across the lower resistor.
Kirchhoff voltage law | Signed voltage rises and drops around a closed loop sum to zero. | It catches impossible voltage measurements. | Verify drops add to source voltage.
Divider loading | A connected load changes the lower effective resistance. | An unloaded divider estimate can be wrong on a real board. | Include meter or ADC input impedance.`,
`A resistor divider output reads lower than expected. | Check the load connected to the divider midpoint. | The load forms a parallel path with the lower resistor. | Recalculate the loaded divider ratio.
A series chain has zero current. | Look for an open circuit along the path. | One open element interrupts the entire series current. | Check continuity with power removed.
Individual resistor voltages exceed the source total. | Verify references, polarity and measurement locations. | A consistent loop must obey KVL. | Recalculate drops with the actual current.
A replaced resistor makes every series drop smaller. | Recalculate total resistance and chain current. | Changing one resistor changes current in all series elements. | Measure the same current at both ends.
A high-impedance DMM barely affects a divider but an ADC does. | Compare input resistance to the divider resistance. | Loading matters when impedances are comparable. | Recalculate Rlower in parallel with the input.`,["seriesR","divider"]),
T("parallel","Parallel Circuits & Current Division","Foundations","Predict branch currents and equivalent resistance for shared voltage nodes.",
`Parallel branches | Parallel elements connect across the same two nodes. | Each branch sees the same voltage. | Confirm both branch returns share the intended ground.
Parallel equivalent | Equivalent resistance is smaller than either of two positive resistors. | Adding a branch raises total current for a fixed voltage. | Compute the reciprocal resistance sum.
Branch current | Ohm's law applies independently to each parallel resistor. | A branch fault can be isolated by its current. | Measure or infer each branch current.
Current conservation | Total current equals the sum of branch currents. | A missing return path can explain inconsistencies. | Compare rail input current with branch totals.
Shorted branch | A near-zero branch resistance draws dangerously high current. | It can collapse the common rail. | Power down and isolate suspicious branches.`,
`A new load causes total rail current to rise. | Recalculate individual branch currents. | Parallel loads share voltage but draw additional current. | Compare current before and after connection.
Two parallel resistors measure less than the smallest resistor. | Recognize this as expected for healthy parallel paths. | The equivalent resistance decreases as conductance adds. | Calculate R1R2 divided by R1+R2.
One branch is open but other loads operate. | Trace the failed branch independently. | Parallel operation does not require current in every branch. | Measure voltage across the failed branch.
Current sums do not match the supply meter. | Check for uncounted branches and instrument location. | KCL requires including every path. | Add all documented loads and leakage paths.
A branch fuse repeatedly opens. | Inspect that branch for overload or low resistance. | Other working parallel branches do not rule out a local short. | Isolate and inspect the branch unpowered.`,["parallelR","parallelI"]),
T("kcl-kvl","Kirchhoff Laws, Nodes & Loops","Circuit Analysis","Use conservation laws to solve and debug multi-node circuits.",
`Kirchhoff current law | At a node, total entering current equals total leaving current. | It provides a consistency check for power trees. | Sum currents entering and leaving a regulator output.
Kirchhoff voltage law | Algebraic voltages around a closed loop sum to zero. | It finds missing drops and measurement mistakes. | Trace supply, load and return.
Reference ground | Node voltages need a consistent reference node. | Measuring relative to different returns can mislead. | Identify schematic ground nets.
Node analysis | Write KCL at unknown-voltage nodes. | It scales to branching circuits. | Assign node voltages and conductance equations.
Loop analysis | Write KVL around independent loops. | It clarifies voltage drops and shared components. | Mark a loop direction before assigning signs.`,
`Measured branch currents fail to sum at one node. | Locate all entering and exiting branches. | Unmeasured paths or instrument errors can violate the apparent sum. | Repeat measurements using one sign convention.
A loop calculation produces a negative voltage. | Check polarity and chosen traversal direction. | Negative sign identifies the opposite reference direction. | Verify with a correctly oriented probe.
Two engineers report conflicting rail voltages. | Agree on a single reference ground. | Ground offsets affect node-voltage comparisons. | Measure ground-to-ground difference.
A schematic has several unknown node voltages. | Assign node names and write KCL equations. | KCL systematically relates unknowns. | Check solved voltages against supply limits.
An equation seems to create energy in a passive loop. | Recheck signed source rises and drops. | KVL enforces conservation of potential around a loop. | Compare measured sum with zero within uncertainty.`,["kcl","kvl"]),
T("thevenin","Thevenin, Norton & Circuit Reductions","Circuit Analysis","Replace a network with a tractable source and equivalent resistance.",
`Thevenin equivalent | A linear two-terminal network can be represented by an ideal voltage source and series resistance. | It simplifies load sensitivity questions. | Find open-circuit voltage and source resistance.
Norton equivalent | A linear two-terminal network can be represented by a current source and parallel resistance. | It is useful when branch currents dominate. | Convert a Thevenin source with I_N = V_th/R_th.
Open-circuit voltage | V_th is the terminal voltage with no external load attached. | Loading changes the measured output. | Disconnect the load safely before estimating V_th.
Equivalent resistance | Deactivate independent ideal sources when finding R_th using source replacement rules. | It exposes how the source droops under load. | Short ideal voltage sources and open ideal current sources.
Superposition | In a linear circuit, independent-source contributions sum algebraically. | It separates multiple stimuli without ignoring source interactions. | Solve one source at a time then combine.`,
`A sensor output shifts when an ADC loads it. | Estimate the source Thevenin resistance. | Nonzero source resistance causes load-dependent voltage droop. | Compare open-circuit and loaded voltages.
A linear circuit contains two independent supplies. | Use superposition to isolate contributions. | Each independent source can be evaluated separately in a linear network. | Sum signed results after solving.
Norton and Thevenin solutions disagree. | Recheck I_N = V_th/R_th and terminal polarity. | The equivalent forms must match external behavior. | Test both with the same load.
A source is turned off in resistance calculation. | Replace ideal independent voltage source by a short. | Deactivation rules differ by source type. | Confirm whether any dependent source remains active.
An open-circuit output is correct but load voltage is low. | Calculate the voltage drop across source resistance. | Source impedance interacts with load impedance. | Test voltage as loading changes.`,["thev","norton"]),
T("ac","AC, Frequency, RMS & Impedance","Circuit Analysis","Read sinusoidal waveforms and relate peak, RMS and timing.",
`Frequency | Frequency counts waveform cycles per second. | It determines clock and stimulus timing. | Convert hertz into period.
Period | Period is the time for one complete repetition. | Oscilloscope timebases are calibrated in seconds per division. | Measure two consecutive rising edges.
RMS voltage | RMS is the square root of the mean of the square of a signal; for voltage across a fixed resistor it produces the same average power as an equal DC voltage. | RMS and peak voltage are not interchangeable. | For a sine wave use peak divided by square root of two.
Phase shift | Relative timing between waveforms can be described as angle. | Timing differences matter for mixed signal analysis. | Compare channel edges or sinusoid zero crossings.
Impedance | AC opposition can combine resistance and reactance. | Frequency changes capacitive and inductive behavior. | Check frequency before interpreting an AC load.`,
`A sine wave peak is 10 V and someone claims 10 V RMS. | Apply the sinusoidal peak-to-RMS relation. | Peak and RMS differ by a factor of square root two. | Inspect the instrument's measurement mode.
The scope shows two edges 2 ms apart. | Compute frequency from period. | Frequency is reciprocal of period. | Count complete cycles rather than half periods.
A capacitor appears less resistive at high frequency. | Evaluate capacitive reactance. | X_C falls as frequency rises. | Compare impedance at both frequencies.
A phase difference is reported without frequency. | Ask for period or frequency. | Time difference alone does not determine angular phase. | Calculate degrees from delay divided by period.
An instrument says AC coupling removed a DC offset. | Confirm its coupling mode and cutoff. | AC coupling blocks steady DC content. | Compare AC- and DC-coupled captures.`,["rms","period"]),
T("capacitors","Capacitance, Charge & Stored Energy","Reactive Circuits","Understand why capacitors store charge and stabilize supply rails.",
`Capacitance | Capacitance relates charge to applied voltage. | It predicts stored charge and transient behavior. | Use Q = CV.
Capacitor voltage | An ideal capacitor voltage cannot jump instantaneously with finite current. | Startup transitions require charging current. | Observe the voltage slope during power-up.
Stored energy | Capacitor energy equals one half capacitance times voltage squared. | Energy handling matters for inrush and discharge. | Evaluate stored energy before touching a rail.
Decoupling | Nearby capacitors supply short transient currents. | Long supply paths have unwanted impedance and inductance. | Inspect placement near IC supply pins.
ESR and ESL | Real capacitors have parasitic resistance and inductance. | Impedance depends on frequency and component technology. | Avoid assuming one capacitor is ideal over all frequencies.`,
`A rail dips when a CPU switches modes. | Review decoupling, load step and measurement setup. | Fast changes need nearby charge and low-impedance supply paths. | Correlate droop with current step.
A large capacitor charges slowly at startup. | Evaluate inrush limiting and charge path. | Charging rate depends on source impedance. | Record voltage versus time.
A rail remains charged after power-off. | Follow a safe discharge procedure and verify voltage. | Capacitors can retain hazardous energy. | Measure voltage before physical contact.
A capacitor runs hot during high ripple operation. | Consider ESR loss and ripple-current rating. | AC ripple produces heating in nonideal capacitors. | Compare rated ripple current and frequency.
A bypass capacitor does not suppress high-frequency noise. | Inspect placement and high-frequency impedance. | Lead and trace inductance can dominate. | Move probe ground closer and compare.`,["capQ","capE"]),
T("rc","RC Circuits & Transient Response","Reactive Circuits","Calculate charge/discharge timing and recognize exponential behavior.",
`RC time constant | The product of resistance and capacitance has units of time. | It sets the characteristic charging speed. | Calculate τ = RC.
Charging response | A first-order RC node approaches its final voltage exponentially. | Timing thresholds depend on the RC network. | Observe approximately 63% after one time constant.
Discharging response | An RC node decays exponentially through its discharge resistance. | Reset and hold-up circuits depend on discharge paths. | Look for about 37% remaining after one time constant.
Settling | Multiple time constants are needed to settle close to final value. | A premature measurement can be misleading. | Wait several time constants before steady-state sampling.
Meter loading | A meter input resistance can create an additional discharge path. | High-resistance timing circuits are especially affected. | Include DMM input resistance in parallel.`,
`A reset RC circuit releases too early. | Check R, C tolerance and threshold voltage. | Timing changes with capacitance, resistance and logic thresholds. | Capture reset and supply on the same timebase.
An RC node takes longer than calculated to settle. | Identify leakage and unexpected load paths. | Real circuits do not always follow the unloaded model. | Measure effective R and C.
A slow RC transient appears flat on a short scope sweep. | Extend timebase appropriately. | Instrument window must cover multiple time constants. | Capture startup from before the edge.
A high-value divider changes when the DMM is attached. | Include meter input impedance in the model. | Meter loading alters effective resistance. | Compare results with a higher impedance probe.
A capacitor appears immediately discharged after power-off. | Verify discharge resistor and actual voltage measurement. | Stored charge may disappear quickly if a low-resistance path exists. | Measure at safe intervals.`,["rcTau","rc63"]),
T("inductors","Inductors, RL Circuits & Magnetic Energy","Reactive Circuits","Explain inductive spikes, current continuity and RL timing.",
`Inductance | An inductor opposes changes in current via induced voltage. | Fast current steps across parasitic inductance cause spikes. | Use V = L dI/dt.
RL time constant | Inductance divided by resistance sets first-order current response. | Coil and power-switch transitions are time dependent. | Calculate τ = L/R.
Magnetic energy | Inductor energy equals one half inductance times current squared. | A switched-off coil needs a safe energy path. | Estimate joules held in the magnetic field.
Flyback protection | An inductor can generate high reverse voltage when current is interrupted. | Unprotected switches can be damaged. | Examine diode or clamp across the coil.
Parasitic inductance | Even short wires and connectors have inductance. | Large dI/dt can create substantial rail disturbance. | Shorten probe loops and current paths.`,
`A relay driver transistor fails when the coil turns off. | Inspect flyback diode or clamp implementation. | Stored magnetic energy creates an interruption voltage. | Observe turn-off transient with a rated probe.
A supply rail spikes when current switches rapidly. | Estimate L times di/dt and inspect return loop. | Small parasitic inductance matters at fast edges. | Compare with reduced slew rate.
An RL current takes time to reach steady state. | Estimate L/R before judging a fault. | Inductor current responds exponentially. | Capture several time constants.
A coil becomes hot during sustained current. | Check winding resistance and I²R loss. | Ideal inductors have no DC resistance but physical coils do. | Compare measured current and coil rating.
A scope probe shows impossible overshoot. | Reduce probe loop area before concluding a failure. | Measurement loop inductance can introduce artifacts. | Repeat with short ground spring.`,["rlTau","inductorV"]),
T("filters","RLC Resonance, Filters & AC Response","Reactive Circuits","Compute corner frequencies and interpret frequency-dependent circuits.",
`Low-pass filter | A low-pass circuit attenuates sufficiently high-frequency signals. | Power and sensor filtering depend on passband selection. | Compare signal frequency with cutoff.
High-pass filter | A high-pass circuit attenuates sufficiently low-frequency signals. | AC coupling may suppress DC components. | Inspect coupling cutoff before measuring drift.
Cutoff frequency | First-order RC magnitude is down about 3 dB at cutoff. | It helps explain waveform bandwidth and attenuation. | Calculate 1/(2πRC).
Resonance | Ideal LC energy exchanges between electric and magnetic storage. | Resonances can amplify disturbances. | Estimate the LC natural frequency.
Q and damping | Quality factor describes resonance sharpness and energy loss. | Excessive ringing may indicate underdamping. | Compare damped and underdamped responses.`,
`A low-pass output loses fast edges. | Compare edge spectrum against filter bandwidth. | A low cutoff rounds transitions. | Calculate RC cutoff and inspect the step response.
A board oscillates near a specific frequency. | Look for LC resonance and control-loop interactions. | Energy storage can support ringing. | Sweep stimulus around the suspect frequency.
A high-pass filter removes the required DC level. | Change coupling or filter selection. | High-pass behavior rejects low frequencies. | Repeat in DC-coupled mode.
A filter passes 1 kHz but rejects 100 kHz. | Identify the filter as low-pass or band-limited. | Attenuation rises beyond cutoff for a low pass. | Compare measured gain versus frequency.
An RLC response rings less after resistance increases. | Recognize increased damping. | Resistive loss reduces energy persistence. | Measure settling and overshoot.`,["rcFc","lcF0"]),
T("magnetics","Magnetism, Transformers & Three-Phase","Circuit Analysis","Learn transformer ratios and the basic power equation of balanced three-phase systems.",
`Transformer ratio | Ideal voltage ratio equals the secondary-to-primary turns ratio. | Converters and isolation stages rely on magnetic transfer. | Use V_s/V_p = N_s/N_p.
Isolation | Isolation breaks a direct conductive path between circuits. | It is important for safety and noise control. | Check isolation boundaries in schematics.
Magnetic saturation | A magnetic core can enter saturation when additional magnetizing force produces comparatively little extra flux density, potentially increasing magnetizing current. | Saturation raises magnetizing current and heating. | Inspect current waveform for unexpected steep rises.
Three-phase voltage | Line-to-line and line-to-neutral voltage differ in balanced wye systems. | Confusing them produces power mistakes. | Identify connection type before calculation.
Power factor | Real power depends on phase alignment between voltage and current. | Apparent volt-amperes are not equal to real watts. | Include PF in three-phase power calculations.`,
`A transformer secondary is half the predicted voltage. | Confirm turns ratio, loading and input waveform. | Winding or measurement assumptions may be wrong. | Compare unloaded and loaded outputs safely.
A power converter draws excessive current at startup. | Investigate core saturation and inrush effects. | Flux and magnetizing current are time dependent. | Capture startup with appropriate safety isolation.
Three-phase power appears much larger than measured load power. | Check use of line voltage and power factor. | Apparent power overstates real power when PF is below one. | Compare watts with volt-amperes.
An isolation measurement has unexpected continuity. | Verify schematic intended isolation barrier. | Common grounds can unintentionally defeat isolation. | Perform de-energized continuity check.
A magnetic component runs unusually hot. | Measure winding current and switching frequency. | Copper and core losses both contribute. | Compare thermal rise under controlled load.`,["transformer","threephase"]),
T("components","Diodes, Transistors & Digital Logic","Board Hardware","Build intuition for semiconductor components and digital thresholds.",
`Diode direction | A diode conducts readily in the forward direction when biased appropriately. | Polarity errors can block power or damage components. | Locate the cathode marking before installation.
LED resistor | A series resistor limits LED current. | LEDs are not directly driven from most supplies without current limiting. | Calculate resistor from supply minus forward drop.
MOSFET switch | A MOSFET gate controls the channel's conduction state. | Gate drive, threshold and R_DS(on) influence losses. | Verify gate-to-source voltage under load.
Logic high and low | Digital receivers use voltage thresholds, not ideal abstract zeros and ones. | Marginal levels lead to intermittent communication. | Compare actual waveforms to datasheet VIH and VIL.
Pull-up resistor | A pull-up biases an undriven node high. | Open-drain buses require defined idle states. | Check I2C SDA and SCL idle voltages.`,
`An LED fails after direct connection to a supply. | Check missing or undersized series resistor. | Excess forward current can destroy the diode. | Calculate current with resistor and forward drop.
A MOSFET overheats even though its gate toggles. | Measure gate drive and drain-source voltage under load. | Partial enhancement produces high resistive dissipation. | Compare V_GS and R_DS(on) conditions.
A digital input changes randomly when disconnected. | Confirm required pull-up or pull-down. | Floating nodes have undefined voltage. | Add a documented bias network.
An I2C line never rises to a logic high. | Check pull-up, shorts and devices holding the line low. | Open-drain devices cannot drive a high level directly. | Measure line rise and steady idle voltage.
A reset signal is at 1.2 V and the CPU behaves inconsistently. | Check specified VIH/VIL thresholds at that supply voltage. | A numeric voltage is not enough without threshold specification. | Verify rail and reset pin levels together.`,["ledR","clockPeriod"]),
T("power-rails","Regulators, Power Distribution & Rail Integrity","Board Hardware","Characterize power rails and make correct go/no-go comparisons.",
`Power tree | A power tree shows how input power reaches rails and loads. | Missing upstream dependencies can prevent bring-up. | Follow input connector through regulators to IC pins.
Power sequencing | Some devices require rails and reset in a defined order. | Violated timing can prevent initialization or stress hardware. | Compare measured timing to design requirements.
Rail ripple | AC variation superimposed on nominal DC voltage. | Excessive ripple can reduce operating margin. | Measure with a short-ground low-noise probing setup.
Load transient | Rapid load-current change can cause temporary droop or overshoot. | Dynamic workloads stress power distribution. | Trigger scope on a workload transition.
Current sensing | A small shunt voltage can estimate load current. | It links oscilloscope channels to power estimates. | Divide measured differential voltage by shunt resistance.`,
`A CPU rail dips under workload. | Correlate rail voltage with measured current step. | Source impedance and bandwidth limit transient response. | Capture current sense and rail simultaneously.
A regulator output is missing while upstream input is healthy. | Check enable, feedback, switching and protection state. | A valid input alone does not guarantee active output. | Inspect datasheet startup sequence.
A rail fails specification only with a long probe ground lead. | Repeat with proper power-rail probing. | Loop pickup can exaggerate apparent ripple. | Compare short-ground and long-ground captures.
Two rails power up in the wrong order. | Check sequencer enables and power-good controls. | Dependencies may require one rail to settle before the next. | Compare all rails with the required sequence.
A board reports excessive current only on one firmware image. | Compare operating mode and configuration. | Software can change switching activity and rail load. | Reproduce with identical hardware and both firmware versions.`,["railPower","shunt"]),
T("schematics","Schematics, PCBA Bring-Up & Troubleshooting","Board Hardware","Learn the safe and repeatable procedure for an unfamiliar circuit board.",
`Schematic net | A net name joins electrically connected points in the design. | Test nodes can appear on different sheets. | Follow net labels across schematic pages.
Ground reference | Return paths and ground types must be interpreted carefully. | Poor probing references create misleading measurements. | Identify analog, digital and chassis grounds.
Bring-up checklist | First power-on should follow inspection and staged checks. | Structured sequences protect prototypes. | Inspect, resistance-check, current-limit and verify rails first.
Reset and clock | Many digital devices need valid supply, reset and clock before boot. | Missing one produces a dead-looking board. | Probe all three at the device pins.
Fault isolation | Separate DUT, cable, fixture, firmware and test station hypotheses. | A failed test does not automatically prove defective PCBA. | Substitute a known-good unit or isolate one variable.`,
`An unpowered board measures near-zero resistance between main supply and ground. | Hold power and investigate a possible short. | Immediate energization could damage the board. | Compare with a known-good board and inspect components.
The rail is present but the MCU shows no boot message. | Check reset, clock and boot-mode pins. | Power is necessary but not sufficient for firmware execution. | Observe reset release and oscillator activity.
A test point has voltage but the IC pin does not. | Trace solder joints, vias and net connectivity. | Open PCB interconnect or assembly defects can isolate a pin. | Measure continuity with power removed.
A board fails only in one socket of the fixture. | Examine contact resistance and fixture wiring. | Fixture faults can imitate DUT faults. | Move a known-good board between sockets.
A newly installed PCBA passes power but fails one peripheral. | Check peripheral rail, reset and interface pins. | Localized branch faults can coexist with healthy main rails. | Probe activity at both ends of the interface.`,["seriesR","divider"]),
T("instruments","Oscilloscopes, DMMs, Probes & DAQ","Test Instruments","Acquire reliable electrical data without introducing probe artifacts.",
`Oscilloscope bandwidth | The analog frequency range limits measured signal fidelity. | Insufficient bandwidth can hide edge speed and spikes. | Choose bandwidth appropriate for the target waveform.
Sample rate | Samples per second limit digital time resolution. | Sparse samples may misrepresent short events. | Estimate samples per period before acquisition.
Trigger | Trigger conditions align acquisitions to an event. | Stable triggering makes rare failures diagnosable. | Trigger on supply droop or reset assertion.
Probe loading | A probe adds input resistance and capacitance. | It can distort high-impedance or fast circuits. | Match probe type and minimize ground loop.
DMM versus scope | DMMs are suited to slower scalar readings; scopes capture time-varying behavior. | Choosing the wrong instrument hides transients. | Use a scope for fast startup and a DMM for DC checks.`,
`A 20 ns pulse is missing on a slowly sampled capture. | Increase sample rate and adjust timebase. | Too few samples cannot resolve a short event. | Verify samples across pulse width.
A waveform appears noisy only with a long ground clip. | Use a shorter low-inductance ground connection. | Large probe loops pick up noise and ring. | Repeat with a ground spring.
A scope trace runs off screen before the event occurs. | Configure a correct edge or pulse trigger. | Trigger conditions and pretrigger time determine capture location. | Check channel and trigger level.
A DMM reads 0.9 V DC while the scope shows droop. | Inspect time-domain loading and measurement bandwidth. | An averaged scalar can hide brief disturbances. | Measure minimum voltage under workload.
A 10x probe displays a voltage ten times too small. | Match probe attenuation setting in the instrument. | A configuration mismatch scales readings incorrectly. | Check against a known calibration signal.`,["scopeSamples","timeDiv"]),
T("timing","Clocks, Resets & Digital Timing","Test Instruments","Understand timing diagrams, setup/hold, and signal integrity at board level.",
`Clock period | A periodic digital clock repeats every 1/f seconds. | It controls digital sampling cadence. | Convert MHz to nanoseconds.
Duty cycle | Fraction of a period the waveform stays high. | Some devices require a bounded high and low time. | Measure pulse high time divided by full period.
Setup time | Data must be stable before the relevant sampling edge. | Setup violations can produce incorrect captures. | Inspect data transition relative to clock.
Hold time | Data must remain stable after the sampling edge. | Hold violations are not fixed merely by slowing the clock. | Examine earliest data changes after sampling.
Reset release | Deassert reset only after required power/clock prerequisites. | Early release can create intermittent startup failures. | Align power-good, lock and reset signals on one timebase.`,
`A board intermittently fails to boot at cold start. | Capture supplies, clock lock and reset release together. | Startup margins may change with temperature. | Compare timing with required reset delay.
A clock frequency looks half the expected value. | Measure a full cycle, not a half cycle. | Edge-to-edge selection can double the inferred period. | Check successive rising edges.
A digital receiver misses bits at high speed. | Review sampling timing and signal integrity. | Edge movement and insufficient margin can violate setup/hold. | Measure eye or edge timing at receiver.
A reset pulse is shorter than specification. | Inspect reset generator timing components. | Minimum pulse width is required for reliable initialization. | Compare captured low interval with datasheet limit.
A waveform crosses the threshold multiple times. | Investigate ringing, terminations and noise margins. | Reflections can create false logic transitions. | Probe at receiver and validate termination.`,["clockPeriod","duty"]),
T("buses","UART, SPI, I²C & CAN Interfaces","Embedded Systems","Recognize physical signaling, common faults and data-rate calculations.",
`UART | UART is asynchronous serial communication configured with matching baud and framing. | Console logs and embedded boards commonly use UART. | Verify TX/RX crossover, ground and 8N1 parameters.
SPI | SPI uses an explicit clock plus data lines and device select. | Incorrect clock phase or polarity breaks transfers. | Check SCLK, MOSI, MISO and CS together.
I2C | I2C uses addressed, open-drain-style SDA and SCL lines with pull-ups. | Rise time and stuck-low faults matter. | Inspect idle voltage and acknowledge bits.
CAN | CAN is a differential multi-node bus with arbitration and proper termination. | Termination and common-mode integrity affect communication. | Check nominal termination across the de-energized bus.
Physical versus protocol | Valid software messages require correct voltage, wiring and timing. | Software parsing cannot fix a disconnected wire. | Separate electrical waveform checks from decoded packets.`,
`A UART console prints unreadable characters. | Confirm baud, parity, stop bits and voltage levels. | Mismatched framing corrupts decoding. | Probe bit time and compare with configuration.
An SPI sensor never responds. | Check chip select and clock polarity/phase first. | A valid clock may still be sampled on wrong edges. | Capture CLK, CS, MOSI and MISO simultaneously.
I2C SDA is stuck low. | Inspect pull-ups and identify a device holding the bus. | Shared open-drain wiring permits one device to block traffic. | Isolate devices to locate the holder.
A CAN network develops errors after adding a module. | Verify wiring, grounding and bus termination. | Reflections and incorrect termination disrupt differential signaling. | Measure overall termination with the network unpowered.
UART software times out but a waveform exists on TX. | Check RX pin, level compatibility and common ground. | Activity on one conductor does not prove valid reception. | Probe signal at actual receiver input.`,["uartTime","spiTime"]),
T("python-scpi","Python, SCPI, VISA & Test Automation","Test Software","Design deterministic instrument-driven tests with traceable measurements.",
`SCPI commands | SCPI supplies standardized command syntax for many test instruments. | It supports repeatable remote setup and queries. | Query instrument identity before measuring.
VISA transport | VISA provides instrument access over supported physical transports. | USB, Ethernet and GPIB can share a software API. | Select a unique resource and configure timeouts.
Test assertion | A test compares measured data with explicit acceptance limits. | Unspecified limits create ambiguous pass/fail decisions. | Record result, limits and units.
Retry policy | Retrying cannot silently turn a failure into a pass. | Intermittent errors must remain traceable. | Log every attempt and its raw response.
Exception handling | A safe automation program handles timeouts, disconnects and bad data. | Infrastructure failures must not be misreported as DUT passes. | Fail safely and preserve logs.`,
`A SCPI query works manually but times out in Python. | Check resource address, timeout, terminator and instrument state. | Transport configuration can cause software-only failures. | Run a simple identity query then a controlled measurement.
A script marks NaN as passing a threshold. | Validate measurement is finite before comparing. | Non-finite data must be treated as invalid. | Inject NaN in an offline unit test.
A retry hides the first failing measurement. | Save all attempts with timestamp and DUT serial. | Retesting is not permission to erase evidence. | Audit both original and retry results.
Two instruments occasionally disagree in timestamp. | Use explicit synchronization and trigger plan. | Sequential reads do not guarantee simultaneous captures. | Correlate hardware trigger or acquisition time.
A fixture disconnects mid-test. | Stop execution and record an infrastructure error. | Continuing with stale values risks a false pass. | Reinitialize connection and use a known-good self-test.`,["testThroughput","assertMargin"]),
T("linux","Linux, Logs & Configuration Control","Test Software","Use command-line skills to diagnose boards without losing raw evidence.",
`Serial logs | UART or console logs reveal firmware startup and failures. | First-failure messages can identify faults. | Capture with timestamps and configuration metadata.
grep and filters | Text search selects targeted errors from large logs. | It accelerates root-cause inspection. | Search for errors while retaining surrounding context.
Exit codes | Shell commands communicate success and failure with return status. | Pipelines can hide errors when not checked. | Check exit status and use pipefail when appropriate.
Version control | Record script and firmware revisions with results. | Uncontrolled changes undermine reproducibility. | Attach commit hash and build ID to test records.
Raw versus summary | A processed pass count is not proof raw tests passed. | Reporting defects can produce false-clean dashboards. | Reconcile summary against raw failures and counts.`,
`Summary says PASS but raw logs show failures. | Treat the result as inconclusive and audit reporting logic. | A false-clean report can release bad hardware. | Compare raw logs, counts and script exit status.
A background test process exits without reporting. | Inspect exit code, signal and stderr. | A command can fail without printing an obvious banner. | Check process supervisor and retained logs.
A firmware change makes tests fail. | Compare exact image hashes and test configurations. | Version mismatch can cause behavior differences. | Repeat with controlled A/B versions.
grep misses errors containing different capitalization. | Use case-insensitive matching and review log format. | Fragile parsing can silently omit failures. | Compare counts against raw log set.
A device log cannot be reproduced by another engineer. | Preserve command, environment, versions and board ID. | Reproducibility needs full configuration capture. | Write a one-command replay procedure.`,["logRate","logDuration"]),
T("rf","RF Fundamentals & Test Instruments","RF & Flight Systems","Learn spectrum analyzers, VNAs, decibels and wavelength before hands-on RF testing.",
`Spectrum analyzer | A spectrum analyzer measures signal power versus frequency. | It reveals harmonics, spurs and occupied bandwidth. | Check center frequency, span and reference level.
Vector network analyzer | A VNA characterizes reflection and transmission through S-parameters. | It supports impedance and loss characterization. | Calibrate the measurement plane before S11/S21 tests.
S11 and return loss | S11 is the complex input reflection coefficient of an RF port; return loss in dB equals minus twenty times log10 of the magnitude of S11 (when the port's reference impedance is specified). | Mismatch wastes power and affects RF sensitivity. | Use return loss to compare matching designs.
dB power ratio | Ten times the base-10 logarithm of a power ratio gives dB. | RF gains and losses combine conveniently in dB. | 10x power corresponds to +10 dB.
Wavelength | Free-space wavelength equals propagation speed divided by frequency. | Transmission lines and antenna dimensions depend on it. | Convert GHz into wavelength in meters.`,
`An RF output has a large unexpected harmonic. | Inspect spectrum with appropriate span and front-end attenuation. | A single-frequency amplitude reading can miss spurs. | Compare spectral lines with expected emission limits.
VNA S11 is unexpectedly poor after swapping cables. | Recheck calibration and reference plane. | Cables and adapters affect measured reflection. | Repeat with known calibration standards.
A receiver has low signal only with a longer coax. | Estimate frequency-dependent cable attenuation and connectors. | Insertion loss reduces delivered RF power. | Measure S21 or compare calibrated power.
An RF reading is 10 dB below expectation. | Convert dB difference into a power ratio before interpreting. | 10 dB is a factor of 10 in power. | Verify attenuator and reference settings.
An antenna matching result changes when held near metal. | Consider environmental detuning and measurement setup. | Nearby conductive objects alter impedance. | Retest in a controlled fixture.`,["wavelength","powerDb"]),
T("qualification","Spacecraft Verification, TVAC & Acceptance","RF & Flight Systems","Understand what evidence supports release of flight electronics.",
`Verification | Verification checks whether a design meets specified requirements. | A passing procedure must map to a requirement and limit. | Trace every test result to its applicable requirement.
Validation | Validation checks whether the system meets intended mission needs. | A device can meet a component spec yet fail mission needs. | Test realistic scenarios at system level.
TVAC test | Thermal vacuum exposes hardware to pressure and temperature environments. | Lack of convection and thermal gradients alter behavior. | Compare ambient chamber and vacuum failure modes.
Configuration control | Hardware serial, firmware, scripts and instruments must be recorded. | Mixed revisions make results nonreproducible. | Archive build, calibration and procedure revisions.
Go or no-go | Acceptance needs measured evidence, valid limits and review of anomalies. | An unresolved error should not be silently released. | Document rationale and waiver authority if applicable.`,
`A unit passes ambient thermal testing but fails in TVAC. | Compare failure onset with vacuum and thermal conditions. | Heat transfer and pressure-dependent mechanisms differ. | Correlate chamber pressure, component temperature and telemetry.
A board passes but uses an unapproved firmware revision. | Flag configuration mismatch before release. | A valid test on wrong configuration may not qualify flight build. | Repeat under controlled approved revision if required.
A measurement is barely inside the limit with large uncertainty. | Escalate the boundary result and assess uncertainty. | A raw numeric pass may lack required confidence. | Apply approved guardband and disposition procedure.
A test station loses connection during acceptance. | Mark the run invalid or incomplete. | Missing evidence is not a pass. | Restore test-station health and repeat affected procedure.
A technician proposes ignoring an intermittent failure. | Preserve and investigate failure evidence. | Intermittent behavior is a qualification risk. | Define reproducibility plan and formal disposition.`,["marginPct","yieldPct"])
];
window.AVIONICS_EXPECTED_PER_TOPIC=30;
})();
