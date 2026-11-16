"use strict";
/* Avionics EE Practice Academy: 690 original exercises; engineering-notation MathML
   equations via native studyMath; no external dependencies or copied textbook problems. */
(function(){
const fmt=n=>Number.isFinite(n)?((Math.abs(n)>0&&Math.abs(n)<0.0001)?n.toExponential(3):Number(n.toPrecision(5)).toString()):"invalid";
const num=(n)=>Number(n.toPrecision(10));
function model(prompt,answer,unit,formula,sub,steps,hint,unitConv){
 return {prompt,answer:num(answer),unit,formula,sub,steps,unitConv:unitConv||"",hint:hint||"Identify the given values, convert units to powers of 10 first, substitute into the equation, then check the magnitude."};
}
const A={
 milli:k=>{const x=[8,25,72,150,420][k];return model(`Convert ${x} mA into amperes (A).`,x*1e-3,"A","I_A = I_mA * 10^(-3)",`I_A = ${x} * 10^(-3) = ${fmt(x*1e-3)}`,["Identify the prefix: milli (m) means 10^(-3) (one thousandth).","Multiply the value in mA by 10^(-3) (move the decimal point 3 places left).","Report the final value in base amperes (A)."],"Write milli as 10^(-3) before shifting the decimal 3 places left.",`I_mA = ${x} * 10^(-3)`);},
 micro:k=>{const x=[2.2,4.7,10,47,100][k];return model(`Express a ${x} µF capacitor in farads (F).`,x*1e-6,"F","C_F = C_uF * 10^(-6)",`C_F = ${x} * 10^(-6) = ${fmt(x*1e-6)}`,["Identify the prefix: micro (µ) means 10^(-6) (one millionth).","Multiply the capacitance in µF by 10^(-6) (shift the decimal 6 places left).","Check that a microfarad capacitor is a very small fraction of 1 F."],"Micro means 10^(-6), so replace µ with × 10^(-6).",`C_F = ${x} * 10^(-6)`);},
 ohmI:k=>{const v=[3.3,5,12,1.8,9][k],r=[330,1000,2400,180,300][k];const ia=v/r,ima=1000*ia;return model(`A ${r} Ω resistor has ${v} V across it. Find current in mA.`,ima,"mA","I = V / R",`I_mA = (${v} / ${r}) * 10^(3) = ${fmt(ima)}`,["Read the voltage across the resistor (V) and resistance (R) in base units.","Apply Ohm's law I = V / R to get amperes (A).","Multiply amperes by 10^(3) (since 1 mA = 10^(-3) A) to report milliamperes (mA)."],"Use I = V / R in volts and ohms first, then convert A to mA (× 10^3).",`I_mA = I * 10^(3)`);},
 ohmR:k=>{const v=[5,3.3,12,1.2,9][k],i=[10,3,20,6,15][k];return model(`A branch has ${v} V and should draw ${i} mA. What resistance in Ω gives that current?`,v/(i*1e-3),"Ω","R = V / I",`R = ${v} / (${i} * 10^(-3)) = ${fmt(v/(i*1e-3))}`,["Convert target current from mA into base amperes: multiply by 10^(-3).","Rearrange Ohm's law to solve for resistance: R = V / I.","Verify: higher voltage or lower current requires a larger resistor."],"Convert mA to A using 10^(-3) before dividing V / I.",`I = ${i} * 10^(-3)`);},
 powerDC:k=>{const v=[1.0,1.8,3.3,5,12][k],i=[2,1.5,0.8,0.4,0.25][k];return model(`A DC board rail is ${v} V at ${i} A. Find consumed power in W.`,v*i,"W","P = V * I",`P = ${v} * ${i} = ${fmt(v*i)}`,["Identify the rail voltage V (in volts) and load current I (in amperes).","Multiply voltage by current using P = V * I.","Verify units: 1 V × 1 A = 1 W of electrical power."],"Power is simply voltage times current when both are in base V and A.");},
 joule:k=>{const p=[2,3.5,6,12,0.8][k],t=[5,10,8,15,20][k];return model(`A system draws ${p} W for ${t} s. Find energy in joules.`,p*t,"J","E = P * t",`E = ${p} * ${t} = ${fmt(p*t)}`,["Power (watts) is energy per second; total energy adds watts over time.","Multiply constant power P (in W) by duration t (in s).","Report energy in joules (1 J = 1 W·s)."],"Energy equals power times time: E = P * t.");},
 seriesR:k=>{const a=[100,220,330,470,680][k],b=[150,470,680,1000,1200][k],c=[50,100,220,330,470][k];return model(`Three series resistors are ${a} Ω, ${b} Ω and ${c} Ω. Find total resistance in Ω.`,a+b+c,"Ω","R_T = R_1 + R_2 + R_3",`R_T = ${a} + ${b} + ${c} = ${a+b+c}`,["Confirm there is only ONE unbranched path so all three resistors are in series.","Add all individual resistances directly: R_T = R_1 + R_2 + R_3.","Check: total series resistance must be larger than the largest single resistor."],"In a single series path, resistances add directly.");},
 divider:k=>{const v=[3.3,5,9,12,15][k],r1=[1000,2200,3300,1000,4700][k],r2=[1000,1000,2200,2000,4700][k];return model(`Unloaded divider: ${v} V input, top ${r1} Ω, bottom ${r2} Ω. Find voltage at midpoint in V.`,v*r2/(r1+r2),"V","V_out = V_in * (R_2 / (R_1 + R_2))",`V_out = ${v} * (${r2} / (${r1} + ${r2})) = ${fmt(v*r2/(r1+r2))}`,["Add the two series resistors first to find R_total = R_1 + R_2.","The midpoint voltage is the drop across the BOTTOM resistor R_2.","Multiply V_in by the ratio R_2 / (R_1 + R_2); V_out must always be less than V_in."],"Put the BOTTOM resistor R_2 in the numerator and (R_1 + R_2) in the denominator.");},
 parallelR:k=>{const a=[100,220,330,470,1000][k],b=[100,330,680,1000,1000][k];return model(`Calculate the equivalent resistance of ${a} Ω and ${b} Ω in parallel, in Ω.`,a*b/(a+b),"Ω","R_eq = (R_1 * R_2) / (R_1 + R_2)",`R_eq = (${a} * ${b}) / (${a} + ${b}) = ${fmt(a*b/(a+b))}`,["Both resistors share the same top Node A and bottom Node B.","For two parallel resistors, multiply them in the numerator and add them in the denominator.","Sanity check: R_eq MUST be strictly smaller than the smaller resistor."],"Use product-over-sum; the answer is always less than either branch alone.");},
 parallelI:k=>{const v=[3,5,9,12,24][k],r=[100,500,300,1200,2000][k];const ia=v/r,ima=1000*ia;return model(`A ${r} Ω branch is connected across a ${v} V parallel rail. Find its branch current in mA.`,ima,"mA","I_branch = V_rail / R_branch",`I_mA = (${v} / ${r}) * 10^(3) = ${fmt(ima)}`,["Every parallel branch sees the exact same rail voltage V_rail.","Apply Ohm's law directly to this single branch: I = V_rail / R_branch.","Convert amperes to milliamperes by multiplying by 10^(3)."],"Each parallel branch obeys Ohm's law with the full rail voltage.",`I_mA = I_branch * 10^(3)`);},
 kcl:k=>{const x=[10,15,22,30,55][k],a=[3,5,6,9,10][k],b=[2,4,7,8,15][k];return model(`A node receives ${x} mA; two branches leave with ${a} mA and ${b} mA. How many mA leave through a third branch?`,x-a-b,"mA","I_in = I_1 + I_2 + I_3",`I_3 = ${x} - ${a} - ${b} = ${x-a-b}`,["All currents are already in mA, so no prefix conversion is needed.","By Kirchhoff's Current Law (KCL), total current entering equals total leaving.","Subtract the two known outgoing currents from the entering current."],"KCL at Node A: Entering current minus known leaving currents equals unknown branch current.");},
 kvl:k=>{const vs=[5,9,12,15,24][k],a=[1,2,3,4,8][k],b=[2,3,4,5,7][k];return model(`A series loop source is ${vs} V. Two drops are ${a} V and ${b} V. Find the remaining drop in V.`,vs-a-b,"V","V_source = V_1 + V_2 + V_3",`V_3 = ${vs} - ${a} - ${b} = ${vs-a-b}`,["Trace one complete closed loop around the circuit.","By Kirchhoff's Voltage Law (KVL), total source rise equals the sum of passive drops.","Subtract the two measured resistor drops from the source voltage."],"KVL: sum of all resistor drops must equal the supply voltage.");},
 thev:k=>{const v=[5,9,12,15,24][k],top=[1000,1000,2200,3300,4700][k],bot=[1000,2000,2200,2200,4700][k];return model(`An unloaded ${v} V divider has ${top} Ω on top and ${bot} Ω below. Find its Thevenin open-circuit voltage in V.`,v*bot/(top+bot),"V","V_th = V_s * (R_bottom / (R_top + R_bottom))",`V_th = ${v} * (${bot} / (${top} + ${bot})) = ${fmt(v*bot/(top+bot))}`,["Thevenin voltage V_th is defined as the unloaded open-circuit output voltage.","With no external load connected, apply the voltage divider rule across R_bottom.","Note: R_th would be R_top || R_bottom, while V_th is the open-circuit voltage."],"With no load attached, V_th equals the unloaded voltage divider midpoint.");},
 norton:k=>{const v=[2,3,5,10,12][k],r=[100,150,250,500,600][k];const ia=v/r,ima=1000*ia;return model(`A Thevenin network has Vth=${v} V and Rth=${r} Ω. Convert to Norton current in mA.`,ima,"mA","I_N = V_th / R_th",`I_N_mA = (${v} / ${r}) * 10^(3) = ${fmt(ima)}`,["Norton current I_N is the short-circuit current when output terminals are shorted.","Divide V_th by R_th to get Norton current in amperes.","Convert amperes to milliamperes (× 10^3)."],"I_N = V_th / R_th, then convert A to mA (× 10^3).",`I_N_mA = I_N * 10^(3)`);},
 rms:k=>{const vp=[2,5,10,12,24][k];return model(`A sinusoid has ${vp} V peak amplitude. Find RMS voltage in V.`,vp/Math.SQRT2,"V","V_rms = V_peak / √(2)",`V_rms = ${vp} / √(2) = ${fmt(vp/Math.SQRT2)}`,["Confirm the given value is peak amplitude (center-to-top), not peak-to-peak.","For a pure sine wave, divide V_peak by √2 (≈ 1.4142, or multiply by 0.7071).","Sanity check: V_rms is always smaller than V_peak."],"Divide peak amplitude by √2 for a pure sinusoid.");},
 period:k=>{const f=[10,20,50,100,200][k];const ts=1/f,tms=1000*ts;return model(`A periodic signal is ${f} Hz. Find its period in milliseconds.`,tms,"ms","T = 1 / f",`T_ms = (1 / ${f}) * 10^(3) = ${fmt(tms)}`,["Period T in seconds is the reciprocal of frequency f in Hz (T = 1 / f).","Compute 1 / f in seconds first.","Multiply seconds by 10^(3) to express the answer in milliseconds (ms)."],"Compute T = 1 / f in seconds, then multiply by 10^3 for milliseconds.",`T_ms = T * 10^(3)`);},
 capQ:k=>{const c=[1,2.2,4.7,10,47][k],v=[3,5,5,12,2][k];return model(`A ${c} µF capacitor is charged to ${v} V. Find stored charge in µC.`,c*v,"µC","Q = C * V",`Q_uC = ((${c} * 10^(-6)) * ${v}) * 10^(6) = ${fmt(c*v)}`,["Convert capacitance to farads using 1 µF = 10^(-6) F.","Multiply capacitance by voltage: Q = C * V.","Because 10^(-6) F × V = 10^(-6) C = µC, the number matches µC directly."],"Use Q = C * V; µF × V directly produces µC (10^(-6) C).",`C = ${c} * 10^(-6)`);},
 capE:k=>{const c=[1,2,4.7,10,22][k],v=[2,3,5,9,12][k];return model(`A capacitor of ${c} µF is at ${v} V. Calculate energy in µJ.`,0.5*c*v*v,"µJ","E = 0.5 * C * V^2",`E_uJ = (0.5 * (${c} * 10^(-6)) * ${v}^2) * 10^(6) = ${fmt(0.5*c*v*v)}`,["Square the capacitor voltage V^2 FIRST.","Multiply by 0.5 and by capacitance C in farads (× 10^(-6)).","Because C is in 10^(-6) F, the resulting energy is directly in 10^(-6) J (µJ)."],"Square V first, then multiply by 0.5 and C (µF × V² gives µJ).",`C = ${c} * 10^(-6)`);},
 rcTau:k=>{const r=[1,2.2,4.7,10,22][k],c=[1,4.7,10,2.2,0.47][k];return model(`A first-order RC circuit uses R=${r} kΩ and C=${c} µF. Find τ in ms.`,r*c,"ms","tau = R * C",`tau_ms = ((${r} * 10^(3)) * (${c} * 10^(-6))) * 10^(3) = ${fmt(r*c)}`,["Convert kilo-ohms (10^3 Ω) and microfarads (10^(-6) F) to base SI units.","Multiply R × C: notice 10^(3) × 10^(-6) = 10^(-3) seconds = milliseconds!","Report τ in milliseconds (ms)."],"Notice the engineering shortcut: 10^3 Ω × 10^(-6) F = 10^(-3) s = ms!",`R = ${r} * 10^(3), C = ${c} * 10^(-6)`);},
 rc63:k=>{const vf=[1,2,3.3,5,12][k];return model(`An initially discharged RC node steps toward ${vf} V. Approximately what voltage (V) has it reached after one time constant?`,vf*(1-Math.exp(-1)),"V","V(tau) = V_final * (1 - exp(-1))",`V(tau) = ${vf} * (1 - exp(-1)) = ${fmt(vf*(1-Math.exp(-1)))}`,["A charging capacitor starting from 0 V reaches fraction (1 − e^(-t/τ)) of V_final.","At t = 1τ, evaluate (1 − e^(-1)) ≈ 1 − 0.36788 = 0.63212 (63.2%).","Multiply V_final by 0.63212 to get the voltage in volts."],"After 1 time constant, voltage reaches 63.21% of the final voltage.");},
 rlTau:k=>{const l=[10,20,50,100,220][k],r=[10,20,25,50,100][k];return model(`An RL circuit has L=${l} mH and R=${r} Ω. Find τ in milliseconds.`,l/r,"ms","tau = L / R",`tau_ms = ((${l} * 10^(-3)) / ${r}) * 10^(3) = ${fmt(l/r)}`,["Convert inductance L from mH to H using 10^(-3).","Divide inductance L by resistance R: τ = L / R.","Because numerator has 10^(-3), the result in seconds has 10^(-3) = milliseconds!"],"τ = L / R; mH (10^(-3) H) divided by Ω gives ms (10^(-3) s).",`L = ${l} * 10^(-3)`);},
 inductorV:k=>{const l=[1,2,5,10,20][k],di=[2,3,4,1.5,0.8][k],dt=[1,2,2,5,4][k];return model(`Inductor L=${l} mH experiences a current increase of ${di} A in ${dt} ms. Find the induced voltage magnitude in V.`,l*di/dt,"V","V_L = L * (Delta_I / Delta_t)",`V_L = (${l} * 10^(-3)) * (${di} / (${dt} * 10^(-3))) = ${fmt(l*di/dt)}`,["Convert L to henries (× 10^(-3)) and Δt to seconds (× 10^(-3)).","Compute slew rate ΔI / Δt in A/s, then multiply by L.","Notice the 10^(-3) in L and Δt cancel cleanly to yield Volts!"],"10^(-3) in mH and 10^(-3) in ms cancel cleanly in V_L = L · (ΔI/Δt)!",`L = ${l} * 10^(-3), Delta_t = ${dt} * 10^(-3)`);},
 rcFc:k=>{const r=[1,2.2,4.7,10,22][k],c=[0.1,0.47,1,2.2,4.7][k];const f=1/(2*Math.PI*r*1e3*c*1e-6);return model(`A first-order RC low-pass uses R=${r} kΩ and C=${c} µF. Find cutoff frequency in Hz.`,f,"Hz","f_c = 1 / (2 * π * R * C)",`f_c = 1 / (2 * π * (${r} * 10^(3)) * (${c} * 10^(-6))) = ${fmt(f)}`,["Convert R from kΩ (× 10^3 Ω) and C from µF (× 10^(-6) F) to base SI units.","Compute RC in seconds (which gives ms × 10^(-3) s).","Divide 1 by (2π × R × C) to obtain cutoff frequency in hertz (Hz)."],"Convert kΩ to 10^3 Ω and µF to 10^(-6) F before computing 1/(2πRC).",`R = ${r} * 10^(3), C = ${c} * 10^(-6)`);},
 lcF0:k=>{const l=[1,2,5,10,20][k],c=[0.1,0.22,0.47,1,2.2][k];const f=1/(2*Math.PI*Math.sqrt(l*1e-3*c*1e-6));return model(`Ideal LC network: L=${l} mH and C=${c} µF. Find resonance frequency in Hz.`,f,"Hz","f_0 = 1 / (2 * π * √(L * C))",`f_0 = 1 / (2 * π * √((${l} * 10^(-3)) * (${c} * 10^(-6)))) = ${fmt(f)}`,["Convert L to henries (× 10^(-3)) and C to farads (× 10^(-6)).","Multiply L × C (power of ten is 10^(-9)), then take the square root √(L×C).","Divide 1 by (2π × √(L×C)) to find natural resonance frequency in Hz."],"Always convert mH (10^(-3)) and µF (10^(-6)) to base SI units inside √(L*C).",`L = ${l} * 10^(-3), C = ${c} * 10^(-6)`);},
 transformer:k=>{const vp=[12,24,48,120,230][k],np=[100,200,400,1000,1000][k],ns=[50,100,200,200,500][k];return model(`An ideal transformer has ${np} primary turns, ${ns} secondary turns and ${vp} V primary RMS. Find secondary RMS voltage in V.`,vp*ns/np,"V","V_s = V_p * (N_s / N_p)",`V_s = ${vp} * (${ns} / ${np}) = ${fmt(vp*ns/np)}`,["Identify primary turns N_p (input side) and secondary turns N_s (output side).","Because voltage scales linearly with turns, multiply V_p by (N_s / N_p).","Verify: if N_s < N_p it steps voltage DOWN; if N_s > N_p it steps UP."],"Multiply primary voltage by N_secondary / N_primary.");},
 threephase:k=>{const v=[208,400,480,240,415][k],i=[5,10,15,20,8][k],pf=[0.8,0.9,0.85,1,0.75][k];let pw=Math.sqrt(3)*v*i*pf,pkw=pw*1e-3;return model(`Balanced three-phase load: ${v} V line-line, ${i} A line current, PF=${pf}. Find real power in kW.`,pkw,"kW","P_kW = (√(3) * V_LL * I_L * PF) * 10^(-3)",`P_kW = (√(3) * ${v} * ${i} * ${pf}) * 10^(-3) = ${fmt(pkw)}`,["Confirm voltage is line-to-line (V_LL) and current is line current (I_L).","Multiply √3 × V_LL × I_L × PF to get real power in watts (W).","Multiply watts by 10^(-3) (divide by 1000) to convert to kilowatts (kW)."],"Use √3 * V_LL * I_L * PF for watts, then × 10^(-3) for kW.",`1 kW = 10^(3) W`);},
 ledR:k=>{const vs=[3.3,5,9,12,15][k],vf=[1.8,2,2.2,2,3][k],i=[5,10,15,20,12][k];return model(`LED forward drop ${vf} V on a ${vs} V supply; target current ${i} mA. Find ideal series resistance in Ω.`,(vs-vf)/(i*1e-3),"Ω","R = (V_s - V_f) / I_LED",`R = (${vs} - ${vf}) / (${i} * 10^(-3)) = ${fmt((vs-vf)/(i*1e-3))}`,["Subtract the LED forward drop V_f from supply voltage V_s to find resistor voltage V_R.","Convert target LED current from mA to amperes using × 10^(-3).","Apply Ohm's law R = V_R / I_LED to calculate the limiting resistor in Ω."],"Only (V_s - V_f) sits across the resistor; convert mA to 10^(-3) A.",`I_LED = ${i} * 10^(-3)`);},
 clockPeriod:k=>{const f=[1,10,25,50,100][k];const ts=1/(f*1e6),tns=ts*1e9;return model(`A digital clock runs at ${f} MHz. Find full clock period in ns.`,tns,"ns","T = 1 / f",`T_ns = (1 / (${f} * 10^(6))) * 10^(9) = ${fmt(tns)}`,["Convert clock frequency from MHz to Hz: multiply by 10^(6).","Take the reciprocal T = 1 / f to get period in seconds.","Multiply by 10^(9) (since 1 ns = 10^(-9) s) to express in nanoseconds (ns)."],"1 / (10^6 Hz) = 10^(-6) s = 1000 ns, so T_ns = 1000 / f_MHz.",`f = ${f} * 10^(6)`);},
 railPower:k=>{const v=[0.8,0.9,1.0,1.2,1.8][k],i=[4,6,10,2.5,1.5][k];return model(`During a workload, CPU rail voltage is ${v} V and rail current is ${i} A. Find electrical rail power in W.`,v*i,"W","P_rail = V_rail * I_rail",`P_rail = ${v} * ${i} = ${fmt(v*i)}`,["Verify both V_rail and I_rail come from the exact same steady/transient workload window.","Multiply rail voltage (V) by rail current (A).","Verify units: Volts × Amperes = Watts."],"Multiply rail voltage by rail current for the same workload.");},
 shunt:k=>{const v=[5,12,25,40,55][k],r=[1,2,5,4,5][k];return model(`A current-sense shunt of ${r} mΩ has a measured differential voltage of ${v} mV. Find current in A.`,v/r,"A","I = V_sense / R_shunt",`I = (${v} * 10^(-3)) / (${r} * 10^(-3)) = ${fmt(v/r)}`,["Convert differential voltage V_sense to volts (× 10^(-3)) and shunt to ohms (× 10^(-3)).","Apply Ohm's law I = V_sense / R_shunt.","Notice the 10^(-3) factors in numerator and denominator cancel cleanly to give Amperes!"],"mV / mΩ = (10^(-3) V) / (10^(-3) Ω) = A directly!",`V_sense = ${v} * 10^(-3), R_shunt = ${r} * 10^(-3)`);},
 scopeSamples:k=>{const fs=[100,250,500,1000,2000][k],f=[5,10,25,50,100][k];return model(`A scope samples at ${fs} MS/s while viewing ${f} MHz signal. How many samples per full period?`,fs/f,"samples/cycle","N = f_sample / f_signal",`N = (${fs} * 10^(6)) / (${f} * 10^(6)) = ${fmt(fs/f)}`,["Convert both sample rate (MS/s = 10^6 S/s) and signal frequency (MHz = 10^6 Hz).","Divide sample rate by signal frequency (10^6 cancels out).","Check: aim for ≥ 10–20 samples/cycle so edges aren't missed."],"Both are in mega-units (10^6), so divide f_sample / f_signal directly.");},
 timeDiv:k=>{const div=[2,5,10,20,50][k];return model(`Scope horizontal scale is ${div} ns/div across 10 horizontal divisions. Find full displayed time window in ns.`,div*10,"ns","T_window = t_div * N_div",`T_window = ((${div} * 10^(-9)) * 10) * 10^(9) = ${div*10}`,["Read the horizontal timebase setting (ns per division).","Most oscilloscopes display 10 horizontal grid divisions across the screen.","Multiply time-per-division by 10 divisions."],"Full capture window = 10 divisions × time/div.");},
 duty:k=>{const high=[2,3,4,6,8][k],period=[10,10,8,12,10][k];return model(`A digital pulse stays high ${high} ns in a ${period} ns period. Find duty cycle as a percent.`,100*high/period,"%","D = 100 * (t_high / T)",`D = 100 * (${high} * 10^(-9) / (${period} * 10^(-9))) = ${fmt(100*high/period)}`,["Confirm t_high and full period T have identical units (both ns = 10^(-9) s).","Divide pulse high time by total period T.","Multiply the fraction by 100 to express as percent (%)."],"Divide HIGH duration by full period T, then multiply by 100.");},
 uartTime:k=>{const bytes=[10,25,50,100,200][k],baud=[9600,19200,38400,57600,115200][k];let ts=bytes*10/baud,tms=1000*ts;return model(`UART at ${baud} baud sends ${bytes} bytes with 8N1 framing. Find minimum wire time in ms.`,tms,"ms","t = (N_bytes * 10) / Baud",`t_ms = ((${bytes} * 10) / ${baud}) * 10^(3) = ${fmt(tms)}`,["Under 8N1 framing, each byte requires 1 start + 8 data + 1 stop = 10 bits.","Multiply byte count by 10 bits/byte to get total bits on the wire.","Divide total bits by baud (bits/s) for seconds, then multiply by 10^(3) for ms."],"Count 10 bits per byte (8N1), divide by baud, then convert s to ms (× 10^3).",`t_ms = t * 10^(3)`);},
 spiTime:k=>{const bytes=[4,8,16,32,64][k],mhz=[1,2,4,8,16][k];let ts=8*bytes/(mhz*1e6),tus=ts*1e6;return model(`SPI transfers ${bytes} bytes at ${mhz} MHz clock, one bit per clock. Find ideal transfer time in µs.`,tus,"µs","t = (8 * N_bytes) / f_SCLK",`t_us = ((8 * ${bytes}) / (${mhz} * 10^(6))) * 10^(6) = ${fmt(tus)}`,["SPI sends 8 bits per byte continuously (no start/stop bits).","Convert SCLK frequency from MHz to Hz using × 10^(6).","Divide total bits by f_SCLK for seconds, then multiply by 10^(6) for µs."],"8 bits/byte divided by MHz (10^6 Hz) yields µs (10^(-6) s) directly!",`f_SCLK = ${mhz} * 10^(6)`);},
 testThroughput:k=>{const s=[20,30,45,60,90][k];return model(`A deterministic automated test takes ${s} seconds per board, no pauses. What is ideal maximum throughput in boards/hour?`,3600/s,"boards/hour","N_hour = 3600 / t_board",`N_hour = 3600 / ${s} = ${fmt(3600/s)}`,["Convert 1 hour into seconds: 60 min × 60 s = 3,600 seconds/hour.","Divide 3,600 seconds by the test duration per board.","Remember real production throughput is lower after operator load/unload & retests."],"1 hour = 3600 s; divide 3600 by seconds per board.");},
 assertMargin:k=>{const limit=[5,10,20,50,100][k],meas=[4,8,17,45,92][k];return model(`A maximum accepted current is ${limit} A; measurement is ${meas} A. Calculate margin below the maximum as percent of the limit.`,100*(limit-meas)/limit,"%","Margin_pct = 100 * ((Limit - Measured) / Limit)",`Margin_pct = 100 * ((${limit} - ${meas}) / ${limit}) = ${fmt(100*(limit-meas)/limit)}`,["Subtract measured current from the upper specification limit (Limit − Measured).","Divide that headroom by the specification Limit (not the measured value).","Multiply by 100 to report percent margin."],"Margin % = 100 × (Limit − Measured) / Limit.");},
 logRate:k=>{const fail=[1,2,3,5,8][k],n=[50,80,100,125,200][k];return model(`Raw qualification logs contain ${fail} failing runs among ${n} total runs. What is the observed failure percentage?`,100*fail/n,"%","Failure_pct = 100 * (N_fail / N_total)",`Failure_pct = 100 * (${fail} / ${n}) = ${fmt(100*fail/n)}`,["Count every raw failing run (never rely on a buggy summary script).","Divide N_fail by total runs N_total.","Multiply by 100 to express the observed failure rate as a percentage."],"Divide raw failures by total runs, then multiply by 100.");},
 logDuration:k=>{const count=[50,100,150,200,500][k],s=[12,15,20,24,30][k];return model(`A Linux test loop runs ${count} iterations at ${s} seconds each. Find ideal elapsed minutes.`,count*s/60,"min","t_min = (N * t_sec) / 60",`t_min = (${count} * ${s}) / 60 = ${fmt(count*s/60)}`,["Multiply number of loop iterations by seconds per iteration to get total seconds.","Divide total seconds by 60 seconds/minute.","Note: add chamber soak & thermal ramp delays in real TVAC schedules."],"Multiply iterations by seconds each, then divide by 60.");},
 wavelength:k=>{const f=[0.9,1.575,2.4,5,10][k];return model(`An RF signal travels in free space at ${f} GHz. Approximate its wavelength in meters using c≈3×10^8 m/s.`,(3e8)/(f*1e9),"m","lambda = c / f",`lambda = (3 * 10^(8)) / (${f} * 10^(9)) = ${fmt((3e8)/(f*1e9))}`,["Convert frequency from GHz to Hz: multiply by 10^(9).","Use free-space speed of light c ≈ 3 × 10^(8) m/s.","Divide c by f (notice 10^8 / 10^9 = 10^(-1) = 0.1)."],"Convert GHz to 10^9 Hz before dividing c = 3 × 10^8 m/s by f.",`f = ${f} * 10^(9)`);},
 powerDb:k=>{const ratio=[2,4,10,20,100][k];return model(`RF output power is ${ratio} times the input power. Find gain in dB (power ratio).`,10*Math.log10(ratio),"dB","G_dB = 10 * log10(P_out / P_in)",`G_dB = 10 * log10(${ratio}) = ${fmt(10*Math.log10(ratio))}`,["For a POWER ratio, always use factor 10 in front of log₁₀ (voltage uses 20).","Take the base-10 logarithm of P_out / P_in.","Multiply by 10 (quick check: 2× ≈ +3 dB, 10× = +10 dB, 100× = +20 dB)."],"Use 10 × log₁₀(ratio) for power ratios.");},
 marginPct:k=>{const limit=[10,20,30,40,50][k],meas=[9,17,27,36,45][k];return model(`A flight-board upper acceptance limit is ${limit} units; a measured value is ${meas} in the same units. Find percent margin below the limit.`,100*(limit-meas)/limit,"%","Margin_pct = 100 * ((Limit - Measured) / Limit)",`Margin_pct = 100 * ((${limit} - ${meas}) / ${limit}) = ${fmt(100*(limit-meas)/limit)}`,["Subtract the measured value from the upper limit to find raw headroom.","Divide headroom by the upper acceptance limit.","Multiply by 100 for percentage; verify instrument uncertainty separately."],"Headroom divided by limit × 100.");},
 yieldPct:k=>{const total=[20,40,50,100,200][k],pass=[19,36,48,95,194][k];return model(`A production lot has ${pass} boards pass acceptance out of ${total} tested. Find the observed first-pass yield percentage.`,100*pass/total,"%","FPY_pct = 100 * (N_pass / N_tested)",`FPY_pct = 100 * (${pass} / ${total}) = ${fmt(100*pass/total)}`,["Count only boards that passed on the FIRST test pass (before rework/retest).","Divide first-pass boards by total boards tested.","Multiply by 100 for First-Pass Yield (FPY) percentage."],"FPY % = 100 × (first-time passes / total tested).");}
};

// Engineering-notation representative formula per topic+skill for Foundations, Application & Troubleshooting
const SKILL_EQ={
 "units:0":["1 V = 1 J / 1 C","I = 1 C / 1 s = 1 A"],
 "units:1":["X_base = X_milli * 10^(-3)","25 mA = 25 * 10^(-3) = 0.025"],
 "units:2":["X_base = X_micro * 10^(-6)","4.7 uF = 4.7 * 10^(-6)"],
 "units:3":["X_base = X_mega * 10^(6)","4.7 MOhm = 4.7 * 10^(6)"],
 "units:4":["Margin_safe = Limit_max - (Measured + Uncertainty)","Margin = 5.10 - (5.05 + 0.02) = 0.03"],
 "ohm:0":["Delta_V = Delta_U / q","V_rail = 5.0 - 0.0 = 5.0"],
 "ohm:1":["I = Q / t","I = 25 / (4.7 * 10^(6)) = 5.32e-6"],
 "ohm:2":["R = V / I","R = 3.3 / (10 * 10^(-3)) = 330"],
 "ohm:3":["I = V / R","I = 3.3 / 330 = 10e-3"],
 "ohm:4":["V_AB = V_A - V_B","V_BA = 0 - 5.0 = -5.0"],
 "power:0":["P = V * I","P = 3.3 * 0.8 = 2.64"],
 "power:1":["E = P * t","E = 6 * 8 = 48"],
 "power:2":["P = I^2 * R","P = (50e-3)^2 * 100 = 0.25"],
 "power:3":["P_actual <= 0.5 * P_rated","0.18 <= 0.5 * 0.50"],
 "power:4":["I_limit = 1.25 * I_expected","I_limit = 1.25 * (200 * 10^(-3)) = 250e-3"],
 "series:0":["I_T = I_1 = I_2","I = 5 / (1000 + 1000) = 2.5e-3"],
 "series:1":["R_T = R_1 + R_2 + R_3","R_T = 100 + 150 + 50 = 300"],
 "series:2":["V_out = V_in * (R_2 / (R_1 + R_2))","V_out = 5 * (1000 / 3200) = 1.5625"],
 "series:3":["V_source = V_1 + V_2 + V_3","V_3 = 12 - 3 - 4 = 5"],
 "series:4":["R_2eff = (R_2 * R_load) / (R_2 + R_load)","R_2eff = (1e6 * 1e6) / (1e6 + 1e6) = 500e3"],
 "parallel:0":["V_S = V_1 = V_2 = V_3 = V_4","V_branch = 12"],
 "parallel:1":["R_eq = (R_1 * R_2) / (R_1 + R_2)","R_eq = (100 * 100) / (100 + 100) = 50"],
 "parallel:2":["I_n = V_S / R_n","I_1 = 9 / 300 = 30e-3"],
 "parallel:3":["I_T = I_1 + I_2 + I_3 + I_4","I_T = 10e-3 + 15e-3 + 25e-3 = 50e-3"],
 "parallel:4":["I_short = V_rail / R_short","I_short = 5 / 0.1 = 50"],
 "kcl-kvl:0":["I_in = I_1 + I_2 + I_3","I_3 = 15e-3 - 5e-3 - 4e-3 = 6e-3"],
 "kcl-kvl:1":["V_source - V_1 - V_2 - V_3 = 0","V_3 = 15 - 4 - 5 = 6"],
 "kcl-kvl:2":["V_node_ref = V_node - V_ground","V_err = 3.30 - (-0.15) = 3.45"],
 "kcl-kvl:3":["(V_A - V_s) / R_1 + V_A / R_2 + V_A / R_3 = 0","V_A * (1/R_1 + 1/R_2 + 1/R_3) = V_s / R_1"],
 "kcl-kvl:4":["V_s - I_1 * R_1 - (I_1 - I_2) * R_shared = 0","V_shared = (I_1 - I_2) * R_shared"],
 "thevenin:0":["V_load = V_th * (R_load / (R_th + R_load))","V_th = 12 * (2200 / 4400) = 6.0"],
 "thevenin:1":["I_N = V_th / R_th","I_N = 5 / 250 = 20e-3"],
 "thevenin:2":["R_th = (V_oc - V_loaded) / I_load","R_th = (12.6 - 12.1) / 5 = 0.1"],
 "thevenin:3":["R_th = (R_1 * R_2) / (R_1 + R_2)","R_th = (1000 * 2000) / (1000 + 2000) = 666.7"],
 "thevenin:4":["V_total = V_source1 + V_source2","V_total = 2.0 + (-0.5) = 1.5"],
 "ac:0":["f = 1 / T","f = 1 / (20 * 10^(-9)) = 50e6"],
 "ac:1":["T = 1 / f","T = 1 / 50 = 20e-3"],
 "ac:2":["V_rms = V_peak / √(2)","V_rms = 10 / √(2) = 7.071"],
 "ac:3":["theta = (Delta_t / T) * 360","theta = (2.5e-9 / 10e-9) * 360 = 90"],
 "ac:4":["Z_mag = √(R^2 + X^2)","Z_mag = √(30^2 + 40^2) = 50"],
 "capacitors:0":["Q = C * V","Q = (4.7 * 10^(-6)) * 5 = 23.5e-6"],
 "capacitors:1":["I = C * (dV / dt)","dV_dt = (100 * 10^(-3)) / (100 * 10^(-6)) = 1000"],
 "capacitors:2":["E = 0.5 * C * V^2","E = 0.5 * (10 * 10^(-6)) * 9^2 = 405e-6"],
 "capacitors:3":["Delta_V = (I_step * Delta_t) / C_local","Delta_V = (2 * 5e-9) / 100e-9 = 0.10"],
 "capacitors:4":["P_ESR = I_ripple^2 * R_ESR","P_ESR = 1^2 * 0.2 = 0.2"],
 "rc:0":["tau = R * C","tau = (4.7 * 10^(3)) * (10 * 10^(-6)) = 47e-3"],
 "rc:1":["V(t) = V_final * (1 - exp(-t / tau))","V(tau) = 3.3 * (1 - exp(-1)) = 2.086"],
 "rc:2":["V(t) = V_0 * exp(-t / tau)","V(tau) = 12 * exp(-1) = 4.415"],
 "rc:3":["t_settle = 5 * tau","t_settle = 5 * (10 * 10^(-3)) = 50e-3"],
 "rc:4":["R_eq = (R_1 * R_DMM) / (R_1 + R_DMM)","R_eq = (22e6 * 10e6) / (22e6 + 10e6) = 6.875e6"],
 "inductors:0":["V_L = L * (Delta_I / Delta_t)","V_L = (5 * 10^(-3)) * (2 / (1 * 10^(-3))) = 10"],
 "inductors:1":["tau = L / R","tau = (100 * 10^(-3)) / 50 = 2e-3"],
 "inductors:2":["E = 0.5 * L * I^2","E = 0.5 * (10 * 10^(-3)) * 2^2 = 20e-3"],
 "inductors:3":["V_clamp = V_supply + V_diode","V_clamp = 12 + 0.7 = 12.7"],
 "inductors:4":["V_bounce = L_par * (Delta_I / Delta_t)","V_bounce = (1 * 10^(-9)) * (12 / (4 * 10^(-9))) = 3.0"],
 "filters:0":["|H(f)| = 1 / √(1 + (f / f_c)^2)","|H(10 * f_c)| = 1 / √(1 + 100) = 0.0995"],
 "filters:1":["|H(f)| = (f / f_c) / √(1 + (f / f_c)^2)","|H(0)| = 0"],
 "filters:2":["f_c = 1 / (2 * pi * R * C)","f_c = 1 / (2 * pi * (1 * 10^(3)) * (0.1 * 10^(-6))) = 1591.5"],
 "filters:3":["f_0 = 1 / (2 * pi * √(L * C))","f_0 = 1 / (2 * pi * √((1 * 10^(-3)) * (0.1 * 10^(-6)))) = 15915"],
 "filters:4":["Q = (1 / R) * √(L / C)","zeta = (R / 2) * √(C / L)"],
 "magnetics:0":["V_s / V_p = N_s / N_p","V_s = 24 * (100 / 200) = 12"],
 "magnetics:1":["R_iso >= 100 * 10^(6)","I_leak = V_cm / R_iso"],
 "magnetics:2":["B_max = (V_p * t_on) / (N_p * A_core)","I_sat >> V_p / (2 * pi * f * L)"],
 "magnetics:3":["V_LL = √(3) * V_LN","V_LL = √(3) * 120 = 207.8"],
 "magnetics:4":["P = √(3) * V_LL * I_L * PF","P = √(3) * 400 * 10 * 0.9 = 6235"],
 "components:0":["V_A - V_K >= V_f => I_diode > 0","V_drop = 0.7"],
 "components:1":["R = (V_s - V_f) / I_LED","R = (5 - 2) / (10 * 10^(-3)) = 300"],
 "components:2":["P_cond = I_D^2 * R_DSon","P_cond = 5^2 * (20 * 10^(-3)) = 0.5"],
 "components:3":["V_OH >= V_IH","V_IH = 0.7 * 3.3 = 2.31"],
 "components:4":["I_pull = V_CC / R_pullup","I_pull = 3.3 / (4.7 * 10^(3)) = 0.702e-3"],
 "power-rails:0":["P_in = P_out / eta","I_in = (1.0 * 4.0) / (12 * 0.88) = 0.379"],
 "power-rails:1":["t_release >= max(t_pg, t_pll) + t_margin","t_release = 48e-9 + 20e-9 = 68e-9"],
 "power-rails:2":["Ripple_pct = (V_pp / V_nom) * 100","Ripple_pct = (30e-3 / 1.0) * 100 = 3.0"],
 "power-rails:3":["V_droop = V_baseline - V_min","V_droop = 1.10 - 1.02 = 80e-3"],
 "power-rails:4":["I = V_sense / R_shunt","I = (55 * 10^(-3)) / (5 * 10^(-3)) = 11"],
 "schematics:0":["V_net1 = V_net5","R_trace < 0.2"],
 "schematics:1":["V_meas = V_sig - V_gnd","V_err = I_ret * R_gnd"],
 "schematics:2":["R_rail_GND >= R_min","I_limit = 1.2 * I_idle"],
 "schematics:3":["t_CLK_valid < t_RESET_release","f_osc = 25e6"],
 "schematics:4":["Isolate(DUT, Rack) = Swap(A, B, A)","KGB_in_slot + KGS_check"],
 "instruments:0":["f_knee = 0.5 / t_rise","f_knee = 0.5 / 0.35e-9 = 1.43e9"],
 "instruments:1":["N_samples = f_sample / f_signal","N = (500 * 10^(6)) / (25 * 10^(6)) = 20"],
 "instruments:2":["T_window = t_div * 10","t_pre = 0.20 * T_window"],
 "instruments:3":["V_shown = V_true / 10","C_probe < 1 pF"],
 "instruments:4":["V_DMM = (1 / T_int) * V_avg","V_scope_min < V_DMM"],
 "timing:0":["T = 1 / f","T = 1 / (50 * 10^(6)) = 20e-9"],
 "timing:1":["D = 100 * (t_high / T)","D = 100 * (4e-9 / 8e-9) = 50"],
 "timing:2":["T_min >= t_CQ_max + t_logic_max + t_su + t_skew","T_min = (950 + 590 + 300 + 750) * 10^(-12) = 2.59e-9"],
 "timing:3":["t_CQ_min + t_logic_min >= t_h + t_skew","Slack_hold = 330e-12 - 1150e-12 = -820e-12"],
 "timing:4":["t_release = max(t_pg, t_pll) + t_margin","t_release = (48 + 20) * 10^(-9) = 68e-9"],
 "buses:0":["t_uart = (N_bytes * 10) / Baud","t_uart = (100 * 10) / 115200 = 8.68e-3"],
 "buses:1":["t_spi = (8 * N_bytes) / f_SCLK","t_spi = (8 * 32) / (8 * 10^(6)) = 32e-6"],
 "buses:2":["t_rise = 0.8473 * R_pullup * C_bus","t_rise = 0.8473 * (2.2 * 10^(3)) * (100 * 10^(-12)) = 186e-9"],
 "buses:3":["R_CAN_eq = (120 * 120) / (120 + 120)","R_CAN_eq = 60"],
 "buses:4":["t_bit = 1 / f_baud","t_bit = 1 / 115200 = 8.68e-6"],
 "python-scpi:0":["N_hour = 3600 / t_board","N_hour = 3600 / 30 = 120"],
 "python-scpi:1":["t_timeout > t_sweep + t_settle","timeout = 5000e-3"],
 "python-scpi:2":["Margin_pct = 100 * ((Limit - Measured) / Limit)","Margin_pct = 100 * ((10 - 8) / 10) = 20"],
 "python-scpi:3":["Fail_rate = 100 * (N_fail / N_total)","Rate = 100 * (2 / 100) = 2"],
 "python-scpi:4":["Pass_rate = 100 * (N_valid / N_total)","Try_except => Safe_power_off"],
 "linux:0":["t_min = (N_runs * t_sec) / 60","t_min = (100 * 15) / 60 = 25"],
 "linux:1":["Fail_pct = 100 * (N_fail / N_total)","Fail_pct = 100 * (2 / 80) = 2.5"],
 "linux:2":["Exit_code = 0 | Exit_code != 0","Exit_code != 0 => Abort"],
 "linux:3":["Hash_ok = (sha256_actual == sha256_ref)","sha256_actual = sha256_ref"],
 "linux:4":["Latch_fail = (N_fail > 0) | (N_pass == 0)","(N_pass = 0) | (N_fail = 2) => NO_GO"],
 "rf:0":["P_dBm = 10 * log10(P_mW / 1)","P_0dBm = 1e-3"],
 "rf:1":["S21_dB = 10 * log10(P_out / P_in)","Loss_dB = -S21_dB"],
 "rf:2":["Gamma = (Z_L - Z_0) / (Z_L + Z_0)","S11_dB = 20 * log10(|Gamma|)"],
 "rf:3":["G_dB = 10 * log10(P_out / P_in)","G_dB = 10 * log10(20) = 13.01"],
 "rf:4":["lambda = c / f","lambda = (3 * 10^(8)) / (2.4 * 10^(9)) = 0.125"],
 "qualification:0":["Margin_pct = 100 * ((Limit - Measured) / Limit)","Margin_pct = 100 * ((10 - 9) / 10) = 10"],
 "qualification:1":["V_and_V = Verify(Spec) + Validate(Mission)","HITL_pass => Flight_ready"],
 "qualification:2":["Q_rad = epsilon * sigma * A * (T_hw^4 - T_wall^4)","Vacuum => Zero_convection"],
 "qualification:3":["Trace_ok = HW_rev + Serial + FW_hash + Cal","Any_mismatch => Invalid"],
 "qualification:4":["FPY_pct = 100 * (N_pass / N_tested)","FPY_pct = 100 * (19 / 20) = 95"]
};

const questions=[];
for(const topic of window.AVIONICS_TOPICS){
 if(topic.skills.length!==5||topic.cases.length!==5||topic.calc.length!==2)throw Error("Invalid curriculum dimensions: "+topic.id);
 topic.skills.forEach((s,i)=>{
  const [term,definition,importance,example]=s;
  const eqPair=SKILL_EQ[topic.id+":"+i]||["V = I * R","V = 5.0"];
  questions.push({id:topic.id+"-F"+(i+1),topic:topic.id,level:"Foundations",skillIndex:i,skillName:term,question:`What does “${term}” mean in electrical engineering, and how would you explain it to a beginner?`,steps:[`Define it: ${definition}`,`Explain why: ${importance}`,`Connect it to work: ${example}`],hint:"Define the physical concept in plain words before naming a tool.",formula:eqPair[0],sub:eqPair[1]});
  questions.push({id:topic.id+"-A"+(i+1),topic:topic.id,level:"Application",skillIndex:i,skillName:term,question:`You are validating avionics hardware. Why is “${term}” important, and what real test would demonstrate it?`,steps:[`Start with the principle: ${definition}`,`Explain the engineering risk: ${importance}`,`Propose an observable test: ${example}`],hint:"Explain both the engineering consequence and one concrete lab check.",formula:eqPair[0],sub:eqPair[1]});
 });
 topic.calc.forEach((name,j)=>{
  if(!A[name])throw Error("Missing calculation generator: "+name);
  for(let k=0;k<5;k++){
   const n=A[name](k);
   if(!Number.isFinite(n.answer))throw Error("Non-finite answer: "+name);
   questions.push({id:topic.id+"-C"+(j*5+k+1),topic:topic.id,level:"Calculation",calcFamily:name,variantIndex:k,question:n.prompt,steps:n.steps,hint:n.hint,formula:n.formula,sub:n.sub,unitConv:n.unitConv,expected:n.answer,unit:n.unit});
  }
 });
 topic.cases.forEach((s,i)=>{
  const [symptom,action,reason,verify]=s;
  const eqPair=SKILL_EQ[topic.id+":"+i]||["V = I * R","V = 5.0"];
  questions.push({id:topic.id+"-D"+(i*2+1),topic:topic.id,level:"Troubleshooting",skillIndex:i,question:`A test engineer reports: “${symptom}” What is your safest first diagnostic action?`,steps:[`Observe the symptom without assuming the DUT is defective: ${symptom}`,`First action: ${action}`,`Why this isolates the fault: ${reason}`,`Confirm: ${verify}`],hint:"Safety first; isolate one variable (DUT vs test station vs probe) before changing the hardware.",formula:eqPair[0],sub:eqPair[1]});
  questions.push({id:topic.id+"-D"+(i*2+2),topic:topic.id,level:"Troubleshooting",skillIndex:i,question:`During a fault investigation you find: “${symptom}” What evidence would you collect to confirm your diagnosis?`,steps:[`Record the initial evidence: ${symptom}`,`Control the experiment: ${action}`,`Reasoning: ${reason}`,`Collect independent confirmation: ${verify}`],hint:"Describe a measurable comparison (DMM/scope/log) rather than an unsupported guess.",formula:eqPair[0],sub:eqPair[1]});
 });
 const actual=questions.filter(q=>q.topic===topic.id).length;
 if(actual!==30)throw Error("Expected 30, got "+actual+" for "+topic.id);
}

// Progression by cognitive load rather than repeating the same question twice.
// Existing question IDs and numerical answer keys are deliberately preserved.
for(const topic of window.AVIONICS_TOPICS){
 const sub=questions.filter(q=>q.topic===topic.id);
 const F=[
 "Define {term} to someone who has never studied electrical engineering. Identify its measurement unit and one everyday example.",
 "Contrast {term} against a related concept. Explain what physically differs and what remains constant.",
 "Sketch a small safe demonstration for {term}. Name the source, return path, component and measurement nodes.",
 "Predict how a meter or scope would respond if {term} changes. Explain the direction of change before using equations.",
 "Identify a common misconception or limitation of {term}. Describe an observation that could disprove your explanation."
 ];
 const P=[
 "Build a low-voltage demonstration of {term}; list parts, connection order and the expected observation.",
 "Choose an instrument and its configuration to measure {term}. Identify two probe points and one safety check.",
 "Create a pre-power-on checklist for {term}: connector identity, source, GND, polarity and limits.",
 "Plan an experiment to compare predicted and measured behavior of {term}, including uncertainty and specifications.",
 "Design a controlled A/B comparison to distinguish wiring, probe, software and DUT causes when testing {term}."
 ];
 const D=[
 "Select two independent measurements to distinguish an open path from a setup fault in this case.",
 "Compare expected and measured voltage/current at two reference points before changing the DUT.",
 "Build an A/B/A isolation test with a known-good cable, fixture or board and explain what it proves.",
 "Investigate an intermittent recurrence using the same stimulus, timestamps, firmware and raw logs.",
 "Decide what evidence and signed disposition are necessary before a qualification GO decision."
 ];
 for(const q of sub){
  const idx=q.skillIndex||0;
  const sk=topic.skills[idx]||topic.skills[0];
  if(q.level==="Foundations"){
    q.question=F[idx].replace("{term}",sk[0]);q.difficulty=idx+1;
    q.learningObjective=["Name and recognize","Contrast","Sketch","Predict","Challenge assumptions"][idx];
    q.steps=["Start with the exact concept: "+sk[1],"Explain why it changes what we measure: "+sk[2],"Point to the actual component or reading: "+sk[3],"Practice speaking the complete answer without looking."];
  }else if(q.level==="Application"){
    q.question=P[idx].replace("{term}",sk[0])+" Real-world context: "+sk[3];q.difficulty=idx+6;
    q.learningObjective=["Demonstrate","Instrument","Preflight","Validate","Isolate"][idx];
    q.steps=["State the electrical principle: "+sk[1],"Check engineering risk: "+sk[2],"Identify observable evidence: "+sk[3],"Verify safe conditions, units, expected results and uncertainties."];
  }else if(q.level==="Calculation"){
    const n=Number(q.id.match(/-C(\d+)$/)[1]);q.difficulty=10+n;
    q.learningObjective=n<=3?"First numerical steps":n<=6?"Conversions and equivalent models":"Applied calculations and plausibility";
    if(n>=7){q.question+=" Afterward, explain a unit check and a way to verify the result independently.";q.steps=[...q.steps,"Confirm the physical units and compare the magnitude against the circuit's expected behavior."];}
  }else if(q.level==="Troubleshooting"){
    const n=Number(q.id.match(/-D(\d+)$/)[1]);q.difficulty=20+n;
    const c=topic.cases[Math.floor((n-1)/2)],symptom=c[0];
    if(n%2===0){
      q.question=D[Math.floor((n-1)/2)]+" Reported observation: "+symptom;
      q.steps=["Preserve the symptom and conditions: "+symptom,"Record or repeat the first comparison safely: "+c[1],"Identify competing explanations: "+c[2],"Gather independent proof before changing hardware: "+c[3]];
    }else{
      q.question="A technician reports '"+symptom+"'. What is the safest FIRST test or isolation step, and what result would you expect?";
    }
    q.learningObjective=["Observe","Measure","Isolate","Reproduce","Disposition"][Math.floor((n-1)/2)];
  }
 }
 sub.sort((a,b)=>a.difficulty-b.difficulty);
 const offset=questions.findIndex(q=>q.topic===topic.id);
 questions.splice(offset,sub.length,...sub);
}

if(questions.length!==window.AVIONICS_TOPICS.length*30)throw Error("Question-bank count mismatch");
window.AVIONICS_QUESTIONS=questions;
window.AVIONICS_CALC_FAMILIES=A;
})();
