"use strict";
/* Professor 3-Page Open Spiral Graph-Paper Notebook Spread Renderer (v1.0)
   Converts ANY Avionics EE (1,150 Qs), NVIDIA SLT (600 Qs), or Coursework/Interview
   Worked Solution into a crisp 3-Page Open Spiral Graph-Paper Notebook Spread SVG + PNG
   matching the user's exact 3-page study notebook layout:
   Page 1 (Left):   Header + Question + Circled Answer + Color-Coded Schematic + Waveform/Curve
   Page 2 (Center): Step-by-Step Uncut Math/Physics Proof + Verification Table + Red/Yellow TRAP Box
   Page 3 (Right):  Expanded Baby-Step Breakdown + Dotted PSEUDOCODE Box + Line-by-Line Commented Code */
(function(){

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function wrapText(str, maxChars) {
  const words = String(str ?? "").replace(/\s+/g, " ").trim().split(" ");
  if (!words.length || !words[0]) return [];
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (!cur) { cur = w; }
    else if (cur.length + 1 + w.length <= maxChars) { cur += " " + w; }
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function renderLines(lines, x, startY, dy, fill, size, weight, family) {
  const fam = family || "'Comic Sans MS', 'Chalkboard SE', 'Segoe UI', system-ui, sans-serif";
  return lines.map((ln, idx) =>
    `<text x="${x}" y="${startY + idx * dy}" font-family="${fam}" font-size="${size}" font-weight="${weight || 600}" fill="${fill}">${esc(ln)}</text>`
  ).join("");
}

/* Built-in reusable schematic/waveform artwork generators so every spread has rich color-coded diagrams */
function drawSchematicByKind(kind, meta) {
  const m = meta || {};
  if (kind === "parallel100") {
    return `
      <rect x="92" y="340" width="90" height="72" rx="10" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
      <text x="137" y="370" text-anchor="middle" font-size="18" font-weight="800" fill="#92400e">+5.0 V</text>
      <text x="137" y="396" text-anchor="middle" font-size="15" font-weight="700" fill="#b45309">I_lim ≤ 2.5A</text>
      <path d="M 182 365 H 740 M 182 465 H 740 M 137 412 V 465 H 182" fill="none" stroke="#1e3a8a" stroke-width="3.5"/>
      <rect x="235" y="388" width="76" height="50" rx="7" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2.5"/>
      <text x="273" y="410" text-anchor="middle" font-size="15" font-weight="800" fill="#1e40af">R1=1Ω</text>
      <text x="273" y="428" text-anchor="middle" font-size="13" fill="#15803d">Healthy</text>
      <path d="M 273 365 V 388 M 273 438 V 465" stroke="#1d4ed8" stroke-width="2.5"/>
      <rect x="355" y="388" width="96" height="50" rx="7" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
      <text x="403" y="410" text-anchor="middle" font-size="15" font-weight="800" fill="#991b1b">R14=0Ω</text>
      <text x="403" y="428" text-anchor="middle" font-size="13" font-weight="700" fill="#dc2626">SHORT (Hot)</text>
      <path d="M 403 365 V 388 M 403 438 V 465" stroke="#dc2626" stroke-width="2.5"/>
      <rect x="495" y="388" width="92" height="50" rx="7" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.5" stroke-dasharray="6 4"/>
      <text x="541" y="410" text-anchor="middle" font-size="15" font-weight="800" fill="#0c4a6e">R27=∞Ω</text>
      <text x="541" y="428" text-anchor="middle" font-size="13" fill="#0369a1">OPEN (25°C)</text>
      <path d="M 541 365 V 388 M 541 438 V 465" stroke="#0369a1" stroke-width="2.5"/>
      <rect x="630" y="388" width="88" height="50" rx="7" fill="#dcfce7" stroke="#15803d" stroke-width="2.5"/>
      <text x="674" y="410" text-anchor="middle" font-size="15" font-weight="800" fill="#14532d">R100=1Ω</text>
      <text x="674" y="428" text-anchor="middle" font-size="13" fill="#15803d">60°C @1V</text>
      <path d="M 674 365 V 388 M 674 438 V 465" stroke="#15803d" stroke-width="2.5"/>
      <text x="92" y="498" font-size="16" font-weight="700" fill="#1d4ed8">Blue: Healthy Req = 1/100 = 10 mΩ</text>
      <text x="92" y="522" font-size="16" font-weight="700" fill="#dc2626">Red: 0Ω short masks ∞Ω opens until cleared with 4W Kelvin + pad lift</text>
    `;
  }
  if (kind === "sta") {
    return `
      <rect x="92" y="340" width="110" height="78" rx="8" fill="#dbeafe" stroke="#1d4ed8" stroke-width="3"/>
      <text x="147" y="372" text-anchor="middle" font-size="16" font-weight="800" fill="#1e3a8a">Launch DFF</text>
      <text x="147" y="395" text-anchor="middle" font-size="14" fill="#1d4ed8">t_CQ=300..950ps</text>
      <rect x="260" y="330" width="165" height="62" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="3"/>
      <text x="342" y="357" text-anchor="middle" font-size="15" font-weight="800" fill="#14532d">Slow Path (P2/P3)</text>
      <text x="342" y="379" text-anchor="middle" font-size="14" fill="#15803d">AND→OR→MUX = 590ps</text>
      <rect x="260" y="410" width="165" height="54" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
      <text x="342" y="434" text-anchor="middle" font-size="15" font-weight="800" fill="#991b1b">Fast Path (P4)</text>
      <text x="342" y="454" text-anchor="middle" font-size="14" fill="#dc2626">Q_S→MUX_S = 30ps min</text>
      <rect x="490" y="352" width="90" height="72" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
      <text x="535" y="384" text-anchor="middle" font-size="16" font-weight="800" fill="#92400e">2:1</text>
      <text x="535" y="405" text-anchor="middle" font-size="15" font-weight="700" fill="#b45309">MUX</text>
      <rect x="635" y="346" width="120" height="78" rx="8" fill="#f3e8ff" stroke="#7e22ce" stroke-width="3"/>
      <text x="695" y="376" text-anchor="middle" font-size="16" font-weight="800" fill="#581c87">Capture DFF</text>
      <text x="695" y="398" text-anchor="middle" font-size="14" fill="#6b21a8">tsu=300 · th=400ps</text>
      <path d="M 202 361 H 260 M 202 435 H 260 M 425 361 L 490 375 M 425 437 L 490 410 M 580 385 H 635" fill="none" stroke="#1e293b" stroke-width="3"/>
      <text x="92" y="494" font-size="16" font-weight="700" fill="#15803d">Green = Slow Setup Path (T_min = 2590 ps → 386.10 MHz)</text>
      <text x="92" y="518" font-size="16" font-weight="700" fill="#dc2626">Red = Fast Hold Race (330ps &lt; 1150ps → Slack −820ps; add delay!)</text>
    `;
  }
  if (kind === "rectifier") {
    return `
      <circle cx="135" cy="405" r="34" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
      <text x="135" y="401" text-anchor="middle" font-size="15" font-weight="800" fill="#92400e">12 Vrms</text>
      <text x="135" y="421" text-anchor="middle" font-size="13" fill="#b45309">60 Hz</text>
      <rect x="220" y="352" width="165" height="104" rx="10" fill="#dbeafe" stroke="#1d4ed8" stroke-width="3"/>
      <text x="302" y="384" text-anchor="middle" font-size="15.5" font-weight="800" fill="#1e40af">4-Diode Si Bridge</text>
      <text x="302" y="408" text-anchor="middle" font-size="13.5" fill="#1d4ed8">2 × 0.7V = 1.4V drop</text>
      <text x="302" y="432" text-anchor="middle" font-size="13.5" font-weight="700" fill="#15803d">f_ripple = 120 Hz</text>
      <path d="M 169 405 H 220 M 385 362 H 680 M 385 450 H 680 M 502 362 V 376 M 502 436 V 450 M 680 362 V 376 M 680 436 V 450" fill="none" stroke="#1e293b" stroke-width="3"/>
      <rect x="442" y="376" width="120" height="60" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="2.5"/>
      <text x="502" y="402" text-anchor="middle" font-size="14.5" font-weight="800" fill="#14532d">C = 1000µF</text>
      <text x="502" y="422" text-anchor="middle" font-size="12.5" fill="#15803d">Filter Cap</text>
      <rect x="615" y="376" width="130" height="60" rx="8" fill="#f3e8ff" stroke="#7e22ce" stroke-width="2.5"/>
      <text x="680" y="402" text-anchor="middle" font-size="14.5" font-weight="800" fill="#581c87">R_L = 1.0kΩ</text>
      <text x="680" y="422" text-anchor="middle" font-size="12.5" fill="#6b21a8">Vp(out)=15.57V</text>
      <text x="92" y="494" font-size="15.5" font-weight="700" fill="#1d4ed8">Blue: Vp(sec)=√2×12=16.97V → subtract 2×0.7V = 15.57V</text>
      <text x="92" y="518" font-size="15.5" font-weight="700" fill="#15803d">Green: Vr(pp) = 15.57 / (120Hz × 1kΩ × 1000µF) = 129.8 mVpp</text>
    `;
  }
  if (kind === "zener_bjt") {
    return `
      <rect x="92" y="352" width="90" height="72" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
      <text x="137" y="384" text-anchor="middle" font-size="16" font-weight="800" fill="#92400e">+12.0 V</text>
      <text x="137" y="406" text-anchor="middle" font-size="13" fill="#b45309">Vin Supply</text>
      <rect x="225" y="358" width="135" height="58" rx="8" fill="#dbeafe" stroke="#1d4ed8" stroke-width="3"/>
      <text x="292" y="384" text-anchor="middle" font-size="15" font-weight="800" fill="#1e40af">Rs = 100 Ω</text>
      <text x="292" y="404" text-anchor="middle" font-size="14" fill="#1d4ed8">I_T = 69 mA</text>
      <rect x="408" y="346" width="142" height="92" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="3"/>
      <text x="479" y="378" text-anchor="middle" font-size="16" font-weight="800" fill="#14532d">5.1V Zener</text>
      <text x="479" y="400" text-anchor="middle" font-size="14" fill="#15803d">I_Z = I_T − I_L</text>
      <text x="479" y="422" text-anchor="middle" font-size="15" font-weight="800" fill="#dc2626">= 59.0 mA</text>
      <rect x="598" y="346" width="140" height="92" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
      <text x="668" y="376" text-anchor="middle" font-size="15" font-weight="800" fill="#991b1b">R_L=510Ω / BJT</text>
      <text x="668" y="399" text-anchor="middle" font-size="14" fill="#7f1d1d">I_L = 10 mA</text>
      <text x="668" y="421" text-anchor="middle" font-size="14" font-weight="700" fill="#b91c1c">BJT SAT (9.8mA)</text>
      <path d="M 182 387 H 225 M 360 387 H 598" stroke="#1e293b" stroke-width="3" fill="none"/>
      <text x="92" y="494" font-size="16" font-weight="700" fill="#15803d">Green: Zener holds node @ 5.1V → KCL: 69 − 10 = 59 mA</text>
      <text x="92" y="518" font-size="16" font-weight="700" fill="#dc2626">Red: β·IB (43 mA) &gt; IC(sat) (9.8 mA) → BJT Saturated (0.2V)</text>
    `;
  }
  if (kind === "bridge_thevenin") {
    return `
      <circle cx="128" cy="400" r="32" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
      <text x="128" y="405" text-anchor="middle" font-size="16" font-weight="800" fill="#92400e">+12 V</text>
      <rect x="215" y="346" width="145" height="60" rx="8" fill="#dbeafe" stroke="#1d4ed8" stroke-width="3"/>
      <text x="287" y="372" text-anchor="middle" font-size="15" font-weight="800" fill="#1e40af">Left Arm (A)</text>
      <text x="287" y="393" text-anchor="middle" font-size="14" fill="#1d4ed8">R1=10k, R3=10k → 6.0V</text>
      <rect x="395" y="346" width="165" height="60" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
      <text x="477" y="372" text-anchor="middle" font-size="15" font-weight="800" fill="#991b1b">Thermistor Leg (B)</text>
      <text x="477" y="393" text-anchor="middle" font-size="14" fill="#dc2626">R2=10k, RT=9k → 5.684V</text>
      <rect x="595" y="346" width="150" height="60" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="3"/>
      <text x="670" y="372" text-anchor="middle" font-size="15" font-weight="800" fill="#14532d">10MΩ DMM Load</text>
      <text x="670" y="393" text-anchor="middle" font-size="14" fill="#15803d">R2_eq = R2 ∥ 10MΩ</text>
      <path d="M 160 400 H 215 M 360 376 H 395 M 560 376 H 595" stroke="#1e293b" stroke-width="3" fill="none"/>
      <text x="92" y="455" font-size="16" font-weight="700" fill="#1d4ed8">Blue: Bridge V_out = V_A − V_B = 6.000 − 5.6842 = +315.8 mV</text>
      <text x="92" y="480" font-size="16" font-weight="700" fill="#15803d">Green: Zero 12V source → R_TH = (10k∥10k) + (10k∥9k) = 9.737 kΩ</text>
      <text x="92" y="505" font-size="16" font-weight="700" fill="#dc2626">Red: On 1MΩ||1MΩ divider, 10MΩ DMM drags 5.00V → 4.762V (−4.8%)</text>
    `;
  }
  if (kind === "scope4ch") {
    return `
      <rect x="92" y="342" width="160" height="84" rx="8" fill="#dbeafe" stroke="#1d4ed8" stroke-width="3"/>
      <text x="172" y="372" text-anchor="middle" font-size="15" font-weight="800" fill="#1e3a8a">DUT / GPU / CPU2</text>
      <text x="172" y="394" text-anchor="middle" font-size="13" fill="#1d4ed8">L_pkg=0.25nH · R=2mΩ</text>
      <text x="172" y="414" text-anchor="middle" font-size="13" fill="#dc2626">ΔI = 40 A in 20 ns</text>
      <rect x="290" y="340" width="225" height="90" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="3"/>
      <text x="402" y="366" text-anchor="middle" font-size="14" font-weight="800" fill="#14532d">Keysight 4-Ch Probes</text>
      <text x="402" y="386" text-anchor="middle" font-size="13" fill="#14532d">Ch1: Exported CLK (SMA)</text>
      <text x="402" y="404" text-anchor="middle" font-size="13" fill="#14532d">Ch2/4: Logic/M-Rail (N7020A)</text>
      <text x="402" y="422" text-anchor="middle" font-size="13" fill="#14532d">Ch3: I_sense Shunt (1169B)</text>
      <rect x="550" y="342" width="190" height="84" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
      <text x="645" y="370" text-anchor="middle" font-size="15" font-weight="800" fill="#92400e">DDR4-3200 / Shmoo</text>
      <text x="645" y="392" text-anchor="middle" font-size="13" fill="#b45309">BW = 25.6 GB/s · tRC=45.75ns</text>
      <text x="645" y="412" text-anchor="middle" font-size="13" fill="#92400e">Check raw logs vs PASS</text>
      <path d="M 252 384 H 290 M 515 384 H 550" stroke="#1e293b" stroke-width="3" fill="none"/>
      <text x="92" y="476" font-size="16" font-weight="700" fill="#1d4ed8">Blue: ΔV_total = I·R (80mV) + L·di/dt (500mV) = 580mV droop spike</text>
      <text x="92" y="502" font-size="16" font-weight="700" fill="#15803d">Green: Trigger on Ch3 current step + deskew before computing V·I</text>
    `;
  }
  // Generic dynamic 3-block hardware flow diagram tailored to meta
  const b1 = esc(m.b1 || "1. Source / Stimulus");
  const b2 = esc(m.b2 || "2. Circuit / Logic");
  const b3 = esc(m.b3 || "3. Output / Meter");
  const c1 = esc(m.c1 || "Blue: Verify givens & prefix 10^(3n) before substituting");
  const c2 = esc(m.c2 || "Green: Check return path, polarity, & spec guardband");
  return `
    <rect x="92" y="348" width="180" height="86" rx="10" fill="#dbeafe" stroke="#1d4ed8" stroke-width="3"/>
    <text x="182" y="388" text-anchor="middle" font-size="16" font-weight="800" fill="#1e3a8a">${b1.slice(0,22)}</text>
    <text x="182" y="412" text-anchor="middle" font-size="14" fill="#1d4ed8">${esc(m.b1Sub || "Input / Rail")}</text>
    <path d="M 272 391 H 322" stroke="#1e293b" stroke-width="3.5" fill="none"/>
    <polygon points="322,385 334,391 322,397" fill="#1e293b"/>
    <rect x="334" y="348" width="190" height="86" rx="10" fill="#dcfce7" stroke="#15803d" stroke-width="3"/>
    <text x="429" y="388" text-anchor="middle" font-size="16" font-weight="800" fill="#14532d">${b2.slice(0,22)}</text>
    <text x="429" y="412" text-anchor="middle" font-size="14" fill="#15803d">${esc(m.b2Sub || "Physical Law")}</text>
    <path d="M 524 391 H 574" stroke="#1e293b" stroke-width="3.5" fill="none"/>
    <polygon points="574,385 586,391 574,397" fill="#1e293b"/>
    <rect x="586" y="348" width="175" height="86" rx="10" fill="#f3e8ff" stroke="#7e22ce" stroke-width="3"/>
    <text x="673" y="388" text-anchor="middle" font-size="16" font-weight="800" fill="#581c87">${b3.slice(0,20)}</text>
    <text x="673" y="412" text-anchor="middle" font-size="14" fill="#6b21a8">${esc(m.b3Sub || "Result / PASS")}</text>
    <text x="92" y="476" font-size="16" font-weight="700" fill="#1d4ed8">${c1.slice(0,66)}</text>
    <text x="92" y="502" font-size="16" font-weight="700" fill="#15803d">${c2.slice(0,66)}</text>
  `;
}

function drawWaveformByKind(kind, meta) {
  const m = meta || {};
  if (kind === "sta") {
    return `
      <text x="92" y="610" font-size="18" font-weight="800" fill="#1e293b">Timing Waveform: Same-Edge Hold Race vs. Next-Edge Setup</text>
      <text x="92" y="646" font-size="15" font-weight="700" fill="#1d4ed8">CLK</text>
      <path d="M 155 655 H 240 V 620 H 335 V 655 H 450 V 620 H 545 V 655 H 730" fill="none" stroke="#1d4ed8" stroke-width="3.5"/>
      <text x="92" y="704" font-size="15" font-weight="700" fill="#15803d">Q_S</text>
      <path d="M 155 712 H 265 V 680 H 520 V 712 H 730" fill="none" stroke="#15803d" stroke-width="3.5"/>
      <text x="92" y="762" font-size="15" font-weight="700" fill="#dc2626">MUX_S</text>
      <path d="M 155 770 H 282 V 738 H 538 V 770 H 730" fill="none" stroke="#dc2626" stroke-width="3.5"/>
      <line x1="240" y1="615" x2="240" y2="790" stroke="#dc2626" stroke-width="2" stroke-dasharray="5 5"/>
      <line x1="365" y1="615" x2="365" y2="790" stroke="#b45309" stroke-width="2" stroke-dasharray="5 5"/>
      <text x="92" y="806" font-size="14" font-weight="800" fill="#dc2626">↑ Earliest Arrival (330ps) &lt; Required Hold+Skew (1150ps) = −820ps VIOLATION!</text>
      <text x="92" y="834" font-size="14.5" font-weight="700" fill="#1e3a8a">Fix: Insert &gt;= 820 ps delay buffer on Q_S→MUX_S net (T_clk never fixes Hold!)</text>
    `;
  }
  if (kind === "rectifier" || kind === "scope4ch") {
    return `
      <text x="92" y="610" font-size="18" font-weight="800" fill="#1e293b">${esc(m.waveTitle || "Oscilloscope Transient & Ripple Waveform (4-Ch Trigger)")}</text>
      <path d="M 155 735 H 735" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4"/>
      <path d="M 155 650 H 735" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4"/>
      <path d="M 155 650 H 285 L 315 735 Q 355 695 405 660 H 545 L 575 735 Q 615 695 665 660 H 730" fill="none" stroke="#1d4ed8" stroke-width="4"/>
      <path d="M 155 790 H 285 V 755 H 410 V 790 H 545 V 755 H 670 V 790 H 730" fill="none" stroke="#15803d" stroke-width="3.5"/>
      <line x1="285" y1="622" x2="285" y2="810" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="5 4"/>
      <rect x="255" y="608" width="58" height="24" rx="5" fill="#fef3c7" stroke="#d97706"/>
      <text x="284" y="625" text-anchor="middle" font-size="13" font-weight="800" fill="#92400e">Trig A</text>
      <text x="92" y="660" font-size="14" font-weight="700" fill="#1d4ed8">Vrail</text>
      <text x="92" y="782" font-size="14" font-weight="700" fill="#15803d">I/Trig</text>
      <text x="92" y="832" font-size="15" font-weight="700" fill="#dc2626">${esc(m.waveNote || "Transient step / ripple amplitude depends inversely on C and switching period")}</text>
    `;
  }
  return `
    <text x="92" y="610" font-size="18" font-weight="800" fill="#1e293b">${esc(m.waveTitle || "Response Curve / Signal Timing & Operating Point")}</text>
    <path d="M 145 635 V 795 H 735" stroke="#334155" stroke-width="2.5" fill="none"/>
    <path d="M 145 795 Q 250 675 430 658 T 725 650" stroke="#1d4ed8" stroke-width="4" fill="none"/>
    <line x1="145" y1="650" x2="725" y2="650" stroke="#15803d" stroke-width="2" stroke-dasharray="6 5"/>
    <circle cx="315" cy="686" r="7" fill="#dc2626"/>
    <text x="330" y="683" font-size="14" font-weight="800" fill="#dc2626">Operating Point / Threshold</text>
    <text x="155" y="644" font-size="14" font-weight="700" fill="#15803d">Steady State / Limit (100%)</text>
    <text x="92" y="832" font-size="15" font-weight="700" fill="#1e3a8a">${esc((m.waveNote || "Verify polarity, prefix scale (10^3n), and steady-state boundary before Pass/Fail").slice(0,72))}</text>
  `;
}

function renderNotebookSpreadSVG(spec) {
  const s = spec || {};
  const header = esc(s.header || "ENGINEERING WORKBOOK — STEP-BY-STEP VISUAL NOTEBOOK");
  const questionLines = wrapText(s.question || "", 72).slice(0, 4);
  const answerPill = esc(s.answer || "Verified Solution");
  const schKind = s.schKind || "generic";
  const schMeta = s.schMeta || {};

  // Page 2 math proof lines + verification table + TRAP box
  const mathLines = (Array.isArray(s.mathSteps) ? s.mathSteps : []).slice(0, 8);
  const tbl = s.table || { headers: ["Step", "Condition / Parameter", "Result"], rows: [["1", "Baseline", "OK"]] };
  const trapTitle = esc(s.trapTitle || "★ TRAP / GOLDEN RULE ★");
  const trapLines = wrapText(s.trapBody || "Always convert engineering prefixes to base SI units BEFORE plugging numbers into equations, and verify with an independent check.", 64).slice(0, 5);

  // Page 3 baby steps + dotted pseudocode + line-by-line commented code
  const p3Steps = (Array.isArray(s.babySteps) ? s.babySteps : []).slice(0, 5);
  const pseudoLines = (Array.isArray(s.pseudo) ? s.pseudo : []).slice(0, 4);
  const codeLines = (Array.isArray(s.codeLines) ? s.codeLines : []).slice(0, 11);

  const fontMain = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
  const fontMono = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

  // Spiral rings helper
  const spiralAt = xCenter => Array.from({ length: 24 }, (_, i) => {
    const y = 78 + i * 40;
    return `
      <circle cx="${xCenter - 14}" cy="${y}" r="5.5" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
      <circle cx="${xCenter + 14}" cy="${y}" r="5.5" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
      <path d="M ${xCenter - 15} ${y - 4} Q ${xCenter} ${y - 11} ${xCenter + 15} ${y - 4}" fill="none" stroke="#475569" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M ${xCenter - 15} ${y + 3} Q ${xCenter} ${y + 10} ${xCenter + 15} ${y + 3}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
    `;
  }).join("");

  // Table geometry on Page 2 (starts dynamically below math steps)
  const tblY = 475;
  const colCount = Math.max(2, Math.min(4, (tbl.headers || []).length));
  const colW = Math.floor(676 / colCount);
  const tblHeaders = (tbl.headers || []).slice(0, colCount);
  const tblRows = (tbl.rows || []).slice(0, 5);

  const spreadId = "nb_" + Math.random().toString(36).slice(2, 9);

  return `<svg class="nb-spread-svg" viewBox="0 0 2400 1060" role="img" aria-label="${esc(header)}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="${spreadId}_grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#d5e4f0" stroke-width="1"/>
      </pattern>
      <linearGradient id="${spreadId}_desk" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c99e6b"/>
        <stop offset="50%" stop-color="#b88855"/>
        <stop offset="100%" stop-color="#a87948"/>
      </linearGradient>
      <filter id="${spreadId}_shadow" x="-2%" y="-2%" width="104%" height="106%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#2b1908" flood-opacity="0.35"/>
      </filter>
    </defs>

    <!-- Warm Wood Desk & Pens -->
    <rect x="0" y="0" width="2400" height="1060" fill="url(#${spreadId}_desk)"/>
    <rect x="14" y="210" width="20" height="540" rx="8" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="2"/>
    <rect x="18" y="170" width="12" height="45" rx="4" fill="#93c5fd"/>
    <rect x="2368" y="250" width="20" height="490" rx="8" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
    <rect x="2372" y="740" width="12" height="36" rx="4" fill="#fca5a5"/>

    <!-- Three Open Spiral Graph Paper Sheets -->
    <g filter="url(#${spreadId}_shadow)">
      <rect x="55" y="42" width="750" height="978" rx="10" fill="#fcfaf2" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="835" y="42" width="750" height="978" rx="10" fill="#fcfaf2" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="1615" y="42" width="750" height="978" rx="10" fill="#fcfaf2" stroke="#cbd5e1" stroke-width="2"/>
    </g>
    <rect x="65" y="52" width="730" height="958" fill="url(#${spreadId}_grid)"/>
    <rect x="845" y="52" width="730" height="958" fill="url(#${spreadId}_grid)"/>
    <rect x="1625" y="52" width="730" height="958" fill="url(#${spreadId}_grid)"/>

    <!-- Twin Wire Spiral Bindings -->
    ${spiralAt(820)}
    ${spiralAt(1600)}

    <!-- ==================== PAGE 1 (LEFT): QUESTION + SCHEMATIC + WAVEFORM ==================== -->
    <text x="92" y="92" font-family="${fontMain}" font-size="${header.length > 62 ? 15.5 : 18}" font-weight="800" fill="#0f294a">${header}</text>
    <line x1="92" y1="102" x2="770" y2="102" stroke="#1e3a8a" stroke-width="3"/>
    <text x="92" y="132" font-family="${fontMain}" font-size="17.5" font-weight="800" fill="#1d4ed8">Question / Challenge:</text>
    ${renderLines(questionLines, 92, 160, 25, "#1e293b", 17.5, 600, fontMain)}

    <rect x="92" y="264" width="676" height="44" rx="22" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
    <text x="430" y="292" text-anchor="middle" font-family="${fontMain}" font-size="${answerPill.length > 68 ? 13.5 : (answerPill.length > 56 ? 15 : 16.5)}" font-weight="800" fill="#991b1b">Answer: ${answerPill}</text>

    <text x="92" y="330" font-family="${fontMain}" font-size="18.5" font-weight="800" fill="#0f294a">1. Annotated Schematic &amp; Component Path:</text>
    <rect x="84" y="336" width="690" height="202" rx="10" fill="rgba(255,255,255,0.78)" stroke="#94a3b8" stroke-width="1.5"/>
    ${drawSchematicByKind(schKind, schMeta)}

    <rect x="84" y="576" width="690" height="278" rx="10" fill="rgba(255,255,255,0.82)" stroke="#94a3b8" stroke-width="1.5"/>
    ${drawWaveformByKind(schKind, schMeta)}

    <rect x="84" y="874" width="690" height="114" rx="10" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.5"/>
    <text x="102" y="904" font-family="${fontMain}" font-size="18" font-weight="800" fill="#1e3a8a">Zero-Background Physical Intuition:</text>
    ${renderLines(wrapText(s.intuition || "Think of Voltage as electrical pressure, Current as electron flow, and Resistance/Impedance as opposition along every closed loop.", 68).slice(0, 3), 102, 932, 24, "#1e293b", 16, 600, fontMain)}

    <!-- ==================== PAGE 2 (CENTER): STEP-BY-STEP MATH PROOF + TABLE + TRAP BOX ==================== -->
    <text x="870" y="92" font-family="${fontMain}" font-size="21" font-weight="800" fill="#0f294a">Step-by-Step Mathematical Proof &amp; Verification (All Work)</text>
    <line x1="870" y1="102" x2="1548" y2="102" stroke="#dc2626" stroke-width="3"/>

    <rect x="870" y="120" width="678" height="334" rx="10" fill="rgba(255,255,255,0.85)" stroke="#93c5fd" stroke-width="2"/>
    ${mathLines.map((ln, idx) => {
      const yPos = 152 + idx * 39;
      const isResult = idx === mathLines.length - 1;
      const text = esc(String(ln));
      const fSize = text.length > 74 ? 11.5 : 12.8;
      return (isResult ? `<rect x="884" y="${yPos - 22}" width="650" height="32" rx="6" fill="#dcfce7" stroke="#15803d" stroke-width="2"/>` : "") +
        `<text x="894" y="${yPos}" font-family="${fontMono}" font-size="${fSize}" font-weight="${isResult ? 800 : 700}" fill="${isResult ? "#14532d" : "#0f172a"}">${text}</text>`;
    }).join("")}

    <!-- Multi-Row Verification / Path / Comparison Table -->
    <text x="870" y="${tblY - 8}" font-family="${fontMain}" font-size="18.5" font-weight="800" fill="#0f294a">${esc(s.tableTitle || "Verification & Edge-Case Table (Uncut)")}</text>
    <rect x="870" y="${tblY}" width="676" height="36" fill="#1e3a8a" stroke="#0f172a" stroke-width="1.5"/>
    ${tblHeaders.map((h, i) => `<text x="${880 + i * colW}" y="${tblY + 23}" font-family="${fontMain}" font-size="14" font-weight="800" fill="#ffffff">${esc(String(h).slice(0, 18))}</text>`).join("")}
    ${tblRows.map((row, rIdx) => {
      const ry = tblY + 36 + rIdx * 34;
      const hi = rIdx === s.highlightRow;
      return `<rect x="870" y="${ry}" width="676" height="34" fill="${hi ? "#fee2e2" : (rIdx % 2 ? "#f1f5f9" : "#ffffff")}" stroke="#94a3b8" stroke-width="1"/>` +
        row.slice(0, colCount).map((cell, cIdx) =>
          `<text x="${880 + cIdx * colW}" y="${ry + 22}" font-family="${fontMono}" font-size="12" font-weight="${hi ? 800 : 600}" fill="${hi ? "#991b1b" : "#1e293b"}">${esc(String(cell).slice(0, 20))}</text>`
        ).join("");
    }).join("")}

    <!-- Red/Yellow Highlighted TRAP / GOLDEN RULE Box -->
    <rect x="870" y="726" width="676" height="260" rx="12" fill="#fffbeb" stroke="#dc2626" stroke-width="3.5"/>
    <rect x="870" y="726" width="676" height="40" rx="10" fill="#fee2e2"/>
    <text x="1208" y="752" text-anchor="middle" font-family="${fontMain}" font-size="15.5" font-weight="800" fill="#991b1b">${trapTitle.slice(0, 72)}</text>
    ${renderLines(trapLines, 892, 800, 34, "#7c2d12", 17, 700, fontMain)}

    <!-- ==================== PAGE 3 (RIGHT): BABY STEPS + DOTTED PSEUDOCODE + COMMENTED CODE ==================== -->
    <text x="1650" y="92" font-family="${fontMain}" font-size="21" font-weight="800" fill="#0f294a">Page 3 · Baby Steps, Pseudocode &amp; Verified Code</text>
    <line x1="1650" y1="102" x2="2328" y2="102" stroke="#15803d" stroke-width="3"/>

    <text x="1650" y="136" font-family="${fontMain}" font-size="18.5" font-weight="800" fill="#15803d">1. Uncut Baby-Step Reasoning Walkthrough:</text>
    ${p3Steps.map((st, idx) => {
      const sy = 152 + idx * 54;
      const wrapped = wrapText((idx + 1) + ") " + st, 68).slice(0, 2);
      return `<rect x="1650" y="${sy}" width="676" height="48" rx="7" fill="rgba(255,255,255,0.85)" stroke="#cbd5e1"/>` +
        renderLines(wrapped, 1664, sy + 20, 19, "#0f172a", 15, 600, fontMain);
    }).join("")}

    <!-- Dotted PSEUDOCODE Box -->
    <rect x="1650" y="434" width="676" height="148" rx="10" fill="#fefce8" stroke="#64748b" stroke-width="2.5" stroke-dasharray="8 6"/>
    <text x="1668" y="462" font-family="${fontMain}" font-size="16.5" font-weight="800" fill="#1e3a8a">2. Dotted PSEUDOCODE (Before Lab / Code Implementation):</text>
    ${pseudoLines.map((pl, i) => `<text x="1664" y="${492 + i * 24}" font-family="${fontMono}" font-size="12" font-weight="700" fill="#14532d">${esc(String(pl))}</text>`).join("")}

    <!-- Line-by-Line Commented Code Box -->
    <text x="1650" y="612" font-family="${fontMain}" font-size="18.5" font-weight="800" fill="#0f294a">3. Line-by-Line Commented Code &amp; Verification Script:</text>
    <rect x="1650" y="622" width="676" height="366" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="2.5"/>
    ${codeLines.map((cl, i) => `<text x="1664" y="${656 + i * 29}" font-family="${fontMono}" font-size="12" font-weight="600" fill="${String(cl).includes("//") || String(cl).includes("#") ? "#86efac" : "#e2e8f0"}">${esc(String(cl))}</text>`).join("")}
  </svg>`;
}

/* ============================================================================
   12 FLAGSHIP 3-PAGE SPREAD SPECS (Exported as 2400x1060 PNG Manual + Live UI)
   ============================================================================ */
const FLAGSHIP_SPREAD_SPECS = [
  {
    file: "spread_01_muon_100_parallel_resistors_debug.png",
    cat: "avionics",
    header: "MUON SPACE INTERVIEW — 5V Rail Feeding 100 Parallel 1Ω Resistors (Open + 0Ω Shorts)",
    question: "A 5V rail feeds 100 resistors (nominal 1Ω each) in parallel. Some burn OPEN (∞Ω) and some fail SHORTED (0Ω). Show paper math, schematic checks, IR camera & DMM steps.",
    answer: "Healthy Req = 10 mΩ (500A) · Clear 0Ω Shorts First -> Find ∞Ω Opens Second",
    schKind: "parallel100",
    intuition: "In parallel, ALL 100 branches share the exact +5V and GND copper nodes. One 0Ω short pulls Req -> 0Ω and masks every ∞Ω open branch!",
    mathSteps: [
      "1) Healthy Parallel Baseline: 1/Req = 100 × (1/1Ω) = 100 S",
      "2) Healthy Req = 1 / 100 = 0.01 Ω = 10.00 mΩ (NOT 100 Ω!)",
      "3) Ideal 5V Draw: I_total = V/Req = 5V / 0.01Ω = 500 A (2,500 W)",
      "4) With 2 Shorts (0Ω): Req_short ≈ 0.000 Ω (masks any opens!)",
      "5) Why 2-Wire DMM Fails: Lead resistance 0.24Ω >> 0.01Ω (2400% error)",
      "6) Lift R14 & R62 pads -> Remaining 95 healthy + 3 opens:",
      "7) New Req = 1 / (95 × 1 S) = 1/95 Ω = 10.526 mΩ -> N_open = 100 - 1/Req = 5"
    ],
    tableTitle: "4-Step Hardware Fault Isolation Matrix (Order Matters!)",
    table: {
      headers: ["Fault Mix", "4W Kelvin", "2W DMM", "IR @ 1V Bias"],
      rows: [
        ["Healthy 100×1Ω", "10.00 mΩ", "~0.25 Ω", "All 60°C warm"],
        ["Mixed 2S + 3O", "~0.001 Ω", "~0.24 Ω", "R14/R62 hotspots!"],
        ["Shorts Lifted", "10.526 mΩ", "~0.25 Ω", "R27/53/88 = 25°C!"]
      ]
    },
    highlightRow: 1,
    trapTitle: "★ GOLD INTERVIEW RULE: Never Inject 5V Directly & Never Trust 2W DMM! ★",
    trapBody: "Unclamped 5V dumps 500A+ and traces melt! Inject safe CC-limited 1V/2.5A, scan hotspots via IR camera + mV gradient, lift 1 pad per suspect (0.000Ω confirms short), then spot ∞Ω opens as cold spots on IR.",
    babySteps: [
      "Calculate healthy baseline FIRST on paper: Req = 1/N = 10 mΩ, I = 500 A.",
      "Read schematic to locate +5V_MAIN plane, bank jumpers JP1..JP10, & R1..R100.",
      "Power OFF: switch DMM from 2-wire (~0.24Ω error) to 4-wire Kelvin micro-ohm mode.",
      "Inject safe 1V / 2.5A CC limit -> lift 0Ω shorts via IR hotspot until Req >= 10 mΩ.",
      "Re-bias @ 1V: remaining ∞Ω open resistors consume 0W and stay cold at 25°C on IR!"
    ],
    pseudo: [
      "// 1. Measure baseline R4W_kelvin; IF R4W < 10mOhm THEN ShortPresent = TRUE",
      "// 2. WHILE ShortPresent: inject 1V/2A -> IR hotspot -> lift pad -> re-measure R4W",
      "// 3. Once R4W >= 10mOhm: N_active = round(1/R4W); cold spots on IR = Open R's!"
    ],
    codeLines: [
      "def debug_parallel_100(v_bus=5.0, r_nom=1.0, n=100, r_4w=0.010526):",
      "    r_healthy = r_nom / n                 # 1.0 / 100 = 0.010 Ohm (10 mOhm)",
      "    if r_4w < r_healthy * 0.8:            # < 8 mOhm indicates 0 Ohm short bridge",
      "        return 'CLEAR_SHORTS_FIRST_WITH_1V_IR_AND_LIFT_PAD'",
      "    n_healthy = round(r_nom / r_4w)       # Conductance sum: 1 / 0.010526 = 95",
      "    n_open = n - n_healthy                # 100 - 95 = 5 missing/open paths",
      "    return {'Req_mOhm': r_4w*1e3, 'opens_est': n_open, 'method': 'IR_cold_spot'}"
    ]
  },
  {
    file: "spread_02_engr852_hw2_setup_hold_sta.png",
    cat: "avionics",
    header: "ENGR 852 HW2 Q1(a)(b) — Static Timing: Max f_clk (386.10 MHz) vs. Hold Violation (−820 ps)",
    question: "t_CQ=300..950ps, AND=70..210ps, OR=50..200ps, MUX_D=40..180ps, MUX_S=30..170ps, tsu=300ps, th=400ps, skew=750ps. Find f_max and check for Hold Violation.",
    answer: "Setup Tmin = 2590 ps (f_max = 386.10 MHz) · Hold Slack = −820 ps VIOLATION!",
    schKind: "sta",
    intuition: "Setup checks the NEXT clock edge (worst MAX delays limit f_max). Hold checks the SAME clock edge (fastest MIN path races through capture DFF before t_hold ends!).",
    mathSteps: [
      "1) Slowest Setup Logic Path (P2/P3): AND + OR + MUX_D0 = 210 + 200 + 180 = 590 ps",
      "2) Setup Period: T_min = tCQ(max) + tLogic(max) + t_su + t_skew",
      "3) Substitute MAX: T_min = 950 + 590 + 300 + 750 = 2,590 ps = 2.590 ns",
      "4) Max Clock Frequency: f_max = 1 / 2.590 ns = 386.10 MHz",
      "5) Fastest Hold Arrival (P4): tCQ(min) + MUX_S(min) = 300 + 30 = 330 ps",
      "6) Required Hold Window: t_hold(max) + t_skew = 400 + 750 = 1,150 ps",
      "7) Hold Slack = Arrival_min − Req = 330 − 1,150 = −820 ps (FAILS even at 0 skew: −70ps!)"
    ],
    tableTitle: "Uncut All-Path Min/Max Delay & Slack Table",
    table: {
      headers: ["Path", "Description", "Max / Min", "Hold Slack"],
      rows: [
        ["P4", "Q_S -> MUX Select S", "170 / 330 ps", "−820 ps (FAIL)"],
        ["P1", "QA/B -> AND -> MUX D1", "390 / 410 ps", "−740 ps (FAIL)"],
        ["P2/P3", "QA..D -> AND -> OR -> D0", "590 / 460 ps", "−690 ps (FAIL)"]
      ]
    },
    highlightRow: 0,
    trapTitle: "★ ENGR 852 GOLDEN RULE: Slowing Clock f_clk NEVER Fixes Hold! ★",
    trapBody: "Notice T_clk is NOT in the Hold inequality (tCQ_min + tLogic_min >= thold + tskew)! Slowing f_clk to 1 Hz still fails Hold on the SAME edge. Fix Hold by adding >= +820 ps delay buffers on P4!",
    babySteps: [
      "Separate MAX delays (Setup -> slow critical path P2/P3) from MIN delays (Hold -> fast P4).",
      "Compute T_clk(min) = 950 + 590 + 300 + 750 = 2590 ps -> invert to f_max = 386.10 MHz.",
      "Compute Hold earliest arrival along shortest path P4: Q_S -> MUX_S = 300 + 30 = 330 ps.",
      "Compare 330 ps against t_hold + skew (400 + 750 = 1150 ps) -> −820 ps violation!",
      "Insert delay buffers >= +820 ps on S_buffered net; verify 0 hold failures in P&R/STA."
    ],
    pseudo: [
      "// 1. T_min = MAX(paths) + t_CQ_max + t_su + t_skew -> f_max = 1 / T_min",
      "// 2. FOR each path p: HoldSlack = (t_CQ_min + t_logic_min[p]) - (t_hold + t_skew)",
      "// 3. IF HoldSlack < 0: insert delay_buffer >= |HoldSlack| (NEVER slow clock!)"
    ],
    codeLines: [
      "module hw2_q1b_hold_fix (input clk, [3:0] d, input sel_in, output reg res);",
      "  reg [3:0] R; reg S; wire S_buf;       // 5 launching flip-flops",
      "  assign #850 S_buf = S;               // P&R inserts >=820ps delay buffer!",
      "  wire T = R[0] & R[1]; wire U = R[2] & R[3]; // 70ps min AND gates",
      "  wire V = T | U;                      // 50ps min OR gate",
      "  wire Y = S_buf ? T : V;              // MUX safely isolated from race",
      "  always @(posedge clk) begin          // Same rising edge launches & captures",
      "    R <= d; S <= sel_in; res <= Y;     // Hold slack now >= +30 ps!",
      "  end",
      "endmodule"
    ]
  },
  {
    file: "spread_03_engr852_casex_kmap_and_16bit_sad.png",
    cat: "avionics",
    header: "ENGR 852 HW2 Q2 & LAB — Truth Table casex (E = D) + 8-bit vs 16-bit Motion Estimator SAD",
    question: "Simplify 16-row truth table {A,B,C,D}->E (with 4'b0101 = X don't care) using Verilog casex & 4x4 K-Map, and prove why 16x16 Motion Estimator BestDist requires 16 bits (65,280) instead of 8 bits (0xFF).",
    answer: "K-Map Set X=1 => E = D (0 gates!) · Max 16x16 SAD = 256 × 255 = 65,280 (16-bit!)",
    schKind: "generic",
    schMeta: {
      b1: "4-bit {A,B,C,D}", b1Sub: "16-Row Truth Table",
      b2: "K-Map Set X=1", b2Sub: "8 cells group -> E=D",
      b3: "16x16 SAD Core", b3Sub: "Max 65,280 (16-bit!)",
      c1: "Blue: Setting row 0101 Don't-Care X=1 completes column D=1 -> E = D!",
      c2: "Green: BestDist initialized to 8'hFF (255) saturated immediately; fix = 16'hFFFF!",
      waveTitle: "8-Bit (0xFF Saturation Clip) vs. Full 16-Bit BestDist Accumulator Trace",
      waveNote: "256 pixels × 255 max diff = 65,280 < 65,535 (16'hFFFF fits cleanly without overflow!)"
    },
    intuition: "Don't-Care (X) lets you choose 1 or 0 to maximize K-Map powers-of-two loops. In 16x16 SAD, 256 unsigned byte diffs easily exceed 255—8-bit accumulators saturate blindly to 0xFF!",
    mathSteps: [
      "1) Rows with E=1 in HW2 Q2: 0001(1), 0011(3), 0111(7), 1001..1111(9,11,13,15)",
      "2) Only odd D=1 row missing is 0101(5), which is Don't-Care X!",
      "3) Set X=1 -> All 8 D=1 minterms fill one K-Map octet => E = D (0 gates!)",
      "4) Motion Estimator Pixel Count (16×16 macroblock) = 16 × 16 = 256 pixels",
      "5) Max per-pixel |R - S| for 8-bit grayscale [0..255] = 255",
      "6) Worst-Case Total SAD = 256 × 255 = 65,280 (requires ceil(log2(65280)) = 16 bits!)",
      "7) Buggy 8-bit BestDist = 0xff (255) overflows! Fixed: 16'hFFFF (65,535)"
    ],
    tableTitle: "casex Wildcard Meanings & SAD Bit-Width Audit",
    table: {
      headers: ["Item / Signal", "8-Bit Buggy", "16-Bit Fixed", "Notes"],
      rows: [
        ["HW2 Q2 E(A,B,C,D)", "unoptimized", "E = D", "default: E=1'b0 prevents latch"],
        ["16×16 Max SAD", "clips @ 255", "65,280 max", "Fits 16'hFFFF (65,535)"],
        ["Init BestDist", "8'hff (255)", "16'hffff", "Every motion vector evaluated"]
      ]
    },
    highlightRow: 1,
    trapTitle: "★ THREE MEANINGS OF 'X' IN VERILOG & LATCH PREVENTION ★",
    trapBody: "1) Spec Don't-Care (1'bx); 2) casex Wildcard (4'b1xx1); 3) Simulator Unknown! Always include default: E = 1'b0 in combinational always @(*) blocks or synthesis infers an unintended memory latch!",
    babySteps: [
      "Draw 4x4 Gray-ordered K-Map (00, 01, 11, 10) and plot rows 1,3,7,9,11,13,15 as 1 and row 5 as X.",
      "Choose X = 1 so the entire middle-left D=1 block of 8 cells combines to E = D.",
      "Always write `default: E = 1'b0;` inside combinational `casex` to forbid latches.",
      "Calculate macroblock accumulator width: 16×16×255 = 65,280 -> 16-bit unsigned bus.",
      "Verify self-checking testbench loops all 16 input vectors and compares BestDist == golden."
    ],
    pseudo: [
      "// 1. COMB always @(*): casex ({A,B,C,D}) 4'b00x1,0111,1xx1: E=1; 4'b0101: E=1'bx; default: 0",
      "// 2. MOTION ESTIMATOR: BestDist = 16'hFFFF; FOR each macroblock:",
      "//    tempSAD = sum_i(|R[i] - S[i]|); IF (tempSAD < BestDist) BestDist = tempSAD;"
    ],
    codeLines: [
      "module hw2_truth_table (input A,B,C,D, output reg E); // Combinational block",
      "  always @(*) begin                                  // No clock = 0 flip-flops",
      "    casex ({A, B, C, D})                             // Match binary patterns",
      "      4'b00x1, 4'b0111, 4'b1xx1: E = 1'b1;           // All D=1 rows",
      "      4'b0101:                   E = 1'bx;           // Spec Don't-Care row 5",
      "      default:                   E = 1'b0;           // Fail-safe prevents latch",
      "    endcase",
      "  end",
      "endmodule // Self-check SAD: assert(BestDist == 16'd65280) on 0xFF vs 0x00!"
    ]
  },
  {
    file: "spread_04_tech60_units_ohm_watt_color_code.png",
    cat: "avionics",
    header: "TECH 60 Ch. 1–3 — Coulomb Charge, 10^(3n) Prefixes, SMD Color Code & Ohm/Watt Laws",
    question: "How many electrons are in 45 µC (and I if it flows in 15 ms)? Also decode SMD '472' across 12 V to find I (mA), P (mW), and safe resistor wattage.",
    answer: "N = 2.8125×10¹⁴ e⁻ · I = 3.0 mA · R = 4.7 kΩ · P = 30.64 mW (1/8 W Safe)",
    schKind: "generic",
    schMeta: {
      b1: "+12 V Rail", b1Sub: "Prefix: m=10^-3, k=10^3",
      b2: "SMD '472' = 4.7kΩ", b2Sub: "Yel-Viol-Red-Gold ±5%",
      b3: "Load & Heat", b3Sub: "2.55 mA · 30.64 mW",
      c1: "Blue: 1 A = 1 C/s = 6.25 × 10^18 electrons per second; divide by ms (*10^-3) -> *10^3!",
      c2: "Green: Size wattage >= 2 × worst-case power (2 × 30.64mW = 61.3mW < 125mW = 1/8W)",
      waveTitle: "Engineering Prefix Ladder (10^3n) & Safe Power Derating Curve",
      waveNote: "milli (10^-3) · micro (10^-6) · nano (10^-9) · kilo (10^3) · mega (10^6)"
    },
    intuition: "Prefixes scale numbers in steps of 1,000 (10³ⁿ). Voltage is energy per charge (V = W/Q); current is charge flow rate (I = Q/t); Watt's Law tracks heat dissipation (P = V·I = V²/R).",
    mathSteps: [
      "1) Charge Q = 45 µC = 45 × 10⁻⁶ C ;  t = 15 ms = 15 × 10⁻³ s",
      "2) Electrons N = Q × 6.25×10¹⁸ = 45×10⁻⁶ × 6.25×10¹⁸ = 2.8125 × 10¹⁴ e⁻",
      "3) Current I = Q / t = (45 × 10⁻⁶) / (15 × 10⁻³) = 3.0 × 10⁻³ A = 3.0 mA",
      "4) SMD '472': Digits 4, 7 + 2 zeros (10²) = 4,700 Ω = 4.7 kΩ ±5%",
      "5) Ohm's Law across 12 V: I = 12 V / 4,700 Ω = 0.002553 A = 2.553 mA",
      "6) Watt's Law Power: P = V²/R = 144 / 4,700 = 0.03064 W = 30.64 mW",
      "7) 2× Flight Derating: 2 × 30.64 mW = 61.3 mW -> Choose 1/8 W (125 mW)"
    ],
    tableTitle: "SI Base vs. Derived Units & Engineering Prefix Reference",
    table: {
      headers: ["Prefix / Symbol", "Power of 10", "Example Value", "SI Note"],
      rows: [
        ["pico (p) / nano (n)", "10⁻¹² / 10⁻⁹", "100 pF / 5 ns", "Timescales & small caps"],
        ["micro (µ) / milli (m)", "10⁻⁶ / 10⁻³", "45 µC / 15 ms", "Dividing by m gives ×10³"],
        ["kilo (k) / mega (M)", "10³ / 10⁶", "4.7 kΩ / 10 MΩ", "Ampere (A) is sole elec base"]
      ]
    },
    highlightRow: 1,
    trapTitle: "★ PREFIX TRAP: Dividing by 10⁻³ Flips Sign to × 10⁺³! ★",
    trapBody: "Never plug '15' for 15 ms or '4.7' for 4.7 kΩ directly into base Ohm's/Watt's formulas! V × mA = mW, mV × mA = µW, and never measure Ω on a powered live PCB!",
    babySteps: [
      "Convert every given to base SI: µ -> 10⁻⁶, m -> 10⁻³, k -> 10³ BEFORE dividing.",
      "Multiply Q × (6.25 × 10¹⁸ e⁻/C) to count electrons; divide Q / t for amperes.",
      "Decode 4-band/SMD 'ABC' resistor codes as (10·A + B) × 10^C ohms.",
      "Apply I = V/R and P = V²/R = I²R to verify power dissipation in mW.",
      "Always check power derating >= 2× (use 1/8 W for 30.6 mW; never a 1/16 W part)."
    ],
    pseudo: [
      "// 1. Convert charge & time: Q_SI = Q * 10^(-6), t_SI = t * 10^(-3) -> I = Q_SI / t_SI",
      "// 2. Decode resistor R = (10*d1 + d2) * 10^mult",
      "// 3. Compute I_mA = 1000 * (V / R); P_mW = 1000 * (V * V / R); assert P_rated >= 2*P"
    ],
    codeLines: [
      "def solve_ohm_watt(v_rail=12.0, smd_code='472'):",
      "    d1, d2, exp = int(smd_code[0]), int(smd_code[1]), int(smd_code[2])",
      "    r_ohm = (10 * d1 + d2) * (10 ** exp) # '472' -> 47 * 100 = 4700 Ohm",
      "    i_a = v_rail / r_ohm                 # 12 / 4700 = 0.002553 A",
      "    p_w = (v_rail ** 2) / r_ohm          # 144 / 4700 = 0.03064 W (30.64 mW)",
      "    safe_rating = max(p_w * 2.0, 0.125)  # 2x derating -> 1/8 W minimum",
      "    return {'R': r_ohm, 'I_mA': i_a*1e3, 'P_mW': p_w*1e3, 'W': safe_rating}"
    ]
  },
  {
    file: "spread_05_tech60_loaded_divider_wheatstone_thevenin.png",
    cat: "avionics",
    header: "TECH 60 Ch. 5–8 — Loaded Divider (10MΩ DMM Error), Wheatstone Bridge & Thevenin",
    question: "A 12V Wheatstone bridge has R1=R2=R3=10kΩ and thermistor RT=9.0kΩ. Find V_out and R_TH. Also find 10MΩ DMM loading on a 10V 1MΩ||1MΩ divider.",
    answer: "Bridge V_out = +0.3158 V · R_TH = 9.737 kΩ · Loaded DMM = 4.762 V (−4.76%)",
    schKind: "bridge_thevenin",
    intuition: "Connecting ANY load or 10 MΩ DMM across the bottom leg creates a parallel branch R_2 || R_load, lowering bottom resistance and sagging midpoint voltage!",
    mathSteps: [
      "1) Loaded Divider Unloaded: V_ideal = 10V × (1M / (1M+1M)) = 5.000 V",
      "2) 10 MΩ DMM in Parallel: R2_eq = (1M × 10M) / (1M + 10M) = 10/11 MΩ = 0.9091 MΩ",
      "3) Measured DMM Reading: V_DMM = 10V × (0.9091 / 1.9091) = 4.762 V (−0.238V error!)",
      "4) Bridge Reference Leg V_A = 12V × (10k / (10k + 10k)) = 6.000 V",
      "5) Bridge Sensor Leg V_B = 12V × (9.0k / (10k + 9.0k)) = 12 × (9/19) = 5.6842 V",
      "6) Differential Bridge Output: V_out = V_A − V_B = 6.000 − 5.6842 = +315.8 mV",
      "7) Zero 12V Source (Short) -> R_TH = (10k∥10k) + (10k∥9k) = 5.000 + 4.737 = 9.737 kΩ"
    ],
    tableTitle: "DMM Input Loading & Thevenin Equivalency Comparison",
    table: {
      headers: ["Circuit Case", "Ideal Open V", "Loaded / Bridge V", "Thevenin R_TH"],
      rows: [
        ["1MΩ Divider + 10MΩ DMM", "5.000 V", "4.762 V (−4.76%)", "500 kΩ"],
        ["1kΩ Divider + 10MΩ DMM", "5.000 V", "4.9998 V (−0.005%)", "500 Ω"],
        ["Wheatstone @ RT=9.0kΩ", "0 V (balanced)", "+0.3158 V (+315.8mV)", "9.737 kΩ"]
      ]
    },
    highlightRow: 2,
    trapTitle: "★ NEVER COMPUTE R_TH WITH POWER ON — AND CHECK DMM LOADING ON MΩ NODES! ★",
    trapBody: "To find R_TH mathematically, zero independent voltage sources (replace with shorts) and open current sources. On high-Z MΩ dividers, buffer with an op-amp follower before sampling!",
    babySteps: [
      "Split a Wheatstone bridge mentally into two independent parallel voltage dividers (VA, VB).",
      "Subtract VA − VB for differential sensor output without rounding early.",
      "To find R_TH: short DC voltage source V_S -> top and bottom rails become one common node.",
      "Reduce left arm (R1||R3) and right arm (R2||RT), then ADD them in series between A and B.",
      "Always include R_DMM = 10 MΩ in parallel when measuring MΩ high-impedance dividers."
    ],
    pseudo: [
      "// 1. VA = Vs * R3 / (R1 + R3); VB = Vs * RT / (R2 + RT); V_TH = VA - VB",
      "// 2. R_left = par(R1, R3); R_right = par(R2, RT); R_TH = R_left + R_right",
      "// 3. Loaded V_DMM = Vs * par(R2, 10e6) / (R1 + par(R2, 10e6))"
    ],
    codeLines: [
      "def bridge_and_loading(vs=12.0, r=10e3, rt=9e3, r_dmm=10e6):",
      "    par = lambda a, b: (a * b) / (a + b)",
      "    v_a = vs * r / (r + r)               # 12 * 0.5 = 6.000 V",
      "    v_b = vs * rt / (r + rt)             # 12 * 9k/19k = 5.6842 V",
      "    r_th = par(r, r) + par(r, rt)        # 5000 + 4736.84 = 9736.84 Ohm",
      "    v_1m_loaded = 10.0 * par(1e6, r_dmm) / (1e6 + par(1e6, r_dmm)) # 4.762V",
      "    return {'V_TH': v_a - v_b, 'R_TH': r_th, 'V_loaded_1M': v_1m_loaded}"
    ]
  },
  {
    file: "spread_06_tech60_cramer_mesh_superposition_ac_rms.png",
    cat: "avionics",
    header: "TECH 60 Ch. 8–13 — Cramer's 2×2 Mesh, Max Power Transfer, AC RMS & Capacitive X_C",
    question: "Solve 300·I1−100·I2=6, −100·I1+400·I2=0 by Cramer's Rule. Find P_max when V_TH=8V, R_TH=200Ω; V_rms & T for 14.14Vpp 2kHz sine; and X_C of 0.1µF @ 10kHz.",
    answer: "Mesh I1 = 21.82 mA · P_max = 80 mW (RL=200Ω) · Vrms = 5.00V · X_C = 159.15Ω",
    schKind: "generic",
    schMeta: {
      b1: "Mesh / Thevenin", b1Sub: "Δ=110k · R_L = R_TH",
      b2: "Matched Load", b2Sub: "P_max = V_TH^2 / 4R_TH",
      b3: "AC & Reactance", b3Sub: "Vrms=0.707Vp · Xc=1/2πfC",
      c1: "Blue: Cramer Determinant Δ = a·d − b·c avoids substitution algebra mistakes",
      c2: "Green: At Maximum Power Transfer (RL = R_TH), efficiency is 50%; only for sensors/RF!",
      waveTitle: "AC Sine Wave: Peak Vp, Peak-to-Peak Vpp=2Vp, RMS=0.707Vp, T=1/f",
      waveNote: "For V_pp = 14.14 V -> V_p = 7.07 V -> V_rms = 5.00 Vrms; Period T = 1/2kHz = 500 µs"
    },
    intuition: "Mesh determinants solve coupled loops mechanically. Max Power Transfer occurs when load equals source (RL = R_TH). AC RMS is the DC heating equivalent of a sine wave!",
    mathSteps: [
      "1) System Determinant Δ = (300)(400) − (−100)(−100) = 120,000 − 10,000 = 110,000",
      "2) Replace Col 1 with [6; 0]: Δ1 = (6)(400) − (−100)(0) = 2,400",
      "3) Mesh Loop Current I1 = Δ1 / Δ = 2,400 / 110,000 = 0.02182 A = 21.82 mA",
      "4) Max Power Transfer (choose R_L = R_TH = 200 Ω): P_max = V_TH² / (4·R_TH)",
      "5) Substitute: P_max = 8.0² / (4 × 200) = 64 / 800 = 0.080 W = 80 mW",
      "6) AC Sine: V_p = 14.14/2 = 7.07V -> V_rms = 0.7071×7.07 = 5.00 V; T = 1/2kHz = 500 µs",
      "7) Capacitive Reactance: X_C = 1 / (2π × 10⁴ × 0.1×10⁻⁶) = 159.15 Ω"
    ],
    tableTitle: "AC Sine Wave & Network Theorem Summary Table",
    table: {
      headers: ["Quantity", "Formula", "Computed Value", "Trap Check"],
      rows: [
        ["Mesh I1 (Cramer)", "Δ1 / Δ", "21.82 mA", "Keep (−100)×(−100) sign!"],
        ["Max Power P_max", "V_TH² / (4·R_TH)", "80 mW @ 200 Ω", "Eff is 50%, not 100%"],
        ["AC V_rms & X_C", "0.707·Vp; 1/(2πfC)", "5.00 V; 159.15 Ω", "Scope shows Vpp, DMM Vrms"]
      ]
    },
    highlightRow: 2,
    trapTitle: "★ SUPERPOSITION & RMS TRAPS TO AVOID! ★",
    trapBody: "NEVER add individual source powers P1 + P2 in Superposition—power is nonlinear (I²R)! Sum currents/voltages linearly first, THEN square for P. Also remember V_rms ≠ V_p!",
    babySteps: [
      "Write KVL mesh equations systematically in standard form R11·I1 − R12·I2 = V1.",
      "Compute determinant Δ = a·d − b·c carefully watching minus signs on off-diagonal terms.",
      "For Maximum Power Transfer, match R_L = R_TH and evaluate P = V_TH²/(4·R_TH).",
      "On AC waveforms, convert V_pp -> divide by 2 for V_p -> multiply by 0.7071 for V_rms.",
      "Invert f (Hz) for period T (s) and check X_C decreases as frequency increases."
    ],
    pseudo: [
      "// 1. det = a*d - b*c; det1 = rhs1*d - b*rhs2; I1 = det1 / det",
      "// 2. P_max = (V_th ** 2) / (4 * R_th) when R_load == R_th",
      "// 3. V_rms = 0.7071 * (V_pp / 2); X_c = 1 / (2 * pi * f * C)"
    ],
    codeLines: [
      "import math",
      "def mesh_maxpwr_ac(vth=8.0, rth=200.0, vpp=14.14, f_xc=10e3, c=0.1e-6):",
      "    det, det1 = 300*400 - (-100)*(-100), 6*400 - (-100)*0",
      "    i1_ma = (det1 / det) * 1e3           # 2400/110000 A = 21.82 mA",
      "    pmax_mw = (vth**2 / (4.0 * rth)) * 1e3 # 64/800 W = 80.0 mW",
      "    v_rms = 0.70710678 * (vpp / 2.0)     # 5.00 Vrms",
      "    xc = 1.0 / (2 * math.pi * f_xc * c)  # 159.15 Ohm",
      "    return {'I1_mA': i1_ma, 'Pmax_mW': pmax_mw, 'Vrms': v_rms, 'Xc': xc}"
    ]
  },
  {
    file: "spread_07_electronic_devices_bridge_rectifier_ripple.png",
    cat: "devices",
    header: "ELECTRONIC DEVICES Ch. 1–2 — Full-Wave Si Bridge Rectifier & Capacitor Filter Ripple",
    question: "A 12 V_rms 60 Hz transformer secondary drives a 4-diode Si bridge rectifier (VF = 0.7 V each) with C = 1000 µF and RL = 1.0 kΩ. Find Vp(out), Vr(pp), VDC, and PIV.",
    answer: "Vp(out) = 15.57 V · Vr(pp) = 129.8 mVpp (120 Hz) · PIV >= 16.27 V",
    schKind: "rectifier",
    intuition: "Pure Si has 4 valence electrons; doping makes a PN junction with a 0.7V barrier. In a bridge, TWO diodes conduct in series each half-cycle and frequency DOUBLES to 120 Hz!",
    mathSteps: [
      "1) Secondary Peak: Vp(sec) = √2 × V_rms = 1.4142 × 12 V = 16.97 V",
      "2) Two Series Silicon Diodes Conduct per Cycle: subtract 2 × 0.7V = 1.40 V",
      "3) Rectified Output Peak: Vp(out) = 16.97 V − 1.40 V = 15.57 V",
      "4) Full-Wave Ripple Frequency DOUBLES: f_r = 2 × f_in = 2 × 60 Hz = 120 Hz",
      "5) Time Constant Base SI: RL = 1.0×10³ Ω, C = 1000×10⁻⁶ F -> RL·C = 1.0 s",
      "6) Ripple Voltage: Vr(pp) = Vp(out) / (f_r · RL · C) = 15.57 / (120 × 1.0) = 129.8 mVpp",
      "7) Avg DC Output & PIV: VDC ≈ 15.57 − 0.130/2 = 15.505 V; PIV = 15.57+0.7 = 16.27 V"
    ],
    tableTitle: "Half-Wave vs. Full-Wave Center-Tapped vs. Full-Wave Bridge",
    table: {
      headers: ["Rectifier Type", "Diodes Dropped", "Ripple Freq", "Diode PIV"],
      rows: [
        ["Half-Wave (1 diode)", "1 × 0.7 V", "f_in (60 Hz)", "Vp(in)"],
        ["Center-Tap (2 diodes)", "1 × 0.7 V", "2·f_in (120 Hz)", "2·Vp(out) + 0.7V"],
        ["Full Bridge (4 diodes)", "2 × 0.7 V (1.4V)", "2·f_in (120 Hz)", "Vp(out) + 0.7V"]
      ]
    },
    highlightRow: 2,
    trapTitle: "★ TWO DIODES CONDUCT EACH HALF-CYCLE IN A BRIDGE (1.4 V, NOT 0.7 V)! ★",
    trapBody: "Never forget BOTH RMS-to-Peak (×1.414) AND subtracting 1.4 V across two Silicon diodes! Also use f_r = 120 Hz (not 60 Hz) in the ripple denominator Vr = Vp / (f_r·RL·C).",
    babySteps: [
      "Convert AC transformer RMS secondary rating to Peak amplitude (Vp = √2 × Vrms).",
      "Count series conducting Silicon diodes in loop (Bridge = 2 -> subtract 1.4 V).",
      "Double input frequency for full-wave ripple rate (60 Hz -> 120 Hz).",
      "Evaluate Vr(pp) = Vp(out) / (f_r · RL · C) keeping C in farads and RL in ohms.",
      "Verify reverse-biased diode PIV rating (select >= 2× safety margin, e.g. 50V 1N4001)."
    ],
    pseudo: [
      "// 1. Vp_sec = sqrt(2) * Vrms_sec",
      "// 2. Vp_out = Vp_sec - 2 * 0.7    // Bridge drops two 0.7V Si junctions",
      "// 3. f_r = 2 * f_in; Vr_pp = Vp_out / (f_r * R_L * C); Vdc = Vp_out - Vr_pp/2"
    ],
    codeLines: [
      "import math",
      "def bridge_rectifier(v_rms=12.0, f_in=60.0, r_load=1000.0, c_f=1000e-6):",
      "    vp_sec = math.sqrt(2.0) * v_rms      # 1.4142 * 12 = 16.97 V",
      "    vp_out = vp_sec - 1.4                # Two Si diodes: 16.97 - 1.4 = 15.57 V",
      "    f_r = 2.0 * f_in                     # Full-wave doubles freq -> 120 Hz",
      "    vr_pp = vp_out / (f_r * r_load * c_f)# 15.57 / 120 = 0.12975 V = 129.8 mVpp",
      "    v_dc = vp_out - 0.5 * vr_pp          # Average DC = 15.505 V",
      "    return {'Vp_out': vp_out, 'Vr_mVpp': vr_pp*1e3, 'VDC': v_dc, 'PIV': vp_out+0.7}"
    ]
  },
  {
    file: "spread_08_electronic_devices_zener_lm317_bjt_saturation.png",
    cat: "devices",
    header: "ELECTRONIC DEVICES Ch. 3–5 — 5.1V Zener Regulator, LM317 & NPN BJT Saturation",
    question: "A) 12V -> 100Ω -> 5.1V Zener ∥ 510Ω load: find I_Z (mA). B) LM317 with R1=240Ω, R2=1.2kΩ: find V_out. C) NPN (β=100, VCC=10V, RC=1kΩ, RB=10kΩ, VBB=5V): Active or Saturated?",
    answer: "Zener I_Z = 59.0 mA · LM317 V_out = 7.50 V · BJT is SATURATED (IC_sat = 9.8 mA)",
    schKind: "zener_bjt",
    intuition: "Zener regulates by absorbing leftover shunt current above VZ. An NPN BJT multiplies IB by β only UNTIL collector current hits the hard rail ceiling IC(sat) = (VCC−VCE(sat))/RC!",
    mathSteps: [
      "1) Zener Series Drop across RS=100Ω: V_RS = 12.0V − 5.1V = 6.9 V",
      "2) Total Current I_T = 6.9V / 100Ω = 0.069 A = 69.0 mA",
      "3) Load Current I_L = V_Z / R_L = 5.1V / 510Ω = 0.010 A = 10.0 mA",
      "4) Zener Current by KCL: I_Z = I_T − I_L = 69.0 − 10.0 = 59.0 mA (P_Z = 301 mW)",
      "5) LM317 Regulator: V_out = 1.25 × (1 + R2/R1) = 1.25 × (1 + 1200/240) = 7.50 V",
      "6) BJT Base Drive I_B = (VBB − 0.7V) / RB = (5.0 − 0.7) / 10kΩ = 0.43 mA",
      "7) Saturation Proof: β·IB = 43 mA >> IC(sat) = (10−0.2)/1k = 9.8 mA -> SATURATED!"
    ],
    tableTitle: "Three Regions of NPN BJT Operation & Regulator Checks",
    table: {
      headers: ["Device / Region", "Condition", "Key Equation", "Calculated Check"],
      rows: [
        ["Zener Breakdown", "Vin > VZ (5.1V)", "IZ = (Vin−VZ)/RS − VZ/RL", "59.0 mA (PZ=0.30W)"],
        ["LM317 Linear", "V_ref = 1.25 V", "Vout = 1.25·(1 + R2/R1)", "7.50 V (2.25W heat!)"],
        ["BJT Cutoff / Sat", "IB<=0 / β·IB>=ICsat", "IC(sat) = (VCC−0.2)/RC", "43mA > 9.8mA => SAT"]
      ]
    },
    highlightRow: 2,
    trapTitle: "★ NEVER TRUST I_C = β·I_B BLINDLY WITHOUT CHECKING I_C(sat) CEILING! ★",
    trapBody: "Students multiply 100 × 0.43mA = 43 mA and stop! Because 43 mA through 1 kΩ would drop 43 V (> 10 V supply!), physically impossible—the collector hits 0.2 V Saturation!",
    babySteps: [
      "Solve Zener loop with KVL across R_series first -> I_T = (Vin − VZ)/RS.",
      "Compute load current I_L = VZ/RL -> apply KCL at parallel node: I_Z = I_T − I_L.",
      "Always verify Zener power P_Z = VZ × I_Z stays safely below datasheet PD(max).",
      "For BJT, solve base loop first: I_B = (VBB − 0.7V) / RB.",
      "Compare β·I_B against collector saturation limit I_C(sat) = (VCC − 0.2V) / RC."
    ],
    pseudo: [
      "// 1. I_Z = (Vin - Vz)/Rs - Vz/Rl ; check Vz*I_Z <= P_max",
      "// 2. V_out_lm317 = 1.25 * (1 + R2/R1)",
      "// 3. I_B = max(0, (Vbb - 0.7)/Rb); I_C = min(beta*I_B, (Vcc - 0.2)/Rc)"
    ],
    codeLines: [
      "def devices_zener_lm_bjt(vin=12.0, vz=5.1, rs=100.0, rl=510.0):",
      "    i_t = (vin - vz) / rs                # 6.9V / 100 = 0.069 A = 69 mA",
      "    i_l = vz / rl                        # 5.1V / 510 = 0.010 A = 10 mA",
      "    i_z = i_t - i_l                      # 59.0 mA (Zener shunt current)",
      "    v_lm317 = 1.25 * (1.0 + 1200.0/240.0)# 7.50 V",
      "    ib = (5.0 - 0.7) / 10e3              # 0.43 mA base current",
      "    ic_active, ic_sat = 100.0 * ib, (10.0 - 0.2) / 1e3 # 43mA vs 9.8mA",
      "    return {'Iz_mA': i_z*1e3, 'LM317': v_lm317, 'Sat': ic_active > ic_sat}"
    ]
  },
  {
    file: "spread_09_tech63_pulse_ieee754_demorgan_gray_adder.png",
    cat: "tech63",
    header: "TECH 63 Ch. 1–6 — Pulse Duty Cycle, IEEE 754 Float, DeMorgan, Gray Code & Full Adder",
    question: "A) T=20µs, tW=5µs -> Duty %. B) IEEE 754: 0 10000010 10010... -> Float. C) DeMorgan NOT(NOT(AB)·C). D) 1011₂ -> Gray. E) Add 1011₂ + 0111₂.",
    answer: "Duty = 25% · Float = +12.50 · DeMorgan = AB + C̄ · Gray = 1110₂ · Sum = 10010₂",
    schKind: "generic",
    schMeta: {
      b1: "Pulse & IEEE 754", b1Sub: "tW/T=25% · (-1)^S·1.F·2^(E-127)",
      b2: "DeMorgan & K-Map", b2Sub: "Break bar, flip op -> AB+C̄",
      b3: "Gray & Full Adder", b3Sub: "1011->1110 · Σ=A⊕B⊕Cin",
      c1: "Blue: IEEE 754 Exp 10000010₂=130 -> 130−127=+3; Mantissa 1.1001₂=1.5625×8=+12.5",
      c2: "Green: Gray MSB stays same (G3=B3), then G_k = B_(k+1) XOR B_k (1-bit transitions)",
      waveTitle: "Non-Ideal Digital Pulse Timing: 10–90% Rise/Fall, 50% Pulse Width t_W & T",
      waveNote: "Duty Cycle = (tW / T) × 100% = (5 µs / 20 µs) × 100% = 25%"
    },
    intuition: "DeMorgan splits inversion bars while swapping AND↔OR. IEEE 754 stores sign-magnitude mantissa with bias-127 exponent. Gray code guarantees only 1 bit changes per step!",
    mathSteps: [
      "1) Duty Cycle = (t_W / T) × 100% = (5.0 µs / 20.0 µs) × 100% = 25%",
      "2) IEEE 754 S=0 (+), E = 10000010₂ = 130 -> Exp = 130 − 127 = +3",
      "3) IEEE 754 Mantissa 1.1001₂ = 1 + 0.5 + 0.0625 = 1.5625 => +1.5625 × 2³ = +12.50",
      "4) DeMorgan: NOT(NOT(AB) · C) = NOT(NOT(AB)) + NOT(C) = A·B + C̄",
      "5) Binary 1011₂ -> Gray: G3=1, G2=1⊕0=1, G1=0⊕1=1, G0=1⊕1=0 => 1110₂ (14)",
      "6) 4-Bit Ripple Adder: 1011₂ (11) + 0111₂ (7) => Cout=1, Sum=0010₂ (2; total 18)"
    ],
    tableTitle: "TTL vs. CMOS Levels & Combinational Blocks Reference",
    table: {
      headers: ["Standard / Block", "LOW / Input", "HIGH / Output", "Key Equation"],
      rows: [
        ["5V TTL / 3.3V CMOS", "0–0.8 V / 0–0.8 V", "2.0–5V / 2.0–3.3V", "Noise Margin = VOH − VIH"],
        ["Full Adder (1-bit)", "A, B, C_in", "Σ, C_out", "Σ=A⊕B⊕Cin, Cout=AB+Cin(A⊕B)"],
        ["2's Comp / Add-Subt", "Mode M=1 subs", "B ⊕ M, C_0 = M", "Flip bits + add 1 via Cin"]
      ]
    },
    highlightRow: 1,
    trapTitle: "★ IEEE 754 IMPLICIT LEADING '1' & K-MAP WRAP-AROUND TRAPS! ★",
    trapBody: "Never forget the hidden '1.' in normalized IEEE 754 mantissa (1.F, not 0.F!), never apply DeMorgan without flipping · ↔ +, and never leave CMOS inputs floating!",
    babySteps: [
      "Measure pulse rise/fall (10%–90%) and pulse width t_W (50%–50%) -> D = tW/T.",
      "Partition 32-bit IEEE 754 as 1 sign | 8 exponent (subtract 127!) | 23 mantissa (add 1.).",
      "Apply DeMorgan cleanly outer-bar-first: split the bar AND flip AND↔OR.",
      "Convert Binary to Gray by keeping MSB and XORing adjacent bits left-to-right.",
      "Verify 4-bit addition bit-by-bit tracking C1, C2, C3, C4 carries."
    ],
    pseudo: [
      "// 1. decode_fp32: s = bit31; e = bits[30:23] - 127; f = 1.0 + sum(bit_k * 2^-k)",
      "// 2. bin_to_gray(b): return b ^ (b >> 1)",
      "// 3. full_adder(a,b,cin): sum = a^b^cin; cout = (a&b) | (cin&(a^b))"
    ],
    codeLines: [
      "def tech63_toolkit(tw_us=5.0, period_us=20.0, bin_val=0b1011):",
      "    duty_pct = (tw_us / period_us) * 100.0 # 25.0%",
      "    gray = bin_val ^ (bin_val >> 1)        # 1011 ^ 0101 = 1110 (14)",
      "    exp_val = 0b10000010 - 127             # 130 - 127 = +3",
      "    mant = 1.0 + 0.5 + 0.0625              # 1.1001_2 = 1.5625",
      "    fp_val = mant * (2.0 ** exp_val)       # +12.50",
      "    return {'duty': duty_pct, 'gray': bin(gray), 'fp32': fp_val, 'add': 11+7}"
    ]
  },
  {
    file: "spread_10_physics2b_rc_dvm_loading_and_tvac.png",
    cat: "physics2b",
    header: "PHYSICS 2B Lab 8 & MUON TVAC — RC Decay With 10MΩ DVM Loading & Vacuum Heat",
    question: "Physics 2B Lab 8: A 2.2 µF cap discharges through R = 4.7 MΩ with a 10 MΩ DVM across it. Find real τ (s). Also why do ambient PASS satellites fail in TVAC?",
    answer: "Actual Loaded τ = 7.034 s (vs. 10.34 s unloaded) · TVAC h = 0 (No Convection!)",
    schKind: "generic",
    schMeta: {
      b1: "2.2 µF Capacitor", b1Sub: "V(t) = V0·e^(−t/τ)",
      b2: "R=4.7MΩ ∥ DVM 10MΩ", b2Sub: "R_eq = 3.197 MΩ (Loaded!)",
      b3: "TVAC Chamber", b3Sub: "Convection h = 0 W/m²K",
      c1: "Blue: 10 MΩ DVM shunts R=4.7MΩ, creating parallel discharge path (speeds up decay!)",
      c2: "Green: At <10⁻⁵ Torr vacuum, zero air convection -> loose TIM torque causes runaway!",
      waveTitle: "Exponential RC Decay V(t) = V0·e^(−t/τ) Showing 36.8% @ 1τ and 10MΩ DVM Shift",
      waveNote: "Without 10MΩ DVM: τ=10.34 s; With 10MΩ DVM connected: τ = 3.1973 MΩ × 2.2 µF = 7.034 s!"
    },
    intuition: "Instruments aren't invisible! A 10 MΩ voltmeter creates a second bleed resistor across high-MΩ RC timers. Similarly, pumping a vacuum chamber removes air convection completely!",
    mathSteps: [
      "1) Identify Parallel Nodes across C: R = 4.7 MΩ is in parallel with R_DVM = 10.0 MΩ",
      "2) Compute Parallel R_eq: R_eq = (4.7M × 10M) / (4.7M + 10M) = 47 / 14.7 MΩ",
      "3) Loaded Equivalent Resistance: R_eq = 3.1973 MΩ = 3.1973 × 10⁶ Ω",
      "4) Convert Capacitance: C = 2.2 µF = 2.2 × 10⁻⁶ F (notice 10⁶ × 10⁻⁶ cancels!)",
      "5) Loaded Time Constant: τ = R_eq × C = 3.1973 × 2.2 = 7.034 seconds",
      "6) Unloaded Error Check: 4.7 MΩ × 2.2 µF = 10.34 s (32% error if DMM ignored!)",
      "7) TVAC Heat Transfer: Q_conv = 0; only bolted conduction + ε·σ·A·(T1⁴−T2⁴) radiation!"
    ],
    tableTitle: "Muon Space V&V, TVAC Thermal Physics & Paschen Corona Risk",
    table: {
      headers: ["Environment / Term", "Physical Mechanism", "Failure Signature", "Mitigation / Check"],
      rows: [
        ["DVM 10 MΩ in Lab 8", "Parallel load path", "τ drops 10.34s -> 7.034s", "Include R_DMM in Thevenin R_eq"],
        ["Vacuum (<10⁻⁵ Torr)", "No air convection (h=0)", "Hotspots / thermal runaway", "Verify TIM + fastener torque"],
        ["Pump-down (~1 Torr)", "Paschen corona min", "HV arcing / multipaction", "Conformal coat + step ramp @ vac"]
      ]
    },
    highlightRow: 0,
    trapTitle: "★ NEVER CONFUSE VERIFICATION VS. VALIDATION OR IGNORE METER LOADING! ★",
    trapBody: "Verification = 'Built system right' (meets ICD & spec limits via DMM/scope). Validation = 'Built right system' (mission survival in FlatSat/HIL/TVAC). Always model R_DMM = 10MΩ on MΩ nodes!",
    babySteps: [
      "Inspect physical circuit connections: voltmeter probes span the same two nodes as C.",
      "Combine R_bleed and R_DVM in parallel FIRST before computing RC time constant τ.",
      "Notice units shortcut: MΩ (10⁶) × µF (10⁻⁶) cancels to exact seconds!",
      "At 1τ charging hits 63.2%; discharging falls to 36.8%; 5τ reaches 99.3% settled.",
      "In TVAC testing, replace airflow assumptions with conductive cold-plate & T⁴ radiation math."
    ],
    pseudo: [
      "// 1. R_eq = (R_circuit * 10e6) / (R_circuit + 10e6)  // Model 10M DVM input",
      "// 2. tau_sec = R_eq * C_farads                     // MOhm * uF = seconds",
      "// 3. TVAC check: Q_total = k*A*dT/dx + eps*sigma*A*(T1^4 - T2^4) (convection=0)"
    ],
    codeLines: [
      "def lab8_rc_with_dvm(r_mohm=4.7, c_uf=2.2, r_dmm_mohm=10.0):",
      "    r_eq_mohm = (r_mohm * r_dmm_mohm) / (r_mohm + r_dmm_mohm) # 3.1973 MOhm",
      "    tau_loaded = r_eq_mohm * c_uf        # 10^6 * 10^-6 = 1 -> 7.034 s",
      "    tau_ideal = r_mohm * c_uf            # Unloaded theory = 10.34 s",
      "    pct_faster = 100.0 * (tau_ideal - tau_loaded) / tau_ideal # 32.0% faster",
      "    return {'R_eq_M': r_eq_mohm, 'tau_s': tau_loaded, 'pct_shift': pct_faster}"
    ]
  },
  {
    file: "spread_11_nvidia_slt_pdn_dram_keysight_scope.png",
    cat: "nvidia",
    header: "NVIDIA SLT MASTER — PDN L·di/dt Droop, DDR4-3200 Timing & CPU2 4-Ch Keysight Scope",
    question: "ΔI=40A in 20ns on L=0.25nH, R_PDN=2mΩ, C=100µF: find IR, L·di/dt, I_C. Also find DDR4-3200 GB/s & tRC (tRAS=32ns, tRP=13.75ns) and explain CPU2 4-ch Scope + DRAM log bug.",
    answer: "ΔV_IR = 80mV · ΔV_L = 500mV · I_C = 200A · DDR4 = 25.6 GB/s · tRC = 45.75 ns",
    schKind: "scope4ch",
    intuition: "Fast AI GPU load steps cause HUGE L·di/dt voltage spikes before remote VRMs can react—only low-inductance on-die caps respond in nanoseconds! Always verify raw DRAM logs vs summary scripts.",
    mathSteps: [
      "1) Resistive IR Droop: ΔV_IR = ΔI × R_PDN = 40 A × 0.002 Ω = 0.080 V = 80 mV",
      "2) Inductive Step Rate: di/dt = 40 A / (20 × 10⁻⁹ s) = 2.0 × 10⁹ A/s",
      "3) Inductive Spike: ΔV_L = L × di/dt = (0.25×10⁻⁹) × (2.0×10⁹) = 500 mV!",
      "4) Decoupling Cap Current (if ΔV=40mV in 20ns): IC = 100µF × (0.04/20ns) = 200 A",
      "5) DDR4-3200 (1600 MHz × 2 edges = 3200 MT/s × 64-bit): BW = 3.2G × 8B = 25.6 GB/s",
      "6) Minimum Row Cycle: t_RC = t_RAS + t_RP = 32.00 + 13.75 = 45.75 ns",
      "7) Parallel Termination: 20 Ω ∥ 60 Ω = (20 × 60)/(20 + 60) = 1,200 / 80 = 15.0 Ω"
    ],
    tableTitle: "CPU2 Keysight 4-Ch Scope & Post-Silicon Case Matrix",
    table: {
      headers: ["Case Study", "Probe / Channel", "Measurement Method", "Key Trap Avoided"],
      rows: [
        ["Google CPU2", "Ch1 CLK (SMA-BNC)", "Check divided ratio", "No assuming internal PLL"],
        ["CPU2 Rails/I", "Ch2/4 N7020A, Ch3 1169B", "Deskew before V·I", "No grounded clip on shunt"],
        ["DRAM Summary Bug", "Raw UART / EDAC / dmesg", "Inject fault -> grep", "Summary PASS ≠ clean logs"]
      ]
    },
    highlightRow: 2,
    trapTitle: "★ NEVER TRUST A SCRIPT SUMMARY 'PASS' OVER RAW KERNEL / EDAC LOGS! ★",
    trapBody: "Production DRAM debug insight: summary script reported PASS while raw bit-flips occurred because a parser bug missed the token! Always inspect raw UART/dmesg BEFORE rebooting and inject negative unit tests.",
    babySteps: [
      "Compute steady ΔV_IR separately from transient ΔV_L = L·(di/dt) when analyzing load droop.",
      "Double DRAM core clock for MT/s transfer rate, multiply by bus width/8 bits for GB/s.",
      "Map CPU2 4-channel scope: Ch1 Exported CLK (SMA-BNC), Ch2 Logic N7020A, Ch3 1169B I_sense, Ch4 M-Rail N7020A.",
      "Deskew Ch3 current probe delay vs Ch2 voltage probe BEFORE multiplying instantaneous power.",
      "Cross-check raw DRAM logs against station summary scripts; classify bad parser as INVALID!"
    ],
    pseudo: [
      "// 1. dV_pdn = I*R_pdn + L*(dI/dt) ; bw_GBps = MTs * width_bits / 8 / 1000",
      "// 2. Inspect raw dmesg/EDAC before reboot; inject fake ECC error into parser to validate",
      "// 3. Intel/Cisco bringup: power-off short check -> VR -> clk/rst -> single-var A-B-A swap"
    ],
    codeLines: [
      "def nvidia_pdn_dram_math(dI=40.0, dt_ns=20.0, l_nh=0.25, r_mohm=2.0):",
      "    dv_ir_mv = dI * r_mohm               # 40A * 2mOhm = 80 mV",
      "    didt = dI / (dt_ns * 1e-9)           # 2.0e9 A/s",
      "    dv_l_mv = (l_nh * 1e-9) * didt * 1e3 # 500 mV inductive droop spike",
      "    bw_gbps = (3200.0 * 64 / 8) / 1000.0 # DDR4-3200 = 25.6 GB/s",
      "    t_rc_ns = 32.0 + 13.75               # tRAS + tRP = 45.75 ns",
      "    return {'dV_IR': dv_ir_mv, 'dV_L': dv_l_mv, 'BW_GBs': bw_gbps, 'tRC': t_rc_ns}"
    ]
  },
  {
    file: "spread_12_nvidia_slt_python_nan_fpy_and_15step_hld.png",
    cat: "nvidia",
    header: "NVIDIA SLT MASTER — Fail-Closed Python NaN/Subprocess/FPY, Linux CLI & 15-Step HLD",
    question: "How do you prevent Python False-Clean 'PASS' on float('nan')/timeouts, compute true FPY vs Retest Yield, interpret grep exit codes 0/1/2, and run 15-step HLD on Xid 79?",
    answer: "Use math.isfinite() + Three-State PASS/FAIL/INVALID + Preserve First Attempt for FPY!",
    schKind: "generic",
    schMeta: {
      b1: "Raw Instrument / CLI", b1Sub: "'3.28', 'nan', timeout, exit 2",
      b2: "math.isfinite() & Guards", b2Sub: "Never default to 0 or PASS",
      b3: "PASS / FAIL / INVALID", b3Sub: "First-Attempt FPY Preserved",
      c1: "Blue: float('nan') parses with no ValueError—comparisons return False and fool naive scripts!",
      c2: "Green: Keep first_seen[sn] untouched so retry-until-pass cannot hide intermittent hardware!",
      waveTitle: "15-Step HLD & A-B-A Fault Isolation Funnel (Preserve -> Isolate -> Classify -> Handoff)",
      waveNote: "Freeze DUT -> Save dmesg/lspci -> Check PSU/Thermal/Socket Pins -> Single-Var A-B-A Swap"
    },
    intuition: "In hardware automation, missing/corrupt telemetry (NaN, timeout, grep exit 2, Xid 79) must ALWAYS resolve to INVALID or blocked investigation—NEVER let an error slip through as PASS!",
    mathSteps: [
      "1) Parse Float Safely: try: v = float(raw.strip()) except ValueError: return INVALID",
      "2) Trap NaN / +/-Inf: if not math.isfinite(v): return 'INVALID' (CRITICAL!)",
      "3) Linux grep -RniE 'error|fail|timeout' logs/: Exit 0=Match, 1=No Match, 2=File Error!",
      "4) Never equate grep exit 1 ('no match') or lspci exit 0 ('ran ok') with GPU PASS!",
      "5) FPY Formula: FPY = (# PASS on Attempt #1 ONLY) / Total_Valid_Units × 100%",
      "6) Rolled Throughput Yield (2 stages @ 92%, 95%): RTY = 0.92 × 0.95 = 87.4%",
      "7) Xid 79 ('Fallen off bus'): Symptom only -> check PSU droop, thermal, PCIe slot A-B-A"
    ],
    tableTitle: "10 Linux Triage Commands & 8 BGA Socket Checks Reference",
    table: {
      headers: ["Domain", "Command / Check", "What It Reveals", "False Trap"],
      rows: [
        ["Linux Triage", "dmesg -T; lspci -vvv", "LnkCap vs LnkSta, Xid, AER", "Reboot erases dmesg!"],
        ["Socket Pins", "Microscope + Torque", "Bent pogo pin, FOD, planarity", "Reseating ≠ Root Cause"],
        ["Subprocess / SCPI", "timeout=10, SYST:ERR?", "Station hang vs DUT defect", "Timeout ≠ DUT PASS/FAIL"]
      ]
    },
    highlightRow: 0,
    trapTitle: "★ NEVER SILENTLY RETRY-UNTIL-PASS & NEVER FABRICATE EXPERIENCE! ★",
    trapBody: "Retrying a failing unit 3× and calling it PASS inflates yield while escaping marginal parts! Preserve attempt #1 for FPY, flag INVALID separately, and in interviews distinguish transferable skills honestly.",
    babySteps: [
      "Wrap float conversions in try/except + mandatory math.isfinite() BEFORE threshold check.",
      "Capture subprocess timeout, stdout, stderr, returncode; classify non-zero rc as INVALID.",
      "Audit CSV test logs keeping first_seen[sn] for true FPY vs latest[sn] for retest monitoring.",
      "Inspect Linux kernel/driver/PCIe state BEFORE power-cycling failing silicon.",
      "Follow 15-Step HLD: Freeze -> Logs -> Power/Thermal/Socket -> Single-Var A-B-A -> Handoff."
    ],
    pseudo: [
      "// 1. val = float(raw); IF not math.isfinite(val): RETURN 'INVALID'",
      "// 2. RUN cmd with timeout=10s; IF rc != 0 or Timeout: RETURN {'status': 'INVALID'}",
      "// 3. FPY = sum(1st_attempt == 'PASS') / valid_SNs; quarantine INVALID runs!"
    ],
    codeLines: [
      "import math, subprocess",
      "def classify_rail(raw, lo=3.10, hi=3.50):       # 3-State FAIL-CLOSED Classifier",
      "    try: val = float(str(raw).strip())",
      "    except (ValueError, TypeError): return 'INVALID' # Malformed / None / blank",
      "    if not math.isfinite(val): return 'INVALID' # Blocks NaN / +Inf / -Inf!",
      "    return 'PASS' if lo <= val <= hi else 'FAIL'",
      "def fpy_audit(runs):                          # Never let retests inflate FPY",
      "    first = {}                                  # Records Attempt #1 only per SN",
      "    [first.setdefault(r['sn'], r['status']) for r in runs if r['status']!='INVALID']",
      "    return round(100.0 * sum(v=='PASS' for v in first.values()) / max(1,len(first)), 2)"
    ]
  }
];

