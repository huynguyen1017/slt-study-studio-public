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
    trap: "ENGR 852 GOLDEN RULE: Slowing down the clock frequency (f_clk) CANNOT fix a hold violation because both launch and capture occur on the SAME clock edge! Only adding physical delay buffers on short paths or reducing clock skew fixes hold."
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
   3. COMPLETE COURSEWORK & INTERVIEW PRACTICE PROBLEM BANK (Avionics View)
      40+ Worked Textbook & Interview Problems across Tech 60, Electronic Devices,
      Tech 63, Physics 2B, ENGR 852, and Muon Space 141-Q — showing ALL WORK!
   ============================================================================ */
const AVIONICS_WORKED_BANK = [
  {
    id: "CW-T60-01",
    cat: "tech60",
    src: "Tech 60 · Ch. 1–2 (Units, Charge & Engineering Notation)",
    title: "Compute Electron Count from Coulomb Charge & Convert to Engineering Notation",
    topicIds: ["units", "ohm"],
    prompt: "How many electrons make up 0.000045 C (45 µC) of charge, and if that charge flows past a PCB trace cross-section in 15 ms, what is the current I in engineering notation?",
    prereq: "1 coulomb (C) equals 6.25 × 10¹⁸ electrons. Electric current is charge flow per second: I = Q / t (1 A = 1 C/s). Engineering notation keeps exponents as multiples of 3 (10³, 10⁻³, 10⁻⁶).",
    formula: "N = Q * 6.25e18 ;   I = Q / t",
    steps: [
      "Step 1 — Convert given charge to scientific/engineering notation: Q = 0.000045 C = 45 × 10⁻⁶ C = 45 µC (move decimal 6 places right).",
      "Step 2 — Calculate electron count N: N = (45 × 10⁻⁶ C) × (6.25 × 10¹⁸ electrons/C) = (45 × 6.25) × 10^(18 − 6) = 281.25 × 10¹² electrons = 2.8125 × 10¹⁴ electrons.",
      "Step 3 — Convert time t to base seconds: t = 15 ms = 15 × 10⁻³ s = 0.015 s.",
      "Step 4 — Compute current I = Q / t: I = (45 × 10⁻⁶ C) / (15 × 10⁻³ s) = (45 / 15) × 10^(−6 − (−3)) = 3 × 10⁻³ A.",
      "Step 5 — Express in clean engineering notation: I = 3.0 mA (milliampere)."
    ],
    answerType: "number",
    expected: 3,
    unit: "mA"
  },
  {
    id: "CW-T60-02",
    cat: "tech60",
    src: "Tech 60 · Ch. 2–3 (Resistor Color Code, Ohm's & Watt's Law)",
    title: "SMD/5-Band Color Code, Branch Current & Safe Resistor Wattage Selection",
    topicIds: ["ohm", "power"],
    prompt: "An SMT resistor marked '472' (4-band equivalent: Yellow-Violet-Red-Gold) is connected directly across a 12 V avionics rail. Find (a) nominal resistance, (b) current in mA, (c) power dissipated in mW, and (d) minimum safe standard power rating (1/8 W, 1/4 W, 1/2 W).",
    prereq: "In 3-digit SMD markings (ABC) and 4-band axial resistors, digits A and B are significant figures and C is the power-of-10 multiplier (number of zeros). Always apply ≥ 2× derating for flight hardware reliability.",
    formula: "R = 47 * 10^2 ;   I = V / R ;   P = V^2 / R",
    steps: [
      "Step 1 — Decode SMD '472': First digit 4 (Yellow), Second digit 7 (Violet), Multiplier 2 zeros (10², Red) → R = 47 × 100 = 4,700 Ω = 4.7 kΩ (±5% Gold → 4.465 kΩ to 4.935 kΩ).",
      "Step 2 — Convert resistance to base ohms: R = 4.7 × 10³ Ω.",
      "Step 3 — Apply Ohm's Law for current I: I = V / R = 12 V / 4,700 Ω = 0.002553 A = 2.553 mA.",
      "Step 4 — Apply Watt's Law for power P: P = V² / R = 12² / 4,700 = 144 / 4,700 = 0.03064 W = 30.64 mW (Check via V·I: 12 × 0.002553 = 30.64 mW!).",
      "Step 5 — Select safe wattage rating: Required 2× derated minimum = 2 × 30.64 mW = 61.28 mW = 0.061 W. Standard 1/8 W (0.125 W = 125 mW) is safe!"
    ],
    answerType: "number",
    expected: 30.64,
    unit: "mW"
  },
  {
    id: "CW-T60-03",
    cat: "tech60",
    src: "Tech 60 · Ch. 5–7 (Loaded Voltage Divider & 10 MΩ DMM Loading)",
    title: "Solve a Loaded Voltage Divider vs. 10 MΩ Voltmeter Loading Error",
    topicIds: ["series", "parallel", "instruments"],
    prompt: "A +10 V reference feeds R₁ = 1 MΩ (top) and R₂ = 1 MΩ (bottom). What does an ideal infinite-impedance voltmeter read at the midpoint vs. a real handheld DMM whose input resistance is 10 MΩ?",
    prereq: "Connecting a real DMM places its internal R_DMM = 10 MΩ IN PARALLEL with the bottom resistor R₂. For low-ohm dividers (kΩ), 10 MΩ error is tiny; for megohm dividers, loading shifts the reading noticeably downward.",
    formula: "V_ideal = V_S * R2 / (R1 + R2) ;   R2_loaded = (R2 * R_DMM) / (R2 + R_DMM)",
    steps: [
      "Step 1 — Unloaded (ideal) divider voltage: V_ideal = 10 V × 1 MΩ / (1 MΩ + 1 MΩ) = 10 × 0.5 = 5.000 V.",
      "Step 2 — Connect the 10 MΩ DMM across bottom R₂: compute parallel equivalent R₂_loaded = (1 MΩ × 10 MΩ) / (1 MΩ + 10 MΩ) = 10 / 11 MΩ = 0.9091 MΩ.",
      "Step 3 — Recompute the voltage divider ratio with loaded bottom branch: R_total = R₁ + R₂_loaded = 1.0 MΩ + 0.9091 MΩ = 1.9091 MΩ.",
      "Step 4 — Compute DMM measured voltage: V_DMM = 10 V × (0.9091 / 1.9091) = 4.762 V.",
      "Step 5 — Calculate loading error: ΔV = 4.762 − 5.000 = −0.238 V (−4.76% low!). In avionics, buffer high-Z sensor dividers with an op-amp before sampling."
    ],
    answerType: "number",
    expected: 4.762,
    unit: "V"
  },
  {
    id: "CW-T60-04",
    cat: "tech60",
    src: "Tech 60 · Ch. 7–8 (Wheatstone Bridge & Thevenin Equivalent)",
    title: "Balanced & Unbalanced Thermistor Wheatstone Bridge + Thevenin V_TH / R_TH",
    topicIds: ["kcl-kvl", "thermal", "parallel"],
    prompt: "A 12 V Wheatstone bridge has three equal arms R₁ = R₂ = R₃ = 10 kΩ and a thermistor R_T whose resistance drops from 10 kΩ at 25 °C to 9.0 kΩ at 30 °C. Find the differential bridge output V_out (V_A − V_B) in V at 30 °C, and find R_TH seen by the meter.",
    prereq: "A Wheatstone bridge is two parallel voltage dividers connected between the same supply rails. Output V_AB = V_S·[R₃/(R₃+R₁) − R_T/(R_T+R₂)] becomes 0 V at balance. Looking back into AB with V_S shorted gives R_TH = (R₁∥R₃) + (R₂∥R_T).",
    formula: "V_out = V_S * (R3/(R1+R3) - R_T/(R2+R_T))",
    steps: [
      "Step 1 — Reference leg voltage V_A (left arm R₁ top, R₃ bottom): V_A = 12 V × (10 kΩ / (10 kΩ + 10 kΩ)) = 12 × 0.5 = 6.000 V.",
      "Step 2 — Sensing leg voltage V_B (right arm R₂ = 10 kΩ top, R_T = 9.0 kΩ bottom): V_B = 12 V × (9.0 kΩ / (10 kΩ + 9.0 kΩ)) = 12 × (9 / 19) = 5.6842 V.",
      "Step 3 — Differential bridge output V_out = V_A − V_B = 6.000 V − 5.6842 V = +0.3158 V (+315.8 mV).",
      "Step 4 — Find Thevenin Resistance R_TH seen across terminals A–B by zeroing the 12 V source (replace V_S with a short to GND):",
      "Step 5 — Left node sees R₁∥R₃ = 10k ∥ 10k = 5.000 kΩ. Right node sees R₂∥R_T = (10k × 9k) / (10k + 9k) = 4.737 kΩ. In series between A and B: R_TH = 5.000 + 4.737 = 9.737 kΩ."
    ],
    answerType: "number",
    expected: 0.3158,
    unit: "V"
  },
  {
    id: "CW-T60-05",
    cat: "tech60",
    src: "Tech 60 · Ch. 8–11 (Max Power Transfer, Superposition & AC RMS)",
    title: "Superposition & Maximum Power Transfer + AC Sine Peak-to-RMS Conversion",
    topicIds: ["kcl-kvl", "ac", "rf"],
    prompt: "A sensor source has V_TH = 8.0 V and internal resistance R_TH = 200 Ω. (a) What load R_L draws maximum power and what is P_max in mW? (b) If an AC test signal has V_pp = 14.14 V at f = 2 kHz, find V_rms (in V) and period T (in µs).",
    prereq: "Maximum Power Transfer Theorem: load power P_L = V_TH² · R_L / (R_TH + R_L)² reaches its mathematical peak when R_L = R_TH, yielding P_max = V_TH² / (4 · R_TH) at 50% efficiency. For a pure sine wave: V_p = V_pp/2, V_rms = 0.7071 · V_p.",
    formula: "P_max = V_TH^2 / (4 * R_TH) ;   V_rms = 0.7071 * (V_pp / 2)",
    steps: [
      "Step 1 — Match load for Maximum Power Transfer: choose R_L = R_TH = 200 Ω.",
      "Step 2 — Check current at matched load: I = V_TH / (R_TH + R_L) = 8.0 V / (200 Ω + 200 Ω) = 8 / 400 = 0.020 A (20 mA).",
      "Step 3 — Compute maximum delivered load power P_max = I² · R_L = (0.020)² × 200 = 0.0004 × 200 = 0.080 W = 80 mW (Verify V_TH²/(4·R_TH) = 64/800 = 80 mW!).",
      "Step 4 — AC Peak & RMS: V_p = V_pp / 2 = 14.14 / 2 = 7.070 V. Then V_rms = 0.7071 × 7.070 V = 5.00 V_rms.",
      "Step 5 — AC Period T: T = 1 / f = 1 / (2 × 10³ Hz) = 0.0005 s = 500 µs."
    ],
    answerType: "number",
    expected: 80,
    unit: "mW"
  },
  {
    id: "CW-DEV-01",
    cat: "devices",
    src: "Electronic Devices · Ch. 1–2 (PN Junction & Bridge Rectifier + Ripple Filter)",
    title: "Full-Wave Bridge Rectifier DC Output, PIV Rating & Capacitor Filter Ripple",
    topicIds: ["components", "power-rails", "ac"],
    prompt: "A transformer secondary delivers 12 V_rms at 60 Hz into a 4-diode Silicon bridge rectifier (V_F = 0.7 V each) with a 1000 µF filter capacitor and a 1.0 kΩ load. Compute (a) filtered DC peak V_p(out) in V, (b) peak-to-peak ripple voltage V_r(pp) in mV, and (c) minimum diode PIV rating.",
    prereq: "First convert secondary RMS to peak (V_p(sec) = √2 · V_rms). In a bridge rectifier, TWO diodes conduct in series on each half-cycle, subtracting 2 × 0.7 V = 1.4 V, and ripple frequency DOUBLES to f_r = 2·f_in = 120 Hz.",
    formula: "V_p(out) = 1.414 * V_rms - 1.4 ;   V_r(pp) = V_p(out) / (f_r * R_L * C)",
    steps: [
      "Step 1 — Convert secondary RMS to Peak Voltage: V_p(sec) = √2 × 12 V = 1.4142 × 12 = 16.97 V.",
      "Step 2 — Subtract two forward Silicon diode drops (1.4 V): V_p(out) = 16.97 V − 1.40 V = 15.57 V (check answer box below accepts 15.57 V!).",
      "Step 3 — Determine full-wave ripple frequency: f_r = 2 × 60 Hz = 120 Hz.",
      "Step 4 — Convert filter values to SI: R_L = 1.0 × 10³ Ω, C = 1000 × 10⁻⁶ F = 1.0 × 10⁻³ F → product R_L · C = 1.0 s.",
      "Step 5 — Calculate peak-to-peak ripple V_r(pp) = V_p(out) / (f_r · R_L · C) = 15.57 V / (120 × 1.0) = 0.1298 V = 129.8 mV_pp. Approximate V_DC = V_p(out) − V_r(pp)/2 = 15.505 V.",
      "Step 6 — Required Diode PIV rating: PIV = V_p(out) + 0.7 V = 15.57 + 0.7 = 16.27 V (use ≥ 50 V rated 1N4001 for safety margin)."
    ],
    answerType: "number",
    expected: 15.57,
    unit: "V"
  },
  {
    id: "CW-DEV-02",
    cat: "devices",
    src: "Electronic Devices · Ch. 3–4 (Zener Voltage Regulator & BJT Switch/Amplifier)",
    title: "Zener Shunt Regulator Series Current & BJT Saturation Overdrive Check",
    topicIds: ["components", "ohm", "power"],
    prompt: "Part A: A 5.1 V Zener regulator (R_series = 100 Ω) is fed from V_in = 12 V with load R_L = 510 Ω. Find Zener current I_Z in mA. Part B: An NPN transistor (β_DC = 100, V_CE(sat) = 0.2 V) has V_CC = 10 V, R_C = 1 kΩ, and R_B = 10 kΩ driven by V_BB = 5 V. Is it Active or Saturated?",
    prereq: "For Zener: KVL sets total input current I_T = (V_in − V_Z)/R_S, which splits by KCL into I_L = V_Z/R_L and I_Z = I_T − I_L. For BJT: compare β_DC·I_B against saturation ceiling I_C(sat) = (V_CC − V_CE(sat))/R_C.",
    formula: "I_T = (V_in - V_Z)/R_S ;   I_L = V_Z/R_L ;   I_Z = I_T - I_L",
    steps: [
      "Step 1 (Part A — Zener Total Current): Voltage across series resistor = 12.0 V − 5.1 V = 6.9 V. So I_T = 6.9 V / 100 Ω = 0.069 A = 69.0 mA.",
      "Step 2 (Part A — Load & Zener Current by KCL): Load current I_L = V_Z / R_L = 5.1 V / 510 Ω = 0.010 A = 10.0 mA. Therefore I_Z = I_T − I_L = 69.0 − 10.0 = 59.0 mA.",
      "Step 3 (Part A — Zener Power Check): P_Z = V_Z × I_Z = 5.1 V × 0.059 A = 0.301 W (301 mW — safe for a 1 W 1N4733A Zener, unsafe for a 250 mW device!).",
      "Step 4 (Part B — BJT Base Current): I_B = (V_BB − V_BE) / R_B = (5.0 V − 0.7 V) / 10 kΩ = 4.3 V / 10,000 Ω = 0.43 mA.",
      "Step 5 (Part B — Saturation Check): Unclamped active prediction = β_DC × I_B = 100 × 0.43 mA = 43 mA. But collector ceiling I_C(sat) = (10 V − 0.2 V) / 1 kΩ = 9.8 mA. Because 43 mA > 9.8 mA, the BJT is solidly IN SATURATION (switch CLOSED at V_CE ≈ 0.2 V)!"
    ],
    answerType: "number",
    expected: 59,
    unit: "mA"
  },
  {
    id: "CW-T63-01",
    cat: "tech63",
    src: "Tech 63 · Ch. 1–2 (Pulse Timing, Duty Cycle & IEEE 754 Floating Point)",
    title: "Digital Pulse Duty Cycle & Decode IEEE 754 Single-Precision 32-bit Float",
    topicIds: ["timing", "components", "buses"],
    prompt: "A PWM heater pulse has period T = 20 µs and HIGH width t_W = 5.0 µs. Find Duty Cycle %. Also decode the IEEE 754 32-bit float: 0 10000010 10010000000000000000000₂.",
    prereq: "Duty Cycle = (t_W / T) × 100% measured between 50% amplitude edges. IEEE 754 single precision packs [Sign S (1 bit) | Exponent E (8 bits, bias 127) | Mantissa F (23 bits)], representing (−1)^S × (1.F)_2 × 2^(E−127).",
    formula: "DutyCycle = (t_W / T) * 100 ;   Val = (-1)^S * (1 + F) * 2^(E - 127)",
    steps: [
      "Step 1 (Duty Cycle): D = (t_W / T) × 100% = (5.0 µs / 20.0 µs) × 100% = 0.25 × 100% = 25%.",
      "Step 2 (IEEE 754 Sign bit S): First bit is 0 → positive sign (−1)⁰ = +1.",
      "Step 3 (Biased Exponent E): Next 8 bits are 10000010₂ = 128 + 2 = 130₁₀. Unbiased exponent = E − 127 = 130 − 127 = +3.",
      "Step 4 (Significand / Fraction F): Top bits of 23-bit mantissa are .1001₂ = 1×2⁻¹ + 0 + 0 + 1×2⁻⁴ = 0.5 + 0.0625 = 0.5625. Add the implicit leading 1 → 1.5625.",
      "Step 5 (Final IEEE 754 Value): Value = +1 × 1.5625 × 2³ = 1.5625 × 8 = +12.50!"
    ],
    answerType: "number",
    expected: 25,
    unit: "%"
  },
  {
    id: "CW-T63-02",
    cat: "tech63",
    src: "Tech 63 · Ch. 3–6 (DeMorgan's Theorems, K-Map Minimization & Full Adder)",
    title: "Simplify Boolean Logic with DeMorgan + 4-Var K-Map + Verify 4-Bit Adder",
    topicIds: ["components", "schematics"],
    prompt: "Use DeMorgan's Theorem to simplify F = NOT( NOT(A·B) · C ), and check what decimal sum + Cout results when adding 1011₂ (11) + 0111₂ (7) in a 4-bit ripple-carry adder (enter decimal 4-bit Sum nibble 0–15).",
    prereq: "DeMorgan's two golden rules: (1) Break the bar, flip the operator: NOT(X·Y) = X̄ + Ȳ and NOT(X+Y) = X̄ · Ȳ. Double inversion cancels: X̄̄ = X. In a Full Adder: Σ = A⊕B⊕C_in, C_out = A·B + C_in(A⊕B).",
    formula: "NOT( NOT(A*B) * C ) = A*B + NOT(C) ;   1011_2 + 0111_2 = 10010_2",
    steps: [
      "Step 1 — Apply DeMorgan's rule to outer inversion of F = NOT( NOT(A·B) · C ): split the top bar over the AND dot (· → +): F = NOT(NOT(A·B)) + NOT(C).",
      "Step 2 — Cancel double negation NOT(NOT(A·B)) = A·B: Final simplified SOP expression is F = A·B + C̄ (just 1 two-input AND + 1 NOT + 1 OR gate!).",
      "Step 3 — 4-bit Ripple Adder column-by-column: 1011₂ (11₁₀) + 0111₂ (7₁₀), starting C₀ = 0:",
      "Step 4 — LSB Bit 0: 1+1+0 = 0, C₁=1; Bit 1: 1+1+1 = 1, C₂=1; Bit 2: 0+1+1 = 0, C₃=1; MSB Bit 3: 1+0+1 = 0, C₄=1.",
      "Step 5 — Result: C_out = 1 (weight 16) and 4-bit Sum nibble = 0010₂ = 2 (total 16 + 2 = 18 = 11 + 7!)."
    ],
    answerType: "number",
    expected: 2,
    unit: "Sum (nibble)"
  },
  {
    id: "CW-852-01",
    cat: "engr852",
    src: "SFSU ENGR 852 · HW2 Q1(a) & Q1(b) (Setup vs. Hold STA & casex K-Map)",
    title: "ASIC Static Timing Analysis: Max Clock Frequency f_max vs. Hold Violation Slack",
    topicIds: ["timing", "components"],
    prompt: "Given t_CQ(max)=950 ps, t_CQ(min)=300 ps, worst slow path t_logic(max)=590 ps, fastest path t_MUX_S(min)=30 ps, t_setup=300 ps, t_hold=400 ps, t_skew=750 ps: compute (a) T_clk(min) in ps & f_max in MHz, and (b) Hold Slack in ps (explain why lowering f_clk cannot fix hold!).",
    prereq: "Setup is a NEXT-EDGE deadline (longer path makes it slower): T_clk(min) = t_CQ(max) + t_logic(max) + t_su + t_skew. Hold is a SAME-EDGE race: t_CQ(min) + t_logic(min) ≥ t_hold + t_skew. Hold Slack = Arrival_min − Required_hold.",
    formula: "T_clk(min) = 950 + 590 + 300 + 750 = 2590 ps ;   HoldSlack = (300 + 30) - (400 + 750)",
    steps: [
      "Step 1 (Setup T_clk(min)): Sum worst-case launch + critical combinational path (AND 210 + OR 200 + MUX 180 = 590 ps) + setup + skew: T_clk(min) = 950 + 590 + 300 + 750 = 2,590 ps = 2.590 ns.",
      "Step 2 (Maximum Frequency f_max): f_max = 1 / 2.590 ns = 1000 / 2.590 MHz = 386.10 MHz.",
      "Step 3 (Hold Fastest Arrival Time): Path P4 goes straight from launch DFF Q_S to MUX Select S: t_arrival(min) = t_CQ(min) + t_MUX_S(min) = 300 ps + 30 ps = 330 ps.",
      "Step 4 (Required Hold Window with Skew): t_hold_req = t_hold(max) + t_skew = 400 ps + 750 ps = 1,150 ps.",
      "Step 5 (Hold Slack — Type -820 below): Hold Slack = 330 ps − 1,150 ps = −820 ps (SEVERE HOLD VIOLATION — even at 0 ps skew, 330 − 400 = −70 ps fail!).",
      "Step 6 (ENGR 852 Golden Rule): Slowing T_clk CANNOT fix hold because T_clk is not in the hold inequality! You MUST insert ≥ +820 ps physical delay buffers on the fast Q_S → S path (and never touch T_clk for hold!)."
    ],
    answerType: "number",
    expected: -820,
    unit: "ps"
  },
  {
    id: "CW-P2B-01",
    cat: "physics2b",
    src: "Physics 2B Lab 8 & MUON 141-Q (RC Loading + TVAC + 100x1Ω Array)",
    title: "Physics 2B Lab 8: RC Decay with 10 MΩ DVM Loading & Multi-Fault Parallel Array",
    topicIds: ["rc", "parallel", "qualification"],
    prompt: "Physics 2B Lab 8: A 2.2 µF capacitor is connected in parallel with R = 4.7 MΩ AND a 10 MΩ digital voltmeter (DVM). Calculate the actual observed time constant τ in seconds (including the DVM loading!).",
    prereq: "Because the DVM input resistance (10 MΩ) is connected directly across the capacitor alongside the bleed resistor R = 4.7 MΩ, total discharge resistance R_eq is R ∥ R_DMM—cutting τ noticeably shorter than R·C!",
    formula: "R_eq = (R * R_DVM) / (R + R_DVM) ;   tau = R_eq * C",
    steps: [
      "Step 1 — Notice topology: Capacitor C, resistor R (4.7 MΩ), and voltmeter R_DVM (10 MΩ) share the same two nodes (parallel!).",
      "Step 2 — Convert resistance units carefully (keep in MΩ first): R = 4.7 MΩ, R_DVM = 10.0 MΩ.",
      "Step 3 — Compute parallel equivalent R_eq = (4.7 × 10) / (4.7 + 10) = 47 / 14.7 = 3.1973 MΩ = 3.1973 × 10⁶ Ω (without DMM it would be 4.7 MΩ!).",
      "Step 4 — Convert C to farads: C = 2.2 µF = 2.2 × 10⁻⁶ F.",
      "Step 5 — Multiply R_eq · C (notice 10⁶ × 10⁻⁶ = 1!): τ = 3.1973 × 2.2 = 7.034 seconds (vs. 10.34 s if you forgot DMM loading!)."
    ],
    answerType: "number",
    expected: 7.034,
    unit: "s"
  },
  {
    id: "CW-T60-06",
    cat: "tech60",
    src: "Tech 60 · Ch. 9–13 (Mesh/Cramer Determinant, Capacitor Reactance & RL τ)",
    title: "2-Loop Mesh Current via Cramer's Rule & Capacitive Reactance X_C at 10 kHz",
    topicIds: ["kcl-kvl", "capacitors", "ac"],
    prompt: "Solve this 2-mesh system by Cramer's Rule for loop current I₁ (in mA): (300·I₁ − 100·I₂ = 6 V) and (−100·I₁ + 400·I₂ = 0 V). Also calculate capacitive reactance X_C (in Ω) of a 0.1 µF bypass cap at f = 10 kHz.",
    prereq: "For a 2×2 determinant [a b; c d], D = a·d − b·c. Replace column 1 with RHS voltage vector [V₁; V₂] to form D₁, giving I₁ = D₁ / D. Capacitive reactance obeys X_C = 1 / (2·π·f·C).",
    formula: "D = 300*400 - (-100)*(-100) ;   I1 = (6*400 - (-100)*0) / D",
    steps: [
      "Step 1 — Write 2×2 resistance coefficient matrix [300, −100; −100, 400] (in Ω).",
      "Step 2 — Compute system determinant Δ: Δ = (300)(400) − (−100)(−100) = 120,000 − 10,000 = 110,000 Ω².",
      "Step 3 — Form Δ₁ by replacing column 1 with [6; 0]: Δ₁ = (6)(400) − (−100)(0) = 2,400 V·Ω.",
      "Step 4 — Solve for I₁ = Δ₁ / Δ = 2,400 / 110,000 = 0.02182 A = 21.82 mA.",
      "Step 5 — Bonus X_C at 10 kHz: X_C = 1 / (2π × 10⁴ × 0.1 × 10⁻⁶) = 1 / (6.283 × 10⁻³) = 159.15 Ω."
    ],
    answerType: "number",
    expected: 21.82,
    unit: "mA"
  },
  {
    id: "CW-DEV-03",
    cat: "devices",
    src: "Electronic Devices · Ch. 3 & 5 (LM317 Regulator & BJT CE Load Line)",
    title: "LM317 Adjustable Regulator Output Voltage & Common-Emitter V_CE Bias Check",
    topicIds: ["power-rails", "components"],
    prompt: "An LM317 linear regulator sets V_ref = 1.25 V across R₁ = 240 Ω with lower feedback resistor R₂ = 1.2 kΩ (ignore I_adj · R₂ ≈ 50 µA·1.2k ≈ 0.06 V). Find ideal V_out in V.",
    prereq: "Inside the LM317, the output pin floats 1.25 V above the ADJ pin. That 1.25 V forces constant reference current I_ref = 1.25 V / R₁ down through R₂ in series to ground, creating V_out = 1.25 · (1 + R₂ / R₁).",
    formula: "V_out = 1.25 * (1 + R2 / R1)",
    steps: [
      "Step 1 — Convert R₁ and R₂ to matching ohms: R₁ = 240 Ω, R₂ = 1.2 kΩ = 1,200 Ω.",
      "Step 2 — Compute resistor ratio R₂ / R₁ = 1,200 / 240 = 5.0.",
      "Step 3 — Multiply by internal bandgap reference: V_out = 1.25 V × (1 + 5.0) = 1.25 V × 6.0 = 7.50 V.",
      "Step 4 — Heat dissipation warning: If V_in = 12 V and I_load = 0.5 A, LDO burns P_heat = (12 − 7.5) × 0.5 = 2.25 W—attach a heatsink or derate in vacuum!"
    ],
    answerType: "number",
    expected: 7.5,
    unit: "V"
  },
  {
    id: "CW-T63-03",
    cat: "tech63",
    src: "Tech 63 · Ch. 2, 4 & 6 (Gray Code, 4-Var K-Map & Priority Encoder)",
    title: "Binary ↔ Gray Code Conversion & 8421 BCD Addition With Invalid Correction (+6)",
    topicIds: ["components", "buses"],
    prompt: "Convert 4-bit unsigned binary 1011₂ (decimal 11) to Gray code (enter as 4-bit decimal value 0–15: e.g. 1110₂ = 14) and explain why optical/rotary encoders use Gray code.",
    prereq: "Adjacent Gray code numbers differ by ONLY 1 bit, preventing false multi-bit transition glitches on asynchronous mechanical encoders. Rule: MSB stays identical (G₃ = B₃); every next bit is G_k = B_(k+1) XOR B_k.",
    formula: "G3 = B3 ;   G2 = B3 XOR B2 ;   G1 = B2 XOR B1 ;   G0 = B1 XOR B0",
    steps: [
      "Step 1 — Label bits of binary 1011₂: B₃=1, B₂=0, B₁=1, B₀=1.",
      "Step 2 — Copy MSB: G₃ = B₃ = 1.",
      "Step 3 — XOR adjacent binary pairs: G₂ = B₃ ⊕ B₂ = 1 ⊕ 0 = 1; G₁ = B₂ ⊕ B₁ = 0 ⊕ 1 = 1; G₀ = B₁ ⊕ B₀ = 1 ⊕ 1 = 0.",
      "Step 4 — Assemble Gray bits: 1110₂ (= 8 + 4 + 2 + 0 = 14₁₀).",
      "Step 5 — Why engineers love Gray code: Passing FIFO/CDC pointers across clock domains in Gray code guarantees a metastability sample can only read old N or new N+1—never a corrupt half-switched pointer!"
    ],
    answerType: "number",
    expected: 14,
    unit: "(1110₂)"
  },
  {
    id: "CW-852-02",
    cat: "engr852",
    src: "SFSU ENGR 852 · HW2 Q2 & Lab Motion Estimator (casex E=D & 8/16-bit SAD)",
    title: "16-Row Truth Table K-Map Reduction (E=D) & 8-bit vs 16-bit Motion Estimator SAD Saturation",
    topicIds: ["components", "automation"],
    prompt: "In ENGR 852 Motion Estimator (16×16 pixels, 8-bit 0–255), a worst-case 16×16 macroblock pair has max per-pixel diff = 255 across all 256 pixels. What is the true mathematical max SAD (in decimal), and why did 8-bit BestDist saturate to 0xff (255)?",
    prereq: "16 × 16 = 256 pixels. Maximum Sum of Absolute Differences = 256 × 255 = 65,280 (requires 16 bits, max 65,535!). An 8-bit register caps at 2⁸ − 1 = 255 (0xFF), saturating immediately after 1–2 high-contrast pixels!",
    formula: "SAD_max = (16 * 16) * 255 = 256 * 255",
    steps: [
      "Step 1 — Count total pixels per macroblock: 16 rows × 16 columns = 256 pixels.",
      "Step 2 — Maximum absolute pixel difference for 8-bit grayscale [0..255]: |255 − 0| = 255 per pixel.",
      "Step 3 — Multiply for worst-case SAD: 256 × 255 = 65,280.",
      "Step 4 — Compare bit-widths: log₂(65,280) = 15.994 → requires full 16-bit unsigned accumulator (`reg [15:0] BestDist`, max 65,535). Initializing `BestDist = 16'hFFFF` beats 8-bit `8'hFF`!",
      "Step 5 — HW2 Q2 `casex` K-Map reminder: When Don't-Care row 0101 is set X = 1, all eight D=1 minterms group cleanly into E = D (0 gates, 0 latches with `default: E = 1'b0`)."
    ],
    answerType: "number",
    expected: 65280,
    unit: "SAD"
  },
  {
    id: "CW-MUON-01",
    cat: "physics2b",
    src: "Muon Space 141-Q · Vacuum TVAC & 5V 100×1Ω Parallel Array Faults",
    title: "5V Main Rail Feeding 100 Parallel 1 Ω Resistors With Mixed Opens + 0 Ω Shorts",
    topicIds: ["parallel", "safety", "instruments"],
    prompt: "A +5 V rail feeds 100 nominal 1 Ω resistors in parallel. What is healthy R_eq in milliohms (mΩ)? And if two units short to 0 Ω while three units burn open (∞ Ω), why must you clear shorts with IR + 4-wire Kelvin BEFORE finding opens?",
    prereq: "For N identical resistors R in parallel: R_eq = R / N. A 0 Ω short across any branch creates a zero-resistance bypass path that masks ∞ Ω opens on an ohmmeter!",
    formula: "R_eq_healthy = (1 Ohm / 100) * 1000 mOhm/Ohm",
    steps: [
      "Step 1 — Paper Math (Healthy Baseline): 100 × 1 Ω in parallel → R_eq = 1 / 100 = 0.01 Ω = 10.0 mΩ. At 5.0 V, ideal bus demand would be I = V / R_eq = 5 / 0.01 = 500 A (P = 2,500 W!).",
      "Step 2 — Explain Why 2-Wire DMM Fails: Standard probe leads contribute ~0.24 Ω — 24× bigger than 10 mΩ! Switch to 4-Wire Kelvin mode.",
      "Step 3 — Clear 0 Ω Shorts First (Masking Rule): A single 0 Ω shorted resistor drags R_eq → ~0 Ω regardless of how many open resistors exist. Inject current-limited 1 V / 2 A safe bias, locate hot-spot short & ΔV trace gradient via IR camera + mV probe, lift 1 pad per suspect (0.000 Ω confirms short) until 4-wire R_eq ≥ 10.00 mΩ.",
      "Step 4 — Locate ∞ Ω Opens Second: With shorts removed, count active healthy branches directly from Kelvin conductance: N_healthy = 1 / R_eq → N_open = 100 − 1/R_eq. Apply safe 1 V bias (~1 W warm-up to 60 °C on healthy 1 Ω resistors): the 3 opens remain cold at 25 °C ambient on the IR thermal camera!"
    ],
    answerType: "number",
    expected: 10,
    unit: "mΩ"
  }
];

