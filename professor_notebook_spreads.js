"use strict";
/* Professor High-Density 3-Page Spiral Graph-Paper Notebook Spread Renderer (v2.0 · 2600x1240)
   Upgrades every worked solution across Avionics EE Practice (#avionicsView),
   NVIDIA SLT Engineer (#nvidiaView), and NVIDIA SLT Prep (#nvidia-sltView) into a
   professor-grade 3-page notebook spread with:
   - Calibrated dark-bezel multi-trace oscilloscope / characteristic curve graticules (10^(3n) axes)
   - True component-level schematics (zigzags, diodes, capacitors, coils, DFFs, MUXes, sense amps)
   - Method 1 (Professor Physical/Atomic Lecture) + Method 2 (Uncut 10^(3n) Engineering-Notation Math Proof)
   - Uncut Verification Table + Hardware Design Rationale + Red/Yellow TRAP Box
   - 6 Uncut Baby Steps + Dotted PSEUDOCODE Box + Line-by-Line Commented Verification Code */
(function(){

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function wrapText(str, maxChars) {
  const words = String(str ?? "").replace(/\s+/g, " ").trim().split(" ");
  if (!words.length || !words[0]) return [];
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if (cur.length + 1 + w.length <= maxChars) cur += " " + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function renderLines(lines, x, startY, dy, fill, size, weight, family) {
  const fam = family || "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
  return lines.map((ln, idx) =>
    `<text x="${x}" y="${startY + idx * dy}" font-family="${fam}" font-size="${size}" font-weight="${weight || 600}" fill="${fill}">${esc(ln)}</text>`
  ).join("");
}

/* Helper component symbols for authentic Page 1 schematics */
function symZigH(x1, x2, y, col, label, sub) {
  const n = 6, dx = (x2 - x1) / n;
  let d = `M ${x1 - 12} ${y} L ${x1} ${y}`;
  for (let i = 0; i < n; i++) d += ` L ${x1 + (i + 0.5) * dx} ${y + (i % 2 ? -8 : 8)}`;
  d += ` L ${x2} ${y} L ${x2 + 12} ${y}`;
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round"/>
    <text x="${(x1 + x2) / 2}" y="${y - 12}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${col}">${esc(label)}</text>
    ${sub ? `<text x="${(x1 + x2) / 2}" y="${y + 20}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#475569">${esc(sub)}</text>` : ""}`;
}

function symZigV(x, y1, y2, col, label, sub) {
  const n = 5, dy = (y2 - y1) / n;
  let d = `M ${x} ${y1 - 8} L ${x} ${y1}`;
  for (let i = 0; i < n; i++) d += ` L ${x + (i % 2 ? 8 : -8)} ${y1 + (i + 0.5) * dy}`;
  d += ` L ${x} ${y2} L ${x} ${y2 + 8}`;
  const mid = (y1 + y2) / 2;
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round"/>
    <text x="${x + 14}" y="${mid - 3}" font-size="12.5" font-weight="800" fill="${col}">${esc(label)}</text>
    ${sub ? `<text x="${x + 14}" y="${mid + 14}" font-size="11" font-weight="700" fill="#475569">${esc(sub)}</text>` : ""}`;
}

/* ==================== COMPONENT-LEVEL SCHEMATICS (Page 1 Center Box y=445..645) ==================== */
function drawSchematicByKind(kind, meta) {
  const m = meta || {};
  if (kind === "parallel100") {
    return `
      <circle cx="130" cy="540" r="33" fill="#fef3c7" stroke="#b45309" stroke-width="2.6"/>
      <text x="130" y="536" text-anchor="middle" font-size="13.5" font-weight="800" fill="#92400e">+5.0 V</text>
      <text x="130" y="552" text-anchor="middle" font-size="9.5" font-weight="800" fill="#b45309">1V/2.5A CC</text>
      <path d="M 130 507 V 488 H 750 M 130 573 V 592 H 750" fill="none" stroke="#1e3a8a" stroke-width="3"/>
      <text x="215" y="480" font-size="11.5" font-weight="800" fill="#1e3a8a">+5V_MAIN Node (4W Force/Sense Kelvins)</text>
      ${symZigV(235, 502, 578, "#15803d", "R1=1Ω", "60°C @1V")}
      <path d="M 380 488 V 592" stroke="#dc2626" stroke-width="4"/>
      <rect x="342" y="518" width="76" height="40" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="2.4"/>
      <text x="380" y="536" text-anchor="middle" font-size="12.5" font-weight="800" fill="#991b1b">R14 = 0Ω</text>
      <text x="380" y="552" text-anchor="middle" font-size="11" font-weight="700" fill="#dc2626">SHORT (Hot)</text>
      <path d="M 525 488 V 520 M 525 562 V 592" stroke="#0369a1" stroke-width="2.4" stroke-dasharray="5 3"/>
      <circle cx="525" cy="524" r="4" fill="#fff" stroke="#0369a1" stroke-width="2"/>
      <circle cx="525" cy="558" r="4" fill="#fff" stroke="#0369a1" stroke-width="2"/>
      <text x="536" y="536" font-size="12.5" font-weight="800" fill="#0369a1">R27 = ∞Ω</text>
      <text x="536" y="552" font-size="11" fill="#0284c7">OPEN (25°C IR)</text>
      ${symZigV(680, 502, 578, "#1d4ed8", "R100=1Ω", "Req=10mΩ")}
      <text x="90" y="618" font-size="13.5" font-weight="800" fill="#1d4ed8">Blue: 0.24Ω 2W leads mask 10×10⁻³ Ω! Clear 0Ω shorts via IR+pad-lift BEFORE opens.</text>
    `;
  }
  if (kind === "sta") {
    return `
      <rect x="94" y="482" width="112" height="84" rx="7" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2.5"/>
      <polygon points="94,548 110,556 94,564" fill="none" stroke="#1d4ed8" stroke-width="2"/>
      <text x="150" y="508" text-anchor="middle" font-size="13.5" font-weight="800" fill="#1e3a8a">Launch DFFs</text>
      <text x="150" y="528" text-anchor="middle" font-size="11.5" fill="#1d4ed8">tCQ_min = 300ps</text>
      <text x="150" y="546" text-anchor="middle" font-size="11.5" fill="#1e40af">tCQ_max = 950ps</text>
      <rect x="255" y="472" width="185" height="48" rx="6" fill="#dcfce7" stroke="#15803d" stroke-width="2.4"/>
      <text x="347" y="494" text-anchor="middle" font-size="12.5" font-weight="800" fill="#14532d">Slow Path: AND→OR→D0</text>
      <text x="347" y="511" text-anchor="middle" font-size="11.5" fill="#15803d">t_logic(max) = 590×10⁻¹² s</text>
      <rect x="255" y="534" width="185" height="48" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="2.4"/>
      <text x="347" y="555" text-anchor="middle" font-size="12.5" font-weight="800" fill="#991b1b">Fast Path P4: Q_S→S</text>
      <text x="347" y="572" text-anchor="middle" font-size="11.5" font-weight="700" fill="#dc2626">+ ≥820ps Delay Buf Fix!</text>
      <polygon points="485,482 555,500 555,554 485,572" fill="#fef3c7" stroke="#b45309" stroke-width="2.5"/>
      <text x="520" y="524" text-anchor="middle" font-size="13.5" font-weight="800" fill="#92400e">2:1</text>
      <text x="520" y="542" text-anchor="middle" font-size="12" font-weight="700" fill="#b45309">MUX</text>
      <rect x="605" y="482" width="140" height="84" rx="7" fill="#f3e8ff" stroke="#7e22ce" stroke-width="2.5"/>
      <polygon points="605,548 621,556 605,564" fill="none" stroke="#7e22ce" stroke-width="2"/>
      <text x="675" y="508" text-anchor="middle" font-size="13.5" font-weight="800" fill="#581c87">Capture DFF</text>
      <text x="675" y="528" text-anchor="middle" font-size="11.5" fill="#6b21a8">tsu = 300ps · th = 400ps</text>
      <text x="675" y="546" text-anchor="middle" font-size="11.5" font-weight="700" fill="#dc2626">Skew = 750×10⁻¹² s</text>
      <path d="M 206 496 H 255 M 206 556 H 255 M 440 496 H 485 M 440 558 H 520 V 563 M 555 524 H 605" fill="none" stroke="#0f172a" stroke-width="2.4"/>
      <text x="94" y="618" font-size="13.5" font-weight="800" fill="#dc2626">Red P4 Arrival = 330×10⁻¹² s &lt; Required 1150×10⁻¹² s = −820ps HOLD RACE!</text>
    `;
  }
  if (kind === "rectifier") {
    return `
      <circle cx="130" cy="532" r="28" fill="#fef3c7" stroke="#b45309" stroke-width="2.5"/>
      <text x="130" y="529" text-anchor="middle" font-size="12.5" font-weight="800" fill="#92400e">12 Vrms</text>
      <text x="130" y="545" text-anchor="middle" font-size="11" fill="#b45309">60 Hz AC</text>
      <path d="M 158 518 H 225 M 158 546 H 225" stroke="#1e293b" stroke-width="2.4"/>
      <polygon points="285,478 345,532 285,586 225,532" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.6"/>
      <text x="285" y="526" text-anchor="middle" font-size="13" font-weight="800" fill="#1e40af">Si Bridge</text>
      <text x="285" y="544" text-anchor="middle" font-size="11.5" fill="#dc2626">2×0.7V = 1.4V</text>
      <path d="M 345 496 H 660 M 345 574 H 660 M 475 496 V 525 M 475 541 V 574 M 660 496 V 510 M 660 564 V 574" fill="none" stroke="#0f172a" stroke-width="2.4"/>
      <line x1="455" y1="525" x2="495" y2="525" stroke="#15803d" stroke-width="4"/>
      <line x1="455" y1="541" x2="495" y2="541" stroke="#15803d" stroke-width="4"/>
      <text x="506" y="530" font-size="12.5" font-weight="800" fill="#15803d">C = 1×10⁻³ F</text>
      <text x="506" y="546" font-size="11" fill="#15803d">(1000 µF)</text>
      ${symZigV(660, 512, 562, "#7e22ce", "RL=1×10³Ω", "15.57 Vpk")}
      <text x="94" y="618" font-size="13.5" font-weight="800" fill="#1d4ed8">Blue: 120×10⁰ Hz Ripple -> Vr(pp) = 15.57/(120 × 10³ × 10⁻³) = 129.8×10⁻³ Vpp</text>
    `;
  }
  if (kind === "zener_bjt") {
    return `
      <circle cx="122" cy="532" r="24" fill="#fef3c7" stroke="#b45309" stroke-width="2.4"/>
      <text x="122" y="536" text-anchor="middle" font-size="13" font-weight="800" fill="#92400e">+12 V</text>
      <path d="M 146 532 H 190" stroke="#0f172a" stroke-width="2.4"/>
      ${symZigH(202, 285, 496, "#1d4ed8", "Rs=100Ω", "IT=69×10⁻³ A")}
      <path d="M 146 532 V 496 H 190 M 297 496 H 520 M 122 556 V 582 H 520 M 395 496 V 582" fill="none" stroke="#0f172a" stroke-width="2.4"/>
      <rect x="352" y="516" width="86" height="44" rx="6" fill="#dcfce7" stroke="#15803d" stroke-width="2.4"/>
      <text x="395" y="535" text-anchor="middle" font-size="12" font-weight="800" fill="#14532d">5.1V Zener</text>
      <text x="395" y="551" text-anchor="middle" font-size="11" font-weight="700" fill="#dc2626">IZ = 59 mA</text>
      ${symZigV(520, 506, 572, "#dc2626", "RL=510Ω", "IL=10 mA")}
      <rect x="615" y="486" width="132" height="90" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2.4"/>
      <text x="681" y="510" text-anchor="middle" font-size="12.5" font-weight="800" fill="#991b1b">NPN BJT Check</text>
      <text x="681" y="530" text-anchor="middle" font-size="11.5" fill="#7f1d1d">β·IB = 43 mA</text>
      <text x="681" y="548" text-anchor="middle" font-size="11.5" font-weight="800" fill="#dc2626">ICsat = 9.8 mA</text>
      <text x="681" y="566" text-anchor="middle" font-size="11" font-weight="700" fill="#b91c1c">=> SATURATED!</text>
      <text x="94" y="618" font-size="13.5" font-weight="800" fill="#15803d">KCL Node @ 5.1V: IZ = 69×10⁻³ − 10×10⁻³ = 59.0×10⁻³ A · BJT clamps @ VCE=0.2V</text>
    `;
  }
  if (kind === "bridge_thevenin") {
    return `
      <circle cx="122" cy="532" r="24" fill="#fef3c7" stroke="#b45309" stroke-width="2.4"/>
      <text x="122" y="536" text-anchor="middle" font-size="13" font-weight="800" fill="#92400e">+12 V</text>
      <path d="M 122 508 V 484 H 545 M 122 556 V 586 H 545 M 245 484 V 586 M 445 484 V 586" fill="none" stroke="#0f172a" stroke-width="2.4"/>
      ${symZigV(245, 492, 524, "#1d4ed8", "R1=10k", "")}
      ${symZigV(245, 542, 574, "#1d4ed8", "R3=10k", "VA=6.00V")}
      ${symZigV(445, 492, 524, "#dc2626", "R2=10k", "")}
      ${symZigV(445, 542, 574, "#dc2626", "RT=9k", "VB=5.68V")}
      <path d="M 245 533 H 445" stroke="#15803d" stroke-width="2.2" stroke-dasharray="5 3"/>
      <text x="345" y="527" text-anchor="middle" font-size="11.5" font-weight="800" fill="#15803d">ΔV = +315.8mV</text>
      <rect x="575" y="490" width="168" height="84" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="2.4"/>
      <text x="659" y="516" text-anchor="middle" font-size="12.5" font-weight="800" fill="#14532d">10MΩ DMM Loading</text>
      <text x="659" y="536" text-anchor="middle" font-size="11.5" fill="#15803d">1M ∥ 10M = 909kΩ</text>
      <text x="659" y="556" text-anchor="middle" font-size="11.5" font-weight="800" fill="#dc2626">5.00V -> 4.762 V!</text>
      <text x="94" y="618" font-size="13.5" font-weight="800" fill="#1d4ed8">R_TH = (10k∥10k) + (10k∥9k) = 9.737×10³ Ω · Always model 10×10⁶ Ω DMM load!</text>
    `;
  }
  if (kind === "scope4ch") {
    return `
      <rect x="94" y="484" width="155" height="90" rx="8" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2.4"/>
      <text x="171" y="510" text-anchor="middle" font-size="13" font-weight="800" fill="#1e3a8a">GPU PDN + Step</text>
      <text x="171" y="530" text-anchor="middle" font-size="11.5" fill="#1d4ed8">L = 250×10⁻¹² H</text>
      <text x="171" y="548" text-anchor="middle" font-size="11.5" fill="#1e40af">R = 2.0×10⁻³ Ω</text>
      <text x="171" y="566" text-anchor="middle" font-size="11" font-weight="700" fill="#dc2626">ΔI = 40A / 20×10⁻⁹s</text>
      <rect x="285" y="480" width="235" height="98" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="2.4"/>
      <text x="402" y="503" text-anchor="middle" font-size="12.5" font-weight="800" fill="#14532d">4-Ch Keysight Setup</text>
      <text x="402" y="523" text-anchor="middle" font-size="11.5" fill="#14532d">CH1: Exported CLK (SMA-BNC)</text>
      <text x="402" y="542" text-anchor="middle" font-size="11.5" fill="#14532d">CH2 &amp; CH4: N7020A (±24V off)</text>
      <text x="402" y="561" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f766e">CH3: 1169B Shunt Current</text>
      <rect x="556" y="484" width="192" height="90" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="2.4"/>
      <text x="652" y="510" text-anchor="middle" font-size="12.5" font-weight="800" fill="#92400e">DDR4-3200 / Logs</text>
      <text x="652" y="530" text-anchor="middle" font-size="11.5" fill="#b45309">25.6×10⁹ B/s Peak</text>
      <text x="652" y="548" text-anchor="middle" font-size="11.5" fill="#b45309">tRC = 45.75×10⁻⁹ s</text>
      <text x="652" y="566" text-anchor="middle" font-size="11" font-weight="800" fill="#dc2626">Raw Logs ≠ Summary!</text>
      <path d="M 249 529 H 285 M 520 529 H 556" stroke="#0f172a" stroke-width="2.5"/>
      <text x="94" y="618" font-size="13.5" font-weight="800" fill="#1d4ed8">Blue: ΔV_tot = 80×10⁻³V (IR) + 500×10⁻³V (L·di/dt) = 580×10⁻³ V droop transient</text>
    `;
  }
  const b1 = String(m.b1 || "1. Source / Drive");
  const b2 = String(m.b2 || "2. Circuit / Network");
  const b3 = String(m.b3 || "3. Load / Verifier");
  const c1Text = String(m.c1 || "Blue: Convert units to base SI 10^(3n) first");
  const c2Text = String(m.c2 || "Green: Verify return path, polarity & A-B-A guardband");
  return `
    <rect x="94" y="492" width="175" height="78" rx="8" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2.4"/>
    <text x="181" y="524" text-anchor="middle" font-size="${b1.length > 20 ? 11.2 : 13.5}" font-weight="800" fill="#1e3a8a">${esc(b1)}</text>
    <text x="181" y="548" text-anchor="middle" font-size="11" fill="#1d4ed8">${esc(m.b1Sub || "10^(3n) Input")}</text>
    <path d="M 269 531 H 316" stroke="#0f172a" stroke-width="2.8"/><polygon points="316,525 328,531 316,537" fill="#0f172a"/>
    <rect x="328" y="492" width="190" height="78" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="2.4"/>
    <text x="423" y="524" text-anchor="middle" font-size="${b2.length > 22 ? 11.2 : 13.5}" font-weight="800" fill="#14532d">${esc(b2)}</text>
    <text x="423" y="548" text-anchor="middle" font-size="11" fill="#15803d">${esc(m.b2Sub || "Physical Law")}</text>
    <path d="M 518 531 H 565" stroke="#0f172a" stroke-width="2.8"/><polygon points="565,525 577,531 565,537" fill="#0f172a"/>
    <rect x="577" y="492" width="175" height="78" rx="8" fill="#f3e8ff" stroke="#7e22ce" stroke-width="2.4"/>
    <text x="664" y="524" text-anchor="middle" font-size="${b3.length > 20 ? 11.2 : 13.5}" font-weight="800" fill="#581c87">${esc(b3)}</text>
    <text x="664" y="548" text-anchor="middle" font-size="11" fill="#6b21a8">${esc(m.b3Sub || "Verified Output")}</text>
    <text x="94" y="600" font-size="${c1Text.length > 74 ? 11 : 12.8}" font-weight="700" fill="#1d4ed8">${esc(c1Text)}</text>
    <text x="94" y="622" font-size="${c2Text.length > 74 ? 11 : 12.8}" font-weight="700" fill="#15803d">${esc(c2Text)}</text>
  `;
}

/* ==================== CALIBRATED DARK-BEZEL MULTI-TRACE GRAPHS (Page 1 Bottom y=656..985) ==================== */
function drawCalibratedWaveform(kind, meta) {
  const m = meta || {};
  const x0 = 165, x1 = 768, yTop = 708, yBot = 900;
  // Dark Instrument Graticule Frame
  let grid = `<rect x="88" y="660" width="738" height="316" rx="10" fill="#0a1526" stroke="#334155" stroke-width="2"/>`;
  for (let c = 0; c <= 8; c++) {
    const gx = x0 + (c / 8) * (x1 - x0);
    grid += `<line x1="${gx}" y1="${yTop}" x2="${gx}" y2="${yBot}" stroke="#1e3a5f" stroke-width="1" stroke-dasharray="3 3"/>`;
  }
  for (let r = 0; r <= 4; r++) {
    const gy = yTop + (r / 4) * (yBot - yTop);
    grid += `<line x1="${x0}" y1="${gy}" x2="${x1}" y2="${gy}" stroke="#1e3a5f" stroke-width="1" stroke-dasharray="3 3"/>`;
  }
  grid += `<rect x="${x0}" y="${yTop}" width="${x1 - x0}" height="${yBot - yTop}" fill="none" stroke="#64748b" stroke-width="1.6"/>`;

  if (kind === "sta") {
    return grid + `
      <text x="104" y="688" font-size="14.5" font-weight="800" fill="#7dd3fc">CALIBRATED TIMING GRATICULE (ps = 10⁻¹² s): SETUP vs. HOLD RACE</text>
      <path d="M 165 752 H 265 V 720 H 390 V 752 H 545 V 720 H 670 V 752 H 768" fill="none" stroke="#34d399" stroke-width="2.8"/>
      <path d="M 165 818 H 295 V 786 H 620 V 818 H 768" fill="none" stroke="#38bdf8" stroke-width="2.8"/>
      <path d="M 165 884 H 302 V 852 H 632 V 884 H 768" fill="none" stroke="#f43f5e" stroke-width="2.8"/>
      <rect x="265" y="708" width="90" height="192" fill="#f43f5e" fill-opacity="0.16" stroke="#f43f5e" stroke-dasharray="4 3"/>
      <text x="155" y="742" text-anchor="end" font-size="11.5" font-weight="700" fill="#34d399">CLK</text>
      <text x="155" y="808" text-anchor="end" font-size="11.5" font-weight="700" fill="#38bdf8">Q_S</text>
      <text x="155" y="874" text-anchor="end" font-size="11.5" font-weight="700" fill="#fda4af">MUX_S</text>
      ${[0, 500, 1000, 1500, 2590].map((v, i) => `<text x="${x0 + (i / 4) * (x1 - x0)}" y="920" text-anchor="middle" font-size="10.5" font-weight="700" fill="#cbd5e1">${v}×10⁻¹²s</text>`).join("")}
      <text x="104" y="950" font-size="12.5" font-weight="800" fill="#fda4af">Hold Window (400+750 = 1150ps) violated by P4 arrival (330ps) = −820×10⁻¹² s (Same Clock Edge!)</text>
    `;
  }
  if (kind === "rectifier" || kind === "scope4ch") {
    return grid + `
      <text x="104" y="688" font-size="13.8" font-weight="800" fill="#7dd3fc">${esc(m.waveTitle || "CALIBRATED 4-CHANNEL KEYSIGHT GRATICULE (10^3n)")}</text>
      <path d="M 165 740 H 295 L 330 818 Q 375 768 440 746 H 555 L 590 818 Q 635 768 700 746 H 768" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <path d="M 165 882 H 295 V 846 H 440 V 882 H 555 V 846 H 700 V 882 H 768" fill="none" stroke="#34d399" stroke-width="2.6"/>
      <line x1="295" y1="708" x2="295" y2="900" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4 3"/>
      <line x1="555" y1="708" x2="555" y2="900" stroke="#2dd4bf" stroke-width="2" stroke-dasharray="4 3"/>
      <text x="295" y="704" text-anchor="middle" font-size="10.5" font-weight="800" fill="#fbbf24">Trig A</text>
      <text x="555" y="704" text-anchor="middle" font-size="10.5" font-weight="800" fill="#5eead4">Cursor B</text>
      <text x="155" y="742" text-anchor="end" font-size="10.5" font-weight="700" fill="#7dd3fc">+100%</text>
      <text x="155" y="810" text-anchor="end" font-size="10.5" font-weight="700" fill="#fda4af">Droop ΔV</text>
      <text x="155" y="878" text-anchor="end" font-size="10.5" font-weight="700" fill="#6ee7b7">I_step</text>
      ${["0", "1×T", "2×T", "3×T", "4×T"].map((t, i) => `<text x="${x0 + (i / 4) * (x1 - x0)}" y="920" text-anchor="middle" font-size="10.5" font-weight="700" fill="#cbd5e1">${t}</text>`).join("")}
      <text x="104" y="950" font-size="11.4" font-weight="700" fill="#fde68a">${esc(m.waveNote || "Aligned timebase: Trigger A captures V_dd droop & 1169B I_shunt simultaneous edge")}</text>
    `;
  }
  // Dual-Trace Calibrated Response + Shaded Guardband + Cursors (never single bare line!)
  let curve1 = "", curve2 = "";
  for (let k = 0; k <= 50; k++) {
    const f = k / 50, gx = x0 + f * (x1 - x0);
    const yv = yBot - (yBot - yTop) * 0.85 * (1 - Math.exp(-f * 4.5));
    const yi = yBot - (yBot - yTop) * 0.80 * Math.exp(-f * 3.8);
    curve1 += (k === 0 ? "M" : "L") + gx + " " + yv;
    curve2 += (k === 0 ? "M" : "L") + gx + " " + yi;
  }
  const cxA = x0 + 0.22 * (x1 - x0), cxB = x0 + 0.88 * (x1 - x0);
  const wTitle = String(m.waveTitle || "CALIBRATED DUAL-TRACE RESPONSE ANALYZER (10^3n SI AXES)");
  const wNote = String(m.waveNote || "Cyan: Primary Step/Transfer  |  Pink: Rate/Error  |  Verify 10^(3n) limits at Cursor A & B");
  return grid + `
    <text x="104" y="688" font-size="${wTitle.length > 62 ? 12.4 : 14}" font-weight="800" fill="#7dd3fc">${esc(wTitle)}</text>
    <path d="${curve1}" fill="none" stroke="#38bdf8" stroke-width="3"/>
    <path d="${curve2}" fill="none" stroke="#f472b6" stroke-width="2.4" stroke-dasharray="5 3"/>
    <line x1="${cxA}" y1="${yTop}" x2="${cxA}" y2="${yBot}" stroke="#fbbf24" stroke-width="1.8" stroke-dasharray="4 3"/>
    <line x1="${cxB}" y1="${yTop}" x2="${cxB}" y2="${yBot}" stroke="#34d399" stroke-width="1.8" stroke-dasharray="4 3"/>
    <text x="155" y="${yTop + 14}" text-anchor="end" font-size="10.5" font-weight="700" fill="#7dd3fc">100%</text>
    <text x="155" y="${(yTop + yBot) / 2}" text-anchor="end" font-size="10.5" font-weight="700" fill="#f9a8d4">50%</text>
    <text x="155" y="${yBot}" text-anchor="end" font-size="10.5" font-weight="700" fill="#cbd5e1">0</text>
    ${["0", "1τ (63.2%)", "2τ (86.5%)", "3τ (95%)", "5τ (99.3%)"].map((t, i) => `<text x="${x0 + (i / 4) * (x1 - x0)}" y="920" text-anchor="middle" font-size="10" font-weight="700" fill="#cbd5e1">${t}</text>`).join("")}
    <text x="104" y="950" font-size="${wNote.length > 82 ? 10.6 : 12}" font-weight="700" fill="#fde68a">${esc(wNote)}</text>
  `;
}

/* ==================== MAIN 2600x1240 3-PAGE NOTEBOOK RENDERER ==================== */
function renderNotebookSpreadSVG(spec) {
  const s = spec || {};
  const header = esc(s.header || "ENGINEERING WORKBOOK — 3-PAGE PROFESSOR NOTEBOOK");
  const qLines = wrapText(s.question || "", 72).slice(0, 3);
  const answerPill = esc(s.answer || "Verified Solution");
  const lecLines = wrapText(s.intuition || "", 76).slice(0, 5);
  const mathLines = (Array.isArray(s.mathSteps) ? s.mathSteps : []).slice(0, 8);
  const tbl = s.table || { headers: ["Parameter", "Formula / Model", "Result (10^3n)"], rows: [["1", "Baseline", "OK"]] };
  const rationale = Array.isArray(s.rationale) ? s.rationale.slice(0, 4) : (Array.isArray(s.babySteps) ? s.babySteps.slice(0, 4) : []);
  const trapTitle = esc(s.trapTitle || "★ GOLDEN RULE & EXAM/INTERVIEW TRAP ★");
  const trapLines = wrapText(s.trapBody || "", 74).slice(0, 4);
  const p3Steps = (Array.isArray(s.babySteps) ? s.babySteps : []).slice(0, 6);
  const pseudoLines = (Array.isArray(s.pseudo) ? s.pseudo : []).slice(0, 4);
  const codeLines = (Array.isArray(s.codeLines) ? s.codeLines : []).slice(0, 12);

  const fontMain = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
  const fontMono = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

  const spiralAt = xc => Array.from({ length: 28 }, (_, i) => {
    const y = 70 + i * 40;
    return `<circle cx="${xc - 13}" cy="${y}" r="5" fill="#cbd5e1" stroke="#64748b" stroke-width="1.4"/>
      <circle cx="${xc + 13}" cy="${y}" r="5" fill="#cbd5e1" stroke="#64748b" stroke-width="1.4"/>
      <path d="M ${xc - 14} ${y - 4} Q ${xc} ${y - 11} ${xc + 14} ${y - 4}" fill="none" stroke="#334155" stroke-width="3.2" stroke-linecap="round"/>`;
  }).join("");

  const tblY = 508;
  const colCount = Math.max(2, Math.min(4, (tbl.headers || []).length));
  const colW = Math.floor(736 / colCount);
  const tblHeaders = (tbl.headers || []).slice(0, colCount);
  const tblRows = (tbl.rows || []).slice(0, 4);
  const sid = "nb2_" + Math.random().toString(36).slice(2, 9);

  return `<svg class="nb-spread-svg" viewBox="0 0 2600 1240" role="img" aria-label="${esc(header)}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="${sid}_g" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#d5e4f0" stroke-width="1"/>
      </pattern>
      <linearGradient id="${sid}_d" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c99e6b"/><stop offset="100%" stop-color="#a87948"/>
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="2600" height="1240" fill="url(#${sid}_d)"/>
    <rect x="12" y="210" width="18" height="620" rx="8" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="2"/>
    <rect x="2570" y="250" width="18" height="580" rx="8" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>

    <rect x="50" y="34" width="810" height="1172" rx="10" fill="#fcfaf2" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="895" y="34" width="810" height="1172" rx="10" fill="#fcfaf2" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="1740" y="34" width="810" height="1172" rx="10" fill="#fcfaf2" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="60" y="44" width="790" height="1152" fill="url(#${sid}_g)"/>
    <rect x="905" y="44" width="790" height="1152" fill="url(#${sid}_g)"/>
    <rect x="1750" y="44" width="790" height="1152" fill="url(#${sid}_g)"/>

    ${spiralAt(877)}${spiralAt(1722)}

    <!-- ==================== PAGE 1 (LEFT): LECTURE + SCHEMATIC + CALIBRATED GRATICULE ==================== -->
    <text x="88" y="82" font-family="${fontMain}" font-size="${header.length > 68 ? 16 : 19}" font-weight="800" fill="#0f294a">${header}</text>
    <line x1="88" y1="92" x2="826" y2="92" stroke="#1e3a8a" stroke-width="3"/>

    <text x="88" y="122" font-family="${fontMain}" font-size="16" font-weight="800" fill="#1d4ed8">Question / Target Problem:</text>
    ${renderLines(qLines, 88, 148, 22, "#1e293b", 15.5, 600, fontMain)}

    <rect x="88" y="218" width="738" height="40" rx="20" fill="#fee2e2" stroke="#dc2626" stroke-width="2.6"/>
    <text x="457" y="244" text-anchor="middle" font-family="${fontMain}" font-size="${answerPill.length > 74 ? 13 : 15}" font-weight="800" fill="#991b1b">Answer: ${answerPill}</text>

    <rect x="88" y="272" width="738" height="156" rx="10" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.2"/>
    <text x="106" y="300" font-family="${fontMain}" font-size="16.5" font-weight="800" fill="#1e3a8a">Method 1 · Professor's Physical &amp; Circuit Lecture (Zero Background):</text>
    ${renderLines(lecLines, 106, 326, 22, "#0f172a", 15, 600, fontMain)}

    <text x="88" y="456" font-family="${fontMain}" font-size="17" font-weight="800" fill="#0f294a">Annotated Hardware / Circuit Schematic:</text>
    <rect x="88" y="464" width="738" height="176" rx="10" fill="rgba(255,255,255,0.86)" stroke="#94a3b8" stroke-width="1.5"/>
    ${drawSchematicByKind(s.schKind || "generic", s.schMeta)}

    ${drawCalibratedWaveform(s.schKind || "generic", s.schMeta)}

    <rect x="88" y="992" width="738" height="184" rx="10" fill="#f0fdf4" stroke="#15803d" stroke-width="2.2"/>
    <text x="106" y="1018" font-family="${fontMain}" font-size="16" font-weight="800" fill="#14532d">Hardware Block Design &amp; Lab Verification Summary:</text>
    ${rationale.map((r, i) => {
      const lines = wrapText(`${i + 1}. ${String(r)}`, 92).slice(0, 2);
      const baseY = 1042 + i * 33;
      return renderLines(lines, 106, baseY, 15.5, "#1e293b", 12.6, 600, fontMain);
    }).join("")}

    <!-- ==================== PAGE 2 (CENTER): 10^3n PROOF + TABLE + RATIONALE + TRAP ==================== -->
    <text x="932" y="82" font-family="${fontMain}" font-size="20" font-weight="800" fill="#0f294a">Method 2 · Step-by-Step 10^(3n) Engineering Proof (Uncut)</text>
    <line x1="932" y1="92" x2="1670" y2="92" stroke="#dc2626" stroke-width="3"/>

    <rect x="932" y="112" width="738" height="360" rx="10" fill="rgba(255,255,255,0.9)" stroke="#93c5fd" stroke-width="2"/>
    ${mathLines.map((ln, idx) => {
      const yPos = 148 + idx * 41;
      const isRes = idx === mathLines.length - 1;
      const txt = esc(String(ln));
      const fSize = txt.length > 86 ? 10.6 : txt.length > 74 ? 11.5 : 13;
      return (isRes ? `<rect x="946" y="${yPos - 23}" width="710" height="34" rx="6" fill="#dcfce7" stroke="#15803d" stroke-width="2"/>` : "") +
        `<text x="956" y="${yPos}" font-family="${fontMono}" font-size="${fSize}" font-weight="${isRes ? 800 : 700}" fill="${isRes ? "#14532d" : "#0f172a"}">${txt}</text>`;
    }).join("")}

    <text x="932" y="${tblY - 10}" font-family="${fontMain}" font-size="17.5" font-weight="800" fill="#0f294a">${esc(s.tableTitle || "Verification & Engineering Boundary Table")}</text>
    <rect x="932" y="${tblY}" width="736" height="36" fill="#1e3a8a" stroke="#0f172a" stroke-width="1.5"/>
    ${tblHeaders.map((h, i) => {
      const hs = String(h);
      return `<text x="${942 + i * colW}" y="${tblY + 23}" font-family="${fontMain}" font-size="${hs.length > 18 ? 11.5 : 13.5}" font-weight="800" fill="#ffffff">${esc(hs)}</text>`;
    }).join("")}
    ${tblRows.map((row, rIdx) => {
      const ry = tblY + 36 + rIdx * 36;
      const hi = rIdx === s.highlightRow;
      return `<rect x="932" y="${ry}" width="736" height="36" fill="${hi ? "#fee2e2" : (rIdx % 2 ? "#f1f5f9" : "#ffffff")}" stroke="#94a3b8" stroke-width="1"/>` +
        row.slice(0, colCount).map((cell, cIdx) => {
          const cs = String(cell);
          return `<text x="${942 + cIdx * colW}" y="${ry + 23}" font-family="${fontMono}" font-size="${cs.length > 26 ? 9.6 : cs.length > 20 ? 10.6 : 11.8}" font-weight="${hi ? 800 : 600}" fill="${hi ? "#991b1b" : "#1e293b"}">${esc(cs)}</text>`;
        }).join("");
    }).join("")}

    <rect x="932" y="714" width="736" height="202" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <text x="950" y="742" font-family="${fontMain}" font-size="17" font-weight="800" fill="#0f294a">Bench Inspection &amp; 10^(3n) Dimensional Sanity Check:</text>
    ${(Array.isArray(s.benchChecks) && s.benchChecks.length ? s.benchChecks.slice(0, 4) : [
      "1) Convert prefixes before multiplying: p(10^-12), n(10^-9), u(10^-6), m(10^-3), k(10^3), M(10^6).",
      "2) Verify probe attenuation, common ground return & instrument Z (e.g. 10M DMM, 50k N7020A).",
      "3) Cross-check final units & sign via independent A-B-A hardware swap or energy balance.",
      "4) Record raw UART / oscilloscope waveforms BEFORE clearing status registers or power-cycling."
    ]).map((r, i) => {
      const lines = wrapText(String(r), 94).slice(0, 2);
      return renderLines(lines, 950, 770 + i * 36, 16, "#334155", 12.6, 600, fontMain);
    }).join("")}

    <rect x="932" y="936" width="736" height="240" rx="12" fill="#fffbeb" stroke="#dc2626" stroke-width="3.2"/>
    <rect x="932" y="936" width="736" height="40" rx="10" fill="#fee2e2"/>
    <text x="1300" y="962" text-anchor="middle" font-family="${fontMain}" font-size="${trapTitle.length > 78 ? 12.4 : trapTitle.length > 64 ? 13.8 : 15.5}" font-weight="800" fill="#991b1b">${trapTitle}</text>
    ${renderLines(trapLines, 954, 1008, 34, "#7c2d12", 16.5, 700, fontMain)}

    <!-- ==================== PAGE 3 (RIGHT): 6 BABY STEPS + PSEUDOCODE + COMMENTED CODE ==================== -->
    <text x="1778" y="82" font-family="${fontMain}" font-size="20" font-weight="800" fill="#0f294a">Page 3 · Baby Steps, Pseudocode &amp; Verified Code</text>
    <line x1="1778" y1="92" x2="2516" y2="92" stroke="#15803d" stroke-width="3"/>

    <text x="1778" y="124" font-family="${fontMain}" font-size="17" font-weight="800" fill="#15803d">Complete 6-Step Baby-Step Walkthrough (Uncut):</text>
    ${p3Steps.map((st, idx) => {
      const sy = 140 + idx * 62;
      const wrapped = wrapText((idx + 1) + ") " + st, 78).slice(0, 2);
      return `<rect x="1778" y="${sy}" width="738" height="54" rx="7" fill="rgba(255,255,255,0.9)" stroke="#cbd5e1"/>` +
        renderLines(wrapped, 1794, sy + 21, 20, "#0f172a", 14.5, 600, fontMain);
    }).join("")}

    <rect x="1778" y="530" width="738" height="162" rx="10" fill="#fefce8" stroke="#64748b" stroke-width="2.5" stroke-dasharray="8 6"/>
    <text x="1796" y="558" font-family="${fontMain}" font-size="16.5" font-weight="800" fill="#1e3a8a">Dotted PSEUDOCODE (Algorithm &amp; Lab Safety Flow):</text>
    ${pseudoLines.map((pl, i) => `<text x="1796" y="${590 + i * 26}" font-family="${fontMono}" font-size="13" font-weight="700" fill="#14532d">${esc(String(pl))}</text>`).join("")}

    <text x="1778" y="724" font-family="${fontMain}" font-size="17" font-weight="800" fill="#0f294a">Line-by-Line Commented Code &amp; Self-Checking Testbench:</text>
    <rect x="1778" y="736" width="738" height="440" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="2.5"/>
    ${codeLines.map((cl, i) => `<text x="1794" y="${770 + i * 33}" font-family="${fontMono}" font-size="12.5" font-weight="600" fill="${String(cl).includes("//") || String(cl).includes("#") ? "#86efac" : "#e2e8f0"}">${esc(String(cl))}</text>`).join("")}
  </svg>`;
}

/* ==================== 12 FLAGSHIP SPREADS (With Complete Method 1 Lecture & 10^3n Math) ==================== */
const FLAGSHIP_SPREAD_SPECS = [
  {
    file: "spread_01_muon_100_parallel_resistors_debug.png",
    cat: "avionics",
    header: "MUON SPACE INTERVIEW — 5V Rail Feeding 100 Parallel 1Ω Resistors (Open + 0Ω Shorts)",
    question: "A +5.0 V rail feeds N = 100 parallel 1.0 Ω resistors. Some fail OPEN (∞ Ω) and some fail SHORTED (0 Ω). Derive paper math in 10^(3n), read schematic, and isolate via 4W Kelvin & IR.",
    answer: "Healthy Req = 10×10⁻³ Ω (500 A) · Clear 0Ω Shorts First -> Count ∞Ω Opens",
    schKind: "parallel100",
    intuition: "Parallel branches share both copper nodes, so conductances add: G_total = N / R = 100 S => R_eq = 10×10⁻³ Ω. A single 0 Ω short clamps the node and masks EVERY open branch until physically cleared!",
    mathSteps: [
      "1) Healthy Conductance Sum: G = 100 × (1 / 1.0×10⁰ Ω) = 100.0 S",
      "2) Healthy R_eq = 1 / 100 = 0.010 Ω = 10.0 × 10⁻³ Ω (10.0 mΩ)",
      "3) Nominal 5V Current & Heat: I = 5.0 / 10×10⁻³ = 500 A (P = 2.50 × 10³ W!)",
      "4) With 2 Shorts (0Ω) + 3 Opens: R_eq ≈ 0.000 Ω (shorts mask all opens)",
      "5) Why 2-Wire DMM Fails: Lead R = 240×10⁻³ Ω >> 10×10⁻³ Ω (+2400% error!)",
      "6) Lift Shorted Pads (R14, R62 @ 0.000 Ω) -> 95 healthy + 5 opens left",
      "7) Final 4W Kelvin: R_eq = 1/95 = 10.526×10⁻³ Ω => N_open = 100 − 1/R_eq = 5"
    ],
    tableTitle: "4-Step Hardware Isolation Matrix (4-Wire Kelvin vs. IR Thermal)",
    table: {
      headers: ["Fault Case", "4W Kelvin R_eq", "2W DMM", "IR @ 1V CC Bias"],
      rows: [
        ["Healthy 100×1Ω", "10.00×10⁻³ Ω", "~250×10⁻³ Ω", "All 100 warm @ 60°C"],
        ["2 Shorts + 3 Opens", "~1.0×10⁻³ Ω", "~241×10⁻³ Ω", "R14/R62 hot; others 25°C"],
        ["Shorts Cleared (95)", "10.53×10⁻³ Ω", "~250×10⁻³ Ω", "Open R's stay 25°C ambient!"]
      ]
    },
    highlightRow: 1,
    rationale: [
      "Trace +5V_MAIN & bank jumpers JP1–JP10 (each bank = 10 resistors, Req = 100 mΩ) on schematic.",
      "Never power un-isolated shorted bus at 5 V — use current-limited 1.0 V / 2.5 A CC bias.",
      "4-Wire Kelvin injects Force I separately from Hi-Z Sense, eliminating 0.24 Ω probe error.",
      "Once 4W R_eq >= 10.0 mΩ, IR camera locates opens cleanly as 25 °C cold spots vs 60 °C."
    ],
    trapTitle: "★ GOLD INTERVIEW RULE: Clear 0Ω Shorts First With 4W Kelvin Before Finding Opens! ★",
    trapBody: "Unclamped 5V dumps 500 A into a short! Inject CC-limited 1V/2.5A, trace DC mV gradient & IR hotspots, lift 1 pad per suspect (0.000 Ω confirms short), then identify ∞Ω opens as 25°C cold spots on IR.",
    babySteps: [
      "Paper Math in 10^(3n): R_eq = 1/100 = 10×10⁻³ Ω; I = 5/(10×10⁻³) = 500 A.",
      "Inspect schematic to find bank jumpers JP1..JP10 for binary half-split isolation.",
      "Power OFF: switch DMM from 2-wire (240 mΩ leads) to 4-wire Kelvin micro-ohm mode.",
      "Inject 1V / 2.5A CC limit -> spot short hotspots on IR + lift 1 pad to verify 0.000 Ω.",
      "Measure 4W R_eq = 10.526 mΩ -> solve N_open = 100 − 1/(10.526×10⁻³) = 5.",
      "Verify cold 25°C open resistors on IR under 1V bias and inspect solder joints out-of-circuit."
    ],
    pseudo: [
      "// 1. Measure 4W Kelvin R_eq (zero lead error): IF R_eq < 10e-3: ShortPresent = TRUE",
      "// 2. WHILE ShortPresent: apply 1V/2.5A -> IR hotspot -> lift pad -> measure isolated R",
      "// 3. Once R_eq >= 10e-3: N_open = 100 - round(1/R_eq); inspect 25C IR cold spots"
    ],
    codeLines: [
      "def debug_100x1ohm_array(v_bus=5.0, n=100, r_nom=1.0, r4w=10.526e-3):",
      "    r_healthy = r_nom / n                 # 1.0 / 100 = 10.0e-3 Ohm (10 mOhm)",
      "    p_fault = (v_bus**2) / r_healthy      # 25 / 0.01 = 2.50e3 W theoretical",
      "    if r4w < r_healthy * 0.85:            # Any 0 Ohm short drags R_eq -> ~0",
      "        return 'PHASE_A: 1V_CC + IR_HOTSPOT + LIFT_PAD_UNTIL_R4W >= 10mOhm'",
      "    n_healthy = round(r_nom / r4w)        # 1 / 10.526e-3 = 95 active paths",
      "    n_open = n - n_healthy                # 100 - 95 = 5 open (25C cold IR)",
      "    return {'Req_Ohm': r4w, 'n_open': n_open, 'safe_v_bias': 1.0}",
      "assert debug_100x1ohm_array()['n_open'] == 5 # Self-test passes!"
    ]
  },
  {
    file: "spread_02_engr852_hw2_setup_hold_sta.png",
    cat: "avionics",
    header: "ENGR 852 HW2 Q1(a)(b) — Static Timing: f_max = 386.10 MHz vs. Hold Slack = −820×10⁻¹² s",
    question: "t_CQ=300..950×10⁻¹²s, AND=70..210ps, OR=50..200ps, MUX_D=40..180ps, MUX_S=30..170ps, tsu=300ps, th=400ps, skew=750ps. Compute f_max and Hold Slack.",
    answer: "Setup Tmin = 2.59×10⁻⁹ s (386.10 MHz) · Hold Slack = −820×10⁻¹² s (SAME-EDGE FAIL)",
    schKind: "sta",
    intuition: "Flip-flops capture data at rising clock edges. Setup checks the NEXT edge (MAX path sums set f_max). Hold checks the SAME clock edge—fast MIN path P4 races through before t_hold closes!",
    mathSteps: [
      "1) Slowest Setup Logic Path (P2/P3): (210 + 200 + 180) × 10⁻¹² = 590×10⁻¹² s",
      "2) Setup Inequality: T_min = tCQ_max + tLogic_max + t_su + t_skew",
      "3) Substitute 10³ⁿ: (950 + 590 + 300 + 750) × 10⁻¹² = 2.590 × 10⁻⁹ s",
      "4) Max Frequency: f_max = 1 / (2.590 × 10⁻⁹ s) = 386.10 × 10⁶ Hz (386.10 MHz)",
      "5) Fastest Hold Arrival (P4): tCQ_min + MUX_S_min = (300 + 30) × 10⁻¹² = 330×10⁻¹² s",
      "6) Required Hold Window: t_hold + t_skew = (400 + 750) × 10⁻¹² = 1.150 × 10⁻⁹ s",
      "7) Hold Slack = 330×10⁻¹² − 1150×10⁻¹² = −820 × 10⁻¹² s (−70ps even at 0 skew!)"
    ],
    tableTitle: "Complete Path-by-Path Setup & Hold Timing Table (10⁻¹² s)",
    table: {
      headers: ["Path ID", "Combinational Chain", "Max / Min (ps)", "Hold Slack"],
      rows: [
        ["P4 (Fast)", "Q_S -> MUX Select S", "170 / 330 ps", "−820×10⁻¹² s (FAIL)"],
        ["P1", "QA/B -> AND -> MUX D1", "390 / 410 ps", "−740×10⁻¹² s (FAIL)"],
        ["P2/P3 (Slow)", "QA..D -> AND -> OR -> D0", "590 / 460 ps", "−690×10⁻¹² s (FAIL)"]
      ]
    },
    highlightRow: 0,
    rationale: [
      "Setup uses MAX corner parameters (worst-case slow silicon + longest routing path).",
      "Hold uses MIN corner launch+logic against MAX t_hold + worst-case clock skew.",
      "Notice T_clk completely cancels out of Hold: launching and capturing happen at t = 0!",
      "Fix Hold physically in P&R by inserting >= +820×10⁻¹² s delay buffer cell on net S."
    ],
    trapTitle: "★ ENGR 852 GOLDEN RULE: Slowing Clock f_clk NEVER Fixes Hold Violations! ★",
    trapBody: "Because T_clk does NOT appear in the Hold equation (tCQ_min + tLogic_min >= t_hold + t_skew), lowering f_clk to 1 Hz still fails Hold on the SAME edge! Insert >= +820 ps delay buffer on Q_S -> S!",
    babySteps: [
      "Separate MAX delays (Setup along P2/P3 = 590 ps) from MIN delays (Hold along P4 = 330 ps).",
      "Convert picoseconds cleanly using 1 ps = 10⁻¹² s and 1/10⁻⁹ s = 10⁹ Hz.",
      "Sum Setup T_min = 2.590 × 10⁻⁹ s => f_max = 386.10 × 10⁶ Hz.",
      "Check Hold along bypass P4: 330×10⁻¹² s < (400+750)×10⁻¹² s -> Slack = −820×10⁻¹² s.",
      "Also verify 0-skew corner: 330×10⁻¹² − 400×10⁻¹² = −70 ps -> Hold STILL fails!",
      "Insert delay buffers >= +820×10⁻¹² s on S_buffered; re-verify Setup slack stays positive."
    ],
    pseudo: [
      "// 1. T_min = tCQ_max + MAX(path_max) + t_su + t_skew => f_max = 1 / T_min",
      "// 2. FOR each path p: arrival_min = tCQ_min + path_min[p]; req = t_hold + t_skew",
      "// 3. IF arrival_min < req: INSERT delay_buf >= (req - arrival_min) (NEVER change T_clk)"
    ],
    codeLines: [
      "module hw2_q1b_hold_fix (input clk, input [3:0] d, input sel, output reg res);",
      "  reg [3:0] R; reg S; wire S_buf;       // 5 launching D flip-flops",
      "  assign #850 S_buf = S;               // Insert >=820ps delay buffer for Hold",
      "  wire T = R[0] & R[1];                // AND gate: 70ps min / 210ps max",
      "  wire U = R[2] & R[3];                // Bottom AND gate",
      "  wire V = T | U;                      // OR gate: 50ps min / 200ps max",
      "  wire Y = S_buf ? T : V;              // MUX D0=180ps, Select S=30ps min",
      "  always @(posedge clk) begin          // Same clock edge launches & captures",
      "    R <= d; S <= sel; res <= Y;        // Hold slack now +30 ps > 0 (PASS!)",
      "  end",
      "endmodule // f_max = 1 / (2.590e-9 s) = 386.10 MHz with 0 hold violations"
    ]
  },
  {
    file: "spread_03_engr852_casex_kmap_and_16bit_sad.png",
    cat: "avionics",
    header: "ENGR 852 HW2 Q2 & LAB — Truth Table casex (E = D) + 8-bit (0xFF) vs 16-bit (65,280) SAD",
    question: "Simplify 16-row truth table {A,B,C,D}->E (4'b0101 = X) with Verilog casex & 4x4 K-Map, and prove why 16x16 Motion Estimator BestDist requires 16-bit (65,280) over 8-bit (0xFF).",
    answer: "Set X=1 => E = D (0 gates!) · Max 16×16 SAD = 256×255 = 65.28×10³ (16-bit!)",
    schKind: "generic",
    schMeta: {
      b1: "4-bit {A,B,C,D}", b1Sub: "16-Row Truth Table",
      b2: "4×4 K-Map (X=1)", b2Sub: "Octet => E = D",
      b3: "16×16 SAD Acc", b3Sub: "Max 65.28×10³",
      c1: "Blue: Setting Don't-Care row 0101 to X=1 completes 8-cell column D=1 => E = D!",
      c2: "Green: 8'hFF (255) clips after 1 pixel diff; 16'hFFFF holds full 65,280 SAD!",
      waveTitle: "8-Bit Saturation Clip (255) vs. Full 16-Bit BestDist Range (65,535)",
      waveNote: "16 × 16 = 256 pixels × 255 max diff = 65.28 × 10³ < 65.535 × 10³ (16-bit unsigned)"
    },
    intuition: "Don't-Care X cells in a K-Map can become 1 or 0 to forge larger powers-of-two loops. In digital datapaths, accumulator bit-width N must satisfy 2^N − 1 >= N_items × max_item_val.",
    mathSteps: [
      "1) Rows with E=1: 1, 3, 7, 9, 11, 13, 15 (7 of 8 odd rows where D=1)",
      "2) Missing D=1 row is row 5 (0101₂), specified as Don't-Care X!",
      "3) Set X = 1 -> 8 adjacent D=1 cells group into 1 octet => E = D (0 gates!)",
      "4) Motion Estimator Macroblock Count: N_px = 16 × 16 = 256 pixels",
      "5) Max 8-bit pixel difference: |255 − 0| = 255",
      "6) Worst-Case Total SAD = 256 × 255 = 65,280 = 65.28 × 10³ (0xFF00)",
      "7) Required Width: ceil(log2(65,281)) = 16 bits (init BestDist = 16'hFFFF)"
    ],
    tableTitle: "Verilog 'X' Meanings & Motion Estimator Bit-Width Comparison",
    table: {
      headers: ["Signal / Feature", "Buggy 8-Bit / No Default", "Verified 16-Bit / Safe", "Engineering Proof"],
      rows: [
        ["casex {A,B,C,D}", "Missing default -> Latch!", "default: E = 1'b0", "Pure comb E = D"],
        ["Max 16×16 SAD", "8'hFF (255) clip!", "16'd65280 (0xFF00)", "log2(65280)=15.99 bits"],
        ["Init BestDist", "8'hff loses all comparisons", "16'hffff (65,535)", "Compare every MV cleanly"]
      ]
    },
    highlightRow: 1,
    rationale: [
      "Three meanings of X in Verilog: Spec Don't-Care (1'bx), casex wildcard (4'b1xx1), Unknown.",
      "Omitting `default: E = 1'b0` in combinational `always @(*)` infers unwanted latch.",
      "Always verify accumulator bit growth by +ceil(log2(256)) = +8 bits over 8-bit inputs.",
      "Run exhaustive 16-vector self-checking testbench checking E_casex === E_opt."
    ],
    trapTitle: "★ NEVER INITIALIZE AN N-PIXEL SAD ACCUMULATOR TO 8'hFF OR OMIT default: ★",
    trapBody: "256 pixels × 255 max delta = 65,280 > 255! An 8-bit BestDist freezes at 255 on every white-vs-black block. Expand to reg [15:0] BestDist and always provide default: 1'b0.",
    babySteps: [
      "Plot all 16 truth-table rows onto Gray-coded 4×4 K-Map (00, 01, 11, 10).",
      "Choose X = 1 in row 0101 to unite all 8 D=1 minterms -> simplifies to E = D.",
      "Include explicit `default: E = 1'b0;` so synthesis builds 0 flip-flops / 0 latches.",
      "Compute SAD upper bound: 16×16 = 256 pixels × 255 = 65,280 (65.28 × 10³).",
      "Size accumulator & BestDist to 16 bits [15:0] (65,535 max > 65,280).",
      "Test with self-checking Verilog testbench iterating i = 0..15 with $finish."
    ],
    pseudo: [
      "// 1. always @(*) casex ({A,B,C,D}): 4'b00x1,0111,1xx1: 1; 4'b0101: X; default: 0",
      "// 2. BestDist[15:0] = 16'hFFFF; FOR mv = 0..255:",
      "//    SAD16 = sum_{k=0..255} abs(Ref[k] - Cur[k]); IF SAD16 < BestDist: update"
    ],
    codeLines: [
      "module hw2_truth_table (input A,B,C,D, output reg E);",
      "  always @(*) casex ({A,B,C,D})       // Pure combinational lookup",
      "    4'b00x1, 4'b0111, 4'b1xx1: E = 1'b1; // 7 explicitly asserted rows",
      "    4'b0101:                   E = 1'bx; // Spec Don't-Care (maps E=D)",
      "    default:                   E = 1'b0; // Fail-safe forbids latch!",
      "  endcase",
      "endmodule",
      "// Motion Estimator fix: reg [15:0] BestDist = 16'hFFFF; // Max 65,535",
      "// Peak 16x16 SAD = 256 * 255 = 16'd65280 (fits in [15:0], overflows [7:0]!)"
    ]
  },
  {
    file: "spread_04_tech60_units_ohm_watt_color_code.png",
    cat: "avionics",
    header: "TECH 60 Ch. 1–3 — Coulomb Charge, 10^(3n) Prefixes, SMD '472' & Ohm/Watt Laws",
    question: "How many electrons make 45×10⁻⁶ C (and I if flowing in 15×10⁻³ s)? Decode SMD '472' across 12 V to find I (mA), P (mW), and safe derated wattage.",
    answer: "N = 281.25×10¹² e⁻ · I = 3.0×10⁻³ A · R = 4.7×10³ Ω · P = 30.64×10⁻³ W (1/8W)",
    schKind: "generic",
    schMeta: {
      b1: "+12×10⁰ V Rail", b1Sub: "1 C = 6.25×10¹⁸ e⁻",
      b2: "SMD '472' = 4.7×10³Ω", b2Sub: "Yel-Viol-Red-Gold",
      b3: "I & Thermal Margin", b3Sub: "2.55×10⁻³A · 30.6×10⁻³W",
      c1: "Blue: Prefix shifts move in 10^(3n) steps: p=10⁻¹², n=10⁻⁹, µ=10⁻⁶, m=10⁻³, k=10³",
      c2: "Green: Required flight rating >= 2 × 30.64×10⁻³ W = 61.3×10⁻³ W < 125×10⁻³ W (1/8W)",
      waveTitle: "I-V Conductance Slope & Parabolic Power Curve P = V²/R (2× Derating)",
      waveNote: "At 12 V across 4.7×10³ Ω: I = 2.55×10⁻³ A, P = 30.64×10⁻³ W (doubling V quadruples heat!)"
    },
    intuition: "1 ampere = 1 coulomb (6.25×10¹⁸ electrons) passing per second. Engineering notation strictly locks exponents to multiples of 3 (10³ⁿ). Resistors convert I²R electrical energy into heat.",
    mathSteps: [
      "1) Convert Givens to 10³ⁿ: Q = 45×10⁻⁶ C ;  t = 15×10⁻³ s",
      "2) Electron Count N = (45×10⁻⁶) × (6.25×10¹⁸) = 281.25 × 10¹² electrons",
      "3) Current I = Q / t = (45×10⁻⁶) / (15×10⁻³) = 3.0 × 10⁻³ A (3.0 mA)",
      "4) SMD '472': 4, 7 × 10² = 4,700 Ω = 4.70 × 10³ Ω ±5%",
      "5) Ohm's Law: I = 12×10⁰ V / (4.7×10³ Ω) = 2.553 × 10⁻³ A (2.553 mA)",
      "6) Watt's Law: P = V²/R = 144 / (4.7×10³) = 30.64 × 10⁻³ W (30.64 mW)",
      "7) 2× Derating Check: 2 × 30.64×10⁻³ W = 61.3×10⁻³ W < 0.125 W (1/8W Safe!)"
    ],
    tableTitle: "10^(3n) Engineering Prefixes & SI Base vs. Derived Table",
    table: {
      headers: ["Prefix / Symbol", "Power of 10", "Example (10^3n)", "SI Base / Derived"],
      rows: [
        ["pico (p) / nano (n)", "10⁻¹² / 10⁻⁹", "25×10⁻¹⁵ F / 5×10⁻⁹ s", "Derived (C, s)"],
        ["micro (µ) / milli (m)", "10⁻⁶ / 10⁻³", "45×10⁻⁶ C / 15×10⁻³ s", "1 A = BASE SI Unit!"],
        ["kilo (k) / mega (M)", "10³ / 10⁶", "4.7×10³ Ω / 10×10⁶ Ω", "1V=kg·m²/(A·s³) Derived"]
      ]
    },
    highlightRow: 1,
    rationale: [
      "Ampere (A) is the ONLY SI base electrical unit; Volt, Ohm, Watt, Coulomb are derived.",
      "Never divide raw prefixed numbers (12 / 4.7 ≠ 2.55 A—it is 2.55×10⁻³ A = 2.55 mA!).",
      "mV × mA = 10⁻⁶ W (µW); V × mA = 10⁻³ W (mW); V / mA = 10³ Ω (kΩ).",
      "Always disconnect circuit power BEFORE measuring resistance with a DMM!"
    ],
    trapTitle: "★ DIVIDING BY MILLI (10⁻³) FLIPS EXPONENT SIGN TO ×10⁺³! ★",
    trapBody: "Most common beginner error: dividing 5 V by 2 mA and writing 2.5 mΩ instead of 2.5×10³ Ω (2.5 kΩ)! Convert EVERY prefix to ×10^(3n) BEFORE touching the calculator.",
    babySteps: [
      "Write every input in explicit ×10^(3n) form: µ -> 10⁻⁶, m -> 10⁻³, k -> 10³.",
      "Multiply Q(C) × 6.25×10¹⁸ for electron count; divide Q/t for amperes (1 A = 1 C/s).",
      "Decode 3-digit SMD 'ABC' as (10·A + B) × 10^C Ω (e.g. '5R6' = 5.6×10⁰ Ω).",
      "Compute I = V/R and P = V·I = V²/R checking prefix cancellations cleanly.",
      "Multiply expected power P by 2.0× flight derating to pick standard 1/8 W or 1/4 W part.",
      "Double check resistor color/SMD tolerance (±1%, ±5%) before powering bench rail."
    ],
    pseudo: [
      "// 1. Q_si = Q * 10^(-6); t_si = t * 10^(-3) -> I = Q_si / t_si (in 10^3n A)",
      "// 2. R_si = (10*d1 + d2) * 10^d3 -> I = V / R_si; P = V*V / R_si",
      "// 3. IF P * 2.0 <= 0.125 W THEN '1/8 W Safe' ELSE 'Upgrade to 1/4 W or 1/2 W'"
    ],
    codeLines: [
      "def tech60_units_ohm_watt(q_uc=45.0, t_ms=15.0, v=12.0, smd='472'):",
      "    n_e = (q_uc * 1e-6) * 6.25e18         # 281.25e12 electrons",
      "    i_charge = (q_uc * 1e-6) / (t_ms * 1e-3) # 3.0e-3 A (3.0 mA)",
      "    r = (int(smd[0])*10 + int(smd[1])) * (10 ** int(smd[2])) # 4.7e3 Ohm",
      "    i_res = v / r                         # 2.553e-3 A (2.553 mA)",
      "    p_w = (v ** 2) / r                    # 30.64e-3 W (30.64 mW)",
      "    safe = (2.0 * p_w) <= 0.125           # 61.3mW <= 125mW => True (1/8W)",
      "    return {'N_e': n_e, 'I_res': i_res, 'P_W': p_w, 'Safe_1_8W': safe}"
    ]
  },
  {
    file: "spread_05_tech60_loaded_divider_wheatstone_thevenin.png",
    cat: "avionics",
    header: "TECH 60 Ch. 5–8 — 10×10⁶ Ω DMM Loaded Divider, Thermistor Bridge & Thevenin R_TH",
    question: "A 12 V Wheatstone bridge has R1=R2=R3=10×10³Ω and thermistor RT=9×10³Ω. Find V_out and R_TH. Also compute 10×10⁶Ω DMM reading on a 10V 1MΩ∥1MΩ divider.",
    answer: "V_out = +315.8×10⁻³ V · R_TH = 9.737×10³ Ω · DMM Reads 4.762×10⁰ V (−4.76%)",
    schKind: "bridge_thevenin",
    intuition: "Putting any load or 10 MΩ DMM across R_bottom creates R_bot∥R_DMM, dragging voltage down! Zeroing independent voltage sources (short to GND) reveals R_TH directly across A–B.",
    mathSteps: [
      "1) Ideal Unloaded 1MΩ Divider: V_ideal = 10 × 1M/(1M+1M) = 5.000 × 10⁰ V",
      "2) Parallel 10×10⁶ Ω DMM Load: R2_eq = (1×10⁶ × 10×10⁶)/(11×10⁶) = 909.1×10³ Ω",
      "3) Actual DMM Reading: V_dmm = 10 × 909.1k/(1000k+909.1k) = 4.762×10⁰ V (−4.76%!)",
      "4) Bridge Ref Leg V_A: 12 × (10×10³ / 20×10³) = 6.000 × 10⁰ V",
      "5) Bridge Thermistor Leg V_B: 12 × (9.0×10³ / 19.0×10³) = 5.6842 × 10⁰ V",
      "6) Differential Bridge V_out = V_A − V_B = +0.3158 V = +315.8 × 10⁻³ V",
      "7) Zero 12V Source -> R_TH = (10k∥10k) + (10k∥9k) = (5.000 + 4.737)×10³ = 9.737×10³ Ω"
    ],
    tableTitle: "DMM Input Loading Error vs. Source Impedance & Bridge Balance",
    table: {
      headers: ["Circuit Case", "Ideal Open V", "Loaded / Bridge V", "Thevenin R_TH"],
      rows: [
        ["1×10⁶ Ω Div + 10M DMM", "5.000 × 10⁰ V", "4.762×10⁰ V (−4.8%)", "500 × 10³ Ω"],
        ["1×10³ Ω Div + 10M DMM", "5.000 × 10⁰ V", "4.9998×10⁰ V (0.0%)", "500 × 10⁰ Ω"],
        ["Bridge @ RT=9×10³ Ω", "0 × 10⁰ V", "+315.8 × 10⁻³ V", "9.737 × 10³ Ω"]
      ]
    },
    highlightRow: 2,
    rationale: [
      "Wheatstone bridge is two parallel dividers sharing 12 V supply & GND return.",
      "With source shorted to find R_TH, top +12 V node merges with bottom GND node!",
      "Left node A sees R1∥R3 (5 kΩ); Right node B sees R2∥RT (4.737 kΩ) in series.",
      "High-impedance MΩ sensors must be buffered by a unity-gain op-amp before ADC sampling."
    ],
    trapTitle: "★ NEVER COMPUTE R_TH LIVE — SHORT V_S TO 0V & MODEL 10×10⁶ Ω DMM! ★",
    trapBody: "Never poke an ohmmeter onto a powered bridge! To find R_TH on paper, turn off all independent sources (short V-sources, open I-sources). Always model R_DMM = 10×10⁶ Ω in parallel with high-Z taps!",
    babySteps: [
      "Compute left arm divider V_A = V_S·R3/(R1+R3) and right arm V_B = V_S·RT/(R2+RT).",
      "Subtract V_out = V_A − V_B keeping 4+ digits before rounding to mV (10⁻³ V).",
      "To find R_TH: short 12V supply -> nodes A & B each look into parallel arms in series.",
      "Compute R_TH = (R1·R3)/(R1+R3) + (R2·RT)/(R2+RT) = 9.737 × 10³ Ω.",
      "For 1 MΩ divider measured by 10 MΩ DMM: replace R2 with (1M × 10M)/(11M) = 909.1 kΩ.",
      "Re-evaluate divider V_DMM = 4.762 V and warn hardware team about −4.76% loading sag."
    ],
    pseudo: [
      "// 1. VA = Vs * R3 / (R1 + R3); VB = Vs * RT / (R2 + RT); Vth = VA - VB",
      "// 2. Rth = par(R1, R3) + par(R2, RT)   // With independent Vs shorted",
      "// 3. V_dmm = Vs * par(R_bot, 10e6) / (R_top + par(R_bot, 10e6))"
    ],
    codeLines: [
      "def solve_bridge_and_dmm(vs=12.0, r=10e3, rt=9e3, r_dmm=10e6):",
      "    par = lambda a, b: (a * b) / (a + b)  # Parallel product-over-sum",
      "    v_a = vs * r / (r + r)                # 6.000 V reference node",
      "    v_b = vs * rt / (r + rt)              # 5.6842 V thermistor node",
      "    v_th = v_a - v_b                      # +315.79e-3 V (+315.8 mV)",
      "    r_th = par(r, r) + par(r, rt)         # 9.7368e3 Ohm (9.737 kOhm)",
      "    r_bot_eq = par(1e6, r_dmm)            # 1M || 10M = 909.09e3 Ohm",
      "    v_loaded = 10.0 * r_bot_eq / (1e6 + r_bot_eq) # 4.7619 V (-4.76% err)",
      "    return {'Vth': v_th, 'Rth': r_th, 'Vdmm': v_loaded}"
    ]
  },
  {
    file: "spread_06_tech60_cramer_mesh_superposition_ac_rms.png",
    cat: "avionics",
    header: "TECH 60 Ch. 8–13 — 2×2 Cramer Mesh, Max Power (80 mW), AC V_rms & Reactance X_C",
    question: "Solve 300·I1−100·I2=6, −100·I1+400·I2=0 via Cramer's Rule. Find P_max (Vth=8V, Rth=200Ω), V_rms & T (14.14Vpp 2×10³Hz), and X_C (0.1×10⁻⁶F @ 10×10³Hz).",
    answer: "Mesh I1 = 21.82×10⁻³ A · Pmax = 80×10⁻³ W · Vrms = 5.00 V · X_C = 159.15 Ω",
    schKind: "generic",
    schMeta: {
      b1: "2×2 Mesh Matrix", b1Sub: "Δ = 110×10³ Ω²",
      b2: "RL = Rth (200 Ω)", b2Sub: "P_max = 80×10⁻³ W (50% η)",
      b3: "AC Sine & X_C", b3Sub: "Vrms=5.00V · Xc=159.2Ω",
      c1: "Blue: Keep negative off-diagonal (−100)(−100) signs clean inside Δ = a·d − b·c!",
      c2: "Green: At Maximum Power Transfer (RL=Rth), source burns equal 80 mW heat (50% eff)!",
      waveTitle: "Calibrated AC Sine Scope: V_p = 7.07V, V_rms = 5.00V, T = 500×10⁻⁶ s (2 kHz)",
      waveNote: "V_pp = 14.14V -> V_p = 7.07V -> V_rms = 0.7071×7.07 = 5.00V; X_C drops as f increases!"
    },
    intuition: "Determinants automate multi-loop algebra. Max power transfers to a load when RL = R_TH. In AC, V_rms equals the DC voltage producing identical I²R heat in a resistor.",
    mathSteps: [
      "1) System Determinant Δ = (300)(400) − (−100)(−100) = 110 × 10³ Ω²",
      "2) Numerator Determinant Δ1 = (6)(400) − (−100)(0) = 2.400 × 10³ V·Ω",
      "3) Mesh Current I1 = Δ1 / Δ = 2,400 / 110,000 = 21.82 × 10⁻³ A (21.82 mA)",
      "4) Max Power Transfer (RL = Rth = 200 Ω): P_max = Vth² / (4·Rth)",
      "5) Substitute: P_max = 64 / 800 = 80.0 × 10⁻³ W (80 mW @ 50% efficiency)",
      "6) AC RMS & Period: Vp=7.07V -> Vrms=0.7071×7.07=5.00V; T=1/(2×10³)=500×10⁻⁶ s",
      "7) Capacitive Reactance: X_C = 1 / (2π × 10×10³ × 0.1×10⁻⁶) = 159.15 × 10⁰ Ω"
    ],
    tableTitle: "Mesh, Power Transfer & AC Sinusoidal Conversion Reference",
    table: {
      headers: ["Parameter", "Exact Equation", "10^(3n) Value", "Critical Trap"],
      rows: [
        ["Cramer Mesh I1", "(V1·R22 − V2·R12)/Δ", "21.82 × 10⁻³ A", "Track (−)(−) product sign"],
        ["Max Load P_max", "Vth² / (4·Rth) @ RL=Rth", "80.0 × 10⁻³ W", "Never sum Superposition P!"],
        ["AC V_rms & X_C", "0.7071·(Vpp/2); 1/(2πfC)", "5.00V; 159.15 Ω", "Scope=Vpp, DMM=Vrms"]
      ]
    },
    highlightRow: 1,
    rationale: [
      "For Superposition, zero one source at a time, sum linear I or V FIRST, THEN compute P = I²R.",
      "RF/sensor lines match RL = Rth = 50 Ω for max signal power; spacecraft power buses want RL >> R_s.",
      "True-RMS DMMs measure 0.7071×Vp on pure sinewaves; distorted PWM needs True-RMS meter.",
      "As frequency rises 10×, capacitive reactance X_C = 1/(2πfC) drops by 10×."
    ],
    trapTitle: "★ NEVER ADD INDIVIDUAL SUPERPOSITION POWERS P1 + P2 OR MIX V_pp WITH V_rms! ★",
    trapBody: "Power P = I²R is quadratic, NOT linear—add signed branch currents first, then square! Also verify whether an oscilloscope shows Peak-to-Peak V_pp (divide by 2√2 for V_rms) or amplitude V_p.",
    babySteps: [
      "Write both KVL loop equations cleanly aligning I1 and I2 columns.",
      "Compute Δ = ad − bc and Δ1 = V1·d − b·V2 -> divide for I1 in ×10⁻³ A.",
      "Set RL = Rth for Max Power Transfer and evaluate Vth²/(4·Rth) in ×10⁻³ W.",
      "For AC waves: Vpp / 2 = V_p, then multiply by 0.7071 to get V_rms.",
      "Invert f = 2×10³ Hz -> T = 500×10⁻⁶ s (500 µs).",
      "Compute X_C = 1/(2πfC) converting µF (10⁻⁶) and kHz (10³) cleanly."
    ],
    pseudo: [
      "// 1. delta = a*d - b*c; I1 = (v1*d - b*v2) / delta",
      "// 2. P_max = (Vth ** 2) / (4 * Rth); V_rms = (Vpp / 2) * 0.707107",
      "// 3. T_s = 1 / f_hz; Xc_ohm = 1 / (2 * pi * f_hz * C_farad)"
    ],
    codeLines: [
      "import math",
      "def mesh_pwr_ac(vth=8.0, rth=200.0, vpp=14.14, f_ac=2e3, f_c=10e3, c=0.1e-6):",
      "    delta = 300*400 - (-100)*(-100)       # 110e3 Ohm^2 system det",
      "    i1_a = (6*400 - 0) / delta            # 21.818e-3 A (21.82 mA)",
      "    pmax_w = (vth**2) / (4.0 * rth)       # 80.0e-3 W (80 mW)",
      "    v_rms = (vpp / 2.0) / math.sqrt(2.0)  # 5.00 Vrms",
      "    period_s = 1.0 / f_ac                 # 500e-6 s (500 us)",
      "    xc_ohm = 1.0 / (2.0 * math.pi * f_c * c) # 159.15 Ohm",
      "    return {'I1_A': i1_a, 'Pmax_W': pmax_w, 'Vrms': v_rms, 'Xc': xc_ohm}"
    ]
  },
  {
    file: "spread_07_electronic_devices_bridge_rectifier_ripple.png",
    cat: "devices",
    header: "ELECTRONIC DEVICES Ch. 1–2 — Si Full-Wave Bridge Rectifier & 120 Hz Filter Ripple",
    question: "A 12 V_rms 60 Hz transformer secondary drives a 4-diode Si bridge (VF = 0.7 V each) with C = 1×10⁻³ F (1000 µF) and RL = 1.0×10³ Ω. Find Vp(out), Vr(pp), VDC & PIV.",
    answer: "Vp(out) = 15.57 V · Vr(pp) = 129.8×10⁻³ Vpp (120 Hz) · PIV >= 16.27 V",
    schKind: "rectifier",
    intuition: "Two Silicon PN junctions (0.7 V barrier each) conduct in series during both AC half-cycles, flipping negative halves upright so ripple frequency DOUBLES (60 Hz -> 120 Hz) and C bridges valleys.",
    mathSteps: [
      "1) Secondary RMS to Peak: Vp(sec) = √2 × 12.0 = 1.4142 × 12 = 16.97 × 10⁰ V",
      "2) Bridge Diode Losses (2 × 0.7 V): V_drop = 1.40 × 10⁰ V",
      "3) Rectified Output Peak: Vp(out) = 16.97 − 1.40 = 15.57 × 10⁰ V",
      "4) Full-Wave Ripple Frequency DOUBLES: f_r = 2 × 60 Hz = 120 × 10⁰ Hz",
      "5) Time Constant Base SI: RL = 1.0×10³ Ω, C = 1.0×10⁻³ F => RL·C = 1.00×10⁰ s",
      "6) Filter Ripple Vr(pp) = Vp(out)/(f_r·RL·C) = 15.57/(120×1.0) = 129.8×10⁻³ Vpp",
      "7) Avg DC & PIV: VDC ≈ 15.57 − 0.065 = 15.505 V; PIV = 15.57+0.7 = 16.27 V (use 50V)"
    ],
    tableTitle: "Half-Wave vs. Center-Tapped vs. 4-Diode Bridge Comparison",
    table: {
      headers: ["Topology", "Diode Drops", "Ripple Frequency", "Diode PIV Spec"],
      rows: [
        ["Half-Wave (1 diode)", "1 × 0.7 = 0.7 V", "1× f_in (60 Hz)", "Vp(in)"],
        ["Center-Tap (2 diodes)", "1 × 0.7 = 0.7 V", "2× f_in (120 Hz)", "2·Vp(out) + 0.7 V"],
        ["Full Bridge (4 diodes)", "2 × 0.7 = 1.4 V", "2× f_in (120 Hz)", "Vp(out) + 0.7 V"]
      ]
    },
    highlightRow: 2,
    rationale: [
      "RMS measures heating value; Peak amplitude Vp = √2 × Vrms reaches 41.4% higher.",
      "Larger C reduces Vr(pp) linearly, at the cost of narrower high-peak surge recharge spikes.",
      "Center-tapped transformers require twice the PIV stress per reverse-biased diode.",
      "Check 1N400x surge current I_FSM and thermal dissipation P = 0.7V × I_avg per diode."
    ],
    trapTitle: "★ BRIDGE SUBTRACTS 1.4 V (2 DIODES) AND USES f_r = 2·f_in = 120 Hz! ★",
    trapBody: "Never plug 12 V directly into Vr without multiplying by √2, never subtract only 0.7 V in a bridge, and never leave f_r = 60 Hz in the full-wave filter formula!",
    babySteps: [
      "Convert transformer V_rms -> V_p(sec) = 1.4142 × V_rms first.",
      "Trace current loop per half-cycle: 2 Silicon diodes in series subtract 2 × 0.7 V = 1.4 V.",
      "Identify output pulse repetition rate: full-wave doubles 60 Hz -> f_r = 120 Hz.",
      "Convert filter C = 1000×10⁻⁶ F = 10⁻³ F and RL = 10³ Ω (note 10³×10⁻³ = 1.0 s).",
      "Compute Vr(pp) = Vp(out) / (f_r · RL · C) = 129.8 × 10⁻³ Vpp (129.8 mVpp).",
      "Verify V_DC = Vp(out) − 0.5·Vr(pp) and pick diode with >= 2× PIV margin."
    ],
    pseudo: [
      "// 1. Vp_out = (1.4142 * Vrms_sec) - 1.4    // 2 Si diodes in series",
      "// 2. f_r = 2 * f_in; Vr_pp = Vp_out / (f_r * R_L * C_farad)",
      "// 3. V_dc = Vp_out - 0.5 * Vr_pp; check Diode_PIV >= 2 * (Vp_out + 0.7)"
    ],
    codeLines: [
      "import math",
      "def full_wave_bridge_calc(vrms=12.0, fin=60.0, rl=1.0e3, cap=1000e-6):",
      "    vp_sec = math.sqrt(2.0) * vrms        # 16.971 V secondary peak",
      "    vp_out = vp_sec - 2.0 * 0.7           # 15.571 V after 2 Si drops",
      "    fr = 2.0 * fin                        # 120 Hz ripple rate",
      "    vr_pp = vp_out / (fr * rl * cap)      # 129.75e-3 Vpp (129.8 mVpp)",
      "    v_dc = vp_out - 0.5 * vr_pp           # 15.506 V average DC rail",
      "    piv_min = vp_out + 0.7                # 16.27 V -> select >= 50V 1N4001",
      "    return {'Vp_out': vp_out, 'Vr_pp': vr_pp, 'VDC': v_dc, 'PIV': piv_min}"
    ]
  },
  {
    file: "spread_08_electronic_devices_zener_lm317_bjt_saturation.png",
    cat: "devices",
    header: "ELECTRONIC DEVICES Ch. 3–5 — 5.1V Zener Regulator, LM317 & BJT Saturation",
    question: "A) 12V->100Ω->5.1V Zener∥510Ω: find IZ. B) LM317 (R1=240Ω, R2=1.2×10³Ω): find Vout. C) NPN (β=100, VCC=10V, RC=10³Ω, RB=10⁴Ω, VBB=5V): Active or Sat?",
    answer: "IZ = 59.0×10⁻³ A · LM317 = 7.50×10⁰ V · BJT SATURATED (IC_sat = 9.8×10⁻³ A)",
    schKind: "zener_bjt",
    intuition: "Zener reverse-breaks down cleanly to clamp node VZ by sinking excess current (IT − IL). An NPN transistor multiplies IB×β only UNTIL reaching saturation collector ceiling IC(sat)!",
    mathSteps: [
      "1) Series R_S Drop @ VZ = 5.1 V: V_RS = 12.0 − 5.1 = 6.90 × 10⁰ V",
      "2) Total Supply Current I_T = 6.90 V / 100 Ω = 69.0 × 10⁻³ A (69.0 mA)",
      "3) Load Branch Current I_L = 5.1 V / 510 Ω = 10.0 × 10⁻³ A (10.0 mA)",
      "4) KCL Zener Current: I_Z = I_T − I_L = (69.0 − 10.0)×10⁻³ = 59.0 × 10⁻³ A",
      "5) LM317 Output: V_out = 1.25 × (1 + 1.2×10³ / 240) = 1.25 × 6 = 7.50 × 10⁰ V",
      "6) BJT Base Drive: I_B = (5.0 − 0.7) / 10×10³ = 4.3 / 10⁴ = 430 × 10⁻⁶ A",
      "7) Saturation Proof: β·I_B = 43×10⁻³ A >> IC_sat = (10−0.2)/10³ = 9.8×10⁻³ A => SAT!"
    ],
    tableTitle: "Semiconductor Regulator & BJT Operating Mode Bounds",
    table: {
      headers: ["Circuit Block", "Governing Condition", "Exact 10^(3n) Formula", "Verification"],
      rows: [
        ["5.1V Zener Shunt", "Vin > VZ, check PZ_max", "IZ = (Vin−VZ)/RS − VZ/RL", "59×10⁻³A (PZ=0.30W)"],
        ["LM317 Regulator", "1.25V ref across R1", "Vout = 1.25·(1 + R2/R1)", "7.50V (headroom >=2V)"],
        ["NPN BJT Switch", "β·IB vs IC_sat ceiling", "ICsat = (VCC−0.2)/RC", "43mA > 9.8mA => SAT!"]
      ]
    },
    highlightRow: 2,
    rationale: [
      "Zener dissipates maximum power at NO LOAD (RL = ∞ => IZ = IT = 69 mA -> PZ = 352 mW).",
      "LM317 regulates by floating ADJ 1.25 V below Vout, forcing constant current down R1->R2.",
      "Because V_CE cannot drop below ~0.2 V, IC hits hard limit (VCC − 0.2)/RC in Saturation.",
      "Always verify LDO/regulator thermal loss P = (Vin − Vout)·I_load against θ_JA!"
    ],
    trapTitle: "★ NEVER REPORT I_C = β·I_B WITHOUT COMPARING TO I_C(sat) = (VCC−0.2)/R_C! ★",
    trapBody: "Predicting 43 mA through RC = 1 kΩ on a 10 V supply implies a 43 V drop across RC—physically impossible! Once β·I_B exceeds I_C(sat), the transistor saturates at V_CE ≈ 0.2 V.",
    babySteps: [
      "Calculate series current IT = (Vin − VZ) / RS across shunt regulator first.",
      "Find load demand IL = VZ / RL -> subtract by KCL for Zener current IZ = IT − IL.",
      "Check both extremes for Zener wattage: min RL (keep IZ > I_ZK knee) and max open load.",
      "For LM317, match units of R1 and R2 before evaluating 1.25 × (1 + R2/R1).",
      "Solve BJT Base KVL loop: IB = (VBB − 0.7 V) / RB = 430 × 10⁻⁶ A (0.43 mA).",
      "Compare β·IB (43 mA) > IC(sat) (9.8 mA) to prove Saturation (switch ON @ 0.2 V)."
    ],
    pseudo: [
      "// 1. IZ = (Vin - Vz)/Rs - Vz/Rl ; assert Vz*Iz <= P_zener_max",
      "// 2. Vout_lm317 = 1.25 * (1 + R2 / R1)",
      "// 3. Ib = (Vbb - 0.7)/Rb; Ic = min(beta * Ib, (Vcc - 0.2)/Rc) // Saturation clamp"
    ],
    codeLines: [
      "def solve_zener_lm_bjt(vin=12.0, vz=5.1, rs=100.0, rl=510.0):",
      "    it = (vin - vz) / rs                  # 69.0e-3 A (69.0 mA)",
      "    il = vz / rl                          # 10.0e-3 A (10.0 mA)",
      "    iz = it - il                          # 59.0e-3 A (P_Z = 300.9 mW)",
      "    v_lm317 = 1.25 * (1.0 + 1.2e3 / 240)  # 7.50 V regulated output",
      "    ib = (5.0 - 0.7) / 10e3               # 430e-6 A (0.43 mA)",
      "    ic_sat = (10.0 - 0.2) / 1.0e3         # 9.80e-3 A (9.80 mA ceiling)",
      "    is_saturated = (100.0 * ib) >= ic_sat # 43 mA >= 9.8 mA -> True",
      "    return {'Iz_A': iz, 'LM317_V': v_lm317, 'Ic_A': ic_sat, 'SAT': is_saturated}"
    ]
  },
  {
    file: "spread_09_tech63_pulse_ieee754_demorgan_gray_adder.png",
    cat: "tech63",
    header: "TECH 63 Ch. 1–6 — Pulse Duty (25%), IEEE 754 Float (+12.5), DeMorgan, Gray & Adder",
    question: "A) T=20×10⁻⁶s, tW=5×10⁻⁶s -> Duty%. B) IEEE754: 0 10000010 10010... C) Simplify NOT(NOT(AB)·C). D) 1011₂ -> Gray. E) 4-bit Add 1011₂ + 0111₂.",
    answer: "Duty = 25% · IEEE754 = +12.50 · DeMorgan = AB + C̄ · Gray = 1110₂ · Sum = 10010₂",
    schKind: "generic",
    schMeta: {
      b1: "Pulse & FP32", b1Sub: "tW=5×10⁻⁶s · T=20×10⁻⁶s",
      b2: "DeMorgan & Gray", b2Sub: "Break bar + flip · G=B^(B>>1)",
      b3: "4-Bit Ripple Add", b3Sub: "Σ=A⊕B⊕Cin => 10010₂ (18)",
      c1: "Blue: IEEE 754 normalizes 1.F (hidden leading 1!): +1 × 1.5625 × 2^(130−127) = +12.5",
      c2: "Green: Gray MSB copies B3; each lower bit G_k = B_(k+1) XOR B_k prevents multi-bit glitches",
      waveTitle: "Non-Ideal Pulse Timing: tr/tf (10%–90%), Width t_W (50%–50%), Duty = tW/T",
      waveNote: "Duty Cycle = (5×10⁻⁶ s / 20×10⁻⁶ s) × 100% = 25% | f = 1/(20×10⁻⁶) = 50×10³ Hz"
    },
    intuition: "IEEE 754 compresses huge dynamic range into 32 bits via bias-127 exponent & implicit '1.' mantissa. DeMorgan flips gates dualistically; Gray code guarantees single-bit transitions on clocks/encoders.",
    mathSteps: [
      "1) Duty Cycle = (tW / T)×100% = (5.0×10⁻⁶ / 20×10⁻⁶)×100% = 25.0% (f = 50×10³ Hz)",
      "2) IEEE 754 Sign S=0 (+), Biased E = 10000010₂ = 130 => Unbiased exp = +3",
      "3) IEEE 754 Mantissa: (1).1001₂ = 1 + 0.5 + 0.0625 = 1.5625",
      "4) Decoded FP32 = (+1) × 1.5625 × 2³ = 1.5625 × 8 = +12.50 × 10⁰",
      "5) DeMorgan: NOT(NOT(AB)·C) = NOT(NOT(AB)) + NOT(C) = A·B + C̄",
      "6) Binary 1011₂ -> Gray: G3=1, G2=1⊕0=1, G1=0⊕1=1, G0=1⊕1=0 => 1110₂ (14)",
      "7) 4-Bit Ripple Carry Add: 1011₂ (11) + 0111₂ (7) => Cout=1, Sum=0010₂ (18)"
    ],
    tableTitle: "Logic Family Noise Margin, Adder & Code Conversion Reference",
    table: {
      headers: ["Digital System", "Threshold / Rule", "Example Value", "Engineering Purpose"],
      rows: [
        ["5V TTL / 3.3V CMOS", "VIL=0.8V, VIH=2.0V", "NM_H = VOH − VIH", "Reject coupled ground bounce"],
        ["Full Adder / Subt", "Σ=A⊕B⊕Cin, Cout=...", "B ⊕ M, C0=M for subt", "2's complement M=1 subtracts"],
        ["Binary -> Gray CDC", "G = B ^ (B >> 1)", "1011₂ -> 1110₂", "1-bit change stops CDC glitches"]
      ]
    },
    highlightRow: 2,
    rationale: [
      "Pulse rise/fall times t_r, t_f are ALWAYS measured between 10% and 90% voltage points.",
      "Pulse width t_W and Period T are measured at 50% amplitude midpoint.",
      "In 2's complement subtraction (A − B), XOR B inputs with M=1 (invert) and inject Cin=1!",
      "Always terminate unused CMOS gate inputs to VDD or GND—floating inputs oscillate & burn heat."
    ],
    trapTitle: "★ NEVER FORGET THE IMPLICIT '1.' IN IEEE 754 OR LEAVE CMOS INPUTS FLOATING! ★",
    trapBody: "Students often compute 0.5625 × 8 = 4.5 instead of 1.5625 × 8 = 12.5 because they forget IEEE 754's normalized hidden leading 1! Also check 10–90% vs 50% pulse edges on oscilloscopes.",
    babySteps: [
      "Divide tW by T (same 10⁻⁶ s prefix) and multiply by 100% for Duty Cycle = 25%.",
      "Split 32-bit IEEE 754: Bit[31]=S, Bits[30:23]=E (subtract 127!), Bits[22:0]=F (+ 1.0).",
      "Simplify outer DeMorgan bars first: break top bar over operator and flip · <-> +.",
      "Cancel double bars X̄̄ = X to produce minimal Sum-of-Products A·B + C̄.",
      "Convert Binary->Gray right-shift & XOR: 1011 ^ 0101 = 1110₂.",
      "Sum 4-bit columns LSB->MSB carrying C1, C2, C3, C4 out of Bit 3."
    ],
    pseudo: [
      "// 1. duty = (t_w / T) * 100 ; freq = 1 / T_sec",
      "// 2. fp32 = (-1)^S * (1.0 + frac) * 2^(E - 127)",
      "// 3. gray = binary ^ (binary >> 1) ; 4bit_add = A + B -> {Cout, Sum[3:0]}"
    ],
    codeLines: [
      "def tech63_suite(tw=5e-6, period=20e-6, fp_bits=0x41480000, b=0b1011):",
      "    duty_pct = (tw / period) * 100.0      # 25.0%; freq = 1/20e-6 = 50 kHz",
      "    sign = -1 if (fp_bits >> 31) else 1   # S = 0 -> +1",
      "    exp = ((fp_bits >> 23) & 0xFF) - 127  # 130 - 127 = +3",
      "    mant = 1.0 + ((fp_bits & 0x7FFFFF) / (1 << 23)) # 1.5625 (implicit 1!)",
      "    fp_val = sign * mant * (2.0 ** exp)   # +12.50",
      "    gray = b ^ (b >> 1)                   # 0b1110 (14 decimal)",
      "    cout_sum = b + 0b0111                 # 11 + 7 = 18 -> Cout=1, Sum=0010",
      "    return {'duty': duty_pct, 'fp32': fp_val, 'gray': bin(gray), 'sum': cout_sum}"
    ]
  },
  {
    file: "spread_10_physics2b_rc_dvm_loading_and_tvac.png",
    cat: "physics2b",
    header: "PHYSICS 2B Lab 8 & MUON TVAC — 10×10⁶ Ω DVM Loaded RC Decay & Vacuum Physics",
    question: "Physics 2B Lab 8: A 2.2×10⁻⁶ F cap discharges via R = 4.7×10⁶ Ω WITH a 10×10⁶ Ω DVM in parallel. Compute real τ (s). Why do ambient-PASS spacecraft fail in TVAC?",
    answer: "Loaded τ = 7.034×10⁰ s (32% faster than 10.34s!) · TVAC Convection h = 0 W/m²K",
    schKind: "generic",
    schMeta: {
      b1: "2.2×10⁻⁶ F Cap", b1Sub: "V(t) = V0·e^(−t/τ)",
      b2: "4.7×10⁶ Ω ∥ 10×10⁶ Ω", b2Sub: "R_eq = 3.197×10⁶ Ω",
      b3: "TVAC <10⁻⁵ Torr", b3Sub: "Only Conduction + T⁴ Rad",
      c1: "Blue: Parallel 10×10⁶ Ω DMM shunts bleed charge, accelerating decay by 32%!",
      c2: "Green: At <10⁻⁵ Torr vacuum, convection h=0 -> loose TIM torque overheats!",
      waveTitle: "1τ..5τ Capacitor Discharge With 10×10⁶ Ω DVM Loading Shift (10.34s -> 7.034s)",
      waveNote: "10⁶ Ω × 10⁻⁶ F = 1.0 s! Ideal τ = 10.34s; Loaded τ = 3.1973×10⁶ × 2.2×10⁻⁶ = 7.034s"
    },
    intuition: "Voltmeters are NOT infinite resistance! Across megohm bleed resistors, a 10 MΩ DVM opens a second discharge highway. In TVAC vacuum (<10⁻⁵ Torr), air disappears—zero convective cooling!",
    mathSteps: [
      "1) Parallel Circuit Across Cap: R = 4.7 × 10⁶ Ω in parallel with R_DVM = 10.0 × 10⁶ Ω",
      "2) Parallel Equivalent R_eq = (4.7×10⁶ × 10×10⁶) / (4.7×10⁶ + 10×10⁶)",
      "3) Simplify: R_eq = 47 / 14.7 × 10⁶ Ω = 3.1973 × 10⁶ Ω",
      "4) Convert Capacitance: C = 2.2 µF = 2.2 × 10⁻⁶ F",
      "5) Loaded Time Constant: τ = (3.1973×10⁶) × (2.2×10⁻⁶) = 7.034 × 10⁰ s",
      "6) Meter Loading Error vs Ideal (10.34s): (7.034−10.34)/10.34 = −32.0%!",
      "7) TVAC Transfer: Q_conv = 0; only bolted conduction + ε·σ·A·(T₁⁴ − T₂⁴) radiation"
    ],
    tableTitle: "Physics 2B DMM Loading & Muon Space TVAC Qualification Matrix",
    table: {
      headers: ["Test Condition", "Physical Mechanism", "Observed Effect", "Required Action"],
      rows: [
        ["DMM 10MΩ Connected", "Parallel R || R_DVM", "τ drops 10.34s -> 7.034s", "Account for R_DMM in theory"],
        ["TVAC (<10⁻⁵ Torr)", "No air convection (h=0)", "Bolted TIM runaway heat", "Torque check + gap pad + IR"],
        ["Pump-Down ~1 Torr", "Paschen Law corona min", "HV arcing / multipaction", "Disable HV until hard vacuum"]
      ]
    },
    highlightRow: 0,
    rationale: [
      "Notice MΩ (10⁶) × µF (10⁻⁶) cancels exponents straight to exact seconds!",
      "At 1τ discharging drops to 36.8% (e⁻¹); neon bulb relaxation triggers at ~70–90V strike.",
      "Verification = 'Built system right' (ICD specs); Validation = 'Built right system' (mission).",
      "In TVAC wait for thermal soak equilibrium ΔT/Δt before recording pass/fail data."
    ],
    trapTitle: "★ NEVER IGNORE 10×10⁶ Ω DMM INPUT RESISTANCE OR ASSUME CONVECTION IN VACUUM! ★",
    trapBody: "When Lab 8 uses a 4.7 MΩ bleed resistor, connecting your DMM continuously changes R_eq to 3.197 MΩ! Likewise in TVAC vacuum (<10⁻⁵ Torr), fans spin uselessly—only bolted baseplate conduction & T⁴ radiation cool flight electronics.",
    babySteps: [
      "Draw the DMM internal 10×10⁶ Ω resistance explicitly in parallel across the capacitor.",
      "Reduce R ∥ R_DVM = (4.7×10) / 14.7 = 3.1973 × 10⁶ Ω.",
      "Multiply R_eq (10⁶ Ω) × C (2.2×10⁻⁶ F) = 7.034 s (confirm 10⁶ × 10⁻⁶ = 10⁰).",
      "Check voltage decay fractions: 36.8% at 7.03 s (1τ), 13.5% at 14.07 s (2τ).",
      "Distinguish V&V in satellite qualification and monitor vacuum pressure across Paschen zone.",
      "Wait for thermal stabilization before logging cold/hot soak functional margin sweeps."
    ],
    pseudo: [
      "// 1. r_eq = (r_circuit * 10e6) / (r_circuit + 10e6) // Model 10 MOhm DVM",
      "// 2. tau = r_eq * c_farads                          // 10^6 * 10^-6 = 1 s",
      "// 3. IF chamber_torr < 1e-5: h_conv = 0; check TIM torque & Paschen lockout"
    ],
    codeLines: [
      "def physics2b_dvm_rc(r_ohm=4.7e6, c_f=2.2e-6, r_dvm=10.0e6):",
      "    tau_ideal = r_ohm * c_f               # 10.34 s (unloaded circuit)",
      "    r_eq = (r_ohm * r_dvm) / (r_ohm + r_dvm) # 3.1973e6 Ohm with DMM",
      "    tau_loaded = r_eq * c_f               # 7.034 s (actual decay constant)",
      "    err_pct = 100.0 * (tau_loaded - tau_ideal) / tau_ideal # -31.97%",
      "    return {'R_eq': r_eq, 'tau_ideal': tau_ideal, 'tau_loaded': tau_loaded, 'err%': err_pct}",
      "assert abs(physics2b_dvm_rc()['tau_loaded'] - 7.034) < 0.002"
    ]
  },
  {
    file: "spread_11_nvidia_slt_pdn_dram_keysight_scope.png",
    cat: "nvidia",
    header: "NVIDIA SLT MASTER — PDN L·dI/dt Droop, DDR4-3200, 1T1C Cell & CPU2 4-Ch Scope",
    question: "Compute PDN ΔV for ΔI=40A/20ns (L=250pH, R=2mΩ), DDR4-3200 GB/s & t_RC, 1T1C bitline ΔV_BL (C_cell=25fF, C_BL=225fF), and CPU2 4-ch Scope + DRAM log bug.",
    answer: "ΔV_L = 500×10⁻³ V · ΔV_BL = 55×10⁻³ V · DDR4 = 25.6×10⁹ B/s · t_RC = 45.75×10⁻⁹ s",
    schKind: "scope4ch",
    intuition: "GPU current transients (dI/dt = 2×10⁹ A/s) create huge L·dI/dt spikes before VRMs react! Meanwhile 1T1C DRAM charge sharing bleeds ~55 mV onto the bitline—detected by sense amps, audited in raw logs.",
    mathSteps: [
      "1) Resistive Droop: ΔV_IR = 40×10⁰ A × 2.0×10⁻³ Ω = 80.0 × 10⁻³ V (80 mV)",
      "2) Step Rate & L·dI/dt: (250×10⁻¹² H) × (40 A / 20×10⁻⁹ s) = 500 × 10⁻³ V",
      "3) 1T1C Bitline Charge Share: ΔV_BL = (1.10−0.55) × 25×10⁻¹⁵/(250×10⁻¹⁵) = 55×10⁻³ V",
      "4) Hot DRAM (>85°C 2× Ref): t_REFI drops 3.9×10⁻⁶ s -> 1.95 × 10⁻⁶ s",
      "5) DDR4-3200 Peak Bandwidth: (3.2×10⁹ T/s × 64b) / 8 = 25.6 × 10⁹ B/s (25.6 GB/s)",
      "6) Row Cycle Time: t_RC = t_RAS + t_RP = (32.00 + 13.75)×10⁻⁹ = 45.75 × 10⁻⁹ s",
      "7) Parallel Termination (20 Ω ∥ 60 Ω): (20 × 60)/(20 + 60) = 15.0 × 10⁰ Ω"
    ],
    tableTitle: "CPU2 Keysight 4-Ch Scope & Post-Silicon Case Study Matrix",
    table: {
      headers: ["Case Study", "Setup / Probes", "Verified Method", "Trap Prevented"],
      rows: [
        ["Google CPU2 CLK/Vdd", "CH1 SMA CLK, CH2/4 N7020A", "Verify divider + offset", "No assuming internal PLL"],
        ["CPU2 Shunt Current", "CH3 Keysight 1169B probe", "Deskew CH3 vs CH2 for V·I", "No GND clip on live shunt!"],
        ["DRAM Summary PASS", "Raw dmesg / UART / EDAC", "Inject synthetic fail -> grep", "Summary PASS ≠ clean DRAM"]
      ]
    },
    highlightRow: 2,
    rationale: [
      "Keysight N7020A provides ±24V DC offset range + 50kΩ input Z for sub-mV ripple view.",
      "pH (10⁻¹²) × A / ns (10⁻⁹) resolves cleanly to 10⁻³ V (millivolts) without unit guessing.",
      "1T1C reads destroy C_cell charge until diff sense amp rewrites full VDD/0V to open row.",
      "Intel/Cisco lessons: staged bringup (shorts -> VR -> clk/rst -> BIOS) + A-B-A socket swap!"
    ],
    trapTitle: "★ NEVER TRUST SCRIPT SUMMARY 'PASS' WITHOUT READING RAW KERNEL / EDAC LOGS! ★",
    trapBody: "Production case: automated SLT script printed DRAM PASS despite real hardware bit-flips due to a parser bug! Freeze DUT, grep raw dmesg/UART BEFORE rebooting, and inject synthetic fault unit tests.",
    babySteps: [
      "Compute steady IR droop (80 mV) separately from transient L·di/dt (500 mV) across PDN.",
      "Use 10⁻¹⁵ F (fF) charge-sharing equation ΔV_BL = (Vcell−Vpre)·Ccell/(Ccell+Cbl) = 55 mV.",
      "Scale DDR MT/s × bus width / 8 to GB/s (25.6×10⁹ B/s) and sum tRC = tRAS + tRP (45.75 ns).",
      "Assign 4-channel scope: CH1 CLK (SMA-BNC), CH2/4 N7020A rails, CH3 1169B shunt.",
      "Deskew probe propagation delays BEFORE multiplying instantaneous V(t) × I(t).",
      "Inspect raw UART/dmesg/EDAC before clearing counters; prove fault with single-var A-B-A!"
    ],
    pseudo: [
      "// 1. dV_pdn = I*R_pdn + L_pkg*(dI/dt); dV_bl = (Vcell - Vdd/2)*(Ccell/(Ccell+Cbl))",
      "// 2. bw_Bps = (MTps * width_bits) / 8; tRC = tRAS + tRP",
      "// 3. Inspect raw logs -> test parser with fake bit error -> run 1-var A-B-A swap"
    ],
    codeLines: [
      "def nvidia_slt_physics(dI=40.0, dt=20e-9, l=250e-12, r=2e-3):",
      "    dv_ir = dI * r                        # 80.0e-3 V (80 mV)",
      "    dv_ind = l * (dI / dt)                # 500.0e-3 V (500 mV spike)",
      "    c_cell, c_bl = 25e-15, 225e-15        # 1T1C cell & bitline fF",
      "    dv_bl = (1.10 - 0.55) * (c_cell / (c_cell + c_bl)) # 55.0e-3 V",
      "    bw_ddr4 = (3200e6 * 64) / 8           # 25.6e9 Bytes/sec (25.6 GB/s)",
      "    t_rc = 32.0e-9 + 13.75e-9             # 45.75e-9 s (45.75 ns)",
      "    return {'dV_pdn': dv_ir+dv_ind, 'dV_bl': dv_bl, 'BW': bw_ddr4, 'tRC': t_rc}"
    ]
  },
  {
    file: "spread_12_nvidia_slt_python_nan_fpy_and_15step_hld.png",
    cat: "nvidia",
    header: "NVIDIA SLT MASTER — Fail-Closed Python NaN/FPY, Linux CLI & 15-Step HLD Playbook",
    question: "Prevent False-Clean PASS on float('nan')/timeouts, audit true FPY vs Retest Yield, interpret grep exit 0/1/2, inspect 8 socket checks & execute 15-step HLD on Xid 79.",
    answer: "Check math.isfinite() -> PASS/FAIL/INVALID · Preserve Attempt #1 for FPY · A-B-A Isolation",
    schKind: "generic",
    schMeta: {
      b1: "SCPI / CLI Input", b1Sub: "'nan', timeout, exit 2",
      b2: "isfinite() & Guards", b2Sub: "Never default missing -> 0",
      b3: "3-State Verdict", b3Sub: "PASS / FAIL / INVALID",
      c1: "Blue: float('nan') raises NO ValueError—comparisons return False and fool naive scripts!",
      c2: "Green: Preserve first_seen[sn] for true FPY; NEVER let retry-until-pass mask bad silicon!",
      waveTitle: "15-Step High-Level Debug Playbook Funnel (Freeze -> Logs -> Power/Socket -> A-B-A)",
      waveNote: "Save dmesg/lspci BEFORE reboot! Xid 79 = symptom (PSU droop, thermal, PCIe, or GPU)."
    },
    intuition: "Hardware automation requires fail-closed logic: ANY missing, NaN, infinite, timed-out, or exit-2 input must return INVALID—never PASS or DUT FAIL—while preserving attempt #1 for true FPY.",
    mathSteps: [
      "1) Safe Float Parse: float(raw.strip()) inside try/except ValueError -> INVALID",
      "2) Trap NaN / +/-Inf: if not math.isfinite(val): return 'INVALID' (CRITICAL!)",
      "3) Accept Range Check ONLY AFTER finiteness: 3.10 <= val <= 3.50",
      "4) Linux grep exit $? codes: 0 = Match Found, 1 = No Match, 2 = File/Error (INVALID)",
      "5) First-Pass Yield: FPY = (# SNs PASS on Attempt #1 ONLY) / Total_Valid × 100%",
      "6) Rolled Throughput Yield (92% × 95%): RTY = 0.92 × 0.95 = 87.4% × 10⁰",
      "7) DPPM Formula (2 defects / 50×10³ units): DPPM = (2 / 50×10³)×10⁶ = 40.0 DPPM"
    ],
    tableTitle: "Linux CLI Triage, 8 BGA Socket Checks & Yield Audit Rules",
    table: {
      headers: ["Layer / Area", "Verified Command / Check", "Expected / Output", "Trap Avoided"],
      rows: [
        ["Linux Triage", "dmesg -T; lspci -vvv; nvidia-smi -q", "Save BEFORE reboot", "grep exit 1 ≠ DUT PASS"],
        ["Socket Checks", "Bent pin, FOD, torque, planarity", "Microscope + A-B-A", "Reseating ≠ Root Cause"],
        ["Python / Yield", "math.isfinite(); first_seen[sn]", "3-State + FPY", "Retry-until-pass hides escapes"]
      ]
    },
    highlightRow: 2,
    rationale: [
      "10 Linux commands: uname -a, lspci -vvv, dmesg -T, journalctl -b, grep -RniE, lsusb, by-id.",
      "Subprocess exit code 0 means tool finished—NOT that GPU link/compute/memory passed!",
      "8 Socket checks: bent pin, tip contamination, torque uniformity, substrate warp, ESD, wear.",
      "15-Step HLD: Freeze -> Baselines -> Raw Logs -> PSU/Temp/Socket -> Isolate -> A-B-A -> Handoff."
    ],
    trapTitle: "★ NEVER SILENTLY RETRY-UNTIL-PASS OR CONFUSE 'INVALID' TEST WITH 'PASS'! ★",
    trapBody: "Retrying a flaky GPU 3× and calling attempt #3 PASS masks marginal socket contact or cold timing failures until customer escapes! Quarantine INVALID station timeouts separately from DUT FPY.",
    babySteps: [
      "Wrap raw telemetry string conversion in try/except + mandatory math.isfinite() check.",
      "Use subprocess.run(..., capture_output=True, text=True, timeout=10, check=False).",
      "Classify timeout/OSError/non-zero rc as station INVALID—never mark the chip faulty blindly.",
      "Keep first valid attempt per SN for FPY while logging retest counts separately.",
      "Run read-only Linux captures BEFORE rebooting an Xid 79 or PCIe AER failure.",
      "Execute 15-Step HLD & A-B-A single-variable swap to isolate DUT vs socket vs host."
    ],
    pseudo: [
      "// 1. val = float(raw); IF not math.isfinite(val): RETURN 'INVALID'",
      "// 2. RUN cmd(timeout=10s); IF timeout or rc != 0: RETURN 'INVALID'",
      "// 3. first_pass.setdefault(sn, status) -> true FPY = sum(PASS in first_pass) / len"
    ],
    codeLines: [
      "import math, subprocess",
      "def classify_rail(raw, lo=3.10, hi=3.50):   # 3-State FAIL-CLOSED Grader",
      "    try: v = float(str(raw).strip())",
      "    except (ValueError, TypeError): return 'INVALID'",
      "    if not math.isfinite(v): return 'INVALID' # Blocks NaN / +Inf / -Inf!",
      "    return 'PASS' if lo <= v <= hi else 'FAIL'",
      "def audit_fpy(runs):                       # True First-Pass Yield",
      "    first = {}                             # Preserves Attempt #1 ONLY",
      "    for r in runs:",
      "        if r['status'] != 'INVALID': first.setdefault(r['sn'], r['status'])",
      "    return round(100.0 * sum(x=='PASS' for x in first.values())/max(1,len(first)), 2)"
    ]
  }
];

