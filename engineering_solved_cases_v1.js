"use strict";
/* Fully worked, scenario-specific engineering answer demonstrations.
   These are ADDITIONAL solved practice cases, not claims of real measurements.
   Do not treat example limits as any employer's production specifications. */
(function(){
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cases={
"ohm-F1":{
 course:"avionics",
 title:"Solved bench case · 5.00 V source, 220 Ω load, unexpected 15.0 mA",
 scenario:"The original OHM-F1 asks what voltage physically means. Apply that exact concept to a hypothetical bench investigation: a 5.00 V source drives a nominal 220 Ω load; 15.0 mA flows, and the resistor itself measures 3.30 V. Locate the unexplained voltage.",
 givens:["Supply, measured at its own terminals: 5.00 V","Nominal load: 220 Ω","Resistor differential voltage: 3.30 V","Independently measured current: 15.0 mA"],
 stages:[
 {head:"Establish voltage as a DIFFERENCE between defined nodes",detail:"Voltage is not a reading at an isolated point. Identify node A at the load input and node B at its return; state V_AB = V_A − V_B. Reference the DC source to its own return and document the same operating state for both measurements.",eq:"V_{AB}=V_A-V_B"},
 {head:"Calculate the nominal source current before measuring",detail:"For an ideal 5.00 V supply directly connected to one 220 Ω resistor, I = V/R = 0.022727 A. Predict the resistor voltage as 5.00 V. Use the full value to compute power and check that the test load is rated appropriately.",eq:"I_{\\mathrm{nom}}=\\frac{5.00\\,\\mathrm V}{220\\,\\Omega}=22.73\\,\\mathrm{mA}"},
 {head:"Confirm the load's actual voltage/current ratio",detail:"The actual resistor differential voltage is 3.30 V at a measured current of 0.0150 A. Its effective resistance is exactly 220 Ω. Therefore, the observed low current is not explained by an out-of-value resistor alone.",eq:"R_{\\mathrm{load}}=\\frac{3.30\\,\\mathrm V}{0.0150\\,\\mathrm A}=220\\,\\Omega"},
 {head:"Apply Kirchhoff's Voltage Law to account for EVERY drop",detail:"The source measures 5.00 V but only 3.30 V appears across the load. Assuming a single closed series loop and simultaneous steady-state observations, 1.70 V is unaccounted for elsewhere in the return, wiring, fixture, meter or protection path.",eq:"V_{\\mathrm{missing}}=5.00-3.30=1.70\\,\\mathrm V"},
 {head:"Calculate the equivalent additional series impedance",detail:"At 15.0 mA, a 1.70 V loss corresponds to 113.3 Ω if the lost voltage is resistive at that operating point. This equivalent is a hypothesis, not proof that a physical 113 Ω component exists.",eq:"R_{\\mathrm{series,eq}}=\\frac{1.70\\,\\mathrm V}{0.0150\\,\\mathrm A}=113.3\\,\\Omega"},
 {head:"Localize the drop with differential evidence, not guesswork",detail:"With the fixture powered safely, measure DIFFERENTIAL voltage across the supply lead, fixture contact, ammeter, load connections and return. Verify whether DMM current-mode burden voltage created the 1.70 V loss. Independently compare current with a correctly rated calibrated shunt or current probe. Never move probes with a live meter still configured for current measurement.",eq:"V_S=\\sum_k V_k"},
 {head:"Correct the VERIFIED cause and repeat identical conditions",detail:"Only after the loss is localized should you repair/replace the faulty element or adjust the measurement method. Restore the original 5.00 V test, verify V_R≈5.00 V and I≈22.73 mA within approved tolerances, then repeat A/B/A with a known-good fixture. Do not invent a measured repair result.",eq:"I_{\\mathrm{post-fix}}\\stackrel{\\mathrm{ideal}}{=}\\frac{5.00}{220}=22.73\\,\\mathrm{mA}"},
 {head:"Deliver the precise engineering conclusion",detail:"The nominal current is 22.73 mA. The load still looks like 220 Ω under the measured conditions; Kirchhoff analysis exposes a 1.70 V series loss, equivalent to 113.3 Ω at 15 mA. Identify its physical location and instrument burden before assigning fault, then verify the restoration and document station/DUT disposition.",eq:"\\Delta I=22.73-15.0=7.73\\,\\mathrm{mA}"}
 ],
 answer:"Expected 22.73 mA; observed 15.0 mA; measured load is 220 Ω; unexplained series drop 1.70 V ≡ 113.3 Ω at the operating point. Root cause remains unconfirmed until a differential check identifies the exact location.",
 say:"I would calculate 22.73 mA for the nominal 5 V and 220 Ω load. When only 15 mA flows, the 3.30 V measured across the resistor still gives 220 Ω, so the component alone does not explain the loss. Kirchhoff's law reveals another 1.70 V drop, equivalent to 113.3 Ω at that current. I would trace that drop across the fixture, return, and ammeter to rule out current-meter burden voltage, correct the verified cause, and repeat the identical test before declaring the unit recovered.",
 requirements:"Use the official schematic and approved rail/current limits on a real product; the values on this teaching card are deliberately synthetic."
},
"nvs-dram-14":{
 course:"nvidia",
 title:"Solved timing case · DDR4-3200 ACT-to-READ configuration violation",
 scenario:"A hypothetical memory test passes with an already-open row but reports errors after an ACT to another row. The controller uses tRCD = 20 DRAM clock cycles. For a Micron DDR4-3200 -062E example, tCK=0.625 ns, CL=22 cycles, tRCDmin=13.75 ns, and tRPmin=13.75 ns. Determine the timing violation, required controller setting and verification sequence.",
 givens:["DDR data rate: 3200 MT/s → command clock 1600 MHz","DRAM clock period: 0.625 ns","Programmed tRCD: 20 cycles","Required tRCD: 13.75 ns; CL: 22 cycles; tRP: 13.75 ns"],
 stages:[
 {head:"Confirm the memory part, speed grade, and timing units",detail:"Inspect the exact device identification and speed-bin table rather than relying on generic DDR4 numbers. DDR-3200 runs a command clock at 1600 MHz, so one controller/DRAM clock cycle is 0.625 ns. Verify whether the register stores cycles, encoded cycles, or half-cycles before using the following conversion.",eq:"t_{CK}=\\frac{1}{1.600\\times10^9\\,\\mathrm{Hz}}=0.625\\,\\mathrm{ns}"},
 {head:"Translate the controller setting to physical time",detail:"A programmed tRCD of 20 full DRAM clock cycles gives only 12.50 ns from ACT to RD. That is shorter than the example selected device's required 13.75 ns.",eq:"t_{RCD,\\,\\mathrm{set}}=20(0.625)=12.50\\,\\mathrm{ns}"},
 {head:"Compute signed timing margin and disposition",detail:"The signed margin is allowed time minus required minimum. A negative 1.25 ns means the test configuration violates the selected part's datasheet. It is not evidence, by itself, of defective DRAM silicon.",eq:"M_{RCD}=12.50-13.75=\\boxed{-1.25\\,\\mathrm{ns}}"},
 {head:"Calculate the minimum legal cycle setting",detail:"Divide the part minimum delay by its clock period and round UP to the next full clock. The minimum valid setting in this simplified direct-cycle representation is 22 cycles, not 21 or 20.",eq:"N_{RCD,\\min}=\\left\\lceil\\frac{13.75}{0.625}\\right\\rceil=22\\,\\mathrm{cycles}"},
 {head:"Differentiate row hit, closed-row miss, and row conflict",detail:"An already-open row requires RD then CL. If no row is open, issue ACT, wait tRCD, issue RD, then wait CL. If the wrong row is open in the same bank, issue PRE, wait tRP, then ACT→tRCD→RD→CL. The simplified conflict-to-first-data latency with 22-cycle CL, tRP and tRCD is 41.25 ns, without controller/PHY overhead. Do NOT automatically add PRE to every closed-row miss.",eq:"t_{\\mathrm{conflict}}=t_{RP}+t_{RCD}+CL\\cdot t_{CK}=13.75+13.75+13.75=41.25\\,\\mathrm{ns}"},
 {head:"Capture the exact failing command and raw error",detail:"Correlate ACT, RD, bank/row address, timing-register dump, ECC syndrome and raw memory-test data. A row-hit pass is consistent with an ACT-to-RD timing problem but does not prove it; independently check tRP, tRAS, command bus integrity and power/temperature. Verify DDR4 tCCD_S means different bank groups and tCCD_L means same group.",eq:"t_{CCD,L}\\ \\mathrm{applies\\ within\\ the\\ same\\ bank\\ group}"},
 {head:"Run A/B/A with ONE legitimate parameter change",detail:"Record errors with the invalid 20-cycle setting (A), change only tRCD to 22 cycles (B), then restore the initial setting (A) if permitted by an isolated non-production test policy. Compare the raw mismatch count and address patterns under identical firmware, frequency, voltage and temperature. This is an experimental proposal, not a claim that actual failure counters were observed.",eq:"A(20)\\rightarrow B(22)\\rightarrow A(20)"},
 {head:"Conclude without falsely blaming the DUT",detail:"The 20-cycle setting demonstrably violates the chosen datasheet timing. Correct the controller to at least 22 cycles and rerun all required valid PVT and stress tests. If failures persist in-spec, continue isolating training, board SI, voltage, and silicon with known-good units. Do not classify a component as bad from an invalid configuration alone.",eq:"t_{RCD,\\,\\mathrm{valid}}\\geq13.75\\,\\mathrm{ns}"}
 ],
 answer:"The 20-cycle setting equals 12.50 ns, violating tRCDmin=13.75 ns by 1.25 ns. Set at least 22 cycles for this specific speed bin (assuming direct-cycle encoding). The original test configuration is invalid; retest before any DUT FAIL decision.",
 say:"For the specified DDR4-3200 speed bin, I first convert 20 DRAM cycles to 12.5 ns. The published tRCD minimum is 13.75 ns, so the configured ACT-to-READ timing is short by 1.25 ns. The correct minimum is 22 cycles. I would confirm the actual command trace, isolate the timing setting with a controlled A/B/A comparison, preserve raw memory errors and only consider a silicon root cause after it also fails under valid timing and controlled conditions.",
 requirements:"Micron 16 Gb DDR4 SDRAM Rev. H, -062E speed bin, published 2021; device reference only. Not an NVIDIA platform specification. https://media.digikey.com/pdf/Data%20Sheets/Micron%20Technology%20Inc%20PDFs/MT40A4G4_2G8_1G16_RevH_Aug2021.pdf"
}
};
const eq=str=>typeof window.studyMath==="function"?window.studyMath(str,true):'<code>'+esc(str)+'</code>';
function render(q,course){
 const obj=cases[q?.id];if(!obj||obj.course!==course||q?.variant)return "";
 const rows=obj.stages.map((s,i)=>'<article class="eng-case-step"><div class="eng-case-badge">'+(i+1)+'</div><div class="eng-case-stepbody"><h4>'+esc(s.head)+'</h4><p>'+esc(s.detail)+'</p><div class="eng-case-equation">'+eq(s.eq)+'</div></div></article>').join("");
 return '<section class="eng-solved-case" aria-label="Fully worked engineering interview case linked to this question">'+
 '<header><span>PROBLEM → MODEL → CALCULATION → EVIDENCE → VERIFICATION → DECISION</span><h3>'+esc(obj.title)+'</h3><p>'+esc(obj.scenario)+'</p></header>'+
 '<div class="eng-case-givens"><strong>Given for this additional worked example</strong><ul>'+obj.givens.map(g=>'<li>'+esc(g)+'</li>').join("")+'</ul></div>'+
 '<div class="eng-case-steps">'+rows+'</div>'+
 '<div class="eng-case-final"><strong>Calculated result and defensible disposition</strong><p>'+esc(obj.answer)+'</p></div>'+
 '<div class="eng-case-interview"><strong>Technical hiring-manager answer — proposed explanation</strong><blockquote>'+esc(obj.say)+'</blockquote></div>'+
 '<small>'+esc(obj.requirements)+' All readings/observations in this worked example are hypothetical except externally sourced device specifications.</small></section>';
}
window.ENGINEERING_SOLVED_CASES={render,cases};
})();