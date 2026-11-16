(function () {
  "use strict";

  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const SI_MULT = {
    p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, "μ": 1e-6,
    m: 1e-3, "": 1, k: 1e3, K: 1e3, M: 1e6, G: 1e9
  };

  const UNIT_SCALE = (val, pfx) => Number(val) * (SI_MULT[pfx || ""] || 1);

  /** Parse first matching engineering values by unit family from question text. */
  function extractValues(q) {
    const src = (q.question || "") + " ; " + (q.sub || "");
    const re = /(-?\d+(?:\.\d+)?)\s*(p|n|u|µ|μ|m|k|K|M|G)?(Ω|ohm|ohms|V|A|F|H|Hz|W|s|%)\b/gi;
    const out = { V: [], R: [], C: [], L: [], F: [], I: [], P: [], T: [] };
    let m;
    while ((m = re.exec(src))) {
      const raw = Number(m[1]);
      if (!Number.isFinite(raw)) continue;
      const pfx = m[2] || "";
      const u = m[3];
      const base = UNIT_SCALE(raw, pfx);
      if (u === "V" || u === "v") out.V.push(base);
      else if (u === "Ω" || /ohm/i.test(u)) out.R.push(base);
      else if (u === "F") out.C.push(base);
      else if (u === "H") out.L.push(base);
      else if (/hz/i.test(u)) out.F.push(base);
      else if (u === "A") out.I.push(base);
      else if (u === "W") out.P.push(base);
      else if (u === "s") out.T.push(base);
    }
    return out;
  }

  /** Format scalar quantity using readable SI prefixes. */
  function fmtEng(val, unit, sig) {
    const digits = sig || 3;
    if (!Number.isFinite(val)) return "— " + (unit || "");
    const abs = Math.abs(val);
    if (abs === 0) return "0 " + (unit || "");
    const tiers = [
      [1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""],
      [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]
    ];
    for (let i = 0; i < tiers.length; i++) {
      if (abs >= tiers[i][0] * 0.999 || i === tiers.length - 1) {
        const scaled = val / tiers[i][0];
        const rounded = Math.abs(scaled) >= 100
          ? scaled.toFixed(1)
          : Math.abs(scaled) >= 10
            ? scaled.toFixed(2)
            : scaled.toPrecision(digits);
        return rounded.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "") + " " + tiers[i][1] + (unit || "");
      }
    }
    return val.toPrecision(digits) + " " + (unit || "");
  }

  const BAND_COLORS = [
    "#1e293b", "#7c2d12", "#dc2626", "#f97316", "#eab308",
    "#16a34a", "#2563eb", "#7c3aed", "#64748b", "#f8fafc"
  ];
  const MULT_COLORS = {
    "-1": "#d4af37", "0": "#1e293b", "1": "#7c2d12", "2": "#dc2626",
    "3": "#f97316", "4": "#eab308", "5": "#16a34a", "6": "#2563eb"
  };

  function resistorBands(ohms) {
    const r = Math.max(1, Math.round(ohms));
    const exp = Math.max(0, Math.floor(Math.log10(r)) - 1);
    const sig = Math.min(99, Math.max(10, Math.round(r / Math.pow(10, exp))));
    return [
      BAND_COLORS[Math.floor(sig / 10) % 10],
      BAND_COLORS[sig % 10],
      MULT_COLORS[String(Math.min(6, exp))] || "#7c2d12",
      "#d4af37"
    ];
  }

  function questionMeta(q) {
    const m = String(q.id || "").match(/-([FADC])(\d+)$/);
    const letter = m ? m[1] : "F";
    const num = m ? Number(m[2]) : 1;
    const varIdx = q.variantIndex != null ? q.variantIndex : ((num - 1) % 5);
    const skillIdx = q.skillIndex != null
      ? q.skillIndex
      : (letter === "D" ? Math.floor((num - 1) / 2) : (num - 1) % 5);
    return { letter, num, varIdx, skillIdx };
  }

  /** Choose distinct bench source/instrument persona for Panel 1 & header. */
  function chooseBenchInstrument(topicId, topo, meta) {
    const map = {
      units: ["Bench DMM + Precision Rail", "AWG / Power Rail Source", "Calibrated Load Box", "Reference Standard DUT", "Dual-Range MeterRig"],
      ohm: ["Programmable DC PSU", "Series Current Rig", "Component Ohm Bridge", "Variable Sweep Supply", "Kelvin Rail Source"],
      power: ["High-Current DC PSU", "Electronic Load Step", "Thermal Stress Fixture", "Battery / Runtime Sim", "Shunt Sense Harness"],
      series: ["3.3V Avionics Backplane", "Series String Fixture", "Voltage Divider Rig", "KVL Loop Harness", "ADC Input Stage"],
      parallel: ["Multi-Branch Power Hub", "Parallel Load Bank", "Branch Current Meter", "Split Bus Distribution", "Fused Sub-Rail Rig"],
      "kcl-kvl": ["KCL Node Aggregator", "Series KVL Mesh Rig", "Star Ground Backplane", "2-Node Bridge DUT", "Twin-Supply Mesh Rig"],
      thevenin: ["Sensor + ADC Frontend", "Two-Source Linear Net", "Open-Circuit Vth Rig", "Source-Zeroed Rth Rig", "Loaded Divider Stage"],
      ac: ["Function Generator (AC)", "Timebase Capture Rig", "True-RMS Meter Stage", "RC Phase Shift Bench", "Impedance Sweep DUT"],
      capacitors: ["Charge-Store Cap Bank", "RC Energy Discharge Rig", "Bypass Decoupling Rail", "Low-ESR Tank Fixture", "Peak Hold Test Harness"],
      rc: ["Step Pulse Generator", "RC Charge Transient", "RC Decay Network", "Delay Timer Supervisor", "Bandwidth-Limit Filter"],
      inductors: ["RL Coil Driver", "Switched Relay Coil", "Back-EMF Transient Rig", "Flyback Clamp Harness", "Choke Filter Stage"],
      filters: ["Bode Sweep Generator", "AC Coupled Stage", "3dB Cutoff Fixture", "LC Tank Resonator", "Roll-Off Analyzer"],
      magnetics: ["Primary/Secondary Xfmr", "AC Magnetic Coupler", "3-Phase Line Feed", "Flyback Winding Rig", "Core Saturation Test"],
      components: ["Diode / LED Bias Rig", "NPN Transistor Driver", "Zener Clamp Stage", "MOSFET Gate Switch", "Schottky Rail Protection"],
      "power-rails": ["3.3V / 5V Buck PMIC", "Power-Good Sequencer", "Low-Side Kelvin Shunt", "LDO Transient Load", "Rail OVP Clamp Rig"],
      schematics: ["STM32 NUCLEO-L476RG", "Flight MCU GPIO Stage", "Reference Designator", "Connector Pinout Harness", "Subsystem Carrier Board"],
      instruments: ["100 MS/s Scope Rig", "200 MHz Timebase DUT", "Trigger Edge Generator", "10x Probe Tip Network", "DMM + Scope Combo"],
      timing: ["Crystal Clock Driver", "PWM Duty Generator", "Flip-Flop D/CLK Stage", "Hold-Window Path", "POR Reset Supervisor"],
      buses: ["UART TX/RX Bridge", "4-Wire SPI Bus DUT", "I2C Open-Drain Pull-Up", "CAN 120Ω Diff Pair", "Logic Protocol Harness"],
      "python-scpi": ["SCPI PSU + DMM Rack", "Automated ADC Sweeper", "Threshold Verifier", "Relay Mux Matrix", "Safe-State Abort Relay"],
      linux: ["Serial Telemetry UART", "DUT Boot Log Capture", "Exit-Code Watchdog", "Fixture Config Harness", "Raw Log Diff Setup"],
      rf: ["50Ω RF Signal Gen", "VNA S11 Reflection Port", "SMA Return-Loss Bridge", "10 dB Coax Attenuator", "Antenna Match PI-Net"],
      qualification: ["TVAC Thermal Chamber DUT", "Burn-In Margin Supply", "Guard-Band Test Rig", "Intermittent Harness", "Flight Lot Screen"]
    };
    const arr = map[topicId] || map.ohm;
    const idx = (meta.skillIdx + (meta.letter === "D" ? 2 : meta.letter === "C" ? 1 : 0)) % arr.length;
    return arr[idx];
  }

  /** Fault catalog tailored per topic/question for Troubleshooting & Exploration. */
  function buildFaultDescriptor(topicId, topo, meta, q) {
    if (topicId === "buses" && (topo === "i2c_open_drain" || meta.skillIdx === 2)) {
      return {
        label: "Weak 47 kΩ pull-up causing I2C shark-fin RC rise",
        fixLabel: "Swap to crisp 2.2 kΩ I2C pull-up",
        kind: "weak_pullup",
        faultNote: "With Rp = 47 kΩ and stray 180 pF bus capacitance, τ = 8.46 µs rounds the rising edge so SDA misses VIH before SCL rises."
      };
    }
    if (topo === "rl_flyback") {
      return {
        label: "Open flyback diode (L kickback spike on switch-off)",
        fixLabel: "Install reverse-biased flyback diode across coil",
        kind: "open_d1",
        faultNote: "Opening D1 removes the freewheeling path for inductor current; L dI/dt spikes negative across the switch."
      };
    }
    if (topo === "divider_load" || topo === "thevenin_bridge") {
      return {
        label: "Heavy low-Z ADC/load (100 Ω) loading divider node",
        fixLabel: "Disconnect heavy load / buffer divider output",
        kind: "heavy_load",
        faultNote: "A low-impedance load in parallel with R2 drags Vout far below the unloaded divider prediction."
      };
    }
    if (topo === "rf_50ohm_line") {
      return {
        label: "Mismatched 180 Ω / damaged coax load (high VSWR)",
        fixLabel: "Restore matched 50 Ω coax termination",
        kind: "rf_mismatch",
        faultNote: "ZL != 50 Ω causes partial reflection (Γ > 0.5), degraded S11 return loss, and standing-wave amplitude error."
      };
    }
    if (meta.letter === "D" && meta.num % 2 === 0) {
      return {
        label: "Cold solder joint / high-resistance open series path",
        fixLabel: "Reflow joint to restore continuity",
        kind: "open_r1",
        faultNote: "An open series branch drops downstream node voltage to 0 V while source voltage rises unloaded."
      };
    }
    if (topo === "parallel_3branch" || (meta.letter === "D" && meta.num <= 2)) {
      return {
        label: "Low-resistance rail short (~8 Ω fault) drawing excess current",
        fixLabel: "Clear short circuit on branch rail",
        kind: "short_load",
        faultNote: "A 8 Ω fault path parallels the load, spiking total supply current and sagging poorly regulated rails."
      };
    }
    return {
      label: "Open return / swapped ground clip adding distortion",
      fixLabel: "Restore solid short ground return",
      kind: "bad_gnd",
      faultNote: "A lifted or resistive return path offsets node voltage relative to earth reference."
    };
  }

  /**
   * Build deterministic, tailored CircuitSpec for any of the 690 questions.
   */
  function buildCircuitSpec(q, t, overrides) {
    const topicId = (q && q.topic) || (t && t.id) || "ohm";
    const meta = questionMeta(q || { id: "ohm-F1" });
    const ext = extractValues(q || {});
    const vPick = [3.3, 5.0, 9.0, 12.0, 15.0];
    const rPick = [330, 470, 680, 1000, 2200, 4700];
    const r2Pick = [220, 470, 1000, 1500, 3300, 10000];
    const cPick = [1e-6, 2.2e-6, 4.7e-6, 10e-6, 47e-9, 100e-9];
    const lPick = [1e-3, 2.2e-3, 4.7e-3, 10e-3, 470e-6];
    const fPick = [100, 500, 1000, 5000, 25000];

    const letterOffset = { F: 0, A: 2, C: 4, D: 5 }[meta.letter] || 0;
    const seed = (meta.skillIdx * 3 + meta.varIdx * 7 + topicId.length * 5 + letterOffset) % 6;
    let vs = ext.V[0] || vPick[(meta.varIdx + meta.skillIdx + letterOffset) % vPick.length];
    if (vs > 60) vs = 24;
    if (vs < 0.5) vs = 3.3;

    let r1 = ext.R[0] || rPick[seed];
    let r2 = ext.R[1] || r2Pick[(seed + 2 + (meta.num % 2)) % r2Pick.length];
    let r3 = ext.R[2] || rPick[(seed + 4) % rPick.length];
    let c1 = ext.C[0] || cPick[(meta.varIdx + letterOffset) % cPick.length];
    let l1 = ext.L[0] || lPick[(meta.varIdx + letterOffset) % lPick.length];
    let freq = ext.F[0] || fPick[(meta.varIdx + letterOffset) % fPick.length];
    let duty = 50;
    let vref = 2.0;

    // Preserve explicit 330 ohm / 3.3V on ohm-C1 and exact parsed targets
    if (q && q.id === "ohm-C1") {
      vs = 3.3;
      r1 = 330;
    }

    // Choose question-specific topology so adjacent F1..F5, A1..A5, C1..C10, D1..D10 diverge genuinely
    let topo = "ohmic_single";
    if (topicId === "units") {
      topo = ["ohmic_single", "divider_load", "rc_step", "series_chain", "shunt_kelvin"][meta.skillIdx % 5];
      if (meta.letter === "C") {
        topo = meta.num <= 5 ? "ohmic_single" : "rc_step";
        if (meta.num <= 5) { vs = 5.0; r1 = Math.max(10, Math.round(vs / Math.max(1e-6, q.expected || 0.008))); }
      }
    } else if (topicId === "ohm") {
      topo = ["divider_load", "ohmic_single", "series_chain", "ohmic_single", "shunt_kelvin"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = meta.num <= 5 ? "ohmic_single" : "series_chain";
      if (meta.letter === "D" && meta.skillIdx === 4) topo = "divider_load";
    } else if (topicId === "power") {
      topo = ["ohmic_single", "rc_step", "shunt_kelvin", "parallel_3branch", "zener_reg"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = meta.num <= 5 ? "ohmic_single" : "shunt_kelvin";
    } else if (topicId === "series" || topicId === "schematics") {
      topo = ["series_chain", "series_chain", "divider_load", "series_chain", "divider_load"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = meta.num <= 5 ? "series_chain" : "divider_load";
      if (topicId === "schematics" && meta.letter === "F" && meta.skillIdx === 1) topo = "diode_led";
      if (topicId === "schematics" && meta.letter === "D") topo = ["divider_load", "series_chain", "shunt_kelvin", "diode_led", "i2c_open_drain"][meta.skillIdx % 5];
    } else if (topicId === "parallel") {
      topo = "parallel_3branch";
      if (meta.skillIdx === 2) topo = "divider_load";
      if (meta.skillIdx === 4) topo = "shunt_kelvin";
    } else if (topicId === "kcl-kvl") {
      topo = ["kcl_junction", "series_chain", "divider_load", "thevenin_bridge", "parallel_3branch"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = meta.num <= 5 ? "kcl_junction" : "series_chain";
    } else if (topicId === "thevenin") {
      topo = ["divider_load", "thevenin_bridge", "divider_load", "thevenin_bridge", "kcl_junction"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = meta.num <= 5 ? "divider_load" : "thevenin_bridge";
    } else if (topicId === "ac") {
      topo = ["rc_lowpass", "rlc_band", "rc_lowpass", "rc_highpass", "rlc_band"][meta.skillIdx % 5];
      if (freq > 500000) freq = 50000;
    } else if (topicId === "capacitors") {
      topo = ["rc_step", "rc_step", "rc_lowpass", "rc_highpass", "rc_step"][meta.skillIdx % 5];
    } else if (topicId === "rc") {
      topo = ["rc_step", "rc_lowpass", "rc_step", "rc_highpass", "rc_lowpass"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = "rc_step";
    } else if (topicId === "inductors") {
      topo = ["rl_flyback", "rl_flyback", "rlc_band", "rl_flyback", "rl_flyback"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = "rl_flyback";
    } else if (topicId === "filters") {
      topo = ["rc_lowpass", "rc_highpass", "rc_lowpass", "rlc_band", "rc_lowpass"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = meta.num <= 5 ? "rc_lowpass" : "rlc_band";
      if (meta.skillIdx === 2 && !ext.F.length) freq = Math.round(1 / (2 * Math.PI * r1 * c1));
    } else if (topicId === "magnetics") {
      topo = ["rl_flyback", "rlc_band", "rc_highpass", "rl_flyback", "rlc_band"][meta.skillIdx % 5];
    } else if (topicId === "components") {
      topo = ["diode_led", "i2c_open_drain", "zener_reg", "diode_led", "zener_reg"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = meta.num <= 5 ? "diode_led" : "i2c_open_drain";
    } else if (topicId === "power-rails") {
      topo = ["divider_load", "rc_step", "shunt_kelvin", "zener_reg", "parallel_3branch"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = meta.num <= 5 ? "ohmic_single" : "shunt_kelvin";
    } else if (topicId === "instruments") {
      topo = ["rc_step", "rl_flyback", "i2c_open_drain", "divider_load", "rc_lowpass"][meta.skillIdx % 5];
      if (meta.letter === "C") topo = "i2c_open_drain";
    } else if (topicId === "timing") {
      topo = ["i2c_open_drain", "i2c_open_drain", "rc_step", "rc_step", "rc_step"][meta.skillIdx % 5];
      duty = meta.varIdx * 10 + 20;
      if (ext.T.length && q.unit === "ns") freq = Math.min(2e6, Math.round(1e9 / Math.max(500, q.expected || 1000)));
    } else if (topicId === "buses") {
      topo = ["i2c_open_drain", "rc_lowpass", "i2c_open_drain", "rf_50ohm_line", "i2c_open_drain"][meta.skillIdx % 5];
      vs = meta.letter === "A" ? 5.0 : 3.3;
      const busR = [1000, 2200, 4700, 120, 3300];
      r1 = meta.skillIdx === 3 ? (meta.num % 2 === 0 ? 120 : 60) : busR[(meta.varIdx + letterOffset) % busR.length];
      r2 = [1000, 2200, 4700, 10000][meta.varIdx % 4];
      c1 = [100e-12, 180e-12, 330e-12, 470e-12][(meta.varIdx + letterOffset) % 4];
      freq = meta.letter === "D" ? 400000 : 100000;
    } else if (topicId === "rf") {
      topo = "rf_50ohm_line";
      r1 = 50;
      const rfLoads = [50, 75, 100, 150, 25];
      r2 = rfLoads[(meta.varIdx + letterOffset + (meta.num % 2)) % rfLoads.length];
      freq = Math.min(2.4e9, Math.max(1e6, ext.F[0] || [433e6, 900e6, 1.5e9, 2.4e9, 2.0e9][(meta.varIdx + letterOffset) % 5]));
    } else if (topicId === "python-scpi" || topicId === "linux" || topicId === "qualification") {
      topo = ["shunt_kelvin", "divider_load", "rc_step", "i2c_open_drain", "zener_reg"][meta.skillIdx % 5];
    }

    // Clamp sane component ranges for real-time educational simulation
    r1 = Math.max(0.1, Math.min(100000, r1));
    r2 = Math.max(1, Math.min(100000, r2));
    r3 = Math.max(1, Math.min(100000, r3));
    c1 = Math.max(10e-12, Math.min(10e-3, c1));
    l1 = Math.max(1e-6, Math.min(1, l1));
    freq = Math.max(10, Math.min(1e7, freq));

    // Vary breadboard row offset uniquely per question within a topic so visual hole wiring never duplicates blindly
    const rowBase = 9 + ((meta.varIdx + meta.skillIdx + letterOffset + (meta.num % 2)) % 3);
    const colA = ["a", "b", "c"][(meta.skillIdx + letterOffset) % 3];
    const colB = ["f", "g", "h"][(meta.varIdx + (meta.num % 3)) % 3];

    const faultInfo = buildFaultDescriptor(topicId, topo, meta, q);
    const defaultFault = meta.letter === "D";

    const spec = {
      qId: (q && q.id) || "ohm-F1",
      topicId,
      topicTitle: (t && t.title) || "Circuit Bench",
      level: (q && q.level) || "Foundations",
      meta,
      topo,
      instrument: chooseBenchInstrument(topicId, topo, meta),
      vs,
      r1,
      r2,
      r3,
      c1,
      l1,
      freq,
      duty,
      vref,
      rowBase,
      colA,
      colB,
      powerOn: true,
      faulted: defaultFault,
      dmmMode: q && q.unit && /m?A/i.test(q.unit) ? "mA" : q && /Ω/i.test(q.unit || "") ? "OHM" : "V",
      redNode: "nOut",
      blackNode: "GND",
      faultInfo,
      expected: q ? q.expected : undefined,
      expectedUnit: q ? q.unit : undefined,
      question: q ? q.question : "",
      isIndirectHardwareTopic: topicId === "linux" || topicId === "python-scpi" || topicId === "qualification"
    };

    if (overrides) Object.assign(spec, overrides);
    return spec;
  }

  /** Gauss-Jordan linear system solver A * x = b (small MNA matrices). */
  function solveLinear(A, b) {
    const n = b.length;
    const M = A.map((row, i) => row.concat([b[i]]));
    for (let col = 0; col < n; col++) {
      let piv = col;
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
      }
      if (Math.abs(M[piv][col]) < 1e-14) continue;
      const tmp = M[col];
      M[col] = M[piv];
      M[piv] = tmp;
      const div = M[col][col];
      for (let c = col; c <= n; c++) M[col][c] /= div;
      for (let r = 0; r < n; r++) {
        if (r === col || Math.abs(M[r][col]) < 1e-15) continue;
        const f = M[r][col];
        for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
      }
    }
    return M.map((row) => (Number.isFinite(row[n]) ? row[n] : 0));
  }

  /** Stamp linear resistor network + voltage/current sources into MNA solver. */
  function runMNA(nodeNames, resistors, vsources, isources) {
    const n = nodeNames.length;
    const m = vsources.length;
    const dim = n + m;
    const idx = {};
    nodeNames.forEach((nm, i) => { idx[nm] = i; });
    const A = Array.from({ length: dim }, () => Array(dim).fill(0));
    const b = Array(dim).fill(0);

    // Gmin prevents floating-node singularity
    for (let i = 0; i < n; i++) A[i][i] += 1e-11;

    for (const [n1, n2, R] of resistors) {
      const g = 1 / Math.max(1e-4, R);
      if (n1 !== "GND" && idx[n1] != null) A[idx[n1]][idx[n1]] += g;
      if (n2 !== "GND" && idx[n2] != null) A[idx[n2]][idx[n2]] += g;
      if (n1 !== "GND" && n2 !== "GND" && idx[n1] != null && idx[n2] != null) {
        A[idx[n1]][idx[n2]] -= g;
        A[idx[n2]][idx[n1]] -= g;
      }
    }
    vsources.forEach(([np, nn, val], k) => {
      const row = n + k;
      if (np !== "GND" && idx[np] != null) { A[idx[np]][row] += 1; A[row][idx[np]] += 1; }
      if (nn !== "GND" && idx[nn] != null) { A[idx[nn]][row] -= 1; A[row][idx[nn]] -= 1; }
      b[row] = val;
    });
    for (const [np, nn, val] of (isources || [])) {
      if (np !== "GND" && idx[np] != null) b[idx[np]] += val;
      if (nn !== "GND" && idx[nn] != null) b[idx[nn]] -= val;
    }

    const sol = solveLinear(A, b);
    const volts = { GND: 0 };
    nodeNames.forEach((nm, i) => { volts[nm] = sol[i]; });
    const vSrcI = vsources.map((_, k) => -sol[n + k]);
    return { volts, vSrcI };
  }

  /**
   * Solve active CircuitSpec for DC node voltages, branch currents, AC response,
   * transient oscilloscope samples, and DMM readout.
   */
  function solveCircuit(spec) {
    const fkind = spec.faulted ? spec.faultInfo.kind : "none";
    const gndOffset = fkind === "bad_gnd" ? 0.85 : 0;
    let r1 = fkind === "open_r1" ? 1e7 : spec.r1;
    let r2 = fkind === "weak_pullup" ? 47000 : spec.r2;
    let r3 = fkind === "heavy_load" ? 100 : fkind === "short_load" ? 8 : fkind === "rf_mismatch" ? 180 : spec.r3;
    const vsActive = spec.powerOn ? spec.vs : 0;

    let nodes = ["nIn", "nOut"];
    let res = [];
    const vsources = spec.powerOn ? [["nIn", "GND", vsActive]] : [];
    const notes = [];

    if (spec.topo === "ohmic_single") {
      nodes = ["nIn", "nOut"];
      res = [["nIn", "nOut", 0.01], ["nOut", "GND", fkind === "short_load" ? 8 : r1]];
      if (spec.redNode === "nOut" && spec.blackNode === "GND" && fkind !== "open_r1") {
        res = [["nIn", "nOut", 0.01], ["nOut", "GND", r1]];
      }
      if (fkind === "open_r1") res = [["nIn", "nOut", 1e7], ["nOut", "GND", r1]];
    } else if (spec.topo === "series_chain") {
      nodes = ["nIn", "n1", "nOut"];
      res = [["nIn", "n1", r1], ["n1", "nOut", r2], ["nOut", "GND", r3]];
    } else if (spec.topo === "divider_load") {
      nodes = ["nIn", "nOut"];
      res = [["nIn", "nOut", r1], ["nOut", "GND", r2]];
      if (fkind === "heavy_load") res.push(["nOut", "GND", 100]);
      if (fkind === "short_load") res.push(["nOut", "GND", 8]);
    } else if (spec.topo === "parallel_3branch") {
      nodes = ["nIn", "nOut"];
      res = [["nIn", "nOut", 0.02], ["nOut", "GND", r1], ["nOut", "GND", r2], ["nOut", "GND", r3]];
      if (fkind === "short_load") res.push(["nOut", "GND", 8]);
    } else if (spec.topo === "kcl_junction") {
      nodes = ["nIn", "n2", "nOut"];
      if (spec.powerOn) vsources.push(["n2", "GND", +(spec.vs * 0.65).toFixed(2)]);
      res = [["nIn", "nOut", r1], ["n2", "nOut", r2], ["nOut", "GND", r3]];
    } else if (spec.topo === "thevenin_bridge") {
      nodes = ["nIn", "nTh", "nOut"];
      res = [["nIn", "nTh", r1], ["nTh", "GND", r2], ["nTh", "nOut", 47], ["nOut", "GND", fkind === "heavy_load" ? 100 : r3]];
    } else if (spec.topo === "shunt_kelvin") {
      nodes = ["nIn", "nOut"];
      const rShunt = fkind === "bad_gnd" ? 4.5 : 1.0;
      res = [["nIn", "nOut", r1], ["nOut", "GND", rShunt]];
      notes.push("Shunt Rs = " + fmtEng(rShunt, "Ω"));
    } else if (spec.topo === "rc_step" || spec.topo === "rc_lowpass") {
      nodes = ["nIn", "nOut"];
      const rp = spec.topo === "rc_step" && fkind === "weak_pullup" ? 47000 : r1;
      res = [["nIn", "nOut", rp], ["nOut", "GND", 1e6]];
    } else if (spec.topo === "rc_highpass") {
      nodes = ["nIn", "nOut"];
      res = [["nIn", "nOut", 1e6], ["nOut", "GND", r1]];
    } else if (spec.topo === "rl_flyback") {
      nodes = ["nIn", "nOut"];
      res = [["nIn", "nOut", r1], ["nOut", "GND", 12]];
    } else if (spec.topo === "rlc_band") {
      nodes = ["nIn", "nMid", "nOut"];
      res = [["nIn", "nMid", r1], ["nMid", "nOut", 4], ["nOut", "GND", 1e6]];
    } else if (spec.topo === "diode_led") {
      nodes = ["nIn", "nOut"];
      const vf = fkind === "open_r1" ? 100 : 2.0;
      res = [["nIn", "nOut", r1], ["nOut", "GND", 40]];
      if (spec.powerOn && vsActive > vf && fkind !== "open_r1") {
        // Approximate conducted diode drop clamp across load
        const iLed = (vsActive - vf) / (r1 + 15);
        res = [["nIn", "nOut", r1], ["nOut", "GND", Math.max(5, vf / Math.max(1e-4, iLed))]];
      }
    } else if (spec.topo === "zener_reg") {
      nodes = ["nIn", "nOut"];
      const vz = 3.3;
      res = [["nIn", "nOut", r1], ["nOut", "GND", r2]];
      if (spec.powerOn && vsActive > vz + 0.5 && fkind !== "open_r1") {
        const iz = Math.max(0.001, (vsActive - vz) / r1);
        res = [["nIn", "nOut", r1], ["nOut", "GND", vz / iz]];
      }
    } else if (spec.topo === "i2c_open_drain") {
      nodes = ["nIn", "nOut"];
      const rp = fkind === "weak_pullup" ? 47000 : r1;
      res = [["nIn", "nOut", rp], ["nOut", "GND", fkind === "short_load" ? 2 : 1e6]];
    } else if (spec.topo === "rf_50ohm_line") {
      nodes = ["nIn", "nOut"];
      const zLoad = fkind === "rf_mismatch" ? 180 : spec.r2;
      res = [["nIn", "nOut", 50], ["nOut", "GND", zLoad]];
    }

    const dc = runMNA(nodes, res, vsources, []);
    if (gndOffset !== 0) {
      nodes.forEach((nm) => { if (nm !== "nIn") dc.volts[nm] += gndOffset; });
    }
    const totalI = dc.vSrcI[0] || 0;
    const totalP = Math.abs(vsActive * totalI);

    // Ohmmeter measurement (safe only when power is OFF; excludes independent sources)
    let rMeas = 0;
    if (!spec.powerOn) {
      const rRed = spec.redNode === "nIn" || spec.redNode === "GND" ? spec.redNode : "nOut";
      const rBlk = spec.blackNode === "GND" || spec.blackNode === "nIn" ? spec.blackNode : "nOut";
      if (rRed === rBlk) {
        rMeas = 0;
      } else {
        const ohmRes = res.filter((row) => Math.max(row[2]) < 1e8);
        const testMna = runMNA(nodes, ohmRes, [], [[rRed, rBlk, 1.0]]);
        rMeas = Math.abs((testMna.volts[rRed] || 0) - (testMna.volts[rBlk] || 0));
      }
    }

    // AC / Time-domain waveforms (160 samples)
    const ch1 = [];
    const ch2 = [];
    const omega = 2 * Math.PI * spec.freq;
    const tauRC = r1 * spec.c1;
    const tauRL = spec.l1 / Math.max(1, r1);
    const fc = spec.topo === "rc_highpass" || spec.topo === "rc_lowpass"
      ? 1 / (2 * Math.PI * r1 * spec.c1)
      : spec.topo === "rlc_band"
        ? 1 / (2 * Math.PI * Math.sqrt(spec.l1 * spec.c1))
        : 1 / (2 * Math.PI * r1 * spec.c1);

    let gain = 1;
    let phaseDeg = 0;
    let acMetricLabel = "";

    if (spec.topo === "rc_lowpass") {
      const rcW = omega * r1 * spec.c1;
      gain = 1 / Math.sqrt(1 + rcW * rcW);
      phaseDeg = (-Math.atan(rcW) * 180) / Math.PI;
      acMetricLabel = "fc = " + fmtEng(fc, "Hz") + " | Gain = " + (20 * Math.log10(Math.max(1e-5, gain))).toFixed(2) + " dB | φ = " + phaseDeg.toFixed(1) + "°";
    } else if (spec.topo === "rc_highpass") {
      const rcW = omega * r1 * spec.c1;
      gain = rcW / Math.sqrt(1 + rcW * rcW);
      phaseDeg = (Math.atan(1 / Math.max(1e-9, rcW)) * 180) / Math.PI;
      acMetricLabel = "fc = " + fmtEng(fc, "Hz") + " | Gain = " + (20 * Math.log10(Math.max(1e-5, gain))).toFixed(2) + " dB | φ = +" + phaseDeg.toFixed(1) + "°";
    } else if (spec.topo === "rlc_band") {
      const xl = omega * spec.l1;
      const xc = 1 / Math.max(1e-12, omega * spec.c1);
      const z = Math.sqrt(r1 * r1 + (xl - xc) * (xl - xc));
      gain = r1 / Math.max(0.01, z);
      phaseDeg = (-Math.atan2(xl - xc, r1) * 180) / Math.PI;
      acMetricLabel = "f0 = " + fmtEng(fc, "Hz") + " | |Z| = " + fmtEng(z, "Ω") + " | Gain = " + (20 * Math.log10(Math.max(1e-5, gain))).toFixed(2) + " dB";
    } else if (spec.topo === "rf_50ohm_line") {
      const zl = fkind === "rf_mismatch" ? 180 : spec.r2;
      const gamma = Math.abs((zl - 50) / (zl + 50));
      const vswr = (1 + gamma) / Math.max(0.01, 1 - gamma);
      const rlDb = gamma > 1e-4 ? -20 * Math.log10(gamma) : 45;
      gain = 1 - gamma * 0.5;
      acMetricLabel = "λ = " + fmtEng(3e8 / spec.freq, "m") + " | VSWR = " + vswr.toFixed(2) + ":1 | RL = " + rlDb.toFixed(1) + " dB";
    } else if (spec.topo === "rc_step" || spec.topo === "i2c_open_drain") {
      acMetricLabel = "τ = " + fmtEng(tauRC, "s") + " (63.2% V at 1τ, 99.3% at 5τ)";
    } else if (spec.topo === "rl_flyback") {
      acMetricLabel = "τ = L/R = " + fmtEng(tauRL, "s") + (fkind === "open_d1" ? " · ⚠ INDUCTIVE KICK!" : " · Flyback clamped");
    } else {
      acMetricLabel = "DC Steadystate · Vout = " + (dc.volts.nOut || 0).toFixed(3) + " V · I_tot = " + fmtEng(totalI, "A");
    }

    const N = 160;
    const isAcWave = spec.topo === "rc_lowpass" || spec.topo === "rc_highpass" || spec.topo === "rlc_band" || spec.topo === "rf_50ohm_line";
    const tTotal = isAcWave
      ? 2 / spec.freq
      : spec.topo === "i2c_open_drain"
        ? 4e-5
        : spec.topo === "rl_flyback"
          ? Math.max(1e-4, 5 * tauRL)
          : Math.max(1e-4, 5 * tauRC);

    for (let i = 0; i < N; i++) {
      const frac = i / (N - 1);
      const tNow = frac * tTotal;
      if (!spec.powerOn) {
        ch1.push(0);
        ch2.push(0);
        continue;
      }
      if (isAcWave) {
        const w = 2 * Math.PI * 2 * frac; // 2 cycles displayed
        const v1 = vsActive * Math.sin(w);
        const rad = (phaseDeg * Math.PI) / 180;
        const v2 = (fkind === "open_r1" ? 0 : vsActive * gain * Math.sin(w + rad)) + gndOffset;
        ch1.push(v1);
        ch2.push(v2);
      } else if (spec.topo === "rc_step") {
        const vStep = vsActive;
        const tTau = (tTotal * frac) / Math.max(1e-9, tauRC);
        const vCap = fkind === "open_r1" ? 0 : vStep * (1 - Math.exp(-tTau)) + gndOffset;
        ch1.push(vStep);
        ch2.push(vCap);
      } else if (spec.topo === "rl_flyback") {
        const half = frac < 0.55;
        const vDrive = half ? vsActive : 0;
        let vOut;
        if (half) {
          vOut = vsActive * Math.exp(-(tNow / Math.max(1e-9, tauRL)));
        } else if (fkind === "open_d1") {
          const dt = frac - 0.55;
          vOut = -vsActive * 2.4 * Math.exp(-dt * 28);
        } else {
          vOut = -0.7 * Math.exp(-(frac - 0.55) * 18);
        }
        ch1.push(vDrive);
        ch2.push(vOut);
      } else if (spec.topo === "i2c_open_drain") {
        // Low until 0.25 then pull-up rise (2.2k clean vs 47k shark-fin)
        const riseTau = (fkind === "weak_pullup" ? 47000 : r1) * 180e-12;
        const vClk = frac > 0.45 && frac < 0.85 ? vsActive : 0;
        let vSda = 0;
        if (frac >= 0.2 && frac < 0.72) {
          const dt = (frac - 0.2) * tTotal;
          vSda = fkind === "short_load" ? 0.1 : vsActive * (1 - Math.exp(-dt / Math.max(1e-9, riseTau)));
        }
        ch1.push(vClk);
        ch2.push(vSda);
      } else {
        // DC rail with minor realistic ripple/load transient
        const target = dc.volts[spec.redNode] != null ? dc.volts[spec.redNode] : (dc.volts.nOut || 0);
        const dropStep = frac > 0.5 ? target : target * 1.02;
        const ripple = (fkind === "bad_gnd" ? 0.32 : 0.04) * Math.sin(frac * 24);
        ch1.push(vsActive);
        ch2.push(dropStep + ripple);
      }
    }

    // Primary DMM computation between redNode and blackNode
    let dmmText = "0.000 V";
    let dmmWarn = false;
    let dmmValue = 0;
    const vRed = dc.volts[spec.redNode] != null ? dc.volts[spec.redNode] : (dc.volts.nOut || 0);
    const vBlk = dc.volts[spec.blackNode] != null ? dc.volts[spec.blackNode] : 0;
    const vDiff = vRed - vBlk;

    if (spec.dmmMode === "OHM") {
      if (spec.powerOn) {
        dmmText = "⚠ TURN POWER OFF";
        dmmWarn = true;
      } else {
        dmmValue = rMeas;
        dmmText = fmtEng(rMeas, "Ω");
      }
    } else if (spec.dmmMode === "mA") {
      dmmValue = totalI;
      dmmText = spec.powerOn ? fmtEng(totalI, "A") : "0.00 mA";
    } else {
      dmmValue = isAcWave && spec.powerOn ? (Math.abs(vsActive) * gain) / Math.SQRT2 : vDiff;
      dmmText = isAcWave && spec.powerOn
        ? dmmValue.toFixed(3) + " Vrms"
        : (vDiff >= 0 ? "+" : "") + vDiff.toFixed(3) + " V";
    }

    return {
      volts: dc.volts,
      totalI,
      totalP,
      rMeas,
      fc,
      tau: spec.topo === "rl_flyback" ? tauRL : tauRC,
      gain,
      phaseDeg,
      acMetricLabel,
      ch1,
      ch2,
      tTotal,
      dmmText,
      dmmWarn,
      dmmValue,
      effR1: r1,
      effR2: r2,
      effR3: r3
    };
  }

  /**
   * Export live CircuitSpec to valid Falstad CircuitJS1 netlist string (`$ 1 ...`).
   */
  function toFalstadNetlist(spec) {
    const fkind = spec.faulted ? spec.faultInfo.kind : "none";
    const vs = spec.powerOn ? spec.vs : 0;
    const r1 = (fkind === "open_r1" ? 1e7 : spec.r1).toFixed(2);
    const r2 = (fkind === "weak_pullup" ? 47000 : spec.r2).toFixed(2);
    const r3 = (fkind === "heavy_load" ? 100 : fkind === "short_load" ? 8 : fkind === "rf_mismatch" ? 180 : spec.r3).toFixed(2);
    const lines = ["$ 1 5.0E-6 10.2 50 5.0 50"];
    const title = (spec.qId + " " + spec.topo.replace(/_/g, " ")).toUpperCase();

    if (spec.topo === "divider_load" || spec.topo === "thevenin_bridge") {
      lines.push(`v 128 288 128 96 0 0 40 ${vs} 0 0 0.5`);
      lines.push("w 128 96 272 96 0");
      lines.push(`r 272 96 272 192 0 ${r1}`);
      lines.push(`r 272 192 272 288 0 ${r2}`);
      if (spec.topo === "thevenin_bridge" || fkind === "heavy_load" || fkind === "short_load") {
        lines.push("w 272 192 384 192 0");
        lines.push(`r 384 192 384 288 0 ${r3}`);
        lines.push("w 272 288 384 288 0");
      }
      lines.push("w 128 288 272 288 0");
      lines.push("g 272 288 272 320 0");
      lines.push("O 272 192 336 192 1");
      lines.push(`x 128 56 320 56 4 14 ${title}`);
    } else if (spec.topo === "series_chain") {
      lines.push(`v 112 288 112 96 0 0 40 ${vs} 0 0 0.5`);
      lines.push(`r 112 96 240 96 0 ${r1}`);
      lines.push(`r 240 96 368 96 0 ${r2}`);
      lines.push(`r 368 96 368 288 0 ${r3}`);
      lines.push("w 112 288 368 288 0");
      lines.push("g 112 288 112 320 0");
      lines.push("O 240 96 240 48 1");
      lines.push("O 368 96 416 96 1");
      lines.push(`x 112 44 300 44 4 14 ${title}`);
    } else if (spec.topo === "parallel_3branch" || spec.topo === "kcl_junction") {
      lines.push(`v 112 288 112 96 0 0 40 ${vs} 0 0 0.5`);
      lines.push("w 112 96 224 96 0");
      lines.push("w 224 96 336 96 0");
      lines.push("w 336 96 448 96 0");
      lines.push(`r 224 96 224 288 0 ${r1}`);
      lines.push(`r 336 96 336 288 0 ${r2}`);
      lines.push(`r 448 96 448 288 0 ${r3}`);
      lines.push("w 112 288 448 288 0");
      lines.push("g 112 288 112 320 0");
      lines.push("o 4 64 0 4099 5 0.05 0 2 4 3");
      lines.push(`x 112 56 300 56 4 14 ${title}`);
    } else if (spec.topo === "rc_step" || spec.topo === "rc_lowpass") {
      const isSquare = spec.topo === "rc_step";
      const wf = isSquare ? 2 : 1;
      const fq = isSquare ? Math.max(50, Math.min(5000, Math.round(1 / Math.max(1e-4, 5 * spec.r1 * spec.c1)))) : spec.freq;
      lines.push(`v 128 288 128 112 0 ${wf} ${fq} ${vs} 0 0 0.5`);
      lines.push(`r 128 112 304 112 0 ${r1}`);
      lines.push(`c 304 112 304 288 0 ${spec.c1} 0`);
      lines.push("w 128 288 304 288 0");
      lines.push("g 304 288 304 320 0");
      lines.push("O 304 112 384 112 1");
      lines.push("o 2 64 0 4099 10 0.05 0 2 2 3");
      lines.push(`x 128 64 320 64 4 14 ${title}`);
    } else if (spec.topo === "rc_highpass") {
      lines.push(`v 128 288 128 112 0 1 ${spec.freq} ${vs} 0 0 0.5`);
      lines.push(`c 128 112 304 112 0 ${spec.c1} 0`);
      lines.push(`r 304 112 304 288 0 ${r1}`);
      lines.push("w 128 288 304 288 0");
      lines.push("g 304 288 304 320 0");
      lines.push("O 304 112 384 112 1");
      lines.push("o 2 64 0 4099 10 0.05 0 2 2 3");
      lines.push(`x 128 64 320 64 4 14 ${title}`);
    } else if (spec.topo === "rl_flyback") {
      lines.push(`v 128 288 128 112 0 2 200 ${vs} 0 0 0.5`);
      lines.push(`r 128 112 288 112 0 ${r1}`);
      lines.push(`l 288 112 288 288 0 ${spec.l1} 0`);
      if (fkind !== "open_d1") {
        lines.push("d 368 288 368 112 2 default");
        lines.push("w 288 112 368 112 0");
        lines.push("w 288 288 368 288 0");
      }
      lines.push("w 128 288 288 288 0");
      lines.push("g 288 288 288 320 0");
      lines.push("o 2 64 0 4099 20 0.05 0 2 2 3");
      lines.push(`x 128 64 320 64 4 14 ${title}`);
    } else if (spec.topo === "rlc_band") {
      lines.push(`v 112 288 112 112 0 1 ${spec.freq} ${vs} 0 0 0.5`);
      lines.push(`r 112 112 224 112 0 ${r1}`);
      lines.push(`l 224 112 336 112 0 ${spec.l1} 0`);
      lines.push(`c 336 112 336 288 0 ${spec.c1} 0`);
      lines.push("w 112 288 336 288 0");
      lines.push("g 336 288 336 320 0");
      lines.push("o 3 64 0 4099 10 0.05 0 2 3 3");
      lines.push(`x 112 64 300 64 4 14 ${title}`);
    } else if (spec.topo === "diode_led" || spec.topo === "zener_reg") {
      lines.push(`v 128 288 128 112 0 0 40 ${vs} 0 0 0.5`);
      lines.push(`r 128 112 288 112 0 ${r1}`);
      lines.push("d 288 112 288 288 2 default");
      lines.push("w 288 112 384 112 0");
      lines.push(`r 384 112 384 288 0 ${r2}`);
      lines.push("w 128 288 384 288 0");
      lines.push("g 288 288 288 320 0");
      lines.push("O 288 112 336 80 1");
      lines.push(`x 128 64 320 64 4 14 ${title}`);
    } else if (spec.topo === "i2c_open_drain") {
      const rp = fkind === "weak_pullup" ? 47000 : spec.r1;
      lines.push(`v 128 288 128 96 0 0 40 ${vs} 0 0 0.5`);
      lines.push(`r 128 96 288 96 0 ${rp}`);
      lines.push(`c 288 96 288 288 0 ${Math.max(1e-9, spec.c1)} 0`);
      lines.push("s 368 96 368 288 0 1 false");
      lines.push("w 288 96 368 96 0");
      lines.push("w 128 288 368 288 0");
      lines.push("g 288 288 288 320 0");
      lines.push("O 288 96 320 64 1");
      lines.push("o 2 64 0 4099 5 0.05 0 2 2 3");
      lines.push(`x 128 56 320 56 4 14 ${title}`);
    } else {
      // ohmic_single, shunt_kelvin, rf_50ohm_line
      const loadR = spec.topo === "rf_50ohm_line" ? r3 : r1;
      lines.push(`v 128 272 128 112 0 0 40 ${vs} 0 0 0.5`);
      if (spec.topo === "rf_50ohm_line" || spec.topo === "shunt_kelvin") {
        lines.push(`r 128 112 272 112 0 ${spec.topo === "rf_50ohm_line" ? 50 : loadR}`);
        lines.push(`r 272 112 272 272 0 ${spec.topo === "rf_50ohm_line" ? (fkind === "rf_mismatch" ? 180 : spec.r2) : 1}`);
      } else {
        lines.push("w 128 112 272 112 0");
        lines.push(`r 272 112 272 272 0 ${loadR}`);
      }
      lines.push("w 128 272 272 272 0");
      lines.push("g 272 272 272 304 0");
      lines.push("O 272 112 336 112 1");
      lines.push(`x 128 64 320 64 4 14 ${title}`);
    }
    return lines.join("\n") + "\n";
  }

  function toFalstadUrl(spec) {
    const cct = encodeURIComponent(toFalstadNetlist(spec));
    return "https://www.falstad.com/circuit/circuitjs.html?cct=" + cct +
      "&usResistors=true&conventionalCurrent=true&whiteBackground=true&running=true";
  }

  /**
   * Generate crisp pure inline SVG (860 x 460) for `VIS.render(q, t, "wiring")` so every
   * question renders its own tailored 3-panel board + breadboard + textbook schematic.
   */
  function renderThreePanelSvg(q, t) {
    const spec = buildCircuitSpec(q, t);
    const sol = solveCircuit(spec);
    const rb = spec.rowBase;
    const cols = { a: 492, b: 516, c: 540, d: 564, e: 588, f: 628, g: 652, h: 676, i: 700, j: 724 };
    const rowY = (r) => 128 + (r - 9) * 22;

    const rBox = (x, y, w, h, fill, stroke, rx, sw) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx || 0}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw || 1}"` : ""}/>`;
    const ln = (x1, y1, x2, y2, stroke, sw) =>
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw || 2}" stroke-linecap="round"/>`;
    const pth = (d, stroke, sw, fill) =>
      `<path d="${d}" stroke="${stroke}" stroke-width="${sw || 2}" fill="${fill || "none"}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const circ = (cx, cy, r, fill, stroke, sw) =>
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw || 1.2}"` : ""}/>`;
    const txt = (x, y, val, opts) => {
      const o = opts || {};
      return `<text x="${x}" y="${y}" font-size="${o.size || 11}" font-weight="${o.weight || "500"}" fill="${o.fill || "#0f172a"}" text-anchor="${o.anchor || "start"}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif">${esc(val)}</text>`;
    };
    const zigH = (x1, x2, y, lbl, col) => {
      const n = 6, dx = (x2 - x1) / n;
      let d = `M ${x1} ${y}`;
      for (let i = 0; i < n; i++) d += ` L ${x1 + (i + 0.5) * dx} ${y + (i % 2 === 0 ? -6 : 6)}`;
      d += ` L ${x2} ${y}`;
      return pth(d, col || "#0f172a", 2) + txt((x1 + x2) / 2, y - 10, lbl, { size: 10, weight: "700", fill: col || "#0f172a", anchor: "middle" });
    };
    const zigV = (x, y1, y2, lbl, col) => {
      const n = 6, dy = (y2 - y1) / n;
      let d = `M ${x} ${y1}`;
      for (let i = 0; i < n; i++) d += ` L ${x + (i % 2 === 0 ? -6 : 6)} ${y1 + (i + 0.5) * dy}`;
      d += ` L ${x} ${y2}`;
      return pth(d, col || "#0f172a", 2) + txt(x + 11, (y1 + y2) / 2 + 3, lbl, { size: 10, weight: "700", fill: col || "#0f172a" });
    };
    const capV = (x, y1, y2, lbl) => {
      const my = (y1 + y2) / 2;
      return ln(x, y1, x, my - 4, "#0f172a", 2) +
        ln(x - 11, my - 4, x + 11, my - 4, "#1d4ed8", 2.8) +
        ln(x - 11, my + 4, x + 11, my + 4, "#1d4ed8", 2.8) +
        ln(x, my + 4, x, y2, "#0f172a", 2) +
        txt(x + 15, my + 4, lbl, { size: 10, weight: "700", fill: "#1e3a8a" });
    };
    const indV = (x, y1, y2, lbl) => {
      const my = (y1 + y2) / 2;
      let d = `M ${x} ${y1} L ${x} ${my - 14}`;
      for (let i = 0; i < 4; i++) d += ` A 4 3.5 0 0 1 ${x} ${my - 14 + (i + 1) * 7}`;
      d += ` L ${x} ${y2}`;
      return pth(d, "#0f172a", 2) + txt(x + 12, my + 3, lbl, { size: 10, weight: "700", fill: "#0f172a" });
    };
    const battSym = (x, y1, y2, lbl) => {
      const my = (y1 + y2) / 2;
      return ln(x, y1, x, my - 7, "#0f172a", 2) +
        ln(x - 12, my - 7, x + 12, my - 7, "#0f172a", 2.8) +
        ln(x - 7, my - 1, x + 7, my - 1, "#0f172a", 2) +
        ln(x - 12, my + 5, x + 12, my + 5, "#0f172a", 2.8) +
        ln(x, my + 5, x, y2, "#0f172a", 2) +
        txt(x - 15, my + 3, lbl, { size: 10.5, weight: "700", fill: "#0f172a", anchor: "end" });
    };
    const gndSym = (x, y) =>
      ln(x, y, x, y + 6, "#0f172a", 2) +
      ln(x - 10, y + 6, x + 10, y + 6, "#0f172a", 2.2) +
      ln(x - 6, y + 10, x + 6, y + 10, "#0f172a", 2) +
      ln(x - 2, y + 14, x + 2, y + 14, "#0f172a", 1.8);

    const r1Lbl = fmtEng(spec.r1, "Ω");
    const r2Lbl = fmtEng(spec.r2, "Ω");
    const c1Lbl = fmtEng(spec.c1, "F");
    const l1Lbl = fmtEng(spec.l1, "H");
    const vsLbl = spec.vs.toFixed(spec.vs % 1 === 0 ? 0 : 1) + " V";
    const iLbl = fmtEng(sol.totalI, "A");
    const vOutLbl = (sol.volts.nOut || 0).toFixed(2) + " V";

    let body = "";
    body += rBox(4, 4, 852, 452, "#f8fafc", "#cbd5e1", 14, 1);
    const headline = spec.qId.toUpperCase() + " · " + spec.instrument + " + Breadboard Setup";
    const subline = spec.faulted
      ? "FAULT ACTIVE: " + spec.faultInfo.label
      : "HEALTHY BENCH: Vs=" + vsLbl + " · Vout=" + vOutLbl + " · I=" + iLbl;
    body += txt(24, 32, headline, { size: 15, weight: "700", fill: "#0f172a" });
    body += txt(24, 51, subline, { size: 11.5, weight: "600", fill: spec.faulted ? "#b45309" : "#1d4ed8" });

    // Panel 1: Instrument / Avionics DUT Board
    body += rBox(22, 64, 290, 264, "#ffffff", "#d7dfef", 12, 1);
    body += txt(38, 84, "1 " + spec.instrument.toUpperCase(), { size: 11.5, weight: "700", fill: "#0f172a" });
    body += txt(38, 99, "Question-specific stimulus & probe return", { size: 10, fill: "#64748b" });
    body += rBox(38, 110, 258, 204, "#f1f5f9", "#94a3b8", 10, 1);
    body += rBox(50, 124, 42, 174, "#0f172a", "#334155", 6, 1);
    const pins = [
      ["PWR+", "#dc2626", vsLbl],
      ["SIG_A", "#2563eb", spec.topo.includes("rf") ? "50Ω RF" : "NODE A"],
      ["TP_OUT", "#059669", vOutLbl],
      ["SENSE", "#7c3aed", iLbl],
      ["GND", "#0f172a", "0.00 V"]
    ];
    pins.forEach((p, idx) => {
      const py = 144 + idx * 33;
      body += circ(71, py, 6, p[1], "#ffffff", 1.5);
      body += txt(100, py + 4, p[0] + ": " + p[2], { size: 10.5, weight: "700", fill: "#0f172a" });
    });
    // Exit terminals along right edge of Panel 1 card so jumper wires never cross label text
    body += circ(296, 144, 4.5, "#dc2626", "#ffffff", 1.2);
    body += circ(296, 210, 4.5, "#2563eb", "#ffffff", 1.2);
    body += circ(296, 276, 4.5, "#0f172a", "#ffffff", 1.2);
    body += rBox(200, 128, 84, 48, "#1e293b", "#475569", 6, 1);
    body += txt(242, 149, spec.qId.toUpperCase(), { size: 10.5, weight: "700", fill: "#38bdf8", anchor: "middle" });
    body += txt(242, 165, spec.topo.slice(0, 11).toUpperCase(), { size: 9, weight: "600", fill: "#cbd5e1", anchor: "middle" });
    body += rBox(200, 188, 84, 100, spec.faulted ? "#fef3c7" : "#ecfdf5", spec.faulted ? "#f59e0b" : "#10b981", 6, 1);
    body += txt(242, 209, spec.faulted ? "FAULT CASE" : "DMM LIVE", { size: 10, weight: "700", fill: spec.faulted ? "#92400e" : "#065f46", anchor: "middle" });
    body += txt(242, 232, vOutLbl, { size: 12.5, weight: "700", fill: "#0f172a", anchor: "middle" });
    body += txt(242, 252, iLbl, { size: 11, weight: "600", fill: "#334155", anchor: "middle" });
    body += txt(242, 273, "P=" + fmtEng(sol.totalP, "W"), { size: 9.5, fill: "#475569", anchor: "middle" });

    // Panel 2: Solderless Breadboard (Tailored Rows & Components)
    body += rBox(424, 64, 414, 264, "#ffffff", "#d7dfef", 12, 1);
    body += txt(440, 84, "2 Solderless breadboard (a-e | f-j, rows 9-17)", { size: 11.5, weight: "700", fill: "#0f172a" });
    body += txt(440, 99, "Components wired rows " + rb + "-" + (rb + 5) + " for " + spec.qId, { size: 10, fill: "#64748b" });
    body += rBox(440, 108, 382, 204, "#f3efe6", "#cbd5e1", 10, 1);
    body += rBox(604, 114, 12, 192, "#e2e8f0", null, 4, 0);

    const rTop = rb, rMid = rb + 3, rGnd = rb + 5;
    [rTop, rMid, rGnd].forEach((r, idx) => {
      const y = rowY(r);
      const fill = idx === 0 ? "#fee2e2" : idx === 1 ? "#dbeafe" : "#e2e8f0";
      body += rBox(482, y - 9, 114, 18, fill, "#94a3b8", 6, 0.7);
      body += rBox(620, y - 9, 114, 18, fill, "#94a3b8", 6, 0.7);
    });

    Object.keys(cols).forEach((c) => {
      body += txt(cols[c], 120, c, { size: 9.5, weight: "700", fill: "#475569", anchor: "middle" });
    });
    for (let r = 9; r <= 17; r++) {
      const y = rowY(r);
      body += txt(458, y + 3, String(r), { size: 9.5, weight: "700", fill: "#475569", anchor: "end" });
      Object.values(cols).forEach((x) => { body += circ(x, y, 2.7, "#334155"); });
    }

    const c1X = cols[spec.colA];
    const bands1 = resistorBands(spec.r1);
    body += ln(c1X, rowY(rTop), c1X, rowY(rMid), "#475569", 2.2);
    body += rBox(c1X - 9, (rowY(rTop) + rowY(rMid)) / 2 - 19, 18, 38, "#dfc598", "#78350f", 5, 1);
    bands1.forEach((bc, bi) => {
      body += rBox(c1X - 8, (rowY(rTop) + rowY(rMid)) / 2 - 13 + bi * 7.5, 16, 4, bc, null, 1, 0);
    });

    const c2X = cols[spec.colB];
    const isCap = spec.topo === "rc_step" || spec.topo === "rc_lowpass" || spec.topo === "rc_highpass" || spec.topo === "rlc_band" || spec.topo === "i2c_open_drain";
    const isInd = spec.topo === "rl_flyback" || spec.topo === "rlc_band";
    const isParallel = spec.topo === "parallel_3branch" || spec.topo === "kcl_junction";
    const isDiode = spec.topo === "diode_led" || spec.topo === "zener_reg";
    body += ln(cols.e, rowY(rMid), cols.f, rowY(rMid), "#7c3aed", 2.4);

    if (isParallel) {
      const brCols = [cols.f, cols.h, cols.j];
      const brRs = [spec.r1, spec.r2, spec.r3];
      brCols.forEach((bx, bi) => {
        const bands = resistorBands(brRs[bi]);
        body += ln(bx, rowY(rTop), bx, rowY(rMid), "#475569", 2);
        body += rBox(bx - 7, (rowY(rTop) + rowY(rMid)) / 2 - 14, 14, 28, "#dfc598", "#78350f", 4, 1);
        bands.forEach((bc, k) => { body += rBox(bx - 6, (rowY(rTop) + rowY(rMid)) / 2 - 9 + k * 5.5, 12, 2.8, bc, null, 1, 0); });
      });
      body += ln(cols.f, rowY(rTop), cols.j, rowY(rTop), "#dc2626", 2.2);
      body += ln(cols.f, rowY(rMid), cols.j, rowY(rMid), "#0f172a", 2.2);
    } else if (isDiode) {
      const my = (rowY(rMid) + rowY(rGnd)) / 2;
      body += ln(c2X, rowY(rMid), c2X, rowY(rGnd), "#475569", 2.2);
      body += pth(`M ${c2X - 8} ${my - 7} L ${c2X + 8} ${my - 7} L ${c2X} ${my + 7} Z`, "#ef4444", 1.5, "#fca5a5");
      body += ln(c2X - 9, my + 7, c2X + 9, my + 7, "#0f172a", 2.4);
      body += txt(c2X + 12, my + 3, spec.topo === "zener_reg" ? "Z3.3V" : "LED", { size: 9, weight: "700", fill: "#991b1b" });
    } else if (isCap) {
      const my = (rowY(rMid) + rowY(rGnd)) / 2;
      body += ln(c2X, rowY(rMid), c2X, rowY(rGnd), "#475569", 2.2);
      body += rBox(c2X - 10, my - 10, 20, 20, "#2563eb", "#1e3a8a", 4, 1);
      body += txt(c2X + 13, my + 3, c1Lbl, { size: 9, weight: "700", fill: "#1e3a8a" });
      if (isInd) {
        body += rBox(cols.i - 9, (rowY(rTop) + rowY(rMid)) / 2 - 10, 18, 20, "#475569", "#0f172a", 5, 1);
        body += txt(cols.i + 12, (rowY(rTop) + rowY(rMid)) / 2 + 3, "L1", { size: 9, weight: "700", fill: "#0f172a" });
      }
    } else if (isInd) {
      const my = (rowY(rMid) + rowY(rGnd)) / 2;
      body += ln(c2X, rowY(rMid), c2X, rowY(rGnd), "#475569", 2.2);
      body += rBox(c2X - 10, my - 12, 20, 24, "#475569", "#0f172a", 6, 1);
      body += txt(c2X + 13, my + 3, l1Lbl, { size: 9, weight: "700", fill: "#0f172a" });
    } else {
      const my = (rowY(rMid) + rowY(rGnd)) / 2;
      const bands2 = resistorBands(spec.r2);
      body += ln(c2X, rowY(rMid), c2X, rowY(rGnd), "#475569", 2.2);
      body += rBox(c2X - 8, my - 15, 16, 30, "#dfc598", "#78350f", 5, 1);
      bands2.forEach((bc, bi) => { body += rBox(c2X - 7, my - 10 + bi * 6, 14, 3, bc, null, 1, 0); });
    }

    // Jumper wires Panel 1 -> Breadboard (routed cleanly from right edge terminal blocks)
    body += pth(`M 296 144 C 356 144, 376 ${rowY(rTop)}, ${cols.d} ${rowY(rTop)}`, "#dc2626", 3, "none");
    body += circ(cols.d, rowY(rTop), 4.5, "#dc2626");
    body += txt(358, rowY(rTop) - 7, "PWR+ -> d" + rTop, { size: 9.5, weight: "700", fill: "#dc2626", anchor: "middle" });

    const midTargetX = c1X === cols.b ? cols.d : cols.b;
    body += pth(`M 296 210 C 356 210, 376 ${rowY(rMid)}, ${midTargetX} ${rowY(rMid)}`, "#2563eb", 2.8, "none");
    body += circ(midTargetX, rowY(rMid), 4, "#2563eb");
    body += txt(358, rowY(rMid) - 7, "TP -> " + rMid, { size: 9.5, weight: "700", fill: "#2563eb", anchor: "middle" });

    body += pth(`M 296 276 C 356 276, 376 ${rowY(rGnd)}, ${cols.g} ${rowY(rGnd)}`, "#0f172a", 3, "none");
    body += circ(cols.g, rowY(rGnd), 4.5, "#0f172a");
    body += txt(358, rowY(rGnd) - 7, "GND -> g" + rGnd, { size: 9.5, weight: "700", fill: "#0f172a", anchor: "middle" });

    // Breadboard component readout card
    body += rBox(740, 118, 76, 184, "#ffffff", "#cbd5e1", 7, 1);
    body += txt(746, 136, r1Lbl, { size: 10, weight: "700", fill: "#0f172a" });
    body += txt(746, 150, spec.colA + rTop + "->" + spec.colA + rMid, { size: 8.5, fill: "#475569" });
    body += txt(746, 174, isCap ? c1Lbl : isInd ? l1Lbl : r2Lbl, { size: 10, weight: "700", fill: "#1d4ed8" });
    body += txt(746, 188, spec.colB + rMid + "->" + spec.colB + rGnd, { size: 8.5, fill: "#475569" });
    body += txt(746, 218, "Vs: " + vsLbl, { size: 9.5, weight: "700", fill: "#dc2626" });
    body += txt(746, 236, "Vo: " + vOutLbl, { size: 9.5, weight: "700", fill: "#059669" });
    body += txt(746, 254, "I: " + iLbl, { size: 9.5, weight: "700", fill: "#7c3aed" });
    body += txt(746, 282, spec.faulted ? "⚠ FAULT" : "✓ NORMAL", { size: 9.5, weight: "700", fill: spec.faulted ? "#d97706" : "#16a34a" });

    // Panel 3: Bottom Equivalent Textbook Schematic
    body += rBox(22, 338, 816, 110, "#ffffff", "#d7dfef", 12, 1);
    body += txt(38, 355, "3 Equivalent circuit (" + spec.topo.replace(/_/g, " ") + ")", { size: 11, weight: "700", fill: "#0f172a" });
    body += battSym(116, 378, 428, "Vs=" + vsLbl);
    body += ln(116, 378, 248, 378, "#0f172a", 2);

    if (spec.topo === "rc_highpass") {
      body += ln(248, 378, 330, 378, "#0f172a", 2);
      body += ln(330, 368, 330, 388, "#1d4ed8", 2.8) + ln(338, 368, 338, 388, "#1d4ed8", 2.8);
      body += txt(334, 363, "C1=" + c1Lbl, { size: 10, weight: "700", fill: "#1e3a8a", anchor: "middle" });
      body += ln(338, 378, 520, 378, "#0f172a", 2);
      body += zigV(520, 378, 428, "R1=" + r1Lbl);
    } else if (spec.topo === "series_chain") {
      body += zigH(248, 344, 378, "R1=" + r1Lbl);
      body += ln(344, 378, 394, 378, "#0f172a", 2);
      body += zigH(394, 490, 378, "R2=" + r2Lbl);
      body += ln(490, 378, 680, 378, "#0f172a", 2);
      body += zigV(680, 378, 428, "R3=" + fmtEng(spec.r3, "Ω"));
    } else if (spec.topo === "rlc_band") {
      body += zigH(248, 336, 378, "R1=" + r1Lbl);
      body += ln(336, 378, 520, 378, "#0f172a", 2);
      body += indV(520, 378, 428, "L1=" + l1Lbl);
      body += ln(520, 378, 680, 378, "#0f172a", 2);
      body += capV(680, 378, 428, "C1=" + c1Lbl);
    } else {
      body += zigH(248, 354, 378, "R1=" + r1Lbl);
      body += ln(354, 378, 520, 378, "#0f172a", 2);
      if (isCap) body += capV(520, 378, 428, "C1=" + c1Lbl);
      else if (isInd) body += indV(520, 378, 428, "L1=" + l1Lbl);
      else body += zigV(520, 378, 428, "R2=" + r2Lbl);
      body += ln(520, 378, 680, 378, "#0f172a", 2);
      body += zigV(680, 378, 428, "RL=" + fmtEng(spec.r3, "Ω"));
    }
    body += circ(520, 378, 4.5, "#2563eb");
    body += txt(520, 364, "Vout = " + vOutLbl, { size: 10, weight: "700", fill: "#2563eb", anchor: "middle" });
    body += ln(116, 428, 680, 428, "#0f172a", 2);
    body += gndSym(210, 428);
    body += txt(775, 408, "I = " + iLbl, { size: 11, weight: "700", fill: "#db2777", anchor: "middle" });
    body += pth("M 170 395 L 440 395", "#ec4899", 1.8, "none");

    return `<svg class="av-visual-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 460" role="img" aria-label="${esc(headline)}">${body}</svg>`;
  }

  /** Build authentic STM32 NUCLEO-L476RG (MB1136 / UM1724) CubeMX & HAL profile for the active question. */
  function buildStm32Profile(spec, sol) {
    const vOut = Math.max(0, Math.min(3.3, sol.volts.nOut || 0));
    const adcRaw = Math.round((4095 * vOut) / 3.3);
    const vddStr = spec.vs <= 3.6 ? "CN6-4 (+3V3)" : "CN6-5 (+5V U5V)";
    let peripheral = "ADC1_IN5 (Single-Ended 12-bit)";
    let iocConfig = "RCC: MSI 4MHz->PLL 80MHz | PA0->ADC1_IN5 | PA5->GPIO_Out(LD2) | USART2->115200 8N1";
    let pins = [
      { hdr: "CN6-4", pin: "VDD_3V3", role: "3.3V Logic Supply", bus: "+3.3V Top Rail", color: "#dc2626" },
      { hdr: "CN6-6", pin: "GND", role: "Ground Reference", bus: "GND Bus Rail", color: "#0f172a" },
      { hdr: "CN8-1 (A0)", pin: "PA0", role: "ADC1_IN5 Sense Node", bus: "Midpoint / DUT Out", color: "#2563eb" },
      { hdr: "CN5-6 (D13)", pin: "PA5", role: "LD2 Status LED Output", bus: "Indicator LED", color: "#16a34a" },
      { hdr: "CN9-2 (D1)", pin: "PA2", role: "USART2_TX (ST-LINK VCP)", bus: "PC Serial Log", color: "#7c3aed" }
    ];
    let halCode = [
      "// STM32CubeIDE (UM1724 NUCLEO-L476RG) · " + spec.qId.toUpperCase(),
      "HAL_ADC_Start(&hadc1);",
      "HAL_ADC_PollForConversion(&hadc1, 10);",
      `uint32_t raw = HAL_ADC_GetValue(&hadc1);      // Expected ≈ ${adcRaw} counts (@ ${vOut.toFixed(2)}V)`,
      "float v_node = (3.3f * raw) / 4095.0f;",
      `HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, ${vOut > 0.5 && spec.powerOn ? "GPIO_PIN_SET" : "GPIO_PIN_RESET"});`
    ].join("\n");

    if (spec.topo === "i2c_open_drain" || spec.topicId === "buses") {
      peripheral = "I2C1 Fast Mode (400 kHz) · USART2 Console";
      iocConfig = "PB8->I2C1_SCL (AF4 OD+PullUp) | PB9->I2C1_SDA | PA2/PA3->USART2 (115200 8N1) | PA5..PA7->SPI1";
      pins = [
        { hdr: "CN6-4", pin: "VDD_3V3", role: "Pull-Up Reference (2.2kΩ)", bus: "+3.3V Bus Rail", color: "#dc2626" },
        { hdr: "CN5-10 (D15)", pin: "PB8", role: "I2C1_SCL (AF4 Open-Drain)", bus: "SCL Pull-Up Node", color: "#7c3aed" },
        { hdr: "CN5-9 (D14)", pin: "PB9", role: "I2C1_SDA (AF4 Open-Drain)", bus: "SDA Pull-Up Node", color: "#2563eb" },
        { hdr: "CN5-4 (D11)", pin: "PA7", role: "SPI1_MOSI / Sensor Bus", bus: "Breadboard Col 9", color: "#059669" },
        { hdr: "CN6-6", pin: "GND", role: "Common Return (ST-LINK)", bus: "GND Bus Rail", color: "#0f172a" }
      ];
      halCode = [
        "// STM32CubeIDE I2C1 / Bus Bring-Up · " + spec.qId.toUpperCase(),
        "uint8_t txBuf[2] = {0x00, 0xA5};",
        `// Rp=${fmtEng(sol.effR1, "Ω")}, Cbus=${fmtEng(spec.c1, "F")}, tr≈${fmtEng(0.8473 * sol.effR1 * spec.c1, "s")}`,
        "if (HAL_I2C_Master_Transmit(&hi2c1, 0x40<<1, txBuf, 2, 20) == HAL_OK) {",
        "    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_SET); // PA5 LD2 OK",
        "}"
      ].join("\n");
    } else if (spec.topo === "rc_step" || spec.topo === "rl_flyback" || spec.topo.includes("rc_") || spec.topo === "rlc_band") {
      const arrVal = Math.max(99, Math.round(80e6 / Math.max(100, spec.freq)) - 1);
      peripheral = "TIM2_CH2 PWM + ADC1_IN5 Envelope Capture";
      iocConfig = "SYSCLK=80MHz | PB3->TIM2_CH2 (AF1 PWM) | PA0->ADC1_IN5 | PC13->EXTI13 Button B1";
      pins = [
        { hdr: "CN9-4 (D3)", pin: "PB3", role: "TIM2_CH2 Stimulus/PWM Drive", bus: "Input Node (R1)", color: "#dc2626" },
        { hdr: "CN8-1 (A0)", pin: "PA0", role: "ADC1_IN5 Response Probe", bus: "Filter/Tank Vout", color: "#2563eb" },
        { hdr: "CN7-23", pin: "PC13", role: "User B1 (Step Trigger EXTI13)", bus: "Trigger Switch", color: "#d97706" },
        { hdr: "CN6-4", pin: "+3V3", role: "Logic & Decoupling Ref", bus: "+3.3V Rail (100nF)", color: "#16a34a" },
        { hdr: "CN6-6", pin: "GND", role: "Return Ground", bus: "GND Rail", color: "#0f172a" }
      ];
      halCode = [
        "// STM32CubeIDE TIM2 Step/AC Drive · " + spec.qId.toUpperCase(),
        `__HAL_TIM_SET_AUTORELOAD(&htim2, ${arrVal}); // Target f ≈ ${fmtEng(spec.freq, "Hz")}`,
        `__HAL_TIM_SET_COMPARE(&htim2, TIM_CHANNEL_2, ${Math.round((arrVal + 1) * (spec.duty / 100))}); // Duty ${spec.duty}%`,
        "HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_2);",
        `// Cutoff/Resonant fc ≈ ${fmtEng(sol.fc, "Hz")} | Tau ≈ ${fmtEng(sol.tau, "s")}`
      ].join("\n");
    }
    return { vddStr, adcRaw, peripheral, iocConfig, pins, halCode };
  }

  /** Draw full multi-rail 3220-inspired breadboard with docked NUCLEO-L476RG pins & multi-components. */
  function drawLiveBreadboard(canvas, spec, sol) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = 640, H = 300;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // Outer Lab Bench Surface
    ctx.fillStyle = "#eef2f7";
    ctx.fillRect(0, 0, W, H);

    // Left Docked STM32 NUCLEO-L476RG (UM1724 / MB1136) Carrier Header
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    roundRect(ctx, 8, 8, 128, H - 16, 10, true, true);
    ctx.fillStyle = "#1e293b";
    roundRect(ctx, 16, 16, 112, 34, 6, true, false);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9.5px monospace";
    ctx.fillText("NUCLEO-L476RG", 24, 30);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "8.5px monospace";
    ctx.fillText("UM1724 / MB1136", 24, 42);

    const ledOn = spec.powerOn && !spec.faulted && (sol.volts.nOut || 0) > 0.2;
    ctx.fillStyle = ledOn ? "#22c55e" : "#94a3b8";
    ctx.beginPath(); ctx.arc(118, 28, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#475569";
    ctx.font = "bold 8px sans-serif";
    ctx.fillText("LD2 PA5", 82, 62);

    const nucPins = [
      { lbl: "+3V3 CN6-4", col: "#dc2626", y: 80 },
      { lbl: "+5V  CN6-5", col: "#ea580c", y: 108 },
      { lbl: "PA0  A0/ADC", col: "#2563eb", y: 136 },
      { lbl: "PB3  D3/PWM", col: "#7c3aed", y: 164 },
      { lbl: "PB8  D15/SCL", col: "#059669", y: 192 },
      { lbl: "PC13 B1/BTN", col: "#d97706", y: 220 },
      { lbl: "GND  CN6-6", col: "#0f172a", y: 248 }
    ];
    nucPins.forEach((p) => {
      ctx.fillStyle = "#0f172a";
      roundRect(ctx, 96, p.y - 8, 30, 16, 4, true, false);
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(118, p.y, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 8.5px monospace";
      ctx.fillText(p.lbl, 16, p.y + 3);
    });

    // Right Full Multi-Rail Solderless Breadboard (Cols 1..15, +5V/+3.3V/GND split bus strips)
    const bx = 148, bw = W - bx - 8;
    ctx.fillStyle = "#f5efe2";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    roundRect(ctx, bx, 8, bw, H - 16, 12, true, true);

    // Top Dual Bus (+5V red & GND blue)
    ctx.fillStyle = "#fee2e2";
    roundRect(ctx, bx + 12, 16, bw - 24, 15, 4, true, false);
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(bx + 20, 23.5); ctx.lineTo(bx + bw - 20, 23.5); ctx.stroke();
    ctx.fillStyle = "#dbeafe";
    roundRect(ctx, bx + 12, 34, bw - 24, 15, 4, true, false);
    ctx.strokeStyle = "#2563eb";
    ctx.beginPath(); ctx.moveTo(bx + 20, 41.5); ctx.lineTo(bx + bw - 20, 41.5); ctx.stroke();

    ctx.fillStyle = "#b91c1c"; ctx.font = "bold 9px monospace";
    ctx.fillText("+5V", bx + 16, 26);
    ctx.fillStyle = "#1d4ed8";
    ctx.fillText("GND", bx + 16, 44);

    // Bottom Dual Bus (+3.3V red & GND)
    ctx.fillStyle = "#fee2e2";
    roundRect(ctx, bx + 12, H - 48, bw - 24, 15, 4, true, false);
    ctx.strokeStyle = "#ef4444";
    ctx.beginPath(); ctx.moveTo(bx + 20, H - 40.5); ctx.lineTo(bx + bw - 20, H - 40.5); ctx.stroke();
    ctx.fillStyle = "#e2e8f0";
    roundRect(ctx, bx + 12, H - 30, bw - 24, 15, 4, true, false);
    ctx.strokeStyle = spec.faulted && spec.faultInfo.kind === "bad_gnd" ? "#d97706" : "#0f172a";
    ctx.beginPath(); ctx.moveTo(bx + 20, H - 22.5); ctx.lineTo(bx + bw - 20, H - 22.5); ctx.stroke();

    ctx.fillStyle = "#b91c1c";
    ctx.fillText("+3V3 (" + (spec.powerOn ? (sol.volts.nIn || 0).toFixed(1) + "V" : "0V") + ")", bx + 16, H - 38);
    ctx.fillStyle = "#0f172a";
    ctx.fillText("GND (" + (sol.volts.GND || 0).toFixed(2) + "V)", bx + 16, H - 20);

    // Center DIP IC trench
    ctx.fillStyle = "#e2e8f0";
    roundRect(ctx, bx + 12, 144, bw - 24, 14, 4, true, false);

    // 14 Full Prototyping Strip Columns
    const colStart = bx + 44, colStep = 30;
    const activeTopCol = 2 + (spec.rowBase % 2);
    const activeMidCol = activeTopCol + 4;
    const activeLoadCol = activeMidCol + 3;
    const activeIcCol = activeLoadCol + 1;

    for (let c = 0; c < 14; c++) {
      const x = colStart + c * colStep;
      const fillTop = c === activeTopCol ? "#fee2e2" : c === activeMidCol ? "#dbeafe" : "#ebe5d8";
      const fillBot = c === activeMidCol ? "#dbeafe" : c === activeLoadCol ? "#dcfce7" : "#ebe5d8";
      roundRect(ctx, x - 8, 56, 16, 82, 4, true, false);
      ctx.fillStyle = fillTop;
      roundRect(ctx, x - 8, 56, 16, 82, 4, true, false);
      ctx.fillStyle = fillBot;
      roundRect(ctx, x - 8, 164, 16, 82, 4, true, false);
      ctx.fillStyle = "#475569"; ctx.font = "9px monospace";
      ctx.fillText(String(c + 1), x - 4, 65);
      for (let r = 0; r < 5; r++) {
        ctx.fillStyle = "#1e293b";
        ctx.beginPath(); ctx.arc(x, 75 + r * 14, 2.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, 175 + r * 14, 2.3, 0, Math.PI * 2); ctx.fill();
      }
      // Power rail bus holes
      ctx.beginPath(); ctx.arc(x, 23.5, 2.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, 41.5, 2.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, H - 40.5, 2.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, H - 22.5, 2.1, 0, Math.PI * 2); ctx.fill();
    }

    const xTop = colStart + activeTopCol * colStep;
    const xMid = colStart + activeMidCol * colStep;
    const xLoad = colStart + activeLoadCol * colStep;
    const xIc = colStart + activeIcCol * colStep;

    // Decoupling ceramic bypass cap across top rail + GND (column 1 -> full breadboard realism)
    const xDec = colStart;
    ctx.fillStyle = "#f59e0b";
    roundRect(ctx, xDec - 7, 26, 14, 12, 3, true, false);
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(xDec - 3, 38); ctx.lineTo(xDec - 3, 42); ctx.moveTo(xDec + 3, 24); ctx.lineTo(xDec + 3, 26); ctx.stroke();

    // NUCLEO-L476RG jumpers docked directly onto breadboard columns!
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = "#dc2626";
    ctx.beginPath(); ctx.moveTo(118, 80); ctx.lineTo(xTop, 23.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(xTop, 23.5); ctx.lineTo(xTop, 75); ctx.stroke();

    ctx.strokeStyle = "#2563eb"; // PA0 ADC sense jumper -> Midpoint node
    ctx.beginPath(); ctx.moveTo(118, 136); ctx.bezierCurveTo(170, 136, xMid - 25, 136, xMid, 175); ctx.stroke();

    ctx.strokeStyle = "#0f172a"; // GND return from Nucleo CN6-6 -> Bottom GND bus
    ctx.beginPath(); ctx.moveTo(118, 248); ctx.lineTo(xLoad, H - 22.5); ctx.stroke();

    const drawLabelPill = (text, cx, cy, fg) => {
      ctx.font = "bold 9.5px sans-serif";
      const w = ctx.measureText(text).width + 10;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      roundRect(ctx, cx - w / 2, cy - 10, w, 15, 4, true, true);
      ctx.fillStyle = fg || "#0f172a";
      ctx.fillText(text, cx - w / 2 + 5, cy + 1);
    };

    // Main Series Component R1 bridging xTop -> xMid
    drawResistorCanvas(ctx, xTop, 94, xMid, 94, spec.r1, spec.faulted && spec.faultInfo.kind === "open_r1");
    drawLabelPill("R1 " + fmtEng(sol.effR1, "Ω"), (xTop + xMid) / 2, 72, "#0f172a");

    // Bridge jumper across center DIP trench at activeMidCol
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(xMid, 128); ctx.lineTo(xMid, 175); ctx.stroke();

    // Multi-component Companion DIP-8 IC straddling center trench (cols activeIcCol .. activeIcCol+3)
    const icTag = spec.topo.includes("i2c") ? "INA219" : spec.topo === "rc_step" ? "NE555" : spec.topo === "rl_flyback" ? "DRV88" : "LM358";
    ctx.fillStyle = "#1e293b";
    roundRect(ctx, xIc - 10, 122, colStep * 3 + 20, 56, 5, true, false);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 9.5px monospace";
    ctx.fillText(icTag + " DIP-8", xIc + 10, 153);
    for (let pin = 0; pin < 4; pin++) {
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(xIc + pin * colStep - 3, 117, 6, 6);
      ctx.fillRect(xIc + pin * colStep - 3, 177, 6, 6);
    }

    // Component 2 from xMid -> xLoad (Capacitor / Inductor / Diode / Resistor)
    if (spec.topo.includes("rc") || spec.topo.includes("i2c") || spec.topo === "rlc_band") {
      ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(xMid, 198); ctx.lineTo(xLoad, 198); ctx.stroke();
      ctx.fillStyle = "#2563eb";
      roundRect(ctx, (xMid + xLoad) / 2 - 12, 186, 24, 24, 5, true, false);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 9.5px sans-serif";
      ctx.fillText("C1", (xMid + xLoad) / 2 - 7, 202);
      drawLabelPill(fmtEng(spec.c1, "F"), (xMid + xLoad) / 2, 224, "#1e3a8a");
    } else if (spec.topo === "rl_flyback") {
      ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(xMid, 198); ctx.lineTo(xLoad, 198); ctx.stroke();
      ctx.fillStyle = "#334155";
      roundRect(ctx, (xMid + xLoad) / 2 - 14, 186, 28, 24, 7, true, false);
      ctx.fillStyle = "#fef08a"; ctx.font = "bold 9.5px sans-serif";
      ctx.fillText("L1", (xMid + xLoad) / 2 - 6, 202);
      drawLabelPill(fmtEng(spec.l1, "H"), (xMid + xLoad) / 2, 224, "#0f172a");
    } else {
      drawResistorCanvas(ctx, xMid, 198, xLoad, 198, sol.effR2, false);
      drawLabelPill("R2 " + fmtEng(sol.effR2, "Ω"), (xMid + xLoad) / 2, 224, "#0f172a");
    }

    // Secondary companion LED indicator wired from xIc+colStep (via 330Ω) down to GND
    const xLed = colStart + (activeIcCol + 2) * colStep;
    ctx.fillStyle = ledOn ? "#10b981" : "#94a3b8";
    ctx.strokeStyle = "#064e3b"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(xLed, 204, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(xLoad, 212); ctx.lineTo(xLoad, H - 22.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(xLed, 212); ctx.lineTo(xLed, H - 22.5); ctx.stroke();

    // Red & Black DMM Probes
    const nodePos = {
      nIn: [xTop, 75],
      nOut: [xMid, 175],
      GND: [xLoad, H - 22.5]
    };
    const rPos = nodePos[spec.redNode] || nodePos.nOut;
    const bPos = nodePos[spec.blackNode] || nodePos.GND;
    drawProbePin(ctx, rPos[0], rPos[1], "#dc2626", "+ RED");
    drawProbePin(ctx, bPos[0], bPos[1], "#0f172a", "- BLK");
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function drawResistorCanvas(ctx, x1, y1, x2, y2, ohms, isOpen) {
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const mx = (x1 + x2) / 2;
    ctx.fillStyle = "#e6cfa3";
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 1.2;
    roundRect(ctx, mx - 24, y1 - 8, 48, 16, 4, true, true);
    const bands = resistorBands(ohms);
    bands.forEach((b, i) => {
      ctx.fillStyle = b;
      ctx.fillRect(mx - 17 + i * 10, y1 - 7, 4, 14);
    });
    if (isOpen) {
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(mx - 10, y1 - 12); ctx.lineTo(mx + 10, y1 + 12);
      ctx.moveTo(mx + 10, y1 - 12); ctx.lineTo(mx - 10, y1 + 12);
      ctx.stroke();
    }
  }

  function drawProbePin(ctx, x, y, color, label) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    roundRect(ctx, x + 8, y - 11, 44, 16, 4, true, false);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.fillText(label, x + 12, y);
  }

  /** Draw crisp 2-channel Infiniium-style Oscilloscope on Canvas. */
  function drawScopeCanvas(canvas, spec, sol) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = 520, H = 190;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#040814";
    ctx.fillRect(0, 0, W, H);

    // Graticule grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.16)";
    ctx.lineWidth = 1;
    for (let x = 20; x < W - 10; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 24); ctx.lineTo(x, H - 20); ctx.stroke();
    }
    for (let y = 24; y < H - 15; y += 36) {
      ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(W - 12, y); ctx.stroke();
    }

    const allV = sol.ch1.concat(sol.ch2);
    const maxV = Math.max(1, ...allV.map((v) => Math.abs(v))) * 1.15;
    const minV = allV.some((v) => v < -0.1) ? -maxV : -0.15 * maxV;
    const yMap = (v) => (H - 22) - ((v - minV) / Math.max(0.1, maxV - minV)) * (H - 52);

    // Zero baseline
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.setLineDash([4, 4]);
    const y0 = yMap(0);
    ctx.beginPath(); ctx.moveTo(16, y0); ctx.lineTo(W - 12, y0); ctx.stroke();
    ctx.setLineDash([]);

    // Plot CH1 (Stimulus) & CH2 (Output / DUT)
    const plot = (arr, color, width) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      arr.forEach((v, i) => {
        const px = 16 + (i / Math.max(1, arr.length - 1)) * (W - 28);
        const py = Math.max(20, Math.min(H - 18, yMap(v)));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    };
    plot(sol.ch1, "#facc15", 1.8);
    plot(sol.ch2, "#22d3ee", 2.4);

    // Scope Header HUD
    ctx.font = "bold 10.5px monospace";
    ctx.fillStyle = "#facc15";
    ctx.fillText("CH1 Vin: " + spec.vs.toFixed(1) + "V", 16, 15);
    ctx.fillStyle = "#22d3ee";
    ctx.fillText("CH2 Vout: " + (sol.volts.nOut || 0).toFixed(2) + "V", 124, 15);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "10px monospace";
    ctx.fillText(sol.acMetricLabel.slice(0, 56), 130, H - 5);
    ctx.fillStyle = "#64748b";
    ctx.fillText("Span: " + fmtEng(sol.tTotal, "s"), 16, H - 5);
  }

  /** Build target verification text linking simulator readout back to the active question. */
  function describeVerification(spec, sol) {
    if (spec.expected !== undefined && Number.isFinite(spec.expected)) {
      const unitStr = spec.expectedUnit ? " " + spec.expectedUnit : "";
      const note = spec.qId === "ohm-C1"
        ? "Live current I = " + fmtEng(sol.totalI, "A") + " (Target: " + spec.expected + unitStr + ")."
        : "Expected Question Target: " + spec.expected + unitStr + ". Compare with your live DMM/Scope values above.";
      return "✓ Verification Helper: " + note;
    }
    if (spec.faulted) {
      return "🚨 Troubleshooting Mode: " + spec.faultInfo.faultNote + " Click 'Fix / Healthy' in the bar above to verify normal recovery.";
    }
    return "✓ Interactive Check: Adjust sliders (Vs, R1, R2, C1, L1, Freq), switch DMM modes (V / mA / Ω), or open Online CircuitJS1 to explore.";
  }

  /** Mount / re-mount live interactive bench & online simulator inside every .av-sim-host in view. */
  function mountAll(rootHost, q, t) {
    if (!rootHost || !q || !t) return;
    const targets = rootHost.querySelectorAll(".av-sim-host");
    if (!targets.length) return;

    targets.forEach((box) => {
      const baseSpec = buildCircuitSpec(q, t);
      const state = Object.assign({}, baseSpec, { showOnline: false, simTab: "bench" });

      function renderUI() {
        const sol = solveCircuit(state);
        const falstadUrl = toFalstadUrl(state);
        const stm = buildStm32Profile(state, sol);
        const bannerCls = !state.powerOn ? "is-poweroff" : state.faulted ? "is-fault" : "is-healthy";
        const bannerMsg = !state.powerOn
          ? "⚡ Power OFF: Safe state for continuity & Ω resistance measurements."
          : state.faulted
            ? "⚠ Fault Active: " + state.faultInfo.label
            : "● Live Circuit Energized (" + state.instrument + ")";

        const showC = state.topo.includes("rc") || state.topo.includes("i2c") || state.topo === "rlc_band";
        const showL = state.topo === "rl_flyback" || state.topo === "rlc_band";
        const showF = state.topo === "rc_lowpass" || state.topo === "rc_highpass" || state.topo === "rlc_band" || state.topo === "rf_50ohm_line";

        box.innerHTML =
          '<div class="av-sim-topbar">' +
            '<div class="av-sim-titlewrap">' +
              '<div class="av-sim-eyebrow">FULL BREADBOARD, NUCLEO-L476RG &amp; ONLINE SIMULATOR</div>' +
              '<h4 class="av-sim-title">' + esc(state.qId.toUpperCase()) + ' · ' + esc(state.instrument) + '</h4>' +
              '<p class="av-sim-sub">' + esc(state.isIndirectHardwareTopic
                ? "Representative DUT power/interface circuit for this automated test & log scenario."
                : "Auto-built multi-component breadboard + STM32 NUCLEO-L476RG (UM1724) for " + state.qId + " (" + state.level + ").") + '</p>' +
            '</div>' +
            '<div class="av-sim-actions">' +
              '<button type="button" class="av-sim-btn ' + (state.powerOn ? "power-on" : "power-off") + '" data-sim-act="power">' +
                (state.powerOn ? "⚡ Power ON" : "⭘ Power OFF") +
              '</button>' +
              '<button type="button" class="av-sim-btn ' + (state.faulted ? "fault-on" : "") + '" data-sim-act="fault">' +
                (state.faulted ? "🔧 Fix / Healthy" : "🚨 Inject Fault") +
              '</button>' +
              '<button type="button" class="av-sim-btn" data-sim-act="reset">↺ Reset</button>' +
              '<button type="button" class="av-sim-btn online-primary" data-sim-act="toggle-online">' +
                (state.showOnline ? "▼ Hide Online CircuitJS1" : "▶ Run in Online CircuitJS1") +
              '</button>' +
              '<a class="av-sim-btn" href="' + esc(falstadUrl) + '" target="_blank" rel="noopener noreferrer">↗ Open Full Sim</a>' +
            '</div>' +
          '</div>' +
          '<div class="av-sim-tabs" role="tablist" aria-label="Simulator bench tabs">' +
            '<button type="button" class="av-sim-tab ' + (state.simTab === "bench" ? "active" : "") + '" data-sim-tab="bench">⚡ Full Breadboard &amp; MNA Bench</button>' +
            '<button type="button" class="av-sim-tab ' + (state.simTab === "stm32" ? "active" : "") + '" data-sim-tab="stm32">🧩 STM32 NUCLEO-L476RG (UM1724) + CubeMX / CubeIDE</button>' +
          '</div>' +
          '<div class="av-sim-banner ' + bannerCls + '">' +
            '<span>' + esc(bannerMsg) + '</span>' +
            '<span><strong>Total Current:</strong> ' + esc(fmtEng(sol.totalI, "A")) + ' · <strong>Power:</strong> ' + esc(fmtEng(sol.totalP, "W")) + '</span>' +
          '</div>' +
          (state.simTab === "stm32"
            ? '<div class="av-stm32-panel">' +
                '<div class="av-stm32-card">' +
                  '<h5>STM32 NUCLEO-L476RG (MB1136 / UM1724) Pin Map</h5>' +
                  '<p class="av-stm32-meta"><strong>STM32CubeMX Peripheral:</strong> ' + esc(stm.peripheral) + '<br><code>' + esc(stm.iocConfig) + '</code></p>' +
                  '<table class="av-stm32-table"><thead><tr><th>Header (Arduino / Morpho)</th><th>STM32 Pin</th><th>CubeMX Role</th><th>Breadboard Net</th></tr></thead><tbody>' +
                  stm.pins.map((p) =>
                    '<tr><td>' + esc(p.hdr) + '</td><td><span class="av-stm32-pin-pill">' + esc(p.pin) + '</span></td><td>' + esc(p.role) + '</td><td>' + esc(p.bus) + '</td></tr>'
                  ).join("") +
                  '</tbody></table>' +
                  '<div class="av-stm32-live-adc">Live Breadboard -> STM32 ADC1_IN5 (PA0): Vout = ' + (sol.volts.nOut || 0).toFixed(3) + ' V · 12-bit RAW ≈ ' + stm.adcRaw + ' / 4095 · Supply: ' + esc(stm.vddStr) + '</div>' +
                '</div>' +
                '<div class="av-stm32-card">' +
                  '<h5>STM32CubeIDE HAL Demonstration (main.c)</h5>' +
                  '<p class="av-stm32-meta">Flash via ST-LINK/V2-1 (CN1 USB, PA13 SWDIO / PA14 SWCLK). Live register values sync to your breadboard sliders.</p>' +
                  '<pre class="av-stm32-code">' + esc(stm.halCode) + '</pre>' +
                  '<div class="av-sim-target-check">' + esc(describeVerification(state, sol)) + '</div>' +
                '</div>' +
              '</div>'
            : '<div class="av-sim-grid">' +
                '<div class="av-sim-card">' +
                  '<h5>Full Multi-Rail Breadboard + NUCLEO-L476RG <span class="av-sim-chip">' + esc(state.topo.replace(/_/g, " ").toUpperCase()) + '</span></h5>' +
                  '<div class="av-sim-bb-wrap"><canvas class="av-sim-bb-canvas" width="640" height="300" aria-label="Full multi-component solderless breadboard"></canvas></div>' +
                  '<div class="av-sim-probe-row">' +
                    '<label class="av-sim-probe-label"><span class="av-sim-dot red"></span>Red Probe (+)' +
                      '<select data-sim-probe="red">' +
                        '<option value="nIn"' + (state.redNode === "nIn" ? " selected" : "") + '>Supply Rail (+Vs)</option>' +
                        '<option value="nOut"' + (state.redNode === "nOut" ? " selected" : "") + '>DUT Output Node</option>' +
                        '<option value="GND"' + (state.redNode === "GND" ? " selected" : "") + '>GND Reference</option>' +
                      '</select>' +
                    '</label>' +
                    '<label class="av-sim-probe-label"><span class="av-sim-dot blk"></span>Black Probe (-)' +
                      '<select data-sim-probe="black">' +
                        '<option value="GND"' + (state.blackNode === "GND" ? " selected" : "") + '>GND Reference</option>' +
                        '<option value="nOut"' + (state.blackNode === "nOut" ? " selected" : "") + '>DUT Output Node</option>' +
                        '<option value="nIn"' + (state.blackNode === "nIn" ? " selected" : "") + '>Supply Rail (+Vs)</option>' +
                      '</select>' +
                    '</label>' +
                  '</div>' +
                  '<div class="av-sim-scope-wrap"><canvas class="av-sim-scope-canvas" width="520" height="190" aria-label="Live 2-channel oscilloscope"></canvas></div>' +
                '</div>' +
                '<div class="av-sim-card">' +
                  '<h5>Digital Multimeter &amp; Component Bench</h5>' +
                  '<div class="av-sim-dmm">' +
                    '<div class="av-sim-dmm-top">' +
                      '<span class="av-sim-dmm-brand">Bench DMM · MNA Engine</span>' +
                      '<div class="av-sim-dmm-modes">' +
                        ["V", "mA", "OHM"].map((md) =>
                          '<button type="button" class="' + (state.dmmMode === md ? "active" : "") + '" data-sim-dmm="' + md + '">' + (md === "OHM" ? "Ω" : md) + '</button>'
                        ).join("") +
                      '</div>' +
                    '</div>' +
                    '<div class="av-sim-dmm-readout ' + (sol.dmmWarn ? "warn" : "") + '">' + esc(sol.dmmText) + '</div>' +
                    '<div class="av-sim-dmm-meta">Probing <strong>' + esc(state.redNode) + '</strong> wrt <strong>' + esc(state.blackNode) + '</strong> · ' + esc(sol.acMetricLabel) + '</div>' +
                  '</div>' +
                  '<div class="av-sim-controls">' +
                    '<div class="av-sim-slider-row"><label>Source Vs</label><input type="range" min="1" max="24" step="0.1" value="' + state.vs + '" data-sim-param="vs"><span class="av-sim-slider-val">' + state.vs.toFixed(1) + ' V</span></div>' +
                    '<div class="av-sim-slider-row"><label>Series R1</label><input type="range" min="10" max="10000" step="10" value="' + Math.min(10000, Math.round(state.r1)) + '" data-sim-param="r1"><span class="av-sim-slider-val">' + esc(fmtEng(state.r1, "Ω")) + '</span></div>' +
                    '<div class="av-sim-slider-row"><label>Shunt/Load R2</label><input type="range" min="10" max="10000" step="10" value="' + Math.min(10000, Math.round(state.r2)) + '" data-sim-param="r2"><span class="av-sim-slider-val">' + esc(fmtEng(state.r2, "Ω")) + '</span></div>' +
                    (showC ? '<div class="av-sim-slider-row"><label>Cap C1 (µF)</label><input type="range" min="0.1" max="22" step="0.1" value="' + Math.max(0.1, Math.min(22, +(state.c1 * 1e6).toFixed(2))) + '" data-sim-param="c1u"><span class="av-sim-slider-val">' + esc(fmtEng(state.c1, "F")) + '</span></div>' : "") +
                    (showL ? '<div class="av-sim-slider-row"><label>Ind L1 (mH)</label><input type="range" min="0.5" max="20" step="0.5" value="' + Math.max(0.5, Math.min(20, +(state.l1 * 1e3).toFixed(1))) + '" data-sim-param="l1m"><span class="av-sim-slider-val">' + esc(fmtEng(state.l1, "H")) + '</span></div>' : "") +
                    (showF ? '<div class="av-sim-slider-row"><label>Freq (Hz)</label><input type="range" min="50" max="50000" step="50" value="' + Math.min(50000, Math.round(state.freq)) + '" data-sim-param="freq"><span class="av-sim-slider-val">' + esc(fmtEng(state.freq, "Hz")) + '</span></div>' : "") +
                  '</div>' +
                  '<table class="av-sim-nodes-table"><thead><tr><th>Node / Branch</th><th>Live Value</th></tr></thead><tbody>' +
                    '<tr><td>V(Supply Rail)</td><td class="num">' + (sol.volts.nIn || 0).toFixed(3) + ' V</td></tr>' +
                    '<tr><td>V(DUT Output)</td><td class="num">' + (sol.volts.nOut || 0).toFixed(3) + ' V</td></tr>' +
                    '<tr><td>Loop Current I</td><td class="num">' + esc(fmtEng(sol.totalI, "A")) + '</td></tr>' +
                    (state.topo === "rc_lowpass" || state.topo === "rc_highpass" || state.topo === "rlc_band"
                      ? '<tr><td>Cutoff / Resonant</td><td class="num">' + esc(fmtEng(sol.fc, "Hz")) + '</td></tr>'
                      : '<tr><td>Power (P = V×I)</td><td class="num">' + esc(fmtEng(sol.totalP, "W")) + '</td></tr>') +
                  '</tbody></table>' +
                  '<div class="av-sim-target-check">' + esc(describeVerification(state, sol)) + '</div>' +
                '</div>' +
              '</div>') +
          (state.showOnline
            ? '<div class="av-sim-online-drawer">' +
                '<div class="av-sim-online-bar">' +
                  '<span><strong>Online CircuitJS1 Simulator</strong> — Loaded directly with ' + esc(state.qId.toUpperCase()) + ' netlist (Vs=' + state.vs.toFixed(1) + 'V, R1=' + esc(fmtEng(state.r1, "Ω")) + '). Click switches or hover components inside the live canvas below.</span>' +
                  '<button type="button" class="av-sim-btn" data-sim-act="copy-cct">📋 Copy Netlist ($ cct)</button>' +
                '</div>' +
                '<iframe class="av-sim-iframe" title="Online CircuitJS1 Simulator for ' + esc(state.qId) + '" src="' + esc(falstadUrl) + '" loading="lazy"></iframe>' +
                '<p class="av-sim-inline-note">Note: External online simulator requires internet access; the MNA Breadboard, DMM &amp; Oscilloscope above run 100% offline anytime.</p>' +
              '</div>'
            : "");

        const bbCanvas = box.querySelector(".av-sim-bb-canvas");
        const scCanvas = box.querySelector(".av-sim-scope-canvas");
        if (bbCanvas) drawLiveBreadboard(bbCanvas, state, sol);
        if (scCanvas) drawScopeCanvas(scCanvas, state, sol);

        box.querySelectorAll("[data-sim-tab]").forEach((btn) => {
          btn.addEventListener("click", () => {
            state.simTab = btn.getAttribute("data-sim-tab");
            renderUI();
          });
        });

        // Wire controls cleanly without re-creating duplicate document listeners
        box.querySelectorAll("[data-sim-act]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const act = btn.getAttribute("data-sim-act");
            if (act === "power") state.powerOn = !state.powerOn;
            else if (act === "fault") state.faulted = !state.faulted;
            else if (act === "reset") Object.assign(state, baseSpec, { showOnline: state.showOnline });
            else if (act === "toggle-online") state.showOnline = !state.showOnline;
            else if (act === "copy-cct") {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(toFalstadNetlist(state)).catch(() => {});
                btn.textContent = "✓ Copied Netlist";
                setTimeout(() => { btn.textContent = "📋 Copy Netlist ($ cct)"; }, 1500);
              }
              return;
            }
            renderUI();
          });
        });
        box.querySelectorAll("[data-sim-dmm]").forEach((btn) => {
          btn.addEventListener("click", () => {
            state.dmmMode = btn.getAttribute("data-sim-dmm");
            renderUI();
          });
        });
        box.querySelectorAll("[data-sim-probe]").forEach((sel) => {
          sel.addEventListener("change", () => {
            if (sel.getAttribute("data-sim-probe") === "red") state.redNode = sel.value;
            else state.blackNode = sel.value;
            renderUI();
          });
        });
        box.querySelectorAll("[data-sim-param]").forEach((inp) => {
          inp.addEventListener("input", () => {
            const p = inp.getAttribute("data-sim-param");
            const val = Number(inp.value);
            if (p === "vs") state.vs = val;
            else if (p === "r1") state.r1 = val;
            else if (p === "r2") state.r2 = val;
            else if (p === "c1u") state.c1 = val * 1e-6;
            else if (p === "l1m") state.l1 = val * 1e-3;
            else if (p === "freq") state.freq = val;
            renderUI();
          });
        });
      }

      renderUI();
    });
  }

  window.avionicsCircuitEngine = {
    buildCircuitSpec,
    solveCircuit,
    toFalstadNetlist,
    toFalstadUrl,
    renderThreePanelSvg,
    fmtEng,
    resistorBands
  };
  window.mountAvionicsSimulator = mountAll;
})();