/* ============================================================================
   4. AVIONICS PROFESSOR STEPS BUILDER (Non-Repetitive, Zero-to-One Chalkboard)
   ============================================================================ */
function buildAvionicsProfessorSteps(q, t, f, helpers) {
  const st = Array.isArray(q.steps) ? q.steps : [];
  const beginner = f && f.deep ? f.deep : null;
  const guided = q.lesson || null;
  const formulaStr = q.formula || (beginner && beginner.formula) || null;
  const subStr = q.sub || (beginner && beginner.sub) || null;
  const fmtFn = (helpers && helpers.fmt) || fmt;
  const engFn = (helpers && helpers.engVal) || engVal;
  const note = TOPIC_PROFESSOR_NOTES[t.id] || TOPIC_PROFESSOR_NOTES.ohm;

  // CRITICAL INVARIANT: Preserve step count:
  // - 8 steps for q.advancedStage >= 31
  // - 7 steps for f.label === "SI base unit" (when SI module present)
  // - 6 steps for all Q1-Q30 otherwise
  if (q.advancedStage >= 31) {
    const advTitles = [
      "1. Define Physical Concept, Target Variable & SI Units",
      "2. Separate Raw Telemetry/Symptom from Root-Cause Guess",
      "3. Predict Healthy Baseline Operating Point",
      "4. Execute Safe Non-Destructive First Measurement",
      "5. Full Mathematical Derivation / Fault Proof",
      "6. Falsify Competing Hypotheses (A/B/A Control)",
      "7. Corroborate on Independent Channel or Subsystem",
      "8. Engineering Disposition (PASS / FAIL / INVALID) & Action"
    ];
    return st.slice(0, 8).map((body, i) => ({
      title: advTitles[i] || `Step ${i + 1}: Analyze and verify`,
      body: i === 1 ? `${body} [Prefix check: ${buildConversionExplanation(q.question)}]`
          : i === 5 ? `${body} Watch for trap: ${note.trap}` : body,
      kind: q.expected !== undefined && i === 4 ? "answer" : (q.expected !== undefined && (i === 2 || i === 3) ? "formula" : "text"),
      formula: q.expected !== undefined && i === 2 ? q.formula : (q.expected !== undefined && i === 3 ? q.sub : null),
      answer: q.expected !== undefined && i === 4 ? fmtFn(q.expected) + " " + q.unit : null,
      engHtml: q.expected !== undefined && i === 4 ? engFn(q.expected, q.unit) : null
    }));
  }

  // Numerical Calculation Problems (Q11-Q20): Always 6 distinct chalkboard steps showing EVERY conversion & algebra step
  if (q.expected !== undefined) {
    const convText = buildConversionExplanation(q.question);
    const step4Detail = subStr ? `${st[1] || "Substitute every converted base-SI value cleanly into the formula."} Full check: ${subStr}` : (st[1] || "Substitute numbers step by step.");
    const step6Trap = `${st[2] || ""} ${st[3] || ""} Professor's sanity check: ${note.trap}`.trim();
    return [
      {
        title: `1. Physical Picture & Target Output (${q.unit})`,
        body: `First visualize what is physically happening in "${t.title}": ${note.intuition} Here we are solving for a quantity measured in "${q.unit}".`,
        kind: "text"
      },
      {
        title: "2. Extract Givens & Convert Prefixes to Base SI (10^(3n))",
        body: `Never plug milliamps, kilohms, or microfarads straight into base formulas until you track powers of 10: ${convText}`,
        kind: "given",
        formula: q.unitConv || null
      },
      {
        title: "3. Select Governing Physical Law & Define Every Symbol",
        body: `${st[0] || "Choose the exact equation connecting your knowns to your target variable."} Why this law works: ${note.lawWhy}`,
        kind: "formula",
        formula: formulaStr
      },
      {
        title: "4. Step-by-Step Algebraic Substitution (Show All Work)",
        body: step4Detail,
        kind: subStr ? "formula" : "text",
        formula: subStr
      },
      {
        title: "5. Final Numerical Result & Engineering Notation",
        body: `Evaluate the arithmetic carefully to get ${fmtFn(q.expected)} ${q.unit}. Keep sign and unit consistent; on Page 4 you can enter standard decimals or scientific notation like 2.5e-3.`,
        kind: "answer",
        answer: fmtFn(q.expected) + " " + q.unit,
        engHtml: engFn(q.expected, q.unit)
      },
      {
        title: "6. Physical Plausibility Check, Common Trap & Bench Verification",
        body: step6Trap,
        kind: "text"
      }
    ];
  }

  // Non-numeric Foundations / Application (Q1-Q10) OR Troubleshooting (Q21-Q30):
  // Map all authored q.steps without copying Page 1's summary/analogy/why boilerplate!
  if (q.level === "Troubleshooting") {
    return [
      {
        title: "1. Isolate Observable Symptom vs. Unverified Hypothesis",
        body: `${st[0] || q.question} Rule #1 on the bench: describe exactly what the DMM, oscilloscope, or log showed without assuming the chip died.`,
        kind: "text"
      },
      {
        title: "2. Safe Power-Off Inspection & Meter Protection Before Touching",
        body: `${st[1] || "Set PSU current limit and verify probes before energizing."} Always match meter mode to measurement: never measure Ω on a live rail, and keep grounded scope clips off floating nodes.`,
        kind: "text"
      },
      {
        title: formulaStr ? "3. Predict Healthy Baseline Using Governing Law" : "3. Predict Healthy Baseline Physics",
        body: `${st[2] || "Predict the exact voltage, current, timing, or digital waveform of a known-good unit."} Reference insight: ${note.lawWhy}`,
        kind: formulaStr ? "formula" : "text",
        formula: formulaStr
      },
      {
        title: subStr ? "4. Evaluate Fault Signature & Compare Readings" : "4. Contrast Fault Signature vs. Healthy Benchmark",
        body: `${st[3] || f.test || "Measure both sides of the suspected interface (source vs. load) to localize where energy or data is lost."} Watch for: ${note.trap}`,
        kind: subStr ? "formula" : "text",
        formula: subStr
      },
      {
        title: "5. Controlled A-B-A Swap Proof & Repeatability",
        body: `Swap ONLY ONE suspected variable (cable, fixture, or DUT) while holding supply/temp fixed to verify the fault follows the suspect and disappears when restored. ${st[4] || ""}`.trim(),
        kind: "text"
      },
      {
        title: "6. Final Engineering Disposition (GO / NO-GO / INVALID) & Action",
        body: `${st[5] || "Document exact raw readings, serial/stepping ID, passing/failing spec guardband, and corrective prevention test."}`,
        kind: "answer"
      }
    ];
  }

  // Foundations / Application (Q1-Q10, non-numeric) — preserve 6 steps (or 7 for SI base unit)
  const stepsOut = [
    {
      title: `1. Physical First Principle (${f.label})`,
      body: `${st[0] || f.definition} Physically: ${note.intuition}`,
      kind: "text"
    },
    {
      title: "2. Bench Behavior & What an Instrument Actually Observes",
      body: `${st[1] || "Picture how a bench DMM, oscilloscope, or logic analyzer senses this quantity between two specific circuit points."} Setup check: ${f.test || "Record both value and unit relative to ground."}`,
      kind: "text"
    },
    {
      title: formulaStr ? "3. Governing Law & Unit Derivation" : "3. Underlying Physical Relationship (No Unrelated Equation)",
      body: formulaStr
        ? `Define every variable first before substituting: ${st[2] || note.lawWhy}`
        : `Think clearly about units and definitions without forcing an unrelated equation like V=IR: ${st[2] || note.lawWhy}`,
      kind: formulaStr ? "formula" : "text",
      formula: formulaStr
    },
    {
      title: subStr ? "4. Worked Numerical Proof Step-by-Step" : "4. Step-by-Step Concrete Cause & Effect Example",
      body: subStr
        ? `Walk through this concrete example cleanly: ${st[3] || (guided ? guided.example : "")}`
        : `${st[3] || (guided ? guided.example : (beginner ? beginner.example : "Trace how doubling or reversing one parameter shifts the physical outcome."))}`,
      kind: subStr ? "formula" : "text",
      formula: subStr
    },
    {
      title: "5. Beginner Trap to Avoid on Exams & Flight Hardware",
      body: `Common mistake on "${f.label}": ${note.trap} Cross-check: ${st[4] || f.why}`,
      kind: "text"
    },
    {
      title: "6. Professor-Approved Spoken Interview Synthesis",
      body: `Put it into 3 crisp engineering sentences: (1) Define ${f.label}, (2) explain the physical/bench check (${st[st.length - 1] || f.test}), and (3) state the safe pass/fail boundary.`,
      kind: "answer"
    }
  ];

  if (f.label === "SI base unit") {
    stepsOut.splice(5, 0, {
      title: "6a. Seven SI Base Units vs. Derived Electrical Units (Floyd Table 1-1)",
      body: "The 7 SI base units are meter (m), kilogram (kg), second (s), ampere (A), kelvin (K), mole (mol), and candela (cd). Only ampere (A) is electrical! Volt (J/C = kg·m²/(A·s³)), ohm (V/A), watt (J/s), farad, and coulomb are derived units. Radian and steradian were reclassified as dimensionless derived units in 1995.",
      kind: "text"
    });
  }
  return stepsOut;
}

