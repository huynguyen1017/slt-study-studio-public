"use strict";
/* Public educational notebook illustrations.
   These are schematic/vector learning diagrams, not hardware measurements.
   They do not replace the independently graded Guided Labs or Waveform Lab. */
(()=>{
const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let currentPage=0;
const lines=(s)=>String(s||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const colour={ink:"#24365c",blue:"#2155ae",red:"#bf3646",green:"#23805b",purple:"#7841b3",paper:"#fffdf6"};
function block(x,y,w,h,words,tone="blue",fs=18){
 const c=colour[tone]||tone;
 const a=String(words).split("|");
 return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12" fill="#fffdf9" stroke="'+c+'" stroke-width="2.6"/>'+
 a.map((t,i)=>'<text x="'+(x+w/2)+'" y="'+(y+h/2 +(i-(a.length-1)/2)*24+6)+'" text-anchor="middle" font-size="'+fs+'" font-weight="700" fill="'+c+'">'+E(t)+'</text>').join('');
}
function word(x,y,t,c="ink",size=16){
 return '<text x="'+x+'" y="'+y+'" font-size="'+size+'" font-weight="650" fill="'+(colour[c]||c)+'">'+E(t)+'</text>';
}
function path(d,c="blue",w=4,dash=""){
 return '<path d="'+d+'" stroke="'+(colour[c]||c)+'" stroke-width="'+w+'" fill="none" stroke-linecap="round" stroke-linejoin="round" '+(dash?'stroke-dasharray="'+dash+'"':'')+'/>';
}
function arrow(x1,y1,x2,y2,c="ink"){
 return path('M'+x1+' '+y1+' L'+x2+' '+y2,c,3)+path('M'+(x2-10)+' '+(y2-6)+' L'+x2+' '+y2+' L'+(x2-10)+' '+(y2+6),c,3);
}
function canvas(content,alt){
 return '<svg class="ink-figure" viewBox="0 0 760 300" role="img" aria-label="'+E(alt)+'" xmlns="http://www.w3.org/2000/svg">'+
 '<rect x="1" y="1" width="758" height="298" rx="15" fill="#fffef8" stroke="#e4dfd5"/>'+
 '<g opacity=".22" stroke="#adc6dc" stroke-width=".8">'+Array.from({length:30},(_,i)=>'<path d="M0 '+(10+i*10)+' H760"/>').join('')+
 Array.from({length:77},(_,i)=>'<path d="M'+(i*10)+' 0 V300"/>').join('')+'</g>'+content+'</svg>';
}
function classify(c){
 const t=(c.question+" "+c.topic).toLowerCase();
 if(/signal integrity|crosstalk|eye (diagram|height|width)|reflections|impedance|ringing|termination|overshoot|undershoot/.test(t))return "si";
 if(/setup|hold time|flip.flop|clock.*timing|clock.*frequency|frequency.*clock|clock signal|jitter|pll|clock skew/.test(t))return "clock";
 if(/boot|reset|sequenc|power.good|startup/.test(t))return "reset";
 if(/dram|ddr|memory|zq|training|refresh|tRCD|tRP|tRAS|row|bitline/i.test(t))return "dram";
 if(/pcie|pci express|phy|serdes|link training|equaliz/.test(t))return "pcie";
 if(/power|rail|voltage|current|droop|shunt|daq|oscilloscope|dmm|probe|temperature|thermal/.test(t))return "power";
 if(/shmoo|yield|pvt|margin|corner/.test(t))return "shmoo";
 if(/uart|serial|i2c|spi/.test(t))return "uart";
 if(/python|script|code|csv|logging|decorator|thread|process|exception|regex|mock|parse|program/.test(t))return "coding";
 if(/linux|shell|kernel|driver|lspci|dmesg|sudo|systemctl|sysfs/.test(t))return "linux";
 if(/socket|assembly|solder|reflow|contactor|fixture/.test(t))return "socket";
 return "generic";
}
function diagram(type,page){
 let g="",alt="",caption="";
 if(type==="si"){
   if(page===0){
     g=block(35,85,180,94,"Transmitter|electrical driver","blue")+block(285,85,190,94,"PCB trace / via|interconnect","green")+block(545,85,180,94,"Receiver|sampler","blue")+
       arrow(216,131,279,131)+arrow(479,131,539,131)+word(40,55,"SIGNAL PATH", "purple",22)+
       word(60,218,"Finite edge time","blue")+word(307,218,"Impedance Z₀","green")+word(565,218,"Sampling eye","blue")+
       path("M550 245 L650 245","red",2,"5 5")+word(290,270,"Voltage margin + timing margin are both required","red",19);
     alt="Signal integrity conceptual transmitter to PCB channel to receiver diagram";caption="Sender → channel → receiver. Distortion can reduce the receiver’s voltage and timing margin.";
   } else if(page===1){
     g=word(29,38,"CLEAN TRANSITION","green",20)+word(390,38,"DEGRADED TRANSITION","red",20)+
       path("M30 195 H70 V85 H330","blue",4)+path("M400 195 H435 C453 195 460 58 485 64 C508 65 496 113 523 105 C543 99 540 85 555 91 C581 116 584 100 615 100 H720","blue",4)+
       path("M20 195 H740","ink",1,"6 8")+path("M20 100 H740","ink",1,"6 8")+
       word(405,54,"Overshoot / ringing","red",16)+path("M494 60 L485 52","red",2)+word(35,224,"Correct sampled level","green",16)+
       word(420,224,"Wave reflections narrow the eye","red",16)+word(33,272,"Reflection Γ = (ZL − Z₀) / (ZL + Z₀)","ink",19);
     alt="Illustrative clean and ringing signal edges showing transmission-line reflection effects";caption="Illustrative trace shapes only—not measured waveforms. Impedance discontinuities can cause reflections.";
   } else{
     g=block(27,93,150,92,"Stimulus|pattern","blue")+block(240,93,160,92,"Channel|under test","green")+block(467,93,250,92,"Receiver / scope|capture & compare","blue")+
       arrow(180,139,232,139)+arrow(405,139,459,139)+word(33,46,"CONTROLLED BENCH CHECK", "purple",22)+
       word(47,234,"① Probe loading", "red",17)+word(263,234,"② Known-good comparison","green",17)+word(538,234,"③ Margin & errors","blue",17);
     alt="Conceptual signal integrity measurement and controlled-comparison flow";caption="Choose an appropriate probe and approved measurement point; reproduce before changing variables.";
   }
 } else if(type==="clock"){
   if(page===0){
      g=block(75,90,175,96,"D input|setup / hold","green")+block(319,80,150,115,"D flip-flop|CLK ↑","blue")+block(555,90,125,96,"Q output|registered","purple")+
       arrow(252,138,311,138)+arrow(471,138,546,138)+word(48,47,"EDGE-TRIGGERED STORAGE","purple",23)+word(235,250,"Sample D at ↑CLK, then hold Q until next rising edge","ink",19);
      alt="D flip flop with D, clock, and Q and setup and hold timing";caption="A flip-flop samples at its active clock edge; the output updates after its propagation delay.";
   }else if(page===1){
      g=word(35,37,"CLK", "blue",17)+word(35,139,"DATA D", "green",17)+word(35,238,"Q", "red",17)+
        path("M120 84 H195 V45 H260 V84 H335 V45 H400 V84 H475 V45 H540 V84 H650","blue",4)+
        path("M120 175 H166 V157 H300 V175 H420 V157 H650","green",4)+
        path("M120 273 H210 V255 H351 V273 H490 V255 H650","red",4)+
        path("M195 25 V289 M335 25 V289 M475 25 V289","ink",1.6,"6 6")+
        word(183,20,"↑", "red",23)+word(330,20,"↑", "red",23)+word(472,20,"↑", "red",23)+
        word(135,113,"tsetup", "purple",16)+word(254,113,"thold", "purple",16);
      alt="Illustrative clock, data and flip-flop output timing with rising edges";caption="Illustrative edge timing; actual setup/hold margins depend on the component and PVT conditions.";
   }else{
     g=block(30,83,185,105,"Clock source|frequency / jitter","blue")+block(287,83,177,105,"DUT clock pin|test point","green")+block(538,83,179,105,"Scope / counter|timing evidence","red")+
       arrow(218,138,280,138)+arrow(468,138,530,138)+word(40,49,"MEASURE / VALIDATE","purple",23)+
       word(60,239,"Measure T","blue",18)+word(305,239,"Calculate f = 1/T","green",18)+word(557,239,"Compare spec","red",18);
     alt="Clock measurement workflow from source to a suitable frequency measurement instrument";caption="Check timebase, probe loading, threshold, and bandwidth before drawing conclusions from timing.";
   }
 }else if(type==="reset"){
   const times=[12,28,48,68];const names=["CORE PG","I/O PG","PLL LOCK","RESET_N"];
   if(page===0){g=block(25,89,148,93,"Core rail|valid","blue")+block(208,89,148,93,"I/O rail|valid","green")+block(394,89,145,93,"Clock|qualified","purple")+block(577,89,159,93,"Reset|release","red")+
      arrow(174,133,203,133)+arrow(360,133,385,133)+arrow(542,133,568,133)+word(30,45,"DEPENDENCY CHAIN — NOT A HARDWARE CAPTURE","purple",20)+word(113,234,"All required prerequisites precede release", "ink",21);}
   else if(page===1){g=names.map((n,i)=>word(18,53+i*58,n,"ink",17)+path("M155 "+(85+i*58)+" H"+(155+times[i]*7)+" V"+(53+i*58)+" H735",["blue","green","purple","red"][i],3)).join("")+
      word(20,26,"CONCEPTUAL 4-CHANNEL STARTUP","purple",21)+path("M630 25 V275","red",2,"6 5")+word(527,292,"Reset latest","red",16);}
   else{g=block(26,85,218,105,"CH1 / CH2|rail readiness","blue")+block(271,85,211,105,"CH3|clock status","green")+block(510,85,223,105,"CH4|reset state","red")+
      arrow(245,135,263,135)+arrow(486,135,504,135)+word(30,45,"SIMULTANEOUS TIMING CAPTURE","purple",21)+word(72,242,"Use a shared timebase to compare event order","ink",18);}
   alt="Conceptual startup sequencing of power good signals PLL lock and active-low reset";caption="Digital timing illustration. Times and qualified conditions must come from the target platform.";
 }else if(type==="dram"){
    if(page===0){g=block(35,88,197,101,"Memory controller|commands","blue")+block(288,88,198,101,"DRAM bank|activate row","green")+block(548,88,168,101,"Data bus|read/write","purple")+
    arrow(237,140,279,140)+arrow(493,140,541,140)+word(38,46,"BANK COMMAND SEQUENCE","purple",22)+word(74,245,"ACT → READ/WRITE → PRE","ink",22);}
    else if(page===1){g=word(27,40,"ACT", "blue",20)+word(278,40,"READ / WRITE","green",20)+word(576,40,"PRECHARGE","red",20)+
    path("M65 93 H193","blue",5)+arrow(194,93,268,93)+path("M349 93 H489","green",5)+arrow(490,93,566,93)+
    path("M632 93 H730","red",5)+path("M75 155 H350","purple",2)+path("M75 150 V160 M350 150 V160","purple",3)+word(155,181,"tRCD (min)","purple",21)+
    path("M75 220 H630","red",2)+path("M75 215 V225 M630 215 V225","red",3)+word(260,250,"tRAS and tRP constraints","red",20);}
    else{g=block(27,92,191,98,"Run test|capture fail","blue")+block(282,92,199,98,"Check training|and timings","green")+block(547,92,187,98,"Change one|variable","red")+
    arrow(220,138,275,138)+arrow(483,138,540,138)+word(32,44,"DRAM VALIDATION IS EXPERIMENTAL","purple",21)+word(44,243,"Re-test original failing condition after each correction","ink",18);}
    alt="Illustrative DRAM ACT READ and PRECHARGE command timing or debug flow";caption="Diagram is a conceptual timing model; exact DRAM constraints are standard- and device-specific.";
 }else if(type==="pcie"){
    const parts=page===1?["Detect","Polling","Config","L0 / Recovery"]:page===2?["Read LnkCap","Inspect LnkSta","Compare AER","Controlled A/B"]:["Root complex","PCIe channel","Endpoint","Negotiated link"];
    g=parts.map((s,i)=>block(18+i*188,87,160,95,s,""+(["blue","green","purple","red"][i]),18)+(i<3?arrow(179+i*188,135,198+i*188,135):"")).join("")+
    word(35,45,page===1?"SIMPLIFIED LINK TRAINING STATES":page===2?"ISOLATION EXPERIMENTS":"PCIe LINK LAYERS", "purple",21)+word(40,244,"Capability ≠ negotiated state; hold variables fixed in comparisons","ink",17);
    alt="Simplified PCIe link training and debugging diagram";caption="State sequence is simplified for teaching; read actual LTSSM details from the applicable specification.";
 }else if(type==="power"){
    if(page===0){g=block(25,91,177,96,"Regulator|power supply","blue")+block(279,91,181,96,"Power rail|PDN","green")+block(548,91,184,96,"SoC / load|changing current","red")+
    arrow(206,138,271,138)+arrow(464,138,540,138)+word(32,43,"POWER DELIVERY PATH","purple",22)+word(70,244,"Changes in load current can cause voltage droop","red",18);}
    else if(page===1){g=word(28,39,"VRAIL — conceptual transient", "purple",22)+path("M27 112 H248 Q264 112 278 150 Q297 220 322 160 Q343 130 373 127 H720","blue",5)+
    path("M24 110 H733","ink",1,"6 7")+word(276,238,"Undershoot / recovery", "red",20)+
    word(53,277,"P = V × I      •      V_L = L · dI/dt","green",23);}
    else{g=block(28,85,190,104,"Select probe|& coupling","blue")+block(288,85,183,104,"Measure at|approved point","green")+block(535,85,198,104,"Correlate with|load & clock","red")+
    arrow(223,138,280,138)+arrow(475,138,527,138)+word(28,44,"LIVE BENCH SAFETY","purple",22)+word(55,243,"Respect ground, common-mode and voltage ratings","ink",18);}
    alt="Conceptual power rail and dynamic load with voltage droop waveform";caption="Power-rail curves are illustrations, not captured oscilloscope samples.";
 }else if(type==="shmoo"){
    g=word(39,42,"PASS / FAIL SHMOO — EXAMPLE ONLY","purple",21);
    for(let r=0;r<4;r++)for(let c=0;c<10;c++){
      const v=(r+c<7)?"#c6ead8":(r+c===7?"#ffe9bc":"#f2bdc1");
      g+='<rect x="'+(135+c*54)+'" y="'+(71+r*47)+'" width="48" height="40" rx="6" fill="'+v+'" stroke="#ffffff"/>';
      g+=word(148+c*54,98+r*47,r+c<7?"P":r+c===7?"?":"F","ink",15);
    }
    g+=word(13,174,"VOLTAGE","ink",14)+word(326,285,"FREQUENCY →","ink",18);
    alt="Illustrative voltage-frequency shmoo pass fail and unknown cells";caption="Example result grid only. Untested points are not passes; determine the margin boundary experimentally.";
 }else if(type==="coding"){
    g=block(30,86,174,111,"Input data|serial / file","blue")+block(276,86,183,111,"Python parser|validation","green")+block(535,86,194,111,"Results|PASS / FAIL","red")+
      arrow(208,138,268,138)+arrow(463,138,527,138)+word(29,45,"REPRODUCIBLE TEST AUTOMATION","purple",22)+word(42,246,"Handle timeouts, malformed data & incomplete runs explicitly","ink",18);
    alt="Coding and test automation input parsing and result validation flow";caption="Validate normal, failing and incomplete cases separately; never silently classify errors as PASS.";
 }else if(type==="linux"){
    g=block(20,87,175,104,"Hardware|DUT","blue")+block(276,87,195,104,"Linux|kernel & driver","green")+block(550,87,178,104,"Logs|dmesg / sysfs","purple")+
      arrow(199,138,267,138)+arrow(476,138,540,138)+word(33,43,"HOST / TARGET DEBUG PATH","purple",22)+word(38,243,"Enumerated on host ≠ target successfully booted","red",19);
    alt="Illustrative hardware validation path from DUT through Linux kernel to diagnostic logs";caption="Collect timestamps and topology; distinguish host visibility from target functional readiness.";
 }else if(type==="socket"){
    g=block(27,87,198,105,"Mechanical|alignment","blue")+block(283,87,188,105,"Electrical|contacts","green")+block(544,87,179,105,"Continuity|validation","purple")+
      arrow(228,138,275,138)+arrow(475,138,536,138)+word(36,45,"SOCKET ASSEMBLY CHECKS","purple",22)+word(42,244,"Inspect fit, contact resistance and safe mechanical limits","ink",18);
    alt="Illustrative socket alignment contacts and electrical validation workflow";caption="Follow approved mechanical torque, handling, and test requirements for the particular fixture.";
 }else if(type==="uart"){
    g=block(24,86,190,103,"Host|UART bridge","blue")+block(288,86,191,103,"TX / RX|serial lines","green")+block(556,86,178,103,"SoC|console","purple")+
      arrow(216,134,279,134)+arrow(484,134,548,134)+word(36,47,"SERIAL OBSERVABILITY","purple",23)+word(34,244,"Adapter enumeration ≠ valid target boot log","red",19);
    alt="UART bridge TX RX target console observation diagram";caption="Verify voltage levels, pinout, baud rate, ground reference and competing serial readers.";
 }else{
    g=block(30,88,170,102,"Initial state|conditions","blue")+block(294,88,160,102,"Test stimulus|control","green")+block(536,88,186,102,"Observed|response","purple")+
      arrow(204,139,286,139)+arrow(458,139,528,139)+word(35,46,"ENGINEERING EVIDENCE FLOW","purple",22)+word(53,243,"Hold variables fixed; compare expected and actual","ink",19);
    alt="Generic hardware validation conditions stimulus observed response block diagram";caption="General conceptual workflow; adapt each measurement to the system specification.";
 }
 return {html:canvas(g,alt),alt,caption};
}
function getSections(answer){
 const raw=String(answer||"");
 const a=raw.indexOf("WHAT I WOULD SAY"),b=raw.indexOf("DEEP TECHNICAL EXPLANATION"),c=raw.indexOf("BABY-STEP DEBUG");
 function between(from,to){
  if(from<0)return "";
  const x=raw.slice(from,to<0?raw.length:to);
  const ix=x.indexOf("\n");return ix<0?"":x.slice(ix+1).trim();
 }
 return {core:between(a,b),deep:between(b,c),steps:between(c,-1),raw};
}
function paragraphs(v){return lines(v).map(x=>'<p class="ink-paragraph">'+E(x)+'</p>').join("")}
function stepList(v){
 const raw=lines(v);
 const steps=raw.map(l=>l.replace(/^\s*(?:\d+[\.\)]\s*|[-•]\s*)/,"")).filter(Boolean);
 return steps.map((l,i)=>'<li><span class="ink-stepnum">Step '+(i+1)+'</span><div>'+E(l)+'</div></li>').join("");
}
function insight(type,page){
 const notes={
 si:["The transmitter launches an edge; the channel reshapes it; the receiver samples what arrives.","A reflection occurs when the impedance changes. The receiver needs both horizontal (time) and vertical (voltage) margin.","Keep the measurement setup unchanged between good and bad captures. Probe loading can create false ringing."],
 clock:["Clock edges define when values are captured; latch behavior is different from edge-triggered storage.","T = 1/f. The sampling aperture includes setup and hold intervals around the active edge.","Measure the correct clock pin and understand whether you are observing a divided or buffered clock."],
 reset:["Power, clock qualification and reset must be evaluated as a timed dependency—not isolated DC snapshots.","Find the last valid prerequisite, then apply the platform-specified minimum qualification delay.","Use a common timebase to capture rails and reset; analog rails require proper analog probes."],
 dram:["Commands address banks/rows. A memory failure can reflect timing, training, voltage or the test setup.","tRCD relates ACT to READ/WRITE; tRP relates precharge to next ACT. Exact limits are device-specific.","Log firmware, data pattern, PVT and raw results before changing one variable."],
 pcie:["A physical connection does not guarantee a trained data link.","The LTSSM transitions through detection, negotiation and recovery states; negotiated speed can differ from capability.","Compare endpoints and fixtures without simultaneously changing firmware, hardware and voltage."],
 power:["Rapid load changes cause rail transients through PDN impedance and inductance.","Current from a sense resistor is I = Vsense/Rsense; power is P = VI using aligned samples.","A ground-referenced scope probe cannot be safely clipped across arbitrary high-side nodes."],
 shmoo:["A shmoo is an experimental result map, not a theoretical guarantee.","Pass, fail and untested must be distinguishable to avoid inventing margin.","Sweep within approved operating limits and record exact conditions at every result cell."],
 coding:["Treat every test invocation as a state machine with explicit inputs and outputs.","A process exit code can differ from the tool's internal test result; validate both.","Test parser behavior on pass, fail, empty, malformed and timeout fixtures."],
 linux:["Keep the host/bridge distinct from the target under test.","Kernel logs, device enumeration and application readiness are different observables.","Reproduce on a known-good setup, then change a single condition."],
 socket:["Mechanical alignment and electrical contact must both succeed.","A seated part can still have high contact resistance or a bent contact.","Use approved inspection and continuity procedures without forcing connectors."],
 uart:["Bridge visibility is not proof of target firmware execution.","UART needs correct voltage, polarity, baud settings and signal connection.","Preserve the earliest serial output and check for other processes owning the port."],
 generic:["Start with expected behavior and initial conditions.","Use evidence to isolate one hypothesis at a time.","Retest the original failure after a controlled correction."]
 };
 return notes[type][page];
}
function titleFor(p){return ["01 · Core idea & system view","02 · Technical mechanism & waveforms","03 · Baby-step debug & evidence"][p]}
function equations(type){
 const groups={
  si:[["Reflections","Γ = (ZL − Z₀) / (ZL + Z₀)"],["Edge bandwidth","f_knee ≈ 0.5 / t_rise"],["Inductive droop","V_L = L · dI/dt"]],
  clock:[["Period and frequency","f = 1 / T"],["Sampling","D must be stable through setup / hold"]],
  power:[["Ohm’s law","I = V_sense / R_sense"],["Instantaneous power","P(t) = V(t) × I(t)"],["Inductive droop","V_L = L · dI/dt"]],
  dram:[["Example timing relationship","tRC ≥ tRAS + tRP"],["Row activation","ACT → tRCD → READ"]],
  shmoo:[["Observations","P = pass, F = fail, ? = untested"]]
 };
 const arr=groups[type]||[];
 if(!arr.length)return "";
 return '<div class="ink-equations" aria-label="Reference equations and engineering relations">'+arr.map(([k,v])=>'<div class="ink-equation"><small>'+E(k)+'</small><strong>'+E(v)+'</strong></div>').join("")+'</div>';
}
function renderPage(c,page){
 const s=getSections(c.answer);const type=classify(c),v=diagram(type,page),p=page;
 const graphic='<div class="ink-diagram-scroll" tabindex="0" aria-label="Scrollable engineering diagram">'+v.html+'</div>';
 const intro='<div class="ink-page-heading"><span class="ink-chapter">ENGINEERING STUDY NOTES</span><span class="ink-pagecount">PAGE '+(p+1)+' / 3</span></div>'+
 '<h3 class="ink-title">'+E(titleFor(p))+'</h3><div class="ink-question"><b>Q:</b> '+E(c.question)+'</div>';
 let content="";
 if(p===0)content='<div class="ink-section"><h4>① What I would say · short answer</h4>'+paragraphs(s.core)+'</div>'+
 '<div class="ink-section"><h4>② See the signal path</h4>'+graphic+'<p class="ink-caption">'+E(v.caption)+'</p></div>'+
 '<div class="ink-highlighter"><b>Remember:</b> '+E(insight(type,p))+'</div>';
 if(p===1)content='<div class="ink-section"><h4>① Technical diagram · illustrated concept</h4>'+graphic+'<p class="ink-caption">'+E(v.caption)+'</p></div>'+
 equations(type)+'<div class="ink-section"><h4>② Deep technical explanation</h4>'+paragraphs(s.deep||s.core)+'</div>'+
 '<div class="ink-highlighter"><b>Connect the equation / mechanism:</b> '+E(insight(type,p))+'</div>';
 if(p===2)content='<div class="ink-section"><h4>① Follow the evidence · step by step</h4><ol class="ink-steps">'+stepList(s.steps||s.core)+'</ol></div>'+
 '<div class="ink-section"><h4>② What the bench / debug workflow looks like</h4>'+graphic+'<p class="ink-caption">'+E(v.caption)+'</p></div>'+
 '<div class="ink-highlighter"><b>Before claiming PASS:</b> '+E(insight(type,p))+'</div>'+
 '<div class="ink-question ink-selfcheck"><b>Teach it back:</b> What would you measure first, what would the result prove, and what would remain unverified?</div>'+
 '<div class="ink-lab-links"><button type="button" data-note-mode="labs" class="primary">Practice a graded lab →</button>'+
 ((type==="clock"||type==="reset"||type==="power"||type==="si")?'<button type="button" data-note-mode="waves" class="outline">Try interactive waveforms ∿</button>':'')+'</div>';
 return '<article class="ink-sheet" aria-label="Illustrated study note page '+(p+1)+' of 3">'+intro+content+
 '<div class="ink-bottom"><span>BLUE = SIGNAL &nbsp;·&nbsp; GREEN = VALID &nbsp;·&nbsp; RED = CHECK</span><span>✧ Hand-drawn style · conceptual diagrams</span></div></article>';
}
window.renderStudyNotebook=(c)=>{
 currentPage=0;
 return '<section class="notebook-view" aria-label="Three-page illustrated engineering notebook">'+
 '<div class="notebook-top"><span class="notebook-kicker">✎ NOTEBOOK ANSWER · 3 VISUAL PAGES</span><span class="notebook-topic">'+E(c.topic)+'</span></div>'+
 '<div class="notebook-tabs" role="tablist" aria-label="Illustrated answer pages">'+[0,1,2].map(i=>
 '<button type="button" class="notebook-tab'+(i===0?' active':'')+'" data-note-page="'+i+'" role="tab" aria-selected="'+(i===0?'true':'false')+'">'+E(["1 · Overview","2 · Deep dive","3 · Lab steps"][i])+'</button>').join('')+'</div>'+
 '<div id="notebookPage" class="notebook-paper">'+renderPage(c,0)+'</div>'+
 '<div class="notebook-controls"><button type="button" id="notePrev" class="outline" disabled>← Previous page</button>'+
 '<span id="noteCount">Page 1 of 3</span><button type="button" id="noteNext" class="primary">Next page →</button></div>'+
 '<details class="notebook-original"><summary>Read the complete source-derived text answer</summary><div class="notebook-transcript">'+E(c.answer)+'</div></details>'+
 '<p class="notebook-disclaimer">Illustrated educational models, not live hardware captures. Your graded Guided Labs and interactive Waveform Lab remain separate study modes.</p></section>';
};
window.wireStudyNotebook=(c)=>{
 const root=document.querySelector(".notebook-view");if(!root)return;
 const render=(p)=>{
 currentPage=Math.max(0,Math.min(2,p));const sc=root.querySelector("#notebookPage");sc.innerHTML=renderPage(c,currentPage);
 root.querySelectorAll("[data-note-page]").forEach(el=>{let active=Number(el.dataset.notePage)===currentPage;el.classList.toggle("active",active);el.setAttribute("aria-selected",String(active))});
 root.querySelectorAll("[data-note-mode]").forEach(btn=>btn.onclick=e=>{e.stopPropagation();document.querySelector('[data-mode="'+btn.dataset.noteMode+'"]')?.click()});
 root.querySelector("#notePrev").disabled=currentPage===0;root.querySelector("#noteNext").disabled=currentPage===2;
 root.querySelector("#noteCount").textContent="Page "+(currentPage+1)+" of 3";
 };
 root.querySelectorAll("[data-note-page]").forEach(el=>el.onclick=e=>{e.stopPropagation();render(Number(el.dataset.notePage))});
 root.querySelector("#notePrev").onclick=e=>{e.stopPropagation();render(currentPage-1)};
 root.querySelector("#noteNext").onclick=e=>{e.stopPropagation();render(currentPage+1)};
 // Swipe horizontally between pages only on the notebook itself; preserve vertical scroll.
 let origin=null;root.querySelector("#notebookPage").addEventListener("touchstart",e=>{const t=e.touches[0];origin={x:t.clientX,y:t.clientY}},{passive:true});
 root.querySelector("#notebookPage").addEventListener("touchend",e=>{if(!origin)return;let t=e.changedTouches[0],dx=t.clientX-origin.x,dy=t.clientY-origin.y;origin=null;if(Math.abs(dx)>85&&Math.abs(dx)>Math.abs(dy)*1.65)render(currentPage+(dx<0?1:-1))},{passive:true});
};
})();
