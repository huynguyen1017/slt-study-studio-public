"use strict";
/* Keysight Infiniium-Style Web Oscilloscope + Physical Probe & Board Strip (v12).
 * Supports all 11 Keysight Infiniium menubar menus (Scope, File, Control, Setup,
 * Display, Trigger, Measure, Math, Analyze, Utilities, Help), Faulty vs Fixed
 * captures, .set bench presets, Math (F1), Reference (R1), 14-metric stats,
 * FFT + register/protocol decode, CSV/SVG/.set export & import, and unique
 * waveforms across all 100 flashcards and 26 guided lab steps. */
(function(){
const colors=["#f4df45","#53da87","#5fa9ff","#f18aaf"];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),step=(t,x)=>+(t>=x),wave=(t,a,b)=>t>=a&&t<b?1:0;
const shape=(t,c,d=5,decay=17)=>t>=c?Math.exp(-(t-c)/decay)*Math.sin((t-c)/d*Math.PI*2):0;
const ring=(t,edge,mag,omega=1.7,tau=5.5)=>t<edge?0:mag*Math.exp(-(t-edge)/tau)*Math.sin((t-edge)*omega);
const fmt=(v,u)=>(!Number.isFinite(v)?"—":(Math.abs(v)>=100?v.toFixed(1):Math.abs(v)>=10?v.toFixed(2):v.toFixed(3)))+" "+u;
const spec=(name,type,unit,min,max,fn,desc,probe="10:1 Low-C Passive",coupling="DC 1MΩ",bw="2 GHz")=>({name,type,unit,min,max,fn,desc,probe,coupling,bw});
const event=(t,label,ch,reason)=>({t,label,ch,reason});

const TIME_SCALE={"ns":1e-9,"μs":1e-6,"ms":1e-3,"s":1};

function lookup(rows,t,col){
 let lo=0,hi=rows.length-1;
 while(lo<hi){let m=(lo+hi)>>1;if(rows[m][0]<t)lo=m+1;else hi=m;}
 if(lo>0&&Math.abs(rows[lo-1][0]-t)<Math.abs(rows[lo][0]-t))lo--;
 return rows[lo][col];
}

function hashStr(s){
 let h=2166136261>>>0;
 const str=String(s||"");
 for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}
 return h>>>0;
}

// Built-in Keysight Infiniium .set Bench Presets + MBU DVFS + ENGR 852
function getPresets(){
 const mbuLeft={
  id:"MBU_DVFS_transition_cpu2_left",
  title:"MBU DVFS Transition (−28 μs Left Window · 30 μs/div · 8 GSa/s · 10 Mpts)",
  unit:"μs",T:300,t0:-28,sampleRate:"8 GSa/s",memDepth:"10 Mpts",presetName:"MBU_DVFS_transition_cpu2_left.set",
  faultLabel:"DVFS Droop + FLL Unlock",fixedLabel:"Staged DCO Switch + Guardband",
  signalsFault:[
   spec("CLKOUT1","clock","MHz",800,1900,(t,mod)=>1200+450*step(t,mod.e1)-190*Math.exp(-Math.max(0,t-mod.e1)/35)*step(t,mod.e1),"SMA-to-BNC CH1 divided clock out; droops during unguarded dI/dt","SMA-BNC 50Ω","DC 50Ω","12 GHz"),
   spec("VDD_CORE","rail","V",0.58,0.96,(t,mod)=>0.78*mod.vScale+0.11*step(t,mod.e1)-0.135*mod.rNorm*Math.exp(-Math.max(0,t-mod.e1)/18)*step(t,mod.e1)+ring(t,mod.e1,-0.045,0.42,26),"Keysight N7020A Power Rail probe on VDD logic rail","Keysight N7020A","DC 50Ω","2 GHz"),
   spec("I_RSENSE","current","A",1,18,(t,mod)=>(3.2+9.8*step(t,mod.e1)*(1-Math.exp(-Math.max(0,t-mod.e1)/4.5)))*mod.vScale,"Keysight 1169B 12 GHz Diff probe across Veagle R_sense (5 mΩ)","Keysight 1169B","DC Diff","12 GHz"),
   spec("VDD_M","rail","V",0.68,0.96,(t,mod)=>0.85*mod.vScale+0.05*step(t,mod.e1)-0.04*step(t,mod.e1)*Math.exp(-Math.max(0,t-mod.e1)/22),"Keysight N7020A Power Rail probe on VDD_M memory array rail","Keysight N7020A","DC 50Ω","2 GHz")
  ],
  signalsFixed:[
   spec("CLKOUT1","clock","MHz",800,1900,(t,mod)=>1200+450*(1-Math.exp(-Math.max(0,t-mod.e1)/16))*step(t,mod.e1),"Staged glitchless DCO switch: post_div_sel=2 -> ENABLE_MASK=3 -> SELECT=1","SMA-BNC 50Ω","DC 50Ω","12 GHz"),
   spec("VDD_CORE","rail","V",0.58,0.96,(t,mod)=>0.78*mod.vScale+0.11*(1-Math.exp(-Math.max(0,t-mod.e1)/24))*step(t,mod.e1)-0.025*step(t,mod.e1)*Math.exp(-Math.max(0,t-mod.e1)/25),"Clean VDD ramp with pre-ramp before clock gear-up; droop < 28 mV","Keysight N7020A","DC 50Ω","2 GHz"),
   spec("I_RSENSE","current","A",1,18,(t,mod)=>(3.2+7.4*(1-Math.exp(-Math.max(0,t-mod.e1)/18))*step(t,mod.e1))*mod.vScale,"Slew-controlled current step across R_sense via di/dt throttler 0x36604360","Keysight 1169B","DC Diff","12 GSa/s"),
   spec("VDD_M","rail","V",0.68,0.96,(t,mod)=>0.85*mod.vScale+0.05*(1-Math.exp(-Math.max(0,t-mod.e1)/20))*step(t,mod.e1),"Stable VDD_M tracking without under-voltage brownout","Keysight N7020A","DC 50Ω","2 GHz")
  ],
  registers:[
   ["0x20f884fc","FLL_LOCK_STATUS","0x0000_0001 (UNLOCKED in fault @ droop / 0x0000_0003 LOCKED in fix)"],
   ["0x20f884f4","FLL_WATERMARK_HI","Peak DCO code captured after CLR=1"],
   ["0x20f884f8","FLL_WATERMARK_LO","Minimum VDD frequency watermark during dI/dt event"],
   ["0x36604360","didtPowerSampleInterval","Throttling sample window for Veagle current sensor"]
  ],
  events:[event(65,"DVFS Request (t=-28 μs)",1,"PMIC shifts VDD target before/during DCO transition"),event(115,"Peak dI/dt & Watermark LO",2,"Highest instantaneous current slope crosses R_sense"),event(210,"FLL Settling Check",0,"Confirm FLL lock 0x20f884fc & HI/LO watermarks")],
  lesson:"Educational bring-up DVFS model inspired by MBU_DVFS_transition_cpu2_left.set (30 μs/div, 8 GSa/s, 10 Mpts): raise VDD before stepping DCO frequency and use glitchless muxing."
 };

 const mbuRight={
  id:"MBU_DVFS_transition_cpu2_right",
  title:"MBU DVFS Settlement (+460 μs Right Window · 30 μs/div · 8 GSa/s · 10 Mpts)",
  unit:"μs",T:300,t0:460,sampleRate:"8 GSa/s",memDepth:"10 Mpts",presetName:"MBU_DVFS_transition_cpu2_right.set",
  faultLabel:"Watermark Drift + Ringing",fixedLabel:"Clean FLL Settled + DCO=1",
  signalsFault:[
   spec("CLKOUT0","clock","MHz",1400,2100,(t,mod)=>1760+85*ring(t,80,1,0.22,55),"Divided FLL clock shows slow frequency hunting around target","SMA-BNC 50Ω","DC 50Ω","12 GHz"),
   spec("VDD_CORE","rail","V",0.78,1.02,(t,mod)=>0.89*mod.vScale-0.065*step(t,80)*Math.exp(-(t-80)/32),"VDD post-step under-damped sag during compute tile wake","Keysight N7020A","DC 50Ω","2 GHz"),
   spec("I_TILE_BURST","current","A",4,19,(t,mod)=>(7.5+8.5*wave(t,80,175))*mod.vScale,"High workload current plateau measured across 5 mΩ shunt","Keysight 1169B","DC Diff","12 GHz"),
   spec("FLL_ERR","rail","mV",-60,60,(t,mod)=>45*ring(t,80,1,0.35,48),"Internal FLL phase/frequency discriminator residual error","On-die DAC","DC","200 MHz")
  ],
  signalsFixed:[
   spec("CLKOUT0","clock","MHz",1400,2100,(t,mod)=>1780+6*Math.sin(t*0.1),"Locked target frequency steady inside +/-0.4% guardband","SMA-BNC 50Ω","DC 50Ω","12 GHz"),
   spec("VDD_CORE","rail","V",0.78,1.02,(t,mod)=>0.89*mod.vScale-0.015*wave(t,80,175),"Tight PDN regulation (<16 mV sag) with ceramic decap bank","Keysight N7020A","DC 50Ω","2 GHz"),
   spec("I_TILE_BURST","current","A",4,19,(t,mod)=>(7.5+7.0*wave(t,80,175))*mod.vScale,"Smooth current profile with di/dt throttling active","Keysight 1169B","DC Diff","12 GHz"),
   spec("FLL_ERR","rail","mV",-60,60,(t,mod)=>6*Math.sin(t*0.2)*Math.exp(-t/120),"Discriminator error settled within LSB deadband","On-die DAC","DC","200 MHz")
  ],
  registers:[
   ["DCO Sequence","1) post_div_sel=2","2) DCO_ENABLE_MASK=3 -> DCO_SELECT=1 -> ENABLE_MASK=2"],
   ["0x20f88470","FLL_WATERMARK_CLR","Write 1 then 0 after settling to arm watermark tracker"]
  ],
  events:[event(80,"+460 μs Heavy Tile Burst",2,"Compute burst tests late DVFS post-transition settling"),event(175,"Burst Release",2,"Watch inductive overshoot when current releases"),event(245,"Watermark Readback",0,"Verify FLL_WATERMARK_HI/LO bounds")],
  lesson:"Right-window (+460 μs) settling check confirms that once DCO glitchless switch finishes (ENABLE_MASK=2), late workload bursts keep VDD and CLKOUT within FLL watermark limits."
 };

 const veagle16={
  id:"Veagle_1169B_Rsense_16GSa_22Mpts",
  title:"High-BW di/dt Shunt & Droop (16 GSa/s · 22 Mpts · Keysight 1169B Diff Probe)",
  unit:"ns",T:160,t0:0,sampleRate:"16 GSa/s",memDepth:"22 Mpts",presetName:"Veagle_1169B_Rsense_16GSa_22Mpts.set",
  faultLabel:"Alligator Ground Loop + Unthrottled di/dt",fixedLabel:"5mm Spring Tip + 1169B Diff Probe",
  signalsFault:[
   spec("VDD_DIE","rail","V",0.65,1.25,(t,mod)=>1.0*mod.vScale-0.19*step(t,35)*Math.exp(-(t-35)/22)+ring(t,35,-0.14,0.85,18)+ring(t,95,0.11,0.85,18),"VDD probed with long ground lead: huge 100+ MHz fake fixture ring + real droop","10:1 Alligator Lead","DC 1MΩ","12 GHz"),
   spec("V_RSENSE_DIFF","rail","mV",-15,120,(t,mod)=>(18+72*wave(t,35,95)+19*ring(t,35,1,0.9,14))*mod.vScale,"Differential voltage across 5 mΩ R_sense = I * 5 mΩ","Keysight 1169B","DC Diff","12 GHz"),
   spec("I_LOAD","current","A",0,25,(t,mod)=>(3.6+14.4*wave(t,35,95)+3.8*ring(t,35,1,0.9,14))*mod.vScale,"Instantaneous load current (I = V_sense / 5 mΩ)","Derived CH2/5mΩ","MATH","12 GHz"),
   spec("THROTTLE_FLAG","digital","logic",-0.15,1.15,(t)=>wave(t,42,95),"Droop detector / di/dt throttle assert window","Logic Ch","DC","1 GHz")
  ],
  signalsFixed:[
   spec("VDD_DIE","rail","V",0.65,1.25,(t,mod)=>1.0*mod.vScale-0.065*wave(t,35,95)-0.022*ring(t,35,1,0.5,8),"Coax <5 mm spring tip eliminates loop L_gnd; true droop = 65 mV","N7020A Spring Tip","DC 50Ω","2 GHz"),
   spec("V_RSENSE_DIFF","rail","mV",-15,120,(t,mod)=>(18+52*(1-Math.exp(-Math.max(0,t-35)/4))*step(t,35)*(1-step(t,95)))*mod.vScale,"Clean Kelvin differential sensing across J10001/J10002 R_sense","Keysight 1169B","DC Diff","12 GHz"),
   spec("I_LOAD","current","A",0,25,(t,mod)=>(3.6+10.4*(1-Math.exp(-Math.max(0,t-35)/4))*step(t,35)*(1-step(t,95)))*mod.vScale,"Controlled di/dt current ramp (~14 A peak)","Derived CH2/5mΩ","MATH","12 GHz"),
   spec("THROTTLE_FLAG","digital","logic",-0.15,1.15,(t)=>0,"Margin preserved; throttle threshold not tripped","Logic Ch","DC","1 GHz")
  ],
  registers:[
   ["0x36604348","TilePowerInterval","Per-tile integration window for instantaneous power estimation"],
   ["0x366043f0","ThrottleCtrl","Hardware clock-stretch / duty-cycle throttle engagement threshold"]
  ],
  events:[event(35,"ns Current Step (16 GSa/s)",1,"14 A step across package L_eff creates V = L * dI/dt"),event(42,"Throttle Assert",3,"VDD crosses droop floor; duty-cycle throttler engages"),event(95,"Load Release",0,"Check inductive L*dI/dt overshoot at release edge")],
  lesson:"At 16 GSa/s & 22 Mpts, high-bandwidth probing distinguishes real package dI/dt droop from long ground-lead fixture resonance."
 };

 const i2cPreset={
  id:"I2C_47k_SharkFin_vs_2k2_Clean",
  title:"I²C Open-Drain Pull-Up RC vs Clean 9th-Bit ACK (400 kHz Fast Mode)",
  unit:"μs",T:30,t0:0,sampleRate:"500 MSa/s",memDepth:"1 Mpts",presetName:"I2C_47k_SharkFin_vs_2k2_Clean.set",
  faultLabel:"47 kΩ Shark-Fin -> 9th-Bit NACK",fixedLabel:"2.2 kΩ Pull-Up -> Clean 9th-Bit ACK",
  signalsFault:[
   spec("SCL (400kHz)","clock","V",-0.2,3.8,(t)=>Math.floor(t/1.25)%2*3.3,"400 kHz I²C serial clock line","10:1 Passive","DC 1MΩ","200 MHz"),
   spec("SDA (47k Pull-Up)","rail","V",-0.2,3.8,(t,mod)=>{const cyc=Math.floor(t/2.5),phase=(t%2.5)/2.5;const bit=(cyc===8)?1:([1,0,1,1,0,1,0,0,1,0,1,0][cyc%12]);return bit?3.3*(1-Math.exp(-phase*1.75))*mod.vScale:0.08;},"Slow RC rise (tau=47k*100pF=4.7μs) creates shark-fin; misses VIH -> NACK","10:1 Passive","DC 1MΩ","200 MHz"),
   spec("ACK_NACK (9th Clk)","digital","logic",-0.15,1.15,(t)=>wave(t,21.0,23.5),"NACK HIGH detected during 9th SCL rising edge","Protocol Decode","DC","200 MHz"),
   spec("I_PULLUP","current","mA",0,2.5,(t)=>wave(t,21.0,23.5)?0.07:0.06,"Tiny 47 kΩ pull-up current (~0.07 mA @ 3.3V) cannot charge C_bus fast","Derived","MATH","200 MHz")
  ],
  signalsFixed:[
   spec("SCL (400kHz)","clock","V",-0.2,3.8,(t)=>Math.floor(t/1.25)%2*3.3,"400 kHz I²C serial clock line","10:1 Passive","DC 1MΩ","200 MHz"),
   spec("SDA (2.2k Pull-Up)","rail","V",-0.2,3.8,(t,mod)=>{const cyc=Math.floor(t/2.5),phase=(t%2.5)/2.5;const bit=(cyc===8)?0:([1,0,1,1,0,1,0,0,0,0,1,0][cyc%12]);return bit?3.3*(1-Math.exp(-phase*10.5))*mod.vScale:0.05;},"Fast tr < 220 ns with 2.2 kΩ pull-up meets 300 ns spec -> 9th Bit ACK LOW","10:1 Passive","DC 1MΩ","200 MHz"),
   spec("ACK_NACK (9th Clk)","digital","logic",-0.15,1.15,(t)=>0,"Zero NACK errors; slave pulls SDA LOW on 9th clock","Protocol Decode","DC","200 MHz"),
   spec("I_PULLUP","current","mA",0,2.5,(t)=>1.5*(1-step(t,21.25))+0.1,"1.5 mA sink current stays well under 3 mA I²C Vol limit","Derived","MATH","200 MHz")
  ],
  registers:[["R_p Min","(V_DD - V_OL(max)) / I_OL(max)","(3.3 - 0.4) / 3 mA = 967 Ω minimum"],["R_p Max","t_r / (0.8473 * C_bus)","300 ns / (0.8473 * 150 pF) = 2.36 kΩ max"]],
  events:[event(2.5,"Address Bit #1",1,"Shark-fin RC rise slows SDA below V_IH(min)=2.31 V"),event(21.25,"9th Clock ACK Slot",2,"Slave fails to recognize address -> NACK (SDA=1) vs ACK (SDA=0)")],
  lesson:"Open-drain I²C drivers only pull LOW; rising edges rely strictly on R_p * C_bus. Replacing 47 kΩ with 2.2 kΩ cures shark-fin NACKs."
 };

 const engr852={
  id:"ENGR852_520MHz_14nm_SAD_Pipeline",
  title:"ENGR 852 520 MHz 14nm Motion Estimator · 8-Bit Overflow vs 16-Bit BestDist Fix",
  unit:"ns",T:16,t0:0,sampleRate:"20 GSa/s",memDepth:"50 Mpts",presetName:"ENGR852_520MHz_14nm_SAD_Pipeline.set",
  faultLabel:"8-Bit Wraparound Truncation (BestDist=0xFF)",fixedLabel:"16-Bit PE + Verdi Clean BestMV",
  signalsFault:[
   spec("CLK_520MHz","clock","V",-0.1,1.1,(t)=>Math.floor(t/0.9615)%2*0.8,"520 MHz system clock (T = 1.923 ns @ 14nm FF/0.8V)","VCS/Verdi nWave","DC","12 GHz"),
   spec("SAD_SUM_8BIT","bus","hex",0,255,(t)=>t<4?220:t<8?255:t<12?(48):12,"TRUNCATED 8-bit sum wraps modulo 256 (304 -> 0x30)!","RTL Bus Probe","LOGIC","—"),
   spec("BEST_DIST","bus","hex",0,255,(t)=>t<8?220:48,"False minimum captured due to 8-bit wraparound bug!","RTL Bus Probe","LOGIC","—"),
   spec("MOTION_X_ERR","digital","logic",-0.15,1.15,(t)=>step(t,8),"Golden model mismatch flag raised in Verdi assertion","SVA Flag","LOGIC","—")
  ],
  signalsFixed:[
   spec("CLK_520MHz","clock","V",-0.1,1.1,(t)=>Math.floor(t/0.9615)%2*0.8,"520 MHz system clock (T = 1.923 ns @ 14nm FinFET)","VCS/Verdi nWave","DC","12 GHz"),
   spec("SAD_SUM_16BIT","bus","hex",0,511,(t)=>t<4?220:t<8?304:t<12?184:96,"Full 12/16-bit datapath preserves true 304 (0x130) sum without wrap","RTL Bus Probe","LOGIC","—"),
   spec("BEST_DIST","bus","hex",0,511,(t)=>t<12?184:96,"True minimum candidate retained accurately","RTL Bus Probe","LOGIC","—"),
   spec("MOTION_X_ERR","digital","logic",-0.15,1.15,(t)=>0,"Zero mismatches across 256-pixel full search window","SVA Flag","LOGIC","—")
  ],
  registers:[["RTL Bug","reg [7:0] BestDist;","Max SAD per 4x4*256 block > 255 wraps! Fixed with reg [15:0] BestDist"],["Clock Period","T_clk = 1 / 520 MHz = 1.923 ns","Critical path closed cleanly in Design Compiler 14nm"] ],
  events:[event(4.0,"Sum > 255 Overflow",1,"8-bit accumulator wraps 304 -> 48, fooling comparator"),event(8.0,"Verdi nWave Mismatch",3,"TB catches golden BestMV delta immediately")],
  lesson:"Bit-width truncation in RTL datapaths manifests identically to hardware corruption in Verdi nWave; widen accumulator + comparator registers beyond worst-case sum."
 };

 const startupPreset={
  id:"Startup_4CH_PG_CLK_RST",
  title:"4-Channel Boot Sequencing · CORE_PG / IO_PG / REFCLK / SYS_RESET#",
  unit:"ns",T:110,t0:0,sampleRate:"10 GSa/s",memDepth:"10 Mpts",presetName:"Startup_4CH_PG_CLK_RST.set",
  faultLabel:"Early Reset Release (Before PLL Lock)",fixedLabel:"Monotonic PG + 20ns Post-Lock Reset",
  signalsFault:[
   spec("CORE_PG","digital","logic",-0.15,1.15,(t)=>step(t,12),"Core VR Power-Good @ 12 ns","10:1 Passive","DC 1MΩ","500 MHz"),
   spec("IO_PG","digital","logic",-0.15,1.15,(t)=>step(t,28),"IO/PLL rail Power-Good @ 28 ns","10:1 Passive","DC 1MΩ","500 MHz"),
   spec("PLL_LOCK","digital","logic",-0.15,1.15,(t)=>step(t,48),"100 MHz REFCLK qualified + PLL lock @ 48 ns","SMA 50Ω","DC 50Ω","2 GHz"),
   spec("SYS_RESET_N","digital","logic",-0.15,1.15,(t)=>step(t,34),"FAULT: Releases at 34 ns BEFORE PLL locks at 48 ns!","10:1 Passive","DC 1MΩ","500 MHz")
  ],
  signalsFixed:[
   spec("CORE_PG","digital","logic",-0.15,1.15,(t)=>step(t,12),"Core VR Power-Good @ 12 ns","10:1 Passive","DC 1MΩ","500 MHz"),
   spec("IO_PG","digital","logic",-0.15,1.15,(t)=>step(t,28),"IO/PLL rail Power-Good @ 28 ns","10:1 Passive","DC 1MΩ","500 MHz"),
   spec("PLL_LOCK","digital","logic",-0.15,1.15,(t)=>step(t,48),"100 MHz REFCLK qualified + PLL lock @ 48 ns","SMA 50Ω","DC 50Ω","2 GHz"),
   spec("SYS_RESET_N","digital","logic",-0.15,1.15,(t)=>step(t,68),"CLEAN: Holds low 20 ns past PLL lock -> releases at 68 ns","10:1 Passive","DC 1MΩ","500 MHz")
  ],
  registers:[["POR Rule","t_RST_release >= max(PG_all, PLL_lock) + t_POR","max(12, 28, 48) + 20 = 68 ns"]],
  events:[event(12,"CORE_PG ↑",0,"Core supply reaches 95% nominal"),event(28,"IO_PG ↑",1,"IO/PLL analog rail reaches 95%"),event(48,"PLL_LOCK ↑",2,"Clock qualified; latest prerequisite"),event(68,"SYS_RESET# ↑",3,"Earliest safe reset release")],
  lesson:"Simultaneous 4-channel capture proves reset release waits for the latest prerequisite (PLL_LOCK @ 48 ns) plus the 20 ns qualification delay."
 };

 return [mbuLeft,mbuRight,veagle16,i2cPreset,engr852,startupPreset];
}