/* ============================================================================
   5. AVIONICS UI PANELS (Page 1 Understand, Page 2 Visuals, Page 3 Work, Page 4 Try)
   ============================================================================ */
let activeCourseFilter = "all";
let courseBankOpen = false;
let revealedCourseSolutions = new Set(["CW-T60-01", "CW-852-01"]);

function renderCourseworkBankHTML(t) {
  const items = AVIONICS_WORKED_BANK.filter(x => activeCourseFilter === "all" || x.cat === activeCourseFilter);
  const filters = [
    ["all", "All Worked Problems (" + AVIONICS_WORKED_BANK.length + ")"],
    ["tech60", "Tech 60 DC/AC & Bridges"],
    ["devices", "Electronic Devices (Diode/Zener/BJT)"],
    ["tech63", "Tech 63 Digital & IEEE 754"],
    ["engr852", "ENGR 852 Setup/Hold STA"],
    ["physics2b", "Physics 2B 10MΩ DMM & Muon"]
  ];
  return `<details class="av-prof-bank" id="avProfCourseworkBank" ${courseBankOpen ? "open" : ""}>
    <summary>📚 Professor's Step-by-Step Worked Problem Manual (Tech 60 · Electronic Devices · Tech 63 · ENGR 852 · Physics 2B)</summary>
    <div class="av-prof-bank-body">
      <p style="margin-top:0;font-size:0.9rem;color:#334155;">Every problem below shows <strong>all prerequisites, metric prefix conversions, algebraic steps, intermediate arithmetic, and physical checks</strong> from zero background—specifically built for weak EE foundations and interview mastery.</p>
      <div class="av-prof-filters" role="group" aria-label="Filter worked coursework problems">
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
            <div><strong>Governing Formula:</strong></div>
            <div style="margin:4px 0;">${eq(item.formula)}</div>
            <ol>${item.steps.map(s => `<li>${rich(s)}</li>`).join("")}</ol>
            <div style="font-weight:700;color:#065f46;">Verified Result: ${esc(fmt(item.expected))} ${esc(item.unit)}</div>
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
    <h4><span class="av-prof-badge">Professor's Lecture</span> Ground-Up Intuition &amp; Prefix Anatomy for ${esc(q.id.toUpperCase())}</h4>
    <div class="av-prof-grid">
      <div class="av-prof-card">
        <h5>1. Physical Intuition (No Prior EE Needed)</h5>
        <p>${esc(note.intuition)}</p>
      </div>
      <div class="av-prof-card">
        <h5>2. Why the Governing Law Works</h5>
        <p>${esc(note.lawWhy)}</p>
      </div>
    </div>
    <div class="av-prof-card" style="margin-top:10px;">
      <h5>3. Given Quantities &amp; Metric Prefix Table (Tech 60 10<sup>3n</sup> Rule)</h5>
      ${convRow}
    </div>
    <div class="av-prof-trap"><strong>⚠️ Common Beginner &amp; Lab Trap:</strong> ${esc(note.trap)}</div>
  </section>${renderCourseworkBankHTML(t)}`;
}