/* ==================== DYNAMIC 3-PAGE SPEC FOR ALL 2,350 LIVE QUESTIONS ==================== */
function buildDynamicSpreadSpec(q, t, isNvidia) {
  const titlePrefix = isNvidia ? `NVIDIA SLT (${(t && t.title) || "Track"})` : `AVIONICS EE (${(t && t.title) || "Topic"})`;
  const idLabel = String(q.id || "STUDY").toUpperCase();
  const isNum = isNvidia ? (q.questionType === "number" || q.kind === "calc") : (q.expected !== undefined);
  const ans = isNum ? `${Number(Number(q.expected).toPrecision(5))} ${q.unit || ""}`.trim() : (q.level || q.phase || "Verified Engineering Proof");

  const txt = ((q.id || "") + " " + (q.question || "") + " " + (t?.id || "")).toLowerCase();
  let schKind = "generic";
  if (/100.*resistor|100\s*x|1\s*ω.*parallel|r14.*0\s*ω|parallel-x[789]/.test(txt)) schKind = "parallel100";
  else if (/setup|hold|skew|t_cq|timing|sta|386|820/.test(txt)) schKind = "sta";
  else if (/rectifier|bridge|ripple|1n400|piv/.test(txt)) schKind = "rectifier";
  else if (/zener|bjt|saturation|lm317|base|collector/.test(txt)) schKind = "zener_bjt";
  else if (/wheatstone|thevenin|10\s*mω.*dmm|loaded divider/.test(txt)) schKind = "bridge_thevenin";
  else if (/keysight|n7020a|1169b|droop|dram|1t1c|trc|ddr4|cpu2/.test(txt)) schKind = "scope4ch";

  const stList = (Array.isArray(q.steps) ? q.steps : []).map(st => String(st).replace(/^Step\s*\d+\s*[:.)-]?\s*/i, "").trim());
  const pme = window.PROFESSOR_MASTERY_ENGINE;
  const convLine = pme?.buildConversionExplanation?.(q.question || "") || "Convert m(10⁻³), µ(10⁻⁶), n(10⁻⁹), p(10⁻¹²), k(10³), M(10⁶) to base SI first";
  const note = isNvidia ? pme?.NVIDIA_TRACK_LECTURES?.[t?.id] : pme?.TOPIC_PROFESSOR_NOTES?.[t?.id];

  const eqUse = (q.formula && !String(q.formula).includes("->")) ? q.formula
    : /1t1c|c_cell|bitline/.test(txt) ? "ΔV_BL = (V_cell − V_PRE) · [C_cell / (C_cell + C_BL)]"
    : /refresh|trefi|retention/.test(txt) ? "t_REFI_hot = t_REFI_nom / 2 (above 85 °C)"
    : "Spec Margin = Limit − (Measured ± Uncertainty)";

  const mathSteps = isNum ? [
    `1) Givens: ${wrapText(q.question || "", 72)[0] || ""}`,
    `2) 10^3n Prefix Check: ${wrapText(convLine, 66)[0] || convLine}`,
    `3) Governing Law: ${eqUse}`,
    `4) Substitution: ${q.sub || "Substitute converted base-SI 10^(3n) values"}`,
    `5) Intermediate Balance & Significant Figures (3–4 digits)`,
    `6) Dimensional Unit Check -> ${ans}`
  ] : [
    `1) Governing Equation: ${eqUse}`,
    `2) Mechanism: ${wrapText(stList[0] || q.question || "", 72)[0] || ""}`,
    `3) Bench Check: ${wrapText(stList[1] || "Capture baseline with calibrated probe", 70)[0] || ""}`,
    `4) Comparison: ${wrapText(stList[2] || "Healthy reference vs observed fault", 70)[0] || ""}`,
    `5) Control Isolation: ${wrapText(stList[3] || "Single-variable A-B-A swap proof", 68)[0] || ""}`,
    `6) Verified Conclusion = ${ans}`
  ];

  const babySteps = stList.length ? stList.slice(0, 6) : mathSteps;
  const codeLines = q.code
    ? String(q.code).split("\n").slice(0, 12)
    : (isNum ? [
        `// Automated 10^(3n) Guardband Check for ${idLabel}`,
        `const law = "${String(eqUse)}";`,
        `// Step 1: Convert p(1e-12), n(1e-9), u(1e-6), m(1e-3), k(1e3) FIRST`,
        `// Step 2: Compute ${String(q.sub || eqUse)}`,
        `const expected = ${Number.isFinite(Number(q.expected)) ? q.expected : 0};`,
        `assert(Math.abs(measured - expected) <= Math.max(1e-6, Math.abs(expected)*0.015));`
      ] : [
        `// Hardware Verification Protocol for ${idLabel}`,
        `1. Inspect power-off resistance & continuity before energizing DUT rail;`,
        `2. Set bench PSU current limit safely (never probe Ohms on a powered board!);`,
        `3. Capture raw telemetry (4-ch Keysight Scope / DMM / dmesg / lspci -vvv);`,
        `4. Perform controlled single-variable A -> B -> A swap using Known-Good reference;`,
        `5. Classify cleanly: DUT FAIL vs. Station INVALID vs. Confirmed PASS.`
      ]);

  return {
    header: `${idLabel} · ${titlePrefix}`,
    question: q.question || "",
    answer: ans,
    schKind,
    schMeta: {
      b1: t?.title || "Input / Source", b1Sub: isNum ? `Target: ${q.unit}` : "System Givens",
      b2: q.skillName || q.learningObjective || "Core Law", b2Sub: eqUse,
      b3: ans, b3Sub: isNvidia ? "PASS/FAIL/INVALID" : "GO/NO-GO Margin",
      c1: `Blue: ${wrapText(stList[0] || q.question || "", 76)[0] || ""}`,
      c2: `Green: ${wrapText(convLine, 76)[0] || convLine}`,
      waveTitle: `Calibrated Engineering Graticule (${idLabel} · 10^(3n) Scale)`,
      waveNote: isNum ? `${eqUse}  =>  ${ans}` : (note?.lawWhy || "Verify raw evidence before resetting")
    },
    intuition: (isNvidia ? note?.physics : note?.intuition) || (q.lesson && (typeof q.lesson === "string" ? q.lesson : q.lesson.summary)) || "",
    mathSteps,
    tableTitle: "10^(3n) Verification & Boundary Summary Table",
    table: {
      headers: ["Stage", "Quantity / Method", "Engineering Standard"],
      rows: [
        ["10^3n Prefixes", isNum ? (q.unit || "Base SI") : (q.skillName || "Concept"), "Convert p/n/µ/m/k/M BEFORE math"],
        ["Governing Model", wrapText(eqUse, 30)[0] || eqUse, "Preserve sign & uncertainty ±"],
        ["Final Proof", wrapText(ans, 30)[0] || ans, "A-B-A independent cross-check"]
      ]
    },
    highlightRow: 2,
    rationale: [
      `Physics Foundation: ${(isNvidia ? note?.instrument : note?.lawWhy) || "Trace energy/signal conservation from source to return."}`,
      `10^(3n) Prefix Rule: ${convLine}`,
      `Bench Measurement: ${stList[1] || "Record DMM/scope range, ground ref & timestamp before swap."}`,
      `Trap Guard: ${note?.trap || "Separate symptom from root cause with 1-variable A-B-A test."}`
    ],
    trapTitle: "★ PROFESSOR TRAP & GOLDEN RULE TO REMEMBER ★",
    trapBody: note?.trap || (q.hints && q.hints[2]) || "Separate symptom from root cause, convert prefixes to 10^(3n) base SI before substituting, and verify via A-B-A check.",
    babySteps,
    pseudo: [
      `// 1. GIVEN: Extract inputs for ${idLabel} and convert to 10^(3n) base SI units`,
      `// 2. LAW: Evaluate ${eqUse.slice(0, 56)}`,
      `// 3. VERIFY: Cross-check ${ans} with magnitude/unit sanity & A-B-A test`
    ],
    codeLines
  };
}