// Build unique profile from card.deepDive.waveSpec or stepSpec or fallback domain
function profileFromSpec(ws,ctx){
 const presets=getPresets();
 const matchedPreset=presets.find(p=>p.id===ws?.presetId);
 if(matchedPreset && !ws?.customChannels){
  return {
   ...matchedPreset,
   title:ws.title||matchedPreset.title,
   lesson:ws.lesson||matchedPreset.lesson
  };
 }
 const h=hashStr(ws?.id||ctx.question||ctx.card?.id||ctx.lab?.id+"-"+ctx.step);
 const T=ws?.T||100, unit=ws?.unit||"ns", sRate=ws?.sampleRate||(unit==="ns"?"10 GSa/s":"8 GSa/s"), mDepth=ws?.memDepth||"10 Mpts";
 const e1=ws?.e1 ?? clamp(18+(h%22),12,T*0.42);
 const e2=ws?.e2 ?? clamp(e1+22+(h%18),e1+10,T*0.78);
 const baseFreq=ws?.freq ?? (2+(h%6)*0.7);
 const kind=ws?.kind||"generic";
 const chMeta=ws?.channels||[
  {name:"CH1_SIG",type:"rail",unit:"V",min:0,max:1.4,probe:"10:1 Passive",coupling:"DC 1MΩ",bw:"2 GHz",desc:ws?.ch1Desc||"Primary input / rail stimulus"},
  {name:"CH2_NODE",type:"rail",unit:"V",min:0,max:1.4,probe:"N7020A Rail",coupling:"DC 50Ω",bw:"2 GHz",desc:ws?.ch2Desc||"Target DUT response node"},
  {name:"CH3_LOAD",type:"current",unit:"A",min:0,max:12,probe:"1169B Diff",coupling:"DC Diff",bw:"12 GHz",desc:ws?.ch3Desc||"Sense shunt current / clock reference"},
  {name:"CH4_FLAG",type:"digital",unit:"logic",min:-0.15,max:1.15,probe:"Digital Ch",coupling:"DC",bw:"1 GHz",desc:ws?.ch4Desc||"Qualifier / status / reset flag"}
 ];
 function genChannel(c,idx,faultMode){
  const fn=(t,mod)=>{
   const vS=mod.vScale||1, rN=mod.rNorm||1, cN=mod.cNorm||1;
   if(c.type==="clock"){
    const per=Math.max(1,T/(5+(h%8)));
    const duty=faultMode&&idx===0?0.32:0.5;
    const jit=faultMode?0.12*Math.sin(t*0.7+idx):0;
    return c.min+(c.max-c.min)*((((t+jit)%per)/per)<duty?0.88:0.12);
   }
   if(c.type==="bus"){
    const vals=c.busVals||[15,1,10,5,13,3];
    const seg=Math.floor((t/T)*vals.length)%vals.length;
    return vals[(faultMode&&idx===1)?(seg+1)%vals.length:seg];
   }
   if(c.type==="digital"){
    if(faultMode){
     return idx===3?(step(t,e1*0.65)*wave(t,0,e2)):wave(t,e1*0.7,e2*0.95);
    }
    return idx===3?step(t,e2):(step(t,e1)-step(t,e2+T*0.18));
   }
   if(c.type==="current"){
    const base=c.min+(c.max-c.min)*0.18;
    const stepH=(c.max-c.min)*(faultMode?0.72:0.48)*vS;
    const rise=t>=e1?(1-Math.exp(-(t-e1)/(faultMode?1.2*cN:5.5*cN))):0;
    const fall=t>=e2?(1-Math.exp(-(t-e2)/(faultMode?1.4:5.0))):0;
    const osc=faultMode?ring(t,e1,(c.max-c.min)*0.12,0.55+(h%4)*0.15,9):ring(t,e1,(c.max-c.min)*0.02,0.4,5);
    return base+stepH*(rise-fall)+osc;
   }
   // Analog rail / eye / node
   const nom=(c.min+c.max)*0.55*vS;
   const droopMag=(c.max-c.min)*(faultMode?0.28*rN:0.07*rN);
   const oversh=(c.max-c.min)*(faultMode?0.22:0.05);
   if(kind==="shmoo"&&idx===0)return c.min+(c.max-c.min)*((0.25+0.15*Math.floor(t/(T/5))))*vS;
   if(kind==="differential"&&idx<2){
    const cm=faultMode?0.18*Math.sin(t*0.4):0.04*Math.sin(t*0.4);
    const diff=(idx===0?1:-1)*0.42*Math.sin(t*0.65+h%3)*vS;
    return nom+diff+cm;
   }
   return nom - droopMag*wave(t,e1,e2)*(1-Math.exp(-Math.max(0,t-e1)/(3*cN)))
     + ring(t,e1,-droopMag*0.8,0.45+0.07*(h%5),faultMode?14:6)
     + ring(t,e2,oversh,0.42+0.06*(h%3),faultMode?12:5);
  };
  return spec(c.name,c.type,c.unit,c.min,c.max,fn,c.desc,c.probe||"10:1 Probe",c.coupling||"DC 1MΩ",c.bw||"2 GHz");
 }
 const signalsFault=chMeta.map((c,i)=>genChannel(c,i,true));
 const signalsFixed=chMeta.map((c,i)=>genChannel(c,i,false));
 const evs=ws?.events||[
  event(Number(e1.toFixed(1)),ws?.event1Label||"Trigger / Anomaly Onset",0,ws?.faultDesc||"First transition shows degraded margin or timing conflict"),
  event(Number(((e1+e2)/2).toFixed(1)),ws?.event2Label||"Peak Excursion / Sample Aperture",1,ws?.midNote||"Compare Ch2 voltage against Ch3 current / clock state"),
  event(Number(e2.toFixed(1)),ws?.event3Label||"Release / Settlement Window",3,ws?.fixedDesc||"Verified recovery after applying controlled hardware/FW fix")
 ];
 return {
  id:ws?.id||("unique-"+h),
  title:ws?.title||("Customized Waveform · "+String(ctx.question||"").slice(0,68)),
  unit,T,t0:ws?.t0||0,sampleRate:sRate,memDepth:mDepth,
  presetName:ws?.presetName||("Custom_"+(ctx.card?.id||ctx.lab?.id||"scope")+".set"),
  faultLabel:ws?.faultLabel||"Faulty / Marginal Capture",
  fixedLabel:ws?.fixedLabel||"Fixed / Verified Capture",
  signalsFault,signalsFixed,
  registers:ws?.registers||[
   ["Trigger",`CH1 ↑ / ${unit}`,ws?.faultDesc||"Baseline fault condition"],
   ["Verified",`${sRate} · ${mDepth}`,ws?.fixedDesc||"Controlled fix verified with margin"]
  ],
  events:evs,
  lesson:ws?.lesson||("Unique signal capture tailored to this topic. Toggle between Faulty and Fixed capture, or load a bench .set preset from File.")
 };
}