function renderAvionicsVisualGuide(q, t) {
  const note = TOPIC_PROFESSOR_NOTES[t.id] || TOPIC_PROFESSOR_NOTES.ohm;
  const sp = window.PROFESSOR_NOTEBOOK_SPREADS;
  return `<section class="av-prof-box" aria-label="Professor schematic and bench reading guide">
    <h4><span class="av-prof-badge">Visual Reading Guide</span> How an EE Professor Reads These 3 Diagrams for ${esc(q.id.toUpperCase())}</h4>
    <div class="av-prof-grid">
      <div class="av-prof-card">
        <h5>Diagram 1 — Schematic Nodes &amp; Loop Trace</h5>
        <p>Start at the positive rail (+), trace every dot junction (shared node voltage), and verify the unbroken return path to ground (−). Series elements carry identical current; parallel elements share both top and bottom nodes.</p>
      </div>
      <div class="av-prof-card">
        <h5>Diagram 2 — Scope Waveform &amp; Operating Curve</h5>
        <p>Check horizontal (time or frequency) and vertical (V/div, mA, dB) axes first. Note whether signals are DC-coupled or AC-coupled, and check if the operating point sits in cutoff, active, saturation, or −3 dB roll-off.</p>
      </div>
      <div class="av-prof-card">
        <h5>Diagram 3 — Breadboard &amp; Probe Placement</h5>
        <p>Remember 5-hole vertical terminal strips share one copper clip underneath. Never place both ends of a component in the same 5-hole column (short!), and remember: <strong>${esc(note.trap)}</strong></p>
      </div>
    </div>
  </section>${sp ? sp.renderFlagshipGallerySection("avionics") : ""}`;
}