function renderQuestionNotebookSpread(q, t, isNvidia) {
  const spec = buildDynamicSpreadSpec(q, t, isNvidia);
  const svgMarkup = renderNotebookSpreadSVG(spec);
  const fname = `${String(q.id || "study_sheet").replace(/[^a-zA-Z0-9_-]/g, "_")}_3page_notebook.png`;
  return `<section class="nb-spread-wrap" aria-label="Three-page spiral graph-paper visual notebook solution">
    <div class="nb-spread-toolbar">
      <div class="nb-spread-title-group">
        <span class="nb-spread-pill">📓 3-PAGE SPIRAL NOTEBOOK IMAGE (2600×1240)</span>
        <strong>Full Step-by-Step 10<sup>3n</sup> Visual Spread for ${esc(String(q.id || "").toUpperCase())}</strong>
      </div>
      <div class="nb-spread-actions">
        <button type="button" class="nb-spread-btn" data-prof-dl-png="${esc(fname)}">📸 Download .PNG Image</button>
        <button type="button" class="nb-spread-btn secondary" data-prof-zoom-nb="1">🔍 Fullscreen Spread</button>
      </div>
    </div>
    <div class="nb-spread-canvas">${svgMarkup}</div>
  </section>`;
}

let galleryOpen = false;
let activeFlagshipIdx = 0;

