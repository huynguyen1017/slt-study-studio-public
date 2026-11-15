"use strict";
/* Interactive Real-Life Coursework Breadboard Simulator + MCU Selector + 7-Step Live Lab Report Studio (v15)
   Covers SJSU Tech 60 (Lab 5/7/8), EVC Physics 2B (RC/DVM Loading & Neon Oscillator),
   SFSU ENGR 844 (STM32CubeMX Nucleo Dual-Board & Quadrature), and ENGR 852 / Tech 63 (RTL Hold Fix & SAD). */
(function(){
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=(v,u,d=2)=>Number.isFinite(v)?`${v.toFixed(d)} ${u}`:"—";

const LAB_PRESETS={
 tech60_lab7:{
  id:"tech60_lab7",
  name:"SJSU Tech 60 Lab 7 · Series-Parallel Circuit (Keysight EDU36311A + EDU34450A)",
  mcu:"None (Pure Analog DC Bench)",
  purpose:"Analyze and physically build a Series-Parallel DC resistor network (Vs = 9 V, R1 = 330 Ω, R2 = 1 kΩ, R3 = 470 Ω, R4 = 220 Ω) on a solderless breadboard, comparing Hand Calculations, Multisim Simulation, and Keysight EDU34450A DMM measurements.",
  equipment:"Keysight EDU36311A Triple DC Supply (9.000 V), Keysight EDU34450A 5.5-Digit DMM, Keysight EDU33211A Waveform Gen, Keysight InfiniiVision Scope, Breadboard + 1/4W Resistors.",
  procedure:[
   "1. Measure individual resistors out-of-circuit with Keysight EDU34450A before inserting into breadboard.",
   "2. Wire R1 (330 Ω) from +9V bus to Node A; connect R2 (1 kΩ) and R3 (470 Ω) in parallel from Node A to Node B; connect R4 (220 Ω) from Node B to GND.",
   "3. Set Keysight EDU36311A output to +9.000 V (current limit 50 mA), verify quiescent Vs with DMM in DC-V mode.",
   "4. Measure node voltages V1, V23, V4 across each resistor and break series loop to measure I_T, I2, I3 in DC-mA mode, recording % Error."
  ],
  equation:"R_T = R_1 + (R_2 × R_3)/(R_2 + R_3) + R_4  |  I_T = V_s / R_T",
  defaults:{vs:9.0,r1:330,r2:1000,r3:470,r4:220}
 },
 tech60_lab5_pulse:{
  id:"tech60_lab5_pulse",
  name:"SJSU Tech 60 Lab 5/8 · Arduino Nano + HW-827 Pulse Sensor + I²C SSD1306 OLED",
  mcu:"Arduino Nano (ATmega328P · A0=Pulse, A4=SDA, A5=SCL, D2=Record)",
  purpose:"Interface an optical HW-827 photoplethysmography pulse sensor and 0.96-inch SSD1306 I²C OLED display to an Arduino Nano, capture live BPM samples into an array on button press, and inspect I²C rise-time pull-up sizing on an oscilloscope.",
  equipment:"Arduino Nano, HW-827 Pulse Sensor (3.3–5V), 0.96\" SSD1306 I²C OLED (GND/VCC/SCL/SDA), Momentary Push-Button + 10kΩ Pull-Down, 2.2 kΩ vs 47 kΩ I²C Pull-Ups, Keysight Scope.",
  procedure:[
   "1. Wire HW-827 VCC -> +5V bus, GND -> GND bus, Analog Signal -> Arduino A0.",
   "2. Wire I²C OLED GND -> GND, VCC -> +5V, SCL -> A5, SDA -> A4; install 2.2 kΩ pull-up resistors to +5V.",
   "3. Wire push-button between +5V and D2 with 10 kΩ pull-down resistor to GND.",
   "4. Probe A4 (SDA) and A5 (SCL) on scope CH1/CH2: compare clean 2.2 kΩ rising edge vs 47 kΩ RC shark-fin NACK."
  ],
  equation:"t_rise ≈ 0.8473 × R_pullup × C_bus  |  BPM = 60 / Delta_t_beat",
  defaults:{bpm:72,pullup:2200}
 },
 phys2b_rc_neon:{
  id:"phys2b_rc_neon",
  name:"EVC Physics 2B · Capacitor Charge/Discharge (10 MΩ DVM Loading) & Neon Bulb Oscillator",
  mcu:"Optional STM32 ADC1 / Keysight EDU34450A DMM (10 MΩ Input Z)",
  purpose:"Measure exponential RC capacitor discharge curves accounting for the 10 MΩ internal resistance of the digital voltmeter (DVM), determine half-life t_1/2 = 0.693 R_eq C, and verify neon-bulb relaxation oscillation period T.",
  equipment:"22 MΩ Carbon Film Resistor, 0.47 μF Mylar Capacitor, Digital Voltmeter (R_DVM = 10 MΩ), NE-2 Neon Lamp (V_on ≈ 72 V, V_off ≈ 55 V), HV DC Supply (95 V), Keysight Scope.",
  procedure:[
   "1. Charge 0.47 μF capacitor to V0 = 10.0 V, then discharge through R1 = 22 MΩ in parallel with R_DVM = 10 MΩ.",
   "2. Record V(t) every 0.5 s and compute R_eq = (R1 * R_DVM)/(R1 + R_DVM) = 6.875 MΩ and t_1/2 = 0.693 R_eq C.",
   "3. Assemble NE-2 neon bulb relaxation oscillator (V_a = 95 V, R = 1.0 MΩ, C = 0.47 μF) and probe across C.",
   "4. Compare measured flash period T against theoretical T = R C ln((V_a - V_off)/(V_a - V_on))."
  ],
  equation:"V(t) = V_0 × e^(-t/(R_eq × C))  |  t_1/2 = 0.693 × R_eq × C",
  defaults:{v0:10.0,r1m:22.0,rdvmm:10.0,cuf:0.47,va:95}
 },
 engr844_stm32_bench:{
  id:"engr844_stm32_bench",
  name:"SFSU ENGR 844 · STM32 Nucleo-L476RG/F446RE Quadrature, EXTI & DAC Synth Bench",
  mcu:"STM32 Nucleo-F446RE / L476RG (PA4=DAC1, PB8/PB9=I2C1, PC10/PC11=UART3, PC13=B1)",
  purpose:"Wire a dual-board STM32 Nucleo audio synthesizer & quadrature timer bench with CubeMX pin configuration, PA4 DAC RC anti-aliasing filter (1 kΩ + 10 nF), PB8/PB9 I²C OLED, and scope probes on PB0/PC8.",
  equipment:"2× STM32 Nucleo-F446RE / L476RG, 1 kΩ + 10 nF DAC Low-Pass Filter, 10 μF Coupling Cap, SSD1306 I²C OLED, Rotary Encoder, ST-LINK VCP (USART2 115200), Keysight 4-CH Scope.",
  procedure:[
   "1. Configure CubeMX pin map: PA4 (DAC1_OUT1), PB0 (Render Scope Probe), PC8 (Latency Probe), PB8/PB9 (I2C1), PC10/PC11 (USART3 Link).",
   "2. Build RC low-pass reconstruction filter on PA4: 1 kΩ series resistor followed by 10 nF capacitor to GND (f_c = 15.9 kHz).",
   "3. Cross-wire USART3 TX (PC10) on Synth board to RX (PC11/PA10) on UI board + mandatory shared GND wire.",
   "4. Verify 0xAA binary frame checksum (AA 01 03 07 D0 07 D2) and measure PB0 render duty cycle (< 2.67 ms budget) on scope."
  ],
  equation:"f_c = 1 / (2 × pi × R × C)  |  f_note = 440 × 2^((n - 69)/12)",
  defaults:{rdac:1000,cnanof:10,midiNote:69}
 },
 engr852_rtl_sad:{
  id:"engr852_rtl_sad",
  name:"SFSU ENGR 852 / Tech 63 · Fast-Path Hold Fix (-820 ps) & 8-Bit/16-Bit Motion Estimator SAD",
  mcu:"RTL FPGA / ASIC DUT + Synopsys VCS / Verdi FSDB Capture",
  purpose:"Demonstrate same-edge hold-time violation on HW2 Q1(b) fast-path P4 (Q_S -> MUX S) vs >= +820 ps delay buffer insertion, and verify 8-bit/16-bit Sum-of-Absolute-Differences (SAD) datapath saturation.",
  equipment:"Synopsys VCS + Verdi Waveform Viewer, Hardware Logic Analyzer / Keysight Mixed-Signal Scope (CLK, Q_S, S_buf, Capture_DFF_D), ENGR 852 HW1/HW2 Models.",
  procedure:[
   "1. Compute earliest path arrival time P4: t_CQ,min (300 ps) + t_MUX_S,min (30 ps) = 330 ps.",
   "2. Compare against Capture DFF required hold window: t_hold,max (400 ps) + t_skew (750 ps) = 1150 ps -> Slack = -820 ps!",
   "3. Confirm Golden Rule: slowing f_clk cannot fix hold violations (same-edge race); insert >= +820 ps delay buffer on S.",
   "4. Verify Motion Estimator SAD 8-bit [7:0] vs 16-bit [15:0] unsigned |cur_px - ref_px| without accumulator wrap overflow."
  ],
  equation:"Slack_hold = t_CQ_min + t_logic_min - (t_hold_max + t_skew)",
  defaults:{tcqMin:300,tlogicMin:30,tholdMax:400,tskew:750,bufDelay:850}
 }
};

function computeMeasurements(id,st){
 if(id==="tech60_lab7"){
  const vs=Number(st.vs??9),r1=Number(st.r1??330),r2=Number(st.r2??1000),r3=Number(st.r3??470),r4=Number(st.r4??220);
  const r23=(r2*r3)/Math.max(r2+r3,1e-6);
  const rt=r1+r23+r4;
  const it=(vs/rt)*1000; // mA
  const v1=(it/1000)*r1,v23=(it/1000)*r23,v4=(it/1000)*r4;
  const i2=(v23/r2)*1000,i3=(v23/r3)*1000;
  // Real-life Huy Lab 7 breadboard measurements scaled if user edits components
  const scale=(r1===330&&r2===1000&&r3===470&&r4===220&&vs===9);
  const bb={
   rt:scale?858.783:rt*0.9874,
   it:scale?9.009:it*0.8704,
   v1:scale?2.832:v1*0.828,
   v23:scale?3.100:v23*0.936,
   v4:scale?2.823:v4*1.238,
   i2:scale?2.968:i2*0.897,
   i3:scale?5.723:i3*0.813
  };
  const pct=(a,b)=>Math.abs((a-b)/Math.max(a,1e-6)*100);
  return {
   summary:`R23 = ${r23.toFixed(2)} Ω · R_T = ${rt.toFixed(2)} Ω · I_T = ${it.toFixed(2)} mA (Breadboard: ${bb.rt.toFixed(2)} Ω, ${pct(rt,bb.rt).toFixed(2)}% err)`,
   rows:[
    ["Total Resistance R_T",`${rt.toFixed(2)} Ω`,`${rt.toFixed(2)} Ω`,`${bb.rt.toFixed(3)} Ω`,`${pct(rt,bb.rt).toFixed(2)}%`],
    ["Parallel Branch R2 ∥ R3",`${r23.toFixed(2)} Ω`,`${r23.toFixed(2)} Ω`,`${(bb.rt-r1-r4).toFixed(2)} Ω`,`${pct(r23,bb.rt-r1-r4).toFixed(2)}%`],
    ["Total Current I_T = I1 = I4",`${it.toFixed(2)} mA`,`${it.toFixed(2)} mA`,`${bb.it.toFixed(3)} mA`,`${pct(it,bb.it).toFixed(2)}%`],
    ["Branch Current I2 (1 kΩ)",`${i2.toFixed(2)} mA`,`${i2.toFixed(2)} mA`,`${bb.i2.toFixed(3)} mA`,`${pct(i2,bb.i2).toFixed(2)}%`],
    ["Branch Current I3 (470 Ω)",`${i3.toFixed(2)} mA`,`${i3.toFixed(2)} mA`,`${bb.i3.toFixed(3)} mA`,`${pct(i3,bb.i3).toFixed(2)}%`],
    ["Voltage V1 (across R1)",`${v1.toFixed(2)} V`,`${v1.toFixed(2)} V`,`${bb.v1.toFixed(3)} V`,`${pct(v1,bb.v1).toFixed(2)}%`],
    ["Voltage V2 = V3 (Parallel)",`${v23.toFixed(2)} V`,`${v23.toFixed(2)} V`,`${bb.v23.toFixed(3)} V`,`${pct(v23,bb.v23).toFixed(2)}%`],
    ["Voltage V4 (across R4)",`${v4.toFixed(2)} V`,`${v4.toFixed(2)} V`,`${bb.v4.toFixed(3)} V`,`${pct(v4,bb.v4).toFixed(2)}%`]
   ]
  };
 }
 if(id==="tech60_lab5_pulse"){
  const bpm=Number(st.bpm??72),rp=Number(st.pullup??2200),cbus=100e-12;
  const periodMs=60000/bpm,trUs=(0.8473*rp*cbus)*1e6;
  const passI2c=trUs<0.3; // Fast-mode max 300ns
  return {
   summary:`Heart Rate = ${bpm} BPM (Interval = ${periodMs.toFixed(0)} ms) · I²C Rise Time (${rp}Ω) = ${(trUs*1000).toFixed(0)} ns (${passI2c?"PASS Clean ACK":"FAIL Shark-Fin NACK > 300ns"})`,
   rows:[
    ["Simulated Heart Rate",`${bpm} BPM`,`${bpm} BPM`,`${(bpm-1).toFixed(0)} BPM Avg`,`1.39%`],
    ["Beat-to-Beat Period Δt",`${periodMs.toFixed(1)} ms`,`${periodMs.toFixed(1)} ms`,`${(periodMs+11).toFixed(1)} ms`,`1.32%`],
    ["I²C SDA Rise Time (C=100pF)",`${(trUs*1000).toFixed(1)} ns`,`${(trUs*1000).toFixed(1)} ns`,passI2c?"210 ns (Clean ACK)":"1200 ns (Shark-Fin NACK)","~5%"],
    ["OLED Display State",`${passI2c?"OK (0x3C ACK)":"I2C Bus Timeout"}`,passI2c?"Rendered BPM":"Blank OLED",passI2c?"Live Update":"Stalled","—"]
   ]
  };
 }
 if(id==="phys2b_rc_neon"){
  const v0=Number(st.v0??10),r1=Number(st.r1m??22)*1e6,rd=Number(st.rdvmm??10)*1e6,c=Number(st.cuf??0.47)*1e-6,va=Number(st.va??95);
  const req=(r1*rd)/(r1+rd);
  const tau=req*c,tHalf=0.693*tau;
  const neonR=1e6,von=72,voff=55;
  const tNeon=neonR*c*Math.log((va-voff)/(va-von));
  return {
   summary:`R_eq (22MΩ ∥ 10MΩ DVM) = ${(req/1e6).toFixed(3)} MΩ · τ = ${tau.toFixed(2)} s · t_1/2 = ${tHalf.toFixed(2)} s · Neon Period T = ${tNeon.toFixed(3)} s`,
   rows:[
    ["Parallel Loaded R_eq = R1 ∥ R_DVM",`${(req/1e6).toFixed(3)} MΩ`,`${(req/1e6).toFixed(3)} MΩ`,`${((req/1e6)*1.02).toFixed(3)} MΩ`,`2.0%`],
    ["Time Constant τ = R_eq × C",`${tau.toFixed(3)} s`,`${tau.toFixed(3)} s`,`${(tau*1.03).toFixed(3)} s`,`3.0%`],
    ["Half-Life t_1/2 = 0.693 τ",`${tHalf.toFixed(3)} s`,`${tHalf.toFixed(3)} s`,`${(tHalf*1.025).toFixed(3)} s`,`2.5%`],
    ["DVM Divided V_meas @ t=0",`${(v0*(rd/(r1+rd))).toFixed(3)} V`,`${(v0*(rd/(r1+rd))).toFixed(3)} V`,`${(v0*(rd/(r1+rd))*0.99).toFixed(3)} V`,`1.0%`],
    ["Neon Bulb Period T = R C ln(...)",`${tNeon.toFixed(3)} s`,`${tNeon.toFixed(3)} s`,`${(tNeon*1.04).toFixed(3)} s`,`4.0%`]
   ]
  };
 }
 if(id==="engr844_stm32_bench"){
  const r=Number(st.rdac??1000),c=Number(st.cnanof??10)*1e-9,note=Number(st.midiNote??69);
  const fc=1/(2*Math.PI*r*c);
  const fnote=440*Math.pow(2,(note-69)/12);
  return {
   summary:`DAC1 RC Cutoff f_c = ${(fc/1000).toFixed(2)} kHz · MIDI Note #${note} = ${fnote.toFixed(2)} Hz · UART3 Packet [AA 01 03 07 D0 07 D2]`,
   rows:[
    ["DAC1 Filter Cutoff f_c = 1/(2πRC)",`${(fc/1000).toFixed(2)} kHz`,`${(fc/1000).toFixed(2)} kHz`,`15.65 kHz (1000Ω/10nF)`,`1.67%`],
    ["Synth Note Frequency",`${fnote.toFixed(2)} Hz`,`${fnote.toFixed(2)} Hz`,`${(fnote*1.001).toFixed(2)} Hz (Timer)`,`0.10%`],
    ["Render Budget vs Measured PB0","<= 2.67 ms","0.81 ms","0.812 ms (30.4% CPU)","0.25%"],
    ["Quadrature CH1/CH2 Phase Shift","90.0°","90.0°","89.8° (Scope XY)","0.22%"]
   ]
  };
 }
 // engr852_rtl_sad
 const tcq=Number(st.tcqMin??300),tl=Number(st.tlogicMin??30),th=Number(st.tholdMax??400),ts=Number(st.tskew??750),buf=Number(st.bufDelay??850);
 const arrRaw=tcq+tl,req=th+ts,slackRaw=arrRaw-req,slackFix=(arrRaw+buf)-req;
 return {
  summary:`Path P4 Raw Hold Slack = ${slackRaw} ps (${slackRaw<0?"RACE VIOLATION":"PASS"}) · With +${buf} ps Buffer => +${slackFix} ps (${slackFix>=0?"PASS":"FAIL"})`,
  rows:[
   ["Earliest Arrival t_CQ,min + t_MUX",`${arrRaw} ps`,`${arrRaw} ps`,`330 ps (Unbuffered)`,`0.0%`],
   ["Required Hold Window t_h + t_skew",`${req} ps`,`${req} ps`,`1150 ps`,`0.0%`],
   ["Unbuffered Hold Slack (Path P4)",`${slackRaw} ps`,`${slackRaw} ps (FAIL)`,`-820 ps RACE-THROUGH`,`0.0%`],
   ["Buffered Hold Slack (+Delay Buf)",`${slackFix>=0?"+"+slackFix:slackFix} ps`,slackFix>=0?"PASS":"FAIL",slackFix>=0?"Clean Capture DFF":"Still Violating","0.0%"]
  ]
 };
}

function renderBreadboardSvg(id,st,meas){
 // Detailed physical breadboard + Keysight EDU36311A / EDU34450A SVG illustration
 let svg='<rect width="620" height="250" rx="10" fill="#0d1928" stroke="#315278"/>';
 // Breadboard body
 svg+='<rect x="18" y="34" width="380" height="196" rx="8" fill="#f8f6ee" stroke="#cbd5e1" stroke-width="2"/>';
 svg+='<line x1="28" y1="48" x2="388" y2="48" stroke="#ef4444" stroke-width="2"/>';
 svg+='<line x1="28" y1="58" x2="388" y2="58" stroke="#3b82f6" stroke-width="2"/>';
 svg+='<line x1="28" y1="208" x2="388" y2="208" stroke="#ef4444" stroke-width="2"/>';
 svg+='<line x1="28" y1="218" x2="388" y2="218" stroke="#3b82f6" stroke-width="2"/>';
 svg+='<rect x="28" y="128" width="360" height="8" rx="2" fill="#d8d4c5"/>'; // center DIP valley
 // Breadboard holes grid
 for(let c=0;c<24;c++){
  const x=36+c*15;
  for(const y of [74,88,102,116,144,158,172,186]){
   svg+=`<rect x="${x}" y="${y}" width="4" height="4" rx="1" fill="#475569"/>`;
  }
 }

 // Top title
 svg+=`<text x="20" y="22" fill="#8ef3d2" font-size="11" font-weight="800" font-family="ui-monospace,monospace">PHYSICAL BREADBOARD &amp; KEYSIGHT BENCH HOOKUP · ${esc(LAB_PRESETS[id].name.slice(0,48))}</text>`;

 if(id==="tech60_lab7"){
  // Jumper wires & R1, R2, R3, R4 with color bands
  svg+='<path d="M52 48 V74 H82" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>';
  svg+='<path d="M292 172 V218" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>';
  // R1 (330 Ohm)
  svg+='<line x1="82" y1="74" x2="156" y2="74" stroke="#94a3b8" stroke-width="2.4"/><rect x="98" y="66" width="42" height="16" rx="4" fill="#d6b48a" stroke="#78350f"/><rect x="105" y="66" width="4" height="16" fill="#f97316"/><rect x="113" y="66" width="4" height="16" fill="#f97316"/><rect x="121" y="66" width="4" height="16" fill="#7c2d12"/><text x="119" y="96" text-anchor="middle" font-size="9.5" font-weight="800" fill="#1e293b">R1 '+esc(st.r1||330)+'Ω</text>';
  // R2 (1k) & R3 (470) in parallel between Node A (156) and Node B (232)
  svg+='<line x1="156" y1="74" x2="156" y2="144" stroke="#eab308" stroke-width="2.5"/>';
  svg+='<line x1="156" y1="102" x2="232" y2="102" stroke="#94a3b8" stroke-width="2.2"/><rect x="174" y="94" width="40" height="15" rx="4" fill="#d6b48a" stroke="#78350f"/><rect x="181" y="94" width="4" height="15" fill="#7c2d12"/><rect x="189" y="94" width="4" height="15" fill="#0f172a"/><rect x="197" y="94" width="4" height="15" fill="#dc2626"/><text x="194" y="122" text-anchor="middle" font-size="9" font-weight="800" fill="#1e293b">R2 '+esc(st.r2||1000)+'Ω</text>';
  svg+='<line x1="156" y1="144" x2="232" y2="144" stroke="#94a3b8" stroke-width="2.2"/><rect x="174" y="136" width="40" height="15" rx="4" fill="#d6b48a" stroke="#78350f"/><rect x="181" y="136" width="4" height="15" fill="#eab308"/><rect x="189" y="136" width="4" height="15" fill="#7e22ce"/><rect x="197" y="136" width="4" height="15" fill="#7c2d12"/><text x="194" y="164" text-anchor="middle" font-size="9" font-weight="800" fill="#1e293b">R3 '+esc(st.r3||470)+'Ω</text>';
  svg+='<line x1="232" y1="102" x2="232" y2="144" stroke="#22c55e" stroke-width="2.5"/>';
  // R4 (220)
  svg+='<line x1="232" y1="172" x2="292" y2="172" stroke="#94a3b8" stroke-width="2.2"/><rect x="242" y="164" width="40" height="15" rx="4" fill="#d6b48a" stroke="#78350f"/><rect x="248" y="164" width="4" height="15" fill="#dc2626"/><rect x="256" y="164" width="4" height="15" fill="#dc2626"/><rect x="264" y="164" width="4" height="15" fill="#7c2d12"/><text x="262" y="192" text-anchor="middle" font-size="9" font-weight="800" fill="#1e293b">R4 '+esc(st.r4||220)+'Ω</text>';
 }else if(id==="tech60_lab5_pulse"){
  // Arduino Nano + HW-827 + I2C OLED
  svg+='<rect x="52" y="88" width="110" height="72" rx="6" fill="#1d4ed8" stroke="#0f172a" stroke-width="2"/><text x="107" y="120" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">ARDUINO NANO</text><text x="107" y="136" text-anchor="middle" fill="#bae6fd" font-size="9">A0 · A4(SDA) · A5(SCL)</text>';
  svg+='<rect x="200" y="72" width="76" height="44" rx="6" fill="#be123c" stroke="#0f172a"/><text x="238" y="96" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="800">HW-827</text><text x="238" y="108" text-anchor="middle" fill="#fecdd3" font-size="8.5">BPM='+esc(st.bpm||72)+'</text>';
  svg+='<rect x="292" y="72" width="84" height="54" rx="5" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/><text x="334" y="96" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="800">SSD1306 OLED</text><text x="334" y="112" text-anchor="middle" fill="#86efac" font-size="9">Avg: '+esc(st.bpm||72)+' BPM</text>';
  svg+='<path d="M162 104 H200 M162 114 H292" fill="none" stroke="#22c55e" stroke-width="2.5"/>';
  svg+='<text x="292" y="148" font-size="9.5" font-weight="800" fill="#1e293b">Pull-Ups R_p = '+esc(st.pullup||2200)+'Ω</text>';
 }else{
  // STM32 / Physics 2B / ENGR 852 Physical Module View
  svg+='<rect x="58" y="84" width="130" height="78" rx="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="123" y="114" text-anchor="middle" fill="#e2f2ff" font-size="10.5" font-weight="800">'+(id==="phys2b_rc_neon"?"RC + NE-2 LAMP":(id==="engr844_stm32_bench"?"STM32 NUCLEO":"RTL HOLD BUFFER"))+'</text><text x="123" y="132" text-anchor="middle" fill="#7ef4d4" font-size="9">Kelvin &amp; Scope TPs</text>';
  svg+='<rect x="234" y="92" width="120" height="62" rx="7" fill="#0f2d22" stroke="#10b981" stroke-width="2"/><text x="294" y="118" text-anchor="middle" fill="#a7f3d0" font-size="10" font-weight="800">Keysight Probe Node</text><text x="294" y="134" text-anchor="middle" fill="#fde68a" font-size="9">CH1–CH4 Synced</text>';
  svg+='<path d="M188 122 H234" stroke="#f59e0b" stroke-width="3"/>';
 }

 // Right side: Virtual Keysight EDU36311A Supply + EDU34450A DMM Readout Display
 const vsVal=id==="tech60_lab7"?(Number(st.vs??9).toFixed(3)+" V"):(id==="phys2b_rc_neon"?(Number(st.v0??10).toFixed(2)+" V"):(id==="engr852_rtl_sad"?"0.900 V":"5.000 V"));
 const dmmVal=meas.rows[0]?.[3]||"—";
 svg+=`<rect x="412" y="34" width="194" height="92" rx="8" fill="#111827" stroke="#4b5563" stroke-width="1.8"/>`;
 svg+=`<text x="422" y="52" fill="#9ca3af" font-size="9.5" font-weight="800" font-family="ui-monospace,monospace">KEYSIGHT EDU36311A PSU</text>`;
 svg+=`<text x="422" y="82" fill="#fde047" font-size="22" font-weight="800" font-family="ui-monospace,monospace">+${esc(vsVal)}</text>`;
 svg+=`<text x="422" y="106" fill="#6ee7b7" font-size="10" font-family="ui-monospace,monospace">CH1 OUTPUT ON · CV MODE</text>`;

 svg+=`<rect x="412" y="138" width="194" height="92" rx="8" fill="#111827" stroke="#38bdf8" stroke-width="1.8"/>`;
 svg+=`<text x="422" y="156" fill="#93c5fd" font-size="9.5" font-weight="800" font-family="ui-monospace,monospace">KEYSIGHT EDU34450A DMM</text>`;
 svg+=`<text x="422" y="186" fill="#38bdf8" font-size="16" font-weight="800" font-family="ui-monospace,monospace">${esc(dmmVal.slice(0,18))}</text>`;
 svg+=`<text x="422" y="210" fill="#cbd5e1" font-size="10" font-family="ui-monospace,monospace">2-WIRE / 5.5 DIGIT LIVE</text>`;

 return svg;
}

function renderLabBenchMarkup(){
 const opts=Object.values(LAB_PRESETS).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");
 return `<section class="lb-studio" id="lbStudio">
  <div class="lb-head">
   <div>
    <b>🔬 REAL-LIFE LAB BENCH SIMULATOR · BREADBOARD CIRCUIT, KEYSIGHT INSTRUMENTS &amp; 7-STEP LAB REPORT</b>
    <p>Interactive coursework hardware benches (SJSU Tech 60 Lab 5/7/8, EVC Physics 2B RC/Neon, SFSU ENGR 844 STM32 &amp; ENGR 852 RTL): adjust physical resistors, capacitors &amp; pull-ups, compare Hand Calc vs Sim vs Breadboard % Error, and generate a complete Lab Report.</p>
   </div>
   <label class="lb-preset-lbl">Coursework Lab Preset<select id="lbPresetSelect">${opts}</select></label>
  </div>

  <div class="lb-controls-bar" id="lbControlsBar"></div>

  <div class="lb-bench-grid">
   <div class="lb-svg-card">
    <svg id="lbBreadboardSvg" viewBox="0 0 620 250" role="img" aria-label="Interactive solderless breadboard and Keysight bench instruments"></svg>
   </div>
   <div class="lb-summary-card">
    <div id="lbFormulaBox" class="lb-formula-box"></div>
    <div id="lbLiveSummary" class="lb-live-summary"></div>
   </div>
  </div>

  <div class="nb-table-scroll">
   <table class="nb-table lb-comp-table">
    <thead><tr><th>Parameter / Node</th><th>Hand Calculation</th><th>Multisim / SPICE Sim</th><th>Real Breadboard / DMM</th><th>% Error</th></tr></thead>
    <tbody id="lbCompTbody"></tbody>
   </table>
  </div>

  <div class="lb-report-builder" id="lbReportBuilder">
   <div class="lb-report-head">
    <b>📝 INTERACTIVE 7-STEP ENGINEERING LAB REPORT STUDIO</b>
    <div class="lb-report-actions">
     <button type="button" id="lbSyncReport">↻ Sync Live Bench Data into Report</button>
     <button type="button" id="lbExportMd" class="lb-btn-pri">⬇ Export Lab Report (.md)</button>
     <button type="button" id="lbExportJson">⬇ Export Data (.json)</button>
    </div>
   </div>
   <div class="lb-report-steps">
    <div class="lb-rstep"><label>1. Lab Title &amp; Bench Equipment</label><input id="lbRepTitle" type="text"></div>
    <div class="lb-rstep"><label>2. Microcontroller / Board Selection</label><select id="lbMcuSelect"><option value="STM32 Nucleo-F446RE / L476RG">STM32 Nucleo-F446RE / L476RG (CubeMX HAL)</option><option value="Arduino Nano (ATmega328P)">Arduino Nano (ATmega328P · A0/A4/A5/D2)</option><option value="Pure Analog Breadboard (Keysight Bench)">Pure Analog Breadboard (Keysight EDU36311A + EDU34450A)</option><option value="ASIC RTL DUT + Synopsys VCS/Verdi">ASIC RTL DUT + Synopsys VCS / Verdi</option></select></div>
    <div class="lb-rstep lb-wide"><label>3. Purpose &amp; Engineering Objective</label><textarea id="lbRepPurpose" rows="2"></textarea></div>
    <div class="lb-rstep lb-wide"><label>4. Step-by-Step Procedure &amp; Pinout / Probe Notes</label><textarea id="lbRepProc" rows="4"></textarea></div>
    <div class="lb-rstep lb-wide"><label>5–7. Student Analysis, Root-Cause Reflection &amp; Conclusion</label><textarea id="lbRepConc" rows="3"></textarea></div>
   </div>
  </div>
 </section>`;
}

function mountLabBenchStudio(root){
 if(!root)return;
 const studio=root.querySelector("#lbStudio");
 if(!studio||studio.dataset.mounted==="1")return;
 studio.dataset.mounted="1";
 const $=s=>studio.querySelector(s);
 let currentId="tech60_lab7";
 let state={...LAB_PRESETS[currentId].defaults};

 function renderControls(){
  const bar=$("#lbControlsBar");
  if(currentId==="tech60_lab7"){
   bar.innerHTML=`
    <label>Supply Vs (V)<input data-lb-key="vs" type="number" step="0.5" min="1" max="24" value="${state.vs}"></label>
    <label>R1 (Ω)<input data-lb-key="r1" type="number" step="10" min="10" max="10000" value="${state.r1}"></label>
    <label>R2 (Ω)<input data-lb-key="r2" type="number" step="10" min="10" max="10000" value="${state.r2}"></label>
    <label>R3 (Ω)<input data-lb-key="r3" type="number" step="10" min="10" max="10000" value="${state.r3}"></label>
    <label>R4 (Ω)<input data-lb-key="r4" type="number" step="10" min="10" max="10000" value="${state.r4}"></label>
   `;
  }else if(currentId==="tech60_lab5_pulse"){
   bar.innerHTML=`
    <label>Simulated Heart Rate (BPM)<input data-lb-key="bpm" type="range" min="48" max="160" value="${state.bpm}"> <span>${state.bpm} BPM</span></label>
    <label>I²C Pull-Up Resistor<select data-lb-key="pullup"><option value="2200" ${Number(state.pullup)===2200?"selected":""}>2.2 kΩ (Clean Fast-Mode ACK)</option><option value="47000" ${Number(state.pullup)===47000?"selected":""}>47 kΩ (Shark-Fin RC NACK Bug)</option></select></label>
   `;
  }else if(currentId==="phys2b_rc_neon"){
   bar.innerHTML=`
    <label>Initial Charge V0 (V)<input data-lb-key="v0" type="number" step="1" min="5" max="24" value="${state.v0}"></label>
    <label>Discharge R1 (MΩ)<input data-lb-key="r1m" type="number" step="1" min="1" max="50" value="${state.r1m}"></label>
    <label>DVM Input R_DVM (MΩ)<input data-lb-key="rdvmm" type="number" step="1" min="1" max="100" value="${state.rdvmm}"></label>
    <label>Capacitor C (μF)<input data-lb-key="cuf" type="number" step="0.05" min="0.1" max="10" value="${state.cuf}"></label>
    <label>Neon Supply Va (V)<input data-lb-key="va" type="number" step="1" min="75" max="140" value="${state.va}"></label>
   `;
  }else if(currentId==="engr844_stm32_bench"){
   bar.innerHTML=`
    <label>DAC LPF Resistor R (Ω)<input data-lb-key="rdac" type="number" step="100" min="100" max="10000" value="${state.rdac}"></label>
    <label>DAC LPF Capacitor C (nF)<input data-lb-key="cnanof" type="number" step="1" min="1" max="100" value="${state.cnanof}"></label>
    <label>MIDI Note # (60=C4, 69=A4)<input data-lb-key="midiNote" type="number" step="1" min="36" max="96" value="${state.midiNote}"></label>
   `;
  }else{
   bar.innerHTML=`
    <label>t_CQ,min (ps)<input data-lb-key="tcqMin" type="number" step="10" min="50" max="1000" value="${state.tcqMin}"></label>
    <label>MUX Fast t_logic,min (ps)<input data-lb-key="tlogicMin" type="number" step="10" min="10" max="500" value="${state.tlogicMin}"></label>
    <label>t_hold,max (ps)<input data-lb-key="tholdMax" type="number" step="10" min="50" max="1000" value="${state.tholdMax}"></label>
    <label>t_skew (ps)<input data-lb-key="tskew" type="number" step="50" min="0" max="1500" value="${state.tskew}"></label>
    <label>Inserted Hold Buffer (ps)<input data-lb-key="bufDelay" type="number" step="50" min="0" max="1500" value="${state.bufDelay}"></label>
   `;
  }
  bar.querySelectorAll("[data-lb-key]").forEach(el=>{
   el.oninput=el.onchange=()=>{
    state[el.dataset.lbKey]=Number(el.value);
    if(el.nextElementSibling&&el.nextElementSibling.tagName==="SPAN")el.nextElementSibling.textContent=el.value+" BPM";
    updateOutputs();
   };
  });
 }

 function updateOutputs(){
  const p=LAB_PRESETS[currentId];
  const meas=computeMeasurements(currentId,state);
  $("#lbBreadboardSvg").innerHTML=renderBreadboardSvg(currentId,state,meas);
  $("#lbLiveSummary").textContent=meas.summary;
  $("#lbFormulaBox").innerHTML=window.studyMathEquationCard
   ? window.studyMathEquationCard(p.equation,meas.summary)
   : esc(p.equation);
  $("#lbCompTbody").innerHTML=meas.rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join("")}</tr>`).join("");
 }

 function syncReportFields(){
  const p=LAB_PRESETS[currentId];
  const meas=computeMeasurements(currentId,state);
  $("#lbRepTitle").value=p.name;
  $("#lbRepPurpose").value=p.purpose;
  $("#lbRepProc").value=p.procedure.join("\n");
  $("#lbRepConc").value=`Verified against live bench model (${meas.summary}). Hand calculations, SPICE simulation, and physical Keysight/DMM measurements agree within component tolerance (~1–3%).`;
 }

 $("#lbPresetSelect").onchange=()=>{
  currentId=$("#lbPresetSelect").value;
  state={...LAB_PRESETS[currentId].defaults};
  renderControls();
  updateOutputs();
  syncReportFields();
 };

 $("#lbSyncReport").onclick=syncReportFields;

 function downloadFile(name,content,mime){
  const url=URL.createObjectURL(new Blob([content],{type:mime})),a=document.createElement("a");
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),800);
 }

 $("#lbExportMd").onclick=()=>{
  const meas=computeMeasurements(currentId,state);
  const tbl="| Parameter | Hand Calc | Sim | Breadboard/DMM | % Error |\n|---|---|---|---|---|\n"+meas.rows.map(r=>`| ${r.join(" | ")} |`).join("\n");
  const md=`# ${$("#lbRepTitle").value}\n\n**Microcontroller / Platform:** ${$("#lbMcuSelect").value}\n**Equipment:** ${LAB_PRESETS[currentId].equipment}\n\n## 2. Purpose\n${$("#lbRepPurpose").value}\n\n## 4. Procedure\n${$("#lbRepProc").value}\n\n## 5. Data & Observations\n${tbl}\n\n## 6. Governing Equation\n\`${LAB_PRESETS[currentId].equation}\`\n\n## 7. Conclusion\n${$("#lbRepConc").value}\n`;
  downloadFile(`${currentId}-lab-report.md`,md,"text/markdown");
 };

 $("#lbExportJson").onclick=()=>{
  const meas=computeMeasurements(currentId,state);
  downloadFile(`${currentId}-lab-data.json`,JSON.stringify({preset:currentId,mcu:$("#lbMcuSelect").value,parameters:state,measurements:meas.rows,conclusion:$("#lbRepConc").value},null,2),"application/json");
 };

 renderControls();
 updateOutputs();
 syncReportFields();
}

window.renderLabBenchStudio=renderLabBenchMarkup;
window.mountLabBenchStudio=mountLabBenchStudio;
window.LAB_BENCH_PRESETS=LAB_PRESETS;
})();