function renderAvionicsChalkboard(q, t) {
  const convText = buildConversionExplanation(q.question);
  const formulaStr = q.formula || "Apply Kirchhoff + physical unit reasoning (do not force an unrelated equation)";
  const subStr = q.sub || (q.lesson && q.lesson.example) || "Compare expected healthy state against observed faulty reading.";
  const note = TOPIC_PROFESSOR_NOTES[t.id] || TOPIC_PROFESSOR_NOTES.ohm;
  const steps = Array.isArray(q.steps) ? q.steps : [];
  const sp = window.PROFESSOR_NOTEBOOK_SPREADS;

  return `${sp ? sp.renderQuestionNotebookSpread(q, t, false) : ""}<section class="av-prof-chalkboard" aria-label="Professor chalkboard full derivation">
    <h4>🧮 Professor's Complete Chalkboard Solution (All Work &amp; Intermediate Steps Shown)</h4>
    <div class="av-prof-chalk-step">
      <strong>STEP A · GIVEN INPUTS &amp; BASE-SI PREFIX CONVERSIONS</strong>
      <div>${esc(convText)}</div>
    </div>
    <div class="av-prof-chalk-step">
      <strong>STEP B · GOVERNING LAW &amp; SYMBOL DEFINITIONS</strong>
      <div>${eq(formulaStr)}</div>
      <small style="color:#cbd5e1;">Why it applies: ${esc(note.lawWhy)}</small>
    </div>
    <div class="av-prof-chalk-step">
      <strong>STEP C · FULL SUBSTITUTION &amp; WORKED INTERMEDIATE ARITHMETIC</strong>
      <div>${rich(subStr)}</div>
      ${steps.length ? `<ul style="margin:6px 0 0 18px;font-size:0.86rem;color:#e2e8f0;">${steps.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
    </div>
    <div class="av-prof-chalk-step">
      <strong>STEP D · FINAL ANSWER &amp; DIMENSIONAL SANITY CHECK</strong>
      <div>${q.expected !== undefined ? `<code>${esc(fmt(q.expected))} ${esc(q.unit)}</code> &nbsp;·&nbsp; Engineering Notation: ${engVal(q.expected, q.unit)}` : "Confirm observation + A-B-A control swap falsifiability."}</div>
      <small style="color:#fcd34d;">Guard against trap: ${esc(note.trap)}</small>
    </div>
  </section>`;
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
    instrument: "A 2D Shmoo plot sweeps Voltage (V_DD) on one axis vs. Frequency (f_clk) or temperature on the other to map the pass/fail cliff—and reveals ENGR 852's Setup vs. Hold distinction: Setup fails improve when f_clk slows down; Hold failures persist across ALL frequencies!",
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
    badge: "ENGR 852 · HW2 Setup & Hold STA (Critical Post-Silicon Knowledge)",
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
  const sp = window.PROFESSOR_NOTEBOOK_SPREADS;
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
  </section>${sp ? sp.renderFlagshipGallerySection("all") : ""}`;
}

function renderNvidiaWorkedDerivation(q, t) {
  const lec = NVIDIA_TRACK_LECTURES[t.id] || NVIDIA_TRACK_LECTURES.electrical;
  const convText = buildConversionExplanation(q.question);
  const isMath = q.questionType === "number";
  const sp = window.PROFESSOR_NOTEBOOK_SPREADS;

  return `${sp ? sp.renderQuestionNotebookSpread(q, t, true) : ""}<section class="nvs-prof-chalkboard" aria-label="NVIDIA Professor Complete Step-by-Step Chalkboard">
    <h4>🧮 Professor's Complete Worked Walkthrough (${esc(q.skillName)} · ${esc(q.phase)})</h4>
    ${isMath ? `
      <div class="nvs-prof-chalk-step">
        <strong>1. GIVEN INPUTS &amp; METRIC PREFIX CONVERSION</strong>
        <div>${esc(convText)}</div>
      </div>
      <div class="nvs-prof-chalk-step">
        <strong>2. GOVERNING PHYSICAL EQUATION</strong>
        <div>${eq(q.formula || "")}</div>
      </div>
      <div class="nvs-prof-chalk-step">
        <strong>3. COMPLETE INTERMEDIATE SUBSTITUTION &amp; COMPUTATION</strong>
        <div>${rich(q.sub || "")}</div>
        <div><code>Result = ${esc(fmt(q.expected))} ${esc(q.unit)}</code></div>
      </div>
      <div class="nvs-prof-chalk-step">
        <strong>4. PHYSICAL MEANING &amp; PASS / FAIL / INVALID GUARD</strong>
        <div>${esc(q.math?.why || "")} · Check: ${esc(q.math?.check || lec.trap)}</div>
      </div>` : `
      <div class="nvs-prof-chalk-step">
        <strong>1. UNDERLYING HARDWARE MECHANISM</strong>
        <div>${esc(lec.physics)}</div>
      </div>
      <div class="nvs-prof-chalk-step">
        <strong>2. SAFE EVIDENCE CAPTURE (BENCH / LINUX / SCOPE)</strong>
        <div>${esc(lec.instrument)}</div>
      </div>
      <div class="nvs-prof-chalk-step">
        <strong>3. COMPLETE ${q.steps.length}-STEP AUDIT CHECKLIST</strong>
        <ul style="margin:4px 0 0 18px;font-size:0.86rem;color:#e2e8f0;">${q.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
      </div>`}
  </section>`;
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
      <p style="margin-top:0;font-size:0.9rem;color:#334155;">Structured professor walkthroughs unifying the complete NVIDIA SLT Master Study Guide, ENGR 852 Setup/Hold STA, 4-Channel Keysight Scope methodology, Python edge-case grading, and Linux triage commands.</p>
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