function select(question,hint=""){
 const s=(String(question)+" "+String(hint)).toLowerCase();
 if(/single.ended|differential signaling|common.mode|differential pair/.test(s))return "differential";
 if(/i2c|i²c|scl|sda|pull.up resistor/.test(s))return "i2c";
 if(/oscilloscope.*spec|scope.*bandwidth|probe.*ground|sample rate|horizontal scale|trigger level/.test(s))return "instrument";
 if(/usb 3|usb 2|ethernet phy|serdes|high.speed serial|equaliz|eye diagram/.test(s))return "serial";
 if(/signal integrity|transmission line|termination|reflect|overshoot.*ringing|crosstalk|inter.symbol/.test(s))return "spice";
 if(/pcie|perst#|ltssm|link training/.test(s))return "pcie";
 if(/dram|lpddr|trcd|trp|tras|trfc|refresh|zq calibration/.test(s))return "dram";
 if(/setup|hold time|timing violation|flip.flop|sample.*edge/.test(s))return "timing";
 if(/pipeline|rtl|verilog|state machine|fsm|synthesis|datapath/.test(s))return "rtl";
 if(/shmoo|voltage.frequency sweep|untested point/.test(s))return "shmoo";
 if(/uart|no boot|boot log|linux|usb adapter|enumerat/.test(s))return "uart";
 if(/power rail|voltage droop|undershoot|dvfs|vrm|power integrity|power delivery|transient|decoupling/.test(s))return "rail";
 if(/sense resistor|calculate current|current from|instantaneous power|current measurement/.test(s))return "voltage";
 if(/clock|oscillator|pll|frequency|jitter|fll|dco/.test(s))return "clock";
 if(/reset|power.good|power.up/.test(s))return "reset";
 if(/log|parser|automation|report|timeout|fail/.test(s))return "logs";
 return "diagnostic";
}

function buildContext(ctx){
 const card=ctx.card||{},lab=ctx.lab||{};
 let question=String(card.question||ctx.question||lab.title||"Signal observation");
 // Priority 1: Step-specific waveSpec from Guided Lab
 if(ctx.kind==="lab" && ctx.stepSpec){
  return {id:ctx.stepSpec.id,question,profile:profileFromSpec(ctx.stepSpec,ctx)};
 }
 // Priority 2: Stored ngspice case on SI card when explicit caseId chosen
 if(ctx.caseId && window.SI_SPICE_RUNS){
  const r=(window.SI_SPICE_RUNS||[]).find(x=>x.id===ctx.caseId);
  if(r){
   const sF=[
    spec("V_SOURCE","rail","V",-0.2,1.7,(t)=>lookup(r.trace,t,1),"SPICE driven source step","1:1 Source","DC 50Ω","12 GHz"),
    spec("V_TX","rail","V",-0.2,1.7,(t)=>lookup(r.trace,t,2),"SPICE transmitter node","10:1 Passive","DC 1MΩ","12 GHz"),
    spec("V_RX","rail","V",-0.2,1.7,(t)=>lookup(r.trace,t,3),"SPICE receiver load node (reflections visible)","10:1 Low-C","DC 1MΩ","12 GHz"),
    spec("I_LOAD*","current","mA",-2,Math.max(5,...r.trace.map(z=>z[3]/r.rl*1000))*1.15,(t)=>lookup(r.trace,t,3)/r.rl*1000,"Derived I = V_RX / R_L","Derived MATH","MATH","—")
   ];
   const m50=(window.SI_SPICE_RUNS||[]).find(x=>x.id==="matched_50")||r;
   const sG=[
    spec("V_SOURCE","rail","V",-0.2,1.7,(t)=>lookup(m50.trace,t,1),"Matched 50Ω reference source","1:1 Source","DC 50Ω","12 GHz"),
    spec("V_TX","rail","V",-0.2,1.7,(t)=>lookup(m50.trace,t,2),"Matched TX launch","10:1 Passive","DC 1MΩ","12 GHz"),
    spec("V_RX","rail","V",-0.2,1.7,(t)=>lookup(m50.trace,t,3),"Matched RX (Gamma_L = 0, zero reflections!)","10:1 Low-C","DC 1MΩ","12 GHz"),
    spec("I_LOAD*","current","mA",-2,25,(t)=>lookup(m50.trace,t,3)/m50.rl*1000,"Derived matched current","Derived MATH","MATH","—")
   ];
   return {id:"spice",question,profile:{
    id:"spice-"+r.id,title:"ngspice-47 Transmission Line ("+r.label+") · 16 GSa/s · 22 Mpts",
    unit:"ns",T:15,t0:0,sampleRate:"16 GSa/s",memDepth:"22 Mpts",presetName:r.id+"_ngspice.set",
    faultLabel:"Selected: "+r.label,fixedLabel:"Compare Matched 50Ω (Γ=0)",
    signalsFault:sF,signalsFixed:sG,
    registers:[["Z0 Line","50 Ω (TD=1 ns)","R_src=20 Ω -> R_load="+r.rl+" Ω"],["Reflection Γ_L",((r.rl-50)/(r.rl+50)).toFixed(4),"Peak RX = "+r.peak_v.toFixed(4)+" V"]],
    events:[event(1,"Source Step",0,"1 V source transitions @ 1 ns"),event(2,"First RX Arrival",2,"Wave arrives after 1 ns electrical length"),event(4,"Reflected Return",2,"Round-trip reflection lands @ 4 ns")],
    lesson:"Real ngspice-47 transmission line capture ("+r.label+"). Toggle Fixed to compare directly against Matched 50Ω termination (Γ=0)."
   }};
  }
 }
 // Priority 3: Card-unique waveSpec in cards.js (100/100 unique cards!)
 if(card?.deepDive?.waveSpec){
  return {id:card.deepDive.waveSpec.id||card.id,question,profile:profileFromSpec(card.deepDive.waveSpec,ctx)};
 }
 // Priority 4: Interactive Reset lab in Waves tab
 if(ctx.kind==="reset"){
  return {id:"reset",question,profile:getPresets()[5]};
 }
 const id=select(question,card.topic||lab.desc||"");
 return {id,question,profile:profileFromSpec({id,kind:id,title:question},ctx)};
}

function computeStats(arr){
 if(!arr.length)return {min:0,max:0,pp:0,avg:0,rms:0,std:0};
 let min=Infinity,max=-Infinity,sum=0,sq=0;
 for(const v of arr){if(v<min)min=v;if(v>max)max=v;sum+=v;sq+=v*v;}
 const avg=sum/arr.length,rms=Math.sqrt(sq/arr.length);
 let varSum=0;
 for(const v of arr){const d=v-avg;varSum+=d*d;}
 const std=Math.sqrt(varSum/arr.length);
 return {min,max,pp:max-min,avg,rms,std};
}

function measureTiming(values,times,unit){
 if(values.length<4)return {period:null,freq:null,duty:null,rise:null,fall:null,slew:0,overshoot:0};
 const st=computeStats(values),span=st.pp;
 const sc=TIME_SCALE[unit]||1e-9;
 if(span<1e-6)return {period:null,freq:null,duty:null,rise:null,fall:null,slew:0,overshoot:0};
 const mid=st.min+0.5*span,v10=st.min+0.1*span,v90=st.min+0.9*span;
 const rises=[],falls=[];
 let maxSlew=0;
 for(let i=1;i<values.length;i++){
  const a=values[i-1],b=values[i],dt=(times[i]-times[i-1]);
  if(dt>1e-12)maxSlew=Math.max(maxSlew,Math.abs(b-a)/dt);
  if(a<mid&&b>=mid)rises.push(times[i-1]+dt*(mid-a)/((b-a)||1));
  if(a>mid&&b<=mid)falls.push(times[i-1]+dt*(a-mid)/((a-b)||1));
 }
 const periods=rises.slice(1).map((t,i)=>t-rises[i]).filter(v=>v>0);
 const period=periods.length?periods.reduce((a,b)=>a+b,0)/periods.length:null;
 const freq=period?1/(period*sc):null;
 let duty=null;
 if(period&&rises.length){const f=falls.find(t=>t>rises[0]);if(f!==undefined)duty=clamp((f-rises[0])/period*100,0,100);}
 let rise=null,fall=null;
 let t10=null,t90=null,f90=null,f10=null;
 for(let i=1;i<values.length;i++){
  if(t10===null&&values[i-1]<v10&&values[i]>=v10)t10=times[i];
  if(t10!==null&&t90===null&&values[i-1]<v90&&values[i]>=v90)t90=times[i];
  if(f90===null&&values[i-1]>v90&&values[i]<=v90)f90=times[i];
  if(f90!==null&&f10===null&&values[i-1]>v10&&values[i]<=v10)f10=times[i];
 }
 if(t10!==null&&t90!==null&&t90>=t10)rise=t90-t10;
 if(f90!==null&&f10!==null&&f10>=f90)fall=f10-f90;
 // Simple overshoot relative to steady average upper plateau or nominal mean
 const highRef=Math.max(st.avg+span*0.25,st.min+span*0.8);
 const overshoot=span>0?clamp((st.max-highRef)/span*100,0,200):0;
 return {period,freq,duty,rise,fall,slew:maxSlew,overshoot};
}

function formatFreq(hz){
 if(!hz||!Number.isFinite(hz))return "—";
 if(hz>=1e9)return (hz/1e9).toFixed(2)+" GHz";
 if(hz>=1e6)return (hz/1e6).toFixed(2)+" MHz";
 if(hz>=1e3)return (hz/1e3).toFixed(2)+" kHz";
 return hz.toFixed(1)+" Hz";
}

function markup(){
 const presets=getPresets();
 return '<section class="ix-shell" aria-label="Keysight Infiniium style engineering oscilloscope" data-instrument>'+
  // Keysight Infiniium Top Application Menu Bar (role=menubar per modern-web-guidance app-menus)
  '<div class="ks-menubar-wrap">'+
   '<div role="menubar" class="ks-menubar" aria-label="Oscilloscope menu bar">'+
    '<button type="button" class="ks-menu-trigger ks-scope-pill" data-ks-menu="scope" aria-haspopup="menu" aria-expanded="false" tabindex="0">Scope</button>'+
    ['File','Control','Setup','Display','Trigger','Measure','Math','Analyze','Utilities','Help'].map(m=>
     '<button type="button" class="ks-menu-trigger" data-ks-menu="'+m.toLowerCase()+'" aria-haspopup="menu" aria-expanded="false" tabindex="-1">'+m+'</button>'
    ).join('')+
   '</div>'+
   '<div class="ks-menu-drawer" id="ksDrawer" hidden role="region" aria-label="Oscilloscope menu controls"></div>'+
  '</div>'+
  // Status bezel
  '<div class="ix-top"><div class="ix-brand">◉ KEYSIGHT INFINIIUM · VIRTUAL SILICON LAB BENCH</div><div class="ix-status"><span id="ixAcqSpec">8 GSa/s · 10 Mpts</span><span id="ixRunStatus">STOP</span><span id="ixTrigStatus">TRIG: CH1 ↑</span><span id="ixTimeStatus">0–100 ns</span></div></div>'+
  // Provenance + Faulty vs Fixed Switcher
  '<div class="ix-provenance"><span class="ix-tag fault" id="ixOrigin">FAULTY CAPTURE</span><span class="ix-topics" id="ixTopic">Signal-specific engineering waveform</span>'+
   '<div class="ks-cap-toggle" role="group" aria-label="Capture scenario toggle">'+
    '<button type="button" data-mode-btn="fault" aria-pressed="true">🔴 Faulty Capture</button>'+
    '<button type="button" data-mode-btn="fixed" aria-pressed="false">🟢 Fixed / Golden Capture</button>'+
   '</div>'+
  '</div>'+
  // Front-panel transport & trigger quick bar
  '<div class="ix-controls">'+
   '<button type="button" id="ixRun" class="ix-run">▶ Run</button>'+
   '<button type="button" id="ixSingle" class="ix-single">Single</button>'+
   '<button type="button" id="ixStop">■ Stop</button>'+
   '<button type="button" id="ixAuto">Autoscale</button>'+
   '<button type="button" id="ixClear">Clear</button>'+
   '<button type="button" id="ixZoomIn">＋ Zoom</button>'+
   '<button type="button" id="ixZoomOut">－ Zoom</button>'+
   '<button type="button" id="ixCenter">Center T0</button>'+
   '<label>Trigger<select id="ixTrigger"><option value="0">CH1 ↑</option><option value="1">CH2 ↑</option><option value="2">CH3 ↑</option><option value="3">CH4 ↑</option></select></label>'+
   '<label>Type<select id="ixTrigType"><option value="edge">Edge</option><option value="glitch">Glitch</option><option value="runt">Runt</option><option value="window">Window/Droop</option></select></label>'+
   '<label>Slope<select id="ixSlope"><option value="rise">Rising ↑</option><option value="fall">Falling ↓</option></select></label>'+
   '<label>Level<input type="number" id="ixLevel" step=".05" value=".5"/></label>'+
   '<label>Time/div<select id="ixDiv"></select></label>'+
   '<label>Math F1<select id="ixMathMode"><option value="off">OFF</option><option value="diff">CH1 − CH2</option><option value="power">CH2 × CH3 (Power)</option><option value="deriv">d(CH2)/dt (Slew)</option><option value="integ">∫ CH3 dt (Charge)</option><option value="fft">FFT Spectrum</option><option value="watermark">FLL Watermark Env</option></select></label>'+
   '<button type="button" id="ixSaveRef" class="ks-ref-btn" aria-pressed="false">Save R1 Compare</button>'+
   '<label>Setup .set<select id="ixPreset"><option value="active">Active Card/Lab Setup</option>'+
    presets.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.presetName)+'</option>').join('')+'</select></label>'+
  '</div>'+
  // 4-Channel cards with probe/coupling/gain/offset/BW controls
  '<div class="ix-channelbar" id="ixChannels"></div>'+
  // Oscilloscope main graticule CRT screen
  '<div class="ix-view" id="ixScreenWrap"><div class="ix-titleline"><b>INFINIIUM CAPTURE · CH1–CH4 + F1 MATH + R1 REF + CURSORS A/B</b><small id="ixWindow">0–100 ns</small></div>'+
   '<svg id="ixPlot" class="ix-plot" viewBox="0 0 1120 560" role="img" tabindex="0" aria-label="Calibrated multi-channel oscilloscope traces with math, trigger and cursor annotations"></svg>'+
   '<div class="ix-mobile-plots" id="ixMobile" aria-label="Individual channel waveforms on phones"></div>'+
  '</div>'+
  '<div class="ix-eventlist" id="ixEvents"></div>'+
  // Live Physical Probe & Board-Level Component Schematic directly below scope
  '<div class="ks-board-strip" id="ksBoardStrip">'+
   '<div class="ks-board-head"><strong>⚡ PHYSICAL BOARD & PROBE TOPOLOGY · LIVE REACTOR BELOW SCOPE</strong><span id="ksBoardBadge" style="font:700 10px ui-monospace,monospace;color:#9cf2d6">CH1–CH4 connected to DUT & Rsense</span></div>'+
   '<div class="ks-board-sliders">'+
    '<label>Rail Voltage (V): <b id="ksVoltVal">1.00×</b><input type="range" id="ksVoltSlider" min="0.7" max="1.35" step="0.05" value="1.0"></label>'+
    '<label>Series R_damp / R_p: <select id="ksRSelect"><option value="0.5">Low R (Bypass / 2.2 kΩ)</option><option value="1" selected>Nominal R_series (33 Ω / 10 kΩ)</option><option value="2.2">High R_p (Weak 47 kΩ / Heavy Drop)</option></select></label>'+
    '<label>Decap C_load: <select id="ksCSelect"><option value="0.5">Minimal 2 pF / Missing Decap</option><option value="1" selected>Nominal 22 μF + 100 nF Array</option><option value="2.2">Heavy Bulk + HF Ceramic Bank</option></select></label>'+
    '<label>Inductor L_pkg: <select id="ksLSelect"><option value="1" selected>Short 5 mm Coax Spring (&lt;1 nH)</option><option value="2.4">Long 15 cm Alligator Ground (+15 nH)</option></select></label>'+
   '</div>'+
   '<div id="ksBoardSvg"></div>'+
   '<p class="ks-board-status" id="ksBoardStatus"></p>'+
  '</div>'+
  // Live Math FFT & Register/Protocol Decoder side-by-side
  '<div class="ks-math-fft-row">'+
   '<div class="ks-subbox"><h6>FFT SPECTRUM / F1 MATH ANALYZER (HANN WINDOWED DFT)</h6><svg id="ixFftPlot" viewBox="0 0 540 165" role="img" aria-label="Frequency spectrum FFT plot"></svg><div id="ixFftNote" style="font:650 10px ui-monospace,monospace;color:#9ec2e8;margin-top:4px"></div></div>'+
   '<div class="ks-subbox"><h6>ANALYZE · SILICON BRING-UP REGISTERS / PROTOCOL DECODE</h6><div id="ixAnalyzeBox"></div></div>'+
  '</div>'+
  // Full 14-metric Automated Measurement Statistics Table
  '<div class="ks-extra-grid"><div style="padding:10px 12px"><h5 style="font:850 11px ui-monospace,monospace;color:#dbeafc;margin:0 0 8px">MEASURE · AUTOMATED STATISTICS (CURRENT / MIN / MAX / MEAN / STDDEV)</h5>'+
   '<div class="ks-table-scroll" tabindex="0" role="region" aria-label="Automated oscilloscope measurements table"><table><thead><tr><th>Channel</th><th>Vmin</th><th>Vmax</th><th>Vpp</th><th>Vavg</th><th>Vrms</th><th>StdDev</th><th>Overshoot</th><th>Freq / 1/Δt</th><th>Period</th><th>Duty %</th><th>Rise (10-90%)</th><th>Fall (90-10%)</th><th>Max Slew</th></tr></thead><tbody id="ixFullMeasureBody"></tbody></table></div>'+
  '</div></div>'+
  // Bottom cursor & deltas
  '<div class="ix-readouts"><section><h5>QUICK CURSOR DIFFERENCES & EXPORT</h5><div id="ixExportBar" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'+
   '<button type="button" id="ixDlCsv" style="background:#243952;color:#fff;border:1px solid #597698;border-radius:5px;padding:6px 9px;font:700 10.5px system-ui;cursor:pointer">⬇ Export CSV</button>'+
   '<button type="button" id="ixDlSvg" style="background:#243952;color:#fff;border:1px solid #597698;border-radius:5px;padding:6px 9px;font:700 10.5px system-ui;cursor:pointer">⬇ Export SVG</button>'+
   '<button type="button" id="ixDlSet" style="background:#243952;color:#fff;border:1px solid #597698;border-radius:5px;padding:6px 9px;font:700 10.5px system-ui;cursor:pointer">⬇ Export .set</button>'+
   '<label style="background:#1c2e44;color:#cfe4fa;border:1px solid #526e8e;border-radius:5px;padding:5px 8px;font:700 10.5px system-ui;cursor:pointer">⬆ Import CSV<input type="file" id="ixUpCsv" accept=".csv,.txt" hidden></label>'+
  '</div><table><thead><tr><th>Channel</th><th>Min</th><th>Max</th><th>Pk–Pk</th><th>RMS</th></tr></thead><tbody id="ixMeasures"></tbody></table></section>'+
  '<section><h5>CURSORS / EVENT MARKERS (DRAG A / B)</h5><div class="ix-linked-tools"><button id="ixLinkB" type="button" aria-pressed="true">🔗 Link B to A: ON</button><button id="ixNextAB" type="button">↦ Next event</button><span id="ixLinkHint">B follows A at selected Δt</span></div><div class="ix-cursors"><label>Cursor A <span id="ixALabel">—</span><input type="range" id="ixA" min="0" max="100" step=".1" value="25"></label><label>Cursor B <span id="ixBLabel">—</span><input type="range" id="ixB" min="0" max="100" step=".1" value="60"></label></div><table><thead><tr><th>Marker</th><th>Time</th><th>Δt (B−A)</th><th>1 / |Δt|</th></tr></thead><tbody id="ixMarkerRows"></tbody></table><div id="ixCursorSummary" role="status" aria-live="polite"></div><div id="ixAtCursor"></div></section></div>'+
  '<div class="ix-lesson"><strong id="ixWhy">ANALYZE THE FIRST ABNORMAL EVENT</strong><p id="ixExplain"></p><ol><li>Use the top Keysight Infiniium menus (Setup, Trigger, Measure, Math, Analyze) just like a real bench scope.</li><li>Toggle 🔴 Faulty Capture vs 🟢 Fixed Capture and Save R1 to overlay before/after improvements directly on the grid.</li><li>Move the Rail Voltage and R/L/C controls below the scope to see wires, shunts, capacitors, and traces react in real time.</li></ol></div>'+
  '<div class="ix-notice" id="ixNotice">Interactive Keysight Infiniium style learning bench. Stored ngspice / synthetic traces are clearly labeled; no real lab instrument hardware is remotely driven.</div></section>';
}

