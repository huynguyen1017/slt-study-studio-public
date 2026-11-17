"use strict";
/* Engineering Study & Complete Solution Sheet Renderer (v3.0 · 2600×1400 Full Lecture Standard)
   Generates publication-grade, topic-pure & question-specific visual study sheets for
   Avionics EE Practice (#avionicsView), NVIDIA SLT Engineer (#nvidiaView), and NVIDIA SLT Prep (#nvidia-sltView).
   Zero unrelated coursework mixing: every sheet contains ONLY the active question's:
   1. Circuit / Hardware Schematic (with current flow, nodes A/B, & givens)
   2. Calibrated Operating-Point / Waveform Graph (with Key Equations + How to Read Graph)
   3. Bench Instrument Hookup (DMM 2W/4W Kelvin, Keysight 4-Ch Scope N7020A/1169B, IR Camera)
   4. Governing Equations & 10^(3n) SI Prefix Table
   5. Complete Worked Mathematical Solution (10^(3n) Engineering Notation)
   6. Engineer's Step-by-Step Post-Math Resolution & Product Execution (Schematic -> Bench -> Fix)
   7. Hiring-Manager Spoken Interview Delivery Script & Common Traps to Avoid */
(function(){

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function wrapText(str, maxChars) {
  const words = String(str ?? "").replace(/\s+/g, " ").trim().split(" ");
  if (!words.length || !words[0]) return [];
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (w.length > maxChars) {
      if (cur) { lines.push(cur); cur = ""; }
      for (let i = 0; i < w.length; i += maxChars) lines.push(w.slice(i, i + maxChars));
      continue;
    }
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

function symZigH(x1, x2, y, col, label, sub) {
  const n = 6, dx = (x2 - x1) / n;
  let d = `M ${x1 - 14} ${y} L ${x1} ${y}`;
  for (let i = 0; i < n; i++) d += ` L ${x1 + (i + 0.5) * dx} ${y + (i % 2 ? -9 : 9)}`;
  d += ` L ${x2} ${y} L ${x2 + 14} ${y}`;
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.8" stroke-linejoin="round"/>
    <text x="${(x1 + x2) / 2}" y="${y - 14}" text-anchor="middle" font-size="14" font-weight="800" fill="${col}">${esc(label)}</text>
    ${sub ? `<text x="${(x1 + x2) / 2}" y="${y + 24}" text-anchor="middle" font-size="12" font-weight="700" fill="#475569">${esc(sub)}</text>` : ""}`;
}

function symZigV(x, y1, y2, col, label, sub) {
  const n = 5, dy = (y2 - y1) / n;
  let d = `M ${x} ${y1 - 10} L ${x} ${y1}`;
  for (let i = 0; i < n; i++) d += ` L ${x + (i % 2 ? 9 : -9)} ${y1 + (i + 0.5) * dy}`;
  d += ` L ${x} ${y2} L ${x} ${y2 + 10}`;
  const mid = (y1 + y2) / 2;
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.8" stroke-linejoin="round"/>
    <text x="${x + 16}" y="${mid - 4}" font-size="14" font-weight="800" fill="${col}">${esc(label)}</text>
    ${sub ? `<text x="${x + 16}" y="${mid + 14}" font-size="12" font-weight="700" fill="#475569">${esc(sub)}</text>` : ""}`;
}

/* ==================== PANEL 1: COMPONENT SCHEMATIC (x=40..865, y=240..660) ==================== */
function renderPanel1Schematic(s) {
  const kind = s.schKind || "generic";
  const m = s.schMeta || {};
  let inner = "";
  if (kind === "parallel100") {
    inner = `
      <circle cx="135" cy="405" r="36" fill="#fef3c7" stroke="#b45309" stroke-width="2.8"/>
      <text x="135" y="401" text-anchor="middle" font-size="14" font-weight="800" fill="#92400e">+5.0 V</text>
      <text x="135" y="419" text-anchor="middle" font-size="11" font-weight="800" fill="#b45309">1V/2.5A CC</text>
      <path d="M 135 369 V 332 H 795 M 135 441 V 478 H 795" fill="none" stroke="#0f3e6e" stroke-width="3.2"/>
      <text x="450" y="318" text-anchor="middle" font-size="13" font-weight="800" fill="#1d4ed8">+5V_MAIN Copper Bus (Bank Jumpers JP1–JP10 · 4-Wire Kelvin Nodes A–B)</text>
      ${symZigV(255, 350, 460, "#15803d", "R1=1.0 Ω", "60°C @ 1V")}
      <path d="M 415 332 V 478" stroke="#dc2626" stroke-width="4.2"/>
      <rect x="365" y="378" width="100" height="46" rx="7" fill="#fee2e2" stroke="#dc2626" stroke-width="2.6"/>
      <text x="415" y="398" text-anchor="middle" font-size="13" font-weight="800" fill="#991b1b">R14 = 0 Ω</text>
      <text x="415" y="416" text-anchor="middle" font-size="11" font-weight="700" fill="#dc2626">SHORT (Masks!)</text>
      <path d="M 565 332 V 378 M 565 432 V 478" stroke="#0284c7" stroke-width="2.8" stroke-dasharray="6 4"/>
      <circle cx="565" cy="382" r="5" fill="#fff" stroke="#0284c7" stroke-width="2.2"/>
      <circle cx="565" cy="428" r="5" fill="#fff" stroke="#0284c7" stroke-width="2.2"/>
      <text x="580" y="400" font-size="13" font-weight="800" fill="#0369a1">R27 = ∞ Ω</text>
      <text x="580" y="418" font-size="11.5" font-weight="700" fill="#0284c7">OPEN (25°C IR)</text>
      ${symZigV(725, 350, 460, "#1d4ed8", "R100=1 Ω", "Req=10mΩ")}`;
  } else if (kind === "dram_read") {
    inner = `
      <rect x="75" y="295" width="765" height="62" rx="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
      <text x="457" y="319" text-anchor="middle" font-size="13.5" font-weight="800" fill="#1e3a8a">DRAM Read Flow: 1. PRE (V_DD/2) -> 2. ACT (WL On) -> 3. Sense ΔV_BL -> 4. Restore -> 5. RD (CL) -> 6. Row Hit</text>
      <text x="457" y="343" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0f766e">Hierarchy: Channel (CH) -> Rank (RK) -> Bank Group (BG) -> Bank -> Row (ACT) -> Column (RD/WR)</text>
      <circle cx="155" cy="426" r="24" fill="#fef3c7" stroke="#b45309" stroke-width="2.2"/>
      <text x="155" y="422" text-anchor="middle" font-size="12" font-weight="800" fill="#92400e">V_cell</text>
      <text x="155" y="438" text-anchor="middle" font-size="11" fill="#b45309">0 or 1.1V</text>
      <line x1="179" y1="426" x2="295" y2="426" stroke="#0f172a" stroke-width="2.8"/>
      <line x1="295" y1="426" x2="295" y2="452" stroke="#0f172a" stroke-width="2.6"/>
      <line x1="275" y1="452" x2="315" y2="452" stroke="#15803d" stroke-width="4"/>
      <line x1="275" y1="464" x2="315" y2="464" stroke="#15803d" stroke-width="4"/>
      <text x="326" y="463" font-size="12.5" font-weight="800" fill="#15803d">C_cell=25fF</text>
      <rect x="340" y="400" width="90" height="46" rx="6" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2.2"/>
      <text x="385" y="421" text-anchor="middle" font-size="13" font-weight="800" fill="#1e3a8a">M_ACC</text>
      <text x="385" y="438" text-anchor="middle" font-size="11" fill="#1d4ed8">WL (V_PP)</text>
      <line x1="430" y1="426" x2="590" y2="426" stroke="#0f172a" stroke-width="2.8"/>
      <text x="510" y="416" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0369a1">BL / BL#</text>
      <polygon points="590,392 670,426 590,460" fill="#dcfce7" stroke="#15803d" stroke-width="2.6"/>
      <text x="618" y="430" text-anchor="middle" font-size="14" font-weight="800" fill="#14532d">SA</text>
      <rect x="688" y="400" width="142" height="52" rx="7" fill="#fff1f2" stroke="#e11d48" stroke-width="2.2"/>
      <text x="759" y="422" text-anchor="middle" font-size="12.5" font-weight="800" fill="#9f1239">ΔV_BL = 55 mV</text>
      <text x="759" y="440" text-anchor="middle" font-size="11" fill="#be123c">Restores Full V_DD!</text>`;
  } else if (kind === "sta") {
    inner = `
      <rect x="82" y="346" width="132" height="96" rx="8" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2.6"/>
      <polygon points="82,422 100,430 82,438" fill="none" stroke="#1d4ed8" stroke-width="2"/>
      <text x="148" y="376" text-anchor="middle" font-size="14" font-weight="800" fill="#1e3a8a">Launch FFs</text>
      <text x="148" y="398" text-anchor="middle" font-size="12" fill="#1d4ed8">tCQ_min = 300×10⁻¹² s</text>
      <text x="148" y="418" text-anchor="middle" font-size="12" fill="#1e40af">tCQ_max = 950×10⁻¹² s</text>
      <rect x="262" y="328" width="218" height="54" rx="7" fill="#dcfce7" stroke="#15803d" stroke-width="2.4"/>
      <text x="371" y="352" text-anchor="middle" font-size="13" font-weight="800" fill="#14532d">Slow Path (Setup Limit)</text>
      <text x="371" y="371" text-anchor="middle" font-size="12" fill="#15803d">t_logic(max) = 590×10⁻¹² s</text>
      <rect x="262" y="400" width="218" height="54" rx="7" fill="#fee2e2" stroke="#dc2626" stroke-width="2.4"/>
      <text x="371" y="423" text-anchor="middle" font-size="13" font-weight="800" fill="#991b1b">Fast Bypass Path (Hold!)</text>
      <text x="371" y="442" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">Fix: +≥820×10⁻¹² s Buffer</text>
      <polygon points="525,346 600,366 600,424 525,444" fill="#fef3c7" stroke="#b45309" stroke-width="2.6"/>
      <text x="562" y="398" text-anchor="middle" font-size="14" font-weight="800" fill="#92400e">MUX</text>
      <rect x="652" y="346" width="182" height="96" rx="8" fill="#f3e8ff" stroke="#7e22ce" stroke-width="2.6"/>
      <text x="743" y="376" text-anchor="middle" font-size="14" font-weight="800" fill="#581c87">Capture FF</text>
      <text x="743" y="398" text-anchor="middle" font-size="12" fill="#6b21a8">tsu=300ps · th=400ps</text>
      <text x="743" y="418" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">Skew = 750×10⁻¹² s</text>
      <path d="M 214 360 H 262 M 214 426 H 262 M 480 355 H 525 M 480 426 H 562 V 434 M 600 395 H 652" fill="none" stroke="#0f172a" stroke-width="2.6"/>`;
  } else if (kind === "rectifier") {
    inner = `
      <circle cx="132" cy="398" r="34" fill="#fef3c7" stroke="#b45309" stroke-width="2.6"/>
      <text x="132" y="395" text-anchor="middle" font-size="13" font-weight="800" fill="#92400e">12 Vrms</text>
      <text x="132" y="413" text-anchor="middle" font-size="11" fill="#b45309">60 Hz AC</text>
      <path d="M 166 382 H 240 M 166 414 H 240" stroke="#1e293b" stroke-width="2.6"/>
      <polygon points="310,336 380,398 310,460 240,398" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.8"/>
      <text x="310" y="393" text-anchor="middle" font-size="14" font-weight="800" fill="#1e40af">Si Bridge</text>
      <text x="310" y="412" text-anchor="middle" font-size="12" fill="#dc2626">2×0.7V = 1.4V</text>
      <path d="M 380 356 H 740 M 380 444 H 740 M 530 356 V 390 M 530 408 V 444 M 740 356 V 370 M 740 432 V 444" fill="none" stroke="#0f172a" stroke-width="2.6"/>
      <line x1="506" y1="390" x2="554" y2="390" stroke="#15803d" stroke-width="4.2"/>
      <line x1="506" y1="408" x2="554" y2="408" stroke="#15803d" stroke-width="4.2"/>
      <text x="564" y="396" font-size="13" font-weight="800" fill="#15803d">C = 1×10⁻³ F</text>
      <text x="564" y="413" font-size="11.5" fill="#15803d">(1000 µF)</text>
      ${symZigV(740, 372, 430, "#7e22ce", "RL=1×10³Ω", "15.57 Vpk")}`;
  } else if (kind === "zener_bjt") {
    inner = `
      <circle cx="122" cy="398" r="28" fill="#fef3c7" stroke="#b45309" stroke-width="2.6"/>
      <text x="122" y="402" text-anchor="middle" font-size="14" font-weight="800" fill="#92400e">+12 V</text>
      <path d="M 150 398 H 190 V 352 H 206" stroke="#0f172a" stroke-width="2.6" fill="none"/>
      ${symZigH(220, 315, 352, "#1d4ed8", "Rs=100Ω", "IT=69mA")}
      <path d="M 329 352 H 585 M 122 426 V 454 H 585 M 445 352 V 454" fill="none" stroke="#0f172a" stroke-width="2.6"/>
      <rect x="395" y="378" width="100" height="50" rx="7" fill="#dcfce7" stroke="#15803d" stroke-width="2.5"/>
      <text x="445" y="400" text-anchor="middle" font-size="13" font-weight="800" fill="#14532d">5.1V Zener</text>
      <text x="445" y="418" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">IZ=59mA</text>
      ${symZigV(585, 366, 440, "#dc2626", "RL=510Ω", "IL=10mA")}
      <rect x="685" y="346" width="150" height="104" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2.5"/>
      <text x="760" y="374" text-anchor="middle" font-size="13" font-weight="800" fill="#991b1b">NPN BJT Check</text>
      <text x="760" y="396" text-anchor="middle" font-size="12" fill="#7f1d1d">β·IB = 43×10⁻³ A</text>
      <text x="760" y="416" text-anchor="middle" font-size="12" font-weight="800" fill="#dc2626">ICsat=9.8×10⁻³A</text>
      <text x="760" y="436" text-anchor="middle" font-size="11.5" font-weight="800" fill="#b91c1c">=> SATURATED!</text>`;
  } else if (kind === "bridge_thevenin") {
    inner = `
      <circle cx="122" cy="398" r="28" fill="#fef3c7" stroke="#b45309" stroke-width="2.6"/>
      <text x="122" y="402" text-anchor="middle" font-size="14" font-weight="800" fill="#92400e">+12 V</text>
      <path d="M 122 370 V 336 H 605 M 122 426 V 464 H 605 M 265 336 V 464 M 485 336 V 464" fill="none" stroke="#0f172a" stroke-width="2.6"/>
      ${symZigV(265, 344, 384, "#1d4ed8", "R1=10k", "")}
      ${symZigV(265, 412, 452, "#1d4ed8", "R3=10k", "VA=6.00V")}
      ${symZigV(485, 344, 384, "#dc2626", "R2=10k", "")}
      ${symZigV(485, 412, 452, "#dc2626", "RT=9k", "VB=5.68V")}
      <path d="M 265 398 H 485" stroke="#15803d" stroke-width="2.4" stroke-dasharray="6 4"/>
      <text x="375" y="390" text-anchor="middle" font-size="12.5" font-weight="800" fill="#15803d">ΔV = +315.8×10⁻³ V</text>
      <rect x="645" y="346" width="188" height="106" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="2.5"/>
      <text x="739" y="375" text-anchor="middle" font-size="13" font-weight="800" fill="#14532d">10MΩ DMM Loading</text>
      <text x="739" y="399" text-anchor="middle" font-size="12" fill="#15803d">1M ∥ 10M = 909kΩ</text>
      <text x="739" y="423" text-anchor="middle" font-size="12.5" font-weight="800" fill="#dc2626">5.00V -> 4.762 V!</text>`;
  } else if (kind === "scope4ch") {
    inner = `
      <rect x="78" y="344" width="210" height="114" rx="8" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2.6"/>
      <text x="183" y="372" text-anchor="middle" font-size="14" font-weight="800" fill="#1e3a8a">GPU PDN + Step Load</text>
      <text x="183" y="396" text-anchor="middle" font-size="12.5" fill="#1d4ed8">L_pkg = 250×10⁻¹² H</text>
      <text x="183" y="418" text-anchor="middle" font-size="12.5" fill="#1e40af">R_PDN = 2.0×10⁻³ Ω</text>
      <text x="183" y="440" text-anchor="middle" font-size="12" font-weight="800" fill="#dc2626">ΔI = 40A / 20×10⁻⁹ s</text>
      <rect x="330" y="338" width="262" height="126" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="2.6"/>
      <text x="461" y="366" text-anchor="middle" font-size="14" font-weight="800" fill="#14532d">4-Ch Keysight Setup</text>
      <text x="461" y="390" text-anchor="middle" font-size="12.5" fill="#14532d">CH1: Exported CLK (SMA-BNC)</text>
      <text x="461" y="414" text-anchor="middle" font-size="12.5" fill="#14532d">CH2 &amp; CH4: N7020A (±24V off)</text>
      <text x="461" y="438" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0f766e">CH3: 1169B Shunt Current</text>
      <rect x="632" y="344" width="206" height="114" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="2.6"/>
      <text x="735" y="372" text-anchor="middle" font-size="14" font-weight="800" fill="#92400e">DDR / Log Cross-Check</text>
      <text x="735" y="396" text-anchor="middle" font-size="12.5" fill="#b45309">BW = 25.6×10⁹ B/s</text>
      <text x="735" y="418" text-anchor="middle" font-size="12.5" fill="#b45309">tRC = 45.75×10⁻⁹ s</text>
      <text x="735" y="440" text-anchor="middle" font-size="12" font-weight="800" fill="#dc2626">Audit Raw dmesg/EDAC!</text>
      <path d="M 288 401 H 330 M 592 401 H 632" stroke="#0f172a" stroke-width="2.8"/>`;
  } else {
    const b1 = String(m.b1 || "1. Source / Drive");
    const b2 = String(m.b2 || "2. Active Circuit / Law");
    const b3 = String(m.b3 || "3. Output / Target");
    inner = `
      <circle cx="122" cy="402" r="32" fill="#fff7ed" stroke="#c2410c" stroke-width="2.8"/>
      <text x="122" y="398" text-anchor="middle" font-size="13.5" font-weight="800" fill="#9a3412">V_S / In</text>
      <text x="122" y="416" text-anchor="middle" font-size="11" font-weight="700" fill="#c2410c">${esc(String(m.b1Sub || "DC / Stimulus").slice(0, 14))}</text>
      <path d="M 122 370 V 332 H 768 M 122 434 V 468 H 768" fill="none" stroke="#0f3e6e" stroke-width="3"/>
      <text x="275" y="320" font-size="13" font-weight="800" fill="#e11d48">Conventional Current I ──→ (Top Rail +)</text>
      <rect x="200" y="362" width="170" height="78" rx="9" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2.4"/>
      <text x="285" y="396" text-anchor="middle" font-size="${b1.length > 18 ? 12 : 14}" font-weight="800" fill="#1e3a8a">${esc(b1.slice(0, 22))}</text>
      <text x="285" y="420" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1d4ed8">${esc(String(m.b1Sub || "").slice(0, 24))}</text>
      <path d="M 370 401 H 416" stroke="#0f172a" stroke-width="2.8"/><polygon points="416,395 428,401 416,407" fill="#0f172a"/>
      <rect x="428" y="362" width="180" height="78" rx="9" fill="#dcfce7" stroke="#15803d" stroke-width="2.4"/>
      <text x="518" y="396" text-anchor="middle" font-size="${b2.length > 18 ? 12 : 14}" font-weight="800" fill="#14532d">${esc(b2.slice(0, 22))}</text>
      <text x="518" y="420" text-anchor="middle" font-size="11.5" font-weight="700" fill="#15803d">${esc(String(m.b2Sub || "").slice(0, 24))}</text>
      <path d="M 608 401 H 652" stroke="#0f172a" stroke-width="2.8"/><polygon points="652,395 664,401 652,407" fill="#0f172a"/>
      <rect x="664" y="362" width="174" height="78" rx="9" fill="#f3e8ff" stroke="#7e22ce" stroke-width="2.4"/>
      <text x="751" y="396" text-anchor="middle" font-size="${b3.length > 18 ? 12 : 14}" font-weight="800" fill="#581c87">${esc(b3.slice(0, 22))}</text>
      <text x="751" y="420" text-anchor="middle" font-size="11.5" font-weight="700" fill="#6b21a8">${esc(String(m.b3Sub || "").slice(0, 24))}</text>
      <circle cx="768" cy="332" r="6" fill="#0284c7"/><text x="784" y="336" font-size="13" font-weight="800" fill="#0369a1">Node A</text>
      <circle cx="768" cy="468" r="6" fill="#0284c7"/><text x="784" y="472" font-size="13" font-weight="800" fill="#0369a1">Node B (GND)</text>`;
  }

  const traceByKind = {
    parallel100: [
      "Blue Path: 2-wire DMM leads (~0.24 Ω) swamp 10×10⁻³ Ω! Clear 0 Ω shorts via 4W Kelvin + IR BEFORE opens.",
      "Parallel Rule: All 100 branches share +5V_MAIN & GND nodes; removing 1 short stops node collapse."
    ],
    dram_read: [
      "1T1C Read: Asserting WL shares C_cell (25 fF) onto C_BL (225 fF) -> ΔV_BL ≈ +55 mV detected by Sense Amp.",
      "Sense Amp & Restore: Diff SA amplifies ±55 mV back to full V_DD / 0 V and keeps active row open."
    ],
    sta: [
      "Setup (Next Clock Edge): Slowest path (590 ps) sets T_min = 2.59×10⁻⁹ s -> f_max = 386.10×10⁶ Hz.",
      "Hold (Same Clock Edge): Fast Q_S->MUX_S arrival (330 ps) violates Hold+Skew (1150 ps) by −820×10⁻¹² s!"
    ],
    scope4ch: [
      "CH1 (SMA-BNC CLK) & CH2/4 (N7020A Power-Rail) measure ΔV_IR (80 mV) + L·dI/dt (500 mV) accurately.",
      "CH3 (Keysight 1169B Differential Shunt) must be deskewed against CH2 before multiplying V(t)×I(t)."
    ],
    rectifier: [
      "2 conducting Si diodes per half-cycle subtract 2×0.7 V = 1.4 V and double ripple rate to 120 Hz.",
      "Never clip grounded passive scope GND across AC bridge nodes—use differential measurement!"
    ],
    zener_bjt: [
      "Zener Shunt KCL: Total current I_T = (12−5.1)/100 = 69 mA splits into load 10 mA + Zener 59 mA.",
      "BJT Switch Check: β·I_B (43 mA) > collector ceiling I_Csat (9.8 mA) => transistor is in Saturation!"
    ],
    bridge_thevenin: [
      "Bridge = 2 dividers: V_A = 6.00 V (ref) vs V_B = 5.68 V (thermistor) -> ΔV = +315.8×10⁻³ V.",
      "Zero V_S (short 12V to GND on paper) -> R_TH = (10k∥10k) + (10k∥9k) = 9.737×10³ Ω."
    ]
  };
  const pair = traceByKind[kind] || [];
  const c1 = wrapText(m.c1 || pair[0] || "Trace conventional current from (+) through load to GND return (-).", 76).slice(0, 2);
  const c2 = wrapText(m.c2 || pair[1] || "Verify series paths (same I) vs. parallel branches (same V across A-B).", 76).slice(0, 2);
  return `${inner}
    <rect x="64" y="514" width="780" height="122" rx="9" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="82" y="542" font-size="13.5" font-weight="800" fill="#0f3e6e">✓ How to Read This Schematic &amp; Current Path:</text>
    ${renderLines(c1, 82, 568, 20, "#1d4ed8", 13, 700)}
    ${renderLines(c2, 82, 608, 20, "#15803d", 13, 700)}`;
}

/* ==================== PANEL 2: CALIBRATED GRAPH + OPERATING POINT (x=890..1715) ==================== */
function renderPanel2Graph(s) {
  const kind = s.schKind || "generic";
  const m = s.schMeta || {};
  const x0 = 980, x1 = 1665, yTop = 328, yBot = 536;
  let grid = `<rect x="912" y="276" width="782" height="296" rx="10" fill="#091526" stroke="#334155" stroke-width="2"/>`;
  for (let c = 0; c <= 8; c++) {
    const gx = x0 + (c / 8) * (x1 - x0);
    grid += `<line x1="${gx}" y1="${yTop}" x2="${gx}" y2="${yBot}" stroke="#1e3a5f" stroke-width="1" stroke-dasharray="3 3"/>`;
  }
  for (let r = 0; r <= 4; r++) {
    const gy = yTop + (r / 4) * (yBot - yTop);
    grid += `<line x1="${x0}" y1="${gy}" x2="${x1}" y2="${gy}" stroke="#1e3a5f" stroke-width="1" stroke-dasharray="3 3"/>`;
  }
  grid += `<rect x="${x0}" y="${yTop}" width="${x1 - x0}" height="${yBot - yTop}" fill="none" stroke="#64748b" stroke-width="1.8"/>`;

  let traces = "";
  if (kind === "sta") {
    traces = `
      <path d="M 980 374 H 1090 V 338 H 1240 V 374 H 1420 V 338 H 1570 V 374 H 1665" fill="none" stroke="#34d399" stroke-width="3"/>
      <path d="M 980 438 H 1122 V 402 H 1460 V 438 H 1665" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <path d="M 980 506 H 1130 V 470 H 1472 V 506 H 1665" fill="none" stroke="#f43f5e" stroke-width="3"/>
      <rect x="1090" y="328" width="95" height="208" fill="#f43f5e" fill-opacity="0.18" stroke="#f43f5e" stroke-dasharray="5 3"/>
      <text x="970" y="362" text-anchor="end" font-size="12" font-weight="700" fill="#34d399">CLK</text>
      <text x="970" y="428" text-anchor="end" font-size="12" font-weight="700" fill="#38bdf8">Q_S</text>
      <text x="970" y="494" text-anchor="end" font-size="12" font-weight="700" fill="#fda4af">MUX_S</text>
      ${[0, 650, 1300, 1950, 2590].map((v, i) => `<text x="${x0 + (i / 4) * (x1 - x0)}" y="556" text-anchor="middle" font-size="11.5" font-weight="700" fill="#cbd5e1">${v}ps</text>`).join("")}
      <text x="1196" y="490" font-size="13" font-weight="800" fill="#fde047">Same-Edge Hold Viol: −820×10⁻¹² s</text>`;
  } else if (kind === "scope4ch" || kind === "rectifier" || kind === "dram_read") {
    traces = `
      <path d="M 980 368 H 1140 L 1185 458 Q 1245 394 1330 374 H 1470 L 1515 458 Q 1575 394 1645 374 H 1665" fill="none" stroke="#38bdf8" stroke-width="3.2"/>
      <path d="M 980 516 H 1140 V 478 H 1330 V 516 H 1470 V 478 H 1645 V 516 H 1665" fill="none" stroke="#34d399" stroke-width="2.8"/>
      <line x1="1140" y1="328" x2="1140" y2="536" stroke="#fbbf24" stroke-width="2.2" stroke-dasharray="5 3"/>
      <line x1="1470" y1="328" x2="1470" y2="536" stroke="#2dd4bf" stroke-width="2.2" stroke-dasharray="5 3"/>
      <circle cx="1185" cy="458" r="7" fill="#f43f5e" stroke="#fff" stroke-width="2"/>
      <text x="1140" y="320" text-anchor="middle" font-size="11.2" font-weight="800" fill="#fbbf24">Trig A (0 ns)</text>
      <text x="1470" y="320" text-anchor="middle" font-size="11.2" font-weight="800" fill="#5eead4">Cursor B</text>
      <text x="1202" y="462" font-size="12.5" font-weight="800" fill="#fda4af">Peak Transient / ΔV Operating Point</text>
      <text x="970" y="372" text-anchor="end" font-size="11.5" font-weight="700" fill="#7dd3fc">V_nom</text>
      <text x="970" y="458" text-anchor="end" font-size="11.5" font-weight="700" fill="#fda4af">V_min</text>
      <text x="970" y="514" text-anchor="end" font-size="11.5" font-weight="700" fill="#6ee7b7">I_step</text>
      ${["0", "1·T", "2·T", "3·T", "4·T"].map((t, i) => `<text x="${x0 + (i / 4) * (x1 - x0)}" y="556" text-anchor="middle" font-size="11.5" font-weight="700" fill="#cbd5e1">${t}</text>`).join("")}`;
  } else {
    // Operating-point linear / power curve matching 36cfb47e.jpg!
    let cPower = "";
    for (let k = 0; k <= 40; k++) {
      const f = k / 40, px = x0 + f * (x1 - x0), py = yBot - (yBot - yTop) * 0.86 * (f * f);
      cPower += (k === 0 ? "M" : "L") + px + " " + py;
    }
    const opX = x0 + 0.62 * (x1 - x0), opY = yBot - 0.62 * (yBot - yTop) * 0.88;
    traces = `
      <line x1="${x0}" y1="${yBot}" x2="${x1}" y2="${yBot - 0.88 * (yBot - yTop)}" stroke="#38bdf8" stroke-width="3.4"/>
      <path d="${cPower}" fill="none" stroke="#f59e0b" stroke-width="2.6" stroke-dasharray="6 4"/>
      <path d="M ${opX} ${yBot} V ${opY} H ${x0}" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-dasharray="5 3"/>
      <circle cx="${opX}" cy="${opY}" r="8" fill="#f43f5e" stroke="#ffffff" stroke-width="2.2"/>
      <rect x="${opX + 12}" y="${opY - 56}" width="256" height="62" rx="7" fill="#0f1e36" stroke="#f43f5e" stroke-width="1.8"/>
      <text x="${opX + 22}" y="${opY - 34}" font-size="12.5" font-weight="800" fill="#fda4af">Operating Point (Q-Pt)</text>
      <text x="${opX + 22}" y="${opY - 14}" font-size="11.5" font-weight="700" fill="#fde68a">${esc(wrapText(String(s.answer || ""), 31)[0] || String(s.answer || "").slice(0, 31))}</text>
      <text x="970" y="${yTop + 14}" text-anchor="end" font-size="11.5" font-weight="700" fill="#7dd3fc">Max</text>
      <text x="970" y="${opY + 4}" text-anchor="end" font-size="11.5" font-weight="800" fill="#fda4af">Op Pt</text>
      <text x="970" y="${yBot}" text-anchor="end" font-size="11.5" font-weight="700" fill="#cbd5e1">0</text>
      ${["0", "25%", "50%", "75%", "100%"].map((lbl, i) => `<text x="${x0 + (i / 4) * (x1 - x0)}" y="556" text-anchor="middle" font-size="11.5" font-weight="700" fill="#cbd5e1">${lbl}</text>`).join("")}`;
  }

  const wTitle = String(m.waveTitle || "Calibrated Response & Operating-Point Analyzer (10^3n)");
  const readNote = wrapText(m.waveNote || "Slope = 1/R (conductance) or bandwidth roll-off; verify Q-Point sits inside safe spec mask.", 74).slice(0, 2);
  return `${grid}
    <text x="932" y="297" font-size="${wTitle.length > 56 ? 13 : 14.5}" font-weight="800" fill="#7dd3fc">${esc(wTitle.slice(0, 68))}</text>
    ${traces}
    <rect x="912" y="582" width="782" height="54" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.6"/>
    ${renderLines(readNote, 928, 605, 19, "#065f46", 12.8, 700)}`;
}

/* ==================== PANEL 3: BENCH INSTRUMENT HOOKUP (x=1740..2560) ==================== */
function renderPanel3BenchHookup(s) {
  const kind = s.schKind || "generic";
  const isScope = kind === "scope4ch" || kind === "sta" || kind === "dram_read";
  let hw = "";
  if (isScope) {
    hw = `
      <rect x="1765" y="280" width="445" height="232" rx="10" fill="#0f172a" stroke="#334155" stroke-width="2.4"/>
      <text x="1785" y="308" font-size="14" font-weight="800" fill="#7dd3fc">4-Channel Keysight Oscilloscope Probe Mapping</text>
      <rect x="1785" y="324" width="405" height="38" rx="6" fill="#1e293b" stroke="#fbbf24"/>
      <text x="1798" y="348" font-size="12.5" font-weight="700" fill="#fde047">CH1 (Yellow): Exported Clock — Coax SMA-to-BNC (50 Ω)</text>
      <rect x="1785" y="370" width="405" height="38" rx="6" fill="#1e293b" stroke="#38bdf8"/>
      <text x="1798" y="394" font-size="12.5" font-weight="700" fill="#7dd3fc">CH2 (Cyan): Core Logic Rail — N7020A Power-Rail (±24V off)</text>
      <rect x="1785" y="416" width="405" height="38" rx="6" fill="#1e293b" stroke="#f472b6"/>
      <text x="1798" y="440" font-size="12.5" font-weight="700" fill="#f9a8d4">CH3 (Pink): Current-Sense Shunt — Keysight 1169B + Deskew</text>
      <rect x="1785" y="462" width="405" height="38" rx="6" fill="#1e293b" stroke="#34d399"/>
      <text x="1798" y="486" font-size="12.5" font-weight="700" fill="#6ee7b7">CH4 (Green): M-Rail / RESET# — N7020A / <5mm Gnd Spring</text>`;
  } else {
    hw = `
      <rect x="1765" y="280" width="235" height="232" rx="9" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
      <text x="1882" y="304" text-anchor="middle" font-size="13" font-weight="800" fill="#dc2626">+ Rail (CC PSU)</text>
      <rect x="1792" y="320" width="180" height="128" rx="6" fill="#e2e8f0" stroke="#94a3b8"/>
      <rect x="1852" y="346" width="60" height="72" rx="4" fill="#fde68a" stroke="#b45309" stroke-width="2"/>
      <text x="1882" y="388" text-anchor="middle" font-size="12" font-weight="800" fill="#78350f">DUT Load</text>
      <path d="M 1882 316 V 346 M 1882 418 V 448" stroke="#1d4ed8" stroke-width="3"/>
      <text x="1882" y="472" text-anchor="middle" font-size="13" font-weight="800" fill="#1d4ed8">GND Return (0 V)</text>
      <text x="1882" y="494" text-anchor="middle" font-size="11.5" font-weight="700" fill="#475569">5-hole strip shares column</text>
      <rect x="2018" y="280" width="192" height="232" rx="14" fill="#facc15" stroke="#a16207" stroke-width="3"/>
      <rect x="2036" y="298" width="156" height="58" rx="6" fill="#dbeafe" stroke="#334155" stroke-width="2"/>
      <text x="2114" y="335" text-anchor="middle" font-size="22" font-weight="900" fill="#0f172a">${esc(String(s.dmmReadout || "4W KELVIN"))}</text>
      <circle cx="2114" cy="404" r="32" fill="#1e293b" stroke="#475569" stroke-width="3"/>
      <line x1="2114" y1="404" x2="2092" y2="386" stroke="#f8fafc" stroke-width="4"/>
      <text x="2066" y="466" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0f172a">COM (-)</text>
      <text x="2162" y="466" text-anchor="middle" font-size="11.5" font-weight="800" fill="#991b1b">V·Ω (+)</text>
      <text x="2114" y="494" text-anchor="middle" font-size="11" font-weight="800" fill="#713f12">V Parallel | I Series</text>`;
  }

  const safetyNotes = [
    "1. Verify PSU current-limit & polarity BEFORE energizing.",
    "2. Measure Voltage in PARALLEL; measure Ohms ONLY POWER-OFF.",
    "3. Use 4-wire Kelvin for <1 Ω shunts & <5 mm ground springs.",
    "4. Capture raw scope/UART/dmesg data BEFORE resetting DUT."
  ];
  return `${hw}
    <rect x="2224" y="280" width="314" height="232" rx="9" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
    <text x="2240" y="308" font-size="13.5" font-weight="800" fill="#14532d">Safe Instrument Protocol</text>
    ${safetyNotes.map((n, i) => {
      const ls = wrapText(n, 33).slice(0, 2);
      return renderLines(ls, 2240, 336 + i * 44, 17, "#1e293b", 12, 600);
    }).join("")}
    <rect x="1765" y="526" width="773" height="110" rx="9" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.6"/>
    <text x="1782" y="552" font-size="13.5" font-weight="800" fill="#1e3a8a">Post-Math Probe Checkpoints (Apply Your Numbers Here):</text>
    ${renderLines(wrapText((s.rationale && s.rationale[0]) || "Compare measured operating point against calculated 10^(3n) paper prediction.", 84).slice(0, 2), 1782, 578, 19, "#0f172a", 12.8, 600)}
    ${renderLines(wrapText((s.rationale && s.rationale[1]) || "Confirm probe offset, trigger & ground return before PASS/FAIL.", 78).slice(0, 1), 1782, 620, 19, "#0f766e", 12.8, 700)}`;
}

/* ==================== MAIN 2600x1400 FULL LECTURE & SOLUTION SHEET RENDERER ==================== */

/* Draw typeset fractions with native SVG primitives: survives PNG export.
   An ambiguous expression remains source text rather than a guessed algebraic fraction. */
function svgNotebookEquation(raw, x, y) {
  const value = String(raw || "").split(/\s+;\s+|\s+\|\s+/)[0].trim();
  const normalized = value.replace(/\*/g,"×").replace(/\^2\b/g,"²")
    .replace(/\^3\b/g,"³").replace(/10\^\(-3\)/g,"10⁻³")
    .replace(/10\^\(3\)/g,"10³");
  const eq = normalized.indexOf("=");
  const lhs = eq >= 1 ? normalized.slice(0, eq+1).trim() : "";
  const rhs = eq >= 1 ? normalized.slice(eq+1).trim() : "";
  let depth=0,slashes=[];
  for(let i=0;i<rhs.length;i++){
    if(rhs[i]==="(")depth++;
    else if(rhs[i]===")")depth--;
    else if(rhs[i]==="/"&&depth===0)slashes.push(i);
  }
  if(lhs.length<=22&&rhs.length<=76&&slashes.length===1){
    let a=rhs.slice(0,slashes[0]).trim(),b=rhs.slice(slashes[0]+1).trim();
    if(a.startsWith("(")&&a.endsWith(")"))a=a.slice(1,-1);
    if(b.startsWith("(")&&b.endsWith(")"))b=b.slice(1,-1);
    if(a.length<30&&b.length<30&&!/[=]/.test(a+b)&&!/\s[+\-]\s/.test(a)&&!/\s[+\-]\s/.test(b)){
      return '<g class="nb-svg-math-fraction" aria-label="'+esc(value)+'">'+
        '<text x="'+(x-60)+'" y="'+(y+32)+'" text-anchor="end" font-size="15" font-family="Arial,sans-serif" font-weight="800" fill="#163550">'+esc(lhs)+'</text>'+
        '<text x="'+x+'" y="'+(y+20)+'" text-anchor="middle" font-size="15" font-family="Arial,sans-serif" font-weight="800" fill="#163550">'+esc(a)+'</text>'+
        '<line class="nb-eq-fraction-rule" x1="'+(x-110)+'" y1="'+(y+27)+'" x2="'+(x+110)+'" y2="'+(y+27)+'" stroke="#b94a58" stroke-width="2.2"/>'+
        '<text x="'+x+'" y="'+(y+45)+'" text-anchor="middle" font-size="15" font-family="Arial,sans-serif" font-weight="800" fill="#163550">'+esc(b)+'</text></g>';
    }
  }
  const shortened=normalized.length>69?normalized.slice(0,66)+"…":normalized;
  return '<text class="nb-svg-source-equation" x="'+x+'" y="'+(y+34)+'" font-size="'+(shortened.length>46?12:15)+'" font-family="Arial,sans-serif" text-anchor="middle" font-weight="750" fill="#163550" aria-label="'+esc(value)+'">'+esc(shortened)+'</text>';
}
function svgNotebookFactorLabel(spec, x, y) {
  const g=spec.factorGiven;
  if(!g || !Number.isFinite(g.value) || !Number.isFinite(g.power)){
    return '<text x="'+x+'" y="'+(y+34)+'" text-anchor="middle" font-size="14" font-family="Arial,sans-serif" font-weight="700" fill="#375d78">No prefixed given: skip unit conversion (do not invent one).</text>';
  }
  const p = g.power<0?"10⁻"+Math.abs(g.power):"10"+String(g.power).replace(/[0-9]/g,z=>("⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(z)]));
  const label=String(g.unit),base=String(g.base);
  const result=String(Number(g.scaled.toPrecision(7)))+" "+base;
  const start=x-245;
  const f=(a,top,bottom,w)=>'<text x="'+a+'" y="'+(y+18)+'" text-anchor="middle" font-size="14" font-weight="800" fill="#163550">'+esc(top)+'</text>'+
    '<line class="nb-eq-fraction-rule" x1="'+(a-w/2)+'" x2="'+(a+w/2)+'" y1="'+(y+27)+'" y2="'+(y+27)+'" stroke="#b94a58" stroke-width="2.2"/>'+
    '<text x="'+a+'" y="'+(y+45)+'" text-anchor="middle" font-size="14" font-weight="800" fill="#163550">'+esc(bottom)+'</text>';
  return '<g class="nb-svg-factor-label" aria-label="'+esc(g.raw+" times 10 to the "+g.power+" "+base+" per "+label+" equals "+result)+'">'+
    f(start+58,String(g.value)+" "+label,"1",108)+
    '<line class="nb-eq-cancel-stroke" x1="'+(start+67)+'" x2="'+(start+103)+'" y1="'+(y+8)+'" y2="'+(y+23)+'" stroke="#d54457" stroke-width="2.4"/>'+
    '<text x="'+(start+136)+'" y="'+(y+32)+'" text-anchor="middle" font-size="17" font-weight="800" fill="#12516b">×</text>'+
    f(start+220,p+" "+base,"1 "+label,140)+
    '<line class="nb-eq-cancel-stroke" x1="'+(start+241)+'" x2="'+(start+277)+'" y1="'+(y+36)+'" y2="'+(y+48)+'" stroke="#d54457" stroke-width="2.4"/>'+
    '<text x="'+(start+322)+'" y="'+(y+32)+'" font-size="17" font-weight="800" fill="#12516b">=</text>'+
    '<text x="'+(start+343)+'" y="'+(y+32)+'" font-size="16" font-weight="850" fill="#0d7953">'+esc(result)+'</text></g>';
}

function renderNotebookSpreadSVG(spec) {
  const s = spec || {};
  const header = esc(s.header || "ENGINEERING STUDY & COMPLETE SOLUTION SHEET");
  const qLines = wrapText(s.question || "", 118).slice(0, 2);
  const answerPill = esc(s.answer || "Verified Solution");
  const fontMain = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
  const fontMono = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

  const eqChips = (Array.isArray(s.keyEquations) && s.keyEquations.length
    ? s.keyEquations
    : (s.mathSteps || []).slice(0, 3)).slice(0, 3);
  const tbl = s.table || { headers: ["Raw Input", "Prefix", "10^(3n) Base SI"], rows: [["Givens", "10^0", "Base SI"]] };
  const colCount = Math.max(2, Math.min(3, (tbl.headers || []).length));
  const colWidths = colCount === 3 ? [154, 198, 210] : [260, 302];
  const colStarts = colCount === 3 ? [64, 218, 416] : [64, 324];

  const mathLines = (Array.isArray(s.mathSteps) ? s.mathSteps : []).slice(0, 7);
  const resolveSteps = (Array.isArray(s.postMathResolution) && s.postMathResolution.length
    ? s.postMathResolution
    : (Array.isArray(s.babySteps) ? s.babySteps : [])).slice(0, 5);
  const trapLines = wrapText(s.trapBody || "", 72).slice(0, 4);
  const spokenLines = wrapText(s.interviewScript || (s.intuition || ""), 78).slice(0, 10);
  const codeLines = (Array.isArray(s.codeLines) ? s.codeLines : []).slice(0, 6);

  const card = (x, y, w, h, title, hdrFill) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M ${x} ${y + 14} Q ${x} ${y} ${x + 14} ${y} H ${x + w - 14} Q ${x + w} ${y} ${x + w} ${y + 14} V ${y + 44} H ${x} Z" fill="${hdrFill || "#124570"}"/>
    <text x="${x + 18}" y="${y + 29}" font-family="${fontMain}" font-size="16" font-weight="800" fill="#ffffff">${esc(title)}</text>`;

  return `<svg class="nb-spread-svg" viewBox="0 0 2600 1400" role="img" aria-label="${header}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ess_bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#eaf1f8"/><stop offset="100%" stop-color="#f5f8fc"/>
      </linearGradient>
      <linearGradient id="ess_top" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#0b2545"/><stop offset="100%" stop-color="#144272"/>
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="2600" height="1400" fill="url(#ess_bg)"/>

    <!-- TOP NAVY LECTURE HEADER -->
    <rect x="0" y="0" width="2600" height="96" fill="url(#ess_top)"/>
    <text x="44" y="44" font-family="${fontMain}" font-size="30" font-weight="900" fill="#ffffff">Engineering Study &amp; Complete Solution Sheet — Full Lecture Standard</text>
    <text x="44" y="76" font-family="${fontMain}" font-size="16.5" font-weight="700" fill="#bae6fd">${header}</text>
    <rect x="1920" y="18" width="640" height="60" rx="12" fill="#0d3b66" stroke="#38bdf8" stroke-width="2"/>
    <text x="2240" y="42" text-anchor="middle" font-family="${fontMain}" font-size="13" font-weight="800" fill="#7dd3fc">VERIFIED SOLUTION &amp; SPEC TARGET</text>
    <text x="2240" y="65" text-anchor="middle" font-family="${fontMain}" font-size="${answerPill.length > 52 ? 13 : 15.5}" font-weight="800" fill="#ffffff">${answerPill}</text>

    <!-- QUESTION STRIP -->
    <rect x="40" y="112" width="2520" height="94" rx="12" fill="#ffffff" stroke="#bfd3e6" stroke-width="2"/>
    <text x="64" y="140" font-family="${fontMain}" font-size="13.5" font-weight="800" fill="#0284c7">PROBLEM STATEMENT &amp; ENGINEERING SCENARIO</text>
    ${renderLines(qLines, 64, 166, 24, "#0f172a", 16.5, 700, fontMain)}

    <!-- ROW 1: 3 VISUAL PANELS (y=220..654) -->
    ${card(40, 220, 825, 434, "1. Circuit / Hardware Schematic & Current Flow", "#124570")}
    ${renderPanel1Schematic(s)}

    ${card(890, 220, 825, 434, "2. Calibrated Operating-Point & Waveform Graph", "#0e5a6f")}
    ${renderPanel2Graph(s)}

    ${card(1740, 220, 820, 434, "3. Bench Measurement, DMM / 4-Ch Scope & Probe Hookup", "#124570")}
    ${renderPanel3BenchHookup(s)}

    <!-- ROW 2: 4 COMPLETE ENGINEER SOLUTION CARDS (y=674..1310) — ZERO GENERALIST FLUFF! -->
    ${card(40, 674, 610, 636, "4. Governing Equations & 10^(3n) Prefix Table", "#1e3a8a")}
    ${eqChips.map((eqStr, idx) => `
      <rect x="64" y="${736 + idx * 72}" width="562" height="58" rx="9" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.8"/>
      ${idx===2 ? svgNotebookFactorLabel(s, 345, 736 + idx * 72) : svgNotebookEquation(eqStr, 345, 736 + idx * 72)}
    `).join("")}
    <text x="64" y="974" font-family="${fontMain}" font-size="15" font-weight="800" fill="#1e3a8a">Given Quantities -> Base SI 10^(3n) Conversion Table:</text>
    <rect x="64" y="988" width="562" height="36" fill="#1e3a8a"/>
    ${(tbl.headers || []).slice(0, colCount).map((h, i) => `<text x="${colStarts[i] + 8}" y="1011" font-family="${fontMain}" font-size="12" font-weight="800" fill="#ffffff">${esc(String(h).slice(0, 22))}</text>`).join("")}
    ${(tbl.rows || []).slice(0, 4).map((row, rIdx) => {
      const ry = 1024 + rIdx * 40;
      const hi = rIdx === s.highlightRow;
      return `<rect x="64" y="${ry}" width="562" height="40" fill="${hi ? "#dcfce7" : (rIdx % 2 ? "#f1f5f9" : "#ffffff")}" stroke="#cbd5e1"/>` +
        row.slice(0, colCount).map((c, cIdx) => {
          const maxCh = cIdx === 0 ? 18 : 23;
          const valStr = String(c).length > maxCh ? String(c).slice(0, maxCh - 1) + "…" : String(c);
          return `<text x="${colStarts[cIdx] + 8}" y="${ry + 25}" font-family="${fontMono}" font-size="${valStr.length > 20 ? 10.2 : 11.2}" font-weight="${hi ? 800 : 600}" fill="#0f172a">${esc(valStr)}</text>`;
        }).join("");
    }).join("")}
    <rect x="64" y="1202" width="562" height="90" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="80" y="1226" font-family="${fontMain}" font-size="13" font-weight="800" fill="#0369a1">Prefix Multiplier Quick Rule:</text>
    <text x="80" y="1250" font-family="${fontMono}" font-size="12.5" font-weight="700" fill="#1e293b">p = 10⁻¹² | n = 10⁻⁹ | µ = 10⁻⁶ | m = 10⁻³</text>
    <text x="80" y="1274" font-family="${fontMono}" font-size="12.5" font-weight="700" fill="#1e293b">k = 10⁺³  | M = 10⁺⁶ | G = 10⁺⁹ (Convert FIRST!)</text>

    ${card(670, 674, 620, 636, "5. Complete Worked Math Solution (10^(3n))", "#0f766e")}
    ${mathLines.map((ln, idx) => {
      const sy = 738 + idx * 78;
      const isLast = idx === mathLines.length - 1;
      const ls = wrapText(String(ln), 62).slice(0, 2);
      return `<rect x="692" y="${sy}" width="576" height="66" rx="8" fill="${isLast ? "#dcfce7" : "#f8fafc"}" stroke="${isLast ? "#15803d" : "#cbd5e1"}" stroke-width="${isLast ? 2.4 : 1.4}"/>` +
        renderLines(ls, 706, sy + 24, 21, isLast ? "#14532d" : "#0f172a", isLast ? 12.8 : 12.2, isLast ? 800 : 700, fontMono);
    }).join("")}

    ${card(1310, 674, 625, 636, "6. Post-Math Engineer Resolution & Product Action", "#0f5132")}
    ${resolveSteps.map((st, idx) => {
      const sy = 736 + idx * 110;
      const ls = wrapText(`${idx + 1}. ${String(st)}`, 68).slice(0, 4);
      return `<rect x="1332" y="${sy}" width="581" height="98" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1.6"/>` +
        renderLines(ls, 1346, sy + 24, 19, "#0f172a", 12, 600, fontMain);
    }).join("")}

    ${card(1955, 674, 605, 636, "7. Hiring-Manager Answer & Traps to Avoid", "#991b1b")}
    <rect x="1977" y="734" width="561" height="226" rx="10" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
    <text x="1995" y="758" font-family="${fontMain}" font-size="13.5" font-weight="800" fill="#1e3a8a">🎤 What to Say Live to the Hiring Manager:</text>
    ${renderLines(spokenLines, 1995, 780, 17, "#0f172a", 11.2, 600, fontMain)}

    <rect x="1977" y="972" width="561" height="134" rx="10" fill="#fff1f2" stroke="#e11d48" stroke-width="2"/>
    <text x="1995" y="998" font-family="${fontMain}" font-size="12.8" font-weight="800" fill="#991b1b">⚠️ ${esc(wrapText(String(s.trapTitle || "Critical Measurement Trap"), 54)[0] || "")}</text>
    ${renderLines(trapLines, 1995, 1022, 18, "#7f1d1d", 11.4, 700, fontMain)}

    <rect x="1977" y="1120" width="561" height="172" rx="10" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <text x="1995" y="1146" font-family="${fontMain}" font-size="13.5" font-weight="800" fill="#6ee7b7">✓ Verified Check Script / Lab Sequence:</text>
    ${codeLines.map((cl, i) => `<text x="1995" y="${1172 + i * 21}" font-family="${fontMono}" font-size="10.4" font-weight="600" fill="${String(cl).includes("#") || String(cl).includes("//") ? "#93c5fd" : "#e2e8f0"}">${esc(String(cl).slice(0, 74))}</text>`).join("")}

    <!-- BOTTOM KEY TAKEAWAYS BAR -->
    <rect x="40" y="1328" width="2520" height="54" rx="10" fill="#0b2545"/>
    <text x="64" y="1361" font-family="${fontMain}" font-size="15.5" font-weight="800" fill="#fde047">ENGINEER RULE:</text>
    <text x="220" y="1361" font-family="${fontMain}" font-size="15" font-weight="700" fill="#ffffff">1) Convert prefixes to 10^(3n) FIRST  →  2) Solve Paper Math  →  3) Trace Schematic Nets/Jumpers  →  4) Probe Safely &amp; Isolate via A-B-A  →  5) Verify Fix on Product</text>
  </svg>`;
}

/* ==================== 12 TOPIC-PURE FLAGSHIP SHEETS (ZERO ENGR 852 / COURSE CODE MIXING) ==================== */
const FLAGSHIP_SPREAD_SPECS = [
  {
    file: "spread_01_muon_100_parallel_resistors_debug.png",
    cat: "avionics",
    topicIds: ["parallel", "safety", "schematics", "instruments", "rca"],
    header: "AVIONICS HARDWARE DEBUG — +5V Rail Feeding 100 Parallel 1Ω Resistors (Mixed Open + 0Ω Shorts)",
    question: "A +5.0 V rail feeds N = 100 parallel 1.0 Ω resistors. Some fail OPEN (∞ Ω) and some fail SHORTED (0 Ω). Solve paper math in 10^(3n), trace the schematic, and isolate via 4W Kelvin & IR.",
    answer: "Healthy Req = 10×10⁻³ Ω (500 A) · Clear 0Ω Shorts First -> Count ∞Ω Opens",
    schKind: "parallel100",
    dmmReadout: "10.53 mΩ",
    keyEquations: ["R_eq = R / N = 1.0 / 100 = 10.0×10⁻³ Ω", "I_nom = 5.0 V / (10×10⁻³ Ω) = 500 A", "N_open = 100 − (1.0 Ω / R_4wire)"],
    intuition: "Parallel branches share two copper nodes, so conductances add: G_total = 100 S => R_eq = 10×10⁻³ Ω. A single 0 Ω short clamps the bus and masks EVERY open resistor until cleared!",
    mathSteps: [
      "1) Healthy Conductance Sum: G = 100 × (1 / 1.0×10⁰ Ω) = 100.0 S",
      "2) Healthy R_eq = 1 / 100 = 0.010 Ω = 10.0 × 10⁻³ Ω (10.0 mΩ)",
      "3) Nominal 5V Demand: I = 5.0 / 10×10⁻³ = 500 A (P = 2.50 × 10³ W!)",
      "4) Why 2W DMM Fails: Lead R = 240×10⁻³ Ω >> 10×10⁻³ Ω (+2400% err)",
      "5) Clear Shorts via IR + Pad Lift (0.000 Ω) -> 95 healthy + 5 opens",
      "6) Final 4W Kelvin: R_eq = 1/95 = 10.526×10⁻³ Ω",
      "7) Exact Open Count: N_open = 100 − (1 / 10.526×10⁻³) = 5 Opens!"
    ],
    table: {
      headers: ["Fault State", "4-Wire Kelvin", "IR @ 1V CC Bias"],
      rows: [
        ["Healthy 100×1Ω", "10.00×10⁻³ Ω", "All 100 warm @ 60°C"],
        ["2 Shorts + 5 Opens", "~0.5×10⁻³ Ω", "Shorts hot; masks opens"],
        ["Shorts Cleared (95)", "10.53×10⁻³ Ω", "5 Opens stay 25°C cold"]
      ]
    },
    highlightRow: 1,
    postMathResolution: [
      "Solve paper math first: R_eq = 10×10⁻³ Ω, 1 open = +10.1 mΩ, 1 short ≈ 0 Ω.",
      "Open schematic: locate +5V_MAIN net, R1..R100, and bank jumpers JP1..JP10.",
      "Power OFF: switch to 4-wire Kelvin ohmmeter (eliminates 0.24 Ω lead error).",
      "Clear shorts FIRST: inject CC-limited 1V/2.5A, image hotspots with IR camera & lift 1 pad per suspect (0.000 Ω confirms short) until 4W R_eq ≥ 10.00 mΩ.",
      "Find opens SECOND: compute N_open = 100 − 1/R_eq, apply 1V bias so healthy resistors warm to 60°C while opens stay 25°C cold spots on IR, rework joints & verify 4W R_eq = 10.0 mΩ."
    ],
    interviewScript: "First I compute healthy R_eq = 10×10⁻³ Ω on paper and confirm 2-wire DMM leads (~0.24 Ω) fail here. Next on the schematic I locate bank jumpers JP1–JP10 and switch to 4-wire Kelvin. Because any 0 Ω short masks opens, I inject a current-limited 1V/2.5A bias, locate hotspots with an IR thermal camera and mV gradient, lift one pad on each suspect to verify 0.000 Ω, then once 4W R_eq rises to ≥ 10 mΩ I compute N_open = 100 − 1/R_eq and spot the remaining 25°C cold opens on IR.",
    trapTitle: "Clear 0Ω Shorts With 4W Kelvin BEFORE Finding Opens!",
    trapBody: "Never connect 5V directly (500 A!) and never trust 2-wire DMM leads on milliohm buses.",
    codeLines: [
      "def debug_100x1ohm(r4w_ohm=10.526e-3, n=100, r_nom=1.0):",
      "    if r4w_ohm < (r_nom/n)*0.85: return 'INJECT_1V_CC + IR + LIFT_SHORTS'",
      "    n_open = n - round(r_nom / r4w_ohm)  # 100 - 95 = 5 opens",
      "    return {'Req': r4w_ohm, 'n_open': n_open}"
    ]
  },
  {
    file: "spread_02_avionics_timing_setup_hold_clock_margin.png",
    cat: "avionics",
    topicIds: ["timing", "components", "buses"],
    header: "AVIONICS & SoC TIMING — Setup Margin (f_max = 386.10 MHz) vs. Same-Edge Hold Race (−820×10⁻¹² s)",
    question: "Synchronous flight FPGA/SoC path: t_CQ=300..950×10⁻¹²s, Slow Logic=590×10⁻¹²s, Fast Select Path=30×10⁻¹²s, t_su=300×10⁻¹²s, t_h=400×10⁻¹²s, skew=750×10⁻¹²s. Find f_max & Hold fix.",
    answer: "Setup Tmin = 2.59×10⁻⁹ s (386.10 MHz) · Hold Slack = −820×10⁻¹² s (Add Buffer!)",
    schKind: "sta",
    dmmReadout: "386.1 MHz",
    keyEquations: ["T_min = tCQ_max + tLogic_max + t_su + t_skew", "f_max = 1 / T_min = 386.10×10⁶ Hz", "HoldSlack = (tCQ_min + tMin) − (t_h + t_skew)"],
    intuition: "Setup checks the NEXT clock edge (worst-case slow path sets max frequency). Hold checks the SAME clock edge—fast bypass paths race through before t_hold closes!",
    mathSteps: [
      "1) Slowest Setup Path: 590 × 10⁻¹² s (590 ps)",
      "2) Setup T_min: (950 + 590 + 300 + 750) × 10⁻¹² = 2.590 × 10⁻⁹ s",
      "3) Max Frequency: f_max = 1 / (2.590 × 10⁻⁹) = 386.10 × 10⁶ Hz",
      "4) Fast Hold Arrival: tCQ_min + tPath_min = (300 + 30) × 10⁻¹² = 330×10⁻¹² s",
      "5) Required Hold Window: t_h + t_skew = (400 + 750) × 10⁻¹² = 1.150×10⁻⁹ s",
      "6) Hold Slack = 330×10⁻¹² − 1150×10⁻¹² = −820 × 10⁻¹² s (FAIL!)",
      "7) Physical Resolution: Insert ≥ +820×10⁻¹² s delay buffer on fast net"
    ],
    table: {
      headers: ["Timing Path", "Min / Max Delay", "Hold Slack (Skew)"],
      rows: [
        ["Fast Bypass Q_S->S", "330 / 170 ps", "−820×10⁻¹² s (FAIL)"],
        ["Medium Path", "410 / 390 ps", "−740×10⁻¹² s (FAIL)"],
        ["Critical Setup Path", "460 / 590 ps", "Sets f_max = 386.1MHz"]
      ]
    },
    highlightRow: 0,
    postMathResolution: [
      "Solve Setup & Hold separately on paper in 10⁻¹² s: confirm −820×10⁻¹² s Hold deficit.",
      "Verify on oscilloscope/Shmoo: sweep f_clk down to 1 MHz—if failures persist at ALL frequencies, confirm it is a SAME-EDGE Hold race (not Setup).",
      "Inspect schematic / RTL clock distribution to check whether high clock skew (750×10⁻¹² s) or unbuffered short path causes the race.",
      "On hardware/bitstream: insert ≥ +820×10⁻¹² s delay buffer on the fast path OR deskew clock tree (never lower f_clk hoping to fix hold!).",
      "Re-verify both corners (Fast/Cold for Hold, Slow/Hot/Vmin for Setup ≥ +200 ps slack) before signing off flight bitstream."
    ],
    interviewScript: "Setup and Hold live in two different equations. Setup governs T_clk(min) = 2.59×10⁻⁹ s (386.10 MHz), so slowing the clock fixes setup. Hold happens on the SAME rising edge where T_clk cancels out completely—our fast 330 ps arrival violates the 1.15 ns hold+skew window by −820×10⁻¹² s. On the bench, I prove Hold via a Voltage/Frequency Shmoo showing failures at every low frequency, then fix it physically by inserting ≥ +820 ps delay buffer or tightening clock skew.",
    trapTitle: "Slowing f_clk NEVER Fixes Hold Violations!",
    trapBody: "T_clk does not exist in the Hold inequality (tCQ_min + tLogic_min ≥ t_h + t_skew). Dropping frequency to 1 Hz still fails on the same edge.",
    codeLines: [
      "def verify_sta(t_cq=(300e-12,950e-12), t_lg=(30e-12,590e-12), tsu=300e-12, th=400e-12, sk=750e-12):",
      "    f_max = 1.0 / (t_cq[1] + t_lg[1] + tsu + sk)  # 386.10e6 Hz",
      "    hold_slack = (t_cq[0] + t_lg[0]) - (th + sk)    # -820.0e-12 s (FAIL!)",
      "    return {'f_max_Hz': f_max, 'min_buffer_fix_s': max(0, -hold_slack)}"
    ]
  },
  {
    file: "spread_03_nvidia_slt_dram_1t1c_read_path_lecture.png",
    cat: "nvidia",
    topicIds: ["memory-ddr", "dram", "pdn-power", "high-speed-io"],
    header: "NVIDIA SLT PREP — DRAM 1T1C Read Path, Bitline Charge Share (55 mV), Row Hit vs Miss & Failure Isolation",
    question: "Compute 1T1C read ΔV_BL (C_cell=25×10⁻¹⁵F, C_BL=225×10⁻¹⁵F, V_DD=1.10V), DDR4-3200 peak BW & t_RC, and isolate silent DRAM failures when a script prints PASS.",
    answer: "ΔV_BL = 55.0×10⁻³ V · BW = 25.6×10⁹ B/s · t_RC = 45.75×10⁻⁹ s · Audit Raw EDAC!",
    schKind: "dram_read",
    dmmReadout: "55.0 mV",
    keyEquations: ["ΔV_BL = (V_cell − V_DD/2)·[C_cell/(C_cell+C_BL)]", "BW_DDR = (MT/s × 10⁶ × Width) / 8", "t_RC = t_RAS + t_RP (Row Cycle Time)"],
    intuition: "1T1C DRAM reads share femtocoulomb cell charge onto a 10× larger bitline, shifting BL by only ~55–150 mV—which destroys cell charge unless the Differential Sense Amplifier immediately restores full V_DD/0V and holds the row open.",
    mathSteps: [
      "1) Precharge Bitline V_PRE = 1.10 V / 2 = 550 × 10⁻³ V",
      "2) Capacitance Ratio = 25×10⁻¹⁵ / (25×10⁻¹⁵ + 225×10⁻¹⁵) = 0.100",
      "3) Read Bitline Swing: ΔV_BL = 550×10⁻³ × 0.100 = +55.0 × 10⁻³ V",
      "4) Hot Refresh (>85°C 2×): t_REFI drops 3.9×10⁻⁶ s -> 1.95 × 10⁻⁶ s",
      "5) DDR4-3200 Peak BW: (3.2×10⁹ T/s × 64b) / 8 = 25.6 × 10⁹ B/s",
      "6) Row Cycle Time: t_RC = 32×10⁻⁹ + 13.75×10⁻⁹ = 45.75 × 10⁻⁹ s",
      "7) Margin Rule (>80°C Hot/Vmin): 10% V_min screening vs Fused Ref"
    ],
    table: {
      headers: ["SLT Scenario", "Observed Signature", "Root Mechanism / Action"],
      rows: [
        ["Hot Retention (>85°C)", "Corrupt after long idle", "Double MR4 refresh; check tREFI=1.95µs"],
        ["Margin WL / Low VDD", "Row miss on ACT (Vmin)", "Check VPP/VDD_GMC & 10% fused Vmin"],
        ["Summary 'PASS' Bug", "Summary PASS vs CE/UE", "Freeze DUT -> grep dmesg/EDAC -> patch"]
      ]
    },
    highlightRow: 2,
    postMathResolution: [
      "Solve 1T1C ΔV_BL (55 mV) and DDR timings (t_RC = 45.75 ns, 25.6 GB/s) before touching logs.",
      "NEVER trust summary 'PASS': freeze unit before reboot and inspect raw UART, BL2/MRC (did, ZQCal 0x1ff vs 0x13D), and Linux EDAC/dmesg logs.",
      "Validate parser script by injecting a synthetic single-bit CE / uncorrectable UE error line—audit lot as INVALID if script still returns PASS.",
      "Measure VDD_GMC / VDDQ_GMC at die sense balls with Keysight N7020A (±24V offset) under memtester DVFS / MaxPower stress.",
      "Run SMV1D/SMV2D Vref × Delay eyes across Cold (−10°C ZQCal saturation) and Hot (+85°C 2× refresh) corners with A-B-A DIMM/socket swap."
    ],
    interviewScript: "1T1C charge sharing leaves only ~55 to 150 mV on the bitline before sense-amp restoration, so small shifts in leakage at 85°C, ZQCal saturation at cold, or rail droop eat right into eye margin. In SLT, if an automated summary says DRAM PASS while raw logs look suspicious, I freeze the unit before rebooting, inspect raw dmesg and EDAC counters directly, inject a synthetic error into the log parser to confirm a parser bug, and pair N7020A rail captures with SMV2D shmoos.",
    trapTitle: "Never Trust Summary PASS Over Raw Kernel / EDAC Logs!",
    trapBody: "Production escape risk: missing regex or column index in parser turns real bit flips into fake PASS.",
    codeLines: [
      "def dram_read_slt(vdd=1.10, c_cell=25e-15, c_bl=225e-15, tras=32e-9, trp=13.75e-9):",
      "    dv_bl = (vdd - vdd/2.0) * (c_cell / (c_cell + c_bl)) # 55.0e-3 V",
      "    t_rc = tras + trp                                     # 45.75e-9 s",
      "    return {'dV_BL_V': dv_bl, 'tRC_s': t_rc, 'hot_tREFI': 1.95e-6}"
    ]
  },
  {
    file: "spread_04_tech60_units_ohm_watt_color_code.png",
    cat: "avionics",
    topicIds: ["units", "ohm", "power"],
    header: "AVIONICS EE FOUNDATIONS — 10^(3n) Prefixes, SMD '472', Ohm's Law (I = V/R) & 2× Wattage Derating",
    question: "45×10⁻⁶ C flows in 15×10⁻³ s: find electrons & I. Decode SMD '472' across 12 V to compute I (mA), P (mW), and safe flight wattage rating.",
    answer: "N = 281.25×10¹² e⁻ · I = 3.0×10⁻³ A · R = 4.7×10³ Ω · P = 30.64×10⁻³ W (1/8W)",
    schKind: "generic",
    dmmReadout: "2.55 mA",
    schMeta: { b1: "+12×10⁰ V Source", b1Sub: "1 C = 6.25×10¹⁸ e⁻", b2: "SMD '472' = 4.7×10³ Ω", b2Sub: "Yel-Viol-Red (±5%)", b3: "2.55 mA / 30.6 mW", b3Sub: "Use ≥ 1/8W (0.125W)" },
    keyEquations: ["V = I · R   |   I = V / R   |   R = V / I", "P = V · I = I² · R = V² / R", "Q = N / 6.25×10¹⁸ C   |   I = Q / t"],
    intuition: "1 ampere = 1 coulomb (6.25×10¹⁸ electrons) flowing per second. Engineering notation strictly locks powers of 10 to multiples of 3 (10^(3n)), preventing 1,000× divider/amp errors.",
    mathSteps: [
      "1) Convert Givens: Q = 45×10⁻⁶ C ;  t = 15×10⁻³ s ;  R = 4.7×10³ Ω",
      "2) Electron Count N = (45×10⁻⁶) × (6.25×10¹⁸) = 281.25 × 10¹² e⁻",
      "3) Current I = Q / t = (45×10⁻⁶) / (15×10⁻³) = 3.0 × 10⁻³ A (3.0 mA)",
      "4) SMD '472': digits 4, 7 × 10² = 4,700 Ω = 4.70 × 10³ Ω ±5%",
      "5) Ohm's Law: I = 12×10⁰ V / (4.7×10³ Ω) = 2.553 × 10⁻³ A (2.553 mA)",
      "6) Watt's Law: P = V²/R = 144 / (4.7×10³) = 30.64 × 10⁻³ W (30.64 mW)",
      "7) Flight 2× Derating Check: 2 × 30.64×10⁻³ = 61.3×10⁻³ W ≤ 125 mW (1/8W)"
    ],
    table: {
      headers: ["Raw Value", "Prefix Form", "Base SI (10^3n)"],
      rows: [
        ["45 µC", "micro (10⁻⁶)", "45.0 × 10⁻⁶ C"],
        ["15 ms", "milli (10⁻³)", "15.0 × 10⁻³ s"],
        ["4.7 kΩ", "kilo (10⁺³)", "4.70 × 10³ Ω"]
      ]
    },
    highlightRow: 2,
    postMathResolution: [
      "Convert all prefixes to 10^(3n) base units FIRST to find expected I = 2.55×10⁻³ A and P = 30.6×10⁻³ W.",
      "Inspect part marking ('472' vs '4702' ±1%) on schematic & BOM; verify package wattage rating (0603 = 0.1 W vs 0805 = 0.125 W).",
      "With board POWER OFF, measure out-of-circuit/isolated R across nodes A–B to verify 4.465–4.935 kΩ (not shorted 0 Ω or 10× off like '473').",
      "Energize rail via current-limited PSU (set I_limit ~15 mA), measure V_AB in PARALLEL with DMM (expect 12.00 V), or series mA if header exists.",
      "If measured current ≠ 2.55 mA ±5%, check parallel sneak paths on schematic or wrong part stuffed on PCBA."
    ],
    interviewScript: "Before touching the bench, I convert every prefix to 10^(3n) base SI—4.7 kΩ is 4.7×10³ Ω, so across 12 V I expect 2.55×10⁻³ A and 30.64×10⁻³ W, needing at least an 1/8 W resistor under 2× flight derating. Next I verify R on a powered-off board against the schematic, then power on through a current-limited supply and measure voltage across A–B in parallel to confirm expected load draw.",
    trapTitle: "Dividing by milli (10⁻³) multiplies by 10⁺³!",
    trapBody: "Dividing 5 V by 2 mA equals 2.5×10³ Ω (2.5 kΩ), NOT 2.5 mΩ! Never measure Ω with power ON.",
    codeLines: [
      "def check_ohm_watt(v=12.0, r=4.7e3, rating_w=0.125):",
      "    i_a = v / r ; p_w = (v ** 2) / r   # 2.553e-3 A, 30.64e-3 W",
      "    assert 2.0 * p_w <= rating_w       # Flight 2x derating passes!"
    ]
  },
  {
    file: "spread_05_tech60_loaded_divider_wheatstone_thevenin.png",
    cat: "avionics",
    topicIds: ["series", "kcl-kvl", "thevenin"],
    header: "AVIONICS NETWORKS — 10×10⁶ Ω DMM Loaded Divider, Thermistor Wheatstone Bridge & Thevenin R_TH",
    question: "A 12 V bridge has R1=R2=R3=10×10³Ω and thermistor RT=9×10³Ω. Find V_out & R_TH. Also find 10×10⁶Ω DMM reading on a 10 V 1MΩ∥1MΩ divider.",
    answer: "V_out = +315.8×10⁻³ V · R_TH = 9.737×10³ Ω · DMM Reads 4.762×10⁰ V (−4.76%)",
    schKind: "bridge_thevenin",
    dmmReadout: "4.762 V",
    keyEquations: ["V_out = V_S·[R3/(R1+R3) − RT/(R2+RT)]", "R_TH = (R1∥R3) + (R2∥RT)  [Vs = 0 V]", "R2_loaded = (R2·R_DMM) / (R2 + R_DMM)"],
    intuition: "Connecting a DMM (10 MΩ) or ADC puts it in PARALLEL with the bottom resistor, pulling node voltage down. Zeroing V_S reveals R_TH directly across A–B.",
    mathSteps: [
      "1) Ideal Unloaded 1MΩ Divider: V_ideal = 10 × 1M/2M = 5.000×10⁰ V",
      "2) 10×10⁶ Ω DMM Load Across Bottom: 1M∥10M = 909.1×10³ Ω",
      "3) Actual DMM Reading: 10 × 909.1k / 1909.1k = 4.762×10⁰ V (−4.76%)",
      "4) Bridge Ref Leg V_A = 12 × (10×10³ / 20×10³) = 6.000×10⁰ V",
      "5) Bridge Thermistor V_B = 12 × (9×10³ / 19×10³) = 5.6842×10⁰ V",
      "6) Differential V_out = V_A − V_B = +315.8 × 10⁻³ V",
      "7) Zero 12V Source -> R_TH = (10k∥10k) + (10k∥9k) = 9.737×10³ Ω"
    ],
    table: {
      headers: ["Circuit Case", "Ideal Open V", "DMM Loaded / Vth"],
      rows: [
        ["1×10⁶Ω Div + 10M DMM", "5.000×10⁰ V", "4.762 V (−4.76% err)"],
        ["1×10³Ω Div + 10M DMM", "5.000×10⁰ V", "4.9998 V (negligible)"],
        ["Bridge @ RT=9×10³Ω", "0.000 V (25°C)", "+315.8×10⁻³ V (Rth=9.74k)"]
      ]
    },
    highlightRow: 2,
    postMathResolution: [
      "Solve unloaded vs 10 MΩ loaded dividers in 10^(3n) on paper BEFORE calling a 4.76 V reading 'broken'.",
      "Inspect schematic: identify bridge arms R1..R3, thermistor R_T, and op-amp instrumentation buffer.",
      "With power ON, measure differential V_AB directly across nodes A–B rather than subtracting two noisy single-ended readings.",
      "To verify R_TH on bench: power OFF (short +12V bus to GND or lift supply), then measure Ω across A–B (expect 9.737 kΩ).",
      "If DMM or ADC mux loads a high-Z divider by >1%, add a unity-gain CMOS op-amp voltage follower before the ADC pin."
    ],
    interviewScript: "Before condemning a 4.76 V reading on a 10 V MΩ divider as a hardware defect, I calculate the 10 MΩ DMM loading parallel term: 1 MΩ in parallel with 10 MΩ drops the bottom arm to 909.1 kΩ, predicting 4.762 V exact. Similarly on a thermistor bridge, I compute both divider legs separately for +315.8×10⁻³ V and short V_S mentally to find R_TH = 9.737 kΩ before probing differentially on the board.",
    trapTitle: "Never Measure R_TH With Supply Powered ON!",
    trapBody: "Short independent V-sources ONLY in paper analysis or power-off state; never connect an ohmmeter to live +12 V.",
    codeLines: [
      "def bridge_dmm(vs=12.0, r=10e3, rt=9e3, rdmm=10e6):",
      "    par = lambda a, b: (a*b)/(a+b)",
      "    return {'Vab': vs*(r/(2*r) - rt/(r+rt)), 'Rth': par(r,r)+par(r,rt)}"
    ]
  },
  {
    file: "spread_06_tech60_cramer_mesh_superposition_ac_rms.png",
    cat: "avionics",
    topicIds: ["ac", "capacitors", "rf"],
    header: "AVIONICS AC & NETWORKS — 2×2 Cramer Mesh, Max Power Transfer (80 mW), AC V_rms & X_C",
    question: "Solve 300·I1−100·I2=6, −100·I1+400·I2=0. Compute P_max (Vth=8V, Rth=200Ω), V_rms & T (14.14Vpp 2×10³Hz), and X_C (0.1×10⁻⁶F @ 10×10³Hz).",
    answer: "I1 = 21.82×10⁻³ A · Pmax = 80.0×10⁻³ W · Vrms = 5.00 V · X_C = 159.15 Ω",
    schKind: "generic",
    dmmReadout: "5.00 Vrms",
    schMeta: { b1: "Mesh / Thevenin", b1Sub: "Vth=8V · Rth=200Ω", b2: "Matched RL = Rth", b2Sub: "P_max = 80×10⁻³ W", b3: "AC Sine & X_C", b3Sub: "Vrms=5.00V · 159.2Ω" },
    keyEquations: ["I1 = Δ1 / Δ = (6·400 − 0) / (300·400 − (−100)²)", "P_max = V_TH² / (4·R_TH)  [at R_L = R_TH]", "V_rms = 0.7071·(V_pp/2)  |  X_C = 1 / (2π·f·C)"],
    intuition: "Mesh determinants solve coupled loops; max power transfers when R_L = R_TH (50% efficiency). True-RMS equals the DC heating value of an AC waveform.",
    mathSteps: [
      "1) System Determinant Δ = (300)(400) − (−100)(−100) = 110×10³ Ω²",
      "2) Mesh Current I1 = Δ1 / Δ = 2.40×10³ / 110×10³ = 21.82 × 10⁻³ A",
      "3) Match RL = Rth = 200 Ω: P_max = Vth²/(4·Rth) = 64/800 = 80.0×10⁻³ W",
      "4) AC Peak Amplitude: Vp = Vpp / 2 = 14.14 / 2 = 7.070 × 10⁰ V",
      "5) AC True-RMS: Vrms = 0.7071 × 7.070 = 5.00 × 10⁰ Vrms",
      "6) Period T = 1 / (2.0 × 10³ Hz) = 500 × 10⁻⁶ s (500 µs)",
      "7) Capacitive X_C = 1/(2π·10×10³·0.1×10⁻⁶) = 159.15 × 10⁰ Ω"
    ],
    table: {
      headers: ["Parameter", "Formula", "10^(3n) Verified"],
      rows: [
        ["Cramer Mesh I1", "(V1·R22 − V2·R12)/Δ", "21.82 × 10⁻³ A"],
        ["Max Power RL=Rth", "Vth² / (4·Rth)", "80.0 × 10⁻³ W"],
        ["V_rms & X_C", "0.7071·Vp ; 1/(2πfC)", "5.00 Vrms ; 159.15 Ω"]
      ]
    },
    highlightRow: 1,
    postMathResolution: [
      "Solve paper determinants, RMS (Vp/√2), and reactance X_C in base 10^(3n) SI FIRST.",
      "On oscilloscope: measure V_pp directly and verify 1/T frequency = 2.00 kHz; on DMM AC mode verify V_rms = 5.00 V.",
      "For RF/sensor matching: confirm R_L = R_TH = 50/200 Ω; NEVER match R_L = R_s on main spacecraft power buses (wastes 50% heat!).",
      "If decoupling cap X_C seems ineffective above 10 kHz, inspect self-resonant frequency (ESL trace loop length) on schematic.",
      "Document both scope V_pp and DMM True-RMS readings when validating distorted or PWM waveforms."
    ],
    interviewScript: "First I convert frequencies and capacitances into 10^(3n) SI units—like 1/(2π × 10×10³ × 0.1×10⁻⁶) giving X_C = 159.15 Ω—and solve V_p = 7.07 V vs V_rms = 5.00 V before touching the bench. Notice why I separate scope measurements from DMM measurements: the scope displays V_pp directly while the DMM reads V_rms. For sensor interfaces I match R_L = R_TH for max power transfer, whereas for spacecraft power buses I keep R_L >> R_s to maximize efficiency.",
    trapTitle: "Never Sum Superposition Powers P1+P2 or Mix V_pp With V_rms!",
    trapBody: "Add linear signed currents/voltages FIRST, then compute P = I²R. Never divide V_pp directly by √2 without halving to V_p!",
    codeLines: [
      "import math",
      "def ac_mesh_pwr(vpp=14.14, f_ac=2e3, f_c=10e3, c=0.1e-6):",
      "    return {'Vrms': (vpp/2)/math.sqrt(2), 'T_s': 1/f_ac, 'Xc': 1/(2*math.pi*f_c*c)}"
    ]
  },
  {
    file: "spread_07_electronic_devices_bridge_rectifier_ripple.png",
    cat: "avionics",
    topicIds: ["components", "power-rails"],
    header: "AVIONICS POWER CONVERSION — Full-Wave Si Bridge Rectifier & 120 Hz Ripple Filter",
    question: "A 12 Vrms 60 Hz transformer drives a 4-diode Si bridge (VF = 0.7 V) with C = 1×10⁻³ F (1000 µF) and RL = 1.0×10³ Ω. Find Vp(out), Vr(pp), VDC & PIV.",
    answer: "Vp(out) = 15.57 V · Vr(pp) = 129.8×10⁻³ Vpp (120 Hz) · PIV ≥ 16.27 V",
    schKind: "rectifier",
    dmmReadout: "15.51 V",
    keyEquations: ["V_p(out) = √2·V_rms − 2·(0.7 V)", "f_r = 2 · f_in = 120 × 10⁰ Hz (Full-Wave)", "V_r(pp) = V_p(out) / (f_r · R_L · C)"],
    intuition: "Two Si diodes (0.7 V barrier each) conduct in series every half-cycle, doubling ripple rate to 120 Hz so the bulk capacitor holds up output voltage between peaks.",
    mathSteps: [
      "1) Secondary Peak: Vp(sec) = 1.4142 × 12.0 = 16.97 × 10⁰ V",
      "2) Two Conducting Si Drops: V_drop = 2 × 0.70 = 1.40 × 10⁰ V",
      "3) Rectified Output Peak: Vp(out) = 16.97 − 1.40 = 15.57 × 10⁰ V",
      "4) Ripple Frequency DOUBLES: f_r = 2 × 60 = 120 × 10⁰ Hz",
      "5) Time Constant Base SI: RL·C = (1.0×10³ Ω)·(1.0×10⁻³ F) = 1.00 s",
      "6) Ripple V_r(pp) = 15.57 / (120 × 1.0) = 129.8 × 10⁻³ Vpp (129.8 mVpp)",
      "7) Avg DC & PIV: VDC = 15.57 − 0.065 = 15.505 V; PIV = 16.27 V (use 50V)"
    ],
    table: {
      headers: ["Rectifier Type", "Diode Drop", "Ripple Rate & PIV"],
      rows: [
        ["Half-Wave (1D)", "0.70 V", "60 Hz · PIV = Vp(in)"],
        ["Center-Tap (2D)", "0.70 V", "120 Hz · PIV = 2·Vp+0.7"],
        ["Full Bridge (4D)", "1.40 V", "120 Hz · PIV = Vp+0.7"]
      ]
    },
    highlightRow: 2,
    postMathResolution: [
      "Solve Vp(out) = 15.57 V and Vr(pp) = 129.8 mVpp BEFORE powering the rectifier board.",
      "Inspect schematic diode polarity and electrolytic cap C voltage rating (≥ 25 V for 15.6 V peak!).",
      "Test all 4 bridge diodes power-off in DMM Diode mode (expect ~0.6–0.7 V forward, OL reverse).",
      "Probe secondary AC with isolated differential probe or CH1−CH2 math—NEVER clip grounded scope probe across transformer bridge!",
      "Set scope to AC coupling (50 mV/div) across C to confirm 120 Hz sawtooth ripple = 129.8 mVpp; if 60 Hz ripple appears, one bridge diode is OPEN!"
    ],
    interviewScript: "Before energizing, I calculate V_p = 1.414×12 − 1.4 V = 15.57 V, note that full-wave rectification doubles ripple to 120 Hz, and predict 129.8 mVpp ripple across 1 kΩ and 1 mF. On the bench, I verify diode polarity and ≥25 V capacitor rating on the schematic, check diodes power-off, then use AC-coupled scope mode across the output cap: seeing 120 Hz ripple at ~130 mVpp passes, whereas seeing 60 Hz ripple immediately proves one diode leg failed open.",
    trapTitle: "Never Clip Grounded Scope GND Across Bridge Input!",
    trapBody: "Bridge reference ground shifts relative to AC line/secondary; also never forget f_r = 120 Hz and 2×0.7 V = 1.4 V drops.",
    codeLines: [
      "import math",
      "def bridge_calc(vrms=12.0, fin=60.0, rl=1e3, c=1e-3):",
      "    vp = math.sqrt(2)*vrms - 1.4  # 15.57 V ; Vr = vp/(2*fin*rl*c) = 129.8 mV",
      "    return {'Vp_out': vp, 'Vr_pp': vp / (2.0*fin*rl*c)}"
    ]
  },
  {
    file: "spread_08_electronic_devices_zener_lm317_bjt_saturation.png",
    cat: "avionics",
    topicIds: ["components", "power-rails", "ohm"],
    header: "AVIONICS SEMICONDUCTORS — 5.1V Zener Regulator, LM317 Vout & BJT Saturation Proof",
    question: "A) 12V->100Ω->5.1V Zener∥510Ω: find IZ. B) LM317 (R1=240Ω, R2=1.2×10³Ω): find Vout. C) NPN (β=100, VCC=10V, RC=10³Ω, RB=10⁴Ω, VBB=5V): Active or Sat?",
    answer: "IZ = 59.0×10⁻³ A · LM317 = 7.50 V · BJT SATURATED (ICsat = 9.8×10⁻³ A)",
    schKind: "zener_bjt",
    dmmReadout: "59.0 mA",
    keyEquations: ["I_Z = (V_in − V_Z)/R_S − V_Z/R_L", "V_out(LM317) = 1.25·(1 + R2/R1)", "I_C(sat) = (V_CC − 0.2 V) / R_C  <  β·I_B => SAT"],
    intuition: "Zener reverse-breakdown clamps rail V_Z by sinking excess current (I_T − I_L). An NPN BJT obeys β·I_B ONLY until hitting the collector ceiling I_C(sat)!",
    mathSteps: [
      "1) Series R_S Drop @ VZ = 5.1 V: 12.0 − 5.1 = 6.90×10⁰ V",
      "2) Total Current I_T = 6.90 V / 100 Ω = 69.0 × 10⁻³ A",
      "3) Load Current I_L = 5.1 V / 510 Ω = 10.0 × 10⁻³ A",
      "4) KCL Zener Shunt Current: I_Z = 69.0 − 10.0 = 59.0 × 10⁻³ A",
      "5) LM317 V_out = 1.25 × (1 + 1.2×10³ / 240) = 7.50 × 10⁰ V",
      "6) BJT Base I_B = (5.0 − 0.7) / 10×10³ = 430 × 10⁻⁶ A",
      "7) Saturation Proof: 100·IB = 43×10⁻³ A > ICsat = 9.8×10⁻³ A => SAT!"
    ],
    table: {
      headers: ["Semiconductor", "Governing Rule", "Verified Value"],
      rows: [
        ["5.1V Zener", "Check worst-case RL=∞", "IZ = 59 mA (PZ=0.301 W)"],
        ["LM317 LDO", "Keep Vin − Vout ≥ 2 V", "Vout = 7.50 V (I_adj~50µA)"],
        ["NPN BJT Switch", "Compare β·IB vs ICsat", "43mA > 9.8mA -> VCE=0.2V"]
      ]
    },
    highlightRow: 2,
    postMathResolution: [
      "Calculate both extreme Zener loads (full load vs open load RL=∞ where PZ = 5.1×69mA = 352 mW!) on paper.",
      "Compare β·IB vs I_C(sat) before assuming an NPN acts linearly—never quote 43 mA through 1 kΩ on a 10 V rail!",
      "On bench/board: verify Zener orientation (cathode band to +5.1V node) and check heatsink/thermal temperature with IR camera.",
      "Measure V_CE directly with DMM across Collector–Emitter: ~0.1–0.25 V confirms Saturation ON, ~V_CC confirms Cutoff OFF.",
      "For LM317/LDO rails, check input headroom (≥ 2 V) and verify feedback resistor divider solder joints if V_out floats high."
    ],
    interviewScript: "By KCL at the 5.1 V Zener node, total supply current is 69 mA and load draws 10 mA, so the Zener sinks 59×10⁻³ A—meaning no-load worst case is 69 mA (352 mW), which dictates our Zener wattage rating. For the BJT, β·IB gives 43 mA, which violates the 9.8 mA collector ceiling set by (10 − 0.2)/1 kΩ—proving saturation at V_CE ≈ 0.2 V, which I confirm on hardware by probing Collector-to-Emitter.",
    trapTitle: "Never Report IC = β·IB Without Checking IC(sat)!",
    trapBody: "Predicting 43 mA on a 10 V / 1 kΩ loop violates KVL (43 V drop)! Once β·IB ≥ IC(sat), BJT clamps at V_CE ≈ 0.2 V.",
    codeLines: [
      "def check_bjt_zener():",
      "    iz = (12.0 - 5.1)/100.0 - 5.1/510.0  # 59.0e-3 A",
      "    ic = min(100 * (4.3 / 10e3), (10.0 - 0.2) / 1e3) # Clamps 9.8e-3 A!"
    ]
  },
  {
    file: "spread_09_tech63_pulse_ieee754_demorgan_gray_adder.png",
    cat: "avionics",
    topicIds: ["timing", "components", "buses"],
    header: "AVIONICS DIGITAL LOGIC — Pulse Duty (25%), IEEE 754 (+12.50), DeMorgan, Gray Code & 4-Bit Adder",
    question: "A) T=20×10⁻⁶s, tW=5×10⁻⁶s -> Duty%. B) IEEE754: 0 10000010 10010... C) NOT(NOT(AB)·C). D) 1011₂ -> Gray. E) Add 1011₂ + 0111₂.",
    answer: "Duty = 25% · FP32 = +12.50 · DeMorgan = AB + C̄ · Gray = 1110₂ · Sum = 10010₂",
    schKind: "generic",
    dmmReadout: "+12.50",
    schMeta: { b1: "PWM & FP32 Bits", b1Sub: "tW=5×10⁻⁶s · T=20×10⁻⁶s", b2: "DeMorgan & Gray", b2Sub: "Break bar + flip", b3: "4-Bit Adder", b3Sub: "11 + 7 = 18 (10010₂)" },
    keyEquations: ["Duty = (t_W / T) × 100%   |   f = 1 / T", "FP32 = (−1)^S × (1 + F) × 2^(E − 127)", "NOT(X·Y) = X̄ + Ȳ   |   Gray = B ⊕ (B >> 1)"],
    intuition: "Pulse width t_W sits at 50% crossing; IEEE 754 packs exponent bias 127 + hidden '1.'; DeMorgan flips AND↔OR when breaking bars; Gray code limits transitions to 1 bit.",
    mathSteps: [
      "1) Duty Cycle = (5.0×10⁻⁶ / 20×10⁻⁶)×100% = 25.0% (f = 50×10³ Hz)",
      "2) IEEE 754 Sign S = 0 (+1), Biased E = 10000010₂ = 130 => E−127 = +3",
      "3) IEEE 754 Mantissa: (1).1001₂ = 1 + 0.5 + 0.0625 = 1.5625",
      "4) Decoded Value = (+1) × 1.5625 × 2³ = +12.50 × 10⁰",
      "5) DeMorgan: NOT(NOT(AB)·C) = NOT(NOT(AB)) + C̄ = A·B + C̄",
      "6) Binary 1011₂ -> Gray: 1011 ^ 0101 = 1110₂ (14 decimal)",
      "7) 4-Bit Ripple Add: 1011₂ (11) + 0111₂ (7) => Cout=1, Sum=0010₂ (18)"
    ],
    table: {
      headers: ["Digital Concept", "Threshold / Rule", "Verified Check"],
      rows: [
        ["PWM Measurement", "10–90% tr/tf · 50% tW", "25% Duty · 50 kHz"],
        ["IEEE 754 Float", "Hidden leading '1.'!", "0x41480000 = +12.50"],
        ["Gray / Adder", "1-bit step · C_in/out", "1011₂->1110₂ · Sum 2+C1"]
      ]
    },
    highlightRow: 1,
    postMathResolution: [
      "Verify pulse thresholds before triggering scope: t_r/t_f use 10%–90%, while pulse width t_W and period T use 50% crossings.",
      "Trace every unused CMOS gate input on the schematic—tie unused inputs to VDD or GND (floating inputs oscillate and fail thermal/current limits).",
      "Measure HIGH/LOW levels on logic analyzer vs VIH/VIL spec limits (e.g. 2.0 V / 0.8 V for 3.3 V LVCMOS) before blaming FPGA firmware.",
      "For CDC / encoder buses, confirm Gray encoding prevents multi-bit sample glitches between asynchronous clock domains.",
      "Cross-check packed IEEE 754 telemetry endianness (big vs little endian) when Python decodes raw spacecraft CAN/UART bytes."
    ],
    interviewScript: "On digital telemetry and logic debug, I start by converting pulse timing to 10^(3n) Hz and %, then check endianness and IEEE 754 normalization (including the hidden '1.') when decoding telemetry payloads. On hardware, I probe VIH/VIL thresholds at 50% crossing, verify DeMorgan logic simplifications, and ensure unused CMOS pins aren't left floating.",
    trapTitle: "Remember the Hidden '1.' in IEEE 754 & Tie Unused Inputs!",
    trapBody: "Leaving out the implicit 1.0 in IEEE 754 drops 12.50 to 4.50; leaving CMOS gate inputs floating triggers high power draw.",
    codeLines: [
      "def digital_suite(tw=5e-6, period=20e-6, b=0b1011):",
      "    duty = (tw / period) * 100.0 ; gray = b ^ (b >> 1)  # 25%, 0b1110"
    ]
  },
  {
    file: "spread_10_physics2b_rc_dvm_loading_and_tvac.png",
    cat: "avionics",
    topicIds: ["rc", "capacitors", "qualification", "thermal"],
    header: "AVIONICS RC & TVAC QUALIFICATION — 10×10⁶ Ω DMM Loading Shift & Vacuum Heat Transfer",
    question: "A 2.2×10⁻⁶ F cap discharges through R = 4.7×10⁶ Ω WITH a 10×10⁶ Ω DMM connected across it. Compute observed τ (s), and explain ambient-PASS -> TVAC-FAIL.",
    answer: "Loaded τ = 7.034×10⁰ s (−32% vs 10.34s!) · TVAC Convection h = 0 W/m²K",
    schKind: "generic",
    dmmReadout: "7.034 s",
    schMeta: { b1: "C = 2.2×10⁻⁶ F", b1Sub: "V(t) = V0·e^(−t/τ)", b2: "4.7MΩ ∥ 10MΩ DMM", b2Sub: "R_eq = 3.197×10⁶ Ω", b3: "TVAC (<10⁻⁵ Torr)", b3Sub: "Conduction + T⁴ Rad" },
    keyEquations: ["R_eq = (R · R_DMM) / (R + R_DMM)", "τ_obs = R_eq · C  [10⁶ Ω × 10⁻⁶ F = 1.0 s]", "Q_rad = ε·σ·A·(T₁⁴ − T₂⁴)  [Convection h = 0]"],
    intuition: "Voltmeters are NOT infinite impedance—connecting a 10 MΩ DMM across a megohm RC network opens a parallel leak path that shrinks τ by 32%! In TVAC (<10⁻⁵ Torr), air disappears, killing convection completely.",
    mathSteps: [
      "1) Identify Parallel Network Across C: R = 4.7×10⁶ Ω ∥ R_DMM = 10×10⁶ Ω",
      "2) Parallel Equivalent R_eq = (4.7 × 10)/(4.7 + 10) × 10⁶ = 3.1973×10⁶ Ω",
      "3) Convert C: 2.2 µF = 2.2 × 10⁻⁶ F",
      "4) Observed τ = (3.1973 × 10⁶) × (2.2 × 10⁻⁶) = 7.034 × 10⁰ s",
      "5) Ideal Unloaded τ_ideal = 4.7×10⁶ × 2.2×10⁻⁶ = 10.34 s (−32.0% error!)",
      "6) TVAC Physics: at <10⁻⁵ Torr, h_conv = 0; only conduction + T⁴ radiation",
      "7) Paschen Check: keep HV OFF between 100 and 10⁻³ Torr pump-down"
    ],
    table: {
      headers: ["Test Condition", "Physical Effect", "Required Action"],
      rows: [
        ["DMM 10MΩ Connected", "Parallel R || 10 MΩ", "τ=7.034 s (NOT 10.34 s!)"],
        ["TVAC (<10⁻⁵ Torr)", "No air convection (h=0)", "Verify TIM torque & heat strap"],
        ["Pump-Down (~1 Torr)", "Paschen corona min", "Interlock HV until hard vacuum"]
      ]
    },
    highlightRow: 0,
    postMathResolution: [
      "Before measuring megohm RC decay, compute R ∥ 10 MΩ so you compare DMM observations against τ = 7.034 s (not 10.34 s!).",
      "Wait 5τ (= 35.17 s) for 99.3% discharge—use high-Z electrometer or op-amp buffer if true unloaded τ is required.",
      "When debugging an Ambient-PASS / TVAC-FAIL unit, inspect baseplate fastener torque, thermal interface pad (TIM) squeeze-out, and coldplate mounting.",
      "Lock out high-voltage rails through the 0.001–100 Torr Paschen breakdown band during chamber pump-down.",
      "Wait for chamber T-Case ΔT/Δt soak equilibrium before recording cold/hot functional pass/fail margin sweeps."
    ],
    interviewScript: "If a 2.2 µF / 4.7 MΩ bleed decays in 7.03 s instead of 10.34 s, the board isn't broken—the 10 MΩ DMM acts in parallel with R, cutting R_eq to 3.197 MΩ. Likewise in Muon Space TVAC qualification, ambient passes turn into vacuum failures because air convection drops to zero below 10⁻⁵ Torr; any loose fastener torque or dry TIM causes thermal runaway, and pump-down through ~1 Torr can arc if HV isn't interlocked.",
    trapTitle: "Never Ignore 10 MΩ DMM Loading or Vacuum Zero-Convection!",
    trapBody: "10⁶ Ω × 10⁻⁶ F simplifies cleanly to seconds, and a 10 MΩ meter creates a −32% τ shift on 4.7 MΩ.",
    codeLines: [
      "def rc_dmm(r=4.7e6, c=2.2e-6, rdmm=10e6):",
      "    r_eq = (r * rdmm) / (r + rdmm)  # 3.1973e6 Ohm",
      "    return {'tau_ideal': r*c, 'tau_loaded': r_eq*c} # 10.34s vs 7.034s"
    ]
  },
  {
    file: "spread_11_nvidia_slt_pdn_dram_keysight_scope.png",
    cat: "nvidia",
    topicIds: ["electrical", "pdn-power", "thermal-power", "instruments", "scope-probing", "dram", "memory-ddr"],
    header: "NVIDIA SLT MASTER — PDN L·dI/dt Droop, DDR4-3200 & Keysight 4-Ch Scope (N7020A / 1169B)",
    question: "Compute PDN ΔV for ΔI=40A/20ns (L=250pH, R=2mΩ), DDR4-3200 peak GB/s & t_RC, 1T1C ΔV_BL, and walk through CPU2 4-ch Scope setup.",
    answer: "ΔV_L = 500×10⁻³ V · ΔV_BL = 55×10⁻³ V · BW = 25.6×10⁹ B/s · tRC = 45.75×10⁻⁹ s",
    schKind: "scope4ch",
    dmmReadout: "580 mV",
    keyEquations: ["ΔV = I·R_PDN + L_pkg·(dI/dt) = 80mV + 500mV", "I_C = C·(dV/dt)  |  ΔV_BL = (V_cell − V_PRE)·C_cell/(C_cell+C_BL)", "BW = (MT/s × Width_bits) / 8   |   t_RC = t_RAS + t_RP"],
    intuition: "Sub-20 ns GPU current transients (dI/dt = 2×10⁹ A/s) cause inductive voltage droop BEFORE the buck regulator can respond—meaning low-ESL decoupling and 4-ch scope deskewing are essential.",
    mathSteps: [
      "1) Resistive Droop: ΔV_IR = 40 A × 2.0×10⁻³ Ω = 80.0 × 10⁻³ V (80 mV)",
      "2) Inductive Step: (250×10⁻¹² H) × (40 A / 20×10⁻⁹ s) = 500 × 10⁻³ V",
      "3) Total Unmitigated Droop = 80 mV + 500 mV = 580 × 10⁻³ V",
      "4) Capacitor Current (C=100µF, dV=40mV): I_C = 100µ × 40m/20n = 200 A",
      "5) DDR4-3200 BW = (3.2×10⁹ × 64) / 8 = 25.6 × 10⁹ B/s (25.6 GB/s)",
      "6) Row Cycle Time: t_RC = 32×10⁻⁹ + 13.75×10⁻⁹ = 45.75 × 10⁻⁹ s",
      "7) Parallel Termination: 20 Ω ∥ 60 Ω = (20×60)/(20+60) = 15.0 × 10⁰ Ω"
    ],
    table: {
      headers: ["Keysight Ch / Case", "Probe & Connection", "Verification Method"],
      rows: [
        ["CH1 CLK + CH2 Logic", "SMA-BNC + N7020A (±24V off)", "Check divider ratio (80:1)"],
        ["CH3 Shunt + CH4 M-Rail", "Keysight 1169B + N7020A", "Deskew CH3 vs CH2 first!"],
        ["Intel / Cisco / DRAM", "VR/BIOS/A-B-A + dmesg", "Compare raw log vs parser"]
      ]
    },
    highlightRow: 0,
    postMathResolution: [
      "Calculate DC IR droop (80 mV) vs inductive L·di/dt (500 mV) separately so you know whether copper width or decoupling inductance dominates.",
      "Configure 4-channel Keysight scope: CH1 SMA-BNC CLK, CH2 N7020A Logic Rail, CH3 1169B Shunt Current (differential!), CH4 N7020A M-Rail.",
      "Always deskew CH3 current probe against CH2 voltage BEFORE multiplying instantaneous V(t)×I(t) power!",
      "Cross-check divided exported clock frequency (e.g., 4.112 GHz / 80 = 51.4 MHz) before declaring PLL failure.",
      "Follow staged bring-up (power-off ohms -> VR/UCD config -> CLK/RESET -> BIOS SHA256 -> single-var A-B-A socket swap) to isolate silicon vs fixture."
    ],
    interviewScript: "On fast SoC rails, 2×10⁻³ Ω times 40 A creates 80 mV resistive droop, while 250 pH across 40 A in 20 ns generates a 500 mV inductive spike. To observe this cleanly on a 4-channel Keysight scope without adding 100 nH ground-clip ringing, I put exported clock on CH1 via SMA-to-BNC, logic/M-rails on CH2/CH4 using N7020A power-rail probes with DC offset, and current sense on CH3 via an 1169B differential probe—deskewing CH3 against CH2 before multiplying power.",
    trapTitle: "Never Clip a Grounded Probe Onto a High-Side Shunt!",
    trapBody: "Grounding the high side shorts the rail to earth through scope chassis; verify clock dividers before calling MHz a fail.",
    codeLines: [
      "def pdn_ddr_check(dI=40.0, dt=20e-9, L=250e-12, R=2e-3):",
      "    return {'dV_ir': dI*R, 'dV_ind': L*(dI/dt), 'tRC': 32e-9+13.75e-9}"
    ]
  },
  {
    file: "spread_12_nvidia_slt_python_nan_fpy_and_15step_hld.png",
    cat: "nvidia",
    topicIds: ["python", "linux", "quality", "interview", "socboot", "gpu", "pcie", "ate", "pvt", "python-scpi"],
    header: "NVIDIA SLT MASTER — Fail-Closed Python NaN/FPY, Linux CLI & 15-Step HLD Playbook",
    question: "Block False-Clean PASS on float('nan')/timeouts, audit true FPY vs Retest Yield, interpret grep exit 0/1/2, inspect BGA sockets & run 15-step HLD on Xid 79.",
    answer: "Enforce math.isfinite() -> PASS/FAIL/INVALID · Preserve Attempt #1 for FPY · A-B-A",
    schKind: "generic",
    dmmReadout: "FPY 92.0%",
    schMeta: { b1: "SCPI / CLI Input", b1Sub: "'nan', timeout, exit 2", b2: "isfinite() Guard", b2Sub: "No default missing->0", b3: "3-State Verdict", b3Sub: "PASS / FAIL / INVALID" },
    keyEquations: ["FPY = (N_pass_attempt_1 / N_valid) × 100%", "RTY = y₁ × y₂ × ... × y_k  (Rolled Yield)", "DPPM = (Defects / Total_Units) × 10⁶"],
    intuition: "Lab automation must fail CLOSED: Python float('nan') raises NO ValueError and silently slips past naive limit comparisons—so three-state PASS / FAIL / INVALID logic and attempt-#1 FPY tracking are mandatory.",
    mathSteps: [
      "1) Parse safely: try float(raw.strip()) except ValueError -> 'INVALID'",
      "2) NaN / Inf trap: if not math.isfinite(val): return 'INVALID'!",
      "3) Check limit ONLY after finiteness: 3.10 ≤ val ≤ 3.50",
      "4) POSIX grep exit $?: 0 = match found, 1 = no match, ≥2 = error",
      "5) True FPY: record ONLY Attempt #1 (never let retry-until-pass overwrite)",
      "6) Rolled Throughput Yield (92% × 95%): RTY = 0.92 × 0.95 = 87.4%",
      "7) DPPM (2 escapes / 50×10³ units): (2 / 50×10³)×10⁶ = 40.0 DPPM"
    ],
    table: {
      headers: ["SLT Audit Layer", "Verified Check", "Trap Prevented"],
      rows: [
        ["Linux Pre-Reboot", "dmesg -T; lspci -vv; nvidia-smi -q", "Save logs BEFORE rebooting!"],
        ["Socket 8 Checks", "Bent pin, FOD, torque, planarity", "Reseating ≠ Root Cause!"],
        ["Python + Yield", "math.isfinite(); first_seen[sn]", "NaN/Retest False-Clean PASS"]
      ]
    },
    highlightRow: 2,
    postMathResolution: [
      "Enforce fail-closed Python grading (math.isfinite + subprocess timeout + try/finally: psu.write('OUTP OFF')).",
      "Freeze failing Xid 79 / AER DUT IMMEDIATELY without rebooting; pull uname -a, dmesg -T, lspci -nnvv, and nvidia-smi -q.",
      "Inspect PSU rails/droop, thermal TIM/fan/coolant, and BGA socket pins under a microscope (bent pin, FOD, coplanarity, torque).",
      "Isolate failing block via targeted DCGM diag / PCIe DMA test, then prove hardware causality via single-variable A -> B -> A swap.",
      "Report FPY separately from retest yield, quarantine INVALID station runs, and hand off reproducible logs/waveforms to ATE/DFT/ASIC."
    ],
    interviewScript: "Two automation bugs create huge escapes in SLT: float('nan') not raising ValueError in Python, and retry-until-pass scripts masking marginal socket contacts in FPY metrics. I enforce three-state PASS/FAIL/INVALID grading with math.isfinite() and preserve Attempt #1 for FPY. When triaging Xid 79, I freeze the unit before rebooting, save dmesg/lspci/nvidia-smi logs, inspect socket pogo pins and power rails, and run a single-variable A-B-A swap.",
    trapTitle: "Never Retry-Until-Pass or Equate Station Timeout With PASS!",
    trapBody: "grep returning exit 1 or float('nan') returning False on 'val > hi' does NOT pass silicon! Quarantine INVALID separately.",
    codeLines: [
      "import math",
      "def grade(raw, lo=3.10, hi=3.50):",
      "    try: v = float(str(raw).strip())",
      "    except (ValueError, TypeError): return 'INVALID'",
      "    return 'INVALID' if not math.isfinite(v) else ('PASS' if lo<=v<=hi else 'FAIL')"
    ]
  }
];

/* ==================== QUESTION-SPECIFIC FULL LECTURE & SOLUTION SPEC BUILDER ==================== */
function buildDynamicSpreadSpec(q, t, isNvidia) {
  const titlePrefix = isNvidia ? `NVIDIA SLT (${(t && t.title) || "Track"})` : `AVIONICS EE (${(t && t.title) || "Topic"})`;
  const idLabel = String(q.id || "STUDY").toUpperCase();
  const isNum = isNvidia ? (q.questionType === "number" || q.kind === "calc") : (q.expected !== undefined);
  const ans = isNum ? `${Number(Number(q.expected).toPrecision(5))} ${q.unit || ""}`.trim() : (q.level || q.phase || "Verified Engineering Proof");

  const txt = ((q.id || "") + " " + (q.question || "") + " " + (t?.id || "")).toLowerCase();
  let schKind = "generic";
  if (/100.*resistor|100\s*x|1\s*ω.*parallel|r14.*0\s*ω|parallel-x[789]/.test(txt)) schKind = "parallel100";
  else if (/1t1c|c_cell|bitline|dram|row hit|sense amp|trefi|trc/.test(txt)) schKind = "dram_read";
  else if (/setup|hold|skew|t_cq|timing|sta|386|820/.test(txt)) schKind = "sta";
  else if (/rectifier|bridge|ripple|1n400|piv/.test(txt)) schKind = "rectifier";
  else if (/zener|bjt|saturation|lm317|base|collector/.test(txt)) schKind = "zener_bjt";
  else if (/wheatstone|thevenin|10\s*mω.*dmm|loaded divider/.test(txt)) schKind = "bridge_thevenin";
  else if (/keysight|n7020a|1169b|droop|pdn|ddr4|cpu2/.test(txt)) schKind = "scope4ch";

  const stList = (Array.isArray(q.steps) ? q.steps : []).map(st => String(st).replace(/^Step\s*\d+\s*(?:\([^)]+\))?\s*[:.)-]?\s*/i, "").trim());
  const pme = window.PROFESSOR_MASTERY_ENGINE;
  const givens = pme?.parseGivenQuantities?.(q.question || "") || [];
  const convLine = pme?.buildConversionExplanation?.(q.question || "") || "Convert p(10⁻¹²), n(10⁻⁹), µ(10⁻⁶), m(10⁻³), k(10³), M(10⁶) to base SI first";
  const note = isNvidia ? pme?.NVIDIA_TRACK_LECTURES?.[t?.id] : pme?.TOPIC_PROFESSOR_NOTES?.[t?.id];
  const factorGiven = (window.CIRCUIT_CURRENT_QUESTION_RAILROAD?.extractQuantities(q.question || "") || []).find(g=>g.power!==0) || null;

  const eqUse = (q.formula && !String(q.formula).includes("->")) ? q.formula
    : /1t1c|c_cell|bitline/.test(txt) ? "ΔV_BL = (V_cell − V_PRE) · [C_cell / (C_cell + C_BL)]"
    : /refresh|trefi|retention/.test(txt) ? "t_REFI_hot = t_REFI_nom / 2 (above 85 °C)"
    : /droop|pdn|induct/.test(txt) ? "ΔV_PDN = I·R_PDN + L_pkg·(dI/dt)"
    : /ohm|v\s*=\s*i\s*\*\s*r/.test(txt) ? "I = V / R   |   V = I · R   |   P = V² / R"
    : "Spec Margin = Limit − (Measured ± Uncertainty)";

  const eqChips = [
    eqUse,
    q.sub || (isNum ? `Target Result = ${ans}` : (isNvidia ? "ΔV = I·R_PDN + L·(dI/dt)  |  10^(3n) SI" : "V = I·R  |  P = V·I  |  τ = R·C")),
    givens.length ? `${givens[0].raw} = ${givens[0].num} × 10^(${givens[0].exp}) ${givens[0].baseUnit}` : "Convert m/µ/n/p/k/M BEFORE multiplying!"
  ];

  const prefixRows = givens.length
    ? givens.slice(0, 3).map(g => [g.raw, `${g.prefixName} (10^${g.exp})`, `${Number(g.baseVal.toPrecision(4))} ${g.baseUnit}`])
    : [["Givens", "10^0", isNum ? (q.unit || "Base SI") : "Check schematic"], ["Slope / Gain", "10^(3n)", wrapText(eqUse, 24)[0] || eqUse], ["Spec / Fix", "Verified", wrapText(ans, 24)[0] || ans]];

  const mathSteps = isNum ? [
    `1) Givens: ${wrapText(q.question || "", 54)[0] || ""}`,
    `2) 10^(3n) Prefix Check: ${wrapText(convLine, 48)[0] || convLine}`,
    `3) Governing Equation: ${eqUse}`,
    `4) Base-SI Substitution: ${q.sub || "Plug converted 10^(3n) values into equation"}`,
    `5) Intermediate Balance: Check powers of 10 cancellation & 3–4 sig figs`,
    `6) Verified Numerical Answer -> ${ans}`
  ] : [
    `1) Governing Equation: ${eqUse}`,
    `2) Physical Mechanism: ${wrapText(stList[0] || q.question || "", 50)[0] || ""}`,
    `3) Predicted Healthy Baseline: ${wrapText(stList[1] || "Compare healthy rail/clock vs fault", 48)[0] || ""}`,
    `4) Quantitative Margin (10^3n): ${q.sub || wrapText(convLine, 48)[0]}`,
    `5) Isolation Criterion: Single-variable A -> B -> A swap proves DUT vs fixture`,
    `6) Verified Disposition -> ${ans}`
  ];

  const postMathResolution = [
    `Solve paper math in 10^(3n) first (${ans}) so you know the exact passing window before touching hardware.`,
    `Open schematic to locate test points, series shunts, pull-ups, and return ground reference for ${t?.title || "this circuit"}.`,
    `Configure DMM (V parallel, Ω power-OFF, 4W Kelvin <1 Ω) or 4-Ch Scope (N7020A + 1169B + <5mm spring gnd) with PSU CC limit.`,
    `Isolate fault root cause: ${stList[1] || stList[2] || "compare healthy reference against loaded DUT under thermal soak / stress"}.`,
    `Prove causality with single-variable A-B-A swap, apply hardware/FW fix, and re-verify margin cleanly against ${ans}.`
  ];

  const interviewScript = q.interviewAnswer || (
    `First I establish the 10^(3n) theoretical expectation using ${eqUse} -> ${ans}. Next I locate the net, shunt, or clock test point on the schematic and set up a current-limited, properly grounded probe (4-wire Kelvin or N7020A + <5 mm spring ground). Finally I isolate the defect with a single-variable A-B-A swap, apply the root-cause hardware fix, and verify the margin on the real product.`
  );

  const codeLines = q.code
    ? String(q.code).split("\n").slice(0, 6)
    : (isNum ? [
        `# Automated 10^(3n) Spec Check (${idLabel})`,
        `expected = ${Number.isFinite(Number(q.expected)) ? q.expected : 0}  # ${q.unit || ""}`,
        `tol = max(1e-6, abs(expected) * 0.015)`,
        `assert math.isfinite(measured) and abs(measured - expected) <= tol`
      ] : [
        `# Engineer Verification Sequence (${idLabel})`,
        `1. Power-OFF short check -> set CC limit on PSU`,
        `2. Capture raw scope/DMM/dmesg logs BEFORE reset`,
        `3. Execute single-variable A-B-A swap -> PASS/FAIL/INVALID`
      ]);

  return {
    header: `${idLabel} · ${titlePrefix}`,
    factorGiven,
    question: q.question || "",
    answer: ans,
    schKind,
    dmmReadout: isNum ? String(ans).slice(0, 9) : "A-B-A OK",
    schMeta: {
      b1: t?.title || "Input / Source", b1Sub: isNum ? `Target: ${q.unit}` : "System Givens",
      b2: q.skillName || q.learningObjective || "Core Law", b2Sub: eqUse,
      b3: ans, b3Sub: isNvidia ? "PASS/FAIL/INVALID" : "GO/NO-GO Margin",
      c1: `Blue Path: ${wrapText(stList[0] || q.question || "", 72)[0] || ""}`,
      c2: `10^(3n) Rule: ${wrapText(convLine, 70)[0] || convLine}`,
      waveTitle: `Calibrated Analyzer Plot (${idLabel} · 10^(3n) Engineering Axes)`,
      waveNote: isNum ? `${eqUse}  =>  ${ans}` : (note?.lawWhy || "Compare measured operating point against spec window")
    },
    keyEquations: eqChips,
    intuition: (isNvidia ? note?.physics : note?.intuition) || (q.lesson && (typeof q.lesson === "string" ? q.lesson : q.lesson.summary)) || "",
    mathSteps,
    postMathResolution,
    interviewScript,
    table: { headers: ["Input Token", "Prefix Scale", "10^(3n) SI Value"], rows: prefixRows },
    highlightRow: 2,
    rationale: [
      `Bench Step: ${stList[1] || "Record calibrated DMM/scope range, ground ref & timestamp before touching hardware."}`,
      `Trap Check: ${note?.trap || "Verify 10^(3n) prefixes & A-B-A control swap before condemning silicon/PCBA."}`
    ],
    trapTitle: "Critical Math / Measurement Trap to Avoid",
    trapBody: note?.trap || (q.hints && q.hints[2]) || "Convert prefixes to 10^(3n) base SI first and isolate via A-B-A before swapping parts.",
    babySteps: postMathResolution,
    codeLines
  };
}

