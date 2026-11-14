"use strict";
/* Instrument Workbench — original educational instrument UI.
 * SPICE mode reads real stored ngspice samples. Other profiles are visibly marked
 * ILLUSTRATIVE TRAINING MODEL and are not measured traces or vendor captures.
 * Calibration and measurements are performed on the displayed data (no false PASS claims). */
(function(){
const colors=["#f4df45","#53da87","#5fa9ff","#f18aaf"];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),step=(t,x)=>+(t>=x),wave=(t,a,b)=>t>=a&&t<b?1:0;
const noisy=t=>.005*Math.sin(t*1.9)+.002*Math.sin(t*6.31);
const shape=(t,c,d=5,decay=17)=>t>=c?Math.exp(-(t-c)/decay)*Math.sin((t-c)/d*Math.PI*2):0;
const sampling=(t,interval,code)=>Math.floor(t/interval)%code;
const spec=(name,type,unit,min,max,fn,desc)=>({name,type,unit,min,max,fn,desc});
const event=(t,label,ch,reason)=>({t,label,ch,reason});
function profile(key,question,runId){
 const q=String(question||"").toLowerCase();
 const P=(id,title,unit,T,signals,events,lesson)=>({id,title,unit,T,signals,events,lesson});
 const rail=P("rail","Power-delivery transient / workload-step teaching model","μs",200,[
  spec("VDD_CORE","rail","V",.92,1.27,t=>1.2-(.09*Math.exp(-(t-49)/14)*step(t,49))+.052*Math.exp(-(t-140)/11)*step(t,140)+noisy(t),"Voltage rail · differential power probe"),
  spec("I_LOAD","current","A",0,1.5,t=>.3+.86*wave(t,48,140)+.02*Math.sin(t/8),"Load current · current probe"),
  spec("CLK_REF","clock","logic",-.15,1.15,t=>step(t,42)*(Math.floor((t-42)/4)%2?1:0),"Clock · illustrative timing, not CPU frequency"),
  spec("WORK_EN","digital","logic",-.15,1.15,t=>wave(t,48,140),"Workload enable · digital trigger")
 ],[event(48,"Workload starts",3,"Load-current step causes supply droop"),event(51,"Rail undershoot",0,"Measure Vmin relative to baseline"),event(140,"Workload stops",3,"Release causes positive rail overshoot")],
 "Compare load-current transitions against the rail’s undershoot and overshoot. AC-coupled ripple and DC voltage require different probe settings.");
 const reset=P("reset","Power-good / clock-lock / reset-sequencing model","ns",110,[
  spec("VDD_PG","digital","logic",-.15,1.15,t=>step(t,12),"Power-good · logic status"),
  spec("IO_PG","digital","logic",-.15,1.15,t=>step(t,28),"I/O power-good · logic status"),
  spec("PLL_LOCK","digital","logic",-.15,1.15,t=>step(t,48),"Reference-clock qualification · status"),
  spec("RESET_N","digital","logic",-.15,1.15,t=>step(t,68),"Active-low reset deassertion · 20 ns minimum interval")
 ],[event(12,"Core PG",0,"Core power good asserts"),event(28,"IO PG",1,"I/O power good asserts"),event(48,"PLL lock",2,"Clock readiness arrives last"),event(68,"Reset releases",3,"20 ns after final prerequisite")],
 "The earliest valid reset release in this educational sequence is max(12,28,48)+20 = 68 ns. This is a model, not a measured board.");
 const clock=P("clock","Clock / PLL locking and period measurement model","ns",100,[
  spec("REF_CLK","clock","logic",-.15,1.15,t=>Math.floor(t/5)%2,"Reference clock · period 10 ns in this model"),
  spec("PLL_LOCK","digital","logic",-.15,1.15,t=>step(t,32),"PLL lock indication"),
  spec("CLK_OUT","clock","logic",-.15,1.15,t=>step(t,32)*(Math.floor((t-32)/2.5)%2),"Output clock · period 5 ns, illustrative"),
  spec("RESET_N","digital","logic",-.15,1.15,t=>step(t,45),"Reset deasserted after lock")
 ],[event(10,"REF period",0,"Measure Δt of consecutive rising edges"),event(32,"Lock asserted",1,"Output clock becomes valid in teaching model"),event(45,"Reset releases",3,"Observe the setup/qualification interval")],
 "Use horizontal time cursors to measure T, then compute f=1/T. A GHz CPU clock requires a much faster ns/div setting than this scaled teaching trace.");
 const timing=P("timing","Setup / hold capture and sampled-value timing model","ns",100,[
  spec("CLK","clock","logic",-.15,1.15,t=>Math.floor(t/10)%2,"Sampling clock · rising edges at 10, 30, 50... ns"),
  spec("DATA_IN","digital","logic",-.15,1.15,t=>wave(t,17,37)+wave(t,43,71),"Input data · transition timing"),
  spec("DATA_Q","digital","logic",-.15,1.15,t=>wave(t,31,51)+wave(t,51,91),"Registered data · sampled on rising edge"),
  spec("VALID","digital","logic",-.15,1.15,t=>wave(t,31,90),"Captured-word valid")
 ],[event(30,"Sampling edge",0,"Data must be stable before the edge"),event(31,"CLK→Q delay",2,"Output changes after clock-to-Q delay"),event(50,"Next edge",0,"Check the setup and hold windows")],
 "Observe the input around the rising clock edge. Setup is before capture, hold is after capture; Q changes after clock-to-Q latency.");
 const dram=P("dram","DRAM ACT / READ / PRE / refresh protocol model","ns",100,[
  spec("CK","clock","logic",-.15,1.15,t=>Math.floor(t/5)%2,"Memory controller command clock"),
  spec("ACT_CMD","digital","logic",-.15,1.15,t=>wave(t,14,19),"Activate command"),
  spec("READ_CMD","digital","logic",-.15,1.15,t=>wave(t,36,41),"Read command · tRCD illustration"),
  spec("PRE_CMD","digital","logic",-.15,1.15,t=>wave(t,65,70),"Precharge command · tRAS illustration")
 ],[event(14,"ACT",1,"Open a row"),event(36,"READ",2,"ACT→READ = 22 ns, illustrating tRCD"),event(65,"PRE",3,"ACT→PRE = 51 ns, illustrating tRAS")],
 "This generic timing model uses illustrative intervals, not a measured DRAM controller or a specific JEDEC speed bin.");
 const pcie=P("pcie","PCIe link bring-up / reset / LTSSM event model","μs",100,[
  spec("REFCLK_OK","digital","logic",-.15,1.15,t=>step(t,12),"Reference clock ready status"),
  spec("PERST_N","digital","logic",-.15,1.15,t=>step(t,31),"PCIe active-low reset"),
  spec("LTSSM","bus","state",0,4,t=>t<31?0:t<53?1:t<78?2:3,"Encoded states: 0 Detect, 1 Polling, 2 Config, 3 L0"),
  spec("LINK_UP","digital","logic",-.15,1.15,t=>step(t,78),"System link status")
 ],[event(12,"Clock ready",0,"Reference timing prepared"),event(31,"PERST# high",1,"Reset deasserts after prerequisites"),event(53,"Configuration",2,"LTSSM progresses from Polling to Config"),event(78,"Link L0",3,"Functional link indicated")],
 "LTSSM is a state machine, not an analog rail. Polling/Config/L0 are encoded states; link readiness must follow valid power, clock and reset conditions.");
 const uart=P("uart","Host UART visibility / target boot model","ms",100,[
  spec("HOST_USB","digital","logic",-.15,1.15,t=>step(t,8),"Host enumerates USB-UART adapter"),
  spec("SOC_PG","digital","logic",-.15,1.15,t=>step(t,23),"Target power-good"),
  spec("SOC_RESET_N","digital","logic",-.15,1.15,t=>step(t,48),"Target reset release"),
  spec("UART_TX","digital","logic",-.15,1.15,t=>step(t,55)*(Math.floor((t-55)/4)%2),"Target UART activity (illustrative)")
 ],[event(8,"Adapter visible",0,"Proves only the host USB adapter enumerated"),event(23,"Target power good",1,"Target condition must be checked separately"),event(48,"Reset release",2,"Boot can begin after prerequisites"),event(55,"UART traffic",3,"Target TX activity is separate from adapter discovery")],
 "A USB adapter in lsusb is not proof that the target booted. Check measured target rail, reset and UART-TX activity.");
 const voltage=P("voltage","Sense-resistor current and instantaneous power model","μs",100,[
  spec("V_SUPPLY","rail","V",.7,1.35,t=>1.2-.08*wave(t,35,79),"DC rail · power-probe input"),
  spec("V_SENSE","rail","mV",0,60,t=>7+30*wave(t,35,79),"Differential shunt voltage · mV"),
  spec("I_LOAD","current","mA",0,700,t=>70+300*wave(t,35,79),"Derived from Vsense/Rsense, assuming 0.1Ω"),
  spec("EN","digital","logic",-.15,1.15,t=>wave(t,35,79),"Load activation trigger")
 ],[event(35,"Load enable",3,"Sense voltage rises with current"),event(79,"Load disabled",3,"Sense voltage and derived current return toward idle")],
 "Measure shunt voltage differentially, then calculate I=V_sense/R_sense and time-align V and I for power. Values are illustrative.");
 const rtl=P("rtl","Synchronous RTL pipeline / registered-data model","ns",100,[
  spec("CLK","clock","logic",-.15,1.15,t=>Math.floor(t/10)%2,"Clock · digital event signal"),
  spec("IN_BUS","bus","hex",0,15,t=>t<15?15:t<35?1:t<55?10:5,"Input bus · hex data words F,1,A,5"),
  spec("STAGE1","bus","hex",0,15,t=>t<30?15:t<50?1:t<70?10:5,"First register bank · one edge latency"),
  spec("OUT_BUS","bus","hex",0,15,t=>t<50?15:t<70?2:10,"Second register bank · computed prior-state output")
 ],[event(15,"Input F→1",1,"Input changes between capture edges"),event(30,"Stage1 captures",2,"Nonblocking assignment uses pre-edge state"),event(50,"Out changes",3,"Downstream registered output advances")],
 "Each bus is a digital value, not a voltage. Stage registers sample on edges; use vertical markers to distinguish before/after the edge.");
 const logs=P("log","Diagnostic state transitions / raw-log preservation model","ms",100,[
  spec("TEST_RUN","digital","logic",-.15,1.15,t=>wave(t,10,76),"Test execution status"),
  spec("RAW_FAIL","digital","logic",-.15,1.15,t=>step(t,43),"Latched raw failure event"),
  spec("PARSER_OK","digital","logic",-.15,1.15,t=>step(t,30),"Parser process running"),
  spec("SUMMARY","bus","state",0,3,t=>t<76?0:1,"Example summary code 0 Pending, 1 Complete — not PASS")
 ],[event(10,"Run starts",0,"Capture metadata and raw logs"),event(43,"Raw error",1,"Preserve earliest failing record"),event(76,"Summary produced",3,"A passing summary cannot override raw failure evidence")],
 "This is a diagnostic event timeline, not an electrical oscilloscope capture. Actual error logs must be preserved independently.");
 const shmoo=P("shmoo","Shmoo sweep controller and measurement-state model","ms",100,[
  spec("V_SET","rail","V",.7,1.5,t=>.85+.12*Math.floor(t/20),"Sweep voltage setpoint"),
  spec("F_SET","rail","MHz",100,650,t=>200+80*Math.floor(t/20),"Frequency sweep setpoint"),
  spec("TEST_BUSY","digital","logic",-.15,1.15,t=>Math.floor(t/10)%2,"Test-in-progress strobe"),
  spec("RESULT","bus","state",0,3,t=>t<20?0:t<60?1:t<80?2:0,"States 0 Untested, 1 Pass, 2 Fail")
 ],[event(20,"Next sweep point",0,"Only completed tests can be classified"),event(60,"Fail state",3,"Show FAIL distinctly from PASS"),event(80,"Next point",3,"Untested ≠ PASS")],
 "Never color untested or timeout points PASS. This chart models the sweep controller, not measured silicon margins.");
 const diagnostic=P("diagnostic","Engineering evidence / reproducible test event timeline","ms",100,[
  spec("STIMULUS","digital","logic",-.15,1.15,t=>wave(t,12,77),"Controlled test stimulus"),
  spec("MEASURED","digital","logic",-.15,1.15,t=>wave(t,29,77),"Observation captured (illustrative)"),
  spec("RAW_EVENT","digital","logic",-.15,1.15,t=>step(t,52),"Raw evidence preserved"),
  spec("REVIEW","bus","state",0,3,t=>t<77?0:2,"0 Awaiting review, 2 Evidence evaluated")
 ],[event(12,"Test begins",0,"Record controlled DUT and setup conditions"),event(29,"Observation",1,"Collect and timestamp evidence"),event(52,"Raw event",2,"Keep raw source before interpreting summary"),event(77,"Review",3,"Separate observation from diagnosis")],
 "This is a conceptual debugging workflow timeline, not electrical scope data. Verify all physical observations before claiming a component failure.");
 const differential=P("differential","Single-ended versus differential signaling model","ns",50,[
 spec("TX_P","rail","V",-.7,.7,t=>.45*Math.sin(t*.65)+.06*Math.sin(t*.2),"Positive conductor · analog line voltage"),
 spec("TX_N","rail","V",-.7,.7,t=>-.45*Math.sin(t*.65)+.06*Math.sin(t*.2),"Complementary conductor · analog line voltage"),
 spec("V_DIFF","rail","V",-1.2,1.2,t=>.9*Math.sin(t*.65),"Differential receiver: Vp − Vn"),
 spec("COMMON","rail","V",-.2,.2,t=>.06*Math.sin(t*.2),"Common-mode noise present on both lines")
 ],[event(9,"Opposite polarity",1,"Differential pair has complementary information"),event(19,"Common-mode noise",3,"Common disturbance cancels ideally in Vp−Vn"),event(30,"Difference Vp−Vn",2,"Receiver measures differential voltage")],
 "A differential receiver responds to V_P−V_N. In this illustrative pair, a shared common-mode disturbance cancels from the difference; actual margin depends on impedance and noise.");
 const serial=P("serial","High-speed serial channel / link-training model","ns",100,[
 spec("REF_CLK","clock","logic",-.15,1.15,t=>Math.floor(t/5)%2,"Reference timing signal; not the serial bit clock"),
 spec("TX_DATA","digital","logic",-.15,1.15,t=>Math.floor(t/4)%2,"Transmitted training pattern"),
 spec("RX_DATA","digital","logic",-.15,1.15,t=>t<13?0:Math.floor((t-13)/4)%2,"Delayed receiver representation"),
 spec("LINK_OK","digital","logic",-.15,1.15,t=>step(t,60),"Illustrative link negotiation status")
 ],[event(13,"Receiver delay",2,"Compare receiver edge alignment against TX"),event(41,"Training activity",1,"Link training may involve equalization and state transitions"),event(60,"Link ready",3,"Confirm status rather than assuming from a waveform alone")],
 "Generic serial-link learning model: a link can fail from channel loss, jitter, equalization, or negotiation; identify the protocol and its actual link-state evidence before claiming a cause.");
 const i2c=P("i2c","I²C start / address / ACK / stop protocol model","μs",100,[
 spec("SCL","clock","logic",-.15,1.15,t=>t<12||t>87?1:Math.floor((t-12)/5)%2,"Open-drain I²C clock with idle high"),
 spec("SDA","digital","logic",-.15,1.15,t=>t<12?1:t<18?0:t<28?1:t<43?0:t<55?1:t<69?0:t<84?1:1,"I²C data · open-drain bus"),
 spec("START","digital","logic",-.15,1.15,t=>wave(t,12,18),"SDA falls while SCL high"),
 spec("ACK","digital","logic",-.15,1.15,t=>wave(t,68,78),"Acknowledgment slot")
 ],[event(12,"START",2,"SDA transitions low with clock high"),event(68,"ACK slot",3,"Observe receiver acknowledgment"),event(88,"STOP / idle",1,"SDA returns high while clock is high")],
 "I²C is a digital two-wire protocol. Probe SDA and SCL against ground with suitable bandwidth; distinguish an ACK from missing pull-up, bus contention, or clock stretching.");
 const instrument=P("instrument","Oscilloscope vertical scale / trigger / acquisition model","μs",100,[
 spec("CH1_DUT","rail","V",-.2,1.5,t=>t<27?0:1.1+.17*shape(t,27,4,15),"Probed DUT voltage after step"),
 spec("CH2_REF","rail","V",-.2,1.5,t=>step(t,27)*1.1,"Reference stimulus"),
 spec("TRIGGER","digital","logic",-.15,1.15,t=>step(t,27),"Rising-edge trigger marker"),
 spec("AC_NOISE","rail","mV",-45,45,t=>t<27?0:18*Math.sin(t*3.1)+9*Math.sin(t*5.8),"AC-coupled ripple zoom (mV)")
 ],[event(27,"Trigger edge",2,"Trigger must coincide with the intended source event"),event(34,"Overshoot",0,"Use correct V/div and bandwidth to measure the excursion"),event(61,"Noise",3,"AC and DC coupling reveal different aspects of a supply")],
 "Set time/div to capture the event, V/div to use screen resolution without clipping, and trigger source/threshold to make the acquisition repeatable.");
 let cfg={rail,reset,clock,timing,dram,pcie,uart,voltage,rtl,logs,shmoo,diagnostic,differential,serial,i2c,instrument};
 if(key==="spice"){
  const data=(window.SI_SPICE_RUNS||[]),r=data.find(x=>x.id===runId)||data.find(x=>x.id==="high_200")||data[0];
  if(r){const n=r.trace.length;return P("spice","Transmission-line / reflection (actual ngspice samples)","ns",15,[
   spec("V_SOURCE","rail","V",-.2,1.7,t=>lookup(r.trace,t,1),"SPICE sample, driven source voltage"),
   spec("V_TX","rail","V",-.2,1.7,t=>lookup(r.trace,t,2),"SPICE sample, transmitter voltage"),
   spec("V_RX","rail","V",-.2,1.7,t=>lookup(r.trace,t,3),"SPICE sample, load-end receiver voltage"),
   spec("I_LOAD*","current","mA",Math.min(0,...r.trace.map(z=>z[3]/r.rl*1000))-.05,Math.max(1,...r.trace.map(z=>z[3]/r.rl*1000))*1.12,t=>lookup(r.trace,t,3)/r.rl*1000,"Derived from Vrx/Rload, not a separate instrument channel")
  ],[event(1,"Source step",0,"The voltage source changes state"),event(2,"First arrival",2,"Receiver initially responds after 1 ns line propagation"),event(4,"Reflected event",2,"Load/source reflections create later steps")],
  "Read CH1–CH3 from stored ngspice samples. CH4 is mathematically derived (V_RX/R_L); it was not a physical current-probe capture.");
  }
 }
 return cfg[key]||diagnostic;
}
function lookup(rows,t,col){
 let lo=0,hi=rows.length-1;
 while(lo<hi){let m=(lo+hi)>>1;if(rows[m][0]<t)lo=m+1;else hi=m}
 if(lo>0&&Math.abs(rows[lo-1][0]-t)<Math.abs(rows[lo][0]-t))lo--;
 return rows[lo][col];
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
 if(/clock|oscillator|pll|frequency|jitter/.test(s))return "clock";
 if(/reset|power.good|power.up/.test(s))return "reset";
 if(/log|parser|automation|report|timeout|fail/.test(s))return "logs";
 return "diagnostic";
}
function buildContext(ctx){
 const card=ctx.card||{},lab=ctx.lab||{};
 let question=String(card.question||ctx.question||lab.title||"Signal observation");
 let hint=card.topic||lab.desc||"";
 let id=ctx.kind==="reset"?"reset":ctx.kind==="lab"?select(question+" "+hint,lab.id):select(question,hint);
 if(ctx.kind==="lab"){
   const profiles={reset:"uart",dram:"dram",scope:"rail",clock:"clock",pcie:"pcie",automation:"logs",python:"logs"};
   id=profiles[lab.id]||select(question+" "+hint);
 }
 if(ctx.kind==="reset")id="reset";
 return {id,question,profile:profile(id,question,ctx.caseId)};
}
function markup(){
 return '<section class="ix-shell" aria-label="Interactive engineering waveform instrument" data-instrument>'+
  '<div class="ix-top"><div class="ix-brand">◉ ENGINEERING OSCILLOSCOPE · TRAINING CONSOLE</div><div class="ix-status"><span id="ixRunStatus">STOP</span><span id="ixTrigStatus">TRIG: CH1 ↑</span><span id="ixTimeStatus">0–100 ns</span></div></div>'+
  '<div class="ix-provenance"><span class="ix-tag" id="ixOrigin">TRAINING MODEL</span><span class="ix-topics" id="ixTopic">Signal-specific engineering waveform</span></div>'+
  '<div class="ix-controls"><button type="button" id="ixRun" class="ix-run">▶ Run</button><button type="button" id="ixSingle" class="ix-single">Single</button><button type="button" id="ixStop">■ Stop</button><button type="button" id="ixAuto">Auto scale</button><button type="button" id="ixZoomIn">＋ Zoom</button><button type="button" id="ixZoomOut">－ Zoom</button>'+
  '<label>Trigger<select id="ixTrigger"><option value="0">CH1 ↑</option><option value="1">CH2 ↑</option><option value="2">CH3 ↑</option><option value="3">CH4 ↑</option></select></label>'+
  '<label>Threshold<input type="number" id="ixLevel" step=".1" value=".5"/></label>'+
  '<label>Time/div<select id="ixDiv"></select></label>'+
  '<button type="button" id="ixCenter">Center trigger</button></div>'+
  '<div class="ix-channelbar" id="ixChannels"></div>'+
  '<div class="ix-view"><div class="ix-titleline"><b>WAVEFORM · CH1–CH4 + INSTRUMENT MARKERS</b><small id="ixWindow">0–100 ns</small></div><svg id="ixPlot" class="ix-plot" viewBox="0 0 1120 552" role="img" tabindex="0" aria-label="Calibrated signal traces with cursor and event annotations"></svg><div class="ix-mobile-plots" id="ixMobile" aria-label="Individual channel waveforms on phones"></div></div>'+
  '<div class="ix-eventlist" id="ixEvents"></div>'+
  '<div class="ix-readouts"><section><h5>MEASUREMENTS — displayed model data</h5><table><thead><tr><th>Channel</th><th>Min</th><th>Max</th><th>Pk–Pk</th></tr></thead><tbody id="ixMeasures"></tbody></table></section>'+
  '<section><h5>CURSORS / EVENT MARKERS</h5><div class="ix-cursors"><label>A <span id="ixALabel">—</span><input type="range" id="ixA" min="0" max="100" step=".1" value="25"></label><label>B <span id="ixBLabel">—</span><input type="range" id="ixB" min="0" max="100" step=".1" value="60"></label></div><table><thead><tr><th>Marker</th><th>Time</th><th>Δt</th><th>1 / |Δt|</th></tr></thead><tbody id="ixMarkerRows"></tbody></table><div id="ixAtCursor"></div></section></div>'+
  '<div class="ix-lesson"><strong id="ixWhy">ANALYZE THE FIRST ABNORMAL EVENT</strong><p id="ixExplain"></p><ol><li>Identify the channel name, signal type, and its units.</li><li>Check the trigger and horizontal time scale before interpreting the event.</li><li>Select an event marker and compare channels at the same instant.</li><li>Use A/B cursors to measure time separation and voltage/current change.</li></ol></div>'+
  '<div class="ix-notice" id="ixNotice">Teaching model. This screen is not a photograph of a physical measurement.</div></section>';
}
const fmt=(v,u)=>(!Number.isFinite(v)?"—":(Math.abs(v)>=100?v.toFixed(1):v.toFixed(3)))+" "+u;
function mount(root,ctx={}){
 if(!root)return;
 const built=buildContext(ctx),def=built.profile,signals=def.signals;
 const $=s=>root.querySelector(s),T=def.T,unit=def.unit;
 const state={a:T*.22,b:T*.62,cursor:T*.3,left:0,right:T,active:[true,true,true,true],vGain:[1,1,1,1],trigger:0,level:.5,running:false,raf:0,frame:0};
 if(ctx.kind==="lab"&&Number.isInteger(ctx.step)&&def.events[ctx.step]){
   state.a=def.events[ctx.step].t;
   state.b=clamp(state.a+T/10,0,T);
 }

 root.dataset.profile=def.id;
 $("#ixTopic").textContent=def.title+" · "+built.question.slice(0,90);
 $("#ixOrigin").textContent=def.id==="spice"?"NGSPICE STORED TRACE + DERIVED CURRENT":"ILLUSTRATIVE TEACHING SIGNALS";
 $("#ixNotice").textContent=def.id==="spice"?"CH1–CH3 use stored ngspice circuit results; CH4 I_LOAD is derived from V_RX/R_L. These are simulated, not oscilloscope-measured signals.":"The trace shapes and intervals are educational illustrations only; this is not a CPU workload capture, physical instrument export, RTL simulation, or silicon validation result. No confidential measurement data is embedded.";
 $("#ixWhy").textContent=def.lesson.split(".")[0]+".";
 $("#ixExplain").textContent=def.lesson;
 $("#ixDiv").innerHTML=[T/10,T/20,T/40,T/80].map((n,i)=>'<option value="'+n+'">'+fmt(n,unit)+'/div</option>').join("");
 $("#ixDiv").value=String(T/10);
 function signalNum(t,j){return signals[j].fn(clamp(t,0,T))}
 function timeText(t){return t.toFixed(def.id==="spice"?2:1)+" "+unit}
 function mapX(t,W,left=state.left,right=state.right,sx=100,ex=W-22){return sx+(t-left)/(right-left)*(ex-sx)}
 function metrics(){
  const traces=signals.map((ch,j)=>{
   let values=[];for(let i=0;i<=400;i++){let t=state.left+(state.right-state.left)*i/400;values.push(signalNum(t,j))}
   let min=Math.min(...values),max=Math.max(...values);
   return {min,max,pp:max-min};
  });
  $("#ixMeasures").innerHTML=signals.map((ch,j)=>'<tr><td style="color:'+colors[j]+'">CH'+(j+1)+' '+esc(ch.name)+'</td><td>'+fmt(traces[j].min,ch.unit)+'</td><td>'+fmt(traces[j].max,ch.unit)+'</td><td>'+fmt(traces[j].pp,ch.unit)+'</td></tr>').join("");
  const delta=state.b-state.a,freq=Math.abs(delta)>1e-9?1/(Math.abs(delta)*({"ns":1e-9,"μs":1e-6,"ms":1e-3}[unit]||1)):0;
  $("#ixALabel").textContent=timeText(state.a);$("#ixBLabel").textContent=timeText(state.b);
  $("#ixA").value=state.a;$("#ixB").value=state.b;
  $("#ixMarkerRows").innerHTML='<tr><td>M1 / A</td><td>'+timeText(state.a)+'</td><td rowspan="2">'+timeText(delta)+'</td><td rowspan="2">'+(freq>1e6?(freq/1e6).toFixed(2)+" MHz":freq>1e3?(freq/1e3).toFixed(2)+" kHz":freq.toFixed(2)+" Hz")+'</td></tr><tr><td>M2 / B</td><td>'+timeText(state.b)+'</td></tr>';
  $("#ixAtCursor").innerHTML='<div style="font:700 10px ui-monospace,monospace;color:#b5c9e0;margin-top:8px">At A: '+signals.map((s,j)=>'<span style="color:'+colors[j]+'">CH'+(j+1)+' '+fmt(signalNum(state.a,j),s.unit)+'</span>').join(" · ")+'</div>';
 }
 function signalShape(j,t){
   const ch=signals[j],v=signalNum(t,j);
   return clamp(.5+(v-(ch.min+ch.max)/2)/((ch.max-ch.min||1)*state.vGain[j]),0,1);
 }
 function svgMain(){
  const W=1120,H=552,sx=122,ex=1072,top=43,each=113;
  let out='<rect width="'+W+'" height="'+H+'" fill="#081323"/>';
  for(let i=0;i<=10;i++){
   const t=state.left+(state.right-state.left)*i/10,x=mapX(t,W,state.left,state.right,sx,ex);
   out+='<path d="M'+x+' 39 V501" stroke="#253854" stroke-width="1"/><text x="'+x+'" y="525" text-anchor="middle" fill="#bacde4" font-size="12">'+t.toFixed(def.id==="spice"?1:0)+'</text>';
  }
  out+='<text x="1064" y="545" fill="#e6f4ff" text-anchor="end" font-size="12">TIME ('+unit+')</text>';
  signals.forEach((ch,j)=>{
   if(!state.active[j])return;
   const yTop=45+j*each,yBot=yTop+89,yFor=t=>yBot-10-signalShape(j,t)*66;
   out+='<rect x="7" y="'+(yTop-5)+'" width="1103" height="101" rx="4" fill="'+(j%2?"#111c2e":"#0a1b2b")+'" opacity=".56"/>';
   out+='<path d="M'+sx+' '+yBot+' H'+ex+'" stroke="#33465c"/>';
   for(let k=1;k<4;k++)out+='<path d="M'+sx+' '+(yTop+k*22)+' H'+ex+'" stroke="#30415a" stroke-dasharray="3 5"/>';
   out+='<rect x="6" y="'+(yTop+2)+'" width="100" height="27" rx="5" fill="'+colors[j]+'" opacity=".16" stroke="'+colors[j]+'"/>';
   out+='<text x="12" y="'+(yTop+20)+'" fill="'+colors[j]+'" font-size="13" font-weight="bold">CH'+(j+1)+' '+esc(ch.name.slice(0,11))+'</text>';
   out+='<text x="11" y="'+(yTop+49)+'" fill="#d1e3f5" font-size="11">'+esc(ch.type).toUpperCase()+' · '+esc(ch.unit)+'</text>';
   out+='<text x="11" y="'+(yTop+64)+'" fill="#9db7ce" font-size="10">'+ch.max.toFixed(1)+' / '+ch.min.toFixed(1)+'</text>';
   let path="";let n=800;
   for(let i=0;i<=n;i++){let t=state.left+(state.right-state.left)*i/n,x=mapX(t,W,state.left,state.right,sx,ex);path+=(i?"L":"M")+x.toFixed(2)+" "+yFor(t).toFixed(2)+" ";}
   out+='<path d="'+path+'" stroke="'+colors[j]+'" stroke-width="'+(ch.type==="rail"?2.5:2.1)+'" fill="none"/>';
   if(ch.type==="bus"){
    for(let i=1;i<=8;i++){const t=state.left+(state.right-state.left)*i/9,val=Math.round(signalNum(t,j));
      out+='<text x="'+mapX(t,W,state.left,state.right,sx,ex)+'" y="'+(yTop+16)+'" fill="'+colors[j]+'" font-size="11">'+(ch.unit==="hex"?"0x"+val.toString(16).toUpperCase():val)+'</text>';
    }
   }
  });
  [state.a,state.b].forEach((t,i)=>{if(t<state.left||t>state.right)return;const x=mapX(t,W,state.left,state.right,sx,ex),c=i?"#61e0bc":"#ffda81";out+='<path d="M'+x+' 34 V502" stroke="'+c+'" stroke-width="1.6" stroke-dasharray="7 5"/><rect x="'+(x-19)+'" y="6" width="38" height="23" rx="4" fill="#213a4b" stroke="'+c+'"/><text x="'+x+'" y="22" fill="'+c+'" text-anchor="middle" font-size="13">'+(i?"B":"A")+'</text>'});
  def.events.forEach((v,i)=>{if(v.t<state.left||v.t>state.right)return;const x=mapX(v.t,W,state.left,state.right,sx,ex),yy=45+v.ch*each+55;
    out+='<path d="M'+x+' '+(yy+12)+' V'+(yy+22)+'" stroke="#fff1be" stroke-width="2"/><circle cx="'+x+'" cy="'+yy+'" r="4.5" fill="#ffebaa" stroke="#172739" stroke-width="1.5"/>';
    out+='<rect x="'+clamp(x-55,sx,ex-116)+'" y="'+(yy+22)+'" width="116" height="19" rx="3" fill="#2d3850" stroke="#738398"/><text x="'+clamp(x+3,sx+58,ex-58)+'" y="'+(yy+35)+'" fill="#f6e3ad" text-anchor="middle" font-size="10">'+esc(v.label.slice(0,19))+'</text>';
  });
  $("#ixPlot").innerHTML=out;
 }
 function svgMobile(){
  const W=360,sx=80,ex=347;
  $("#ixMobile").innerHTML=signals.map((ch,j)=>{
   if(!state.active[j])return "";
   let out='<svg viewBox="0 0 360 148" role="img" aria-label="CH'+(j+1)+' '+esc(ch.name)+' in '+esc(ch.unit)+'"><rect width="360" height="148" fill="#0b182b"/>';
   out+='<text x="10" y="17" fill="'+colors[j]+'" font-size="13">CH'+(j+1)+' '+esc(ch.name)+'</text><text x="351" y="17" fill="#d8eafd" font-size="11" text-anchor="end">'+esc(ch.type)+' / '+esc(ch.unit)+'</text>';
   for(let i=0;i<=4;i++){let yy=28+i*25,vol=ch.max-(ch.max-ch.min)*i/4;
    out+='<path d="M80 '+yy+' H347" stroke="#2f405c" stroke-dasharray="4 5"/><text x="72" y="'+(yy+4)+'" fill="#b6cee2" text-anchor="end" font-size="11">'+vol.toFixed(Math.abs(ch.max)<5?2:0)+'</text>';}
   for(let i=0;i<=4;i++){let t=state.left+(state.right-state.left)*i/4,x=sx+(ex-sx)*i/4;out+='<path d="M'+x+' 26 V126" stroke="#243652"/><text x="'+x+'" y="142" text-anchor="middle" fill="#bfd4ee" font-size="10">'+t.toFixed(def.id==="spice"?1:0)+'</text>';}
   let path="";for(let i=0;i<=400;i++){let t=state.left+(state.right-state.left)*i/400,x=sx+i/400*(ex-sx),y=118-signalShape(j,t)*85;path+=(i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1)+" ";}
   out+='<path d="'+path+'" stroke="'+colors[j]+'" stroke-width="2.7" fill="none"/>';
   for(const [t,clr,l] of [[state.a,"#ffe08a","A"],[state.b,"#69e3be","B"]]){if(t<state.left||t>state.right)continue;const x=sx+(t-state.left)/(state.right-state.left)*(ex-sx);out+='<path d="M'+x+' 24 V128" stroke="'+clr+'" stroke-dasharray="5 4"/><text x="'+x+'" y="25" fill="'+clr+'" text-anchor="middle" font-size="11">'+l+'</text>'}
   out+='</svg>';return out;
  }).join("");
 }
 function draw(){
  $("#ixTimeStatus").textContent=timeText(state.left)+"–"+timeText(state.right);
  $("#ixWindow").textContent=$("#ixTimeStatus").textContent;
  $("#ixTrigStatus").textContent="TRIG: CH"+(state.trigger+1)+" ↑ @ "+state.level.toFixed(2);
  $("#ixRunStatus").textContent=state.running?"RUN":"STOP";
  $("#ixChannels").innerHTML=signals.map((ch,j)=>'<div class="ix-channelwrap"><button class="ix-channel" data-ix-ch="'+j+'" type="button" aria-pressed="'+state.active[j]+'"><strong style="color:'+colors[j]+'">CH'+(j+1)+' · '+esc(ch.name)+'</strong><small>'+esc(ch.desc)+'</small><span>'+esc(ch.type)+' · '+esc(ch.unit)+' · '+fmt((ch.max-ch.min)*state.vGain[j]/8,ch.unit)+'/div</span></button><label class="ix-vgain">VERTICAL<select data-ix-gain="'+j+'" aria-label="CH'+(j+1)+' vertical gain">'+[.5,1,2,4].map(k=>'<option value="'+k+'"'+(state.vGain[j]===k?' selected':'')+'>'+k+'× span</option>').join('')+'</select></label></div>').join("");
  $("#ixEvents").innerHTML=def.events.map((v,i)=>'<button type="button" data-ix-event="'+i+'">◉ '+esc(v.label)+' @ '+timeText(v.t)+'</button>').join("");
  svgMain();svgMobile();metrics();
 }
 function zoom(factor){
  const width=state.right-state.left,m=(state.right+state.left)/2,newW=clamp(width*factor,T/25,T);
  state.left=clamp(m-newW/2,0,T-newW);state.right=state.left+newW;draw();
 }
 function triggerTime(){const v=signals[state.trigger],level=Number($("#ixLevel").value)||.5;let previous=signalNum(0,state.trigger);for(let i=1;i<=3000;i++){const t=T*i/3000,cur=signalNum(t,state.trigger);if(previous<level&&cur>=level)return t;previous=cur}return def.events[0]?.t||T/2;}
 const stop=()=>{state.running=false;cancelAnimationFrame(state.raf);draw()};
 $("#ixRun").onclick=()=>{stop();state.running=true;const start=performance.now(),startA=state.a;function frame(now){if(!state.running)return;state.a=(startA+(now-start)/80)%T;draw();state.raf=requestAnimationFrame(frame)}state.raf=requestAnimationFrame(frame)};
 $("#ixStop").onclick=stop;
 $("#ixSingle").onclick=()=>{stop();state.a=triggerTime();state.b=clamp(state.a+T/10,0,T);draw()};
 $("#ixAuto").onclick=()=>{stop();state.left=0;state.right=T;$("#ixDiv").value=String(T/10);draw()};
 $("#ixZoomIn").onclick=()=>zoom(.5);
 $("#ixZoomOut").onclick=()=>zoom(2);
 $("#ixTrigger").onchange=e=>{state.trigger=Number(e.target.value);draw()};
 $("#ixLevel").onchange=e=>{state.level=Number(e.target.value);draw()};
 $("#ixDiv").onchange=e=>{const w=Number(e.target.value)*10,mid=(state.left+state.right)/2;state.left=clamp(mid-w/2,0,T-w);state.right=state.left+w;draw()};
 $("#ixCenter").onclick=()=>{const mid=triggerTime(),w=state.right-state.left;state.left=clamp(mid-w/2,0,T-w);state.right=state.left+w;state.a=mid;draw()};
 $("#ixA").oninput=e=>{const value=Number(e.target.value);stop();state.a=value;draw()};
 $("#ixB").oninput=e=>{const value=Number(e.target.value);stop();state.b=value;draw()};
 for(let [id,initial] of [["ixA",state.a],["ixB",state.b]]){const el=$("#"+id);el.min="0";el.max=T;el.step=def.id==="spice"?.01:.1;el.value=initial}
 $("#ixChannels").onclick=e=>{const btn=e.target.closest("[data-ix-ch]");if(!btn)return;let j=Number(btn.dataset.ixCh);state.active[j]=!state.active[j];draw()};
 $("#ixChannels").onchange=e=>{let ctl=e.target.closest("[data-ix-gain]");if(!ctl)return;state.vGain[Number(ctl.dataset.ixGain)]=Number(ctl.value);draw()};
 $("#ixEvents").onclick=e=>{const btn=e.target.closest("[data-ix-event]");if(!btn)return;const ev=def.events[Number(btn.dataset.ixEvent)];state.a=ev.t;state.b=clamp(ev.t+T/10,0,T);$("#ixExplain").textContent=ev.reason+" "+def.lesson;draw()};
 function seek(e,svg,mobile=false){
  const box=svg.getBoundingClientRect(),x=(e.clientX-box.left)/box.width*(mobile?360:1120),start=mobile?80:122,end=mobile?347:1072;
  if(x<start||x>end)return;
  stop();state.a=clamp(state.left+(x-start)/(end-start)*(state.right-state.left),0,T);draw();
 }
 $("#ixPlot").onpointerdown=e=>seek(e,$("#ixPlot"),false);
 $("#ixMobile").onpointerdown=e=>{let svg=e.target.closest("svg");if(svg)seek(e,svg,true)};
 root.addEventListener("pointerdown",()=>{}, {passive:true});
 draw();
 root.dataset.mounted="true";root.__instrument={state,def,draw,stop,setReset:t=>{
  if(def.id!=="reset")return;
  def.signals[3].fn=x=>step(x,t);
  def.events[3].t=t;
  draw();
 }};
 return root.__instrument;
}
window.renderInstrumentConsole=markup;
window.mountInstrumentConsole=mount;
window.findInstrumentProfile=select;
})();
