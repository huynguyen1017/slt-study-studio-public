"use strict";
/* Original beginner-first teaching notes and 115 skill deep-dives (23 topics x 5 skills).
   Equations use clean engineering-notation strings rendered to stacked MathML by studyMath. */
(function(){
const P=(lead,analogy,example,terms)=>({lead,analogy,example,terms});
window.AVIONICS_BEGINNER_LESSONS={
units:P("The SI system has seven base units, including the ampere for electric current. Voltage uses the derived unit volt. Prefixes such as milli and micro only scale units.","Base units are fundamental measuring blocks; derived units combine them. A prefix changes the size of an existing unit, without creating a new base unit.","A meter reading of 25 mA equals 25 × 10⁻³ A (0.025 A). The ampere is a base unit; the volt is a derived unit.",[["SI base unit","One of seven fundamental SI units."],["ampere (A)","SI base unit for electric current."],["volt (V)","SI derived unit for electric potential difference."],["milli (m)","10⁻³ (one thousandth): 1 mA = 1 × 10⁻³ A."],["micro (µ)","10⁻⁶ (one millionth): 1 µF = 1 × 10⁻⁶ F."],["mega (M)","10⁶ (one million): 1 MΩ = 1 × 10⁶ Ω."]]),
ohm:P("Voltage, current and resistance are three different things. Learn which one you are measuring before memorizing any equation.","Imagine a water system: pressure difference resembles voltage, flow rate resembles current, and a narrow pipe resembles resistance.","A 5 V rail means the supply node is 5 volts above circuit ground (0 V). Across a 1 kΩ load, current is 5 × 10⁻³ A (5 mA).",[["voltage (V)","Difference in electric potential energy per charge between TWO points."],["current (I)","Rate at which electric charge passes a point, in amperes (A)."],["resistance (R)","How strongly an element opposes current, in ohms (Ω)."],["node","A connected conductor point sharing one electrical potential."],["ground / return","The 0 V reference node for measuring node voltages."]]),
power:P("Voltage and current together tell you how fast electrical energy turns into useful work or heat.","A small heater and a large heater may use the same voltage, but the large one draws more current and radiates more heat per second.","A 1.0 V rail supplying 2.0 A delivers P = 1.0 × 2.0 = 2.0 W of electrical power.",[["power (W)","Rate of energy transfer in watts (1 W = 1 J/s)."],["energy (J)","Total work or heat over time, in joules (E = P × t)."],["rating","Safe power limit before a resistor or regulator overheats."],["current limit","Bench power supply clamp that caps fault current during bring-up."]]),
series:P("In a series circuit there is only ONE path from positive to ground. Every component in that chain carries the exact same current.","Imagine people walking down a single narrow hallway with two doors: everyone who enters must walk through both doors at the same flow rate.","A 5 V source across two equal 1 kΩ resistors in series drops 2.5 V across each resistor with 2.5 mA flowing through both.",[["series","Components connected end-to-end along one unbranched path."],["voltage drop","Potential lost across each resistor as current passes through it."],["voltage divider","Two series resistors used to create a scaled output fraction."]]),
parallel:P("A parallel circuit gives current two or more separate branches between the SAME two nodes. Every branch sees the full rail voltage.","Think of two hallways connecting the same entry hall (Node A) and exit hall (Node B). Each hallway has the same start-to-end pressure, while flow splits between them.","Two 1 kΩ resistors in parallel across 5 V each draw 5 mA, so the supply delivers 10 mA total and equivalent resistance drops to 500 Ω.",[["branch","One individual current path between the shared supply and return nodes."],["equivalent resistance","Combined parallel resistance, always smaller than the smallest branch."],["KCL","Sum of branch currents leaving the supply equals total supply current."]]),
"kcl-kvl":P("Kirchhoff's laws are strict accounting rules: charge never vanishes at a junction (KCL), and voltage rises equal voltage drops around every closed loop (KVL).","Like a financial ledger: money entering a checking account equals money leaving it (KCL), and climbing up and back down a mountain returns you to zero elevation change (KVL).","If 10 mA enters a junction and 3 mA and 2 mA leave through two branches, the third branch must carry 5 mA.",[["node","Junction where two or more wires/components meet."],["loop","Any closed circuit path starting and ending at the same node."],["KCL","Total current entering a node equals total current leaving."],["KVL","Algebraic sum of voltages around any closed loop equals zero."]]),
thevenin:P("Any complex linear network feeding two output terminals behaves to a load like ONE ideal voltage source V_th in series with ONE resistance R_th.","An entire city water system behind a wall faucet looks to your hose like one open-circuit pressure and one internal pipe resistance.","An unloaded sensor outputs 5.0 V (V_th), but drops to 4.5 V when a load draws current through its 100 Ω internal resistance (R_th).",[["Thevenin voltage (V_th)","Open-circuit voltage measured at the output with no load attached."],["Thevenin resistance (R_th)","Equivalent output resistance seen looking back into the terminals."],["Norton current (I_N)","Short-circuit current I_N = V_th / R_th in parallel with R_th."]]),
ac:P("AC signals reverse direction periodically. Frequency counts cycles per second, period measures one cycle's duration, and RMS gives equivalent DC heating power.","Think of a pendulum swinging back and forth: frequency is swings per second (Hz), period is time for one full swing (T = 1/f).","A 100 Hz sine wave has period T = 10 × 10⁻³ s (10 ms), and a 10 V peak sine wave has V_rms = 7.07 V.",[["frequency (f)","Complete cycles per second in hertz (Hz)."],["period (T)","Time for one full cycle in seconds (T = 1/f)."],["RMS","Root-mean-square voltage delivering equal resistive heating to DC."],["phase (θ)","Timing shift between two periodic waveforms expressed in degrees or radians."]]),
capacitors:P("A capacitor stores energy in an electric field between two conductive plates. Voltage across it cannot jump instantaneously because charge takes time to move.","Think of a tiny local water tank right next to a processor: when the processor suddenly demands current, the local tank supplies it immediately.","A 10 µF capacitor charged to 5 V stores Q = 50 µC of charge and E = 125 µJ of energy.",[["capacitance (C)","Charge stored per volt, measured in farads (1 F = 1 C/V)."],["decoupling","Placing local capacitors right beside IC power pins to absorb fast spikes."],["ESR / ESL","Real parasitic series resistance and inductance inside a physical capacitor."]]),
rc:P("When a resistor feeds a capacitor, voltage changes smoothly along an exponential curve governed by the time constant τ = R × C.","Filling a bucket through a narrow hose slows down as the bucket fills: after 1 time constant τ, you reach 63.2% of the final level.","With R = 10 kΩ and C = 2.2 µF, τ = (10 × 10³)(2.2 × 10⁻⁶) = 22 × 10⁻³ s (22 ms).",[["time constant (τ)","Product R × C in seconds; sets charging/discharging speed."],["charging step","Reaches 63.2% of final change in 1τ, and >99% in 5τ."],["meter loading","A 10 MΩ DMM connected across a MΩ circuit lowers effective R and speeds decay."]]),
inductors:P("An inductor stores energy in a magnetic field around coiled wire and fights sudden changes in current with an opposing voltage V = L · (dI/dt).","Like a heavy flywheel: you cannot stop or spin up inductor current instantaneously without generating huge forces (voltage spikes).","Interrupting 2 A in 1 ms through a 10 mH coil induces V_L = 20 V unless a flyback diode provides a safe current path.",[["inductance (L)","Opposes current change; measured in henries (H)."],["RL time constant","Ratio τ = L / R in seconds governing current buildup."],["flyback diode","Clamp diode across a coil giving inductive current a safe circulating loop."]]),
filters:P("Filters pass desired frequency bands and attenuate unwanted noise using frequency-dependent capacitive (X_C) and inductive (X_L) reactances.","Think of a kitchen sieve or sunglasses: they block specific ranges while letting the rest pass cleanly.","An RC low-pass with R = 1 kΩ and C = 0.1 µF attenuates frequencies above f_c ≈ 1.59 kHz by 20 dB/decade.",[["low-pass","Passes DC and low frequencies; rolls off high-frequency noise."],["high-pass","Blocks DC offset; passes fast transitions and AC signals."],["cutoff frequency (f_c)","Frequency where output power drops to half (−3 dB, 0.707 of passband voltage)."]]),
magnetics:P("Transformers use a shared changing magnetic flux to step AC voltage up or down and provide galvanic safety isolation without a direct copper wire connection.","Two coils wound on the same iron or ferrite core act like magnetic gears: more secondary turns multiply voltage and divide current proportionally.","An ideal transformer with 100 primary turns, 50 secondary turns, and 24 V primary delivers 12 V across the secondary.",[["turns ratio","Ratio N_s / N_p setting secondary-to-primary voltage scaling."],["galvanic isolation","No DC copper path between primary and secondary ground planes."],["power factor (PF)","Cosine of phase angle between voltage and current; converts VA into real watts."]]),
components:P("Semiconductors and pull-up networks steer current, amplify or switch loads, and turn analog voltages into clean digital 0s and 1s.","A diode acts as a one-way check valve for current; a MOSFET acts as an electrically controlled power switch; a pull-up resistor holds an idle wire at logic HIGH.","Driving an LED with V_f = 2 V from 5 V at 10 mA requires R = (5 − 2)/(10 × 10⁻³) = 300 Ω.",[["diode","One-way semiconductor valve with forward voltage drop V_f (≈0.7 V Si, ≈2 V LED)."],["MOSFET","Voltage-controlled transistor switch with ultra-low channel R_DS(on)."],["pull-up resistor","Connects an open-drain line to V_CC so idle state is a clean HIGH."]]),
"power-rails":P("A flight PCBA power tree steps high bus voltage down into clean, sequenced point-of-load rails (e.g., 5 V, 3.3 V, 1.8 V, 1.0 V core) while keeping ripple and load droop inside spec.","Like a city water grid with main trunks, pressure regulators, and surge tanks ensuring every subsystem powers up in order without dipping during peak demand.","Using a Keysight 1169B across a 5 mΩ shunt measuring 55 mV gives I = 11 A; multiplying by a 0.88 V rail gives P = 9.68 W.",[["power tree","Block hierarchy from bus input through regulators to each IC rail."],["sequencing","Required chronological turn-on order (e.g., 3.3 V I/O before 1.0 V core)."],["droop & ripple","Transient dip during load step (V_droop) and periodic switching AC ripple."],["shunt sensing","Measuring differential voltage ΔV across known mΩ resistor: I = ΔV / R_shunt."]]),
schematics:P("A schematic is the electrical wiring blueprint of a PCBA. Disciplined bring-up checks resistance to ground with power OFF before ever applying a current-limited supply.","Never turn on an unfamiliar board like flipping a light switch: first inspect under a microscope, ohm-out every rail for shorts, then power up with a tight current limit.","Before energizing a Muon flight computer PCBA, measure every rail to GND with a DMM and set bench supply OVP and current limit slightly above expected idle draw.",[["net","Named electrical connection shared across schematic pages and pins."],["PCBA bring-up","Staged power-off shorts check → current-limited power-on → clocks → boot logs."],["KGB / KGS","Known-Good Board vs Known-Good Setup A-B-A swap to separate DUT vs rack faults."]]),
instruments:P("Choose the right instrument for the physics: DMMs measure slow, high-accuracy DC scalars; oscilloscopes capture fast transients, clocks, and protocol waveforms over time.","A DMM is a still camera giving an average number; an oscilloscope is a high-speed video camera catching nanosecond dips and ringing.","A DMM reads 0.90 V DC average while a 4-channel oscilloscope with N7020A power-rail probes catches a 120 mV microsecond droop during a CPU burst.",[["bandwidth","Analog −3 dB frequency limit of scope/probe (pick ≥ 5× signal knee frequency)."],["sample rate","ADC captures per second (MS/s or GS/s); determines time resolution between points."],["probe ground loop","Long alligator ground clips add ≈145 nH inductance causing fake ringing; use short ground springs."]]),
timing:P("Digital flip-flops only capture clean data when clock edges are monotonic, data settles before setup time t_su, stays steady past hold time t_h, and reset releases only after power and clocks lock.","Like catching a train: passengers must board before the doors close (setup time) and stay put until the doors finish latching (hold time).","A 50 MHz clock has period T = 1 / (50 × 10⁶) = 20 ns; hold violations happen on the SAME clock edge so slowing f_clk cannot fix them.",[["period & duty cycle","Cycle time T = 1/f and percentage of T spent HIGH."],["setup time (t_su)","Minimum time data must be valid BEFORE the active clock edge."],["hold time (t_h)","Minimum time data must remain valid AFTER the active clock edge."],["reset release","Active-low SYS_RESET_N held < 0.4 V until power-good and PLL lock settle."]]),
buses:P("Embedded buses (UART, SPI, I²C, CAN) fail at the physical wire layer just as often as in firmware—always check voltage levels, pull-ups, termination, and crossover wiring on a scope first.","Think of a phone call: before blaming the language (protocol), make sure the microphone and speaker wires aren't swapped (TX/RX) and the line has power.","Sending 100 bytes over 115200 baud 8N1 UART (10 bits/byte) takes at least t = (100 × 10) / 115200 = 8.68 ms.",[["UART","Asynchronous TX→RX, RX→TX serial; framed as 1 start + 8 data + 1 stop = 10 bits."],["SPI","Synchronous 4-wire (SCLK, MOSI, MISO, CS_N); watch CPOL/CPHA edge polarity."],["I²C","2-wire open-drain SDA/SCL requiring external pull-up resistors to V_CC."],["CAN","Differential CAN_H/CAN_L bus requiring 120 Ω termination at both bus ends."]]),
"python-scpi":P("Automated avionics test racks use Python (PyVISA + pytest) sending ASCII SCPI commands over Ethernet, USB, or GPIB to set limits, measure hardware, and never mask a failure.","An automated script is a tireless lab assistant: it runs the exact same SCPI sequence on every flight board and refuses to print PASS if any sample is NaN or out-of-spec.","Query `*IDN?`, set voltage/current limits, poll `MEAS:VOLT:DC?`, check `v_min <= v <= v_max`, and log every retry with timestamp and DUT serial.",[["SCPI","Standard Commands for Programmable Instruments (e.g., MEAS:VOLT:DC?)."],["PyVISA","Python library speaking SCPI over TCP/IP (LXI), USB-TMC, or GPIB."],["failure latching","Guaranteeing raw errors always fail the test run and never get overwritten by summary scripts."]]),
linux:P("Linux CLI tools (`lsusb`, `dmesg`, `/dev/serial/by-id/`, `grep`, `sha256sum`) verify that the test host actually sees the DUT and preserve raw evidence before trusting any dashboard.","Never trust a clean scoreboard without checking the play-by-play log: a precedence bug in a parser can report '0 errors' even when the hardware crashed mid-run.","Verify persistent adapters with `ls -l /dev/serial/by-id/`, check `sha256sum` on bootloader binaries, and `grep -iE 'fail|error|assert'` across raw UART logs.",[["/dev/serial/by-id/","Persistent Linux symlink preventing /dev/ttyUSB0 renumbering bugs."],["exit code ($?)","0 means success; non-zero means failure—enable `set -o pipefail` in Bash scripts."],["raw vs summary","Always audit raw console/UART logs when an automated summary looks unexpectedly clean."]]),
rf:P("RF testing characterizes high-frequency signals in the frequency domain (Spectrum Analyzer), impedance/loss via S-parameters (VNA), logarithmic decibels (dB), and wavelength λ = c/f.","A spectrum analyzer acts like a prism splitting a complex RF signal into individual frequency spikes so you can see spurs and harmonics clearly.","A 2.4 GHz Wi-Fi/BLE carrier in free space has λ = (3 × 10⁸) / (2.4 × 10⁹) = 0.125 m (12.5 cm), and a 10× power gain equals +10 dB.",[["spectrum analyzer","Measures RF power (dBm) versus frequency to expose harmonics and spurs."],["VNA (S11 / S21)","Measures reflection return loss (S11) and transmission insertion loss (S21) after SOLT calibration."],["decibel (dB)","Logarithmic power ratio G_dB = 10·log₁₀(P_out / P_in); +3 dB ≈ 2× power, +10 dB = 10× power."]]),
qualification:P("Space qualification proves flight hardware works in launch vibration and orbital vacuum (TVAC), where removing air eliminates convection cooling and triggers new thermal/outgassing failures.","Testing a satellite on a room-temperature bench proves the circuit works at sea level; TVAC proves it survives without air cooling in extreme orbital hot and cold cycles.","If a unit passes in an ambient thermal chamber at +85 °C but fails in TVAC, lack of convective air cooling likely drove local component temperatures higher or caused vacuum outgassing/corona.",[["verification vs validation","Verification: built right to spec; Validation: works for the real orbital mission."],["TVAC","Thermal Vacuum chamber cycling hardware at high vacuum where radiation/conduction replace air convection."],["go/no-go","Formal engineering release decision backed by calibrated data, traceability, and configuration control."]])
};

const rawDeep={
/* Topic 1: units */
"units:SI base unit":{
 plain:"The International System (SI) defines seven exact base units—including the ampere (A) for electric current—and builds derived units like the volt (V) and ohm (Ω) from them.",
 analogy:"Meters and seconds are base cooking ingredients; 'meters per second' is a recipe made from those base ingredients. Likewise, ampere is a base unit while volt = joule / coulomb is derived.",
 why:"In test logs and PyVISA scripts, mixing base units and derived units without labels makes voltage, current, and power thresholds ambiguous and dangerous.",
 example:"1 volt = 1 joule of energy per 1 coulomb of charge (1 V = 1 J/C), while 1 ampere = 1 coulomb passing per second (1 A = 1 C/s).",
 formula:"1 V = 1 J / 1 C",
 sub:"I = 1 C / 1 s = 1 A",
 words:[["Ampere (A)","SI base unit of electric current."],["Volt (V)","SI derived unit of electric potential difference."],["Coulomb (C)","Unit of electric charge (1 C = 1 A·s)."]],
 recap:"Ampere is an SI base unit for current; volt is an SI derived unit for potential difference."
},
"units:Milli prefix":{
 plain:"The prefix 'milli' (symbol m) means one thousandth, or 10⁻³ (0.001). Every 1,000 milliamps equals 1 ampere.",
 analogy:"Just as 1,000 millimeters equal 1 meter, 1,000 mA equal 1 A and 1,000 mV equal 1 V.",
 why:"Avionics current draws and shunt drops are almost always read in mA or mV on a DMM, whereas formulas like P = V × I expect base amperes and volts.",
 example:"Convert 25 mA into amperes: 25 × 10⁻³ A = 0.025 A. Convert 8 mA: 8 × 10⁻³ A = 0.008 A.",
 formula:"X_base = X_milli * 10^(-3)",
 sub:"25 mA = 25 * 10^(-3) = 0.025",
 words:[["Milli (m)","Multiplier 10⁻³ = 0.001."],["Conversion","Multiply milli-values by 10⁻³ (divide by 1000) to get base units."]],
 recap:"Milli always means 10⁻³: move the decimal 3 places left to convert to the base unit."
},
"units:Micro prefix":{
 plain:"The prefix 'micro' (symbol µ) means one millionth, or 10⁻⁶ (0.000001). One million microfarads equal 1 farad.",
 analogy:"One microsecond (µs) is to one second what one penny is to ten thousand dollars—one part in a million.",
 why:"Decoupling capacitors on flight PCBAs are nearly always labeled in µF (microfarads) and oscilloscope pulse widths in µs; forgetting 10⁻⁶ throws τ = R·C off by a factor of a million.",
 example:"Convert 4.7 µF into farads: 4.7 × 10⁻⁶ F = 0.0000047 F.",
 formula:"X_base = X_micro * 10^(-6)",
 sub:"4.7 uF = 4.7 * 10^(-6)",
 words:[["Micro (µ)","Multiplier 10⁻⁶ = 0.000001."],["Farad (F)","Base unit of capacitance; most board caps are µF or nF."]],
 recap:"Micro always means 10⁻⁶: move the decimal 6 places left to convert to base units."
},
"units:Mega prefix":{
 plain:"The prefix 'mega' (symbol M) means one million times the base unit, or 10⁶ (1,000,000).",
 analogy:"Notice capitalization matters: lowercase 'm' is milli (10⁻³), while uppercase 'M' is mega (10⁶)—a difference of a billion times!",
 why:"Pull-up/bleeder resistors and insulation checks use MΩ, while processor clocks and RF signals use MHz. Mixing up mΩ (milliohm shunt) and MΩ (megohm) ruins every calculation.",
 example:"A 4.7 MΩ resistor from Floyd & Buchla Figure 3-9 equals 4.7 × 10⁶ Ω = 4,700,000 Ω.",
 formula:"X_base = X_mega * 10^6",
 sub:"4.7 MOhm = 4.7 * 10^6",
 words:[["Mega (M)","Multiplier 10⁶ = 1,000,000."],["Case sensitivity","m = 10⁻³ (milli) vs M = 10⁶ (mega)."]],
 recap:"Mega (uppercase M) means multiply by 10⁶."
},
"units:Measurement uncertainty":{
 plain:"Every physical instrument has finite accuracy, resolution, and noise. A measurement is an interval (reading ± uncertainty), never an infinitely exact number.",
 analogy:"A bathroom scale reading 150 lb ± 1 lb cannot tell whether someone is 150.2 lb or 149.8 lb. You need a tighter guardband near a limit.",
 why:"In Muon Space acceptance testing, declaring a flight board PASS when a rail reads 3.449 V against a 3.450 V limit ignores ±5 mV DMM accuracy and risks shipping a bad unit.",
 example:"If a spec limit is 5.00 V ± 0.10 V (max 5.10 V) and your DMM uncertainty is ±0.02 V, enforce a test guardband at 5.08 V.",
 formula:"Margin_safe = Limit_max - (Measured + Uncertainty)",
 sub:"Margin_safe = 5.10 - (5.05 + 0.02) = 0.03",
 words:[["Accuracy","How close an instrument reading is to the true physical value."],["Guardband","Tightening test limits by instrument uncertainty so false passes cannot occur."]],
 recap:"Never approve borderline flight hardware without accounting for instrument uncertainty."
},

/* Topic 2: ohm (keep Voltage, Current, Resistance, Ohm's law, Polarity compatible) */
"ohm:Voltage":{
 plain:"Voltage tells you how different TWO electrical points are. It is not an amount stored at a single wire. A meter reports the difference between its red and black probes.",
 analogy:"Imagine a ball at the top of a hill and another at the bottom. Their difference in height gives an energy difference. Voltage similarly describes energy difference per unit electric charge.",
 why:"A board's '5 V rail' is 5 V only relative to a specified return (normally the ground reference). A probe touching one node without a reference has no complete voltage measurement.",
 example:"Place the black DMM probe at circuit ground (0 V) and red probe at a correctly operating +5 V test point. The DMM reads approximately +5 V. Swap probes and it reads approximately −5 V.",
 formula:"Delta_V = Delta_U / q",
 sub:"V = 5.0 / 1.0 = 5.0",
 words:[["Voltage","Difference in electric potential energy per charge."],["Node","One electrically connected point or network."],["Reference / ground","The point we call 0 V for comparison."],["DMM","Digital multimeter used for reading voltage."],["ΔU","Difference in electrical potential energy, measured in joules."],["q","Electric charge, measured in coulombs."]],
 recap:"Voltage is a comparison between two points. A 5 V measurement always needs its reference."
},
"ohm:Current":{
 plain:"Current means how fast electric charge moves past a point in a closed loop. It is measured in amperes (A).",
 analogy:"Voltage resembles water pressure between two tanks; current resembles the gallons per second flowing through the connecting pipe.",
 why:"Excess current during bring-up is the fastest early warning of a solder short or backwards IC. Always set a bench current limit before powering a board.",
 example:"If 25 V pushes current through a 4.7 MΩ resistor (Floyd & Buchla Fig. 3-9), current is I = 25 / (4.7 × 10⁶) = 5.32 × 10⁻⁶ A (5.32 µA).",
 formula:"I = Q / t",
 sub:"I = 25 / (4.7 * 10^6) = 5.32e-6",
 words:[["Charge (Q)","Electrical quantity measured in coulombs."],["Time (t)","Elapsed time in seconds."],["Ampere (A)","1 coulomb passing a cross-section per second."]],
 recap:"Voltage pushes across two points; current flows through a closed loop."
},
"ohm:Resistance":{
 plain:"Resistance tells you how strongly an ohmic component opposes the flow of current. It is measured in ohms (Ω).",
 analogy:"A narrower pipe restricts water flow more strongly. Increasing resistance at a constant voltage shrinks the current proportionally.",
 why:"Resistors set bias currents and protect pins. Measure resistance with power OFF—measuring resistance on a live powered circuit gives garbage readings and can blow the DMM fuse.",
 example:"With 3.3 V across a 330 Ω resistor, resistance limits current to 3.3 / 330 = 10 × 10⁻³ A (10 mA).",
 formula:"R = V / I",
 sub:"R = 3.3 / (10 * 10^(-3)) = 330",
 words:[["Ohm (Ω)","Unit of electrical resistance (1 Ω = 1 V/A)."],["De-energized check","Measuring R only with power OFF so external currents don't corrupt the meter."]],
 recap:"More resistance means less current for the same voltage; always measure R unpowered."
},
"ohm:Ohm's law":{
 plain:"Ohm's law links voltage (V), current (I), and resistance (R) for a single resistive element: V = I × R, I = V / R, and R = V / I.",
 analogy:"Double the water pressure (V) through the same nozzle (R) and flow (I) doubles. Double the nozzle restriction (R) at the same pressure (V) and flow (I) halves.",
 why:"Every PCBA bring-up uses Ohm's law to predict expected supply current before power-on and calculate current from a shunt voltage drop.",
 example:"A 330 Ω resistor with 3.3 V across it carries I = 3.3 / 330 = 0.01 A = 10 × 10⁻³ A (10 mA).",
 formula:"I = V / R",
 sub:"I = 3.3 / 330 = 10e-3",
 words:[["V","Voltage across that specific resistor in volts (V)."],["I","Current flowing through that same resistor in amperes (A)."],["R","Resistance in ohms (Ω)."]],
 recap:"Always use base SI units (V, A, Ω) in V = I × R, then convert to mA or kΩ at the end."
},
"ohm:Polarity":{
 plain:"Polarity tells you which probe is positive (+) and which is negative (−) when measuring a potential difference.",
 analogy:"Walking from ground floor (0 m) to roof (+10 m) is +10 m; measuring from roof to ground floor is −10 m.",
 why:"Swapped DMM red/black leads make a healthy +3.3 V rail look like −3.3 V. Always clip black COM to board GND first.",
 example:"Red probe on +5 V rail and black COM on GND reads +5.00 V; reversing the leads reads −5.00 V.",
 formula:"V_AB = V_A - V_B",
 sub:"V_BA = 0 - 5.0 = -5.0",
 words:[["Red lead (V+)","Positive terminal measured relative to COM."],["Black lead (COM)","0 V reference point subtracted by the meter."]],
 recap:"A negative voltage reading may simply mean your red and black probes are swapped."
},

/* Topic 3: power */
"power:Electrical power":{
 plain:"Electrical power (watts, W) is how fast electrical energy is delivered or turned into heat: voltage multiplied by current.",
 analogy:"Voltage is like water pressure and current is flow rate; power is the total mechanical horsepower turning a waterwheel every second.",
 why:"Connectors, traces, and regulators overheat when P = V × I exceeds their thermal budget—even if voltage alone looks fine.",
 example:"A 3.3 V avionics rail supplying 0.8 A delivers P = 3.3 × 0.8 = 2.64 W.",
 formula:"P = V * I",
 sub:"P = 3.3 * 0.8 = 2.64",
 words:[["Watt (W)","1 joule per second (1 W = 1 V × 1 A)."],["Power budget","Total watts allocated to each spacecraft subsystem."]],
 recap:"Power equals volts times amps (P = V × I)."
},
"power:Energy":{
 plain:"Energy (joules, J) is total electrical work done over a span of time: power multiplied by seconds.",
 analogy:"Power (watts) is how fast your car burns fuel right now (miles per hour); energy (joules) is the total fuel burned over the whole trip (miles).",
 why:"Satellite battery sizing depends on energy (Wh or J) consumed across an entire eclipse orbit, not just peak watts.",
 example:"A 6 W payload operating for 8 seconds consumes E = 6 × 8 = 48 J.",
 formula:"E = P * t",
 sub:"E = 6 * 8 = 48",
 words:[["Joule (J)","1 watt-second of energy."],["Watt-hour (Wh)","1 Wh = 3,600 J, common for spacecraft batteries."]],
 recap:"Energy equals power multiplied by time (E = P × t)."
},
"power:Joule heating":{
 plain:"Any current flowing through a nonzero resistance produces heat equal to I² × R watts.",
 analogy:"Rubbing your hands twice as fast generates four times as much friction heat—doubling current quadruples resistor heating!",
 why:"Even a tiny 5 mΩ sense resistor carrying 10 A dissipates P = 10² × (5 × 10⁻³) = 0.5 W and can desolder itself if undersized.",
 example:"A 100 Ω resistor carrying 50 mA (50 × 10⁻³ A) heats at P = (0.05)² × 100 = 0.25 W.",
 formula:"P = I^2 * R",
 sub:"P = (50e-3)^2 * 100 = 0.25",
 words:[["Joule loss","Electrical energy converted into heat inside resistance."],["Square law","Doubling current produces 4× the heat."]],
 recap:"Resistive heating grows with the square of current: P = I²R."
},
"power:Power rating":{
 plain:"A component's power rating is the maximum heat (in watts) it can safely shed without burning up or drifting out of spec.",
 analogy:"A 1/4 W (0.25 W) resistor is like a small cup: pour 1 W of heat into it and it overflows and chars.",
 why:"In vacuum (space / TVAC) there is NO air convection to cool parts, so avionics engineers derate resistors to ≤50% of datasheet wattage.",
 example:"If a resistor dissipates 0.18 W in circuit, a 0.25 W part has insufficient spacecraft derating—step up to a 0.5 W package.",
 formula:"P_actual <= 0.5 * P_rated",
 sub:"0.18 <= 0.5 * 0.50",
 words:[["Derating","Operating parts well below max datasheet voltage/power for flight reliability."],["0.25 W / 0.5 W","Common resistor power package ratings."]],
 recap:"Keep steady power dissipation well below half the resistor's rated wattage for flight hardware."
},
"power:Current limit":{
 plain:"A bench power supply's current limit caps maximum output amperes; if a board tries to pull more, the supply drops voltage instead of blowing traces.",
 analogy:"A pressure-relief valve on a boiler that prevents pipes from bursting if something clogs downstream.",
 why:"Setting a tight current limit (e.g., 1.2× expected idle draw) before powering a new Muon PCBA saves $10,000 flight silicon if a tiny solder bridge exists.",
 example:"Expected idle draw at 5 V is 200 mA -> set bench current limit to 250 mA before turning output ON.",
 formula:"I_limit = 1.25 * I_expected",
 sub:"I_limit = 1.25 * 200e-3 = 250e-3",
 words:[["CC mode","Constant Current mode—supply drops voltage when load hits I_limit."],["CV mode","Normal Constant Voltage operation below current limit."]],
 recap:"Always set a conservative bench current limit before energizing new hardware."
},

/* Topic 4: series */
"series:Series path":{
 plain:"Components in series connect end-to-end along a single loop so there is only one path for current.",
 analogy:"Cars in a single-lane tunnel with no exits: every car passing the entrance must pass the middle and the exit at the exact same rate.",
 why:"If any single resistor, fuse, or trace opens in a series path, current everywhere in that string immediately drops to zero.",
 example:"A +5 V supply → R₁ (1 kΩ) → R₂ (1 kΩ) → GND forms one series loop carrying I = 5 / 2000 = 2.5 mA everywhere.",
 formula:"I_T = I_1 = I_2",
 sub:"I = 5 / (1000 + 1000) = 2.5e-3",
 words:[["Series chain","Single unbranched current route."],["Open fault","Broken wire or blown part stopping all series current."]],
 recap:"In a series circuit, current is identical through every component."
},
"series:Series resistance":{
 plain:"Total resistance of resistors in series is simply the sum of each individual resistance.",
 analogy:"Adding a second narrow hose after the first narrow hose makes total water restriction equal to the sum of both restrictions.",
 why:"Every wire, connector contact, and PCB trace adds series resistance that drops voltage away from your load.",
 example:"Three series resistors of 100 Ω, 150 Ω, and 50 Ω combine to R_T = 100 + 150 + 50 = 300 Ω.",
 formula:"R_T = R_1 + R_2 + R_3",
 sub:"R_T = 100 + 150 + 50 = 300",
 words:[["R_T","Total equivalent resistance seen by the source."],["Contact resistance","Extra series resistance from a worn test-rack pogo pin or connector."]],
 recap:"Series resistances simply add together: R_T = R₁ + R₂ + …"
},
"series:Voltage divider":{
 plain:"Two resistors in series divide the input voltage in proportion to the bottom resistor divided by the total resistance.",
 analogy:"Two hills stepping down from 100 m to sea level: if the lower step is half the total resistance, its top sits halfway up at 50 m.",
 why:"Voltage dividers generate reference levels for ADC monitoring of 28 V satellite bus rails down to a 3.3 V microcontroller pin.",
 example:"With V_in = 5 V, R₁ = 2.2 kΩ top, R₂ = 1.0 kΩ bottom: V_out = 5 × 1000 / 3200 = 1.5625 V.",
 formula:"V_out = V_in * R_2 / (R_1 + R_2)",
 sub:"V_out = 5 * 1000 / (2200 + 1000) = 1.5625",
 words:[["R₁ (top)","Upper resistor tied to V_in."],["R₂ (bottom)","Lower resistor tied to GND; output is taken across R₂."]],
 recap:"Unloaded divider output equals V_in × R_bottom / (R_top + R_bottom)."
},
"series:Kirchhoff voltage law":{
 plain:"Around any single closed series loop, the supply voltage equals the sum of all voltage drops across the resistors.",
 analogy:"If an escalator lifts you 12 meters up, walking down two staircases back to the lobby must total 12 meters down.",
 why:"If a 12 V supply loop has 3 V across R₁ and 4 V across R₂, the remaining element MUST drop 5 V; any mismatch proves an extra drop or probe error.",
 example:"12 V = 3 V + 4 V + V₃ ⇒ V₃ = 5 V.",
 formula:"V_source = V_1 + V_2 + V_3",
 sub:"V_3 = 12 - 3 - 4 = 5",
 words:[["Voltage rise","Energy added per charge by a battery or regulator."],["Voltage drop","Energy lost per charge across a resistive load."]],
 recap:"In any series loop, individual voltage drops must sum to the source voltage."
},
"series:Divider loading":{
 plain:"Connecting an ADC pin or low-impedance meter across the bottom resistor of a divider puts R_load in parallel with R₂, pulling V_out lower than calculated.",
 analogy:"Attaching a second drain pipe to the midpoint of a stepped waterfall lowers the water level at that step.",
 why:"High-resistance MΩ dividers sag badly when touched by an ordinary 1 MΩ scope probe or 100 kΩ ADC input.",
 example:"If R₂ = 1 MΩ and a 1 MΩ probe connects across R₂, effective bottom resistance drops to 1 MΩ ∥ 1 MΩ = 500 kΩ!",
 formula:"R_2eff = (R_2 * R_load) / (R_2 + R_load)",
 sub:"R_2eff = (1e6 * 1e6) / (1e6 + 1e6) = 500e3",
 words:[["Loading effect","Voltage sag caused by current drawn into the connected load/meter."],["Input impedance","Resistance presented by a DMM (typically 10 MΩ) or ADC."]],
 recap:"Always combine R_load in parallel with R₂ before trusting a divider voltage."
},

/* Topic 5: parallel */
"parallel:Parallel branches":{
 plain:"Parallel components all connect directly across the same two electrical nodes (top bus A and bottom bus B), so every branch shares the exact same voltage.",
 analogy:"Four apartment sinks fed by the same main water riser (Node A) and draining to the same sewer line (Node B) all see full street water pressure.",
 why:"On a PCBA power rail, every chip on the 3.3 V plane is a parallel branch—one bad chip shorting Node A to Node B pulls the whole 3.3 V rail down.",
 example:"Four branches R₁..R₄ across V_S = 12 V (Floyd & Buchla Fig. 6.1-2) each have 12 V directly across them.",
 formula:"V_S = V_1 = V_2 = V_3 = V_4",
 sub:"V_branch = 12",
 words:[["Node A (bus)","Shared top supply conductor in a parallel circuit."],["Node B (return)","Shared bottom ground conductor."]],
 recap:"Every parallel branch sees the exact same voltage across its terminals."
},
"parallel:Parallel equivalent":{
 plain:"Adding parallel paths gives current MORE ways to flow, so total equivalent resistance is ALWAYS smaller than the smallest individual branch resistor.",
 analogy:"Opening a second highway toll booth cuts traffic resistance in half even if the second booth is slower than the first.",
 why:"In a power budget, plugging in more parallel boards lowers equivalent bus resistance and forces the power supply to deliver more current.",
 example:"Two 100 Ω resistors in parallel have R_eq = (100 × 100)/(100 + 100) = 50 Ω—half of one resistor!",
 formula:"R_eq = (R_1 * R_2) / (R_1 + R_2)",
 sub:"R_eq = (100 * 100) / (100 + 100) = 50",
 words:[["Conductance (G)","1/R: how easily current flows; parallel conductances add."],["Product over sum","Fast shortcut for two parallel resistors: R₁R₂/(R₁+R₂)."]],
 recap:"Equivalent parallel resistance is always smaller than the smallest branch resistor."
},
"parallel:Branch current":{
 plain:"Because each parallel branch has full supply voltage across it, you compute each branch's current independently with Ohm's law: I_n = V_S / R_n.",
 analogy:"Opening the kitchen faucet doesn't stop the shower from flowing at its own pressure—each branch draws current based on its own resistance.",
 why:"When an avionics rail draws too much total current, calculating expected branch currents helps spot which IC is misbehaving.",
 example:"A 300 Ω branch across a 9 V rail draws I = 9 / 300 = 0.03 A = 30 × 10⁻³ A (30 mA).",
 formula:"I_n = V_S / R_n",
 sub:"I_1 = 9 / 300 = 30e-3",
 words:[["Branch current (I_n)","Current flowing solely through branch n."],["Independent branches","Changing one branch doesn't change voltage across ideal parallel branches."]],
 recap:"Compute each parallel branch current independently via I_branch = V_rail / R_branch."
},
"parallel:Current conservation":{
 plain:"Total current leaving the supply (I_T) splits among the parallel branches and recombines on the return wire: I_T = I₁ + I₂ + I₃ + …",
 analogy:"Ten gallons per minute leaving a pump splits into 4 GPM + 6 GPM down two parallel pipes and rejoins into 10 GPM returning to the pump.",
 why:"Comparing supply telemetry current against the sum of downstream sub-rail currents catches unmonitored leakage paths or shorts.",
 example:"If three branches draw 10 mA, 15 mA, and 25 mA, total supply current is I_T = 10 + 15 + 25 = 50 mA.",
 formula:"I_T = I_1 + I_2 + I_3 + I_4",
 sub:"I_T = 10e-3 + 15e-3 + 25e-3 = 50e-3",
 words:[["I_T","Total current supplied by the source."],["Current divider","How total current splits inversely proportional to branch resistances."]],
 recap:"Total current entering a parallel bank equals the sum of all branch currents."
},
"parallel:Shorted branch":{
 plain:"If any single parallel branch develops a near-zero ohm short, it offers an almost effortless path, hoarding huge fault current and collapsing the whole bus voltage.",
 analogy:"Punching a giant hole in the bottom of a water main drops pressure everywhere else in the building to zero.",
 why:"One shorted bypass capacitor on the 3.3 V plane looks identical to a shorted processor at DC until you isolate branches or check thermal hot spots.",
 example:"A 0.1 Ω solder bridge across a 5 V rail tries to pull I = 5 / 0.1 = 50 A until a trace melts or current limit trips.",
 formula:"I_short = V_rail / R_short",
 sub:"I_short = 5 / 0.1 = 50",
 words:[["Bus collapse","Rail voltage dropping toward 0 V when a shorted branch trips current limit."],["Thermal camera / 4-wire","Tools to locate which parallel part is shorted."]],
 recap:"One shorted parallel branch pulls the entire shared rail down—power off and isolate!"
},

/* Topic 6: kcl-kvl */
"kcl-kvl:Kirchhoff current law":{
 plain:"Kirchhoff's Current Law (KCL) states that the sum of currents entering any electrical node equals the sum of currents leaving that node.",
 analogy:"Every person walking into a hallway intersection must walk out through one of the exit hallways—nobody materializes or disappears in the wire.",
 why:"Use KCL to find unmeasurable internal branch currents by subtracting known downstream loads from measured regulator output current.",
 example:"15 mA enters Node A; 5 mA and 4 mA leave on two branches ⇒ third branch must carry 15 − 5 − 4 = 6 mA.",
 formula:"I_in = I_1 + I_2 + I_3",
 sub:"I_3 = 15e-3 - 5e-3 - 4e-3 = 6e-3",
 words:[["KCL","Conservation of electric charge at a circuit junction."],["Signed current","Assign + to entering and − to leaving consistently."]],
 recap:"Sum of currents entering a node always equals sum of currents leaving."
},
"kcl-kvl:Kirchhoff voltage law":{
 plain:"Kirchhoff's Voltage Law (KVL) states that walking completely around any closed circuit loop back to your starting node gives a net voltage change of zero.",
 analogy:"Climbing up stairs (+12 m) and walking down two ramps (−5 m and −7 m) always returns you to height 0 m.",
 why:"KVL verifies whether voltage measurements across series harnesses, shunts, and loads are physically consistent—catching ground offsets immediately.",
 example:"15 V supply with drops V₁ = 4 V and V₂ = 5 V leaves V₃ = 15 − 4 − 5 = 6 V.",
 formula:"V_source - V_1 - V_2 - V_3 = 0",
 sub:"V_3 = 15 - 4 - 5 = 6",
 words:[["Closed loop","Any continuous conducting path returning to the starting node."],["Drop vs Rise","Moving − to + across a source adds voltage; moving with current across R subtracts voltage."]],
 recap:"Sum of voltage rises equals sum of voltage drops around every closed loop."
},
"kcl-kvl:Reference ground":{
 plain:"All single-node voltages ('3.3 V rail', 'V_A = 1.8 V') are meaningless unless every measurement shares the exact same 0 V reference ground.",
 analogy:"Saying a town sits at 500 m only makes sense if everyone agrees 0 m is sea level—not one engineer using basement floor and another using street level.",
 why:"In a Muon test rack, ground loops or a floating bench return between rack chassis and PCBA GND can shift telemetry readings by hundreds of millivolts.",
 example:"If V_A = 3.30 V relative to DGND and DGND sits 0.15 V above rack GND, measuring relative to rack GND gives 3.45 V!",
 formula:"V_node_ref = V_node - V_ground",
 sub:"V_node = 3.30 - (-0.15) = 3.45",
 words:[["DGND / AGND","Digital and analog ground return nets."],["Ground offset","Unwanted voltage difference between two 'ground' points carrying return current."]],
 recap:"Always clip your reference probe to the circuit's designated 0 V ground net."
},
"kcl-kvl:Node analysis":{
 plain:"Node voltage analysis picks one reference node (0 V), labels unknown node voltages V_A, V_B, and writes one KCL current-balance equation at each unknown node.",
 analogy:"Writing an inflow = outflow equation for each water junction in a building to solve every unknown pipe pressure simultaneously.",
 why:"Circuit simulators like SPICE (and the Waveform Lab on this site) solve PCBAs by running automated node-voltage KCL matrices.",
 example:"At Node A fed by V_s through R₁ and draining through R₂ and R₃: (V_A − V_s)/R₁ + V_A/R₂ + V_A/R₃ = 0.",
 formula:"(V_A - V_s) / R_1 + V_A / R_2 + V_A / R_3 = 0",
 sub:"V_A * (1/R_1 + 1/R_2 + 1/R_3) = V_s / R_1",
 words:[["Node voltage","Potential of a node measured with respect to the 0 V reference node."],["Conductance","G = 1/R used to turn node currents into linear equations."]],
 recap:"Pick a 0 V reference, then balance currents leaving each unknown node to solve voltages."
},
"kcl-kvl:Loop analysis":{
 plain:"Loop (mesh) analysis defines circulating currents I_1, I_2 inside independent closed loops and writes KVL around each loop to solve currents.",
 analogy:"Tracking total circulation around adjacent lanes of a roundabout to compute how much traffic crosses the shared middle lane.",
 why:"Loop analysis reveals shared-return ground bounce: if two loops share a return trace resistance R_gnd, heavy current in Loop 1 shifts voltage seen by Loop 2.",
 example:"Loop 1 equation with shared resistor R_shared: V_s − I₁·R₁ − (I₁ − I₂)·R_shared = 0.",
 formula:"V_s - I_1 * R_1 - (I_1 - I_2) * R_shared = 0",
 sub:"V_drop_shared = (I_1 - I_2) * R_shared",
 words:[["Mesh current","Imaginary current circulating around a single window pane of a schematic."],["Shared impedance","Return path shared by two loops causing crosstalk."]],
 recap:"Loop analysis applies KVL around closed meshes to solve currents and shared-path drops."
},

/* Topic 7: thevenin */
"thevenin:Thevenin equivalent":{
 plain:"Thevenin's theorem proves any linear circuit of resistors and sources feeding two terminals acts identically to ONE ideal voltage V_th in series with ONE resistor R_th.",
 analogy:"No matter how complex the pipes behind your wall faucet, to any garden hose attached outside it behaves like one water pressure behind one internal valve resistance.",
 why:"Lets you instantly predict how much a sensor or divider rail will sag when plugged into an avionics ADC or load.",
 example:"A 12 V divider with R₁ = 2.2 kΩ and R₂ = 2.2 kΩ simplifies to V_th = 6.0 V in series with R_th = 2.2 kΩ ∥ 2.2 kΩ = 1.1 kΩ.",
 formula:"V_load = V_th * R_load / (R_th + R_load)",
 sub:"V_th = 12 * 2200 / (2200 + 2200) = 6.0",
 words:[["V_th","Open-circuit output voltage measured with nothing connected."],["R_th","Equivalent output resistance causing droop when load draws current."]],
 recap:"Replace any upstream resistor network with V_th in series with R_th to predict load droop."
},
"thevenin:Norton equivalent":{
 plain:"Norton's theorem replaces the same two-terminal network with an ideal current source I_N in parallel with the exact same resistance R_N = R_th.",
 analogy:"Instead of stating open-circuit pressure (Thevenin), you state short-circuit max flow (Norton) with a bypass leak resistance.",
 why:"Photodiodes, DAC current outputs, and power rails modeled as current sinks convert effortlessly between Norton and Thevenin via Ohm's law.",
 example:"Given V_th = 5 V and R_th = 250 Ω, Norton current is I_N = 5 / 250 = 0.02 A = 20 × 10⁻³ A (20 mA).",
 formula:"I_N = V_th / R_th",
 sub:"I_N = 5 / 250 = 20e-3",
 words:[["I_N","Short-circuit output current between the two terminals."],["Source transform","Converting series (V_th, R_th) ↔ parallel (I_N, R_th)."]],
 recap:"Norton and Thevenin share the same resistance R_th and convert via V_th = I_N × R_th."
},
"thevenin:Open-circuit voltage":{
 plain:"Open-circuit voltage (V_OC = V_th) is the voltage across the output terminals when zero external load current flows.",
 analogy:"Water pressure at a closed faucet before you open it—no current means zero internal drop across R_th.",
 why:"Comparing open-circuit voltage against loaded voltage is the quickest bench method to measure a test fixture's hidden harness resistance!",
 example:"A battery reads 12.6 V open-circuit, then drops to 12.1 V under a 5 A load ⇒ R_internal = (12.6 − 12.1) / 5 = 0.1 Ω.",
 formula:"R_th = (V_oc - V_loaded) / I_load",
 sub:"R_th = (12.6 - 12.1) / 5 = 0.1",
 words:[["Open circuit","Infinite load resistance (I_load = 0 A)."],["Droop test","Measuring voltage unloaded vs loaded to compute source impedance."]],
 recap:"Open-circuit voltage equals V_th because zero load current creates zero drop across R_th."
},
"thevenin:Equivalent resistance":{
 plain:"To calculate R_th of a circuit with independent sources, deactivate every independent source (short ideal voltage sources, open ideal current sources) and compute total resistance looking into the output terminals.",
 analogy:"To measure how much plumbing pipe blocks flow from behind the wall, shut off the water pump (short pressure source to 0) and measure pipe resistance backward.",
 why:"For a two-resistor divider (R₁ top, R₂ bottom), shorting V_in to GND puts R₁ and R₂ directly in parallel: R_th = R₁ ∥ R₂!",
 example:"For R₁ = 1 kΩ and R₂ = 2 kΩ: R_th = (1000 × 2000) / (1000 + 2000) = 666.7 Ω.",
 formula:"R_th = (R_1 * R_2) / (R_1 + R_2)",
 sub:"R_th = (1000 * 2000) / (1000 + 2000) = 666.7",
 words:[["Short V-source","Replace independent voltage source with 0 V wire."],["Open I-source","Replace independent current source with broken wire (0 A)."]],
 recap:"Deactivate independent sources (short V, open I) to calculate R_th."
},
"thevenin:Superposition":{
 plain:"In any linear circuit with multiple power sources, the total voltage or current equals the algebraic sum of each source acting alone (with the others deactivated).",
 analogy:"Two waves hitting a buoy add their heights independently—you can compute Wave A alone, then Wave B alone, then add them.",
 why:"Separates DC bias voltages from AC ripple or sensor signals during analog front-end troubleshooting.",
 example:"If Source 1 contributes +2.0 V and Source 2 contributes −0.5 V at a node, total node voltage is +2.0 − 0.5 = +1.5 V.",
 formula:"V_total = V_source1 + V_source2",
 sub:"V_total = 2.0 + (-0.5) = 1.5",
 words:[["Linearity","Resistors, ideal capacitors, and inductors scale proportionally (does NOT hold for diodes or power P=I²R!)."]],
 recap:"Superposition solves one independent source at a time and adds the signed node voltages or branch currents."
},

/* Topic 8: ac */
"ac:Frequency":{
 plain:"Frequency (f, in hertz Hz) counts how many complete wave cycles repeat every second.",
 analogy:"A 60 Hz wall outlet reverses back and forth 60 complete times per second; a 25 MHz crystal ticks 25 million times every second.",
 why:"Oscilloscope trigger holdoff, filter roll-off, and RF antenna lengths all depend directly on signal frequency.",
 example:"A clock with period T = 20 ns (20 × 10⁻⁹ s) has frequency f = 1 / (20 × 10⁻⁹) = 50 × 10⁶ Hz = 50 MHz.",
 formula:"f = 1 / T",
 sub:"f = 1 / (20e-9) = 50e6",
 words:[["Hertz (Hz)","1 cycle per second."],["MHz / GHz","10⁶ Hz (megahertz) and 10⁹ Hz (gigahertz)."]],
 recap:"Frequency is cycles per second: f = 1 / T."
},
"ac:Period":{
 plain:"Period (T, in seconds) is the exact duration of ONE complete repeating cycle, from one rising edge to the very next rising edge.",
 analogy:"If a clock ticks 10 times per second (10 Hz), each tick period lasts 0.1 seconds (100 ms).",
 why:"Counting half-cycles or peak-to-trough time on an oscilloscope instead of full cycle-to-cycle time makes your calculated frequency off by 2×!",
 example:"A 50 Hz signal has period T = 1 / 50 = 0.02 s = 20 × 10⁻³ s (20 ms).",
 formula:"T = 1 / f",
 sub:"T = 1 / 50 = 20e-3",
 words:[["Full cycle","Returning to the exact same value AND slope direction (rising-to-rising)."]],
 recap:"Period is the reciprocal of frequency (T = 1/f), measured across one full repeating cycle."
},
"ac:RMS voltage":{
 plain:"RMS (Root-Mean-Square) voltage is the equivalent DC voltage that delivers the exact same heating power to a resistor as the AC waveform.",
 analogy:"A sine wave spends half its time below peak and touches zero twice per cycle, so its effective heating power matches a DC voltage of 0.707 × peak.",
 why:"Standard DMMs report AC voltage in RMS while oscilloscopes make peak voltage obvious—mixing up 10 V peak with 10 V RMS causes a 41% error!",
 example:"A 10 V peak sine wave has V_rms = 10 / √2 ≈ 7.071 V.",
 formula:"V_rms = V_peak / √(2)",
 sub:"V_rms = 10 / √(2) = 7.071",
 words:[["V_peak","Maximum positive height above 0 V."],["V_pp","Peak-to-peak height = 2 × V_peak for symmetric sine waves."]],
 recap:"For a pure sine wave, V_rms = V_peak / √2 ≈ 0.707 × V_peak."
},
"ac:Phase shift":{
 plain:"Phase shift (θ, in degrees or radians) measures how far one periodic wave is delayed relative to another wave of the same frequency, where one full cycle = 360°.",
 analogy:"Two runners lapping the exact same track at identical speed: if Runner B crosses the finish line 1/4 lap behind Runner A, the phase shift is 90°.",
 why:"Capacitors shift current 90° ahead of voltage, inductors shift current 90° behind, and RF phased arrays steer satellite beams using phase shift.",
 example:"A 2.5 ns delay on a 10 ns period clock corresponds to θ = (2.5 / 10) × 360° = 90°.",
 formula:"theta = (Delta_t / T) * 360",
 sub:"theta = (2.5e-9 / 10e-9) * 360 = 90",
 words:[["360° / 2π rad","One complete repeating period."],["Lead / lag","Earlier waveform leads; delayed waveform lags."]],
 recap:"Phase converts time delay into a fraction of a full 360° cycle: θ = (Δt / T) × 360°."
},
"ac:Impedance":{
 plain:"Impedance (Z, in ohms) generalizes resistance to AC circuits, combining fixed resistance R with frequency-dependent reactance X.",
 analogy:"Walking through mud (R) resists every speed equally, while pushing through water (X) resists faster movement differently depending on frequency.",
 why:"Matching coaxial cables and PCB differential pairs to 50 Ω or 100 Ω impedance prevents signal reflections and RF power loss.",
 example:"Total impedance magnitude of R = 30 Ω in series with X = 40 Ω is |Z| = √(30² + 40²) = 50 Ω.",
 formula:"Z_mag = √(R^2 + X^2)",
 sub:"Z_mag = √(30^2 + 40^2) = 50",
 words:[["Reactance (X)","AC opposition from capacitors (X_C = 1/(2πfC)) or inductors (X_L = 2πfL)."],["50 Ω","Standard RF and test-equipment cable impedance."]],
 recap:"Impedance combines resistance and frequency-dependent reactance into total AC opposition."
},

/* Topic 9: capacitors */
"capacitors:Capacitance":{
 plain:"Capacitance (C, in farads F) measures how many coulombs of electric charge a capacitor stores for every 1 volt applied across its plates.",
 analogy:"A wider water tank holds more gallons per foot of water height; a larger capacitor holds more charge per volt.",
 why:"Large bulk caps hold up rails during switchovers while smaller ceramic caps bypass high-frequency noise.",
 example:"A 4.7 µF (4.7 × 10⁻⁶ F) capacitor at 5 V holds Q = (4.7 × 10⁻⁶) × 5 = 23.5 × 10⁻⁶ C (23.5 µC).",
 formula:"Q = C * V",
 sub:"Q = 4.7e-6 * 5 = 23.5e-6",
 words:[["Farad (F)","1 coulomb stored per 1 volt."],["Microfarad (µF)","10⁻⁶ F, standard board decoupling size."]],
 recap:"Charge stored equals capacitance times voltage: Q = C × V."
},
"capacitors:Capacitor voltage":{
 plain:"Voltage across a capacitor cannot jump instantaneously because changing voltage requires moving finite charge (I = C · dV/dt).",
 analogy:"You cannot raise water height in a tank instantaneously unless an infinite hose fills it—voltage ramps smoothly as current flows in.",
 why:"Uncharged huge capacitor banks look like a momentary short at power-on (inrush current) while ramping up from 0 V!",
 example:"Charging 100 µF at a constant 100 mA ramps voltage at dV/dt = (100 × 10⁻³) / (100 × 10⁻⁶) = 1,000 V/s (1 V/ms).",
 formula:"I = C * (dV / dt)",
 sub:"dV_dt = 100e-3 / 100e-6 = 1000",
 words:[["Inrush current","High surge current charging empty capacitors at startup."],["dV/dt","Rate of voltage rise in volts per second."]],
 recap:"Capacitor voltage resists sudden jumps; fast voltage steps demand large charging current I = C(dV/dt)."
},
"capacitors:Stored energy":{
 plain:"The electrical energy stored in a capacitor grows with the SQUARE of its voltage: E = ½ · C · V².",
 analogy:"Stretching a slingshot twice as far stores four times the energy—so high-voltage capacitor banks pack dangerous energy even at modest µF.",
 why:"Always verify bus capacitors have bled down to a safe voltage before touching or reworking a flight power board.",
 example:"A 10 µF capacitor charged to 9 V holds E = 0.5 × (10 × 10⁻⁶) × 9² = 405 × 10⁻⁶ J (405 µJ).",
 formula:"E = 0.5 * C * V^2",
 sub:"E = 0.5 * 10e-6 * 9^2 = 405e-6",
 words:[["Quadratic scaling","Doubling voltage quadruples stored energy (4×)."],["Bleeder resistor","High-value resistor safely discharging bulk caps after power-off."]],
 recap:"Capacitor energy scales with voltage squared: E = ½ C V²."
},
"capacitors:Decoupling":{
 plain:"Decoupling (bypass) capacitors sit millimeters from IC power pins to supply instantaneous switching bursts locally before long PCB traces can react.",
 analogy:"Keeping a water pitcher right on the dinner table so you don't have to walk back to the kitchen sink for every sip.",
 why:"Missing or poorly placed decoupling caps let core rails droop below V_min during fast processor clock transitions, causing mysterious crashes.",
 example:"A 0.1 µF ceramic capacitor placed right at a VDD pin absorbs sub-nanosecond edge spikes while 10 µF bulk caps hold millisecond steps.",
 formula:"Delta_V = (I_step * Delta_t) / C_local",
 sub:"Delta_V = (2 * 5e-9) / 100e-9 = 0.10",
 words:[["Bypass cap","Low-inductance ceramic capacitor shunting AC noise to local GND."],["Via inductance","Loop inductance between cap pad and IC pin—must be minimized."]],
 recap:"Place decoupling caps right next to IC supply/ground pins to fight fast load steps."
},
"capacitors:ESR and ESL":{
 plain:"Real capacitors are not ideal: their internal resistance (ESR) wastes power as heat, and their package/lead inductance (ESL) blocks ultra-high frequencies.",
 analogy:"A water reservoir with a slightly rusty pipe (ESR) and narrow entry elbow (ESL) resists sudden sloshing back and forth.",
 why:"Every capacitor stops acting capacitive above its self-resonant frequency (where ESL takes over) and gets hot if AC ripple current heats its ESR.",
 example:"1 A RMS ripple flowing through 0.2 Ω ESR dissipates P_ESR = 1² × 0.2 = 0.2 W inside the cap.",
 formula:"P_ESR = I_ripple^2 * R_ESR",
 sub:"P_ESR = 1^2 * 0.2 = 0.2",
 words:[["ESR","Equivalent Series Resistance causing heating and voltage step ΔV = ΔI·ESR."],["ESL","Equivalent Series Inductance limiting high-frequency decoupling."]],
 recap:"Real caps have ESR (heating/droop) and ESL (high-frequency roll-off)."
},

/* Topic 10: rc */
"rc:RC time constant":{
 plain:"The RC time constant τ (Greek 'tau', in seconds) equals resistance multiplied by capacitance: τ = R × C.",
 analogy:"Larger resistor = narrower faucet; larger capacitor = bigger bucket. Multiply them together to find how slow the bucket fills.",
 why:"Handy shortcut: kΩ (10³) × µF (10⁻⁶) cancels to 10⁻³ seconds = milliseconds directly!",
 example:"With R = 4.7 kΩ and C = 10 µF: τ = (4.7 × 10³) × (10 × 10⁻⁶) = 47 × 10⁻³ s (47 ms).",
 formula:"tau = R * C",
 sub:"tau = (4.7 * 10^3) * (10 * 10^(-6)) = 47e-3",
 words:[["τ (tau)","Characteristic first-order response time in seconds."],["kΩ × µF = ms","10³ × 10⁻⁶ = 10⁻³ s (exact shortcut!)."]],
 recap:"τ = R × C sets the speed of RC charging and discharging."
},
"rc:Charging response":{
 plain:"An initially empty capacitor charging toward V_final rises along an exponential curve, reaching 63.2% (1 − e⁻¹) of V_final at exactly t = 1τ.",
 analogy:"If every minute you walk 63% of the remaining distance to a wall, you climb rapidly at first and gradually ease up to the target.",
 why:"Power-on reset circuits use this predictable curve so SYS_RESET_N stays low until voltage crosses the chip's threshold.",
 example:"Stepping toward 3.3 V, after 1τ the node hits V(τ) = 3.3 × (1 − e⁻¹) = 3.3 × 0.6321 = 2.086 V.",
 formula:"V(t) = V_final * (1 - exp(-t / tau))",
 sub:"V(tau) = 3.3 * (1 - exp(-1)) = 2.086",
 words:[["e⁻¹ ≈ 0.3679","Remaining fraction after one time constant."],["63.2%","Fraction of the step completed at t = τ."]],
 recap:"During charging from 0 V, an RC node reaches 63.2% of V_final after 1τ."
},
"rc:Discharging response":{
 plain:"When a charged capacitor discharges through resistor R, voltage falls exponentially, leaving 36.8% (e⁻¹) of its initial voltage after t = 1τ.",
 analogy:"A leaky tire loses air fastest when fully pumped and slowly approaches flat, losing 63.2% every τ.",
 why:"High-voltage spacecraft power buses must discharge safely within seconds after shutoff so technicians don't get shocked.",
 example:"A 12 V cap discharging for 1τ drops to 12 × e⁻¹ = 12 × 0.3679 = 4.41 V.",
 formula:"V(t) = V_0 * exp(-t / tau)",
 sub:"V(tau) = 12 * exp(-1) = 4.415",
 words:[["36.8%","Fraction remaining after 1τ of exponential decay."],["Half-life","t_½ = 0.693 · R · C (time to reach 50%)."]],
 recap:"During discharge, an RC node drops to 36.8% of initial voltage after 1τ."
},
"rc:Settling":{
 plain:"An RC circuit takes roughly 5 time constants (5τ) to reach 99.3% of its final value and count as fully settled.",
 analogy:"By 5 steps of closing 63% of the remaining gap, less than 0.7% remains—practically indistinguishable from finished.",
 why:"In automated PyVISA tests, reading a slow filtered analog rail before 5τ measures a half-charged value and triggers false failures!",
 example:"If τ = 10 ms, wait at least 5 × 10 ms = 50 ms after enabling the rail before calling `MEAS:VOLT:DC?`.",
 formula:"t_settle = 5 * tau",
 sub:"t_settle = 5 * 10e-3 = 50e-3",
 words:[["5τ rule","Wait 5 × R × C for >99.3% settling."],["Premature read","Sampling before 5τ catches a transient voltage instead of steady state."]],
 recap:"Always wait at least 5τ for an RC circuit to settle within 1% of final voltage."
},
"rc:Meter loading":{
 plain:"A DMM has internal input resistance (typically 10 MΩ). Placing it across a high-resistance RC circuit creates a parallel discharge path R_eq = R ∥ R_DMM that speeds up decay!",
 analogy:"Poking a tiny pinhole meter into a slow-draining barrel creates a second leak—making the barrel empty faster than your no-meter calculation predicted.",
 why:"If a 22 MΩ RC timer gets probed by a 10 MΩ DMM, effective resistance drops to 6.875 MΩ and time constant drops over 3×!",
 example:"R₁ = 22 MΩ in parallel with R_DMM = 10 MΩ gives R_eq = (22 × 10)/(22 + 10) = 6.875 MΩ.",
 formula:"R_eq = (R_1 * R_DMM) / (R_1 + R_DMM)",
 sub:"R_eq = (22e6 * 10e6) / (22e6 + 10e6) = 6.875e6",
 words:[["10 MΩ input Z","Standard DMM DC voltmeter resistance."],["1 MΩ scope probe","Even worse loading on high-Z nodes unless using a 10× (10 MΩ) probe."]],
 recap:"Include DMM/scope probe resistance in parallel with R whenever testing MΩ-scale RC circuits."
},

/* Topic 11: inductors */
"inductors:Inductance":{
 plain:"An inductor (L, in henries H) opposes rapid changes in current by generating a voltage proportional to how fast current tries to change: V_L = L · (dI/dt).",
 analogy:"A heavy freight train resists sudden speed changes—trying to stop it in 1 millisecond produces an enormous crash force (voltage spike).",
 why:"Switching regulators depend on inductors to smooth current, while stray board inductance creates violent voltage spikes on fast digital edges.",
 example:"Increasing current by 2 A in 1 ms through a 5 mH coil induces V_L = (5 × 10⁻³) × (2 / 10⁻³) = 10 V.",
 formula:"V_L = L * (Delta_I / Delta_t)",
 sub:"V_L = 5e-3 * (2 / 1e-3) = 10",
 words:[["Henry (H)","Unit of inductance (1 H = 1 V·s/A)."],["dI/dt","Rate of current change in amperes per second."]],
 recap:"Inductors resist sudden current changes via V_L = L · (ΔI/Δt)."
},
"inductors:RL time constant":{
 plain:"In an inductor-resistor circuit, current builds up or decays exponentially with time constant τ = L / R.",
 analogy:"Bigger flywheel (L) takes longer to spin up; bigger brake friction (R) stops the flywheel faster (smaller τ).",
 why:"Relay coils, solenoid valves on satellite propulsion thrusters, and motor drivers take several L/R time constants to reach operating current.",
 example:"A 100 mH thruster valve coil with 50 Ω series resistance has τ = (100 × 10⁻³) / 50 = 2 × 10⁻³ s (2 ms).",
 formula:"tau = L / R",
 sub:"tau = 100e-3 / 50 = 2e-3",
 words:[["mH / Ω = ms","10⁻³ H / Ω = 10⁻³ s (exact millisecond shortcut!)."],["5τ settling","Coil current reaches >99% steady state after 5 × (L/R)."]],
 recap:"RL time constant equals L divided by R (τ = L/R)."
},
"inductors:Magnetic energy":{
 plain:"An inductor stores energy inside its surrounding magnetic field proportional to current squared: E = ½ · L · I².",
 analogy:"Like kinetic energy ½ m v² of a moving car—the faster current flows through an inductance, the more magnetic momentum must be safely absorbed when shut off.",
 why:"When a transistor opens and tries to cut current to zero instantaneously, that stored magnetic energy MUST go somewhere—either safely into a clamp diode or destructively blasting through the transistor!",
 example:"A 10 mH coil carrying 2 A holds E = 0.5 × (10 × 10⁻³) × 2² = 0.02 J (20 mJ).",
 formula:"E = 0.5 * L * I^2",
 sub:"E = 0.5 * 10e-3 * 2^2 = 20e-3",
 words:[["Magnetic flux","Field lines around current-carrying turns storing energy."],["Current continuity","Inductor current cannot drop to zero instantaneously."]],
 recap:"Magnetic energy stored in an inductor equals ½ L I²."
},
"inductors:Flyback protection":{
 plain:"A flyback (freewheeling) diode connected reverse-biased across a coil gives inductor current a safe circulating loop when the switch turns off.",
 analogy:"An overflow bypass channel that lets rushing water loop harmlessly back around when a dam gate slams shut.",
 why:"Without a flyback diode across satellite relay or valve coils, switching off creates hundreds of volts of reverse spike that instantly kills driver MOSFETs.",
 example:"When the switch opens on a 12 V, 0.5 A coil, a flyback diode clamps the reverse spike safely to ≈ +0.7 V above +12 V.",
 formula:"V_clamp = V_supply + V_diode",
 sub:"V_clamp = 12 + 0.7 = 12.7",
 words:[["Flyback spike","Large negative/positive inductive kick when dI/dt is abrupt."],["Cathode to V+","Diode points toward supply so it only conducts during turn-off kick."]],
 recap:"Always verify a flyback diode or clamp exists before switching inductive loads."
},
"inductors:Parasitic inductance":{
 plain:"Even a straight piece of PCB trace, IC bondwire, or long oscilloscope ground clip has parasitic inductance (~1 nH per mm).",
 analogy:"Even water inside a short straight pipe has inertia when you slam a valve shut in nanoseconds.",
 why:"A classic 15 cm alligator scope ground clip adds ≈145 nH! With a 2 A/ns step, V = L·dI/dt adds giant fake ringing on your screen—always use a short ground spring.",
 example:"1 nH trace inductance with 12 A changing in 4 ns causes V = (1 × 10⁻⁹) × (12 / 4 × 10⁻⁹) = 3.0 V inductive bounce!",
 formula:"V_bounce = L_par * (Delta_I / Delta_t)",
 sub:"V_bounce = 1e-9 * (12 / 4e-9) = 3.0",
 words:[["Loop area","Area enclosed by signal + return path; smaller loop = less parasitic L."],["Ground spring","Short coiled scope tip replacing long alligator ground wire."]],
 recap:"Minimize probe loop area with a ground spring so parasitic inductance doesn't fake rail noise."
},

/* Topic 12: filters */
"filters:Low-pass filter":{
 plain:"A low-pass filter (e.g., series R feeding shunt C to GND) lets steady DC and slow signals pass cleanly while shunting high-frequency noise to ground.",
 analogy:"A shock absorber on a car: it follows slow hills smoothly while absorbing rapid bumpy potholes.",
 why:"Used ahead of telemetry ADCs to strip switching-regulator noise—but if f_c is too low, it blurs crisp square-wave digital edges.",
 example:"Signals well below f_c pass at ≈0 dB (gain ≈ 1), while signals at 10× f_c drop by 20 dB (1/10th amplitude).",
 formula:"|H(f)| = 1 / √(1 + (f / f_c)^2)",
 sub:"|H(10 * f_c)| = 1 / √(1 + 100) = 0.0995",
 words:[["Passband","Frequencies below f_c transmitted with near-full amplitude."],["Roll-off","First-order RC drops −20 dB per 10× frequency increase."]],
 recap:"Low-pass filters transmit DC/slow signals and attenuate high-frequency noise above f_c."
},
"filters:High-pass filter":{
 plain:"A high-pass filter (e.g., series C feeding shunt R to GND) blocks steady DC and slow drift while letting fast AC changes pass straight through.",
 analogy:"A floating buoy that ignores slow ocean tide changes over 6 hours but rides every fast wave.",
 why:"Switching an oscilloscope channel to 'AC coupling' inserts an internal high-pass filter (~10 Hz) so you can zoom in on tiny millivolt rail ripple on top of 12 V DC.",
 example:"DC (f = 0 Hz) has infinite capacitive reactance X_C → blocked completely (gain = 0).",
 formula:"|H(f)| = (f / f_c) / √(1 + (f / f_c)^2)",
 sub:"|H(0)| = 0",
 words:[["AC coupling","Series capacitor blocking DC voltage while passing AC ripple."],["DC restoration","Use DC coupling when you must measure absolute voltage levels."]],
 recap:"High-pass filters block DC bias and pass higher frequencies; use DC coupling to measure true rail voltage."
},
"filters:Cutoff frequency":{
 plain:"The −3 dB cutoff frequency f_c is where a filter's output voltage falls to 70.7% (1/√2) of its passband level and power drops in half.",
 analogy:"The threshold speed on a sieve where half the particles pass and half begin getting blocked.",
 why:"For a first-order RC filter, calculate f_c = 1 / (2πRC) before testing to ensure your signal bandwidth isn't accidentally cut off.",
 example:"With R = 1 kΩ and C = 0.1 µF: f_c = 1 / (2π × 10³ × 0.1 × 10⁻⁶) = 1,591.5 Hz.",
 formula:"f_c = 1 / (2 * pi * R * C)",
 sub:"f_c = 1 / (2 * pi * 1e3 * 0.1e-6) = 1591.5",
 words:[["−3 dB point","Amplitude = 0.707 × V_in; power = 0.5 × P_in."],["X_C = R","At f = f_c, capacitor reactance magnitude equals R."]],
 recap:"At f_c = 1/(2πRC), filter output drops by −3 dB (0.707 of input amplitude)."
},
"filters:Resonance":{
 plain:"Resonance occurs at f_0 = 1 / (2π√(LC)) when inductive and capacitive reactances cancel out, allowing energy to slosh back and forth between electric and magnetic fields.",
 analogy:"Pushing a playground swing at its exact natural rhythm: small pushes build huge swings.",
 why:"Unintended LC resonance between decoupling caps and power-plane inductance causes giant impedance spikes and board oscillation.",
 example:"With L = 1 mH and C = 0.1 µF: f₀ = 1 / (2π√(10⁻³ × 10⁻⁷)) = 15,915 Hz.",
 formula:"f_0 = 1 / (2 * pi * √(L * C))",
 sub:"f_0 = 1 / (2 * pi * √(1e-3 * 0.1e-6)) = 15915",
 words:[["f₀","Natural resonant frequency where X_L = X_C."],["Anti-resonance","Parallel LC peak impedance between two decoupling capacitor values."]],
 recap:"LC resonance frequency equals 1 / (2π√(LC))."
},
"filters:Q and damping":{
 plain:"Quality factor Q measures how sharply an RLC network rings; higher damping resistance R lowers Q and stops oscillations quickly.",
 analogy:"A tuning fork in air has high Q (rings for seconds); dipped in thick oil, high damping kills the ringing in one cycle.",
 why:"Underdamped power filters ring badly after every load step; adding slight damping resistance stabilizes the rail.",
 example:"For a series RLC circuit, increasing R shrinks Q = (1/R)√(L/C) and eliminates overshoot ringing.",
 formula:"Q = (1 / R) * √(L / C)",
 sub:"zeta = (R / 2) * √(C / L)",
 words:[["Underdamped","Low R, high Q → waveform overshoots and rings."],["Critically damped","Minimum resistance that settles fastest with zero overshoot."]],
 recap:"Adding resistance increases damping, reduces Q, and suppresses ringing."
},

/* Topic 13: magnetics */
"magnetics:Transformer ratio":{
 plain:"An ideal transformer steps AC voltage up or down strictly in proportion to its secondary-to-primary turns ratio: V_s / V_p = N_s / N_p.",
 analogy:"A 2:1 bicycle gear doubles output speed while halving output torque; a 2:1 transformer doubles AC voltage while halving current.",
 why:"Spacecraft DC-DC isolated converters use transformer turns ratios to create multiple isolated rail voltages from one main bus.",
 example:"With N_p = 200 turns, N_s = 100 turns, and V_p = 24 V RMS: V_s = 24 × (100 / 200) = 12 V RMS.",
 formula:"V_s / V_p = N_s / N_p",
 sub:"V_s = 24 * (100 / 200) = 12",
 words:[["Primary (N_p)","Input winding receiving AC/switched energy."],["Secondary (N_s)","Output winding delivering scaled voltage."]],
 recap:"Transformer voltage ratio equals turns ratio: V_s/V_p = N_s/N_p."
},
"magnetics:Isolation":{
 plain:"Galvanic isolation separates two circuits with magnetic or optical coupling so NO direct copper ground path connects them.",
 analogy:"Two neighbors talking across a fence—information/energy passes without anyone stepping into the other yard.",
 why:"Isolation prevents dangerous ground-loop currents and protects sensitive test racks from high-voltage spacecraft battery faults.",
 example:"An isolated RS-422/CAN transceiver keeps noisy thruster chassis ground separate from flight-computer DGND.",
 formula:"R_isolation > 100 * 10^6",
 sub:"I_leak = V_common / R_isolation",
 words:[["Isolation barrier","Insulating gap (magnetic core or optocoupler) rated for kV withstand."],["Common-mode","Voltage offset existing between two isolated grounds."]],
 recap:"Isolation blocks DC/ground currents while coupling signals or power magnetically."
},
"magnetics:Magnetic saturation":{
 plain:"Magnetic core saturation happens when magnetic flux hits the core material's physical ceiling—suddenly inductance collapses toward zero and current skyrockets!",
 analogy:"Like stretching a bungee cord until it goes completely rigid, or filling a sponge until water pours straight through.",
 why:"Inrush current or DC bias in a transformer drives the core into saturation, blowing input fuses or switching MOSFETs at startup.",
 example:"Watch current ramp on a scope: normal linear ramp suddenly curving sharply upward like a hockey stick proves core saturation.",
 formula:"B_max = (V_p * t_on) / (N_p * A_core)",
 sub:"I_sat >> V_p / (2 * pi * f * L_unsat)",
 words:[["Flux density (B)","Magnetic field strength in teslas inside the core."],["Volt-seconds","Voltage × on-time; exceeding rated V·µs saturates the core."]],
 recap:"Core saturation collapses inductance and sends current spiking vertically."
},
"magnetics:Three-phase voltage":{
 plain:"Balanced three-phase power delivers three sine waves 120° apart; line-to-line voltage V_LL equals √3 (≈1.732) times line-to-neutral voltage V_LN.",
 analogy:"Three cyclists pedaling one tandem crank spaced 120° apart deliver smooth continuous power instead of pulsing twice per turn.",
 why:"Large TVAC thermal-vacuum chambers and rack power distribution units (PDUs) in Muon's San Jose factory run on 208 V or 480 V three-phase power.",
 example:"Standard 120 V line-to-neutral yields V_LL = √3 × 120 = 207.8 V (~208 V three-phase).",
 formula:"V_LL = √(3) * V_LN",
 sub:"V_LL = √(3) * 120 = 207.8",
 words:[["V_LL","Voltage measured between any two hot phase lines."],["V_LN","Voltage measured from one phase line to neutral."]],
 recap:"In balanced wye systems, line-to-line voltage is √3 times line-to-neutral voltage."
},
"magnetics:Power factor":{
 plain:"Power factor (PF between 0 and 1) converts apparent volt-amperes (VA) into true real watts (W) consumed in three-phase or AC loads.",
 analogy:"Foamy beer in a mug: total mug volume is Apparent Power (VA), while the liquid beer actually quenching thirst is Real Power (W).",
 why:"Ignoring PF or the √3 factor when sizing lab facility breakers for chambers and power supplies underestimates line current.",
 example:"A 400 V line-line, 10 A load with PF = 0.9 draws P = √3 × 400 × 10 × 0.9 = 6.235 kW.",
 formula:"P = √(3) * V_LL * I_L * PF",
 sub:"P = √(3) * 400 * 10 * 0.9 = 6235",
 words:[["Real power (W)","Energy actually doing work or heating."],["Apparent power (VA)","RMS volts × RMS amps before accounting for phase angle."]],
 recap:"Real 3-phase power equals √3 × V_LL × I_L × PF."
},

/* Topic 14: components */
"components:Diode direction":{
 plain:"A diode acts as a one-way electrical check valve: current flows easily from Anode (+) to Cathode (− bar) once forward voltage exceeds V_f (≈0.7 V silicon, ≈0.3 V Schottky).",
 analogy:"A hinged pet door that swings freely open inward (+ to −) but slams shut if pushed backward.",
 why:"Installing a reverse-polarity protection diode or TVS backwards creates a dead short across the power rail during bring-up!",
 example:"Before powering a new board, inspect the cathode stripe on every diode against the schematic.",
 formula:"I_diode > 0  when  V_A - V_K >= V_f",
 sub:"V_drop = 0.7",
 words:[["Anode / Cathode","Positive input side (A) vs negative striped side (K)."],["V_f","Forward voltage drop required for conduction."]],
 recap:"Current flows Anode → Cathode (stripe); always inspect diode orientation before first power-on."
},
"components:LED resistor":{
 plain:"An LED has almost zero internal resistance once turned on at its forward drop V_f, so it MUST have a series current-limiting resistor R = (V_s − V_f) / I_LED.",
 analogy:"Connecting an LED directly to a stiff battery is like hooking a delicate sprinkler straight to a fire hydrant with no flow nozzle.",
 why:"Board status LEDs (POWER_GOOD, HEARTBEAT) burn out instantly if an assembly error installs a 0 Ω jumper instead of a kΩ/hundred-Ω resistor.",
 example:"5 V supply, 2 V red LED, target 10 mA: R = (5 − 2) / (10 × 10⁻³) = 300 Ω.",
 formula:"R = (V_s - V_f) / I_LED",
 sub:"R = (5 - 2) / 10e-3 = 300",
 words:[["V_f","LED forward voltage drop (≈1.8–2.2 V red/green, ≈3 V blue/white)."]],
 recap:"Always subtract V_f from V_s before dividing by target LED current."
},
"components:MOSFET switch":{
 plain:"A MOSFET acts as a voltage-controlled power switch: driving its Gate-to-Source voltage V_GS well above threshold V_th turns the Drain-Source channel on with tiny resistance R_DS(on).",
 analogy:"A light feather-touch lever controlling a giant floodgate—almost zero gate current switches tens of amperes in the drain.",
 why:"Load switches on Muon satellite power boards use MOSFETs; if V_GS is marginal (partially enhanced), R_DS(on) jumps and the MOSFET overheats!",
 example:"At I_D = 5 A and R_DS(on) = 20 mΩ, conduction loss is P = 5² × (20 × 10⁻³) = 0.5 W.",
 formula:"P_cond = I_D^2 * R_DSon",
 sub:"P_cond = 5^2 * 20e-3 = 0.5",
 words:[["V_GS","Gate voltage relative to Source—must exceed threshold cleanly."],["R_DS(on)","On-state channel resistance in milliohms."]],
 recap:"Drive MOSFET gates firmly past threshold to minimize R_DS(on) heating."
},
"components:Logic high and low":{
 plain:"Digital ICs interpret continuous analog voltages using datasheet thresholds: guaranteed HIGH above V_IH and guaranteed LOW below V_IL.",
 analogy:"A referee calling fair/foul: anything clearly inside the line (≥ V_IH) counts as '1'; anything clearly outside (≤ V_IL) counts as '0'; the gray zone in between is unpredictable.",
 why:"Connecting a 1.8 V FPGA output directly to a 3.3 V input with V_IH = 2.3 V sits right in the forbidden gray zone and fails intermittently across temperature.",
 example:"For 3.3 V CMOS (V_IH ≈ 0.7 × 3.3 = 2.31 V, V_IL ≈ 0.3 × 3.3 = 0.99 V), a 1.2 V logic signal is invalid!",
 formula:"V_OH >= V_IH   and   V_OL <= V_IL",
 sub:"V_IH = 0.7 * 3.3 = 2.31",
 words:[["V_IH / V_IL","Receiver minimum valid HIGH and maximum valid LOW voltage."],["Level shifter","Translator bridging 1.8 V and 3.3 V logic domains."]],
 recap:"Never assume '1' or '0'—measure actual rail voltage against datasheet V_IH and V_IL thresholds."
},
"components:Pull-up resistor":{
 plain:"A pull-up resistor gently ties an undriven or open-drain line (like I²C SDA/SCL or RESET_N) to V_CC so it never floats to random noise voltages.",
 analogy:"A weak spring holding a door safely closed until someone actively pulls it open.",
 why:"Too weak (too high Ω) a pull-up makes rising edges slow and rounded; too strong (too low Ω) prevents weak ICs from pulling the line cleanly to 0 V.",
 example:"3.3 V bus with a 4.7 kΩ pull-up draws only 3.3 / 4700 = 0.7 mA when pulled low.",
 formula:"I_pull = V_CC / R_pullup",
 sub:"I_pull = 3.3 / 4.7e3 = 0.702e-3",
 words:[["Open-drain","Output that can pull LOW to GND or release (Hi-Z), needing a pull-up to go HIGH."],["Floating node","Unconnected CMOS input picking up random static/EMI."]],
 recap:"Pull-ups guarantee deterministic idle voltages on open-drain and reset lines."
},

/* Topic 15: power-rails */
"power-rails:Power tree":{
 plain:"A power tree maps how raw input bus voltage (e.g., 28 V or 12 V) cascades through DC-DC bucks, LDOs, and load switches down to every IC supply rail.",
 analogy:"A building plumbing diagram showing main street pressure stepping down through sub-regulators to each floor.",
 why:"When a 1.0 V core rail is dead at bring-up, tracing upstream in the power tree immediately shows whether the 3.3 V enable rail never turned on.",
 example:"28 V Bus → 5 V Buck (EN from Bus PG) → 3.3 V Buck → 1.0 V Core Buck.",
 formula:"P_in = P_out / eta",
 sub:"I_in = (1.0 * 4.0) / (12 * 0.88) = 0.379",
 words:[["Buck converter","High-efficiency step-down switching regulator."],["LDO","Low-dropout linear regulator trading efficiency for ultra-low noise."]],
 recap:"Always trace upstream enables and input rails on the power tree before blaming a downstream regulator."
},
"power-rails:Power sequencing":{
 plain:"Power sequencing enforces the exact chronological order in which voltage rails ramp up and stabilize before RESET_N is released.",
 analogy:"Waking up in order: turn on the power strip, wait for the monitor to wake up, wait for the clock to lock, THEN press start.",
 why:"Powering a processor's 3.3 V I/O before its 1.0 V core (or releasing RESET_N early) causes latch-up, back-feeding through ESD diodes, or cold-boot hangs.",
 example:"Measure CH1 (3.3 V), CH2 (1.5 V), CH3 (1.0 V), and CH4 (SYS_RESET_N) on one 4-channel scope trigger at 2 ms/div.",
 formula:"t_reset_release >= max(t_rails, t_pll) + t_margin",
 sub:"t_reset >= 48e-9 + 20e-9 = 68e-9",
 words:[["POWER_GOOD","Open-drain flag asserted once a regulator reaches ~90% nominal."],["Monotonic ramp","Smooth continuous rise without dipping backward during turn-on."]],
 recap:"Scope all rails + POWER_GOOD + RESET_N simultaneously during cold power-on to verify monotonic sequence."
},
"power-rails:Rail ripple":{
 plain:"Rail ripple is the small periodic AC voltage wave riding on top of a DC power supply caused by switching converters and load pulses.",
 analogy:"Small ripples on top of a 3-meter-deep swimming pool—average depth is 3 m, while surface waves bounce ±20 mV.",
 why:"Excessive ripple erodes setup/hold timing margins and adds noise to sensitive RF or infrared payloads (like FireSat).",
 example:"Keep peak-to-peak ripple < 30 mV on a 1.0 V rail using short coax pigtails or N7020A power-rail probes (never long alligator clips!).",
 formula:"Ripple_pct = (V_pp / V_nom) * 100",
 sub:"Ripple_pct = (30e-3 / 1.0) * 100 = 3.0",
 words:[["V_pp ripple","Peak-to-peak AC oscillation riding on DC rail."],["Bandwidth limit","20 MHz scope limit often used unless checking >100 MHz switching harmonics."]],
 recap:"Measure ripple with a low-inductance ground spring or power-rail probe directly across decoupling caps."
},
"power-rails:Load transient":{
 plain:"A load transient happens when a chip jumps suddenly from idle to full compute load—current spikes instantaneously while regulator feedback lags slightly, causing temporary V_droop.",
 analogy:"Suddenly slamming open four fire hoses drops street water pressure briefly until the main pump spins faster.",
 why:"DMMs average out microsecond droop! Only an oscilloscope triggered on the current surge catches V_min dropping below silicon brownout limits.",
 example:"1.1 V baseline dipping to 1.02 V during a CPU burst equals V_droop = 1.10 − 1.02 = 80 mV.",
 formula:"V_droop = V_baseline - V_min",
 sub:"V_droop = 1.10 - 1.02 = 80e-3",
 words:[["Overshoot","Temporary voltage spike when heavy load suddenly shuts off."],["Settling time","Microseconds until rail returns inside DC tolerance band."]],
 recap:"Trigger a scope on the current step to capture transient V_droop and overshoot."
},
"power-rails:Current sensing":{
 plain:"Current sensing places a tiny precision shunt resistor (mΩ) in series with a load and measures the differential millivolt drop across its Kelvin pads: I = ΔV / R_shunt.",
 analogy:"Measuring wind speed by watching how much a calibrated spring bends—without breaking open the wire every time.",
 why:"Notice the shortcut: mV divided by mΩ cancels 10⁻³ and gives Amperes directly! Always use a differential probe (like Keysight 1169B)—never clip earth ground across a live high-side shunt!",
 example:"55 mV across a 5 mΩ shunt gives I = (55 × 10⁻³) / (5 × 10⁻³) = 11.0 A; multiplied by 0.88 V rail gives P = 9.68 W.",
 formula:"I = V_sense / R_shunt",
 sub:"I = 55e-3 / 5e-3 = 11",
 words:[["Kelvin sensing","4-terminal measurement isolating sense wires from high-current copper losses."],["Differential probe","Measures V_P − V_N without shorting live rails to oscilloscope earth ground."]],
 recap:"I(t) = V_sense(t) / R_shunt; never connect a ground-referenced probe clip to a high-side shunt."
},

/* Topic 16: schematics */
"schematics:Schematic net":{
 plain:"A schematic net name labels all conductors that are electrically connected together—even across different pages of a multi-sheet PCBA schematic.",
 analogy:"Subway line names on a city map: 'Blue Line' at Station 1 connects directly to 'Blue Line' on Page 5.",
 why:"A missing character or typo in a net label (e.g. `UART1_TX` vs `UART_1_TX`) silently breaks connectivity across schematic sheets.",
 example:"Search the PDF/Altium net name `SYS_RESET_N` to trace every pull-up, CPLD output, and test point attached to it.",
 formula:"V_net(page1) = V_net(page5)  (ideal)",
 sub:"R_net < 0.2",
 words:[["Net label","Identifier tying wires across schematic sheets."],["Test point (TP)","Exposed copper pad placed specifically for DMM/scope probing."]],
 recap:"Follow exact net names across schematic sheets to locate safe probe points and upstream sources."
},
"schematics:Ground reference":{
 plain:"PCBAs often split return planes (DGND, AGND, PGND, CHASSIS) joined at single star points; knowing which ground a net uses prevents false noise readings.",
 analogy:"Separate return lanes for trucks (PGND) and bicycles (AGND) meeting only at the main bridge so heavy trucks don't shake bicycles.",
 why:"Clipping your scope probe onto noisy chassis metal while probing a millivolt analog sensor couples massive common-mode switching noise.",
 example:"Trace the local decoupling capacitor ground pad right beside the IC in Cadence Allegro / Altium before soldering probe pigtails.",
 formula:"V_measured = V_signal - V_local_gnd",
 sub:"V_err = I_return * R_trace",
 words:[["Star ground","Single controlled bridge tying quiet analog return to noisy power return."],["Local return","Closest ground pad to the probed signal."]],
 recap:"Always verify which ground net your measurement point references."
},
"schematics:Bring-up checklist":{
 plain:"Safe PCBA bring-up follows a strict order: (1) Microscope visual check, (2) Unpowered DMM rail-to-GND impedance check, (3) Current-limited standby power-on, (4) Power sequence + clocks + reset, (5) SPI/UART boot logs.",
 analogy:"A pilot's pre-flight checklist: inspect wings, check fuel and oil, start engines at idle, verify gauges BEFORE pushing full throttle.",
 why:"Applying an unlimited power supply directly to a brand-new board can vaporize internal PCB layers in 50 milliseconds if a capacitor was placed backwards.",
 example:"Check every rail to GND > 10 Ω (or expected baseline) unpowered before applying current-limited bench power.",
 formula:"R_rail_to_GND >= R_min_safe",
 sub:"I_limit = 1.2 * I_idle_expected",
 words:[["Visual inspection","Checking solder bridges, tombstones, and IC pin-1 orientation under microscope."],["Shorts check","DMM resistance/continuity check from every rail to GND with power OFF."]],
 recap:"Inspect → Ohm-out shorts unpowered → Current-limited power-on → Scope sequence/clocks → Boot."
},
"schematics:Reset and clock":{
 plain:"A processor cannot execute a single line of firmware unless three prerequisites are all healthy: stable VDD rails, ticking reference clock, and clean release of RESET_N.",
 analogy:"A car needs gas (power), spark plugs firing (clock), and the handbrake released (reset release) before it moves.",
 why:"When a brand-new board powers up with perfect DMM rail voltages yet zero UART console output, checking SYS_RESET_N and the crystal oscillator immediately narrows the bug.",
 example:"Probe SYS_RESET_N (must rise above V_IH after rails settle) and crystal clock on an active low-capacitance FET probe.",
 formula:"t_CLK_valid < t_RESET_release",
 sub:"f_osc = 25e6",
 words:[["SYS_RESET_N","Active-low reset: clamped < 0.4 V until power & clocks lock."],["Bootstrap pins","Strapping resistors read on reset release deciding SPI/eMMC/JTAG boot mode."]],
 recap:"Power rails alone aren't enough—verify clock oscillation and clean reset release at the IC pins."
},
"schematics:Fault isolation":{
 plain:"Never blame expensive flight hardware from one failure: run an A-B-A swap using a Known-Good Board (KGB) and Known-Good Setup (KGS) changing ONE variable at a time.",
 analogy:"If a lamp doesn't light, try the bulb in a working lamp (KGS) and try a working bulb (KGB) in your socket before throwing out the lamp.",
 why:"Worn test-fixture pogo pins, a swapped USB/UART node, or an A0 vs B0 firmware image mismatch imitate broken PCBAs constantly.",
 example:"In DRAM qualification, single-lane `0x101` failure stayed with the fixture socket while `0x1FF` saturation across all lanes at −25 °C followed temperature.",
 formula:"Fault_location = A - B - A swap",
 sub:"Follows_DUT => PCBA  |  Stays_in_rack => EGSE",
 words:[["KGB / KGS","Known-Good Board / Known-Good Setup."],["One variable at a time","Change only board, firmware, or cable per trial so root cause is unambiguous."]],
 recap:"Use A-B-A swapping to prove whether the defect follows the DUT or stays with the test rack."
},

/* Topic 17: instruments */
"instruments:Oscilloscope bandwidth":{
 plain:"Oscilloscope analog bandwidth (f_BW) is the frequency where a sine wave drops by −3 dB; pick a scope + probe rated at least 5× higher than your signal's knee frequency f_knee ≈ 0.5 / t_rise.",
 analogy:"A camera with a slow shutter blurs a hummingbird's wings into gray mush—you need fast shutter speed (high bandwidth) to see sharp nanosecond edges.",
 why:"A 100 MHz scope makes a sharp 1 ns digital edge look sluggish (~3.5 ns rise time) and completely hides high-frequency switching spikes.",
 example:"For a 0.35 ns edge: f_knee = 0.5 / (0.35 × 10⁻⁹) = 1.43 GHz ⇒ pick ≥ 2–4 GHz scope/probe.",
 formula:"f_knee = 0.5 / t_rise",
 sub:"f_knee = 0.5 / 0.35e-9 = 1.43e9",
 words:[["t_rise","10% to 90% transition time of a digital edge."],["System BW","Combined bandwidth of scope AND probe together."]],
 recap:"Bandwidth must exceed 5× f_knee (0.5 / t_rise) to measure fast edges and spikes accurately."
},
"instruments:Sample rate":{
 plain:"Sample rate (samples per second, MS/s or GS/s) sets how many discrete time snapshots the scope ADC takes each second.",
 analogy:"Video frame rate: 2 frames per second misses a lightning strike completely; 1,000 frames per second catches every branch.",
 why:"Nyquist requires >2× highest frequency just to avoid aliasing, and practical pulse measurement needs at least 10–20 samples per cycle/pulse.",
 example:"Sampling a 25 MHz clock at 500 MS/s gives N = (500 × 10⁶) / (25 × 10⁶) = 20 samples/cycle.",
 formula:"N_samples = f_sample / f_signal",
 sub:"N = 500e6 / 25e6 = 20",
 words:[["Aliasing","Under-sampling a fast signal so it impersonates a fake slow wave."],["Time/div","Horizontal window = 10 × (time/div) across a 10-division grid."]],
 recap:"Check samples per cycle (f_sample / f_signal) so short glitches aren't missed or aliased."
},
"instruments:Trigger":{
 plain:"The oscilloscope trigger acts as a smart stopwatch telling the scope exactly when to freeze and save a capture—such as on a falling voltage droop or SPI chip-select edge.",
 analogy:"A finish-line photo-finish camera triggered only when a runner crosses the laser beam.",
 why:"Free-running auto trigger scrolls wildly and misses rare one-shot boot glitches; setting a rising/falling edge trigger with 20% pre-trigger captures what happened right BEFORE the crash.",
 example:"Trigger CH3 (current sense) rising above idle baseline with 20% pre-trigger to capture both pre-step baseline and transient V_droop.",
 formula:"t_window = t_div * 10",
 sub:"t_pretrigger = 0.20 * t_window",
 words:[["Pre-trigger","Memory buffer showing signal history BEFORE the trigger event."],["Normal vs Auto","Normal waits strictly for the fault event instead of overwriting the screen."]],
 recap:"Use Normal edge/pulse triggering with pre-trigger memory to freeze intermittent faults."
},
"instruments:Probe loading":{
 plain:"Every probe connects real resistance (e.g., 1 MΩ or 10 MΩ) and capacitance (e.g., 10–15 pF) onto your circuit, plus inductance in its ground wire.",
 analogy:"Checking tire air pressure with a sloppy gauge lets some air hiss out and alters the pressure you were trying to read.",
 why:"Probing a crystal oscillator with a 15 pF passive 1×/10× probe can stop the crystal from oscillating! Use an active FET probe (<1 pF) for clocks and 10× setting matched in the scope.",
 example:"If a 10× probe is plugged in while scope channel attenuation is left at 1×, every reading displays 10× too small!",
 formula:"Z_probe = R_p || (1 / (j * 2 * pi * f * C_p))",
 sub:"V_shown = V_true / 10  (if 10x vs 1x mismatch)",
 words:[["10× setting","Must match between physical probe switch and scope channel menu."],["Active FET probe","Sub-pF capacitance probe for fast clocks and high-impedance nodes."]],
 recap:"Match probe attenuation (1× vs 10×), minimize C_load on clocks, and shorten ground loops."
},
"instruments:DMM versus scope":{
 plain:"A DMM integrates over tens of milliseconds to deliver high-precision DC averages, while an oscilloscope captures microsecond/nanosecond waveforms versus time.",
 analogy:"A DMM tells you average highway speed over an hour (65 mph); an oscilloscope shows the exact moment you braked to 15 mph for 2 seconds.",
 why:"When a rail fails intermittently yet reads '0.900 V OK' on a DMM, only an oscilloscope reveals brief millisecond brownouts.",
 example:"Use DMM for unpowered shorts & precision static DC calibration; use scope for power sequencing, ripple, droop, and serial buses.",
 formula:"V_DMM = (1 / T_int) * V_avg",
 sub:"V_scope_min < V_DMM",
 words:[["Integration window","DMM averaging time (~16–200 ms) that hides fast sub-ms dips."],["High-accuracy scalar","DMM excels at 5.5–6.5 digit steady DC accuracy."]],
 recap:"Use a DMM for steady accuracy and unpowered checks; use a scope for transients, timing, and noise."
},

/* Topic 18: timing */
"timing:Clock period":{
 plain:"A digital clock period T is the exact time between two consecutive rising edges: T = 1 / f.",
 analogy:"Metronome beat spacing: 100 MHz means 100 million beats per second, so each beat lasts 10 nanoseconds.",
 why:"Every setup-time budget starts from clock period T_clk—faster clocks leave less time for combinational logic between flip-flops.",
 example:"A 50 MHz avionics FPGA clock has period T = 1 / (50 × 10⁶) = 20 × 10⁻⁹ s (20 ns).",
 formula:"T = 1 / f",
 sub:"T = 1 / 50e6 = 20e-9",
 words:[["Nanosecond (ns)","10⁻⁹ seconds; light travels only ~15 cm in FR-4 PCB trace per ns!"],["Edge-to-edge","Always measure rising-to-rising (or falling-to-falling) for full period."]],
 recap:"Clock period in nanoseconds equals 1000 divided by frequency in MHz."
},
"timing:Duty cycle":{
 plain:"Duty cycle is the percentage of one full clock period that the signal spends in the logic HIGH state: D = 100 × (t_high / T).",
 analogy:"If a traffic light stays green 4 seconds out of every 10-second cycle, its green duty cycle is 40%.",
 why:"Many high-speed ADC clocks and PWM motor/heater controllers require 45%–55% duty cycle; asymmetry shrinks pulse widths and causes setup misses.",
 example:"A pulse staying HIGH for 4 ns out of an 8 ns period has duty cycle D = 100 × (4 / 8) = 50%.",
 formula:"D = 100 * (t_high / T)",
 sub:"D = 100 * (4e-9 / 8e-9) = 50",
 words:[["t_high","Duration above logic threshold per period."],["PWM","Pulse Width Modulation controlling heater or actuator power via duty cycle."]],
 recap:"Duty cycle = 100 × (t_high / T_period)."
},
"timing:Setup time":{
 plain:"Setup time (t_su) is the minimum time data MUST sit completely stable BEFORE the capturing clock edge arrives.",
 analogy:"Sitting down and fastening your seatbelt at least 10 seconds BEFORE the roller coaster launches.",
 why:"If combinational logic or long trace delay arrives too late and violates setup time, the flip-flop goes metastable. Fix setup violations by slowing the clock (raising T_clk).",
 example:"Required minimum period: T_min = t_CQ,max + t_logic,max + t_su + t_skew = 950 + 590 + 300 + 750 = 2590 ps (f_max = 386.1 MHz).",
 formula:"T_min >= t_CQ_max + t_logic_max + t_su + t_skew",
 sub:"T_min = 950e-12 + 590e-12 + 300e-12 + 750e-12 = 2.59e-9",
 words:[["t_CQ","Clock-to-Q propagation delay through launching flip-flop."],["Setup slack","Margin before clock edge; negative setup slack fails timing."]],
 recap:"Setup checks the NEXT clock edge—slowing clock frequency increases setup margin."
},
"timing:Hold time":{
 plain:"Hold time (t_h) is the minimum time old data MUST remain unchanged AFTER the capturing clock edge fires.",
 analogy:"Staying seated for 2 seconds AFTER the photo shutter clicks so your picture doesn't blur.",
 why:"CRITICAL interview rule: Hold is a SAME-EDGE race! Slowing the clock does NOT fix a hold violation—you must add delay buffers along the fast data/select path!",
 example:"If t_CQ,min (300 ps) + t_logic,min (30 ps) < t_h (400 ps) + t_skew (750 ps), hold slack = 330 − 1150 = −820 ps!",
 formula:"t_CQ_min + t_logic_min >= t_h + t_skew",
 sub:"Slack_hold = (300e-12 + 30e-12) - (400e-12 + 750e-12) = -820e-12",
 words:[["Same-edge race","New data racing through too fast and overwriting old data at the same clock edge."],["Buffer insertion","Adding delay gates on the short data path to restore positive hold slack."]],
 recap:"Hold violations are independent of clock frequency—fix them by adding data-path delay, not slowing the clock."
},
"timing:Reset release":{
 plain:"Active-low SYS_RESET_N must stay clamped LOW (< 0.4 V) until every supply rail passes POWER_GOOD AND the PLL clock locks, plus a safe margin.",
 analogy:"Waiting until the runway is clear AND engines reach full RPM BEFORE releasing wheel brakes.",
 why:"Releasing reset prematurely causes intermittent cold-start boot failures that vanish on warm reboot.",
 example:"If core_pg = 12 ns, io_pg = 28 ns, pll_lock = 48 ns, and margin = 20 ns: earliest release = max(12, 28, 48) + 20 = 68 ns.",
 formula:"t_release = max(t_pg, t_pll) + t_margin",
 sub:"t_release = 48e-9 + 20e-9 = 68e-9",
 words:[["SYS_RESET_N","Suffix _N denotes active-low (0 V holds chip in reset)."],["Supervisor / CPLD","Hardware logic holding reset low until all prerequisites are met."]],
 recap:"Hold reset asserted until the LAST prerequisite (power-good or PLL lock) settles plus required delay."
},

/* Topic 19: buses */
"buses:UART":{
 plain:"UART is an asynchronous 2-wire serial link (TX → RX, RX → TX, plus shared GND) where both sides must agree on baud rate and 8N1 framing beforehand.",
 analogy:"Two people speaking via walkie-talkies with no shared stopwatch—both must talk at the exact same speed (baud) or words turn into gibberish.",
 why:"Every flight computer boot log and Linux console uses UART. Garbled text almost always means baud mismatch, swapped TX/RX, or 1.8 V vs 3.3 V logic mismatch.",
 example:"8N1 uses 1 start + 8 data + 1 stop = 10 bits/byte. At 115200 baud, 100 bytes take t = (100 × 10) / 115200 = 8.68 × 10⁻³ s (8.68 ms).",
 formula:"t_uart = (N_bytes * 10) / Baud",
 sub:"t_uart = (100 * 10) / 115200 = 8.68e-3",
 words:[["8N1","8 data bits, No parity, 1 stop bit = 10 wire bits per byte."],["Crossover","Board TX connects to adapter RX, and board RX connects to adapter TX."]],
 recap:"Check TX/RX crossover, common GND, voltage level, and 10-bit/byte baud timing first."
},
"buses:SPI":{
 plain:"SPI is a synchronous 4-wire high-speed bus with Master Out (MOSI), Master In (MISO), explicit Clock (SCLK), and active-low Chip Select (CS_N).",
 analogy:"A conductor waving a baton (SCLK) while handing notes (MOSI) and receiving notes (MISO) from whichever musician's name card (CS_N) is raised.",
 why:"Unlike UART, SPI transfers 8 bits per byte (no start/stop overhead), but wrong clock polarity/phase (CPOL/CPHA) samples right on changing edges and corrupts every read.",
 example:"Transferring 32 bytes at 8 MHz SCLK takes ideally t = (8 × 32) / (8 × 10⁶) = 32 × 10⁻⁶ s (32 µs).",
 formula:"t_spi = (8 * N_bytes) / f_SCLK",
 sub:"t_spi = (8 * 32) / 8e6 = 32e-6",
 words:[["CS_N","Active-low chip select enabling one target slave IC per transfer."],["CPOL / CPHA","SPI clock idle level and sampling edge phase (Modes 0..3)."]],
 recap:"Capture CS_N, SCLK, MOSI, and MISO together on a 4-channel scope or Saleae logic analyzer."
},
"buses:I2C":{
 plain:"I²C is a 2-wire shared multi-device bus (SDA data, SCL clock) using open-drain drivers that pull LOW and rely on external pull-up resistors to rise HIGH.",
 analogy:"A shared conference line where anyone can pull the microphone mute button DOWN to talk, and a spring lifts it back UP when everyone lets go.",
 why:"If ONE faulty sensor holds SDA stuck low, the entire I²C bus freezes! Check idle DC voltage (must sit near V_CC) and RC rise time.",
 example:"100 kHz standard mode or 400 kHz fast mode requires smaller pull-ups (e.g., 2.2 kΩ vs 10 kΩ) to charge bus capacitance quickly.",
 formula:"t_rise = 0.8473 * R_pullup * C_bus",
 sub:"t_rise = 0.8473 * 2.2e3 * 100e-12 = 186e-9",
 words:[["ACK bit","9th clock cycle where receiver pulls SDA low to confirm receipt."],["Stuck-low bus","Single shorted/hung slave clamping SDA or SCL to 0 V."]],
 recap:"I²C relies on pull-ups to rise; isolate devices one by one if SDA or SCL stays stuck low."
},
"buses:CAN":{
 plain:"CAN is a rugged differential 2-wire bus (CAN_H, CAN_L) that cancels common-mode noise and requires two 120 Ω termination resistors at the physical ends (60 Ω parallel unpowered).",
 analogy:"Two tug-of-war ropes measuring the DIFFERENCE in tension—shaking both ropes together by the same wind cancels out!",
 why:"Spacecraft harnesses and propulsion controllers use CAN; forgetting one 120 Ω terminator (reads 120 Ω instead of 60 Ω) or adding a third (reads 40 Ω) causes ringing and bus errors.",
 example:"Two 120 Ω terminators in parallel give R_CAN = (120 × 120)/(120 + 120) = 60 Ω measured unpowered between CAN_H and CAN_L.",
 formula:"R_CAN_total = (120 * 120) / (120 + 120)",
 sub:"R_CAN = 60",
 words:[["Differential","Data encoded in V_CANH − V_CANL (≈2 V dominant, 0 V recessive)."],["60 Ω check","Fastest unpowered DMM diagnostic confirming both 120 Ω end terminators."]],
 recap:"Unpowered CAN_H to CAN_L should measure ~60 Ω (two 120 Ω terminators in parallel)."
},
"buses:Physical versus protocol":{
 plain:"Digital protocol decoding in software only works AFTER the physical electrical layer delivers clean voltage levels, edges, and termination.",
 analogy:"Before debugging grammar mistakes in a phone transcript, verify the microphone wasn't unplugged and static didn't drown out the voice.",
 why:"Never waste hours modifying Python or firmware drivers before scoping the actual pin waveforms at the receiver.",
 example:"Probe right at the receiver pin for voltage swing (V_IH/V_IL), bit width (1/baud), and monotonic edges before blaming software.",
 formula:"t_bit = 1 / f_baud",
 sub:"t_bit = 1 / 115200 = 8.68e-6",
 words:[["Physical layer","Volts, rise times, pull-ups, termination, and wiring continuity."],["Protocol layer","Start bits, addresses, CRC checksums, and command payloads."]],
 recap:"Verify clean physical waveforms at the receiver pin before debugging firmware protocol logic."
},

/* Topic 20: python-scpi */
"python-scpi:SCPI commands":{
 plain:"SCPI (Standard Commands for Programmable Instruments) is a standard ASCII text command language understood by Keysight, Tektronix, Chroma, and Rohde & Schwarz instruments.",
 analogy:"Universal restaurant phrases like `*IDN?` ('Who are you?') and `MEAS:VOLT:DC?` ('Measure DC volts') that work across almost every lab instrument brand.",
 why:"Every automated test script should query `*IDN?` at startup to verify the right calibrated instrument model and serial number are connected.",
 example:"Send `*IDN?` and `MEAS:VOLT:DC?` over PyVISA and parse the returned floating-point string.",
 formula:"t_throughput = 3600 / t_board",
 sub:"N_hour = 3600 / 30 = 120",
 words:[["*IDN?","Mandatory SCPI identity query returning Manufacturer,Model,Serial,Firmware."],["Query (?)","Commands ending in `?` tell the instrument to send a reply back."]],
 recap:"Query `*IDN?` first and configure timeouts/terminators cleanly in SCPI test scripts."
},
"python-scpi:VISA transport":{
 plain:"VISA (implemented in Python via `pyvisa`) provides a single software API that talks to instruments identically whether connected over Ethernet (TCPIP/LXI), USB (USB-TMC), or GPIB.",
 analogy:"A universal power adapter letting your Python script plug into any bench instrument regardless of whether the cable is Ethernet or USB.",
 why:"Using static Ethernet IP addresses or persistent VISA resource strings prevents test racks from failing when USB ports renumber after a reboot.",
 example:"`rm = pyvisa.ResourceManager(); dmm = rm.open_resource('TCPIP0::192.168.1.50::inst0::INSTR'); dmm.timeout = 5000`.",
 formula:"t_timeout > t_sweep + t_settling",
 sub:"timeout = 5000e-3",
 words:[["TCPIP::LXI","Ethernet-based instrument control—most reliable for production test racks."],["Timeout","Milliseconds before PyVISA raises VisaIOError instead of hanging forever."]],
 recap:"Prefer Ethernet/LXI or persistent resource IDs with explicit timeouts in PyVISA."
},
"python-scpi:Test assertion":{
 plain:"An automated test assertion compares a finite measured value against documented min/max acceptance limits and records the value, limits, and units.",
 analogy:"A go/no-go gauge on an assembly line: both too small and too large fail, and you record the exact caliper measurement either way.",
 why:"Compare limits using `if not (v_min <= val <= v_max)` AND reject `NaN`/`inf` (`math.isfinite(val)`), because in Python `NaN <= 5.0` evaluates `False`—careless code can let `NaN` pass!",
 example:"If max accepted current is 10 A and measured is 8 A, margin = 100 × (10 − 8)/10 = 20%.",
 formula:"Margin_pct = 100 * (Limit - Measured) / Limit",
 sub:"Margin_pct = 100 * (10 - 8) / 10 = 20",
 words:[["math.isfinite","Must verify every measurement is a real finite number before grading."],["Go/No-Go","Pass/fail decision backed by numerical limits and logged evidence."]],
 recap:"Verify `math.isfinite(val)` and log raw reading, min/max limits, and units on every assertion."
},
"python-scpi:Retry policy":{
 plain:"A hardware retry loop may handle transient serial/VISA dropouts up to N attempts, but MUST preserve and log every failing attempt rather than hiding intermittent hardware faults.",
 analogy:"If a car fails to start on turns 1 and 2 and starts on turn 3, hiding the first two failures sells a faulty starter motor to the customer.",
 why:"Muon flight hardware cannot tolerate 'retry until it passes' masking an intermittent solder joint—save every raw attempt with timestamps.",
 example:"Loop `for attempt in range(1, 4):`, log each attempt's response/exception, and flag intermittent retries for engineering review.",
 formula:"Failure_rate = N_fail_attempts / N_total_attempts",
 sub:"Rate = (2 / 100) * 100 = 2",
 words:[["Intermittent","Most dangerous aerospace defect—must never be erased by silent retries."],["Audit trail","Permanent record of every measurement attempt and DUT serial."]],
 recap:"Retries may improve station robustness only if every failed attempt remains logged and traceable."
},
"python-scpi:Exception handling":{
 plain:"Safe test automation catches VISA timeouts, `SerialException`, and `ValueError`, safely turns off/current-limits DUT supplies, and reports INFRASTRUCTURE_ERROR instead of a false pass or false DUT defect.",
 analogy:"A smoke alarm losing battery power should flash 'FAULT', never stay silent and claim 'NO FIRE'.",
 why:"A loose USB cable during an automated thermal run must abort safely and log the rack fault without corrupting board yield statistics.",
 example:"Wrap measurement loops in `try...except (pyvisa.VisaIOError, serial.SerialException) as e:` with a `finally:` block disabling power outputs.",
 formula:"Status = PASS | FAIL_DUT | ERROR_STATION",
 sub:"try { measure() } finally { supply_off() }",
 words:[["Safe state","Turning power outputs OFF in a `finally:` block when scripts crash."],["Station vs DUT","Separating rack cable/timeout errors from true flight hardware failures."]],
 recap:"Always catch communication exceptions, power down safely in `finally`, and never mask station faults as passes."
},

/* Topic 21: linux */
"linux:Serial logs":{
 plain:"UART/serial console logs capture timestamped bootloader, kernel, and self-test messages straight from the flight processor during power-on and thermal stress.",
 analogy:"An airplane's cockpit black-box transcript recording every warning chime and fault code line by line.",
 why:"Never rely on 'board looks hung'—connect via `/dev/serial/by-id/` at the right baud rate and capture full raw logs from power-on.",
 example:"`ls -l /dev/serial/by-id/` maps hardware adapters persistently even when USB plugs reconnect as `/dev/ttyUSB1` instead of `/dev/ttyUSB0`.",
 formula:"t_loop_min = (N_runs * t_sec) / 60",
 sub:"t_min = (100 * 15) / 60 = 25",
 words:[["/dev/serial/by-id/","Static symlink tied to USB adapter hardware serial."],["dmesg -T","Kernel ring buffer showing USB disconnect or PCIe errors with timestamps."]],
 recap:"Always use `/dev/serial/by-id/` and capture complete timestamped UART boot logs."
},
"linux:grep and filters":{
 plain:"Command-line filters like `grep -inE 'error|fail|assert|timeout'` scan gigabytes of raw console logs in milliseconds to extract every anomaly line and its surrounding lines (`-C 3`).",
 analogy:"Using a metal detector over a sandy beach instead of sifting grain by grain by hand.",
 why:"Case-sensitive `grep ERROR` silently misses `Error:` or `Fail count: 2`! Always use `-i` (case-insensitive) and inspect raw counts.",
 example:"`grep -inEC 2 'fail|error|assert|mismatch' uart_run.log` shows matching line numbers plus 2 lines of context.",
 formula:"Fail_pct = 100 * (N_fail / N_total)",
 sub:"Fail_pct = 100 * (2 / 80) = 2.5",
 words:[["-i / -n / -E","Case-insensitive, print line numbers, extended regex OR (`|`)."],["-C 3","Print 3 lines before/after each match for root-cause context."]],
 recap:"Use `grep -inE` with context lines so capitalization differences never hide hardware failures."
},
"linux:Exit codes":{
 plain:"Every Linux command returns a hidden numeric exit code (`$?`): `0` means success, and `1..255` means failure.",
 analogy:"A silent thumbs-up (0) or error code slip (non-zero) handed back to the test orchestrator when a sub-program finishes.",
 why:"A Bash pipe like `run_test | tee log.txt` masks failures because `tee` exits `0`! Always enable `set -euo pipefail` in Bash automation.",
 example:"Check `echo $?` after any flash or test command, and keep `set -o pipefail` at the top of automation scripts.",
 formula:"Exit_code = 0 (PASS)  |  != 0 (FAIL)",
 sub:"set -euo pipefail",
 words:[["pipefail","Bash option ensuring a pipeline fails if ANY command inside it fails."],["stderr (2)","Error stream that should be logged alongside stdout (`2>&1`)."]],
 recap:"Always check exit codes and set `pipefail` so piped logs never mask failing tests."
},
"linux:Version control":{
 plain:"Configuration control records the exact Git commit hash, firmware `sha256sum`, test-limit version, and instrument calibration ID alongside every test result.",
 analogy:"Recording exact recipe version, oven temperature, and ingredient lot number on a batch of flight medicine.",
 why:"In your Google validation experience, an A0 bootloader flashed onto B0 silicon caused an immediate BL2 assert—`sha256sum` catches binary mismatches instantly.",
 example:"Run `sha256sum -c approved.sha256` before flashing and log `git rev-parse HEAD` in every CSV header.",
 formula:"sha256(image_actual) == sha256(image_released)",
 sub:"git_commit + fw_sha256 + dut_serial",
 words:[["sha256sum","Cryptographic fingerprint proving a binary matches the released file bit-for-bit."],["Git commit","Exact 40-char revision of test script used during qualification."]],
 recap:"Tie every qualification dataset to exact Git commit, firmware hash, and board serial."
},
"linux:Raw versus summary":{
 plain:"Never accept an automated PASS summary banner without verifying that the post-processing script handles every failure condition properly.",
 analogy:"A restaurant health sign saying 'A' taped over an inspection log listing 2 violations—always read the raw inspection log.",
 why:"In real DRAM qualification, a script bug printed `'No fail directories needed'` even though raw logs showed `Pass count: 0, Fail count: 2`! Always audit failure-latching logic.",
 example:"Write unit tests injecting synthetic failures (`Fail count: 2`, `ASSERT`, `NaN`) into your log parser to prove it flags NO-GO.",
 formula:"Verdict = FAIL  if  (N_fail > 0) OR (N_pass == 0)",
 sub:"Pass:0, Fail:2 => NO-GO (Mirrored)",
 words:[["Failure latching","Once any failure occurs, overall verdict latches to FAIL and cannot be cleared."],["False clean","Worst possible test bug—reporting PASS on failing hardware."]],
 recap:"Verify raw logs against automated summaries and unit-test parser failure latching."
},

/* Topic 22: rf */
"rf:Spectrum analyzer":{
 plain:"A spectrum analyzer plots signal power (usually in dBm) across frequency (Hz to GHz), revealing carriers, harmonics (2f, 3f), and unwanted spurs.",
 analogy:"A musical equalizer or optical prism breaking a chord into its individual pure notes so you see unwanted buzzes.",
 why:"A broadband RF power meter sums everything together—only a spectrum analyzer proves whether an amplifier is clean or blasting illegal harmonics.",
 example:"Set Center Frequency, Span, Resolution Bandwidth (RBW), and Reference Level (with protective attenuator!) before connecting an active transmitter.",
 formula:"P_dBm = 10 * log10(P_mW / 1 mW)",
 sub:"0 dBm = 10^(-3) W",
 words:[["dBm","Power referenced to 1 milliwatt (0 dBm = 1 mW, +30 dBm = 1 W)."],["Spur / harmonic","Unwanted signal spikes at multiples or mixing products of the carrier."]],
 recap:"Use external attenuation and proper span/RBW on a spectrum analyzer to inspect carriers and spurs safely."
},
"rf:Vector network analyzer":{
 plain:"A Vector Network Analyzer (VNA) sends known RF waves into a network and measures both reflected (S11) and transmitted (S21) amplitude AND phase across frequency.",
 analogy:"Shining a flashlight at a window and measuring both how much light bounces back (S11) and how much passes through (S21).",
 why:"Before measuring a satellite RF front-end or coax harness, you MUST calibrate the VNA (SOLT: Short-Open-Load-Thru) right at the DUT connector plane.",
 example:"Swapping coax cables without re-calibrating moves the reference plane and ruins S11 return-loss accuracy.",
 formula:"S21_dB = 10 * log10(P_transmitted / P_incident)",
 sub:"Loss_dB = -S21_dB",
 words:[["S11","Port 1 reflection coefficient (return loss)."],["S21","Forward transmission gain or cable insertion loss."],["SOLT cal","Calibrating out test cables right up to the DUT port."]],
 recap:"Calibrate the VNA at the DUT reference plane before measuring S11 or S21."
},
"rf:S11 return loss":{
 plain:"S11 measures how much RF energy bounces backward off a mismatched antenna or board port instead of entering the load.",
 analogy:"Ocean waves hitting a seawall bounce back (poor S11 = near 0 dB); waves entering a harbor smoothly barely reflect (good S11 ≤ −15 dB).",
 why:"If antenna impedance doesn't match 50 Ω coax, reflected power heats the PA and shrinks satellite link margin.",
 example:"An S11 of −10 dB means 10% of power reflects back; −20 dB means only 1% reflects (99% delivered!).",
 formula:"Gamma = (Z_L - Z_0) / (Z_L + Z_0)",
 sub:"S11_dB = 20 * log10(|Gamma|)",
 words:[["Z₀ = 50 Ω","Standard RF transmission-line characteristic impedance."],["VSWR","Standing wave ratio derived from |Γ|."]],
 recap:"More negative S11 dB (e.g., −20 dB vs −3 dB) means better 50 Ω impedance matching and less reflected power."
},
"rf:dB power ratio":{
 plain:"Decibels (dB) express power ratios on a base-10 log scale: G_dB = 10 · log₁₀(P_out / P_in), turning huge multiplications/divisions into simple additions.",
 analogy:"Every +10 dB multiplies power by 10×; every −10 dB divides power by 10×; +3 dB doubles power; −3 dB halves power.",
 why:"Link budgets and cable losses chain cleanly in dB: +20 dB PA gain − 3 dB cable loss = +17 dB net gain.",
 example:"Output power 20× larger than input power gives G_dB = 10 × log₁₀(20) = 13.01 dB.",
 formula:"G_dB = 10 * log10(P_out / P_in)",
 sub:"G_dB = 10 * log10(20) = 13.01",
 words:[["+3 dB","2× power (or 1.414× voltage at equal Z)."],["+10 dB / +20 dB","10× power / 100× power."]],
 recap:"Use 10·log₁₀(P_out/P_in) for power ratios; remember +3 dB = 2× and +10 dB = 10× power."
},
"rf:Wavelength":{
 plain:"Free-space wavelength (λ) equals the speed of light c ≈ 3 × 10⁸ m/s divided by frequency f: higher frequency means shorter waves.",
 analogy:"A fast-shaking jump rope makes short ripples; a slow-shaking rope makes long waves.",
 why:"Whenever a PCB trace exceeds ~1/10th to 1/4th of a wavelength (or edge rise distance ℓ_crit), it behaves as a transmission line needing 50 Ω termination!",
 example:"At f = 2.4 GHz (2.4 × 10⁹ Hz): λ = (3 × 10⁸) / (2.4 × 10⁹) = 0.125 m (12.5 cm).",
 formula:"lambda = c / f",
 sub:"lambda = (3 * 10^8) / (2.4 * 10^9) = 0.125",
 words:[["c ≈ 3 × 10⁸ m/s","Free-space speed of light; slower inside FR-4 PCB (~1.5 × 10⁸ m/s)."],["λ/4","Quarter-wavelength resonant stub size."]],
 recap:"λ = c / f; higher GHz frequencies mean centimeter/millimeter wavelengths."
},

/* Topic 23: qualification */
"qualification:Verification":{
 plain:"Verification asks: 'Did we build the avionics board strictly to its electrical specifications?' Every requirement maps to a test procedure and measurable limit.",
 analogy:"Checking every item on a house blueprint with a tape measure: are all doors 36 inches wide and outlets 120 V?",
 why:"Measuring 3.3 V ± 2% ripple < 30 mV against the hardware spec sheet is verification.",
 formula:"Measured_min <= Spec_max - Guardband",
 sub:"Margin_pct = 100 * (10 - 9) / 10 = 10",
 words:[["Requirement traceability","Linking every pass/fail assertion directly to a spec ID."],["Acceptance criteria","Exact numerical boundaries required to pass."]],
 recap:"Verification proves hardware meets its written engineering specifications."
},
"qualification:Validation":{
 plain:"Validation asks: 'Does the integrated flight system actually accomplish the real orbital mission?'",
 analogy:"Even after passing blueprint measurements (verification), driving the car across steep hills and rainstorms proves it works for the real road trip (validation).",
 why:"An avionics board can pass individual bench verification yet fail mission validation when a payload burst causes thermal drift in a flatsat HITL run.",
 example:"Running real FireSat imaging workloads on the HITL testbed with simulated orbital eclipse power cycles validates the full system.",
 formula:"HITL_mission_scenario == Pass_all_subsystems",
 sub:"Power + Thermal + FSW + Payload => Validated",
 words:[["HITL / Flatsat","Hardware-in-the-Loop bench integrating flight computer, power, and payload."],["Mission profile","Realistic orbital sunlight/eclipse duty cycles."]],
 recap:"Validation confirms the integrated hardware performs its intended real-world mission."
},
"qualification:TVAC test":{
 plain:"Thermal Vacuum (TVAC) testing operates flight hardware under hard vacuum across hot and cold orbital plateaus—without air, convection vanishes and parts run hotter or outgas.",
 analogy:"Baking cookies in a vacuum chamber instead of a fan-forced convection oven: hot spots get much hotter without moving air to carry heat away.",
 why:"Real Muon Space interview favorite! If a unit passes an ambient thermal chamber (+85 °C) yet fails in TVAC, look for loss of convection cooling (local component overheating), vacuum outgassing/corona, or vacuum feedthrough harness issues.",
 example:"Correlate chamber pressure, thermocouple temps on hot ICs, current draw, and telemetry timestamps to isolate pump-down vs thermal soak failures.",
 formula:"Q_rad = epsilon * sigma * A * (T_hw^4 - T_wall^4)",
 sub:"No convection in vacuum => Delta_T_local rises",
 words:[["Convection loss","No air cooling in vacuum—heat moves ONLY by PCB conduction and radiation."],["Outgassing","Trapped volatile gases venting in vacuum and risking high-voltage arc/corona."]],
 recap:"In TVAC, vacuum eliminates air convection, exposes thermal-conduction defects, and triggers outgassing/corona."
},
"qualification:Configuration control":{
 plain:"Configuration control tracks the exact hardware serial number, rework ECO status, firmware hash, test script Git commit, and instrument calibration expiration for every test run.",
 analogy:"Aviation maintenance logbooks—you never certify an engine without knowing which bolts, software, and calibrated torque wrench touched it.",
 why:"A passing test run executed with unapproved debug firmware or an expired DMM calibration sticker cannot sign off a flight unit.",
 example:"Require automated script startup checks to record `git rev-parse HEAD`, `fw_sha256`, `dut_serial`, and `*IDN?` into the run report.",
 formula:"Config_ID = {HW_rev, Serial, FW_hash, Git_SHA, Cal_due}",
 sub:"Any mismatch => Invalid qualification evidence",
 words:[["ECO","Engineering Change Order documenting board rework."],["Traceability","Ability to reconstruct exact hardware/software/instrument state months later."]],
 recap:"Never release flight hardware from tests with missing serials, unapproved firmware, or expired calibrations."
},
"qualification:Go or no-go":{
 plain:"A Go/No-Go acceptance decision formally releases or rejects flight hardware based strictly on complete, reproducible, calibrated evidence—never wishful thinking.",
 analogy:"Launch control Go/No-Go poll: every station must confirm green telemetry with data; a missing sensor is an automatic NO-GO, never a guess.",
 why:"Muon Space specifically hires avionics test engineers to make independent Go/No-Go calls. First-Pass Yield FPY = 100 × (N_first_pass / N_tested).",
 example:"If 19 of 20 newly manufactured boards pass first acceptance, FPY = 100 × (19 / 20) = 95%, and the 1 failing unit gets an anomaly disposition.",
 formula:"FPY_pct = 100 * (N_first_pass / N_tested)",
 sub:"FPY_pct = 100 * (19 / 20) = 95",
 words:[["FPY","First-Pass Yield—percentage passing initial acceptance without rework."],["Anomaly disposition","Formal root-cause investigation before any unit can be retested or waived."]],
 recap:"Base every Go/No-Go decision on calibrated, complete data—missing or intermittent evidence is NO-GO."
}
};

// Expose both "topic:Skill" and bare "Skill" keys for backward compatibility
const special={};
for(const [k,v] of Object.entries(rawDeep)){
 special[k]=v;
 const shortKey=k.includes(":")?k.split(":").slice(1).join(":"):k;
 if(!special[shortKey])special[shortKey]=v;
}
window.AVIONICS_CONCEPT_DEEP_DIVE=special;
})();
