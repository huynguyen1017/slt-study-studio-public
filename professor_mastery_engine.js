"use strict";
/* Professor Mastery Engine v1.0
   Transforms BOTH "Avionics EE Practice" (#avionicsView) and "NVIDIA SLT Engineer" (#nvidiaView)
   into a ground-up, zero-prerequisite Electrical & Computer Engineering Professor curriculum.
   Covers: Tech 60 (DC/AC/Bridges/Thevenin/AC), Electronic Devices (PN/Rectifiers/Zener/BJT),
   Tech 63 (Digital/Pulse/IEEE754/DeMorgan/K-Map/Combinational), Physics 2B (RC+10M DMM),
   ENGR 852 (Setup/Hold STA, casex E=D, 8/16-bit SAD), Muon Space 141-Q, and NVIDIA SLT 253-Box Master Guide. */
(function(){

const esc = x => String(x ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = x => {
  if (!Number.isFinite(x)) return String(x);
  if (Math.abs(x) > 0 && Math.abs(x) < 0.0001) return Number(x).toExponential(3);
  return Number(Number(x).toPrecision(5)).toString();
};
const rich = x => window.studyMathText ? window.studyMathText(String(x ?? "")) : esc(x);
const eq = x => window.studyMath ? window.studyMath(x, true) : '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mtext>'+esc(x)+'</mtext></math>';
const engVal = (x, u) => window.formatEngineeringMath ? window.formatEngineeringMath(x, u) : esc(fmt(x) + " " + u);

/* ============================================================================
   1. UNIVERSAL PREFIX & UNIT CONVERSION INSPECTOR (Tech 60 Ch. 1 Foundation)
   ============================================================================ */
const PREFIX_MAP = {
  p: { name: "pico", exp: -12, mult: "10⁻¹² (0.000000000001)" },
  n: { name: "nano", exp: -9,  mult: "10⁻⁹ (0.000000001)" },
  "µ": { name: "micro", exp: -6, mult: "10⁻⁶ (0.000001)" },
  u: { name: "micro", exp: -6, mult: "10⁻⁶ (0.000001)" },
  m: { name: "milli", exp: -3, mult: "10⁻³ (0.001)" },
  k: { name: "kilo", exp: 3,   mult: "10³ (1,000)" },
  M: { name: "mega", exp: 6,   mult: "10⁶ (1,000,000)" },
  G: { name: "giga", exp: 9,   mult: "10⁹ (1,000,000,000)" },
  T: { name: "tera", exp: 12,  mult: "10¹²" }
};

function parseGivenQuantities(text) {
  const regex = /(\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(pF|nF|µF|uF|mF|F|pH|nH|µH|uH|mH|H|ps|ns|µs|us|ms|s|mV|kV|V|µA|uA|mA|A|mW|kW|MW|W|mΩ|kΩ|MΩ|Ω|Hz|kHz|MHz|GHz|mJ|µJ|J|C|dB|MiB|GiB|GB\/s|MT\/s|GT\/s|%)/g;
  const seen = new Set();
  const list = [];
  let m;
  while ((m = regex.exec(String(text || ""))) !== null) {
    const num = Number(m[1]);
    const unitStr = m[2];
    const key = m[1] + " " + unitStr;
    if (seen.has(key)) continue;
    seen.add(key);
    let prefixChar = "";
    let baseUnit = unitStr;
    if (unitStr.length >= 2 && PREFIX_MAP[unitStr[0]] && !["MiB","GiB","MT/s","Hz","dB"].includes(unitStr)) {
      prefixChar = unitStr[0];
      baseUnit = unitStr.slice(1);
    }
    const pInfo = prefixChar ? PREFIX_MAP[prefixChar] : null;
    const baseVal = pInfo ? Number((num * Math.pow(10, pInfo.exp)).toPrecision(6)) : num;
    list.push({
      raw: key,
      num,
      unitStr,
      prefixChar,
      prefixName: pInfo ? pInfo.name : "base SI",
      exp: pInfo ? pInfo.exp : 0,
      baseUnit,
      baseVal
    });
  }
  return list.slice(0, 8);
}

function buildConversionExplanation(text) {
  const items = parseGivenQuantities(text);
  if (!items.length) return "Read the problem text carefully and keep every quantity's unit attached (V, A, Ω, F, H, s, Hz).";
  return items.map(it => {
    if (!it.prefixChar) return `${it.raw} is already in base unit (${it.baseUnit}).`;
    return `${it.raw} → prefix '${it.prefixChar}' (${it.prefixName}) = 10^(${it.exp}), so ${it.num} × 10^(${it.exp}) = ${fmt(it.baseVal)} ${it.baseUnit}`;
  }).join(" | ");
}

/* ============================================================================
   2. AVIONICS 23-TOPIC PROFESSOR LECTURE LIBRARY (Zero-to-One Physical Intuition)
   ============================================================================ */
const TOPIC_PROFESSOR_NOTES = {
  units: {
    intuition: "Electrical engineering begins with counting electrons and scaling powers of 10 in steps of 3 (engineering notation: 10^(3n)). One coulomb (C) is 6.25 × 10¹⁸ electrons; 1 ampere (A) is 1 coulomb passing a point every second (I = Q/t); 1 volt (V) is 1 joule of energy pushing each coulomb (V = W/Q).",
    lawWhy: "Only one SI base unit is electrical: the ampere (A). Every other unit—volt, ohm, watt, farad, henry, hertz—is built algebraically from {m, kg, s, A}. Always convert prefixes (p=10⁻¹², n=10⁻⁹, µ=10⁻⁶, m=10⁻³, k=10³, M=10⁶, G=10⁹) BEFORE multiplying or dividing.",
    trap: "Dividing by milli (10⁻³) multiplies by 10³ (1000×), NOT 0.001×! Example: 5 V / 2 mA = 5 / (2 × 10⁻³) = 2.5 × 10³ Ω = 2.5 kΩ."
  },
  ohm: {
    intuition: "Think of a closed water loop with a pump, pipes, and a narrow valve: Voltage V is the pump pressure pushing electrons between TWO nodes, Current I is the flow rate through a wire (same everywhere in a single path), and Resistance R is the friction opposing flow (converting electrical work into I²R heat).",
    lawWhy: "Georg Ohm observed that in a linear resistor, doubling pressure V doubles flow I (I = V/R), while doubling opposition R cuts flow in half. Multiplying V = I·R in base units (V, A, Ω) always closes the triangle.",
    trap: "Never touch a DMM in Resistance (Ω) mode to a powered PCB! The DMM injects its own tiny test current; external circuit voltage corrupts the reading and can blow the fuse. Also remember Voltage is ACROSS two points, Current is THROUGH one broken branch."
  },
  power: {
    intuition: "Electrical power P (watts, J/s) is the rate electrons transfer energy into heat, light, or mechanical work. Even a tiny 5 V rail driving 10 A dissipates 50 W—enough to desolder an undersized resistor!",
    lawWhy: "Combining P = V·I with Ohm's Law (V = I·R) gives three equivalent forms: P = V·I (known rail V & I), P = I²R (series loop where current I is shared), and P = V²/R (parallel branch where voltage V is shared). Always size component wattage ≥ 2× expected worst-case P.",
    trap: "Mismatched prefixes cause 1,000× errors: mV × mA = µW (10⁻⁶ W), while V × mA = mW (10⁻³ W). Check resistor power ratings (1/8 W, 1/4 W, 1/2 W, 1 W) before powering up."
  },
  series: {
    intuition: "In a series chain (christmas-light rule), there is only ONE conductive path for charge: every electron leaving the supply flows identically through R₁, then R₂, then R₃. Because energy is conserved around a closed loop, supply voltage divides proportionally to each resistor's share of R_T.",
    lawWhy: "R_T = R₁ + R₂ + ... + R_N. By KVL, sum of drops equals V_S, giving the Voltage Divider Equation V_x = V_S · (R_x / R_T). When an external load R_L or DMM connects across R_2, R_2 is replaced by R₂∥R_L, pulling the midpoint voltage DOWN.",
    trap: "Never apply the unloaded divider formula V_S · R₂/(R₁+R₂) when an ADC pin, LED, or low-Z instrument loads the node—and never apply 0 Ω assuming ideal wire when checking high current paths."
  },
  parallel: {
    intuition: "Think of multi-lane tollbooths on a highway: every branch connects across the exact same two copper nodes (so V is identical across every branch!), while total current splits inversely with branch resistance. Adding another parallel branch ALWAYS lowers total resistance below the smallest single branch.",
    lawWhy: "Conductances add in parallel: 1/R_eq = 1/R₁ + 1/R₂ + ... + 1/R_N. Total supply current obeys KCL (I_T = I₁ + I₂ + ...). A single 0 Ω short across any parallel branch collapses node voltage toward 0 V and masks open resistors—you must clear shorts before counting opens!",
    trap: "In parallel, one 0 Ω shorted resistor drags the whole bank to ~0 Ω and steals all current; an open resistor simply subtracts 1/R from 1/R_eq. Never use a 2-wire DMM (≈0.24 Ω leads) on milliohm arrays—use 4-wire Kelvin sensing."
  },
  "kcl-kvl": {
    intuition: "Kirchhoff's two laws are charge conservation and energy conservation. KCL (Current Law): water entering a pipe tee equals water leaving it (Σ I_in = Σ I_out). KVL (Voltage Law): climbing up and down hills in a round-trip hike returns you to zero net altitude change (Σ V_closed_loop = 0).",
    lawWhy: "Combined with Thevenin (one voltage source V_TH + series R_TH), Norton (I_N ∥ R_N), and Superposition (one independent source active at a time: zero V-sources as shorts, zero I-sources as opens), KCL/KVL solve ANY multi-loop network systematically.",
    trap: "Assign passive sign convention consistently: current entering the (+) terminal marks a power absorber (drop), leaving (+) marks a source (rise). For Superposition, NEVER sum powers directly—sum individual currents or voltages first, then compute P = I²R."
  },
  capacitors: {
    intuition: "A capacitor is two metal plates separated by an insulator (dielectric). Charge +Q on one plate attracts −Q on the other, storing energy in an ELECTRIC FIELD E. Because charge cannot teleport instantaneously, voltage across a capacitor CANNOT change instantaneously.",
    lawWhy: "Q = C·V and i_C(t) = C · (dV/dt). At DC steady state (dV/dt = 0), an ideal capacitor acts as an OPEN circuit (X_C → ∞). At high frequency f, X_C = 1/(2πfC) drops toward 0 Ω—making decoupling caps short high-frequency switching noise to ground.",
    trap: "Capacitors in SERIES combine like parallel resistors (C_eq = C₁C₂/(C₁+C₂)), while capacitors in PARALLEL add directly (C_eq = C₁+C₂)—the exact opposite of resistors!"
  },
  inductors: {
    intuition: "An inductor is a coil of wire that stores energy in a MAGNETIC FIELD Φ when current flows through it. Like a heavy flywheel, an inductor resists sudden changes in CURRENT (Lenz's Law: v_L = L · di/dt).",
    lawWhy: "Breaking an inductive load circuit instantaneously causes di/dt → −∞, creating huge voltage spikes (flyback kick) unless a freewheeling diode gives current a safe decay path. At AC frequency f, inductive reactance X_L = 2πfL increases with frequency.",
    trap: "Package bondwire and PCB trace inductance L_pkg cause ground bounce and V_droop = L·(di/dt) during multi-amp GPU/SoC step loads. Always place decoupling capacitors with minimal loop area right at IC pins."
  },
  rc: {
    intuition: "When a capacitor charges or discharges through a resistor (or Thevenin equivalent R_eq + DMM 10 MΩ input), voltage follows an exponential curve toward its final asymptote. The pace of that curve is set by the Time Constant τ = R_eq · C.",
    lawWhy: "In 1τ, a step reaches 63.2% of total change (1 − e⁻¹). In 5τ, it reaches 99.3% (considered settled steady state). Notice kΩ × µF = 10³ × 10⁻⁶ s = 10⁻³ s = milliseconds directly!",
    trap: "In real lab circuits (like Physics 2B Lab 8), a 10 MΩ DMM connected across a 1–10 MΩ resistor acts in PARALLEL with R, reducing R_eq = (R·R_DMM)/(R+R_DMM) and speeding up τ compared to ideal theory!"
  },
  ac: {
    intuition: "Alternating current periodically reverses direction as a smooth sinusoid v(t) = V_p · sin(2πft ± φ). Peak amplitude V_p is the crest above DC average, peak-to-peak V_pp = 2·V_p, while RMS (V_rms = 0.7071·V_p) is the DC voltage that delivers the EXACT SAME heating power into a resistor.",
    lawWhy: "Period T = 1/f seconds per cycle; angular velocity ω = 2πf rad/s. Average of a full rectified half-wave is 0.637·V_p (2/π · V_p). A lead angle (+φ) shifts the wave earlier (left) on an oscilloscope; a lag (−φ) shifts later (right).",
    trap: "Oscilloscopes display V_p and V_pp directly on the graticule, whereas standard DMMs in AC mode report V_rms (valid only for pure sinusoids unless True-RMS). Never confuse V_rms with V_p—wall 120 V_rms reaches ±170 V peak!"
  },
  filters: {
    intuition: "By pairing frequency-dependent X_C = 1/(2πfC) or X_L = 2πfL with a resistor, a voltage divider becomes frequency-selective: a low-pass filter passes slow DC/audio signals while shunting fast HF noise to ground; a high-pass filter blocks DC bias while passing AC signals.",
    lawWhy: "At the −3 dB cutoff frequency f_c = 1/(2πRC), R = X_C, so output amplitude drops to 0.7071 · V_in (half power!) and phase shifts by 45°. Above f_c, a first-order RC filter attenuates at −20 dB/decade (−6 dB/octave).",
    trap: "Don't forget 0.707 voltage ratio = −3 dB power ratio (because dB = 20·log10(V_out/V_in) = 10·log10(P_out/P_in)). Adding a passive stage downstream loads the previous filter!"
  },
  components: {
    intuition: "Semiconductors and Digital Logic sit on the same Silicon foundation: pure Si has 4 valence electrons; doping with pentavalent phosphorus (5 valence) creates N-type excess electrons, while trivalent boron (3 valence) creates P-type holes. A PN junction forms a 0.7 V potential barrier that conducts one way (diode).",
    lawWhy: "Three PN junctions back-to-back form an NPN/PNP BJT where tiny base current I_B controls large collector current I_C = β_DC·I_B until collector resistor hits saturation I_C(sat) = (V_CC − V_CE(sat))/R_C. Similarly, CMOS MOSFET pairs switch rails sharply to represent binary 0 (LOW) and 1 (HIGH), mapped via Truth Tables, DeMorgan's Laws, and K-maps.",
    trap: "Forgetting the 0.7 V silicon diode drop (or 1.4 V across two conducting diodes in a full-wave bridge) breaks rectifier and BJT KVL calculations. In digital K-maps, remember edges wrap around like a cylinder and diagonal cells NEVER group."
  },
  schematics: {
    intuition: "A schematic is a logical map of electrical connectivity (nets), NOT physical geometry. Every wire sharing a net label or solid dot junction sits at virtually the same voltage; crossing wires without a dot do NOT connect.",
    lawWhy: "Effective bring-up traces power rails (+28V → buck → +5V → LDO → +3.3V), ground returns (AGND/DGND star), series protection (fuses/TVS), and signal direction (TX → RX, MOSI, SDA open-drain pull-ups) directly from the schematic before probing copper.",
    trap: "Net names like UART_TX are named relative to ONE chip—always check whether UART_TX connects to the peer's UART_RX, and verify active-low markers (bar, #, _n, ~) on RESET_n or EN pins."
  },
  instruments: {
    intuition: "Every test instrument alters the circuit slightly when connected: a voltmeter puts ~10 MΩ in parallel; an ammeter puts a small shunt in series; a 10× scope probe adds ~10 MΩ ∥ 12 pF. Bandwidth BW_scope must satisfy f_knee = 0.35 / t_r so fast digital edges aren't rounded by the scope itself.",
    lawWhy: "Oscilloscope menus (Control → Setup → Trigger → Measure → Math → Analyze) isolate real signals cleanly: use short tip-and-barrel ground springs instead of 6-inch alligator clips (which add ~150 nH antenna ringing), and use DC-coupled differential/power-rail probes (like Keysight N7020A) plus Kelvin current shunts (like 1169B).",
    trap: "Attaching a grounded passive scope probe clip to a high-side shunt pin or battery (+) shorts the entire supply straight to earth ground through the scope chassis!"
  },
  "power-rails": {
    intuition: "Spacecraft and GPU boards convert high bus voltage (+28 V / +12 V) into precision low-voltage core rails (+0.8 V, +1.2 V, +3.3 V) using Linear LDOs (clean, low noise, wastes (V_in−V_out)·I heat) and Switching Bucks (high efficiency, inductor L stores energy, outputs small ripple ΔV).",
    lawWhy: "P_loss,LDO = (V_in − V_out)·I_load; Regulator Load Regulation = ΔV_out/ΔI_load; Capacitor filter ripple V_r(pp) ≈ V_p(rect)/(f_r · R_L · C). Power-sequencing requires core rails stable + Power-Good asserted + Clock PLL locked BEFORE releasing RESET_n.",
    trap: "Measuring rail droop at the VRM output cap looks clean even while I·R PCB trace loss drops the voltage at the BGA pins out of spec—always Kelvin-sense at the load point."
  },
  buses: {
    intuition: "Digital subsystems talk over standardized physical buses: UART (2 wires TX/RX asynchronous, baud-rate matched, no shared clock), SPI (4 wires SCLK/MOSI/MISO/CS# push-pull full-duplex fast), I²C (2 open-drain wires SDA/SCL requiring external pull-up resistors to V_CC), and CAN/RS-485 (differential A/B twisted pair with 120 Ω termination).",
    lawWhy: "Electrical bugs mimic protocol bugs: missing I²C pull-ups cause slow exponential RC rising edges that fail ACK; missing 120 Ω CAN end-termination causes ringing reflections at the receiver; swapped TX-to-TX drives contention.",
    trap: "Always verify physical idle voltage and pull-ups with an oscilloscope BEFORE debugging software drivers—an open-drain SDA line with no pull-up sits stuck at 0 V regardless of firmware!"
  },
  timing: {
    intuition: "Synchronous digital flip-flops are cameras with a shutter window around every rising clock edge: Setup time (t_su) is how long data must hold still BEFORE the clock edge arrives; Hold time (t_h) is how long data must stay steady AFTER the clock edge so new launched data doesn't race through and overwrite it.",
    lawWhy: "Setup governs maximum clock speed: T_clk(min) = t_CQ(max) + t_logic(max) + t_su + t_skew, so slowing f_clk fixes Setup. Hold is a SAME-EDGE race: t_CQ(min) + t_logic(min) ≥ t_h(max) + t_skew. Notice T_clk cancels completely from the Hold equation!",
    trap: "GOLDEN TIMING RULE: Slowing down the clock frequency (f_clk) CANNOT fix a hold violation because both launch and capture occur on the SAME clock edge! Only adding physical delay buffers on short paths or reducing clock skew fixes hold."
  },
  qualification: {
    intuition: "In flight avionics and production SLT, building one working prototype isn't enough—we must prove design margin (Verification: 'built the system right') and mission survival (Validation: 'built the right system') across worst-case thermal, vacuum (TVAC), vibration, radiation, and instrument uncertainty corners.",
    lawWhy: "Guardbanding subtracts worst-case instrument uncertainty U from raw spec limits: effective pass window = [Spec_min + U, Spec_max − U]. In TVAC (<10⁻⁵ Torr), convection h = 0 W/m²·K vanishes completely—heat escapes only by bolted conduction and T⁴ radiation.",
    trap: "A unit that passes ambient thermal testing can suffer thermal runaway in TVAC from loose fastener torque, or arc via Paschen's Law around ~0.001–100 Torr during chamber pump-down!"
  },
  rf: {
    intuition: "When signal wavelength λ = c/(f·√ε_r) becomes comparable to PCB trace or coax length, wires no longer act like simple shorts—they become distributed transmission lines with characteristic impedance Z₀ (typically 50 Ω single-ended, 100 Ω differential).",
    lawWhy: "Whenever a wave hits an impedance mismatch Z_L ≠ Z₀, part of the energy bounces back with reflection coefficient Γ = (Z_L − Z₀)/(Z_L + Z₀), creating Standing Wave Ratio VSWR = (1+|Γ|)/(1−|Γ|) and return loss RL = −20·log10|Γ| dB.",
    trap: "Leaving a fast transmission line unterminated (Z_L = ∞) gives Γ = +1, doubling voltage amplitude at the open receiver end and causing violent ringing reflections!"
  },
  safety: {
    intuition: "Flight hardware can cost $100k+ per board and humans work beside high-voltage/Li-ion bus packs. Disciplined test engineering prevents blue smoke BEFORE throwing the switch: current-limit the supply, inspect polarity/shorts power-off, configure ESD wrist straps, and program fail-closed software shutdowns.",
    lawWhy: "First power-on 'Smoke Test' uses I_limit slightly above expected idle draw with V_in ramped safely. Use try/except/finally blocks in automated harnesses so any exception immediately disables PSU outputs and logs the abort.",
    trap: "Never hot-plug harnesses on energized avionics connectors, never bypass current limits during bring-up, and never apply power before confirming low-resistance checks across main power rails."
  },
  automation: {
    intuition: "Manual clicking scales poorly across thermal chambers and 500 satellites/year. Python test scripts using PyVISA/SCPI (*IDN?, SYST:ERR?, MEAS:VOLT:DC?), PySerial, and pytest enforce deterministic stimulus, timestamped logging, and strict PASS / FAIL / INVALID separation.",
    lawWhy: "NaN safety & Three-State Logic: Python accepts float('nan') without raising an exception, and any comparison ('nan <= 3.5') evaluates False—or if coded carelessly, passes! Always check math.isfinite(x), verify nonzero subprocess exit codes, and preserve raw first-failure logs.",
    trap: "Retrying a failing test automatically until it passes ('retry-until-pass') destroys first-pass yield visibility and lets marginal hardware escape into space!"
  },
  thermal: {
    intuition: "Every watt of electrical power (I²R or switch loss) turns into heat that must flow from tiny silicon junction T_J → case → TIM → heatsink/baseplate → coldplate/ambient T_A through thermal resistance θ_JA (°C/W).",
    lawWhy: "Junction temperature obeys Fourier's thermal Ohm's Law analog: T_J = T_A + P_dissipated · (θ_JC + θ_CS + θ_SA). In vacuum (TVAC), θ_SA spikes drastically without air convection, making interface torque and thermal gap pads critical.",
    trap: "Don't read die diode/telemetry temperature right when setpoints change—wait for thermal soak equilibrium where ΔT/Δt drops within stabilization limits."
  },
  rca: {
    intuition: "Systematic Root Cause Analysis (RCA) uses the scientific method: separate OBSERVED SYMPTOM from GUESS, preserve original timestamps/logs, divide-and-conquer half-split the signal chain, and prove causality with an A → B → A swap (fault moves when swapped, disappears when restored).",
    lawWhy: "Correlation is NOT causation: a failure occurring at 70 °C could be silicon timing, fixture thermal expansion, harness intermittency, or software fan-speed timeout. Only a controlled single-variable swap distinguishes them.",
    trap: "Changing two things at once (resoldering a connector AND flashing firmware) destroys A-B-A proof and guarantees the bug returns in flight or mass production!"
  },
  thevenin: {
    intuition: "Any linear tangle of batteries and resistors feeding two output terminals behaves identically from the load's point of view as ONE ideal voltage source V_TH in series with ONE resistor R_TH (or one Norton current source I_N in parallel with R_N = R_TH). Max power hits the load when R_L = R_TH.",
    lawWhy: "Find V_TH as the open-circuit voltage V_oc at terminals A–B (no load attached). Find R_TH by turning off independent sources (short voltage sources, open current sources) and computing equivalent resistance seen into A–B. Norton current I_N = V_TH / R_TH.",
    trap: "Never look for R_TH while independent voltage sources remain powered! And remember Efficiency at Maximum Power Transfer (R_L = R_TH) is only 50%—we match impedance for RF/sensors, NOT for spacecraft main power buses!"
  },
  magnetics: {
    intuition: "Moving charges generate a magnetic field Φ (webers, Wb) around the wire (right-hand rule). Wrapping turns N around a high-permeability core concentrates flux density B = Φ/A (tesla), storing energy in inductors and coupling AC power across isolation barriers in transformers.",
    lawWhy: "Faraday's Law v = N · dΦ/dt explains why transformers work ONLY on AC/switched currents (dΦ/dt ≠ 0). An ideal transformer scales voltages by turns ratio V₂/V₁ = N₂/N₁ and transforms impedance by the square (Z_reflected = (N₁/N₂)² Z_L).",
    trap: "Applying pure DC across a low-resistance transformer primary drives dΦ/dt = 0 and shorts the supply with I = V/R_winding! Also remember Floyd Table 1-4: Weber (Wb) and Tesla (T) are SI; gauss/maxwell are non-SI CGS."
  },
  "python-scpi": {
    intuition: "Automated test benches control power supplies, DMMs, chambers, and oscilloscopes using SCPI ASCII commands over PyVISA/USB/Ethernet (`*IDN?`, `SYST:ERR?`, `MEAS:VOLT:DC?`, `OUTP OFF`). Python scripts turn manual lab procedures into repeatable, fail-closed manufacturing stations.",
    lawWhy: "Three-State Classification (`PASS` / `FAIL` / `INVALID`) prevents dead instruments or NaN strings from passing hardware. Wrap every SCPI session in `try / finally: psu.write('OUTP OFF')`, verify `math.isfinite()`, and log raw timestamps + serial numbers.",
    trap: "Calling `float('nan')` succeeds without raising ValueError, and `3.10 <= float('nan') <= 3.50` returns False! Always check `math.isfinite(x)` and inspect `SYST:ERR?` after instrument configuration."
  },
  linux: {
    intuition: "Modern avionics test racks, flight computers, and SoC bench hosts run Linux. The kernel exposes hardware presence (`lspci`, `lsusb`, `/dev/serial/by-id/`), boot/fault messages (`dmesg`, `journalctl`), and process telemetry via standard file descriptors and integer exit codes (`$?`).",
    lawWhy: "Every Linux CLI exits with `$? = 0` for clean completion, `1` for no match in `grep`, or `2+` for error/missing file. Read-only inspection (`uname -a`, `dmesg -T`, `grep -RniE`) preserves volatile crash evidence BEFORE resetting hardware.",
    trap: "Equating `grep` exit code 1 (no match found) or script exit code 0 with 'Hardware Passed'! Also avoid fragile `/dev/ttyUSB0` numbering across unplug/replug—always bind via persistent `/dev/serial/by-id/...`!"
  }
};

/* ============================================================================
   3. TOPIC-FILTERED WORKED PRACTICE BANK (Avionics EE Practice — Topic-Pure)
      100% tailored to Avionics EE & Hardware Debug — Zero unrelated course codes.
   ============================================================================ */
const AVIONICS_WORKED_BANK = [
  {
    id: "CW-DC-01",
    cat: "dc_networks",
    src: "Avionics Foundations · Charge, Current & 10^(3n) Engineering Notation",
    title: "Compute Electron Count from Coulomb Charge & Current in 10^(3n)",
    topicIds: ["units", "ohm"],
    prompt: "How many electrons make up 0.000045 C (45 µC) of charge, and if that charge flows past a PCB trace cross-section in 15 ms, what is the current I in engineering notation?",
    prereq: "1 coulomb (C) equals 6.25 × 10¹⁸ electrons. Electric current is charge flow per second: I = Q / t (1 A = 1 C/s). Engineering notation keeps exponents as multiples of 3 (10³, 10⁻³, 10⁻⁶).",
    formula: "N = Q * 6.25e18 ;   I = Q / t",
    steps: [
      "Step 1 — Convert given charge to 10^(3n) engineering notation: Q = 0.000045 C = 45 × 10⁻⁶ C = 45 µC.",
      "Step 2 — Calculate electron count N: N = (45 × 10⁻⁶ C) × (6.25 × 10¹⁸ electrons/C) = 281.25 × 10¹² electrons.",
      "Step 3 — Convert time t to base seconds: t = 15 ms = 15 × 10⁻³ s = 0.015 s.",
      "Step 4 — Compute current I = Q / t = (45 × 10⁻⁶ C) / (15 × 10⁻³ s) = 3.0 × 10⁻³ A = 3.0 mA.",
      "Step 5 — Bench Application: Verify trace current limit against IPC-2152 copper width tables before energizing."
    ],
    answerType: "number",
    expected: 3,
    unit: "mA"
  },
  {
    id: "CW-DC-02",
    cat: "dc_networks",
    src: "Avionics EE · SMD Markings, Ohm's Law & 2× Wattage Derating",
    title: "SMD '472' Resistor Code, Branch Current & Safe Flight Wattage Selection",
    topicIds: ["ohm", "power", "safety"],
    prompt: "An SMT resistor marked '472' (4-band equivalent: Yellow-Violet-Red-Gold) is connected directly across a 12 V avionics rail. Find (a) nominal resistance, (b) current in mA, (c) power dissipated in mW, and (d) minimum safe standard power rating (1/8 W, 1/4 W, 1/2 W).",
    prereq: "In 3-digit SMD markings (ABC), digits A and B are significant figures and C is the power-of-10 multiplier. Always apply ≥ 2× flight derating on power ratings.",
    formula: "R = 47 * 10^2 ;   I = V / R ;   P = V^2 / R",
    steps: [
      "Step 1 — Decode SMD '472': 47 × 10² = 4,700 Ω = 4.70 × 10³ Ω (±5%).",
      "Step 2 — Apply Ohm's Law: I = 12 V / (4.70 × 10³ Ω) = 2.553 × 10⁻³ A (2.553 mA).",
      "Step 3 — Apply Watt's Law: P = 12² / (4.70 × 10³) = 30.64 × 10⁻³ W (30.64 mW).",
      "Step 4 — Flight 2× Derating Check: 2 × 30.64 × 10⁻³ W = 61.28 × 10⁻³ W ≤ 0.125 W (1/8 W 0805 package safe).",
      "Step 5 — Bench Check: Verify power-off resistance across isolated pads (4.465–4.935 kΩ) before current-limited 12 V power-on."
    ],
    answerType: "number",
    expected: 30.64,
    unit: "mW"
  },
  {
    id: "CW-DC-03",
    cat: "dc_networks",
    src: "Avionics Networks · Loaded Voltage Divider vs. 10 MΩ DMM Error",
    title: "Solve a Loaded Voltage Divider vs. 10×10⁶ Ω Voltmeter Loading Error",
    topicIds: ["series", "parallel", "instruments", "schematics"],
    prompt: "A +10 V reference feeds R₁ = 1 MΩ (top) and R₂ = 1 MΩ (bottom). What does a real handheld DMM with R_DMM = 10×10⁶ Ω read at the midpoint (in V)?",
    prereq: "Connecting a DMM places R_DMM = 10 × 10⁶ Ω IN PARALLEL with bottom resistor R₂, lowering midpoint voltage across high-impedance dividers.",
    formula: "R2_loaded = (R2 * R_DMM) / (R2 + R_DMM) ;   V_DMM = V_S * R2_loaded / (R1 + R2_loaded)",
    steps: [
      "Step 1 — Ideal unloaded voltage: V_ideal = 10 × 1×10⁶ / (2×10⁶) = 5.000 V.",
      "Step 2 — Parallel DMM loading across R₂: (1×10⁶ × 10×10⁶)/(11×10⁶) = 909.1 × 10³ Ω.",
      "Step 3 — Total loaded chain: R_total = 1.0×10⁶ + 0.9091×10⁶ = 1.9091 × 10⁶ Ω.",
      "Step 4 — DMM reading: V_DMM = 10 × (0.9091 / 1.9091) = 4.762 V (−4.76% sag!).",
      "Step 5 — Product Fix: Buffer megohm sensor dividers with a unity-gain CMOS op-amp before ADC/DMM probing."
    ],
    answerType: "number",
    expected: 4.762,
    unit: "V"
  },
  {
    id: "CW-DC-04",
    cat: "dc_networks",
    src: "Avionics Sensors · Thermistor Wheatstone Bridge & Thevenin R_TH",
    title: "Unbalanced Thermistor Wheatstone Bridge + Thevenin V_TH / R_TH",
    topicIds: ["kcl-kvl", "thevenin", "thermal", "parallel"],
    prompt: "A 12 V Wheatstone bridge has three equal arms R₁ = R₂ = R₃ = 10×10³ Ω and thermistor R_T = 9.0×10³ Ω at 30 °C. Find differential output V_out = V_A − V_B in V.",
    prereq: "Compute left/right divider legs independently, subtract V_A − V_B, and zero V_S (short to GND) to calculate R_TH = (R₁∥R₃) + (R₂∥R_T).",
    formula: "V_out = V_S * (R3/(R1+R3) - R_T/(R2+R_T))",
    steps: [
      "Step 1 — Reference leg V_A = 12 × (10×10³ / 20×10³) = 6.000 V.",
      "Step 2 — Sensing leg V_B = 12 × (9.0×10³ / 19.0×10³) = 5.6842 V.",
      "Step 3 — Differential V_out = 6.000 − 5.6842 = +0.3158 V (+315.8 × 10⁻³ V).",
      "Step 4 — Find R_TH (zero 12V supply): (10k∥10k) + (10k∥9k) = 5.000k + 4.737k = 9.737 × 10³ Ω.",
      "Step 5 — Bench Check: Measure differentially across A–B with instrumentation amp to reject common-mode rail drift."
    ],
    answerType: "number",
    expected: 0.3158,
    unit: "V"
  },
  {
    id: "CW-DC-05",
    cat: "dc_networks",
    src: "Avionics RF/Sensors · Max Power Transfer & AC RMS",
    title: "Maximum Power Transfer (R_L = R_TH) & AC Sine Peak-to-RMS Conversion",
    topicIds: ["thevenin", "ac", "rf", "kcl-kvl"],
    prompt: "A sensor source has V_TH = 8.0 V and R_TH = 200 Ω. Find max load power P_max (in mW) when R_L = R_TH = 200 Ω.",
    prereq: "Maximum power transfer occurs when R_L = R_TH, yielding P_max = V_TH² / (4 · R_TH) at 50% efficiency.",
    formula: "P_max = V_TH^2 / (4 * R_TH)",
    steps: [
      "Step 1 — Match load: R_L = R_TH = 200 Ω.",
      "Step 2 — Loop current: I = 8.0 / (200 + 200) = 20.0 × 10⁻³ A (20 mA).",
      "Step 3 — Load power: P_max = (20×10⁻³)² × 200 = 80.0 × 10⁻³ W = 80.0 mW.",
      "Step 4 — Verification formula: V_TH² / (4·R_TH) = 64 / 800 = 80 mW."
    ],
    answerType: "number",
    expected: 80,
    unit: "mW"
  },
  {
    id: "CW-ANA-01",
    cat: "analog_devices",
    src: "Avionics Power Conversion · Full-Wave Si Bridge Rectifier & Ripple",
    title: "Full-Wave Bridge Rectifier DC Output, Ripple V_r(pp) & PIV Rating",
    topicIds: ["components", "power-rails", "ac"],
    prompt: "A 12 V_rms 60 Hz secondary feeds a 4-diode Si bridge (0.7 V each) with C = 1×10⁻³ F (1000 µF) and R_L = 1.0×10³ Ω. Find filtered DC peak V_p(out) in V.",
    prereq: "Convert V_rms to V_peak = √2·V_rms, subtract 2×0.7 V conducting diodes, and note ripple rate doubles to 120 Hz.",
    formula: "V_p(out) = 1.4142 * V_rms - 1.4 ;   V_r(pp) = V_p(out) / (f_r * R_L * C)",
    steps: [
      "Step 1 — Secondary Peak: V_p(sec) = 1.4142 × 12 = 16.97 V.",
      "Step 2 — Subtract 2 conducting Si diodes: V_p(out) = 16.97 − 1.40 = 15.57 V.",
      "Step 3 — Full-wave ripple rate: f_r = 2 × 60 = 120 × 10⁰ Hz.",
      "Step 4 — Filter ripple: V_r(pp) = 15.57 / (120 × 10³ × 10⁻³) = 129.8 × 10⁻³ Vpp (129.8 mVpp).",
      "Step 5 — Bench Scope Diagnostic: If ripple switches from 120 Hz to 60 Hz, one bridge diode failed open!"
    ],
    answerType: "number",
    expected: 15.57,
    unit: "V"
  },
  {
    id: "CW-ANA-02",
    cat: "analog_devices",
    src: "Avionics Regulators & Drivers · Zener Shunt Current & BJT Saturation",
    title: "5.1V Zener Regulator KCL Current & NPN Saturation Check",
    topicIds: ["components", "ohm", "power"],
    prompt: "A 5.1 V Zener regulator (R_S = 100 Ω) fed from V_in = 12 V drives load R_L = 510 Ω. Find Zener shunt current I_Z in mA.",
    prereq: "KCL at the Zener node: I_T = (V_in − V_Z)/R_S = I_Z + I_L, where I_L = V_Z/R_L.",
    formula: "I_T = (V_in - V_Z)/R_S ;   I_L = V_Z/R_L ;   I_Z = I_T - I_L",
    steps: [
      "Step 1 — Series current: I_T = (12.0 − 5.1) / 100 = 69.0 × 10⁻³ A (69.0 mA).",
      "Step 2 — Load current: I_L = 5.1 / 510 = 10.0 × 10⁻³ A (10.0 mA).",
      "Step 3 — Zener current by KCL: I_Z = 69.0 − 10.0 = 59.0 × 10⁻³ A (59.0 mA).",
      "Step 4 — Thermal check: P_Z = 5.1 × 59×10⁻³ = 301 mW (no-load worst case = 5.1 × 69 mA = 352 mW -> size ≥ 1 W Zener)."
    ],
    answerType: "number",
    expected: 59,
    unit: "mA"
  },
  {
    id: "CW-DIG-01",
    cat: "digital_timing",
    src: "Avionics & SoC Timing · Setup Frequency f_max vs. Same-Edge Hold Violation",
    title: "Static Timing Analysis: Max Clock f_max vs. Same-Edge Hold Slack (ps)",
    topicIds: ["timing", "components", "buses"],
    prompt: "Given t_CQ(max)=950×10⁻¹² s, t_CQ(min)=300×10⁻¹² s, slow path t_logic(max)=590×10⁻¹² s, fast path t_min=30×10⁻¹² s, t_su=300×10⁻¹² s, t_h=400×10⁻¹² s, skew=750×10⁻¹² s: find Hold Slack in ps.",
    prereq: "Setup checks next edge (sets f_max = 386.10 MHz). Hold checks the SAME clock edge: HoldSlack = (t_CQ_min + t_min) − (t_h + t_skew).",
    formula: "T_clk(min) = 950 + 590 + 300 + 750 = 2590 ps ;   HoldSlack = (300 + 30) - (400 + 750)",
    steps: [
      "Step 1 (Setup T_min): (950 + 590 + 300 + 750) × 10⁻¹² s = 2.590 × 10⁻⁹ s -> f_max = 386.10 × 10⁶ Hz.",
      "Step 2 (Hold Fastest Arrival): t_CQ(min) + t_path(min) = (300 + 30) × 10⁻¹² s = 330 × 10⁻¹² s.",
      "Step 3 (Required Hold Window): t_hold + t_skew = (400 + 750) × 10⁻¹² s = 1,150 × 10⁻¹² s.",
      "Step 4 (Hold Slack): 330×10⁻¹² − 1,150×10⁻¹² = −820 × 10⁻¹² s (−820 ps VIOLATION!).",
      "Step 5 (Hardware Fix): Slowing f_clk CANNOT fix hold! Insert ≥ +820×10⁻¹² s delay buffer on the fast path or reduce clock skew."
    ],
    answerType: "number",
    expected: -820,
    unit: "ps"
  },
  {
    id: "CW-DIG-02",
    cat: "digital_timing",
    src: "Avionics Digital Telemetry · PWM Duty Cycle & Binary-to-Gray Synchronization Code",
    title: "PWM Duty Cycle (10⁻⁶ s) & Binary-to-Gray Synchronization Code",
    topicIds: ["timing", "components", "buses", "automation"],
    prompt: "A spacecraft heater PWM pulse has period T = 20×10⁻⁶ s and HIGH pulse width t_W = 5.0×10⁻⁶ s. Find Duty Cycle %.",
    prereq: "Duty cycle = (t_W / T) × 100% measured at 50% crossing. Instantaneous frequency f = 1 / T.",
    formula: "DutyCycle = (t_W / T) * 100 ;   f = 1 / T",
    steps: [
      "Step 1 — Match 10^(3n) base units: t_W = 5.0 × 10⁻⁶ s, T = 20.0 × 10⁻⁶ s.",
      "Step 2 — Divide t_W / T: 5.0×10⁻⁶ / 20.0×10⁻⁶ = 0.250.",
      "Step 3 — Convert to percent: 0.250 × 100% = 25% (f = 1 / 20×10⁻⁶ = 50.0 × 10³ Hz).",
      "Step 4 — Bench Scope Check: Trigger on rising edge, verify 10–90% rise time < 1% of T and compare against heater MOSFET switch rating."
    ],
    answerType: "number",
    expected: 25,
    unit: "%"
  },
  {
    id: "CW-LAB-01",
    cat: "lab_tvac",
    src: "Avionics Hardware Debug · 10 MΩ DMM RC Loading Shift",
    title: "RC Time Constant With Parallel 10×10⁶ Ω DMM Meter Loading",
    topicIds: ["rc", "capacitors", "qualification", "instruments"],
    prompt: "A 2.2×10⁻⁶ F capacitor discharges through R = 4.7×10⁶ Ω WITH a 10×10⁶ Ω DMM connected across it. Compute observed τ in seconds.",
    prereq: "Because the DMM input (10 × 10⁶ Ω) sits in PARALLEL with bleed resistor R across the capacitor, R_eq = (R·R_DMM)/(R+R_DMM).",
    formula: "R_eq = (R * R_DMM) / (R + R_DMM) ;   tau = R_eq * C",
    steps: [
      "Step 1 — Parallel equivalent resistance: R_eq = (4.7×10⁶ × 10×10⁶)/(14.7×10⁶) = 3.1973 × 10⁶ Ω.",
      "Step 2 — Capacitance in farads: C = 2.2 × 10⁻⁶ F.",
      "Step 3 — Multiply (note 10⁶ × 10⁻⁶ = 10⁰): τ = 3.1973 × 2.2 = 7.034 s (vs. 10.34 s unloaded!).",
      "Step 4 — Bench Resolution: Never blame the capacitor for decaying 32% fast—account for DMM loading or buffer via high-Z op-amp."
    ],
    answerType: "number",
    expected: 7.034,
    unit: "s"
  },
  {
    id: "CW-LAB-02",
    cat: "lab_tvac",
    src: "Muon Space Hardware Debug · 5 V Rail Feeding 100 Parallel 1 Ω Resistors",
    title: "5V Bus Feeding 100 Parallel 1 Ω Resistors (Mixed Opens + 0 Ω Shorts)",
    topicIds: ["parallel", "safety", "instruments", "schematics", "rca"],
    prompt: "A +5.0 V rail feeds 100 nominal 1.0 Ω resistors in parallel. What is healthy R_eq in milliohms (mΩ), and what exact order clears mixed opens + 0 Ω shorts?",
    prereq: "Healthy R_eq = R / N = 1.0 / 100 = 10×10⁻³ Ω. Any 0 Ω short dominates and masks opens until cleared via 4W Kelvin + IR.",
    formula: "R_eq_healthy = (1.0 / 100) * 1000 mOhm",
    steps: [
      "Step 1 (Paper Math in 10^3n): R_eq = 1/100 = 10.0 × 10⁻³ Ω (10.0 mΩ); nominal 5 V draw = 500 A (2.5 × 10³ W!).",
      "Step 2 (2W vs 4W DMM): 2-wire leads (~240×10⁻³ Ω) swap 10 mΩ -> switch to 4-wire Kelvin mode.",
      "Step 3 (Clear Shorts FIRST): Inject CC-limited 1 V / 2.5 A bias, locate hotspots via IR camera + mV gradient, lift 1 pad per suspect (0.000 Ω confirms short) until R_4W ≥ 10.0 mΩ.",
      "Step 4 (Find Opens SECOND): Compute N_open = 100 − 1/R_4W, view cold 25 °C open bodies vs warm 60 °C healthy bodies on IR, rework joints & verify R_4W = 10.0 mΩ."
    ],
    answerType: "number",
    expected: 10,
    unit: "mΩ"
  },
  {
    id: "CW-DC-06",
    cat: "dc_networks",
    src: "Avionics Multi-Loop Analysis · 2×2 Cramer's Rule & X_C",
    title: "Solve 2-Loop Mesh Current I₁ via Cramer's Rule (10⁻³ A)",
    topicIds: ["kcl-kvl", "capacitors", "ac"],
    prompt: "Solve 2-mesh equations for I₁ (in mA): 300·I₁ − 100·I₂ = 6 V and −100·I₁ + 400·I₂ = 0 V.",
    prereq: "Compute Δ = a·d − b·c and Δ₁ = V₁·d − b·V₂, giving I₁ = Δ₁ / Δ.",
    formula: "D = 300*400 - (-100)*(-100) ;   I1 = (6*400 - (-100)*0) / D",
    steps: [
      "Step 1 — System determinant: Δ = (300)(400) − (−100)(−100) = 110 × 10³ Ω².",
      "Step 2 — Numerator determinant: Δ₁ = (6)(400) − 0 = 2.400 × 10³ V·Ω.",
      "Step 3 — Mesh current: I₁ = 2,400 / 110,000 = 21.82 × 10⁻³ A = 21.82 mA."
    ],
    answerType: "number",
    expected: 21.82,
    unit: "mA"
  }
];

/* ============================================================================
   4. UNIVERSAL 10^(3n) PHYSICS INFERENCE & HIRING-MANAGER INTERVIEW SCRIPT
   ============================================================================ */
function inferTopicPhysicsModel(q, t, isNvidia) {
  const tid = (t && t.id) || "";
  const txt = ((q && q.id) || "") + " " + ((q && q.question) || "") + " " + tid;
  const rawFormula = String((q && q.formula) || "").trim();
  const hasRealFormula = rawFormula && !rawFormula.includes("->");
  const topicDefaults = {
    units: { f: "I = Q / t ;   V = W / Q", s: "(45e-6) / (15e-3) = 3.00e-3 A", unitConv: "1 p=10^(-12), 1 n=10^(-9), 1 u=10^(-6), 1 m=10^(-3), 1 k=10^3, 1 M=10^6" },
    ohm: { f: "I = V / R ;   R = V / I", s: "5.00 / (2.00 * 10^3) = 2.50 * 10^(-3) A", unitConv: "I = 5 / (2*10^3) = 2.50e-3 A (2.50 mA)" },
    power: { f: "P = V * I = V^2 / R", s: "(12.0^2) / (4.70 * 10^3) = 30.64 * 10^(-3) W", unitConv: "2x derating min = 61.3e-3 W <= 125e-3 W (1/8 W)" },
    series: { f: "V_out = V_in * (R_2 / (R_1 + R_2))", s: "5.00 * ((1.0*10^3) / (1.0*10^3 + 1.0*10^3)) = 2.50 V", unitConv: "R_T = R_1 + R_2 in 10^3n Ohms" },
    parallel: { f: "R_eq = R_nom / N_healthy ;   1 / R_eq = 1 / R_1 + 1 / R_2", s: "1.0 / 100 = 10.0 * 10^(-3) Ohm", unitConv: "I_5V = 5.0 / (10.0*10^(-3)) = 500 A -> Debug at 1.0 V CC" },
    "kcl-kvl": { f: "Sum(I_in) = Sum(I_out) ;   Sum(V_loop) = 0", s: "69.0e-3 - 10.0e-3 = 59.0e-3 A", unitConv: "Keep signed branch currents in mA (10^(-3) A)" },
    thevenin: { f: "V_TH = V_open ;   R_TH = (R_1 * R_2) / (R_1 + R_2)", s: "(10e3 * 10e3) / (20e3) = 5.00e3 Ohm", unitConv: "Short V_S on paper to find R_TH in 10^3n Ohms" },
    ac: { f: "V_rms = 0.7071 * (V_pp / 2) ;   T = 1 / f", s: "0.7071 * (14.14 / 2) = 5.00 V", unitConv: "f = 2.0e3 Hz -> T = 500e-6 s (500 us)" },
    capacitors: { f: "Q = C * V ;   X_C = 1 / (2 * pi * f * C)", s: "1 / (2 * pi * 10e3 * 0.1e-6) = 159.15 Ohm", unitConv: "C in uF = 10^(-6) F; pF = 10^(-12) F" },
    rc: { f: "tau = R_eq * C ;   R_eq = (R * R_DMM) / (R + R_DMM)", s: "(3.197e6) * (2.2e-6) = 7.034 s", unitConv: "10^6 Ohm * 10^(-6) F = 1.0 s (10^3n cancels!)" },
    inductors: { f: "V_L = L * (dI / dt) ;   tau = L / R", s: "(250e-12) * (40 / 20e-9) = 500e-3 V", unitConv: "pH (10^(-12)) * A / ns (10^(-9)) = mV (10^(-3) V)" },
    filters: { f: "f_c = 1 / (2 * pi * R * C)", s: "1 / (2 * pi * 1.59e3 * 0.1e-6) = 1.00e3 Hz", unitConv: "At f_c: gain = 0.7071 (-3.01 dB), slope = -20 dB/dec" },
    magnetics: { f: "V_2 / V_1 = N_2 / N_1 ;   v = N * (dPhi / dt)", s: "120 * (1 / 10) = 12.0 V", unitConv: "Transformers require dPhi/dt != 0 (AC/switched only)" },
    components: { f: "I_Z = (V_in - V_Z)/R_S - V_Z/R_L ;   I_C_sat = (V_CC - 0.2)/R_C", s: "(12 - 5.1)/100 - 5.1/510 = 59.0e-3 A", unitConv: "Si V_F = 0.70 V; V_CE(sat) = 0.20 V" },
    "power-rails": { f: "P_loss = (V_in - V_out) * I_load ;   V_r_pp = V_p / (f_r * R_L * C)", s: "15.57 / (120 * 1.0e3 * 1.0e-3) = 129.8e-3 V", unitConv: "Ripple rate f_r = 2 * 60 = 120 Hz for full bridge" },
    schematics: { f: "I_shunt = V_sense / R_shunt", s: "(25.0e-3) / (5.00e-3) = 5.00 A", unitConv: "Measure V_sense differentially at Kelvin pads (10^(-3) cancels)" },
    instruments: { f: "BW_scope >= 0.5 / t_rise ;   R_eq = (R * 10e6) / (R + 10e6)", s: "0.5 / (0.35e-9) = 1.43e9 Hz", unitConv: "Use <5 mm spring ground to cut ~150e-9 H clip ringing" },
    timing: { f: "T_min = t_CQ + t_logic + t_su + t_skew ;   HoldSlack = (t_CQ_min + t_min) - (t_h + t_skew)", s: "(300e-12 + 30e-12) - (400e-12 + 750e-12) = -820e-12 s", unitConv: "ps = 10^(-12) s -> 1 / (2.59e-9) = 386.10e6 Hz" },
    buses: { f: "R_p_max = t_r_max / (0.8473 * C_bus)", s: "(300e-9) / (0.8473 * 100e-12) = 3.54e3 Ohm", unitConv: "t_r in ns (10^(-9)), C_bus in pF (10^(-12)) -> R in kOhm (10^3)" },
    "python-scpi": { f: "FPY = (N_pass_1 / N_valid) * 100", s: "(92 / 100) * 100 = 92.0%", unitConv: "Enforce math.isfinite() -> PASS / FAIL / INVALID" },
    linux: { f: "DPPM = (Defects / Total) * 10^6", s: "(2 / 50e3) * 10^6 = 40.0 DPPM", unitConv: "Capture dmesg/lspci BEFORE reboot ($?=0 != DUT PASS)" },
    rf: { f: "Gamma = (Z_L - Z_0) / (Z_L + Z_0)", s: "(100 - 85) / (100 + 85) = 81.1e-3", unitConv: "Gen5 32e9 T/s -> 1 UI = 31.25e-12 s (31.25 ps)" },
    qualification: { f: "Guardband = Limit - Uncertainty ;   Q_rad = e * sigma * A * (T_1^4 - T_2^4)", s: "3.30 - 0.020 = 3.280 V", unitConv: "TVAC <10^(-5) Torr: convection h = 0 W/m^2*K" },
    safety: { f: "P_fault = V_rail^2 / R_short ;   I_lim = 1.2 * I_idle", s: "(5.0^2) / (10e-3) = 2.50e3 W", unitConv: "Always set PSU CC current limit before energizing board" },
    automation: { f: "FPY = (N_pass_1 / N_valid) * 100", s: "(95 / 100) * 100 = 95.0%", unitConv: "Never coerce NaN to 0.0; log first attempt separately" },
    thermal: { f: "T_J = T_A + P_d * theta_JA", s: "25 + (5.0 * 12) = 85 C", unitConv: "Wait for dT/dt soak equilibrium before logging" },
    rca: { f: "A -> B -> A Swap ;   R_eq = R_nom / N_healthy", s: "1.0 / (100 - 5) = 10.53e-3 Ohm", unitConv: "Move ONE suspect variable at a time (KGB comparison)" },
    electrical: { f: "DeltaV = I * R_PDN + L_pkg * (dI / dt)", s: "(40 * 2e-3) + (250e-12 * (40 / 20e-9)) = 580e-3 V", unitConv: "pH (10^(-12)) * A / ns (10^(-9)) = mV (10^(-3) V)" },
    dram: { f: "ΔV_BL = (V_cell - V_PRE) * (C_cell / (C_cell + C_BL))", s: "(1.10 - 0.55) * (25e-15 / (25e-15 + 225e-15)) = 55.0e-3 V", unitConv: "C_cell in fF (10^(-15) F); Hot >85C t_REFI drops 3.9us -> 1.95us" },
    "memory-ddr": { f: "ΔV_BL = (V_cell - V_PRE) * (C_cell / (C_cell + C_BL))", s: "(1.10 - 0.55) * (25e-15 / 250e-15) = 55.0e-3 V", unitConv: "BW = (3200e6 * 64)/8 = 25.6e9 B/s; t_RC = t_RAS + t_RP" },
    socboot: { f: "t_rel >= max(t_VDD, t_CLK) + t_POR", s: "25e-3 + 5e-3 = 30.0e-3 s", unitConv: "ms = 10^(-3) s; check PWRGOOD -> REFCLK -> PERST#" },
    pcie: { f: "BW_eff = R_lane * N_lanes * (128/130) / 8", s: "16e9 * 16 * (128/130) / 8 = 31.51e9 B/s", unitConv: "16 GT/s = 16e9 T/s; check LnkCap vs LnkSta & AER" },
    gpu: { f: "P_total = alpha * C * V^2 * f + V * I_leak", s: "1.0 * 100e-6 * 0.85^2 * 2e9 = 144.5 W", unitConv: "Capture nvidia-smi -q & dmesg BEFORE rebooting Xid 79" },
    ate: { f: "T_min = t_CQ + t_logic + t_su + t_skew", s: "(950e-12 + 590e-12 + 300e-12 + 750e-12) = 2.59e-9 s", unitConv: "f_max = 1 / (2.59e-9) = 386.10e6 Hz; pass lot/wafer/step" },
    pvt: { f: "Margin_pct = ((V_fused - V_min) / V_fused) * 100", s: "((0.850 - 0.748) / 0.850) * 100 = 12.0%", unitConv: "Slow/Hot degrades Setup; Fast/Cold provokes Hold/ZQCal" },
    linux: { f: "DPPM = (Defects / Total) * 10^6", s: "(2 / 50e3) * 10^6 = 40.0 DPPM", unitConv: "grep exit 0=match, 1=no match, 2+=error" },
    python: { f: "FPY = (N_pass_1 / N_valid) * 100", s: "(92 / 100) * 100 = 92.0%", unitConv: "math.isfinite(val) catches float('nan') & inf" },
    quality: { f: "RTY = y_1 * y_2 ;   DPPM = (Defects / Units) * 10^6", s: "(0.92 * 0.95) * 100 = 87.4%", unitConv: "Track Attempt #1 FPY separately from Retest Yield" },
    interview: { f: "DeltaV = I * R_PDN + L_pkg * (dI / dt)", s: "(40 * 2e-3) + (250e-12 * 2e9) = 580e-3 V", unitConv: "CH1 CLK (SMA) | CH2/4 N7020A Rails | CH3 1169B Shunt" },
    "si-pi": { f: "DeltaV = I * R_PDN + L_pkg * (dI / dt)", s: "(40 * 2e-3) + (250e-12 * (40 / 20e-9)) = 580e-3 V", unitConv: "pH (10^(-12)) * A / ns (10^(-9)) = mV (10^(-3) V)" },
    "timing-sta": { f: "T_min = t_CQ + t_logic + t_su + t_skew ;   HoldSlack = (t_CQ_min + t_min) - (t_h + t_skew)", s: "(300e-12 + 30e-12) - (400e-12 + 750e-12) = -820e-12 s", unitConv: "ps = 10^(-12) s -> 1 / (2.59e-9) = 386.10e6 Hz" },
    "soc-boot": { f: "t_rel >= max(t_VDD, t_CLK) + t_POR", s: "25e-3 + 5e-3 = 30.0e-3 s", unitConv: "Verify PWRGOOD -> REFCLK -> PERST# before BIOS console" },
    "ddr-lpddr": { f: "ΔV_BL = (V_cell - V_PRE) * (C_cell / (C_cell + C_BL))", s: "(1.10 - 0.55) * (25e-15 / (25e-15 + 225e-15)) = 55.0e-3 V", unitConv: "25 fF = 25 * 10^(-15) F; Hot >85C t_REFI drops 3.9us -> 1.95us" },
    "pcie-hsio": { f: "Gamma = (Z_L - Z_0) / (Z_L + Z_0) ;   UI = 1 / R_lane", s: "(100 - 85) / (100 + 85) = 81.1e-3", unitConv: "32 GT/s = 32e9 T/s -> 1 UI = 31.25e-12 s (31.25 ps)" },
    "bench-instruments": { f: "I_load = V_sense / R_shunt ;   BW_sys >= 0.5 / t_rise", s: "(25e-3) / (5e-3) = 5.00 A", unitConv: "Ch1 SMA CLK | Ch2/4 N7020A Rails | Ch3 1169B Shunt" },
    "linux-slt": { f: "DPPM = (Defects / Total) * 10^6", s: "(2 / 50e3) * 10^6 = 40.0 DPPM", unitConv: "Save dmesg/lspci/nvidia-smi BEFORE reboot ($?=0 != PASS)" },
    "python-automation": { f: "FPY = (N_pass_1 / N_valid) * 100", s: "(92 / 100) * 100 = 92.0%", unitConv: "Check math.isfinite(val) to block NaN/Inf False-Clean PASS" },
    "ate-dft-slt": { f: "T_min = t_CQ + t_logic + t_su + t_skew", s: "(950e-12 + 590e-12 + 300e-12 + 750e-12) = 2.59e-9 s", unitConv: "ATE structural scan != full-system SLT transient droops" },
    "socket-assembly": { f: "R_contact = R_meas - R_2W_leads", s: "45.0e-3 - 240.0e-3 -> Use 4W Kelvin", unitConv: "Inspect bent pins, FOD, torque & thermal warpage + A-B-A" },
    "high-level-debug": { f: "A -> B -> A Swap ;   Margin = Limit - (Meas + U)", s: "3.30 - (3.18 + 20e-3) = 100e-3 V", unitConv: "Freeze DUT -> Pull raw logs -> Check power/socket -> A-B-A" },
    "panel-career": { f: "DeltaV = I * R_PDN + L_pkg * (dI / dt)", s: "(40 * 2e-3) + (250e-12 * 2e9) = 580e-3 V", unitConv: "CPU2 4-Ch Scope + DRAM raw vs parser + Intel/Cisco A-B-A" }
  };
  const def = topicDefaults[tid] || topicDefaults.ohm;
  const formula = hasRealFormula ? rawFormula : def.f;
  const sub = (q && q.sub) ? q.sub : (q && q.expected !== undefined ? `Result = ${q.expected} ${q.unit || ""}` : def.s);
  const givensList = parseGivenQuantities((q && q.question) || "");
  const rawUC = String((q && q.unitConv) || "").trim();
  const isPureMathUC = rawUC && /[=<>]/.test(rawUC) && !/[a-z]{5,}\s+[a-z]{5,}/i.test(rawUC);
  const prefixEq = isPureMathUC ? rawUC
    : givensList.length
      ? givensList.slice(0, 3).map(g => g.prefixChar ? `${g.num}*${g.unitStr} = ${g.num} * 10^(${g.exp}) ${g.baseUnit}` : `${g.num} ${g.baseUnit} = ${g.num} * 10^0 ${g.baseUnit}`).join(" ; ")
      : "1 p = 10^(-12) ; 1 n = 10^(-9) ; 1 u = 10^(-6) ; 1 m = 10^(-3) ; 1 k = 10^3 ; 1 M = 10^6";
  const convExplain = buildConversionExplanation((q && q.question) || "");
  return {
    formula,
    sub,
    prefixEq,
    unitConv: `${def.unitConv}${convExplain ? " · " + convExplain : ""}`
  };
}

function renderHiringManagerInterviewScript(q, t, isNvidia) {
  const tid = (t && t.id) || "";
  const txt = ((q && q.id) || "") + " " + ((q && q.question) || "") + " " + tid;
  const note = isNvidia ? (NVIDIA_TRACK_LECTURES[tid] || NVIDIA_TRACK_LECTURES.electrical) : (TOPIC_PROFESSOR_NOTES[tid] || TOPIC_PROFESSOR_NOTES.ohm);
  const phys = inferTopicPhysicsModel(q, t, isNvidia);
  const qidLabel = String((q && q.id) || "ACTIVE").toUpperCase();
  const isNum = isNvidia ? (q && (q.questionType === "number" || q.kind === "calc")) : (q && q.expected !== undefined);
  const targetStr = isNum ? `${fmt(q.expected)} ${q.unit || ""}` : (q && (q.skillName || q.learningObjective || t.title));
  const convStr = buildConversionExplanation((q && q.question) || "");

  // Custom high-value spoken script for the 100-resistor interview question or active question
  const is100R = /100.*resistor|100\s*x|1\s*ω.*parallel|parallel-x[789]/i.test(txt);
  const roleLabel = isNvidia ? "NVIDIA SLT Engineering Panel" : "Muon Space Avionics Hiring Manager";

  const spokenAnswer = (q && q.interviewAnswer) ? q.interviewAnswer : is100R
    ? "As a hardware test engineer, I solve the paper math in 10^(3n) engineering notation BEFORE touching probes: 100 parallel 1 Ω resistors have healthy R_eq = 1/100 = 10×10⁻³ Ω (drawing 500 A / 2.5 kW at 5 V!). Because standard 2-wire DMM leads (~0.24 Ω) create +2400% error here, I open the schematic to map +5V_MAIN and bank jumpers JP1–JP10, switch to 4-wire Kelvin mode, and clear 0 Ω shorts FIRST (because any short masks opens). I apply a safe current-limited 1 V / 2.5 A supply, pinpoint hot-spot shorts with an IR thermal camera and mV gradient, lift one pad per suspect (0.000 Ω confirms short) until 4-wire R_eq ≥ 10.00 mΩ, then solve N_open = 100 − 1/R_eq and identify the ∞ Ω opens as 25 °C cold spots against 60 °C healthy resistors on IR."
    : isNum
      ? `When solving ${qidLabel} (${t?.title || ""}) on real flight/post-silicon hardware, first I convert all given prefixes into base 10^(3n) SI units (${convStr}) and apply the governing law ${phys.formula} to predict an exact paper target of ${targetStr}. Next I open the schematic to trace the source node, sense test points, and ground return, verify power-off resistance before enabling a current-limited PSU, and compare the oscilloscope/DMM measurement against my ${targetStr} bound—confirming any anomaly with a single-variable A-B-A swap before replacing parts.`
      : `First I separate the reported symptom from any unproven hypothesis and solve the governing healthy baseline (${phys.formula} -> ${targetStr}) in 10^(3n) SI units before probing. Second, on the schematic I locate the exact supply rail, series shunt, pull-up, or clock test points and configure safe current-limited measurements (4-wire Kelvin for milliohms, or Keysight N7020A + <5 mm spring ground on Ch1–Ch4). Third, I isolate fault vs. fixture via single-variable A-B-A swap, apply the targeted hardware/firmware fix, and verify full pass margin on the product.`;

  const step1Pic = `Locate the active nodes, return path (GND), series/parallel junctions, test points, or decoupling caps on the ${isNvidia ? "SoC/GPU board schematic" : "flight PCBA schematic"} for "${t?.title || "circuit"}". Physics: ${isNvidia ? note.physics : note.intuition}`;
  const step2Math = `Convert every prefix cleanly (p=10⁻¹², n=10⁻⁹, µ=10⁻⁶, m=10⁻³, k=10³, M=10⁶, G=10⁹) FIRST -> Apply ${phys.formula} -> Compute ${phys.sub} (Target: ${targetStr}). Never plug raw mA or kΩ without 10^(3n) scaling!`;
  const step3Order = isNvidia
    ? `1) Freeze DUT—do NOT reboot! Pull raw dmesg/lspci/nvidia-smi -q/EDAC logs BEFORE clearing counters. 2) Set up 4-channel Keysight scope (CH1 CLK SMA-BNC, CH2 Core N7020A, CH3 1169B Shunt, CH4 M-Rail N7020A) and deskew CH3 vs CH2. 3) Verify PSU rails & BGA socket pogo pins.`
    : `1) Check resistance & shorts POWER-OFF (using 4-wire Kelvin below 1 Ω so lead resistance ~0.24 Ω doesn't swamp reading). 2) Energize via CC-limited supply. 3) Measure voltage in PARALLEL, current via differential shunt or series break, and scope clocks with <5 mm ground springs.`;
  const step4Product = is100R
    ? `Phase A (Shorts First): With 1 V / 2.5 A CC bias, shoot IR thermal image + step mV probe along copper pour toward lowest V -> lift 1 pad per suspect (0.000 Ω confirms dead short) until 4W R_eq ≥ 10 mΩ. Phase B (Opens Second): Compute N_open = 100 − 1/R_eq, image warmed 1 Ω resistors (~60 °C) vs cold 25 °C open resistors on IR, rework tombstoned/cracked pads, and verify full-board 4W R_eq = 10.00 mΩ.`
    : `Execute controlled single-variable A -> B -> A swap using a Known-Good Fixture/Cable/Board (KGB). Fault moves with DUT = silicon/PCBA failure; fault stays in slot = harness/pogo-pin/bench setup failure. Apply corrective rework or FW fix, then retest across temperature/load corners inside guardbanded spec limits.`;

  const badgeCls = isNvidia ? "nvs-prof-badge" : "av-prof-badge";
  const boxCls = isNvidia ? "nvs-prof-box prof-interview-box" : "av-prof-box prof-interview-box";

  return `<section class="${boxCls}" aria-label="Hiring Manager Interview Answer and Real-Product Execution">
    <h4><span class="${badgeCls}">🎤 ${esc(roleLabel)} Readiness</span> Complete Engineer Answer, Post-Math Product Steps &amp; Follow-Up Defense (${esc(qidLabel)})</h4>
    <div class="prof-interview-say">
      <strong>⏱️ Part 1 · 60-Second Spoken Answer to Deliver to the Hiring Manager:</strong>
      <p>"${esc(spokenAnswer)}"</p>
    </div>
    <div class="prof-interview-grid">
      <div class="prof-interview-card">
        <h5>🔬 Step 1 · Start With the Schematic &amp; Physical Model</h5>
        <p>${esc(step1Pic)}</p>
      </div>
      <div class="prof-interview-card">
        <h5>🧮 Step 2 · Solve the Paper Math in 10<sup>3n</sup> First</h5>
        <div style="margin:6px 0;">${eq(phys.formula)}</div>
        <div style="margin:6px 0;">${eq(phys.sub)}</div>
        <p style="font-size:0.84rem;color:#334155;">${esc(step2Math)}</p>
      </div>
      <div class="prof-interview-card">
        <h5>🎛️ Step 3 · Instrument, Probe &amp; Measurement Order</h5>
        <p>${esc(step3Order)}</p>
      </div>
      <div class="prof-interview-card">
        <h5>🛠️ Step 4 · Real-Product Isolation &amp; Fix (Engineer Level)</h5>
        <p>${esc(step4Product)}</p>
      </div>
    </div>
    <details class="prof-interview-defense" open>
      <summary>🛡️ Part 3 · "If the Hiring Manager Asks..." Deeper Follow-Up Defense Q&amp;A</summary>
      <div class="prof-qa-list">
        <div class="prof-qa-item">
          <strong>Q1: Why solve the ${esc(phys.formula)} math in 10<sup>3n</sup> on paper BEFORE probing the product?</strong>
          <p>Because probing blindly turns you into a trial-and-error technician. Knowing the exact theoretical target (${esc(targetStr)}) lets you set safe PSU current limits before smoke occurs, detect instrument loading errors (e.g., 10 MΩ DMM or 0.24 Ω 2-wire leads), and immediately tell a healthy board from a shifted margin or hidden short.</p>
        </div>
        <div class="prof-qa-item">
          <strong>Q2: How do you prove your scope / DMM / script isn't lying to you?</strong>
          <p>${esc(note.trap)} Always null/4-wire Kelvin low-ohm paths, verify 10× attenuation &amp; divider ratios, keep scope grounds &lt; 5 mm (or use N7020A + 1169B differential), and audit raw telemetry instead of trusting summary PASS flags.</p>
        </div>
        <div class="prof-qa-item">
          <strong>Q3: How do you prove whether the failure belongs to the product hardware vs. your test fixture or cable?</strong>
          <p>Run a single-variable A → B → A cross-swap holding temperature, rail voltage, and firmware constant. Only replace or condemn flight/production silicon when the exact signature follows the DUT into a known-good fixture and returns when put back.</p>
        </div>
      </div>
    </details>
  </section>`;
}

/* ============================================================================
   5. AVIONICS PROFESSOR STEPS BUILDER (Non-Repetitive, Zero-to-One Chalkboard)
   ============================================================================ */
function buildAvionicsProfessorSteps(q, t, f, helpers) {
  const st = Array.isArray(q.steps) ? q.steps : [];
  const beginner = f && f.deep ? f.deep : null;
  const guided = q.lesson || null;
  const phys = inferTopicPhysicsModel(q, t, false);
  const formulaStr = (q.formula && !String(q.formula).includes("->")) ? q.formula : phys.formula;
  const subStr = q.sub || phys.sub;
  const fmtFn = (helpers && helpers.fmt) || fmt;
  const engFn = (helpers && helpers.engVal) || engVal;
  const note = TOPIC_PROFESSOR_NOTES[t.id] || TOPIC_PROFESSOR_NOTES.ohm;

  // CRITICAL INVARIANT: Preserve exact step counts expected by all suites:
  // - 8 steps for q.advancedStage >= 31
  // - 7 steps for f.label === "SI base unit"
  // - 6 steps for Q1-Q30 otherwise
  if (q.advancedStage >= 31) {
    const advTitles = [
      "1. Physical Concept, Schematic Node Target & 10^(3n) SI Units",
      "2. Convert Givens to 10^(3n) Base SI & Separate Symptom from Guess",
      "3. Predict Healthy Baseline Using Governing Law (MathML)",
      "4. Solve & Compare 10^(3n) Substitution Before Energizing",
      "5. Safe Non-Destructive Measurement & Hardware Verification",
      "6. Falsify Alternatives via Single-Variable A/B/A Swap",
      "7. Cross-Check on Independent Instrument / Product Channel",
      "8. Final Engineer Disposition, Root-Cause Fix & Interview Answer"
    ];
    return st.slice(0, 8).map((body, i) => ({
      title: advTitles[i] || `Step ${i + 1}: Analyze and verify`,
      body: i === 1 ? `${body} [10^(3n) Prefix check: ${buildConversionExplanation(q.question)}]`
          : i === 5 ? `${body} Watch for trap: ${note.trap}` : body,
      kind: q.expected !== undefined && i === 4 ? "answer" : (i === 2 || i === 3 ? "formula" : "text"),
      formula: i === 2 ? formulaStr : (i === 3 ? subStr : null),
      answer: q.expected !== undefined && i === 4 ? fmtFn(q.expected) + " " + q.unit : null,
      engHtml: q.expected !== undefined && i === 4 ? engFn(q.expected, q.unit) : null
    }));
  }

  // Numerical Calculation Problems (Q11-Q20): Always 6 steps with 10^(3n) MathML + Post-Math Bench Execution
  if (q.expected !== undefined) {
    const convText = buildConversionExplanation(q.question);
    const step4Detail = `${st[1] || "Substitute every converted base-SI value (10^(3n)) into the governing formula."} Full check: ${subStr}`;
    const step6Bench = `${st[2] || ""} ${st[3] || ""} Post-Math Product Execution: Locate the exact schematic nodes/jumpers, verify with a current-limited supply & calibrated DMM/scope (Watch trap: ${note.trap}), then speak both ${fmtFn(q.expected)} ${q.unit} and your isolation method cleanly to the hiring manager.`.trim();
    return [
      {
        title: `1. Physical Picture, Schematic Trace & Target (${q.unit})`,
        body: `Visualize what is happening physically in "${t.title}": ${note.intuition} Solve for a physical quantity in "${q.unit}".`,
        kind: "text"
      },
      {
        title: "2. Extract Givens & Convert Prefixes to 10^(3n) Base SI FIRST",
        body: `Always convert m (10⁻³), µ (10⁻⁶), n (10⁻⁹), p (10⁻¹²), k (10⁺³), M (10⁺⁶) BEFORE plugging into formulas: ${convText}`,
        kind: "given",
        formula: phys.prefixEq
      },
      {
        title: "3. Governing Engineering Equation (Stacked MathML)",
        body: `${st[0] || "Write the governing physical equation."} Why it holds: ${note.lawWhy}`,
        kind: "formula",
        formula: formulaStr
      },
      {
        title: "4. Step-by-Step 10^(3n) Algebraic Substitution (Uncut Work)",
        body: step4Detail,
        kind: "formula",
        formula: subStr
      },
      {
        title: "5. Final Numerical Result & 10^(3n) Engineering Notation",
        body: `Compute cleanly to get ${fmtFn(q.expected)} ${q.unit}. Verify powers of 10 cancellation and sign before entering on Page 4.`,
        kind: "answer",
        answer: fmtFn(q.expected) + " " + q.unit,
        engHtml: engFn(q.expected, q.unit)
      },
      {
        title: "6. Post-Math Hardware Resolution & Interview Delivery",
        body: step6Bench,
        kind: "text"
      }
    ];
  }

  // Troubleshooting Problems (Q21-Q30): Complete Math + Schematic + Probe + A-B-A Product Fix
  if (q.level === "Troubleshooting") {
    return [
      {
        title: "1. Isolate Observable Symptom vs. Unverified Hypothesis",
        body: `${st[0] || q.question} Rule #1: state only observed meter/scope/log behavior—never blame silicon/PCBA without isolation.`,
        kind: "text"
      },
      {
        title: "2. Pre-Probe 10^(3n) Paper Math & Safety Setup",
        body: `${st[1] || "Set PSU current limit and verify power-off resistance before energizing."} Prefix & sanity check: ${phys.unitConv}`,
        kind: "given",
        formula: phys.prefixEq
      },
      {
        title: "3. Predict Healthy Baseline With Governing Law (MathML)",
        body: `${st[2] || "Calculate the healthy voltage, current, time constant, or waveform before touching probes."} Why it applies: ${note.lawWhy}`,
        kind: "formula",
        formula: formulaStr
      },
      {
        title: "4. Evaluate 10^(3n) Quantitative Example & Contrast Fault Signature",
        body: `${st[3] || f.test || "Measure both sides of the suspect interface (source vs. load) to localize the fault."} Watch for: ${note.trap}`,
        kind: "formula",
        formula: subStr
      },
      {
        title: "5. Controlled A-B-A Swap Proof & Real-Product Isolation",
        body: `Locate schematic test points/jumpers, isolate defect via single-variable A -> B -> A swap (fault moves with suspect DUT vs stays in fixture/harness). ${st[4] || ""}`.trim(),
        kind: "text"
      },
      {
        title: "6. Engineer Resolution, Go/No-Go Disposition & Spoken Answer",
        body: `${st[5] || "Apply the targeted hardware/rework fix, re-verify under full load, and deliver the 4-step proof (Math -> Schematic -> Bench -> A-B-A Fix) to the hiring manager."}`,
        kind: "answer"
      }
    ];
  }

  // Foundations / Application (Q1-Q10): Never skip equations or bench application!
  const stepsOut = [
    {
      title: `1. Physical First Principle (${f.label})`,
      body: `${st[0] || f.definition} Physically: ${note.intuition}`,
      kind: "text"
    },
    {
      title: "2. 10^(3n) Prefix Scale & What the Bench Instrument Measures",
      body: `${st[1] || "Identify exact two nodes for voltage, broken series loop for current, or scope test point."} Engineering scale: ${phys.unitConv}`,
      kind: "given",
      formula: phys.prefixEq
    },
    {
      title: "3. Governing Engineering Equation & Physical Meaning (MathML)",
      body: `Define every symbol in base 10^(3n) SI units before using it: ${st[2] || note.lawWhy}`,
      kind: "formula",
      formula: formulaStr
    },
    {
      title: "4. Concrete 10^(3n) Worked Substitution & Operating Point",
      body: `${st[3] || (guided ? guided.example : (beginner ? beginner.example : "Trace how the equation predicts the bench measurement."))}`,
      kind: "formula",
      formula: subStr
    },
    {
      title: "5. Post-Math Bench Action on Real Product Hardware & Common Trap",
      body: `Trap to avoid: ${note.trap} Hardware action: ${st[4] || f.why}`,
      kind: "text"
    },
    {
      title: "6. Hiring-Manager Spoken Interview Delivery",
      body: `Deliver in engineer order: (1) Define ${f.label} & equation ${formulaStr}, (2) cite 10^(3n) prediction, (3) explain schematic/probe check (${st[st.length - 1] || f.test}), and (4) state the verification fix.`,
      kind: "answer"
    }
  ];

  if (f.label === "SI base unit") {
    stepsOut.splice(5, 0, {
      title: "6a. Seven SI Base Units vs. Derived Electrical Units (Table 1-1)",
      body: "The 7 SI base units are meter (m), kilogram (kg), second (s), ampere (A), kelvin (K), mole (mol), and candela (cd). Only ampere (A) is electrical! Volt (J/C = kg·m²/(A·s³)), ohm (V/A), watt (J/s), farad, and coulomb are derived units. Radian and steradian were reclassified as dimensionless derived units in 1995.",
      kind: "text"
    });
  }
  return stepsOut;
}

/* ============================================================================
   6. AVIONICS UI PANELS (Page 1 Understand, Page 2 Visuals, Page 3 Work, Page 4 Try)
   ============================================================================ */
let activeCourseFilter = "matched";
let courseBankOpen = false;
let revealedCourseSolutions = new Set(["CW-DC-01", "CW-LAB-02"]);

function renderCourseworkBankHTML(t) {
  const tid = (t && t.id) || "ohm";
  const matchedItems = AVIONICS_WORKED_BANK.filter(x => Array.isArray(x.topicIds) && x.topicIds.includes(tid));
  const items = activeCourseFilter === "matched"
    ? (matchedItems.length ? matchedItems : AVIONICS_WORKED_BANK.slice(0, 4))
    : activeCourseFilter === "all"
      ? AVIONICS_WORKED_BANK
      : AVIONICS_WORKED_BANK.filter(x => x.cat === activeCourseFilter);

  const filters = [
    ["matched", `This Topic: ${t ? t.title : tid} (${matchedItems.length})`],
    ["dc_networks", "DC, Ohm/Watt & Bridges"],
    ["analog_devices", "Rectifier, Zener, LDO & BJT"],
    ["digital_timing", "Clock Timing, Setup/Hold & PWM"],
    ["lab_tvac", "10MΩ DMM, 100×1Ω & TVAC"],
    ["all", "All Worked Manual (" + AVIONICS_WORKED_BANK.length + ")"]
  ];
  return `<details class="av-prof-bank" id="avProfCourseworkBank" ${courseBankOpen ? "open" : ""}>
    <summary>📚 Topic-Matched Worked Practice Manual (${esc(t ? t.title : "Avionics EE")} · 10<sup>3n</sup> Step-by-Step Solutions)</summary>
    <div class="av-prof-bank-body">
      <p style="margin-top:0;font-size:0.9rem;color:#334155;">Filtered directly to <strong>${esc(t ? t.title : "this topic")}</strong> by default—every problem shows <strong>10<sup>3n</sup> prefix conversions, full algebra, intermediate arithmetic, and bench resolution</strong>.</p>
      <div class="av-prof-filters" role="group" aria-label="Filter worked Avionics problems">
        ${filters.map(([k, lbl]) => `<button type="button" class="av-prof-filter-btn ${activeCourseFilter === k ? "active" : ""}" data-av-cw-filter="${k}">${esc(lbl)}</button>`).join("")}
      </div>
      ${items.map(item => {
        const isOpen = revealedCourseSolutions.has(item.id);
        return `<article class="av-prof-prob-card" data-cw-id="${esc(item.id)}">
          <div class="av-prof-prob-head">
            <span class="av-prof-prob-title">${esc(item.id)}: ${esc(item.title)}</span>
            <span class="av-prof-prob-src">${esc(item.src)}</span>
          </div>
          <p style="font-size:0.92rem;font-weight:500;color:#0f172a;">${esc(item.prompt)}</p>
          <p style="font-size:0.84rem;color:#475569;"><strong>First-Principles Theory Prerequisite:</strong> ${esc(item.prereq)}</p>
          <div class="av-prof-mini-check">
            <button type="button" class="av-prof-toggle-sol" data-av-cw-sol="${esc(item.id)}">${isOpen ? "Hide Worked Solution" : "Show Complete Professor Solution (All Steps)"}</button>
            <input type="text" data-av-cw-input="${esc(item.id)}" placeholder="Try numerical answer (${esc(item.unit)})">
            <button type="button" data-av-cw-check="${esc(item.id)}">Check</button>
            <span class="av-prof-mini-status" data-av-cw-status="${esc(item.id)}"></span>
          </div>
          ${isOpen ? `<div class="av-prof-prob-sol">
            <div><strong>Governing Formula (Stacked MathML):</strong></div>
            <div style="margin:4px 0;">${eq(item.formula)}</div>
            <ol>${item.steps.map(s => `<li>${rich(s)}</li>`).join("")}</ol>
            <div style="font-weight:700;color:#065f46;">Verified Result: ${esc(fmt(item.expected))} ${esc(item.unit)} · ${engVal(item.expected, item.unit)}</div>
          </div>` : ""}
        </article>`;
      }).join("")}
    </div>
  </details>`;
}

function renderAvionicsUnderstandLecture(q, t, f) {
  const note = TOPIC_PROFESSOR_NOTES[t.id] || TOPIC_PROFESSOR_NOTES.ohm;
  const givens = parseGivenQuantities(q.question);
  const convRow = givens.length
    ? `<table class="av-prof-table"><thead><tr><th>Raw Value in Question</th><th>Prefix</th><th>Power of 10</th><th>Base SI Value</th></tr></thead><tbody>${givens.map(g => `<tr><td><code>${esc(g.raw)}</code></td><td>${esc(g.prefixName)}</td><td>10<sup>${g.exp}</sup></td><td><strong>${esc(fmt(g.baseVal))} ${esc(g.baseUnit)}</strong></td></tr>`).join("")}</tbody></table>`
    : `<p><em>Qualitative / conceptual question:</em> identify nodes, signal direction, and measurement reference before choosing any formula.</p>`;

  return `<section class="av-prof-box" aria-label="Professor zero-to-one lecture">
    <h4><span class="av-prof-badge">Professor's Lecture</span> Ground-Up Intuition &amp; 10<sup>3n</sup> Prefix Anatomy for ${esc(q.id.toUpperCase())}</h4>
    <div class="av-prof-grid">
      <div class="av-prof-card">
        <h5>1. Physical Intuition (Zero Prerequisite)</h5>
        <p>${esc(note.intuition)}</p>
      </div>
      <div class="av-prof-card">
        <h5>2. Why the Governing Law Works</h5>
        <p>${esc(note.lawWhy)}</p>
      </div>
    </div>
    <div class="av-prof-card" style="margin-top:10px;">
      <h5>3. Given Quantities &amp; 10<sup>3n</sup> Engineering Notation Table</h5>
      ${convRow}
    </div>
    <div class="av-prof-trap"><strong>⚠️ Common Beginner &amp; Bench Trap:</strong> ${esc(note.trap)}</div>
  </section>${renderHiringManagerInterviewScript(q, t, false)}${renderCourseworkBankHTML(t)}`;
}

function renderAvionicsVisualGuide(q, t) {
  const note = TOPIC_PROFESSOR_NOTES[t.id] || TOPIC_PROFESSOR_NOTES.ohm;
  const sp = window.PROFESSOR_NOTEBOOK_SPREADS;
  return `${sp ? sp.renderQuestionNotebookSpread(q, t, false) : ""}<section class="av-prof-box" aria-label="Professor schematic and bench reading guide">
    <h4><span class="av-prof-badge">Visual Reading Guide</span> How an Engineer Reads These Diagrams &amp; Applies Them on Hardware (${esc(q.id.toUpperCase())})</h4>
    <div class="av-prof-grid">
      <div class="av-prof-card">
        <h5>Diagram 1 — Schematic Nodes &amp; Loop Trace</h5>
        <p>Start at the positive rail (+), trace every dot junction (shared node voltage), and verify the unbroken return path to ground (−). Identify bank jumpers or series shunts BEFORE powering up.</p>
      </div>
      <div class="av-prof-card">
        <h5>Diagram 2 — Operating Curve &amp; Scope Waveform</h5>
        <p>Check horizontal and vertical 10<sup>3n</sup> axes first. Locate the magenta Operating Point (Q-pt) and slope (1/R, −3 dB cutoff, or A→B Δt) against safe design guardbands.</p>
      </div>
      <div class="av-prof-card">
        <h5>Diagram 3 — Breadboard, DMM &amp; 4W Kelvin</h5>
        <p>Verify 5-hole vertical strips, place voltmeters in PARALLEL, measure resistance POWER-OFF (use 4W Kelvin &lt;1 Ω), and guard against: <strong>${esc(note.trap)}</strong></p>
      </div>
    </div>
  </section>`;
}

function renderAvionicsChalkboard(q, t) {
  const phys = inferTopicPhysicsModel(q, t, false);
  const convText = buildConversionExplanation(q.question);
  const formulaStr = (q.formula && !String(q.formula).includes("->")) ? q.formula : phys.formula;
  const subStr = q.sub || phys.sub;
  const note = TOPIC_PROFESSOR_NOTES[t.id] || TOPIC_PROFESSOR_NOTES.ohm;
  const steps = Array.isArray(q.steps) ? q.steps : [];
  const sp = window.PROFESSOR_NOTEBOOK_SPREADS;

  return `${sp ? sp.renderQuestionNotebookSpread(q, t, false) : ""}<section class="av-prof-chalkboard" aria-label="Professor chalkboard full derivation">
    <h4>🧮 Complete Chalkboard Solution (10<sup>3n</sup> Engineering Notation &amp; Product Steps)</h4>
    <div class="av-prof-chalk-step">
      <strong>STEP A · GIVEN INPUTS &amp; 10^(3n) BASE-SI CONVERSIONS</strong>
      <div>${esc(convText)}</div>
    </div>
    <div class="av-prof-chalk-step">
      <strong>STEP B · GOVERNING LAW &amp; SYMBOL DEFINITIONS (STACKED MATHML)</strong>
      <div>${eq(formulaStr)}</div>
      <small style="color:#cbd5e1;">Why it applies: ${esc(note.lawWhy)}</small>
    </div>
    <div class="av-prof-chalk-step">
      <strong>STEP C · FULL SUBSTITUTION &amp; WORKED INTERMEDIATE ARITHMETIC</strong>
      <div>${eq(subStr)}</div>
      ${steps.length ? `<ul style="margin:6px 0 0 18px;font-size:0.86rem;color:#e2e8f0;">${steps.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
    </div>
    <div class="av-prof-chalk-step">
      <strong>STEP D · FINAL ANSWER, POST-MATH CHECK &amp; DIMENSIONAL SANITY</strong>
      <div>${q.expected !== undefined ? `<code>${esc(fmt(q.expected))} ${esc(q.unit)}</code> &nbsp;·&nbsp; Engineering Notation: ${engVal(q.expected, q.unit)}` : "Compare observed telemetry against computed 10^(3n) baseline & verify via A-B-A swap."}</div>
      <small style="color:#fcd34d;">Guard against trap: ${esc(note.trap)}</small>
    </div>
  </section>${renderHiringManagerInterviewScript(q, t, false)}`;
}

let activeAvHint = 0;
function renderAvionicsTryCoach(q, t) {
  const note = TOPIC_PROFESSOR_NOTES[t.id] || TOPIC_PROFESSOR_NOTES.ohm;
  const hints = [
    ["Hint 1 · Physical Law", `Focus on "${t.title}": ${note.intuition}`],
    ["Hint 2 · Prefix Conversion", buildConversionExplanation(q.question)],
    ["Hint 3 · Formula Setup", q.formula ? `Start from: ${q.formula}. ${q.steps?.[0] || ""}` : `Start by describing what happens physically: ${q.steps?.[0] || ""}`],
    ["Hint 4 · Sanity Check", `${note.trap} ${q.expected !== undefined ? "Keep units strictly in " + q.unit + "." : "Name one measurement that disproves the wrong hypothesis."}`]
  ];
  const cur = hints[Math.min(activeAvHint, hints.length - 1)];
  return `<section class="av-prof-box" aria-label="Progressive hint ladder">
    <h4><span class="av-prof-badge">4-Stage Hint Coach</span> Need a gentle push before peeking at the full answer?</h4>
    <div class="av-prof-hints">
      ${hints.map((h, i) => `<button type="button" class="av-prof-hint-btn ${i === activeAvHint ? "active" : ""}" data-av-hint="${i}">${esc(h[0])}</button>`).join("")}
    </div>
    <div class="av-prof-hint-panel"><strong>${esc(cur[0])}:</strong> ${esc(cur[1])}</div>
  </section>`;
}

function bindAvionics(host, rerenderFn) {
  if (!host) return;
  if (window.PROFESSOR_NOTEBOOK_SPREADS) window.PROFESSOR_NOTEBOOK_SPREADS.bindNotebookSpreads(host, rerenderFn);
  const cwDet = host.querySelector("#avProfCourseworkBank");
  if (cwDet) {
    cwDet.addEventListener("toggle", () => { courseBankOpen = cwDet.open; });
  }
  host.querySelectorAll("[data-av-cw-filter]").forEach(btn => {
    btn.onclick = () => {
      courseBankOpen = true;
      activeCourseFilter = btn.dataset.avCwFilter || "all";
      if (typeof rerenderFn === "function") rerenderFn();
    };
  });
  host.querySelectorAll("[data-av-cw-sol]").forEach(btn => {
    btn.onclick = () => {
      courseBankOpen = true;
      const id = btn.dataset.avCwSol;
      if (revealedCourseSolutions.has(id)) revealedCourseSolutions.delete(id);
      else revealedCourseSolutions.add(id);
      if (typeof rerenderFn === "function") rerenderFn();
    };
  });
  host.querySelectorAll("[data-av-cw-check]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.avCwCheck;
      const item = AVIONICS_WORKED_BANK.find(x => x.id === id);
      const inp = host.querySelector(`[data-av-cw-input="${id}"]`);
      const st = host.querySelector(`[data-av-cw-status="${id}"]`);
      if (!item || !inp || !st) return;
      const raw = String(inp.value || "").trim().replace(/,/g, "");
      const m = raw.match(/^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/i);
      if (!m) {
        st.style.color = "#b91c1c";
        st.textContent = "Enter a number in " + item.unit;
        return;
      }
      const val = Number(m[0]);
      const tol = Math.max(0.02, Math.abs(item.expected) * 0.02);
      if (Math.abs(val - item.expected) <= tol) {
        st.style.color = "#065f46";
        st.textContent = "✓ Correct! (" + fmt(item.expected) + " " + item.unit + ")";
      } else {
        st.style.color = "#b91c1c";
        st.textContent = "Not quite — click 'Show Complete Professor Solution' and verify unit prefixes.";
      }
    };
  });
  host.querySelectorAll("[data-av-hint]").forEach(btn => {
    btn.onclick = () => {
      activeAvHint = Number(btn.dataset.avHint) || 0;
      const panel = host.querySelector(".av-prof-hint-panel");
      if (typeof rerenderFn === "function") rerenderFn();
      else if (panel) panel.dataset.hint = String(activeAvHint);
    };
  });
}

/* ============================================================================
   6. NVIDIA SLT PROFESSOR TRACK LIBRARY & 253-BOX MASTER STUDY BANK
   ============================================================================ */
const NVIDIA_TRACK_LECTURES = {
  electrical: {
    physics: "Every chip runs on copper Power Delivery Networks (PDNs) with DC resistance R_PDN and package inductance L_pkg. Steady current creates IR voltage drop (ΔV_DC = I·R_PDN), while sudden GPU/SoC turbo current transients di/dt create inductive droop (ΔV = L·di/dt). Kelvin 4-wire shunts separate load current from probe lead resistance.",
    instrument: "4-Channel Keysight Scope setup: Ch1 = Exported Clock (SMA-to-BNC), Ch2 = Logic Rail (N7020A Power-Rail Probe, high offset / low noise), Ch3 = Current-Sense Shunt Differential (1169B Probe), Ch4 = Memory M-Rail (N7020A). Never clip a grounded passive probe onto a non-ground high-side node!",
    trap: "Mixing mA and A creates a 1,000× power error; 2-wire DMM leads (~0.25 Ω) mask milliohm PDN shunts; long scope ground leads ring like antennas at 200+ MHz."
  },
  socboot: {
    physics: "SoC bring-up is a strict hardware state machine: (1) VR power rails ramp & assert PWRGOOD, (2) Crystal/PLL locks stable reference clocks, (3) CPLD/PMIC deasserts PERST#/RESET# only AFTER rails + clocks stabilize for t_wait, (4) Boot ROM fetches stage-1 firmware, trains DRAM, and enumerates PCIe.",
    instrument: "Synchronize PSU current limit + GPIO/UART early console + 4-channel scope single-shot trigger on PWRGOOD rising edge to verify reset-release sequencing before changing BIOS straps.",
    trap: "Assuming a silent console means dead SoC silicon! An invalid boot strap, stale SPI flash image checksum, or held CPLD reset pin creates identical black-screen symptoms."
  },
  dram: {
    physics: "A 1T1C DRAM cell stores 1 bit as femtocoulomb charge on a tiny capacitor accessed through one transistor. Reading is destructive (must restore), and charge leaks over ms (requires Refresh, especially at 85 °C+). Row activation waits t_RCD, active hold waits t_RAS, precharge waits t_RP, and full cycle time is t_RC = t_RAS + t_RP.",
    instrument: "DDR/LPDDR training calibrates V_ref and DQS sampling delay inside the data eye, plus ZQ impedance calibration. Compare per-lane Shmoo eye margin and ECC single-bit CE vs. double-bit UE counters directly against raw kernel/EDAC logs—never trust a summary script alone!",
    trap: "Production Case Study: A test summary printed 'DRAM PASS' while raw logs showed repeated bit flips because a report parser bug dropped error flags! Always cross-check raw telemetry before blaming or clearing silicon."
  },
  pcie: {
    physics: "PCIe uses AC-coupled differential pairs (100 Ω differential Z₀) clocked at 8/16/32/64 GT/s. Gen3+ uses 128b/130b encoding (efficiency 128/130 ≈ 98.46%). Link Training (LTSSM: Detect → Polling → Config → L0) negotiates speed (Gen1–5) and width (x1–x16) before OS enumeration.",
    instrument: "Inspect Linux `lspci -vvv` (LnkCap vs LnkSta for downgraded width/speed), `dmesg` AER correctable/replay counters under active DMA traffic, and differential TDR/eye plots with matched 50 Ω/100 Ω termination (Γ = (Z_L − Z₀)/(Z_L + Z₀)).",
    trap: "An idle link showing L0 x16 in `lspci` often hides signal integrity droop that only triggers AER replay storms under full workload traffic. Always run A-B-A swaps across endpoint, riser/cable, and host slot."
  },
  gpu: {
    physics: "A modern GPU combines thousands of parallel Streaming Multiprocessors (SMs), Copy Engines (CE/DMA), Display/NVLink blocks, and stacked HBM/GDDR framebuffer protected by ECC/SRAM row-remapping. Telemetry surfaces through Linux `nvidia-smi`, NVML, kernel Xid events, and DCGM diagnostics.",
    instrument: "Passive `dcgmi health -c` checks readiness; active `dcgmi diag -r 1/2/3` stresses PCIe, memory, and compute engines only when the GPU is idle. Always snapshot `nvidia-smi -q` BEFORE rebooting to preserve ECC volatile vs. aggregate counters and Xid context.",
    trap: "Treating an Xid number alone as root cause (e.g., Xid 79 fallen-off-bus can be PSU droop, PCIe riser, thermal shutdown, or GPU!) or mistaking thermal/power throttling for defective silicon."
  },
  ate: {
    physics: "ATE (Automated Test Equipment like Advantest V93000) screens individual packaged dies/packages with deterministic structural vectors: ATPG Scan Chains detect stuck-at/transition faults inside flip-flops, while MBIST tests on-chip SRAM. SLT adds full firmware, DRAM/PCIe integration, and sustained power transients that ATE misses.",
    instrument: "During cross-team handoff (ATE → DFT → ASIC Design → SLT), attach silicon lot/wafer/stepping (A0 vs B0), test-program hash, MBIST fail address bitmap, and failing scan shift chain index.",
    trap: "Running a B0 test program or wrong timing file on an A0 stepping unit causes massive false fallout; 100% ATE pass rate never equals 0 DPPM in real system workloads!"
  },
  pvt: {
    physics: "Silicon propagation delay and leakage shift continuously across PVT corners: slower transistors (Slow Process, Low Voltage, High Temp for some nodes / Temp-Inversion at sub-nm) shrink setup slack, while fast corners (Fast Process, High V_DD, Cold Temp) provoke Hold races.",
    instrument: "A 2D Shmoo plot sweeps Voltage (V_DD) on one axis vs. Frequency (f_clk) or temperature on the other to map the pass/fail cliff—and reveals the Setup vs. Hold distinction cleanly: Setup fails improve when f_clk slows down; Hold failures persist across ALL frequencies!",
    trap: "Stepping chamber voltage above Absolute Maximum Ratings destroys gate oxide; sweeping PVT before chamber thermal soak stabilizes creates fake corner shifts."
  },
  instruments: {
    physics: "Every real probe loads the DUT and limits bandwidth: effective system rise time follows t_r(sys) = √(t_r(signal)² + t_r(scope)² + t_r(probe)²). A 10× probe presents ~10 MΩ ∥ 10–15 pF, whereas a Keysight N7020A power-rail probe gives 50 kΩ DC input with huge ±24 V offset range and tiny 1:1 noise floor.",
    instrument: "Always verify calibration sticker/date, execute probe compensation on 1 kHz cal square wave, use shortest possible ground spring, set sample rate ≥ 5× highest harmonic to prevent aliasing, and deskew current (Ch3) vs. voltage (Ch2) before multiplying V·I waveforms.",
    trap: "Forgetting 10× attenuation factor in scope menu scales voltage 10× wrong; reading an aliased low-sample-rate trace invents phantom slow oscillations."
  },
  linux: {
    physics: "In SLT stations, the Linux OS kernel manages PCIe enumeration, DMA buffers, UART console TTYs, driver initialization, and OOM memory pressure. Every POSIX command communicates outcome via an integer exit status (`$?`: 0 = command ran cleanly, 1 = no match in `grep`, ≥2 = error/invalid).",
    instrument: "Capture read-only baseline FIRST before any reset: `uname -a`, `lspci -nnvv`, `dmesg -T`, `journalctl -b`, `grep -RniE 'error|fail|timeout' logs/`, `lsusb`, `ls -l /dev/serial/by-id/`, `free -h`, and `sha256sum`.",
    trap: "`grep` returning exit code 1 (no match) or a tool returning exit 0 NEVER proves the GPU passed validation—and rebooting destroys unsaved `dmesg` ring buffers!"
  },
  python: {
    physics: "Automated test harnesses control PSUs, chambers, scopes (SCPI over PyVISA), and Linux CLIs (`subprocess.run`). Robust lab code enforces Three-State grading: PASS (valid finite reading inside spec), FAIL (valid finite reading outside spec), and INVALID (timeout, NaN, inf, malformed string, or command failure).",
    instrument: "Always wrap `float(raw.strip())` in `try/except (ValueError, TypeError)`, guard comparisons with `math.isfinite(val)`, enforce `timeout=...` in `subprocess.run(..., check=False)`, preserve first-attempt logs before any retry, and shut down PSUs in a `finally:` block.",
    trap: "`float('nan')` does NOT raise ValueError in Python! In `3.10 <= float('nan') <= 3.50`, it returns False, and inverted checks like `if val > 3.50: return FAIL` silently pass `nan` as False-Clean PASS!"
  },
  quality: {
    physics: "Yield engineering distinguishes First-Pass Yield (FPY = passed on 1st attempt / total tested) from Retest Yield (masking intermittent hardware) and Rolled Throughput Yield (RTY = Π y_i across all sequential stations). Defects Per Million (DPPM = 10⁶ · defects/units) tracks customer escapes.",
    instrument: "Use Pareto charts (rank unique fail signatures, not noisy log lines), Measurement System Analysis (Gage R&R / calibration checks), Guardbanded Spec Limits (shrunk by ± uncertainty), and single-factor DOE matrices to drive true Corrective & Preventive Action (CAPA).",
    trap: "Allowing automated stations to 'retry 3× and mark PASS if once lucky' artificially inflates FPY metrics while shipping intermittent field failures to customers!"
  },
  interview: {
    physics: "Panel interviewers test three pillars simultaneously: (1) First-principles EE physics & Linux/Python fluency under stress, (2) Systematic A-B-A debug discipline (separating DUT silicon from fixture/power/software without guessing), and (3) Strict truthfulness on IP & scope boundaries.",
    instrument: "Frame hands-on stories cleanly using STAR: Google CPU2 (4-channel Keysight scope, N7020A rail probes, 1169B current sense on Ch1 CLK / Ch2 Logic / Ch3 I_sense / Ch4 M-Rail), DRAM summary-PASS vs. raw-fail parser mismatch, Intel board bring-up & VR programming, and Cisco socket A-B-A isolation.",
    trap: "Never invent proprietary register addresses/product specs, never claim sole ownership of team board designs or RF/VNA skills you haven't run, and always state PASS / FAIL / INVALID / BLOCKED clearly."
  }
};

const NVIDIA_MASTER_STUDY_BANK = [
  {
    id: "NV-EQ-01",
    cat: "equations",
    badge: "Fundamental Equation #1 & #2 (PDN & Capacitor Transient)",
    title: "Decoupling Capacitor Charge Surge (I = C·dV/dt) & PDN Load Droop (ΔV = I·R + L·di/dt)",
    q: "During a sudden GPU workload step ΔI = 40 A over Δt = 20 ns across package inductance L_pkg = 0.25 nH and PDN resistance R_PDN = 2.0 mΩ with local decoupling C_dec = 100 µF, compute resistive IR droop, inductive L·di/dt droop, and how much capacitance current flows if rail drops 40 mV in 20 ns.",
    steps: [
      "Step 1 — Resistive IR Drop: Convert R_PDN = 2.0 mΩ = 0.002 Ω. ΔV_IR = ΔI × R_PDN = 40 A × 0.002 Ω = 0.080 V = 80 mV.",
      "Step 2 — Inductive L·di/dt Droop: Convert L = 0.25 nH = 0.25 × 10⁻⁹ H, Δt = 20 ns = 20 × 10⁻⁹ s. Rate di/dt = 40 / (20 × 10⁻⁹) = 2.0 × 10⁹ A/s. Then ΔV_L = (0.25 × 10⁻⁹) × (2.0 × 10⁹) = 0.50 V = 500 mV (this is why low-inductance on-package caps matter!).",
      "Step 3 — Total Unmitigated Transient Droop: ΔV_total = 80 mV + 500 mV = 580 mV.",
      "Step 4 — Capacitor Instantaneous Current I_C = C · (dV/dt): With C = 100 µF = 100 × 10⁻⁶ F, ΔV = 40 mV = 0.04 V, Δt = 20 ns = 20 × 10⁻⁹ s → I_C = (100 × 10⁻⁶) × (0.04 / 20 × 10⁻⁹) = 200 A supplied locally (assuming negligible ESL)."
    ],
    answer: "ΔV_IR = 80 mV, ΔV_L = 500 mV, I_C = 200 A"
  },
  {
    id: "NV-EQ-02",
    cat: "equations",
    badge: "Fundamental Equation #3–#6 (DRAM Timing & DDR Bandwidth)",
    title: "Clock Period, DRAM t_RC = t_RAS + t_RP, DDR4-3200 Peak Bandwidth & Parallel R_eq",
    q: "A 64-bit DDR4-3200 module runs at 3200 MT/s (f_clk = 1600 MHz, T = 0.625 ns) with t_RAS = 32 ns and t_RP = 13.75 ns. Calculate theoretical peak GB/s, minimum row cycle t_RC, and parallel R_eq of 20 Ω ∥ 60 Ω.",
    steps: [
      "Step 1 — Verify DDR Clock vs. Transfer Rate: Because Double Data Rate transfers on BOTH rising and falling edges, 1600 MHz clock × 2 = 3,200 MT/s. Period T = 1 / 1.6 GHz = 0.625 ns.",
      "Step 2 — Peak DDR4-3200 Bandwidth: BW = (3,200 × 10⁶ transfers/s × 64 bits) / 8 bits/byte = 3.2 × 10⁹ × 8 bytes/s = 25.6 × 10⁹ B/s = 25.6 GB/s per channel.",
      "Step 3 — Minimum Row Cycle Time t_RC = t_RAS + t_RP: t_RC = 32 ns + 13.75 ns = 45.75 ns before next ACTIVATE on the same bank.",
      "Step 4 — Parallel Resistance R_eq = (R₁·R₂)/(R₁+R₂): R_eq = (20 × 60)/(20 + 60) = 1200 / 80 = 15 Ω (always smaller than the 20 Ω smallest branch!)."
    ],
    answer: "BW = 25.6 GB/s, t_RC = 45.75 ns, R_eq = 15 Ω"
  },
  {
    id: "NV-EQ-03",
    cat: "equations",
    badge: "Fundamental Equation #7 & #8 (Static Timing Setup vs. Hold Margin)",
    title: "Why Slowing Clock Frequency Fixes Setup Violations (386.10 MHz) But NEVER Fixes Hold (-820 ps)",
    q: "Circuit timing: t_CQ(max)=950 ps, t_CQ(min)=300 ps, t_logic(max)=590 ps, fast path t_MUX_S(min)=30 ps, t_su=300 ps, t_h=400 ps, t_skew=750 ps. Derive f_max and prove why reducing f_clk to 1 MHz still fails Hold.",
    steps: [
      "Step 1 — Setup Inequality (next clock edge T_clk later): T_clk(min) = t_CQ(max) + t_logic(max) + t_su + t_skew = 950 + 590 + 300 + 750 = 2,590 ps = 2.590 ns.",
      "Step 2 — Maximum Safe Frequency: f_max = 1 / 2.590 ns = 386.10 MHz. Running slower (e.g., 200 MHz → T_clk = 5,000 ps) creates +2,410 ps positive setup slack.",
      "Step 3 — Hold Inequality (SAME clock edge!): t_CQ(min) + t_logic(min) ≥ t_h(max) + t_skew → (300 + 30) ≥ (400 + 750) → 330 ps ≥ 1,150 ps is FALSE! Slack = −820 ps.",
      "Step 4 — Silicon Shmoo Consequence: Even if you drop f_clk to 1 Hz, the launching flop and capturing flop toggle on the SAME rising edge—Hold fails at ALL frequencies until you insert ≥820 ps buffer delay or lower skew/voltage slightly."
    ],
    answer: "f_max = 386.10 MHz; Hold Slack = −820 ps (frequency-independent!)"
  },
  {
    id: "NV-QA-01",
    cat: "post_si",
    badge: "Panel Mock & 39 Post-Silicon QA #1–#8 (CPU2 & Keysight 4-Ch Scope)",
    title: "Google CPU2 Power & Clock Validation: 4-Channel Keysight Scope + N7020A + 1169B Setup",
    q: "Walk a panel through your documented 4-channel oscilloscope measurement methodology (CPU2), how you prevent false ringing artifacts, and how you separate rail droop from clock failure.",
    steps: [
      "Step 1 — State Exact Channel Mapping & Probes: Ch1 = Exported Clock (SMA-to-BNC coaxial, avoids probe ground inductance); Ch2 = Logic Rail using Keysight N7020A power-rail probe (±24 V offset, high impedance 50 kΩ, low noise floor); Ch3 = Current-Sense Shunt via Keysight 1169B probe; Ch4 = M-Rail (N7020A).",
      "Step 2 — Explain Triggering & Deskew: Trigger on Ch1/Ch3 workload transition or exported clock anomaly with deep pre-trigger buffer; deskew current probe propagation delay against voltage channels before computing transient ΔV or V·I power.",
      "Step 3 — Explain Frequency Ratio: Verify the exported monitor clock divider ratio against datasheet/config before comparing scope MHz against expected internal PLL frequency.",
      "Step 4 — Truthful Boundary: Clearly frame what you directly measured (power rails, current sense, exported divided clock) without inventing proprietary internal register addresses or unmeasured compliance assertions."
    ],
    answer: "Ch1 CLK (SMA-BNC) · Ch2 Logic Rail (N7020A) · Ch3 Current (1169B) · Ch4 M-Rail (N7020A)"
  },
  {
    id: "NV-QA-02",
    cat: "post_si",
    badge: "Panel Mock & 39 Post-Silicon QA #9–#18 (DRAM False PASS Bug & Intel/Cisco Cases)",
    title: "DRAM Summary 'PASS' vs. Raw Fail Log Investigation + Intel Bring-Up + Cisco A-B-A",
    q: "How do you investigate when an SLT station reports PASS on DRAM while raw logs look suspicious? How do you apply Intel board bring-up and Cisco socket A-B-A isolation to NVIDIA SLT?",
    steps: [
      "Step 1 — DRAM Summary vs. Raw Discrepancy: Freeze DUT, image, and log files. Inspect raw UART/dmesg/EDAC/BMC logs directly with `grep -RniE` BEFORE trusting any top-level PASS parser.",
      "Step 2 — Parser Bug Audit: Inject a synthetic bit-flip / ECC error log into the parser unit test. If the script still outputs PASS (because of missing regex match, wrong column index, or `nan` comparison), tag historical lot as INVALID coverage rather than passing silicon.",
      "Step 3 — Intel Staged Bring-Up Discipline: Verify physical assembly → off-state low-ohms short checks → programmable VR image/telemetry → clock/reset sequencing → BIOS/firmware checksums before concluding dead silicon.",
      "Step 4 — Cisco Socket/Contact A-B-A Proof: Record failing symptom on Slot/DUT A (Condition A) → swap ONLY the suspect DUT into a Known-Good Fixture/Socket (Condition B) → return DUT to Original Slot (Condition A). Fault following DUT = silicon/package; following socket = pogo-pin/mechanical."
    ],
    answer: "Freeze logs -> Audit parser with injected faults -> Single-variable A-B-A swap -> Classify PASS/FAIL/INVALID/BLOCKED"
  },
  {
    id: "NV-PY-01",
    cat: "python",
    badge: "25 Python & Automation Coding Labs #1–#10 (NaN Safety, SCPI/Subprocess & Retry Trap)",
    title: "Fail-Closed Python Voltage Classifier, Read-Only Subprocess Wrapper & CSV Threshold Auditor",
    q: "Write fail-closed Python helpers for (a) classifying untrusted SCPI voltage strings ('3.28', 'nan', '', 'bad', None) into PASS/FAIL/INVALID, and (b) running read-only `lspci -nn` safely with timeout & exit-code separation.",
    code: `import math, subprocess

def classify_rail(raw, low=3.10, high=3.50):
    try:
        val = float(str(raw).strip())
    except (ValueError, TypeError):
        return "INVALID"
    if not math.isfinite(val):   # catches float('nan'), inf, -inf
        return "INVALID"
    return "PASS" if low <= val <= high else "FAIL"

def read_only_cmd(args, timeout_s=10):
    try:
        cp = subprocess.run(args, capture_output=True, text=True, timeout=timeout_s, check=False)
    except (OSError, subprocess.TimeoutExpired) as err:
        return {"status": "INVALID", "reason": str(err)}
    if cp.returncode != 0:
        return {"status": "INVALID", "exit": cp.returncode, "stderr": cp.stderr}
    return {"status": "OK", "stdout": cp.stdout}`,
    steps: [
      "Step 1 — Reject Non-String/Blank/Malformed Input: `float('bad')` raises `ValueError`; converting `None` fails or becomes `'None'` → catch cleanly and return `'INVALID'` (never default missing telemetry to 0.0!).",
      "Step 2 — Mandatory `math.isfinite(val)` Guard: Python treats `'nan'`, `'inf'`, and `'-inf'` as valid floats! Checking `math.isfinite()` guarantees NaN never leaks past threshold checks.",
      "Step 3 — Subprocess Exception & Exit Code Isolation: `OSError` (command missing) or `TimeoutExpired` (hung PCI bus) means station measurement is `'INVALID'`, NOT `'FAIL'` on the DUT.",
      "Step 4 — Zero Exit Code Clarification: `cp.returncode == 0` ONLY means `lspci` executed cleanly; you still must parse the expected NVIDIA GPU BDF (`10de:...`), trained link width/speed (`LnkSta`), and check `nvidia-smi` / DCGM!"
    ],
    answer: "Three-state PASS/FAIL/INVALID with math.isfinite() + timeout + non-zero exit capture"
  },
  {
    id: "NV-HLD-01",
    cat: "hld",
    badge: "15-Step HLD Playbook · 8 Socket Checks · 10 Linux CLI Triage Commands",
    title: "Complete 15-Step High-Level Debug Playbook, Socket Pin Inspection & Linux Triage Sequence",
    q: "Walk through the 15-step SLT High-Level Debug sequence when a GPU node intermittently fails overnight testing across thermal & memory traffic.",
    steps: [
      "Steps 1–4 (Preserve & Baseline): (1) Freeze DUT—do NOT reboot! (2) Capture exact timestamp, test ID, station ID, ambient/chamber temp; (3) Pull SW/FW/BIOS/VBIOS/driver/kernel versions (`uname -a`, `sha256sum`); (4) Save raw logs (`dmesg -T`, `journalctl -b`, `grep -RniE 'error|fail|timeout'`, `nvidia-smi -q`, `lspci -vvv`) BEFORE clearing counters.",
      "Steps 5–8 (Environment & Physical Checks): (5) Inspect PSU rails, droop, and current limits; (6) Check thermal sensors & TIM/fan/coolant flow; (7) Inspect BGA socket pogo pins under microscope (bent pin, FOD debris, coplanarity, uneven clamping torque—one of the 8 Socket QA pillars!); (8) Verify cable/riser seating & ESD cleanliness.",
      "Steps 9–12 (Controlled Fault Isolation): (9) Isolate subsystem via minimal workload (DCGM memory test vs compute vs PCIe DMA); (10) Run controlled A → B → A swap changing ONE variable (DUT, slot/riser, or host); (11) Sweep PVT corners (voltage margin/frequency shmoo) safely inside specs; (12) Capture synchronized 4-ch scope trace on trigger.",
      "Steps 13–15 (Classify, Root Cause & Handoff): (13) Reproduce reliably ≥3×; (14) Classify cleanly as DUT FAIL, Station/Fixture INVALID, or FW/Parser Bug—never hide failures via silent retries; (15) Deliver concise handoff packet (failing signature, reproduction steps, raw logs, waveforms, FPY/DPPM impact) to ATE/DFT/ASIC/SW owners."
    ],
    answer: "Freeze -> Capture SW/Logs -> Physical/Power/Socket -> Single-Var A-B-A -> Classify & Handoff"
  },
  {
    id: "NV-SOCK-01",
    cat: "hld",
    badge: "8 Socket Assembly QA + 10 Linux CLI Triage Commands",
    title: "BGA Test Socket Pogo-Pin Failure Modes & 10 Read-Only Linux Hardware Triage Commands",
    q: "What 8 mechanical/electrical checks protect high-pin-count BGA SLT sockets, and which 10 read-only Linux commands isolate GPU/PCIe/DRAM faults safely before rebooting?",
    steps: [
      "8 Socket Assembly Checks: (1) Pogo-pin tip contamination/flux oxide; (2) Bent/recessed spring plungers (coplanarity); (3) Clamping lid torque uniformity; (4) Package substrate warpage at 105 °C soak; (5) ESD/FOD debris in alignment frame; (6) Actuation count / lifecycle wear tracking; (7) Split ground/power return pin impedance; (8) Controlled A-B-A socket swap before condemning silicon.",
      "10 Read-Only Linux Commands: (1) `uname -a` (kernel version); (2) `cat /etc/os-release`; (3) `lspci -nnvv` (enumeration + LnkCap vs LnkSta); (4) `dmesg -T | grep -iE 'nvrm|xid|pcie|aer|ecc'` (kernel faults before reboot); (5) `journalctl -b -p err`; (6) `grep -RniE 'error|fail|timeout' logs/` (check exit `$?`: 0=match, 1=clean, 2=error); (7) `nvidia-smi -q`; (8) `dcgmi health -c`; (9) `ls -l /dev/serial/by-id/`; (10) `sha256sum <fw_image>`."
    ],
    answer: "Never reseat blindly without microscope/torque check + capture dmesg/lspci BEFORE reboot"
  },
  {
    id: "NV-PY-02",
    cat: "python",
    badge: "25 Python Labs #11–#25 (CSV First-Failure Audit, Rolling Mean & Yield)",
    title: "Compute First-Pass Yield vs. Retest Inflation & Audit Mixed CSV Telemetry Records",
    q: "Write a clean Python function that computes true FPY (First-Pass Yield) vs. final yield from an ordered list of test run dicts `[{'sn':'U1','attempt':1,'status':'FAIL'}, {'sn':'U1','attempt':2,'status':'PASS'}, ...]` without letting retests hide bad hardware.",
    code: `def audit_yield(records):
    first_seen = {}
    latest = {}
    invalid_runs = 0
    for row in records:
        st = str(row.get("status", "")).upper()
        if st == "INVALID":
            invalid_runs += 1
            continue
        sn = row["sn"]
        if sn not in first_seen:
            first_seen[sn] = st
        latest[sn] = st
    total_units = len(first_seen)
    fpy = (sum(1 for v in first_seen.values() if v == "PASS") / total_units * 100.0) if total_units else 0.0
    retest_yield = (sum(1 for v in latest.values() if v == "PASS") / total_units * 100.0) if total_units else 0.0
    return {"units": total_units, "fpy_pct": round(fpy, 2), "retest_pct": round(retest_yield, 2), "invalid_runs": invalid_runs}`,
    steps: [
      "Step 1 — Filter INVALID runs separately: Station timeouts or NaN telemetry are `invalid_runs`, NOT valid denominator units for silicon yield.",
      "Step 2 — Record first valid outcome (`if sn not in first_seen`): True FPY counts unit U1 as FAIL even if attempt #2 later passed after a re-seat!",
      "Step 3 — Track `latest[sn]` only for secondary retest-yield comparison so engineering sees the gap between `fpy_pct` and `retest_pct` (large gap = contact/thermal marginality!).",
      "Step 4 — Zero-Division Guard (`if total_units else 0.0`): Never crash if all runs returned INVALID."
    ],
    answer: "Track first valid status separately from retest status & quarantine INVALID telemetry"
  },
  {
    id: "NV-QA-03",
    cat: "post_si",
    badge: "39 Post-Si & 18 Panel QA #19–#39 (Xid 79, PVT Shmoo, ATE vs SLT & IP Boundaries)",
    title: "Diagnosing GPU Xid 79, PVT Shmoo Cliff Shifts, ATE vs. SLT Escape Gaps & IP Boundaries",
    q: "A GPU triggers Xid 79 (GPU has fallen off the bus) only after 12 minutes of heavy workload in SLT, despite passing ATE 100%. How do you triage without making false claims?",
    steps: [
      "Step 1 — ATE vs. SLT Gap Explanation: ATE runs short structural scan/MBIST vectors on sockets; it does NOT stress sustained full-power VR thermal runaway, board PDN inductance L·di/dt droop, PCIe riser SI under DMA traffic, or full OS driver interaction.",
      "Step 2 — Triage Xid 79 Candidates Systematically: Xid 79 is a SYMPTOM, not a root cause. Competing hypotheses: (A) PSU/VR OTP or transient OCP droop dropping GPU off PCIe; (B) Thermal shutdown (loose heatsink TIM / pump-out); (C) PCIe slot/riser marginal signal integrity; (D) Bad GPU silicon.",
      "Step 3 — Discriminating Checks: Before rebooting, dump `nvidia-smi -q` clocks/temp/power/PCIe link (`lspci -vvv`), inspect `dmesg` timestamps leading up to Xid 79 (look for preceding AER errors or VR alerts), capture 4-ch scope trace triggering on Xid/power fault, and execute A-B-A move to known-good slot.",
      "Step 4 — Boundary Discipline: In panel interviews, clearly distinguish observed data from hypothesis, never fabricate register addresses, and separate previous lab roles accurately."
    ],
    answer: "Xid 79 is a multi-cause symptom (Power/Thermal/PCIe/GPU) requiring pre-reboot logs + A-B-A isolation"
  }
];

let activeNvFilter = "all";
let masterBankOpen = false;
let revealedNvSolutions = new Set(["NV-EQ-01", "NV-QA-01"]);

function renderNvidiaUnderstand(q, t) {
  const lec = NVIDIA_TRACK_LECTURES[t.id] || NVIDIA_TRACK_LECTURES.electrical;
  const givens = parseGivenQuantities(q.question);
  const convBox = q.questionType === "number" && givens.length
    ? `<div class="nvs-prof-card" style="margin-top:10px;">
         <h5>3. Engineering Prefix &amp; Unit Conversion Check (10<sup>3n</sup> Rule)</h5>
         <table class="nvs-prof-table"><thead><tr><th>Given Token</th><th>Prefix</th><th>Base SI Equivalent</th></tr></thead><tbody>${givens.map(g => `<tr><td><code>${esc(g.raw)}</code></td><td>${esc(g.prefixName)}</td><td><strong>${esc(fmt(g.baseVal))} ${esc(g.baseUnit)}</strong></td></tr>`).join("")}</tbody></table>
       </div>`
    : "";

  return `<section class="nvs-prof-box" aria-label="NVIDIA Professor First-Principles Lecture">
    <h4><span class="nvs-prof-badge">Professor's First-Principles Lecture</span> Hardware Physics &amp; SLT Execution for ${esc(q.skillName)}</h4>
    <div class="nvs-prof-grid">
      <div class="nvs-prof-card">
        <h5>1. Silicon &amp; Circuit Physics (Zero Prerequisite)</h5>
        <p>${esc(lec.physics)}</p>
      </div>
      <div class="nvs-prof-card">
        <h5>2. Safe Instrument / Linux / Test Measurement</h5>
        <p>${esc(lec.instrument)}</p>
      </div>
    </div>
    ${convBox}
    <div class="nvs-prof-trap"><strong>⚠️ Post-Silicon &amp; SLT False-Conclusion Trap:</strong> ${esc(lec.trap)}</div>
  </section>${renderHiringManagerInterviewScript(q, t, true)}`;
}

function renderNvidiaWorkedDerivation(q, t) {
  const lec = NVIDIA_TRACK_LECTURES[t.id] || NVIDIA_TRACK_LECTURES.electrical;
  const phys = inferTopicPhysicsModel(q, t, true);
  const convText = buildConversionExplanation(q.question);
  const isMath = q.questionType === "number";
  const sp = window.PROFESSOR_NOTEBOOK_SPREADS;

  return `${sp ? sp.renderQuestionNotebookSpread(q, t, true) : ""}<section class="nvs-prof-chalkboard" aria-label="NVIDIA Professor Complete Step-by-Step Chalkboard">
    <h4>🧮 Complete Worked Walkthrough (${esc(q.skillName)} · ${esc(q.phase)} · 10<sup>3n</sup> Engineering Notation)</h4>
    ${isMath ? `
      <div class="nvs-prof-chalk-step">
        <strong>1. GIVEN INPUTS &amp; 10^(3n) METRIC PREFIX CONVERSION</strong>
        <div>${esc(convText)}</div>
      </div>
      <div class="nvs-prof-chalk-step">
        <strong>2. GOVERNING PHYSICAL EQUATION (STACKED MATHML)</strong>
        <div>${eq(phys.formula)}</div>
      </div>
      <div class="nvs-prof-chalk-step">
        <strong>3. COMPLETE 10^(3n) SUBSTITUTION &amp; COMPUTATION</strong>
        <div>${eq(phys.sub)}</div>
        <div><code>Result = ${esc(fmt(q.expected))} ${esc(q.unit)}</code> &nbsp;·&nbsp; ${engVal(q.expected, q.unit)}</div>
      </div>
      <div class="nvs-prof-chalk-step">
        <strong>4. POST-MATH BENCH EXECUTION &amp; PASS / FAIL / INVALID GUARD</strong>
        <div>${esc(q.math?.why || "")} · Check: ${esc(q.math?.check || lec.trap)}</div>
      </div>` : `
      <div class="nvs-prof-chalk-step">
        <strong>1. GOVERNING EQUATION &amp; 10^(3n) BENCHMARK MODEL</strong>
        <div>${eq(phys.formula)}</div>
        <div style="margin-top:4px;">${eq(phys.sub)}</div>
        <small style="color:#cbd5e1;">${esc(phys.unitConv)}</small>
      </div>
      <div class="nvs-prof-chalk-step">
        <strong>2. SAFE EVIDENCE CAPTURE ON HARDWARE / LINUX / 4-CH SCOPE</strong>
        <div>${esc(lec.instrument)}</div>
      </div>
      <div class="nvs-prof-chalk-step">
        <strong>3. COMPLETE ${q.steps.length}-STEP AUDIT &amp; PRODUCT ISOLATION CHECKLIST</strong>
        <ul style="margin:4px 0 0 18px;font-size:0.86rem;color:#e2e8f0;">${q.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
      </div>`}
  </section>${renderHiringManagerInterviewScript(q, t, true)}`;
}

function renderNvidiaMasterStudyBank() {
  const items = NVIDIA_MASTER_STUDY_BANK.filter(x => activeNvFilter === "all" || x.cat === activeNvFilter);
  const filters = [
    ["all", "All Master Study Modules (" + NVIDIA_MASTER_STUDY_BANK.length + ")"],
    ["equations", "8 DRAM/PDN/STA Equations"],
    ["post_si", "39 Post-Si + 18 Panel QA (CPU2/DRAM/Intel/Cisco)"],
    ["python", "25 Python & SCPI Labs"],
    ["hld", "15-Step HLD + 8 Socket + 10 Linux QA"]
  ];
  return `<details class="nvs-prof-bank" id="nvsProfMasterBank" ${masterBankOpen ? "open" : ""}>
    <summary>📗 NVIDIA SLT Master 253-Box Study Bank (8 Equations · CPU2 Scope · DRAM Bug · Intel/Cisco · 25 Python Labs · 15-Step HLD)</summary>
    <div class="nvs-prof-bank-body">
      <p style="margin-top:0;font-size:0.9rem;color:#334155;">Structured walkthroughs unifying the complete NVIDIA SLT Master Study Guide: 10<sup>3n</sup> PDN/DRAM/STA physics, 4-Channel Keysight Scope methodology, fail-closed Python grading, and Linux hardware triage.</p>
      <div class="nvs-prof-filters" role="group" aria-label="Filter NVIDIA Master Study modules">
        ${filters.map(([k, lbl]) => `<button type="button" class="nvs-prof-filter-btn ${activeNvFilter === k ? "active" : ""}" data-nv-filter="${k}">${esc(lbl)}</button>`).join("")}
      </div>
      ${items.map(item => {
        const isOpen = revealedNvSolutions.has(item.id);
        return `<article class="nvs-prof-prob-card" data-nv-id="${esc(item.id)}">
          <div class="nvs-prof-prob-head">
            <span class="nvs-prof-prob-title">${esc(item.id)}: ${esc(item.title)}</span>
            <span class="nvs-prof-prob-src">${esc(item.badge)}</span>
          </div>
          <p style="font-size:0.92rem;font-weight:500;color:#0f172a;">${esc(item.q)}</p>
          <div class="nvs-prof-mini-check">
            <button type="button" data-nv-sol="${esc(item.id)}">${isOpen ? "Hide Complete Solution" : "Show Complete Step-by-Step Professor Solution"}</button>
          </div>
          ${isOpen ? `<div class="nvs-prof-prob-sol">
            ${item.code ? `<pre class="nvs-prof-code">${esc(item.code)}</pre>` : ""}
            <ol>${item.steps.map(s => `<li>${rich(s)}</li>`).join("")}</ol>
            <div style="font-weight:700;color:#065f46;">Key Takeaway: ${esc(item.answer)}</div>
          </div>` : ""}
        </article>`;
      }).join("")}
    </div>
  </details>`;
}

let activeNvHint = 0;
function renderNvidiaPracticeCoach(q, t) {
  const lec = NVIDIA_TRACK_LECTURES[t.id] || NVIDIA_TRACK_LECTURES.electrical;
  const hints = [
    ["Hint 1 · Hardware Concept", `${q.skillName}: ${q.hints?.[0] || lec.physics}`],
    ["Hint 2 · Prefix / Check Setup", q.questionType === "number" ? buildConversionExplanation(q.question) : (q.hints?.[1] || lec.instrument)],
    ["Hint 3 · Verification & Trap", `${q.hints?.[2] || lec.trap}`]
  ];
  const cur = hints[Math.min(activeNvHint, hints.length - 1)];
  return `<section class="nvs-prof-box" aria-label="NVIDIA progressive practice coach">
    <h4><span class="nvs-prof-badge">3-Stage Coaching Ladder</span> Build your own reasoning first</h4>
    <div class="nvs-prof-hints">
      ${hints.map((h, i) => `<button type="button" class="nvs-prof-hint-btn ${i === activeNvHint ? "active" : ""}" data-nv-hint="${i}">${esc(h[0])}</button>`).join("")}
    </div>
    <div class="nvs-prof-hint-panel"><strong>${esc(cur[0])}:</strong> ${esc(cur[1])}</div>
  </section>`;
}

function bindNvidia(root, rerenderFn) {
  if (!root) return;
  if (window.PROFESSOR_NOTEBOOK_SPREADS) window.PROFESSOR_NOTEBOOK_SPREADS.bindNotebookSpreads(root, rerenderFn);
  const nvDet = root.querySelector("#nvsProfMasterBank");
  if (nvDet) {
    nvDet.addEventListener("toggle", () => { masterBankOpen = nvDet.open; });
  }
  root.querySelectorAll("[data-nv-filter]").forEach(btn => {
    btn.onclick = () => {
      masterBankOpen = true;
      activeNvFilter = btn.dataset.nvFilter || "all";
      if (typeof rerenderFn === "function") rerenderFn();
    };
  });
  root.querySelectorAll("[data-nv-sol]").forEach(btn => {
    btn.onclick = () => {
      masterBankOpen = true;
      const id = btn.dataset.nvSol;
      if (revealedNvSolutions.has(id)) revealedNvSolutions.delete(id);
      else revealedNvSolutions.add(id);
      if (typeof rerenderFn === "function") rerenderFn();
    };
  });
  root.querySelectorAll("[data-nv-hint]").forEach(btn => {
    btn.onclick = () => {
      activeNvHint = Number(btn.dataset.nvHint) || 0;
      if (typeof rerenderFn === "function") rerenderFn();
    };
  });
}

window.PROFESSOR_MASTERY_ENGINE = {
  version: "1.0.0",
  parseGivenQuantities,
  buildConversionExplanation,
  inferTopicPhysicsModel,
  renderHiringManagerInterviewScript,
  AVIONICS_WORKED_BANK,
  NVIDIA_MASTER_STUDY_BANK,
  TOPIC_PROFESSOR_NOTES,
  NVIDIA_TRACK_LECTURES,
  avionics: {
    buildProfessorSteps: buildAvionicsProfessorSteps,
    renderUnderstandLecture: renderAvionicsUnderstandLecture,
    renderVisualGuide: renderAvionicsVisualGuide,
    renderChalkboard: renderAvionicsChalkboard,
    renderTryCoach: renderAvionicsTryCoach,
    bind: bindAvionics
  },
  nvidia: {
    renderUnderstand: renderNvidiaUnderstand,
    renderWorkedDerivation: renderNvidiaWorkedDerivation,
    renderMasterStudyBank: renderNvidiaMasterStudyBank,
    renderPracticeCoach: renderNvidiaPracticeCoach,
    bind: bindNvidia
  }
};

})();