function renderQuestionNotebookSpread(q, t, isNvidia) {
  // Match the OHM-F1 readiness math, operating-point graph and documented probe method exactly.
  if (window.OHM_F1_ENGINEER_STUDIO?.isF1(q, isNvidia)) return window.OHM_F1_ENGINEER_STUDIO.renderSpread(q);
  const spec = buildDynamicSpreadSpec(q, t, isNvidia);
  const svgMarkup = renderNotebookSpreadSVG(spec);
  const railroad = window.CIRCUIT_RAILROAD_WHITEBOARD?.render(q, t, isNvidia) || "";
  // Tab-specific equation scratchpads now render directly in all four learning modes.
  const fname = `${String(q.id || "study_sheet").replace(/[^a-zA-Z0-9_-]/g, "_")}_full_lecture_sheet.png`;
  return `<section class="nb-spread-wrap" aria-label="Full Lecture Engineering Study and Solution Sheet">
    <div class="nb-spread-toolbar">
      <div class="nb-spread-title-group">
        <span class="nb-spread-pill">📐 ENGINEERING STUDY &amp; SOLUTION SHEET (2600×1400)</span>
        <strong>Question-Tailored 10<sup>3n</sup> Visual Proof, Post-Math Product Steps &amp; Interview Script for ${esc(String(q.id || "").toUpperCase())}</strong>
      </div>
      <div class="nb-spread-actions">
        <button type="button" class="nb-spread-btn" data-prof-dl-png="${esc(fname)}">📸 Download .PNG Sheet</button>
        <button type="button" class="nb-spread-btn secondary" data-prof-zoom-nb="1">🔍 Fullscreen View</button>
      </div>
    </div>
    <div class="nb-spread-canvas">${svgMarkup}</div>
  </section>${railroad}`;
}