function renderFlagshipGallerySection(modeFilter) {
  const items = FLAGSHIP_SPREAD_SPECS.filter(s => !modeFilter || modeFilter === "all" || s.cat === modeFilter || (modeFilter === "avionics" && s.cat !== "nvidia"));
  const cur = items[Math.min(activeFlagshipIdx, items.length - 1)] || FLAGSHIP_SPREAD_SPECS[0];
  return `<details class="nb-gallery-details" ${galleryOpen ? "open" : ""}>
    <summary>🖼️ Visual Notebook Gallery: All 12 High-Resolution 3-Page Spiral Notebook Images (2600×1240 .PNG Ready)</summary>
    <div class="nb-gallery-body">
      <p style="margin-top:0;font-size:0.9rem;color:#334155;">Click any sheet to inspect its 3-page spiral graph-paper spread (Method 1 Physical Lecture + Component Schematic + Calibrated Dark-Bezel Graticule | Method 2 Uncut 10<sup>3n</sup> Proof + Table + Trap Box | 6 Uncut Baby Steps + Dotted Pseudocode + Line-by-Line Code) or download the 2600×1240 PNG.</p>
      <div class="nb-gallery-pills" role="group" aria-label="Select flagship notebook sheet">
        ${FLAGSHIP_SPREAD_SPECS.map((sp, i) => `<button type="button" class="nb-gallery-pill ${sp.file === cur.file ? "active" : ""}" data-nb-gal-idx="${i}">${i + 1}. ${esc(sp.header.split("—")[0].trim())}</button>`).join("")}
      </div>
      <div class="nb-spread-toolbar" style="margin-top:10px;">
        <strong>${esc(cur.header)}</strong>
        <div class="nb-spread-actions">
          <a class="nb-spread-btn" href="figures/notebook_spreads/${esc(cur.file)}" download="${esc(cur.file)}">⬇️ Download Pre-Rendered PNG</a>
          <button type="button" class="nb-spread-btn secondary" data-prof-zoom-nb="1">🔍 Enlarge Fullscreen</button>
        </div>
      </div>
      <div class="nb-spread-canvas">${renderNotebookSpreadSVG(cur)}</div>
    </div>
  </details>`;
}

