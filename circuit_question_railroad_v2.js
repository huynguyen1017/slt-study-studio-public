"use strict";
/* Per-question, read-only factor-label scratchpad for Avionics and NVIDIA worked lessons.
   Uses the selected question/variant as source; never changes IDs, answers, or saved state.
   Conversion factors are identities, not a substitute for Kirchhoff network analysis. */
(function () {
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
  const prefixes = {
    k: {power: 3, name: "kilo"}, M: {power: 6, name: "mega"},
    G: {power: 9, name: "giga"}, m: {power: -3, name: "milli"},
    u: {power: -6, name: "micro"}, "µ": {power: -6, name: "micro"},
    "μ": {power: -6, name: "micro"}, n: {power: -9, name: "nano"},
    p: {power: -12, name: "pico"}
  };
  const supported = new Set(["Ω", "V", "A", "W", "F", "H", "Hz", "s", "J", "C"]);
  // Token boundary is explicit: a Unicode Ω is not a JavaScript ASCII word character.
  const quantity = /(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*(G|M|k|m|u|µ|μ|n|p)?(Ω|Hz|V|A|W|F|H|s|J|C)(?=$|[\s,;:.)\]}+\-*/])/gu;
  function extractQuantities(statement) {
    const str = String(statement || "").replace(/μ/g, "µ");
    const out = [], used = new Set();
    for (const match of str.matchAll(quantity)) {
      const value = Number(match[1]);
      const prefix = match[2] || "", base = match[3];
      if (!Number.isFinite(value) || !supported.has(base)) continue;
      const power = prefix ? prefixes[prefix].power : 0;
      const unit = prefix + base, key = match[1] + " " + unit;
      if (used.has(key)) continue;
      used.add(key);
      out.push({
        raw: match[0].trim(), value, unit, base, power,
        name: prefix ? prefixes[prefix].name : "base SI",
        scaled: Number((value * Math.pow(10, power)).toPrecision(12))
      });
    }
    return out;
  }
  const fmt = n => {
    if (!Number.isFinite(n)) return "not finite";
    if (n === 0) return "0";
    if (Math.abs(n) >= 1e-5 && Math.abs(n) < 1e9) return String(Number(n.toPrecision(9)));
    const exp = Math.floor(Math.log10(Math.abs(n)));
    const mantissa = Number((n / Math.pow(10, exp)).toPrecision(6));
    return mantissa + " × 10" + (exp < 0 ? "⁻" + Math.abs(exp) : "⁺" + exp);
  };
  const frac = (top, bottom) =>
    '<span class="rr-fraction"><span class="rr-top">' + top +
    '</span><span class="rr-rule"></span><span class="rr-bottom">' + bottom + '</span></span>';
  const cancel = x => '<span class="rr-cancel">' + esc(x) + '</span>';
  function rail(item) {
    const input = frac(esc(item.value) + " " + cancel(item.unit), "1");
    const factor = frac("10<sup>" + item.power + "</sup> " + esc(item.base),
      "1 " + cancel(item.unit));
    return '<div class="rrq-rail">' + input + '<b>×</b>' + factor +
      '<b>=</b><strong>' + esc(fmt(item.scaled) + " " + item.base) + '</strong></div>';
  }
  function maths(source) {
    const s = String(source || "").trim();
    if (!s) return "";
    if (s.length > 240 || !s.includes("=") || s.includes("->"))
      return '<p class="rrq-original">' + esc(s) + '</p>';
    return '<div class="rrq-math">' +
      (typeof window.studyMath === "function" ? window.studyMath(s, true) : '<code>' + esc(s) + '</code>') +
      '</div>';
  }
  function render(q, topic) {
    if (!q || typeof q !== "object") return "";
    const statement = String(q.question || q.prompt || "");
    const known = extractQuantities(statement);
    const formula = String(q.formula || "");
    const substitution = String(q.sub || "");
    const expected = Number(q.expected);
    const numeric = q.expected !== undefined && q.expected !== null && Number.isFinite(expected);
    // A conceptual question with no physical units remains a conceptual question.
    if (!known.length && !formula && !substitution) return "";
    const converted = known.filter(g => g.power !== 0);
    const bases = known.filter(g => g.power === 0);
    const name = String(topic && topic.title || topic && topic.id || q.topic || "Selected problem");
    return '<section class="rrq-workpad" aria-label="Current question factor-label and equation whiteboard">' +
      '<header><small>LIVE QUESTION SCRATCHPAD · FACTOR LABEL + CIRCUIT PHYSICS</small>' +
      '<h4>Write the givens. Cancel the units. Then solve the equations.</h4>' +
      '<p>Read-only worked notation for the current question and current 🎲 numbers — not a separate answer or a change to your progress.</p></header>' +
      '<div class="rrq-body"><p class="rrq-topic"><b>Topic:</b> ' + esc(name) +
      ' · <b>Question:</b> ' + esc(q.id || "current") + '</p>' +
      '<details open><summary>1 · Circle every numerical quantity and define its unit</summary>' +
      (known.length ? '<div class="rrq-givens">' + known.map(g =>
        '<span><strong>' + esc(g.raw) + '</strong><small>' +
        esc(g.name + (g.power ? " = 10^(" + g.power + ")" : ", already SI")) +
        '</small></span>').join("") + '</div>' :
        '<p>No unambiguous SI quantity was found in the question text. Read the statement directly; do not invent givens.</p>') +
      '</details>' +
      '<details open><summary>2 · Railroad tracks: numerator / denominator / strike identical units</summary>' +
      (converted.length ? converted.slice(0, 12).map(g =>
        '<div class="rrq-item"><strong>' + esc(g.raw) + ' → base SI</strong>' +
        rail(g) + '<p>Put ' + esc(g.unit) + ' on the bottom of the second fraction. The diagonal ' +
        esc(g.unit) + ' units cancel; multiply ' + esc(g.value) + ' × 10^(' +
        g.power + ') to obtain ' + esc(fmt(g.scaled) + " " + g.base) + '.</p></div>').join("") :
        '<p>All recognized quantities already use unprefixed SI units. No prefix cancellation is needed.</p>') +
      (bases.length ? '<p class="rrq-original">Already in base units: ' +
        esc(bases.map(g => g.raw).join(" · ")) + '</p>' : "") +
      '</details>' +
      '<details open><summary>3 · Governing equation and the original substituted expression</summary>' +
      (formula ? '<div class="rrq-label">GOVERNING RELATIONSHIP — FROM THIS QUESTION</div>' + maths(formula) : "") +
      (substitution ? '<div class="rrq-label">GIVEN SUBSTITUTION — FROM THIS QUESTION</div>' + maths(substitution) : "") +
      (!formula && !substitution ? '<p>This question does not provide a single numeric equation. Derive one from the labeled circuit before calculating.</p>' : "") +
      '<p>For connected loops, define every current arrow and reference node first; apply KCL/KVL or mesh/node equations. Conversion factors alone cannot establish the network equations.</p>' +
      '</details>' +
      '<details><summary>4 · Show the missing pencil arithmetic, one move per line</summary>' +
      '<div class="rrq-math">' + (typeof window.studyMath === "function" ?
        window.studyMath("a/b + c/d = (a*d + b*c)/(b*d)", true) :
        '<code>a/b + c/d = (a·d + b·c)/(b·d)</code>') + '</div>' +
      '<p>Write a common denominator for fractions; multiply EVERY term by the least common denominator; distribute signs; combine like terms; isolate each unknown; then substitute back. Do not cancel terms across addition.</p>' +
      '<div class="rrq-math">' + (typeof window.studyMath === "function" ?
        window.studyMath("1 kΩ * 1 mA = 10^3 Ω * 10^(-3) A = 1 V", true) :
        '<code>1 kΩ × 1 mA = 10³ Ω × 10⁻³ A = 1 V</code>') + '</div>' +
      '<p>Engineering shortcut: kΩ × mA = V, because the powers +3 and −3 add to zero.</p></details>' +
      (numeric ? '<div class="rrq-answer">Expected answer stored for this selected question: <strong>' +
        esc(fmt(expected) + (q.unit ? " " + q.unit : "")) +
        '</strong><p>This target is from the existing question data, not recomputed from text. Verify it against KCL/KVL, dimensions and actual topology before trusting the result.</p></div>' : "") +
      '</div></section>';
  }
  window.CIRCUIT_CURRENT_QUESTION_RAILROAD = {version: "2.0", extractQuantities, rail, render};
})();