let galleryOpen = false;
let activeFlagshipIdx = 0;

function renderFlagshipGallerySection(modeFilter, topicId) {
  const items = FLAGSHIP_SPREAD_SPECS.filter(s => {
    const modeOk = !modeFilter || modeFilter === "all" || s.cat === modeFilter;
    if (!modeOk) return false;
    if (topicId && Array.isArray(s.topicIds) && s.topicIds.includes(topicId)) return true;
    return !topicId;
  });
  const list = items.length ? items : FLAGSHIP_SPREAD_SPECS.filter(s => !modeFilter || modeFilter === "all" || s.cat === modeFilter);
  if (!list.length) return "";
  const cur = list[Math.min(activeFlagshipIdx, list.length - 1)] || list[0];
  return `<details class="nb-gallery-details" ${galleryOpen ? "open" : ""}>
    <summary>🖼️ Related ${esc(modeFilter === "nvidia" ? "NVIDIA SLT" : "Avionics EE")} Reference Solution Sheets (${list.length} Topic-Filtered .PNG Ready)</summary>
    <div class="nb-gallery-body">
      <div class="nb-gallery-pills" role="group" aria-label="Select topic reference sheet">
        ${list.map((sp, i) => `<button type="button" class="nb-gallery-pill ${sp.file === cur.file ? "active" : ""}" data-nb-gal-idx="${i}">${i + 1}. ${esc(sp.header.split("—")[0].trim())}</button>`).join("")}
      </div>
      <div class="nb-spread-toolbar" style="margin-top:10px;">
        <strong>${esc(cur.header)}</strong>
        <div class="nb-spread-actions">
          <button type="button" class="nb-spread-btn" data-prof-dl-png="${esc(cur.file.replace(/\.png$/i,"_UPDATED.png"))}">⬇️ Download Updated Live PNG</button>
          <button type="button" class="nb-spread-btn secondary" data-prof-zoom-nb="1">🔍 Enlarge Fullscreen</button>
        </div>
      </div>
      <p class="nb-spread-note">This SVG is dynamically typeset with corrected fraction layout. Older archived raster PNGs are historical references; download the updated live PNG above instead.</p><div class="nb-spread-canvas">${renderNotebookSpreadSVG(cur)}</div>
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
    canvas.height = 1400;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 2600, 1400);
    URL.revokeObjectURL(url);
    canvas.toBlob(pngBlob => {
      if (!pngBlob) return;
      const dlUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = filename || "engineering_study_sheet.png";
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
    dlg.innerHTML = `<div class="nb-zoom-head"><strong>📐 Engineering Study &amp; Complete Solution Sheet (2600×1400 Full Lecture View)</strong><div><button type="button" id="nbZoomDlBtn" class="nb-spread-btn">📸 Download .PNG</button> <button type="button" id="nbZoomCloseBtn" class="nb-spread-btn secondary">Close ×</button></div></div><div id="nbZoomContent"></div>`;
    document.body.appendChild(dlg);
    dlg.querySelector("#nbZoomCloseBtn").onclick = () => dlg.close();
    dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
  }
  const content = dlg.querySelector("#nbZoomContent");
  content.innerHTML = svgEl.outerHTML;
  dlg.querySelector("#nbZoomDlBtn").onclick = () => downloadSvgAsPng(content.querySelector("svg"), "engineering_study_sheet.png");
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
  version: "3.0.0",
  FLAGSHIP_SPREAD_SPECS,
  renderNotebookSpreadSVG,
  buildDynamicSpreadSpec,
  renderQuestionNotebookSpread,
  renderFlagshipGallerySection,
  bindNotebookSpreads
};

})();
