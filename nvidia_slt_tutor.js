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

  // ==================== 17-DOMAIN 3-PANEL LABORATORY CALIBRATED SVG RENDERER ====================
  function svgShell(title, subtitle, bodySvg, accent = "#10b981") {
    return `<svg viewBox="0 0 460 250" width="100%" height="250" role="img" aria-label="${esc(title)}" xmlns="http://www.w3.org/2000/svg" style="background:#0b1526;border-radius:10px;border:1px solid #264162;font-family:system-ui,-apple-system,sans-serif">
      <rect x="0" y="0" width="460" height="32" rx="8" fill="#07111e"/>
      <text x="12" y="20" fill="#e2f1ff" font-size="11.5" font-weight="800">${esc(shortTxt(title, 48))}</text>
      <text x="448" y="20" fill="#6ee7b7" font-size="10.5" font-weight="700" text-anchor="end">${esc(shortTxt(subtitle, 24))}</text>
      <line x1="0" y1="32" x2="460" y2="32" stroke="${accent}" stroke-width="2.2"/>
      ${bodySvg}
    </svg>`;
  }

  function labGrid(x0 = 52, y1 = 44, x1 = 438, y0 = 194, cols = 8, rows = 5) {
    let g = `<rect x="${x0}" y="${y1}" width="${x1 - x0}" height="${y0 - y1}" fill="#091322" stroke="#2c496b" stroke-width="1.2"/>`;
    const dx = (x1 - x0) / cols, dy = (y0 - y1) / rows;
    for (let c = 1; c < cols; c++) {
      g += `<line x1="${x0 + c * dx}" y1="${y1}" x2="${x0 + c * dx}" y2="${y0}" stroke="#172c45" stroke-width="1" stroke-dasharray="3 3"/>`;
    }
    for (let r = 1; r < rows; r++) {
      g += `<line x1="${x0}" y1="${y1 + r * dy}" x2="${x1}" y2="${y1 + r * dy}" stroke="#172c45" stroke-width="1" stroke-dasharray="3 3"/>`;
    }
    return g;
  }

  function box(x, y, w, h, title, sub = "", fill = "#122238", stroke = "#38bdf8") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
      <text x="${x + w / 2}" y="${y + (sub ? h / 2 - 2 : h / 2 + 4)}" text-anchor="middle" fill="#f1f5f9" font-size="10.8" font-weight="800">${esc(shortTxt(title, 24))}</text>
      ${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" fill="#93c5fd" font-size="9.2">${esc(shortTxt(sub, 28))}</text>` : ""}`;
  }

  function arrow(x1, y1, x2, y2, label = "", col = "#34d399") {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2"/>
      <polygon points="${x2},${y2} ${x2 - 7},${y2 - 4} ${x2 - 7},${y2 + 4}" fill="${col}" transform="rotate(${Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI} ${x2} ${y2})"/>
      ${label ? `<text x="${mx}" y="${my - 6}" text-anchor="middle" fill="#a7f3d0" font-size="9" font-weight="700">${esc(shortTxt(label, 18))}</text>` : ""}`;
  }

  function panelTag(q) {
    const p = (q && q.visualParams) || {};
    const hi = p.highlight || p.setup || p.mode || p.workloads || q.formula || q.skillName || "";
    const flt = p.fault || p.target || q.unit || q.level || "";
    return {
      qid: (q && q.id) ? String(q.id).toUpperCase() : "SLT-CARD",
      skill: shortTxt((q && q.skillName) || (q && q.q) || "NVIDIA SLT Domain", 46),
      hi: shortTxt(hi, 48),
      flt: shortTxt(flt, 44)
    };
  }

  function renderVisual(q, panelIdx = 0) {
    const idx = Number(panelIdx) || 0;
    const kind = (q && q.visualKind) || "bench-arch";
    const info = panelTag(q);

    if (idx === 1) {
      // PANEL 2: Calibrated Oscilloscope / 2D Eye / Shmoo / Timing Analyzer with 10^(3n) Axes
      if (kind === "si-pi-droop" || kind === "power-seq" || kind === "kelvin-shunt") {
        const body = labGrid(54, 42, 442, 186, 10, 5) + `
          <path d="M 54 74 H 146 L 164 152 Q 186 110 212 136 Q 238 92 275 82 H 442" fill="none" stroke="#38bdf8" stroke-width="2.6"/>
          <path d="M 54 176 H 142 V 146 H 310 V 176 H 442" fill="none" stroke="#f472b6" stroke-width="2.2"/>
          <line x1="54" y1="74" x2="442" y2="74" stroke="#34d399" stroke-dasharray="4 3" stroke-width="1.4"/>
          <line x1="54" y1="138" x2="442" y2="138" stroke="#ef4444" stroke-dasharray="4 3" stroke-width="1.3"/>
          <line x1="164" y1="42" x2="164" y2="186" stroke="#f59e0b" stroke-dasharray="3 2" stroke-width="1.6"/>
          <line x1="275" y1="42" x2="275" y2="186" stroke="#2dd4bf" stroke-dasharray="3 2" stroke-width="1.6"/>
          <text x="48" y="77" text-anchor="end" fill="#6ee7b7" font-size="8.8" font-weight="700">1.0×10⁰V</text>
          <text x="48" y="142" text-anchor="end" fill="#fca5a5" font-size="8.8" font-weight="700">900mV</text>
          <text x="48" y="179" text-anchor="end" fill="#f9a8d4" font-size="8.8" font-weight="700">I_step</text>
          <text x="164" y="199" text-anchor="middle" fill="#fbbf24" font-size="8.8" font-weight="700">A:0ns</text>
          <text x="275" y="199" text-anchor="middle" fill="#5eead4" font-size="8.8" font-weight="700">B:25×10⁻⁹s</text>
          <text x="380" y="199" text-anchor="middle" fill="#94a3b8" font-size="8.8">50×10⁻⁹s</text>
          <text x="172" y="156" fill="#fde047" font-size="9.5" font-weight="800">ΔV = I·R + L·(dI/dt) [${esc(info.hi)}]</text>
          <rect x="16" y="210" width="428" height="30" rx="6" fill="#111e33" stroke="#ef4444"/>
          <text x="230" y="229" text-anchor="middle" fill="#fecaca" font-size="9.5" font-weight="700">CH2 Rail (Blue) vs CH3 1169B Shunt I (Pink) · Fault: ${esc(info.flt)}</text>`;
        return svgShell("2 · Calibrated 4-Ch Scope Transient (10^3n)", info.qid, body, "#f43f5e");
      }
      if (kind === "smv2d-eye" || kind === "usb3-lfps" || kind === "ddr-init" || kind === "cold-zqcal") {
        const body = labGrid(56, 42, 442, 186, 8, 5) + `
          <path d="M 68 156 Q 248 28 426 156 Q 248 92 68 156 Z" fill="#10b981" fill-opacity="0.28" stroke="#34d399" stroke-width="2.2"/>
          <path d="M 68 62 Q 248 192 426 62" fill="none" stroke="#38bdf8" stroke-width="2.2"/>
          <path d="M 68 156 Q 248 34 426 156" fill="none" stroke="#38bdf8" stroke-width="2.2"/>
          <rect x="206" y="88" width="84" height="44" fill="none" stroke="#fbbf24" stroke-width="1.6" stroke-dasharray="4 3"/>
          <circle cx="248" cy="110" r="4.5" fill="#fde047"/>
          <text x="50" y="66" text-anchor="end" fill="#7dd3fc" font-size="8.8">+200mV</text>
          <text x="50" y="114" text-anchor="end" fill="#6ee7b7" font-size="8.8">Vref</text>
          <text x="50" y="162" text-anchor="end" fill="#fda4af" font-size="8.8">-200mV</text>
          <text x="150" y="199" text-anchor="middle" fill="#cbd5e1" font-size="8.8">-0.25 UI</text>
          <text x="248" y="199" text-anchor="middle" fill="#fde047" font-size="8.8" font-weight="700">0 UI (Center)</text>
          <text x="348" y="199" text-anchor="middle" fill="#cbd5e1" font-size="8.8">+0.25 UI</text>
          <rect x="16" y="210" width="428" height="30" rx="6" fill="#0f2537" stroke="#38bdf8"/>
          <text x="230" y="229" text-anchor="middle" fill="#bae6fd" font-size="9.5" font-weight="700">${esc(info.hi)} · Mask: >120×10⁻³ V height & 0.35 UI width</text>`;
        return svgShell("2 · Calibrated 2D Data Eye & Vref Mask", info.qid, body, "#38bdf8");
      }
      if (kind === "dram-charge") {
        // Specific Calibrated 1T1C Bitline Charge-Sharing & Refresh Decay Plot (in 10^3n units!)
        const body = labGrid(56, 42, 442, 186, 8, 5) + `
          <path d="M 56 114 H 138 L 154 96 L 235 62 H 360 L 380 114 H 442" fill="none" stroke="#38bdf8" stroke-width="2.6"/>
          <path d="M 56 172 H 124 V 144 H 340 V 172 H 442" fill="none" stroke="#f472b6" stroke-width="2.2"/>
          <line x1="56" y1="114" x2="442" y2="114" stroke="#94a3b8" stroke-dasharray="4 3"/>
          <text x="50" y="66" text-anchor="end" fill="#7dd3fc" font-size="8.5" font-weight="700">1.10×10⁰V</text>
          <text x="50" y="117" text-anchor="end" fill="#cbd5e1" font-size="8.5">550×10⁻³V</text>
          <text x="50" y="175" text-anchor="end" fill="#f9a8d4" font-size="8.5">WL Gate</text>
          <text x="150" y="86" fill="#fde047" font-size="9" font-weight="800">ΔV_BL ≈ +55×10⁻³ V</text>
          <text x="275" y="78" fill="#34d399" font-size="9" font-weight="800">Sense Amp Restores 1.1V!</text>
          <text x="124" y="199" text-anchor="middle" fill="#f9a8d4" font-size="8.8">ACT (0ns)</text>
          <text x="235" y="199" text-anchor="middle" fill="#6ee7b7" font-size="8.8">tRCD (14×10⁻⁹s)</text>
          <text x="380" y="199" text-anchor="middle" fill="#cbd5e1" font-size="8.8">PRE (tRP)</text>
          <rect x="16" y="210" width="428" height="30" rx="6" fill="#132238" stroke="#34d399"/>
          <text x="230" y="229" text-anchor="middle" fill="#a7f3d0" font-size="9.3" font-weight="700">C_cell=25×10⁻¹⁵ F shares charge onto C_BL=225×10⁻¹⁵ F -> ΔV = 55×10⁻³ V</text>`;
        return svgShell("2 · 1T1C Bitline Charge Share & Restore Waveform", info.qid, body, "#34d399");
      }
      // Calibrated Timing / Setup-Hold / State Progression Graticule
      const body = labGrid(56, 42, 442, 186, 8, 4) + `
        <path d="M 56 88 H 140 L 146 56 H 260 L 266 88 H 380 L 386 56 H 442" fill="none" stroke="#34d399" stroke-width="2.4"/>
        <path d="M 56 146 H 112 L 122 114 H 320 L 330 146 H 442" fill="none" stroke="#a78bfa" stroke-width="2.4"/>
        <rect x="220" y="48" width="40" height="106" fill="#fde047" fill-opacity="0.22" stroke="#eab308" stroke-dasharray="3 2"/>
        <rect x="260" y="48" width="32" height="106" fill="#fb923c" fill-opacity="0.22" stroke="#f97316" stroke-dasharray="3 2"/>
        <text x="50" y="75" text-anchor="end" fill="#6ee7b7" font-size="8.8" font-weight="700">CLK</text>
        <text x="50" y="135" text-anchor="end" fill="#c4b5fd" font-size="8.8" font-weight="700">DATA</text>
        <text x="240" y="168" text-anchor="middle" fill="#fde047" font-size="9" font-weight="800">t_su</text>
        <text x="276" y="168" text-anchor="middle" fill="#fdba74" font-size="9" font-weight="800">t_hold</text>
        <text x="146" y="199" text-anchor="middle" fill="#cbd5e1" font-size="8.5">Launch (0s)</text>
        <text x="260" y="199" text-anchor="middle" fill="#fde047" font-size="8.5" font-weight="700">Capture (T_clk)</text>
        <text x="386" y="199" text-anchor="middle" fill="#cbd5e1" font-size="8.5">Next Edge</text>
        <rect x="16" y="210" width="428" height="30" rx="6" fill="#172038" stroke="#a78bfa"/>
        <text x="230" y="229" text-anchor="middle" fill="#ddd6fe" font-size="9.3" font-weight="700">${esc(info.hi)} · Fault: ${esc(info.flt)}</text>`;
      return svgShell("2 · Timing Window & Clocked Capture Analyzer", info.qid, body, "#a78bfa");
    }

    if (idx === 2) {
      // PANEL 3: Calibrated Bench Isolation, 4W Kelvin & PASS/FAIL/INVALID Decision Tree
      const body = `
        ${box(16, 48, 130, 64, "Step A: Safe Measure", kind === "kelvin-shunt" ? "4W Kelvin (±1e-6 Ω)" : "N7020A + <5mm Gnd", "#0d2b26", "#10b981")}
        ${box(165, 48, 130, 64, "Step B: A-B-A Swap", "1 Variable Only + KGB", "#0f253c", "#38bdf8")}
        ${box(314, 48, 130, 64, "Step C: Guardband", "PASS / FAIL / INVALID", "#231942", "#a78bfa")}
        ${arrow(146, 80, 165, 80)}
        ${arrow(295, 80, 314, 80)}
        <rect x="16" y="128" width="428" height="108" rx="8" fill="#091322" stroke="#334155"/>
        <text x="28" y="150" fill="#6ee7b7" font-size="10.5" font-weight="800">Target Competency: ${esc(info.skill)}</text>
        <text x="28" y="172" fill="#e2e8f0" font-size="9.8">Engineering Spec Check: ${esc(info.hi)}</text>
        <text x="28" y="194" fill="#fca5a5" font-size="9.8" font-weight="700">Trap / False PASS Risk: ${esc(info.flt)}</text>
        <text x="28" y="216" fill="#fde047" font-size="9.2">Evidence Rule: Convert prefixes to 10^(3n) base SI & log raw dmesg/UART BEFORE resetting</text>`;
      return svgShell("3 · Bench Probing, A-B-A Control & Guardband", info.qid, body, "#a78bfa");
    }

    // PANEL 1 (idx === 0): Detailed Component-Level Hardware & Circuit Topology Schematic
    const topoMap = {
      "si-pi-droop": () => `
        ${box(14, 48, 96, 62, "VRM Buck", "12V -> 0.85×10⁰V", "#0f2c24", "#10b981")}
        ${box(142, 48, 152, 62, "PDN: R_dc + L_pkg", "2×10⁻³Ω + 250×10⁻¹²H", "#2e1a12", "#f97316")}
        ${box(326, 48, 120, 62, "GPU Core Array", "C_die=100×10⁻⁶F", "#0f253c", "#38bdf8")}
        ${arrow(110, 79, 142, 79, "I_load")}
        ${arrow(294, 79, 326, 79, "L·dI/dt")}
        <rect x="14" y="128" width="432" height="108" rx="8" fill="#091322" stroke="#334155"/>
        <text x="26" y="150" fill="#38bdf8" font-size="10.5" font-weight="800">PDN Droop Circuit: ΔV = I·R_PDN + L_pkg·(dI/dt)</text>
        <text x="26" y="172" fill="#e2e8f0" font-size="10">${esc(info.hi)}</text>
        <text x="26" y="194" fill="#fca5a5" font-size="9.8">Failure Mode: ${esc(info.flt)}</text>
        <text x="26" y="216" fill="#fde047" font-size="9.2">Probe: Keysight N7020A (±24V offset) on Vdd + 1169B Shunt on I_sense</text>`,
      "dram-charge": () => `
        ${box(14, 48, 118, 66, "1T1C Cell", "C_cell=25×10⁻¹⁵F", "#0f2c24", "#10b981")}
        ${box(164, 48, 126, 66, "Bitline Share", "C_BL=225×10⁻¹⁵F", "#0f253c", "#38bdf8")}
        ${box(322, 48, 124, 66, "Diff Sense Amp", "Gain +80..150mV", "#231942", "#a78bfa")}
        ${arrow(132, 81, 164, 81, "WL ON")}
        ${arrow(290, 81, 322, 81, "ΔV_BL")}
        <rect x="14" y="128" width="432" height="108" rx="8" fill="#091322" stroke="#334155"/>
        <text x="26" y="150" fill="#34d399" font-size="10.5" font-weight="800">1T1C Physics: ΔV_BL = (V_cell − V_PRE) · [C_cell / (C_cell + C_BL)]</text>
        <text x="26" y="172" fill="#e2e8f0" font-size="10">Hierarchy: Channel -> Rank -> Bank Group -> Bank -> Row (ACT) -> Col (RD/WR)</text>
        <text x="26" y="194" fill="#fca5a5" font-size="9.8">Trap / Risk: ${esc(info.flt)}</text>
        <text x="26" y="216" fill="#fde047" font-size="9.2">Contrast: 6T SRAM holds static VDD cross-coupled state (~6× area, 0 refresh)</text>`,
      "diff-vs-se": () => `
        ${box(14, 48, 100, 62, "SerDes TX", "PAM4 / NRZ", "#0f2c24", "#10b981")}
        <line x1="114" y1="68" x2="334" y2="68" stroke="#38bdf8" stroke-width="2.4"/>
        <line x1="114" y1="92" x2="334" y2="92" stroke="#a78bfa" stroke-width="2.4"/>
        <text x="224" y="61" text-anchor="middle" fill="#7dd3fc" font-size="9.5" font-weight="700">TX_P (+100Ω diff pair)</text>
        <text x="224" y="108" text-anchor="middle" fill="#c4b5fd" font-size="9.5" font-weight="700">TX_N (−) · Rejects Common-Mode Noise</text>
        ${box(334, 48, 112, 62, "Diff RX + CTLE", "Vdiff = Vp − Vn", "#0f253c", "#38bdf8")}
        <rect x="14" y="128" width="432" height="108" rx="8" fill="#091322" stroke="#334155"/>
        <text x="26" y="150" fill="#38bdf8" font-size="10.5" font-weight="800">${esc(info.skill)}</text>
        <text x="26" y="172" fill="#e2e8f0" font-size="10">${esc(info.hi)}</text>
        <text x="26" y="194" fill="#fca5a5" font-size="9.8">Hazard: ${esc(info.flt)}</text>
        <text x="26" y="216" fill="#fde047" font-size="9.2">Γ = (Z_L − Z_0)/(Z_L + Z_0) · Never clip single-ended GND to P or N pair!</text>`,
      "pcie-ltssm": () => `
        ${box(14, 48, 108, 62, "Root Complex", "100×10⁶ Hz REFCLK", "#0f2c24", "#10b981")}
        ${box(164, 48, 132, 62, "AC Caps + Socket", "32×10⁹ T/s (Gen5)", "#2e1a12", "#f59e0b")}
        ${box(336, 48, 110, 62, "GPU Endpoint", "LTSSM -> L0", "#0f253c", "#38bdf8")}
        ${arrow(122, 70, 164, 70, "TX")}
        ${arrow(296, 70, 336, 70, "RX")}
        ${arrow(336, 94, 122, 94, "PERST# / AER", "#f472b6")}
        <rect x="14" y="128" width="432" height="108" rx="8" fill="#091322" stroke="#334155"/>
        <text x="26" y="150" fill="#fbbf24" font-size="10.5" font-weight="800">PCIe Physical Link — ${esc(info.skill)}</text>
        <text x="26" y="172" fill="#e2e8f0" font-size="10">${esc(info.hi)}</text>
        <text x="26" y="194" fill="#fca5a5" font-size="9.8">Fault Trigger: ${esc(info.flt)}</text>
        <text x="26" y="216" fill="#fde047" font-size="9.2">Inspect lspci -vvv LnkCap vs LnkSta + dmesg AER replay under traffic</text>`,
      "ddr-init": () => `
        ${box(14, 48, 118, 62, "Mem Controller", "MRC + Vref Cal", "#0f2c24", "#10b981")}
        ${box(170, 48, 120, 62, "DQ / DQS + ZQ", "240×10⁰ Ω RZQ", "#0f253c", "#38bdf8")}
        ${box(326, 48, 120, 62, "DDR5 / HBM3", "MR4 >85°C 2×Ref", "#231942", "#a78bfa")}
        ${arrow(132, 79, 170, 79, "CA/DQS")}
        ${arrow(290, 79, 326, 79, "ODT")}
        <rect x="14" y="128" width="432" height="108" rx="8" fill="#091322" stroke="#334155"/>
        <text x="26" y="150" fill="#38bdf8" font-size="10.5" font-weight="800">Memory Subsystem — ${esc(info.skill)}</text>
        <text x="26" y="172" fill="#e2e8f0" font-size="10">${esc(info.hi)}</text>
        <text x="26" y="194" fill="#fca5a5" font-size="9.8">Check Fault: ${esc(info.flt)}</text>
        <text x="26" y="216" fill="#fde047" font-size="9.2">Wait t_RCD, t_RAS, t_RP (t_RC = t_RAS + t_RP); verify raw EDAC vs summary</text>`,
      "kelvin-shunt": () => `
        ${box(14, 48, 102, 62, "PSU / SMU", "Force +I / −I", "#0f2c24", "#10b981")}
        ${box(156, 48, 146, 62, "Socket / Pogo Pins", "R_lead = 0.24 Ω", "#2e1a12", "#f59e0b")}
        ${box(342, 48, 104, 62, "BGA DieSense", "4W R_true", "#0f253c", "#38bdf8")}
        ${arrow(116, 68, 156, 68, "I_force")}
        ${arrow(302, 68, 342, 68)}
        ${arrow(342, 95, 116, 95, "Hi-Z +S/−S Sense (0 A)", "#f472b6")}
        <rect x="14" y="128" width="432" height="108" rx="8" fill="#091322" stroke="#334155"/>
        <text x="26" y="150" fill="#fbbf24" font-size="10.5" font-weight="800">4-Wire Kelvin Elimination of Lead Drops — ${esc(info.skill)}</text>
        <text x="26" y="172" fill="#e2e8f0" font-size="10">${esc(info.hi)}</text>
        <text x="26" y="194" fill="#fca5a5" font-size="9.8">Fault Risk: ${esc(info.flt)}</text>
        <text x="26" y="216" fill="#fde047" font-size="9.2">Zero current in Sense leads => ΔV_lead = 0 V => Measures milliohm shunt accurately</text>`
    };

    const builder = topoMap[kind] || (() => `
      ${box(14, 48, 126, 62, "Host / ATE / Ctrl", "PyVISA / Linux / 93K", "#0f2c24", "#10b981")}
      ${box(168, 48, 126, 62, "Fixture & Socket", "CLK + VR + Thermal", "#2e1a12", "#f59e0b")}
      ${box(322, 48, 124, 62, "NVIDIA SoC / GPU", "DVFS / JTAG / BIST", "#0f253c", "#38bdf8")}
      ${arrow(140, 79, 168, 79)}
      ${arrow(294, 79, 322, 79)}
      <rect x="14" y="128" width="432" height="108" rx="8" fill="#091322" stroke="#334155"/>
      <text x="26" y="150" fill="#38bdf8" font-size="10.5" font-weight="800">${esc(info.skill)}</text>
      <text x="26" y="172" fill="#e2e8f0" font-size="10">${esc(info.hi)}</text>
      <text x="26" y="194" fill="#fca5a5" font-size="9.8">Watch Trap: ${esc(info.flt)}</text>
      <text x="26" y="216" fill="#fde047" font-size="9.2">Always capture read-only logs & prefix-converted telemetry before reset</text>`);

    return svgShell("1 · Circuit & System Hardware Schematic", info.qid, builder(), "#10b981");
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

      function parseStepItem(rawStr, idx) {
        const str = String(rawStr || "").trim();
        const m = /^Step\s*\d+\s*(?:\(([^)]+)\))?\s*:\s*(.*)$/i.exec(str);
        if (m) {
          return {
            tag: m[1] ? m[1].trim() : `Step ${idx + 1}`,
            body: m[2].trim()
          };
        }
        return { tag: `Verification Step ${idx + 1}`, body: str };
      }

      function inferEngineeringPhysics(qObj) {
        const rawFormula = String(qObj.formula || "").trim();
        const txt = (qObj.id + " " + qObj.question + " " + (qObj.visualKind || "")).toLowerCase();
        // If formula already contains '=' and no '->', use it directly AND add 10^(3n) breakdown
        if (rawFormula.includes("=") && !rawFormula.includes("->")) {
          const engBadge = (qObj.expected !== undefined && typeof global.formatEngineeringMath === "function")
            ? global.formatEngineeringMath(qObj.expected, qObj.unit || "")
            : "";
          const pmeConv = global.PROFESSOR_MASTERY_ENGINE?.buildConversionExplanation?.(qObj.question || "") || "";
          return {
            formula: rawFormula,
            sub: qObj.sub || "",
            engExample: engBadge || (qObj.expected !== undefined ? `${qObj.expected} ${qObj.unit || ""}` : ""),
            prefixNote: pmeConv || qObj.unitConv || "Convert prefixes to 10^(3n) base SI units BEFORE plugging numbers."
          };
        }
        // Concept questions that had arrow strings (e.g. ddr-lpddr-F1 "ACT -> RD/WR -> PRE") get true physical equations + 10^(3n) example!
        if (/1t1c|c_cell|charge sharing|bitline/i.test(txt)) {
          return {
            formula: "ΔV_BL = (V_cell - V_PRE) * (C_cell / (C_cell + C_BL))",
            sub: "(1.10 - 0.55) * (25e-15 / (25e-15 + 225e-15)) = 55.0e-3 V",
            engExample: "C_cell = 25 × 10⁻¹⁵ F (25 fF) · C_BL = 225 × 10⁻¹⁵ F (225 fF) · ΔV_BL = 55.0 × 10⁻³ V (55.0 mV)",
            prefixNote: "1 fF = 10⁻¹⁵ F; ratio C_cell / (C_cell + C_BL) is dimensionless (~0.10), scaling 550 × 10⁻³ V down to 55.0 × 10⁻³ V (55 mV) before sense-amp restoration."
          };
        }
        if (/refresh|trefi|trfc|retention|leakage/i.test(txt)) {
          return {
            formula: "t_REFI_hot = t_REFI_nom / 2",
            sub: "(3.9e-6) / 2 = 1.95e-6 s",
            engExample: "Nominal t_REFI = 3.9 × 10⁻⁶ s (3.9 µs) -> Hot (>85 °C 2×) = 1.95 × 10⁻⁶ s (1.95 µs)",
            prefixNote: "Subthreshold leakage doubles roughly every 10 °C; above 85 °C, MR4 forces refresh interval down from 3.9 µs to 1.95 µs (10⁻⁶ s)."
          };
        }
        if (/droop|pdn|induct|si-pi/i.test(txt)) {
          return {
            formula: "ΔV = I * R_PDN + L_pkg * (dI / dt)",
            sub: "(40 * 2e-3) + (250e-12 * (40 / 20e-9)) = 580e-3 V",
            engExample: "R = 2.0 × 10⁻³ Ω (2 mΩ) · L = 250 × 10⁻¹² H (250 pH) · ΔV = 580 × 10⁻³ V (580 mV)",
            prefixNote: "pH (10⁻¹²) × A / ns (10⁻⁹) yields 10⁻³ V (mV)! Convert all inductances and rise times to 10^(3n) SI first."
          };
        }
        if (/pcie|ltssm|serdes|eye|reflect/i.test(txt)) {
          return {
            formula: "Γ = (Z_L - Z_0) / (Z_L + Z_0)",
            sub: "(100 - 85) / (100 + 85) = 81.1e-3",
            engExample: "Z_0 = 85.0 × 10⁰ Ω · Gen5 UI = 31.25 × 10⁻¹² s (31.25 ps) · Efficiency = 128/130 = 98.46%",
            prefixNote: "At 32 × 10⁹ transfers/s (Gen5), 1 Unit Interval = 1 / (32 × 10⁹) = 31.25 × 10⁻¹² s (31.25 ps)."
          };
        }
        if (/kelvin|shunt|4-wire/i.test(txt)) {
          return {
            formula: "I_load = V_sense / R_shunt",
            sub: "25e-3 / 5e-3 = 5.00e0 A",
            engExample: "V_sense = 25.0 × 10⁻³ V (25 mV) · R_shunt = 5.0 × 10⁻³ Ω (5 mΩ) · I = 5.00 × 10⁰ A",
            prefixNote: "Both milli (10⁻³) prefixes cancel cleanly in the ratio; high-Z Kelvin sense leads carry ~0 A so lead R = 0.24 Ω drops zero error."
          };
        }
        if (/setup|hold|skew|timing|clock/i.test(txt)) {
          return {
            formula: "T_min = t_CQ + t_logic + t_su + t_skew",
            sub: "(950e-12 + 590e-12 + 300e-12 + 750e-12) = 2.59e-9 s",
            engExample: "T_min = 2.59 × 10⁻⁹ s (2.59 ns) => f_max = 386.1 × 10⁶ Hz (386.10 MHz)",
            prefixNote: "Picoseconds (10⁻¹²) convert to megahertz (10⁶ Hz) via 1 / (2.59 × 10⁻⁹) = 386.1 × 10⁶ Hz."
          };
        }
        return {
          formula: "Margin = Spec_limit - (Measured + Uncertainty)",
          sub: "(3.30e0) - (3.18e0 + 20e-3) = 100e-3 V",
          engExample: "Spec Margin = +100 × 10⁻³ V (+100 mV) · Guardband Uncertainty = ±20 × 10⁻³ V",
          prefixNote: global.PROFESSOR_MASTERY_ENGINE?.buildConversionExplanation?.(qObj.question || "") || "Always express telemetry in 10^(3n) base SI engineering units (m, µ, n, p, k, M, G) with explicit uncertainty."
        };
      }

      function renderEngMathPanel(qObj) {
        const eng = inferEngineeringPhysics(qObj);
        return `<div class="nv-formula-box" style="background:#f0f9ff;border-color:#7dd3fc;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
            <strong style="color:#0369a1;">📐 Governing Physics &amp; 10<sup>3n</sup> Engineering Notation Proof (Stacked MathML)</strong>
            <span style="font-size:11.5px;font-weight:700;color:#0f766e;background:#ccfbf1;padding:2px 8px;border-radius:999px;">p=10⁻¹² · n=10⁻⁹ · µ=10⁻⁶ · m=10⁻³ · k=10³ · M=10⁶ · G=10⁹</span>
          </div>
          <div>${fmtMath(eng.formula, true)}</div>
          ${eng.sub ? `<div style="margin-top:8px;"><strong>Worked Substitution (10<sup>3n</sup>):</strong> ${fmtMath(eng.sub, true)}</div>` : ""}
          <div style="margin-top:6px;padding:7px 10px;border-radius:7px;background:#ffffff;border:1px solid #bae6fd;font-size:13px;color:#0f172a;">
            <strong>Engineering Notation Values:</strong> <code>${esc(eng.engExample)}</code>
            <div style="margin-top:3px;font-size:12.5px;color:#334155;">${fmtTextMath(eng.prefixNote)}</div>
          </div>
        </div>`;
      }

      const pageHtml = (() => {
        if (st.pageTab === 2) {
          const spreadHtml = global.PROFESSOR_NOTEBOOK_SPREADS?.renderQuestionNotebookSpread?.(q, topicObj, true) || "";
          return `
            <div class="nv-q-banner">
              <div class="nv-q-meta"><span>3-Panel Visual Breakdown</span><span>${esc(q.id)}</span><span>${esc(q.visualKind)}</span></div>
              <div class="nv-q-title">${esc(q.skillName)}</div>
            </div>
            <div class="nv-vis-grid">
              <div class="nv-vis-card"><header>Panel 1 · Hardware & Wiring</header><div class="nv-svg-wrap">${renderVisual(q, 0)}</div></div>
              <div class="nv-vis-card"><header>Panel 2 · Calibrated Waveform / Margin</header><div class="nv-svg-wrap">${renderVisual(q, 1)}</div></div>
              <div class="nv-vis-card"><header>Panel 3 · Probe & A-B-A Fix</header><div class="nv-svg-wrap">${renderVisual(q, 2)}</div></div>
            </div>
            <div class="nv-lesson-box"><strong>Engineering Intuition:</strong> ${fmtTextMath(q.lesson)}</div>
            ${renderEngMathPanel(q)}
            ${spreadHtml}`;
        }
        if (st.pageTab === 3) {
          const spreadHtml = global.PROFESSOR_NOTEBOOK_SPREADS?.renderQuestionNotebookSpread?.(q, topicObj, true) || "";
          return `
            <div class="nv-q-banner">
              <div class="nv-q-meta"><span>All Worked Baby Steps (${steps.length} Steps)</span><span>${esc(q.id)}</span><span>10^(3n) Engineering Notation</span></div>
              <div class="nv-q-title">${esc(q.skillName)}</div>
            </div>
            ${renderEngMathPanel(q)}
            <div class="nv-steps-list">
              ${steps.map((s, idx) => {
                const parsed = parseStepItem(s, idx);
                return `<div class="nv-step-card"><span class="nv-step-num">${idx + 1}</span><div class="nv-step-body"><strong style="display:block;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:#0f766e;margin-bottom:3px;">STEP ${idx + 1} · ${esc(parsed.tag)}</strong>${fmtTextMath(parsed.body)}</div></div>`;
              }).join("")}
            </div>
            <div class="nv-model-ans"><strong>Target Result / Benchmark Answer:</strong> ${fmtTextMath(q.modelAnswer)}</div>
            ${spreadHtml}`;
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
                ? `<label for="nvAnsInput"><strong>Enter Numeric Answer (10^(3n) unit optional, default <code>${esc(q.unit)}</code>):</strong></label>
                   <div class="nv-input-row">
                     <input id="nvAnsInput" type="text" value="${esc(savedAns)}" placeholder="e.g. ${esc(q.expected)} ${esc(q.unit)}" />
                     <span>${esc(q.unit)}</span>
                     <button type="button" class="nv-btn nv-btn-primary" id="nvCheckBtn">✓ Check Answer</button>
                   </div>`
                : `<label for="nvAnsInput"><strong>Write Your Explanation (address physical mechanism, 10^(3n) quantities & isolation steps):</strong></label>
                   <textarea id="nvAnsInput" placeholder="Explain root cause, exact lab measurements in 10^(3n) SI units, and verification steps...">${esc(savedAns)}</textarea>
                   <button type="button" class="nv-btn nv-btn-primary" id="nvCheckBtn">✓ Grade Technical Response</button>`
              }
              ${fb ? `<div class="nv-feedback ${fb.ok ? "pass" : ""}"><strong>${fb.ok ? "PASS" : "CHECK AGAIN"}:</strong> ${esc(fb.reason)}</div>` : ""}
              ${(fb && (fb.ok || st.retry[q.id])) ? `<div class="nv-model-ans"><strong>Verified NVIDIA SLT Model Answer:</strong> ${fmtTextMath(q.modelAnswer)}</div>` : ""}
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
            <div style="margin-top:6px"><strong>Plain-English Physics &amp; System Intuition:</strong> ${fmtTextMath(q.lesson)}</div>
          </div>
          ${renderEngMathPanel(q)}
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
      if (global.PROFESSOR_NOTEBOOK_SPREADS) {
        global.PROFESSOR_NOTEBOOK_SPREADS.bindNotebookSpreads(rootEl, draw);
      }
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
