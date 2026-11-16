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
 milli:k=>[
  ()=>model("Convert 8 mA into amperes (A).",8e-3,"A","I_A = I_mA * 10^(-3)","I_A = 8 * 10^(-3) = 0.008",["Identify the prefix: milli (m) means 10^(-3).","Multiply 8 by 10^(-3) (move the decimal 3 places left).","Report 0.008 A."],"Write milli as 10^(-3) before shifting 3 places left.","I_mA = 8 * 10^(-3)"),
  ()=>model("An STM32 NUCLEO-L476RG PA5 green LED (LD2) draws 25 mA during GPIO sink verification. Convert this current to base amperes (A).",25e-3,"A","I_A = I_mA * 10^(-3)","I_A = 25 * 10^(-3) = 0.025",["Recall 1 mA = 10^(-3) A.","Multiply 25 mA by 10^(-3).","Check STM32 pin limit magnitude: 0.025 A (25 mA max per GPIO)."],"Convert milliampere pin current by × 10^(-3).","I_mA = 25 * 10^(-3)"),
  ()=>model("A telemetry differential driver consumes 72 mA during idle polling. Convert 72 mA into base amperes (A).",72e-3,"A","I_A = I_mA * 10^(-3)","I_A = 72 * 10^(-3) = 0.072",["Milli always means 10^(-3) (one thousandth of 1 A).","Shift 72 three decimal places left.","Verify 72 mA = 0.072 A."],"Convert mA to A by multiplying by 10^(-3).","I_mA = 72 * 10^(-3)"),
  ()=>model("Two flight telemetry modules draw 95 mA and 55 mA from one shared +3.3V bus. Convert total rail current into amperes (A).",0.15,"A","I_A = (I_1 + I_2) * 10^(-3)","I_A = (95 + 55) * 10^(-3) = 0.15",["Sum parallel module currents in mA first: 95 + 55 = 150 mA.","Convert 150 mA into base amperes using 10^(-3).","Report 0.15 A total rail load."],"Add branch mA first, then multiply by 10^(-3).","I_tot = 150 * 10^(-3)"),
  ()=>model("A spacecraft PWM actuator averages 420 mA standby minus 120 mA sleep reduction, leaving 300 mA nominal; during fault latching it peaks at 420 mA. Convert peak fault current (420 mA) to amperes (A).",0.42,"A","I_A = I_peak_mA * 10^(-3)","I_A = 420 * 10^(-3) = 0.42",["Select the peak fault current 420 mA as instructed for fuse sizing.","Multiply 420 by 10^(-3) A/mA.","Report 0.42 A in base SI amperes."],"Check unit suffix carefully before fuse selection.","I_peak = 420 * 10^(-3)")
 ][k](),
 micro:k=>[
  ()=>model("Express a 2.2 µF capacitor in farads (F).",2.2e-6,"F","C_F = C_uF * 10^(-6)","C_F = 2.2 * 10^(-6) = 2.2e-6",["Identify the prefix: micro (µ) means 10^(-6).","Multiply 2.2 by 10^(-6) F.","Report 2.2 × 10^(-6) F."],"Replace µ with × 10^(-6).","C_F = 2.2 * 10^(-6)"),
  ()=>model("On a solderless breadboard, you plug a 4.7 µF tantalum bypass cap across the +3.3V and GND power rails. Express its capacitance in farads (F).",4.7e-6,"F","C_F = C_uF * 10^(-6)","C_F = 4.7 * 10^(-6) = 4.7e-6",["Read capacitance value: 4.7 µF.","Multiply by 10^(-6) to convert µF into base SI farads.","Check: bypass caps are small fractions of 1 F."],"Multiply µF by 10^(-6) for F.","C_F = 4.7 * 10^(-6)"),
  ()=>model("An I2C telemetry bus oscillates with an extra 10 µs rise-time guard margin. Express 10 µs in seconds (s).",10e-6,"s","t_s = t_us * 10^(-6)","t_s = 10 * 10^(-6) = 1e-5",["Microseconds (µs) obey the exact 10^(-6) prefix rule.","Multiply 10 by 10^(-6) s.","Notice 10 × 10^(-6) = 10^(-5) s."],"Micro means 10^(-6) for time and capacitance alike.","t_us = 10 * 10^(-6)"),
  ()=>model("Two parallel decoupling capacitors (22 µF + 25 µF bulk) sit on an avionics LDO output. Express the combined 47 µF capacitance in farads (F).",47e-6,"F","C_eq = (C_1 + C_2) * 10^(-6)","C_eq = (22 + 25) * 10^(-6) = 4.7e-5",["Capacitors in parallel add directly: 22 + 25 = 47 µF.","Convert 47 µF to farads by multiplying by 10^(-6).","Report 4.7 × 10^(-5) F."],"Add parallel capacitors, then scale by 10^(-6).","C_uF = 47"),
  ()=>model("During cold-soak TVAC validation, a regulator requires two parallel 47 µF polymer capacitors plus a 6 µF ceramic bypass (total 100 µF). Express total capacitance in farads (F).",100e-6,"F","C_tot = (47 + 47 + 6) * 10^(-6)","C_tot = (47 + 47 + 6) * 10^(-6) = 1e-4",["Sum all parallel capacitances: 47 + 47 + 6 = 100 µF.","Multiply by 10^(-6) to convert to base SI farads.","100 × 10^(-6) F = 1 × 10^(-4) F."],"Keep track of powers of ten carefully (100 × 10^(-6) = 10^(-4)).","C_tot_uF = 100")
 ][k](),
 ohmI:k=>[
  ()=>model("A 330 Ω resistor has 3.3 V across it. Find current in mA.",10,"mA","I = V / R","I_mA = (3.3 / 330) * 10^(3) = 10",["Read V = 3.3 V and R = 330 Ω in base units.","Apply Ohm's law I = V / R = 0.01 A.","Multiply by 10^(3) to report 10 mA."],"Use I = V / R in base units, then × 10^3 for mA.","I_mA = I * 10^(3)"),
  ()=>model("An STM32 PA5 pin outputs 3.3 V across a green LED (V_f = 2.0 V) and a series 260 Ω breadboard resistor, leaving 1.3 V across the resistor. Find LED current in mA.",5,"mA","I = V_R / R","I_mA = ((3.3 - 2.0) / 260) * 10^(3) = 5",["Only V_R = V_GPIO - V_LED = 1.3 V drops across the series resistor.","Divide 1.3 V by 260 Ω = 0.005 A.","Convert to milliamperes: 0.005 × 10^(3) = 5 mA."],"Subtract LED forward voltage before dividing by resistor value.","I_mA = I * 10^(3)"),
  ()=>model("A 2.4 kΩ pull-down resistor on an avionics enable input sees a 12 V rail. Find bleed current in mA.",5,"mA","I = V / R","I_mA = (12 / (2.4 * 10^(3))) * 10^(3) = 5",["Convert 2.4 kΩ = 2400 Ω.","Apply Ohm's law I = 12 / 2400 = 0.005 A.","Multiply by 10^(3) to get 5 mA."],"Convert kΩ to Ω (× 10^3) before dividing.","I_mA = I * 10^(3)"),
  ()=>model("During load bring-up, voltage before a 0.08 Ω PCB sense resistor is 5.04 V and after it is 4.80 V. Calculate load current through the resistor in mA.",3000,"mA","I = (V_1 - V_2) / R_sense","I_mA = ((5.04 - 4.80) / 0.08) * 10^(3) = 3000",["Find potential difference across the resistor: 5.04 - 4.80 = 0.24 V.","Divide ΔV by R_sense: 0.24 / 0.08 = 3.0 A.","Convert 3.0 A into mA: 3000 mA."],"Voltage is potential DIFFERENCE between both ends of the resistor.","I_mA = I * 10^(3)"),
  ()=>model("A 5.0 V instrumentation bus drives a 180 Ω reference resistor whose ground return bounces up by +1.4 V due to a faulty alligator lead, leaving 3.6 V across the resistor. Find degraded resistor current in mA.",20,"mA","I = (V_bus - V_gnd) / R","I_mA = ((5.0 - 1.4) / 180) * 10^(3) = 20",["Account for the lifted ground return: actual V_R = 5.0 - 1.4 = 3.6 V.","Divide 3.6 V by 180 Ω = 0.02 A.","Report 20 mA."],"Never assume ground is 0 V during fault analysis—take V_high - V_low.","I_mA = I * 10^(3)")
 ][k](),
 ohmR:k=>[
  ()=>model("A branch has 5 V and should draw 10 mA. What resistance in Ω gives that current?",500,"Ω","R = V / I","R = 5 / (10 * 10^(-3)) = 500",["Convert 10 mA to 0.01 A (× 10^(-3)).","Compute R = V / I = 5 / 0.01.","Select 500 Ω."],"Convert mA to A before dividing.","I = 10 * 10^(-3)"),
  ()=>model("You need an STM32 NUCLEO-L476RG 3.3 V GPIO pin to source exactly 3 mA into a comparator input referenced to 0 V. What series resistor in Ω achieves this?",1100,"Ω","R = V / I","R = 3.3 / (3 * 10^(-3)) = 1100",["Convert target 3 mA to 0.003 A.","Compute R = 3.3 / 0.003 = 1100 Ω.","Notice 1.1 kΩ protects the GPIO from overload."],"Divide GPIO rail by target current in base amperes.","I = 3 * 10^(-3)"),
  ()=>model("A 12 V telemetry relay driver pulls 20 mA through an indicator branch (negligible transistor drop). Size its current-limiting resistance in Ω.",600,"Ω","R = V / I","R = 12 / (20 * 10^(-3)) = 600",["Convert 20 mA = 0.020 A.","Compute R = 12 / 0.020 = 600 Ω.","Verify resistor dissipation P = V * I = 0.24 W (use ≥ 0.5 W rated part)."],"Size both resistance and power rating.","I = 20 * 10^(-3)"),
  ()=>model("An analog level shifter drops a 5.0 V sensor down cleanly while bleeding 6 mA, where the active lower branch drops 1.2 V across the target series resistor. Find that resistor in Ω.",200,"Ω","R = V_R / I","R = 1.2 / (6 * 10^(-3)) = 200",["Identify the exact drop across the target resistor: 1.2 V.","Convert 6 mA to 0.006 A.","Compute R = 1.2 / 0.006 = 200 Ω."],"Use ONLY the voltage across the resistor itself.","I = 6 * 10^(-3)"),
  ()=>model("Under a dual-rail flight test (+9.0 V top, −3.0 V bottom = 12 V span minus a 3.0 V Zener drop, leaving 9.0 V across R_bias), set Zener bias current to 15 mA. Find R_bias in Ω.",600,"Ω","R = (V_span - V_z) / I","R = (12.0 - 3.0) / (15 * 10^(-3)) = 600",["Find resistor voltage drop: V_R = 9.0 - (-3.0) - 3.0 = 9.0 V.","Convert 15 mA to 0.015 A.","Compute R = 9.0 / 0.015 = 600 Ω."],"Total span across supply minus Zener clamp sits on R_bias.","I = 15 * 10^(-3)")
 ][k](),
 powerDC:k=>[
  ()=>model("A DC board rail is 1 V at 2 A. Find consumed power in W.",2,"W","P = V * I","P = 1 * 2 = 2",["Read V = 1 V and I = 2 A.","Multiply P = V * I = 2 W.","Report 2 W."],"Multiply voltage times current in base SI units."),
  ()=>model("An STM32 NUCLEO-L476RG +3.3V regulator supplies 0.4 A to an external breadboard sensor array. Calculate rail power in W.",1.32,"W","P = V * I","P = 3.3 * 0.4 = 1.32",["Identify V_rail = 3.3 V and I_rail = 0.4 A.","Multiply 3.3 × 0.4 = 1.32 W.","Check linear LDO thermal budget (VIN − 3.3V) × 0.4 A."],"Use base V and A directly."),
  ()=>model("A 5.0 V avionics bus carries 800 mA continuously during telemetry TX. Calculate consumed bus power in W.",4,"W","P = V * I","P = 5.0 * (800 * 10^(-3)) = 4",["Convert 800 mA to 0.8 A first.","Multiply 5.0 V × 0.8 A = 4 W.","Verify power supply headroom."],"Always convert mA to A (× 10^(-3)) before multiplying by V."),
  ()=>model("Using Joule's law P = I²R on a 10 Ω telemetry termination carrying 0.4 A (and 4.0 V drop), find dissipated power in W.",1.6,"W","P = I^2 * R","P = (0.4^2) * 10 = 1.6",["Square current first: 0.4² = 0.16 A².","Multiply by R = 10 Ω → 1.6 W.","Note: a standard 0.25 W 0603 resistor would overheat instantly!"],"Square current first in I²R."),
  ()=>model("A 12.0 V spacecraft heater bus exhibits 0.6 V harness loss before reaching a 11.4 V load drawing 2.5 A. Find power delivered ONLY to the heater load (not harness) in W.",28.5,"W","P_load = (V_bus - V_loss) * I","P_load = (12.0 - 0.6) * 2.5 = 28.5",["Compute net load voltage: 12.0 - 0.6 = 11.4 V.","Multiply net load voltage by load current 2.5 A.","11.4 × 2.5 = 28.5 W delivered to the load."],"Multiply voltage ACROSS the load by current through it.")
 ][k](),
 joule:k=>[
  ()=>model("A system draws 2 W for 5 s. Find energy in joules.",10,"J","E = P * t","E = 2 * 5 = 10",["Multiply P = 2 W by t = 5 s.","1 W·s = 1 J.","Report 10 J."],"E = P * t."),
  ()=>model("During CubeSat beacon TX, an RF PA consumes 3.5 W for 10 s. Find total RF burst energy in joules.",35,"J","E = P * t","E = 3.5 * 10 = 35",["Multiply constant TX power 3.5 W by burst window 10 s.","E = 35 J.","Used to budget battery state-of-charge per orbit."],"Multiply power in watts by time in seconds."),
  ()=>model("A 5.0 V avionics actuator pulls 1.2 A continuously for 8 s while deploying a boom. Calculate total electrical energy in joules.",48,"J","E = V * I * t","E = (5.0 * 1.2) * 8 = 48",["First find instantaneous power P = V * I = 6 W.","Multiply 6 W × 8 s = 48 J.","Check actuator thermal soak."],"Compute P = V * I first, then multiply by duration t."),
  ()=>model("An instrumentation heater cycles 12 W for 15 s ON inside a 60 s orbit window (zero watts while OFF). Find energy consumed per 60 s cycle in joules.",180,"J","E = P_on * t_on","E = 12 * 15 = 180",["Integrate power only over active ON time t_on = 15 s.","12 W × 15 s = 180 J per cycle.","Average power over 60 s would be 180/60 = 3 W."],"Only ON duration contributes energy when OFF draw is zero."),
  ()=>model("A pulsed 12 V rail draws 0.8 A for 25 ms every second across 800 pulses (total ON time 20 s). Calculate cumulative joules delivered.",192,"J","E = V * I * t_tot","E = (12 * 0.8) * 20 = 192",["Compute ON power P = 12 × 0.8 = 9.6 W.","Use cumulative ON time 20 s.","E = 9.6 × 20 = 192 J."],"Find P during the pulse and multiply by cumulative active seconds.")
 ][k](),
 seriesR:k=>[
  ()=>model("Three series resistors are 100 Ω, 150 Ω and 50 Ω. Find total resistance in Ω.",300,"Ω","R_T = R_1 + R_2 + R_3","R_T = 100 + 150 + 50 = 300",["Confirm one single series path.","Sum 100 + 150 + 50.","Report 300 Ω."],"Add series resistors directly."),
  ()=>model("On a breadboard row, you wire a 220 Ω current-limiter in series with a 470 Ω load and a 100 Ω sense resistor. Find total chain resistance in Ω.",790,"Ω","R_T = R_1 + R_2 + R_3","R_T = 220 + 470 + 100 = 790",["Trace continuity from row to row along one unbranched chain.","Add 220 + 470 + 100 = 790 Ω.","Sanity check: total exceeds the largest resistor (470 Ω)."],"Series resistance always exceeds the largest individual resistor."),
  ()=>model("Two discrete 330 Ω and 680 Ω resistors sit in series with a 0.22 kΩ (220 Ω) trim resistor. Convert units consistently and find total series resistance in Ω.",1230,"Ω","R_T = R_1 + R_2 + R_3","R_T = 330 + 680 + (0.22 * 10^(3)) = 1230",["Convert 0.22 kΩ to 220 Ω first.","Add 330 + 680 + 220 = 1230 Ω.","Never mix kΩ and Ω without converting!"],"Convert kΩ to Ω before summing."),
  ()=>model("A sensor loop contains a 470 Ω pull-up, a 1.0 kΩ protection resistor, and two 165 Ω harness wire leads (one forward, one return). Compute total loop resistance in Ω.",1800,"Ω","R_loop = R_1 + R_2 + 2 * R_wire","R_loop = 470 + 1000 + 2 * 165 = 1800",["Include BOTH forward and return cable resistances in the closed loop.","Sum 470 + 1000 + 330 = 1800 Ω.","Used to predict I_loop under KVL."],"Count both supply and ground wire resistance around the loop."),
  ()=>model("Four flight harness sections are 680 Ω, 1.2 kΩ, 470 Ω, and a series-isolated fault jumper measuring 150 Ω. What total resistance in Ω would a power-OFF DMM read across the input terminals?",2500,"Ω","R_T = 680 + 1200 + 470 + 150","R_T = 680 + (1.2 * 10^(3)) + 470 + 150 = 2500",["Power off the rail before touching ohmmeter probes.","Convert 1.2 kΩ to 1200 Ω.","Sum all 4 elements: 680 + 1200 + 470 + 150 = 2500 Ω."],"Convert all elements to ohms and sum sequentially.")
 ][k](),
 divider:k=>[
  ()=>model("Unloaded divider: 3.3 V input, top 1000 Ω, bottom 1000 Ω. Find voltage at midpoint in V.",1.65,"V","V_out = V_in * (R_2 / (R_1 + R_2))","V_out = 3.3 * (1000 / (1000 + 1000)) = 1.65",["Total resistance is 1000 + 1000 = 2000 Ω.","Bottom ratio is 1000 / 2000 = 0.5.","3.3 × 0.5 = 1.65 V."],"Equal resistors halve the input voltage."),
  ()=>model("A 5.0 V USB rail feeds a top 2200 Ω and bottom 1000 Ω divider feeding a high-Z bench voltmeter probe. Find midpoint voltage in V.",1.5625,"V","V_out = V_in * (R_2 / (R_1 + R_2))","V_out = 5 * (1000 / (2200 + 1000)) = 1.5625",["Compute total series R = 2200 + 1000 = 3200 Ω.","Divide bottom R_2 (1000 Ω) by 3200 Ω.","Multiply by 5 V = 1.5625 V."],"Put bottom R_2 over (R_1 + R_2)."),
  ()=>model("Scaling a 9.0 V battery down for an avionics comparator: top resistor 3.3 kΩ, bottom resistor 2.2 kΩ. Calculate unloaded divider output in V.",3.6,"V","V_out = V_in * (R_2 / (R_1 + R_2))","V_out = 9 * (2200 / (3300 + 2200)) = 3.6",["Total R = 3.3k + 2.2k = 5.5 kΩ.","Ratio = 2.2 / 5.5 = 0.4.","9.0 V × 0.4 = 3.6 V."],"Common kΩ units cancel in R_2 / (R_1 + R_2)."),
  ()=>model("A 12.0 V rail uses top R_1 = 2000 Ω and bottom R_2 = 1000 Ω, NOW loaded by a 1000 Ω telemetry module in parallel with R_2 (R_bot_eff = 500 Ω). Find loaded output voltage in V.",2.4,"V","V_out = V_in * (R_eff / (R_1 + R_eff))","V_out = 12 * (500 / (2000 + 500)) = 2.4",["Combine bottom R_2 || R_load first: 1000 || 1000 = 500 Ω.","Apply divider formula with R_eff = 500 Ω: 12 × (500 / 2500).","Loaded output droops from 4.0 V down to 2.4 V!"],"Always parallel the load resistor with the bottom divider resistor first."),
  ()=>model("A 15.0 V bus divider has R_top = 4.7 kΩ and R_bot = 4.7 kΩ loaded by an external 4.7 kΩ ADC multiplexer input (R_eff = 2.35 kΩ). Find the actual loaded loaded divider midpoint voltage in V.",5,"V","V_out = 15 * ((4700 / 2) / (4700 + (4700 / 2)))","V_out = 15 * (2350 / (4700 + 2350)) = 5",["Two equal 4.7 kΩ resistors in parallel lower the bottom leg to 2.35 kΩ.","Compute divider ratio: 2350 / (4700 + 2350) = 1/3.","15.0 V × (1/3) = 5.0 V instead of 7.5 V unloaded!"],"Parallel loading shifts a 50/50 divider down to 1/3 V_in when R_load = R_bot.")
 ][k](),
 parallelR:k=>[
  ()=>model("Calculate the equivalent resistance of 100 Ω and 100 Ω in parallel, in Ω.",50,"Ω","R_eq = (R_1 * R_2) / (R_1 + R_2)","R_eq = (100 * 100) / (100 + 100) = 50",["Two identical 100 Ω paths cut total resistance in half.","Compute (100 × 100) / 200 = 50 Ω.","Verify R_eq < 100 Ω."],"Two equal resistors in parallel halve R."),
  ()=>model("Two parallel load paths of 220 Ω and 330 Ω connect between +3.3V and GND on a breadboard. Find equivalent resistance in Ω.",132,"Ω","R_eq = (R_1 * R_2) / (R_1 + R_2)","R_eq = (220 * 330) / (220 + 330) = 132",["Multiply 220 × 330 = 72,600.","Divide by sum 220 + 330 = 550.","72,600 / 550 = 132 Ω (< 220 Ω)."],"R_eq must be strictly less than the smallest branch (220 Ω)."),
  ()=>model("An avionics heater combines 330 Ω and 660 Ω elements in parallel across a test bus. Find effective load resistance in Ω.",220,"Ω","R_eq = (R_1 * R_2) / (R_1 + R_2)","R_eq = (330 * 660) / (330 + 660) = 220",["Notice 330 and 660 are a 2:1 ratio.","(330 × 660) / 990 = 220 Ω.","Verify 220 Ω < 330 Ω."],"Multiply over sum cleanly simplifies 2:1 pairs."),
  ()=>model("Three parallel CAN/bus termination loads (600 Ω, 300 Ω, 200 Ω) sit between Bus+ and Bus− (G_tot = 1/600 + 1/300 + 1/200). Find total parallel resistance in Ω.",100,"Ω","R_eq = 1 / (1/R_1 + 1/R_2 + 1/R_3)","R_eq = 1 / ((1/600) + (1/300) + (1/200)) = 100",["Add conductances: 1/600 + 2/600 + 3/600 = 6/600 = 1/100 S.","Invert total conductance to get R_eq = 100 Ω.","Must be smaller than 200 Ω."],"For 3+ parallel branches, sum conductances 1/R and invert."),
  ()=>model("A 1.0 kΩ resistor sits in parallel with a 1.0 kΩ branch AND a third shorted fault branch of 125 Ω (reducing R_eq = 1 / (1/1000 + 1/1000 + 1/125)). Find resulting faulted bus resistance in Ω.",100,"Ω","R_eq = 1 / (1/R_1 + 1/R_2 + 1/R_fault)","R_eq = 1 / ((1/1000) + (1/1000) + (1/125)) = 100",["Combine the two healthy 1 kΩ paths first: 1000 || 1000 = 500 Ω.","Combine 500 Ω in parallel with 125 Ω fault: (500 × 125) / 625.","R_eq drops to 100 Ω, spiking rail current 5×!"],"Collapse healthy branches first, then parallel the fault.")
 ][k](),
 parallelI:k=>[
  ()=>model("A 100 Ω branch is connected across a 3 V parallel rail. Find its branch current in mA.",30,"mA","I_branch = V_rail / R_branch","I_mA = (3 / 100) * 10^(3) = 30",["Parallel branches share the full 3 V rail.","Compute 3 / 100 = 0.03 A.","Multiply by 10^(3) = 30 mA."],"Each branch sees full rail voltage."),
  ()=>model("Across a 5.0 V regulated breadboard rail sits a 500 Ω indicator branch alongside a 1 kΩ logic load. Find current in ONLY the 500 Ω branch in mA.",10,"mA","I_1 = V_rail / R_1","I_mA = (5 / 500) * 10^(3) = 10",["The 1 kΩ load does NOT reduce voltage on an ideal 5 V parallel rail.","Calculate I_500 = 5 / 500 = 0.01 A.","Report 10 mA."],"Other parallel branches don't steal voltage from a stiff supply."),
  ()=>model("A 9.0 V telemetry rail feeds a 300 Ω sensor coil and a 450 Ω solenoid in parallel. Find current through the 300 Ω branch alone in mA.",30,"mA","I_branch = V_rail / R_branch","I_mA = (9 / 300) * 10^(3) = 30",["Use Ohm's law directly on the 300 Ω branch with 9 V.","9 / 300 = 0.03 A.","Multiply by 10^(3) = 30 mA."],"Apply V/R independently per branch."),
  ()=>model("Across a 12.0 V bus sit two parallel branches (1200 Ω and 600 Ω). Compute the TOTAL supply current drawn by BOTH branches combined in mA.",30,"mA","I_T = (V/R_1 + V/R_2) * 10^(3)","I_T = ((12 / 1200) + (12 / 600)) * 10^(3) = 30",["Find Branch 1: 12 / 1200 = 10 mA; Branch 2: 12 / 600 = 20 mA.","By KCL, sum both branch currents: 10 + 20 = 30 mA.","Notice 1200 || 600 = 400 Ω → 12 / 400 = 30 mA check."],"Sum individual branch currents via KCL."),
  ()=>model("A 24.0 V avionics bus feeds three parallel test loads (2.0 kΩ, 4.0 kΩ, and 4.0 kΩ) through a common ammeter. What total current in mA should the bus ammeter report?",24,"mA","I_T = (V/R_1 + V/R_2 + V/R_3) * 10^(3)","I_T = ((24 / 2000) + (24 / 4000) + (24 / 4000)) * 10^(3) = 24",["Find each branch: 12 mA, 6 mA, and 6 mA.","Sum via KCL: 12 + 6 + 6 = 24 mA.","Cross-check R_eq: 2k || 4k || 4k = 1 kΩ → 24 V / 1 kΩ = 24 mA."],"Check branch sum against V / R_eq.")
 ][k](),
 kcl:k=>[
  ()=>model("A node receives 10 mA; two branches leave with 3 mA and 2 mA. How many mA leave through a third branch?",5,"mA","I_in = I_1 + I_2 + I_3","I_3 = 10 - 3 - 2 = 5",["By KCL, entering = leaving.","Subtract 3 + 2 = 5 mA from 10 mA.","Report 5 mA."],"Sum entering equals sum leaving at the node."),
  ()=>model("On breadboard row 13, 15 mA enters from the PSU while 5 mA flows to STM32 PA0 and 4 mA flows through a pull-down resistor. Find current in mA leaving through the remaining LED branch.",6,"mA","I_LED = I_in - I_1 - I_2","I_LED = 15 - 5 - 4 = 6",["Add known leaving currents: 5 + 4 = 9 mA.","Subtract from entering 15 mA.","Remaining LED branch carries 6 mA."],"Verify current conservation at row 13."),
  ()=>model("Two power rails feed 14 mA and 8 mA INTO a summing node; one branch carries 13 mA OUT to a load. Find current in mA leaving through the second outgoing branch.",9,"mA","I_out2 = (I_in1 + I_in2) - I_out1","I_out2 = (14 + 8) - 13 = 9",["Sum ALL entering currents: 14 + 8 = 22 mA.","Subtract the known outgoing 13 mA.","22 - 13 = 9 mA exits via the second branch."],"Group entering currents vs leaving currents cleanly."),
  ()=>model("A spacecraft power tree junction receives 30 mA from Buck A, loses 9 mA to Flash and 8 mA to UART, while Buck B contributes another 5 mA INTO the same node. How many mA enter the core MCU branch leaving the node?",18,"mA","I_mcu = (30 + 5) - (9 + 8)","I_mcu = (30 + 5) - (9 + 8) = 18",["Identify direction arrows carefully: 30 mA and 5 mA enter (35 mA total).","9 mA and 8 mA leave (17 mA total).","Remaining current leaving to the MCU = 35 - 17 = 18 mA."],"Check every branch arrow polarity at the node."),
  ()=>model("During a ground-return audit, +55 mA leaves a regulator node to three sub-rails (22 mA, 15 mA, 10 mA) and returns except for an unmeasured leakage path to chassis. How many mA is the chassis leakage?",8,"mA","I_leak = I_reg - (I_1 + I_2 + I_3)","I_leak = 55 - (22 + 15 + 10) = 8",["Sum accounted return paths: 22 + 15 + 10 = 47 mA.","Discrepancy vs regulator supply = 55 - 47 = 8 mA.","Missing 8 mA flags a chassis leakage or phantom branch!"],"Unaccounted current discrepancy equals leakage path via KCL.")
 ][k](),
 kvl:k=>[
  ()=>model("A series loop source is 5 V. Two drops are 1 V and 2 V. Find the remaining drop in V.",2,"V","V_source = V_1 + V_2 + V_3","V_3 = 5 - 1 - 2 = 2",["Closed loop drops sum to source 5 V.","5 - 1 - 2 = 2 V.","Report 2 V."],"KVL: drops sum to source rise."),
  ()=>model("Around a 9.0 V breadboard loop, resistor R1 drops 2.4 V and an LED drops 2.0 V. Find the remaining voltage across R2 in V.",4.6,"V","V_R2 = V_s - V_R1 - V_LED","V_R2 = 9.0 - 2.4 - 2.0 = 4.6",["Trace clockwise: +9.0 V rise − 2.4 V − 2.0 V − V_R2 = 0.","Compute 9.0 - 4.4 = 4.6 V.","Check: 2.4 + 2.0 + 4.6 = 9.0 V."],"Trace one complete loop with consistent signs."),
  ()=>model("In a 12 V automotive/avionics loop, a reverse-polarity Schottky diode drops 0.45 V, a fuse drops 0.15 V, and a cable drops 0.40 V. What voltage remains across the load in V?",11,"V","V_load = 12 - (0.45 + 0.15 + 0.40)","V_load = 12 - (0.45 + 0.15 + 0.40) = 11",["Sum all upstream drops: 0.45 + 0.15 + 0.40 = 1.00 V.","Subtract from 12 V supply: 11 V reaches the load.","Check loop KVL sum = 12.0 V."],"Account for diodes, fuses, and wires in series."),
  ()=>model("A single loop has two series batteries assisting (+15 V and +3 V, total +18 V rise) driving two loads dropping 6.5 V and 4.0 V plus one unknown resistor. Find the resistor drop in V.",7.5,"V","V_x = (V_s1 + V_s2) - V_1 - V_2","V_x = (15 + 3) - 6.5 - 4.0 = 7.5",["Add both series aiding sources: 15 + 3 = 18 V.","Subtract passive drops: 18 - 6.5 - 4.0 = 7.5 V.","Verify algebraic loop sum equals zero."],"Sum all source rises before subtracting passive drops."),
  ()=>model("A dual-battery bucking loop contains a +28 V main bus and an opposing −4 V back-EMF motor source, alongside 8.0 V cable loss and a MOSFET dropping 0.5 V, with the rest across a braking resistor. Find resistor voltage in V.",15.5,"V","V_brk = 28 - 4 - 8.0 - 0.5","V_brk = 28 - 4 - 8.0 - 0.5 = 15.5",["Net driving EMF = +28 V − 4 V (opposing) = 24 V.","Subtract 8.0 V + 0.5 V = 8.5 V drops.","Remaining resistor drop = 24 − 8.5 = 15.5 V."],"Opposing sources subtract around the KVL loop.")
 ][k](),
 thev:k=>[
  ()=>model("An unloaded 5 V divider has 1000 Ω on top and 1000 Ω below. Find its Thevenin open-circuit voltage in V.",2.5,"V","V_th = V_s * (R_bot / (R_top + R_bot))","V_th = 5 * (1000 / (1000 + 1000)) = 2.5",["With no load attached, V_th equals the divider output.","5 × (1000 / 2000) = 2.5 V.","Note R_th = 500 Ω."],"Disconnect load to compute V_th."),
  ()=>model("A 9 V bridge leg splits across top 1.0 kΩ and bottom 2.0 kΩ toward an open ADC test pin. Calculate open-circuit V_th in V.",6,"V","V_th = 9 * (2000 / (1000 + 2000))","V_th = 9 * (2000 / (1000 + 2000)) = 6",["Divide bottom 2000 Ω by total 3000 Ω = 2/3.","Multiply 9 V × 2/3 = 6.0 V.","That 6 V is the unloaded open-circuit source."],"Bottom resistor over total sum."),
  ()=>model("After measuring open-circuit output V_th = 12.0 V, a lab engineer shorts the source and finds R_top = 2.2 kΩ in parallel with R_bot = 2.2 kΩ. What V_th remains if instead R_bot doubles to 4.4 kΩ on the same 12 V divider (output V)?",8,"V","V_th = 12 * (4400 / (2200 + 4400))","V_th = 12 * (4400 / (2200 + 4400)) = 8",["Calculate unloaded ratio: 4400 / (2200 + 4400) = 2/3.","12 × 2/3 = 8.0 V open-circuit voltage.","Notice larger bottom R raises V_th."],"Apply divider ratio with updated R_bot."),
  ()=>model("A sensor output produces V_oc = 6.0 V unloaded, and droops to 4.0 V when loaded by a 1000 Ω ADC input resistor (current = 4 mA, so R_th = (6−4)/0.004 = 500 Ω). Now find its terminal voltage (V) if loaded instead by 2000 Ω.",4.8,"V","V_load = V_th * (R_load / (R_th + R_load))","V_load = 6.0 * (2000 / (500 + 2000)) = 4.8",["With R_th = 500 Ω and new R_load = 2000 Ω, form the Thevenin divider.","Compute 6.0 × (2000 / 2500) = 4.8 V.","Lighter loading (2 kΩ > 1 kΩ) recovers 0.8 V."],"Form the loaded divider using V_th and R_th."),
  ()=>model("A linear sensor network uses TWO sources via superposition: +10 V via 2 kΩ and +2 V via 2 kΩ feeding an open output node. Find Thevenin open-circuit voltage V_th in V.",6,"V","V_th = 10*(2/(2+2)) + 2*(2/(2+2))","V_th = (10 * 0.5) + (2 * 0.5) = 6",["Source 1 alone (shorting Source 2): 10 × (2k / 4k) = +5.0 V.","Source 2 alone (shorting Source 1): 2 × (2k / 4k) = +1.0 V.","By superposition, V_th = 5.0 + 1.0 = 6.0 V."],"Evaluate each source independently and sum.")
 ][k](),
 norton:k=>[
  ()=>model("A Thevenin network has Vth=2 V and Rth=100 Ω. Convert to Norton current in mA.",20,"mA","I_N = V_th / R_th","I_N_mA = (2 / 100) * 10^(3) = 20",["Compute I_N = 2 / 100 = 0.02 A.","Multiply by 10^(3) = 20 mA.","R_N stays 100 Ω."],"I_N = V_th / R_th."),
  ()=>model("A 3.0 V transducer output has 150 Ω source resistance. Find its Norton short-circuit current in mA.",20,"mA","I_N = V_th / R_th","I_N_mA = (3 / 150) * 10^(3) = 20",["Short the output terminals mentally: current is 3 / 150 = 0.02 A.","Multiply by 10^(3) to report 20 mA.","Notice how identical Vth/Rth ratios yield equal Norton currents."],"Convert amperes to mA."),
  ()=>model("An unloaded 10 V divider (top 500 Ω, bottom 500 Ω → Vth = 5.0 V, Rth = 250 Ω) drives an ammeter in short-circuit mode. What short-circuit Norton current in mA flows?",20,"mA","I_N = V_th / R_th","I_N_mA = (5 / 250) * 10^(3) = 20",["First verify divider equivalent: Vth = 5 V, Rth = 500||500 = 250 Ω.","Divide Vth / Rth = 5 / 250 = 0.02 A.","Report 20 mA (note the bottom resistor carries zero current when output is shorted!)."],"Shorting output bypasses R_bot cleanly."),
  ()=>model("From terminals A–B, a Thevenin network has V_th = 10.0 V and R_th = 500 Ω in parallel with a 500 Ω bleeder inside the Norton conversion—wait: compute original Norton I_N directly from V_th=10 V, R_th=500 Ω in mA, before load is attached.",20,"mA","I_N = V_th / R_th","I_N_mA = (10 / 500) * 10^(3) = 20",["Keep original V_th = 10 V and R_th = 500 Ω.","I_N = 10 / 500 = 0.02 A.","20 mA."],"Norton current depends solely on V_th and R_th."),
  ()=>model("Two parallel Norton current sources (12 mA || 300 Ω and 8 mA || 600 Ω) drive a bus node together. Find the combined net Norton current in mA (R_eq = 200 Ω).",20,"mA","I_Ntot = I_1 + I_2","I_Ntot = 12 + 8 = 20",["Parallel current sources in the same direction add directly by KCL.","12 mA + 8 mA = 20 mA (in parallel with 300||600 = 200 Ω).","Report 20 mA."],"Parallel ideal current sources combine directly by KCL.")
 ][k](),
 rms:k=>[
  ()=>model("A sinusoid has 2 V peak amplitude. Find RMS voltage in V.",2/Math.SQRT2,"V","V_rms = V_peak / √(2)","V_rms = 2 / √(2) = 1.4142",["Use V_rms = V_peak / √2.","2 / 1.4142 ≈ 1.4142 V.","V_rms < V_peak."],"Divide peak by √2."),
  ()=>model("An oscilloscope measures a 5.0 V zero-to-peak AC excitation tone across a breadboard filter. What should a True-RMS DMM read in V?",5/Math.SQRT2,"V","V_rms = V_peak / √(2)","V_rms = 5 / √(2) = 3.5355",["Convert scope peak voltage (center-to-crest) to RMS.","Divide 5 / √2 = 3.536 V.","Scope shows 5 Vpk (10 Vpp); DMM shows 3.54 Vrms."],"Remember 10 Vpp = 5 Vpk."),
  ()=>model("Your Keysight Infiniium scope reports 20 V peak-to-peak (V_peak = 10 V) on a 1 kHz sine wave. Find RMS voltage in V.",10/Math.SQRT2,"V","V_rms = (V_pp / 2) / √(2)","V_rms = (20 / 2) / √(2) = 7.0711",["First halve peak-to-peak to obtain zero-to-peak: 20 / 2 = 10 V.","Divide 10 V by √2 ≈ 7.071 V.","Never divide V_pp by √2 directly!"],"Convert peak-to-peak -> peak FIRST, then divide by √2."),
  ()=>model("Across a 12 Ω resistive shaker coil, a pure sine wave reaches 12 V peak. First compute V_rms = 12/√2, or directly report V_rms in V.",12/Math.SQRT2,"V","V_rms = V_peak / √(2)","V_rms = 12 / √(2) = 8.4853",["Divide 12 V peak by √2.","12 × 0.7071 = 8.485 Vrms.","Heating power matches an 8.49 V DC supply."],"V_rms produces equal average resistive heating as DC."),
  ()=>model("A 24 V peak sinusoid sits on top of a filter input after AC coupling blocks any DC offset. Find pure AC RMS voltage in V.",24/Math.SQRT2,"V","V_rms = V_peak / √(2)","V_rms = 24 / √(2) = 16.971",["AC coupling leaves only the pure sinusoidal swing (24 Vpk).","Compute 24 / √2 = 16.971 Vrms.","Verify V_rms ≈ 70.7% of V_peak."],"0.7071 × V_peak gives quick mental sanity check.")
 ][k](),
 period:k=>[
  ()=>model("A periodic signal is 10 Hz. Find its period in milliseconds.",100,"ms","T = 1 / f","T_ms = (1 / 10) * 10^(3) = 100",["T = 1 / 10 = 0.1 s.","Multiply by 10^(3) = 100 ms.","Report 100 ms."],"T = 1/f then × 10^3 for ms."),
  ()=>model("An avionics telemetry frame triggers at 20 Hz on a scope. How many ms separate consecutive triggers?",50,"ms","T = 1 / f","T_ms = (1 / 20) * 10^(3) = 50",["Divide 1 by 20 Hz = 0.05 s.","Convert to milliseconds: 0.05 × 1000 = 50 ms.","Configure horizontal timebase to capture ≥ 100 ms."],"Multiply seconds by 1000 for ms."),
  ()=>model("A 50 Hz AC mains hum couples onto an unshielded probe ground lead. What period in ms corresponds to 50 Hz noise?",20,"ms","T = 1 / f","T_ms = (1 / 50) * 10^(3) = 20",["T = 1 / 50 = 0.02 s.","0.02 × 10^(3) = 20 ms cycle.","If scope bumps show every 20 ms, inspect probe ground!"],"20 ms ripple = 50 Hz mains pickup!"),
  ()=>model("A watchdog timer pulses once every half-period at 200 edges/s (square wave fundamental frequency 100 Hz). Find the full period of the 100 Hz square wave in ms.",10,"ms","T = 1 / f","T_ms = (1 / 100) * 10^(3) = 10",["Use fundamental full-cycle frequency f = 100 Hz (two edges per cycle).","T = 1 / 100 = 0.01 s = 10 ms.","Each HIGH or LOW half takes 5 ms."],"Period spans rising edge to NEXT rising edge."),
  ()=>model("Two consecutive harmonic peaks appear on an FFT trigger pulse 5 ms apart? Check the fundamental of a 200 Hz PWM motor strobe: find period in ms.",5,"ms","T = 1 / f","T_ms = (1 / 200) * 10^(3) = 5",["Compute T = 1 / 200 = 0.005 s.","Convert 0.005 s × 10^(3) = 5 ms.","Report 5 ms."],"1 / 200 Hz = 5 ms.")
 ][k](),
 capQ:k=>[
  ()=>model("A 1 µF capacitor is charged to 3 V. Find stored charge in µC.",3,"µC","Q = C * V","Q_uC = ((1 * 10^(-6)) * 3) * 10^(6) = 3",["Use Q = C * V.","1 µF × 3 V = 3 µC.","Report 3 µC."],"µF × V = µC directly."),
  ()=>model("An STM32 2.2 µF VCAP stabilization capacitor charges cleanly to 5 V during LDO bring-up. Calculate stored charge in µC.",11,"µC","Q = C * V","Q_uC = ((2.2 * 10^(-6)) * 5) * 10^(6) = 11",["Convert 2.2 µF = 2.2 × 10^(-6) F.","Multiply by 5 V = 11 × 10^(-6) C.","Report 11 µC."],"Q = C × V."),
  ()=>model("Two 4.7 µF capacitors on row 12 hold 5.0 V across a single equivalent 4.7 µF single branch first—Wait: calculate charge stored on ONE 4.7 µF cap at 5.0 V in µC.",23.5,"µC","Q = C * V","Q_uC = ((4.7 * 10^(-6)) * 5) * 10^(6) = 23.5",["Compute 4.7 × 5.0 = 23.5.","Prefix 10^(-6) F × V directly yields 10^(-6) C (µC).","23.5 µC."],"Check arithmetic: 4.7 × 5 = 23.5 µC."),
  ()=>model("A 10 µF bulk bank sits on a 12 V spacecraft bus (initially holding 120 µC). If rewired across two equal 10 µF series caps? Wait—find stored charge on the single 10 µF cap at 12 V in µC.",120,"µC","Q = C * V","Q_uC = ((10 * 10^(-6)) * 12) * 10^(6) = 120",["10 µF × 12 V = 120 µC.","Notice charge stays conserved on series strings until discharged.","Report 120 µC."],"Q = 10 × 12 = 120 µC."),
  ()=>model("Two parallel bypass caps (22 µF + 25 µF = 47 µF total) sit charged at 2 V core rail voltage. Find total stored charge on the rail in µC.",94,"µC","Q = (C_1 + C_2) * V","Q_uC = (((22 + 25) * 10^(-6)) * 2) * 10^(6) = 94",["Add parallel capacitances first: 22 + 25 = 47 µF.","Multiply 47 µF × 2 V = 94 µC.","Even low voltages carry significant charge on large µF banks."],"Sum parallel C before multiplying by V.")
 ][k](),
 capE:k=>[
  ()=>model("A capacitor of 1 µF is at 2 V. Calculate energy in µJ.",2,"µJ","E = 0.5 * C * V^2","E_uJ = (0.5 * (1 * 10^(-6)) * 2^2) * 10^(6) = 2",["Square V: 2² = 4.","0.5 × 1 µF × 4 = 2 µJ.","Report 2 µJ."],"Square V first."),
  ()=>model("A 2 µF decoupling capacitor settles at 3 V on an avionics logic board. How much electrostatic energy in µJ must be bleeder-discharged before handling?",9,"µJ","E = 0.5 * C * V^2","E_uJ = (0.5 * (2 * 10^(-6)) * 3^2) * 10^(6) = 9",["Square voltage: 3² = 9.","Multiply 0.5 × 2 µF × 9 = 9 µJ.","Energy scales quadratically with voltage!"],"Doubling V quadruples stored energy."),
  ()=>model("A 4.7 µF bulk cap powers down from 5.0 V. Calculate its stored energy in µJ.",58.75,"µJ","E = 0.5 * C * V^2","E_uJ = (0.5 * (4.7 * 10^(-6)) * 5^2) * 10^(6) = 58.75",["5² = 25.","0.5 × 4.7 × 25 = 58.75 µJ.","Always discharge caps through a bleeder resistor rather than dead shorting!"],"0.5 × C_uF × V² yields µJ."),
  ()=>model("Comparing hold-up: doubling voltage on a 10 µF cap from 4.5 V to 9.0 V quadruples energy. Find stored energy at 9.0 V in µJ.",405,"µJ","E = 0.5 * C * V^2","E_uJ = (0.5 * (10 * 10^(-6)) * 9^2) * 10^(6) = 405",["Compute 9² = 81.","0.5 × 10 × 81 = 405 µJ.","Verify: 405 / 4 = 101.25 µJ at 4.5 V."],"Check V² scaling."),
  ()=>model("A 22 µF holdup bank charges to 12.0 V on a flight backplane. Calculate total stored energy in µJ (notice hazardous arc potential on larger HV banks!).",1584,"µJ","E = 0.5 * C * V^2","E_uJ = (0.5 * (22 * 10^(-6)) * 12^2) * 10^(6) = 1584",["Square 12 V → 144.","0.5 × 22 × 144 = 11 × 144 = 1584 µJ (1.584 mJ).","Report 1584 µJ."],"Multiply 0.5 × 22 × 144 cleanly.")
 ][k](),
 rcTau:k=>[
  ()=>model("A first-order RC circuit uses R=1 kΩ and C=1 µF. Find τ in ms.",1,"ms","tau = R * C","tau_ms = ((1 * 10^(3)) * (1 * 10^(-6))) * 10^(3) = 1",["Notice 10^(3) Ω × 10^(-6) F = 10^(-3) s = 1 ms.","1 × 1 = 1 ms.","Report 1 ms."],"kΩ × µF = ms directly!"),
  ()=>model("An STM32 NRST supervisor button debounce uses R = 2.2 kΩ and C = 4.7 µF on a breadboard. Find RC time constant τ in ms.",10.34,"ms","tau = R * C","tau_ms = ((2.2 * 10^(3)) * (4.7 * 10^(-6))) * 10^(3) = 10.34",["Multiply 2.2 kΩ × 4.7 µF directly in ms.","2.2 × 4.7 = 10.34 ms.","Settling takes ~5τ ≈ 51.7 ms."],"Check units: 10^3 × 10^(-6) = 10^(-3) s."),
  ()=>model("A power-good delay pin wires R = 4.7 kΩ to a 10 µF capacitor to GND. Compute τ in ms.",47,"ms","tau = R * C","tau_ms = ((4.7 * 10^(3)) * (10 * 10^(-6))) * 10^(3) = 47",["4.7 × 10 = 47 ms.","Verify prefix power: 10^(3) × 10^(-6) = 10^(-3) s.","Full 5τ charge completes around 235 ms."],"Wait ~5τ for steady state."),
  ()=>model("Two parallel 1.1 µF caps (2.2 µF total) pair with a 10 kΩ pull-up resistor. Find effective time constant τ in ms.",22,"ms","tau = R * (C_1 + C_2)","tau_ms = ((10 * 10^(3)) * ((1.1 + 1.1) * 10^(-6))) * 10^(3) = 22",["Sum parallel capacitance: 1.1 + 1.1 = 2.2 µF.","Multiply 10 kΩ × 2.2 µF = 22 ms.","Parallel caps slow the node edge."],"Combine equivalent C before computing RC."),
  ()=>model("A high-impedance timing node has R1 = 22 kΩ pulled to +3.3V across C = 0.47 µF — wait: compute the unloaded RC time constant τ in ms before attaching a probe.",10.34,"ms","tau = R * C","tau_ms = ((22 * 10^(3)) * (0.47 * 10^(-6))) * 10^(3) = 10.34",["22 kΩ × 0.47 µF = 10.34 ms.","Note that attaching a DMM creates a parallel path reducing effective R_eq and τ!","Report 10.34 ms."],"Compute unloaded R × C cleanly.")
 ][k](),
 rc63:k=>[
  ()=>model("An initially discharged RC node steps toward 1 V. What voltage (V) does it reach after one time constant τ?",1*(1-Math.exp(-1)),"V","V(tau) = V_final * (1 - exp(-1))","V(tau) = 1 * (1 - exp(-1)) = 0.63212",["At t = τ, (1 − e^(-1)) ≈ 0.63212.","1 × 0.63212 = 0.63212 V.","63.2% mark!"],"1 − e^(-1) ≈ 63.21%."),
  ()=>model("A 2.0 V step drives a series RC network from 0 V. What capacitor voltage (V) appears at exactly t = 1τ?",2*(1-Math.exp(-1)),"V","V(tau) = 2 * (1 - exp(-1))","V(tau) = 2 * (1 - exp(-1)) = 1.2642",["Compute 2 × (1 − e^(-1)) = 2 × 0.63212.","Report 1.2642 V.","Remaining 36.8% climbs over the next 4τ."],"V(τ) = 0.63212 × V_final."),
  ()=>model("An STM32 VDD = 3.3 V soft-start RC filter starts at 0 V. Compute capacitor voltage (V) after 1 time constant τ.",3.3*(1-Math.exp(-1)),"V","V(tau) = 3.3 * (1 - exp(-1))","V(tau) = 3.3 * (1 - exp(-1)) = 2.086",["3.3 × (1 − e^(-1)) = 2.086 V.","Compare with typical STM32 V_IH logic threshold (≈ 2.31 V)!","Notice 1τ alone has NOT yet crossed 0.7×VDD."],"Important for reset release timing!"),
  ()=>model("A 5.0 V USB step charges an inicialmente empty RC filter node. Find node voltage (V) at t = 1τ.",5*(1-Math.exp(-1)),"V","V(tau) = 5 * (1 - exp(-1))","V(tau) = 5 * (1 - exp(-1)) = 3.1606",["5.0 × 0.63212 = 3.1606 V.","On a discharging cap from 5 V, voltage at 1τ would instead be 5×e^(-1) = 1.839 V!","Keep charging (1 - e^-1) distinct from discharging (e^-1)."],"Check charging vs discharging formula."),
  ()=>model("An initially uncharged 12.0 V bus supervisor RC ramps toward 12 V. Calculate capacitor voltage in V at t = 1τ.",12*(1-Math.exp(-1)),"V","V(tau) = 12 * (1 - exp(-1))","V(tau) = 12 * (1 - exp(-1)) = 7.5854",["Compute 12 × (1 − e^(-1)) = 7.585 V.","At 5τ the node reaches 12 × (1 − e^(-5)) ≈ 11.92 V (>99%).","Report 7.5854 V."],"Use full precision 1 − exp(−1).")
 ][k](),
 rlTau:k=>[
  ()=>model("An RL circuit has L=10 mH and R=10 Ω. Find τ in milliseconds.",1,"ms","tau = L / R","tau_ms = ((10 * 10^(-3)) / 10) * 10^(3) = 1",["Remember RL time constant is L / R (not L × R!).","(10 mH) / (10 Ω) = 1 ms.","Report 1 ms."],"τ_RL = L / R."),
  ()=>model("A 20 mH relay coil has 20 Ω winding resistance on a 12 V driver. Compute its RL current rise time constant τ in ms.",1,"ms","tau = L / R","tau_ms = ((20 * 10^(-3)) / 20) * 10^(3) = 1",["Notice mH divided by Ω directly yields milliseconds!","20 mH / 20 Ω = 1 ms.","Higher R makes τ SHORTER (unlike RC!)."],"In RL circuits, increasing R speeds decay."),
  ()=>model("A 50 mH filter choke sees 25 Ω series loop resistance. Calculate τ = L/R in ms.",2,"ms","tau = L / R","tau_ms = ((50 * 10^(-3)) / 25) * 10^(3) = 2",["Convert 50 mH = 0.05 H.","0.05 H / 25 Ω = 0.002 s = 2 ms.","Current settles in ~5τ = 10 ms."],"τ_RL = L / R."),
  ()=>model("An actuator inductor L = 100 mH is driven through a 20 Ω FET path PLUS a 30 Ω external current-limit resistor (total 50 Ω). Find RL time constant in ms.",2,"ms","tau = L / (R_1 + R_2)","tau_ms = ((100 * 10^(-3)) / (20 + 30)) * 10^(3) = 2",["Sum total loop series resistance: 20 + 30 = 50 Ω.","Compute 100 mH / 50 Ω = 2 ms.","Added resistance speeds magnetic field collapse safely."],"Include ALL series resistance in the current loop."),
  ()=>model("During flyback turn-off, a 220 mH solenoid coil discharges solely through its 40 Ω coil + 60 Ω external clamp diode/resistor (100 Ω loop). Compute decay τ in ms.",2.2,"ms","tau = L / R_loop","tau_ms = ((220 * 10^(-3)) / (40 + 60)) * 10^(3) = 2.2",["Total freewheeling loop R = 40 + 60 = 100 Ω.","τ = 220 mH / 100 Ω = 2.2 ms.","Peak flyback clamp voltage = I_init × R_ext."],"Higher clamp R speeds decay at the cost of higher flyback V.")
 ][k](),
 inductorV:k=>[
  ()=>model("Inductor L=1 mH experiences a current increase of 2 A in 1 ms. Find the induced voltage magnitude in V.",2,"V","V_L = L * (Delta_I / Delta_t)","V_L = (1 * 10^(-3)) * (2 / (1 * 10^(-3))) = 2",["10^(-3) in mH and ms cancel cleanly.","1 × (2 / 1) = 2 V.","Report 2 V."],"mH × A / ms = V directly!"),
  ()=>model("A 2 mH power inductor sees load current ramp by 3 A over 2 ms. Calculate average back-EMF magnitude |V_L| in V.",3,"V","V_L = L * (Delta_I / Delta_t)","V_L = (2 * 10^(-3)) * (3 / (2 * 10^(-3))) = 3",["Slew rate ΔI / Δt = 3 A / 2 ms = 1500 A/s.","Multiply 0.002 H × 1500 A/s = 3 V.","Inductor opposes the rapid rise."],"Convert mH and ms or cancel 10^(-3) carefully."),
  ()=>model("A 5 mH buck choke current drops by 4 A in 2 ms when a low-side FET switches. Compute induced |V_L| magnitude in V.",10,"V","V_L = L * (Delta_I / Delta_t)","V_L = (5 * 10^(-3)) * (4 / (2 * 10^(-3))) = 10",["5 × (4 / 2) = 10 V.","If no freewheeling catch diode exists, fast dI/dt spikes hundreds of volts!","Report 10 V."],"Watch switch turn-off inductive kickback."),
  ()=>model("Through a 10 mH coil, steady current falls from 2.0 A to 0.5 A (ΔI = 1.5 A) in 5 ms. Calculate induced |V_L| magnitude in V.",3,"V","V_L = L * (Delta_I / Delta_t)","V_L = (10 * 10^(-3)) * ((2.0 - 0.5) / (5 * 10^(-3))) = 3",["Compute ΔI = 2.0 - 0.5 = 1.5 A.","Divide by 5 ms and multiply by 10 mH: 10 × (1.5 / 5) = 3 V.","Always use change ΔI rather than initial I alone."],"Use ΔI = I_initial - I_final."),
  ()=>model("On a 20 mH relay winding carrying 0.8 A, current opens down to 0 A in 4 ms across a TVS clamp. Find induced clamping voltage |V_L| in V.",4,"V","V_L = L * (Delta_I / Delta_t)","V_L = (20 * 10^(-3)) * (0.8 / (4 * 10^(-3))) = 4",["20 × (0.8 / 4) = 20 × 0.2 = 4 V.","Imagine if Δt were 4 µs instead of 4 ms → 4000 V spike!","Report 4 V."],"Microsecond interruption explodes V = L dI/dt!")
 ][k](),
 rcFc:k=>{const r=[1,2.2,4.7,10,22][k],c=[0.1,0.47,1,2.2,4.7][k];const f=1/(2*Math.PI*r*1e3*c*1e-6);const prompts=[
  `A first-order RC low-pass uses R=${r} kΩ and C=${c} µF. Find −3 dB cutoff frequency f_c in Hz.`,
  `To reject switching ripple on a breadboard ADC pin, you wire R=${r} kΩ in series and C=${c} µF to GND. Find its −3 dB cutoff f_c in Hz.`,
  `An STM32 NUCLEO-L476RG DAC audio output (PA4) feeds a passive RC smoothing filter with R=${r} kΩ and C=${c} µF. Calculate cutoff f_c in Hz.`,
  `Before entering a comparator, noisy 24 V telemetry runs through R=${r} kΩ and C=${c} µF. Determine the 70.7% (−3 dB) corner frequency in Hz.`,
  `During thermal verification, a heavy RC sensor anti-aliasing filter uses R=${r} kΩ and C=${c} µF. Compute f_c in Hz.`
 ];return model(prompts[k],f,"Hz","f_c = 1 / (2 * π * R * C)",`f_c = 1 / (2 * π * (${r} * 10^(3)) * (${c} * 10^(-6))) = ${fmt(f)}`,["Convert R from kΩ (10^3 Ω) and C from µF (10^(-6) F) to base SI units.","Compute RC in seconds (note kΩ × µF = ms = 10^(-3) s).","Divide 1 by (2π × R × C) for cutoff frequency in Hz."],"Convert kΩ to 10^3 Ω and µF to 10^(-6) F before 1/(2πRC).",`R = ${r} * 10^(3), C = ${c} * 10^(-6)`);},
 lcF0:k=>{const l=[1,2,5,10,20][k],c=[0.1,0.22,0.47,1,2.2][k];const f=1/(2*Math.PI*Math.sqrt(l*1e-3*c*1e-6));const prompts=[
  `Ideal LC network: L=${l} mH and C=${c} µF. Find resonance frequency f_0 in Hz.`,
  `An LC tank filter for an avionics power rail uses L=${l} mH and C=${c} µF. Compute its natural resonant frequency f_0 in Hz.`,
  `Checking switch-node ringing on a breadboard buck stage (L=${l} mH, C=${c} µF): calculate LC resonance f_0 in Hz.`,
  `At resonance where X_L = X_C, an EMI LC filter with L=${l} mH and C=${c} µF exhibits minimum/maximum tank impedance. Find f_0 in Hz.`,
  `Evaluating a narrow-band telemetry LC network with L=${l} mH and C=${c} µF under no load. Calculate resonant frequency in Hz.`
 ];return model(prompts[k],f,"Hz","f_0 = 1 / (2 * π * √(L * C))",`f_0 = 1 / (2 * π * √((${l} * 10^(-3)) * (${c} * 10^(-6)))) = ${fmt(f)}`,["Convert L from mH (× 10^(-3)) and C from µF (× 10^(-6)).","Multiply L × C inside √(...).","Divide 1 by (2π × √(L×C)) for Hz."],"Keep mH (10^(-3)) and µF (10^(-6)) inside √(L*C).",`L = ${l} * 10^(-3), C = ${c} * 10^(-6)`);},
 transformer:k=>{const vp=[12,24,48,120,230][k],np=[100,200,400,1000,1000][k],ns=[50,100,200,200,500][k];const prompts=[
  `An ideal transformer has ${np} primary turns, ${ns} secondary turns and ${vp} V primary RMS. Find secondary RMS voltage in V.`,
  `An isolated gate-drive transformer steps down ${vp} V AC primary (${np} turns) to ${ns} secondary turns. Find secondary RMS output in V.`,
  `Testing a flight telemetry isolation transformer: primary has ${np} turns at ${vp} V RMS, secondary has ${ns} turns. Compute unloaded V_s in V.`,
  `Mains bench isolation stage uses ${np} turns on the ${vp} V RMS input and ${ns} turns on the secondary winding. Calculate secondary RMS voltage in V.`,
  `An AC step-down power transformer (N_p=${np}, N_s=${ns}) connects to a ${vp} V RMS grid rail. Determine secondary RMS voltage in V.`
 ];return model(prompts[k],vp*ns/np,"V","V_s = V_p * (N_s / N_p)",`V_s = ${vp} * (${ns} / ${np}) = ${fmt(vp*ns/np)}`,["Identify N_p (primary) and N_s (secondary).","Multiply V_p × (N_s / N_p).","Check step-down vs step-up sense."],"Multiply V_p by N_secondary / N_primary.");},
 threephase:k=>{const v=[208,400,480,240,415][k],i=[5,10,15,20,8][k],pf=[0.8,0.9,0.85,1,0.75][k];let pw=Math.sqrt(3)*v*i*pf,pkw=pw*1e-3;const prompts=[
  `Balanced three-phase load: ${v} V line-line, ${i} A line current, PF=${pf}. Find real power in kW.`,
  `A TVAC vacuum chamber blower draws ${i} A per phase on a balanced ${v} V line-line 3-phase feed at PF=${pf}. Compute real power in kW.`,
  `Ground support test rack runs a ${v} V_LL 3-phase heater bank at ${i} A with PF=${pf}. Find consumed real power in kW.`,
  `Unity-power-factor (PF=${pf}) resistive 3-phase dummy load on ${v} V_LL draws ${i} A line current. Calculate kW.`,
  `A reactive 3-phase motor drive on ${v} V_LL pulls ${i} A at lagging PF=${pf}. Compute actual real power in kW (do not omit √3 or PF).`
 ];return model(prompts[k],pkw,"kW","P_kW = (√(3) * V_LL * I_L * PF) * 10^(-3)",`P_kW = (√(3) * ${v} * ${i} * ${pf}) * 10^(-3) = ${fmt(pkw)}`,["Multiply √3 × V_LL × I_L × PF to get watts (W).","Convert watts to kW by × 10^(-3).","Report real power in kW."],"Always include both √3 and power factor PF.",`1 kW = 10^(3) W`);},
 ledR:k=>{const vs=[3.3,5,9,12,15][k],vf=[1.8,2,2.2,2,3][k],i=[5,10,15,20,12][k];const prompts=[
  `LED forward drop ${vf} V on a ${vs} V supply; target current ${i} mA. Find ideal series resistance in Ω.`,
  `STM32 NUCLEO-L476RG drives an external breadboard indicator LED (V_f=${vf} V) from a ${vs} V rail at ${i} mA. Size the current-limiting resistor in Ω.`,
  `An avionics status panel indicator on ${vs} V needs ${i} mA across a ${vf} V diode drop. Find exact series resistor in Ω.`,
  `Sizing a bright green PCB diagnostic LED (V_f=${vf} V) from ${vs} V at ${i} mA without exceeding resistor power ratings. Calculate Ω.`,
  `Designing a high-voltage bus-present LED indicator (V_s=${vs} V, V_f=${vf} V, target ${i} mA). Compute series resistance in Ω.`
 ];return model(prompts[k],(vs-vf)/(i*1e-3),"Ω","R = (V_s - V_f) / I_LED",`R = (${vs} - ${vf}) / (${i} * 10^(-3)) = ${fmt((vs-vf)/(i*1e-3))}`,["Subtract V_f from supply V_s first to get resistor voltage.","Convert mA to amperes (× 10^(-3)).","Compute R = (V_s - V_f) / I_LED."],"Never omit subtracting V_f from V_s!",`I_LED = ${i} * 10^(-3)`);},
 clockPeriod:k=>{const f=[1,10,25,50,100][k];const ts=1/(f*1e6),tns=ts*1e9;const prompts=[
  `A digital clock runs at ${f} MHz. Find full clock period in ns.`,
  `An STM32 peripheral timer counts off a ${f} MHz crystal reference. Find single cycle period T in ns.`,
  `Checking SPI/UART baud source clock at ${f} MHz on an oscilloscope. Compute one period in nanoseconds.`,
  `High-speed FPGA synchronous core runs at ${f} MHz. Calculate full clock period budget T in ns before checking setup slack.`,
  `At ${f} MHz bus clock speed, compute the exact cycle window T in ns available for combinational logic propagation.`
 ];return model(prompts[k],tns,"ns","T = 1 / f",`T_ns = (1 / (${f} * 10^(6))) * 10^(9) = ${fmt(tns)}`,["Convert MHz to Hz (× 10^6).","Take reciprocal T = 1 / f in seconds.","Multiply by 10^(9) for nanoseconds."],"1000 / f_MHz gives ns directly.",`f = ${f} * 10^(6)`);},
 railPower:k=>{const v=[0.8,0.9,1.0,1.2,1.8][k],i=[4,6,10,2.5,1.5][k];const prompts=[
  `During a workload, CPU rail voltage is ${v} V and rail current is ${i} A. Find electrical rail power in W.`,
  `Core logic VDD_CORE sits at ${v} V while drawing ${i} A during vector processing. Find core rail power in W.`,
  `Evaluating a 1.0 V high-current ASIC rail: DMM reads ${v} V at the package pins while shunt measures ${i} A. Calculate power in W.`,
  `An LDO output feeds VDD_IO at ${v} V and ${i} A during DMA burst logging. Compute rail load power in W.`,
  `On STM32 VDD_ANA (${v} V), an external amplifier + reference load pulls ${i} A. Find total load power in W.`
 ];return model(prompts[k],v*i,"W","P_rail = V_rail * I_rail",`P_rail = ${v} * ${i} = ${fmt(v*i)}`,["Verify simultaneous V_rail and I_rail.","Multiply V × I in base units.","Report watts (W)."],"P = V × I at the load pins.");},
 shunt:k=>{const v=[5,12,25,40,55][k],r=[1,2,5,4,5][k];const prompts=[
  `A current-sense shunt of ${r} mΩ has a measured differential voltage of ${v} mV. Find current in A.`,
  `Reading a low-side ${r} mΩ resistor with a bench DMM shows ${v} mV across the pads. Compute branch current in A.`,
  `Checking an avionics buck rail: a ${r} mΩ sense resistor develops ${v} mV differential across Kelvin pins. Calculate rail current in A.`,
  `An automated SCPI script samples ${v} mV differentially across a ${r} mΩ shunt. Convert this voltage to current in A.`,
  `During a spacecraft heater surge, a ${r} mΩ Kelvin sense resistor reads ${v} mV differential across pins 2–3. Find total bus current in A.`
 ];return model(prompts[k],v/r,"A","I = V_sense / R_shunt",`I = (${v} * 10^(-3)) / (${r} * 10^(-3)) = ${fmt(v/r)}`,["Convert mV and mΩ using 10^(-3) (the prefixes cancel cleanly!).","Divide V_sense by R_shunt.","Report current in amperes (A)."],"mV / mΩ directly equals Amperes.",`V_sense = ${v} * 10^(-3), R_shunt = ${r} * 10^(-3)`);},
 scopeSamples:k=>{const fs=[100,250,500,1000,2000][k],f=[5,10,25,50,100][k];const prompts=[
  `A scope samples at ${fs} MS/s while viewing a ${f} MHz signal. How many samples per full period?`,
  `Capturing a ${f} MHz SPI clock on a breadboard using ${fs} MS/s acquisition. Find samples captured per clock cycle.`,
  `Checking fast CMOS ring at ${f} MHz with a ${fs} MS/s oscilloscope. Calculate samples per period.`,
  `Avoiding aliasing on a ${f} MHz differential line captured at ${fs} MS/s (1 GS/s). How many samples fall in one period?`,
  `Observing sub-nanosecond edge ringing at ${f} MHz using a ${fs} MS/s real-time scope. Find samples/cycle.`
 ];return model(prompts[k],fs/f,"samples/cycle","N = f_sample / f_signal",`N = (${fs} * 10^(6)) / (${f} * 10^(6)) = ${fmt(fs/f)}`,["Convert MS/s and MHz (both 10^6).","Divide f_sample / f_signal.","Ensure ≥ 10–20 samples/cycle for edge accuracy."],"Both terms use mega (10^6), so divide directly.");},
 timeDiv:k=>{const div=[2,5,10,20,50][k];const prompts=[
  `Scope horizontal scale is ${div} ns/div across 10 horizontal divisions. Find full displayed time window in ns.`,
  `Configured a breadboard capture at ${div} ns/div (10-division grid). Compute total captured screen span in ns.`,
  `Inspecting setup-time slack with horizontal scale ${div} ns/div across 10 divisions. Find full window duration in ns.`,
  `Measuring propagation delay across a gate at ${div} ns/div across the 10-division graticule. Find total sweep width in ns.`,
  `Triggering on reset release droop using ${div} ns/div × 10 divisions. Find full screen time window in ns.`
 ];return model(prompts[k],div*10,"ns","T_window = t_div * N_div",`T_window = ((${div} * 10^(-9)) * 10) * 10^(9) = ${div*10}`,["Read time per horizontal division.","Multiply by 10 screen divisions.","Report full window in ns."],"Total span = 10 × time/div.");},
 duty:k=>{const high=[2,3,4,6,8][k],period=[10,10,8,12,10][k];const prompts=[
  `A digital pulse stays high ${high} ns in a ${period} ns period. Find duty cycle as a percent.`,
  `An STM32 TIM2 PWM channel stays high ${high} ns per ${period} ns cycle. Compute duty cycle percentage.`,
  `Checking asymmetry on a clock buffer: HIGH time is ${high} ns over a ${period} ns full period. Find duty cycle %.`,
  `A buck switching node measures ${high} ns ON inside a ${period} ns period (simplified nanosecond timing model). Find duty cycle %.`,
  `Verifying a reset strobe stays active high ${high} ns inside a ${period} ns repeating frame. Find duty cycle %.`
 ];return model(prompts[k],100*high/period,"%","D = 100 * (t_high / T)",`D = 100 * (${high} * 10^(-9) / (${period} * 10^(-9))) = ${fmt(100*high/period)}`,["Verify matching ns units for t_high and period T.","Divide t_high / T.","Multiply by 100 for %."],"Duty % = 100 × t_high / T.");},
 uartTime:k=>{const bytes=[10,25,50,100,200][k],baud=[9600,19200,38400,57600,115200][k];let ts=bytes*10/baud,tms=1000*ts;const prompts=[
  `UART at ${baud} baud sends ${bytes} bytes with 8N1 framing. Find minimum wire time in ms.`,
  `NUCLEO-L476RG USART2 sends a ${bytes}-byte startup packet at ${baud} baud (8N1 = 10 bits/byte). Compute minimum transmit time in ms.`,
  `Dumping a ${bytes}-byte ADC calibration frame over RS-232/UART at ${baud} baud (8N1). Find wire time in ms.`,
  `Evaluating telemetry loop budget: ${bytes} bytes sent over 8N1 UART at ${baud} baud. Compute minimum wire transmission duration in ms.`,
  `Burst logging ${bytes} bytes continuously at ${baud} baud (1 start + 8 data + 1 stop bit). Find ideal time in ms.`
 ];return model(prompts[k],tms,"ms","t = (N_bytes * 10) / Baud",`t_ms = ((${bytes} * 10) / ${baud}) * 10^(3) = ${fmt(tms)}`,["8N1 = 10 wire bits per payload byte.","Compute total bits = 10 × N_bytes and divide by baud.","Multiply seconds by 10^(3) for milliseconds."],"Count 10 bits per byte for 8N1!",`t_ms = t * 10^(3)`);},
 spiTime:k=>{const bytes=[4,8,16,32,64][k],mhz=[1,2,4,8,16][k];let ts=8*bytes/(mhz*1e6),tus=ts*1e6;const prompts=[
  `SPI transfers ${bytes} bytes at ${mhz} MHz clock, one bit per clock. Find ideal transfer time in µs.`,
  `STM32 SPI1 (PA5–PA7) reads ${bytes} bytes from a breadboard IMU at ${mhz} MHz SCLK. Compute active clock time in µs.`,
  `Burst-writing ${bytes} bytes to external NOR flash over ${mhz} MHz SPI. Find ideal clocking time in µs.`,
  `Transferring a ${bytes}-byte DMA sensor buffer over ${mhz} MHz SPI (no inter-byte gap). Calculate transfer time in µs.`,
  `Streaming ${bytes} bytes of high-rate ADC samples across a ${mhz} MHz SPI bus. Find wire transfer duration in µs.`
 ];return model(prompts[k],tus,"µs","t = (8 * N_bytes) / f_SCLK",`t_us = ((8 * ${bytes}) / (${mhz} * 10^(6))) * 10^(6) = ${fmt(tus)}`,["SPI uses 8 bits/byte (no start/stop framing bits).","Convert MHz to Hz (× 10^6).","Multiply seconds by 10^(6) for µs."],"8 bits × N_bytes / f_MHz = µs directly.",`f_SCLK = ${mhz} * 10^(6)`);},
 testThroughput:k=>{const s=[20,30,45,60,90][k];const prompts=[
  `A deterministic automated test takes ${s} seconds per board, no pauses. What is ideal maximum throughput in boards/hour?`,
  `Bench bring-up runs ${s} s per flight PCBA with zero handling gaps. Calculate ideal rate in boards/hour.`,
  `An automated SCPI qualification sequence finishes in ${s} s per unit. Compute maximum throughput in boards/hour.`,
  `A multi-rail thermal functional script runs ${s} s per fixture socket. Determine upper-bound throughput in boards/hour.`,
  `Long-soak regression suite takes ${s} s per avionics assembly back-to-back. Find theoretical boards/hour.`
 ];return model(prompts[k],3600/s,"boards/hour","N_hour = 3600 / t_board",`N_hour = 3600 / ${s} = ${fmt(3600/s)}`,["1 hour = 3600 seconds.","Divide 3600 by seconds per board.","Account separately for fixture swaps in production."],"3600 / seconds per board.");},
 assertMargin:k=>{const limit=[5,10,20,50,100][k],meas=[4,8,17,45,92][k];const prompts=[
  `A maximum accepted current is ${limit} A; measurement is ${meas} A. Calculate margin below the maximum as percent of the limit.`,
  `A breadboard LDO spec limit is ${limit} A max; DMM logs ${meas} A. Find percent headroom margin.`,
  `PyVISA assertion checks a ${limit} A rail cap while live load reads ${meas} A. Compute percentage margin below limit.`,
  `High-power thruster bus ceiling is ${limit} A and TVAC cold startup measures ${meas} A. Find percent current margin.`,
  `Telemetry main array upper spec is ${limit} A; peak flight mode hits ${meas} A. Compute margin below max as % of limit.`
 ];return model(prompts[k],100*(limit-meas)/limit,"%","Margin_pct = 100 * ((Limit - Measured) / Limit)",`Margin_pct = 100 * ((${limit} - ${meas}) / ${limit}) = ${fmt(100*(limit-meas)/limit)}`,["Subtract Measured from Limit.","Divide headroom by Limit.","Multiply by 100 for %."],"Margin % = 100 × (Limit − Measured) / Limit.");},
 logRate:k=>{const fail=[1,2,3,5,8][k],n=[50,80,100,125,200][k];const prompts=[
  `Raw qualification logs contain ${fail} failing runs among ${n} total runs. What is the observed failure percentage?`,
  `Filtering a Linux console capture with grep reveals ${fail} FAIL lines across ${n} boot cycles. Compute failure percentage.`,
  `Over ${n} overnight temperature sweeps, a script logs ${fail} UART CRC mismatches. Find failure rate %.`,
  `Auditing ${n} automated power-cycle tests uncovers ${fail} watchdog brownouts hidden by a summary script. Find true failure %.`,
  `A 200-iteration regression log shows ${fail} exit_code!=0 aborts out of ${n} runs (Wait: compute exact ${fail}/${n} failure %).`
 ];return model(prompts[k],100*fail/n,"%","Failure_pct = 100 * (N_fail / N_total)",`Failure_pct = 100 * (${fail} / ${n}) = ${fmt(100*fail/n)}`,["Count raw failures from un-aggregated logs.","Divide N_fail / N_total.","Multiply by 100 for %."],"Divide failed runs by total runs × 100.");},
 logDuration:k=>{const count=[50,100,150,200,500][k],s=[12,15,20,24,30][k];const prompts=[
  `A Linux test loop runs ${count} iterations at ${s} seconds each. Find ideal elapsed minutes.`,
  `Running ${count} automated STM32 reset-cycle captures at ${s} s per loop. Calculate total runtime in minutes.`,
  `Scheduling ${count} SCPI telemetry log snapshots spaced ${s} s apart. Find total wall-clock minutes.`,
  `Estimating overnight burn-in: ${count} cycles at ${s} s per cycle. Compute elapsed test minutes.`,
  `Full multi-corner stress script runs ${count} steps taking ${s} s per step. Find ideal duration in minutes.`
 ];return model(prompts[k],count*s/60,"min","t_min = (N * t_sec) / 60",`t_min = (${count} * ${s}) / 60 = ${fmt(count*s/60)}`,["Multiply count × seconds per run.","Divide total seconds by 60.","Report in minutes."],"Multiply runs × seconds, divide by 60.");},
 wavelength:k=>{const f=[0.9,1.575,2.4,5,10][k];const prompts=[
  `An RF signal travels in free space at ${f} GHz. Approximate its wavelength in meters using c≈3×10^8 m/s.`,
  `Calculating GPS/GNSS L1 carrier free-space wavelength at ${f} GHz (c ≈ 3×10^8 m/s). Find λ in meters.`,
  `Evaluating a ${f} GHz telemetry patch antenna size: calculate free-space wavelength λ in meters.`,
  `Computing half-wave stub spacing for a ${f} GHz RF front end: first find full wavelength λ in meters.`,
  `An X-band downlink operates at ${f} GHz. Compute its free-space wavelength in meters (c ≈ 3×10^8 m/s).`
 ];return model(prompts[k],(3e8)/(f*1e9),"m","lambda = c / f",`lambda = (3 * 10^(8)) / (${f} * 10^(9)) = ${fmt((3e8)/(f*1e9))}`,["Convert GHz to Hz (× 10^9).","Divide c = 3 × 10^8 m/s by f.","Report wavelength λ in meters."],"Convert GHz to 10^9 Hz carefully.",`f = ${f} * 10^(9)`);},
 powerDb:k=>{const ratio=[2,4,10,20,100][k];const prompts=[
  `RF output power is ${ratio} times the input power. Find gain in dB (power ratio).`,
  `An amplifier quadruples/scales output power by ${ratio}× over input. Calculate power gain in dB.`,
  `Comparing two telemetry links: one delivers ${ratio}× more RF watts. Express this power ratio in dB.`,
  `Measuring LNA power boost: P_out / P_in = ${ratio}. Find power gain in dB using 10·log₁₀.`,
  `Evaluating total RF chain factor: net power ratio equals ${ratio}. Convert to decibels (dB).`
 ];return model(prompts[k],10*Math.log10(ratio),"dB","G_dB = 10 * log10(P_out / P_in)",`G_dB = 10 * log10(${ratio}) = ${fmt(10*Math.log10(ratio))}`,["Use 10·log10 for POWER ratios (not 20).","Take log10 of ratio.","Multiply by 10."],"Use factor 10 for power, 20 for voltage.");},
 marginPct:k=>{const limit=[10,20,30,40,50][k],meas=[9,17,27,36,45][k];const prompts=[
  `A flight-board upper acceptance limit is ${limit} units; a measured value is ${meas} in the same units. Find percent margin below the limit.`,
  `Ambient acceptance checks ripple against a ${limit} mV spec ceiling while unit measures ${meas} mV. Compute % margin.`,
  `Under cold TVAC soak, standby current measures ${meas} units vs ${limit}-unit qualification gate. Find percent margin.`,
  `Flight configuration audit requires stay-below ${limit} units; unit logs ${meas}. Compute percentage margin below limit.`,
  `Pre-ship acceptance gate allows up to ${limit} units while telemetry reports ${meas}. Find % margin remaining.`
 ];return model(prompts[k],100*(limit-meas)/limit,"%","Margin_pct = 100 * ((Limit - Measured) / Limit)",`Margin_pct = 100 * ((${limit} - ${meas}) / ${limit}) = ${fmt(100*(limit-meas)/limit)}`,["Subtract Measured from Limit.","Divide headroom by Limit.","Multiply by 100 for %."],"Headroom / limit × 100.");},
 yieldPct:k=>{const total=[20,40,50,100,200][k],pass=[19,36,48,95,194][k];const prompts=[
  `A production lot has ${pass} boards pass acceptance out of ${total} tested. Find the observed first-pass yield percentage.`,
  `After rework exclusions, ${pass} out of ${total} STM32 carrier boards pass first power-on check. Compute FPY %.`,
  `A ${total}-board qualification build passes ${pass} units on first pass before any rework. Find yield percentage.`,
  `Out of ${total} flight harness assemblies tested end-to-end, ${pass} pass without retry. Calculate FPY %.`,
  `Large satellite sub-panel lot: ${pass} pass first-pass screening across ${total} units tested. Compute FPY %.`
 ];return model(prompts[k],100*pass/total,"%","FPY_pct = 100 * (N_pass / N_tested)",`FPY_pct = 100 * (${pass} / ${total}) = ${fmt(100*pass/total)}`,["Count only first-pass passes.","Divide N_pass / N_tested.","Multiply by 100 for %."],"First-pass yield excludes reworked passes.");}
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