/* Convert ANY dynamic Q (1,150 Avionics or 600 NVIDIA SLT) into its own live 3-Page Notebook Spec! */
function buildDynamicSpreadSpec(q, t, isNvidia) {
  const titlePrefix = isNvidia ? `NVIDIA SLT (${(t && t.title) || "Track"})` : `AVIONICS EE (${(t && t.title) || "Topic"})`;
  const idLabel = String(q.id || "STUDY").toUpperCase();
  const isNum = isNvidia ? (q.questionType === "number") : (q.expected !== undefined);
  const ans = isNum ? `${Number(Number(q.expected).toPrecision(5))} ${q.unit || ""}`.trim() : (q.level || q.phase || "Verified Audit & Proof");

  // Pick visual schematic style based on topic/question keywords
  const txt = ((q.id || "") + " " + (q.question || "") + " " + (t?.id || "")).toLowerCase();
  let schKind = "generic";
  if (/100.*resistor|100\s*x|1\s*ω.*parallel|r14.*0\s*ω|parallel-x[789]/.test(txt)) schKind = "parallel100";
  else if (/setup|hold|skew|t_cq|timing|sta|386|820/.test(txt)) schKind = "sta";
  else if (/rectifier|bridge|ripple|1n400|piv/.test(txt)) schKind = "rectifier";
  else if (/zener|bjt|saturation|lm317|base|collector/.test(txt)) schKind = "zener_bjt";
  else if (/wheatstone|thevenin|10\s*mω.*dmm|loaded divider/.test(txt)) schKind = "bridge_thevenin";
  else if (/keysight|n7020a|1169b|droop|dram|trc|ddr4|cpu2/.test(txt)) schKind = "scope4ch";

  const stList = Array.isArray(q.steps) ? q.steps : [];
  const mathSteps = isNum ? [
    `1) Extract Givens: ${(q.question || "").slice(0, 58)}`,
    `2) Convert Engineering Prefixes (10^3n) to Base SI Units`,
    `3) Governing Equation: ${q.formula || "Apply Kirchhoff / Ohm Law"}`,
    `4) Substitute Values: ${q.sub || "Plug converted base values"}`,
    `5) Intermediate Computation & Unit Balance`,
    `6) Sanity Check Order of Magnitude & Sign`,
    `7) Final Answer = ${ans}`
  ] : [
    `1) Physical Law: ${(q.formula || "Define system nodes, ports & boundary")}`,
    `2) Bench / Signal Observation: ${(stList[0] || q.question || "").slice(0, 58)}`,
    `3) Healthy Reference Baseline: ${(stList[1] || "Expected passing range & waveform").slice(0, 58)}`,
    `4) Fault / Mechanism Check: ${(stList[2] || "Compare observed vs spec").slice(0, 58)}`,
    `5) Single-Variable Control Proof: ${(stList[3] || "A-B-A swap isolates DUT vs fixture").slice(0, 58)}`,
    `6) Result Disposition = ${ans}`
  ];

  const babySteps = stList.length ? stList.slice(0, 5) : mathSteps.slice(0, 5);
  const codeLines = q.code
    ? String(q.code).split("\n").slice(0, 10)
    : (isNum ? [
        `// Automated Verification for ${idLabel}`,
        `let target_unit = "${String(q.unit || "SI")}";     // Preserve engineering units`,
        `let eq_law = "${String(q.formula || "Ohm / KVL / Timing").slice(0, 34)}";`,
        `// Step 1: Convert m(1e-3), u(1e-6), k(1e3), M(1e6) before dividing`,
        `// Step 2: Evaluate ${String(q.sub || "substitution").slice(0, 48)}`,
        `assert(abs(result - (${q.expected})) <= tol);   // Independent guardband check!`
      ] : [
        `// Hardware / Lab Verification Procedure for ${idLabel}`,
        `1. Capture baseline telemetry / schematic nodes while power is OFF;`,
        `2. Set bench PSU current limit safely (NEVER measure Ohms on live rail!);`,
        `3. Measure primary signal with calibrated DMM / 4-ch Scope (check GND clip);`,
        `4. Change ONLY ONE suspect variable (A -> B -> A swap) to prove root cause;`,
        `5. Log PASS / FAIL / INVALID + serial + timestamp + raw evidence.`
      ]);

  const PME = window.PROFESSOR_MASTERY_ENGINE;
  const note = isNvidia
    ? PME?.NVIDIA_TRACK_LECTURES?.[t?.id]
    : PME?.TOPIC_PROFESSOR_NOTES?.[t?.id];

  return {
    header: `${idLabel} · ${titlePrefix}`,
    question: q.question || "",
    answer: ans,
    schKind,
    schMeta: {
      b1: t?.title || "Input / Source",
      b1Sub: isNum ? `Target: ${q.unit}` : "Symptom / Givens",
      b2: q.skillName || q.learningObjective || "Core Physics",
      b2Sub: q.formula ? q.formula.slice(0, 22) : "Mechanism",
      b3: ans,
      b3Sub: isNvidia ? "PASS / FAIL / INVALID" : "GO / NO-GO Check",
      c1: `Blue: ${(stList[0] || q.question || "").slice(0, 60)}`,
      c2: `Green: ${(stList[stList.length - 1] || "Confirm units & A-B-A evidence").slice(0, 60)}`,
      waveTitle: `Illustrated Signal / Timing / Operating Profile (${idLabel})`,
      waveNote: isNum ? `Formula: ${q.formula || ""} => Result: ${ans}` : (note?.lawWhy || "Measure before swapping")
    },
    intuition: (isNvidia ? note?.physics : note?.intuition) || (q.lesson && q.lesson.summary) || "",
    mathSteps,
    tableTitle: "Step-by-Step Summary & Guardband Table",
    table: {
      headers: ["Check", "Target / Quantity", "Verified Notes"],
      rows: [
        ["Givens & SI", isNum ? (q.unit || "SI") : (q.skillName || "Concept"), "Convert 10^(3n) prefixes first"],
        ["Governing Law", q.formula || "Physical First Principles", isNum ? "Plug base SI units" : "Trace loop & return"],
        ["Final Proof", ans, "Verify against trap before signoff"]
      ]
    },
    highlightRow: 2,
    trapTitle: "★ PROFESSOR TRAP & GOLDEN RULE TO REMEMBER ★",
    trapBody: (note?.trap || (q.hints && q.hints[2]) || "Separate symptom from root cause, convert prefixes before substituting, and verify via independent check."),
    babySteps,
    pseudo: [
      `// 1. GIVEN: Parse ${idLabel} inputs and convert metric prefixes to base SI`,
      `// 2. LAW: Apply ${q.formula || (t?.title + " physical first principles")}`,
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
        <span class="nb-spread-pill">📓 3-PAGE SPIRAL NOTEBOOK IMAGE</span>
        <strong>Full Step-by-Step Baby-Steps Visual Spread for ${esc(String(q.id || "").toUpperCase())}</strong>
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
    <summary>🖼️ Visual Notebook Gallery: All 12 High-Resolution 3-Page Spiral Notebook Images (.PNG Ready)</summary>
    <div class="nb-gallery-body">
      <p style="margin-top:0;font-size:0.9rem;color:#334155;">Click any sheet below to inspect its 3-page spiral graph-paper spread (Annotated Schematic + Waveform | Uncut Math Proof + Table + Trap Box | Baby Steps + Dotted Pseudocode + Line-by-Line Code) or download it directly as a 2400×1060 PNG image.</p>
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
    canvas.width = 2400;
    canvas.height = 1060;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 2400, 1060);
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
    dlg.innerHTML = `<div class="nb-zoom-head"><strong>📓 3-Page Spiral Graph-Paper Notebook Spread (High-Resolution View)</strong><div><button type="button" id="nbZoomDlBtn" class="nb-spread-btn">📸 Download .PNG</button> <button type="button" id="nbZoomCloseBtn" class="nb-spread-btn secondary">Close ×</button></div></div><div id="nbZoomContent"></div>`;
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
  version: "1.0.0",
  FLAGSHIP_SPREAD_SPECS,
  renderNotebookSpreadSVG,
  buildDynamicSpreadSpec,
  renderQuestionNotebookSpread,
  renderFlagshipGallerySection,
  bindNotebookSpreads
};

})();