function downloadSvgAsPng(svgEl, filename) {
  if (!svgEl || typeof XMLSerializer === "undefined") return;
  const xml = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2600;
    canvas.height = 1240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 2600, 1240);
    URL.revokeObjectURL(url);
    canvas.toBlob(pngBlob => {
      if (!pngBlob) return;
      const dlUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = filename || "study_notebook_3page.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(dlUrl), 1500);
    }, "image/png");
  };
  img.src = url;
}

function openSpreadZoomModal(svgEl) {
  if (!svgEl) return;
  let dlg = document.getElementById("nbSpreadZoomDialog");
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.id = "nbSpreadZoomDialog";
    dlg.className = "nb-zoom-modal";
    dlg.innerHTML = `<div class="nb-zoom-head"><strong>📓 3-Page Spiral Graph-Paper Notebook Spread (2600×1240 High-Resolution View)</strong><div><button type="button" id="nbZoomDlBtn" class="nb-spread-btn">📸 Download .PNG</button> <button type="button" id="nbZoomCloseBtn" class="nb-spread-btn secondary">Close ×</button></div></div><div id="nbZoomContent"></div>`;
    document.body.appendChild(dlg);
    dlg.querySelector("#nbZoomCloseBtn").onclick = () => dlg.close();
    dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
  }
  const content = dlg.querySelector("#nbZoomContent");
  content.innerHTML = svgEl.outerHTML;
  dlg.querySelector("#nbZoomDlBtn").onclick = () => downloadSvgAsPng(content.querySelector("svg"), "slt_notebook_spread.png");
  if (typeof dlg.showModal === "function") dlg.showModal();
}