function mount(root,ctx={}){
 if(!root)return;
 const built=buildContext(ctx);
 const $=s=>root.querySelector(s);
 const presets=getPresets();
 let activeDef=built.profile;
 const state={
  captureMode:"fault", // "fault" | "fixed"
  presetId:"active",
  a:0,b:0,left:0,right:100,linkedB:true,gap:0,
  active:[true,true,true,true],
  vGain:[1,1,1,1],
  vOffset:[0,0,0,0],
  coupling:["DC 50Ω","DC 50Ω","DC Diff","DC 1MΩ"],
  bw:["12 GHz","2 GHz","12 GHz","1 GHz"],
  trigger:0,trigType:"edge",slope:"rise",sweepMode:"auto",level:0.5,holdoff:0,
  mathMode:"off",fftCh:1,refTrace:null,showRef:false,
  gridStyle:"full",persistence:"off",lightCrt:false,
  vScale:1.0,rNorm:1.0,cNorm:1.0,lNorm:1.0,
  customCsv:null,
  running:false,raf:0,reveal:null,cleared:false,openMenu:null
 };

 function syncDefBounds(resetWindow=true){
  const T=activeDef.T;
  if(resetWindow){
   state.left=0;state.right=T;state.a=T*0.22;state.gap=T*0.18;state.b=state.a+state.gap;state.linkedB=true;
  }
  const sigs=currentSignals();
  const s0=sigs[state.trigger]||sigs[0];
  state.level=Number(((s0.min+s0.max)*0.5).toFixed(3));
  $("#ixLevel").value=state.level;
  const sel=$("#ixDiv");
  sel.innerHTML=[T/10,T/20,T/40,T/80].map(n=>'<option value="'+n+'">'+fmt(n,activeDef.unit)+'/div</option>').join("");
  sel.value=String(T/10);
  for(const [id,val] of [["ixA",state.a],["ixB",state.b]]){
   const el=$("#"+id);el.min=0;el.max=T;el.step=T<=20?0.02:0.1;el.value=val;
  }
 }
 syncDefBounds(true);

 function currentSignals(){
  if(state.customCsv){
   return state.customCsv.signals;
  }
  return state.captureMode==="fixed" ? (activeDef.signalsFixed||activeDef.signalsFault) : activeDef.signalsFault;
 }
 function modParams(){
  return {vScale:state.vScale,rNorm:state.rNorm,cNorm:state.cNorm,lNorm:state.lNorm,e1:activeDef.events[0]?.t||activeDef.T*0.25};
 }
 function signalNum(t,j){
  const sigs=currentSignals();
  const c=sigs[j]||sigs[0];
  const raw=c.fn(clamp(t,0,activeDef.T),modParams());
  return raw;
 }
 function signalDisplay(t,j,rows){
  const c=currentSignals()[j];
  const cp=state.coupling[j]||c.coupling;
  if(cp==="GND")return state.vOffset[j];
  let val=signalNum(t,j);
  if(cp==="AC"){
   const avg=rows.reduce((s,r)=>s+r[j],0)/Math.max(rows.length,1);
   val-=avg;
  }
  return val+state.vOffset[j];
 }
 function syncB(){if(state.linkedB)state.b=clamp(state.a+state.gap,0,activeDef.T);}
 function setA(t){state.a=clamp(t,0,activeDef.T);syncB();}
 function formatChannel(v,ch){
  if(ch.type==="digital")return v>=.5?"1":"0";
  if(ch.type==="bus"){const width=/16BIT|\[15:0\]/i.test(ch.name)||ch.max>255?4:2;return "0x"+Math.max(0,Math.round(v)).toString(16).toUpperCase().padStart(width,"0");}
  return fmt(v,ch.unit);
 }
 function timeText(t){
  const off=activeDef.t0||0;
  return (t+off).toFixed(activeDef.T<=25?2:1)+" "+activeDef.unit;
 }
 function mapX(t,W,left=state.left,right=state.right,sx=122,ex=W-28){return sx+(t-left)/(right-left)*(ex-sx);}

 function mathValue(t,jArr,dt){
  // Computes F1 Math trace at sample value array jArr=[ch1,ch2,ch3,ch4]
  switch(state.mathMode){
   case "diff": return jArr[0]-jArr[1];
   case "power": return jArr[1]*jArr[2];
   case "watermark": return null; // rendered as min/max envelope
   default: return jArr[1];
  }
 }

 function sampleWindow(N=260){
  const times=[],vals=[[],[],[],[]];
  const span=Math.max(1e-6,state.right-state.left);
  for(let i=0;i<=N;i++){
   const t=state.left+span*i/N;
   times.push(t);
   for(let j=0;j<4;j++)vals[j].push(signalNum(t,j));
  }
  return {times,vals};
 }

 function drawBoardTopology(vals){
  const vNow=state.vScale, rNow=state.rNorm, lNow=state.lNorm, cNow=state.cNorm;
  const sigs=currentSignals();
  const a0=signalNum(state.a,0), a1=signalNum(state.a,1), a2=signalNum(state.a,2), a3=signalNum(state.a,3);
  const loopAlert=lNow>1.5?"LONG 15cm ALLIGATOR LOOP (+15 nH ring!)":"<5mm COAX SPRING TIP (<1 nH)";
  const wireCol=vNow>1.15?"#ff7b82":vNow<0.85?"#7ebdff":"#5fe8b8";
  const rCol=rNow>1.5?"#ffa66b":rNow<0.7?"#64e6c2":"#f2cf7e";
  const svg='<svg class="ks-board-svg" viewBox="0 0 920 156" role="img" aria-label="Physical DUT board and oscilloscope probe connections">'+
   '<rect x="2" y="2" width="916" height="152" rx="10" fill="#091f25" stroke="#2d7480"/>'+
   '<text x="14" y="22" fill="#9bf7dc" font-size="11" font-weight="800">PHYSICAL DUT / PROBE CONNECTIONS @ CURSOR A ('+timeText(state.a)+')</text>'+
   '<text x="906" y="22" text-anchor="end" fill="#ffd98a" font-size="10.5">'+esc(loopAlert)+' | V_scale='+vNow.toFixed(2)+'× | R='+rNow+'× | C='+cNow+'× | L='+lNow+'×</text>'+
   // Power/Source -> Rseries -> L_pkg -> DUT Die & C_load -> Ground return
   '<path d="M55 76 H170 M240 76 H340 M430 76 H570 M570 76 H760 M650 76 V125 H55 V76" fill="none" stroke="'+wireCol+'" stroke-width="'+(3+vNow*1.8)+'" stroke-linecap="round"/>'+
   '<circle cx="55" cy="76" r="15" fill="#184757" stroke="'+wireCol+'" stroke-width="2.5"/><text x="55" y="80" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">PMIC</text>'+
   '<rect x="170" y="61" width="70" height="30" rx="5" fill="#3a2f22" stroke="'+rCol+'" stroke-width="2.5"/><text x="205" y="80" text-anchor="middle" fill="#ffe6b0" font-size="10" font-weight="800">Rsense/Rp</text>'+
   '<path d="M340 76 Q355 50 370 76 Q385 50 400 76 Q415 50 430 76" fill="none" stroke="'+(lNow>1.5?"#ff867e":"#ffe38c")+'" stroke-width="'+(2.5+lNow)+'"/><text x="385" y="102" text-anchor="middle" fill="#ffe38c" font-size="10">L_pkg / Ground Loop</text>'+
   '<rect x="520" y="50" width="110" height="52" rx="8" fill="#173854" stroke="#6db3ff" stroke-width="2.5"/><text x="575" y="73" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">DUT SILICON</text><text x="575" y="90" text-anchor="middle" fill="#9de8ff" font-size="9.5">'+(state.captureMode==="fault"?"Stress / Marginal":"Clean / Guardbanded")+'</text>'+
   // C_load parallel plates
   '<path d="M700 76 V92 M682 92 H718 M682 103 H718 M700 103 V125" stroke="#85e8ff" stroke-width="'+(2+cNow)+'"/><text x="730" y="102" fill="#9be8ff" font-size="10">C_decap</text>'+
   // 4 Color Probe Leads tapping the nodes!
   '<circle cx="115" cy="76" r="5" fill="'+colors[0]+'"/><text x="115" y="47" text-anchor="middle" fill="'+colors[0]+'" font-size="9.5" font-weight="800">CH1 '+fmt(a0,sigs[0].unit)+'</text><line x1="115" y1="51" x2="115" y2="71" stroke="'+colors[0]+'" stroke-dasharray="3 2"/>'+
   '<circle cx="480" cy="76" r="5" fill="'+colors[1]+'"/><text x="480" y="47" text-anchor="middle" fill="'+colors[1]+'" font-size="9.5" font-weight="800">CH2 '+fmt(a1,sigs[1].unit)+'</text><line x1="480" y1="51" x2="480" y2="71" stroke="'+colors[1]+'" stroke-dasharray="3 2"/>'+
   '<circle cx="205" cy="61" r="5" fill="'+colors[2]+'"/><text x="205" y="47" text-anchor="middle" fill="'+colors[2]+'" font-size="9.5" font-weight="800">CH3 Diff '+fmt(a2,sigs[2].unit)+'</text>'+
   '<circle cx="628" cy="54" r="5" fill="'+colors[3]+'"/><text x="735" y="47" fill="'+colors[3]+'" font-size="9.5" font-weight="800">CH4 '+esc(sigs[3].name)+': '+fmt(a3,sigs[3].unit)+'</text><line x1="628" y1="54" x2="730" y2="44" stroke="'+colors[3]+'" stroke-dasharray="3 2"/>'+
   '<text x="385" y="142" text-anchor="middle" fill="#a8e2db" font-size="10">GND Return Plane · Raising voltage increases I_load; raising L_gnd adds inductive ringing; adding C_decap smooths droop.</text>'+
  '</svg>';
  $("#ksBoardSvg").innerHTML=svg;
  $("#ksBoardStatus").textContent="Live Reaction: At "+vNow.toFixed(2)+"× rail scaling, CH2 reads "+fmt(a1,sigs[1].unit)+" and CH3 reads "+fmt(a2,sigs[2].unit)+". "+(lNow>1.5?"Long 15cm alligator loop injects high-frequency LC fixture ringing!":"Low-inductance probe keeps measurement clean.");
 }

 function drawFft(win){
  const ch=clamp(state.fftCh,0,3);
  const sigs=currentSignals(),arr=win.vals[ch];
  const N=128,spanSec=Math.max(1e-12,(state.right-state.left)*(TIME_SCALE[activeDef.unit]||1e-9));
  const samples=new Array(N);
  for(let i=0;i<N;i++){
   const idx=Math.floor(i/(N-1)*(arr.length-1));
   samples[i]=arr[idx];
  }
  const mean=samples.reduce((a,b)=>a+b,0)/N;
  const mag=[];
  for(let k=1;k<N/2;k++){
   let re=0,im=0;
   for(let n=0;n<N;n++){
    const w=0.5-0.5*Math.cos(2*Math.PI*n/(N-1));
    const x=(samples[n]-mean)*w,theta=2*Math.PI*k*n/N;
    re+=x*Math.cos(theta);im-=x*Math.sin(theta);
   }
   mag.push(4*Math.hypot(re,im)/N);
  }
  const top=Math.max(...mag,1e-9);
  const peakIdx=mag.indexOf(Math.max(...mag))+1;
  const peakHz=peakIdx/spanSec, maxHz=(N/2-1)/spanSec;
  const path=mag.map((m,i)=>((i?"L":"M")+(52+(i/(mag.length-1))*470).toFixed(1)+" "+(135-105*m/top).toFixed(1))).join(" ");
  let out='<rect width="540" height="165" fill="#071222"/>';
  for(let g=0;g<=4;g++)out+='<line x1="52" x2="522" y1="'+(30+g*26.25)+'" y2="'+(30+g*26.25)+'" stroke="#233752" stroke-dasharray="3 5"/>';
  out+='<path d="'+path+'" fill="none" stroke="'+colors[ch]+'" stroke-width="2.2"/>'+
   '<text x="52" y="18" fill="#d9ebff" font-size="11">FFT CH'+(ch+1)+' '+esc(sigs[ch].name)+'</text>'+
   '<text x="522" y="18" text-anchor="end" fill="#ffe18c" font-size="11">Peak Bin: '+formatFreq(peakHz)+'</text>'+
   '<text x="52" y="153" fill="#b4cce3" font-size="10">0 Hz</text>'+
   '<text x="522" y="153" text-anchor="end" fill="#b4cce3" font-size="10">'+formatFreq(maxHz)+'</text>';
  $("#ixFftPlot").innerHTML=out;
  $("#ixFftNote").textContent="128-pt Hann DFT on CH"+(ch+1)+" | Resolution df = "+formatFreq(1/spanSec)+" | Nyquist = "+formatFreq(maxHz);
 }

 function drawAnalyze(win){
  const sigs=currentSignals();
  const regs=activeDef.registers||[];
  const ev=activeDef.events||[];
  const rowsHtml=regs.map(([addr,name,val])=>'<tr><td style="color:#89e8c8">'+esc(addr)+'</td><td>'+esc(name)+'</td><td style="color:#ffe29b">'+esc(val)+'</td></tr>').join('');
  $("#ixAnalyzeBox").innerHTML='<div style="font:650 11px/1.5 system-ui;color:#d6e9fc;margin-bottom:6px">Mode: <b style="color:'+(state.captureMode==="fault"?"#ff8aa8":"#7ef4bd")+'">'+esc(state.captureMode==="fault"?activeDef.faultLabel:activeDef.fixedLabel)+'</b> · Preset: <code>'+esc(activeDef.presetName)+'</code></div>'+
   (regs.length?'<div class="ks-table-scroll"><table style="min-width:100%"><thead><tr><th>Addr / Param</th><th>Register / Rule</th><th>Observed State</th></tr></thead><tbody>'+rowsHtml+'</tbody></table></div>':'<p style="font:650 11px system-ui;color:#bfd6ec">Protocol edges decoded: '+ev.map(e=>e.label+' @ '+timeText(e.t)).join(' · ')+'</p>');
 }

 function drawMainSvg(win){
  const sigs=currentSignals();
  const W=1120,H=560,sx=122,ex=1092,each=110;
  const bg=state.lightCrt?"#f6f9fd":"#081323";
  const gridClr=state.lightCrt?"#d5dfeb":"#253854";
  const txtClr=state.lightCrt?"#1c2f4a":"#bacde4";
  let out='<rect width="'+W+'" height="'+H+'" fill="'+bg+'"/>';
  if(state.gridStyle!=="frame"){
   for(let i=0;i<=10;i++){
    const t=state.left+(state.right-state.left)*i/10,x=mapX(t,W,state.left,state.right,sx,ex);
    out+='<path d="M'+x+' 38 V492" stroke="'+gridClr+'" stroke-width="1"/><text x="'+x+'" y="514" text-anchor="middle" fill="'+txtClr+'" font-size="11">'+(t+(activeDef.t0||0)).toFixed(activeDef.T<=25?1:0)+'</text>';
   }
  }
  out+='<text x="1090" y="538" fill="'+txtClr+'" text-anchor="end" font-size="11.5">TIME ('+esc(activeDef.unit)+') · '+esc(activeDef.sampleRate)+' · '+esc(activeDef.memDepth)+'</text>';

  // Linked cursors enclose the same physical/simulated time window on all lanes.
  const ax=mapX(state.a,W,state.left,state.right,sx,ex),bx=mapX(state.b,W,state.left,state.right,sx,ex);
  const xlo=clamp(Math.min(ax,bx),sx,ex),xhi=clamp(Math.max(ax,bx),sx,ex);
  if(xhi>xlo)out+='<rect class="ix-ab-window" x="'+xlo.toFixed(1)+'" y="38" width="'+(xhi-xlo).toFixed(1)+'" height="454" fill="#65dcc1" fill-opacity=".085"/>';
  // Compute F1 Math points across N steps if enabled
  const N=win.times.length-1;
  sigs.forEach((ch,j)=>{
   if(!state.active[j])return;
   const yTop=42+j*each,yBot=yTop+88;
   const arr=win.vals[j];
   const minV=ch.min, maxV=ch.max;
   const spanV=Math.max(1e-6,(maxV-minV)/state.vGain[j]);
   const midV=(minV+maxV)/2;
   const yFor=v=>yBot-8-clamp(0.5+(v-midV)/spanV,0,1)*72;
   out+='<rect x="7" y="'+(yTop-4)+'" width="1105" height="98" rx="4" fill="'+(state.lightCrt?(j%2?"#eef4fb":"#ffffff"):(j%2?"#111c2e":"#0a1b2b"))+'" stroke="'+(state.lightCrt?"#cbd9e8":"#1b2d45")+'" opacity=".75"/>';
   if(state.gridStyle==="full"){
    for(let k=1;k<4;k++)out+='<path d="M'+sx+' '+(yTop+k*22)+' H'+ex+'" stroke="'+gridClr+'" stroke-dasharray="3 5"/>';
   }else if(state.gridStyle==="axes"){
    out+='<path d="M'+sx+' '+(yTop+44)+' H'+ex+'" stroke="'+gridClr+'" stroke-dasharray="4 4"/>';
   }
   out+='<rect x="10" y="'+(yTop+3)+'" width="104" height="24" rx="4" fill="'+colors[j]+'" opacity=".18" stroke="'+colors[j]+'"/>';
   out+='<text x="15" y="'+(yTop+19)+'" fill="'+(state.lightCrt?"#112740":colors[j])+'" font-size="11.5" font-weight="bold">CH'+(j+1)+' '+esc(ch.name.slice(0,11))+'</text>';
   out+='<text x="12" y="'+(yTop+45)+'" fill="'+txtClr+'" font-size="10">'+esc(ch.probe.slice(0,15))+'</text>';
   out+='<text x="12" y="'+(yTop+60)+'" fill="'+txtClr+'" font-size="9.5">'+esc(state.coupling[j])+' · '+esc(state.bw[j])+'</text>';
   out+='<text x="12" y="'+(yTop+76)+'" fill="'+txtClr+'" font-size="9.5">'+minV.toFixed(1)+'..'+maxV.toFixed(1)+' '+esc(ch.unit)+'</text>';

   if(state.cleared)return;
   // Persistence ghost shadow if enabled
   if(state.persistence!=="off"){
    let gPath="";
    for(let i=0;i<=N;i++){
     const t=win.times[i];
     if(state.reveal!==null&&t>state.reveal)break;
     const v=(ch.type==="rail"||ch.type==="current")?arr[i]+(ch.max-ch.min)*0.05*Math.sin(i*0.9):arr[i];
     gPath+=(i?"L":"M")+mapX(t,W,state.left,state.right,sx,ex).toFixed(1)+" "+yFor(v).toFixed(1)+" ";
    }
    out+='<path d="'+gPath+'" stroke="'+colors[j]+'" stroke-width="5" opacity=".2" fill="none"/>';
   }
   // Reference R1 overlay (dashed white) if saved
   if(state.showRef && state.refTrace && state.refTrace[j]){
    let rPath="";
    for(let i=0;i<state.refTrace[j].length;i++){
     const t=state.left+(state.right-state.left)*i/(state.refTrace[j].length-1);
     rPath+=(i?"L":"M")+mapX(t,W,state.left,state.right,sx,ex).toFixed(1)+" "+yFor(state.refTrace[j][i]).toFixed(1)+" ";
    }
    out+='<path d="'+rPath+'" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="5 4" opacity=".75" fill="none"/>';
   }
   // Digital lanes are states, not voltages. Buses use vector segments.
   if(ch.type==="digital"||ch.type==="bus"){
    const groups=[];let last=null;
    for(let i=0;i<=N;i++){
     if(state.reveal!==null&&win.times[i]>state.reveal)break;
     const v=ch.type==="digital"?(arr[i]>=.5?1:0):Math.max(0,Math.round(arr[i]));
     if(last===null||v!==last){
      groups.push({v,t:win.times[i]});last=v;
     }
    }
    const high=yTop+33,low=yTop+73;
    if(ch.type==="digital"){
     let path="";
     groups.forEach((g,i)=>{
      const xx=mapX(g.t,W,state.left,state.right,sx,ex),end=mapX(groups[i+1]?.t??(state.reveal??state.right),W,state.left,state.right,sx,ex);
      const yy=g.v?high:low;
      path+=(i===0?"M":" H")+xx.toFixed(1)+(i===0?" "+yy:" V"+yy)+" H"+end.toFixed(1);
      if(end-xx>20)out+='<text x="'+((xx+end)/2).toFixed(1)+'" y="'+(g.v?high-7:low+15)+'" text-anchor="middle" fill="'+colors[j]+'" font-size="12" font-weight="800">'+g.v+'</text>';
     });
     if(path)out+='<path d="'+path+'" stroke="'+colors[j]+'" stroke-width="2.6" fill="none"/>';
    }else{
     groups.forEach((g,i)=>{
      const x0=mapX(g.t,W,state.left,state.right,sx,ex),x1=mapX(groups[i+1]?.t??(state.reveal??state.right),W,state.left,state.right,sx,ex);
      if(x1<=x0)return;
      const notch=Math.min(6,(x1-x0)/5);
      out+='<path d="M'+(x0+notch).toFixed(1)+' '+high+' H'+(x1-notch).toFixed(1)+' L'+x1.toFixed(1)+' '+((high+low)/2)+' L'+(x1-notch).toFixed(1)+' '+low+' H'+(x0+notch).toFixed(1)+' L'+x0.toFixed(1)+' '+((high+low)/2)+' Z" stroke="'+colors[j]+'" stroke-width="1.8" fill="'+colors[j]+'" fill-opacity=".075"/>';
      if(x1-x0>32)out+='<text x="'+((x0+x1)/2).toFixed(1)+'" y="'+(high+24)+'" text-anchor="middle" fill="'+colors[j]+'" font-size="11" font-weight="750">'+esc(formatChannel(g.v,ch))+'</text>';
     });
    }
   }else{
    let path="";
    for(let i=0;i<=N;i++){
     const t=win.times[i];if(state.reveal!==null&&t>state.reveal)break;
     const xx=mapX(t,W,state.left,state.right,sx,ex);
     const val=state.coupling[j]==="GND"?state.vOffset[j]:arr[i]+state.vOffset[j];
     path+=(i?"L":"M")+xx.toFixed(1)+" "+yFor(val).toFixed(1)+" ";
    }
    out+='<path d="'+path+'" stroke="'+colors[j]+'" stroke-width="2.5" fill="none"/>';
   }
   // Both points are visible on every active channel, correlated to the two times.
   [[state.a,"A","#ffda81"],[state.b,"B","#61e0bc"]].forEach(([t,marker,c])=>{
    if(t<state.left||t>state.right)return;
    const v=signalNum(t,j),xx=mapX(t,W,state.left,state.right,sx,ex);
    const yy=ch.type==="bus"?yTop+53:ch.type==="digital"?(v>=.5?yTop+33:yTop+73):yFor(v+state.vOffset[j]);
    out+='<circle class="ix-ab-point" data-marker="'+marker+'" data-ch="'+j+'" cx="'+xx.toFixed(1)+'" cy="'+yy.toFixed(1)+'" r="5" fill="'+c+'" stroke="'+bg+'" stroke-width="1.5"/>';
   });
   // Trigger level indicator on triggered channel
   if(j===state.trigger){
    const ty=clamp(yFor(state.level),yTop+4,yBot-4);
    out+='<line x1="'+sx+'" x2="'+ex+'" y1="'+ty+'" y2="'+ty+'" stroke="#ff9d5c" stroke-width="1" stroke-dasharray="4 4"/>'+
     '<polygon points="'+(sx-8)+','+(ty-4)+' '+sx+','+ty+' '+(sx-8)+','+(ty+4)+'" fill="#ff9d5c"/>';
   }
  });

  // F1 Math overlay on top of display when active
  if(!state.cleared && state.mathMode!=="off" && state.mathMode!=="fft"){
   const fVals=[];
   for(let i=0;i<=N;i++){
    const jArr=[win.vals[0][i],win.vals[1][i],win.vals[2][i],win.vals[3][i]];
    if(state.mathMode==="diff")fVals.push(jArr[0]-jArr[1]);
    else if(state.mathMode==="power")fVals.push(jArr[1]*jArr[2]);
    else if(state.mathMode==="deriv")fVals.push(i>0?(jArr[1]-win.vals[1][i-1])/Math.max(1e-6,win.times[i]-win.times[i-1]):0);
    else if(state.mathMode==="integ")fVals.push((fVals[i-1]||0)+jArr[2]*((win.times[1]-win.times[0])||1));
    else fVals.push(Math.max(jArr[0],jArr[1]));
   }
   const fMin=Math.min(...fVals),fMax=Math.max(...fVals),fSpan=Math.max(1e-6,fMax-fMin);
   const mPath=fVals.map((v,i)=>((i?"L":"M")+mapX(win.times[i],W,state.left,state.right,sx,ex).toFixed(1)+" "+(468-(v-fMin)/fSpan*78).toFixed(1))).join(" ");
   out+='<path d="'+mPath+'" stroke="#d094ff" stroke-width="2.4" fill="none" opacity=".92"/>';
   out+='<rect x="130" y="458" width="245" height="22" rx="4" fill="#2c1b47" stroke="#c58dff"/><text x="138" y="473" fill="#ebd2ff" font-size="11" font-weight="bold">F1 MATH ('+esc(state.mathMode.toUpperCase())+'): '+fMin.toFixed(2)+'..'+fMax.toFixed(2)+'</text>';
  }

  // Cursors A and B
  [state.a,state.b].forEach((t,i)=>{
   if(t<state.left||t>state.right)return;
   const x=mapX(t,W,state.left,state.right,sx,ex),c=i?"#61e0bc":"#ffda81";
   out+='<path d="M'+x+' 34 V494" stroke="'+c+'" stroke-width="1.6" stroke-dasharray="7 5"/><rect x="'+(x-18)+'" y="6" width="36" height="22" rx="4" fill="#213a4b" stroke="'+c+'"/><text x="'+x+'" y="21" fill="'+c+'" text-anchor="middle" font-size="12">'+(i?"B":"A")+'</text>';
  });
  // Event callout markers
  activeDef.events.forEach(v=>{
   if(v.t<state.left||v.t>state.right)return;
   const x=mapX(v.t,W,state.left,state.right,sx,ex),yy=42+v.ch*each+52;
   out+='<circle cx="'+x+'" cy="'+yy+'" r="4.5" fill="#ffebaa" stroke="#172739" stroke-width="1.5"/>'+
    '<rect x="'+clamp(x-55,sx,ex-122)+'" y="'+(yy+14)+'" width="120" height="19" rx="3" fill="#2d3850" stroke="#738398"/><text x="'+clamp(x+5,sx+60,ex-62)+'" y="'+(yy+27)+'" fill="#f6e3ad" text-anchor="middle" font-size="9.5">'+esc(v.label.slice(0,20))+'</text>';
  });
  $("#ixPlot").innerHTML=out;
 }

 function drawMobileSvgs(win){
  const sigs=currentSignals(),W=360,sx=76,ex=347;
  $("#ixMobile").innerHTML=sigs.map((ch,j)=>{
   if(!state.active[j])return "";
   const arr=win.vals[j];
   let out='<svg viewBox="0 0 360 138" role="img" aria-label="CH'+(j+1)+' '+esc(ch.name)+'"><rect width="360" height="138" fill="#0b182b"/>';
   out+='<text x="8" y="16" fill="'+colors[j]+'" font-size="12">CH'+(j+1)+' '+esc(ch.name)+'</text><text x="350" y="16" fill="#d8eafd" font-size="10" text-anchor="end">'+esc(ch.probe)+' · '+esc(ch.unit)+'</text>';
   for(let i=0;i<=4;i++){const yy=26+i*22,vol=ch.max-(ch.max-ch.min)*i/4;out+='<path d="M76 '+yy+' H347" stroke="#2f405c" stroke-dasharray="4 5"/><text x="70" y="'+(yy+4)+'" fill="#b6cee2" text-anchor="end" font-size="9.5">'+vol.toFixed(1)+'</text>';}
   const path=arr.map((v,i)=>((i?"L":"M")+(sx+i/(arr.length-1)*(ex-sx)).toFixed(1)+" "+(114-clamp((v-ch.min)/(ch.max-ch.min||1),0,1)*86).toFixed(1))).join(" ");
   out+='<path d="'+path+'" stroke="'+colors[j]+'" stroke-width="2.4" fill="none"/>';
   [[state.a,"#ffe08a","A"],[state.b,"#69e3be","B"]].forEach(([t,c,l])=>{if(t>=state.left&&t<=state.right){const x=sx+(t-state.left)/(state.right-state.left)*(ex-sx);out+='<path d="M'+x+' 22 V120" stroke="'+c+'" stroke-dasharray="4 4"/><text x="'+x+'" y="132" fill="'+c+'" text-anchor="middle" font-size="10">'+l+'</text>';}});
   return out+'</svg>';
  }).join("");
 }

 function draw(){
  syncB();
  const sigs=currentSignals();
  $("#ixTopic").textContent=activeDef.title;
  $("#ixOrigin").textContent=state.captureMode==="fault"?("🔴 "+activeDef.faultLabel):("🟢 "+activeDef.fixedLabel);
  $("#ixOrigin").className="ix-tag "+(state.captureMode==="fault"?"fault":"fixed");
  $("[data-mode-btn='fault']").setAttribute("aria-pressed",String(state.captureMode==="fault"));
  $("[data-mode-btn='fixed']").setAttribute("aria-pressed",String(state.captureMode==="fixed"));
  $("#ixAcqSpec").textContent=activeDef.sampleRate+" · "+activeDef.memDepth;
  $("#ixTimeStatus").textContent=timeText(state.left)+"–"+timeText(state.right);
  $("#ixWindow").textContent=$("#ixTimeStatus").textContent;
  $("#ixTrigStatus").textContent="TRIG: CH"+(state.trigger+1)+" ("+state.trigType.toUpperCase()+" "+(state.slope==="rise"?"↑":"↓")+") @ "+state.level.toFixed(2);
  $("#ixRunStatus").textContent=state.running?"RUN":(state.sweepMode.toUpperCase()+" STOP");
  $("#ixScreenWrap").classList.toggle("ks-light-crt",state.lightCrt);
  $("#ixChannels").innerHTML=sigs.map((ch,j)=>
   '<div class="ix-channelwrap"><button class="ix-channel" data-ix-ch="'+j+'" type="button" aria-pressed="'+state.active[j]+'"><strong style="color:'+colors[j]+'">CH'+(j+1)+' · '+esc(ch.name)+'</strong><small>'+esc(ch.desc)+'</small><span>'+esc(ch.probe)+' · '+fmt((ch.max-ch.min)/state.vGain[j]/8,ch.unit)+'/div</span></button>'+
   '<label class="ix-vgain">Gain<select data-ix-gain="'+j+'"><option value="0.5"'+(state.vGain[j]===0.5?' selected':'')+'>0.5× Span</option><option value="1"'+(state.vGain[j]===1?' selected':'')+'>1× Fit</option><option value="2"'+(state.vGain[j]===2?' selected':'')+'>2× Zoom</option><option value="4"'+(state.vGain[j]===4?' selected':'')+'>4× Zoom</option></select></label>'+
   '<label class="ix-vgain">Coupling<select data-ix-coup="'+j+'">'+["DC 50Ω","DC 1MΩ","AC","GND"].map(cp=>'<option value="'+cp+'"'+(state.coupling[j]===cp?' selected':'')+'>'+cp+'</option>').join('')+'</select></label></div>'
  ).join("");
  $("#ixEvents").innerHTML=activeDef.events.map((v,i)=>'<button type="button" data-ix-event="'+i+'">◉ '+esc(v.label)+' @ '+timeText(v.t)+'</button>').join("");
  $("#ixExplain").textContent=activeDef.lesson;

  const win=sampleWindow(260);
  drawMainSvg(win);
  drawMobileSvgs(win);
  drawFft(win);
  drawAnalyze(win);
  drawBoardTopology(win);

  // Quick 4-row table + Full 14-metric table
  let quickHtml="",fullHtml="";
  sigs.forEach((ch,j)=>{
   const st=computeStats(win.vals[j]);
   const tm=measureTiming(win.vals[j],win.times,activeDef.unit);
   quickHtml+='<tr><td style="color:'+colors[j]+'">CH'+(j+1)+' '+esc(ch.name)+'</td><td>'+fmt(st.min,ch.unit)+'</td><td>'+fmt(st.max,ch.unit)+'</td><td>'+fmt(st.pp,ch.unit)+'</td><td>'+fmt(st.rms,ch.unit)+'</td></tr>';
   fullHtml+='<tr><th style="color:'+colors[j]+'">CH'+(j+1)+' '+esc(ch.name)+'</th><td>'+fmt(st.min,ch.unit)+'</td><td>'+fmt(st.max,ch.unit)+'</td><td>'+fmt(st.pp,ch.unit)+'</td><td>'+fmt(st.avg,ch.unit)+'</td><td>'+fmt(st.rms,ch.unit)+'</td><td>'+fmt(st.std,ch.unit)+'</td><td>'+tm.overshoot.toFixed(1)+'%</td><td>'+formatFreq(tm.freq)+'</td><td>'+(tm.period?tm.period.toFixed(2)+' '+activeDef.unit:'—')+'</td><td>'+(tm.duty!==null?tm.duty.toFixed(1)+'%':'—')+'</td><td>'+(tm.rise!==null?tm.rise.toFixed(2)+' '+activeDef.unit:'—')+'</td><td>'+(tm.fall!==null?tm.fall.toFixed(2)+' '+activeDef.unit:'—')+'</td><td>'+tm.slew.toFixed(2)+' '+ch.unit+'/'+activeDef.unit+'</td></tr>';
  });
  $("#ixMeasures").innerHTML=quickHtml;
  $("#ixFullMeasureBody").innerHTML=fullHtml;

  const delta=state.b-state.a,sc=TIME_SCALE[activeDef.unit]||1e-9,freq=Math.abs(delta)>1e-9?1/(Math.abs(delta)*sc):0;
  $("#ixALabel").textContent=timeText(state.a);$("#ixBLabel").textContent=timeText(state.b);
  $("#ixLinkB").setAttribute("aria-pressed",String(state.linkedB));
  $("#ixLinkB").textContent=state.linkedB?"🔗 Link B to A: ON":"Unlink B: OFF";
  $("#ixLinkHint").textContent=state.linkedB?"B tracks A by Δt "+delta.toFixed(2)+" "+activeDef.unit:"A/B independent; both read all 4 channels";
  $("#ixA").value=state.a;$("#ixB").value=state.b;
  $("#ixMarkerRows").innerHTML='<tr><td>M1 / A</td><td>'+timeText(state.a)+'</td><td rowspan="2">'+delta.toFixed(2)+' '+activeDef.unit+'</td><td rowspan="2">'+formatFreq(freq)+'</td></tr><tr><td>M2 / B</td><td>'+timeText(state.b)+'</td></tr>';
  $("#ixCursorSummary").textContent="A "+timeText(state.a)+" → B "+timeText(state.b)+" · Δt "+delta.toFixed(3)+" "+activeDef.unit+" · 1/|Δt| "+formatFreq(freq);
  $("#ixAtCursor").innerHTML='<div class="ix-ab-detail"><table><thead><tr><th>Channel</th><th>A · '+timeText(state.a)+'</th><th>B · '+timeText(state.b)+'</th><th>Δ (B−A)</th></tr></thead><tbody>'+
   sigs.map((ch,j)=>'<tr><th style="color:'+colors[j]+'">CH'+(j+1)+' '+esc(ch.name)+'</th><td>'+esc(formatChannel(signalNum(state.a,j),ch))+'</td><td>'+esc(formatChannel(signalNum(state.b,j),ch))+'</td><td>'+
    (ch.type==="digital"?((signalNum(state.a,j)>=.5?1:0)+" → "+(signalNum(state.b,j)>=.5?1:0)):ch.type==="bus"?(esc(formatChannel(signalNum(state.a,j),ch))+" → "+esc(formatChannel(signalNum(state.b,j),ch))):fmt(signalNum(state.b,j)-signalNum(state.a,j),ch.unit))+
    '</td></tr>').join("")+'</tbody></table></div>';
 }

 // Keysight Infiniium Menubar drawers
 function renderMenuDrawer(menuKey){
  const drawer=$("#ksDrawer");
  if(!menuKey){drawer.hidden=true;root.querySelectorAll(".ks-menu-trigger").forEach(b=>b.setAttribute("aria-expanded","false"));state.openMenu=null;return;}
  state.openMenu=menuKey;
  root.querySelectorAll(".ks-menu-trigger").forEach(b=>b.setAttribute("aria-expanded",String(b.dataset.ksMenu===menuKey)));
  const titleMap={scope:"SCOPE · ACQUISITION & ENGINE",file:"FILE · .SET PRESETS, CSV/SVG EXPORT & IMPORT",control:"CONTROL · RUN / SINGLE / RECORD LENGTH",setup:"SETUP · CH1–CH4 PROBE, COUPLING, BW LIMIT & TIMEBASE",display:"DISPLAY · GRATICULE, PERSISTENCE & THEME",trigger:"TRIGGER · EDGE / GLITCH / RUNT / DROOP WINDOW",measure:"MEASURE · 14-METRIC AUTO STATISTICS",math:"MATH · F1 ALGEBRA, DERIVATIVE, INTEGRAL & FFT",analyze:"ANALYZE · SILICON REGISTERS, FAULTY VS FIXED & REF R1",utilities:"UTILITIES · SELF-CAL, PROBE COMP & SHORTCUTS",help:"HELP · PROBE SAFETY & OSCILLOSCOPE GUIDE"};
  let body="";
  if(menuKey==="scope"){
   body='<div class="ks-menu-grid"><div class="ks-menu-card"><h6>Acquisition Mode</h6><button type="button" data-ks-act="acq-8g">Realtime · 8 GSa/s · 10 Mpts</button><button type="button" data-ks-act="acq-16g">High-BW · 16 GSa/s · 22 Mpts</button><button type="button" data-ks-act="acq-20g">Peak Detect · 20 GSa/s · 50 Mpts</button></div><div class="ks-menu-card"><h6>Instrument Reset & Fit</h6><button type="button" data-ks-act="autoset">Autoscale (Fit All Channels)</button><button type="button" data-ks-act="default">Factory Default Setup</button></div></div>';
  }else if(menuKey==="file"){
   body='<div class="ks-menu-grid"><div class="ks-menu-card"><h6>Recall Bench .set Setup</h6>'+presets.map(p=>'<button type="button" data-ks-preset="'+esc(p.id)+'">'+esc(p.presetName)+'</button>').join('')+'<button type="button" data-ks-preset="active">Restore Active Card/Lab Setup</button></div><div class="ks-menu-card"><h6>Save / Export / Import</h6><button type="button" data-ks-act="dl-csv">Export Visible Samples (.csv)</button><button type="button" data-ks-act="dl-svg">Export Oscilloscope Screen (.svg)</button><button type="button" data-ks-act="dl-set">Save Scope Setup (.set JSON)</button></div></div>';
  }else if(menuKey==="control"){
   body='<div class="ks-menu-grid"><div class="ks-menu-card"><h6>Sweep & Capture</h6><button type="button" data-ks-act="run">▶ Run Sweep</button><button type="button" data-ks-act="single">Single Capture</button><button type="button" data-ks-act="stop">■ Stop Acquisition</button><button type="button" data-ks-act="clear">Clear Graticule Display</button></div><div class="ks-menu-card"><h6>Sweep Mode & Timebase</h6><button type="button" data-ks-act="sweep-auto" aria-pressed="'+(state.sweepMode==="auto")+'">Auto Sweep</button><button type="button" data-ks-act="sweep-norm" aria-pressed="'+(state.sweepMode==="normal")+'">Normal Sweep</button><button type="button" data-ks-act="sweep-single" aria-pressed="'+(state.sweepMode==="single")+'">Single Sweep</button></div></div>';
  }else if(menuKey==="setup"){
   body='<div class="ks-menu-grid">'+currentSignals().map((ch,j)=>'<div class="ks-menu-card"><h6 style="color:'+colors[j]+'">CH'+(j+1)+' · '+esc(ch.name)+'</h6><label>Coupling<select data-ks-setcoup="'+j+'">'+["DC 50Ω","DC 1MΩ","AC","GND"].map(o=>'<option value="'+o+'"'+(state.coupling[j]===o?' selected':'')+'>'+o+'</option>').join('')+'</select></label><label>BW Limit<select data-ks-setbw="'+j+'">'+["12 GHz","2 GHz","200 MHz","20 MHz"].map(o=>'<option value="'+o+'"'+(state.bw[j]===o?' selected':'')+'>'+o+'</option>').join('')+'</select></label><label>Offset<input type="number" step="0.1" value="'+state.vOffset[j]+'" data-ks-setoff="'+j+'"></label></div>').join('')+'</div>';
  }else if(menuKey==="display"){
   body='<div class="ks-menu-grid"><div class="ks-menu-card"><h6>Graticule Grid</h6><button type="button" data-ks-act="grid-full" aria-pressed="'+(state.gridStyle==="full")+'">Full Grid (10 × 8)</button><button type="button" data-ks-act="grid-axes" aria-pressed="'+(state.gridStyle==="axes")+'">Center Axes Only</button><button type="button" data-ks-act="grid-frame" aria-pressed="'+(state.gridStyle==="frame")+'">Frame Only</button></div><div class="ks-menu-card"><h6>Persistence & CRT Theme</h6><button type="button" data-ks-act="pers-off" aria-pressed="'+(state.persistence==="off")+'">Persistence OFF</button><button type="button" data-ks-act="pers-var" aria-pressed="'+(state.persistence==="variable")+'">Color Persistence ON</button><button type="button" data-ks-act="toggle-theme" aria-pressed="'+state.lightCrt+'">Toggle Light / Dark CRT</button></div></div>';
  }else if(menuKey==="trigger"){
   body='<div class="ks-menu-grid"><div class="ks-menu-card"><h6>Trigger Qualification</h6><button type="button" data-ks-act="trig-edge" aria-pressed="'+(state.trigType==="edge")+'">Edge (Rising / Falling)</button><button type="button" data-ks-act="trig-glitch" aria-pressed="'+(state.trigType==="glitch")+'">Glitch (&lt; 2 ns pulse)</button><button type="button" data-ks-act="trig-runt" aria-pressed="'+(state.trigType==="runt")+'">Runt Pulse Threshold</button><button type="button" data-ks-act="trig-window" aria-pressed="'+(state.trigType==="window")+'">Window / PDN Droop</button></div><div class="ks-menu-card"><h6>Actions</h6><button type="button" data-ks-act="center-trig">Center Trigger on Screen</button><button type="button" data-ks-act="force-trig">Force Immediate Trigger</button></div></div>';
  }else if(menuKey==="measure"){
   body='<div class="ks-menu-grid"><div class="ks-menu-card"><h6>Active Measurement Suite</h6><p style="margin:0;color:#b8d7f5">All 14 live metrics (Vmin, Vmax, Vpp, Vavg, Vrms, StdDev, Overshoot%, Freq, Period, Duty%, Rise, Fall, Slew) are updating live in the table below the scope.</p><button type="button" data-ks-act="snap-cursors">Place A/B Cursors on First Event Window</button></div></div>';
  }else if(menuKey==="math"){
   body='<div class="ks-menu-grid"><div class="ks-menu-card"><h6>F1 Real-Time Math Trace</h6>'+[["off","OFF"],["diff","CH1 − CH2 (Differential)"],["power","CH2 × CH3 (Inst. Power)"],["deriv","d(CH2)/dt (Edge Slew)"],["integ","∫ CH3 dt (Charge ΔQ)"],["watermark","Watermark Peak Envelope"]].map(([k,l])=>'<button type="button" data-ks-math="'+k+'" aria-pressed="'+(state.mathMode===k)+'">'+l+'</button>').join('')+'</div><div class="ks-menu-card"><h6>FFT Source Channel</h6>'+[0,1,2,3].map(j=>'<button type="button" data-ks-fftch="'+j+'" aria-pressed="'+(state.fftCh===j)+'">Compute FFT on CH'+(j+1)+'</button>').join('')+'</div></div>';
  }else if(menuKey==="analyze"){
   body='<div class="ks-menu-grid"><div class="ks-menu-card"><h6>Compare Captures (Faulty vs Fixed)</h6><button type="button" data-ks-act="mode-fault" aria-pressed="'+(state.captureMode==="fault")+'">🔴 Faulty / Buggy Capture</button><button type="button" data-ks-act="mode-fixed" aria-pressed="'+(state.captureMode==="fixed")+'">🟢 Fixed / Golden Capture</button><button type="button" data-ks-act="save-r1">Snapshot Current Traces into Ref (R1)</button><button type="button" data-ks-act="toggle-r1" aria-pressed="'+state.showRef+'">Toggle Dashed R1 Comparison</button></div></div>';
  }else if(menuKey==="utilities"){
   body='<div class="ks-menu-grid"><div class="ks-menu-card"><h6>Bench Probe Compensation & Cal</h6><button type="button" data-ks-act="preset-i2c">Test Open-Drain R_p Compensation</button><button type="button" data-ks-act="preset-veagle">Run 16 GSa/s 1169B Shunt Cal</button></div></div>';
  }else{
   body='<div class="ks-menu-grid"><div class="ks-menu-card"><h6>Oscilloscope Probe Safety & f_knee</h6><p style="margin:0;color:#cfe2f5"><b>Rule 1:</b> Never attach two ground-referenced probe clips across a high-side shunt — use a true differential probe (1169B) to prevent dead-shorting the rail.<br><b>Rule 2:</b> Required scope bandwidth BW >= 2 × f_knee ≈ 1 / t_rise. Use a &lt;5 mm spring ground tip on power rails.</p></div></div>';
  }
  drawer.innerHTML='<div class="ks-drawer-head"><strong>'+(titleMap[menuKey]||menuKey.toUpperCase())+'</strong><button type="button" class="ks-drawer-close" id="ksCloseDrawer">✕ Close</button></div>'+body;
  drawer.hidden=false;
  $("#ksCloseDrawer").onclick=()=>renderMenuDrawer(null);
 }

 // Menubar keyboard (roving tabindex + ArrowLeft/ArrowRight + ArrowDown + Escape) & click/hover
 const triggers=[...root.querySelectorAll(".ks-menubar > [data-ks-menu]")];
 triggers.forEach(btn=>{
  btn.onclick=e=>{e.stopPropagation();const key=btn.dataset.ksMenu;renderMenuDrawer(state.openMenu===key?null:key);};
  btn.onpointerenter=()=>{if(state.openMenu&&state.openMenu!==btn.dataset.ksMenu){renderMenuDrawer(btn.dataset.ksMenu);}};
  btn.onkeydown=e=>{
   const i=triggers.indexOf(btn);
   if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
    e.preventDefault();
    const nx=triggers[(i+(e.key==="ArrowRight"?1:-1)+triggers.length)%triggers.length];
    triggers.forEach(t=>t.tabIndex=(t===nx?0:-1));
    nx.focus({preventScroll:true});
    if(state.openMenu)renderMenuDrawer(nx.dataset.ksMenu);
   }else if(e.key==="ArrowDown"){
    e.preventDefault();renderMenuDrawer(btn.dataset.ksMenu);$("#ksDrawer").querySelector("button,select,input")?.focus();
   }else if(e.key==="Escape"){
    renderMenuDrawer(null);btn.focus();
   }
  };
 });

 $("#ksDrawer").onchange=e=>{
  const cp=e.target.closest("[data-ks-setcoup]"),bw=e.target.closest("[data-ks-setbw]"),off=e.target.closest("[data-ks-setoff]");
  if(cp){state.coupling[+cp.dataset.ksSetcoup]=cp.value;draw();}
  if(bw){state.bw[+bw.dataset.ksSetbw]=bw.value;draw();}
  if(off){state.vOffset[+off.dataset.ksSetoff]=clamp(Number(off.value)||0,-10,10);draw();}
 };
 $("#ksDrawer").onclick=e=>{
  const act=e.target.closest("[data-ks-act]")?.dataset.ksAct;
  const preset=e.target.closest("[data-ks-preset]")?.dataset.ksPreset;
  const m=e.target.closest("[data-ks-math]")?.dataset.ksMath;
  const fch=e.target.closest("[data-ks-fftch]")?.dataset.ksFftch;
  if(preset){loadPreset(preset);renderMenuDrawer(null);return;}
  if(m){state.mathMode=m;$("#ixMathMode").value=m;renderMenuDrawer("math");draw();return;}
  if(fch!==undefined){state.fftCh=Number(fch);renderMenuDrawer("math");draw();return;}
  if(!act)return;
  if(act==="acq-8g"){activeDef.sampleRate="8 GSa/s";activeDef.memDepth="10 Mpts";}
  if(act==="acq-16g"){activeDef.sampleRate="16 GSa/s";activeDef.memDepth="22 Mpts";}
  if(act==="acq-20g"){activeDef.sampleRate="20 GSa/s";activeDef.memDepth="50 Mpts";}
  if(act==="autoset"){$("#ixAuto").click();}
  if(act==="default"){loadPreset("active");state.vScale=1;state.rNorm=1;state.cNorm=1;state.lNorm=1;$("#ksVoltSlider").value="1";$("#ksVoltVal").textContent="1.00×";}
  if(act==="run"){$("#ixRun").click();}
  if(act==="single"){$("#ixSingle").click();}
  if(act==="stop"){stop();}
  if(act==="clear"){$("#ixClear").click();}
  if(act.startsWith("sweep-")){state.sweepMode=act.slice(6);}
  if(act.startsWith("grid-")){state.gridStyle=act.slice(5);}
  if(act==="pers-off"){state.persistence="off";}
  if(act==="pers-var"){state.persistence="variable";}
  if(act==="toggle-theme"){state.lightCrt=!state.lightCrt;}
  if(act.startsWith("trig-")){state.trigType=act.slice(5);$("#ixTrigType").value=state.trigType;}
  if(act==="center-trig"){$("#ixCenter").click();}
  if(act==="force-trig"){state.cleared=false;state.reveal=null;}
  if(act==="snap-cursors"){const e0=activeDef.events[0]?.t||activeDef.T*0.2;state.gap=activeDef.T*.2;setA(e0);}
  if(act==="mode-fault"){state.captureMode="fault";}
  if(act==="mode-fixed"){state.captureMode="fixed";}
  if(act==="save-r1"){$("#ixSaveRef").click();}
  if(act==="toggle-r1"){state.showRef=!state.showRef;$("#ixSaveRef").setAttribute("aria-pressed",String(state.showRef));}
  if(act==="dl-csv"){$("#ixDlCsv").click();}
  if(act==="dl-svg"){$("#ixDlSvg").click();}
  if(act==="dl-set"){$("#ixDlSet").click();}
  if(act==="preset-i2c"){loadPreset("I2C_47k_SharkFin_vs_2k2_Clean");}
  if(act==="preset-veagle"){loadPreset("Veagle_1169B_Rsense_16GSa_22Mpts");}
  draw();
  if(state.openMenu)renderMenuDrawer(state.openMenu);
 };

 function loadPreset(id){
  stop();state.cleared=false;state.customCsv=null;state.presetId=id;
  $("#ixPreset").value=id;
  if(id==="active"){activeDef=built.profile;}
  else{activeDef=presets.find(p=>p.id===id)||built.profile;}
  syncDefBounds(true);draw();
 }

 function triggerTime(){
  const T=activeDef.T,lev=Number($("#ixLevel").value)||0.5;
  let prev=signalNum(0,state.trigger);
  for(let i=1;i<=1200;i++){
   const t=T*i/1200,cur=signalNum(t,state.trigger);
   if(state.slope==="rise"?(prev<lev&&cur>=lev):(prev>lev&&cur<=lev))return t;
   prev=cur;
  }
  return activeDef.events[0]?.t||T*0.3;
 }

 const stop=()=>{state.running=false;state.reveal=null;cancelAnimationFrame(state.raf);draw();};
 $("#ixRun").onclick=()=>{
  stop();state.cleared=false;state.running=true;state.reveal=0;setA(0);
  const start=performance.now(),dur=6500,T=activeDef.T;
  function frame(now){
   if(!state.running)return;
   const f=clamp((now-start)/dur,0,1);
   setA(T*f);state.reveal=state.a;draw();
   if(f>=1){state.running=false;state.reveal=null;draw();return;}
   state.raf=requestAnimationFrame(frame);
  }
  state.raf=requestAnimationFrame(frame);
 };
 $("#ixStop").onclick=stop;
 $("#ixSingle").onclick=()=>{stop();state.cleared=false;state.gap=activeDef.T/10;setA(triggerTime());draw();};
 $("#ixClear").onclick=()=>{stop();state.cleared=true;draw();};
 $("#ixAuto").onclick=()=>{stop();state.cleared=false;state.vGain=[1,1,1,1];state.vOffset=[0,0,0,0];syncDefBounds(true);draw();};
 $("#ixZoomIn").onclick=()=>{stop();const w=(state.right-state.left)*0.5,m=(state.left+state.right)/2,nw=clamp(w,activeDef.T/25,activeDef.T);state.left=clamp(m-nw/2,0,activeDef.T-nw);state.right=state.left+nw;draw();};
 $("#ixZoomOut").onclick=()=>{stop();const w=(state.right-state.left)*2,m=(state.left+state.right)/2,nw=clamp(w,activeDef.T/25,activeDef.T);state.left=clamp(m-nw/2,0,activeDef.T-nw);state.right=state.left+nw;draw();};
 $("#ixCenter").onclick=()=>{stop();const m=triggerTime(),w=state.right-state.left;state.left=clamp(m-w/2,0,activeDef.T-w);state.right=state.left+w;setA(m);draw();};
 $("#ixTrigger").onchange=e=>{state.trigger=Number(e.target.value);draw();};
 $("#ixTrigType").onchange=e=>{state.trigType=e.target.value;draw();};
 $("#ixSlope").onchange=e=>{state.slope=e.target.value;draw();};
 $("#ixLevel").onchange=e=>{state.level=Number(e.target.value)||0;draw();};
 $("#ixDiv").onchange=e=>{const w=Number(e.target.value)*10,m=(state.left+state.right)/2;state.left=clamp(m-w/2,0,activeDef.T-w);state.right=state.left+w;draw();};
 $("#ixMathMode").onchange=e=>{state.mathMode=e.target.value;draw();};
 $("#ixPreset").onchange=e=>loadPreset(e.target.value);
 root.querySelectorAll("[data-mode-btn]").forEach(b=>b.onclick=()=>{state.captureMode=b.dataset.modeBtn;state.cleared=false;draw();});
 $("#ixSaveRef").onclick=()=>{
  const win=sampleWindow(200);
  state.refTrace=win.vals;state.showRef=!state.showRef;
  $("#ixSaveRef").setAttribute("aria-pressed",String(state.showRef));
  $("#ixSaveRef").textContent=state.showRef?"Hide R1 Compare":"Save R1 Compare";
  draw();
 };
 $("#ixA").oninput=e=>{stop();setA(Number(e.target.value));draw();};
 $("#ixB").oninput=e=>{stop();state.b=clamp(Number(e.target.value),0,activeDef.T);state.gap=state.b-state.a;draw();};
 $("#ixLinkB").onclick=()=>{state.linkedB=!state.linkedB;if(state.linkedB)state.gap=state.b-state.a;draw();};
 $("#ixNextAB").onclick=()=>{stop();const e=activeDef.events.find(e=>e.t>state.a+1e-5)||activeDef.events[0];if(e)setA(e.t);draw();};
 $("#ixChannels").onclick=e=>{const b=e.target.closest("[data-ix-ch]");if(!b)return;state.active[+b.dataset.ixCh]=!state.active[+b.dataset.ixCh];draw();};
 $("#ixChannels").onchange=e=>{
  const g=e.target.closest("[data-ix-gain]"),c=e.target.closest("[data-ix-coup]");
  if(g){state.vGain[+g.dataset.ixGain]=Number(g.value);draw();}
  if(c){state.coupling[+c.dataset.ixCoup]=c.value;draw();}
 };
 $("#ixEvents").onclick=e=>{const b=e.target.closest("[data-ix-event]");if(!b)return;const ev=activeDef.events[+b.dataset.ixEvent];state.gap=activeDef.T/10;setA(ev.t);$("#ixExplain").textContent=ev.reason+" "+activeDef.lesson;draw();};

 // Physical board reactor sliders below scope
 $("#ksVoltSlider").oninput=e=>{state.vScale=Number(e.target.value);$("#ksVoltVal").textContent=state.vScale.toFixed(2)+"×";draw();};
 $("#ksRSelect").onchange=e=>{state.rNorm=Number(e.target.value);draw();};
 $("#ksCSelect").onchange=e=>{state.cNorm=Number(e.target.value);draw();};
 $("#ksLSelect").onchange=e=>{state.lNorm=Number(e.target.value);draw();};

 // Exports & CSV Import
 function download(name,content,mime){const url=URL.createObjectURL(new Blob([content],{type:mime})),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
 $("#ixDlCsv").onclick=()=>{
  const win=sampleWindow(300),sigs=currentSignals();
  const csv="time_"+activeDef.unit+","+sigs.map(s=>s.name).join(",")+"\n"+win.times.map((t,i)=>t.toFixed(3)+","+sigs.map((_,j)=>win.vals[j][i].toFixed(5)).join(",")).join("\n")+"\n";
  download((activeDef.presetName||"scope")+".csv",csv,"text/csv");
 };
 $("#ixDlSvg").onclick=()=>download((activeDef.presetName||"scope")+".svg",'<?xml version="1.0" encoding="UTF-8"?>\n'+$("#ixPlot").outerHTML.replace("<svg ","<svg xmlns=\"http://www.w3.org/2000/svg\" "),"image/svg+xml");
 $("#ixDlSet").onclick=()=>download((activeDef.presetName||"setup")+".json",JSON.stringify({preset:activeDef.presetName,mode:state.captureMode,sampleRate:activeDef.sampleRate,memDepth:activeDef.memDepth,trigger:{ch:state.trigger+1,type:state.trigType,slope:state.slope,level:state.level},channels:currentSignals().map((s,j)=>({name:s.name,probe:s.probe,coupling:state.coupling[j],bw:state.bw[j],gain:state.vGain[j]}))},null,2),"application/json");
 $("#ixUpCsv").onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  const text=await file.text();
  const rows=text.trim().split(/\r?\n/).filter(l=>l&&!l.startsWith("#")).map(l=>l.split(",").map(Number)).filter(r=>r.length>=2&&Number.isFinite(r[0]));
  if(rows.length<4)return;
  const T=rows[rows.length-1][0]-rows[0][0]||100,t0=rows[0][0];
  const cols=Math.min(4,rows[0].length-1);
  const cs=Array.from({length:4},(_,j)=>{
   const cIdx=Math.min(j+1,cols);
   const vs=rows.map(r=>r[cIdx]);
   return spec("CSV_CH"+(j+1),"rail","V",Math.min(...vs)-0.1,Math.max(...vs)+0.1,(t)=>{let idx=Math.round((t/T)*(rows.length-1));return rows[clamp(idx,0,rows.length-1)][cIdx];},"Imported user CSV column "+cIdx,"CSV Import","DC","—");
  });
  state.customCsv={signals:cs};activeDef={...activeDef,T,t0,title:"Imported CSV: "+file.name,presetName:file.name};
  syncDefBounds(true);draw();
 };

 function seek(e,svg,mobile=false){
  const box=svg.getBoundingClientRect(),x=(e.clientX-box.left)/box.width*(mobile?360:1120),start=mobile?76:122,end=mobile?347:1092;
  if(x<start||x>end)return;
  stop();setA(state.left+(x-start)/(end-start)*(state.right-state.left));draw();
 }
 $("#ixPlot").onpointerdown=e=>seek(e,$("#ixPlot"),false);
 $("#ixMobile").onpointerdown=e=>{const svg=e.target.closest("svg");if(svg)seek(e,svg,true);};

 draw();
 root.dataset.mounted="true";
 root.__instrument={state,def:activeDef,draw,stop,setReset:t=>{
  if(built.id!=="reset")return;
  const alt=t>=68?"fixed":"fault";
  state.captureMode=alt;
  const s=alt==="fixed"?activeDef.signalsFixed:activeDef.signalsFault;
  s[3].fn=x=>step(x,t);
  activeDef.events[3].t=t;
  draw();
 }};
 return root.__instrument;
}

window.renderInstrumentConsole=markup;
window.mountInstrumentConsole=mount;
window.findInstrumentProfile=select;
})();
