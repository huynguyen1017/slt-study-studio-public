/* NVIDIA System-Level Test (SLT) Interactive Practice Workbook, 129-Card Master Q&A, & JD/RTR Hub */
(function (global) {
  "use strict";

  const STORAGE_KEY = "slt-nvidia-post-silicon-v1";

  const UNIT_SCALE = {
    // Resistance (base Ohm)
    uOhm: { family: "res", scale: 1e-6 }, mOhm: { family: "res", scale: 1e-3 },
    Ohm: { family: "res", scale: 1 }, ohm: { family: "res", scale: 1 },
    kOhm: { family: "res", scale: 1e3 }, MOhm: { family: "res", scale: 1e6 },
    // Voltage (base V)
    uV: { family: "volt", scale: 1e-6 }, mV: { family: "volt", scale: 1e-3 },
    V: { family: "volt", scale: 1 }, kV: { family: "volt", scale: 1e3 },
    // Current (base A)
    uA: { family: "curr", scale: 1e-6 }, mA: { family: "curr", scale: 1e-3 },
    A: { family: "curr", scale: 1 },
    // Power (base W)
    mW: { family: "pwr", scale: 1e-3 }, W: { family: "pwr", scale: 1 },
    // Time (base s)
    ps: { family: "time", scale: 1e-12 }, ns: { family: "time", scale: 1e-9 },
    us: { family: "time", scale: 1e-6 }, ms: { family: "time", scale: 1e-3 },
    s: { family: "time", scale: 1 }, sec: { family: "time", scale: 1 },
    // Frequency (base Hz)
    Hz: { family: "freq", scale: 1 }, kHz: { family: "freq", scale: 1e3 },
    MHz: { family: "freq", scale: 1e6 }, GHz: { family: "freq", scale: 1e9 },
    // Sample rate (base S/s)
    "GS/s": { family: "srate", scale: 1e9 }, "MS/s": { family: "srate", scale: 1e6 },
    // Capacitance (base F)
    fF: { family: "cap", scale: 1e-15 }, pF: { family: "cap", scale: 1e-12 },
    nF: { family: "cap", scale: 1e-9 }, uF: { family: "cap", scale: 1e-6 }, mF: { family: "cap", scale: 1e-3 },
    // Inductance (base H)
    pH: { family: "ind", scale: 1e-12 }, nH: { family: "ind", scale: 1e-9 }, uH: { family: "ind", scale: 1e-6 },
    // Length (base m)
    mm: { family: "len", scale: 1e-3 }, cm: { family: "len", scale: 1e-2 }, m: { family: "len", scale: 1 },
    mils: { family: "len", scale: 25.4e-6 }, mil: { family: "len", scale: 25.4e-6 },
    // Temperature
    C: { family: "temp", scale: 1 }, "°C": { family: "temp", scale: 1 },
    // Storage (decimal / IEC consistent scale in GB-family)
    KB: { family: "mem", scale: 1e3 }, MB: { family: "mem", scale: 1e6 }, GB: { family: "mem", scale: 1e9 },
    // Bandwidth
    "GB/s": { family: "bw", scale: 1e9 }, "MB/s": { family: "bw", scale: 1e6 },
    Gbps: { family: "serdes", scale: 1e9 }, Mbps: { family: "serdes", scale: 1e6 },
    // Miscellaneous exact units
    "MHz/mV": { family: "slope", scale: 1 },
    dB: { family: "dB", scale: 1 },
    "%": { family: "pct", scale: 1 }, pct: { family: "pct", scale: 1 },
    ppm: { family: "ppm", scale: 1 },
    N: { family: "force", scale: 1 },
    ratio: { family: "ratio", scale: 1 },
    bits: { family: "bits", scale: 1 },
    buffers: { family: "buffers", scale: 1 },
    cycles: { family: "cycles", scale: 1 },
    parts: { family: "parts", scale: 1 }
  };

  function normalizeUnitToken(u) {
    if (!u) return "";
    let s = String(u).trim()
      .replace(/µ|μ/g, "u")
      .replace(/Ω|ohm|ohms/gi, "Ohm")
      .replace(/°/g, "");
    if (s === "MOHM" || s === "MOhm") return "MOhm";
    if (s === "kOhm" || s === "KOhm") return "kOhm";
    if (s === "mOhm") return "mOhm";
    if (s === "Ohm") return "Ohm";
    if (s === "seconds" || s === "second") return "s";
    if (s === "percent") return "%";
    return s;
  }

  function parseNumericAnswer(raw) {
    const s = String(raw ?? "").trim().replace(/,/g, "");
    const m = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*(.*)$/.exec(s);
    if (!m) return null;
    const val = Number(m[1]);
    if (!Number.isFinite(val)) return null;
    return { val, unit: normalizeUnitToken(m[2]) };
  }

  function gradeNumber(q, raw) {
    const parsed = parseNumericAnswer(raw);
    if (!parsed) {
      return { ok: false, reason: "Enter a finite number (e.g. 12.5 or 12.5 " + q.unit + ")." };
    }
    const expUnitNorm = normalizeUnitToken(q.unit);
    const expMeta = UNIT_SCALE[expUnitNorm] || { family: expUnitNorm, scale: 1 };
    let studentVal = parsed.val;
    if (parsed.unit) {
      const gotMeta = UNIT_SCALE[parsed.unit];
      if (!gotMeta || gotMeta.family !== expMeta.family) {
        return {
          ok: false,
          reason: `Unit "${parsed.unit}" does not match expected unit "${q.unit}". Convert or enter numeric value in ${q.unit}.`
        };
      }
      studentVal = parsed.val * (gotMeta.scale / expMeta.scale);
    }
    const expected = Number(q.expected);
    const tol = Math.max(Math.abs(expected) * 0.015, Math.pow(10, -(q.dec ?? 3)) * 1.5, 1e-9);
    const diff = Math.abs(studentVal - expected);
    if (diff <= tol) {
      return {
        ok: true,
        studentVal,
        reason: `Exact match! ${parsed.val}${parsed.unit ? " " + parsed.unit : " " + q.unit} sits squarely within tolerance around ${q.expected} ${q.unit}.`
      };
    }
    return {
      ok: false,
      studentVal,
      reason: `Got ${Number(studentVal.toPrecision(5))} ${q.unit}, expected ${q.expected} ${q.unit}. Check unit prefixes and formula substitution in 3 · Baby Steps.`
    };
  }

  function gradeText(q, text) {
    const clean = String(text || "").trim().toLowerCase();
    const keywords = Array.isArray(q.rubricKeywords) ? q.rubricKeywords : [];
    const matched = [];
    const missed = [];
    for (const kw of keywords) {
      const toks = kw.toLowerCase().split(/[\s\/(),+<>=-]+/).filter(w => w.length >= 3);
      const hit = clean.includes(kw.toLowerCase()) ||
        (toks.length > 0 && toks.filter(w => clean.includes(w)).length >= Math.ceil(toks.length * 0.55));
      if (hit) matched.push(kw);
      else missed.push(kw);
    }
    const wordCount = clean ? clean.split(/\s+/).length : 0;
    const minNeed = Math.max(1, Math.ceil(keywords.length * 0.45));
    const ok = matched.length >= minNeed && wordCount >= 8;
    return {
      ok,
      matched,
      missed,
      reason: ok
        ? `Strong explanation (${matched.length}/${keywords.length} key technical concepts covered cleanly). Compare with the full NVIDIA SLT model answer below.`
        : `Include concrete technical mechanisms & measurements (${matched.length}/${keywords.length} key points matched; aim for ${minNeed}+ concepts and >= 8 words). Missing cues: ${missed.slice(0, 3).join(", ")}.`
    };
  }

  function interpolateTpl(tpl, vars) {
    return String(tpl || "").replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, k) => (k in vars ? String(vars[k]) : ""));
  }

  function roundVal(val, dec = 3) {
    const f = Math.pow(10, dec);
    return Math.round((val + Number.EPSILON) * f) / f;
  }

  function rerollVariant(q, seedOverride) {
    if (!q || q.kind !== "calc" || !q.variantSpec) return q;
    const spec = q.variantSpec;
    const vars = {};
    let attempt = 0;
    let computed = NaN;
    while (attempt < 12) {
      attempt++;
      for (const f of spec.fields) {
        if (f.step === 0 || f.max === f.min) {
          vars[f.k] = f.min;
          continue;
        }
        const nSteps = Math.max(1, Math.round((f.max - f.min) / f.step));
        const r = seedOverride != null ? (((seedOverride + attempt * 31) % (nSteps + 1)) / (nSteps + 1)) : Math.random();
        const idx = Math.min(nSteps, Math.floor(r * (nSteps + 1)));
        vars[f.k] = roundVal(f.min + idx * f.step, f.dec != null ? f.dec : 4);
      }
      // Avoid repeating identical base values accidentally on first try
      const sameAsCurrent = Object.keys(vars).every(k => Number(vars[k]) === Number((q._activeVars || spec.base)[k]));
      if (sameAsCurrent && attempt < 5) continue;
      const fn = new Function(...Object.keys(vars), `"use strict"; return (${spec.calcExpr});`);
      computed = fn(...Object.values(vars));
      if (Number.isFinite(computed)) break;
    }
    const dec = spec.dec != null ? spec.dec : 3;
    const expected = roundVal(computed, dec);
    const rich = { ...vars, ans: expected };
    const clone = { ...q };
    clone._activeVars = vars;
    clone.expected = expected;
    clone.question = interpolateTpl(spec.qTpl, rich);
    clone.lesson = interpolateTpl(spec.lessonTpl, rich);
    clone.sub = interpolateTpl(spec.subTpl, rich);
    clone.steps = spec.stepsTpl.map(s => interpolateTpl(s, rich));
    clone.modelAnswer = `${expected} ${q.unit}`;
    return clone;
  }

  function stepsForQuestion(q) {
    return Array.isArray(q && q.steps) ? q.steps : [];
  }

  function getTopics() {
    return Array.isArray(global.NVIDIA_SLT_TOPICS) ? global.NVIDIA_SLT_TOPICS : [];
  }

  function getQuestionCount() {
    const q = global.NVIDIA_SLT_PREP_QUESTIONS || global.NVIDIA_SLT_QUESTIONS;
    return Array.isArray(q) ? q.length : 0;
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function shortTxt(s, max = 38) {
    const t = String(s || "").trim();
    return t.length <= max ? t : t.slice(0, max - 1) + "…";
  }

  function fmtMath(expr, block = false) {
    if (!expr) return "";
    if (typeof global.studyMath === "function") return global.studyMath(expr, block);
    return `<code>${esc(expr)}</code>`;
  }

  function fmtTextMath(text) {
    const s = String(text || "");
    if (typeof global.studyMathText === "function") return global.studyMathText(s);
    return esc(s);
  }

  // ==================== 17-DOMAIN 3-PANEL BESPOKE SVG RENDERER ====================
  function svgShell(title, subtitle, bodySvg, accent = "#15803d") {
    return `<svg viewBox="0 0 420 220" width="100%" height="220" role="img" aria-label="${esc(title)}" xmlns="http://www.w3.org/2000/svg" style="background:#f8fbf9;border-radius:8px;border:1px solid #d5e5dc;font-family:system-ui,-apple-system,sans-serif">
      <rect x="0" y="0" width="420" height="30" rx="6" fill="#0f2f21"/>
      <text x="12" y="19" fill="#ecfdf5" font-size="11.5" font-weight="700">${esc(shortTxt(title, 52))}</text>
      <text x="408" y="19" fill="#86efac" font-size="10" text-anchor="end">${esc(shortTxt(subtitle, 24))}</text>
      <line x1="0" y1="30" x2="420" y2="30" stroke="${accent}" stroke-width="2"/>
      ${bodySvg}
    </svg>`;
  }

  function box(x, y, w, h, title, sub = "", fill = "#ffffff", stroke = "#15803d") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>
      <text x="${x + w / 2}" y="${y + (sub ? h / 2 - 2 : h / 2 + 4)}" text-anchor="middle" fill="#0f291e" font-size="11" font-weight="700">${esc(shortTxt(title, 26))}</text>
      ${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" fill="#3f6253" font-size="9.5">${esc(shortTxt(sub, 30))}</text>` : ""}`;
  }

  function arrow(x1, y1, x2, y2, label = "", col = "#0f766e") {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2"/>
      <circle cx="${x2}" cy="${y2}" r="3.2" fill="${col}"/>
      ${label ? `<text x="${mx}" y="${my - 5}" text-anchor="middle" fill="#134e4a" font-size="9" font-weight="700">${esc(shortTxt(label, 20))}</text>` : ""}`;
  }

  function panelTag(q) {
    const p = (q && q.visualParams) || {};
    const hi = p.highlight || p.setup || p.mode || p.workloads || q.formula || q.skillName || "";
    const flt = p.fault || p.target || q.unit || q.level || "";
    return {
      qid: (q && q.id) ? String(q.id).toUpperCase() : "SLT-CARD",
      skill: shortTxt((q && q.skillName) || (q && q.q) || "NVIDIA SLT Domain", 46),
      hi: shortTxt(hi, 48),
      flt: shortTxt(flt, 46)
    };
  }

  function renderVisual(q, panelIdx = 0) {
    const idx = Number(panelIdx) || 0;
    const kind = (q && q.visualKind) || "bench-arch";
    const info = panelTag(q);

    if (idx === 1) {
      // PANEL 2: Quantitative Waveform / Shmoo / Eye / Protocol Timing View
      if (kind === "si-pi-droop" || kind === "power-seq" || kind === "kelvin-shunt") {
        const body = `
          <text x="16" y="50" fill="#14532d" font-size="11" font-weight="700">Transient Wave / Rail Trajectory — ${esc(info.qid)}</text>
          <path d="M 30 90 L 115 90 L 130 165 L 152 130 L 175 152 L 200 105 L 385 95" fill="none" stroke="#dc2626" stroke-width="2.6"/>
          <path d="M 30 90 L 390 90" fill="none" stroke="#16a34a" stroke-dasharray="4 3" stroke-width="1.5"/>
          <line x1="130" y1="90" x2="130" y2="165" stroke="#991b1b" stroke-width="1.5" stroke-dasharray="2 2"/>
          <text x="135" y="182" fill="#991b1b" font-size="10" font-weight="700">Droop / DeltaPeak: ${esc(info.hi)}</text>
          <text x="245" y="79" fill="#166534" font-size="10" font-weight="700">Nominal Target Spec Line</text>
          <rect x="20" y="190" width="380" height="22" rx="5" fill="#fef3c7" stroke="#f59e0b"/>
          <text x="210" y="205" text-anchor="middle" fill="#78350f" font-size="9.5" font-weight="700">Focus: ${esc(info.flt)}</text>`;
        return svgShell("2 · Waveform & Transient Response", info.qid, body, "#dc2626");
      }
      if (kind === "smv2d-eye" || kind === "usb3-lfps" || kind === "ddr-init" || kind === "cold-zqcal") {
        const body = `
          <text x="16" y="48" fill="#14532d" font-size="11" font-weight="700">2D Eye / Shmoo Pass-Fail Margin — ${esc(info.qid)}</text>
          <path d="M 40 165 Q 210 35 380 165 Q 210 105 40 165 Z" fill="#bbf7d0" fill-opacity="0.55" stroke="#15803d" stroke-width="2"/>
          <path d="M 40 70 Q 210 200 380 70" fill="none" stroke="#0284c7" stroke-width="2.2"/>
          <path d="M 40 165 Q 210 40 380 165" fill="none" stroke="#0284c7" stroke-width="2.2"/>
          <circle cx="210" cy="118" r="5" fill="#15803d"/>
          <text x="210" y="106" text-anchor="middle" fill="#0f291e" font-size="10" font-weight="700">Sample Point (Vref, UI)</text>
          <rect x="16" y="182" width="388" height="28" rx="6" fill="#ecfdf5" stroke="#86efac"/>
          <text x="210" y="199" text-anchor="middle" fill="#14532d" font-size="9.5" font-weight="700">${esc(info.hi)}</text>`;
        return svgShell("2 · Shmoo / 2D Data Eye Window", info.qid, body, "#0284c7");
      }
      if (kind === "setup-hold" || kind === "rgmii-delay" || kind === "i2c-wave" || kind === "scope-specs") {
        const body = `
          <text x="16" y="48" fill="#14532d" font-size="11" font-weight="700">Clock-Data Edge Window — ${esc(info.qid)}</text>
          <path d="M 28 92 L 100 92 L 108 58 L 210 58 L 218 92 L 388 92" fill="none" stroke="#0f766e" stroke-width="2.3"/>
          <text x="32" y="75" fill="#0f766e" font-size="10" font-weight="700">CLK / SCL</text>
          <path d="M 28 152 L 85 152 L 95 118 L 270 118 L 280 152 L 388 152" fill="none" stroke="#7c3aed" stroke-width="2.3"/>
          <rect x="180" y="55" width="30" height="100" fill="#fef08a" fill-opacity="0.55" stroke="#ca8a04" stroke-dasharray="3 2"/>
          <rect x="210" y="55" width="26" height="100" fill="#fed7aa" fill-opacity="0.55" stroke="#ea580c" stroke-dasharray="3 2"/>
          <text x="195" y="170" text-anchor="middle" fill="#854d0e" font-size="9" font-weight="700">t_su</text>
          <text x="223" y="170" text-anchor="middle" fill="#9a3412" font-size="9" font-weight="700">t_hold</text>
          <rect x="18" y="182" width="384" height="28" rx="6" fill="#eff6ff" stroke="#93c5fd"/>
          <text x="210" y="199" text-anchor="middle" fill="#1e3a8a" font-size="9.5" font-weight="700">${esc(info.hi)}</text>`;
        return svgShell("2 · Setup / Hold & Sampling Timing", info.qid, body, "#7c3aed");
      }
      // Generic Panel 2 for pcie-ltssm, soc-blocks, dram-charge, bench-arch, ate-dft-slt
      const body = `
        <text x="16" y="48" fill="#14532d" font-size="11" font-weight="700">Execution State / Pipeline — ${esc(info.qid)}</text>
        ${box(16, 62, 112, 46, "State 1: Init", "Reset / Bias Check", "#f0fdf4", "#16a34a")}
        ${box(154, 62, 112, 46, "State 2: Train", "Margin / Link / Cal", "#eff6ff", "#2563eb")}
        ${box(292, 62, 112, 46, "State 3: Stress", "P0 / DVFS / Verify", "#fef3c7", "#d97706")}
        ${arrow(128, 85, 154, 85)}
        ${arrow(266, 85, 292, 85)}
        <rect x="16" y="128" width="388" height="76" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
        <text x="28" y="149" fill="#0f291e" font-size="10.5" font-weight="700">Active Diagnostic Focus: ${esc(info.hi)}</text>
        <text x="28" y="169" fill="#dc2626" font-size="10" font-weight="700">Primary Escape / Risk: ${esc(info.flt)}</text>
        <text x="28" y="189" fill="#475569" font-size="9.5">Gate PASS on zero fatal AER/ECC/droop flags & performance SLA window</text>`;
      return svgShell("2 · State Progression & Stress Gate", info.qid, body, "#0284c7");
    }

    if (idx === 2) {
      // PANEL 3: Bench Probing, Fix Verification & Root-Cause Matrix
      const body = `
        <text x="16" y="48" fill="#0f4c2e" font-size="11" font-weight="700">Bench Verification & A-B-A Isolation — ${esc(info.qid)}</text>
        ${box(16, 60, 120, 58, "Step A: Instrument", kind === "kelvin-shunt" ? "4-Wire Kelvin" : "<5mm Ground Spring", "#ecfdf5", "#15803d")}
        ${box(150, 60, 120, 58, "Step B: Control", "A-B-A Swap + Golden", "#f0f9ff", "#0284c7")}
        ${box(284, 60, 120, 58, "Step C: Closure", "Verify Fix + Poka-Yoke", "#f5f3ff", "#7c3aed")}
        ${arrow(136, 89, 150, 89)}
        ${arrow(270, 89, 284, 89)}
        <rect x="16" y="132" width="388" height="74" rx="8" fill="#ffffff" stroke="#bbf7d0"/>
        <text x="26" y="152" fill="#14532d" font-size="10" font-weight="700">Skill Target: ${esc(info.skill)}</text>
        <text x="26" y="171" fill="#334155" font-size="9.5">Check Condition: ${esc(info.hi)}</text>
        <text x="26" y="190" fill="#9a3412" font-size="9.5">Watch Trap / Fault: ${esc(info.flt)}</text>`;
      return svgShell("3 · Lab Fixture Verification & RCA Fix", info.qid, body, "#7c3aed");
    }

    // PANEL 1 (idx === 0): Tailored Hardware / Signal Topology Schematic per visualKind
    const topoMap = {
      "si-pi-droop": () => `
        ${box(16, 56, 86, 54, "VRM + Bulk", "LLC Load-Line", "#ecfdf5", "#15803d")}
        ${box(144, 56, 114, 54, "PKG L_pkg + C_die", "dI/dt Inductive", "#fff7ed", "#ea580c")}
        ${box(300, 56, 104, 54, "GPU Core Array", "VDD_CPU2 / SOC", "#f0f9ff", "#0284c7")}
        ${arrow(102, 83, 144, 83, "PCB Z")}
        ${arrow(258, 83, 300, 83, "I*dI/dt")}
        <rect x="16" y="128" width="388" height="76" rx="8" fill="#fff" stroke="#cbd5e1"/>
        <text x="26" y="148" fill="#0f291e" font-size="10.5" font-weight="700">PDN Droop Model — ${esc(info.skill)}</text>
        <text x="26" y="168" fill="#15803d" font-size="10">${esc(info.hi)}</text>
        <text x="26" y="188" fill="#b91c1c" font-size="9.5">Failure Mode: ${esc(info.flt)}</text>`,
      "diff-vs-se": () => `
        ${box(16, 52, 92, 56, "TX Driver", "Diff Vp / Vn", "#ecfdf5", "#15803d")}
        <line x1="108" y1="68" x2="294" y2="68" stroke="#0284c7" stroke-width="2.2"/>
        <line x1="108" y1="92" x2="294" y2="92" stroke="#7c3aed" stroke-width="2.2"/>
        <text x="201" y="61" text-anchor="middle" fill="#0369a1" font-size="9.5" font-weight="700">TX_P (+)</text>
        <text x="201" y="106" text-anchor="middle" fill="#6d28d9" font-size="9.5" font-weight="700">TX_N (-)  |  Z_diff = 85-100 Ohm</text>
        ${box(294, 52, 110, 56, "Diff RX", "V_diff = Vp - Vn", "#eff6ff", "#2563eb")}
        <rect x="16" y="126" width="388" height="78" rx="8" fill="#fff" stroke="#cbd5e1"/>
        <text x="26" y="147" fill="#0f291e" font-size="10.5" font-weight="700">${esc(info.skill)}</text>
        <text x="26" y="167" fill="#15803d" font-size="10">${esc(info.hi)}</text>
        <text x="26" y="187" fill="#9a3412" font-size="9.5">Hazard: ${esc(info.flt)}</text>`,
      "pcie-ltssm": () => `
        ${box(16, 52, 95, 58, "Root Complex", "100 MHz REFCLK", "#ecfdf5", "#15803d")}
        ${box(150, 52, 118, 58, "AC Caps + Socket", "Gen5 32 GT/s / Eq", "#fef3c7", "#d97706")}
        ${box(306, 52, 98, 58, "NVIDIA GPU", "EP LTSSM -> L0", "#eff6ff", "#1d4ed8")}
        ${arrow(111, 74, 150, 74, "TX")}
        ${arrow(268, 74, 306, 74, "RX")}
        ${arrow(306, 95, 111, 95, "PERST# / Feedback", "#64748b")}
        <rect x="16" y="128" width="388" height="76" rx="8" fill="#fff" stroke="#cbd5e1"/>
        <text x="26" y="148" fill="#0f291e" font-size="10.5" font-weight="700">PCIe Physical Link — ${esc(info.skill)}</text>
        <text x="26" y="168" fill="#0f766e" font-size="10">${esc(info.hi)}</text>
        <text x="26" y="188" fill="#b91c1c" font-size="9.5">Fault Trigger: ${esc(info.flt)}</text>`,
      "ddr-init": () => `
        ${box(16, 54, 108, 54, "SoC Mem Ctrl", "MRC + PHY Training", "#ecfdf5", "#15803d")}
        ${box(158, 54, 104, 54, "CK Fly-By + DQ", "Vref / ZQCal 240", "#f0f9ff", "#0284c7")}
        ${box(296, 54, 108, 54, "DRAM / HBM3", "1T1C + MR4 + ECC", "#f5f3ff", "#7c3aed")}
        ${arrow(124, 81, 158, 81, "CA/DQS")}
        ${arrow(262, 81, 296, 81, "Odt/Pin")}
        <rect x="16" y="126" width="388" height="78" rx="8" fill="#fff" stroke="#cbd5e1"/>
        <text x="26" y="146" fill="#0f291e" font-size="10.5" font-weight="700">Memory Topology — ${esc(info.skill)}</text>
        <text x="26" y="166" fill="#15803d" font-size="10">${esc(info.hi)}</text>
        <text x="26" y="186" fill="#9a3412" font-size="9.5">Check Fault: ${esc(info.flt)}</text>`,
      "kelvin-shunt": () => `
        ${box(16, 52, 88, 56, "PSU / SMU", "Force +I / -I", "#ecfdf5", "#15803d")}
        ${box(144, 52, 130, 56, "Socket / Pogo Array", "Separate +S / -S", "#fff7ed", "#ea580c")}
        ${box(312, 52, 92, 56, "BGA Package", "True DieSense", "#eff6ff", "#1d4ed8")}
        ${arrow(104, 70, 144, 70, "Force")}
        ${arrow(274, 70, 312, 70)}
        ${arrow(312, 96, 104, 96, "High-Z Kelvin Sense", "#7c3aed")}
        <rect x="16" y="126" width="388" height="78" rx="8" fill="#fff" stroke="#cbd5e1"/>
        <text x="26" y="146" fill="#0f291e" font-size="10.5" font-weight="700">4-Wire Kelvin & Contactor — ${esc(info.skill)}</text>
        <text x="26" y="166" fill="#15803d" font-size="10">${esc(info.hi)}</text>
        <text x="26" y="186" fill="#b91c1c" font-size="9.5">Fault Risk: ${esc(info.flt)}</text>`
    };

    const builder = topoMap[kind] || (() => `
      ${box(16, 52, 114, 56, "Host / ATE / Control", "PyVISA / Linux / 93K", "#ecfdf5", "#15803d")}
      ${box(154, 52, 114, 56, "Thermal & Fixture", "Chroma / Socket / CLK", "#fef3c7", "#d97706")}
      ${box(292, 52, 112, 56, "DUT SoC / GPU", "DVFS / JTAG / BIST", "#eff6ff", "#1d4ed8")}
      ${arrow(130, 80, 154, 80)}
      ${arrow(268, 80, 292, 80)}
      <rect x="16" y="126" width="388" height="78" rx="8" fill="#fff" stroke="#cbd5e1"/>
      <text x="26" y="146" fill="#0f291e" font-size="10.5" font-weight="700">${esc(info.skill)}</text>
      <text x="26" y="166" fill="#0f766e" font-size="10">${esc(info.hi)}</text>
      <text x="26" y="186" fill="#9a3412" font-size="9.5">${esc(info.flt)}</text>`);

    return svgShell("1 · Architecture & Circuit Wiring", info.qid, builder(), "#15803d");
  }

  // ==================== STATE, PERSISTENCE & MOUNTABLE WORKBOOK UI ====================
  function loadState() {
    const def = {
      subMode: "workbook", // "workbook" | "master" | "hub"
      topicId: "si-pi",
      qIndex: 1,
      pageTab: 1, // 1=Understand, 2=3-Panel Visuals, 3=Baby Steps, 4=Try It
      done: {},
      retry: {},
      deckSection: "all",
      deckSearch: "",
      deckExpanded: false
    };
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return def;
      return { ...def, ...JSON.parse(raw) };
    } catch {
      return def;
    }
  }

  function saveState(st) {
    try {
      if (global.localStorage) global.localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
    } catch { /* ignore storage quota */ }
  }

  function mountNvidiaSltPractice(rootEl) {
    if (!rootEl) return;
    const topics = getTopics();
    const rawQs = global.NVIDIA_SLT_PREP_QUESTIONS || global.NVIDIA_SLT_QUESTIONS;
    const baseQuestions = Array.isArray(rawQs) ? rawQs : [];
    const deck = Array.isArray(global.NVIDIA_SLT_MASTER_DECK) ? global.NVIDIA_SLT_MASTER_DECK : [];
    const meta = global.NVIDIA_SLT_META || {};

    if (!topics.length || !baseQuestions.length) {
      rootEl.innerHTML = "<p class='nv-feedback'>NVIDIA SLT Workbook data failed to load. Check nvidia_slt_data.js.</p>";
      return;
    }

    const st = loadState();
    const activeVariants = new Map();
    const userAnswers = new Map();
    const feedbackMap = new Map();

    function getActiveQuestion() {
      const list = baseQuestions.filter(q => q.topic === st.topicId);
      const qBase = list.find(q => q.index === st.qIndex) || list[0] || baseQuestions[0];
      return activeVariants.get(qBase.id) || qBase;
    }

    function doneCount(topicId) {
      return baseQuestions.filter(q => (!topicId || q.topic === topicId) && st.done[q.id]).length;
    }

    function renderWorkbook(q, list) {
      const topicObj = topics.find(t => t.id === q.topic) || topics[0];
      const steps = stepsForQuestion(q);
      const fb = feedbackMap.get(q.id);
      const savedAns = userAnswers.get(q.id) || "";

      const pageHtml = (() => {
        if (st.pageTab === 2) {
          return `
            <div class="nv-q-banner">
              <div class="nv-q-meta"><span>3-Panel Visual Breakdown</span><span>${esc(q.id)}</span><span>${esc(q.visualKind)}</span></div>
              <div class="nv-q-title">${esc(q.skillName)}</div>
            </div>
            <div class="nv-vis-grid">
              <div class="nv-vis-card"><header>Panel 1 · Hardware & Wiring</header><div class="nv-svg-wrap">${renderVisual(q, 0)}</div></div>
              <div class="nv-vis-card"><header>Panel 2 · Waveform / Margin</header><div class="nv-svg-wrap">${renderVisual(q, 1)}</div></div>
              <div class="nv-vis-card"><header>Panel 3 · Probe & A-B-A Fix</header><div class="nv-svg-wrap">${renderVisual(q, 2)}</div></div>
            </div>
            <div class="nv-lesson-box"><strong>Engineering Intuition:</strong> ${fmtTextMath(q.lesson)}</div>`;
        }
        if (st.pageTab === 3) {
          return `
            <div class="nv-q-banner">
              <div class="nv-q-meta"><span>All Worked Baby Steps (${steps.length} Steps)</span><span>${esc(q.id)}</span><span>Zero Shortcuts</span></div>
              <div class="nv-q-title">${esc(q.skillName)}</div>
            </div>
            ${q.formula ? `<div class="nv-formula-box"><div><strong>Governing Equation:</strong></div>${fmtMath(q.formula, true)}${q.sub ? `<div style="margin-top:8px"><strong>Substituted Numbers:</strong> ${fmtMath(q.sub, false)}</div>` : ""}${q.unitConv ? `<div style="margin-top:6px;font-size:12.5px;color:#334155"><strong>Unit Guide:</strong> ${esc(q.unitConv)}</div>` : ""}</div>` : ""}
            <div class="nv-steps-list">
              ${steps.map((s, idx) => `<div class="nv-step-card"><span class="nv-step-num">${idx + 1}</span><div class="nv-step-body">${fmtTextMath(s)}</div></div>`).join("")}
            </div>
            <div class="nv-model-ans"><strong>Target Result / Benchmark Answer:</strong> ${esc(q.modelAnswer)}</div>`;
        }
        if (st.pageTab === 4) {
          return `
            <div class="nv-q-banner">
              <div class="nv-q-meta"><span>Practice & Instant Check</span><span>${esc(q.id)}</span><span>${esc(q.kind === "calc" ? "Numeric + Unit Check" : "Technical Rubric Check")}</span></div>
              <div class="nv-q-title">${esc(q.skillName)}</div>
              <p class="nv-q-prompt">${fmtTextMath(q.question)}</p>
            </div>
            <div class="nv-try-box">
              ${q.kind === "calc"
                ? `<label for="nvAnsInput"><strong>Enter Numeric Answer (unit optional, default <code>${esc(q.unit)}</code>):</strong></label>
                   <div class="nv-input-row">
                     <input id="nvAnsInput" type="text" value="${esc(savedAns)}" placeholder="e.g. ${esc(q.expected)} ${esc(q.unit)}" />
                     <span>${esc(q.unit)}</span>
                     <button type="button" class="nv-btn nv-btn-primary" id="nvCheckBtn">✓ Check Answer</button>
                   </div>`
                : `<label for="nvAnsInput"><strong>Write Your Explanation (address root mechanism, measurements & isolation steps):</strong></label>
                   <textarea id="nvAnsInput" placeholder="Explain root cause, exact lab measurements, and verification steps...">${esc(savedAns)}</textarea>
                   <button type="button" class="nv-btn nv-btn-primary" id="nvCheckBtn">✓ Grade Technical Response</button>`
              }
              ${fb ? `<div class="nv-feedback ${fb.ok ? "pass" : ""}"><strong>${fb.ok ? "PASS" : "CHECK AGAIN"}:</strong> ${esc(fb.reason)}</div>` : ""}
              ${(fb && (fb.ok || st.retry[q.id])) ? `<div class="nv-model-ans"><strong>Verified NVIDIA SLT Model Answer:</strong> ${esc(q.modelAnswer)}</div>` : ""}
            </div>`;
        }
        // Default Tab 1: Understand
        return `
          <div class="nv-q-banner">
            <div class="nv-q-meta"><span>Active Q ${q.index} / 50</span><span>${esc(q.id)}</span><span>${esc(q.level)}</span><span>${esc(q.band)}</span></div>
            <div class="nv-q-title">${esc(q.skillName)}</div>
            <p class="nv-q-prompt">${fmtTextMath(q.question)}</p>
          </div>
          <div class="nv-lesson-box">
            <strong>Learning Objective:</strong> ${esc(q.learningObjective)}<br/>
            <div style="margin-top:6px"><strong>Plain-English Physics & System Intuition:</strong> ${fmtTextMath(q.lesson)}</div>
          </div>
          ${q.formula ? `<div class="nv-formula-box"><strong>Key Equation:</strong> ${fmtMath(q.formula, false)}${q.sub ? ` &nbsp;|&nbsp; <strong>Setup:</strong> ${fmtMath(q.sub, false)}` : ""}</div>` : ""}
          <div class="nv-vis-grid">
            <div class="nv-vis-card"><header>1 · Topology</header><div class="nv-svg-wrap">${renderVisual(q, 0)}</div></div>
            <div class="nv-vis-card"><header>2 · Signal / State</header><div class="nv-svg-wrap">${renderVisual(q, 1)}</div></div>
            <div class="nv-vis-card"><header>3 · Bench Fix</header><div class="nv-svg-wrap">${renderVisual(q, 2)}</div></div>
          </div>`;
      })();

      return `
        <div class="nv-layout">
          <aside class="nv-sidebar" aria-label="NVIDIA SLT Topics">
            <div class="nv-side-title">12 Technical Pillars (600 Qs)</div>
            <div class="nv-topic-list">
              ${topics.map(t => `
                <button type="button" class="nv-topic-btn ${t.id === st.topicId ? "active" : ""}" data-topic="${esc(t.id)}">
                  <span class="t-name">${esc(t.title)}</span>
                  <span class="t-meta"><span>${esc(t.group)}</span><strong>${doneCount(t.id)}/50</strong></span>
                </button>`).join("")}
            </div>
          </aside>
          <div class="nv-main-card">
            <div class="nv-topic-head">
              <h3>${esc(topicObj.title)}</h3>
              <p>${esc(topicObj.goal)}</p>
              <div class="nv-chip-row">${(topicObj.skills || []).map(s => `<span class="nv-chip">${esc(s)}</span>`).join("")}</div>
            </div>
            <div class="nv-q-strip">
              <div class="nv-band-legend">
                <span>Jump Question 1–50:</span>
                <small>1–5 Basics · 6–10 Lab · 11–20 Math · 21–30 Debug · 31–40 Adv Math · 41–50 Capstone</small>
              </div>
              <div class="nv-num-grid">
                ${list.map(item => `
                  <button type="button" class="nv-num-btn ${item.index === q.index ? "active" : ""} ${st.done[item.id] ? "done" : ""} ${st.retry[item.id] && !st.done[item.id] ? "retry" : ""}" data-qidx="${item.index}" title="${esc(item.skillName)}">${item.index}</button>
                `).join("")}
              </div>
            </div>
            <div class="nv-q-toolbar">
              <div class="nv-nav-btns">
                <button type="button" class="nv-btn" id="nvPrevBtn" ${q.index <= 1 ? "disabled" : ""}>← Prev</button>
                <button type="button" class="nv-btn" id="nvNextBtn" ${q.index >= 50 ? "disabled" : ""}>Next →</button>
                ${q.kind === "calc" ? `<button type="button" class="nv-btn nv-btn-dice" id="nvDiceBtn">🎲 Practice New Numbers</button>` : ""}
              </div>
              <span style="font-size:12px;font-weight:700;color:#166534">${esc(q.band)} · Step ${q.index}/50</span>
            </div>
            <div class="nv-subtabs">
              <button type="button" class="nv-subtab ${st.pageTab === 1 ? "active" : ""}" data-ptab="1">1 · Understand</button>
              <button type="button" class="nv-subtab ${st.pageTab === 2 ? "active" : ""}" data-ptab="2">2 · 3-Panel Visuals</button>
              <button type="button" class="nv-subtab ${st.pageTab === 3 ? "active" : ""}" data-ptab="3">3 · Baby Steps (${steps.length})</button>
              <button type="button" class="nv-subtab ${st.pageTab === 4 ? "active" : ""}" data-ptab="4">4 · Try It</button>
            </div>
            <div class="nv-stage">${pageHtml}</div>
          </div>
        </div>`;
    }

    function renderMasterDeck() {
      const sections = [];
      const seenSec = new Set();
      for (const item of deck) {
        if (!seenSec.has(item.section)) {
          seenSec.add(item.section);
          sections.push({ id: item.section, label: item.sectionTitle || item.section });
        }
      }
      const query = st.deckSearch.trim().toLowerCase();
      const filtered = deck.filter(item => {
        if (st.deckSection !== "all" && item.section !== st.deckSection) return false;
        if (!query) return true;
        return [item.q, item.whatISay, item.deepTech, item.code || ""].some(s => String(s).toLowerCase().includes(query));
      });

      return `
        <div class="nv-master-controls">
          <div class="nv-master-top">
            <input id="nvDeckSearch" class="nv-search" type="search" value="${esc(st.deckSearch)}" placeholder="Search all 129 NVIDIA SLT interview Q&As (e.g. ZQCal, 93K, PyVISA, LTSSM, CoWoS, O(N)...)"/>
            <button type="button" class="nv-btn" id="nvToggleExpand">${st.deckExpanded ? "Collapse All" : "Expand All (" + filtered.length + ")"}</button>
          </div>
          <div class="nv-sec-pills">
            <button type="button" class="nv-pill ${st.deckSection === "all" ? "active" : ""}" data-sec="all">All Sections (${deck.length})</button>
            ${sections.map(s => `<button type="button" class="nv-pill ${st.deckSection === s.id ? "active" : ""}" data-sec="${esc(s.id)}">${esc(s.label)}</button>`).join("")}
          </div>
        </div>
        <div class="nv-deck-list">
          ${filtered.map(item => `
            <details class="nv-deck-card" ${st.deckExpanded ? "open" : ""}>
              <summary class="nv-deck-summary">
                <span>${esc(item.q)}</span>
                <span class="nv-chip">${esc(item.sectionTitle || item.section)}</span>
              </summary>
              <div class="nv-deck-body">
                <div class="nv-say-box"><strong>🎤 What You Say Live:</strong><br/>${fmtTextMath(item.whatISay)}</div>
                <div class="nv-tech-box"><strong>🔬 Deep Technical Proof & Physics:</strong><br/>${fmtTextMath(item.deepTech)}</div>
                ${Array.isArray(item.formulas) && item.formulas.length ? `<div class="nv-formula-box"><strong>Formulas:</strong> ${item.formulas.map(f => fmtMath(f, false)).join(" &nbsp;|&nbsp; ")}</div>` : ""}
                ${item.code ? `<div class="nv-code-wrap"><div class="nv-code-head"><span>Reference Code / Command</span><button type="button" class="nv-btn nv-copy-code" data-code="${esc(item.code)}" style="padding:2px 8px;font-size:11px">Copy</button></div><pre style="margin:0;white-space:pre-wrap">${esc(item.code)}</pre></div>` : ""}
                ${Array.isArray(item.babySteps) && item.babySteps.length ? `<p style="margin:8px 0 4px"><strong>Quick Verification Checklist:</strong></p><ul style="margin:0 0 10px;padding-left:20px">${item.babySteps.map(b => `<li>${fmtTextMath(b)}</li>`).join("")}</ul>` : ""}
                <div class="nv-svg-wrap" style="max-width:460px">${renderVisual({ id: item.id, skillName: item.q, visualKind: item.visualKind, formula: (item.formulas || [])[0] }, 0)}</div>
              </div>
            </details>`).join("")}
        </div>`;
    }

    function renderHub() {
      return `
        <div class="nv-hub-grid">
          <div class="nv-hub-card">
            <h3>📄 Job Role & Submission Scope</h3>
            <p style="font-size:14px;line-height:1.6"><strong>Role:</strong> ${esc(meta.roleTitle)}</p>
            <p style="font-size:13px;color:#14532d;background:#ecfdf5;padding:9px 11px;border-radius:8px"><strong>${esc(meta.agencyNote)}</strong></p>
            <p style="font-size:13.5px;line-height:1.6;margin-top:10px">${esc(meta.jdSummary)}</p>
          </div>
          <div class="nv-hub-card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">
              <h3 style="margin:0">📝 Exclusivity Right to Represent (RTR)</h3>
              <button type="button" class="nv-btn nv-btn-primary" id="nvCopyRtrBtn">Copy Verbatim RTR</button>
            </div>
            <pre class="nv-rtr-pre" id="nvRtrPre">${esc(meta.rtrBlock)}</pre>
            <div id="nvRtrCopied" style="font-size:12px;color:#15803d;font-weight:700;margin-top:6px"></div>
          </div>
          <div class="nv-hub-card">
            <h3>⚠️ Strict Contractor Interview Boundaries</h3>
            <div class="nv-warn-box">
              <ul style="margin:0;padding-left:18px">
                ${(meta.contractorBoundaries || []).map(b => `<li style="margin-bottom:6px">${esc(b)}</li>`).join("")}
              </ul>
            </div>
          </div>
          <div class="nv-hub-card">
            <h3>🎯 5-Panelist Strategy Matrix</h3>
            <table class="nv-table">
              <thead><tr><th>Panelist</th><th>Primary Focus</th></tr></thead>
              <tbody>
                ${(meta.panelists || []).map(([p, f]) => `<tr><td><strong>${esc(p)}</strong></td><td>${esc(f)}</td></tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="nv-hub-card" style="margin-top:14px">
          <h3>🚀 Candidate STAR Alignment: NVIDIA JD vs Huy Nguyen Proof Points</h3>
          <table class="nv-table">
            <thead><tr><th>NVIDIA SLT JD Requirement</th><th>Verified Candidate Experience & Metrics</th></tr></thead>
            <tbody>
              ${(meta.candidateProofPoints || []).map(r => `<tr><td><strong>${esc(r.jdReq)}</strong></td><td>${esc(r.proof)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>`;
    }

    function draw() {
      const q = getActiveQuestion();
      const list = baseQuestions.filter(item => item.topic === st.topicId).sort((a, b) => a.index - b.index);
      const totalDone = doneCount();
      const pct = Math.round((totalDone / baseQuestions.length) * 100);

      let modeBody = "";
      if (st.subMode === "master") modeBody = renderMasterDeck();
      else if (st.subMode === "hub") modeBody = renderHub();
      else modeBody = renderWorkbook(q, list);

      rootEl.innerHTML = `
        <div class="nv-wrap">
          <div class="nv-hero">
            <div>
              <h2>🟢 NVIDIA System-Level Test (SLT) Engineering Studio</h2>
              <p>Complete 12-pillar post-silicon preparation workbench tailored to Santa Clara NVIDIA SLT execution: 600 progressive questions (basics -> lab -> math -> debug -> capstone), 129 verbatim master Q&As, and LTTS/Tanisha alignment.</p>
              <div class="nv-hero-badges">
                <span class="nv-badge">12 Topics × 50 Qs = 600 Progressive Problems</span>
                <span class="nv-badge">129 Verbatim Interview Cards</span>
                <span class="nv-badge">240 Randomized Math Drills</span>
              </div>
            </div>
            <div class="nv-hero-stat">
              <strong>${totalDone} / ${baseQuestions.length}</strong>
              <span>Mastered (${pct}%)</span>
            </div>
          </div>
          <div class="nv-mode-bar" role="tablist" aria-label="NVIDIA Prep Sections">
            <button type="button" class="nv-mode-btn ${st.subMode === "workbook" ? "active" : ""}" data-submode="workbook">🎯 50-Question Guided Workbook (600 Qs)</button>
            <button type="button" class="nv-mode-btn ${st.subMode === "master" ? "active" : ""}" data-submode="master">📋 All Verbatim Master Interview Q&A (${deck.length})</button>
            <button type="button" class="nv-mode-btn ${st.subMode === "hub" ? "active" : ""}" data-submode="hub">📄 JD, RTR & Resume Alignment Hub</button>
          </div>
          ${modeBody}
        </div>`;

      bindEvents(q);
    }

    function bindEvents(q) {
      rootEl.querySelectorAll("[data-submode]").forEach(btn => {
        btn.addEventListener("click", () => {
          st.subMode = btn.dataset.submode;
          saveState(st);
          draw();
        });
      });

      rootEl.querySelectorAll("[data-topic]").forEach(btn => {
        btn.addEventListener("click", () => {
          st.topicId = btn.dataset.topic;
          st.qIndex = 1;
          saveState(st);
          draw();
        });
      });

      rootEl.querySelectorAll("[data-qidx]").forEach(btn => {
        btn.addEventListener("click", () => {
          st.qIndex = Number(btn.dataset.qidx);
          saveState(st);
          draw();
        });
      });

      rootEl.querySelectorAll("[data-ptab]").forEach(btn => {
        btn.addEventListener("click", () => {
          st.pageTab = Number(btn.dataset.ptab);
          saveState(st);
          draw();
        });
      });

      const prevBtn = rootEl.querySelector("#nvPrevBtn");
      if (prevBtn) prevBtn.addEventListener("click", () => { if (st.qIndex > 1) { st.qIndex--; saveState(st); draw(); } });
      const nextBtn = rootEl.querySelector("#nvNextBtn");
      if (nextBtn) nextBtn.addEventListener("click", () => { if (st.qIndex < 50) { st.qIndex++; saveState(st); draw(); } });

      const diceBtn = rootEl.querySelector("#nvDiceBtn");
      if (diceBtn) diceBtn.addEventListener("click", () => {
        const rolled = rerollVariant(q);
        activeVariants.set(q.id, rolled);
        userAnswers.delete(q.id);
        feedbackMap.delete(q.id);
        draw();
      });

      const checkBtn = rootEl.querySelector("#nvCheckBtn");
      const ansEl = rootEl.querySelector("#nvAnsInput");
      if (checkBtn && ansEl) {
        const submit = () => {
          userAnswers.set(q.id, ansEl.value);
          const res = q.kind === "calc" ? gradeNumber(q, ansEl.value) : gradeText(q, ansEl.value);
          feedbackMap.set(q.id, res);
          if (res.ok) {
            st.done[q.id] = true;
            delete st.retry[q.id];
          } else {
            st.retry[q.id] = true;
          }
          saveState(st);
          draw();
        };
        checkBtn.addEventListener("click", submit);
        if (ansEl.tagName === "INPUT") {
          ansEl.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); submit(); } });
        }
      }

      const searchEl = rootEl.querySelector("#nvDeckSearch");
      if (searchEl) {
        searchEl.addEventListener("input", () => {
          st.deckSearch = searchEl.value;
          const pos = searchEl.selectionStart;
          draw();
          const refreshed = rootEl.querySelector("#nvDeckSearch");
          if (refreshed) { refreshed.focus(); try { refreshed.setSelectionRange(pos, pos); } catch {} }
        });
      }

      const expBtn = rootEl.querySelector("#nvToggleExpand");
      if (expBtn) expBtn.addEventListener("click", () => { st.deckExpanded = !st.deckExpanded; saveState(st); draw(); });

      rootEl.querySelectorAll("[data-sec]").forEach(btn => {
        btn.addEventListener("click", () => { st.deckSection = btn.dataset.sec; saveState(st); draw(); });
      });

      rootEl.querySelectorAll(".nv-copy-code").forEach(btn => {
        btn.addEventListener("click", () => {
          if (global.navigator && global.navigator.clipboard) global.navigator.clipboard.writeText(btn.dataset.code || "");
          btn.textContent = "Copied!";
          setTimeout(() => { btn.textContent = "Copy"; }, 1400);
        });
      });

      const copyRtr = rootEl.querySelector("#nvCopyRtrBtn");
      if (copyRtr) {
        copyRtr.addEventListener("click", () => {
          if (global.navigator && global.navigator.clipboard) global.navigator.clipboard.writeText(meta.rtrBlock || "");
          const msg = rootEl.querySelector("#nvRtrCopied");
          if (msg) msg.textContent = "✓ Verbatim LTTS/Tanisha RTR copied to clipboard!";
        });
      }
    }

    draw();
  }

  global.mountNvidiaSltPractice = mountNvidiaSltPractice;
  global.nvidiaSltWorkbook = {
    getQuestionCount,
    getTopics,
    stepsForQuestion,
    renderVisual,
    gradeNumber,
    gradeText,
    rerollVariant
  };
})(typeof window !== "undefined" ? window : globalThis);