function bindNotebookSpreads(container, rerenderFn) {
  if (!container) return;
  const det = container.querySelector(".nb-gallery-details");
  if (det) det.addEventListener("toggle", () => { galleryOpen = det.open; });

  container.querySelectorAll("[data-nb-gal-idx]").forEach(btn => {
    btn.onclick = () => {
      galleryOpen = true;
      activeFlagshipIdx = Number(btn.dataset.nbGalIdx) || 0;
      if (typeof rerenderFn === "function") rerenderFn();
    };
  });
  container.querySelectorAll("[data-prof-dl-png]").forEach(btn => {
    btn.onclick = () => {
      const wrap = btn.closest(".nb-spread-wrap, .nb-gallery-body");
      const svg = wrap ? wrap.querySelector(".nb-spread-svg") : null;
      if (svg) downloadSvgAsPng(svg, btn.dataset.profDlPng);
    };
  });
  container.querySelectorAll("[data-prof-zoom-nb]").forEach(btn => {
    btn.onclick = () => {
      const wrap = btn.closest(".nb-spread-wrap, .nb-gallery-body");
      const svg = wrap ? wrap.querySelector(".nb-spread-svg") : null;
      if (svg) openSpreadZoomModal(svg);
    };
  });
}

window.PROFESSOR_NOTEBOOK_SPREADS = {
  version: "2.0.0",
  FLAGSHIP_SPREAD_SPECS,
  renderNotebookSpreadSVG,
  buildDynamicSpreadSpec,
  renderQuestionNotebookSpread,
  renderFlagshipGallerySection,
  bindNotebookSpreads
};

})();
